'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  UserStats,
  UserAnswerItem,
  Folder,
  QuestionList,
  AdvancedFilterState,
  PerformanceFilterState,
  ErrorReasonType,
  UserAttempt
} from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
  loadUserFolders,
  saveUserFolders,
  loadUserLists,
  saveUserLists,
  deleteUserListFromDb,
  deleteUserFolderFromDb,
  getFolderStorageKey,
  getListStorageKey,
  readLocalFolders,
  readLocalLists,
  reconcileUserFoldersWithRemote,
  reconcileUserListsWithRemote
} from '@/services/userListsService';
import { calculatePercentile } from '@/utils/percentile';
import {
  loadUserBookmarks,
  toggleUserBookmark,
  getBookmarksStorageKey,
  readLocalBookmarks,
  reconcileUserBookmarksWithRemote
} from '@/services/userBookmarksService';
import { fetchQuestionsFromSupabase } from '@/services/questionService';
import { createClient } from '@/lib/supabase/client';
import { getLocalDateStr } from '@/context/StudyTimerContext';
import {
  setCloudSyncState,
  onImmediateCloudSyncRequest
} from '@/utils/crossDeviceSync';

interface StudentDataContextType {
  userAnswers: Record<string, UserAnswerItem>;
  sessionAnswers: Record<string, { letter: 'A' | 'B' | 'C' | 'D' | 'E'; isCorrect: boolean }>;
  stats: UserStats;
  pendingErrorsCount: number;
  dailyGoal: number;
  customDailyGoal: number | null;
  updateDailyGoal: (newGoal: number) => void;
  folders: Folder[];
  lists: QuestionList[];
  activeListId: string | null;
  setActiveListId: (id: string | null) => void;
  createFolder: (name: string, parentId: string | null) => Promise<void>;
  renameFolder: (folderId: string, newName: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  createListWithFilters: (
    title: string,
    folderId: string | null,
    totalQuestions: number,
    appliedFilters: AdvancedFilterState,
    questionIds?: string[]
  ) => Promise<QuestionList | null>;
  editList: (listId: string, newTitle: string, newFolderId?: string | null) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  addQuestionToFolder: (questionId: string, folderId: string, folderName: string) => Promise<void>;
  bookmarkedQuestionIds: Record<string, boolean>;
  toggleBookmark: (questionId: string) => Promise<void>;
  fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  setFontSize: (size: 'xs' | 'sm' | 'base' | 'lg' | 'xl') => void;
  performanceFilters: PerformanceFilterState;
  setPerformanceFilters: React.Dispatch<React.SetStateAction<PerformanceFilterState>>;
  handleResetPerformanceFilters: () => void;
  recordAnswer: (
    questionId: string,
    selectedLetter: 'A' | 'B' | 'C' | 'D' | 'E',
    isCorrect: boolean,
    metadata?: Partial<UserAnswerItem>
  ) => void;
  updateAnswerMeta: (
    questionId: string,
    meta: {
      errorReason?: ErrorReasonType;
      studentNotes?: string;
      statusRetrial?: 'pendente' | 'recuperado';
    }
  ) => void;
  refreshUserData: () => Promise<void>;
}

const StudentDataContext = createContext<StudentDataContextType | undefined>(undefined);

export const StudentDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Storage key com namespace do aluno
  const getUserAnswersStorageKey = useCallback((userId?: string | null) => {
    return userId ? `bancoresidencia_user_answers_${userId}` : 'bancoresidencia_user_answers_guest';
  }, []);

  // Respostas do usuário (hidratação determinística; carregadas no useEffect)
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswerItem>>({});
  const userAnswersRef = useRef(userAnswers);
  useEffect(() => {
    userAnswersRef.current = userAnswers;
  }, [userAnswers]);

  const [sessionAnswers, setSessionAnswers] = useState<
    Record<string, { letter: 'A' | 'B' | 'C' | 'D' | 'E'; isCorrect: boolean }>
  >({});

  // Sincronização e Reconciliação SWR com o Supabase (com paginação de 1.000 em 1.000 registros)
  const syncUserAnswersFromSupabase = useCallback(async (userId?: string | null, preloadedRows?: Record<string, unknown>[]) => {
    if (!userId || userId === 'demo-student' || typeof window === 'undefined') return;

    try {
      const supabase = createClient();
      let remoteRows = preloadedRows;
      if (!remoteRows) {
        const {
          data: { session: authSession }
        } = await supabase.auth.getSession();
        if (!authSession?.user || authSession.user.id !== userId) return;

        const allFetched: Record<string, unknown>[] = [];
        const PAGE_SIZE = 1000;
        let fromOffset = 0;

        while (true) {
          const { data, error } = await supabase
            .from('user_answers')
            .select(
              'question_id, selected_option, is_correct, answered_at, specialty, tema, foco, subfoco, difficulty, banca, year, status_retrial, error_reason, student_notes, attempts'
            )
            .eq('user_id', userId)
            .order('answered_at', { ascending: true })
            .range(fromOffset, fromOffset + PAGE_SIZE - 1);

          if (error) return;
          if (!data || data.length === 0) break;
          allFetched.push(...(data as Record<string, unknown>[]));
          if (data.length < PAGE_SIZE) break;
          fromOffset += PAGE_SIZE;
        }
        remoteRows = allFetched;
      }

      setUserAnswers((currentLocal) => {
        const merged: Record<string, UserAnswerItem> = { ...currentLocal };
        let hasChanges = false;
        const missingOnRemote: Array<UserAnswerItem & { questionId: string }> = [];

        for (const rawRow of remoteRows) {
          const row = rawRow as {
            question_id?: string;
            selected_option?: string;
            is_correct?: boolean;
            answered_at?: string;
            specialty?: string | null;
            tema?: string | null;
            foco?: string | null;
            subfoco?: string | null;
            difficulty?: UserAnswerItem['difficulty'] | null;
            banca?: string | null;
            year?: number | null;
            error_reason?: ErrorReasonType | null;
            student_notes?: string | null;
            status_retrial?: 'pendente' | 'recuperado' | null;
            attempts?: Array<{ letter: 'A' | 'B' | 'C' | 'D' | 'E'; isCorrect: boolean; timestamp: number }>;
          };
          const qid = row.question_id;
          if (!qid) continue;

          const local = merged[qid];
          const remoteTime = row.answered_at ? new Date(row.answered_at).getTime() : Date.now();
          const remoteLetter = (row.selected_option as 'A' | 'B' | 'C' | 'D' | 'E') || 'A';
          const remoteAttempts = Array.isArray(row.attempts) && row.attempts.length > 0
            ? row.attempts
            : [{ letter: remoteLetter, isCorrect: Boolean(row.is_correct), timestamp: remoteTime }];

          if (!local) {
            merged[qid] = {
              letter: remoteLetter,
              isCorrect: Boolean(row.is_correct),
              timestamp: remoteTime,
              difficulty: row.difficulty || 'Médio',
              isAnulada: false,
              specialty: row.specialty || undefined,
              tema: row.tema || undefined,
              foco: row.foco || undefined,
              subfoco: row.subfoco || undefined,
              banca: row.banca || undefined,
              year: row.year || undefined,
              errorReason: row.error_reason || undefined,
              studentNotes: row.student_notes || undefined,
              statusRetrial: row.status_retrial || (!row.is_correct ? 'pendente' : undefined),
              attempts: remoteAttempts
            };
            hasChanges = true;
          } else {
            const localTime = local.timestamp || 0;
            const mergedAttempts = (() => {
              const combinedMap = new Map<string, { letter: 'A' | 'B' | 'C' | 'D' | 'E'; isCorrect: boolean; timestamp: number }>();
              for (const a of (local.attempts || [])) {
                if (a && a.timestamp) combinedMap.set(`${a.timestamp}_${a.letter}`, a);
              }
              for (const a of remoteAttempts) {
                if (a && a.timestamp) combinedMap.set(`${a.timestamp}_${a.letter}`, a);
              }
              return Array.from(combinedMap.values()).sort((a, b) => a.timestamp - b.timestamp);
            })();

            if (remoteTime >= localTime) {
              const nextErrorReason = row.error_reason || local.errorReason;
              const nextNotes = row.student_notes || local.studentNotes;
              merged[qid] = {
                ...local,
                letter: remoteLetter || local.letter,
                isCorrect: row.is_correct !== undefined ? Boolean(row.is_correct) : local.isCorrect,
                timestamp: Math.max(remoteTime, localTime),
                difficulty: row.difficulty || local.difficulty || 'Médio',
                specialty: row.specialty || local.specialty,
                tema: row.tema || local.tema,
                foco: row.foco || local.foco,
                subfoco: row.subfoco || local.subfoco,
                banca: row.banca || local.banca,
                year: row.year || local.year,
                errorReason: nextErrorReason,
                studentNotes: nextNotes,
                statusRetrial: row.status_retrial || local.statusRetrial,
                attempts: mergedAttempts
              };
              hasChanges = true;

              // Se o dispositivo local tinha notas ou motivo de erro que ainda não subiram, envia ao banco
              if ((local.studentNotes && !row.student_notes) || (local.errorReason && !row.error_reason)) {
                missingOnRemote.push({ ...merged[qid], questionId: qid });
              }
            } else {
              const updatedLocal: UserAnswerItem = {
                ...local,
                errorReason: local.errorReason || row.error_reason || undefined,
                studentNotes: local.studentNotes || row.student_notes || undefined,
                attempts: mergedAttempts
              };
              merged[qid] = updatedLocal;
              hasChanges = true;
              missingOnRemote.push({ ...updatedLocal, questionId: qid });
            }
          }
        }

        // Detecta respostas locais que faltam no banco remoto (ex: resolvidas offline no celular)
        const remoteIds = new Set(
          remoteRows.map((r) => (r as { question_id?: string }).question_id).filter(Boolean)
        );
        for (const [qid, ans] of Object.entries(merged)) {
          if (!remoteIds.has(qid)) {
            missingOnRemote.push({ ...ans, questionId: qid });
          }
        }

        if (hasChanges) {
          try {
            const key = getUserAnswersStorageKey(userId);
            localStorage.setItem(key, JSON.stringify(merged));
          } catch { }
        }

        // Upload em lotes de até 500 respostas locais pendentes para o Supabase
        if (missingOnRemote.length > 0) {
          const payload = missingOnRemote.map((a) => ({
            user_id: userId,
            question_id: a.questionId,
            selected_option: a.letter,
            is_correct: a.isCorrect,
            answered_at: new Date(a.timestamp || Date.now()).toISOString(),
            specialty: a.specialty || 'Clínica Médica',
            tema: a.tema || 'Geral',
            foco: a.foco || null,
            subfoco: a.subfoco || null,
            difficulty: a.difficulty || 'Médio',
            banca: a.banca || 'Geral',
            year: a.year ? Number(a.year) : 2024,
            error_reason: a.errorReason || null,
            student_notes: a.studentNotes || null,
            status_retrial: a.statusRetrial || (!a.isCorrect ? 'pendente' : null),
            attempts: a.attempts || []
          }));

          for (let i = 0; i < payload.length; i += 500) {
            const chunk = payload.slice(i, i + 500);
            supabase
              .from('user_answers')
              .upsert(chunk, { onConflict: 'user_id,question_id' })
              .then(({ error: upErr }) => {
                if (upErr) console.warn('[StudentDataContext] Aviso ao sincronizar respostas pendentes no Supabase:', upErr);
              }, () => { });
          }
        }

        return hasChanges ? merged : currentLocal;
      });
    } catch (e) {
      console.warn('[StudentDataContext] Falha na sincronização SWR de respostas:', e);
    }
  }, [getUserAnswersStorageKey]);

  // Pastas, Listas e Favoritos
  const [folders, setFolders] = useState<Folder[]>([]);
  const [lists, setLists] = useState<QuestionList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState<Record<string, boolean>>({});

  // Metas diárias com namespace por usuário e sincronização em nuvem
  const [customDailyGoal, setCustomDailyGoal] = useState<number | null>(null);
  const dailyGoal = customDailyGoal ?? user?.dailyGoal ?? 30;

  const getDailyGoalStorageKey = useCallback((uid?: string | null) => {
    return uid ? `bancoresidencia_custom_daily_goal_${uid}` : 'bancoresidencia_custom_daily_goal_guest';
  }, []);

  // Hidratação instantânea do cache local (0ms, funciona 100% offline) isolada por conta
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storageKey = getUserAnswersStorageKey(user?.id);
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, UserAnswerItem>;
        if (parsed && typeof parsed === 'object') {
          setUserAnswers(parsed);
        }
      } else if (!user?.id) {
        const fallbackRaw = localStorage.getItem('bancoresidencia_user_answers');
        if (fallbackRaw) {
          localStorage.removeItem('bancoresidencia_user_answers');
          const parsed = JSON.parse(fallbackRaw) as Record<string, UserAnswerItem>;
          if (parsed && typeof parsed === 'object') {
            setUserAnswers(parsed);
            localStorage.setItem(storageKey, JSON.stringify(parsed));
          }
        } else {
          setUserAnswers({});
        }
      } else {
        setUserAnswers({});
      }

      // Hidrata pastas, listas, favoritos e meta diária imediatamente do cache local
      setFolders(readLocalFolders(user?.id));
      setLists(readLocalLists(user?.id));
      setBookmarkedQuestionIds(readLocalBookmarks(user?.id));

      const savedGoal = localStorage.getItem(getDailyGoalStorageKey(user?.id));
      if (savedGoal && !Number.isNaN(Number(savedGoal))) {
        setCustomDailyGoal(Number(savedGoal));
      } else {
        setCustomDailyGoal(null);
      }
    } catch (e) {
      console.warn('Erro ao hidratar cache local do estudante:', e);
    }
  }, [user?.id, getUserAnswersStorageKey, getDailyGoalStorageKey]);

  const isSyncingRef = useRef(false);
  const lastSyncTimestampRef = useRef<number>(0);

  // Tamanho de Fonte (declarado antes dos listeners multi-abas)
  const [fontSize, setFontSizeState] = useState<'xs' | 'sm' | 'base' | 'lg' | 'xl'>('sm');

  const refreshUserData = useCallback(async () => {
    if (!user?.id) {
      try {
        const [userFolds, userLst, userBms] = await Promise.all([
          loadUserFolders(null),
          loadUserLists(null),
          loadUserBookmarks(null)
        ]);
        setFolders(userFolds);
        setLists(userLst);
        if (userBms) setBookmarkedQuestionIds(userBms);
      } catch { }
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setCloudSyncState('offline');
      return;
    }

    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setCloudSyncState('syncing');

    try {
      // 1. Inicialização e Reconciliação via endpoint de bootstrap unificado (1 único roundtrip HTTP)
      const res = await fetch('/api/student/bootstrap', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.authenticated) {
          if (Array.isArray(data.folders)) {
            const reconciledFolders = await reconcileUserFoldersWithRemote(user.id, data.folders);
            setFolders(reconciledFolders);
          }
          if (Array.isArray(data.lists)) {
            const reconciledLists = await reconcileUserListsWithRemote(user.id, data.lists);
            setLists(reconciledLists);
          }
          if (Array.isArray(data.bookmarks)) {
            const reconciledBookmarks = await reconcileUserBookmarksWithRemote(user.id, data.bookmarks);
            setBookmarkedQuestionIds(reconciledBookmarks);
          }
          if (typeof data.profile?.daily_goal === 'number' && data.profile.daily_goal > 0) {
            setCustomDailyGoal(data.profile.daily_goal);
            try {
              localStorage.setItem(getDailyGoalStorageKey(user.id), String(data.profile.daily_goal));
            } catch { }
          }
          if (data.profile?.preferences && typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('bancoresidencia_preferences_synced', {
              detail: data.profile.preferences
            }));
          }
          if (Array.isArray(data.answers)) {
            await syncUserAnswersFromSupabase(user.id, data.answers);
          }
          lastSyncTimestampRef.current = Date.now();
          setCloudSyncState('synced');
          return;
        }
      }
    } catch {
      // Fallback gracioso para carregamento individual se o bootstrap falhar
    } finally {
      isSyncingRef.current = false;
    }

    try {
      const [userFolds, userLst, userBms] = await Promise.all([
        loadUserFolders(user.id),
        loadUserLists(user.id),
        loadUserBookmarks(user.id),
        syncUserAnswersFromSupabase(user.id)
      ]);
      setFolders(userFolds);
      setLists(userLst);
      if (userBms) setBookmarkedQuestionIds(userBms);
      lastSyncTimestampRef.current = Date.now();
      setCloudSyncState('synced');
    } catch (err) {
      console.error('Erro ao sincronizar listas e pastas do aluno:', err);
      setCloudSyncState('error');
    }
  }, [user?.id, syncUserAnswersFromSupabase, getDailyGoalStorageKey]);

  useEffect(() => {
    refreshUserData();

    const supabase = createClient();
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user?.id === user?.id) {
        refreshUserData();
      } else if (event === 'SIGNED_OUT') {
        setUserAnswers({});
        setFolders([]);
        setLists([]);
        setBookmarkedQuestionIds({});
        setCustomDailyGoal(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshUserData, user?.id]);

  // Revalidação automática multi-dispositivo (celular <-> tablet <-> computador) e sincronização entre abas
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const VISIBILITY_COOLDOWN_MS = 20000;

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible' && user?.id) {
        if (Date.now() - lastSyncTimestampRef.current >= VISIBILITY_COOLDOWN_MS) {
          refreshUserData();
        }
      }
    };

    const handleOnline = () => {
      if (user?.id) {
        refreshUserData();
      } else {
        setCloudSyncState('synced');
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      try {
        if (e.key === getUserAnswersStorageKey(user?.id)) {
          setUserAnswers(JSON.parse(e.newValue));
        } else if (e.key === getListStorageKey(user?.id)) {
          setLists(JSON.parse(e.newValue));
        } else if (e.key === getFolderStorageKey(user?.id)) {
          setFolders(JSON.parse(e.newValue));
        } else if (e.key === getBookmarksStorageKey(user?.id)) {
          setBookmarkedQuestionIds(JSON.parse(e.newValue));
        } else if (e.key === getDailyGoalStorageKey(user?.id)) {
          const val = Number(e.newValue);
          if (!Number.isNaN(val) && val > 0) setCustomDailyGoal(val);
        } else if (e.key === 'bancoresidencia_question_font_size') {
          setFontSizeState(e.newValue as 'xs' | 'sm' | 'base' | 'lg' | 'xl');
        }
      } catch { }
    };

    const unsubscribeForceSync = onImmediateCloudSyncRequest(() => {
      refreshUserData();
    });

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('online', handleOnline);
    window.addEventListener('storage', handleStorage);

    return () => {
      unsubscribeForceSync();
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('storage', handleStorage);
    };
  }, [user?.id, refreshUserData, getUserAnswersStorageKey, getDailyGoalStorageKey]);

  const dailyGoalDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const updateDailyGoal = useCallback((newGoal: number) => {
    const safeGoal = Math.max(1, Math.min(500, Math.round(newGoal)));
    setCustomDailyGoal(safeGoal);
    try {
      localStorage.setItem(getDailyGoalStorageKey(user?.id), String(safeGoal));
    } catch { }

    if (user?.id && user.id !== 'demo-student') {
      if (dailyGoalDebounceRef.current) {
        clearTimeout(dailyGoalDebounceRef.current);
      }
      dailyGoalDebounceRef.current = setTimeout(async () => {
        try {
          const supabase = createClient();
          await supabase
            .from('profiles')
            .update({ daily_goal: safeGoal })
            .eq('id', user.id);
        } catch (err) {
          console.warn('[StudentDataContext] Erro ao sincronizar meta diária no Supabase:', err);
        }
      }, 500);
    }
  }, [user?.id, getDailyGoalStorageKey]);

  // Sincronização inicial e reativa de Tamanho de Fonte
  useEffect(() => {
    try {
      const savedFontSize = localStorage.getItem('bancoresidencia_question_font_size') as
        | 'xs'
        | 'sm'
        | 'base'
        | 'lg'
        | 'xl'
        | null;
      if (savedFontSize) setFontSizeState(savedFontSize);
    } catch { }

    const handleSync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.fontSize) {
        setFontSizeState(detail.fontSize);
      }
    };
    window.addEventListener('bancoresidencia_preferences_synced', handleSync);
    return () => window.removeEventListener('bancoresidencia_preferences_synced', handleSync);
  }, []);

  const fontSizeDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const setFontSize = useCallback((size: 'xs' | 'sm' | 'base' | 'lg' | 'xl') => {
    setFontSizeState(size);
    try {
      localStorage.setItem('bancoresidencia_question_font_size', size);
    } catch { }

    // Sincroniza em background com preferences no Supabase com debounce de 600ms
    if (fontSizeDebounceRef.current) {
      clearTimeout(fontSizeDebounceRef.current);
    }
    fontSizeDebounceRef.current = setTimeout(async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('preferences')
            .eq('id', session.user.id)
            .maybeSingle();

          const currentPrefs = (profile?.preferences as Record<string, unknown>) || {};
          await supabase
            .from('profiles')
            .update({
              preferences: {
                ...currentPrefs,
                fontSize: size,
                updatedAt: new Date().toISOString()
              }
            })
            .eq('id', session.user.id);
        }
      } catch (err) {
        console.warn('[StudentDataContext] Erro ao sincronizar fontSize no Supabase:', err);
      }
    }, 600);
  }, []);

  // Filtros de Desempenho
  const [performanceFilters, setPerformanceFilters] = useState<PerformanceFilterState>({
    modalidade: 'Residência',
    period: '7d',
    institutions: [],
    banca: 'Todas'
  });

  const handleResetPerformanceFilters = useCallback(() => {
    setPerformanceFilters({
      modalidade: 'Residência',
      period: '7d',
      institutions: [],
      banca: 'Todas'
    });
  }, []);

  // Contagem de erros pendentes
  const pendingErrorsCount = useMemo(() => {
    return Object.values(userAnswers).filter(
      (a) => !a.isCorrect && a.statusRetrial !== 'recuperado'
    ).length;
  }, [userAnswers]);

  // Cálculo de estatísticas agregadas (TRI, acurácia, histórico)
  const stats: UserStats = useMemo(() => {
    const totalAnswered = Object.keys(userAnswers).length;
    const totalCorrect = Object.values(userAnswers).filter((a) => a.isCorrect).length;
    const totalIncorrect = totalAnswered - totalCorrect;
    const accuracyRate = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;

    const userAttemptsList: UserAttempt[] = Object.entries(userAnswers).map(([qid, a]) => ({
      question_id: qid,
      difficulty: a.difficulty,
      correct: a.isCorrect,
      user_id: user?.id || 'current-user',
      timestamp: a.timestamp,
      selectedLetter: a.letter,
      specialty: a.specialty,
      tema: a.tema,
      foco: a.foco,
      subfoco: a.subfoco
    }));

    const percentileInfo = calculatePercentile({
      totalAnswered,
      totalCorrect,
      filters: performanceFilters,
      attempts: userAttemptsList.length > 0 ? userAttemptsList : undefined
    });

    const normalizeSpecialtyName = (s: string): string => {
      if (!s) return s;
      const t = s.trim();
      if (t === 'Cirurgia') return 'Cirurgia Geral';
      if (t === 'Medicina Preventiva' || t === 'Preventiva') return 'Medicina Preventiva e Social';
      if (t === 'GO' || t === 'Ginecologia e Obstetrícia') return 'Ginecologia';
      return t;
    };

    const specialtyMap: Record<string, { total: number; correct: number }> = {
      'Clínica Médica': { total: 0, correct: 0 },
      'Cirurgia Geral': { total: 0, correct: 0 },
      'Pediatria': { total: 0, correct: 0 },
      'Ginecologia': { total: 0, correct: 0 },
      'Obstetrícia': { total: 0, correct: 0 },
      'Medicina Preventiva e Social': { total: 0, correct: 0 }
    };

    const themeMap: Record<string, { specialty: string; tema: string; total: number; correct: number }> = {};
    const historyByDayMap: Record<string, { answered: number; correct: number }> = {};

    Object.entries(userAnswers).forEach(([, ans]) => {
      const rawSpec = ans.specialty;
      const tema = ans.tema;
      if (rawSpec) {
        const spec = normalizeSpecialtyName(rawSpec);
        if (!specialtyMap[spec]) {
          specialtyMap[spec] = { total: 0, correct: 0 };
        }
        specialtyMap[spec].total += 1;
        if (ans.isCorrect) specialtyMap[spec].correct += 1;

        if (tema) {
          const key = `${spec} - ${tema}`;
          if (!themeMap[key]) {
            themeMap[key] = { specialty: spec, tema, total: 0, correct: 0 };
          }
          themeMap[key].total += 1;
          if (ans.isCorrect) themeMap[key].correct += 1;
        }
      }

      if (ans.timestamp) {
        const d = getLocalDateStr(ans.timestamp);
        if (d) {
          if (!historyByDayMap[d]) historyByDayMap[d] = { answered: 0, correct: 0 };
          historyByDayMap[d].answered += 1;
          if (ans.isCorrect) historyByDayMap[d].correct += 1;
        }
      }
    });

    const bySpecialty = Object.entries(specialtyMap).map(([name, data]) => ({
      specialty: name,
      total: data.total,
      correct: data.correct,
      accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0
    }));

    const byTheme = Object.values(themeMap).map((data) => ({
      specialty: data.specialty,
      tema: data.tema,
      total: data.total,
      correct: data.correct,
      accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0
    }));

    const historyByDay = Object.entries(historyByDayMap).map(([date, data]) => ({
      date,
      answered: data.answered,
      correct: data.correct
    }));

    let streakDays = 0;
    try {
      const datesAnswered = new Set(
        Object.values(userAnswers)
          .map((a) => (a.timestamp ? getLocalDateStr(a.timestamp) : ''))
          .filter(Boolean)
      );
      const today = new Date();
      const cur = new Date(today);
      while (true) {
        const key = getLocalDateStr(cur);
        if (datesAnswered.has(key)) {
          streakDays++;
          cur.setDate(cur.getDate() - 1);
        } else {
          if (streakDays === 0) {
            cur.setDate(cur.getDate() - 1);
            const yKey = getLocalDateStr(cur);
            if (datesAnswered.has(yKey)) {
              streakDays++;
              cur.setDate(cur.getDate() - 1);
              continue;
            }
          }
          break;
        }
      }
    } catch { }

    const calculatedStreak = streakDays;

    return {
      totalAnswered,
      totalCorrect,
      totalIncorrect,
      accuracyRate,
      uniqueAnswered: totalAnswered,
      reviews: 0,
      repeated: 0,
      daysOnPlatform: calculatedStreak,
      streakDays: calculatedStreak,
      studyTimeMinutes: Math.round(totalAnswered * 2.5),
      percentileInfo,
      historyByDay,
      bySpecialty,
      byTheme
    };
  }, [userAnswers, performanceFilters, user?.id]);

  // Registro de resposta com persistência local e Supabase
  const recordAnswer = useCallback(
    (
      questionId: string,
      selectedLetter: 'A' | 'B' | 'C' | 'D' | 'E',
      isCorrect: boolean,
      metadata?: Partial<UserAnswerItem>
    ) => {
      const answerTimestamp = (metadata as any)?.serverAnsweredAt ? new Date((metadata as any).serverAnsweredAt).getTime() : Date.now();
      const previousAnswer = userAnswersRef.current[questionId];
      const previousAttempts = previousAnswer?.attempts || [];

      const newAttempt = {
        letter: selectedLetter,
        isCorrect,
        timestamp: answerTimestamp
      };

      const hadPreviousError = previousAttempts.some((a) => !a.isCorrect) || (previousAnswer && !previousAnswer.isCorrect);
      let statusRetrial: 'pendente' | 'recuperado' | undefined = undefined;
      if (!isCorrect) {
        statusRetrial = 'pendente';
      } else if (hadPreviousError) {
        statusRetrial = 'recuperado';
      }

      const answerObj: UserAnswerItem = {
        letter: selectedLetter,
        isCorrect,
        timestamp: answerTimestamp,
        difficulty: metadata?.difficulty || previousAnswer?.difficulty || 'Médio',
        isAnulada: Boolean(metadata?.isAnulada || previousAnswer?.isAnulada),
        specialty: metadata?.specialty || previousAnswer?.specialty,
        tema: metadata?.tema || previousAnswer?.tema,
        foco: metadata?.foco || previousAnswer?.foco,
        subfoco: metadata?.subfoco || previousAnswer?.subfoco,
        sub_subfoco: metadata?.sub_subfoco || metadata?.subSubfoco || previousAnswer?.sub_subfoco || previousAnswer?.subSubfoco,
        subSubfoco: metadata?.subSubfoco || metadata?.sub_subfoco || previousAnswer?.subSubfoco || previousAnswer?.sub_subfoco,
        banca: metadata?.banca || previousAnswer?.banca,
        year: metadata?.year || previousAnswer?.year,
        code: metadata?.code || previousAnswer?.code,
        errorReason: metadata?.errorReason ?? previousAnswer?.errorReason,
        studentNotes: metadata?.studentNotes ?? previousAnswer?.studentNotes,
        statusRetrial,
        attempts: [...previousAttempts, newAttempt]
      };

      setUserAnswers((prev) => {
        const next = { ...prev, [questionId]: answerObj };
        return next;
      });

      // Persistência em localStorage assíncrona (queueMicrotask) para zero bloqueio da renderização
      if (typeof window !== 'undefined') {
        queueMicrotask(() => {
          try {
            const key = getUserAnswersStorageKey(user?.id);
            const current = userAnswersRef.current;
            localStorage.setItem(key, JSON.stringify({ ...current, [questionId]: answerObj }));
          } catch { }
        });
      }

      setSessionAnswers((prev) => ({
        ...prev,
        [questionId]: { letter: selectedLetter, isCorrect }
      }));

      // Sincroniza em segundo plano com o Supabase com todos os metadados clínicos (se não sincronizado via solve)
      if (user?.id && !metadata?.syncedRemotely) {
        const supabase = createClient();
        supabase
          .from('user_answers')
          .upsert(
            {
              user_id: user.id,
              question_id: questionId,
              selected_option: selectedLetter,
              is_correct: isCorrect,
              answered_at: new Date(answerTimestamp).toISOString(),
              specialty: answerObj.specialty || 'Clínica Médica',
              tema: answerObj.tema || 'Geral',
              foco: answerObj.foco || null,
              subfoco: answerObj.subfoco || null,
              difficulty: answerObj.difficulty || 'Médio',
              banca: answerObj.banca || 'Geral',
              year: answerObj.year ? Number(answerObj.year) : 2024,
              error_reason: answerObj.errorReason || null,
              student_notes: answerObj.studentNotes || null,
              status_retrial: answerObj.statusRetrial || (isCorrect ? 'recuperado' : 'pendente'),
              attempts: answerObj.attempts || [newAttempt]
            },
            { onConflict: 'user_id,question_id' }
          )
          .then(({ error }) => {
            if (error) console.warn('[StudentDataContext] Erro ao sincronizar resposta completa no Supabase:', error);
          });
      }

      // Atualiza progresso da lista se houver lista ativa (calculado por IDs únicos respondidos, sem duplicar re-tentativas)
      if (activeListId) {
        const updatedAnswersSnapshot = { ...userAnswersRef.current, [questionId]: answerObj };
        setLists((prev) => {
          const next = prev.map((l) => {
            if (l.id === activeListId) {
              const total = Math.max(1, l.totalQuestions || l.questionIds.length);
              const nextCompleted =
                l.questionIds.length > 0
                  ? Math.min(total, l.questionIds.filter((qid) => Boolean(updatedAnswersSnapshot[qid])).length)
                  : Math.min(total, (previousAnswer ? l.completedQuestions : l.completedQuestions + 1));
              return {
                ...l,
                completedQuestions: nextCompleted,
                inProgress: nextCompleted > 0 && nextCompleted < total,
                progressPercentage: Math.min(100, Math.round((nextCompleted / total) * 100)),
                lastStudiedAt: 'Agora mesmo',
                updatedAt: new Date().toISOString()
              };
            }
            return l;
          });
          saveUserLists(next, user?.id);
          return next;
        });
      }
    },
    [user, activeListId, getUserAnswersStorageKey]
  );

  const updateAnswerMeta = useCallback(
    (
      questionId: string,
      meta: {
        errorReason?: ErrorReasonType;
        studentNotes?: string;
        statusRetrial?: 'pendente' | 'recuperado';
      }
    ) => {
      setUserAnswers((prev) => {
        const current = prev[questionId];
        if (!current) return prev;
        const updated = { ...current, ...meta };
        const next = { ...prev, [questionId]: updated };
        try {
          const key = getUserAnswersStorageKey(user?.id);
          localStorage.setItem(key, JSON.stringify(next));
        } catch { }
        return next;
      });

      // Sincroniza metadados atualizados diretamente com o Supabase
      if (user?.id) {
        const supabase = createClient();
        const updatePayload: Record<string, unknown> = {};
        if (meta.errorReason !== undefined) updatePayload.error_reason = meta.errorReason;
        if (meta.studentNotes !== undefined) updatePayload.student_notes = meta.studentNotes;
        if (meta.statusRetrial !== undefined) updatePayload.status_retrial = meta.statusRetrial;

        if (Object.keys(updatePayload).length > 0) {
          supabase
            .from('user_answers')
            .update(updatePayload)
            .eq('user_id', user.id)
            .eq('question_id', questionId)
            .then(({ error }) => {
              if (error) console.warn('[StudentDataContext] Erro ao sincronizar metadados no Supabase:', error);
            });
        }
      }
    },
    [user, getUserAnswersStorageKey]
  );

  // Manipulação de Pastas (UUIDv4 elimina colisão de PK global entre alunos concorrentes)
  const createFolder = useCallback(
    async (name: string, parentId: string | null) => {
      const uniqueId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? `f-${crypto.randomUUID()}`
          : `f-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const newFolder: Folder = {
        id: uniqueId,
        userId: user?.id,
        name,
        parentId,
        color: parentId ? '#10b981' : '#3b82f6',
        createdAt: new Date().toISOString()
      };
      const next = [...folders, newFolder];
      setFolders(next);
      await saveUserFolders(next, user?.id);
    },
    [folders, user]
  );

  const renameFolder = useCallback(
    async (folderId: string, newName: string) => {
      const next = folders.map((f) => (f.id === folderId ? { ...f, name: newName } : f));
      setFolders(next);
      await saveUserFolders(next, user?.id);
    },
    [folders, user]
  );

  const deleteFolder = useCallback(
    async (folderId: string) => {
      const toDelete = new Set<string>([folderId]);
      let addedMore = true;
      while (addedMore) {
        addedMore = false;
        for (const f of folders) {
          if (f.parentId && toDelete.has(f.parentId) && !toDelete.has(f.id)) {
            toDelete.add(f.id);
            addedMore = true;
          }
        }
      }
      const nextFolders = folders.filter((f) => !toDelete.has(f.id));
      setFolders(nextFolders);
      await saveUserFolders(nextFolders, user?.id);
      for (const id of toDelete) {
        await deleteUserFolderFromDb(id, user?.id);
      }
      const nextLists = lists.map((l) =>
        l.folderId && toDelete.has(l.folderId) ? { ...l, folderId: undefined } : l
      );
      setLists(nextLists);
      await saveUserLists(nextLists, user?.id);
    },
    [folders, lists, user]
  );

  // Manipulação de Listas
  const createListWithFilters = useCallback(
    async (
      title: string,
      folderId: string | null,
      totalQuestions: number,
      appliedFilters: AdvancedFilterState,
      questionIds: string[] = []
    ): Promise<QuestionList | null> => {
      const uniqueListId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? `list-${crypto.randomUUID()}`
          : `list-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

      let resolvedQuestionIds = questionIds;

      // Quando criada pela aba /listas sem IDs pré-carregados, busca os IDs reais do acervo respeitando os filtros
      if (!resolvedQuestionIds || resolvedQuestionIds.length === 0) {
        try {
          const currentAnswers = userAnswersRef.current;
          const answeredIds = Object.keys(currentAnswers);
          const correctIds = Object.entries(currentAnswers)
            .filter(([, a]) => a.isCorrect)
            .map(([id]) => id);
          const wrongIds = Object.entries(currentAnswers)
            .filter(([, a]) => !a.isCorrect)
            .map(([id]) => id);

          const desiredSize = Math.min(200, Math.max(1, totalQuestions || 20));
          const fetched = await fetchQuestionsFromSupabase(
            {
              ...appliedFilters,
              userSolvedIds: answeredIds,
              userCorrectIds: correctIds,
              userWrongIds: wrongIds
            },
            1,
            desiredSize
          );
          if (fetched.questions && fetched.questions.length > 0) {
            resolvedQuestionIds = fetched.questions.map((q) => q.id);
          }
        } catch (err) {
          console.warn('[StudentDataContext] Erro ao buscar questões para nova lista:', err);
        }
      }

      const finalTotal =
        resolvedQuestionIds.length > 0 ? resolvedQuestionIds.length : Math.max(1, totalQuestions || 20);
      const alreadyDone =
        resolvedQuestionIds.length > 0
          ? resolvedQuestionIds.filter((qid) => Boolean(userAnswersRef.current[qid])).length
          : 0;
      const newList: QuestionList = {
        id: uniqueListId,
        userId: user?.id,
        title,
        folderId: folderId || undefined,
        questionIds: resolvedQuestionIds,
        totalQuestions: finalTotal,
        completedQuestions: alreadyDone,
        lastStudiedAt: 'Criada recentemente',
        inProgress: alreadyDone > 0 && alreadyDone < finalTotal,
        progressPercentage: Math.min(100, Math.round((alreadyDone / finalTotal) * 100)),
        filters: appliedFilters,
        createdAt: new Date().toISOString()
      };
      const next = [newList, ...lists];
      setLists(next);
      await saveUserLists(next, user?.id);
      return newList;
    },
    [lists, user]
  );

  const editList = useCallback(
    async (listId: string, newTitle: string, newFolderId?: string | null) => {
      const next = lists.map((l) =>
        l.id === listId
          ? {
            ...l,
            title: newTitle,
            folderId: newFolderId !== undefined ? newFolderId || undefined : l.folderId,
            updatedAt: new Date().toISOString()
          }
          : l
      );
      setLists(next);
      await saveUserLists(next, user?.id);
    },
    [lists, user]
  );

  const deleteList = useCallback(
    async (listId: string) => {
      const next = lists.filter((l) => l.id !== listId);
      setLists(next);
      await saveUserLists(next, user?.id);
      await deleteUserListFromDb(listId, user?.id);
      if (activeListId === listId) {
        setActiveListId(null);
      }
    },
    [lists, activeListId, user]
  );

  const toggleBookmark = useCallback(
    async (questionId: string) => {
      const isCurrent = Boolean(bookmarkedQuestionIds[questionId]);
      const nextVal = !isCurrent;
      setBookmarkedQuestionIds((prev) => {
        const copy = { ...prev };
        if (nextVal) copy[questionId] = true;
        else delete copy[questionId];
        return copy;
      });
      await toggleUserBookmark(questionId, nextVal, user?.id);
    },
    [bookmarkedQuestionIds, user?.id]
  );

  const addQuestionToFolder = useCallback(
    async (questionId: string, folderId: string, folderName: string) => {
      const existingIdx = lists.findIndex((l) => l.folderId === folderId);
      let nextLists: QuestionList[];
      if (existingIdx !== -1) {
        const target = lists[existingIdx];
        if (target.questionIds.includes(questionId)) return;
        const updated = {
          ...target,
          questionIds: [questionId, ...target.questionIds],
          totalQuestions: target.questionIds.length + 1,
          lastStudiedAt: 'Atualizado recentemente',
          updatedAt: new Date().toISOString()
        };
        nextLists = [...lists];
        nextLists[existingIdx] = updated;
      } else {
        const uniqueFolderListId =
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? `list-folder-${crypto.randomUUID()}`
            : `list-folder-${folderId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const newList: QuestionList = {
          id: uniqueFolderListId,
          userId: user?.id,
          title: `Questões Salvas - ${folderName}`,
          folderId,
          questionIds: [questionId],
          totalQuestions: 1,
          completedQuestions: 0,
          lastStudiedAt: 'Criada recentemente',
          inProgress: false,
          progressPercentage: 0,
          createdAt: new Date().toISOString()
        };
        nextLists = [newList, ...lists];
      }
      setLists(nextLists);
      await saveUserLists(nextLists, user?.id);
    },
    [lists, user]
  );

  return (
    <StudentDataContext.Provider
      value={{
        userAnswers,
        sessionAnswers,
        stats,
        pendingErrorsCount,
        dailyGoal,
        customDailyGoal,
        updateDailyGoal,
        folders,
        lists,
        activeListId,
        setActiveListId,
        createFolder,
        renameFolder,
        deleteFolder,
        createListWithFilters,
        editList,
        deleteList,
        addQuestionToFolder,
        bookmarkedQuestionIds,
        toggleBookmark,
        fontSize,
        setFontSize,
        performanceFilters,
        setPerformanceFilters,
        handleResetPerformanceFilters,
        recordAnswer,
        updateAnswerMeta,
        refreshUserData
      }}
    >
      {children}
    </StudentDataContext.Provider>
  );
};

export const useStudentData = () => {
  const context = useContext(StudentDataContext);
  if (!context) {
    throw new Error('useStudentData must be used within a StudentDataProvider');
  }
  return context;
};
