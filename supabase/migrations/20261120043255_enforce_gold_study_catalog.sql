BEGIN;
SET LOCAL lock_timeout = '4s';

DO $$
DECLARE question_table text;
BEGIN
  FOREACH question_table IN ARRAY ARRAY[
    'questions_direto', 'questions_rplus', 'questions_revalida', 'questions_titulo'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS commentary_tier text,
      ADD COLUMN study_gold_fingerprint text', question_table);
  END LOOP;
END;
$$;

-- Bind the approval to the published resolution and its official answer.
CREATE FUNCTION public.study_gold_fingerprint(answer text, annulled boolean, commentary text)
RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE
SET search_path = ''
AS $$
  SELECT encode(sha256(convert_to(jsonb_build_array(
    upper(btrim(answer)), annulled IS TRUE, commentary
  )::text, 'UTF8')), 'hex');
$$;

CREATE FUNCTION public.stage_study_gold_approvals(p_modality text, p_candidates jsonb)
RETURNS TABLE (question_id text, result text)
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE question_table text := CASE p_modality
  WHEN 'Acesso Direto' THEN 'questions_direto'
  WHEN 'R+' THEN 'questions_rplus'
  WHEN 'Revalida' THEN 'questions_revalida'
  WHEN 'Título de Especialista' THEN 'questions_titulo'
END;
BEGIN
  IF question_table IS NULL OR jsonb_typeof(p_candidates) IS DISTINCT FROM 'array'
      OR jsonb_array_length(p_candidates) > 500 THEN
    RAISE EXCEPTION 'Invalid gold approval batch' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY EXECUTE format($batch$
    WITH candidates AS MATERIALIZED (
      SELECT * FROM jsonb_to_recordset($1)
        AS c(id text, answer text, annulled boolean, commentary_hash text)
    ), checked AS MATERIALIZED (
      SELECT c.id, CASE
        WHEN q.id IS NULL THEN 'missing'
        WHEN q.has_gabarito IS NOT TRUE THEN 'unapproved_answer'
        WHEN (q.is_anulada IS TRUE) IS DISTINCT FROM c.annulled
          OR (q.is_anulada IS NOT TRUE AND upper(btrim(q.correct_answer)) IS DISTINCT FROM c.answer)
          THEN 'different_answer'
        WHEN q.commentary IS NULL OR btrim(q.commentary) = ''
          OR encode(sha256(convert_to(q.commentary, 'UTF8')), 'hex') IS DISTINCT FROM c.commentary_hash
          THEN 'different_commentary'
        WHEN q.commentary_tier = 'padrao_ouro' AND
          q.study_gold_fingerprint = public.study_gold_fingerprint(q.correct_answer, q.is_anulada, q.commentary)
          THEN 'already_approved'
        ELSE 'verified'
      END AS status
      FROM candidates c LEFT JOIN public.%1$I q ON q.id = c.id
    ), updated AS (
      UPDATE public.%1$I q SET commentary_tier = 'padrao_ouro',
        study_gold_fingerprint = public.study_gold_fingerprint(q.correct_answer, q.is_anulada, q.commentary)
      FROM candidates c JOIN checked k USING (id)
      WHERE q.id = c.id AND k.status = 'verified' AND q.has_gabarito IS TRUE
        AND (q.is_anulada IS TRUE) = c.annulled
        AND (q.is_anulada IS TRUE OR upper(btrim(q.correct_answer)) = c.answer)
        AND encode(sha256(convert_to(q.commentary, 'UTF8')), 'hex') = c.commentary_hash
        AND (q.commentary_tier, q.study_gold_fingerprint) IS DISTINCT FROM
          ('padrao_ouro'::text, public.study_gold_fingerprint(q.correct_answer, q.is_anulada, q.commentary))
      RETURNING q.id
    )
    SELECT k.id, CASE WHEN u.id IS NOT NULL THEN 'approved'
      WHEN k.status = 'verified' THEN 'concurrent_change' ELSE k.status END
    FROM checked k LEFT JOIN updated u USING (id)
  $batch$, question_table) USING p_candidates;
END;
$$;

REVOKE ALL ON FUNCTION public.study_gold_fingerprint(text, boolean, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.stage_study_gold_approvals(text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.study_gold_fingerprint(text, boolean, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.stage_study_gold_approvals(text, jsonb) TO service_role;

NOTIFY pgrst, 'reload schema';
COMMIT;
