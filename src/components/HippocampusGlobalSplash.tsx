'use client';

import { useEffect, useRef, useState } from 'react';

export function HippocampusGlobalSplash() {
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const observer = new MutationObserver(exitWhenReady);

    function exitWhenReady() {
      const pending = document.querySelectorAll('[data-hippo-startup-pending]');
      if (Array.from(pending).some((element) => element.getClientRects().length > 0)) {
        return;
      }

      observer.disconnect();
      setIsExiting(true);
    }

    const fallbackTimer = setTimeout(() => {
      if (!cancelled) {
        observer.disconnect();
        setIsExiting(true);
      }
    }, 2200);

    const wordmarkAnimations = wordmarkRef.current?.getAnimations() ?? [];
    void Promise.allSettled(wordmarkAnimations.map((animation) => animation.finished)).then(() => {
      if (cancelled) return;

      observer.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['data-hippo-startup-pending', 'hidden', 'style'],
      });
      exitWhenReady();
    });

    return () => {
      cancelled = true;
      clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className="hippo-opening-splash fixed inset-0 z-[99999] flex select-none items-center justify-center overflow-hidden bg-[#09090b] text-white"
      data-exiting={isExiting}
      aria-hidden="true"
    >
      <noscript><style>{'.hippo-opening-splash { display: none; }'}</style></noscript>
      <style>{`
        .hippo-opening-splash {
          --hippo-opening-fade: 240ms;
          transition:
            opacity var(--hippo-opening-fade) ease-in-out,
            visibility 0s linear var(--hippo-opening-fade);
        }

        .hippo-opening-splash[data-exiting='true'] {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        .hippo-opening-brand {
          --hippo-opening-symbol-width: 64px;
          --hippo-opening-draw-duration: 1450ms;
          --hippo-opening-slide: 450ms cubic-bezier(0.4, 0, 0.2, 1) var(--hippo-opening-draw-duration) both;
          animation: hippo-opening-center var(--hippo-opening-slide);
        }

        .hippo-opening-symbol {
          width: var(--hippo-opening-symbol-width);
        }

        .hippo-opening-stroke {
          stroke-dasharray: 1 1;
          animation: hippo-opening-draw var(--hippo-opening-draw-duration) cubic-bezier(0.4, 0, 0.6, 1) both;
        }

        .hippo-opening-stroke-inner {
          --hippo-opening-inner-delay: 100ms;
          animation-duration: calc(var(--hippo-opening-draw-duration) - var(--hippo-opening-inner-delay));
          animation-delay: var(--hippo-opening-inner-delay);
        }

        .hippo-opening-wordmark {
          animation: hippo-opening-reveal var(--hippo-opening-slide);
        }

        @media (min-width: 640px) {
          .hippo-opening-brand { --hippo-opening-symbol-width: 76px; }
        }

        @keyframes hippo-opening-draw {
          from { stroke-dashoffset: -1; }
          to { stroke-dashoffset: 0; }
        }

        @keyframes hippo-opening-center {
          from { transform: translate3d(calc((100% - var(--hippo-opening-symbol-width)) / 2), 0, 0); }
          to { transform: translate3d(0, 0, 0); }
        }

        @keyframes hippo-opening-reveal {
          from { transform: translate3d(calc(-100% - 12px), 0, 0); }
          to { transform: translate3d(0, 0, 0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .hippo-opening-brand,
          .hippo-opening-stroke,
          .hippo-opening-wordmark { animation: none; }
          .hippo-opening-splash { --hippo-opening-fade: 0ms; }
        }
      `}</style>
      <div className="hippo-opening-brand flex items-center">
        <svg
          viewBox="185 210 1790 1500"
          className="hippo-opening-symbol relative z-10 h-[54px] shrink-0 sm:h-[63px]"
          fill="none"
          stroke="currentColor"
          strokeWidth={132}
          strokeMiterlimit={10}
          shapeRendering="geometricPrecision"
        >
          <path
            className="hippo-opening-stroke"
            pathLength={1}
            d="M854.033 1157.092 C673.215 1042.009 422.801 1191.281 298.333 1070.475 C184.287 959.785 362.047 674.876 362.047 674.876 C675.35 161.911 1357.793 222.808 1670.993 488.16 C2360.998 1072.751 1270.756 1971.842 1270.756 1336.094"
          />
          <path
            className="hippo-opening-stroke hippo-opening-stroke-inner"
            pathLength={1}
            d="M718.74 906.921 C882.704 405.986 1702.884 702.375 1543.416 1022.75 C1373.738 1363.638 1050.008 860.221 842.727 1632.282"
          />
        </svg>
        <div className="-ml-0.5 overflow-hidden py-1 pl-2.5 pr-2 sm:pl-3">
          <div ref={wordmarkRef} className="hippo-opening-wordmark flex flex-col">
            <span className="text-2xl leading-none font-black tracking-[-0.035em] sm:text-4xl">
              Hippocampus
            </span>
            <span className="mt-1.5 text-[7.5px] leading-none font-extralight tracking-[0.16em] text-zinc-300 whitespace-nowrap sm:mt-2 sm:text-[10px]">
              QUESTÕES DE RESIDÊNCIA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
