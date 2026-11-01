'use client';

import React from 'react';
import {
  Scan
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const DiagnosticPipelineCard: React.FC = () => {
  const { mode, accentConfig } = useTheme();
  const isDark = mode === 'dark';

  const steps = [
    {
      step: '1',
      title: 'Ultrassonografia Transvaginal (USG TV)',
      badge: '★ Exame Inicial de Escolha',
      badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      findings: [
        'Nódulo sólido, bem delimitado, hipoecoico em relação ao miométrio.',
        'Sombra acústica posterior em faixas paralelas características.',
        'Doppler: anel vascular periférico contínuo (vasos da pseudocápsula).'
      ],
      caution: 'Em úteros muito volumosos (> 300–400 cm³) perde sensibilidade, exigindo complementação por via pélvica/suprapúbica ou RNM.'
    },
    {
      step: '2',
      title: 'Histerossonografia / Histeroscopia',
      badge: '★ Exame para Cavidade (FIGO 0, 1, 2)',
      badgeColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
      findings: [
        'Indicada formalmente quando houver suspeita de componente submucoso.',
        'Histerossonografia (infusão de SF 0,9%): mede a margem livre miometrial até a serosa com precisão milimétrica.',
        'Histeroscopia diagnóstica: visualização direta da cavidade endometrial e cálculo do escore STEPW de Lasmar.'
      ],
      caution: 'Essencial antes de indicar miomectomia histeroscópica para evitar perfuração em tempo único.'
    },
    {
      step: '3',
      title: 'Ressonância Magnética de Pelve (RNM)',
      badge: '★ Padrão-Ouro em Resolução Espacial',
      badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30',
      findings: [
        'Baixo sinal homogêneo em T1 e T2 (densa celularidade muscular e colágeno).',
        'Planejamento pré-operatório mandatório em pacientes nuligestas com miomas múltiplos.',
        'Diagnóstico diferencial crucial com Adenomiose focal (zona juncional ≥ 12 mm).',
        'Avaliação de suspeita de Leiomiossarcoma (necrose central, hipervascularização desorganizada, sinal alto em DWI).'
      ],
      caution: 'Não é exame de rotina na atenção primária; reservar para planejamento cirúrgico e dúvidas diagnósticas complexas.'
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
            <Scan className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              Pipeline de Investigação Diagnóstica Armada
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Sequência lógica estrita cobrada em enunciados de concursos de Residência Médica
            </p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
          3 Etapas Decisórias
        </span>
      </div>

      {/* Grid de 3 Etapas */}
      <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((st) => (
          <div
            key={st.step}
            className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-zinc-200/70 dark:border-zinc-800 pb-2.5">
                <span
                  className="w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs text-white shrink-0 shadow-2xs"
                  style={{ backgroundColor: accentConfig.primaryHex }}
                >
                  {st.step}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${st.badgeColor}`}>
                  {st.badge}
                </span>
              </div>

              <h4 className="font-heading font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                {st.title}
              </h4>

              <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                {st.findings.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 shrink-0 mt-1.5" />
                    <span className="leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-900 dark:text-amber-300 text-[11px] leading-relaxed border border-amber-500/20">
              <strong>Atenção de Prova:</strong> {st.caution}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
