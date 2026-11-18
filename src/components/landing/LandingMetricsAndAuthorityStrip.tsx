'use client';

import React from 'react';
import { BookCheck, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import {
  LANDING_KPI_METRICS,
  SCIENTIFIC_AUTHORITIES,
  LandingKpiMetric
} from './landingData';
import { useScrollReveal, useAnimatedCounter } from './useScrollReveal';

const KpiCounterCard: React.FC<{
  item: LandingKpiMetric;
  isVisible: boolean;
  delayMs: number;
}> = ({ item, isVisible, delayMs }) => {
  const { accent, accentConfig } = useTheme();
  const count = useAnimatedCounter(item.targetValue, isVisible, 1250);
  const isMonochrome = accent === 'neutral';

  return (
    <div
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`reveal-up ${
        isVisible ? 'is-visible' : ''
      } rounded-2xl p-5 sm:p-6 bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800 shadow-2xs flex flex-col justify-between`}
    >
      <div className="flex items-baseline gap-0.5">
        {item.prefix && (
          <span
            className="text-3xl sm:text-4xl font-black tracking-tight tabular-nums"
            style={{ color: isMonochrome ? undefined : accentConfig.primaryHex }}
          >
            {item.prefix}
          </span>
        )}
        <span className="text-3xl sm:text-4xl md:text-[42px] font-black tracking-[-0.035em] text-zinc-950 dark:text-white tabular-nums leading-none">
          {count}
        </span>
        <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-200 ml-0.5">
          {item.suffix}
        </span>
      </div>

      <div className="mt-3">
        <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
          {item.label}
        </div>
        <div className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
          {item.sublabel}
        </div>
      </div>
    </div>
  );
};

export const LandingMetricsAndAuthorityStrip: React.FC = () => {
  const { accentConfig } = useTheme();
  const { ref: kpiRef, isVisible: kpiVisible } = useScrollReveal<HTMLDivElement>(0.15);
  const { ref: authRef, isVisible: authVisible } = useScrollReveal<HTMLDivElement>(0.12);

  return (
    <section className="py-14 sm:py-18 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-[#0b0b0e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-14">
        {/* 1. Contadores Numéricos Vivos no Scroll */}
        <div ref={kpiRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {LANDING_KPI_METRICS.map((metric, idx) => (
            <KpiCounterCard
              key={metric.id}
              item={metric}
              isVisible={kpiVisible}
              delayMs={idx * 80}
            />
          ))}
        </div>

        {/* 2. Bloco de Autoridade Científica Real (Diretrizes e Sociedades Médicas) */}
        <div
          ref={authRef}
          className={`reveal-up ${
            authVisible ? 'is-visible' : ''
          } rounded-2xl p-6 sm:p-8 bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 shadow-xs`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Rigor Científico & Medicina Baseada em Evidências</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                Gabaritos, resumos e flashcards ancorados nas diretrizes oficiais cobradas pelas bancas
              </h2>
            </div>

            <div
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 self-start md:self-center"
              style={{
                backgroundColor: accentConfig.primaryHex,
                color: accentConfig.primaryContrastHex
              }}
            >
              <BookCheck className="w-4 h-4 shrink-0" />
              <span>Atualização contínua 2025/2026</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-6">
            {SCIENTIFIC_AUTHORITIES.map((soc) => (
              <div
                key={soc.acronym}
                className="p-3.5 rounded-xl bg-zinc-50/90 dark:bg-zinc-900/70 border border-zinc-200/70 dark:border-zinc-800/90 flex items-start gap-3"
              >
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shrink-0 tabular-nums">
                  {soc.acronym}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {soc.fullName}
                  </div>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug mt-0.5">
                    {soc.scope}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
