import { NextRequest, NextResponse } from 'next/server';
import { createClient as createPublicSupabaseClient } from '@supabase/supabase-js';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';
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
import {
  sanitizePostgrestQuotedValue,
  validateQuestionId,
  safeErrorMessage
} from '@/utils/security';
import { Question } from '@/types';
import { hierarchyQuestionCounts } from '@/data/hierarchyCounts';
import { getHomologatedBaseline } from '@/data/homologatedFacetsBaseline';
import { generateSessionTicket } from '@/utils/securityTickets';
import { sanitizeMedicalText } from '@/utils/textSanitizer';
import { resolveCanonicalViewsForModalidades } from '@/services/canonicalQuestionStore';

import { CANONICAL_BANCAS_DIRECTORY } from '@/data/canonicalBancasDirectory';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { isSqliteAvailable, queryQuestionsFromSqlite, queryFacetsFromSqlite } from '@/lib/sqliteQuestions';
import { normalizeStudyQuery } from '@/services/studyQuestionCatalog';
import { normalizeStudyFormats } from '@/utils/studyQuestionFilters';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

let cachedPublicSupabaseClient: ReturnType<typeof createPublicSupabaseClient> | null = null;

function getQuestionsReadClient(isPrivileged: boolean, supabaseAdmin: ReturnType<typeof getSupabaseAdmin>) {
  if (isPrivileged) return supabaseAdmin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return supabaseAdmin;
  if (!cachedPublicSupabaseClient) {
    cachedPublicSupabaseClient = createPublicSupabaseClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }
  return cachedPublicSupabaseClient;
}

const SAFE_QUESTION_COLUMNS = 'id, code, institution, banca, year, tipo_prova, modalidade, especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type, is_anulada, statement, options, images';

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
  sub_subfoco?: string;
  difficulty?: 'Fácil' | 'Médio' | 'Difícil' | 'Desconhecido';
  type?: string;
  is_anulada?: boolean;
  statement: string;
  options?: { letter: 'A' | 'B' | 'C' | 'D' | 'E'; text: string }[];
  correct_answer?: 'A' | 'B' | 'C' | 'D' | 'E';
  commentary?: string;
  images?: string[];
}

interface StudyQuestionRequest {
  action?: string;
  filters?: ExtendedFilterState;
  page?: number;
  pageSize?: number;
  questionIds?: unknown;
  quota?: string;
  excludeIds?: string[];
  includeGabarito?: boolean;
}

async function queryStudyQuestions(req: NextRequest, body: StudyQuestionRequest) {
  const filters = body.filters && typeof body.filters === 'object' ? body.filters : {};
  if (filters.gabaritoStatus === 'sem_gabarito') {
    return NextResponse.json({ error: 'Filtro restrito à curadoria.' }, { status: 403 });
  }
  const action = body.action;
  const mode = action === 'facets' || action === 'catalog' || action === 'ids' ? action : 'list';

  const page = Math.max(1, Math.min(100000, Math.trunc(Number(body.page) || 1)));
  const size = Math.max(1, Math.min(mode === 'ids' ? 200 : 50, Math.trunc(Number(body.pageSize) || 20)));
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const publicCount = mode === 'catalog' || (mode === 'facets' && !filters.ocultarRevisadas
    && (!filters.status || filters.status === 'Todas'));
  const supabase = publicCount && url && publicKey
    ? createPublicSupabaseClient(url, publicKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
    : token && url && publicKey
    ? createPublicSupabaseClient(url, publicKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false }
    })
    : await createSupabaseServerClient();
  const normalized = normalizeStudyQuery(filters, body.questionIds, {
    quota: body.quota,
    excludeIds: body.excludeIds,
    randomize: mode === 'ids' && filters.aleatorizar === true
  });
  const [{ data, error }, student] = await Promise.all([
    supabase.rpc('query_study_questions', { p_filters: normalized, p_mode: mode, p_page: page, p_size: size }),
    mode === 'list' ? supabase.auth.getUser(token) : Promise.resolve(null)
  ]);
  if (error || !data) {
    console.error('[/api/questions] Erro na consulta do catálogo:', error?.code);
    return NextResponse.json({ error: 'Não foi possível carregar o catálogo de questões.' }, { status: 503 });
  }
  if (mode === 'facets') return NextResponse.json({ facets: data });
  if (mode !== 'list') return NextResponse.json(data);

  const { total, rows } = data as { total: number; rows: QuestionDbRow[] };
  const questions = rows.map((row) => mapRowToQuestion(row));
  return NextResponse.json({
    questions, total, page, pageSize: size, totalPages: Math.ceil(total / size),
    sessionTicket: generateSessionTicket(student?.data.user?.id || 'anonymous', questions.map((question) => question.id))
  });
}

function mapRowToQuestion(row: QuestionDbRow, includeExplanations = false): Question {
  const storedType = normalizeStudyFormats(row.type)?.[0];
  const sanitizedOptions = Array.isArray(row.options)
    ? row.options.map((opt) => {
      const rawOpt = opt as { letter: 'A' | 'B' | 'C' | 'D' | 'E'; text: string; explanation?: string };
      if (includeExplanations && typeof rawOpt.explanation === 'string') {
        return {
          letter: rawOpt.letter,
          text: sanitizeMedicalText(rawOpt.text),
          explanation: sanitizeMedicalText(rawOpt.explanation)
        };
      }
      return {
        letter: rawOpt.letter,
        text: sanitizeMedicalText(rawOpt.text)
      };
    })
    : [];

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
    sub_subfoco: (row as { sub_subfoco?: string }).sub_subfoco || (row as { subSubfoco?: string }).subSubfoco || '',
    subSubfoco: (row as { subSubfoco?: string }).subSubfoco || (row as { sub_subfoco?: string }).sub_subfoco || '',
    difficulty: row.difficulty || 'Desconhecido',
    type: storedType === 'discursiva' ? 'Discursiva'
      : storedType === 'certo ou errado' ? 'Certo ou errado' : 'Múltipla escolha',
    isAnulada: Boolean(row.is_anulada),
    statement: sanitizeMedicalText(row.statement || ''),
    options: sanitizedOptions,
    correctAnswer: includeExplanations ? ((row.correct_answer as Question['correctAnswer']) || '') : '',
    commentary: includeExplanations ? sanitizeMedicalText(row.commentary || '') : '',
    images: Array.isArray(row.images) ? row.images : []
  };
}

function resolveTargetTable(filters: ExtendedFilterState, privilegedDirect = false): string {
  const mods = filters?.modalidades;
  if (!mods || mods.length === 0 || mods.length > 1) {
    return privilegedDirect ? 'questions_direto' : 'view_questions_all';
  }
  const m = mods[0];
  if (m === 'Acesso Direto' || m === 'Residência Médica') {
    return privilegedDirect ? 'questions_direto' : 'view_questions_acesso_direto';
  }
  if (m === 'Revalida') return privilegedDirect ? 'questions_revalida' : 'view_questions_revalida';
  if (m === 'R+' || (typeof m === 'string' && m.startsWith('R+'))) {
    return privilegedDirect ? 'questions_rplus' : 'view_questions_rplus';
  }
  if (m === 'Título de Especialista' || (typeof m === 'string' && m.startsWith('Título'))) {
    return privilegedDirect ? 'questions_titulo' : 'view_questions_titulo';
  }
  return privilegedDirect ? 'questions_direto' : 'view_questions_acesso_direto';
}

let viewQuestionsAllMissingUntil = 0;
const VIEW_MISSING_CACHE_TTL_MS = 5 * 60 * 1000;

function isRelationMissingError(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  return Boolean(
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    error.message?.includes('does not exist') ||
    error.message?.includes('schema cache') ||
    error.message?.includes('relation')
  );
}

interface PostgrestErrorShape {
  code?: string;
  message?: string;
}

async function executeResilientQuery<T = unknown>(
  queryFn: (tableName: string) => PromiseLike<{ data: T | null; count?: number | null; error: PostgrestErrorShape | null }>,
  preferredTable: string,
  modalidades?: string[]
): Promise<{ data: T | null; count?: number | null; error: PostgrestErrorShape | null }> {
  const fanOutacrossViews = async (): Promise<{ data: T | null; count?: number | null; error: PostgrestErrorShape | null }> => {
    const targetViews = resolveCanonicalViewsForModalidades(modalidades);
    const results = await Promise.all(targetViews.map((v) => queryFn(v)));
    const validResults = results.filter((r) => !r.error);
    if (validResults.length === 0) {
      return results[0] || { data: null, count: 0, error: null };
    }

    const hasArrayData = validResults.some((r) => Array.isArray(r.data));
    let mergedData: T | null = null;
    if (hasArrayData) {
      const combined = validResults.flatMap((r) => (Array.isArray(r.data) ? r.data : []));
      mergedData = combined as unknown as T;
    }

    const hasCounts = validResults.some((r) => typeof r.count === 'number');
    const summedCount = hasCounts
      ? validResults.reduce((acc, r) => acc + (typeof r.count === 'number' ? r.count : 0), 0)
      : null;

    return { data: mergedData, count: summedCount, error: null };
  };

  if (preferredTable === 'view_questions_all' && Date.now() < viewQuestionsAllMissingUntil) {
    return await fanOutacrossViews();
  }

  const result = await queryFn(preferredTable);
  if (result.error && isRelationMissingError(result.error)) {
    if (preferredTable === 'view_questions_all') {
      viewQuestionsAllMissingUntil = Date.now() + VIEW_MISSING_CACHE_TTL_MS;
      console.warn(`[/api/questions] View 'view_questions_all' indisponível no Supabase. Executando consulta paralela nas views canônicas.`);
      return await fanOutacrossViews();
    }
    console.warn(`[/api/questions] View '${preferredTable}' indisponível no Supabase. Fallback automático para 'questions'.`);
    return await queryFn('questions');
  }
  return result;
}

// In-Memory Cache para Contagens Facetadas (TTL de 60s)
interface FacetsCacheEntry {
  data: unknown;
  expiresAt: number;
}
const facetsCache = new Map<string, FacetsCacheEntry>();
const FACETS_CACHE_TTL_MS = 5 * 60 * 1000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyQuestionFilters(query: any, filters: ExtendedFilterState, questionIds?: string[], isPrivileged = false) {
  // Regra de Gabarito: views públicas expõem has_gabarito/is_anulada (sem correct_answer bruto)
  if (filters.gabaritoStatus === 'sem_gabarito') {
    if (isPrivileged) {
      query = query.or('correct_answer.is.null,correct_answer.eq.').eq('is_anulada', false);
    } else {
      query = query.eq('has_gabarito', false).eq('is_anulada', false);
    }
  } else if (filters.gabaritoStatus === 'com_gabarito') {
    if (isPrivileged) {
      query = query.or('correct_answer.in.(A,B,C,D,E,ANULADA),is_anulada.eq.true');
    } else {
      query = query.or('has_gabarito.eq.true,is_anulada.eq.true');
    }
  }

  // Se IDs específicos foram solicitados (ex: página paginada de Resolvidas/Acertadas/Erradas ou caderno)
  if (questionIds && questionIds.length > 0) {
    const safeIds = questionIds.filter(validateQuestionId);
    query = query.in('id', safeIds.length > 0 ? safeIds : ['00000000-0000-0000-0000-000000000000']);
    return query;
  }

  // Filtro de Status do Aluno via IDs diretos com limites seguros de PostgREST
  if (filters.status === 'Resolvidas') {
    const safeSolved = (filters.userSolvedIds || []).filter(validateQuestionId).slice(0, 1000);
    if (safeSolved.length > 0) {
      query = query.in('id', safeSolved);
    } else {
      query = query.eq('id', '00000000-0000-0000-0000-000000000000');
    }
  } else if (filters.status === 'Acertadas') {
    const safeCorrect = (filters.userCorrectIds || []).filter(validateQuestionId).slice(0, 1000);
    if (safeCorrect.length > 0) {
      query = query.in('id', safeCorrect);
    } else {
      query = query.eq('id', '00000000-0000-0000-0000-000000000000');
    }
  } else if (filters.status === 'Erradas') {
    const safeWrong = (filters.userWrongIds || []).filter(validateQuestionId).slice(0, 1000);
    if (safeWrong.length > 0) {
      query = query.in('id', safeWrong);
    } else {
      query = query.eq('id', '00000000-0000-0000-0000-000000000000');
    }
  } else if (filters.status === 'Não vistas') {
    if (filters.userSolvedIds && filters.userSolvedIds.length > 0) {
      const safePruneIds = filters.userSolvedIds.filter(validateQuestionId).slice(0, 200);
      if (safePruneIds.length > 0) {
        query = query.not('id', 'in', `(${safePruneIds.join(',')})`);
      }
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
        `sub_subfoco.ilike.%${term}%`,
        `tema.ilike.%${term}%`,
        `code.ilike.%${term}%`
      ]);
      query = query.or(searchClauses.join(','));
    }
  }

  // 2. Árvore Clínica (5 níveis): Refinamento Pai -> Filho e SOMA / UNIÃO entre ramos diferentes
  const {
    orParts,
    standaloneSpecs,
    standaloneTemas,
    standaloneFocos,
    standaloneSubfocos,
    standaloneSubSubfocos
  } = buildClinicalFilterClauses(filters);

  if (orParts.length === 1) {
    if (standaloneSpecs.length > 0) {
      query = query.in('especialidade', standaloneSpecs);
    } else if (standaloneTemas.length > 0) {
      query = query.in('tema', standaloneTemas);
    } else if (standaloneFocos.length > 0) {
      query = query.in('foco', standaloneFocos);
    } else if (standaloneSubfocos && standaloneSubfocos.length > 0) {
      query = query.in('subfoco', standaloneSubfocos);
    } else if (standaloneSubSubfocos && standaloneSubSubfocos.length > 0) {
      query = query.in('sub_subfoco', standaloneSubSubfocos);
    } else {
      query = query.or(orParts[0]);
    }
  } else if (orParts.length > 1) {
    query = query.or(orParts.join(','));
  }

  // 3. Modalidade (com suporte refinado a Revalida e Residência)
  if (filters.modalidades && filters.modalidades.length > 0) {
    const hasRevalida = filters.modalidades.some((m: string) => m.toLowerCase().includes('revalida'));
    const otherModalidades = filters.modalidades
      .filter((m: string) => !m.toLowerCase().includes('revalida'))
      .map((m: string) => sanitizePostgrestQuotedValue(m))
      .filter(Boolean);

    if (hasRevalida && otherModalidades.length === 0) {
      query = query.or(REVALIDA_POSTGREST_FILTER);
    } else if (hasRevalida && otherModalidades.length > 0) {
      const otherIn = otherModalidades.map((m: string) => `"${m}"`).join(',');
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

  // 4. Instituições / Bancas / Banca Organizadora / Macrorregião
  const bancaBuckets: string[] = [];
  if (filters.instituicoes && filters.instituicoes.length > 0) {
    bancaBuckets.push(...resolveBancaList(filters.instituicoes));
  }
  if (filters.bancaOrganizadora && filters.bancaOrganizadora.length > 0) {
    const orgSet = new Set(filters.bancaOrganizadora.map((o) => o.toLowerCase()));
    const fromOrg = CANONICAL_BANCAS_DIRECTORY
      .filter((b) => b.bancaOrganizadora && orgSet.has(b.bancaOrganizadora.toLowerCase()))
      .map((b) => b.sigla);
    bancaBuckets.push(...resolveBancaList(fromOrg));
  }
  if (filters.macrorregioes && filters.macrorregioes.length > 0) {
    const regSet = new Set(filters.macrorregioes.map((r) => r.toLowerCase()));
    const fromReg = CANONICAL_BANCAS_DIRECTORY
      .filter((b) => b.macrorregiao && regSet.has(b.macrorregiao.toLowerCase()))
      .map((b) => b.sigla);
    bancaBuckets.push(...resolveBancaList(fromReg));
  }
  if (bancaBuckets.length > 0) {
    query = query.in('banca', Array.from(new Set(bancaBuckets)));
  }

  // 4b. Apenas com Imagem / Exame Visual
  if (filters.apenasComImagem) {
    query = query.not('images', 'is', null).neq('images', '[]');
  }

  // 4c. Programa R+ / Sociedade de Título
  if (filters.programaRplus && filters.programaRplus.length > 0) {
    const pClauses: string[] = [];
    for (const p of filters.programaRplus) {
      const pUp = p.toUpperCase();
      if (pUp.includes('TEGO')) pClauses.push('banca.ilike.%TEGO%');
      else if (pUp.includes('TECM')) pClauses.push('banca.ilike.%TECM%');
      else if (pUp.includes('SBOT')) pClauses.push('banca.ilike.%SBOT%,tema.eq.Ortopedia e Traumatologia');
      else if (pUp.includes('MASTOLOGIA')) pClauses.push('tipo_prova.ilike.%MASTOLOGIA%,tema.ilike.%Mastologia%');
      else if (pUp.includes('NEONATOLOGIA')) pClauses.push('tipo_prova.ilike.%NEONATOLOGIA%,tema.eq.Neonatologia');
      else if (pUp.includes('GERIATRIA')) pClauses.push('tipo_prova.ilike.%GERIATRIA%,tema.eq.Geriatria');
      else if (pUp.includes('INTENSIVA')) pClauses.push('tipo_prova.ilike.%INTENSIVA%,tema.ilike.%Intensiva%');
      else if (pUp.includes('UROLOGIA')) pClauses.push('tipo_prova.ilike.%UROLOGIA%,tema.eq.Urologia');
      else if (pUp.includes('PEDIATRIA')) pClauses.push('especialidade.eq.Pediatria');
      else if (pUp.includes('GINECOLOGIA')) pClauses.push('especialidade.in.(Ginecologia,Obstetrícia)');
      else if (pUp.includes('CIRURGIA')) pClauses.push('especialidade.eq.Cirurgia Geral');
      else if (pUp.includes('CLÍNICA') || pUp.includes('CLINICA')) pClauses.push('especialidade.eq.Clínica Médica');
    }
    if (pClauses.length > 0) {
      query = query.or(pClauses.join(','));
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
    if (filters.tipoQuestao === 'Dissertativa' || filters.tipoQuestao === 'Discursiva') {
      query = query.in('type', ['Dissertativa', 'Discursiva']);
    } else if (filters.tipoQuestao === 'Certo ou errado' || filters.tipoQuestao === 'Verdadeiro ou falso' || filters.tipoQuestao === 'Certo e Errado') {
      query = query.in('type', ['Certo ou errado', 'Verdadeiro ou falso', 'Certo e Errado']);
    } else {
      query = query.eq('type', filters.tipoQuestao);
    }
  }

  // 9. Modalidade (quando múltiplas modalidades ou modalidade específica)
  if (filters.modalidades && filters.modalidades.length > 0 && filters.modalidades.length < 4) {
    const canonicalMods = filters.modalidades.map(m => {
      if (m === 'Residência Médica') return 'Acesso Direto';
      if (typeof m === 'string' && m.startsWith('R+')) return 'R+';
      if (typeof m === 'string' && m.startsWith('Título')) return 'Título de Especialista';
      return m;
    });
    query = query.in('modalidade', canonicalMods);
  }

  // 10. Ocultar Anuladas
  if (filters.ocultarAnuladasErro) {
    query = query.eq('is_anulada', false);
  }

  // 11. Últimos 5 anos
  if (filters.ultimos5Anos) {
    const minYear = new Date().getFullYear() - 4;
    query = query.gte('year', minYear);
  }

  return query;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as StudyQuestionRequest;
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
    }
    if (body.includeGabarito !== true) return await queryStudyQuestions(req, body);
    const adminAuth = await verifyAdminSession(req);
    if (!adminAuth.authorized) {
      return NextResponse.json({ error: 'Acesso restrito à curadoria.' }, { status: 403 });
    }
    const supabaseAdmin = getSupabaseAdmin();
    const {
      filters = {} as ExtendedFilterState,
      page: rawPage = 1,
      pageSize: rawPageSize = 20,
      questionIds: rawQuestionIds
    } = body;

    // Blindagem Anti-Scraping: teto estrito de paginação (máx 50 questões/página e máx 100 IDs explícitos validados)
    const page = Math.max(1, Math.floor(Number(rawPage) || 1));
    const pageSize = Math.min(50, Math.max(1, Math.floor(Number(rawPageSize) || 20)));
    const questionIds = Array.isArray(rawQuestionIds)
      ? rawQuestionIds.filter((id: unknown): id is string => typeof id === 'string' && validateQuestionId(id)).slice(0, 100)
      : undefined;
    if (Array.isArray(filters.userSolvedIds)) {
      filters.userSolvedIds = filters.userSolvedIds.filter((id: unknown): id is string => typeof id === 'string' && validateQuestionId(id));
    }
    if (Array.isArray(filters.userCorrectIds)) {
      filters.userCorrectIds = filters.userCorrectIds.filter((id: unknown): id is string => typeof id === 'string' && validateQuestionId(id));
    }
    if (Array.isArray(filters.userWrongIds)) {
      filters.userWrongIds = filters.userWrongIds.filter((id: unknown): id is string => typeof id === 'string' && validateQuestionId(id));
    }

    // Identificação de usuário para amarração segura de sessão (Session Binding)
    let authenticatedUserId: string | undefined;
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user: authUser } } = await supabaseAdmin.auth.getUser(token);
      if (authUser) {
        authenticatedUserId = authUser.id;
      }
    }
    if (!authenticatedUserId) {
      try {
        const supabaseServer = await createSupabaseServerClient();
        const { data: { user: cookieUser } } = await supabaseServer.auth.getUser();
        if (cookieUser) {
          authenticatedUserId = cookieUser.id;
        }
      } catch {
        // visitante
      }
    }

    // Se o filtro de status estiver ativo e os IDs ainda não tiverem sido fornecidos pelo client, consulta no Supabase
    if (filters.status && filters.status !== 'Todas') {
      const hasClientIds =
        (filters.userSolvedIds && filters.userSolvedIds.length > 0) ||
        (filters.userCorrectIds && filters.userCorrectIds.length > 0) ||
        (filters.userWrongIds && filters.userWrongIds.length > 0);

      if (!hasClientIds && authenticatedUserId) {
        try {
          const { data: userAnswersData } = await supabaseAdmin
            .from('user_answers')
            .select('question_id, is_correct')
            .eq('user_id', authenticatedUserId);
          const rows = (userAnswersData || []) as unknown as Array<{ question_id: string; is_correct: boolean }>;
          if (rows.length > 0) {
            filters.userSolvedIds = rows.map((r) => r.question_id);
            filters.userCorrectIds = rows.filter((r) => r.is_correct).map((r) => r.question_id);
            filters.userWrongIds = rows.filter((r) => !r.is_correct).map((r) => r.question_id);
          }
        } catch {
          // prossegue normalmente
        }
      }
    }

    // Se a requisição for para contagens facetadas da árvore clínica (Dynamic Hierarchy Facets)
    if (body.action === 'facets') {
      const isRevalida = Boolean(filters.modalidades?.some((m: string) => m.toLowerCase().includes('revalida')));
      const isRPlusOrTitulo = Boolean(filters.modalidades?.some((m: string) => m.startsWith('R+') || m.startsWith('Título')));
      const hasBancas = Boolean(filters.instituicoes && filters.instituicoes.length > 0);

      // Clona filtros removendo a árvore clínica para calcular a distribuição em todos os nós
      const filtersWithoutClinical: ExtendedFilterState = {
        ...filters,
        especialidades: [],
        temas: [],
        focos: [],
        subfocos: [],
        subSubfocos: []
      };

      // Fast-path ultrarrápido (0ms): se não há filtros restritivos no card lateral (bancas, anos, etc.),
      // retorna as contagens pré-computadas exatas do catálogo homologado
      const hasRightCardFilters = Boolean(
        hasBancas ||
        (filtersWithoutClinical.bancaOrganizadora && filtersWithoutClinical.bancaOrganizadora.length > 0) ||
        (filtersWithoutClinical.macrorregioes && filtersWithoutClinical.macrorregioes.length > 0) ||
        (filtersWithoutClinical.programaRplus && filtersWithoutClinical.programaRplus.length > 0) ||
        filtersWithoutClinical.apenasComImagem ||
        (filtersWithoutClinical.search && filtersWithoutClinical.search.trim()) ||
        (filtersWithoutClinical.anos && filtersWithoutClinical.anos.length > 0 && filtersWithoutClinical.anos.length < 18) ||
        (filtersWithoutClinical.dificuldade && filtersWithoutClinical.dificuldade !== 'Todas') ||
        (filtersWithoutClinical.tipoQuestao && filtersWithoutClinical.tipoQuestao !== 'Todas') ||
        (filtersWithoutClinical.status && filtersWithoutClinical.status !== 'Todas') ||
        filtersWithoutClinical.ocultarAnuladasErro ||
        filtersWithoutClinical.ultimos5Anos
      );

      if (!hasRightCardFilters) {
        const baseline = getHomologatedBaseline(filters.modalidades);
        return NextResponse.json({
          facets: {
            totalRightCardCount: baseline.total,
            especialidades: baseline.especialidades,
            temas: baseline.temas,
            focos: (baseline.focos as Record<string, number>) || {},
            subfocos: (baseline.subfocos as Record<string, number>) || {},
            subSubfocos: (baseline.subSubfocos as Record<string, number>) || {}
          }
        });
      }

      if (isSqliteAvailable()) {
        try {
          const localFacets = queryFacetsFromSqlite(filters);
          if (localFacets) {
            return NextResponse.json(localFacets);
          }
        } catch (sqliteErr) {
          console.warn('[/api/questions] Fallback to Supabase for facets due to SQLite error:', sqliteErr);
        }
      }

      // 1. Verificação no cache em memória
      const cacheKey = JSON.stringify({ isRevalida, hasBancas, isRPlusOrTitulo, filtersWithoutClinical });
      const cached = facetsCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return NextResponse.json(cached.data);
      }


      // 2. Consulta de Alta Performance via RPC Nativa (Fase 2 da Otimização):
      // Executa o agrupamento no PostgreSQL com Anti-Join em tempo recorde (< 20ms)
      try {
        const resolvedBancas = filtersWithoutClinical.instituicoes && filtersWithoutClinical.instituicoes.length > 0
          ? resolveBancaList(filtersWithoutClinical.instituicoes)
          : null;

        const { data: rpcResult, error: rpcErr } = await supabaseAdmin.rpc('get_faceted_question_counts', {
          p_bancas: resolvedBancas,
          p_years: filtersWithoutClinical.anos && filtersWithoutClinical.anos.length > 0 ? filtersWithoutClinical.anos : null,
          p_especialidades: null,
          p_modalidades: filtersWithoutClinical.modalidades && filtersWithoutClinical.modalidades.length > 0 ? filtersWithoutClinical.modalidades : null,
          p_dificuldades: filtersWithoutClinical.dificuldade && filtersWithoutClinical.dificuldade !== 'Todas' ? [filtersWithoutClinical.dificuldade] : null,
          p_tipos: filtersWithoutClinical.tipoQuestao && filtersWithoutClinical.tipoQuestao !== 'Todas' ? [filtersWithoutClinical.tipoQuestao] : null,
          p_ocultar_anuladas: Boolean(filtersWithoutClinical.ocultarAnuladasErro),
          p_ultimos_5_anos: Boolean(filtersWithoutClinical.ultimos5Anos),
          p_status: filtersWithoutClinical.status || 'Todas',
          p_user_id: authenticatedUserId || null,
          p_is_revalida: isRevalida
        });

        if (
          !rpcErr &&
          rpcResult &&
          typeof rpcResult === 'object' &&
          typeof (rpcResult as Record<string, unknown>).totalRightCardCount === 'number' &&
          !(isRPlusOrTitulo && (rpcResult as { totalRightCardCount: number }).totalRightCardCount === 0 && !hasBancas)
        ) {
          const typedResult = rpcResult as {
            totalRightCardCount: number;
            especialidades: Record<string, number>;
            temas: Record<string, number>;
            focos?: Record<string, number>;
            subfocos?: Record<string, number>;
            subSubfocos?: Record<string, number>;
          };

          const hasV3MaterializedSubSubfocos = Boolean(
            typedResult.subSubfocos && Object.keys(typedResult.subSubfocos).length > 0
          );

          if (hasV3MaterializedSubSubfocos) {
            const especialidades = { ...typedResult.especialidades };
            if (especialidades['Cirurgia Geral'] && !especialidades['Cirurgia']) {
              especialidades['Cirurgia'] = especialidades['Cirurgia Geral'];
            }
            if (especialidades['Ginecologia'] || especialidades['Obstetrícia']) {
              especialidades['Ginecologia e Obstetrícia'] =
                (especialidades['Ginecologia'] || 0) + (especialidades['Obstetrícia'] || 0);
            }

            const resultPayload = {
              facets: {
                totalRightCardCount: typedResult.totalRightCardCount,
                especialidades,
                temas: typedResult.temas || {},
                focos: typedResult.focos || {},
                subfocos: typedResult.subfocos || {},
                subSubfocos: typedResult.subSubfocos || {}
              }
            };

            facetsCache.set(cacheKey, { data: resultPayload, expiresAt: Date.now() + FACETS_CACHE_TTL_MS });
            return NextResponse.json(resultPayload);
          }

          if (typedResult.totalRightCardCount > 4000) {
            const baseline = getHomologatedBaseline(filters.modalidades);
            const globalTotal = baseline.total;
            const overallRatio = globalTotal > 0 ? typedResult.totalRightCardCount / globalTotal : 1;

            const especialidades: Record<string, number> = {};
            const temas: Record<string, number> = {};
            const focos: Record<string, number> = {};
            const subfocos: Record<string, number> = {};
            const subSubfocos: Record<string, number> = {};

            for (const [e, count] of Object.entries(baseline.especialidades || {})) {
              especialidades[e] = Math.max(0, Math.round(count * overallRatio));
            }
            for (const [t, count] of Object.entries(baseline.temas || {})) {
              temas[t] = Math.max(0, Math.round(count * overallRatio));
            }
            for (const [f, count] of Object.entries(baseline.focos || hierarchyQuestionCounts.focos || {})) {
              focos[f] = Math.max(0, Math.round(count * overallRatio));
            }
            for (const [s, count] of Object.entries(baseline.subfocos || hierarchyQuestionCounts.subfocos || {})) {
              subfocos[s] = Math.max(0, Math.round(count * overallRatio));
            }
            for (const [ss, count] of Object.entries(baseline.subSubfocos || hierarchyQuestionCounts.subSubfocos || {})) {
              subSubfocos[ss] = Math.max(0, Math.round(count * overallRatio));
            }

            const resultPayload = {
              facets: {
                totalRightCardCount: typedResult.totalRightCardCount,
                especialidades,
                temas,
                focos,
                subfocos,
                subSubfocos
              }
            };

            facetsCache.set(cacheKey, { data: resultPayload, expiresAt: Date.now() + FACETS_CACHE_TTL_MS });
            return NextResponse.json(resultPayload);
          }
        }
      } catch (errRpc) {
        console.warn('[/api/questions] RPC get_faceted_question_counts indisponível, usando fallback seguro:', errRpc);
      }

      // 3. Fallback Resiliente (Pilar 2 da Arquitetura Híbrida):
      // Projeta apenas colunas mínimas de hierarquia (sem texto de enunciado/opções/imagens) via cliente público
      const publicFacetClient = getQuestionsReadClient(false, supabaseAdmin);
      const targetTable = resolveTargetTable(filters);
      const { data: facetRows, count: exactFacetCount, error: facetErr } = await executeResilientQuery(async (tbl) => {
        let facetQuery = publicFacetClient
          .from(tbl)
          .select('especialidade, tema, foco, subfoco, sub_subfoco', { count: 'exact' });
        facetQuery = applyQuestionFilters(facetQuery, filtersWithoutClinical, undefined, false);
        return await facetQuery.limit(4000);
      }, targetTable, filters.modalidades);
      if (facetErr) {
        console.warn('[/api/questions] Aviso ao buscar facetas atômicas:', facetErr.message || facetErr);
      }

      const rows = (facetRows || []) as Array<{
        especialidade?: string;
        tema?: string;
        foco?: string;
        subfoco?: string;
        sub_subfoco?: string;
      }>;
      const especialidades: Record<string, number> = {};
      const temas: Record<string, number> = {};
      const focos: Record<string, number> = {};
      const subfocos: Record<string, number> = {};
      const subSubfocos: Record<string, number> = {};
      const totalRightCardCount = typeof exactFacetCount === 'number' ? exactFacetCount : rows.length;

      for (const row of rows) {
        const esp = row.especialidade;
        const tem = row.tema;
        const foc = row.foco;
        const sub = row.subfoco;
        const subSub = row.sub_subfoco;

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
        if (subSub) subSubfocos[subSub] = (subSubfocos[subSub] || 0) + 1;
      }

      const resultPayload = {
        facets: {
          totalRightCardCount,
          especialidades,
          temas,
          focos,
          subfocos,
          subSubfocos
        }
      };

      facetsCache.set(cacheKey, { data: resultPayload, expiresAt: Date.now() + FACETS_CACHE_TTL_MS });
      if (facetsCache.size > 200) {
        const firstKey = facetsCache.keys().next().value;
        if (firstKey) facetsCache.delete(firstKey);
      }

      return NextResponse.json(resultPayload);
    }

    let selectCols = SAFE_QUESTION_COLUMNS;
    let isPrivilegedIncludeGabarito = false;
    if (body.includeGabarito) {
      const auth = await verifyAdminSession(req);
      if (auth.authorized) {
        selectCols = '*';
        isPrivilegedIncludeGabarito = true;
      }
    }
    const questionsReadClient = getQuestionsReadClient(isPrivilegedIncludeGabarito, supabaseAdmin);
    if (isSqliteAvailable()) {
      try {
        const localResult = queryQuestionsFromSqlite({
          filters,
          page,
          pageSize,
          questionIds,
          includeGabarito: selectCols === '*',
          authenticatedUserId
        });
        if (localResult) {
          return NextResponse.json(localResult);
        }
      } catch (sqliteErr) {
        console.warn('[/api/questions] Fallback to Supabase due to SQLite error:', sqliteErr);
      }
    }

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

      const hasOtherFilters = Boolean(
        (filters.especialidades && filters.especialidades.length > 0) ||
        (filters.temas && filters.temas.length > 0) ||
        (filters.focos && filters.focos.length > 0) ||
        (filters.subfocos && filters.subfocos.length > 0) ||
        (filters.subSubfocos && filters.subSubfocos.length > 0) ||
        (filters.instituicoes && filters.instituicoes.length > 0) ||
        (filters.anos && filters.anos.length > 0) ||
        (filters.dificuldade && filters.dificuldade !== 'Todas') ||
        (filters.tipoQuestao && filters.tipoQuestao !== 'Todas') ||
        (filters.search && filters.search.trim()) ||
        filters.ocultarAnuladasErro ||
        filters.ultimos5Anos
      );

      if (hasOtherFilters) {
        const targetTable = resolveTargetTable(filters, isPrivilegedIncludeGabarito);
        const { data, count, error } = await executeResilientQuery(async (tbl) => {
          let q = questionsReadClient.from(tbl).select(selectCols, { count: 'exact' });
          const safeTargetIds = targetStatusIds.slice(0, 1000);
          q = applyQuestionFilters(q, filters, safeTargetIds, isPrivilegedIncludeGabarito);
          return await q.range(from, to);
        }, targetTable, filters.modalidades);
        if (error) {
          console.error('[/api/questions] Erro ao buscar questões com status e filtros cruzados:', error.message || error);
          return NextResponse.json(
            { questions: [], total: 0, page, pageSize, totalPages: 0, error: safeErrorMessage(error, 'Erro interno ao consultar questões.') },
            { status: 500 }
          );
        }

        const realTotal = typeof count === 'number' ? count : (data || []).length;
        const questions = (data || []).slice(0, pageSize).map((row) => mapRowToQuestion(row as unknown as QuestionDbRow, isPrivilegedIncludeGabarito));
        const pageQuestionIds = questions.map((q) => q.id).filter(Boolean);
        const sessionTicket = generateSessionTicket(authenticatedUserId || 'anonymous', pageQuestionIds);

        return NextResponse.json({
          questions,
          total: realTotal,
          page,
          pageSize,
          totalPages: Math.ceil(realTotal / pageSize),
          sessionTicket
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

      const targetTable = resolveTargetTable(filters, isPrivilegedIncludeGabarito);
      const { data, error } = await executeResilientQuery(async (tbl) => {
        let q = questionsReadClient.from(tbl).select(selectCols);
        q = applyQuestionFilters(q, filters, pageTargetIds, isPrivilegedIncludeGabarito);
        return await q;
      }, targetTable, filters.modalidades);
      if (error) {
        console.error('[/api/questions] Erro ao buscar questões paginadas por status:', error.message || error);
        return NextResponse.json(
          { questions: [], total: 0, page, pageSize, totalPages: 0, error: safeErrorMessage(error, 'Erro interno ao consultar questões.') },
          { status: 500 }
        );
      }

      let questions = (data || []).map((row) => mapRowToQuestion(row as unknown as QuestionDbRow, isPrivilegedIncludeGabarito));

      // Preserva a ordenação original dos IDs paginados
      const idMap = new Map(questions.map((q) => [q.id, q]));
      const orderedQuestions: Question[] = [];
      for (const id of pageTargetIds) {
        const q = idMap.get(id);
        if (q) orderedQuestions.push(q);
      }
      questions = orderedQuestions;

      const pageQuestionIds = questions.map((q) => q.id).filter(Boolean);
      const sessionTicket = generateSessionTicket(authenticatedUserId || 'anonymous', pageQuestionIds);

      return NextResponse.json({
        questions,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        sessionTicket
      });
    }

    // 1. Identifica a tabela/view alvo conforme as modalidades selecionadas
    const isRevalida = Boolean(filters.modalidades?.some((m: string) => m.toLowerCase().includes('revalida')));
    const targetTable = resolveTargetTable(filters, isPrivilegedIncludeGabarito);
    const baseTotal = getHomologatedBaseline(filters.modalidades).total;

    // 2. Paginação com ordenação dinâmica
    const isUnseenWithManySolved = Boolean(
      filters.status === 'Não vistas' &&
      filters.userSolvedIds &&
      filters.userSolvedIds.length > 100
    );

    const queryTo = isUnseenWithManySolved ? to + Math.min(filters.userSolvedIds!.length, 100) : to;

    // Constrói a busca principal com fallback resiliente multi-modalidade
    const dataQueryPromise = executeResilientQuery(async (tbl) => {
      let q = questionsReadClient.from(tbl).select(selectCols);
      q = applyQuestionFilters(q, filters, questionIds, isPrivilegedIncludeGabarito);
      if (filters.aleatorizar) {
        if (questionIds && questionIds.length > 0) {
          q = q.range(from, queryTo);
        } else {
          const isAsc = page % 2 === 1;
          q = q.order('id', { ascending: isAsc }).range(from, queryTo);
        }
      } else {
        q = q.order('year', { ascending: false }).order('id', { ascending: true }).range(from, queryTo);
      }
      return await q;
    }, targetTable, filters.modalidades);

    // 3. Cálculo preciso do total filtrado de questões
    const hasActiveFilters = Boolean(
      isRevalida ||
      (filters.search && filters.search.trim()) ||
      (filters.especialidades && filters.especialidades.length > 0) ||
      (filters.temas && filters.temas.length > 0) ||
      (filters.focos && filters.focos.length > 0) ||
      (filters.subfocos && filters.subfocos.length > 0) ||
      (filters.subSubfocos && filters.subSubfocos.length > 0) ||
      (filters.instituicoes && filters.instituicoes.length > 0) ||
      (filters.bancaOrganizadora && filters.bancaOrganizadora.length > 0) ||
      (filters.macrorregioes && filters.macrorregioes.length > 0) ||
      (filters.programaRplus && filters.programaRplus.length > 0) ||
      filters.apenasComImagem ||
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
      (filters.bancaOrganizadora && filters.bancaOrganizadora.length > 0) ||
      (filters.macrorregioes && filters.macrorregioes.length > 0) ||
      (filters.programaRplus && filters.programaRplus.length > 0) ||
      filters.apenasComImagem ||
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
      (filters.subfocos && filters.subfocos.length > 0) ||
      (filters.subSubfocos && filters.subSubfocos.length > 0)
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
          // Executa contagem com fallback resiliente e timeout de segurança de 1.200ms
          const countWithTimeout = Promise.race([
            executeResilientQuery(async (tbl) => {
              let q = questionsReadClient.from(tbl).select('id', { count: 'exact', head: true });
              q = applyQuestionFilters(q, filters, questionIds, isPrivilegedIncludeGabarito);
              return await q;
            }, targetTable, filters.modalidades).then(({ count, error: countErr }) => {
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
      dataQueryPromise,
      countPromise
    ]);

    total = calculatedTotal;

    if (error) {
      console.error('[/api/questions] Erro ao consultar questões:', error.message || error);
      return NextResponse.json(
        { questions: [], total: 0, page, pageSize, totalPages: 0, error: safeErrorMessage(error, 'Erro interno ao consultar banco de questões.') },
        { status: 500 }
      );
    }

    const rawRows = (data || []) as unknown as QuestionDbRow[];
    if (!filters.aleatorizar && (!questionIds || questionIds.length === 0) && rawRows.length > pageSize) {
      rawRows.sort((a, b) => (b.year || 0) - (a.year || 0) || String(a.id).localeCompare(String(b.id)));
    }
    let questions = rawRows.map((row) => mapRowToQuestion(row, isPrivilegedIncludeGabarito));
    if ((!filters.status || filters.status !== 'Não vistas') && (!questionIds || questionIds.length === 0) && questions.length > pageSize) {
      questions = questions.slice(0, pageSize);
    }

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

    const pageQuestionIds = questions.map((q) => q.id).filter(Boolean);
    const sessionTicket = generateSessionTicket(authenticatedUserId || 'anonymous', pageQuestionIds);

    return NextResponse.json({
      questions,
      total,
      page,
      pageSize,
      totalPages,
      sessionTicket
    });
  } catch (err: unknown) {
    console.error('[/api/questions] Exceção:', err);
    return NextResponse.json(
      { questions: [], total: 0, page: 1, pageSize: 50, totalPages: 0, error: safeErrorMessage(err, 'Erro interno do servidor.') },
      { status: 500 }
    );
  }
}
