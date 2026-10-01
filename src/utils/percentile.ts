import { StudentProfile, PercentileResult, PerformanceFilterState } from '@/types';
import { mockStudentsCohort } from '@/data/mockStudents';

/**
 * Fórmula solicitada pelo usuário:
 * Score ajustado = (acertos + média_global × 20) / (questões + 20)
 *
 * Mínimo para elegibilidade de comparação: 20 questões.
 * Mínimo para percentil aproximado: 100 questões.
 * Mínimo para percentil oficial / ranking da plataforma: 500 questões.
 */

export const SMOOTHING_FACTOR = 20;
export const MIN_ELIGIBLE_QUESTIONS = 20;
export const APPROXIMATE_THRESHOLD = 100;
export const OFFICIAL_THRESHOLD = 500;

export function calculateAdjustedScore(correct: number, questions: number, globalMean: number): number {
  if (questions <= 0) return 0;
  return (correct + globalMean * SMOOTHING_FACTOR) / (questions + SMOOTHING_FACTOR);
}

export function filterCohort(cohort: StudentProfile[], filters: PerformanceFilterState): StudentProfile[] {
  return cohort.filter((student) => {
    // Filtro por modalidade (ex: Residência)
    if (student.modalidade !== filters.modalidade) return false;

    // Filtro por semestre / período
    if (filters.period === '2026.1' && student.semester !== '2026.1') return false;
    if (filters.period === '2026.2' && student.semester !== '2026.2') return false;
    // Se for '6m' ou 'all', consideramos os alunos ativos no semestre corrente ou geral

    // Filtro por instituição (caixa de seleção múltipla)
    if (filters.institutions.length > 0 && !filters.institutions.includes(student.institution)) {
      return false;
    }

    // Filtro por banca
    if (filters.banca !== 'Todas' && student.banca !== filters.banca) {
      return false;
    }

    return true;
  });
}

export function computeGlobalMean(cohort: StudentProfile[]): number {
  const eligible = cohort.filter((s) => s.answered >= MIN_ELIGIBLE_QUESTIONS);
  if (eligible.length === 0) return 0.65; // Média padrão estimada caso a amostra filtrada seja muito pequena

  const totalCorrect = eligible.reduce((acc, s) => acc + s.correct, 0);
  const totalQuestions = eligible.reduce((acc, s) => acc + s.answered, 0);

  if (totalQuestions === 0) return 0.65;
  return totalCorrect / totalQuestions;
}

export interface UserStatsCalculationInput {
  totalAnswered: number;
  totalCorrect: number;
  filters: PerformanceFilterState;
}

export function calculatePercentile(input: UserStatsCalculationInput): PercentileResult {
  const { totalAnswered, totalCorrect, filters } = input;

  // Filtra coorte pelos critérios selecionados
  let cohort = filterCohort(mockStudentsCohort, filters);
  
  // Se os filtros forem muito restritivos e restar menos de 3 alunos, expande para a modalidade para garantir base comparativa
  if (cohort.length < 3) {
    cohort = mockStudentsCohort.filter((s) => s.modalidade === filters.modalidade);
  }

  const globalMean = computeGlobalMean(cohort);
  const userAdjustedScore = calculateAdjustedScore(totalCorrect, totalAnswered, globalMean);

  // Alunos elegíveis para cálculo comparativo (pelo menos 20 questões)
  const eligibleCohort = cohort.filter((s) => s.answered >= MIN_ELIGIBLE_QUESTIONS);
  const cohortScores = eligibleCohort.map((s) => calculateAdjustedScore(s.correct, s.answered, globalMean));

  // Determinar status do percentil
  let status: 'locked' | 'approximate' | 'official' = 'locked';
  const missingForApprox = Math.max(0, APPROXIMATE_THRESHOLD - totalAnswered);
  const missingForOfficial = Math.max(0, OFFICIAL_THRESHOLD - totalAnswered);

  if (totalAnswered >= OFFICIAL_THRESHOLD) {
    status = 'official';
  } else if (totalAnswered >= APPROXIMATE_THRESHOLD) {
    status = 'approximate';
  } else {
    status = 'locked';
  }

  // Se tem menos de 100 questões, percentil é null
  if (status === 'locked') {
    return {
      percentile: null,
      status: 'locked',
      missingForApprox,
      missingForOfficial,
      adjustedScore: userAdjustedScore,
      eligibleTotalStudents: eligibleCohort.length
    };
  }

  // Contagem de quantos estudantes possuem score estritamente menor que o usuário
  const strictlyBelow = cohortScores.filter((score) => score < userAdjustedScore).length;
  const equalTo = cohortScores.filter((score) => Math.abs(score - userAdjustedScore) < 0.0001).length;

  // Fórmula padrão de percentil: (estudantes abaixo + 0.5 * empatados) / total * 100
  const totalStudents = cohortScores.length || 1;
  const rawPercentile = Math.round(((strictlyBelow + 0.5 * equalTo) / totalStudents) * 100);
  const percentile = Math.min(99, Math.max(1, rawPercentile));

  // Posição no ranking
  const rankPosition = cohortScores.filter((score) => score > userAdjustedScore).length + 1;

  return {
    percentile,
    status,
    missingForApprox,
    missingForOfficial,
    adjustedScore: userAdjustedScore,
    eligibleTotalStudents: eligibleCohort.length,
    rankPosition
  };
}

export interface RankedStudent {
  rank: number;
  name: string;
  institution: string;
  banca: string;
  answered: number;
  correct: number;
  rawAccuracy: number;
  adjustedScore: number;
  percentile: number;
}

export function getOfficialRanking(filters: PerformanceFilterState, currentUserScore?: { answered: number; correct: number; name: string }): RankedStudent[] {
  let cohort = filterCohort(mockStudentsCohort, filters);
  if (cohort.length < 3) {
    cohort = mockStudentsCohort.filter((s) => s.modalidade === filters.modalidade);
  }

  const globalMean = computeGlobalMean(cohort);

  // Apenas estudantes com pelo menos 500 questões participam do ranking oficial da plataforma
  const officialEligible = cohort.filter((s) => s.answered >= OFFICIAL_THRESHOLD);

  const list: { name: string; institution: string; banca: string; answered: number; correct: number; adjustedScore: number }[] = officialEligible.map((s) => ({
    name: s.name,
    institution: s.institution,
    banca: s.banca,
    answered: s.answered,
    correct: s.correct,
    adjustedScore: calculateAdjustedScore(s.correct, s.answered, globalMean)
  }));

  // Se o próprio usuário tiver 500+ questões, adiciona ele no ranking oficial
  if (currentUserScore && currentUserScore.answered >= OFFICIAL_THRESHOLD) {
    list.push({
      name: `${currentUserScore.name} (Você)`,
      institution: filters.institutions[0] || 'Geral',
      banca: filters.banca !== 'Todas' ? filters.banca : 'Múltiplas',
      answered: currentUserScore.answered,
      correct: currentUserScore.correct,
      adjustedScore: calculateAdjustedScore(currentUserScore.correct, currentUserScore.answered, globalMean)
    });
  }

  // Ordena por score ajustado decrescente
  list.sort((a, b) => b.adjustedScore - a.adjustedScore);

  const total = list.length;
  return list.map((item, index) => {
    const rawAccuracy = (item.correct / item.answered) * 100;
    const belowCount = total - (index + 1);
    const percentile = Math.min(99, Math.max(1, Math.round(((belowCount + 0.5) / total) * 100)));

    return {
      rank: index + 1,
      name: item.name,
      institution: item.institution,
      banca: item.banca,
      answered: item.answered,
      correct: item.correct,
      rawAccuracy,
      adjustedScore: item.adjustedScore,
      percentile
    };
  });
}
