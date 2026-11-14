'use client';

import React, { useEffect, useState } from 'react';

/**
 * Splash Screen Global Oficial do Hippocampus • Questões de Residência
 * 1. Simbologia nasce perfeitamente no centro absoluto da tela e se desenha em crescente da DIREITA para a ESQUERDA (0.0s a 0.85s).
 * 2. Transição orgânica (0.70s a 1.25s): a logo desliza suavemente para a esquerda enquanto o texto emerge para a direita.
 * 3. Máscara gradiente alfa de esvaecimento (zero corte reto, zero quadrado rígido).
 * 4. Repouso relâmpago de 150ms (1.25s a 1.40s).
 * 5. Fade-out ultra-suave (300ms) liberando a plataforma instantaneamente aos ~1.70s.
 */
export const HippocampusGlobalSplash: React.FC = () => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(false);

  useEffect(() => {
    // Garante isolamento da aplicação de fundo durante o traçado inicial
    document.documentElement.classList.add('hippo-splash-active');

    // Libera a renderização da aplicação aos 1.30s para transição 100% suave
    const prepareBgTimer = setTimeout(() => {
      document.documentElement.classList.remove('hippo-splash-active');
    }, 1300);

    // Dispara o fade-out rápido aos 1.40s
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1400);

    // Desmonta aos 1.70s
    const destroyTimer = setTimeout(() => {
      setIsDestroyed(true);
    }, 1700);

    return () => {
      document.documentElement.classList.remove('hippo-splash-active');
      clearTimeout(prepareBgTimer);
      clearTimeout(fadeTimer);
      clearTimeout(destroyTimer);
    };
  }, []);

  if (isDestroyed) {
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
        /* 1. Traçado da Linha Externa (0.0s a 0.85s) */
        @keyframes splashOuterDraw {
          0% {
            stroke-dashoffset: 4157;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        /* 2. Traçado da Linha Interna (0.05s a 0.80s) */
        @keyframes splashInnerDraw {
          0% {
            stroke-dashoffset: -2217;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        /* 3. Deslocamento suave do bloco do centro da tela para a esquerda (0.70s a 1.25s) */
        @keyframes splashShiftLeft {
          0% {
            transform: translate3d(130px, 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        /* 4. Deslizamento do texto saindo de trás da logo para a direita (0.70s a 1.25s) */
        @keyframes splashTextReveal {
          0% {
            transform: translate3d(-100%, 0, 0);
            opacity: 0;
          }
          20% {
            opacity: 0.8;
          }
          100% {
            transform: translate3d(0, 0, 0);
            opacity: 1;
          }
        }

        /* 5. Máscara gradiente com fade suave na saída (elimina corte reto e quinas duras) */
        @keyframes splashMaskTransition {
          0% {
            mask-image: linear-gradient(to right, transparent 0px, transparent 15px, rgba(0,0,0,1) 50px, rgba(0,0,0,1) 100%);
            -webkit-mask-image: linear-gradient(to right, transparent 0px, transparent 15px, rgba(0,0,0,1) 50px, rgba(0,0,0,1) 100%);
          }
          85% {
            mask-image: linear-gradient(to right, transparent 0px, rgba(0,0,0,1) 20px, rgba(0,0,0,1) 100%);
            -webkit-mask-image: linear-gradient(to right, transparent 0px, rgba(0,0,0,1) 20px, rgba(0,0,0,1) 100%);
          }
          100% {
            mask-image: none;
            -webkit-mask-image: none;
          }
        }

        .hippo-splash-path-outer {
          stroke-dasharray: 4157;
          stroke-dashoffset: 4157;
          will-change: stroke-dashoffset;
          shape-rendering: geometricPrecision;
          animation: splashOuterDraw 0.85s cubic-bezier(0.35, 0.0, 0.15, 1.0) forwards;
        }

        .hippo-splash-path-inner {
          stroke-dasharray: 2217;
          stroke-dashoffset: -2217;
          will-change: stroke-dashoffset;
          shape-rendering: geometricPrecision;
          animation: splashInnerDraw 0.80s cubic-bezier(0.35, 0.0, 0.15, 1.0) 0.05s forwards;
        }

        .hippo-splash-container {
          display: flex;
          align-items: center;
          gap: 18px;
          position: relative;
          will-change: transform;
          animation: splashShiftLeft 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.70s forwards;
          transform: translate3d(130px, 0, 0); /* Inicia com a logo no centro exato da tela */
        }

        .hippo-splash-mask {
          overflow: hidden;
          padding: 4px 6px;
          animation: splashMaskTransition 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.70s forwards;
        }

        .hippo-splash-slider {
          transform: translate3d(-100%, 0, 0);
          opacity: 0;
          will-change: transform, opacity;
          animation: splashTextReveal 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.70s forwards;
        }
      `}</style>

      {/* Container Principal da Marca com Translação Inicial no Centro */}
      <div className="hippo-splash-container">
        {/* Simbologia (2 Linhas com bordas retas originais stroke-linecap="butt", em z-index superior ao texto) */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <svg
            viewBox="0 0 2160 1920"
            style={{
              width: '84px',
              height: '74px',
              minWidth: '84px',
              transform: 'translate3d(0, 0, 0)',
              backfaceVisibility: 'hidden'
            }}
            className="shrink-0 overflow-visible"
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

        {/* Máscara de revelação do texto: desliza saindo de trás do símbolo com esvaecimento gradiente suave */}
        <div className="hippo-splash-mask" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hippo-splash-slider flex flex-col">
            <span
              className="font-black text-3xl sm:text-4xl text-white tracking-[-0.035em] leading-none"
              style={{ fontFamily: 'var(--font-inter), Inter, system-ui, -apple-system, sans-serif' }}
            >
              Hippocampus
            </span>
            <span
              className="text-[9px] sm:text-[11px] uppercase text-zinc-300 whitespace-nowrap leading-none mt-2"
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
