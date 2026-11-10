-- ==============================================================================
-- MIGRAÇÃO 024: VINCULAÇÃO E PERSISTÊNCIA DA AGENDA E SESSÕES DE ESTUDO AO ALUNO
-- Plataforma Banco Residência Médica — Supabase PostgreSQL
-- Tabelas Criadas:
--   1. public.user_study_sessions (Sessões do Relógio e Novo Bloco)
--   2. public.user_scheduled_tasks (Tarefas do Calendário, Plantões e Estudos)
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. TABELA: user_study_sessions (Sessões Cronometradas e Manuais do Aluno)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_study_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  taxonomy JSONB NOT NULL DEFAULT '{}'::jsonb,
  study_type TEXT NOT NULL DEFAULT 'questoes',
  questions_count INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  incorrect_count INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC(5,2),
  session_source TEXT NOT NULL DEFAULT 'manual',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_study_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário gerencia suas próprias sessões de estudo" ON public.user_study_sessions;
CREATE POLICY "Usuário gerencia suas próprias sessões de estudo"
  ON public.user_study_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_study_sessions_user_time 
  ON public.user_study_sessions(user_id, start_time DESC);

-- ------------------------------------------------------------------------------
-- 2. TABELA: user_scheduled_tasks (Tarefas Agendadas, Plantões e Obrigações)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_scheduled_tasks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'estudo',
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  start_minutes INTEGER NOT NULL,
  end_minutes INTEGER NOT NULL,
  source TEXT NOT NULL DEFAULT 'plataforma',
  description TEXT,
  is_calendar_task BOOLEAN NOT NULL DEFAULT true,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_scheduled_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário gerencia suas próprias tarefas da agenda" ON public.user_scheduled_tasks;
CREATE POLICY "Usuário gerencia suas próprias tarefas da agenda"
  ON public.user_scheduled_tasks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_scheduled_tasks_user_date 
  ON public.user_scheduled_tasks(user_id, date);

-- ------------------------------------------------------------------------------
-- 3. EXPANSÃO DE public.profiles (ESTADO DE INTEGRAÇÃO DO GOOGLE AGENDA)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS google_calendar_connected BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS google_calendar_last_sync TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS google_calendar_email TEXT;

-- ------------------------------------------------------------------------------
-- 4. CONCESSÃO DE PERMISSÕES
-- ------------------------------------------------------------------------------
GRANT ALL ON public.user_study_sessions TO authenticated, service_role;
GRANT ALL ON public.user_scheduled_tasks TO authenticated, service_role;

COMMIT;

NOTIFY pgrst, 'reload schema';

