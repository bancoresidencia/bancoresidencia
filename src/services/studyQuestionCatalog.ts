import { CANONICAL_BANCAS_DIRECTORY } from '@/data/canonicalBancasDirectory';
import { clinicalHierarchy } from '@/data/mockQuestions';
import { resolveBancaList, getClinicalSearchTerms, type ExtendedFilterState } from '@/services/questionService';
import { sanitizePostgrestTerm, validateQuestionId } from '@/utils/security';
import { legacyClinicalSelections, normalizeStudyFormats, normalizeStudySpecialty, recentExamYears } from '@/utils/studyQuestionFilters';

export interface StudyCatalogCounts {
  total: number;
  bancas: Record<string, number>;
  years: number[];
}

export interface StudyQuestionFacets {
  totalRightCardCount: number;
  paths: Record<string, number>;
}

const modalities = new Map([
  ['Acesso Direto', 'Acesso Direto'], ['Residência Médica', 'Acesso Direto'],
  ['Ciclo Básico', 'Acesso Direto'], ['Revalida', 'Revalida']
]);

const programAliases: Record<string, string> = {
  TEGO: 'TEGO (Ginecologia e Obstetrícia)',
  TECM: 'TECM (Clínica Médica)',
  SBOT: 'SBOT (Ortopedia)'
};

function textList(input: unknown): string[] {
  return Array.isArray(input)
    ? [...new Set(input.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .slice(0, 2000).map((item) => item.trim().slice(0, 500)))]
    : [];
}

const hierarchyPaths: string[][] = [];
for (const specialty of clinicalHierarchy) {
  const root = [specialty.especialidade];
  hierarchyPaths.push(root);
  for (const topic of specialty.temas) {
    const topicPath = [...root, topic.tema];
    hierarchyPaths.push(topicPath);
    for (const focus of topic.focos) {
      const focusPath = [...topicPath, focus.foco];
      hierarchyPaths.push(focusPath);
      for (const item of focus.subfocos) {
        const subfocusPath = [...focusPath, typeof item === 'string' ? item : item.subfoco];
        hierarchyPaths.push(subfocusPath);
        if (typeof item !== 'string') {
          for (const detail of item.sub_subfocos ?? []) hierarchyPaths.push([...subfocusPath, detail]);
        }
      }
    }
  }
}

function normalizeClinicalPaths(paths: (string | null)[][]): (string | null)[][] {
  return paths.flatMap((path) => {
    const specialty = path[0];
    if (specialty === 'Ginecologia e Obstetrícia') {
      return ['Ginecologia e Obstetrícia', 'Ginecologia', 'Obstetrícia'].map((name) => [name, ...path.slice(1)]);
    }
    return [[specialty === null ? null : normalizeStudySpecialty(specialty), ...path.slice(1)]];
  });
}

function resolveClinicalPaths(filters: ExtendedFilterState): (string | null)[][] {
  const explicit = Array.isArray(filters.clinicalPaths) ? filters.clinicalPaths
    .slice(0, 2000)
    .filter((path) => Array.isArray(path) && path.length >= 1 && path.length <= 5
      && path.every((part) => typeof part === 'string' && part.length > 0 && part.length <= 500)) : [];
  const selections = legacyClinicalSelections(filters);
  const inherited = selections
    .filter((path) => !explicit.some((entry) => entry.length === path.length && entry.at(-1) === path.at(-1)))
    .flatMap((selection) => {
      const paths = hierarchyPaths.filter((path) => path.length === selection.length && path.at(-1) === selection.at(-1));
      return paths.length > 0 ? paths : [selection];
    });
  const paths = [...explicit, ...inherited];
  return normalizeClinicalPaths(paths.filter((path) => !paths.some((child) =>
    path.length < child.length && path.every((part, index) => part === null || part === child[index]))));
}

export function normalizeStudyQuery(
  filters: ExtendedFilterState,
  ids?: unknown,
  options: { excludeIds?: unknown; quota?: unknown; randomize?: boolean } = {}
) {
  const selectedModalities = textList(filters.modalidades);
  const resolvedModalities = selectedModalities.map((value) => modalities.get(value)
    ?? (value.startsWith('R+') ? 'R+' : value.startsWith('Título') ? 'Título de Especialista' : value));
  const institutions = textList(filters.instituicoes);
  const organizers = textList(filters.bancaOrganizadora);
  const regions = textList(filters.macrorregioes);
  const years = Array.isArray(filters.anos)
    ? [...new Set(filters.anos.filter((year) => Number.isInteger(year) && year >= 1900 && year <= 2200))]
    : [];
  const search = typeof filters.search === 'string' ? sanitizePostgrestTerm(filters.search.slice(0, 200)) : '';
  const quota = typeof options.quota === 'string' ? options.quota.slice(0, 500) : '';
  const clinical = resolveClinicalPaths(filters);
  const exactQuotaPaths = quota ? clinical.filter((path) => path.at(-1) === quota) : [];
  const remainingQuotaPaths = quota && !institutions.includes(quota)
    ? hierarchyPaths.filter((path) => path.at(-1) === quota) : [];
  const hasQuotaPaths = exactQuotaPaths.length > 0 || remainingQuotaPaths.length > 0;
  const quotaPaths = exactQuotaPaths.length > 0 ? exactQuotaPaths : normalizeClinicalPaths(remainingQuotaPaths);
  const programs = textList(filters.programaRplus).flatMap((name) =>
    programAliases[name] ? [name, programAliases[name]] : [name]);
  const examTypes = textList(filters.tipoProva);

  return {
    modalities: resolvedModalities.length ? [...new Set(resolvedModalities)] : null,
    ids: Array.isArray(ids) ? textList(ids).filter(validateQuestionId).slice(0, 200) : null,
    excluded_ids: textList(options.excludeIds).filter(validateQuestionId).slice(0, 200),
    bancas: institutions.length ? resolveBancaList(institutions) : null,
    quota_bancas: quota && !hasQuotaPaths ? resolveBancaList([quota]) : null,
    organizers: organizers.length ? organizers : null,
    organizer_bancas: organizers.length ? resolveBancaList(CANONICAL_BANCAS_DIRECTORY
      .filter((item) => item.bancaOrganizadora && organizers.includes(item.bancaOrganizadora)).map((item) => item.sigla)) : [],
    regions: regions.length ? regions : null,
    region_bancas: regions.length ? resolveBancaList(CANONICAL_BANCAS_DIRECTORY
      .filter((item) => item.macrorregiao && regions.includes(item.macrorregiao)).map((item) => item.sigla)) : [],
    programs: programs.length ? programs : null,
    years: years.length ? years : null,
    exam_types: examTypes.length ? examTypes : null,
    difficulty: typeof filters.dificuldade === 'string' && filters.dificuldade !== 'Todas' ? filters.dificuldade : null,
    formats: normalizeStudyFormats(typeof filters.tipoQuestao === 'string' ? filters.tipoQuestao : undefined),
    status: typeof filters.status === 'string' ? filters.status : null,
    hide_annulled: filters.ocultarAnuladasErro === true,
    hide_reviewed: filters.ocultarRevisadas === true,
    with_image: filters.apenasComImagem === true,
    search_terms: search.length > 1 ? getClinicalSearchTerms(search) : null,
    clinical: clinical.length ? clinical : null,
    quota_clinical: hasQuotaPaths ? quotaPaths : null,
    randomize: options.randomize === true,
    recent_from: filters.ultimos5Anos === true ? recentExamYears(5)[4] : null
  };
}
