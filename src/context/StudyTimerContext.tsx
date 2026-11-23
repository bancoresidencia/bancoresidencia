'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo
} from 'react';
import {
  TimerStatus,
  StudyType,
  SelectedTaxonomy,
  StudySession,
  StudyTimerContextType
} from '@/types/studyTimer';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { DailyScheduleSlot } from '@/components/dashboard/scheduleTypes';
import {
  loadUserStudySessions,
  saveUserStudySession,
  deleteUserStudySession,
  getUserStudySessionsStorageKey
} from '@/services/userStudySessionsService';
import {
  saveUserScheduledTask,
  deleteUserScheduledTask,
  getUserScheduledTasksStorageKey
} from '@/services/userScheduledTasksService';
import {
  PersistedTimerState,
  getUserTimerStateStorageKey,
  readLocalTimerState,
  writeLocalTimerState,
  clearLocalTimerState,
  readLocalPlatformActiveSeconds,
  writeLocalPlatformActiveSeconds,
  loadUserTimerRuntime,
  syncTimerRuntimeToCloud
} from '@/services/userTimerRuntimeService';

export function formatSecondsToHms(totalSec: number): string {
  if (isNaN(totalSec) || totalSec < 0) return '00:00:00';
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatSecondsToShort(totalSec: number): string {
  if (isNaN(totalSec) || totalSec < 0) return '0s';
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * Converte qualquer entrada de data (Date, timestamp ms, string ISO ou YYYY-MM-DD)
 * em uma string "YYYY-MM-DD" estritamente alinhada ao FUSO HORÁRIO LOCAL do usuário (ex: América/São Paulo, UTC-3).
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

const StudyTimerContext = createContext<StudyTimerContextType | undefined>(undefined);

export const StudyTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Estados fundamentais
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<SelectedTaxonomy>({});
  const [sessionStartTime, setSessionStartTime] = useState<string>('');

  // Refs de sincronização e estabilidade de callbacks
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const statusRef = useRef<TimerStatus>(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const selectedTaxonomyRef = useRef<SelectedTaxonomy>(selectedTaxonomy);
  useEffect(() => {
    selectedTaxonomyRef.current = selectedTaxonomy;
  }, [selectedTaxonomy]);

  const sessionStartTimeRef = useRef<string>(sessionStartTime);
  useEffect(() => {
    sessionStartTimeRef.current = sessionStartTime;
  }, [sessionStartTime]);

  const isSavingRef = useRef<boolean>(false);
  const lastLocalMutationMsRef = useRef<number>(0);
  const cloudTimerDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Refs de controle temporal preciso (resiliente contra throttling de background)
  const accumulatedSecondsRef = useRef<number>(0);
  const runningSinceRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Lista de sessões salvas
  const [savedSessions, setSavedSessions] = useState<StudySession[]>([]);

  // Contadores dinâmicos de questões da sessão em andamento (Zero-Touch + Resiliente a F5)
  const [sessionQuestionsCount, setSessionQuestionsCount] = useState<number>(0);
  const [sessionCorrectCount, setSessionCorrectCount] = useState<number>(0);
  const [sessionIncorrectCount, setSessionIncorrectCount] = useState<number>(0);
  const sessionQuestionsCountRef = useRef<number>(0);
  const sessionCorrectCountRef = useRef<number>(0);
  const sessionIncorrectCountRef = useRef<number>(0);
  const activeStudyTypeRef = useRef<StudyType>('questoes');
  const sessionSourceRef = useRef<'manual' | 'questoes' | 'simulado' | 'flashcards'>('manual');

  // Rastreamento Contínuo e Sincronizado em Nuvem de Tempo Ativo na Plataforma
  const [platformActiveSeconds, setPlatformActiveSeconds] = useState<number>(0);
  const platformActiveRef = useRef<number>(0);
  useEffect(() => {
    platformActiveRef.current = platformActiveSeconds;
  }, [platformActiveSeconds]);

  // Aplica um estado persistido (local ou nuvem) ao cronômetro em memória
  const applyRestoredTimerState = useCallback((saved: PersistedTimerState) => {
    setSelectedTaxonomy(saved.selectedTaxonomy || {});
    selectedTaxonomyRef.current = saved.selectedTaxonomy || {};

    const startIso = saved.sessionStartTime || new Date().toISOString();
    setSessionStartTime(startIso);
    sessionStartTimeRef.current = startIso;

    activeStudyTypeRef.current = saved.studyType || 'questoes';
    sessionSourceRef.current = saved.sessionSource || 'manual';

    const qCount = saved.questionsCount || 0;
    const cCount = saved.correctCount || 0;
    const iCount = saved.incorrectCount || 0;
    setSessionQuestionsCount(qCount);
    setSessionCorrectCount(cCount);
    setSessionIncorrectCount(iCount);
    sessionQuestionsCountRef.current = qCount;
    sessionCorrectCountRef.current = cCount;
    sessionIncorrectCountRef.current = iCount;

    if (saved.status === 'running' && saved.runningSince) {
      const deltaSec = Math.max(0, Math.floor((Date.now() - saved.runningSince) / 1000));
      const total = (saved.accumulatedSeconds || 0) + deltaSec;
      accumulatedSecondsRef.current = total;
      runningSinceRef.current = Date.now();
      setElapsedSeconds(total);
      setStatus('running');
      statusRef.current = 'running';
    } else if (saved.status === 'paused') {
      const pausedTotal = saved.accumulatedSeconds || 0;
      accumulatedSecondsRef.current = pausedTotal;
      runningSinceRef.current = null;
      setElapsedSeconds(pausedTotal);
      setStatus('paused');
      statusRef.current = 'paused';
    }
  }, []);

  // Persiste estado completo do cronômetro em andamento (local por userId + Supabase)
  const persistCurrentTimerState = useCallback(
    (nextStatus: 'running' | 'paused', syncMode: 'immediate' | 'debounced' | 'local_only' = 'immediate') => {
      const uid = userRef.current?.id;
      const nowMs = Date.now();
      lastLocalMutationMsRef.current = nowMs;

      const snapshot: PersistedTimerState = {
        userId: uid || 'guest',
        status: nextStatus,
        accumulatedSeconds: accumulatedSecondsRef.current,
        runningSince: nextStatus === 'running' ? runningSinceRef.current : null,
        sessionStartTime: sessionStartTimeRef.current || new Date().toISOString(),
        selectedTaxonomy: selectedTaxonomyRef.current,
        studyType: activeStudyTypeRef.current || 'questoes',
        sessionSource: sessionSourceRef.current || 'manual',
        questionsCount: sessionQuestionsCountRef.current,
        correctCount: sessionCorrectCountRef.current,
        incorrectCount: sessionIncorrectCountRef.current,
        updatedAtMs: nowMs
      };

      writeLocalTimerState(snapshot, uid);

      if (syncMode === 'local_only' || !uid || uid === 'demo-student') return;

      if (cloudTimerDebounceRef.current) {
        clearTimeout(cloudTimerDebounceRef.current);
        cloudTimerDebounceRef.current = null;
      }

      if (syncMode === 'immediate') {
        syncTimerRuntimeToCloud({ activeTimerState: snapshot }, uid).catch(() => {});
      } else {
        cloudTimerDebounceRef.current = setTimeout(() => {
          syncTimerRuntimeToCloud({ activeTimerState: snapshot }, userRef.current?.id).catch(() => {});
        }, 2000);
      }
    },
    []
  );

  // Reseta estado apenas em memória (usado na troca de conta/logout sem apagar nuvem da outra conta)
  const resetInMemoryTimerOnly = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    accumulatedSecondsRef.current = 0;
    runningSinceRef.current = null;
    setElapsedSeconds(0);
    setStatus('idle');
    statusRef.current = 'idle';
    setSessionQuestionsCount(0);
    setSessionCorrectCount(0);
    setSessionIncorrectCount(0);
    sessionQuestionsCountRef.current = 0;
    sessionCorrectCountRef.current = 0;
    sessionIncorrectCountRef.current = 0;
    sessionSourceRef.current = 'manual';
  }, []);

  // Sincronização unificada de Sessões + Tempo Ativo Diário + Timer em Andamento por Conta (Local + Supabase)
  useEffect(() => {
    let active = true;
    const uid = user?.id;
    const currentTodayStr = getLocalDateStr(new Date());

    // 1. Isola imediatamente os contadores para o usuário atual (evita vazamento entre contas)
    const initialLocalActive = readLocalPlatformActiveSeconds(uid, currentTodayStr);
    platformActiveRef.current = initialLocalActive;
    setPlatformActiveSeconds(initialLocalActive);

    const localTimer = readLocalTimerState(uid);
    if (localTimer) {
      applyRestoredTimerState(localTimer);
    } else {
      resetInMemoryTimerOnly();
    }

    const syncAllFromAccount = async (targetUid?: string | null) => {
      const [sessions, runtime] = await Promise.all([
        loadUserStudySessions(targetUid),
        loadUserTimerRuntime(targetUid, getLocalDateStr(new Date()))
      ]);

      if (!active) return;

      setSavedSessions(sessions);

      const mergedActive = Math.max(platformActiveRef.current, runtime.todayActiveSeconds);
      if (mergedActive !== platformActiveRef.current) {
        platformActiveRef.current = mergedActive;
        setPlatformActiveSeconds(mergedActive);
      }

      if (
        runtime.activeTimerState &&
        !isSavingRef.current &&
        (statusRef.current === 'idle' ||
          runtime.activeTimerState.updatedAtMs > lastLocalMutationMsRef.current)
      ) {
        applyRestoredTimerState(runtime.activeTimerState);
      }
    };

    syncAllFromAccount(uid);

    // 2. Escuta eventos de autenticação do Supabase (resolve corrida quando token OAuth/refresh hidrata depois do cache)
    const supabase = createClient();
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (
        (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') &&
        session?.user?.id
      ) {
        if (!uid || session.user.id === uid) {
          syncAllFromAccount(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setSavedSessions([]);
        platformActiveRef.current = 0;
        setPlatformActiveSeconds(0);
        resetInMemoryTimerOnly();
      }
    });

    // 3. Sincronia instantânea entre múltiplas abas do mesmo navegador
    const handleStorageChange = (e: StorageEvent) => {
      const currentSessionsKey = getUserStudySessionsStorageKey(uid);
      if (e.key === currentSessionsKey && e.newValue) {
        try {
          setSavedSessions(JSON.parse(e.newValue));
        } catch {}
      }
      const currentTimerKey = getUserTimerStateStorageKey(uid);
      if (e.key === currentTimerKey) {
        if (!e.newValue) {
          resetInMemoryTimerOnly();
        } else {
          try {
            const parsed = JSON.parse(e.newValue) as PersistedTimerState;
            if (parsed && (parsed.status === 'running' || parsed.status === 'paused')) {
              applyRestoredTimerState(parsed);
            }
          } catch {}
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      active = false;
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user?.id, applyRestoredTimerState, resetInMemoryTimerOnly]);

  // Heartbeat do tempo ativo na plataforma: salva localmente a cada 5s e no Supabase a cada 30s + ao ocultar/fechar aba
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lastInteraction = Date.now();
    const IDLE_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutos sem interação pausa a contagem

    const markInteraction = () => {
      lastInteraction = Date.now();
    };

    window.addEventListener('mousemove', markInteraction, { passive: true });
    window.addEventListener('keydown', markInteraction, { passive: true });
    window.addEventListener('scroll', markInteraction, { passive: true });
    window.addEventListener('touchstart', markInteraction, { passive: true });
    window.addEventListener('click', markInteraction, { passive: true });

    let localSaveCounter = 0;
    let cloudSyncCounter = 0;

    const flushActiveTime = (keepalive = false) => {
      const uid = userRef.current?.id;
      const dateStr = getLocalDateStr(new Date());
      const currentSecs = platformActiveRef.current;
      writeLocalPlatformActiveSeconds(uid, dateStr, currentSecs);
      if (uid && uid !== 'demo-student' && currentSecs > 0) {
        syncTimerRuntimeToCloud(
          { dateStr, activeSeconds: currentSecs },
          uid,
          keepalive
        ).catch(() => {});
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        flushActiveTime(true);
      }
    };

    const handlePageHide = () => {
      flushActiveTime(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      if (Date.now() - lastInteraction > IDLE_THRESHOLD_MS) return;

      const prev = platformActiveRef.current;
      const updated = prev + 1;
      platformActiveRef.current = updated;
      if (Math.floor(updated / 60) !== Math.floor(prev / 60)) {
        setPlatformActiveSeconds(updated);
      }

      localSaveCounter++;
      cloudSyncCounter++;

      if (localSaveCounter >= 5) {
        localSaveCounter = 0;
        writeLocalPlatformActiveSeconds(
          userRef.current?.id,
          getLocalDateStr(new Date()),
          updated
        );
      }

      if (cloudSyncCounter >= 30) {
        cloudSyncCounter = 0;
        flushActiveTime(false);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', markInteraction);
      window.removeEventListener('keydown', markInteraction);
      window.removeEventListener('scroll', markInteraction);
      window.removeEventListener('touchstart', markInteraction);
      window.removeEventListener('click', markInteraction);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      flushActiveTime(true);
    };
  }, []);

  // Tique-taque contínuo do cronômetro
  useEffect(() => {
    if (status === 'running') {
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        if (runningSinceRef.current) {
          const deltaSec = Math.max(0, Math.floor((Date.now() - runningSinceRef.current) / 1000));
          const currentTotal = accumulatedSecondsRef.current + deltaSec;
          setElapsedSeconds(currentTotal);
        }
      }, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status]);

  // Atualiza taxonomia e sincroniza caso o cronômetro já esteja ativo
  const handleSetSelectedTaxonomy = useCallback(
    (tax: SelectedTaxonomy) => {
      setSelectedTaxonomy(tax);
      selectedTaxonomyRef.current = tax;
      if (statusRef.current === 'running' || statusRef.current === 'paused') {
        persistCurrentTimerState(statusRef.current, 'debounced');
      }
    },
    [persistCurrentTimerState]
  );

  // Sincronização em tempo real do título da aba (document.title)
  useEffect(() => {
    const originalTitle = 'Banco Residência — Questões & Residência Médica';
    const activeLabel =
      selectedTaxonomy.subfoco ||
      selectedTaxonomy.foco ||
      selectedTaxonomy.tema ||
      selectedTaxonomy.especialidade ||
      'Estudo';

    if (status === 'running') {
      document.title = `${formatSecondsToShort(elapsedSeconds)} - ${activeLabel} | Banco Residência`;
    } else if (status === 'paused') {
      document.title = `❙❙ ${formatSecondsToShort(elapsedSeconds)} - ${activeLabel} | Banco Residência`;
    } else {
      document.title = originalTitle;
    }

    return () => {
      document.title = originalTitle;
    };
  }, [status, elapsedSeconds, selectedTaxonomy]);

  // Iniciar Cronômetro (sempre do zero a cada sessão)
  const startTimer = useCallback(
    (taxonomyOverride?: SelectedTaxonomy) => {
      const nowIso = new Date().toISOString();
      accumulatedSecondsRef.current = 0;
      runningSinceRef.current = Date.now();
      sessionSourceRef.current = 'manual';
      activeStudyTypeRef.current = 'questoes';

      setSessionQuestionsCount(0);
      setSessionCorrectCount(0);
      setSessionIncorrectCount(0);
      sessionQuestionsCountRef.current = 0;
      sessionCorrectCountRef.current = 0;
      sessionIncorrectCountRef.current = 0;

      setElapsedSeconds(0);
      setSessionStartTime(nowIso);
      sessionStartTimeRef.current = nowIso;

      if (taxonomyOverride) {
        setSelectedTaxonomy(taxonomyOverride);
        selectedTaxonomyRef.current = taxonomyOverride;
      }
      setStatus('running');
      statusRef.current = 'running';

      persistCurrentTimerState('running', 'immediate');
    },
    [persistCurrentTimerState]
  );

  // Pausar Cronômetro (congela tempo líquido)
  const pauseTimer = useCallback(() => {
    if (runningSinceRef.current) {
      const deltaSec = Math.max(0, Math.floor((Date.now() - runningSinceRef.current) / 1000));
      accumulatedSecondsRef.current += deltaSec;
      runningSinceRef.current = null;
    }
    setElapsedSeconds(accumulatedSecondsRef.current);
    setStatus('paused');
    statusRef.current = 'paused';

    persistCurrentTimerState('paused', 'immediate');
  }, [persistCurrentTimerState]);

  // Continuar / Retomar Cronômetro
  const resumeTimer = useCallback(() => {
    runningSinceRef.current = Date.now();
    setStatus('running');
    statusRef.current = 'running';

    persistCurrentTimerState('running', 'immediate');
  }, [persistCurrentTimerState]);

  // Cancelar e resetar para o zero sem salvar (limpa local + nuvem)
  const cancelTimer = useCallback(() => {
    if (cloudTimerDebounceRef.current) {
      clearTimeout(cloudTimerDebounceRef.current);
      cloudTimerDebounceRef.current = null;
    }
    lastLocalMutationMsRef.current = Date.now();
    resetInMemoryTimerOnly();
    const uid = userRef.current?.id;
    clearLocalTimerState(uid);
    syncTimerRuntimeToCloud({ activeTimerState: null }, uid, true).catch(() => {});
  }, [resetInMemoryTimerOnly]);

  // Modal de Salvar
  const openSaveModal = useCallback(() => {
    if (statusRef.current === 'running') {
      if (runningSinceRef.current) {
        const deltaSec = Math.max(0, Math.floor((Date.now() - runningSinceRef.current) / 1000));
        accumulatedSecondsRef.current += deltaSec;
        runningSinceRef.current = null;
      }
      setElapsedSeconds(accumulatedSecondsRef.current);
      persistCurrentTimerState('paused', 'immediate');
    }
    setStatus('modal_saving');
    statusRef.current = 'modal_saving';
  }, [persistCurrentTimerState]);

  const closeSaveModal = useCallback(() => {
    setStatus('paused');
    statusRef.current = 'paused';
  }, []);

  // Salvar sessão e integrar com Agenda / Supabase
  const saveSession = useCallback(
    async (data: {
      studyType?: StudyType;
      questionsCount?: number;
      correctCount?: number;
      incorrectCount?: number;
      accuracy?: number;
      sessionSource?: 'manual' | 'questoes' | 'simulado' | 'flashcards';
      notes?: string;
    }): Promise<StudySession> => {
      const uid = userRef.current?.id;
      const endTimeIso = new Date().toISOString();
      const finalDuration = accumulatedSecondsRef.current;
      const formatted = formatSecondsToHms(finalDuration);

      const activeTaxonomy = selectedTaxonomyRef.current;
      const topicTitle =
        activeTaxonomy.rawLabel ||
        activeTaxonomy.subfoco ||
        activeTaxonomy.foco ||
        activeTaxonomy.tema ||
        activeTaxonomy.especialidade ||
        'Estudo Livre';

      const totalQ = data.questionsCount !== undefined ? data.questionsCount : sessionQuestionsCountRef.current;
      const correctQ = data.correctCount !== undefined ? data.correctCount : sessionCorrectCountRef.current;
      const incorrectQ =
        data.incorrectCount !== undefined
          ? data.incorrectCount
          : sessionIncorrectCountRef.current > 0
          ? sessionIncorrectCountRef.current
          : Math.max(0, totalQ - correctQ);
      const acc =
        data.accuracy !== undefined
          ? data.accuracy
          : totalQ > 0
          ? Math.round((correctQ / totalQ) * 100)
          : undefined;

      const newSession: StudySession = {
        id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: uid,
        startTime: sessionStartTimeRef.current || endTimeIso,
        endTime: endTimeIso,
        durationSeconds: finalDuration,
        durationFormatted: formatted,
        taxonomy: activeTaxonomy,
        studyType: data.studyType || activeStudyTypeRef.current || 'questoes',
        questionsCount: totalQ,
        correctCount: correctQ,
        incorrectCount: incorrectQ,
        accuracy: acc,
        sessionSource: data.sessionSource || sessionSourceRef.current,
        notes: data.notes || '',
        createdAt: endTimeIso
      };

      // 1. Atualiza lista de sessões no estado e persiste na conta do aluno (local + Supabase)
      setSavedSessions((prev) => [newSession, ...prev.filter((s) => s.id !== newSession.id)]);
      saveUserStudySession(newSession, uid).catch((err) => {
        console.warn('Erro ao salvar sessão na conta do aluno:', err);
      });

      // 2. Integra diretamente na Agenda vinculada à conta do aluno
      try {
        const startDate = new Date(newSession.startTime);
        const endDate = new Date(newSession.endTime);
        const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
        const endMinutes = Math.max(startMinutes + 1, endDate.getHours() * 60 + endDate.getMinutes());

        let questionsSummary = '';
        if (totalQ > 0) {
          questionsSummary = ` ${totalQ} questões (${correctQ} acertos, ${incorrectQ} erros • ${acc}% de aproveitamento).`;
        }

        const scheduleSlot: DailyScheduleSlot = {
          id: `task_${newSession.id}`,
          title: topicTitle === 'Treino Geral' ? 'Treino Geral de Questões' : `Estudo: ${topicTitle}`,
          category: 'estudo',
          startTime: `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`,
          endTime: `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`,
          startMinutes,
          endMinutes,
          source: 'plataforma',
          description: `Tempo líquido: ${formatted}.${questionsSummary}${data.notes ? ` Obs: ${data.notes}` : ''}`,
          action: 'treinar',
          date: getLocalDateStr(startDate)
        };

        saveUserScheduledTask(scheduleSlot, uid).catch((err) => {
          console.warn('Erro ao salvar tarefa na conta do aluno:', err);
        });

        const tasksKey = getUserScheduledTasksStorageKey(uid);
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: tasksKey
          })
        );
      } catch (agendaErr) {
        console.warn('Erro ao integrar sessão na Agenda:', agendaErr);
      }

      // 3. Reseta contadores e limpa cronômetro em andamento (local + nuvem)
      cancelTimer();

      return newSession;
    },
    [cancelTimer]
  );

  // Iniciar sessão automatizada pelo Banco de Questões (Zero-Touch)
  const startQuestionSession = useCallback(
    (taxonomy: SelectedTaxonomy, studyType: StudyType = 'questoes') => {
      setSelectedTaxonomy(taxonomy);
      selectedTaxonomyRef.current = taxonomy;
      activeStudyTypeRef.current = studyType;
      sessionSourceRef.current = 'questoes';
      setSessionQuestionsCount(0);
      setSessionCorrectCount(0);
      setSessionIncorrectCount(0);
      sessionQuestionsCountRef.current = 0;
      sessionCorrectCountRef.current = 0;
      sessionIncorrectCountRef.current = 0;

      accumulatedSecondsRef.current = 0;
      runningSinceRef.current = Date.now();
      setElapsedSeconds(0);
      const nowIso = new Date().toISOString();
      setSessionStartTime(nowIso);
      sessionStartTimeRef.current = nowIso;
      setStatus('running');
      statusRef.current = 'running';

      persistCurrentTimerState('running', 'immediate');
    },
    [persistCurrentTimerState]
  );

  // Registrar resposta de questão na sessão ativa (persiste imediatamente contra F5)
  const recordQuestionAnswer = useCallback(
    (isCorrect: boolean) => {
      const nextTotal = sessionQuestionsCountRef.current + 1;
      sessionQuestionsCountRef.current = nextTotal;
      setSessionQuestionsCount(nextTotal);

      if (isCorrect) {
        const nextCorrect = sessionCorrectCountRef.current + 1;
        sessionCorrectCountRef.current = nextCorrect;
        setSessionCorrectCount(nextCorrect);
      } else {
        const nextIncorrect = sessionIncorrectCountRef.current + 1;
        sessionIncorrectCountRef.current = nextIncorrect;
        setSessionIncorrectCount(nextIncorrect);
      }

      if (statusRef.current === 'running' || statusRef.current === 'paused') {
        persistCurrentTimerState(statusRef.current, 'debounced');
      }
    },
    [persistCurrentTimerState]
  );

  // Encerramento silencioso ao sair da tela de resolução (Zero-Touch)
  const autoFinishQuestionSession = useCallback(
    async (customNotes?: string): Promise<StudySession | null> => {
      const curStatus = statusRef.current;
      if ((curStatus !== 'running' && curStatus !== 'paused') || isSavingRef.current) {
        return null;
      }

      isSavingRef.current = true;

      try {
        let finalSecs = accumulatedSecondsRef.current;
        if (curStatus === 'running' && runningSinceRef.current) {
          finalSecs += Math.max(0, Math.floor((Date.now() - runningSinceRef.current) / 1000));
          accumulatedSecondsRef.current = finalSecs;
        }

        const qTotal = sessionQuestionsCountRef.current;
        const qCorrect = sessionCorrectCountRef.current;
        const qIncorrect = sessionIncorrectCountRef.current;

        // Regra do Usuário: Descarta se nenhuma questão foi respondida (qTotal === 0)
        if (qTotal === 0) {
          cancelTimer();
          return null;
        }

        if (finalSecs <= 0) {
          finalSecs = Math.max(1, qTotal * 5);
          accumulatedSecondsRef.current = finalSecs;
        }

        return await saveSession({
          studyType: activeStudyTypeRef.current || 'questoes',
          questionsCount: qTotal,
          correctCount: qCorrect,
          incorrectCount: qIncorrect,
          sessionSource: 'questoes',
          notes: customNotes
        });
      } finally {
        isSavingRef.current = false;
      }
    },
    [saveSession, cancelTimer]
  );

  // Excluir uma sessão realizada da conta do aluno
  const deleteSession = useCallback((sessionId: string) => {
    setSavedSessions((prev) => prev.filter((s) => s.id !== sessionId));
    deleteUserStudySession(sessionId, userRef.current?.id).catch((err) => {
      console.warn('Erro ao excluir sessão do aluno:', err);
    });

    deleteUserScheduledTask(`task_${sessionId}`, userRef.current?.id).catch((err) => {
      console.warn('Erro ao excluir tarefa associada à sessão:', err);
    });
  }, []);

  // Adiciona manualmente uma sessão de estudo (Novo Bloco)
  const addManualSession = useCallback(
    async (data: {
      taxonomy: SelectedTaxonomy;
      startTime: string;
      endTime: string;
      date?: string;
      studyType?: StudyType;
      questionsCount?: number;
      correctCount?: number;
      notes?: string;
    }): Promise<StudySession> => {
      const targetDateStr = data.date || getLocalDateStr(new Date());

      let startIso = data.startTime;
      let endIso = data.endTime;

      if (/^\d{2}:\d{2}$/.test(data.startTime)) {
        const d = new Date(`${targetDateStr}T${data.startTime}:00`);
        startIso = isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
      }

      if (/^\d{2}:\d{2}$/.test(data.endTime)) {
        const d = new Date(`${targetDateStr}T${data.endTime}:00`);
        endIso = isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
      }

      const sDate = new Date(startIso);
      let eDate = new Date(endIso);
      if (eDate.getTime() <= sDate.getTime()) {
        eDate = new Date(sDate.getTime() + 60 * 60 * 1000);
        endIso = eDate.toISOString();
      }

      const diffSec = Math.max(60, Math.floor((eDate.getTime() - sDate.getTime()) / 1000));
      const formattedDuration = formatSecondsToHms(diffSec);

      const activeTaxonomy = data.taxonomy || {};
      const totalQ = data.questionsCount || 0;
      const correctQ = data.correctCount || 0;
      const incorrectQ = Math.max(0, totalQ - correctQ);
      const acc = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : undefined;

      const uid = userRef.current?.id;
      const newSession: StudySession = {
        id: `sess_manual_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: uid,
        startTime: startIso,
        endTime: endIso,
        durationSeconds: diffSec,
        durationFormatted: formattedDuration,
        taxonomy: activeTaxonomy,
        studyType: data.studyType || 'questoes',
        questionsCount: totalQ,
        correctCount: correctQ,
        incorrectCount: incorrectQ,
        accuracy: acc,
        sessionSource: 'manual',
        notes: data.notes || '',
        createdAt: new Date().toISOString()
      };

      setSavedSessions((prev) => [newSession, ...prev]);
      await saveUserStudySession(newSession, uid);

      try {
        const sessionsKey = getUserStudySessionsStorageKey(uid);
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: sessionsKey
          })
        );
      } catch {}

      return newSession;
    },
    []
  );

  // Auto-cura de tarefas automáticas com fuso UTC deslocado
  useEffect(() => {
    try {
      const tasksKey = getUserScheduledTasksStorageKey(user?.id);
      const rawTasks = localStorage.getItem(tasksKey);
      if (!rawTasks) return;
      const tasks: DailyScheduleSlot[] = JSON.parse(rawTasks);
      if (!Array.isArray(tasks) || tasks.length === 0) return;

      let modified = false;
      const fixedTasks = tasks.map((task) => {
        if (task.source === 'plataforma' && task.id.startsWith('task_sess_')) {
          const sessionId = task.id.replace('task_', '');
          const matchingSess = savedSessions.find((s) => s.id === sessionId);
          if (matchingSess?.startTime) {
            const correctDate = getLocalDateStr(matchingSess.startTime);
            if (correctDate && task.date !== correctDate) {
              modified = true;
              return { ...task, date: correctDate };
            }
          }
        }
        return task;
      });

      if (modified) {
        localStorage.setItem(tasksKey, JSON.stringify(fixedTasks));
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: tasksKey,
            newValue: JSON.stringify(fixedTasks)
          })
        );
      }
    } catch (err) {
      console.warn('Erro na sincronização de tarefas:', err);
    }
  }, [savedSessions, user?.id]);

  // Sessões e tempo total do dia de hoje (respeitando o fuso horário local do estudante)
  const todayStr = getLocalDateStr(new Date());

  const todaySessions = useMemo(() => {
    return savedSessions.filter((s) => {
      if (!s.startTime) return false;
      return getLocalDateStr(s.startTime) === todayStr;
    });
  }, [savedSessions, todayStr]);

  const sessionsTotalSeconds = useMemo(() => {
    return todaySessions.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
  }, [todaySessions]);

  const todayTotalSeconds = useMemo(() => {
    return sessionsTotalSeconds;
  }, [sessionsTotalSeconds]);

  const todayTotalFormatted = useMemo(() => {
    return formatSecondsToShort(todayTotalSeconds);
  }, [todayTotalSeconds]);

  const formattedTime = useMemo(() => {
    return formatSecondsToHms(elapsedSeconds);
  }, [elapsedSeconds]);

  const value: StudyTimerContextType = {
    status,
    elapsedSeconds,
    formattedTime,
    selectedTaxonomy,
    setSelectedTaxonomy: handleSetSelectedTaxonomy,
    startTimer,
    pauseTimer,
    resumeTimer,
    cancelTimer,
    openSaveModal,
    closeSaveModal,
    saveSession,
    sessionQuestionsCount,
    sessionCorrectCount,
    sessionIncorrectCount,
    startQuestionSession,
    recordQuestionAnswer,
    autoFinishQuestionSession,
    todaySessions,
    todayTotalSeconds,
    todayTotalFormatted,
    allSessions: savedSessions,
    deleteSession,
    platformActiveSeconds,
    addManualSession
  };

  return (
    <StudyTimerContext.Provider value={value}>
      {children}
    </StudyTimerContext.Provider>
  );
};

const DEFAULT_STUDY_TIMER_FALLBACK: StudyTimerContextType = {
  status: 'idle',
  elapsedSeconds: 0,
  formattedTime: '00:00:00',
  selectedTaxonomy: {},
  setSelectedTaxonomy: () => {},
  startTimer: () => {},
  pauseTimer: () => {},
  resumeTimer: () => {},
  cancelTimer: () => {},
  openSaveModal: () => {},
  closeSaveModal: () => {},
  saveSession: async () => ({
    id: '',
    startTime: '',
    endTime: '',
    durationSeconds: 0,
    durationFormatted: '00:00:00',
    taxonomy: {},
    studyType: 'outro',
    createdAt: ''
  }),
  sessionQuestionsCount: 0,
  sessionCorrectCount: 0,
  sessionIncorrectCount: 0,
  startQuestionSession: () => {},
  recordQuestionAnswer: () => {},
  autoFinishQuestionSession: async () => null,
  todaySessions: [],
  todayTotalSeconds: 0,
  todayTotalFormatted: '00:00:00',
  allSessions: [],
  deleteSession: () => {},
  platformActiveSeconds: 0,
  addManualSession: async () => ({
    id: '',
    startTime: '',
    endTime: '',
    durationSeconds: 0,
    durationFormatted: '00:00:00',
    taxonomy: {},
    studyType: 'outro',
    createdAt: ''
  })
};

export const useStudyTimer = (): StudyTimerContextType => {
  const context = useContext(StudyTimerContext);
  return context || DEFAULT_STUDY_TIMER_FALLBACK;
};
