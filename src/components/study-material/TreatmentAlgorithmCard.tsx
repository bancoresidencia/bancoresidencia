'use client';

import React from 'react';
import {
  Stethoscope,
  Pill,
  AlertTriangle
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const TreatmentAlgorithmCard: React.FC = () => {
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
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              Algoritmo Decisório: Tratamento Clínico vs. Cirúrgico
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Fluxo terapêutico baseado em presença de sintomas, topografia e desejo reprodutivo futuro
            </p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
          Diretriz FEBRASGO / ACOG 228
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Bloco 1: As 3 Decisões Iniciais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cenário A: Assintomático */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/30 flex flex-col justify-between space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Cenário 1 • Assintomática
            </span>
            <h4 className="font-heading font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
              Conduta Expectante
            </h4>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Exame clínico e ultrassonografia anual. Não se medica nem opera mioma sem sintomas, independente do diâmetro.
            </p>
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              ★ Regra de ouro da banca
            </div>
          </div>

          {/* Cenário B: Desejo Reprodutivo */}
          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/5 flex flex-col justify-between space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Cenário 2 • Desejo de Gestação
            </span>
            <h4 className="font-heading font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
              Cirurgia Conservadora
            </h4>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <strong>Submucoso:</strong> Histeroscopia (STEPW ≤ 4).<br />
              <strong>Intramural/Subseroso:</strong> Miomectomia laparotômica ou laparoscópica.
            </p>
            <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
              ★ Preservação miometrial
            </div>
          </div>

          {/* Cenário C: Prole Concluída */}
          <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 dark:bg-purple-500/5 flex flex-col justify-between space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Cenário 3 • Prole Concluída
            </span>
            <h4 className="font-heading font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
              Tratamento Definitivo
            </h4>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <strong>Histerectomia Total:</strong> Padrão-ouro resolutivo para refratariedade ou útero de grande volume.
            </p>
            <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
              ★ Cura sintomática definitiva
            </div>
          </div>
        </div>

        {/* Bloco 2: Farmacoterapia Estratégica Comparativa */}
        <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-emerald-500" />
            <h4 className="font-heading font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
              Farmacoterapia: Controle de Fluxo vs. Redução de Volume
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Opções Não-Hormonais & Hormonais de Fluxo */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                1. Controle de Sangramento (Sem Redução de Volume)
              </span>
              <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400">
                <li>• <strong>Ácido Tranexâmico:</strong> Reduz 40–50% do fluxo menstrual. 1ª linha não hormonal para mulheres que tentam engravidar no curto prazo.</li>
                <li>• <strong>AINEs (Ácido Mefenâmico):</strong> Inibição da COX e redução de 20–30% do fluxo. Excelente para dismenorreia secundária.</li>
                <li>• <strong>DIU de Levonorgestrel:</strong> Reduz até 90% do fluxo em FIGO 3 a 6. <em>Proibido em FIGO 0, 1 e 2</em> por distorção de cavidade e expulsão.</li>
              </ul>
            </div>

            {/* Redução de Volume (Análogos GnRH) */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                2. Redução de Volume Tumoral (Pré-Operatório)
              </span>
              <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400">
                <li>• <strong>Agonistas de GnRH (Leuprorrelina / Gosserrelina):</strong> Bloqueio hipofisário. Reduz volume em 30–50% em 3 meses e recupera hematócrito.</li>
                <li>• <strong>Duração máxima:</strong> Até 6 meses pelo risco de perda de massa óssea e climatério artificial.</li>
                <li>• <strong>Antagonistas de GnRH (Relugolix + Add-back):</strong> Bloqueio imediato sem <em>flare-up</em> inicial, associado a doses baixas de estradiol.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bloco 3: Alerta de Cesariana Eletiva */}
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-300 text-xs flex gap-3 items-start">
          <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-bold">Ponto Crítico Cirúrgico em Obstetrícia Futura:</strong>
            <p className="leading-relaxed text-[11px]">
              Se durante a miomectomia (laparoscópica ou aberta) houver <strong>abertura da cavidade endometrial</strong> ou ressecção intramural profunda com fragilidade cicatricial, a via de parto em gestações futuras deve ser <strong>obrigatoriamente Cesariana eletiva</strong> pelo risco de ruptura uterina catastrófica durante o trabalho de parto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
