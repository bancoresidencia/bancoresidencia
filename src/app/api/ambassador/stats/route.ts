import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getBackendAmbassadorStats } from '@/services/ambassadorService';

export async function GET(req: NextRequest) {
  try {
    let authUser = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      authUser = user;
    } catch {
      // Falha esperada fora de escopo de cookies ou em chamadas diretas
    }

    const url = new URL(req.url);
    const queryUserId = url.searchParams.get('userId');

    const effectiveUserId = authUser?.id || queryUserId;
    const effectiveUserName = (authUser?.user_metadata?.name as string) || (authUser?.email ? authUser.email.split('@')[0] : 'Estudante');

    if (!effectiveUserId) {
      return NextResponse.json(
        { error: 'Usuário não autenticado.', success: false },
        { status: 401 }
      );
    }

    const stats = await getBackendAmbassadorStats(effectiveUserId, effectiveUserName);

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
