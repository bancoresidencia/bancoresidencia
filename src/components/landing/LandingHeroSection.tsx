'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Brain,
  TrendingUp,
  RotateCcw,
  GraduationCap,
  Play
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { TOP_FEATURED_BANCAS, DemoTabKey, FeaturedBancaItem } from './landingData';
import { useHeroParallaxOffset } from './useScrollReveal';

interface LandingHeroSectionProps {
  onOpenAuth: (mode?: 'login' | 'register', planTitle?: string) => void;
  onScrollToSection: (sectionId: string) => void;
  onSelectBancaDemo: (tab: DemoTabKey, questionIdx: number, bancaLabel: string) => void;
}

const HERO_MINI_OPTIONS: { letter: string; text: string; isCorrect?: boolean }[] = [
  { letter: 'A', text: 'Iniciar Digoxina 0,25 mg/dia isolada.' },
  { letter: 'B', text: 'Associar Espironolactona + Dapagliflozina (iSGLT2).', isCorrect: true },
  { letter: 'C', text: 'Adicionar Furosemida 40 mg sem bloqueio mineralocorticoide.' }
];

export const LandingHeroSection: React.FC<LandingHeroSectionProps> = ({
  onOpenAuth,
  onScrollToSection,
  onSelectBancaDemo
}) => {
  const { accent, mode, accentConfig } = useTheme();
  const scrollOffset = useHeroParallaxOffset();
  const [heroAnswer, setHeroAnswer] = useState<string>('B');

  const isMonochrome = accent === 'neutral';
  const parallaxTop = Math.round(scrollOffset * -0.06);
  const parallaxBottom = Math.round(scrollOffset * 0.05);

  const handleBancaClick = (banca: FeaturedBancaItem) => {
    onSelectBancaDemo(banca.targetTab, banca.targetQuestionIdx, banca.shortLabel);
  };

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
          {/* COLUNA ESQUERDA: Posicionamento Cirúrgico + +200 Mil Questões + Dupla de CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Badge Elegante de Lançamento (substitui o letreiro barulhento do topo) */}
            <button
              type="button"
              onClick={() => onScrollToSection('planos')}
              className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer mb-5"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: isMonochrome ? '#10b981' : accentConfig.primaryHex }}
              />
              <span className="text-[11px] sm:text-xs font-bold tracking-tight text-zinc-700 dark:text-zinc-200">
                Lote de Lançamento • Até 60% OFF nos planos anuais
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Título Principal em Inter Display com Tracking Negativo */}
            <h1 className="text-4xl sm:text-5xl md:text-[56px] xl:text-[62px] font-black tracking-[-0.04em] leading-[1.03] text-zinc-950 dark:text-white">
              <span
                className={
                  isMonochrome
                    ? 'text-zinc-950 dark:text-white underline decoration-zinc-400/50 decoration-4 underline-offset-8'
                    : 'bg-clip-text text-transparent bg-gradient-to-r'
                }
                style={
                  isMonochrome
                    ? undefined
                    : {
                        backgroundImage: `linear-gradient(135deg, ${accentConfig.primaryHex} 0%, ${
                          mode === 'dark' ? '#93c5fd' : accentConfig.hoverHex
                        } 100%)`
                      }
                }
              >
                +200 mil questões
              </span>{' '}
              <span className="block mt-1">para sua aprovação na Residência.</span>
            </h1>

            {/* Subtítulo Científico Conectando Hippocampus à Retenção */}
            <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-[17px] text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-xl font-normal">
              Engenharia de retenção clínica com resoluções comentadas alternativa por alternativa, repetição espaçada{' '}
              <strong className="font-semibold text-zinc-900 dark:text-white">FSRS</strong>, resumos ancorados em diretrizes e psicometria{' '}
              <strong className="font-semibold text-zinc-900 dark:text-white">TRI calibrada</strong>.
            </p>

            {/* Dupla Hierárquica de CTAs (Lei de Hick-Hyman: 1 Primário + 1 Secundário Discreto) */}
            <div className="mt-7 sm:mt-8 flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-sm sm:text-[15px] font-bold transition-all duration-200 hover:opacity-95 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer overflow-hidden shadow-lg"
                style={{
                  backgroundColor: accentConfig.primaryHex,
                  color: accentConfig.primaryContrastHex,
                  boxShadow: `0 12px 30px -8px ${accentConfig.bgRgba}`
                }}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-[220%] transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg] pointer-events-none"
                />
                <span className="relative z-10">Testar Grátis Agora</span>
                <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => onScrollToSection('planos')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm sm:text-[15px] font-semibold text-zinc-800 dark:text-zinc-200 bg-white/90 dark:bg-zinc-900/90 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300/90 dark:border-zinc-700/90 transition-all cursor-pointer"
              >
                <span>Ver Planos</span>
              </button>
            </div>

            {/* Sinais Rápidos de Confiança Científica e Garantia */}
            <div className="mt-6 pt-5 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Garantia incondicional de 7 dias</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Diretrizes SBC, FEBRASGO, SBP e ATLS</span>
              </span>
            </div>
          </div>

          {/* COLUNA DIREITA: Mockup Vivo em Camadas + Micro-Badges em Paralaxe (Inspiração SquadEasy) */}
          <div className="lg:col-span-6 relative">
            {/* Micro-Badge Flutuante Superior Direito: Percentil TRI */}
            <div
              style={{ transform: `translate3d(0, ${parallaxTop}px, 0)` }}
              className="hidden sm:flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-700/80 shadow-xl absolute -top-5 right-2 xl:-right-3 z-20 transition-transform duration-150 will-change-transform"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 leading-none">
                  Psicometria TRI Oficial
                </div>
                <div className="text-xs font-extrabold text-zinc-950 dark:text-white tabular-nums mt-1">
                  Percentil P88 • Acima do corte USP
                </div>
              </div>
            </div>

            {/* Janela Interativa Principal da Plataforma Hippocampus */}
            <div className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 shadow-2xl shadow-zinc-300/40 dark:shadow-black/70 overflow-hidden relative z-10">
              {/* Barra de Título do App */}
              <div className="px-4 py-3 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/70 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  </div>
                  <span className="ml-1.5 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                    Simulado ENARE / HCFMUSP • Cardiologia
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Interativo • Clique abaixo
                </span>
              </div>

              {/* Corpo Clínico Interativo */}
              <div className="p-4 sm:p-5 space-y-3.5">
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded-md font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                    Clínica Médica
                  </span>
                  <span className="px-2 py-0.5 rounded-md font-semibold text-zinc-600 dark:text-zinc-400">
                    • IC de Fração de Ejeção Reduzida (FEVE 32%)
                  </span>
                </div>

                <p className="text-xs sm:text-[13px] text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  Paciente 64 anos, ICFEr NYHA II em uso otimizado de IECA e Carvedilol (PA 118x74 mmHg, K⁺ 4,3 mEq/L, Cr 1,1 mg/dL). Qual associação completa a <strong>quádrupla terapia modificadora de mortalidade</strong>?
                </p>

                {/* Opções Clicáveis no Próprio Hero */}
                <div className="space-y-2">
                  {HERO_MINI_OPTIONS.map((opt) => {
                    const isSelected = heroAnswer === opt.letter;
                    const showCorrect = Boolean(heroAnswer) && opt.isCorrect;
                    const showWrong = isSelected && !opt.isCorrect;

                    return (
                      <button
                        key={opt.letter}
                        type="button"
                        onClick={() => setHeroAnswer(opt.letter)}
                        className={`w-full p-2.5 sm:p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer text-xs ${
                          showCorrect
                            ? 'bg-emerald-50/90 dark:bg-emerald-950/35 border-emerald-500/80 text-emerald-950 dark:text-emerald-100'
                            : showWrong
                              ? 'bg-rose-50/90 dark:bg-rose-950/35 border-rose-500/80 text-rose-950 dark:text-rose-100'
                              : 'bg-zinc-50/80 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 ${
                            showCorrect
                              ? 'bg-emerald-600 text-white'
                              : showWrong
                                ? 'bg-rose-600 text-white'
                                : 'bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {showCorrect ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : showWrong ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            opt.letter
                          )}
                        </span>
                        <span className="font-medium leading-snug">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Mini Feedback Padrão-Ouro da Diretriz SBC */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 flex items-start justify-between gap-3">
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                      Diretriz SBC IC:
                    </strong>{' '}
                    IECA/INRA + Betabloqueador + Espironolactona + iSGLT2 reduzem mortalidade e hospitalização.
                  </div>
                  <button
                    type="button"
                    onClick={() => onScrollToSection('questoes')}
                    className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-zinc-900 dark:text-white hover:underline cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>+20 questões</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Micro-Badge Flutuante Inferior Esquerdo: Retenção FSRS & Caderno de Erros */}
            <div
              style={{ transform: `translate3d(0, ${parallaxBottom}px, 0)` }}
              className="mt-3 sm:mt-0 sm:absolute sm:-bottom-5 sm:-left-4 z-20 flex items-center justify-between sm:justify-start gap-3 px-3.5 py-2.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-700/80 shadow-xl transition-transform duration-150 will-change-transform"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: accentConfig.primaryHex,
                  color: accentConfig.primaryContrastHex
                }}
              >
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 leading-none">
                  Repetição Espaçada FSRS
                </div>
                <div className="text-xs font-extrabold text-zinc-950 dark:text-white tabular-nums mt-1 flex items-center gap-1.5">
                  <span>94,2% de retenção ativa</span>
                  <RotateCcw className="w-3 h-3 text-emerald-500" />
                </div>
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
