'use client';

import React, { useState, useMemo } from 'react';
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
  ShieldCheck,
  Search,
  BookOpen,
  ArrowRight,
  Filter
} from 'lucide-react';
import { UserStats, PerformanceFilterState, PeriodFilter } from '@/types';
import { PerformanceFilterBar } from './PerformanceFilterBar';
import { OfficialRanking } from './OfficialRanking';
import { getOfficialRanking, getPercentileColor } from '@/utils/percentile';
import { useTheme } from '@/context/ThemeContext';
import { medevoHierarchy } from '@/data/mockQuestions';

interface StatsDashboardProps {
  stats: UserStats;
  filters: PerformanceFilterState;
  onFilterChange: (filters: PerformanceFilterState) => void;
  onResetFilters: () => void;
  onSimulateDemoQuestions?: (amount: number) => void;
  onNavigateToBancoWithSubfoco?: (specialty: string, tema: string, subfoco: string) => void;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

// Dados mockados de semanas específicas para avaliação temporal detalhada
const weeksList = [
  { id: 'w-current', label: 'Semana Atual (28/09 a 04/10)', factor: 0.25, dailyData: [
    { date: 'Seg', answered: 25, correct: 20 },
    { date: 'Ter', answered: 32, correct: 26 },
    { date: 'Qua', answered: 28, correct: 22 },
    { date: 'Qui', answered: 35, correct: 28 },
    { date: 'Sex', answered: 40, correct: 33 },
    { date: 'Sáb', answered: 18, correct: 14 },
    { date: 'Dom', answered: 16, correct: 13 }
  ] },
  { id: 'w-prev1', label: 'Semana Passada (21/09 a 27/09)', factor: 0.32, dailyData: [
    { date: 'Seg', answered: 30, correct: 24 },
    { date: 'Ter', answered: 42, correct: 34 },
    { date: 'Qua', answered: 38, correct: 31 },
    { date: 'Qui', answered: 45, correct: 36 },
    { date: 'Sex', answered: 35, correct: 28 },
    { date: 'Sáb', answered: 22, correct: 18 },
    { date: 'Dom', answered: 15, correct: 11 }
  ] },
  { id: 'w-prev2', label: 'Semana 38 (14/09 a 20/09)', factor: 0.28, dailyData: [
    { date: 'Seg', answered: 28, correct: 22 },
    { date: 'Ter', answered: 35, correct: 28 },
    { date: 'Qua', answered: 30, correct: 24 },
    { date: 'Qui', answered: 36, correct: 29 },
    { date: 'Sex', answered: 32, correct: 25 },
    { date: 'Sáb', answered: 14, correct: 10 },
    { date: 'Dom', answered: 10, correct: 7 }
  ] },
  { id: 'w-prev3', label: 'Semana 37 (07/09 a 13/09)', factor: 0.26, dailyData: [
    { date: 'Seg', answered: 20, correct: 16 },
    { date: 'Ter', answered: 25, correct: 19 },
    { date: 'Qua', answered: 30, correct: 23 },
    { date: 'Qui', answered: 28, correct: 21 },
    { date: 'Sex', answered: 32, correct: 26 },
    { date: 'Sáb', answered: 18, correct: 13 },
    { date: 'Dom', answered: 12, correct: 9 }
  ] }
];

// Dados mockados de meses específicos
const monthsList = [
  { id: 'm-10-2026', label: 'Outubro 2026 (Mês Atual)', factor: 0.35, dailyData: [
    { date: 'Sem 1', answered: 194, correct: 156 },
    { date: 'Sem 2', answered: 180, correct: 144 },
    { date: 'Sem 3', answered: 0, correct: 0 },
    { date: 'Sem 4', answered: 0, correct: 0 }
  ] },
  { id: 'm-09-2026', label: 'Setembro 2026', factor: 0.72, dailyData: [
    { date: 'Sem 1', answered: 210, correct: 168 },
    { date: 'Sem 2', answered: 225, correct: 182 },
    { date: 'Sem 3', answered: 195, correct: 154 },
    { date: 'Sem 4', answered: 230, correct: 185 }
  ] },
  { id: 'm-08-2026', label: 'Agosto 2026', factor: 0.68, dailyData: [
    { date: 'Sem 1', answered: 185, correct: 145 },
    { date: 'Sem 2', answered: 198, correct: 156 },
    { date: 'Sem 3', answered: 212, correct: 171 },
    { date: 'Sem 4', answered: 205, correct: 160 }
  ] },
  { id: 'm-07-2026', label: 'Julho 2026', factor: 0.55, dailyData: [
    { date: 'Sem 1', answered: 140, correct: 108 },
    { date: 'Sem 2', answered: 165, correct: 130 },
    { date: 'Sem 3', answered: 175, correct: 138 },
    { date: 'Sem 4', answered: 180, correct: 142 }
  ] }
];

// Multiplicadores dos atalhos rápidos
const quickPeriodConfig: Record<string, { factor: number; label: string }> = {
  '7d': { factor: 0.22, label: 'Últimos 7 dias' },
  '30d': { factor: 0.52, label: 'Últimos 30 dias' },
  'mes': { factor: 0.42, label: 'Mês Atual' },
  '6m': { factor: 1.0, label: 'Últimos 6 meses (Padrão)' },
  '2026.1': { factor: 0.88, label: 'Semestre 2026.1' },
  '2026.2': { factor: 0.70, label: 'Semestre 2026.2' },
  'all': { factor: 1.35, label: 'Histórico Completo' }
};

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  stats,
  filters,
  onFilterChange,
  onResetFilters,
  onSimulateDemoQuestions,
  onNavigateToBancoWithSubfoco
}) => {
  const { accentConfig, mode } = useTheme();

  // Modos de Visualização Temporal: 'quick' (atalhos rápidos), 'week' (semana específica), 'month' (mês específico)
  const [temporalViewMode, setTemporalViewMode] = useState<'quick' | 'week' | 'month'>('quick');
  const [selectedWeekId, setSelectedWeekId] = useState<string>('w-current');
  const [selectedMonthId, setSelectedMonthId] = useState<string>('m-10-2026');

  // Filtros da Análise Profunda de Especialidades/Temas/Focos/Subfocos
  const [selectedSpecialtyTab, setSelectedSpecialtyTab] = useState<string>('Todas');
  const [selectedTemaFilter, setSelectedTemaFilter] = useState<string>('Todos');
  const [hierarchySearch, setHierarchySearch] = useState<string>('');

  // Cálculo das métricas ativas de acordo com a visão selecionada (Rápida, Semana ou Mês)
  const activeMetrics = useMemo(() => {
    let factor = 1.0;
    let label = '';
    let chartData = stats.historyByDay;

    if (temporalViewMode === 'quick') {
      const q = quickPeriodConfig[filters.period] || quickPeriodConfig['6m'];
      factor = q.factor;
      label = q.label;
      chartData = stats.historyByDay;
    } else if (temporalViewMode === 'week') {
      const w = weeksList.find((item) => item.id === selectedWeekId) || weeksList[0];
      factor = w.factor;
      label = w.label;
      chartData = w.dailyData;
    } else {
      const m = monthsList.find((item) => item.id === selectedMonthId) || monthsList[0];
      factor = m.factor;
      label = m.label;
      chartData = m.dailyData;
    }

    const answered = Math.max(1, Math.round(stats.totalAnswered * factor));
    const correct = Math.round(stats.totalCorrect * factor);
    const incorrect = Math.max(0, answered - correct);
    const accuracy = answered > 0 ? (correct / answered) * 100 : stats.accuracyRate;
    const unique = Math.round(stats.uniqueAnswered * factor);
    const reviews = Math.round(stats.reviews * factor);
    const repeated = Math.round(stats.repeated * factor);

    return {
      factor,
      label,
      answered,
      correct,
      incorrect,
      accuracy,
      unique,
      reviews,
      repeated,
      chartData
    };
  }, [temporalViewMode, filters.period, selectedWeekId, selectedMonthId, stats]);

  // Lista de especialidades presentes na hierarquia
  const specialtiesList = useMemo(() => {
    const list = medevoHierarchy.map((h) => h.especialidade);
    return ['Todas', ...list];
  }, []);

  // Lista de temas disponíveis para a especialidade selecionada
  const availableTemas = useMemo(() => {
    if (selectedSpecialtyTab === 'Todas') {
      const allTemas = medevoHierarchy.flatMap((h) => h.temas.map((t) => t.tema));
      return ['Todos', ...Array.from(new Set(allTemas))];
    }
    const found = medevoHierarchy.find((h) => h.especialidade === selectedSpecialtyTab);
    if (!found) return ['Todos'];
    return ['Todos', ...found.temas.map((t) => t.tema)];
  }, [selectedSpecialtyTab]);

  // Dados consolidados e detalhados de Focos e Subfocos
  const hierarchyDetailedStats = useMemo(() => {
    interface SubfocoPerformance {
      specialty: string;
      tema: string;
      foco: string;
      subfoco: string;
      total: number;
      correct: number;
      accuracy: number;
      dominantDifficulty: 'Fácil' | 'Médio' | 'Difícil';
      masteryStatus: 'Excelente' | 'Bom' | 'Atenção' | 'Crítico';
    }

    const result: SubfocoPerformance[] = [];

    medevoHierarchy.forEach((h) => {
      if (selectedSpecialtyTab !== 'Todas' && h.especialidade !== selectedSpecialtyTab) {
        return;
      }

      h.temas.forEach((t) => {
        if (selectedTemaFilter !== 'Todos' && t.tema !== selectedTemaFilter) {
          return;
        }

        t.focos.forEach((f) => {
          f.subfocos.forEach((sf, sfIndex) => {
            // Se houver busca por texto, filtra
            if (hierarchySearch.trim()) {
              const query = hierarchySearch.toLowerCase();
              const match =
                sf.toLowerCase().includes(query) ||
                f.foco.toLowerCase().includes(query) ||
                t.tema.toLowerCase().includes(query);
              if (!match) return;
            }

            // Geração de métricas sintéticas realistas e consistentes para o subfoco
            const baseMultiplier = (h.especialidade.length + t.tema.length + sf.length + sfIndex * 7) % 17;
            const subfocoTotal = Math.max(8, Math.round(12 + baseMultiplier * 2.2));
            const subfocoAccuracyRaw = 55 + (baseMultiplier * 3.1) % 43; // entre 55% e 96%
            const subfocoAccuracy = Math.min(97.5, Math.max(42.0, subfocoAccuracyRaw));
            const subfocoCorrect = Math.round((subfocoTotal * subfocoAccuracy) / 100);

            let dominantDifficulty: 'Fácil' | 'Médio' | 'Difícil' = 'Médio';
            if (baseMultiplier % 3 === 0) dominantDifficulty = 'Difícil';
            else if (baseMultiplier % 3 === 1) dominantDifficulty = 'Fácil';

            let masteryStatus: 'Excelente' | 'Bom' | 'Atenção' | 'Crítico' = 'Bom';
            if (subfocoAccuracy >= 80) masteryStatus = 'Excelente';
            else if (subfocoAccuracy >= 70) masteryStatus = 'Bom';
            else if (subfocoAccuracy >= 50) masteryStatus = 'Atenção';
            else masteryStatus = 'Crítico';

            result.push({
              specialty: h.especialidade,
              tema: t.tema,
              foco: f.foco,
              subfoco: sf,
              total: subfocoTotal,
              correct: subfocoCorrect,
              accuracy: subfocoAccuracy,
              dominantDifficulty,
              masteryStatus
            });
          });
        });
      });
    });

    return result;
  }, [selectedSpecialtyTab, selectedTemaFilter, hierarchySearch]);

  const officialRanking = getOfficialRanking(filters, {
    answered: stats.totalAnswered,
    correct: stats.totalCorrect,
    name: 'Você'
  });

  const { percentileInfo } = stats;
  const tier = getPercentileColor(percentileInfo.percentile);

  // Cores de alto contraste para modo claro e escuro
  const tierTextColor = mode === 'light' ? tier.textLight : tier.textDark;

  return (
    <div className="space-y-6">
      {/* 0. SELETOR AVANÇADO DE PERÍODO (RÁPIDO, POR SEMANA OU POR MÊS ESPECÍFICO) */}
      <div className="bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 p-5 sm:p-6 rounded-3xl shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Acompanhamento de Desempenho por Período
                </h3>
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-xs">
                  {activeMetrics.label}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Avalie métricas de acertos por semana específica, mês a mês ou intervalos rápidos
              </p>
            </div>
          </div>

          {/* Abas de Modo de Visualização Temporal */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setTemporalViewMode('quick')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                temporalViewMode === 'quick'
                  ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Atalhos Rápidos
            </button>
            <button
              type="button"
              onClick={() => setTemporalViewMode('week')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                temporalViewMode === 'week'
                  ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              📅 Por Semana
            </button>
            <button
              type="button"
              onClick={() => setTemporalViewMode('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                temporalViewMode === 'month'
                  ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🗓️ Por Mês
            </button>
          </div>
        </div>

        {/* Sub-barras contextuais de seleção dependendo do modo */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2">
          {temporalViewMode === 'quick' && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 mr-1">Intervalo:</span>
              {[
                { id: '7d', label: '7 Dias' },
                { id: '30d', label: '30 Dias' },
                { id: 'mes', label: 'Mês Atual' },
                { id: '6m', label: '6 Meses' },
                { id: '2026.1', label: '2026.1' },
                { id: 'all', label: 'Histórico Completo' }
              ].map((periodItem) => {
                const isSelected = filters.period === periodItem.id;
                return (
                  <button
                    key={periodItem.id}
                    type="button"
                    onClick={() => onFilterChange({ ...filters, period: periodItem.id as PeriodFilter })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs scale-102 font-extrabold'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {periodItem.label}
                  </button>
                );
              })}
            </div>
          )}

          {temporalViewMode === 'week' && (
            <div className="flex flex-wrap items-center gap-1.5 w-full">
              <span className="text-xs font-bold text-slate-500 mr-1">Selecione a Semana:</span>
              {weeksList.map((week) => {
                const isSelected = selectedWeekId === week.id;
                return (
                  <button
                    key={week.id}
                    type="button"
                    onClick={() => setSelectedWeekId(week.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs scale-102 font-extrabold'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {week.label}
                  </button>
                );
              })}
            </div>
          )}

          {temporalViewMode === 'month' && (
            <div className="flex flex-wrap items-center gap-1.5 w-full">
              <span className="text-xs font-bold text-slate-500 mr-1">Selecione o Mês:</span>
              {monthsList.map((m) => {
                const isSelected = selectedMonthId === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMonthId(m.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs scale-102 font-extrabold'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Barra de Filtros Complementar */}
      <PerformanceFilterBar
        filters={filters}
        onChange={onFilterChange}
        onReset={onResetFilters}
      />

      {/* 1. CARDS KPI PRINCIPAIS DINÂMICOS CONFORME O PERÍODO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Volume no Período */}
        <div className="bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Volume no Período
              </span>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs"
                style={{ backgroundColor: accentConfig.bgRgba, color: accentConfig.primaryHex }}
              >
                <Award className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {activeMetrics.answered}
              </span>
              <span className="text-xs text-slate-500 font-medium">questões</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {activeMetrics.unique} resoluções únicas • {activeMetrics.reviews} revisões
            </p>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-1.5 rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, Math.round((activeMetrics.answered / 500) * 100))}%`,
                backgroundColor: accentConfig.primaryHex
              }}
            />
          </div>
        </div>

        {/* Card 2: Total de Acertos no Período */}
        <div className="bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Acertos no Período
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                {activeMetrics.correct}
              </span>
              <span className="text-xs text-slate-500">acertos</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {activeMetrics.incorrect} questões erradas no período
            </p>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, activeMetrics.accuracy)}%` }}
            />
          </div>
        </div>

        {/* Card 3: Taxa de Acerto no Período */}
        <div className="bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Taxa de Acerto (%)
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {activeMetrics.accuracy.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500">aproveitamento</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Desempenho bruto no intervalo ({activeMetrics.label})
            </p>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, activeMetrics.accuracy)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. CARD DO MODELO ESTATÍSTICO IRT (TRI) & PERCENTIL BAYESIANO */}
      <div className="bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs"
              style={{ backgroundColor: tier.bgRgba, color: tier.color }}
            >
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Modelo Estatístico IRT 2PL & Percentil Oficial
                </h3>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs"
                  style={{
                    backgroundColor: tier.bgRgba,
                    borderColor: tier.borderRgba,
                    color: tierTextColor
                  }}
                >
                  {percentileInfo.statusLabel || (percentileInfo.status === 'official' ? 'Ranking Oficial' : percentileInfo.status === 'provisional' ? 'Ranking Provisório' : 'Sem Ranking')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Estimativa Bayesiana MAP (θ) ponderada por dificuldade e regularização de incerteza
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              Validação Ativa: 0 anuladas • Sem duplicatas
            </span>
          </div>
        </div>

        {/* Conteúdo do Percentil */}
        {percentileInfo.status === 'unranked' || percentileInfo.status === 'locked' ? (
          <div className="p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <Lock className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
              <div className="space-y-1.5">
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  Continue resolvendo questões para liberar seu percentil
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-xl">
                  Para participar do <strong>Ranking Provisório</strong>, é necessário resolver pelo menos <strong>150 questões válidas</strong>. Você resolveu <strong>{percentileInfo.validQuestionsCount || stats.totalAnswered} questões válidas</strong>.
                  Faltam <strong className="text-amber-700 dark:text-amber-400">{percentileInfo.missingForNextTier || Math.max(0, 150 - stats.totalAnswered)} questões</strong> para desbloqueio!
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ao atingir 500 questões válidas, seu percentil torna-se consolidado no Ranking Oficial.
                </p>
              </div>
            </div>

            {onSimulateDemoQuestions && (
              <div className="shrink-0 flex flex-col gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onSimulateDemoQuestions(150)}
                  className="px-4 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all cursor-pointer text-center shadow-md shadow-blue-600/20"
                >
                  Simular +150 (Provisório)
                </button>
                <button
                  onClick={() => onSimulateDemoQuestions(500)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all cursor-pointer text-center"
                >
                  Simular +500 (Oficial)
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Box Principal de P-valor */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-baseline gap-4">
                <span
                  className="text-5xl sm:text-6xl font-black font-mono tracking-tight flex items-center gap-3"
                  style={{ color: tierTextColor }}
                >
                  <span className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: tier.color }} />
                  P{percentileInfo.percentile}
                </span>
                <div>
                  <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white block">
                    {percentileInfo.status === 'provisional' ? 'Percentil Provisório:' : 'Percentil Oficial:'} À frente de{' '}
                    <strong style={{ color: tierTextColor }}>{percentileInfo.percentile}%</strong> dos concorrentes.
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Faixa: <strong>{tier.name}</strong> ({tier.rangeLabel}) • População elegível: <strong>{percentileInfo.eligibleTotalStudents} candidatos</strong>
                  </span>
                </div>
              </div>

              {/* Barra de Progresso do Percentil */}
              <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-200 dark:border-slate-800">
                <div
                  className="h-3 rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.max(5, percentileInfo.percentile || 0)}%`,
                    backgroundColor: tier.color
                  }}
                />
              </div>

              {/* Grid com métricas aprofundadas da IRT */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Habilidade (θ)</div>
                  <div className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                    {percentileInfo.theta !== undefined ? (percentileInfo.theta > 0 ? `+${percentileInfo.theta.toFixed(2)}` : percentileInfo.theta.toFixed(2)) : '+1.42'}
                  </div>
                  <div className="text-[10px] text-slate-500">Escala z latente</div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Incerteza (SE)</div>
                  <div className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                    ±{percentileInfo.standard_error !== undefined ? percentileInfo.standard_error.toFixed(2) : '0.12'}
                  </div>
                  <div className="text-[10px] text-slate-500">Erro padrão Fisher</div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Confiabilidade</div>
                  <div className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                    {percentileInfo.reliability !== undefined ? `${(percentileInfo.reliability * 100).toFixed(1)}%` : '88.5%'}
                  </div>
                  <div className="text-[10px] text-slate-500">Precisão de teste</div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Score Ajustado</div>
                  <div className="text-base font-extrabold font-mono text-blue-600 dark:text-blue-400">
                    {percentileInfo.adjustedScore.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500">Shrinkage + volume</div>
                </div>
              </div>

              {percentileInfo.status === 'provisional' && (
                <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300">
                  ⚡ <strong>Ranking Provisório:</strong> Faltam <strong>{percentileInfo.missingForOfficial} questões</strong> para homologação definitiva no Ranking Oficial (≥500).
                </div>
              )}
            </div>

            {/* Box Lateral com Status da Homologação */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Elegibilidade do Ranking
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono flex items-center gap-2">
                {percentileInfo.status === 'official' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>Oficial Homologado</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    <span>Provisório Ativo</span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Baseado em <strong>{percentileInfo.validQuestionsCount || stats.totalAnswered} questões válidas</strong> com dificuldade conhecida (Fácil, Média, Difícil).
              </p>
              {onSimulateDemoQuestions && (
                <button
                  onClick={() => onSimulateDemoQuestions(100)}
                  className="w-full mt-2 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:scale-102"
                  style={{
                    backgroundColor: accentConfig.bgRgba,
                    color: accentConfig.primaryHex,
                    border: `1px solid ${accentConfig.borderRgba}`
                  }}
                >
                  + Simular mais 100 questões
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. ANÁLISE ALTAMENTE DETALHADA: GRANDES ÁREAS, TEMAS, FOCOS E SUBFOCOS */}
      <div className="bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Diagnóstico Detalhado por Foco e Subfoco
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Acompanhamento minucioso de acertos, domínio e prioridade de estudo em cada subtema
              </p>
            </div>
          </div>

          {/* Busca rápida de subfoco */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={hierarchySearch}
              onChange={(e) => setHierarchySearch(e.target.value)}
              placeholder="Buscar subfoco ou tema..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Seletor de Grande Área */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              Filtrar por Grande Área
            </span>
            <span className="text-xs text-slate-500">
              {hierarchyDetailedStats.length} subfocos mapeados
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {specialtiesList.map((spec) => {
              const isSelected = selectedSpecialtyTab === spec;
              return (
                <button
                  key={spec}
                  type="button"
                  onClick={() => {
                    setSelectedSpecialtyTab(spec);
                    setSelectedTemaFilter('Todos');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs font-extrabold scale-102'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {spec}
                </button>
              );
            })}
          </div>
        </div>

        {/* Seletor de Tema dentro da Grande Área */}
        {availableTemas.length > 2 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 mr-1">Tema:</span>
            {availableTemas.map((tema) => {
              const isSelected = selectedTemaFilter === tema;
              return (
                <button
                  key={tema}
                  type="button"
                  onClick={() => setSelectedTemaFilter(tema)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  {tema}
                </button>
              );
            })}
          </div>
        )}

        {/* Tabela / Cards de Subfocos Detalhados */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm text-slate-800 dark:text-slate-200">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-400 uppercase tracking-wider font-extrabold text-[11px]">
                <th className="py-3 px-4">Grande Área / Tema</th>
                <th className="py-3 px-4">Foco & Subfoco</th>
                <th className="py-3 px-4 text-center">Questões</th>
                <th className="py-3 px-4 text-center">Taxa de Acerto</th>
                <th className="py-3 px-4 text-center">Nível de Domínio</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {hierarchyDetailedStats.slice(0, 15).map((row, index) => {
                const masteryBadge = {
                  Excelente: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
                  Bom: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800',
                  Atenção: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
                  Crítico: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                }[row.masteryStatus];

                return (
                  <tr
                    key={`${row.subfoco}-${index}`}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 block">
                        {row.specialty}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {row.tema}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {row.subfoco}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {row.foco}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-xs text-slate-900 dark:text-white">
                      <span>{row.total}</span>
                      <span className="text-[10px] text-slate-500 font-normal block">
                        ({row.correct} acertos)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-white block">
                        {row.accuracy.toFixed(1)}%
                      </span>
                      <div className="w-20 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            row.accuracy >= 80 ? 'bg-emerald-500' : row.accuracy >= 70 ? 'bg-blue-500' : row.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${row.accuracy}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${masteryBadge}`}>
                        {row.masteryStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {onNavigateToBancoWithSubfoco ? (
                        <button
                          type="button"
                          onClick={() => onNavigateToBancoWithSubfoco(row.specialty, row.tema, row.subfoco)}
                          className="px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          Treinar
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500">Mapeado</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. GRÁFICOS DE EVOLUÇÃO E DISTRIBUIÇÃO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                Evolução no Período Selecionado
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {activeMetrics.label}: Volume de resolução e taxa de acertos
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeMetrics.chartData}>
                <XAxis dataKey="date" stroke={mode === 'light' ? '#475569' : '#94a3b8'} fontSize={12} tickLine={false} />
                <YAxis stroke={mode === 'light' ? '#475569' : '#94a3b8'} fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: mode === 'light' ? '#ffffff' : '#0f172a',
                    borderColor: mode === 'light' ? '#cbd5e1' : '#334155',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    color: mode === 'light' ? '#0f172a' : '#f8fafc'
                  }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="answered" name="Resolvidas" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="correct" name="Acertos" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Distribuição por Grande Área */}
        <div className="bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                Distribuição por Grande Área
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Proporção das 5 grandes áreas da residência
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <Award className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.bySpecialty.map((s) => ({
                    name: s.specialty,
                    value: Math.max(1, Math.round(s.total * activeMetrics.factor))
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stats.bySpecialty.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: mode === 'light' ? '#ffffff' : '#0f172a',
                    borderColor: mode === 'light' ? '#cbd5e1' : '#334155',
                    borderRadius: '12px',
                    color: mode === 'light' ? '#0f172a' : '#f8fafc'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. TABELA DE PERFORMANCE POR ESPECIALIDADE */}
      <div className="bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs">
        <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white mb-4">
          Resumo Consolidado por Grande Área
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-800 dark:text-slate-200">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-400 uppercase tracking-wider font-extrabold text-[11px]">
                <th className="py-3 px-4">Grande Área</th>
                <th className="py-3 px-4 text-center">Questões</th>
                <th className="py-3 px-4 text-center">Acertos</th>
                <th className="py-3 px-4 text-right">Taxa de Acerto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.bySpecialty.map((item) => (
                <tr key={item.specialty} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {item.specialty}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-900 dark:text-white">
                    {Math.round(item.total * activeMetrics.factor)}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {Math.round(item.correct * activeMetrics.factor)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                      {item.accuracy.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. TABELA DE RANKING INTEGRADA */}
      <OfficialRanking
        ranking={officialRanking}
        filters={filters}
        userQuestions={stats.totalAnswered}
      />
    </div>
  );
};
