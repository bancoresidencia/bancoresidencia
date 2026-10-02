'use client';

import React from 'react';
import { Sun, Moon, Palette, Check } from 'lucide-react';
import { useTheme, AccentColor, ACCENT_CONFIGS } from '@/context/ThemeContext';

export const ThemeSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { mode, accent, toggleMode, setAccent } = useTheme();

  const accentList: { id: AccentColor; label: string; hex: string }[] = [
    { id: 'blue', label: 'Azul', hex: ACCENT_CONFIGS.blue.primaryHex },
    { id: 'green', label: 'Verde', hex: ACCENT_CONFIGS.green.primaryHex },
    { id: 'orange', label: 'Laranja', hex: ACCENT_CONFIGS.orange.primaryHex },
    { id: 'purple', label: 'Roxo', hex: ACCENT_CONFIGS.purple.primaryHex },
    { id: 'red', label: 'Vermelho', hex: ACCENT_CONFIGS.red.primaryHex },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-2 select-none">
        {/* Alternador de Modo Claro / Escuro */}
        <button
          onClick={toggleMode}
          title={mode === 'dark' ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
          aria-label={mode === 'dark' ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
        >
          {mode === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* Seletor Rápido de 5 Cores */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {accentList.map((item) => (
            <button
              key={item.id}
              onClick={() => setAccent(item.id)}
              title={`Tema ${item.label}`}
              aria-label={`Selecionar cor ${item.label}`}
              className={`w-6 h-6 rounded-lg transition-all cursor-pointer flex items-center justify-center relative ${
                accent === item.id
                  ? 'ring-2 ring-slate-900 dark:ring-white scale-110 shadow-md'
                  : 'opacity-70 hover:opacity-100 hover:scale-105'
              }`}
              style={{ backgroundColor: item.hex }}
            >
              {accent === item.id && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
            </button>
          ))}
        </div>
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
