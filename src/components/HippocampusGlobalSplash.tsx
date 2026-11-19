'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Splash Screen Global Oficial do Hippocampus • Questões de Residência
 * Otimizado para execução cinematográfica ágil e ultrarrápida:
 * 1. Simbologia nasce no centro e se desenha com física ágil (0.0s a 0.85s).
 * 2. Transição cinematográfica em GPU (0.6s a 1.05s):
 *    - O símbolo desliza suavemente para a esquerda via translate3d.
 *    - O nome sai fisicamente de trás do símbolo da esquerda para a direita.
 * 3. Fade-out rápido (300ms) liberando a aplicação aos 1.05s e desmontando aos 1.35s.
 */
export const HippocampusGlobalSplash: React.FC = () => {
  const pathname = usePathname();
  const isExcluded = typeof window !== 'undefined'
    ? (pathname?.includes('simulado-priapismo') || window.location.pathname.includes('simulado-priapismo'))
    : pathname?.includes('simulado-priapismo');

  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(Boolean(isExcluded));

  useEffect(() => {
    if (isExcluded) {
      document.documentElement.classList.remove('hippo-splash-active');
      setIsDestroyed(true);
      return;
    }

    // Garante isolamento da aplicação de fundo durante o traçado inicial
    document.documentElement.classList.add('hippo-splash-active');

    // Libera a renderização da aplicação aos 950ms quando a logo e o texto terminam de se montar
    const prepareBgTimer = setTimeout(() => {
      document.documentElement.classList.remove('hippo-splash-active');
    }, 950);

    // Dispara o fade-out rápido aos 1050ms
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1050);

    // Desmonta aos 1350ms
    const destroyTimer = setTimeout(() => {
      setIsDestroyed(true);
    }, 1350);

    return () => {
      document.documentElement.classList.remove('hippo-splash-active');
      clearTimeout(prepareBgTimer);
      clearTimeout(fadeTimer);
      clearTimeout(destroyTimer);
    };
  }, []);

  if (isDestroyed || isExcluded) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#09090b] text-white select-none transition-opacity duration-300 ease-in-out ${
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

        /* 1. Traçado da Linha Externa (0.0s a 0.85s) ágil e preciso */
        @keyframes splashOuterDraw {
          0% {
            stroke-dashoffset: 4157;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        /* 2. Traçado da Linha Interna (0.05s a 0.85s) sincronizado */
        @keyframes splashInnerDraw {
          0% {
            stroke-dashoffset: -2217;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        /* 3. Deslocamento do bloco do centro da tela para a esquerda (0.6s a 1.05s) na thread GPU */
        @keyframes splashShiftLeft {
          0% {
            transform: translate3d(var(--hippo-shift), 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        /* 4. O nome desliza fisicamente de trás do símbolo para a direita (0.6s a 1.05s) */
        @keyframes splashSlideOutFromBehind {
          0% {
            transform: translate3d(-105%, 0, 0);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translate3d(0, 0, 0);
            opacity: 1;
          }
        }

        .hippo-splash-path-outer {
          stroke-dasharray: 4157;
          stroke-dashoffset: 4157;
          will-change: stroke-dashoffset;
          shape-rendering: geometricPrecision;
          animation: splashOuterDraw 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .hippo-splash-path-inner {
          stroke-dasharray: 2217;
          stroke-dashoffset: -2217;
          will-change: stroke-dashoffset;
          shape-rendering: geometricPrecision;
          animation: splashInnerDraw 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.05s forwards;
        }

        .hippo-splash-container {
          display: flex;
          align-items: center;
          position: relative;
          will-change: transform;
          animation: splashShiftLeft 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
          transform: translate3d(var(--hippo-shift), 0, 0);
        }

        /* Janela de saída física (overflow: hidden colada no símbolo) */
        .hippo-splash-revealer {
          position: relative;
          overflow: hidden;
          z-index: 1;
          display: flex;
          align-items: center;
          padding-left: 10px;
          margin-left: -2px;
          padding-right: 8px;
          padding-top: 4px;
          padding-bottom: 4px;
        }

        @media (min-width: 640px) {
          .hippo-splash-revealer {
            padding-left: 12px;
          }
        }

        .hippo-splash-text-slide {
          will-change: transform, opacity;
          animation: splashSlideOutFromBehind 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
          transform: translate3d(-105%, 0, 0);
          opacity: 0;
        }

        /* Suporte completo a Acessibilidade: sem transição vertiginosa para quem prefere movimento reduzido */
        @media (prefers-reduced-motion: reduce) {
          .hippo-splash-path-outer,
          .hippo-splash-path-inner {
            stroke-dashoffset: 0 !important;
            animation: none !important;
          }
          .hippo-splash-container {
            transform: translate3d(0, 0, 0) !important;
            animation: none !important;
          }
          .hippo-splash-text-slide {
            transform: translate3d(0, 0, 0) !important;
            opacity: 1 !important;
            animation: none !important;
          }
        }
      `}</style>

      {/* Container Principal da Marca com Translação Inicial no Centro */}
      <div className="hippo-splash-container">
        {/* Simbologia Hippocampus (camada superior z-index 10) */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
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
            {/* Linha Externa (4157px, desenha da DIREITA para a ESQUERDA) */}
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

            {/* Linha Interna (2217px, desenha da DIREITA para a ESQUERDA sincronizada) */}
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

        {/* Janela de saída onde o texto desliza fisicamente de trás da logo */}
        <div className="hippo-splash-revealer">
          <div className="hippo-splash-text-slide flex flex-col">
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

export default HippocampusGlobalSplash;
