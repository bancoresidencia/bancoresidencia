BEGIN;
SET LOCAL lock_timeout = '4s';

-- 1. Restore study_question_catalog to include all questions with has_gabarito IS TRUE
CREATE OR REPLACE VIEW public.study_question_catalog WITH (security_invoker = true) AS
SELECT 'Acesso Direto'::text AS catalog_modality, id, code, institution, banca, year, tipo_prova,
  modalidade, especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type, is_anulada,
  statement, options, images, banca_organizadora, macrorregiao, programa_rplus
FROM public.questions_direto WHERE has_gabarito IS TRUE
UNION ALL
SELECT 'R+', id, code, institution, banca, year, tipo_prova, modalidade, especialidade, tema, foco,
  subfoco, sub_subfoco, difficulty, type, is_anulada, statement, options, images,
  banca_organizadora, macrorregiao, programa_rplus
FROM public.questions_rplus WHERE has_gabarito IS TRUE
UNION ALL
SELECT 'Revalida', id, code, institution, banca, year, tipo_prova, modalidade, especialidade, tema, foco,
  subfoco, sub_subfoco, difficulty, type, is_anulada, statement, options, images,
  banca_organizadora, macrorregiao, programa_rplus
FROM public.questions_revalida WHERE has_gabarito IS TRUE
UNION ALL
SELECT 'Título de Especialista', id, code, institution, banca, year, tipo_prova, modalidade, especialidade,
  tema, foco, subfoco, sub_subfoco, difficulty, type, is_anulada, statement, options, images,
  banca_organizadora, macrorregiao, programa_rplus
FROM public.questions_titulo WHERE has_gabarito IS TRUE;

REVOKE ALL ON public.study_question_catalog FROM PUBLIC, anon, authenticated;

-- 2. Restore study_question_index to table of all entries
DROP VIEW IF EXISTS public.study_question_index CASCADE;
ALTER TABLE public.study_question_index_entries RENAME TO study_question_index;
ALTER TABLE public.study_question_index DROP COLUMN IF EXISTS is_study_approved;

-- Purge historical entries without official answer so index matches catalog 1:1
DELETE FROM public.study_question_index i
WHERE NOT EXISTS (
  SELECT 1 FROM public.study_question_catalog q
  WHERE q.catalog_modality = i.catalog_modality AND q.id = i.id
);

-- 3. Restore sync_study_question_index trigger function
CREATE OR REPLACE FUNCTION public.sync_study_question_index()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE catalog text := TG_ARGV[0];
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
    INSERT INTO public.study_question_index (
      catalog_modality, id, code, institution, banca, year, tipo_prova,
      especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type, is_anulada,
      banca_organizadora, macrorregiao, programa_rplus, has_image
    ) VALUES (
      catalog, NEW.id, NEW.code, NEW.institution, NEW.banca, NEW.year, NEW.tipo_prova,
      NEW.especialidade, NEW.tema, NEW.foco, NEW.subfoco, NEW.sub_subfoco, NEW.difficulty, NEW.type, NEW.is_anulada,
      NEW.banca_organizadora, NEW.macrorregiao, NEW.programa_rplus,
      CASE WHEN jsonb_typeof(to_jsonb(NEW.images)) = 'array'
        THEN jsonb_array_length(to_jsonb(NEW.images)) > 0 ELSE false END
    )
    ON CONFLICT (catalog_modality, id) DO UPDATE SET
      code = EXCLUDED.code, institution = EXCLUDED.institution, banca = EXCLUDED.banca,
      year = EXCLUDED.year, tipo_prova = EXCLUDED.tipo_prova, especialidade = EXCLUDED.especialidade,
      tema = EXCLUDED.tema, foco = EXCLUDED.foco, subfoco = EXCLUDED.subfoco, sub_subfoco = EXCLUDED.sub_subfoco,
      difficulty = EXCLUDED.difficulty, type = EXCLUDED.type, is_anulada = EXCLUDED.is_anulada,
      banca_organizadora = EXCLUDED.banca_organizadora, macrorregiao = EXCLUDED.macrorregiao,
      programa_rplus = EXCLUDED.programa_rplus, has_image = EXCLUDED.has_image;
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
        banca_organizadora, macrorregiao, programa_rplus
      ON public.%I FOR EACH ROW EXECUTE FUNCTION public.sync_study_question_index(%L)',
      target.table_name, target.modality);
  END LOOP;
END;
$$;

-- 4. Re-create query_study_questions function in case CASCADE dropped it
CREATE OR REPLACE FUNCTION public.query_study_questions(
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_mode text DEFAULT 'list',
  p_page int DEFAULT 1,
  p_size int DEFAULT 20
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
SET statement_timeout = '12s'
AS $$
  WITH criteria AS MATERIALIZED (
    SELECT f.*, auth.uid() AS student_id
    FROM jsonb_to_record(COALESCE(p_filters, '{}'::jsonb)) AS f(
      modalities text[], ids text[], excluded_ids text[], bancas text[], quota_bancas text[],
      organizers text[], organizer_bancas text[], regions text[], region_bancas text[],
      programs text[], years int[], exam_types text[], difficulty text, formats text[],
      status text, hide_annulled boolean, hide_reviewed boolean, with_image boolean,
      search_terms text[], clinical jsonb, quota_clinical jsonb, randomize boolean,
      recent_from int
    )
  ), answers AS MATERIALIZED (
    SELECT a.question_id, a.is_correct, a.reviewed_at, a.written_answer IS NOT NULL AS is_written
    FROM public.user_answers a
    CROSS JOIN criteria c
    WHERE a.user_id = c.student_id AND (
      (c.status IS NOT NULL AND c.status <> 'Todas') OR c.hide_reviewed IS TRUE
    ) AND p_mode <> 'catalog'
  ), matching AS (
    SELECT q.id, q.catalog_modality, q.year, q.banca, paths.path
    FROM public.study_question_index q
    CROSS JOIN criteria c
    CROSS JOIN LATERAL (SELECT ARRAY[
      CASE
        WHEN q.especialidade = 'Cirurgia' THEN 'Cirurgia Geral'
        WHEN q.especialidade = 'Medicina Preventiva' THEN 'Medicina Preventiva e Social'
        ELSE COALESCE(q.especialidade, '')
      END, COALESCE(q.tema,''), COALESCE(q.foco,''), COALESCE(q.subfoco,''), COALESCE(q.sub_subfoco,'')
    ] AS path) paths
    LEFT JOIN answers a ON a.question_id = q.id
    WHERE (c.modalities IS NULL OR q.catalog_modality = ANY(c.modalities))
      AND (p_mode = 'catalog' OR (
        (c.ids IS NULL OR q.id = ANY(c.ids))
        AND (c.excluded_ids IS NULL OR q.id <> ALL(c.excluded_ids))
        AND (c.bancas IS NULL OR q.banca = ANY(c.bancas))
        AND (c.quota_bancas IS NULL OR q.banca = ANY(c.quota_bancas))
        AND (c.organizers IS NULL OR q.banca_organizadora = ANY(c.organizers)
          OR (NULLIF(q.banca_organizadora, '') IS NULL AND q.banca = ANY(c.organizer_bancas)))
        AND (c.regions IS NULL OR q.macrorregiao = ANY(c.regions)
          OR (NULLIF(q.macrorregiao, '') IS NULL AND q.banca = ANY(c.region_bancas)))
        AND (c.programs IS NULL OR (
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
          ) = ANY(c.programs)
        ))
        AND (c.years IS NULL OR q.year = ANY(c.years))
        AND (c.recent_from IS NULL OR c.years IS NOT NULL OR q.year BETWEEN c.recent_from AND c.recent_from + 4)
        AND (c.exam_types IS NULL OR q.tipo_prova = ANY(c.exam_types))
        AND (c.difficulty IS NULL OR COALESCE(NULLIF(q.difficulty, ''), 'Desconhecido') = c.difficulty)
        AND (c.formats IS NULL OR lower(btrim(q.type)) = ANY(c.formats))
        AND (c.hide_annulled IS NOT TRUE OR q.is_anulada IS NOT TRUE)
        AND (c.hide_reviewed IS NOT TRUE OR a.reviewed_at IS NULL)
        AND (c.with_image IS NOT TRUE OR q.has_image)
        AND CASE c.status
          WHEN 'Não vistas' THEN a.question_id IS NULL
          WHEN 'Resolvidas' THEN a.question_id IS NOT NULL
          WHEN 'Acertadas' THEN a.is_correct IS TRUE AND NOT a.is_written
          WHEN 'Erradas' THEN a.is_correct IS FALSE AND NOT a.is_written
          WHEN 'Ainda não acertadas' THEN a.question_id IS NULL OR a.is_correct IS FALSE OR a.is_written
          ELSE true
        END
        AND (c.search_terms IS NULL OR EXISTS (
          SELECT 1 FROM unnest(c.search_terms) AS s(term)
          WHERE strpos(lower(concat_ws(E'\n', q.code, q.tema, q.foco, q.subfoco, q.sub_subfoco)), lower(s.term)) > 0
        ))
        AND (p_mode = 'facets' OR c.clinical IS NULL OR EXISTS (
          SELECT 1 FROM jsonb_array_elements(c.clinical) AS b(path)
          WHERE NOT EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(b.path) WITH ORDINALITY AS segment(value, position)
            WHERE segment.value IS NOT NULL AND segment.value IS DISTINCT FROM paths.path[segment.position::int]
          )
        ))
        AND (c.quota_clinical IS NULL OR EXISTS (
          SELECT 1 FROM jsonb_array_elements(c.quota_clinical) AS b(path)
          WHERE NOT EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(b.path) WITH ORDINALITY AS segment(value, position)
            WHERE segment.value IS NOT NULL AND segment.value IS DISTINCT FROM paths.path[segment.position::int]
          )
        ))
      ))
  ), eligible AS MATERIALIZED (
    SELECT DISTINCT ON (id) id, catalog_modality, year, banca, path
    FROM matching ORDER BY id, catalog_modality
  ), page_rows AS MATERIALIZED (
    SELECT e.id, e.catalog_modality,
      CASE WHEN c.ids IS NOT NULL THEN array_position(c.ids, e.id) END AS requested_order,
      CASE WHEN c.randomize IS TRUE THEN random() END AS random_order,
      e.year
    FROM eligible e CROSS JOIN criteria c
    WHERE p_mode IN ('list', 'ids')
    ORDER BY requested_order NULLS LAST, random_order NULLS LAST, e.year DESC NULLS LAST, e.id
    LIMIT CASE WHEN p_mode = 'ids' THEN least(greatest(p_size, 1), 200)
      ELSE least(greatest(p_size, 1), 50) END
    OFFSET (greatest(least(p_page, 100000), 1)::bigint - 1) * least(greatest(p_size, 1), 50)
  ), facet_groups AS (
    SELECT array_to_string(ARRAY[path[1], path[2], path[3], path[4], path[5]], chr(31)) AS key,
      count(*) AS count
    FROM eligible
    WHERE p_mode = 'facets'
    GROUP BY ROLLUP (path[1], path[2], path[3], path[4], path[5])
    HAVING GROUPING(path[1]) = 0 AND COALESCE(path[5], path[4], path[3], path[2], 'root') <> ''
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
    WHERE p_mode = 'list'
  )
  SELECT CASE p_mode
    WHEN 'catalog' THEN jsonb_build_object(
      'total', (SELECT count(*) FROM eligible),
      'bancas', COALESCE((SELECT jsonb_object_agg(banca, count) FROM (
        SELECT banca, count(*) AS count FROM eligible WHERE NULLIF(banca, '') IS NOT NULL GROUP BY banca
      ) b), '{}'::jsonb),
      'years', COALESCE((SELECT jsonb_agg(year ORDER BY year DESC) FROM (
        SELECT DISTINCT year FROM eligible WHERE year IS NOT NULL
      ) y), '[]'::jsonb)
    )
    WHEN 'facets' THEN jsonb_build_object(
      'totalRightCardCount', (SELECT count(*) FROM eligible),
      'paths', COALESCE((SELECT jsonb_object_agg(key, count) FROM facet_groups), '{}'::jsonb)
    )
    WHEN 'ids' THEN jsonb_build_object(
      'ids', COALESCE((SELECT jsonb_agg(id ORDER BY requested_order NULLS LAST, random_order NULLS LAST, year DESC NULLS LAST, id)
        FROM page_rows), '[]'::jsonb)
    )
    WHEN 'list' THEN jsonb_build_object('total', (SELECT count(*) FROM eligible),
      'rows', COALESCE((SELECT value FROM rows_json), '[]'::jsonb))
    ELSE NULL
  END;
$$;

REVOKE ALL ON FUNCTION public.query_study_questions(jsonb, text, int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.query_study_questions(jsonb, text, int, int) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
COMMIT;
