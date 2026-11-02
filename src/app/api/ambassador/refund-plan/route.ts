import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requestBackendPlanRefund } from '@/services/ambassadorService';

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

    let bodyUserId = '';
    try {
      const body = await req.json();
      bodyUserId = body?.userId || '';
    } catch {
      // Body opcional
    }

    const effectiveUserId = authUser?.id || bodyUserId;

    if (!effectiveUserId) {
      return NextResponse.json(
        { error: 'Usuário não autenticado.', success: false },
        { status: 401 }
      );
    }

    const res = await requestBackendPlanRefund(effectiveUserId);

    if (!res.success) {
      return NextResponse.json(res, { status: 400 });
    }

    return NextResponse.json(res);
  } catch (err: unknown) {
    console.error('Erro ao solicitar reembolso do plano de embaixador:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Falha ao solicitar reembolso.', success: false },
      { status: 500 }
    );
  }
}
