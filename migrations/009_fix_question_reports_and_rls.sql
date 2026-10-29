-- ==============================================================================
-- BANCO RESIDÊNCIA — MIGRATION 009: CORREÇÃO COMPLETA DE QUESTION_REPORTS & RLS
-- Permite que alunos reportem erros com sucesso e que todos os administradores
-- gerenciem, visualizem e retifiquem gabaritos diretamente no Supabase.
--
-- Execute este script no SQL Editor do Supabase:
-- URL direta: https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new
-- ==============================================================================

BEGIN;

-- 1. Garante existência da tabela question_reports
CREATE TABLE IF NOT EXISTS public.question_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL DEFAULT 'Erro no gabarito ou enunciado',
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Adiciona colunas para metadados e anotações do administrador
ALTER TABLE public.question_reports ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.question_reports ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE public.question_reports ADD COLUMN IF NOT EXISTS user_email TEXT;

-- 3. Concessão de privilégios de tabela para as roles do Supabase
GRANT ALL ON public.question_reports TO anon, authenticated, service_role;

-- 4. Habilita e configura Row Level Security (RLS)
ALTER TABLE public.question_reports ENABLE ROW LEVEL SECURITY;

-- 4.1 Permitir que qualquer estudante (anônimo ou logado) registre uma denúncia
DROP POLICY IF EXISTS "Qualquer usuário pode registrar denúncia" ON public.question_reports;
DROP POLICY IF EXISTS "Permitir inserção pública de reports" ON public.question_reports;
DROP POLICY IF EXISTS "Estudantes podem reportar questoes" ON public.question_reports;

CREATE POLICY "Permitir inserção pública de reports"
  ON public.question_reports
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 4.2 Permitir que todos os administradores e curadores visualizem todos os reports de todos os alunos
DROP POLICY IF EXISTS "Admins e curadores podem ler denúncias" ON public.question_reports;
DROP POLICY IF EXISTS "Admins podem visualizar denúncias" ON public.question_reports;

CREATE POLICY "Admins e curadores podem ler denúncias"
  ON public.question_reports
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

-- 4.3 Permitir que administradores e curadores atualizem o status e notas de qualquer denúncia
DROP POLICY IF EXISTS "Admins e curadores podem atualizar denúncias" ON public.question_reports;
DROP POLICY IF EXISTS "Admins podem atualizar denúncias" ON public.question_reports;

CREATE POLICY "Admins e curadores podem atualizar denúncias"
  ON public.question_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'curador', 'curator', 'superadmin')
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'curador', 'curator', 'superadmin')
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'curador', 'curator', 'superadmin')
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'curador', 'curator', 'superadmin')
  );

-- 4.4 Permitir que administradores e curadores excluam denúncias descartadas se necessário
DROP POLICY IF EXISTS "Admins podem excluir denúncias" ON public.question_reports;

CREATE POLICY "Admins podem excluir denúncias"
  ON public.question_reports
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'curador', 'curator', 'superadmin')
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'curador', 'curator', 'superadmin')
  );

-- 5. Índices de alta performance para o painel de moderação de gabaritos
CREATE INDEX IF NOT EXISTS idx_question_reports_status ON public.question_reports(status);
CREATE INDEX IF NOT EXISTS idx_question_reports_question_id ON public.question_reports(question_id);
CREATE INDEX IF NOT EXISTS idx_question_reports_created_at ON public.question_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_reports_status_created_at ON public.question_reports(status, created_at DESC);

COMMIT;

