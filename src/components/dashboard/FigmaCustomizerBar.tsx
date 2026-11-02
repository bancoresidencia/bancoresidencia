'use client';

import React, { useState } from 'react';
import {
  RotateCcw,
  Check,
  Plus,
  Layers,
  Sparkles,
  MousePointer
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
  onDeselect,
}) => {
  const [showHiddenMenu, setShowHiddenMenu] = useState(false);

  if (!isCustomizing) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-950/92 dark:bg-zinc-950/95 backdrop-blur-xl border border-blue-500/50 dark:border-blue-400/50 text-white rounded-2xl p-3.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 ring-4 ring-blue-500/10">
        {/* Info & Status */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold tracking-wide uppercase text-blue-400">
                Personalização Ativa
              </span>
              {selectedCardTitle ? (
                <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full font-semibold">
                  Card: {selectedCardTitle}
                </span>
              ) : (
                <span className="text-[10px] bg-white/10 text-slate-300 px-1.5 py-0.5 rounded">
                  Clique em um card para editar
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 hidden sm:block">
              Clique em qualquer card para selecionar. Segure e arraste no meio para mover.
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2">
          {/* Cards Ocultos */}
          {hiddenCards.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowHiddenMenu((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer border border-slate-700"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Ocultos ({hiddenCards.length})</span>
              </button>

              {showHiddenMenu && (
                <div className="absolute bottom-full mb-2 right-0 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 space-y-1 z-50 text-xs">
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
                      <Plus className="w-3.5 h-3.5 text-blue-400 group-hover:scale-125 transition-transform" />
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
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Padrão</span>
          </button>

          {/* Concluir e Auto-reajustar */}
          <button
            type="button"
            onClick={onToggleCustomizing}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
            title="Salvar layout e conformar posições"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Concluir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
