'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';

export const LandingSectionVisibleContext = createContext(true);

// Despachante global unificado em RAF (Zero duplicação de listeners e 60 FPS garantidos)
const activeRevealCallbacks = new Set<() => void>();
let sharedRafId = 0;

function notifyActiveReveals() {
  if (sharedRafId) return;
  sharedRafId = requestAnimationFrame(() => {
    sharedRafId = 0;
    activeRevealCallbacks.forEach((cb) => cb());
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', notifyActiveReveals, { passive: true });
  window.addEventListener('resize', notifyActiveReveals, { passive: true });
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  thresholdOrOptions: number | { threshold?: number; rootMargin?: string } = 0.05,
  defaultRootMargin = '0px 0px -60px 0px'
) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const isNear = useContext(LandingSectionVisibleContext);

  useEffect(() => {
    if (!isNear) {
      setIsVisible(false);
      setIsExiting(false);
      const el = ref.current;
      if (el) {
        el.classList.remove('is-visible', 'is-exiting');
      }
      return;
    }

    const el = ref.current;
    if (!el) return;

    if (
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      const frame = requestAnimationFrame(() => {
        setIsVisible(true);
        setIsExiting(false);
        el.classList.add('is-visible');
        el.classList.remove('is-exiting');
      });
      return () => cancelAnimationFrame(frame);
    }

    const checkVisibilityAndExit = () => {
      const target = ref.current;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const winH = window.innerHeight || document.documentElement.clientHeight || 800;

      // 1. Visibilidade de Entrada (Bottom boundary):
      // Entra suavemente quando o topo chega a (winH - 50px)
      const enteredBottom = rect.top < (winH - 50);

      // 2. Limite Superior de Saída (Top boundary):
      // Sai quando o fundo do elemento já passou do topo (-40px)
      const fullyLeftTop = rect.bottom < -40;

      const visible = enteredBottom && !fullyLeftTop;

      // 3. Zona de Esvaecimento de Saída (Cross-Fade Exit Zone):
      // Quando o fundo do elemento cruza os 38% superiores da tela, a dobra esvaece
      // enquanto a dobra seguinte sobe pelo rodapé em sentido contrário
      const exiting = visible && (rect.bottom < winH * 0.38);

      setIsVisible(visible);
      setIsExiting(exiting);

      target.classList.toggle('is-visible', visible);
      target.classList.toggle('is-exiting', exiting);
    };

    activeRevealCallbacks.add(checkVisibilityAndExit);
    // Verificação inicial
    checkVisibilityAndExit();

    return () => {
      activeRevealCallbacks.delete(checkVisibilityAndExit);
    };
  }, [isNear]);

  return { ref, isVisible, isExiting };
}

export function useAnimatedCounter(target: number, isActive: boolean, durationMs = 1300): number {
  const [value, setValue] = useState<number>(0);
  const hasAnimatedRef = useRef(false);
  const isNear = useContext(LandingSectionVisibleContext);

  useEffect(() => {
    if (!isNear) return;
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      setValue(target);
      return;
    }

    if (!isActive || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    let rafId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, isActive, durationMs, isNear]);

  return value;
}

export function useHeroParallaxOffset(): number {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = Math.min(window.scrollY, 600);
          setOffsetY(y);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return offsetY;
}
