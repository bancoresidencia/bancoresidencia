import { getQuestionCount } from '@/data/hierarchyCounts';
import { getHomologatedBaseline } from '@/data/homologatedFacetsBaseline';
import type { ExtendedFilterState } from './questionService';

/**
 * Server-only heuristic fallback count when a database count query times out
 * in legacy admin/curadoria handlers. Kept separate from client services so
 * multi-megabyte static baselines are never shipped to browser bundles.
 */
export function calculateHierarchyFallback(filters: ExtendedFilterState): number {
  const isRevalida = Boolean(filters.modalidades?.some((m) => m.toLowerCase().includes('revalida')));
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
  } else if (filters.dificuldade && filters.dificuldade !== 'Todas' && baseline.total > 0) {
    const diffTotal = baseline.dificuldades?.[filters.dificuldade as 'Fácil' | 'Médio' | 'Difícil'] || 0;
    const ratio = diffTotal / baseline.total;
    baseCount = Math.max(1, Math.round(baseCount * ratio));
  }

  if (filters.status === 'Não vistas' && filters.userSolvedIds && filters.userSolvedIds.length > 0) {
    baseCount = Math.max(0, baseCount - filters.userSolvedIds.length);
  }

  return baseCount > 0 ? baseCount : baseline.total;
}

