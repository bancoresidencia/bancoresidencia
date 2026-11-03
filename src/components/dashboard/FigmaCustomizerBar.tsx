'use client';

import React, { useState } from 'react';
import {
  RotateCcw,
  Check,
  Plus,
  Layers,
  Sparkles
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
  selectedCardTitle,
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
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-3 sm:px-4 animate-in slide-in-from-bottom-5 duration-300 pb-[env(safe-area-inset-bottom)] pointer-events-none">
      <div className="bg-slate-950/94 dark:bg-zinc-950/96 backdrop-blur-xl border border-blue-500/50 dark:border-blue-400/50 text-white rounded-2xl p-2.5 sm:p-3.5 shadow-2xl flex items-center justify-between gap-2 sm:gap-3 ring-4 ring-blue-500/10 pointer-events-auto">
        {/* Info & Status */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] sm:text-xs font-extrabold tracking-wide uppercase text-blue-400 shrink-0">
                Personalização Ativa
              </span>
              {selectedCardTitle ? (
                <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full font-semibold max-w-[110px] sm:max-w-[200px] truncate">
                  {selectedCardTitle}
                </span>
              ) : (
                <span className="text-[10px] bg-white/10 text-slate-300 px-1.5 py-0.5 rounded hidden xs:inline-block">
                  Toque para editar
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 hidden md:block truncate">
              Clique em qualquer card para selecionar e arraste para reposicionar.
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
                <div className="absolute bottom-full mb-2 right-0 w-64 max-w-[calc(100vw-32px)] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 space-y-1 z-50 text-xs">
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
            title="Salvar layout e conformar posições"
          >
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3] shrink-0" />
            <span>Concluir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
