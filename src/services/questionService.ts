import { supabase } from '@/lib/supabase';
import { Question, QuestionOption, AdvancedFilterState, QuestionReport, ReportStatus, StudyModalidade } from '@/types';
import { sanitizeMedicalText } from '@/utils/textSanitizer';
import {
  sanitizePostgrestTerm,
  sanitizePostgrestQuotedValue,
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
import {
  getHomologatedBaseline,
  homologatedDiretoBaseline,
  homologatedRevalidaBaseline,
  homologatedRPlusBaseline,
  homologatedTituloBaseline
} from '@/data/homologatedFacetsBaseline';
import { clinicalHierarchy } from '@/data/mockQuestions';
import { fetchStudyCatalog, requestStudyQuestions } from './studyQuestionClient';

// Projeção segura de colunas: omite estritamente correct_answer e commentary contra scraping
export const SAFE_QUESTION_COLUMNS = 'id, code, institution, banca, year, tipo_prova, modalidade, especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type, is_anulada, statement, options, images';

// Mapeamento em memória de Subfocos para Focos ancestrais indexados no PostgreSQL
const subfocoToParentFocos = new Map<string, string[]>();

export function getParentFocosForSubfocoList(subfocos: string[]): string[] {
  if (subfocoToParentFocos.size === 0) {
    clinicalHierarchy.forEach((esp) => {
      esp.temas.forEach((tem) => {
        tem.focos.forEach((foc) => {
          foc.subfocos.forEach((subItem) => {
            const sub = typeof subItem === 'string' ? subItem : subItem.subfoco;
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

export interface ClinicalFilterClausesResult {
  orParts: string[];
  standaloneSpecs: string[];
  standaloneTemas: string[];
  standaloneFocos: string[];
  standaloneSubfocos: string[];
  standaloneSubSubfocos: string[];
  subfocosByParentFoco: [string, string[]][];
}

/**
 * Constrói as cláusulas da árvore clínica de 5 níveis aplicando:
 * 1. Refinamento Pai -> Filho até sub_subfoco (se o estudante selecionou um sub_subfoco,
 *    o subfoco/foco/tema/especialidade pai refina para o nó mais específico selecionado).
 * 2. Soma / União entre ramos diferentes.
 */
export function buildClinicalFilterClauses(filters: ExtendedFilterState): ClinicalFilterClausesResult {
  const selectedSpecs = new Set(filters.especialidades || []);
  const selectedTemas = new Set(filters.temas || []);
  const selectedFocos = new Set(filters.focos || []);
  const selectedSubfocos = new Set(filters.subfocos || []);
  const selectedSubSubfocos = new Set(filters.subSubfocos || []);

  const specsWithChildren = new Set<string>();
  const temasWithChildren = new Set<string>();
  const focosWithChildren = new Set<string>();
  const subfocosWithChildren = new Set<string>();

  clinicalHierarchy.forEach((esp) => {
    esp.temas.forEach((tem) => {
      if (selectedTemas.has(tem.tema)) {
        specsWithChildren.add(esp.especialidade);
      }
      tem.focos.forEach((foc) => {
        if (selectedFocos.has(foc.foco)) {
          specsWithChildren.add(esp.especialidade);
          temasWithChildren.add(tem.tema);
        }
        foc.subfocos.forEach((subItem) => {
          const sub = typeof subItem === 'string' ? subItem : subItem.subfoco;
          const subSubs = typeof subItem === 'string' ? [] : (subItem.sub_subfocos || []);
          if (selectedSubfocos.has(sub)) {
            specsWithChildren.add(esp.especialidade);
            temasWithChildren.add(tem.tema);
            focosWithChildren.add(foc.foco);
          }
          if (subSubs.some((ss) => selectedSubSubfocos.has(ss))) {
            specsWithChildren.add(esp.especialidade);
            temasWithChildren.add(tem.tema);
            focosWithChildren.add(foc.foco);
            subfocosWithChildren.add(sub);
          }
        });
      });
    });
  });

  const standaloneSpecs = new Set<string>();
  selectedSpecs.forEach((sp) => {
    if (!specsWithChildren.has(sp)) {
      standaloneSpecs.add(sp);
      if (sp === 'Cirurgia' || sp === 'Cirurgia Geral') {
        standaloneSpecs.add('Cirurgia');
        standaloneSpecs.add('Cirurgia Geral');
      } else if (sp === 'Ginecologia e Obstetrícia') {
        standaloneSpecs.add('Ginecologia');
        standaloneSpecs.add('Obstetrícia');
      } else if (sp === 'Ginecologia' || sp === 'Obstetrícia') {
        standaloneSpecs.add(sp);
        standaloneSpecs.add('Ginecologia e Obstetrícia');
      } else if (sp === 'Medicina Preventiva' || sp === 'Medicina Preventiva e Social') {
        standaloneSpecs.add('Medicina Preventiva');
        standaloneSpecs.add('Medicina Preventiva e Social');
      }
    }
  });

  const standaloneTemas = new Set<string>();
  selectedTemas.forEach((tem) => {
    if (!temasWithChildren.has(tem)) {
      standaloneTemas.add(tem);
    }
  });

  const standaloneFocos = new Set<string>();
  selectedFocos.forEach((foc) => {
    if (!focosWithChildren.has(foc)) {
      standaloneFocos.add(foc);
    }
  });

  const standaloneSubfocos = new Set<string>();
  selectedSubfocos.forEach((sub) => {
    if (!subfocosWithChildren.has(sub)) {
      standaloneSubfocos.add(sub);
    }
  });

  const subfocosByParentFoco = new Map<string, string[]>();
  if (standaloneSubfocos.size > 0) {
    clinicalHierarchy.forEach((esp) => {
      esp.temas.forEach((tem) => {
        tem.focos.forEach((foc) => {
          foc.subfocos.forEach((subItem) => {
            const sub = typeof subItem === 'string' ? subItem : subItem.subfoco;
            if (standaloneSubfocos.has(sub)) {
              const list = subfocosByParentFoco.get(foc.foco) || [];
              if (!list.includes(sub)) list.push(sub);
              subfocosByParentFoco.set(foc.foco, list);
            }
          });
        });
      });
    });
  }

  const orParts: string[] = [];
  if (standaloneSpecs.size > 0) {
    const specList = Array.from(standaloneSpecs)
      .map((s) => sanitizePostgrestQuotedValue(s))
      .filter(Boolean)
      .map((s) => `"${s}"`)
      .join(',');
    if (specList) orParts.push(`especialidade.in.(${specList})`);
  }
  if (standaloneTemas.size > 0) {
    const temaList = Array.from(standaloneTemas)
      .map((t) => sanitizePostgrestQuotedValue(t))
      .filter(Boolean)
      .map((t) => `"${t}"`)
      .join(',');
    if (temaList) orParts.push(`tema.in.(${temaList})`);
  }
  if (standaloneFocos.size > 0) {
    const focoList = Array.from(standaloneFocos)
      .map((f) => sanitizePostgrestQuotedValue(f))
      .filter(Boolean)
      .map((f) => `"${f}"`)
      .join(',');
    if (focoList) orParts.push(`foco.in.(${focoList})`);
  }
  if (standaloneSubfocos.size > 0) {
    const subList = Array.from(standaloneSubfocos).map((s) => `"${s}"`).join(',');
    orParts.push(`subfoco.in.(${subList})`);
  }
  if (selectedSubSubfocos.size > 0) {
    const ssList = Array.from(selectedSubSubfocos).map((ss) => `"${ss}"`).join(',');
    orParts.push(`sub_subfoco.in.(${ssList})`);
  }

  return {
    orParts,
    standaloneSpecs: Array.from(standaloneSpecs),
    standaloneTemas: Array.from(standaloneTemas),
    standaloneFocos: Array.from(standaloneFocos),
    standaloneSubfocos: Array.from(standaloneSubfocos),
    standaloneSubSubfocos: Array.from(selectedSubSubfocos),
    subfocosByParentFoco: Array.from(subfocosByParentFoco.entries())
  };
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
  type?: 'Múltipla escolha' | 'Dissertativa' | 'Discursiva' | 'Certo ou errado' | 'Verdadeiro ou falso';
  is_anulada?: boolean;
  statement: string;
  options?: { letter?: 'A' | 'B' | 'C' | 'D' | 'E'; text?: string }[];
  correct_answer?: 'A' | 'B' | 'C' | 'D' | 'E';
  commentary?: string;
  images?: string[];
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

function mapRowToQuestion(row: QuestionDbRow): Question {
  // Higieniza as alternativas com fallback seguro de letra por índice posicional
  const cleanOptions = Array.isArray(row.options)
    ? row.options.map((opt: any, idx: number) => {
      const rawLetter = opt?.letter;
      const normalizedLetter = (typeof rawLetter === 'string' && rawLetter.trim().length === 1 && (OPTION_LETTERS as readonly string[]).includes(rawLetter.trim().toUpperCase()))
        ? (rawLetter.trim().toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E')
        : (OPTION_LETTERS[idx] || 'A');
      return {
        letter: normalizedLetter,
        text: opt?.text || ''
      };
    })
    : [];

  const rawInst = (row.institution || '').trim();
  const rawBanca = (row.banca || '').trim();
  const code = (row.code || '').trim();

  // Extrai ano do código se year for 2024 padrão ou vazio mas o code indicar ano histórico
  let resolvedYear = row.year || 2024;
  if (code) {
    const m = code.match(/-(\d{4})-/);
    if (m) {
      const codeYear = parseInt(m[1], 10);
      if (codeYear >= 2000 && codeYear <= 2030 && (!row.year || (row.year === 2024 && codeYear !== 2024))) {
        resolvedYear = codeYear;
      }
    }
  }

  // Resolução inteligente de instituição e banca
  const institution = (rawInst && rawInst !== 'Oficial' && rawInst !== 'Banca Oficial')
    ? rawInst
    : (rawBanca && rawBanca !== 'Oficial' ? rawBanca : (rawInst || 'Banca Oficial'));

  const banca = (rawBanca && rawBanca !== 'Oficial' && rawBanca !== 'Banca Oficial')
    ? rawBanca
    : (institution.includes(' - ') ? institution.split(' - ')[0].trim() : institution);

  return {
    id: row.id,
    code: row.code || '',
    institution,
    banca,
    year: resolvedYear,
    tipoProva: row.tipo_prova || 'Prova 1',
    modalidade: (row.modalidade as Question['modalidade']) || 'Residência Médica',
    modalidades: row.modalidade ? [(row.modalidade as Question['modalidade'])] : ['Residência Médica'],
    especialidade: row.especialidade || '',
    specialty: row.especialidade || '',
    tema: row.tema || '',
    foco: row.foco || '',
    subfoco: row.subfoco || '',
    sub_subfoco: (row as any).sub_subfoco || (row as any).subSubfoco || '',
    subSubfoco: (row as any).subSubfoco || (row as any).sub_subfoco || '',
    difficulty: row.difficulty || 'Médio',
    type: ((row.type === 'Discursiva' ? 'Dissertativa' : (row.type === 'Verdadeiro ou falso' ? 'Certo ou errado' : (row.type || 'Múltipla escolha')))) as Question['type'],
    isAnulada: Boolean(row.is_anulada),
    statement: sanitizeMedicalText(row.statement || ''),
    options: cleanOptions.map(opt => ({ ...opt, text: sanitizeMedicalText(opt.text) })),
    correctAnswer: (row.correct_answer as Question['correctAnswer']) || '',
    commentary: sanitizeMedicalText(row.commentary || ''),
    images: Array.isArray(row.images) ? row.images : []
  };
}

export interface FetchQuestionsResult {
  questions: Question[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sessionTicket?: string;
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
  'Revalida USP (FMRP)': ['FMRP-USP'],
  'FMRP-USP': ['FMRP-USP'],
  'FMRP-USP Revalida': ['FMRP-USP'],
  'UFMT Revalida': ['UFMT Revalida', 'UFMT'],
  'UEPA Revalida': ['UEPA Revalida', 'UEPA'],
  'UNIRG Revalida': ['UNIRG Revalida', 'UNIRG'],
  'USP-SP': ['USP/HCFMUSP', 'USP-SP'],
  'USP/HCFMUSP': ['USP/HCFMUSP', 'USP-SP'],
  'SUS-SP': ['SUS-SP'],
  'UNICAMP': ['UNICAMP/HC', 'UNICAMP'],
  'UNICAMP/HC': ['UNICAMP/HC', 'UNICAMP'],
  'UNIFESP': ['UNIFESP/EPM', 'UNIFESP'],
  'UNIFESP/EPM': ['UNIFESP/EPM', 'UNIFESP'],
  'USP-RP': ['USP-RP', 'FMRP-USP', 'USP/RP'],
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

export const REVALIDA_BANCAS_LIST = [
  'INEP Revalida',
  'UFMT Revalida',
  'UEPA Revalida',
  'UNIRG Revalida',
  'FMRP-USP'
];

export const REVALIDA_POSTGREST_FILTER =
  'modalidade.eq.Revalida,banca.in.("INEP Revalida","UFMT Revalida","UEPA Revalida","UNIRG Revalida","FMRP-USP")';

/**
 * Normaliza e gera variantes de termos clínicos com e sem acentuação para busca resiliente no PostgREST
 */
export function getClinicalSearchTerms(raw: string): string[] {
  const terms = new Set<string>();
  const clean = raw.trim();
  if (!clean) return [];
  terms.add(clean);

  const ACCENT_MAP: Record<string, string[]> = {
    'sifilis': ['sífilis', 'sifilis'],
    'sífilis': ['sífilis', 'sifilis'],
    'forcipe': ['fórcipe', 'forcipe'],
    'fórcipe': ['fórcipe', 'forcipe'],
    'pre-natal': ['pré-natal', 'pre-natal', 'prenatal'],
    'pré-natal': ['pré-natal', 'pre-natal', 'prenatal'],
    'cesarea': ['cesárea', 'cesarea'],
    'cesárea': ['cesárea', 'cesarea'],
    'eclampsia': ['eclâmpsia', 'eclampsia'],
    'eclâmpsia': ['eclâmpsia', 'eclampsia'],
    'puerperio': ['puerpério', 'puerperio'],
    'puerpério': ['puerpério', 'puerperio'],
    'pneumotorax': ['pneumotórax', 'pneumotorax'],
    'pneumotórax': ['pneumotórax', 'pneumotorax'],
    'hernia': ['hérnia', 'hernia'],
    'hérnia': ['hérnia', 'hernia'],
    'clinica': ['clínica', 'clinica'],
    'clínica': ['clínica', 'clinica'],
    'obstetricia': ['obstetrícia', 'obstetricia'],
    'obstetrícia': ['obstetrícia', 'obstetricia'],
    'hanseniase': ['hanseníase', 'hanseniase'],
    'hanseníase': ['hanseníase', 'hanseniase']
  };

  const normalized = clean.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (ACCENT_MAP[clean.toLowerCase()]) {
    ACCENT_MAP[clean.toLowerCase()].forEach((t) => terms.add(t));
  } else if (ACCENT_MAP[normalized]) {
    ACCENT_MAP[normalized].forEach((t) => terms.add(t));
  } else {
    terms.add(clean);
    if (normalized !== clean.toLowerCase()) {
      terms.add(normalized);
    }
  }

  return Array.from(terms);
}

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
export async function fetchTotalQuestionsCount(
  _onlyClassifiedWithAnswer: boolean = true,
  isRevalida: boolean = false,
  modalidades?: StudyModalidade[]
): Promise<number> {
  const catalog = await fetchStudyCatalog({ modalidades: modalidades ?? (isRevalida ? ['Revalida'] : undefined) });
  return catalog.total;
}

export function calculateHierarchyFallback(filters: ExtendedFilterState): number {
  const isRevalida = Boolean(filters.modalidades?.some(m => m.toLowerCase().includes('revalida')));
  const baseline = getHomologatedBaseline(filters.modalidades);

  let baseCount = 0;
  let hasClinical = false;

  if (filters.subSubfocos && filters.subSubfocos.length > 0) {
    baseCount = Math.max(1, isRevalida ? 5 : 20);
    hasClinical = true;
  } else if (filters.subfocos && filters.subfocos.length > 0) {
    const sum = filters.subfocos.reduce((acc, s) => acc + ((baseline.subfocos as Record<string, number>)?.[s] || getQuestionCount('subfocos', s) || 0), 0);
    if (sum > 0) {
      baseCount = Math.max(1, sum);
      hasClinical = true;
    }
  } else if (filters.focos && filters.focos.length > 0) {
    const sum = filters.focos.reduce((acc, f) => acc + ((baseline.focos as Record<string, number>)[f] || getQuestionCount('focos', f) || 0), 0);
    if (sum > 0) {
      baseCount = Math.max(1, sum);
      hasClinical = true;
    }
  } else if (filters.temas && filters.temas.length > 0) {
    const sum = filters.temas.reduce((acc, t) => acc + ((baseline.temas as Record<string, number>)[t] || getQuestionCount('temas', t) || 0), 0);
    if (sum > 0) {
      baseCount = Math.max(1, sum);
      hasClinical = true;
    }
  } else if (filters.especialidades && filters.especialidades.length > 0) {
    const sum = filters.especialidades.reduce((acc, e) => acc + ((baseline.especialidades as Record<string, number>)[e] || getQuestionCount('especialidades', e) || 0), 0);
    if (sum > 0) {
      baseCount = Math.max(1, sum);
      hasClinical = true;
    }
  }

  // Se não há filtro clínico, a base inicial é o total da modalidade
  if (!hasClinical) {
    if (filters.dificuldade && filters.dificuldade !== 'Todas') {
      baseCount = baseline.dificuldades?.[filters.dificuldade as 'Fácil' | 'Médio' | 'Difícil'] || baseline.total;
    } else if (filters.tipoQuestao && filters.tipoQuestao !== 'Todas') {
      if (filters.tipoQuestao === 'Certo ou errado' || filters.tipoQuestao === 'Certo e Errado' || filters.tipoQuestao === 'Verdadeiro ou falso') {
        baseCount = baseline.tipos?.['Certo ou errado'] || 0;
      } else if (filters.tipoQuestao === 'Dissertativa' || filters.tipoQuestao === 'Discursiva') {
        baseCount = (baseline.tipos?.['Dissertativa'] || 0) + (baseline.tipos?.['Discursiva'] || 0);
      } else {
        baseCount = baseline.tipos?.[filters.tipoQuestao] || baseline.total;
      }
    } else if (filters.anos && filters.anos.length > 0 && filters.anos.length < 24) {
      const sumYears = filters.anos.reduce((acc, y) => acc + (baseline.anos?.[y] || 0), 0);
      baseCount = sumYears > 0 ? sumYears : baseline.total;
    } else {
      baseCount = baseline.total;
    }
  } else {
    // Se há filtro clínico E também filtro de dificuldade
    if (filters.dificuldade && filters.dificuldade !== 'Todas' && baseline.total > 0) {
      const diffTotal = baseline.dificuldades?.[filters.dificuldade as 'Fácil' | 'Médio' | 'Difícil'] || 0;
      const ratio = diffTotal / baseline.total;
      baseCount = Math.max(1, Math.round(baseCount * ratio));
    }
  }

  // Ajuste para "Não vistas"
  if (filters.status === 'Não vistas' && filters.userSolvedIds && filters.userSolvedIds.length > 0) {
    baseCount = Math.max(0, baseCount - filters.userSolvedIds.length);
  }

  return baseCount > 0 ? baseCount : baseline.total;
}

export async function fetchQuestionsFromSupabase(
  filters: ExtendedFilterState = {},
  page: number = 1,
  pageSize: number = 20,
  questionIds?: string[],
  signal?: AbortSignal
): Promise<FetchQuestionsResult> {
  const size = Math.min(pageSize, 50);
  const first = await requestStudyQuestions<FetchQuestionsResult>({ filters, page, pageSize: size, questionIds }, signal);
  if (pageSize <= size || page !== 1) return first;

  const remaining = Math.ceil(Math.min(pageSize, first.total) / size) - 1;
  const pages = await Promise.all(Array.from({ length: Math.max(0, remaining) }, (_, index) =>
    requestStudyQuestions<FetchQuestionsResult>({ filters, page: index + 2, pageSize: size, questionIds }, signal)
  ));
  return {
    ...first,
    questions: [...first.questions, ...pages.flatMap((result) => result.questions)],
    pageSize,
    totalPages: Math.ceil(first.total / pageSize)
  };
}

export async function searchQuestionsDirect(
  queryText: string,
  limit: number = 20
): Promise<Question[]> {
  const q = sanitizePostgrestTerm(queryText);
  if (!q || q.length < 2) return [];

  const CANONICAL_PUBLIC_VIEWS = [
    'view_questions_acesso_direto',
    'view_questions_revalida',
    'view_questions_rplus',
    'view_questions_titulo'
  ] as const;

  try {
    // 1. Se for código ou ano específico (ex: HSLPUCRS, INEP, 2024)
    if (/^[A-Za-z0-9_-]{3,}$/.test(q)) {
      const codeResults = await Promise.all(
        CANONICAL_PUBLIC_VIEWS.map((v) =>
          supabase
            .from(v)
            .select(SAFE_QUESTION_COLUMNS)
            .or(`code.ilike.%${q}%,banca.ilike.%${q}%,foco.ilike.%${q}%`)
            .limit(limit)
        )
      );
      const mergedCodeRows = codeResults.flatMap((r) => (!r.error && r.data ? (r.data as unknown as QuestionDbRow[]) : []));
      if (mergedCodeRows.length > 0) {
        return mergedCodeRows.slice(0, limit).map(mapRowToQuestion);
      }
    }

    // 2. Extrai termos clínicos relevantes com caracteres seguros
    const keywords = q
      .split(/\s+/)
      .filter((w) => w.length >= 4)
      .slice(0, 3);

    const primaryTerm = keywords[0] || q.slice(0, 30);

    const termResults = await Promise.all(
      CANONICAL_PUBLIC_VIEWS.map((v) =>
        supabase
          .from(v)
          .select(SAFE_QUESTION_COLUMNS)
          .or(`foco.ilike.%${primaryTerm}%,subfoco.ilike.%${primaryTerm}%,tema.ilike.%${primaryTerm}%,banca.ilike.%${primaryTerm}%`)
          .limit(limit)
      )
    );
    const mergedTermRows = termResults.flatMap((r) => (!r.error && r.data ? (r.data as unknown as QuestionDbRow[]) : []));
    if (mergedTermRows.length > 0) {
      return mergedTermRows.slice(0, limit).map(mapRowToQuestion);
    }

    // Fallback por código aproximado
    const fallbackResults = await Promise.all(
      CANONICAL_PUBLIC_VIEWS.map((v) =>
        supabase
          .from(v)
          .select(SAFE_QUESTION_COLUMNS)
          .ilike('code', `%${primaryTerm}%`)
          .limit(limit)
      )
    );
    return fallbackResults
      .flatMap((r) => (!r.error && r.data ? (r.data as unknown as QuestionDbRow[]) : []))
      .slice(0, limit)
      .map(mapRowToQuestion);
  } catch (err) {
    console.error('Erro na busca direta de questões:', err);
    return [];
  }
}

export async function fetchQuestionById(id: string): Promise<Question | null> {
  const views = [
    'view_questions_acesso_direto',
    'view_questions_revalida',
    'view_questions_rplus',
    'view_questions_titulo'
  ];

  const results = await Promise.all(
    views.map((v) =>
      supabase
        .from(v)
        .select(SAFE_QUESTION_COLUMNS)
        .eq('id', id)
        .maybeSingle()
    )
  );

  const hit = results.find((r) => !r.error && r.data);
  if (!hit || !hit.data) return null;
  return mapRowToQuestion(hit.data as unknown as QuestionDbRow);
}

export async function fetchQuestionsByIds(ids: string[]): Promise<Question[]> {
  if (!ids || ids.length === 0) return [];

  const views = [
    'view_questions_acesso_direto',
    'view_questions_revalida',
    'view_questions_rplus',
    'view_questions_titulo'
  ];

  const results = await Promise.all(
    views.map((v) =>
      supabase
        .from(v)
        .select(SAFE_QUESTION_COLUMNS)
        .in('id', ids)
    )
  );

  const seen = new Set<string>();
  const rows: QuestionDbRow[] = [];
  for (const res of results) {
    if (!res.error && Array.isArray(res.data)) {
      for (const item of res.data as unknown as QuestionDbRow[]) {
        if (item.id && !seen.has(item.id)) {
          seen.add(item.id);
          rows.push(item);
        }
      }
    }
  }
  return rows.map(mapRowToQuestion);
}

export interface ModalidadesCounts {
  residencia: number;
  revalida: number;
  rplus: number;
  titulo: number;
  total: number;
}

export async function fetchModalidadesCounts(): Promise<ModalidadesCounts> {
  return {
    residencia: homologatedDiretoBaseline.total, // 206.599
    revalida: homologatedRevalidaBaseline.total, // 4.411
    rplus: homologatedRPlusBaseline.total, // 45.413
    titulo: homologatedTituloBaseline.total, // 688
    total: homologatedDiretoBaseline.total + homologatedRevalidaBaseline.total + homologatedRPlusBaseline.total + homologatedTituloBaseline.total // 257.111
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
    await syncPendingLocalReportsToSupabase().catch(() => { });
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
  maxTotal: number = 200
): Promise<string[]> {
  return generateStratifiedQuiz(
    quotasByItem,
    filters,
    maxTotal
  );
}

