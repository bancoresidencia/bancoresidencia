-- ==============================================================================
-- MIGRAÇÃO: INTEGRIDADE FSRS/ANKI E CARTÕES AUTORAIS DO ESTUDANTE (FASE 1)
-- Plataforma Banco Residência Médica — Supabase PostgreSQL
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. PRESERVAÇÃO DE INTERVALOS SUB-DIÁRIOS & PASSOS DE APRENDIZAGEM (FSRS/ANKI)
-- ------------------------------------------------------------------------------
-- Converte interval_days de INTEGER para DOUBLE PRECISION para impedir truncamento
-- de passos intradia (ex.: 1m, 5m, 10m) para 0 na sincronização em nuvem.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_flashcard_progress'
      AND column_name = 'interval_days'
      AND data_type IN ('integer', 'smallint', 'bigint')
  ) THEN
    ALTER TABLE public.user_flashcard_progress
      ALTER COLUMN interval_days TYPE DOUBLE PRECISION
      USING interval_days::double precision;
  END IF;
END $$;

ALTER TABLE public.user_flashcard_progress
  ADD COLUMN IF NOT EXISTS step_index INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS scheduled_days DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_rating TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_flashcard_progress_last_rating_check'
  ) THEN
    ALTER TABLE public.user_flashcard_progress
      ADD CONSTRAINT user_flashcard_progress_last_rating_check
      CHECK (last_rating IS NULL OR last_rating IN ('again', 'hard', 'good', 'easy'));
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. METADADOS COMPLETOS DOS CARTÕES AUTORAIS (user_created_flashcards)
-- ------------------------------------------------------------------------------
ALTER TABLE public.user_created_flashcards
  ADD COLUMN IF NOT EXISTS study_depth TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}'::text[];

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_created_flashcards_study_depth_check'
  ) THEN
    ALTER TABLE public.user_created_flashcards
      ADD CONSTRAINT user_created_flashcards_study_depth_check
      CHECK (study_depth IS NULL OR study_depth IN ('study', 'review', 'both'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_created_flashcards_user_deck
  ON public.user_created_flashcards(user_id, deck_id);

COMMIT;

NOTIFY pgrst, 'reload schema';
