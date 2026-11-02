import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateUserReferralCode } from '@/services/ambassadorService';

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
    const { code, userId: bodyUserId } = body;

    const effectiveUserId = authUser?.id || bodyUserId;

    if (!effectiveUserId) {
      return NextResponse.json(
        { error: 'Usuário não autenticado.', success: false },
        { status: 401 }
      );
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Informe um código de indicação válido.', success: false },
        { status: 400 }
      );
    }

    const res = await updateUserReferralCode(effectiveUserId, code);

    if (!res.success) {
      return NextResponse.json(res, { status: 400 });
    }

    return NextResponse.json(res);
  } catch (err: unknown) {
    console.error('Erro ao atualizar código de indicação:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Falha ao atualizar código.', success: false },
      { status: 500 }
    );
  }
}
