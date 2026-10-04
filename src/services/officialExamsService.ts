import rawCatalogData from '@/data/officialExamsData.json';
import {
  OfficialExamModalityKey,
  OfficialExamModalityOption,
  OfficialInstitution,
  OfficialExamItem,
  OfficialExamsDataPayload
} from '@/types/officialExams';

const catalog = rawCatalogData as unknown as OfficialExamsDataPayload;

// Mapeamento das descrições e títulos amigáveis das modalidades
const MODALITY_CONFIG: Record<
  OfficialExamModalityKey,
  { title: string; description: string }
> = {
  acesso_direto: {
    title: 'Acesso direto',
    description: 'Residência médica e provas gerais'
  },
  r_plus: {
    title: 'R+',
    description: 'Residência com pré-requisito, por área'
  },
  titulo: {
    title: 'Título de especialista',
    description: 'Provas de título e certificação'
  },
  revalida: {
    title: 'Revalida',
    description: 'Revalidação de diploma médico'
  },
  outras: {
    title: 'Outras',
    description: 'Conteúdos sem modalidade definida'
  },
  todas: {
    title: 'Todas as provas',
    description: 'Explore o catálogo completo'
  }
};

/**
 * Retorna as estatísticas gerais do catálogo
 */
export function getCatalogStats() {
  return catalog.stats;
}

/**
 * Retorna a lista de modalidades com suas contagens calculadas em tempo real
 */
export function getExamModalities(): OfficialExamModalityOption[] {
  const modalityKeys: OfficialExamModalityKey[] = [
    'acesso_direto',
    'r_plus',
    'titulo',
    'revalida',
    'outras',
    'todas'
  ];

  return modalityKeys.map((key) => {
    let examsCount = 0;
    let institutionsCount = 0;

    if (key === 'todas') {
      examsCount = catalog.exams.length;
      institutionsCount = catalog.institutions.length;
    } else {
      const filteredExams = catalog.exams.filter((e) => e.modality === key);
      examsCount = filteredExams.length;
      const instIds = new Set(filteredExams.map((e) => e.locationId));
      institutionsCount = instIds.size;
    }

    return {
      id: key,
      title: MODALITY_CONFIG[key].title,
      description: MODALITY_CONFIG[key].description,
      institutionsCount,
      examsCount
    };
  });
}

/**
 * Retorna os estados (UF) disponíveis para uma determinada modalidade
 */
export function getAvailableStates(modality?: OfficialExamModalityKey): string[] {
  const relevantInstitutions = catalog.institutions.filter((inst) => {
    if (!modality || modality === 'todas') return true;
    return inst.modalities.includes(modality);
  });

  const states = Array.from(
    new Set(relevantInstitutions.map((i) => i.state).filter((s): s is string => Boolean(s)))
  ).sort();

  return states;
}

/**
 * Busca instituições aplicando filtros por modalidade, texto de pesquisa e estado UF
 */
export function getInstitutions(params?: {
  modality?: OfficialExamModalityKey;
  search?: string;
  state?: string;
}): OfficialInstitution[] {
  const { modality, search, state } = params || {};

  const filtered = catalog.institutions.filter((inst) => {
    // Filtro de modalidade
    if (modality && modality !== 'todas') {
      if (!inst.modalities.includes(modality)) return false;
    }

    // Filtro por Estado
    if (state && state !== 'Todos') {
      if (inst.state !== state) return false;
    }

    // Filtro por Busca textual
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const matchName = inst.name.toLowerCase().includes(q);
      const matchShort = inst.shortName.toLowerCase().includes(q);
      const matchAlias = inst.aliases.some((a) => a.toLowerCase().includes(q));
      if (!matchName && !matchShort && !matchAlias) return false;
    }

    return true;
  });

  // Enriquecer com métricas contextuais da modalidade e ordenar por mais provas primeiro
  return filtered
    .map((inst) => {
      let modExams = catalog.exams.filter((e) => e.locationId === inst.id);
      if (modality && modality !== 'todas') {
        modExams = modExams.filter((e) => e.modality === modality);
      }
      const distinctYears = new Set(modExams.map((e) => e.year));
      return {
        ...inst,
        modalityExamCount: modExams.length,
        modalityYearsCount: distinctYears.size
      };
    })
    .sort((a, b) => (b.modalityExamCount || 0) - (a.modalityExamCount || 0));
}

/**
 * Retorna uma instituição por seu ID
 */
export function getInstitutionById(id: string): OfficialInstitution | undefined {
  return catalog.institutions.find((i) => i.id === id);
}

/**
 * Retorna os anos disponíveis para uma instituição selecionada e seus dados agregados
 */
export function getYearsForInstitution(
  locationId: string,
  modality?: OfficialExamModalityKey
): { year: number; examsCount: number; questionsCount: number }[] {
  const relevantExams = catalog.exams.filter((e) => {
    if (e.locationId !== locationId) return false;
    if (modality && modality !== 'todas' && e.modality !== modality) return false;
    return true;
  });

  const yearsMap = new Map<number, { examsCount: number; questionsCount: number }>();

  relevantExams.forEach((e) => {
    if (!yearsMap.has(e.year)) {
      yearsMap.set(e.year, { examsCount: 0, questionsCount: 0 });
    }
    const cur = yearsMap.get(e.year)!;
    cur.examsCount++;
    cur.questionsCount += e.questionCount;
  });

  return Array.from(yearsMap.entries())
    .map(([year, stats]) => ({
      year,
      examsCount: stats.examsCount,
      questionsCount: stats.questionsCount
    }))
    .sort((a, b) => b.year - a.year);
}

/**
 * Retorna os cadernos e provas disponíveis para uma instituição e ano
 */
export function getBookletsForInstitutionAndYear(
  locationId: string,
  year: number,
  modality?: OfficialExamModalityKey
): OfficialExamItem[] {
  return catalog.exams
    .filter((e) => {
      if (e.locationId !== locationId) return false;
      if (e.year !== year) return false;
      if (modality && modality !== 'todas' && e.modality !== modality) return false;
      return true;
    })
    .sort((a, b) => {
      const bA = a.booklet || '';
      const bB = b.booklet || '';
      return bA.localeCompare(bB);
    });
}

/**
 * Retorna um exame específico por seu ID
 */
export function getExamById(examId: string): OfficialExamItem | undefined {
  return catalog.exams.find((e) => e.id === examId);
}

/**
 * Retorna as instituições mais populares/procuradas como atalhos de acesso rápido
 */
export function getFeaturedInstitutions(): OfficialInstitution[] {
  const featuredSlugs = ['enare', 'hc-unicamp', 'hcfmusp', 'psu-mg', 'sus-sp', 'amrigs', 'hupe'];
  const featured = catalog.institutions.filter(
    (i) => (i.logoSlug && featuredSlugs.includes(i.logoSlug)) || i.shortName.includes('Revalida')
  );
  return featured.slice(0, 8);
}

/**
 * Busca direta e instantânea em todo o acervo de 2.261 cadernos por palavras-chave
 */
export function searchDirectExams(
  query: string,
  modality?: OfficialExamModalityKey,
  limit: number = 24
): { exam: OfficialExamItem; institution: OfficialInstitution }[] {
  if (!query || !query.trim()) return [];

  const terms = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  const results: { exam: OfficialExamItem; institution: OfficialInstitution }[] = [];

  for (const exam of catalog.exams) {
    if (modality && modality !== 'todas' && exam.modality !== modality) {
      continue;
    }

    const inst = catalog.institutions.find((i) => i.id === exam.locationId);
    if (!inst) continue;

    const bookletStr = exam.booklet ? `caderno ${exam.booklet}` : '';
    const searchableText = `${inst.shortName} ${inst.name} ${inst.aliases.join(' ')} ${exam.year} ${bookletStr} ${exam.assessmentType || ''} ${inst.state || ''}`.toLowerCase();

    const matchesAll = terms.every((term) => searchableText.includes(term));
    if (matchesAll) {
      results.push({ exam, institution: inst });
      if (results.length >= limit) break;
    }
  }

  return results;
}
