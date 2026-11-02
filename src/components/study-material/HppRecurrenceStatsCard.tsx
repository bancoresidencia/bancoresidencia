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
  TrendingUp
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export interface HppStatItem {
  id: number;
  name: string;
  shortName: string;
  percentage: number;
  questionCount: number;
  priority: 'Crítica' | 'Alta' | 'Média';
  color: string;
  title: string;
  focusExplanation: string;
}

export const HPP_RECURRENCE_DATA: HppStatItem[] = [
  {
    id: 1,
    name: 'Atonia Uterina & Manejo Escalonado (Tônus)',
    shortName: 'Atonia Uterina',
    percentage: 52,
    questionCount: 520,
    priority: 'Crítica',
    color: '#3B82F6', // Blue
    title: 'Atonia uterina responde por 70% a 80% das hemorragias pós-parto',
    focusExplanation: 'O manejo segue uma **cascata cronológica obrigatória**: primeiro massagem bimanual de Hamilton + Ocitocina IV em infusão contínua e **Ácido Tranexâmico 1g IV nas primeiras 3h** (WOMAN Trial). Se refratário no parto vaginal: **Balão de Bakri** (teste positivo = manter 12-24h; sangramento persistente = laparotomia). Na cirurgia: **Sutura de B-Lynch** ("em suspensório") e ligadura vascular seletiva. A **histerectomia subtotal** é a conduta cirúrgica definitiva de controle de danos.'
  },
  {
    id: 2,
    name: 'Profilaxia Ativa do 3º Período (Ocitocina 10 UI IM)',
    shortName: 'Profilaxia 3º Período',
    percentage: 21,
    questionCount: 210,
    priority: 'Crítica',
    color: '#10B981', // Emerald
    title: 'Profilaxia ativa universal é recomendada para 100% dos partos',
    focusExplanation: 'A conduta isolada mais eficaz para prevenir a atonia é a administração de **Ocitocina 10 UI Intramuscular (IM)** imediatamente após o desprendimento do ombro anterior ou saída do feto. Associar sempre a **tração controlada do cordão com contrarretração suprapúbica** (Manobra de Brandt-Andrews) e clampeamento oportuno entre 1 e 3 minutos em conceptos a termo.'
  },
  {
    id: 3,
    name: 'Trauma de Trajeto & Inversão Uterina Aguda',
    shortName: 'Trauma & Inversão',
    percentage: 14,
    questionCount: 140,
    priority: 'Alta',
    color: '#EC4899', // Pink
    title: 'Sangramento contínuo com útero contraído e duro é trauma de trajeto',
    focusExplanation: 'Regra de ouro das bancas: puérpera com sangramento vermelho-vivo contínuo e **útero duro no nível umbilical (Globo de Pinard)** NÃO tem atonia. Conduta mandatória: **revisão de colo e vagina sob valvas de peso**. Na Inversão Uterina Aguda: **suspender ocitocina imediatamente**, realizar **Manobra de Taxe / Johnson** manual para redução anatômica e **NUNCA dequitar a placenta** antes do útero retornar à cavidade.'
  },
  {
    id: 4,
    name: 'Restos Placentários & Espectro de Acretismo (Tecido)',
    shortName: 'Tecido & Acretismo',
    percentage: 8,
    questionCount: 80,
    priority: 'Alta',
    color: '#8B5CF6', // Purple
    title: 'Cesárea prévia associada a placenta prévia impõe altíssima suspeita de acretismo',
    focusExplanation: 'Placenta retida > 30 minutos ou cotilédone ausente à inspeção exige curagem ou curetagem sob anestesia. **Pegadinha clássica:** paciente com cesárea anterior e placenta de inserção baixa tem alto risco de **Espectro do Acretismo Placentário (PAS)**. Diante da suspeita, **nunca force a tração ou descolamento manual** pelo risco iminente de choque cataclísmico; preparar laparotomia com histerectomia programada.'
  },
  {
    id: 5,
    name: 'Coagulopatias & Protocolo Transfusional (Trombina)',
    shortName: 'Coagulopatias',
    percentage: 5,
    questionCount: 50,
    priority: 'Média',
    color: '#F59E0B', // Amber
    title: 'Fibrinogênio sérico é o preditor laboratorial precoce mais fidedigno',
    focusExplanation: 'Coagulopatia associada a DPP, embolia amniótica ou sepse grave. Níveis de **fibrinogênio < 200 mg/dL** alertam para progressão grave; **< 100 mg/dL** exige **Crioprecipitado** imediato (1 U para cada 10 kg). Ativar precocemente o protocolo de transfusão maciça balanceado na **proporção 1:1:1** (Concentrado de Hemácias, Plasma Fresco Congelado e Plaquetas) para prevenir coagulopatia dilucional e hipotermia.'
  }
];

export const HppRecurrenceStatsCard: React.FC = () => {
  const { mode, accentConfig } = useTheme();
  const isDark = mode === 'dark';
  
  // Controle de fixação por clique (Lock) ou hover dinâmico
  const [lockedIndex, setLockedIndex] = useState<number | null>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isPieAnimationDone, setIsPieAnimationDone] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPieAnimationDone(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const activeIndex = lockedIndex !== null ? lockedIndex : (hoveredIndex !== null ? hoveredIndex : 0);
  const activeItem = HPP_RECURRENCE_DATA[activeIndex] || HPP_RECURRENCE_DATA[0];

  const handleSelectSector = (index: number) => {
    setLockedIndex(index);
  };

  return (
    <div
      className={`my-8 rounded-3xl border transition-all overflow-hidden ${
        isDark
          ? 'bg-[#121215] border-zinc-800 shadow-md'
          : 'bg-white border-zinc-200/90 shadow-xs'
      }`}
    >
      {/* Cabeçalho Limpo */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2.5 bg-zinc-50/60 dark:bg-zinc-900/50">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
          style={{ backgroundColor: accentConfig.primaryHex }}
        >
          <BarChart3 className="w-4 h-4" />
        </div>
        <h3 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
          Raio-X de Recorrência nas Provas de Residência Médica
        </h3>
      </div>

      {/* Conteúdo Superior: Gráfico Donut (5 colunas) + Barras de Progresso (7 colunas) estilo Miomas */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Gráfico Donut (Lado Esquerdo - 5 colunas) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className={`w-[220px] h-[220px] sm:w-[240px] sm:h-[240px] relative ${!isPieAnimationDone ? 'pointer-events-none' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={HPP_RECURRENCE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={92}
                  paddingAngle={3}
                  dataKey="percentage"
                  isAnimationActive={!isPieAnimationDone}
                  animationBegin={0}
                  animationDuration={1400}
                  animationEasing="ease-out"
                  onAnimationEnd={() => setIsPieAnimationDone(true)}
                  onMouseEnter={(_, index) => {
                    if (!isPieAnimationDone) return;
                    setHoveredIndex(index);
                  }}
                  onMouseLeave={() => {
                    if (!isPieAnimationDone) return;
                    setHoveredIndex(null);
                  }}
                  onClick={(_, index) => {
                    if (!isPieAnimationDone) return;
                    handleSelectSector(index);
                  }}
                  cursor="pointer"
                  stroke={isDark ? '#121215' : '#ffffff'}
                  strokeWidth={2}
                >
                  {HPP_RECURRENCE_DATA.map((entry, index) => {
                    const isSelected = activeIndex === index;
                    const opacity = isSelected ? 1 : 0.28;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="transition-all duration-300"
                        opacity={opacity}
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centro Reativo com Estatísticas (Sem Tooltip flutuante escuro, proporcional e harmonioso) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              <span
                className="text-2xl sm:text-3xl font-heading font-black tracking-tight leading-none"
                style={{ color: activeItem.color }}
              >
                {activeItem.percentage}%
              </span>
              <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
                recorrência em provas
              </span>
            </div>
          </div>
          <span className="text-[11px] text-zinc-400 italic mt-1 text-center">
            Passe o mouse ou toque nos setores do gráfico para detalhar
          </span>
        </div>

        {/* Lista de Tópicos e Barras de Progresso (Lado Direito - 7 colunas) com rolagem se houver mais de 5 tópicos */}
        <div className="lg:col-span-7 space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
          {HPP_RECURRENCE_DATA.map((item, index) => {
            const isSelected = activeIndex === index;
            const isHovered = hoveredIndex === index;
            const isHighlighted = isSelected || isHovered;

            return (
              <div
                key={item.name}
                onClick={() => handleSelectSector(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                  isHighlighted
                    ? 'bg-zinc-100/90 dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700 shadow-xs scale-101'
                    : 'bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
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

      {/* Card Horizontal de Foco de Cobrança (Ocupa Toda a Horizontal) */}
      <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
        <div className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-4 sm:p-4.5 shadow-xs flex items-start gap-3.5 transition-all">
          {/* Badge Circular com Número */}
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs text-white shadow-2xs mt-0.5"
            style={{ backgroundColor: activeItem.color }}
          >
            {activeItem.id}
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <h4 className="font-heading font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
              {activeItem.title}
            </h4>

            <p
              className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: activeItem.focusExplanation.replace(
                  /\*\*(.*?)\*\*/g,
                  '<strong class="font-bold text-zinc-800 dark:text-zinc-200">$1</strong>'
                )
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
