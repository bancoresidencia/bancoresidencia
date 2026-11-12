-- ==============================================================================
-- MIGRAÇÃO 027: INTEGRAÇÃO SEGURA COM GOOGLE CALENDAR (BACKEND COM REFRESH TOKEN)
-- Banco Residência Médica
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_calendar_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'google',
  account_email TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scope TEXT,
  sync_mode TEXT NOT NULL DEFAULT 'api' CHECK (sync_mode IN ('api', 'ical')),
  ical_url TEXT,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_calendar_provider UNIQUE (user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_calendar_integrations_user_id ON public.user_calendar_integrations(user_id);

-- Habilitar RLS rigoroso
ALTER TABLE public.user_calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
DROP POLICY IF EXISTS "Usuário gerencia sua própria integração de calendário" ON public.user_calendar_integrations;
CREATE POLICY "Usuário gerencia sua própria integração de calendário"
  ON public.user_calendar_integrations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
