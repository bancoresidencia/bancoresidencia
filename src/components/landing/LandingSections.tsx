'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LandingSectionVisibleContext } from './useScrollReveal';

export function LandingSections({ children }: { children: ReactNode }) {
  const section = useRef<HTMLDivElement>(null);
  const [isNear, setIsNear] = useState(true);

  useEffect(() => {
    const element = section.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      const frame = requestAnimationFrame(() => setIsNear(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsNear(entry.isIntersecting);
    }, { rootMargin: '600px 0px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={section} className="flex flex-col">
      <LandingSectionVisibleContext.Provider value={isNear}>
        {children}
      </LandingSectionVisibleContext.Provider>
    </div>
  );
}
