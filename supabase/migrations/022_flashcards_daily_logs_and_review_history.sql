-- ==============================================================================
-- MIGRAÇÃO 022: HISTÓRICO DE REVISÕES E LOGS DIÁRIOS DE FLASHCARDS (HEATMAP & FSRS)
-- Banco Residência Médica — Supabase PostgreSQL
-- URL direta: https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. TABELA DE RESUMO DIÁRIO DE FLASHCARDS (Alimentação do Anki Review Heatmap)
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
-- 2. TABELA DE LOG ATÔMICO DE REVISÕES (Auditoria Psicométrica e Curva FSRS)
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
-- 3. PERMISSÕES DE ACESSO (Roles autenticado e service_role)
-- ------------------------------------------------------------------------------
GRANT ALL ON public.user_flashcard_daily_logs TO authenticated, service_role;
GRANT ALL ON public.user_flashcard_reviews TO authenticated, service_role;

COMMIT;

-- Força recarga imediata do catálogo OpenAPI do PostgREST
NOTIFY pgrst, 'reload schema';

