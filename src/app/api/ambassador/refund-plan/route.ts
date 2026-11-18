import { NextRequest, NextResponse } from 'next/server';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';
import { requestBackendPlanRefund } from '@/services/ambassadorService';
import { safeErrorMessage } from '@/utils/security';

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyStudentSession(req);
    const authUser = auth.user;

    if (!auth.authorized || !authUser) {
      return NextResponse.json(
        { error: 'Acesso não autorizado: faça login para solicitar o reembolso.', success: false },
        { status: 401 }
      );
    }

    const effectiveUserId = authUser.id;
    const res = await requestBackendPlanRefund(effectiveUserId);

    if (!res.success) {
      return NextResponse.json(res, { status: 400 });
    }

    return NextResponse.json(res);
  } catch (err: unknown) {
    console.error('Erro ao solicitar reembolso do plano de embaixador:', err);
    return NextResponse.json(
      { error: safeErrorMessage(err, 'Falha ao solicitar reembolso.'), success: false },
      { status: 500 }
    );
  }
}
