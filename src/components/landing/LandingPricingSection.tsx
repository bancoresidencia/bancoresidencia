'use client';

import React from 'react';
import { Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { LANDING_PRICING_PLANS, INCLUDED_PLATFORM_FEATURES } from './landingData';
import { useScrollReveal } from './useScrollReveal';

interface LandingPricingSectionProps {
  onSelectPlan: (planId: string, mode?: 'register' | 'login') => void;
}

export const LandingPricingSection: React.FC<LandingPricingSectionProps> = ({ onSelectPlan }) => {
  const { accent, mode, accentConfig } = useTheme();
  const isMonochrome = accent === 'neutral';

  const [pricingConfig, setPricingConfig] = React.useState<{
    showPrices: boolean;
    plans: Record<string, { totalPrice: number; monthlyEquivalent: number; billingText: string; savingsLabel: string }>;
  } | null>(null);

  React.useEffect(() => {
    fetch('/api/plans')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setPricingConfig({
            showPrices: Boolean(data.showPricesOnSite),
            plans: data.plans || {}
          });
        }
      })
      .catch(() => {});
  }, []);

  const highlightTextStyle: React.CSSProperties = isMonochrome
    ? {
      backgroundImage:
        mode === 'dark'
          ? 'linear-gradient(110deg, rgba(255,255,255,0.92) 0%, rgba(161,161,170,0.72) 28%, rgba(255,255,255,1) 50%, rgba(113,113,122,0.76) 76%, rgba(255,255,255,0.92) 100%)'
          : 'linear-gradient(110deg, rgba(9,9,11,0.92) 0%, rgba(82,82,91,0.74) 28%, rgba(9,9,11,1) 50%, rgba(113,113,122,0.78) 76%, rgba(9,9,11,0.92) 100%)'
    }
    : {
      backgroundImage: `linear-gradient(110deg, ${accentConfig.primaryHex} 0%, ${accentConfig.chartPalette[1] ?? accentConfig.hoverHex
        } 26%, ${mode === 'dark' ? 'rgba(224,242,254,0.92)' : 'rgba(255,255,255,0.85)'
        } 48%, ${accentConfig.chartPalette[2] ?? accentConfig.accuracyAccent.hex} 68%, ${accentConfig.primaryHex
        } 100%)`
    };

  const { ref, isVisible, isExiting } = useScrollReveal<HTMLDivElement>(0.08);

  return (
    <section
      id="planos"
      className="relative scroll-mt-20 pt-8 sm:pt-12 pb-14 sm:pb-20 bg-[var(--bg-page,#f1f5f9)] dark:bg-[var(--bg-page,#09090b)] text-[var(--foreground,#09090b)] dark:text-[var(--foreground,#f4f4f5)] transition-colors duration-200 overflow-hidden"
    >
      {/* Iluminação Ambiente Atrás da Dobra (Zero Linhas / Divisórias) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] sm:w-[980px] h-56 opacity-35 dark:opacity-20 blur-3xl rounded-full"
        style={{
          background: `radial-gradient(ellipse at center, ${accentConfig.primaryHex} 0%, transparent 70%)`
        }}
      />

      <div ref={ref} className={`max-w-7xl mx-auto px-4 sm:px-6 fold-reveal ${isVisible ? 'is-visible' : ''} ${isExiting ? 'is-exiting' : ''}`}>
        {/* Cabeçalho dos Planos Padronizado (Alinhado à Esquerda - Estilo Imagem 2) */}
        <div className="max-w-3xl text-left mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-[-0.03em] text-zinc-950 dark:text-white leading-[1.15]">
            Planos transparentes,{' '}
            <span
              className="bg-clip-text text-transparent animate-hippo-text-sweep opacity-95"
              style={highlightTextStyle}
            >
              acesso irrestrito.
            </span>
          </h2>

          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Todos os planos liberam 100% das ferramentas da plataforma desde o primeiro minuto.
          </p>
        </div>

        {/* Barra de Recursos Inclusos em Todos os Planos */}
        <div className={`mb-10 max-w-5xl mx-auto p-4 rounded-2xl bg-white/90 dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/90 fold-reveal fold-delay-1 ${isVisible ? 'is-visible' : ''}`}>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-[13px]">
            <span className="font-extrabold text-zinc-950 dark:text-white shrink-0">
              Incluso em qualquer plano:
            </span>
            {INCLUDED_PLATFORM_FEATURES.map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-medium whitespace-nowrap shrink-0"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{feature}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Grid dos 4 Planos com Contraste WCAG AA e Harmonia Total ao Tema */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch pt-4 sm:pt-6 fold-reveal fold-delay-2 ${isVisible ? 'is-visible' : ''}`}>
          {LANDING_PRICING_PLANS.map((plan) => {
            const isPrimary = plan.tier === 'primary_highlight';
            const isSecondary = plan.tier === 'secondary_highlight';
            const dynamicPlan = pricingConfig?.plans?.[plan.id];
            const displayPriceMonthly = dynamicPlan
              ? dynamicPlan.monthlyEquivalent.toFixed(2).replace('.', ',')
              : plan.pricePerMonth;
            const displayBillingText = dynamicPlan?.billingText || plan.billingText;
            const displaySavingsLabel = dynamicPlan?.savingsLabel || plan.savingsLabel;
            const shouldShowPrices = Boolean(pricingConfig?.showPrices);

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
                  className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between flex-1 transition-all duration-300 hover:-translate-y-1 bg-white/94 dark:bg-zinc-950/94 backdrop-blur-md shadow-[0_20px_50px_rgba(15,23,42,0.10)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.75)] ${isPrimary
                      ? 'border-2 shadow-2xl lg:-translate-y-2 z-10'
                      : isSecondary
                        ? 'border-2 border-zinc-400/80 dark:border-zinc-600 shadow-lg z-10'
                        : 'border border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-400 dark:hover:border-zinc-700'
                    }`}
                  style={isPrimary ? { borderColor: accentConfig.primaryHex } : undefined}
                >
                  {/* Friso luminoso sutil no topo (Laser Rim) */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-6 top-0 h-0.5 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${isPrimary ? accentConfig.primaryHex : isSecondary ? '#a1a1aa' : 'rgba(161,161,170,0.5)'}, transparent)`,
                      opacity: isPrimary ? 0.75 : 0.45
                    }}
                  />
                  {/* Selo Superior com Contraste Adaptativo (Sem corte de overflow) */}
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap z-20 pointer-events-none select-none">
                      <span
                        className={`text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide px-3.5 py-1 rounded-full shadow-md ${isPrimary
                            ? ''
                            : 'bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-950 border border-zinc-700/30 dark:border-zinc-300/30'
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

                    {/* Bloco de Preço Dinâmico (Governante: platform_settings no Supabase) */}
                    {shouldShowPrices && (
                      <div className="mt-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800 animate-in fade-in">
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">R$</span>
                          <span className="text-4xl sm:text-[44px] font-black tracking-[-0.04em] text-zinc-950 dark:text-white tabular-nums leading-none">
                            {displayPriceMonthly}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                            {plan.periodLabel}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2.5 leading-relaxed min-h-[38px]">
                          {displayBillingText}
                        </p>

                        {/* Pílula de Economia */}
                        <div className="mt-3">
                          <div
                            className={`py-2 px-3 rounded-xl text-xs font-extrabold text-center tracking-tight ${plan.hasSavings
                                ? 'bg-emerald-500/12 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                                : 'bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/70 text-zinc-700 dark:text-zinc-300'
                              }`}
                          >
                            {displaySavingsLabel}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botão de Contratação */}
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => onSelectPlan(plan.id, 'register')}
                      className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${isPrimary
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
