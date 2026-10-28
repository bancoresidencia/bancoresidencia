import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  ExtendedFilterState,
  FetchQuestionsResult,
  resolveBancaList,
  getParentFocosForSubfocoList,
  sanitizePostgrestTerm,
  shuffleArray
} from '@/services/questionService';
import { Question } from '@/types';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

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
  statement: string;
  options?: { letter: 'A' | 'B' | 'C' | 'D' | 'E'; text: string }[];
  correct_answer?: 'A' | 'B' | 'C' | 'D' | 'E';
  commentary?: string;
  images?: string[];
}

function mapRowToQuestion(row: QuestionDbRow): Question {
  return {
    id: row.id,
    code: row.code || '',
    institution: row.institution || '',
    banca: row.banca || '',
    year: row.year || 2024,
    tipoProva: row.tipo_prova || 'Prova 1',
    modalidade: (row.modalidade as Question['modalidade']) || 'Residência Médica',
    modalidades: row.modalidade ? [(row.modalidade as Question['modalidade'])] : ['Residência Médica'],
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
    correctAnswer: (row.correct_answer as Question['correctAnswer']) || '',
    commentary: row.commentary || '',
    images: Array.isArray(row.images) ? row.images : []
  };
}

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json().catch(() => ({}));
    const {
      filters = {} as ExtendedFilterState,
      page = 1,
      pageSize = 50,
      questionIds
    } = body;

    let query = supabaseAdmin.from('questions').select('*');

    // Regra de Gabarito: Todas as 132.965 questões presentes por padrão
    if (filters.gabaritoStatus === 'sem_gabarito') {
      query = query.or('correct_answer.is.null,correct_answer.eq.').eq('is_anulada', false);
    } else if (filters.gabaritoStatus === 'com_gabarito') {
      query = query.or('correct_answer.in.(A,B,C,D,E,ANULADA),is_anulada.eq.true');
    }

    // Filtro de Status do Aluno via IDs diretos
    if (filters.status === 'Resolvidas') {
      if (!filters.userSolvedIds || filters.userSolvedIds.length === 0) {
        return NextResponse.json({ questions: [], total: 0, page, pageSize, totalPages: 0 });
      }
      query = query.in('id', filters.userSolvedIds.slice(0, 2000));
    } else if (filters.status === 'Acertadas') {
      if (!filters.userCorrectIds || filters.userCorrectIds.length === 0) {
        return NextResponse.json({ questions: [], total: 0, page, pageSize, totalPages: 0 });
      }
      query = query.in('id', filters.userCorrectIds.slice(0, 2000));
    } else if (filters.status === 'Erradas') {
      if (!filters.userWrongIds || filters.userWrongIds.length === 0) {
        return NextResponse.json({ questions: [], total: 0, page, pageSize, totalPages: 0 });
      }
      query = query.in('id', filters.userWrongIds.slice(0, 2000));
    } else if (filters.status === 'Não vistas') {
      if (filters.userSolvedIds && filters.userSolvedIds.length > 0) {
        query = query.not('id', 'in', `(${filters.userSolvedIds.slice(0, 500).join(',')})`);
      }
    }

    // Se IDs específicos foram solicitados (resolvendo uma lista do aluno)
    if (questionIds && questionIds.length > 0) {
      query = query.in('id', questionIds);
    } else {
      // 1. Busca textual otimizada com sanitização estrita de PostgREST
      if (filters.search && filters.search.trim()) {
        const q = sanitizePostgrestTerm(filters.search);
        if (q.length >= 2) {
          if (/^[A-Za-z0-9_-]{3,}$/.test(q)) {
            query = query.or(`code.ilike.%${q}%,foco.ilike.%${q}%,tema.ilike.%${q}%,banca.ilike.%${q}%`);
          } else {
            query = query.or(`foco.ilike.%${q}%,subfoco.ilike.%${q}%,tema.ilike.%${q}%,banca.ilike.%${q}%,code.ilike.%${q}%`);
          }
        }
      }

      // 2. Árvore Clínica: SOMA / UNIÃO entre ramos diferentes e normalização ampla
      const specs = new Set<string>();
      if (filters.especialidades && filters.especialidades.length > 0) {
        filters.especialidades.forEach((sp: string) => {
          specs.add(sp);
          if (sp === 'Cirurgia Geral' || sp === 'Cirurgia') {
            specs.add('Cirurgia');
            specs.add('Cirurgia Geral');
          }
          if (sp === 'Ginecologia e Obstetrícia') {
            specs.add('Ginecologia');
            specs.add('Obstetrícia');
          } else if (sp === 'Ginecologia' || sp === 'Obstetrícia') {
            specs.add(sp);
            specs.add('Ginecologia e Obstetrícia');
          }
          if (sp === 'Medicina Preventiva' || sp === 'Medicina Preventiva e Social') {
            specs.add('Medicina Preventiva e Social');
            specs.add('Medicina Preventiva');
          }
        });
      }

      const contentOrParts: string[] = [];
      if (specs.size > 0) {
        const specList = Array.from(specs).map((s) => `"${s}"`).join(',');
        contentOrParts.push(`especialidade.in.(${specList})`);
      }
      if (filters.temas && filters.temas.length > 0) {
        const temaList = filters.temas.map((t: string) => `"${t}"`).join(',');
        contentOrParts.push(`tema.in.(${temaList})`);
      }
      if (filters.focos && filters.focos.length > 0) {
        const focoList = filters.focos.map((f: string) => `"${f}"`).join(',');
        contentOrParts.push(`foco.in.(${focoList})`);
      }
      const parentFocos = (filters.subfocos && filters.subfocos.length > 0)
        ? getParentFocosForSubfocoList(filters.subfocos)
        : [];

      if (filters.subfocos && filters.subfocos.length > 0) {
        const subfocoList = filters.subfocos.map((s: string) => `"${s}"`).join(',');
        if (parentFocos.length > 0) {
          const parentFocoList = parentFocos.map((f) => `"${f}"`).join(',');
          contentOrParts.push(`and(foco.in.(${parentFocoList}),subfoco.in.(${subfocoList}))`);
        } else {
          contentOrParts.push(`subfoco.in.(${subfocoList})`);
        }
      }

      if (contentOrParts.length === 1) {
        if (specs.size > 0) {
          query = query.in('especialidade', Array.from(specs));
        } else if (filters.temas && filters.temas.length > 0) {
          query = query.in('tema', filters.temas);
        } else if (filters.focos && filters.focos.length > 0) {
          query = query.in('foco', filters.focos);
        } else if (filters.subfocos && filters.subfocos.length > 0) {
          if (parentFocos.length > 0) {
            query = query.in('foco', parentFocos).in('subfoco', filters.subfocos);
          } else {
            query = query.in('subfoco', filters.subfocos);
          }
        }
      } else if (contentOrParts.length > 1) {
        query = query.or(contentOrParts.join(','));
      }

      // 3. Modalidade (com suporte refinado a Revalida e Residência)
      if (filters.modalidades && filters.modalidades.length > 0) {
        const hasRevalida = filters.modalidades.some((m: string) => m.toLowerCase().includes('revalida'));
        const otherModalidades = filters.modalidades.filter((m: string) => !m.toLowerCase().includes('revalida'));

        if (hasRevalida && otherModalidades.length === 0) {
          query = query.or('modalidade.eq.Revalida,banca.ilike.%Revalida%,institution.ilike.%Revalida%,code.ilike.INEPREVALIDA%');
        } else if (hasRevalida && otherModalidades.length > 0) {
          const otherIn = otherModalidades.join(',');
          query = query.or(`modalidade.in.(${otherIn}),banca.ilike.%Revalida%,institution.ilike.%Revalida%,code.ilike.INEPREVALIDA%`);
        } else {
          const isOnlyDefaultResidencia =
            filters.modalidades.length === 1 &&
            filters.modalidades[0] === 'Residência Médica';
          if (!isOnlyDefaultResidencia) {
            query = query.in('modalidade', filters.modalidades);
          }
        }
      }

      // 4. Instituições / Bancas
      if (filters.instituicoes && filters.instituicoes.length > 0) {
        const resolved = resolveBancaList(filters.instituicoes);
        if (resolved.length > 0) {
          query = query.in('banca', resolved);
        }
      }

      // 5. Anos
      if (filters.anos && filters.anos.length > 0) {
        query = query.in('year', filters.anos);
      }

      // 6. Tipo de Prova
      if (filters.tipoProva && filters.tipoProva.length > 0) {
        query = query.in('tipo_prova', filters.tipoProva);
      }

      // 7. Dificuldade
      if (filters.dificuldade && filters.dificuldade !== 'Todas') {
        query = query.eq('difficulty', filters.dificuldade);
      }

      // 8. Tipo de Questão
      if (filters.tipoQuestao && filters.tipoQuestao !== 'Todas') {
        query = query.eq('type', filters.tipoQuestao);
      }

      // 9. Ocultar Anuladas
      if (filters.ocultarAnuladasErro) {
        query = query.eq('is_anulada', false);
      }

      // 10. Últimos 5 anos
      if (filters.ultimos5Anos) {
        const minYear = new Date().getFullYear() - 4;
        query = query.gte('year', minYear);
      }
    }

    // Paginação com ordenação dinâmica
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    if (filters.aleatorizar) {
      if (questionIds && questionIds.length > 0) {
        query = query.range(from, to);
      } else {
        const isAsc = page % 2 === 1;
        query = query.order('id', { ascending: isAsc }).range(from, to);
      }
    } else {
      query = query.order('year', { ascending: false }).order('id', { ascending: true }).range(from, to);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[/api/questions] Erro no Supabase Admin:', error.message || error);
      return NextResponse.json(
        { questions: [], total: 0, page, pageSize, totalPages: 0, error: error.message },
        { status: 500 }
      );
    }

    let questions = (data || []).map(mapRowToQuestion);

    if (questionIds && questionIds.length > 0) {
      const idMap = new Map(questions.map((q) => [q.id, q]));
      const reordered: Question[] = [];
      for (const id of questionIds) {
        const q = idMap.get(id);
        if (q) reordered.push(q);
      }
      questions = reordered;
    } else if (filters.aleatorizar) {
      questions = shuffleArray(questions);
    }

    const total = 132965; // Ou o valor calculado
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      questions,
      total,
      page,
      pageSize,
      totalPages
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno do servidor';
    console.error('[/api/questions] Exceção:', err);
    return NextResponse.json({ questions: [], total: 0, page: 1, pageSize: 50, totalPages: 0, error: msg }, { status: 500 });
  }
}
