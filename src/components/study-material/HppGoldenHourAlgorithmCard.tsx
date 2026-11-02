'use client';

import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Syringe,
  Target
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface AlgorithmStep {
  stepNumber: number;
  timeWindow: string;
  title: string;
  subtitle: string;
  mainPoint: string;
  badge: string;
  badgeColor: string;
  actions: string[];
  drugsAndDoses: { name: string; dose: string; warning?: string }[];
  pearl: string;
}

const ALGORITHM_STEPS: AlgorithmStep[] = [
  {
    stepNumber: 1,
    timeWindow: '0 a 10 min',
    title: 'Medidas Iniciais & Manobras Mecânicas',
    subtitle: 'Reconhecimento precoce, chamada de ajuda e massagem bimanual contínua',
    mainPoint: '**Massagem Bimanual de Hamilton** contínua + **Sondagem Vesical de Demora (Foley)** mandatória imediata.',
    badge: '1ª Linha Não-Farmacológica',
    badgeColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
    actions: [
      '**Código Vermelho:** acionar equipe multidisciplinar e garantir **2 acessos venosos calibrosos (14G ou 16G)**.',
      '**Sondagem Vesical (Foley):** esvaziar a bexiga imediatamente (a repleção vesical impede mecanicamente a contração miometrial).',
      '**Manobra de Hamilton:** massagem uterina bimanual contínua (punho na vagina + mão no abdome comprimindo o útero).'
    ],
    drugsAndDoses: [
      { name: 'Cristaloides Aquecidos (RL ou SF)', dose: 'Alíquotas de 500 mL (evitar hiper-hidratação e coagulopatia dilucional)' }
    ],
    pearl: '**Bexiga cheia impede a contração do miométrio**. Nunca declare refratariedade sem antes passar a sonda de Foley!'
  },
  {
    stepNumber: 2,
    timeWindow: '10 a 20 min',
    title: 'Farmacoterapia Escalonada',
    subtitle: 'Uterotônicos em dose máxima associados ao ácido tranexâmico precoce',
    mainPoint: '**Ocitocina IV contínua** + **Ácido Tranexâmico 1g IV precoce** (< 3h) + **Metilergometrina IM** (ou Misoprostol se HAS).',
    badge: '1ª Linha Farmacológica',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    actions: [
      '**Ocitocina IV contínua:** 20 a 40 UI em 500 mL de SF em infusão rápida (**JAMAIS em bolus IV puro** pelo risco de colapso).',
      '**Ácido Tranexâmico IV:** 1 g em 10 min nas primeiras 3h do parto (**WOMAN Trial**: reduz mortalidade materna por sangramento).',
      '**2ª Linha Farmacológica:** **Metilergometrina 0,2 mg IM** (se normotensa) OU **Misoprostol 800 mcg** retal/sublingual (se hipertensa).'
    ],
    drugsAndDoses: [
      { name: 'Ocitocina', dose: '20-40 UI em 500 mL SF (infusão rápida; NUNCA bolus puro)' },
      { name: 'Ácido Tranexâmico', dose: '1 g IV diluído em 100 mL SF em 10 min (pode repetir 1g após 30 min)' },
      { name: 'Metilergometrina', dose: '0,2 mg IM', warning: 'Contraindicado em pré-eclâmpsia/hipertensão' },
      { name: 'Misoprostol', dose: '800 mcg via retal ou sublingual (4 cp de 200 mcg)' }
    ],
    pearl: '**Metilergometrina é formalmente contraindicada** em pacientes hipertensas ou com pré-eclâmpsia (risco de AVC e crise hipertensiva).'
  },
  {
    stepNumber: 3,
    timeWindow: '15 a 30 min',
    title: 'Tamponamento Intrauterino (Balão de Bakri)',
    subtitle: 'Manejo mecânico intrauterino no parto normal antes de laparotomia',
    mainPoint: '**Balão de Bakri** via transvaginal (300-500 mL SF). Teste positivo = manter 12-24h; sangramento persistente = **laparotomia imediata**.',
    badge: 'Padrão-Ouro Conservador',
    badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30',
    actions: [
      '**Indicação Mandatória:** Atonia refratária a fármacos após **parto vaginal** com útero intacto.',
      '**Técnica de Inserção:** introduzir o balão sob palpação e insuflar com **300 a 500 mL de SF morno**.',
      '**Teste do Balão:** se o sangramento cessar (**teste positivo**), manter por 12 a 24h; se persistir sangramento ativo pelo dreno (**teste negativo**), **laparotomia imediata**.'
    ],
    drugsAndDoses: [
      { name: 'Ocitocina em Infusão', dose: 'Manter infusão contínua enquanto o balão estiver insuflado' },
      { name: 'Cefazolina 2g IV', dose: 'Antibioticoprofilaxia obrigatória durante o tamponamento' }
    ],
    pearl: '**Sangramento ativo pelo dreno do balão indica falha**: não espere! Interrompa o procedimento e indique laparotomia imediata.'
  },
  {
    stepNumber: 4,
    timeWindow: '30 a 60 min',
    title: 'Cirurgia Conservadora (Laparotomia)',
    subtitle: 'Suturas compressivas uterinas e desvascularização seletiva pélvica',
    mainPoint: '**Sutura de B-Lynch** ("em suspensório") + **Ligaduras Vasculares Seletivas** (artérias uterinas e hipogástricas).',
    badge: 'Preservação Uterina',
    badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
    actions: [
      '**Sutura de B-Lynch:** alças longitudinais de compressão com fio absorvível, preservando a fertilidade da puérpera.',
      '**Ligadura de Artérias Uterinas (O\'Leary):** desvascularização bilateral escalonada no ramo ascendente.',
      '**Ligadura de Artérias Hipogástricas (Ilíacas Internas):** indicada se a atonia persistir após ligadura uterina.'
    ],
    drugsAndDoses: [
      { name: 'Fio de B-Lynch', dose: 'Fio de absorção lenta (Monocryl 1 / Catgut cromado / PDS) agulha romba' }
    ],
    pearl: 'Ligue apenas as artérias uterinas e ilíacas internas; **NUNCA ligue a ilíaca comum ou externa** (risco de amputação do membro inferior!).'
  },
  {
    stepNumber: 5,
    timeWindow: 'Tempo Final',
    title: 'Cirurgia Definitiva Salvadora',
    subtitle: 'Histerectomia puerperal de emergência para controle definitivo de danos',
    mainPoint: '**Histerectomia Subtotal de emergência** (poupa ureteres) + **Transfusão Maciça balanceada (1:1:1)**.',
    badge: 'Controle de Danos',
    badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
    actions: [
      '**Indicação:** Choque refratário, tríade letal (acidose, hipotermia, coagulopatia) ou falha das suturas compressivas.',
      '**Histerectomia Subtotal:** técnica preferencial por ser **muito mais rápida** e poupar dissecção ureteral.',
      '**Controle de Danos:** *packing* pélvico compressivo com compressas e encaminhamento imediato para UTI.'
    ],
    drugsAndDoses: [
      { name: 'Protocolo Transfusional Maciço', dose: 'Proporção balanceada 1:1:1 (CH : PFC : Plaquetas) + Crioprecipitado' }
    ],
    pearl: '**O útero pode ser sacrificado; a vida da mãe, nunca**. Na presença de coagulopatia grave, a histerectomia rápida salva a vida.'
  }
];

export const HppGoldenHourAlgorithmCard: React.FC = () => {
  const { mode, accentConfig } = useTheme();
  const isDark = mode === 'dark';
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const currentStep = ALGORITHM_STEPS[activeStepIndex];

  return (
    <div
      className={`my-6 rounded-2xl border transition-all overflow-hidden ${
        isDark
          ? 'bg-[#121215] border-zinc-800 shadow-md'
          : 'bg-white border-zinc-200/90 shadow-xs'
      }`}
    >
      {/* Cabeçalho Compacto */}
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 bg-zinc-50/60 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-xs"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
              Fluxograma Cronológico: Golden Hour da Atonia Uterina
            </h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
              Clique nos passos abaixo para inspecionar as condutas e dosagens exatas
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/20">
          Decisão Sequencial de Prova
        </span>
      </div>

      {/* Seletor Compacto dos 5 Passos */}
      <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/30 dark:bg-zinc-900/20 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-[540px]">
          {ALGORITHM_STEPS.map((step, idx) => {
            const isSelected = activeStepIndex === idx;
            return (
              <button
                key={step.stepNumber}
                type="button"
                onClick={() => setActiveStepIndex(idx)}
                className={`flex-1 px-2.5 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 shadow-xs ring-1 ring-zinc-400/30'
                    : 'bg-zinc-100/70 dark:bg-zinc-900/60 border-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span
                    className={`text-[9px] font-black uppercase ${
                      isSelected
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  >
                    Passo {step.stepNumber}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-400">
                    {step.timeWindow}
                  </span>
                </div>
                <div className="font-heading font-bold text-[11px] text-zinc-800 dark:text-zinc-200 truncate">
                  {step.title.split('&')[0].split('(')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalhes do Passo Ativo */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                {currentStep.timeWindow}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${currentStep.badgeColor}`}>
                {currentStep.badge}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-heading font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              Passo {currentStep.stepNumber}: {currentStep.title}
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {currentStep.subtitle}
            </p>
          </div>
        </div>

        {/* Ponto Principal do Passo (Destaque Imediato) */}
        <div className="p-3 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/25 flex items-start gap-2.5 text-xs text-blue-950 dark:text-blue-200">
          <Target className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold text-blue-700 dark:text-blue-300 mr-1.5 uppercase text-[10px] tracking-wider">
              Ponto Principal:
            </strong>
            <span
              dangerouslySetInnerHTML={{
                __html: currentStep.mainPoint.replace(
                  /\*\*(.*?)\*\*/g,
                  '<strong class="font-bold text-zinc-900 dark:text-zinc-100">$1</strong>'
                )
              }}
            />
          </div>
        </div>

        {/* 2 Colunas: Ações vs Fármacos e Doses */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Ações */}
          <div className="lg:col-span-7 p-3.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Ações Imediatas:
            </span>
            <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
              {currentStep.actions.map((act, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span
                    className="leading-snug"
                    dangerouslySetInnerHTML={{
                      __html: act.replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong class="font-bold text-zinc-900 dark:text-zinc-100">$1</strong>'
                      )
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Doses e Fármacos */}
          <div className="lg:col-span-5 p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              <Syringe className="w-3.5 h-3.5 text-blue-500" />
              Doses & Dispositivos de Escolha:
            </span>
            <div className="space-y-2">
              {currentStep.drugsAndDoses.map((d, i) => (
                <div key={i} className="text-xs">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                    <span>{d.name}</span>
                  </div>
                  <div className="font-mono text-[11px] text-blue-700 dark:text-blue-300 font-semibold">
                    {d.dose}
                  </div>
                  {d.warning && (
                    <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                      {d.warning}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pegadinha de Prova */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300 leading-snug">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold text-amber-950 dark:text-amber-200 mr-1.5">
              Pegadinha de Prova do Passo {currentStep.stepNumber}:
            </strong>
            <span
              dangerouslySetInnerHTML={{
                __html: currentStep.pearl.replace(
                  /\*\*(.*?)\*\*/g,
                  '<strong class="font-bold text-amber-950 dark:text-amber-100">$1</strong>'
                )
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
