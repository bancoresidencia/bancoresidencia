import { NextRequest, NextResponse } from 'next/server';
import { computePlatformLeaderboard } from '@/services/rankingService';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';
import { isPrivilegedRole } from '@/utils/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Autenticação obrigatória de estudante (proteção LGPD de dados acadêmicos)
    const auth = await verifyStudentSession(req);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { success: false, error: 'Faça login na plataforma para visualizar o ranking nacional.' },
        { status: 401 }
      );
    }

    const authenticatedUserId = auth.user.id;
    const isAdmin = isPrivilegedRole(auth.user.app_metadata?.role as string | undefined);

    // 2. Parâmetros de consulta com limites estritos contra DoS
    const { searchParams } = new URL(req.url);
    const banca = searchParams.get('banca') || undefined;
    const institution = searchParams.get('institution') || undefined;
    const modalidade = searchParams.get('modalidade') || undefined;

    const rawLimit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const rawOffset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;
    const limit = Number.isFinite(rawLimit) ? Math.min(100, Math.max(1, rawLimit)) : 50;
    const offset = Number.isFinite(rawOffset) ? Math.max(0, Math.min(10000, rawOffset)) : 0;

    // Invalidação forçada de cache restrita a administradores/curadores
    const forceRefresh = isAdmin && searchParams.get('refresh') === 'true';

    const result = await computePlatformLeaderboard(
      {
        banca,
        institution,
        modalidade,
        currentUserId: authenticatedUserId,
        limit,
        offset
      },
      forceRefresh
    );

    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Falha interna ao processar ranking.';
    console.error('[API Ranking] Erro:', err);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
