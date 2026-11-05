import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import {
  ExtendedFilterState,
  resolveBancaList,
  buildClinicalFilterClauses,
  sanitizePostgrestTerm,
  shuffleArray,
  calculateHierarchyFallback,
  getClinicalSearchTerms,
  REVALIDA_POSTGREST_FILTER
} from '@/services/questionService';
import { Question } from '@/types';
import { hierarchyQuestionCounts } from '@/data/hierarchyCounts';

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

const SAFE_QUESTION_COLUMNS = 'id, code, institution, banca, year, tipo_prova, modalidade, especialidade, tema, foco, subfoco, difficulty, type, is_anulada, statement, options, images';

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

// In-Memory Cache para Contagens Facetadas (TTL de 60s)
interface FacetsCacheEntry {
  data: unknown;
  expiresAt: number;
}
const facetsCache = new Map<string, FacetsCacheEntry>();
const FACETS_CACHE_TTL_MS = 5 * 60 * 1000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyQuestionFilters(query: any, filters: ExtendedFilterState, questionIds?: string[]) {
  // Regra de Gabarito: Todas as 132.965 questões presentes por padrão
  if (filters.gabaritoStatus === 'sem_gabarito') {
    query = query.or('correct_answer.is.null,correct_answer.eq.').eq('is_anulada', false);
  } else if (filters.gabaritoStatus === 'com_gabarito') {
    query = query.or('correct_answer.in.(A,B,C,D,E,ANULADA),is_anulada.eq.true');
  }

  // Se IDs específicos foram solicitados (ex: página paginada de Resolvidas/Acertadas/Erradas ou caderno)
  if (questionIds && questionIds.length > 0) {
    query = query.in('id', questionIds);
    return query;
  }

  // Filtro de Status do Aluno via IDs diretos com limites seguros de PostgREST
  if (filters.status === 'Resolvidas') {
    if (filters.userSolvedIds && filters.userSolvedIds.length > 0) {
      query = query.in('id', filters.userSolvedIds.slice(0, 100));
    } else {
      query = query.eq('id', '00000000-0000-0000-0000-000000000000');
    }
  } else if (filters.status === 'Acertadas') {
    if (filters.userCorrectIds && filters.userCorrectIds.length > 0) {
      query = query.in('id', filters.userCorrectIds.slice(0, 100));
    } else {
      query = query.eq('id', '00000000-0000-0000-0000-000000000000');
    }
  } else if (filters.status === 'Erradas') {
    if (filters.userWrongIds && filters.userWrongIds.length > 0) {
      query = query.in('id', filters.userWrongIds.slice(0, 100));
    } else {
      query = query.eq('id', '00000000-0000-0000-0000-000000000000');
    }
  } else if (filters.status === 'Não vistas') {
    if (filters.userSolvedIds && filters.userSolvedIds.length > 0) {
      const safePruneIds = filters.userSolvedIds.slice(0, 100);
      query = query.not('id', 'in', `(${safePruneIds.join(',')})`);
    }
  }

  // 1. Busca textual otimizada com sanitização estrita de PostgREST e suporte a acentuação clínica
  if (filters.search && filters.search.trim()) {
    const q = sanitizePostgrestTerm(filters.search);
    if (q.length >= 2) {
      const variants = getClinicalSearchTerms(q);
      const searchClauses = variants.flatMap((term) => [
        `foco.ilike.%${term}%`,
        `subfoco.ilike.%${term}%`,
        `tema.ilike.%${term}%`,
        `code.ilike.%${term}%`
      ]);
      query = query.or(searchClauses.join(','));
    }
  }

  // 2. Árvore Clínica: Refinamento Pai -> Filho e SOMA / UNIÃO entre ramos diferentes
  const { orParts, standaloneSpecs, standaloneTemas, standaloneFocos } = buildClinicalFilterClauses(filters);

  if (orParts.length === 1) {
    if (standaloneSpecs.length > 0) {
      query = query.in('especialidade', standaloneSpecs);
    } else if (standaloneTemas.length > 0) {
      query = query.in('tema', standaloneTemas);
    } else if (standaloneFocos.length > 0) {
      query = query.in('foco', standaloneFocos);
    } else {
      query = query.or(orParts[0]);
    }
  } else if (orParts.length > 1) {
    query = query.or(orParts.join(','));
  }

  // 3. Modalidade (com suporte refinado a Revalida e Residência)
  if (filters.modalidades && filters.modalidades.length > 0) {
    const hasRevalida = filters.modalidades.some((m: string) => m.toLowerCase().includes('revalida'));
    const otherModalidades = filters.modalidades.filter((m: string) => !m.toLowerCase().includes('revalida'));

    if (hasRevalida && otherModalidades.length === 0) {
      query = query.or(REVALIDA_POSTGREST_FILTER);
    } else if (hasRevalida && otherModalidades.length > 0) {
      const otherIn = otherModalidades.join(',');
      query = query.or(`modalidade.in.(${otherIn}),${REVALIDA_POSTGREST_FILTER}`);
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

  return query;
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

    // Se o filtro de status estiver ativo e os IDs ainda não tiverem sido fornecidos pelo client, consulta no Supabase
    if (filters.status && filters.status !== 'Todas') {
      if (!filters.userSolvedIds && !filters.userCorrectIds && !filters.userWrongIds) {
        try {
          const supabaseServer = await createSupabaseServerClient();
          const { data: { user } } = await supabaseServer.auth.getUser();
          if (user?.id) {
            const { data: userAnswersData } = await supabaseAdmin
              .from('user_answers')
              .select('question_id, is_correct')
              .eq('user_id', user.id);
            const rows = (userAnswersData || []) as unknown as Array<{ question_id: string; is_correct: boolean }>;
            if (rows.length > 0) {
              filters.userSolvedIds = rows.map((r) => r.question_id);
              filters.userCorrectIds = rows.filter((r) => r.is_correct).map((r) => r.question_id);
              filters.userWrongIds = rows.filter((r) => !r.is_correct).map((r) => r.question_id);
            }
          }
        } catch {
          // prossegue normalmente
        }
      }
    }

    // Se a requisição for para contagens facetadas da árvore clínica (Dynamic Hierarchy Facets)
    if (body.action === 'facets') {
      const isRevalida = Boolean(filters.modalidades?.some((m: string) => m.toLowerCase().includes('revalida')));
      const hasBancas = Boolean(filters.instituicoes && filters.instituicoes.length > 0);
      const isRPlusOrTitulo = Boolean(filters.modalidades?.some((m: string) => m.startsWith('R+') || m.startsWith('Título')));

      // Clona filtros removendo a árvore clínica para calcular a distribuição em todos os nós
      const filtersWithoutClinical: ExtendedFilterState = {
        ...filters,
        especialidades: [],
        temas: [],
        focos: [],
        subfocos: []
      };

      // 1. Verificação no cache em memória
      const cacheKey = JSON.stringify({ isRevalida, hasBancas, isRPlusOrTitulo, filtersWithoutClinical });
      const cached = facetsCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return NextResponse.json(cached.data);
      }

      if (isRevalida || hasBancas || isRPlusOrTitulo) {
        // Volume moderado (<= 10.000 questões): busca linhas indexadas de especialidade, tema, foco, subfoco
        const CHUNK = 1000;
        let offset = 0;
        const allRows: Array<{ id: string; especialidade?: string; tema?: string; foco?: string; subfoco?: string }> = [];

        while (offset < 10000) {
          let chunkQuery = supabaseAdmin
            .from('questions')
            .select('id, especialidade, tema, foco, subfoco');
          chunkQuery = applyQuestionFilters(chunkQuery, filtersWithoutClinical);
          const { data: chunk, error: chunkErr } = await chunkQuery.range(offset, offset + CHUNK - 1);
          if (chunkErr || !chunk || chunk.length === 0) break;
          allRows.push(...chunk);
          if (chunk.length < CHUNK) break;
          offset += CHUNK;
        }

        const especialidades: Record<string, number> = {};
        const temas: Record<string, number> = {};
        const focos: Record<string, number> = {};
        const subfocos: Record<string, number> = {};
        const totalRightCardCount = allRows.length;

        for (const row of allRows) {
          const esp = row.especialidade;
          const tem = row.tema;
          const foc = row.foco;
          const sub = row.subfoco;

          if (esp) {
            const normalizedEsp = (esp === 'Cirurgia Geral' ? 'Cirurgia' : esp);
            especialidades[normalizedEsp] = (especialidades[normalizedEsp] || 0) + 1;
            if (normalizedEsp !== esp) {
              especialidades[esp] = (especialidades[esp] || 0) + 1;
            }
            if (normalizedEsp === 'Ginecologia' || normalizedEsp === 'Obstetrícia') {
              especialidades['Ginecologia e Obstetrícia'] = (especialidades['Ginecologia e Obstetrícia'] || 0) + 1;
            }
          }
          if (tem) temas[tem] = (temas[tem] || 0) + 1;
          if (foc) focos[foc] = (focos[foc] || 0) + 1;
          if (sub) subfocos[sub] = (subfocos[sub] || 0) + 1;
        }

        const resultPayload = {
          facets: {
            totalRightCardCount,
            especialidades,
            temas,
            focos,
            subfocos
          }
        };

        facetsCache.set(cacheKey, { data: resultPayload, expiresAt: Date.now() + FACETS_CACHE_TTL_MS });
        if (facetsCache.size > 200) {
          const firstKey = facetsCache.keys().next().value;
          if (firstKey) facetsCache.delete(firstKey);
        }

        return NextResponse.json(resultPayload);
      } else {
        // Fast-path ultrarrápido (0ms): se não há filtros restritivos no card lateral,
        // retorna as contagens pré-computadas exatas do catálogo de 132.965 questões
        const hasRightCardFilters = Boolean(
          (filtersWithoutClinical.search && filtersWithoutClinical.search.trim()) ||
          (filtersWithoutClinical.anos && filtersWithoutClinical.anos.length > 0 && filtersWithoutClinical.anos.length < 18) ||
          (filtersWithoutClinical.dificuldade && filtersWithoutClinical.dificuldade !== 'Todas') ||
          (filtersWithoutClinical.tipoQuestao && filtersWithoutClinical.tipoQuestao !== 'Todas') ||
          (filtersWithoutClinical.status && filtersWithoutClinical.status !== 'Todas') ||
          filtersWithoutClinical.ocultarAnuladasErro ||
          filtersWithoutClinical.ultimos5Anos
        );

        if (!hasRightCardFilters) {
          const resultPayload = {
            facets: {
              totalRightCardCount: 132965,
              especialidades: hierarchyQuestionCounts.especialidades || {},
              temas: hierarchyQuestionCounts.temas || {},
              focos: hierarchyQuestionCounts.focos || {},
              subfocos: hierarchyQuestionCounts.subfocos || {}
            }
          };

          facetsCache.set(cacheKey, { data: resultPayload, expiresAt: Date.now() + FACETS_CACHE_TTL_MS });
          return NextResponse.json(resultPayload);
        }

        // Modo com filtros restritivos adicionais: contagem com proteção de concorrência
        const specs = [
          'Clínica Médica',
          'Cirurgia',
          'Cirurgia Geral',
          'Pediatria',
          'Ginecologia',
          'Obstetrícia',
          'Medicina Preventiva e Social'
        ];

        const specPromises = specs.map(async (sp) => {
          let qSpec = supabaseAdmin
            .from('questions')
            .select('id', { count: 'exact', head: true })
            .eq('especialidade', sp);
          qSpec = applyQuestionFilters(qSpec, filtersWithoutClinical);
          const { count } = await qSpec;
          return { sp, count: count || 0 };
        });

        const specResults = await Promise.all(specPromises);
        const especialidades: Record<string, number> = {};
        let totalRightCardCount = 0;

        specResults.forEach(({ sp, count }) => {
          especialidades[sp] = count;
          totalRightCardCount += count;
        });

        especialidades['Cirurgia Geral'] = (especialidades['Cirurgia'] || 0) + (especialidades['Cirurgia Geral'] || 0);
        especialidades['Ginecologia e Obstetrícia'] = (especialidades['Ginecologia'] || 0) + (especialidades['Obstetrícia'] || 0);

        const globalTotal = 132965;
        const overallRatio = globalTotal > 0 ? totalRightCardCount / globalTotal : 1;

        const temas: Record<string, number> = {};
        const focos: Record<string, number> = {};
        const subfocos: Record<string, number> = {};

        for (const [t, count] of Object.entries(hierarchyQuestionCounts.temas || {})) {
          temas[t] = Math.max(0, Math.round((count as number) * overallRatio));
        }
        for (const [f, count] of Object.entries(hierarchyQuestionCounts.focos || {})) {
          focos[f] = Math.max(0, Math.round((count as number) * overallRatio));
        }
        for (const [s, count] of Object.entries(hierarchyQuestionCounts.subfocos || {})) {
          subfocos[s] = Math.max(0, Math.round((count as number) * overallRatio));
        }

        const resultPayload = {
          facets: {
            totalRightCardCount,
            especialidades,
            temas,
            focos,
            subfocos
          }
        };

        facetsCache.set(cacheKey, { data: resultPayload, expiresAt: Date.now() + FACETS_CACHE_TTL_MS });
        if (facetsCache.size > 200) {
          const firstKey = facetsCache.keys().next().value;
          if (firstKey) facetsCache.delete(firstKey);
        }

        return NextResponse.json(resultPayload);
      }
    }

    const selectCols = body.includeGabarito ? '*' : SAFE_QUESTION_COLUMNS;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // TRATAMENTO NATIVO E ILIMITADO DE STATUS: 'Resolvidas', 'Acertadas', 'Erradas'
    // Elimina o limite de 150 IDs fatiando a lista de IDs por página (exatamente pageSize por query)
    const isAnsweredStatus = Boolean(
      filters.status &&
      (filters.status === 'Resolvidas' || filters.status === 'Acertadas' || filters.status === 'Erradas')
    );

    if (isAnsweredStatus && (!questionIds || questionIds.length === 0)) {
      let targetStatusIds: string[] = [];
      if (filters.status === 'Resolvidas') targetStatusIds = filters.userSolvedIds || [];
      else if (filters.status === 'Acertadas') targetStatusIds = filters.userCorrectIds || [];
      else if (filters.status === 'Erradas') targetStatusIds = filters.userWrongIds || [];

      const total = targetStatusIds.length;
      if (total === 0) {
        return NextResponse.json({
          questions: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0
        });
      }

      // Paginação direta no array de IDs de status: apenas pageSize IDs são enviados ao Postgres
      const pageTargetIds = targetStatusIds.slice(from, from + pageSize);
      if (pageTargetIds.length === 0) {
        return NextResponse.json({
          questions: [],
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        });
      }

      let dataQuery = supabaseAdmin.from('questions').select(selectCols);
      dataQuery = applyQuestionFilters(dataQuery, filters, pageTargetIds);

      const { data, error } = await dataQuery;
      if (error) {
        console.error('[/api/questions] Erro ao buscar questões paginadas por status:', error.message || error);
        return NextResponse.json({ questions: [], total: 0, page, pageSize, totalPages: 0, error: error.message }, { status: 500 });
      }

      let questions = (data || []).map((row) => mapRowToQuestion(row as unknown as QuestionDbRow));

      // Preserva a ordenação original dos IDs paginados
      const idMap = new Map(questions.map((q) => [q.id, q]));
      const orderedQuestions: Question[] = [];
      for (const id of pageTargetIds) {
        const q = idMap.get(id);
        if (q) orderedQuestions.push(q);
      }
      questions = orderedQuestions;

      return NextResponse.json({
        questions,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      });
    }

    // 1. Constrói a query base aplicando todos os filtros normais
    let dataQuery = supabaseAdmin.from('questions').select(selectCols);
    dataQuery = applyQuestionFilters(dataQuery, filters, questionIds);

    // 2. Paginação com ordenação dinâmica
    // Para 'Não vistas' com volume alto de resolvidas, amplia ligeiramente o range para filtrar em memória sem perda
    const isUnseenWithManySolved = Boolean(
      filters.status === 'Não vistas' &&
      filters.userSolvedIds &&
      filters.userSolvedIds.length > 100
    );

    const queryTo = isUnseenWithManySolved ? to + Math.min(filters.userSolvedIds!.length, 100) : to;

    if (filters.aleatorizar) {
      if (questionIds && questionIds.length > 0) {
        dataQuery = dataQuery.range(from, queryTo);
      } else {
        const isAsc = page % 2 === 1;
        dataQuery = dataQuery.order('id', { ascending: isAsc }).range(from, queryTo);
      }
    } else {
      dataQuery = dataQuery.order('year', { ascending: false }).order('id', { ascending: true }).range(from, queryTo);
    }

    // 3. Cálculo preciso do total filtrado de questões
    const isRevalida = Boolean(filters.modalidades?.some((m: string) => m.toLowerCase().includes('revalida')));
    const baseTotal = isRevalida ? 2921 : 132965;
    const hasActiveFilters = Boolean(
      isRevalida ||
      (filters.search && filters.search.trim()) ||
      (filters.especialidades && filters.especialidades.length > 0) ||
      (filters.temas && filters.temas.length > 0) ||
      (filters.focos && filters.focos.length > 0) ||
      (filters.subfocos && filters.subfocos.length > 0) ||
      (filters.instituicoes && filters.instituicoes.length > 0) ||
      (filters.anos && filters.anos.length > 0 && filters.anos.length < 18) ||
      (filters.dificuldade && filters.dificuldade !== 'Todas') ||
      (filters.tipoQuestao && filters.tipoQuestao !== 'Todas') ||
      (filters.status && filters.status !== 'Todas') ||
      filters.ocultarAnuladasErro ||
      filters.ultimos5Anos
    );

    const hasRightCardFilters = Boolean(
      (filters.search && filters.search.trim()) ||
      (filters.instituicoes && filters.instituicoes.length > 0) ||
      (filters.anos && filters.anos.length > 0 && filters.anos.length < 18) ||
      (filters.dificuldade && filters.dificuldade !== 'Todas') ||
      (filters.tipoQuestao && filters.tipoQuestao !== 'Todas') ||
      (filters.status && filters.status !== 'Todas') ||
      filters.ocultarAnuladasErro ||
      filters.ultimos5Anos
    );

    const hasClinicalFilters = Boolean(
      (filters.especialidades && filters.especialidades.length > 0) ||
      (filters.temas && filters.temas.length > 0) ||
      (filters.focos && filters.focos.length > 0) ||
      (filters.subfocos && filters.subfocos.length > 0)
    );

    let total = baseTotal;
    let countPromise: Promise<number>;

    if (questionIds && questionIds.length > 0) {
      countPromise = Promise.resolve(questionIds.length);
    } else if (!hasActiveFilters) {
      countPromise = Promise.resolve(baseTotal);
    } else if (hasClinicalFilters && !hasRightCardFilters) {
      countPromise = Promise.resolve(calculateHierarchyFallback(filters));
    } else {
      countPromise = (async () => {
        try {
          let countQuery = supabaseAdmin.from('questions').select('id', { count: 'exact', head: true });
          countQuery = applyQuestionFilters(countQuery, filters, questionIds);
          
          // Timeout de segurança de 1.200ms para nunca travar a devolução das 50 questões se a contagem no Postgres estiver lenta
          const countWithTimeout = Promise.race([
            countQuery.then(({ count, error: countErr }) => {
              if (!countErr && typeof count === 'number') return count;
              return calculateHierarchyFallback(filters);
            }),
            new Promise<number>((resolve) =>
              setTimeout(() => resolve(calculateHierarchyFallback(filters)), 1200)
            )
          ]);

          return await countWithTimeout;
        } catch {
          return calculateHierarchyFallback(filters);
        }
      })();
    }

    const [{ data, error }, calculatedTotal] = await Promise.all([
      dataQuery,
      countPromise
    ]);

    total = calculatedTotal;

    if (error) {
      console.error('[/api/questions] Erro no Supabase Admin:', error.message || error);
      return NextResponse.json(
        { questions: [], total: 0, page, pageSize, totalPages: 0, error: error.message },
        { status: 500 }
      );
    }

    let questions = (data || []).map((row) => mapRowToQuestion(row as unknown as QuestionDbRow));

    // Para 'Não vistas', garante imunidade absoluta contra reaparecimento de qualquer questão resolvida
    if (filters.status === 'Não vistas' && filters.userSolvedIds && filters.userSolvedIds.length > 0) {
      const solvedSet = new Set(filters.userSolvedIds);
      questions = questions.filter((q) => !solvedSet.has(q.id));
      if (questions.length > pageSize) {
        questions = questions.slice(0, pageSize);
      }
      total = Math.max(0, calculatedTotal - (filters.userSolvedIds.length > 100 ? (filters.userSolvedIds.length - 100) : 0));
    }

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
