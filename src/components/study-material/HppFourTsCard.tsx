'use client';

import React from 'react';
import {
  Layers,
  Scissors,
  ShieldAlert,
  Flame,
  HeartPulse
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const HppFourTsCard: React.FC = () => {
  const { mode, accentConfig } = useTheme();
  const isDark = mode === 'dark';

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
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              Diagnóstico Etiológico: A Regra Mnemônica dos 4 Ts
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Disposição balanceada em matriz 2x2: achados cardinais, fatores de risco e armadilhas de prova
            </p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30">
          Diretriz FEBRASGO / OPAS Zero Morte Materna
        </span>
      </div>

      {/* Matriz 2x2 (2 Colunas e 2 Linhas) Arejada e Sem Sobrecarga Visual */}
      <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
        {/* Card 1: TÔNUS */}
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/5 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-2.5 min-h-[46px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <Flame className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span className="font-heading font-black text-sm text-rose-700 dark:text-rose-400 whitespace-nowrap">
                  1. TÔNUS
                </span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-400 shrink-0">
                70% a 80% das causas
              </span>
            </div>

            <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
              ★ Padrão Clínico: Atonia Uterina
            </div>

            <ul className="text-xs space-y-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span><strong>Exame Cardinal:</strong> Útero amolecido, hipotônico e palpável acima da cicatriz umbilical.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span><strong>Fatores Críticos:</strong> Sobredistensão (gemelar, macrossomia), TP prolongado e sulfato de magnésio.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span><strong>Conduta Inicial:</strong> Massagem bimanual (Hamilton) + Ocitocina IV e Ácido Tranexâmico imediato.</span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-900 dark:text-rose-300 font-medium leading-snug">
            <strong className="block font-bold text-rose-950 dark:text-rose-200 mb-0.5">
              🚫 Prova:
            </strong>
            Metilergometrina é terminantemente contraindicada em pacientes hipertensas, coronariopatas ou com pré-eclâmpsia!
          </div>
        </div>

        {/* Card 2: TRAUMA */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/5 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5 min-h-[46px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <Scissors className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span className="font-heading font-black text-sm text-amber-700 dark:text-amber-400 whitespace-nowrap">
                  2. TRAUMA
                </span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 shrink-0">
                15% a 20% das causas
              </span>
            </div>

            <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
              ★ Padrão Clínico: Útero Firme e Contraído
            </div>

            <ul className="text-xs space-y-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong>Exame Cardinal:</strong> Útero duro ("globo de Pinard") no nível umbilical com perda vermelho-viva contínua.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong>Etiologias Frequentes:</strong> Parto instrumentado (fórceps/vácuo), parto precipitado e hematomas de trajeto.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong>Emergência Extrema:</strong> Inversão uterina aguda (massa no introito + choque neurogênico desproporcional).</span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-900 dark:text-amber-300 font-medium leading-snug">
            <strong className="block font-bold text-amber-950 dark:text-amber-200 mb-0.5">
              ⚠️ Prova:
            </strong>
            Útero contraído com sangramento ativo = revisão sob valvas de peso. Na inversão, nunca dequite a placenta antes da redução manual!
          </div>
        </div>

        {/* Card 3: TECIDO */}
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/5 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-2.5 min-h-[46px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <Layers className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="font-heading font-black text-sm text-blue-700 dark:text-blue-400 whitespace-nowrap">
                  3. TECIDO
                </span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-400 shrink-0">
                ~10% das causas
              </span>
            </div>

            <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
              ★ Padrão Clínico: Restos e Acretismo (PAS)
            </div>

            <ul className="text-xs space-y-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span><strong>Exame Cardinal:</strong> Placenta deitada incompleta, cotilédone ausente ou retenção de membranas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span><strong>Fator de Risco Máximo:</strong> Cesárea anterior associada a placenta prévia (suspeita imediata de acretismo).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span><strong>Conduta Dirigida:</strong> Curagem/curetagem sob anestesia. Se acretismo confirmado, laparotomia imediata.</span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 text-xs text-blue-900 dark:text-blue-300 font-medium leading-snug">
            <strong className="block font-bold text-blue-950 dark:text-blue-200 mb-0.5">
              ✓ Prova:
            </strong>
            Diante de suspeita de acretismo placentário, nunca force a tração ou curagem pelo risco de hemorragia cataclísmica!
          </div>
        </div>

        {/* Card 4: TROMBINA */}
        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 dark:bg-purple-500/5 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-2.5 min-h-[46px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <HeartPulse className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />
                <span className="font-heading font-black text-sm text-purple-700 dark:text-purple-400 whitespace-nowrap">
                  4. TROMBINA
                </span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-400 shrink-0">
                ~1% das causas
              </span>
            </div>

            <div className="text-xs font-bold text-purple-600 dark:text-purple-400">
              ★ Padrão Clínico: Coagulopatias
            </div>

            <ul className="text-xs space-y-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <span><strong>Exame Cardinal:</strong> Sangramento difuso em sítios de punção, incisão e mucosas sem coágulos formados.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <span><strong>Etiologias Primárias:</strong> Descolamento Prematuro de Placenta (DPP), embolia amniótica e sepse grave.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <span><strong>Gatilho Laboratorial:</strong> Fibrinogênio &lt; 200 mg/dL (grave); &lt; 100 mg/dL exige Crioprecipitado urgente.</span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/25 text-xs text-purple-900 dark:text-purple-300 font-medium leading-snug">
            <strong className="block font-bold text-purple-950 dark:text-purple-200 mb-0.5">
              ⚠️ Prova:
            </strong>
            Ativar precocemente o protocolo de transfusão maciça na proporção 1:1:1 para evitar coagulopatia dilucional e hipotermia!
          </div>
        </div>
      </div>
    </div>
  );
};
