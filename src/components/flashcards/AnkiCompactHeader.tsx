'use client';

import React from 'react';
import {
  Brain,
  Play,
  Shuffle,
  Star,
  Plus
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface AnkiCompactHeaderProps {
  totalCards: number;
  newCardsCount: number;
  learningCardsCount: number;
  dueTodayCount: number;
  essentialCardsCount: number;
  filterEssentialOnly: boolean;
  onToggleFilterEssentialOnly: () => void;
  isShuffleEnabled: boolean;
  onToggleShuffle: () => void;
  onOpenAddCard: () => void;
  lastSessionTitle?: string | null;
  onContinueLastSession?: () => void;
}

export const AnkiCompactHeader: React.FC<AnkiCompactHeaderProps> = ({
  totalCards,
  newCardsCount,
  learningCardsCount,
  dueTodayCount,
  essentialCardsCount,
  filterEssentialOnly,
  onToggleFilterEssentialOnly,
  isShuffleEnabled,
  onToggleShuffle,
  onOpenAddCard,
  lastSessionTitle,
  onContinueLastSession
}) => {
  const { accentConfig } = useTheme();

  return (
    <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl shadow-xs transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Esquerda: Identificação Discreta + Pill de Total */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
            style={{
              backgroundColor: accentConfig.bgRgba,
              color: accentConfig.primaryHex,
              border: `1px solid ${accentConfig.borderRgba}`
            }}
          >
            <Brain className="w-4 h-4 stroke-[2.2]" />
          </div>

          <div className="flex items-center gap-2">
            <h1 className="font-heading text-sm sm:text-base font-black text-slate-900 dark:text-zinc-100 tracking-tight">
              Flashcards
            </h1>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60">
              {totalCards} cards
            </span>
          </div>
        </div>

        {/* Centro: Métricas Clássicas Anki (Novo, Aprender, Revisar) */}
        <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 flex-wrap">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-[11px] sm:text-xs"
            title="Cartões novos aguardando primeiro contato"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            <span className="text-zinc-500 dark:text-zinc-400 font-medium hidden sm:inline">Novo:</span>
            <span className="font-mono font-black text-blue-600 dark:text-blue-400">
              {newCardsCount}
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-[11px] sm:text-xs"
            title="Cartões em processo de aprendizagem ativa ou relearning"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span className="text-zinc-500 dark:text-zinc-400 font-medium hidden sm:inline">Aprender:</span>
            <span className="font-mono font-black text-rose-600 dark:text-rose-400">
              {learningCardsCount}
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-[11px] sm:text-xs"
            title="Cartões consolidados agendados para revisão hoje no FSRS"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-zinc-500 dark:text-zinc-400 font-medium hidden sm:inline">Revisar:</span>
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
              {dueTodayCount}
            </span>
          </div>
        </div>

        {/* Direita: Ações Rápidas Ultra-Compactas */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
          {/* Botão de Continuar Sessão Anterior (se existir) */}
          {onContinueLastSession && (
            <button
              type="button"
              onClick={onContinueLastSession}
              title={lastSessionTitle ? `Continuar: ${lastSessionTitle}` : 'Continuar última sessão'}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-2xs hover:opacity-95 active:scale-98 transition-all inline-flex items-center gap-1 cursor-pointer shrink-0"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <Play className="w-3 h-3 fill-current" />
              <span className="hidden sm:inline">Continuar</span>
            </button>
          )}

          {/* Botão Toggle Só Essenciais */}
          <button
            type="button"
            onClick={onToggleFilterEssentialOnly}
            title={
              filterEssentialOnly
                ? 'Filtro ativado: mostrando apenas cards essenciais de alta incidência'
                : 'Clique para filtrar apenas os cards essenciais de prova'
            }
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer shadow-2xs active:scale-98 shrink-0 ${
              filterEssentialOnly
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20'
                : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                filterEssentialOnly ? 'fill-amber-500 text-amber-500' : 'text-zinc-400'
              }`}
            />
            <span className="hidden md:inline">Essenciais</span>
            <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-900 dark:text-amber-200">
              {essentialCardsCount}
            </span>
          </button>

          {/* Botão Toggle Embaralhar */}
          <button
            type="button"
            onClick={onToggleShuffle}
            title={
              isShuffleEnabled
                ? 'Embaralhar flashcards ativado (Clique para ordem fixa)'
                : 'Ordem fixa (Clique para embaralhar)'
            }
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border shadow-2xs active:scale-98 shrink-0 ${
              isShuffleEnabled
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                : 'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{isShuffleEnabled ? 'Embaralhar: ON' : 'Embaralhar: OFF'}</span>
          </button>

          {/* Botão + Criar Flashcard */}
          <button
            type="button"
            onClick={onOpenAddCard}
            title="Criar novo flashcard autoral com suporte a oclusão cloze"
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-xs flex items-center gap-1 hover:opacity-95 active:scale-98 shrink-0"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Criar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

