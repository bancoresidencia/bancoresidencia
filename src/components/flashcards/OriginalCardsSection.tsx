'use client';

import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Play,
  RotateCw,
  FolderPlus,
  Table,
  Trash2,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { FlashcardItem, CustomFlashcardDeck } from '@/types/flashcards';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { flashcardsService } from '@/services/flashcardsService';
import { CreateDeckModal } from './CreateDeckModal';
import { OriginalCardsBrowser } from './OriginalCardsBrowser';

interface OriginalCardsSectionProps {
  onStartStudy: (
    cards: FlashcardItem[],
    title: string,
    overridePriorityOnly?: boolean,
    allCardsMode?: boolean
  ) => void;
  onOpenAddCardForDeck: (deckId: string) => void;
}

export const OriginalCardsSection: React.FC<OriginalCardsSectionProps> = ({
  onStartStudy,
  onOpenAddCardForDeck
}) => {
  const { accentConfig } = useTheme();
  const { user } = useAuth();

  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'decks' | 'browser'>('decks');

  // Carrega decks e cartões do usuário
  const [decks, setDecks] = useState<CustomFlashcardDeck[]>(() => {
    return flashcardsService.getCustomDecks(user?.id);
  });

  const [userCards, setUserCards] = useState<FlashcardItem[]>(() => {
    return flashcardsService.loadUserCreatedFlashcards(user?.id);
  });

  const refreshData = () => {
    setDecks(flashcardsService.getCustomDecks(user?.id));
    setUserCards(flashcardsService.loadUserCreatedFlashcards(user?.id));
  };

  // Calcula contagens Anki para um conjunto de cards
  const calculateAnkiCounts = (cards: FlashcardItem[]) => {
    const now = new Date();
    let novo = 0;
    let aprender = 0;
    let revisar = 0;

    cards.forEach((c) => {
      const p = c.progress;
      if (!p || p.state === 'new' || p.repetitions === 0) {
        novo += 1;
      } else if (p.state === 'learning' || p.state === 'relearning') {
        aprender += 1;
      } else if (p.state === 'review') {
        if (!p.nextReviewDate || new Date(p.nextReviewDate) <= now) {
          revisar += 1;
        }
      }
    });

    return { novo, aprender, revisar, total: cards.length };
  };

  const handleDeleteDeck = (deckId: string, deckName: string) => {
    if (deckId === 'deck-padrao') {
      alert('O Baralho Padrão não pode ser excluído.');
      return;
    }
    if (confirm(`Deseja excluir o baralho "${deckName}"? Os cartões serão movidos para o Baralho Padrão.`)) {
      // Reatribui cards para o Baralho Padrão
      const updatedCards = userCards.map((c) =>
        c.deckId === deckId ? { ...c, deckId: 'deck-padrao' } : c
      );
      try {
        localStorage.setItem(
          user?.id
            ? `bancoresidencia_user_cards_${user.id}`
            : 'bancoresidencia_user_created_flashcards',
          JSON.stringify(updatedCards)
        );
      } catch {}
      flashcardsService.deleteCustomDeck(deckId, user?.id);
      refreshData();
    }
  };

  // Renderizador de números estilo Anki
  const renderCountNumber = (val: number, type: 'novo' | 'aprender' | 'revisar') => {
    if (val === 0) {
      return (
        <span className="font-mono text-zinc-400 dark:text-zinc-600 font-normal">
          0
        </span>
      );
    }
    if (type === 'novo') {
      return (
        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
          {val}
        </span>
      );
    }
    if (type === 'aprender') {
      return (
        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
          {val}
        </span>
      );
    }
    return (
      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
        {val}
      </span>
    );
  };

  if (viewMode === 'browser') {
    return (
      <OriginalCardsBrowser
        cards={userCards}
        decks={decks}
        onBackToDecks={() => {
          refreshData();
          setViewMode('decks');
        }}
        onRefreshCards={refreshData}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de Controle de Baralhos do Estudante */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 p-3 sm:p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <Layers className="w-4 h-4 stroke-[2.2]" />
          </div>

          <div>
            <h2 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100 leading-tight">
              Meus Baralhos &amp; Cartões Originais
            </h2>
            <p className="text-[11px] text-zinc-500">
              Crie baralhos personalizados para suas anotações, estágios e erros de prova.
            </p>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setViewMode('browser')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
            title="Abrir gerenciador e painel de cartões feitos por você"
          >
            <Table className="w-3.5 h-3.5" />
            <span>Painel de Cartões ({userCards.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateDeckOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
          >
            <FolderPlus className="w-3.5 h-3.5 text-blue-500" />
            <span>Novo Baralho</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenAddCardForDeck('deck-padrao')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5 hover:opacity-95 active:scale-98"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Novo Cartão</span>
          </button>
        </div>
      </div>

      {/* Tabela de Baralhos Estilo Anki */}
      <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Cabeçalho Anki */}
        <div className="grid grid-cols-12 items-center px-4 py-2.5 bg-zinc-50/90 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 select-none">
          <div className="col-span-7 sm:col-span-8">Baralho Autoral</div>
          <div className="col-span-1 text-right text-blue-600 dark:text-blue-400">Novo</div>
          <div className="col-span-2 sm:col-span-1 text-right text-rose-600 dark:text-rose-400">Aprender</div>
          <div className="col-span-2 sm:col-span-1 text-right text-emerald-600 dark:text-emerald-400">Revisar</div>
          <div className="hidden sm:block col-span-1 text-center text-zinc-400">Ações</div>
        </div>

        {/* Linhas dos Baralhos */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {decks.map((deck) => {
            const deckCards = userCards.filter(
              (c) => (c.deckId || 'deck-padrao') === deck.id
            );
            const counts = calculateAnkiCounts(deckCards);
            const isDefault = deck.id === 'deck-padrao';

            return (
              <div
                key={deck.id}
                className="grid grid-cols-12 items-center px-4 py-3 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors select-none group"
              >
                {/* Nome do Baralho */}
                <div className="col-span-7 sm:col-span-8 flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-black text-xs sm:text-[13px] text-zinc-900 dark:text-zinc-100 truncate">
                        {deck.name}
                      </span>
                      {isDefault && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                          Padrão
                        </span>
                      )}
                    </div>
                    {deck.description && (
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
                        {deck.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Colunas Anki */}
                <div className="col-span-1 text-right text-xs">
                  {renderCountNumber(counts.novo, 'novo')}
                </div>
                <div className="col-span-2 sm:col-span-1 text-right text-xs">
                  {renderCountNumber(counts.aprender, 'aprender')}
                </div>
                <div className="col-span-2 sm:col-span-1 text-right text-xs">
                  {renderCountNumber(counts.revisar, 'revisar')}
                </div>

                {/* Ações */}
                <div className="hidden sm:flex col-span-1 items-center justify-center gap-1.5">
                  {deckCards.length > 0 ? (
                    <button
                      type="button"
                      onClick={() =>
                        onStartStudy(
                          deckCards,
                          `${deck.name} (${deckCards.length} cards)`
                        )
                      }
                      className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-emerald-600 transition-colors cursor-pointer"
                      title="Estudar este baralho"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenAddCardForDeck(deck.id)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-blue-500 transition-colors cursor-pointer"
                      title="Adicionar cartão neste baralho"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {!isDefault && (
                    <button
                      type="button"
                      onClick={() => handleDeleteDeck(deck.id, deck.name)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Excluir baralho"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal para criar novo baralho */}
      <CreateDeckModal
        isOpen={isCreateDeckOpen}
        onClose={() => setIsCreateDeckOpen(false)}
        onDeckCreated={refreshData}
      />
    </div>
  );
};
