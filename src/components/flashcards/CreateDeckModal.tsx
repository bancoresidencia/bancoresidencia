'use client';

import React, { useState } from 'react';
import { Layers, X, Check } from 'lucide-react';
import { CustomFlashcardDeck } from '@/types/flashcards';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { flashcardsService } from '@/services/flashcardsService';

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeckCreated: () => void;
}

export const CreateDeckModal: React.FC<CreateDeckModalProps> = ({
  isOpen,
  onClose,
  onDeckCreated
}) => {
  const { accentConfig } = useTheme();
  const { user } = useAuth();

  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckName.trim()) return;

    const newDeck: CustomFlashcardDeck = {
      id: `deck-${Date.now()}`,
      name: deckName.trim(),
      description: deckDescription.trim() || undefined,
      specialties: [],
      createdAt: new Date().toISOString()
    };

    flashcardsService.saveCustomDeck(newDeck, user?.id);
    onDeckCreated();
    setDeckName('');
    setDeckDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base text-zinc-900 dark:text-zinc-100">
                Criar Novo Baralho
              </h3>
              <p className="text-xs text-zinc-500">
                Organize seus próprios cartões e anotações clínicas.
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

        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
              Nome do Baralho *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="Ex: Internato - Casos Clínicos, Erros de Simulado..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
              Descrição (Opcional)
            </label>
            <textarea
              rows={2}
              value={deckDescription}
              onChange={(e) => setDeckDescription(e.target.value)}
              placeholder="Descreva o propósito ou matérias deste baralho..."
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-xs"
            />
          </div>

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!deckName.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Salvar Baralho</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
