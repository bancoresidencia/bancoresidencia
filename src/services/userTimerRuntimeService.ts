import { SelectedTaxonomy, StudySession, StudyType } from '@/types/studyTimer';
import { DailyScheduleSlot } from '@/components/dashboard/scheduleTypes';

export interface PersistedTimerState {
  userId: string;
  status: 'running' | 'paused';
  accumulatedSeconds: number;
  runningSince: number | null;
  sessionStartTime: string;
  selectedTaxonomy: SelectedTaxonomy;
  studyType: StudyType;
  sessionSource: 'manual' | 'questoes' | 'simulado' | 'flashcards';
  questionsCount: number;
  correctCount: number;
  incorrectCount: number;
  updatedAtMs: number;
}

export interface LoadedTimerRuntime {
  todayActiveSeconds: number;
  activeTimerState: PersistedTimerState | null;
}

const LEGACY_TIMER_STORAGE_KEY = 'bancoresidencia_study_timer_state';

export function getUserTimerStateStorageKey(userId?: string | null): string {
  return userId
    ? `bancoresidencia_study_timer_state_${userId}`
    : 'bancoresidencia_study_timer_state_guest';
}

export function getPlatformActiveStorageKey(userId: string | null | undefined, dateStr: string): string {
  return `bancoresidencia_platform_active_time_${userId || 'guest'}_${dateStr}`;
}

export function readLocalPlatformActiveSeconds(
  userId: string | null | undefined,
  dateStr: string
): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(getPlatformActiveStorageKey(userId, dateStr));
    if (!raw) return 0;
    const parsed = Number(raw);
    return !isNaN(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
  } catch {
    return 0;
  }
}

export function writeLocalPlatformActiveSeconds(
  userId: string | null | undefined,
  dateStr: string,
  seconds: number
): void {
  if (typeof window === 'undefined') return;
  try {
    const safe = Math.min(86400, Math.max(0, Math.floor(seconds)));
    localStorage.setItem(getPlatformActiveStorageKey(userId, dateStr), String(safe));
  } catch {}
}

export function readLocalTimerState(userId?: string | null): PersistedTimerState | null {
  if (typeof window === 'undefined') return null;
  const scopedKey = getUserTimerStateStorageKey(userId);

  try {
    const rawScoped = localStorage.getItem(scopedKey);
    if (rawScoped) {
      const parsed = JSON.parse(rawScoped) as Partial<PersistedTimerState>;
      if (parsed && (parsed.status === 'running' || parsed.status === 'paused')) {
        if (!userId || !parsed.userId || parsed.userId === userId) {
          return {
            userId: userId || parsed.userId || 'guest',
            status: parsed.status,
            accumulatedSeconds: parsed.accumulatedSeconds || 0,
            runningSince: parsed.runningSince ?? null,
            sessionStartTime: parsed.sessionStartTime || new Date().toISOString(),
            selectedTaxonomy: parsed.selectedTaxonomy || {},
            studyType: parsed.studyType || 'questoes',
            sessionSource: parsed.sessionSource || 'manual',
            questionsCount: parsed.questionsCount || 0,
            correctCount: parsed.correctCount || 0,
            incorrectCount: parsed.incorrectCount || 0,
            updatedAtMs: parsed.updatedAtMs || Date.now()
          };
        }
      }
    }

    // Migração única da chave legada global (remove imediatamente após ler para evitar vazamento entre contas)
    const rawLegacy = localStorage.getItem(LEGACY_TIMER_STORAGE_KEY);
    if (rawLegacy) {
      localStorage.removeItem(LEGACY_TIMER_STORAGE_KEY);
      const legacy = JSON.parse(rawLegacy) as Partial<PersistedTimerState>;
      if (
        legacy &&
        (legacy.status === 'running' || legacy.status === 'paused') &&
        (!legacy.userId || legacy.userId === (userId || 'guest'))
      ) {
        const migrated: PersistedTimerState = {
          userId: userId || 'guest',
          status: legacy.status,
          accumulatedSeconds: legacy.accumulatedSeconds || 0,
          runningSince: legacy.runningSince ?? null,
          sessionStartTime: legacy.sessionStartTime || new Date().toISOString(),
          selectedTaxonomy: legacy.selectedTaxonomy || {},
          studyType: legacy.studyType || 'questoes',
          sessionSource: legacy.sessionSource || 'manual',
          questionsCount: legacy.questionsCount || 0,
          correctCount: legacy.correctCount || 0,
          incorrectCount: legacy.incorrectCount || 0,
          updatedAtMs: legacy.updatedAtMs || Date.now()
        };
        localStorage.setItem(scopedKey, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch {}

  return null;
}

export function writeLocalTimerState(
  state: PersistedTimerState,
  userId?: string | null
): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getUserTimerStateStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(state));
    localStorage.removeItem(LEGACY_TIMER_STORAGE_KEY);
  } catch {}
}

export function clearLocalTimerState(userId?: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(getUserTimerStateStorageKey(userId));
    localStorage.removeItem(LEGACY_TIMER_STORAGE_KEY);
  } catch {}
}

export async function syncTimerRuntimeToCloud(
  payload: {
    dateStr?: string;
    activeSeconds?: number;
    activeTimerState?: PersistedTimerState | null;
    finishedSession?: StudySession;
    scheduledTask?: DailyScheduleSlot;
  },
  userId?: string | null,
  keepalive = false
): Promise<boolean> {
  if (typeof window === 'undefined' || !userId || userId === 'demo-student') {
    return false;
  }

  try {
    const res = await fetch('/api/student/timer-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function loadUserTimerRuntime(
  userId: string | null | undefined,
  todayStr: string
): Promise<LoadedTimerRuntime> {
  const localActive = readLocalPlatformActiveSeconds(userId, todayStr);
  const localTimer = readLocalTimerState(userId);

  if (typeof window === 'undefined' || !userId || userId === 'demo-student') {
    return {
      todayActiveSeconds: localActive,
      activeTimerState: localTimer
    };
  }

  try {
    const res = await fetch('/api/student/timer-state', {
      method: 'GET',
      cache: 'no-store'
    });

    if (!res.ok) {
      return {
        todayActiveSeconds: localActive,
        activeTimerState: localTimer
      };
    }

    const data = (await res.json()) as {
      success?: boolean;
      dailyActiveSecondsByDate?: Record<string, number>;
      activeTimerState?: PersistedTimerState | null;
    };

    const remoteDaily = data.dailyActiveSecondsByDate?.[todayStr] ?? 0;
    const mergedActive = Math.max(localActive, remoteDaily);
    writeLocalPlatformActiveSeconds(userId, todayStr, mergedActive);

    // Se o valor local era maior que o remoto, atualiza a nuvem em background
    if (localActive > remoteDaily) {
      syncTimerRuntimeToCloud(
        { dateStr: todayStr, activeSeconds: mergedActive },
        userId
      ).catch(() => {});
    }

    // Resolve o estado mais recente do cronômetro em andamento entre local e nuvem
    const remoteTimer =
      data.activeTimerState && data.activeTimerState.userId === userId
        ? data.activeTimerState
        : null;

    let chosenTimer: PersistedTimerState | null = localTimer;
    if (remoteTimer && !localTimer) {
      chosenTimer = remoteTimer;
      writeLocalTimerState(remoteTimer, userId);
    } else if (remoteTimer && localTimer) {
      chosenTimer =
        (remoteTimer.updatedAtMs || 0) > (localTimer.updatedAtMs || 0)
          ? remoteTimer
          : localTimer;
      writeLocalTimerState(chosenTimer, userId);
    } else if (!remoteTimer && localTimer) {
      // Sobe o timer local ativo para a nuvem
      syncTimerRuntimeToCloud({ activeTimerState: localTimer }, userId).catch(() => {});
    }

    return {
      todayActiveSeconds: mergedActive,
      activeTimerState: chosenTimer
    };
  } catch {
    return {
      todayActiveSeconds: localActive,
      activeTimerState: localTimer
    };
  }
}
