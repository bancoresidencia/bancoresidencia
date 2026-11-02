import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requestBackendAmbassadorWithdrawal } from '@/services/ambassadorService';

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
    const { amount, pixKey, pixKeyType, userId: bodyUserId } = body;

    const effectiveUserId = authUser?.id || bodyUserId;

    if (!effectiveUserId) {
      return NextResponse.json(
        { error: 'Usuário não autenticado.', success: false },
        { status: 401 }
      );
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Informe um valor válido para o saque.', success: false },
        { status: 400 }
      );
    }

    if (!pixKey || typeof pixKey !== 'string' || !pixKey.trim()) {
      return NextResponse.json(
        { error: 'Informe uma chave PIX válida.', success: false },
        { status: 400 }
      );
    }

    const res = await requestBackendAmbassadorWithdrawal(
      effectiveUserId,
      amount,
      pixKey,
      pixKeyType || 'cpf'
    );

    if (!res.success) {
      return NextResponse.json(res, { status: 400 });
    }

    return NextResponse.json(res);
  } catch (err: unknown) {
    console.error('Erro ao processar solicitação de saque:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Falha ao solicitar saque.', success: false },
      { status: 500 }
    );
  }
}
