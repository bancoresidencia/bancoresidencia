import { NextRequest, NextResponse } from 'next/server';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';
import { getRefundService, getPaymentService } from '@/lib/mercadopago';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { synchronizePayment } from '@/services/paymentFulfillmentService';

export async function GET(req: NextRequest) {
  try {
    const { user, authorized } = await verifyStudentSession(req);
    if (!authorized || !user) return NextResponse.json({ error: 'Faça login novamente.' }, { status: 401 });
    const { data } = await getSupabaseAdmin().from('orders').select('id,plan_name').eq('user_id', user.id)
      .eq('status', 'approved').or('refund_requested_at.not.is.null,guarantee_expires_at.gte.' + new Date().toISOString())
      .order('created_at', { ascending: false }).limit(1).maybeSingle().throwOnError();
    return data ? NextResponse.json(data) : NextResponse.json({ error: 'Nenhum pedido elegível para estorno.' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Não foi possível consultar a garantia.' }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, authorized } = await verifyStudentSession(req);
    if (!authorized || !user) return NextResponse.json({ error: 'Faça login novamente.' }, { status: 401 });
    const { orderId } = await req.json();
    const db = getSupabaseAdmin();
    const { data: order } = await db.from('orders').select('id,mp_payment_id,status,guarantee_expires_at,refund_requested_at')
      .eq('user_id',user.id).eq('id',orderId).maybeSingle().throwOnError();
    if (!order?.mp_payment_id) return NextResponse.json({ error: 'Pedido indisponível.' }, { status: 404 });
    if (order.status === 'refunded') return NextResponse.json({ success: true, message: 'O pedido já foi estornado.' });
    if (order.status !== 'approved' || (!order.refund_requested_at && !(Date.parse(order.guarantee_expires_at) >= Date.now()))) {
      return NextResponse.json({ error: 'O pedido está fora da garantia.' }, { status: 400 });
    }
    if (!order.refund_requested_at) {
      await db.from('orders').update({ refund_requested_at: new Date().toISOString() }).eq('id',order.id)
        .eq('status','approved').is('refund_requested_at',null).throwOnError();
    }
    const payments = getPaymentService();
    let payment = await payments.get({ id: order.mp_payment_id });
    if (payment.status === 'approved') {
      const refund = await getRefundService().create({ payment_id: Number(order.mp_payment_id),
        requestOptions: { idempotencyKey: order.id } });
      if (refund.id) await db.from('orders').update({ refund_id: String(refund.id) }).eq('id',order.id).throwOnError();
      payment = await payments.get({ id: order.mp_payment_id });
    }
    if (payment.status !== 'refunded' && payment.status !== 'charged_back') {
      return NextResponse.json({ success: true, message: 'Estorno solicitado. Aguardando confirmação do Mercado Pago.' }, { status: 202 });
    }
    await synchronizePayment(payment);
    return NextResponse.json({ success: true, message: 'Estorno confirmado. Seu acesso foi atualizado.' });
  } catch {
    return NextResponse.json({ error: 'Ainda não foi possível confirmar o estorno. Consulte novamente.' }, { status: 503 });
  }
}
