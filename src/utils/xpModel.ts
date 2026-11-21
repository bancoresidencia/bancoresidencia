/**
 * MOTOR DE EXPERIÊNCIA (XP) E NÍVEIS DO AVATAR
 * Plataforma Banco Residência Médica
 * 
 * Regras normativas de atribuição:
 * - Questão resolvida (Banco): 1.0 XP base + 0.5 XP se acerto (1.5 XP total) ou + 0.1 XP se erro (1.1 XP total).
 * - Caderno de erros: segue a mesma regra de questão (1.5 XP acerto / 1.1 XP erro).
 * - Flashcards (FSRS):
 *   - 'easy' ou 'good' (Fácil / Bom): +0.10 XP
 *   - 'hard' (Difícil): +0.05 XP
 *   - 'again' (De novo): 0.00 XP
 * - Material de estudo / Resumo checado: +20.0 XP
 * 
 * O nível é estritamente de dedicação e resposta do aluno.
 * NÃO afeta o ranking psicométrico principal da TRI.
 */

export interface XPBreakdown {
  questionsXP: number;
  flashcardsXP: number;
  materialsXP: number;
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
}

/**
 * Retorna o XP concedido por uma questão resolvida (banco ou caderno de erros)
 */
export function calculateQuestionXP(isCorrect: boolean): number {
  return isCorrect ? 1.5 : 1.1;
}

/**
 * Retorna o XP concedido por uma revisão de flashcard (FSRS)
 */
export function calculateFlashcardXP(rating: 'again' | 'hard' | 'good' | 'easy' | string): number {
  const normalized = rating?.toLowerCase().trim();
  if (normalized === 'easy' || normalized === 'good' || normalized === 'facil' || normalized === 'bom') {
    return 0.1;
  }
  if (normalized === 'hard' || normalized === 'dificil' || normalized === 'difícil') {
    return 0.05;
  }
  return 0.0;
}

/**
 * Retorna o XP concedido por material de apoio lido e concluído
 */
export function calculateMaterialXP(): number {
  return 20.0;
}

/**
 * Calcula o nível do avatar com base no XP total acumulado
 * Equação: Nível = max(1, floor(1 + sqrt(XP / 25)))
 */
export function calculateLevel(totalXP: number): number {
  const xp = Math.max(0, totalXP);
  return Math.max(1, Math.floor(1 + Math.sqrt(xp / 25)));
}

/**
 * Retorna o XP cumulativo exato necessário para atingir determinado nível
 * Para nível L: XP_L = (L - 1)^2 * 25
 */
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(Math.pow(level - 1, 2) * 25);
}

/**
 * Retorna o progresso detalhado de XP entre o nível atual e o próximo
 */
export function getLevelProgress(totalXP: number): {
  currentLevel: number;
  nextLevel: number;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpInCurrentTier: number;
  xpRequiredForTier: number;
  progressPercent: number;
} {
  const xp = Math.max(0, totalXP);
  const currentLevel = calculateLevel(xp);
  const nextLevel = currentLevel + 1;
  const xpForCurrentLevel = getXPForLevel(currentLevel);
  const xpForNextLevel = getXPForLevel(nextLevel);
  const xpInCurrentTier = Math.max(0, xp - xpForCurrentLevel);
  const xpRequiredForTier = Math.max(1, xpForNextLevel - xpForCurrentLevel);
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentTier / xpRequiredForTier) * 100)));

  return {
    currentLevel,
    nextLevel,
    currentXP: Math.round(xp * 10) / 10,
    xpForCurrentLevel,
    xpForNextLevel,
    xpInCurrentTier: Math.round(xpInCurrentTier * 10) / 10,
    xpRequiredForTier,
    progressPercent
  };
}
