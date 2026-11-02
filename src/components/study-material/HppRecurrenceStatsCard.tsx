'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import {
  BarChart3,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export interface HppStatItem {
  name: string;
  shortName: string;
  percentage: number;
  questionCount: number;
  priority: 'Crítica' | 'Alta' | 'Média';
  color: string;
  themeClue: string;
}

export const HPP_RECURRENCE_DATA: HppStatItem[] = [
  {
    name: 'Atonia Uterina & Manejo Escalonado (Tônus)',
    shortName: 'Atonia Uterina',
    percentage: 52,
    questionCount: 520,
    priority: 'Crítica',
    color: '#3B82F6', // Blue
    themeClue: 'Hamilton, Ocitocina IV, Ácido Tranexâmico precoce, Balão de Bakri e Sutura de B-Lynch'
  },
  {
    name: 'Profilaxia Ativa do 3º Período (Ocitocina 10 UI IM)',
    shortName: 'Profilaxia 3º Período',
    percentage: 21,
    questionCount: 210,
    priority: 'Crítica',
    color: '#10B981', // Emerald
    themeClue: 'Ocitocina 10 UI IM após desprendimento do ombro anterior + tração controlada (Brandt-Andrews)'
  },
  {
    name: 'Trauma de Trajeto & Inversão Uterina Aguda',
    shortName: 'Trauma & Inversão',
    percentage: 14,
    questionCount: 140,
    priority: 'Alta',
    color: '#EC4899', // Pink
    themeClue: 'Útero firme contraído + sangramento contínuo = trauma; Inversão: suspender ocitocina + Manobra de Taxe'
  },
  {
    name: 'Restos Placentários & Espectro de Acretismo (Tecido)',
    shortName: 'Tecido & Acretismo',
    percentage: 8,
    questionCount: 80,
    priority: 'Alta',
    color: '#8B5CF6', // Purple
    themeClue: 'Cotilédone ausente, placenta retida > 30 min e acretismo (cesárea anterior + placenta prévia)'
  },
  {
    name: 'Coagulopatias & Protocolo Transfusional (Trombina)',
    shortName: 'Coagulopatias',
    percentage: 5,
    questionCount: 50,
    priority: 'Média',
    color: '#F59E0B', // Amber
    themeClue: 'Fibrinogênio sérico (< 200 mg/dL gravidade, < 100 mg/dL crioprecipitado) e proporção 1:1:1'
  }
];

export const HppRecurrenceStatsCard: React.FC = () => {
  const { mode, accentConfig } = useTheme();
  const isDark = mode === 'dark';
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const activeItem = HPP_RECURRENCE_DATA[activeIndex] || HPP_RECURRENCE_DATA[0];

  return (
    <div
      className={`my-8 rounded-2xl border transition-all overflow-hidden ${
        isDark
          ? 'bg-[#121215] border-zinc-800 shadow-md'
          : 'bg-white border-zinc-200/90 shadow-xs'
      }`}
    >
      {/* Cabeçalho */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/60 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                Raio-X de Recorrência nas Provas de Residência Médica
              </h3>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                +10k Questões Auditadas
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Taxa relativa de cobrança por tópico clínico nas principais bancas (ENARE, USP, UNICAMP, PSU-MG, AMRIGS)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Frequência Temática</span>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Gráfico Donut (Lado Esquerdo) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="w-[220px] h-[220px] sm:w-[240px] sm:h-[240px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={HPP_RECURRENCE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="percentage"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onClick={(_, index) => setActiveIndex(index)}
                  cursor="pointer"
                >
                  {HPP_RECURRENCE_DATA.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={isDark ? '#121215' : '#ffffff'}
                      strokeWidth={activeIndex === index ? 3 : 1}
                      className="transition-all duration-300"
                      opacity={activeIndex === index ? 1 : 0.75}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as HppStatItem;
                      return (
                        <div className="px-3 py-2 rounded-xl bg-zinc-900 text-white text-xs shadow-lg border border-zinc-700">
                          <span className="font-bold">{data.name}</span>
                          <span className="block text-zinc-300">
                            {data.percentage}% de cobrança ({data.questionCount} questões)
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Texto Central do Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {activeItem.shortName}
              </span>
              <span
                className="text-3xl sm:text-4xl font-heading font-black tracking-tight"
                style={{ color: activeItem.color }}
              >
                {activeItem.percentage}%
              </span>
              <span className="text-[10px] font-semibold text-zinc-400">
                recorrência em provas
              </span>
            </div>
          </div>
          <span className="text-[11px] text-zinc-400 italic mt-2 text-center">
            Passe o mouse ou toque nos setores do gráfico para detalhar
          </span>
        </div>

        {/* Lista de Tópicos e Barras de Progresso (Lado Direito) */}
        <div className="lg:col-span-7 space-y-3">
          {HPP_RECURRENCE_DATA.map((item, index) => {
            const isSelected = activeIndex === index;
            return (
              <div
                key={item.name}
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-zinc-900/80 border-zinc-700 shadow-sm'
                      : 'bg-zinc-50 border-zinc-300 shadow-2xs'
                    : 'border-transparent hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        item.priority === 'Crítica'
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : item.priority === 'Alta'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {item.priority}
                    </span>
                    <span className="text-xs sm:text-sm font-mono font-black text-zinc-900 dark:text-zinc-100">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Barra de Progresso Fina */}
                <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Caixa de Dica de Prova do Item Ativo */}
      <div className="px-5 py-3.5 bg-zinc-50/80 dark:bg-zinc-900/70 border-t border-zinc-100 dark:border-zinc-800 flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-zinc-900 dark:text-zinc-100 mr-1.5">
            Foco de Cobrança da Banca [{activeItem.shortName}]:
          </span>
          <span>{activeItem.themeClue}</span>
        </div>
      </div>
    </div>
  );
};
