'use client';

import React from 'react';
import {
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  Layers,
  BookOpenCheck,
  TrendingUp,
  LucideIcon
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { TOP_FEATURED_BANCAS, DemoTabKey, FeaturedBancaItem } from './landingData';
import { useHeroParallaxOffset } from './useScrollReveal';
import { HeroLogo3D } from './HeroLogo3D';

interface LandingHeroSectionProps {
  onOpenAuth: (mode?: 'login' | 'register', planTitle?: string) => void;
  onScrollToSection: (sectionId: string) => void;
  onSelectBancaDemo: (tab: DemoTabKey, questionIdx: number, bancaLabel: string) => void;
}

interface HeroPillarCard {
  id: string;
  text: string;
  icon: LucideIcon;
  baseX: number;
  baseRotate: number;
  scrollXFactor: number;
  scrollYFactor: number;
  scrollRotateFactor: number;
  driftX: string;
  driftY: string;
  driftRot: string;
  delay: string;
  zIndexClass: string;
}

const HERO_PILLAR_CARDS: HeroPillarCard[] = [
  {
    id: 'flashcards',
    text: 'Flashcards que estarão na sua prova',
    icon: Layers,
    baseX: -20,
    baseRotate: -1.8,
    scrollXFactor: -0.095,
    scrollYFactor: -0.075,
    scrollRotateFactor: -0.008,
    driftX: '-3px',
    driftY: '-4px',
    driftRot: '-0.6deg',
    delay: '0s',
    zIndexClass: 'z-10'
  },
  {
    id: 'materiais',
    text: 'Materiais com base nas diretrizes e nas questões de residência',
    icon: BookOpenCheck,
    baseX: 22,
    baseRotate: 1.4,
    scrollXFactor: 0.105,
    scrollYFactor: -0.01,
    scrollRotateFactor: 0.007,
    driftX: '3px',
    driftY: '-4px',
    driftRot: '0.6deg',
    delay: '-2.1s',
    zIndexClass: 'z-20'
  },
  {
    id: 'evolucao',
    text: 'Evolução completa do seu desempenho',
    icon: TrendingUp,
    baseX: -12,
    baseRotate: -1.1,
    scrollXFactor: -0.07,
    scrollYFactor: 0.06,
    scrollRotateFactor: -0.006,
    driftX: '-2px',
    driftY: '-4px',
    driftRot: '-0.5deg',
    delay: '-4.2s',
    zIndexClass: 'z-30'
  }
];

export const LandingHeroSection: React.FC<LandingHeroSectionProps> = ({
  onOpenAuth,
  onScrollToSection,
  onSelectBancaDemo
}) => {
  const { accent, mode, accentConfig } = useTheme();
  const scrollOffset = useHeroParallaxOffset();

  const isMonochrome = accent === 'neutral';

  const handleBancaClick = (banca: FeaturedBancaItem) => {
    onSelectBancaDemo(banca.targetTab, banca.targetQuestionIdx, banca.shortLabel);
  };

  const highlightTextStyle: React.CSSProperties = isMonochrome
    ? {
        backgroundImage:
          mode === 'dark'
            ? 'linear-gradient(110deg, rgba(255,255,255,0.92) 0%, rgba(161,161,170,0.72) 28%, rgba(255,255,255,1) 50%, rgba(113,113,122,0.76) 76%, rgba(255,255,255,0.92) 100%)'
            : 'linear-gradient(110deg, rgba(9,9,11,0.92) 0%, rgba(82,82,91,0.74) 28%, rgba(9,9,11,1) 50%, rgba(113,113,122,0.78) 76%, rgba(9,9,11,0.92) 100%)'
      }
    : {
        backgroundImage: `linear-gradient(110deg, ${accentConfig.primaryHex} 0%, ${
          accentConfig.chartPalette[1] ?? accentConfig.hoverHex
        } 26%, ${
          mode === 'dark' ? 'rgba(224,242,254,0.92)' : 'rgba(255,255,255,0.85)'
        } 48%, ${accentConfig.chartPalette[2] ?? accentConfig.accuracyAccent.hex} 68%, ${
          accentConfig.primaryHex
        } 100%)`
      };

  const scrollEmergenceScale = Math.min(1 + scrollOffset * 0.00018, 1.09).toFixed(4);

  return (
    <section className="relative overflow-hidden pt-10 pb-14 sm:pt-14 sm:pb-18 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-b from-white via-zinc-50/90 to-zinc-100/70 dark:from-[var(--bg-page)] dark:via-[var(--bg-page)] dark:to-[#070709]">
      {/* Luz ambiente radial sutil adaptada ao acento */}
      <div
        aria-hidden="true"
        className="absolute -top-24 left-1/4 -translate-x-1/2 w-[560px] sm:w-[780px] h-[340px] rounded-full blur-[120px] opacity-15 dark:opacity-20 pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: accentConfig.primaryHex }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* COLUNA ESQUERDA: +200 MIL QUESTÕES + Dupla de CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Título Principal em 3 linhas equilibradas com transparência e animação de cor suave */}
            <h1 className="text-[32px] sm:text-[42px] md:text-[46px] xl:text-[52px] font-black tracking-[-0.035em] leading-[1.1] text-zinc-950 dark:text-white">
              <span
                className="block sm:whitespace-nowrap bg-clip-text text-transparent animate-hippo-text-sweep opacity-95"
                style={highlightTextStyle}
              >
                +200 MIL QUESTÕES
              </span>
              <span className="block mt-1">
                <span className="font-bold text-zinc-900/55 dark:text-white/55">para a sua </span>
                <span
                  className="bg-clip-text text-transparent animate-hippo-text-sweep opacity-95"
                  style={highlightTextStyle}
                >
                  APROVAÇÃO
                </span>
              </span>
              <span className="block mt-0.5">
                <span className="font-bold text-zinc-900/55 dark:text-white/55">na </span>
                <span
                  className="bg-clip-text text-transparent animate-hippo-text-sweep opacity-95"
                  style={highlightTextStyle}
                >
                  RESIDÊNCIA.
                </span>
              </span>
            </h1>

            {/* Dupla Hierárquica de CTAs com animações suaves ao passar por cima */}
            <div className="mt-8 sm:mt-9 flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-sm sm:text-[15px] font-bold transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] cursor-pointer overflow-hidden shadow-lg"
                style={{
                  backgroundColor: accentConfig.primaryHex,
                  color: accentConfig.primaryContrastHex,
                  boxShadow: `0 14px 34px -8px ${accentConfig.bgRgba}`
                }}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-[220%] transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] pointer-events-none"
                />
                <span className="relative z-10">Testar Grátis Agora</span>
                <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
              </button>

              <button
                type="button"
                onClick={() => onScrollToSection('planos')}
                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm sm:text-[15px] font-semibold text-zinc-800 dark:text-zinc-200 bg-white/80 dark:bg-zinc-900/75 hover:bg-white dark:hover:bg-zinc-800/95 border border-zinc-300/90 dark:border-zinc-700/80 hover:border-zinc-400 dark:hover:border-zinc-500 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:shadow-zinc-900/10 dark:hover:shadow-black/40 active:scale-[0.98] transition-all duration-300 ease-out overflow-hidden cursor-pointer backdrop-blur-sm"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-[220%] transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-zinc-400/15 dark:via-white/15 to-transparent skew-x-[-20deg] pointer-events-none"
                />
                <span className="relative z-10">Ver Planos</span>
                <ChevronRight className="w-4 h-4 relative z-10 text-zinc-500 dark:text-zinc-400 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:text-zinc-900 dark:group-hover:text-white" />
              </button>
            </div>

            {/* Sinal Rápido de Garantia */}
            <div className="mt-6 pt-5 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-zinc-600/85 dark:text-zinc-400/85">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Garantia incondicional de 7 dias</span>
              </span>
            </div>
          </div>

          {/* COLUNA DIREITA: Logo de vidro ampliada ao fundo + 3 Cards translúcidos mais espaçados saindo de dentro dela */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[350px] sm:min-h-[415px] lg:min-h-[450px]">
            {/* Logo hippotalamus.svg de vidro 3D ao centro */}
            <div className="relative z-10 w-full flex items-center justify-center">
              <HeroLogo3D
                accentConfig={accentConfig}
                mode={mode}
                isMonochrome={isMonochrome}
                scrollOffset={scrollOffset}
              />
            </div>

            {/* Pilha de 3 Cards translúcidos com respiro natural entre eles sobrepondo a logo */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-3 sm:px-6 pointer-events-none">
              <div className="w-full max-w-[355px] sm:max-w-[385px] flex flex-col items-center gap-6 sm:gap-7">
                {HERO_PILLAR_CARDS.map((card) => {
                  const Icon = card.icon;
                  const translateX = (card.baseX + scrollOffset * card.scrollXFactor).toFixed(2);
                  const translateY = (scrollOffset * card.scrollYFactor).toFixed(2);
                  const rotateDeg = (card.baseRotate + scrollOffset * card.scrollRotateFactor).toFixed(2);

                  const driftVars: React.CSSProperties & {
                    '--drift-x': string;
                    '--drift-y': string;
                    '--drift-rot': string;
                  } = {
                    animationDelay: card.delay,
                    '--drift-x': card.driftX,
                    '--drift-y': card.driftY,
                    '--drift-rot': card.driftRot
                  };

                  return (
                    <div
                      key={card.id}
                      className={`w-full ${card.zIndexClass} pointer-events-auto will-change-transform transition-transform duration-150 ease-out hover:z-40`}
                      style={{
                        transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotateDeg}deg) scale(${scrollEmergenceScale})`
                      }}
                    >
                      <div
                        style={driftVars}
                        className="animate-hippo-card-drift flex items-center gap-3 px-4 py-2.5 sm:px-4.5 sm:py-3 rounded-2xl bg-white/32 dark:bg-zinc-950/28 backdrop-blur-md border border-white/45 dark:border-white/12 opacity-80 hover:opacity-100 hover:bg-white/65 dark:hover:bg-zinc-900/65 shadow-lg shadow-zinc-900/10 dark:shadow-black/40 hover:scale-[1.02] transition-all duration-200"
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
                          style={
                            isMonochrome
                              ? {
                                  backgroundColor:
                                    mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(24,24,27,0.08)',
                                  borderColor:
                                    mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(24,24,27,0.18)',
                                  color: mode === 'dark' ? '#ffffff' : '#18181b'
                                }
                              : {
                                  backgroundColor: accentConfig.bgRgba,
                                  borderColor: accentConfig.borderRgba,
                                  color: accentConfig.primaryHex
                                }
                          }
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-[13px] font-semibold text-zinc-900/90 dark:text-white/90 leading-snug">
                          {card.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* CARROSSEL HÍBRIDO DE BANCAS EXAMINADORAS (Mini-Brasão Nitidez Total + Sigla em Inter Bold + Clique Inteligente) */}
        <div className="relative w-full overflow-hidden mt-14 sm:mt-16 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Provas oficiais na íntegra • Clique em uma banca para testar uma questão real:
            </span>
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 tabular-nums">
              +120 instituições examinadoras auditadas
            </span>
          </div>

          {/* Fades laterais suaves */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-11 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-zinc-100/95 via-zinc-100/60 to-transparent dark:from-[#08080b] dark:via-[#08080b]/70 to-transparent z-10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-11 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-zinc-100/95 via-zinc-100/60 to-transparent dark:from-[#08080b] dark:via-[#08080b]/70 to-transparent z-10"
          />

          <div className="animate-marquee flex items-center gap-2.5 py-1">
            {[...TOP_FEATURED_BANCAS, ...TOP_FEATURED_BANCAS].map((banca, idx) => {
              const isDuplicate = idx >= TOP_FEATURED_BANCAS.length;
              return (
                <button
                  key={`${banca.id}-${idx}`}
                  type="button"
                  tabIndex={isDuplicate ? -1 : 0}
                  aria-hidden={isDuplicate ? true : undefined}
                  onClick={() => handleBancaClick(banca)}
                  title={`Testar questão real: ${banca.name}`}
                  className="h-10 sm:h-11 pl-2 pr-3.5 rounded-xl bg-white dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100 border border-zinc-200/90 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:-translate-y-0.5 transition-all duration-150 cursor-pointer inline-flex items-center gap-2.5 shrink-0 whitespace-nowrap shadow-2xs group"
                >
                  {/* Container óptico claro 26x26 garantindo contraste perfeito de qualquer brasão no modo escuro ou claro */}
                  <span className="w-6.5 h-6.5 rounded-lg bg-white border border-zinc-200/80 flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                    {banca.logoSlug ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/images/institutions/${banca.logoSlug}.webp`}
                        alt=""
                        width={22}
                        height={22}
                        decoding="async"
                        className="w-[22px] h-[22px] object-contain"
                      />
                    ) : (
                      <GraduationCap className="w-3.5 h-3.5 text-zinc-700" />
                    )}
                  </span>

                  <span className="text-xs font-bold tracking-tight text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white">
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
