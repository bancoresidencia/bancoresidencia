BEGIN;
SET LOCAL lock_timeout = '4s';
SET LOCAL statement_timeout = '10min';

-- ============================================================================
-- SELO ABSOLUTO DE COMENTÁRIO PADRÃO OURO (BANCO RESIDÊNCIA)
-- ============================================================================
-- Classificação determinística e unificada em 3 níveis:
--   * 'padrao_ouro'       : Has gabarito + corpo analítico + Principal Motivo de Erro
--                           + Take-Home Message + (Discursiva OU 100% N/N justificativas
--                           OU Lote 1B preservado com 0/N justificativas e 3 pilares),
--                           sem placeholders, saudações legadas, JSON bruto ou HTML.
--   * 'comentada_parcial' : Possui texto ou justificativa parcial sem completar os critérios Ouro.
--   * 'nao_comentada'     : Sem comentário e sem justificativas válidas.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.classify_commentary_tier(
  p_commentary text,
  p_options jsonb DEFAULT NULL,
  p_type text DEFAULT NULL,
  p_has_gabarito boolean DEFAULT true
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $$
DECLARE
  v_comm text := btrim(COALESCE(p_commentary, ''));
  v_low text;
  v_opt_count integer := 0;
  v_valid_expl integer := 0;
  v_is_disc boolean := false;
  v_is_json boolean := false;
  v_is_placeholder boolean := false;
  v_is_greeting boolean := false;
  v_has_html boolean := false;
  v_has_th boolean := false;
  v_has_pe boolean := false;
  v_has_body boolean := false;
  v_opts_ok boolean := false;
BEGIN
  IF p_options IS NOT NULL AND jsonb_typeof(p_options) = 'array' THEN
    v_opt_count := jsonb_array_length(p_options);
    SELECT count(*)::integer INTO v_valid_expl
    FROM jsonb_array_elements(p_options) AS opt
    WHERE length(btrim(COALESCE(opt->>'explanation', ''))) >= 15
      AND lower(COALESCE(opt->>'explanation', '')) !~* '(comentario em elaboracao|comentário em elaboração|em construcao|em construção|aguardando revisao|aguardando revisão|placeholder|lorem ipsum|todo:|fixme|\ynull\y|nao informado|não informado)';
  END IF;

  v_is_disc := (v_opt_count = 0) OR (lower(COALESCE(p_type, '')) ~ '(discurs|dissert|aberta)');

  IF v_comm = '' THEN
    IF v_valid_expl > 0 THEN
      RETURN 'comentada_parcial';
    END IF;
    RETURN 'nao_comentada';
  END IF;

  v_low := lower(v_comm);

  v_is_json := left(v_comm, 1) = '{'
    AND (v_comm ~* '"_id"|"statementComment"|"commentary"|"takeHomeMessage"|"finalCommentary"');

  v_is_placeholder := v_low ~* '(comentario em elaboracao|comentário em elaboração|em construcao|em construção|aguardando revisao|aguardando revisão|placeholder|lorem ipsum|todo:|fixme|gabarito não disponibilizado|gabarito nao disponibilizado|padrão de resposta não disponível|padrao de resposta nao disponivel|questão anulada sem comentário|nao informado|não informado)';

  v_is_greeting := v_low ~* '^\s*(ol[aá]|car[oa]\s+estudante|prezad[oa]|bem[- ]vindo|vamos\s+analisar|oi[,!\s])';

  v_has_html := (v_comm ~* '</?(p|br|div|span|strong|b|i|em|u|ul|ol|li|h[1-6]|table|thead|tbody|tr|td|th|sup|sub|blockquote|hr|a|img)([[:space:]][^>]*)?>');

  IF v_is_json OR v_is_placeholder OR v_is_greeting OR v_has_html THEN
    RETURN 'comentada_parcial';
  END IF;

  v_has_th := (v_comm ~* '(take[- ]?home(\s*message)?|takehome|mensagem[- ]?chave|p[eé]rola\s+(pr[aá]tica|cl[ií]nica|de\s+prova)|clinical\s+pearl)');
  v_has_pe := (v_comm ~* '(principal\s+motivo\s+(de\s+erro|do\s+erro|que\s+leva\s+ao\s+erro)|principal\s+erro|motivo\s+(de|do)\s+erro|armadilha\s+da\s+quest[aã]o|pegadinha\s+de\s+prova|onde\s+o\s+aluno\s+costuma\s+errar)');
  v_has_body := (length(v_comm) >= 120)
    AND (
      length(regexp_replace(v_comm, '\s+', ' ', 'g')) >= 160
      OR v_comm ~* '(coment[aá]rio\s+final|s[ií]ntese\s+cl[ií]nica|racioc[ií]nio\s+cl[ií]nico|an[aá]lise\s+da\s+quest[aã]o)'
    );

  IF v_is_disc THEN
    v_opts_ok := true;
  ELSIF v_opt_count >= 2 THEN
    v_opts_ok := (v_valid_expl = v_opt_count) OR (v_valid_expl = 0);
  ELSE
    v_opts_ok := false;
  END IF;

  IF p_has_gabarito IS TRUE AND v_has_body AND v_has_th AND v_has_pe AND v_opts_ok THEN
    RETURN 'padrao_ouro';
  END IF;

  IF length(v_comm) >= 20 OR v_valid_expl > 0 THEN
    RETURN 'comentada_parcial';
  END IF;

  RETURN 'nao_comentada';
END;
$$;

CREATE OR REPLACE FUNCTION public.is_gold_standard_commentary(
  p_commentary text,
  p_options jsonb DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $$
  SELECT public.classify_commentary_tier(p_commentary, p_options, NULL, true) = 'padrao_ouro';
$$;

CREATE OR REPLACE FUNCTION public.is_gold_standard_commentary(
  p_commentary text,
  p_options jsonb,
  p_type text,
  p_has_gabarito boolean
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $$
  SELECT public.classify_commentary_tier(p_commentary, p_options, p_type, p_has_gabarito) = 'padrao_ouro';
$$;

REVOKE ALL ON FUNCTION public.classify_commentary_tier(text, jsonb, text, boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_gold_standard_commentary(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_gold_standard_commentary(text, jsonb, text, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.classify_commentary_tier(text, jsonb, text, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_gold_standard_commentary(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_gold_standard_commentary(text, jsonb, text, boolean) TO service_role;

-- 2. Trigger BEFORE INSERT/UPDATE nas 4 tabelas canônicas: mantém commentary_tier e study_gold_fingerprint
--    100% determinísticos e impossíveis de dessincronizar.
CREATE OR REPLACE FUNCTION public.enforce_gold_commentary_seal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_tier text;
BEGIN
  v_tier := public.classify_commentary_tier(NEW.commentary, to_jsonb(NEW.options), NEW.type, NEW.has_gabarito);
  NEW.commentary_tier := v_tier;
  IF v_tier = 'padrao_ouro' THEN
    NEW.study_gold_fingerprint := public.study_gold_fingerprint(NEW.correct_answer, NEW.is_anulada, NEW.commentary);
  ELSE
    NEW.study_gold_fingerprint := NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Atualiza sync_study_question_index para usar o validador de 4 argumentos (inclui type e has_gabarito)
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
    is_gold := public.is_gold_standard_commentary(NEW.commentary, to_jsonb(NEW.options), NEW.type, NEW.has_gabarito);
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

-- 4. Anexa triggers nas 4 tabelas canônicas (enforce_gold_commentary_seal BEFORE + sync_study_question_index AFTER)
DO $$
DECLARE target record;
BEGIN
  FOR target IN SELECT * FROM (VALUES
    ('questions_direto','Acesso Direto'), ('questions_rplus','R+'),
    ('questions_revalida','Revalida'), ('questions_titulo','Título de Especialista')
  ) AS sources(table_name, modality)
  LOOP
    EXECUTE format('CREATE OR REPLACE TRIGGER enforce_gold_commentary_seal
      BEFORE INSERT OR UPDATE OF commentary, options, type, has_gabarito, correct_answer, is_anulada
      ON public.%I FOR EACH ROW EXECUTE FUNCTION public.enforce_gold_commentary_seal()',
      target.table_name);

    EXECUTE format('CREATE OR REPLACE TRIGGER sync_study_question_index
      AFTER INSERT OR DELETE OR UPDATE OF id, code, institution, banca, year, tipo_prova, especialidade,
        tema, foco, subfoco, sub_subfoco, difficulty, type, images, is_anulada, has_gabarito, correct_answer,
        banca_organizadora, macrorregiao, programa_rplus, commentary, options
      ON public.%I FOR EACH ROW EXECUTE FUNCTION public.sync_study_question_index(%L)',
      target.table_name, target.modality);
  END LOOP;
END;
$$;

-- 5. Backfill idempotente em blocos (apenas registros divergentes)
DO $$
DECLARE tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'questions_titulo', 'questions_revalida', 'questions_rplus', 'questions_direto'
  ] LOOP
    EXECUTE format($upd$
      UPDATE public.%I q
      SET
        commentary_tier = calc.tier,
        study_gold_fingerprint = CASE
          WHEN calc.tier = 'padrao_ouro'
          THEN public.study_gold_fingerprint(q.correct_answer, q.is_anulada, q.commentary)
          ELSE NULL
        END
      FROM (
        SELECT id, public.classify_commentary_tier(commentary, to_jsonb(options), type, has_gabarito) AS tier
        FROM public.%I
      ) calc
      WHERE q.id = calc.id
        AND (
          q.commentary_tier IS DISTINCT FROM calc.tier
          OR (
            calc.tier = 'padrao_ouro'
            AND q.study_gold_fingerprint IS DISTINCT FROM public.study_gold_fingerprint(q.correct_answer, q.is_anulada, q.commentary)
          )
          OR (calc.tier <> 'padrao_ouro' AND q.study_gold_fingerprint IS NOT NULL)
        );
    $upd$, tbl, tbl);
  END LOOP;
END;
$$;

-- 6. Sincroniza study_question_index.has_gold_commentary com o commentary_tier das 4 tabelas
UPDATE public.study_question_index i
SET has_gold_commentary = (q.commentary_tier = 'padrao_ouro')
FROM public.questions_titulo q
WHERE i.catalog_modality = 'Título de Especialista'
  AND i.id = q.id
  AND i.has_gold_commentary IS DISTINCT FROM (q.commentary_tier = 'padrao_ouro');

UPDATE public.study_question_index i
SET has_gold_commentary = (q.commentary_tier = 'padrao_ouro')
FROM public.questions_revalida q
WHERE i.catalog_modality = 'Revalida'
  AND i.id = q.id
  AND i.has_gold_commentary IS DISTINCT FROM (q.commentary_tier = 'padrao_ouro');

UPDATE public.study_question_index i
SET has_gold_commentary = (q.commentary_tier = 'padrao_ouro')
FROM public.questions_rplus q
WHERE i.catalog_modality = 'R+'
  AND i.id = q.id
  AND i.has_gold_commentary IS DISTINCT FROM (q.commentary_tier = 'padrao_ouro');

UPDATE public.study_question_index i
SET has_gold_commentary = (q.commentary_tier = 'padrao_ouro')
FROM public.questions_direto q
WHERE i.catalog_modality = 'Acesso Direto'
  AND i.id = q.id
  AND i.has_gold_commentary IS DISTINCT FROM (q.commentary_tier = 'padrao_ouro');

ANALYZE public.study_question_index;

NOTIFY pgrst, 'reload schema';
COMMIT;
