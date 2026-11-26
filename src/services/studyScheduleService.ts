import { createClient } from '@/lib/supabase/client';
import {
  UserStudySchedule,
  UserScheduleItem,
  UserFocusProgress
} from '@/types/studySchedule';
import {
  readLocalScheduleCache,
  writeLocalScheduleCache,
  buildFocusKey,
  LocalScheduleCache
} from '@/utils/studyScheduleStorage';
import {
  DbScheduleRow,
  DbScheduleItemRow,
  DbFocusProgressRow,
  toUserStudySchedule,
  toUserScheduleItem,
  toUserFocusProgress
} from '@/utils/studyScheduleMappers';

export { buildFocusKey } from '@/utils/studyScheduleStorage';

/**
 * Carrega o cronograma ativo, seus itens e o progresso dos focos.
 * Lê do cache local instantaneamente e sincroniza com o Supabase quando autenticado.
 */
export type ScheduleSyncStatus = 'synced' | 'offline' | 'error';

export async function loadUserSchedule(
  userId?: string | null
): Promise<{
  schedule: UserStudySchedule | null;
  items: UserScheduleItem[];
  focusProgress: Record<string, UserFocusProgress>;
  syncStatus: ScheduleSyncStatus;
}> {
  const local = readLocalScheduleCache(userId);
  if (!userId || userId === 'demo-student') return { ...local, syncStatus: 'offline' };

  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user || session.user.id !== userId) return { ...local, syncStatus: 'offline' };

    // 1. Busca cronograma ativo
    const { data: scheduleData, error: schedError } = await supabase
      .from('user_study_schedules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (schedError) {
      console.warn('[studyScheduleService] Erro ao buscar cronograma:', schedError.message);
      return { ...local, syncStatus: 'error' };
    }

    const remoteSchedule = scheduleData ? toUserStudySchedule(scheduleData as unknown as DbScheduleRow) : null;

    // 2. Busca itens do cronograma ativo
    let remoteItems: UserScheduleItem[] = [];
    if (remoteSchedule) {
      const { data: itemsData, error: itemsError } = await supabase
        .from('user_schedule_items')
        .select('*')
        .eq('schedule_id', remoteSchedule.id)
        .order('scheduled_date', { ascending: true })
        .order('order_index', { ascending: true });

      if (!itemsError && itemsData) {
        remoteItems = (itemsData as unknown as DbScheduleItemRow[]).map(toUserScheduleItem);
      }
    }

    // 3. Busca progresso de todos os focos
    const { data: progressData, error: progError } = await supabase
      .from('user_focus_progress')
      .select('*')
      .eq('user_id', userId);

    const remoteProgress: Record<string, UserFocusProgress> = {};
    if (!progError && progressData) {
      for (const r of (progressData as unknown as DbFocusProgressRow[])) {
        remoteProgress[r.focus_key] = toUserFocusProgress(r);
      }
    }

    const merged: LocalScheduleCache = {
      schedule: remoteSchedule || local.schedule,
      items: remoteItems.length > 0 ? remoteItems : local.items,
      focusProgress: Object.keys(remoteProgress).length > 0 ? remoteProgress : local.focusProgress
    };

    writeLocalScheduleCache(userId, merged);
    return { ...merged, syncStatus: 'synced' };
  } catch (err) {
    console.error('[studyScheduleService] Erro ao sincronizar cronograma:', err);
    return { ...local, syncStatus: 'error' };
  }
}

/**
 * Salva ou atualiza a meta/cabeçalho de um cronograma de estudos.
 */
export async function saveUserSchedule(
  schedule: UserStudySchedule,
  userId?: string | null
): Promise<UserStudySchedule> {
  const local = readLocalScheduleCache(userId);
  local.schedule = schedule;
  writeLocalScheduleCache(userId, local);

  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      const payload: DbScheduleRow = {
        id: schedule.id,
        user_id: userId,
        title: schedule.title,
        target_exam: schedule.targetExam || null,
        target_exam_date: schedule.targetExamDate || null,
        start_date: schedule.startDate,
        weekly_study_days: schedule.weeklyStudyDays,
        daily_focus_target: schedule.dailyFocusTarget,
        is_active: schedule.isActive,
        auto_revision_intervals: schedule.autoRevisionIntervals,
        settings: (schedule.settings as Record<string, unknown>) || {},
        updated_at: new Date().toISOString()
      };
      await supabase.from('user_study_schedules').upsert(payload);
    } catch (err) {
      console.warn('[studyScheduleService] Falha ao persistir cronograma no Supabase:', err);
    }
  }

  return schedule;
}

/**
 * Salva itens em lote no cronograma.
 */
export async function saveScheduleItemsBatch(
  items: UserScheduleItem[],
  userId?: string | null
): Promise<UserScheduleItem[]> {
  const local = readLocalScheduleCache(userId);
  const existingMap = new Map(local.items.map((i) => [i.id, i]));
  for (const it of items) existingMap.set(it.id, it);
  local.items = Array.from(existingMap.values());
  writeLocalScheduleCache(userId, local);

  if (userId && userId !== 'demo-student' && items.length > 0) {
    try {
      const supabase = createClient();
      const dbRows: DbScheduleItemRow[] = items.map((i) => ({
        id: i.id,
        schedule_id: i.scheduleId,
        user_id: userId,
        especialidade: i.especialidade,
        tema: i.tema,
        foco: i.foco,
        scheduled_date: i.scheduledDate,
        item_type: i.itemType,
        is_completed: i.isCompleted,
        completed_at: i.completedAt || null,
        order_index: i.orderIndex,
        notes: i.notes || null,
        updated_at: new Date().toISOString()
      }));
      await supabase.from('user_schedule_items').upsert(dbRows);
    } catch (err) {
      console.warn('[studyScheduleService] Falha ao persistir itens no Supabase:', err);
    }
  }

  return items;
}

/**
 * Move um item para outra data (Drag-and-Drop ou adiamento).
 */
export async function moveScheduleItem(
  itemId: string,
  newDate: string,
  newOrderIndex?: number,
  userId?: string | null
): Promise<boolean> {
  const local = readLocalScheduleCache(userId);
  const target = local.items.find((i) => i.id === itemId);
  if (!target) return false;

  target.scheduledDate = newDate;
  if (newOrderIndex !== undefined) target.orderIndex = newOrderIndex;
  target.updatedAt = new Date().toISOString();
  writeLocalScheduleCache(userId, local);

  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      await supabase
        .from('user_schedule_items')
        .update({
          scheduled_date: newDate,
          order_index: target.orderIndex,
          updated_at: target.updatedAt
        })
        .eq('id', itemId)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('[studyScheduleService] Falha ao mover item no Supabase:', err);
    }
  }

  return true;
}

/**
 * Alterna a conclusão de um item agendado (estudo ou revisão).
 */
export async function toggleScheduleItemCompletion(
  itemId: string,
  isCompleted: boolean,
  userId?: string | null
): Promise<boolean> {
  const local = readLocalScheduleCache(userId);
  const target = local.items.find((i) => i.id === itemId);
  if (!target) return false;

  target.isCompleted = isCompleted;
  target.completedAt = isCompleted ? new Date().toISOString() : null;
  target.updatedAt = new Date().toISOString();
  writeLocalScheduleCache(userId, local);

  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      await supabase
        .from('user_schedule_items')
        .update({
          is_completed: target.isCompleted,
          completed_at: target.completedAt,
          updated_at: target.updatedAt
        })
        .eq('id', itemId)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('[studyScheduleService] Falha ao atualizar conclusão no Supabase:', err);
    }
  }

  return true;
}

/**
 * Atualiza o progresso global de um foco (marcação de estudado, revisões, etc.).
 */
export async function upsertFocusProgress(
  data: {
    especialidade: string;
    tema: string;
    foco: string;
    isStudied?: boolean;
    reviewCount?: number;
    nextReviewDate?: string | null;
    notes?: string | null;
  },
  userId?: string | null
): Promise<UserFocusProgress> {
  const focusKey = buildFocusKey(data.especialidade, data.tema, data.foco);
  const local = readLocalScheduleCache(userId);
  const existing = local.focusProgress[focusKey];

  const now = new Date().toISOString();
  const updated: UserFocusProgress = {
    id: existing?.id || `fprog_${focusKey}`,
    userId: userId || 'guest',
    focusKey,
    especialidade: data.especialidade,
    tema: data.tema,
    foco: data.foco,
    isStudied: data.isStudied !== undefined ? data.isStudied : existing?.isStudied ?? false,
    firstStudiedAt: data.isStudied ? existing?.firstStudiedAt || now : existing?.firstStudiedAt,
    reviewCount: data.reviewCount !== undefined ? data.reviewCount : existing?.reviewCount ?? 0,
    lastReviewedAt: existing?.lastReviewedAt,
    nextReviewDate: data.nextReviewDate !== undefined ? data.nextReviewDate : existing?.nextReviewDate,
    notes: data.notes !== undefined ? data.notes : existing?.notes,
    updatedAt: now
  };

  local.focusProgress[focusKey] = updated;
  writeLocalScheduleCache(userId, local);

  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      const payload: DbFocusProgressRow = {
        id: updated.id,
        user_id: userId,
        focus_key: updated.focusKey,
        especialidade: updated.especialidade,
        tema: updated.tema,
        foco: updated.foco,
        is_studied: updated.isStudied,
        first_studied_at: updated.firstStudiedAt || null,
        review_count: updated.reviewCount,
        last_reviewed_at: updated.lastReviewedAt || null,
        next_review_date: updated.nextReviewDate || null,
        notes: updated.notes || null,
        updated_at: updated.updatedAt
      };
      await supabase.from('user_focus_progress').upsert(payload, { onConflict: 'user_id,focus_key' });
    } catch (err) {
      console.warn('[studyScheduleService] Falha ao persistir progresso no Supabase:', err);
    }
  }

  return updated;
}

/**
 * Remove um item do cronograma.
 */
export async function deleteScheduleItem(itemId: string, userId?: string | null): Promise<boolean> {
  const local = readLocalScheduleCache(userId);
  local.items = local.items.filter((i) => i.id !== itemId);
  writeLocalScheduleCache(userId, local);

  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      await supabase.from('user_schedule_items').delete().eq('id', itemId).eq('user_id', userId);
    } catch (err) {
      console.warn('[studyScheduleService] Falha ao deletar item no Supabase:', err);
    }
  }

  return true;
}
