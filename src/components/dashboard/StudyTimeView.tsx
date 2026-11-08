'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  LabelList
} from 'recharts';
import {
  Clock,
  Calendar,
  BookOpen,
  Layers,
  FileText,
  RotateCcw,
  Timer,
  ChevronRight,
  TrendingUp,
  Sparkles,
  HelpCircle,
  MoreHorizontal,
  X,
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react';
import { StudySession } from '@/types/studyTimer';
import { UserAnswerItem, PerformanceFilterState } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { getLocalDateStr } from '@/context/StudyTimerContext';
import { formatSecondsToDetailed } from './StudyTimeAnalyticsCard';

export interface StudyTimeViewProps {
  sessions: StudySession[];
  filteredAnswers?: UserAnswerItem[];
  filters: PerformanceFilterState;
  onFilterChange: (filters: PerformanceFilterState) => void;
  periodLabel: string;
  onOpenCalendar?: () => void;
  onNavigateToSpecialty?: (specialty: string) => void;
}

// 5 Grandes Especialidades Canônicas da Residência Médica
export const CANONICAL_5_SPECIALTIES = [
  'Clínica Médica',
  'Cirurgia Geral',
  'Pediatria',
  'Ginecologia e Obstetrícia',
  'Medicina Preventiva e Social'
] as const;

export type CanonicalSpecialtyName = typeof CANONICAL_5_SPECIALTIES[number];

const CANONICAL_COLORS: Record<CanonicalSpecialtyName, string> = {
  'Clínica Médica': '#3B82F6',               // Azul
  'Cirurgia Geral': '#10B981',               // Verde
  'Pediatria': '#F59E0B',                    // Âmbar
  'Ginecologia e Obstetrícia': '#EC4899',    // Rosa / Pink
  'Medicina Preventiva e Social': '#06B6D4'  // Ciano
};

/**
 * Normaliza qualquer especialidade/subespecialidade médica para uma das 5 Grandes Áreas Canônicas
 */
export function mapToCanonicalSpecialty(specName?: string): CanonicalSpecialtyName {
  if (!specName) return 'Clínica Médica';
  const clean = specName.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Cirurgia
  if (
    clean.includes('cirurg') ||
    clean.includes('urolog') ||
    clean.includes('trauma') ||
    clean.includes('ortoped') ||
    clean.includes('anestesi') ||
    clean.includes('vascular') ||
    clean.includes('otorrino') ||
    clean.includes('oftalmo')
  ) {
    return 'Cirurgia Geral';
  }

  // Pediatria
  if (
    clean.includes('pediat') ||
    clean.includes('neonat') ||
    clean.includes('puericult') ||
    clean.includes('lactente')
  ) {
    return 'Pediatria';
  }

  // Ginecologia e Obstetrícia
  if (
    clean.includes('ginec') ||
    clean.includes('obstet') ||
    clean.includes('parto') ||
    clean.includes('puerper') ||
    clean.includes('prenatal') ||
    clean === 'go'
  ) {
    return 'Ginecologia e Obstetrícia';
  }

  // Medicina Preventiva e Social
  if (
    clean.includes('prevent') ||
    clean.includes('social') ||
    clean.includes('epidemiol') ||
    clean.includes('sus') ||
    clean.includes('saude coletiva') ||
    clean.includes('saude publica') ||
    clean.includes('etica') ||
    clean.includes('bioetica')
  ) {
    return 'Medicina Preventiva e Social';
  }

  // Padrão: Clínica Médica (Cardiologia, Nefrologia, Pneumo, Gastro, Infecto, Derma, Reumato, Hemato, etc.)
  return 'Clínica Médica';
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTimeBarTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const displayTitle = data.dateFull || (data.date && data.date !== data.label ? `${data.label} (${data.date})` : (data.date || label));
    const studyHoursFormatted = data.studyHoursFormatted || (data.studySeconds > 0 ? formatSecondsToDetailed(data.studySeconds) : '0m');
    const sessionsCount = data.sessionsCount || 0;
    const trendHours = data.trendStudyHours || 0;

    return (
      <div className="bg-[var(--bg-card)]/95 backdrop-blur-md border border-[var(--card-border)] rounded-xl p-3.5 shadow-2xl min-w-[200px] text-xs">
        <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-2 mb-2.5">
          <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider font-heading">{displayTitle}</span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/25">
            {sessionsCount} {sessionsCount === 1 ? 'sessão' : 'sessões'}
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Tempo Estudado:
            </span>
            <span className="font-black text-slate-900 dark:text-white font-[var(--font-inter)] tabular-nums">
              {studyHoursFormatted}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-zinc-500" />
              Média Móvel:
            </span>
            <span className="font-bold text-slate-700 dark:text-zinc-300 font-[var(--font-inter)] tabular-nums">
              {trendHours}h / dia
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const StudyTimeView: React.FC<StudyTimeViewProps> = ({
  sessions,
  filteredAnswers = [],
  filters,
  onFilterChange,
  periodLabel,
  onOpenCalendar,
  onNavigateToSpecialty
}) => {
  const { mode } = useTheme();

  // Estado da especialidade selecionada no Donut para drill-down de temas
  const [selectedSpecialty, setSelectedSpecialty] = useState<CanonicalSpecialtyName | null>(null);
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);
  const [themeSearchQuery, setThemeSearchQuery] = useState('');

  // 1. Cálculos de Top Cards
  const totalSeconds = useMemo(() => {
    return sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  }, [sessions]);

  const activeDaysCount = useMemo(() => {
    const daysSet = new Set<string>();
    sessions.forEach((s) => {
      if (s.startTime) {
        const key = getLocalDateStr(s.startTime);
        if (key) {
          daysSet.add(key);
        }
      }
    });
    return daysSet.size;
  }, [sessions]);

  const avgDailySeconds = useMemo(() => {
    if (activeDaysCount <= 0 || totalSeconds <= 0) return 0;
    return Math.round(totalSeconds / activeDaysCount);
  }, [totalSeconds, activeDaysCount]);

  const avgSessionSeconds = useMemo(() => {
    if (sessions.length <= 0 || totalSeconds <= 0) return 0;
    return Math.round(totalSeconds / sessions.length);
  }, [totalSeconds, sessions.length]);

  // 2. Gráfico de Evolução Diária (Barras de Horas de Estudo)
  const evolutionChartData = useMemo(() => {
    const dayMap = new Map<string, { seconds: number; count: number; dateObj: Date }>();
    const now = new Date();
    const periodDays = filters.period === '7d' ? 7 : filters.period === '3m' ? 90 : filters.period === '6m' ? 180 : 30;

    // Inicializa os dias da janela
    for (let i = periodDays - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = getLocalDateStr(d);
      dayMap.set(key, { seconds: 0, count: 0, dateObj: d });
    }

    // Preenche com sessões
    sessions.forEach((s) => {
      if (!s.startTime) return;
      const key = getLocalDateStr(s.startTime);
      if (key && dayMap.has(key)) {
        const prev = dayMap.get(key)!;
        prev.seconds += s.durationSeconds || 0;
        prev.count += 1;
      }
    });

    const entries = Array.from(dayMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    // Média móvel (3 dias)
    return entries.map(([key, data], idx, arr) => {
      const hours = Number((data.seconds / 3600).toFixed(2));
      const windowItems = arr.slice(Math.max(0, idx - 2), idx + 1);
      const avgWindowSecs = windowItems.reduce((acc, curr) => acc + curr[1].seconds, 0) / windowItems.length;
      const trendHours = Number((avgWindowSecs / 3600).toFixed(1));

      const dayStr = String(data.dateObj.getDate()).padStart(2, '0');
      const monthStr = String(data.dateObj.getMonth() + 1).padStart(2, '0');
      const isToday = key === now.toISOString().slice(0, 10);

      return {
        key,
        date: key,
        label: isToday ? 'Hoje' : `${dayStr}/${monthStr}`,
        dateFull: data.dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        studySeconds: data.seconds,
        studyHours: hours,
        studyHoursFormatted: formatSecondsToDetailed(data.seconds),
        sessionsCount: data.count,
        trendStudyHours: trendHours
      };
    });
  }, [sessions, filters.period]);

  // 3. Agrupamento Canônico nas 5 Grandes Especialidades
  const canonicalSpecialtyData = useMemo(() => {
    const map = new Map<CanonicalSpecialtyName, { duration: number; sessionsCount: number }>();

    // Inicializa as 5 especialidades
    CANONICAL_5_SPECIALTIES.forEach((spec) => {
      map.set(spec, { duration: 0, sessionsCount: 0 });
    });

    // Agrega as sessões
    sessions.forEach((s) => {
      const canonical = mapToCanonicalSpecialty(s.taxonomy?.especialidade);
      const curr = map.get(canonical)!;
      curr.duration += s.durationSeconds || 0;
      curr.sessionsCount += 1;
    });

    return CANONICAL_5_SPECIALTIES.map((name, idx) => {
      const data = map.get(name)!;
      const percent = totalSeconds > 0 ? (data.duration / totalSeconds) * 100 : 0;
      return {
        name,
        duration: data.duration,
        durationFormatted: formatSecondsToDetailed(data.duration),
        sessionsCount: data.sessionsCount,
        percent: Number(percent.toFixed(1)),
        color: CANONICAL_COLORS[name]
      };
    }).sort((a, b) => b.duration - a.duration);
  }, [sessions, totalSeconds]);

  // 4. Agrupamento de Temas (Drill-down por especialidade selecionada ou geral)
  const themeData = useMemo(() => {
    const map = new Map<string, { duration: number; sessionsCount: number; specialty: CanonicalSpecialtyName }>();

    sessions.forEach((s) => {
      const canonical = mapToCanonicalSpecialty(s.taxonomy?.especialidade);
      // Se há especialidade selecionada, filtra estritamente por ela
      if (selectedSpecialty && canonical !== selectedSpecialty) {
        return;
      }

      const tema = s.taxonomy?.tema?.trim() || 'Tópicos Diversos';
      const prev = map.get(tema) || { duration: 0, sessionsCount: 0, specialty: canonical };
      map.set(tema, {
        duration: prev.duration + (s.durationSeconds || 0),
        sessionsCount: prev.sessionsCount + 1,
        specialty: canonical
      });
    });

    // Se não há sessões de tema direto, verifica se há respostas filtradas com tema
    if (map.size === 0 && filteredAnswers.length > 0) {
      filteredAnswers.forEach((ans) => {
        const canonical = mapToCanonicalSpecialty(ans.specialty);
        if (selectedSpecialty && canonical !== selectedSpecialty) return;
        const tema = ans.tema?.trim() || 'Tópicos Gerais';
        const prev = map.get(tema) || { duration: 0, sessionsCount: 0, specialty: canonical };
        map.set(tema, {
          duration: prev.duration + 60, // estimativa de tempo
          sessionsCount: prev.sessionsCount + 1,
          specialty: canonical
        });
      });
    }

    // Base de cálculo para porcentagem do tema:
    // Se selecionou uma especialidade, percentual é relativo à especialidade selecionada!
    // Se nenhuma selecionada, percentual é relativo ao total geral.
    let baseSeconds = totalSeconds;
    if (selectedSpecialty) {
      const targetSpec = canonicalSpecialtyData.find((s) => s.name === selectedSpecialty);
      baseSeconds = targetSpec ? targetSpec.duration : totalSeconds;
    }

    let list = Array.from(map.entries()).map(([tema, data]) => {
      const percent = baseSeconds > 0 ? (data.duration / baseSeconds) * 100 : 0;
      return {
        tema,
        specialty: data.specialty,
        color: CANONICAL_COLORS[data.specialty],
        duration: data.duration,
        durationFormatted: formatSecondsToDetailed(data.duration),
        sessionsCount: data.sessionsCount,
        percent: Number(percent.toFixed(1))
      };
    });

    if (themeSearchQuery.trim()) {
      const q = themeSearchQuery.toLowerCase();
      list = list.filter((t) => t.tema.toLowerCase().includes(q));
    }

    return list.sort((a, b) => b.duration - a.duration);
  }, [sessions, filteredAnswers, selectedSpecialty, totalSeconds, canonicalSpecialtyData, themeSearchQuery]);

  // Se não houver nenhuma sessão no período
  if (sessions.length === 0) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--card-border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                  Tempo de Estudo
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                  {periodLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Horas líquidas, evolução cronológica e distribuição nas 5 especialidades
              </p>
            </div>
          </div>
        </div>

        <div className="py-14 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Clock className="w-8 h-8" strokeWidth={1.75} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Nenhuma sessão de estudo gravada no período ({periodLabel})
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md">
            Inicie o cronômetro no cabeçalho durante a realização de questões, teoria, flashcards ou resumos clínicos. Toda atividade finalizada será computada automaticamente nesta aba!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP CARDS (3 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Tempo Total */}
        <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-slate-400 dark:hover:border-zinc-700 transition-colors shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                Tempo Total
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {periodLabel}
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1 font-[var(--font-inter)] tabular-nums">
              {formatSecondsToDetailed(totalSeconds)}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Horas líquidas registradas no período
            </p>
          </div>
          <div className="mt-4 w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out bg-indigo-500"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Card 2: Média por Dia Ativo */}
        <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-slate-400 dark:hover:border-zinc-700 transition-colors shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                Média por Dia
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {activeDaysCount} {activeDaysCount === 1 ? 'dia ativo' : 'dias ativos'}
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1 font-[var(--font-inter)] tabular-nums">
              {formatSecondsToDetailed(avgDailySeconds)}
              <span className="text-base sm:text-lg font-medium text-slate-500 dark:text-zinc-400 ml-1">/ dia</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Ritmo de dedicação por dia de estudo
            </p>
          </div>
          <div className="mt-4 w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out bg-emerald-500"
              style={{
                width: `${Math.min(100, Math.round((avgDailySeconds / (4 * 3600)) * 100))}%`
              }}
            />
          </div>
        </div>

        {/* Card 3: Sessões Realizadas */}
        <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-slate-400 dark:hover:border-zinc-700 transition-colors shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                Sessões Realizadas
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                Média ~{formatSecondsToDetailed(avgSessionSeconds)} / sessão
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1 font-[var(--font-inter)] tabular-nums">
              {sessions.length}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Blocos de estudo concluídos com cronômetro
            </p>
          </div>
          <div className="mt-4 w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out bg-indigo-600"
              style={{
                width: `${Math.min(100, Math.round((sessions.length / 30) * 100))}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. GRÁFICO DE EVOLUÇÃO DIÁRIA (BARRAS DE HORAS DE ESTUDO + FILTROS) */}
      <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading tracking-tight">
                Evolução do Tempo de Estudo
              </h2>
            </div>

            {/* Pílulas de Filtros de Período (30D, 3M, 6M, Livre) */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-900/90 p-0.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, period: '30d' })}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${filters.period === '30d'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                30 Dias
              </button>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, period: '3m' })}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${filters.period === '3m'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                3 Meses
              </button>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, period: '6m' })}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${filters.period === '6m'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                6 Meses
              </button>
              <button
                type="button"
                onClick={() => onOpenCalendar?.()}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${filters.period === 'custom'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <Calendar className="w-3 h-3" />
                <span>Livre</span>
              </button>
            </div>
          </div>

          {/* Legenda do Gráfico */}
          <div className="flex items-center gap-3.5 text-xs flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500" />
              Tempo Estudado (h)
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-300 font-medium">
              <span className="w-3.5 h-0.5 bg-indigo-400" />
              Média Móvel (h/dia)
            </span>
          </div>
        </div>

        {/* Gráfico ComposedChart */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={evolutionChartData}
              margin={{ top: 20, right: 12, left: -22, bottom: 0 }}
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
                tick={{ fill: mode === 'dark' ? '#71717A' : '#64748B', fontSize: 11, fontWeight: 500 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: mode === 'dark' ? '#71717A' : '#64748B', fontSize: 11 }}
                tickFormatter={(v) => `${v}h`}
              />
              <RechartsTooltip content={<CustomTimeBarTooltip />} />
              <Bar
                dataKey="studyHours"
                name="Horas de Estudo"
                fill="#6366F1"
                radius={[4, 4, 0, 0]}
                maxBarSize={filters.period === '6m' ? 10 : filters.period === '3m' ? 14 : 26}
              >
                <LabelList
                  dataKey="studyHours"
                  position="top"
                  content={(props: any) => {
                    const { x, y, width, value } = props;
                    if (!value || value <= 0) return null;
                    return (
                      <text
                        x={x + width / 2}
                        y={y - 6}
                        fill={mode === 'dark' ? '#A1A1AA' : '#64748B'}
                        textAnchor="middle"
                        fontSize={10}
                        fontWeight={700}
                        className="font-[var(--font-inter)] tabular-nums"
                      >
                        {value >= 1 ? `${value}h` : `${Math.round(value * 60)}m`}
                      </text>
                    );
                  }}
                />
              </Bar>
              <Line
                type="monotone"
                dataKey="trendStudyHours"
                stroke="#818CF8"
                strokeWidth={2}
                dot={false}
                name="Média Móvel"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. DONUT DAS 5 ESPECIALIDADES COM DRILL-DOWN DE TEMAS AO CLICAR */}
      <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--card-border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                  Distribuição por Especialidade & Temas
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                  5 Grandes Áreas
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Clique em qualquer especialidade no Donut para visualizar os temas estudados por porcentagem
              </p>
            </div>
          </div>

          {selectedSpecialty && (
            <button
              type="button"
              onClick={() => setSelectedSpecialty(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver Todas as Especialidades</span>
            </button>
          )}
        </div>

        {/* Grid: Donut + Lista das 5 Especialidades (Esq) vs. Drill-down de Temas (Dir) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna Esquerda: Donut + 5 Especialidades */}
          <div className="lg:col-span-5 bg-slate-50/60 dark:bg-zinc-900/40 rounded-xl p-5 border border-slate-200/80 dark:border-zinc-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                5 Especialidades da Residência
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 font-[var(--font-inter)] tabular-nums">
                {canonicalSpecialtyData.filter((s) => s.duration > 0).length} de 5 ativas
              </span>
            </div>

            {/* Donut Recharts */}
            <div className="h-52 relative flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={canonicalSpecialtyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="duration"
                    onClick={(entry) => {
                      if (entry && entry.name) {
                        setSelectedSpecialty((prev) => (prev === entry.name ? null : (entry.name as CanonicalSpecialtyName)));
                      }
                    }}
                    cursor="pointer"
                  >
                    {canonicalSpecialtyData.map((entry, index) => {
                      const isSelected = selectedSpecialty === entry.name;
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke={isSelected ? '#FFFFFF' : 'transparent'}
                          strokeWidth={isSelected ? 3 : 1}
                          opacity={selectedSpecialty ? (isSelected ? 1 : 0.4) : 1}
                        />
                      );
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Centro do Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-500">
                  {selectedSpecialty || 'Total'}
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white font-[var(--font-inter)] tabular-nums">
                  {selectedSpecialty
                    ? canonicalSpecialtyData.find((s) => s.name === selectedSpecialty)?.durationFormatted
                    : formatSecondsToDetailed(totalSeconds)}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                  {selectedSpecialty
                    ? `${canonicalSpecialtyData.find((s) => s.name === selectedSpecialty)?.percent}% do tempo`
                    : 'Horas líquidas'}
                </span>
              </div>
            </div>

            {/* Lista Interativa das 5 Especialidades */}
            <div className="space-y-2 mt-3 pt-3 border-t border-slate-200/80 dark:border-zinc-800/80">
              {canonicalSpecialtyData.map((item, idx) => {
                const isSelected = selectedSpecialty === item.name;
                return (
                  <div
                    key={item.name}
                    onClick={() => {
                      setSelectedSpecialty(isSelected ? null : item.name);
                    }}
                    className={`flex items-center justify-between text-xs p-2.5 rounded-xl transition-all cursor-pointer ${isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-2 border-indigo-500 shadow-xs'
                        : 'hover:bg-slate-100 dark:hover:bg-zinc-800/70 border border-transparent'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className={`font-bold truncate ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-zinc-200'}`}>
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-black text-slate-900 dark:text-white font-[var(--font-inter)] tabular-nums">
                        {item.durationFormatted}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-[var(--font-inter)] tabular-nums min-w-[42px] text-right">
                        {item.percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coluna Direita: Temas Estudados por Porcentagem (Drill-down) */}
          <div className="lg:col-span-7 bg-slate-50/60 dark:bg-zinc-900/40 rounded-xl p-5 border border-slate-200/80 dark:border-zinc-800/80 flex flex-col justify-between">
            <div className="space-y-3 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                    {selectedSpecialty ? `Temas em ${selectedSpecialty}` : 'Temas Estudados'}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                    ({themeData.length} {themeData.length === 1 ? 'tema' : 'temas'})
                  </span>
                </div>

                {/* Campo de Busca Rápida de Tema */}
                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={themeSearchQuery}
                    onChange={(e) => setThemeSearchQuery(e.target.value)}
                    placeholder="Buscar tema..."
                    className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {selectedSpecialty ? (
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/50">
                  <span className="text-indigo-900 dark:text-indigo-300 font-medium">
                    Exibindo apenas temas de <strong>{selectedSpecialty}</strong> (% relativa à área)
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSpecialty(null)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Limpar filtro
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Selecione uma especialidade no Donut à esquerda para calcular a porcentagem de cada tema dentro da grande área.
                </p>
              )}
            </div>

            {/* Lista dos Temas com Porcentagem e Barra de Progresso */}
            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {themeData.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500 dark:text-zinc-400">
                  Nenhum tema encontrado para os filtros atuais.
                </div>
              ) : (
                themeData.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {item.tema}
                        </span>
                        {!selectedSpecialty && (
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 truncate hidden sm:inline">
                            ({item.specialty})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-black text-slate-900 dark:text-white font-[var(--font-inter)] tabular-nums">
                          {item.durationFormatted}
                        </span>
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 font-[var(--font-inter)] tabular-nums min-w-[42px] text-right">
                          {item.percent}%
                        </span>
                      </div>
                    </div>

                    {/* Barra de Progresso Proporcional */}
                    <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.min(100, item.percent)}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 mt-4 border-t border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
              <span>Ordenados por tempo dedicado e sessões</span>
              {selectedSpecialty && (
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  Total de {canonicalSpecialtyData.find((s) => s.name === selectedSpecialty)?.durationFormatted} em {selectedSpecialty}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
