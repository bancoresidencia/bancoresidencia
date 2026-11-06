import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';
import { simulateBackendAmbassadorSale } from '@/services/ambassadorService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Bloqueio absoluto em produção
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Endpoint de simulação indisponível em ambiente de produção.' },
        { status: 403 }
      );
    }

    // 2. Em ambiente de desenvolvimento/teste, exige estritamente credenciais administrativas
    const auth = await verifyAdminSession(req);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Acesso restrito exclusivamente a administradores em ambiente de teste.' },
        { status: auth.status || 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { planType, matured, daysAgo, userId: bodyUserId } = body;

    // Permite especificar outro ID apenas se for admin explícito; por padrão usa o próprio admin autenticado
    const effectiveUserId = bodyUserId && typeof bodyUserId === 'string' ? bodyUserId : auth.user.id;

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
