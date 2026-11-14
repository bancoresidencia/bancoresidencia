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
 * 1. Exclusivamente a simbologia vetorial fiel ao SVG (duas linhas com ponta reta butt e espessura 132).
 * 2. Sequência cíclica contínua (loop infinito) de desenho e redesenho a 60 FPS cravados.
 * 3. ViewBox justo (185 210 1790 1500) eliminando caixas vazias ou bordas fantasmas.
 * 4. Substitui spinners circulares genéricos por um indicador biomédico de alta identidade visual.
 */
export const HippocampusLoading: React.FC<HippocampusLoadingProps> = ({
  className = '',
  size = 'md',
  message,
  fullScreen = true
}) => {
  const sizeMap = {
    sm: { width: '44px', height: '37px', minWidth: '44px' },
    md: { width: '72px', height: '60px', minWidth: '72px' },
    lg: { width: '96px', height: '80px', minWidth: '96px' }
  };

  const currentSize = sizeMap[size];

  const containerClasses = fullScreen
    ? `fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#09090b] text-white select-none ${className}`
    : `flex flex-col items-center justify-center p-6 text-white select-none ${className}`;

  return (
    <div
      className={containerClasses}
      role="status"
      aria-label="Carregando Hippocampus"
    >
      <style>{`
        /* Ciclo Infinito Contínuo: Linha Externa desenha da direita para a esquerda e redesenha em loop */
        @keyframes cyclicOuterSilky {
          0% {
            stroke-dashoffset: 4157;
          }
          45% {
            stroke-dashoffset: 0;
          }
          55% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -4157;
          }
        }

        /* Ciclo Infinito Contínuo: Linha Interna sincronizada em crescente da direita para esquerda */
        @keyframes cyclicInnerSilky {
          0% {
            stroke-dashoffset: -2217;
          }
          45% {
            stroke-dashoffset: 0;
          }
          55% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 2217;
          }
        }

        .hippo-cyclic-outer {
          stroke-dasharray: 4157;
          stroke-dashoffset: 4157;
          will-change: stroke-dashoffset;
          shape-rendering: geometricPrecision;
          animation: cyclicOuterSilky 2.2s cubic-bezier(0.4, 0.0, 0.2, 1.0) infinite;
        }

        .hippo-cyclic-inner {
          stroke-dasharray: 2217;
          stroke-dashoffset: -2217;
          will-change: stroke-dashoffset;
          shape-rendering: geometricPrecision;
          animation: cyclicInnerSilky 2.2s cubic-bezier(0.4, 0.0, 0.2, 1.0) 0.08s infinite;
        }

        .hippo-cyclic-container {
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          filter: drop-shadow(0 2px 16px rgba(255, 255, 255, 0.15));
        }
      `}</style>

      {/* Simbologia Centralizada em Loop Cíclico */}
      <div className="hippo-cyclic-container flex items-center justify-center">
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
          shapeRendering="geometricPrecision"
          aria-hidden="true"
        >
          {/* Linha Externa (4157px, ponta reta butt, espessura canônica 132) */}
          <path
            className="hippo-cyclic-outer"
            fill="none"
            stroke="#ffffff"
            strokeWidth={132}
            strokeMiterlimit={10}
            strokeLinecap="butt"
            shapeRendering="geometricPrecision"
            d="M 1270.756 1336.094 C 1270.756 1971.842 2360.998 1072.751 1670.993 488.16 C 1357.793 222.808 675.35 161.911 362.047 674.876 C 362.047 674.876 184.287 959.785 298.333 1070.475 C 422.801 1191.281 673.215 1042.009 854.033 1157.092"
          />

          {/* Linha Interna (2217px, ponta reta butt, espessura canônica 132) */}
          <path
            className="hippo-cyclic-inner"
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

      {message && (
        <span className="mt-5 text-[11px] font-semibold text-zinc-400 tracking-wider uppercase animate-pulse">
          {message}
        </span>
      )}
    </div>
  );
};

export default HippocampusLoading;
