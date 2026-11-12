'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Sparkles,
  X,
  Check,
  Search,
  CheckSquare,
  Square,
  Star,
  Layers,
  Info,
  ListFilter,
  Eye,
  EyeOff,
  Minus,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  FileSpreadsheet
} from 'lucide-react';
import { FlashcardItem, CustomFlashcardDeck } from '@/types/flashcards';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { flashcardsService } from '@/services/flashcardsService';
import { CsvFlashcardImportModal } from './CsvFlashcardImportModal';
import { formatSubSubfocoDisplay } from '@/components/AdvancedQuestionFilters';
import { clinicalHierarchy } from '@/data/mockQuestions';
import {
  normalizeText,
  buildHierarchyCardsCache,
  resolveCardsFromHierarchyKeys
} from '@/utils/specialtyMatcher';

interface CreateCustomDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeckSaved: () => void;
  allFlashcards: FlashcardItem[];
  deckToEdit?: CustomFlashcardDeck | null;
}

interface InspectingTopicState {
  title: string;
  breadcrumb: string;
  cards: FlashcardItem[];
}

// Renderizador visual limpo para cloze deletion {{c1::termo}}
function renderClozeSnippet(text: string) {
  if (!text) return null;
  const parts = text.split(/(\{\{c\d+::[^}]+?\}\})/g);
  return parts.map((part, i) => {
    const match = part.match(/\{\{c\d+::([^}]+?)\}\}/);
    if (match) {
      return (
        <span
          key={i}
          className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 mx-0.5"
        >
          [{match[1]}]
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export const CreateCustomDeckModal: React.FC<CreateCustomDeckModalProps> = ({
  isOpen,
  onClose,
  onDeckSaved,
  allFlashcards,
  deckToEdit
}) => {
  const { accentConfig } = useTheme();
  const { user } = useAuth();

  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [expandedSubNodes, setExpandedSubNodes] = useState<Record<string, boolean>>({});

  const toggleSubNodeExpand = (nodeKey: string) => {
    setExpandedSubNodes((prev) => ({
      ...prev,
      [nodeKey]: !prev[nodeKey]
    }));
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [includeAllUserCards, setIncludeAllUserCards] = useState(false);
  const [selectedUserDeckIds, setSelectedUserDeckIds] = useState<string[]>([]);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Estado da Gaveta de Inspeção Card a Card (Abordagem A)
  const [inspectingTopic, setInspectingTopic] = useState<InspectingTopicState | null>(null);
  const [inspectingSearch, setInspectingSearch] = useState('');
  const [expandedCardAnswers, setExpandedCardAnswers] = useState<Record<string, boolean>>({});

  // Baralhos autorais do aluno
  const userDecks = useMemo(() => {
    return flashcardsService.getCustomDecks(user?.id);
  }, [user?.id, isOpen]);

  // Cartões autorais do usuário
  const userCards = useMemo(() => {
    return allFlashcards.filter((c) => c.id.startsWith('fc-user-'));
  }, [allFlashcards]);

  // Cartões oficiais da plataforma
  const platformCards = useMemo(() => {
    return allFlashcards.filter((c) => !c.id.startsWith('fc-user-'));
  }, [allFlashcards]);

  // Cache hierárquico dos cards do BR
  const cardsCache = useMemo(() => {
    return buildHierarchyCardsCache(clinicalHierarchy, platformCards);
  }, [platformCards]);

  const normalizedQuery = useMemo(() => normalizeText(searchQuery), [searchQuery]);

  // Carrega valores quando abrir em modo edição ou criação
  useEffect(() => {
    if (isOpen) {
      if (deckToEdit) {
        setDeckName(deckToEdit.name);
        setDeckDescription(deckToEdit.description || '');
        setPriorityOnly(Boolean(deckToEdit.priorityOnly));
        setIncludeAllUserCards(Boolean(deckToEdit.includeAllUserCards));
        setSelectedUserDeckIds(deckToEdit.includeUserDeckIds || []);

        // Restaura cartões selecionados
        if (deckToEdit.cardIds && deckToEdit.cardIds.length > 0) {
          setSelectedCardIds(new Set(deckToEdit.cardIds));
        } else if (deckToEdit.selectedNodeKeys && deckToEdit.selectedNodeKeys.length > 0) {
          const resolved = resolveCardsFromHierarchyKeys(deckToEdit.selectedNodeKeys, cardsCache);
          setSelectedCardIds(new Set(resolved.map((c) => c.id)));
        } else if (deckToEdit.specialties && deckToEdit.specialties.length > 0) {
          const resolved = resolveCardsFromHierarchyKeys(
            deckToEdit.specialties.map((s) => `spec:${s}`),
            cardsCache
          );
          setSelectedCardIds(new Set(resolved.map((c) => c.id)));
        } else {
          setSelectedCardIds(new Set());
        }
      } else {
        setDeckName('');
        setDeckDescription('');
        setSelectedCardIds(new Set());
        setExpandedNodes({});
        setSearchQuery('');
        setPriorityOnly(false);
        setIncludeAllUserCards(false);
        setSelectedUserDeckIds([]);
      }
      setInspectingTopic(null);
      setInspectingSearch('');
      setExpandedCardAnswers({});
    }
  }, [isOpen, deckToEdit, cardsCache]);

  // Expansão de nós da árvore
  const toggleNodeExpand = (nodeKey: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeKey]: !prev[nodeKey]
    }));
  };

  const handleExpandAll = () => {
    const all: Record<string, boolean> = {};
    clinicalHierarchy.forEach((spec) => {
      all[`spec:${spec.especialidade}`] = true;
      spec.temas.forEach((tem) => {
        all[`tema:${spec.especialidade}:::${tem.tema}`] = true;
        tem.focos.forEach((foc) => {
          all[`foco:${spec.especialidade}:::${tem.tema}:::${foc.foco}`] = true;
        });
      });
    });
    setExpandedNodes(all);
  };

  const handleCollapseAll = () => {
    setExpandedNodes({});
  };

  // Avalia o estado de seleção de um nó da hierarquia
  const getNodeSelectionStatus = useCallback(
    (nodeCards: FlashcardItem[]): 'checked' | 'indeterminate' | 'unchecked' => {
      if (nodeCards.length === 0) return 'unchecked';
      let selectedCount = 0;
      for (const card of nodeCards) {
        if (selectedCardIds.has(card.id)) {
          selectedCount++;
        }
      }
      if (selectedCount === nodeCards.length) return 'checked';
      if (selectedCount > 0) return 'indeterminate';
      return 'unchecked';
    },
    [selectedCardIds]
  );

  // Alterna a seleção de todos os cards de um nó da árvore
  const toggleNodeCards = (nodeCards: FlashcardItem[]) => {
    const status = getNodeSelectionStatus(nodeCards);
    setSelectedCardIds((prev) => {
      const next = new Set(prev);
      if (status === 'checked') {
        // Desmarca todos deste nó
        nodeCards.forEach((c) => next.delete(c.id));
      } else {
        // Marca todos deste nó
        nodeCards.forEach((c) => next.add(c.id));
      }
      return next;
    });
  };

  const handleClearAllSelections = () => {
    setSelectedCardIds(new Set());
  };

  // Toggle de um card individual
  const toggleCard = (cardId: string) => {
    setSelectedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  // Toggle de baralho autoral
  const toggleUserDeck = (deckId: string) => {
    setSelectedUserDeckIds((prev) =>
      prev.includes(deckId)
        ? prev.filter((id) => id !== deckId)
        : [...prev, deckId]
    );
  };

  // Abre a gaveta de inspeção card a card para um tópico
  const handleOpenInspector = (title: string, breadcrumb: string, cards: FlashcardItem[]) => {
    setInspectingTopic({ title, breadcrumb, cards });
    setInspectingSearch('');
    setExpandedCardAnswers({});
  };

  // Cartões do BR efetivamente selecionados
  const selectedBrCards = useMemo(() => {
    const list = platformCards.filter((c) => selectedCardIds.has(c.id));
    if (priorityOnly) {
      return list.filter((c) => c.priority === 'essential');
    }
    return list;
  }, [platformCards, selectedCardIds, priorityOnly]);

  // Cartões autorais selecionados
  const selectedAuthorCards = useMemo(() => {
    if (includeAllUserCards) {
      return userCards;
    }
    if (selectedUserDeckIds.length > 0) {
      const included = new Set(selectedUserDeckIds);
      return userCards.filter((c) => included.has(c.deckId || 'deck-padrao'));
    }
    return [];
  }, [includeAllUserCards, selectedUserDeckIds, userCards]);

  // Cards combinados
  const previewCards = useMemo(() => {
    const map = new Map<string, FlashcardItem>();
    selectedBrCards.forEach((c) => map.set(c.id, c));
    selectedAuthorCards.forEach((c) => map.set(c.id, c));
    return Array.from(map.values());
  }, [selectedBrCards, selectedAuthorCards]);

  // Contagens Anki
  const previewCounts = useMemo(() => {
    const now = new Date();
    let novo = 0;
    let aprender = 0;
    let revisar = 0;

    previewCards.forEach((c) => {
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

    return {
      total: previewCards.length,
      brCount: selectedBrCards.length,
      userCount: selectedAuthorCards.length,
      novo,
      aprender,
      revisar
    };
  }, [previewCards, selectedBrCards, selectedAuthorCards]);

  // Filtragem interna da gaveta de inspeção
  const filteredInspectorCards = useMemo(() => {
    if (!inspectingTopic) return [];
    if (!inspectingSearch.trim()) return inspectingTopic.cards;
    const q = normalizeText(inspectingSearch);
    return inspectingTopic.cards.filter((c) => {
      const f = normalizeText(c.front || '');
      const b = normalizeText(c.back || '');
      const cm = normalizeText(c.comment || '');
      return f.includes(q) || b.includes(q) || cm.includes(q);
    });
  }, [inspectingTopic, inspectingSearch]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckName.trim()) return;

    // Extrai especialidades dos cartões selecionados
    const specSet = new Set<string>();
    selectedBrCards.forEach((c) => {
      if (c.specialty) specSet.add(c.specialty);
    });

    const deckData: CustomFlashcardDeck = {
      id: deckToEdit ? deckToEdit.id : `custom-deck-${Date.now()}`,
      name: deckName.trim(),
      description: deckDescription.trim() || undefined,
      specialties: Array.from(specSet),
      cardIds: Array.from(selectedCardIds),
      priorityOnly,
      includeAllUserCards,
      includeUserDeckIds: selectedUserDeckIds,
      deckType: 'mixed',
      createdAt: deckToEdit ? deckToEdit.createdAt : new Date().toISOString()
    };

    flashcardsService.savePersonalizedDeck(deckData, user?.id);
    onDeckSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95 duration-200 my-auto max-h-[92vh] overflow-y-auto overflow-x-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                {deckToEdit ? 'Editar Baralho Personalizado' : 'Novo Baralho Personalizado & Misto'}
              </h3>
              <p className="text-xs text-zinc-500">
                Selecione baralhos completos ou filtre flashcard por flashcard com a gaveta de inspeção.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* 1. Nome e Descrição */}
          <div className="space-y-3 bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/70 p-3.5 rounded-2xl">
            <div>
              <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
                Nome do Baralho *
              </label>
              <input
                type="text"
                required
                autoFocus
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="Ex: Reta Final ENARE - Cardiologia & Pediatria, Meus Erros de Trauma..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-xs sm:text-sm font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Descrição ou Objetivo Clínico (Opcional)
              </label>
              <input
                type="text"
                value={deckDescription}
                onChange={(e) => setDeckDescription(e.target.value)}
                placeholder="Ex: Tópicos de alta incidência + anotações pessoais do internato."
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-xs"
              />
            </div>
          </div>

          {/* 2. Seleção de Baralhos e Cards do Acervo Oficial */}
          <div className="space-y-3 bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/70 p-3.5 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block">
                  1. Cartões do Banco Residência (Acervo Oficial)
                </span>
                <span className="text-[11px] text-zinc-500">
                  Marque o baralho inteiro ou clique no ícone de filtro para escolher individualmente.
                </span>
              </div>

              {/* Ações da Árvore */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleExpandAll}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
                >
                  Expandir Tudo
                </button>
                <button
                  type="button"
                  onClick={handleCollapseAll}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
                >
                  Recolher
                </button>
                {selectedCardIds.size > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllSelections}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 cursor-pointer"
                  >
                    Desmarcar Todos ({selectedCardIds.size})
                  </button>
                )}
              </div>
            </div>

            {/* Barra de Busca na Árvore */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por especialidade, tema, foco, subfoco ou termo médico..."
                className="w-full pl-8 pr-8 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtro de Alta Incidência (Essenciais) */}
            <div className="py-1.5 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Star className={`w-3.5 h-3.5 shrink-0 ${priorityOnly ? 'fill-amber-500 text-amber-500' : 'text-zinc-400'}`} />
                <span className="font-bold text-[11px] text-zinc-800 dark:text-zinc-200 truncate">
                  Apenas Flashcards Essenciais (Alta Incidência em Provas)
                </span>
              </div>

              <button
                type="button"
                onClick={() => setPriorityOnly(!priorityOnly)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${priorityOnly ? 'bg-amber-500' : 'bg-zinc-200 dark:bg-zinc-700'
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${priorityOnly ? 'translate-x-4' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>

            {/* Árvore Hierárquica Estilo Anki com Botão Ver Cards */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-[#121215]">
              <div className="grid grid-cols-12 items-center px-3 py-2 bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 select-none">
                <div className="col-span-8 sm:col-span-9">Baralho / Tópico Clínico</div>
                <div className="col-span-4 sm:col-span-3 text-right">Seleção &amp; Total</div>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 max-h-[300px] overflow-y-auto custom-scrollbar">
                {clinicalHierarchy.map((spec) => {
                  const specKey = `spec:${spec.especialidade}`;
                  const isSpecExpanded = normalizedQuery ? true : Boolean(expandedNodes[specKey]);
                  const specCards = cardsCache.specMap.get(spec.especialidade) || [];
                  const specStatus = getNodeSelectionStatus(specCards);
                  const selectedInSpec = specCards.filter((c) => selectedCardIds.has(c.id)).length;

                  return (
                    <React.Fragment key={spec.especialidade}>
                      {/* Nível 1: Especialidade */}
                      <div
                        className={`grid grid-cols-12 items-center px-3 py-1.5 transition-colors select-none ${specStatus !== 'unchecked'
                            ? 'bg-blue-50/70 dark:bg-blue-950/30'
                            : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50'
                          }`}
                      >
                        <div className="col-span-8 sm:col-span-9 flex items-center gap-2 min-w-0 pr-2">
                          <button
                            type="button"
                            onClick={() => toggleNodeCards(specCards)}
                            className="p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer shrink-0"
                            title="Marcar/Desmarcar Especialidade inteira"
                          >
                            {specStatus === 'checked' ? (
                              <CheckSquare
                                className="w-4 h-4 stroke-[2.5]"
                                style={{ color: accentConfig.primaryHex }}
                              />
                            ) : specStatus === 'indeterminate' ? (
                              <div
                                className="w-3.5 h-3.5 rounded flex items-center justify-center text-white"
                                style={{ backgroundColor: accentConfig.primaryHex }}
                              >
                                <Minus className="w-3 h-3 stroke-[3]" />
                              </div>
                            ) : (
                              <Square className="w-4 h-4 text-zinc-300 dark:text-zinc-700 hover:text-zinc-400" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleNodeExpand(specKey)}
                            className="w-4 h-4 rounded flex items-center justify-center font-mono font-bold text-xs text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                          >
                            {isSpecExpanded ? '−' : '+'}
                          </button>

                          <span
                            onClick={() => toggleNodeExpand(specKey)}
                            className="font-heading font-black text-xs uppercase tracking-wide text-zinc-900 dark:text-zinc-100 truncate cursor-pointer hover:underline"
                          >
                            {spec.especialidade}
                          </span>
                        </div>

                        {/* Ações e Contagem */}
                        <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenInspector(spec.especialidade, 'Especialidade Completa', specCards)}
                            className={`h-6 min-w-[24px] px-1.5 py-0.5 rounded-md text-[10px] font-bold border transition-colors inline-flex items-center justify-center gap-1 cursor-pointer ${selectedInSpec > 0 && selectedInSpec < specCards.length
                                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800'
                                : 'text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border-zinc-200 dark:border-zinc-700'
                              }`}
                            title={
                              selectedInSpec > 0 && selectedInSpec < specCards.length
                                ? `Filtrar cartões desta especialidade (${selectedInSpec}/${specCards.length})`
                                : 'Ver e filtrar cartões desta especialidade'
                            }
                            aria-label="Ver e filtrar cartões desta especialidade"
                          >
                            <ListFilter className="w-3 h-3 shrink-0" />
                            {selectedInSpec > 0 && selectedInSpec < specCards.length && (
                              <span className="font-mono text-[9px] leading-none">
                                {selectedInSpec}/{specCards.length}
                              </span>
                            )}
                          </button>

                          <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400 font-bold w-7 text-right">
                            {specCards.length}
                          </span>
                        </div>
                      </div>

                      {/* Nível 2: Temas */}
                      {isSpecExpanded &&
                        spec.temas.map((tem) => {
                          const temaKey = `tema:${spec.especialidade}:::${tem.tema}`;
                          const rawTemaKey = `${spec.especialidade}:::${tem.tema}`;
                          const isTemaExpanded = normalizedQuery ? true : Boolean(expandedNodes[temaKey]);
                          const temaCards = cardsCache.temaMap.get(rawTemaKey) || [];
                          const temaStatus = getNodeSelectionStatus(temaCards);
                          const selectedInTema = temaCards.filter((c) => selectedCardIds.has(c.id)).length;

                          return (
                            <React.Fragment key={tem.tema}>
                              <div
                                className={`grid grid-cols-12 items-center px-3 py-1.5 transition-colors select-none ${temaStatus !== 'unchecked'
                                    ? 'bg-blue-50/60 dark:bg-blue-950/20'
                                    : 'hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40'
                                  }`}
                              >
                                <div className="col-span-8 sm:col-span-9 flex items-center gap-2 min-w-0 pr-2 pl-6">
                                  <button
                                    type="button"
                                    onClick={() => toggleNodeCards(temaCards)}
                                    className="p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer shrink-0"
                                    title="Marcar/Desmarcar Tema"
                                  >
                                    {temaStatus === 'checked' ? (
                                      <CheckSquare
                                        className="w-3.5 h-3.5 stroke-[2.5]"
                                        style={{ color: accentConfig.primaryHex }}
                                      />
                                    ) : temaStatus === 'indeterminate' ? (
                                      <div
                                        className="w-3 h-3 rounded flex items-center justify-center text-white"
                                        style={{ backgroundColor: accentConfig.primaryHex }}
                                      >
                                        <Minus className="w-2.5 h-2.5 stroke-[3]" />
                                      </div>
                                    ) : (
                                      <Square className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 hover:text-zinc-400" />
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => toggleNodeExpand(temaKey)}
                                    className="w-4 h-4 rounded flex items-center justify-center font-mono font-bold text-xs text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                                  >
                                    {isTemaExpanded ? '−' : '+'}
                                  </button>

                                  <span
                                    onClick={() => toggleNodeExpand(temaKey)}
                                    className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate cursor-pointer hover:underline"
                                  >
                                    {tem.tema}
                                  </span>
                                </div>

                                <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenInspector(tem.tema, `${spec.especialidade} > ${tem.tema}`, temaCards)
                                    }
                                    className={`h-6 min-w-[24px] px-1.5 py-0.5 rounded-md text-[10px] font-bold border transition-colors inline-flex items-center justify-center gap-1 cursor-pointer ${selectedInTema > 0 && selectedInTema < temaCards.length
                                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800'
                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border-zinc-200 dark:border-zinc-700'
                                      }`}
                                    title={
                                      selectedInTema > 0 && selectedInTema < temaCards.length
                                        ? `Filtrar cartões deste tema (${selectedInTema}/${temaCards.length})`
                                        : 'Ver e filtrar cartões deste tema'
                                    }
                                    aria-label="Ver e filtrar cartões deste tema"
                                  >
                                    <ListFilter className="w-3 h-3 shrink-0" />
                                    {selectedInTema > 0 && selectedInTema < temaCards.length && (
                                      <span className="font-mono text-[9px] leading-none">
                                        {selectedInTema}/{temaCards.length}
                                      </span>
                                    )}
                                  </button>

                                  <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 w-6 text-right">
                                    {temaCards.length}
                                  </span>
                                </div>
                              </div>

                              {/* Nível 3: Focos Clínicos */}
                              {isTemaExpanded &&
                                tem.focos.map((foc) => {
                                  const focoKey = `foco:${spec.especialidade}:::${tem.tema}:::${foc.foco}`;
                                  const rawFocoKey = `${spec.especialidade}:::${tem.tema}:::${foc.foco}`;
                                  const hasSubfocos = foc.subfocos && foc.subfocos.length > 0;
                                  const isFocoExpanded = normalizedQuery ? true : Boolean(expandedNodes[focoKey]);
                                  const focoCards = cardsCache.focoMap.get(rawFocoKey) || [];
                                  const focoStatus = getNodeSelectionStatus(focoCards);
                                  const selectedInFoco = focoCards.filter((c) => selectedCardIds.has(c.id)).length;

                                  return (
                                    <React.Fragment key={foc.foco}>
                                      <div
                                        className={`grid grid-cols-12 items-center px-3 py-1 transition-colors select-none ${focoStatus !== 'unchecked'
                                            ? 'bg-blue-50/50 dark:bg-blue-950/20'
                                            : 'hover:bg-zinc-50/40 dark:hover:bg-zinc-900/30'
                                          }`}
                                      >
                                        <div className="col-span-8 sm:col-span-9 flex items-center gap-1.5 min-w-0 pr-2 pl-12">
                                          <button
                                            type="button"
                                            onClick={() => toggleNodeCards(focoCards)}
                                            className="p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer shrink-0"
                                            title="Marcar/Desmarcar Foco Clínico"
                                          >
                                            {focoStatus === 'checked' ? (
                                              <CheckSquare
                                                className="w-3.5 h-3.5 stroke-[2.5]"
                                                style={{ color: accentConfig.primaryHex }}
                                              />
                                            ) : focoStatus === 'indeterminate' ? (
                                              <div
                                                className="w-3 h-3 rounded flex items-center justify-center text-white"
                                                style={{ backgroundColor: accentConfig.primaryHex }}
                                              >
                                                <Minus className="w-2.5 h-2.5 stroke-[3]" />
                                              </div>
                                            ) : (
                                              <Square className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 hover:text-zinc-400" />
                                            )}
                                          </button>

                                          {hasSubfocos ? (
                                            <button
                                              type="button"
                                              onClick={() => toggleNodeExpand(focoKey)}
                                              className="w-3.5 h-3.5 rounded flex items-center justify-center font-mono font-bold text-[10px] text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                                            >
                                              {isFocoExpanded ? '−' : '+'}
                                            </button>
                                          ) : (
                                            <span className="w-3.5 text-center text-zinc-300 dark:text-zinc-700 text-xs">
                                              •
                                            </span>
                                          )}

                                          <span
                                            onClick={() => hasSubfocos && toggleNodeExpand(focoKey)}
                                            className="text-[11px] text-zinc-700 dark:text-zinc-300 truncate cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100"
                                          >
                                            {foc.foco}
                                          </span>
                                        </div>

                                        <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleOpenInspector(
                                                foc.foco,
                                                `${spec.especialidade} > ${tem.tema} > ${foc.foco}`,
                                                focoCards
                                              )
                                            }
                                            className={`h-6 min-w-[24px] px-1.5 py-0.5 rounded-md text-[10px] font-bold border transition-colors inline-flex items-center justify-center gap-1 cursor-pointer ${selectedInFoco > 0 && selectedInFoco < focoCards.length
                                                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800'
                                                : 'text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border-zinc-200 dark:border-zinc-700'
                                              }`}
                                            title={
                                              selectedInFoco > 0 && selectedInFoco < focoCards.length
                                                ? `Filtrar cartões deste foco (${selectedInFoco}/${focoCards.length})`
                                                : 'Ver e filtrar cartões deste foco'
                                            }
                                            aria-label="Ver e filtrar cartões deste foco"
                                          >
                                            <ListFilter className="w-3 h-3 shrink-0" />
                                            {selectedInFoco > 0 && selectedInFoco < focoCards.length && (
                                              <span className="font-mono text-[9px] leading-none">
                                                {selectedInFoco}/{focoCards.length}
                                              </span>
                                            )}
                                          </button>

                                          <span className="font-mono text-[10px] text-zinc-400 w-6 text-right">
                                            {focoCards.length}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Nível 4: Subfocos & Nível 5: Sub-subfocos */}
                                      {hasSubfocos &&
                                        isFocoExpanded &&
                                        foc.subfocos?.map((sub) => {
                                          const subName = typeof sub === 'string' ? sub : sub.subfoco;
                                          const subKey = `subfoco:${spec.especialidade}:::${tem.tema}:::${foc.foco}:::${subName}`;
                                          const rawSubKey = `${spec.especialidade}:::${tem.tema}:::${foc.foco}:::${subName}`;
                                          const subCards = cardsCache.subfocoMap.get(rawSubKey) || [];
                                          const subStatus = getNodeSelectionStatus(subCards);
                                          const selectedInSub = subCards.filter((c) => selectedCardIds.has(c.id)).length;

                                          const subSubList = typeof sub === 'string' ? [] : (sub.sub_subfocos || []);
                                          const hasSubSubfocos = subSubList.length > 0;
                                          const isSubExpanded = Boolean(expandedSubNodes[subKey]);

                                          return (
                                            <React.Fragment key={subName}>
                                              <div
                                                className={`grid grid-cols-12 items-center px-3 py-1 transition-colors select-none ${subStatus !== 'unchecked'
                                                    ? 'bg-blue-50/40 dark:bg-blue-950/20'
                                                    : 'hover:bg-zinc-50/30 dark:hover:bg-zinc-900/20'
                                                  }`}
                                              >
                                                <div className="col-span-8 sm:col-span-9 flex items-center gap-1.5 min-w-0 pr-2 pl-18">
                                                  <button
                                                    type="button"
                                                    onClick={() => toggleNodeCards(subCards)}
                                                    className="p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer shrink-0"
                                                  >
                                                    {subStatus === 'checked' ? (
                                                      <CheckSquare
                                                        className="w-3 h-3 stroke-[2.5]"
                                                        style={{ color: accentConfig.primaryHex }}
                                                      />
                                                    ) : subStatus === 'indeterminate' ? (
                                                      <div
                                                        className="w-2.5 h-2.5 rounded flex items-center justify-center text-white"
                                                        style={{ backgroundColor: accentConfig.primaryHex }}
                                                      >
                                                        <Minus className="w-2 h-2 stroke-[3]" />
                                                      </div>
                                                    ) : (
                                                      <Square className="w-3 h-3 text-zinc-300 dark:text-zinc-700 hover:text-zinc-400" />
                                                    )}
                                                  </button>

                                                  {hasSubSubfocos && (
                                                    <button
                                                      type="button"
                                                      onClick={() => toggleSubNodeExpand(subKey)}
                                                      className="p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer shrink-0"
                                                      title={isSubExpanded ? 'Recolher sub-subfocos' : 'Expandir sub-subfocos'}
                                                    >
                                                      {isSubExpanded ? (
                                                        <ChevronDown className="w-3 h-3" />
                                                      ) : (
                                                        <ChevronRight className="w-3 h-3" />
                                                      )}
                                                    </button>
                                                  )}

                                                  <span
                                                    onClick={() => hasSubSubfocos && toggleSubNodeExpand(subKey)}
                                                    className={`text-[10px] text-zinc-500 dark:text-zinc-400 truncate ${hasSubSubfocos ? 'cursor-pointer hover:underline' : ''}`}
                                                  >
                                                    {subName}
                                                  </span>
                                                </div>

                                                <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-1.5">
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      handleOpenInspector(
                                                        subName,
                                                        `${spec.especialidade} > ${foc.foco} > ${subName}`,
                                                        subCards
                                                      )
                                                    }
                                                    className={`h-5 min-w-[20px] px-1 py-0.5 rounded text-[9px] font-bold border transition-colors inline-flex items-center justify-center gap-1 cursor-pointer ${selectedInSub > 0 && selectedInSub < subCards.length
                                                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800'
                                                        : 'text-zinc-400 hover:text-blue-500 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 border-zinc-200 dark:border-zinc-700/80'
                                                      }`}
                                                    title={
                                                      selectedInSub > 0 && selectedInSub < subCards.length
                                                        ? `Filtrar cartões deste subfoco (${selectedInSub}/${subCards.length})`
                                                        : 'Ver e filtrar cartões deste subfoco'
                                                    }
                                                    aria-label="Ver e filtrar cartões deste subfoco"
                                                  >
                                                    <ListFilter className="w-2.5 h-2.5 shrink-0" />
                                                    {selectedInSub > 0 && selectedInSub < subCards.length && (
                                                      <span className="font-mono text-[8px] leading-none">
                                                        {selectedInSub}/{subCards.length}
                                                      </span>
                                                    )}
                                                  </button>

                                                  <span className="font-mono text-[9px] text-zinc-400 w-5 text-right">
                                                    {subCards.length}
                                                  </span>
                                                </div>
                                              </div>

                                              {/* Nível 5: Sub-subfocos */}
                                              {hasSubSubfocos &&
                                                isSubExpanded &&
                                                subSubList.map((ss) => {
                                                  const rawSSKey = `${spec.especialidade}:::${tem.tema}:::${foc.foco}:::${subName}:::${ss}`;
                                                  const ssCards = cardsCache.subSubfocoMap.get(rawSSKey) || [];
                                                  const ssStatus = getNodeSelectionStatus(ssCards);
                                                  const selectedInSS = ssCards.filter((c) => selectedCardIds.has(c.id)).length;

                                                  return (
                                                    <div
                                                      key={ss}
                                                      className={`grid grid-cols-12 items-center px-3 py-1 transition-colors select-none ${ssStatus !== 'unchecked'
                                                          ? 'bg-blue-50/50 dark:bg-blue-950/30'
                                                          : 'hover:bg-zinc-50/30 dark:hover:bg-zinc-900/20'
                                                        }`}
                                                    >
                                                      <div className="col-span-8 sm:col-span-9 flex items-center gap-1.5 min-w-0 pr-2 pl-24">
                                                        <button
                                                          type="button"
                                                          onClick={() => toggleNodeCards(ssCards)}
                                                          className="p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer shrink-0"
                                                        >
                                                          {ssStatus === 'checked' ? (
                                                            <CheckSquare
                                                              className="w-3 h-3 stroke-[2.5]"
                                                              style={{ color: accentConfig.primaryHex }}
                                                            />
                                                          ) : ssStatus === 'indeterminate' ? (
                                                            <div
                                                              className="w-2.5 h-2.5 rounded flex items-center justify-center text-white"
                                                              style={{ backgroundColor: accentConfig.primaryHex }}
                                                            >
                                                              <Minus className="w-2 h-2 stroke-[3]" />
                                                            </div>
                                                          ) : (
                                                            <Square className="w-3 h-3 text-zinc-300 dark:text-zinc-700 hover:text-zinc-400" />
                                                          )}
                                                        </button>

                                                        <span
                                                          className="text-[10px] text-zinc-600 dark:text-zinc-300 truncate"
                                                          title={ss}
                                                        >
                                                          {formatSubSubfocoDisplay(ss)}
                                                        </span>
                                                      </div>

                                                      <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-1.5">
                                                        <button
                                                          type="button"
                                                          onClick={() =>
                                                            handleOpenInspector(
                                                              formatSubSubfocoDisplay(ss),
                                                              `${spec.especialidade} > ${foc.foco} > ${subName} > ${formatSubSubfocoDisplay(ss)}`,
                                                              ssCards
                                                            )
                                                          }
                                                          className={`h-5 min-w-[20px] px-1 py-0.5 rounded text-[9px] font-bold border transition-colors inline-flex items-center justify-center gap-1 cursor-pointer ${selectedInSS > 0 && selectedInSS < ssCards.length
                                                              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800'
                                                              : 'text-zinc-400 hover:text-blue-500 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 border-zinc-200 dark:border-zinc-700/80'
                                                            }`}
                                                          title={
                                                            selectedInSS > 0 && selectedInSS < ssCards.length
                                                              ? `Filtrar cartões deste sub-subfoco (${selectedInSS}/${ssCards.length})`
                                                              : 'Ver e filtrar cartões deste sub-subfoco'
                                                          }
                                                          aria-label="Ver e filtrar cartões deste sub-subfoco"
                                                        >
                                                          <ListFilter className="w-2.5 h-2.5 shrink-0" />
                                                          {selectedInSS > 0 && selectedInSS < ssCards.length && (
                                                            <span className="font-mono text-[8px] leading-none">
                                                              {selectedInSS}/{ssCards.length}
                                                            </span>
                                                          )}
                                                        </button>

                                                        <span className="font-mono text-[9px] text-zinc-400 w-5 text-right">
                                                          {ssCards.length}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                            </React.Fragment>
                                          );
                                        })}
                                    </React.Fragment>
                                  );
                                })}
                            </React.Fragment>
                          );
                        })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Seleção de Cartões Autorais do Estudante (Originais) */}
          <div className="space-y-3 bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/70 p-3.5 rounded-2xl">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block">
                  2. Meus Cartões Autorais (Originais)
                </span>
                <span className="text-[11px] text-zinc-500">
                  Incorpore suas próprias anotações e fichas criadas por você.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCsvModalOpen(true)}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                  title="Importar flashcards em lote via CSV para seus cartões autorais"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Importar CSV</span>
                </button>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold">
                  {userCards.length} {userCards.length === 1 ? 'cartão autoral' : 'cartões autorais'}
                </span>
              </div>
            </div>

            {userCards.length === 0 ? (
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/60 border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-1">
                <Info className="w-4 h-4 text-zinc-400 mx-auto" />
                <p className="text-[11px] text-zinc-500">
                  Você ainda não criou cartões autorais na aba &quot;Cartões Originais&quot;.
                </p>
                <p className="text-[10px] text-zinc-400">
                  Quando você criar seus próprios cartões no futuro, poderá adicioná-los a este baralho a qualquer momento.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={includeAllUserCards}
                    onChange={(e) => {
                      setIncludeAllUserCards(e.target.checked);
                      if (e.target.checked) setSelectedUserDeckIds([]);
                    }}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-zinc-800"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block">
                      Incluir todos os meus cartões autorais ({userCards.length})
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Junta todas as suas anotações pessoais a este baralho
                    </span>
                  </div>
                </label>

                {!includeAllUserCards && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {userDecks.map((deck) => {
                      const countInDeck = userCards.filter(
                        (c) => (c.deckId || 'deck-padrao') === deck.id
                      ).length;
                      const isChecked = selectedUserDeckIds.includes(deck.id);

                      return (
                        <label
                          key={deck.id}
                          className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-colors ${isChecked
                              ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800/60'
                              : 'bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800'
                            }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleUserDeck(deck.id)}
                              className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 dark:bg-zinc-800"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block truncate">
                                {deck.name}
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 shrink-0">
                            {countInDeck}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Prévia em Tempo Real da Composição */}
          <div className="p-3.5 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-800/90 border border-zinc-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Composição Estimada do Baralho</span>
              </span>

              <span className="font-mono text-sm text-emerald-400">
                {previewCounts.total} cartões totais
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 border-t border-zinc-800">
              <div className="bg-zinc-800/80 dark:bg-zinc-900/60 p-2 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Acervo BR</span>
                <span className="font-mono font-bold text-zinc-200">{previewCounts.brCount} cards</span>
              </div>
              <div className="bg-zinc-800/80 dark:bg-zinc-900/60 p-2 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Autorais Seus</span>
                <span className="font-mono font-bold text-zinc-200">{previewCounts.userCount} cards</span>
              </div>
              <div className="bg-zinc-800/80 dark:bg-zinc-900/60 p-2 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Novos</span>
                <span className="font-mono font-bold text-blue-400">{previewCounts.novo}</span>
              </div>
              <div className="bg-zinc-800/80 dark:bg-zinc-900/60 p-2 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Para Revisar Hoje</span>
                <span className="font-mono font-bold text-emerald-400">{previewCounts.revisar}</span>
              </div>
            </div>
          </div>

          {/* Ações do Rodapé */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={previewCounts.total === 0 || !deckName.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-1.5"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>
                {deckToEdit
                  ? `Salvar Alterações (${previewCounts.total} cards)`
                  : `Criar Baralho Personalizado (${previewCounts.total} cards)`}
              </span>
            </button>
          </div>
        </form>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* ABORDAGEM A: GAVETA LATERAL DESLIZANTE DE INSPEÇÃO CARD A CARD         */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {inspectingTopic && (
          <div className="absolute inset-0 z-50 bg-white dark:bg-[#151518] rounded-3xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Cabeçalho da Gaveta */}
            <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setInspectingTopic(null)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                  title="Voltar para a árvore"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-400 block truncate font-medium">
                    {inspectingTopic.breadcrumb}
                  </span>
                  <h4 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate">
                    {inspectingTopic.title}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {inspectingTopic.cards.filter((c) => selectedCardIds.has(c.id)).length} de{' '}
                  {inspectingTopic.cards.length} selecionados
                </span>

                <button
                  type="button"
                  onClick={() => setInspectingTopic(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Toolbar de Filtro e Seleção em Lote */}
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={inspectingSearch}
                  onChange={(e) => setInspectingSearch(e.target.value)}
                  placeholder="Filtrar por texto da pergunta, resposta ou termo clínico..."
                  className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
                {inspectingSearch && (
                  <button
                    type="button"
                    onClick={() => setInspectingSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Botões de Ação em Lote nesta Gaveta */}
              <div className="flex items-center justify-between gap-2 flex-wrap text-[11px]">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCardIds((prev) => {
                        const next = new Set(prev);
                        filteredInspectorCards.forEach((c) => next.add(c.id));
                        return next;
                      });
                    }}
                    className="px-2 py-1 rounded-lg font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
                  >
                    Marcar Todos ({filteredInspectorCards.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCardIds((prev) => {
                        const next = new Set(prev);
                        filteredInspectorCards.forEach((c) => next.delete(c.id));
                        return next;
                      });
                    }}
                    className="px-2 py-1 rounded-lg font-bold text-zinc-600 dark:text-zinc-400 hover:text-rose-600 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors"
                  >
                    Desmarcar Todos
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCardIds((prev) => {
                      const next = new Set(prev);
                      inspectingTopic.cards.forEach((c) => {
                        if (c.priority === 'essential') {
                          next.add(c.id);
                        } else {
                          next.delete(c.id);
                        }
                      });
                      return next;
                    });
                  }}
                  className="px-2 py-1 rounded-lg font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 hover:bg-amber-100 cursor-pointer transition-colors inline-flex items-center gap-1"
                >
                  <Star className="w-3 h-3 fill-current" />
                  <span>Apenas Essenciais</span>
                </button>
              </div>
            </div>

            {/* Lista dos Flashcards daquele tópico */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {filteredInspectorCards.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 space-y-1">
                  <p className="font-bold">Nenhum cartão encontrado para este filtro.</p>
                  <p className="text-[11px] text-zinc-400">Tente buscar por outro termo clínico.</p>
                </div>
              ) : (
                filteredInspectorCards.map((card, idx) => {
                  const isChecked = selectedCardIds.has(card.id);
                  const isAnswerOpen = Boolean(expandedCardAnswers[card.id]);
                  const isEssential = card.priority === 'essential';

                  // Status Anki
                  const p = card.progress;
                  const isNew = !p || p.state === 'new' || p.repetitions === 0;
                  const isLearning = p && (p.state === 'learning' || p.state === 'relearning');

                  return (
                    <div
                      key={card.id}
                      onClick={() => toggleCard(card.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-2 select-none ${isChecked
                          ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800/80 shadow-2xs'
                          : 'bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                    >
                      {/* Topo do Card com Checkbox, Tags e Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCard(card.id);
                            }}
                            className="p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer shrink-0"
                          >
                            {isChecked ? (
                              <CheckSquare
                                className="w-4 h-4 stroke-[2.5]"
                                style={{ color: accentConfig.primaryHex }}
                              />
                            ) : (
                              <Square className="w-4 h-4 text-zinc-300 dark:text-zinc-700" />
                            )}
                          </button>

                          <span className="font-mono text-[10px] font-bold text-zinc-400">
                            #{idx + 1}
                          </span>

                          {card.focus && (
                            <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 truncate max-w-[200px]">
                              {card.focus}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isEssential && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 inline-flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span>Essencial</span>
                            </span>
                          )}

                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${isNew
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                                : isLearning
                                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                              }`}
                          >
                            {isNew ? 'Novo' : isLearning ? 'Aprendendo' : 'Revisar'}
                          </span>
                        </div>
                      </div>

                      {/* Frente do Card (Pergunta / Enunciado com Cloze Highlight) */}
                      <div className="text-xs text-zinc-900 dark:text-zinc-100 font-medium leading-relaxed pl-6">
                        {renderClozeSnippet(card.front)}
                      </div>

                      {/* Expansor de Resposta & Comentário Clínico */}
                      <div className="pl-6 pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCardAnswers((prev) => ({
                              ...prev,
                              [card.id]: !prev[card.id]
                            }));
                          }}
                          className="text-[11px] font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 inline-flex items-center gap-1 cursor-pointer"
                        >
                          {isAnswerOpen ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Ocultar Resposta</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Inspecionar Resposta</span>
                            </>
                          )}
                        </button>

                        {isAnswerOpen && (
                          <div className="mt-2 p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs space-y-1.5 animate-in fade-in-50 duration-150">
                            <div>
                              <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                                Resposta Correta:
                              </span>
                              <p className="text-zinc-800 dark:text-zinc-200 font-semibold">
                                {card.back}
                              </p>
                            </div>

                            {card.comment && (
                              <div className="pt-1 border-t border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug">
                                <span className="font-bold text-zinc-700 dark:text-zinc-300">
                                  Comentário Clínico:
                                </span>{' '}
                                {card.comment}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Rodapé da Gaveta */}
            <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 flex items-center justify-between gap-3">
              <span className="text-xs text-zinc-500">
                <strong className="text-zinc-900 dark:text-zinc-100 font-bold">
                  {inspectingTopic.cards.filter((c) => selectedCardIds.has(c.id)).length}
                </strong>{' '}
                de {inspectingTopic.cards.length} cartões marcados
              </span>

              <button
                type="button"
                onClick={() => setInspectingTopic(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-95 active:scale-98 transition-all inline-flex items-center gap-1.5"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Confirmar Seleção</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal de Importação CSV para Cartões Autorais */}
        <CsvFlashcardImportModal
          isOpen={isCsvModalOpen}
          onClose={() => setIsCsvModalOpen(false)}
          onImportSuccess={() => {
            onDeckSaved();
          }}
        />
      </div>
    </div>
  );
};
