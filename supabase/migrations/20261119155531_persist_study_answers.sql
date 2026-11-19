BEGIN;
SET LOCAL lock_timeout = '3s';

CREATE TABLE public.study_answer_submissions (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_id uuid NOT NULL,
  question_id text NOT NULL,
  answered_at timestamptz NOT NULL,
  PRIMARY KEY (user_id, attempt_id)
);
ALTER TABLE public.study_answer_submissions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.study_answer_submissions FROM PUBLIC, anon, authenticated;

CREATE FUNCTION public.persist_study_answer(
  p_student_id uuid,
  p_question_id text,
  p_attempt_id uuid,
  p_answer jsonb,
  p_daily_limit int DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  previous_submission public.study_answer_submissions%ROWTYPE;
  answered_at timestamptz;
  day_start timestamptz;
  answer_letter text := p_answer->>'selected_option';
  written_answer text := p_answer->>'written_answer';
  correct boolean := COALESCE((p_answer->>'is_correct')::boolean, false);
  reviewed boolean := COALESCE((p_answer->>'reviewed')::boolean, false);
  attempt jsonb;
BEGIN
  -- The same lock is used by the legacy answer-integrity trigger for quota checks.
  PERFORM pg_advisory_xact_lock(hashtext('ua_quota_guard_' || p_student_id::text));

  SELECT * INTO previous_submission FROM public.study_answer_submissions s
  WHERE s.user_id = p_student_id AND s.attempt_id = p_attempt_id;
  IF FOUND THEN
    IF previous_submission.question_id <> p_question_id THEN
      RAISE EXCEPTION 'Identificador de tentativa pertence a outra questão' USING ERRCODE = '22023';
    END IF;
    RETURN jsonb_build_object('answered_at', previous_submission.answered_at, 'accepted', true);
  END IF;

  answered_at := clock_timestamp();
  day_start := date_trunc('day', answered_at, 'UTC');
  IF p_daily_limit IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.user_answers a
    WHERE a.user_id = p_student_id AND a.question_id = p_question_id AND a.answered_at >= day_start
  ) AND (
    SELECT count(*) FROM public.user_answers a
    WHERE a.user_id = p_student_id AND a.answered_at >= day_start
  ) >= p_daily_limit THEN
    RETURN jsonb_build_object('accepted', false);
  END IF;

  attempt := CASE WHEN written_answer IS NULL THEN jsonb_build_array(jsonb_build_object(
    'letter', answer_letter, 'isCorrect', correct, 'timestamp', FLOOR(EXTRACT(epoch FROM answered_at) * 1000)
  )) ELSE '[]'::jsonb END;

  INSERT INTO public.user_answers AS a (
    user_id, question_id, selected_option, is_correct, answered_at,
    specialty, tema, foco, subfoco, difficulty, banca, year,
    status_retrial, attempts, student_notes, error_reason, reviewed_at, written_answer
  ) VALUES (
    p_student_id, p_question_id, COALESCE(answer_letter, ''), correct, answered_at,
    p_answer->>'specialty', p_answer->>'tema', p_answer->>'foco', p_answer->>'subfoco',
    p_answer->>'difficulty', p_answer->>'banca', (p_answer->>'year')::int,
    CASE WHEN written_answer IS NOT NULL THEN NULL WHEN NOT correct THEN 'pendente' END,
    attempt, p_answer->>'student_notes', p_answer->>'error_reason',
    CASE WHEN reviewed THEN answered_at END, written_answer
  )
  ON CONFLICT (user_id, question_id) DO UPDATE SET
    selected_option = EXCLUDED.selected_option,
    is_correct = EXCLUDED.is_correct,
    answered_at = EXCLUDED.answered_at,
    specialty = EXCLUDED.specialty,
    tema = EXCLUDED.tema,
    foco = EXCLUDED.foco,
    subfoco = EXCLUDED.subfoco,
    difficulty = EXCLUDED.difficulty,
    banca = EXCLUDED.banca,
    year = EXCLUDED.year,
    student_notes = COALESCE(EXCLUDED.student_notes, a.student_notes),
    error_reason = COALESCE(EXCLUDED.error_reason, a.error_reason),
    reviewed_at = COALESCE(EXCLUDED.reviewed_at, a.reviewed_at),
    written_answer = EXCLUDED.written_answer,
    status_retrial = CASE
      WHEN EXCLUDED.written_answer IS NOT NULL THEN NULL
      WHEN NOT EXCLUDED.is_correct THEN 'pendente'
      WHEN a.status_retrial IN ('pendente', 'recuperado') AND a.written_answer IS NULL THEN 'recuperado'
    END,
    attempts = (
      SELECT COALESCE(jsonb_agg(item.value ORDER BY item.position), '[]'::jsonb)
      FROM (
        SELECT value, position
        FROM jsonb_array_elements(CASE WHEN jsonb_typeof(a.attempts) = 'array' THEN a.attempts ELSE '[]'::jsonb END
          || EXCLUDED.attempts) WITH ORDINALITY AS entries(value, position)
        ORDER BY position DESC LIMIT 30
      ) item
    );

  INSERT INTO public.study_answer_submissions (user_id, attempt_id, question_id, answered_at)
  VALUES (p_student_id, p_attempt_id, p_question_id, answered_at);
  RETURN jsonb_build_object('answered_at', answered_at, 'accepted', true);
END;
$$;

REVOKE ALL ON FUNCTION public.persist_study_answer(uuid, text, uuid, jsonb, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.persist_study_answer(uuid, text, uuid, jsonb, int) TO service_role;

COMMIT;
