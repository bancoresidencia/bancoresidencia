export function HippocampusGlobalSplash() {
  return (
    <div
      className="hippo-opening-splash fixed inset-0 z-[99999] flex select-none items-center justify-center overflow-hidden bg-[#09090b] text-white"
      aria-hidden="true"
    >
      <style>{`
        .hippo-opening-splash {
          --hippo-opening-hold: 960ms;
          --hippo-opening-fade: 240ms;
          animation:
            hippo-opening-exit var(--hippo-opening-fade) ease-in-out var(--hippo-opening-hold) both,
            hippo-opening-hide 0s linear calc(var(--hippo-opening-hold) + var(--hippo-opening-fade)) forwards;
        }

        .hippo-opening-brand {
          --hippo-opening-symbol-width: 64px;
          --hippo-opening-slide: 450ms cubic-bezier(0.4, 0, 0.2, 1) 510ms both;
          animation: hippo-opening-center var(--hippo-opening-slide);
        }

        .hippo-opening-symbol {
          width: var(--hippo-opening-symbol-width);
        }

        .hippo-opening-stroke {
          stroke-dasharray: 1 1;
          animation: hippo-opening-draw 760ms cubic-bezier(0.34, 0.18, 0.36, 1) both;
        }

        .hippo-opening-stroke-inner {
          animation-duration: 710ms;
          animation-delay: 50ms;
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

        @keyframes hippo-opening-exit {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes hippo-opening-hide {
          from, to { visibility: hidden; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hippo-opening-brand,
          .hippo-opening-stroke,
          .hippo-opening-wordmark { animation: none; }
          .hippo-opening-splash { animation-timing-function: step-end; }
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
          <div className="hippo-opening-wordmark flex flex-col">
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
