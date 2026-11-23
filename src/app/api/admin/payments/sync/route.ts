import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/adminClient';
import { getPaymentService } from '@/lib/mercadopago';
import { synchronizePayment } from '@/services/paymentFulfillmentService';

export const dynamic = 'force-dynamic';

interface SyncPaymentBody {
  orderId?: string;
  mpPaymentId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminSession(req, { requireStrictAdmin: true });
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Acesso restrito exclusivamente a administradores.' },
        { status: auth.status || 403 }
      );
    }

    const body = (await req.json()) as SyncPaymentBody;
    let targetPaymentId: string | null = body.mpPaymentId || null;

    if (!targetPaymentId && !body.orderId) {
      return NextResponse.json(
        { success: false, error: 'Identificador do pagamento (mpPaymentId ou orderId) obrigatório.' },
        { status: 400 }
      );
    }

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Banco de dados administrativo indisponível.' },
        { status: 503 }
      );
    }

    const supabase = getSupabaseAdmin();

    if (!targetPaymentId && body.orderId) {
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .select('mp_payment_id')
        .eq('id', body.orderId)
        .single();

      if (orderErr || !order?.mp_payment_id) {
        return NextResponse.json(
          { success: false, error: 'Pedido não possui mp_payment_id registrado para conciliação.' },
          { status: 400 }
        );
      }
      targetPaymentId = order.mp_payment_id;
    }

    if (!targetPaymentId) {
      return NextResponse.json(
        { success: false, error: 'Identificador do pagamento (mpPaymentId ou orderId) obrigatório.' },
        { status: 400 }
      );
    }

    // 1. Busca status atual no Mercado Pago
    let paymentData;
    try {
      const paymentService = getPaymentService();
      paymentData = await paymentService.get({ id: targetPaymentId });
    } catch (mpErr: unknown) {
      const msg = mpErr instanceof Error ? mpErr.message : 'Falha na API do gateway';
      console.error('[AdminPaymentSync] Erro na API do Mercado Pago:', msg);
      return NextResponse.json(
        { success: false, error: `Falha ao consultar Mercado Pago: ${msg}` },
        { status: 502 }
      );
    }

    if (!paymentData || !paymentData.id) {
      return NextResponse.json(
        { success: false, error: 'Pagamento não localizado no Mercado Pago.' },
        { status: 404 }
      );
    }

    // 2. Sincroniza pedido e ativação do plano no Supabase
    const syncResult = await synchronizePayment(paymentData);

    return NextResponse.json({
      success: true,
      message: 'Pagamento sincronizado e conciliado com sucesso.',
      payment: {
        id: paymentData.id,
        status: paymentData.status,
        date_approved: paymentData.date_approved,
        transaction_amount: paymentData.transaction_amount,
        payment_method_id: paymentData.payment_method_id
      },
      syncResult
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno';
    console.error('[AdminPaymentSync] Exceção:', msg);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao sincronizar pagamento.' },
      { status: 500 }
    );
  }
}
