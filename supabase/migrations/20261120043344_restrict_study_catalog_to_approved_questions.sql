BEGIN;
SET LOCAL lock_timeout = '4s';
SET LOCAL statement_timeout = '5min';

LOCK TABLE public.questions_direto, public.questions_rplus, public.questions_revalida, public.questions_titulo
  IN SHARE ROW EXCLUSIVE MODE;

CREATE FUNCTION public.is_approved_study_question(
  has_answer boolean, answer text, annulled boolean, commentary text, tier text, approval text
)
RETURNS boolean
LANGUAGE sql IMMUTABLE PARALLEL SAFE
SET search_path = ''
AS $$
  SELECT CASE
    WHEN has_answer IS TRUE AND tier = 'padrao_ouro' AND approval IS NOT NULL
      AND (annulled IS TRUE OR lower(btrim(answer)) NOT IN ('', 'null'))
      AND lower(btrim(commentary)) NOT IN ('', 'null')
    THEN approval = public.study_gold_fingerprint(answer, annulled, commentary)
    ELSE false
  END;
$$;

REVOKE ALL ON FUNCTION public.is_approved_study_question(boolean, text, boolean, text, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_approved_study_question(boolean, text, boolean, text, text, text)
  TO service_role;

ALTER TABLE public.study_question_index RENAME TO study_question_index_entries;
ALTER TABLE public.study_question_index_entries ADD COLUMN is_study_approved boolean NOT NULL DEFAULT false;

CREATE VIEW public.study_question_index WITH (security_invoker = true) AS
SELECT catalog_modality, id, code, institution, banca, year, tipo_prova, especialidade, tema,
  foco, subfoco, sub_subfoco, difficulty, type, is_anulada, banca_organizadora, macrorregiao,
  programa_rplus, has_image
FROM public.study_question_index_entries
WHERE is_study_approved;

REVOKE ALL ON public.study_question_index FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE VIEW public.study_question_catalog WITH (security_invoker = true) AS
SELECT 'Acesso Direto'::text AS catalog_modality, id, code, institution, banca, year, tipo_prova,
  modalidade, especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type, is_anulada,
  statement, options, images, banca_organizadora, macrorregiao, programa_rplus
FROM public.questions_direto WHERE public.is_approved_study_question(
    has_gabarito, correct_answer, is_anulada, commentary, commentary_tier, study_gold_fingerprint
  )
UNION ALL
SELECT 'R+', id, code, institution, banca, year, tipo_prova, modalidade, especialidade, tema, foco,
  subfoco, sub_subfoco, difficulty, type, is_anulada, statement, options, images,
  banca_organizadora, macrorregiao, programa_rplus
FROM public.questions_rplus WHERE public.is_approved_study_question(
    has_gabarito, correct_answer, is_anulada, commentary, commentary_tier, study_gold_fingerprint
  )
UNION ALL
SELECT 'Revalida', id, code, institution, banca, year, tipo_prova, modalidade, especialidade, tema, foco,
  subfoco, sub_subfoco, difficulty, type, is_anulada, statement, options, images,
  banca_organizadora, macrorregiao, programa_rplus
FROM public.questions_revalida WHERE public.is_approved_study_question(
    has_gabarito, correct_answer, is_anulada, commentary, commentary_tier, study_gold_fingerprint
  )
UNION ALL
SELECT 'Título de Especialista', id, code, institution, banca, year, tipo_prova, modalidade, especialidade,
  tema, foco, subfoco, sub_subfoco, difficulty, type, is_anulada, statement, options, images,
  banca_organizadora, macrorregiao, programa_rplus
FROM public.questions_titulo WHERE public.is_approved_study_question(
    has_gabarito, correct_answer, is_anulada, commentary, commentary_tier, study_gold_fingerprint
  );

REVOKE ALL ON public.study_question_catalog FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.sync_study_question_index()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  catalog text := TG_ARGV[0];
  eligible boolean;
BEGIN
  IF TG_OP = 'TRUNCATE' THEN
    DELETE FROM public.study_question_index_entries WHERE catalog_modality = catalog;
    RETURN NULL;
  END IF;
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.study_question_index_entries WHERE catalog_modality = catalog AND id = OLD.id;
    RETURN NULL;
  END IF;
  eligible := public.is_approved_study_question(
    NEW.has_gabarito, NEW.correct_answer, NEW.is_anulada, NEW.commentary, NEW.commentary_tier,
    NEW.study_gold_fingerprint
  );
  IF TG_OP = 'UPDATE' AND (OLD.id IS DISTINCT FROM NEW.id OR NEW.has_gabarito IS NOT TRUE) THEN
    DELETE FROM public.study_question_index_entries WHERE catalog_modality = catalog AND id = OLD.id;
  END IF;
  IF NEW.has_gabarito IS TRUE THEN
    INSERT INTO public.study_question_index_entries (
      catalog_modality, id, code, institution, banca, year, tipo_prova,
      especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type, is_anulada,
      banca_organizadora, macrorregiao, programa_rplus, has_image, is_study_approved
    ) VALUES (
      catalog, NEW.id, NEW.code, NEW.institution, NEW.banca, NEW.year, NEW.tipo_prova,
      NEW.especialidade, NEW.tema, NEW.foco, NEW.subfoco, NEW.sub_subfoco, NEW.difficulty, NEW.type, NEW.is_anulada,
      NEW.banca_organizadora, NEW.macrorregiao, NEW.programa_rplus,
      CASE WHEN jsonb_typeof(to_jsonb(NEW.images)) = 'array'
        THEN jsonb_array_length(to_jsonb(NEW.images)) > 0 ELSE false END,
      eligible
    )
    ON CONFLICT (catalog_modality, id) DO UPDATE SET
      code = EXCLUDED.code, institution = EXCLUDED.institution, banca = EXCLUDED.banca,
      year = EXCLUDED.year, tipo_prova = EXCLUDED.tipo_prova, especialidade = EXCLUDED.especialidade,
      tema = EXCLUDED.tema, foco = EXCLUDED.foco, subfoco = EXCLUDED.subfoco, sub_subfoco = EXCLUDED.sub_subfoco,
      difficulty = EXCLUDED.difficulty, type = EXCLUDED.type, is_anulada = EXCLUDED.is_anulada,
      banca_organizadora = EXCLUDED.banca_organizadora, macrorregiao = EXCLUDED.macrorregiao,
      programa_rplus = EXCLUDED.programa_rplus, has_image = EXCLUDED.has_image,
      is_study_approved = EXCLUDED.is_study_approved;
  END IF;
  RETURN NULL;
END;
$$;

-- Lock question writes during the trigger swap and index reconciliation.
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
        banca_organizadora, macrorregiao, programa_rplus, commentary, commentary_tier, study_gold_fingerprint
      ON public.%I FOR EACH ROW EXECUTE FUNCTION public.sync_study_question_index(%L)',
      target.table_name, target.modality);
  END LOOP;
END;
$$;

UPDATE public.study_question_index_entries i SET is_study_approved = true
FROM public.study_question_catalog q
WHERE q.catalog_modality = i.catalog_modality AND q.id = i.id;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.study_question_index_entries)
    AND NOT EXISTS (SELECT 1 FROM public.study_question_index) THEN
    RAISE EXCEPTION 'Stage the verified gold approvals before restricting the study catalog';
  END IF;
END;
$$;

CREATE INDEX study_question_index_approved ON public.study_question_index_entries (catalog_modality, id)
WHERE is_study_approved;
ANALYZE public.study_question_index_entries;

COMMIT;
