import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Question, StudyModalidade } from '@/types';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import {
  CANONICAL_QUESTION_TABLES,
  findCanonicalQuestionsByIdsOrCodes
} from '@/services/canonicalQuestionStore';

export const dynamic = 'force-dynamic';

interface QuestionDbRow {
  id: string;
  code?: string;
  institution?: string;
  banca?: string;
  year?: number;
  tipo_prova?: string;
  modalidade?: string;
  especialidade?: string;
  tema?: string;
  foco?: string;
  subfoco?: string;
  difficulty?: 'Fácil' | 'Médio' | 'Difícil' | 'Desconhecido';
  type?: 'Múltipla escolha' | 'Discursiva' | 'Verdadeiro ou falso';
  is_anulada?: boolean;
  statement?: string;
  options?: { letter: 'A' | 'B' | 'C' | 'D' | 'E'; text: string }[];
  correct_answer?: string;
  commentary?: string;
  images?: string[];
}

let examIdsIndex: Record<string, string[]> | null = null;

function getExamIdsIndex(): Record<string, string[]> {
  if (!examIdsIndex) {
    const filePath = path.resolve(process.cwd(), 'data/exam_to_question_ids.json');
    if (fs.existsSync(filePath)) {
      examIdsIndex = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else {
      examIdsIndex = {};
    }
  }
  return examIdsIndex!;
}

export async function GET(req: NextRequest) {
  try {
    // 1. Verificação estrita de autorização de Administrador / Curador
    const auth = await verifyAdminSession(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Acesso negado: permissões insuficientes.' },
        { status: auth.status }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const examKey = searchParams.get('examKey');
    const onlyMissing = searchParams.get('onlyMissing') === 'true';

    if (!examKey) {
      return NextResponse.json(
        { success: false, error: 'Parâmetro examKey é obrigatório.' },
        { status: 400 }
      );
    }

    const index = getExamIdsIndex();
    const ids = index[examKey];

    let rows: QuestionDbRow[] = [];

    if (ids && ids.length > 0) {
      // 1. Busca ultrarrápida indexada por IDs primários nas 4 tabelas canônicas
      rows = await findCanonicalQuestionsByIdsOrCodes<QuestionDbRow>(
        supabaseAdmin,
        ids.slice(0, 250),
        '*'
      );
    } else {
      // 2. Fallback direto por instituição e ano nas 4 tabelas canônicas
      const parts = examKey.split(' | ');
      const inst = parts[0]?.trim();
      const ano = Number(parts[2]) || 0;

      if (!inst) {
        return NextResponse.json(
          { success: false, error: 'Identificador de prova inválido.', questions: [], stats: { total: 0, withAnswer: 0, anuladas: 0, missing: 0, percentual: 0 } },
          { status: 404 }
        );
      }

      const tableQueries = await Promise.all(
        CANONICAL_QUESTION_TABLES.map(async (table) => {
          let q = supabaseAdmin.from(table).select('*').eq('institution', inst);
          if (ano > 0) q = q.eq('year', ano);
          const { data, error } = await q.limit(200);
          return error ? [] : ((data as unknown as QuestionDbRow[]) || []);
        })
      );
      rows = tableQueries.flat().slice(0, 250);
    }

    // Mapear para o formato Question
    const mappedQuestions: Question[] = rows.map((row) => ({
      id: row.id,
      code: row.code || '',
      institution: row.institution || '',
      banca: row.banca || '',
      year: row.year || 0,
      tipoProva: row.tipo_prova || 'Prova 1 / Regular',
      modalidade: (row.modalidade || 'Residência Médica') as StudyModalidade,
      especialidade: row.especialidade || '',
      specialty: row.especialidade || '',
      tema: row.tema || '',
      foco: row.foco || '',
      subfoco: row.subfoco || '',
      difficulty: row.difficulty || 'Médio',
      type: row.type || 'Múltipla escolha',
      isAnulada: Boolean(row.is_anulada),
      statement: row.statement || '',
      options: Array.isArray(row.options) ? row.options : [],
      correctAnswer: (row.correct_answer || '') as 'A' | 'B' | 'C' | 'D' | 'E' | '',
      commentary: row.commentary || '',
      images: Array.isArray(row.images) ? row.images : []
    }));

    // Ordenar de forma determinística por código ou ID
    mappedQuestions.sort((a, b) => a.code.localeCompare(b.code));

    // Estatísticas da prova em tempo real
    let withAnswer = 0;
    let anuladas = 0;
    let missing = 0;

    for (const q of mappedQuestions) {
      if (q.isAnulada) {
        anuladas++;
      } else if (q.correctAnswer && ['A', 'B', 'C', 'D', 'E'].includes(q.correctAnswer)) {
        withAnswer++;
      } else {
        missing++;
      }
    }

    const stats = {
      total: mappedQuestions.length,
      withAnswer,
      anuladas,
      missing,
      percentual: mappedQuestions.length > 0 ? Number((((withAnswer + anuladas) / mappedQuestions.length) * 100).toFixed(1)) : 0
    };

    let resultQuestions = mappedQuestions;
    if (onlyMissing) {
      resultQuestions = mappedQuestions.filter(q => !q.isAnulada && !q.correctAnswer);
    }

    return NextResponse.json({
      success: true,
      examKey,
      stats,
      questions: resultQuestions
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao carregar questões da prova';
    console.error('[API Curadoria questoes-prova] Exceção:', err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
