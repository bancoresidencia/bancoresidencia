'use client';

import React, { useEffect, useState } from 'react';

/**
 * Splash Screen Global Oficial do Hippocampus • Questões de Residência
 * Arquitetura de Alto Rendimento com Aceleração de Hardware:
 * 1. Isolamento de CPU/GPU via content-visibility: hidden na aplicação de fundo.
 * 2. Simbologia com 2 linhas fiéis ao SVG (borda reta stroke-linecap="butt", espessura 132).
 * 3. Traçado em crescente da DIREITA para a ESQUERDA com aceleração e desaceleração natural (cubic-bezier(0.4, 0.0, 0.2, 1.0)).
 *    - Linha externa: 4160px (2.8s)
 *    - Linha interna: 2220px (2.6s, stagger 0.12s)
 * 4. Animação híbrida SMIL (<animate>) + CSS Keyframes com shape-rendering="geometricPrecision" (sub-pixel anti-aliasing fluido).
 * 5. Ao concluir as linhas, o nome em linha única desliza saindo de trás do símbolo da ESQUERDA para a DIREITA (1.2s).
 * 6. A marca repousa na tela completa por ~1.2s antes de fazer um fade-out suave de transição (700ms).
 */
export const HippocampusGlobalSplash: React.FC = () => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(false);

  useEffect(() => {
    // Isola renderização do background durante a animação
    document.documentElement.classList.add('hippo-splash-active');

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
      document.documentElement.classList.remove('hippo-splash-active');
    }, 4800);

    const destroyTimer = setTimeout(() => {
      setIsDestroyed(true);
    }, 5500);

    return () => {
      document.documentElement.classList.remove('hippo-splash-active');
      clearTimeout(fadeTimer);
      clearTimeout(destroyTimer);
    };
  }, []);

  if (isDestroyed) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#09090b] text-white select-none transition-opacity duration-700 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="status"
      aria-label="Carregando Hippocampus"
    >
      <style>{`
        /* Isolar layout da página em background para liberar 100% de CPU/GPU para a animação */
        html.hippo-splash-active .hippo-main-app-content {
          content-visibility: hidden;
          pointer-events: none;
        }

        /* Animação com curva orgânica cinematográfica (Material Standard Easing: aceleração suave, fluxo contínuo, parada suave) */
        @keyframes drawHippocampusLineOuter {
          0% {
            stroke-dashoffset: 4160;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes drawHippocampusLineInner {
          0% {
            stroke-dashoffset: 2220;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        /* Animação do texto: desliza suavemente de trás da logo da Esquerda para a Direita */
        @keyframes slideHippocampusTextFromBehind {
          0% {
            transform: translate3d(-110%, 0, 0);
            opacity: 0;
          }
          30% {
            opacity: 0.6;
          }
          100% {
            transform: translate3d(0, 0, 0);
            opacity: 1;
          }
        }

        /* Respiração suave pós-revelação (ativada somente após o término do movimento) */
        @keyframes hippocampusGlowBreathing {
          0% {
            opacity: 1;
            filter: drop-shadow(0 0 0 rgba(255, 255, 255, 0));
          }
          100% {
            opacity: 0.92;
            filter: drop-shadow(0 4px 28px rgba(255, 255, 255, 0.22));
          }
        }

        .hippo-gpu-container {
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
          will-change: transform;
        }

        .hippo-path-outer {
          stroke-dasharray: 4160;
          stroke-dashoffset: 4160;
          will-change: stroke-dashoffset;
          shape-rendering: geometricPrecision;
          animation: drawHippocampusLineOuter 2.8s cubic-bezier(0.4, 0.0, 0.2, 1.0) forwards;
        }

        .hippo-path-inner {
          stroke-dasharray: 2220;
          stroke-dashoffset: 2220;
          will-change: stroke-dashoffset;
          shape-rendering: geometricPrecision;
          animation: drawHippocampusLineInner 2.6s cubic-bezier(0.4, 0.0, 0.2, 1.0) 0.12s forwards;
        }

        .hippo-text-slider {
          transform: translate3d(-110%, 0, 0);
          opacity: 0;
          will-change: transform, opacity;
          animation: slideHippocampusTextFromBehind 1.2s cubic-bezier(0.16, 1, 0.3, 1) 2.5s forwards;
        }

        .hippo-brand-breathing {
          animation: hippocampusGlowBreathing 3.0s ease-in-out 3.8s infinite alternate;
        }
      `}</style>

      {/* Container Principal da Marca com Promoção na GPU */}
      <div className="flex items-center gap-4 sm:gap-5 relative hippo-brand-breathing hippo-gpu-container">
        {/* Simbologia (2 Linhas com bordas retas originais stroke-linecap="butt") */}
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
          {/* Linha 2 Externa (Calota craniana: desenha da DIREITA para a ESQUERDA com ponta RETA e aceleração SMIL + CSS) */}
          <path
            className="hippo-path-outer"
            fill="none"
            stroke="#ffffff"
            strokeWidth={132}
            strokeMiterlimit={10}
            strokeLinecap="butt"
            shapeRendering="geometricPrecision"
            d="M 1270.756 1336.094 C 1270.756 1971.842 2360.998 1072.751 1670.993 488.16 C 1357.793 222.808 675.35 161.911 362.047 674.876 C 362.047 674.876 184.287 959.785 298.333 1070.475 C 422.801 1191.281 673.215 1042.009 854.033 1157.092"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="4160"
              to="0"
              dur="2.8s"
              begin="0s"
              fill="freeze"
              calcMode="spline"
              keySplines="0.4 0.0 0.2 1.0"
              keyTimes="0;1"
            />
          </path>

          {/* Linha 1 Interna (Giro do hipocampo concêntrico: desenha da DIREITA para a ESQUERDA com ponta RETA e aceleração SMIL + CSS) */}
          <path
            className="hippo-path-inner"
            fill="none"
            stroke="#ffffff"
            strokeWidth={132}
            strokeMiterlimit={10}
            strokeLinecap="butt"
            shapeRendering="geometricPrecision"
            d="M 718.74 906.921 C 882.704 405.986 1702.884 702.375 1543.416 1022.75 C 1373.738 1363.638 1050.008 860.221 842.727 1632.282"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="2220"
              to="0"
              dur="2.6s"
              begin="0.12s"
              fill="freeze"
              calcMode="spline"
              keySplines="0.4 0.0 0.2 1.0"
              keyTimes="0;1"
            />
          </path>
        </svg>

        {/* Máscara de revelação do texto: desliza suavemente da esquerda para a direita */}
        <div className="overflow-hidden flex flex-col justify-center pl-1 py-1">
          <div className="hippo-text-slider flex flex-col">
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
