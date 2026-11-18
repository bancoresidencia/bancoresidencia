import { NextRequest, NextResponse } from 'next/server';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';
import { getBackendAmbassadorStats } from '@/services/ambassadorService';
import { isStrictAdminRole, safeErrorMessage } from '@/utils/security';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyStudentSession(req);
    const authUser = auth.user;

    if (!auth.authorized || !authUser) {
      return NextResponse.json(
        { error: 'Acesso não autorizado: faça login para acessar suas estatísticas de embaixador.', success: false },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const queryUserId = url.searchParams.get('userId');

    // Somente superadministradores podem consultar dados financeiros/chaves PIX de outro usuário (bloqueia curadores)
    let targetUserId = authUser.id;
    const userRole = (authUser.app_metadata?.role as string) || 'student';
    if (queryUserId && queryUserId !== authUser.id && isStrictAdminRole(userRole)) {
      targetUserId = queryUserId;
    }

    const effectiveUserName = (authUser.user_metadata?.name as string) || (authUser.email ? authUser.email.split('@')[0] : 'Estudante');
    const stats = await getBackendAmbassadorStats(targetUserId, effectiveUserName);

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (err: unknown) {
    console.error('Erro ao buscar estatísticas do embaixador:', err);
    return NextResponse.json(
      { error: safeErrorMessage(err, 'Falha ao buscar estatísticas.'), success: false },
      { status: 500 }
    );
  }
}
