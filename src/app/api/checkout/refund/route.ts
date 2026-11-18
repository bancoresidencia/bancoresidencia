import { NextRequest, NextResponse } from 'next/server';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';
import { getRefundService } from '@/lib/mercadopago';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { syncUserSubscriptionAfterRefund } from '@/services/paymentFulfillmentService';
import { safeErrorMessage } from '@/utils/security';

export async function POST(req: NextRequest) {
  try {
    // 1. Validar autenticação do usuário (Bearer ou Cookie SSR)
    const auth = await verifyStudentSession(req);
    const user = auth.user;

    if (!auth.authorized || !user) {
      return NextResponse.json(
        { error: 'Você precisa estar conectado para solicitar o reembolso.' },
        { status: 401 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 2. Buscar a última ordem aprovada do usuário
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (orderError || !order || !order.mp_payment_id) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura ativa encontrada elegível para reembolso automático.' },
        { status: 404 }
      );
    }

    // 3. Validar se está dentro da janela de 7 dias de garantia
    const createdAt = new Date(order.created_at).getTime();
    const now = Date.now();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

    if (now - createdAt > sevenDaysInMs) {
      return NextResponse.json(
        { error: 'O prazo de 7 dias da garantia incondicional já expirou.' },
        { status: 400 }
      );
    }

    // 4. Trava atômica anti-TOCTOU (marca 'cancelled' enquanto estorno externo está em voo)
    const lockIso = new Date().toISOString();
    const { data: lockedOrder } = await supabaseAdmin
      .from('orders')
      .update({ status: 'cancelled', updated_at: lockIso })
      .eq('id', order.id)
      .eq('status', 'approved')
      .select('id')
      .maybeSingle();

    if (!lockedOrder?.id) {
      return NextResponse.json(
        { error: 'Uma solicitação de reembolso já está em andamento para este pedido.' },
        { status: 409 }
      );
    }

    // 5. Executar reembolso via SDK do Mercado Pago com chave de idempotência determinística
    const refundService = getRefundService();
    let refundResult: { id?: string | number };
    try {
      refundResult = await refundService.create({
        payment_id: Number(order.mp_payment_id),
        requestOptions: {
          idempotencyKey: `BR-REFUND-${order.id}`
        }
      });
    } catch (mpErr) {
      // Desfaz trava para permitir nova tentativa legítima em caso de falha transitória na API externa
      await supabaseAdmin
        .from('orders')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', order.id)
        .eq('status', 'cancelled');
      throw mpErr;
    }

    const nowIso = new Date().toISOString();

    // 6. Atualizar a ordem no banco como 'refunded' e cancelar eventual comissão vinculada
    await supabaseAdmin
      .from('orders')
      .update({
        status: 'refunded',
        refund_id: String(refundResult.id || ''),
        refunded_at: nowIso,
        updated_at: nowIso
      })
      .eq('id', order.id);

    try {
      await supabaseAdmin
        .from('ambassador_referrals')
        .update({ status: 'refunded' })
        .eq('order_id', order.id);
    } catch {
      // ignore
    }

    // 7. Reconciliar assinatura preservando eventual pedido mais novo/ativo
    await syncUserSubscriptionAfterRefund(user.id);

    return NextResponse.json({
      success: true,
      message: 'Reembolso realizado com sucesso! O valor foi estornado.',
      refundId: refundResult.id
    });

  } catch (error: unknown) {
    console.error('Erro ao processar reembolso:', error);
    return NextResponse.json(
      { error: safeErrorMessage(error, 'Falha ao processar estorno junto ao gateway de pagamento.'), success: false },
      { status: 500 }
    );
  }
}

