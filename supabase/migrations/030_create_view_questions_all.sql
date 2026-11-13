-- ==============================================================================
-- MIGRAÇÃO 030: VIEW UNIFICADA CANÔNICA (view_questions_all) E EXPANSÃO DE FACETS
-- Plataforma Banco Residência Médica — Supabase PostgreSQL
-- URL SQL Editor: https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new
--
-- Objetivos:
--   1. Criar a view unificada 'view_questions_all' que agrega:
--      - questions_direto (206.599 questões)
--      - questions_revalida (4.411 questões)
--      - questions_rplus (45.413 questões)
--      - questions_titulo (688 questões)
--      Totalizando 257.111 questões para suporte total a multi-seleção de modalidades.
--   2. Conceder permissões de leitura (anon, authenticated, service_role).
--   3. Reconstruir a Materialized View 'question_facets' integrando as 4 modalidades.
-- ==============================================================================

BEGIN;

-- 1. View Unificada Canônica de Todas as Modalidades
DROP VIEW IF EXISTS public.view_questions_all CASCADE;
CREATE OR REPLACE VIEW public.view_questions_all AS
SELECT * FROM public.questions_direto
UNION ALL
SELECT * FROM public.questions_revalida
UNION ALL
SELECT * FROM public.questions_rplus
UNION ALL
SELECT * FROM public.questions_titulo;

-- 2. Concessão de Privilégios
GRANT SELECT ON public.view_questions_all TO anon, authenticated, service_role;

-- 3. Atualização da Materialized View 'question_facets' para Abranger as 4 Modalidades
DROP MATERIALIZED VIEW IF EXISTS public.question_facets CASCADE;

CREATE MATERIALIZED VIEW public.question_facets AS
SELECT
  'Acesso Direto'::text AS modalidade_target,
  especialidade,
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
GROUP BY
  especialidade,
  COALESCE(tema, ''),
  COALESCE(foco, ''),
  COALESCE(subfoco, ''),
  COALESCE(banca, ''),
  COALESCE(year, 0),
  COALESCE(modalidade, 'Acesso Direto'),
  COALESCE(difficulty, 'Médio'),
  COALESCE(type, 'Múltipla escolha'),
  COALESCE(is_anulada, false),
  COALESCE(has_gabarito, true)

UNION ALL

SELECT
  'Revalida'::text AS modalidade_target,
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
  COALESCE(has_gabarito, true) AS has_gabarito,
  COUNT(*)::integer AS total_count
FROM public.questions_revalida
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
  COALESCE(has_gabarito, true)

UNION ALL

SELECT
  'R+'::text AS modalidade_target,
  especialidade,
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
GROUP BY
  especialidade,
  COALESCE(tema, ''),
  COALESCE(foco, ''),
  COALESCE(subfoco, ''),
  COALESCE(banca, ''),
  COALESCE(year, 0),
  COALESCE(modalidade, 'R+'),
  COALESCE(difficulty, 'Médio'),
  COALESCE(type, 'Múltipla escolha'),
  COALESCE(is_anulada, false),
  COALESCE(has_gabarito, true)

UNION ALL

SELECT
  'Título de Especialista'::text AS modalidade_target,
  especialidade,
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
GROUP BY
  especialidade,
  COALESCE(tema, ''),
  COALESCE(foco, ''),
  COALESCE(subfoco, ''),
  COALESCE(banca, ''),
  COALESCE(year, 0),
  COALESCE(modalidade, 'Título de Especialista'),
  COALESCE(difficulty, 'Médio'),
  COALESCE(type, 'Múltipla escolha'),
  COALESCE(is_anulada, false),
  COALESCE(has_gabarito, true);

-- 4. Índices de Alta Performance na Materialized View
CREATE UNIQUE INDEX idx_question_facets_unique_all
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

CREATE INDEX idx_qfacets_target_all ON public.question_facets (modalidade_target);
CREATE INDEX idx_qfacets_target_esp_all ON public.question_facets (modalidade_target, especialidade);
CREATE INDEX idx_qfacets_target_banca_all ON public.question_facets (modalidade_target, banca);
CREATE INDEX idx_qfacets_target_year_all ON public.question_facets (modalidade_target, year);

COMMIT;

