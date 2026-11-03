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
  TrendingUp,
  Sparkles,
  Info
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export interface GemStatItem {
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

export type GemTopic = 'corionicidade' | 'complicacoes' | 'stff' | 'parto';

export const GEM_DATA_MAP: Record<GemTopic, { title: string; subtitle: string; totalQuestions: number; items: GemStatItem[] }> = {
  corionicidade: {
    title: 'Recorrência Temática: Classificação e Diagnóstico de Gemelares',
    subtitle: 'Distribuição censitária de 141 questões oficiais (ENARE, USP, UNICAMP, PSU-MG)',
    totalQuestions: 141,
    items: [
      {
        id: 1,
        name: 'Corionicidade e Amnionicidade: Definição e Determinação',
        shortName: 'Corionicidade & USG',
        percentage: 57,
        questionCount: 81,
        priority: 'Crítica',
        color: '#3B82F6',
        title: 'A corionicidade é o principal fator prognóstico da gemelaridade',
        focusExplanation: 'O ultrassom de 11 a 13+6 semanas é o exame padrão-ouro: **Sinal do Lambda (Pico Duplo)** com septo intergemelar > 2 mm confirma dicorionicidade. O **Sinal do T** com membrana fina < 2 mm confirma monocorionicidade e impõe alto risco obstétrico.'
      },
      {
        id: 2,
        name: 'Complicações Exclusivas Monocoriônicas',
        shortName: 'Monocoriônica',
        percentage: 13,
        questionCount: 18,
        priority: 'Alta',
        color: '#10B981',
        title: 'Gestações monocoriônicas compartilham a mesma placenta',
        focusExplanation: 'A circulação vascular compartilhada através de anastomoses predispõe a STFF, TAPS, TRAP e CIUR seletivo. Exigem ultrassom com Doppler quinzenal a partir de 16 semanas.'
      },
      {
        id: 3,
        name: 'Zigotia: Monozigóticos vs. Dizigóticos',
        shortName: 'Zigotia & Clivagem',
        percentage: 11,
        questionCount: 16,
        priority: 'Média',
        color: '#EC4899',
        title: 'Clivagem temporal do zigoto único dita a placentação',
        focusExplanation: 'Divisão em 0-3 dias gera Dicoriônica Diamniótica (30%); 4-8 dias gera Monocoriônica Diamniótica (70%); 9-12 dias gera Monocoriônica Monoamniótica (1-2%); > 13 dias gera gêmeos siameses.'
      },
      {
        id: 4,
        name: 'Ultrassonografia 1º Tri: Sinais Diagnósticos (Lambda vs. T)',
        shortName: 'Lambda vs. Sinal do T',
        percentage: 11,
        questionCount: 15,
        priority: 'Média',
        color: '#8B5CF6',
        title: 'Pegadinha clássica de prova com imagens ultrassonográficas',
        focusExplanation: 'Fetos de sexos diferentes são obrigatoriamente dizigóticos e dicoriônicos. No segundo e terceiro trimestres, placentas dicoriônicas podem se fundir falsamente aparentando placenta única.'
      },
      {
        id: 5,
        name: 'Epidemiologia, Fatores de Risco e Manejo Geral',
        shortName: 'Epidemiologia',
        percentage: 8,
        questionCount: 11,
        priority: 'Média',
        color: '#F59E0B',
        title: 'Fatores de risco para dizigotia vs. monozigotia espontânea',
        focusExplanation: 'A dizigotia varia com idade materna avançada, multiparidade, hereditariedade e reprodução assistida. A taxa de monozigotia é constante e independente em todo o mundo (~1 em cada 250 nascimentos).'
      }
    ]
  },
  complicacoes: {
    title: 'Recorrência Temática: Complicações da Gemelaridade Monocoriônica',
    subtitle: 'Distribuição censitária de 72 questões oficiais em concursos médicos',
    totalQuestions: 72,
    items: [
      {
        id: 1,
        name: 'Síndrome da Transfusão Feto-Fetal (STFF)',
        shortName: 'STFF na Gemelaridade',
        percentage: 31,
        questionCount: 22,
        priority: 'Crítica',
        color: '#3B82F6',
        title: 'Desbalanço hemodinâmico por anastomoses arteriovenosas profundas',
        focusExplanation: 'Caracterizada por oligoâmnio acentuado no doador e polidrâmnio com sobrecarga volêmica no receptor. Tratamento padrão-ouro: ablação a laser por fetoscopia entre 16 e 26 semanas.'
      },
      {
        id: 2,
        name: 'TRAP: Sequência de Perfusão Arterial Reversa',
        shortName: 'TRAP / Feto Acárdico',
        percentage: 29,
        questionCount: 21,
        priority: 'Alta',
        color: '#10B981',
        title: 'Anastomose artério-arterial e veno-venosa direta de alto fluxo',
        focusExplanation: 'O feto doador "bomba" sofre sobrecarga cardíaca e hidropisia ao perfundir retrógradamente um concepto acárdico/malformado. Conduta: oclusão vascular do cordão umbilical do feto acárdico.'
      },
      {
        id: 3,
        name: 'Complicações Gerais & Prematuridade',
        shortName: 'Complicações Gerais',
        percentage: 22,
        questionCount: 16,
        priority: 'Alta',
        color: '#EC4899',
        title: 'Sobredistensão uterina e trabalho de parto prematuro',
        focusExplanation: 'Mais de 50% dos gemelares nascem prematuros (< 37 semanas). A complicação materna mais temida é a hemorragia pós-parto por atonia uterina decorrente da sobredistensão.'
      },
      {
        id: 4,
        name: 'Morte de um Gemelar Monocoriônico & Lesão Neurológica',
        shortName: 'Óbito de um Gemelar',
        percentage: 7,
        questionCount: 5,
        priority: 'Média',
        color: '#8B5CF6',
        title: 'Exsanguinação reflexa aguda para a placenta do feto falecido',
        focusExplanation: 'A morte súbita de um gemelar monocoriônico causa hipotensão grave reflexa e isquemia cerebral no concepto vivo (leucomalácia periventricular). Não realizar cesariana de emergência indiscriminada.'
      },
      {
        id: 5,
        name: 'CIUR Seletivo & TAPS (Anemia-Policitemia)',
        shortName: 'CIUR & TAPS',
        percentage: 11,
        questionCount: 8,
        priority: 'Média',
        color: '#F59E0B',
        title: 'Discordância ponderal >= 20% e Doppler da Artéria Cerebral Média',
        focusExplanation: 'CIUR seletivo é classificado por Gratacós pelo Doppler da artéria umbilical. O TAPS decorre de microanastomoses AV (< 1 mm) sem diferença de líquido amniótico, diagnosticado pelo pico sistólico da ACM.'
      }
    ]
  },
  stff: {
    title: 'Recorrência Temática: Síndrome da Transfusão Feto-Fetal (STFF)',
    subtitle: 'Distribuição censitária de 48 questões oficiais de residência médica',
    totalQuestions: 48,
    items: [
      {
        id: 1,
        name: 'Critérios Diagnósticos & Achados Ultrassonográficos',
        shortName: 'Critérios USG',
        percentage: 40,
        questionCount: 19,
        priority: 'Crítica',
        color: '#3B82F6',
        title: 'Oligoâmnio no doador + Polidrâmnio no receptor em MCDA',
        focusExplanation: 'Critérios obrigatórios: monocoriônica diamniótica com Maior Bolsão Vertical (MBV) < 2 cm no doador E > 8 cm (até 20 sem) ou > 10 cm (após 20 sem) no receptor. Discordância de peso NÃO é critério diagnóstico de STFF!'
      },
      {
        id: 2,
        name: 'Classificação de Quintero (Estádios I a V)',
        shortName: 'Estadiamento Quintero',
        percentage: 21,
        questionCount: 10,
        priority: 'Alta',
        color: '#10B981',
        title: 'Estadiamento de Quintero é o divisor de conduta em prova',
        focusExplanation: 'Grau I: Oligo/Poli com bexiga visível; Grau II: Bexiga do doador não visualizada (anúria); Grau III: Doppler alterado (diástole zero/reversa na AU ou onda A reversa no DV); Grau IV: Hidropisia; Grau V: Óbito.'
      },
      {
        id: 3,
        name: 'Fisiopatologia das Anastomoses Placentárias',
        shortName: 'Anastomoses AV',
        percentage: 21,
        questionCount: 10,
        priority: 'Alta',
        color: '#EC4899',
        title: 'Anastomoses arteriovenosas profundas sem shunt protetor',
        focusExplanation: 'Ocorre em 10-15% das MCDA. Falta de anastomoses artério-arteriais superficiais que reequilibrariam a pressão intravascular leva à sobrecarga volêmica crônica no receptor e hipovolemia no doador.'
      },
      {
        id: 4,
        name: 'Tratamento Padrão-Ouro: Fotocoagulação a Laser',
        shortName: 'Ablação a Laser',
        percentage: 6,
        questionCount: 3,
        priority: 'Média',
        color: '#8B5CF6',
        title: 'Ablação vascular fetoscópica (Técnica de Solomon)',
        focusExplanation: 'Primeira escolha formal entre 16 e 26 semanas a partir do Estágio I progressivo/sintomático ou II a IV. Aumenta a sobrevida neurológica de pelo menos um dos fetos para > 80%.'
      },
      {
        id: 5,
        name: 'Epidemiologia, Características do Receptor e Prognóstico',
        shortName: 'Prognóstico & Clínica',
        percentage: 12,
        questionCount: 6,
        priority: 'Média',
        color: '#F59E0B',
        title: 'Feto prensado (stuck twin) vs. feto hidrópico descompensado',
        focusExplanation: 'Sem tratamento, a mortalidade perinatal na STFF grave ultrapassa 90%. O receptor desenvolve hipertrofia de ventrículo direito, regurgitação tricúspide e hidropisia por falência cardíaca.'
      }
    ]
  },
  parto: {
    title: 'Recorrência Temática: Assistência ao Parto na Gestação Múltipla',
    subtitle: 'Distribuição censitária de 36 questões de provas (ENARE, USP, PSU-MG)',
    totalQuestions: 36,
    items: [
      {
        id: 1,
        name: 'Momento do Parto: Idade Gestacional por Corionicidade',
        shortName: 'Idade Gestacional',
        percentage: 28,
        questionCount: 10,
        priority: 'Alta',
        color: '#3B82F6',
        title: 'Cronograma rigoroso de interrupção conforme placentação',
        focusExplanation: 'Dicoriônica Diamniótica: 37 a 38+6 semanas. Monocoriônica Diamniótica: 36 a 37 semanas. Monocoriônica Monoamniótica: 32 a 34 semanas por cesariana eletiva mandatória com corticoterapia prévia.'
      },
      {
        id: 2,
        name: 'Termo e Condições para Parto Vaginal',
        shortName: 'Condições Parto Vaginal',
        percentage: 28,
        questionCount: 10,
        priority: 'Alta',
        color: '#10B981',
        title: 'Primeiro feto cefálico autoriza tentativa de parto normal',
        focusExplanation: 'Critérios: 1º feto em apresentação cefálica, peso fetal estimado > 1.500g e sem discordância acentuada (> 20-25%). Presença de equipe obstétrica habilitada em manobras de sala de parto.'
      },
      {
        id: 3,
        name: 'Indicações Formais de Parto Cesáreo em Gemelar',
        shortName: 'Indicação de Cesárea',
        percentage: 17,
        questionCount: 6,
        priority: 'Alta',
        color: '#EC4899',
        title: '1º feto pélvico/córmico ou gestação monoamniótica',
        focusExplanation: 'Se o 1º gemelar não for cefálico, a cesariana é absoluta pelo risco de engastamento de cabeças fetais. Em monoamnióticas, o risco de entrelaçamento letal de cordão impõe cesariana eletiva precoce.'
      },
      {
        id: 4,
        name: 'Via de Parto conforme Apresentação Combinada',
        shortName: 'Apresentação Fetal',
        percentage: 14,
        questionCount: 5,
        priority: 'Média',
        color: '#8B5CF6',
        title: 'Cefálico-Cefálico (vaginal) vs. Cefálico-Não Cefálico (vaginal viável)',
        focusExplanation: 'Com o 1º cefálico e o 2º pélvico, pode-se realizar o parto vaginal do 1º seguido de versão podálica interna ou extração pélvica assistida do 2º se indicado.'
      },
      {
        id: 5,
        name: 'Manejo do Segundo Gemelar & Intervalo Seguro',
        shortName: '2º Gemelar',
        percentage: 13,
        questionCount: 5,
        priority: 'Média',
        color: '#F59E0B',
        title: 'Clampeamento imediato do 1º e monitorização do 2º',
        focusExplanation: 'Clampear o cordão do 1º imediatamente para evitar exsanguinação. Confirmar apresentação do 2º por USG/palpação. Intervalo de até 30 minutos com frequência cardíaca fetal normal.'
      }
    ]
  }
};

interface Props {
  topic?: GemTopic;
}

export const GemelaridadeRecurrenceStatsCard: React.FC<Props> = ({ topic = 'corionicidade' }) => {
  const { mode, accentConfig } = useTheme();
  const isDark = mode === 'dark';

  const currentDataset = GEM_DATA_MAP[topic] || GEM_DATA_MAP.corionicidade;
  const items = currentDataset.items;

  // Controle de fixação por clique (Lock de Seleção)
  const [lockedIndex, setLockedIndex] = useState<number | null>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isPieAnimationDone, setIsPieAnimationDone] = useState<boolean>(false);

  useEffect(() => {
    setLockedIndex(0);
    setHoveredIndex(null);
    setIsPieAnimationDone(false);
    const timer = setTimeout(() => {
      setIsPieAnimationDone(true);
    }, 900);
    return () => clearTimeout(timer);
  }, [topic]);

  const activeIndex = lockedIndex !== null ? lockedIndex : hoveredIndex !== null ? hoveredIndex : 0;
  const activeItem = items[activeIndex] || items[0];

  const handleSelectSector = (idx: number) => {
    setLockedIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div
      className={`my-8 rounded-2xl border transition-all overflow-hidden ${
        isDark
          ? 'bg-[#121215] border-zinc-800 shadow-md'
          : 'bg-white border-zinc-200/90 shadow-xs'
      }`}
    >
      {/* Cabeçalho do Card */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/60 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              {currentDataset.title}
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Sparkles className="w-3 h-3" /> Censo Oficial
              </span>
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {currentDataset.subtitle} • Clique em um setor para travar os detalhes de prova
            </p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30">
          Obstetrícia de Alto Risco (FEBRASGO)
        </span>
      </div>

      {/* Conteúdo Principal: Donut Recharts + Barras de Frequência */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Coluna do Gráfico Donut (5 Colunas) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[220px]">
          <div
            className={`w-full h-[220px] relative ${!isPieAnimationDone ? 'pointer-events-none' : 'pointer-events-auto'}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={items}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={86}
                  paddingAngle={3}
                  dataKey="questionCount"
                  animationBegin={0}
                  animationDuration={800}
                  isAnimationActive={!isPieAnimationDone}
                  onClick={(_, idx) => handleSelectSector(idx)}
                  onMouseEnter={(_, idx) => {
                    if (lockedIndex === null) setHoveredIndex(idx);
                  }}
                  onMouseLeave={() => {
                    if (lockedIndex === null) setHoveredIndex(null);
                  }}
                  cursor="pointer"
                >
                  {items.map((entry, idx) => {
                    const isSelected = idx === activeIndex;
                    const opacity = lockedIndex !== null ? (isSelected ? 1 : 0.28) : 1;
                    return (
                      <Cell
                        key={`cell-${entry.id}`}
                        fill={entry.color}
                        opacity={opacity}
                        stroke={isDark ? '#121215' : '#ffffff'}
                        strokeWidth={isSelected ? 3 : 1.5}
                        className="transition-all duration-300"
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centro Informativo do Donut (Sem tooltip preto flutuante) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl sm:text-3xl font-heading font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                {activeItem.percentage}%
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-[110px] text-center leading-tight truncate">
                {activeItem.shortName}
              </span>
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                {activeItem.questionCount} questões
              </span>
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              Total mapeado no tema: <strong>{currentDataset.totalQuestions} questões</strong>
            </span>
          </div>
        </div>

        {/* Coluna das Barras e Subfocos (7 Colunas) */}
        <div className="lg:col-span-7 space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
          {items.map((item, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <div
                key={item.id}
                onClick={() => handleSelectSector(idx)}
                onMouseEnter={() => {
                  if (lockedIndex === null) setHoveredIndex(idx);
                }}
                onMouseLeave={() => {
                  if (lockedIndex === null) setHoveredIndex(null);
                }}
                className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-zinc-800/80 border-zinc-700 shadow-sm'
                      : 'bg-zinc-50 border-zinc-300 shadow-xs'
                    : isDark
                      ? 'bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-800/40'
                      : 'bg-white border-zinc-200/60 hover:bg-zinc-50/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span
                      className={`font-heading font-bold truncate text-[11px] sm:text-xs ${
                        isSelected
                          ? 'text-zinc-900 dark:text-zinc-100'
                          : 'text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        item.priority === 'Crítica'
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : item.priority === 'Alta'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {item.priority}
                    </span>
                    <span className="font-heading font-black text-zinc-900 dark:text-zinc-100 text-xs w-8 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Barra de Progresso Suave */}
                <div className="w-full h-1.5 rounded-full bg-zinc-200/80 dark:bg-zinc-800 overflow-hidden">
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

      {/* Card Horizontal Inferior de Detalhamento do Setor Ativo (Lock de Seleção) */}
      <div
        className={`px-5 py-4 border-t transition-all ${
          isDark
            ? 'bg-zinc-900/60 border-zinc-800 text-zinc-200'
            : 'bg-zinc-50 border-zinc-200/80 text-zinc-800'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-white"
            style={{ backgroundColor: activeItem.color }}
          >
            <Info className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-heading font-black text-zinc-900 dark:text-zinc-100">
                {activeItem.title}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                ({activeItem.questionCount} questões oficiais analisadas)
              </span>
            </div>
            <p
              className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: activeItem.focusExplanation.replace(
                  /\*\*(.*?)\*\*/g,
                  '<strong class="font-bold text-zinc-900 dark:text-zinc-100">$1</strong>'
                )
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

