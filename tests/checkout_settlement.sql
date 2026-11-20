-- Run on a disposable database with the checkout schema and test users.
-- Assertions cover the same function invoked by checkout, polling and webhook.
BEGIN;
DO $$
DECLARE
  student uuid := gen_random_uuid();
  referrer uuid := gen_random_uuid();
  monthly uuid := gen_random_uuid();
  annual uuid := gen_random_uuid();
  stamp timestamptz := now();
  result boolean;
BEGIN
  INSERT INTO auth.users(id,raw_app_meta_data) VALUES(student,'{"role":"student"}');
  INSERT INTO public.profiles(id) VALUES(student) ON CONFLICT(id) DO NOTHING;
  INSERT INTO auth.users(id) VALUES(referrer);
  INSERT INTO public.profiles(id,referral_code) VALUES(referrer,'TEST-REFERRAL')
    ON CONFLICT(id) DO UPDATE SET referral_code=excluded.referral_code;
  INSERT INTO public.orders(id,user_id,plan_id,plan_name,amount,status)
  VALUES(monthly,student,'monthly','Mensal',49.90,'pending'),(annual,student,'annual','Anual',310.80,'pending');
  BEGIN
    PERFORM public.settle_checkout_order(monthly,student,'101','monthly',45,'approved',stamp,30);
    RAISE EXCEPTION 'mismatch accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'checkout_identity_mismatch' THEN RAISE; END IF;
  END;
  PERFORM public.settle_checkout_order(monthly,student,'101','monthly',49.90,'approved',stamp,30);
  PERFORM public.settle_checkout_order(annual,student,'102','annual',310.80,'approved',stamp,365);
  PERFORM public.settle_checkout_order(monthly,student,'101','monthly',49.90,'approved',stamp,30);
  IF (SELECT subscription_expires_at FROM public.profiles WHERE id=student) IS DISTINCT FROM stamp+interval '365 days' THEN
    RAISE EXCEPTION 'duplicate shortened entitlement';
  END IF;
  PERFORM public.record_checkout_commission(annual,'TEST-REFERRAL',345,15,7);
  PERFORM public.record_checkout_commission(annual,'TEST-REFERRAL',345,15,7);
  IF (SELECT count(*) FROM public.ambassador_referrals WHERE order_id=annual) <> 1 THEN RAISE EXCEPTION 'duplicate commission'; END IF;
  PERFORM public.settle_checkout_order(annual,student,'102','annual',310.80,'refunded',stamp,365);
  IF (SELECT status FROM public.ambassador_referrals WHERE order_id=annual) <> 'refunded' THEN RAISE EXCEPTION 'commission remained payable'; END IF;
  IF (SELECT subscription_duration FROM public.profiles WHERE id=student) IS DISTINCT FROM 'monthly' THEN
    RAISE EXCEPTION 'refund dropped remaining entitlement';
  END IF;
  SELECT public.settle_checkout_order(annual,student,'102','annual',310.80,'approved',stamp,365) INTO result;
  IF result THEN RAISE EXCEPTION 'late approval reactivated refunded receipt'; END IF;
  PERFORM public.settle_checkout_order(monthly,student,'101','monthly',49.90,'charged_back',stamp,30);
  IF (SELECT raw_app_meta_data FROM auth.users WHERE id=student) IS DISTINCT FROM
    '{"role":"student","subscription_plan":"free","subscription_status":"refunded"}'::jsonb THEN
    RAISE EXCEPTION 'incorrect auth reconciliation';
  END IF;
END $$;
ROLLBACK;
