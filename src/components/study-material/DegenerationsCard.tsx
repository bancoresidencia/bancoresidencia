'use client';

import React from 'react';
import {
  Activity
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const DegenerationsCard: React.FC = () => {
  const { mode, accentConfig } = useTheme();
  const isDark = mode === 'dark';

  const degenerations = [
    {
      name: '1. Degeneração Hialina',
      tag: 'Mais Comum Global (~65%)',
      tagColor: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
      mecanismo: 'Substituição de miócitos por tecido conjuntivo acelular eosinofílico hialino.',
      clinica: 'Assintomático. O útero torna-se mais endurecido e fibroelástico.',
      conduta: 'Nenhuma conduta ou intervenção necessária (apenas acompanhamento de rotina).'
    },
    {
      name: '2. Degeneração Rubra (Necrose Carnosa)',
      tag: '★ Pegadinha da Gestação (2º Trimestre)',
      tagColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
      mecanismo: 'Infarto hemorrágico com necrose asséptica secundária a trombose venosa periférica devido ao rápido crescimento sob influxo hormonal.',
      clinica: 'Dor pélvica aguda súbita, febre baixa (37,8–38,2ºC), leucocitose discreta e descompressão dolorosa localizada.',
      conduta: '★ REGRA DE PROVA: Tratamento estritamente CONSERVADOR/CLÍNICO (analgesia com opioides/dipirona, hidratação venosa e repouso). NUNCA realizar miomectomia na gravidez (risco hemorrágico maciço e perda fetal).'
    },
    {
      name: '3. Degeneração Cística',
      tag: 'Simula Neoplasia Anexial (4%)',
      tagColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
      mecanismo: 'Liquefação tecidual secundária em áreas que sofreram degeneração hialina prévia.',
      clinica: 'Nódulo de consistência amolecida que ao ultrassom apresenta áreas císticas anecoicas.',
      conduta: 'Solicitar Ressonância Magnética para confirmação da origem miometrial e exclusão de neoplasia cística ovariana.'
    },
    {
      name: '4. Degeneração Calcificada',
      tag: 'Típica da Pós-Menopausa',
      tagColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
      mecanismo: 'Calcificação distrófica com precipitação de sais de cálcio e fosfato em miócitos isquêmicos.',
      clinica: 'Achado incidental assintomático ("pedra pélvica" com sombra densa em radiografias simples).',
      conduta: 'Conservadora. Não requer tratamento cirúrgico nem medicamentoso.'
    },
    {
      name: '5. Leiomiossarcoma (Sarcomatosa)',
      tag: 'Raríssima (< 0,5%) • Neoplasia Maligna Primária',
      tagColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30',
      mecanismo: 'Neoplasia mesenquimatosa maligna <em>de novo</em>. Não se origina por "malignização" de mioma benigno prévio.',
      clinica: '★ SUSPEITA DE PROVA: Crescimento uterino rápido na PÓS-MENOPAUSA em mulher SEM Terapia Hormonal, dor pélvica e sangramento atípico.',
      conduta: 'Laparotomia exploradora com cirurgia oncológica de estadiamento.'
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
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              Degenerações dos Leiomiomas Uterinos
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Alterações histológicas secundárias à isquemia tecidual e remodelamento celular
            </p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
          Atenção Máxima: Degeneração Rubra
        </span>
      </div>

      {/* Grid com os 5 Tipos */}
      <div className="p-5 sm:p-6 space-y-4">
        {degenerations.map((d, index) => (
          <div
            key={index}
            className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
              d.name.includes('Rubra')
                ? 'border-rose-500/40 bg-rose-500/5 dark:bg-rose-500/5 shadow-xs'
                : 'border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/80">
              <h4 className="font-heading font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                {d.name}
              </h4>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${d.tagColor}`}>
                {d.tag}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-zinc-500 dark:text-zinc-400 uppercase text-[10px] tracking-wider block">
                  Mecanismo Fisiopatológico
                </span>
                <p className="text-zinc-700 dark:text-zinc-300 leading-snug">
                  {d.mecanismo}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-zinc-500 dark:text-zinc-400 uppercase text-[10px] tracking-wider block">
                  Apresentação Clínica
                </span>
                <p className="text-zinc-700 dark:text-zinc-300 leading-snug">
                  {d.clinica}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-zinc-500 dark:text-zinc-400 uppercase text-[10px] tracking-wider block">
                  Conduta Recomendada & Prova
                </span>
                <p className="text-zinc-700 dark:text-zinc-300 leading-snug font-medium">
                  {d.conduta}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
