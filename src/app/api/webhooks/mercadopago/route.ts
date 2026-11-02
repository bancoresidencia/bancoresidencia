import { NextRequest, NextResponse } from 'next/server';
import { getPaymentService } from '@/lib/mercadopago';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { PLANS, PlanId } from '@/config/plans';
import { recordReferralSale } from '@/services/ambassadorService';

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const queryId = url.searchParams.get('id') || url.searchParams.get('data.id');
    const queryTopic = url.searchParams.get('topic') || url.searchParams.get('type');

    let bodyData: Record<string, unknown> = {};
    try {
      bodyData = await req.json();
    } catch {
      // Body pode ser vazio ou x-www-form-urlencoded
    }

    const type = (bodyData.type as string) || (bodyData.action as string) || queryTopic || '';
    const rawId = (bodyData.data as { id?: string })?.id || (bodyData.id as string) || queryId;

    if (!rawId) {
      // Retornar 200 para o Mercado Pago não reenviar notificações vazias
      return NextResponse.json({ received: true, ignored: 'no_id' }, { status: 200 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const paymentService = getPaymentService();

    // 1. Tratamento para notificações de Pagamento / Orders
    if (type.includes('payment') || !type || type.includes('order')) {
      try {
        const payment = await paymentService.get({ id: rawId });

        if (payment && payment.id) {
          const status = payment.status;
          const metadata = payment.metadata || {};
          const userId = (metadata.user_id as string) || '';
          const planId = (metadata.plan_id as PlanId) || 'annual';
          const planConfig = PLANS[planId] || PLANS.annual;

          const now = new Date();
          const expiresAt = new Date(now.getTime() + planConfig.durationDays * 24 * 60 * 60 * 1000);
          const guaranteeUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

          if (status === 'approved') {
            // Atualizar banco de dados se tivermos o userId
            if (userId) {
              await supabaseAdmin
                .from('profiles')
                .update({
                  subscription_plan: 'pro',
                  subscription_status: 'active',
                  subscription_duration: planId,
                  subscription_started_at: now.toISOString(),
                  subscription_expires_at: expiresAt.toISOString(),
                  guarantee_expires_at: guaranteeUntil.toISOString(),
                  updated_at: now.toISOString()
                })
                .eq('id', userId);

              await supabaseAdmin.auth.admin.updateUserById(userId, {
                user_metadata: {
                  subscription_plan: 'pro',
                  subscription_status: 'active',
                  subscription_duration: planId,
                  subscription_expires_at: expiresAt.toISOString(),
                  guarantee_expires_at: guaranteeUntil.toISOString()
                }
              });
            }

            // Atualiza ordem correspondente
            await supabaseAdmin
              .from('orders')
              .update({
                status: 'approved',
                updated_at: now.toISOString()
              })
              .eq('mp_payment_id', String(payment.id));

            // Registrar indicação de embaixador se cupom esteve associado
            if (metadata.coupon_code) {
              try {
                const finalAmount = Number(payment.transaction_amount) || planConfig.totalPrice;
                const payer = payment.payer as { first_name?: string; last_name?: string; email?: string } | undefined;
                const studentName = payer?.first_name ? `${payer.first_name} ${payer.last_name || ''}`.trim() : 'Estudante';
                await recordReferralSale({
                  couponCode: String(metadata.coupon_code),
                  studentName,
                  studentEmail: payer?.email || (metadata.user_email as string) || '',
                  planId: planId,
                  planName: planConfig.name,
                  planAmount: planConfig.totalPrice,
                  discountApplied: parseFloat(Math.max(0, planConfig.totalPrice - finalAmount).toFixed(2)),
                  netAmount: finalAmount
                });
              } catch (refErr) {
                console.warn('Aviso ao registrar indicação no webhook:', refErr);
              }
            }
          } else if (status === 'refunded' || status === 'charged_back') {
            if (userId) {
              await supabaseAdmin
                .from('profiles')
                .update({
                  subscription_plan: 'free',
                  subscription_status: 'refunded',
                  updated_at: now.toISOString()
                })
                .eq('id', userId);

              await supabaseAdmin.auth.admin.updateUserById(userId, {
                user_metadata: {
                  subscription_plan: 'free',
                  subscription_status: 'refunded'
                }
              });
            }

            await supabaseAdmin
              .from('orders')
              .update({
                status: 'refunded',
                refunded_at: now.toISOString(),
                updated_at: now.toISOString()
              })
              .eq('mp_payment_id', String(payment.id));
          }
        }
      } catch (paymentErr) {
        console.warn('Erro ao consultar pagamento no webhook:', paymentErr);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Erro no webhook do Mercado Pago:', error);
    // Sempre retornar 200 para evitar retentativas agressivas em caso de parsing
    return NextResponse.json({ received: true, error: 'internal_logged' }, { status: 200 });
  }
}
