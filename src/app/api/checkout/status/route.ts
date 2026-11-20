import { NextRequest, NextResponse } from 'next/server';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';
import { getPaymentService } from '@/lib/mercadopago';
import { synchronizePayment } from '@/services/paymentFulfillmentService';

import { checkoutOrderId } from '@/utils/checkoutOrderId';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    let paymentId = url.searchParams.get('paymentId');

    const attempt = url.searchParams.get('attempt');
    if (!(paymentId && /^\d{1,32}$/.test(paymentId)) && !(attempt && /^[a-f0-9-]{36}$/i.test(attempt))) {
      return NextResponse.json({ error: 'paymentId inválido ou ausente' }, { status: 400 });
    }

    // 1. Validar autenticação do usuário (Bearer ou Cookie SSR)
    const auth = await verifyStudentSession(req);
    const user = auth.user;

    if (!auth.authorized || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const paymentService = getPaymentService();
    if (attempt) {
      const id = checkoutOrderId(user.id, attempt);
      const { data: order } = await (await createClient()).from('orders').select('mp_payment_id')
        .eq('user_id', user.id).eq('id', id).maybeSingle().throwOnError();
      if (!order) return NextResponse.json({ found: false });
      paymentId = order.mp_payment_id;
      if (!paymentId) {
        const found = await paymentService.search({ options: { external_reference: id, limit: 1 } });
        paymentId = found.results?.[0]?.id || null;
      }
    }
    if (!paymentId) return NextResponse.json({ found: false });
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

    const result = await synchronizePayment(payment);
    const pix = payment.point_of_interaction?.transaction_data;
    return NextResponse.json({
      found: true, paymentId: String(payment.id),
      pix: payment.payment_method_id === 'pix' && status === 'pending' ? { qrCode: pix?.qr_code, qrCodeBase64: pix?.qr_code_base64 } : null,
      status,
      statusDetail: payment.status_detail,
      isApproved: result.active
    });

  } catch {
    console.error('Erro ao verificar status do pagamento:');
    return NextResponse.json(
      { error: 'Falha ao consultar status', status: 'unknown' },
      { status: 500 }
    );
  }
}
