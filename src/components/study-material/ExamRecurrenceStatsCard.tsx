'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BarChart3,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export interface ExamStatItem {
  name: string;
  shortName: string;
  percentage: number;
  questionCount: number;
  priority: 'Crítica' | 'Alta' | 'Média';
  color: string;
  themeClue: string;
}

export interface ExamRecurrenceStatsCardProps {
  data?: ExamStatItem[];
  totalQuestions?: number;
  title?: string;
  subtitle?: string;
}

export const ExamRecurrenceStatsCard: React.FC<ExamRecurrenceStatsCardProps> = ({
  data,
  totalQuestions,
  title = 'Raio-X de Recorrência nas Provas de Residência Médica'
}) => {
  const { mode, accentConfig } = useTheme();
  const isDark = mode === 'dark';
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [lockedIndex, setLockedIndex] = useState<number | null>(null);
  const [isPieAnimationDone, setIsPieAnimationDone] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPieAnimationDone(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // REGRA DO PLANO CANÔNICO: Se nenhum dado for passado, aponta como erro no resumo (tolerância zero a dados falsos)
  if (!data || data.length === 0) {
    return (
      <div className="my-8 p-5 rounded-2xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 shadow-xs flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-heading font-black text-sm text-rose-900 dark:text-rose-100 uppercase tracking-wide">
            Erro no Resumo: Dados Estatísticos Censitários Ausentes
          </h4>
          <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
            O censo estatístico de recorrência temática em provas de residência médica não foi calculado ou está corrompido para este foco. O padrão-ouro do Banco Residência proíbe dados genéricos ou fallbacks silenciosos.
          </p>
        </div>
      </div>
    );
  }

  const items = data;
  const computedTotal = totalQuestions || items.reduce((acc, it) => acc + (it.questionCount || 0), 0);
  const activeIndex = lockedIndex !== null ? lockedIndex : hoveredIndex !== null ? hoveredIndex : 0;
  const activeItem = items[activeIndex] || items[0];

  const handleSelectSector = (idx: number) => {
    if (!isPieAnimationDone) return;
    setLockedIndex(prev => (prev === idx ? null : idx));
  };

  return (
    <div
      className={`my-8 rounded-2xl border transition-all overflow-hidden ${
        isDark
          ? 'bg-[#121215] border-zinc-800 shadow-md'
          : 'bg-white border-zinc-200/90 shadow-xs'
      }`}
    >
      {/* Cabeçalho Limpo */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2.5 bg-zinc-50/60 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              {title}
            </h3>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              Censo determinístico baseado em {computedTotal} questões catalogadas
            </span>
          </div>
        </div>
        {lockedIndex !== null && (
          <button
            onClick={() => setLockedIndex(null)}
            className="text-[11px] font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            Desafixar Seleção
          </button>
        )}
      </div>

      {/* Conteúdo Principal: Gráfico Donut Nativo + Lista de Frequência */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Coluna 1 (5 colunas): Gráfico Donut Nativo Recharts */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className={`h-60 w-full relative flex items-center justify-center ${!isPieAnimationDone ? 'pointer-events-none' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={items}
                  dataKey="percentage"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={92}
                  paddingAngle={3}
                  isAnimationActive={!isPieAnimationDone}
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                  onAnimationEnd={() => setIsPieAnimationDone(true)}
                  onClick={(_, idx) => handleSelectSector(idx)}
                  onMouseEnter={(_, idx) => {
                    if (!isPieAnimationDone || lockedIndex !== null) return;
                    setHoveredIndex(idx);
                  }}
                  onMouseLeave={() => {
                    if (!isPieAnimationDone || lockedIndex !== null) return;
                    setHoveredIndex(null);
                  }}
                >
                  {items.map((entry, idx) => {
                    const isSelected = activeIndex === idx;
                    const opacity = lockedIndex !== null ? (isSelected ? 1 : 0.28) : 1;
                    return (
                      <Cell
                        key={`cell-${idx}`}
                        fill={entry.color}
                        fillOpacity={opacity}
                        stroke={isDark ? '#121215' : '#FFFFFF'}
                        strokeWidth={isSelected ? 3 : 2}
                        className="cursor-pointer transition-all duration-200 hover:opacity-90"
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centro Reativo com Estatísticas (harmonioso e proporcional) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              <span className="text-2xl sm:text-3xl font-heading font-black text-zinc-900 dark:text-zinc-100 font-mono tabular-nums leading-none my-0.5">
                {activeItem ? `${activeItem.percentage}%` : '0%'}
              </span>
              <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
                recorrência em provas
              </span>
            </div>
          </div>

          <div className="text-center mt-1">
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 italic">
              {lockedIndex !== null ? 'Setor fixado. Clique novamente para liberar.' : 'Clique no setor para fixar o detalhamento de prova'}
            </span>
          </div>
        </div>

        {/* Coluna 2 (7 colunas): Lista Ranqueada com rolagem quando > 5 tópicos */}
        <div className="lg:col-span-7 space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
          {items.map((item, index) => {
            const isActive = activeIndex === index;
            return (
              <div
                key={item.name}
                onClick={() => handleSelectSector(index)}
                onMouseEnter={() => {
                  if (lockedIndex === null) setHoveredIndex(index);
                }}
                className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-zinc-100/90 dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700 shadow-xs scale-[1.01]'
                    : 'bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        item.priority === 'Crítica'
                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {item.priority}
                    </span>
                    <span className="font-mono font-bold text-xs text-zinc-700 dark:text-zinc-300">
                      {item.questionCount} questões
                    </span>
                  </div>
                </div>

                {/* Barra de Progresso Nativa com Animação Suave */}
                <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(100, item.percentage * 2)}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Destaques das Bancas de Residência Baseados no Censo Real */}
      <div className="p-5 sm:p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/20">
        <div className="flex items-center gap-2 mb-3.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h4 className="font-heading font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Mandamentos e Destaques das Bancas Examinadoras
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.slice(0, 5).map((item, idx) => (
            <div
              key={item.name}
              className="p-3.5 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between space-y-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start gap-2.5">
                <span
                  className="w-5 h-5 rounded-lg flex items-center justify-center font-mono font-black text-xs text-white shrink-0 mt-0.5 shadow-2xs"
                  style={{ backgroundColor: item.color || accentConfig.primaryHex }}
                >
                  {idx + 1}
                </span>
                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 leading-snug">
                  {item.name} ({item.percentage}%)
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed pl-7.5">
                {item.themeClue || `Subfoco com prioridade ${item.priority} nas bancas de residência médica.`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
