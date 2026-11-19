import type { ExtendedFilterState } from './questionService';
import type { StudyQuestionFacets } from './studyQuestionCatalog';
import { requestStudyQuestions } from './studyQuestionClient';

export type FacetedHierarchyCountsResult = StudyQuestionFacets;

export function shuffleArray<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}

export function hasRightCardActiveFilters(filters: ExtendedFilterState): boolean {
  return Boolean(filters.instituicoes?.length || filters.anos?.length || filters.tipoProva?.length
    || (filters.dificuldade && filters.dificuldade !== 'Todas')
    || (filters.tipoQuestao && filters.tipoQuestao !== 'Todas')
    || (filters.status && filters.status !== 'Todas')
    || filters.search?.trim() || filters.ocultarAnuladasErro || filters.ocultarRevisadas
    || filters.ultimos5Anos || filters.apenasComImagem || filters.bancaOrganizadora?.length
    || filters.macrorregioes?.length || filters.programaRplus?.length);
}

export async function fetchFacetedHierarchyCounts(
  filters: ExtendedFilterState,
  signal?: AbortSignal
): Promise<FacetedHierarchyCountsResult> {
  const response = await requestStudyQuestions<{ facets: StudyQuestionFacets }>({ action: 'facets', filters }, signal);
  return response.facets;
}

function requestIds(filters: ExtendedFilterState, limit: number, quota?: string, excludeIds?: string[]) {
  return requestStudyQuestions<{ ids: string[] }>({
    action: 'ids', filters, pageSize: limit, quota, excludeIds
  });
}

export async function generateStratifiedQuiz(
  quotas: Record<string, number>,
  filters: ExtendedFilterState,
  targetLimit: number = 50
): Promise<string[]> {
  const limit = Math.min(200, Math.max(1, targetLimit));
  const entries = Object.entries(quotas).filter(([, count]) => Number.isInteger(count) && count > 0);
  if (!entries.length) return (await requestIds(filters, limit)).ids;

  const selected = new Set<string>();
  const groups: string[][] = [];
  for (const [quota, count] of entries) {
    const remaining = limit - selected.size;
    if (remaining === 0) break;
    const { ids } = await requestIds(filters, Math.min(count, remaining), quota, [...selected]);
    ids.forEach((id) => selected.add(id));
    groups.push(ids);
  }

  const ordered = Array.from({ length: Math.max(0, ...groups.map((group) => group.length)) },
    (_, index) => groups.flatMap((group) => group[index] ? [group[index]] : [])).flat();
  if (ordered.length < limit) {
    ordered.push(...(await requestIds(filters, limit - ordered.length, undefined, [...selected])).ids);
  }
  return filters.aleatorizar ? shuffleArray(ordered) : ordered;
}
