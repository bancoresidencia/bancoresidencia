-- ==============================================================================
-- MIGRAÇÃO 024: TABELA DE CONFIGURAÇÕES DA PLATAFORMA (CONTROLE DE ABAS E STATUS)
-- Plataforma Banco Residência Médica — Supabase PostgreSQL
-- URL direta: https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new
-- ==============================================================================

-- 1. Criação da tabela de configurações gerais
CREATE TABLE IF NOT EXISTS public.platform_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Habilitação de Row Level Security (RLS)
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- 3. Leitura pública (DROP preventivo para evitar erro 42710)
DROP POLICY IF EXISTS "platform_settings_read_all" ON public.platform_settings;
CREATE POLICY "platform_settings_read_all"
    ON public.platform_settings
    FOR SELECT
    TO public
    USING (true);

-- 4. Escrita restrita exclusivamente a administradores e curadores
DROP POLICY IF EXISTS "platform_settings_admin_all" ON public.platform_settings;
CREATE POLICY "platform_settings_admin_all"
    ON public.platform_settings
    FOR ALL
    TO authenticated
    USING (public.is_admin() OR auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (public.is_admin() OR auth.jwt() ->> 'role' = 'service_role');

-- 5. Publicação para Supabase Realtime
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_settings;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN OTHERS THEN NULL;
END $$;
