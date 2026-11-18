import { createClient } from '@/lib/supabase/client';
import { DailyScheduleSlot, ScheduleCategory } from '@/components/dashboard/scheduleTypes';

interface DbScheduledTaskRow {
  id: string;
  user_id: string;
  title: string;
  category: ScheduleCategory;
  date: string;
  start_time: string;
  end_time: string;
  start_minutes: number;
  end_minutes: number;
  source: 'plataforma' | 'google';
  description?: string;
  is_calendar_task: boolean;
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

const LEGACY_SCHEDULED_TASKS_KEY = 'bancoresidencia_user_scheduled_tasks';

export function getUserScheduledTasksStorageKey(userId?: string | null): string {
  return userId ? `bancoresidencia_user_scheduled_tasks_${userId}` : 'bancoresidencia_user_scheduled_tasks_guest';
}

/**
 * Carrega as tarefas agendadas do aluno:
 * 1. Leitura imediata do cache local isolado por userId
 * 2. Migração única e limpeza definitiva da chave legada global
 * 3. Sincronização em nuvem com Supabase (user_scheduled_tasks) após validar sessão JWT
 */
export async function loadUserScheduledTasks(userId?: string | null): Promise<DailyScheduleSlot[]> {
  const key = getUserScheduledTasksStorageKey(userId);
  let localTasks: DailyScheduleSlot[] = [];

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved) as DailyScheduleSlot[];
        localTasks = Array.isArray(parsed) ? parsed : [];
      }

      // Migra chave legada global uma única vez e remove imediatamente
      const legacy = localStorage.getItem(LEGACY_SCHEDULED_TASKS_KEY);
      if (legacy) {
        localStorage.removeItem(LEGACY_SCHEDULED_TASKS_KEY);
        try {
          const parsedLegacy = JSON.parse(legacy) as DailyScheduleSlot[];
          if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
            const existingIds = new Set(localTasks.map((t) => t.id));
            const migrated = parsedLegacy.filter((t) => !existingIds.has(t.id));
            if (migrated.length > 0) {
              localTasks = [...localTasks, ...migrated];
              localStorage.setItem(key, JSON.stringify(localTasks));
            }
          }
        } catch {}
      }
    } catch {
      localTasks = [];
    }
    localTasks = localTasks.filter((t) => !t.isAiSuggested && !t.id.startsWith('ai_sug_'));
  }

  // Sincronização remota quando autenticado com JWT válido
  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      const {
        data: { session: authSession }
      } = await supabase.auth.getSession();

      if (!authSession?.user || authSession.user.id !== userId) {
        return localTasks;
      }

      const { data, error } = await supabase
        .from('user_scheduled_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true })
        .order('start_minutes', { ascending: true });

      if (error) {
        console.warn('[userScheduledTasksService] Erro ao consultar tarefas no Supabase:', error.message);
        return localTasks;
      }

      if (data) {
        const rows = data as unknown as DbScheduledTaskRow[];
        const remoteTasks: DailyScheduleSlot[] = rows.map((r) => ({
          id: r.id,
          title: r.title,
          category: r.category || 'estudo',
          date: r.date,
          startTime: r.start_time,
          endTime: r.end_time,
          startMinutes: r.start_minutes,
          endMinutes: r.end_minutes,
          source: r.source || 'plataforma',
          description: r.description || '',
          isCalendarTask: r.is_calendar_task,
          isCompleted: Boolean(r.is_completed),
          action: 'treinar'
        }));

        const remoteIds = new Set(remoteTasks.map((t) => t.id));
        const missingOnRemote = localTasks.filter((t) => !remoteIds.has(t.id));
        const merged = [
          ...remoteTasks.filter((t) => !t.isAiSuggested && !t.id.startsWith('ai_sug_')),
          ...missingOnRemote
        ];

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(key, JSON.stringify(merged));
          } catch {}
        }

        // Envia para o Supabase tarefas locais que ainda não estavam na nuvem
        if (missingOnRemote.length > 0) {
          const payload = missingOnRemote.map((t) => ({
            id: t.id,
            user_id: userId,
            title: t.title,
            category: t.category || 'estudo',
            date: t.date || new Date().toISOString().split('T')[0],
            start_time: t.startTime,
            end_time: t.endTime,
            start_minutes: t.startMinutes,
            end_minutes: t.endMinutes,
            source: t.source || 'plataforma',
            description: t.description || '',
            is_calendar_task: t.isCalendarTask ?? true,
            is_completed: Boolean(t.isCompleted),
            updated_at: new Date().toISOString()
          }));

          const { error: syncErr } = await supabase
            .from('user_scheduled_tasks')
            .upsert(payload, { onConflict: 'id' });

          if (syncErr) {
            console.warn('[userScheduledTasksService] Falha ao enviar tarefas pendentes:', syncErr.message);
          }
        }

        return merged;
      }
    } catch (err) {
      console.warn('[userScheduledTasksService] Erro ao sincronizar tarefas com Supabase:', err);
    }
  }

  return localTasks;
}

/**
 * Salva ou atualiza uma tarefa agendada:
 * Atualiza o storage local imediatamente e sincroniza no Supabase com fallback keepalive.
 */
export async function saveUserScheduledTask(task: DailyScheduleSlot, userId?: string | null): Promise<void> {
  const key = getUserScheduledTasksStorageKey(userId);

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(key);
      const list: DailyScheduleSlot[] = saved ? JSON.parse(saved) : [];
      const updated = [task, ...list.filter((t) => t.id !== task.id)];
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  }

  if (userId && userId !== 'demo-student') {
    let savedDirect = false;
    try {
      const supabase = createClient();
      const payload = {
        id: task.id,
        user_id: userId,
        title: task.title,
        category: task.category || 'estudo',
        date: task.date || new Date().toISOString().split('T')[0],
        start_time: task.startTime,
        end_time: task.endTime,
        start_minutes: task.startMinutes,
        end_minutes: task.endMinutes,
        source: task.source || 'plataforma',
        description: task.description || '',
        is_calendar_task: task.isCalendarTask ?? true,
        is_completed: Boolean(task.isCompleted),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_scheduled_tasks')
        .upsert(payload, { onConflict: 'id' });

      if (!error) {
        savedDirect = true;
      } else {
        console.warn('[userScheduledTasksService] Erro no upsert direto de tarefa:', error.message);
      }
    } catch (err) {
      console.warn('[userScheduledTasksService] Exceção no upsert remoto da tarefa:', err);
    }

    if (!savedDirect && typeof window !== 'undefined') {
      try {
        await fetch('/api/student/timer-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scheduledTask: task }),
          keepalive: true
        });
      } catch {}
    }
  }
}

/**
 * Exclui uma tarefa agendada local e remotamente no Supabase.
 */
export async function deleteUserScheduledTask(taskId: string, userId?: string | null): Promise<void> {
  const key = getUserScheduledTasksStorageKey(userId);

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const list: DailyScheduleSlot[] = JSON.parse(saved);
        const filtered = list.filter((t) => t.id !== taskId);
        localStorage.setItem(key, JSON.stringify(filtered));
      }
    } catch {}
  }

  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('user_scheduled_tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId);

      if (error) {
        console.warn('[userScheduledTasksService] Erro ao excluir tarefa remota:', error.message);
      }
    } catch (err) {
      console.warn('[userScheduledTasksService] Falha ao excluir tarefa remota:', err);
    }
  }
}

/**
 * Remove todas as tarefas agendadas do usuário.
 */
export async function clearAllUserScheduledTasks(userId?: string | null): Promise<void> {
  const key = getUserScheduledTasksStorageKey(userId);

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(key);
      localStorage.removeItem(LEGACY_SCHEDULED_TASKS_KEY);
    } catch {}
  }

  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('user_scheduled_tasks')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.warn('[userScheduledTasksService] Erro ao limpar tarefas remotas:', error.message);
      }
    } catch (err) {
      console.warn('[userScheduledTasksService] Falha ao limpar tarefas remotas:', err);
    }
  }
}
