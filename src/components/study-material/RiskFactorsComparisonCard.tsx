'use client';

import React from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  Flame,
  Sparkles
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const RiskFactorsComparisonCard: React.FC = () => {
  const { mode, accentConfig } = useTheme();
  const isDark = mode === 'dark';

  const riskFactors = [
    {
      title: 'Idade no Menacme',
      desc: 'Pico de incidência e diagnóstico entre 35 e 45 anos (estímulo hormonal contínuo).'
    },
    {
      title: 'Etnia Negra',
      desc: 'Prevalência 3x maior; surgimento precoce, miomas mais volumosos e sintomas mais severos.'
    },
    {
      title: 'Menarca Precoce (< 10-11 anos)',
      desc: 'Início precoce dos ciclos anovulatórios e exposição estrogênica estendida ao longo da vida.'
    },
    {
      title: 'Nuliparidade',
      desc: 'Janela ovulatória ininterrupta sem os períodos protetores de remodelamento e isquemia uterina.'
    },
    {
      title: 'História Familiar de 1º Grau',
      desc: 'Mãe ou irmãs com miomatose elevam o risco relativo de 2 a 3 vezes (mutação somática MED12).'
    },
    {
      title: 'Obesidade e Síndrome Metabólica',
      desc: 'Conversão periférica de androgênios em estrona pelo tecido adiposo (aromatase aumentada).'
    },
    {
      title: 'Dieta e Estilo de Vida',
      desc: 'Consumo elevado de carne vermelha e álcool (especialmente cerveja).'
    }
  ];

  const protectiveFactors = [
    {
      title: 'Multiparidade',
      desc: 'A cada gestação de termo o risco cai ~20-40%. O puerpério induz isquemia e apoptose miometrial.'
    },
    {
      title: 'Menarca Tardia (> 14-15 anos)',
      desc: 'Menor tempo total de exposição tecidual aos picos de estradiol e progesterona.'
    },
    {
      title: 'Uso Prolongado de ACO / Depo-Provera',
      desc: 'Bloqueio do eixo hipotálamo-hipófise-ovário e supressão da proliferação celular estrogênica.'
    },
    {
      title: 'Dieta Rica em Vegetais e Fitoestrógenos',
      desc: 'Alto consumo de frutas cítricas, vegetais folhosos verdes e fibras alimentares.'
    }
  ];

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
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              Fatores de Risco vs. Fatores de Proteção
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Balanço fisiopatológico da exposição estrogênico-progestacional ao longo do menacme
            </p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
          Alta Recorrência em Provas
        </span>
      </div>

      {/* Grid Dual Comparativo */}
      <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Coluna 1: Fatores de Risco */}
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/5 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-rose-500/20 text-rose-700 dark:text-rose-400 font-heading font-bold text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>FATORES DE RISCO (Aumentam Exposição Estrogênica)</span>
            </div>

            <ul className="space-y-2.5">
              {riskFactors.map((r, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  <div className="leading-snug">
                    <strong className="text-zinc-900 dark:text-zinc-100">{r.title}:</strong>{' '}
                    <span className="text-zinc-600 dark:text-zinc-400">{r.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400/90 italic">
            ▲ Mecanismo central: Hiperestrogenismo absoluto ou relativo estimulando hipertrofia e bcl-2.
          </div>
        </div>

        {/* Coluna 2: Fatores de Proteção */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/5 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-heading font-bold text-xs sm:text-sm">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>FATORES DE PROTEÇÃO (Reduzem Exposição Estrogênica)</span>
            </div>

            <ul className="space-y-2.5">
              {protectiveFactors.map((p, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <div className="leading-snug">
                    <strong className="text-zinc-900 dark:text-zinc-100">{p.title}:</strong>{' '}
                    <span className="text-zinc-600 dark:text-zinc-400">{p.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Pegadinha Clássica do Tabagismo Integrada com Destaque */}
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-300 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pegadinha Clássica de Banca: Tabagismo</span>
            </div>
            <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
              O <strong>Tabagismo</strong> induz o citocromo P450 hepático, acelerando a metabolização do estradiol na forma inativa <em>2-hidroxiestrona</em> (hipoestrogenismo relativo). Portanto, atua como <strong>fator de proteção para miomas</strong> em questões de concurso (embora seja danoso à saúde geral).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
