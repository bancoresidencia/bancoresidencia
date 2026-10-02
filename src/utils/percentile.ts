import { StudentProfile, PercentileResult, PerformanceFilterState, UserAttempt } from '@/types';
import { mockStudentsCohort } from '@/data/mockStudents';
import {
  calculateIRTAbility,
  calculateStandardError,
  calculateReliability,
  calculateAdjustedScore as calculateIRTAdjustedScore,
  getRankingStatus,
  getEligibleQuestions,
  calculateEmpiricalPercentile,
  computeStudentIRTEvaluation,
  auditQuestionsQuality,
  calibrateItemEmpirically,
  ValidatedAttempt,
  UNRANKED_THRESHOLD,
  OFFICIAL_THRESHOLD
} from './irtModel';

export {
  calculateIRTAbility,
  calculateStandardError,
  calculateReliability,
  getRankingStatus,
  getEligibleQuestions,
  calculateEmpiricalPercentile,
  computeStudentIRTEvaluation,
  auditQuestionsQuality,
  calibrateItemEmpirically,
  UNRANKED_THRESHOLD,
  OFFICIAL_THRESHOLD
};

export interface PercentileTier {
  min: number;
  max: number;
  color: string;
  name: string;
  rangeLabel: string;
  bgRgba: string;
  borderRgba: string;
  textContrast: string;
  textLight: string;
  textDark: string;
  glowRgba: string;
}

/**
 * Cores e Tiers de Percentil:
 * - 0 a 30: #603027 (Bronze Escuro)
 * - 30 a 50: #CE8946 (Cobre / Bronze)
 * - 50 a 70: #94A3B8 (Prata) - Alto contraste no modo claro garantido com #334155!
 * - 70 a 85: #EAB308 (Ouro)
 * - 85 a 90: #10B981 (Esmeralda)
 * - 90 a 98: #06B6D4 (Diamante)
 * - 98 a 99: #EF4444 (Elite)
 */
export const PERCENTILE_TIERS: PercentileTier[] = [
  {
    min: 0,
    max: 30,
    color: '#603027',
    name: 'Bronze Escuro',
    rangeLabel: '0 - 30',
    bgRgba: 'rgba(96, 48, 39, 0.16)',
    borderRgba: 'rgba(96, 48, 39, 0.55)',
    textContrast: '#EAA698',
    textLight: '#603027',
    textDark: '#FCA5A5',
    glowRgba: 'rgba(96, 48, 39, 0.35)'
  },
  {
    min: 30,
    max: 50,
    color: '#CE8946',
    name: 'Cobre / Bronze',
    rangeLabel: '30 - 50',
    bgRgba: 'rgba(206, 137, 70, 0.16)',
    borderRgba: 'rgba(206, 137, 70, 0.55)',
    textContrast: '#9A3412',
    textLight: '#9A3412',
    textDark: '#FDBA74',
    glowRgba: 'rgba(206, 137, 70, 0.35)'
  },
  {
    min: 50,
    max: 70,
    color: '#94A3B8',
    name: 'Prata',
    rangeLabel: '50 - 70',
    bgRgba: 'rgba(148, 163, 184, 0.18)',
    borderRgba: 'rgba(148, 163, 184, 0.60)',
    textContrast: '#475569',
    textLight: '#334155', // Garante legibilidade nítida no modo claro!
    textDark: '#E2E8F0',
    glowRgba: 'rgba(148, 163, 184, 0.30)'
  },
  {
    min: 70,
    max: 85,
    color: '#EAB308',
    name: 'Ouro',
    rangeLabel: '70 - 85',
    bgRgba: 'rgba(234, 179, 8, 0.18)',
    borderRgba: 'rgba(234, 179, 8, 0.60)',
    textContrast: '#854D0E',
    textLight: '#854D0E',
    textDark: '#FEF08A',
    glowRgba: 'rgba(234, 179, 8, 0.35)'
  },
  {
    min: 85,
    max: 90,
    color: '#10B981',
    name: 'Esmeralda',
    rangeLabel: '85 - 90',
    bgRgba: 'rgba(16, 185, 129, 0.16)',
    borderRgba: 'rgba(16, 185, 129, 0.60)',
    textContrast: '#065F46',
    textLight: '#065F46',
    textDark: '#6EE7B7',
    glowRgba: 'rgba(16, 185, 129, 0.35)'
  },
  {
    min: 90,
    max: 98,
    color: '#06B6D4',
    name: 'Diamante',
    rangeLabel: '90 - 97',
    bgRgba: 'rgba(6, 182, 212, 0.16)',
    borderRgba: 'rgba(6, 182, 212, 0.65)',
    textContrast: '#0E7490',
    textLight: '#0E7490',
    textDark: '#67E8F9',
    glowRgba: 'rgba(6, 182, 212, 0.45)'
  },
  {
    min: 98,
    max: 100,
    color: '#EF4444',
    name: 'Elite',
    rangeLabel: '98 - 99',
    bgRgba: 'rgba(239, 68, 68, 0.18)',
    borderRgba: 'rgba(239, 68, 68, 0.75)',
    textContrast: '#991B1B',
    textLight: '#991B1B',
    textDark: '#FCA5A5',
    glowRgba: 'rgba(239, 68, 68, 0.55)'
  }
];

export function getPercentileColor(percentile: number | null | undefined): PercentileTier {
  if (percentile === null || percentile === undefined) {
    return {
      min: 0,
      max: 0,
      color: '#64748b',
      name: 'Calibrando',
      rangeLabel: 'N/A',
      bgRgba: 'rgba(100, 116, 139, 0.15)',
      borderRgba: 'rgba(100, 116, 139, 0.4)',
      textContrast: '#64748b',
      textLight: '#475569',
      textDark: '#94a3b8',
      glowRgba: 'rgba(100, 116, 139, 0.2)'
    };
  }

  const p = Math.max(0, Math.min(99, Math.round(percentile)));
  if (p < 30) return PERCENTILE_TIERS[0];
  if (p < 50) return PERCENTILE_TIERS[1];
  if (p < 70) return PERCENTILE_TIERS[2];
  if (p < 85) return PERCENTILE_TIERS[3];
  if (p < 90) return PERCENTILE_TIERS[4];
  if (p < 98) return PERCENTILE_TIERS[5];
  return PERCENTILE_TIERS[6];
}

/**
 * Função de retrocompatibilidade para o Adjusted Score IRT
 */
export function calculateAdjustedScore(
  correctOrTheta: number,
  questionsOrSe: number,
  globalMeanOrValidCount?: number
): number {
  if (globalMeanOrValidCount === undefined) {
    // 2 parâmetros
    return calculateIRTAdjustedScore(correctOrTheta, 0.2, questionsOrSe);
  }
  // Se chamado com (correct, questions, globalMean) legado:
  if (questionsOrSe <= 0) return 0;
  const p = correctOrTheta / questionsOrSe;
  const theta = (p - 0.5) * 3.5;
  const se = 1.0 / Math.sqrt(questionsOrSe * 0.2 + 1);
  return calculateIRTAdjustedScore(theta, se, questionsOrSe);
}

export function filterCohort(cohort: StudentProfile[], filters: PerformanceFilterState): StudentProfile[] {
  return cohort.filter((student) => {
    if (student.modalidade !== filters.modalidade) return false;
    if (filters.period === '2026.1' && student.semester !== '2026.1') return false;
    if (filters.period === '2026.2' && student.semester !== '2026.2') return false;

    if (filters.institutions.length > 0 && !filters.institutions.includes(student.institution)) {
      return false;
    }

    if (filters.banca !== 'Todas' && student.banca !== filters.banca) {
      return false;
    }

    return true;
  });
}

/**
 * Gera tentativas sintéticas ponderadas para perfis do mockStudentsCohort
 */
function createCohortStudentAttempts(student: StudentProfile): ValidatedAttempt[] {
  const attempts: ValidatedAttempt[] = [];
  const total = student.answered;
  const correct = student.correct;
  const acc = total > 0 ? correct / total : 0.7;

  // Distribuição típica de provas de residência: 30% Fácil, 40% Médio, 30% Difícil
  const facilCount = Math.round(total * 0.3);
  const medioCount = Math.round(total * 0.4);
  const dificilCount = total - facilCount - medioCount;

  // Fácil: acerto ~ acc * 1.15
  // Médio: acerto ~ acc * 1.0
  // Difícil: acerto ~ acc * 0.85
  const facilCorrect = Math.min(facilCount, Math.round(facilCount * Math.min(0.98, acc * 1.15)));
  const dificilCorrect = Math.min(dificilCount, Math.round(dificilCount * Math.max(0.2, acc * 0.82)));
  const medioCorrect = Math.min(medioCount, Math.max(0, correct - facilCorrect - dificilCorrect));

  for (let i = 0; i < facilCount; i++) {
    attempts.push({
      question_id: `q-c-${student.id}-f-${i}`,
      difficulty: 'Fácil',
      correct: i < facilCorrect,
      user_id: student.id,
      timestamp: Date.now() - (total - i) * 60000
    });
  }
  for (let i = 0; i < medioCount; i++) {
    attempts.push({
      question_id: `q-c-${student.id}-m-${i}`,
      difficulty: 'Médio',
      correct: i < medioCorrect,
      user_id: student.id,
      timestamp: Date.now() - (total - facilCount - i) * 60000
    });
  }
  for (let i = 0; i < dificilCount; i++) {
    attempts.push({
      question_id: `q-c-${student.id}-d-${i}`,
      difficulty: 'Difícil',
      correct: i < dificilCorrect,
      user_id: student.id,
      timestamp: Date.now() - (dificilCount - i) * 60000
    });
  }

  return attempts;
}

export interface UserStatsCalculationInput {
  totalAnswered: number;
  totalCorrect: number;
  filters: PerformanceFilterState;
  attempts?: UserAttempt[];
}

/**
 * 9. & 16. CÁLCULO DE PERCENTIL DO ALUNO BASEADO NO MODELO IRT
 */
export function calculatePercentile(input: UserStatsCalculationInput): PercentileResult {
  const { totalAnswered, totalCorrect, filters, attempts } = input;

  let cohort = filterCohort(mockStudentsCohort, filters);
  if (cohort.length < 3) {
    cohort = mockStudentsCohort.filter((s) => s.modalidade === filters.modalidade);
  }

  // População Oficial (>= 500 questões)
  const officialCohort = cohort.filter((s) => s.answered >= OFFICIAL_THRESHOLD);

  // Calcula scores IRT da população oficial
  const officialScores: number[] = officialCohort.map((s) => {
    const sAttempts = createCohortStudentAttempts(s);
    const theta = calculateIRTAbility(sAttempts);
    const se = calculateStandardError(theta, sAttempts);
    return calculateIRTAdjustedScore(theta, se, s.answered);
  });

  // Constrói ou valida as tentativas do usuário
  let validUserAttempts: ValidatedAttempt[] = [];
  if (attempts && attempts.length > 0) {
    validUserAttempts = getEligibleQuestions(attempts);
  } else {
    // Se ainda não houver array de tentativas (ex: no carregamento inicial da página com contadores demo)
    const mockStudent: StudentProfile = {
      id: 'current-user',
      name: 'Você',
      modalidade: filters.modalidade,
      institution: 'Geral',
      banca: 'Múltiplas',
      answered: totalAnswered,
      correct: totalCorrect,
      uniqueAnswered: totalAnswered,
      reviews: 0,
      repeated: 0,
      semester: '2026.1'
    };
    validUserAttempts = createCohortStudentAttempts(mockStudent);
  }

  const irtResult = computeStudentIRTEvaluation(validUserAttempts, officialScores);

  const status = irtResult.statusInfo.status;
  const missingForApprox = Math.max(0, UNRANKED_THRESHOLD - irtResult.validQuestionsCount);
  const missingForOfficial = Math.max(0, OFFICIAL_THRESHOLD - irtResult.validQuestionsCount);

  let rankPosition: number | undefined;
  if (irtResult.statusInfo.isEligibleForRanking && officialScores.length > 0) {
    rankPosition = officialScores.filter((score) => score > irtResult.adjustedScore).length + 1;
  }

  return {
    percentile: irtResult.percentile,
    status,
    missingForApprox,
    missingForOfficial,
    missingForNextTier: irtResult.statusInfo.missingForNextTier,
    adjustedScore: irtResult.adjustedScore,
    eligibleTotalStudents: officialCohort.length,
    rankPosition,
    theta: irtResult.theta,
    standard_error: irtResult.standard_error,
    reliability: irtResult.reliability,
    validQuestionsCount: irtResult.validQuestionsCount,
    easyCount: irtResult.easyCount,
    mediumCount: irtResult.mediumCount,
    hardCount: irtResult.hardCount,
    formattedPercentile: irtResult.formattedPercentile,
    statusLabel: irtResult.statusInfo.label,
    isOfficial: irtResult.isOfficial
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
  formattedPercentile: string;
  theta: number;
  standard_error: number;
  isOfficial: boolean;
}

/**
 * 8. & 9. RANKING OFICIAL BASEADO NO MODELO IRT
 * Apenas candidatos com >= 500 questões válidas
 */
export function getOfficialRanking(
  filters: PerformanceFilterState,
  currentUserScore?: {
    answered: number;
    correct: number;
    name: string;
    attempts?: UserAttempt[];
  }
): RankedStudent[] {
  let cohort = filterCohort(mockStudentsCohort, filters);
  if (cohort.length < 3) {
    cohort = mockStudentsCohort.filter((s) => s.modalidade === filters.modalidade);
  }

  // Filtragem estrita: >= 500 questões válidas
  const officialEligible = cohort.filter((s) => s.answered >= OFFICIAL_THRESHOLD);

  interface ScoredCandidate {
    name: string;
    institution: string;
    banca: string;
    answered: number;
    correct: number;
    theta: number;
    se: number;
    adjustedScore: number;
    isCurrentUser?: boolean;
  }

  const list: ScoredCandidate[] = officialEligible.map((s) => {
    const attempts = createCohortStudentAttempts(s);
    const theta = calculateIRTAbility(attempts);
    const se = calculateStandardError(theta, attempts);
    const adjustedScore = calculateIRTAdjustedScore(theta, se, s.answered);

    return {
      name: s.name,
      institution: s.institution,
      banca: s.banca,
      answered: s.answered,
      correct: s.correct,
      theta,
      se,
      adjustedScore
    };
  });

  // Se o aluno atual possuir >= 500 questões, inclui no ranking oficial
  if (currentUserScore && currentUserScore.answered >= OFFICIAL_THRESHOLD) {
    let theta: number;
    let se: number;

    if (currentUserScore.attempts && currentUserScore.attempts.length > 0) {
      const eligible = getEligibleQuestions(currentUserScore.attempts);
      theta = calculateIRTAbility(eligible);
      se = calculateStandardError(theta, eligible);
    } else {
      const attempts = createCohortStudentAttempts({
        id: 'current-user',
        name: currentUserScore.name,
        modalidade: filters.modalidade,
        institution: filters.institutions[0] || 'Geral',
        banca: filters.banca !== 'Todas' ? filters.banca : 'Múltiplas',
        answered: currentUserScore.answered,
        correct: currentUserScore.correct,
        uniqueAnswered: currentUserScore.answered,
        reviews: 0,
        repeated: 0,
        semester: '2026.1'
      });
      theta = calculateIRTAbility(attempts);
      se = calculateStandardError(theta, attempts);
    }

    const adjustedScore = calculateIRTAdjustedScore(theta, se, currentUserScore.answered);

    list.push({
      name: `${currentUserScore.name} (Você)`,
      institution: filters.institutions[0] || 'Geral',
      banca: filters.banca !== 'Todas' ? filters.banca : 'Múltiplas',
      answered: currentUserScore.answered,
      correct: currentUserScore.correct,
      theta,
      se,
      adjustedScore,
      isCurrentUser: true
    });
  }

  // Ordenação determinística e estável pelo score IRT ajustado
  list.sort((a, b) => b.adjustedScore - a.adjustedScore);

  const scoresArray = list.map((item) => item.adjustedScore);

  return list.map((item, index) => {
    const rawAccuracy = item.answered > 0 ? (item.correct / item.answered) * 100 : 0;
    const percResult = calculateEmpiricalPercentile(item.adjustedScore, scoresArray);

    return {
      rank: index + 1,
      name: item.name,
      institution: item.institution,
      banca: item.banca,
      answered: item.answered,
      correct: item.correct,
      rawAccuracy,
      adjustedScore: item.adjustedScore,
      percentile: percResult.roundedPercentile,
      formattedPercentile: percResult.formattedPercentile,
      theta: item.theta,
      standard_error: item.se,
      isOfficial: true
    };
  });
}

/**
 * 8. RANKING PROVISÓRIO (150 a 499 questões válidas)
 */
export function getProvisionalRanking(
  filters: PerformanceFilterState,
  currentUserScore?: {
    answered: number;
    correct: number;
    name: string;
    attempts?: UserAttempt[];
  }
): RankedStudent[] {
  let cohort = filterCohort(mockStudentsCohort, filters);
  if (cohort.length < 3) {
    cohort = mockStudentsCohort.filter((s) => s.modalidade === filters.modalidade);
  }

  // Candidatos provisórios: 150 <= answered < 500
  const provEligible = cohort.filter((s) => s.answered >= UNRANKED_THRESHOLD && s.answered < OFFICIAL_THRESHOLD);

  const list = provEligible.map((s) => {
    const attempts = createCohortStudentAttempts(s);
    const theta = calculateIRTAbility(attempts);
    const se = calculateStandardError(theta, attempts);
    const adjustedScore = calculateIRTAdjustedScore(theta, se, s.answered);

    return {
      name: s.name,
      institution: s.institution,
      banca: s.banca,
      answered: s.answered,
      correct: s.correct,
      theta,
      se,
      adjustedScore
    };
  });

  if (currentUserScore && currentUserScore.answered >= UNRANKED_THRESHOLD && currentUserScore.answered < OFFICIAL_THRESHOLD) {
    const attempts = createCohortStudentAttempts({
      id: 'current-user',
      name: currentUserScore.name,
      modalidade: filters.modalidade,
      institution: filters.institutions[0] || 'Geral',
      banca: filters.banca !== 'Todas' ? filters.banca : 'Múltiplas',
      answered: currentUserScore.answered,
      correct: currentUserScore.correct,
      uniqueAnswered: currentUserScore.answered,
      reviews: 0,
      repeated: 0,
      semester: '2026.1'
    });
    const theta = calculateIRTAbility(attempts);
    const se = calculateStandardError(theta, attempts);
    const adjustedScore = calculateIRTAdjustedScore(theta, se, currentUserScore.answered);

    list.push({
      name: `${currentUserScore.name} (Você)`,
      institution: filters.institutions[0] || 'Geral',
      banca: filters.banca !== 'Todas' ? filters.banca : 'Múltiplas',
      answered: currentUserScore.answered,
      correct: currentUserScore.correct,
      theta,
      se,
      adjustedScore
    });
  }

  list.sort((a, b) => b.adjustedScore - a.adjustedScore);
  const scoresArray = list.map((item) => item.adjustedScore);

  return list.map((item, index) => {
    const rawAccuracy = item.answered > 0 ? (item.correct / item.answered) * 100 : 0;
    const percResult = calculateEmpiricalPercentile(item.adjustedScore, scoresArray);

    return {
      rank: index + 1,
      name: item.name,
      institution: item.institution,
      banca: item.banca,
      answered: item.answered,
      correct: item.correct,
      rawAccuracy,
      adjustedScore: item.adjustedScore,
      percentile: percResult.roundedPercentile,
      formattedPercentile: `${percResult.formattedPercentile} (Provisório)`,
      theta: item.theta,
      standard_error: item.se,
      isOfficial: false
    };
  });
}
