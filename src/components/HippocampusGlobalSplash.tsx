'use client';

import React, { useEffect, useState } from 'react';

/**
 * Splash Screen Global Oficial do Hippocampus • Questões de Residência
 * Arquitetura de Alto Rendimento com Aceleração de Hardware:
 * 1. Isolamento prévio de CPU/GPU via content-visibility: hidden na aplicação de fundo.
 * 2. Simbologia com 2 linhas vetoriais fiéis ao SVG (borda reta stroke-linecap="butt", espessura 132).
 * 3. Movimento harmônico em crescente da DIREITA para a ESQUERDA seguindo a curvatura anatômica dos traçados.
 *    - Linha externa: 4157px (3.2s, cubic-bezier(0.35, 0.0, 0.15, 1.0))
 *    - Linha interna: 2217px (3.0s, cubic-bezier(0.35, 0.0, 0.15, 1.0), sincronizada da direita para esquerda)
 * 4. Traçado ultra-fluido a 60/120 FPS via CSS Keyframes puros acelerados na GPU e shape-rendering="geometricPrecision".
 * 5. Ao concluir o traçado, o nome em linha única desliza suavemente saindo de trás do símbolo da ESQUERDA para a DIREITA (1.3s).
 * 6. A marca repousa na tela completa antes de realizar um fade-out suave de transição (800ms).
 */
export const HippocampusGlobalSplash: React.FC = () => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(false);

  useEffect(() => {
    // Garante classe ativa durante a animação
    document.documentElement.classList.add('hippo-splash-active');

    // Libera a renderização da aplicação de fundo um pouco antes do fade-out para evitar stutter
    const prepareBgTimer = setTimeout(() => {
      document.documentElement.classList.remove('hippo-splash-active');
    }, 5000);

    // Inicia o fade-out suave
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 5200);

    // Desmonta o componente após o fade-out
    const destroyTimer = setTimeout(() => {
      setIsDestroyed(true);
    }, 6000);

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
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#09090b] text-white select-none transition-opacity duration-800 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="status"
      aria-label="Carregando Hippocampus"
    >
      <style>{`
        /* Traçado Ultra-Fluido da Linha Externa (da Direita para a Esquerda) */
        @keyframes drawOuterSilky {
          0% {
            stroke-dashoffset: 4157;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        /* Traçado Ultra-Fluido da Linha Interna (da Direita para a Esquerda sincronizado) */
        @keyframes drawInnerSilky {
          0% {
            stroke-dashoffset: -2217;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        /* Deslizamento do texto saindo de trás do símbolo da Esquerda para a Direita */
        @keyframes slideTextSilky {
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

        /* Iluminação sutil e respiração pós-revelação da marca completa */
        @keyframes brandGlowSilky {
          0% {
            filter: drop-shadow(0 0 0 rgba(255, 255, 255, 0));
          }
          100% {
            filter: drop-shadow(0 2px 24px rgba(255, 255, 255, 0.20));
          }
        }

        .hippo-path-outer-silky {
          stroke-dasharray: 4157;
          stroke-dashoffset: 4157;
          will-change: stroke-dashoffset;
          shape-rendering: geometricPrecision;
          animation: drawOuterSilky 3.2s cubic-bezier(0.35, 0.0, 0.15, 1.0) 0.1s forwards;
        }

        .hippo-path-inner-silky {
          stroke-dasharray: 2217;
          stroke-dashoffset: -2217;
          will-change: stroke-dashoffset;
          shape-rendering: geometricPrecision;
          animation: drawInnerSilky 3.0s cubic-bezier(0.35, 0.0, 0.15, 1.0) 0.18s forwards;
        }

        .hippo-text-slider-silky {
          transform: translate3d(-105%, 0, 0);
          opacity: 0;
          will-change: transform, opacity;
          animation: slideTextSilky 1.3s cubic-bezier(0.16, 1, 0.3, 1) 3.0s forwards;
        }

        .hippo-container-glow {
          animation: brandGlowSilky 2.0s ease-out 3.5s forwards;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
        }
      `}</style>

      {/* Container Principal da Marca com Promoção na GPU */}
      <div className="flex items-center gap-4 sm:gap-5 relative hippo-container-glow">
        {/* Simbologia (2 Linhas com bordas retas originais stroke-linecap="butt", traçado em crescente da direita para esquerda) */}
        <svg
          viewBox="0 0 2160 1920"
          style={{
            width: '84px',
            height: '74px',
            minWidth: '84px',
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden'
          }}
          className="shrink-0 overflow-visible relative z-10"
          shapeRendering="geometricPrecision"
          aria-hidden="true"
        >
          {/* Linha 1 Externa (4157px, desenha da DIREITA para a ESQUERDA com ponta RETA) */}
          <path
            className="hippo-path-outer-silky"
            fill="none"
            stroke="#ffffff"
            strokeWidth={132}
            strokeMiterlimit={10}
            strokeLinecap="butt"
            shapeRendering="geometricPrecision"
            d="M 1270.756 1336.094 C 1270.756 1971.842 2360.998 1072.751 1670.993 488.16 C 1357.793 222.808 675.35 161.911 362.047 674.876 C 362.047 674.876 184.287 959.785 298.333 1070.475 C 422.801 1191.281 673.215 1042.009 854.033 1157.092"
          />

          {/* Linha 2 Interna (2217px, desenha da DIREITA para a ESQUERDA sincronizada em crescente com ponta RETA) */}
          <path
            className="hippo-path-inner-silky"
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
          <div className="hippo-text-slider-silky flex flex-col">
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
