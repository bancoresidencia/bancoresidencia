import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPaymentService } from '@/lib/mercadopago';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { PLANS, PlanId } from '@/config/plans';
import { AMBASSADOR_CONFIG } from '@/config/ambassadorConfig';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const paymentId = url.searchParams.get('paymentId');

    if (!paymentId || !/^[0-9a-zA-Z_-]{1,64}$/.test(paymentId)) {
      return NextResponse.json({ error: 'paymentId inválido ou ausente' }, { status: 400 });
    }

    // 1. Validar autenticação do usuário
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const paymentService = getPaymentService();
    const payment = await paymentService.get({ id: paymentId });

    const status = payment.status || 'pending';
    const metadata = payment.metadata || {};
    const paymentUserId = metadata.user_id;

    // Blindagem BOLA / IDOR: Validação estrita de que o pagamento pertence ao usuário autenticado
    if (!paymentUserId || paymentUserId !== user.id) {
      return NextResponse.json(
        { error: 'Acesso negado: este pagamento não pertence à sua conta.', status: 'forbidden' },
        { status: 403 }
      );
    }

    // 2. Sincroniza APENAS se o pagamento transicionou de 'pending' para 'approved' (idempotência contra renovação infinita)
    if (status === 'approved') {
      const supabaseAdmin = getSupabaseAdmin();
      const planId = (metadata.plan_id as PlanId) || 'annual';
      const planConfig = PLANS[planId] || PLANS.annual;

      // Valida integridade financeira do valor pago no Mercado Pago
      const minExpectedAmount = parseFloat(
        (planConfig.totalPrice * (1 - AMBASSADOR_CONFIG.discountPercent / 100) - 0.05).toFixed(2)
      );
      const paidAmount = Number(payment.transaction_amount || 0);
      if (paidAmount < minExpectedAmount || (payment.currency_id && payment.currency_id !== 'BRL')) {
        console.error('[Checkout Status] Divergência de valor detectada:', { paymentId, paidAmount, minExpectedAmount });
        return NextResponse.json(
          { error: 'Valor do pagamento divergente do plano selecionado.', status: 'invalid_amount' },
          { status: 400 }
        );
      }

      // Verifica na tabela orders se este pagamento já foi processado anteriormente
      const { data: existingOrder } = await supabaseAdmin
        .from('orders')
        .select('id, status')
        .eq('mp_payment_id', String(paymentId))
        .eq('user_id', user.id)
        .maybeSingle();

      // Só aplica ativação se a ordem existia como 'pending' (evita re-ativar ordens antigas ou estornadas)
      if (existingOrder && existingOrder.status === 'pending') {
        const { data: transitioned } = await supabaseAdmin
          .from('orders')
          .update({
            status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingOrder.id)
          .eq('status', 'pending')
          .select('id')
          .maybeSingle();

        if (transitioned) {
          // Calcula vencimento sempre a partir da data oficial de aprovação do pagamento (nunca Date.now() arbitrário)
          const approvalDate = payment.date_approved ? new Date(payment.date_approved) : new Date();
          const expiresAt = new Date(approvalDate.getTime() + planConfig.durationDays * 24 * 60 * 60 * 1000);
          const guaranteeUntil = new Date(approvalDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          const nowIso = new Date().toISOString();

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
            .eq('id', user.id);

          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            app_metadata: {
              ...user.app_metadata,
              subscription_plan: 'pro',
              subscription_status: 'active',
              subscription_duration: planConfig.id,
              subscription_expires_at: expiresAt.toISOString(),
              guarantee_expires_at: guaranteeUntil.toISOString()
            }
          });
        }
      }
    }

    return NextResponse.json({
      status,
      statusDetail: payment.status_detail,
      isApproved: status === 'approved'
    });

  } catch (error: unknown) {
    console.error('Erro ao verificar status do pagamento:', error);
    return NextResponse.json(
      { error: 'Falha ao consultar status', status: 'unknown' },
      { status: 500 }
    );
  }
}
