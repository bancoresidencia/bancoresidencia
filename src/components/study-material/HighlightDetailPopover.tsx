'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Highlighter,
  Underline,
  Strikethrough,
  StickyNote,
  Trash2,
  X,
  Check,
  Brain
} from 'lucide-react';
import {
  HighlighterColor,
  HighlightStyle,
  HIGHLIGHTER_COLORS,
  StudyHighlight
} from '@/types/studyMaterialAnnotations';

interface HighlightDetailPopoverProps {
  highlight: StudyHighlight;
  anchorRect: DOMRect;
  onUpdate: (id: string, updates: Partial<StudyHighlight>) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
  onCreateFlashcard?: (highlight: StudyHighlight) => void;
}

export const HighlightDetailPopover: React.FC<HighlightDetailPopoverProps> = ({
  highlight,
  anchorRect,
  onUpdate,
  onRemove,
  onClose,
  onCreateFlashcard
}) => {
  const [isNoteOpen, setIsNoteOpen] = useState<boolean>(Boolean(highlight.note));
  const [noteText, setNoteText] = useState<string>(highlight.note || '');
  const popoverRef = useRef<HTMLDivElement>(null);

  const colorsList: HighlighterColor[] = ['yellow', 'green', 'pink', 'blue', 'orange', 'purple'];

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleClickOutside, true);
    return () => window.removeEventListener('mousedown', handleClickOutside, true);
  }, [onClose]);

  const handleSelectColor = (color: HighlighterColor) => {
    onUpdate(highlight.id, { color });
  };

  const handleToggleStyle = (style: HighlightStyle) => {
    const nextStyle = highlight.style === style ? 'highlight' : style;
    onUpdate(highlight.id, { style: nextStyle });
  };

  const handleSaveNote = () => {
    onUpdate(highlight.id, { note: noteText.trim() || undefined });
    setIsNoteOpen(false);
  };

  // Cálculo de posição centralizada e segura em relação ao elemento clicado
  const top = anchorRect.top < 110 ? anchorRect.bottom + 8 : anchorRect.top - 52;
  const left = Math.max(180, Math.min(typeof window !== 'undefined' ? window.innerWidth - 180 : 300, anchorRect.left + anchorRect.width / 2));

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 flex flex-col items-center select-none animate-in fade-in zoom-in-95 duration-100"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        transform: 'translateX(-50%)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Barra Principal de Edição do Grifo */}
      <div className="flex items-center gap-1.5 p-1.5 bg-zinc-950/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl border border-zinc-700/80 shadow-2xl text-white">
        
        {/* Seletor Rápido de Cor */}
        <div className="flex items-center gap-1 px-1 border-r border-zinc-700/60">
          {colorsList.map((c) => {
            const config = HIGHLIGHTER_COLORS[c];
            const isSelected = highlight.color === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => handleSelectColor(c)}
                title={config.name}
                className={`w-5 h-5 rounded-full transition-transform hover:scale-120 active:scale-95 flex items-center justify-center cursor-pointer shadow-xs ${
                  isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: config.hex }}
              >
                {isSelected && <span className="w-1 h-1 rounded-full bg-black" />}
              </button>
            );
          })}
        </div>

        {/* Estilos: Sublinhado e Tachado */}
        <div className="flex items-center gap-0.5 px-0.5 border-r border-zinc-700/60">
          <button
            type="button"
            onClick={() => handleToggleStyle('underline')}
            title="Sublinhar"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              highlight.style === 'underline'
                ? 'bg-zinc-800 text-sky-400'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleToggleStyle('strikethrough')}
            title="Tachar (riscar afirmativa)"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              highlight.style === 'strikethrough'
                ? 'bg-zinc-800 text-rose-400'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Strikethrough className="w-4 h-4" />
          </button>
        </div>

        {/* Anotação Pessoal */}
        <button
          type="button"
          onClick={() => setIsNoteOpen((prev) => !prev)}
          title="Ver ou editar anotação clínica"
          className={`p-1.5 rounded-lg transition-colors cursor-pointer relative ${
            isNoteOpen || highlight.note
              ? 'bg-zinc-800 text-amber-300'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <StickyNote className="w-4 h-4" />
          {highlight.note && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full" />
          )}
        </button>

        {/* Criar Flashcard com o Destaque */}
        {onCreateFlashcard && (
          <button
            type="button"
            onClick={() => {
              onCreateFlashcard(highlight);
              onClose();
            }}
            title="Criar Flashcard deste destaque"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-transform active:scale-95 cursor-pointer shadow-xs ml-0.5"
          >
            <Brain className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Criar Flashcard</span>
          </button>
        )}

        {/* Remover Marcação */}
        <button
          type="button"
          onClick={() => {
            onRemove(highlight.id);
            onClose();
          }}
          title="Excluir este destaque"
          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer ml-0.5"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Fechar */}
        <button
          type="button"
          onClick={onClose}
          title="Fechar"
          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Caixa de Anotação Clínica */}
      {isNoteOpen && (
        <div className="mt-2 w-72 p-3 bg-zinc-950/98 dark:bg-zinc-900/98 border border-zinc-700 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-800">
            <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5 text-amber-400" />
              Anotação Clínica Pessoal
            </span>
            <button
              type="button"
              onClick={() => setIsNoteOpen(false)}
              className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSaveNote();
              }
            }}
            placeholder="Digite sua nota... (Ctrl+Enter para salvar)"
            rows={2}
            className="w-full text-xs bg-zinc-900 dark:bg-zinc-950 text-zinc-100 rounded-xl p-2 border border-zinc-700/80 focus:border-amber-400 focus:outline-none resize-none placeholder:text-zinc-500"
            autoFocus
          />
          <div className="flex items-center justify-between gap-2 mt-2">
            {highlight.note ? (
              <button
                type="button"
                onClick={() => {
                  setNoteText('');
                  onUpdate(highlight.id, { note: undefined });
                  setIsNoteOpen(false);
                }}
                className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                Excluir nota
              </button>
            ) : <span />}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsNoteOpen(false)}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 cursor-pointer px-2 py-1"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-zinc-950 px-3 py-1 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
