-- ==============================================================================
-- MIGRAÇÃO 017: HARDENING DE SEGURANÇA, ISOLAMENTO RLS E PROTEÇÃO DE PROCEDURES
-- Plataforma Banco Residência Médica — Supabase PostgreSQL
-- URL direta: https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. HARDENING DE BUSCA (SET search_path) NA FUNÇÃO is_admin()
-- Previne ataques de busca não confiável (Untrusted Search Path / CWE-426)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'curador', 'curator', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- 2. PROTEÇÃO RLS DAS TABELAS FINANCEIRAS DO PROGRAMA DE EMBAIXADORES
-- Bloqueia inserções arbitrárias via PostgREST direto de usuários logados.
-- Todas as solicitações de saque e reembolso devem passar pela API do backend.
-- ------------------------------------------------------------------------------

-- 2.1. ambassador_withdrawals
DROP POLICY IF EXISTS "Usuário insere solicitação de saque" ON public.ambassador_withdrawals;
-- Sem política de INSERT para role 'authenticated':
-- Apenas service_role (backend da API Next.js) tem permissão de escrita direta.

-- 2.2. ambassador_refund_requests
DROP POLICY IF EXISTS "Usuário insere solicitação de reembolso de plano" ON public.ambassador_refund_requests;
-- Sem política de INSERT para role 'authenticated':
-- Apenas service_role (backend da API Next.js) tem permissão de escrita direta.

-- ------------------------------------------------------------------------------
-- 3. BLINDAGEM DA RPC get_unseen_question_ids (CONTRA IDOR EM HISTÓRICO DE ESTUDO)
-- Garante que um estudante só consulte suas próprias questões pendentes.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_unseen_question_ids(
  p_user_id UUID,
  p_especialidade TEXT DEFAULT NULL,
  p_banca TEXT DEFAULT NULL,
  p_year INT DEFAULT NULL,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  question_id UUID,
  total_unseen BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total BIGINT;
BEGIN
  -- Blindagem IDOR: Apenas o próprio usuário ou administradores podem consultar
  IF p_user_id != auth.uid() AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado: histórico restrito exclusivamente ao titular da conta.';
  END IF;

  -- Contagem total de não vistas respeitando filtros
  SELECT COUNT(*)
  INTO v_total
  FROM questions q
  WHERE NOT EXISTS (
    SELECT 1 FROM user_answers ua
    WHERE ua.question_id = q.id
      AND ua.user_id = p_user_id
  )
  AND (p_especialidade IS NULL OR q.especialidade = p_especialidade)
  AND (p_banca IS NULL OR q.banca = p_banca)
  AND (p_year IS NULL OR q.year = p_year);

  RETURN QUERY
  SELECT q.id AS question_id, v_total AS total_unseen
  FROM questions q
  WHERE NOT EXISTS (
    SELECT 1 FROM user_answers ua
    WHERE ua.question_id = q.id
      AND ua.user_id = p_user_id
  )
  AND (p_especialidade IS NULL OR q.especialidade = p_especialidade)
  AND (p_banca IS NULL OR q.banca = p_banca)
  AND (p_year IS NULL OR q.year = p_year)
  ORDER BY q.year DESC, q.id ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- ------------------------------------------------------------------------------
-- 4. HARDENING DA POLÍTICA DE INSERÇÃO NA TABELA public.profiles
-- Impede criação de perfis arbitrários com role 'admin' diretamente pelo cliente.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Criação de perfil via service role ou trigger" ON public.profiles;
CREATE POLICY "Criação de perfil via service role ou trigger"
  ON public.profiles FOR INSERT
  WITH CHECK (
    -- Permite inserção se for o próprio usuário autenticado com role de estudante
    (auth.uid() = id AND role = 'student')
    -- Ou se for disparado por trigger/service_role
    OR auth.role() = 'service_role'
    OR auth.uid() IS NULL
  );

COMMIT;
