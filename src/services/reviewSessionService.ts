import { ActiveReviewSessionState, UserAnswerItem } from '@/types';

const LEGACY_REVIEW_STORAGE_KEY = 'banco_active_review_session';

export function getActiveReviewStorageKey(userId?: string | null): string {
  return userId
    ? `banco_active_review_session_${userId}`
    : 'banco_active_review_session_guest';
}

export function saveActiveReviewSession(
  session: ActiveReviewSessionState,
  userId?: string | null
): void {
  if (typeof window === 'undefined') return;
  try {
    const updated: ActiveReviewSessionState = {
      ...session,
      lastUpdatedAt: Date.now()
    };
    localStorage.setItem(getActiveReviewStorageKey(userId), JSON.stringify(updated));
    localStorage.removeItem(LEGACY_REVIEW_STORAGE_KEY);
  } catch (error) {
    console.warn('Falha ao persistir sessão ativa de revisão:', error);
  }
}

export function getActiveReviewSession(userId?: string | null): ActiveReviewSessionState | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = getActiveReviewStorageKey(userId);
    let raw = localStorage.getItem(key);
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_REVIEW_STORAGE_KEY);
      if (legacy) {
        localStorage.removeItem(LEGACY_REVIEW_STORAGE_KEY);
        raw = legacy;
        localStorage.setItem(key, legacy);
      }
    }
    if (!raw) return null;
    const session: ActiveReviewSessionState = JSON.parse(raw);

    if (!session || !Array.isArray(session.questionIds) || session.questionIds.length === 0) {
      clearActiveReviewSession(userId);
      return null;
    }

    const answeredCount = Object.keys(session.sessionAnswers || {}).length;
    if (answeredCount >= session.questionIds.length) {
      clearActiveReviewSession(userId);
      return null;
    }

    return session;
  } catch (error) {
    console.warn('Falha ao ler sessão ativa de revisão:', error);
    return null;
  }
}

export function clearActiveReviewSession(userId?: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(getActiveReviewStorageKey(userId));
    localStorage.removeItem(LEGACY_REVIEW_STORAGE_KEY);
  } catch (error) {
    console.warn('Falha ao limpar sessão de revisão:', error);
  }
}

export interface ReviewCycleMetrics {
  totalNoCaderno: number;
  paraRevisar: number;
  agendadas: number;
  foraDoCiclo: number;
  taxaSuperacao: number;
  topTemas: Array<{ tema: string; count: number }>;
  topEspecialidades: Array<{ especialidade: string; count: number }>;
}

export function calculateReviewCycleMetrics(
  userAnswers: Record<string, UserAnswerItem>,
  questionsMap: Record<string, { especialidade?: string; tema?: string }> = {}
): ReviewCycleMetrics {
  const allEntries = Object.entries(userAnswers).filter(
    ([, ans]) => !ans.isCorrect || ans.statusRetrial === 'recuperado'
  );

  const totalNoCaderno = allEntries.length;
  let paraRevisar = 0;
  const agendadas = 0;
  let foraDoCiclo = 0;

  const temasCount: Record<string, number> = {};
  const especialidadesCount: Record<string, number> = {};

  allEntries.forEach(([qid, ans]) => {
    const status = ans.statusRetrial || 'pendente';
    if (status === 'recuperado') {
      foraDoCiclo++;
    } else {
      paraRevisar++;
    }

    let spec = ans.specialty || questionsMap[qid]?.especialidade || 'Outros';
    if (spec === 'Cirurgia') spec = 'Cirurgia Geral';
    if (spec === 'Ginecologia e Obstetrícia') spec = 'Ginecologia';

    const tema = ans.tema || questionsMap[qid]?.tema || '';

    if (spec) {
      especialidadesCount[spec] = (especialidadesCount[spec] || 0) + 1;
    }
    if (tema) {
      temasCount[tema] = (temasCount[tema] || 0) + 1;
    }
  });

  const taxaSuperacao = totalNoCaderno > 0 ? (foraDoCiclo / totalNoCaderno) * 100 : 0;

  const topTemas = Object.entries(temasCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tema, count]) => ({ tema, count }));

  const topEspecialidades = Object.entries(especialidadesCount)
    .sort((a, b) => b[1] - a[1])
    .map(([especialidade, count]) => ({ especialidade, count }));

  return {
    totalNoCaderno,
    paraRevisar,
    agendadas,
    foraDoCiclo,
    taxaSuperacao,
    topTemas,
    topEspecialidades
  };
}
