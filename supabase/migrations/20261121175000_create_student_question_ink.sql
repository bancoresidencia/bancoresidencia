-- Migração: Criação da tabela student_question_ink para sincronização em nuvem de anotações e rascunhos da caneta
-- Permite recuperação de traços entre múltiplos dispositivos (tablet, PC, celular) e histórico por tentativa

CREATE TABLE IF NOT EXISTS public.student_question_ink (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id text NOT NULL,
  attempt_number int NOT NULL DEFAULT 1,
  strokes jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, document_id, attempt_number)
);

-- Índices de alta performance
CREATE INDEX IF NOT EXISTS idx_student_question_ink_lookup 
  ON public.student_question_ink (user_id, document_id, attempt_number);

CREATE INDEX IF NOT EXISTS idx_student_question_ink_user_updated
  ON public.student_question_ink (user_id, updated_at DESC);

-- Habilitação obrigatória de RLS
ALTER TABLE public.student_question_ink ENABLE ROW LEVEL SECURITY;

-- Políticas de isolamento estrito por aluno (BOLA/IDOR Defense)
DROP POLICY IF EXISTS "student_ink_select_own" ON public.student_question_ink;
CREATE POLICY "student_ink_select_own" ON public.student_question_ink
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "student_ink_insert_own" ON public.student_question_ink;
CREATE POLICY "student_ink_insert_own" ON public.student_question_ink
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "student_ink_update_own" ON public.student_question_ink;
CREATE POLICY "student_ink_update_own" ON public.student_question_ink
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "student_ink_delete_own" ON public.student_question_ink;
CREATE POLICY "student_ink_delete_own" ON public.student_question_ink
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Permissões
REVOKE ALL ON public.student_question_ink FROM anon, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_question_ink TO authenticated;
GRANT ALL ON public.student_question_ink TO service_role;
