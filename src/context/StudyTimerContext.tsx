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
import { DailyScheduleSlot } from '@/components/dashboard/scheduleTypes';

const TIMER_STORAGE_KEY = 'bancoresidencia_study_timer_state';
const SESSIONS_STORAGE_KEY = 'bancoresidencia_study_sessions';

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
 * Evita o clássico bug de deslocamento de dia ao usar .toISOString().split('T')[0] à noite (21h-23h59).
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

interface StoredTimerState {
  status: 'running' | 'paused';
  accumulatedSeconds: number;
  runningSince: number | null; // timestamp ms
  sessionStartTime: string;
  selectedTaxonomy: SelectedTaxonomy;
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

  // Refs de controle temporal preciso (resiliente contra throttling de background)
  const accumulatedSecondsRef = useRef<number>(0);
  const runningSinceRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Lista de sessões salvas
  const [savedSessions, setSavedSessions] = useState<StudySession[]>([]);

  // Contadores dinâmicos de questões da sessão em andamento (Zero-Touch)
  const [sessionQuestionsCount, setSessionQuestionsCount] = useState<number>(0);
  const [sessionCorrectCount, setSessionCorrectCount] = useState<number>(0);
  const [sessionIncorrectCount, setSessionIncorrectCount] = useState<number>(0);
  const sessionQuestionsCountRef = useRef<number>(0);
  const sessionCorrectCountRef = useRef<number>(0);
  const sessionIncorrectCountRef = useRef<number>(0);
  const activeStudyTypeRef = useRef<StudyType>('questoes');
  const sessionSourceRef = useRef<'manual' | 'questoes' | 'simulado' | 'flashcards'>('manual');

  // Carrega sessões anteriores do localStorage
  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (storedSessions) {
        setSavedSessions(JSON.parse(storedSessions));
      }
    } catch (err) {
      console.warn('Erro ao carregar sessões de estudo do localStorage:', err);
    }
  }, []);

  // Recupera estado salvo do timer ao montar (resiliência a F5)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TIMER_STORAGE_KEY);
      if (!raw) return;

      const saved: StoredTimerState = JSON.parse(raw);
      if (!saved) return;

      setSelectedTaxonomy(saved.selectedTaxonomy || {});
      setSessionStartTime(saved.sessionStartTime || new Date().toISOString());

      if (saved.status === 'running' && saved.runningSince) {
        const deltaSec = Math.max(0, Math.floor((Date.now() - saved.runningSince) / 1000));
        const total = (saved.accumulatedSeconds || 0) + deltaSec;
        accumulatedSecondsRef.current = total;
        runningSinceRef.current = Date.now();
        setElapsedSeconds(total);
        setStatus('running');
      } else if (saved.status === 'paused') {
        accumulatedSecondsRef.current = saved.accumulatedSeconds || 0;
        runningSinceRef.current = null;
        setElapsedSeconds(saved.accumulatedSeconds || 0);
        setStatus('paused');
      }
    } catch (err) {
      console.warn('Erro ao restaurar estado do cronômetro:', err);
    }
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

  // Persistência contínua do estado no localStorage
  useEffect(() => {
    if (status === 'running' || status === 'paused') {
      const stateToSave: StoredTimerState = {
        status: status === 'running' ? 'running' : 'paused',
        accumulatedSeconds: accumulatedSecondsRef.current,
        runningSince: runningSinceRef.current,
        sessionStartTime: sessionStartTime || new Date().toISOString(),
        selectedTaxonomy
      };
      try {
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(stateToSave));
      } catch { }
    } else if (status === 'idle') {
      try {
        localStorage.removeItem(TIMER_STORAGE_KEY);
      } catch { }
    }
  }, [status, selectedTaxonomy, sessionStartTime]);

  // Sincronização em tempo real do título da aba (document.title - padrão Aprovado)
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
  const startTimer = useCallback((taxonomyOverride?: SelectedTaxonomy) => {
    const nowIso = new Date().toISOString();
    accumulatedSecondsRef.current = 0;
    runningSinceRef.current = Date.now();

    setElapsedSeconds(0);
    setSessionStartTime(nowIso);

    if (taxonomyOverride) {
      setSelectedTaxonomy(taxonomyOverride);
    }
    setStatus('running');
  }, []);

  // Pausar Cronômetro (congela tempo líquido)
  const pauseTimer = useCallback(() => {
    if (runningSinceRef.current) {
      const deltaSec = Math.max(0, Math.floor((Date.now() - runningSinceRef.current) / 1000));
      accumulatedSecondsRef.current += deltaSec;
      runningSinceRef.current = null;
    }
    setElapsedSeconds(accumulatedSecondsRef.current);
    setStatus('paused');
  }, []);

  // Continuar / Retomar Cronômetro
  const resumeTimer = useCallback(() => {
    runningSinceRef.current = Date.now();
    setStatus('running');
  }, []);

  // Cancelar e resetar para o zero sem salvar
  const cancelTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    accumulatedSecondsRef.current = 0;
    runningSinceRef.current = null;
    setElapsedSeconds(0);
    setStatus('idle');
    try {
      localStorage.removeItem(TIMER_STORAGE_KEY);
    } catch { }
  }, []);

  // Modal de Salvar
  const openSaveModal = useCallback(() => {
    // Garante pausa no tempo antes de abrir
    if (status === 'running') {
      if (runningSinceRef.current) {
        const deltaSec = Math.max(0, Math.floor((Date.now() - runningSinceRef.current) / 1000));
        accumulatedSecondsRef.current += deltaSec;
        runningSinceRef.current = null;
      }
      setElapsedSeconds(accumulatedSecondsRef.current);
    }
    setStatus('modal_saving');
  }, [status]);

  const closeSaveModal = useCallback(() => {
    // Retorna ao estado pausado caso o modal seja cancelado/fechado sem salvar
    setStatus('paused');
  }, []);

  // Salvar sessão e integrar com Agenda / Storage
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
        userId: userRef.current?.id,
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

      // 1. Atualiza lista de sessões no estado e localStorage de forma funcional e segura
      setSavedSessions((prev) => {
        const updated = [newSession, ...prev];
        try {
          localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
        } catch (err) {
          console.warn('Erro ao salvar sessão no localStorage:', err);
        }
        return updated;
      });

      // 2. Integra diretamente na Agenda (`bancoresidencia_user_scheduled_tasks`)
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

        const existingTasksJson = localStorage.getItem('bancoresidencia_user_scheduled_tasks');
        const existingTasks: DailyScheduleSlot[] = existingTasksJson ? JSON.parse(existingTasksJson) : [];
        const newTasks = [scheduleSlot, ...existingTasks];
        localStorage.setItem('bancoresidencia_user_scheduled_tasks', JSON.stringify(newTasks));

        // Dispara evento de storage para sincronizar abas e telas da Agenda instantaneamente
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'bancoresidencia_user_scheduled_tasks',
            newValue: JSON.stringify(newTasks)
          })
        );
      } catch (agendaErr) {
        console.warn('Erro ao integrar sessão na Agenda:', agendaErr);
      }

      // 3. Reseta contadores e cronômetro
      setSessionQuestionsCount(0);
      setSessionCorrectCount(0);
      setSessionIncorrectCount(0);
      sessionQuestionsCountRef.current = 0;
      sessionCorrectCountRef.current = 0;
      sessionIncorrectCountRef.current = 0;
      sessionSourceRef.current = 'manual';
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

      // Inicia a contagem do tempo imediatamente
      accumulatedSecondsRef.current = 0;
      runningSinceRef.current = Date.now();
      setElapsedSeconds(0);
      const nowIso = new Date().toISOString();
      setSessionStartTime(nowIso);
      sessionStartTimeRef.current = nowIso;
      setStatus('running');
      statusRef.current = 'running';

      try {
        localStorage.setItem(
          TIMER_STORAGE_KEY,
          JSON.stringify({
            status: 'running',
            accumulatedSeconds: 0,
            runningSince: Date.now(),
            sessionStartTime: nowIso,
            selectedTaxonomy: taxonomy
          })
        );
      } catch {}
    },
    []
  );

  // Registrar resposta de questão na sessão ativa
  const recordQuestionAnswer = useCallback((isCorrect: boolean) => {
    setSessionQuestionsCount((prev) => {
      const next = prev + 1;
      sessionQuestionsCountRef.current = next;
      return next;
    });

    if (isCorrect) {
      setSessionCorrectCount((prev) => {
        const next = prev + 1;
        sessionCorrectCountRef.current = next;
        return next;
      });
    } else {
      setSessionIncorrectCount((prev) => {
        const next = prev + 1;
        sessionIncorrectCountRef.current = next;
        return next;
      });
    }
  }, []);

  // Encerramento silencioso ao sair da tela de resolução (Zero-Touch)
  const autoFinishQuestionSession = useCallback(
    async (customNotes?: string): Promise<StudySession | null> => {
      const curStatus = statusRef.current;
      // Se não estava rodando ou em contagem, ou se já está em processo de salvamento, não faz nada
      if ((curStatus !== 'running' && curStatus !== 'paused') || isSavingRef.current) {
        return null;
      }

      isSavingRef.current = true;

      try {
        // Calcula tempo total cronometrado até o momento
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
          setSessionQuestionsCount(0);
          setSessionCorrectCount(0);
          setSessionIncorrectCount(0);
          sessionQuestionsCountRef.current = 0;
          sessionCorrectCountRef.current = 0;
          sessionIncorrectCountRef.current = 0;
          sessionSourceRef.current = 'manual';
          return null;
        }

        // Garante ao menos 1 segundo se respondeu questões para não zerar tempo líquido
        if (finalSecs <= 0) {
          finalSecs = Math.max(1, qTotal * 5);
          accumulatedSecondsRef.current = finalSecs;
        }

        // Salva silenciosamente com os dados da sessão
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

  // Excluir uma sessão realizada
  const deleteSession = useCallback((sessionId: string) => {
    setSavedSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      try {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch { }
      return updated;
    });

    // Remove também da linha do tempo da agenda se estiver lá
    try {
      const existingTasksJson = localStorage.getItem('bancoresidencia_user_scheduled_tasks');
      if (existingTasksJson) {
        const existingTasks: DailyScheduleSlot[] = JSON.parse(existingTasksJson);
        const filteredTasks = existingTasks.filter((t) => t.id !== `task_${sessionId}`);
        localStorage.setItem('bancoresidencia_user_scheduled_tasks', JSON.stringify(filteredTasks));
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'bancoresidencia_user_scheduled_tasks',
          newValue: JSON.stringify(filteredTasks)
        }));
      }
    } catch { }
  }, []);

  // Adiciona manualmente uma sessão de estudo (Novo Bloco)
  const addManualSession = useCallback(
    async (data: {
      taxonomy: SelectedTaxonomy;
      startTime: string; // "HH:mm" ou ISO
      endTime: string;   // "HH:mm" ou ISO
      date?: string;     // "YYYY-MM-DD"
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
        eDate = new Date(sDate.getTime() + 60 * 60 * 1000); // 1 hora de fallback
        endIso = eDate.toISOString();
      }

      const diffSec = Math.max(60, Math.floor((eDate.getTime() - sDate.getTime()) / 1000));
      const formattedDuration = formatSecondsToHms(diffSec);

      const activeTaxonomy = data.taxonomy || {};
      const totalQ = data.questionsCount || 0;
      const correctQ = data.correctCount || 0;
      const incorrectQ = Math.max(0, totalQ - correctQ);
      const acc = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : undefined;

      const newSession: StudySession = {
        id: `sess_manual_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: userRef.current?.id,
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

      setSavedSessions((prev) => {
        const updated = [newSession, ...prev];
        try {
          localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
        } catch (err) {
          console.warn('Erro ao salvar sessão manual no localStorage:', err);
        }
        return updated;
      });

      try {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: SESSIONS_STORAGE_KEY,
            newValue: JSON.stringify([newSession, ...savedSessions])
          })
        );
      } catch { }

      return newSession;
    },
    [savedSessions]
  );

  // Auto-cura de tarefas agendadas salvas com fuso UTC deslocado
  useEffect(() => {
    try {
      const rawTasks = localStorage.getItem('bancoresidencia_user_scheduled_tasks');
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
        localStorage.setItem('bancoresidencia_user_scheduled_tasks', JSON.stringify(fixedTasks));
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'bancoresidencia_user_scheduled_tasks',
          newValue: JSON.stringify(fixedTasks)
        }));
      }
    } catch (err) {
      console.warn('Erro na sincronização de datas de tarefas:', err);
    }
  }, [savedSessions]);

  // Sessões e tempo total do dia de hoje (respeitando o fuso horário local do estudante)
  const todayStr = useMemo(() => {
    return getLocalDateStr(new Date());
  }, []);

  const todaySessions = useMemo(() => {
    return savedSessions.filter((s) => {
      if (!s.startTime) return false;
      return getLocalDateStr(s.startTime) === todayStr;
    });
  }, [savedSessions, todayStr]);

  const todayTotalSeconds = useMemo(() => {
    return todaySessions.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
  }, [todaySessions]);

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
    setSelectedTaxonomy,
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
    addManualSession
  };

  return (
    <StudyTimerContext.Provider value={value}>
      {children}
    </StudyTimerContext.Provider>
  );
};

export const useStudyTimer = (): StudyTimerContextType => {
  const context = useContext(StudyTimerContext);
  if (!context) {
    throw new Error('useStudyTimer deve ser utilizado dentro de um StudyTimerProvider');
  }
  return context;
};
