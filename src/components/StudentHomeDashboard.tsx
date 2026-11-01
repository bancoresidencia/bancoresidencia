'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronDown
} from 'lucide-react';
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
  CartesianGrid
} from 'recharts';
import { UserStats, QuestionList, ActiveTab, Modalidade, UserAnswerItem, PeriodFilter } from '@/types';
import { UterusIcon, PregnantWomanIcon } from './StatsDashboard';
import { getPercentileColor } from '@/utils/percentile';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
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
  userAnswers
}) => {
  const { accentConfig, mode } = useTheme();

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
  const [activeCentralDrawer, setActiveCentralDrawer] = useState<'cadernos' | 'provas' | 'simulados' | 'caderno_erros' | 'flashcards' | null>(null);
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
  const [selectedAreaId, setSelectedAreaId] = useState<string>('geral');
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);

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
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Hero Compacto: Status & Alvo */}
      <section className="relative overflow-hidden bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div
          className="absolute -right-16 -top-16 w-60 h-60 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ backgroundColor: accentConfig.primaryHex }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 font-semibold text-xs">
                <GreetingIcon className={`w-3.5 h-3.5 ${greeting.color}`} />
                <span>{greeting.text},</span>
              </div>
              <span
                className="px-2 py-0.5 rounded-md font-bold text-[11px] border inline-flex items-center gap-1"
                style={{
                  backgroundColor: accentConfig.bgRgba,
                  borderColor: accentConfig.borderRgba,
                  color: accentConfig.primaryHex
                }}
              >
                <Sparkles className="w-3 h-3" />
                {modalidade}
              </span>
            </div>

            <h1 className="font-heading text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
              {studentName}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Prova Alvo Adaptativa ao Tema */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
                style={{
                  backgroundColor: accentConfig.timeAccent.bgRgba,
                  color: accentConfig.timeAccent.hex
                }}
              >
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <div
                  className="text-sm sm:text-base font-black font-sans tracking-tight leading-none"
                  style={{ color: accentConfig.timeAccent.hex }}
                >
                  {targetDaysLeft === 1 ? 'Falta 1 dia' : `Faltam ${targetDaysLeft} dias`}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium truncate max-w-[125px]" title={targetExamName}>
                  p/ {targetExamName}
                </div>
              </div>
            </div>

            {/* Constância Adaptativa ao Tema */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
                style={{
                  backgroundColor: accentConfig.energyAccent.bgRgba,
                  color: accentConfig.energyAccent.hex
                }}
              >
                <Flame className="w-4 h-4 fill-current animate-pulse" />
              </div>
              <div>
                <div
                  className="text-sm sm:text-base font-black font-sans tracking-tight leading-none"
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
      </section>

      {/* 2. Tríade de Metas e Desempenho (3 Colunas Compactas) */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1: Metas Diárias */}
          <div className="bento-card bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[180px] space-y-3.5">
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
            </div>

            <div className="pt-2.5 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/80">
              <span className="text-[11px] font-medium">Conclusão diária</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 font-sans text-xs">
                {Math.round((goalPercentage + timeGoalPercentage) / 2)}%
              </span>
            </div>
          </div>

          {/* Card 2: Aproveitamento com Seletor Interativo e Mini Sparkline com Tooltips */}
          <div className="bento-card bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[180px] space-y-3.5">
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

          {/* Card 3: Percentil Oficial Destacado e Específico por Classificação */}
          <div
            className="bento-card relative overflow-hidden rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[180px] space-y-3.5 border transition-all duration-300"
            style={{
              background: percentileCardBg,
              borderColor: percentileCardBorder,
              boxShadow: `0 4px 20px -2px ${percentileTier.glowRgba}`
            }}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs border transition-colors"
                    style={{
                      backgroundColor: percentileTier.bgRgba,
                      borderColor: percentileTier.borderRgba,
                      color: percentileTier.color
                    }}
                  >
                    <Medal className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                    Percentil Oficial
                  </span>
                </div>
                {!isPercentileCalibrating ? (
                  <span
                    className="text-[10px] font-bold font-sans px-2.5 py-0.5 rounded-md border transition-colors shadow-xs"
                    style={{
                      backgroundColor: percentileTier.bgRgba,
                      borderColor: percentileTier.borderRgba,
                      color: percentileTextColor
                    }}
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
                    <span
                      className="text-2xl sm:text-3xl font-black font-sans tracking-tight"
                      style={{ color: percentileTextColor }}
                    >
                      P{stats.percentileInfo.percentile}
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-md border shadow-xs transition-colors"
                      style={{
                        backgroundColor: percentileTier.bgRgba,
                        borderColor: percentileTier.borderRgba,
                        color: percentileTextColor
                      }}
                    >
                      Nível {percentileTier.name}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900/30 dark:bg-black/40 rounded-full h-2 overflow-hidden border border-zinc-200/50 dark:border-white/10">
                    <div
                      className="h-2 rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.max(5, stats.percentileInfo.percentile || 0)}%`,
                        backgroundColor: percentileTier.color,
                        boxShadow: `0 0 10px ${percentileTier.glowRgba}`
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
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                      style={{
                        backgroundColor: percentileTier.bgRgba,
                        borderColor: percentileTier.borderRgba,
                        color: percentileTextColor
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: percentileTier.color }} />
                      Calibrando
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900/30 dark:bg-black/40 rounded-full h-2 overflow-hidden border border-zinc-200/50 dark:border-white/10">
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
            </div>

            <div className="pt-2.5 flex items-center justify-between text-xs border-t border-zinc-200/40 dark:border-white/10">
              {!isPercentileCalibrating ? (
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  À frente de <strong className="font-sans font-bold text-zinc-900 dark:text-zinc-100">{stats.percentileInfo.percentile}%</strong> dos candidatos
                </span>
              ) : (
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  Progresso TRI: <strong className="font-sans font-bold text-zinc-900 dark:text-zinc-100">{150 - (stats.percentileInfo.missingForApprox || 150)}/150</strong>
                </span>
              )}

              <button
                type="button"
                onClick={() => onNavigate('ranking')}
                className="text-xs font-bold hover:underline cursor-pointer flex items-center gap-1 shrink-0 ml-auto transition-colors"
                style={{ color: percentileTextColor }}
              >
                <span>Ranking Oficial</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. RECOMENDAÇÃO DO DIA E RETENÇÃO ACIMA DO RAIO-X DAS ESPECIALIDADES */}
      <section className="space-y-4">
        <div className="space-y-4">
          {/* Card 1 (Topo): Recomendação do Dia + Retenção & Repetição Espaçada (Imagem 2) */}
          <div className="w-full bento-card bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs relative overflow-hidden group">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
              {/* Bloco 1 (Esquerda - 6 cols): Recomendação do Dia */}
              <div className="md:col-span-6 space-y-2.5 relative">
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
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      Aproveitamento: {recommendedArea.accuracy}%
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>Praticar {recommendedArea.label}</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed mt-0.5">
                    {recommendedArea.hasData
                      ? `Menor rendimento registrado (${recommendedArea.accuracy}%). Foco prioritário de alavancagem.`
                      : `Área essencial com alta incidência nas provas.`}
                  </p>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handlePracticeArea(recommendedArea.filterName)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm hover:opacity-95 active:scale-98"
                    style={{
                      backgroundColor: accentConfig.primaryHex,
                      boxShadow: `0 3px 10px ${accentConfig.bgRgba}`
                    }}
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Treinar {recommendedArea.label}</span>
                  </button>
                </div>
              </div>

              {/* Bloco 2 (Direita - 6 cols): Retenção & Repetição Espaçada (Caderno de Erros + Flashcards) */}
              <div className="md:col-span-6 border-t md:border-t-0 md:border-l border-slate-100 dark:border-zinc-800/80 pt-4 md:pt-0 md:pl-6 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                  Retenção & Repetição Espaçada
                </span>

                <div className="space-y-2">
                  {/* Botão Caderno de Erros -> Abre Drawer Central */}
                  <div
                    onClick={() => {
                      setActiveCentralDrawer('caderno_erros');
                      setDrawerSearch('');
                      setDrawerErrorSpecialty('Todas');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 cursor-pointer transition-all group"
                    title="Abrir central de foco do Caderno de Erros"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                        <AlertOctagon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-rose-500 transition-colors truncate">
                          Caderno de Erros
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                          {pendingErrorsCount > 0 ? `${pendingErrorsCount} pendentes de reteste` : 'Tudo em dia'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold text-rose-500 hidden sm:inline">
                        Ver Foco
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 group-hover:text-rose-500 transition-all" />
                    </div>
                  </div>

                  {/* Botão Flashcards -> Abre Drawer Central */}
                  <div
                    onClick={() => {
                      setActiveCentralDrawer('flashcards');
                      setDrawerSearch('');
                      setDrawerFlashcardSpecialty('Todas');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-all group"
                    title="Abrir central de foco dos Flashcards"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: accentConfig.bgRgba, color: accentConfig.primaryHex }}
                      >
                        <Brain className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-white transition-colors truncate">
                          Flashcards Mnemônicos
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                          {flashcardsStats.dueToday > 0 ? `${flashcardsStats.dueToday} para hoje • FSRS` : 'Revisão do Dia • FSRS'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 hidden sm:inline">
                        Ver Foco
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 group-hover:text-white transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 (Abaixo): Raio-X das 6 Grandes Áreas com Donut e Gráficos de Acertos por Especialidade */}
          <div className="w-full bento-card bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
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
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 items-center pt-1">
              {/* Donut Chart (Esquerda - 5 cols) */}
              <div className="md:col-span-5 flex flex-col items-center justify-center space-y-2">
                <div className="h-48 w-full max-w-[220px] relative flex items-center justify-center mx-auto">
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
                        onMouseEnter={(_, index) => {
                          setHoveredPieIndex(index);
                        }}
                        onMouseLeave={() => setHoveredPieIndex(null)}
                        onClick={(entry: Record<string, unknown>, index: number) => {
                          const item = entry as { id?: string; payload?: { id?: string } } | undefined;
                          const targetId = item?.id || item?.payload?.id || (typeof index === 'number' && donutData[index]?.id);
                          if (targetId) {
                            setSelectedAreaId((prev) => (prev === targetId ? 'geral' : targetId));
                          }
                        }}
                        stroke="none"
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
                              className="transition-opacity duration-200 cursor-pointer"
                              onClick={() => {
                                setSelectedAreaId((prev) => (prev === entry.id ? 'geral' : entry.id));
                              }}
                            />
                          );
                        })}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centro do Gráfico Donut (Clique para alternar para o panorama Geral) */}
                  <div
                    onClick={() => setSelectedAreaId('geral')}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-2 select-none cursor-pointer rounded-full group"
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
              <div className="md:col-span-7 flex flex-col justify-between space-y-3">
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
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{selectedAreaId === 'geral' ? 'Treinar Questões Gerais' : `Treinar ${selectedArea.label}`}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. RETOMADA DE ESTUDOS INTELIGENTE - SELETOR PRINCIPAL (IMAGEM 3 NO LUGAR DA IMAGEM 2) */}
      <section className="space-y-3">
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
                          <Play className="w-3.5 h-3.5 fill-white" />
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
                      <Play className="w-3.5 h-3.5 fill-white" />
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
                    <Play className="w-3.5 h-3.5 fill-white" />
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
                      <Play className="w-3.5 h-3.5 fill-white" />
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
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Acessar Simulados Oficiais</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

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
      </section>

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
                </div>
                <div>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {activeCentralDrawer === 'cadernos' && 'Histórico de Cadernos de Questões'}
                    {activeCentralDrawer === 'provas' && 'Histórico e Catálogo de Provas Oficiais'}
                    {activeCentralDrawer === 'simulados' && 'Histórico de Simulados Oficiais'}
                    {activeCentralDrawer === 'caderno_erros' && 'Caderno de Erros • Foco de Reteste'}
                    {activeCentralDrawer === 'flashcards' && 'Flashcards Mnemônicos • Revisão do Dia'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {activeCentralDrawer === 'cadernos' && 'Acesse todos os seus cadernos personalizados e continue seus estudos'}
                    {activeCentralDrawer === 'provas' && 'Provas oficiais na íntegra de Residência Médica e Revalida'}
                    {activeCentralDrawer === 'simulados' && 'Simulados cronometrados com pontuação TRI e percentil'}
                    {activeCentralDrawer === 'caderno_erros' && 'Diagnóstico metacognitivo e questões erradas pendentes de reteste'}
                    {activeCentralDrawer === 'flashcards' && 'Fixação rápida de alto rendimento com algoritmo espaçado FSRS'}
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

            {/* 2. BARRA DE BUSCA RÁPIDA DEDICADA */}
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
                                <Play className="w-3.5 h-3.5 fill-white" />
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
                              <Play className="w-3 h-3 fill-white" />
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
                          <Play className="w-3.5 h-3.5 fill-white" />
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
                                <Play className="w-3.5 h-3.5 fill-white" />
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
                          <Play className="w-4 h-4 fill-white" />
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
    </div>
  );
};
