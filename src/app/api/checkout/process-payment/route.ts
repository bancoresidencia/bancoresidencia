import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPaymentService } from '@/lib/mercadopago';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { PLANS, PlanId } from '@/config/plans';
import { validateReferralCode, normalizeReferralCode } from '@/config/ambassadorConfig';

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

    const selectedPlan = PLANS[planId as PlanId];
    const paymentService = getPaymentService();
    const supabaseAdmin = getSupabaseAdmin();

    const isPix = paymentData.payment_method_id === 'pix';

    // Validação de Cupom de Desconto / Código de Indicação
    let discountPercent = 0;
    let validatedCoupon: string | null = null;
    let referrerName: string | null = null;

    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      const cleanCoupon = normalizeReferralCode(couponCode);
      const validation = validateReferralCode(cleanCoupon, undefined, user.id, {
        id: user.id,
        email: user.email || '',
        name: (user.user_metadata?.name as string) || '',
        dailyGoal: 20,
        createdAt: new Date().toISOString()
      });

      if (validation.valid) {
        discountPercent = validation.discountPercent || 10;
        validatedCoupon = cleanCoupon;
        referrerName = validation.referrerName || null;
      }
    }

    const discountFactor = discountPercent > 0 ? (1 - discountPercent / 100) : 1;
    const amount = parseFloat((selectedPlan.totalPrice * discountFactor).toFixed(2));

    // 2. Montar objeto para o Mercado Pago
    const idempotencyKey = `BR-${user.id}-${planId}-${Date.now()}`;
    const payerEmail = paymentData.payer?.email || user.email || 'estudante@bancoresidencia.com.br';

    const paymentPayload: Parameters<typeof paymentService.create>[0] = {
      body: {
        transaction_amount: amount,
        description: validatedCoupon
          ? `Banco Residência Médica — ${selectedPlan.name} (Cupom: ${validatedCoupon})`
          : `Banco Residência Médica — ${selectedPlan.name}`,
        payment_method_id: paymentData.payment_method_id,
        token: paymentData.token,
        installments: Number(paymentData.installments) || 1,
        issuer_id: paymentData.issuer_id ? Number(paymentData.issuer_id) : undefined,
        payer: {
          email: payerEmail,
          first_name: paymentData.payer?.first_name || user.user_metadata?.name?.split(' ')[0] || 'Dr(a).',
          last_name: paymentData.payer?.last_name || user.user_metadata?.name?.split(' ').slice(1).join(' ') || 'Residente',
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
    const now = new Date();
    const expiresAt = new Date(now.getTime() + selectedPlan.durationDays * 24 * 60 * 60 * 1000);
    const guaranteeUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 4. Se o pagamento foi aprovado imediatamente (ex: Cartão de Crédito)
    if (status === 'approved') {
      try {
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_plan: 'pro',
            subscription_status: 'active',
            subscription_duration: selectedPlan.id,
            subscription_started_at: now.toISOString(),
            subscription_expires_at: expiresAt.toISOString(),
            guarantee_expires_at: guaranteeUntil.toISOString(),
            updated_at: now.toISOString()
          })
          .eq('id', user.id);

        // Atualizar também nos user_metadata do Supabase Auth para consistência imediata
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            subscription_plan: 'pro',
            subscription_status: 'active',
            subscription_duration: selectedPlan.id,
            subscription_expires_at: expiresAt.toISOString(),
            guarantee_expires_at: guaranteeUntil.toISOString()
          }
        });
      } catch (profileErr) {
        console.error('Erro ao atualizar profile do aluno pós-aprovação:', profileErr);
      }
    }

    // 5. Salvar na tabela de orders (com fallback tolerante a falhas)
    let orderRecord = null;
    try {
      const pixData = mpResponse.point_of_interaction?.transaction_data;
      const { data: insertedOrder } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: user.id,
          mp_payment_id: paymentId,
          plan_id: selectedPlan.id,
          plan_name: selectedPlan.name,
          amount: amount,
          installments: Number(paymentData.installments) || 1,
          payment_method: paymentData.payment_method_id,
          status: status === 'approved' ? 'approved' : 'pending',
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
        })
        .select()
        .maybeSingle();

      orderRecord = insertedOrder;
    } catch (orderErr) {
      console.warn('Aviso: Tabela public.orders pode estar aguardando execução da migration 012.', orderErr);
    }

    // 6. Extrair dados para resposta ao Frontend
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

