'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Play,
  Trash2,
  Edit2,
  Star,
  RotateCw
} from 'lucide-react';
import { FlashcardItem, CustomFlashcardDeck } from '@/types/flashcards';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { flashcardsService, isUserCreatedFlashcardId } from '@/services/flashcardsService';
import { calculateAnkiDeckCounts } from '@/utils/ankiScheduler';
import { CreateCustomDeckModal } from './CreateCustomDeckModal';


interface CustomDecksSectionProps {
  allFlashcards: FlashcardItem[];
  onStartStudy: (
    cards: FlashcardItem[],
    title: string,
    overridePriorityOnly?: boolean,
    allCardsMode?: boolean
  ) => void;
  onOpenCustomStudy?: (cards: FlashcardItem[], title: string) => void;
  onDeckCountChange?: (count: number) => void;
  onCardsChange?: () => void;
}

export const CustomDecksSection: React.FC<CustomDecksSectionProps> = ({
  allFlashcards,
  onStartStudy,
  onOpenCustomStudy,
  onDeckCountChange,
  onCardsChange
}) => {
  const { accentConfig } = useTheme();
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [deckToEdit, setDeckToEdit] = useState<CustomFlashcardDeck | null>(null);

  // Baralhos personalizados do estudante
  const [decks, setDecks] = useState<CustomFlashcardDeck[]>(() => {
    return flashcardsService.getPersonalizedDecks(user?.id);
  });

  useEffect(() => {
    const localDecks = flashcardsService.getPersonalizedDecks(user?.id);
    setDecks(localDecks);
    if (user?.id) {
      flashcardsService.syncRemotePersonalizedDecks(user.id).then((synced) => {
        setDecks(synced);
        if (onDeckCountChange) {
          onDeckCountChange(synced.length);
        }
      });
    }
  }, [user?.id, onDeckCountChange]);

  const refreshDecks = () => {
    const updated = flashcardsService.getPersonalizedDecks(user?.id);
    setDecks(updated);
    if (onDeckCountChange) {
      onDeckCountChange(updated.length);
    }
    onCardsChange?.();
  };

  const handleDeleteDeck = (deckId: string, deckName: string) => {
    if (confirm(`Deseja excluir o baralho personalizado "${deckName}"?`)) {
      flashcardsService.deletePersonalizedDeck(deckId, user?.id);
      refreshDecks();
    }
  };

  const handleEditDeck = (deck: CustomFlashcardDeck) => {
    setDeckToEdit(deck);
    setIsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setDeckToEdit(null);
    setIsModalOpen(true);
  };

  // Calcula contagens Anki para um baralho personalizado
  const getDeckStats = (deck: CustomFlashcardDeck) => {
    const userCustomDecks = flashcardsService.getCustomDecks(user?.id);
    const cards = flashcardsService.resolvePersonalizedDeckCards(
      deck,
      allFlashcards,
      userCustomDecks
    );
    const counts = calculateAnkiDeckCounts(cards);

    const brCount = cards.filter((c) => !isUserCreatedFlashcardId(c.id)).length;
    const userCount = cards.filter((c) => isUserCreatedFlashcardId(c.id)).length;

    return {
      cards,
      novo: counts.novo,
      aprender: counts.aprender,
      revisar: counts.revisar,
      total: counts.total,
      brCount,
      userCount
    };
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

  return (
    <div className="space-y-4">
      {/* Barra de Controle de Baralhos Personalizados */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 p-3 sm:p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <Sparkles className="w-4 h-4 stroke-[2.2]" />
          </div>

          <div>
            <h2 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100 leading-tight">
              Baralhos Personalizados &amp; Mistos
            </h2>
            <p className="text-[11px] text-zinc-500">
              Junte tópicos do Banco Residência com seus cartões autorais em um só estudo.
            </p>
          </div>
        </div>

        {/* Botão de Criação */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-xs inline-flex items-center justify-center gap-1.5 hover:opacity-95 active:scale-98"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Novo Baralho Personalizado</span>
          </button>
        </div>
      </div>

      {/* Lista / Tabela de Baralhos ou Empty State */}
      {decks.length === 0 ? (
        <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-8 sm:p-12 text-center shadow-xs space-y-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="font-heading font-black text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
              Crie seu Primeiro Baralho Personalizado
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Você pode selecionar especialidades inteiras do Banco Residência, aplicar o filtro de cartões essenciais e misturar com suas anotações autorais para um estudo focado.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-xs inline-flex items-center gap-2 hover:opacity-95 active:scale-98"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Criar Baralho Personalizado Agora</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 rounded-2xl shadow-xs overflow-hidden">
          {/* Cabeçalho Anki */}
          <div className="grid grid-cols-12 items-center px-3.5 sm:px-4 py-2.5 bg-zinc-50/90 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 select-none">
            <div className="col-span-6 sm:col-span-8 truncate">Baralho Personalizado</div>
            <div className="col-span-2 sm:col-span-1 text-right text-blue-600 dark:text-blue-400">Novo</div>
            <div className="col-span-2 sm:col-span-1 text-right text-rose-600 dark:text-rose-400">
              <span className="sm:hidden">Apr.</span>
              <span className="hidden sm:inline">Aprender</span>
            </div>
            <div className="col-span-2 sm:col-span-1 text-right text-emerald-600 dark:text-emerald-400">
              <span className="sm:hidden">Rev.</span>
              <span className="hidden sm:inline">Revisar</span>
            </div>
            <div className="hidden sm:block col-span-1 text-center text-zinc-400">Ações</div>
          </div>

          {/* Linhas dos Baralhos */}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {decks.map((deck) => {
              const stats = getDeckStats(deck);

              return (
                <div
                  key={deck.id}
                  className="grid grid-cols-12 items-center px-3.5 sm:px-4 py-3 sm:py-3.5 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors select-none group"
                >
                  {/* Nome e Composição do Baralho (clicável para estudar ou editar) */}
                  <div
                    onClick={() => {
                      if (stats.cards.length > 0) {
                        onStartStudy(stats.cards, `${deck.name} (${stats.cards.length} cards)`);
                      } else {
                        handleEditDeck(deck);
                      }
                    }}
                    className="col-span-6 sm:col-span-8 flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2 cursor-pointer touch-manipulation"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-black text-xs sm:text-[13px] text-zinc-900 dark:text-zinc-100 truncate">
                          {deck.name}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${deck.deckType === 'smart' ||
                              (deck.dynamicFilters && deck.dynamicFilters.length > 0)
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            }`}
                        >
                          {deck.deckType === 'smart' ||
                            (deck.dynamicFilters && deck.dynamicFilters.length > 0)
                            ? 'Smart'
                            : 'Misto'}
                        </span>

                        {deck.priorityOnly && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 inline-flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            <span>Essenciais</span>
                          </span>
                        )}
                      </div>

                      {/* Subtítulo com detalhes e badges de matérias */}
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 flex-wrap">
                        {deck.selectedNodeKeys && deck.selectedNodeKeys.length > 0 ? (
                          <span>
                            {deck.selectedNodeKeys.length} {deck.selectedNodeKeys.length === 1 ? 'tópico do BR' : 'tópicos do BR'}
                            {deck.specialties && deck.specialties.length > 0 ? ` (${deck.specialties.join(', ')})` : ''}
                          </span>
                        ) : deck.specialties && deck.specialties.length > 0 ? (
                          <span>
                            {deck.specialties.join(', ')}
                          </span>
                        ) : null}

                        <span>•</span>
                        <span className="font-mono text-zinc-500 dark:text-zinc-400">
                          {stats.brCount} BR + {stats.userCount} autorais ({stats.total} total)
                        </span>

                        {deck.description && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[200px] text-zinc-400">
                              {deck.description}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Colunas Anki */}
                  <div className="col-span-2 sm:col-span-1 text-right text-xs">
                    {renderCountNumber(stats.novo, 'novo')}
                  </div>
                  <div className="col-span-2 sm:col-span-1 text-right text-xs">
                    {renderCountNumber(stats.aprender, 'aprender')}
                  </div>
                  <div className="col-span-2 sm:col-span-1 text-right text-xs">
                    {renderCountNumber(stats.revisar, 'revisar')}
                  </div>

                  {/* Ações Desktop e Barra Compacta Mobile */}
                  <div className="col-span-12 sm:col-span-1 flex items-center justify-end sm:justify-center gap-1.5 sm:gap-1 pt-2.5 mt-2 sm:pt-0 sm:mt-0 border-t border-zinc-100 dark:border-zinc-800/60 sm:border-0">
                    {stats.cards.length > 0 ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            onStartStudy(
                              stats.cards,
                              `${deck.name} (${stats.cards.length} cards)`
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:p-1.5 min-h-[34px] sm:min-h-0 rounded-lg text-[11px] font-bold bg-emerald-600 text-white sm:bg-transparent sm:text-zinc-400 sm:hover:text-white sm:hover:bg-emerald-600 transition-colors cursor-pointer touch-manipulation"
                          title="Estudar este baralho personalizado"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span className="sm:hidden">Estudar</span>
                        </button>
                        {onOpenCustomStudy && (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenCustomStudy(
                                stats.cards,
                                `Estudo Personalizado: ${deck.name}`
                              )
                            }
                            className="inline-flex items-center gap-1 px-2 py-1.5 sm:p-1.5 min-h-[34px] sm:min-h-0 rounded-lg text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-blue-600 transition-colors cursor-pointer touch-manipulation"
                            title="Estudo Personalizado (Sem alterar FSRS)"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] text-zinc-400 font-mono px-1">0 cards</span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleEditDeck(deck)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:p-1.5 min-h-[34px] sm:min-h-0 rounded-lg text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800/80 sm:bg-transparent text-zinc-600 dark:text-zinc-300 sm:text-zinc-400 hover:text-blue-500 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer touch-manipulation"
                      title="Editar composição do baralho"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="sm:hidden">Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteDeck(deck.id, deck.name)}
                      className="inline-flex items-center justify-center p-2 sm:p-1.5 min-w-[34px] min-h-[34px] sm:min-w-0 sm:min-h-0 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer touch-manipulation"
                      title="Excluir baralho personalizado"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Criação / Edição */}
      <CreateCustomDeckModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setDeckToEdit(null);
        }}
        onDeckSaved={refreshDecks}
        allFlashcards={allFlashcards}
        deckToEdit={deckToEdit}
      />
    </div>
  );
};
