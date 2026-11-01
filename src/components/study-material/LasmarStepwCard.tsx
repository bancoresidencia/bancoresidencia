'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Scissors, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';

interface CriteriaOption {
  label: string;
  points: number;
  description: string;
}

interface StepwCriterion {
  key: 'size' | 'topography' | 'extension' | 'penetration' | 'wall';
  letter: string;
  name: string;
  clinicalMeaning: string;
  options: CriteriaOption[];
}

const STEPW_CRITERIA: StepwCriterion[] = [
  {
    key: 'size',
    letter: 'S',
    name: 'Tamanho (Size)',
    clinicalMeaning: 'Diâmetro máximo do maior mioma na ultrassonografia ou RNM',
    options: [
      { label: '≤ 2 cm', points: 0, description: 'Rápida ressecção com baixo tempo cirúrgico' },
      { label: '> 2 cm e ≤ 4 cm', points: 1, description: 'Exige fatiamento repetido (slicing)' },
      { label: '> 4 cm', points: 2, description: 'Elevado volume de fragmentos e tempo cirúrgico prolongado' }
    ]
  },
  {
    key: 'topography',
    letter: 'T',
    name: 'Topografia (Topography)',
    clinicalMeaning: 'Terço uterino em que a base do nódulo está implantada',
    options: [
      { label: 'Terço Inferior', points: 0, description: 'Acesso histeroscópico direto e imediato' },
      { label: 'Terço Médio', points: 1, description: 'Acesso favorável no corpo uterino' },
      { label: 'Terço Superior (Fundo)', points: 2, description: 'Dificuldade de angulação e risco aumentado de perfuração' }
    ]
  },
  {
    key: 'extension',
    letter: 'E',
    name: 'Extensão da Base (Extension)',
    clinicalMeaning: 'Proporção da parede da cavidade ocupada pela base do mioma',
    options: [
      { label: '≤ 1/3 da parede', points: 0, description: 'Base estreita ou pediculada' },
      { label: '> 1/3 a 1/2 da parede', points: 1, description: 'Base séssil moderada' },
      { label: '> 1/2 da parede', points: 2, description: 'Base séssil alargada, extenso leito vascular cruento' }
    ]
  },
  {
    key: 'penetration',
    letter: 'P',
    name: 'Penetração Miometrial (Penetration)',
    clinicalMeaning: 'Profundidade da invasão no miométrio (Critério FIGO)',
    options: [
      { label: 'FIGO 0 (Pediculado)', points: 0, description: 'Totalmente intracavitário, sem componente no miométrio' },
      { label: 'FIGO 1 (< 50% intramural)', points: 1, description: 'Predomínio cavitário com margem miometrial preservada' },
      { label: 'FIGO 2 (≥ 50% intramural)', points: 2, description: 'Profundo no miométrio, risco de perfuração e leito residual' }
    ]
  },
  {
    key: 'wall',
    letter: 'W',
    name: 'Parede de Fixação (Wall)',
    clinicalMeaning: 'Localização anatômica da fixação na parede uterina',
    options: [
      { label: 'Parede Anterior ou Posterior', points: 0, description: 'Fácil alinhamento com a alça do ressectoscópio' },
      { label: 'Parede Lateral (+1 pto extra)', points: 1, description: 'Risco de lesão vascular dos ramos uterinos e difícil angulação' }
    ]
  }
];

export const LasmarStepwCard: React.FC = () => {
  const { mode, accentConfig } = useTheme();
  const isDark = mode === 'dark';

  const [selections, setSelections] = useState<Record<string, number>>({
    size: 0,
    topography: 0,
    extension: 0,
    penetration: 0,
    wall: 0
  });

  const handleSelect = (key: string, points: number) => {
    setSelections((prev) => ({ ...prev, [key]: points }));
  };

  const handleReset = () => {
    setSelections({
      size: 0,
      topography: 0,
      extension: 0,
      penetration: 0,
      wall: 0
    });
  };

  const totalScore = Object.values(selections).reduce((acc, curr) => acc + curr, 0);

  const getRecommendation = (score: number) => {
    if (score <= 4) {
      return {
        group: 'GRUPO I',
        complexity: 'Baixa Complexidade',
        conduct: 'Miomectomia histeroscópica em tempo único',
        badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
        borderColor: 'border-emerald-500/40',
        bgBox: 'bg-emerald-500/5 dark:bg-emerald-500/10',
        icon: CheckCircle2,
        details: [
          'Alta probabilidade de ressecção completa no mesmo procedimento.',
          'Dispensa preparo hormonal pré-operatório com análogos de GnRH.',
          'Mínimo risco de sobrecarga de fluido de distensão (líquido não-eletrolítico ou salina).'
        ]
      };
    }
    if (score <= 6) {
      return {
        group: 'GRUPO II',
        complexity: 'Alta Complexidade',
        conduct: 'Miomectomia histeroscópica em dois tempos',
        badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
        borderColor: 'border-amber-500/40',
        bgBox: 'bg-amber-500/5 dark:bg-amber-500/10',
        icon: AlertTriangle,
        details: [
          'Procedimento planejado em 2 etapas para evitar intoxicação hídrica por tempo excessivo (> 30-40 min).',
          'Recomenda-se preparo pré-operatório com análogo de GnRH por 2 a 3 meses para reduzir vascularização e volume.',
          'Informar formalmente à paciente sobre a necessidade de segundo tempo cirúrgico.'
        ]
      };
    }
    return {
      group: 'GRUPO III',
      complexity: 'Procedimento Não Recomendado',
      conduct: 'Indicar via laparoscópica, laparotômica ou embolização',
      badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
      borderColor: 'border-rose-500/40',
      bgBox: 'bg-rose-500/5 dark:bg-rose-500/10',
      icon: AlertCircle,
      details: [
        'Via histeroscópica puramente contraindicada pelo risco extremo de complicações.',
        'Elevado risco de perfuração uterina e falsa via miometrial.',
        'Opções padrão: Miomectomia laparoscópica/abdominal ou Embolização de Artérias Uterinas (EAU).'
      ]
    };
  };

  const currentResult = getRecommendation(totalScore);
  const ResultIcon = currentResult.icon;

  return (
    <div
      className={`my-8 rounded-2xl border transition-all overflow-hidden ${
        isDark ? 'bg-[#121215] border-zinc-800 shadow-md' : 'bg-white border-zinc-200/90 shadow-xs'
      }`}
    >
      {/* Cabeçalho */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/60 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                Escore STEPW de Lasmar — Calculadora e Diretriz Cirúrgica
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                FEBRASGO / AAGL
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Estratificação de viabilidade cirúrgica para miomectomia histeroscópica
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Resetar</span>
        </button>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Lado Esquerdo: Seletores dos 5 Critérios STEPW (7 colunas) */}
        <div className="lg:col-span-7 space-y-4">
          {STEPW_CRITERIA.map((criterion) => {
            const currentVal = selections[criterion.key];
            return (
              <div
                key={criterion.key}
                className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[11px] font-black font-mono text-zinc-800 dark:text-zinc-200">
                      {criterion.letter}
                    </span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {criterion.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-zinc-500 dark:text-zinc-400">
                    {currentVal} {currentVal === 1 ? 'ponto' : 'pontos'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {criterion.options.map((opt) => {
                    const isSelected = currentVal === opt.points;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => handleSelect(criterion.key, opt.points)}
                        className={`p-2.5 text-left rounded-lg border text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold shadow-xs'
                            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold">{opt.label}</span>
                          <span
                            className={`text-[10px] font-mono px-1 rounded ${
                              isSelected
                                ? 'bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-900'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                            }`}
                          >
                            +{opt.points}
                          </span>
                        </div>
                        <div
                          className={`mt-1 text-[10px] leading-tight line-clamp-2 ${
                            isSelected
                              ? 'text-zinc-200 dark:text-zinc-700 font-normal'
                              : 'text-zinc-500 dark:text-zinc-400'
                          }`}
                        >
                          {opt.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Lado Direito: Painel de Decisão Cirúrgica (5 colunas) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className={`p-5 rounded-2xl border ${currentResult.borderColor} ${currentResult.bgBox} space-y-4 transition-all`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Pontuação Calculada
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                    {totalScore}
                  </span>
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    / 9 pontos
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${currentResult.badgeColor}`}
                >
                  <ResultIcon className="w-3.5 h-3.5" />
                  {currentResult.group}
                </span>
                <div className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mt-1">
                  {currentResult.complexity}
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-200/60 dark:border-zinc-800/60 pt-3">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Conduta Cirúrgica Obrigatória
              </span>
              <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {currentResult.conduct}
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Critérios Clínicos de Decisão
              </span>
              <ul className="space-y-1.5 pt-1 text-xs text-zinc-700 dark:text-zinc-300">
                {currentResult.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tabela de Referência Rápida dos Grupos */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs space-y-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
              Regra de Ouro para Concursos Médicos
            </span>
            <div className="space-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
              <div className="flex items-start gap-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0 font-mono">
                  0 a 4 pts:
                </span>
                <span>Tempo Único (Histeroscopia direta).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-amber-600 dark:text-amber-400 shrink-0 font-mono">
                  5 a 6 pts:
                </span>
                <span>Dois Tempos (Preparo com análogo GnRH 2-3 meses).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-rose-600 dark:text-rose-400 shrink-0 font-mono">
                  7 a 9 pts:
                </span>
                <span>NÃO indicar histeroscopia (Laparotomia/Laparoscopia).</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
