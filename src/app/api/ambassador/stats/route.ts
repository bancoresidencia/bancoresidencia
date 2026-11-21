import { NextRequest, NextResponse } from 'next/server';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';
import { getBackendAmbassadorStats } from '@/services/ambassadorService';
import { safeErrorMessage } from '@/utils/security';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';

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

    let targetUserId = authUser.id;
    if (queryUserId && queryUserId !== authUser.id) {
      const admin = await verifyAdminSession(req, { requireStrictAdmin: true });
      if (!admin.authorized || admin.user?.id !== authUser.id) {
        return NextResponse.json(
          { error: 'Acesso negado aos dados de outro usuário.', success: false },
          { status: admin.authorized ? 403 : admin.status }
        );
      }
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
