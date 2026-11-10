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

export function getUserScheduledTasksStorageKey(userId?: string | null): string {
  return userId ? `bancoresidencia_user_scheduled_tasks_${userId}` : 'bancoresidencia_user_scheduled_tasks_guest';
}

/**
 * Carrega as tarefas agendadas do aluno:
 * 1. Leitura imediata do cache local do usuário (0ms de latência)
 * 2. Migração automática da chave legada sem perda de dados
 * 3. Sincronização em nuvem com Supabase (user_scheduled_tasks)
 */
export async function loadUserScheduledTasks(userId?: string | null): Promise<DailyScheduleSlot[]> {
  const key = getUserScheduledTasksStorageKey(userId);
  let localTasks: DailyScheduleSlot[] = [];

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        localTasks = JSON.parse(saved) as DailyScheduleSlot[];
      } else {
        // Tenta migrar da chave legada global se existir
        const legacy = localStorage.getItem('bancoresidencia_user_scheduled_tasks');
        if (legacy) {
          try {
            const parsedLegacy = JSON.parse(legacy) as DailyScheduleSlot[];
            if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
              localTasks = parsedLegacy;
              localStorage.setItem(key, JSON.stringify(localTasks));
            }
          } catch {}
        }
      }
    } catch {
      localTasks = [];
    }
  }

  // Sincronização remota quando autenticado
  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_scheduled_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true })
        .order('start_minutes', { ascending: true });

      if (!error && data) {
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
          action: 'treinar'
        }));

        const remoteIds = new Set(remoteTasks.map((t) => t.id));
        const missingOnRemote = localTasks.filter((t) => !remoteIds.has(t.id));
        const merged = [...remoteTasks, ...missingOnRemote];

        if (typeof window !== 'undefined') {
          localStorage.setItem(key, JSON.stringify(merged));
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
            is_completed: false,
            updated_at: new Date().toISOString()
          }));
          supabase.from('user_scheduled_tasks').upsert(payload, { onConflict: 'id' }).then(() => {});
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
 * Atualiza o storage local imediatamente e sincroniza em background no Supabase.
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
        is_completed: false,
        updated_at: new Date().toISOString()
      };

      await supabase.from('user_scheduled_tasks').upsert(payload, { onConflict: 'id' });
    } catch (err) {
      console.warn('[userScheduledTasksService] Falha no upsert remoto da tarefa:', err);
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
      await supabase
        .from('user_scheduled_tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId);
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
    } catch {}
  }

  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      await supabase
        .from('user_scheduled_tasks')
        .delete()
        .eq('user_id', userId);
    } catch (err) {
      console.warn('[userScheduledTasksService] Falha ao limpar tarefas remotas:', err);
    }
  }
}

