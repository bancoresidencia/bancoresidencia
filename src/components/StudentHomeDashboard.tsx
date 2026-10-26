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
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  History,
  Layers,
  Search,
  ExternalLink,
  AlertOctagon
} from 'lucide-react';
import { UserStats, QuestionList, ActiveTab, Modalidade } from '@/types';
import { getPercentileColor } from '@/utils/percentile';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { getAccountTargetExam } from '@/utils/userTargetExam';
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
  onSimulatePercentile?: (percentile: number) => void;
  onStartOfficialExam?: (institution: string, year: number) => void;
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
  onStartOfficialExam
}) => {
  const { accentConfig, mode } = useTheme();

  // Animação suave e flat do aproveitamento ao carregar a página (sem pesar o site)
  const [animatedAccuracy, setAnimatedAccuracy] = useState<number>(0);
  useEffect(() => {
    const target = stats.totalAnswered > 0 ? (stats.accuracyRate || 0) : 0;
    if (target === 0) return;
    let startTime: number | null = null;
    const duration = 750; // ms
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
  }, [stats.accuracyRate, stats.totalAnswered]);

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

  // Drawer de Provas / Simulados
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<'provas' | 'simulados'>('provas');
  const [drawerSearch, setDrawerSearch] = useState('');
  const [drawerModality, setDrawerModality] = useState<OfficialExamModalityKey>('todas');

  // Seletor em pílulas (Pill Tabs estilo Imagem 2) para Retomar Estudos
  const [studyResumeTab, setStudyResumeTab] = useState<'cadernos' | 'provas' | 'simulados'>('cadernos');

  // Identificação do exame mais recente e fallback para não concluído
  const { primary: currentOfficialExam, pendingFallback: pendingOfficialExam } = React.useMemo(
    () => getExamWithPendingFallback(officialExamsHistory),
    [officialExamsHistory]
  );

  const { primary: currentMockExam, pendingFallback: pendingMockExam } = React.useMemo(
    () => getExamWithPendingFallback(mockExamsHistory),
    [mockExamsHistory]
  );

  // Lista pesquisada para o Drawer
  const drawerSearchResults = React.useMemo(() => {
    if (drawerType === 'provas') {
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
  }, [drawerType, drawerSearch, drawerModality]);

  const handleLaunchOfficialExam = (institution: string, year: number, totalQuestions: number = 100) => {
    const updated = saveRecentOfficialExam({
      institution,
      year,
      status: 'em_andamento',
      totalQuestions
    });
    setOfficialExamsHistory(updated);
    setIsDrawerOpen(false);
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
    setIsDrawerOpen(false);
    onNavigate('simulados');
  };

  // Cartões compactos de Acesso Rápido com Acentos Harmônicos por Tema
  const quickNavCards = [
    {
      tab: 'banco',
      title: 'Banco de Questões',
      icon: FileQuestion,
      accentColor: accentConfig.primaryHex
    },
    {
      tab: 'caderno_erros',
      title: 'Caderno de Erros',
      icon: AlertOctagon,
      accentColor: '#EF4444'
    },
    {
      tab: 'listas',
      title: 'Listas & Pastas',
      icon: ListFilter,
      accentColor: accentConfig.timeAccent.hex
    },
    {
      tab: 'simulados',
      title: 'Simulados Oficiais',
      icon: FileCheck2,
      accentColor: accentConfig.chartPalette[3] || accentConfig.primaryHex
    },
    {
      tab: 'stats',
      title: 'Meu Desempenho',
      icon: BarChart2,
      accentColor: accentConfig.accuracyAccent.hex
    },
    {
      tab: 'ranking',
      title: 'Ranking Oficial',
      icon: Trophy,
      accentColor: accentConfig.energyAccent.hex
    }
  ];

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
                  className="text-base sm:text-lg font-black font-sans tracking-tight leading-none"
                  style={{ color: accentConfig.timeAccent.hex }}
                >
                  {targetDaysLeft}d
                </div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium truncate max-w-[120px]" title={targetExamName}>
                  {targetExamName}
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
                  className="text-base sm:text-lg font-black font-sans tracking-tight leading-none"
                  style={{ color: accentConfig.energyAccent.hex }}
                >
                  {stats.streakDays}d
                </div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                  seguidos
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

          {/* Card 2: Aproveitamento com Animação Flat e Adaptação ao Tema */}
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
                <span
                  className="text-[10px] px-2.5 py-0.5 rounded-md font-bold border transition-colors"
                  style={{
                    backgroundColor: accentConfig.bgRgba,
                    borderColor: accentConfig.borderRgba,
                    color: accentConfig.primaryHex
                  }}
                >
                  Geral
                </span>
              </div>

              <div className="pt-2 flex items-baseline gap-2">
                <span
                  className="text-2xl sm:text-3xl font-black font-sans tracking-tight"
                  style={{ color: accentConfig.primaryHex }}
                >
                  {stats.totalAnswered > 0 ? `${animatedAccuracy.toFixed(1)}%` : '0.0%'}
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">acertos</span>
              </div>

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
              <span className="text-[11px]"><strong className="font-sans font-bold text-zinc-800 dark:text-zinc-200">{stats.totalAnswered}</strong> resolvidas</span>
              <span
                className="font-bold font-sans text-xs"
                style={{ color: accentConfig.primaryHex }}
              >
                {stats.totalCorrect} corretas
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

            {/* 3. RETOMADA DE ESTUDOS INTELIGENTE COM SELETOR EM PÍLULAS (ESTILO IMAGEM 2) */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1">
          <h3 className="text-[11px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
            <span>Retomar Estudos</span>
          </h3>

          {/* Seletor em Pílulas (Pill Tabs idêntico à Imagem 2 com cores dinâmicas do tema) */}
          <div className="inline-flex p-1 bg-slate-100/90 dark:bg-[#0f1115] border border-slate-200/90 dark:border-zinc-800/90 rounded-full items-center gap-1 shadow-inner self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setStudyResumeTab('cadernos')}
              className={`rounded-full px-3.5 sm:px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                studyResumeTab === 'cadernos'
                  ? 'text-white shadow-sm'
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
              className={`rounded-full px-3.5 sm:px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                studyResumeTab === 'provas'
                  ? 'text-white shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              style={{
                backgroundColor: studyResumeTab === 'provas' ? accentConfig.primaryHex : 'transparent'
              }}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Provas na Íntegra</span>
              {currentOfficialExam?.status === 'em_andamento' && (
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse ml-0.5"
                  style={{ backgroundColor: accentConfig.energyAccent.hex }}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => setStudyResumeTab('simulados')}
              className={`rounded-full px-3.5 sm:px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                studyResumeTab === 'simulados'
                  ? 'text-white shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              style={{
                backgroundColor: studyResumeTab === 'simulados' ? accentConfig.primaryHex : 'transparent'
              }}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Simulados Oficiais</span>
              {currentMockExam?.status === 'em_andamento' && (
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse ml-0.5"
                  style={{ backgroundColor: accentConfig.energyAccent.hex }}
                />
              )}
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
                {(recentList || allLists[0]) && (
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
                onClick={() => onNavigate('listas')}
                className="text-xs font-bold hover:underline cursor-pointer flex items-center gap-1 transition-colors"
                style={{ color: accentConfig.primaryHex }}
              >
                <span>Ver todas as listas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Conteúdo Principal do Caderno Ativo */}
            {recentList || allLists[0] ? (
              (() => {
                const item = recentList || allLists[0];
                return (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100" title={item.title}>
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                          <span>{item.completedQuestions} de {item.totalQuestions} questões resolvidas</span>
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
                          <span>Continuar Caderno</span>
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

            {/* Lista dos Cadernos Recentes Integrada */}
            {allLists && allLists.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-zinc-400">
                  <span>Outros Cadernos Recentes</span>
                  <span>{allLists.length} caderno(s)</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-zinc-900/30">
                  {allLists.slice(0, 4).map((list) => (
                    <div
                      key={list.id}
                      className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                            {list.title}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                            <span>{list.completedQuestions}/{list.totalQuestions} questões</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-300">{list.progressPercentage}%</span>
                          </div>
                        </div>

                        <div className="w-20 sm:w-28 bg-slate-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden shrink-0">
                          <div
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${list.progressPercentage}%`,
                              backgroundColor: accentConfig.primaryHex
                            }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onContinueList(list)}
                        className="shrink-0 text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer hover:opacity-90 active:scale-95 text-white shadow-xs ml-2"
                        style={{ backgroundColor: accentConfig.primaryHex }}
                      >
                        Continuar
                      </button>
                    </div>
                  ))}
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
                  setDrawerType('provas');
                  setIsDrawerOpen(true);
                }}
                className="text-xs font-bold hover:underline cursor-pointer flex items-center gap-1 transition-colors"
                style={{ color: accentConfig.primaryHex }}
              >
                <span>Ver catálogo completo de provas</span>
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

                {/* Alerta inteligente se houver uma prova pendente anterior */}
                {currentOfficialExam?.status === 'concluida' && pendingOfficialExam && (
                  <div
                    className="p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border"
                    style={{
                      backgroundColor: accentConfig.energyAccent.bgRgba,
                      borderColor: accentConfig.energyAccent.borderRgba
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: accentConfig.energyAccent.hex }} />
                      <span className="text-slate-700 dark:text-slate-300 truncate">
                        <strong style={{ color: accentConfig.energyAccent.hex }}>Prova anterior pendente: </strong>
                        {pendingOfficialExam.institution} {pendingOfficialExam.year} ({pendingOfficialExam.answeredCount}/{pendingOfficialExam.totalQuestions} questões)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLaunchOfficialExam(pendingOfficialExam.institution, pendingOfficialExam.year, pendingOfficialExam.totalQuestions)}
                      className="shrink-0 px-3 py-1 rounded-lg text-white font-bold cursor-pointer text-xs transition-colors self-end sm:self-auto"
                      style={{ backgroundColor: accentConfig.energyAccent.hex }}
                    >
                      Retomar Prova Pendente
                    </button>
                  </div>
                )}
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

            {/* Lista de Outras Provas Oficiais Recentes do Histórico */}
            {officialExamsHistory && officialExamsHistory.length > 1 && (
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-zinc-400">
                  <span>Outras Provas no Histórico</span>
                  <span>{officialExamsHistory.length} no histórico</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-zinc-900/30">
                  {officialExamsHistory.slice(1, 4).map((exam) => (
                    <div
                      key={exam.id}
                      className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 truncate flex items-center gap-2">
                            <span>{exam.institution} {exam.year}</span>
                            <span className="text-[10px] font-normal text-slate-500 dark:text-zinc-400">({exam.modality})</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                            <span>{exam.answeredCount}/{exam.totalQuestions} questões</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-300">
                              {Math.round(((exam.answeredCount || 0) / (exam.totalQuestions || 100)) * 100)}%
                            </span>
                            <span>•</span>
                            <span
                              className="font-bold"
                              style={{
                                color: exam.status === 'em_andamento' ? accentConfig.energyAccent.hex : accentConfig.accuracyAccent.hex
                              }}
                            >
                              {exam.status === 'em_andamento' ? 'Em andamento' : 'Concluída'}
                            </span>
                          </div>
                        </div>

                        <div className="w-20 sm:w-28 bg-slate-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden shrink-0">
                          <div
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, Math.round(((exam.answeredCount || 0) / (exam.totalQuestions || 100)) * 100))}%`,
                              backgroundColor: accentConfig.primaryHex
                            }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleLaunchOfficialExam(exam.institution, exam.year, exam.totalQuestions)}
                        className="shrink-0 text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer hover:opacity-90 active:scale-95 text-white shadow-xs ml-2"
                        style={{ backgroundColor: accentConfig.primaryHex }}
                      >
                        {exam.status === 'em_andamento' ? 'Continuar' : 'Refazer'}
                      </button>
                    </div>
                  ))}
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
                  setDrawerType('simulados');
                  setIsDrawerOpen(true);
                }}
                className="text-xs font-bold hover:underline cursor-pointer flex items-center gap-1 transition-colors"
                style={{ color: accentConfig.primaryHex }}
              >
                <span>Outros simulados</span>
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

                {/* Alerta inteligente se houver simulado pendente anterior */}
                {currentMockExam?.status === 'concluida' && pendingMockExam && (
                  <div
                    className="p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border"
                    style={{
                      backgroundColor: accentConfig.energyAccent.bgRgba,
                      borderColor: accentConfig.energyAccent.borderRgba
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: accentConfig.energyAccent.hex }} />
                      <span className="text-slate-700 dark:text-slate-300 truncate">
                        <strong style={{ color: accentConfig.energyAccent.hex }}>Simulado anterior pendente: </strong>
                        {pendingMockExam.title} ({pendingMockExam.answeredCount}/{pendingMockExam.totalQuestions} questões)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLaunchMockExam(pendingMockExam)}
                      className="shrink-0 px-3 py-1 rounded-lg text-white font-bold cursor-pointer text-xs transition-colors self-end sm:self-auto"
                      style={{ backgroundColor: accentConfig.energyAccent.hex }}
                    >
                      Retomar Simulado Pendente
                    </button>
                  </div>
                )}
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

            {/* Lista de Outros Simulados Recentes */}
            {mockExamsHistory && mockExamsHistory.length > 1 && (
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-zinc-400">
                  <span>Outros Simulados no Histórico</span>
                  <span>{mockExamsHistory.length} no histórico</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-zinc-900/30">
                  {mockExamsHistory.slice(1, 4).map((mock) => (
                    <div
                      key={mock.id}
                      className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                            {mock.title}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                            <span>{mock.banca}</span>
                            <span>•</span>
                            <span>{mock.answeredCount}/{mock.totalQuestions} questões</span>
                            <span>•</span>
                            <span
                              className="font-bold"
                              style={{
                                color: mock.status === 'em_andamento' ? accentConfig.energyAccent.hex : accentConfig.accuracyAccent.hex
                              }}
                            >
                              {mock.status === 'em_andamento' ? 'Em andamento' : 'Concluído'}
                            </span>
                          </div>
                        </div>

                        <div className="w-20 sm:w-28 bg-slate-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden shrink-0">
                          <div
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, Math.round(((mock.answeredCount || 0) / (mock.totalQuestions || 100)) * 100))}%`,
                              backgroundColor: accentConfig.primaryHex
                            }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleLaunchMockExam(mock)}
                        className="shrink-0 text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer hover:opacity-90 active:scale-95 text-white shadow-xs ml-2"
                        style={{ backgroundColor: accentConfig.primaryHex }}
                      >
                        {mock.status === 'em_andamento' ? 'Continuar' : 'Refazer'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 4. Acesso Rápido (Cards Ergonômicos com Tema Dinâmico) */}
      <section className="space-y-2.5">
        <h3 className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-1">
          Acesso Rápido
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {quickNavCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.tab}
                onClick={() => onNavigate(card.tab as ActiveTab)}
                className="bento-card text-left bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-300 dark:hover:border-zinc-700 p-3 sm:p-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-3 group shadow-xs hover:-translate-y-0.5"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 border shadow-2xs"
                  style={{
                    backgroundColor: accentConfig.bgRgba,
                    borderColor: accentConfig.borderRgba,
                    color: accentConfig.primaryHex
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <h4 className="font-heading text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors leading-tight truncate">
                  {card.title}
                </h4>
              </button>
            );
          })}
        </div>
      </section>

      {/* DRAWER LATERAL: EXPLORAR PROVAS OFICIAIS OU SIMULADOS */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Painel do Drawer */}
          <div className="relative w-full sm:w-[480px] bg-white dark:bg-[#0c1017] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 h-full">
            {/* Header do Drawer */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs"
                  style={{
                    backgroundColor: accentConfig.bgRgba,
                    color: accentConfig.primaryHex
                  }}
                >
                  {drawerType === 'provas' ? <BookOpen className="w-5 h-5" /> : <FileCheck2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                    {drawerType === 'provas' ? 'Provas Oficiais na Íntegra' : 'Simulados Oficiais'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {drawerType === 'provas' ? 'Catálogo homologado de residência médica' : 'Simulados com cálculo de percentil'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white border border-slate-200 dark:border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Busca & Filtros no Drawer */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 space-y-3 shrink-0 bg-slate-50/50 dark:bg-zinc-900/30">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  placeholder={drawerType === 'provas' ? 'Buscar banca, instituição, UF ou ano...' : 'Buscar simulado...'}
                  className="w-full pl-8.5 pr-8 py-2 rounded-xl text-xs bg-white dark:bg-[#121620] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                />
                {drawerSearch && (
                  <button
                    type="button"
                    onClick={() => setDrawerSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {drawerType === 'provas' && (
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5">
                  {[
                    { id: 'todas', label: 'Todas' },
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
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer shrink-0 ${isModActive
                            ? 'text-white shadow-xs'
                            : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800'
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
            </div>

            {/* Conteúdo com Scroll do Drawer */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
              {drawerType === 'provas' ? (
                drawerSearchResults.length > 0 ? (
                  drawerSearchResults.map((item, idx) => (
                    <div
                      key={`${item.institution.id}-${item.exam.year}-${idx}`}
                      className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-[#121620] hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex items-center justify-between gap-3 group shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {item.institution.shortName} {item.exam.year}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-mono">
                            {item.exam.questionCount || 100}q
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5" title={item.institution.name}>
                          {item.institution.name}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleLaunchOfficialExam(item.institution.shortName, item.exam.year, item.exam.questionCount || 100)}
                        className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:opacity-90 active:scale-95"
                        style={{
                          backgroundColor: accentConfig.primaryHex
                        }}
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Iniciar</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400 dark:text-zinc-500">
                    Nenhuma prova encontrada com este termo.
                  </div>
                )
              ) : (
                /* Lista de Simulados no Drawer */
                mockExamsHistory.map((mock) => (
                  <div
                    key={mock.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/90 bg-white dark:bg-[#121620] hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex items-center justify-between gap-3 group shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {mock.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                        {mock.banca} • {mock.duration} • {mock.totalQuestions} questões
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLaunchMockExam(mock)}
                      className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:opacity-90 active:scale-95"
                      style={{
                        backgroundColor: accentConfig.primaryHex
                      }}
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>{mock.status === 'em_andamento' ? 'Continuar' : 'Iniciar'}</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
