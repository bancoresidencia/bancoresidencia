BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND lower(btrim(role)) IN ('admin', 'superadmin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_curator_or_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND lower(btrim(role)) IN ('admin', 'superadmin', 'curador', 'curator')
  );
$$;

ALTER POLICY "Admins e curadores podem ler denúncias" ON public.question_reports
  USING (public.is_curator_or_admin());
ALTER POLICY "Admins e curadores podem atualizar denúncias" ON public.question_reports
  USING (public.is_curator_or_admin()) WITH CHECK (public.is_curator_or_admin());
ALTER POLICY "Admins podem excluir denúncias" ON public.question_reports
  USING (public.is_super_admin());
ALTER POLICY "Admins e backend podem registrar auditoria" ON public.audit_logs
  WITH CHECK (public.is_curator_or_admin());
ALTER POLICY "Acesso restrito ao bucket medical-knowledge" ON storage.objects
  USING (bucket_id = 'medical-knowledge' AND public.is_curator_or_admin());

REVOKE ALL ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO service_role;
GRANT UPDATE (
  name, specialty_target, college, graduation_year, daily_goal, phone, state,
  avatar_url, target_exam_name, target_exam_date, preferences
) ON public.profiles TO authenticated;

ALTER POLICY "Usuário atualiza o próprio perfil" ON public.profiles
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

REVOKE ALL ON TABLE public.user_answers, public.user_folders, public.user_lists
  FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_answers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_folders, public.user_lists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_answers, public.user_folders, public.user_lists TO service_role;

-- Validate existing ownership in the same transaction before replacing the foreign keys.
-- A legacy cross-owner link aborts the migration without detaching or deleting records.
ALTER TABLE public.user_folders
  ADD CONSTRAINT user_folders_owner_id_unique UNIQUE (user_id, id),
  ADD CONSTRAINT user_folders_owned_parent_fkey
    FOREIGN KEY (user_id, parent_id) REFERENCES public.user_folders (user_id, id)
    ON DELETE CASCADE;
ALTER TABLE public.user_lists
  ADD CONSTRAINT user_lists_owned_folder_fkey
    FOREIGN KEY (user_id, folder_id) REFERENCES public.user_folders (user_id, id)
    ON DELETE SET NULL (folder_id);
ALTER TABLE public.user_folders DROP CONSTRAINT user_folders_parent_id_fkey;
ALTER TABLE public.user_lists DROP CONSTRAINT user_lists_folder_id_fkey;

CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  -- The invoker is the effective database role, including for trusted server functions.
  IF current_user IN ('service_role', 'postgres', 'supabase_admin', 'supabase_auth_admin') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.role := 'student';
    NEW.subscription_plan := 'free';
    NEW.subscription_status := 'inactive';
    NEW.subscription_duration := NULL;
    NEW.subscription_started_at := NULL;
    NEW.subscription_expires_at := NULL;
    NEW.guarantee_expires_at := NULL;
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.email IS DISTINCT FROM OLD.email
     OR NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan
     OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
     OR NEW.subscription_duration IS DISTINCT FROM OLD.subscription_duration
     OR NEW.subscription_started_at IS DISTINCT FROM OLD.subscription_started_at
     OR NEW.subscription_expires_at IS DISTINCT FROM OLD.subscription_expires_at
     OR NEW.guarantee_expires_at IS DISTINCT FROM OLD.guarantee_expires_at THEN
    RAISE EXCEPTION 'Acesso negado: colunas de privilégios, e-mail e assinatura são exclusivas do servidor.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_user_answer_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_correct_answer TEXT;
  v_is_anulada BOOLEAN;
  v_difficulty TEXT;
  v_found BOOLEAN := false;
  v_is_unlimited BOOLEAN := false;
  v_daily_count INTEGER := 0;
  v_recent_burst INTEGER := 0;
  v_previous_attempts jsonb := '[]'::jsonb;
  v_start_of_day TIMESTAMPTZ := date_trunc('day', NOW(), 'UTC');
BEGIN
  -- SECURITY DEFINER changes current_user. Use the session's actual database role.
  IF current_setting('role', true) = 'service_role'
     OR (current_setting('role', true) = 'none' AND session_user IN ('postgres', 'supabase_admin')) THEN
    RETURN NEW;
  END IF;

  IF auth.uid() IS NULL OR NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Acesso negado: user_id inválido para a sessão atual.';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.question_id IS DISTINCT FROM OLD.question_id OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Acesso negado: a questão e o titular da resposta são imutáveis.' USING ERRCODE = '42501';
    END IF;
    IF jsonb_typeof(OLD.attempts) = 'array' THEN
      v_previous_attempts := OLD.attempts;
    END IF;
  END IF;

  -- 2. Atualização exclusiva de anotações / Caderno de Erros sem troca de alternativa: preserva gabarito original sem consumir cota
  IF TG_OP = 'UPDATE' AND UPPER(BTRIM(COALESCE(NEW.selected_option, ''))) = UPPER(BTRIM(COALESCE(OLD.selected_option, ''))) THEN
    NEW.selected_option := OLD.selected_option;
    NEW.is_correct := OLD.is_correct;
    NEW.difficulty := OLD.difficulty;
    NEW.answered_at := OLD.answered_at;
    NEW.attempts := OLD.attempts;
    NEW.written_answer := OLD.written_answer;
    NEW.specialty := OLD.specialty;
    NEW.tema := OLD.tema;
    NEW.foco := OLD.foco;
    NEW.subfoco := OLD.subfoco;
    NEW.banca := OLD.banca;
    NEW.year := OLD.year;
    RETURN NEW;
  END IF;

  -- 3. Serialização transacional por aluno contra disparos paralelos (anti-TOCTOU)
  PERFORM pg_advisory_xact_lock(hashtext('ua_quota_guard_' || auth.uid()::text));

  -- 4. Verifica elegibilidade de plano ilimitado em public.profiles
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND (
        p.role IN ('admin', 'superadmin', 'curador', 'curator')
        OR (
          p.subscription_plan IN ('pro', 'premium')
          AND p.subscription_status = 'active'
          AND p.subscription_expires_at IS NOT NULL
          AND p.subscription_expires_at > NOW()
        )
      )
  ) INTO v_is_unlimited;

  IF NOT v_is_unlimited THEN
    -- Bloqueia re-teste de alternativas via PostgREST direto no plano Gratuito (impede oráculo A->B->C->D)
    IF TG_OP = 'UPDATE' THEN
      RAISE EXCEPTION 'No plano Gratuito, utilize o botão Resolver da plataforma para submeter tentativas.';
    END IF;

    SELECT COUNT(*)::INTEGER
    INTO v_daily_count
    FROM public.user_answers ua
    WHERE ua.user_id = auth.uid()
      AND ua.answered_at >= v_start_of_day
      AND ua.question_id <> NEW.question_id;

    IF v_daily_count >= 10 THEN
      RAISE EXCEPTION 'Limite diário de 10 questões atingido no plano Gratuito.';
    END IF;
  ELSE
    -- Proteção anti-scraping contra varredura automatizada direta no PostgREST mesmo em contas pagas (máx 60/min)
    SELECT COUNT(*)::INTEGER
    INTO v_recent_burst
    FROM public.user_answers ua
    WHERE ua.user_id = auth.uid()
      AND ua.answered_at > (NOW() - INTERVAL '1 minute');

    IF v_recent_burst >= 60 THEN
      RAISE EXCEPTION 'Cadência de gravação direta excedida. Utilize a interface oficial da plataforma.';
    END IF;
  END IF;

  -- 5. Busca indexada direta nas 4 tabelas canônicas + fallback legado (corrige erro 42703 da view_questions_all)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'questions_direto') THEN
    SELECT q.correct_answer, COALESCE(q.is_anulada, false), COALESCE(q.difficulty, 'Médio')
    INTO v_correct_answer, v_is_anulada, v_difficulty
    FROM public.questions_direto q
    WHERE q.id = NEW.question_id
    LIMIT 1;
    v_found := FOUND;
  END IF;

  IF NOT v_found AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'questions_rplus') THEN
    SELECT q.correct_answer, COALESCE(q.is_anulada, false), COALESCE(q.difficulty, 'Médio')
    INTO v_correct_answer, v_is_anulada, v_difficulty
    FROM public.questions_rplus q
    WHERE q.id = NEW.question_id
    LIMIT 1;
    v_found := FOUND;
  END IF;

  IF NOT v_found AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'questions_revalida') THEN
    SELECT q.correct_answer, COALESCE(q.is_anulada, false), COALESCE(q.difficulty, 'Médio')
    INTO v_correct_answer, v_is_anulada, v_difficulty
    FROM public.questions_revalida q
    WHERE q.id = NEW.question_id
    LIMIT 1;
    v_found := FOUND;
  END IF;

  IF NOT v_found AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'questions_titulo') THEN
    SELECT q.correct_answer, COALESCE(q.is_anulada, false), COALESCE(q.difficulty, 'Médio')
    INTO v_correct_answer, v_is_anulada, v_difficulty
    FROM public.questions_titulo q
    WHERE q.id = NEW.question_id
    LIMIT 1;
    v_found := FOUND;
  END IF;

  IF NOT v_found AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'questions') THEN
    SELECT q.correct_answer, COALESCE(q.is_anulada, false), COALESCE(q.difficulty, 'Médio')
    INTO v_correct_answer, v_is_anulada, v_difficulty
    FROM public.questions q
    WHERE q.id::text = NEW.question_id
    LIMIT 1;
    v_found := FOUND;
  END IF;

  IF NOT v_found THEN
    RAISE EXCEPTION 'Questão inválida ou não localizada no acervo oficial.';
  END IF;

  NEW.selected_option := UPPER(BTRIM(COALESCE(NEW.selected_option, '')));
  IF NEW.selected_option NOT IN ('A', 'B', 'C', 'D', 'E') THEN
    RAISE EXCEPTION 'Alternativa selecionada inválida.';
  END IF;

  NEW.answered_at := NOW();
  NEW.difficulty := COALESCE(v_difficulty, 'Médio');
  IF COALESCE(v_is_anulada, false) OR UPPER(BTRIM(COALESCE(v_correct_answer, ''))) = 'ANULADA' THEN
    NEW.is_correct := true;
  ELSIF BTRIM(COALESCE(v_correct_answer, '')) <> '' THEN
    NEW.is_correct := (NEW.selected_option = UPPER(BTRIM(v_correct_answer)));
  ELSE
    NEW.is_correct := false;
  END IF;

  NEW.written_answer := NULL;
  SELECT jsonb_agg(recent.value ORDER BY recent.position)
  INTO NEW.attempts
  FROM (
    SELECT value, position
    FROM jsonb_array_elements(v_previous_attempts || jsonb_build_array(jsonb_build_object(
      'letter', NEW.selected_option,
      'isCorrect', NEW.is_correct,
      'timestamp', floor(extract(epoch FROM NEW.answered_at) * 1000)
    ))) WITH ORDINALITY AS entries(value, position)
    ORDER BY position DESC LIMIT 30
  ) AS recent;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_unseen_question_ids(
  p_user_id UUID,
  p_especialidade TEXT DEFAULT NULL,
  p_banca TEXT DEFAULT NULL,
  p_year INT DEFAULT NULL,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  question_id UUID,
  total_unseen BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_total BIGINT;
BEGIN
  -- Blindagem IDOR: Apenas o próprio usuário ou administradores podem consultar
  IF p_user_id IS NULL OR (
    current_setting('role', true) IS DISTINCT FROM 'service_role'
    AND p_user_id IS DISTINCT FROM auth.uid()
    AND NOT public.is_super_admin()
  ) THEN
    RAISE EXCEPTION 'Acesso negado: histórico restrito exclusivamente ao titular da conta.';
  END IF;

  -- Contagem total de não vistas respeitando filtros
  SELECT COUNT(*)
  INTO v_total
  FROM public.questions q
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_answers ua
    WHERE ua.question_id::text = q.id::text
      AND ua.user_id = p_user_id
  )
  AND (p_especialidade IS NULL OR q.especialidade = p_especialidade)
  AND (p_banca IS NULL OR q.banca = p_banca)
  AND (p_year IS NULL OR q.year = p_year);

  RETURN QUERY
  SELECT q.id::uuid AS question_id, v_total AS total_unseen
  FROM public.questions q
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_answers ua
    WHERE ua.question_id::text = q.id::text
      AND ua.user_id = p_user_id
  )
  AND (p_especialidade IS NULL OR q.especialidade = p_especialidade)
  AND (p_banca IS NULL OR q.banca = p_banca)
  AND (p_year IS NULL OR q.year = p_year)
  ORDER BY q.year DESC, q.id ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

REVOKE ALL ON FUNCTION public.get_unseen_question_ids(uuid, text, text, int, int, int)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_unseen_question_ids(uuid, text, text, int, int, int)
  TO authenticated, service_role;

COMMIT;
