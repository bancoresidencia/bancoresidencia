'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Highlighter,
  StickyNote,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Download,
  Filter,
  Sparkles
} from 'lucide-react';
import {
  StudyHighlight,
  HighlightColor,
  HIGHLIGHT_COLORS
} from '@/types/studyMaterialAnnotations';

interface StudyHighlightsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  highlights: StudyHighlight[];
  materialTitle: string;
  onRemoveHighlight: (id: string) => void;
  onUpdateNote: (id: string, note?: string) => void;
  onNavigateToHighlight: (textQuote: string) => void;
  onCreateFlashcardFromHighlight?: (text: string) => void;
}

export const StudyHighlightsDrawer: React.FC<StudyHighlightsDrawerProps> = ({
  isOpen,
  onClose,
  highlights,
  materialTitle,
  onRemoveHighlight,
  onUpdateNote,
  onNavigateToHighlight,
  onCreateFlashcardFromHighlight
}) => {
  const [selectedFilter, setSelectedFilter] = useState<HighlightColor | 'all'>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState<string>('');
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  const filteredHighlights = useMemo(() => {
    if (selectedFilter === 'all') return highlights;
    return highlights.filter((h) => h.color === selectedFilter);
  }, [highlights, selectedFilter]);

  const colorCounts = useMemo(() => {
    const counts: Record<string, number> = { all: highlights.length };
    highlights.forEach((h) => {
      counts[h.color] = (counts[h.color] || 0) + 1;
    });
    return counts;
  }, [highlights]);

  const handleStartEditNote = (highlight: StudyHighlight) => {
    setEditingNoteId(highlight.id);
    setTempNote(highlight.note || '');
  };

  const handleSaveNote = (highlightId: string) => {
    onUpdateNote(highlightId, tempNote.trim() || undefined);
    setEditingNoteId(null);
  };

  const handleExportText = async () => {
    if (highlights.length === 0) return;
    const lines = [
      `# Destaques e Anotações - ${materialTitle}`,
      `Exportado do Banco Residência em ${new Date().toLocaleDateString('pt-BR')}\n`
    ];

    highlights.forEach((h, idx) => {
      const config = HIGHLIGHT_COLORS[h.color];
      lines.push(`### ${idx + 1}. [${config.label}] "${h.textQuote}"`);
      if (h.note) {
        lines.push(`> 📝 Nota: ${h.note}`);
      }
      lines.push('');
    });

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // fallback
    }
  };

  if (!isOpen) return null;

  const colorOptions: Array<HighlightColor | 'all'> = ['all', 'yellow', 'green', 'red', 'blue', 'purple'];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Gaveta Retrátil */}
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200">
        {/* Cabeçalho da Gaveta */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Highlighter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-black text-sm text-zinc-900 dark:text-zinc-100">
                Caderno de Destaques
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {highlights.length} {highlights.length === 1 ? 'marcação salva' : 'marcações salvas'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {highlights.length > 0 && (
              <button
                type="button"
                onClick={handleExportText}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Copiar todos os grifos e notas para a área de transferência"
              >
                {copiedAll ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Filtros por Categoria de Cor */}
        <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/40">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {colorOptions.map((opt) => {
              const count = colorCounts[opt] || 0;
              const isSelected = selectedFilter === opt;
              if (opt === 'all') {
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                    }`}
                  >
                    Todos ({count})
                  </button>
                );
              }

              const config = HIGHLIGHT_COLORS[opt];
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedFilter(opt)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
                  <span>{config.label}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de Destaques e Anotações */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredHighlights.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-zinc-400 dark:text-zinc-500">
              <Highlighter className="w-8 h-8 stroke-1 mb-2 opacity-50" />
              <p className="text-xs font-semibold">Nenhum grifo nesta categoria</p>
              <p className="text-[11px] mt-1 max-w-[220px]">
                Selecione qualquer trecho no texto do resumo para grifar e adicionar notas de estudo.
              </p>
            </div>
          ) : (
            filteredHighlights.map((hl) => {
              const config = HIGHLIGHT_COLORS[hl.color];
              const isEditing = editingNoteId === hl.id;

              return (
                <div
                  key={hl.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs space-y-2.5 group transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
                >
                  {/* Cabeçalho do Card */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                      <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
                      <span className={config.textClass}>{config.label}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      {onCreateFlashcardFromHighlight && (
                        <button
                          type="button"
                          onClick={() => onCreateFlashcardFromHighlight(hl.textQuote)}
                          title="Criar Flashcard deste grifo"
                          className="p-1 rounded-md text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onNavigateToHighlight(hl.textQuote)}
                        title="Localizar no texto"
                        className="p-1 rounded-md text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveHighlight(hl.id)}
                        title="Excluir grifo"
                        className="p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Trecho Marcado */}
                  <div
                    onClick={() => onNavigateToHighlight(hl.textQuote)}
                    className={`p-2.5 rounded-xl text-xs leading-relaxed cursor-pointer transition-opacity hover:opacity-90 ${config.bgClass} ${
                      hl.style === 'underline' ? 'underline decoration-2' : ''
                    } ${hl.style === 'strikethrough' ? 'line-through' : ''}`}
                  >
                    "{hl.textQuote}"
                  </div>

                  {/* Anotação Pessoal */}
                  {isEditing ? (
                    <div className="pt-1 space-y-1.5 animate-in fade-in">
                      <textarea
                        value={tempNote}
                        onChange={(e) => setTempNote(e.target.value)}
                        placeholder="Digite sua nota clínica..."
                        rows={2}
                        className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-xl p-2 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-amber-400 resize-none"
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingNoteId(null)}
                          className="px-2 py-1 text-[11px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveNote(hl.id)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 text-zinc-950 rounded-lg hover:bg-amber-600 transition-colors cursor-pointer"
                        >
                          Salvar
                        </button>
                      </div>
                    </div>
                  ) : hl.note ? (
                    <div
                      onClick={() => handleStartEditNote(hl)}
                      className="flex items-start gap-2 p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs text-amber-900 dark:text-amber-200 cursor-pointer hover:border-amber-400 transition-colors"
                      title="Clique para editar nota"
                    >
                      <StickyNote className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed flex-1 text-[11px]">{hl.note}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartEditNote(hl)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-amber-500 transition-colors cursor-pointer"
                    >
                      <StickyNote className="w-3 h-3" />
                      <span>Adicionar nota</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé da Gaveta */}
        {highlights.length > 0 && (
          <div className="p-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Dica: clique em qualquer grifo para navegar até o trecho.
            </span>
            <button
              type="button"
              onClick={handleExportText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'Copiado!' : 'Copiar Todos'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

