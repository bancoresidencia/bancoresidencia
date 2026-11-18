-- ==============================================================================
-- MIGRAÇÃO DE HARDENING ABRANGENTE DE SEGURANÇA (AUDITORIA NOV/2026)
-- Plataforma Banco Residência Médica — Supabase PostgreSQL
--
-- Correções aplicadas:
--   1. [CRIT-01] Bloqueio estrito via Trigger de auto-promoção para Pro/Premium
--      e alteração de colunas sensíveis em public.profiles por usuários comuns.
--   2. [CRIT-04] Restrição de unicidade idempotente para mp_payment_id em orders.
--   3. [HIGH-01] RPC transacional atômica com pg_advisory_xact_lock contra
--      double-spending (TOCTOU) em saques PIX e bloqueio de auto-indicação.
--   4. [HIGH-02] Remoção de inserção anônima e falsificação de autoria em
--      question_comments e question_reports + validação servidor em user_answers
--      contra manipulação do Ranking Nacional TRI.
--   5. [MED-05] Revogação de refresh_question_facets() de alunos comuns e fixação
--      de search_path = public em funções SECURITY DEFINER.
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. [CRIT-01] PROTEÇÃO DE COLUNAS SENSÍVEIS E FINANCEIRAS EM public.profiles
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Permite mutações administrativas apenas para service_role, superusuários do Postgres ou admins
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') = 'service_role'
     OR auth.role() = 'service_role'
     OR current_user IN ('postgres', 'supabase_admin', 'supabase_auth_admin')
     OR public.is_admin() THEN
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
    RAISE EXCEPTION 'Acesso negado: colunas de assinatura, e-mail e privilégios são exclusivas do servidor.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_sensitive_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_sensitive_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_sensitive_fields();


-- ==============================================================================
-- 2. [CRIT-04] IDEMPOTÊNCIA DE PAGAMENTOS EM public.orders
-- ==============================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'orders'
  ) THEN
    -- Remove eventuais duplicatas históricas mantendo o registro mais antigo aprovado ou mais recente
    DELETE FROM public.orders a
    USING public.orders b
    WHERE a.id > b.id
      AND a.mp_payment_id IS NOT NULL
      AND BTRIM(a.mp_payment_id) <> ''
      AND a.mp_payment_id = b.mp_payment_id;

    CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_mp_payment_id
      ON public.orders (mp_payment_id)
      WHERE mp_payment_id IS NOT NULL AND BTRIM(mp_payment_id) <> '';
  END IF;
END $$;


-- ==============================================================================
-- 3. [HIGH-01] PROTEÇÃO TRANSACIONAL CONTRA DOUBLE-SPENDING PIX & AUTO-INDICAÇÃO
-- ==============================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'ambassador_referrals'
  ) THEN
    ALTER TABLE public.ambassador_referrals
      DROP CONSTRAINT IF EXISTS chk_no_self_referral;

    ALTER TABLE public.ambassador_referrals
      ADD CONSTRAINT chk_no_self_referral
      CHECK (referred_user_id IS NULL OR referrer_id <> referred_user_id);

    CREATE UNIQUE INDEX IF NOT EXISTS uq_ambassador_referrals_order_id
      ON public.ambassador_referrals (order_id)
      WHERE order_id IS NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'ambassador_refund_requests'
  ) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS uq_ambassador_refund_requests_user_active
      ON public.ambassador_refund_requests (user_id)
      WHERE status IN ('pending', 'approved');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.request_ambassador_withdrawal_atomic(
  p_user_id UUID,
  p_amount NUMERIC,
  p_pix_key TEXT,
  p_pix_key_type TEXT DEFAULT 'cpf',
  p_min_sales INTEGER DEFAULT 3
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valid_sales_count INTEGER := 0;
  v_matured_commission NUMERIC(12, 2) := 0;
  v_withdrawn_balance NUMERIC(12, 2) := 0;
  v_available_balance NUMERIC(12, 2) := 0;
  v_inserted RECORD;
BEGIN
  IF p_user_id IS NULL OR p_amount IS NULL OR p_amount <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Valor solicitado inválido.'
    );
  END IF;

  -- Lock transacional exclusivo por usuário (serializa requisições concorrentes em múltiplas lambdas)
  PERFORM pg_advisory_xact_lock(hashtext('ambassador_withdraw_' || p_user_id::text));

  SELECT
    COUNT(*)::INTEGER,
    COALESCE(SUM(commission_amount), 0)::NUMERIC(12, 2)
  INTO v_valid_sales_count, v_matured_commission
  FROM public.ambassador_referrals
  WHERE referrer_id = p_user_id
    AND status = 'confirmed'
    AND matures_at <= NOW();

  IF v_valid_sales_count < p_min_sales THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', format(
        'Saque bloqueado. Você precisa de pelo menos %s indicações válidas (7+ dias) para liberar saques via PIX.',
        p_min_sales
      )
    );
  END IF;

  SELECT COALESCE(SUM(amount), 0)::NUMERIC(12, 2)
  INTO v_withdrawn_balance
  FROM public.ambassador_withdrawals
  WHERE user_id = p_user_id
    AND status <> 'rejected';

  v_available_balance := GREATEST(0, ROUND(v_matured_commission - v_withdrawn_balance, 2));

  IF ROUND(p_amount, 2) > v_available_balance THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', format(
        'Valor solicitado excede o saldo disponível liberado (R$ %s).',
        replace(to_char(v_available_balance, 'FM999999990.00'), '.', ',')
      )
    );
  END IF;

  INSERT INTO public.ambassador_withdrawals (
    user_id,
    amount,
    pix_key,
    pix_key_type,
    valid_referrals_count,
    status,
    requested_at
  )
  VALUES (
    p_user_id,
    ROUND(p_amount, 2),
    BTRIM(p_pix_key),
    p_pix_key_type,
    v_valid_sales_count,
    'pending',
    NOW()
  )
  RETURNING id, amount, pix_key, pix_key_type, requested_at, status
  INTO v_inserted;

  RETURN jsonb_build_object(
    'success', true,
    'withdrawal', jsonb_build_object(
      'id', v_inserted.id,
      'amount', v_inserted.amount,
      'pixKey', v_inserted.pix_key,
      'pixKeyType', v_inserted.pix_key_type,
      'requestedAt', v_inserted.requested_at,
      'status', v_inserted.status
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.request_ambassador_withdrawal_atomic(UUID, NUMERIC, TEXT, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.request_ambassador_withdrawal_atomic(UUID, NUMERIC, TEXT, TEXT, INTEGER) TO service_role;


-- ==============================================================================
-- 4. [HIGH-02] BLINDAGEM DE COMENTÁRIOS, DENÚNCIAS E INTEGRIDADE DO RANKING TRI
-- ==============================================================================
DO $$
BEGIN
  -- 4.1 question_comments: exige usuário autenticado e vinculação estrita ao auth.uid()
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'question_comments'
  ) THEN
    REVOKE INSERT, UPDATE, DELETE ON public.question_comments FROM anon;
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
  END IF;

  -- 4.2 question_reports: bloqueia inserção anônima direta via PostgREST e falsificação de status/notas
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'question_reports'
  ) THEN
    REVOKE INSERT, UPDATE, DELETE ON public.question_reports FROM anon;
    DROP POLICY IF EXISTS "Permitir inserção pública de reports" ON public.question_reports;
    CREATE POLICY "Permitir inserção autenticada de reports"
      ON public.question_reports
      FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.uid() IS NOT NULL
        AND user_id = auth.uid()
        AND status = 'pending'
        AND admin_notes IS NULL
        AND resolved_by IS NULL
      );
  END IF;
END $$;

-- 4.3 user_answers: impede manipulação direta de is_correct e difficulty pelo navegador
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
BEGIN
  -- Chamadas do backend (/api/questions/solve com service_role) já foram validadas em memória/banco
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') = 'service_role'
     OR auth.role() = 'service_role'
     OR current_user IN ('postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  IF auth.uid() IS NULL OR NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Acesso negado: user_id inválido para a sessão atual.';
  END IF;

  -- Valida a questão e recalcula is_correct e difficulty diretamente da fonte oficial
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'view_questions_all') THEN
    EXECUTE 'SELECT correct_answer, COALESCE(is_anulada, false), COALESCE(difficulty, ''Médio'') FROM public.view_questions_all WHERE id::text = $1 LIMIT 1'
      INTO v_correct_answer, v_is_anulada, v_difficulty
      USING NEW.question_id::text;
    v_found := v_correct_answer IS NOT NULL OR v_is_anulada IS NOT NULL;
  END IF;

  IF NOT v_found AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'questions') THEN
    SELECT q.correct_answer, COALESCE(q.is_anulada, false), COALESCE(q.difficulty, 'Médio')
    INTO v_correct_answer, v_is_anulada, v_difficulty
    FROM public.questions q
    WHERE q.id::text = NEW.question_id::text
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

DROP TRIGGER IF EXISTS trg_enforce_user_answer_integrity ON public.user_answers;
CREATE TRIGGER trg_enforce_user_answer_integrity
  BEFORE INSERT OR UPDATE ON public.user_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_user_answer_integrity();


-- ==============================================================================
-- 5. [MED-05] HARDENING DE FUNÇÕES SECURITY DEFINER & PERMISSÕES DE EXECUÇÃO
-- ==============================================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Revoga execução pública/autenticada de refresh_question_facets (evita DoS de I/O em 257k linhas)
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'refresh_question_facets'
      AND pronamespace = 'public'::regnamespace
  ) THEN
    REVOKE ALL ON FUNCTION public.refresh_question_facets() FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.refresh_question_facets() TO service_role;
  END IF;

  -- Fixa search_path = public em todas as funções SECURITY DEFINER do schema public
  FOR r IN (
    SELECT oid::regprocedure AS func_sig
    FROM pg_proc
    WHERE pronamespace = 'public'::regnamespace
      AND prosecdef = true
  ) LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public;', r.func_sig);
  END LOOP;
END $$;

COMMIT;
