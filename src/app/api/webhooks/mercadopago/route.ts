import { NextRequest, NextResponse } from 'next/server';
import { getPaymentService } from '@/lib/mercadopago';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { PLANS, PlanId } from '@/config/plans';
import { AMBASSADOR_CONFIG } from '@/config/ambassadorConfig';
import { recordReferralSale } from '@/services/ambassadorService';
import crypto from 'crypto';

const MAX_WEBHOOK_TOLERANCE_MS = 5 * 60 * 1000; // 5 minutos contra Replay Attack

function verifyMercadoPagoSignature(req: NextRequest, manifestDataId: string): boolean {
  const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET || process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const xSignature = req.headers.get('x-signature');
  const xRequestId = req.headers.get('x-request-id');

  if (xSignature) {
    const parts = xSignature.split(',');
    let ts = '';
    let v1 = '';

    for (const part of parts) {
      const [key, val] = part.split('=');
      if (key?.trim() === 'ts') ts = val?.trim() || '';
      if (key?.trim() === 'v1') v1 = val?.trim() || '';
    }

    if (!ts || !v1 || !/^\d+$/.test(ts)) {
      console.warn('[MercadoPago Webhook] Formato de x-signature inválido.');
      return false;
    }

    // Validação de janela temporal contra Replay Attack (suporta ts em segundos ou milissegundos)
    const tsNum = Number(ts);
    const tsMs = tsNum < 1e12 ? tsNum * 1000 : tsNum;
    if (Math.abs(Date.now() - tsMs) > MAX_WEBHOOK_TOLERANCE_MS) {
      console.warn('[MercadoPago Webhook] Notificação rejeitada por timestamp expirado (Replay Guard).');
      return false;
    }

    if (webhookSecret) {
      // Especificação Mercado Pago: id alfanumérico deve estar em minúsculas no manifest
      const normalizedId = manifestDataId.toLowerCase();
      const manifest = `id:${normalizedId};request-id:${xRequestId || ''};ts:${ts};`;
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(manifest);
      const calculatedHash = hmac.digest('hex');

      try {
        const calcBuf = Buffer.from(calculatedHash, 'utf8');
        const sigBuf = Buffer.from(v1, 'utf8');
        if (calcBuf.byteLength !== sigBuf.byteLength) return false;
        return crypto.timingSafeEqual(calcBuf, sigBuf);
      } catch {
        return false;
      }
    } else {
      console.warn('[MercadoPago Webhook] Assinatura fornecida mas MERCADO_PAGO_WEBHOOK_SECRET não configurado.');
      return false;
    }
  }

  if (process.env.NODE_ENV === 'production') {
    if (!webhookSecret) {
      console.error('[MercadoPago Webhook] ERRO CRÍTICO: MERCADO_PAGO_WEBHOOK_SECRET não configurado em produção.');
    }
    return false;
  }

  if (!webhookSecret) {
    return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const queryDataId = url.searchParams.get('data.id') || url.searchParams.get('id');
    const queryTopic = url.searchParams.get('topic') || url.searchParams.get('type');

    let bodyData: Record<string, unknown> = {};
    try {
      bodyData = await req.json();
    } catch {
      // Body pode ser vazio em notificações IPN legadas
    }

    const type = (bodyData.type as string) || (bodyData.action as string) || queryTopic || '';
    const rawId = queryDataId || (bodyData.data as { id?: string })?.id || (bodyData.id as string);

    if (!rawId) {
      return NextResponse.json({ received: true, ignored: 'no_id' }, { status: 200 });
    }

    // Validação criptográfica HMAC-SHA256 com timingSafeEqual e janela anti-replay
    if (!verifyMercadoPagoSignature(req, String(rawId))) {
      console.error('[MercadoPago Webhook] Rejeição de notificação com assinatura inválida.');
      return NextResponse.json({ error: 'Assinatura do webhook inválida.' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const paymentService = getPaymentService();

    if (type.includes('payment') || !type || type.includes('order')) {
      try {
        const payment = await paymentService.get({ id: String(rawId) });

        if (payment && payment.id) {
          const mpPaymentId = String(payment.id);
          const status = payment.status;
          const metadata = payment.metadata || {};
          const userId = (metadata.user_id as string) || '';
          const planId = (metadata.plan_id as PlanId) || 'annual';
          const planConfig = PLANS[planId] || PLANS.annual;

          const nowIso = new Date().toISOString();

          if (status === 'approved') {
            // Valida o valor efetivamente cobrado no Mercado Pago contra o plano esperado (AGENTS.md)
            const minExpectedAmount = parseFloat(
              (planConfig.totalPrice * (1 - AMBASSADOR_CONFIG.discountPercent / 100) - 0.05).toFixed(2)
            );
            const paidAmount = Number(payment.transaction_amount || 0);
            if (paidAmount < minExpectedAmount || (payment.currency_id && payment.currency_id !== 'BRL')) {
              console.error('[MercadoPago Webhook] Valor pago abaixo do esperado para o plano:', {
                mpPaymentId,
                paidAmount,
                minExpectedAmount,
                planId
              });
              return NextResponse.json({ received: true, ignored: 'amount_mismatch' }, { status: 200 });
            }

            // Verifica estado atual da ordem para garantir idempotência estrita em retentativas do webhook
            const { data: existingOrder } = await supabaseAdmin
              .from('orders')
              .select('id, status')
              .eq('mp_payment_id', mpPaymentId)
              .maybeSingle();

            if (existingOrder?.status === 'approved') {
              return NextResponse.json({ received: true, idempotent: true }, { status: 200 });
            }

            const approvalDate = payment.date_approved ? new Date(payment.date_approved) : new Date();
            const expiresAt = new Date(approvalDate.getTime() + planConfig.durationDays * 24 * 60 * 60 * 1000);
            const guaranteeUntil = new Date(approvalDate.getTime() + 7 * 24 * 60 * 60 * 1000);

            let orderId = existingOrder?.id;
            if (existingOrder) {
              await supabaseAdmin
                .from('orders')
                .update({ status: 'approved', updated_at: nowIso })
                .eq('id', existingOrder.id);
            } else if (userId) {
              const { data: createdOrder } = await supabaseAdmin
                .from('orders')
                .upsert({
                  user_id: userId,
                  mp_payment_id: mpPaymentId,
                  plan_id: planConfig.id,
                  plan_name: planConfig.name,
                  amount: paidAmount,
                  payment_method: payment.payment_method_id || 'pix',
                  status: 'approved',
                  guarantee_expires_at: guaranteeUntil.toISOString(),
                  updated_at: nowIso
                }, { onConflict: 'mp_payment_id' })
                .select('id')
                .maybeSingle();
              orderId = createdOrder?.id;
            }

            if (userId) {
              await supabaseAdmin
                .from('profiles')
                .update({
                  subscription_plan: 'pro',
                  subscription_status: 'active',
                  subscription_duration: planId,
                  subscription_started_at: approvalDate.toISOString(),
                  subscription_expires_at: expiresAt.toISOString(),
                  guarantee_expires_at: guaranteeUntil.toISOString(),
                  updated_at: nowIso
                })
                .eq('id', userId);

              await supabaseAdmin.auth.admin.updateUserById(userId, {
                app_metadata: {
                  subscription_plan: 'pro',
                  subscription_status: 'active',
                  subscription_duration: planId,
                  subscription_expires_at: expiresAt.toISOString(),
                  guarantee_expires_at: guaranteeUntil.toISOString()
                }
              });
            }

            if (metadata.coupon_code) {
              try {
                const payer = payment.payer as { first_name?: string; last_name?: string; email?: string } | undefined;
                const studentName = payer?.first_name ? `${payer.first_name} ${payer.last_name || ''}`.trim() : 'Estudante';
                await recordReferralSale({
                  orderId: orderId || (metadata.order_id as string) || undefined,
                  referredUserId: userId || undefined,
                  couponCode: String(metadata.coupon_code),
                  studentName,
                  studentEmail: payer?.email || (metadata.user_email as string) || '',
                  planId: planId,
                  planName: planConfig.name,
                  planAmount: planConfig.totalPrice,
                  discountApplied: parseFloat(Math.max(0, planConfig.totalPrice - paidAmount).toFixed(2)),
                  netAmount: paidAmount
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
                  updated_at: nowIso
                })
                .eq('id', userId);

              await supabaseAdmin.auth.admin.updateUserById(userId, {
                app_metadata: {
                  subscription_plan: 'free',
                  subscription_status: 'refunded'
                }
              });
            }

            await supabaseAdmin
              .from('orders')
              .update({
                status: 'refunded',
                refunded_at: nowIso,
                updated_at: nowIso
              })
              .eq('mp_payment_id', mpPaymentId);

            try {
              const { data: ord } = await supabaseAdmin
                .from('orders')
                .select('id')
                .eq('mp_payment_id', mpPaymentId)
                .maybeSingle();

              if (ord?.id) {
                await supabaseAdmin
                  .from('ambassador_referrals')
                  .update({ status: 'refunded' })
                  .eq('order_id', ord.id);
              }
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
    return NextResponse.json({ received: true, error: 'internal_logged' }, { status: 200 });
  }
}
