-- Fails safely on conflicting historical IDs; never discard financial records.
CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_identity ON public.orders(mp_payment_id);
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS access_until timestamptz;

-- 1. Adicionar colunas de código de indicação no perfil do aluno
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by_code TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by_code ON public.profiles(referred_by_code);

-- 2. Tabela de Indicações de Embaixadores (public.ambassador_referrals)
-- Regra de Negócio: O valor só é contabilizado e liberado para saque se o indicado
-- permanecer ativo por pelo menos 7 dias (período de garantia e permanência CDC).
CREATE TABLE IF NOT EXISTS public.ambassador_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email_masked TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('monthly', 'semiannual', 'annual', 'biennial')),
  plan_amount NUMERIC(10, 2) NOT NULL,
  discount_applied NUMERIC(10, 2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(10, 2) NOT NULL,
  commission_percent NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
  commission_amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'refunded', 'cancelled')),
  retention_days INTEGER NOT NULL DEFAULT 7,
  confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  matures_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


ALTER TABLE public.ambassador_referrals ENABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.ambassador_referrals FROM PUBLIC, authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON public.ambassador_referrals TO service_role;
CREATE UNIQUE INDEX IF NOT EXISTS checkout_referral_order ON public.ambassador_referrals(order_id);

-- Compute the remaining entitlement under the same lock as settlement. Auth claims,
-- profile and order commit together, including on webhook redelivery.
CREATE OR REPLACE FUNCTION public.settle_checkout_order(
  p_order uuid, p_user uuid, p_payment text, p_plan text, p_amount numeric,
  p_status text, p_approved timestamptz, p_days integer
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  receipt public.orders%rowtype;
  remaining public.orders%rowtype;
  patch jsonb;
BEGIN
  PERFORM 1 FROM public.profiles WHERE id=p_user FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'checkout_profile_missing'; END IF;
  SELECT * INTO STRICT receipt FROM public.orders WHERE id=p_order FOR UPDATE;
  IF receipt.user_id IS DISTINCT FROM p_user OR receipt.plan_id IS DISTINCT FROM p_plan
     OR receipt.amount IS DISTINCT FROM p_amount OR receipt.currency IS DISTINCT FROM 'BRL'
     OR (receipt.mp_payment_id IS NOT NULL AND receipt.mp_payment_id <> p_payment) THEN
    RAISE EXCEPTION 'checkout_identity_mismatch';
  END IF;
  IF p_status='approved' THEN
    IF receipt.status IN ('refunded','cancelled') THEN RETURN false; END IF;
    IF p_approved IS NULL OR p_days NOT IN (30,180,365,730) THEN RAISE EXCEPTION 'checkout_invalid_term'; END IF;
    UPDATE public.orders SET mp_payment_id=p_payment, status='approved', approved_at=p_approved,
      access_until=p_approved+make_interval(days=>p_days), guarantee_expires_at=p_approved+interval '7 days'
      WHERE id=p_order;
  ELSIF p_status IN ('refunded','charged_back') THEN
    UPDATE public.orders SET status='refunded', mp_payment_id=p_payment,
      refunded_at=coalesce(refunded_at,now()) WHERE id=p_order;
    IF to_regclass('public.ambassador_referrals') IS NOT NULL THEN
      UPDATE public.ambassador_referrals SET status='refunded' WHERE order_id=p_order;
    END IF;
  ELSE
    RAISE EXCEPTION 'checkout_invalid_status';
  END IF;

  SELECT o.* INTO remaining FROM public.orders o
    WHERE o.user_id=p_user AND o.status IN ('approved','paid')
      AND coalesce(o.access_until, o.created_at + make_interval(days=>CASE o.plan_id
        WHEN 'monthly' THEN 30 WHEN 'semiannual' THEN 180 WHEN 'annual' THEN 365 WHEN 'biennial' THEN 730 END)) > now()
    ORDER BY coalesce(o.access_until, o.created_at + make_interval(days=>CASE o.plan_id
        WHEN 'monthly' THEN 30 WHEN 'semiannual' THEN 180 WHEN 'annual' THEN 365 WHEN 'biennial' THEN 730 END)) DESC, o.id
    LIMIT 1;
  IF remaining.id IS NOT NULL THEN
    patch=jsonb_build_object('subscription_plan','pro','subscription_status','active',
      'subscription_duration',remaining.plan_id,'subscription_started_at',coalesce(remaining.approved_at,remaining.created_at),
      'subscription_expires_at',coalesce(remaining.access_until,remaining.created_at+make_interval(days=>CASE remaining.plan_id
        WHEN 'monthly' THEN 30 WHEN 'semiannual' THEN 180 WHEN 'annual' THEN 365 WHEN 'biennial' THEN 730 END)),
      'guarantee_expires_at',remaining.guarantee_expires_at);
  ELSE
    patch=jsonb_build_object('subscription_plan','free','subscription_status',CASE WHEN p_status='approved' THEN 'inactive' ELSE 'refunded' END);
  END IF;
  UPDATE public.profiles SET subscription_plan=patch->>'subscription_plan',subscription_status=patch->>'subscription_status',
    subscription_duration=patch->>'subscription_duration',subscription_started_at=(patch->>'subscription_started_at')::timestamptz,
    subscription_expires_at=(patch->>'subscription_expires_at')::timestamptz,guarantee_expires_at=(patch->>'guarantee_expires_at')::timestamptz,
    updated_at=now() WHERE id=p_user;
  UPDATE auth.users SET raw_app_meta_data=(coalesce(raw_app_meta_data,'{}'::jsonb) - 'subscription_duration'
    - 'subscription_started_at' - 'subscription_expires_at' - 'guarantee_expires_at') || patch WHERE id=p_user;
  RETURN remaining.id IS NOT NULL;
END $$;
REVOKE ALL ON FUNCTION public.settle_checkout_order(uuid,uuid,text,text,numeric,text,timestamptz,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_checkout_order(uuid,uuid,text,text,numeric,text,timestamptz,integer) TO service_role;

-- Serialize commissions and refunds on the same receipt.
CREATE OR REPLACE FUNCTION public.record_checkout_commission(
  p_order uuid, p_code text, p_original numeric, p_percent numeric, p_days integer
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
  receipt public.orders%rowtype;
  referrer uuid;
BEGIN
  SELECT * INTO STRICT receipt FROM public.orders WHERE id=p_order FOR UPDATE;
  IF receipt.status <> 'approved' THEN RETURN; END IF;
  IF EXISTS (SELECT 1 FROM public.ambassador_referrals WHERE order_id=p_order) THEN RETURN; END IF;
  referrer := (receipt.raw_data->>'referrer_id')::uuid;
  IF referrer IS NULL THEN
    SELECT id INTO STRICT referrer FROM public.profiles WHERE referral_code=p_code;
  END IF;
  IF referrer=receipt.user_id THEN RAISE EXCEPTION 'self_referral'; END IF;
  INSERT INTO public.ambassador_referrals(referrer_id,referred_user_id,order_id,referral_code,
    student_name,student_email_masked,plan_name,plan_id,plan_amount,discount_applied,net_amount,
    commission_percent,commission_amount,retention_days,confirmed_at,matures_at)
  VALUES(referrer,receipt.user_id,p_order,p_code,'Estudante','',receipt.plan_name,receipt.plan_id,p_original,
    p_original-receipt.amount,receipt.amount,p_percent,round(receipt.amount*p_percent/100,2),p_days,
    receipt.approved_at,receipt.approved_at+make_interval(days=>p_days));
END $$;
REVOKE ALL ON FUNCTION public.record_checkout_commission(uuid,text,numeric,numeric,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_checkout_commission(uuid,text,numeric,numeric,integer) TO service_role;
