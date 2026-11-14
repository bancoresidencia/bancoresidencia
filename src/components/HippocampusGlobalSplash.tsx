'use client';

import React, { useEffect, useState } from 'react';

/**
 * Splash Screen Global Oficial do Hippocampus • Questões de Residência
 * 1. Simbologia nasce perfeitamente no centro absoluto da tela e se desenha em crescente da DIREITA para a ESQUERDA (0.0s a 2.8s).
 * 2. Transição cinematográfica e orgânica (2.0s a 3.2s):
 *    - A logo desliza suavemente para a esquerda.
 *    - A palavra emerge suavemente de trás da logo, DO COMEÇO AO SEU FIM ('H' -> 'i' -> 'p' -> 'p' -> 'o' -> 'c' -> 'a' -> 'm' -> 'p' -> 'u' -> 's').
 *    - Borda de emergência com gradiente esvaecido suave de 35px (zero linhas retas, zero caixas duras).
 * 3. Repouso estático encurtado (apenas 200ms entre 3.20s e 3.40s).
 * 4. Fade-out ultra-suave (350ms) liberando a aplicação aos 3.75s e desmontando aos 3.80s.
 */
export const HippocampusGlobalSplash: React.FC = () => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(false);

  useEffect(() => {
    // Garante isolamento da aplicação de fundo durante o traçado inicial
    document.documentElement.classList.add('hippo-splash-active');

    // Libera a renderização da aplicação aos 3.20s quando a logo e o texto terminam de se montar
    const prepareBgTimer = setTimeout(() => {
      document.documentElement.classList.remove('hippo-splash-active');
    }, 3200);

    // Dispara o fade-out rápido aos 3.40s (após repouso estático ágil de 200ms)
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 3400);

    // Desmonta aos 3.80s
    const destroyTimer = setTimeout(() => {
      setIsDestroyed(true);
    }, 3800);

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
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#09090b] text-white select-none transition-opacity duration-350 ease-in-out ${
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

        /* 1. Traçado da Linha Externa (0.0s a 2.8s) suave e calmo */
        @keyframes splashOuterDraw {
          0% {
            stroke-dashoffset: 4157;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        /* 2. Traçado da Linha Interna (0.12s a 2.72s) suave e sincronizado */
        @keyframes splashInnerDraw {
          0% {
            stroke-dashoffset: -2217;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        /* 3. Deslocamento suave do bloco do centro da tela para a esquerda (2.0s a 3.2s) */
        @keyframes splashShiftLeft {
          0% {
            transform: translate3d(var(--hippo-shift), 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        /* 4. A palavra emerge suavemente de trás da logo do começo ao seu fim ('H' -> 'i' -> 'p'...) */
        @keyframes splashWipeAcross {
          0% {
            -webkit-mask-position: -360px 0;
            mask-position: -360px 0;
          }
          100% {
            -webkit-mask-position: 0px 0;
            mask-position: 0px 0;
          }
        }

        /* Leve deslizamento conjunto de -18px para sensação de saída contínua */
        @keyframes splashTextSlip {
          0% {
            transform: translate3d(-18px, 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        .hippo-splash-path-outer {
          stroke-dasharray: 4157;
          stroke-dashoffset: 4157;
          will-change: stroke-dashoffset;
          shape-rendering: geometricPrecision;
          animation: splashOuterDraw 2.8s cubic-bezier(0.35, 0.0, 0.15, 1.0) forwards;
        }

        .hippo-splash-path-inner {
          stroke-dasharray: 2217;
          stroke-dashoffset: -2217;
          will-change: stroke-dashoffset;
          shape-rendering: geometricPrecision;
          animation: splashInnerDraw 2.6s cubic-bezier(0.35, 0.0, 0.15, 1.0) 0.12s forwards;
        }

        .hippo-splash-container {
          display: flex;
          align-items: center;
          position: relative;
          will-change: transform;
          animation: splashShiftLeft 1.2s cubic-bezier(0.35, 0.0, 0.25, 1.0) 2.0s forwards;
          transform: translate3d(var(--hippo-shift), 0, 0);
        }

        .hippo-splash-mask-wipe {
          -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,1) 0px, rgba(0,0,0,1) 320px, rgba(0,0,0,0) 360px);
          mask-image: linear-gradient(to right, rgba(0,0,0,1) 0px, rgba(0,0,0,1) 320px, rgba(0,0,0,0) 360px);
          -webkit-mask-size: 800px 100%;
          mask-size: 800px 100%;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-position: -360px 0;
          mask-position: -360px 0;
          will-change: mask-position, -webkit-mask-position;
          animation: splashWipeAcross 1.2s cubic-bezier(0.35, 0.0, 0.25, 1.0) 2.0s forwards;
        }

        .hippo-splash-text-slip {
          will-change: transform;
          animation: splashTextSlip 1.2s cubic-bezier(0.35, 0.0, 0.25, 1.0) 2.0s forwards;
          transform: translate3d(-18px, 0, 0);
        }
      `}</style>

      {/* Container Principal da Marca com Translação Inicial no Centro */}
      <div className="hippo-splash-container gap-[10px] sm:gap-[12px]">
        {/* Simbologia (2 Linhas com bordas retas originais stroke-linecap="butt", viewBox justo sem caixa larga) */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center' }}>
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

        {/* Revelação orgânica da palavra saindo suavemente de trás da logo do começo ao fim */}
        <div className="hippo-splash-mask-wipe" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hippo-splash-text-slip flex flex-col">
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
