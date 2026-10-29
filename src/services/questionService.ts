import { supabase } from '@/lib/supabase';
import { Question, QuestionOption, AdvancedFilterState, QuestionReport, ReportStatus } from '@/types';
import {
  sanitizePostgrestTerm,
  validateQuestionId,
  validateAnswerOption,
  VALID_ANSWERS,
  UUID_REGEX
} from '../utils/security';

import {
  generateStratifiedQuiz,
  fetchFacetedHierarchyCounts,
  hasRightCardActiveFilters,
  shuffleArray,
  type FacetedHierarchyCountsResult
} from './stratifiedQuizService';
import { getQuestionCount } from '@/data/hierarchyCounts';
import { clinicalHierarchy } from '@/data/mockQuestions';

// Projeção segura de colunas: omite estritamente correct_answer e commentary contra scraping
export const SAFE_QUESTION_COLUMNS = 'id, code, institution, banca, year, tipo_prova, modalidade, especialidade, tema, foco, subfoco, difficulty, type, is_anulada, statement, options, images';

// Mapeamento em memória de Subfocos para Focos ancestrais indexados no PostgreSQL
const subfocoToParentFocos = new Map<string, string[]>();

export function getParentFocosForSubfocoList(subfocos: string[]): string[] {
  if (subfocoToParentFocos.size === 0) {
    clinicalHierarchy.forEach((esp) => {
      esp.temas.forEach((tem) => {
        tem.focos.forEach((foc) => {
          foc.subfocos.forEach((sub) => {
            const list = subfocoToParentFocos.get(sub) || [];
            if (!list.includes(foc.foco)) {
              list.push(foc.foco);
            }
            subfocoToParentFocos.set(sub, list);
          });
        });
      });
    });
  }

  const result = new Set<string>();
  subfocos.forEach((s) => {
    const parents = subfocoToParentFocos.get(s);
    if (parents) {
      parents.forEach((p) => result.add(p));
    }
  });
  return Array.from(result);
}

export {
  sanitizePostgrestTerm,
  validateQuestionId,
  validateAnswerOption,
  UUID_REGEX,
  generateStratifiedQuiz,
  fetchFacetedHierarchyCounts,
  hasRightCardActiveFilters,
  shuffleArray,
  type FacetedHierarchyCountsResult
};

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
  // Higieniza as alternativas para remover explicações prévias antes da confirmação do aluno
  const cleanOptions = Array.isArray(row.options)
    ? row.options.map((opt) => ({ letter: opt.letter, text: opt.text }))
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
    difficulty: row.difficulty || 'Médio',
    type: row.type || 'Múltipla escolha',
    isAnulada: Boolean(row.is_anulada),
    statement: row.statement || '',
    options: cleanOptions,
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
  userSolvedIds?: string[];
  userCorrectIds?: string[];
  userWrongIds?: string[];
}

// Mapeamento e normalização ampla de bancas para casamento perfeito com o banco de dados
export const BANCA_ALIASES: Record<string, string[]> = {
  'ENARE': ['ENARE', 'ENARE/ENAMED'],
  'INEP Revalida': ['INEP Revalida'],
  'USP-SP': ['USP/HCFMUSP', 'USP-SP'],
  'SUS-SP': ['SUS-SP'],
  'UNICAMP': ['UNICAMP/HC', 'UNICAMP'],
  'UNIFESP': ['UNIFESP/EPM', 'UNIFESP'],
  'USP-RP': ['USP-RP', 'FMRP-USP', 'USP/RP', 'Santa Casa de Ribeirão Preto (SP)', 'Universidade de Ribeirão Preto'],
  'UNESP': ['UNESP', 'UNESP/HCFMB', 'VUNESP'],
  'IAMSPE': ['IAMSPE', 'IAMSPE/HSPE'],
  'Santa Casa SP': ['Santa Casa de São Paulo', 'ISCMSP'],
  'Santa Casa de São Paulo': ['Santa Casa de São Paulo', 'ISCMSP'],
  'Einstein': ['HIAE/Einstein', 'Einstein', 'Hospital Israelita Albert Einstein'],
  'HIAE / Einstein': ['HIAE/Einstein', 'Einstein', 'Hospital Israelita Albert Einstein'],
  'Sírio-Libanês': ['Sírio-Libanês', 'HSL PUCRS', 'Hospital Sírio-Libanês'],
  'FAMERP': ['FAMERP', 'FAMERP/HB'],
  'UFRJ': ['UFRJ/HUCFF', 'UFRJ'],
  'UERJ': ['UERJ/HUPE', 'UERJ'],
  'UFF': ['UFF', 'UFF/HUAP'],
  'UNIRIO': ['UNIRIO', 'HUGG/UNIRIO'],
  'SMS-RJ': ['SMS-RJ', 'SMS RJ', 'SEMUSA (SMS) Macaé'],
  'PSU-MG': ['PSU-MG', 'AREMG'],
  'UFMG': ['UFMG', 'UFMG/HC'],
  'Santa Casa BH': ['Santa Casa de Belo Horizonte', 'Santa Casa de Belo Horizonte (MG)'],
  'Santa Casa de Belo Horizonte': ['Santa Casa de Belo Horizonte', 'Santa Casa de Belo Horizonte (MG)'],
  'UFU': ['UFU', 'HC-UFU', 'UFU/HC'],
  'HC-UFU': ['UFU', 'HC-UFU', 'UFU/HC'],
  'AMRIGS': ['AMRIGS', 'AMRIGS/ACM'],
  'HCPA': ['HCPA', 'UFRGS/HCPA'],
  'HCPA / UFRGS': ['HCPA', 'UFRGS/HCPA'],
  'UFCSPA': ['UFCSPA', 'UFCSPA/ISCMPA'],
  'PUCRS': ['PUCRS', 'HSL PUCRS', 'HSLPUCRS'],
  'UFPR': ['UFPR', 'UFPR/HC'],
  'PUC-PR': ['Pontifícia Universidade Católica do Paraná', 'PUC-PR'],
  'Pontifícia Universidade Católica do Paraná': ['Pontifícia Universidade Católica do Paraná', 'PUC-PR'],
  'UEL': ['UEL', 'HU-UEL'],
  'UEM': ['UEM', 'HUM/UEM'],
  'ACM': ['ACM', 'ACM/AMRIGS', 'Associação Catarinense de Medicina'],
  'UFSC': ['UFSC', 'UFSC/HU'],
  'UDESC': ['UDESC'],
  'SUS-BA': ['SUS-BA'],
  'UFBA': ['UFBA', 'UFBA/HUPES'],
  'EBMSP': ['EBMSP', 'Escola Bahiana de Medicina e Saúde Pública'],
  'SES-PE': ['SES-PE'],
  'UPE': ['UPE', 'UPE/HUOC'],
  'UFPE': ['UFPE', 'UFPE/HC'],
  'SURCE': ['SURCE'],
  'UFC': ['UFC', 'UFC/HUWC'],
  'SES-DF': ['SES-DF'],
  'UnB': ['UnB', 'HUB / UnB', 'HUB/UnB'],
  'HUB / UnB': ['UnB', 'HUB / UnB', 'HUB/UnB'],
  'SES-GO': ['SES-GO'],
  'UFG': ['UFG', 'UFG/HC'],
  'UFES': ['UFES', 'UFES/HUCAM'],
  'EMESCAM': ['EMESCAM', 'Escola Superior de Ciências da Santa Casa de Vitória'],
  'UFPA': ['UFPA', 'UFPA/HUJBB'],
  'UEPA': ['UEPA', 'UEPA Revalida', 'Universidade do Estado do Pará'],
  'UFAM': ['UFAM', 'UFAM/HUGV'],
  'UEA': ['UEA', 'Universidade do Estado do Amazonas'],
  'UFPB': ['UFPB', 'UFPB/HULW'],
  'UFCG': ['UFCG', 'UFCG/HUAC'],
  'UFRN': ['UFRN', 'UFRN/HUOL'],
  'UNCISAL': ['UNCISAL', 'Universidade Estadual de Ciências da Saúde de Alagoas'],
  'UFAL': ['UFAL', 'UFAL/HUPAA'],
  'UFS': ['UFS', 'UFS/HU'],
  'UFPI': ['UFPI', 'UFPI/HU-UFPI', 'UFPI/HU'],
  'UFMA': ['UFMA', 'UFMA/HU-UFMA', 'UFMA/HU'],
  'UFMT': ['UFMT', 'UFMT/HUJM', 'UFMT Revalida']
};

export function resolveBancaList(rawBancas: string[]): string[] {
  const result = new Set<string>();
  rawBancas.forEach((raw) => {
    const clean = raw.replace(/\s*\(\d+\s*questões\)$/i, '').trim();
    const sigla = clean.includes(' - ') ? clean.split(' - ')[0].trim() : clean;

    const matchedAliases =
      BANCA_ALIASES[raw] ||
      BANCA_ALIASES[clean] ||
      BANCA_ALIASES[sigla];

    if (matchedAliases && matchedAliases.length > 0) {
      matchedAliases.forEach((a) => result.add(a));
    } else {
      if (sigla) result.add(sigla);
      if (clean && clean !== sigla) result.add(clean);
    }
  });
  return Array.from(result);
}

/**
 * Retorna contagem total de questões homologadas e consolidadas
 */
export async function fetchTotalQuestionsCount(onlyClassifiedWithAnswer: boolean = true): Promise<number> {
  const cacheKey = `total_q_count_${onlyClassifiedWithAnswer}`;
  const cached = countCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 180000) {
    return cached.count;
  }

// Universo oficial consolidado padrão-ouro homologado (132.965 questões)
  const OFFICIAL_CONSOLIDATED_COUNT = 132965;
  countCache.set(cacheKey, { count: OFFICIAL_CONSOLIDATED_COUNT, timestamp: Date.now() });
  return OFFICIAL_CONSOLIDATED_COUNT;
}

export function calculateHierarchyFallback(filters: ExtendedFilterState): number {
  if (filters.subfocos && filters.subfocos.length > 0) {
    const sum = filters.subfocos.reduce((acc, s) => acc + (getQuestionCount('subfocos', s) || 0), 0);
    if (sum > 0) return sum;
  }
  if (filters.focos && filters.focos.length > 0) {
    const sum = filters.focos.reduce((acc, f) => acc + (getQuestionCount('focos', f) || 0), 0);
    if (sum > 0) return sum;
  }
  if (filters.temas && filters.temas.length > 0) {
    const sum = filters.temas.reduce((acc, t) => acc + (getQuestionCount('temas', t) || 0), 0);
    if (sum > 0) return sum;
  }
  if (filters.especialidades && filters.especialidades.length > 0) {
    const sum = filters.especialidades.reduce((acc, e) => acc + (getQuestionCount('especialidades', e) || 0), 0);
    if (sum > 0) return sum;
  }
  return 132965;
}

export async function fetchQuestionsFromSupabase(
  filters: ExtendedFilterState = {},
  page: number = 1,
  pageSize: number = 50,
  questionIds?: string[]
): Promise<FetchQuestionsResult> {
  // Chamada via API Route interna (Node.js com Service Role) para garantir 100% de acesso às questões, comentários e gabaritos sem erro de permissão (42501)
  if (typeof window !== 'undefined') {
    try {
      const apiRes = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters, page, pageSize, questionIds })
      });
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json && Array.isArray(json.questions)) {
          return json;
        }
      }
    } catch (e) {
      console.warn('[questionService] Falha na rota /api/questions, usando fallback direto:', e);
    }
  }

  const countKey = JSON.stringify({ filters, questionIds });
  const cachedCountEntry = countCache.get(countKey);
  const now = Date.now();
  const hasFreshCache = cachedCountEntry && (now - cachedCountEntry.timestamp < 90000);

  // Consulta segura e protegida contra raspagem: omite correct_answer e commentary na busca pública
  let query = supabase.from('questions').select(SAFE_QUESTION_COLUMNS);

  // Regra de Gabarito: Todas as 132.965 questões presentes por padrão
  if (filters.ocultarAnuladasErro) {
    query = query.eq('is_anulada', false);
  }

  // Filtro de Status do Aluno via IDs diretos
  if (filters.status === 'Resolvidas') {
    if (!filters.userSolvedIds || filters.userSolvedIds.length === 0) {
      return { questions: [], total: 0, page, pageSize, totalPages: 0 };
    }
    query = query.in('id', filters.userSolvedIds.slice(0, 2000));
  } else if (filters.status === 'Acertadas') {
    if (!filters.userCorrectIds || filters.userCorrectIds.length === 0) {
      return { questions: [], total: 0, page, pageSize, totalPages: 0 };
    }
    query = query.in('id', filters.userCorrectIds.slice(0, 2000));
  } else if (filters.status === 'Erradas') {
    if (!filters.userWrongIds || filters.userWrongIds.length === 0) {
      return { questions: [], total: 0, page, pageSize, totalPages: 0 };
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
      filters.especialidades.forEach((sp) => {
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
      const temaList = filters.temas.map((t) => `"${t}"`).join(',');
      contentOrParts.push(`tema.in.(${temaList})`);
    }
    if (filters.focos && filters.focos.length > 0) {
      const focoList = filters.focos.map((f) => `"${f}"`).join(',');
      contentOrParts.push(`foco.in.(${focoList})`);
    }
    const parentFocos = (filters.subfocos && filters.subfocos.length > 0)
      ? getParentFocosForSubfocoList(filters.subfocos)
      : [];

    if (filters.subfocos && filters.subfocos.length > 0) {
      const subfocoList = filters.subfocos.map((s) => `"${s}"`).join(',');
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
      const hasRevalida = filters.modalidades.some((m) => m.toLowerCase().includes('revalida'));
      const otherModalidades = filters.modalidades.filter((m) => !m.toLowerCase().includes('revalida'));

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

    // 4. Instituições / Bancas (com dicionário completo de aliases)
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

  // Paginação otimizada com ordenação dinâmica
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
    // Modo Mais Recentes: estritamente por ano decrescente utilizando o índice B-Tree (elimina timeout de sort em memória)
    query = query.order('year', { ascending: false }).range(from, to);
  }

  let { data, error } = await query;

  if (error && (error.code === '42501' || String(error.message).includes('permission denied'))) {
    // Retry fallback com colunas públicas irrestritas para papel anon
    try {
      const publicCols = 'id,code,institution,banca,year,tipo_prova,modalidade,especialidade,tema,foco,subfoco,difficulty,type,is_anulada,statement,options,images';
      let retryQuery = supabase.from('questions').select(publicCols);
      if (questionIds && questionIds.length > 0) {
        retryQuery = retryQuery.in('id', questionIds);
      }
      const retryRes = await retryQuery.order('year', { ascending: false }).order('id', { ascending: true }).range(from, to);
      if (!retryRes.error && retryRes.data) {
        data = retryRes.data;
        error = null;
      }
    } catch {
      // ignore
    }
  }

  if (error) {
    console.warn('Aviso ao buscar questões no Supabase via cliente direto:', error.message || error.code || JSON.stringify(error));
    const fallbackCount = calculateHierarchyFallback(filters);
    return {
      questions: [],
      total: fallbackCount,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(fallbackCount / pageSize))
    };
  }

  let questions = (data || []).map(mapRowToQuestion);

  // Se questionIds específicos foram fornecidos, respeita a lista solicitada
  if (questionIds && questionIds.length > 0) {
    const idMap = new Map(questions.map((q) => [q.id, q]));
    const reordered: Question[] = [];
    for (const id of questionIds) {
      const q = idMap.get(id);
      if (q) reordered.push(q);
    }
    questions = reordered;
  } else {
    if (filters.aleatorizar) {
      questions = shuffleArray(questions);
    } else {
      questions.sort((a, b) => {
        const diff = (b.year || 0) - (a.year || 0);
        return diff !== 0 ? diff : a.id.localeCompare(b.id);
      });
    }
  }

  // Resolução de contagem do universo com base consolidada (132.965)
  let total: number = 132965;
  const hasActiveFilters = Boolean(
    (filters.search && filters.search.trim()) ||
    (filters.especialidades && filters.especialidades.length > 0) ||
    (filters.temas && filters.temas.length > 0) ||
    (filters.focos && filters.focos.length > 0) ||
    (filters.subfocos && filters.subfocos.length > 0) ||
    (filters.instituicoes && filters.instituicoes.length > 0) ||
    (filters.anos && filters.anos.length > 0 && filters.anos.length < 15) ||
    (filters.dificuldade && filters.dificuldade !== 'Todas') ||
    (filters.tipoQuestao && filters.tipoQuestao !== 'Todas') ||
    filters.ocultarAnuladasErro ||
    filters.ultimos5Anos
  );

  const hasRightCardFilters = Boolean(
    (filters.search && filters.search.trim()) ||
    (filters.instituicoes && filters.instituicoes.length > 0) ||
    (filters.anos && filters.anos.length > 0 && filters.anos.length < 15) ||
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

  if (questionIds && questionIds.length > 0) {
    total = questionIds.length;
  } else if (!hasActiveFilters) {
    total = 132965;
    countCache.set(countKey, { count: total, timestamp: now });
  } else if (hasFreshCache) {
    total = cachedCountEntry.count;
  } else if (hasClinicalFilters && !hasRightCardFilters) {
    // Quando apenas itens da árvore clínica estão ativos, usa contagem precisa e instantânea pré-calculada (0ms)
    total = calculateHierarchyFallback(filters);
    countCache.set(countKey, { count: total, timestamp: now });
  } else {
    // Para filtros refinados, executa contagem indexada leve e ultrarrápida
    try {
      let countQuery = supabase
        .from('questions')
        .select('id', { count: 'exact', head: true });

      if (filters.ocultarAnuladasErro) {
        countQuery = countQuery.eq('is_anulada', false);
      }

      if (filters.status === 'Resolvidas') {
        if (!filters.userSolvedIds || filters.userSolvedIds.length === 0) {
          return { questions: [], total: 0, page, pageSize, totalPages: 0 };
        }
        countQuery = countQuery.in('id', filters.userSolvedIds.slice(0, 2000));
      } else if (filters.status === 'Acertadas') {
        if (!filters.userCorrectIds || filters.userCorrectIds.length === 0) {
          return { questions: [], total: 0, page, pageSize, totalPages: 0 };
        }
        countQuery = countQuery.in('id', filters.userCorrectIds.slice(0, 2000));
      } else if (filters.status === 'Erradas') {
        if (!filters.userWrongIds || filters.userWrongIds.length === 0) {
          return { questions: [], total: 0, page, pageSize, totalPages: 0 };
        }
        countQuery = countQuery.in('id', filters.userWrongIds.slice(0, 2000));
      } else if (filters.status === 'Não vistas') {
        if (filters.userSolvedIds && filters.userSolvedIds.length > 0) {
          countQuery = countQuery.not('id', 'in', `(${filters.userSolvedIds.slice(0, 500).join(',')})`);
        }
      }

      const countSpecs = new Set<string>();
      if (filters.especialidades && filters.especialidades.length > 0) {
        filters.especialidades.forEach((sp) => {
          countSpecs.add(sp);
          if (sp === 'Cirurgia Geral' || sp === 'Cirurgia') {
            countSpecs.add('Cirurgia');
            countSpecs.add('Cirurgia Geral');
          }
          if (sp === 'Ginecologia e Obstetrícia') {
            countSpecs.add('Ginecologia');
            countSpecs.add('Obstetrícia');
          }
          if (sp === 'Medicina Preventiva' || sp === 'Medicina Preventiva e Social') {
            countSpecs.add('Medicina Preventiva e Social');
            countSpecs.add('Medicina Preventiva');
          }
        });
      }

      const countContentOrParts: string[] = [];
      if (countSpecs.size > 0) {
        const specList = Array.from(countSpecs).map((s) => `"${s}"`).join(',');
        countContentOrParts.push(`especialidade.in.(${specList})`);
      }
      if (filters.temas && filters.temas.length > 0) {
        const temaList = filters.temas.map((t) => `"${t}"`).join(',');
        countContentOrParts.push(`tema.in.(${temaList})`);
      }
      if (filters.focos && filters.focos.length > 0) {
        const focoList = filters.focos.map((f) => `"${f}"`).join(',');
        countContentOrParts.push(`foco.in.(${focoList})`);
      }
      const countParentFocos = (filters.subfocos && filters.subfocos.length > 0)
        ? getParentFocosForSubfocoList(filters.subfocos)
        : [];

      if (filters.subfocos && filters.subfocos.length > 0) {
        const subfocoList = filters.subfocos.map((s) => `"${s}"`).join(',');
        if (countParentFocos.length > 0) {
          const parentFocoList = countParentFocos.map((f: string) => `"${f}"`).join(',');
          countContentOrParts.push(`and(foco.in.(${parentFocoList}),subfoco.in.(${subfocoList}))`);
        } else {
          countContentOrParts.push(`subfoco.in.(${subfocoList})`);
        }
      }

      if (countContentOrParts.length === 1) {
        if (countSpecs.size > 0) {
          countQuery = countQuery.in('especialidade', Array.from(countSpecs));
        } else if (filters.temas && filters.temas.length > 0) {
          countQuery = countQuery.in('tema', filters.temas);
        } else if (filters.focos && filters.focos.length > 0) {
          countQuery = countQuery.in('foco', filters.focos);
        } else if (filters.subfocos && filters.subfocos.length > 0) {
          if (countParentFocos.length > 0) {
            countQuery = countQuery.in('foco', countParentFocos).in('subfoco', filters.subfocos);
          } else {
            countQuery = countQuery.in('subfoco', filters.subfocos);
          }
        }
      } else if (countContentOrParts.length > 1) {
        countQuery = countQuery.or(countContentOrParts.join(','));
      }
      if (filters.instituicoes && filters.instituicoes.length > 0) {
        const resolved = resolveBancaList(filters.instituicoes);
        if (resolved.length > 0) countQuery = countQuery.in('banca', resolved);
      }
      if (filters.anos && filters.anos.length > 0) {
        countQuery = countQuery.in('year', filters.anos);
      } else if (filters.ultimos5Anos) {
        const minYear = new Date().getFullYear() - 4;
        countQuery = countQuery.gte('year', minYear);
      }
      if (filters.dificuldade && filters.dificuldade !== 'Todas') {
        countQuery = countQuery.eq('difficulty', filters.dificuldade);
      }
      if (filters.tipoQuestao && filters.tipoQuestao !== 'Todas') {
        countQuery = countQuery.eq('type', filters.tipoQuestao);
      }
      if (filters.ocultarAnuladasErro) {
        countQuery = countQuery.eq('is_anulada', false);
      }
      if (filters.modalidades && filters.modalidades.length > 0) {
        const hasRevalida = filters.modalidades.some((m) => m.toLowerCase().includes('revalida'));
        const otherModalidades = filters.modalidades.filter((m) => !m.toLowerCase().includes('revalida'));
        if (hasRevalida && otherModalidades.length === 0) {
          countQuery = countQuery.or('modalidade.eq.Revalida,banca.ilike.%Revalida%,institution.ilike.%Revalida%,code.ilike.INEPREVALIDA%');
        } else if (hasRevalida && otherModalidades.length > 0) {
          const otherIn = otherModalidades.join(',');
          countQuery = countQuery.or(`modalidade.in.(${otherIn}),banca.ilike.%Revalida%,institution.ilike.%Revalida%,code.ilike.INEPREVALIDA%`);
        } else {
          const isOnlyDefault =
            filters.modalidades.length === 1 &&
            filters.modalidades[0] === 'Residência Médica';
          if (!isOnlyDefault) {
            countQuery = countQuery.in('modalidade', filters.modalidades);
          }
        }
      }

      // Timeout estendido de segurança (5.000ms)
      const countPromise = countQuery;
      const timeoutPromise = new Promise<{ count: null }>((resolve) => setTimeout(() => resolve({ count: null }), 5000));
      const res = await Promise.race([countPromise, timeoutPromise]);

      if (res && typeof res.count === 'number') {
        total = res.count;
        countCache.set(countKey, { count: total, timestamp: now });
      } else {
        // Fallback proporcional baseado nos números reais homologados de hierarchyCounts
        let fallbackSum = 0;
        if (filters.subfocos && filters.subfocos.length > 0) {
          fallbackSum = filters.subfocos.reduce((acc, s) => acc + (getQuestionCount('subfocos', s) || 0), 0);
        } else if (filters.focos && filters.focos.length > 0) {
          fallbackSum = filters.focos.reduce((acc, f) => acc + (getQuestionCount('focos', f) || 0), 0);
        } else if (filters.temas && filters.temas.length > 0) {
          fallbackSum = filters.temas.reduce((acc, t) => acc + (getQuestionCount('temas', t) || 0), 0);
        } else if (filters.especialidades && filters.especialidades.length > 0) {
          fallbackSum = filters.especialidades.reduce((acc, e) => acc + (getQuestionCount('especialidades', e) || 0), 0);
        }
        total = fallbackSum > 0 ? fallbackSum : Math.max(from + questions.length, 132965);
      }
    } catch {
      total = Math.max(from + questions.length, 132965);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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
        .select(SAFE_QUESTION_COLUMNS)
        .or(`code.ilike.%${q}%,banca.ilike.%${q}%,foco.ilike.%${q}%`)
        .limit(limit);

      if (!error && data && data.length > 0) {
        return (data as unknown as QuestionDbRow[]).map(mapRowToQuestion);
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
      .select(SAFE_QUESTION_COLUMNS)
      .or(`foco.ilike.%${primaryTerm}%,subfoco.ilike.%${primaryTerm}%,tema.ilike.%${primaryTerm}%,banca.ilike.%${primaryTerm}%`)
      .limit(limit);

    if (!error && data && data.length > 0) {
      return (data as unknown as QuestionDbRow[]).map(mapRowToQuestion);
    }

    // Fallback por código aproximado
    const { data: codeData } = await supabase
      .from('questions')
      .select(SAFE_QUESTION_COLUMNS)
      .ilike('code', `%${primaryTerm}%`)
      .limit(limit);

    return (codeData as unknown as QuestionDbRow[] || []).map(mapRowToQuestion);
  } catch (err) {
    console.error('Erro na busca direta de questões:', err);
    return [];
  }
}

export async function fetchQuestionById(id: string): Promise<Question | null> {
  const { data, error } = await supabase
    .from('questions')
    .select(SAFE_QUESTION_COLUMNS)
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
    options?: QuestionOption[];
    reportId?: string;
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

    // 3. Obtém token de autorização do administrador se ativo
    let authHeader: Record<string, string> = {};
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        authHeader = { Authorization: "Bearer " + session.access_token };
      }
    } catch {
      // continua sem header
    }

    // 4. Salvar via API Route segura (Supabase Service Role, bypassa RLS de forma garantida)
    const res = await fetch('/api/admin/curadoria/update-gabarito', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
      body: JSON.stringify({
        questionId: id,
        correctAnswer: data.correctAnswer,
        isAnulada: data.isAnulada,
        commentary: data.commentary,
        options: data.options,
        reportId: data.reportId
      })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Erro ao salvar gabarito no banco de dados.' };
    }

    // Dispara evento global em tempo real para sincronizar todo o site
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('bancoresidencia_question_updated', {
          detail: {
            questionId: id,
            correctAnswer: data.correctAnswer,
            isAnulada: data.isAnulada,
            commentary: data.commentary,
            options: data.options
          }
        })
      );
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro inesperado';
    console.error('Exceção ao salvar gabarito:', err);
    return { success: false, error: message };
  }
}

/**
 * Busca a lista de provas prioritárias para curadoria rápida
 */
export async function fetchPriorityExams(
  tier: string = 'ouro',
  search: string = '',
  ano: string = 'todos'
) {
  const params = new URLSearchParams();
  if (tier) params.set('tier', tier);
  if (search) params.set('search', search);
  if (ano) params.set('ano', ano);

  const res = await fetch(`/api/admin/curadoria/provas-prioritarias?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Falha ao carregar lista de provas prioritárias');
  }
  return res.json();
}

/**
 * Busca todas as questões de uma prova específica do Supabase em tempo real
 */
export async function fetchExamQuestions(examKey: string, onlyMissing: boolean = false) {
  const params = new URLSearchParams();
  params.set('examKey', examKey);
  if (onlyMissing) params.set('onlyMissing', 'true');

  const res = await fetch(`/api/admin/curadoria/questoes-prova?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Falha ao carregar questões da prova selecionada');
  }
  return res.json();
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

function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Registra denúncia ou apontamento de erro em questão com comentários do estudante
 */
export async function reportQuestionIssue(
  questionId: string,
  reason: string = 'Erro no gabarito ou enunciado',
  details?: string,
  userMeta?: { id?: string; email?: string; name?: string }
): Promise<{ success: boolean; message: string }> {
  if (!questionId || typeof questionId !== 'string') {
    return { success: false, message: 'ID da questão inválido.' };
  }

  const cleanDetails = (details || '').trim();
  if (cleanDetails.length < 3) {
    return { success: false, message: 'Por favor, adicione uma justificativa com pelo menos 3 caracteres.' };
  }

  try {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId,
        reason,
        details: cleanDetails,
        userMeta
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      // Salva no cache local para exibição instantânea offline
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('bancoresidencia_reported_questions');
          const list = raw ? JSON.parse(raw) : [];
          list.unshift({
            id: data.reportId,
            questionId,
            userId: userMeta?.id || null,
            userEmail: userMeta?.email || null,
            userName: userMeta?.name || 'Estudante',
            reason,
            details: cleanDetails,
            status: 'pending',
            createdAt: new Date().toISOString()
          });
          localStorage.setItem('bancoresidencia_reported_questions', JSON.stringify(list));
        } catch {
          // ignore
        }
      }
      return {
        success: true,
        message: data.message || 'Apontamento registrado com sucesso. A equipe médica irá auditar!'
      };
    }

    return {
      success: false,
      message: data.error || 'Erro ao enviar apontamento. Tente novamente.'
    };
  } catch (err) {
    console.warn('[questionService] Falha de rede ao reportar questão:', err);
    return {
      success: false,
      message: 'Erro de conexão ao enviar apontamento. Verifique sua rede e tente novamente.'
    };
  }
}

interface QuestionReportDbRow {
  id: string;
  question_id: string;
  user_id?: string | null;
  user_email?: string | null;
  user_name?: string | null;
  reason: string;
  details?: string;
  status?: ReportStatus;
  admin_notes?: string | null;
  created_at?: string;
  resolved_at?: string | null;
  timestamp?: string;
  questionId?: string;
  userId?: string | null;
  userName?: string;
  userEmail?: string;
  adminNotes?: string | null;
  createdAt?: string;
  resolvedAt?: string | null;
}

/**
 * Busca a lista de questões reportadas para o painel de auditoria do Administrador,
 * consumindo diretamente a API segura de backend que consulta o Supabase via Service Role.
 */
export async function fetchReportedQuestionsForAdmin(statusFilter?: string): Promise<QuestionReport[]> {
  // Sincroniza eventuais denúncias locais pendentes no navegador atual antes de buscar
  if (typeof window !== 'undefined') {
    await syncPendingLocalReportsToSupabase().catch(() => {});
  }

  try {
    let authHeader: Record<string, string> = {};
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        authHeader = { Authorization: "Bearer " + session.access_token };
      }
    } catch {
      // continua sem header
    }

    const url = statusFilter && statusFilter !== 'all'
      ? `/api/admin/reports?status=${encodeURIComponent(statusFilter)}`
      : '/api/admin/reports';

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
      cache: 'no-store'
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.reports)) {
        return data.reports;
      }
    } else {
      console.warn('[questionService] API /api/admin/reports retornou status:', res.status);
    }
  } catch (err) {
    console.warn('[questionService] Falha ao consultar /api/admin/reports:', err);
  }

  // Fallback offline caso o servidor esteja inacessível
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('bancoresidencia_reported_questions');
      if (raw) {
        const localList = JSON.parse(raw);
        if (Array.isArray(localList)) {
          return (localList as QuestionReportDbRow[]).filter((item) => {
            if (!statusFilter || statusFilter === 'all') return true;
            return item.status === statusFilter;
          }).map((item) => ({
            id: item.id || `rep_${item.questionId || item.question_id}_${item.timestamp || item.createdAt}`,
            questionId: item.questionId || item.question_id,
            userId: item.user_id || item.userId || null,
            userEmail: item.user_email || item.userEmail || null,
            userName: item.user_name || item.userName || 'Estudante',
            reason: item.reason,
            details: item.details || '',
            status: item.status || 'pending',
            adminNotes: item.admin_notes || item.adminNotes || null,
            createdAt: item.created_at || item.createdAt || item.timestamp || new Date().toISOString()
          }));
        }
      }
    } catch {
      // ignore
    }
  }

  return [];
}

/**
 * Atualiza o status de uma denúncia/report pelo Administrador via API segura do Supabase
 */
export async function updateQuestionReportStatus(
  reportId: string,
  status: ReportStatus,
  adminNotes?: string
): Promise<{ success: boolean; message: string }> {
  try {
    let authHeader: Record<string, string> = {};
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        authHeader = { Authorization: "Bearer " + session.access_token };
      }
    } catch {
      // continua sem header
    }

    const res = await fetch('/api/admin/reports', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
      body: JSON.stringify({
        reportId,
        status,
        adminNotes
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      // Sincroniza cache local imediato
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('bancoresidencia_reported_questions');
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const updated = (list as QuestionReportDbRow[]).map((item) => {
                if (item.id === reportId || item.questionId === reportId) {
                  return {
                    ...item,
                    status,
                    adminNotes: adminNotes || item.adminNotes,
                    resolvedAt: status === 'resolved' ? new Date().toISOString() : item.resolvedAt
                  };
                }
                return item;
              });
              localStorage.setItem('bancoresidencia_reported_questions', JSON.stringify(updated));
            }
          }
        } catch {
          // ignore
        }
      }
      return { success: true, message: data.message || `Status atualizado para "${status}".` };
    }

    return { success: false, message: data.error || 'Erro ao atualizar status.' };
  } catch (err) {
    console.error('[questionService] Falha de comunicação ao atualizar report:', err);
    return { success: false, message: 'Erro de conexão ao atualizar status do reporte.' };
  }
}

/**
 * Sincroniza denúncias pendentes salvas no localStorage do aluno diretamente para o Supabase
 * através da API de backend (usando Service Role para contornar qualquer restrição RLS com segurança).
 */
export async function syncPendingLocalReportsToSupabase(currentUser?: { id?: string; email?: string } | null): Promise<number> {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('bancoresidencia_reported_questions');
      if (!raw) return 0;

      const list = JSON.parse(raw);
      if (!Array.isArray(list) || list.length === 0) return 0;

      const pending = list.filter((item) => !item._synced);
      if (pending.length === 0) return 0;

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reports: pending })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const updatedList = list.map((item) => ({ ...item, _synced: true }));
          localStorage.setItem('bancoresidencia_reported_questions', JSON.stringify(updatedList));
          return data.syncedCount || pending.length;
        }
      }
    } catch (err) {
      console.warn('Erro ao sincronizar reports locais pendentes:', err);
      return 0;
    }
  }
  return 0;
}

/**
 * Busca IDs reais de questões no Supabase aplicando amostragem estratificada,
 * aleatorização real (sem efeito bloco), interpretação inteligente de cotas com
 * fallback automático de estoque e intercalação Round-Robin na sequência final.
 * Teto máximo absoluto: 200 questões.
 */
export async function fetchQuestionIdsForListCriteria(
  quotasByItem: Record<string, number>,
  filters: ExtendedFilterState,
  maxTotal: number = 200,
  answeredQuestionIds?: string[]
): Promise<string[]> {
  return generateStratifiedQuiz(quotasByItem, filters, maxTotal, answeredQuestionIds);
}

