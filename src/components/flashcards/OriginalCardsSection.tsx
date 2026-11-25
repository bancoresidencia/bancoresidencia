'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Layers,
  Plus,
  Play,
  FolderPlus,
  Table,
  Trash2,
  BookOpen,
  FileSpreadsheet,
  RotateCw,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Sparkles,
  CheckCircle2,
  X
} from 'lucide-react';
import {
  FlashcardItem,
  CustomFlashcardDeck,
  DynamicFilterCriterion
} from '@/types/flashcards';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { flashcardsService } from '@/services/flashcardsService';
import {
  buildOriginalDeckTree,
  flattenOriginalDeckTree,
  matchesDynamicFilterCriteria
} from '@/utils/ankiDeckTree';
import { CreateDeckModal } from './CreateDeckModal';
import { OriginalCardsBrowser } from './OriginalCardsBrowser';
import { CsvFlashcardImportModal } from './CsvFlashcardImportModal';
import { OriginalCardsFilterBar } from './OriginalCardsFilterBar';

interface OriginalCardsSectionProps {
  onStartStudy: (
    cards: FlashcardItem[],
    title: string,
    overridePriorityOnly?: boolean,
    allCardsMode?: boolean
  ) => void;
  onOpenCustomStudy?: (cards: FlashcardItem[], title: string) => void;
  onOpenAddCardForDeck: (deckId: string) => void;
  onCardsChange?: () => void;
}

export const OriginalCardsSection: React.FC<OriginalCardsSectionProps> = ({
  onStartStudy,
  onOpenCustomStudy,
  onOpenAddCardForDeck,
  onCardsChange
}) => {
  const { accentConfig } = useTheme();
  const { user } = useAuth();

  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false);
  const [createSubDeckParentPath, setCreateSubDeckParentPath] = useState<string | null>(null);
  const [expandedDeckPaths, setExpandedDeckPaths] = useState<Record<string, boolean>>({});
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'decks' | 'browser'>('decks');
  const [saveFilterModal, setSaveFilterModal] = useState<{
    name: string;
    isDynamic: boolean;
  } | null>(null);
  const [sectionToast, setSectionToast] = useState<string | null>(null);

  // Estado dos Filtros Dinâmicos
  const [activeFilters, setActiveFilters] = useState<DynamicFilterCriterion[]>([]);

  // Carrega decks e cartões do usuário
  const [decks, setDecks] = useState<CustomFlashcardDeck[]>(() => {
    return flashcardsService.getCustomDecks(user?.id);
  });

  const [userCards, setUserCards] = useState<FlashcardItem[]>(() => {
    return flashcardsService.getUserCreatedFlashcardsWithProgress(user?.id);
  });

  useEffect(() => {
    setDecks(flashcardsService.getCustomDecks(user?.id));
    setUserCards(flashcardsService.getUserCreatedFlashcardsWithProgress(user?.id));
    if (user?.id) {
      flashcardsService.syncRemoteDecks(user.id).then((syncedDecks) => {
        setDecks(syncedDecks);
      });
      flashcardsService.syncRemoteUserCreatedCards(user.id).then(() => {
        setUserCards(flashcardsService.getUserCreatedFlashcardsWithProgress(user.id));
      });
      flashcardsService.syncRemoteProgress(user.id).then(() => {
        setUserCards(flashcardsService.getUserCreatedFlashcardsWithProgress(user.id));
      });
    }
  }, [user?.id]);

  const refreshData = () => {
    setDecks(flashcardsService.getCustomDecks(user?.id));
    setUserCards(flashcardsService.getUserCreatedFlashcardsWithProgress(user?.id));
    onCardsChange?.();
  };

  // Extrai tags únicas disponíveis nos cartões
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    userCards.forEach((c) => {
      c.tags?.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet);
  }, [userCards]);

  // Aplica os filtros dinâmicos aos cartões do usuário
  const filteredCards = useMemo(() => {
    if (activeFilters.length === 0) return userCards;
    const now = new Date();
    return userCards.filter((card) =>
      matchesDynamicFilterCriteria(card, activeFilters, decks, now)
    );
  }, [userCards, activeFilters, decks]);

  const deckTree = useMemo(() => {
    return buildOriginalDeckTree(decks, filteredCards);
  }, [decks, filteredCards]);

  const visibleDeckNodes = useMemo(() => {
    return flattenOriginalDeckTree(deckTree, expandedDeckPaths);
  }, [deckTree, expandedDeckPaths]);

  const toggleDeckExpand = (fullPath: string) => {
    setExpandedDeckPaths((prev) => ({
      ...prev,
      [fullPath]: prev[fullPath] !== undefined ? !prev[fullPath] : false
    }));
  };

  // Manipulação de filtros
  const handleAddFilter = (criterion: DynamicFilterCriterion) => {
    setActiveFilters((prev) => [...prev, criterion]);
  };

  const handleRemoveFilter = (id: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearFilters = () => {
    setActiveFilters([]);
  };

  // Salvar a seleção atual como novo baralho personalizado (Smart Deck Dinâmico por padrão)
  const handleSaveAsCustomDeck = () => {
    if (filteredCards.length === 0) {
      setSectionToast('Não há cartões que correspondam aos filtros selecionados.');
      setTimeout(() => setSectionToast(null), 3500);
      return;
    }

    const defaultName = `Filtro: ${activeFilters.map((f) => f.label.split(':')[0]).join(', ')}`;
    setSaveFilterModal({ name: defaultName, isDynamic: true });
  };

  const handleConfirmSaveFilterDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveFilterModal || !saveFilterModal.name.trim()) return;

    const newDeck: CustomFlashcardDeck = {
      id: `deck-pers-${Date.now()}`,
      name: saveFilterModal.name.trim(),
      description: `Filtros: ${activeFilters.map((f) => f.label).join(' | ')}`,
      specialties: [],
      dynamicFilters: saveFilterModal.isDynamic ? activeFilters : undefined,
      cardIds: saveFilterModal.isDynamic ? undefined : filteredCards.map((c) => c.id),
      deckType: saveFilterModal.isDynamic ? 'smart' : 'original',
      createdAt: new Date().toISOString()
    };

    flashcardsService.savePersonalizedDeck(newDeck, user?.id);
    setSaveFilterModal(null);
    onCardsChange?.();
    setSectionToast(
      `${saveFilterModal.isDynamic ? 'Smart Deck' : 'Baralho'} "${newDeck.name}" salvo em Baralhos Personalizados!`
    );
    setTimeout(() => setSectionToast(null), 4000);
  };

  const handleDeleteDeck = (deckId: string, deckName: string) => {
    if (deckId === 'deck-padrao') {
      alert('O Baralho Padrão não pode ser excluído.');
      return;
    }
    if (
      confirm(
        `Deseja excluir o baralho "${deckName}"? Os cartões serão movidos para o Baralho Padrão.`
      )
    ) {
      flashcardsService.migrateUserCardsDeck(deckId, 'deck-padrao', user?.id);
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
        cards={filteredCards}
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
              Crie baralhos personalizados, importe pacotes do Anki (.apkg, .colpkg), planilhas (.csv, .tsv) ou notas (.txt).
            </p>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsCsvModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
            title="Importar flashcards em lote a partir do Anki (.apkg, .colpkg), planilhas (.csv, .tsv) ou notas (.txt)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Importar Flashcards</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('browser')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
            title="Abrir gerenciador e painel de cartões feitos por você"
          >
            <Table className="w-3.5 h-3.5" />
            <span>Painel ({userCards.length})</span>
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

      {/* Barra de Filtros Dinâmicos Manipuláveis pelo Estudante */}
      <OriginalCardsFilterBar
        activeFilters={activeFilters}
        onAddFilter={handleAddFilter}
        onRemoveFilter={handleRemoveFilter}
        onClearFilters={handleClearFilters}
        totalCards={userCards.length}
        filteredCount={filteredCards.length}
        onStudyFilteredCards={() => {
          if (onOpenCustomStudy) {
            onOpenCustomStudy(
              filteredCards,
              `Cartões Originais Filtrados (${filteredCards.length} cards)`
            );
          } else {
            onStartStudy(
              filteredCards,
              `Cartões Originais Filtrados (${filteredCards.length} cards)`
            );
          }
        }}
        onSaveAsDeck={handleSaveAsCustomDeck}
        availableDecks={decks}
        availableTags={availableTags}
      />

      {/* Tabela de Baralhos Estilo Anki */}
      <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Cabeçalho Anki */}
        <div className="grid grid-cols-12 items-center px-3.5 sm:px-4 py-2.5 bg-zinc-50/90 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 select-none">
          <div className="col-span-6 sm:col-span-8 truncate">Baralho Autoral</div>
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

        {/* Linhas Hierárquicas dos Baralhos (Suporte Pai::Filho estilo Anki) */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {visibleDeckNodes.map(({ node, hasChildren, isExpanded }) => {
            const deck = node.deck;
            const deckCards = node.aggregatedCards;
            const counts = node.counts;
            const isDefault = deck?.id === 'deck-padrao';

            return (
              <div
                key={node.fullPath}
                className="grid grid-cols-12 items-center px-3.5 sm:px-4 py-3 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors select-none group"
              >
                {/* Nome do Baralho com indentação hierárquica Pai::Filho */}
                <div
                  className="col-span-6 sm:col-span-8 flex items-center gap-1.5 sm:gap-2 min-w-0 pr-2"
                  style={{ paddingLeft: `${node.depth * 18}px` }}
                >
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDeckExpand(node.fullPath);
                      }}
                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                      title={isExpanded ? 'Recolher sub-baralhos' : 'Expandir sub-baralhos'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  ) : (
                    <span className="w-5 shrink-0" />
                  )}

                  <div
                    onClick={() => {
                      if (deckCards.length > 0) {
                        onStartStudy(deckCards, `${node.fullPath} (${deckCards.length} cards)`);
                      } else if (deck) {
                        onOpenAddCardForDeck(deck.id);
                      } else {
                        setCreateSubDeckParentPath(node.fullPath);
                        setIsCreateDeckOpen(true);
                      }
                    }}
                    className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer touch-manipulation"
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${hasChildren || !deck
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}
                    >
                      {hasChildren || !deck ? (
                        <FolderOpen className="w-4 h-4" />
                      ) : (
                        <BookOpen className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="font-heading font-black text-xs sm:text-[13px] text-zinc-900 dark:text-zinc-100 truncate">
                          {node.label}
                        </span>
                        {isDefault && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                            Padrão
                          </span>
                        )}
                        {hasChildren && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-indigo-100/70 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold">
                            {node.children.length} sub
                          </span>
                        )}
                        {activeFilters.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-100/70 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold">
                            {deckCards.length} filtrados
                          </span>
                        )}
                      </div>
                      {deck?.description && (
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
                          {deck.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Colunas Anki (agregadas quando há sub-baralhos) */}
                <div className="col-span-2 sm:col-span-1 text-right text-xs">
                  {renderCountNumber(counts.novo, 'novo')}
                </div>
                <div className="col-span-2 sm:col-span-1 text-right text-xs">
                  {renderCountNumber(counts.aprender, 'aprender')}
                </div>
                <div className="col-span-2 sm:col-span-1 text-right text-xs">
                  {renderCountNumber(counts.revisar, 'revisar')}
                </div>

                {/* Ações Desktop e Mobile */}
                <div className="col-span-12 sm:col-span-1 flex items-center justify-end sm:justify-center gap-1 pt-2.5 mt-2 sm:pt-0 sm:mt-0 border-t border-zinc-100 dark:border-zinc-800/60 sm:border-0">
                  {deckCards.length > 0 ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          onStartStudy(
                            deckCards,
                            `${node.fullPath} (${deckCards.length} cards)`
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:p-1 min-h-[34px] sm:min-h-0 rounded-lg text-[11px] font-bold bg-emerald-600 text-white sm:bg-transparent sm:text-zinc-400 sm:hover:text-white sm:hover:bg-emerald-600 transition-colors cursor-pointer touch-manipulation"
                        title="Estudar este baralho"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span className="sm:hidden">Estudar</span>
                      </button>
                      {onOpenCustomStudy && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenCustomStudy(
                              deckCards,
                              `Estudo Personalizado: ${node.fullPath}`
                            )
                          }
                          className="inline-flex items-center gap-1 px-2 py-1.5 sm:p-1 min-h-[34px] sm:min-h-0 rounded-lg text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-blue-600 transition-colors cursor-pointer touch-manipulation"
                          title="Estudo Personalizado (Sem alterar FSRS)"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  ) : deck ? (
                    <button
                      type="button"
                      onClick={() => onOpenAddCardForDeck(deck.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:p-1 min-h-[34px] sm:min-h-0 rounded-lg text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800/80 sm:bg-transparent text-zinc-600 dark:text-zinc-300 sm:text-zinc-400 hover:text-blue-500 transition-colors cursor-pointer touch-manipulation"
                      title="Adicionar cartão neste baralho"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="sm:hidden">Adicionar</span>
                    </button>
                  ) : null}

                  {!isDefault && (
                    <button
                      type="button"
                      onClick={() => {
                        setCreateSubDeckParentPath(node.fullPath);
                        setIsCreateDeckOpen(true);
                      }}
                      className="inline-flex items-center justify-center p-2 sm:p-1 min-w-[34px] min-h-[34px] sm:min-w-0 sm:min-h-0 rounded-lg text-zinc-400 hover:text-blue-500 transition-colors cursor-pointer touch-manipulation"
                      title={`Criar sub-baralho dentro de ${node.label}`}
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {deck && !isDefault && (
                    <button
                      type="button"
                      onClick={() => handleDeleteDeck(deck.id, deck.name)}
                      className="inline-flex items-center justify-center p-2 sm:p-1 min-w-[34px] min-h-[34px] sm:min-w-0 sm:min-h-0 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer touch-manipulation"
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

      {/* Modal para criar novo baralho / sub-baralho */}
      <CreateDeckModal
        isOpen={isCreateDeckOpen}
        initialParentPath={createSubDeckParentPath}
        onClose={() => {
          setIsCreateDeckOpen(false);
          setCreateSubDeckParentPath(null);
        }}
        onDeckCreated={refreshData}
      />

      {/* Modal para importar flashcards */}
      <CsvFlashcardImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportSuccess={(count) => {
          refreshData();
          setSectionToast(`${count} flashcards importados em Cartões Originais!`);
          setTimeout(() => setSectionToast(null), 4000);
        }}
      />

      {/* Modal para salvar filtros atuais como Smart Deck / Baralho Personalizado */}
      {saveFilterModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSaveFilterModal(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <h3 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                  Salvar Filtro como Baralho
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSaveFilterModal(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmSaveFilterDeck} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Nome do Baralho *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={saveFilterModal.name}
                  onChange={(e) =>
                    setSaveFilterModal((prev) =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveFilterModal.isDynamic}
                  onChange={(e) =>
                    setSaveFilterModal((prev) =>
                      prev ? { ...prev, isDynamic: e.target.checked } : null
                    )
                  }
                  className="mt-0.5 rounded text-blue-600"
                />
                <div className="min-w-0">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                    Baralho Dinâmico (Smart Deck)
                  </span>
                  <span className="text-[11px] text-zinc-500 block">
                    Novos cartões criados futuramente que atendam aos {activeFilters.length} filtro(s) entrarão automaticamente.
                  </span>
                </div>
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSaveFilterModal(null)}
                  className="px-3.5 py-2 rounded-xl font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold text-white shadow-xs cursor-pointer"
                  style={{ backgroundColor: accentConfig.primaryHex }}
                >
                  Criar Smart Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {sectionToast && (
        <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-2xl text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{sectionToast}</span>
        </div>
      )}
    </div>
  );
};
