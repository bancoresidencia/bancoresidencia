'use client';

import React from 'react';
import { GraduationCap } from 'lucide-react';
import { TOP_FEATURED_BANCAS, FeaturedBancaItem } from './landingData';

export interface LandingInstitutionsStripProps {
  onSelectBanca: (banca: FeaturedBancaItem) => void;
}

export const LandingInstitutionsStrip: React.FC<LandingInstitutionsStripProps> = ({
  onSelectBanca
}) => {
  return (
    <section
      aria-label="Instituições e Bancas Examinadoras Oficiais"
      className="w-full bg-white/70 dark:bg-zinc-950/70 border-y border-zinc-200/80 dark:border-zinc-800/80 py-5 transition-colors duration-200 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Provas oficiais na íntegra • Explore as bancas auditadas e teste questões reais abaixo:
            </span>
          </div>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tabular-nums">
            +120 instituições examinadoras auditadas
          </span>
        </div>

        <div className="relative w-full overflow-hidden py-1">
          <div className="animate-marquee flex items-center gap-3">
            {[...TOP_FEATURED_BANCAS, ...TOP_FEATURED_BANCAS].map((banca, idx) => {
              const isDuplicate = idx >= TOP_FEATURED_BANCAS.length;
              return (
                <button
                  key={`strip-${banca.id}-${idx}`}
                  type="button"
                  tabIndex={isDuplicate ? -1 : 0}
                  aria-hidden={isDuplicate ? true : undefined}
                  onClick={() => onSelectBanca(banca)}
                  title={`Testar questão real: ${banca.name}`}
                  className="h-11 pl-2.5 pr-4 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200/90 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:-translate-y-0.5 shadow-2xs transition-all duration-150 cursor-pointer inline-flex items-center gap-3 shrink-0 whitespace-nowrap"
                >
                  <span className="w-6 h-6 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                    {banca.logoSlug ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/images/institutions/${banca.logoSlug}.webp`}
                        alt=""
                        width={20}
                        height={20}
                        loading="lazy"
                        decoding="async"
                        className="w-[20px] h-[20px] object-contain"
                      />
                    ) : (
                      <GraduationCap className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
                    )}
                  </span>
                  <span className="text-xs font-bold tracking-tight text-zinc-800 dark:text-zinc-200">
                    {banca.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingInstitutionsStrip;
