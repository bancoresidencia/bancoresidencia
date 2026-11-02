'use client';

import React, { useState, useEffect } from 'react';
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

export interface ExamStatItem {
  name: string;
  shortName: string;
  percentage: number;
  questionCount: number;
  priority: 'Crítica' | 'Alta' | 'Média';
  color: string;
  themeClue: string;
}

export const EXAM_RECURRENCE_DATA: ExamStatItem[] = [
  {
    name: 'Tratamento Clínico (Farmacoterapia)',
    shortName: 'TTO Clínico',
    percentage: 47,
    questionCount: 470,
    priority: 'Crítica',
    color: '#3B82F6', // Blue
    themeClue: 'AINEs, Ácido Tranexâmico, DIU-Mirena (excluir FIGO 0/1/2) e Análogos GnRH'
  },
  {
    name: 'Tratamento Cirúrgico Conservador (Miomectomias)',
    shortName: 'Miomectomia',
    percentage: 35,
    questionCount: 350,
    priority: 'Crítica',
    color: '#10B981', // Emerald
    themeClue: 'Histeroscópica (STEPW de Lasmar) vs Laparoscópica/Laparotômica'
  },
  {
    name: 'Classificação FIGO / PALM-COEIN',
    shortName: 'Classificação FIGO',
    percentage: 31,
    questionCount: 310,
    priority: 'Alta',
    color: '#EC4899', // Pink
    themeClue: 'Tipos 0 a 8 e transmurais híbridos (relação submucoso vs intramural vs subseroso)'
  },
  {
    name: 'Fisiopatologia & Fatores de Risco/Proteção',
    shortName: 'Fisiopatol. & Risco',
    percentage: 27,
    questionCount: 270,
    priority: 'Alta',
    color: '#8B5CF6', // Purple
    themeClue: 'Hormonodependência (estrogênio + progesterona) e pegadinha do tabagismo'
  },
  {
    name: 'Quadro Clínico & Correlação Topográfica',
    shortName: 'Quadro Clínico',
    percentage: 16,
    questionCount: 160,
    priority: 'Alta',
    color: '#F59E0B', // Amber
    themeClue: 'Submucoso sangra (SUA); Intramural e Subseroso causam compressão e massa'
  },
  {
    name: 'Investigação Armada (USG TV, RNM, Histeroscopia)',
    shortName: 'USG TV / RNM',
    percentage: 13,
    questionCount: 130,
    priority: 'Média',
    color: '#06B6D4', // Cyan
    themeClue: 'USG TV é o exame inicial; RNM é padrão-ouro para mapear nuligestas'
  },
  {
    name: 'Tratamento Definitivo (Histerectomia)',
    shortName: 'Histerectomia',
    percentage: 11,
    questionCount: 110,
    priority: 'Média',
    color: '#6366F1', // Indigo
    themeClue: 'Tratamento definitivo para pacientes sintomáticas com prole concluída'
  },
  {
    name: 'Degenerações Miomatosas (Rubra na Gestação, etc.)',
    shortName: 'Degenerações',
    percentage: 9,
    questionCount: 90,
    priority: 'Média',
    color: '#F43F5E', // Rose
    themeClue: 'Degeneração rubra no 2º trimestre gestacional é de conduta estritamente clínica'
  },
  {
    name: 'Embolização das Artérias Uterinas (EAU)',
    shortName: 'Embolização (EAU)',
    percentage: 8,
    questionCount: 80,
    priority: 'Média',
    color: '#14B8A6', // Teal
    themeClue: 'Alternativa conservadora à histerectomia; relativa contraindicação se gestação futura'
  }
];

export const MANDAMENTOS_BANCA = [
  {
    num: 1,
    title: 'A esmagadora maioria dos miomas é assintomática',
    desc: 'Não se opera e não se medica mioma assintomático, independentemente do volume. Conduta expectante com USG anual.'
  },
  {
    num: 2,
    title: 'Submucoso sangra; Intramural/Subseroso comprime',
    desc: 'O sangramento uterino anormal (menorragia) relaciona-se diretamente à proximidade da cavidade endometrial (FIGO 0, 1 e 2).'
  },
  {
    num: 3,
    title: 'DIU-Mirena NÃO se insere em cavidade distorcida',
    desc: 'Contraindicação formal em miomas submucosos (FIGO 0, 1 e 2) por risco de expulsão, perfuração e falha hemostática.'
  },
  {
    num: 4,
    title: 'Análogos de GnRH são pontes temporárias, NUNCA definitivos',
    desc: 'Usados por 3 a 6 meses pré-operatórios para reduzir volume (30-50%) e recuperar hemoglobina. Uso longo gera perda óssea grave.'
  },
  {
    num: 5,
    title: 'Degeneração Rubra na Gestação é clínica/conservadora',
    desc: 'Dor pélvica aguda no 2º trimestre gestacional. Conduta: analgesia e hidratação venosa. NUNCA realizar miomectomia na gravidez.'
  }
];

export const ExamRecurrenceStatsCard: React.FC = () => {
  const { mode, accentConfig } = useTheme();
  const isDark = mode === 'dark';
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isPieAnimationDone, setIsPieAnimationDone] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPieAnimationDone(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const activeItem = hoveredIndex !== null ? EXAM_RECURRENCE_DATA[hoveredIndex] : EXAM_RECURRENCE_DATA[0];

  return (
    <div
      className={`my-8 rounded-2xl border transition-all overflow-hidden ${
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

      {/* Conteúdo Principal: Gráfico Donut Nativo + Lista de Frequência */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Coluna 1 (5 colunas): Gráfico Donut Nativo Recharts */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className={`h-60 w-full relative flex items-center justify-center ${!isPieAnimationDone ? 'pointer-events-none' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={EXAM_RECURRENCE_DATA}
                  dataKey="percentage"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={92}
                  paddingAngle={3}
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
                >
                  {EXAM_RECURRENCE_DATA.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={entry.color}
                      stroke={isDark ? '#121215' : '#FFFFFF'}
                      strokeWidth={2}
                      className="cursor-pointer transition-transform duration-200 hover:opacity-90"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centro Reativo com Estatísticas ao Passar o Mouse (proporcional e harmonioso) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              <span className="text-2xl sm:text-3xl font-heading font-black text-zinc-900 dark:text-zinc-100 font-mono tabular-nums leading-none my-0.5">
                {activeItem ? `${activeItem.percentage}%` : '47%'}
              </span>
              <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
                recorrência em provas
              </span>
            </div>
          </div>

          <div className="text-center mt-1">
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 italic">
              Passe o mouse ou toque nos setores do gráfico para detalhar
            </span>
          </div>
        </div>

        {/* Coluna 2 (7 colunas): Lista Ranqueada com rolagem quando > 5 tópicos */}
        <div className="lg:col-span-7 space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
          {EXAM_RECURRENCE_DATA.map((item, index) => {
            const isHovered = hoveredIndex === index;
            return (
              <div
                key={item.name}
                onMouseEnter={() => setHoveredIndex(index)}
                className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                  isHovered
                    ? 'bg-zinc-100/90 dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700 shadow-xs scale-101'
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
                      width: `${item.percentage * 2}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Os 5 Mandamentos das Bancas de Residência */}
      <div className="p-5 sm:p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/20">
        <div className="flex items-center gap-2 mb-3.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h4 className="font-heading font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Os 5 Mandamentos das Bancas de Residência Médica
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MANDAMENTOS_BANCA.map((m) => (
            <div
              key={m.num}
              className="p-3.5 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between space-y-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start gap-2.5">
                <span
                  className="w-5 h-5 rounded-lg flex items-center justify-center font-mono font-black text-xs text-white shrink-0 mt-0.5 shadow-2xs"
                  style={{ backgroundColor: accentConfig.primaryHex }}
                >
                  {m.num}
                </span>
                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 leading-snug">
                  {m.title}
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed pl-7.5">
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
