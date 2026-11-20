'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';

export const LandingSectionVisibleContext = createContext(true);

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.14) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isNear = useContext(LandingSectionVisibleContext);

  useEffect(() => {
    if (!isNear || isVisible) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const frame = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isNear, isVisible, threshold]);

  return { ref, isVisible };
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
