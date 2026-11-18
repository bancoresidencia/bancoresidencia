-- ==============================================================================
-- MIGRAÇÃO: HARDENING DE SEGURANÇA (COLUNAS/RLS), VIEW_QUESTIONS_ALL E FACETS 257K
-- Plataforma Banco Residência Médica — Supabase PostgreSQL
-- URL SQL Editor: https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new
--
-- Objetivos:
--   1. Estender o Hardening Anti-Scraping da Migração 018 às 4 tabelas canônicas
--      (questions_direto, questions_rplus, questions_revalida, questions_titulo)
--      e às tabelas legadas de expansão, revogando leitura pública de
--      'correct_answer' e 'commentary' para as roles 'anon' e 'authenticated'.
--   2. Recriar as 4 views por modalidade e criar 'view_questions_all' com
--      WITH (security_invoker = true), garantindo aplicação estrita do RLS
--      (has_gabarito = true) e dos privilégios por coluna.
--   3. Criar índices compostos (year DESC, id ASC) para paginação rápida sem timeout.
--   4. Sincronizar gabaritos pendentes de 'questions' -> 'questions_direto' e
--      normalizar a flag 'has_gabarito'.
--   5. Reconstruir a Materialized View 'question_facets' e as RPCs
--      'get_faceted_question_counts' e 'get_questions_stats' cobrindo 100% das
--      4 modalidades (~257.090 questões).
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. SINCRONIZAÇÃO DE INTEGRIDADE (SPLIT-BRAIN & FLAGS)
-- ==============================================================================
UPDATE public.questions_direto qd
SET
  correct_answer = q.correct_answer,
  has_gabarito = true,
  updated_at = NOW()
FROM public.questions q
WHERE qd.id = q.id
  AND COALESCE(qd.is_anulada, false) = false
  AND (qd.correct_answer IS NULL OR BTRIM(qd.correct_answer) = '')
  AND q.correct_answer IN ('A', 'B', 'C', 'D', 'E');

UPDATE public.questions_direto
SET
  correct_answer = COALESCE(NULLIF(BTRIM(correct_answer), ''), CASE WHEN is_anulada = true THEN 'ANULADA' ELSE NULL END),
  has_gabarito = true,
  updated_at = NOW()
WHERE (has_gabarito = false OR has_gabarito IS NULL)
  AND (correct_answer IN ('A', 'B', 'C', 'D', 'E', 'ANULADA') OR is_anulada = true);

-- ==============================================================================
-- 2. ÍNDICES COMPOSTOS DE PAGINAÇÃO PADRÃO (EVITA STATEMENT TIMEOUT)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_qdireto_year_desc_id_asc ON public.questions_direto (year DESC, id ASC);
CREATE INDEX IF NOT EXISTS idx_qrplus_year_desc_id_asc ON public.questions_rplus (year DESC, id ASC);
CREATE INDEX IF NOT EXISTS idx_qrevalida_year_desc_id_asc ON public.questions_revalida (year DESC, id ASC);
CREATE INDEX IF NOT EXISTS idx_qtitulo_year_desc_id_asc ON public.questions_titulo (year DESC, id ASC);

-- ==============================================================================
-- 3. HARDENING DE COLUNAS E RLS NAS 4 TABELAS CANÔNICAS E TABELAS DE EXPANSÃO
-- ==============================================================================
REVOKE ALL ON public.questions_direto FROM anon, authenticated;
REVOKE ALL ON public.questions_rplus FROM anon, authenticated;
REVOKE ALL ON public.questions_revalida FROM anon, authenticated;
REVOKE ALL ON public.questions_titulo FROM anon, authenticated;

GRANT SELECT (
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, images, has_gabarito, created_at, updated_at
) ON public.questions_direto TO anon, authenticated;

GRANT SELECT (
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, images, has_gabarito, created_at, updated_at
) ON public.questions_rplus TO anon, authenticated;

GRANT SELECT (
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, images, has_gabarito, created_at, updated_at
) ON public.questions_revalida TO anon, authenticated;

GRANT SELECT (
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, images, has_gabarito, created_at, updated_at
) ON public.questions_titulo TO anon, authenticated;

GRANT ALL ON public.questions_direto TO service_role;
GRANT ALL ON public.questions_rplus TO service_role;
GRANT ALL ON public.questions_revalida TO service_role;
GRANT ALL ON public.questions_titulo TO service_role;

-- Revoga acesso direto de anon/authenticated às tabelas legadas de expansão/base
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'questions_expansion_direto',
    'questions_expansion_r_plus',
    'questions_expansion_revalida',
    'questions_expansion_titulo_especialista',
    'questions_revalida_base'
  ] LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl
    ) THEN
      EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated;', tbl);
      EXECUTE format('GRANT ALL ON public.%I TO service_role;', tbl);
    END IF;
  END LOOP;
END $$;

-- ==============================================================================
-- 4. VIEWS CANÔNICAS COM SECURITY INVOKER (RESPEITA RLS E COLUNAS SEGURAS)
-- ==============================================================================
DROP VIEW IF EXISTS public.view_questions_all CASCADE;
DROP VIEW IF EXISTS public.view_questions_acesso_direto CASCADE;
DROP VIEW IF EXISTS public.view_questions_revalida CASCADE;
DROP VIEW IF EXISTS public.view_questions_rplus CASCADE;
DROP VIEW IF EXISTS public.view_questions_titulo CASCADE;

CREATE VIEW public.view_questions_acesso_direto
WITH (security_invoker = true) AS
SELECT * FROM public.questions_direto;

CREATE VIEW public.view_questions_revalida
WITH (security_invoker = true) AS
SELECT * FROM public.questions_revalida;

CREATE VIEW public.view_questions_rplus
WITH (security_invoker = true) AS
SELECT * FROM public.questions_rplus;

CREATE VIEW public.view_questions_titulo
WITH (security_invoker = true) AS
SELECT * FROM public.questions_titulo;

CREATE VIEW public.view_questions_all
WITH (security_invoker = true) AS
SELECT * FROM public.questions_direto
UNION ALL
SELECT * FROM public.questions_revalida
UNION ALL
SELECT * FROM public.questions_rplus
UNION ALL
SELECT * FROM public.questions_titulo;

REVOKE ALL ON public.view_questions_acesso_direto FROM anon, authenticated;
REVOKE ALL ON public.view_questions_revalida FROM anon, authenticated;
REVOKE ALL ON public.view_questions_rplus FROM anon, authenticated;
REVOKE ALL ON public.view_questions_titulo FROM anon, authenticated;
REVOKE ALL ON public.view_questions_all FROM anon, authenticated;

GRANT SELECT (
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, images, has_gabarito, created_at, updated_at
) ON public.view_questions_acesso_direto TO anon, authenticated;

GRANT SELECT (
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, images, has_gabarito, created_at, updated_at
) ON public.view_questions_revalida TO anon, authenticated;

GRANT SELECT (
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, images, has_gabarito, created_at, updated_at
) ON public.view_questions_rplus TO anon, authenticated;

GRANT SELECT (
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, images, has_gabarito, created_at, updated_at
) ON public.view_questions_titulo TO anon, authenticated;

GRANT SELECT (
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, images, has_gabarito, created_at, updated_at
) ON public.view_questions_all TO anon, authenticated;

GRANT SELECT ON public.view_questions_acesso_direto TO service_role;
GRANT SELECT ON public.view_questions_revalida TO service_role;
GRANT SELECT ON public.view_questions_rplus TO service_role;
GRANT SELECT ON public.view_questions_titulo TO service_role;
GRANT SELECT ON public.view_questions_all TO service_role;

-- ==============================================================================
-- 5. RECONSTRUÇÃO DE question_facets E RPCS PARA AS 4 MODALIDADES (~257K)
-- ==============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.question_facets CASCADE;

CREATE MATERIALIZED VIEW public.question_facets AS
SELECT
  'Acesso Direto'::text AS modalidade_target,
  COALESCE(especialidade, '') AS especialidade,
  COALESCE(tema, '') AS tema,
  COALESCE(foco, '') AS foco,
  COALESCE(subfoco, '') AS subfoco,
  COALESCE(banca, '') AS banca,
  COALESCE(year, 0) AS year,
  COALESCE(modalidade, 'Acesso Direto') AS modalidade,
  COALESCE(difficulty, 'Médio') AS difficulty,
  COALESCE(type, 'Múltipla escolha') AS type,
  COALESCE(is_anulada, false) AS is_anulada,
  COALESCE(has_gabarito, true) AS has_gabarito,
  COUNT(*)::integer AS total_count
FROM public.questions_direto
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12

UNION ALL

SELECT
  'Revalida'::text AS modalidade_target,
  COALESCE(especialidade, '') AS especialidade,
  COALESCE(tema, '') AS tema,
  COALESCE(foco, '') AS foco,
  COALESCE(subfoco, '') AS subfoco,
  COALESCE(banca, '') AS banca,
  COALESCE(year, 0) AS year,
  COALESCE(modalidade, 'Revalida') AS modalidade,
  COALESCE(difficulty, 'Médio') AS difficulty,
  COALESCE(type, 'Múltipla escolha') AS type,
  COALESCE(is_anulada, false) AS is_anulada,
  COALESCE(has_gabarito, true) AS has_gabarito,
  COUNT(*)::integer AS total_count
FROM public.questions_revalida
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12

UNION ALL

SELECT
  'R+'::text AS modalidade_target,
  COALESCE(especialidade, '') AS especialidade,
  COALESCE(tema, '') AS tema,
  COALESCE(foco, '') AS foco,
  COALESCE(subfoco, '') AS subfoco,
  COALESCE(banca, '') AS banca,
  COALESCE(year, 0) AS year,
  COALESCE(modalidade, 'R+') AS modalidade,
  COALESCE(difficulty, 'Médio') AS difficulty,
  COALESCE(type, 'Múltipla escolha') AS type,
  COALESCE(is_anulada, false) AS is_anulada,
  COALESCE(has_gabarito, true) AS has_gabarito,
  COUNT(*)::integer AS total_count
FROM public.questions_rplus
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12

UNION ALL

SELECT
  'Título de Especialista'::text AS modalidade_target,
  COALESCE(especialidade, '') AS especialidade,
  COALESCE(tema, '') AS tema,
  COALESCE(foco, '') AS foco,
  COALESCE(subfoco, '') AS subfoco,
  COALESCE(banca, '') AS banca,
  COALESCE(year, 0) AS year,
  COALESCE(modalidade, 'Título de Especialista') AS modalidade,
  COALESCE(difficulty, 'Médio') AS difficulty,
  COALESCE(type, 'Múltipla escolha') AS type,
  COALESCE(is_anulada, false) AS is_anulada,
  COALESCE(has_gabarito, true) AS has_gabarito,
  COUNT(*)::integer AS total_count
FROM public.questions_titulo
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12;

CREATE UNIQUE INDEX idx_question_facets_unique_all
ON public.question_facets (
  modalidade_target, especialidade, tema, foco, subfoco,
  banca, year, modalidade, difficulty, type, is_anulada, has_gabarito
);

CREATE INDEX idx_qfacets_target_all ON public.question_facets (modalidade_target);
CREATE INDEX idx_qfacets_target_esp_all ON public.question_facets (modalidade_target, especialidade);
CREATE INDEX idx_qfacets_target_banca_all ON public.question_facets (modalidade_target, banca);
CREATE INDEX idx_qfacets_target_year_all ON public.question_facets (modalidade_target, year);

GRANT SELECT ON public.question_facets TO anon, authenticated, service_role;

-- Recria RPC get_faceted_question_counts suportando todas as 4 modalidades
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
  v_targets text[];
  v_total int := 0;
  v_especialidades jsonb := '{}'::jsonb;
  v_temas jsonb := '{}'::jsonb;
  v_focos jsonb := '{}'::jsonb;
  v_subfocos jsonb := '{}'::jsonb;
BEGIN
  IF p_modalidades IS NOT NULL AND array_length(p_modalidades, 1) > 0 THEN
    SELECT array_agg(DISTINCT
      CASE
        WHEN m IN ('Residência Médica', 'Acesso Direto') THEN 'Acesso Direto'
        WHEN m ILIKE '%revalida%' THEN 'Revalida'
        WHEN m ILIKE 'R+%' THEN 'R+'
        WHEN m ILIKE 'Título%' OR m ILIKE 'Titulo%' THEN 'Título de Especialista'
        ELSE m
      END
    )
    INTO v_targets
    FROM unnest(p_modalidades) AS m;
  ELSIF p_is_revalida THEN
    v_targets := ARRAY['Revalida'];
  ELSE
    v_targets := NULL;
  END IF;

  WITH filtered AS (
    SELECT
      especialidade,
      tema,
      foco,
      subfoco,
      total_count
    FROM public.question_facets
    WHERE
      (v_targets IS NULL OR modalidade_target = ANY(v_targets))
      AND (p_bancas IS NULL OR banca = ANY(p_bancas))
      AND (p_years IS NULL OR year = ANY(p_years))
      AND (NOT p_ultimos_5_anos OR year >= v_min_year)
      AND (p_especialidades IS NULL OR especialidade = ANY(p_especialidades))
      AND (p_dificuldades IS NULL OR difficulty = ANY(p_dificuldades))
      AND (p_tipos IS NULL OR type = ANY(p_tipos))
      AND (NOT p_ocultar_anuladas OR is_anulada = false)
  ),
  tot AS (
    SELECT COALESCE(SUM(total_count), 0)::int AS cnt FROM filtered
  ),
  esp_agg AS (
    SELECT especialidade, SUM(total_count)::int AS cnt
    FROM filtered
    WHERE especialidade != ''
    GROUP BY especialidade
  ),
  tema_agg AS (
    SELECT tema, SUM(total_count)::int AS cnt
    FROM filtered
    WHERE tema != ''
    GROUP BY tema
  ),
  foco_agg AS (
    SELECT foco, SUM(total_count)::int AS cnt
    FROM filtered
    WHERE foco != ''
    GROUP BY foco
  ),
  subfoco_agg AS (
    SELECT subfoco, SUM(total_count)::int AS cnt
    FROM filtered
    WHERE subfoco != ''
    GROUP BY subfoco
  )
  SELECT
    (SELECT cnt FROM tot),
    COALESCE((SELECT jsonb_object_agg(especialidade, cnt) FROM esp_agg), '{}'::jsonb),
    COALESCE((SELECT jsonb_object_agg(tema, cnt) FROM tema_agg), '{}'::jsonb),
    COALESCE((SELECT jsonb_object_agg(foco, cnt) FROM foco_agg), '{}'::jsonb),
    COALESCE((SELECT jsonb_object_agg(subfoco, cnt) FROM subfoco_agg), '{}'::jsonb)
  INTO v_total, v_especialidades, v_temas, v_focos, v_subfocos;

  RETURN jsonb_build_object(
    'totalRightCardCount', v_total,
    'especialidades', v_especialidades,
    'temas', v_temas,
    'focos', v_focos,
    'subfocos', v_subfocos
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_questions_stats()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
    'total', COALESCE(SUM(total_count), 0)::int,
    'with_answer', COALESCE(SUM(CASE WHEN has_gabarito THEN total_count ELSE 0 END), 0)::int
  )
  FROM public.question_facets;
$$;

CREATE OR REPLACE FUNCTION public.refresh_question_facets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.question_facets;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_faceted_question_counts(
  text[], int[], text[], text[], text[], text[], boolean, boolean, text, text, boolean
) TO anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.get_questions_stats() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.refresh_question_facets() TO authenticated, service_role;

COMMIT;
