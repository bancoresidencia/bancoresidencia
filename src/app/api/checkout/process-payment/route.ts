import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPaymentService } from '@/lib/mercadopago';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { PLANS, isPlanId } from '@/config/plans';
import { normalizeReferralCode } from '@/config/ambassadorConfig';
import { validateBackendReferralCoupon } from '@/services/ambassadorService';
import { synchronizePayment } from '@/services/paymentFulfillmentService';

import { checkoutOrderId } from '@/utils/checkoutOrderId';

export async function POST(req: NextRequest) {
  try {
    // 1. Validar autenticação do usuário
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado. Faça login para continuar.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { planId, paymentData, couponCode } = body;

    if (!isPlanId(planId)) {
      return NextResponse.json(
        { error: 'Plano inválido selecionado.' },
        { status: 400 }
      );
    }

    if (!paymentData || typeof paymentData !== 'object' || !paymentData.payment_method_id) {
      return NextResponse.json(
        { error: 'Dados de pagamento inválidos.' },
        { status: 400 }
      );
    }

    const selectedPlan = PLANS[planId];
    const paymentService = getPaymentService();
    const supabaseAdmin = getSupabaseAdmin();

    const isPix = paymentData.payment_method_id === 'pix';

    // Validação estrita server-side de Cupom de Desconto / Código de Indicação (bloqueia cupons falsos e auto-indicação)
    let discountPercent = 0;
    let validatedCoupon: string | null = null;
    let referrerId: string | null = null;

    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      const cleanCoupon = normalizeReferralCode(couponCode);
      const validation = await validateBackendReferralCoupon(
        cleanCoupon,
        user.id,
        (user.user_metadata?.name as string) || undefined
      );

      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.message || 'Cupom de indicação inválido ou não elegível.' },
          { status: 400 }
        );
      }

      discountPercent = validation.discountPercent;
      validatedCoupon = cleanCoupon;
      referrerId = validation.referrerId || null;
    }

    const discountFactor = discountPercent > 0 ? (1 - discountPercent / 100) : 1;
    const amount = parseFloat((selectedPlan.totalPrice * discountFactor).toFixed(2));

    // 2. Montar objeto para o Mercado Pago com Idempotência Determinística
    if (typeof body.clientRequestId !== 'string' || !/^[a-f0-9-]{36}$/i.test(body.clientRequestId)) {
      return NextResponse.json({ error: 'Atualize a página para iniciar o pagamento.' }, { status: 400 });
    }
    const installments = Number(paymentData.installments ?? 1);
    if (!Number.isInteger(installments) || installments < 1 || installments > selectedPlan.maxInstallments ||
        (!isPix && typeof paymentData.token !== 'string') || (isPix && !/^\d{11}$/.test(paymentData.payer?.identification?.number || ''))) {
      return NextResponse.json({ error: 'Confira os dados do pagamento.' }, { status: 400 });
    }
    const orderId = checkoutOrderId(user.id, body.clientRequestId);
    const idempotencyKey = orderId;
    const payerEmail = paymentData.payer?.email || user.email;
    const { data: inserted } = await supabaseAdmin.from('orders').upsert({ id: orderId, user_id: user.id, plan_id: planId,
      plan_name: selectedPlan.name, amount, currency: 'BRL', status: 'pending', installments,
      payment_method: paymentData.payment_method_id, raw_data: { coupon_code: validatedCoupon, referrer_id: referrerId } },
      { onConflict: 'id', ignoreDuplicates: true }).select('id').throwOnError();
    const { data: receipt } = await supabaseAdmin.from('orders').select('created_at,access_until,mp_payment_id,user_id,plan_id,amount,payment_method,raw_data,installments')
      .eq('id',orderId).eq('user_id',user.id).single().throwOnError();
    if (receipt.plan_id !== planId || Number(receipt.amount) !== amount || receipt.payment_method !== paymentData.payment_method_id ||
        receipt.installments !== installments || receipt.raw_data?.coupon_code !== validatedCoupon) {
      return NextResponse.json({ error: 'Esta tentativa já está vinculada a outra compra.' }, { status: 409 });
    }
    const paymentPayload: Parameters<typeof paymentService.create>[0] = {
      body: {
        external_reference: orderId,
        transaction_amount: amount,
        description: validatedCoupon
          ? `Hippocampus — ${selectedPlan.name} (Cupom: ${validatedCoupon})`
          : `Hippocampus — ${selectedPlan.name}`,
        payment_method_id: paymentData.payment_method_id,
        token: paymentData.token,
        installments,
        issuer_id: paymentData.issuer_id ? Number(paymentData.issuer_id) : undefined,
        payer: {
          email: payerEmail,
          first_name: paymentData.payer?.first_name || (user.user_metadata?.name as string | undefined)?.split(' ')[0] || 'Dr(a).',
          last_name: paymentData.payer?.last_name || (user.user_metadata?.name as string | undefined)?.split(' ').slice(1).join(' ') || 'Residente',
          identification: paymentData.payer?.identification ? {
            type: paymentData.payer.identification.type || 'CPF',
            number: String(paymentData.payer.identification.number).replace(/\D/g, '')
          } : undefined
        },
        metadata: {
          user_id: user.id,
          plan_id: selectedPlan.id,
          plan_name: selectedPlan.name,
          duration_days: selectedPlan.durationDays,
          coupon_code: validatedCoupon,
          discount_percent: discountPercent,
          original_amount: selectedPlan.totalPrice,
          expected_amount: amount
        }
      },
      requestOptions: {
        idempotencyKey
      }
    };

    // 3. Executar cobrança na API do Mercado Pago
    let gatewayId = receipt.mp_payment_id;
    if (!gatewayId && !inserted?.length) {
      const prior = await paymentService.search({ options: { external_reference: orderId, limit: 1 } });
      gatewayId = prior.results?.[0]?.id;
      if (!gatewayId && Date.now() - Date.parse(receipt.created_at) >= 24 * 3600 * 1000) {
        return NextResponse.json({ error: 'Tentativa antiga. Consulte o suporte para verificar o pedido antes de pagar novamente.' }, { status: 409 });
      }
    }
    const submit = async () => {
      try {
        return await paymentService.create(paymentPayload);
      } catch (error) {
        const code = typeof error === 'object' && error && 'status' in error ? Number(error.status) : 0;
        if (code !== 400 && code !== 422) throw error;
        return null;
      }
    };
    const mpResponse = gatewayId ? await paymentService.get({ id: gatewayId }) : await submit();
    if (!mpResponse) {
      return NextResponse.json({ success: false, resetAttempt: true, error: 'O Mercado Pago recusou os dados. Confira os campos e tente novamente.' }, { status: 422 });
    }
    const paymentId = String(mpResponse.id || '');
    if (!paymentId) throw new Error('payment_id_missing');
    if (String(mpResponse.external_reference) !== orderId || mpResponse.metadata?.user_id !== user.id) throw new Error('payment_reference_mismatch');
    const status = mpResponse.status;
    let isApproved = false;
    try {
      const result = await synchronizePayment(mpResponse);
      isApproved = result.active;
    } catch {
      console.error('[checkout] Falha de conciliação', { orderId, paymentId });
    }
    const pointOfInteraction = mpResponse.point_of_interaction;
    const pixData = pointOfInteraction?.transaction_data;

    return NextResponse.json({
      success: true,
      paymentId,
      status,
      statusDetail: mpResponse.status_detail,
      isPix,
      amount,
      discountPercent,
      couponCode: validatedCoupon,
      plan: selectedPlan,
      pix: isPix ? {
        qrCode: pixData?.qr_code,
        qrCodeBase64: pixData?.qr_code_base64,
        ticketUrl: pixData?.ticket_url
      } : null,
      isApproved
    });

  } catch {
    return NextResponse.json(
      { error: 'Não foi possível confirmar a operação. Consulte novamente usando a mesma tentativa.', success: false },
      { status: 500 }
    );
  }
}
