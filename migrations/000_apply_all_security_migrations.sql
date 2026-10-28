-- ==============================================================================
-- BANCO RESIDÊNCIA — SCRIPT CONSOLIDADO DE SEGURANÇA E AUDITORIA (FASES 1, 2, 3 E 4)
-- Execute este script no SQL Editor do Supabase:
-- URL direta: https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. PROTEÇÃO DE COLUNAS CRÍTICAS DA TABELA 'questions' (ANTI-SCRAPING)
-- ==============================================================================
-- O cliente público (anon) não pode projetar 'correct_answer' e 'commentary'
-- diretamente via PostgREST. As respostas são entregues exclusivamente sob demanda
-- via /api/questions/solve com controle de taxa (Rate Limit).

-- Revoga qualquer permissão ampla prévia na tabela questions para anon
REVOKE ALL ON public.questions FROM anon;

-- Concede SELECT apenas nas colunas seguras (sem correct_answer e sem commentary)
-- Obs: A tabela questions possui: id, code, institution, banca, year, tipo_prova,
-- modalidade, especialidade, tema, foco, subfoco, difficulty, type, is_anulada,
-- statement, options, images, created_at.
GRANT SELECT (
  id,
  code,
  institution,
  banca,
  year,
  tipo_prova,
  modalidade,
  especialidade,
  tema,
  foco,
  subfoco,
  difficulty,
  type,
  is_anulada,
  statement,
  options,
  images,
  created_at
) ON public.questions TO anon;

-- Garante RLS na tabela questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura de questões públicas" ON public.questions;
CREATE POLICY "Permitir leitura de questões públicas"
ON public.questions
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Bloquear mutações de questões por usuários comuns" ON public.questions;
CREATE POLICY "Bloquear mutações de questões por usuários comuns"
ON public.questions
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- RPC de alta performance para contagens sem expor correct_answer no PostgREST
CREATE OR REPLACE FUNCTION public.get_questions_stats()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM public.questions),
    'with_answer', (SELECT count(*) FROM public.questions WHERE correct_answer IS NOT NULL OR is_anulada = true)
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_questions_stats() TO anon, authenticated;


-- ==============================================================================
-- 2. PROTEÇÃO DO BUCKET 'medical-knowledge' (SUPABASE STORAGE)
-- ==============================================================================
UPDATE storage.buckets
SET public = false
WHERE id = 'medical-knowledge';

DROP POLICY IF EXISTS "Acesso público ao acervo médico" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública medical-knowledge" ON storage.objects;
DROP POLICY IF EXISTS "Public Access medical-knowledge" ON storage.objects;
DROP POLICY IF EXISTS "Acesso restrito ao bucket medical-knowledge" ON storage.objects;

CREATE POLICY "Acesso restrito ao bucket medical-knowledge"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-knowledge' 
  AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'curador', 'curator', 'superadmin')
);


-- ==============================================================================
-- 3. TABELA E POLÍTICAS RLS PARA 'user_answers'
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL,
  selected_option VARCHAR(10) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER DEFAULT 0,
  answered_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Aluno consulta apenas suas respostas" ON public.user_answers;
CREATE POLICY "Aluno consulta apenas suas respostas"
ON public.user_answers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Aluno grava apenas suas respostas" ON public.user_answers;
CREATE POLICY "Aluno grava apenas suas respostas"
ON public.user_answers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Aluno atualiza apenas suas respostas" ON public.user_answers;
CREATE POLICY "Aluno atualiza apenas suas respostas"
ON public.user_answers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON public.user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON public.user_answers(question_id);


-- ==============================================================================
-- 4. TABELA DE AUDITORIA IMUTÁVEL (audit_logs)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_role TEXT NOT NULL DEFAULT 'admin',
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  reason TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Proibir edições em logs de auditoria" ON public.audit_logs;
CREATE POLICY "Proibir edições em logs de auditoria"
ON public.audit_logs
FOR UPDATE
TO public
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "Proibir exclusões em logs de auditoria" ON public.audit_logs;
CREATE POLICY "Proibir exclusões em logs de auditoria"
ON public.audit_logs
FOR DELETE
TO public
USING (false);


-- ==============================================================================
-- 5. TRIGGER DE AUDITORIA AUTOMÁTICA EM 'questions' (DEFENSE-IN-DEPTH)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.fn_audit_question_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_action TEXT;
BEGIN
  v_user_id := auth.uid();
  v_user_email := auth.jwt() ->> 'email';

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

DROP TRIGGER IF EXISTS trg_audit_question_update ON public.questions;
CREATE TRIGGER trg_audit_question_update
AFTER UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.fn_audit_question_changes();

COMMIT;
