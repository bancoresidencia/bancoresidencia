import { NextRequest, NextResponse } from 'next/server';
import { getCertifiedExamById } from '@/services/certifiedExamsService';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Identificador do caderno não informado.' },
        { status: 400 }
      );
    }

    const exam = getCertifiedExamById(id);

    if (!exam) {
      return NextResponse.json(
        { success: false, error: `Caderno oficial com identificador '${id}' não encontrado.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      exam
    });
  } catch (error) {
    console.error('[/api/exams/[id]] Erro ao carregar caderno oficial:', error);
    return NextResponse.json(
      { success: false, error: 'Falha interna ao recuperar dados do caderno oficial.' },
      { status: 500 }
    );
  }
}
