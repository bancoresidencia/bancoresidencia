import {
  UserStudySchedule,
  UserScheduleItem,
  UserFocusProgress
} from '@/types/studySchedule';

export interface LocalScheduleCache {
  schedule: UserStudySchedule | null;
  items: UserScheduleItem[];
  focusProgress: Record<string, UserFocusProgress>;
}

export function buildFocusKey(especialidade: string, tema: string, foco: string): string {
  const clean = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  return `${clean(especialidade)}__${clean(tema)}__${clean(foco)}`;
}

export function getScheduleStorageKey(userId?: string | null): string {
  return userId ? `bancoresidencia_study_schedule_${userId}` : 'bancoresidencia_study_schedule_guest';
}

export function readLocalScheduleCache(userId?: string | null): LocalScheduleCache {
  if (typeof window === 'undefined') {
    return { schedule: null, items: [], focusProgress: {} };
  }
  try {
    const raw = localStorage.getItem(getScheduleStorageKey(userId));
    if (!raw) return { schedule: null, items: [], focusProgress: {} };
    const parsed = JSON.parse(raw);
    return {
      schedule: parsed.schedule || null,
      items: Array.isArray(parsed.items) ? parsed.items : [],
      focusProgress: parsed.focusProgress || {}
    };
  } catch {
    return { schedule: null, items: [], focusProgress: {} };
  }
}

export function writeLocalScheduleCache(
  userId: string | null | undefined,
  data: LocalScheduleCache
): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getScheduleStorageKey(userId), JSON.stringify(data));
  } catch (err) {
    console.warn('[studyScheduleStorage] Falha ao gravar cache local:', err);
  }
}
