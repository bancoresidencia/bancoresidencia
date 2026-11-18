'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { BarChart2, Calendar, Play, SlidersHorizontal, Sparkles } from 'lucide-react';

export interface SpecialtyDonutDatum {
  id: string;
  name: string;
  value: number;
  realValue: number;
  cor: string;
  accuracy: number;
  correct: number;
  hasData: boolean;
}

export interface SpecialtyAreaSummary {
  id: string;
  label: string;
  filterName: string;
  colorHex: string;
  total: number;
  correct: number;
  accuracy: number;
  hasData: boolean;
}

export interface SpecialtyEvolutionDatum {
  label: string;
  date: string;
  resolvidas: number;
  acertos: number;
  erros: number;
  trendTotal: number;
  trendAcertos: number;
}

interface AreaEvolutionTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{
    payload?: {
      date?: string;
      acertos?: number;
      erros?: number;
      resolvidas?: number;
    };
  }>;
  colorHex?: string;
  areaLabel?: string;
}

const AreaEvolutionTooltip: React.FC<AreaEvolutionTooltipProps> = ({
  active,
  payload,
  colorHex,
  areaLabel
}) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl shadow-xl text-xs space-y-1 z-50 pointer-events-none select-none">
      <p className="font-bold text-zinc-800 dark:text-zinc-200 text-[11px] pb-1 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorHex }} />
        <span>
          {data.date} • {areaLabel}
        </span>
      </p>
      <div className="flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Acertos:
        </span>
        <span className="font-mono font-bold">{data.acertos}</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-rose-600 dark:text-rose-400 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          Erros:
        </span>
        <span className="font-mono font-bold">{data.erros}</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-zinc-500 dark:text-zinc-400 font-medium pt-1 border-t border-zinc-100 dark:border-zinc-800">
        <span>Total no dia:</span>
        <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{data.resolvidas}</span>
      </div>
    </div>
  );
};

export interface SpecialtyXRayChartProps {
  colSpan: number;
  mode: 'light' | 'dark';
  donutData: SpecialtyDonutDatum[];
  areasResumo: SpecialtyAreaSummary[];
  selectedAreaId: string;
  selectedArea: SpecialtyAreaSummary;
  totalCoreVolume: number;
  specialtyPeriod: string;
  specialtyPeriodLabel: string;
  specialtyEvolutionData: SpecialtyEvolutionDatum[];
  onSelectArea: (areaId: string) => void;
  onToggleArea: (areaId: string) => void;
  onOpenPeriodDrawer: () => void;
  onPracticeArea: (filterName: string) => void;
}

export const SpecialtyXRayChart: React.FC<SpecialtyXRayChartProps> = ({
  colSpan,
  mode,
  donutData,
  areasResumo,
  selectedAreaId,
  selectedArea,
  totalCoreVolume,
  specialtyPeriod,
  specialtyPeriodLabel,
  specialtyEvolutionData,
  onSelectArea,
  onToggleArea,
  onOpenPeriodDrawer,
  onPracticeArea
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(
    () => typeof window !== 'undefined' && typeof IntersectionObserver === 'undefined'
  );
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);
  const [isPieAnimationDone, setIsPieAnimationDone] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || isVisible || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '240px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      setIsPieAnimationDone(true);
    }, 900);
    return () => clearTimeout(timer);
  }, [isVisible]);

  const hasPeriodActivity = specialtyEvolutionData.some((d) => d.resolvidas > 0);
  const currentHovered = hoveredPieIndex !== null ? donutData[hoveredPieIndex] : null;
  const activeDonutItem =
    currentHovered || (selectedAreaId !== 'geral' ? donutData.find((d) => d.id === selectedAreaId) : null);

  return (
    <div
      ref={containerRef}
      className={`grid grid-cols-1 ${colSpan >= 8 ? 'md:grid-cols-12' : 'grid-cols-1'} gap-5 sm:gap-8 items-center pt-1`}
    >
      {/* Coluna Esquerda: Anel das 6 Grandes Áreas */}
      <div className={`${colSpan >= 8 ? 'md:col-span-5' : 'col-span-1'} flex flex-col items-center justify-center space-y-2.5`}>
        <div className="h-48 w-full max-w-[220px] relative flex items-center justify-center mx-auto">
          {totalCoreVolume === 0 ? (
            /* Estado Zero sem Recharts pesado: Anel SVG leve e honesto */
            <svg viewBox="0 0 180 180" className="w-44 h-44" aria-hidden="true">
              <circle
                cx="90"
                cy="90"
                r="66"
                fill="none"
                stroke="currentColor"
                strokeWidth="16"
                className="text-zinc-100 dark:text-zinc-800/70"
              />
              <circle
                cx="90"
                cy="90"
                r="66"
                fill="none"
                stroke={selectedAreaId === 'geral' ? 'currentColor' : selectedArea.colorHex}
                strokeWidth="2.5"
                strokeDasharray="6 6"
                className={selectedAreaId === 'geral' ? 'text-zinc-300 dark:text-zinc-700' : 'transition-colors duration-300'}
              />
            </svg>
          ) : isVisible ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  isAnimationActive={!isPieAnimationDone}
                  animationBegin={0}
                  animationDuration={850}
                  animationEasing="ease-out"
                  onAnimationEnd={() => setIsPieAnimationDone(true)}
                  onMouseEnter={(_, index) => setHoveredPieIndex(index)}
                  onMouseLeave={() => setHoveredPieIndex(null)}
                  onClick={(entry: { id?: string; payload?: { id?: string } } | undefined, index: number) => {
                    const targetId = entry?.id || entry?.payload?.id || donutData[index]?.id;
                    if (targetId) onToggleArea(targetId);
                  }}
                  stroke="none"
                  className="cursor-pointer"
                >
                  {donutData.map((entry, index) => {
                    const isSelected = selectedAreaId === entry.id;
                    const isHovered = hoveredPieIndex === index;
                    const opacity =
                      hoveredPieIndex !== null
                        ? isHovered
                          ? 1
                          : 0.28
                        : selectedAreaId !== 'geral'
                          ? isSelected
                            ? 1
                            : 0.28
                          : 1;
                    return (
                      <Cell
                        key={`cell-core-${index}`}
                        fill={entry.cor}
                        opacity={opacity}
                        className="transition-opacity duration-200 cursor-pointer outline-none focus:outline-none"
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-40 h-40 rounded-full border-[16px] border-zinc-100 dark:border-zinc-800/70 animate-pulse" />
          )}

          {/* Centro Interativo do Donut */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <button
              type="button"
              onClick={() => onSelectArea('geral')}
              className="w-[104px] h-[104px] rounded-full flex flex-col items-center justify-center text-center px-1 pointer-events-auto cursor-pointer group transition-transform hover:scale-105 active:scale-95 z-10"
              title="Clique para ver o panorama Geral"
            >
              {activeDonutItem ? (
                <>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400 line-clamp-1 max-w-[100px]">
                    {activeDonutItem.name}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-sans tabular-nums mt-0.5">
                    {activeDonutItem.realValue}
                  </span>
                  <span className="text-[9px] font-bold" style={{ color: activeDonutItem.cor }}>
                    {activeDonutItem.hasData ? `${activeDonutItem.accuracy}% acerto` : 'Sem questões'}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400">
                    VOLUME TOTAL
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-sans tabular-nums mt-0.5">
                    {totalCoreVolume}
                  </span>
                  <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-500 transition-colors">
                    {totalCoreVolume === 0 ? 'Aguardando treino' : '6 Grandes Áreas'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Chips Seletores das 6 Grandes Áreas */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1 w-full">
          <button
            type="button"
            onClick={() => onSelectArea('geral')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 border active:scale-95 ${
              selectedAreaId === 'geral'
                ? 'shadow-xs border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60'
            }`}
            title="Visualizar evolução geral (todas as áreas)"
          >
            <BarChart2 className="w-2.5 h-2.5" />
            <span>Geral</span>
          </button>
          {areasResumo.map((area) => {
            const isSelected = selectedAreaId === area.id;
            const shortLabel = area.id === 'clinica' ? 'Clínica' : area.id === 'cirurgia' ? 'Cirurgia' : area.label;
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => onToggleArea(area.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 border active:scale-95 ${
                  isSelected
                    ? 'shadow-xs'
                    : 'border-transparent hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60'
                }`}
                style={{
                  backgroundColor: isSelected ? `${area.colorHex}1f` : undefined,
                  borderColor: isSelected ? area.colorHex : undefined
                }}
                title={`Clique para selecionar ${area.label}`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: area.colorHex }} />
                <span className={isSelected ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}>
                  {shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Coluna Direita: Evolução Temporal ou Estado Inicial Limpo */}
      <div className={`${colSpan >= 8 ? 'md:col-span-7' : 'col-span-1'} flex flex-col justify-between space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
          <button
            type="button"
            onClick={onOpenPeriodDrawer}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all cursor-pointer shadow-2xs active:scale-98 group"
            title="Filtrar período do gráfico"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>{specialtyPeriodLabel}</span>
            <SlidersHorizontal className="w-3 h-3 opacity-60 ml-0.5" />
          </button>

          <div className="flex items-center gap-3.5 text-xs whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-medium text-[11px]">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#10B981] shrink-0" />
              Acertos
            </span>
            <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-medium text-[11px]">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#F43F5E] shrink-0" />
              Erros
            </span>
            <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-medium text-[11px]">
              <span className="w-3.5 h-0.5 bg-zinc-400 opacity-70 shrink-0" />
              Tendência
            </span>
          </div>
        </div>

        <div className="h-52 sm:h-56 w-full pt-1 flex items-center justify-center">
          {!hasPeriodActivity ? (
            <div className="w-full h-full rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 p-5 flex flex-col items-center justify-center text-center space-y-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs"
                style={{ color: selectedArea.colorHex }}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200">
                {selectedAreaId === 'geral'
                  ? 'Sem questões registradas neste período'
                  : `Sem questões de ${selectedArea.label} neste período`}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
                Resolva uma bateria curta para calibrar seu mapa de acertos, erros e tendência diária por especialidade.
              </p>
            </div>
          ) : isVisible ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={specialtyEvolutionData} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
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
                  tick={{ fill: mode === 'dark' ? '#A1A1AA' : '#64748B', fontSize: 10, fontWeight: 500 }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tick={{ fill: mode === 'dark' ? '#A1A1AA' : '#64748B', fontSize: 10 }}
                />
                <Tooltip
                  content={<AreaEvolutionTooltip colorHex={selectedArea.colorHex} areaLabel={selectedArea.label} />}
                  wrapperStyle={{ pointerEvents: 'none' }}
                />
                <Bar
                  dataKey="erros"
                  name="Erros"
                  stackId="specialtyEvolution"
                  fill="#F43F5E"
                  isAnimationActive={false}
                  maxBarSize={specialtyPeriod === '6m' ? 8 : specialtyPeriod === '3m' ? 12 : 20}
                />
                <Bar
                  dataKey="acertos"
                  name="Acertos"
                  stackId="specialtyEvolution"
                  fill="#10B981"
                  radius={[2.5, 2.5, 0, 0]}
                  isAnimationActive={false}
                  maxBarSize={specialtyPeriod === '6m' ? 8 : specialtyPeriod === '3m' ? 12 : 20}
                />
                <Line
                  type="monotone"
                  dataKey="trendTotal"
                  name="Tendência"
                  stroke={mode === 'dark' ? '#94A3B8' : '#64748B'}
                  strokeWidth={2}
                  strokeOpacity={0.55}
                  dot={false}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full rounded-2xl bg-zinc-100/70 dark:bg-zinc-900/60 animate-pulse" />
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 tabular-nums">
              {selectedArea.correct} acertos de {selectedArea.total} questões resolvidas
            </span>
          </div>

          <button
            type="button"
            onClick={() => onPracticeArea(selectedArea.filterName)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:opacity-95 active:scale-[0.98] shrink-0"
            style={{
              backgroundColor: selectedArea.colorHex,
              boxShadow: `0 2px 8px ${selectedArea.colorHex}33`
            }}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{selectedAreaId === 'geral' ? 'Treinar Questões Gerais' : `Treinar ${selectedArea.label}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
