import { NextRequest, NextResponse } from 'next/server';
import { getPaymentService } from '@/lib/mercadopago';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { PLANS, PlanId } from '@/config/plans';
import { recordReferralSale } from '@/services/ambassadorService';
import crypto from 'crypto';

function verifyMercadoPagoSignature(req: NextRequest, rawId: string): boolean {
  const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET || process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const xSignature = req.headers.get('x-signature');
  const xRequestId = req.headers.get('x-request-id');

  // Se o cabeçalho x-signature foi fornecido (notificação formal do Mercado Pago)
  if (xSignature) {
    const parts = xSignature.split(',');
    let ts = '';
    let v1 = '';

    for (const part of parts) {
      const [key, val] = part.split('=');
      if (key?.trim() === 'ts') ts = val?.trim() || '';
      if (key?.trim() === 'v1') v1 = val?.trim() || '';
    }

    if (!ts || !v1) {
      console.warn('[MercadoPago Webhook] Formato de x-signature inválido.');
      return false;
    }

    if (webhookSecret) {
      const manifest = `id:${rawId};request-id:${xRequestId || ''};ts:${ts};`;
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(manifest);
      const calculatedHash = hmac.digest('hex');

      try {
        if (calculatedHash.length !== v1.length) return false;
        return crypto.timingSafeEqual(Buffer.from(calculatedHash), Buffer.from(v1));
      } catch {
        return false;
      }
    } else {
      // Assinatura foi enviada mas nenhum segredo está configurado: rejeita para evitar bypass
      console.warn('[MercadoPago Webhook] Assinatura fornecida mas MERCADO_PAGO_WEBHOOK_SECRET não configurado.');
      return false;
    }
  }

  // Se não há x-signature e não há webhookSecret (modo dev permissivo local)
  if (!webhookSecret) {
    return true;
  }

  // Se o segredo está configurado mas a requisição não enviou assinatura: rejeita
  return false;
}


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

    // Validação criptográfica HMAC da notificação
    if (!verifyMercadoPagoSignature(req, String(rawId))) {
      console.error('[MercadoPago Webhook] Rejeição de notificação com assinatura inválida.');
      return NextResponse.json({ error: 'Assinatura do webhook inválida.' }, { status: 401 });
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
            const { data: updatedOrder } = await supabaseAdmin
              .from('orders')
              .update({
                status: 'approved',
                updated_at: now.toISOString()
              })
              .eq('mp_payment_id', String(payment.id))
              .select('id')
              .maybeSingle();

            // Registrar indicação de embaixador se cupom esteve associado
            if (metadata.coupon_code) {
              try {
                const finalAmount = Number(payment.transaction_amount) || planConfig.totalPrice;
                const payer = payment.payer as { first_name?: string; last_name?: string; email?: string } | undefined;
                const studentName = payer?.first_name ? `${payer.first_name} ${payer.last_name || ''}`.trim() : 'Estudante';
                const orderId = updatedOrder?.id || (metadata.order_id as string) || String(payment.id);
                await recordReferralSale({
                  orderId,
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

            // Marca indicação de embaixador como cancelada/estornada para prevenir saques indevidos
            try {
              const { data: ord } = await supabaseAdmin
                .from('orders')
                .select('id')
                .eq('mp_payment_id', String(payment.id))
                .maybeSingle();

              const orderId = ord?.id || String(payment.id);
              await supabaseAdmin
                .from('ambassador_referrals')
                .update({ status: 'refunded' })
                .eq('order_id', orderId);
            } catch (refCancelErr) {
              console.warn('Aviso ao cancelar indicação por estorno no webhook:', refCancelErr);
            }
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
