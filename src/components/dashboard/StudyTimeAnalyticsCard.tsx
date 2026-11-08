'use client';

import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from 'recharts';
import {
  Clock,
  BookOpen,
  HelpCircle,
  Layers,
  FileText,
  RotateCcw,
  Timer,
  MoreHorizontal,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronRight
} from 'lucide-react';
import { StudySession, StudyType } from '@/types/studyTimer';
import { UserAnswerItem } from '@/types';
import { useTheme } from '@/context/ThemeContext';

export interface StudyTimeAnalyticsCardProps {
  sessions: StudySession[];
  filteredAnswers?: UserAnswerItem[];
  periodLabel?: string;
  onNavigateToSpecialty?: (specialty: string) => void;
}

const CANONICAL_SPECIALTY_COLORS: Record<string, string> = {
  'clínica médica': '#3B82F6',
  'clinica medica': '#3B82F6',
  'clinica': '#3B82F6',
  'cirurgia geral': '#10B981',
  'cirurgia': '#10B981',
  'pediatria': '#F59E0B',
  'ginecologia': '#EC4899',
  'obstetrícia': '#8B5CF6',
  'obstetricia': '#8B5CF6',
  'medicina preventiva e social': '#06B6D4',
  'medicina preventiva': '#06B6D4',
  'preventiva': '#06B6D4',
  'dermatologia': '#F43F5E',
  'neurologia': '#6366F1',
  'ortopedia': '#14B8A6',
  'oftalmologia': '#84CC16',
  'psiquiatria': '#A855F7',
  'infectologia': '#EAB308',
  'cardiologia': '#EF4444',
  'endocrinologia': '#0ea5e9'
};

const FALLBACK_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EC4899',
  '#8B5CF6',
  '#06B6D4',
  '#6366F1',
  '#14B8A6',
  '#F43F5E',
  '#84CC16'
];

function getSpecialtyColor(specName: string, index: number): string {
  const normalized = specName.trim().toLowerCase();
  if (CANONICAL_SPECIALTY_COLORS[normalized]) {
    return CANONICAL_SPECIALTY_COLORS[normalized];
  }
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export function matchesSpecialty(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  const normA = a.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normB = b.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (normA === normB) return true;
  if (normA.includes(normB) || normB.includes(normA)) return true;
  return false;
}

export function formatSecondsToDetailed(totalSec: number): string {
  if (isNaN(totalSec) || totalSec <= 0) return '0m';
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  if (h > 0) {
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  if (m > 0) {
    return `${m}m`;
  }
  return `${s}s`;
}

const STUDY_TYPE_META: Record<StudyType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  questoes: { label: 'Questões', icon: HelpCircle, color: '#10B981' },
  teoria: { label: 'Teoria / Aulas', icon: BookOpen, color: '#3B82F6' },
  flashcards: { label: 'Flashcards', icon: Layers, color: '#8B5CF6' },
  resumo: { label: 'Resumo Clínico', icon: FileText, color: '#F59E0B' },
  revisao: { label: 'Revisões', icon: RotateCcw, color: '#06B6D4' },
  simulado: { label: 'Simulados', icon: Timer, color: '#EC4899' },
  outro: { label: 'Outras Atividades', icon: MoreHorizontal, color: '#64748B' }
};

export const StudyTimeAnalyticsCard: React.FC<StudyTimeAnalyticsCardProps> = ({
  sessions,
  filteredAnswers = [],
  periodLabel = '30 Dias',
  onNavigateToSpecialty
}) => {
  const { mode } = useTheme();
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);

  // Cálculos agregados
  const totalSeconds = useMemo(() => {
    return sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  }, [sessions]);

  // Agrupamento por Especialidade
  const specialtyData = useMemo(() => {
    if (sessions.length === 0) return [];

    const map = new Map<string, { duration: number; sessionsCount: number; questions: number; correct: number }>();

    sessions.forEach((s) => {
      const spec = s.taxonomy?.especialidade?.trim() || 'Geral / Outros';
      const prev = map.get(spec) || { duration: 0, sessionsCount: 0, questions: 0, correct: 0 };
      map.set(spec, {
        duration: prev.duration + (s.durationSeconds || 0),
        sessionsCount: prev.sessionsCount + 1,
        questions: prev.questions + (s.questionsCount || 0),
        correct: prev.correct + (s.correctCount || 0)
      });
    });

    return Array.from(map.entries())
      .map(([name, data], idx) => {
        const percent = totalSeconds > 0 ? (data.duration / totalSeconds) * 100 : 0;
        return {
          name,
          duration: data.duration,
          durationFormatted: formatSecondsToDetailed(data.duration),
          sessionsCount: data.sessionsCount,
          percent: Number(percent.toFixed(1)),
          questions: data.questions,
          correct: data.correct,
          color: getSpecialtyColor(name, idx)
        };
      })
      .sort((a, b) => b.duration - a.duration);
  }, [sessions, totalSeconds]);

  // Agrupamento por Tipo de Atividade
  const studyTypeData = useMemo(() => {
    const counts: Record<StudyType, { duration: number; sessionsCount: number }> = {
      questoes: { duration: 0, sessionsCount: 0 },
      teoria: { duration: 0, sessionsCount: 0 },
      flashcards: { duration: 0, sessionsCount: 0 },
      resumo: { duration: 0, sessionsCount: 0 },
      revisao: { duration: 0, sessionsCount: 0 },
      simulado: { duration: 0, sessionsCount: 0 },
      outro: { duration: 0, sessionsCount: 0 }
    };

    sessions.forEach((s) => {
      const t: StudyType = s.studyType || 'outro';
      if (counts[t]) {
        counts[t].duration += s.durationSeconds || 0;
        counts[t].sessionsCount += 1;
      } else {
        counts.outro.duration += s.durationSeconds || 0;
        counts.outro.sessionsCount += 1;
      }
    });

    const list = (Object.keys(counts) as StudyType[]).map((key) => {
      const item = counts[key];
      const percent = totalSeconds > 0 ? (item.duration / totalSeconds) * 100 : 0;
      const meta = STUDY_TYPE_META[key];
      return {
        type: key,
        label: meta.label,
        icon: meta.icon,
        color: meta.color,
        duration: item.duration,
        durationFormatted: formatSecondsToDetailed(item.duration),
        sessionsCount: item.sessionsCount,
        percent: Number(percent.toFixed(1))
      };
    });

    return list.sort((a, b) => b.duration - a.duration);
  }, [sessions, totalSeconds]);

  // Matriz de Esforço vs Eficiência (Correlacionando Tempo de Estudo com Questões Reais Respondidas)
  const effortEfficiencyMatrix = useMemo(() => {
    if (specialtyData.length === 0) return [];

    return specialtyData.map((item) => {
      // Busca respostas reais filtradas no período para essa especialidade
      const specAnswers = filteredAnswers.filter(
        (ans) => matchesSpecialty(ans.specialty, item.name)
      );

      // Volume de questões: prioriza respostas reais do banco ou acumuladas na sessão
      const totalQ = specAnswers.length > 0 ? specAnswers.length : item.questions;
      const totalCor = specAnswers.length > 0
        ? specAnswers.filter((a) => a.isCorrect).length
        : item.correct;
      const accuracy = totalQ > 0 ? (totalCor / totalQ) * 100 : 0;

      // Diagnóstico Pedagógico
      let diagnostic: {
        label: string;
        type: 'success' | 'warning' | 'danger' | 'neutral';
        tip: string;
      };

      const hours = item.duration / 3600;

      if (totalQ >= 5 && accuracy >= 75) {
        diagnostic = {
          label: 'Alta Eficiência',
          type: 'success',
          tip: 'Excelente retenção e aproveitamento. Mantenha em revisão espaçada.'
        };
      } else if (hours >= 2 && totalQ >= 5 && accuracy < 60) {
        diagnostic = {
          label: 'Gargalo de Horas',
          type: 'danger',
          tip: 'Muitas horas dedicadas com retenção abaixo do ideal. Migre para questões comentadas e flashcards.'
        };
      } else if (totalQ >= 5 && accuracy >= 60 && accuracy < 75) {
        diagnostic = {
          label: 'Equilibrado',
          type: 'warning',
          tip: 'Rendimento consistente. Focar nos subfocos com maior índice de erro.'
        };
      } else if (hours > 0 && totalQ < 5) {
        diagnostic = {
          label: 'Prática Recomendada',
          type: 'neutral',
          tip: 'Teoria/Resumo estudado, mas poucas questões feitas. Resolva questões para fixação.'
        };
      } else {
        diagnostic = {
          label: 'Pouco Praticado',
          type: 'neutral',
          tip: 'Volume e tempo reduzidos no período selecionado.'
        };
      }

      return {
        ...item,
        totalQuestions: totalQ,
        totalCorrect: totalCor,
        accuracy: Number(accuracy.toFixed(1)),
        diagnostic
      };
    });
  }, [specialtyData, filteredAnswers]);

  if (sessions.length === 0) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--card-border)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Tempo de Estudo por Especialidade & Hábitos
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Horas líquidas sincronizadas com o cronômetro ({periodLabel})
              </p>
            </div>
          </div>
        </div>

        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Clock className="w-7 h-7" strokeWidth={1.75} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Nenhuma sessão de estudo gravada no período ({periodLabel})
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md">
            Ao iniciar e finalizar o cronômetro no cabeçalho em qualquer sessão (questões, resumos, teoria ou flashcards), seus dados de horas líquidas aparecerão automaticamente integrados aqui!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-5 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--card-border)] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Tempo de Estudo por Especialidade & Hábitos
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                {periodLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Análise quantitativa de horas líquidas, métodos de estudo e matriz de esforço vs. rendimento
            </p>
          </div>
        </div>

        {/* Total Time Badge */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-900/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 block">
              Total Acumulado
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-white font-[var(--font-inter)] tabular-nums">
              {formatSecondsToDetailed(totalSeconds)}
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-zinc-800" />
          <div className="text-left">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 block">
              Sessões
            </span>
            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-[var(--font-inter)] tabular-nums">
              {sessions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Donut por Especialidade + Hábitos de Estudo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna 1: Donut Chart por Especialidade */}
        <div className="lg:col-span-6 bg-slate-50/60 dark:bg-zinc-900/40 rounded-xl p-5 border border-slate-200/80 dark:border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                Distribuição por Especialidade
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 font-[var(--font-inter)] tabular-nums">
              {specialtyData.length} {specialtyData.length === 1 ? 'área' : 'áreas'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 my-2">
            {/* Donut Recharts */}
            <div className="sm:col-span-5 h-52 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <RechartsTooltip
                    formatter={(value: any, name: any) => [
                      `${formatSecondsToDetailed(Number(value))} (${((Number(value) / totalSeconds) * 100).toFixed(1)}%)`,
                      name
                    ]}
                    contentStyle={{
                      backgroundColor: mode === 'dark' ? '#18181b' : '#ffffff',
                      borderColor: mode === 'dark' ? '#27272a' : '#e2e8f0',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: mode === 'dark' ? '#ffffff' : '#0f172a'
                    }}
                  />
                  <Pie
                    data={specialtyData}
                    dataKey="duration"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={3}
                    onMouseEnter={(_, index) => setHoveredPieIndex(index)}
                    onMouseLeave={() => setHoveredPieIndex(null)}
                    stroke="none"
                  >
                    {specialtyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={hoveredPieIndex === null || hoveredPieIndex === index ? 1 : 0.4}
                        className="transition-opacity duration-200 cursor-pointer"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Centro do Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                {hoveredPieIndex !== null && specialtyData[hoveredPieIndex] ? (
                  <>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 line-clamp-1 max-w-[90px]">
                      {specialtyData[hoveredPieIndex].name}
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white font-[var(--font-inter)] tabular-nums">
                      {specialtyData[hoveredPieIndex].durationFormatted}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      {specialtyData[hoveredPieIndex].percent}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-500">
                      Total
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white font-[var(--font-inter)] tabular-nums">
                      {formatSecondsToDetailed(totalSeconds)}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                      Horas líquidas
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Lista das Especialidades com Tempo e % */}
            <div className="sm:col-span-7 space-y-2 max-h-56 overflow-y-auto pr-1">
              {specialtyData.map((item, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredPieIndex(idx)}
                  onMouseLeave={() => setHoveredPieIndex(null)}
                  className={`flex items-center justify-between text-xs p-2 rounded-lg transition-colors cursor-pointer ${
                    hoveredPieIndex === idx
                      ? 'bg-slate-200/80 dark:bg-zinc-800'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800/60'
                  }`}
                  onClick={() => onNavigateToSpecialty?.(item.name)}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-black text-slate-900 dark:text-white font-[var(--font-inter)] tabular-nums">
                      {item.durationFormatted}
                    </span>
                    <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded-md bg-slate-200/70 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-[var(--font-inter)] tabular-nums">
                      {item.percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna 2: Hábitos de Estudo (Por Tipo de Atividade) */}
        <div className="lg:col-span-6 bg-slate-50/60 dark:bg-zinc-900/40 rounded-xl p-5 border border-slate-200/80 dark:border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                Hábitos de Estudo & Métodos
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
              Distribuição por formato
            </span>
          </div>

          <div className="space-y-3 my-1">
            {studyTypeData.map((item) => {
              const IconComp = item.icon;
              const hasTime = item.duration > 0;
              return (
                <div key={item.type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${item.color}20`,
                          color: item.color
                        }}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <span className={`font-semibold truncate ${hasTime ? 'text-slate-800 dark:text-zinc-200' : 'text-slate-400 dark:text-zinc-500'}`}>
                        {item.label}
                      </span>
                      {item.sessionsCount > 0 && (
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-sans">
                          ({item.sessionsCount} {item.sessionsCount === 1 ? 'sessão' : 'sessões'})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`font-black font-[var(--font-inter)] tabular-nums ${hasTime ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-zinc-600'}`}>
                        {item.durationFormatted}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 font-[var(--font-inter)] tabular-nums min-w-[32px] text-right">
                        {item.percent}%
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${item.percent}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Matriz de Esforço vs. Eficiência Pedagógica */}
      <div className="pt-2 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Matriz de Esforço vs. Eficiência Pedagógica
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-zinc-400">
            Correlação direta entre horas líquidas investidas e assertividade em questões
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 dark:bg-zinc-900/90 text-slate-600 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-2.5 px-3">Especialidade</th>
                <th className="py-2.5 px-3">Tempo Dedicado</th>
                <th className="py-2.5 px-3">Questões Feitas</th>
                <th className="py-2.5 px-3">Aproveitamento</th>
                <th className="py-2.5 px-3">Diagnóstico & Orientação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-zinc-800/80 bg-white/40 dark:bg-zinc-900/20">
              {effortEfficiencyMatrix.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-100/50 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="font-bold text-slate-900 dark:text-white">
                        {row.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-black text-slate-900 dark:text-white font-[var(--font-inter)] tabular-nums">
                      {row.durationFormatted}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-[var(--font-inter)]">
                      {row.percent}% do tempo
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-800 dark:text-zinc-200 font-sans tabular-nums">
                      {row.totalQuestions > 0 ? `${row.totalQuestions} questões` : '—'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {row.totalQuestions > 0 ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-black font-[var(--font-inter)] tabular-nums ${row.accuracy >= 70 ? 'text-emerald-600 dark:text-emerald-400' : row.accuracy >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {row.accuracy}%
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                            ({row.totalCorrect}/{row.totalQuestions})
                          </span>
                        </div>
                        <div className="w-24 bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${row.accuracy >= 70 ? 'bg-emerald-500' : row.accuracy >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(100, row.accuracy)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-zinc-600 italic">Sem questões</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                          row.diagnostic.type === 'success'
                            ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
                            : row.diagnostic.type === 'warning'
                            ? 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/25'
                            : row.diagnostic.type === 'danger'
                            ? 'text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/25'
                            : 'text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'
                        }`}
                      >
                        {row.diagnostic.type === 'success' && <CheckCircle2 className="w-3 h-3" />}
                        {row.diagnostic.type === 'danger' && <AlertTriangle className="w-3 h-3" />}
                        {row.diagnostic.type === 'warning' && <TrendingUp className="w-3 h-3" />}
                        {row.diagnostic.label}
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-zinc-400 hidden sm:inline">
                        {row.diagnostic.tip}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
