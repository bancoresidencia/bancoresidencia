-- ==============================================================================
-- MIGRAÇÃO 018: HARDENING FINAL DE RLS E REVOGAÇÃO DE TABELA EM QUESTIONS
-- Plataforma Banco Residência Médica — Supabase PostgreSQL
-- URL direta: https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. REVOGAÇÃO DE PRIVILÉGIOS DE TABELA PARA A ROLE 'authenticated'
-- Previne que qualquer usuário logado com conta comum consiga projetar
-- diretamente 'correct_answer' e 'commentary' via PostgREST direto (REST API).
-- ------------------------------------------------------------------------------
REVOKE ALL ON public.questions FROM authenticated;

-- Garante SELECT estritamente apenas nas 18 colunas públicas seguras
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
  created_at,
  has_gabarito
) ON public.questions TO authenticated;

-- Garante que a role 'anon' permaneça com as mesmas 18 colunas seguras
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
  created_at,
  has_gabarito
) ON public.questions TO anon;

-- ------------------------------------------------------------------------------
-- 2. POLÍTICA RLS PARA A TABELA 'questions'
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 3. TRAVA ATÔMICA DE BANCO CONTRA RACE CONDITIONS EM SAQUES PIX
-- Garante que nenhuma solicitação duplicada seja aceita concorrentemente
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_ambassador_withdrawals_recent_pending
ON public.ambassador_withdrawals(user_id, status, requested_at);

COMMIT;
