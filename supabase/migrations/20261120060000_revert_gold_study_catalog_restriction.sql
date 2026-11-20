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

-- 2. Restore study_question_index to table or view of all entries
DROP VIEW IF EXISTS public.study_question_index CASCADE;
ALTER TABLE public.study_question_index_entries RENAME TO study_question_index;
ALTER TABLE public.study_question_index DROP COLUMN IF EXISTS is_study_approved;

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

NOTIFY pgrst, 'reload schema';
COMMIT;
