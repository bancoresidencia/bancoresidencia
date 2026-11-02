'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  RefreshCw
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
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  type PieSectorDataItem
} from 'recharts';
import { UserStats, QuestionList, ActiveTab, Modalidade, UserAnswerItem, PeriodFilter } from '@/types';
import { UterusIcon, PregnantWomanIcon } from './StatsDashboard';
import { getPercentileColor } from '@/utils/percentile';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { getAccountTargetExam } from '@/utils/userTargetExam';
import { flashcardsService } from '@/services/flashcardsService';
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
import { FigmaCardWrapper } from './dashboard/FigmaCardWrapper';
import { FigmaCustomizerBar } from './dashboard/FigmaCustomizerBar';
import {
  buildGoogleCalendarTemplateUrl,
  requestGoogleCalendarAccessToken,
  fetchTodayEventsFromGoogleApi,
  createEventInGoogleCalendarApi,
  startGoogleOAuthRedirect,
  extractGoogleTokenFromUrlHash,
  extractGoogleAuthErrorFromUrl,
  getGoogleOAuthRedirectUri,
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
  userAnswers?: Record<string, UserAnswerItem>;
}

interface AreaEvolutionTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{
    payload?: {
      date?: string;
      acertos?: number;
      erros?: number;
      resolvidas?: number;
    };
  }>;
  colorHex?: string;
  areaLabel?: string;
}

const AreaEvolutionTooltip: React.FC<AreaEvolutionTooltipProps> = ({
  active,
  payload,
  colorHex,
  areaLabel,
}) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-slate-200 dark:border-zinc-800 p-2.5 rounded-xl shadow-xl text-xs space-y-1 z-50">
      <p className="font-bold text-slate-800 dark:text-zinc-200 text-[11px] pb-1 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorHex }} />
        <span>{data.date} • {areaLabel}</span>
      </p>
      <div className="flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Acertos:
        </span>
        <span className="font-mono font-bold">{data.acertos}</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-rose-600 dark:text-rose-400 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          Erros:
        </span>
        <span className="font-mono font-bold">{data.erros}</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-slate-500 dark:text-zinc-400 font-medium pt-1 border-t border-slate-100 dark:border-zinc-800">
        <span>Total no dia:</span>
        <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{data.resolvidas}</span>
      </div>
    </div>
  );
};

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
  userAnswers
}) => {
  const { accentConfig, mode } = useTheme();

  // Hook de Personalização de Layout Estilo Figma (Tamanho, Ordem e Visibilidade)
  const {
    isCustomizing,
    setIsCustomizing,
    selectedCardId,
    setSelectedCardId,
    visibleCards,
    hiddenCards,
    updateColSpan,
    updateCardHeight,
    updateCardSettings,
    moveCard,
    reorderCard,
    toggleVisibility,
    restoreDefaults,
    autoConformLayout,
  } = useDashboardLayout('bancoresidencia_layout_home', DEFAULT_HOME_CARDS);

  // Período ativo do card de Aproveitamento (Geral vs Últimos 7 Dias)
  const [accuracyPeriod, setAccuracyPeriod] = useState<'geral' | '7d'>('geral');

  // Cálculo das métricas dinâmicas por período (Geral vs 7 Dias)
  const periodStats = React.useMemo(() => {
    if (accuracyPeriod === '7d' && stats.historyByDay && stats.historyByDay.length > 0) {
      const last7 = stats.historyByDay.slice(-7);
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

  // Animação suave e flat do aproveitamento ao carregar ou alternar período
  const [animatedAccuracy, setAnimatedAccuracy] = useState<number>(0);
  useEffect(() => {
    const target = periodStats.answered > 0 ? periodStats.rate : 0;
    let startTime: number | null = null;
    const duration = 500; // ms
    let animId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Curva suave ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedAccuracy(Number((target * easeOut).toFixed(1)));

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        setAnimatedAccuracy(target);
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

  const todayAnswered = stats.historyByDay[stats.historyByDay.length - 1]?.answered || 0;
  const goalPercentage = Math.min(100, Math.round((todayAnswered / (dailyGoal || 1)) * 100));

  // Meta Diária de Tempo de Estudo personalizada (em minutos) com restauração síncrona
  const [dailyTimeGoal, setDailyTimeGoal] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTime = localStorage.getItem('bancoresidencia_daily_time_goal');
        if (savedTime) return Number(savedTime);
      } catch { }
    }
    return 120;
  });

  const { user } = useAuth();
  const { plan, openUpgradeModal } = useSubscription();

  // Prova alvo e contagem regressiva
  const examInfo = React.useMemo(() => getAccountTargetExam(user), [user]);
  const [targetExamName, setTargetExamName] = useState<string>(examInfo.examName);
  const [targetDaysLeft, setTargetDaysLeft] = useState<number>(examInfo.daysLeft);

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
      localStorage.setItem('bancoresidencia_custom_daily_goal', String(q));
      localStorage.setItem('bancoresidencia_daily_time_goal', String(t));
    }
    setIsEditingGoals(false);
  };

  const todayStudyMinutes = Math.round(todayAnswered * 2.5);
  const timeGoalPercentage = Math.min(100, Math.round((todayStudyMinutes / (dailyTimeGoal || 1)) * 100));

  // Tier cromático do percentil independente com suporte a modo claro/escuro
  const percentileTier = getPercentileColor(stats.percentileInfo.percentile);
  const isPercentileCalibrating = stats.percentileInfo.status === 'locked' || stats.percentileInfo.status === 'unranked';
  const percentileCardBg = mode === 'light' ? percentileTier.cardBgLight : percentileTier.cardBgDark;
  const percentileCardBorder = mode === 'light' ? percentileTier.cardBorderLight : percentileTier.cardBorderDark;
  const percentileTextColor = mode === 'light' ? percentileTier.textLight : percentileTier.textDark;

  // Histórico de Provas Oficiais e Simulados Recentes
  const [officialExamsHistory, setOfficialExamsHistory] = useState<RecentExamRecord[]>(() => getRecentOfficialExams());
  const [mockExamsHistory, setMockExamsHistory] = useState<RecentMockRecord[]>(() => getRecentMockExams());

  // Drawer de Provas / Simulados / Caderno de Erros / Flashcards
  // Estado do Drawer / Modal Central Exclusivo por Categoria
  const [activeCentralDrawer, setActiveCentralDrawer] = useState<'cadernos' | 'provas' | 'simulados' | 'caderno_erros' | 'flashcards' | 'treinar_recomendacao' | 'mnemonico_detalhado' | 'agenda_detalhada' | null>(null);
  const [drawerSearch, setDrawerSearch] = useState('');
  const [drawerModality, setDrawerModality] = useState<OfficialExamModalityKey>('todas');
  const [drawerErrorSpecialty, setDrawerErrorSpecialty] = useState<string>('Todas');
  const [drawerFlashcardSpecialty, setDrawerFlashcardSpecialty] = useState<string>('Todas');

  // Seletor de abas da Retomada de Estudos (Cadernos, Provas, Simulados)
  const [studyResumeTab, setStudyResumeTab] = useState<'cadernos' | 'provas' | 'simulados'>('provas');

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
    try {
      return flashcardsService.getStats();
    } catch {
      return { dueToday: 30, newCards: 20, review: 1, total: 31, desiredRetention: 90 };
    }
  }, [activeCentralDrawer]);

  const flashcardsTodayList = React.useMemo(() => {
    try {
      return flashcardsService.getFlashcards();
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
    if (total < 10) return { label: 'Calibrando', color: 'text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700/60' };
    if (accuracy >= 75) return { label: 'Forte', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (accuracy >= 60) return { label: 'Regular', color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20' };
    return { label: 'Reforçar', color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' };
  };

  // Animação Hero da Medalha do Percentil Oficial (destacada no centro do card na primeira abertura do site)
  const [isMedalAnimating, setIsMedalAnimating] = useState(false);
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

  // Seleção e hover para o gráfico de Donut do Raio-X das 6 Grandes Áreas (com suporte a Geral)
  // --- ESTRUTURAS AUXILIARES PARA ENQUADRAMENTO DA PRIMEIRA DOBRA ---

  // Mapeamento de subtemas críticos de alta incidência em Residência Médica
  const CRITICAL_SUBTOPICS_MAP: Record<string, Array<{ name: string; defaultAccuracy: number }>> = {
    cirurgia: [
      { name: 'Abdome Agudo', defaultAccuracy: 0 },
      { name: 'Trauma Abdominal (ATLS)', defaultAccuracy: 25 },
      { name: 'Hérnias da Parede', defaultAccuracy: 33 }
    ],
    clinica: [
      { name: 'Insuficiência Cardíaca', defaultAccuracy: 20 },
      { name: 'Sepse e Choque', defaultAccuracy: 30 },
      { name: 'Diabetes e Complicações', defaultAccuracy: 40 }
    ],
    pediatria: [
      { name: 'Aleitamento Materno', defaultAccuracy: 25 },
      { name: 'Infecções Respiratórias (IVAS)', defaultAccuracy: 35 },
      { name: 'Triagens Neonatais', defaultAccuracy: 40 }
    ],
    ginecologia: [
      { name: 'Sangramento Uterino Anormal', defaultAccuracy: 15 },
      { name: 'Rastreamento CA Colo', defaultAccuracy: 30 },
      { name: 'Climatério e TH', defaultAccuracy: 35 }
    ],
    obstetricia: [
      { name: 'Hemorragias da Gestação', defaultAccuracy: 20 },
      { name: 'Pré-Eclâmpsia e Eclâmpsia', defaultAccuracy: 28 },
      { name: 'Vitalidade Fetal e Parto', defaultAccuracy: 40 }
    ],
    preventiva: [
      { name: 'Estudos Epidemiológicos', defaultAccuracy: 18 },
      { name: 'Princípios e Diretrizes SUS', defaultAccuracy: 30 },
      { name: 'Testes Diagnósticos (Sens/Espec)', defaultAccuracy: 38 }
    ]
  };

  // Interface rica para Pílulas Clínicas e Mnemônicos Padrão-Ouro
  interface DetailedMnemonicData {
    title: string;
    theme: string;
    acronym: string;
    letters: string[];
    content: string;
    rule: string;
    clinicalApplication: string;
    bancaTrap: string;
    examFrequency: string;
    breakdown: Array<{
      letter: string;
      label: string;
      meaning: string;
      detail: string;
      badge?: string;
    }>;
    clinicalCase?: {
      vignette: string;
      answer: string;
      explanation: string;
    };
    practiceQuery?: {
      specialty: string;
      tema?: string;
      search?: string;
    };
  }

  // Mapeamento ampliado de pílulas clínicas e mnemônicos padrão-ouro
  const DETAILED_MNEMONICS_MAP: Record<string, DetailedMnemonicData> = {
    cirurgia: {
      title: 'Critérios de Ranson na Admissão (Pancreatite Aguda)',
      theme: 'Pancreatite Aguda • Doenças Biliares & Pâncreas',
      acronym: 'L-A-G-A-R',
      letters: ['L', 'A', 'G', 'A', 'R'],
      content: 'L-A-G-A-R na admissão: Leucócitos (>16k) • Age/Idade (>55) • Glicose (>200) • AST (>250) • LDH (>350)',
      rule: '≥3 critérios na admissão prediz pancreatite aguda grave (indicação formal de UTI e vigilância de falência orgânica)',
      clinicalApplication: 'Aplicado nas primeiras 48h de evolução. Pacientes com 0-2 critérios apresentam mortalidade < 1%; ≥3 critérios elevam o risco para 15-40%, exigindo ressuscitação volêmica vigorosa com Ringer Lactato e monitorização hemodinâmica contínua.',
      bancaTrap: 'Pegadinha Clássica: Amilase e lipase NÃO avaliam gravidade nem entram em Ranson (servem exclusivamente para o diagnóstico). Outra pegadinha frequente é confundir os critérios da admissão com os de 48h (C-H-A-B-O-S: Cálcio, Hematócrito, Gaso/pO2, BUN/Ureia, Déficit de Base, Sequestro Líquido).',
      examFrequency: 'Altíssima relevância • Cobrado em ~91% das bancas de Residência (ENARE, USP, SURCE, SUS-SP)',
      practiceQuery: {
        specialty: 'Cirurgia Geral',
        tema: 'Pancreatite Aguda',
        search: 'Pancreatite'
      },
      breakdown: [
        { letter: 'L', label: 'Leucócitos', meaning: '> 16.000 /mm³', detail: 'Expressa a intensidade da resposta inflamatória sistêmica inicial (SIRS)' },
        { letter: 'A', label: 'Age / Idade', meaning: '> 55 anos', detail: 'Fator prognóstico independente associado a menor reserva fisiológica' },
        { letter: 'G', label: 'Glicose', meaning: '> 200 mg/dL', detail: 'Reflete estresse adrenérgico e disfunção endócrina das ilhotas pancreáticas' },
        { letter: 'A', label: 'AST / TGO', meaning: '> 250 U/L', detail: 'Marcador de lesão hepatocelular e sofrimento parenquimatoso secundário' },
        { letter: 'R', label: 'LDH / DHL', meaning: '> 350 U/L', detail: 'Indicador direto de necrose tecidual e lise celular acelerada' }
      ],
      clinicalCase: {
        vignette: 'Homem de 58 anos dá entrada com dor epigástrica em barra há 12h, lipase 1400 U/L. Exames admissionais: Leucócitos 17.800/mm³, Glicose 245 mg/dL, AST 290 U/L, LDH 420 U/L. Qual a conduta imediata quanto à estratificação?',
        answer: 'Pancreatite Aguda Grave (Ranson = 5 critérios na admissão). Indicação mandatória de leito em UTI e hidratação guiada por metas.',
        explanation: 'O paciente pontuou nos 5 critérios de admissão (Idade > 55, Leucócitos > 16k, Glicose > 200, AST > 250, LDH > 350). Com escore ≥ 3, o quadro é categorizado como grave com alta probabilidade de necrose e falência de múltiplos órgãos.'
      }
    },
    clinica: {
      title: 'Critérios de Light (Derrame Pleural: Exsudato vs Transudato)',
      theme: 'Pneumologia • Análise do Líquido Pleural',
      acronym: 'LIGHT',
      letters: ['1', '2', '3'],
      content: 'Prot Pleural/Sérica > 0,5 OU LDH Pleural/Sérica > 0,6 OU LDH Pleural > 2/3 do LSN sérico',
      rule: 'Apenas 1 critério positivo já classifica o líquido como EXSUDATO (processo inflamatório, infeccioso ou neoplásico)',
      clinicalApplication: 'Etapa diagnóstica obrigatória após toracocentese. Se for Exsudato, impõe-se a busca por etiologias inflamatórias (derrame parapneumônico, empiema, tuberculose, neoplasia, TEP). Se nenhum dos 3 critérios estiver presente, confirma-se Transudato (insuficiência cardíaca descompensada, cirrose, síndrome nefrótica).',
      bancaTrap: 'Pegadinha Clássica: A regra é baseada em "OU", nunca em "E". Uma relação de Proteína Pleural/Sérica de 0,51, isoladamente, já sacramenta o diagnóstico de exsudato! Fique atento ao falso-exsudato em cardiopatas em uso de furosemida (neste caso, o gradiente de albumina soro-líquido pleural > 1,2 g/dL reclassifica como transudato).',
      examFrequency: 'Tema indispensável • Cobrado em 89% das provas de Clínica Médica',
      practiceQuery: {
        specialty: 'Clínica Médica',
        tema: 'Pneumologia',
        search: 'Derrame Pleural'
      },
      breakdown: [
        { letter: '1', label: 'Proteína', meaning: 'Prot Pleural / Sérica > 0,5', detail: 'Aumento da permeabilidade capilar pleural decorrente de inflamação local' },
        { letter: '2', label: 'LDH Razão', meaning: 'LDH Pleural / Sérico > 0,6', detail: 'Reflete alta celularidade e inflamação exuberante no espaço pleural' },
        { letter: '3', label: 'LDH Absoluto', meaning: 'LDH Pleural > 2/3 do LSN sérico', detail: 'Geralmente > 200 U/L quando o valor sérico de referência é 300 U/L' }
      ],
      clinicalCase: {
        vignette: 'Mulher de 62 anos com tosse seca e derrame pleural à direita. Punção: Proteína pleural 3,2 g/dL (sérica 6,0 g/dL), LDH pleural 180 U/L (sérico 320 U/L, LSN = 250 U/L). Como classificar o líquido?',
        answer: 'Exsudato Pleural (Razão Prot Pleural/Sérica = 3,2 / 6,0 = 0,53, que é > 0,5).',
        explanation: 'Embora o LDH isolado esteja abaixo dos cortes de exsudato, a presença de um único critério positivo (relação de proteína > 0,5) é suficiente para selar o diagnóstico de exsudato segundo a sensibilidade de 98% dos Critérios de Light.'
      }
    },
    pediatria: {
      title: 'Escore de Apgar Neonatal (1º e 5º Minuto)',
      theme: 'Neonatologia • Recepção e Vitalidade do Recém-Nascido',
      acronym: 'A-P-G-A-R',
      letters: ['A', 'P', 'G', 'A', 'R'],
      content: 'A-P-G-A-R: Aparência (cor) • Pulso (FC) • Gesticulação • Atividade (tônus) • Respiração',
      rule: 'Nota de 0 a 10 • Avalia vitalidade ao nascer e resposta à reanimação (0-3: asfixia grave, 4-6: moderada, 7-10: boa vitalidade)',
      clinicalApplication: 'O Apgar é pontuado no 1º e no 5º minuto (persistindo a cada 5 min se < 7). O escore de 5º minuto é o parâmetro de maior valor prognóstico neurológico e de morbimortalidade no período neonatal imediato.',
      bancaTrap: 'Pegadinha Número 1 de Sala de Parto: NUNCA se atrasa ou aguarda a contagem do Apgar para iniciar manobras de reanimação! A indicação de reanimação (aquecer, secar, posicionar, aspirar se necessário e ventilar com pressão positiva) depende da avaliação tríplice imediata: Termo? Respirando ou chorando? Tônus em flexão?',
      examFrequency: 'Tema obrigatório • Presente em mais de 92% das provas de Pediatria',
      practiceQuery: {
        specialty: 'Pediatria',
        tema: 'Neonatologia',
        search: 'Neonatologia'
      },
      breakdown: [
        { letter: 'A', label: 'Aparência (Cor)', meaning: '0: Pálido/Cianose Central | 1: Acrocianose | 2: Completamente Rosado', detail: 'Acrocianose isolada é fisiológica nos primeiros minutos de vida extrauterina' },
        { letter: 'P', label: 'Pulso (FC)', meaning: '0: Ausente | 1: < 100 bpm | 2: ≥ 100 bpm', detail: 'FC < 100 bpm é a principal indicação para Ventilação com Pressão Positiva (VPP)' },
        { letter: 'G', label: 'Gesticulação', meaning: '0: Sem resposta | 1: Caretas | 2: Espirro, tosse, choro vigoroso', detail: 'Avalia a irritabilidade reflexa à estimulação tátil e desobstrução de vias aéreas' },
        { letter: 'A', label: 'Atividade', meaning: '0: Flácido | 1: Alguma flexão | 2: Movimentos ativos e tônus forte', detail: 'Reflete a oxigenação e integridade do tronco encefálico e medula espinhal' },
        { letter: 'R', label: 'Respiração', meaning: '0: Ausente (apneia) | 1: Lenta/irregular | 2: Regular e choro forte', detail: 'Esforço respiratório espontâneo eficaz na transição cardiopulmonar' }
      ],
      clinicalCase: {
        vignette: 'Recém-nascido a termo no 1º minuto apresenta FC = 120 bpm, choro vigoroso, extremidades arroxeadas com tronco rosado, espirra à aspiração e movimenta membros ativamente. Qual seu escore?',
        answer: 'Apgar 9 (A=1 [acrocianose], P=2 [FC > 100], G=2 [espirro/tosse], A=2 [movimento ativo], R=2 [choro vigoroso]).',
        explanation: 'A única dedução de 1 ponto ocorre na Aparência/Cor decorrente de acrocianose (extremidades periféricas cianóticas com tronco rosado), o que é achado frequente e esperado no 1º minuto.'
      }
    },
    ginecologia: {
      title: 'Classificação FIGO de SUA (PALM-COEIN)',
      theme: 'Ginecologia Geral • Sangramento Uterino Anormal',
      acronym: 'PALM-COEIN',
      letters: ['P', 'A', 'L', 'M', 'C', 'O', 'E', 'I', 'N'],
      content: 'PALM (Estruturais) / COEIN (Não Estruturais): Pólipo, Adenomiose, Leiomioma, Malignidade / Coagulopatia, Ovulatória, Endometrial, Iatrogênica, Não especificada',
      rule: 'PALM = Causas anatômicas e estruturais (visíveis a exames de imagem e histopatologia) • COEIN = Causas não estruturais / funcionais',
      clinicalApplication: 'Sistematização obrigatória na condução do Sangramento Uterino Anormal em mulheres não gestantes no menacme. Permite separar pacientes candidatas a procedimentos intervencionistas/cirúrgicos (PALM) daquelas com indicação de manejo clínico, hormonal ou hematológico (COEIN).',
      bancaTrap: 'Pegadinhas Clássicas: (1) Onde entra o sangramento por DIU de cobre ou anticoagulante oral? Resposta: COEIN (I = Iatrogênica ou C = Coagulopatia). (2) A banca adora cobrar as subclasses de Leiomioma (Lsm = submucoso, com maior sangramento; Lo = outros intramural/subseroso).',
      examFrequency: 'Altíssima frequência • Questão certa em Ginecologia e Obstetrícia',
      practiceQuery: {
        specialty: 'Ginecologia',
        tema: 'Ginecologia Geral',
        search: 'Sangramento Uterino'
      },
      breakdown: [
        { letter: 'P', label: 'Pólipo', meaning: 'Endometrial ou Endocervical', detail: 'Diagnóstico por ultrassonografia com histerossonografia ou histeroscopia' },
        { letter: 'A', label: 'Adenomiose', meaning: 'Infiltração de glândulas no miométrio', detail: 'Causa clássica de útero globoso, aumentado e dismenorreia secundária intensa' },
        { letter: 'L', label: 'Leiomioma', meaning: 'Submucoso (Lsm) vs Outros (Lo)', detail: 'Submucosos causam sangramento abundante por distorção endometrial direta' },
        { letter: 'M', label: 'Malignidade', meaning: 'Câncer de endométrio e hiperplasias', detail: 'Principal suspeita em SUA no climatério e pós-menopausa tardia' },
        { letter: 'C', label: 'Coagulopatia', meaning: 'Doença de von Willebrand, plaquetopenias', detail: 'Suspeitar em sangramentos intensos desde a menarca' },
        { letter: 'O', label: 'Disfunção Ovulatória', meaning: 'SOP, hiperprolactinemia, hipotireoidismo', detail: 'Ciclos anovulatórios com sangramento irregular por quebra estrogênica' },
        { letter: 'E', label: 'Endometrial', meaning: 'Deficiência na vasoconstrição local', detail: 'Desequilíbrio de prostaglandinas (PGF2a/PGE2) em ciclos regulares' },
        { letter: 'I', label: 'Iatrogênica', meaning: 'DIU, implantes, anticoagulantes, psicotrópicos', detail: 'Efeito colateral farmacológico documentado em anamnese dirigida' },
        { letter: 'N', label: 'Não Especificada', meaning: 'Malformações arteriovenosas, nichos', detail: 'Condições raras não catalogadas nos outros grupos FIGO' }
      ],
      clinicalCase: {
        vignette: 'Mulher de 34 anos com ciclos menstruais a cada 45 a 60 dias, sangramento em grande volume e hirsutismo. Exame pélvico e USG transvaginal anatômica normais. Qual o grupo FIGO?',
        answer: 'COEIN - Letra "O" (Disfunção Ovulatória secundária à Síndrome dos Ovários Policísticos).',
        explanation: 'A ausência de alterações estruturais na imagem descarta o grupo PALM. A oligomenorreia associada a hirsutismo confirma anovulação crônica, pertencente à categoria "O" (Ovulatory dysfunction) do sistema FIGO.'
      }
    },
    obstetricia: {
      title: 'Descolamento Prematuro de Placenta (DPP)',
      theme: 'Obstetrícia de Alto Risco • Hemorragias da 2ª Metade',
      acronym: 'D-P-P',
      letters: ['D', 'O', 'R', 'H', 'I', 'P'],
      content: 'Tríade clássica: Dor abdominal súbita + Hipertonia uterina ("útero em tábua") + Sangramento escuro com sofrimento fetal agudo',
      rule: 'Conduta imediata: Amniotomia precoce imediata + Parto pela via mais rápida (geralmente cesariana de emergência)',
      clinicalApplication: 'Emergência obstétrica de alto risco materno-fetal associada a hipertensão prévia/pré-eclâmpsia e trauma. A amniotomia descompressiva reduz a pressão intramiócica, alivia a hipertonia e diminui a liberação de tromboplastina na circulação materna.',
      bancaTrap: 'Diferencial Fatal em Prova: DPP vs Placenta Prévia (PP). No DPP a dor é INTENSA e súbita, o sangramento é ESCURO e tem HIPERTONIA uterina sustentada. Na Placenta Prévia, o sangramento é ROUBO (vermelho vivo), INDOLOR, INSIDIOSO e o útero é normotônico e indolor. Nunca realize toque vaginal em sangramento de 2ª metade sem antes excluir placenta prévia!',
      examFrequency: 'Top 3 em todas as provas de Obstetrícia do Brasil',
      practiceQuery: {
        specialty: 'Obstetrícia',
        tema: 'Obstetrícia de Alto Risco',
        search: 'Placenta'
      },
      breakdown: [
        { letter: 'D', label: 'Dor Abdominal', meaning: 'Súbita, intensa e contínua', detail: 'Decorrente do extravasamento de sangue na espessura do miométrio' },
        { letter: 'H', label: 'Hipertonia', meaning: 'Útero lenhoso ("útero em tábua")', detail: 'Elevação do tônus basal e taquissistolia refratária ao relaxamento' },
        { letter: 'S', label: 'Sangramento', meaning: 'Escuro e com coágulos', detail: 'Pode ser oculto em 20% dos casos quando há hematoma retroplacentário' },
        { letter: 'F', label: 'Sofrimento Fetal', meaning: 'Desacelerações DIP 2 / Bradicardia', detail: 'Redução abrupta da área de trocas gasosas materno-fetais' },
        { letter: 'C', label: 'CIVD / Coagulação', meaning: 'Consumo maciço de fibrinogênio', detail: 'Risco de síndrome de Couvelaire (apoplexia uteroplacentária)' }
      ],
      clinicalCase: {
        vignette: 'Gestante de 36 semanas hipertensa dá entrada com dor em baixo ventre de início abrupto há 40 min, útero espasmódico doloroso e sangramento escuro moderado. BCF = 95 bpm. Qual a conduta?',
        answer: 'Amniotomia imediata e cesariana de emergência por Descolamento Prematuro de Placenta com feto vivo em sofrimento.',
        explanation: 'A tríade de dor intensa, hipertonia uterina e sangramento escuro confirma DPP. Havendo feto vivo e bradicardia fetal sustentada (< 110 bpm), a conduta prioritária é interromper a gestação pela via mais rápida (cesariana imediata com amniotomia de alívio).'
      }
    },
    preventiva: {
      title: 'Princípios do SUS: Doutrinários vs Organizativos',
      theme: 'Legislação e História do SUS • Lei 8.080/90 e CF/88',
      acronym: 'U-I-E',
      letters: ['U', 'I', 'E'],
      content: 'Doutrinários (U-I-E): Universalidade • Integralidade • Equidade / Organizativos: Descentralização • Regionalização • Hierarquização • Participação Popular',
      rule: 'Doutrinários refletem a filosofia e os valores éticos constitucionais (U-I-E) • Organizativos definem a operação e arquitetura prática do sistema',
      clinicalApplication: 'Pilar estruturante de todas as políticas públicas de saúde no Brasil, norteando a Rede de Atenção à Saúde (RAS) e a formulação de linhas de cuidado prioritárias na Atenção Primária.',
      bancaTrap: 'Pegadinha Número 1 de Medicina Preventiva: A banca troca "Equidade" por "Igualdade". No SUS, o princípio é EQUIDADE (tratar de forma desigual os desiguais, direcionando mais recursos aos mais vulneráveis). Tratar todos igualmente perpetua as disparidades sociais. Segunda pegadinha: confundir princípio doutrinário com organizativo.',
      examFrequency: 'Tema mais cobrado em toda a Medicina Preventiva (~94% das provas)',
      practiceQuery: {
        specialty: 'Medicina Preventiva e Social',
        tema: 'Atenção Primária à Saúde',
        search: 'Saúde da Família'
      },
      breakdown: [
        { letter: 'U', label: 'Universalidade', meaning: 'Acesso à saúde como direito de todos e dever do Estado', detail: 'Sem exigência de contribuição previdenciária, nacionalidade ou vínculo empregatício formal' },
        { letter: 'I', label: 'Integralidade', meaning: 'Cuidado contínuo, biopsicossocial e em todos os níveis', detail: 'Articulação simultânea de ações promocionais, preventivas, curativas e reabilitadoras' },
        { letter: 'E', label: 'Equidade', meaning: 'Justiça distributiva: atender mais a quem mais necessita', detail: 'Redução de disparidades mediante alocação diferencial de serviços às populações de maior risco' }
      ],
      clinicalCase: {
        vignette: 'Em um município, a gestão de saúde implementou um programa de visitas domiciliares semanais exclusivo para comunidades ribeirinhas isoladas com alta taxa de mortalidade infantil. Qual princípio fundamenta a medida?',
        answer: 'Princípio Doutrinário da Equidade.',
        explanation: 'A concessão de mais atenção e recursos específicos para a população em condição de maior vulnerabilidade e desvantagem exemplifica com perfeição a Equidade em saúde ("tratar desigualmente os desiguais").'
      }
    }
  };

  // Mapeamento retrocompatível padrão-ouro
  const MNEMONICS_MAP: Record<string, { title: string; content: string; rule: string }> = Object.entries(DETAILED_MNEMONICS_MAP).reduce(
    (acc, [key, val]) => {
      acc[key] = { title: val.title, content: val.content, rule: val.rule };
      return acc;
    },
    {} as Record<string, { title: string; content: string; rule: string }>
  );

  // 1. Subtemas críticos da especialidade recomendada
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

  // Interface para Itens da Linha do Tempo da Agenda
  interface DailyScheduleSlot {
    id: string;
    title: string;
    category: 'estudo' | 'hospital' | 'revisao' | 'pausa' | 'flashcard' | 'simulado';
    startTime: string;
    endTime: string;
    startMinutes: number;
    endMinutes: number;
    source: 'google' | 'plataforma';
    description: string;
    location?: string;
    action?: 'treinar' | 'caderno_erros' | 'flashcards' | 'mnemonico' | 'simulado';
  }

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

  const [calendarSyncMode, setCalendarSyncMode] = useState<'ical' | 'api'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('bancoresidencia_google_calendar_mode') as any) || 'ical';
    }
    return 'ical';
  });

  const [googleAccessToken, setGoogleAccessToken] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bancoresidencia_google_access_token') || '';
    }
    return '';
  });

  const DEFAULT_GOOGLE_CLIENT_ID = '323022146503-csbd1pq8s2g22l3mghaaea4kocl2acfn.apps.googleusercontent.com';

  const [googleClientId, setGoogleClientId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bancoresidencia_google_client_id') || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;
    }
    return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;
  });

  const [showAdvancedClientId, setShowAdvancedClientId] = useState(false);

  const [exportingSlotId, setExportingSlotId] = useState<string | null>(null);

  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [calendarSyncError, setCalendarSyncError] = useState<string | null>(null);
  const [calendarSyncSuccessMsg, setCalendarSyncSuccessMsg] = useState<string | null>(null);

  // ── Captura o access_token após redirect OAuth do Google ──────────────────
  useEffect(() => {
    // Verifica se retornou de um redirect OAuth do Google com token no hash
    const tokenFromHash = extractGoogleTokenFromUrlHash();
    if (tokenFromHash) {
      // Token capturado! Inicia sincronização automática
      setGoogleAccessToken(tokenFromHash);
      setCalendarSyncMode('api');
      if (typeof window !== 'undefined') {
        localStorage.setItem('bancoresidencia_google_access_token', tokenFromHash);
        localStorage.setItem('bancoresidencia_google_calendar_mode', 'api');
        localStorage.setItem('bancoresidencia_google_calendar_connected', 'true');
      }
      setIsSyncingCalendar(true);
      setCalendarSyncError(null);
      fetchTodayEventsFromGoogleApi(tokenFromHash)
        .then((events) => {
          setRealCalendarEvents(events as any);
          const nowStr = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
          setLastCalendarSyncTime(nowStr);
          setIsGoogleCalendarConnected(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem('bancoresidencia_real_calendar_events', JSON.stringify(events));
            localStorage.setItem('bancoresidencia_google_last_sync', nowStr);
          }
          const msg = events.length > 0
            ? `${events.length} evento(s) sincronizados via Google Calendar!`
            : 'Conectado via Google Calendar! Nenhum evento para hoje.';
          setCalendarSyncSuccessMsg(msg);
        })
        .catch((err) => {
          setCalendarSyncError(err?.message || 'Falha ao buscar eventos do Google Calendar.');
        })
        .finally(() => {
          setIsSyncingCalendar(false);
        });
      return;
    }

    // Verifica se há erro de OAuth retornado via query param
    const authError = extractGoogleAuthErrorFromUrl();
    if (authError) {
      setCalendarSyncError(authError);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // ─────────────────────────────────────────────────────────────────────────

  const syncIcalEvents = async (urlToSync?: string): Promise<boolean> => {
    const targetUrl = (urlToSync !== undefined ? urlToSync : googleIcalUrl).trim();
    if (!targetUrl) {
      setCalendarSyncError('Por favor, cole o Endereço Secreto iCal (.ics) da sua agenda.');
      return false;
    }

    setIsSyncingCalendar(true);
    setCalendarSyncError(null);
    setCalendarSyncSuccessMsg(null);

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
        if (data.calendarName) {
          localStorage.setItem('bancoresidencia_google_calendar_account', data.calendarName);
        }
      }

      if (events.length > 0) {
        setCalendarSyncSuccessMsg(`${events.length} compromisso(s) sincronizado(s) para hoje!`);
      } else {
        setCalendarSyncSuccessMsg('Agenda conectada com sucesso! Nenhum compromisso agendado para hoje (rotina livre para estudos).');
      }
      return true;
    } catch (err: any) {
      const msg = err?.name === 'TimeoutError'
        ? 'Tempo limite esgotado ao acessar o link. Verifique a URL.'
        : (err?.message || 'Falha ao sincronizar agenda.');
      setCalendarSyncError(msg);
      return false;
    } finally {
      setIsSyncingCalendar(false);
    }
  };

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

  const handleConnectGoogleViaApi = async () => {
    const cId = (googleClientId || '').trim();
    if (!cId) {
      setCalendarSyncError('Informe um Google Client ID válido para conectar via Google API.');
      return;
    }

    setIsSyncingCalendar(true);
    setCalendarSyncError(null);
    setCalendarSyncSuccessMsg(null);

    try {
      // Usa fluxo de REDIRECIONAMENTO (sem popup) — funciona em produção Vercel
      // O Google redireciona de volta para /api/auth/google/callback?code=...
      // que por sua vez redireciona para /#google_access_token=...
      await startGoogleOAuthRedirect(cId);
      // startGoogleOAuthRedirect redireciona o navegador — código abaixo não executa normalmente
    } catch (err: any) {
      // Fallback: se redirect falhar por algum motivo, tenta popup
      setCalendarSyncError(null);
      requestGoogleCalendarAccessToken(
        cId,
        async (accessToken) => {
          try {
            setGoogleAccessToken(accessToken);
            if (typeof window !== 'undefined') {
              localStorage.setItem('bancoresidencia_google_access_token', accessToken);
              localStorage.setItem('bancoresidencia_google_client_id', cId);
              localStorage.setItem('bancoresidencia_google_calendar_mode', 'api');
            }

            const events = await fetchTodayEventsFromGoogleApi(accessToken);
            setRealCalendarEvents(events as any);
            const nowStr = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
            setLastCalendarSyncTime(nowStr);
            setIsGoogleCalendarConnected(true);
            setCalendarSyncMode('api');

            if (typeof window !== 'undefined') {
              localStorage.setItem('bancoresidencia_google_calendar_connected', 'true');
              localStorage.setItem('bancoresidencia_real_calendar_events', JSON.stringify(events));
              localStorage.setItem('bancoresidencia_google_last_sync', nowStr);
            }

            if (events.length > 0) {
              setCalendarSyncSuccessMsg(`${events.length} evento(s) sincronizados via Google Calendar API!`);
            } else {
              setCalendarSyncSuccessMsg('Conectado via Google API! Nenhum evento para hoje (rotina livre de estudos).');
            }
            setIsGoogleModalOpen(false);
          } catch (fetchErr: any) {
            setCalendarSyncError(fetchErr?.message || 'Falha ao buscar eventos da Google Calendar API.');
          } finally {
            setIsSyncingCalendar(false);
          }
        },
        (oauthErr) => {
          setIsSyncingCalendar(false);
          setCalendarSyncError(oauthErr?.message || oauthErr?.error || 'Autorização Google cancelada ou recusada.');
        }
      );
    }
  };

  const handleDisconnectGoogleCalendar = () => {
    setIsGoogleCalendarConnected(false);
    setRealCalendarEvents([]);
    setGoogleIcalUrl('');
    setGoogleAccessToken('');
    setCalendarSyncError(null);
    setCalendarSyncSuccessMsg(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bancoresidencia_google_calendar_connected', 'false');
      localStorage.removeItem('bancoresidencia_google_ical_url');
      localStorage.removeItem('bancoresidencia_google_access_token');
      localStorage.removeItem('bancoresidencia_real_calendar_events');
    }
  };

  const handleSyncNow = async () => {
    if (calendarSyncMode === 'api' && googleAccessToken) {
      setIsSyncingCalendar(true);
      try {
        const events = await fetchTodayEventsFromGoogleApi(googleAccessToken);
        setRealCalendarEvents(events as any);
        const nowStr = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        setLastCalendarSyncTime(nowStr);
        if (typeof window !== 'undefined') {
          localStorage.setItem('bancoresidencia_real_calendar_events', JSON.stringify(events));
          localStorage.setItem('bancoresidencia_google_last_sync', nowStr);
        }
      } catch {
        if (googleIcalUrl.trim()) {
          await syncIcalEvents(googleIcalUrl);
        }
      } finally {
        setIsSyncingCalendar(false);
      }
    } else if (googleIcalUrl.trim()) {
      await syncIcalEvents(googleIcalUrl);
    } else {
      const nowStr = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      setLastCalendarSyncTime(nowStr);
      if (typeof window !== 'undefined') {
        localStorage.setItem('bancoresidencia_google_last_sync', nowStr);
      }
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
          description: slot.description,
          location: slot.location
        });
        setCalendarSyncSuccessMsg(`Bloco "${slot.title}" adicionado ao seu Google Agenda!`);
      } else {
        const templateUrl = buildGoogleCalendarTemplateUrl({
          title: slot.title,
          startTime: slot.startTime,
          endTime: slot.endTime,
          description: slot.description,
          location: slot.location
        });
        window.open(templateUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      const templateUrl = buildGoogleCalendarTemplateUrl({
        title: slot.title,
        startTime: slot.startTime,
        endTime: slot.endTime,
        description: slot.description,
        location: slot.location
      });
      window.open(templateUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setTimeout(() => setExportingSlotId(null), 1000);
    }
  };

  // Cronograma diário adaptado ao design da plataforma (sincronizado com Google Agenda quando conectado)
  const daySchedule = React.useMemo<DailyScheduleSlot[]>(() => {
    const areaName = recommendedArea?.label || 'Cirurgia Geral';

    if (isGoogleCalendarConnected) {
      // 1. Se existirem eventos reais sincronizados do Google Agenda via iCal:
      if (realCalendarEvents.length > 0) {
        const slots: DailyScheduleSlot[] = [...realCalendarEvents];

        // Completa com blocos de estudo da plataforma nos intervalos
        const hasAfternoon = slots.some((s) => s.startMinutes >= 840 && s.endMinutes <= 1080);
        if (!hasAfternoon) {
          slots.push({
            id: 'auto_estudo_tarde',
            title: `Treino de Questões: ${areaName}`,
            category: 'estudo',
            startTime: '14:00',
            endTime: '15:30',
            startMinutes: 840,
            endMinutes: 930,
            source: 'plataforma',
            description: 'Treino de alta densidade adaptado aos intervalos do dia',
            action: 'treinar'
          });
          slots.push({
            id: 'auto_flashcards_tarde',
            title: 'Revisão de Flashcards FSRS',
            category: 'flashcard',
            startTime: '15:45',
            endTime: '16:45',
            startMinutes: 945,
            endMinutes: 1005,
            source: 'plataforma',
            description: 'Fixação rápida espaçada',
            action: 'flashcards'
          });
        }

        const hasNight = slots.some((s) => s.startMinutes >= 1200);
        if (!hasNight) {
          slots.push({
            id: 'auto_revisao_noite',
            title: 'Caderno de Erros & Pílula Clínica',
            category: 'revisao',
            startTime: '20:30',
            endTime: '21:30',
            startMinutes: 1230,
            endMinutes: 1290,
            source: 'plataforma',
            description: 'Reteste metacognitivo de pontos fracos e mnemônicos',
            action: 'caderno_erros'
          });
        }

        slots.sort((a, b) => a.startMinutes - b.startMinutes);
        return slots;
      }

      if (googleRoutinePreset === 'plantao') {
        return [
          {
            id: 'plantao_1',
            title: 'Plantão 12h: Pronto-Socorro / Emergência',
            category: 'hospital',
            startTime: '07:00',
            endTime: '19:00',
            startMinutes: 420,
            endMinutes: 1140,
            source: 'google',
            location: 'Hospital de Emergência • Sala Vermelha',
            description: 'Atendimentos de urgência, estabilização e intercorrências clínicas'
          },
          {
            id: 'pos_plantao_pausa',
            title: 'Jantar & Descompressão Pós-Plantão',
            category: 'pausa',
            startTime: '19:00',
            endTime: '20:15',
            startMinutes: 1140,
            endMinutes: 1215,
            source: 'google',
            location: 'Casa',
            description: 'Refeição, banho e relaxamento pós-plantão'
          },
          {
            id: 'plantao_treino',
            title: `Blitz de Questões: ${areaName}`,
            category: 'estudo',
            startTime: '20:15',
            endTime: '21:30',
            startMinutes: 1215,
            endMinutes: 1290,
            source: 'plataforma',
            description: 'Treino de alta densidade pós-plantão (15 questões comentadas)',
            action: 'treinar'
          },
          {
            id: 'plantao_flashcards',
            title: 'Revisão de Flashcards FSRS & Mnemônico',
            category: 'flashcard',
            startTime: '21:30',
            endTime: '22:15',
            startMinutes: 1290,
            endMinutes: 1335,
            source: 'plataforma',
            description: 'Fixação rápida espaçada antes do repouso noturno',
            action: 'flashcards'
          }
        ];
      }

      if (googleRoutinePreset === 'estudos') {
        return [
          {
            id: 'estudo_bloco1',
            title: `Treino Principal: Questões de ${areaName}`,
            category: 'estudo',
            startTime: '08:00',
            endTime: '10:30',
            startMinutes: 480,
            endMinutes: 630,
            source: 'plataforma',
            description: 'Meta matinal: 30 questões com modelo psicométrico TRI',
            action: 'treinar'
          },
          {
            id: 'estudo_erros',
            title: 'Caderno de Erros (Reteste Metacognitivo)',
            category: 'revisao',
            startTime: '10:45',
            endTime: '12:00',
            startMinutes: 645,
            endMinutes: 720,
            source: 'plataforma',
            description: 'Eliminação ativa de pontos cegos e pegadinhas',
            action: 'caderno_erros'
          },
          {
            id: 'estudo_almoco',
            title: 'Almoço & Pausa Cognitiva',
            category: 'pausa',
            startTime: '12:00',
            endTime: '13:30',
            startMinutes: 720,
            endMinutes: 810,
            source: 'google',
            description: 'Intervalo programado da agenda'
          },
          {
            id: 'estudo_simulado',
            title: `Simulado Oficial de Prova (${targetExamName || 'ENARE'})`,
            category: 'simulado',
            startTime: '13:30',
            endTime: '15:30',
            startMinutes: 810,
            endMinutes: 930,
            source: 'plataforma',
            description: 'Simulação cronometrada com ritmo de prova',
            action: 'simulado'
          },
          {
            id: 'estudo_flashcards',
            title: 'Revisão de Flashcards FSRS',
            category: 'flashcard',
            startTime: '15:45',
            endTime: '17:00',
            startMinutes: 945,
            endMinutes: 1020,
            source: 'plataforma',
            description: 'Baralho do dia com repetição espaçada',
            action: 'flashcards'
          },
          {
            id: 'estudo_pilula',
            title: 'Pílula Clínica do Dia & Critérios',
            category: 'revisao',
            startTime: '17:15',
            endTime: '18:00',
            startMinutes: 1035,
            endMinutes: 1080,
            source: 'plataforma',
            description: 'Raciocínio diagnóstico e pegadinhas da banca',
            action: 'mnemonico'
          },
          {
            id: 'estudo_academia',
            title: 'Compromisso Pessoal / Academia',
            category: 'hospital',
            startTime: '18:30',
            endTime: '20:00',
            startMinutes: 1110,
            endMinutes: 1200,
            source: 'google',
            description: 'Atividade física sincronizada da agenda pessoal'
          },
          {
            id: 'estudo_fechamento',
            title: 'Fechamento do Dia & Metas',
            category: 'revisao',
            startTime: '20:30',
            endTime: '21:30',
            startMinutes: 1230,
            endMinutes: 1290,
            source: 'plataforma',
            description: 'Balanço de aproveitamento e revisão final'
          }
        ];
      }

      // Default: 'internato'
      return [
        {
          id: 'internato_manha',
          title: 'Internato: Enfermaria & Discussão Clínica',
          category: 'hospital',
          startTime: '07:30',
          endTime: '12:30',
          startMinutes: 450,
          endMinutes: 750,
          source: 'google',
          location: 'Hospital das Clínicas • 4º andar',
          description: 'Evolução de leitos, round e discussão com a preceptoria'
        },
        {
          id: 'internato_almoco',
          title: 'Almoço & Descanso',
          category: 'pausa',
          startTime: '12:30',
          endTime: '13:45',
          startMinutes: 750,
          endMinutes: 825,
          source: 'google',
          description: 'Pausa programada • Hidratação e descanso mental'
        },
        {
          id: 'internato_treino',
          title: `Treino de Questões: ${areaName}`,
          category: 'estudo',
          startTime: '14:00',
          endTime: '16:00',
          startMinutes: 840,
          endMinutes: 960,
          source: 'plataforma',
          description: 'Meta prioritária: 20 questões comentadas com calibração TRI',
          action: 'treinar'
        },
        {
          id: 'internato_erros',
          title: 'Caderno de Erros (Reteste Metacognitivo)',
          category: 'revisao',
          startTime: '16:15',
          endTime: '17:30',
          startMinutes: 975,
          endMinutes: 1050,
          source: 'plataforma',
          description: 'Reteste de erros e fixação de lacunas cognitivas',
          action: 'caderno_erros'
        },
        {
          id: 'internato_flashcards',
          title: 'Revisão de Flashcards FSRS & Mnemônico',
          category: 'flashcard',
          startTime: '17:45',
          endTime: '18:45',
          startMinutes: 1065,
          endMinutes: 1125,
          source: 'plataforma',
          description: 'Fixação rápida com algoritmo espaçado FSRS',
          action: 'flashcards'
        },
        {
          id: 'internato_treino_fisico',
          title: 'Atividade Física / Descompressão',
          category: 'hospital',
          startTime: '19:00',
          endTime: '20:15',
          startMinutes: 1140,
          endMinutes: 1215,
          source: 'google',
          description: 'Treino e relaxamento sincronizado da agenda pessoal'
        },
        {
          id: 'internato_simulado',
          title: 'Simulado Expresso TRI (Blitz 10Q)',
          category: 'simulado',
          startTime: '20:30',
          endTime: '21:30',
          startMinutes: 1230,
          endMinutes: 1290,
          source: 'plataforma',
          description: '10 questões calibradas sob pressão de tempo (~12 min)',
          action: 'simulado'
        },
        {
          id: 'internato_consolidacao',
          title: 'Consolidação Noturna & Pílula do Dia',
          category: 'revisao',
          startTime: '21:45',
          endTime: '22:30',
          startMinutes: 1305,
          endMinutes: 1350,
          source: 'plataforma',
          description: 'Fechamento do cronograma e mnemônico do dia',
          action: 'mnemonico'
        }
      ];
    }

    // Cronograma padrão (não conectado ao Google Agenda)
    return [
      {
        id: 'padrao_treino',
        title: `Treino de Questões: ${areaName}`,
        category: 'estudo',
        startTime: '08:30',
        endTime: '10:30',
        startMinutes: 510,
        endMinutes: 630,
        source: 'plataforma',
        description: 'Revisão direcionada e resolução ativa de questões',
        action: 'treinar'
      },
      {
        id: 'padrao_erros',
        title: 'Caderno de Erros - Reteste Metacognitivo',
        category: 'revisao',
        startTime: '10:45',
        endTime: '12:00',
        startMinutes: 645,
        endMinutes: 720,
        source: 'plataforma',
        description: 'Eliminar pontos cegos e lacunas conceituais',
        action: 'caderno_erros'
      },
      {
        id: 'padrao_flashcards',
        title: 'Revisão de Flashcards FSRS',
        category: 'flashcard',
        startTime: '14:00',
        endTime: '15:30',
        startMinutes: 840,
        endMinutes: 930,
        source: 'plataforma',
        description: 'Fixação de alto rendimento com algoritmo espaçado',
        action: 'flashcards'
      },
      {
        id: 'padrao_pilula',
        title: 'Fixação da Pílula Clínica do Dia',
        category: 'revisao',
        startTime: '16:00',
        endTime: '17:00',
        startMinutes: 960,
        endMinutes: 1020,
        source: 'plataforma',
        description: 'Critérios diagnósticos e pegadinhas de prova',
        action: 'mnemonico'
      },
      {
        id: 'padrao_simulado',
        title: 'Simulado Expresso TRI (Blitz 10Q)',
        category: 'simulado',
        startTime: '19:30',
        endTime: '20:30',
        startMinutes: 1170,
        endMinutes: 1230,
        source: 'plataforma',
        description: 'Treino sob pressão de tempo (~12 min)',
        action: 'simulado'
      }
    ];
  }, [recommendedArea, isGoogleCalendarConnected, googleRoutinePreset, targetExamName, realCalendarEvents]);

  // Cálculo da Atividade Específica para AQUELE Período de Tempo
  const currentPeriodInfo = React.useMemo(() => {
    const now = new Date();
    const currentMinutes = simulatedHour !== null
      ? (simulatedHour * 60 + 15)
      : (now.getHours() * 60 + now.getMinutes());

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

      const dateKey = targetDate.toISOString().slice(0, 10);
      const matchHistory = (stats.historyByDay || []).find((h) => h.date && h.date.startsWith(dateKey));

      const answered = isToday
        ? todayAnswered
        : (matchHistory ? matchHistory.answered : 0);

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
  }, [stats.historyByDay, todayAnswered, dailyGoal]);

  const [selectedAreaId, setSelectedAreaId] = useState<string>('geral');
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);
  const [isPieAnimationDone, setIsPieAnimationDone] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPieAnimationDone(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
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
        bgLight: 'bg-slate-500/10',
        textClass: 'text-slate-600 dark:text-zinc-400',
        borderClass: 'border-slate-500/20',
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

    const totalDays = Math.max(1, Math.min(185, Math.round((endDateTs - startDateTs) / 86400000) + 1));
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

  // Índice do card central e direção da transição no carrossel de Acesso Rápido
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  const userPercentile = stats.percentileInfo?.percentile;

  // Cartões do Carrossel de Acesso Rápido com Seleção Central (sem redundâncias de texto)
  const quickNavCards = React.useMemo(() => [
    {
      tab: 'banco',
      title: 'Questões',
      subtitle: 'Banco de questões com filtros inteligentes',
      icon: FileQuestion
    },
    {
      tab: 'resumos',
      title: 'Resumos',
      subtitle: 'Diretrizes oficiais e sínteses clínicas',
      icon: BookOpen
    },
    {
      tab: 'listas',
      title: 'Cadernos',
      subtitle: allLists && allLists.length > 0 ? `${allLists.length} cadernos salvos para revisão` : 'Listas e cadernos de estudo',
      icon: ListFilter,
      countBadge: allLists && allLists.length > 0 ? allLists.length : null
    },
    {
      tab: 'simulados',
      title: 'Simulados',
      subtitle: 'Provas cronometradas com TRI oficial',
      icon: FileCheck2
    },
    {
      tab: 'stats',
      title: 'Desempenho',
      subtitle: stats.totalAnswered > 0 ? `${Math.round(stats.accuracyRate)}% de acerto geral` : 'Métricas e proficiência TRI',
      icon: BarChart2
    },
    {
      tab: 'ranking',
      title: 'Ranking',
      subtitle: (!isPercentileCalibrating && userPercentile != null)
        ? `Top ${Math.max(1, 100 - Math.round(userPercentile))}% na classificação`
        : 'Classificação geral dos candidatos',
      icon: Trophy
    }
  ], [allLists, stats.totalAnswered, stats.accuracyRate, userPercentile, isPercentileCalibrating]);

  const handlePrevCard = () => {
    setSlideDirection('left');
    setCarouselIndex((prev) => (prev - 1 + quickNavCards.length) % quickNavCards.length);
  };

  const handleNextCard = () => {
    setSlideDirection('right');
    setCarouselIndex((prev) => (prev + 1) % quickNavCards.length);
  };

  // Navegação suave com as setas do teclado (ArrowLeft / ArrowRight), Enter e números silenciosos
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar se estiver digitando em campo de input, textarea ou select
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSlideDirection('left');
        setCarouselIndex((prev) => (prev - 1 + quickNavCards.length) % quickNavCards.length);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSlideDirection('right');
        setCarouselIndex((prev) => (prev + 1) % quickNavCards.length);
        return;
      }
      if (e.key === 'Enter') {
        const activeCard = quickNavCards[carouselIndex];
        if (activeCard) {
          onNavigate(activeCard.tab as ActiveTab);
        }
        return;
      }
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= quickNavCards.length) {
        e.preventDefault();
        const targetIndex = keyNum - 1;
        setSlideDirection(targetIndex >= carouselIndex ? 'right' : 'left');
        setCarouselIndex(targetIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickNavCards, carouselIndex, onNavigate]);

  return (
    <div
      className="space-y-4 sm:space-y-5"
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
      {/* Barra Flutuante de Personalização Estilo Figma */}
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

      {/* Grid Principal Reorganizável Estilo Figma */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 auto-rows-min grid-flow-dense">
        {visibleCards.map((cardConfig) => {
          if (cardConfig.id === 'home_hero') {
            return (
              <FigmaCardWrapper
                key={cardConfig.id}
                config={cardConfig}
                isCustomizing={isCustomizing}
                isSelected={selectedCardId === cardConfig.id}
                onSelect={(id) => setSelectedCardId(id)}
                onUpdateColSpan={updateColSpan}
                onUpdateHeight={updateCardHeight}
                onUpdateSettings={updateCardSettings}
                onMoveCard={moveCard}
                onToggleVisibility={toggleVisibility}
                onReorder={reorderCard}
              >
                <section className="relative overflow-hidden bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs">
                  <div
                    className="absolute -right-16 -top-16 w-60 h-60 rounded-full blur-3xl opacity-10 pointer-events-none"
                    style={{ backgroundColor: accentConfig.primaryHex }}
                  />

                  <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                        <GreetingIcon className={`w-3.5 h-3.5 ${greeting.color}`} />
                        <span>{greeting.text}</span>
                        <span>•</span>
                        <span>{modalidade}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                        <h1 className="font-heading text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                          {studentName}
                        </h1>

                        {plan !== 'free' ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                            Pro
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                            Free
                          </span>
                        )}

                        {plan === 'free' && (
                          <button
                            type="button"
                            onClick={() => openUpgradeModal()}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black text-white shadow-xs hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                            style={{
                              backgroundColor: accentConfig.primaryHex
                            }}
                            title="Liberar questões ilimitadas, métricas TRI e gabaritos completos"
                          >
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            <span>Liberar Ilimitado</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                      {/* Prova Alvo */}
                      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: accentConfig.timeAccent.bgRgba,
                            color: accentConfig.timeAccent.hex
                          }}
                        >
                          <CalendarDays className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div
                            className="text-xs sm:text-sm font-bold font-sans tracking-tight leading-none"
                            style={{ color: accentConfig.timeAccent.hex }}
                          >
                            {targetDaysLeft === 1 ? '1 dia' : `${targetDaysLeft} dias`}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium truncate max-w-[120px]" title={targetExamName}>
                            p/ {targetExamName}
                          </div>
                        </div>
                      </div>


                      {/* Botão Personalizar Painel Estilo Figma */}
                      <button
                        type="button"
                        onClick={() => setIsCustomizing((prev) => !prev)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-xs ${isCustomizing
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md scale-105'
                            : 'bg-slate-50 dark:bg-zinc-900/60 border-slate-200/70 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400'
                          }`}
                        title="Personalizar disposição e tamanho dos cards estilo Figma"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-bold hidden md:inline">
                          {isCustomizing ? 'Editando' : 'Personalizar'}
                        </span>
                      </button>

                      {/* Constância */}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: accentConfig.energyAccent.bgRgba,
                            color: accentConfig.energyAccent.hex
                          }}
                        >
                          <Flame className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <div>
                          <div
                            className="text-xs sm:text-sm font-bold font-sans tracking-tight leading-none"
                            style={{ color: accentConfig.energyAccent.hex }}
                          >
                            {stats.streakDays} {stats.streakDays === 1 ? 'dia' : 'dias'}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                            de ofensiva
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VISÃO EXPANDIDA ADAPTATIVA: Calendário Oficial de Provas & Ofensiva Semanal */}
                  {((cardConfig.customHeight && cardConfig.customHeight >= 150) || cardConfig.colSpan >= 8) && (
                    <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs animate-in fade-in duration-200">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prazos Oficiais:</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-300">
                            <strong>UNICAMP:</strong> 18 dias
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-300">
                            <strong>USP-SP:</strong> 32 dias
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-300">
                            <strong>ENARE:</strong> 45 dias
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Ritmo Semanal: <strong>180 Questões / sem</strong> (88% concluído)</span>
                      </div>
                    </div>
                  )}
                </section>
              </FigmaCardWrapper>
            );
          }
          if (cardConfig.id === 'home_meta_diaria') {
            return (
              <FigmaCardWrapper
                key={cardConfig.id}
                config={cardConfig}
                isCustomizing={isCustomizing}
                isSelected={selectedCardId === cardConfig.id}
                onSelect={(id) => setSelectedCardId(id)}
                onUpdateColSpan={updateColSpan}
                onUpdateHeight={updateCardHeight}
                onUpdateSettings={updateCardSettings}
                onMoveCard={moveCard}
                onToggleVisibility={toggleVisibility}
                onReorder={reorderCard}
              >
                {/* Card 1: Metas Diárias */}
                <div className="bento-card bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-0 h-full space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs border border-zinc-200/60 dark:border-zinc-800/80"
                          style={{ backgroundColor: accentConfig.bgRgba, color: accentConfig.primaryHex }}
                        >
                          <Target className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                          Metas Diárias
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleToggleEditGoals}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Ajustar metas de questões e tempo"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        <span>{isEditingGoals ? 'Fechar' : 'Ajustar'}</span>
                      </button>
                    </div>

                    {isEditingGoals ? (
                      <form onSubmit={handleSaveCustomGoals} className="pt-2.5 space-y-2 animate-in fade-in duration-150">
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
                          <button
                            type="submit"
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-90 cursor-pointer"
                            style={{ backgroundColor: accentConfig.primaryHex }}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Salvar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingGoals(false)}
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="pt-3 grid grid-cols-2 gap-3 divide-x divide-zinc-100 dark:divide-zinc-800/80">
                        <div className="pr-1 space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1">
                              <Target className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
                              Questões
                            </span>
                            <span className="font-sans font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                              {todayAnswered}/{dailyGoal}
                            </span>
                          </div>
                          <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-200/60 dark:border-zinc-800">
                            <div
                              className="h-2 rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${goalPercentage}%`,
                                backgroundColor: accentConfig.primaryHex
                              }}
                            />
                          </div>
                        </div>

                        <div className="pl-3 space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
                              Tempo
                            </span>
                            <span className="font-sans font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                              {todayStudyMinutes}m/{dailyTimeGoal}m
                            </span>
                          </div>
                          <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-200/60 dark:border-zinc-800">
                            <div
                              className="h-2 rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${timeGoalPercentage}%`,
                                backgroundColor: accentConfig.primaryHex
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* VISÃO EXPANDIDA ADAPTATIVA: Sessões Programadas do Dia */}
                    {((cardConfig.customHeight && cardConfig.customHeight >= 220) || cardConfig.colSpan >= 6) && (
                      <div className="pt-2.5 space-y-1.5 border-t border-zinc-100 dark:border-zinc-800/80 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-zinc-700 dark:text-zinc-300">Sessões Programadas</span>
                          <span className="text-[10px] text-zinc-400">Ciclo Diário</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
                            <span className="text-zinc-500">Bloco Manhã</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{Math.min(todayAnswered, Math.round(dailyGoal / 2))}/{Math.round(dailyGoal / 2)} Q</span>
                          </div>
                          <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
                            <span className="text-zinc-500">Bloco Tarde</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400">{Math.max(0, todayAnswered - Math.round(dailyGoal / 2))}/{Math.round(dailyGoal / 2)} Q</span>
                          </div>
                        </div>

                        {/* VISÃO HIPER-EXPANDIDA (Altura >= 270px): Velocímetro & Meta Semanal */}
                        {((cardConfig.customHeight && cardConfig.customHeight >= 270) || (cardConfig.colSpan >= 6 && cardConfig.customHeight && cardConfig.customHeight >= 240)) && (
                          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3 text-blue-500" />
                              Ritmo: <strong>1m 48s / questão</strong>
                            </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              Semana: 142/210 Q (68%)
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2.5 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/80">
                    <span className="text-[11px] font-medium">Conclusão diária</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 font-sans text-xs">
                      {Math.round((goalPercentage + timeGoalPercentage) / 2)}%
                    </span>
                  </div>
                </div>
              </FigmaCardWrapper>
            );
          }
          if (cardConfig.id === 'home_aproveitamento') {
            return (
              <FigmaCardWrapper
                key={cardConfig.id}
                config={cardConfig}
                isCustomizing={isCustomizing}
                isSelected={selectedCardId === cardConfig.id}
                onSelect={(id) => setSelectedCardId(id)}
                onUpdateColSpan={updateColSpan}
                onUpdateHeight={updateCardHeight}
                onUpdateSettings={updateCardSettings}
                onMoveCard={moveCard}
                onToggleVisibility={toggleVisibility}
                onReorder={reorderCard}
              >
                {/* Card 2: Aproveitamento com Seletor Interativo e Mini Sparkline com Tooltips */}
                <div className="bento-card bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-0 h-full space-y-3.5">
                  <div>
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
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                          Aproveitamento
                        </span>
                      </div>

                      {/* Seletor Interativo de Período (Pill Control) */}
                      <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/90 p-0.5 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60">
                        <button
                          type="button"
                          onClick={() => setAccuracyPeriod('geral')}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${accuracyPeriod === 'geral'
                            ? 'bg-white dark:bg-zinc-700 shadow-2xs'
                            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                            }`}
                          style={accuracyPeriod === 'geral' ? { color: accentConfig.primaryHex } : undefined}
                        >
                          Geral
                        </button>
                        <button
                          type="button"
                          onClick={() => setAccuracyPeriod('7d')}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${accuracyPeriod === '7d'
                            ? 'bg-white dark:bg-zinc-700 shadow-2xs'
                            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                            }`}
                          style={accuracyPeriod === '7d' ? { color: accentConfig.primaryHex } : undefined}
                        >
                          7 Dias
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span
                          className="text-2xl sm:text-3xl font-black font-sans tracking-tight"
                          style={{ color: accentConfig.primaryHex }}
                        >
                          {periodStats.answered > 0 ? `${animatedAccuracy.toFixed(1)}%` : '0.0%'}
                        </span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">acertos</span>
                      </div>

                      {/* Mini Sparkline dos últimos 5 dias com Tooltip Interativo */}
                      {recentDailyAccuracy.length > 0 && (
                        <div
                          className="flex items-end gap-1.5 h-7 shrink-0 px-1 py-0.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                          onClick={() => onNavigate('stats')}
                          title="Clique para ver estatísticas detalhadas"
                        >
                          {recentDailyAccuracy.map((d, i) => {
                            const dateLabel = i === recentDailyAccuracy.length - 1
                              ? 'Hoje'
                              : i === recentDailyAccuracy.length - 2
                                ? 'Ontem'
                                : d.date.split('-').slice(1).reverse().join('/');
                            return (
                              <div key={i} className="relative group/bar flex flex-col items-center">
                                {/* Tooltip flutuante instantâneo */}
                                <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover/bar:flex flex-col items-center z-30 pointer-events-none">
                                  <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-semibold py-1 px-2 rounded-md shadow-md whitespace-nowrap leading-tight text-center">
                                    <span className="font-bold">{dateLabel}</span>
                                    <div className="text-[9px] opacity-80 font-normal">
                                      {d.answered > 0 ? `${d.answered} quest. • ${d.acc}%` : 'Sem questões'}
                                    </div>
                                  </div>
                                  <div className="w-1.5 h-1.5 bg-zinc-900 dark:bg-zinc-100 rotate-45 -mt-0.5" />
                                </div>

                                {/* Barra com altura proporcional e animação */}
                                <div className="w-2 sm:w-2.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-t-[3px] rounded-b-[1px] h-7 flex items-end overflow-hidden group-hover/bar:ring-1 group-hover/bar:ring-zinc-400 dark:group-hover/bar:ring-zinc-600 transition-all">
                                  <div
                                    className="w-full rounded-t-[3px] transition-all duration-300 group-hover/bar:opacity-90"
                                    style={{
                                      height: `${d.answered === 0 ? 10 : Math.max(18, d.acc)}%`,
                                      backgroundColor: d.answered === 0
                                        ? 'transparent'
                                        : (d.acc >= 75 ? '#10b981' : d.acc >= 50 ? '#f59e0b' : accentConfig.primaryHex)
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Barra de Progresso Suave */}
                    <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-200/60 dark:border-zinc-800 mt-2.5">
                      <div
                        className="h-2 rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.min(100, Math.max(0, animatedAccuracy))}%`,
                          backgroundColor: accentConfig.primaryHex
                        }}
                      />
                    </div>

                    {/* VISÃO EXPANDIDA ADAPTATIVA: Taxa por Grau de Dificuldade da Banca */}
                    {((cardConfig.customHeight && cardConfig.customHeight >= 220) || cardConfig.colSpan >= 6) && (
                      <div className="pt-2.5 space-y-1.5 border-t border-zinc-100 dark:border-zinc-800/80 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-zinc-700 dark:text-zinc-300">Desempenho por Dificuldade</span>
                          <span className="text-[10px] text-zinc-400">Modelo TRI</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex flex-col">
                            <span className="font-bold">Fáceis</span>
                            <span className="font-extrabold text-xs mt-0.5">84.2%</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex flex-col">
                            <span className="font-bold">Médias</span>
                            <span className="font-extrabold text-xs mt-0.5">67.5%</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 flex flex-col">
                            <span className="font-bold">Difíceis</span>
                            <span className="font-extrabold text-xs mt-0.5">41.8%</span>
                          </div>
                        </div>

                        {/* VISÃO HIPER-EXPANDIDA (Altura >= 270px): Nota TRI Estimada */}
                        {((cardConfig.customHeight && cardConfig.customHeight >= 270) || (cardConfig.colSpan >= 6 && cardConfig.customHeight && cardConfig.customHeight >= 240)) && (
                          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1 font-medium">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              Nota TRI Estimada: <strong className="text-zinc-800 dark:text-zinc-200">742 pts</strong>
                            </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              +48 pts vs Concorrentes
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2.5 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/80">
                    <span className="text-[11px]">
                      <strong className="font-sans font-bold text-zinc-800 dark:text-zinc-200">{periodStats.answered}</strong> {accuracyPeriod === '7d' ? 'resolvidas (7d)' : 'resolvidas'}
                    </span>
                    <span
                      className="font-bold font-sans text-xs"
                      style={{ color: accentConfig.primaryHex }}
                    >
                      {periodStats.correct} corretas
                    </span>
                  </div>
                </div>
              </FigmaCardWrapper>
            );
          }
          if (cardConfig.id === 'home_percentil') {
            return (
              <FigmaCardWrapper
                key={cardConfig.id}
                config={cardConfig}
                isCustomizing={isCustomizing}
                isSelected={selectedCardId === cardConfig.id}
                onSelect={(id) => setSelectedCardId(id)}
                onUpdateColSpan={updateColSpan}
                onUpdateHeight={updateCardHeight}
                onUpdateSettings={updateCardSettings}
                onMoveCard={moveCard}
                onToggleVisibility={toggleVisibility}
                onReorder={reorderCard}
              >
                {/* Card 3: Percentil Oficial */}
                <div
                  ref={percentileCardRef}
                  className="bento-card bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-0 h-full space-y-3.5 relative overflow-hidden transition-all duration-300 group"
                >
                  {isMedalAnimating && (
                    <div className="absolute inset-0 bg-white/75 dark:bg-black/75 backdrop-blur-[2px] pointer-events-none rounded-2xl animate-in fade-in duration-300 z-10" />
                  )}
                  <div>
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
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                          Percentil Oficial
                        </span>
                      </div>
                      {!isPercentileCalibrating ? (
                        <span
                          className="text-[10px] font-bold font-sans px-2.5 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors shadow-2xs"
                        >
                          Top {Math.max(1, 100 - (stats.percentileInfo.percentile || 0))}%
                        </span>
                      ) : (
                        <span
                          className="text-[10px] font-bold font-sans px-2 py-0.5 rounded-md border text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900"
                        >
                          {percentileTier.rangeLabel}
                        </span>
                      )}
                    </div>

                    {!isPercentileCalibrating ? (
                      <div className="pt-2 space-y-2.5">
                        <div className="flex items-baseline gap-2.5">
                          <span className="text-2xl sm:text-3xl font-black font-sans tracking-tight text-zinc-900 dark:text-zinc-100">
                            P{stats.percentileInfo.percentile}
                          </span>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 shadow-2xs"
                          >
                            Nível {percentileTier.name}
                          </span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-200/60 dark:border-zinc-800">
                          <div
                            className="h-2 rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${Math.max(5, stats.percentileInfo.percentile || 0)}%`,
                              backgroundColor: percentileTier.color
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 space-y-2.5">
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl sm:text-3xl font-black font-sans tracking-tight text-zinc-900 dark:text-zinc-100">
                              {stats.percentileInfo.missingForApprox}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">questões restantes</span>
                          </div>
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                          >
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: percentileTier.color }} />
                            Calibrando
                          </span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-200/60 dark:border-zinc-800">
                          <div
                            className="h-2 rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${Math.max(
                                5,
                                Math.min(
                                  100,
                                  Math.round(
                                    ((150 - (stats.percentileInfo.missingForApprox || 150)) / 150) * 100
                                  )
                                )
                              )}%`,
                              backgroundColor: percentileTier.color
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* VISÃO EXPANDIDA ADAPTATIVA: Curva Normal de Distribuição TRI (Gaussiana) */}
                    {((cardConfig.customHeight && cardConfig.customHeight >= 220) || cardConfig.colSpan >= 6) && (
                      <div className="pt-2 pb-1 space-y-2 border-t border-zinc-100 dark:border-zinc-800/80 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: percentileTier.color }} />
                            Curva de Distribuição TRI (Concorrência Oficial)
                          </span>
                          <span className="text-[10px] text-zinc-400">Modelo Normal P1 - P99</span>
                        </div>

                        {/* Gráfico Vetorial da Gaussiana com Ponto do Aluno */}
                        <div className="relative w-full h-24 bg-zinc-50/60 dark:bg-zinc-900/40 rounded-xl p-2 border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden">
                          <svg viewBox="0 0 320 80" className="w-full h-full overflow-visible">
                            <defs>
                              <linearGradient id={`triGradient-${cardConfig.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={percentileTier.color} stopOpacity="0.35" />
                                <stop offset="100%" stopColor={percentileTier.color} stopOpacity="0.02" />
                              </linearGradient>
                            </defs>

                            {/* Área sob a curva */}
                            <path
                              d="M 10 75 Q 60 75 100 65 T 160 10 T 220 65 Q 260 75 310 75 Z"
                              fill={`url(#triGradient-${cardConfig.id})`}
                            />
                            {/* Linha da Curva Gaussiana */}
                            <path
                              d="M 10 75 Q 60 75 100 65 T 160 10 T 220 65 Q 260 75 310 75"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="text-zinc-300 dark:text-zinc-700"
                            />

                            {/* Marcações de Percentil: P25, P50, P75, P90 */}
                            <line x1="85" y1="15" x2="85" y2="75" stroke="currentColor" strokeDasharray="2,2" strokeWidth="1" className="text-zinc-300 dark:text-zinc-800" />
                            <line x1="160" y1="10" x2="160" y2="75" stroke="currentColor" strokeDasharray="2,2" strokeWidth="1" className="text-zinc-300 dark:text-zinc-800" />
                            <line x1="235" y1="15" x2="235" y2="75" stroke="currentColor" strokeDasharray="2,2" strokeWidth="1" className="text-zinc-300 dark:text-zinc-800" />
                            <line x1="280" y1="35" x2="280" y2="75" stroke="currentColor" strokeDasharray="2,2" strokeWidth="1" className="text-emerald-500/50" />

                            {/* Posição do Aluno na Curva */}
                            {(() => {
                              const pct = Math.max(1, Math.min(99, stats.percentileInfo.percentile || 1));
                              const markerX = 15 + (pct / 100) * 290;
                              const normDist = (markerX - 160) / 55;
                              const markerY = Math.max(12, Math.min(73, 75 - 65 * Math.exp(-0.5 * normDist * normDist)));

                              return (
                                <g>
                                  <line x1={markerX} y1={markerY} x2={markerX} y2="75" stroke={percentileTier.color} strokeWidth="2" strokeDasharray="2,1" />
                                  <circle cx={markerX} cy={markerY} r="5" fill={percentileTier.color} className="animate-pulse" />
                                  <circle cx={markerX} cy={markerY} r="9" fill={percentileTier.color} fillOpacity="0.25" />
                                </g>
                              );
                            })()}
                          </svg>

                          {/* Labels do eixo X da curva */}
                          <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[9px] font-mono text-zinc-400">
                            <span>P1</span>
                            <span>P25</span>
                            <span className="font-bold text-zinc-600 dark:text-zinc-300">P50 (Média)</span>
                            <span>P75</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">P90 (Corte)</span>
                          </div>
                        </div>

                        {/* Indicadores de Meta e Distância */}
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between">
                            <span className="text-zinc-400 font-medium">Zona de Corte</span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">Top 10% (P90)</span>
                          </div>
                          <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between">
                            <span className="text-zinc-400 font-medium">Aceleração TRI</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">+14 pts p/ Próx Nível</span>
                          </div>
                        </div>

                        {/* Gap para Nota de Corte nas Residências Alvo */}
                        {((cardConfig.customHeight && cardConfig.customHeight >= 270) || (cardConfig.colSpan >= 6 && cardConfig.customHeight && cardConfig.customHeight >= 240)) && (
                          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                                <Target className="w-3 h-3 text-blue-500" />
                                Gap de Corte das Residências Alvo
                              </span>
                              <span className="text-[10px] text-zinc-400">Projeção TRI</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 flex flex-col">
                                <span className="font-bold">USP-SP (P86)</span>
                                <span className="text-[9px] opacity-80">+12 Q corretas</span>
                              </div>
                              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex flex-col">
                                <span className="font-bold">UNICAMP (P82)</span>
                                <span className="text-[9px] opacity-80">+8 Q corretas</span>
                              </div>
                              <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 flex flex-col">
                                <span className="font-bold">ENARE (P78)</span>
                                <span className="text-[9px] opacity-80">+4 Q corretas</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2.5 flex items-center justify-between text-xs border-t border-zinc-100 dark:border-zinc-800/80">
                    {!isPercentileCalibrating ? (
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        À frente de <strong className="font-sans font-bold text-zinc-800 dark:text-zinc-200">{stats.percentileInfo.percentile}%</strong> dos candidatos
                      </span>
                    ) : (
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Progresso TRI: <strong className="font-sans font-bold text-zinc-800 dark:text-zinc-200">{150 - (stats.percentileInfo.missingForApprox || 150)}/150</strong>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => onNavigate('ranking')}
                      className="text-xs font-bold hover:underline cursor-pointer flex items-center gap-1 shrink-0 ml-auto transition-colors text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
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
                key={cardConfig.id}
                config={cardConfig}
                isCustomizing={isCustomizing}
                isSelected={selectedCardId === cardConfig.id}
                onSelect={(id) => setSelectedCardId(id)}
                onUpdateColSpan={updateColSpan}
                onUpdateHeight={updateCardHeight}
                onUpdateSettings={updateCardSettings}
                onMoveCard={moveCard}
                onToggleVisibility={toggleVisibility}
                onReorder={reorderCard}
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
                      <h4 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                        <span>Praticar {recommendedArea.label}</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mt-0.5">
                        {recommendedArea.hasData
                          ? 'Foco prioritário de alavancagem para elevar seu percentil.'
                          : 'Área essencial com alta incidência nas provas.'}
                      </p>
                    </div>

                    <div className="pt-1 flex flex-wrap items-center gap-2">
                      {/* Botão Treinar -> Abre Drawer Central com Subtemas e Radar da Banca */}
                      <button
                        type="button"
                        onClick={() => setActiveCentralDrawer('treinar_recomendacao')}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm hover:opacity-95 active:scale-98"
                        style={{
                          backgroundColor: accentConfig.primaryHex,
                          boxShadow: `0 3px 10px ${accentConfig.bgRgba}`
                        }}
                        title="Abrir centro de treino com subtemas e radar da banca"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Treinar {recommendedArea.label}</span>
                      </button>

                      {/* Botão Blitz TRI */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onStartSimuladoExpress) {
                            onStartSimuladoExpress(10);
                          } else {
                            handlePracticeArea(recommendedArea.filterName);
                          }
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer"
                        title="Treino expresso de 10 questões calibradas pelo modelo psicométrico TRI (~12 min)"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Blitz TRI (10Q • 12 min)</span>
                      </button>
                    </div>
                  </div>

                  {/* VISÃO EXPANDIDA ADAPTATIVA: Top Subtemas Críticos da Área */}
                  {((cardConfig.customHeight && cardConfig.customHeight >= 220) || cardConfig.colSpan >= 6) && (
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

                      {((cardConfig.customHeight && cardConfig.customHeight >= 280) || (cardConfig.colSpan >= 6 && cardConfig.customHeight && cardConfig.customHeight >= 250)) && (
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
          if (cardConfig.id === 'home_retencao') {
            return (
              <FigmaCardWrapper
                key={cardConfig.id}
                config={cardConfig}
                isCustomizing={isCustomizing}
                isSelected={selectedCardId === cardConfig.id}
                onSelect={(id) => setSelectedCardId(id)}
                onUpdateColSpan={updateColSpan}
                onUpdateHeight={updateCardHeight}
                onUpdateSettings={updateCardSettings}
                onMoveCard={moveCard}
                onToggleVisibility={toggleVisibility}
                onReorder={reorderCard}
              >
                <div className="w-full bento-card bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden group space-y-2.5 min-h-0 h-full flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                      Retenção & Repetição Espaçada
                    </span>

                    <div className="space-y-2">
                      {/* Botão Caderno de Erros -> Abre Drawer Central */}
                      <div
                        onClick={() => {
                          if (isCustomizing) return;
                          setActiveCentralDrawer('caderno_erros');
                          setDrawerSearch('');
                          setDrawerErrorSpecialty('Todas');
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-all group gap-2"
                        title="Abrir central de foco do Caderno de Erros"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
                          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 relative">
                            <AlertOctagon className="w-4 h-4" />
                            {cardConfig.colSpan <= 3 && pendingErrorsCount > 0 && (
                              <span className="absolute -top-1 -right-1 px-1 py-0.2 bg-rose-500 text-white text-[8px] font-extrabold rounded-full leading-none">
                                {pendingErrorsCount}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors truncate">
                              {cardConfig.colSpan <= 2 ? 'Erros' : 'Caderno de Erros'}
                            </div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                              {pendingErrorsCount > 0 ? `${pendingErrorsCount} pendentes` : 'Tudo em dia'}
                            </div>
                          </div>
                        </div>
                        {cardConfig.colSpan > 3 ? (
                          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                            <span className="text-[10px] font-medium text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 card-action-text whitespace-nowrap">Ver Foco</span>
                            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-all shrink-0" />
                          </div>
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-auto" />
                        )}
                      </div>

                      {/* Botão Flashcards -> Abre Drawer Central */}
                      <div
                        onClick={() => {
                          if (isCustomizing) return;
                          setActiveCentralDrawer('flashcards');
                          setDrawerSearch('');
                          setDrawerFlashcardSpecialty('Todas');
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-all group gap-2"
                        title="Abrir central de foco dos Flashcards"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 relative"
                            style={{ backgroundColor: accentConfig.bgRgba, color: accentConfig.primaryHex }}
                          >
                            <Brain className="w-4 h-4" />
                            {cardConfig.colSpan <= 3 && flashcardsStats.dueToday > 0 && (
                              <span className="absolute -top-1 -right-1 px-1 py-0.2 bg-blue-600 text-white text-[8px] font-extrabold rounded-full leading-none">
                                {flashcardsStats.dueToday}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors truncate">
                              {cardConfig.colSpan <= 2 ? 'Cards' : 'Flashcards'}
                            </div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                              {flashcardsStats.dueToday > 0 ? `${flashcardsStats.dueToday} para hoje` : 'Em dia • FSRS'}
                            </div>
                          </div>
                        </div>
                        {cardConfig.colSpan > 3 ? (
                          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                            <span className="text-[10px] font-medium text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 card-action-text whitespace-nowrap">Ver Foco</span>
                            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-all shrink-0" />
                          </div>
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-auto" />
                        )}
                      </div>
                    </div>

                    {/* VISÃO EXPANDIDA ADAPTATIVA: Focos Críticos de Reteste */}
                    {((cardConfig.customHeight && cardConfig.customHeight >= 220) || cardConfig.colSpan >= 6) && (
                      <div className="pt-2.5 pb-1 space-y-2 border-t border-zinc-100 dark:border-zinc-800/80 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Focos Críticos de Reteste Prioritário
                          </span>
                          <span className="text-[10px] text-zinc-400">Algoritmo FSRS</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px]">
                          <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 flex flex-col">
                            <span className="font-bold truncate">Clínica Médica</span>
                            <span className="text-[9px] opacity-80">32 pendentes</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex flex-col">
                            <span className="font-bold truncate">Pediatria</span>
                            <span className="text-[9px] opacity-80">24 pendentes</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-400 flex flex-col">
                            <span className="font-bold truncate">Ginecologia</span>
                            <span className="text-[9px] opacity-80">18 pendentes</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-200/50 dark:border-zinc-800/60">
                          <span>Estabilidade de Memória (R): <strong>88.5%</strong></span>
                          <span>Próx. ciclo: <strong>Hoje às 19h</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </FigmaCardWrapper>
            );
          }
          if (cardConfig.id === 'home_mnemonico') {
            return (
              <FigmaCardWrapper
                key={cardConfig.id}
                config={cardConfig}
                isCustomizing={isCustomizing}
                isSelected={selectedCardId === cardConfig.id}
                onSelect={(id) => setSelectedCardId(id)}
                onUpdateColSpan={updateColSpan}
                onUpdateHeight={updateCardHeight}
                onUpdateSettings={updateCardSettings}
                onMoveCard={moveCard}
                onToggleVisibility={toggleVisibility}
                onReorder={reorderCard}
              >
                {/* Card 1: Mnemônico Clínico do Dia */}
                <div
                  onClick={() => setActiveCentralDrawer('mnemonico_detalhado')}
                  className="bento-card bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group flex flex-col justify-between min-h-0 h-full relative overflow-hidden space-y-3"
                  title="Abrir raciocínio mnemônico completo e desdobramentos"
                >
                  {/* Top Bar: Título do mnemônico e apenas a seta */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-2xs">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 truncate block">
                          {activeDetailedMnemonic.title}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-all shrink-0" />
                  </div>

                  {/* Middle: Critérios dispostos em subcards equilibrados sem sobrecarga visual */}
                  <div className="space-y-2 flex-1 flex flex-col justify-center">
                    <div className={`grid ${activeDetailedMnemonic.breakdown.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'} gap-2`}>
                      {activeDetailedMnemonic.breakdown.slice(0, 5).map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2 sm:p-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80 flex flex-col justify-between min-h-[52px]"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 truncate">
                              {item.label}
                            </span>
                            <span className="w-4 h-4 rounded text-[9px] font-mono font-bold bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                              {item.letter}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mt-1 truncate">
                            {item.meaning}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Regra de Decisão Rápida */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80 text-[11px] text-zinc-600 dark:text-zinc-400">
                      <span className="font-bold text-amber-600 dark:text-amber-400 shrink-0">Regra:</span>
                      <span className="truncate">{activeDetailedMnemonic.rule}</span>
                    </div>

                    {/* VISÃO EXPANDIDA ADAPTATIVA: Pegadinha Fatal da Banca & Treino Direto */}
                    {((cardConfig.customHeight && cardConfig.customHeight >= 220) || cardConfig.colSpan >= 6) && (
                      <div className="pt-2 space-y-1.5 border-t border-zinc-100 dark:border-zinc-800/80 animate-in fade-in duration-200">
                        {activeDetailedMnemonic.bancaTrap && (
                          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs">
                            <span className="font-bold flex items-center gap-1 text-[11px] mb-0.5 text-amber-700 dark:text-amber-400">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              Pegadinha Fatal da Banca:
                            </span>
                            <p className="text-[10px] leading-relaxed line-clamp-2">
                              {activeDetailedMnemonic.bancaTrap}
                            </p>
                          </div>
                        )}

                        {((cardConfig.customHeight && cardConfig.customHeight >= 280) || (cardConfig.colSpan >= 6 && cardConfig.customHeight && cardConfig.customHeight >= 250)) && (
                          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-[10px]">
                            <span className="text-zinc-600 dark:text-zinc-400 truncate max-w-[260px]">
                              {activeDetailedMnemonic.examFrequency || 'Alta frequência nas provas'}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const q = activeDetailedMnemonic.practiceQuery;
                                if (onStartTopicPractice && q) onStartTopicPractice(q.specialty, q.search);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-[10px] hover:bg-amber-600 transition-colors shrink-0 cursor-pointer shadow-2xs"
                            >
                              Treinar Tema
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </FigmaCardWrapper>
            );
          }
          if (cardConfig.id === 'home_agenda') {
            return (
              <FigmaCardWrapper
                key={cardConfig.id}
                config={cardConfig}
                isCustomizing={isCustomizing}
                isSelected={selectedCardId === cardConfig.id}
                onSelect={(id) => setSelectedCardId(id)}
                onUpdateColSpan={updateColSpan}
                onUpdateHeight={updateCardHeight}
                onUpdateSettings={updateCardSettings}
                onMoveCard={moveCard}
                onToggleVisibility={toggleVisibility}
                onReorder={reorderCard}
              >
                {/* Card 2: Agenda de Estudos do Dia (Foco Exclusivo no Período Atual + Google Agenda) */}
                <div
                  onClick={() => setActiveCentralDrawer('agenda_detalhada')}
                  className="bento-card bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs cursor-pointer hover:border-blue-500/40 transition-all group flex flex-col justify-between min-h-0 h-full relative overflow-hidden space-y-3.5"
                  title="Abrir cronograma de blocos do dia"
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20 shadow-2xs">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          Agenda de Estudos
                        </span>
                        {isGoogleCalendarConnected ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <GoogleIcon className="w-3 h-3" />
                            Google Agenda
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800">
                            Cronograma
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </div>

                  {/* Middle: APONTA SOMENTE A ATIVIDADE DA PESSOA NAQUELE PERÍODO DE TEMPO */}
                  <div className="space-y-1.5 flex-1 flex flex-col justify-center">
                    {currentPeriodInfo.status === 'em_andamento' && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Em Andamento Agora • {currentPeriodInfo.slot.startTime} às {currentPeriodInfo.slot.endTime}
                          </span>
                        </div>
                        <h4 className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 truncate">
                          {currentPeriodInfo.slot.title}
                        </h4>
                        <div className="flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-zinc-400">
                          <span className="truncate text-[11px]">
                            {currentPeriodInfo.slot.location ? `${currentPeriodInfo.slot.location} • ` : ''}
                            {currentPeriodInfo.slot.description}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                            restam {currentPeriodInfo.minutesRemaining}m
                          </span>
                        </div>
                        {/* Barra de Progresso do Período Atual */}
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-full h-1.5 overflow-hidden mt-1">
                          <div
                            className="h-1.5 rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${currentPeriodInfo.progressPercent}%` }}
                          />
                        </div>
                      </>
                    )}

                    {currentPeriodInfo.status === 'proximo' && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Próxima Atividade • {currentPeriodInfo.minutesUntil > 120 ? `Às ${currentPeriodInfo.slot.startTime}` : `Em ${currentPeriodInfo.minutesUntil} min (${currentPeriodInfo.slot.startTime})`}
                          </span>
                        </div>
                        <h4 className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 truncate">
                          {currentPeriodInfo.slot.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                          {currentPeriodInfo.slot.description}
                        </p>
                      </>
                    )}

                    {currentPeriodInfo.status === 'noturno' && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                            Período Noturno • Descanso & Consolidação
                          </span>
                        </div>
                        <h4 className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 truncate">
                          {currentPeriodInfo.slot.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-1">
                          {currentPeriodInfo.slot.description}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Footer Bar */}
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                    {!isGoogleCalendarConnected ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsGoogleModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                        title="Conectar com o Google Agenda"
                      >
                        <GoogleIcon className="w-3.5 h-3.5" />
                        <span>Conectar Google Agenda</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{daySchedule.length} atividades adaptadas hoje</span>
                      </span>
                    )}

                    {currentPeriodInfo.status === 'em_andamento' && currentPeriodInfo.nextSlot && (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate max-w-[170px]">
                        ↳ A seguir: {currentPeriodInfo.nextSlot.title}
                      </span>
                    )}
                  </div>

                  {/* VISÃO EXPANDIDA ADAPTATIVA: Linha do Tempo dos Próximos Blocos do Dia */}
                  {((cardConfig.customHeight && cardConfig.customHeight >= 220) || cardConfig.colSpan >= 6) && (
                    <div className="pt-2.5 space-y-1.5 border-t border-zinc-100 dark:border-zinc-800/80 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-blue-500" />
                          Cronograma dos Blocos do Dia
                        </span>
                        <span className="text-[10px] text-zinc-400">{daySchedule.length} blocos hoje</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[10px]">
                        {daySchedule.slice(0, 3).map((slot, idx) => (
                          <div
                            key={idx}
                            className="p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between"
                          >
                            <span className="font-mono text-[9px] text-blue-600 dark:text-blue-400 font-bold">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate mt-0.5">{slot.title}</span>
                          </div>
                        ))}
                      </div>

                      {((cardConfig.customHeight && cardConfig.customHeight >= 280) || (cardConfig.colSpan >= 6 && cardConfig.customHeight && cardConfig.customHeight >= 250)) && (
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                          <span>Tempo Planejado: <strong>4h 30m</strong></span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Cronobiologia Otimizada</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </FigmaCardWrapper>
            );
          }
          if (cardConfig.id === 'home_raiox_areas') {
            return (
              <FigmaCardWrapper
                key={cardConfig.id}
                config={cardConfig}
                isCustomizing={isCustomizing}
                isSelected={selectedCardId === cardConfig.id}
                onSelect={(id) => setSelectedCardId(id)}
                onUpdateColSpan={updateColSpan}
                onUpdateHeight={updateCardHeight}
                onUpdateSettings={updateCardSettings}
                onMoveCard={moveCard}
                onToggleVisibility={toggleVisibility}
                onReorder={reorderCard}
              >
                {/* 4. RAIO-X DAS 6 GRANDES ÁREAS */}
                <section className="w-full bento-card bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 min-h-0 h-full overflow-hidden flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800/80">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                            style={{
                              backgroundColor: accentConfig.bgRgba,
                              borderColor: accentConfig.borderRgba,
                              color: accentConfig.primaryHex
                            }}
                          >
                            <BarChart2 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h4 className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 leading-tight">
                              Raio-X das 6 Grandes Áreas
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                              Clique em qualquer cor do gráfico para ver a área
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Gráfico Donut + Gráfico de Evolução */}
                      <div className={`grid grid-cols-1 ${cardConfig.colSpan >= 8 ? 'md:grid-cols-12' : 'grid-cols-1'} gap-5 sm:gap-8 items-center pt-1`}>
                        {/* Donut Chart (Esquerda - 5 cols quando largo, coluna única quando compacto) */}
                        <div className={`${cardConfig.colSpan >= 8 ? 'md:col-span-5' : 'col-span-1'} flex flex-col items-center justify-center space-y-2`}>
                          <div className={`h-48 w-full max-w-[220px] relative flex items-center justify-center mx-auto ${!isPieAnimationDone ? 'pointer-events-none' : ''}`}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={donutData}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={55}
                                  outerRadius={80}
                                  paddingAngle={4}
                                  isAnimationActive={!isPieAnimationDone}
                                  animationBegin={0}
                                  animationDuration={1400}
                                  animationEasing="ease-out"
                                  onAnimationEnd={() => setIsPieAnimationDone(true)}
                                  onMouseEnter={(_, index) => {
                                    if (!isPieAnimationDone) return;
                                    setHoveredPieIndex(index);
                                  }}
                                  onMouseLeave={() => {
                                    if (!isPieAnimationDone) return;
                                    setHoveredPieIndex(null);
                                  }}
                                  onClick={(entry: { id?: string; payload?: { id?: string } } | undefined, index: number) => {
                                    if (!isPieAnimationDone) return;
                                    const targetId = entry?.id || entry?.payload?.id || (typeof index === 'number' && donutData[index]?.id);
                                    if (targetId) {
                                      handlePieSectorClick(targetId);
                                    }
                                  }}
                                  stroke="none"
                                  className="cursor-pointer"
                                >
                                  {donutData.map((entry, index) => {
                                    const isSelected = selectedAreaId === entry.id;
                                    const isHovered = hoveredPieIndex === index;

                                    let opacity = 1;
                                    if (hoveredPieIndex !== null) {
                                      opacity = isHovered ? 1 : 0.28;
                                    } else if (selectedAreaId !== 'geral') {
                                      opacity = isSelected ? 1 : 0.28;
                                    } else {
                                      opacity = 1;
                                    }

                                    return (
                                      <Cell
                                        key={`cell-core-${index}`}
                                        fill={entry.cor}
                                        opacity={opacity}
                                        className="transition-opacity duration-200 cursor-pointer outline-none focus:outline-none"
                                        onClick={(e) => {
                                          e?.stopPropagation?.();
                                          if (!isPieAnimationDone) return;
                                          handlePieSectorClick(entry.id);
                                        }}
                                      />
                                    );
                                  })}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>

                            {/* Centro do Gráfico Donut (Clique para alternar para o panorama Geral) */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAreaId('geral');
                                }}
                                className="w-[100px] h-[100px] rounded-full flex flex-col items-center justify-center text-center px-1 pointer-events-auto cursor-pointer group transition-transform hover:scale-105 active:scale-95 z-10"
                                title="Clique para ver o panorama Geral"
                              >
                                {(() => {
                                  const currentHovered = hoveredPieIndex !== null ? donutData[hoveredPieIndex] : null;
                                  const activeData = currentHovered || (selectedAreaId !== 'geral' ? donutData.find((d) => d.id === selectedAreaId) : null);

                                  if (activeData) {
                                    return (
                                      <>
                                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 line-clamp-1 max-w-[100px]">
                                          {activeData.name}
                                        </span>
                                        <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tabular-nums mt-0.5">
                                          {activeData.realValue}
                                        </span>
                                        <span
                                          className="text-[9px] font-bold"
                                          style={{ color: activeData.cor }}
                                        >
                                          {activeData.hasData
                                            ? `${activeData.accuracy}% acerto`
                                            : '0 resolvidas'}
                                        </span>
                                      </>
                                    );
                                  }

                                  return (
                                    <>
                                      <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400">
                                        VOLUME TOTAL
                                      </span>
                                      <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-sans tabular-nums mt-0.5">
                                        {totalCoreVolume}
                                      </span>
                                      <span className="text-[10px] font-medium text-slate-600 dark:text-zinc-400 group-hover:text-emerald-500 transition-colors">
                                        6 Grandes Áreas
                                      </span>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>

                          {/* Seletor Rápido por Cor (Legenda Interativa: Geral + 6 Grandes Áreas) */}
                          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1 w-full">
                            <button
                              type="button"
                              onClick={() => setSelectedAreaId('geral')}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${selectedAreaId === 'geral'
                                ? 'shadow-xs scale-105 border-slate-400 dark:border-zinc-500 bg-slate-200/60 dark:bg-zinc-800 text-slate-900 dark:text-white'
                                : 'opacity-70 hover:opacity-100 hover:scale-102 border-transparent text-slate-600 dark:text-zinc-400'
                                }`}
                              title="Visualizar evolução geral (todas as áreas)"
                            >
                              <BarChart2 className="w-2.5 h-2.5" />
                              <span>Geral</span>
                            </button>
                            {areasResumo.map((area) => {
                              const isSelected = selectedAreaId === area.id;
                              const shortLabel = area.id === 'clinica' ? 'Clínica' : area.id === 'cirurgia' ? 'Cirurgia' : area.label;
                              return (
                                <button
                                  key={area.id}
                                  type="button"
                                  onClick={() => setSelectedAreaId((prev) => (prev === area.id ? 'geral' : area.id))}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${isSelected
                                    ? 'shadow-xs scale-105'
                                    : 'opacity-70 hover:opacity-100 hover:scale-102'
                                    }`}
                                  style={{
                                    backgroundColor: isSelected ? `${area.colorHex}22` : 'transparent',
                                    borderColor: isSelected ? area.colorHex : 'transparent',
                                    color: isSelected ? area.colorHex : undefined
                                  }}
                                  title={`Clique para selecionar ${area.label}`}
                                >
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: area.colorHex }}
                                  />
                                  <span className="text-slate-700 dark:text-zinc-300">
                                    {shortLabel}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Gráfico de Evolução da Especialidade Selecionada ou Geral */}
                        <div className={`${cardConfig.colSpan >= 8 ? 'md:col-span-7' : 'col-span-1'} flex flex-col justify-between space-y-3`}>
                          {/* Cabeçalho do Gráfico: Filtro de Período (Esquerda) + Legenda Horizontal Inline (Direita - Imagem 3) */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-zinc-850">
                            <div className="flex items-center gap-2">
                              {/* Botão no canto superior esquerdo para abrir o Modal de Período */}
                              <button
                                type="button"
                                onClick={() => setIsPeriodDrawerOpen(true)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all cursor-pointer shadow-2xs group"
                                title="Filtrar período do gráfico"
                              >
                                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                                <span>{getSpecialtyPeriodLabel()}</span>
                                <SlidersHorizontal className="w-3 h-3 opacity-60 ml-0.5" />
                              </button>
                            </div>

                            {/* Legenda Horizontal Inline (Imagem 3: um do lado do outro) */}
                            <div className="flex items-center gap-4 text-xs whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-zinc-300 font-medium text-[11px]">
                                <span className="w-2.5 h-2.5 rounded-xs bg-[#10B981] shrink-0" />
                                Acertos (topo)
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-zinc-300 font-medium text-[11px]">
                                <span className="w-2.5 h-2.5 rounded-xs bg-[#F43F5E] shrink-0" />
                                Erros (base)
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-zinc-300 font-medium text-[11px]">
                                <span className="w-3.5 h-0.5 bg-slate-400 dark:bg-zinc-400 opacity-60 shrink-0" />
                                Tendência
                              </span>
                            </div>
                          </div>

                          {/* Gráfico Composto: Barras Empilhadas (Erros base + Acertos topo) + Linha de Tendência */}
                          <div className="h-52 sm:h-56 w-full pt-1">
                            <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart
                                data={specialtyEvolutionData}
                                margin={{ top: 10, right: 8, left: -24, bottom: 0 }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  vertical={false}
                                  stroke={mode === 'dark' ? '#27272A' : '#E2E8F0'}
                                  strokeOpacity={0.6}
                                />
                                <XAxis
                                  dataKey="label"
                                  minTickGap={16}
                                  axisLine={{ stroke: mode === 'dark' ? '#27272A' : '#CBD5E1' }}
                                  tickLine={false}
                                  tick={{ fill: mode === 'dark' ? '#71717A' : '#64748B', fontSize: 10, fontWeight: 500 }}
                                  dy={6}
                                />
                                <YAxis
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{ fill: mode === 'dark' ? '#71717A' : '#64748B', fontSize: 10 }}
                                />
                                <Tooltip
                                  content={<AreaEvolutionTooltip colorHex={selectedArea.colorHex} areaLabel={selectedArea.label} />}
                                />

                                {/* Barra Vermelha Abaixo (Erros) */}
                                <Bar
                                  dataKey="erros"
                                  name="Erros (base)"
                                  stackId="specialtyEvolution"
                                  fill="#F43F5E"
                                  maxBarSize={specialtyPeriod === '6m' ? 8 : specialtyPeriod === '3m' ? 12 : 20}
                                />

                                {/* Barra Verde Acima (Acertos) */}
                                <Bar
                                  dataKey="acertos"
                                  name="Acertos (topo)"
                                  stackId="specialtyEvolution"
                                  fill="#10B981"
                                  radius={[2.5, 2.5, 0, 0]}
                                  maxBarSize={specialtyPeriod === '6m' ? 8 : specialtyPeriod === '3m' ? 12 : 20}
                                />

                                {/* Linha Suave de Tendência */}
                                <Line
                                  type="monotone"
                                  dataKey="trendTotal"
                                  name="Tendência"
                                  stroke={mode === 'dark' ? '#94A3B8' : '#64748B'}
                                  strokeWidth={2}
                                  strokeOpacity={0.5}
                                  dot={false}
                                  activeDot={{
                                    r: 3,
                                    stroke: mode === 'dark' ? '#94A3B8' : '#64748B',
                                    strokeWidth: 1.5,
                                    fill: mode === 'dark' ? '#18181b' : '#ffffff'
                                  }}
                                />
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Rodapé do Gráfico: Resumo de Acertos e Questões Resolvidas + Botão de Treino */}
                          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-slate-100 dark:border-zinc-850">
                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400">
                              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                                {selectedArea.correct} acertos de {selectedArea.total} questões resolvidas
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handlePracticeArea(selectedArea.filterName)}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:opacity-95 active:scale-98 shrink-0"
                              style={{
                                backgroundColor: selectedArea.colorHex,
                                boxShadow: `0 2px 8px ${selectedArea.colorHex}33`
                              }}
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>{selectedAreaId === 'geral' ? 'Treinar Questões Gerais' : `Treinar ${selectedArea.label}`}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                    {/* VISÃO EXPANDIDA ADAPTATIVA: Benchmark Comparativo das 6 Grandes Áreas */}
                    {((cardConfig.customHeight && cardConfig.customHeight >= 280) || cardConfig.colSpan >= 8) && (
                      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            Desempenho Detalhado por Grande Área
                          </span>
                          <span className="text-[10px] text-slate-400">Taxa de Acertos vs Meta (75%)</span>
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
                              className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 flex flex-col justify-between"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-700 dark:text-zinc-300">{item.name}</span>
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                              </div>
                              <div className="flex items-baseline justify-between mt-1">
                                <span className="font-extrabold text-slate-900 dark:text-zinc-100 text-xs">
                                  {item.acertos}
                                </span>
                                <span className={`text-[9px] font-medium ${item.status === 'Atenção' ? 'text-rose-500' : 'text-slate-400'}`}>
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
                key={cardConfig.id}
                config={cardConfig}
                isCustomizing={isCustomizing}
                isSelected={selectedCardId === cardConfig.id}
                onSelect={(id) => setSelectedCardId(id)}
                onUpdateColSpan={updateColSpan}
                onUpdateHeight={updateCardHeight}
                onUpdateSettings={updateCardSettings}
                onMoveCard={moveCard}
                onToggleVisibility={toggleVisibility}
                onReorder={reorderCard}
              >
                {/* 3. RETOMADA DE ESTUDOS INTELIGENTE - SELETOR PRINCIPAL (IMAGEM 3 NO LUGAR DA IMAGEM 2) */}
                <section className="w-full min-h-0 h-full flex flex-col justify-between space-y-3">
                  <div className="flex items-center px-1">
                    {/* Seletor em formato retangular em pílula (Estilo Imagem 3) */}
                    <div className="inline-flex p-1 bg-slate-100/90 dark:bg-[#0f1115] border border-slate-200/90 dark:border-zinc-800/90 rounded-xl items-center gap-1 shadow-xs overflow-x-auto max-w-full">
                      <button
                        type="button"
                        onClick={() => setStudyResumeTab('cadernos')}
                        className={`rounded-lg px-3 sm:px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${studyResumeTab === 'cadernos'
                          ? 'text-white shadow-xs'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        style={{
                          backgroundColor: studyResumeTab === 'cadernos' ? accentConfig.primaryHex : 'transparent'
                        }}
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Cadernos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudyResumeTab('provas')}
                        className={`rounded-lg px-3 sm:px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${studyResumeTab === 'provas'
                          ? 'text-white shadow-xs'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        style={{
                          backgroundColor: studyResumeTab === 'provas' ? accentConfig.primaryHex : 'transparent'
                        }}
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Provas na Íntegra</span>
                        <span
                          className="w-1.5 h-1.5 rounded-full ml-0.5"
                          style={{ backgroundColor: '#f97316' }}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudyResumeTab('simulados')}
                        className={`rounded-lg px-3 sm:px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${studyResumeTab === 'simulados'
                          ? 'text-white shadow-xs'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        style={{
                          backgroundColor: studyResumeTab === 'simulados' ? accentConfig.primaryHex : 'transparent'
                        }}
                      >
                        <Target className="w-3.5 h-3.5" />
                        <span>Simulados Oficiais</span>
                        <span
                          className="w-1.5 h-1.5 rounded-full ml-0.5"
                          style={{ backgroundColor: '#f97316' }}
                        />
                      </button>
                    </div>
                  </div>

                  {/* PAINEL 1: CADERNOS DE QUESTÕES */}
                  {studyResumeTab === 'cadernos' && (
                    <div className="bento-card bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 animate-in fade-in duration-200">
                      {/* Cabeçalho do Card */}
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border"
                            style={{
                              backgroundColor: accentConfig.bgRgba,
                              borderColor: accentConfig.borderRgba,
                              color: accentConfig.primaryHex
                            }}
                          >
                            Caderno Ativo
                          </span>
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
                                  <h4 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100" title={item.title}>
                                    {item.title}
                                  </h4>
                                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 flex-wrap">
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
                                    <div className="text-xl sm:text-2xl font-black font-sans text-slate-900 dark:text-zinc-100">
                                      {item.progressPercentage}%
                                    </div>
                                    <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">
                                      Concluído
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => onContinueList(item)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm hover:opacity-95 active:scale-98 shrink-0"
                                    style={{
                                      backgroundColor: accentConfig.primaryHex,
                                      boxShadow: `0 4px 12px ${accentConfig.bgRgba}`
                                    }}
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    <span>
                                      {item.lastQuestionIndex !== undefined && item.lastQuestionIndex > 0
                                        ? `Continuar (Q${item.lastQuestionIndex + 1})`
                                        : 'Continuar Caderno'}
                                    </span>
                                  </button>
                                </div>
                              </div>

                              {/* Barra de Progresso Larga */}
                              <div className="w-full bg-slate-100 dark:bg-zinc-900 rounded-full h-2 overflow-hidden border border-slate-200/60 dark:border-zinc-800">
                                <div
                                  className="h-2 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${item.progressPercentage}%`,
                                    backgroundColor: accentConfig.primaryHex
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="py-6 text-center space-y-2">
                          <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Nenhum caderno em andamento</p>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                            Crie cadernos personalizados filtrando por especialidades, temas e bancas para praticar questões direcionadas.
                          </p>
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => onNavigate('listas')}
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:opacity-95 active:scale-98"
                              style={{ backgroundColor: accentConfig.primaryHex }}
                            >
                              <span>+ Criar Primeiro Caderno</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PAINEL 2: PROVAS NA ÍNTEGRA OFICIAIS */}
                  {studyResumeTab === 'provas' && (
                    <div className="bento-card bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 animate-in fade-in duration-200">
                      {/* Cabeçalho do Card */}
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
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
                                <h4 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
                                  {currentOfficialExam.institution} {currentOfficialExam.year}
                                </h4>
                                <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                                  {currentOfficialExam.modality || 'Acesso Direto'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-zinc-400">
                                {currentOfficialExam.institutionName || currentOfficialExam.institution} • {currentOfficialExam.answeredCount || 0} de {currentOfficialExam.totalQuestions || 100} questões resolvidas
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-xl sm:text-2xl font-black font-sans text-slate-900 dark:text-zinc-100">
                                  {Math.round(((currentOfficialExam.answeredCount || 0) / (currentOfficialExam.totalQuestions || 100)) * 100)}%
                                </div>
                                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">
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
                          <div className="w-full bg-slate-100 dark:bg-zinc-900 rounded-full h-2 overflow-hidden border border-slate-200/60 dark:border-zinc-800">
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
                          <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Nenhuma prova oficial recente</p>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
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
                    <div className="bento-card bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 animate-in fade-in duration-200">
                      {/* Cabeçalho do Card */}
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
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
                              <h4 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 truncate" title={currentMockExam.title}>
                                {currentMockExam.title}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-zinc-400">
                                {currentMockExam.banca} • {currentMockExam.duration} • {currentMockExam.answeredCount || 0} de {currentMockExam.totalQuestions || 100} resolvidas
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-xl sm:text-2xl font-black font-sans text-slate-900 dark:text-zinc-100">
                                  {Math.round(((currentMockExam.answeredCount || 0) / (currentMockExam.totalQuestions || 100)) * 100)}%
                                </div>
                                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">
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
                          <div className="w-full bg-slate-100 dark:bg-zinc-900 rounded-full h-2 overflow-hidden border border-slate-200/60 dark:border-zinc-800">
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
                          <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Simulado Nacional ENARE 2025</p>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
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
          if (cardConfig.id === 'home_carrossel') {
            return (
              <FigmaCardWrapper
                key={cardConfig.id}
                config={cardConfig}
                isCustomizing={isCustomizing}
                isSelected={selectedCardId === cardConfig.id}
                onSelect={(id) => setSelectedCardId(id)}
                onUpdateColSpan={updateColSpan}
                onUpdateHeight={updateCardHeight}
                onUpdateSettings={updateCardSettings}
                onMoveCard={moveCard}
                onToggleVisibility={toggleVisibility}
                onReorder={reorderCard}
              >
                {/* 4. Acesso Rápido em Carrossel com Seleção Central */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Acesso Rápido
                      </h3>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        ({carouselIndex + 1} de {quickNavCards.length})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">


                      {/* Setas de navegação ergonômicas */}
                      <button
                        type="button"
                        onClick={handlePrevCard}
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer shadow-2xs"
                        title="Card anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextCard}
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer shadow-2xs"
                        title="Próximo card"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Carrossel: 1 Card Central em Destaque + 2 Cards Laterais Prévios */}
                  {(() => {
                    const prevIndex = (carouselIndex - 1 + quickNavCards.length) % quickNavCards.length;
                    const nextIndex = (carouselIndex + 1) % quickNavCards.length;
                    const prevCard = quickNavCards[prevIndex];
                    const activeCard = quickNavCards[carouselIndex];
                    const nextCard = quickNavCards[nextIndex];
                    const PrevIcon = prevCard.icon;
                    const ActiveIcon = activeCard.icon;
                    const NextIcon = nextCard.icon;

                    return (
                      <div className="space-y-3">
                        <div className="relative flex items-center justify-center gap-2 sm:gap-4 py-1 overflow-hidden select-none">
                          {/* Card Esquerdo (Anterior) */}
                          <div
                            onClick={() => {
                              setSlideDirection('left');
                              setCarouselIndex(prevIndex);
                            }}
                            className="hidden md:flex flex-col justify-between p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-[#121215]/70 hover:bg-white dark:hover:bg-[#121215] opacity-55 hover:opacity-85 scale-90 cursor-pointer transition-all duration-300 w-48 lg:w-56 h-36 shrink-0 shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center border"
                                style={{
                                  backgroundColor: accentConfig.bgRgba,
                                  borderColor: accentConfig.borderRgba,
                                  color: accentConfig.primaryHex
                                }}
                              >
                                <PrevIcon className="w-4 h-4" />
                              </div>

                            </div>
                            <div>
                              <h4 className="font-heading text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">
                                {prevCard.title}
                              </h4>
                              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                                {prevCard.subtitle}
                              </p>
                            </div>
                          </div>

                          {/* Card Central (Selecionado / Ativo) */}
                          <div
                            key={carouselIndex}
                            onClick={() => onNavigate(activeCard.tab as ActiveTab)}
                            className={`bento-card relative z-10 w-full max-w-sm sm:max-w-md h-38 sm:h-40 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-300 cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5 active:scale-99 animate-in fade-in duration-300 ease-out ${slideDirection === 'right' ? 'slide-in-from-right-4' : 'slide-in-from-left-4'}`}
                          >
                            {/* Topo do Card Central: Ícone em Destaque + Badge e Atalho */}
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs transition-transform duration-200 group-hover:scale-105"
                                  style={{
                                    backgroundColor: accentConfig.bgRgba,
                                    borderColor: accentConfig.borderRgba,
                                    color: accentConfig.primaryHex
                                  }}
                                >
                                  <ActiveIcon className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-heading text-base font-bold text-zinc-900 dark:text-white leading-tight">
                                      {activeCard.title}
                                    </h4>
                                    {activeCard.countBadge !== null && activeCard.countBadge !== undefined && (
                                      <span
                                        className="text-[10px] font-bold font-sans px-2 py-0.5 rounded-full border shadow-2xs"
                                        style={{
                                          backgroundColor: accentConfig.bgRgba,
                                          borderColor: accentConfig.borderRgba,
                                          color: accentConfig.primaryHex
                                        }}
                                      >
                                        {activeCard.countBadge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5 truncate max-w-[220px] sm:max-w-[280px]">
                                    {activeCard.subtitle}
                                  </p>
                                </div>
                              </div>


                            </div>

                            {/* Rodapé do Card Central: Botão de Ação Direta */}
                            <div className="pt-2 flex items-center justify-end border-t border-zinc-100 dark:border-zinc-800/80">
                              <div
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs group-hover:opacity-95 transition-opacity"
                                style={{ backgroundColor: accentConfig.primaryHex }}
                              >
                                <span>Acessar {activeCard.title}</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                          </div>

                          {/* Card Direito (Próximo) */}
                          <div
                            onClick={() => {
                              setSlideDirection('right');
                              setCarouselIndex(nextIndex);
                            }}
                            className="hidden md:flex flex-col justify-between p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-[#121215]/70 hover:bg-white dark:hover:bg-[#121215] opacity-55 hover:opacity-85 scale-90 cursor-pointer transition-all duration-300 w-48 lg:w-56 h-36 shrink-0 shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center border"
                                style={{
                                  backgroundColor: accentConfig.bgRgba,
                                  borderColor: accentConfig.borderRgba,
                                  color: accentConfig.primaryHex
                                }}
                              >
                                <NextIcon className="w-4 h-4" />
                              </div>

                            </div>
                            <div>
                              <h4 className="font-heading text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">
                                {nextCard.title}
                              </h4>
                              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                                {nextCard.subtitle}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Indicador de Bolinhas (Dots) Minimalistas */}
                        <div className="flex items-center justify-center gap-1.5 pt-0.5">
                          {quickNavCards.map((c, idx) => {
                            const isActive = idx === carouselIndex;
                            return (
                              <button
                                key={c.tab}
                                type="button"
                                onClick={() => {
                                  setSlideDirection(idx >= carouselIndex ? 'right' : 'left');
                                  setCarouselIndex(idx);
                                }}
                                className={`transition-all duration-300 cursor-pointer ${isActive
                                  ? 'w-6 h-1.5 rounded-full'
                                  : 'w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600'
                                  }`}
                                style={{
                                  backgroundColor: isActive ? accentConfig.primaryHex : undefined
                                }}
                                title={`Ir para ${c.title}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* VISÃO EXPANDIDA ADAPTATIVA: Grid de Navegação Direta de Todos os Módulos */}
                  {((cardConfig.customHeight && cardConfig.customHeight >= 220) || cardConfig.colSpan >= 10) && (
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs px-1">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-blue-500" />
                          Acesso Rápido a Todos os Módulos
                        </span>
                        <span className="text-[10px] text-zinc-400">Navegação Expressa</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        {quickNavCards.map((nav, idx) => {
                          const NavIcon = nav.icon;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => onNavigate(nav.tab as ActiveTab)}
                              className="p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-blue-400 transition-all text-left flex flex-col justify-between group/nav cursor-pointer"
                            >
                              <div className="flex items-center justify-between">
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                                  style={{
                                    backgroundColor: accentConfig.bgRgba,
                                    borderColor: accentConfig.borderRgba,
                                    color: accentConfig.primaryHex
                                  }}
                                >
                                  <NavIcon className="w-3.5 h-3.5" />
                                </div>
                                {nav.countBadge !== null && nav.countBadge !== undefined && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                    {nav.countBadge}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1.5">
                                <div className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 group-hover/nav:text-blue-600 dark:group-hover/nav:text-blue-400 transition-colors truncate">
                                  {nav.title}
                                </div>
                                <div className="text-[9px] text-zinc-400 truncate">
                                  {nav.subtitle}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </section>
              </FigmaCardWrapper>
            );
          }
          return null;
        })}
      </div>

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
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col z-10 animate-in zoom-in-95 duration-200 overflow-hidden">

            {/* 1. CABEÇALHO DO DRAWER CENTRAL */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/60 dark:bg-zinc-900/40">
              <div className="flex items-center gap-3">
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
                  {activeCentralDrawer === 'mnemonico_detalhado' && <Lightbulb className="w-5 h-5 text-amber-500" />}
                  {activeCentralDrawer === 'agenda_detalhada' && <CalendarDays className="w-5 h-5 text-blue-500" />}
                </div>
                <div>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {activeCentralDrawer === 'cadernos' && 'Histórico de Cadernos de Questões'}
                    {activeCentralDrawer === 'provas' && 'Histórico e Catálogo de Provas Oficiais'}
                    {activeCentralDrawer === 'simulados' && 'Histórico de Simulados Oficiais'}
                    {activeCentralDrawer === 'caderno_erros' && 'Caderno de Erros • Foco de Reteste'}
                    {activeCentralDrawer === 'flashcards' && 'Flashcards Mnemônicos • Revisão do Dia'}
                    {activeCentralDrawer === 'treinar_recomendacao' && `Centro de Treino • ${recommendedArea.label}`}
                    {activeCentralDrawer === 'mnemonico_detalhado' && (activeDetailedMnemonic.theme || 'Mnemônico Clínico')}
                    {activeCentralDrawer === 'agenda_detalhada' && 'Agenda e Cronograma de Estudos'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {activeCentralDrawer === 'cadernos' && 'Acesse todos os seus cadernos personalizados e continue seus estudos'}
                    {activeCentralDrawer === 'provas' && 'Provas oficiais na íntegra de Residência Médica e Revalida'}
                    {activeCentralDrawer === 'simulados' && 'Simulados cronometrados com pontuação TRI e percentil'}
                    {activeCentralDrawer === 'caderno_erros' && 'Diagnóstico metacognitivo e questões erradas pendentes de reteste'}
                    {activeCentralDrawer === 'flashcards' && 'Fixação rápida de alto rendimento com algoritmo espaçado FSRS'}
                    {activeCentralDrawer === 'treinar_recomendacao' && 'Subtemas prioritários, radar da banca e modos de execução'}
                    {activeCentralDrawer === 'mnemonico_detalhado' && 'Critérios objetivos de decomposição e armadilhas de prova'}
                    {activeCentralDrawer === 'agenda_detalhada' && 'Planejamento e blocos de estudo sequenciais organizados para hoje'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveCentralDrawer(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-slate-800 cursor-pointer transition-colors"
                title="Fechar (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2. BARRA DE BUSCA RÁPIDA DEDICADA (Oculta em Treino, Mnemônico e Agenda) */}
            {activeCentralDrawer !== 'treinar_recomendacao' &&
              activeCentralDrawer !== 'mnemonico_detalhado' &&
              activeCentralDrawer !== 'agenda_detalhada' && (
                <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 space-y-3 shrink-0 bg-white dark:bg-[#0c1017]">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition-all"
                    />
                    {drawerSearch && (
                      <button
                        type="button"
                        onClick={() => setDrawerSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
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
                              : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800'
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
                              : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800'
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
                              : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800'
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
                              className="p-4 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-[#121620] hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-2xs"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white truncate">
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
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mt-1">
                                  <span>{item.completedQuestions}/{item.totalQuestions} questões</span>
                                  <span>•</span>
                                  <span className="font-semibold text-slate-700 dark:text-zinc-300">{item.progressPercentage}%</span>
                                  {item.lastStudiedAt && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate">Último estudo: {item.lastStudiedAt}</span>
                                    </>
                                  )}
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden mt-2">
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
                        <div className="py-12 text-center text-xs text-slate-400 dark:text-zinc-500 space-y-3">
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
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 px-1">
                        Minhas Provas no Histórico ({officialExamsHistory.length})
                      </div>
                      <div className="space-y-2">
                        {officialExamsHistory
                          .filter((e) => !drawerSearch || e.institution.toLowerCase().includes(drawerSearch.toLowerCase()) || String(e.year).includes(drawerSearch))
                          .map((exam) => (
                            <div
                              key={exam.id}
                              className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-[#121620] flex items-center justify-between gap-3 shadow-2xs"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
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
                                <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
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
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 px-1">
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
                            className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-[#121620] hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                  {item.institution.shortName} {item.exam.year}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                                  {nominalQ}q
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
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
                      <div className="py-8 text-center text-xs text-slate-400 dark:text-zinc-500">
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
                        className="p-4 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-[#121620] hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
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
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                            {mock.banca} • {mock.duration} • {mock.answeredCount || 0} de {mock.totalQuestions} questões resolvidas
                          </p>
                          <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden mt-2">
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
                    <div className="py-12 text-center text-xs text-slate-400 dark:text-zinc-500">
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

                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 flex flex-col justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                            Área Mais Crítica
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 mt-1 truncate">
                            {mostCriticalArea ? mostCriticalArea.name : 'Nenhuma pendência'}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                            {mostCriticalArea ? `${mostCriticalArea.count} erros registrados` : 'desempenho 100%'}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 flex flex-col justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                            Ação Imediata
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            Reteste Focado
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                            ciclo anti-esquecimento
                          </span>
                        </div>
                      </div>

                      {/* Lista de Questões com Erros */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-semibold px-1">
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
                              className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-[#121620] hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-2xs"
                            >
                              <div className="min-w-0 flex-1 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {errItem.specialty && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                      {errItem.specialty}
                                    </span>
                                  )}
                                  {errItem.banca && (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                                      {errItem.banca} {errItem.year ? `• ${errItem.year}` : ''}
                                    </span>
                                  )}
                                  {errItem.difficulty && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400">
                                      {errItem.difficulty}
                                    </span>
                                  )}
                                  {errItem.errorReason && (
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                      {errItem.errorReason}
                                    </span>
                                  )}
                                </div>

                                <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 line-clamp-2">
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
                            <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                              {pendingErrorsList.length === 0
                                ? 'Nenhum erro pendente! Sua retenção está excelente.'
                                : 'Nenhum erro encontrado com os filtros selecionados.'}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                              Continue resolvendo questões para calibrar suas lacunas de aprendizado.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Botão de Rodapé Fixo do Drawer */}
                      {pendingErrorsList.length > 0 && (
                        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
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
                      <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-zinc-200">
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

              {/* === CASO 8: DRAWER CENTRAL DE AGENDA DO DIA (INTEGRADA AO GOOGLE AGENDA) === */}
              {activeCentralDrawer === 'agenda_detalhada' && (
                <div className="p-4 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                  {/* Banner / Card de Conexão com Google Agenda */}
                  <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${isGoogleCalendarConnected
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800'
                    }`}>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#18181b] border border-blue-500/20 shadow-xs flex items-center justify-center shrink-0">
                          <GoogleIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                              {isGoogleCalendarConnected
                                ? 'Google Agenda Sincronizada'
                                : 'Conectar com Google Agenda'}
                            </h4>
                            {isGoogleCalendarConnected && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                Ativa
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {isGoogleCalendarConnected
                              ? `${googleCalendarAccount} • Sincronizado ${lastCalendarSyncTime}${googleIcalUrl ? ` • ${realCalendarEvents.length > 0 ? `${realCalendarEvents.length} evento(s) hoje` : '0 eventos hoje (estudos)'}` : ''}`
                              : 'Sincronize plantões, internato e compromissos para adaptar os blocos de estudo à sua rotina'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isGoogleCalendarConnected ? (
                          <>
                            <button
                              type="button"
                              onClick={handleSyncNow}
                              disabled={isSyncingCalendar}
                              className="px-3 py-1.5 rounded-xl border border-blue-500/30 bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50"
                              title="Sincronizar novamente"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCalendar ? 'animate-spin' : ''}`} />
                              <span>{isSyncingCalendar ? 'Sincronizando...' : 'Sincronizar'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsGoogleModalOpen(true)}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition-colors"
                            >
                              Configurar
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsGoogleModalOpen(true)}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-xs"
                          >
                            <GoogleIcon className="w-3.5 h-3.5" />
                            <span>Conectar Agenda</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Seletor de Simulação de Horário para Teste Interativo */}
                  <div className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        Simular Período do Dia (Teste da Adaptação em Tempo Real):
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {simulatedHour !== null ? `Horário Simulado: ${simulatedHour}:15` : 'Horário Atual Real'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5">
                      {[
                        { label: 'Agora (Real)', value: null },
                        { label: 'Manhã (09:00)', value: 9 },
                        { label: 'Tarde (14:30)', value: 14 },
                        { label: 'Fim de Tarde (16:30)', value: 16 },
                        { label: 'Noite (20:30)', value: 20 },
                        { label: 'Madrugada (23:30)', value: 23 }
                      ].map((item, idx) => {
                        const isSelected = simulatedHour === item.value;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSimulatedHour(item.value)}
                            className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${isSelected
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:text-zinc-900 dark:hover:text-white'
                              }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Resumo de Metas do Dia */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 flex flex-col justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                        Meta de Questões
                      </span>
                      <span className="text-xl font-black font-mono text-slate-900 dark:text-zinc-100 mt-1">
                        {todayAnswered}/{dailyGoal || 30}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                        {todayAnswered >= (dailyGoal || 30) ? 'Meta batida!' : 'progresso de hoje'}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 flex flex-col justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                        Tempo Dedicado
                      </span>
                      <span className="text-xl font-black font-mono text-slate-900 dark:text-zinc-100 mt-1">
                        {todayStudyMinutes}m
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                        meta diária: {dailyTimeGoal}m
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                        Blocos de Hoje
                      </span>
                      <span className="text-xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1">
                        {daySchedule.length} blocos
                      </span>
                      <span className="text-[10px] text-blue-500/80">
                        {isGoogleCalendarConnected ? 'agenda sincronizada' : 'planejamento ativo'}
                      </span>
                    </div>
                  </div>

                  {/* Aviso informativo quando conectado com 0 eventos no dia */}
                  {isGoogleCalendarConnected && Boolean(googleIcalUrl) && realCalendarEvents.length === 0 && (
                    <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/25 border border-blue-200/80 dark:border-blue-900/50 text-xs text-blue-950 dark:text-blue-200 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>
                        <strong>Google Agenda conectada!</strong> Você não tem compromissos marcados no calendário para a data de hoje. Os blocos abaixo foram adaptados para dedicação aos estudos.
                      </span>
                    </div>
                  )}

                  {/* Linha do Tempo Sequencial de Hoje */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold px-1">
                      <span>Cronograma Sequencial de Hoje (Adaptado ao Design da Plataforma)</span>
                      <span>Origem & Ação</span>
                    </div>

                    <div className="space-y-2">
                      {daySchedule.map((slot, idx) => {
                        const isCurrentSlot = currentPeriodInfo.status === 'em_andamento' && currentPeriodInfo.slot.id === slot.id;
                        const isPast = slot.endMinutes <= currentPeriodInfo.currentMinutes;

                        return (
                          <div
                            key={slot.id || idx}
                            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${isCurrentSlot
                                ? 'bg-blue-500/10 border-blue-500/50 shadow-md ring-1 ring-blue-500/30'
                                : isPast
                                  ? 'bg-zinc-50/60 dark:bg-zinc-900/30 border-zinc-200/60 dark:border-zinc-800/60 opacity-70'
                                  : 'bg-white dark:bg-[#121620] border-zinc-200/90 dark:border-zinc-800'
                              }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${isCurrentSlot
                                  ? 'bg-blue-500 text-white shadow-xs'
                                  : isPast
                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                                }`}>
                                {isPast ? <Check className="w-4 h-4" /> : idx + 1}
                              </div>

                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                    {slot.startTime} - {slot.endTime}
                                  </span>

                                  {isCurrentSlot && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                      Agora ({currentPeriodInfo.minutesRemaining}m restantes)
                                    </span>
                                  )}

                                  {slot.source === 'google' ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                      <GoogleIcon className="w-2.5 h-2.5" />
                                      Google Agenda
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                                      Plataforma
                                    </span>
                                  )}
                                </div>

                                <h5 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                  {slot.title}
                                </h5>

                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                  {slot.location ? `${slot.location} • ` : ''}
                                  {slot.description}
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                              {slot.action === 'treinar' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveCentralDrawer(null);
                                    handlePracticeArea(recommendedArea.filterName);
                                  }}
                                  className="px-3 py-1.5 rounded-lg text-white text-xs font-bold cursor-pointer transition-opacity hover:opacity-90 shadow-2xs"
                                  style={{ backgroundColor: accentConfig.primaryHex }}
                                >
                                  Treinar
                                </button>
                              )}

                              {slot.action === 'caderno_erros' && (
                                <button
                                  type="button"
                                  onClick={() => setActiveCentralDrawer('caderno_erros')}
                                  className="px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold cursor-pointer hover:bg-rose-500/25"
                                >
                                  Abrir Erros
                                </button>
                              )}

                              {slot.action === 'flashcards' && (
                                <button
                                  type="button"
                                  onClick={() => setActiveCentralDrawer('flashcards')}
                                  className="px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold cursor-pointer hover:bg-blue-500/25"
                                >
                                  Revisar FSRS
                                </button>
                              )}

                              {slot.action === 'mnemonico' && (
                                <button
                                  type="button"
                                  onClick={() => setActiveCentralDrawer('mnemonico_detalhado')}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold cursor-pointer hover:bg-emerald-500/25"
                                >
                                  Ver Pílula
                                </button>
                              )}

                              {slot.action === 'simulado' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveCentralDrawer(null);
                                    if (onStartSimuladoExpress) onStartSimuladoExpress(10);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-bold cursor-pointer hover:bg-amber-500/25"
                                >
                                  Iniciar Blitz
                                </button>
                              )}

                              {!slot.action && slot.source === 'google' && (
                                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">
                                  Agenda
                                </span>
                              )}

                              {slot.source === 'plataforma' && (
                                <button
                                  type="button"
                                  onClick={() => handleExportSlotToGoogle(slot)}
                                  disabled={exportingSlotId === slot.id}
                                  className="px-2 py-1.5 rounded-lg border border-blue-500/25 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100/70 dark:hover:bg-blue-900/40 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                                  title={calendarSyncMode === 'api' && googleAccessToken ? 'Gravar direto no Google Calendar via API' : 'Salvar no Google Agenda (1 clique)'}
                                >
                                  <GoogleIcon className="w-2.5 h-2.5" />
                                  <span>{exportingSlotId === slot.id ? 'Gravando...' : '+ Google'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

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
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 flex flex-col justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                            Para Hoje
                          </span>
                          <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-zinc-100 mt-1">
                            {flashcardsStats.dueToday}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">
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

                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 flex flex-col justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                            Meta Retenção
                          </span>
                          <span
                            className="text-xl sm:text-2xl font-black font-mono mt-1"
                            style={{ color: accentConfig.primaryHex }}
                          >
                            {flashcardsStats.desiredRetention}%
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                            precisão esperada
                          </span>
                        </div>
                      </div>

                      {/* Lista de Flashcards do Dia */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-semibold px-1">
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
                              className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-[#121620] hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-2xs"
                            >
                              <div className="min-w-0 flex-1 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                    {card.specialty}
                                  </span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                                    {card.theme}
                                  </span>
                                  {card.priority === 'essential' && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                      ★ Prioritário
                                    </span>
                                  )}
                                </div>

                                <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-200 leading-snug">
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
                            <Brain className="w-8 h-8 text-slate-400 mx-auto" />
                            <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                              Nenhum flashcard encontrado com os filtros atuais.
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                              Você está em dia com seus cartões para este filtro.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Botão de Rodapé Fixo do Drawer */}
                      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
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
          <div className="relative z-50 w-full max-w-sm sm:max-w-md bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="space-y-4">
              {/* Cabeçalho do Modal */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800/80">
                <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 font-heading">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  Filtrar por Período
                </span>
                <button
                  type="button"
                  onClick={() => setIsPeriodDrawerOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Atalhos de Estudo */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-2">
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
                          : 'bg-slate-50 dark:bg-zinc-900/70 border-slate-200/80 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                          }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Intervalo no Calendário */}
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                  Intervalo Personalizado no Calendário
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 block mb-1">
                      De:
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 block mb-1">
                      Até:
                    </label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
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
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsGoogleModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
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

            {/* Seletor de Modo de Sincronização: iCal vs Google API */}
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setCalendarSyncMode('ical')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${calendarSyncMode === 'ical'
                    ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
              >
                <span>1. Link iCal (.ics)</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold">
                  Sem Login
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCalendarSyncMode('api')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${calendarSyncMode === 'api'
                    ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
              >
                <GoogleIcon className="w-3.5 h-3.5" />
                <span>2. Google API</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                  Direto (OAuth)
                </span>
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

            {/* CONTEÚDO DA ABA 1: LINK ICAL (.ICS) */}
            {calendarSyncMode === 'ical' && (
              <div className="space-y-3.5">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                  Sincronização rápida em 30 segundos: cole o link privado da sua agenda. Leitura automática de plantões e rounds sem precisar conceder permissões de conta.
                </p>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Link Secreto iCal (.ics) do Google Agenda
                    </label>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                      Mais Rápido
                    </span>
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
                      className="w-full text-xs bg-transparent text-zinc-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  {/* Passo a passo rápido de como obter o link */}
                  <div className="mt-2 p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
                    <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-blue-500" />
                      Onde pegar o link no Google Agenda:
                    </span>
                    <ol className="list-decimal pl-4 space-y-0.5 text-zinc-600 dark:text-zinc-400">
                      <li>Abra o <strong>Google Agenda</strong> no navegador.</li>
                      <li>Clique nos <strong>3 pontinhos</strong> da sua agenda ➔ <strong>Configurações e compartilhamento</strong>.</li>
                      <li>Role até <strong>Integrar agenda</strong> e copie o <strong>"Endereço secreto no formato iCal"</strong>.</li>
                    </ol>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                    Perfil de Rotina Base
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      {
                        id: 'internato',
                        label: '🏥 Internato Hospitalar',
                        desc: 'Manhã no hospital (07:30 - 12:30) + Estudos à tarde'
                      },
                      {
                        id: 'plantao',
                        label: '🚑 Plantão 12h (Diurno)',
                        desc: 'Plantão hospitalar até 19:00 + Blitz de estudo noturno'
                      },
                      {
                        id: 'estudos',
                        label: '📚 Dedicação Exclusiva',
                        desc: 'Dia livre para foco integral em simulados e questões'
                      }
                    ].map((preset) => {
                      const isSelected = googleRoutinePreset === preset.id;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => setGoogleRoutinePreset(preset.id as any)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${isSelected
                              ? 'bg-blue-500/10 border-blue-500 text-blue-900 dark:text-blue-100'
                              : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                            }`}
                        >
                          <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-zinc-400'
                            }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold">{preset.label}</div>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{preset.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* CONTEÚDO DA ABA 2: GOOGLE API (OAUTH DIRETO) */}
            {calendarSyncMode === 'api' && (
              <div className="space-y-3.5">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                  Integração oficial via <strong>Google Calendar REST API</strong> com suporte a leitura e gravação direta de blocos no seu calendário.
                </p>

                {googleAccessToken ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Conectado via Google OAuth API</span>
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

                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => setShowAdvancedClientId(!showAdvancedClientId)}
                        className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 underline cursor-pointer"
                      >
                        {showAdvancedClientId ? 'Ocultar ID do Cliente' : 'Configurações de Desenvolvedor (Client ID)'}
                      </button>

                      {showAdvancedClientId && (
                        <div className="mt-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-1">
                          <label className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 block">
                            Google Client ID (OAuth 2.0)
                          </label>
                          <input
                            type="text"
                            value={googleClientId}
                            onChange={(e) => setGoogleClientId(e.target.value)}
                            placeholder="Ex: 123456789-abc.apps.googleusercontent.com"
                            className="w-full text-[10px] px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
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
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
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
    </div>
  );
};
