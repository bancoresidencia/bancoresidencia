-- Run on an isolated PostgreSQL database with the study catalog, answer and index migrations.
BEGIN;

INSERT INTO auth.users (id) VALUES
  ('8bdab4f0-83dc-4aab-a8ea-57949266ffa1'), ('8bdab4f0-83dc-4aab-a8ea-57949266ffa2');

INSERT INTO public.questions_direto (
  id, code, banca, year, especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type, is_anulada,
  has_gabarito, images, statement, options, correct_answer, commentary, banca_organizadora, macrorregiao
) VALUES
  ('study-qa-1', 'study-qa-1', 'ENARE', 2026, 'Pediatria', 'Tema A', 'Foco compartilhado', 'Subfoco', 'Detalhe',
   'Fácil', 'Dissertativa', false, true, '["imagem.webp"]', 'Questão sintética', '[]', 'A', 'Privado', 'FGV', 'Sudeste'),
  ('study-qa-2', 'study-qa-2', 'ENARE', 2026, 'Clínica Médica', 'Tema B', 'Foco compartilhado', 'Subfoco', 'Detalhe',
   'Médio', 'Discursiva', false, true, '[]', 'Questão sintética', '[]', 'A', 'Privado', 'FGV', 'Sudeste'),
  ('study-qa-3', 'study-qa-3', 'USP-SP', 2027, 'Pediatria', 'Tema A', 'Outro foco', 'Subfoco', 'Detalhe',
   'Fácil', 'Certo e Errado', true, true, '[]', 'Questão sintética',
   '[{"letter":"A","text":"Texto","explanation":"Privado"}]', 'ANULADA', 'Privado', 'FUVEST', 'Sudeste'),
  ('study-qa-4', 'study-qa-4', 'ENARE', 2026, 'Pediatria', 'Tema A', 'Foco compartilhado', 'Subfoco', 'Detalhe',
   'Fácil', 'Dissertativa', false, false, '[]', 'Registro não publicado', '[]', 'A', 'Privado', 'FGV', 'Sudeste');

INSERT INTO public.questions_revalida
  (id, code, banca, year, especialidade, tema, difficulty, type, has_gabarito, statement)
VALUES ('study-qa-r', 'study-qa-r', 'INEP Revalida', 2022, 'Pediatria', 'Tema A', 'Médio', 'Múltipla escolha', true, 'Questão');

-- History larger than the old 1,000-ID cap, both on and off the current filter.
INSERT INTO public.questions_direto (id, code, banca, year, especialidade, has_gabarito, statement)
SELECT 'study-qa-history-' || n, 'study-qa-history-' || n, 'Outra banca', 2024, 'Pediatria', true, 'Questão'
FROM generate_series(1, 1002) n;
INSERT INTO public.user_answers (user_id, question_id, selected_option, is_correct)
SELECT '8bdab4f0-83dc-4aab-a8ea-57949266ffa1', 'study-qa-history-' || n, 'B', true
FROM generate_series(1, 1002) n;

DO $$
DECLARE first_submission jsonb;
BEGIN
  first_submission := public.persist_study_answer(
    '8bdab4f0-83dc-4aab-a8ea-57949266ffa1', 'study-qa-3',
    '2051d11a-340d-49ad-a96d-bf3cf110b4bf', '{"selected_option":"A","is_correct":true,"reviewed":true}');
  IF first_submission IS DISTINCT FROM public.persist_study_answer(
    '8bdab4f0-83dc-4aab-a8ea-57949266ffa1', 'study-qa-3',
    '2051d11a-340d-49ad-a96d-bf3cf110b4bf', '{"selected_option":"A","is_correct":true,"reviewed":true}') THEN
    RAISE EXCEPTION 'Retry of a successful answer changed its timestamp';
  END IF;
  IF (SELECT jsonb_array_length(attempts) FROM public.user_answers WHERE question_id = 'study-qa-3') <> 1 THEN
    RAISE EXCEPTION 'Retry created a duplicate attempt';
  END IF;
  PERFORM public.persist_study_answer(
    '8bdab4f0-83dc-4aab-a8ea-57949266ffa1', 'study-qa-1',
    '52371b67-6352-482a-abbc-1828687e06ae', '{"written_answer":"Texto do aluno"}');
END;
$$;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '8bdab4f0-83dc-4aab-a8ea-57949266ffa1', true);

DO $$
DECLARE result jsonb;
BEGIN
  result := public.query_study_questions('{"modalities":["Acesso Direto"],"bancas":["ENARE"],"years":[2026],
    "formats":["discursiva","dissertativa"],"with_image":true,
    "clinical":[["Pediatria","Tema A","Foco compartilhado","Subfoco","Detalhe"]]}');
  IF result->>'total' <> '1' OR result->'rows'->0->>'id' <> 'study-qa-1' THEN
    RAISE EXCEPTION 'Compound filter returned an inconsistent page: %', result;
  END IF;
  IF public.query_study_questions('{"ids":["study-qa-2","study-qa-1"],"status":"Resolvidas"}')->>'total' <> '1'
    OR public.query_study_questions('{"ids":["study-qa-1"],"status":"Erradas"}')->>'total' <> '0'
    OR public.query_study_questions('{"bancas":["ENARE"],"status":"Não vistas"}')->>'total' <> '1'
    OR public.query_study_questions('{"ids":["study-qa-3"],"hide_reviewed":true}')->>'total' <> '0'
    OR public.query_study_questions('{"years":[2024],"status":"Acertadas"}')->>'total' <> '1002' THEN
    RAISE EXCEPTION 'The catalog did not apply the authenticated student history';
  END IF;
  IF public.query_study_questions('{"ids":["study-qa-1","study-qa-3"],"organizers":["FUVEST"],"regions":["Nordeste"]}')->>'total' <> '0'
    OR public.query_study_questions('{"ids":["study-qa-3"],"hide_annulled":true}')->>'total' <> '0'
    OR public.query_study_questions('{"ids":["study-qa-r"],"modalities":["Acesso Direto"]}')->>'total' <> '0' THEN
    RAISE EXCEPTION 'Independent dimensions were not intersected';
  END IF;
  result := public.query_study_questions('{"bancas":["ENARE"],"years":[2026]}', 'facets');
  IF result->>'totalRightCardCount' <> '2' OR
    result->'paths'->>concat_ws(chr(31),'Pediatria','Tema A','Foco compartilhado','Subfoco','Detalhe') <> '1' THEN
    RAISE EXCEPTION 'Fifth-level count did not respect the complete path: %', result;
  END IF;
  result := public.query_study_questions('{"ids":["study-qa-3","study-qa-2"],"user_id":"ignored"}', 'list', 1, 1);
  IF result->>'total' <> '2' OR result->'rows'->0->>'id' <> 'study-qa-3' OR result::text LIKE '%Privado%' THEN
    RAISE EXCEPTION 'Explicit-ID ordering, pagination, or safe projection failed: %', result;
  END IF;
  IF has_function_privilege(current_user, 'public.persist_study_answer(uuid,text,uuid,jsonb,int)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Student could directly persist a server-graded answer';
  END IF;
END;
$$;

SELECT set_config('request.jwt.claim.sub', '8bdab4f0-83dc-4aab-a8ea-57949266ffa2', true);
DO $$
BEGIN
  IF public.query_study_questions('{"bancas":["ENARE"],"status":"Resolvidas"}')->>'total' <> '0' THEN
    RAISE EXCEPTION 'The catalog used answers from a different student';
  END IF;
END;
$$;

RESET ROLE;
UPDATE public.questions_direto SET has_gabarito = true, year = 2024 WHERE id = 'study-qa-4';
UPDATE public.questions_direto SET has_gabarito = false WHERE id = 'study-qa-1';
DO $$
BEGIN
  IF public.query_study_questions('{"ids":["study-qa-4"],"years":[2024]}')->>'total' <> '1'
    OR public.query_study_questions('{"ids":["study-qa-1"]}')->>'total' <> '0' THEN
    RAISE EXCEPTION 'Catalog index failed to reflect a publication or classification change';
  END IF;
END;
$$;

ROLLBACK;
