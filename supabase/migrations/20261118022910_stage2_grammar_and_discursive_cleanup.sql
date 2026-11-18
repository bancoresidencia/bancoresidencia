-- ==============================================================================
-- STAGE 2 (OTIMIZADA ANTI-TIMEOUT): VIEWS SEGURAS + FUNÇÃO DE LOTES POR SHARD PK
-- Plataforma Banco Residência Médica — Supabase PostgreSQL
--
-- Por que a versão anterior deu "upstream timeout" no SQL Editor:
--   O proxy HTTP do painel do Supabase corta requisições únicas acima de ~60s.
--   Atualizar 86.408 linhas em `questions_direto` (com 14 índices B-tree e texto
--   TOAST) + `regexp_replace` numa única transação passava de 60s.
--
-- Solução (< 2 segundos no SQL Editor):
--   1. Corrige a projeção das 5 views canônicas (`security_invoker = true` apenas
--      nas 21 colunas públicas seguras, evitando erro 42501 em `SELECT *` interno).
--   2. Executa a limpeza imediata nas tabelas leves (`questions_revalida` e
--      `questions_rplus`, ~1.100 linhas no total -> < 0,4s) usando `replace()` C nativo.
--   3. Cria a RPC `public.admin_stage2_cleanup_shard(p_id_min, p_id_max)` restrita
--      ao `service_role` para processar `questions_direto` em 16 fatias de chave
--      primária (~5.300 linhas por fatia, ~2s cada, sem jamais estourar timeout).
-- ==============================================================================

BEGIN;

SET LOCAL statement_timeout = '120s';

-- ==============================================================================
-- 1. AJUSTE DE PROJEÇÃO EXPLÍCITA NAS VIEWS CANÔNICAS (SECURITY INVOKER)
--    (No PostgreSQL, `SELECT *` dentro de uma view `security_invoker` exige
--    permissão de leitura em TODAS as colunas da tabela-base, gerando 42501 por
--    causa do REVOKE em `correct_answer` e `commentary`. Projetar explicitamente
--    as 21 colunas públicas resolve 42501 mantendo blindagem total de gabaritos.)
-- ==============================================================================
DROP VIEW IF EXISTS public.view_questions_all CASCADE;
DROP VIEW IF EXISTS public.view_questions_acesso_direto CASCADE;
DROP VIEW IF EXISTS public.view_questions_revalida CASCADE;
DROP VIEW IF EXISTS public.view_questions_rplus CASCADE;
DROP VIEW IF EXISTS public.view_questions_titulo CASCADE;

CREATE VIEW public.view_questions_acesso_direto
WITH (security_invoker = true) AS
SELECT
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, images, has_gabarito, created_at, updated_at
FROM public.questions_direto;

CREATE VIEW public.view_questions_revalida
WITH (security_invoker = true) AS
SELECT
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, images, has_gabarito, created_at, updated_at
FROM public.questions_revalida;

CREATE VIEW public.view_questions_rplus
WITH (security_invoker = true) AS
SELECT
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, images, has_gabarito, created_at, updated_at
FROM public.questions_rplus;

CREATE VIEW public.view_questions_titulo
WITH (security_invoker = true) AS
SELECT
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, images, has_gabarito, created_at, updated_at
FROM public.questions_titulo;

CREATE VIEW public.view_questions_all
WITH (security_invoker = true) AS
SELECT
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, images, has_gabarito, created_at, updated_at
FROM public.questions_direto
UNION ALL
SELECT
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, images, has_gabarito, created_at, updated_at
FROM public.questions_revalida
UNION ALL
SELECT
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, images, has_gabarito, created_at, updated_at
FROM public.questions_rplus
UNION ALL
SELECT
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, images, has_gabarito, created_at, updated_at
FROM public.questions_titulo;

GRANT SELECT ON public.view_questions_acesso_direto TO anon, authenticated, service_role;
GRANT SELECT ON public.view_questions_revalida TO anon, authenticated, service_role;
GRANT SELECT ON public.view_questions_rplus TO anon, authenticated, service_role;
GRANT SELECT ON public.view_questions_titulo TO anon, authenticated, service_role;
GRANT SELECT ON public.view_questions_all TO anon, authenticated, service_role;


-- ==============================================================================
-- 2. FUNÇÃO AUXILIAR DE DESEMPACOTAMENTO JSON EM PASSE ÚNICO (SEM REGEX PESADA)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.unpack_legacy_json_options(
  p_options jsonb,
  p_alt_comments jsonb
)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN jsonb_typeof(p_options) = 'array' AND jsonb_typeof(p_alt_comments) = 'array' THEN (
      SELECT COALESCE(
        jsonb_agg(
          CASE
            WHEN COALESCE(opt.val ->> 'explanation', '') = ''
             AND COALESCE(p_alt_comments ->> (opt.ord::int - 1), '') <> ''
            THEN opt.val || jsonb_build_object(
              'explanation',
              regexp_replace(
                btrim(p_alt_comments ->> (opt.ord::int - 1)),
                '^[A-Ea-e]\s*\)\s*',
                ''
              )
            )
            ELSE opt.val
          END
          ORDER BY opt.ord
        ),
        p_options
      )
      FROM jsonb_array_elements(p_options) WITH ORDINALITY AS opt(val, ord)
    )
    ELSE p_options
  END;
$$;


-- ==============================================================================
-- 3. LIMPEZA IMEDIATA NAS TABELAS LEVES (questions_revalida: 624 | questions_rplus: 493)
-- ==============================================================================
UPDATE public.questions_revalida
SET commentary = replace(
  replace(commentary, 'Não houveram atualizações', 'Não houve atualizações'),
  'não houveram atualizações',
  'não houve atualizações'
)
WHERE commentary LIKE '%Não houveram atualizações%'
   OR commentary LIKE '%não houveram atualizações%';

WITH parsed AS (
  SELECT id, commentary::jsonb AS j, options
  FROM public.questions_revalida
  WHERE commentary LIKE '{"_id":%' AND commentary LIKE '%"statementComment"%'
)
UPDATE public.questions_revalida q
SET
  commentary = parsed.j ->> 'statementComment',
  options = public.unpack_legacy_json_options(parsed.options, parsed.j -> 'alternativesComments')
FROM parsed
WHERE q.id = parsed.id
  AND (parsed.j ->> 'statementComment') IS NOT NULL;

WITH parsed AS (
  SELECT id, commentary::jsonb AS j, options
  FROM public.questions_rplus
  WHERE commentary LIKE '{"_id":%' AND commentary LIKE '%"statementComment"%'
)
UPDATE public.questions_rplus q
SET
  commentary = parsed.j ->> 'statementComment',
  options = public.unpack_legacy_json_options(parsed.options, parsed.j -> 'alternativesComments')
FROM parsed
WHERE q.id = parsed.id
  AND (parsed.j ->> 'statementComment') IS NOT NULL;


-- ==============================================================================
-- 4. RPC DE LOTE POR FAIXA DE CHAVE PRIMÁRIA PARA `questions_direto`
--    (Usa Index Scan no PK `id`, processando ~5.300 linhas em ~2s por chamada)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.admin_stage2_cleanup_shard(
  p_id_min text,
  p_id_max text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET statement_timeout = '120s'
AS $$
DECLARE
  v_grammar_updated integer := 0;
  v_json_updated integer := 0;
BEGIN
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
     AND current_user NOT IN ('postgres', 'supabase_admin') THEN
    RAISE EXCEPTION 'Acesso restrito ao service_role.';
  END IF;

  -- 4.1 Correção gramatical ultra-rápida via replace() C nativo + Index Scan no PK
  UPDATE public.questions_direto
  SET commentary = replace(
    replace(commentary, 'Não houveram atualizações', 'Não houve atualizações'),
    'não houveram atualizações',
    'não houve atualizações'
  )
  WHERE id >= p_id_min
    AND (p_id_max IS NULL OR id < p_id_max)
    AND (
      commentary LIKE '%Não houveram atualizações%'
      OR commentary LIKE '%não houveram atualizações%'
    );
  GET DIAGNOSTICS v_grammar_updated = ROW_COUNT;

  -- 4.2 Desempacotamento JSON em passe único + Index Scan no PK
  WITH parsed AS (
    SELECT id, commentary::jsonb AS j, options
    FROM public.questions_direto
    WHERE id >= p_id_min
      AND (p_id_max IS NULL OR id < p_id_max)
      AND commentary LIKE '{"_id":%'
      AND commentary LIKE '%"statementComment"%'
  )
  UPDATE public.questions_direto q
  SET
    commentary = parsed.j ->> 'statementComment',
    options = public.unpack_legacy_json_options(parsed.options, parsed.j -> 'alternativesComments')
  FROM parsed
  WHERE q.id = parsed.id
    AND (parsed.j ->> 'statementComment') IS NOT NULL;
  GET DIAGNOSTICS v_json_updated = ROW_COUNT;

  RETURN jsonb_build_object(
    'shard_min', p_id_min,
    'shard_max', p_id_max,
    'grammar_updated', v_grammar_updated,
    'json_updated', v_json_updated
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_stage2_cleanup_shard(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_stage2_cleanup_shard(text, text) TO service_role;

COMMIT;
