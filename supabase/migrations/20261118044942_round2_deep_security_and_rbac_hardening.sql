-- ==============================================================================
-- MIGRAÇÃO DE HARDENING DE SEGURANÇA PROFUNDA & RBAC (2ª RODADA — NOV/2026)
-- Plataforma Banco Residência Médica — Supabase PostgreSQL
--
-- Correções Estruturais e de Segurança Aplicadas:
--   1. [CRIT-01] Revogação de EXECUTE público/anon em batch_update_taxonomy(jsonb)
--      e get_specialty_facets, mais guarda interna de service_role.
--   2. [CRIT-04] Segregação estrita de papéis (is_super_admin vs is_curator_or_admin):
--      - Curadores médicos ficam restritos exclusivamente a conteúdo clínico;
--      - Proibição absoluta de auto-promoção curador -> admin ou plano Pro em profiles;
--      - Trigger protect_profile_sensitive_fields expandido para BEFORE INSERT OR UPDATE
--        sem bypass para curadores/admins via PostgREST direto;
--      - Remoção de OR auth.uid() IS NULL na policy FOR INSERT de profiles;
--      - Restrição de orders, ambassador_*, platform_settings e leitura de audit_logs
--        exclusivamente ao titular ou is_super_admin() (proteção LGPD de CPF/PIX).
--   3. [CRIT-02] Correção do erro SQL 42703 em enforce_user_answer_integrity()
--      (consulta direta às 4 tabelas canônicas em vez de view_questions_all),
--      conversão segura de user_answers.question_id para TEXT (suporte às 257k questões)
--      e bloqueio no banco contra bypass de cota de 10 questões/dia e oráculo de gabaritos.
--   4. [MED-01] Blindagem LGPD em user_rankings_cache e get_leaderboard (revogação de anon
--      e mascaramento nativo de nome e user_id na RPC).
--   5. [MED-06] Integridade de autoria em question_comments (impede falsificação de nome
--      de preceptor/admin) e tabela + RPC atômica toggle_question_comment_like.
--   6. [LOW-01] Revogação de SELECT em access_token e refresh_token para authenticated
--      em public.user_calendar_integrations (ciphertexts restritos ao backend service_role).
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. [CRIT-04] FUNÇÕES DE SEGREGAÇÃO ESTRITA DE PRIVILÉGIOS (RBAC)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
  )
  OR COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('admin', 'superadmin');
END;
$$;

CREATE OR REPLACE FUNCTION public.is_curator_or_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin', 'curador', 'curator')
  )
  OR COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('admin', 'superadmin', 'curador', 'curator');
END;
$$;

-- Mantém compatibilidade das policies de conteúdo médico existentes (questions*, study_materials)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.is_curator_or_admin();
END;
$$;


-- ==============================================================================
-- 2. [CRIT-01] BLINDAGEM DE RPCS SECURITY DEFINER (batch_update_taxonomy & afins)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.batch_update_taxonomy(p_rows jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET statement_timeout = '30s'
AS $$
DECLARE
  v_updated integer := 0;
BEGIN
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
     AND auth.role() <> 'service_role'
     AND current_user NOT IN ('postgres', 'supabase_admin') THEN
    RAISE EXCEPTION 'Acesso negado: execução restrita ao service_role.';
  END IF;

  UPDATE public.questions q
  SET
    tema = r.tema,
    foco = r.foco,
    subfoco = r.subfoco
  FROM jsonb_to_recordset(p_rows) AS r(
    id text,
    tema text,
    foco text,
    subfoco text
  )
  WHERE q.id::text = r.id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

REVOKE ALL ON FUNCTION public.batch_update_taxonomy(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.batch_update_taxonomy(jsonb) TO service_role;

DO $$
DECLARE
  v_proc regprocedure;
BEGIN
  FOR v_proc IN
    SELECT p.oid::regprocedure
    FROM pg_proc p
    WHERE p.proname = 'get_specialty_facets'
      AND p.pronamespace = 'public'::regnamespace
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', v_proc);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO anon, authenticated, service_role', v_proc);
  END LOOP;
END $$;


-- ==============================================================================
-- 3. [CRIT-04] BLINDAGEM DE public.profiles, TABELAS FINANCEIRAS E AUDITORIA
-- ==============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_duration TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS guarantee_expires_at TIMESTAMPTZ;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Apenas service_role (backend autenticado / webhooks) ou triggers internos de auth podem definir role e assinatura!
  -- Nenhum cliente autenticado (nem mesmo curador ou admin via PostgREST direto) pode mutar privilégios ou planos.
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') = 'service_role'
     OR auth.role() = 'service_role'
     OR current_user IN ('postgres', 'supabase_admin', 'supabase_auth_admin') THEN
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

DROP TRIGGER IF EXISTS trg_protect_profile_sensitive_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_sensitive_fields
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_sensitive_fields();

-- Remove exposição de PII de todos os perfis para curadores e remove auth.uid() IS NULL em INSERT
REVOKE ALL ON public.profiles FROM anon;

DROP POLICY IF EXISTS "Perfis visíveis pelo titular ou admin" ON public.profiles;
CREATE POLICY "Perfis visíveis pelo titular ou admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_super_admin());

DROP POLICY IF EXISTS "Usuário atualiza o próprio perfil" ON public.profiles;
CREATE POLICY "Usuário atualiza o próprio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

DROP POLICY IF EXISTS "Criação de perfil via service role ou trigger" ON public.profiles;
CREATE POLICY "Criação de perfil via service role ou trigger"
  ON public.profiles FOR INSERT
  TO authenticated, service_role
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = id AND role = 'student')
    OR auth.role() = 'service_role'
  );

-- Isola ordens financeiras (CPF / valores / QR codes), saques PIX, platform_settings e audit_logs para super_admin
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
    REVOKE ALL ON public.orders FROM anon;
    DROP POLICY IF EXISTS "Ordens visíveis pelo titular ou admin" ON public.orders;
    CREATE POLICY "Ordens visíveis pelo titular ou admin"
      ON public.orders FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id OR public.is_super_admin());
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ambassador_referrals') THEN
    REVOKE ALL ON public.ambassador_referrals FROM anon;
    DROP POLICY IF EXISTS "Embaixador visualiza suas próprias indicações" ON public.ambassador_referrals;
    CREATE POLICY "Embaixador visualiza suas próprias indicações"
      ON public.ambassador_referrals FOR SELECT
      TO authenticated
      USING (referrer_id = auth.uid() OR public.is_super_admin());
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ambassador_withdrawals') THEN
    REVOKE ALL ON public.ambassador_withdrawals FROM anon;
    DROP POLICY IF EXISTS "Usuário visualiza seus saques solicitados" ON public.ambassador_withdrawals;
    CREATE POLICY "Usuário visualiza seus saques solicitados"
      ON public.ambassador_withdrawals FOR SELECT
      TO authenticated
      USING (user_id = auth.uid() OR public.is_super_admin());
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ambassador_refund_requests') THEN
    REVOKE ALL ON public.ambassador_refund_requests FROM anon;
    DROP POLICY IF EXISTS "Usuário visualiza suas solicitações de reembolso de plano" ON public.ambassador_refund_requests;
    CREATE POLICY "Usuário visualiza suas solicitações de reembolso de plano"
      ON public.ambassador_refund_requests FOR SELECT
      TO authenticated
      USING (user_id = auth.uid() OR public.is_super_admin());
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'platform_settings') THEN
    DROP POLICY IF EXISTS "platform_settings_admin_all" ON public.platform_settings;
    CREATE POLICY "platform_settings_admin_all"
      ON public.platform_settings FOR ALL
      TO authenticated
      USING (public.is_super_admin() OR auth.jwt() ->> 'role' = 'service_role')
      WITH CHECK (public.is_super_admin() OR auth.jwt() ->> 'role' = 'service_role');
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
    REVOKE ALL ON public.audit_logs FROM anon;
    DROP POLICY IF EXISTS "Admins podem visualizar logs de auditoria" ON public.audit_logs;
    CREATE POLICY "Admins podem visualizar logs de auditoria"
      ON public.audit_logs FOR SELECT
      TO authenticated
      USING (public.is_super_admin());
  END IF;
END $$;


-- ==============================================================================
-- 4. [CRIT-02] CORREÇÃO DE user_answers (42703 + FK TEXT + ANTI-ORACLE & PAYWALL)
-- ==============================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'user_answers'
      AND constraint_name = 'user_answers_question_id_fkey'
  ) THEN
    ALTER TABLE public.user_answers DROP CONSTRAINT user_answers_question_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_answers'
      AND column_name = 'question_id'
      AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.user_answers
      ALTER COLUMN question_id TYPE TEXT USING question_id::text;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'user_bookmarks'
      AND constraint_name = 'user_bookmarks_question_id_fkey'
  ) THEN
    ALTER TABLE public.user_bookmarks DROP CONSTRAINT user_bookmarks_question_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_bookmarks'
      AND column_name = 'question_id'
      AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.user_bookmarks
      ALTER COLUMN question_id TYPE TEXT USING question_id::text;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.enforce_user_answer_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_correct_answer TEXT;
  v_is_anulada BOOLEAN;
  v_difficulty TEXT;
  v_found BOOLEAN := false;
  v_is_unlimited BOOLEAN := false;
  v_daily_count INTEGER := 0;
  v_recent_burst INTEGER := 0;
  v_start_of_day TIMESTAMPTZ := date_trunc('day', timezone('utc', NOW()));
BEGIN
  -- 1. Escritas autenticadas pelo servidor (/api/questions/solve via service_role) passam direto
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') = 'service_role'
     OR auth.role() = 'service_role'
     OR current_user IN ('postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  IF auth.uid() IS NULL OR NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Acesso negado: user_id inválido para a sessão atual.';
  END IF;

  -- 2. Atualização exclusiva de anotações / Caderno de Erros sem troca de alternativa: preserva gabarito original sem consumir cota
  IF TG_OP = 'UPDATE' AND UPPER(BTRIM(COALESCE(NEW.selected_option, ''))) = UPPER(BTRIM(COALESCE(OLD.selected_option, ''))) THEN
    NEW.question_id := OLD.question_id;
    NEW.selected_option := OLD.selected_option;
    NEW.is_correct := OLD.is_correct;
    NEW.difficulty := OLD.difficulty;
    NEW.answered_at := OLD.answered_at;
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

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_answers'
  ) THEN
    ALTER TABLE public.user_answers ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Médio';
    ALTER TABLE public.user_answers ADD COLUMN IF NOT EXISTS answered_at TIMESTAMPTZ DEFAULT NOW();

    DROP TRIGGER IF EXISTS trg_enforce_user_answer_integrity ON public.user_answers;
    CREATE TRIGGER trg_enforce_user_answer_integrity
      BEFORE INSERT OR UPDATE ON public.user_answers
      FOR EACH ROW
      EXECUTE FUNCTION public.enforce_user_answer_integrity();
  END IF;
END $$;


-- ==============================================================================
-- 5. [MED-01] HARDENING LGPD EM user_rankings_cache E RPC get_leaderboard
-- ==============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_rankings_cache') THEN
    REVOKE ALL ON public.user_rankings_cache FROM anon, authenticated;
    GRANT ALL ON public.user_rankings_cache TO service_role;

    DROP POLICY IF EXISTS "Leitura pública do ranking consolidado" ON public.user_rankings_cache;
    DROP POLICY IF EXISTS "Escrita no ranking restrita a admins e service_role" ON public.user_rankings_cache;

    CREATE POLICY "Escrita no ranking restrita a super_admins e service_role"
      ON public.user_rankings_cache
      FOR ALL
      TO authenticated
      USING (public.is_super_admin())
      WITH CHECK (public.is_super_admin());
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.get_leaderboard(text, text, text, integer, integer);
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_modalidade TEXT DEFAULT NULL,
  p_banca TEXT DEFAULT NULL,
  p_institution TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  rank INTEGER,
  candidate_id TEXT,
  student_name TEXT,
  college TEXT,
  specialty_target TEXT,
  banca_foco TEXT,
  total_answered INTEGER,
  total_correct INTEGER,
  accuracy_percentage NUMERIC,
  adjusted_score NUMERIC,
  percentile NUMERIC,
  formatted_percentile TEXT,
  ranking_status TEXT,
  is_official BOOLEAN,
  is_current_user BOOLEAN,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Faça login para visualizar o ranking nacional.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_rankings_cache'
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    r.rank_position AS rank,
    CASE
      WHEN r.user_id = auth.uid() THEN r.user_id::text
      ELSE 'anon_' || substr(md5('br_rank_' || r.user_id::text), 1, 10)
    END AS candidate_id,
    CASE
      WHEN r.user_id = auth.uid() THEN r.student_name
      WHEN position(' ' IN BTRIM(r.student_name)) > 0 THEN
        split_part(BTRIM(r.student_name), ' ', 1) || ' ' ||
        UPPER(LEFT(regexp_replace(BTRIM(r.student_name), '^.*\s+', ''), 1)) || '.'
      ELSE COALESCE(NULLIF(BTRIM(r.student_name), ''), 'Estudante')
    END AS student_name,
    COALESCE(r.college, 'Geral') AS college,
    COALESCE(r.specialty_target, 'Clínica Médica') AS specialty_target,
    COALESCE(r.banca_foco, 'Todas') AS banca_foco,
    r.total_answered,
    r.total_correct,
    r.accuracy_percentage,
    r.adjusted_score,
    r.percentile,
    r.formatted_percentile,
    r.ranking_status,
    r.is_official,
    (r.user_id = auth.uid()) AS is_current_user,
    r.updated_at
  FROM public.user_rankings_cache r
  WHERE (p_modalidade IS NULL OR r.modalidade = p_modalidade)
    AND (p_banca IS NULL OR p_banca = 'Todas' OR r.banca_foco = p_banca)
    AND (p_institution IS NULL OR r.college ILIKE '%' || p_institution || '%')
  ORDER BY r.adjusted_score DESC, r.total_answered DESC
  LIMIT LEAST(100, GREATEST(1, COALESCE(p_limit, 50)))
  OFFSET GREATEST(0, COALESCE(p_offset, 0));
END;
$$;

REVOKE ALL ON FUNCTION public.get_leaderboard(text, text, text, integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(text, text, text, integer, integer) TO authenticated, service_role;


-- ==============================================================================
-- 6. [MED-06] PROVISIONAMENTO + AUTORIA REAL EM question_comments + CURTIDAS ATÔMICAS
-- ==============================================================================
-- Garante que public.question_comments exista mesmo que a migração 028 ainda não tenha sido rodada no banco
CREATE TABLE IF NOT EXISTS public.question_comments (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL DEFAULT 'Estudante',
  user_avatar TEXT,
  content TEXT NOT NULL CHECK (char_length(trim(content)) > 0 AND char_length(content) <= 2000),
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_question_comments_qid ON public.question_comments(question_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_comments_uid ON public.question_comments(user_id);

ALTER TABLE public.question_comments ENABLE ROW LEVEL SECURITY;

REVOKE INSERT, UPDATE, DELETE ON public.question_comments FROM anon;
REVOKE UPDATE ON public.question_comments FROM authenticated;
GRANT SELECT ON public.question_comments TO anon, authenticated;
GRANT INSERT, DELETE ON public.question_comments TO authenticated;
GRANT ALL ON public.question_comments TO service_role;

DROP POLICY IF EXISTS "Qualquer usuário pode ler comentários" ON public.question_comments;
CREATE POLICY "Qualquer usuário pode ler comentários"
  ON public.question_comments
  FOR SELECT
  TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "Alunos autenticados podem publicar comentários" ON public.question_comments;
CREATE POLICY "Alunos autenticados podem publicar comentários"
  ON public.question_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND likes = 0
  );

DROP POLICY IF EXISTS "Autor ou admin pode excluir o comentário" ON public.question_comments;
CREATE POLICY "Autor ou admin pode excluir o comentário"
  ON public.question_comments
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_curator_or_admin()
  );

CREATE TABLE IF NOT EXISTS public.question_comment_likes (
  comment_id TEXT NOT NULL REFERENCES public.question_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (comment_id, user_id)
);

ALTER TABLE public.question_comment_likes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.question_comment_likes FROM anon;
GRANT SELECT, INSERT, DELETE ON public.question_comment_likes TO authenticated;
GRANT ALL ON public.question_comment_likes TO service_role;

DROP POLICY IF EXISTS "Usuário consulta e gerencia suas próprias curtidas" ON public.question_comment_likes;
CREATE POLICY "Usuário consulta e gerencia suas próprias curtidas"
  ON public.question_comment_likes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.enforce_question_comment_author()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_real_name TEXT;
  v_real_avatar TEXT;
BEGIN
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') = 'service_role'
     OR auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Autenticação obrigatória para comentar.';
  END IF;

  NEW.user_id := auth.uid();
  NEW.likes := 0;

  SELECT NULLIF(BTRIM(p.name), ''), NULLIF(BTRIM(p.avatar_url), '')
  INTO v_real_name, v_real_avatar
  FROM public.profiles p
  WHERE p.id = auth.uid();

  NEW.user_name := COALESCE(v_real_name, 'Estudante');
  IF v_real_avatar IS NOT NULL AND v_real_avatar LIKE 'https://%' THEN
    NEW.user_avatar := v_real_avatar;
  ELSE
    NEW.user_avatar := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'question_comments') THEN
    DROP TRIGGER IF EXISTS trg_enforce_question_comment_author ON public.question_comments;
    CREATE TRIGGER trg_enforce_question_comment_author
      BEFORE INSERT ON public.question_comments
      FOR EACH ROW
      EXECUTE FUNCTION public.enforce_question_comment_author();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.toggle_question_comment_like(p_comment_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_liked BOOLEAN := false;
  v_likes_count INTEGER := 0;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Autenticação necessária para curtir comentários.';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('comm_like_' || COALESCE(p_comment_id, '')));

  IF EXISTS (
    SELECT 1 FROM public.question_comment_likes
    WHERE comment_id = p_comment_id AND user_id = v_uid
  ) THEN
    DELETE FROM public.question_comment_likes
    WHERE comment_id = p_comment_id AND user_id = v_uid;
    v_liked := false;
  ELSE
    INSERT INTO public.question_comment_likes (comment_id, user_id)
    VALUES (p_comment_id, v_uid)
    ON CONFLICT DO NOTHING;
    v_liked := true;
  END IF;

  SELECT COUNT(*)::INTEGER INTO v_likes_count
  FROM public.question_comment_likes
  WHERE comment_id = p_comment_id;

  UPDATE public.question_comments
  SET likes = v_likes_count
  WHERE id = p_comment_id;

  RETURN jsonb_build_object(
    'success', true,
    'liked', v_liked,
    'likes', v_likes_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.toggle_question_comment_like(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.toggle_question_comment_like(TEXT) TO authenticated, service_role;


-- ==============================================================================
-- 7. [LOW-01] REVOGAÇÃO DE CIPHERTEXTS OAUTH EM user_calendar_integrations
-- ==============================================================================
DO $$
DECLARE
  v_safe_cols TEXT;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_calendar_integrations'
  ) THEN
    REVOKE ALL ON public.user_calendar_integrations FROM anon, authenticated;

    SELECT string_agg(quote_ident(column_name), ', ')
    INTO v_safe_cols
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_calendar_integrations'
      AND column_name NOT IN ('access_token', 'refresh_token');

    IF v_safe_cols IS NOT NULL THEN
      EXECUTE format(
        'GRANT SELECT (%s), DELETE ON public.user_calendar_integrations TO authenticated',
        v_safe_cols
      );
    END IF;

    GRANT ALL ON public.user_calendar_integrations TO service_role;
  END IF;
END $$;

COMMIT;
