'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  Brain,
  X,
  CheckCircle2,
  Check,
  Star,
  Tag
} from 'lucide-react';
import { FlashcardItem } from '@/types/flashcards';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { flashcardsService } from '@/services/flashcardsService';
import { clinicalHierarchy } from '@/data/mockQuestions';
import { formatSubSubfocoDisplay } from '@/components/AdvancedQuestionFilters';
import { SPECIALTY_CONFIGS } from '../FlashcardsView';

interface AddFlashcardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCardSaved: () => void;
  initialDeckId?: string;
  initialFront?: string;
  initialBack?: string;
  initialSpecialty?: string;
  initialTema?: string;
  initialFoco?: string;
  initialComment?: string;
}

export const AddFlashcardDrawer: React.FC<AddFlashcardDrawerProps> = ({
  isOpen,
  onClose,
  onCardSaved,
  initialDeckId = 'deck-padrao',
  initialFront,
  initialBack,
  initialSpecialty,
  initialTema,
  initialFoco,
  initialComment
}) => {
  const { accentConfig } = useTheme();
  const { user } = useAuth();

  const userDecks = useMemo(() => {
    return flashcardsService.getCustomDecks(user?.id);
  }, [user?.id, isOpen]);

  const [selectedDeckId, setSelectedDeckId] = useState(initialDeckId);
  const [newCardSpecialty, setNewCardSpecialty] = useState(initialSpecialty || 'Clínica Médica');
  const [newCardTema, setNewCardTema] = useState(initialTema || '');
  const [newCardFoco, setNewCardFoco] = useState(initialFoco || '');
  const [newCardSubfoco, setNewCardSubfoco] = useState('');
  const [newCardSubSubfoco, setNewCardSubSubfoco] = useState('');
  const [newCardFront, setNewCardFront] = useState(initialFront || '');
  const [newCardBack, setNewCardBack] = useState(initialBack || '');
  const [newCardComment, setNewCardComment] = useState(initialComment || '');
  const [newCardPriority, setNewCardPriority] = useState<'essential' | 'standard'>('essential');
  const [newCardTags, setNewCardTags] = useState('');
  const [addCardSuccessToast, setAddCardSuccessToast] = useState(false);

  const frontTextareaRef = useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      if (initialDeckId) setSelectedDeckId(initialDeckId);
      if (initialSpecialty) setNewCardSpecialty(initialSpecialty);
      if (initialTema) setNewCardTema(initialTema);
      if (initialFoco) setNewCardFoco(initialFoco);
      if (initialFront !== undefined) setNewCardFront(initialFront);
      if (initialBack !== undefined) setNewCardBack(initialBack);
      if (initialComment !== undefined) setNewCardComment(initialComment);
    }
  }, [isOpen, initialDeckId, initialSpecialty, initialTema, initialFoco, initialFront, initialBack, initialComment]);

  // Temas da especialidade selecionada no Drawer
  const drawerTemas = useMemo(() => {
    const hNode = clinicalHierarchy.find(
      (h) =>
        h.especialidade.toLowerCase() === newCardSpecialty.toLowerCase() ||
        (newCardSpecialty === 'Cirurgia Geral' && h.especialidade === 'Cirurgia') ||
        (newCardSpecialty === 'Cirurgia' && h.especialidade === 'Cirurgia')
    );
    return hNode?.temas || [];
  }, [newCardSpecialty]);

  // Focos do tema selecionado no Drawer
  const drawerFocos = useMemo(() => {
    const temaObj = drawerTemas.find((t) => t.tema === newCardTema);
    return temaObj?.focos.map((f) => f.foco) || [];
  }, [drawerTemas, newCardTema]);

  // Subfocos do foco selecionado no Drawer
  const drawerSubfocos = useMemo(() => {
    const temaObj = drawerTemas.find((t) => t.tema === newCardTema);
    const focoObj = temaObj?.focos.find((f) => f.foco === newCardFoco);
    return focoObj?.subfocos || [];
  }, [drawerTemas, newCardTema, newCardFoco]);

  // Sub-subfocos do subfoco selecionado no Drawer
  const drawerSubSubfocos = useMemo(() => {
    if (!newCardSubfoco) return [];
    const subObj = drawerSubfocos.find(
      (s) => (typeof s === 'string' ? s : s.subfoco) === newCardSubfoco
    );
    if (!subObj || typeof subObj === 'string') return [];
    return subObj.sub_subfocos || [];
  }, [drawerSubfocos, newCardSubfoco]);

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
  const handleSaveNewFlashcard = (keepOpen = false) => {
    if (!newCardFront.trim() || !newCardBack.trim()) return;

    const tagsArray = newCardTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const finalTema = newCardTema.trim() || 'Geral';
    const finalFoco = newCardFoco.trim() || finalTema;

    const newCard: FlashcardItem = {
      id: `fc-user-${Date.now()}`,
      front: newCardFront.trim(),
      back: newCardBack.trim(),
      comment: newCardComment.trim() || undefined,
      specialty: newCardSpecialty,
      theme: finalTema,
      focus: finalFoco,
      subfocus: newCardSubfoco.trim() || undefined,
      sub_subfocus: newCardSubSubfoco.trim() || undefined,
      subSubfocus: newCardSubSubfoco.trim() || undefined,
      deckId: selectedDeckId,
      priority: newCardPriority,
      tags: tagsArray.length > 0 ? tagsArray : undefined
    };

    flashcardsService.saveNewFlashcard(newCard, user?.id);
    onCardSaved();

    setAddCardSuccessToast(true);
    setTimeout(() => setAddCardSuccessToast(false), 3000);

    if (keepOpen) {
      setNewCardFront('');
      setNewCardBack('');
      setNewCardComment('');
      setNewCardTags('');
      setNewCardSubfoco('');
      setNewCardSubSubfoco('');
      if (frontTextareaRef.current) frontTextareaRef.current.focus();
    } else {
      onClose();
      setNewCardFront('');
      setNewCardBack('');
      setNewCardComment('');
      setNewCardTags('');
      setNewCardSubfoco('');
      setNewCardSubSubfoco('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-5 animate-in fade-in-50 zoom-in-95 duration-200 custom-scrollbar">
        {/* Topo do Drawer Central */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                Adicionar Flashcard
              </h3>
              <p className="text-xs text-zinc-500">
                Crie um cartão de memorização ativa com suporte a oclusão Cloze.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast de Sucesso Interno */}
        {addCardSuccessToast && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in-50 duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Flashcard adicionado com sucesso! Já está disponível para estudo.</span>
          </div>
        )}

        {/* Campos do Formulário do Flashcard */}
        <div className="space-y-4 text-xs">
          {/* Baralho e Especialidade */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Baralho de Destino
              </label>
              <select
                value={selectedDeckId}
                onChange={(e) => setSelectedDeckId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                {userDecks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.isDefault || d.id === 'deck-padrao' ? '(Padrão)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Especialidade *
              </label>
              <select
                value={newCardSpecialty}
                onChange={(e) => {
                  const spec = e.target.value;
                  setNewCardSpecialty(spec);
                  const hNode = clinicalHierarchy.find(
                    (h) =>
                      h.especialidade.toLowerCase() === spec.toLowerCase() ||
                      (spec === 'Cirurgia Geral' && h.especialidade === 'Cirurgia') ||
                      (spec === 'Cirurgia' && h.especialidade === 'Cirurgia')
                  );
                  const firstTema = hNode?.temas[0]?.tema || '';
                  setNewCardTema(firstTema);
                  setNewCardFoco(hNode?.temas[0]?.focos[0]?.foco || '');
                }}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                {SPECIALTY_CONFIGS.map((sp) => (
                  <option key={sp.id} value={sp.name}>
                    {sp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tema e Foco */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Tema *
              </label>
              <select
                value={newCardTema}
                onChange={(e) => {
                  const tem = e.target.value;
                  setNewCardTema(tem);
                  const temaObj = drawerTemas.find((t) => t.tema === tem);
                  setNewCardFoco(temaObj?.focos[0]?.foco || '');
                }}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                {drawerTemas.map((tem) => (
                  <option key={tem.tema} value={tem.tema}>
                    {tem.tema}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Foco Clínico
              </label>
              <select
                value={newCardFoco}
                onChange={(e) => {
                  setNewCardFoco(e.target.value);
                  setNewCardSubfoco('');
                  setNewCardSubSubfoco('');
                }}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                {drawerFocos.map((foc) => (
                  <option key={foc} value={foc}>
                    {foc}
                  </option>
                ))}
              </select>
            </div>

            {drawerSubfocos.length > 0 && (
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Subfoco (Opcional)
                </label>
                <select
                  value={newCardSubfoco}
                  onChange={(e) => {
                    setNewCardSubfoco(e.target.value);
                    setNewCardSubSubfoco('');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                >
                  <option value="">Nenhum subfoco específico</option>
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
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Sub-subfoco / 4º Nível (Opcional)
                </label>
                <select
                  value={newCardSubSubfoco}
                  onChange={(e) => setNewCardSubSubfoco(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                >
                  <option value="">Nenhum sub-subfoco específico</option>
                  {drawerSubSubfocos.map((ss) => (
                    <option key={ss} value={ss}>
                      {formatSubSubfocoDisplay(ss)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Frente do Flashcard com Auxiliar de Cloze */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-zinc-700 dark:text-zinc-300">
                Frente do Cartão (Pergunta ou Oclusão Cloze) *
              </label>
              <button
                type="button"
                onClick={handleInsertCloze}
                className="text-[11px] font-bold px-2 py-0.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-colors inline-flex items-center gap-1 cursor-pointer"
                title="Selecione um termo no texto e clique para criar uma oclusão cloze"
              >
                <span>[ Inserir Cloze &#123;&#123;c1::...&#125;&#125; ]</span>
              </button>
            </div>

            <textarea
              ref={frontTextareaRef}
              rows={3}
              value={newCardFront}
              onChange={(e) => setNewCardFront(e.target.value)}
              placeholder="Ex: A ingestão de {{c1::bateria de disco}} no esôfago exige remoção endoscópica imediata."
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all font-mono text-xs sm:text-sm"
            />
          </div>

          {/* Verso do Flashcard (Resposta) */}
          <div className="space-y-1">
            <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
              Verso do Cartão (Resposta Direta) *
            </label>
            <input
              type="text"
              value={newCardBack}
              onChange={(e) => setNewCardBack(e.target.value)}
              placeholder="Ex: bateria de disco (ou remoção endoscópica imediata)"
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all"
            />
          </div>

          {/* Comentário / Justificativa Clínica */}
          <div className="space-y-1">
            <label className="font-bold text-zinc-700 dark:text-zinc-300 block">
              Justificativa Clínica & Armadilha de Prova (Opcional)
            </label>
            <textarea
              rows={2}
              value={newCardComment}
              onChange={(e) => setNewCardComment(e.target.value)}
              placeholder="Ex: Necrose por liquefação em até 2 horas. No RX, o duplo contorno diferencia da moeda."
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all text-xs"
            />
          </div>

          {/* Prioridade e Tags */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
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
              <span>Cartão Prioritário (Alta Relevância)</span>
            </button>

            <div className="relative flex-1 max-w-xs">
              <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={newCardTags}
                onChange={(e) => setNewCardTags(e.target.value)}
                placeholder="Tags separadas por vírgula"
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Rodapé do Drawer Central */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Fechar
          </button>

          <button
            type="button"
            disabled={!newCardFront.trim() || !newCardBack.trim()}
            onClick={() => handleSaveNewFlashcard(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            Salvar e Criar Outro
          </button>

          <button
            type="button"
            disabled={!newCardFront.trim() || !newCardBack.trim()}
            onClick={() => handleSaveNewFlashcard(false)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-95 transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Salvar Flashcard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
