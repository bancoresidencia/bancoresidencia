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
  'Dica: Use as teclas A, B, C, D e E para marcar sua resposta com agilidade.',
  'Dica: Destaque sinais vitais, idade e tempo de evolução com o marca-texto.',
  'Dica: Monitore o cronômetro para manter ritmo médio abaixo de 2min30s por questão.',
  'Dica: Ao errar, revise o comentário padrão-ouro e a armadilha da banca.'
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

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % STUDY_TIPS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      setShowCancelFallback(true);
    }, 5500);
    return () => {
      clearTimeout(timer);
      setShowCancelFallback(false);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`hippo-glass-overlay backdrop-blur-xl backdrop-saturate-150 fixed inset-0 z-[100] flex flex-col items-center justify-center select-none px-4 ${
        isFadingOut ? 'pointer-events-none' : ''
      }`}
      style={{
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.015) translate3d(0, 0, 0)' : 'scale(1) translate3d(0, 0, 0)',
        WebkitBackdropFilter: 'blur(18px) saturate(175%)',
        backdropFilter: 'blur(18px) saturate(175%)',
        transition: 'opacity 240ms cubic-bezier(0.22, 1, 0.36, 1), transform 240ms cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'opacity, transform'
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Preparando caderno de questões"
    >
      <style>{`
        @keyframes hippoTransOuterGlass {
          0% { stroke-dashoffset: 1; }
          45% { stroke-dashoffset: 0; }
          55% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -1; }
        }

        @keyframes hippoTransInnerGlass {
          0% { stroke-dashoffset: -1; }
          45% { stroke-dashoffset: 0; }
          55% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 1; }
        }

        .hippo-trans-outer {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          will-change: stroke-dashoffset;
          animation: hippoTransOuterGlass 1.85s cubic-bezier(0.35, 0.0, 0.2, 1.0) infinite;
        }

        .hippo-trans-inner {
          stroke-dasharray: 1;
          stroke-dashoffset: -1;
          will-change: stroke-dashoffset;
          animation: hippoTransInnerGlass 1.85s cubic-bezier(0.35, 0.0, 0.2, 1.0) 0.06s infinite;
        }

        @keyframes hippoBarShimmer {
          0% { transform: translate3d(-100%, 0, 0); }
          100% { transform: translate3d(200%, 0, 0); }
        }

        .hippo-bar-shimmer {
          animation: hippoBarShimmer 1.5s infinite;
          will-change: transform;
        }
      `}</style>

      {/* Halo cromático difuso com a cor de acento do tema */}
      <div
        className="pointer-events-none absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full blur-[105px] opacity-20 dark:opacity-25 transition-colors duration-500"
        style={{ backgroundColor: accentConfig.primaryHex }}
        aria-hidden="true"
      />

      {/* Card Central em Vidro Jateado */}
      <div
        className="hippo-glass-capsule backdrop-blur-2xl backdrop-saturate-150 relative z-10 max-w-md w-full rounded-3xl px-6 py-7 sm:px-8 sm:py-8 flex flex-col items-center text-center space-y-5 overflow-hidden"
        style={{
          WebkitBackdropFilter: 'blur(28px) saturate(190%)',
          backdropFilter: 'blur(28px) saturate(190%)'
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/35 to-transparent"
          aria-hidden="true"
        />

        {/* Simbologia Central Hippocampus */}
        <div
          className="relative flex items-center justify-center p-1.5 text-zinc-950 dark:text-white"
          style={{ filter: `drop-shadow(0 4px 16px ${accentConfig.bgRgba})` }}
        >
          <svg
            viewBox="185 210 1790 1500"
            style={{
              width: '74px',
              height: '62px',
              transform: 'translate3d(0, 0, 0)',
              backfaceVisibility: 'hidden'
            }}
            className="overflow-visible"
            aria-hidden="true"
          >
            <path
              className="hippo-trans-outer"
              pathLength={1}
              fill="none"
              stroke="currentColor"
              strokeWidth={132}
              strokeMiterlimit={10}
              strokeLinecap="butt"
              d="M 1270.756 1336.094 C 1270.756 1971.842 2360.998 1072.751 1670.993 488.16 C 1357.793 222.808 675.35 161.911 362.047 674.876 C 362.047 674.876 184.287 959.785 298.333 1070.475 C 422.801 1191.281 673.215 1042.009 854.033 1157.092"
            />
            <path
              className="hippo-trans-inner"
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

        {/* Título & Badges da Sessão */}
        <div className="space-y-2">
          <h2 className="text-lg sm:text-xl font-black font-heading tracking-tight text-zinc-950 dark:text-white flex items-center justify-center gap-2">
            <span>Preparando Caderno</span>
            {progress >= 100 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 animate-in zoom-in-50 duration-200" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-pulse" />
            )}
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5 max-w-sm mx-auto">
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold shadow-xs"
              style={{
                backgroundColor: accentConfig.primaryHex,
                color: accentConfig.primaryContrastHex
              }}
            >
              {questionCount} {questionCount === 1 ? 'questão' : 'questões'}
            </span>
            {filterBadges.map((badge, idx) => (
              <span
                key={`${badge}-${idx}`}
                className="hippo-glass-subcard px-2.5 py-0.5 rounded-full text-xs font-semibold text-zinc-700 dark:text-zinc-200 truncate max-w-[180px]"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Barra de Progresso com Transição Suave */}
        <div className="w-full max-w-xs space-y-2">
          <div className="relative h-2 w-full bg-zinc-950/[0.08] dark:bg-white/[0.10] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-200 ease-out relative overflow-hidden"
              style={{
                width: `${Math.min(100, Math.max(8, progress))}%`,
                backgroundColor: accentConfig.primaryHex,
                boxShadow: `0 0 12px ${accentConfig.bgRgba}`
              }}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/35 to-transparent hippo-bar-shimmer" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400 font-medium px-0.5">
            <span className="truncate">{stepMessage}</span>
            <span className="font-mono tabular-nums text-zinc-800 dark:text-zinc-200 font-bold ml-2">
              {Math.min(100, Math.round(progress))}%
            </span>
          </div>
        </div>

        {error ? (
          <div className="w-full bg-red-500/10 dark:bg-red-950/55 border border-red-500/35 rounded-2xl p-4 text-xs text-red-900 dark:text-red-200 text-left space-y-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-950 dark:text-red-100">Não foi possível carregar as questões</p>
                <p className="text-red-800 dark:text-red-300 mt-1">{error}</p>
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
          <div className="hippo-glass-subcard w-full rounded-2xl p-3 text-xs min-h-[54px] flex items-center justify-center">
            <p className="text-zinc-700 dark:text-zinc-300 transition-opacity duration-300 leading-snug">
              {STUDY_TIPS[tipIndex]}
            </p>
          </div>
        )}

        {!error && showCancelFallback && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white underline underline-offset-4 transition-colors cursor-pointer pt-1"
          >
            Demorando mais que o normal? Voltar aos filtros
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionSessionTransition;
