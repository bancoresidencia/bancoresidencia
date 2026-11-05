import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPaymentService } from '@/lib/mercadopago';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const paymentId = url.searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId é obrigatório' }, { status: 400 });
    }

    // 1. Validar autenticação do usuário
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const paymentService = getPaymentService();
    const payment = await paymentService.get({ id: paymentId });

    const status = payment.status || 'pending';
    const metadata = payment.metadata || {};
    const paymentUserId = metadata.user_id;

    // Blindagem BOLA / IDOR: Validação estrita de que o pagamento pertence ao usuário autenticado
    if (paymentUserId && paymentUserId !== user.id) {
      return NextResponse.json(
        { error: 'Acesso negado: este pagamento não pertence à sua conta.', status: 'forbidden' },
        { status: 403 }
      );
    }

    // Se estiver aprovado no Mercado Pago mas ainda pendente no banco, sincroniza
    if (status === 'approved') {
      if (!paymentUserId || paymentUserId !== user.id) {
        return NextResponse.json(
          { error: 'Acesso negado: este pagamento não pertence à sua conta.', status: 'forbidden' },
          { status: 403 }
        );
      }
      const supabaseAdmin = getSupabaseAdmin();
      const metadata = payment.metadata || {};
      const durationDays = Number(metadata.duration_days) || 365;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
      const guaranteeUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      await supabaseAdmin
        .from('profiles')
        .update({
          subscription_plan: 'pro',
          subscription_status: 'active',
          subscription_duration: metadata.plan_id || 'annual',
          subscription_started_at: now.toISOString(),
          subscription_expires_at: expiresAt.toISOString(),
          guarantee_expires_at: guaranteeUntil.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', user.id);

      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          subscription_plan: 'pro',
          subscription_status: 'active',
          subscription_duration: metadata.plan_id || 'annual',
          subscription_expires_at: expiresAt.toISOString(),
          guarantee_expires_at: guaranteeUntil.toISOString()
        }
      });

      await supabaseAdmin
        .from('orders')
        .update({
          status: 'approved',
          updated_at: now.toISOString()
        })
        .eq('mp_payment_id', String(paymentId));
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

