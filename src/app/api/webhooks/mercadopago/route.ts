import { NextRequest, NextResponse } from 'next/server';
import { getPaymentService } from '@/lib/mercadopago';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import {
  fulfillApprovedMercadoPagoPayment,
  syncUserSubscriptionAfterRefund,
  MercadoPagoPaymentLike
} from '@/services/paymentFulfillmentService';
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
          const nowIso = new Date().toISOString();

          if (status === 'approved') {
            const fulfillment = await fulfillApprovedMercadoPagoPayment(
              payment as unknown as MercadoPagoPaymentLike
            );
            if (!fulfillment.ok) {
              return NextResponse.json({ received: true, ignored: fulfillment.reason || 'skipped' }, { status: 200 });
            }
          } else if (status === 'refunded' || status === 'charged_back') {
            // 1. Marca primeiramente a ordem específica como estornada
            const { data: refundedOrder } = await supabaseAdmin
              .from('orders')
              .update({
                status: 'refunded',
                refunded_at: nowIso,
                updated_at: nowIso
              })
              .eq('mp_payment_id', mpPaymentId)
              .select('id, user_id')
              .maybeSingle();

            // 2. Cancela eventual comissão vinculada a este pedido específico
            if (refundedOrder?.id) {
              try {
                await supabaseAdmin
                  .from('ambassador_referrals')
                  .update({ status: 'refunded' })
                  .eq('order_id', refundedOrder.id);
              } catch (refCancelErr) {
                console.warn('Aviso ao cancelar indicação por estorno no webhook:', refCancelErr);
              }
            }

            // 3. Reconcilia assinatura do aluno preservando outros pedidos ativos/vigentes
            const effectiveUserId = userId || (refundedOrder?.user_id as string) || '';
            if (effectiveUserId) {
              await syncUserSubscriptionAfterRefund(effectiveUserId);
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
