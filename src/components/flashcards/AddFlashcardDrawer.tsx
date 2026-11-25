'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  Brain,
  CheckCircle2,
  Check,
  Star,
  Tag,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Layers
} from 'lucide-react';
import { CustomFlashcardDeck, FlashcardItem } from '@/types/flashcards';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { flashcardsService } from '@/services/flashcardsService';
import { clinicalHierarchy } from '@/data/mockQuestions';
import { formatSubSubfocoDisplay } from '@/components/AdvancedQuestionFilters';
import { SPECIALTY_CONFIGS } from '../FlashcardsView';
import { useOverlayDismiss } from '@/hooks/useOverlayDismiss';
import { BackArrowButton } from '@/components/ui/BackArrowButton';
import {
  FlashcardImageField,
  extractClipboardImageFile,
  uploadFlashcardImageFile
} from './FlashcardImageField';
import { parseDeckPathSegments, resolveOrCreateDeckHierarchy } from '@/utils/ankiDeckTree';

interface AddFlashcardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCardSaved: (savedCard?: FlashcardItem, deckName?: string) => void;
  editingCardId?: string;
  initialDeckId?: string;
  initialFront?: string;
  initialBack?: string;
  initialSpecialty?: string;
  initialTema?: string;
  initialFoco?: string;
  initialComment?: string;
  initialImageFrontUrl?: string | null;
  initialImageUrl?: string | null;
}

export const AddFlashcardDrawer: React.FC<AddFlashcardDrawerProps> = ({
  isOpen,
  onClose,
  onCardSaved,
  editingCardId,
  initialDeckId = 'deck-padrao',
  initialFront,
  initialBack,
  initialSpecialty,
  initialTema,
  initialFoco,
  initialComment,
  initialImageFrontUrl,
  initialImageUrl
}) => {
  const { accentConfig } = useTheme();
  const { user } = useAuth();

  useOverlayDismiss({ isOpen, onClose });

  const [userDecks, setUserDecks] = useState<CustomFlashcardDeck[]>(() =>
    flashcardsService.getCustomDecks(user?.id)
  );

  const [selectedDeckId, setSelectedDeckId] = useState(initialDeckId);
  const [deckInput, setDeckInput] = useState('');
  const [isDeckMenuOpen, setIsDeckMenuOpen] = useState(false);

  const [showClassification, setShowClassification] = useState(
    Boolean(initialSpecialty || initialTema || initialFoco)
  );
  const [newCardSpecialty, setNewCardSpecialty] = useState(initialSpecialty || '');
  const [newCardTema, setNewCardTema] = useState(initialTema || '');
  const [newCardFoco, setNewCardFoco] = useState(initialFoco || '');
  const [newCardSubfoco, setNewCardSubfoco] = useState('');
  const [newCardSubSubfoco, setNewCardSubSubfoco] = useState('');
  const [newCardFront, setNewCardFront] = useState(initialFront || '');
  const [newCardBack, setNewCardBack] = useState(initialBack || '');
  const [newCardComment, setNewCardComment] = useState(initialComment || '');
  const [newCardFrontImageUrl, setNewCardFrontImageUrl] = useState<string | null>(initialImageFrontUrl || null);
  const [newCardBackImageUrl, setNewCardBackImageUrl] = useState<string | null>(initialImageUrl || null);
  const [newCardPriority, setNewCardPriority] = useState<'essential' | 'standard'>('essential');
  const [newCardTags, setNewCardTags] = useState('');
  const [savedDeckNotice, setSavedDeckNotice] = useState<string | null>(null);

  const frontTextareaRef = useRef<HTMLTextAreaElement>(null);
  const deckBoxRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      const latestDecks = flashcardsService.getCustomDecks(user?.id);
      setUserDecks(latestDecks);
      const matched =
        initialDeckId && latestDecks.find((d) => d.id === initialDeckId);
      const targetDeck =
        matched ||
        latestDecks.find((d) => d.id === 'deck-padrao') ||
        latestDecks[0];
      setSelectedDeckId(targetDeck?.id || 'deck-padrao');
      setDeckInput(targetDeck?.name || 'Baralho Padrão');
      setIsDeckMenuOpen(false);
      setShowClassification(Boolean(initialSpecialty || initialTema || initialFoco));
      setNewCardSpecialty(initialSpecialty || '');
      setNewCardTema(initialTema || '');
      setNewCardFoco(initialFoco || '');
      if (initialFront !== undefined) setNewCardFront(initialFront);
      if (initialBack !== undefined) setNewCardBack(initialBack);
      if (initialComment !== undefined) setNewCardComment(initialComment);
      setNewCardFrontImageUrl(initialImageFrontUrl || null);
      setNewCardBackImageUrl(initialImageUrl || null);
      setSavedDeckNotice(null);
    }
  }, [
    isOpen,
    user?.id,
    initialDeckId,
    initialSpecialty,
    initialTema,
    initialFoco,
    initialFront,
    initialBack,
    initialComment,
    initialImageFrontUrl,
    initialImageUrl
  ]);

  // Fecha dropdown de baralho ao clicar fora
  React.useEffect(() => {
    if (!isDeckMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (deckBoxRef.current && !deckBoxRef.current.contains(e.target as Node)) {
        setIsDeckMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDeckMenuOpen]);

  const sortedDecks = useMemo(() => {
    const defaultDeck = userDecks.find((d) => d.id === 'deck-padrao');
    const others = userDecks
      .filter((d) => d.id !== 'deck-padrao')
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    return defaultDeck ? [defaultDeck, ...others] : others;
  }, [userDecks]);

  const filteredDecks = useMemo(() => {
    const q = deckInput.trim().toLowerCase();
    const selectedDeck = userDecks.find((d) => d.id === selectedDeckId);
    if (!q || (selectedDeck && selectedDeck.name.toLowerCase() === q)) {
      return sortedDecks;
    }
    return sortedDecks.filter((d) => d.name.toLowerCase().includes(q));
  }, [sortedDecks, deckInput, userDecks, selectedDeckId]);

  const cleanTypedDeckPath = useMemo(() => {
    return parseDeckPathSegments(deckInput).join('::');
  }, [deckInput]);

  const exactDeckMatch = useMemo(() => {
    if (!cleanTypedDeckPath) return undefined;
    const targetLower = cleanTypedDeckPath.toLowerCase();
    return userDecks.find(
      (d) => parseDeckPathSegments(d.name).join('::').toLowerCase() === targetLower
    );
  }, [cleanTypedDeckPath, userDecks]);

  // Temas da especialidade selecionada (opcional)
  const drawerTemas = useMemo(() => {
    if (!newCardSpecialty) return [];
    const hNode = clinicalHierarchy.find(
      (h) =>
        h.especialidade.toLowerCase() === newCardSpecialty.toLowerCase() ||
        (newCardSpecialty === 'Cirurgia Geral' && h.especialidade === 'Cirurgia') ||
        (newCardSpecialty === 'Cirurgia' && h.especialidade === 'Cirurgia')
    );
    return hNode?.temas || [];
  }, [newCardSpecialty]);

  // Focos do tema selecionado (opcional)
  const drawerFocos = useMemo(() => {
    if (!newCardTema) return [];
    const temaObj = drawerTemas.find((t) => t.tema === newCardTema);
    return temaObj?.focos.map((f) => f.foco) || [];
  }, [drawerTemas, newCardTema]);

  // Subfocos do foco selecionado (opcional)
  const drawerSubfocos = useMemo(() => {
    if (!newCardFoco) return [];
    const temaObj = drawerTemas.find((t) => t.tema === newCardTema);
    const focoObj = temaObj?.focos.find((f) => f.foco === newCardFoco);
    return focoObj?.subfocos || [];
  }, [drawerTemas, newCardTema, newCardFoco]);

  // Sub-subfocos do subfoco selecionado (opcional)
  const drawerSubSubfocos = useMemo(() => {
    if (!newCardSubfoco) return [];
    const subObj = drawerSubfocos.find(
      (s) => (typeof s === 'string' ? s : s.subfoco) === newCardSubfoco
    );
    if (!subObj || typeof subObj === 'string') return [];
    return subObj.sub_subfocos || [];
  }, [drawerSubfocos, newCardSubfoco]);

  const ensureDeckFromInput = (): { id: string; name: string } => {
    if (exactDeckMatch) {
      setSelectedDeckId(exactDeckMatch.id);
      setDeckInput(exactDeckMatch.name);
      return { id: exactDeckMatch.id, name: exactDeckMatch.name };
    }

    if (cleanTypedDeckPath) {
      const { deckIdByPath, createdDecks } = resolveOrCreateDeckHierarchy(
        [cleanTypedDeckPath],
        userDecks
      );
      if (createdDecks.length > 0) {
        const updatedList = flashcardsService.saveCustomDecksBatch(createdDecks, user?.id);
        setUserDecks(updatedList);
      }
      const resolvedId = deckIdByPath.get(cleanTypedDeckPath) || 'deck-padrao';
      setSelectedDeckId(resolvedId);
      setDeckInput(cleanTypedDeckPath);
      return { id: resolvedId, name: cleanTypedDeckPath };
    }

    const fallbackDeck = userDecks.find((d) => d.id === selectedDeckId);
    return {
      id: fallbackDeck?.id || 'deck-padrao',
      name: fallbackDeck?.name || 'Baralho Padrão'
    };
  };

  // Inserir Oclusão Cloze
  const handleInsertCloze = () => {
    const textarea = frontTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = newCardFront;
    const selectedText = text.substring(start, end);

    const existingMatches = text.match(/\{\{c(\d+)::/g) || [];
    const nextNum = existingMatches.length + 1;

    const replacement = selectedText
      ? `{{c${nextNum}::${selectedText}}}`
      : `{{c${nextNum}::resposta}}`;

    const updated = text.substring(0, start) + replacement + text.substring(end);
    setNewCardFront(updated);

    setTimeout(() => {
      textarea.focus();
      const newCursor = start + replacement.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  // Salvar Novo Flashcard
  const canSaveCard =
    (Boolean(newCardFront.trim()) || Boolean(newCardFrontImageUrl)) &&
    (Boolean(newCardBack.trim()) || Boolean(newCardBackImageUrl));

  const handleSaveNewFlashcard = (keepOpen = false) => {
    if (!canSaveCard) return;

    const tagsArray = newCardTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const resolvedDeck = ensureDeckFromInput();

    const newCard: FlashcardItem = {
      id: editingCardId || '',
      front: newCardFront.trim(),
      back: newCardBack.trim(),
      comment: newCardComment.trim() || undefined,
      imageFrontUrl: newCardFrontImageUrl || null,
      imageUrl: newCardBackImageUrl || null,
      specialty: newCardSpecialty.trim() || 'Geral',
      theme: newCardTema.trim() || '',
      focus: newCardFoco.trim() || '',
      subfocus: newCardSubfoco.trim() || undefined,
      sub_subfocus: newCardSubSubfoco.trim() || undefined,
      subSubfocus: newCardSubSubfoco.trim() || undefined,
      deckId: resolvedDeck.id,
      priority: newCardPriority,
      tags: tagsArray.length > 0 ? tagsArray : undefined
    };

    const savedCard = flashcardsService.saveNewFlashcard(newCard, user?.id);
    onCardSaved(savedCard, resolvedDeck.name);

    setSavedDeckNotice(resolvedDeck.name);
    setTimeout(() => setSavedDeckNotice(null), 3500);

    if (keepOpen) {
      setNewCardFront('');
      setNewCardBack('');
      setNewCardComment('');
      setNewCardFrontImageUrl(null);
      setNewCardBackImageUrl(null);
      setNewCardTags('');
      if (frontTextareaRef.current) frontTextareaRef.current.focus();
    } else {
      onClose();
      setNewCardFront('');
      setNewCardBack('');
      setNewCardComment('');
      setNewCardFrontImageUrl(null);
      setNewCardBackImageUrl(null);
      setNewCardTags('');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95 duration-200 custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Topo do Drawer Central */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <Brain className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base text-zinc-900 dark:text-zinc-100">
                {editingCardId ? 'Editar Flashcard' : 'Novo Cartão'}
              </h3>
              <p className="text-[11px] text-zinc-500">
                Escolha ou digite o baralho de destino e crie seu cartão com suporte a Cloze.
              </p>
            </div>
          </div>

          <BackArrowButton
            onClick={onClose}
            variant="ghost"
            title="Fechar"
            ariaLabel="Fechar formulário de flashcard"
          />
        </div>

        {/* Toast Interno */}
        {savedDeckNotice && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in-50 duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Cartão salvo em {savedDeckNotice.replace(/::/g, ' › ')}!</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Baralho de Destino (Selecionar ou Criar Baralho / Sub-baralho) */}
          <div ref={deckBoxRef} className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <span>Baralho de Destino</span>
              </label>
              <span className="text-[10px] text-zinc-400">
                Use <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 rounded">::</code> para sub-baralho
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={deckInput}
                onFocus={() => setIsDeckMenuOpen(true)}
                onChange={(e) => {
                  setDeckInput(e.target.value);
                  setIsDeckMenuOpen(true);
                }}
                placeholder="Ex: Prova ou Prova::AP1"
                className="w-full pl-3.5 pr-9 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all text-xs sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setIsDeckMenuOpen((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                aria-label="Listar baralhos"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${isDeckMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {isDeckMenuOpen && (
              <div className="absolute z-20 left-0 right-0 mt-1.5 max-h-52 overflow-y-auto rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl py-1.5 custom-scrollbar">
                {cleanTypedDeckPath && !exactDeckMatch && (
                  <button
                    type="button"
                    onClick={() => {
                      ensureDeckFromInput();
                      setIsDeckMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer border-b border-zinc-100 dark:border-zinc-800"
                  >
                    <FolderPlus className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {cleanTypedDeckPath.includes('::')
                        ? `Criar sub-baralho "${cleanTypedDeckPath.replace(/::/g, ' › ')}"`
                        : `Criar baralho "${cleanTypedDeckPath}"`}
                    </span>
                  </button>
                )}

                {filteredDecks.length > 0 ? (
                  filteredDecks.map((d) => {
                    const isSelected = d.id === selectedDeckId && exactDeckMatch?.id === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          setSelectedDeckId(d.id);
                          setDeckInput(d.name);
                          setIsDeckMenuOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-900 dark:text-zinc-100'
                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <span className="truncate">{d.name.replace(/::/g, ' › ')}</span>
                        {d.id === 'deck-padrao' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 shrink-0">
                            Padrão
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3.5 py-2 text-[11px] text-zinc-400">
                    Nenhum baralho encontrado. Clique acima para criar.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Frente do Flashcard */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Frente (Pergunta ou Cloze) *
              </label>
              <button
                type="button"
                onClick={handleInsertCloze}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-colors inline-flex items-center gap-1 cursor-pointer"
                title="Selecione um termo no texto e clique para criar uma oclusão cloze"
              >
                <span>+ Cloze &#123;&#123;c1::...&#125;&#125;</span>
              </button>
            </div>

            <textarea
              ref={frontTextareaRef}
              rows={3}
              value={newCardFront}
              onChange={(e) => setNewCardFront(e.target.value)}
              onPaste={(e) => {
                const file = extractClipboardImageFile(e);
                if (file) {
                  e.preventDefault();
                  void uploadFlashcardImageFile(file)
                    .then((url) => setNewCardFrontImageUrl(url))
                    .catch(() => {});
                }
              }}
              placeholder="Ex: A ingestão de {{c1::bateria de disco}} no esôfago exige remoção endoscópica imediata."
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all font-mono text-xs sm:text-sm"
            />

            <FlashcardImageField
              label="Imagem da Frente (Opcional)"
              imageUrl={newCardFrontImageUrl}
              onChange={setNewCardFrontImageUrl}
              compact
            />
          </div>

          {/* Verso do Flashcard (Resposta) */}
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
              Verso (Resposta) *
            </label>
            <textarea
              rows={2}
              value={newCardBack}
              onChange={(e) => setNewCardBack(e.target.value)}
              onPaste={(e) => {
                const file = extractClipboardImageFile(e);
                if (file) {
                  e.preventDefault();
                  void uploadFlashcardImageFile(file)
                    .then((url) => setNewCardBackImageUrl(url))
                    .catch(() => {});
                }
              }}
              placeholder="Ex: bateria de disco (ou remoção endoscópica imediata)"
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all text-xs sm:text-sm"
            />

            <FlashcardImageField
              label="Imagem do Verso / Esquema Diagnóstico (Opcional)"
              imageUrl={newCardBackImageUrl}
              onChange={setNewCardBackImageUrl}
              compact
            />
          </div>

          {/* Comentário Opcional */}
          <div className="space-y-1">
            <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
              Nota / Justificativa (Opcional)
            </label>
            <textarea
              rows={2}
              value={newCardComment}
              onChange={(e) => setNewCardComment(e.target.value)}
              placeholder="Anotação adicional, mnemônico ou armadilha de prova..."
              className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all text-xs"
            />
          </div>

          {/* Prioridade e Tags */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={() =>
                setNewCardPriority((prev) =>
                  prev === 'essential' ? 'standard' : 'essential'
                )
              }
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                newCardPriority === 'essential'
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                  : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  newCardPriority === 'essential'
                    ? 'fill-amber-500 text-amber-500'
                    : 'text-zinc-400'
                }`}
              />
              <span>Prioritário</span>
            </button>

            <div className="relative flex-1">
              <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={newCardTags}
                onChange={(e) => setNewCardTags(e.target.value)}
                placeholder="Tags separadas por vírgula (opcional)"
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
          </div>

          {/* Classificação Clínica Opcional (Retrátil) */}
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowClassification((prev) => !prev)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
            >
              <span>Classificação clínica (opcional)</span>
              {showClassification ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {showClassification && (
              <div className="px-3.5 pb-3.5 pt-1 grid sm:grid-cols-2 gap-2.5 border-t border-zinc-200/60 dark:border-zinc-800/60">
                <div>
                  <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Especialidade
                  </label>
                  <select
                    value={newCardSpecialty}
                    onChange={(e) => {
                      setNewCardSpecialty(e.target.value);
                      setNewCardTema('');
                      setNewCardFoco('');
                      setNewCardSubfoco('');
                      setNewCardSubSubfoco('');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                  >
                    <option value="">Sem especialidade</option>
                    {SPECIALTY_CONFIGS.map((sp) => (
                      <option key={sp.id} value={sp.name}>
                        {sp.name}
                      </option>
                    ))}
                  </select>
                </div>

                {drawerTemas.length > 0 && (
                  <div>
                    <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Tema
                    </label>
                    <select
                      value={newCardTema}
                      onChange={(e) => {
                        setNewCardTema(e.target.value);
                        setNewCardFoco('');
                        setNewCardSubfoco('');
                        setNewCardSubSubfoco('');
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                    >
                      <option value="">Sem tema</option>
                      {drawerTemas.map((tem) => (
                        <option key={tem.tema} value={tem.tema}>
                          {tem.tema}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {drawerFocos.length > 0 && (
                  <div>
                    <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Foco
                    </label>
                    <select
                      value={newCardFoco}
                      onChange={(e) => {
                        setNewCardFoco(e.target.value);
                        setNewCardSubfoco('');
                        setNewCardSubSubfoco('');
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                    >
                      <option value="">Sem foco</option>
                      {drawerFocos.map((foc) => (
                        <option key={foc} value={foc}>
                          {foc}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {drawerSubfocos.length > 0 && (
                  <div>
                    <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Subfoco
                    </label>
                    <select
                      value={newCardSubfoco}
                      onChange={(e) => {
                        setNewCardSubfoco(e.target.value);
                        setNewCardSubSubfoco('');
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                    >
                      <option value="">Nenhum</option>
                      {drawerSubfocos.map((s) => {
                        const sName = typeof s === 'string' ? s : s.subfoco;
                        return (
                          <option key={sName} value={sName}>
                            {sName}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {drawerSubSubfocos.length > 0 && (
                  <div>
                    <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Sub-subfoco
                    </label>
                    <select
                      value={newCardSubSubfoco}
                      onChange={(e) => setNewCardSubSubfoco(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                    >
                      <option value="">Nenhum</option>
                      {drawerSubSubfocos.map((ss) => (
                        <option key={ss} value={ss}>
                          {formatSubSubfocoDisplay(ss)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Fechar
          </button>

          <button
            type="button"
            disabled={!canSaveCard}
            onClick={() => handleSaveNewFlashcard(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            Salvar e Criar Outro
          </button>

          <button
            type="button"
            disabled={!canSaveCard}
            onClick={() => handleSaveNewFlashcard(false)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-95 transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Salvar Cartão</span>
          </button>
        </div>
      </div>
    </div>
  );
};
