import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { PLANS, PlanId } from '@/config/plans';
import { AMBASSADOR_CONFIG } from '@/config/ambassadorConfig';
import { recordReferralSale } from '@/services/ambassadorService';

export interface MercadoPagoPaymentLike {
  id?: string | number;
  status?: string;
  status_detail?: string;
  transaction_amount?: number;
  currency_id?: string;
  payment_method_id?: string;
  date_approved?: string;
  metadata?: Record<string, unknown>;
  payer?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

export interface FulfillmentResult {
  ok: boolean;
  reason?: string;
  orderId?: string;
  activated?: boolean;
}

/**
 * Mescla campos de assinatura em app_metadata preservando privilégios existentes (ex: role).
 */
async function mergeUserSubscriptionAppMetadata(
  userId: string,
  patch: Record<string, unknown>
): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  let currentAppMeta: Record<string, unknown> = {};
  try {
    const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (data?.user?.app_metadata && typeof data.user.app_metadata === 'object') {
      currentAppMeta = { ...(data.user.app_metadata as Record<string, unknown>) };
    }
  } catch {
    // Segue com patch seguro caso leitura falhe
  }

  await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: {
      ...currentAppMeta,
      ...patch
    }
  });
}

/**
 * Processa de forma atômica e idempotente um pagamento aprovado no Mercado Pago,
 * garantindo ativação de assinatura, validação estrita de valor/moeda e cômputo
 * garantido da comissão de Embaixador (inclusive quando PIX polling vence corrida com o Webhook).
 */
export async function fulfillApprovedMercadoPagoPayment(
  payment: MercadoPagoPaymentLike
): Promise<FulfillmentResult> {
  const supabaseAdmin = getSupabaseAdmin();
  const mpPaymentId = String(payment.id || '').trim();
  if (!mpPaymentId) {
    return { ok: false, reason: 'missing_payment_id' };
  }

  const metadata = (payment.metadata || {}) as Record<string, unknown>;
  const userId = typeof metadata.user_id === 'string' ? metadata.user_id.trim() : '';
  const rawPlanId = typeof metadata.plan_id === 'string' ? (metadata.plan_id as PlanId) : 'annual';
  const planConfig = PLANS[rawPlanId] || PLANS.annual;

  // 1. Validação estrita do valor efetivamente pago e moeda BRL
  const minDiscountedAmount = parseFloat(
    (planConfig.totalPrice * (1 - AMBASSADOR_CONFIG.discountPercent / 100) - 0.05).toFixed(2)
  );
  const metaExpected = Number(metadata.expected_amount);
  const expectedFloor =
    Number.isFinite(metaExpected) && metaExpected >= minDiscountedAmount
      ? parseFloat((metaExpected - 0.05).toFixed(2))
      : minDiscountedAmount;

  const paidAmount = Number(payment.transaction_amount || 0);
  if (!Number.isFinite(paidAmount) || paidAmount < expectedFloor || (payment.currency_id && payment.currency_id !== 'BRL')) {
    console.error('[PaymentFulfillment] Divergência financeira bloqueada:', {
      mpPaymentId,
      paidAmount,
      expectedFloor,
      currency: payment.currency_id
    });
    return { ok: false, reason: 'amount_mismatch' };
  }

  // 2. Consulta estado atual da ordem no banco
  const { data: existingOrder } = await supabaseAdmin
    .from('orders')
    .select('id, status, user_id, raw_data')
    .eq('mp_payment_id', mpPaymentId)
    .maybeSingle();

  // Nunca reativa ordens estornadas ou canceladas em processo de estorno
  if (existingOrder?.status === 'refunded' || existingOrder?.status === 'cancelled') {
    return { ok: false, reason: 'already_refunded_or_cancelled', orderId: existingOrder.id };
  }

  const effectiveUserId = userId || (typeof existingOrder?.user_id === 'string' ? existingOrder.user_id : '');
  const approvalDate = payment.date_approved ? new Date(payment.date_approved) : new Date();
  const expiresAt = new Date(approvalDate.getTime() + planConfig.durationDays * 24 * 60 * 60 * 1000);
  const guaranteeUntil = new Date(approvalDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nowIso = new Date().toISOString();

  let orderId: string | undefined = existingOrder?.id;
  let shouldActivateSubscription = false;

  if (existingOrder) {
    if (existingOrder.status === 'pending') {
      const { data: transitioned } = await supabaseAdmin
        .from('orders')
        .update({ status: 'approved', updated_at: nowIso })
        .eq('id', existingOrder.id)
        .eq('status', 'pending')
        .select('id')
        .maybeSingle();

      if (transitioned?.id) {
        shouldActivateSubscription = true;
      }
    }
  } else if (effectiveUserId) {
    const { data: createdOrder } = await supabaseAdmin
      .from('orders')
      .upsert(
        {
          user_id: effectiveUserId,
          mp_payment_id: mpPaymentId,
          plan_id: planConfig.id,
          plan_name: planConfig.name,
          amount: paidAmount,
          payment_method: payment.payment_method_id || 'pix',
          status: 'approved',
          guarantee_expires_at: guaranteeUntil.toISOString(),
          updated_at: nowIso
        },
        { onConflict: 'mp_payment_id' }
      )
      .select('id')
      .maybeSingle();

    orderId = createdOrder?.id;
    shouldActivateSubscription = Boolean(orderId);
  }

  // 3. Ativa assinatura do aluno (apenas na transição inédita para approved)
  if (shouldActivateSubscription && effectiveUserId) {
    await supabaseAdmin
      .from('profiles')
      .update({
        subscription_plan: 'pro',
        subscription_status: 'active',
        subscription_duration: planConfig.id,
        subscription_started_at: approvalDate.toISOString(),
        subscription_expires_at: expiresAt.toISOString(),
        guarantee_expires_at: guaranteeUntil.toISOString(),
        updated_at: nowIso
      })
      .eq('id', effectiveUserId);

    await mergeUserSubscriptionAppMetadata(effectiveUserId, {
      subscription_plan: 'pro',
      subscription_status: 'active',
      subscription_duration: planConfig.id,
      subscription_expires_at: expiresAt.toISOString(),
      guarantee_expires_at: guaranteeUntil.toISOString()
    });
  }

  // 4. Registro idempotente de comissão de Embaixador (executado mesmo se checkout/status aprovou primeiro)
  const rawCouponFromOrder =
    existingOrder?.raw_data &&
    typeof existingOrder.raw_data === 'object' &&
    (existingOrder.raw_data as { coupon_applied?: { code?: string } }).coupon_applied?.code;

  const couponCode =
    (typeof metadata.coupon_code === 'string' && metadata.coupon_code.trim()) ||
    (typeof rawCouponFromOrder === 'string' && rawCouponFromOrder.trim()) ||
    '';

  if (couponCode) {
    try {
      const payer = payment.payer;
      const studentName = payer?.first_name
        ? `${payer.first_name} ${payer.last_name || ''}`.trim()
        : 'Estudante';

      await recordReferralSale({
        orderId: orderId || (typeof metadata.order_id === 'string' ? metadata.order_id : undefined),
        referredUserId: effectiveUserId || undefined,
        couponCode,
        studentName,
        studentEmail: payer?.email || (typeof metadata.user_email === 'string' ? metadata.user_email : ''),
        planId: planConfig.id,
        planName: planConfig.name,
        planAmount: planConfig.totalPrice,
        discountApplied: parseFloat(Math.max(0, planConfig.totalPrice - paidAmount).toFixed(2)),
        netAmount: paidAmount
      });
    } catch (refErr) {
      console.warn('[PaymentFulfillment] Aviso ao registrar comissão de indicação:', refErr);
    }
  }

  return {
    ok: true,
    orderId,
    activated: shouldActivateSubscription
  };
}

/**
 * Reconcilia o status de assinatura do usuário após estorno/chargeback de um pedido específico.
 * Se o aluno possuir outro pedido aprovado mais recente e vigente, preserva o plano ativo!
 */
export async function syncUserSubscriptionAfterRefund(userId: string): Promise<{ downgraded: boolean }> {
  if (!userId) return { downgraded: false };

  const supabaseAdmin = getSupabaseAdmin();
  const now = Date.now();
  const nowIso = new Date().toISOString();

  const { data: activeOrders } = await supabaseAdmin
    .from('orders')
    .select('id, plan_id, created_at, guarantee_expires_at')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(5);

  const validActiveOrder = (activeOrders || []).find((ord) => {
    const pConfig = PLANS[(ord.plan_id as PlanId) || 'annual'] || PLANS.annual;
    const createdMs = new Date(ord.created_at).getTime();
    const expMs = createdMs + pConfig.durationDays * 24 * 60 * 60 * 1000;
    return Number.isFinite(expMs) && expMs > now;
  });

  if (validActiveOrder) {
    const pConfig = PLANS[(validActiveOrder.plan_id as PlanId) || 'annual'] || PLANS.annual;
    const createdDate = new Date(validActiveOrder.created_at);
    const expiresAt = new Date(createdDate.getTime() + pConfig.durationDays * 24 * 60 * 60 * 1000);

    await supabaseAdmin
      .from('profiles')
      .update({
        subscription_plan: 'pro',
        subscription_status: 'active',
        subscription_duration: pConfig.id,
        subscription_started_at: createdDate.toISOString(),
        subscription_expires_at: expiresAt.toISOString(),
        updated_at: nowIso
      })
      .eq('id', userId);

    await mergeUserSubscriptionAppMetadata(userId, {
      subscription_plan: 'pro',
      subscription_status: 'active',
      subscription_duration: pConfig.id,
      subscription_expires_at: expiresAt.toISOString()
    });

    return { downgraded: false };
  }

  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_plan: 'free',
      subscription_status: 'refunded',
      updated_at: nowIso
    })
    .eq('id', userId);

  await mergeUserSubscriptionAppMetadata(userId, {
    subscription_plan: 'free',
    subscription_status: 'refunded'
  });

  return { downgraded: true };
}
