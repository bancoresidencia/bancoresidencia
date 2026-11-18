import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPaymentService } from '@/lib/mercadopago';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { PLANS, PlanId } from '@/config/plans';
import { normalizeReferralCode } from '@/config/ambassadorConfig';
import { validateBackendReferralCoupon } from '@/services/ambassadorService';
import { fulfillApprovedMercadoPagoPayment, MercadoPagoPaymentLike } from '@/services/paymentFulfillmentService';

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

    if (!planId || !PLANS[planId as PlanId]) {
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

    const selectedPlan = PLANS[planId as PlanId];
    const paymentService = getPaymentService();
    const supabaseAdmin = getSupabaseAdmin();

    const isPix = paymentData.payment_method_id === 'pix';

    // Validação estrita server-side de Cupom de Desconto / Código de Indicação (bloqueia cupons falsos e auto-indicação)
    let discountPercent = 0;
    let validatedCoupon: string | null = null;
    let referrerName: string | null = null;

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
      referrerName = validation.referrerName || null;
    }

    const discountFactor = discountPercent > 0 ? (1 - discountPercent / 100) : 1;
    const amount = parseFloat((selectedPlan.totalPrice * discountFactor).toFixed(2));

    // 2. Montar objeto para o Mercado Pago com Idempotência Determinística
    const idempotencyKey = paymentData.token
      ? `BR-CARD-${paymentData.token}`
      : (body.clientRequestId ? `BR-PIX-${body.clientRequestId}` : `BR-${user.id}-${planId}-${Date.now()}`);
    const payerEmail = paymentData.payer?.email || user.email || 'estudante@bancoresidencia.com.br';

    const paymentPayload: Parameters<typeof paymentService.create>[0] = {
      body: {
        transaction_amount: amount,
        description: validatedCoupon
          ? `Hippocampus — ${selectedPlan.name} (Cupom: ${validatedCoupon})`
          : `Hippocampus — ${selectedPlan.name}`,
        payment_method_id: paymentData.payment_method_id,
        token: paymentData.token,
        installments: Math.max(1, Math.min(selectedPlan.maxInstallments, Number(paymentData.installments) || 1)),
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
          user_email: user.email,
          plan_id: selectedPlan.id,
          plan_name: selectedPlan.name,
          duration_days: selectedPlan.durationDays,
          coupon_code: validatedCoupon,
          discount_percent: discountPercent,
          original_amount: selectedPlan.totalPrice,
          expected_amount: amount,
          referrer_name: referrerName
        }
      },
      requestOptions: {
        idempotencyKey
      }
    };

    // 3. Executar cobrança na API do Mercado Pago
    const mpResponse = await paymentService.create(paymentPayload);

    const paymentId = String(mpResponse.id || '');
    const status = mpResponse.status || 'pending';
    const approvalBase = mpResponse.date_approved ? new Date(mpResponse.date_approved) : new Date();
    const guaranteeUntil = new Date(approvalBase.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nowIso = new Date().toISOString();

    // 4. Salvar na tabela de orders como 'pending' para transição atômica
    let orderRecord: { id?: string } | null = null;
    try {
      const pixData = mpResponse.point_of_interaction?.transaction_data;
      const { data: insertedOrder } = await supabaseAdmin
        .from('orders')
        .upsert({
          user_id: user.id,
          mp_payment_id: paymentId,
          plan_id: selectedPlan.id,
          plan_name: selectedPlan.name,
          amount: amount,
          installments: Math.max(1, Number(paymentData.installments) || 1),
          payment_method: paymentData.payment_method_id,
          status: 'pending',
          qr_code: pixData?.qr_code || null,
          qr_code_base64: pixData?.qr_code_base64 || null,
          ticket_url: pixData?.ticket_url || null,
          guarantee_expires_at: guaranteeUntil.toISOString(),
          raw_data: {
            ...mpResponse,
            coupon_applied: validatedCoupon ? {
              code: validatedCoupon,
              discount_percent: discountPercent,
              referrer_name: referrerName,
              original_amount: selectedPlan.totalPrice,
              final_amount: amount
            } : null
          }
        }, { onConflict: 'mp_payment_id' })
        .select()
        .maybeSingle();

      orderRecord = insertedOrder;
    } catch (orderErr) {
      console.warn('Aviso ao gravar pedido na tabela public.orders:', orderErr);
    }

    // 5. Se o pagamento foi aprovado imediatamente (ex: Cartão de Crédito), ativar atomicamente e idempotente
    if (status === 'approved') {
      try {
        await fulfillApprovedMercadoPagoPayment(mpResponse as unknown as MercadoPagoPaymentLike);
      } catch (profileErr) {
        console.error('Erro ao cumprir pagamento aprovado no Mercado Pago:', profileErr);
      }
    } else if (status === 'rejected') {
      try {
        await supabaseAdmin
          .from('orders')
          .update({ status: 'rejected', updated_at: nowIso })
          .eq('mp_payment_id', paymentId);
      } catch {
        // ignore
      }
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
      order: orderRecord
    });

  } catch (error: unknown) {
    console.error('Erro no processamento do Mercado Pago:', error);
    const errMessage = error instanceof Error ? error.message : 'Falha ao processar pagamento.';
    return NextResponse.json(
      { error: errMessage, success: false },
      { status: 500 }
    );
  }
}
