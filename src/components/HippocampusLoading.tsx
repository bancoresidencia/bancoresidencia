'use client';

import React from 'react';

interface HippocampusLoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

/**
 * Loader Oficial Central do Hippocampus • Questões de Residência
 * - Superfície em Glassmorphism translúcido (efeito vidro jateado) quando fullScreen.
 * - Ciclo vetorial infinito a 60 FPS com pathLength="1" (precisão exata sem delay inicial).
 * - Adaptado dinamicamente a Light/Dark Mode e aos 7 acentos cromáticos da plataforma.
 * - Indicador exclusivo para transições internas da aplicação (navegação entre abas, lazy loading de módulos).
 */
export const HippocampusLoading: React.FC<HippocampusLoadingProps> = ({
  className = '',
  size = 'md',
  message = 'Carregando...',
  fullScreen = false
}) => {
  const sizeMap = {
    sm: { width: '40px', height: '34px', minWidth: '40px' },
    md: { width: '64px', height: '54px', minWidth: '64px' },
    lg: { width: '84px', height: '70px', minWidth: '84px' }
  };

  const currentSize = sizeMap[size];

  const vectorBlock = (
    <>
      <style>{`
        @keyframes hippoCyclicOuterGlass {
          0% {
            stroke-dashoffset: 1;
          }
          45% {
            stroke-dashoffset: 0;
          }
          55% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -1;
          }
        }

        @keyframes hippoCyclicInnerGlass {
          0% {
            stroke-dashoffset: -1;
          }
          45% {
            stroke-dashoffset: 0;
          }
          55% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 1;
          }
        }

        .hippo-cyclic-outer {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          will-change: stroke-dashoffset;
          animation: hippoCyclicOuterGlass 1.85s cubic-bezier(0.35, 0.0, 0.2, 1.0) infinite;
        }

        .hippo-cyclic-inner {
          stroke-dasharray: 1;
          stroke-dashoffset: -1;
          will-change: stroke-dashoffset;
          animation: hippoCyclicInnerGlass 1.85s cubic-bezier(0.35, 0.0, 0.2, 1.0) 0.06s infinite;
        }
      `}</style>

      <div
        className="flex items-center justify-center text-zinc-950 dark:text-white"
        style={{
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
          filter: 'drop-shadow(0 4px 16px var(--glow-color, rgba(37, 99, 235, 0.22)))'
        }}
      >
        <svg
          viewBox="185 210 1790 1500"
          style={{
            width: currentSize.width,
            height: currentSize.height,
            minWidth: currentSize.minWidth,
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden'
          }}
          className="overflow-visible"
          aria-hidden="true"
        >
          <path
            className="hippo-cyclic-outer"
            pathLength={1}
            fill="none"
            stroke="currentColor"
            strokeWidth={132}
            strokeMiterlimit={10}
            strokeLinecap="butt"
            d="M 1270.756 1336.094 C 1270.756 1971.842 2360.998 1072.751 1670.993 488.16 C 1357.793 222.808 675.35 161.911 362.047 674.876 C 362.047 674.876 184.287 959.785 298.333 1070.475 C 422.801 1191.281 673.215 1042.009 854.033 1157.092"
          />
          <path
            className="hippo-cyclic-inner"
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

      {message && (
        <span className="mt-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider uppercase animate-pulse">
          {message}
        </span>
      )}
    </>
  );

  if (!fullScreen) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-6 select-none ${className}`}
        data-hippo-startup-pending
        role="status"
        aria-live="polite"
        aria-label={message || 'Carregando Hippocampus'}
      >
        <div
          className="hippo-glass-capsule backdrop-blur-2xl backdrop-saturate-150 rounded-2xl px-7 py-5 flex flex-col items-center justify-center"
          style={{
            WebkitBackdropFilter: 'blur(28px) saturate(190%)',
            backdropFilter: 'blur(28px) saturate(190%)'
          }}
        >
          {vectorBlock}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`hippo-glass-overlay backdrop-blur-xl backdrop-saturate-150 fixed inset-0 z-[9999] flex flex-col items-center justify-center px-4 select-none ${className}`}
      style={{
        WebkitBackdropFilter: 'blur(18px) saturate(175%)',
        backdropFilter: 'blur(18px) saturate(175%)'
      }}
      data-hippo-startup-pending
      role="status"
      aria-live="polite"
      aria-label={message || 'Carregando Hippocampus'}
    >
      <div
        className="pointer-events-none absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full blur-[100px] opacity-25"
        style={{ backgroundColor: 'var(--primary-color, #2563eb)' }}
        aria-hidden="true"
      />

      <div
        className="hippo-glass-capsule backdrop-blur-2xl backdrop-saturate-150 relative overflow-hidden rounded-3xl px-8 py-7 sm:px-11 sm:py-8 flex flex-col items-center justify-center max-w-[320px] w-full"
        style={{
          WebkitBackdropFilter: 'blur(28px) saturate(190%)',
          backdropFilter: 'blur(28px) saturate(190%)'
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/35 to-transparent"
          aria-hidden="true"
        />

        {vectorBlock}
      </div>
    </div>
  );
};

export default HippocampusLoading;
