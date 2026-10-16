import { supabase } from '@/lib/supabase';
import { Question, AdvancedFilterState } from '@/types';
import { getQuestionCount } from '@/data/hierarchyCounts';

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

export async function fetchQuestionsFromSupabase(
  filters: ExtendedFilterState = {},
  page: number = 1,
  pageSize: number = 50,
  questionIds?: string[]
): Promise<FetchQuestionsResult> {
  let query = supabase.from('questions').select('*');

  // Filtro específico para Curadoria de Gabaritos
  if (filters.gabaritoStatus === 'com_gabarito') {
    query = query.or('correct_answer.in.(A,B,C,D,E,ANULADA),is_anulada.eq.true');
  } else if (filters.gabaritoStatus === 'sem_gabarito') {
    query = query.or('correct_answer.is.null,correct_answer.eq.').eq('is_anulada', false);
  }

  // Se IDs específicos foram solicitados (ex: caderno ou lista)
  if (questionIds && questionIds.length > 0) {
    query = query.in('id', questionIds);
  }

  // 1. Busca textual otimizada em termos clínicos e código
  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim();
    if (/^[A-Za-z0-9_-]{3,}$/.test(q)) {
      query = query.or(`code.ilike.%${q}%,foco.ilike.%${q}%,tema.ilike.%${q}%,banca.ilike.%${q}%`);
    } else {
      query = query.or(`foco.ilike.%${q}%,subfoco.ilike.%${q}%,tema.ilike.%${q}%,banca.ilike.%${q}%,code.ilike.%${q}%`);
    }
  }

  // 2. Especialidades
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
  }

  // 3. Temas
  if (filters.temas && filters.temas.length > 0) {
    query = query.in('tema', filters.temas);
  }

  // 4. Focos
  if (filters.focos && filters.focos.length > 0) {
    query = query.in('foco', filters.focos);
  }

  // 5. Subfocos
  if (filters.subfocos && filters.subfocos.length > 0) {
    query = query.in('subfoco', filters.subfocos);
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

  const { data, error } = await query;

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

  // Estimativa de contagem ultra-rápida sem travar o banco
  let total = 132965;
  if (questions.length < pageSize && page === 1) {
    total = questions.length;
  } else if (filters.subfocos && filters.subfocos.length === 1) {
    total = getQuestionCount('subfocos', filters.subfocos[0]) || questions.length;
  } else if (filters.focos && filters.focos.length === 1) {
    total = getQuestionCount('focos', filters.focos[0]) || questions.length;
  } else if (filters.temas && filters.temas.length === 1) {
    total = getQuestionCount('temas', filters.temas[0]) || questions.length;
  } else if (filters.especialidades && filters.especialidades.length === 1) {
    total = getQuestionCount('especialidades', filters.especialidades[0]) || questions.length;
  } else if (questionIds && questionIds.length > 0) {
    total = questionIds.length;
  } else {
    if (questions.length === pageSize) {
      total = Math.max(100, page * pageSize + 50);
    } else {
      total = from + questions.length;
    }
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
  const q = queryText.trim();
  if (!q || q.length < 2) return [];

  try {
    // 1. Se for código ou ano específico (ex: HSLPUCRS, INEP, 2024)
    if (/^[A-Za-z0-9_-]{3,}$/.test(q)) {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .or(`code.ilike.%${q}%,banca.ilike.%${q}%,foco.ilike.%${q}%`)
        .limit(limit);

      if (!error && data && data.length > 0) {
        return data.map(mapRowToQuestion);
      }
    }

    // 2. Extrai termos clínicos relevantes
    const keywords = q
      .replace(/[\(\)\[\],.:;?!/\\"\n\r]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4)
      .slice(0, 3);

    const primaryTerm = keywords[0] || q.slice(0, 30);

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .or(`foco.ilike.%${primaryTerm}%,subfoco.ilike.%${primaryTerm}%,tema.ilike.%${primaryTerm}%,banca.ilike.%${primaryTerm}%`)
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data.map(mapRowToQuestion);
    }

    // Fallback por código aproximado
    const { data: codeData } = await supabase
      .from('questions')
      .select('*')
      .ilike('code', `%${primaryTerm}%`)
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

export async function fetchTotalQuestionsCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true });

    if (error || typeof count !== 'number') {
      return 133952;
    }
    return count;
  } catch {
    return 133952;
  }
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
    correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E' | '';
    isAnulada?: boolean;
    commentary?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const updatePayload: Record<string, string | boolean> = {
      correct_answer: data.correctAnswer
    };

    if (typeof data.isAnulada === 'boolean') {
      updatePayload.is_anulada = data.isAnulada;
    }

    if (typeof data.commentary === 'string') {
      updatePayload.commentary = data.commentary;
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
  'Cirurgia': { total: 21229, withAnswer: 11893 },
  'Cirurgia Geral': { total: 21229, withAnswer: 11893 },
  'Clínica Médica': { total: 38227, withAnswer: 22335 },
  'Ginecologia e Obstetrícia': { total: 27338, withAnswer: 11763 },
  'Ginecologia': { total: 13246, withAnswer: 7707 },
  'Obstetrícia': { total: 14092, withAnswer: 4056 },
  'Medicina Preventiva e Social': { total: 22039, withAnswer: 11879 },
  'Medicina Preventiva': { total: 22039, withAnswer: 11879 },
  'Pediatria': { total: 24132, withAnswer: 13871 },
  'Urologia': { total: 987, withAnswer: 987 },
};

export async function fetchAdminCurationStats(
  selectedEspecialidade?: string,
  selectedYear?: number,
  selectedBanca?: string
): Promise<AdminCurationStats> {
  const defaultGlobalTotal = 133952;
  const realGlobalWithAnswer = 72728;

  let areaTotal = 0;
  let areaWithAnswer = 0;
  const areaName = selectedEspecialidade || (selectedBanca ? `Banca ${selectedBanca}` : (selectedYear ? `Ano ${selectedYear}` : 'Todas as Áreas'));

  try {
    if (selectedEspecialidade && SPECIALTY_STATS[selectedEspecialidade]) {
      areaTotal = SPECIALTY_STATS[selectedEspecialidade].total;
      areaWithAnswer = SPECIALTY_STATS[selectedEspecialidade].withAnswer;
    } else if (selectedEspecialidade) {
      areaTotal = getQuestionCount('especialidades', selectedEspecialidade) || 20000;
      areaWithAnswer = Math.round(areaTotal * 0.543);
    } else if (selectedBanca) {
      const { count } = await supabase.from('questions').select('id', { count: 'exact', head: true }).ilike('banca', `%${selectedBanca}%`);
      const { count: ansCount } = await supabase.from('questions').select('id', { count: 'exact', head: true }).ilike('banca', `%${selectedBanca}%`).or('correct_answer.in.(A,B,C,D,E,ANULADA),is_anulada.eq.true');
      if (typeof count === 'number') {
        areaTotal = count;
        areaWithAnswer = typeof ansCount === 'number' ? ansCount : Math.round(count * 0.543);
      }
    } else if (selectedYear) {
      const { count } = await supabase.from('questions').select('id', { count: 'exact', head: true }).eq('year', selectedYear);
      const { count: ansCount } = await supabase.from('questions').select('id', { count: 'exact', head: true }).eq('year', selectedYear).or('correct_answer.in.(A,B,C,D,E,ANULADA),is_anulada.eq.true');
      if (typeof count === 'number') {
        areaTotal = count;
        areaWithAnswer = typeof ansCount === 'number' ? ansCount : Math.round(count * 0.543);
      }
    } else {
      areaTotal = defaultGlobalTotal;
      areaWithAnswer = realGlobalWithAnswer;
    }
  } catch (e) {
    console.warn('Erro ao calcular estatísticas da área:', e);
    areaTotal = defaultGlobalTotal;
    areaWithAnswer = realGlobalWithAnswer;
  }

  const globalPercentage = defaultGlobalTotal > 0
    ? Number(((realGlobalWithAnswer / defaultGlobalTotal) * 100).toFixed(1))
    : 0;

  const areaPercentage = areaTotal > 0
    ? Number(((areaWithAnswer / areaTotal) * 100).toFixed(1))
    : 0;

  return {
    globalTotal: defaultGlobalTotal,
    globalWithAnswer: realGlobalWithAnswer,
    globalPercentage,
    areaTotal,
    areaWithAnswer,
    areaPercentage,
    areaName
  };
}

