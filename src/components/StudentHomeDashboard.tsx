'use client';

import React, { useState } from 'react';
import {
  Flame,
  Target,
  Award,
  Database,
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
  Palette,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { UserStats, QuestionList, ActiveTab, Modalidade } from '@/types';
import { getPercentileColor } from '@/utils/percentile';
import { PercentileColorTester } from './PercentileColorTester';
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
  modalidade,
  onSimulatePercentile
}) => {
  const { accentConfig, mode } = useTheme();
  const [showColorTester, setShowColorTester] = useState(false);

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

  // Tier cromático rigoroso do percentil
  const percentileTier = getPercentileColor(stats.percentileInfo.percentile);

  const quickNavCards = [
    {
      tab: 'banco',
      title: 'Banco de Questões',
      desc: 'Pratique questões filtrando por instituição, banca e subfoco clínico.',
      icon: Database,
      tag: 'Prática',
      accentColor: accentConfig.primaryHex
    },
    {
      tab: 'listas',
      title: 'Listas & Pastas',
      desc: 'Crie cadernos personalizados de revisão com filtros inteligentes.',
      icon: ListFilter,
      tag: 'Organização',
      accentColor: '#059669'
    },
    {
      tab: 'simulados',
      title: 'Simulados Oficiais',
      desc: 'Provas na íntegra das principais bancas de residência do país.',
      icon: FileCheck2,
      tag: 'Avaliação',
      accentColor: '#7c3aed'
    },
    {
      tab: 'stats',
      title: 'Meu Desempenho',
      desc: 'Métricas profundas, taxa de acerto por especialidade e evolução.',
      icon: BarChart2,
      tag: 'Métricas',
      accentColor: '#ea580c'
    },
    {
      tab: 'ranking',
      title: 'Ranking Oficial',
      desc: 'Classificação semestral homologada pelo percentil oficial.',
      icon: Trophy,
      tag: 'Competitivo',
      accentColor: '#eab308'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Hero Bento Card: Boas-Vindas & Status do Aluno */}
      <div className="relative overflow-hidden bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* Glow de fundo sutil */}
        <div
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: accentConfig.primaryHex }}
        />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <GreetingIcon className={`w-4 h-4 ${greeting.color}`} />
              <span>{greeting.text}, Dr(a).</span>
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

          <div className="flex flex-wrap items-center gap-3">
            {/* Botão Interativo de Teste de Cores */}
            <button
              onClick={() => setShowColorTester(!showColorTester)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-sm hover:scale-102"
            >
              <Palette className="w-4 h-4 text-amber-500" />
              <span>Testar Cores do Percentil</span>
              {showColorTester ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Destaque de Sequência de Dias com Micro-Animação */}
            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-500/30 px-4 py-2.5 rounded-2xl shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
                <Flame className="w-5 h-5 fill-amber-500 dark:fill-amber-400 animate-pulse" />
              </div>
              <div>
                <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight leading-none">
                  {stats.streakDays} dias
                </div>
                <div className="text-[11px] text-amber-700 dark:text-amber-300/80 font-medium mt-0.5">
                  de constância diária
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Painel Interativo de Teste de Cores (se ativado) */}
      {showColorTester && (
        <PercentileColorTester
          currentPercentile={stats.percentileInfo.percentile ?? 78}
          onSelectTestPercentile={onSimulatePercentile}
        />
      )}

      {/* 2. Grid de Resumo Diário Bento: Meta Diária + % Aproveitamento + Percentil Rigoroso */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Meta Diária de Questões */}
        <div className="bento-card bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: accentConfig.bgRgba, color: accentConfig.primaryHex }}
                >
                  <Target className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Meta Diária
                </span>
              </div>

              {/* Seletor Rápido de Meta */}
              <div className="flex items-center gap-1.5 text-xs">
                <select
                  id="goal-input"
                  value={dailyGoal}
                  onChange={(e) => onUpdateDailyGoal(Number(e.target.value))}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-semibold"
                >
                  <option value={10}>10 quest.</option>
                  <option value={20}>20 quest.</option>
                  <option value={30}>30 quest.</option>
                  <option value={50}>50 quest.</option>
                  <option value={100}>100 quest.</option>
                </select>
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-4">
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {todayAnswered}{' '}
                <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 font-sans">
                  / {dailyGoal}
                </span>
              </div>
              <span
                className="text-xs font-extrabold px-2.5 py-1 rounded-full border"
                style={{
                  backgroundColor: accentConfig.bgRgba,
                  borderColor: accentConfig.borderRgba,
                  color: accentConfig.primaryHex
                }}
              >
                {goalPercentage}% concluída
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-200 dark:border-slate-800">
              <div
                className="h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${goalPercentage}%`,
                  backgroundColor: accentConfig.primaryHex
                }}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {todayAnswered >= dailyGoal
                ? '🎉 Parabéns! Meta de hoje batida com sucesso!'
                : `Faltam ${Math.max(0, dailyGoal - todayAnswered)} questões para alcançar a meta.`}
            </p>
          </div>
        </div>

        {/* Card 2: Taxa de Acerto Global */}
        <div className="bento-card bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
                  <Award className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Aproveitamento
                </span>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                Geral
              </span>
            </div>

            <div className="flex items-baseline gap-2 pt-4">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                {stats.totalAnswered > 0 ? `${stats.accuracyRate.toFixed(1)}%` : '0.0%'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">acertos brutos</span>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
            <span><strong>{stats.totalAnswered}</strong> resolvidas</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {stats.totalCorrect} corretas
            </span>
          </div>
        </div>

        {/* Card 3: Percentil Rigoroso com Cores Oficiais Solicitadas */}
        <div
          className="bento-card bg-white dark:bg-[#0d1527] rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 border transition-all duration-300"
          style={{
            borderColor: stats.percentileInfo.status !== 'locked' ? percentileTier.borderRgba : undefined
          }}
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                  style={{
                    backgroundColor: percentileTier.bgRgba,
                    color: percentileTier.textContrast
                  }}
                >
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Percentil Oficial
                </span>
              </div>

              {stats.percentileInfo.status !== 'locked' && stats.percentileInfo.status !== 'unranked' ? (
                <span
                  className="text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold border tracking-wide shadow-sm"
                  style={{
                    backgroundColor: percentileTier.bgRgba,
                    borderColor: percentileTier.borderRgba,
                    color: mode === 'light' ? percentileTier.textLight : percentileTier.textDark
                  }}
                >
                  {percentileTier.name}
                </span>
              ) : (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                  Calibrando
                </span>
              )}
            </div>

            {stats.percentileInfo.status !== 'locked' && stats.percentileInfo.status !== 'unranked' ? (
              <div className="space-y-2 pt-4">
                <div className="flex items-baseline gap-3">
                  <span
                    className="text-4xl font-black font-mono tracking-tight"
                    style={{ color: mode === 'light' ? percentileTier.textLight : percentileTier.textDark }}
                  >
                    P{stats.percentileInfo.percentile}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    À frente de <strong>{stats.percentileInfo.percentile}%</strong> dos concorrentes.
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(5, stats.percentileInfo.percentile || 0)}%`,
                      backgroundColor: percentileTier.color
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="pt-4 space-y-1">
                <div className="text-base font-bold text-slate-800 dark:text-slate-200">Em Calibração</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Faltam <strong>{stats.percentileInfo.missingForApprox} questões</strong> para homologação.
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={() => onNavigate('stats')}
              className="text-xs font-bold hover:underline cursor-pointer flex items-center gap-1"
              style={{ color: accentConfig.primaryHex }}
            >
              <span>Ver detalhes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {stats.percentileInfo.status !== 'locked' && (
              <span className="text-[11px] font-mono text-slate-500 font-semibold">
                Faixa {percentileTier.rangeLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Hero Action Card: Continuar Lista de Questões em Andamento */}
      {recentList && (
        <div className="bento-card bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
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
        </div>
      )}

      {/* 4. Navegação Rápida Bento */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3.5 px-1">
          Acesso Direto às Áreas da Plataforma
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {quickNavCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.tab}
                onClick={() => onNavigate(card.tab as ActiveTab)}
                className="bento-card text-left bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 p-5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between h-44 group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: `${card.accentColor}18`,
                        color: card.accentColor
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {card.tag}
                    </span>
                  </div>

                  <h4 className="font-heading text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold pt-3 border-t border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">
                  <span>Abrir</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Seção de Listas & Cadernos Recentes */}
      <div className="bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
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
            className="text-xs font-bold hover:underline cursor-pointer flex items-center gap-1 self-start sm:self-auto"
            style={{ color: accentConfig.primaryHex }}
          >
            <span>Gerenciar Todas as Listas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
              <button
                onClick={() => onContinueList(list)}
                className="shrink-0 text-xs px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: list.completedQuestions > 0 ? accentConfig.primaryHex : undefined,
                  color: list.completedQuestions > 0 ? '#ffffff' : accentConfig.primaryHex,
                  border: list.completedQuestions === 0 ? `1px solid ${accentConfig.borderRgba}` : undefined
                }}
              >
                {list.completedQuestions > 0 ? 'Continuar' : 'Iniciar'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
