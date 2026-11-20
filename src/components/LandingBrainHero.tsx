'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/context/ThemeContext';
import { HippocampusLoading } from '@/components/HippocampusLoading';
import { smootherstep } from '@/utils/smootherstep';
import { getBrainJourneyFrame, LandingBrainJourneyCards } from '@/components/landing/LandingBrainJourneyCards';

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

export const LandingBrainHero: React.FC = () => {
  const { accent, mode, accentConfig } = useTheme();
  const isDark = mode === 'dark';
  const isMonochrome = accent === 'neutral';
  const trackRef = useRef<HTMLDivElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const brainStageRef = useRef<HTMLDivElement | null>(null);
  const cardsPanelRef = useRef<HTMLDivElement | null>(null);
  const sceneRequested = useRef(false);
  const [showScene, setShowScene] = useState(false);
  const scrollProgressRef = useRef(initialProgress.scrollProgress);
  const entryProgressRef = useRef(initialProgress.entryProgress);
  const [journeyFrame, setJourneyFrame] = useState(-1);

  const updateScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const winH = window.innerHeight || 800;
    if (!sceneRequested.current && rect.bottom > 0 &&
      (rect.top < winH || (window.scrollY > 0 && rect.top < winH * 1.6))) {
      sceneRequested.current = true;
      setShowScene(true);
    }
    const scrollable = Math.max(rect.height - winH, 1);
    const entry = Math.max(0, Math.min(1, 1 - Math.max(0, rect.top) / winH));
    const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
    if (progress !== scrollProgressRef.current || entry !== entryProgressRef.current) {
      const frame = getBrainJourneyFrame(progress);
      if (frame !== getBrainJourneyFrame(scrollProgressRef.current)) {
        setJourneyFrame(frame);
      }
      scrollProgressRef.current = progress;
      entryProgressRef.current = entry;

      const entryFade = smootherstep(0.20, 0.82, entry);
      const heroFadeOut = smootherstep(0.02, 0.15, progress);
      const heroOpacity = entryFade * (1 - heroFadeOut);
      const heroY = (1 - entryFade) * 20 - 14 * heroFadeOut;
      const brainShift = smootherstep(0.02, 0.19, progress);
      const brainScale = 0.92 + 0.08 * smootherstep(0.18, 0.95, entry);
      const cardsOpacity = smootherstep(0.145, 0.19, progress);

      const intro = introRef.current;
      if (intro) {
        intro.style.opacity = heroOpacity.toFixed(3);
        intro.style.transform = `translate3d(0, ${heroY.toFixed(1)}px, 0) scale(${(1 - heroFadeOut * 0.035).toFixed(3)})`;
        intro.style.pointerEvents = heroOpacity > 0.35 ? 'auto' : 'none';
        intro.setAttribute('aria-hidden', String(heroOpacity < 0.05));
      }

      const brainStage = brainStageRef.current;
      if (brainStage) {
        brainStage.style.opacity = smootherstep(0.18, 0.88, entry).toFixed(3);
        brainStage.style.setProperty('--brain-desktop-x', `${(285 - 520 * brainShift).toFixed(1)}px`);
        brainStage.style.setProperty('--brain-mobile-top', (33 - 28 * brainShift).toFixed(1) + '%');
        brainStage.style.setProperty('--brain-scale', brainScale.toFixed(3));
      }

      const cardsPanel = cardsPanelRef.current;
      if (cardsPanel) {
        cardsPanel.style.opacity = cardsOpacity.toFixed(3);
        cardsPanel.style.pointerEvents = cardsOpacity > 0.35 ? 'auto' : 'none';
      }
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

  const headlineGradient = isMonochrome
    ? isDark
      ? 'linear-gradient(110deg, #fff 0%, #a1a1aa 28%, #fff 50%, #71717a 76%, #fff 100%)'
      : 'linear-gradient(110deg, #09090b 0%, #52525b 28%, #09090b 50%, #71717a 76%, #09090b 100%)'
    : `linear-gradient(110deg, ${accentConfig.primaryHex} 0%, ${accentConfig.chartPalette[1] ?? accentConfig.hoverHex} 26%, ${isDark ? '#e0f2fe' : '#fff'} 48%, ${accentConfig.chartPalette[2] ?? accentConfig.accuracyAccent.hex} 68%, ${accentConfig.primaryHex} 100%)`;

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
      className="font-inter relative w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-b from-white via-zinc-50/90 to-zinc-100/70 dark:from-[var(--bg-page)] dark:via-[var(--bg-page)] dark:to-[#070709]"
    >
      <div ref={trackRef} className="relative h-[560svh] w-full">
        <div className="sticky top-16 h-[calc(100svh-4rem)] min-h-[420px] w-full overflow-hidden flex flex-col justify-between">
          {/* Luz ambiente radial sutil */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/4 -translate-x-1/2 w-[560px] sm:w-[780px] h-[340px] rounded-full blur-[120px] opacity-12 dark:opacity-18 transition-colors duration-500"
            style={{ backgroundColor: accentConfig.primaryHex }}
          />

          {/* Palco Central Unificado */}
          <div className="relative flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center justify-center">
            <div
              ref={introRef}
              className="absolute inset-x-4 top-[8%] z-10 text-left sm:inset-x-6 lg:right-auto lg:top-1/2 lg:w-[46%] lg:-translate-y-1/2"
            >
              <h2 className="max-w-xl text-balance text-[28px] leading-[1.1] font-black tracking-[-0.035em] sm:text-[38px] md:text-[42px] xl:text-[48px]">
                <span className="text-zinc-900/60 dark:text-white/60">Daqui a um mês, você ainda vai lembrar </span>
                <span className="animate-hippo-text-sweep bg-[image:var(--journey-text-gradient)] bg-clip-text text-transparent">
                  o que estudou hoje?
                </span>
              </h2>
            </div>

            {/* 2. PALCO 3D DO CÉREBRO (z-20: esvaecimento e escala suave na transição entre dobras) */}
            <div
              ref={brainStageRef}
              style={{ transform: 'translate3d(var(--brain-x, 0px), 0, 0) scale(var(--brain-scale, 1))' }}
              className="absolute top-[var(--brain-mobile-top,33%)] z-20 flex h-[43%] w-full max-w-[600px] items-center justify-center transition-opacity duration-300 motion-reduce:transition-none lg:relative lg:top-auto lg:h-[74svh] lg:w-[650px] lg:max-w-[650px] lg:[--brain-x:var(--brain-desktop-x,285px)]"
            >
              {showScene && (
                <HippocampusDissectionScene
                  scrollProgressRef={scrollProgressRef}
                  isDark={isDark}
                  accentConfig={accentConfig}
                />
              )}
            </div>

            <div
              ref={cardsPanelRef}
              style={{ opacity: 0, pointerEvents: 'none' }}
              className="absolute inset-x-4 bottom-3 z-30 mx-auto grid min-w-0 max-w-xl items-center sm:inset-x-6 lg:bottom-auto lg:left-auto lg:right-6 lg:top-1/2 lg:w-[435px] lg:-translate-y-1/2 xl:w-[465px]"
            >
              <LandingBrainJourneyCards frame={journeyFrame} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingBrainHero;
