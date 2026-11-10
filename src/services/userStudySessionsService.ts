import { createClient } from '@/lib/supabase/client';
import { StudySession, StudyType, SelectedTaxonomy } from '@/types/studyTimer';

interface DbStudySessionRow {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  taxonomy: SelectedTaxonomy;
  study_type: StudyType;
  questions_count?: number;
  correct_count?: number;
  incorrect_count?: number;
  accuracy?: number;
  session_source?: 'manual' | 'questoes' | 'simulado' | 'flashcards';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export function getUserStudySessionsStorageKey(userId?: string | null): string {
  return userId ? `bancoresidencia_study_sessions_${userId}` : 'bancoresidencia_study_sessions_guest';
}

function formatSecondsToHms(totalSec: number): string {
  if (isNaN(totalSec) || totalSec < 0) return '00:00:00';
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Carrega as sessões de estudo do aluno:
 * 1. Leitura imediata do cache local (0ms de latência)
 * 2. Migração automática da chave legada sem perder histórico
 * 3. Sincronização em nuvem com Supabase (user_study_sessions) para multi-dispositivo
 */
export async function loadUserStudySessions(userId?: string | null): Promise<StudySession[]> {
  const key = getUserStudySessionsStorageKey(userId);
  let localSessions: StudySession[] = [];

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        localSessions = JSON.parse(saved) as StudySession[];
      } else {
        // Tenta migrar da chave legada global se existir
        const legacy = localStorage.getItem('bancoresidencia_study_sessions');
        if (legacy) {
          try {
            const parsedLegacy = JSON.parse(legacy) as StudySession[];
            if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
              localSessions = parsedLegacy.map(s => ({
                ...s,
                userId: userId || s.userId
              }));
              localStorage.setItem(key, JSON.stringify(localSessions));
            }
          } catch {}
        }
      }
    } catch {
      localSessions = [];
    }
  }

  // Sincronização remota quando autenticado
  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_study_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false });

      if (!error && data) {
        const rows = data as unknown as DbStudySessionRow[];
        const remoteSessions: StudySession[] = rows.map((r) => ({
          id: r.id,
          userId: r.user_id,
          startTime: r.start_time,
          endTime: r.end_time,
          durationSeconds: r.duration_seconds,
          durationFormatted: formatSecondsToHms(r.duration_seconds),
          taxonomy: r.taxonomy || {},
          studyType: r.study_type || 'questoes',
          questionsCount: r.questions_count || 0,
          correctCount: r.correct_count || 0,
          incorrectCount: r.incorrect_count || 0,
          accuracy: r.accuracy,
          sessionSource: r.session_source || 'manual',
          notes: r.notes || '',
          createdAt: r.created_at || r.end_time
        }));

        const remoteIds = new Set(remoteSessions.map((s) => s.id));
        const missingOnRemote = localSessions.filter((s) => !remoteIds.has(s.id));
        const merged = [...remoteSessions, ...missingOnRemote];

        if (typeof window !== 'undefined') {
          localStorage.setItem(key, JSON.stringify(merged));
        }

        // Envia para o Supabase as sessões locais que ainda não estavam na nuvem
        if (missingOnRemote.length > 0) {
          const payload = missingOnRemote.map((s) => ({
            id: s.id,
            user_id: userId,
            start_time: s.startTime,
            end_time: s.endTime,
            duration_seconds: s.durationSeconds,
            taxonomy: s.taxonomy || {},
            study_type: s.studyType || 'questoes',
            questions_count: s.questionsCount || 0,
            correct_count: s.correctCount || 0,
            incorrect_count: s.incorrectCount || 0,
            accuracy: s.accuracy || null,
            session_source: s.sessionSource || 'manual',
            notes: s.notes || null,
            created_at: s.createdAt || new Date().toISOString()
          }));
          supabase.from('user_study_sessions').upsert(payload, { onConflict: 'id' }).then(() => {});
        }

        return merged;
      }
    } catch (err) {
      console.warn('[userStudySessionsService] Erro ao sincronizar com Supabase:', err);
    }
  }

  return localSessions;
}

/**
 * Salva ou atualiza uma sessão de estudo:
 * Atualiza o storage local imediatamente e sincroniza em background no Supabase.
 */
export async function saveUserStudySession(session: StudySession, userId?: string | null): Promise<void> {
  const key = getUserStudySessionsStorageKey(userId);

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(key);
      const list: StudySession[] = saved ? JSON.parse(saved) : [];
      const updated = [session, ...list.filter((s) => s.id !== session.id)];
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  }

  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      const payload = {
        id: session.id,
        user_id: userId,
        start_time: session.startTime,
        end_time: session.endTime,
        duration_seconds: session.durationSeconds,
        taxonomy: session.taxonomy || {},
        study_type: session.studyType || 'questoes',
        questions_count: session.questionsCount || 0,
        correct_count: session.correctCount || 0,
        incorrect_count: session.incorrectCount || 0,
        accuracy: session.accuracy ?? null,
        session_source: session.sessionSource || 'manual',
        notes: session.notes || null,
        created_at: session.createdAt || new Date().toISOString()
      };

      await supabase.from('user_study_sessions').upsert(payload, { onConflict: 'id' });
    } catch (err) {
      console.warn('[userStudySessionsService] Falha no upsert remoto da sessão:', err);
    }
  }
}

/**
 * Exclui uma sessão de estudo local e remotamente no Supabase.
 */
export async function deleteUserStudySession(sessionId: string, userId?: string | null): Promise<void> {
  const key = getUserStudySessionsStorageKey(userId);

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const list: StudySession[] = JSON.parse(saved);
        const filtered = list.filter((s) => s.id !== sessionId);
        localStorage.setItem(key, JSON.stringify(filtered));
      }
    } catch {}
  }

  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      await supabase
        .from('user_study_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('[userStudySessionsService] Falha ao excluir sessão remota:', err);
    }
  }
}

