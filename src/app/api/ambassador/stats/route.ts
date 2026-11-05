import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getBackendAmbassadorStats } from '@/services/ambassadorService';
import { isPrivilegedRole } from '@/utils/security';

export async function GET(req: NextRequest) {
  try {
    let authUser = null;
    try {
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!authError && user) {
        authUser = user;
      }
    } catch {
      // Falha esperada fora de escopo de cookies ou em chamadas diretas
    }

    if (!authUser) {
      return NextResponse.json(
        { error: 'Acesso não autorizado: faça login para acessar suas estatísticas de embaixador.', success: false },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const queryUserId = url.searchParams.get('userId');

    // Apenas administradores ou curadores podem consultar estatísticas de outro usuário
    let targetUserId = authUser.id;
    const userRole = (authUser.app_metadata?.role as string) || 'student';
    if (queryUserId && queryUserId !== authUser.id && isPrivilegedRole(userRole)) {
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
      { error: err instanceof Error ? err.message : 'Falha ao buscar estatísticas.', success: false },
      { status: 500 }
    );
  }
}
