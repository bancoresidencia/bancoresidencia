'use client';

import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  category: string;
  items: ShortcutItem[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    category: 'Resolução de Questões',
    items: [
      {
        keys: ['1 - 5', 'A - E'],
        description: 'Selecionar alternativa correspondente'
      },
      {
        keys: ['Enter ↵'],
        description: 'Confirmar resposta (Resolver questão)'
      },
      {
        keys: ['Backspace ⌫', 'Del'],
        description: 'Riscar distrator da alternativa selecionada'
      },
      {
        keys: ['C', 'G'],
        description: 'Ver ou ocultar comentário do professor / Gabarito'
      },
      {
        keys: ['V'],
        description: 'Ver justificativa detalhada da alternativa'
      }
    ]
  },
  {
    category: 'Navegação e Sequência',
    items: [
      {
        keys: ['→', 'J'],
        description: 'Avançar para a próxima questão'
      },
      {
        keys: ['←', 'K'],
        description: 'Voltar para a questão anterior'
      },
      {
        keys: ['Q', 'P'],
        description: 'Mostrar / Ocultar sequência de questões na íntegra'
      },
      {
        keys: ['?'],
        description: 'Abrir / Fechar este guia de atalhos'
      },
      {
        keys: ['Esc'],
        description: 'Fechar modais e painéis suspensos'
      }
    ]
  },
  {
    category: 'Ferramentas de Estudo',
    items: [
      {
        keys: ['M', 'H'],
        description: 'Menu e alternância de cor do marca-texto'
      },
      {
        keys: ['+', '-'],
        description: 'Ajustar tamanho da fonte do enunciado (A+ / A-)'
      },
      {
        keys: ['B'],
        description: 'Favoritar / Salvar questão nos favoritos'
      },
      {
        keys: ['R'],
        description: 'Reportar erro ou divergência na questão'
      },
      {
        keys: ['S'],
        description: 'Salvar questão em um caderno / pasta'
      }
    ]
  }
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { accentConfig } = useTheme();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150 bg-white dark:bg-[var(--bg-card)] text-zinc-900 dark:text-zinc-100"
      >
        {/* Header - Totalmente opaco */}
        <div
          className="relative px-6 py-4.5 border-b border-zinc-100 dark:border-zinc-800/90 flex items-center justify-between bg-zinc-50 dark:bg-[var(--bg-input)]"
        >
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border"
              style={{
                backgroundColor: accentConfig.primaryHex + '25',
                borderColor: accentConfig.primaryHex + '45',
                color: accentConfig.primaryHex
              }}
            >
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black font-sans text-zinc-900 dark:text-white tracking-tight">
                  Atalhos do Teclado
                </h2>
                <span
                  className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-2xs"
                  style={{
                    backgroundColor: accentConfig.primaryHex + '20',
                    borderColor: accentConfig.primaryHex + '45',
                    color: accentConfig.primaryHex
                  }}
                >
                  Produtividade
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                Navegue e resolva questões com máxima agilidade sem precisar do mouse
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            title="Fechar (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content - Totalmente adaptável */}
        <div className="p-6 overflow-y-auto space-y-6 bg-white dark:bg-[var(--bg-card)]">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.category} className="space-y-2.5">
              <h3 className="text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-sans px-1">
                {group.category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[var(--bg-input)] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm group"
                  >
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors leading-snug">
                      {item.description}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.keys.map((k) => (
                        <kbd
                          key={k}
                          className="px-2.5 py-1 rounded-xl border border-zinc-300 dark:border-zinc-700 font-mono text-[11px] font-black text-zinc-800 dark:text-zinc-200 tracking-tight shadow-xs bg-white dark:bg-[var(--bg-card)]"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-3.5 border-t border-zinc-100 dark:border-zinc-800/90 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-[var(--bg-input)]"
        >
          <span className="flex items-center gap-1.5">
            Pressione <kbd className="px-1.5 py-0.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-mono text-[10px] font-bold bg-white dark:bg-[var(--bg-card)]">?</kbd> a qualquer momento para abrir ou fechar
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-extrabold text-xs text-white shadow-md transition-transform hover:scale-102 cursor-pointer"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};
