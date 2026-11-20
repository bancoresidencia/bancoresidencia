export function HippocampusGlobalSplash() {
  return (
    <div
      className="hippo-opening-splash fixed inset-0 z-[99999] flex select-none items-center justify-center bg-[#09090b] text-white"
      aria-hidden="true"
    >
      <style>{`
        .hippo-opening-splash {
          animation: hippo-opening-exit 145ms ease-out 375ms both;
        }

        .hippo-opening-brand {
          --hippo-opening-shift: 85px;
          animation: hippo-opening-center 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .hippo-opening-wordmark {
          animation: hippo-opening-reveal 240ms cubic-bezier(0.16, 1, 0.3, 1) 60ms both;
        }

        @media (min-width: 640px) {
          .hippo-opening-brand { --hippo-opening-shift: 105px; }
        }

        @keyframes hippo-opening-center {
          from { transform: translateX(var(--hippo-opening-shift)); }
          to { transform: translateX(0); }
        }

        @keyframes hippo-opening-reveal {
          from { opacity: 0; transform: translateX(-100%); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes hippo-opening-exit {
          from { opacity: 1; visibility: visible; }
          to { opacity: 0; visibility: hidden; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hippo-opening-brand,
          .hippo-opening-wordmark { animation: none; }
          .hippo-opening-splash { animation-timing-function: step-end; }
        }
      `}</style>
      <div className="hippo-opening-brand flex items-center">
        <svg
          viewBox="185 210 1790 1500"
          className="relative z-10 h-[54px] w-[64px] shrink-0 sm:h-[63px] sm:w-[76px]"
          fill="none"
          stroke="currentColor"
          strokeWidth={132}
          strokeMiterlimit={10}
          shapeRendering="geometricPrecision"
        >
          <path d="M854.033 1157.092 C673.215 1042.009 422.801 1191.281 298.333 1070.475 C184.287 959.785 362.047 674.876 362.047 674.876 C675.35 161.911 1357.793 222.808 1670.993 488.16 C2360.998 1072.751 1270.756 1971.842 1270.756 1336.094" />
          <path d="M718.74 906.921 C882.704 405.986 1702.884 702.375 1543.416 1022.75 C1373.738 1363.638 1050.008 860.221 842.727 1632.282" />
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
