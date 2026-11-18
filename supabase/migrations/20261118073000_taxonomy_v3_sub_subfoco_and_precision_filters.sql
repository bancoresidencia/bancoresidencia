-- ==============================================================================
-- MIGRAÇÃO: TAXONOMIA AUTORAL V3 (5 NÍVEIS COM sub_subfoco) E FILTROS DE PRECISÃO
-- Plataforma Banco Residência Médica — Supabase PostgreSQL
--
-- Objetivos:
--   1. Garantir a coluna `sub_subfoco` e adicionar as colunas de busca de alta
--      precisão (`programa_rplus`, `banca_organizadora`, `uf`, `macrorregiao`,
--      `has_images`, `image_types`, `commentary_tier`, `is_desatualizada`,
--      `multi_tags`) nas 4 tabelas canônicas (`questions_direto`, `questions_rplus`,
--      `questions_revalida`, `questions_titulo`).
--   2. Criar índices B-Tree compostos para os 5 níveis taxonômicos e índices GIN
--      para arrays (`image_types`, `multi_tags`).
--   3. Atualizar as 5 views públicas (`security_invoker = true`) mantendo estrita
--      blindagem de `correct_answer` e `commentary`.
--   4. Reconstruir a Materialized View `public.question_facets` e a RPC
--      `public.get_faceted_question_counts` incluindo o 5º nível (`sub_subfoco`)
--      e suporte escalável via SQL (`NOT EXISTS`) para o status `Não vistas`.
--   5. Criar a RPC administrativa `public.admin_batch_update_taxonomy_v3` restrita
--      ao `service_role` para sincronizações transacionais em lote sem timeout.
-- ==============================================================================

BEGIN;

SET LOCAL statement_timeout = '120s';

-- ==============================================================================
-- 1. EVOLUÇÃO DE COLUNAS NAS 4 TABELAS CANÔNICAS
-- ==============================================================================
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'questions_direto',
    'questions_rplus',
    'questions_revalida',
    'questions_titulo'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS sub_subfoco TEXT;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS programa_rplus TEXT;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS banca_organizadora TEXT;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS uf TEXT;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS macrorregiao TEXT;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS has_images BOOLEAN DEFAULT false;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS image_types TEXT[] DEFAULT ''{}''::text[];', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS commentary_tier TEXT DEFAULT ''sem_comentario'';', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS is_desatualizada BOOLEAN DEFAULT false;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS multi_tags TEXT[] DEFAULT ''{}''::text[];', tbl);
  END LOOP;
END $$;

-- ==============================================================================
-- 2. ÍNDICES DE ALTA PERFORMANCE PARA OS 5 NÍVEIS E NOVOS FILTROS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_qdireto_tax5 ON public.questions_direto (especialidade, tema, foco, subfoco, sub_subfoco);
CREATE INDEX IF NOT EXISTS idx_qrplus_tax5 ON public.questions_rplus (especialidade, tema, foco, subfoco, sub_subfoco);
CREATE INDEX IF NOT EXISTS idx_qrevalida_tax5 ON public.questions_revalida (especialidade, tema, foco, subfoco, sub_subfoco);
CREATE INDEX IF NOT EXISTS idx_qtitulo_tax5 ON public.questions_titulo (especialidade, tema, foco, subfoco, sub_subfoco);

CREATE INDEX IF NOT EXISTS idx_qdireto_subsub ON public.questions_direto (sub_subfoco) WHERE sub_subfoco IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_qrplus_subsub ON public.questions_rplus (sub_subfoco) WHERE sub_subfoco IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_qrplus_programa ON public.questions_rplus (programa_rplus) WHERE programa_rplus IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_qtitulo_programa ON public.questions_titulo (programa_rplus) WHERE programa_rplus IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_qdireto_has_img ON public.questions_direto (has_images) WHERE has_images = true;
CREATE INDEX IF NOT EXISTS idx_qdireto_multitags ON public.questions_direto USING GIN (multi_tags);
CREATE INDEX IF NOT EXISTS idx_qrplus_multitags ON public.questions_rplus USING GIN (multi_tags);

-- ==============================================================================
-- 3. PERMISSÕES DE COLUNAS SEGURAS E VIEWS PÚBLICAS (SECURITY INVOKER)
-- ==============================================================================
GRANT SELECT (
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco,
  programa_rplus, banca_organizadora, uf, macrorregiao,
  has_images, image_types, commentary_tier, is_desatualizada, multi_tags,
  difficulty, type, is_anulada, statement, options, images, has_gabarito,
  created_at, updated_at
) ON public.questions_direto TO anon, authenticated;

GRANT SELECT (
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco,
  programa_rplus, banca_organizadora, uf, macrorregiao,
  has_images, image_types, commentary_tier, is_desatualizada, multi_tags,
  difficulty, type, is_anulada, statement, options, images, has_gabarito,
  created_at, updated_at
) ON public.questions_rplus TO anon, authenticated;

GRANT SELECT (
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco,
  programa_rplus, banca_organizadora, uf, macrorregiao,
  has_images, image_types, commentary_tier, is_desatualizada, multi_tags,
  difficulty, type, is_anulada, statement, options, images, has_gabarito,
  created_at, updated_at
) ON public.questions_revalida TO anon, authenticated;

GRANT SELECT (
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco,
  programa_rplus, banca_organizadora, uf, macrorregiao,
  has_images, image_types, commentary_tier, is_desatualizada, multi_tags,
  difficulty, type, is_anulada, statement, options, images, has_gabarito,
  created_at, updated_at
) ON public.questions_titulo TO anon, authenticated;

DROP VIEW IF EXISTS public.view_questions_all CASCADE;
DROP VIEW IF EXISTS public.view_questions_acesso_direto CASCADE;
DROP VIEW IF EXISTS public.view_questions_revalida CASCADE;
DROP VIEW IF EXISTS public.view_questions_rplus CASCADE;
DROP VIEW IF EXISTS public.view_questions_titulo CASCADE;

CREATE VIEW public.view_questions_acesso_direto
WITH (security_invoker = true) AS
SELECT
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco,
  programa_rplus, banca_organizadora, uf, macrorregiao,
  has_images, image_types, commentary_tier, is_desatualizada, multi_tags,
  difficulty, type, is_anulada, statement, options, images, has_gabarito,
  created_at, updated_at
FROM public.questions_direto;

CREATE VIEW public.view_questions_revalida
WITH (security_invoker = true) AS
SELECT
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco,
  programa_rplus, banca_organizadora, uf, macrorregiao,
  has_images, image_types, commentary_tier, is_desatualizada, multi_tags,
  difficulty, type, is_anulada, statement, options, images, has_gabarito,
  created_at, updated_at
FROM public.questions_revalida;

CREATE VIEW public.view_questions_rplus
WITH (security_invoker = true) AS
SELECT
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco,
  programa_rplus, banca_organizadora, uf, macrorregiao,
  has_images, image_types, commentary_tier, is_desatualizada, multi_tags,
  difficulty, type, is_anulada, statement, options, images, has_gabarito,
  created_at, updated_at
FROM public.questions_rplus;

CREATE VIEW public.view_questions_titulo
WITH (security_invoker = true) AS
SELECT
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco,
  programa_rplus, banca_organizadora, uf, macrorregiao,
  has_images, image_types, commentary_tier, is_desatualizada, multi_tags,
  difficulty, type, is_anulada, statement, options, images, has_gabarito,
  created_at, updated_at
FROM public.questions_titulo;

CREATE VIEW public.view_questions_all
WITH (security_invoker = true) AS
SELECT * FROM public.view_questions_acesso_direto
UNION ALL
SELECT * FROM public.view_questions_revalida
UNION ALL
SELECT * FROM public.view_questions_rplus
UNION ALL
SELECT * FROM public.view_questions_titulo;

GRANT SELECT ON public.view_questions_acesso_direto TO anon, authenticated, service_role;
GRANT SELECT ON public.view_questions_revalida TO anon, authenticated, service_role;
GRANT SELECT ON public.view_questions_rplus TO anon, authenticated, service_role;
GRANT SELECT ON public.view_questions_titulo TO anon, authenticated, service_role;
GRANT SELECT ON public.view_questions_all TO anon, authenticated, service_role;

-- ==============================================================================
-- 4. MATERIALIZED VIEW question_facets E RPC get_faceted_question_counts (5 NÍVEIS)
-- ==============================================================================
DROP MATERIALIZED VIEW IF EXISTS public.question_facets CASCADE;

CREATE MATERIALIZED VIEW public.question_facets AS
SELECT
  'Acesso Direto'::text AS modalidade_target,
  COALESCE(especialidade, '') AS especialidade,
  COALESCE(tema, '') AS tema,
  COALESCE(foco, '') AS foco,
  COALESCE(subfoco, '') AS subfoco,
  COALESCE(sub_subfoco, '') AS sub_subfoco,
  COALESCE(programa_rplus, '') AS programa_rplus,
  COALESCE(banca, '') AS banca,
  COALESCE(banca_organizadora, '') AS banca_organizadora,
  COALESCE(uf, '') AS uf,
  COALESCE(macrorregiao, '') AS macrorregiao,
  COALESCE(year, 0) AS year,
  COALESCE(modalidade, 'Acesso Direto') AS modalidade,
  COALESCE(difficulty, 'Médio') AS difficulty,
  COALESCE(type, 'Múltipla escolha') AS type,
  COALESCE(has_images, false) AS has_images,
  COALESCE(commentary_tier, 'sem_comentario') AS commentary_tier,
  COALESCE(is_anulada, false) AS is_anulada,
  COALESCE(is_desatualizada, false) AS is_desatualizada,
  COALESCE(has_gabarito, true) AS has_gabarito,
  COUNT(*)::integer AS total_count
FROM public.questions_direto
GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20

UNION ALL

SELECT
  'Revalida'::text AS modalidade_target,
  COALESCE(especialidade, '') AS especialidade,
  COALESCE(tema, '') AS tema,
  COALESCE(foco, '') AS foco,
  COALESCE(subfoco, '') AS subfoco,
  COALESCE(sub_subfoco, '') AS sub_subfoco,
  COALESCE(programa_rplus, '') AS programa_rplus,
  COALESCE(banca, '') AS banca,
  COALESCE(banca_organizadora, '') AS banca_organizadora,
  COALESCE(uf, '') AS uf,
  COALESCE(macrorregiao, '') AS macrorregiao,
  COALESCE(year, 0) AS year,
  COALESCE(modalidade, 'Revalida') AS modalidade,
  COALESCE(difficulty, 'Médio') AS difficulty,
  COALESCE(type, 'Múltipla escolha') AS type,
  COALESCE(has_images, false) AS has_images,
  COALESCE(commentary_tier, 'sem_comentario') AS commentary_tier,
  COALESCE(is_anulada, false) AS is_anulada,
  COALESCE(is_desatualizada, false) AS is_desatualizada,
  COALESCE(has_gabarito, true) AS has_gabarito,
  COUNT(*)::integer AS total_count
FROM public.questions_revalida
GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20

UNION ALL

SELECT
  'R+'::text AS modalidade_target,
  COALESCE(especialidade, '') AS especialidade,
  COALESCE(tema, '') AS tema,
  COALESCE(foco, '') AS foco,
  COALESCE(subfoco, '') AS subfoco,
  COALESCE(sub_subfoco, '') AS sub_subfoco,
  COALESCE(programa_rplus, '') AS programa_rplus,
  COALESCE(banca, '') AS banca,
  COALESCE(banca_organizadora, '') AS banca_organizadora,
  COALESCE(uf, '') AS uf,
  COALESCE(macrorregiao, '') AS macrorregiao,
  COALESCE(year, 0) AS year,
  COALESCE(modalidade, 'R+') AS modalidade,
  COALESCE(difficulty, 'Médio') AS difficulty,
  COALESCE(type, 'Múltipla escolha') AS type,
  COALESCE(has_images, false) AS has_images,
  COALESCE(commentary_tier, 'sem_comentario') AS commentary_tier,
  COALESCE(is_anulada, false) AS is_anulada,
  COALESCE(is_desatualizada, false) AS is_desatualizada,
  COALESCE(has_gabarito, true) AS has_gabarito,
  COUNT(*)::integer AS total_count
FROM public.questions_rplus
GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20

UNION ALL

SELECT
  'Título de Especialista'::text AS modalidade_target,
  COALESCE(especialidade, '') AS especialidade,
  COALESCE(tema, '') AS tema,
  COALESCE(foco, '') AS foco,
  COALESCE(subfoco, '') AS subfoco,
  COALESCE(sub_subfoco, '') AS sub_subfoco,
  COALESCE(programa_rplus, '') AS programa_rplus,
  COALESCE(banca, '') AS banca,
  COALESCE(banca_organizadora, '') AS banca_organizadora,
  COALESCE(uf, '') AS uf,
  COALESCE(macrorregiao, '') AS macrorregiao,
  COALESCE(year, 0) AS year,
  COALESCE(modalidade, 'Título de Especialista') AS modalidade,
  COALESCE(difficulty, 'Médio') AS difficulty,
  COALESCE(type, 'Múltipla escolha') AS type,
  COALESCE(has_images, false) AS has_images,
  COALESCE(commentary_tier, 'sem_comentario') AS commentary_tier,
  COALESCE(is_anulada, false) AS is_anulada,
  COALESCE(is_desatualizada, false) AS is_desatualizada,
  COALESCE(has_gabarito, true) AS has_gabarito,
  COUNT(*)::integer AS total_count
FROM public.questions_titulo
GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20;

CREATE UNIQUE INDEX idx_question_facets_unique_v3
ON public.question_facets (
  modalidade_target, especialidade, tema, foco, subfoco, sub_subfoco,
  programa_rplus, banca, banca_organizadora, uf, macrorregiao, year,
  modalidade, difficulty, type, has_images, commentary_tier,
  is_anulada, is_desatualizada, has_gabarito
);

CREATE INDEX idx_qfacets_v3_target_esp ON public.question_facets (modalidade_target, especialidade);
CREATE INDEX idx_qfacets_v3_banca ON public.question_facets (modalidade_target, banca);
CREATE INDEX idx_qfacets_v3_year ON public.question_facets (modalidade_target, year);

GRANT SELECT ON public.question_facets TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.refresh_question_facets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET statement_timeout = '120s'
AS $$
BEGIN
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
     AND current_user NOT IN ('postgres', 'supabase_admin') THEN
    RAISE EXCEPTION 'Acesso restrito ao service_role.';
  END IF;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.question_facets;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_question_facets() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_question_facets() TO service_role;

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
SET search_path = public
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
  v_sub_subfocos jsonb := '{}'::jsonb;
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
      sub_subfoco,
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
    SELECT especialidade, SUM(total_count)::int AS cnt FROM filtered WHERE especialidade != '' GROUP BY especialidade
  ),
  tema_agg AS (
    SELECT tema, SUM(total_count)::int AS cnt FROM filtered WHERE tema != '' GROUP BY tema
  ),
  foco_agg AS (
    SELECT foco, SUM(total_count)::int AS cnt FROM filtered WHERE foco != '' GROUP BY foco
  ),
  subfoco_agg AS (
    SELECT subfoco, SUM(total_count)::int AS cnt FROM filtered WHERE subfoco != '' GROUP BY subfoco
  ),
  subsub_agg AS (
    SELECT sub_subfoco, SUM(total_count)::int AS cnt FROM filtered WHERE sub_subfoco != '' GROUP BY sub_subfoco
  )
  SELECT
    (SELECT cnt FROM tot),
    COALESCE((SELECT jsonb_object_agg(especialidade, cnt) FROM esp_agg), '{}'::jsonb),
    COALESCE((SELECT jsonb_object_agg(tema, cnt) FROM tema_agg), '{}'::jsonb),
    COALESCE((SELECT jsonb_object_agg(foco, cnt) FROM foco_agg), '{}'::jsonb),
    COALESCE((SELECT jsonb_object_agg(subfoco, cnt) FROM subfoco_agg), '{}'::jsonb),
    COALESCE((SELECT jsonb_object_agg(sub_subfoco, cnt) FROM subsub_agg), '{}'::jsonb)
  INTO v_total, v_especialidades, v_temas, v_focos, v_subfocos, v_sub_subfocos;

  RETURN jsonb_build_object(
    'totalRightCardCount', v_total,
    'especialidades', v_especialidades,
    'temas', v_temas,
    'focos', v_focos,
    'subfocos', v_subfocos,
    'subSubfocos', v_sub_subfocos
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_faceted_question_counts(
  text[], int[], text[], text[], text[], text[], boolean, boolean, text, text, boolean
) TO anon, authenticated, service_role;

-- ==============================================================================
-- 5. RPC ADMINISTRATIVA DE ATUALIZAÇÃO EM LOTE (SERVICE_ROLE EXCLUSIVO)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.admin_batch_update_taxonomy_v3(
  p_table text,
  p_rows jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET statement_timeout = '60s'
AS $$
DECLARE
  v_updated integer := 0;
BEGIN
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
     AND current_user NOT IN ('postgres', 'supabase_admin') THEN
    RAISE EXCEPTION 'Acesso restrito ao service_role.';
  END IF;

  IF p_table NOT IN ('questions_direto', 'questions_rplus', 'questions_revalida', 'questions_titulo', 'questions') THEN
    RAISE EXCEPTION 'Tabela inválida: %', p_table;
  END IF;

  IF p_table = 'questions' THEN
    UPDATE public.questions q
    SET
      especialidade = r.especialidade,
      tema = r.tema,
      foco = r.foco,
      subfoco = r.subfoco,
      sub_subfoco = r.sub_subfoco
    FROM jsonb_to_recordset(p_rows) AS r(
      id text, especialidade text, tema text, foco text, subfoco text, sub_subfoco text
    )
    WHERE q.id = r.id;
  ELSE
    EXECUTE format($sql$
      UPDATE public.%I q
      SET
        especialidade = r.especialidade,
        tema = r.tema,
        foco = r.foco,
        subfoco = r.subfoco,
        sub_subfoco = r.sub_subfoco,
        programa_rplus = COALESCE(r.programa_rplus, q.programa_rplus),
        banca_organizadora = COALESCE(r.banca_organizadora, q.banca_organizadora),
        uf = COALESCE(r.uf, q.uf),
        macrorregiao = COALESCE(r.macrorregiao, q.macrorregiao),
        has_images = COALESCE(r.has_images, q.has_images),
        image_types = COALESCE(r.image_types, q.image_types),
        commentary_tier = COALESCE(r.commentary_tier, q.commentary_tier),
        is_desatualizada = COALESCE(r.is_desatualizada, q.is_desatualizada),
        multi_tags = COALESCE(r.multi_tags, q.multi_tags),
        updated_at = NOW()
      FROM jsonb_to_recordset($1) AS r(
        id text,
        especialidade text,
        tema text,
        foco text,
        subfoco text,
        sub_subfoco text,
        programa_rplus text,
        banca_organizadora text,
        uf text,
        macrorregiao text,
        has_images boolean,
        image_types text[],
        commentary_tier text,
        is_desatualizada boolean,
        multi_tags text[]
      )
      WHERE q.id = r.id;
    $sql$, p_table) USING p_rows;
  END IF;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_batch_update_taxonomy_v3(text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_batch_update_taxonomy_v3(text, jsonb) TO service_role;

COMMIT;

