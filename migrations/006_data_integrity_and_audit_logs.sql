-- ==============================================================================
-- BANCO RESIDÊNCIA — MIGRAÇÃO 006: AUDITORIA, INTEGRIDADE E SINCRONIZAÇÃO DE DADOS
-- Data: Outubro/2026
-- Objetivo:
--   1. Criar tabela de logs de auditoria imutável (append-only) para todas as ações críticas.
--   2. Rastrear histórico de alterações de gabaritos, anulações e resoluções de denúncias.
--   3. Bloquear qualquer exclusão ou modificação retroativa de registros de auditoria (Anti-Tamper).
--   4. Implementar trigger PostgreSQL de auditoria automática na tabela 'questions'.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CRIAÇÃO DA TABELA 'audit_logs'
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_role TEXT NOT NULL DEFAULT 'admin',
  action TEXT NOT NULL, -- UPDATE_GABARITO, ANULATE_QUESTION, RESOLVE_REPORT, GENERATE_COMMENTARY, etc.
  entity_type TEXT NOT NULL, -- question, question_report, exam, user, system
  entity_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  reason TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. ÍNDICES DE ALTA PERFORMANCE PARA AUDITORIA
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- ------------------------------------------------------------------------------
-- 3. POLÍTICAS RLS E IMUTABILIDADE (APPEND-ONLY ENFORCEMENT)
-- ------------------------------------------------------------------------------
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Consulta permitida apenas para administradores e curadores homologados
DROP POLICY IF EXISTS "Admins podem visualizar logs de auditoria" ON public.audit_logs;
CREATE POLICY "Admins podem visualizar logs de auditoria"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'curador', 'curator', 'superadmin')
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'curador', 'curator', 'superadmin')
);

-- Inserção permitida para administradores e para service_role (via API)
DROP POLICY IF EXISTS "Admins e backend podem registrar auditoria" ON public.audit_logs;
CREATE POLICY "Admins e backend podem registrar auditoria"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'curador', 'curator', 'superadmin')
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'curador', 'curator', 'superadmin')
);

-- BLOQUEIO ABSOLUTO DE MUTAÇÃO: Nenhum usuário ou admin pode alterar registros passados
DROP POLICY IF EXISTS "Proibir edições em logs de auditoria" ON public.audit_logs;
CREATE POLICY "Proibir edições em logs de auditoria"
ON public.audit_logs
FOR UPDATE
TO public
USING (false)
WITH CHECK (false);

-- BLOQUEIO ABSOLUTO DE EXCLUSÃO: Nenhum usuário ou admin pode apagar registros passados
DROP POLICY IF EXISTS "Proibir exclusões em logs de auditoria" ON public.audit_logs;
CREATE POLICY "Proibir exclusões em logs de auditoria"
ON public.audit_logs
FOR DELETE
TO public
USING (false);


-- ------------------------------------------------------------------------------
-- 4. TRIGGER POSTGRESQL DE AUDITORIA AUTOMÁTICA EM 'questions'
-- ------------------------------------------------------------------------------
-- Garante rastreabilidade mesmo se um update for executado diretamente no SQL do Supabase.
CREATE OR REPLACE FUNCTION public.fn_audit_question_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_action TEXT;
BEGIN
  -- Identifica usuário autenticado pela sessão JWT do Supabase se disponível
  v_user_id := auth.uid();
  v_user_email := auth.jwt() ->> 'email';

  -- Apenas registra se houver alteração real em gabarito, anulação ou comentário
  IF (OLD.correct_answer IS DISTINCT FROM NEW.correct_answer) OR
     (OLD.is_anulada IS DISTINCT FROM NEW.is_anulada) OR
     (OLD.commentary IS DISTINCT FROM NEW.commentary) THEN

    IF (NEW.is_anulada IS TRUE AND OLD.is_anulada IS NOT TRUE) THEN
      v_action := 'TRIGGER_ANULATE_QUESTION';
    ELSIF (OLD.correct_answer IS DISTINCT FROM NEW.correct_answer) THEN
      v_action := 'TRIGGER_UPDATE_GABARITO';
    ELSE
      v_action := 'TRIGGER_UPDATE_COMMENTARY';
    END IF;

    INSERT INTO public.audit_logs (
      user_id,
      user_email,
      user_role,
      action,
      entity_type,
      entity_id,
      old_values,
      new_values,
      reason,
      created_at
    ) VALUES (
      v_user_id,
      v_user_email,
      'db_trigger',
      v_action,
      'question',
      NEW.id::text,
      jsonb_build_object(
        'correct_answer', OLD.correct_answer,
        'is_anulada', OLD.is_anulada,
        'commentary_len', length(coalesce(OLD.commentary, ''))
      ),
      jsonb_build_object(
        'correct_answer', NEW.correct_answer,
        'is_anulada', NEW.is_anulada,
        'commentary_len', length(coalesce(NEW.commentary, ''))
      ),
      'Disparado automaticamente por Trigger PostgreSQL na tabela questions',
      now()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ativação do trigger na tabela questions
DROP TRIGGER IF EXISTS trg_audit_question_update ON public.questions;
CREATE TRIGGER trg_audit_question_update
AFTER UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.fn_audit_question_changes();
