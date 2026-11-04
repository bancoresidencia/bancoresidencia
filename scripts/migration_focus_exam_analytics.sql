-- =============================================================================
-- MIGRATION: focus_exam_analytics & focus_exam_analytics_history
-- Tabela canônica de inteligência estatística para o Censo de 130k+ Questões (Fase 1)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.focus_exam_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    focus_slug TEXT UNIQUE NOT NULL,             -- Ex: "hemorragia-pos-parto"
    specialty TEXT NOT NULL,                     -- Ex: "Ginecologia e Obstetrícia"
    theme TEXT NOT NULL,                         -- Ex: "Emergências Obstétricas"
    focus TEXT NOT NULL,                         -- Ex: "Hemorragia Pós-Parto (HPP)"
    total_questions INTEGER NOT NULL,            -- Total físico auditado
    timeframe_range TEXT NOT NULL,               -- Ex: "2017-2026"
    version INTEGER DEFAULT 1,                   -- Versão incremental (v1, v2...)
    donut_slices JSONB NOT NULL,                 -- Fatias normalizadas (soma garantida 100,0%)
    banca_breakdown JSONB NOT NULL,              -- Estatísticas detalhadas por banca examinadora
    top_traps JSONB NOT NULL,                    -- Distratores e pegadinhas homologadas
    audit_trail JSONB NOT NULL,                  -- Mapa de IDs reais das questões por subfoco
    audit_hash TEXT NOT NULL,                    -- Assinatura criptográfica SHA-256
    needs_recalc BOOLEAN DEFAULT FALSE,          -- Flag de invalidação por inserção de novas questões
    last_recalculated_at TIMESTAMPTZ DEFAULT NOW(),
    certified_at TIMESTAMPTZ,
    status TEXT CHECK (status IN ('draft', 'certified', 'deprecated')) DEFAULT 'draft'
);

-- Tabela histórica para auditoria e controle de mudanças temporais
CREATE TABLE IF NOT EXISTS public.focus_exam_analytics_history (
    history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analytics_id UUID REFERENCES public.focus_exam_analytics(id) ON DELETE CASCADE,
    focus_slug TEXT NOT NULL,
    version INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    donut_slices JSONB NOT NULL,
    audit_hash TEXT NOT NULL,
    archived_at TIMESTAMPTZ DEFAULT NOW(),
    reason_for_update TEXT
);

CREATE INDEX IF NOT EXISTS idx_focus_analytics_slug ON public.focus_exam_analytics(focus_slug);
CREATE INDEX IF NOT EXISTS idx_focus_analytics_needs_recalc ON public.focus_exam_analytics(needs_recalc) WHERE needs_recalc = TRUE;
CREATE INDEX IF NOT EXISTS idx_focus_analytics_history_slug ON public.focus_exam_analytics_history(focus_slug, version DESC);

-- Trigger para marcar automaticamente needs_recalc = TRUE quando novas questões entrarem
CREATE OR REPLACE FUNCTION trg_mark_focus_analytics_dirty()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.focus_exam_analytics
    SET needs_recalc = TRUE
    WHERE focus ILIKE '%' || NEW.foco || '%'
       OR theme ILIKE '%' || NEW.tema || '%';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_questions_after_insert_update ON public.questions;

CREATE TRIGGER trg_questions_after_insert_update
AFTER INSERT OR UPDATE OF foco, tema, subfoco, banca, gabarito
ON public.questions
FOR EACH ROW
EXECUTE FUNCTION trg_mark_focus_analytics_dirty();

