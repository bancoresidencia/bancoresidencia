import { NextRequest, NextResponse } from 'next/server';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';
import { requestBackendAmbassadorWithdrawal } from '@/services/ambassadorService';
import { safeErrorMessage } from '@/utils/security';

const VALID_PIX_KEY_TYPES = new Set(['cpf', 'email', 'phone', 'random']);

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyStudentSession(req);
    const authUser = auth.user;

    if (!auth.authorized || !authUser) {
      return NextResponse.json(
        { error: 'Acesso não autorizado: faça login para solicitar o saque.', success: false },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { amount, pixKey, pixKeyType } = body;
    const effectiveUserId = authUser.id;

    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0 || amount > 100_000) {
      return NextResponse.json(
        { error: 'Informe um valor numérico válido para o saque.', success: false },
        { status: 400 }
      );
    }

    if (!pixKey || typeof pixKey !== 'string' || !pixKey.trim() || pixKey.trim().length > 140) {
      return NextResponse.json(
        { error: 'Informe uma chave PIX válida.', success: false },
        { status: 400 }
      );
    }

    const safePixType =
      typeof pixKeyType === 'string' && VALID_PIX_KEY_TYPES.has(pixKeyType)
        ? (pixKeyType as 'cpf' | 'email' | 'phone' | 'random')
        : 'cpf';

    const res = await requestBackendAmbassadorWithdrawal(
      effectiveUserId,
      parseFloat(amount.toFixed(2)),
      pixKey.trim(),
      safePixType
    );

    if (!res.success) {
      return NextResponse.json(res, { status: 400 });
    }

    return NextResponse.json(res);
  } catch (err: unknown) {
    console.error('Erro ao processar solicitação de saque:', err);
    return NextResponse.json(
      { error: safeErrorMessage(err, 'Falha ao solicitar saque.'), success: false },
      { status: 500 }
    );
  }
}
