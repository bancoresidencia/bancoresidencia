'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface QuestionSessionTransitionProps {
  isOpen: boolean;
  isFadingOut?: boolean;
  questionCount: number;
  stepMessage: string;
  progress: number;
  filterBadges?: string[];
  error?: string | null;
  onCancel?: () => void;
}

const STUDY_TIPS = [
  'Dica de Estudo: Use as teclas A, B, C, D e E para registrar sua resposta instantaneamente.',
  'Dica de Prova: Destaque os termos decisivos (sinais vitais, idade, tempo de evolução) com o marca-texto.',
  'Dica de Ritmo: Monitore o cronômetro individual para manter média de ~2 minutos e meio por questão.',
  'Dica de Foco: Ao errar, revise imediatamente o raciocínio padrão-ouro e a pegadinha da banca.'
];

export const QuestionSessionTransition: React.FC<QuestionSessionTransitionProps> = ({
  isOpen,
  isFadingOut = false,
  questionCount,
  stepMessage,
  progress,
  filterBadges = [],
  error = null,
  onCancel
}) => {
  const { accentConfig } = useTheme();
  const [tipIndex, setTipIndex] = useState(0);
  const [showCancelFallback, setShowCancelFallback] = useState(false);

  // Rotaciona dicas a cada 3.5 segundos
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % STUDY_TIPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Se a requisição demorar mais de 8s, exibe opção explícita de cancelar
  useEffect(() => {
    if (!isOpen) {
      setShowCancelFallback(false);
      return;
    }
    const timer = setTimeout(() => {
      setShowCancelFallback(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#09090b] text-white select-none transition-opacity duration-300 ease-in-out px-4 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Preparando caderno de questões"
    >
      <style>{`
        @keyframes cyclicOuterSilky {
          0% { stroke-dashoffset: 4157; }
          45% { stroke-dashoffset: 0; }
          55% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -4157; }
        }

        @keyframes cyclicInnerSilky {
          0% { stroke-dashoffset: -2217; }
          45% { stroke-dashoffset: 0; }
          55% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 2217; }
        }

        .hippo-trans-outer {
          stroke-dasharray: 4157;
          stroke-dashoffset: 4157;
          will-change: stroke-dashoffset;
          shape-rendering: geometricPrecision;
          animation: cyclicOuterSilky 2.2s cubic-bezier(0.4, 0.0, 0.2, 1.0) infinite;
        }

        .hippo-trans-inner {
          stroke-dasharray: 2217;
          stroke-dashoffset: -2217;
          will-change: stroke-dashoffset;
          shape-rendering: geometricPrecision;
          animation: cyclicInnerSilky 2.2s cubic-bezier(0.4, 0.0, 0.2, 1.0) 0.08s infinite;
        }

        @keyframes shimmerGlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        .bar-shimmer {
          animation: shimmerGlow 1.8s infinite;
        }
      `}</style>

      {/* Halo de iluminação com a cor de acento do tema */}
      <div
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-[100px] pointer-events-none transition-all duration-700 opacity-25"
        style={{ backgroundColor: accentConfig.primaryHex }}
      />

      <div className="relative z-10 max-w-md w-full flex flex-col items-center text-center space-y-6">
        {/* Simbologia Central Hippocampus */}
        <div className="relative flex items-center justify-center p-2">
          <svg
            viewBox="185 210 1790 1500"
            style={{
              width: '82px',
              height: '68px',
              transform: 'translate3d(0, 0, 0)',
              backfaceVisibility: 'hidden'
            }}
            className="overflow-visible"
            shapeRendering="geometricPrecision"
            aria-hidden="true"
          >
            <path
              className="hippo-trans-outer"
              fill="none"
              stroke="#ffffff"
              strokeWidth={132}
              strokeMiterlimit={10}
              strokeLinecap="butt"
              shapeRendering="geometricPrecision"
              d="M 1270.756 1336.094 C 1270.756 1971.842 2360.998 1072.751 1670.993 488.16 C 1357.793 222.808 675.35 161.911 362.047 674.876 C 362.047 674.876 184.287 959.785 298.333 1070.475 C 422.801 1191.281 673.215 1042.009 854.033 1157.092"
            />
            <path
              className="hippo-trans-inner"
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

        {/* Título & Badges da Sessão */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white flex items-center justify-center gap-2">
            <span>Preparando seu Caderno</span>
            {progress >= 100 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-in zoom-in-50 duration-200" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            )}
          </h2>

          {/* Badges de Filtros Ativos */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 max-w-sm mx-auto">
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              {questionCount} {questionCount === 1 ? 'questão' : 'questões'}
            </span>
            {filterBadges.map((badge, idx) => (
              <span
                key={`${badge}-${idx}`}
                className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 truncate max-w-[180px]"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Barra de Progresso com Transição Suave */}
        <div className="w-full max-w-xs space-y-2">
          <div className="relative h-2 w-full bg-zinc-800/80 rounded-full overflow-hidden border border-zinc-700/50 shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{
                width: `${Math.min(100, Math.max(5, progress))}%`,
                backgroundColor: accentConfig.primaryHex,
                boxShadow: `0 0 12px ${accentConfig.bgRgba}`
              }}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent bar-shimmer" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium px-0.5">
            <span className="truncate">{stepMessage}</span>
            <span className="font-mono text-zinc-300 font-bold ml-2">{Math.min(100, Math.round(progress))}%</span>
          </div>
        </div>

        {/* Mensagem de Erro (se houver) */}
        {error ? (
          <div className="bg-red-950/60 border border-red-500/40 rounded-2xl p-4 text-xs text-red-200 text-left space-y-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-100">Não foi possível carregar as questões</p>
                <p className="text-red-300 mt-1">{error}</p>
              </div>
            </div>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar aos Filtros</span>
              </button>
            )}
          </div>
        ) : (
          /* Card Dinâmico de Dicas de Estudo */
          <div className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3.5 text-xs text-zinc-400 min-h-[58px] flex items-center justify-center">
            <p className="italic text-zinc-300 transition-all duration-500">
              {STUDY_TIPS[tipIndex]}
            </p>
          </div>
        )}

        {/* Fallback de Cancelamento Seguro (caso a rede oscile) */}
        {!error && showCancelFallback && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-zinc-400 hover:text-white underline underline-offset-4 transition-colors cursor-pointer pt-2"
          >
            A requisição está demorando? Clique aqui para voltar aos filtros
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionSessionTransition;
