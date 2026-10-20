import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { Question, StudyModalidade } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

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
      // 1. Busca ultrarrápida indexada por IDs primários
      const { data, error } = await supabaseAdmin
        .from('questions')
        .select('*')
        .in('id', ids.slice(0, 250));

      if (error) {
        console.error('[API Curadoria questoes-prova] Erro Supabase por IDs:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      rows = (data as unknown as QuestionDbRow[]) || [];
    } else {
      // 2. Fallback direto por instituição e ano
      const parts = examKey.split(' | ');
      const inst = parts[0]?.trim();
      const ano = Number(parts[2]) || 0;

      if (!inst) {
        return NextResponse.json(
          { success: false, error: 'Identificador de prova inválido.', questions: [], stats: { total: 0, withAnswer: 0, anuladas: 0, missing: 0, percentual: 0 } },
          { status: 404 }
        );
      }

      let q = supabaseAdmin.from('questions').select('*').eq('institution', inst);
      if (ano > 0) q = q.eq('year', ano);

      const { data, error } = await q.limit(200);
      if (error) {
        console.error('[API Curadoria questoes-prova] Erro Supabase fallback:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      rows = (data as unknown as QuestionDbRow[]) || [];
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
