'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Palette, Check, ChevronDown } from 'lucide-react';
import { useTheme, AccentColor, ACCENT_CONFIGS } from '@/context/ThemeContext';

export const ThemeSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { mode, accent, toggleMode, setAccent } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const accentList: { id: AccentColor; label: string; hex: string }[] = [
    { id: 'blue', label: 'Azul', hex: ACCENT_CONFIGS.blue.primaryHex },
    { id: 'green', label: 'Verde', hex: ACCENT_CONFIGS.green.primaryHex },
    { id: 'orange', label: 'Laranja', hex: ACCENT_CONFIGS.orange.primaryHex },
    { id: 'purple', label: 'Roxo', hex: ACCENT_CONFIGS.purple.primaryHex },
    { id: 'red', label: 'Vermelho', hex: ACCENT_CONFIGS.red.primaryHex },
  ];

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const currentAccent = accentList.find((a) => a.id === accent) || accentList[0];

  if (compact) {
    return (
      <div ref={dropdownRef} className="relative select-none">
        {/* Botão Único Compacto de Tema (Não exibe as cores de cara; o usuário clica para expandir) */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          title="Personalizar Tema e Cores da Plataforma"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-xs hover:border-slate-300 dark:hover:border-slate-700"
        >
          <Palette className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span
            className="w-3.5 h-3.5 rounded-full shadow-xs border border-white/20 dark:border-black/20"
            style={{ backgroundColor: currentAccent.hex }}
            title={`Tema ativo: ${currentAccent.label}`}
          />
          <ChevronDown
            className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Expandido com as Opções de Modo e Cores */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 p-3 bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
            {/* Modo Claro / Escuro */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Aparência
              </span>
              <button
                type="button"
                onClick={toggleMode}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                {mode === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Escuro</span>
                  </>
                )}
              </button>
            </div>

            {/* Cores de Destaque */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                Cor de Destaque
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {accentList.map((item) => {
                  const isSelected = accent === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setAccent(item.id);
                      }}
                      title={`Cor ${item.label}`}
                      aria-label={`Selecionar cor ${item.label}`}
                      className={`h-8 rounded-xl transition-all cursor-pointer flex items-center justify-center relative ${
                        isSelected
                          ? 'ring-2 ring-slate-900 dark:ring-white scale-110 shadow-md'
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: item.hex }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Aparência
          </span>
        </div>

        {/* Botão Modo Claro / Escuro Segmentado */}
        <button
          type="button"
          onClick={toggleMode}
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl border transition-all cursor-pointer bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
        >
          {mode === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Escuro</span>
            </>
          )}
        </button>
      </div>

      <div>
        <div className="grid grid-cols-5 gap-1.5">
          {accentList.map((item) => {
            const isSelected = accent === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setAccent(item.id)}
                title={item.label}
                aria-label={`Tema ${item.label}`}
                className={`py-1.5 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  isSelected
                    ? 'border-slate-900 dark:border-white shadow-sm scale-105 bg-slate-100/80 dark:bg-white/10'
                    : 'border-slate-200 dark:border-slate-800/80 opacity-70 hover:opacity-100 hover:border-slate-300'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shadow-sm flex items-center justify-center"
                  style={{ backgroundColor: item.hex }}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                </span>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
