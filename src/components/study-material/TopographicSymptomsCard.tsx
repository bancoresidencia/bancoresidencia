'use client';

import React from 'react';
import {
  Activity,
  Droplet,
  Layers,
  Compass
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const TopographicSymptomsCard: React.FC = () => {
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
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              Quadro Clínico & Correlação Topográfica
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              A sintomatologia é ditada pela localização anatômica em relação às camadas uterinas
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          50% a 70% são Assintomáticos
        </span>
      </div>

      {/* Grid de 3 Colunas Topográficas */}
      <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Coluna 1: Submucosos */}
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/5 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-2.5">
              <span className="font-heading font-black text-xs sm:text-sm text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <Droplet className="w-4 h-4" />
                1. SUBMUCOSOS
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-400">
                FIGO 0, 1, 2
              </span>
            </div>

            <div className="text-[11px] font-bold text-rose-900 dark:text-rose-300">
              ★ Padrão Clínico: Sangramento & Infertilidade
            </div>

            <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                <span><strong>Sangramento Uterino Anormal (SUA):</strong> Menorragia volumosa e prolongada.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                <span><strong>Anemia Ferropriva Grave:</strong> Refratária a suplementação oral isolada.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                <span><strong>Infertilidade:</strong> Distorção endometrial e falha de implantação/nidação.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                <span><strong>Abortamento Precoce:</strong> Risco aumentado de perdas recorrentes.</span>
              </li>
            </ul>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-800 dark:text-rose-300 text-[11px] font-semibold">
            🚫 Prova: Contraindicação formal a DIU de Levonorgestrel.
          </div>
        </div>

        {/* Coluna 2: Intramurais */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/5 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
              <span className="font-heading font-black text-xs sm:text-sm text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                2. INTRAMURAIS
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400">
                FIGO 3, 4
              </span>
            </div>

            <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300">
              ★ Padrão Clínico: Dismenorreia & Volume
            </div>

            <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <span><strong>Hipermenorreia:</strong> Aumento do fluxo pela vasodilatação miometrial.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <span><strong>Dismenorreia Secundária:</strong> Cólica por contratilidade uterina assimétrica.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <span><strong>Sensação de Peso Pélvico:</strong> Sensação de repleção por útero aumentado.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <span><strong>Tipo mais comum:</strong> Representa mais de 60% de todos os miomas.</span>
              </li>
            </ul>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 text-[11px] font-semibold">
            ✓ Prova: Cavidade preservada permite tratamento clínico com DIU-Mirena.
          </div>
        </div>

        {/* Coluna 3: Subserosos */}
        <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 dark:bg-sky-500/5 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-sky-500/20 pb-2.5">
              <span className="font-heading font-black text-xs sm:text-sm text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                3. SUBSEROSOS
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-700 dark:text-sky-400">
                FIGO 5, 6, 7
              </span>
            </div>

            <div className="text-[11px] font-bold text-sky-900 dark:text-sky-300">
              ★ Padrão Clínico: Compressão & Torção
            </div>

            <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
                <span><strong>Compressão Vesical:</strong> Polaciúria, urgência e noctúria (parede anterior).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
                <span><strong>Compressão Retal:</strong> Constipação crônica e tenesmo (parede posterior).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
                <span><strong>Compressão Venosa:</strong> Edema assimétrico de membros inferiores.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
                <span><strong>Torção de Pedículo (FIGO 7):</strong> Emergência de abdome agudo ginecológico.</span>
              </li>
            </ul>
          </div>

          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-800 dark:text-sky-300 text-[11px] font-semibold">
            ⚠️ Prova: NÃO sangra. Se houver SUA, investigar endométrio.
          </div>
        </div>
      </div>
    </div>
  );
};
