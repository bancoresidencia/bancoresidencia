-- ==============================================================================
-- MIGRAÇÃO 015: INTEGRAÇÃO ARQUITETURAL COMPLETA DO ALUNO (FASE 1)
-- Banco Residência Médica — Supabase PostgreSQL
-- URL direta: https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. EXPANSÃO DA TABELA 'public.user_answers' (METADADOS CLÍNICOS & RASTREABILIDADE)
-- ------------------------------------------------------------------------------
ALTER TABLE public.user_answers
  ADD COLUMN IF NOT EXISTS specialty TEXT,
  ADD COLUMN IF NOT EXISTS tema TEXT,
  ADD COLUMN IF NOT EXISTS foco TEXT,
  ADD COLUMN IF NOT EXISTS subfoco TEXT,
  ADD COLUMN IF NOT EXISTS difficulty TEXT,
  ADD COLUMN IF NOT EXISTS banca TEXT,
  ADD COLUMN IF NOT EXISTS year INTEGER,
  ADD COLUMN IF NOT EXISTS error_reason TEXT,
  ADD COLUMN IF NOT EXISTS student_notes TEXT,
  ADD COLUMN IF NOT EXISTS status_retrial TEXT DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS attempts JSONB DEFAULT '[]'::jsonb;

-- Índices otimizados para dashboards clínicos, TRI e percentil
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON public.user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON public.user_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_specialty ON public.user_answers(user_id, specialty);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_tema ON public.user_answers(user_id, tema);
CREATE INDEX IF NOT EXISTS idx_user_answers_answered_at ON public.user_answers(user_id, answered_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_answers_is_correct ON public.user_answers(user_id, is_correct);

-- ------------------------------------------------------------------------------
-- 2. TABELA DE PASTAS DE ESTUDOS DO USUÁRIO (public.user_folders)
-- ------------------------------------------------------------------------------
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

DROP POLICY IF EXISTS "Usuário gerencia apenas suas próprias pastas" ON public.user_folders;
CREATE POLICY "Usuário gerencia apenas suas próprias pastas"
  ON public.user_folders
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_folders_user_id ON public.user_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_user_folders_parent_id ON public.user_folders(parent_id);

-- ------------------------------------------------------------------------------
-- 3. TABELA DE LISTAS DE QUESTÕES DO USUÁRIO (public.user_lists)
-- ------------------------------------------------------------------------------
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

DROP POLICY IF EXISTS "Usuário gerencia apenas suas próprias listas" ON public.user_lists;
CREATE POLICY "Usuário gerencia apenas suas próprias listas"
  ON public.user_lists
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_lists_user_id ON public.user_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lists_folder_id ON public.user_lists(folder_id);

-- ------------------------------------------------------------------------------
-- 4. TABELA DE MATERIAIS DE ESTUDO CANÔNICOS (public.study_materials)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_materials (
  id TEXT PRIMARY KEY,
  focus_id TEXT,
  title TEXT NOT NULL,
  specialty TEXT NOT NULL,
  theme TEXT NOT NULL,
  focus TEXT NOT NULL,
  read_time_minutes INTEGER DEFAULT 8,
  last_updated_year INTEGER DEFAULT 2026,
  guideline_badge TEXT DEFAULT 'Consenso Oficial & Evidência Padrão-Ouro',
  summary_snippet TEXT,
  markdown_content TEXT NOT NULL,
  key_points JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura de materiais de estudo publicados" ON public.study_materials;
CREATE POLICY "Leitura de materiais de estudo publicados"
  ON public.study_materials
  FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Gerenciamento de materiais de estudo por admins" ON public.study_materials;
CREATE POLICY "Gerenciamento de materiais de estudo por admins"
  ON public.study_materials
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'curador', 'curator')
    )
  );

CREATE INDEX IF NOT EXISTS idx_study_materials_specialty ON public.study_materials(specialty);
CREATE INDEX IF NOT EXISTS idx_study_materials_focus ON public.study_materials(focus);
CREATE INDEX IF NOT EXISTS idx_study_materials_status ON public.study_materials(status);

-- ------------------------------------------------------------------------------
-- 5. TABELA DE PROGRESSO DE LEITURA DO ALUNO (public.user_study_progress)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_study_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id TEXT NOT NULL,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  read_time_minutes INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  notes TEXT,
  PRIMARY KEY (user_id, material_id)
);

ALTER TABLE public.user_study_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário gerencia seu próprio progresso de leitura" ON public.user_study_progress;
CREATE POLICY "Usuário gerencia seu próprio progresso de leitura"
  ON public.user_study_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_study_progress_user ON public.user_study_progress(user_id, last_read_at DESC);

-- ------------------------------------------------------------------------------
-- 6. TABELAS DE FLASHCARDS FSRS & BARALHOS (public.user_flashcard_progress, decks, user cards)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_flashcard_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'new' CHECK (state IN ('new', 'learning', 'review', 'relearning')),
  repetitions INTEGER DEFAULT 0,
  interval_days INTEGER DEFAULT 0,
  ease_factor NUMERIC(5,2) DEFAULT 2.50,
  stability NUMERIC(8,4) DEFAULT 1.0000,
  difficulty NUMERIC(8,4) DEFAULT 5.0000,
  retrievability NUMERIC(8,4) DEFAULT 1.0000,
  next_review_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  lapses INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, card_id)
);

ALTER TABLE public.user_flashcard_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário gerencia seu próprio progresso de flashcards" ON public.user_flashcard_progress;
CREATE POLICY "Usuário gerencia seu próprio progresso de flashcards"
  ON public.user_flashcard_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_due ON public.user_flashcard_progress(user_id, next_review_date);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_state ON public.user_flashcard_progress(user_id, state);

CREATE TABLE IF NOT EXISTS public.user_flashcard_decks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  card_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_flashcard_decks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário gerencia seus próprios baralhos" ON public.user_flashcard_decks;
CREATE POLICY "Usuário gerencia seus próprios baralhos"
  ON public.user_flashcard_decks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user ON public.user_flashcard_decks(user_id);

CREATE TABLE IF NOT EXISTS public.user_created_flashcards (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  specialty TEXT,
  theme TEXT,
  focus TEXT,
  comment TEXT,
  priority TEXT DEFAULT 'standard',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_created_flashcards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário gerencia seus próprios flashcards criados" ON public.user_created_flashcards;
CREATE POLICY "Usuário gerencia seus próprios flashcards criados"
  ON public.user_created_flashcards
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_created_flashcards_user ON public.user_created_flashcards(user_id);

-- ------------------------------------------------------------------------------
-- 7. EXPANSÃO DE 'public.profiles' (PREFERÊNCIAS VISUAIS & PROVA ALVO)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS target_exam_name TEXT,
  ADD COLUMN IF NOT EXISTS target_exam_date DATE,
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"theme_mode":"dark","accent_color":"blue","font_size":"sm"}'::jsonb;

-- Conceder permissões para authenticated e service_role nas novas tabelas
GRANT ALL ON public.user_answers TO authenticated, service_role;
GRANT ALL ON public.user_folders TO authenticated, service_role;
GRANT ALL ON public.user_lists TO authenticated, service_role;
GRANT ALL ON public.study_materials TO authenticated, service_role;
GRANT ALL ON public.user_study_progress TO authenticated, service_role;
GRANT ALL ON public.user_flashcard_progress TO authenticated, service_role;
GRANT ALL ON public.user_flashcard_decks TO authenticated, service_role;
GRANT ALL ON public.user_created_flashcards TO authenticated, service_role;
GRANT ALL ON public.user_bookmarks TO authenticated, service_role;

COMMIT;

-- Força recarga imediata do catálogo OpenAPI do PostgREST
NOTIFY pgrst, 'reload schema';

