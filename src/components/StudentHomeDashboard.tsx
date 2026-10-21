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
  CalendarDays
} from 'lucide-react';
import { UserStats, QuestionList, ActiveTab, Modalidade } from '@/types';
import { getPercentileColor } from '@/utils/percentile';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { getAccountTargetExam } from '@/utils/userTargetExam';

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
  modalidade
}) => {
  const { accentConfig, mode } = useTheme();

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
      } catch {}
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

  // Tier cromático do percentil
  const percentileTier = getPercentileColor(stats.percentileInfo.percentile);

  // Cartões compactos de Acesso Rápido
  const quickNavCards = [
    {
      tab: 'banco',
      title: 'Banco de Questões',
      icon: FileQuestion,
      accentColor: accentConfig.primaryHex
    },
    {
      tab: 'listas',
      title: 'Listas & Pastas',
      icon: ListFilter,
      accentColor: '#059669'
    },
    {
      tab: 'simulados',
      title: 'Simulados Oficiais',
      icon: FileCheck2,
      accentColor: '#7c3aed'
    },
    {
      tab: 'stats',
      title: 'Meu Desempenho',
      icon: BarChart2,
      accentColor: '#ea580c'
    },
    {
      tab: 'ranking',
      title: 'Ranking Oficial',
      icon: Trophy,
      accentColor: '#eab308'
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
            {/* Prova Alvo */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 dark:bg-sky-500/15 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 font-sans tracking-tight leading-none">
                  {targetDaysLeft}d
                </div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium truncate max-w-[120px]" title={targetExamName}>
                  {targetExamName}
                </div>
              </div>
            </div>

            {/* Constância */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <Flame className="w-4 h-4 fill-amber-500 animate-pulse" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 font-sans tracking-tight leading-none">
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
          <div className="bento-card bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shadow-xs"
                    style={{ backgroundColor: accentConfig.bgRgba, color: accentConfig.primaryHex }}
                  >
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                    Metas Diárias
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleToggleEditGoals}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Ajustar metas de questões e tempo"
                >
                  <SlidersHorizontal className="w-2.5 h-2.5" />
                  <span>{isEditingGoals ? 'Fechar' : 'Ajustar'}</span>
                </button>
              </div>

              {isEditingGoals ? (
                <form onSubmit={handleSaveCustomGoals} className="pt-2 space-y-2 animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
                        Questões
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={customGoalQuestions}
                        onChange={(e) => setCustomGoalQuestions(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white font-sans font-bold text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
                        Tempo (min)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1440"
                        value={customGoalTime}
                        onChange={(e) => setCustomGoalTime(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white font-sans font-bold text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-1 py-1 px-2.5 rounded-lg text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-90 cursor-pointer"
                      style={{ backgroundColor: accentConfig.primaryHex }}
                    >
                      <Check className="w-3 h-3" />
                      <span>Salvar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingGoals(false)}
                      className="p-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="pt-2 grid grid-cols-2 gap-2 divide-x divide-slate-100 dark:divide-zinc-800/80">
                  <div className="pr-1 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" style={{ color: accentConfig.primaryHex }} />
                        Questões
                      </span>
                      <span className="font-sans font-bold text-slate-800 dark:text-zinc-200">
                        {todayAnswered}/{dailyGoal}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-slate-200/60 dark:border-zinc-800">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${goalPercentage}%`,
                          backgroundColor: accentConfig.primaryHex
                        }}
                      />
                    </div>
                  </div>

                  <div className="pl-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-sky-500" />
                        Tempo
                      </span>
                      <span className="font-sans font-bold text-slate-800 dark:text-zinc-200">
                        {todayStudyMinutes}m/{dailyTimeGoal}m
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-slate-200/60 dark:border-zinc-800">
                      <div
                        className="h-1.5 rounded-full bg-sky-500 transition-all duration-500 ease-out"
                        style={{ width: `${timeGoalPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800/80">
              <span>Conclusão diária</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200 font-sans">
                {Math.round((goalPercentage + timeGoalPercentage) / 2)}%
              </span>
            </div>
          </div>

          {/* Card 2: Aproveitamento */}
          <div className="bento-card bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                    Aproveitamento
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  Geral
                </span>
              </div>

              <div className="pt-1.5 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-sans tracking-tight">
                  {stats.totalAnswered > 0 ? `${stats.accuracyRate.toFixed(1)}%` : '0.0%'}
                </span>
                <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">acertos</span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-slate-200/60 dark:border-zinc-800 mt-2">
                <div
                  className="h-1.5 rounded-full bg-emerald-500 transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, stats.accuracyRate))}%` }}
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800/80">
              <span><strong className="font-sans font-bold text-slate-800 dark:text-zinc-200">{stats.totalAnswered}</strong> resolvidas</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-sans">
                {stats.totalCorrect} corretas
              </span>
            </div>
          </div>

          {/* Card 3: Percentil Oficial */}
          <div
            className="bento-card bg-white dark:bg-[#121215] rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3 border transition-all duration-300"
            style={{
              borderColor: stats.percentileInfo.status !== 'locked' ? percentileTier.borderRgba : undefined
            }}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                  Percentil Oficial
                </span>
                <span className="text-[10px] font-sans text-slate-500 dark:text-zinc-400 font-bold">
                  {percentileTier.rangeLabel}
                </span>
              </div>

              {stats.percentileInfo.status !== 'locked' && stats.percentileInfo.status !== 'unranked' ? (
                <div className="pt-1.5 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-xs"
                      style={{
                        backgroundColor: percentileTier.bgRgba,
                        borderColor: percentileTier.borderRgba,
                        color: mode === 'light' ? percentileTier.textLight : percentileTier.color
                      }}
                    >
                      <Medal className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <div
                        className="text-lg sm:text-xl font-black tracking-tight truncate font-sans"
                        style={{ color: mode === 'light' ? percentileTier.textLight : percentileTier.textDark }}
                      >
                        Nível {percentileTier.name}
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-slate-200/60 dark:border-zinc-800">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(5, stats.percentileInfo.percentile || 0)}%`,
                        backgroundColor: percentileTier.color
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="pt-1.5 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                        Calibrando
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                        Faltam {stats.percentileInfo.missingForApprox} quest.
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-slate-200/60 dark:border-zinc-800">
                    <div
                      className="h-1.5 rounded-full bg-amber-500 transition-all duration-500"
                      style={{
                        width: `${Math.max(
                          5,
                          Math.min(
                            100,
                            Math.round(
                              ((150 - (stats.percentileInfo.missingForApprox || 150)) / 150) * 100
                            )
                          )
                        )}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-zinc-800/80">
              {stats.percentileInfo.status !== 'locked' && stats.percentileInfo.status !== 'unranked' ? (
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400 text-[10px]">
                  <span
                    className="font-bold font-sans px-1.5 py-0.2 rounded text-[10px] border"
                    style={{
                      backgroundColor: percentileTier.bgRgba,
                      borderColor: percentileTier.borderRgba,
                      color: mode === 'light' ? percentileTier.textLight : percentileTier.textDark
                    }}
                  >
                    P{stats.percentileInfo.percentile}
                  </span>
                  <span>À frente de {stats.percentileInfo.percentile}%</span>
                </div>
              ) : (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  Em calibração
                </span>
              )}

              <button
                type="button"
                onClick={() => onNavigate('ranking')}
                className="text-[11px] font-bold hover:underline cursor-pointer flex items-center gap-0.5 shrink-0 ml-auto"
                style={{ color: accentConfig.primaryHex }}
              >
                <span>Ranking</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Caderno Ativo (Ação Primária Adaptada ao Tema) */}
      {recentList && (
        <section className="bento-card bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border"
                style={{
                  backgroundColor: accentConfig.bgRgba,
                  borderColor: accentConfig.borderRgba,
                  color: accentConfig.primaryHex
                }}
              >
                Caderno Ativo
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500">{recentList.lastStudiedAt}</span>
            </div>

            <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 truncate">
              {recentList.title}
            </h3>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
              <span>{recentList.completedQuestions}/{recentList.totalQuestions} questões</span>
              <span>•</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">{recentList.progressPercentage}%</span>
            </div>

            <div className="w-full max-w-md bg-slate-100 dark:bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-slate-200/60 dark:border-zinc-800">
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${recentList.progressPercentage}%`,
                  backgroundColor: accentConfig.primaryHex
                }}
              />
            </div>
          </div>

          <button
            onClick={() => onContinueList(recentList)}
            className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm hover:opacity-95 active:scale-98"
            style={{
              backgroundColor: accentConfig.primaryHex,
              boxShadow: `0 4px 14px ${accentConfig.bgRgba}`
            }}
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Continuar</span>
          </button>
        </section>
      )}

      {/* 4. Acesso Rápido (Cards Compactos com Altura Contida) */}
      <section className="space-y-2.5">
        <h3 className="text-[11px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider px-1">
          Acesso Rápido
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {quickNavCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.tab}
                onClick={() => onNavigate(card.tab as ActiveTab)}
                className="bento-card text-left bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 p-3 sm:p-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-3 group shadow-xs hover:-translate-y-0.5"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                  style={{
                    backgroundColor: `${card.accentColor}18`,
                    color: card.accentColor
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <h4 className="font-heading text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors leading-tight truncate">
                  {card.title}
                </h4>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. Cadernos Recentes em Lista */}
      <section className="bg-white dark:bg-[#121215] border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shadow-xs"
              style={{ backgroundColor: accentConfig.bgRgba, color: accentConfig.primaryHex }}
            >
              <FolderOpen className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-zinc-100">
              Cadernos Recentes
            </h3>
          </div>
          <button
            onClick={() => onNavigate('listas')}
            className="text-xs font-bold hover:underline cursor-pointer flex items-center gap-1 transition-colors"
            style={{ color: accentConfig.primaryHex }}
          >
            <span>Ver todas</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {allLists && allLists.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden bg-slate-50/40 dark:bg-zinc-900/20">
            {allLists.slice(0, 5).map((list) => (
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
                      {list.lastStudiedAt && (
                        <span className="hidden sm:inline text-slate-400 dark:text-zinc-500">• {list.lastStudiedAt}</span>
                      )}
                    </div>
                  </div>

                  {/* Barra de progresso compacta integrada à linha */}
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
                  onClick={() => onContinueList(list)}
                  className="shrink-0 text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer hover:opacity-90 active:scale-95 text-white shadow-xs ml-2"
                  style={{
                    backgroundColor: accentConfig.primaryHex
                  }}
                >
                  Continuar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500">
            Nenhum caderno criado ainda. Seus cadernos de estudo aparecerão listados aqui.
          </div>
        )}
      </section>
    </div>
  );
};
