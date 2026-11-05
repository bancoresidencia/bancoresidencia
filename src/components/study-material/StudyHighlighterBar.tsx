'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Highlighter,
  Underline,
  Strikethrough,
  ChevronDown,
  Check,
  Eraser
} from 'lucide-react';
import {
  HighlighterColor,
  HighlightStyle,
  HIGHLIGHTER_COLORS
} from '@/types/studyMaterialAnnotations';

interface StudyHighlighterBarProps {
  isHighlighterActive: boolean;
  onToggleHighlighter: () => void;
  activeColor: HighlighterColor;
  onSelectColor: (color: HighlighterColor) => void;
  activeStyle: HighlightStyle;
  onSelectStyle: (style: HighlightStyle) => void;
  highlightsCount: number;
  onClearAllHighlights?: () => void;
}

export const StudyHighlighterBar: React.FC<StudyHighlighterBarProps> = ({
  isHighlighterActive,
  onToggleHighlighter,
  activeColor,
  onSelectColor,
  activeStyle,
  onSelectStyle,
  highlightsCount,
  onClearAllHighlights
}) => {
  const [isColorMenuOpen, setIsColorMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const colorsList: HighlighterColor[] = ['yellow', 'green', 'pink', 'blue', 'orange', 'purple'];

  // Fecha menu de cores ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsColorMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs select-none">
      {/* Botão de Ligar/Desligar Modo Marca-Texto Rápido */}
      <button
        type="button"
        onClick={onToggleHighlighter}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          isHighlighterActive
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
        }`}
        title={isHighlighterActive ? 'Modo Marca-texto Ativo (basta selecionar no texto para grifar na hora)' : 'Clique para ativar o marca-texto'}
      >
        <Highlighter className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Marca-texto</span>
        {isHighlighterActive && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        )}
      </button>

      {/* Seletor da Cor Ativa com Pílula Expansível de 6 Cores */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsColorMenuOpen((prev) => !prev)}
          className="flex items-center gap-1 p-1 rounded-xl hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
          title={`Cor ativa: ${HIGHLIGHTER_COLORS[activeColor].name} (clique para trocar)`}
        >
          <span
            className="w-5 h-5 rounded-full shadow-xs border border-black/10 flex items-center justify-center transition-transform hover:scale-110"
            style={{ backgroundColor: HIGHLIGHTER_COLORS[activeColor].hex }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-black/40" />
          </span>
          <ChevronDown className="w-3 h-3 text-zinc-500" />
        </button>

        {/* Pílula das 6 Cores Idêntica à Resolução de Provas */}
        {isColorMenuOpen && (
          <div className="absolute top-full left-0 mt-2 p-1.5 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-2xl flex items-center gap-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            {colorsList.map((c) => {
              const config = HIGHLIGHTER_COLORS[c];
              const isSelected = activeColor === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    onSelectColor(c);
                    setIsColorMenuOpen(false);
                  }}
                  title={config.name}
                  className={`w-7 h-7 rounded-full transition-transform hover:scale-115 active:scale-95 flex items-center justify-center cursor-pointer shadow-xs ${
                    isSelected
                      ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900'
                      : 'opacity-85 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: config.hex }}
                >
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700" />

      {/* Botão Sublinhado (U) */}
      <button
        type="button"
        onClick={() => onSelectStyle(activeStyle === 'underline' ? 'highlight' : 'underline')}
        className={`p-1.5 rounded-xl transition-all cursor-pointer ${
          activeStyle === 'underline'
            ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
        }`}
        title="Modo Sublinhado (U)"
      >
        <Underline className="w-3.5 h-3.5" />
      </button>

      {/* Botão Tachado / Risco (S) */}
      <button
        type="button"
        onClick={() => onSelectStyle(activeStyle === 'strikethrough' ? 'highlight' : 'strikethrough')}
        className={`p-1.5 rounded-xl transition-all cursor-pointer ${
          activeStyle === 'strikethrough'
            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
        }`}
        title="Modo Tachado / Risco de Eliminação (S)"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </button>

      {/* Borracha / Limpar Todos */}
      {highlightsCount > 0 && onClearAllHighlights && (
        <>
          <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700" />
          <button
            type="button"
            onClick={onClearAllHighlights}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title={`Limpar todos os ${highlightsCount} destaques deste resumo`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Limpar ({highlightsCount})</span>
          </button>
        </>
      )}
    </div>
  );
};

