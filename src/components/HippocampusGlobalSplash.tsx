'use client';

import React, { useEffect, useState } from 'react';

/**
 * Splash Screen Global Oficial do Hippocampus • Questões de Residência
 * Apresentação cinematográfica suave, majestosa e calibrada:
 * 1. Simbologia com 2 linhas fiéis ao SVG (borda reta stroke-linecap="butt", espessura 132).
 * 2. Traçado em crescente da DIREITA para a ESQUERDA em velocidade suave e perceptível (2.6s).
 *    - Linha externa: 4160px
 *    - Linha interna: 2220px
 * 3. Ao concluir as linhas, o nome em linha única desliza saindo de trás do símbolo da ESQUERDA para a DIREITA (1.2s).
 * 4. A marca repousa na tela completa por ~1.2s antes de fazer um fade-out suave de transição (700ms).
 */
export const HippocampusGlobalSplash: React.FC = () => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(false);

  useEffect(() => {
    // 4.6s totais para permitir assistir com calma e perfeição às duas animações completas
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 4600);

    const destroyTimer = setTimeout(() => {
      setIsDestroyed(true);
    }, 5300);

    return () => {
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
        /* Animação do traçado das 2 linhas: da Direita para a Esquerda (suave, gradual e visível) */
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
            transform: translateX(-110%);
            opacity: 0;
          }
          30% {
            opacity: 0.6;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Respiração suave pós-revelação */
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

        .hippo-path-outer {
          stroke-dasharray: 4160;
          stroke-dashoffset: 4160;
          animation: drawHippocampusLineOuter 2.6s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
        }

        .hippo-path-inner {
          stroke-dasharray: 2220;
          stroke-dashoffset: 2220;
          animation: drawHippocampusLineInner 2.4s cubic-bezier(0.25, 0.1, 0.25, 1) 0.1s forwards;
        }

        .hippo-text-slider {
          transform: translateX(-110%);
          opacity: 0;
          animation: slideHippocampusTextFromBehind 1.2s cubic-bezier(0.16, 1, 0.3, 1) 2.3s forwards;
        }

        .hippo-brand-breathing {
          animation: hippocampusGlowBreathing 2.8s ease-in-out 3.5s infinite alternate;
        }
      `}</style>

      {/* Container Principal da Marca com Animação Sequencial */}
      <div className="flex items-center gap-4 sm:gap-5 relative hippo-brand-breathing">
        {/* Simbologia (2 Linhas com bordas retas originais stroke-linecap="butt") */}
        <svg
          viewBox="0 0 2160 1920"
          style={{ width: '84px', height: '74px', minWidth: '84px' }}
          className="shrink-0 overflow-visible relative z-10"
          aria-hidden="true"
        >
          {/* Linha 2 Externa (Calota craniana: desenha da DIREITA para a ESQUERDA com ponta RETA) */}
          <path
            className="hippo-path-outer"
            fill="none"
            stroke="#ffffff"
            strokeWidth={132}
            strokeMiterlimit={10}
            strokeLinecap="butt"
            d="M 1270.756 1336.094 C 1270.756 1971.842 2360.998 1072.751 1670.993 488.16 C 1357.793 222.808 675.35 161.911 362.047 674.876 C 362.047 674.876 184.287 959.785 298.333 1070.475 C 422.801 1191.281 673.215 1042.009 854.033 1157.092"
          />

          {/* Linha 1 Interna (Giro do hipocampo concêntrico: desenha da DIREITA para a ESQUERDA com ponta RETA) */}
          <path
            className="hippo-path-inner"
            fill="none"
            stroke="#ffffff"
            strokeWidth={132}
            strokeMiterlimit={10}
            strokeLinecap="butt"
            d="M 718.74 906.921 C 882.704 405.986 1702.884 702.375 1543.416 1022.75 C 1373.738 1363.638 1050.008 860.221 842.727 1632.282"
          />
        </svg>

        {/* Máscara de revelação do texto: desliza suavemente da esquerda para a direita */}
        <div className="overflow-hidden flex flex-col justify-center pl-1 py-1">
          <div className="hippo-text-slider flex flex-col">
            <span
              className="font-black text-3xl sm:text-4xl text-white tracking-[-0.035em] leading-none"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
            >
              Hippocampus
            </span>
            <span
              className="text-[9px] sm:text-[11px] uppercase text-zinc-300 whitespace-nowrap leading-none mt-2"
              style={{
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
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
