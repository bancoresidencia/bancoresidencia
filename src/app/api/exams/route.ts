import { NextRequest, NextResponse } from 'next/server';
import { getCertifiedExams, getCertifiedExamsStats } from '@/services/certifiedExamsService';
import { sanitizePostgrestTerm } from '@/utils/security';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Endpoint de estatísticas rápidas
    if (searchParams.get('action') === 'stats') {
      const stats = getCertifiedExamsStats();
      return NextResponse.json({ success: true, stats });
    }

    const institution = searchParams.get('instituicao') || searchParams.get('institution') || undefined;
    const yearParam = searchParams.get('ano') || searchParams.get('year');
    const year = yearParam ? parseInt(yearParam, 10) : undefined;
    const modality = searchParams.get('modalidade') || searchParams.get('modality') || undefined;
    const searchRaw = searchParams.get('q') || searchParams.get('search') || undefined;
    const search = searchRaw ? sanitizePostgrestTerm(searchRaw.slice(0, 100)) : undefined;

    const pageParam = searchParams.get('page');
    const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;

    const limitParam = searchParams.get('limit') || searchParams.get('pageSize');
    const limit = limitParam ? Math.max(1, Math.min(100, parseInt(limitParam, 10))) : 20;

    const result = getCertifiedExams({
      institution,
      year: isNaN(year!) ? undefined : year,
      modality,
      search,
      page,
      limit
    });

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('[/api/exams] Erro ao listar cadernos oficiais:', error);
    return NextResponse.json(
      { success: false, error: 'Falha interna ao processar consulta de cadernos oficiais.' },
      { status: 500 }
    );
  }
}
