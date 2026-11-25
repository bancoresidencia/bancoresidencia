'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { prepareLandingBrainDownload, type LandingBrainDownload } from '@/utils/landingBrainAssets';
import { smootherstep } from '@/utils/smootherstep';
import { getBrainJourneyFrame, LandingBrainJourneyCards } from '@/components/landing/LandingBrainJourneyCards';
import { LandingUnifiedBrainCard } from '@/components/landing/LandingUnifiedBrainCard';
import { LandingIntroSection } from '@/components/landing/LandingIntroSection';

/**
 * Alternador de Modo do Card da 2ª Dobra:
 * - 'unified': Card Único Progressivo Estável com Trava e Mini-Cards Flutuantes (NOVO PADRÃO RECOMENDADO)
 * - 'legacy_journey': Modo anterior com múltiplos cards alternando (LandingBrainJourneyCards)
 */
export const BRAIN_HERO_CARD_MODE: 'unified' | 'legacy_journey' = 'unified';

const HippocampusDissectionScene = dynamic(
  () => import('@/components/HippocampusDissectionScene'),
  { ssr: false }
);

const initialProgress = { scrollProgress: 0, entryProgress: 1 };
const scrollSettledDelay = 180;

export interface LandingBrainHeroProps {
  onOpenAuth?: (mode?: 'login' | 'register', planTitle?: string) => void;
  onScrollToSection?: (sectionId: string) => void;
  onNavigateToPlatformTab?: (tab: 'questoes' | 'flashcards' | 'resumos' | 'desempenho') => void;
}

export const LandingBrainHero: React.FC<LandingBrainHeroProps> = ({
  onOpenAuth,
  onScrollToSection,
  onNavigateToPlatformTab
}) => {
  const { accent, mode, accentConfig } = useTheme();
  const isDark = mode === 'dark';
  const isMonochrome = accent === 'neutral';
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pillarsStageRef = useRef<HTMLDivElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const brainStageRef = useRef<HTMLDivElement | null>(null);
  const cardsPanelRef = useRef<HTMLDivElement | null>(null);
  const ambientGlowRef = useRef<HTMLDivElement | null>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement | null>(null);

  const [scenePhase, setScenePhase] = useState<'idle' | 'preparing' | 'mounting' | 'settled'>('mounting');
  const preparedModel = useRef<LandingBrainDownload | null>(null);
  const getPreparedModel = useCallback(() => preparedModel.current, []);
  const clearPreparedModel = useCallback(() => {
    preparedModel.current?.abort();
    preparedModel.current = null;
  }, []);
  const settleScene = useCallback(() => {
    clearPreparedModel();
    setScenePhase('settled');
  }, [clearPreparedModel]);

  const scrollProgressRef = useRef(initialProgress.scrollProgress);
  const entryProgressRef = useRef(initialProgress.entryProgress);
  const [journeyFrame, setJourneyFrame] = useState(-1);
  const journeyFrameRef = useRef(-1);
  const [activeAct, setActiveAct] = useState(0);
  const activeActRef = useRef(0);
  const [cardsVisible, setCardsVisible] = useState(false);

  const trackMetricsRef = useRef({ top: 0, height: 7920 });
  const measureTrack = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    trackMetricsRef.current = {
      top: rect.top + scrollTop,
      height: rect.height || el.offsetHeight || 7920
    };
  }, []);

  const updateScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return false;
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const trackTop = trackMetricsRef.current.top;
    let trackHeight = trackMetricsRef.current.height;
    if (!trackHeight) {
      trackHeight = el.offsetHeight || 7920;
      trackMetricsRef.current.height = trackHeight;
    }
    const winH = window.innerHeight || 800;
    const scrollable = Math.max(trackHeight - winH, 1);
    const rawProgress = Math.max(0, Math.min(1, (scrollY - trackTop) / scrollable));

    // Otimização de GPU/CPU: se o usuário já ultrapassou toda a extensão da seção 3D (+200px), não reprocessar estilos
    if (rawProgress >= 1 && scrollY > trackTop + trackHeight + 200 && scrollProgressRef.current >= 1) {
      return false;
    }

    // Mapeamento contínuo das dobras:
    // 0.00 -> 0.12: Dobra 1 (Os 4 Pilares da Aprovação - Carrossel com cérebro centralizado no fundo)
    // 0.05 -> 0.18: Transição da Dobra 1 para a Dobra 2 (Cérebro migra suavemente para a DIREITA)
    // 0.18 -> 0.36: Dobra 2 (Mensagem "Daqui a um mês..." à ESQUERDA e cérebro à DIREITA)
    // 0.36 -> 0.50: Transição da Dobra 2 para a Dobra 3 (Cérebro migra para a ESQUERDA e card entra na DIREITA)
    // 0.46 -> 1.00: Dobra 3 (Dissecção Clínica dos 3 Atos com retenção confortável: Córtex -> Papez -> Hipocampo)

    const pillarsFade = smootherstep(0.02, 0.12, rawProgress);
    const pillarsOpacity = 1 - pillarsFade;
    const pillarsY = -28 * pillarsFade;

    const toDobra2 = smootherstep(0.05, 0.18, rawProgress);
    const toDobra3 = smootherstep(0.36, 0.50, rawProgress);

    // O CÉREBRO:
    // Dobra 1: 0px (centro exato)
    // Dobra 2: +285px (DIREITA)
    // Dobra 3: -120px (ESQUERDA equilibrada próxima ao centro, sem afastar excessivamente do card)
    const brainDesktopX = (285 * toDobra2) - (405 * toDobra3);
    const brainInitialFade = 0.40 + 0.60 * toDobra2;
    const brainScale = (1.15 - 0.15 * toDobra2) * (1.0 - 0.04 * toDobra3);

    // O GLOW AMBIENTE:
    // Dobra 1: 50% (centro)
    // Dobra 2: 68% (atrás do cérebro à direita)
    // Dobra 3: 36% (atrás do cérebro à esquerda, harmonizado com o cérebro em -120px)
    const glowLeftDesktop = 50 + 18 * toDobra2 - 32 * toDobra3;

    // A MENSAGEM DA DOBRA 2 ("Daqui a um mês..."):
    const heroFadeIn = smootherstep(0.12, 0.22, rawProgress);
    const heroFadeOut = smootherstep(0.32, 0.42, rawProgress);
    const heroOpacity = heroFadeIn * (1 - heroFadeOut);
    const heroY = (1 - heroFadeIn) * 20 - 18 * heroFadeOut;

    // OS CARDS DA DOBRA 3:
    const cardsOpacity = smootherstep(0.44, 0.52, rawProgress);
    const shouldShowCards = cardsOpacity > 0.05;
    if (cardsVisible !== shouldShowCards) {
      setCardsVisible(shouldShowCards);
    }

    // PROGRESSO DA JORNADA ANATÔMICA (mapeado de 0.46 a 1.00):
    const dissectionProgress = Math.max(0, Math.min(1, (rawProgress - 0.46) / 0.54));

    if (dissectionProgress !== scrollProgressRef.current) {
      const frame = getBrainJourneyFrame(dissectionProgress, journeyFrameRef.current);
      if (frame !== journeyFrameRef.current) {
        journeyFrameRef.current = frame;
        setJourneyFrame(frame);
      }

      // Histerese de scroll para os 3 atos anatômicos com travamento e retenção deliberados:
      const currentAct = activeActRef.current;
      let nextAct = currentAct;
      if (currentAct === 0 && dissectionProgress >= 0.36) {
        nextAct = 1;
      } else if (currentAct === 1) {
        if (dissectionProgress >= 0.68) nextAct = 2;
        else if (dissectionProgress < 0.32) nextAct = 0;
      } else if (currentAct === 2) {
        if (dissectionProgress < 0.64) nextAct = 1;
      }
      if (nextAct !== currentAct) {
        activeActRef.current = nextAct;
        setActiveAct(nextAct);
      }

      scrollProgressRef.current = dissectionProgress;
    }

    const pillarsStage = pillarsStageRef.current;
    if (pillarsStage) {
      pillarsStage.style.opacity = pillarsOpacity.toFixed(3);
      pillarsStage.style.transform = `translate3d(0, ${pillarsY.toFixed(1)}px, 0)`;
      pillarsStage.style.pointerEvents = pillarsOpacity > 0.35 ? 'auto' : 'none';
      pillarsStage.setAttribute('aria-hidden', String(pillarsOpacity < 0.05));
    }

    const intro = introRef.current;
    if (intro) {
      intro.style.opacity = heroOpacity.toFixed(3);
      intro.style.transform = `translate3d(0, ${heroY.toFixed(1)}px, 0)`;
      intro.style.pointerEvents = heroOpacity > 0.35 ? 'auto' : 'none';
      intro.setAttribute('aria-hidden', String(heroOpacity < 0.05));
    }

    const finalExitFade = smootherstep(0.92, 1.00, rawProgress);
    const heroExitMultiplier = 1 - finalExitFade;

    const brainStage = brainStageRef.current;
    if (brainStage) {
      brainStage.style.opacity = (brainInitialFade * heroExitMultiplier).toFixed(3);
      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
      const x = isDesktop ? brainDesktopX.toFixed(1) : '0';
      const mobileShiftY = isDesktop ? 0 : -22 * toDobra3;
      brainStage.style.transform = `translate3d(${x}px, ${mobileShiftY.toFixed(1)}%, 0) scale(${brainScale.toFixed(3)})`;
    }

    const cardsPanel = cardsPanelRef.current;
    if (cardsPanel) {
      const currentOpacity = cardsOpacity * heroExitMultiplier;
      cardsPanel.style.opacity = currentOpacity.toFixed(3);
      cardsPanel.style.pointerEvents = currentOpacity > 0.35 ? 'auto' : 'none';
    }

    const ambientGlow = ambientGlowRef.current;
    if (ambientGlow) {
      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
      const shiftVw = isDesktop ? (glowLeftDesktop - 50) : 0;
      ambientGlow.style.transform = `translate3d(calc(-50% + ${shiftVw.toFixed(1)}vw), -50%, 0)`;
      ambientGlow.style.opacity = ((isDark ? 0.45 : 0.28) * heroExitMultiplier).toFixed(3);
    }

    const scrollIndicator = scrollIndicatorRef.current;
    if (scrollIndicator) {
      // Exibição sutil durante as dobras 2 e 3, esvaecendo antes da transição da próxima seção
      const show = rawProgress >= 0.20 && rawProgress <= 0.94;
      const indOpacity = show
        ? smootherstep(0.20, 0.26, rawProgress) * (1 - smootherstep(0.88, 0.94, rawProgress)) * 0.70
        : 0;
      scrollIndicator.style.opacity = indOpacity.toFixed(2);
      scrollIndicator.style.pointerEvents = indOpacity > 0.2 ? 'auto' : 'none';
    }

    return true;
  }, [cardsVisible]);

  useEffect(() => {
    measureTrack();
    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        updateScroll();
      });
    };
    onScroll();
    const onResize = () => {
      measureTrack();
      onScroll();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onScroll);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onScroll);
    };
  }, [updateScroll, measureTrack]);

  const headlineGradient = isMonochrome
    ? isDark
      ? 'linear-gradient(110deg, #fff 0%, #a1a1aa 28%, #fff 50%, #71717a 76%, #fff 100%)'
      : 'linear-gradient(110deg, #09090b 0%, #3f3f46 28%, #18181b 50%, #52525b 76%, #09090b 100%)'
    : `linear-gradient(110deg, ${accentConfig.primaryHex} 0%, ${accentConfig.chartPalette[1] ?? accentConfig.hoverHex} 26%, ${isDark ? '#e0f2fe' : accentConfig.hoverHex
    } 48%, ${accentConfig.chartPalette[2] ?? accentConfig.accuracyAccent.hex} 68%, ${accentConfig.primaryHex} 100%)`;

  return (
    <section
      aria-label="Hero Principal e Jornada Neuroanatômica Hippocampus"
      style={{
        '--journey-accent': isMonochrome ? (isDark ? '#f4f4f5' : '#18181b') : accentConfig.primaryHex,
        '--journey-text-gradient': headlineGradient,
        '--journey-final-line': `${accentConfig.primaryHex}66`,
        '--journey-final-shadow': isDark
          ? `0 0 45px -8px ${accentConfig.primaryHex}44, 0 24px 50px rgba(0,0,0,0.85)`
          : `0 0 38px -10px ${accentConfig.primaryHex}35, 0 20px 45px rgba(15,23,42,0.14)`
      } as React.CSSProperties}
      className="font-inter relative w-full bg-zinc-50 dark:bg-[var(--bg-page)] transition-colors duration-300"
    >
      <div ref={trackRef} className="relative h-[290svh] sm:h-[420svh] lg:h-[680svh] w-full">
        <div className="sticky top-16 h-[calc(100svh-4rem)] min-h-[420px] w-full overflow-hidden flex flex-col justify-between">
          {/* Luz ambiente radial dinâmica que acompanha suavemente o cérebro (centro -> direita -> esquerda) */}
          <div
            ref={ambientGlowRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[28%] lg:top-[48%] -translate-x-1/2 -translate-y-1/2 w-[520px] sm:w-[760px] lg:w-[880px] h-[360px] sm:h-[460px] rounded-full transition-[background,opacity] duration-300 will-change-transform"
            style={{
              background: isMonochrome
                ? isDark
                  ? 'radial-gradient(ellipse at center, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 42%, transparent 72%)'
                  : 'radial-gradient(ellipse at center, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 42%, transparent 72%)'
                : isDark
                  ? `radial-gradient(ellipse at center, ${accentConfig.primaryHex}44 0%, ${accentConfig.primaryHex}18 42%, transparent 72%)`
                  : `radial-gradient(ellipse at center, ${accentConfig.primaryHex}28 0%, ${accentConfig.primaryHex}10 44%, transparent 72%)`,
              transform: 'translate3d(-50%, -50%, 0)',
              opacity: isDark ? 0.45 : 0.28
            }}
          />

          {/* PALCO CENTRAL UNIFICADO */}
          <div className="relative flex-1 w-full max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center justify-center">
            {/* 0. PRIMEIRA DOBRA: Os 4 Pilares da Aprovação (Carrossel com cérebro centralizado ao fundo) */}
            <div
              ref={pillarsStageRef}
              className="absolute inset-0 z-20 flex flex-col justify-between will-change-[transform,opacity]"
            >
              <LandingIntroSection
                onOpenAuth={onOpenAuth ?? (() => { })}
                onScrollToSection={onScrollToSection ?? (() => { })}
                embeddedMode={true}
              />
            </div>

            {/* 1. SEGUNDA DOBRA: Mensagem à esquerda (Cérebro à direita) */}
            <div
              ref={introRef}
              style={{ opacity: 0, pointerEvents: 'none' }}
              className="absolute inset-x-4 top-[8%] z-10 text-left sm:inset-x-6 lg:left-6 xl:left-12 lg:right-auto lg:top-1/2 lg:w-[46%] lg:-translate-y-1/2 will-change-[transform,opacity]"
            >
              <h2 className="max-w-xl text-balance text-[28px] leading-[1.1] font-black tracking-[-0.035em] sm:text-[38px] md:text-[42px] xl:text-[48px]">
                <span className="text-zinc-950 dark:text-white">Daqui a um mês, você ainda vai lembrar </span>
                <span className="animate-hippo-text-sweep bg-[image:var(--journey-text-gradient)] bg-clip-text text-transparent">
                  o que estudou hoje?
                </span>
              </h2>
            </div>

            {/* 2. PALCO 3D DO CÉREBRO (z-10: centro na 1ª dobra -> direita na 2ª -> esquerda na 3ª) */}
            <div
              ref={brainStageRef}
              style={{ transform: 'translate3d(0, 0, 0) scale(1)' }}
              className="absolute top-[26%] z-10 flex h-[46%] w-full max-w-[620px] items-center justify-center motion-reduce:transition-none lg:relative lg:top-auto lg:h-[76svh] lg:w-[670px] lg:max-w-[670px] will-change-transform"
            >
              <HippocampusDissectionScene
                scrollProgressRef={scrollProgressRef}
                isDark={isDark}
                accentConfig={accentConfig}
                getPreparedModel={getPreparedModel}
                onLoaded={settleScene}
                onUnavailable={settleScene}
              />
            </div>

            {/* 3. TERCEIRA DOBRA: Card Unificado da Jornada Clínica à direita (com margens laterais harmônicas) */}
            <div
              ref={cardsPanelRef}
              style={{ opacity: 0, pointerEvents: 'none' }}
              className="absolute inset-x-4 bottom-3 z-30 mx-auto grid min-w-0 max-w-xl items-center sm:inset-x-6 lg:bottom-auto lg:left-auto lg:right-16 xl:right-24 lg:top-1/2 lg:w-[435px] lg:-translate-y-1/2 xl:w-[465px]"
            >
              {BRAIN_HERO_CARD_MODE === 'unified' ? (
                <LandingUnifiedBrainCard
                  frame={journeyFrame}
                  onOpenAuth={onOpenAuth}
                  onScrollToSection={onScrollToSection}
                  onNavigateToTab={onNavigateToPlatformTab}
                />
              ) : (
                <LandingBrainJourneyCards frame={journeyFrame} />
              )}
            </div>
          </div>

          {/* Indicador de rolagem nas dobras subsequentes (Apenas as 2 setinhas empilhadas, sem texto) */}
          <div
            ref={scrollIndicatorRef}
            aria-hidden="true"
            style={{ opacity: 0, pointerEvents: 'none' }}
            className="absolute bottom-2.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none will-change-opacity"
          >
            <ChevronDown className="w-4 h-4 text-zinc-400 dark:text-zinc-500 animate-bounce" />
            <ChevronDown className="w-4 h-4 -mt-2.5 text-zinc-400/60 dark:text-zinc-500/60 animate-bounce [animation-delay:150ms]" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingBrainHero;
