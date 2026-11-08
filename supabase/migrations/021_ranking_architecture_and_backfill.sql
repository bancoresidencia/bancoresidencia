-- ==============================================================================
-- MIGRAÇÃO 021: ARQUITETURA DE RANKING, TABELA DE CACHE E RPCs SEGURAS (TRI 2PL)
-- Banco Residência Médica — Supabase PostgreSQL
-- URL direta: https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. TABELA DE CACHE / CONSOLIDAÇÃO DO RANKING (public.user_rankings_cache)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_rankings_cache (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  college TEXT,
  specialty_target TEXT,
  modalidade TEXT NOT NULL DEFAULT 'Residência Médica',
  banca_foco TEXT DEFAULT 'Todas',
  
  -- Métricas de Desempenho Bruto
  total_answered INTEGER NOT NULL DEFAULT 0,
  total_correct INTEGER NOT NULL DEFAULT 0,
  accuracy_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  
  -- Metadados IRT / TRI
  valid_irt_questions INTEGER NOT NULL DEFAULT 0,
  easy_correct INTEGER NOT NULL DEFAULT 0,
  easy_total INTEGER NOT NULL DEFAULT 0,
  medium_correct INTEGER NOT NULL DEFAULT 0,
  medium_total INTEGER NOT NULL DEFAULT 0,
  hard_correct INTEGER NOT NULL DEFAULT 0,
  hard_total INTEGER NOT NULL DEFAULT 0,
  
  -- Estatística Psicométrica
  theta NUMERIC(6,4) NOT NULL DEFAULT 0.0000,
  standard_error NUMERIC(6,4) NOT NULL DEFAULT 1.0000,
  reliability NUMERIC(6,4) NOT NULL DEFAULT 0.0000,
  adjusted_score NUMERIC(6,4) NOT NULL DEFAULT 0.0000,
  percentile NUMERIC(4,1) NOT NULL DEFAULT 50.0,
  formatted_percentile TEXT NOT NULL DEFAULT 'P50',
  
  -- Status e Classificação
  ranking_status TEXT NOT NULL DEFAULT 'unranked' CHECK (ranking_status IN ('unranked', 'calibrando', 'provisional', 'official')),
  rank_position INTEGER,
  is_official BOOLEAN NOT NULL DEFAULT false,
  
  -- Controle Temporal
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices de alta performance para ordenação e filtros
CREATE INDEX IF NOT EXISTS idx_user_rankings_adjusted_score ON public.user_rankings_cache(adjusted_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_rankings_rank_position ON public.user_rankings_cache(rank_position ASC);
CREATE INDEX IF NOT EXISTS idx_user_rankings_modalidade ON public.user_rankings_cache(modalidade);
CREATE INDEX IF NOT EXISTS idx_user_rankings_banca ON public.user_rankings_cache(banca_foco);
CREATE INDEX IF NOT EXISTS idx_user_rankings_status ON public.user_rankings_cache(ranking_status);

-- Habilitação de RLS na tabela de cache
ALTER TABLE public.user_rankings_cache ENABLE ROW LEVEL SECURITY;

-- Alunos autenticados podem ler o ranking consolidado (dados já anonimizados sem PII)
DROP POLICY IF EXISTS "Leitura pública do ranking consolidado" ON public.user_rankings_cache;
CREATE POLICY "Leitura pública do ranking consolidado"
  ON public.user_rankings_cache
  FOR SELECT
  USING (true);

-- Apenas o sistema (service_role ou trigger) pode modificar a tabela
DROP POLICY IF EXISTS "Escrita no ranking restrita a admins e service_role" ON public.user_rankings_cache;
CREATE POLICY "Escrita no ranking restrita a admins e service_role"
  ON public.user_rankings_cache
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'curador')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'curador')
    )
  );

-- ------------------------------------------------------------------------------
-- 2. FUNÇÃO RPC SEGURA PARA CONSULTA DO LEADERBOARD (SECURITY DEFINER)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_modalidade TEXT DEFAULT NULL,
  p_banca TEXT DEFAULT NULL,
  p_institution TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  rank INTEGER,
  user_id UUID,
  student_name TEXT,
  college TEXT,
  specialty_target TEXT,
  banca_foco TEXT,
  total_answered INTEGER,
  total_correct INTEGER,
  accuracy_percentage NUMERIC,
  adjusted_score NUMERIC,
  percentile NUMERIC,
  formatted_percentile TEXT,
  ranking_status TEXT,
  is_official BOOLEAN,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.rank_position AS rank,
    r.user_id,
    r.student_name,
    COALESCE(r.college, 'Geral') AS college,
    COALESCE(r.specialty_target, 'Clínica Médica') AS specialty_target,
    COALESCE(r.banca_foco, 'Todas') AS banca_foco,
    r.total_answered,
    r.total_correct,
    r.accuracy_percentage,
    r.adjusted_score,
    r.percentile,
    r.formatted_percentile,
    r.ranking_status,
    r.is_official,
    r.updated_at
  FROM public.user_rankings_cache r
  WHERE (p_modalidade IS NULL OR r.modalidade = p_modalidade)
    AND (p_banca IS NULL OR p_banca = 'Todas' OR r.banca_foco = p_banca)
    AND (p_institution IS NULL OR r.college ILIKE '%' || p_institution || '%')
  ORDER BY r.adjusted_score DESC, r.total_answered DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Permissão de execução da RPC para usuários autenticados e anônimos
GRANT EXECUTE ON FUNCTION public.get_leaderboard TO authenticated, anon;

COMMIT;
