'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const MIN_REVEAL_MS = 1250;
const REDUCED_MOTION_MS = 220;
const MAX_WAIT_MS = 2000;
const FADE_OUT_MS = 380;

/**
 * Roteador da Splash Screen Global do Hippocampus:
 * - Na Landing Page (`/`): preserva a Splash Screen inicial canônica.
 * - Nas rotas internas da plataforma: utiliza a cápsula em Glassmorphism Óptico com sincronização em GPU.
 */
export const HippocampusGlobalSplash: React.FC = () => {
  const pathname = usePathname();

  if (pathname === '/') {
    return <HippocampusLandingOriginalSplash />;
  }

  return <HippocampusPlatformSplash />;
};

/**
 * Splash Screen Inicial Canônica da Landing Page (estado original).
 */
const HippocampusLandingOriginalSplash: React.FC = () => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 3400);

    const destroyTimer = setTimeout(() => {
      setIsDestroyed(true);
    }, 3800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(destroyTimer);
    };
  }, []);

  if (isDestroyed) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#09090b] text-white select-none transition-opacity duration-350 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="status"
      aria-label="Carregando Hippocampus"
    >
      <style>{`
        :root {
          --hippo-shift: 105px;
        }

        @media (max-width: 640px) {
          :root {
            --hippo-shift: 85px;
          }
        }

        @keyframes splashOuterDraw {
          0% {
            stroke-dashoffset: 4157;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes splashInnerDraw {
          0% {
            stroke-dashoffset: -2217;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes splashShiftLeft {
          0% {
            transform: translate3d(var(--hippo-shift), 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes splashWipeAcross {
          0% {
            -webkit-mask-position: -360px 0;
            mask-position: -360px 0;
          }
          100% {
            -webkit-mask-position: 0px 0;
            mask-position: 0px 0;
          }
        }

        @keyframes splashTextSlip {
          0% {
            transform: translate3d(-18px, 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        .hippo-splash-path-outer {
          stroke-dasharray: 4157;
          stroke-dashoffset: 4157;
          will-change: stroke-dashoffset;
          shape-rendering: geometricPrecision;
          animation: splashOuterDraw 2.8s cubic-bezier(0.35, 0.0, 0.15, 1.0) forwards;
        }

        .hippo-splash-path-inner {
          stroke-dasharray: 2217;
          stroke-dashoffset: -2217;
          will-change: stroke-dashoffset;
          shape-rendering: geometricPrecision;
          animation: splashInnerDraw 2.6s cubic-bezier(0.35, 0.0, 0.15, 1.0) 0.12s forwards;
        }

        .hippo-splash-container {
          display: flex;
          align-items: center;
          position: relative;
          will-change: transform;
          animation: splashShiftLeft 1.2s cubic-bezier(0.35, 0.0, 0.25, 1.0) 2.0s forwards;
          transform: translate3d(var(--hippo-shift), 0, 0);
        }

        .hippo-splash-mask-wipe {
          -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,1) 0px, rgba(0,0,0,1) 320px, rgba(0,0,0,0) 360px);
          mask-image: linear-gradient(to right, rgba(0,0,0,1) 0px, rgba(0,0,0,1) 320px, rgba(0,0,0,0) 360px);
          -webkit-mask-size: 800px 100%;
          mask-size: 800px 100%;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-position: -360px 0;
          mask-position: -360px 0;
          will-change: mask-position, -webkit-mask-position;
          animation: splashWipeAcross 1.2s cubic-bezier(0.35, 0.0, 0.25, 1.0) 2.0s forwards;
        }

        .hippo-splash-text-slip {
          will-change: transform;
          animation: splashTextSlip 1.2s cubic-bezier(0.35, 0.0, 0.25, 1.0) 2.0s forwards;
          transform: translate3d(-18px, 0, 0);
        }
      `}</style>

      <div className="hippo-splash-container gap-[10px] sm:gap-[12px]">
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center' }}>
          <svg
            viewBox="185 210 1790 1500"
            style={{
              transform: 'translate3d(0, 0, 0)',
              backfaceVisibility: 'hidden'
            }}
            className="w-[64px] h-[54px] sm:w-[76px] sm:h-[63px] shrink-0"
            shapeRendering="geometricPrecision"
            aria-hidden="true"
          >
            <path
              className="hippo-splash-path-outer"
              fill="none"
              stroke="#ffffff"
              strokeWidth={132}
              strokeMiterlimit={10}
              strokeLinecap="butt"
              shapeRendering="geometricPrecision"
              d="M 1270.756 1336.094 C 1270.756 1971.842 2360.998 1072.751 1670.993 488.16 C 1357.793 222.808 675.35 161.911 362.047 674.876 C 362.047 674.876 184.287 959.785 298.333 1070.475 C 422.801 1191.281 673.215 1042.009 854.033 1157.092"
            />
            <path
              className="hippo-splash-path-inner"
              fill="none"
              stroke="#ffffff"
              strokeWidth={132}
              strokeMiterlimit={10}
              strokeLinecap="butt"
              shapeRendering="geometricPrecision"
              d="M 718.74 906.921 C 882.704 405.986 1702.884 702.375 1543.416 1022.75 C 1373.738 1363.638 1050.008 860.221 842.727 1632.282"
            />
          </svg>
        </div>

        <div className="hippo-splash-mask-wipe" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hippo-splash-text-slip flex flex-col">
            <span
              className="font-black text-2xl sm:text-4xl text-white tracking-[-0.035em] leading-none"
              style={{ fontFamily: 'var(--font-inter), Inter, system-ui, -apple-system, sans-serif' }}
            >
              Hippocampus
            </span>
            <span
              className="text-[7.5px] sm:text-[10px] uppercase text-zinc-300 whitespace-nowrap leading-none mt-1.5 sm:mt-2"
              style={{
                fontFamily: 'var(--font-inter), Inter, system-ui, -apple-system, sans-serif',
                fontWeight: 200,
                letterSpacing: '0.16em'
              }}
            >
              QUESTÕES DE RESIDÊNCIA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const HippocampusPlatformSplash: React.FC = () => {
  const { isLoading: isAuthLoading } = useAuth();
  const [isReadyState, setIsReadyState] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [isDestroyed, setIsDestroyed] = useState<boolean>(false);

  const dismissedRef = useRef<boolean>(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destroyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerDismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setIsReadyState(true);

    fadeTimerRef.current = setTimeout(() => {
      setIsFadingOut(true);
      destroyTimerRef.current = setTimeout(() => {
        setIsDestroyed(true);
      }, FADE_OUT_MS + 40);
    }, 120);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || isDestroyed) return;

    dismissedRef.current = false;

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const targetMinMs = prefersReducedMotion ? REDUCED_MOTION_MS : MIN_REVEAL_MS;
    const elapsed = performance.now();
    const remainingMinMs = Math.max(0, targetMinMs - elapsed);
    const remainingMaxMs = Math.max(0, MAX_WAIT_MS - elapsed);

    const ceilingTimer = setTimeout(() => {
      triggerDismiss();
    }, remainingMaxMs);

    let readyTimer: ReturnType<typeof setTimeout> | null = null;
    if (!isAuthLoading) {
      readyTimer = setTimeout(() => {
        triggerDismiss();
      }, remainingMinMs);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        triggerDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(ceilingTimer);
      if (readyTimer) clearTimeout(readyTimer);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (destroyTimerRef.current) clearTimeout(destroyTimerRef.current);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthLoading, isDestroyed, triggerDismiss]);

  if (isDestroyed) {
    return null;
  }

  return (
    <div
      onClick={triggerDismiss}
      className={`hippo-glass-overlay backdrop-blur-xl backdrop-saturate-150 fixed inset-0 z-[99999] flex flex-col items-center justify-center px-4 select-none ${
        isFadingOut ? 'pointer-events-none' : 'cursor-default'
      }`}
      style={{
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.018) translate3d(0, 0, 0)' : 'scale(1) translate3d(0, 0, 0)',
        WebkitBackdropFilter: 'blur(18px) saturate(175%)',
        backdropFilter: 'blur(18px) saturate(175%)',
        transition: `opacity ${FADE_OUT_MS}ms cubic-bezier(0.22, 1, 0.36, 1), transform ${FADE_OUT_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        willChange: 'opacity, transform'
      }}
      role="status"
      aria-live="polite"
      aria-label="Carregando Hippocampus"
    >
      <style>{`
        :root {
          --hippo-shift: 94px;
        }

        @media (max-width: 640px) {
          :root {
            --hippo-shift: 76px;
          }
        }

        @keyframes hippoGlassOuterDraw {
          0% { stroke-dashoffset: 1; }
          100% { stroke-dashoffset: 0; }
        }

        @keyframes hippoGlassInnerDraw {
          0% { stroke-dashoffset: -1; }
          100% { stroke-dashoffset: 0; }
        }

        @keyframes hippoGlassShiftLeft {
          0% { transform: translate3d(var(--hippo-shift), 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }

        @keyframes hippoGlassWordReveal {
          0% {
            clip-path: inset(-14px 100% -14px 0);
            transform: translate3d(-10px, 0, 0);
            opacity: 0.25;
          }
          100% {
            clip-path: inset(-14px -14px -14px 0);
            transform: translate3d(0, 0, 0);
            opacity: 1;
          }
        }

        @keyframes hippoGlassSheen {
          0% {
            transform: translate3d(-140%, 0, 0) skewX(-22deg);
            opacity: 0;
          }
          25% {
            opacity: 1;
          }
          100% {
            transform: translate3d(260%, 0, 0) skewX(-22deg);
            opacity: 0;
          }
        }

        @keyframes hippoCapsuleEnter {
          0% {
            opacity: 0;
            transform: scale(0.965) translate3d(0, 8px, 0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translate3d(0, 0, 0);
          }
        }

        @keyframes hippoGpuProgress {
          0% { transform: scaleX(0.08); }
          65% { transform: scaleX(0.78); }
          100% { transform: scaleX(0.92); }
        }

        .hippo-splash-capsule-enter {
          animation: hippoCapsuleEnter 0.36s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          will-change: transform, opacity;
        }

        .hippo-splash-path-outer {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          will-change: stroke-dashoffset;
          animation: hippoGlassOuterDraw 0.72s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .hippo-splash-path-inner {
          stroke-dasharray: 1;
          stroke-dashoffset: -1;
          will-change: stroke-dashoffset;
          animation: hippoGlassInnerDraw 0.66s cubic-bezier(0.22, 1, 0.36, 1) 0.05s forwards;
        }

        .hippo-splash-lockup {
          display: flex;
          align-items: center;
          position: relative;
          will-change: transform;
          transform: translate3d(var(--hippo-shift), 0, 0);
          animation: hippoGlassShiftLeft 0.56s cubic-bezier(0.22, 1, 0.36, 1) 0.36s forwards;
        }

        .hippo-splash-word-reveal {
          clip-path: inset(-14px 100% -14px 0);
          transform: translate3d(-10px, 0, 0);
          opacity: 0.25;
          will-change: clip-path, transform, opacity;
          animation: hippoGlassWordReveal 0.56s cubic-bezier(0.22, 1, 0.36, 1) 0.36s forwards;
        }

        .hippo-splash-sheen-beam {
          animation: hippoGlassSheen 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.12s forwards;
          will-change: transform, opacity;
        }

        .hippo-gpu-progress-fill {
          transform-origin: left center;
          will-change: transform;
          animation: hippoGpuProgress 1.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .hippo-gpu-progress-fill.is-complete {
          animation: none;
          transform: scaleX(1);
          transition: transform 140ms cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>

      {/* Halo cromático difuso atrás do vidro, fiel ao acento ativo do estudante */}
      <div
        className="pointer-events-none absolute w-72 h-72 sm:w-[420px] sm:h-[420px] rounded-full blur-[110px] opacity-20 dark:opacity-25"
        style={{ backgroundColor: 'var(--primary-color, #2563eb)' }}
        aria-hidden="true"
      />

      {/* Cápsula Central em Vidro Jateado (Frosted Crystal Glass) */}
      <div
        className="hippo-glass-capsule hippo-splash-capsule-enter backdrop-blur-2xl backdrop-saturate-150 relative overflow-hidden rounded-3xl px-8 py-7 sm:px-12 sm:py-9 w-full max-w-[360px] sm:max-w-[460px] flex flex-col items-center"
        style={{
          WebkitBackdropFilter: 'blur(28px) saturate(190%)',
          backdropFilter: 'blur(28px) saturate(190%)'
        }}
      >
        {/* Reflexo especular superior do vidro */}
        <div
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/35 to-transparent"
          aria-hidden="true"
        />

        {/* Feixe diagonal translúcido de refração */}
        <div
          className="hippo-splash-sheen-beam pointer-events-none absolute -inset-y-8 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 dark:via-white/[0.09] to-transparent"
          aria-hidden="true"
        />

        {/* Lockup Oficial: Símbolo + Marca emergindo da esquerda para a direita */}
        <div className="hippo-splash-lockup gap-[10px] sm:gap-[12px] text-zinc-950 dark:text-white py-1">
          <div className="relative z-10 flex items-center shrink-0">
            <svg
              viewBox="185 210 1790 1500"
              style={{
                transform: 'translate3d(0, 0, 0)',
                backfaceVisibility: 'hidden',
                filter: 'drop-shadow(0 4px 16px var(--glow-color, rgba(37, 99, 235, 0.22)))'
              }}
              className="w-[56px] h-[47px] sm:w-[68px] sm:h-[57px] shrink-0"
              aria-hidden="true"
            >
              <path
                className="hippo-splash-path-outer"
                pathLength={1}
                fill="none"
                stroke="currentColor"
                strokeWidth={132}
                strokeMiterlimit={10}
                strokeLinecap="butt"
                d="M 1270.756 1336.094 C 1270.756 1971.842 2360.998 1072.751 1670.993 488.16 C 1357.793 222.808 675.35 161.911 362.047 674.876 C 362.047 674.876 184.287 959.785 298.333 1070.475 C 422.801 1191.281 673.215 1042.009 854.033 1157.092"
              />
              <path
                className="hippo-splash-path-inner"
                pathLength={1}
                fill="none"
                stroke="currentColor"
                strokeWidth={132}
                strokeMiterlimit={10}
                strokeLinecap="butt"
                d="M 718.74 906.921 C 882.704 405.986 1702.884 702.375 1543.416 1022.75 C 1373.738 1363.638 1050.008 860.221 842.727 1632.282"
              />
            </svg>
          </div>

          <div className="hippo-splash-word-reveal relative z-[1] flex flex-col">
            <span
              className="font-black text-2xl sm:text-[34px] text-zinc-950 dark:text-white tracking-[-0.035em] leading-none"
              style={{ fontFamily: 'var(--font-inter), Inter, system-ui, -apple-system, sans-serif' }}
            >
              Hippocampus
            </span>
            <span
              className="text-[7.5px] sm:text-[9.5px] uppercase text-zinc-600 dark:text-zinc-300 whitespace-nowrap leading-none mt-1.5"
              style={{
                fontFamily: 'var(--font-inter), Inter, system-ui, -apple-system, sans-serif',
                fontWeight: 500,
                letterSpacing: '0.16em'
              }}
            >
              QUESTÕES DE RESIDÊNCIA
            </span>
          </div>
        </div>

        {/* Barra Luminosa 100% GPU sobre Vidro (fluida desde t = 0ms antes da hidratação) */}
        <div className="w-full mt-6 pt-4 border-t border-zinc-950/[0.06] dark:border-white/[0.08] space-y-2">
          <div className="relative h-1.5 w-full rounded-full overflow-hidden bg-zinc-950/[0.08] dark:bg-white/[0.10]">
            <div
              className={`hippo-gpu-progress-fill h-full w-full rounded-full ${
                isReadyState ? 'is-complete' : ''
              }`}
              style={{
                backgroundColor: 'var(--primary-color, #2563eb)',
                boxShadow: '0 0 12px var(--glow-color, rgba(37, 99, 235, 0.45))'
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[10.5px] font-medium text-zinc-600 dark:text-zinc-400">
            <span className="truncate">
              {isReadyState ? 'Ambiente pronto' : 'Preparando ambiente clínico...'}
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-zinc-700 dark:text-zinc-300">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--primary-color, #2563eb)' }}
              />
              {isReadyState ? '100%' : 'Ativo'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HippocampusGlobalSplash;
