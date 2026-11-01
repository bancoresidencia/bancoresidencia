import { ActiveReviewSessionState, UserAnswerItem } from '@/types';

const STORAGE_KEY = 'banco_active_review_session';

/**
 * Salva a sessão ativa de revisão de forma persistente e resiliente.
 */
export function saveActiveReviewSession(session: ActiveReviewSessionState): void {
  if (typeof window === 'undefined') return;
  try {
    const updated: ActiveReviewSessionState = {
      ...session,
      lastUpdatedAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('Falha ao persistir sessão ativa de revisão:', error);
  }
}

/**
 * Recupera a sessão ativa de revisão se houver questões ainda não finalizadas.
 */
export function getActiveReviewSession(): ActiveReviewSessionState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session: ActiveReviewSessionState = JSON.parse(raw);

    // Valida integridade básica
    if (!session || !Array.isArray(session.questionIds) || session.questionIds.length === 0) {
      clearActiveReviewSession();
      return null;
    }

    // Se já respondeu todas as questões da sessão, ela é considerada concluída
    const answeredCount = Object.keys(session.sessionAnswers || {}).length;
    if (answeredCount >= session.questionIds.length) {
      clearActiveReviewSession();
      return null;
    }

    return session;
  } catch (error) {
    console.warn('Falha ao ler sessão ativa de revisão:', error);
    return null;
  }
}

/**
 * Remove a sessão ativa quando ela é concluída ou explicitamente descartada pelo estudante.
 */
export function clearActiveReviewSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
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

/**
 * Calcula a tríade do ciclo de aprendizagem e a topografia clínica de vulnerabilidades.
 */
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

    // Identifica especialidade e tema
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

  // Ordena os Top 5 Temas mais frequentes
  const topTemas = Object.entries(temasCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tema, count]) => ({ tema, count }));

  // Ordena as Especialidades com mais erros
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
