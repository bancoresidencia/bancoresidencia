'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Award,
  CheckCircle2,
  Calendar,
  Lock,
  Sparkles,
  TrendingUp,
  RotateCcw,
  Copy,
  Flame,
  Info
} from 'lucide-react';
import { UserStats, PerformanceFilterState } from '@/types';
import { PerformanceFilterBar } from './PerformanceFilterBar';
import { OfficialRanking } from './OfficialRanking';
import { getOfficialRanking } from '@/utils/percentile';

interface StatsDashboardProps {
  stats: UserStats;
  filters: PerformanceFilterState;
  onFilterChange: (filters: PerformanceFilterState) => void;
  onResetFilters: () => void;
  onSimulateDemoQuestions?: (amount: number) => void;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  stats,
  filters,
  onFilterChange,
  onResetFilters,
  onSimulateDemoQuestions
}) => {
  const pieData = stats.bySpecialty.map((item) => ({
    name: item.specialty,
    value: item.total
  }));

  const officialRanking = getOfficialRanking(filters, {
    answered: stats.totalAnswered,
    correct: stats.totalCorrect,
    name: 'Dr. Usuário'
  });

  const { percentileInfo } = stats;

  return (
    <div className="space-y-6">
      {/* Barra de Filtros Superior */}
      <PerformanceFilterBar
        filters={filters}
        onChange={onFilterChange}
        onReset={onResetFilters}
      />

      {/* Cards Principais em Destaque */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total de Questões com Únicas, Revisões e Repetidas */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Questões Feitas ao Total
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          
          <div className="mt-3 text-3xl font-extrabold text-white font-mono">
            {stats.totalAnswered}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/50">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Únicas</span>
              <span className="text-sm font-bold text-blue-400">{stats.uniqueAnswered}</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/50">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Revisões</span>
              <span className="text-sm font-bold text-amber-400">{stats.reviews}</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/50">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Repetidas</span>
              <span className="text-sm font-bold text-purple-400">{stats.repeated}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Taxa de Acerto */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Taxa de Acerto
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 text-3xl font-extrabold text-emerald-400 font-mono">
              {stats.totalAnswered > 0 ? `${stats.accuracyRate.toFixed(1)}%` : '0.0%'}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>{stats.totalCorrect} acertos</span>
            <span className="text-slate-600">•</span>
            <span>{stats.totalIncorrect} erros</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-medium">Aproveitamento</span>
          </div>
        </div>

        {/* Card 3: Dias na Plataforma */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Dias na Plataforma
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 text-3xl font-extrabold text-purple-400 font-mono">
              {stats.daysOnPlatform} <span className="text-lg font-normal text-slate-400">dias</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 text-amber-400">
              <Flame className="w-4 h-4 fill-amber-400" /> {stats.streakDays} dias de sequência
            </span>
            <span className="text-slate-500">{stats.studyTimeMinutes} min ativos</span>
          </div>
        </div>
      </div>

      {/* Card Especial de Percentil e Posição */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Análise de Percentil do Estudante</h3>
              <p className="text-xs text-slate-400">
                Compara seu desempenho por Score Suavizado com candidatos da mesma modalidade e filtros
              </p>
            </div>
          </div>

          {percentileInfo.status === 'official' && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Percentil Oficial Homologado
            </span>
          )}
          {percentileInfo.status === 'approximate' && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Percentil Aproximado (Pré-Oficial)
            </span>
          )}
          {percentileInfo.status === 'locked' && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Em Calibração Inicial
            </span>
          )}
        </div>

        <div className="mt-5">
          {percentileInfo.status === 'locked' ? (
            <div className="p-5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Lock className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-white">Percentil Bloqueado</div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                    O aluno precisa resolver pelo menos <strong>100 questões</strong> para ter um percentil aproximado.
                    Você já resolveu <strong>{stats.totalAnswered} questões</strong>. Faltam apenas{' '}
                    <strong className="text-amber-400">{percentileInfo.missingForApprox} questões</strong> para desbloquear a sua posição aproximada!
                  </p>
                  <p className="text-[11px] text-slate-500">
                    A partir de 500 questões, seu percentil oficial é calculado e enviado para o Ranking Oficial da Plataforma.
                  </p>
                </div>
              </div>

              {onSimulateDemoQuestions && (
                <div className="shrink-0 flex flex-col gap-2">
                  <button
                    onClick={() => onSimulateDemoQuestions(100)}
                    className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer text-center shadow"
                  >
                    Simular +100 Questões
                  </button>
                  <button
                    onClick={() => onSimulateDemoQuestions(500)}
                    className="px-3.5 py-1.5 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer text-center"
                  >
                    Simular +500 (Oficial)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Box Principal de Percentil Formatado conforme instrução do usuário */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl md:text-5xl font-extrabold text-blue-400 font-mono tracking-tight">
                    P{percentileInfo.percentile}
                  </span>
                  <span className="text-sm md:text-base font-semibold text-slate-200">
                    Você está acima de aproximadamente{' '}
                    <strong className="text-emerald-400">{percentileInfo.percentile}%</strong> dos estudantes.
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                  <span className="bg-slate-800 px-3 py-1.5 rounded-lg font-mono">
                    <strong>{stats.totalAnswered}</strong> questões respondidas
                  </span>
                  <span className="bg-slate-800 px-3 py-1.5 rounded-lg font-mono">
                    <strong className="text-emerald-400">{stats.accuracyRate.toFixed(0)}%</strong> acertos
                  </span>
                  {percentileInfo.status === 'approximate' && (
                    <span className="text-amber-300 font-medium">
                      Faltam {percentileInfo.missingForOfficial} questões para o percentil oficial (500)
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  * O percentil envolve a análise do período semestral (2026.1: Jan-Jun | 2026.2: Jul-Dez).
                  O cálculo utiliza o Score Ajustado com fator de suavização bayesiana, garantindo confiabilidade estatística.
                </p>
              </div>

              {/* Box Lateral com Posição / Metas */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2 text-center md:text-left">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Base Comparativa
                </div>
                <div className="text-xl font-bold text-white">
                  {percentileInfo.eligibleTotalStudents} estudantes elegíveis
                </div>
                <p className="text-xs text-slate-400">
                  Filtro atual: {filters.modalidade} • {filters.period === '2026.2' ? '2026.2' : '2026.1'}
                </p>
                {onSimulateDemoQuestions && (
                  <button
                    onClick={() => onSimulateDemoQuestions(100)}
                    className="w-full mt-2 py-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-950/40 rounded border border-blue-900/50 cursor-pointer"
                  >
                    + Simular mais 100 resoluções
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gráficos de Evolução e Distribuição */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Evolução Diária de Questões</h3>
              <p className="text-xs text-slate-400">Volume de resolução e acertos ao longo do tempo</p>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.historyByDay}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Bar dataKey="answered" name="Resolvidas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="correct" name="Acertos" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Distribuição por Grande Área</h3>
              <p className="text-xs text-slate-400">Equilíbrio de estudo entre especialidades médicas</p>
            </div>
            <Award className="w-5 h-5 text-purple-500" />
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {pieData.length > 0 && stats.totalAnswered > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-500 text-sm">
                Resolva questões para visualizar a distribuição gráfica por especialidade.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ranking Oficial da Plataforma (Baseado em Score Ajustado e min 500 questões) */}
      <OfficialRanking
        ranking={officialRanking}
        filters={filters}
        userQuestions={stats.totalAnswered}
      />
    </div>
  );
};
