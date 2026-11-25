BEGIN;
SET LOCAL lock_timeout = '4s';
SET LOCAL statement_timeout = '5min';

-- 1. Canonical platform gold-standard commentary classifier.
--    Matches verified Padrão Ouro commentaries (Take-Home / Síntese Clínica / Armadilha / Pérola
--    or structured Markdown option explanations) while excluding legacy raw JSON and placeholders.
CREATE OR REPLACE FUNCTION public.is_gold_standard_commentary(
  p_commentary text,
  p_options jsonb DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $$
DECLARE
  v_comm text := btrim(COALESCE(p_commentary, ''));
  v_low text;
  v_has_take_home boolean;
BEGIN
  IF v_comm <> '' THEN
    v_low := lower(v_comm);
    v_has_take_home := (v_comm ~* 'take[- ]?home') OR (strpos(v_low, 'takehome') > 0);

    IF v_has_take_home THEN
      RETURN true;
    END IF;

    -- Exclude raw third-party JSON blobs and static official-key placeholders
    IF left(v_comm, 1) = '{'
       AND (strpos(v_comm, '"_id"') > 0 OR strpos(v_comm, '"statementComment"') > 0) THEN
      RETURN false;
    END IF;

    IF v_low LIKE 'gabarito oficial%'
       OR v_low LIKE '[gabarito oficial%'
       OR strpos(v_low, 'gabarito não disponibilizado') > 0
       OR strpos(v_low, 'padrão de resposta não disponível') > 0 THEN
      RETURN false;
    END IF;

    IF strpos(v_comm, 'Síntese Clínica') > 0
       OR strpos(v_comm, 'Armadilha da Questão') > 0
       OR strpos(v_comm, 'Pérola Clínica') > 0
       OR strpos(v_comm, '💡') > 0 THEN
      RETURN true;
    END IF;
  END IF;

  IF p_options IS NOT NULL AND jsonb_typeof(p_options) = 'array' THEN
    RETURN EXISTS (
      SELECT 1
      FROM jsonb_array_elements(p_options) AS opt
      WHERE length(btrim(COALESCE(opt->>'explanation', ''))) > 15
        AND strpos(opt->>'explanation', '**') > 0
        AND strpos(lower(opt->>'explanation'), '<u>') = 0
    );
  END IF;

  RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.is_gold_standard_commentary(text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_gold_standard_commentary(text, jsonb) TO service_role;

-- 2. Add indexed boolean flag to study_question_index (zero text payload in index)
ALTER TABLE public.study_question_index
  ADD COLUMN IF NOT EXISTS has_gold_commentary boolean NOT NULL DEFAULT false;

UPDATE public.study_question_index i
SET has_gold_commentary = public.is_gold_standard_commentary(q.commentary, to_jsonb(q.options))
FROM public.questions_direto q
WHERE i.catalog_modality = 'Acesso Direto'
  AND i.id = q.id
  AND i.has_gold_commentary IS DISTINCT FROM public.is_gold_standard_commentary(q.commentary, to_jsonb(q.options));

UPDATE public.study_question_index i
SET has_gold_commentary = public.is_gold_standard_commentary(q.commentary, to_jsonb(q.options))
FROM public.questions_rplus q
WHERE i.catalog_modality = 'R+'
  AND i.id = q.id
  AND i.has_gold_commentary IS DISTINCT FROM public.is_gold_standard_commentary(q.commentary, to_jsonb(q.options));

UPDATE public.study_question_index i
SET has_gold_commentary = public.is_gold_standard_commentary(q.commentary, to_jsonb(q.options))
FROM public.questions_revalida q
WHERE i.catalog_modality = 'Revalida'
  AND i.id = q.id
  AND i.has_gold_commentary IS DISTINCT FROM public.is_gold_standard_commentary(q.commentary, to_jsonb(q.options));

UPDATE public.study_question_index i
SET has_gold_commentary = public.is_gold_standard_commentary(q.commentary, to_jsonb(q.options))
FROM public.questions_titulo q
WHERE i.catalog_modality = 'Título de Especialista'
  AND i.id = q.id
  AND i.has_gold_commentary IS DISTINCT FROM public.is_gold_standard_commentary(q.commentary, to_jsonb(q.options));

CREATE INDEX IF NOT EXISTS study_question_index_gold_modality_year_id_idx
  ON public.study_question_index (catalog_modality, year DESC NULLS LAST, id)
  WHERE has_gold_commentary IS TRUE;

CREATE INDEX IF NOT EXISTS study_question_index_gold_modality_banca_idx
  ON public.study_question_index (catalog_modality, banca)
  WHERE has_gold_commentary IS TRUE;

CREATE INDEX IF NOT EXISTS study_question_index_gold_modality_clinical_idx
  ON public.study_question_index (catalog_modality, especialidade, tema, foco)
  WHERE has_gold_commentary IS TRUE;

ANALYZE public.study_question_index;

-- 3. Keep has_gold_commentary automatically synchronized on every insert/update
CREATE OR REPLACE FUNCTION public.sync_study_question_index()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  catalog text := TG_ARGV[0];
  is_gold boolean;
BEGIN
  IF TG_OP = 'TRUNCATE' THEN
    DELETE FROM public.study_question_index WHERE catalog_modality = catalog;
    RETURN NULL;
  END IF;
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.study_question_index WHERE catalog_modality = catalog AND id = OLD.id;
    RETURN NULL;
  END IF;
  IF TG_OP = 'UPDATE' AND (OLD.id IS DISTINCT FROM NEW.id OR NEW.has_gabarito IS NOT TRUE) THEN
    DELETE FROM public.study_question_index WHERE catalog_modality = catalog AND id = OLD.id;
  END IF;
  IF NEW.has_gabarito IS TRUE THEN
    is_gold := public.is_gold_standard_commentary(NEW.commentary, to_jsonb(NEW.options));
    INSERT INTO public.study_question_index (
      catalog_modality, id, code, institution, banca, year, tipo_prova,
      especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type, is_anulada,
      banca_organizadora, macrorregiao, programa_rplus, has_image, has_gold_commentary
    ) VALUES (
      catalog, NEW.id, NEW.code, NEW.institution, NEW.banca, NEW.year, NEW.tipo_prova,
      NEW.especialidade, NEW.tema, NEW.foco, NEW.subfoco, NEW.sub_subfoco, NEW.difficulty, NEW.type, NEW.is_anulada,
      NEW.banca_organizadora, NEW.macrorregiao, NEW.programa_rplus,
      CASE WHEN jsonb_typeof(to_jsonb(NEW.images)) = 'array'
        THEN jsonb_array_length(to_jsonb(NEW.images)) > 0 ELSE false END,
      is_gold
    )
    ON CONFLICT (catalog_modality, id) DO UPDATE SET
      code = EXCLUDED.code, institution = EXCLUDED.institution, banca = EXCLUDED.banca,
      year = EXCLUDED.year, tipo_prova = EXCLUDED.tipo_prova, especialidade = EXCLUDED.especialidade,
      tema = EXCLUDED.tema, foco = EXCLUDED.foco, subfoco = EXCLUDED.subfoco, sub_subfoco = EXCLUDED.sub_subfoco,
      difficulty = EXCLUDED.difficulty, type = EXCLUDED.type, is_anulada = EXCLUDED.is_anulada,
      banca_organizadora = EXCLUDED.banca_organizadora, macrorregiao = EXCLUDED.macrorregiao,
      programa_rplus = EXCLUDED.programa_rplus, has_image = EXCLUDED.has_image,
      has_gold_commentary = EXCLUDED.has_gold_commentary;
  END IF;
  RETURN NULL;
END;
$$;

DO $$
DECLARE target record;
BEGIN
  FOR target IN SELECT * FROM (VALUES
    ('questions_direto','Acesso Direto'), ('questions_rplus','R+'),
    ('questions_revalida','Revalida'), ('questions_titulo','Título de Especialista')
  ) AS sources(table_name, modality)
  LOOP
    EXECUTE format('CREATE OR REPLACE TRIGGER sync_study_question_index
      AFTER INSERT OR DELETE OR UPDATE OF id, code, institution, banca, year, tipo_prova, especialidade,
        tema, foco, subfoco, sub_subfoco, difficulty, type, images, is_anulada, has_gabarito, correct_answer,
        banca_organizadora, macrorregiao, programa_rplus, commentary, options
      ON public.%I FOR EACH ROW EXECUTE FUNCTION public.sync_study_question_index(%L)',
      target.table_name, target.modality);
  END LOOP;
END;
$$;

-- 4. Update query_study_questions RPC to support only_commented (filtering by has_gold_commentary)
CREATE OR REPLACE FUNCTION public.query_study_questions(
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_mode text DEFAULT 'list',
  p_page int DEFAULT 1,
  p_size int DEFAULT 20
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
SET statement_timeout = '12s'
AS $$
DECLARE
  v_student_id uuid := auth.uid();
  v_mode text := COALESCE(p_mode, 'list');
  v_modalities text[];
  v_ids text[];
  v_excluded_ids text[];
  v_bancas text[];
  v_quota_bancas text[];
  v_organizers text[];
  v_organizer_bancas text[];
  v_regions text[];
  v_region_bancas text[];
  v_programs text[];
  v_years int[];
  v_exam_types text[];
  v_difficulty text;
  v_formats text[];
  v_status text;
  v_hide_annulled boolean;
  v_hide_reviewed boolean;
  v_with_image boolean;
  v_only_commented boolean;
  v_search_terms text[];
  v_clinical jsonb;
  v_quota_clinical jsonb;
  v_randomize boolean;
  v_recent_from int;
  v_single_modality boolean;
  v_needs_answers boolean;
  v_size int;
  v_offset bigint;
  v_total bigint;
  v_result jsonb;
BEGIN
  SELECT
    f.modalities, f.ids, f.excluded_ids, f.bancas, f.quota_bancas,
    f.organizers, f.organizer_bancas, f.regions, f.region_bancas,
    f.programs, f.years, f.exam_types, f.difficulty, f.formats,
    f.status, f.hide_annulled, f.hide_reviewed, f.with_image, f.only_commented,
    f.search_terms, f.clinical, f.quota_clinical, f.randomize, f.recent_from
  INTO
    v_modalities, v_ids, v_excluded_ids, v_bancas, v_quota_bancas,
    v_organizers, v_organizer_bancas, v_regions, v_region_bancas,
    v_programs, v_years, v_exam_types, v_difficulty, v_formats,
    v_status, v_hide_annulled, v_hide_reviewed, v_with_image, v_only_commented,
    v_search_terms, v_clinical, v_quota_clinical, v_randomize, v_recent_from
  FROM jsonb_to_record(COALESCE(p_filters, '{}'::jsonb)) AS f(
    modalities text[], ids text[], excluded_ids text[], bancas text[], quota_bancas text[],
    organizers text[], organizer_bancas text[], regions text[], region_bancas text[],
    programs text[], years int[], exam_types text[], difficulty text, formats text[],
    status text, hide_annulled boolean, hide_reviewed boolean, with_image boolean,
    only_commented boolean, search_terms text[], clinical jsonb, quota_clinical jsonb,
    randomize boolean, recent_from int
  );

  v_single_modality := (v_modalities IS NOT NULL AND cardinality(v_modalities) = 1);
  v_needs_answers := ((v_status IS NOT NULL AND v_status <> 'Todas') OR v_hide_reviewed IS TRUE);

  IF v_mode = 'catalog' THEN
    IF v_single_modality THEN
      SELECT jsonb_build_object(
        'total', (
          SELECT count(*)
          FROM public.study_question_index q
          WHERE q.catalog_modality = v_modalities[1]
        ),
        'bancas', COALESCE((
          SELECT jsonb_object_agg(banca, cnt)
          FROM (
            SELECT q.banca, count(*) AS cnt
            FROM public.study_question_index q
            WHERE q.catalog_modality = v_modalities[1]
              AND NULLIF(q.banca, '') IS NOT NULL
            GROUP BY q.banca
          ) b
        ), '{}'::jsonb),
        'years', COALESCE((
          SELECT jsonb_agg(year ORDER BY year DESC)
          FROM (
            SELECT DISTINCT q.year
            FROM public.study_question_index q
            WHERE q.catalog_modality = v_modalities[1]
              AND q.year IS NOT NULL
          ) y
        ), '[]'::jsonb)
      ) INTO v_result;
    ELSE
      WITH eligible AS MATERIALIZED (
        SELECT DISTINCT ON (q.id) q.id, q.year, q.banca
        FROM public.study_question_index q
        WHERE (v_modalities IS NULL OR q.catalog_modality = ANY(v_modalities))
        ORDER BY q.id, q.catalog_modality
      )
      SELECT jsonb_build_object(
        'total', (SELECT count(*) FROM eligible),
        'bancas', COALESCE((
          SELECT jsonb_object_agg(banca, cnt)
          FROM (
            SELECT banca, count(*) AS cnt
            FROM eligible
            WHERE NULLIF(banca, '') IS NOT NULL
            GROUP BY banca
          ) b
        ), '{}'::jsonb),
        'years', COALESCE((
          SELECT jsonb_agg(year ORDER BY year DESC)
          FROM (
            SELECT DISTINCT year
            FROM eligible
            WHERE year IS NOT NULL
          ) y
        ), '[]'::jsonb)
      ) INTO v_result;
    END IF;
    RETURN v_result;
  END IF;

  IF v_mode = 'count' THEN
    WITH answers AS MATERIALIZED (
      SELECT a.question_id, a.is_correct, a.reviewed_at, a.written_answer IS NOT NULL AS is_written
      FROM public.user_answers a
      WHERE v_needs_answers AND a.user_id = v_student_id
    ), matching AS (
      SELECT q.id
      FROM public.study_question_index q
      LEFT JOIN answers a ON v_needs_answers AND a.question_id = q.id
      WHERE (v_modalities IS NULL OR q.catalog_modality = ANY(v_modalities))
        AND (v_ids IS NULL OR q.id = ANY(v_ids))
        AND (v_excluded_ids IS NULL OR q.id <> ALL(v_excluded_ids))
        AND (v_bancas IS NULL OR q.banca = ANY(v_bancas))
        AND (v_quota_bancas IS NULL OR q.banca = ANY(v_quota_bancas))
        AND (v_organizers IS NULL OR q.banca_organizadora = ANY(v_organizers)
          OR (NULLIF(q.banca_organizadora, '') IS NULL AND q.banca = ANY(v_organizer_bancas)))
        AND (v_regions IS NULL OR q.macrorregiao = ANY(v_regions)
          OR (NULLIF(q.macrorregiao, '') IS NULL AND q.banca = ANY(v_region_bancas)))
        AND (v_programs IS NULL OR (
          q.catalog_modality IN ('R+', 'Título de Especialista') AND COALESCE(
            NULLIF(q.programa_rplus, ''),
            CASE
              WHEN q.catalog_modality = 'Título de Especialista' AND q.banca ILIKE '%TEGO%' THEN 'TEGO (Ginecologia e Obstetrícia)'
              WHEN q.catalog_modality = 'Título de Especialista' AND q.banca ILIKE '%TECM%' THEN 'TECM (Clínica Médica)'
              WHEN q.catalog_modality = 'Título de Especialista' AND q.banca ILIKE '%SBOT%' THEN 'SBOT (Ortopedia)'
              WHEN q.tipo_prova ILIKE '%Mastologia%' THEN 'R+ Mastologia'
              WHEN q.tipo_prova ILIKE '%Neonatologia%' THEN 'R+ Neonatologia'
              WHEN q.tipo_prova ILIKE '%Geriatria%' THEN 'R+ Geriatria'
              WHEN q.tipo_prova ILIKE '%Intensiva%' THEN 'R+ Medicina Intensiva'
              WHEN q.tipo_prova ILIKE '%Urologia%' THEN 'R+ Urologia'
              WHEN q.tipo_prova ILIKE '%Pediatria%' THEN 'R+ Pediatria'
              WHEN q.tipo_prova ILIKE '%Ginecologia%' OR q.tipo_prova ILIKE '%Obstetrícia%' THEN 'R+ Ginecologia e Obstetrícia'
              WHEN q.tipo_prova ILIKE '%Cirurgia Geral%' THEN 'R+ Cirurgia Geral'
              WHEN q.tipo_prova ILIKE '%Clínica Médica%' THEN 'R+ Clínica Médica'
            END
          ) = ANY(v_programs)
        ))
        AND (v_years IS NULL OR q.year = ANY(v_years))
        AND (v_recent_from IS NULL OR v_years IS NOT NULL OR q.year BETWEEN v_recent_from AND v_recent_from + 4)
        AND (v_exam_types IS NULL OR q.tipo_prova = ANY(v_exam_types))
        AND (v_difficulty IS NULL OR COALESCE(NULLIF(q.difficulty, ''), 'Desconhecido') = v_difficulty)
        AND (v_formats IS NULL OR lower(btrim(q.type)) = ANY(v_formats))
        AND (v_hide_annulled IS NOT TRUE OR q.is_anulada IS NOT TRUE)
        AND (v_hide_reviewed IS NOT TRUE OR a.reviewed_at IS NULL)
        AND (v_with_image IS NOT TRUE OR q.has_image)
        AND (v_only_commented IS NOT TRUE OR q.has_gold_commentary IS TRUE)
        AND CASE v_status
          WHEN 'Não vistas' THEN a.question_id IS NULL
          WHEN 'Resolvidas' THEN a.question_id IS NOT NULL
          WHEN 'Acertadas' THEN a.is_correct IS TRUE AND NOT a.is_written
          WHEN 'Erradas' THEN a.is_correct IS FALSE AND NOT a.is_written
          WHEN 'Ainda não acertadas' THEN a.question_id IS NULL OR a.is_correct IS FALSE OR a.is_written
          ELSE true
        END
        AND (v_search_terms IS NULL OR EXISTS (
          SELECT 1 FROM unnest(v_search_terms) AS s(term)
          WHERE strpos(lower(concat_ws(E'\n', q.code, q.tema, q.foco, q.subfoco, q.sub_subfoco)), lower(s.term)) > 0
        ))
        AND (v_clinical IS NULL OR EXISTS (
          SELECT 1 FROM jsonb_array_elements(v_clinical) AS b(path)
          WHERE NOT EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(b.path) WITH ORDINALITY AS segment(value, position)
            WHERE segment.value IS NOT NULL AND segment.value IS DISTINCT FROM (ARRAY[
              CASE
                WHEN q.especialidade = 'Cirurgia' THEN 'Cirurgia Geral'
                WHEN q.especialidade = 'Medicina Preventiva' THEN 'Medicina Preventiva e Social'
                ELSE COALESCE(q.especialidade, '')
              END, COALESCE(q.tema,''), COALESCE(q.foco,''), COALESCE(q.subfoco,''), COALESCE(q.sub_subfoco,'')
            ])[segment.position::int]
          )
        ))
        AND (v_quota_clinical IS NULL OR EXISTS (
          SELECT 1 FROM jsonb_array_elements(v_quota_clinical) AS b(path)
          WHERE NOT EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(b.path) WITH ORDINALITY AS segment(value, position)
            WHERE segment.value IS NOT NULL AND segment.value IS DISTINCT FROM (ARRAY[
              CASE
                WHEN q.especialidade = 'Cirurgia' THEN 'Cirurgia Geral'
                WHEN q.especialidade = 'Medicina Preventiva' THEN 'Medicina Preventiva e Social'
                ELSE COALESCE(q.especialidade, '')
              END, COALESCE(q.tema,''), COALESCE(q.foco,''), COALESCE(q.subfoco,''), COALESCE(q.sub_subfoco,'')
            ])[segment.position::int]
          )
        ))
    )
    SELECT CASE WHEN v_single_modality
      THEN (SELECT count(*) FROM matching)
      ELSE (SELECT count(DISTINCT id) FROM matching)
    END INTO v_total;

    RETURN jsonb_build_object('total', COALESCE(v_total, 0));
  END IF;

  IF v_mode = 'facets' THEN
    IF v_single_modality THEN
      WITH answers AS MATERIALIZED (
        SELECT a.question_id, a.is_correct, a.reviewed_at, a.written_answer IS NOT NULL AS is_written
        FROM public.user_answers a
        WHERE v_needs_answers AND a.user_id = v_student_id
      ), eligible AS MATERIALIZED (
        SELECT paths.path
        FROM public.study_question_index q
        CROSS JOIN LATERAL (SELECT ARRAY[
          CASE
            WHEN q.especialidade = 'Cirurgia' THEN 'Cirurgia Geral'
            WHEN q.especialidade = 'Medicina Preventiva' THEN 'Medicina Preventiva e Social'
            ELSE COALESCE(q.especialidade, '')
          END, COALESCE(q.tema,''), COALESCE(q.foco,''), COALESCE(q.subfoco,''), COALESCE(q.sub_subfoco,'')
        ] AS path) paths
        LEFT JOIN answers a ON v_needs_answers AND a.question_id = q.id
        WHERE q.catalog_modality = v_modalities[1]
          AND (v_ids IS NULL OR q.id = ANY(v_ids))
          AND (v_excluded_ids IS NULL OR q.id <> ALL(v_excluded_ids))
          AND (v_bancas IS NULL OR q.banca = ANY(v_bancas))
          AND (v_quota_bancas IS NULL OR q.banca = ANY(v_quota_bancas))
          AND (v_organizers IS NULL OR q.banca_organizadora = ANY(v_organizers)
            OR (NULLIF(q.banca_organizadora, '') IS NULL AND q.banca = ANY(v_organizer_bancas)))
          AND (v_regions IS NULL OR q.macrorregiao = ANY(v_regions)
            OR (NULLIF(q.macrorregiao, '') IS NULL AND q.banca = ANY(v_region_bancas)))
          AND (v_programs IS NULL OR (
            q.catalog_modality IN ('R+', 'Título de Especialista') AND COALESCE(
              NULLIF(q.programa_rplus, ''),
              CASE
                WHEN q.catalog_modality = 'Título de Especialista' AND q.banca ILIKE '%TEGO%' THEN 'TEGO (Ginecologia e Obstetrícia)'
                WHEN q.catalog_modality = 'Título de Especialista' AND q.banca ILIKE '%TECM%' THEN 'TECM (Clínica Médica)'
                WHEN q.catalog_modality = 'Título de Especialista' AND q.banca ILIKE '%SBOT%' THEN 'SBOT (Ortopedia)'
                WHEN q.tipo_prova ILIKE '%Mastologia%' THEN 'R+ Mastologia'
                WHEN q.tipo_prova ILIKE '%Neonatologia%' THEN 'R+ Neonatologia'
                WHEN q.tipo_prova ILIKE '%Geriatria%' THEN 'R+ Geriatria'
                WHEN q.tipo_prova ILIKE '%Intensiva%' THEN 'R+ Medicina Intensiva'
                WHEN q.tipo_prova ILIKE '%Urologia%' THEN 'R+ Urologia'
                WHEN q.tipo_prova ILIKE '%Pediatria%' THEN 'R+ Pediatria'
                WHEN q.tipo_prova ILIKE '%Ginecologia%' OR q.tipo_prova ILIKE '%Obstetrícia%' THEN 'R+ Ginecologia e Obstetrícia'
                WHEN q.tipo_prova ILIKE '%Cirurgia Geral%' THEN 'R+ Cirurgia Geral'
                WHEN q.tipo_prova ILIKE '%Clínica Médica%' THEN 'R+ Clínica Médica'
              END
            ) = ANY(v_programs)
          ))
          AND (v_years IS NULL OR q.year = ANY(v_years))
          AND (v_recent_from IS NULL OR v_years IS NOT NULL OR q.year BETWEEN v_recent_from AND v_recent_from + 4)
          AND (v_exam_types IS NULL OR q.tipo_prova = ANY(v_exam_types))
          AND (v_difficulty IS NULL OR COALESCE(NULLIF(q.difficulty, ''), 'Desconhecido') = v_difficulty)
          AND (v_formats IS NULL OR lower(btrim(q.type)) = ANY(v_formats))
          AND (v_hide_annulled IS NOT TRUE OR q.is_anulada IS NOT TRUE)
          AND (v_hide_reviewed IS NOT TRUE OR a.reviewed_at IS NULL)
          AND (v_with_image IS NOT TRUE OR q.has_image)
          AND (v_only_commented IS NOT TRUE OR q.has_gold_commentary IS TRUE)
          AND CASE v_status
            WHEN 'Não vistas' THEN a.question_id IS NULL
            WHEN 'Resolvidas' THEN a.question_id IS NOT NULL
            WHEN 'Acertadas' THEN a.is_correct IS TRUE AND NOT a.is_written
            WHEN 'Erradas' THEN a.is_correct IS FALSE AND NOT a.is_written
            WHEN 'Ainda não acertadas' THEN a.question_id IS NULL OR a.is_correct IS FALSE OR a.is_written
            ELSE true
          END
          AND (v_search_terms IS NULL OR EXISTS (
            SELECT 1 FROM unnest(v_search_terms) AS s(term)
            WHERE strpos(lower(concat_ws(E'\n', q.code, q.tema, q.foco, q.subfoco, q.sub_subfoco)), lower(s.term)) > 0
          ))
          AND (v_quota_clinical IS NULL OR EXISTS (
            SELECT 1 FROM jsonb_array_elements(v_quota_clinical) AS b(path)
            WHERE NOT EXISTS (
              SELECT 1 FROM jsonb_array_elements_text(b.path) WITH ORDINALITY AS segment(value, position)
              WHERE segment.value IS NOT NULL AND segment.value IS DISTINCT FROM paths.path[segment.position::int]
            )
          ))
      ), facet_groups AS (
        SELECT array_to_string(ARRAY[path[1], path[2], path[3], path[4], path[5]], chr(31)) AS key,
          count(*) AS count
        FROM eligible
        GROUP BY ROLLUP (path[1], path[2], path[3], path[4], path[5])
        HAVING GROUPING(path[1]) = 0 AND COALESCE(path[5], path[4], path[3], path[2], 'root') <> ''
      )
      SELECT jsonb_build_object(
        'totalRightCardCount', (SELECT count(*) FROM eligible),
        'paths', COALESCE((SELECT jsonb_object_agg(key, count) FROM facet_groups), '{}'::jsonb)
      ) INTO v_result;
    ELSE
      WITH answers AS MATERIALIZED (
        SELECT a.question_id, a.is_correct, a.reviewed_at, a.written_answer IS NOT NULL AS is_written
        FROM public.user_answers a
        WHERE v_needs_answers AND a.user_id = v_student_id
      ), eligible AS MATERIALIZED (
        SELECT DISTINCT ON (q.id) q.id, paths.path
        FROM public.study_question_index q
        CROSS JOIN LATERAL (SELECT ARRAY[
          CASE
            WHEN q.especialidade = 'Cirurgia' THEN 'Cirurgia Geral'
            WHEN q.especialidade = 'Medicina Preventiva' THEN 'Medicina Preventiva e Social'
            ELSE COALESCE(q.especialidade, '')
          END, COALESCE(q.tema,''), COALESCE(q.foco,''), COALESCE(q.subfoco,''), COALESCE(q.sub_subfoco,'')
        ] AS path) paths
        LEFT JOIN answers a ON v_needs_answers AND a.question_id = q.id
        WHERE (v_modalities IS NULL OR q.catalog_modality = ANY(v_modalities))
          AND (v_ids IS NULL OR q.id = ANY(v_ids))
          AND (v_excluded_ids IS NULL OR q.id <> ALL(v_excluded_ids))
          AND (v_bancas IS NULL OR q.banca = ANY(v_bancas))
          AND (v_quota_bancas IS NULL OR q.banca = ANY(v_quota_bancas))
          AND (v_organizers IS NULL OR q.banca_organizadora = ANY(v_organizers)
            OR (NULLIF(q.banca_organizadora, '') IS NULL AND q.banca = ANY(v_organizer_bancas)))
          AND (v_regions IS NULL OR q.macrorregiao = ANY(v_regions)
            OR (NULLIF(q.macrorregiao, '') IS NULL AND q.banca = ANY(v_region_bancas)))
          AND (v_programs IS NULL OR (
            q.catalog_modality IN ('R+', 'Título de Especialista') AND COALESCE(
              NULLIF(q.programa_rplus, ''),
              CASE
                WHEN q.catalog_modality = 'Título de Especialista' AND q.banca ILIKE '%TEGO%' THEN 'TEGO (Ginecologia e Obstetrícia)'
                WHEN q.catalog_modality = 'Título de Especialista' AND q.banca ILIKE '%TECM%' THEN 'TECM (Clínica Médica)'
                WHEN q.catalog_modality = 'Título de Especialista' AND q.banca ILIKE '%SBOT%' THEN 'SBOT (Ortopedia)'
                WHEN q.tipo_prova ILIKE '%Mastologia%' THEN 'R+ Mastologia'
                WHEN q.tipo_prova ILIKE '%Neonatologia%' THEN 'R+ Neonatologia'
                WHEN q.tipo_prova ILIKE '%Geriatria%' THEN 'R+ Geriatria'
                WHEN q.tipo_prova ILIKE '%Intensiva%' THEN 'R+ Medicina Intensiva'
                WHEN q.tipo_prova ILIKE '%Urologia%' THEN 'R+ Urologia'
                WHEN q.tipo_prova ILIKE '%Pediatria%' THEN 'R+ Pediatria'
                WHEN q.tipo_prova ILIKE '%Ginecologia%' OR q.tipo_prova ILIKE '%Obstetrícia%' THEN 'R+ Ginecologia e Obstetrícia'
                WHEN q.tipo_prova ILIKE '%Cirurgia Geral%' THEN 'R+ Cirurgia Geral'
                WHEN q.tipo_prova ILIKE '%Clínica Médica%' THEN 'R+ Clínica Médica'
              END
            ) = ANY(v_programs)
          ))
          AND (v_years IS NULL OR q.year = ANY(v_years))
          AND (v_recent_from IS NULL OR v_years IS NOT NULL OR q.year BETWEEN v_recent_from AND v_recent_from + 4)
          AND (v_exam_types IS NULL OR q.tipo_prova = ANY(v_exam_types))
          AND (v_difficulty IS NULL OR COALESCE(NULLIF(q.difficulty, ''), 'Desconhecido') = v_difficulty)
          AND (v_formats IS NULL OR lower(btrim(q.type)) = ANY(v_formats))
          AND (v_hide_annulled IS NOT TRUE OR q.is_anulada IS NOT TRUE)
          AND (v_hide_reviewed IS NOT TRUE OR a.reviewed_at IS NULL)
          AND (v_with_image IS NOT TRUE OR q.has_image)
          AND (v_only_commented IS NOT TRUE OR q.has_gold_commentary IS TRUE)
          AND CASE v_status
            WHEN 'Não vistas' THEN a.question_id IS NULL
            WHEN 'Resolvidas' THEN a.question_id IS NOT NULL
            WHEN 'Acertadas' THEN a.is_correct IS TRUE AND NOT a.is_written
            WHEN 'Erradas' THEN a.is_correct IS FALSE AND NOT a.is_written
            WHEN 'Ainda não acertadas' THEN a.question_id IS NULL OR a.is_correct IS FALSE OR a.is_written
            ELSE true
          END
          AND (v_search_terms IS NULL OR EXISTS (
            SELECT 1 FROM unnest(v_search_terms) AS s(term)
            WHERE strpos(lower(concat_ws(E'\n', q.code, q.tema, q.foco, q.subfoco, q.sub_subfoco)), lower(s.term)) > 0
          ))
          AND (v_quota_clinical IS NULL OR EXISTS (
            SELECT 1 FROM jsonb_array_elements(v_quota_clinical) AS b(path)
            WHERE NOT EXISTS (
              SELECT 1 FROM jsonb_array_elements_text(b.path) WITH ORDINALITY AS segment(value, position)
              WHERE segment.value IS NOT NULL AND segment.value IS DISTINCT FROM paths.path[segment.position::int]
            )
          ))
        ORDER BY q.id, q.catalog_modality
      ), facet_groups AS (
        SELECT array_to_string(ARRAY[path[1], path[2], path[3], path[4], path[5]], chr(31)) AS key,
          count(*) AS count
        FROM eligible
        GROUP BY ROLLUP (path[1], path[2], path[3], path[4], path[5])
        HAVING GROUPING(path[1]) = 0 AND COALESCE(path[5], path[4], path[3], path[2], 'root') <> ''
      )
      SELECT jsonb_build_object(
        'totalRightCardCount', (SELECT count(*) FROM eligible),
        'paths', COALESCE((SELECT jsonb_object_agg(key, count) FROM facet_groups), '{}'::jsonb)
      ) INTO v_result;
    END IF;
    RETURN v_result;
  END IF;

  IF v_mode NOT IN ('list', 'ids') THEN
    RETURN NULL;
  END IF;

  v_size := CASE WHEN v_mode = 'ids'
    THEN least(greatest(COALESCE(p_size, 20), 1), 200)
    ELSE least(greatest(COALESCE(p_size, 20), 1), 50)
  END;
  v_offset := (greatest(least(COALESCE(p_page, 1), 100000), 1)::bigint - 1)
    * least(greatest(COALESCE(p_size, 20), 1), 50);

  IF v_single_modality THEN
    WITH answers AS MATERIALIZED (
      SELECT a.question_id, a.is_correct, a.reviewed_at, a.written_answer IS NOT NULL AS is_written
      FROM public.user_answers a
      WHERE v_needs_answers AND a.user_id = v_student_id
    ), filtered AS (
      SELECT
        q.id,
        q.catalog_modality,
        q.year,
        CASE WHEN v_ids IS NOT NULL THEN array_position(v_ids, q.id) END AS requested_order,
        CASE WHEN v_randomize IS TRUE THEN random() END AS random_order
      FROM public.study_question_index q
      LEFT JOIN answers a ON v_needs_answers AND a.question_id = q.id
      WHERE q.catalog_modality = v_modalities[1]
        AND (v_ids IS NULL OR q.id = ANY(v_ids))
        AND (v_excluded_ids IS NULL OR q.id <> ALL(v_excluded_ids))
        AND (v_bancas IS NULL OR q.banca = ANY(v_bancas))
        AND (v_quota_bancas IS NULL OR q.banca = ANY(v_quota_bancas))
        AND (v_organizers IS NULL OR q.banca_organizadora = ANY(v_organizers)
          OR (NULLIF(q.banca_organizadora, '') IS NULL AND q.banca = ANY(v_organizer_bancas)))
        AND (v_regions IS NULL OR q.macrorregiao = ANY(v_regions)
          OR (NULLIF(q.macrorregiao, '') IS NULL AND q.banca = ANY(v_region_bancas)))
        AND (v_programs IS NULL OR (
          q.catalog_modality IN ('R+', 'Título de Especialista') AND COALESCE(
            NULLIF(q.programa_rplus, ''),
            CASE
              WHEN q.catalog_modality = 'Título de Especialista' AND q.banca ILIKE '%TEGO%' THEN 'TEGO (Ginecologia e Obstetrícia)'
              WHEN q.catalog_modality = 'Título de Especialista' AND q.banca ILIKE '%TECM%' THEN 'TECM (Clínica Médica)'
              WHEN q.catalog_modality = 'Título de Especialista' AND q.banca ILIKE '%SBOT%' THEN 'SBOT (Ortopedia)'
              WHEN q.tipo_prova ILIKE '%Mastologia%' THEN 'R+ Mastologia'
              WHEN q.tipo_prova ILIKE '%Neonatologia%' THEN 'R+ Neonatologia'
              WHEN q.tipo_prova ILIKE '%Geriatria%' THEN 'R+ Geriatria'
              WHEN q.tipo_prova ILIKE '%Intensiva%' THEN 'R+ Medicina Intensiva'
              WHEN q.tipo_prova ILIKE '%Urologia%' THEN 'R+ Urologia'
              WHEN q.tipo_prova ILIKE '%Pediatria%' THEN 'R+ Pediatria'
              WHEN q.tipo_prova ILIKE '%Ginecologia%' OR q.tipo_prova ILIKE '%Obstetrícia%' THEN 'R+ Ginecologia e Obstetrícia'
              WHEN q.tipo_prova ILIKE '%Cirurgia Geral%' THEN 'R+ Cirurgia Geral'
              WHEN q.tipo_prova ILIKE '%Clínica Médica%' THEN 'R+ Clínica Médica'
            END
          ) = ANY(v_programs)
        ))
        AND (v_years IS NULL OR q.year = ANY(v_years))
        AND (v_recent_from IS NULL OR v_years IS NOT NULL OR q.year BETWEEN v_recent_from AND v_recent_from + 4)
        AND (v_exam_types IS NULL OR q.tipo_prova = ANY(v_exam_types))
        AND (v_difficulty IS NULL OR COALESCE(NULLIF(q.difficulty, ''), 'Desconhecido') = v_difficulty)
        AND (v_formats IS NULL OR lower(btrim(q.type)) = ANY(v_formats))
        AND (v_hide_annulled IS NOT TRUE OR q.is_anulada IS NOT TRUE)
        AND (v_hide_reviewed IS NOT TRUE OR a.reviewed_at IS NULL)
        AND (v_with_image IS NOT TRUE OR q.has_image)
        AND (v_only_commented IS NOT TRUE OR q.has_gold_commentary IS TRUE)
        AND CASE v_status
          WHEN 'Não vistas' THEN a.question_id IS NULL
          WHEN 'Resolvidas' THEN a.question_id IS NOT NULL
          WHEN 'Acertadas' THEN a.is_correct IS TRUE AND NOT a.is_written
          WHEN 'Erradas' THEN a.is_correct IS FALSE AND NOT a.is_written
          WHEN 'Ainda não acertadas' THEN a.question_id IS NULL OR a.is_correct IS FALSE OR a.is_written
          ELSE true
        END
        AND (v_search_terms IS NULL OR EXISTS (
          SELECT 1 FROM unnest(v_search_terms) AS s(term)
          WHERE strpos(lower(concat_ws(E'\n', q.code, q.tema, q.foco, q.subfoco, q.sub_subfoco)), lower(s.term)) > 0
        ))
        AND (v_clinical IS NULL OR EXISTS (
          SELECT 1 FROM jsonb_array_elements(v_clinical) AS b(path)
          WHERE NOT EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(b.path) WITH ORDINALITY AS segment(value, position)
            WHERE segment.value IS NOT NULL AND segment.value IS DISTINCT FROM (ARRAY[
              CASE
                WHEN q.especialidade = 'Cirurgia' THEN 'Cirurgia Geral'
                WHEN q.especialidade = 'Medicina Preventiva' THEN 'Medicina Preventiva e Social'
                ELSE COALESCE(q.especialidade, '')
              END, COALESCE(q.tema,''), COALESCE(q.foco,''), COALESCE(q.subfoco,''), COALESCE(q.sub_subfoco,'')
            ])[segment.position::int]
          )
        ))
        AND (v_quota_clinical IS NULL OR EXISTS (
          SELECT 1 FROM jsonb_array_elements(v_quota_clinical) AS b(path)
          WHERE NOT EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(b.path) WITH ORDINALITY AS segment(value, position)
            WHERE segment.value IS NOT NULL AND segment.value IS DISTINCT FROM (ARRAY[
              CASE
                WHEN q.especialidade = 'Cirurgia' THEN 'Cirurgia Geral'
                WHEN q.especialidade = 'Medicina Preventiva' THEN 'Medicina Preventiva e Social'
                ELSE COALESCE(q.especialidade, '')
              END, COALESCE(q.tema,''), COALESCE(q.foco,''), COALESCE(q.subfoco,''), COALESCE(q.sub_subfoco,'')
            ])[segment.position::int]
          )
        ))
    ), page_rows AS MATERIALIZED (
      SELECT id, catalog_modality, requested_order, random_order, year
      FROM filtered
      ORDER BY requested_order NULLS LAST, random_order NULLS LAST, year DESC NULLS LAST, id
      LIMIT v_size OFFSET v_offset
    ), rows_json AS (
      SELECT jsonb_agg(jsonb_build_object(
        'id', q.id, 'code', q.code, 'institution', q.institution, 'banca', q.banca, 'year', q.year,
        'tipo_prova', q.tipo_prova, 'modalidade', q.catalog_modality, 'especialidade', q.especialidade,
        'tema', q.tema, 'foco', q.foco, 'subfoco', q.subfoco, 'sub_subfoco', q.sub_subfoco,
        'difficulty', q.difficulty, 'type', q.type, 'is_anulada', q.is_anulada,
        'statement', q.statement, 'images', q.images,
        'options', COALESCE((
          SELECT jsonb_agg(jsonb_build_object('letter', opt.value->>'letter', 'text', opt.value->>'text') ORDER BY opt.position)
          FROM jsonb_array_elements(CASE WHEN jsonb_typeof(to_jsonb(q.options)) = 'array' THEN to_jsonb(q.options) ELSE '[]'::jsonb END)
            WITH ORDINALITY AS opt(value, position)
        ), '[]'::jsonb)
      ) ORDER BY p.requested_order NULLS LAST, p.random_order NULLS LAST, p.year DESC NULLS LAST, p.id) AS value
      FROM page_rows p
      CROSS JOIN LATERAL (
        SELECT * FROM public.study_question_catalog q
        WHERE q.id = p.id AND q.catalog_modality = p.catalog_modality LIMIT 1
      ) q
      WHERE v_mode = 'list'
    )
    SELECT CASE WHEN v_mode = 'ids' THEN
      jsonb_build_object(
        'ids', COALESCE((SELECT jsonb_agg(id ORDER BY requested_order NULLS LAST, random_order NULLS LAST, year DESC NULLS LAST, id) FROM page_rows), '[]'::jsonb)
      )
    ELSE
      jsonb_build_object(
        'total', (SELECT count(*) FROM filtered),
        'rows', COALESCE((SELECT value FROM rows_json), '[]'::jsonb)
      )
    END INTO v_result;
  ELSE
    WITH answers AS MATERIALIZED (
      SELECT a.question_id, a.is_correct, a.reviewed_at, a.written_answer IS NOT NULL AS is_written
      FROM public.user_answers a
      WHERE v_needs_answers AND a.user_id = v_student_id
    ), eligible AS MATERIALIZED (
      SELECT DISTINCT ON (q.id) q.id, q.catalog_modality, q.year
      FROM public.study_question_index q
      LEFT JOIN answers a ON v_needs_answers AND a.question_id = q.id
      WHERE (v_modalities IS NULL OR q.catalog_modality = ANY(v_modalities))
        AND (v_ids IS NULL OR q.id = ANY(v_ids))
        AND (v_excluded_ids IS NULL OR q.id <> ALL(v_excluded_ids))
        AND (v_bancas IS NULL OR q.banca = ANY(v_bancas))
        AND (v_quota_bancas IS NULL OR q.banca = ANY(v_quota_bancas))
        AND (v_organizers IS NULL OR q.banca_organizadora = ANY(v_organizers)
          OR (NULLIF(q.banca_organizadora, '') IS NULL AND q.banca = ANY(v_organizer_bancas)))
        AND (v_regions IS NULL OR q.macrorregiao = ANY(v_regions)
          OR (NULLIF(q.macrorregiao, '') IS NULL AND q.banca = ANY(v_region_bancas)))
        AND (v_programs IS NULL OR (
          q.catalog_modality IN ('R+', 'Título de Especialista') AND COALESCE(
            NULLIF(q.programa_rplus, ''),
            CASE
              WHEN q.catalog_modality = 'Título de Especialista' AND q.banca ILIKE '%TEGO%' THEN 'TEGO (Ginecologia e Obstetrícia)'
              WHEN q.catalog_modality = 'Título de Especialista' AND q.banca ILIKE '%TECM%' THEN 'TECM (Clínica Médica)'
              WHEN q.catalog_modality = 'Título de Especialista' AND q.banca ILIKE '%SBOT%' THEN 'SBOT (Ortopedia)'
              WHEN q.tipo_prova ILIKE '%Mastologia%' THEN 'R+ Mastologia'
              WHEN q.tipo_prova ILIKE '%Neonatologia%' THEN 'R+ Neonatologia'
              WHEN q.tipo_prova ILIKE '%Geriatria%' THEN 'R+ Geriatria'
              WHEN q.tipo_prova ILIKE '%Intensiva%' THEN 'R+ Medicina Intensiva'
              WHEN q.tipo_prova ILIKE '%Urologia%' THEN 'R+ Urologia'
              WHEN q.tipo_prova ILIKE '%Pediatria%' THEN 'R+ Pediatria'
              WHEN q.tipo_prova ILIKE '%Ginecologia%' OR q.tipo_prova ILIKE '%Obstetrícia%' THEN 'R+ Ginecologia e Obstetrícia'
              WHEN q.tipo_prova ILIKE '%Cirurgia Geral%' THEN 'R+ Cirurgia Geral'
              WHEN q.tipo_prova ILIKE '%Clínica Médica%' THEN 'R+ Clínica Médica'
            END
          ) = ANY(v_programs)
        ))
        AND (v_years IS NULL OR q.year = ANY(v_years))
        AND (v_recent_from IS NULL OR v_years IS NOT NULL OR q.year BETWEEN v_recent_from AND v_recent_from + 4)
        AND (v_exam_types IS NULL OR q.tipo_prova = ANY(v_exam_types))
        AND (v_difficulty IS NULL OR COALESCE(NULLIF(q.difficulty, ''), 'Desconhecido') = v_difficulty)
        AND (v_formats IS NULL OR lower(btrim(q.type)) = ANY(v_formats))
        AND (v_hide_annulled IS NOT TRUE OR q.is_anulada IS NOT TRUE)
        AND (v_hide_reviewed IS NOT TRUE OR a.reviewed_at IS NULL)
        AND (v_with_image IS NOT TRUE OR q.has_image)
        AND (v_only_commented IS NOT TRUE OR q.has_gold_commentary IS TRUE)
        AND CASE v_status
          WHEN 'Não vistas' THEN a.question_id IS NULL
          WHEN 'Resolvidas' THEN a.question_id IS NOT NULL
          WHEN 'Acertadas' THEN a.is_correct IS TRUE AND NOT a.is_written
          WHEN 'Erradas' THEN a.is_correct IS FALSE AND NOT a.is_written
          WHEN 'Ainda não acertadas' THEN a.question_id IS NULL OR a.is_correct IS FALSE OR a.is_written
          ELSE true
        END
        AND (v_search_terms IS NULL OR EXISTS (
          SELECT 1 FROM unnest(v_search_terms) AS s(term)
          WHERE strpos(lower(concat_ws(E'\n', q.code, q.tema, q.foco, q.subfoco, q.sub_subfoco)), lower(s.term)) > 0
        ))
        AND (v_clinical IS NULL OR EXISTS (
          SELECT 1 FROM jsonb_array_elements(v_clinical) AS b(path)
          WHERE NOT EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(b.path) WITH ORDINALITY AS segment(value, position)
            WHERE segment.value IS NOT NULL AND segment.value IS DISTINCT FROM (ARRAY[
              CASE
                WHEN q.especialidade = 'Cirurgia' THEN 'Cirurgia Geral'
                WHEN q.especialidade = 'Medicina Preventiva' THEN 'Medicina Preventiva e Social'
                ELSE COALESCE(q.especialidade, '')
              END, COALESCE(q.tema,''), COALESCE(q.foco,''), COALESCE(q.subfoco,''), COALESCE(q.sub_subfoco,'')
            ])[segment.position::int]
          )
        ))
        AND (v_quota_clinical IS NULL OR EXISTS (
          SELECT 1 FROM jsonb_array_elements(v_quota_clinical) AS b(path)
          WHERE NOT EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(b.path) WITH ORDINALITY AS segment(value, position)
            WHERE segment.value IS NOT NULL AND segment.value IS DISTINCT FROM (ARRAY[
              CASE
                WHEN q.especialidade = 'Cirurgia' THEN 'Cirurgia Geral'
                WHEN q.especialidade = 'Medicina Preventiva' THEN 'Medicina Preventiva e Social'
                ELSE COALESCE(q.especialidade, '')
              END, COALESCE(q.tema,''), COALESCE(q.foco,''), COALESCE(q.subfoco,''), COALESCE(q.sub_subfoco,'')
            ])[segment.position::int]
          )
        ))
      ORDER BY q.id, q.catalog_modality
    ), page_rows AS MATERIALIZED (
      SELECT
        e.id,
        e.catalog_modality,
        CASE WHEN v_ids IS NOT NULL THEN array_position(v_ids, e.id) END AS requested_order,
        CASE WHEN v_randomize IS TRUE THEN random() END AS random_order,
        e.year
      FROM eligible e
      ORDER BY requested_order NULLS LAST, random_order NULLS LAST, e.year DESC NULLS LAST, e.id
      LIMIT v_size OFFSET v_offset
    ), rows_json AS (
      SELECT jsonb_agg(jsonb_build_object(
        'id', q.id, 'code', q.code, 'institution', q.institution, 'banca', q.banca, 'year', q.year,
        'tipo_prova', q.tipo_prova, 'modalidade', q.catalog_modality, 'especialidade', q.especialidade,
        'tema', q.tema, 'foco', q.foco, 'subfoco', q.subfoco, 'sub_subfoco', q.sub_subfoco,
        'difficulty', q.difficulty, 'type', q.type, 'is_anulada', q.is_anulada,
        'statement', q.statement, 'images', q.images,
        'options', COALESCE((
          SELECT jsonb_agg(jsonb_build_object('letter', opt.value->>'letter', 'text', opt.value->>'text') ORDER BY opt.position)
          FROM jsonb_array_elements(CASE WHEN jsonb_typeof(to_jsonb(q.options)) = 'array' THEN to_jsonb(q.options) ELSE '[]'::jsonb END)
            WITH ORDINALITY AS opt(value, position)
        ), '[]'::jsonb)
      ) ORDER BY p.requested_order NULLS LAST, p.random_order NULLS LAST, p.year DESC NULLS LAST, p.id) AS value
      FROM page_rows p
      CROSS JOIN LATERAL (
        SELECT * FROM public.study_question_catalog q
        WHERE q.id = p.id AND q.catalog_modality = p.catalog_modality LIMIT 1
      ) q
      WHERE v_mode = 'list'
    )
    SELECT CASE WHEN v_mode = 'ids' THEN
      jsonb_build_object(
        'ids', COALESCE((SELECT jsonb_agg(id ORDER BY requested_order NULLS LAST, random_order NULLS LAST, year DESC NULLS LAST, id) FROM page_rows), '[]'::jsonb)
      )
    ELSE
      jsonb_build_object(
        'total', (SELECT count(*) FROM eligible),
        'rows', COALESCE((SELECT value FROM rows_json), '[]'::jsonb)
      )
    END INTO v_result;
  END IF;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.query_study_questions(jsonb, text, int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.query_study_questions(jsonb, text, int, int) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
COMMIT;
