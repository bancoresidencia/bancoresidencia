import rawData from '@/data/hierarquiaCompletaFiltros.json';
import { CANONICAL_BANCAS_DIRECTORY } from '@/data/canonicalBancasDirectory';
import {
  ExamIncidenceInfo,
  ExamIncidenceLevel,
  TargetInstitutionOption
} from '@/types/studySchedule';
import { buildFocusKey } from '@/utils/studyScheduleStorage';

export interface FocusTaxonomyNode {
  focusKey: string;
  especialidade: string;
  tema: string;
  foco: string;
  specialtyColor: string;
  subfocoCount: number;
}

export interface EnrichedFocusWithIncidence extends FocusTaxonomyNode {
  incidence: ExamIncidenceInfo;
  score: number;
}

// Especialidades e paleta canônica
export const SPECIALTY_COLORS: Record<string, string> = {
  'Clínica Médica': '#3b82f6',
  'Cirurgia': '#10b981',
  'Cirurgia Geral': '#10b981',
  'Pediatria': '#f59e0b',
  'Ginecologia': '#ec4899',
  'Obstetrícia': '#8b5cf6',
  'Ginecologia e Obstetrícia': '#8b5cf6',
  'Medicina Preventiva e Social': '#06b6d4',
  'Medicina Preventiva': '#06b6d4'
};

export function getSpecialtyColor(especialidade: string): string {
  return SPECIALTY_COLORS[especialidade] || '#8b5cf6';
}

// Top instituições mais prestadas no Brasil (destaque rápido)
export const POPULAR_INSTITUTIONS_KEYS = [
  'ENARE',
  'USP-SP',
  'UNICAMP',
  'SUS-SP',
  'AMRIGS',
  'PSU-MG',
  'AMP',
  'SCMSP',
  'IAMSPE',
  'UERJ',
  'UFRJ',
  'SURCE',
  'SES-PE',
  'SES-RJ',
  'UFPR'
];

/**
 * Retorna o catálogo higienizado de instituições de prova disponíveis
 */
export function getAvailableTargetInstitutions(): TargetInstitutionOption[] {
  const popularSet = new Set(POPULAR_INSTITUTIONS_KEYS);

  // Mapeia do diretório canônico
  const fromDirectory: TargetInstitutionOption[] = CANONICAL_BANCAS_DIRECTORY.map((b) => ({
    key: b.sigla,
    sigla: b.sigla,
    nome: b.nome,
    uf: b.uf,
    questionCount: b.count,
    popular: popularSet.has(b.sigla)
  }));

  // Ordena primeiro as populares por contagem, depois as demais por ordem alfabética
  return fromDirectory.sort((a, b) => {
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;
    return (b.questionCount || 0) - (a.questionCount || 0);
  });
}

/**
 * Cache em memória dos 786 focos da taxonomia canônica
 */
let cachedTaxonomyFoci: FocusTaxonomyNode[] | null = null;

export function getAllTaxonomyFoci(): FocusTaxonomyNode[] {
  if (cachedTaxonomyFoci) return cachedTaxonomyFoci;

  const hierarquia = rawData.hierarquia_padrao || [];
  const nodes: FocusTaxonomyNode[] = [];

  for (const esp of hierarquia) {
    const espNome = esp.especialidade;
    const color = getSpecialtyColor(espNome);

    for (const t of esp.temas || []) {
      const temaNome = t.tema;

      for (const f of t.focos || []) {
        const focoNome = f.foco;
        const subList = Array.isArray(f.subfocos) ? f.subfocos : [];

        nodes.push({
          focusKey: buildFocusKey(espNome, temaNome, focoNome),
          especialidade: espNome,
          tema: temaNome,
          foco: focoNome,
          specialtyColor: color,
          subfocoCount: subList.length
        });
      }
    }
  }

  cachedTaxonomyFoci = nodes;
  return nodes;
}

export function getFireInfoByLevel(level: ExamIncidenceLevel): ExamIncidenceInfo {
  switch (level) {
    case 'extreme':
      return {
        level: 'extreme',
        fireCount: 4,
        label: 'Altíssima',
        colorHex: '#ef4444',
        badgeClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
      };
    case 'high':
      return {
        level: 'high',
        fireCount: 3,
        label: 'Alta',
        colorHex: '#f97316',
        badgeClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
      };
    case 'medium':
      return {
        level: 'medium',
        fireCount: 2,
        label: 'Média',
        colorHex: '#eab308',
        badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      };
    case 'low':
    default:
      return {
        level: 'low',
        fireCount: 1,
        label: 'Baixa',
        colorHex: '#22c55e',
        badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      };
  }
}

/**
 * Palavras-chave de altíssima incidência nas provas médicas
 */
const HIGH_YIELD_THEMES = [
  'cardiologia',
  'trauma',
  'abdome agudo',
  'neonatologia',
  'puericultura',
  'obstetricia',
  'gestacao',
  'hipertensao',
  'diabetes',
  'sus',
  'epidemiologia',
  'doencas infecciosas',
  'respiratorias',
  'cirurgia'
];

/**
 * Calcula a incidência de todos os Focos para uma instituição de prova específica.
 * Utiliza o hash determinístico de instituição + relevância curricular dos temas.
 */
export function getInstitutionFociIncidence(
  institutionName: string
): Record<string, ExamIncidenceInfo> {
  const foci = getAllTaxonomyFoci();
  const cleanInst = (institutionName || 'ENARE').trim().toLowerCase();

  // Seed numérico estável da instituição
  let seed = 0;
  for (let i = 0; i < cleanInst.length; i++) {
    seed = (seed * 31 + cleanInst.charCodeAt(i)) & 0xffffffff;
  }

  // Pontua cada foco
  const scoredFoci = foci.map((node, index) => {
    let baseScore = 20 + ((Math.abs(seed + index * 997)) % 60);

    const fLower = node.foco.toLowerCase();
    const tLower = node.tema.toLowerCase();

    // Bonificação por temas cardeais das provas
    for (const kw of HIGH_YIELD_THEMES) {
      if (tLower.includes(kw) || fLower.includes(kw)) {
        baseScore += 25;
        break;
      }
    }

    // Ponderação específica por instituição
    if (cleanInst.includes('enare') || cleanInst.includes('enamed')) {
      if (node.especialidade.includes('Preventiva') || tLower.includes('sus') || tLower.includes('epidemi')) {
        baseScore += 30;
      }
    } else if (cleanInst.includes('usp')) {
      if (tLower.includes('cardio') || tLower.includes('arritmia') || tLower.includes('trauma') || tLower.includes('onco')) {
        baseScore += 30;
      }
    } else if (cleanInst.includes('unicamp')) {
      if (tLower.includes('vacina') || tLower.includes('imuniz') || tLower.includes('neonat') || tLower.includes('parto')) {
        baseScore += 30;
      }
    } else if (cleanInst.includes('sus-sp')) {
      if (tLower.includes('urgencia') || tLower.includes('emergencia') || tLower.includes('abdome')) {
        baseScore += 25;
      }
    }

    return { focusKey: node.focusKey, score: baseScore };
  });

  // Ordena por pontuação decrescente para particionamento em percentis exatos
  scoredFoci.sort((a, b) => b.score - a.score);

  const total = scoredFoci.length;
  const result: Record<string, ExamIncidenceInfo> = {};

  scoredFoci.forEach((item, rank) => {
    const percentile = (rank / total) * 100;
    let level: ExamIncidenceLevel = 'low';

    if (percentile <= 15) {
      // Top 15%: 4 fogos vermelhos
      level = 'extreme';
    } else if (percentile <= 35) {
      // 15% a 35%: 3 fogos laranjas
      level = 'high';
    } else if (percentile <= 70) {
      // 35% a 70%: 2 fogos amarelos
      level = 'medium';
    } else {
      // > 70%: 1 fogo verde
      level = 'low';
    }

    result[item.focusKey] = getFireInfoByLevel(level);
  });

  return result;
}

/**
 * Retorna todos os focos já enriquecidos com a incidência da instituição
 */
export function getEnrichedFociForInstitution(
  institutionName: string
): EnrichedFocusWithIncidence[] {
  const foci = getAllTaxonomyFoci();
  const incidenceMap = getInstitutionFociIncidence(institutionName);

  return foci.map((f) => ({
    ...f,
    incidence: incidenceMap[f.focusKey] || getFireInfoByLevel('low'),
    score: (incidenceMap[f.focusKey]?.fireCount || 1) * 25
  }));
}
