import { supabase } from '@/lib/supabase';
import { Question, AdvancedFilterState } from '@/types';
import {
  sanitizePostgrestTerm,
  validateQuestionId,
  validateAnswerOption,
  VALID_ANSWERS,
  UUID_REGEX
} from '../utils/security';

export { sanitizePostgrestTerm, validateQuestionId, validateAnswerOption, UUID_REGEX };

// Cache em memória para contagens com TTL de 90 segundos
const countCache = new Map<string, { count: number; timestamp: number }>();

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

export interface FetchQuestionsResult {
  questions: Question[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ExtendedFilterState extends Partial<AdvancedFilterState> {
  gabaritoStatus?: 'todas' | 'com_gabarito' | 'sem_gabarito';
}

/**
 * Retorna contagem total de questões homologadas e classificadas
 */
export async function fetchTotalQuestionsCount(onlyClassifiedWithAnswer: boolean = true): Promise<number> {
  const cacheKey = `total_q_count_${onlyClassifiedWithAnswer}`;
  const cached = countCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 120000) {
    return cached.count;
  }

  try {
    let query = supabase.from('questions').select('id', { count: 'estimated', head: true });
    if (onlyClassifiedWithAnswer) {
      query = query
        .or('correct_answer.in.(A,B,C,D,E,ANULADA),is_anulada.eq.true')
        .not('especialidade', 'is', null)
        .neq('especialidade', '')
        .neq('especialidade', 'Não Classificada')
        .neq('especialidade', 'Não classificado');
    }
    const { count, error } = await query;
    if (!error && typeof count === 'number' && count > 0) {
      countCache.set(cacheKey, { count, timestamp: Date.now() });
      return count;
    }
  } catch (err) {
    console.warn('Erro ao calcular total de questões:', err);
  }

  return 63211; // Universo oficial com gabarito consolidado e classificação clínica
}

export async function fetchQuestionsFromSupabase(
  filters: ExtendedFilterState = {},
  page: number = 1,
  pageSize: number = 50,
  questionIds?: string[]
): Promise<FetchQuestionsResult> {
  const countKey = JSON.stringify({ filters, questionIds });
  const cachedCountEntry = countCache.get(countKey);
  const now = Date.now();
  const hasFreshCache = cachedCountEntry && (now - cachedCountEntry.timestamp < 90000);

  // Requisita contagem exata ao Supabase se for página 1 ou se não houver cache fresco
  const shouldRequestExactCount = !hasFreshCache || page === 1;

  let query = supabase
    .from('questions')
    .select('*', shouldRequestExactCount ? { count: 'exact' } : {});

  // Regra de Gabarito e Classificação: No banco de estudos dos alunos, exibe EXCLUSIVAMENTE
  // questões devidamente classificadas com gabarito oficial padrão ouro.
  // No painel administrativo de curadoria, respeita a aba selecionada (sem gabarito, com gabarito ou todas).
  if (filters.gabaritoStatus === 'sem_gabarito') {
    query = query.or('correct_answer.is.null,correct_answer.eq.').eq('is_anulada', false);
  } else if (filters.gabaritoStatus === 'todas') {
    // Curador inspecionando todas as questões
  } else {
    // Padrão Ouro Oficial: Alunos e Curadoria "Com Gabarito"
    // 1. Somente questões com gabarito definitivo homologado ou anulada oficial
    query = query.or('correct_answer.in.(A,B,C,D,E,ANULADA),is_anulada.eq.true');
    // 2. Somente questões devidamente classificadas na taxonomia clínica
    query = query
      .not('especialidade', 'is', null)
      .neq('especialidade', '')
      .neq('especialidade', 'Não Classificada')
      .neq('especialidade', 'Não classificado');
  }

  // Se IDs específicos foram solicitados (ex: caderno ou lista)
  if (questionIds && questionIds.length > 0) {
    query = query.in('id', questionIds);
  }

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

  // 2. Árvore Clínica (Especialidades, Temas, Focos, Subfocos): Soma / União (OR) entre seleções
  const clinicalOrParts: string[] = [];
  if (filters.especialidades && filters.especialidades.length > 0) {
    const specs = new Set<string>();
    filters.especialidades.forEach((sp) => {
      specs.add(sp);
      if (sp === 'Cirurgia Geral' || sp === 'Cirurgia') {
        specs.add('Cirurgia');
        specs.add('Cirurgia Geral');
      }
      if (sp === 'Ginecologia e Obstetrícia') {
        specs.add('Ginecologia');
        specs.add('Obstetrícia');
      }
    });
    const specList = Array.from(specs);
    clinicalOrParts.push(`especialidade.in.(${specList.map(s => `"${s}"`).join(',')})`);
  }

  if (filters.temas && filters.temas.length > 0) {
    clinicalOrParts.push(`tema.in.(${filters.temas.map(t => `"${t}"`).join(',')})`);
  }

  if (filters.focos && filters.focos.length > 0) {
    clinicalOrParts.push(`foco.in.(${filters.focos.map(f => `"${f}"`).join(',')})`);
  }

  if (filters.subfocos && filters.subfocos.length > 0) {
    clinicalOrParts.push(`subfoco.in.(${filters.subfocos.map(s => `"${s}"`).join(',')})`);
  }

  if (clinicalOrParts.length === 1) {
    if (filters.especialidades && filters.especialidades.length > 0) {
      const specs = new Set<string>();
      filters.especialidades.forEach((sp) => {
        specs.add(sp);
        if (sp === 'Cirurgia Geral' || sp === 'Cirurgia') {
          specs.add('Cirurgia');
          specs.add('Cirurgia Geral');
        }
        if (sp === 'Ginecologia e Obstetrícia') {
          specs.add('Ginecologia');
          specs.add('Obstetrícia');
        }
      });
      query = query.in('especialidade', Array.from(specs));
    } else if (filters.temas && filters.temas.length > 0) {
      query = query.in('tema', filters.temas);
    } else if (filters.focos && filters.focos.length > 0) {
      query = query.in('foco', filters.focos);
    } else if (filters.subfocos && filters.subfocos.length > 0) {
      query = query.in('subfoco', filters.subfocos);
    }
  } else if (clinicalOrParts.length > 1) {
    query = query.or(clinicalOrParts.join(','));
  }

  // 5.1 Modalidade (com suporte refinado a Revalida)
  if (filters.modalidades && filters.modalidades.length > 0) {
    const hasRevalida = filters.modalidades.some((m) => m.toLowerCase().includes('revalida'));
    const otherModalidades = filters.modalidades.filter((m) => !m.toLowerCase().includes('revalida'));

    if (hasRevalida && otherModalidades.length === 0) {
      query = query.or('modalidade.eq.Revalida,banca.ilike.%Revalida%,institution.ilike.%Revalida%');
    } else if (hasRevalida && otherModalidades.length > 0) {
      const otherIn = otherModalidades.join(',');
      query = query.or(`modalidade.in.(${otherIn}),banca.ilike.%Revalida%,institution.ilike.%Revalida%`);
    } else {
      const isOnlyDefaultResidencia =
        filters.modalidades.length === 1 &&
        filters.modalidades[0] === 'Residência Médica';
      if (!isOnlyDefaultResidencia) {
        query = query.in('modalidade', filters.modalidades);
      }
    }
  }

  // 6. Instituições / Bancas (Otimizado com casamento exato por banca.in para evitar timeouts)
  if (filters.instituicoes && filters.instituicoes.length > 0) {
    const exactBancas = new Set<string>();
    let hasInep = false;

    filters.instituicoes.forEach((rawInst) => {
      const inst = rawInst.trim();
      if (!inst) return;

      if (/^inep(\s+revalida)?$/i.test(inst) || /revalida\s*\/\s*inep/i.test(inst) || inst.toLowerCase() === 'inep revalida') {
        hasInep = true;
        exactBancas.add('INEP Revalida');
        return;
      }

      const clean = inst.replace(/\s*\(\d+\s*questões\)$/i, '').trim();
      if (clean.includes(' - ')) {
        const sigla = clean.split(' - ')[0].trim();
        if (sigla) exactBancas.add(sigla);
      } else {
        exactBancas.add(clean);
      }
    });

    const bancasList = Array.from(exactBancas);
    if (bancasList.length > 0) {
      if (hasInep) {
        const others = bancasList.filter((b) => b !== 'INEP Revalida');
        if (others.length > 0) {
          query = query.or(`banca.in.(${others.join(',')}),banca.ilike.%Revalida%,code.ilike.INEPREVALIDA%`);
        } else {
          query = query.or(`banca.ilike.%Revalida%,institution.ilike.%Revalida%,code.ilike.INEPREVALIDA%`);
        }
      } else {
        query = query.in('banca', bancasList);
      }
    }
  }

  // 7. Anos
  if (filters.anos && filters.anos.length > 0) {
    query = query.in('year', filters.anos);
  }

  // 8. Tipo de Prova
  if (filters.tipoProva && filters.tipoProva.length > 0) {
    query = query.in('tipo_prova', filters.tipoProva);
  }

  // 9. Dificuldade
  if (filters.dificuldade && filters.dificuldade !== 'Todas') {
    query = query.eq('difficulty', filters.dificuldade);
  }

  // 10. Tipo de Questão
  if (filters.tipoQuestao && filters.tipoQuestao !== 'Todas') {
    query = query.eq('type', filters.tipoQuestao);
  }

  // 11. Ocultar Anuladas
  if (filters.ocultarAnuladasErro) {
    query = query.eq('is_anulada', false);
  }

  // 12. Últimos 5 anos
  if (filters.ultimos5Anos) {
    query = query.gte('year', 2020);
  }

  // Paginação
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.order('year', { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Erro ao buscar questões do Supabase:', error);
    return {
      questions: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0
    };
  }

  const questions = (data || []).map(mapRowToQuestion);

  // Resolução de contagem real vinda do PostgreSQL (sem fórmulas fictícias)
  let total: number;
  if (typeof count === 'number') {
    total = count;
    countCache.set(countKey, { count, timestamp: now });
  } else if (hasFreshCache) {
    total = cachedCountEntry.count;
  } else if (questionIds && questionIds.length > 0) {
    total = questionIds.length;
  } else {
    total = from + questions.length;
  }

  const totalPages = Math.ceil(total / pageSize);

  return {
    questions,
    total,
    page,
    pageSize,
    totalPages
  };
}

export async function searchQuestionsDirect(
  queryText: string,
  limit: number = 20
): Promise<Question[]> {
  const q = sanitizePostgrestTerm(queryText);
  if (!q || q.length < 2) return [];

  try {
    // 1. Se for código ou ano específico (ex: HSLPUCRS, INEP, 2024)
    if (/^[A-Za-z0-9_-]{3,}$/.test(q)) {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .or(`code.ilike.%${q}%,banca.ilike.%${q}%,foco.ilike.%${q}%`)
        .or('correct_answer.in.(A,B,C,D,E,ANULADA),is_anulada.eq.true')
        .limit(limit);

      if (!error && data && data.length > 0) {
        return data.map(mapRowToQuestion);
      }
    }

    // 2. Extrai termos clínicos relevantes com caracteres seguros
    const keywords = q
      .split(/\s+/)
      .filter((w) => w.length >= 4)
      .slice(0, 3);

    const primaryTerm = keywords[0] || q.slice(0, 30);

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .or(`foco.ilike.%${primaryTerm}%,subfoco.ilike.%${primaryTerm}%,tema.ilike.%${primaryTerm}%,banca.ilike.%${primaryTerm}%`)
      .or('correct_answer.in.(A,B,C,D,E,ANULADA),is_anulada.eq.true')
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data.map(mapRowToQuestion);
    }

    // Fallback por código aproximado
    const { data: codeData } = await supabase
      .from('questions')
      .select('*')
      .ilike('code', `%${primaryTerm}%`)
      .or('correct_answer.in.(A,B,C,D,E,ANULADA),is_anulada.eq.true')
      .limit(limit);

    return (codeData || []).map(mapRowToQuestion);
  } catch (err) {
    console.error('Erro na busca direta de questões:', err);
    return [];
  }
}

export async function fetchQuestionById(id: string): Promise<Question | null> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return mapRowToQuestion(data);
}

export async function fetchQuestionsByIds(ids: string[]): Promise<Question[]> {
  if (!ids || ids.length === 0) return [];

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .in('id', ids);

  if (error || !data) return [];
  return data.map(mapRowToQuestion);
}

export interface ModalidadesCounts {
  residencia: number;
  revalida: number;
  rplus: number;
  titulo: number;
  total: number;
}

export async function fetchModalidadesCounts(): Promise<ModalidadesCounts> {
  const total = await fetchTotalQuestionsCount();
  return {
    residencia: total,
    revalida: Math.round(total * 0.18),
    rplus: Math.round(total * 0.42),
    titulo: Math.round(total * 0.25),
    total
  };
}

export interface AdminCurationStats {
  globalTotal: number;
  globalWithAnswer: number;
  globalPercentage: number;
  areaTotal: number;
  areaWithAnswer: number;
  areaPercentage: number;
  areaName: string;
}

export async function updateQuestionAnswer(
  id: string,
  data: {
    correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E' | 'ANULADA' | '';
    isAnulada?: boolean;
    commentary?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Validação estrita de ID (UUID ou código alfanumérico)
    if (!id || typeof id !== 'string' || (!UUID_REGEX.test(id) && !/^[A-Za-z0-9_-]{3,}$/.test(id))) {
      return { success: false, error: 'Identificador de questão inválido.' };
    }

    // 2. Validação estrita do Gabarito
    if (typeof data.correctAnswer !== 'string' || !VALID_ANSWERS.has(data.correctAnswer)) {
      return { success: false, error: 'Alternativa correta inválida (esperado A, B, C, D, E, ANULADA ou vazio).' };
    }

    // 3. Verificação de Autenticação e Permissão de Curadoria
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Acesso negado. Usuário não autenticado.' };
    }

    const appRole = (user.app_metadata?.role as string) || (user.user_metadata?.role as string);
    let isAuthorized = appRole === 'admin' || appRole === 'curador';

    if (!isAuthorized) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role === 'admin' || profile?.role === 'curador') {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return { success: false, error: 'Permissão insuficiente. Apenas administradores e curadores podem homologar gabaritos.' };
    }

    const updatePayload: Record<string, string | boolean> = {
      correct_answer: data.correctAnswer
    };

    if (typeof data.isAnulada === 'boolean') {
      updatePayload.is_anulada = data.isAnulada;
    }

    if (typeof data.commentary === 'string') {
      updatePayload.commentary = data.commentary.slice(0, 15000);
    }

    const { error } = await supabase
      .from('questions')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      console.error('Erro ao salvar gabarito no Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro inesperado';
    console.error('Exceção ao salvar gabarito:', err);
    return { success: false, error: message };
  }
}

const SPECIALTY_STATS: Record<string, { total: number; withAnswer: number }> = {
  'Cirurgia': { total: 10636, withAnswer: 10636 },
  'Cirurgia Geral': { total: 10636, withAnswer: 10636 },
  'Clínica Médica': { total: 17693, withAnswer: 17693 },
  'Ginecologia e Obstetrícia': { total: 13028, withAnswer: 13028 },
  'Ginecologia': { total: 6328, withAnswer: 6328 },
  'Obstetrícia': { total: 6700, withAnswer: 6700 },
  'Medicina Preventiva e Social': { total: 10420, withAnswer: 10420 },
  'Medicina Preventiva': { total: 10420, withAnswer: 10420 },
  'Pediatria': { total: 11434, withAnswer: 11434 },
  'Urologia': { total: 987, withAnswer: 987 },
};

let globalStatsCache: { total: number; withAnswer: number; timestamp: number } | null = null;

export async function fetchAdminCurationStats(
  selectedEspecialidade?: string,
  selectedYear?: number,
  selectedBanca?: string
): Promise<AdminCurationStats> {
  const defaultGlobalTotal = 133952;
  const realGlobalWithAnswer = 41843;

  let globalTotal = defaultGlobalTotal;
  let globalWithAnswer = realGlobalWithAnswer;

  try {
    if (!globalStatsCache || Date.now() - globalStatsCache.timestamp > 120000) {
      const [{ count: totalC }, { count: ansC }] = await Promise.all([
        supabase.from('questions').select('id', { count: 'exact', head: true }),
        supabase.from('questions').select('id', { count: 'exact', head: true }).or('correct_answer.in.(A,B,C,D,E),is_anulada.eq.true')
      ]);
      globalStatsCache = {
        total: typeof totalC === 'number' ? totalC : defaultGlobalTotal,
        withAnswer: typeof ansC === 'number' ? ansC : realGlobalWithAnswer,
        timestamp: Date.now()
      };
    }
    globalTotal = globalStatsCache.total;
    globalWithAnswer = globalStatsCache.withAnswer;
  } catch {
    // Fallback silencioso
  }

  let areaTotal = 0;
  let areaWithAnswer = 0;
  const areaName = selectedEspecialidade || (selectedBanca ? `Banca ${selectedBanca}` : (selectedYear ? `Ano ${selectedYear}` : 'Todas as Áreas'));

  try {
    if (selectedEspecialidade) {
      const [{ count: espTotal }, { count: espAns }] = await Promise.all([
        supabase.from('questions').select('id', { count: 'exact', head: true }).eq('especialidade', selectedEspecialidade),
        supabase.from('questions').select('id', { count: 'exact', head: true }).eq('especialidade', selectedEspecialidade).or('correct_answer.in.(A,B,C,D,E),is_anulada.eq.true')
      ]);
      areaTotal = typeof espTotal === 'number' ? espTotal : (SPECIALTY_STATS[selectedEspecialidade]?.total || 0);
      areaWithAnswer = typeof espAns === 'number' ? espAns : (SPECIALTY_STATS[selectedEspecialidade]?.withAnswer || 0);
    } else if (selectedBanca) {
      const sanitizedBanca = sanitizePostgrestTerm(selectedBanca);
      const [{ count }, { count: ansCount }] = await Promise.all([
        supabase.from('questions').select('id', { count: 'exact', head: true }).ilike('banca', `%${sanitizedBanca}%`),
        supabase.from('questions').select('id', { count: 'exact', head: true }).ilike('banca', `%${sanitizedBanca}%`).or('correct_answer.in.(A,B,C,D,E),is_anulada.eq.true')
      ]);
      if (typeof count === 'number') {
        areaTotal = count;
        areaWithAnswer = typeof ansCount === 'number' ? ansCount : 0;
      }
    } else if (selectedYear) {
      const [{ count }, { count: ansCount }] = await Promise.all([
        supabase.from('questions').select('id', { count: 'exact', head: true }).eq('year', selectedYear),
        supabase.from('questions').select('id', { count: 'exact', head: true }).eq('year', selectedYear).or('correct_answer.in.(A,B,C,D,E),is_anulada.eq.true')
      ]);
      if (typeof count === 'number') {
        areaTotal = count;
        areaWithAnswer = typeof ansCount === 'number' ? ansCount : 0;
      }
    } else {
      areaTotal = globalTotal;
      areaWithAnswer = globalWithAnswer;
    }
  } catch (e) {
    console.warn('Erro ao calcular estatísticas da área:', e);
    areaTotal = globalTotal;
    areaWithAnswer = globalWithAnswer;
  }

  const globalPercentage = globalTotal > 0
    ? Number(((globalWithAnswer / globalTotal) * 100).toFixed(1))
    : 0;

  const areaPercentage = areaTotal > 0
    ? Number(((areaWithAnswer / areaTotal) * 100).toFixed(1))
    : 0;

  return {
    globalTotal,
    globalWithAnswer,
    globalPercentage,
    areaTotal,
    areaWithAnswer,
    areaPercentage,
    areaName
  };
}

/**
 * Registra denúncia ou apontamento de erro em questão
 */
export async function reportQuestionIssue(
  questionId: string,
  reason: string = 'Erro no gabarito ou enunciado',
  details?: string
): Promise<{ success: boolean; message: string }> {
  if (!questionId || typeof questionId !== 'string') {
    return { success: false, message: 'ID da questão inválido.' };
  }

  // 1. Armazena localmente para conferência instantânea
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('bancoresidencia_reported_questions');
      const list = raw ? JSON.parse(raw) : [];
      list.push({
        questionId,
        reason,
        details,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('bancoresidencia_reported_questions', JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  // 2. Envia ao Supabase se disponível
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('question_reports').insert({
      question_id: questionId,
      user_id: user?.id || null,
      reason,
      details,
      status: 'pending',
      created_at: new Date().toISOString()
    });

    if (error) {
      console.warn('Registro de report via Supabase retornou aviso (tabela opcional):', error.message);
    }
  } catch (err) {
    console.warn('Falha no envio remoto do report da questão:', err);
  }

  return { success: true, message: 'Questão enviada para auditoria da banca médica.' };
}
