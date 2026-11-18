-- ==============================================================================
-- MIGRAÇÃO CONSOLIDADA: SINCRONIZAÇÃO 100% NUVEM DO ALUNO (FLASHCARDS, GRIFOS & LISTAS)
-- Plataforma Banco Residência Médica — Supabase PostgreSQL
-- URL direta SQL Editor: https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. TABELA: public.user_flashcard_daily_logs (Heatmap Anual de Revisões FSRS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_flashcard_daily_logs (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total INTEGER NOT NULL DEFAULT 0,
  feitos INTEGER NOT NULL DEFAULT 0,
  revisao INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, date)
);

ALTER TABLE public.user_flashcard_daily_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário gerencia seus próprios logs diários de flashcards" ON public.user_flashcard_daily_logs;
CREATE POLICY "Usuário gerencia seus próprios logs diários de flashcards"
  ON public.user_flashcard_daily_logs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_flashcard_daily_logs_user_date
  ON public.user_flashcard_daily_logs(user_id, date DESC);

-- ------------------------------------------------------------------------------
-- 2. TABELA: public.user_flashcard_reviews (Histórico Atômico de Revisões FSRS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('again', 'hard', 'good', 'easy')),
  state_before TEXT DEFAULT 'new',
  state_after TEXT DEFAULT 'learning',
  interval_days NUMERIC(8,2) DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_flashcard_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário gerencia seus próprios eventos de revisão" ON public.user_flashcard_reviews;
CREATE POLICY "Usuário gerencia seus próprios eventos de revisão"
  ON public.user_flashcard_reviews
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_flashcard_reviews_user_card
  ON public.user_flashcard_reviews(user_id, card_id, reviewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_flashcard_reviews_user_date
  ON public.user_flashcard_reviews(user_id, reviewed_at DESC);

-- ------------------------------------------------------------------------------
-- 3. TABELA: public.user_study_highlights (Grifos e Notas nos Resumos Clínicos)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_study_highlights (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id TEXT NOT NULL,
  text_quote TEXT NOT NULL,
  prefix TEXT,
  suffix TEXT,
  color TEXT NOT NULL DEFAULT 'yellow',
  style TEXT NOT NULL DEFAULT 'highlight',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_study_highlights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário gerencia seus próprios grifos de estudo" ON public.user_study_highlights;
CREATE POLICY "Usuário gerencia seus próprios grifos de estudo"
  ON public.user_study_highlights
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_study_highlights_user_material
  ON public.user_study_highlights(user_id, material_id);

-- ------------------------------------------------------------------------------
-- 4. EXPANSÃO DE METADADOS MULTI-DISPOSITIVO EM TABELAS EXISTENTES
-- ------------------------------------------------------------------------------
ALTER TABLE public.user_flashcard_decks
  ADD COLUMN IF NOT EXISTS deck_type TEXT NOT NULL DEFAULT 'custom',
  ADD COLUMN IF NOT EXISTS config JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.user_created_flashcards
  ADD COLUMN IF NOT EXISTS deck_id TEXT NOT NULL DEFAULT 'deck-padrao',
  ADD COLUMN IF NOT EXISTS subfocus TEXT,
  ADD COLUMN IF NOT EXISTS sub_subfocus TEXT,
  ADD COLUMN IF NOT EXISTS source_question_id TEXT;

ALTER TABLE public.user_lists
  ADD COLUMN IF NOT EXISTS filters JSONB DEFAULT '{}'::jsonb;

-- ------------------------------------------------------------------------------
-- 5. CONCESSÃO DE PERMISSÕES
-- ------------------------------------------------------------------------------
GRANT ALL ON public.user_flashcard_daily_logs TO authenticated, service_role;
GRANT ALL ON public.user_flashcard_reviews TO authenticated, service_role;
GRANT ALL ON public.user_study_highlights TO authenticated, service_role;

COMMIT;

NOTIFY pgrst, 'reload schema';
