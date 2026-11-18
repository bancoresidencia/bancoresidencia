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

const LEGACY_SESSIONS_KEY = 'bancoresidencia_study_sessions';

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

function sortSessionsDesc(list: StudySession[]): StudySession[] {
  return [...list].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
}

/**
 * Carrega as sessões de estudo do aluno:
 * 1. Leitura imediata do cache local isolado por userId
 * 2. Migração segura e remoção definitiva da chave legada global
 * 3. Sincronização bidirecional com Supabase (user_study_sessions) após validar sessão JWT ativa
 */
export async function loadUserStudySessions(userId?: string | null): Promise<StudySession[]> {
  const key = getUserStudySessionsStorageKey(userId);
  let localSessions: StudySession[] = [];

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved) as StudySession[];
        localSessions = Array.isArray(parsed) ? parsed : [];
      }

      // Migra chave legada global uma única vez e a remove para evitar vazamento entre contas
      const legacy = localStorage.getItem(LEGACY_SESSIONS_KEY);
      if (legacy) {
        localStorage.removeItem(LEGACY_SESSIONS_KEY);
        try {
          const parsedLegacy = JSON.parse(legacy) as StudySession[];
          if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
            const compatible = parsedLegacy.filter(
              (s) => !s.userId || s.userId === userId
            );
            if (compatible.length > 0) {
              const existingIds = new Set(localSessions.map((s) => s.id));
              const migrated = compatible
                .filter((s) => !existingIds.has(s.id))
                .map((s) => ({ ...s, userId: userId || s.userId }));
              localSessions = sortSessionsDesc([...localSessions, ...migrated]);
              localStorage.setItem(key, JSON.stringify(localSessions));
            }
          }
        } catch {}
      }
    } catch {
      localSessions = [];
    }
  }

  // Sincronização remota quando autenticado com sessão JWT ativa no Supabase
  if (userId && userId !== 'demo-student') {
    try {
      const supabase = createClient();
      const {
        data: { session: authSession }
      } = await supabase.auth.getSession();

      // Evita condição de corrida durante hidratação inicial do token OAuth/refresh
      if (!authSession?.user || authSession.user.id !== userId) {
        return localSessions;
      }

      const { data, error } = await supabase
        .from('user_study_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false });

      if (error) {
        console.warn('[userStudySessionsService] Erro ao consultar sessões no Supabase:', error.message);
        return localSessions;
      }

      if (data) {
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
          accuracy: r.accuracy !== null && r.accuracy !== undefined ? Number(r.accuracy) : undefined,
          sessionSource: r.session_source || 'manual',
          notes: r.notes || '',
          createdAt: r.created_at || r.end_time
        }));

        const remoteIds = new Set(remoteSessions.map((s) => s.id));
        const missingOnRemote = localSessions.filter(
          (s) => !remoteIds.has(s.id) && (!s.userId || s.userId === userId)
        );
        const merged = sortSessionsDesc([...remoteSessions, ...missingOnRemote]);

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(key, JSON.stringify(merged));
          } catch {}
        }

        // Envia para o Supabase as sessões locais que ainda não estavam na nuvem
        if (missingOnRemote.length > 0) {
          const payload = missingOnRemote.map((s) => ({
            id: s.id,
            user_id: userId,
            start_time: s.startTime,
            end_time: s.endTime,
            duration_seconds: Math.max(0, Math.floor(s.durationSeconds || 0)),
            taxonomy: s.taxonomy || {},
            study_type: s.studyType || 'questoes',
            questions_count: s.questionsCount || 0,
            correct_count: s.correctCount || 0,
            incorrect_count: s.incorrectCount || 0,
            accuracy: s.accuracy ?? null,
            session_source: s.sessionSource || 'manual',
            notes: s.notes || null,
            created_at: s.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));

          const { error: syncErr } = await supabase
            .from('user_study_sessions')
            .upsert(payload, { onConflict: 'id' });

          if (syncErr) {
            console.warn('[userStudySessionsService] Falha ao sincronizar sessões pendentes:', syncErr.message);
          }
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
 * Atualiza o storage local imediatamente e persiste no Supabase com fallback keepalive.
 */
export async function saveUserStudySession(
  session: StudySession,
  userId?: string | null
): Promise<void> {
  const key = getUserStudySessionsStorageKey(userId);
  const stampedSession: StudySession = {
    ...session,
    userId: userId || session.userId
  };

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(key);
      const list: StudySession[] = saved ? JSON.parse(saved) : [];
      const updated = sortSessionsDesc([
        stampedSession,
        ...list.filter((s) => s.id !== stampedSession.id)
      ]);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  }

  if (userId && userId !== 'demo-student') {
    let savedDirect = false;
    try {
      const supabase = createClient();
      const payload = {
        id: stampedSession.id,
        user_id: userId,
        start_time: stampedSession.startTime,
        end_time: stampedSession.endTime,
        duration_seconds: Math.max(0, Math.floor(stampedSession.durationSeconds || 0)),
        taxonomy: stampedSession.taxonomy || {},
        study_type: stampedSession.studyType || 'questoes',
        questions_count: stampedSession.questionsCount || 0,
        correct_count: stampedSession.correctCount || 0,
        incorrect_count: stampedSession.incorrectCount || 0,
        accuracy: stampedSession.accuracy ?? null,
        session_source: stampedSession.sessionSource || 'manual',
        notes: stampedSession.notes || null,
        created_at: stampedSession.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_study_sessions')
        .upsert(payload, { onConflict: 'id' });

      if (!error) {
        savedDirect = true;
      } else {
        console.warn('[userStudySessionsService] Erro no upsert direto, acionando fallback keepalive:', error.message);
      }
    } catch (err) {
      console.warn('[userStudySessionsService] Exceção no upsert remoto da sessão:', err);
    }

    // Fallback resiliente via Route Handler keepalive (sobrevive a fechamento de aba / navegação)
    if (!savedDirect && typeof window !== 'undefined') {
      try {
        await fetch('/api/student/timer-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ finishedSession: stampedSession }),
          keepalive: true
        });
      } catch {}
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
      const { error } = await supabase
        .from('user_study_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (error) {
        console.warn('[userStudySessionsService] Erro ao excluir sessão remota:', error.message);
      }
    } catch (err) {
      console.warn('[userStudySessionsService] Falha ao excluir sessão remota:', err);
    }
  }
}
