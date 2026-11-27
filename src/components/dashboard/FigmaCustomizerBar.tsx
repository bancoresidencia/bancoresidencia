'use client';

import React, { useState } from 'react';
import {
  RotateCcw,
  Check,
  Plus,
  Layers
} from 'lucide-react';
import { DashboardCardConfig } from '@/types/dashboardLayout';

interface FigmaCustomizerBarProps {
  isCustomizing: boolean;
  selectedCardTitle?: string;
  onToggleCustomizing: () => void;
  onRestoreDefaults: () => void;
  hiddenCards: DashboardCardConfig[];
  onRestoreCard: (id: string) => void;
  onDeselect?: () => void;
}

export const FigmaCustomizerBar: React.FC<FigmaCustomizerBarProps> = ({
  isCustomizing,
  onToggleCustomizing,
  onRestoreDefaults,
  hiddenCards,
  onRestoreCard,
}) => {
  const [showHiddenMenu, setShowHiddenMenu] = useState(false);

  if (!isCustomizing) {
    return null;
  }

  return (
    <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-3 sm:px-4 animate-in slide-in-from-bottom-5 duration-300 pointer-events-none">
      <div className="bg-slate-950/94 dark:bg-zinc-950/96 backdrop-blur-xl border border-blue-500/50 dark:border-blue-400/50 text-white rounded-2xl p-2.5 sm:p-3.5 shadow-2xl flex flex-col items-center gap-2 ring-4 ring-blue-500/10 pointer-events-auto">
        {/* Ações */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {/* Cards Ocultos */}
          {hiddenCards.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowHiddenMenu((prev) => !prev)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer border border-slate-700"
                title="Cards ocultos"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Ocultos</span>
                <span className="text-[10px] sm:text-xs font-mono bg-slate-700 sm:bg-transparent px-1 sm:px-0 rounded">
                  ({hiddenCards.length})
                </span>
              </button>

              {showHiddenMenu && (
                <div className="absolute bottom-full mb-2 left-0 w-56 max-w-[calc(100vw-32px)] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 space-y-1 z-50 text-xs">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Reativar Cards
                  </div>
                  {hiddenCards.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        onRestoreCard(c.id);
                        if (hiddenCards.length <= 1) setShowHiddenMenu(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left text-slate-200 cursor-pointer group"
                    >
                      <span className="truncate">{c.title}</span>
                      <Plus className="w-3.5 h-3.5 text-blue-400 group-hover:scale-125 transition-transform shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Restaurar Padrão */}
          <button
            type="button"
            onClick={onRestoreDefaults}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors cursor-pointer border border-slate-700"
            title="Restaurar posições e tamanhos originais"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Padrão</span>
          </button>

          {/* Concluir e Auto-reajustar */}
          <button
            type="button"
            onClick={onToggleCustomizing}
            className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95 shrink-0"
            title="Concluir edição do layout"
          >
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3] shrink-0" />
            <span>Concluir</span>
          </button>
        </div>
        <p className="text-center text-xs leading-snug text-slate-300">Arraste para mover. Use as bordas para ajustar. Shift encaixa a cada 8 px.</p>
      </div>
    </div>
  );
};
