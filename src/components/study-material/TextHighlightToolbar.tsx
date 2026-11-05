'use client';

import React, { useState } from 'react';
import {
  Highlighter,
  Underline,
  Strikethrough,
  StickyNote,
  Trash2,
  Copy,
  Check,
  Sparkles,
  X
} from 'lucide-react';
import {
  HighlightColor,
  HighlightStyle,
  HIGHLIGHT_COLORS,
  StudyHighlight
} from '@/types/studyMaterialAnnotations';

interface TextHighlightToolbarProps {
  position: { top: number; left: number };
  selectedText: string;
  existingHighlight?: StudyHighlight | null;
  onApplyHighlight: (color: HighlightColor, style: HighlightStyle, note?: string) => void;
  onRemoveHighlight?: (id: string) => void;
  onCreateFlashcard?: (text: string) => void;
  onClose: () => void;
}

export const TextHighlightToolbar: React.FC<TextHighlightToolbarProps> = ({
  position,
  selectedText,
  existingHighlight,
  onApplyHighlight,
  onRemoveHighlight,
  onCreateFlashcard,
  onClose
}) => {
  const [selectedColor, setSelectedColor] = useState<HighlightColor>(
    existingHighlight?.color || 'yellow'
  );
  const [selectedStyle, setSelectedStyle] = useState<HighlightStyle>(
    existingHighlight?.style || 'highlight'
  );
  const [isNoteOpen, setIsNoteOpen] = useState<boolean>(Boolean(existingHighlight?.note));
  const [noteText, setNoteText] = useState<string>(existingHighlight?.note || '');
  const [copied, setCopied] = useState<boolean>(false);

  const colorsList: HighlightColor[] = ['yellow', 'green', 'red', 'blue', 'purple'];

  const handleColorClick = (color: HighlightColor) => {
    setSelectedColor(color);
    onApplyHighlight(color, selectedStyle, noteText.trim() || undefined);
  };

  const handleStyleClick = (style: HighlightStyle) => {
    const nextStyle = selectedStyle === style ? 'highlight' : style;
    setSelectedStyle(nextStyle);
    onApplyHighlight(selectedColor, nextStyle, noteText.trim() || undefined);
  };

  const handleSaveNote = () => {
    onApplyHighlight(selectedColor, selectedStyle, noteText.trim() || undefined);
    setIsNoteOpen(false);
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(selectedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback silencioso
    }
  };

  return (
    <div
      className="fixed z-50 flex flex-col items-center select-none animate-in fade-in zoom-in-95 duration-150"
      style={{
        top: `${Math.max(16, position.top - 54)}px`,
        left: `${Math.max(16, Math.min(window.innerWidth - 340, position.left))}px`
      }}
    >
      {/* Barra de Ferramentas Principal */}
      <div className="flex items-center gap-1.5 p-1.5 bg-zinc-950/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl border border-zinc-700/80 shadow-2xl text-white">
        {/* Paleta de Cores Médicas */}
        <div className="flex items-center gap-1 px-1 border-r border-zinc-700/60">
          {colorsList.map((c) => {
            const config = HIGHLIGHT_COLORS[c];
            const isSelected = selectedColor === c && (!existingHighlight || existingHighlight.color === c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => handleColorClick(c)}
                title={`${config.label} (${config.medicalMeaning})`}
                className={`w-6 h-6 rounded-full transition-all duration-150 relative flex items-center justify-center cursor-pointer hover:scale-115 active:scale-95 ${
                  config.dotClass
                } ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 shadow-sm' : 'opacity-85 hover:opacity-100'}`}
              >
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-zinc-950/80" />}
              </button>
            );
          })}
        </div>

        {/* Estilos: Sublinhado e Tachado */}
        <div className="flex items-center gap-0.5 px-1 border-r border-zinc-700/60">
          <button
            type="button"
            onClick={() => handleStyleClick('highlight')}
            title="Marca-texto padrão"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedStyle === 'highlight'
                ? 'bg-zinc-800 text-amber-400'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Highlighter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleStyleClick('underline')}
            title="Sublinhar conceito"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedStyle === 'underline'
                ? 'bg-zinc-800 text-sky-400'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleStyleClick('strikethrough')}
            title="Tachar (para conceitos falsos/pegadinhas)"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedStyle === 'strikethrough'
                ? 'bg-zinc-800 text-rose-400'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Strikethrough className="w-4 h-4" />
          </button>
        </div>

        {/* Ações Especiais de Estudo */}
        <div className="flex items-center gap-0.5 px-1">
          {/* Adicionar Anotação / Sticky Note */}
          <button
            type="button"
            onClick={() => setIsNoteOpen((prev) => !prev)}
            title="Adicionar anotação a este trecho"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer relative ${
              isNoteOpen || noteText
                ? 'bg-zinc-800 text-amber-300'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <StickyNote className="w-4 h-4" />
            {noteText && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full" />
            )}
          </button>

          {/* Criar Flashcard Cloze Instantâneo */}
          {onCreateFlashcard && (
            <button
              type="button"
              onClick={() => onCreateFlashcard(selectedText)}
              title="Gerar Flashcard Cloze deste trecho"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer border border-amber-500/30"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Criar Card</span>
            </button>
          )}

          {/* Copiar */}
          <button
            type="button"
            onClick={handleCopyText}
            title="Copiar trecho"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Remover Grifo se já existir */}
          {existingHighlight && onRemoveHighlight && (
            <button
              type="button"
              onClick={() => onRemoveHighlight(existingHighlight.id)}
              title="Remover marcação"
              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer ml-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Fechar */}
          <button
            type="button"
            onClick={onClose}
            title="Fechar barra"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Popover de Nota Rápida (Sticky Note) */}
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
            placeholder="Ex: Caiu no ENARE 2024 / Lembrar do critério B..."
            rows={2}
            className="w-full text-xs bg-zinc-900 dark:bg-zinc-950 text-zinc-100 rounded-xl p-2 border border-zinc-700/80 focus:border-amber-400 focus:outline-none resize-none placeholder:text-zinc-500"
            autoFocus
          />
          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setNoteText('');
                onApplyHighlight(selectedColor, selectedStyle, undefined);
                setIsNoteOpen(false);
              }}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 cursor-pointer px-2 py-1"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={handleSaveNote}
              className="text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-zinc-950 px-3 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Salvar Nota
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

