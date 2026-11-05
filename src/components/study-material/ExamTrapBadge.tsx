'use client';

import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Sparkles, ShieldAlert } from 'lucide-react';

interface ExamTrapBadgeProps {
  banca?: string;
  trapText: string;
  correctionText?: string;
  defaultExpanded?: boolean;
}

export const ExamTrapBadge: React.FC<ExamTrapBadgeProps> = ({
  banca = 'Bancas de Residência',
  trapText,
  correctionText,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  return (
    <div className="my-4 rounded-2xl border border-rose-200/90 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/20 overflow-hidden shadow-xs transition-all">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 p-3.5 sm:p-4 text-left cursor-pointer hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-xs sm:text-sm text-rose-900 dark:text-rose-200">
                Alerta de Pegadinha em Prova
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-200/60 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300">
                {banca}
              </span>
            </div>
            <p className="text-[11px] text-rose-700 dark:text-rose-300/80 line-clamp-1">
              {trapText}
            </p>
          </div>
        </div>

        <div className="text-rose-600 dark:text-rose-400 p-1">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-rose-200/60 dark:border-rose-900/40 text-xs text-rose-950 dark:text-rose-100 space-y-2 animate-in fade-in">
          <div>
            <strong className="font-bold text-rose-800 dark:text-rose-300">Como a banca tenta enganar: </strong>
            <span className="leading-relaxed">{trapText}</span>
          </div>

          {correctionText && (
            <div className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-rose-200/50 dark:border-rose-900/30 text-[11px] leading-relaxed text-zinc-800 dark:text-zinc-200">
              <strong className="font-bold text-emerald-600 dark:text-emerald-400">Resposta Padrão-Ouro: </strong>
              {correctionText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

