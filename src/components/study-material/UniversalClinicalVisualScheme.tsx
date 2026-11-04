'use client';

import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Scissors,
  Layers,
  HeartPulse,
  Clock,
  Pill,
  Stethoscope,
  Info,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export interface VisualSchemeProps {
  type: 'bipolar' | 'pipeline' | 'scenarios' | 'matrix-4q' | 'timeline' | 'step-up' | string;
  title?: string;
  subtitle?: string;
  badge?: string;
  data: any;
}

export const UniversalClinicalVisualScheme: React.FC<VisualSchemeProps> = ({
  type,
  title,
  subtitle,
  badge,
  data
}) => {
  const { mode, accentConfig } = useTheme();
  const isDark = mode === 'dark';

  // Desempacotador defensivo: tolera tanto estrutura plana quanto aninhada em `data: { ... }`
  const rawData = data?.data && typeof data.data === 'object' && !Array.isArray(data.data)
    ? { ...data.data, ...data }
    : (data || {});

  const schemeType = (type || rawData.type || 'bipolar').toLowerCase();
  const schemeBadge = badge || rawData.badge;
  const schemeTitle = title || rawData.title;
  const schemeSubtitle = subtitle || rawData.subtitle;

  return (
    <div
      className={`my-8 rounded-3xl border transition-all overflow-hidden ${
        isDark
          ? 'bg-[#121215] border-zinc-800 shadow-md'
          : 'bg-white border-zinc-200/90 shadow-xs'
      }`}
    >
      {/* Cabeçalho Canônico do Esquema */}
      {schemeTitle ? (
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/60 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              {schemeType === 'bipolar' ? (
                <Flame className="w-4 h-4" />
              ) : schemeType === 'pipeline' ? (
                <ArrowRight className="w-4 h-4" />
              ) : schemeType === 'scenarios' ? (
                <Stethoscope className="w-4 h-4" />
              ) : schemeType === 'matrix-4q' ? (
                <ShieldAlert className="w-4 h-4" />
              ) : schemeType === 'step-up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : schemeType === 'timeline' ? (
                <Clock className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                {schemeTitle}
              </h3>
              {schemeSubtitle && (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {schemeSubtitle}
                </p>
              )}
            </div>
          </div>

          {schemeBadge && (
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 shrink-0">
              {schemeBadge}
            </span>
          )}
        </div>
      ) : schemeBadge ? (
        <div className="px-5 pt-4 pb-1 flex justify-end">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 shrink-0">
            {schemeBadge}
          </span>
        </div>
      ) : null}

      {/* Conteúdo Específico por Tipo */}
      <div className="p-5 sm:p-6">
        {/* MODELO 1: BIPOLAR (2 COLUNAS - RISCO VS PROTEÇÃO / INDICAÇÕES VS CONTRAINDICAÇÕES) */}
        {schemeType === 'bipolar' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {/* Coluna Esquerda */}
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/5 p-4 sm:p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-rose-500/20 pb-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span className="font-heading font-black text-xs sm:text-sm text-rose-700 dark:text-rose-400">
                    {rawData.leftColumn?.title || 'FATORES DE RISCO / ALERTA'}
                  </span>
                </div>
                <ul className="text-xs space-y-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {rawData.leftColumn?.items?.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {rawData.leftColumn?.alert && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-900 dark:text-rose-300 font-medium leading-snug">
                  <strong className="block font-bold text-rose-950 dark:text-rose-200 mb-0.5">
                    ⚠️ Atenção de Prova:
                  </strong>
                  {rawData.leftColumn.alert}
                </div>
              )}
            </div>

            {/* Coluna Direita */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/5 p-4 sm:p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-heading font-black text-xs sm:text-sm text-emerald-700 dark:text-emerald-400">
                    {rawData.rightColumn?.title || 'FATORES DE PROTEÇÃO / PROFILAXIA'}
                  </span>
                </div>
                <ul className="text-xs space-y-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {rawData.rightColumn?.items?.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {rawData.rightColumn?.alert && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 font-medium leading-snug">
                  <strong className="block font-bold text-amber-950 dark:text-amber-200 mb-0.5">
                    🎯 Pegadinha Clássica de Banca:
                  </strong>
                  {rawData.rightColumn.alert}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODELO 2: PIPELINE DECISÓRIO EM ETAPAS (INVESTIGAÇÃO EM CASCATA) */}
        {schemeType === 'pipeline' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {(rawData.steps || rawData.data?.steps || [])?.map((step: any, idx: number) => (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-4 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-800 pb-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold bg-rose-500 shadow-2xs">
                      {step.step || idx + 1}
                    </span>
                    {step.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        {step.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="font-heading font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                    {step.title}
                  </h4>
                  {step.desc && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                      {step.desc}
                    </p>
                  )}
                  {step.description && !step.desc && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                      {step.description}
                    </p>
                  )}
                  {Array.isArray(step.items) && step.items.length > 0 && (
                    <ul className="text-xs space-y-1.5 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {step.items.map((it: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {step.alert && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-300 font-medium leading-snug">
                    <strong className="block font-bold text-amber-950 dark:text-amber-200 mb-0.5">
                      Atenção de Prova:
                    </strong>
                    {step.alert}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* MODELO 3: ESCADA TERAPÊUTICA (STEP-UP PROGRESSIVO) */}
        {schemeType === 'step-up' && (
          <div className="space-y-4">
            {(rawData.steps || rawData.data?.steps || [])?.map((step: any, idx: number) => {
              const level = step.level || idx + 1;
              const isFirst = idx === 0;
              const isLast = idx === (rawData.steps?.length || 1) - 1;

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 p-4 sm:p-5 relative transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-zinc-200/60 dark:border-zinc-800 pb-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="px-2.5 py-1 rounded-xl text-white text-xs font-heading font-black shadow-2xs flex items-center gap-1.5"
                        style={{
                          backgroundColor:
                            level === 1
                              ? '#3B82F6'
                              : level === 2
                              ? '#F59E0B'
                              : '#EF4444'
                        }}
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        DEGRAU {level}
                      </span>
                      <h4 className="font-heading font-black text-sm text-zinc-900 dark:text-zinc-100">
                        {step.title}
                      </h4>
                    </div>
                    {step.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        {step.badge}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                    {/* Critérios de Entrada / Indicação */}
                    {step.criteria && (
                      <div className="p-3 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                          📋 Critérios de Indicação / Diagnóstico
                        </span>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          {step.criteria}
                        </p>
                      </div>
                    )}

                    {/* Conduta Terapêutica / Padrão-Ouro */}
                    {step.therapy && (
                      <div className="p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/25 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Conduta Padrão-Ouro
                        </span>
                        <p className="text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                          {step.therapy}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Critério de Falha & Próximo Passo */}
                  {step.failCriteria && (
                    <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-950 dark:text-rose-200 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="leading-snug">
                        <strong className="font-bold mr-1">Gatilho de Falha / Escalonamento:</strong>
                        <span>{step.failCriteria}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* MODELO 4: CENÁRIOS CLÍNICOS & CONDUTAS */}
        {schemeType === 'scenarios' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
              {(rawData.scenarios || rawData.data?.scenarios || [])?.map((sc: any, idx: number) => {
                const badgeColor =
                  idx === 0
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                    : idx === 1
                    ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30'
                    : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30';

                return (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 flex flex-col justify-between space-y-3.5"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-800 pb-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          {sc.label || `CENÁRIO ${idx + 1}`}
                        </span>
                        {sc.badge && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}>
                            {sc.badge}
                          </span>
                        )}
                      </div>

                      <h4 className="font-heading font-black text-sm text-zinc-900 dark:text-zinc-100">
                        {sc.title}
                      </h4>

                      {(sc.desc || sc.description) && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                          {sc.desc || sc.description}
                        </p>
                      )}

                      {sc.conduct && (
                        <div className="p-3 rounded-xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Conduta Recomendada
                          </span>
                          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-snug">
                            {sc.conduct}
                          </p>
                        </div>
                      )}
                    </div>

                    {sc.alert && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-300 font-medium leading-snug">
                        <strong className="block font-bold text-amber-950 dark:text-amber-200 mb-0.5">
                          ⚡ Alerta de Prova:
                        </strong>
                        {sc.alert}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bloco de Farmacoterapia Comparada (Opcional) */}
            {rawData.pharmacotherapy && (
              <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/40 dark:bg-zinc-900/20 space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-200/60 dark:border-zinc-800 pb-2">
                  <Pill className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-heading font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                    {rawData.pharmacotherapy.title || 'Manejo Farmacológico Comparado'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rawData.pharmacotherapy.columns?.map((col: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <h5 className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
                        {col.title}
                      </h5>
                      <ul className="text-xs space-y-1.5 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {col.items?.map((it: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alerta de Rodapé */}
            {rawData.footerAlert && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-950 dark:text-rose-200 font-medium">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-0.5">
                    {rawData.footerAlert.title || 'Ponto Crítico em Prova:'}
                  </strong>
                  {rawData.footerAlert.text}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODELO 5: MATRIZ 4 QUADRANTES (2x2) */}
        {schemeType === 'matrix-4q' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
            {(rawData.quadrants || rawData.data?.quadrants || [])?.map((quad: any, idx: number) => {
              const colorSchemes = [
                { border: 'border-rose-500/30', bg: 'bg-rose-500/5', text: 'text-rose-700 dark:text-rose-400', badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-400', dot: 'bg-rose-500', alert: 'bg-rose-500/10 border-rose-500/25 text-rose-900 dark:text-rose-300' },
                { border: 'border-amber-500/30', bg: 'bg-amber-500/5', text: 'text-amber-700 dark:text-amber-400', badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', alert: 'bg-amber-500/10 border-amber-500/25 text-amber-900 dark:text-amber-300' },
                { border: 'border-blue-500/30', bg: 'bg-blue-500/5', text: 'text-blue-700 dark:text-blue-400', badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-400', dot: 'bg-blue-500', alert: 'bg-blue-500/10 border-blue-500/25 text-blue-900 dark:text-blue-300' },
                { border: 'border-purple-500/30', bg: 'bg-purple-500/5', text: 'text-purple-700 dark:text-purple-400', badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-400', dot: 'bg-purple-500', alert: 'bg-purple-500/10 border-purple-500/25 text-purple-900 dark:text-purple-300' }
              ];
              const scheme = colorSchemes[idx % colorSchemes.length];

              return (
                <div
                  key={idx}
                  className={`rounded-2xl border ${scheme.border} ${scheme.bg} p-4 sm:p-5 flex flex-col justify-between space-y-4`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-200/40 dark:border-zinc-800 pb-2">
                      <span className={`font-heading font-black text-sm ${scheme.text}`}>
                        {quad.title}
                      </span>
                      {quad.percentage && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${scheme.badge}`}>
                          {quad.percentage}
                        </span>
                      )}
                    </div>
                    {quad.subtitle && (
                      <div className={`text-xs font-bold ${scheme.text}`}>
                        ★ {quad.subtitle}
                      </div>
                    )}
                    <ul className="text-xs space-y-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {quad.items?.map((it: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${scheme.dot} mt-1.5 shrink-0`} />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {quad.alert && (
                    <div className={`p-3 rounded-xl border ${scheme.alert} text-xs font-medium leading-snug`}>
                      <strong className="block font-bold mb-0.5">
                        🚫 Prova:
                      </strong>
                      {quad.alert}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* MODELO 6: LINHA DO TEMPO / CRONOLOGIA CLÍNICA */}
        {schemeType === 'timeline' && (
          <div className="space-y-4">
            {(rawData.events || rawData.steps || []).map((ev: any, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30"
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xs"
                  style={{ backgroundColor: accentConfig.primaryHex }}
                >
                  {ev.time || `${idx + 1}º`}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-heading font-black text-sm text-zinc-900 dark:text-zinc-100">
                      {ev.title}
                    </h4>
                    {ev.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        {ev.badge}
                      </span>
                    )}
                  </div>
                  {(ev.desc || ev.description) && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {ev.desc || ev.description}
                    </p>
                  )}
                  {ev.conduct && (
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-1">
                      ➔ {ev.conduct}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FALLBACK DEFENSIVO (CASO TIPO DESCONHECIDO MAS HAJA DADOS ESTRUTURADOS) */}
        {!['bipolar', 'pipeline', 'step-up', 'scenarios', 'matrix-4q', 'timeline'].includes(schemeType) && (
          <div className="p-4 rounded-2xl bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
            {rawData.description || rawData.text || rawData.desc || (
              <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap font-mono">
                {JSON.stringify(rawData, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
