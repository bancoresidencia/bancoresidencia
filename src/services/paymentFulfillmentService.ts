import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { isPlanId, PLANS } from '@/config/plans';
import { AMBASSADOR_CONFIG, DEFAULT_PRESET_REFERRALS } from '@/config/ambassadorConfig';
import type { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';

export async function synchronizePayment(payment: PaymentResponse) {
  const db = getSupabaseAdmin();
  const metadata = payment.metadata || {};
  const planId: unknown = metadata.plan_id;
  const userId: unknown = metadata.user_id;
  const paymentId = String(payment.id || '');
  const status = payment.status;
  if (!paymentId || !isPlanId(planId) || typeof userId !== 'string') {
    return { active: false, ignored: true };
  }
  const plan = PLANS[planId];
  const orderColumns = 'id,user_id,plan_id,amount,currency,mp_payment_id,status';
  const orderQuery = db.from('orders').select(orderColumns);
  const { data: existing, error } = await (payment.external_reference
    ? orderQuery.eq('id', payment.external_reference)
    : orderQuery.eq('mp_payment_id', paymentId)).maybeSingle();
  if (error) throw error;
  let order = existing;
  // Older server-created payments had metadata but no reservation.
  if (!order && !payment.external_reference) {
    const expected = Number(metadata.expected_amount);
    if (!(expected > 0) || expected !== payment.transaction_amount || payment.currency_id !== 'BRL') {
      throw new Error('legacy_receipt_mismatch');
    }
    await db.from('orders').upsert({ user_id: userId, mp_payment_id: paymentId, plan_id: planId,
      plan_name: plan.name, amount: expected, currency: 'BRL', status: 'pending',
      payment_method: payment.payment_method_id }, { onConflict: 'mp_payment_id', ignoreDuplicates: true }).throwOnError();
    const result = await db.from('orders').select(orderColumns).eq('mp_payment_id', paymentId).single().throwOnError();
    order = result.data;
  }
  if (!order || order.user_id !== userId || order.plan_id !== planId ||
      payment.currency_id !== 'BRL' || order.currency !== 'BRL' ||
      !(Number(order.amount) > 0) || Number(order.amount) !== payment.transaction_amount ||
      (order.mp_payment_id && order.mp_payment_id !== paymentId)) throw new Error('receipt_mismatch');

  if (status === 'approved' || status === 'refunded' || status === 'charged_back') {
    if (status === 'approved' && !payment.date_approved) throw new Error('approval_date_missing');
    const { data: active } = await db.rpc('settle_checkout_order', {
      p_order: order.id, p_user: userId, p_plan: planId, p_payment: paymentId, p_amount: payment.transaction_amount,
      p_status: status, p_approved: payment.date_approved || null, p_days: plan.durationDays
    }).throwOnError();
    const code = metadata.coupon_code;
    if (status === 'approved' && typeof code === 'string' && code && !Object.hasOwn(DEFAULT_PRESET_REFERRALS, code)) {
      const sale = await db.rpc('record_checkout_commission', { p_order: order.id, p_code: code,
        p_original: Number(metadata.original_amount) || plan.totalPrice,
        p_percent: AMBASSADOR_CONFIG.commissionPercent, p_days: AMBASSADOR_CONFIG.retentionDays });
      return { active: active === true, commissionPending: Boolean(sale.error) };
    }
    return { active: status === 'approved' && active === true };
  }
  const closed = status === 'cancelled' || status === 'rejected';
  await db.from('orders').update({ mp_payment_id: paymentId, status: closed ? status : 'pending' })
    .eq('id', order.id).eq('status', 'pending').throwOnError();
  return { active: false };
}
