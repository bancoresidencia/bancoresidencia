-- =========================================================================
-- Migration 014: Tabela oficial de Materiais de Estudo e Resumos Clínicos Canônicos
-- Módulo: med-study-design-system v2.8.0 (Banco Residência)
-- =========================================================================

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

-- Índices de performance para filtragem instantânea no leitor
CREATE INDEX IF NOT EXISTS idx_study_materials_specialty ON public.study_materials(specialty);
CREATE INDEX IF NOT EXISTS idx_study_materials_focus ON public.study_materials(focus);
CREATE INDEX IF NOT EXISTS idx_study_materials_status ON public.study_materials(status);

-- RLS (Row Level Security)
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- Política de leitura: qualquer usuário autenticado ou visitante pode ler materiais publicados
CREATE POLICY "Leitura de materiais de estudo publicados"
    ON public.study_materials
    FOR SELECT
    USING (status = 'published');

-- Política de mutação: restrita a administradores / service role
CREATE POLICY "Gerenciamento de materiais de estudo por admins"
    ON public.study_materials
    FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'service_role' OR
        auth.jwt() ->> 'email' LIKE '%@bancoresidencia.com.br' OR
        auth.jwt() ->> 'email' LIKE '%admin%'
    );
