import { NextRequest, NextResponse } from 'next/server';
import { computePlatformLeaderboard } from '@/services/rankingService';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';
import { getRankingModality } from '@/utils/leaderboard';
import { RANKING_TABS } from '@/types/ranking';

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

    const { searchParams } = req.nextUrl;
    const banca = searchParams.get('banca')?.trim().slice(0, 150);
    const institutions = searchParams.getAll('institution').slice(0, 15)
      .map((institution) => institution.trim().slice(0, 150)).filter(Boolean);
    const rawModality = searchParams.get('modalidade');
    const modalidade = getRankingModality(rawModality);
    const rawTab = searchParams.get('tab') ?? 'official';
    const tab = RANKING_TABS.find((value) => value === rawTab) ?? 'official';
    if (rawModality && !modalidade) {
      return NextResponse.json({ success: false, error: 'Recorte de modalidade inválido.' }, { status: 400 });
    }

    const rawLimit = Number.parseInt(searchParams.get('limit') ?? '50', 10);
    const rawOffset = Number.parseInt(searchParams.get('offset') ?? '0', 10);
    const limit = Number.isSafeInteger(rawLimit) ? Math.min(100, Math.max(1, rawLimit)) : 50;
    const offset = Number.isSafeInteger(rawOffset) ? Math.max(0, rawOffset) : 0;

    // Invalidação forçada de cache restrita a administradores/curadores
    const admin = searchParams.get('refresh') === 'true' ? await verifyAdminSession(req) : null;
    const forceRefresh = Boolean(admin?.authorized && admin.user?.id === authenticatedUserId);

    const result = await computePlatformLeaderboard(
      {
        banca,
        institutions,
        modalidade,
        tab,
        currentUserId: authenticatedUserId,
        limit,
        offset,
        includePlatformScores: searchParams.get('platformScores') !== 'false',
      },
      forceRefresh
    );

    return NextResponse.json(result, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (err: unknown) {
    console.error('[API Ranking]', err instanceof Error ? err.message : 'Falha interna.');
    return NextResponse.json(
      { success: false, error: 'O ranking está temporariamente indisponível.' },
      { status: 503 },
    );
  }
}
