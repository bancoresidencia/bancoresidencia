'use client';

import React, { useEffect, useState } from 'react';

interface HippocampusLoadingProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onFinished?: () => void;
  minDurationMs?: number;
}

/**
 * Componente oficial de Carregamento com Animação Sequencial do Hippocampus
 * 1. Simbologia com 2 linhas vetoriais fiéis (stroke-linecap="butt", bordas retas, espessura 132).
 * 2. Traçado desenhado em crescente da DIREITA para a ESQUERDA com aceleração e desaceleração natural.
 * 3. Animação pura via CSS Keyframes acelerados por hardware com shape-rendering="geometricPrecision".
 * 4. Após o traçado, o nome em linha única desliza suavemente de trás da logo da ESQUERDA para a DIREITA (1.3s).
 * 5. A tela é liberada após a conclusão integral das animações.
 */
export const HippocampusLoading: React.FC<HippocampusLoadingProps> = ({
  message = 'Carregando plataforma médica...',
  className = '',
  size = 'md',
  onFinished,
  minDurationMs = 5200
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, Math.max(minDurationMs - 800, 1000));

    const finishTimer = setTimeout(() => {
      onFinished?.();
    }, minDurationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinished, minDurationMs]);

  const sizeMap = {
    sm: { svgWidth: 54, svgHeight: 48, titleSize: 'text-2xl', subSize: 'text-[8px]' },
    md: { svgWidth: 84, svgHeight: 74, titleSize: 'text-3xl', subSize: 'text-[10px]' },
    lg: { svgWidth: 104, svgHeight: 92, titleSize: 'text-4xl', subSize: 'text-[12px]' }
  };

  const currentSize = sizeMap[size];

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090b] text-white select-none transition-opacity duration-800 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } ${className}`}
      role="status"
      aria-label="Carregando Hippocampus"
    >
      <style>{`
        /* Traçado Ultra-Fluido da Linha Externa (da Direita para a Esquerda) */
        @keyframes drawOuterSilkyLoading {
          0% {
            stroke-dashoffset: 4157;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        /* Traçado Ultra-Fluido da Linha Interna (da Direita para a Esquerda sincronizado) */
        @keyframes drawInnerSilkyLoading {
          0% {
            stroke-dashoffset: -2217;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        /* Deslizamento do texto saindo de trás do símbolo da Esquerda para a Direita */
        @keyframes slideTextSilkyLoading {
          0% {
            transform: translate3d(-105%, 0, 0);
            opacity: 0;
          }
          30% {
            opacity: 0.7;
          }
          100% {
            transform: translate3d(0, 0, 0);
            opacity: 1;
          }
        }

        /* Iluminação sutil pós-revelação da marca completa */
        @keyframes brandGlowSilkyLoading {
          0% {
            filter: drop-shadow(0 0 0 rgba(255, 255, 255, 0));
          }
          100% {
            filter: drop-shadow(0 2px 24px rgba(255, 255, 255, 0.20));
          }
        }

        .hippo-loading-path-outer {
          stroke-dasharray: 4157;
          stroke-dashoffset: 4157;
          will-change: stroke-dashoffset;
          shape-rendering: geometricPrecision;
          animation: drawOuterSilkyLoading 3.2s cubic-bezier(0.35, 0.0, 0.15, 1.0) 0.1s forwards;
        }

        .hippo-loading-path-inner {
          stroke-dasharray: 2217;
          stroke-dashoffset: -2217;
          will-change: stroke-dashoffset;
          shape-rendering: geometricPrecision;
          animation: drawInnerSilkyLoading 3.0s cubic-bezier(0.35, 0.0, 0.15, 1.0) 0.18s forwards;
        }

        .hippo-loading-text-slider {
          transform: translate3d(-105%, 0, 0);
          opacity: 0;
          will-change: transform, opacity;
          animation: slideTextSilkyLoading 1.3s cubic-bezier(0.16, 1, 0.3, 1) 3.0s forwards;
        }

        .hippo-loading-container-glow {
          animation: brandGlowSilkyLoading 2.0s ease-out 3.5s forwards;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
        }
      `}</style>

      {/* Container Principal da Marca */}
      <div className="flex items-center gap-4 sm:gap-5 relative hippo-loading-container-glow">
        {/* Simbologia (2 Linhas com bordas retas originais stroke-linecap="butt", traçado em crescente da direita para esquerda) */}
        <svg
          viewBox="0 0 2160 1920"
          style={{
            width: `${currentSize.svgWidth}px`,
            height: `${currentSize.svgHeight}px`,
            minWidth: `${currentSize.svgWidth}px`,
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden'
          }}
          className="shrink-0 overflow-visible relative z-10"
          shapeRendering="geometricPrecision"
          aria-hidden="true"
        >
          {/* Linha Externa (4157px, desenha da DIREITA para a ESQUERDA com ponta RETA) */}
          <path
            className="hippo-loading-path-outer"
            fill="none"
            stroke="#ffffff"
            strokeWidth={132}
            strokeMiterlimit={10}
            strokeLinecap="butt"
            shapeRendering="geometricPrecision"
            d="M 1270.756 1336.094 C 1270.756 1971.842 2360.998 1072.751 1670.993 488.16 C 1357.793 222.808 675.35 161.911 362.047 674.876 C 362.047 674.876 184.287 959.785 298.333 1070.475 C 422.801 1191.281 673.215 1042.009 854.033 1157.092"
          />

          {/* Linha Interna (2217px, desenha da DIREITA para a ESQUERDA sincronizada em crescente com ponta RETA) */}
          <path
            className="hippo-loading-path-inner"
            fill="none"
            stroke="#ffffff"
            strokeWidth={132}
            strokeMiterlimit={10}
            strokeLinecap="butt"
            shapeRendering="geometricPrecision"
            d="M 718.74 906.921 C 882.704 405.986 1702.884 702.375 1543.416 1022.75 C 1373.738 1363.638 1050.008 860.221 842.727 1632.282"
          />
        </svg>

        {/* Máscara de revelação do texto: desliza suavemente saindo de trás do símbolo da esquerda para a direita */}
        <div className="overflow-hidden flex flex-col justify-center pl-1 py-1">
          <div className="hippo-loading-text-slider flex flex-col">
            <span
              className={`font-black ${currentSize.titleSize} text-white tracking-[-0.035em] leading-none`}
              style={{ fontFamily: 'var(--font-inter), Inter, system-ui, -apple-system, sans-serif' }}
            >
              Hippocampus
            </span>
            <span
              className={`${currentSize.subSize} uppercase text-zinc-300 whitespace-nowrap leading-none mt-2`}
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

      {message && (
        <p className="mt-8 text-xs font-medium text-zinc-400 tracking-wide animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default HippocampusLoading;
