import { NextRequest, NextResponse } from 'next/server';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';
import { getPaymentService } from '@/lib/mercadopago';
import { fulfillApprovedMercadoPagoPayment, MercadoPagoPaymentLike } from '@/services/paymentFulfillmentService';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const paymentId = url.searchParams.get('paymentId');

    if (!paymentId || !/^[0-9a-zA-Z_-]{1,64}$/.test(paymentId)) {
      return NextResponse.json({ error: 'paymentId inválido ou ausente' }, { status: 400 });
    }

    // 1. Validar autenticação do usuário (Bearer ou Cookie SSR)
    const auth = await verifyStudentSession(req);
    const user = auth.user;

    if (!auth.authorized || !user) {
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

    // 2. Sincroniza de forma atômica e idempotente (incluindo comissão de embaixador no PIX!)
    if (status === 'approved') {
      const fulfillment = await fulfillApprovedMercadoPagoPayment(payment as unknown as MercadoPagoPaymentLike);
      if (!fulfillment.ok && fulfillment.reason === 'amount_mismatch') {
        return NextResponse.json(
          { error: 'Valor do pagamento divergente do plano selecionado.', status: 'invalid_amount' },
          { status: 400 }
        );
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
