import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getRefundService } from '@/lib/mercadopago';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';

export async function POST() {
  try {
    // 1. Validar autenticação do usuário
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
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

    // 4. Executar reembolso via SDK do Mercado Pago
    const refundService = getRefundService();
    const refundResult = await refundService.create({
      payment_id: Number(order.mp_payment_id)
    });

    const nowIso = new Date().toISOString();

    // 5. Atualizar perfil do aluno para Free
    await supabaseAdmin
      .from('profiles')
      .update({
        subscription_plan: 'free',
        subscription_status: 'refunded',
        updated_at: nowIso
      })
      .eq('id', user.id);

    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        subscription_plan: 'free',
        subscription_status: 'refunded'
      }
    });

    // 6. Atualizar a ordem no banco
    await supabaseAdmin
      .from('orders')
      .update({
        status: 'refunded',
        refund_id: String(refundResult.id || ''),
        refunded_at: nowIso,
        updated_at: nowIso
      })
      .eq('id', order.id);

    return NextResponse.json({
      success: true,
      message: 'Reembolso realizado com sucesso! O valor foi estornado e sua conta retornou ao plano gratuito.',
      refundId: refundResult.id
    });

  } catch (error: unknown) {
    console.error('Erro ao processar reembolso:', error);
    const errMessage = error instanceof Error ? error.message : 'Falha ao processar estorno.';
    return NextResponse.json(
      { error: errMessage, success: false },
      { status: 500 }
    );
  }
}

