'use client';

import React from 'react';
import { Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { LANDING_PRICING_PLANS, INCLUDED_PLATFORM_FEATURES } from './landingData';
import { useScrollReveal } from './useScrollReveal';

interface LandingPricingSectionProps {
  onSelectPlan: (planId: string, mode?: 'register' | 'login') => void;
}

export const LandingPricingSection: React.FC<LandingPricingSectionProps> = ({ onSelectPlan }) => {
  const { accentConfig } = useTheme();
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>(0.08);

  return (
    <section
      id="planos"
      className="scroll-mt-20 py-18 sm:py-24 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/60 dark:bg-[#0b0b0e]"
    >
      <div ref={ref} className={`max-w-7xl mx-auto px-4 sm:px-6 reveal-up ${isVisible ? 'is-visible' : ''}`}>
        {/* Cabeçalho dos Planos */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Condições Especiais de Lançamento</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-[-0.035em] text-zinc-950 dark:text-white leading-tight">
            Planos transparentes, acesso irrestrito.
          </h2>

          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Todos os planos liberam 100% das ferramentas da plataforma desde o primeiro minuto.
          </p>
        </div>

        {/* Barra de Recursos Inclusos em Todos os Planos */}
        <div className="mb-10 max-w-5xl mx-auto p-4 rounded-2xl bg-white/90 dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/90">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-[13px]">
            <span className="font-extrabold text-zinc-950 dark:text-white">
              Incluso em qualquer plano:
            </span>
            {INCLUDED_PLATFORM_FEATURES.map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-medium"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{feature}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Grid dos 4 Planos com Contraste WCAG AA e Harmonia Total ao Tema */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch pt-3">
          {LANDING_PRICING_PLANS.map((plan) => {
            const isPrimary = plan.tier === 'primary_highlight';
            const isSecondary = plan.tier === 'secondary_highlight';

            return (
              <div key={plan.id} className="relative flex flex-col">
                {isPrimary && (
                  <div
                    aria-hidden="true"
                    className="absolute -inset-1.5 rounded-3xl opacity-35 dark:opacity-45 blur-xl pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 25%, ${accentConfig.primaryHex} 0%, transparent 72%)`
                    }}
                  />
                )}

                <div
                  className={`relative rounded-2xl p-6 flex flex-col justify-between flex-1 transition-transform duration-200 hover:-translate-y-1 ${
                    isPrimary
                      ? 'bg-white dark:bg-[#141418] border-2 shadow-2xl lg:-translate-y-2 z-10'
                      : isSecondary
                        ? 'bg-white dark:bg-[#131317] border-2 border-zinc-400/80 dark:border-zinc-600 shadow-lg z-10'
                        : 'bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 shadow-xs'
                  }`}
                  style={isPrimary ? { borderColor: accentConfig.primaryHex } : undefined}
                >
                  {/* Selo Superior com Contraste Adaptativo (Corrigindo o bug do Monocromático) */}
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-extrabold uppercase tracking-wide px-3 py-1 rounded-full shadow-sm ${
                          isPrimary
                            ? ''
                            : 'bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-950'
                        }`}
                        style={
                          isPrimary
                            ? {
                                backgroundColor: accentConfig.primaryHex,
                                color: accentConfig.primaryContrastHex
                              }
                            : undefined
                        }
                      >
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="pt-1">
                      <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                        {plan.audienceTag}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white mt-0.5">
                        {plan.name}
                      </h3>
                    </div>

                    {/* Bloco de Preço em Inter Tabular */}
                    <div className="mt-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">R$</span>
                        <span className="text-4xl sm:text-[44px] font-black tracking-[-0.04em] text-zinc-950 dark:text-white tabular-nums leading-none">
                          {plan.pricePerMonth}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                          {plan.periodLabel}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2.5 leading-relaxed min-h-[38px]">
                        {plan.billingText}
                      </p>

                      {/* Pílula de Economia */}
                      <div className="mt-3">
                        <div
                          className={`py-2 px-3 rounded-xl text-xs font-extrabold text-center tracking-tight ${
                            plan.hasSavings
                              ? 'bg-emerald-500/12 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                              : 'bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/70 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {plan.savingsLabel}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botão de Contratação */}
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => onSelectPlan(plan.id, 'register')}
                      className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isPrimary
                          ? 'shadow-md hover:opacity-95'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 border border-transparent dark:border-zinc-700'
                      }`}
                      style={
                        isPrimary
                          ? {
                              backgroundColor: accentConfig.primaryHex,
                              color: accentConfig.primaryContrastHex
                            }
                          : undefined
                      }
                    >
                      <span>Assinar {plan.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Garantia Incondicional */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-2 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm font-semibold text-center">
          <div className="inline-flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Garantia Incondicional de 7 Dias (CDC Art. 49)</span>
          </div>
          <span className="hidden sm:inline text-zinc-400">•</span>
          <span className="text-zinc-600 dark:text-zinc-400 font-normal">
            Pagamento seguro via PIX ou Cartão processado pelo Mercado Pago
          </span>
        </div>
      </div>
    </section>
  );
};
