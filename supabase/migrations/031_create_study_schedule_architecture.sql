-- ==============================================================================
-- MIGRAÇÃO 031: ARQUITETURA DO CRONOGRAMA DE ESTUDOS DO ALUNO (POR FOCO)
-- Módulo: Cronograma de Estudos Integrado — Banco Residência Médica
-- Tabelas Criadas:
--   1. public.user_study_schedules (Metas do Cronograma, Prova-Alvo e Parâmetros)
--   2. public.user_schedule_items (Eventos Distribuídos no Calendário por Foco)
--   3. public.user_focus_progress (Progresso dos Focos, Revisões e Estatísticas)
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. TABELA: user_study_schedules (Metas do Cronograma do Aluno)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_study_schedules (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Meu Cronograma de Estudos',
  target_exam TEXT,
  target_exam_date DATE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weekly_study_days JSONB NOT NULL DEFAULT '[1,2,3,4,5]'::jsonb,
  daily_focus_target INTEGER NOT NULL DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  auto_revision_intervals JSONB NOT NULL DEFAULT '[1,7,30]'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_study_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário gerencia seus próprios cronogramas" ON public.user_study_schedules;
CREATE POLICY "Usuário gerencia seus próprios cronogramas"
  ON public.user_study_schedules
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_study_schedules_user_active
  ON public.user_study_schedules(user_id, is_active);

-- ------------------------------------------------------------------------------
-- 2. TABELA: user_schedule_items (Itens e Focos Agendados no Calendário)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_schedule_items (
  id TEXT PRIMARY KEY,
  schedule_id TEXT NOT NULL REFERENCES public.user_study_schedules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  especialidade TEXT NOT NULL,
  tema TEXT NOT NULL,
  foco TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'theory' CHECK (item_type IN ('theory', 'review_1', 'review_2', 'review_3', 'questions', 'custom')),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  order_index INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_schedule_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário gerencia seus próprios itens do cronograma" ON public.user_schedule_items;
CREATE POLICY "Usuário gerencia seus próprios itens do cronograma"
  ON public.user_schedule_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_schedule_items_user_date
  ON public.user_schedule_items(user_id, scheduled_date);

CREATE INDEX IF NOT EXISTS idx_user_schedule_items_schedule_date
  ON public.user_schedule_items(schedule_id, scheduled_date);

CREATE INDEX IF NOT EXISTS idx_user_schedule_items_user_foco
  ON public.user_schedule_items(user_id, foco);

-- ------------------------------------------------------------------------------
-- 3. TABELA: user_focus_progress (Progresso Histórico dos Focos Estudados)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_focus_progress (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  focus_key TEXT NOT NULL,
  especialidade TEXT NOT NULL,
  tema TEXT NOT NULL,
  foco TEXT NOT NULL,
  is_studied BOOLEAN NOT NULL DEFAULT false,
  first_studied_at TIMESTAMPTZ,
  review_count INTEGER NOT NULL DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  next_review_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_user_focus_key UNIQUE (user_id, focus_key)
);

ALTER TABLE public.user_focus_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário gerencia seu próprio progresso de focos" ON public.user_focus_progress;
CREATE POLICY "Usuário gerencia seu próprio progresso de focos"
  ON public.user_focus_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_focus_progress_user_studied
  ON public.user_focus_progress(user_id, is_studied);

CREATE INDEX IF NOT EXISTS idx_user_focus_progress_user_next_rev
  ON public.user_focus_progress(user_id, next_review_date);

-- ------------------------------------------------------------------------------
-- 4. CONCESSÃO DE PERMISSÕES
-- ------------------------------------------------------------------------------
GRANT ALL ON public.user_study_schedules TO authenticated, service_role;
GRANT ALL ON public.user_schedule_items TO authenticated, service_role;
GRANT ALL ON public.user_focus_progress TO authenticated, service_role;

COMMIT;

NOTIFY pgrst, 'reload schema';
