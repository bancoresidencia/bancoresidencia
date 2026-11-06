import { NextRequest, NextResponse } from 'next/server';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';
import { updateUserReferralCode } from '@/services/ambassadorService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Autenticação obrigatória (suporta cookies de sessão e Bearer token)
    const auth = await verifyStudentSession(req);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { error: 'Acesso não autorizado: faça login para alterar seu código de indicação.', success: false },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { code } = body;

    // Blindagem IDOR: O usuário só pode alterar o seu próprio código de indicação
    const effectiveUserId = auth.user.id;

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
