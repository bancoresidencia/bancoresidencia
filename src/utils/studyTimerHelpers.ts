import { DailyScheduleSlot } from '@/components/dashboard/scheduleTypes';
import { PersistedTimerState } from '@/services/userTimerRuntimeService';
import { SelectedTaxonomy, StudySession, StudyType } from '@/types/studyTimer';

/**
 * Formata segundos totais no padrão "hh:mm:ss".
 */
export function formatSecondsToHms(totalSec: number): string {
  if (isNaN(totalSec) || totalSec < 0) return '00:00:00';
  const safe = Math.floor(totalSec);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Formata segundos totais no padrão compacto ("1h 20m 5s", "4m 10s", "12s").
 */
export function formatSecondsToShort(totalSec: number): string {
  if (isNaN(totalSec) || totalSec < 0) return '0s';
  const safe = Math.floor(totalSec);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;

  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * Converte qualquer entrada de data (Date, timestamp ms, string ISO ou YYYY-MM-DD)
 * em uma string "YYYY-MM-DD" alinhada ao fuso horário local do usuário.
 */
export function getLocalDateStr(dateInput?: string | Date | number | null): string {
  if (!dateInput) return '';
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Calcula o tempo líquido seguro ao restaurar um estado persistido,
 * usando updatedAtMs como teto para nunca somar horas em que a página ficou fechada.
 */
export function computeSafeElapsedOnRestore(
  saved: Pick<PersistedTimerState, 'status' | 'accumulatedSeconds' | 'runningSince' | 'updatedAtMs'>,
  nowMs: number = Date.now()
): number {
  const base = Math.max(0, Math.floor(saved.accumulatedSeconds || 0));
  if (saved.status !== 'running' || !saved.runningSince) {
    return base;
  }

  const lastActiveMs =
    typeof saved.updatedAtMs === 'number' && saved.updatedAtMs >= saved.runningSince
      ? Math.min(nowMs, saved.updatedAtMs)
      : saved.runningSince;

  const deltaSec = Math.max(0, Math.floor((lastActiveMs - saved.runningSince) / 1000));
  return base + deltaSec;
}

/**
 * Regra de negócio: sessões automáticas do Banco de Questões sem nenhuma questão respondida são descartadas.
 */
export function shouldDiscardEmptyQuestionSession(
  sessionSource: 'manual' | 'questoes' | 'simulado' | 'flashcards' | undefined,
  questionsCount: number
): boolean {
  return sessionSource === 'questoes' && questionsCount <= 0;
}

/**
 * Constrói os objetos StudySession e DailyScheduleSlot de forma determinística para persistência.
 */
export function buildSessionAndScheduleSlot(params: {
  id?: string;
  userId?: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  taxonomy: SelectedTaxonomy;
  studyType: StudyType;
  questionsCount: number;
  correctCount: number;
  incorrectCount?: number;
  accuracy?: number;
  sessionSource: 'manual' | 'questoes' | 'simulado' | 'flashcards';
  notes?: string;
}): { session: StudySession; scheduleSlot: DailyScheduleSlot } {
  const safeDuration = Math.max(0, Math.floor(params.durationSeconds));
  const formatted = formatSecondsToHms(safeDuration);
  const totalQ = Math.max(0, params.questionsCount || 0);
  const correctQ = Math.max(0, params.correctCount || 0);
  const incorrectQ =
    params.incorrectCount !== undefined && params.incorrectCount > 0
      ? params.incorrectCount
      : Math.max(0, totalQ - correctQ);
  const acc =
    params.accuracy !== undefined
      ? params.accuracy
      : totalQ > 0
      ? Math.round((correctQ / totalQ) * 100)
      : undefined;

  const sessionId = params.id || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const activeTaxonomy = params.taxonomy || {};
  const topicTitle =
    activeTaxonomy.rawLabel ||
    activeTaxonomy.subfoco ||
    activeTaxonomy.foco ||
    activeTaxonomy.tema ||
    activeTaxonomy.especialidade ||
    'Estudo Livre';

  const session: StudySession = {
    id: sessionId,
    userId: params.userId,
    startTime: params.startTime || params.endTime,
    endTime: params.endTime,
    durationSeconds: safeDuration,
    durationFormatted: formatted,
    taxonomy: activeTaxonomy,
    studyType: params.studyType || 'questoes',
    questionsCount: totalQ,
    correctCount: correctQ,
    incorrectCount: incorrectQ,
    accuracy: acc,
    sessionSource: params.sessionSource || 'manual',
    notes: params.notes || '',
    createdAt: params.endTime
  };

  const startDate = new Date(session.startTime);
  const endDate = new Date(session.endTime);
  const validStart = isNaN(startDate.getTime()) ? new Date() : startDate;
  const validEnd = isNaN(endDate.getTime()) ? validStart : endDate;

  const startMinutes = validStart.getHours() * 60 + validStart.getMinutes();
  const endMinutes = Math.max(startMinutes + 1, validEnd.getHours() * 60 + validEnd.getMinutes());

  let questionsSummary = '';
  if (totalQ > 0) {
    questionsSummary = ` ${totalQ} questões (${correctQ} acertos, ${incorrectQ} erros • ${acc}% de aproveitamento).`;
  }

  const scheduleSlot: DailyScheduleSlot = {
    id: `task_${session.id}`,
    title: topicTitle === 'Treino Geral' ? 'Treino Geral de Questões' : `Estudo: ${topicTitle}`,
    category: 'estudo',
    startTime: `${String(validStart.getHours()).padStart(2, '0')}:${String(validStart.getMinutes()).padStart(2, '0')}`,
    endTime: `${String(validEnd.getHours()).padStart(2, '0')}:${String(validEnd.getMinutes()).padStart(2, '0')}`,
    startMinutes,
    endMinutes,
    source: 'plataforma',
    description: `Tempo líquido: ${formatted}.${questionsSummary}${params.notes ? ` Obs: ${params.notes}` : ''}`,
    action: 'treinar',
    date: getLocalDateStr(validStart)
  };

  return { session, scheduleSlot };
}
