import { NextRequest, NextResponse } from 'next/server';
import { getPaymentService } from '@/lib/mercadopago';
import { synchronizePayment } from '@/services/paymentFulfillmentService';
import { verifyPaymentWebhook } from '@/utils/paymentWebhookSignature';

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
      return NextResponse.json({ error: 'ID ausente.' }, { status: 400 });
    }

    // Padronização do segredo: MERCADO_PAGO_WEBHOOK_SECRET é a variável oficial canônica
    const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET || process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (!process.env.MERCADO_PAGO_WEBHOOK_SECRET && process.env.MERCADOPAGO_WEBHOOK_SECRET) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn('[MercadoPago Webhook] Aviso: MERCADOPAGO_WEBHOOK_SECRET está depreciada. Padronize para MERCADO_PAGO_WEBHOOK_SECRET no ambiente.');
      }
    }

    // Validação criptográfica HMAC-SHA256 com timingSafeEqual e janela anti-replay
    if (!verifyPaymentWebhook(req.headers, String(rawId), webhookSecret)) {
      console.error('[MercadoPago Webhook] Rejeição de notificação com assinatura inválida.');
      return NextResponse.json({ error: 'Assinatura do webhook inválida.' }, { status: 401 });
    }

    if (type !== 'payment' && !type.startsWith('payment.')) {
      return NextResponse.json({ received: true });
    }
    const payment = await getPaymentService().get({ id: String(rawId) });
    const result = await synchronizePayment(payment);
    if (result.commissionPending) throw new Error('commission_pending');
    return NextResponse.json({ received: true });
  } catch {
    console.error('[checkout] Notificação pendente de reprocessamento.');
    return NextResponse.json({ received: false }, { status: 503 });
  }
}
