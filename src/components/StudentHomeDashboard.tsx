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
      return { text: 'Boa noite', icon: Moon, color: 'text-blue-500' };
    }
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const todayAnswered = stats.historyByDay[stats.historyByDay.length - 1]?.answered || 0;
  const goalPercentage = Math.min(100, Math.round((todayAnswered / (dailyGoal || 1)) * 100));

  // Meta Diária de Tempo de Estudo personalizada pelo aluno (em minutos)
  const [dailyTimeGoal, setDailyTimeGoal] = useState<number>(120);

  // Prova alvo e contagem regressiva de dias restantes (exibido ao lado da constância)
  const [targetExamName, setTargetExamName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_target_exam_name') || 'ENARE 2026';
    }
    return 'ENARE 2026';
  });

  const [targetDaysLeft, setTargetDaysLeft] = useState<number>(() => {
    try {
      const savedDate = typeof window !== 'undefined' ? localStorage.getItem('user_target_exam_date') || '2026-11-01' : '2026-11-01';
      const target = new Date(savedDate + 'T00:00:00');
      const now = new Date();
      const diffMs = target.getTime() - now.getTime();
      return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    } catch {
      return 238;
    }
  });

  // Atualização em resposta a eventos externos (ex: salvamento de novo alvo em modal)
  useEffect(() => {
    const handleStorage = () => {
      try {
        const savedName = localStorage.getItem('user_target_exam_name') || 'ENARE 2026';
        const savedDate = localStorage.getItem('user_target_exam_date') || '2026-11-01';
        setTargetExamName(savedName);
        const target = new Date(savedDate + 'T00:00:00');
        const now = new Date();
        const diffMs = target.getTime() - now.getTime();
        setTargetDaysLeft(Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24))));
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Modal / Edição de Metas sem valores pré-definidos (escolha livre do aluno)
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

  // Contagem Regressiva para a Prova da Residência Médica
  const [examName, setExamName] = useState<string>('ENARE 2026');
  const [examDateStr, setExamDateStr] = useState<string>('2026-11-01');

  // Sincroniza preferências do localStorage após montagem
  useEffect(() => {
    try {
      const savedTime = localStorage.getItem('bancoresidencia_daily_time_goal');
      if (savedTime) {
        const parsedTime = Number(savedTime);
        setDailyTimeGoal(parsedTime);
        setCustomGoalTime(parsedTime);
      }
      const savedName = localStorage.getItem('bancoresidencia_countdown_exam_name');
      if (savedName) {
        setExamName(savedName);
        setEditExamName(savedName);
      }
      const savedDate = localStorage.getItem('bancoresidencia_countdown_exam_date');
      if (savedDate) {
        setExamDateStr(savedDate);
        setEditExamDateStr(savedDate);
      }
    } catch {
      // ignore
    }
  }, []);

  const [isEditingCountdown, setIsEditingCountdown] = useState<boolean>(false);
  const [editExamName, setEditExamName] = useState<string>(examName);
  const [editExamDateStr, setEditExamDateStr] = useState<string>(examDateStr);

  const handleSaveCountdown = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = editExamName.trim() || 'Prova de Residência';
    const cleanDate = editExamDateStr || '2026-11-01';
    setExamName(cleanName);
    setExamDateStr(cleanDate);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bancoresidencia_countdown_exam_name', cleanName);
      localStorage.setItem('bancoresidencia_countdown_exam_date', cleanDate);
    }
    setIsEditingCountdown(false);
  };

  // Cálculo de dias restantes para a prova
  const countdownStats = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(examDateStr + 'T00:00:00');
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, diffDays);
    const weeksRemaining = Math.floor(daysRemaining / 7);
    const monthsRemaining = (daysRemaining / 30.4).toFixed(1);

    const formattedDate = !isNaN(target.getTime())
      ? target.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
      : examDateStr;

    return {
      daysRemaining,
      weeksRemaining,
      monthsRemaining,
      formattedDate,
      isToday: diffDays === 0,
      isPassed: diffDays < 0
    };
  }, [examDateStr]);

  // Tier cromático rigoroso do percentil
  const percentileTier = getPercentileColor(stats.percentileInfo.percentile);

  // Cartões limpos de Acesso Direto (Apenas Ícone e Título Principal)
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
    <div className="space-y-9 sm:space-y-11">
      {/* 1. Hero Bento Card: Boas-Vindas & Status do Aluno */}
      <section className="relative overflow-hidden bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-7 sm:p-9 shadow-xs">
        {/* Glow de fundo sutil */}
        <div
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: accentConfig.primaryHex }}
        />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <GreetingIcon className={`w-4 h-4 ${greeting.color}`} />
              <span>{greeting.text}</span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {studentName}
            </h1>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span
                className="px-2.5 py-1 rounded-full font-bold border flex items-center gap-1.5"
                style={{
                  backgroundColor: accentConfig.bgRgba,
                  borderColor: accentConfig.borderRgba,
                  color: accentConfig.primaryHex
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {modalidade}
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                • Preparatório Semestre 2026.1
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Card de Dias Faltando para a Prova Alvo (ao lado da constância) */}
            <div className="flex items-center gap-3.5 bg-blue-50/80 dark:bg-blue-950/20 border border-blue-300/60 dark:border-blue-500/30 px-5 py-3 rounded-2xl shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner shrink-0">
                <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-sans tracking-tight leading-none">
                  {targetDaysLeft} dias
                </div>
                <div className="text-[11px] text-blue-700 dark:text-blue-300/80 font-medium mt-1">
                  para a prova ({targetExamName})
                </div>
              </div>
            </div>

            {/* Destaque de Sequência de Dias com Micro-Animação */}
            <div className="flex items-center gap-3.5 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-300/60 dark:border-amber-500/30 px-5 py-3 rounded-2xl shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner shrink-0">
                <Flame className="w-5 h-5 fill-amber-500 dark:fill-amber-400 animate-pulse" />
              </div>
              <div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-sans tracking-tight leading-none">
                  {stats.streakDays} dias
                </div>
                <div className="text-[11px] text-amber-700 dark:text-amber-300/80 font-medium mt-1">
                  de constância diária
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Grid de Resumo Diário Bento: Meta Diária + % Aproveitamento + Percentil Rigoroso (Cards Menores e Mais Compactos) */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: Meta Diária Personalizada (Questões + Tempo de Estudo sem valores predefinidos) */}
          <div className="bento-card bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3.5">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs"
                    style={{ backgroundColor: accentConfig.bgRgba, color: accentConfig.primaryHex }}
                  >
                    <Target className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Metas Diárias
                  </span>
                </div>

                {/* Botão de Ajustar Metas (Permite ao aluno digitar o valor que quiser, sem opções predefinidas) */}
                <button
                  type="button"
                  onClick={handleToggleEditGoals}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
                  title="Definir metas personalizadas de questões e tempo"
                >
                  <SlidersHorizontal className="w-3 h-3 text-blue-500" />
                  <span>{isEditingGoals ? 'Fechar' : 'Ajustar'}</span>
                </button>
              </div>

              {/* Modo de Edição Livre de Metas */}
              {isEditingGoals ? (
                <form onSubmit={handleSaveCustomGoals} className="pt-2.5 space-y-2.5 animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                        Meta Questões
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={customGoalQuestions}
                        onChange={(e) => setCustomGoalQuestions(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans font-bold text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Ex: 25"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                        Tempo (min)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1440"
                        value={customGoalTime}
                        onChange={(e) => setCustomGoalTime(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans font-bold text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Ex: 90"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-xs font-extrabold text-white shadow-xs transition-transform hover:scale-102 cursor-pointer"
                      style={{ backgroundColor: accentConfig.primaryHex }}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Salvar Metas</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingGoals(false)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Cancelar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              ) : (
                /* Exibição das Duas Metas: Questões e Tempo com Fonte Inter */
                <div className="pt-2.5 grid grid-cols-2 gap-2.5 divide-x divide-slate-100 dark:divide-slate-800/80">
                  <div className="pr-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      <Target className="w-3 h-3" style={{ color: accentConfig.primaryHex }} />
                      <span>Questões</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight mt-0.5">
                      {todayAnswered}{' '}
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 font-sans">
                        / {dailyGoal}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-200 dark:border-slate-800 mt-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${goalPercentage}%`,
                          backgroundColor: accentConfig.primaryHex
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                      {todayAnswered >= dailyGoal
                        ? 'Meta batida! 🎉'
                        : `Faltam ${Math.max(0, dailyGoal - todayAnswered)} quest.`}
                    </div>
                  </div>

                  <div className="pl-2.5">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      <Clock className="w-3 h-3 text-sky-500" />
                      <span>Tempo</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight mt-0.5">
                      {todayStudyMinutes}m{' '}
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 font-sans">
                        / {dailyTimeGoal}m
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-200 dark:border-slate-800 mt-1.5">
                      <div
                        className="h-1.5 rounded-full bg-sky-500 transition-all duration-500 ease-out"
                        style={{
                          width: `${timeGoalPercentage}%`
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                      {todayStudyMinutes >= dailyTimeGoal
                        ? 'Tempo atingido! ⏱️'
                        : `Faltam ${Math.max(0, dailyTimeGoal - todayStudyMinutes)} min`}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
              <span>Progresso geral diário</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 font-sans">
                {Math.round((goalPercentage + timeGoalPercentage) / 2)}% concluído
              </span>
            </div>
          </div>

          {/* Card 2: Aproveitamento com Barra de Rendimento e Valores em Inter */}
          <div className="bento-card bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3.5">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                    <Award className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Aproveitamento
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  Geral
                </span>
              </div>

              {/* Valor de Rendimento em Fonte Inter */}
              <div className="flex items-baseline gap-2 pt-2.5">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-sans tracking-tight">
                  {stats.totalAnswered > 0 ? `${stats.accuracyRate.toFixed(1)}%` : '0.0%'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">acertos brutos</span>
              </div>

              {/* Barra para mostrar o rendimento solicitada pelo usuário */}
              <div className="space-y-1 pt-2">
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                  <span>Rendimento</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold font-sans">
                    {stats.totalAnswered > 0 ? `${stats.accuracyRate.toFixed(1)}%` : '0%'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(100, Math.max(0, stats.accuracyRate))}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
              <span><strong className="font-sans font-bold text-slate-700 dark:text-slate-300">{stats.totalAnswered}</strong> resolvidas</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-sans">
                {stats.totalCorrect} corretas
              </span>
            </div>
          </div>

          {/* Card 3: Percentil Oficial com Valores em Fonte Inter */}
          <div
            className="bento-card bg-white dark:bg-[#0d1527] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3.5 border transition-all duration-300"
            style={{
              borderColor: stats.percentileInfo.status !== 'locked' ? percentileTier.borderRgba : undefined
            }}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Percentil Oficial
                  </span>
                </div>

                <span className="text-[10px] font-sans text-slate-500 dark:text-slate-400 font-bold">
                  Faixa {percentileTier.rangeLabel}
                </span>
              </div>

              {stats.percentileInfo.status !== 'locked' && stats.percentileInfo.status !== 'unranked' ? (
                <div className="space-y-2.5 pt-2.5">
                  {/* Nível do Aluno Evidente com Simbologia de Medalha */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-md transition-transform hover:scale-105"
                      style={{
                        backgroundColor: percentileTier.bgRgba,
                        borderColor: percentileTier.borderRgba,
                        color: mode === 'light' ? percentileTier.textLight : percentileTier.color,
                        boxShadow: `0 3px 12px ${percentileTier.glowRgba || 'rgba(0,0,0,0.1)'}`
                      }}
                    >
                      <Medal className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Nível Atual
                      </div>
                      <div
                        className="text-xl sm:text-2xl font-black tracking-tight truncate font-sans"
                        style={{ color: mode === 'light' ? percentileTier.textLight : percentileTier.textDark }}
                      >
                        Nível {percentileTier.name}
                      </div>
                    </div>
                  </div>

                  {/* Barra de Progresso do Percentil */}
                  <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-200 dark:border-slate-800">
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
                <div className="pt-2 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-xs">
                      <Clock className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                          Em Calibração
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {Math.max(0, 150 - (stats.percentileInfo.missingForApprox || 150))}/150
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Faltam <strong className="font-sans font-bold text-slate-700 dark:text-slate-300">{stats.percentileInfo.missingForApprox} questões</strong> para homologação.
                      </div>
                    </div>
                  </div>

                  {/* Barra de progresso para a calibração */}
                  <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
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

            {/* Borda Inferior: P78 reduzido com à frente dos concorrentes + Ver detalhes */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-100 dark:border-slate-800/80">
              {stats.percentileInfo.status !== 'locked' && stats.percentileInfo.status !== 'unranked' ? (
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium text-[10px]">
                  <span
                    className="font-bold font-sans px-1.5 py-0.5 rounded-md text-[10px] border"
                    style={{
                      backgroundColor: percentileTier.bgRgba,
                      borderColor: percentileTier.borderRgba,
                      color: mode === 'light' ? percentileTier.textLight : percentileTier.textDark
                    }}
                  >
                    P{stats.percentileInfo.percentile}
                  </span>
                  <span>À frente de <strong className="font-sans font-bold">{stats.percentileInfo.percentile}%</strong></span>
                </div>
              ) : (
                <span className="text-[10px] text-amber-600/90 dark:text-amber-400/90 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" />
                  Calibração em andamento
                </span>
              )}

              <button
                type="button"
                onClick={() => onNavigate('ranking')}
                className="text-[11px] font-bold hover:underline cursor-pointer flex items-center gap-1 shrink-0 ml-auto"
                style={{ color: accentConfig.primaryHex }}
                title="Ver detalhes do seu percentil e ranking oficial"
              >
                <span>Ver detalhes</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Hero Action Card: Continuar Caderno Ativo (Ação Principal com Botão Vermelho Sólido) */}
      {recentList && (
        <section className="bento-card bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-7 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
                style={{
                  backgroundColor: accentConfig.bgRgba,
                  borderColor: accentConfig.borderRgba,
                  color: accentConfig.primaryHex
                }}
              >
                Caderno Ativo
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">• Estudado {recentList.lastStudiedAt}</span>
            </div>

            <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
              {recentList.title}
            </h3>

            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>{recentList.completedQuestions} de {recentList.totalQuestions} questões concluídas</span>
              <span>•</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{recentList.progressPercentage}%</span>
            </div>

            <div className="w-full max-w-md bg-slate-100 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-200 dark:border-slate-800">
              <div
                className="h-2.5 rounded-full transition-all duration-500"
                style={{
                  width: `${recentList.progressPercentage}%`,
                  backgroundColor: accentConfig.primaryHex
                }}
              />
            </div>
          </div>

          {/* O ÚNICO BOTÃO VERMELHO SÓLIDO PRIMÁRIO DA TELA */}
          <button
            onClick={() => onContinueList(recentList)}
            className="shrink-0 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-white text-sm font-bold transition-all cursor-pointer shadow-md hover:scale-102 active:scale-98"
            style={{
              backgroundColor: accentConfig.primaryHex,
              boxShadow: `0 8px 20px -4px ${accentConfig.bgRgba}`
            }}
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Continuar Resolvendo</span>
          </button>
        </section>
      )}

      {/* 4. Acesso Direto Limpo: Apenas Ícone + Título (Cartões Inteiros Clicáveis) */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
          Acesso Direto às Áreas da Plataforma
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {quickNavCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.tab}
                onClick={() => onNavigate(card.tab as ActiveTab)}
                className="bento-card text-left bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 p-5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between h-32 group shadow-xs hover:shadow-md hover:-translate-y-0.5"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: `${card.accentColor}18`,
                    color: card.accentColor
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <h4 className="font-heading text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors leading-snug">
                  {card.title}
                </h4>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. Seção de Listas & Cadernos Recentes (Botões Secundários Limpos, Sem Vermelho Intenso) */}
      <section className="bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-7 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs"
              style={{ backgroundColor: accentConfig.bgRgba, color: accentConfig.primaryHex }}
            >
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                Minhas Listas & Cadernos Recentes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cadernos personalizados divididos por temas clínicos e bancas
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('listas')}
            className="text-xs font-bold hover:underline cursor-pointer flex items-center gap-1 self-start sm:self-auto transition-colors"
            style={{ color: accentConfig.primaryHex }}
          >
            <span>Gerenciar Todas as Listas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allLists.slice(0, 4).map((list) => (
            <div
              key={list.id}
              className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between gap-4 transition-all"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {list.title}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>{list.completedQuestions} / {list.totalQuestions} resolvidas</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{list.progressPercentage}%</span>
                </div>
              </div>

              {/* Botão Vermelho Sólido Continuar conforme Modelo Anterior (Imagem 3) */}
              <button
                onClick={() => onContinueList(list)}
                className="shrink-0 text-xs px-4 py-2 rounded-xl font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 text-white shadow-xs"
                style={{
                  backgroundColor: accentConfig.primaryHex
                }}
              >
                Continuar
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
