'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Brain,
  GitBranch,
  Sparkles,
  CheckCircle2,
  Zap,
  RotateCw,
  LucideIcon
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { HippocampusLoading } from '@/components/HippocampusLoading';
import { smootherstep } from '@/utils/smootherstep';

const HippocampusDissectionScene = dynamic(
  () => import('@/components/HippocampusDissectionScene'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <HippocampusLoading fullScreen={false} size="md" />
      </div>
    )
  }
);

const initialProgress = { scrollProgress: 0, entryProgress: 1 };

export interface LandingBrainHeroProps {
  onOpenAuth: (mode?: 'login' | 'register', planTitle?: string) => void;
  onScrollToSection: (sectionId: string) => void;
}

type CardMorphology = 'executive' | 'circuit' | 'monolith';

interface ScrollyCardSpec {
  id: string;
  stepTag: string;
  topBadge: {
    label: string;
    sublabel: string;
  };
  title: string;
  highlightWord: string;
  description: string;
  pathwayChips: string[];
  footnote: string;
  icon: LucideIcon;
  morphology: CardMorphology;
  isFinalMetaphor?: boolean;
}

const SCROLLY_CARDS: ScrollyCardSpec[] = [
  {
    id: 'cortex-pfc',
    stepTag: '01 • MEMÓRIA DE TRABALHO & DECISÃO CLÍNICA',
    topBadge: {
      label: 'MODO EXECUTIVO • PFC',
      sublabel: 'COGNITIVE WORKSPACE'
    },
    title: 'O Córtex Pré-Frontal processa a dúvida, mas a retenção exige ',
    highlightWord: 'consolidação.',
    description:
      'Ao enfrentar uma questão complexa, o Córtex Pré-Frontal recruta a memória de trabalho para correlacionar hipóteses e filtrar distratores. Sem consolidação sináptica profunda, o esforço cognitivo se dissipa e o aprendizado não se fixa.',
    pathwayChips: ['Raciocínio Clínico', 'Memória de Trabalho', 'Filtro de Distratores'],
    footnote: 'Role para dissecar o encéfalo e revelar o circuito profundo da retenção.',
    icon: Brain,
    morphology: 'executive'
  },
  {
    id: 'papez',
    stepTag: '02 • CIRCUITO DE PAPEZ & INTEGRAÇÃO',
    topBadge: {
      label: 'ANEL LÍMBICO DE REVERBERAÇÃO',
      sublabel: 'FEEDBACK LOOP'
    },
    title: 'A reverberação neural que filtra o que é ',
    highlightWord: 'essencial.',
    description:
      'No centro do encéfalo, o Circuito de Papez integrado ao Tálamo faz o impulso reverberar entre Hipocampo, Fórnix, Corpos Mamilares, Tálamo Anterior e Giro do Cíngulo, selecionando padrões decisivos para a prova.',
    pathwayChips: ['Hipocampo', 'Fórnix', 'C. Mamilares', 'Tálamo', 'Giro do Cíngulo'],
    footnote: 'Integração límbica que sustenta o raciocínio médico conectado.',
    icon: GitBranch,
    morphology: 'circuit'
  },
  {
    id: 'hippocampus-metaphor',
    stepTag: '03 • A METÁFORA HIPPOCAMPUS',
    topBadge: {
      label: 'RETENÇÃO DEFINITIVA • LONGO PRAZO',
      sublabel: 'STABLE ENGRAM'
    },
    title: 'O seu Hipocampo externo rumo à ',
    highlightWord: 'aprovação.',
    description:
      'Isolado no centro da consolidação, o Hipocampo converte o estudo frágil em memória definitiva de longo prazo pronta para decisão sob pressão. O Banco de Questões Hippocampus cumpre exatamente esse papel: +200 mil questões comentadas, algoritmo FSRS e calibração TRI.',
    pathwayChips: ['Resolução Ativa', 'Repetição FSRS', 'Calibração TRI', 'Memória Definitiva'],
    footnote: 'Cada questão resolvida fortalece a trilha neural que você acionará na prova.',
    icon: Sparkles,
    morphology: 'monolith',
    isFinalMetaphor: true
  }
];

export const LandingBrainHero: React.FC<LandingBrainHeroProps> = ({
  onOpenAuth,
  onScrollToSection
}) => {
  const { accent, mode, accentConfig } = useTheme();
  const isDark = mode === 'dark';
  const isMonochrome = accent === 'neutral';
  const trackRef = useRef<HTMLDivElement | null>(null);
  const sceneRequested = useRef(false);
  const [showScene, setShowScene] = useState(false);
  const progressRef = useRef(initialProgress);
  const [{ scrollProgress, entryProgress }, setProgress] = useState(initialProgress);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(typeof window !== 'undefined' && window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  const updateScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || typeof window === 'undefined') return;
    const rect = el.getBoundingClientRect();
    const winH = window.innerHeight || 800;
    if (!sceneRequested.current && rect.bottom > 0 &&
      (rect.top < winH || (window.scrollY > 0 && rect.top < winH * 1.6))) {
      sceneRequested.current = true;
      setShowScene(true);
    }
    const scrollable = Math.max(el.offsetHeight - winH, 1);
    const nextProgress = {
      entryProgress: Math.max(0, Math.min(1, 1 - Math.max(0, rect.top) / winH)),
      scrollProgress: Math.max(0, Math.min(1, -rect.top / scrollable)),
    };
    const previous = progressRef.current;
    if (previous.scrollProgress !== nextProgress.scrollProgress ||
      previous.entryProgress !== nextProgress.entryProgress) {
      progressRef.current = nextProgress;
      setProgress(nextProgress);
    }
  }, []);

  useEffect(() => {
    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        updateScroll();
      });
    };
    updateScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [updateScroll]);

  // Transição suave de esvaecimento de aparição ao transitar da 1ª dobra para a 2ª dobra
  const entryFade = smootherstep(0.20, 0.82, entryProgress);
  const textEntranceTranslateY = (1 - entryFade) * 20;
  const brainEntranceOpacity = smootherstep(0.18, 0.88, entryProgress);
  const brainEntranceScale = 0.92 + 0.08 * smootherstep(0.18, 0.95, entryProgress);

  // Coreografia espacial dentro da 2ª dobra:
  const heroFadeOut = smootherstep(0.02, 0.15, scrollProgress);
  const heroOpacity = entryFade * (1 - heroFadeOut);
  const heroTranslateY = textEntranceTranslateY - 14 * heroFadeOut;
  const brainShiftT = smootherstep(0.02, 0.19, scrollProgress);
  const cardsPanelOpacity = smootherstep(0.16, 0.24, scrollProgress);

  // De +285px (coluna direita, lugar da Imagem 2) para -235px (coluna esquerda do scrollytelling)
  const desktopBrainX = 285 * (1 - brainShiftT) - 235 * brainShiftT;

  // Janelas calibradas com zona de retenção estendida no Card 3 (Hipocampo isolado):
  // Card 1 (Córtex inteiro -> Dissecação na saída): 0.14 -> 0.42
  // Card 2 (Circuito de Papez): 0.42 -> 0.68
  // Card 3 (Hipocampo isolado + platô de contemplação sem escape súbito): 0.68 -> 1.00
  const activeCardIdx = scrollProgress < 0.42 ? 0 : scrollProgress < 0.68 ? 1 : 2;

  const highlightTextStyle: React.CSSProperties = isMonochrome
    ? {
        backgroundImage: isDark
          ? 'linear-gradient(110deg, rgba(255,255,255,0.92) 0%, rgba(161,161,170,0.72) 28%, rgba(255,255,255,1) 50%, rgba(113,113,122,0.76) 76%, rgba(255,255,255,0.92) 100%)'
          : 'linear-gradient(110deg, rgba(9,9,11,0.92) 0%, rgba(82,82,91,0.74) 28%, rgba(9,9,11,1) 50%, rgba(113,113,122,0.78) 76%, rgba(9,9,11,0.92) 100%)'
      }
    : {
        backgroundImage: `linear-gradient(110deg, ${accentConfig.primaryHex} 0%, ${
          accentConfig.chartPalette[1] ?? accentConfig.hoverHex
        } 26%, ${
          isDark ? 'rgba(224,242,254,0.92)' : 'rgba(255,255,255,0.85)'
        } 48%, ${accentConfig.chartPalette[2] ?? accentConfig.accuracyAccent.hex} 68%, ${
          accentConfig.primaryHex
        } 100%)`
      };

  const primaryBtnStyle: React.CSSProperties = {
    backgroundColor: accentConfig.primaryHex,
    color: accentConfig.primaryContrastHex,
    boxShadow: `0 14px 34px -8px ${accentConfig.bgRgba}`
  };

  return (
    <section
      aria-label="Hero Principal e Jornada Neuroanatômica Hippocampus"
      className="font-inter relative w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-b from-white via-zinc-50/90 to-zinc-100/70 dark:from-[var(--bg-page)] dark:via-[var(--bg-page)] dark:to-[#070709]"
    >
      {/* Trilha longa de Scrollytelling (640vh) com zona de retenção estendida no Card 3 */}
      <div ref={trackRef} className="relative h-[640vh] w-full select-none">
        <div className="sticky top-16 h-[calc(100vh-4rem)] min-h-[540px] w-full overflow-hidden flex flex-col justify-between">
          {/* Luz ambiente radial sutil */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/4 -translate-x-1/2 w-[560px] sm:w-[780px] h-[340px] rounded-full blur-[120px] opacity-12 dark:opacity-18 transition-colors duration-500"
            style={{ backgroundColor: accentConfig.primaryHex }}
          />

          {/* Palco Central Unificado */}
          <div className="relative flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center justify-center">
            {/* 1. BLOCO INICIAL À ESQUERDA (A Neurociência da Retenção — desaparece ao rolar enquanto o cérebro sobrepõe) */}
            <div
              aria-hidden={heroOpacity < 0.05}
              style={{
                opacity: heroOpacity,
                transform: `translate3d(0, ${heroTranslateY.toFixed(1)}px, 0) scale(${(
                  1 -
                  heroFadeOut * 0.035
                ).toFixed(3)})`,
                pointerEvents: heroOpacity > 0.35 ? 'auto' : 'none'
              }}
              className="relative lg:absolute lg:left-6 lg:top-1/2 lg:-translate-y-1/2 z-10 w-full lg:w-[49%] pt-4 lg:pt-0 flex flex-col items-start text-left will-change-transform"
            >
              <div
                className="inline-flex items-center gap-2 mb-3 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] border border-zinc-200/90 dark:border-zinc-800/90 bg-white/70 dark:bg-zinc-900/70 shadow-2xs backdrop-blur-sm"
                style={{
                  color: isMonochrome
                    ? isDark
                      ? '#f4f4f5'
                      : '#18181b'
                    : accentConfig.primaryHex
                }}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>A Neurociência da Retenção</span>
              </div>

              <h2 className="text-[28px] sm:text-[38px] md:text-[42px] xl:text-[48px] font-black tracking-[-0.035em] leading-[1.1] text-zinc-950 dark:text-white">
                <span className="block text-zinc-900/60 dark:text-white/60">
                  Do córtex visual à
                </span>
                <span
                  className="bg-clip-text text-transparent animate-hippo-text-sweep opacity-95"
                  style={highlightTextStyle}
                >
                  MEMÓRIA DEFINITIVA.
                </span>
              </h2>

              <p className="mt-3.5 text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-300 max-w-md">
                Role para dissecar o encéfalo e acompanhar como o circuito límbico converte o estudo volátil em memória permanente.
              </p>

              {/* Indicador elegante de rolagem para iniciar a dissecação */}
              <div className="mt-6 sm:mt-7 inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide text-zinc-500 dark:text-zinc-400 bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/70 dark:border-zinc-800/70 backdrop-blur-sm">
                <span
                  className="inline-block w-2 h-2 rounded-full animate-ping shrink-0"
                  style={{ backgroundColor: accentConfig.primaryHex }}
                />
                <span>Role para dissecar o encéfalo</span>
              </div>
            </div>

            {/* 2. PALCO 3D DO CÉREBRO (z-20: esvaecimento e escala suave na transição entre dobras) */}
            <div
              style={
                {
                  opacity: brainEntranceOpacity,
                  transform: isDesktop
                    ? `translate3d(${desktopBrainX.toFixed(1)}px, 0, 0) scale(${brainEntranceScale.toFixed(3)})`
                    : `scale(${brainEntranceScale.toFixed(3)})`
                } as React.CSSProperties
              }
              className="relative z-20 w-full max-w-[600px] lg:w-[650px] lg:max-w-[650px] h-[46vh] sm:h-[52vh] lg:h-[74vh] flex items-center justify-center will-change-transform transition-opacity duration-300"
            >
              {showScene && (
                <HippocampusDissectionScene
                  scrollProgress={scrollProgress}
                  isDark={isDark}
                  accentConfig={accentConfig}
                />
              )}
            </div>

            {/* 3. COLUNA DIREITA DE CARDS DE STORYTELLING (surgem quando o cérebro chega à esquerda) */}
            <div
              style={{
                opacity: cardsPanelOpacity,
                pointerEvents: cardsPanelOpacity > 0.35 ? 'auto' : 'none'
              }}
              className="relative lg:absolute lg:right-6 lg:top-1/2 lg:-translate-y-1/2 z-30 w-full max-w-xl lg:w-[435px] xl:w-[465px] h-[36vh] sm:h-[34vh] lg:h-[420px] flex items-center justify-center"
            >
              {SCROLLY_CARDS.map((card, idx) => {
                const isActive = idx === activeCardIdx && scrollProgress >= 0.15;
                const isPast = idx < activeCardIdx;
                const Icon = card.icon;

                // Morfologias diferenciadas com clareza visual de troca mantendo foco no encéfalo
                const morphologyClasses =
                  card.morphology === 'executive'
                    ? 'rounded-2xl rounded-tr-md border-t-2 border-t-zinc-400 dark:border-t-zinc-500 shadow-[0_20px_45px_rgba(15,23,42,0.10)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.75)]'
                    : card.morphology === 'circuit'
                      ? 'rounded-[32px] sm:rounded-[36px] shadow-[0_22px_55px_rgba(15,23,42,0.08)] dark:shadow-[0_26px_65px_rgba(0,0,0,0.70)]'
                      : 'rounded-2xl border-2 shadow-[0_24px_60px_rgba(15,23,42,0.14)] dark:shadow-[0_28px_70px_rgba(0,0,0,0.85)]';

                const monolithGlowStyle: React.CSSProperties | undefined =
                  card.morphology === 'monolith' && isActive
                    ? {
                        boxShadow: isDark
                          ? `0 0 45px -8px ${accentConfig.primaryHex}44, 0 24px 60px rgba(0,0,0,0.85)`
                          : `0 0 38px -10px ${accentConfig.primaryHex}35, 0 20px 50px rgba(15,23,42,0.12)`,
                        borderColor: `${accentConfig.primaryHex}66`
                      }
                    : undefined;

                return (
                  <article
                    key={card.id}
                    aria-hidden={!isActive}
                    style={monolithGlowStyle}
                    className={`absolute inset-x-0 mx-auto w-full border p-5 sm:p-6 lg:p-7 backdrop-blur-xl transition-all duration-700 ease-out ${
                      isActive
                        ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                        : isPast
                          ? 'opacity-0 -translate-y-6 scale-[0.98] pointer-events-none'
                          : 'opacity-0 translate-y-6 scale-[0.98] pointer-events-none'
                    } ${morphologyClasses} bg-white/88 dark:bg-zinc-900/84 border-zinc-200/90 dark:border-zinc-800/90`}
                  >
                    {/* Friso superior de luz no monolito */}
                    {card.morphology === 'monolith' && (
                      <div
                        className="pointer-events-none absolute top-0 inset-x-8 h-[2px] rounded-full"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${accentConfig.primaryHex}, transparent)`
                        }}
                      />
                    )}

                    {/* HUD / Indicador Morfológico Superior */}
                    <div className="flex items-center justify-between text-[9px] sm:text-[9.5px] font-mono tracking-widest uppercase text-zinc-400 dark:text-zinc-500 pb-2.5 mb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
                      <span
                        className="flex items-center gap-1.5 font-bold"
                        style={{
                          color: isMonochrome
                            ? isDark
                              ? '#f4f4f5'
                              : '#18181b'
                            : accentConfig.primaryHex
                        }}
                      >
                        {card.morphology === 'executive' && <Zap className="w-3 h-3" />}
                        {card.morphology === 'circuit' && (
                          <RotateCw className="w-3 h-3 animate-[spin_10s_linear_infinite]" />
                        )}
                        {card.morphology === 'monolith' && <Sparkles className="w-3 h-3" />}
                        <span>{card.topBadge.label}</span>
                      </span>
                      <span className="opacity-70">{card.topBadge.sublabel}</span>
                    </div>

                    <div className="flex items-center justify-between gap-3 mb-3.5">
                      <div className="inline-flex items-center gap-2">
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200/80 dark:border-zinc-700/70 bg-zinc-100/80 dark:bg-zinc-800/80"
                          style={{
                            color: isMonochrome
                              ? isDark
                                ? '#f4f4f5'
                                : '#18181b'
                              : accentConfig.primaryHex
                          }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <span
                          className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em]"
                          style={{
                            color: isMonochrome
                              ? isDark
                                ? '#a1a1aa'
                                : '#52525b'
                              : accentConfig.primaryHex
                          }}
                        >
                          {card.stepTag}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5" aria-hidden="true">
                        {SCROLLY_CARDS.map((s, dotIdx) => (
                          <span
                            key={s.id}
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              dotIdx === idx ? 'w-5' : 'w-1.5 bg-zinc-300 dark:bg-zinc-700'
                            }`}
                            style={
                              dotIdx === idx
                                ? {
                                    backgroundColor: isMonochrome
                                      ? isDark
                                        ? '#f4f4f5'
                                        : '#18181b'
                                      : accentConfig.primaryHex
                                  }
                                : undefined
                            }
                          />
                        ))}
                      </div>
                    </div>

                    <h2 className="text-lg sm:text-xl lg:text-[23px] font-black tracking-[-0.025em] leading-snug text-zinc-950 dark:text-white">
                      <span className="font-bold text-zinc-900/80 dark:text-white/85">
                        {card.title}
                      </span>
                      <span className="bg-clip-text text-transparent" style={highlightTextStyle}>
                        {card.highlightWord}
                      </span>
                    </h2>

                    <p className="mt-2.5 text-xs sm:text-[13.5px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                      {card.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      {card.pathwayChips.map((chip, cIdx) => (
                        <React.Fragment key={chip}>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10.5px] font-semibold bg-zinc-100 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-200 border border-zinc-200/70 dark:border-zinc-700/60">
                            {chip}
                          </span>
                          {cIdx < card.pathwayChips.length - 1 && (
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {card.isFinalMetaphor ? (
                      <div className="mt-5 pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          tabIndex={isActive ? 0 : -1}
                          onClick={() => onOpenAuth('register')}
                          style={primaryBtnStyle}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-[13px] font-bold shadow-sm hover:opacity-92 transition-opacity cursor-pointer"
                        >
                          Consolidar minha aprovação
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          tabIndex={isActive ? 0 : -1}
                          onClick={() => onScrollToSection('questoes')}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100/90 dark:bg-zinc-800/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 border border-zinc-200/80 dark:border-zinc-700/70 transition-colors cursor-pointer"
                        >
                          Testar questão real
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 pt-3 border-t border-zinc-200/70 dark:border-zinc-800/70 flex items-center gap-2 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                        <CheckCircle2
                          className="w-3.5 h-3.5 shrink-0"
                          style={{
                            color: isMonochrome
                              ? isDark
                                ? '#a1a1aa'
                                : '#52525b'
                              : accentConfig.primaryHex
                          }}
                        />
                        <span>{card.footnote}</span>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingBrainHero;
