'use client';

import React from 'react';
import { Eye, EyeOff, Brain, Sparkles } from 'lucide-react';

interface ClozeStudyToggleProps {
  isClozeMode: boolean;
  onToggleClozeMode: () => void;
  revealAll: boolean;
  onToggleRevealAll: () => void;
}

export const ClozeStudyToggle: React.FC<ClozeStudyToggleProps> = ({
  isClozeMode,
  onToggleClozeMode,
  revealAll,
  onToggleRevealAll
}) => {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onToggleClozeMode}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
          isClozeMode
            ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-sm'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700 hover:border-amber-400 dark:hover:border-amber-500'
        }`}
        title="Modo Treino Ativo: Oculta termos e conceitos-chave para você exercitar sua memória antes de clicar para revelar"
      >
        <Brain className="w-3.5 h-3.5" />
        <span>Modo Treino</span>
        {isClozeMode && (
          <span className="w-2 h-2 rounded-full bg-zinc-950 animate-pulse ml-0.5" />
        )}
      </button>

      {isClozeMode && (
        <button
          type="button"
          onClick={onToggleRevealAll}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700 cursor-pointer"
          title={revealAll ? 'Ocultar termos novamente' : 'Revelar todos os termos'}
        >
          {revealAll ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Ocultar Tudo</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Revelar Tudo</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

