'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Trash2,
  Edit2,
  Layers,
  ArrowLeft,
  Filter,
  CheckCircle2,
  Calendar,
  Tag
} from 'lucide-react';
import { FlashcardItem, CustomFlashcardDeck } from '@/types/flashcards';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { flashcardsService } from '@/services/flashcardsService';

interface OriginalCardsBrowserProps {
  cards: FlashcardItem[];
  decks: CustomFlashcardDeck[];
  onBackToDecks: () => void;
  onRefreshCards: () => void;
}

export const OriginalCardsBrowser: React.FC<OriginalCardsBrowserProps> = ({
  cards,
  decks,
  onBackToDecks,
  onRefreshCards
}) => {
  const { accentConfig } = useTheme();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeckFilter, setSelectedDeckFilter] = useState('all');

  // Estado para Edição de Cartão
  const [editingCard, setEditingCard] = useState<FlashcardItem | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editDeckId, setEditDeckId] = useState('deck-padrao');

  const deckMap = useMemo(() => {
    const map = new Map<string, string>();
    decks.forEach((d) => map.set(d.id, d.name));
    return map;
  }, [decks]);

  const filteredCards = useMemo(() => {
    let list = [...cards];
    if (selectedDeckFilter !== 'all') {
      list = list.filter((c) => (c.deckId || 'deck-padrao') === selectedDeckFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.front.toLowerCase().includes(q) ||
          c.back.toLowerCase().includes(q) ||
          (c.comment && c.comment.toLowerCase().includes(q)) ||
          (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [cards, selectedDeckFilter, searchQuery]);

  const handleDeleteCard = (cardId: string) => {
    if (confirm('Tem certeza que deseja excluir este flashcard?')) {
      flashcardsService.deleteUserFlashcard(cardId, user?.id);
      onRefreshCards();
    }
  };

  const handleOpenEdit = (card: FlashcardItem) => {
    setEditingCard(card);
    setEditFront(card.front);
    setEditBack(card.back);
    setEditComment(card.comment || '');
    setEditDeckId(card.deckId || 'deck-padrao');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard || !editFront.trim() || !editBack.trim()) return;

    const updatedCard: FlashcardItem = {
      ...editingCard,
      front: editFront.trim(),
      back: editBack.trim(),
      comment: editComment.trim() || undefined,
      deckId: editDeckId
    };

    flashcardsService.saveNewFlashcard(updatedCard, user?.id);
    onRefreshCards();
    setEditingCard(null);
  };

  return (
    <div className="space-y-4">
      {/* Barra Superior do Navegador de Cartões */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 p-3 sm:p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToDecks}
            className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold"
            title="Voltar aos Baralhos"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar aos Baralhos</span>
          </button>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

          <h2 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
            Painel de Cartões Autorais
          </h2>
          <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold">
            {filteredCards.length} {filteredCards.length === 1 ? 'card' : 'cards'}
          </span>
        </div>

        {/* Filtros: Busca e Dropdown de Baralho */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar em perguntas, respostas..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <select
              value={selectedDeckFilter}
              onChange={(e) => setSelectedDeckFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value="all">Todos os Baralhos</option>
              {decks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabela dos Cartões Criados */}
      <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800/80 rounded-2xl shadow-xs overflow-hidden">
        {filteredCards.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs space-y-2">
            <Layers className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="font-bold text-zinc-700 dark:text-zinc-300">
              Nenhum cartão encontrado neste baralho ou termo de busca.
            </p>
            <p className="text-[11px] text-zinc-400">
              Crie seu primeiro flashcard autoral usando o botão &quot;Criar&quot; no topo.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4 w-5/12">Frente / Pergunta</th>
                  <th className="py-2.5 px-4 w-3/12">Verso / Resposta</th>
                  <th className="py-2.5 px-3 w-2/12">Baralho</th>
                  <th className="py-2.5 px-3 text-center">Reps</th>
                  <th className="py-2.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredCards.map((card) => {
                  const deckName = deckMap.get(card.deckId || 'deck-padrao') || 'Baralho Padrão';
                  const reps = card.progress?.repetitions || 0;

                  return (
                    <tr
                      key={card.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="py-2.5 px-4 align-top">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">
                          {card.front}
                        </p>
                        {card.comment && (
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-1 mt-0.5">
                            {card.comment}
                          </p>
                        )}
                      </td>
                      <td className="py-2.5 px-4 align-top text-zinc-700 dark:text-zinc-300">
                        <p className="line-clamp-2">{card.back}</p>
                      </td>
                      <td className="py-2.5 px-3 align-top">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          {deckName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 align-top text-center font-mono font-bold text-zinc-500 dark:text-zinc-400">
                        {reps}
                      </td>
                      <td className="py-2.5 px-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(card)}
                            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Editar Flashcard"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCard(card.id)}
                            className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            title="Excluir Flashcard"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Edição Rápida */}
      {editingCard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-heading font-black text-base text-zinc-900 dark:text-zinc-100">
                Editar Flashcard
              </h3>
              <button
                type="button"
                onClick={() => setEditingCard(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Baralho
                </label>
                <select
                  value={editDeckId}
                  onChange={(e) => setEditDeckId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none"
                >
                  {decks.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Frente do Cartão (Pergunta / Cloze) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editFront}
                  onChange={(e) => setEditFront(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Verso do Cartão (Resposta) *
                </label>
                <input
                  type="text"
                  required
                  value={editBack}
                  onChange={(e) => setEditBack(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Comentário Clínico
                </label>
                <textarea
                  rows={2}
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs"
                  style={{ backgroundColor: accentConfig.primaryHex }}
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
