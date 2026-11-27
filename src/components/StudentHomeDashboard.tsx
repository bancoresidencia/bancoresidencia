'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Flame,
  Target,
  Award,
  FileQuestion,
  ListFilter,
  FileCheck2,
  BarChart2,
  Trophy,
  ArrowRight,
  Play,
  Sparkles,
  Zap,
  Sun,
  Sunset,
  Moon,
  FolderOpen,
  Clock,
  Medal,
  SlidersHorizontal,
  Check,
  X,
  CalendarDays,
  Building2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  History,
  Layers,
  Search,
  ExternalLink,
  AlertOctagon,
  Brain,
  TrendingUp,
  AlertCircle,
  Stethoscope,
  Activity,
  HeartPulse,
  Baby,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Lightbulb,
  BookmarkPlus,
  RefreshCw,
  Plus,
  LayoutGrid,
  GraduationCap,
  Eye,
  EyeOff,
  ZoomIn,
} from 'lucide-react';

// Ícone Oficial do Google
const GoogleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);
import dynamic from 'next/dynamic';
import { UserStats, QuestionList, ActiveTab, Modalidade, UserAnswerItem, PeriodFilter } from '@/types';
import { UterusIcon, PregnantWomanIcon } from './StatsDashboard';
import { getPercentileColor, UNRANKED_THRESHOLD } from '@/utils/percentile';
import { RANKING_PERCENTILE_EVENT, rankingPercentileStorageKey } from '@/utils/rankingPercentileCache';
import type { LeaderboardResponse } from '@/types/ranking';
import { computeAdaptiveDistribution, getBaselinePlatformScores } from '@/utils/distributionCurve';
import { useTheme } from '@/context/ThemeContext';
import { Button, Badge, ProgressBar } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_GOOGLE_CALENDAR_CLIENT_ID, PUBLIC_GOOGLE_CALENDAR_CLIENT_ID } from '@/config/googleCalendar';
import { useSubscription } from '@/context/SubscriptionContext';
import { getAccountTargetExam } from '@/utils/userTargetExam';
import { flashcardsService } from '@/services/flashcardsService';
import { useStudyTimer, getLocalDateStr } from '@/context/StudyTimerContext';
import { formatSecondsToDetailed } from './dashboard/StudyTimeAnalyticsCard';
import {
  getRecentOfficialExams,
  saveRecentOfficialExam,
  getRecentMockExams,
  saveRecentMockExam,
  getExamWithPendingFallback,
  RecentExamRecord,
  RecentMockRecord
} from '@/services/recentExamsService';
import { searchDirectExams, getFeaturedInstitutions } from '@/services/officialExamsService';
import { OfficialExamModalityKey, OfficialInstitution, OfficialExamItem } from '@/types/officialExams';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';
import { DEFAULT_HOME_CARDS } from './dashboard/dashboardDefaults';
import { CLINICAL_TIPS_DATABASE, ClinicalTipItem } from '@/data/clinicalTipsData';
import { CRITICAL_SUBTOPICS_MAP, DETAILED_MNEMONICS_MAP } from '@/data/dashboardMnemonicsData';

import { FigmaCardWrapper } from './dashboard/FigmaCardWrapper';
import { CardCanvas } from './dashboard/CardCanvas';
import { DailyScheduleSlot, TimelineFilter } from './dashboard/scheduleTypes';

const FigmaCustomizerBar = dynamic(
  () => import('./dashboard/FigmaCustomizerBar').then((mod) => mod.FigmaCustomizerBar),
  { ssr: false }
);
const GoogleCalendarScheduleView = dynamic(
  () => import('./dashboard/GoogleCalendarScheduleView').then((mod) => mod.GoogleCalendarScheduleView),
  { ssr: false }
);
const AiScheduleDrawer = dynamic(
  () => import('./dashboard/AiScheduleDrawer').then((mod) => mod.AiScheduleDrawer),
  { ssr: false }
);
const SpecialtyXRayChart = dynamic(
  () => import('./dashboard/SpecialtyXRayChart').then((mod) => mod.SpecialtyXRayChart),
  { ssr: false }
);
import {
  loadUserScheduledTasks,
  saveUserScheduledTask,
  deleteUserScheduledTask,
  clearAllUserScheduledTasks,
  getUserScheduledTasksStorageKey
} from '@/services/userScheduledTasksService';
import {
  buildGoogleCalendarTemplateUrl,
  requestGoogleCalendarAccessToken,
  startGoogleOAuthPopup,
  fetchTodayEventsFromGoogleApi,
  createEventInGoogleCalendarApi,
  startGoogleOAuthRedirect,
  extractGoogleTokenFromUrlHash,
  extractGoogleAuthErrorFromUrl,
  getGoogleOAuthRedirectUri,
  generateIcsContent,
  downloadIcsFile,
  createEventsBatchInGoogleCalendarApi,
  fetchGoogleCalendarAccountEmail
} from '@/services/googleCalendarService';

interface StudentHomeDashboardProps {
  studentName: string;
  stats: UserStats;
  dailyGoal: number;
  onUpdateDailyGoal: (newGoal: number) => void;
  recentList?: QuestionList;
  allLists: QuestionList[];
  onNavigate: (tab: ActiveTab) => void;
  onContinueList: (list: QuestionList) => void;
  modalidade: Modalidade;
  onStartOfficialExam?: (institution: string, year: number) => void;
  onNavigateToBancoWithSpecialty?: (specialty: string) => void;
  onStartSimuladoExpress?: (count?: number) => void;
  onStartTopicPractice?: (specialty: string, tema?: string, search?: string, limit?: number) => void;
  onNavigateToBancoWithSubfoco?: (specialty: string, tema: string, subfoco: string, subSubfoco?: string) => void;
  userAnswers?: Record<string, UserAnswerItem>;
}

export const StudentHomeDashboard: React.FC<StudentHomeDashboardProps> = ({
  studentName,
  stats,
  dailyGoal,
  onUpdateDailyGoal,
  recentList,
  allLists,
  onNavigate,
  onContinueList,
  modalidade,
  onStartOfficialExam,
  onNavigateToBancoWithSpecialty,
  onStartSimuladoExpress,
  onStartTopicPractice,
  onNavigateToBancoWithSubfoco,
  userAnswers
}) => {
  const { accentConfig, mode, isDashboardCustomizing, setIsDashboardCustomizing, setCanCustomizeLayout } = useTheme();

  // Registrar disponibilidade de personalização de layout na tela de início
  useEffect(() => {
    setCanCustomizeLayout(true);
    return () => {
      setCanCustomizeLayout(false);
    };
  }, [setCanCustomizeLayout]);

  // Hook de Personalização de Layout Estilo Figma (Tamanho, Ordem e Visibilidade)
  const {
    selectedCardId,
    setSelectedCardId,
    visibleCards,
    hiddenCards,
    saveFrames,
    updateCardSettings,
    toggleVisibility,
    restoreDefaults,
    autoConformLayout,
  } = useDashboardLayout('bancoresidencia_layout_home_v11', DEFAULT_HOME_CARDS);

  // Fonte única da verdade para personalização (sincronizada globalmente com o ThemeContext)
  const isCustomizing = Boolean(isDashboardCustomizing);
  const setIsCustomizing = setIsDashboardCustomizing;

  // Estado das Guias Pontilhadas (Smart Guides) e Vãos Livres Estilo Canva / Figma
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);



  // Período ativo do card de Aproveitamento (Geral vs Últimos 7 Dias)
  const [accuracyPeriod, setAccuracyPeriod] = useState<'geral' | '7d'>('geral');

  // Cálculo das métricas dinâmicas por período (Geral vs 7 Dias)
  const periodStats = React.useMemo(() => {
    if (accuracyPeriod === '7d' && stats.historyByDay && stats.historyByDay.length > 0) {
      const cutoff7d = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const last7 = stats.historyByDay.filter((d) => {
        const t = new Date(d.date + 'T12:00:00').getTime();
        return t >= cutoff7d;
      });
      const answered = last7.reduce((sum, d) => sum + (d.answered || 0), 0);
      const correct = last7.reduce((sum, d) => sum + (d.correct || 0), 0);
      const rate = answered > 0 ? (correct / answered) * 100 : 0;
      return {
        answered,
        correct,
        rate
      };
    }
    return {
      answered: stats.totalAnswered || 0,
      correct: stats.totalCorrect || 0,
      rate: stats.totalAnswered > 0 ? (stats.accuracyRate || 0) : 0
    };
  }, [accuracyPeriod, stats]);

  // Desempenho por dificuldade adaptável ao período selecionado (Geral vs 7 Dias)
  const difficultyStats = React.useMemo(() => {
    const normalizeDiff = (diff?: string): 'facil' | 'medio' | 'dificil' => {
      if (!diff) return 'medio';
      const clean = diff.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      if (clean.includes('facil')) return 'facil';
      if (clean.includes('dific')) return 'dificil';
      return 'medio';
    };

    const cutoff7d = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const counts = {
      facil: { total: 0, correct: 0 },
      medio: { total: 0, correct: 0 },
      dificil: { total: 0, correct: 0 }
    };

    if (userAnswers && Object.keys(userAnswers).length > 0) {
      Object.values(userAnswers).forEach((ans: any) => {
        if (!ans) return;
        if (accuracyPeriod === '7d') {
          const t = ans.timestamp || (ans.serverAnsweredAt ? new Date(ans.serverAnsweredAt).getTime() : 0);
          if (t && t < cutoff7d) return;
        }

        const cat = normalizeDiff(ans.difficulty);
        counts[cat].total += 1;
        if (ans.isCorrect) {
          counts[cat].correct += 1;
        }
      });
    }

    const calcRate = (correct: number, total: number) => {
      if (total === 0) return 0;
      return Number(((correct / total) * 100).toFixed(1));
    };

    const hasAnyAnswers = (counts.facil.total + counts.medio.total + counts.dificil.total) > 0;

    return {
      facil: {
        total: counts.facil.total,
        correct: counts.facil.correct,
        rate: hasAnyAnswers ? calcRate(counts.facil.correct, counts.facil.total) : 0
      },
      medio: {
        total: counts.medio.total,
        correct: counts.medio.correct,
        rate: hasAnyAnswers ? calcRate(counts.medio.correct, counts.medio.total) : 0
      },
      dificil: {
        total: counts.dificil.total,
        correct: counts.dificil.correct,
        rate: hasAnyAnswers ? calcRate(counts.dificil.correct, counts.dificil.total) : 0
      },
      hasAnswers: hasAnyAnswers
    };
  }, [userAnswers, accuracyPeriod]);

  // Animação suave e flat do aproveitamento ao carregar ou alternar período
  // Animação suave e contínua do aproveitamento (tanto ao entrar na plataforma quanto ao alternar filtros)
  const [animatedAccuracy, setAnimatedAccuracy] = useState<number>(0);
  const prevRateRef = useRef<number>(0);

  useEffect(() => {
    const target = periodStats.answered > 0 ? periodStats.rate : 0;
    const startValue = prevRateRef.current;
    if (startValue === target && animatedAccuracy === target) return;
    prevRateRef.current = target;

    let startTime: number | null = null;
    let lastUpdate = 0;
    const duration = 650; // ms de transição suave
    let animId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (currentTime - lastUpdate >= 25 || progress >= 1) {
        lastUpdate = currentTime;
        // Cubic ease-out suave para transição orgânica
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = startValue + (target - startValue) * easeOut;
        setAnimatedAccuracy(progress >= 1 ? target : Number(currentVal.toFixed(1)));
      }

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [periodStats.rate, periodStats.answered]);

  // Saudação dinâmica com base no horário
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { text: 'Bom dia', icon: Sun, color: 'text-amber-500' };
    } else if (hour >= 12 && hour < 18) {
      return { text: 'Boa tarde', icon: Sunset, color: 'text-orange-500' };
    } else {
      return { text: 'Boa noite', icon: Moon, color: 'text-sky-500' };
    }
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const todayStr = getLocalDateStr(new Date());
  const todayHistory = (stats.historyByDay || []).find((h) => h.date === todayStr);
  const todayAnswered = todayHistory?.answered || 0;
  const goalPercentage = Math.min(100, Math.round((todayAnswered / (dailyGoal || 1)) * 100));

  const { user, isAdmin } = useAuth();
  const { plan, openUpgradeModal } = useSubscription();
  const [showDevBar, setShowDevBar] = useState(false);

  const dailyTimeGoalStorageKey = React.useMemo(
    () => (user?.id ? `bancoresidencia_daily_time_goal_${user.id}` : 'bancoresidencia_daily_time_goal_guest'),
    [user?.id]
  );

  // Meta Diária de Tempo de Estudo personalizada (em minutos) isolada por conta + sincronizada com Supabase
  const [dailyTimeGoal, setDailyTimeGoal] = useState<number>(120);
  const dailyTimeGoalDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const scopedVal = localStorage.getItem(dailyTimeGoalStorageKey);
      if (scopedVal && !Number.isNaN(Number(scopedVal)) && Number(scopedVal) > 0) {
        setDailyTimeGoal(Number(scopedVal));
      } else {
        const legacyVal = localStorage.getItem('bancoresidencia_daily_time_goal');
        if (legacyVal && !Number.isNaN(Number(legacyVal)) && Number(legacyVal) > 0) {
          setDailyTimeGoal(Number(legacyVal));
          localStorage.setItem(dailyTimeGoalStorageKey, legacyVal);
          localStorage.removeItem('bancoresidencia_daily_time_goal');
        } else {
          setDailyTimeGoal(120);
        }
      }
    } catch { }

    const handlePrefsSynced = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && typeof detail.dailyTimeGoal === 'number' && detail.dailyTimeGoal > 0) {
        setDailyTimeGoal(detail.dailyTimeGoal);
        try {
          localStorage.setItem(dailyTimeGoalStorageKey, String(detail.dailyTimeGoal));
        } catch { }
      }
    };
    window.addEventListener('bancoresidencia_preferences_synced', handlePrefsSynced);
    return () => window.removeEventListener('bancoresidencia_preferences_synced', handlePrefsSynced);
  }, [dailyTimeGoalStorageKey]);

  // Prova alvo e contagem regressiva
  const examInfo = React.useMemo(() => getAccountTargetExam(user), [user]);
  const [targetExamName, setTargetExamName] = useState<string>(examInfo.examName);
  const [targetDaysLeft, setTargetDaysLeft] = useState<number>(examInfo.daysLeft);

  // Tempo de estudo realizado hoje (vinculado estritamente às sessões reais e cronômetro ativo)
  const { todayTotalSeconds, status: timerStatus, elapsedSeconds, allSessions } = useStudyTimer();
  const currentTodayStudySeconds =
    todayTotalSeconds + ((timerStatus === 'running' || timerStatus === 'paused') ? elapsedSeconds : 0);
  const formattedTodayStudy = formatSecondsToDetailed(currentTodayStudySeconds);

  // Sessões salvas pelo cronômetro no site para hoje
  const todayRecordedSessions = React.useMemo(() => {
    const todayStr = getLocalDateStr(new Date());
    if (!allSessions || allSessions.length === 0) return [];
    return allSessions.filter((s) => {
      const sDate = s.startTime ? getLocalDateStr(s.startTime) : (s.createdAt ? getLocalDateStr(s.createdAt) : '');
      return sDate === todayStr;
    });
  }, [allSessions]);

  // Sequência da semana vigente (Segunda a Domingo) para o StreakTracker
  const currentWeekStreak = React.useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Segunda, ...
    const diffToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;
    const todayStr = getLocalDateStr(now);

    return labels.map((dayLabel, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dateStr = getLocalDateStr(d);
      const isToday = dateStr === todayStr;
      const isFuture = d.getTime() > now.getTime() && !isToday;

      // Critério (A): Bater QUALQUER uma das metas (questões respondidas OU tempo no cronômetro da agenda)
      const questionsAnswered = stats?.historyByDay?.find((h) => h.date === dateStr)?.answered || 0;
      const timerSeconds = (allSessions || []).filter((s) => {
        if (!s.startTime) return false;
        return getLocalDateStr(s.startTime) === dateStr;
      }).reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);

      const totalTimer = timerSeconds + (isToday && (timerStatus === 'running' || timerStatus === 'paused') ? elapsedSeconds : 0);

      const isCompleted = questionsAnswered > 0 || totalTimer > 0;

      return {
        dayLabel,
        dateStr,
        isCompleted,
        isToday,
        isFuture
      };
    });
  }, [stats?.historyByDay, allSessions, timerStatus, elapsedSeconds]);

  useEffect(() => {
    const updated = getAccountTargetExam(user);
    setTargetExamName(updated.examName);
    setTargetDaysLeft(updated.daysLeft);
  }, [user]);

  // Sincronização de prova alvo via evento
  useEffect(() => {
    const handleTargetChange = () => {
      const updated = getAccountTargetExam(user);
      setTargetExamName(updated.examName);
      setTargetDaysLeft(updated.daysLeft);
    };
    window.addEventListener('bancoresidencia_target_exam_changed', handleTargetChange);
    window.addEventListener('storage', handleTargetChange);
    return () => {
      window.removeEventListener('bancoresidencia_target_exam_changed', handleTargetChange);
      window.removeEventListener('storage', handleTargetChange);
    };
  }, [user]);

  // Edição livre de metas
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [customGoalQuestions, setCustomGoalQuestions] = useState<number>(dailyGoal);
  const [customGoalTime, setCustomGoalTime] = useState<number>(120);

  const handleToggleEditGoals = () => {
    if (!isEditingGoals) {
      setCustomGoalQuestions(dailyGoal);
      setCustomGoalTime(dailyTimeGoal);
    }
    setIsEditingGoals((prev) => !prev);
  };

  const handleSaveCustomGoals = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = Math.max(1, Number(customGoalQuestions) || 1);
    const t = Math.max(1, Number(customGoalTime) || 1);
    onUpdateDailyGoal(q);
    setDailyTimeGoal(t);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(dailyTimeGoalStorageKey, String(t));
        localStorage.removeItem('bancoresidencia_daily_time_goal');
        localStorage.removeItem('bancoresidencia_custom_daily_goal');
      } catch { }
    }
    if (user?.id && user.id !== 'demo-student') {
      if (dailyTimeGoalDebounceRef.current) clearTimeout(dailyTimeGoalDebounceRef.current);
      dailyTimeGoalDebounceRef.current = setTimeout(async () => {
        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id === user.id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('preferences')
              .eq('id', user.id)
              .maybeSingle();
            const currentPrefs = (profile?.preferences as Record<string, unknown>) || {};
            await supabase
              .from('profiles')
              .update({
                preferences: {
                  ...currentPrefs,
                  dailyTimeGoal: t,
                  updatedAt: new Date().toISOString()
                }
              })
              .eq('id', user.id);
          }
        } catch (err) {
          console.warn('[StudentHomeDashboard] Erro ao sincronizar dailyTimeGoal no Supabase:', err);
        }
      }, 500);
    }
    setIsEditingGoals(false);
  };

  // Tempo de estudo do dia vinculado exclusivamente ao cronômetro da agenda
  const todayStudyMinutes = Math.floor(currentTodayStudySeconds / 60);
  const timeGoalPercentage = Math.min(100, Math.round((todayStudyMinutes / (dailyTimeGoal || 1)) * 100));

  // Animação fluida e orgânica dos anéis de progresso das metas diárias (Questões e Tempo)
  const [animatedGoalPercentages, setAnimatedGoalPercentages] = useState<{ questions: number; time: number }>({
    questions: 0,
    time: 0
  });
  const prevGoalPercentagesRef = useRef<{ questions: number; time: number }>({ questions: 0, time: 0 });

  useEffect(() => {
    const targetQ = Math.max(0, Math.min(100, goalPercentage));
    const targetT = Math.max(0, Math.min(100, timeGoalPercentage));
    const startQ = prevGoalPercentagesRef.current.questions;
    const startT = prevGoalPercentagesRef.current.time;

    if (startQ === targetQ && startT === targetT && animatedGoalPercentages.questions === targetQ && animatedGoalPercentages.time === targetT) {
      return;
    }
    prevGoalPercentagesRef.current = { questions: targetQ, time: targetT };

    let startTime: number | null = null;
    let lastUpdate = 0;
    const duration = 750; // ms de transição suave
    let animId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (currentTime - lastUpdate >= 20 || progress >= 1) {
        lastUpdate = currentTime;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentQ = startQ + (targetQ - startQ) * easeOut;
        const currentT = startT + (targetT - startT) * easeOut;
        setAnimatedGoalPercentages({
          questions: progress >= 1 ? targetQ : Math.round(currentQ),
          time: progress >= 1 ? targetT : Math.round(currentT)
        });
      }

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [goalPercentage, timeGoalPercentage]);

  // Scores de todos os alunos da plataforma para calibrar a curva adaptável
  const [platformScores, setPlatformScores] = useState<number[]>(() => getBaselinePlatformScores());

  const [ranking, setRanking] = useState<{ userId: string; percentile: number | null } | null>(null);
  const rankingPercentile = ranking && ranking.userId === user?.id ? ranking.percentile : null;

  useEffect(() => {
    const userId = user?.id;
    if (!userId || userId === 'demo-student') return;
    const key = rankingPercentileStorageKey(userId);
    const controller = new AbortController();
    const fetchOfficialRankingPercentile = async () => {
      try {
        const res = await fetch('/api/ranking?limit=1', { signal: controller.signal, cache: 'no-store' });
        if (!res.ok) return;
        const data: LeaderboardResponse = await res.json();
        if (!data.success || controller.signal.aborted) return;
        setPlatformScores(data.platformScores?.length ? data.platformScores : getBaselinePlatformScores());
        const percentile = data.currentUser?.percentile ?? null;
        setRanking({ userId, percentile });
        try {
          if (percentile !== null) localStorage.setItem(key, String(percentile));
          else localStorage.removeItem(key);
        } catch {
          // The in-memory percentile is still available.
        }
      } catch { }
    };

    const handleRankingUpdate = () => {
      try {
        const saved = localStorage.getItem(key);
        const percentile = saved ? Number(saved) : null;
        setRanking({ userId, percentile: percentile !== null && Number.isFinite(percentile) ? percentile : null });
      } catch { }
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) handleRankingUpdate();
    };

    queueMicrotask(() => { if (!controller.signal.aborted) handleRankingUpdate(); });
    void fetchOfficialRankingPercentile();
    window.addEventListener(RANKING_PERCENTILE_EVENT, handleRankingUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      controller.abort();
      window.removeEventListener(RANKING_PERCENTILE_EVENT, handleRankingUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [user?.id]);

  const effectivePercentile = (rankingPercentile !== null && rankingPercentile !== undefined)
    ? rankingPercentile
    : stats.percentileInfo.percentile;

  // Curva de distribuição calibrada empiricamente com base no desempenho conjunto de todos os alunos da plataforma
  const adaptiveCurve = useMemo(() => {
    return computeAdaptiveDistribution(platformScores, effectivePercentile);
  }, [platformScores, effectivePercentile]);

  // Tier cromático do percentil independente com suporte a modo claro/escuro
  const percentileTier = getPercentileColor(effectivePercentile);
  const isPercentileCalibrating = (rankingPercentile === null && (stats.percentileInfo.status === 'locked' || stats.percentileInfo.status === 'unranked'));
  const percentileCardBg = mode === 'light' ? percentileTier.cardBgLight : percentileTier.cardBgDark;
  const percentileCardBorder = mode === 'light' ? percentileTier.cardBorderLight : percentileTier.cardBorderDark;
  const percentileTextColor = mode === 'light' ? percentileTier.textLight : percentileTier.textDark;

  // Histórico de Provas Oficiais e Simulados Recentes
  const [officialExamsHistory, setOfficialExamsHistory] = useState<RecentExamRecord[]>(() => getRecentOfficialExams());
  const [mockExamsHistory, setMockExamsHistory] = useState<RecentMockRecord[]>(() => getRecentMockExams());

  // Drawer de Provas / Simulados / Caderno de Erros / Flashcards
  // Estado do Drawer / Modal Central Exclusivo por Categoria
  const [activeCentralDrawer, setActiveCentralDrawer] = useState<'cadernos' | 'provas' | 'simulados' | 'caderno_erros' | 'flashcards' | 'treinar_recomendacao' | 'mnemonico_detalhado' | 'agenda_detalhada' | 'dica_dia_detalhada' | null>(null);
  const [drawerSearch, setDrawerSearch] = useState('');
  const [drawerModality, setDrawerModality] = useState<OfficialExamModalityKey>('todas');
  const [drawerErrorSpecialty, setDrawerErrorSpecialty] = useState<string>('Todas');
  const [drawerFlashcardSpecialty, setDrawerFlashcardSpecialty] = useState<string>('Todas');

  // Seletor de abas da Retomada de Estudos (Cadernos, Provas, Simulados)
  const [studyResumeTab, setStudyResumeTab] = useState<'cadernos' | 'provas' | 'simulados'>('provas');

  // Dica do Dia: Seleciona 1 dica diária determinística baseada no que o aluno já estudou (resumos, flashcards ou questões)
  const activeClinicalTip = React.useMemo<ClinicalTipItem>(() => {
    const seenTopics = new Set<string>();

    // 1. Especialidades, temas, focos e subfocos vistos em questões respondidas
    if (userAnswers) {
      Object.values(userAnswers).forEach((ans: any) => {
        if (ans.specialty) seenTopics.add(String(ans.specialty).toLowerCase());
        if (ans.tema) seenTopics.add(String(ans.tema).toLowerCase());
        if (ans.foco) seenTopics.add(String(ans.foco).toLowerCase());
        if (ans.subfoco) seenTopics.add(String(ans.subfoco).toLowerCase());
      });
    }

    // 2. Cadernos e listas de estudo
    if (allLists) {
      allLists.forEach((l) => {
        if (l.title) seenTopics.add(l.title.toLowerCase());
      });
    }

    // 3. Flashcards do aluno
    try {
      if (typeof window !== 'undefined') {
        const rawFc = localStorage.getItem('bancoresidencia_flashcards_decks') || localStorage.getItem('bancoresidencia_flashcards');
        if (rawFc) {
          const parsed = JSON.parse(rawFc);
          if (Array.isArray(parsed)) {
            parsed.forEach((fc: any) => {
              if (fc.specialty) seenTopics.add(String(fc.specialty).toLowerCase());
              if (fc.tema) seenTopics.add(String(fc.tema).toLowerCase());
              if (fc.foco) seenTopics.add(String(fc.foco).toLowerCase());
              if (fc.subfoco) seenTopics.add(String(fc.subfoco).toLowerCase());
              if (fc.title) seenTopics.add(String(fc.title).toLowerCase());
            });
          }
        }
      }
    } catch (_) { }

    // 4. Resumos teóricos e materiais acessados
    try {
      if (typeof window !== 'undefined') {
        const rawMaterials = localStorage.getItem('bancoresidencia_recent_materials') || localStorage.getItem('bancoresidencia_study_history');
        if (rawMaterials) {
          const parsedMat = JSON.parse(rawMaterials);
          if (Array.isArray(parsedMat)) {
            parsedMat.forEach((m: any) => {
              if (m.specialty) seenTopics.add(String(m.specialty).toLowerCase());
              if (m.tema) seenTopics.add(String(m.tema).toLowerCase());
              if (m.foco) seenTopics.add(String(m.foco).toLowerCase());
              if (m.title) seenTopics.add(String(m.title).toLowerCase());
            });
          }
        }
      }
    } catch (_) { }

    // Filtra prioritariamente dicas dos subfocos, focos e temas estudados (com fallback suave)
    let pool = CLINICAL_TIPS_DATABASE;
    if (seenTopics.size > 0) {
      const filtered = CLINICAL_TIPS_DATABASE.filter((tip) => {
        const spec = tip.specialty.toLowerCase();
        const tema = tip.tema ? tip.tema.toLowerCase() : '';
        const foco = tip.foco ? tip.foco.toLowerCase() : '';
        const hasSubfocoMatch = tip.subfocos && tip.subfocos.some((sf) => {
          const sfl = sf.toLowerCase();
          return Array.from(seenTopics).some((seen) => seen.includes(sfl) || sfl.includes(seen));
        });
        const hasFocoMatch = foco && Array.from(seenTopics).some((seen) => seen.includes(foco) || foco.includes(seen));
        const hasTemaMatch = tema && Array.from(seenTopics).some((seen) => seen.includes(tema) || tema.includes(seen));
        const hasSpecMatch = Array.from(seenTopics).some((seen) => seen.includes(spec) || spec.includes(seen));

        return Boolean(hasSubfocoMatch || hasFocoMatch || hasTemaMatch || hasSpecMatch);
      });
      if (filtered.length > 0) {
        pool = filtered;
      }
    }

    // Seleciona deterministamente 1 dica por dia pelo dia do calendário
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    const dayIndex = Math.abs(dayOfYear) % pool.length;

    return pool[dayIndex] || CLINICAL_TIPS_DATABASE[0];
  }, [userAnswers, allLists]);

  // Identificação do caderno mais recente com fallback automático para o último não terminado
  const activeCaderno = React.useMemo(() => {
    if (!allLists || allLists.length === 0) return recentList || null;
    const mostRecent = recentList || allLists[0];
    const isMostRecentCompleted = (mostRecent.completedQuestions >= mostRecent.totalQuestions) || (mostRecent.progressPercentage >= 100);
    if (isMostRecentCompleted) {
      const unfinished = allLists.find(
        (l) => (l.completedQuestions < l.totalQuestions) && (l.progressPercentage < 100)
      );
      return unfinished || mostRecent;
    }
    return mostRecent;
  }, [recentList, allLists]);

  // Identificação do exame oficial mais recente e fallback para não concluído (Retomar Estudos)
  const { primary: baseOfficialExam, pendingFallback: pendingOfficialExam } = React.useMemo(
    () => getExamWithPendingFallback(officialExamsHistory),
    [officialExamsHistory]
  );
  const currentOfficialExam = (baseOfficialExam?.status === 'concluida' && pendingOfficialExam) ? pendingOfficialExam : baseOfficialExam;

  // Identificação do simulado mais recente e fallback para não concluído
  const { primary: baseMockExam, pendingFallback: pendingMockExam } = React.useMemo(
    () => getExamWithPendingFallback(mockExamsHistory),
    [mockExamsHistory]
  );
  const currentMockExam = (baseMockExam?.status === 'concluida' && pendingMockExam) ? pendingMockExam : baseMockExam;

  // Lista detalhada de erros pendentes para o Drawer Central e KPIs
  const pendingErrorsList = React.useMemo(() => {
    if (!userAnswers) return [];
    return Object.entries(userAnswers)
      .filter(([, ans]) => !ans.isCorrect && ans.statusRetrial !== 'recuperado')
      .map(([qid, ans]) => ({
        questionId: qid,
        ...ans
      }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [userAnswers]);

  // Contagem inteligente de erros pendentes para a Revisão Espaçada
  const pendingErrorsCount = React.useMemo(() => {
    if (userAnswers && Object.keys(userAnswers).length > 0) {
      return pendingErrorsList.length;
    }
    return stats.totalIncorrect || 0;
  }, [userAnswers, pendingErrorsList.length, stats.totalIncorrect]);

  // Área com maior volume de erros pendentes (ponto crítico de atenção)
  const mostCriticalArea = React.useMemo(() => {
    if (pendingErrorsList.length === 0) return null;
    const counts: Record<string, number> = {};
    pendingErrorsList.forEach((e) => {
      const spec = e.specialty || 'Outros';
      counts[spec] = (counts[spec] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { name: sorted[0][0], count: sorted[0][1] } : null;
  }, [pendingErrorsList]);

  // Estatísticas e lista do acervo de Flashcards (FSRS)
  const flashcardsStats = React.useMemo(() => {
    if (!isMounted) {
      return { dueToday: 0, newCards: 0, review: 0, total: 0, desiredRetention: 90 };
    }
    try {
      return flashcardsService.getStats(user?.id);
    } catch {
      return { dueToday: 30, newCards: 20, review: 1, total: 31, desiredRetention: 90 };
    }
  }, [activeCentralDrawer, isMounted]);

  const flashcardsTodayList = React.useMemo(() => {
    try {
      return flashcardsService.getFlashcards({ userId: user?.id });
    } catch {
      return [];
    }
  }, [activeCentralDrawer]);

  // Histórico recente dos últimos 5 dias para o Mini Sparkline de Aproveitamento
  const recentDailyAccuracy = React.useMemo(() => {
    if (!stats.historyByDay || stats.historyByDay.length === 0) return [];
    return stats.historyByDay.slice(-5).map((d) => {
      const acc = d.answered > 0 ? Math.round((d.correct / d.answered) * 100) : 0;
      return {
        date: d.date,
        acc,
        answered: d.answered,
        correct: d.correct
      };
    });
  }, [stats.historyByDay]);

  // Estrutura do Raio-X das 6 Grandes Áreas da Residência Médica (separando Ginecologia e Obstetrícia)
  const CORE_AREAS = React.useMemo(() => [
    {
      id: 'clinica',
      label: 'Clínica Médica',
      filterName: 'Clínica Médica',
      icon: Stethoscope,
      colorHex: '#3B82F6',
      bgLight: 'bg-blue-500/10',
      textClass: 'text-blue-600 dark:text-blue-400',
      borderClass: 'border-blue-500/20'
    },
    {
      id: 'cirurgia',
      label: 'Cirurgia Geral',
      filterName: 'Cirurgia Geral',
      icon: Activity,
      colorHex: '#F43F5E',
      bgLight: 'bg-rose-500/10',
      textClass: 'text-rose-600 dark:text-rose-400',
      borderClass: 'border-rose-500/20'
    },
    {
      id: 'ginecologia',
      label: 'Ginecologia',
      filterName: 'Ginecologia',
      icon: UterusIcon,
      colorHex: '#EC4899',
      bgLight: 'bg-pink-500/10',
      textClass: 'text-pink-600 dark:text-pink-400',
      borderClass: 'border-pink-500/20'
    },
    {
      id: 'obstetricia',
      label: 'Obstetrícia',
      filterName: 'Obstetrícia',
      icon: PregnantWomanIcon,
      colorHex: '#8B5CF6',
      bgLight: 'bg-purple-500/10',
      textClass: 'text-purple-600 dark:text-purple-400',
      borderClass: 'border-purple-500/20'
    },
    {
      id: 'pediatria',
      label: 'Pediatria',
      filterName: 'Pediatria',
      icon: Baby,
      colorHex: '#F59E0B',
      bgLight: 'bg-amber-500/10',
      textClass: 'text-amber-600 dark:text-amber-400',
      borderClass: 'border-amber-500/20'
    },
    {
      id: 'preventiva',
      label: 'Med. Preventiva',
      filterName: 'Medicina Preventiva',
      icon: ShieldCheck,
      colorHex: '#10B981',
      bgLight: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500/20'
    }
  ], []);

  // Helper de status inteligente (elimina fadiga de alerta e evita "Atenção" em amostras pequenas)
  const getAreaStatus = (total: number, accuracy: number) => {
    if (total === 0) return { label: 'Sem dados', color: 'text-zinc-400 dark:text-zinc-500 bg-zinc-500/10 border-zinc-500/20' };
    if (total < 10) return { label: 'Calibrando', color: 'text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700/60' };
    if (accuracy >= 75) return { label: 'Forte', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (accuracy >= 60) return { label: 'Regular', color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20' };
    return { label: 'Reforçar', color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' };
  };

  // Animação Hero da Medalha e Curva do Percentil Oficial
  const [isMedalAnimating, setIsMedalAnimating] = useState(false);
  const [curveAnimKey, setCurveAnimKey] = useState<number>(0);
  const percentileCardRef = useRef<HTMLDivElement>(null);
  const percentileMedalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasSeenIntro = sessionStorage.getItem('banco_medal_intro_seen');
    if (hasSeenIntro) return;

    sessionStorage.setItem('banco_medal_intro_seen', 'true');

    const updateCenter = () => {
      if (percentileCardRef.current && percentileMedalRef.current) {
        const cardRect = percentileCardRef.current.getBoundingClientRect();
        const medalRect = percentileMedalRef.current.getBoundingClientRect();
        const dx = cardRect.left + cardRect.width / 2 - (medalRect.left + medalRect.width / 2);
        const dy = cardRect.top + cardRect.height / 2 - (medalRect.top + medalRect.height / 2);
        percentileCardRef.current.style.setProperty('--medal-center-x', `${dx}px`);
        percentileCardRef.current.style.setProperty('--medal-center-y', `${dy}px`);
      }
    };

    updateCenter();
    setIsMedalAnimating(true);
    window.addEventListener('resize', updateCenter);

    const t = setTimeout(() => {
      setIsMedalAnimating(false);
    }, 1800);

    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', updateCenter);
    };
  }, []);

  const triggerMedalAnimation = () => {
    setIsMedalAnimating(false);
    setCurveAnimKey(k => k + 1);
    setTimeout(() => {
      if (percentileCardRef.current && percentileMedalRef.current) {
        const cardRect = percentileCardRef.current.getBoundingClientRect();
        const medalRect = percentileMedalRef.current.getBoundingClientRect();
        const dx = cardRect.left + cardRect.width / 2 - (medalRect.left + medalRect.width / 2);
        const dy = cardRect.top + cardRect.height / 2 - (medalRect.top + medalRect.height / 2);
        percentileCardRef.current.style.setProperty('--medal-center-x', `${dx}px`);
        percentileCardRef.current.style.setProperty('--medal-center-y', `${dy}px`);
      }
      setIsMedalAnimating(true);
      setTimeout(() => {
        setIsMedalAnimating(false);
      }, 1800);
    }, 20);
  };

  // Filtro de período para o Raio-X das Especialidades (Drawer Imagem 5)
  const [specialtyPeriod, setSpecialtyPeriod] = useState<PeriodFilter>('7d');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [isPeriodDrawerOpen, setIsPeriodDrawerOpen] = useState<boolean>(false);

  const getSpecialtyPeriodLabel = () => {
    if (specialtyPeriod === 'custom' && customStartDate && customEndDate) {
      const s = customStartDate.split('-');
      const e = customEndDate.split('-');
      if (s.length === 3 && e.length === 3) {
        return `${s[2]}/${s[1]} a ${e[2]}/${e[1]}`;
      }
      return 'Personalizado';
    }
    const map: Record<string, string> = {
      '1d': '1 Dia (Hoje)',
      '7d': '7 Dias (Padrão)',
      '30d': '30 Dias',
      'mes': 'Mês Atual',
      '3m': '3 Meses',
      '6m': '6 Meses',
      'all': 'Todo o Histórico'
    };
    return map[specialtyPeriod] || '7 Dias (Padrão)';
  };

  const [currentTime] = useState(() => Date.now());

  // Filtragem das respostas do aluno pelo período selecionado
  const filteredAnswersByPeriod = React.useMemo(() => {
    if (!userAnswers) return [];
    const all = Object.values(userAnswers);
    if (all.length === 0) return [];
    const now = currentTime;

    return all.filter((ans) => {
      const ts = ans.timestamp;
      if (!ts) return true;
      if (specialtyPeriod === 'custom' && customStartDate && customEndDate) {
        const start = new Date(customStartDate).getTime();
        const end = new Date(customEndDate + 'T23:59:59').getTime();
        return ts >= start && ts <= end;
      }
      if (specialtyPeriod === '1d') {
        const startOfDay = new Date(new Date(now).getFullYear(), new Date(now).getMonth(), new Date(now).getDate(), 0, 0, 0, 0).getTime();
        return ts >= startOfDay;
      }
      if (specialtyPeriod === '7d') return ts >= now - 7 * 86400000;
      if (specialtyPeriod === '30d') return ts >= now - 30 * 86400000;
      if (specialtyPeriod === 'mes') {
        const startOfMonth = new Date(new Date(now).getFullYear(), new Date(now).getMonth(), 1).getTime();
        return ts >= startOfMonth;
      }
      if (specialtyPeriod === '3m') return ts >= now - 90 * 86400000;
      if (specialtyPeriod === '6m') return ts >= now - 180 * 86400000;
      return true; // 'all'
    });
  }, [userAnswers, specialtyPeriod, customStartDate, customEndDate, currentTime]);


  // Helper de correspondência de área clínica (separando Ginecologia e Obstetrícia)
  const isAnswerMatchingArea = (areaId: string, specialtyName?: string, tema?: string) => {
    const spec = (specialtyName || '').toLowerCase();
    const t = (tema || '').toLowerCase();
    if (areaId === 'clinica') return spec.includes('clínica') || spec.includes('clinica');
    if (areaId === 'cirurgia') return spec.includes('cirurg');
    if (areaId === 'pediatria') return spec.includes('pediatr');
    if (areaId === 'preventiva') return spec.includes('prevent') || spec.includes('coletiva');
    if (areaId === 'obstetricia') {
      if (spec.includes('obstet')) return true;
      if (spec.includes('ginec') && (t.includes('obstet') || t.includes('parto') || t.includes('gestan') || t.includes('puerp') || t.includes('pré-natal') || t.includes('pre-natal') || t.includes('feto'))) return true;
      return false;
    }
    if (areaId === 'ginecologia') {
      if (spec.includes('ginec') && !spec.includes('obstet')) return true;
      if (spec.includes('ginec') && !t.includes('obstet') && !t.includes('parto') && !t.includes('gestan') && !t.includes('puerp') && !t.includes('pré-natal') && !t.includes('pre-natal') && !t.includes('feto')) return true;
      return false;
    }
    return false;
  };

  const areasResumo = React.useMemo(() => {
    const hasRealAnswers = filteredAnswersByPeriod.length > 0;

    return CORE_AREAS.map((area) => {
      if (hasRealAnswers) {
        const areaAnswers = filteredAnswersByPeriod.filter((ans) => isAnswerMatchingArea(area.id, ans.specialty, ans.tema));

        const total = areaAnswers.length;
        const correct = areaAnswers.filter((a) => a.isCorrect).length;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

        return {
          ...area,
          total,
          correct,
          accuracy,
          hasData: total > 0
        };
      }

      // Fallback inteligente usando stats.bySpecialty com proporção pelo período
      let match = stats.bySpecialty?.find((s) => {
        const name = (s.specialty || '').toLowerCase();
        if (area.id === 'clinica') return name.includes('clínica') || name.includes('clinica');
        if (area.id === 'cirurgia') return name.includes('cirurg');
        if (area.id === 'pediatria') return name.includes('pediatr');
        if (area.id === 'preventiva') return name.includes('prevent') || name.includes('coletiva');
        if (area.id === 'obstetricia') return name.includes('obstet') && !name.includes('ginec');
        if (area.id === 'ginecologia') return name.includes('ginec') && !name.includes('obstet');
        return false;
      });

      // Se não encontrou individual para Gineco ou Obstetrícia, checar entrada combinada
      let isCombinedSplit = false;
      if (!match && (area.id === 'ginecologia' || area.id === 'obstetricia')) {
        const combined = stats.bySpecialty?.find((s) => {
          const name = (s.specialty || '').toLowerCase();
          return name.includes('ginec') && name.includes('obstet');
        });
        if (combined) {
          match = combined;
          isCombinedSplit = true;
        }
      }

      let factor = 1;
      if (specialtyPeriod === '7d') factor = 0.25;
      else if (specialtyPeriod === '30d') factor = 0.55;
      else if (specialtyPeriod === 'mes') factor = 0.45;
      else if (specialtyPeriod === '3m') factor = 0.8;
      else if (specialtyPeriod === '6m') factor = 0.95;

      const rawTotal = Math.round((match?.total || 0) * (isCombinedSplit ? 0.5 : 1));
      const rawCorrect = Math.round((match?.correct || 0) * (isCombinedSplit ? 0.5 : 1));
      const total = specialtyPeriod === 'all' ? rawTotal : Math.round(rawTotal * factor);
      const correct = specialtyPeriod === 'all' ? rawCorrect : Math.min(total, Math.round(rawCorrect * factor));
      const accuracy = total > 0 ? (match?.accuracy !== undefined ? Math.round(match.accuracy) : Math.round((correct / total) * 100)) : 0;

      return {
        ...area,
        total,
        correct,
        accuracy,
        hasData: total > 0
      };
    });
  }, [CORE_AREAS, filteredAnswersByPeriod, stats.bySpecialty, specialtyPeriod]);

  // Identificação do ponto com maior potencial de alavancagem (menor aproveitamento testado)
  const recommendedArea = React.useMemo(() => {
    const tested = areasResumo.filter((a) => a.hasData);
    if (tested.length > 0) {
      const sorted = [...tested].sort((a, b) => a.accuracy - b.accuracy);
      return sorted[0];
    }
    return areasResumo[0];
  }, [areasResumo]);

  // 1. Subtemas críticos da especialidade recomendada (dados estáticos movidos para src/data/dashboardMnemonicsData.ts)
  const criticalSubtopics = React.useMemo(() => {
    const areaKey = recommendedArea?.id || 'cirurgia';
    const fallbackList = CRITICAL_SUBTOPICS_MAP[areaKey] || CRITICAL_SUBTOPICS_MAP['cirurgia'];

    if (userAnswers && Object.keys(userAnswers).length > 0) {
      const themeMap: Record<string, { total: number; correct: number }> = {};
      Object.values(userAnswers).forEach((ans) => {
        if (isAnswerMatchingArea(areaKey, ans.specialty, ans.tema) && ans.tema) {
          const t = ans.tema.trim();
          if (!themeMap[t]) themeMap[t] = { total: 0, correct: 0 };
          themeMap[t].total += 1;
          if (ans.isCorrect) themeMap[t].correct += 1;
        }
      });

      const testedThemes = Object.entries(themeMap)
        .map(([name, data]) => ({
          name,
          accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
          total: data.total
        }))
        .sort((a, b) => a.accuracy - b.accuracy);

      if (testedThemes.length >= 2) {
        return testedThemes.slice(0, 3);
      }
    }

    return fallbackList.map((item) => ({
      name: item.name,
      accuracy: recommendedArea.hasData ? Math.max(0, Math.min(100, Math.round(recommendedArea.accuracy * (item.defaultAccuracy / 40)))) : item.defaultAccuracy,
      total: 10
    }));
  }, [recommendedArea, userAnswers]);

  // 2. Mnemônico clínico ativo com detalhes ampliados
  const activeDetailedMnemonic = React.useMemo(() => {
    const areaKey = recommendedArea?.id || 'cirurgia';
    return DETAILED_MNEMONICS_MAP[areaKey] || DETAILED_MNEMONICS_MAP['cirurgia'];
  }, [recommendedArea?.id]);

  const activeMnemonic = React.useMemo(() => {
    return {
      title: activeDetailedMnemonic.title,
      content: activeDetailedMnemonic.content,
      rule: activeDetailedMnemonic.rule
    };
  }, [activeDetailedMnemonic]);

  // 3. Estado de favoritar mnemônico (persistido no localStorage)
  const [savedMnemonic, setSavedMnemonic] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const areaKey = recommendedArea?.id || 'cirurgia';
      try {
        const savedList: string[] = JSON.parse(localStorage.getItem('bancoresidencia_saved_mnemonics') || '[]');
        return savedList.includes(areaKey);
      } catch {
        return false;
      }
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const areaKey = recommendedArea?.id || 'cirurgia';
      try {
        const savedList: string[] = JSON.parse(localStorage.getItem('bancoresidencia_saved_mnemonics') || '[]');
        setSavedMnemonic(savedList.includes(areaKey));
      } catch {
        setSavedMnemonic(false);
      }
    }
  }, [recommendedArea?.id]);

  const toggleSaveMnemonic = () => {
    const areaKey = recommendedArea?.id || 'cirurgia';
    setSavedMnemonic((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        try {
          const savedList: string[] = JSON.parse(localStorage.getItem('bancoresidencia_saved_mnemonics') || '[]');
          const updated = next ? Array.from(new Set([...savedList, areaKey])) : savedList.filter((k) => k !== areaKey);
          localStorage.setItem('bancoresidencia_saved_mnemonics', JSON.stringify(updated));
        } catch { }
      }
      return next;
    });
  };

  // 3.0. Modo Desenvolvedor: Visualizar e inspecionar qualquer um dos 385 cards na tela de início
  const [devCardIndex, setDevCardIndex] = useState<number | null>(null);
  const [showDevTipModal, setShowDevTipModal] = useState<boolean>(false);
  const [devSearchQuery, setDevSearchQuery] = useState<string>('');
  const [devSpecialtyFilter, setDevSpecialtyFilter] = useState<string>('Todas');

  const displayedClinicalTip = (devCardIndex !== null && CLINICAL_TIPS_DATABASE[devCardIndex])
    ? CLINICAL_TIPS_DATABASE[devCardIndex]
    : activeClinicalTip;

  const currentTipIndex = devCardIndex !== null 
    ? devCardIndex 
    : CLINICAL_TIPS_DATABASE.findIndex(t => t.id === activeClinicalTip?.id);

  // 3.1. Estado de favoritar Dica do Dia no FSRS (persistido no localStorage)
  const [savedTipState, setSavedTipState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedList: string[] = JSON.parse(localStorage.getItem('bancoresidencia_saved_tips') || '[]');
        return Boolean(displayedClinicalTip?.id && savedList.includes(displayedClinicalTip.id));
      } catch {
        return false;
      }
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && displayedClinicalTip?.id) {
      try {
        const savedList: string[] = JSON.parse(localStorage.getItem('bancoresidencia_saved_tips') || '[]');
        setSavedTipState(savedList.includes(displayedClinicalTip.id));
      } catch {
        setSavedTipState(false);
      }
    }
  }, [displayedClinicalTip?.id]);

  const toggleSaveTip = () => {
    if (!displayedClinicalTip?.id) return;
    const tipId = displayedClinicalTip.id;
    setSavedTipState((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        try {
          const savedList: string[] = JSON.parse(localStorage.getItem('bancoresidencia_saved_tips') || '[]');
          const updated = next ? Array.from(new Set([...savedList, tipId])) : savedList.filter((k) => k !== tipId);
          localStorage.setItem('bancoresidencia_saved_tips', JSON.stringify(updated));
        } catch { }
      }
      return next;
    });
  };

  // 3.2. Estado de Active Recall (Revelação 1 a 1 e Revelar Todos) na Dica do Dia
  const [revealedTipItems, setRevealedTipItems] = useState<Record<number, boolean>>({});
  const [revealAllTipItems, setRevealAllTipItems] = useState<boolean>(false);
  const [activeZoomImage, setActiveZoomImage] = useState<{
    url: string;
    caption?: string;
    source?: string;
    author?: string;
    license?: string;
    originUrl?: string;
  } | null>(null);

  // Reseta estado ao mudar a dica
  useEffect(() => {
    setRevealedTipItems({});
    setRevealAllTipItems(false);
  }, [displayedClinicalTip?.id]);

  const toggleRevealTipItem = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRevealedTipItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleRevealAllTipItems = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRevealAllTipItems((prev) => {
      const next = !prev;
      const updated: Record<number, boolean> = {};
      displayedClinicalTip?.chips?.forEach((_, i) => {
        updated[i] = next;
      });
      setRevealedTipItems(updated);
      return next;
    });
  };

  // 3.1. Estado de Conexão com Google Agenda
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bancoresidencia_google_calendar_connected') === 'true';
    }
    return false;
  });

  const [googleCalendarAccount, setGoogleCalendarAccount] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bancoresidencia_google_calendar_account') || 'aluno.medicina@uf.br';
    }
    return 'aluno.medicina@uf.br';
  });

  const [googleIcalUrl, setGoogleIcalUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bancoresidencia_google_ical_url') || '';
    }
    return '';
  });

  const [googleRoutinePreset, setGoogleRoutinePreset] = useState<'internato' | 'plantao' | 'estudos'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('bancoresidencia_google_routine_preset') as any) || 'internato';
    }
    return 'internato';
  });

  const [lastCalendarSyncTime, setLastCalendarSyncTime] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bancoresidencia_google_last_sync') || 'Hoje às 08:30';
    }
    return 'Hoje às 08:30';
  });

  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [simulatedHour, setSimulatedHour] = useState<number | null>(null);

  // DailyScheduleSlot importada de ./dashboard/scheduleTypes

  const [realCalendarEvents, setRealCalendarEvents] = useState<DailyScheduleSlot[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bancoresidencia_real_calendar_events');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  // Tarefas de estudo adicionadas pelo usuário ou aceitas a partir das sugestões da IA
  const [userScheduledTasks, setUserScheduledTasks] = useState<DailyScheduleSlot[]>(() => {
    if (typeof window !== 'undefined') {
      const scopedKey = getUserScheduledTasksStorageKey(user?.id);
      const saved = localStorage.getItem(scopedKey);
      if (saved) {
        try {
          const parsed: DailyScheduleSlot[] = JSON.parse(saved);
          const cleanTasks = parsed.filter(t => !t.id.startsWith('task_sess_') && !t.id.startsWith('sess_slot_'));
          if (cleanTasks.length !== parsed.length) {
            localStorage.setItem(scopedKey, JSON.stringify(cleanTasks));
          }
          return cleanTasks;
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  // Carrega e sincroniza tarefas da agenda vinculadas à conta do aluno
  useEffect(() => {
    let active = true;
    loadUserScheduledTasks(user?.id).then((tasks) => {
      if (active) {
        setUserScheduledTasks(tasks);
      }
    });

    const handleStorageChange = (e: StorageEvent) => {
      const userTasksKey = getUserScheduledTasksStorageKey(user?.id);
      if ((e.key === userTasksKey || e.key === 'bancoresidencia_user_scheduled_tasks') && e.newValue) {
        try { setUserScheduledTasks(JSON.parse(e.newValue)); } catch { }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      active = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user?.id]);

  // Estado para Análise de Horários Livres com IA
  const [isAnalyzingSchedule, setIsAnalyzingSchedule] = useState(false);
  const [scheduleAiAnalysis, setScheduleAiAnalysis] = useState<{
    summary: string;
    freeGaps: Array<{ startTime: string; endTime: string; durationMinutes: number }>;
    suggestions: DailyScheduleSlot[];
  } | null>(null);
  const [showAiSchedulePanel, setShowAiSchedulePanel] = useState(false);
  const [showAiScheduleDrawer, setShowAiScheduleDrawer] = useState(false);
  const [isBatchSyncing, setIsBatchSyncing] = useState(false);

  const [calendarSyncMode, setCalendarSyncMode] = useState<'ical' | 'api'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('bancoresidencia_google_calendar_mode') as any) || 'api';
    }
    return 'api';
  });

  const [googleAccessToken, setGoogleAccessToken] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bancoresidencia_google_access_token') || '';
    }
    return '';
  });

  const googleClientId = PUBLIC_GOOGLE_CALENDAR_CLIENT_ID || DEFAULT_GOOGLE_CALENDAR_CLIENT_ID;

  const [exportingSlotId, setExportingSlotId] = useState<string | null>(null);
  const [exportedSlotIds, setExportedSlotIds] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bancoresidencia_exported_slots');
        if (saved) return JSON.parse(saved);
      } catch { }
    }
    return {};
  });
  const [isBatchSyncCompleted, setIsBatchSyncCompleted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bancoresidencia_batch_sync_completed') === 'true';
    }
    return false;
  });
  const [syncSuccessAnimation, setSyncSuccessAnimation] = useState<boolean>(false);

  const cleanEventDescription = (desc?: string) => {
    if (!desc) return '';
    const lower = desc.toLowerCase().trim();
    if (
      lower.includes('evento importado') ||
      lower.includes('evento sincronizado') ||
      lower.includes('google calendar api') ||
      lower.includes('via google')
    ) {
      return '';
    }
    return desc;
  };

  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [calendarSyncError, setCalendarSyncError] = useState<string | null>(null);
  const [calendarSyncSuccessMsg, setCalendarSyncSuccessMsg] = useState<string | null>(null);

  // ── ESTADOS E RECURSOS DA CENTRAL DE AGENDA OTIMIZADA (2 COLUNAS & ADAPTAÇÃO MÉDICA) ──
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('todos');
  const [showAddManualSlot, setShowAddManualSlot] = useState(false);
  const [showAddManualModal, setShowAddManualModal] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [customDelayMinutes, setCustomDelayMinutes] = useState(60);
  const [showAiCommandModal, setShowAiCommandModal] = useState(false);
  const [aiUserCommand, setAiUserCommand] = useState('');
  const [manualSlotTitle, setManualSlotTitle] = useState('');
  const [manualSlotCategory, setManualSlotCategory] = useState<'estudo' | 'flashcard' | 'revisao' | 'simulado'>('estudo');
  const [manualSlotStart, setManualSlotStart] = useState('14:00');
  const [manualSlotEnd, setManualSlotEnd] = useState('15:00');
  const [manualSlotNotes, setManualSlotNotes] = useState('');

  // Detecção Semântica de Plantões, Internato e Compromissos Clínicos no Google Agenda
  const isHospitalOrDutyEvent = useCallback((slot: DailyScheduleSlot) => {
    if (slot.source !== 'google') return false;
    const text = `${slot.title} ${slot.description || ''} ${slot.location || ''}`.toLowerCase();
    return (
      text.includes('plant') ||
      text.includes('internat') ||
      text.includes('enferm') ||
      text.includes('uti') ||
      text.includes('cirurg') ||
      text.includes('ps') ||
      text.includes('pronto') ||
      text.includes('hospital') ||
      text.includes('ambul') ||
      text.includes('round') ||
      text.includes('estágio') ||
      text.includes('estagio')
    );
  }, []);

  // Botão de Emergência: "Atrasei no Plantão / Reorganizar Meu Dia"
  const handleReorganizeDelayedSchedule = useCallback((delayMinutes: number = 60) => {
    const minsToUse = Math.max(15, Math.min(360, delayMinutes));
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    setUserScheduledTasks((prev) => {
      if (prev.length === 0) return prev;

      const formatMins = (m: number) => {
        const h = Math.floor(m / 60) % 24;
        const min = m % 60;
        return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      };

      let runningMins = Math.max(currentMins + 10, 8 * 60); // Inicia a partir de agora + 10 min
      const updated = prev.map((task) => {
        // Se a tarefa já foi concluída/passou, mantém como estava
        if (task.endMinutes <= currentMins) return task;

        const duration = Math.max(20, task.endMinutes - task.startMinutes);
        const newStart = Math.max(runningMins, task.startMinutes + minsToUse);
        const newEnd = newStart + duration;
        runningMins = newEnd + 15; // Intervalo de 15 min de descanso entre blocos

        return {
          ...task,
          startMinutes: newStart,
          endMinutes: newEnd,
          startTime: formatMins(newStart),
          endTime: formatMins(newEnd),
          rationale: `Reorganizado após atraso de ${minsToUse}m no plantão/rotina. Horário protegido sem sobrecarga.`
        };
      });

      updated.forEach((t) => {
        saveUserScheduledTask(t, user?.id).catch(() => { });
      });
      return updated;
    });

    setShowDelayModal(false);
    setCalendarSyncSuccessMsg(`Cronograma reorganizado com sucesso (+${minsToUse}m)! A IA adaptou seus blocos restantes.`);
  }, [user?.id]);

  // Criação de Bloco de Estudo Manual Personalizado
  const handleCreateManualSlot = useCallback(() => {
    if (!manualSlotTitle.trim()) return;

    const [sh, sm] = manualSlotStart.split(':').map(Number);
    const [eh, em] = manualSlotEnd.split(':').map(Number);
    const startMins = (sh || 0) * 60 + (sm || 0);
    const endMins = (eh || 0) * 60 + (em || 0);

    const actionMap: Record<string, 'treinar' | 'flashcards' | 'caderno_erros' | 'simulado'> = {
      estudo: 'treinar',
      flashcard: 'flashcards',
      revisao: 'caderno_erros',
      simulado: 'simulado'
    };

    const newSlot: DailyScheduleSlot = {
      id: `manual_slot_${Date.now()}`,
      title: manualSlotTitle.trim(),
      category: manualSlotCategory as any,
      startTime: manualSlotStart,
      endTime: manualSlotEnd,
      startMinutes: startMins,
      endMinutes: endMins > startMins ? endMins : startMins + 60,
      source: 'plataforma',
      action: actionMap[manualSlotCategory] || 'treinar',
      description: manualSlotNotes.trim() || 'Bloco de estudo personalizado criado por você',
      rationale: 'Planejamento pessoal adicionado à grade.'
    };

    setUserScheduledTasks(prev => [...prev, newSlot]);
    saveUserScheduledTask(newSlot, user?.id).catch((err) => {
      console.warn('Erro ao salvar bloco manual na conta do aluno:', err);
    });

    setManualSlotTitle('');
    setManualSlotNotes('');
    setShowAddManualSlot(false);
    setShowAddManualModal(false);
    setCalendarSyncSuccessMsg(`Bloco "${newSlot.title}" adicionado à sua agenda!`);
  }, [manualSlotTitle, manualSlotStart, manualSlotEnd, manualSlotCategory, manualSlotNotes]);

  // ── Sincronização iCal (.ics) ─────────────────────────────────────────────
  const syncIcalEvents = async (urlToSync?: string, isSilent = false): Promise<boolean> => {
    const targetUrl = (urlToSync !== undefined ? urlToSync : googleIcalUrl).trim();
    if (!targetUrl) {
      if (!isSilent) setCalendarSyncError('Por favor, cole o Endereço Secreto iCal (.ics) da sua agenda.');
      return false;
    }

    setIsSyncingCalendar(true);
    if (!isSilent) {
      setCalendarSyncError(null);
      setCalendarSyncSuccessMsg(null);
    }

    try {
      const res = await fetch('/api/calendar/sync-ical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
        signal: AbortSignal.timeout(10000)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível sincronizar com o link informado.');
      }

      const events: DailyScheduleSlot[] = data.events || [];
      setRealCalendarEvents(events);
      const nowStr = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      setLastCalendarSyncTime(nowStr);
      setIsGoogleCalendarConnected(true);
      setCalendarSyncMode('ical');

      if (data.calendarName) {
        setGoogleCalendarAccount(data.calendarName);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('bancoresidencia_google_calendar_connected', 'true');
        localStorage.setItem('bancoresidencia_google_calendar_mode', 'ical');
        localStorage.setItem('bancoresidencia_google_ical_url', targetUrl);
        localStorage.setItem('bancoresidencia_real_calendar_events', JSON.stringify(events));
        localStorage.setItem('bancoresidencia_google_last_sync', nowStr);
        localStorage.setItem('bancoresidencia_google_last_sync_timestamp', Date.now().toString());
        if (data.calendarName) {
          localStorage.setItem('bancoresidencia_google_calendar_account', data.calendarName);
        }
      }

      if (events.length > 0) {
        setCalendarSyncSuccessMsg(`${events.length} compromisso(s) sincronizado(s) para hoje!`);
      } else {
        setCalendarSyncSuccessMsg('Agenda conectada com sucesso! Nenhum compromisso agendado para hoje (rotina livre para estudos).');
      }
      setSyncSuccessAnimation(true);
      setTimeout(() => setSyncSuccessAnimation(false), 4500);
      return true;
    } catch (err: any) {
      const msg = err?.name === 'TimeoutError'
        ? 'Tempo limite esgotado ao acessar o link. Verifique a URL.'
        : (err?.message || 'Falha ao sincronizar agenda.');
      if (!isSilent) {
        setCalendarSyncError(msg);
      } else {
        console.warn('[AutoSync iCal]:', msg);
      }
      return false;
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  // ── Sincronização automática da agenda toda vez que abrir a plataforma ──────
  const autoSyncGoogleCalendar = useCallback(async (isInitialMount = false) => {
    if (typeof window === 'undefined') return;

    const isConnected = localStorage.getItem('bancoresidencia_google_calendar_connected') === 'true' || isGoogleCalendarConnected;
    if (!isConnected) return;

    const mode = (localStorage.getItem('bancoresidencia_google_calendar_mode') as 'api' | 'ical') || calendarSyncMode || 'ical';
    const storedToken = localStorage.getItem('bancoresidencia_google_access_token') || googleAccessToken;
    const storedIcal = localStorage.getItem('bancoresidencia_google_ical_url') || googleIcalUrl;

    if (mode === 'api' && (storedToken || isConnected)) {
      setIsSyncingCalendar(true);
      try {
        const [events, accountEmail] = await Promise.all([
          fetchTodayEventsFromGoogleApi(storedToken),
          fetchGoogleCalendarAccountEmail(storedToken)
        ]);

        setRealCalendarEvents(events as any);
        const nowStr = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        setLastCalendarSyncTime(nowStr);

        if (accountEmail) {
          setGoogleCalendarAccount(accountEmail);
          localStorage.setItem('bancoresidencia_google_calendar_account', accountEmail);
        }

        localStorage.setItem('bancoresidencia_real_calendar_events', JSON.stringify(events));
        localStorage.setItem('bancoresidencia_google_last_sync', nowStr);
        localStorage.setItem('bancoresidencia_google_last_sync_timestamp', Date.now().toString());

        setSyncSuccessAnimation(true);
        setTimeout(() => setSyncSuccessAnimation(false), 4500);
      } catch (apiErr) {
        console.warn('[Google Agenda Auto-Sync] Falha na API:', apiErr);
        if (storedIcal?.trim()) {
          await syncIcalEvents(storedIcal, true);
        }
      } finally {
        setIsSyncingCalendar(false);
      }
    } else if (storedIcal?.trim()) {
      await syncIcalEvents(storedIcal, isInitialMount);
    } else {
      const nowStr = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      setLastCalendarSyncTime(nowStr);
      localStorage.setItem('bancoresidencia_google_last_sync', nowStr);
      localStorage.setItem('bancoresidencia_google_last_sync_timestamp', Date.now().toString());
      if (isInitialMount) {
        setSyncSuccessAnimation(true);
        setTimeout(() => setSyncSuccessAnimation(false), 3000);
      }
    }
  }, [calendarSyncMode, googleAccessToken, googleIcalUrl, isGoogleCalendarConnected]);

  const handleSyncNow = async () => {
    await autoSyncGoogleCalendar(false);
  };

  // ── Sincronização automática e captura de token OAuth ─────────────────────
  useEffect(() => {
    // 1. Verifica se retornou do /auth/google/callback com flag "just connected"
    const justConnected = sessionStorage.getItem('bancoresidencia_google_just_connected');
    if (justConnected === 'true') {
      sessionStorage.removeItem('bancoresidencia_google_just_connected');

      // Token já salvo no localStorage pela callback page — pega daqui
      const storedToken = typeof window !== 'undefined'
        ? localStorage.getItem('bancoresidencia_google_access_token') || ''
        : '';

      if (storedToken) {
        setGoogleAccessToken(storedToken);
        setCalendarSyncMode('api');
        setIsGoogleCalendarConnected(true);
        setIsSyncingCalendar(true);
        setCalendarSyncError(null);

        Promise.all([
          fetchTodayEventsFromGoogleApi(storedToken),
          fetchGoogleCalendarAccountEmail(storedToken)
        ])
          .then(([events, accountEmail]) => {
            setRealCalendarEvents(events as any);
            const nowStr = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
            setLastCalendarSyncTime(nowStr);

            if (accountEmail) {
              setGoogleCalendarAccount(accountEmail);
            }

            if (typeof window !== 'undefined') {
              localStorage.setItem('bancoresidencia_real_calendar_events', JSON.stringify(events));
              localStorage.setItem('bancoresidencia_google_last_sync', nowStr);
              localStorage.setItem('bancoresidencia_google_last_sync_timestamp', Date.now().toString());
              if (accountEmail) {
                localStorage.setItem('bancoresidencia_google_calendar_account', accountEmail);
              }
            }
            const msg = events.length > 0
              ? `${events.length} evento(s) sincronizados via Google Calendar!`
              : 'Conectado via Google Calendar! Nenhum evento para hoje.';
            setCalendarSyncSuccessMsg(msg);
            setSyncSuccessAnimation(true);
            setTimeout(() => setSyncSuccessAnimation(false), 4500);
          })
          .catch((err) => {
            setCalendarSyncError(err?.message || 'Falha ao buscar eventos do Google Calendar.');
          })
          .finally(() => {
            setIsSyncingCalendar(false);
          });
        return;
      }
    }

    // 2. Verifica se a callback page salvou um erro no sessionStorage
    const sessionError = typeof window !== 'undefined'
      ? sessionStorage.getItem('bancoresidencia_google_auth_error')
      : null;
    if (sessionError) {
      sessionStorage.removeItem('bancoresidencia_google_auth_error');
      setCalendarSyncError(sessionError);
      return;
    }

    // 3. Fallback: verifica token no hash (fluxo legado) 
    const tokenFromHash = extractGoogleTokenFromUrlHash();
    if (tokenFromHash) {
      setGoogleAccessToken(tokenFromHash);
      setCalendarSyncMode('api');
      if (typeof window !== 'undefined') {
        localStorage.setItem('bancoresidencia_google_access_token', tokenFromHash);
        localStorage.setItem('bancoresidencia_google_calendar_mode', 'api');
        localStorage.setItem('bancoresidencia_google_calendar_connected', 'true');
      }
      setIsSyncingCalendar(true);
      setCalendarSyncError(null);
      Promise.all([
        fetchTodayEventsFromGoogleApi(tokenFromHash),
        fetchGoogleCalendarAccountEmail(tokenFromHash)
      ])
        .then(([events, accountEmail]) => {
          setRealCalendarEvents(events as any);
          const nowStr = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
          setLastCalendarSyncTime(nowStr);
          setIsGoogleCalendarConnected(true);

          if (accountEmail) {
            setGoogleCalendarAccount(accountEmail);
          }

          if (typeof window !== 'undefined') {
            localStorage.setItem('bancoresidencia_real_calendar_events', JSON.stringify(events));
            localStorage.setItem('bancoresidencia_google_last_sync', nowStr);
            localStorage.setItem('bancoresidencia_google_last_sync_timestamp', Date.now().toString());
            if (accountEmail) {
              localStorage.setItem('bancoresidencia_google_calendar_account', accountEmail);
            }
          }
          const msg = events.length > 0
            ? `${events.length} evento(s) sincronizados via Google Calendar!`
            : 'Conectado via Google Calendar! Nenhum evento para hoje.';
          setCalendarSyncSuccessMsg(msg);
          setSyncSuccessAnimation(true);
          setTimeout(() => setSyncSuccessAnimation(false), 4500);
        })
        .catch((err) => {
          setCalendarSyncError(err?.message || 'Falha ao buscar eventos do Google Calendar.');
        })
        .finally(() => {
          setIsSyncingCalendar(false);
        });
      return;
    }

    // 4. SINCRONIZAÇÃO AUTOMÁTICA DA AGENDA TODA VEZ QUE ABRIR A PLATAFORMA
    // Dispara automaticamente sempre que o componente é montado (quando o usuário abre/acessa a plataforma)
    autoSyncGoogleCalendar(true);

    // 5. Atualização inteligente periódica ao retornar à aba (se passou mais de 3 minutos)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const lastSyncTs = typeof window !== 'undefined' ? localStorage.getItem('bancoresidencia_google_last_sync_timestamp') : null;
        const now = Date.now();
        if (!lastSyncTs || now - Number(lastSyncTs) > 3 * 60 * 1000) {
          autoSyncGoogleCalendar(false);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 6. Verifica se há erro de OAuth retornado via query param
    const authError = extractGoogleAuthErrorFromUrl();
    if (authError) {
      setCalendarSyncError(authError);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [autoSyncGoogleCalendar]);

  const handleConnectGoogleCalendar = async (accountEmail?: string, preset?: 'internato' | 'plantao' | 'estudos') => {
    const acc = accountEmail || googleCalendarAccount || 'aluno.medicina@uf.br';
    const pr = preset || googleRoutinePreset || 'internato';
    const nowStr = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    if (calendarSyncMode === 'ical' && googleIcalUrl.trim()) {
      const ok = await syncIcalEvents(googleIcalUrl);
      if (ok) {
        setIsGoogleModalOpen(false);
      }
      return;
    }

    setIsGoogleCalendarConnected(true);
    setGoogleCalendarAccount(acc);
    setGoogleRoutinePreset(pr);
    setLastCalendarSyncTime(nowStr);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bancoresidencia_google_calendar_connected', 'true');
      localStorage.setItem('bancoresidencia_google_calendar_account', acc);
      localStorage.setItem('bancoresidencia_google_routine_preset', pr);
      localStorage.setItem('bancoresidencia_google_last_sync', nowStr);
    }
    setIsGoogleModalOpen(false);
  };

  const handleConnectGoogleViaApi = () => {
    const cId = (googleClientId || '').trim();
    if (!cId) {
      setCalendarSyncError('Informe um Google Client ID válido para conectar via Google API.');
      return;
    }

    setIsSyncingCalendar(true);
    setCalendarSyncError(null);
    setCalendarSyncSuccessMsg(null);

    // Popup controlado com OAuth Implicit — imune à tela "App não verificado" do Google
    // Abre popup próprio → Google redireciona dentro do popup → callback page salva no localStorage
    // → evento 'storage' dispara aqui na janela-pai → captura o token sem depender de postMessage/GIS
    startGoogleOAuthPopup(
      cId,
      async (accessToken) => {
        try {
          setGoogleAccessToken(accessToken);
          setIsGoogleCalendarConnected(true);
          setCalendarSyncMode('api');

          if (typeof window !== 'undefined') {
            localStorage.setItem('bancoresidencia_google_access_token', accessToken);
            localStorage.setItem('bancoresidencia_google_calendar_mode', 'api');
            localStorage.setItem('bancoresidencia_google_calendar_connected', 'true');
          }

          const [events, accountEmail] = await Promise.all([
            fetchTodayEventsFromGoogleApi(accessToken).catch(() => []),
            fetchGoogleCalendarAccountEmail(accessToken).catch(() => null)
          ]);

          setRealCalendarEvents(events as any);
          const nowStr = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
          setLastCalendarSyncTime(nowStr);

          if (accountEmail) {
            setGoogleCalendarAccount(accountEmail);
          }

          if (typeof window !== 'undefined') {
            localStorage.setItem('bancoresidencia_real_calendar_events', JSON.stringify(events));
            localStorage.setItem('bancoresidencia_google_last_sync', nowStr);
            if (accountEmail) {
              localStorage.setItem('bancoresidencia_google_calendar_account', accountEmail);
            }
          }

          if (events.length > 0) {
            setCalendarSyncSuccessMsg(`${events.length} evento(s) sincronizados via Google Calendar API!`);
          } else {
            setCalendarSyncSuccessMsg('Conectado via Google API! Nenhum evento para hoje (rotina livre de estudos).');
          }
          setSyncSuccessAnimation(true);
          setTimeout(() => setSyncSuccessAnimation(false), 4500);
          setIsGoogleModalOpen(false);
        } catch (fetchErr: any) {
          setCalendarSyncError(fetchErr?.message || 'Falha ao buscar eventos da Google Calendar API.');
        } finally {
          setIsSyncingCalendar(false);
        }
      },
      (oauthErr) => {
        setIsSyncingCalendar(false);
        const rawMsg = oauthErr?.message || oauthErr?.error || '';
        if (rawMsg.includes('popup_closed')) {
          setCalendarSyncError('A janela de autenticação foi fechada antes da confirmação. Ao reabrir, se ver a tela vermelha de aviso, clique em "Avançado" → "Acessar Hippocampus" para autorizar.');
        } else if (rawMsg.includes('Popup bloqueado')) {
          setCalendarSyncError(rawMsg + ' Clique em "Abrir por redirecionamento" abaixo.');
        } else {
          setCalendarSyncError(rawMsg || 'Autorização Google cancelada ou recusada.');
        }
      }
    );
  };

  const handleConnectGoogleViaRedirect = () => {
    const cId = (googleClientId || '').trim();
    if (!cId) {
      setCalendarSyncError('Informe um Google Client ID válido.');
      return;
    }
    setIsSyncingCalendar(true);
    startGoogleOAuthRedirect(cId);
  };

  const handleDisconnectGoogleCalendar = () => {
    setIsGoogleCalendarConnected(false);
    setRealCalendarEvents([]);
    setGoogleIcalUrl('');
    setGoogleAccessToken('');
    setCalendarSyncError(null);
    setCalendarSyncSuccessMsg(null);
    setExportedSlotIds({});
    setIsBatchSyncCompleted(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bancoresidencia_google_calendar_connected', 'false');
      localStorage.removeItem('bancoresidencia_google_ical_url');
      localStorage.removeItem('bancoresidencia_google_access_token');
      localStorage.removeItem('bancoresidencia_real_calendar_events');
      localStorage.removeItem('bancoresidencia_exported_slots');
      localStorage.removeItem('bancoresidencia_batch_sync_completed');
      localStorage.removeItem('bancoresidencia_google_last_sync_timestamp');
    }
  };

  const handleExportSlotToGoogle = async (slot: DailyScheduleSlot) => {
    setExportingSlotId(slot.id);
    try {
      if (calendarSyncMode === 'api' && googleAccessToken) {
        await createEventInGoogleCalendarApi(googleAccessToken, {
          title: slot.title,
          startTime: slot.startTime,
          endTime: slot.endTime,
          description: cleanEventDescription(slot.description),
          location: slot.location
        });
        setExportedSlotIds(prev => {
          const next = { ...prev, [slot.id]: true };
          if (typeof window !== 'undefined') {
            localStorage.setItem('bancoresidencia_exported_slots', JSON.stringify(next));
          }
          return next;
        });
        setCalendarSyncSuccessMsg(`✓ Bloco "${slot.title}" gravado com sucesso no seu Google Agenda!`);
      } else {
        const templateUrl = buildGoogleCalendarTemplateUrl({
          title: slot.title,
          startTime: slot.startTime,
          endTime: slot.endTime,
          description: cleanEventDescription(slot.description),
          location: slot.location
        });
        setExportedSlotIds(prev => {
          const next = { ...prev, [slot.id]: true };
          if (typeof window !== 'undefined') {
            localStorage.setItem('bancoresidencia_exported_slots', JSON.stringify(next));
          }
          return next;
        });
        window.open(templateUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      const templateUrl = buildGoogleCalendarTemplateUrl({
        title: slot.title,
        startTime: slot.startTime,
        endTime: slot.endTime,
        description: cleanEventDescription(slot.description),
        location: slot.location
      });
      window.open(templateUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setTimeout(() => setExportingSlotId(null), 800);
    }
  };

  // ── FUNÇÕES DE ANÁLISE DE HORÁRIOS LIVRES COM IA & SINCRONIZAÇÃO ────────────
  const handleAnalyzeScheduleWithAi = async (customPrompt?: string) => {
    setIsAnalyzingSchedule(true);
    setShowAiScheduleDrawer(true);
    setShowAiSchedulePanel(true);
    setShowAiCommandModal(false);
    setCalendarSyncError(null);

    const commandToUse = (customPrompt !== undefined ? customPrompt : aiUserCommand).trim();

    // 1. Horário atual (minutos do dia) para evitar alocação no passado
    const nowObj = new Date();
    const currentH = simulatedHour !== null ? simulatedHour : nowObj.getHours();
    const currentM = nowObj.getMinutes();
    const currentMinutes = currentH * 60 + currentM;
    const currentTimeStr = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;

    // 2. Extrai subtemas críticos com pior acurácia
    const weaknessesList: Array<{ subtopic: string; specialty: string; accuracy: number }> = [];
    if (userAnswers && Object.keys(userAnswers).length > 0) {
      const themeMap: Record<string, { total: number; correct: number; specialty: string }> = {};
      Object.values(userAnswers).forEach((ans) => {
        if (ans.tema) {
          const t = ans.tema.trim();
          if (!themeMap[t]) themeMap[t] = { total: 0, correct: 0, specialty: ans.specialty || 'Geral' };
          themeMap[t].total += 1;
          if (ans.isCorrect) themeMap[t].correct += 1;
        }
      });
      Object.entries(themeMap)
        .filter(([, data]) => data.total >= 2)
        .map(([subtopic, data]) => ({
          subtopic,
          specialty: data.specialty,
          accuracy: Math.round((data.correct / data.total) * 100)
        }))
        .filter(item => item.accuracy < 50)
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 5)
        .forEach(w => weaknessesList.push(w));
    }

    if (weaknessesList.length === 0) {
      const recId = recommendedArea?.id || 'clinica';
      const defaults = CRITICAL_SUBTOPICS_MAP[recId] || CRITICAL_SUBTOPICS_MAP['clinica'] || [];
      defaults.forEach(d => {
        weaknessesList.push({
          subtopic: d.name,
          specialty: recommendedArea?.label || 'Clínica Médica',
          accuracy: d.defaultAccuracy
        });
      });
    }

    // 3. Desempenho geral e por áreas
    const performanceSummary = {
      overallAccuracy: stats.totalAnswered > 0 ? (stats.accuracyRate || 0) : 0,
      totalAnswered: stats.totalAnswered || 0,
      areas: (areasResumo || []).map(a => ({
        name: a.label,
        accuracy: a.accuracy,
        totalTested: a.total
      }))
    };

    // 4. Caderno de erros pendentes
    const errorNotebookData = {
      pendingCount: pendingErrorsCount,
      mostCriticalSpecialty: mostCriticalArea?.name || recommendedArea?.label || 'Clínica Médica'
    };

    // 5. Revisão espaçada FSRS
    const fsrsData = {
      dueToday: flashcardsStats?.dueToday || 0,
      overdueCount: flashcardsStats?.dueToday || 0,
      total: flashcardsStats?.total || 0,
      desiredRetention: flashcardsStats?.desiredRetention || 90
    };

    // 6. Cronobiologia e energia cognitiva real
    const cognitiveData = {
      hasData: cognitiveEnergyStats.hasData,
      bestShift: cognitiveEnergyStats.bestShift,
      morning: { taxa: cognitiveEnergyStats.morning.taxa, resolvidas: cognitiveEnergyStats.morning.resolvidas },
      afternoon: { taxa: cognitiveEnergyStats.afternoon.taxa, resolvidas: cognitiveEnergyStats.afternoon.resolvidas },
      night: { taxa: cognitiveEnergyStats.night.taxa, resolvidas: cognitiveEnergyStats.night.resolvidas },
      fatigueAlert: cognitiveEnergyStats.fatigueAlert
    };

    try {
      const res = await fetch('/api/ai/schedule-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: realCalendarEvents,
          userCommand: commandToUse,
          currentMinutes,
          userContext: {
            currentTime: currentTimeStr,
            currentMinutes,
            recommendedArea: recommendedArea?.label || 'Clínica Médica',
            targetExamName: targetExamName || 'ENARE 2026',
            dailyGoal: dailyGoal || 30,
            todayAnswered: todayAnswered || 0,
            todayStudyMinutes: todayStudyMinutes || 0,
            performance: performanceSummary,
            criticalWeaknesses: weaknessesList,
            errorNotebook: errorNotebookData,
            spacedRepetition: fsrsData,
            cognitiveEnergy: cognitiveData
          }
        }),
        signal: AbortSignal.timeout(15000)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível analisar os horários com IA.');
      }

      setScheduleAiAnalysis({
        summary: data.summary || '',
        freeGaps: data.freeGaps || [],
        suggestions: data.suggestions || []
      });
      setIsBatchSyncCompleted(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bancoresidencia_batch_sync_completed');
      }
    } catch (err: any) {
      console.warn('Falha na análise de IA:', err);
      // Fallback heurístico inteligente enriquecido
      const customHint = commandToUse ? ` (orientado por: "${commandToUse}")` : '';
      const topWeakness = weaknessesList[0];
      const dueFsrs = fsrsData.dueToday;

      setScheduleAiAnalysis({
        summary: `Plano adaptativo gerado pelo Preceptor${customHint}. Intervalos livres cruzados com suas vulnerabilidades clínicas e revisão espaçada.`,
        freeGaps: [
          { startTime: '14:00', endTime: '16:00', durationMinutes: 120 },
          { startTime: '19:30', endTime: '21:00', durationMinutes: 90 }
        ],
        suggestions: [
          {
            id: 'ai_sug_fallback_1',
            title: `Treino TRI: ${topWeakness ? `${topWeakness.specialty} (${topWeakness.subtopic})` : (recommendedArea?.label || 'Clínica Médica')}`,
            category: 'estudo',
            startTime: '14:00',
            endTime: '15:15',
            startMinutes: 840,
            endMinutes: 915,
            source: 'plataforma',
            action: 'treinar',
            description: commandToUse ? `Foco customizado: ${commandToUse}` : `Treino direcionado de alta densidade no subtema mais vulnerável do seu Raio-X`,
            rationale: 'Janela de boa energia mental para resolução de questões com padrão da banca.',
            aiDecision: {
              whyThisTopic: topWeakness
                ? `Seu Raio-X indica apenas ${topWeakness.accuracy}% de acerto em ${topWeakness.subtopic}.`
                : `Área de maior peso com necessidade de reforço para o ${targetExamName}.`,
              whyThisTime: 'Horário contínuo que favorece imersão e raciocínio clínico sem interrupções.',
              pedagogicalObjective: 'Sanar pontos cegos de alta incidência na prova.',
              decisionBadges: [
                { type: 'weakness', label: `Ponto Cego: ~${topWeakness?.accuracy ?? 30}% acerto` },
                { type: 'exam_weight', label: targetExamName || 'ENARE 2026' }
              ]
            }
          },
          {
            id: 'ai_sug_fallback_2',
            title: dueFsrs > 0 ? 'Revisão Espaçada FSRS (Flashcards Críticos)' : 'Caderno de Erros (Reteste Metacognitivo)',
            category: dueFsrs > 0 ? 'flashcard' : 'revisao',
            startTime: '19:30',
            endTime: '20:15',
            startMinutes: 1170,
            endMinutes: 1215,
            source: 'plataforma',
            action: dueFsrs > 0 ? 'flashcards' : 'caderno_erros',
            description: dueFsrs > 0
              ? `Baralho inteligente: ${dueFsrs} card(s) aguardando revisão para blindar sua memória de longo prazo`
              : `Reteste de ${pendingErrorsCount} questões erradas recentemente para converter falhas em acertos`,
            rationale: 'Estudo ativo de menor carga extrínseca para consolidar retenção antes do descanso.',
            aiDecision: {
              whyThisTopic: dueFsrs > 0
                ? `Você possui ${dueFsrs} flashcard(s) vencendo hoje pelo algoritmo FSRS.`
                : `Existem ${pendingErrorsCount} erro(s) não recuperados aguardando revisão.`,
              whyThisTime: 'Período noturno ideal para repetição mnemônica sem fadiga excessiva.',
              pedagogicalObjective: 'Garantir retenção duradoura na curva de esquecimento.',
              decisionBadges: [
                dueFsrs > 0
                  ? { type: 'fsrs_due', label: `${dueFsrs} FSRS Vencendo` }
                  : { type: 'error_retest', label: `${pendingErrorsCount} Erros p/ Reteste` },
                { type: 'fatigue_relief', label: 'Carga Leve Anti-Fadiga' }
              ]
            }
          }
        ]
      });
    } finally {
      setIsAnalyzingSchedule(false);
    }
  };

  const handleAddSuggestedTask = (task: DailyScheduleSlot) => {
    const item = { ...task, isAiSuggested: true };
    setUserScheduledTasks((prev) => {
      if (prev.some(t => t.id === task.id)) return prev;
      return [...prev, item];
    });
    saveUserScheduledTask(item, user?.id).catch(() => { });
    setCalendarSyncSuccessMsg(`Bloco "${task.title}" adicionado ao seu cronograma!`);
  };

  const handleAddAllSuggestedTasks = () => {
    if (!scheduleAiAnalysis?.suggestions || scheduleAiAnalysis.suggestions.length === 0) return;
    setUserScheduledTasks((prev) => {
      const prevIds = new Set(prev.map(p => p.id));
      const newItems = scheduleAiAnalysis.suggestions
        .filter(s => !prevIds.has(s.id))
        .map(s => ({ ...s, isAiSuggested: true }));
      newItems.forEach((item) => {
        saveUserScheduledTask(item, user?.id).catch(() => { });
      });
      return [...prev, ...newItems];
    });
    setCalendarSyncSuccessMsg(`${scheduleAiAnalysis.suggestions.length} tarefas de estudo adicionadas ao cronograma!`);
  };

  const handleRemoveScheduledTask = (taskId: string) => {
    setUserScheduledTasks((prev) => prev.filter(t => t.id !== taskId));
    deleteUserScheduledTask(taskId, user?.id).catch((err) => {
      console.warn('Erro ao excluir tarefa remota:', err);
    });
    setExportedSlotIds(prev => {
      const next = { ...prev };
      delete next[taskId];
      if (typeof window !== 'undefined') {
        localStorage.setItem('bancoresidencia_exported_slots', JSON.stringify(next));
      }
      return next;
    });
  };

  const handleClearUserScheduledTasks = () => {
    setUserScheduledTasks([]);
    setExportedSlotIds({});
    setIsBatchSyncCompleted(false);
    clearAllUserScheduledTasks(user?.id).catch((err) => {
      console.warn('Erro ao limpar tarefas remotas:', err);
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bancoresidencia_exported_slots');
      localStorage.removeItem('bancoresidencia_batch_sync_completed');
    }
    setCalendarSyncSuccessMsg('Cronograma redefinido para a visualização pura do Google Agenda.');
  };

  const handleSyncAllTasksToGoogle = async () => {
    let tasksToSync = [...userScheduledTasks.filter(t => t.source === 'plataforma')];

    // Se houver sugestões da IA geradas no painel, inclui-as para sincronização
    if (scheduleAiAnalysis?.suggestions && scheduleAiAnalysis.suggestions.length > 0) {
      const existingIds = new Set(tasksToSync.map(t => t.id));
      const suggestionsToAdd = scheduleAiAnalysis.suggestions.filter(s => !existingIds.has(s.id));
      if (suggestionsToAdd.length > 0) {
        tasksToSync = [...tasksToSync, ...suggestionsToAdd];
        // Adiciona automaticamente ao cronograma do usuário
        setUserScheduledTasks(prev => {
          const prevIds = new Set(prev.map(p => p.id));
          const newItems = suggestionsToAdd.filter(s => !prevIds.has(s.id)).map(s => ({ ...s, isAiSuggested: true }));
          newItems.forEach((item) => {
            saveUserScheduledTask(item, user?.id).catch(() => { });
          });
          return [...prev, ...newItems];
        });
      }
    }

    if (tasksToSync.length === 0) {
      setCalendarSyncError('Nenhuma tarefa ou sugestão de estudo disponível para sincronizar.');
      return;
    }

    setIsBatchSyncing(true);
    setCalendarSyncError(null);
    setCalendarSyncSuccessMsg(null);

    try {
      if (calendarSyncMode === 'api' && googleAccessToken) {
        const batchInputs = tasksToSync.map(t => ({
          title: t.title,
          startTime: t.startTime,
          endTime: t.endTime,
          description: cleanEventDescription(t.description),
          location: t.location || 'Plataforma Banco Residência'
        }));

        const res = await createEventsBatchInGoogleCalendarApi(googleAccessToken, batchInputs);
        setCalendarSyncSuccessMsg(`${res.success} bloco(s) gravado(s) diretamente no seu Google Agenda!`);
      } else {
        // Modo iCal: Gera e baixa o arquivo .ics oficial para importar na agenda
        const batchInputs = tasksToSync.map(t => ({
          title: t.title,
          startTime: t.startTime,
          endTime: t.endTime,
          description: cleanEventDescription(t.description),
          location: t.location || 'Plataforma Banco Residência'
        }));

        const icsData = generateIcsContent(batchInputs);
        downloadIcsFile('estudos_hoje_google_agenda.ics', icsData);
        setCalendarSyncSuccessMsg('Arquivo .ics gerado com sucesso! Salve ou importe no Google Agenda para sincronizar todos os blocos.');
      }

      // Marca todos os blocos sincronizados como Salvos/Concluídos
      const newlyExported: Record<string, boolean> = {};
      tasksToSync.forEach(t => {
        newlyExported[t.id] = true;
      });
      setExportedSlotIds(prev => {
        const next = { ...prev, ...newlyExported };
        if (typeof window !== 'undefined') {
          localStorage.setItem('bancoresidencia_exported_slots', JSON.stringify(next));
        }
        return next;
      });

      setIsBatchSyncCompleted(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('bancoresidencia_batch_sync_completed', 'true');
      }
    } catch (err: any) {
      setCalendarSyncError(err?.message || 'Falha ao sincronizar tarefas com Google Agenda.');
    } finally {
      setIsBatchSyncing(false);
    }
  };

  // Cronograma diário: Inicialmente 100% LIMPO com os eventos e horários do Google Agenda
  // Tarefas da plataforma são adicionadas SOMENTE se o aluno aceitar sugestões da IA ou adicionar manualmente
  const daySchedule = React.useMemo<DailyScheduleSlot[]>(() => {
    if (isGoogleCalendarConnected) {
      // 1. Inicialmente APENAS os eventos reais do Google Agenda via iCal (.ics) ou API
      const slots: DailyScheduleSlot[] = [...realCalendarEvents];

      // 2. Tarefas de estudo aprovadas pelo usuário (sugeridas pela IA)
      if (userScheduledTasks.length > 0) {
        const existingIds = new Set(slots.map(s => s.id));
        for (const task of userScheduledTasks) {
          if (!existingIds.has(task.id)) {
            slots.push(task);
            existingIds.add(task.id);
          }
        }
      }

      slots.sort((a, b) => a.startMinutes - b.startMinutes);
      return slots;
    }

    // Se NÃO estiver conectado ao Google Agenda:
    if (userScheduledTasks.length > 0) {
      return [...userScheduledTasks].sort((a, b) => a.startMinutes - b.startMinutes);
    }

    // Cronograma limpo inicial (sem dados falsos forçados)
    return [];
  }, [isGoogleCalendarConnected, realCalendarEvents, userScheduledTasks]);

  // Lista filtrada para a visualização na Linha do Tempo (Todos / Tarefas / Somente Estudos / Google Agenda)
  const filteredDaySchedule = React.useMemo(() => {
    if (timelineFilter === 'estudos') {
      return daySchedule.filter(s => s.isStudySession || s.source === 'plataforma' || s.isAiSuggested);
    }
    if (timelineFilter === 'tarefas') {
      return daySchedule.filter(s => s.isCalendarTask);
    }
    if (timelineFilter === 'google') {
      return daySchedule.filter(s => s.source === 'google');
    }
    return daySchedule;
  }, [daySchedule, timelineFilter]);

  // Atividades de ESTUDO programadas na agenda do dia (apenas estudos do dia cruzados com a agenda, sem duplicar sessões do cronômetro)
  const todayAgendaActivities = React.useMemo(() => {
    if (daySchedule.length === 0) return [];
    const nonTimerSlots = daySchedule.filter((slot) => !slot.id.startsWith('task_'));
    const sourceSlots = nonTimerSlots.length > 0 ? nonTimerSlots : daySchedule;

    return sourceSlots.filter((slot) => {
      // 1. Tarefas criadas na plataforma ou sugeridas pela IA são sempre estudos
      if (slot.isAiSuggested || slot.source === 'plataforma') return true;

      // 2. Categoria explícita de estudo, revisão, flashcard ou simulado
      if (
        slot.category === 'estudo' ||
        slot.category === 'revisao' ||
        slot.category === 'flashcard' ||
        slot.category === 'simulado'
      ) {
        return true;
      }

      // 3. Para eventos do Google Calendar / externos: filtrar estritamente SOMENTE ESTUDOS
      const text = `${slot.title} ${slot.description || ''}`.toLowerCase();
      const isHospitalOrClinical =
        slot.category === 'hospital' ||
        slot.category === 'pausa' ||
        /prática|pratica|seminário|seminario|estágio|estagio|plantão|plantao|enfermaria|ambulatório|ambulatorio|visita|aula/i.test(text);

      if (isHospitalOrClinical) {
        // Se for atividade clínica/hospitalar/aula, só inclui se for explicitamente estudo/questões/revisão
        return /estudo:|estudo\b|questõ|revis|simulado|flashcard/i.test(text);
      }

      return /estudo|questõ|revis|simulado|flashcard|resumo|caderno/i.test(text);
    });
  }, [daySchedule]);

  // Cálculo da Atividade Específica para AQUELE Período de Tempo
  const currentPeriodInfo = React.useMemo(() => {
    const now = new Date();
    const currentMinutes = simulatedHour !== null
      ? (simulatedHour * 60 + 15)
      : (now.getHours() * 60 + now.getMinutes());

    // Se o cronograma estiver limpo / sem blocos
    if (daySchedule.length === 0) {
      return {
        status: 'livre' as const,
        currentMinutes,
        slot: {
          id: 'agenda_livre_dia',
          title: isGoogleCalendarConnected
            ? 'Agenda Livre Hoje'
            : 'Conecte sua Agenda',
          category: 'pausa' as const,
          startTime: '08:00',
          endTime: '22:00',
          startMinutes: 480,
          endMinutes: 1320,
          source: 'google' as const,
          description: isGoogleCalendarConnected
            ? 'Nenhum compromisso marcado no Google Agenda hoje. Seus horários estão 100% livres para estudo.'
            : 'Conecte seu Google Agenda via link iCal (.ics) para sincronizar seus compromissos.',
          location: 'Agenda'
        },
        progressPercent: 0,
        minutesRemaining: 0,
        nextSlot: null,
        label: 'Horário Livre'
      };
    }

    // 1. Está dentro de algum slot ativo agora?
    const activeSlot = daySchedule.find(
      (slot) => currentMinutes >= slot.startMinutes && currentMinutes < slot.endMinutes
    );

    if (activeSlot) {
      const elapsed = currentMinutes - activeSlot.startMinutes;
      const total = activeSlot.endMinutes - activeSlot.startMinutes;
      const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
      const minutesRemaining = activeSlot.endMinutes - currentMinutes;

      // Procura a próxima atividade na sequência
      const nextUpcoming = daySchedule.find((s) => s.startMinutes >= activeSlot.endMinutes);

      return {
        status: 'em_andamento' as const,
        currentMinutes,
        slot: activeSlot,
        progressPercent,
        minutesRemaining,
        nextSlot: nextUpcoming || null,
        label: `Agora (${activeSlot.startTime} - ${activeSlot.endTime})`
      };
    }

    // 2. Não está em nenhum slot ativo. Procura o próximo de hoje
    const upcomingSlot = daySchedule.find((s) => s.startMinutes > currentMinutes);
    if (upcomingSlot) {
      const minutesUntil = upcomingSlot.startMinutes - currentMinutes;
      return {
        status: 'proximo' as const,
        currentMinutes,
        slot: upcomingSlot,
        progressPercent: 0,
        minutesUntil,
        nextSlot: null,
        label: `Próximo Bloco (${upcomingSlot.startTime} - ${upcomingSlot.endTime})`
      };
    }

    // 3. Fim do dia / horário noturno
    return {
      status: 'noturno' as const,
      currentMinutes,
      slot: {
        id: 'descanso_noturno',
        title: 'Descanso & Consolidação de Memória',
        category: 'pausa' as const,
        startTime: '22:30',
        endTime: '07:30',
        startMinutes: 1350,
        endMinutes: 450,
        source: 'plataforma' as const,
        description: 'Rotina de hoje concluída. O cérebro consolida sinapses de estudo durante o sono reparador.',
        location: 'Repouso'
      },
      progressPercent: 100,
      nextSlot: daySchedule[0] || null,
      label: 'Período Noturno (Descanso)'
    };
  }, [daySchedule, simulatedHour]);

  // Sincronização da Cronobiologia & Energia Cognitiva com o Desempenho Real (userAnswers)
  const cognitiveEnergyStats = React.useMemo(() => {
    const defaultShifts = {
      morning: { label: 'Manhã', range: '06h – 12h', iconLevel: '⚡⚡⚡', resolvidas: 0, acertos: 0, taxa: 0, reco: 'Questões Inéditas / TRI', tag: 'Pico de Foco' },
      afternoon: { label: 'Tarde', range: '12h – 18h', iconLevel: '⚡⚡', resolvidas: 0, acertos: 0, taxa: 0, reco: 'Caderno de Erros', tag: 'Reteste & Foco' },
      night: { label: 'Noite', range: '18h – 23h', iconLevel: '⚡', resolvidas: 0, acertos: 0, taxa: 0, reco: 'Flashcards FSRS', tag: 'Fixação Leve' }
    };

    if (!userAnswers || Object.keys(userAnswers).length === 0) {
      return {
        hasData: false,
        totalExamined: 0,
        morning: defaultShifts.morning,
        afternoon: defaultShifts.afternoon,
        night: defaultShifts.night,
        bestShift: null,
        fatigueAlert: false,
        summaryText: 'Padrão cronobiológico ativo. Resolva questões para calibrar com o seu desempenho real.'
      };
    }

    const counts = {
      morning: { resolvidas: 0, acertos: 0 },
      afternoon: { resolvidas: 0, acertos: 0 },
      night: { resolvidas: 0, acertos: 0 }
    };

    let totalExamined = 0;
    Object.values(userAnswers).forEach((ans) => {
      if (!ans || !ans.timestamp) return;
      totalExamined++;
      const h = new Date(ans.timestamp).getHours();
      if (h >= 6 && h < 12) {
        counts.morning.resolvidas++;
        if (ans.isCorrect) counts.morning.acertos++;
      } else if (h >= 12 && h < 18) {
        counts.afternoon.resolvidas++;
        if (ans.isCorrect) counts.afternoon.acertos++;
      } else {
        counts.night.resolvidas++;
        if (ans.isCorrect) counts.night.acertos++;
      }
    });

    const calcTaxa = (res: number, ac: number) => (res > 0 ? Math.round((ac / res) * 100) : 0);
    const morningTaxa = calcTaxa(counts.morning.resolvidas, counts.morning.acertos);
    const afternoonTaxa = calcTaxa(counts.afternoon.resolvidas, counts.afternoon.acertos);
    const nightTaxa = calcTaxa(counts.night.resolvidas, counts.night.acertos);

    const mShift = { ...defaultShifts.morning, resolvidas: counts.morning.resolvidas, acertos: counts.morning.acertos, taxa: morningTaxa };
    const aShift = { ...defaultShifts.afternoon, resolvidas: counts.afternoon.resolvidas, acertos: counts.afternoon.acertos, taxa: afternoonTaxa };
    const nShift = { ...defaultShifts.night, resolvidas: counts.night.resolvidas, acertos: counts.night.acertos, taxa: nightTaxa };

    const activeList = [mShift, aShift, nShift].filter(s => s.resolvidas > 0);
    const best = activeList.length > 0
      ? activeList.reduce((max, curr) => (curr.taxa > max.taxa ? curr : max), activeList[0])
      : null;

    const fatigueAlert = totalExamined >= 8 && nightTaxa > 0 && best !== null && (best.taxa - nightTaxa >= 12);

    return {
      hasData: totalExamined > 0,
      totalExamined,
      morning: mShift,
      afternoon: aShift,
      night: nShift,
      bestShift: best ? best.label : null,
      bestShiftTaxa: best ? best.taxa : null,
      fatigueAlert,
      summaryText: best
        ? `Seu melhor rendimento real é na ${best.label} (${best.taxa}% de acerto em ${best.resolvidas}Q).`
        : 'Padrão cronobiológico ativo.'
    };
  }, [userAnswers]);

  // 4. Régua semanal dos 7 dias
  const weeklyDays = React.useMemo(() => {
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const now = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - i);
      const dayIndex = targetDate.getDay();
      const label = dayNames[dayIndex];
      const isToday = i === 0;

      const dateKey = getLocalDateStr(targetDate);
      const matchHistory = (stats.historyByDay || []).find((h) => h.date === dateKey);

      const answered = matchHistory ? matchHistory.answered : 0;

      const targetGoal = dailyGoal || 30;
      const isComplete = answered >= targetGoal;

      result.push({
        label,
        dateFormatted: `${targetDate.getDate().toString().padStart(2, '0')}/${(targetDate.getMonth() + 1).toString().padStart(2, '0')}`,
        answered,
        targetGoal,
        isToday,
        isComplete
      });
    }
    return result;
  }, [stats.historyByDay, dailyGoal]);

  const [selectedAreaId, setSelectedAreaId] = useState<string>('geral');
  const lastPieClickRef = useRef<{ id: string; time: number }>({ id: '', time: 0 });

  const handlePieSectorClick = React.useCallback((areaId: string) => {
    const now = Date.now();
    if (lastPieClickRef.current.id === areaId && now - lastPieClickRef.current.time < 350) {
      return;
    }
    lastPieClickRef.current = { id: areaId, time: now };
    setSelectedAreaId((prev) => (prev === areaId ? 'geral' : areaId));
  }, []);

  const totalCoreVolume = React.useMemo(() => {
    return areasResumo.reduce((sum, a) => sum + (a.total || 0), 0);
  }, [areasResumo]);

  const totalCoreCorrect = React.useMemo(() => {
    return areasResumo.reduce((sum, a) => sum + (a.correct || 0), 0);
  }, [areasResumo]);

  const donutData = React.useMemo(() => {
    return areasResumo.map((area) => ({
      id: area.id,
      name: area.label,
      value: totalCoreVolume === 0 ? 1 : (area.total > 0 ? area.total : 0.5),
      realValue: area.total,
      cor: area.colorHex,
      accuracy: area.accuracy,
      correct: area.correct,
      hasData: area.hasData
    }));
  }, [areasResumo, totalCoreVolume]);

  const selectedArea = React.useMemo(() => {
    if (selectedAreaId === 'geral') {
      return {
        id: 'geral',
        label: 'Geral',
        filterName: 'Geral',
        icon: BarChart2,
        colorHex: accentConfig.primaryHex,
        bgLight: 'bg-zinc-500/10',
        textClass: 'text-zinc-600 dark:text-zinc-400',
        borderClass: 'border-zinc-500/20',
        total: totalCoreVolume,
        correct: totalCoreCorrect,
        accuracy: totalCoreVolume > 0 ? Math.round((totalCoreCorrect / totalCoreVolume) * 100) : 0,
        hasData: totalCoreVolume > 0
      };
    }
    return areasResumo.find((a) => a.id === selectedAreaId) || areasResumo[0];
  }, [areasResumo, selectedAreaId, totalCoreVolume, totalCoreCorrect, accentConfig.primaryHex]);

  // Dados diários de evolução para a especialidade ativa ou Geral (Barras Empilhadas + Tendência)
  const specialtyEvolutionData = React.useMemo(() => {
    const nowObj = new Date();
    const todayStart = new Date(nowObj.getFullYear(), nowObj.getMonth(), nowObj.getDate(), 0, 0, 0, 0).getTime();
    const todayEnd = new Date(nowObj.getFullYear(), nowObj.getMonth(), nowObj.getDate(), 23, 59, 59, 999).getTime();

    let startDateTs: number;
    let endDateTs: number = todayEnd;

    if (specialtyPeriod === '1d') {
      startDateTs = todayStart;
      endDateTs = todayEnd;
    } else if (specialtyPeriod === '7d') {
      startDateTs = todayStart - 6 * 86400000;
    } else if (specialtyPeriod === '30d') {
      startDateTs = todayStart - 29 * 86400000;
    } else if (specialtyPeriod === '3m') {
      startDateTs = todayStart - 89 * 86400000;
    } else if (specialtyPeriod === '6m') {
      startDateTs = todayStart - 179 * 86400000;
    } else if (specialtyPeriod === 'mes') {
      startDateTs = new Date(nowObj.getFullYear(), nowObj.getMonth(), 1, 0, 0, 0, 0).getTime();
    } else if (specialtyPeriod === 'custom' && customStartDate && customEndDate) {
      const s = new Date(customStartDate + 'T00:00:00').getTime();
      const e = new Date(customEndDate + 'T23:59:59').getTime();
      startDateTs = Math.min(s, e);
      endDateTs = Math.max(s, e);
    } else {
      startDateTs = todayStart - 6 * 86400000;
    }

    const totalDays = Math.max(1, Math.min(185, Math.floor((endDateTs - startDateTs) / 86400000) + 1));
    const allAnswers = userAnswers ? Object.values(userAnswers) : [];

    const isGeral = selectedAreaId === 'geral';

    const specialtyAnswers = isGeral
      ? allAnswers
      : allAnswers.filter((ans) => isAnswerMatchingArea(selectedAreaId, ans.specialty, ans.tema));

    const hasSpecialtyAnswers = specialtyAnswers.length > 0;

    interface DailyPoint {
      label: string;
      date: string;
      resolvidas: number;
      acertos: number;
      erros: number;
    }

    const rawDaily: DailyPoint[] = [];

    // Se o período for de 1 Dia (Hoje), exibe a evolução por faixas de horários do dia
    if (specialtyPeriod === '1d') {
      const timeSlots = [
        { label: '00h-04h', startH: 0, endH: 4 },
        { label: '04h-08h', startH: 4, endH: 8 },
        { label: '08h-12h', startH: 8, endH: 12 },
        { label: '12h-16h', startH: 12, endH: 16 },
        { label: '16h-20h', startH: 16, endH: 20 },
        { label: '20h-24h', startH: 20, endH: 24 }
      ];

      for (const slot of timeSlots) {
        const slotStart = todayStart + slot.startH * 3600000;
        const slotEnd = todayStart + slot.endH * 3600000 - 1;

        let dayAns = 0;
        let dayCor = 0;

        if (hasSpecialtyAnswers) {
          const answersInSlot = specialtyAnswers.filter((ans) => {
            const ts = ans.timestamp || 0;
            return ts >= slotStart && ts <= slotEnd;
          });
          dayCor = answersInSlot.filter((a) => a.isCorrect).length;
          dayAns = answersInSlot.length;
        }

        const dayErr = Math.max(0, dayAns - dayCor);

        rawDaily.push({
          label: slot.label,
          date: slot.label,
          resolvidas: dayAns,
          acertos: dayCor,
          erros: dayErr
        });
      }
    } else {
      for (let i = 0; i < totalDays; i++) {
        const d = new Date(startDateTs + i * 86400000);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
        const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();

        const dayStr = String(d.getDate()).padStart(2, '0');
        const monthStr = String(d.getMonth() + 1).padStart(2, '0');
        const dateFormatted = `${dayStr}/${monthStr}`;

        let dayAns = 0;
        let dayCor = 0;

        if (hasSpecialtyAnswers) {
          const answersInDay = specialtyAnswers.filter((ans) => {
            const ts = ans.timestamp || 0;
            return ts >= dayStart && ts <= dayEnd;
          });
          dayCor = answersInDay.filter((a) => a.isCorrect).length;
          dayAns = answersInDay.length;
        } else if (stats.historyByDay && stats.historyByDay.length > 0) {
          const dateKey = `${d.getFullYear()}-${monthStr}-${dayStr}`;
          const found = stats.historyByDay.find((h) => h.date === dateKey);
          if (found) {
            if (isGeral) {
              dayAns = found.answered;
              dayCor = found.correct;
            } else {
              const proportion = selectedAreaId === 'clinica' ? 0.25 : 0.15;
              dayAns = Math.round(found.answered * proportion);
              dayCor = Math.round(found.correct * proportion);
            }
          }
        }

        const dayErr = Math.max(0, dayAns - dayCor);

        rawDaily.push({
          label: dateFormatted,
          date: dateFormatted,
          resolvidas: dayAns,
          acertos: dayCor,
          erros: dayErr
        });
      }
    }

    // Média móvel suave de tendência
    const windowSize = totalDays <= 10 ? 2 : totalDays <= 31 ? 3 : 5;

    return rawDaily.map((item, idx) => {
      const startIdx = Math.max(0, idx - windowSize + 1);
      const slice = rawDaily.slice(startIdx, idx + 1);
      const avgTotal = slice.reduce((acc, curr) => acc + curr.resolvidas, 0) / slice.length;
      const avgAcertos = slice.reduce((acc, curr) => acc + curr.acertos, 0) / slice.length;

      return {
        ...item,
        trendTotal: Number(avgTotal.toFixed(1)),
        trendAcertos: Number(avgAcertos.toFixed(1))
      };
    });
  }, [specialtyPeriod, customStartDate, customEndDate, userAnswers, selectedAreaId, stats.historyByDay]);

  const handlePracticeArea = (filterName: string) => {
    if (filterName === 'Geral') {
      onNavigate('banco');
    } else if (onNavigateToBancoWithSpecialty) {
      onNavigateToBancoWithSpecialty(filterName);
    } else {
      onNavigate('banco');
    }
  };

  // Lista pesquisada para o Drawer
  const drawerSearchResults = React.useMemo(() => {
    if (activeCentralDrawer === 'provas') {
      const q = drawerSearch.trim();
      if (q) {
        return searchDirectExams(q, drawerModality, 30);
      }
      // Se sem busca, carregar exames das instituições em destaque
      const featured = getFeaturedInstitutions();
      const results: { exam: OfficialExamItem; institution: OfficialInstitution }[] = [];
      featured.forEach((inst) => {
        const years = inst.years.slice(0, 2);
        years.forEach((yr) => {
          results.push({
            exam: {
              id: `${inst.id}-${yr}`,
              locationId: inst.id,
              year: yr,
              booklet: '1',
              domain: 'Residência Médica',
              assessmentType: null,
              annulledCount: 0,
              alertCount: 0,
              format: 'digital',
              questionCount: 100,
              modality: 'acesso_direto' as const
            },
            institution: inst
          });
        });
      });
      return results;
    }
    return [];
  }, [activeCentralDrawer, drawerSearch, drawerModality]);

  const handleLaunchOfficialExam = (institution: string, year: number, totalQuestions: number = 100) => {
    const updated = saveRecentOfficialExam({
      institution,
      year,
      status: 'em_andamento',
      totalQuestions
    });
    setOfficialExamsHistory(updated);
    setActiveCentralDrawer(null);
    if (onStartOfficialExam) {
      onStartOfficialExam(institution, year);
    } else {
      onNavigate('provas');
    }
  };

  const handleLaunchMockExam = (mock: { id: string; title: string; totalQuestions?: number; banca?: string }) => {
    const updated = saveRecentMockExam({
      id: mock.id,
      title: mock.title,
      banca: mock.banca,
      status: 'em_andamento',
      totalQuestions: mock.totalQuestions || 100
    });
    setMockExamsHistory(updated);
    setActiveCentralDrawer(null);
    onNavigate('simulados');
  };

  return (
    <div
      className={`space-y-4 sm:space-y-5 animate-in fade-in duration-500 ease-out transition-all ${isCustomizing ? "canvas-grid-quadriculado" : ""}`}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (
          isCustomizing &&
          !target.closest('[data-card-id]') &&
          !target.closest('.figma-control') &&
          !target.closest('.figma-popover')
        ) {
          setSelectedCardId(null);
        }
      }}
    >
      {/* Barra Flutuante de Personalização Estilo Figma (montada apenas quando ativa) */}
      {isCustomizing && (
        <FigmaCustomizerBar
          isCustomizing={isCustomizing}
          selectedCardTitle={visibleCards.find((c) => c.id === selectedCardId)?.title}
          onToggleCustomizing={() => {
            if (isCustomizing) {
              autoConformLayout();
            }
            setIsCustomizing((prev) => !prev);
          }}
          onRestoreDefaults={restoreDefaults}
          hiddenCards={hiddenCards}
          onRestoreCard={toggleVisibility}
          onDeselect={() => setSelectedCardId(null)}
        />
      )}

      {/* Grid Principal Reorganizável Estilo Figma */}
      <CardCanvas
        cards={visibleCards} save={saveFrames}
        className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-3.5 auto-rows-auto grid-flow-dense relative items-start"
      >
        {visibleCards.map((cardConfig, cardIndex) => {
          const staggerStyle = !isCustomizing
            ? ({ '--stagger-idx': Math.min(cardIndex, 7) } as React.CSSProperties)
            : undefined;
          if (cardConfig.id === 'home_hero') {
            return (
              <FigmaCardWrapper
                summary={`${formattedTodayStudy} de estudo hoje`}
                key={cardConfig.id}
                config={cardConfig}
                className={!isCustomizing ? 'bento-stagger-item' : ''}
                isCustomizing={isCustomizing}
                isSelected={selectedCardId === cardConfig.id}
                onSelect={(id) => setSelectedCardId(id)}
                onUpdateSettings={updateCardSettings}
                onToggleVisibility={toggleVisibility}
              >
                <section
                  style={staggerStyle}
                  className="relative overflow-hidden bg-[var(--bg-card,#ffffff)] dark:bg-[var(--card,#121215)] border border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)] rounded-2xl p-5 sm:p-7 shadow-xs min-h-[154px] sm:min-h-[172px] flex flex-col justify-between"
                >
                  <div
                    className="absolute -right-16 -top-16 w-80 h-80 rounded-full blur-3xl opacity-12 pointer-events-none"
                    style={{ backgroundColor: accentConfig.primaryHex }}
                  />
                  <div
                    className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full blur-3xl opacity-8 pointer-events-none"
                    style={{ backgroundColor: accentConfig.timeAccent?.hex || accentConfig.primaryHex }}
                  />

                  <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Ícone de Período (Manhã, Tarde ou Noite) & Plano */}
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs shrink-0"
                          title={greeting.text}
                          aria-label={greeting.text}
                        >
                          <GreetingIcon className={`w-4 h-4 ${greeting.color}`} />
                        </div>

                        {plan === 'free' ? (
                          <button
                            type="button"
                            onClick={() => openUpgradeModal()}
                            title="Plano Gratuito • Clique para conhecer o acesso ilimitado PRO"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800/90 text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 hover:border-amber-500/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                          >
                            <span>FREE</span>
                          </button>
                        ) : (
                          <Badge variant="warning" size="sm" className="rounded-full px-2.5">
                            PRO
                          </Badge>
                        )}
                      </div>

                      {/* Título Conversacional Direto com o Nome do Aluno */}
                      <h1 className="font-heading text-2xl sm:text-3xl lg:text-[32px] font-black tracking-[-0.035em] text-zinc-950 dark:text-white leading-tight">
                        <span>{greeting.text}, </span>
                        <span
                          className="inline-block"
                          style={{
                            color: mode === 'dark' ? 'color-mix(in srgb, var(--primary-color, #2563eb) 85%, #ffffff)' : accentConfig.primaryHex
                          }}
                        >
                          {studentName}!
                        </span>
                      </h1>

                      {/* Ações Primárias de Estudo no Padrão da Landing Page */}
                      <div className="pt-2 flex flex-wrap items-center gap-2.5">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            if (activeCaderno) {
                              onContinueList(activeCaderno);
                            } else if (currentOfficialExam?.status === 'em_andamento') {
                              handleLaunchOfficialExam(
                                currentOfficialExam.institution,
                                currentOfficialExam.year,
                                currentOfficialExam.totalQuestions
                              );
                            } else {
                              onNavigate('banco');
                            }
                          }}
                          leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                          className="font-bold text-xs sm:text-sm px-4 py-2 shadow-xs hover:opacity-95 active:scale-[0.98] transition-all"
                          title={
                            activeCaderno
                              ? `Continuar caderno: ${activeCaderno.title}`
                              : currentOfficialExam?.status === 'em_andamento'
                                ? `Continuar prova: ${currentOfficialExam.institution} ${currentOfficialExam.year}`
                                : 'Ir direto para o Banco de Questões'
                          }
                        >
                          {activeCaderno
                            ? 'Continuar Caderno'
                            : currentOfficialExam?.status === 'em_andamento'
                              ? `Continuar ${currentOfficialExam.institution}`
                              : 'Resolver Questões'}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onNavigate('resumos')}
                          className="font-semibold text-xs px-3.5 py-2 hidden sm:inline-flex"
                          title="Acessar materiais de apoio e resumos teóricos"
                        >
                          Materiais de Apoio
                        </Button>
                      </div>
                    </div>

                    {/* KPIs Laterais com Superfície Padrão Landing Page */}
                    <div className="flex flex-row sm:flex-col lg:flex-row items-center gap-2.5 shrink-0">
                      {/* Tempo Estudado Hoje */}
                      <div
                        onClick={() => onNavigate('stats')}
                        title="Tempo de estudo acumulado hoje no cronômetro da agenda. Clique para abrir seu desempenho detalhado."
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-zinc-50/90 dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer shadow-xs min-w-[140px]"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                          style={{
                            backgroundColor: accentConfig.bgRgba,
                            color: accentConfig.primaryHex
                          }}
                        >
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm sm:text-base font-black font-sans tracking-tight leading-none text-zinc-900 dark:text-zinc-100 tabular-nums">
                            {formattedTodayStudy}
                          </div>
                          <div className="text-[10px] sm:text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1 leading-none mt-1 truncate">
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: accentConfig.primaryHex }}
                            />
                            <span className="truncate">Estudado hoje</span>
                          </div>
                        </div>
                      </div>

                      {/* Prova Alvo */}
                      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-zinc-50/90 dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800 min-w-[140px] shadow-xs">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                          style={{
                            backgroundColor: accentConfig.timeAccent?.bgRgba || accentConfig.bgRgba,
                            color: accentConfig.timeAccent?.hex || accentConfig.primaryHex
                          }}
                        >
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div
                            className="text-sm sm:text-base font-black font-sans tracking-tight leading-none"
                            style={{ color: accentConfig.timeAccent?.hex || accentConfig.primaryHex }}
                          >
                            {targetDaysLeft === 1 ? '1 dia' : `${targetDaysLeft} dias`}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate max-w-[120px] mt-1" title={targetExamName}>
                            p/ {targetExamName}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VISÃO EXPANDIDA ADAPTATIVA: Prova Foco & Ritmo Semanal Real */}
                  {Boolean(cardConfig.customHeight ? cardConfig.customHeight > 140 : false) && (() => {
                    const last7Keys = new Set<string>();
                    for (let i = 0; i < 7; i++) {
                      const d = new Date();
                      d.setDate(d.getDate() - i);
                      last7Keys.add(getLocalDateStr(d));
                    }
                    const weeklyAnswered = (stats.historyByDay || [])
                      .filter((h) => last7Keys.has(h.date))
                      .reduce((acc, h) => acc + (h.answered || 0), 0);
                    const weeklyTarget = Math.max(7, (dailyGoal || 30) * 7);
                    const weeklyPct = Math.min(100, Math.round((weeklyAnswered / weeklyTarget) * 100));

                    return (
                      <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs animate-in fade-in duration-200">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Prova Alvo:</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                              <strong>{targetExamName}:</strong> {targetDaysLeft === 1 ? '1 dia' : `${targetDaysLeft} dias`}
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>
                            Ritmo Semanal: <strong>{weeklyAnswered} / {weeklyTarget} Questões</strong> ({weeklyPct}% concluído)
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </section>
              </FigmaCardWrapper>
            );
          }
          if (cardConfig.id === 'home_meta_diaria') {
            const isDailyGoalMet = goalPercentage >= 100 || timeGoalPercentage >= 100;
            const primaryTextSafe =
              mode === 'dark'
                ? 'color-mix(in srgb, var(--primary-color, #2563eb) 65%, #ffffff)'
                : accentConfig.primaryHex;
            const timeTextSafe =
              mode === 'dark'
                ? 'color-mix(in srgb, var(--time-accent-color, #0ea5e9) 72%, #ffffff)'
                : accentConfig.timeAccent?.hex || accentConfig.primaryHex;

            return (
              <FigmaCardWrapper
                summary={`${stats.streakDays} dias · ${todayAnswered}/${dailyGoal} questões`}
                key={cardConfig.id}
                config={cardConfig}
                className={`self-stretch ${!isCustomizing ? 'bento-stagger-item' : ''}`}
                isCustomizing={isCustomizing}
                isSelected={selectedCardId === cardConfig.id}
                onSelect={(id) => setSelectedCardId(id)}
                onUpdateSettings={updateCardSettings}
                onToggleVisibility={toggleVisibility}
              >
                {/* Card 1: Sequência & Metas Diárias */}
                <div
                  style={staggerStyle}
                  className="bento-card bg-[var(--bg-card,#ffffff)] dark:bg-[var(--card,#121215)] border border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)] rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between min-h-0 h-full"
                >
                  <div className="space-y-2">
                    {/* Header: Título "Sequência" + Botão "Ajustar" */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs border border-zinc-200/60 dark:border-zinc-800/80 transition-transform ${
                            isDailyGoalMet ? 'ring-2 ring-emerald-500/30 scale-105' : ''
                          }`}
                          style={{
                            backgroundColor: accentConfig.bgRgba,
                            color: accentConfig.primaryHex
                          }}
                        >
                          <Flame className="w-4 h-4 fill-current" />
                        </div>
                        <h2 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                          Sequência
                        </h2>
                      </div>

                      <Button
                        variant="outline"
                        size="xs"
                        onClick={handleToggleEditGoals}
                        className="px-2"
                        title={isEditingGoals ? 'Fechar ajustes' : 'Ajustar metas de questões e tempo'}
                      >
                        {isEditingGoals ? (
                          <X className="w-3.5 h-3.5" />
                        ) : (
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>

                    {isEditingGoals ? (
                      <form onSubmit={handleSaveCustomGoals} className="pt-1.5 space-y-2 animate-in fade-in duration-150">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
                              Questões
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="1000"
                              value={customGoalQuestions}
                              onChange={(e) => setCustomGoalQuestions(Number(e.target.value))}
                              className="w-full px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-sans font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
                              Tempo (min)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="1440"
                              value={customGoalTime}
                              onChange={(e) => setCustomGoalTime(Number(e.target.value))}
                              className="w-full px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-sans font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                              required
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1">
                          <Button
                            type="submit"
                            size="xs"
                            className="flex-1 text-xs font-bold text-white"
                            style={{ backgroundColor: accentConfig.primaryHex }}
                            leftIcon={<Check className="w-3.5 h-3.5" />}
                          >
                            Salvar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => setIsEditingGoals(false)}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="sequence-progress pt-2 pb-1 flex items-center gap-3.5 sm:gap-5">
                        {/* Bloco Sequência à Esquerda: Número ao lado de Dia / Consecutivo empilhados */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="text-3xl sm:text-4xl font-black font-sans tracking-tight text-zinc-900 dark:text-zinc-100 leading-none tabular-nums">
                            {stats.streakDays}
                          </span>
                          <div className="flex flex-col justify-center leading-none">
                            <span className="text-xs sm:text-[13px] font-bold text-zinc-800 dark:text-zinc-200 tracking-tight">
                              {stats.streakDays === 1 ? 'dia' : 'dias'}
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 tracking-normal">
                              {stats.streakDays === 1 ? 'consecutivo' : 'consecutivos'}
                            </span>
                          </div>
                        </div>

                        {/* Divisória vertical sutil */}
                        <div className="w-px h-8 bg-zinc-200/70 dark:bg-zinc-800/80 shrink-0" />

                        {/* Metas Diárias em Barras Horizontais Fluídas à Direita */}
                        <div className="flex-1 space-y-2.5 min-w-0">
                          {/* Barra 1: Meta de Questões */}
                          <div
                            className="space-y-1 group/bar cursor-default"
                            title={`Meta de Questões: ${todayAnswered} de ${dailyGoal} resolvidas hoje (${goalPercentage}%)`}
                          >
                            <div className="flex items-center justify-between text-xs leading-none">
                              <span className="font-bold text-zinc-900 dark:text-zinc-100 font-sans tabular-nums">
                                {todayAnswered} <span className="text-zinc-500 dark:text-zinc-400 font-normal text-[11px]">/ {dailyGoal} Q</span>
                              </span>
                              <span
                                className="font-sans font-bold text-[11px] tabular-nums"
                                style={{ color: primaryTextSafe }}
                              >
                                {animatedGoalPercentages.questions}%
                              </span>
                            </div>
                            <div className="w-full h-2 sm:h-2.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden p-0.5">
                              <div
                                className="h-full rounded-full transition-all duration-700 ease-out"
                                style={{
                                  width: `${Math.min(100, animatedGoalPercentages.questions)}%`,
                                  backgroundColor: accentConfig.primaryHex || '#10b981'
                                }}
                              />
                            </div>
                          </div>

                          {/* Barra 2: Meta de Tempo */}
                          <div
                            className="space-y-1 group/bar cursor-default"
                            title={`Meta de Tempo: ${todayStudyMinutes}m de ${dailyTimeGoal}m estudados hoje (${timeGoalPercentage}%)`}
                          >
                            <div className="flex items-center justify-between text-xs leading-none">
                              <span className="font-bold text-zinc-900 dark:text-zinc-100 font-sans tabular-nums">
                                {todayStudyMinutes}m <span className="text-zinc-500 dark:text-zinc-400 font-normal text-[11px]">/ {dailyTimeGoal}m</span>
                              </span>
                              <span
                                className="font-sans font-bold text-[11px] tabular-nums"
                                style={{ color: timeTextSafe }}
                              >
                                {animatedGoalPercentages.time}%
                              </span>
                            </div>
                            <div className="w-full h-2 sm:h-2.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden p-0.5">
                              <div
                                className="h-full rounded-full transition-all duration-700 ease-out"
                                style={{
                                  width: `${Math.min(100, animatedGoalPercentages.time)}%`,
                                  backgroundColor: accentConfig.timeAccent?.hex || accentConfig.primaryHex
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Gráfico de Barras: Volume de Questões & Frequência dos Últimos 7 Dias */}
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <BarChart2 className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
                        <span>Volume de Questões (7 dias)</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                        Total: <strong className="text-zinc-800 dark:text-zinc-200 font-sans font-bold tabular-nums">{weeklyDays.reduce((sum, d) => sum + d.answered, 0)} Q</strong>
                      </span>
                    </div>

                    <div className="h-20 sm:h-22 flex items-end justify-between gap-1.5 pt-1.5 pb-1 px-0.5">
                      {weeklyDays.map((day, idx) => {
                        const maxVolume = Math.max(dailyGoal || 30, ...weeklyDays.map((d) => d.answered));
                        const heightPercent = day.answered > 0 ? Math.min(100, Math.max(14, Math.round((day.answered / maxVolume) * 100))) : 0;

                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-default">
                            {/* Tooltip com quantidade e data ao passar o mouse */}
                            <div className={`absolute bottom-full hidden group-hover:block pointer-events-none bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-[10px] font-bold font-sans px-2 py-0.5 rounded-md shadow-md z-20 w-max max-w-[42cqw] whitespace-normal ${idx < 3 ? 'left-0' : idx > 3 ? 'right-0' : 'left-1/2 -translate-x-1/2'}`}>
                              {day.answered} Q • {day.dateFormatted}
                            </div>

                            {/* Micro-contagem minimalista acima da barra */}
                            <span
                              className={`text-[10px] font-sans tabular-nums leading-none mb-1 ${day.answered > 0
                                ? day.isToday
                                  ? 'font-bold'
                                  : 'font-semibold text-zinc-700 dark:text-zinc-300'
                                : 'text-zinc-400 dark:text-zinc-600 select-none'
                                }`}
                              style={day.isToday && day.answered > 0 ? { color: primaryTextSafe } : undefined}
                            >
                              {day.answered > 0 ? day.answered : ''}
                            </span>

                            {/* Barra com acabamento limpo e linha base sutil nos dias sem questões */}
                            <div className="w-full max-w-[22px] sm:max-w-[26px] bg-zinc-100/80 dark:bg-zinc-800/35 rounded-xl overflow-hidden flex flex-col justify-end flex-1 p-0.5 border border-zinc-200/40 dark:border-zinc-800/60 group-hover:border-zinc-300/70 dark:group-hover:border-zinc-700/70 transition-colors">
                              {day.answered > 0 ? (
                                <div
                                  className={`w-full rounded-lg transition-all duration-500 ease-out ${day.isToday ? 'shadow-xs' : ''}`}
                                  style={{
                                    height: `${heightPercent}%`,
                                    backgroundColor: day.isToday
                                      ? accentConfig.primaryHex
                                      : (accentConfig.primaryHex ? `${accentConfig.primaryHex}cc` : undefined)
                                  }}
                                />
                              ) : (
                                <div
                                  className="w-full h-[3px] rounded-full bg-zinc-300/80 dark:bg-zinc-700/70"
                                  style={day.isToday ? { backgroundColor: accentConfig.primaryHex, opacity: 0.65 } : undefined}
                                />
                              )}
                            </div>

                            {/* Label do Dia da Semana (Contraste WCAG AA) */}
                            <span
                              className={`text-[10px] mt-1.5 font-sans leading-none ${day.isToday
                                ? 'font-bold'
                                : day.answered > 0
                                  ? 'text-zinc-700 dark:text-zinc-300 font-semibold'
                                  : 'text-zinc-500 dark:text-zinc-400 font-medium'
                                }`}
                              style={day.isToday ? { color: primaryTextSafe } : undefined}
                            >
                              {day.isToday ? 'Hoje' : day.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </FigmaCardWrapper>
            );
          }
          if (cardConfig.id === 'home_aproveitamento') {
            const activePillColor =
              mode === 'dark'
                ? 'color-mix(in srgb, var(--primary-color, #2563eb) 65%, #ffffff)'
                : accentConfig.primaryHex;
            return (
              <FigmaCardWrapper
                summary={periodStats.answered ? `${periodStats.rate.toFixed(1)}%` : "Sem questões no período"}
                key={cardConfig.id}
                config={cardConfig}
                className={`self-stretch ${!isCustomizing ? 'bento-stagger-item' : ''}`}
                isCustomizing={isCustomizing}
                isSelected={selectedCardId === cardConfig.id}
                onSelect={(id) => setSelectedCardId(id)}
                onUpdateSettings={updateCardSettings}
                onToggleVisibility={toggleVisibility}
              >
                {/* Card 2: Aproveitamento com Seletor Deslizante e Estado Zero Fiel */}
                <div
                  style={staggerStyle}
                  className="bento-card bg-[var(--bg-card,#ffffff)] dark:bg-[var(--card,#121215)] border border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)] rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between min-h-0 h-full"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs border border-zinc-200/60 dark:border-zinc-800/80"
                          style={{
                            backgroundColor: accentConfig.bgRgba,
                            color: accentConfig.primaryHex
                          }}
                        >
                          <Award className="w-4 h-4" />
                        </div>
                        <h2 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                          Aproveitamento
                        </h2>
                      </div>

                      {/* Seletor Interativo de Período com Sliding Pill 60fps */}
                      <div className="relative grid grid-cols-2 bg-zinc-100 dark:bg-zinc-800/90 p-0.5 rounded-lg border border-zinc-200/70 dark:border-zinc-700/60 min-w-[104px]">
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-md bg-white dark:bg-zinc-700 shadow-2xs transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            accuracyPeriod === '7d' ? 'translate-x-full' : 'translate-x-0'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setAccuracyPeriod('geral')}
                          className={`relative z-10 text-[10px] px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer text-center ${
                            accuracyPeriod === 'geral'
                              ? ''
                              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                          }`}
                          style={accuracyPeriod === 'geral' ? { color: activePillColor } : undefined}
                        >
                          Geral
                        </button>
                        <button
                          type="button"
                          onClick={() => setAccuracyPeriod('7d')}
                          className={`relative z-10 text-[10px] px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer text-center ${
                            accuracyPeriod === '7d'
                              ? ''
                              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                          }`}
                          style={accuracyPeriod === '7d' ? { color: activePillColor } : undefined}
                        >
                          7 Dias
                        </button>
                      </div>
                    </div>

                    {/* Velocímetro Radial de Precisão (Semicírculo Gauge) */}
                    {(() => {
                      const pct = Math.max(0, Math.min(100, periodStats.answered > 0 ? animatedAccuracy : 0));
                      const radius = 62;
                      const cx = 95;
                      const cy = 76;
                      const arcLength = Math.PI * radius; // ~194.78
                      const strokeDashoffset = arcLength * (1 - pct / 100);

                      // Coordenadas trigonométricas do ponteiro luminoso (de PI radianos a 0 radianos)
                      const angle = Math.PI * (pct / 100);
                      const dotX = cx - radius * Math.cos(angle);
                      const dotY = cy - radius * Math.sin(angle);

                      // Marcadores de escala (Ticks sutis do velocímetro)
                      const ticks = [0, 0.25, 0.5, 0.75, 1];

                      // Gradiente da cor do sistema: mais escuro no começo (0%) e mais claro no final (100%)
                      const themeGaugeGradient = (() => {
                        switch (accentConfig.id) {
                          case 'rose':
                            return { dark: '#be123c', mid: '#e11d48', light: '#fb7185' };
                          case 'red':
                            return { dark: '#991b1b', mid: '#dc2626', light: '#f87171' };
                          case 'blue':
                            return { dark: '#1e40af', mid: '#2563eb', light: '#60a5fa' };
                          case 'green':
                            return { dark: '#065f46', mid: '#059669', light: '#34d399' };
                          case 'orange':
                            return { dark: '#9a3412', mid: '#ea580c', light: '#fb923c' };
                          case 'purple':
                            return { dark: '#5b21b6', mid: '#7c3aed', light: '#c084fc' };
                          case 'neutral':
                            return mode === 'dark'
                              ? { dark: '#52525b', mid: '#a1a1aa', light: '#ffffff' }
                              : { dark: '#27272a', mid: '#52525b', light: '#a1a1aa' };
                          default:
                            return {
                              dark: accentConfig.hoverHex || accentConfig.primaryHex,
                              mid: accentConfig.primaryHex,
                              light: accentConfig.chartPalette?.[1] || accentConfig.primaryHex
                            };
                        }
                      })();

                      return (
                        <div className="relative flex flex-col items-center justify-center pt-0.5 pb-0.5">
                          <div className="relative w-44 sm:w-48 h-20 sm:h-22 overflow-hidden flex items-end justify-center">
                            <svg viewBox="0 0 190 90" className="w-full h-full overflow-visible">
                              <defs>
                                <linearGradient id={`gaugeGrad-${cardConfig.id}`} x1="0" y1="0" x2="1" y2="0">
                                  <stop offset="0%" stopColor={themeGaugeGradient.dark} />
                                  <stop offset="60%" stopColor={themeGaugeGradient.mid} />
                                  <stop offset="100%" stopColor={themeGaugeGradient.light} />
                                </linearGradient>
                              </defs>

                              {/* Ticks sutis no contorno do velocímetro */}
                              {ticks.map((t, idx) => {
                                const a = Math.PI * t;
                                const x1 = cx - 70 * Math.cos(a);
                                const y1 = cy - 70 * Math.sin(a);
                                const x2 = cx - 74 * Math.cos(a);
                                const y2 = cy - 74 * Math.sin(a);
                                return (
                                  <line
                                    key={idx}
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    className="text-zinc-300 dark:text-zinc-700/80"
                                  />
                                );
                              })}

                              {/* Trilho de fundo (arco escuro) */}
                              <path
                                d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="7.5"
                                strokeLinecap="round"
                                className="text-zinc-100 dark:text-zinc-800/80"
                              />

                              {/* Arco ativo com gradiente suave */}
                              <path
                                d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
                                fill="none"
                                stroke={`url(#gaugeGrad-${cardConfig.id})`}
                                strokeWidth="7.5"
                                strokeLinecap="round"
                                strokeDasharray={arcLength}
                                strokeDashoffset={strokeDashoffset}
                                className="transition-all duration-700 ease-out"
                              />
                            </svg>

                            {/* Valor Central Dentro do Arco */}
                            <div className="absolute inset-x-0 bottom-0.5 flex flex-col items-center text-center pointer-events-none">
                              <div className="flex items-baseline justify-center">
                                <span className="text-3xl font-black font-sans tracking-tight text-zinc-900 dark:text-zinc-100">
                                  {periodStats.answered > 0 ? animatedAccuracy.toFixed(1) : '0.0'}
                                </span>
                                <span
                                  className="text-sm font-bold font-sans ml-0.5"
                                  style={{ color: accentConfig.primaryHex }}
                                >
                                  %
                                </span>
                              </div>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-0.5">
                                Taxa de Acertos
                              </span>
                            </div>

                            {/* Labels de 0% e 100% */}
                            <span className="absolute left-1 bottom-0.5 text-[8px] font-mono text-zinc-400 dark:text-zinc-600">0%</span>
                            <span className="absolute right-1 bottom-0.5 text-[8px] font-mono text-zinc-400 dark:text-zinc-600">100%</span>
                          </div>

                          {/* Pill Informativo: Questões Resolvidas */}
                          <div className="mt-1.5 inline-flex items-center justify-center px-3 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-[10px] text-zinc-600 dark:text-zinc-400">
                            <span>
                              <strong className="text-zinc-900 dark:text-zinc-100 font-sans">{periodStats.correct}</strong> de {periodStats.answered} questões
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                  {/* Desempenho por Dificuldade (Sem números fictícios quando 0 questões) */}
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">Desempenho por Dificuldade</span>
                        {!difficultyStats.hasAnswers && (
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                            Sem respostas
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                        {/* Fáceis */}
                        <div className="p-1.5 px-2 rounded-xl bg-zinc-50/90 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between">
                          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[10px]">
                            <span className="font-medium">Fáceis</span>
                            {difficultyStats.hasAnswers && difficultyStats.facil.total > 0 && (
                              <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono">
                                {difficultyStats.facil.correct}/{difficultyStats.facil.total}
                              </span>
                            )}
                          </div>
                          <span className={`font-sans font-extrabold text-xs mt-0.5 tabular-nums ${difficultyStats.hasAnswers ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500'}`}>
                            {difficultyStats.hasAnswers ? `${difficultyStats.facil.rate.toFixed(1)}%` : '—'}
                          </span>
                          <div className="w-full h-1 bg-zinc-200/70 dark:bg-zinc-800 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${difficultyStats.hasAnswers ? Math.min(100, difficultyStats.facil.rate) : 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Médias */}
                        <div className="p-1.5 px-2 rounded-xl bg-zinc-50/90 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between">
                          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[10px]">
                            <span className="font-medium">Médias</span>
                            {difficultyStats.hasAnswers && difficultyStats.medio.total > 0 && (
                              <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono">
                                {difficultyStats.medio.correct}/{difficultyStats.medio.total}
                              </span>
                            )}
                          </div>
                          <span className={`font-sans font-extrabold text-xs mt-0.5 tabular-nums ${difficultyStats.hasAnswers ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500'}`}>
                            {difficultyStats.hasAnswers ? `${difficultyStats.medio.rate.toFixed(1)}%` : '—'}
                          </span>
                          <div className="w-full h-1 bg-zinc-200/70 dark:bg-zinc-800 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${difficultyStats.hasAnswers ? Math.min(100, difficultyStats.medio.rate) : 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Difíceis */}
                        <div className="p-1.5 px-2 rounded-xl bg-zinc-50/90 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between">
                          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[10px]">
                            <span className="font-medium">Difíceis</span>
                            {difficultyStats.hasAnswers && difficultyStats.dificil.total > 0 && (
                              <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono">
                                {difficultyStats.dificil.correct}/{difficultyStats.dificil.total}
                              </span>
                            )}
                          </div>
                          <span className={`font-sans font-extrabold text-xs mt-0.5 tabular-nums ${difficultyStats.hasAnswers ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500'}`}>
                            {difficultyStats.hasAnswers ? `${difficultyStats.dificil.rate.toFixed(1)}%` : '—'}
                          </span>
                          <div className="w-full h-1 bg-zinc-200/70 dark:bg-zinc-800 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-rose-500 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${difficultyStats.hasAnswers ? Math.min(100, difficultyStats.dificil.rate) : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FigmaCardWrapper>
            );
          }
          if (cardConfig.id === 'home_percentil') {
            return (
              <FigmaCardWrapper
                summary={`P${effectivePercentile}`}
                key={cardConfig.id}
                config={cardConfig}
                isCustomizing={isCustomizing}
                isSelected={selectedCardId === cardConfig.id}
                onSelect={(id) => setSelectedCardId(id)}
                onUpdateSettings={updateCardSettings}
                onToggleVisibility={toggleVisibility}
              >
                {/* Card 3: Percentil Oficial */}
                <div
                  ref={percentileCardRef}
                  className="bento-card bg-[var(--bg-card,#ffffff)] dark:bg-[var(--card,#121215)] border border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)] rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between min-h-0 h-full space-y-2.5 relative overflow-hidden transition-all duration-300 group"
                >
                  {isMedalAnimating && (
                    <div className="absolute inset-0 bg-white/75 dark:bg-black/75 backdrop-blur-[2px] pointer-events-none rounded-2xl animate-in fade-in duration-300 z-10" />
                  )}
                  <div className="flex-1 flex flex-col justify-between min-h-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          ref={percentileMedalRef}
                          onClick={triggerMedalAnimation}
                          title="Clique para repetir animação da medalha"
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900 transition-all cursor-pointer z-20 ${isMedalAnimating ? 'animate-medal-takeover ring-2 ring-amber-500/30' : 'hover:scale-105 active:scale-95'
                            }`}
                          style={{
                            color: percentileTier.color
                          }}
                        >
                          <Medal className={`w-4 h-4 transition-transform duration-300 ${isMedalAnimating ? 'scale-125' : ''}`} />
                        </div>
                        <h2 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                          Percentil Oficial
                        </h2>
                      </div>
                      {!isPercentileCalibrating ? (
                        <Badge variant="default" size="sm" className="font-sans">
                          Top {Math.max(1, 100 - (effectivePercentile || 0))}%
                        </Badge>
                      ) : (
                        <Badge variant="outline" size="sm" className="font-sans text-zinc-500">
                          {percentileTier.rangeLabel}
                        </Badge>
                      )}
                    </div>

                    {!isPercentileCalibrating ? (
                      <div className="pt-1 pb-0.5 flex items-baseline justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-black font-sans tracking-tight text-zinc-900 dark:text-zinc-100">
                            P{effectivePercentile}
                          </span>
                        </div>
                        <Badge variant="outline" size="sm" style={{ borderColor: `${percentileTier.color}50`, color: percentileTier.color }}>
                          Nível {percentileTier.name}
                        </Badge>
                      </div>
                    ) : (
                      <div className="pt-1 pb-0.5 flex items-baseline justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl sm:text-3xl font-black font-sans tracking-tight text-zinc-900 dark:text-zinc-100">
                            {stats.percentileInfo.missingForApprox}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">questões restantes</span>
                        </div>
                        <Badge variant="warning" size="sm" className="gap-1">
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: percentileTier.color }} />
                          Calibrando
                        </Badge>
                      </div>
                    )}

                    {/* Curva Normal de Distribuição TRI (Gaussiana) Padrão Compacta com Animação Fluida */}
                    <div className="pt-1 flex-1 flex flex-col border-t border-zinc-100 dark:border-zinc-800/80 animate-in fade-in duration-200">
                      {/* Gráfico Vetorial da Gaussiana com Ponto do Aluno e Alto Contraste */}
                      <div className="relative w-full flex-1 h-[78px] min-h-[68px] bg-zinc-50/70 dark:bg-zinc-900/50 rounded-xl p-1.5 px-2 border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden flex flex-col justify-between">
                        <svg
                          key={`tri-curve-${cardConfig.id}-${curveAnimKey}`}
                          viewBox="0 0 320 85"
                          className="w-full h-full flex-1 overflow-visible"
                        >
                          <defs>
                            <linearGradient id={`triGradient-${cardConfig.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={percentileTier.color} stopOpacity="0.45" />
                              <stop offset="100%" stopColor={percentileTier.color} stopOpacity="0.04" />
                            </linearGradient>
                          </defs>

                          {/* Área sob a curva real adaptada aos alunos com gradiente suave */}
                          <path
                            d={adaptiveCurve.areaPath}
                            fill={`url(#triGradient-${cardConfig.id})`}
                            className="animate-curve-fill"
                          />
                          {/* Linha da Curva Gaussiana Adaptável calibrada com todos os alunos da plataforma */}
                          <path
                            d={adaptiveCurve.curvePath}
                            fill="none"
                            stroke={percentileTier.color}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            opacity="0.9"
                            className="animate-curve-draw"
                          />

                          {/* Marcações de Percentil: P25, P50, P75, P90 adaptadas dinamicamente à curva */}
                          <g className="animate-curve-guides">
                            <line x1={adaptiveCurve.p25.x} y1={adaptiveCurve.p25.y} x2={adaptiveCurve.p25.x} y2="75" stroke="currentColor" strokeDasharray="2,2" strokeWidth="1" className="text-zinc-300 dark:text-zinc-800" />
                            <line x1={adaptiveCurve.p50.x} y1={adaptiveCurve.p50.y} x2={adaptiveCurve.p50.x} y2="75" stroke="currentColor" strokeDasharray="2,2" strokeWidth="1" className="text-zinc-300 dark:text-zinc-800" />
                            <line x1={adaptiveCurve.p75.x} y1={adaptiveCurve.p75.y} x2={adaptiveCurve.p75.x} y2="75" stroke="currentColor" strokeDasharray="2,2" strokeWidth="1" className="text-zinc-300 dark:text-zinc-800" />
                            <line x1={adaptiveCurve.p90.x} y1={adaptiveCurve.p90.y} x2={adaptiveCurve.p90.x} y2="75" stroke="currentColor" strokeDasharray="2,2" strokeWidth="1" className="text-emerald-500/50" />
                          </g>

                          {/* Posição do Aluno na Curva com Indicador Luminoso e Badge */}
                          <g className="animate-marker-group">
                            <line
                              x1={adaptiveCurve.markerX}
                              y1={adaptiveCurve.markerY}
                              x2={adaptiveCurve.markerX}
                              y2="75"
                              stroke={percentileTier.color}
                              strokeWidth="1.5"
                              strokeDasharray="2,3"
                              opacity="0.85"
                              className="animate-marker-line"
                            />
                            <g className="animate-marker-pop" style={{ transformOrigin: `${adaptiveCurve.markerX}px ${adaptiveCurve.markerY}px` }}>
                              <circle cx={adaptiveCurve.markerX} cy={adaptiveCurve.markerY} r="4" fill="#ffffff" stroke={percentileTier.color} strokeWidth="2" />
                              <circle cx={adaptiveCurve.markerX} cy={adaptiveCurve.markerY} r="7.5" fill={percentileTier.color} fillOpacity="0.3" className="animate-pulse" />
                            </g>
                          </g>
                        </svg>

                        {/* Labels do eixo X da curva */}
                        <div className="relative pt-0.5 flex justify-between text-[9px] font-mono text-zinc-500 dark:text-zinc-400 font-medium">
                          <span>P1</span>
                          <span>P25</span>
                          <span className="font-bold text-zinc-700 dark:text-zinc-300">P50</span>
                          <span>P75</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">P90</span>
                        </div>
                      </div>

                      {/* Indicadores Expandidos caso o usuário estique a altura */}
                      {Boolean(cardConfig.customHeight ? cardConfig.customHeight > 260 : false) && (
                        <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                          <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between">
                            <span className="text-zinc-400 font-medium">Zona de Corte</span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">Top 10% (P90)</span>
                          </div>
                          <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between">
                            <span className="text-zinc-400 font-medium">Aceleração TRI</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">+14 pts p/ Próx Nível</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs border-t border-zinc-100 dark:border-zinc-800/80 gap-2">
                    {!isPercentileCalibrating ? (
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 min-w-0">
                        <span className="truncate">À frente de <strong className="font-sans font-bold text-zinc-800 dark:text-zinc-200">{effectivePercentile}%</strong> dos candidatos</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        Progresso TRI:{' '}
                        <strong className="font-sans font-bold text-zinc-800 dark:text-zinc-200 tabular-nums">
                          {Math.min(
                            UNRANKED_THRESHOLD,
                            stats.percentileInfo.validQuestionsCount ??
                              Math.max(0, UNRANKED_THRESHOLD - (stats.percentileInfo.missingForApprox ?? UNRANKED_THRESHOLD))
                          )}
                          /{UNRANKED_THRESHOLD}
                        </strong>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => onNavigate('ranking')}
                      className="text-xs font-bold hover:underline cursor-pointer flex items-center gap-1 shrink-0 ml-auto transition-colors text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white whitespace-nowrap"
                    >
                      <span>Ranking Oficial</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </FigmaCardWrapper>
            );
          }
          if (cardConfig.id === 'home_recomendacao') {
            return (
              <FigmaCardWrapper
                summary={recommendedArea?.label ?? "Sem recomendação disponível"}
                key={cardConfig.id}
                config={cardConfig}
                isCustomizing={isCustomizing}
                isSelected={selectedCardId === cardConfig.id}
                onSelect={(id) => setSelectedCardId(id)}
                onUpdateSettings={updateCardSettings}
                onToggleVisibility={toggleVisibility}
              >
                <div className="w-full bento-card bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden group min-h-0 h-full flex flex-col justify-between space-y-3">
                  <div className="md:col-span-6 space-y-2 relative">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider border inline-block"
                        style={{
                          backgroundColor: accentConfig.bgRgba,
                          borderColor: accentConfig.borderRgba,
                          color: accentConfig.primaryHex
                        }}
                      >
                        Recomendação do Dia
                      </span>
                      {recommendedArea.hasData && (
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                          {recommendedArea.accuracy}% de acerto recente
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-heading text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span>Praticar {recommendedArea.label}</span>
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mt-0.5 card-height-compact-hide">
                        {recommendedArea.hasData
                          ? 'Foco prioritário de alavancagem para elevar seu percentil.'
                          : 'Área essencial com alta incidência nas provas.'}
                      </p>
                    </div>

                    <div className="pt-1 flex flex-wrap items-center gap-2">
                      {/* Botão Treinar -> Abre Drawer Central com Subtemas e Radar da Banca */}
                      <Button
                        type="button"
                        onClick={() => { if (isCustomizing) return; setActiveCentralDrawer('treinar_recomendacao'); }}
                        className="w-full sm:w-auto text-xs sm:text-sm font-bold"
                        style={{
                          backgroundColor: accentConfig.primaryHex,
                          boxShadow: `0 3px 10px ${accentConfig.bgRgba}`
                        }}
                        title="Abrir centro de treino com subtemas e radar da banca"
                        leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                      >
                        Treinar {recommendedArea.label}
                      </Button>

                      {/* Botão Blitz TRI */}
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          if (onStartSimuladoExpress) {
                            onStartSimuladoExpress(10);
                          } else {
                            handlePracticeArea(recommendedArea.filterName);
                          }
                        }}
                        className="w-full sm:w-auto text-xs font-semibold"
                        title="Treino expresso de 10 questões calibradas pelo modelo psicométrico TRI (~12 min)"
                        leftIcon={<Zap className="w-3.5 h-3.5 text-amber-500" />}
                      >
                        Blitz TRI (10Q • 12 min)
                      </Button>
                    </div>
                  </div>

                  {/* VISÃO EXPANDIDA ADAPTATIVA: Top Subtemas Críticos da Área */}
                  {Boolean(cardConfig.customHeight ? cardConfig.customHeight > 175 : false) && (
                    <div className="pt-2.5 space-y-2 border-t border-zinc-100 dark:border-zinc-800/80 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-blue-500" />
                          Subtemas de Maior Incidência na Banca
                        </span>
                        <span className="text-[10px] text-zinc-400">Radar de Incidência</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[10px]">
                        {[
                          { title: 'Insuficiência Cardíaca', badge: '24% da banca' },
                          { title: 'Sepse e Choque Séptico', badge: '19% da banca' },
                          { title: 'Doença Renal Crônica', badge: '15% da banca' },
                        ].map((sub, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handlePracticeArea(recommendedArea.filterName)}
                            className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-left hover:border-blue-400 transition-colors flex flex-col justify-between cursor-pointer"
                          >
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{sub.title}</span>
                            <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold mt-1">{sub.badge}</span>
                          </button>
                        ))}
                      </div>

                      {Boolean(cardConfig.customHeight ? cardConfig.customHeight > 175 : false) && (
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                          <span>Impacto no Percentil: <strong className="text-emerald-600 dark:text-emerald-400">+6.8 pontos</strong></span>
                          <span>Tempo Médio Sugerido: <strong>35 minutos</strong></span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </FigmaCardWrapper>
            );
          }
          if (cardConfig.id === 'home_caderno_erros' || cardConfig.id === 'home_mnemonico') {
            return (
              <FigmaCardWrapper
                summary={`${pendingErrorsCount} pendentes`}
                key={cardConfig.id}
                config={cardConfig}
                isCustomizing={isCustomizing}
                isSelected={selectedCardId === cardConfig.id}
                onSelect={(id) => setSelectedCardId(id)}
                onUpdateSettings={updateCardSettings}
                onToggleVisibility={toggleVisibility}
              >
                {/* Card: Caderno de Erros & Revisão Ativa (Substitui o card duplicado) */}
                <div
                  onClick={() => {
                    if (isCustomizing) return;
                    setActiveCentralDrawer('caderno_erros');
                  }}
                  className="bento-card bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between min-h-0 h-full relative overflow-hidden space-y-3 group cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                  title="Clique para abrir o Caderno de Erros e foco de reteste"
                >
                  <div className="space-y-2.5">
                    {/* Header com Tag de Revisão Ativa & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20 shadow-2xs">
                          <RotateCcw className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                          Caderno de Erros
                        </span>
                      </div>

                      <Badge
                        variant={pendingErrorsCount > 0 ? 'destructive' : 'success'}
                        size="sm"
                        className="font-sans"
                      >
                        {pendingErrorsCount > 0 ? `${pendingErrorsCount} pendentes` : 'Em dia'}
                      </Badge>
                    </div>

                    {/* Conteúdo Dinâmico */}
                    {pendingErrorsCount > 0 ? (
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-heading text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <span>Revisão Ativa de Erros</span>
                          </h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mt-0.5">
                            {mostCriticalArea
                              ? `Foco prioritário: ${mostCriticalArea.name} (${mostCriticalArea.count} erros registrados).`
                              : 'Reteste ativo das questões com erro para consolidar memória de longo prazo.'}
                          </p>
                        </div>

                        {/* Botões de Ação Direta */}
                        <div className="pt-1 flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            onClick={() => {
                              if (isCustomizing) return;
                              setActiveCentralDrawer('caderno_erros');
                            }}
                            className="w-full sm:w-auto text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
                            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                          >
                            Revisar Erros ({Math.min(pendingErrorsCount, 10)}Q)
                          </Button>

                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              if (isCustomizing) return;
                              onNavigate('caderno_erros');
                            }}
                            className="w-full sm:w-auto text-xs font-semibold"
                            leftIcon={<AlertOctagon className="w-3.5 h-3.5 text-rose-500" />}
                          >
                            Ver Caderno Completo
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-5 h-5 shrink-0" />
                          <span className="font-bold text-sm">Nenhum erro pendente!</span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Você recuperou todas as questões erradas recentemente. Mantenha o ritmo resolvendo novos cadernos!
                        </p>
                        <div className="pt-1">
                          <Button
                            type="button"
                            variant="secondary"
                            size="xs"
                            onClick={() => {
                              if (isCustomizing) return;
                              onNavigate('caderno_erros');
                            }}
                            className="text-xs font-semibold"
                          >
                            Ver Histórico de Recuperação
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rodapé Metacognitivo Sutil */}
                  <div className="pt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/80">
                    <span className="text-[10px] text-zinc-400 truncate">
                      💡 Reteste ativo de erros eleva a retenção de longo prazo em até 40%.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (isCustomizing) return;
                        setActiveCentralDrawer('caderno_erros');
                      }}
                      className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </FigmaCardWrapper>
            );
          }
          if (cardConfig.id === 'home_agenda') {
            return (
              <FigmaCardWrapper
                summary={`${todayAgendaActivities.length} atividades hoje`}
                key={cardConfig.id}
                config={cardConfig}
                isCustomizing={isCustomizing}
                isSelected={selectedCardId === cardConfig.id}
                onSelect={(id) => setSelectedCardId(id)}
                onUpdateSettings={updateCardSettings}
                onToggleVisibility={toggleVisibility}
              >
                {/* Card: Agenda de Estudos - Atividade Atual Somente & Gatilho do Drawer Central */}
                <div
                  onClick={() => { if (isCustomizing) return; setActiveCentralDrawer('agenda_detalhada'); }}
                  className="bento-card bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-4 shadow-xs cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group flex flex-col justify-between min-h-0 h-full relative overflow-hidden space-y-2.5"
                  title="Clique para abrir o cronograma de atividades de hoje"
                >
                  {(() => {
                    const now = new Date();
                    const currentMinutes = now.getHours() * 60 + now.getMinutes();

                    // 1. Atividade em andamento agora (prioriza estudo, ou slot atual do cronograma)
                    const currentActivity = todayAgendaActivities.find(
                      (slot) => currentMinutes >= slot.startMinutes && currentMinutes < slot.endMinutes
                    ) || (currentPeriodInfo.status === 'em_andamento' ? currentPeriodInfo.slot : null);

                    // 2. Próxima atividade programada de hoje (a ser feita)
                    const upcomingActivity = todayAgendaActivities.find(
                      (slot) => slot.startMinutes > currentMinutes
                    ) || (currentPeriodInfo.status === 'proximo' ? currentPeriodInfo.slot : null);

                    // 3. Atividades concluídas hoje
                    const completedActivities = todayAgendaActivities.filter(
                      (slot) => slot.endMinutes <= currentMinutes
                    );

                    const isAllCompleted = todayAgendaActivities.length > 0 && !currentActivity && !upcomingActivity;

                    return (
                      <div className="flex-1 flex flex-col justify-between min-h-0 space-y-2">
                        {/* Header: Título "Agenda de Estudos" + Status Dinâmico */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs border border-zinc-200/60 dark:border-zinc-800/80"
                              style={{
                                backgroundColor: accentConfig.bgRgba,
                                color: accentConfig.primaryHex
                              }}
                            >
                              <CalendarDays className="w-4 h-4" />
                            </div>
                            <h2 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                              Agenda de Estudos
                            </h2>
                          </div>

                          <div className="flex items-center gap-2">
                            {currentActivity ? (
                              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Agora em andamento
                              </span>
                            ) : upcomingActivity ? (
                              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                <Clock className="w-3 h-3 text-blue-500" />
                                Próxima atividade
                              </span>
                            ) : isAllCompleted ? (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                Concluído hoje
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                                Hoje livre
                              </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 group-hover:text-zinc-200 transition-all shrink-0" />
                          </div>
                        </div>

                        {/* Conteúdo: Atividade Atual Somente (ou Próxima / Concluído / Livre) */}
                        <div className="py-0.5 my-auto">
                          {currentActivity ? (
                            <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 space-y-2.5">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                  Bloco em Andamento
                                </span>
                                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800/90 text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60">
                                  {currentActivity.startTime} – {currentActivity.endTime}
                                  {currentActivity.endMinutes > currentMinutes && (
                                    <span className="ml-1 text-emerald-600 dark:text-emerald-400 font-bold">
                                      • {currentActivity.endMinutes - currentMinutes}m restantes
                                    </span>
                                  )}
                                </span>
                              </div>

                              <div className="space-y-0.5">
                                <h3
                                  className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 leading-snug"
                                  title={currentActivity.title}
                                >
                                  {currentActivity.title}
                                </h3>
                                {currentActivity.description && (
                                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 font-light">
                                    {cleanEventDescription(currentActivity.description)}
                                  </p>
                                )}
                              </div>

                              {/* Barra de Progresso do Bloco Atual */}
                              {(() => {
                                const elapsed = Math.max(0, currentMinutes - currentActivity.startMinutes);
                                const total = Math.max(1, currentActivity.endMinutes - currentActivity.startMinutes);
                                const pct = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
                                return (
                                  <div className="space-y-1 pt-0.5">
                                    <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                                      <span>Progresso deste bloco</span>
                                      <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{pct}%</span>
                                    </div>
                                    <ProgressBar value={pct} max={100} variant="primary" size="xs" />
                                  </div>
                                );
                              })()}
                            </div>
                          ) : upcomingActivity ? (
                            <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 space-y-2">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                  A Seguir no Cronograma
                                </span>
                                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800/90 text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60">
                                  Inicia às {upcomingActivity.startTime} (em {Math.max(1, upcomingActivity.startMinutes - currentMinutes)}m)
                                </span>
                              </div>

                              <div className="space-y-0.5">
                                <h3
                                  className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 leading-snug"
                                  title={upcomingActivity.title}
                                >
                                  {upcomingActivity.title}
                                </h3>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                  Horário programado: {upcomingActivity.startTime} até {upcomingActivity.endTime}
                                </p>
                              </div>
                            </div>
                          ) : isAllCompleted ? (
                            <div className="space-y-2">
                              <div className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                    Atividades de hoje concluídas
                                  </h3>
                                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                    {completedActivities.length} de {completedActivities.length} tarefas realizadas com sucesso.
                                  </p>
                                </div>
                              </div>

                              {/* Chips compactos dos últimos blocos realizados para preencher o card com equilíbrio e zero poluição */}
                              {completedActivities.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
                                  {completedActivities.slice(-2).map((act, idx) => (
                                    <div
                                      key={idx}
                                      className="p-2 rounded-xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/70 flex items-center justify-between gap-2"
                                    >
                                      <div className="min-w-0 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                        <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 truncate">
                                          {act.title}
                                        </span>
                                      </div>
                                      <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                                        {act.startTime}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                                <Calendar className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                  Nenhuma atividade programada agora
                                </h3>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                  Toque para abrir a agenda do dia e planejar seus estudos.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Rodapé Fluido */}
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                          <span className="text-[11px] flex items-center gap-1.5">
                            <span>{completedActivities.length} {completedActivities.length === 1 ? 'concluída' : 'concluídas'}</span>
                            <span className="text-zinc-300 dark:text-zinc-700">•</span>
                            <span>{todayAgendaActivities.length} no total</span>
                          </span>
                          {isAllCompleted && (
                            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 font-sans">
                              100% cumprido
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </FigmaCardWrapper>
            );
          }

          {/* Card: Dicas Rápidas & Pérolas de Decoreba Baseadas no Conteúdo Estudado */ }
          if (cardConfig.id === 'home_dicas') {
            const dynamicTipConfig = isCustomizing
              ? cardConfig
              : { ...cardConfig, customHeight: undefined, maxHeight: undefined };
            return (
              <FigmaCardWrapper
                summary={CLINICAL_TIPS_DATABASE[currentTipIndex]?.title ?? "Dica do dia"}
                key={cardConfig.id}
                config={dynamicTipConfig}
                isCustomizing={isCustomizing}
                isSelected={selectedCardId === cardConfig.id}
                onSelect={(id) => setSelectedCardId(id)}
                onUpdateSettings={updateCardSettings}
                onToggleVisibility={toggleVisibility}
              >
                <div
                  onClick={() => {
                    if (isCustomizing) return;
                    setActiveCentralDrawer('dica_dia_detalhada');
                  }}
                  className="bento-card bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between min-h-[160px] h-auto relative space-y-3 group cursor-pointer hover:border-amber-500/40 dark:hover:border-amber-500/30 transition-all"
                  title="Clique para ver raciocínio detalhado, conduta e pegadinhas"
                >
                  {/* BARRA SUPERIOR DE MODO DESENVOLVEDOR (INSPEÇÃO DOS 385 CARDS NA TELA INICIAL - RESTRITA A ADMIN/DEV) */}
                  {(isAdmin || process.env.NODE_ENV === 'development') && showDevBar && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/25 flex flex-wrap items-center justify-between gap-2 select-none animate-in fade-in duration-200"
                    >
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black flex items-center gap-1 shadow-2xs">
                          <Brain className="w-3 h-3" />
                          DEV PREVIEW
                        </span>
                        <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                          Card <span className="text-amber-600 dark:text-amber-400 font-mono">#{currentTipIndex + 1}</span> de {CLINICAL_TIPS_DATABASE.length}
                        </span>
                        {devCardIndex !== null && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/30">
                            Fixado
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Botão Anterior */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const nextIdx = (currentTipIndex - 1 + CLINICAL_TIPS_DATABASE.length) % CLINICAL_TIPS_DATABASE.length;
                            setDevCardIndex(nextIdx);
                          }}
                          className="px-2 py-1 rounded-lg text-xs font-bold border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:border-amber-500 hover:text-amber-500 transition-colors flex items-center gap-0.5 cursor-pointer shadow-2xs"
                          title="Card Anterior"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Ant</span>
                        </button>

                        {/* Dropdown Seletor de Qualquer um dos 385 Cards */}
                        <select
                          value={currentTipIndex}
                          onChange={(e) => {
                            e.stopPropagation();
                            setDevCardIndex(Number(e.target.value));
                          }}
                          className="text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg px-2 py-1 max-w-[190px] sm:max-w-[260px] truncate focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-2xs"
                          title="Selecione qualquer um dos 385 cards para inspecionar"
                        >
                          {CLINICAL_TIPS_DATABASE.map((tip, idx) => (
                            <option key={tip.id} value={idx}>
                              #{idx + 1} [{tip.specialty.slice(0, 4)}] {tip.title}
                            </option>
                          ))}
                        </select>

                        {/* Botão Próximo */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const nextIdx = (currentTipIndex + 1) % CLINICAL_TIPS_DATABASE.length;
                            setDevCardIndex(nextIdx);
                          }}
                          className="px-2 py-1 rounded-lg text-xs font-bold border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:border-amber-500 hover:text-amber-500 transition-colors flex items-center gap-0.5 cursor-pointer shadow-2xs"
                          title="Próximo Card"
                        >
                          <span className="hidden sm:inline">Próx</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        {/* Botão Catálogo Completo (Modal) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDevTipModal(true);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Abrir Catálogo Completo com Busca de todos os 385 cards"
                        >
                          <LayoutGrid className="w-3.5 h-3.5" />
                          <span className="font-extrabold">Ver Todos ({CLINICAL_TIPS_DATABASE.length})</span>
                        </button>

                        {/* Botão Resetar para a Dica do Dia do Estudante */}
                        {devCardIndex !== null && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDevCardIndex(null);
                            }}
                            className="px-2 py-1 rounded-lg text-[11px] font-semibold border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-amber-500 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Voltar para a dica do dia recomendada ao aluno"
                          >
                            <RotateCcw className="w-3 h-3 text-amber-500" />
                            <span>Hoje</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 flex-1 flex flex-col justify-between">
                    {/* Header: Ícone + Título Direto e Sucinto + Active Recall Toggle + Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-2xs">
                          <Lightbulb className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug break-words" title={displayedClinicalTip.fullTitle || displayedClinicalTip.title}>
                            {displayedClinicalTip.title}
                          </h2>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium block break-words leading-tight">
                            {displayedClinicalTip.specialty} • {displayedClinicalTip.tema}{displayedClinicalTip.foco ? ` • ${displayedClinicalTip.foco}` : ''}
                          </span>
                        </div>
                      </div>

                      {/* Ações do Header: Toggle de Active Recall e Badge */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {(isAdmin || process.env.NODE_ENV === 'development') && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDevBar((prev) => !prev);
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                              showDevBar
                                ? 'bg-amber-500 text-black border-amber-500'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-amber-500 border-zinc-200 dark:border-zinc-700'
                            }`}
                            title={showDevBar ? "Ocultar ferramentas de DEV" : "Modo DEV: Inspecionar 385 cards"}
                          >
                            <Brain className="w-3 h-3" />
                            <span className="hidden sm:inline">DEV</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={toggleRevealAllTipItems}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold border border-zinc-200/90 dark:border-zinc-800 bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/40 transition-all flex items-center gap-1 cursor-pointer select-none shadow-2xs"
                          title={revealAllTipItems ? "Ocultar respostas para testar memória" : "Revelar todas as respostas"}
                        >
                          {revealAllTipItems ? (
                            <>
                              <EyeOff className="w-3 h-3 text-amber-500" />
                              <span className="hidden xs:inline">Ocultar</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 text-amber-500" />
                              <span className="hidden xs:inline">Revelar Tudo</span>
                            </>
                          )}
                        </button>
                        <Badge
                          variant="outline"
                          size="sm"
                          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 font-bold text-[10px] tracking-wide"
                        >
                          Dica do Dia
                        </Badge>
                      </div>
                    </div>

                    {/* Miolo Didático: Exibição Condicional de Imagem Médica + Chips Adaptativos sem Truncamento */}
                    <div className="py-1 flex-1 flex flex-col justify-center min-h-0">
                      {displayedClinicalTip.requiresImage && displayedClinicalTip.imageUrl ? (
                        <div className="flex flex-col md:flex-row items-stretch gap-3">
                          {/* Thumbnail Médico com Zoom */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveZoomImage({
                                url: displayedClinicalTip.imageUrl!,
                                caption: displayedClinicalTip.imageCaption || displayedClinicalTip.title,
                                source: displayedClinicalTip.imageSource,
                                author: displayedClinicalTip.imageAuthor,
                                license: displayedClinicalTip.imageLicense,
                                originUrl: displayedClinicalTip.imageOriginUrl,
                              });
                            }}
                            className="relative group/img shrink-0 w-full md:w-44 h-32 md:h-auto rounded-xl overflow-hidden border border-zinc-200/90 dark:border-zinc-800 bg-zinc-950 flex items-center justify-center cursor-zoom-in shadow-xs"
                            title="Clique para ampliar a imagem clínica"
                          >
                            <img
                              src={displayedClinicalTip.imageUrl}
                              alt={displayedClinicalTip.imageCaption || displayedClinicalTip.title}
                              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1 text-[11px] font-bold text-white">
                              <ZoomIn className="w-3.5 h-3.5" />
                              <span>Ampliar</span>
                            </div>
                            {displayedClinicalTip.imageModality && (
                              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/80 text-amber-400 uppercase tracking-wider backdrop-blur-xs">
                                {displayedClinicalTip.imageModality}
                              </span>
                            )}
                          </div>

                          {/* Chips Adaptativos ao lado da imagem (Sem corte de texto e com transição suave Active Recall) */}
                          <div className="flex-1 grid grid-cols-1 gap-2 min-w-0">
                            {displayedClinicalTip.chips.slice(0, 4).map((chip, idx) => {
                              const isRevealed = Boolean(revealedTipItems[idx] || revealAllTipItems);
                              return (
                                <div
                                  key={idx}
                                  onClick={(e) => toggleRevealTipItem(idx, e)}
                                  className="p-2 sm:p-2.5 rounded-xl bg-zinc-50/90 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-amber-500/40 transition-all active:scale-[0.99] flex flex-col min-w-0 cursor-pointer select-none"
                                  title="Clique para revelar / ocultar este item"
                                >
                                  <div className="flex items-center justify-between gap-2 min-w-0">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      {chip.letter ? (
                                        <span className="w-5 h-5 rounded-md font-mono text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25 flex items-center justify-center shrink-0">
                                          {chip.letter}
                                        </span>
                                      ) : (
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80 shrink-0" />
                                      )}
                                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-snug break-words">
                                        {chip.label}
                                      </span>
                                    </div>
                                    <span
                                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md transition-all shrink-0 ${
                                        isRevealed
                                          ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                                          : 'text-zinc-500 dark:text-zinc-400 bg-zinc-200/70 dark:bg-zinc-800/80 hover:bg-amber-500/15 hover:text-amber-600 dark:hover:text-amber-400'
                                      }`}
                                    >
                                      <span>{isRevealed ? 'Ocultar' : 'Revelar'}</span>
                                      {isRevealed ? (
                                        <EyeOff className="w-3 h-3 text-amber-500" />
                                      ) : (
                                        <Eye className="w-3 h-3 text-zinc-400" />
                                      )}
                                    </span>
                                  </div>

                                  <div className="active-recall-collapse" data-open={isRevealed ? 'true' : 'false'}>
                                    <div className="active-recall-inner">
                                      <div className="pt-2 active-recall-content">
                                        <span className="block w-full text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/20 px-2.5 py-1.5 rounded-lg border border-amber-500/25 leading-relaxed break-words whitespace-normal text-left">
                                          {chip.value}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        /* Quando NÃO tem imagem: Bento Grid Responsivo com Revelação Suave 60fps */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5 items-start">
                          {displayedClinicalTip.chips.slice(0, 4).map((chip, idx) => {
                            const isRevealed = Boolean(revealedTipItems[idx] || revealAllTipItems);
                            return (
                              <div
                                key={idx}
                                onClick={(e) => toggleRevealTipItem(idx, e)}
                                className="p-2.5 sm:p-3 rounded-xl bg-zinc-50/90 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-amber-500/40 transition-all active:scale-[0.99] flex flex-col min-w-0 cursor-pointer select-none"
                                title="Clique para revelar / ocultar este item"
                              >
                                <div className="flex items-center justify-between gap-2 min-w-0">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    {chip.letter ? (
                                      <span className="w-5 h-5 rounded-md font-mono text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25 flex items-center justify-center shrink-0">
                                        {chip.letter}
                                      </span>
                                    ) : (
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80 shrink-0" />
                                    )}
                                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-snug break-words">
                                      {chip.label}
                                    </span>
                                  </div>
                                  <span
                                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md transition-all shrink-0 ${
                                      isRevealed
                                        ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                                        : 'text-zinc-500 dark:text-zinc-400 bg-zinc-200/70 dark:bg-zinc-800/80 hover:bg-amber-500/15 hover:text-amber-600 dark:hover:text-amber-400'
                                    }`}
                                  >
                                    <span>{isRevealed ? 'Ocultar' : 'Revelar'}</span>
                                    {isRevealed ? (
                                      <EyeOff className="w-3 h-3 text-amber-500" />
                                    ) : (
                                      <Eye className="w-3 h-3 text-zinc-400" />
                                    )}
                                  </span>
                                </div>

                                <div className="active-recall-collapse" data-open={isRevealed ? 'true' : 'false'}>
                                  <div className="active-recall-inner">
                                    <div className="pt-2 active-recall-content">
                                      <span className="block w-full text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/20 px-2.5 py-1.5 rounded-lg border border-amber-500/25 leading-relaxed break-words whitespace-normal text-left">
                                        {chip.value}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Rodapé: Pegadinha Responsiva Mobile (sem espremer coluna central) + CTA */}
                    <div className="pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs border-t border-zinc-100 dark:border-zinc-800/80 gap-2">
                      {displayedClinicalTip.bancaTrap ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 min-w-0 flex-1">
                          <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0">
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold shrink-0 border border-rose-500/20">
                              ⚠️ Pegadinha
                            </span>
                            <span className="sm:hidden text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 shrink-0">
                              <span>Ver tudo</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed break-words font-medium">
                            {displayedClinicalTip.bancaTrap}
                          </span>
                        </div>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Ver conduta & detalhes</span>
                        </span>
                      )}
                      <span className={`${displayedClinicalTip.bancaTrap ? 'hidden sm:flex' : 'flex'} text-[11px] font-bold text-amber-600 dark:text-amber-400 items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform self-end sm:self-auto`}>
                        <span>Ver tudo</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </FigmaCardWrapper>
            );
          }
          if (cardConfig.id === 'home_raiox_areas') {
            return (
              <FigmaCardWrapper
                summary={`${totalCoreVolume} questões`}
                key={cardConfig.id}
                config={cardConfig}
                isCustomizing={isCustomizing}
                isSelected={selectedCardId === cardConfig.id}
                onSelect={(id) => setSelectedCardId(id)}
                onUpdateSettings={updateCardSettings}
                onToggleVisibility={toggleVisibility}
              >
                {/* 4. RAIO-X DAS 6 GRANDES ÁREAS (Lazy-loaded + IntersectionObserver para zero Forced Reflow inicial) */}
                <section className="w-full bento-card bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 min-h-0 h-full overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-zinc-200/60 dark:border-zinc-800/80 shadow-xs"
                        style={{
                          backgroundColor: accentConfig.bgRgba,
                          color: accentConfig.primaryHex
                        }}
                      >
                        <BarChart2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider block">
                          Raio-X das 6 Grandes Áreas
                        </h2>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Desempenho por especialidade clínica
                        </p>
                      </div>
                    </div>
                  </div>

                  <SpecialtyXRayChart
                    colSpan={cardConfig.colSpan}
                    mode={mode}
                    donutData={donutData}
                    areasResumo={areasResumo}
                    selectedAreaId={selectedAreaId}
                    selectedArea={selectedArea}
                    totalCoreVolume={totalCoreVolume}
                    specialtyPeriod={specialtyPeriod}
                    specialtyPeriodLabel={getSpecialtyPeriodLabel()}
                    specialtyEvolutionData={specialtyEvolutionData}
                    onSelectArea={(id) => setSelectedAreaId(id)}
                    onToggleArea={handlePieSectorClick}
                    onOpenPeriodDrawer={() => setIsPeriodDrawerOpen(true)}
                    onPracticeArea={handlePracticeArea}
                  />

                  {/* VISÃO EXPANDIDA ADAPTATIVA: Benchmark Comparativo das 6 Grandes Áreas */}
                  {Boolean(cardConfig.customHeight && cardConfig.customHeight >= 550) && (
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          Desempenho Detalhado por Grande Área
                        </span>
                        <span className="text-[10px] text-zinc-400">Taxa de Acertos vs Meta (75%)</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 text-[10px]">
                        {[
                          { name: 'Clínica', color: '#3b82f6', acertos: '72%', status: 'Forte' },
                          { name: 'Cirurgia', color: '#ef4444', acertos: '58%', status: 'Atenção' },
                          { name: 'Ginecologia', color: '#ec4899', acertos: '65%', status: 'Estável' },
                          { name: 'Obstetrícia', color: '#a855f7', acertos: '70%', status: 'Forte' },
                          { name: 'Pediatria', color: '#eab308', acertos: '64%', status: 'Estável' },
                          { name: 'Preventiva', color: '#10b981', acertos: '79%', status: 'Excelente' },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-zinc-700 dark:text-zinc-300">{item.name}</span>
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                            </div>
                            <div className="flex items-baseline justify-between mt-1">
                              <span className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs">
                                {item.acertos}
                              </span>
                              <span className={`text-[9px] font-medium ${item.status === 'Atenção' ? 'text-rose-500' : 'text-zinc-400'}`}>
                                {item.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              </FigmaCardWrapper>
            );
          }
          if (cardConfig.id === 'home_retomada') {
            return (
              <FigmaCardWrapper
                summary={`Continuar · ${studyResumeTab}`}
                key={cardConfig.id}
                config={cardConfig}
                isCustomizing={isCustomizing}
                isSelected={selectedCardId === cardConfig.id}
                onSelect={(id) => setSelectedCardId(id)}
                onUpdateSettings={updateCardSettings}
                onToggleVisibility={toggleVisibility}
              >
                {/* 3. RETOMADA DE ESTUDOS INTELIGENTE - SELETOR COM SLIDING PILL & SEM CORTE NO MOBILE */}
                <section className="w-full min-h-0 h-full flex flex-col justify-between space-y-3">
                  <div className="flex items-center min-w-0 max-w-full">
                    <div
                      role="tablist"
                      aria-label="Modo de retomada de estudos"
                      className="relative grid grid-cols-3 w-full sm:w-auto p-1 bg-zinc-100/90 dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800/90 rounded-xl items-center shadow-xs"
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none absolute inset-y-1 left-1 w-[calc((100%-8px)/3)] rounded-lg shadow-xs transition-transform duration-220 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          studyResumeTab === 'cadernos'
                            ? 'translate-x-0'
                            : studyResumeTab === 'provas'
                              ? 'translate-x-full'
                              : 'translate-x-[200%]'
                        }`}
                        style={{ backgroundColor: accentConfig.primaryHex }}
                      />
                      <button
                        type="button"
                        role="tab"
                        aria-selected={studyResumeTab === 'cadernos'}
                        onClick={() => setStudyResumeTab('cadernos')}
                        className={`relative z-10 rounded-lg px-2.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                          studyResumeTab === 'cadernos'
                            ? 'text-[var(--primary-contrast,#ffffff)]'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                        <span>Cadernos</span>
                      </button>

                      <button
                        type="button"
                        role="tab"
                        aria-selected={studyResumeTab === 'provas'}
                        onClick={() => setStudyResumeTab('provas')}
                        className={`relative z-10 rounded-lg px-2.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                          studyResumeTab === 'provas'
                            ? 'text-[var(--primary-contrast,#ffffff)]'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="sm:hidden">Provas</span>
                        <span className="hidden sm:inline">Provas na Íntegra</span>
                      </button>

                      <button
                        type="button"
                        role="tab"
                        aria-selected={studyResumeTab === 'simulados'}
                        onClick={() => setStudyResumeTab('simulados')}
                        className={`relative z-10 rounded-lg px-2.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                          studyResumeTab === 'simulados'
                            ? 'text-[var(--primary-contrast,#ffffff)]'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        <Target className="w-3.5 h-3.5 shrink-0" />
                        <span className="sm:hidden">Simulados</span>
                        <span className="hidden sm:inline">Simulados Oficiais</span>
                      </button>
                    </div>
                  </div>

                  {/* PAINEL 1: CADERNOS DE QUESTÕES */}
                  {studyResumeTab === 'cadernos' && (
                    <div className="bento-card bg-[var(--bg-card,#ffffff)] dark:bg-[var(--card,#121215)] border border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 animate-panel-swap">
                      {/* Cabeçalho do Card */}
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)]/80">
                        <div className="flex items-center gap-2">
                          <Badge variant="theme" size="sm">
                            Caderno Ativo
                          </Badge>
                          {(activeCaderno || recentList || allLists[0]) && (
                            <span
                              className="text-[11px] font-bold flex items-center gap-1"
                              style={{ color: accentConfig.accuracyAccent.hex }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full animate-pulse"
                                style={{ backgroundColor: accentConfig.accuracyAccent.hex }}
                              />
                              Em andamento
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveCentralDrawer('cadernos');
                            setDrawerSearch('');
                          }}
                          className="text-xs font-bold hover:underline cursor-pointer flex items-center gap-1 transition-colors"
                          style={{ color: accentConfig.primaryHex }}
                        >
                          <span>Histórico de Cadernos</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Conteúdo Principal do Caderno Ativo */}
                      {activeCaderno || recentList || allLists[0] ? (
                        (() => {
                          const item = activeCaderno || recentList || allLists[0];
                          return (
                            <div className="space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="space-y-1">
                                  <h3 className="font-heading text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100" title={item.title}>
                                    {item.title}
                                  </h3>
                                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                                    <span>{item.completedQuestions} de {item.totalQuestions} questões resolvidas</span>
                                    {item.lastQuestionIndex !== undefined && item.lastQuestionIndex > 0 && (
                                      <>
                                        <span>•</span>
                                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                                          Parou na questão {item.lastQuestionIndex + 1}
                                        </span>
                                      </>
                                    )}
                                    {item.lastStudiedAt && (
                                      <>
                                        <span>•</span>
                                        <span>Último estudo: {item.lastStudiedAt}</span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <div className="text-xl sm:text-2xl font-black font-sans text-zinc-900 dark:text-zinc-100">
                                      {item.progressPercentage}%
                                    </div>
                                    <div className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500">
                                      Concluído
                                    </div>
                                  </div>

                                  <Button
                                    variant="primary"
                                    size="md"
                                    onClick={() => onContinueList(item)}
                                    leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                                  >
                                    {item.lastQuestionIndex !== undefined && item.lastQuestionIndex > 0
                                      ? `Continuar (Q${item.lastQuestionIndex + 1})`
                                      : 'Continuar'}
                                  </Button>
                                </div>
                              </div>

                              {/* Barra de Progresso Larga */}
                              <ProgressBar
                                value={item.progressPercentage}
                                max={100}
                                variant="primary"
                                size="sm"
                              />
                            </div>
                          );
                        })()
                      ) : (
                        <div className="py-6 text-center space-y-2">
                          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Nenhum caderno em andamento</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                            Crie cadernos personalizados filtrando por especialidades, temas e bancas para praticar questões direcionadas.
                          </p>
                          <div className="pt-2">
                            <Button
                              variant="primary"
                              size="md"
                              onClick={() => onNavigate('listas')}
                            >
                              + Criar Primeiro Caderno
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PAINEL 2: PROVAS NA ÍNTEGRA OFICIAIS */}
                  {studyResumeTab === 'provas' && (
                    <div className="bento-card bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 animate-panel-swap">
                      {/* Cabeçalho do Card */}
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border"
                            style={{
                              backgroundColor: accentConfig.bgRgba,
                              borderColor: accentConfig.borderRgba,
                              color: accentConfig.primaryHex
                            }}
                          >
                            Prova na Íntegra Oficial
                          </span>
                          {currentOfficialExam?.status === 'em_andamento' && (
                            <span
                              className="flex items-center gap-1 text-[11px] font-bold"
                              style={{ color: accentConfig.energyAccent.hex }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full animate-pulse"
                                style={{ backgroundColor: accentConfig.energyAccent.hex }}
                              />
                              Em andamento
                            </span>
                          )}
                          {currentOfficialExam?.status === 'concluida' && (
                            <span
                              className="text-[11px] font-bold"
                              style={{ color: accentConfig.accuracyAccent.hex }}
                            >
                              Concluída
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveCentralDrawer('provas');
                            setDrawerSearch('');
                          }}
                          className="text-xs font-bold hover:underline cursor-pointer flex items-center gap-1 transition-colors"
                          style={{ color: accentConfig.primaryHex }}
                        >
                          <span>Histórico de Provas</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Conteúdo Principal da Prova Mais Recente */}
                      {currentOfficialExam ? (
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-heading text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                  {currentOfficialExam.institution} {currentOfficialExam.year}
                                </h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                  {currentOfficialExam.modality || 'Acesso Direto'}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {currentOfficialExam.institutionName || currentOfficialExam.institution} • {currentOfficialExam.answeredCount || 0} de {currentOfficialExam.totalQuestions || 100} questões resolvidas
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-xl sm:text-2xl font-black font-sans text-zinc-900 dark:text-zinc-100">
                                  {Math.round(((currentOfficialExam.answeredCount || 0) / (currentOfficialExam.totalQuestions || 100)) * 100)}%
                                </div>
                                <div className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500">
                                  Progresso
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleLaunchOfficialExam(currentOfficialExam.institution, currentOfficialExam.year, currentOfficialExam.totalQuestions)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm hover:opacity-95 active:scale-98 shrink-0"
                                style={{
                                  backgroundColor: accentConfig.primaryHex,
                                  boxShadow: `0 4px 12px ${accentConfig.bgRgba}`
                                }}
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>
                                  {currentOfficialExam?.status === 'em_andamento'
                                    ? 'Continuar Prova'
                                    : currentOfficialExam?.status === 'concluida'
                                      ? 'Refazer Prova'
                                      : 'Iniciar Prova'}
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Barra de Progresso Larga */}
                          <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-200/60 dark:border-zinc-800">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, Math.round(((currentOfficialExam.answeredCount || 0) / (currentOfficialExam.totalQuestions || 100)) * 100))}%`,
                                backgroundColor: accentConfig.primaryHex
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center space-y-2">
                          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Nenhuma prova oficial recente</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                            Pratique com as provas oficiais na íntegra de ENARE, SUS-SP, AMRIGS, PSU-MG e USP.
                          </p>
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => handleLaunchOfficialExam('ENARE', 2025, 100)}
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:opacity-95 active:scale-98"
                              style={{ backgroundColor: accentConfig.primaryHex }}
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Iniciar ENARE 2025 na Íntegra</span>
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* PAINEL 3: SIMULADOS OFICIAIS */}
                  {studyResumeTab === 'simulados' && (
                    <div className="bento-card bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 animate-panel-swap">
                      {/* Cabeçalho do Card */}
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border"
                            style={{
                              backgroundColor: accentConfig.bgRgba,
                              borderColor: accentConfig.borderRgba,
                              color: accentConfig.primaryHex
                            }}
                          >
                            Simulado Oficial
                          </span>
                          {currentMockExam?.status === 'em_andamento' && (
                            <span
                              className="flex items-center gap-1 text-[11px] font-bold"
                              style={{ color: accentConfig.energyAccent.hex }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full animate-pulse"
                                style={{ backgroundColor: accentConfig.energyAccent.hex }}
                              />
                              Em andamento
                            </span>
                          )}
                          {currentMockExam?.status === 'concluida' && (
                            <span
                              className="text-[11px] font-bold"
                              style={{ color: accentConfig.accuracyAccent.hex }}
                            >
                              Concluído
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveCentralDrawer('simulados');
                            setDrawerSearch('');
                          }}
                          className="text-xs font-bold hover:underline cursor-pointer flex items-center gap-1 transition-colors"
                          style={{ color: accentConfig.primaryHex }}
                        >
                          <span>Histórico de Simulados</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Conteúdo Principal do Simulado Mais Recente */}
                      {currentMockExam ? (
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="space-y-1">
                              <h3 className="font-heading text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate" title={currentMockExam.title}>
                                {currentMockExam.title}
                              </h3>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {currentMockExam.banca} • {currentMockExam.duration} • {currentMockExam.answeredCount || 0} de {currentMockExam.totalQuestions || 100} resolvidas
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-xl sm:text-2xl font-black font-sans text-zinc-900 dark:text-zinc-100">
                                  {Math.round(((currentMockExam.answeredCount || 0) / (currentMockExam.totalQuestions || 100)) * 100)}%
                                </div>
                                <div className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500">
                                  Progresso
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleLaunchMockExam(currentMockExam)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm hover:opacity-95 active:scale-98 shrink-0"
                                style={{
                                  backgroundColor: accentConfig.primaryHex,
                                  boxShadow: `0 4px 12px ${accentConfig.bgRgba}`
                                }}
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>
                                  {currentMockExam?.status === 'em_andamento'
                                    ? 'Continuar Simulado'
                                    : currentMockExam?.status === 'concluida'
                                      ? 'Refazer Simulado'
                                      : 'Iniciar Simulado'}
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Barra de Progresso Larga */}
                          <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-200/60 dark:border-zinc-800">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, Math.round(((currentMockExam.answeredCount || 0) / (currentMockExam.totalQuestions || 100)) * 100))}%`,
                                backgroundColor: accentConfig.primaryHex
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center space-y-2">
                          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Simulado Nacional ENARE 2025</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                            Simulado cronometrado com ranking e TRI em tempo real.
                          </p>
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => onNavigate('simulados')}
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:opacity-95 active:scale-98"
                              style={{ backgroundColor: accentConfig.primaryHex }}
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Acessar Simulados Oficiais</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </FigmaCardWrapper>
            );
          }
          return null;
        })}
      </CardCanvas>

      {/* =========================================================================
          DRAWER / MODAL CENTRAL DEDICADO COM HISTÓRICO EXCLUSIVO ("UM PARA CADA")
      ========================================================================== */}
      {activeCentralDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          {/* Backdrop Escurecido com Fechamento ao Clicar Fora */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setActiveCentralDrawer(null)}
          />

          {/* Card Modal Centralizado */}
          <div className={`relative w-full ${activeCentralDrawer === 'agenda_detalhada' ? 'max-w-3xl xl:max-w-4xl max-h-[90vh]' : 'max-w-2xl max-h-[85vh]'} bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col z-10 animate-in zoom-in-95 duration-200 overflow-hidden`}>

            {/* 1. CABEÇALHO DO DRAWER CENTRAL */}
            <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/60 dark:bg-zinc-900/40">
              <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs shrink-0"
                  style={{
                    backgroundColor: accentConfig.bgRgba,
                    color: accentConfig.primaryHex
                  }}
                >
                  {activeCentralDrawer === 'cadernos' && <FolderOpen className="w-5 h-5" />}
                  {activeCentralDrawer === 'provas' && <FileCheck2 className="w-5 h-5" />}
                  {activeCentralDrawer === 'simulados' && <Target className="w-5 h-5" />}
                  {activeCentralDrawer === 'caderno_erros' && <AlertOctagon className="w-5 h-5 text-rose-500" />}
                  {activeCentralDrawer === 'flashcards' && <Brain className="w-5 h-5" />}
                  {activeCentralDrawer === 'treinar_recomendacao' && <Play className="w-5 h-5" />}
                  {(activeCentralDrawer === 'mnemonico_detalhado' || activeCentralDrawer === 'dica_dia_detalhada') && <Lightbulb className="w-5 h-5 text-amber-500" />}
                  {activeCentralDrawer === 'agenda_detalhada' && <CalendarDays className="w-5 h-5 text-blue-500" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    {activeCentralDrawer === 'cadernos' && 'Histórico de Cadernos de Questões'}
                    {activeCentralDrawer === 'provas' && 'Histórico e Catálogo de Provas Oficiais'}
                    {activeCentralDrawer === 'simulados' && 'Histórico de Simulados Oficiais'}
                    {activeCentralDrawer === 'caderno_erros' && 'Caderno de Erros • Foco de Reteste'}
                    {activeCentralDrawer === 'flashcards' && 'Flashcards Mnemônicos • Revisão do Dia'}
                    {activeCentralDrawer === 'treinar_recomendacao' && `Centro de Treino • ${recommendedArea.label}`}
                    {activeCentralDrawer === 'dica_dia_detalhada' && (
                      <span className="break-words line-clamp-2 leading-snug">
                        {displayedClinicalTip.fullTitle || displayedClinicalTip.title}
                      </span>
                    )}
                    {activeCentralDrawer === 'mnemonico_detalhado' && (activeDetailedMnemonic.theme || 'Mnemônico Clínico')}
                    {activeCentralDrawer === 'agenda_detalhada' && (
                      <>
                        <span>Agenda e Cronograma de Estudos</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hidden sm:inline-block">
                          Cronograma do Dia
                        </span>
                      </>
                    )}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {activeCentralDrawer === 'cadernos' && 'Acesse todos os seus cadernos personalizados e continue seus estudos'}
                    {activeCentralDrawer === 'provas' && 'Provas oficiais na íntegra de Residência Médica e Revalida'}
                    {activeCentralDrawer === 'simulados' && 'Simulados cronometrados com pontuação TRI e percentil'}
                    {activeCentralDrawer === 'caderno_erros' && 'Diagnóstico metacognitivo e questões erradas pendentes de reteste'}
                    {activeCentralDrawer === 'flashcards' && 'Fixação rápida de alto rendimento com algoritmo espaçado FSRS'}
                    {activeCentralDrawer === 'treinar_recomendacao' && 'Subtemas prioritários, radar da banca e modos de execução'}
                    {activeCentralDrawer === 'dica_dia_detalhada' && `${displayedClinicalTip.specialty} • ${displayedClinicalTip.tema} • Alta Recorrência`}
                    {activeCentralDrawer === 'mnemonico_detalhado' && 'Critérios objetivos de decomposição e armadilhas de prova'}
                    {activeCentralDrawer === 'agenda_detalhada' && 'Planejamento dinâmico integrado a plantões hospitalares e blocos de estudo'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeCentralDrawer === 'agenda_detalhada' && isGoogleCalendarConnected && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Google Agenda Ativa</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setActiveCentralDrawer(null)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 cursor-pointer transition-colors"
                  title="Fechar (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. BARRA DE BUSCA RÁPIDA DEDICADA (Oculta em Treino, Mnemônico, Dica e Agenda) */}
            {activeCentralDrawer !== 'treinar_recomendacao' &&
              activeCentralDrawer !== 'mnemonico_detalhado' &&
              activeCentralDrawer !== 'dica_dia_detalhada' &&
              activeCentralDrawer !== 'agenda_detalhada' && (
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 space-y-3 shrink-0 bg-white dark:bg-[#121215]">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={drawerSearch}
                      onChange={(e) => setDrawerSearch(e.target.value)}
                      placeholder={
                        activeCentralDrawer === 'cadernos'
                          ? 'Buscar caderno por nome...'
                          : activeCentralDrawer === 'provas'
                            ? 'Buscar por banca, instituição, UF ou ano...'
                            : activeCentralDrawer === 'simulados'
                              ? 'Buscar simulado...'
                              : activeCentralDrawer === 'caderno_erros'
                                ? 'Buscar erro por tema, foco, banca ou motivo...'
                                : 'Buscar flashcards do dia por conceito ou tema...'
                      }
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition-all"
                    />
                    {drawerSearch && (
                      <button
                        type="button"
                        onClick={() => setDrawerSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Filtros de Modalidade específicos para Provas */}
                  {activeCentralDrawer === 'provas' && (
                    <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5">
                      {[
                        { id: 'todas', label: 'Todas as Provas' },
                        { id: 'acesso_direto', label: 'Acesso Direto' },
                        { id: 'r_plus', label: 'R+' },
                        { id: 'revalida', label: 'Revalida' }
                      ].map((mod) => {
                        const isModActive = drawerModality === mod.id;
                        return (
                          <button
                            key={mod.id}
                            type="button"
                            onClick={() => setDrawerModality(mod.id as OfficialExamModalityKey)}
                            className={`text-[11px] px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${isModActive
                              ? 'text-white shadow-xs'
                              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
                              }`}
                            style={{
                              backgroundColor: isModActive ? accentConfig.primaryHex : undefined
                            }}
                          >
                            {mod.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Filtros de Especialidade específicos para Caderno de Erros */}
                  {activeCentralDrawer === 'caderno_erros' && (
                    <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5">
                      {[
                        'Todas',
                        'Clínica Médica',
                        'Cirurgia Geral',
                        'Gineco & Obstetrícia',
                        'Pediatria',
                        'Medicina Preventiva'
                      ].map((spec) => {
                        const isSpecActive = drawerErrorSpecialty === spec;
                        return (
                          <button
                            key={spec}
                            type="button"
                            onClick={() => setDrawerErrorSpecialty(spec)}
                            className={`text-[11px] px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${isSpecActive
                              ? 'text-white shadow-xs'
                              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
                              }`}
                            style={{
                              backgroundColor: isSpecActive ? accentConfig.primaryHex : undefined
                            }}
                          >
                            {spec}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Filtros de Especialidade específicos para Flashcards */}
                  {activeCentralDrawer === 'flashcards' && (
                    <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5">
                      {[
                        'Todas',
                        'Clínica Médica',
                        'Cirurgia Geral',
                        'Gineco & Obstetrícia',
                        'Pediatria',
                        'Medicina Preventiva'
                      ].map((spec) => {
                        const isSpecActive = drawerFlashcardSpecialty === spec;
                        return (
                          <button
                            key={spec}
                            type="button"
                            onClick={() => setDrawerFlashcardSpecialty(spec)}
                            className={`text-[11px] px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${isSpecActive
                              ? 'text-white shadow-xs'
                              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
                              }`}
                            style={{
                              backgroundColor: isSpecActive ? accentConfig.primaryHex : undefined
                            }}
                          >
                            {spec}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            {/* 3. CONTEÚDO COM SCROLL SUAVE DEDICADO PARA CADA TIPO */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar">

              {/* === CASO 1: DRAWER CENTRAL DE CADERNOS === */}
              {activeCentralDrawer === 'cadernos' && (
                (() => {
                  const filteredCadernos = allLists.filter((l) =>
                    !drawerSearch || l.title.toLowerCase().includes(drawerSearch.toLowerCase())
                  );
                  return (
                    <div className="space-y-3">
                      {filteredCadernos.length > 0 ? (
                        <>
                          {filteredCadernos.map((item) => (
                            <div
                              key={item.id}
                              className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-[#121620] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-2xs"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-heading font-bold text-sm text-zinc-900 dark:text-white truncate">
                                    {item.title}
                                  </h4>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.progressPercentage >= 100
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                      }`}
                                  >
                                    {item.progressPercentage >= 100 ? 'Concluído' : 'Em andamento'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                  <span>{item.completedQuestions}/{item.totalQuestions} questões</span>
                                  <span>•</span>
                                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">{item.progressPercentage}%</span>
                                  {item.lastStudiedAt && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate">Último estudo: {item.lastStudiedAt}</span>
                                    </>
                                  )}
                                </div>
                                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden mt-2">
                                  <div
                                    className="h-1.5 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${item.progressPercentage}%`,
                                      backgroundColor: accentConfig.primaryHex
                                    }}
                                  />
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCentralDrawer(null);
                                  onContinueList(item);
                                }}
                                className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:opacity-95 active:scale-98 self-end sm:self-auto"
                                style={{ backgroundColor: accentConfig.primaryHex }}
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>{item.progressPercentage >= 100 ? 'Revisar' : 'Continuar'}</span>
                              </button>
                            </div>
                          ))}

                          <div className="pt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveCentralDrawer(null);
                                onNavigate('listas');
                              }}
                              className="text-xs font-bold hover:underline cursor-pointer flex items-center gap-1 transition-colors"
                              style={{ color: accentConfig.primaryHex }}
                            >
                              <span>Gerenciar todos os cadernos e pastas</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="py-12 text-center text-xs text-zinc-400 dark:text-zinc-500 space-y-3">
                          <p>
                            {allLists.length === 0
                              ? 'Você ainda não possui cadernos criados.'
                              : 'Nenhum caderno encontrado com este nome.'}
                          </p>
                          {allLists.length === 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveCentralDrawer(null);
                                onNavigate('listas');
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:opacity-95 active:scale-98"
                              style={{ backgroundColor: accentConfig.primaryHex }}
                            >
                              <span>+ Criar Primeiro Caderno</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()
              )}

              {/* === CASO 2: DRAWER CENTRAL DE PROVAS === */}
              {activeCentralDrawer === 'provas' && (
                <div className="space-y-4">
                  {/* Seção 1: Provas do Histórico do Aluno */}
                  {officialExamsHistory.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1">
                        Minhas Provas no Histórico ({officialExamsHistory.length})
                      </div>
                      <div className="space-y-2">
                        {officialExamsHistory
                          .filter((e) => !drawerSearch || e.institution.toLowerCase().includes(drawerSearch.toLowerCase()) || String(e.year).includes(drawerSearch))
                          .map((exam) => (
                            <div
                              key={exam.id}
                              className="p-3.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-[#121620] flex items-center justify-between gap-3 shadow-2xs"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-heading font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
                                    {exam.institution} {exam.year}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${exam.status === 'concluida'
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                      }`}
                                  >
                                    {exam.status === 'concluida' ? 'Concluída' : 'Em andamento'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                  {exam.answeredCount}/{exam.totalQuestions} questões • {Math.round(((exam.answeredCount || 0) / (exam.totalQuestions || 100)) * 100)}%
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCentralDrawer(null);
                                  handleLaunchOfficialExam(exam.institution, exam.year, exam.totalQuestions);
                                }}
                                className="shrink-0 px-3.5 py-1.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:opacity-95"
                                style={{ backgroundColor: accentConfig.primaryHex }}
                              >
                                {exam.status === 'em_andamento' ? 'Continuar' : 'Refazer'}
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Seção 2: Catálogo de Todas as Provas Oficiais */}
                  <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1">
                      Catálogo Completo de Provas
                    </div>
                    {drawerSearchResults.length > 0 ? (
                      drawerSearchResults.map((item, idx) => {
                        const annCount = item.exam.annulledCount || 0;
                        const sumCount = (item.exam.questionCount || 0) + annCount;
                        const nominalQ = sumCount === 100 ? 100 : (item.exam.questionCount || 100);
                        return (
                          <div
                            key={`${item.institution.id}-${item.exam.year}-${idx}`}
                            className="p-3.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-[#121620] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-heading font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
                                  {item.institution.shortName} {item.exam.year}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                  {nominalQ}q
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                                {item.institution.name}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveCentralDrawer(null);
                                handleLaunchOfficialExam(item.institution.shortName, item.exam.year, nominalQ);
                              }}
                              className="shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:opacity-95"
                              style={{ backgroundColor: accentConfig.primaryHex }}
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Iniciar</span>
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
                        Nenhuma prova encontrada com este filtro.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* === CASO 3: DRAWER CENTRAL DE SIMULADOS === */}
              {activeCentralDrawer === 'simulados' && (
                (() => {
                  const filteredMocks = mockExamsHistory.filter((m) =>
                    !drawerSearch || m.title.toLowerCase().includes(drawerSearch.toLowerCase()) || m.banca.toLowerCase().includes(drawerSearch.toLowerCase())
                  );
                  return filteredMocks.length > 0 ? (
                    filteredMocks.map((mock) => (
                      <div
                        key={mock.id}
                        className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-[#121620] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading font-bold text-xs sm:text-sm text-zinc-900 dark:text-white truncate">
                              {mock.title}
                            </h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mock.status === 'concluida'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                }`}
                            >
                              {mock.status === 'concluida' ? 'Concluído' : 'Em andamento'}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            {mock.banca} • {mock.duration} • {mock.answeredCount || 0} de {mock.totalQuestions} questões resolvidas
                          </p>
                          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden mt-2">
                            <div
                              className="h-1.5 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(100, Math.round(((mock.answeredCount || 0) / (mock.totalQuestions || 100)) * 100))}%`,
                                backgroundColor: accentConfig.primaryHex
                              }}
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveCentralDrawer(null);
                            handleLaunchMockExam(mock);
                          }}
                          className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:opacity-95 active:scale-98 self-end sm:self-auto"
                          style={{ backgroundColor: accentConfig.primaryHex }}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{mock.status === 'em_andamento' ? 'Continuar' : 'Iniciar'}</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-xs text-zinc-400 dark:text-zinc-500">
                      Nenhum simulado encontrado com este termo.
                    </div>
                  );
                })()
              )}

              {/* === CASO 4: DRAWER CENTRAL DE CADERNO DE ERROS === */}
              {activeCentralDrawer === 'caderno_erros' && (
                (() => {
                  const query = drawerSearch.toLowerCase().trim();
                  const filteredErrors = pendingErrorsList.filter((item) => {
                    // Filtro de Especialidade
                    if (drawerErrorSpecialty !== 'Todas') {
                      const spec = (item.specialty || '').toLowerCase();
                      if (drawerErrorSpecialty === 'Clínica Médica' && !spec.includes('clínica') && !spec.includes('clinica')) return false;
                      if (drawerErrorSpecialty === 'Cirurgia Geral' && !spec.includes('cirurg')) return false;
                      if (drawerErrorSpecialty === 'Gineco & Obstetrícia' && !spec.includes('ginec') && !spec.includes('obstet')) return false;
                      if (drawerErrorSpecialty === 'Pediatria' && !spec.includes('pediatr')) return false;
                      if (drawerErrorSpecialty === 'Medicina Preventiva' && !spec.includes('prevent') && !spec.includes('coletiva')) return false;
                    }
                    // Filtro de Busca
                    if (!query) return true;
                    return (
                      (item.tema && item.tema.toLowerCase().includes(query)) ||
                      (item.foco && item.foco.toLowerCase().includes(query)) ||
                      (item.banca && item.banca.toLowerCase().includes(query)) ||
                      (item.studentNotes && item.studentNotes.toLowerCase().includes(query)) ||
                      (item.code && item.code.toLowerCase().includes(query))
                    );
                  });

                  return (
                    <div className="space-y-4">
                      {/* Mini-Cockpit de Metacognição (KPIs rápidos) */}
                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">
                            Erros Pendentes
                          </span>
                          <span className="text-xl sm:text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
                            {pendingErrorsList.length}
                          </span>
                          <span className="text-[10px] text-rose-500/80">
                            aguardando reteste
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                            Área Mais Crítica
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-1 truncate">
                            {mostCriticalArea ? mostCriticalArea.name : 'Nenhuma pendência'}
                          </span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                            {mostCriticalArea ? `${mostCriticalArea.count} erros registrados` : 'desempenho 100%'}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                            Ação Imediata
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            Reteste Focado
                          </span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                            ciclo anti-esquecimento
                          </span>
                        </div>
                      </div>

                      {/* Lista de Questões com Erros */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-semibold px-1">
                          <span>Questões para Focar no Momento ({filteredErrors.length})</span>
                          {pendingErrorsList.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveCentralDrawer(null);
                                onNavigate('caderno_erros');
                              }}
                              className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                            >
                              Abrir Caderno Completo →
                            </button>
                          )}
                        </div>

                        {filteredErrors.length > 0 ? (
                          filteredErrors.map((errItem) => (
                            <div
                              key={errItem.questionId}
                              className="p-3.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-[#121620] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-2xs"
                            >
                              <div className="min-w-0 flex-1 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {errItem.specialty && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                      {errItem.specialty}
                                    </span>
                                  )}
                                  {errItem.banca && (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                      {errItem.banca} {errItem.year ? `• ${errItem.year}` : ''}
                                    </span>
                                  )}
                                  {errItem.difficulty && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400">
                                      {errItem.difficulty}
                                    </span>
                                  )}
                                  {errItem.errorReason && (
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                      {errItem.errorReason}
                                    </span>
                                  )}
                                </div>

                                <div className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 line-clamp-2">
                                  {errItem.tema ? `${errItem.tema}${errItem.foco ? ` • ${errItem.foco}` : ''}` : `Questão #${errItem.code || errItem.questionId.slice(0, 8)}`}
                                </div>

                                {errItem.studentNotes && (
                                  <p className="text-[11px] text-amber-700 dark:text-amber-400/90 italic bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                                    Nota: &ldquo;{errItem.studentNotes}&rdquo;
                                  </p>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCentralDrawer(null);
                                  onNavigate('caderno_erros');
                                }}
                                className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:opacity-95 active:scale-98 self-end sm:self-auto bg-rose-500"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Retestar</span>
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="py-10 text-center space-y-2">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                              {pendingErrorsList.length === 0
                                ? 'Nenhum erro pendente! Sua retenção está excelente.'
                                : 'Nenhum erro encontrado com os filtros selecionados.'}
                            </p>
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                              Continue resolvendo questões para calibrar suas lacunas de aprendizado.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Botão de Rodapé Fixo do Drawer */}
                      {pendingErrorsList.length > 0 && (
                        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                            {pendingErrorsList.length} questões aguardando reteste no ciclo de metacognição
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveCentralDrawer(null);
                              onNavigate('caderno_erros');
                            }}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:opacity-95 flex items-center justify-center gap-2 bg-rose-500"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Iniciar Reteste Completo</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}

              {/* === CASO 6: DRAWER CENTRAL DE TREINO DA RECOMENDAÇÃO === */}
              {activeCentralDrawer === 'treinar_recomendacao' && (
                <div className="p-4 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                  {/* Radar da Banca Alvo */}
                  <div className="p-4 rounded-2xl border border-blue-500/25 bg-blue-500/5 space-y-2">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
                      <Target className="w-4 h-4" />
                      <span>Radar da Banca • {targetExamName || 'ENARE 2026'}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      <strong>{recommendedArea.label}</strong> responde por aproximadamente <strong>~20% da prova oficial</strong>.
                      Recuperar 5 acertos nesta especialidade eleva sua posição estimada em até <strong>+8 percentis</strong>.
                    </p>
                    <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium">
                        Alta Relevância TRI
                      </span>
                      <span>• Incidência confirmada nos últimos 4 anos da banca</span>
                    </div>
                  </div>

                  {/* Subtemas Críticos de Alavancagem */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-heading text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          Subtemas Prioritários de Alavancagem
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Assuntos com menor rendimento registrado. Treinar diretamente a sua maior dor:
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-rose-500">
                        Prioridade Alta
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {criticalSubtopics.map((sub, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setActiveCentralDrawer(null);
                            handlePracticeArea(recommendedArea.filterName);
                          }}
                          className="p-3 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 hover:border-zinc-400 dark:hover:border-zinc-700 cursor-pointer transition-all flex flex-col justify-between space-y-2 group"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-amber-500 transition-colors">
                              {sub.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
                              {sub.accuracy}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-zinc-400">
                            <span>{sub.total || 10} questões no banco</span>
                            <span className="text-amber-500 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                              Treinar <ChevronRight className="w-3 h-3 ml-0.5" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ações Diretas de Execução */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Selecione o formato de treino que melhor se adequa ao seu tempo:
                    </div>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCentralDrawer(null);
                          if (onStartSimuladoExpress) {
                            onStartSimuladoExpress(10);
                          } else {
                            handlePracticeArea(recommendedArea.filterName);
                          }
                        }}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-amber-500/40 hover:text-amber-500 transition-all cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Blitz TRI (10Q)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveCentralDrawer(null);
                          handlePracticeArea(recommendedArea.filterName);
                        }}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:opacity-95"
                        style={{ backgroundColor: accentConfig.primaryHex }}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Treinar {recommendedArea.label}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* === CASO 7.0: DRAWER CENTRAL DE DICA DO DIA DETALHADA === */}
              {activeCentralDrawer === 'dica_dia_detalhada' && (
                <div className="p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                  {/* Barra de Status e Ação Rápida */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-zinc-100 dark:border-zinc-800/80">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25 font-bold flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {displayedClinicalTip.categoryLabel || 'Alta Recorrência'}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium hidden xs:inline-block">
                        {displayedClinicalTip.specialty} • {displayedClinicalTip.tema}{displayedClinicalTip.foco ? ` • ${displayedClinicalTip.foco}` : ''}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={toggleSaveTip}
                      className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 cursor-pointer transition-all"
                    >
                      {savedTipState ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Salvo no FSRS</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Salvar nos Flashcards</span>
                        </>
                      )}
                    </button>
                  </div>

                    {/* 0. Vitrine de Imagem Médica (se aplicável ao tema) */}
                    {displayedClinicalTip.requiresImage && displayedClinicalTip.imageUrl && (
                      <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 p-3.5 space-y-2.5 overflow-hidden">
                        <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          <span className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200">
                            <Eye className="w-3.5 h-3.5 text-amber-500" />
                            <span>Exame de Imagem & Achados Patognomônicos</span>
                          </span>
                          {displayedClinicalTip.imageModality && (
                            <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/25">
                              {displayedClinicalTip.imageModality.toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div
                          onClick={() => setActiveZoomImage({
                            url: displayedClinicalTip.imageUrl!,
                            caption: displayedClinicalTip.imageCaption || displayedClinicalTip.title,
                            source: displayedClinicalTip.imageSource,
                            author: displayedClinicalTip.imageAuthor,
                            license: displayedClinicalTip.imageLicense,
                            originUrl: displayedClinicalTip.imageOriginUrl,
                          })}
                          className="relative max-h-72 w-full rounded-xl overflow-hidden bg-black/60 cursor-zoom-in group/img flex items-center justify-center border border-zinc-200 dark:border-zinc-800"
                          title="Clique para ampliar o exame em tela cheia"
                        >
                          <img
                            src={displayedClinicalTip.imageUrl}
                            alt={displayedClinicalTip.imageCaption || displayedClinicalTip.title}
                            className="max-h-72 w-auto object-contain group-hover/img:scale-102 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span className="bg-black/85 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 shadow-xl">
                              <ZoomIn className="w-3.5 h-3.5" />
                              Clique para ampliar
                            </span>
                          </div>
                        </div>

                        {displayedClinicalTip.imageCaption && (
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                            {displayedClinicalTip.imageCaption}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 flex-wrap gap-2 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                          <span>Fonte: <strong className="text-zinc-700 dark:text-zinc-300">{displayedClinicalTip.imageSource || 'Domínio Público / CC'}</strong></span>
                          {displayedClinicalTip.imageLicense && (
                            <span className="px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800/80 font-mono text-[9px] text-zinc-700 dark:text-zinc-300">
                              Licença: {displayedClinicalTip.imageLicense}
                            </span>
                          )}
                          {displayedClinicalTip.imageAuthor && (
                            <span>Autor: {displayedClinicalTip.imageAuthor}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 1. Regra de Ouro da Banca (Tirada da frente do card e detalhada aqui) */}
                    <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Regra de Ouro da Decisão Clínica
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-relaxed">
                        {displayedClinicalTip.rule}
                      </p>
                    </div>

                    {/* 2. Decomposição Completa dos Critérios */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 px-0.5">
                        <span className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                          <Layers className="w-3.5 h-3.5 text-amber-500" />
                          Critérios Objetivos & Parâmetros
                        </span>
                        <span className="text-[11px] text-zinc-400 font-normal">
                          {displayedClinicalTip.chips.length} parâmetros
                        </span>
                      </div>

                      <div className="space-y-2">
                        {displayedClinicalTip.chips.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 sm:p-3.5 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-[#121620] flex flex-col gap-2 hover:border-amber-500/30 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {item.letter ? (
                                <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center justify-center font-mono font-black text-xs shrink-0">
                                  {item.letter}
                                </div>
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                              )}
                              <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug break-words">
                                {item.label}
                              </span>
                            </div>
                            <div className="w-full">
                              <span className="block w-full text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/15 px-3 py-2 rounded-lg border border-amber-500/25 leading-relaxed break-words whitespace-normal text-left">
                                {item.value}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  {/* 3. Pegadinha Clássica da Banca */}
                  {displayedClinicalTip.bancaTrap && (
                    <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        Pegadinha Clássica de Prova ({targetExamName || 'Bancas Oficiais'})
                      </span>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                        {displayedClinicalTip.bancaTrap}
                      </p>
                    </div>
                  )}

                  {/* Botões de Ação Final */}
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Fonte Oficial: {displayedClinicalTip.provenanceDefault}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCentralDrawer(null);
                        if (onStartTopicPractice) {
                          onStartTopicPractice(displayedClinicalTip.specialty, displayedClinicalTip.tema, displayedClinicalTip.title, 5);
                        } else {
                          handlePracticeArea(displayedClinicalTip.specialty);
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:opacity-95 flex items-center gap-2 ml-auto"
                      style={{ backgroundColor: accentConfig.primaryHex }}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Treinar Questões de {displayedClinicalTip.tema || displayedClinicalTip.specialty}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* === CASO 7: DRAWER CENTRAL DE MNEMÔNICO DETALHADO (VISUAL DIRETO & RESUMIDO • SEM REPETIÇÕES) === */}
              {activeCentralDrawer === 'mnemonico_detalhado' && (
                <div className="p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                  {/* Barra de Status e Ação Rápida */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-zinc-100 dark:border-zinc-800/80">
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25 font-bold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {activeDetailedMnemonic.examFrequency.split('•')[0] || 'Alto Rendimento'} na Residência
                    </span>

                    <button
                      type="button"
                      onClick={toggleSaveMnemonic}
                      className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 cursor-pointer transition-all"
                    >
                      {savedMnemonic ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Salvo no FSRS</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Salvar nos Flashcards</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* 1. Decomposição Direta dos Critérios */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 px-0.5">
                      <span className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                        <Layers className="w-3.5 h-3.5 text-amber-500" />
                        Critérios Objetivos de Decomposição
                      </span>
                      <span className="text-[11px] text-zinc-400 font-normal">
                        {activeDetailedMnemonic.breakdown.length} parâmetros
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                      {activeDetailedMnemonic.breakdown.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 sm:p-3 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-[#121620] flex items-center gap-3 hover:border-amber-500/30 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center justify-center font-mono font-black text-xs shrink-0">
                            {item.letter}
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              {item.label}: <strong className="font-mono text-amber-600 dark:text-amber-400">{item.meaning}</strong>
                            </span>
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 sm:text-right">
                              {item.detail}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Conduta Clínica Resumida & Direta */}
                  <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Conduta Prática Imediata
                    </span>
                    <p className="text-xs font-medium text-emerald-950 dark:text-emerald-200 leading-relaxed">
                      {activeDetailedMnemonic.clinicalApplication}
                    </p>
                  </div>

                  {/* 3. Pegadinha da Banca Direta */}
                  <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      Pegadinha da Banca ({targetExamName || 'Bancas Oficiais'})
                    </span>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                      {activeDetailedMnemonic.bancaTrap}
                    </p>
                  </div>

                  {/* Botões de Ação Final */}
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCentralDrawer(null);
                        const q = activeDetailedMnemonic.practiceQuery || { specialty: recommendedArea.filterName, search: '' };
                        if (onStartTopicPractice) {
                          onStartTopicPractice(q.specialty, q.tema, q.search, 5);
                        } else {
                          handlePracticeArea(recommendedArea.filterName);
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:opacity-95 flex items-center gap-2"
                      style={{ backgroundColor: accentConfig.primaryHex }}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Praticar Questões deste Tema (5Q)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* === CASO 8: DRAWER CENTRAL DE AGENDA DO DIA (CRONOGRAMA SEQUENCIAL FOCADO) === */}
              {activeCentralDrawer === 'agenda_detalhada' && (() => {

                return (
                  <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                    {/* Alertas de Sincronização e Sucesso */}
                    {calendarSyncSuccessMsg && (
                      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{calendarSyncSuccessMsg}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCalendarSyncSuccessMsg(null)}
                          className="text-emerald-600 dark:text-emerald-400 hover:opacity-70 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {calendarSyncError && (
                      <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2">
                          <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>{calendarSyncError}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCalendarSyncError(null)}
                          className="text-rose-600 dark:text-rose-400 hover:opacity-70 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Cronograma Visual: Atividades em Sequência (Coluna Única e Sem Distrações) */}
                    <div className="w-full space-y-4">
                      <GoogleCalendarScheduleView
                        events={daySchedule}
                        timelineFilter={timelineFilter}
                        setTimelineFilter={setTimelineFilter}
                        isGoogleCalendarConnected={isGoogleCalendarConnected}
                        onOpenAddManual={() => setShowAddManualModal(true)}
                        onOpenAiCommand={() => setShowAiCommandModal(true)}
                        onOpenAiDrawer={() => setShowAiScheduleDrawer(true)}
                        hasAiSuggestions={Boolean(scheduleAiAnalysis?.suggestions && scheduleAiAnalysis.suggestions.length > 0)}
                        onSyncGoogle={handleSyncNow}
                        isSyncingGoogle={isSyncingCalendar}
                        onExportSlotToGoogle={handleExportSlotToGoogle}
                        exportingSlotId={exportingSlotId}
                        exportedSlotIds={exportedSlotIds}
                        onRemoveTask={handleRemoveScheduledTask}
                        onAction={(action, slot) => {
                          if (action === 'treinar') {
                            setActiveCentralDrawer(null);
                            handlePracticeArea(recommendedArea.filterName);
                          } else if (action === 'caderno_erros') {
                            setActiveCentralDrawer('caderno_erros');
                          } else if (action === 'flashcards') {
                            setActiveCentralDrawer('flashcards');
                          } else if (action === 'mnemonico') {
                            if (isCustomizing) return;
                            setActiveCentralDrawer('mnemonico_detalhado');
                          } else if (action === 'simulado') {
                            setActiveCentralDrawer(null);
                            if (onStartSimuladoExpress) onStartSimuladoExpress(10);
                          }
                        }}
                        cleanEventDescription={cleanEventDescription}
                        isHospitalOrDutyEvent={isHospitalOrDutyEvent}
                        primaryAccentHex={accentConfig.primaryHex}
                        userScheduledTasks={userScheduledTasks}
                        onSyncAllTasksToGoogle={handleSyncAllTasksToGoogle}
                        onClearUserScheduledTasks={handleClearUserScheduledTasks}
                        isBatchSyncing={isBatchSyncing}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* === CASO 5: DRAWER CENTRAL DE FLASHCARDS === */}
              {activeCentralDrawer === 'flashcards' && (
                (() => {
                  const query = drawerSearch.toLowerCase().trim();
                  const filteredCards = flashcardsTodayList.filter((card) => {
                    // Filtro de Especialidade
                    if (drawerFlashcardSpecialty !== 'Todas') {
                      const spec = (card.specialty || '').toLowerCase();
                      if (drawerFlashcardSpecialty === 'Clínica Médica' && !spec.includes('clínica') && !spec.includes('clinica')) return false;
                      if (drawerFlashcardSpecialty === 'Cirurgia Geral' && !spec.includes('cirurg')) return false;
                      if (drawerFlashcardSpecialty === 'Gineco & Obstetrícia' && !spec.includes('ginec') && !spec.includes('obstet')) return false;
                      if (drawerFlashcardSpecialty === 'Pediatria' && !spec.includes('pediatr')) return false;
                      if (drawerFlashcardSpecialty === 'Medicina Preventiva' && !spec.includes('prevent') && !spec.includes('coletiva')) return false;
                    }
                    // Filtro de Busca
                    if (!query) return true;
                    return (
                      (card.front && card.front.toLowerCase().includes(query)) ||
                      (card.theme && card.theme.toLowerCase().includes(query)) ||
                      (card.comment && card.comment.toLowerCase().includes(query)) ||
                      (card.tags && card.tags.some((t) => t.toLowerCase().includes(query)))
                    );
                  });

                  return (
                    <div className="space-y-4">
                      {/* Mini-Cockpit FSRS (KPIs rápidos) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                            Para Hoje
                          </span>
                          <span className="text-xl sm:text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100 mt-1">
                            {flashcardsStats.dueToday}
                          </span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                            revisões pendentes
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                            Novos Cards
                          </span>
                          <span className="text-xl sm:text-2xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1">
                            {flashcardsStats.newCards}
                          </span>
                          <span className="text-[10px] text-blue-500/80">
                            aguardando estudo
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                            Em Revisão
                          </span>
                          <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                            {flashcardsStats.review}
                          </span>
                          <span className="text-[10px] text-emerald-500/80">
                            consolidados no FSRS
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                            Meta Retenção
                          </span>
                          <span
                            className="text-xl sm:text-2xl font-black font-mono mt-1"
                            style={{ color: accentConfig.primaryHex }}
                          >
                            {flashcardsStats.desiredRetention}%
                          </span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                            precisão esperada
                          </span>
                        </div>
                      </div>

                      {/* Lista de Flashcards do Dia */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-semibold px-1">
                          <span>Cartões de Alto Rendimento para Focar ({filteredCards.length})</span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveCentralDrawer(null);
                              onNavigate('flashcards');
                            }}
                            className="text-xs font-bold hover:underline cursor-pointer"
                            style={{ color: accentConfig.primaryHex }}
                          >
                            Central de Flashcards →
                          </button>
                        </div>

                        {filteredCards.length > 0 ? (
                          filteredCards.slice(0, 20).map((card) => (
                            <div
                              key={card.id}
                              className="p-3.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-[#121620] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-2xs"
                            >
                              <div className="min-w-0 flex-1 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                    {card.specialty}
                                  </span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                    {card.theme}
                                  </span>
                                  {card.priority === 'essential' && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                      ★ Prioritário
                                    </span>
                                  )}
                                </div>

                                <div className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 leading-snug">
                                  {card.front}
                                </div>

                                {card.comment && (
                                  <p className="text-[11px] text-blue-700 dark:text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-md inline-block border border-blue-500/20">
                                    Nota: {card.comment}
                                  </p>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCentralDrawer(null);
                                  onNavigate('flashcards');
                                }}
                                className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:opacity-95 active:scale-98 self-end sm:self-auto"
                                style={{ backgroundColor: accentConfig.primaryHex }}
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Revisar</span>
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="py-10 text-center space-y-2">
                            <Brain className="w-8 h-8 text-zinc-400 mx-auto" />
                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                              Nenhum flashcard encontrado com os filtros atuais.
                            </p>
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                              Você está em dia com seus cartões para este filtro.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Botão de Rodapé Fixo do Drawer */}
                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                          Repetição espaçada com algoritmo FSRS
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCentralDrawer(null);
                            onNavigate('flashcards');
                          }}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:opacity-95 flex items-center justify-center gap-2"
                          style={{ backgroundColor: accentConfig.primaryHex }}
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Iniciar Revisão de Hoje</span>
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}

            </div>
          </div>
        </div>
      )}



      {/* MODAL CENTRAL DE FILTRO POR PERÍODO (IMAGEM 5) */}
      {isPeriodDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop escurecido */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsPeriodDrawerOpen(false)}
          />

          {/* Modal Central */}
          <div className="relative z-50 w-full max-w-sm sm:max-w-md bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="space-y-4">
              {/* Cabeçalho do Modal */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                <span className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 font-heading">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  Filtrar por Período
                </span>
                <button
                  type="button"
                  onClick={() => setIsPeriodDrawerOpen(false)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Atalhos de Estudo */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2">
                  Atalhos de Estudo
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: '1d', label: '1 Dia (Hoje)' },
                    { id: '7d', label: '7 Dias (Padrão)' },
                    { id: '30d', label: 'Últimos 30 dias' },
                    { id: 'mes', label: 'Mês Atual' },
                    { id: '3m', label: '3 Meses' },
                    { id: '6m', label: '6 Meses' },
                    { id: 'all', label: 'Todo o Histórico' }
                  ].map((preset) => {
                    const isSel = specialtyPeriod === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSpecialtyPeriod(preset.id as PeriodFilter);
                          setIsPeriodDrawerOpen(false);
                        }}
                        className={`px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer border ${isSel
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold shadow-2xs'
                          : 'bg-zinc-50 dark:bg-zinc-900/70 border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Intervalo no Calendário */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                  Intervalo Personalizado no Calendário
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                      De:
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                      Até:
                    </label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!customStartDate || !customEndDate}
                  onClick={() => {
                    if (customStartDate && customEndDate) {
                      setSpecialtyPeriod('custom');
                      setIsPeriodDrawerOpen(false);
                    }
                  }}
                  className="w-full py-2 text-xs font-bold text-center text-white rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer mt-2"
                >
                  Aplicar Intervalo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL DE CONEXÃO COM GOOGLE AGENDA */}
      {isGoogleModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setIsGoogleModalOpen(false)}
        >
          <div
            className="w-full max-w-md max-h-[90dvh] overflow-y-auto overscroll-contain bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-xs">
                  <GoogleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Conectar Google Agenda
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Sincronize sua rotina médica e internato
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Seletor de Modo de Sincronização: Google vs Link iCal */}
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setCalendarSyncMode('api')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${calendarSyncMode === 'api'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
              >
                <GoogleIcon className="w-3.5 h-3.5" />
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => setCalendarSyncMode('ical')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${calendarSyncMode === 'ical'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
              >
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>Link iCal (.ics)</span>
              </button>
            </div>

            {calendarSyncError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{calendarSyncError}</span>
              </div>
            )}

            {calendarSyncSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{calendarSyncSuccessMsg}</span>
              </div>
            )}

            {/* CONTEÚDO DA ABA 1: GOOGLE (OPÇÃO 1) */}
            {calendarSyncMode === 'api' && (
              <div className="space-y-3.5">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                  Integração oficial via <strong>Google Agenda</strong> com leitura e gravação direta dos seus blocos.
                </p>

                {googleAccessToken ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Conectado com o Google Agenda</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      Sua conta Google está autorizada para ler seus compromissos e gravar blocos de estudo diretamente.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs space-y-1.5">
                      <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                        <GoogleIcon className="w-4 h-4" />
                        <span>Sincronização Direta com Google Agenda</span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Conecte sua conta do Google com 1 clique para ler sua rotina médica de hoje e salvar seus blocos de estudo da plataforma diretamente no seu calendário.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isSyncingCalendar || !googleClientId.trim()}
                      onClick={handleConnectGoogleViaApi}
                      className="w-full py-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer disabled:opacity-50 hover:shadow-md"
                    >
                      <GoogleIcon className="w-4 h-4" />
                      <span>{isSyncingCalendar ? 'Abrindo autenticação Google...' : 'Continuar com o Google'}</span>
                    </button>

                    {/* Dica essencial para tela "O Google não verificou este app" */}
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Passo ao abrir a janela do Google:</span>
                      </div>
                      <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
                        Se aparecer a tela <em>"O Google não verificou este app"</em>, clique em <strong>"Avançado"</strong> (canto inferior esquerdo) e depois em <strong>"Acessar Hippocampus (não seguro)"</strong> para autorizar a sincronização.
                      </p>
                    </div>

                    <div className="pt-0.5 text-center">
                      <button
                        type="button"
                        onClick={handleConnectGoogleViaRedirect}
                        className="text-[11px] text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 underline cursor-pointer"
                        title="Usar redirecionamento de tela inteira em vez de janela popup"
                      >
                        Problemas com popup? Abrir por redirecionamento
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CONTEÚDO DA ABA 2: LINK ICAL (.ICS) */}
            {calendarSyncMode === 'ical' && (
              <div className="space-y-3.5">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 font-medium">
                  Sincronize-a com o app usando um link para o iCal.
                </p>

                {/* Passo a passo oficial */}
                <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs text-zinc-700 dark:text-zinc-300 space-y-2">
                  <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-blue-500" />
                    Como obter o link iCal no Google Agenda:
                  </span>
                  <ol className="list-decimal pl-4 space-y-1.5 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                    <li>
                      Abra o <a href="https://calendar.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline font-semibold hover:opacity-80">Google Agenda</a> no computador.
                    </li>
                    <li>
                      No canto superior direito, clique em <strong>Configurações</strong> ⚙️.
                    </li>
                    <li>
                      No painel à esquerda, em <em>"Configurações das minhas agendas"</em>, clique no nome da agenda que você quer usar.
                    </li>
                    <li>
                      Clique em <strong>Integrar agenda</strong>.
                    </li>
                    <li>
                      Na seção <em>"Endereço secreto no formato iCal"</em>, <strong>copie o link</strong>.
                    </li>
                    <li>
                      Cole o link conforme indicado pelo outro app de agenda (no campo abaixo).
                    </li>
                  </ol>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Endereço secreto no formato iCal (.ics)
                    </label>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] focus-within:border-blue-500 transition-colors">
                    <GoogleIcon className="w-4 h-4 shrink-0" />
                    <input
                      type="url"
                      value={googleIcalUrl}
                      onChange={(e) => {
                        setGoogleIcalUrl(e.target.value);
                        setCalendarSyncError(null);
                      }}
                      placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
                      className="w-full text-xs bg-transparent text-zinc-900 dark:text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* BOTÕES DE AÇÃO INFERIORES */}
            <div className="pt-2 flex items-center gap-2.5">
              {isGoogleCalendarConnected ? (
                <>
                  <button
                    type="button"
                    onClick={handleDisconnectGoogleCalendar}
                    className="flex-1 py-2.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/10 cursor-pointer transition-colors"
                  >
                    Desconectar
                  </button>
                  <button
                    type="button"
                    disabled={isSyncingCalendar}
                    onClick={() => {
                      if (calendarSyncMode === 'api' && !googleAccessToken) {
                        handleConnectGoogleViaApi();
                      } else if (calendarSyncMode === 'api' && googleAccessToken) {
                        handleSyncNow();
                        setIsGoogleModalOpen(false);
                      } else {
                        handleConnectGoogleCalendar(googleCalendarAccount, googleRoutinePreset);
                      }
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[var(--primary-color,#2563eb)] hover:bg-[var(--primary-hover,#1d4ed8)] disabled:opacity-50 text-[var(--primary-contrast,#ffffff)] text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCalendar ? 'animate-spin' : ''}`} />
                    <span>{isSyncingCalendar ? 'Sincronizando...' : 'Atualizar Sincronização'}</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsGoogleModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isSyncingCalendar}
                    onClick={() => {
                      if (calendarSyncMode === 'api') {
                        handleConnectGoogleViaApi();
                      } else {
                        handleConnectGoogleCalendar(googleCalendarAccount, googleRoutinePreset);
                      }
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[var(--primary-color,#2563eb)] hover:bg-[var(--primary-hover,#1d4ed8)] disabled:opacity-50 text-[var(--primary-contrast,#ffffff)] text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isSyncingCalendar ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <GoogleIcon className="w-4 h-4" />
                    )}
                    <span>{isSyncingCalendar ? 'Sincronizando...' : 'Conectar e Sincronizar'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL PERSONALIZADO: REAJUSTE DE ATRASO NO PLANTÃO */}
      {showDelayModal && (
        <div
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowDelayModal(false)}
        >
          <div
            className="w-full max-w-md max-h-[90dvh] overflow-y-auto overscroll-contain bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-xs">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Atrasei
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Reajuste os blocos pendentes de hoje sem sobrecarga
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDelayModal(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                Quanto tempo você gostaria de adiar suas tarefas restantes?
              </label>

              {/* Pílulas de tempo pré-definido */}
              <div className="grid grid-cols-5 gap-1.5">
                {[30, 45, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setCustomDelayMinutes(mins)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${customDelayMinutes === mins
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                  >
                    +{mins}m
                  </button>
                ))}
              </div>

              {/* Campo para minutos customizados */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block">
                  Ou digite os minutos exatos de atraso:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="15"
                    max="360"
                    step="15"
                    value={customDelayMinutes}
                    onChange={(e) => setCustomDelayMinutes(Math.max(15, Number(e.target.value) || 15))}
                    className="w-24 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <span className="text-xs text-zinc-500 font-medium">minutos de tolerância/descanso</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
                  Como funciona a adaptação:
                </p>
                <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                  Os blocos de estudo que ainda não foram concluídos serão empurrados em <strong>+{customDelayMinutes} minutos</strong>, preservando intervalos de 15 minutos para descanso e protegendo seu período noturno de sono reparador.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowDelayModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleReorganizeDelayedSchedule(customDelayMinutes)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reorganizar (+{customDelayMinutes}m)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL CENTRAL DEDICADO: ADICIONAR BLOCO DE ESTUDO MANUAL */}
      {showAddManualModal && (
        <div
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowAddManualModal(false)}
        >
          <div
            className="w-full max-w-lg max-h-[90dvh] overflow-y-auto overscroll-contain bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[var(--accent-subtle,rgba(37,99,235,0.10))] border border-[var(--accent-border,rgba(37,99,235,0.35))] flex items-center justify-center text-[var(--primary-color,#2563eb)] shadow-xs">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Adicionar Bloco de Estudo
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Crie um horário dedicado na sua grade de hoje
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddManualModal(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Nome do Bloco
                </label>
                <input
                  type="text"
                  value={manualSlotTitle}
                  onChange={(e) => setManualSlotTitle(e.target.value)}
                  placeholder="Ex: Treino de Pediatria ou Revisão de Trauma"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--bg-input,#f8fafc)] dark:bg-zinc-800 border border-[var(--card-border,#e2e8f0)] dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[var(--primary-color,#2563eb)] font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Tipo de Atividade
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'estudo', label: 'Questões', icon: Play },
                    { id: 'flashcard', label: 'Flashcards', icon: Brain },
                    { id: 'revisao', label: 'Cad. Erros', icon: AlertOctagon },
                    { id: 'simulado', label: 'Simulado', icon: Trophy }
                  ].map((cat) => {
                    const isSelected = manualSlotCategory === cat.id;
                    const CatIcon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setManualSlotCategory(cat.id as any)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 border ${isSelected
                          ? 'bg-[var(--primary-color,#2563eb)] text-[var(--primary-contrast,#ffffff)] border-[var(--primary-color,#2563eb)] shadow-xs'
                          : 'bg-[var(--bg-input,#f8fafc)] dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-[var(--card-border,#e2e8f0)] dark:border-zinc-700 hover:text-zinc-900 dark:hover:text-white'
                          }`}
                      >
                        <CatIcon className="w-4 h-4" />
                        <span className="text-[10px]">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Horário de Início
                  </label>
                  <input
                    type="time"
                    value={manualSlotStart}
                    onChange={(e) => setManualSlotStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono font-bold text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Horário de Término
                  </label>
                  <input
                    type="time"
                    value={manualSlotEnd}
                    onChange={(e) => setManualSlotEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono font-bold text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Observações / Rationale (Opcional)
                </label>
                <input
                  type="text"
                  value={manualSlotNotes}
                  onChange={(e) => setManualSlotNotes(e.target.value)}
                  placeholder="Ex: Resolver 25 questões comentadas da banca"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--bg-input,#f8fafc)] dark:bg-zinc-800 border border-[var(--card-border,#e2e8f0)] dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[var(--primary-color,#2563eb)]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowAddManualModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateManualSlot}
                disabled={!manualSlotTitle.trim()}
                className="flex-1 py-2.5 rounded-xl bg-[var(--primary-color,#2563eb)] hover:bg-[var(--primary-hover,#1d4ed8)] disabled:opacity-50 text-[var(--primary-contrast,#ffffff)] text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Salvar Bloco</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL CENTRAL DEDICADO: PROMPT CUSTOMIZADO DE IA (O QUE FAZER DO HORÁRIO TAL AO TAL) */}
      {showAiCommandModal && (
        <div
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowAiCommandModal(false)}
        >
          <div
            className="w-full max-w-lg max-h-[90dvh] overflow-y-auto overscroll-contain bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Otimizador de Rotina (Mentor IA)
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Comande a IA para planejar exatamente o que você precisa
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiCommandModal(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Qual é o seu comando ou período livre?
                </label>
                <textarea
                  rows={3}
                  value={aiUserCommand}
                  onChange={(e) => setAiUserCommand(e.target.value)}
                  placeholder='Ex: "O que fazer das 14h às 18h?", "Tive plantão pesado, monte uma rotina mais leve com 20 questões e flashcards", "Encaixe 30 questões de GO e revisão de erros hoje"'
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-medium leading-relaxed"
                />
              </div>

              {/* Sugestões Rápidas de Prompt (Chips) */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Sugestões rápidas de comando:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'O que fazer das 14h às 18h?',
                    'Organizar rotina pós-plantão cansativo',
                    'Encaixar 30 questões da minha área fraca',
                    'Tenho apenas 1h livre hoje à noite'
                  ].map((presetPrompt, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setAiUserCommand(presetPrompt)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 border border-zinc-200/80 dark:border-zinc-700 transition-colors cursor-pointer text-left"
                    >
                      💡 {presetPrompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Informações de contexto */}
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  Como a IA planeja seu horário:
                </p>
                <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                  A IA analisa sua grade do Google Agenda, detecta intervalos livres e cruza com seu rendimento real por turno para distribuir blocos de questões, flashcards e revisão sem gerar cansaço mental.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowAiCommandModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleAnalyzeScheduleWithAi(aiUserCommand)}
                disabled={isAnalyzingSchedule}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingSchedule ? 'animate-spin' : ''}`} />
                <span>{isAnalyzingSchedule ? 'Gerando...' : 'Gerar Cronograma IA'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 9. DRAWER CENTRAL SECUNDÁRIO: PRÉ-VISUALIZAÇÃO DE SUGESTÕES DE IA (Lazy) */}
      {showAiScheduleDrawer && (
        <AiScheduleDrawer
          isOpen={showAiScheduleDrawer}
          onClose={() => setShowAiScheduleDrawer(false)}
          analysis={scheduleAiAnalysis}
          userScheduledTasks={userScheduledTasks}
          onAddTasks={(tasks) => {
            setUserScheduledTasks(prev => {
              const prevIds = new Set(prev.map(p => p.id));
              const newItems = tasks
                .filter(s => !prevIds.has(s.id))
                .map(s => ({ ...s, isAiSuggested: true }));
              newItems.forEach((item) => {
                saveUserScheduledTask(item, user?.id).catch(() => { });
              });
              return [...prev, ...newItems];
            });
            setCalendarSyncSuccessMsg(`${tasks.length} atividade(s) adicionada(s) ao cronograma oficial!`);
          }}
          onRemoveTask={handleRemoveScheduledTask}
          onExportToGoogle={handleExportSlotToGoogle}
          exportingSlotId={exportingSlotId}
          exportedSlotIds={exportedSlotIds}
        />
      )}

      {/* 10. MODAL LIGHTBOX DE ZOOM PARA IMAGENS DA DICA DO DIA */}
      {activeZoomImage && (
        <div
          onClick={() => setActiveZoomImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[90vh] bg-[#121215] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col cursor-default"
          >
            <div className="p-3 border-b border-zinc-800 flex items-center justify-between gap-3 bg-zinc-900/60">
              <span className="text-xs font-bold text-zinc-200 truncate">
                {activeZoomImage.caption || 'Exame de Imagem Clínica'}
              </span>
              <button
                type="button"
                onClick={() => setActiveZoomImage(null)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 flex items-center justify-center bg-black/60 overflow-auto max-h-[70vh]">
              <img
                src={activeZoomImage.url}
                alt={activeZoomImage.caption || 'Exame Clínico Ampliado'}
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
            {(activeZoomImage.source || activeZoomImage.license) && (
              <div className="p-2.5 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between text-[11px] text-zinc-400 gap-2 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span>Fonte Oficial:</span>
                  <strong className="text-zinc-200">{activeZoomImage.source}</strong>
                  {activeZoomImage.author && <span className="text-zinc-400">• Autor: {activeZoomImage.author}</span>}
                </span>
                <div className="flex items-center gap-2">
                  {activeZoomImage.license && (
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[9px] border border-zinc-700/60">
                      Licença: {activeZoomImage.license}
                    </span>
                  )}
                  {activeZoomImage.originUrl && (
                    <a
                      href={activeZoomImage.originUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-500 hover:underline flex items-center gap-1"
                    >
                      <span>Registro Oficial</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 11. MODAL DE CATÁLOGO COMPLETO DE CARDS CLÍNICOS (MODO DESENVOLVEDOR - 385 CARDS) */}
      {showDevTipModal && (
        <div
          onClick={() => setShowDevTipModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[92vh] bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col cursor-default"
          >
            {/* Header do Catálogo */}
            <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50/70 dark:bg-zinc-900/60 shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black flex items-center gap-1 shadow-2xs">
                    <Brain className="w-3 h-3" />
                    DEV PREVIEW
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    Catálogo de Dicas & Decorebas ({CLINICAL_TIPS_DATABASE.length} Cards Mapeados)
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Clique em qualquer card para carregá-lo instantaneamente na tela inicial com todos os recursos e active recall.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDevTipModal(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barra de Busca e Filtros Rápidos de Especialidade */}
            <div className="p-3 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-2.5 bg-white dark:bg-[#121215] shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={devSearchQuery}
                  onChange={(e) => setDevSearchQuery(e.target.value)}
                  placeholder="Buscar card por título, tema, foco, subfoco, regra ou pegadinha..."
                  className="w-full pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                />
                {devSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setDevSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filtro por Especialidade com Contadores */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
                {[
                  { label: 'Todas', count: CLINICAL_TIPS_DATABASE.length },
                  { label: 'Clínica Médica', count: CLINICAL_TIPS_DATABASE.filter(c => c.specialty === 'Clínica Médica').length },
                  { label: 'Cirurgia Geral', count: CLINICAL_TIPS_DATABASE.filter(c => c.specialty === 'Cirurgia Geral').length },
                  { label: 'Pediatria', count: CLINICAL_TIPS_DATABASE.filter(c => c.specialty === 'Pediatria').length },
                  { label: 'Ginecologia', count: CLINICAL_TIPS_DATABASE.filter(c => c.specialty === 'Ginecologia').length },
                  { label: 'Obstetrícia', count: CLINICAL_TIPS_DATABASE.filter(c => c.specialty === 'Obstetrícia').length },
                  { label: 'Medicina Preventiva e Social', count: CLINICAL_TIPS_DATABASE.filter(c => c.specialty.includes('Preventiva')).length },
                ].map((spec) => {
                  const isSelected = devSpecialtyFilter === spec.label;
                  return (
                    <button
                      key={spec.label}
                      type="button"
                      onClick={() => setDevSpecialtyFilter(spec.label)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-xs shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-500 text-black shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 border border-zinc-200/80 dark:border-zinc-700/60'
                      }`}
                    >
                      <span>{spec.label === 'Medicina Preventiva e Social' ? 'Preventiva' : spec.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected ? 'bg-black/20 text-black' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}>
                        {spec.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid Scrollável com Todos os Cards Filtrados */}
            <div className="p-3 sm:p-5 overflow-y-auto custom-scrollbar flex-1 space-y-3 bg-zinc-50/40 dark:bg-[#0c0c0e]">
              {(() => {
                const q = devSearchQuery.toLowerCase().trim();
                const filtered = CLINICAL_TIPS_DATABASE.map((card, originalIdx) => ({ card, originalIdx })).filter(({ card }) => {
                  // Filtro por especialidade
                  if (devSpecialtyFilter !== 'Todas') {
                    if (devSpecialtyFilter === 'Medicina Preventiva e Social') {
                      if (!card.specialty.includes('Preventiva')) return false;
                    } else if (card.specialty !== devSpecialtyFilter) {
                      return false;
                    }
                  }
                  // Filtro por texto
                  if (!q) return true;
                  const inTitle = card.title.toLowerCase().includes(q) || (card.fullTitle && card.fullTitle.toLowerCase().includes(q));
                  const inTema = card.tema && card.tema.toLowerCase().includes(q);
                  const inFoco = card.foco && card.foco.toLowerCase().includes(q);
                  const inSubfocos = card.subfocos && card.subfocos.some(sf => sf.toLowerCase().includes(q));
                  const inRule = card.rule && card.rule.toLowerCase().includes(q);
                  const inBancaTrap = card.bancaTrap && card.bancaTrap.toLowerCase().includes(q);
                  const inChips = card.chips && card.chips.some(ch => ch.label.toLowerCase().includes(q) || ch.value.toLowerCase().includes(q));
                  return inTitle || inTema || inFoco || inSubfocos || inRule || inBancaTrap || inChips;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-12 text-center text-zinc-400 dark:text-zinc-500">
                      <p className="text-sm font-semibold">Nenhum card encontrado para os filtros selecionados.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setDevSearchQuery('');
                          setDevSpecialtyFilter('Todas');
                        }}
                        className="mt-3 text-xs text-amber-500 underline font-bold"
                      >
                        Limpar filtros de busca
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filtered.map(({ card, originalIdx }) => {
                      const isCurrent = currentTipIndex === originalIdx;
                      return (
                        <div
                          key={card.id}
                          onClick={() => {
                            setDevCardIndex(originalIdx);
                            setShowDevTipModal(false);
                          }}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 group ${
                            isCurrent
                              ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500'
                              : 'bg-white dark:bg-[#121215] border-zinc-200/90 dark:border-zinc-800/90 hover:border-amber-500/40 hover:shadow-md'
                          }`}
                        >
                          <div className="space-y-1.5">
                            {/* Linha Superior: #ID + Especialidade + Badge de Imagem */}
                            <div className="flex items-center justify-between gap-1.5 flex-wrap">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                #{originalIdx + 1}
                              </span>
                              <div className="flex items-center gap-1">
                                {card.requiresImage && (
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/25">
                                    📷 {card.imageModality?.toUpperCase() || 'IMG'}
                                  </span>
                                )}
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                                  {card.categoryLabel || 'Critérios'}
                                </span>
                              </div>
                            </div>

                            {/* Título & Subtítulo */}
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors break-words">
                              {card.title}
                            </h4>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium break-words leading-tight">
                              {card.specialty} • {card.tema}{card.foco ? ` • ${card.foco}` : ''}
                            </p>
                          </div>

                          {/* Preview das Chips sem truncamento */}
                          <div className="space-y-1.5">
                            {card.chips.slice(0, 4).map((ch, i) => (
                              <div key={i} className="text-[10px] flex flex-col gap-1 p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/60">
                                <span className="text-zinc-700 dark:text-zinc-300 font-semibold leading-tight break-words">
                                  {ch.label}
                                </span>
                                <span className="text-amber-700 dark:text-amber-300 font-bold leading-snug break-words whitespace-normal text-left bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                  {ch.value}
                                </span>
                              </div>
                            ))}
                            {card.chips.length > 4 && (
                              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block text-right font-medium">
                                +{card.chips.length - 4} itens adicionais
                              </span>
                            )}
                          </div>

                          {/* Rodapé do Mini-Card */}
                          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/70 flex items-center justify-between text-[10px]">
                            {isCurrent ? (
                              <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                                <Check className="w-3 h-3 text-amber-500" />
                                <span>Ativo na Tela Inicial</span>
                              </span>
                            ) : (
                              <span className="text-zinc-500 dark:text-zinc-400 group-hover:text-amber-500 font-semibold flex items-center gap-1 transition-colors">
                                <span>Inspecionar na Tela Inicial</span>
                                <ArrowRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
