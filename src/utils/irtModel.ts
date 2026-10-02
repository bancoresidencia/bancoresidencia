/**
 * MODELO ESTATÍSTICO IRT (TRI) 2PL BAYESIANO PARA CÁLCULO DE RENDIMENTO E PERCENTIL
 * 
 * Este módulo implementa:
 * 1. Seleção e validação de questões elegíveis (exclusão de anuladas e sem dificuldade)
 * 2. Deduplicação determinística de tentativas por questão
 * 3. Parâmetros centrais de itens (Fácil: b=-1.0, a=1.0; Médio: b=0.0, a=1.0; Difícil: b=+1.0, a=1.0)
 * 4. Estimativa Bayesiana MAP (Maximum A Posteriori) com prior normal theta ~ N(0, 1)
 * 5. Informação de Fisher dos itens e Erro Padrão SE(theta)
 * 6. Regularização / Shrinkage contínuo e cálculo de Confiabilidade (Reliability)
 * 7. Adjusted Ability Score (incorporando theta, SE e volume amostral sem saltos artificiais)
 * 8. Populações empíricas para Ranking Provisório (150-499) e Oficial (>=500)
 * 9. Cálculo contínuo de percentil empírico (Weibull/Hazen midpoint)
 * 10. Rotina administrativa de auditoria e controle de qualidade dos itens
 * 11. Arquitetura extensível para calibração empírica contínua de itens
 */

export type StandardDifficulty = 'Fácil' | 'Médio' | 'Difícil';

export interface IRTItemParameters {
  difficulty_b: number;      // Parâmetro de dificuldade (b)
  discrimination_a: number;    // Parâmetro de discriminação (a)
  guessing_c: number;          // Parâmetro de acerto ao acaso (c, default 0)
}

/**
 * 2. PARÂMETROS INICIAIS DE DIFICULDADE (CENTRALIZADOS)
 * Fácil: b = -1.0, a = 1.0
 * Média: b = 0.0, a = 1.0
 * Difícil: b = +1.0, a = 1.0
 */
export const CENTRAL_DIFFICULTY_PARAMS: Record<StandardDifficulty, IRTItemParameters> = {
  Fácil: { difficulty_b: -1.0, discrimination_a: 1.0, guessing_c: 0.0 },
  Médio: { difficulty_b: 0.0, discrimination_a: 1.0, guessing_c: 0.0 },
  Difícil: { difficulty_b: 1.0, discrimination_a: 1.0, guessing_c: 0.0 }
};

/**
 * Registro de calibração empírica de itens individuais (quando houver volume suficiente)
 */
export interface ItemCalibration {
  question_id: string;
  difficulty_b: number;
  discrimination_a: number;
  guessing_c?: number;
  responsesCount?: number;
  lastCalibrated?: string;
  version?: number;
}

// Mapa centralizado para calibrações individuais futuras
export const ITEM_CALIBRATION_REGISTRY: Record<string, ItemCalibration> = {};

/**
 * Tentativa válida de resolução de questão
 */
export interface ValidatedAttempt {
  question_id: string;
  difficulty: StandardDifficulty;
  correct: boolean;
  user_id: string;
  timestamp: number;
  selectedLetter?: string;
}

/**
 * Normaliza strings de dificuldade para o padrão canônico
 */
export function normalizeDifficulty(diff: string | undefined | null): StandardDifficulty | null {
  if (!diff) return null;
  const cleaned = diff.trim().toLowerCase();
  if (cleaned === 'fácil' || cleaned === 'facil' || cleaned === 'easy') return 'Fácil';
  if (cleaned === 'médio' || cleaned === 'medio' || cleaned === 'média' || cleaned === 'media' || cleaned === 'medium') return 'Médio';
  if (cleaned === 'difícil' || cleaned === 'dificil' || cleaned === 'hard') return 'Difícil';
  return null;
}

/**
 * 1. QUESTÕES ELEGÍVEIS & DEDUPLICAÇÃO
 * - Exclui questões sem dificuldade conhecida
 * - Exclui questões anuladas
 * - Deduplica por question_id mantendo a tentativa mais recente
 */
export function getEligibleQuestions(
  rawAttempts: Array<{
    question_id: string;
    difficulty?: string | null;
    correct: boolean;
    user_id?: string;
    timestamp?: number | string;
    isAnulada?: boolean;
    selectedLetter?: string;
  }>,
  anuladasIds?: Set<string>
): ValidatedAttempt[] {
  // Ordena por timestamp crescente para garantir que a última tentativa prevaleça
  const sorted = [...rawAttempts].sort((a, b) => {
    const tA = typeof a.timestamp === 'number' ? a.timestamp : a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tB = typeof b.timestamp === 'number' ? b.timestamp : b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return tA - tB;
  });

  const latestByQuestion = new Map<string, ValidatedAttempt>();

  for (const item of sorted) {
    if (!item.question_id) continue;
    if (item.isAnulada || (anuladasIds && anuladasIds.has(item.question_id))) continue;

    const normDiff = normalizeDifficulty(item.difficulty);
    if (!normDiff) {
      // Questões sem dificuldade conhecida são COMPLETAMENTE EXCLUÍDAS
      continue;
    }

    const t = typeof item.timestamp === 'number'
      ? item.timestamp
      : item.timestamp
      ? new Date(item.timestamp).getTime()
      : Date.now();

    latestByQuestion.set(item.question_id, {
      question_id: item.question_id,
      difficulty: normDiff,
      correct: Boolean(item.correct),
      user_id: item.user_id || 'current-user',
      timestamp: t,
      selectedLetter: item.selectedLetter
    });
  }

  return Array.from(latestByQuestion.values());
}

/**
 * Função logística (Sigmoid) com proteção contra overflow
 */
export function sigmoid(z: number): number {
  if (z >= 30) return 1;
  if (z <= -30) return 0;
  if (z >= 0) {
    return 1 / (1 + Math.exp(-z));
  } else {
    const ez = Math.exp(z);
    return ez / (1 + ez);
  }
}

/**
 * Obtém os parâmetros IRT para uma tentativa (seja fixo ou calibrado individualmente)
 */
export function getItemParameters(attempt: ValidatedAttempt): IRTItemParameters {
  const custom = ITEM_CALIBRATION_REGISTRY[attempt.question_id];
  if (custom && (custom.responsesCount ?? 0) >= 30) {
    return {
      difficulty_b: custom.difficulty_b,
      discrimination_a: custom.discrimination_a,
      guessing_c: custom.guessing_c ?? 0.0
    };
  }
  return CENTRAL_DIFFICULTY_PARAMS[attempt.difficulty];
}

/**
 * 3. ESTIMATIVA DE HABILIDADE IRT (2PL) VIA BAYESIAN MAP
 * Maximiza a log-verossimilhança a posteriori com prior theta ~ Normal(0, 1).
 * Score function: f(theta) = sum a_i * (u_i - P_i(theta)) - theta = 0
 * Segunda derivada: f'(theta) = -sum a_i^2 * P_i(theta) * (1 - P_i(theta)) - 1 < 0
 * (Estritamente côncava, raiz única garantida)
 */
export function calculateIRTAbility(attempts: ValidatedAttempt[]): number {
  if (attempts.length === 0) return 0.0;

  const total = attempts.length;
  const correct = attempts.filter((a) => a.correct).length;

  // Valor inicial baseado na proporção de acertos regularizada
  const pRegularized = (correct + 1) / (total + 2);
  let theta = Math.log(pRegularized / (1 - pRegularized));
  theta = Math.max(-2.5, Math.min(2.5, theta));

  const MAX_ITER = 25;
  const TOLERANCE = 1e-6;

  for (let iter = 0; iter < MAX_ITER; iter++) {
    let fVal = -theta;      // Derivada do prior Normal(0, 1)
    let fPrime = -1.0;     // Segunda derivada do prior Normal(0, 1)

    for (let i = 0; i < total; i++) {
      const { difficulty_b, discrimination_a } = getItemParameters(attempts[i]);
      const u = attempts[i].correct ? 1 : 0;
      const prob = sigmoid(discrimination_a * (theta - difficulty_b));

      fVal += discrimination_a * (u - prob);
      fPrime -= discrimination_a * discrimination_a * prob * (1.0 - prob);
    }

    const step = fVal / fPrime;
    theta -= step;

    // Manter theta dentro de limites realistas de examinações médicas
    if (theta > 4.0) theta = 4.0;
    if (theta < -4.0) theta = -4.0;

    if (Math.abs(step) < TOLERANCE) {
      break;
    }
  }

  return theta;
}

/**
 * 5. ERRO PADRÃO DA ESTIMATIVA (STANDARD ERROR)
 * I_total(theta) = I_itens(theta) + 1 (prior Fisher info)
 * SE(theta) = 1 / sqrt(I_total(theta))
 */
export function calculateStandardError(theta: number, attempts: ValidatedAttempt[]): number {
  if (attempts.length === 0) return 1.0;

  let fisherInfo = 0.0;
  for (let i = 0; i < attempts.length; i++) {
    const { difficulty_b, discrimination_a } = getItemParameters(attempts[i]);
    const prob = sigmoid(discrimination_a * (theta - difficulty_b));
    fisherInfo += discrimination_a * discrimination_a * prob * (1.0 - prob);
  }

  // Prior Normal(0, 1) adiciona 1 unidade de informação
  const totalInfo = fisherInfo + 1.0;
  return 1.0 / Math.sqrt(totalInfo);
}

/**
 * 5. & 6. CONFIABILIDADE (RELIABILITY) DA ESTIMATIVA
 * Reliability = 1 - (SE^2 / sigma_prior^2) = I_itens / (I_itens + 1)
 */
export function calculateReliability(se: number): number {
  const rel = 1.0 - se * se;
  return Math.max(0.0, Math.min(0.999, rel));
}

/**
 * 6. & 7. ADJUSTED ABILITY SCORE
 * 
 * Requisitos atendidos:
 * - Monotônico com a habilidade estimada (theta)
 * - Incorpora confiabilidade da estimativa (reliability = 1 - SE^2)
 * - Shrinkage em direção à média quando há poucas questões
 * - A quantidade de questões tem peso relevante (10/10 difíceis não supera 450/500 consistente)
 * - Crescimento contínuo sem cortes arbitrários
 */
export function calculateAdjustedScore(
  theta: number,
  se: number,
  validCount: number
): number {
  if (validCount <= 0) return 0.0;

  const reliability = calculateReliability(se);

  // Fator contínuo de amostragem: W_n = (n / (n + 25))^0.35
  const sampleEvidence = Math.pow(validCount / (validCount + 25), 0.35);

  // Score regularizado bayesiano
  // Quando theta é positivo (desempenho acima da média), a evidência valida o excesso de score.
  // Usamos um threshold de credibilidade consistente:
  const baselineTheta = theta * reliability * sampleEvidence;

  // Ajuste fino para volume com precisão consistente
  const volumeBonus = Math.log10(Math.max(1, validCount)) * 0.15;

  return baselineTheta + volumeBonus;
}

/**
 * 8. STATUS DO RANKING
 * - 0–149 questões válidas: Não participa do ranking (unranked)
 * - 150–499 questões válidas: Ranking Provisório
 * - >=500 questões válidas: Ranking Oficial
 */
export type RankingStatusType = 'unranked' | 'provisional' | 'official';

export interface RankingStatusInfo {
  status: RankingStatusType;
  label: string;
  badgeLabel: string;
  missingForNextTier: number;
  nextTierName: string;
  message: string;
  isEligibleForRanking: boolean;
  isOfficial: boolean;
}

export const UNRANKED_THRESHOLD = 150;
export const OFFICIAL_THRESHOLD = 500;

export function getRankingStatus(validCount: number): RankingStatusInfo {
  if (validCount < UNRANKED_THRESHOLD) {
    const missing = UNRANKED_THRESHOLD - validCount;
    return {
      status: 'unranked',
      label: 'Sem ranking (<150)',
      badgeLabel: 'Sem Ranking',
      missingForNextTier: missing,
      nextTierName: 'Ranking Provisório',
      message: 'Continue resolvendo questões para liberar seu percentil.',
      isEligibleForRanking: false,
      isOfficial: false
    };
  }

  if (validCount < OFFICIAL_THRESHOLD) {
    const missing = OFFICIAL_THRESHOLD - validCount;
    return {
      status: 'provisional',
      label: 'Ranking provisório (150–499)',
      badgeLabel: 'Provisório',
      missingForNextTier: missing,
      nextTierName: 'Ranking Oficial',
      message: `Faltam ${missing} questões para entrar no ranking oficial.`,
      isEligibleForRanking: true,
      isOfficial: false
    };
  }

  return {
    status: 'official',
    label: 'Ranking oficial (≥500)',
    badgeLabel: 'Oficial',
    missingForNextTier: 0,
    nextTierName: 'Ranking Oficial',
    message: `Percentil oficial consolidado com ${validCount} questões válidas.`,
    isEligibleForRanking: true,
    isOfficial: true
  };
}

/**
 * 9. CÁLCULO CONTÍNUO DE PERCENTIL EMPÍRICO
 * P = (strictlyBelow + 0.5 * equalTo) / N * 100
 * Não arredonda internamente; suporta representação 99+ com decimais.
 */
export function calculateEmpiricalPercentile(
  targetScore: number,
  populationScores: number[]
): {
  continuousPercentile: number;
  roundedPercentile: number;
  formattedPercentile: string;
  strictlyBelow: number;
  equalTo: number;
  totalPopulation: number;
} {
  const total = populationScores.length;
  if (total === 0) {
    return {
      continuousPercentile: 50.0,
      roundedPercentile: 50,
      formattedPercentile: 'P50',
      strictlyBelow: 0,
      equalTo: 1,
      totalPopulation: 1
    };
  }

  let strictlyBelow = 0;
  let equalTo = 0;

  for (let i = 0; i < total; i++) {
    const diff = populationScores[i] - targetScore;
    if (diff < -1e-6) {
      strictlyBelow++;
    } else if (Math.abs(diff) <= 1e-6) {
      equalTo++;
    }
  }

  // Weibull / Hazen continuous midpoint
  const continuous = ((strictlyBelow + 0.5 * equalTo) / total) * 100.0;
  const bounded = Math.max(0.1, Math.min(99.9, continuous));
  const rounded = Math.min(99, Math.max(1, Math.round(bounded)));

  let formatted = `P${rounded}`;
  // 17. Exibição de alta precisão para 99+ quando a população for suficiente (>= 100 alunos)
  if (bounded >= 99.0 && total >= 100) {
    formatted = `P${bounded.toFixed(1)}`;
  }

  return {
    continuousPercentile: bounded,
    roundedPercentile: rounded,
    formattedPercentile: formatted,
    strictlyBelow,
    equalTo,
    totalPopulation: total
  };
}

/**
 * 13. ROTINA ADMINISTRATIVA DE CONTROLE DE QUALIDADE
 */
export interface QualityAuditResult {
  totalAudited: number;
  canceledCount: number;
  unknownDifficultyCount: number;
  duplicateAttemptsCount: number;
  validEligibleCount: number;
  anomalies: Array<{
    question_id: string;
    issue: 'canceled' | 'unknown_difficulty' | 'duplicate_answer' | 'anomalous_accuracy';
    description: string;
  }>;
}

export function auditQuestionsQuality(
  attempts: Array<{
    question_id: string;
    difficulty?: string | null;
    correct: boolean;
    isAnulada?: boolean;
    timestamp?: number | string;
  }>
): QualityAuditResult {
  const anomalies: QualityAuditResult['anomalies'] = [];
  const seenIds = new Set<string>();
  let duplicateCount = 0;
  let canceledCount = 0;
  let unknownDiffCount = 0;
  let validCount = 0;

  for (const a of attempts) {
    if (a.isAnulada) {
      canceledCount++;
      anomalies.push({
        question_id: a.question_id,
        issue: 'canceled',
        description: 'Questão marcada como anulada foi submetida em tentativa.'
      });
      continue;
    }

    const norm = normalizeDifficulty(a.difficulty);
    if (!norm) {
      unknownDiffCount++;
      anomalies.push({
        question_id: a.question_id,
        issue: 'unknown_difficulty',
        description: `Questão com dificuldade desconhecida ou inválida: "${a.difficulty}".`
      });
      continue;
    }

    if (seenIds.has(a.question_id)) {
      duplicateCount++;
      anomalies.push({
        question_id: a.question_id,
        issue: 'duplicate_answer',
        description: `Múltiplas respostas registradas para a mesma questão: ${a.question_id}.`
      });
    } else {
      seenIds.add(a.question_id);
      validCount++;
    }
  }

  return {
    totalAudited: attempts.length,
    canceledCount,
    unknownDifficultyCount: unknownDiffCount,
    duplicateAttemptsCount: duplicateCount,
    validEligibleCount: validCount,
    anomalies
  };
}

/**
 * 14. FUTURA CALIBRAÇÃO DOS ITENS
 * Estima empiricamente parâmetros b e a a partir das respostas da plataforma
 */
export function calibrateItemEmpirically(
  questionId: string,
  userResponses: Array<{ userTheta: number; correct: boolean }>,
  minResponses: number = 30
): ItemCalibration | null {
  if (userResponses.length < minResponses) {
    return null; // Mínimo de respostas necessárias
  }

  const n = userResponses.length;
  const correctCount = userResponses.filter((r) => r.correct).length;
  const rawP = correctCount / n;

  // Dificuldade empírica aproximada em escala z
  const b = -Math.log(Math.max(0.01, Math.min(0.99, rawP)) / (1 - Math.max(0.01, Math.min(0.99, rawP))));

  // Discriminação aproximada (correlação bisserial theta vs acerto)
  const meanTheta = userResponses.reduce((acc, r) => acc + r.userTheta, 0) / n;
  const meanThetaCorrect = correctCount > 0
    ? userResponses.filter((r) => r.correct).reduce((acc, r) => acc + r.userTheta, 0) / correctCount
    : meanTheta;

  const a = Math.max(0.5, Math.min(2.5, (meanThetaCorrect - meanTheta) * 1.5 + 1.0));

  const calibrated: ItemCalibration = {
    question_id: questionId,
    difficulty_b: b,
    discrimination_a: a,
    guessing_c: 0.0,
    responsesCount: n,
    lastCalibrated: new Date().toISOString(),
    version: (ITEM_CALIBRATION_REGISTRY[questionId]?.version ?? 0) + 1
  };

  ITEM_CALIBRATION_REGISTRY[questionId] = calibrated;
  return calibrated;
}

/**
 * ESTRUTURA COMPLETA DE ANÁLISE IRT DO ALUNO
 */
export interface ComprehensiveIRTResult {
  theta: number;
  standard_error: number;
  reliability: number;
  validQuestionsCount: number;
  correctCount: number;
  accuracyRate: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  adjustedScore: number;
  statusInfo: RankingStatusInfo;
  percentile: number | null;
  formattedPercentile: string;
  isOfficial: boolean;
  totalPopulation: number;
}

/**
 * Executa o fluxo completo do modelo IRT para um conjunto de tentativas
 */
export function computeStudentIRTEvaluation(
  attempts: ValidatedAttempt[],
  cohortScores: number[]
): ComprehensiveIRTResult {
  const validCount = attempts.length;
  const statusInfo = getRankingStatus(validCount);

  if (validCount === 0) {
    return {
      theta: 0.0,
      standard_error: 1.0,
      reliability: 0.0,
      validQuestionsCount: 0,
      correctCount: 0,
      accuracyRate: 0.0,
      easyCount: 0,
      mediumCount: 0,
      hardCount: 0,
      adjustedScore: 0.0,
      statusInfo,
      percentile: null,
      formattedPercentile: 'Sem ranking',
      isOfficial: false,
      totalPopulation: cohortScores.length
    };
  }

  const correctCount = attempts.filter((a) => a.correct).length;
  const accuracyRate = (correctCount / validCount) * 100.0;
  const easyCount = attempts.filter((a) => a.difficulty === 'Fácil').length;
  const mediumCount = attempts.filter((a) => a.difficulty === 'Médio').length;
  const hardCount = attempts.filter((a) => a.difficulty === 'Difícil').length;

  const theta = calculateIRTAbility(attempts);
  const se = calculateStandardError(theta, attempts);
  const reliability = calculateReliability(se);
  const adjustedScore = calculateAdjustedScore(theta, se, validCount);

  let percentile: number | null = null;
  let formattedPercentile = 'Sem ranking';

  if (statusInfo.isEligibleForRanking) {
    const percResult = calculateEmpiricalPercentile(adjustedScore, cohortScores);
    percentile = percResult.roundedPercentile;
    formattedPercentile = statusInfo.status === 'provisional'
      ? `${percResult.formattedPercentile} (Provisório)`
      : percResult.formattedPercentile;
  }

  return {
    theta,
    standard_error: se,
    reliability,
    validQuestionsCount: validCount,
    correctCount,
    accuracyRate,
    easyCount,
    mediumCount,
    hardCount,
    adjustedScore,
    statusInfo,
    percentile,
    formattedPercentile,
    isOfficial: statusInfo.isOfficial,
    totalPopulation: cohortScores.length
  };
}
