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
  deleteUserFolderFromDb
} from '@/services/userListsService';
import { calculatePercentile } from '@/utils/percentile';
import { createClient } from '@/lib/supabase/client';

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

  // Carrega respostas persistidas no localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storageKey = getUserAnswersStorageKey(user?.id);
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setUserAnswers(parsed);
        }
      } else {
        const fallbackRaw = localStorage.getItem('bancoresidencia_user_answers');
        if (fallbackRaw) {
          const parsed = JSON.parse(fallbackRaw);
          if (parsed && typeof parsed === 'object') {
            setUserAnswers(parsed);
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar respostas locais:', e);
    }
  }, [user?.id, getUserAnswersStorageKey]);

  // Pastas e Listas
  const [folders, setFolders] = useState<Folder[]>([]);
  const [lists, setLists] = useState<QuestionList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);

  const refreshUserData = useCallback(async () => {
    try {
      const [userFolds, userLst] = await Promise.all([
        loadUserFolders(user?.id),
        loadUserLists(user?.id)
      ]);
      setFolders(userFolds);
      setLists(userLst);
    } catch (err) {
      console.error('Erro ao sincronizar listas e pastas do aluno:', err);
    }
  }, [user]);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  // Metas diárias
  const [customDailyGoal, setCustomDailyGoal] = useState<number | null>(null);
  const dailyGoal = customDailyGoal ?? user?.dailyGoal ?? 30;

  useEffect(() => {
    try {
      const savedGoal = localStorage.getItem('bancoresidencia_custom_daily_goal');
      if (savedGoal) {
        setCustomDailyGoal(Number(savedGoal));
      }
    } catch {}
  }, []);

  const updateDailyGoal = useCallback((newGoal: number) => {
    setCustomDailyGoal(newGoal);
    try {
      localStorage.setItem('bancoresidencia_custom_daily_goal', String(newGoal));
    } catch {}
  }, []);

  // Tamanho de Fonte
  const [fontSize, setFontSizeState] = useState<'xs' | 'sm' | 'base' | 'lg' | 'xl'>('sm');
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
    } catch {}
  }, []);

  const setFontSize = useCallback((size: 'xs' | 'sm' | 'base' | 'lg' | 'xl') => {
    setFontSizeState(size);
    try {
      localStorage.setItem('bancoresidencia_question_font_size', size);
    } catch {}
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
      const spec = ans.specialty;
      const tema = ans.tema;
      if (spec && specialtyMap[spec]) {
        specialtyMap[spec].total += 1;
        if (ans.isCorrect) specialtyMap[spec].correct += 1;
      }
      if (spec && tema) {
        const key = `${spec} - ${tema}`;
        if (!themeMap[key]) {
          themeMap[key] = { specialty: spec, tema, total: 0, correct: 0 };
        }
        themeMap[key].total += 1;
        if (ans.isCorrect) themeMap[key].correct += 1;
      }

      if (ans.timestamp) {
        const d = new Date(ans.timestamp).toISOString().split('T')[0];
        if (!historyByDayMap[d]) historyByDayMap[d] = { answered: 0, correct: 0 };
        historyByDayMap[d].answered += 1;
        if (ans.isCorrect) historyByDayMap[d].correct += 1;
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
        Object.values(userAnswers).map((a) => new Date(a.timestamp).toISOString().split('T')[0])
      );
      const today = new Date();
      const cur = new Date(today);
      while (true) {
        const key = cur.toISOString().split('T')[0];
        if (datesAnswered.has(key)) {
          streakDays++;
          cur.setDate(cur.getDate() - 1);
        } else {
          if (streakDays === 0) {
            cur.setDate(cur.getDate() - 1);
            const yKey = cur.toISOString().split('T')[0];
            if (datesAnswered.has(yKey)) {
              streakDays++;
              cur.setDate(cur.getDate() - 1);
              continue;
            }
          }
          break;
        }
      }
    } catch {}

    const calculatedStreak = Math.max(streakDays, 1);

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
      const answerTimestamp = Date.now();
      const previousAnswer = userAnswersRef.current[questionId];
      const previousAttempts = previousAnswer?.attempts || [];

      const newAttempt = {
        letter: selectedLetter,
        isCorrect,
        timestamp: answerTimestamp
      };

      const answerObj: UserAnswerItem = {
        letter: selectedLetter,
        isCorrect,
        timestamp: answerTimestamp,
        difficulty: (metadata?.difficulty as any) || (previousAnswer?.difficulty as any) || 'Médio',
        isAnulada: Boolean(metadata?.isAnulada || previousAnswer?.isAnulada),
        specialty: metadata?.specialty || previousAnswer?.specialty,
        tema: metadata?.tema || previousAnswer?.tema,
        foco: metadata?.foco || previousAnswer?.foco,
        subfoco: metadata?.subfoco || previousAnswer?.subfoco,
        banca: metadata?.banca || previousAnswer?.banca,
        year: metadata?.year || previousAnswer?.year,
        code: metadata?.code || previousAnswer?.code,
        statusRetrial: isCorrect ? 'recuperado' : 'pendente',
        attempts: [...previousAttempts, newAttempt]
      };

      setUserAnswers((prev) => {
        const next = { ...prev, [questionId]: answerObj };
        try {
          const key = getUserAnswersStorageKey(user?.id);
          localStorage.setItem(key, JSON.stringify(next));
        } catch {}
        return next;
      });

      setSessionAnswers((prev) => ({
        ...prev,
        [questionId]: { letter: selectedLetter, isCorrect }
      }));

      // Sincroniza em segundo plano com o Supabase se logado
      if (user?.id) {
        const supabase = createClient();
        supabase
          .from('user_answers')
          .upsert(
            {
              user_id: user.id,
              question_id: questionId,
              selected_option: selectedLetter,
              is_correct: isCorrect,
              answered_at: new Date(answerTimestamp).toISOString()
            },
            { onConflict: 'user_id,question_id' }
          )
          .then(({ error }) => {
            if (error) console.warn('Erro ao sincronizar resposta no Supabase:', error);
          });
      }

      // Atualiza progresso da lista se houver lista ativa
      if (activeListId) {
        setLists((prev) => {
          const next = prev.map((l) => {
            if (l.id === activeListId) {
              const nextCompleted = Math.min(l.totalQuestions, l.completedQuestions + 1);
              return {
                ...l,
                completedQuestions: nextCompleted,
                progressPercentage: Math.round((nextCompleted / l.totalQuestions) * 100),
                lastStudiedAt: 'Agora mesmo'
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
        } catch {}
        return next;
      });
    },
    [user, getUserAnswersStorageKey]
  );

  // Manipulação de Pastas
  const createFolder = useCallback(
    async (name: string, parentId: string | null) => {
      const newFolder: Folder = {
        id: `f-${Date.now()}`,
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
        await deleteUserFolderFromDb(id);
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
      const newList: QuestionList = {
        id: `list-${Date.now()}`,
        userId: user?.id,
        title,
        folderId: folderId || undefined,
        questionIds,
        totalQuestions: totalQuestions || questionIds.length,
        completedQuestions: 0,
        lastStudiedAt: 'Criada recentemente',
        inProgress: false,
        progressPercentage: 0,
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
      await deleteUserListFromDb(listId);
      if (activeListId === listId) {
        setActiveListId(null);
      }
    },
    [lists, activeListId, user]
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
        const newList: QuestionList = {
          id: `list-folder-${folderId}-${Date.now()}`,
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
