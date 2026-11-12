-- ==============================================================================
-- MIGRAÇÃO 028: COMENTÁRIOS E DISCUSSÕES DE ALUNOS POR QUESTÃO
-- Banco Residência Médica
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.question_comments (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL DEFAULT 'Aluno(a)',
  user_avatar TEXT,
  content TEXT NOT NULL CHECK (char_length(trim(content)) > 0 AND char_length(content) <= 2000),
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices de alta performance para busca e ordenação cronológica por questão
CREATE INDEX IF NOT EXISTS idx_question_comments_qid ON public.question_comments(question_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_comments_uid ON public.question_comments(user_id);

-- Habilitar RLS rigoroso
ALTER TABLE public.question_comments ENABLE ROW LEVEL SECURITY;

-- 1. Qualquer usuário autenticado ou visitante pode ler comentários
DROP POLICY IF EXISTS "Qualquer usuário pode ler comentários" ON public.question_comments;
CREATE POLICY "Qualquer usuário pode ler comentários"
  ON public.question_comments
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- 2. Alunos autenticados podem inserir comentários vinculados ao seu próprio id
DROP POLICY IF EXISTS "Alunos autenticados podem publicar comentários" ON public.question_comments;
CREATE POLICY "Alunos autenticados podem publicar comentários"
  ON public.question_comments
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- 3. Apenas o autor ou admin pode excluir o próprio comentário
DROP POLICY IF EXISTS "Autor ou admin pode excluir o comentário" ON public.question_comments;
CREATE POLICY "Autor ou admin pode excluir o comentário"
  ON public.question_comments
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'curator', 'curador', 'superadmin')
    )
  );

