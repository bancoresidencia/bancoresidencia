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
      {/* Cabeçalho */}
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
              Etiologias, apresentações clínicas de prova e fatores de risco determinantes
            </p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30">
          Diretriz FEBRASGO / OPAS Zero Morte Materna
        </span>
      </div>

      {/* Grid de 4 Colunas dos 4 Ts */}
      <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Coluna 1: TÔNUS */}
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/5 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-2.5">
              <span className="font-heading font-black text-xs sm:text-sm text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4" />
                1. TÔNUS
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-400">
                70% a 80%
              </span>
            </div>

            <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
              ★ Padrão Clínico: Atonia Uterina
            </div>

            <ul className="text-xs space-y-2 text-zinc-700 dark:text-zinc-300">
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span><strong>Exame Físico:</strong> Útero amolecido, hipotônico e palpável acima da cicatriz umbilical.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span><strong>Sobredistensão:</strong> Gemelar, polidrâmnio e macrossomia fetal.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span><strong>Exaustão Miometrial:</strong> Trabalho de parto prolongado, uso excessivo de ocitocina e corioamnionite.</span>
              </li>
            </ul>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-[11px] text-rose-800 dark:text-rose-300 font-medium">
            <strong className="block text-rose-900 dark:text-rose-200 font-bold mb-0.5">
              🚫 Prova:
            </strong>
            Metilergometrina é terminantemente contraindicada em pacientes hipertensas ou com pré-eclâmpsia!
          </div>
        </div>

        {/* Coluna 2: TRAUMA */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/5 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
              <span className="font-heading font-black text-xs sm:text-sm text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Scissors className="w-4 h-4" />
                2. TRAUMA
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400">
                15% a 20%
              </span>
            </div>

            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
              ★ Padrão Clínico: Útero Contraído
            </div>

            <ul className="text-xs space-y-2 text-zinc-700 dark:text-zinc-300">
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong>Lacerações de Trajeto:</strong> Colo uterino, fórnices vaginais e períneo (graus 1 a 4).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong>Hematomas:</strong> Pelve ou vulva expansivos; dor perineal intensa com choque precoce.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong>Inversão Uterina Aguda:</strong> Massa no introito + abdome escavado por tração intempestiva de cordão.</span>
              </li>
            </ul>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
            <strong className="block text-amber-900 dark:text-amber-200 font-bold mb-0.5">
              ⚠️ Prova:
            </strong>
            Útero firme e duro com sangramento ativo NÃO é atonia. A conduta mandatória é revisar o canal com valvas!
          </div>
        </div>

        {/* Coluna 3: TECIDO */}
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/5 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-2.5">
              <span className="font-heading font-black text-xs sm:text-sm text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                3. TECIDO
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-400">
                ~10%
              </span>
            </div>

            <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
              ★ Padrão Clínico: Restos e Acretismo
            </div>

            <ul className="text-xs space-y-2 text-zinc-700 dark:text-zinc-300">
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span><strong>Restos Placentários:</strong> Cotilédone ausente à inspeção da placenta ou sangramento tardio.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span><strong>Retenção de Membranas:</strong> Impede a contração homogênea das ligaduras de Pinard.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span><strong>Espectro do Acretismo (PAS):</strong> Placenta acreta (miométrio), increta (profunda) e percreta (serosa/bexiga).</span>
              </li>
            </ul>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-[11px] text-blue-800 dark:text-blue-300 font-medium">
            <strong className="block text-blue-900 dark:text-blue-200 font-bold mb-0.5">
              ✓ Prova:
            </strong>
            Cesárea anterior + Placenta prévia = altíssima suspeita de acretismo; nunca forçar descolamento manual!
          </div>
        </div>

        {/* Coluna 4: TROMBINA */}
        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 dark:bg-purple-500/5 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-2.5">
              <span className="font-heading font-black text-xs sm:text-sm text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4" />
                4. TROMBINA
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-400">
                ~1%
              </span>
            </div>

            <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
              ★ Padrão Clínico: Coagulopatia
            </div>

            <ul className="text-xs space-y-2 text-zinc-700 dark:text-zinc-300">
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <span><strong>Descolamento de Placenta (DPP):</strong> Liberação maciça de tromboplastina tecidual e CIVD.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <span><strong>Embolia Amniótica & Sepse:</strong> Consumo agudo fulminante de fatores de coagulação e plaquetopenia.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <span><strong>Fibrinogênio Baixo:</strong> Níveis &lt; 200 mg/dL indicam choque iminente; &lt; 100 mg/dL exige crioprecipitado.</span>
              </li>
            </ul>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-[11px] text-purple-800 dark:text-purple-300 font-medium">
            <strong className="block text-purple-900 dark:text-purple-200 font-bold mb-0.5">
              💡 Prova:
            </strong>
            No choque coagulopático, ativar transfusão maciça na proporção balanceada 1:1:1 (CH : PFC : Plaquetas).
          </div>
        </div>
      </div>
    </div>
  );
};
