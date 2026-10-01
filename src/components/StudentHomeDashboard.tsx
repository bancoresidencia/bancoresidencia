'use client';

import React from 'react';
import {
  Flame,
  Target,
  Award,
  BookOpen,
  Database,
  ListFilter,
  FileCheck2,
  BarChart2,
  Trophy,
  ArrowRight,
  Play,
  Clock,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  FolderOpen
} from 'lucide-react';
import { UserStats, QuestionList, ActiveTab, Modalidade } from '@/types';

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
  // Saudação dinâmica com base no horário
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { text: 'Bom dia', icon: Sun, color: 'text-amber-400' };
    } else if (hour >= 12 && hour < 18) {
      return { text: 'Boa tarde', icon: Sunset, color: 'text-orange-400' };
    } else {
      return { text: 'Boa noite', icon: Moon, color: 'text-indigo-400' };
    }
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const todayAnswered = stats.historyByDay[stats.historyByDay.length - 1]?.answered || 0;
  const goalPercentage = Math.min(100, Math.round((todayAnswered / (dailyGoal || 1)) * 100));

  const quickNavCards = [
    {
      tab: 'banco',
      title: 'Banco de Questões',
      desc: 'Pratique questões com filtros por banca, especialidade e gabaritos.',
      icon: Database,
      color: 'from-blue-600 to-blue-700',
      tag: 'Prática'
    },
    {
      tab: 'listas',
      title: 'Listas de Questões',
      desc: 'Crie cadernos personalizados, pastas e subpastas de estudo.',
      icon: ListFilter,
      color: 'from-indigo-600 to-indigo-700',
      tag: 'Organização'
    },
    {
      tab: 'simulados',
      title: 'Simulados',
      desc: 'Provas cronometradas das principais bancas de residência.',
      icon: FileCheck2,
      color: 'from-emerald-600 to-teal-700',
      tag: 'Avaliação'
    },
    {
      tab: 'stats',
      title: 'Meu Desempenho',
      desc: 'Gráficos detalhados, tempo de estudo e evolução de acertos.',
      icon: BarChart2,
      color: 'from-purple-600 to-violet-700',
      tag: 'Métricas'
    },
    {
      tab: 'ranking',
      title: 'Ranking da Plataforma',
      desc: 'Classificação semestral baseada em percentil e score ajustado.',
      icon: Trophy,
      color: 'from-amber-600 to-orange-700',
      tag: 'Competitivo'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Saudação ao Aluno & Boas-Vindas */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/60 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-300 font-medium text-sm">
              <GreetingIcon className={`w-4 h-4 ${greeting.color}`} />
              <span>{greeting.text},</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {studentName}
            </h1>
            <p className="text-xs text-slate-400">
              Modalidade ativa: <strong className="text-blue-400">{modalidade}</strong> • Foco no Semestre 2026.1
            </p>
          </div>

          {/* Destaque de Sequência de Dias */}
          <div className="flex items-center gap-3 bg-slate-950/70 border border-amber-500/20 px-4 py-3 rounded-xl shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shadow-sm">
              <Flame className="w-6 h-6 fill-amber-400" />
            </div>
            <div>
              <div className="text-xl font-black text-amber-400 font-mono">
                {stats.streakDays} dias
              </div>
              <div className="text-[11px] text-slate-400 font-medium">de sequência de estudos</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid de Resumo Diário: Meta do Dia + % Acertos com Total + Percentil na Modalidade Padrão */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card: Meta Diária de Questões */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Meta do Dia</span>
            </div>
            {/* Seletor Rápido de Meta */}
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <label htmlFor="goal-input" className="text-[11px]">Meta:</label>
              <select
                id="goal-input"
                value={dailyGoal}
                onChange={(e) => onUpdateDailyGoal(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 text-white rounded px-2 py-0.5 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value={10}>10 quest.</option>
                <option value={20}>20 quest.</option>
                <option value={30}>30 quest.</option>
                <option value={50}>50 quest.</option>
                <option value={100}>100 quest.</option>
              </select>
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-white font-mono">
              {todayAnswered} <span className="text-sm font-normal text-slate-400">/ {dailyGoal}</span>
            </div>
            <span className="text-xs font-bold text-blue-400">{goalPercentage}% concluída</span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${goalPercentage}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            {todayAnswered >= dailyGoal
              ? '🎉 Parabéns! Meta do dia batida com sucesso!'
              : `Faltam ${Math.max(0, dailyGoal - todayAnswered)} questões para atingir sua meta de hoje.`}
          </div>
        </div>

        {/* Card: % de Acertos com Total de Questões */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Aproveitamento Global</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
              Geral
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 font-mono">
              {stats.totalAnswered > 0 ? `${stats.accuracyRate.toFixed(1)}%` : '0%'}
            </span>
            <span className="text-xs text-slate-400">taxa de acertos</span>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/70">
            <span><strong>{stats.totalAnswered}</strong> questões resolvidas</span>
            <span className="text-emerald-400 font-medium">({stats.totalCorrect} certas)</span>
          </div>
        </div>

        {/* Card: Percentil do Aluno na Modalidade Padrão */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Percentil ({modalidade})</span>
            </div>
            {stats.percentileInfo.status === 'official' ? (
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                Oficial
              </span>
            ) : stats.percentileInfo.status === 'approximate' ? (
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold">
                Aproximado
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold">
                Calibrando
              </span>
            )}
          </div>

          {stats.percentileInfo.status !== 'locked' ? (
            <div>
              <div className="text-3xl font-black text-purple-400 font-mono">
                P{stats.percentileInfo.percentile}
              </div>
              <div className="text-xs text-slate-300 mt-1">
                Acima de <strong>{stats.percentileInfo.percentile}%</strong> dos estudantes de {modalidade}.
              </div>
            </div>
          ) : (
            <div>
              <div className="text-lg font-bold text-slate-300">Em Calibração</div>
              <div className="text-xs text-slate-400 mt-1">
                Faltam <strong>{stats.percentileInfo.missingForApprox} questões</strong> para revelar seu percentil aproximado.
              </div>
            </div>
          )}

          <div className="pt-1 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/70">
            <button
              onClick={() => onNavigate('stats')}
              className="text-blue-400 hover:underline text-[11px] font-medium cursor-pointer"
            >
              Ver detalhes do percentil →
            </button>
          </div>
        </div>
      </div>

      {/* 3. Banner para Continuar a Lista em Andamento */}
      {recentList && (
        <div className="bg-gradient-to-r from-blue-950/50 via-slate-900 to-slate-900 border border-blue-500/40 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                Continuar de Onde Parou
              </span>
              <span className="text-xs text-slate-400">• Estudado {recentList.lastStudiedAt}</span>
            </div>
            <h3 className="text-base font-bold text-white truncate">{recentList.title}</h3>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>{recentList.completedQuestions} de {recentList.totalQuestions} resolvidas ({recentList.progressPercentage}%)</span>
            </div>
            <div className="w-full max-w-md bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-1.5 rounded-full"
                style={{ width: `${recentList.progressPercentage}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => onContinueList(recentList)}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-600/30"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Continuar Lista</span>
          </button>
        </div>
      )}

      {/* 4. Acesso Rápido às Áreas Principais */}
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
          Acesso Rápido
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {quickNavCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.tab}
                onClick={() => onNavigate(card.tab as ActiveTab)}
                className="text-left bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 p-4 rounded-xl transition-all cursor-pointer flex flex-col justify-between h-36 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-sm`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">{card.tag}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                    {card.title}
                  </h4>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                  <span>Acessar</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Seção de Listas Criadas pelo Aluno (com suporte a Pastas e Subpastas) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Minhas Listas & Pastas Recentes</h3>
              <p className="text-xs text-slate-400">Cadernos de questões organizados por tema clínico</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('listas')}
            className="text-xs font-semibold text-blue-400 hover:underline cursor-pointer"
          >
            Gerenciar Todas as Pastas & Listas →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allLists.slice(0, 4).map((list) => (
            <div
              key={list.id}
              className="bg-slate-950 border border-slate-800/80 hover:border-slate-700 p-3.5 rounded-lg flex items-center justify-between gap-3 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">{list.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {list.completedQuestions} / {list.totalQuestions} questões • {list.progressPercentage}%
                </div>
              </div>
              <button
                onClick={() => onContinueList(list)}
                className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white font-medium transition-colors cursor-pointer"
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
