'use client';

import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Syringe
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface AlgorithmStep {
  stepNumber: number;
  timeWindow: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  actions: string[];
  drugsAndDoses: { name: string; dose: string; warning?: string }[];
  pearl: string;
}

const ALGORITHM_STEPS: AlgorithmStep[] = [
  {
    stepNumber: 1,
    timeWindow: '0 a 10 minutos',
    title: 'Medidas Iniciais & Manobras Mecânicas',
    subtitle: 'Reconhecimento precoce, pedido de ajuda multidisciplinar e compressão bimanual',
    badge: '1ª Linha Não-Farmacológica',
    badgeColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
    actions: [
      'Gritar por ajuda: Acionar equipe multiprofissional (Código Vermelho / Código Amarelo)',
      'Acessos Venosos: Puncionar 2 acessos venosos calibrosos periféricos (14G ou 16G)',
      'Oxigenoterapia sob máscara e monitorização contínua (PA, FC, SpO2 e ECG)',
      'Sondagem Vesical de Demora: Esvaziamento imediato da bexiga para permitir contração miometrial e monitorar débito urinário',
      'Massagem Uterina Bimanual (Manobra de Hamilton): Manter compressão firme da parede anterior pelo fundo de saco vaginal e posterior pelo abdome'
    ],
    drugsAndDoses: [
      { name: 'Cristaloides Aquecidos', dose: 'SF 0,9% ou RL (máximo 1.500 a 2.000 mL)', warning: 'Evitar sobrecarga para não induzir coagulopatia dilucional' }
    ],
    pearl: 'A bexiga cheia é obstáculo mecânico à contração; esvaziar a bexiga é passo obrigatório antes de avançar na cascata.'
  },
  {
    stepNumber: 2,
    timeWindow: '10 a 20 minutos',
    title: 'Farmacoterapia Sequencial em Cascata',
    subtitle: 'Administração simultânea e ordenada de uterotônicos e antifibrinolítico',
    badge: '1ª Linha Farmacológica',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    actions: [
      'Iniciar Ocitocina em infusão contínua imediata',
      'Infundir Ácido Tranexâmico em até 10 minutos (crucial nas primeiras 3 horas)',
      'Avaliar contraindicações de Metilergometrina (checar PA)',
      'Associar Misoprostol se atonia persistir'
    ],
    drugsAndDoses: [
      { name: 'Ocitocina IV', dose: '20 a 40 UI em 500 mL SF/RL em infusão rápida', warning: 'JAMAIS fazer em bolus IV rápido (risco de colapso circulatório e parada)' },
      { name: 'Ácido Tranexâmico IV', dose: '1 g diluído em 100 mL SF a correr em 10 min (WOMAN Trial)', warning: 'Máxima eficácia nas primeiras 3h; repetir 1g após 30 min se sangramento persistir' },
      { name: 'Metilergometrina IM', dose: '0,2 mg IM profundo (pode repetir em 2-4h)', warning: 'PROIBIDA em hipertensas, pré-eclâmpsia e coronariopatas (induz vasoespasmo)' },
      { name: 'Misoprostol', dose: '800 mcg via retal ou sublingual (4 comp. de 200 mcg)', warning: 'Seguro em hipertensas; causa febre transitória e tremores' }
    ],
    pearl: 'Na paciente hipertensa, salte imediatamente a metilergometrina e associe Misoprostol + Ácido Tranexâmico!'
  },
  {
    stepNumber: 3,
    timeWindow: '20 a 30 minutos',
    title: 'Tamponamento Mecânico Intrauterino',
    subtitle: 'Controle hemostático por compressão física da cavidade endometrial antes da laparotomia',
    badge: 'Ponte Conservadora Não-Cirúrgica',
    badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
    actions: [
      'Inserir Balão de Tamponamento Intrauterino (Balão de Bakri ou artesanal com preservativo)',
      'Insuflar com 300 a 500 mL de solução fisiológica estéril morna',
      'Conectar o dreno central à bolsa coletora para quantificar a hemostasia',
      'Realizar o "Teste do Balão" por 15 a 30 minutos',
      'Se sucesso: manter por 12 a 24 horas sob antibioticoprofilaxia e ocitocina de manutenção',
      'Se sangramento volumoso persistir pelo dreno: teste negativo (falha imediata, partir para laparotomia)'
    ],
    drugsAndDoses: [
      { name: 'Ocitocina de Manutenção', dose: '10 a 20 UI/L contínua para manter tono ao redor do balão' },
      { name: 'Cefazolina ou Ampicilina', dose: 'Dose profilática profilaxia infecciosa do balão' }
    ],
    pearl: 'Em parto normal, NUNCA abra a barriga sem antes tentar o balão de Bakri. Se o teste do balão for positivo, você evitou uma laparotomia desnecessária.'
  },
  {
    stepNumber: 4,
    timeWindow: '30 a 60 minutos',
    title: 'Laparotomia: Cirurgia Conservadora',
    subtitle: 'Suturas compressivas hemostáticas e ligaduras vasculares preservadoras de fertilidade',
    badge: 'Cirurgia Conservadora',
    badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30',
    actions: [
      'Laparotomia exploradora imediata no centro obstétrico',
      'Compressão bimanual intraoperatória direta do útero (teste prognóstico de sucesso)',
      'Passagem de Suturas Compressivas: Sutura de B-Lynch (padrão-ouro em suspensório), Hayman ou Cho',
      'Se atonia persistir: Desvascularização escalonada (Ligadura bilateral das artérias uterinas - Técnica de O\'Leary)',
      'Ligadura das artérias ilíacas internas (hipogástricas) se equipe habilitada'
    ],
    drugsAndDoses: [
      { name: 'Protocolo de Transfusão Maciça (1:1:1)', dose: 'Concentrado de Hemácias, Plasma e Plaquetas em proporção balanceada' },
      { name: 'Crioprecipitado', dose: '1 bolsa para cada 10 kg se Fibrinogênio sérico < 100 mg/dL' }
    ],
    pearl: 'Ligue apenas as artérias uterinas e ilíacas internas; NUNCA ligue a ilíaca comum ou externa (risco de isquemia de membro inferior e amputação).'
  },
  {
    stepNumber: 5,
    timeWindow: 'Tempo Final / Limite',
    title: 'Cirurgia Definitiva Salvadora de Vida',
    subtitle: 'Histerectomia puerperal de emergência para controle definitivo de danos',
    badge: 'Medida Extrema Salvadora de Vida',
    badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
    actions: [
      'Indicação: Falha das suturas compressivas, coagulopatia instalada ou choque Classe IV refratário com risco iminente de morte',
      'Técnica Preferencial: Histerectomia Subtotal (amputação supracervical) por ser muito mais rápida e evitar dissecção ureteral perigosa',
      'Histerectomia Total reservada apenas para acretismo placentário cervical ou roturas que atinjam o colo',
      'Damage Control Surgery: Tamponamento pélvico com compressas (packing pélvico) e transferência imediata para UTI'
    ],
    drugsAndDoses: [
      { name: 'Suporte Hemodinâmico Avançado', dose: 'Noradrenalina + Ácido Tranexâmico dose 2 + Fatores de coagulação' }
    ],
    pearl: 'O útero pode ser sacrificado; a vida da mãe, nunca. Não atrase a histerectomia em paciente com acidose, hipotermia e coagulopatia (tríade letal).'
  }
];

export const HppGoldenHourAlgorithmCard: React.FC = () => {
  const { mode, accentConfig } = useTheme();
  const isDark = mode === 'dark';
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const currentStep = ALGORITHM_STEPS[activeStepIndex];

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
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              Manejo Escalonado da Atonia Uterina (The Golden Hour)
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Algoritmo cronológico de tomada de decisão: da massagem bimanual à cirurgia definitiva
            </p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
          Protocolo Cronológico de Prova
        </span>
      </div>

      {/* Seletor Visual dos 5 Passos (Timeline Bar) */}
      <div className="px-5 pt-5 pb-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/30 dark:bg-zinc-900/20 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-[620px]">
          {ALGORITHM_STEPS.map((step, idx) => {
            const isSelected = activeStepIndex === idx;
            return (
              <button
                key={step.stepNumber}
                type="button"
                onClick={() => setActiveStepIndex(idx)}
                className={`flex-1 p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 shadow-xs ring-1 ring-zinc-400/30'
                    : 'bg-zinc-100/60 dark:bg-zinc-900/60 border-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase ${
                      isSelected
                        ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                        : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  >
                    Passo {step.stepNumber}
                  </span>
                  <span className="text-[9px] font-mono font-semibold text-zinc-400">
                    {step.timeWindow.split(' ')[0]} {step.timeWindow.split(' ')[1] || ''}
                  </span>
                </div>
                <div className="font-heading font-black text-xs text-zinc-800 dark:text-zinc-200 truncate">
                  {step.title.split('&')[0].split(':')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo Detalhado do Passo Selecionado */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* Título e Badge do Passo */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                {currentStep.timeWindow}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${currentStep.badgeColor}`}>
                {currentStep.badge}
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-heading font-black text-zinc-900 dark:text-zinc-100 mt-1">
              Passo {currentStep.stepNumber}: {currentStep.title}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {currentStep.subtitle}
            </p>
          </div>
        </div>

        {/* Grid: Ações Mandatórias vs Farmacoterapia */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Lado Esquerdo: Ações Práticas */}
          <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Ações Sequenciais Mandatórias:
            </span>

            <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
              {currentStep.actions.map((act, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{act}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Lado Direito: Fármacos / Dispositivos e Doses */}
          <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              <Syringe className="w-3.5 h-3.5 text-blue-500" />
              Fármacos, Dispositivos & Doses:
            </span>

            <div className="space-y-2.5">
              {currentStep.drugsAndDoses.map((drug, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-blue-100 dark:border-blue-900/40 text-xs space-y-1">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                    <span>{drug.name}</span>
                  </div>
                  <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                    {drug.dose}
                  </div>
                  {drug.warning && (
                    <div className="text-[10px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>{drug.warning}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pérola de Prova / Ponto Crítico */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-amber-950 dark:text-amber-100 mr-1">
              ★ Regra de Ouro de Prova [Passo {currentStep.stepNumber}]:
            </strong>
            <span>{currentStep.pearl}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
