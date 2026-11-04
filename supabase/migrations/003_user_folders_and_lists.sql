-- ============================================================
-- Migration 003: User Folders and User Question Lists
-- Banco Residência Médica
-- ============================================================

-- 1. Tabela de Pastas de Estudos do Usuário (Hierarquia de até 3 níveis)
CREATE TABLE IF NOT EXISTS public.user_folders (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES public.user_folders(id) ON DELETE CASCADE,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário gerencia apenas suas próprias pastas"
  ON public.user_folders
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_folders_user_id ON public.user_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_user_folders_parent_id ON public.user_folders(parent_id);

-- 2. Tabela de Listas de Questões do Usuário (Antigos cadernos)
CREATE TABLE IF NOT EXISTS public.user_lists (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id TEXT REFERENCES public.user_folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  question_ids TEXT[] NOT NULL DEFAULT '{}',
  total_questions INTEGER NOT NULL DEFAULT 0,
  completed_questions INTEGER NOT NULL DEFAULT 0,
  last_studied_at TEXT,
  in_progress BOOLEAN NOT NULL DEFAULT false,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário gerencia apenas suas próprias listas"
  ON public.user_lists
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_lists_user_id ON public.user_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lists_folder_id ON public.user_lists(folder_id);
