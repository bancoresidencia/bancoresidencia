import { UserAnswerItem } from '@/types';

export interface FocusAccuracyMetric {
  answered: number;
  correct: number;
  accuracyRate: number; // 0..100 (%)
  statusLabel: 'sem_dados' | 'excelente' | 'atencao' | 'critico';
  badgeColorClass: string;
}

const EMPTY_METRIC: FocusAccuracyMetric = {
  answered: 0,
  correct: 0,
  accuracyRate: 0,
  statusLabel: 'sem_dados',
  badgeColorClass: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
};

function normalizeTerm(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Calcula em tempo real o volume de questões e taxa de acerto do aluno
 * agregadas por Foco a partir de userAnswers do StudentDataContext.
 */
export function calculateFociPerformanceMap(
  userAnswers: Record<string, UserAnswerItem>
): Record<string, FocusAccuracyMetric> {
  const tally: Record<string, { answered: number; correct: number }> = {};

  for (const ans of Object.values(userAnswers)) {
    if (!ans.foco) continue;
    const key = normalizeTerm(ans.foco);

    if (!tally[key]) {
      tally[key] = { answered: 0, correct: 0 };
    }

    tally[key].answered += 1;
    if (ans.isCorrect) {
      tally[key].correct += 1;
    }
  }

  const result: Record<string, FocusAccuracyMetric> = {};

  for (const [key, data] of Object.entries(tally)) {
    const rate = data.answered > 0 ? Math.round((data.correct / data.answered) * 100) : 0;

    let statusLabel: FocusAccuracyMetric['statusLabel'] = 'sem_dados';
    let badgeColorClass = '';

    if (data.answered === 0) {
      statusLabel = 'sem_dados';
      badgeColorClass = 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700';
    } else if (rate >= 80) {
      statusLabel = 'excelente';
      badgeColorClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    } else if (rate >= 60) {
      statusLabel = 'atencao';
      badgeColorClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    } else {
      statusLabel = 'critico';
      badgeColorClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    }

    result[key] = {
      answered: data.answered,
      correct: data.correct,
      accuracyRate: rate,
      statusLabel,
      badgeColorClass
    };
  }

  return result;
}

/**
 * Retorna a métrica de acurácia de um Foco específico
 */
export function getMetricForFocus(
  focoName: string,
  performanceMap: Record<string, FocusAccuracyMetric>
): FocusAccuracyMetric {
  const key = normalizeTerm(focoName);
  return performanceMap[key] || EMPTY_METRIC;
}
