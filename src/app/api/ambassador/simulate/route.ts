import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { simulateBackendAmbassadorSale } from '@/services/ambassadorService';

export async function POST(req: NextRequest) {
  try {
    let authUser = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      authUser = user;
    } catch {
      // Falha esperada fora de escopo de cookies ou em chamadas diretas
    }

    const body = await req.json();
    const { planType, matured, daysAgo, userId: bodyUserId } = body;

    const effectiveUserId = authUser?.id || bodyUserId;

    if (!effectiveUserId) {
      return NextResponse.json(
        { error: 'Usuário não autenticado.', success: false },
        { status: 401 }
      );
    }

    const sale = await simulateBackendAmbassadorSale(
      effectiveUserId,
      planType || 'annual',
      { matured: !!matured, daysAgo: typeof daysAgo === 'number' ? daysAgo : undefined }
    );

    return NextResponse.json({
      success: true,
      sale
    });
  } catch (err: unknown) {
    console.error('Erro ao simular venda de embaixador:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Falha ao simular venda.', success: false },
      { status: 500 }
    );
  }
}
