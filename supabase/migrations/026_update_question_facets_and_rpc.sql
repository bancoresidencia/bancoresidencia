-- ==============================================================================
-- MIGRAÇÃO 026: ATUALIZAÇÃO DA MATERIALIZED VIEW 'question_facets' E RPC REATIVO
-- Plataforma Banco Residência Médica — Supabase PostgreSQL
-- URL direta: https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new
--
-- Objetivos:
--   1. Reconstruir a Materialized View 'question_facets' unificando:
--      - view_questions_acesso_direto (173.526 questões: 130k base + 43.5k expansão homologada)
--      - view_questions_revalida (5.499 questões: 2.9k base + 2.5k expansão homologada)
--      - Isolando estritamente a quarentena (subfoco = 'Geral' ou nulo)
--   2. Atualizar a RPC 'get_faceted_question_counts' para suportar o chaveamento
--      entre Acesso Direto e Revalida via parâmetro 'p_is_revalida', retornando
--      contagens reais em tempo recorde (< 20ms).
-- ==============================================================================

BEGIN;

-- 1. DROP DE VIEWS E FUNÇÕES ANTERIORES
DROP MATERIALIZED VIEW IF EXISTS public.question_facets CASCADE;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT oid::regprocedure AS func_sig
    FROM pg_proc
    WHERE proname = 'get_faceted_question_counts'
      AND pronamespace = 'public'::regnamespace
  ) LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_sig || ' CASCADE';
  END LOOP;
END $$;

-- 2. CRIAÇÃO DA MATERIALIZED VIEW UNIFICADA COM SEGREGRAÇÃO DE MODALIDADE ALVO
CREATE MATERIALIZED VIEW public.question_facets AS
SELECT
  'acesso_direto'::text AS modalidade_target,
  especialidade,
  COALESCE(tema, '') AS tema,
  COALESCE(foco, '') AS foco,
  COALESCE(subfoco, '') AS subfoco,
  COALESCE(banca, '') AS banca,
  COALESCE(year, 0) AS year,
  COALESCE(modalidade, 'Residência Médica') AS modalidade,
  COALESCE(difficulty, 'Médio') AS difficulty,
  COALESCE(type, 'Múltipla escolha') AS type,
  COALESCE(is_anulada, false) AS is_anulada,
  COALESCE(has_gabarito, (correct_answer IS NOT NULL AND correct_answer != '' AND correct_answer != 'SEM_GABARITO')) AS has_gabarito,
  COUNT(*)::integer AS total_count
FROM public.view_questions_acesso_direto
GROUP BY
  especialidade,
  COALESCE(tema, ''),
  COALESCE(foco, ''),
  COALESCE(subfoco, ''),
  COALESCE(banca, ''),
  COALESCE(year, 0),
  COALESCE(modalidade, 'Residência Médica'),
  COALESCE(difficulty, 'Médio'),
  COALESCE(type, 'Múltipla escolha'),
  COALESCE(is_anulada, false),
  COALESCE(has_gabarito, (correct_answer IS NOT NULL AND correct_answer != '' AND correct_answer != 'SEM_GABARITO'))

UNION ALL

SELECT
  'revalida'::text AS modalidade_target,
  especialidade,
  COALESCE(tema, '') AS tema,
  COALESCE(foco, '') AS foco,
  COALESCE(subfoco, '') AS subfoco,
  COALESCE(banca, '') AS banca,
  COALESCE(year, 0) AS year,
  COALESCE(modalidade, 'Revalida') AS modalidade,
  COALESCE(difficulty, 'Médio') AS difficulty,
  COALESCE(type, 'Múltipla escolha') AS type,
  COALESCE(is_anulada, false) AS is_anulada,
  COALESCE(has_gabarito, (correct_answer IS NOT NULL AND correct_answer != '' AND correct_answer != 'SEM_GABARITO')) AS has_gabarito,
  COUNT(*)::integer AS total_count
FROM public.view_questions_revalida
GROUP BY
  especialidade,
  COALESCE(tema, ''),
  COALESCE(foco, ''),
  COALESCE(subfoco, ''),
  COALESCE(banca, ''),
  COALESCE(year, 0),
  COALESCE(modalidade, 'Revalida'),
  COALESCE(difficulty, 'Médio'),
  COALESCE(type, 'Múltipla escolha'),
  COALESCE(is_anulada, false),
  COALESCE(has_gabarito, (correct_answer IS NOT NULL AND correct_answer != '' AND correct_answer != 'SEM_GABARITO'));

-- 3. ÍNDICES DE ALTA PERFORMANCE NA MATERIALIZED VIEW
CREATE UNIQUE INDEX idx_question_facets_unique 
ON public.question_facets (
  modalidade_target,
  especialidade,
  tema,
  foco,
  subfoco,
  banca,
  year,
  modalidade,
  difficulty,
  type,
  is_anulada,
  has_gabarito
);

CREATE INDEX idx_qfacets_target ON public.question_facets (modalidade_target);
CREATE INDEX idx_qfacets_target_esp ON public.question_facets (modalidade_target, especialidade);
CREATE INDEX idx_qfacets_target_banca ON public.question_facets (modalidade_target, banca);
CREATE INDEX idx_qfacets_target_year ON public.question_facets (modalidade_target, year);
CREATE INDEX idx_qfacets_target_tema ON public.question_facets (modalidade_target, tema);
CREATE INDEX idx_qfacets_target_foco ON public.question_facets (modalidade_target, foco);
CREATE INDEX idx_qfacets_target_subfoco ON public.question_facets (modalidade_target, subfoco);

-- 4. FUNÇÃO RPC 'get_faceted_question_counts' COM PARÂMETRO 'p_is_revalida'
CREATE OR REPLACE FUNCTION public.get_faceted_question_counts(
  p_bancas text[] DEFAULT NULL,
  p_years int[] DEFAULT NULL,
  p_especialidades text[] DEFAULT NULL,
  p_modalidades text[] DEFAULT NULL,
  p_dificuldades text[] DEFAULT NULL,
  p_tipos text[] DEFAULT NULL,
  p_ocultar_anuladas boolean DEFAULT false,
  p_ultimos_5_anos boolean DEFAULT false,
  p_status text DEFAULT 'Todas',
  p_user_id text DEFAULT NULL,
  p_is_revalida boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET statement_timeout = '15s'
AS $$
DECLARE
  v_current_year int := EXTRACT(YEAR FROM CURRENT_DATE)::int;
  v_min_year int := v_current_year - 4;
  v_target text := CASE WHEN p_is_revalida THEN 'revalida' ELSE 'acesso_direto' END;
  v_total int := 0;
  v_especialidades jsonb := '{}'::jsonb;
  v_temas jsonb := '{}'::jsonb;
  v_focos jsonb := '{}'::jsonb;
  v_subfocos jsonb := '{}'::jsonb;
  v_result jsonb;
BEGIN
  WITH filtered AS (
    SELECT
      especialidade,
      tema,
      foco,
      subfoco,
      total_count
    FROM public.question_facets
    WHERE
      modalidade_target = v_target
      AND (p_bancas IS NULL OR banca = ANY(p_bancas))
      AND (p_years IS NULL OR year = ANY(p_years))
      AND (NOT p_ultimos_5_anos OR year >= v_min_year)
      AND (p_especialidades IS NULL OR especialidade = ANY(p_especialidades))
      AND (p_modalidades IS NULL OR modalidade = ANY(p_modalidades))
      AND (p_dificuldades IS NULL OR difficulty = ANY(p_dificuldades))
      AND (p_tipos IS NULL OR type = ANY(p_tipos))
      AND (NOT p_ocultar_anuladas OR is_anulada = false)
  ),
  tot AS (
    SELECT COALESCE(SUM(total_count), 0)::int AS cnt FROM filtered
  ),
  esp_agg AS (
    SELECT
      especialidade,
      SUM(total_count)::int AS cnt
    FROM filtered
    WHERE especialidade IS NOT NULL AND especialidade != ''
    GROUP BY especialidade
  ),
  tema_agg AS (
    SELECT
      tema,
      SUM(total_count)::int AS cnt
    FROM filtered
    WHERE tema IS NOT NULL AND tema != ''
    GROUP BY tema
  ),
  foco_agg AS (
    SELECT
      foco,
      SUM(total_count)::int AS cnt
    FROM filtered
    WHERE foco IS NOT NULL AND foco != ''
    GROUP BY foco
  ),
  subfoco_agg AS (
    SELECT
      subfoco,
      SUM(total_count)::int AS cnt
    FROM filtered
    WHERE subfoco IS NOT NULL AND subfoco != ''
    GROUP BY subfoco
  )
  SELECT
    (SELECT cnt FROM tot),
    COALESCE((SELECT jsonb_object_agg(especialidade, cnt) FROM esp_agg), '{}'::jsonb),
    COALESCE((SELECT jsonb_object_agg(tema, cnt) FROM tema_agg), '{}'::jsonb),
    COALESCE((SELECT jsonb_object_agg(foco, cnt) FROM foco_agg), '{}'::jsonb),
    COALESCE((SELECT jsonb_object_agg(subfoco, cnt) FROM subfoco_agg), '{}'::jsonb)
  INTO
    v_total,
    v_especialidades,
    v_temas,
    v_focos,
    v_subfocos;

  v_result := jsonb_build_object(
    'totalRightCardCount', v_total,
    'especialidades', v_especialidades,
    'temas', v_temas,
    'focos', v_focos,
    'subfocos', v_subfocos
  );

  RETURN v_result;
END;
$$;

-- 5. FUNÇÃO DE REFRESH CONCORRENTE DA VIEW
CREATE OR REPLACE FUNCTION public.refresh_question_facets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.question_facets;
END;
$$;

-- 6. PERMISSÕES E ROLES
GRANT SELECT ON public.question_facets TO anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.get_faceted_question_counts(
  text[], int[], text[], text[], text[], text[], boolean, boolean, text, text, boolean
) TO anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.refresh_question_facets() TO authenticated, service_role;

COMMIT;

