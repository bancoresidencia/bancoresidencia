'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Underline,
  Strikethrough,
  StickyNote,
  Brain,
  Sliders,
  X,
  Check
} from 'lucide-react';
import {
  HighlighterColor,
  HighlightStyle,
  HIGHLIGHTER_COLORS
} from '@/types/studyMaterialAnnotations';

interface StudySelectionFloatingMenuProps {
  selectedText: string;
  sentenceContext?: string;
  anchorRect: DOMRect;
  activeColor?: HighlighterColor;
  onHighlight: (color: HighlighterColor, style?: HighlightStyle, note?: string) => void;
  onCreateFlashcardAuto: (text: string, context?: string) => void;
  onOpenFlashcardDrawer: (text: string, context?: string) => void;
  onClose: () => void;
}

export const StudySelectionFloatingMenu: React.FC<StudySelectionFloatingMenuProps> = ({
  selectedText,
  sentenceContext,
  anchorRect,
  activeColor = 'yellow',
  onHighlight,
  onCreateFlashcardAuto,
  onOpenFlashcardDrawer,
  onClose
}) => {
  const [isNoteOpen, setIsNoteOpen] = useState<boolean>(false);
  const [noteText, setNoteText] = useState<string>('');
  const [selectedHighlightColor, setSelectedHighlightColor] = useState<HighlighterColor>(activeColor);
  const menuRef = useRef<HTMLDivElement>(null);

  const colorsList: HighlighterColor[] = ['yellow', 'green', 'pink', 'blue', 'orange', 'purple'];

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleClickOutside, true);
    return () => window.removeEventListener('mousedown', handleClickOutside, true);
  }, [onClose]);

  // Tecla Escape para fechar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSaveNote = () => {
    onHighlight(selectedHighlightColor, 'highlight', noteText.trim() || undefined);
  };

  // Posicionamento inteligente (acima da seleção ou abaixo se estiver perto do topo)
  const top = anchorRect.top < 120 ? anchorRect.bottom + 10 : anchorRect.top - 54;
  const left = Math.max(
    190,
    Math.min(
      typeof window !== 'undefined' ? window.innerWidth - 190 : 300,
      anchorRect.left + anchorRect.width / 2
    )
  );

  return (
    <div
      ref={menuRef}
      className="fixed z-50 flex flex-col items-center select-none animate-in fade-in zoom-in-95 duration-100"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        transform: 'translateX(-50%)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Barra Principal de Seleção */}
      <div className="flex items-center gap-1.5 p-1.5 bg-zinc-950/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl border border-zinc-700/80 shadow-2xl text-white">
        
        {/* Seletor Rápido das 6 Cores de Marca-Texto */}
        <div className="flex items-center gap-1 px-1 border-r border-zinc-700/60">
          {colorsList.map((c) => {
            const config = HIGHLIGHTER_COLORS[c];
            const isCurrent = selectedHighlightColor === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => onHighlight(c, 'highlight')}
                title={`Grifar em ${config.name}`}
                className={`w-5 h-5 rounded-full transition-transform hover:scale-125 active:scale-95 flex items-center justify-center cursor-pointer shadow-xs ${
                  isCurrent ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950' : 'opacity-85 hover:opacity-100'
                }`}
                style={{ backgroundColor: config.hex }}
              >
                {isCurrent && <span className="w-1 h-1 rounded-full bg-black" />}
              </button>
            );
          })}
        </div>

        {/* Estilos: Sublinhado e Tachado / Risco */}
        <div className="flex items-center gap-0.5 px-0.5 border-r border-zinc-700/60">
          <button
            type="button"
            onClick={() => onHighlight(selectedHighlightColor, 'underline')}
            title="Sublinhar texto selecionado"
            className="p-1.5 rounded-lg text-zinc-300 hover:text-sky-300 hover:bg-zinc-800/80 transition-colors cursor-pointer"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onHighlight('yellow', 'strikethrough')}
            title="Riscar / Tachar afirmativa (eliminação)"
            className="p-1.5 rounded-lg text-zinc-300 hover:text-rose-400 hover:bg-zinc-800/80 transition-colors cursor-pointer"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
        </div>

        {/* Anotação / Comentário Clínico */}
        <button
          type="button"
          onClick={() => setIsNoteOpen((prev) => !prev)}
          title="Adicionar anotação ou comentário neste trecho"
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isNoteOpen
              ? 'bg-zinc-800 text-amber-300 ring-1 ring-amber-400/40'
              : 'text-zinc-300 hover:text-amber-300 hover:bg-zinc-800/80'
          }`}
        >
          <StickyNote className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-zinc-700/60" />

        {/* Criar Flashcard com o Texto Selecionado */}
        <div className="flex items-center gap-0.5 pl-0.5">
          {/* Botão de Criação Automática Imediata */}
          <button
            type="button"
            onClick={() => onCreateFlashcardAuto(selectedText, sentenceContext)}
            title="Criar Flashcard Automático (Cloze/Pergunta instantânea)"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Criar Flashcard</span>
          </button>

          {/* Botão de Personalizar no Drawer */}
          <button
            type="button"
            onClick={() => onOpenFlashcardDrawer(selectedText, sentenceContext)}
            title="Personalizar detalhes do flashcard no editor completo"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Fechar */}
        <button
          type="button"
          onClick={onClose}
          title="Fechar painel"
          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer ml-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Caixa Expansível de Comentário Clínico */}
      {isNoteOpen && (
        <div className="mt-2 w-80 p-3 bg-zinc-950/98 dark:bg-zinc-900/98 border border-zinc-700 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-1 text-white">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-800">
            <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5 text-amber-400" />
              Anotação Clínica no Destaque
            </span>
            <div className="flex items-center gap-1">
              {colorsList.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedHighlightColor(c)}
                  className={`w-3.5 h-3.5 rounded-full ${
                    selectedHighlightColor === c ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: HIGHLIGHTER_COLORS[c].hex }}
                  title={HIGHLIGHTER_COLORS[c].name}
                />
              ))}
            </div>
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
            placeholder="Digite sua anotação clínica... (Ctrl+Enter para salvar)"
            rows={2}
            className="w-full text-xs bg-zinc-900 dark:bg-zinc-950 text-zinc-100 rounded-xl p-2 border border-zinc-700/80 focus:border-amber-400 focus:outline-none resize-none placeholder:text-zinc-500"
            autoFocus
          />
          <div className="flex items-center justify-end gap-2 mt-2">
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
              className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-zinc-950 px-3 py-1 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Check className="w-3 h-3" />
              <span>Salvar Destaque</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
