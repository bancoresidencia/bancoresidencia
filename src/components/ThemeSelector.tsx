'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Palette, Check, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useTheme, AccentColor, ACCENT_CONFIGS } from '@/context/ThemeContext';

export const ThemeSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { mode, accent, setMode, setAccent, isDashboardCustomizing, toggleDashboardCustomizing, canCustomizeLayout } = useTheme();
  const pathname = usePathname();
  const isAllowedRoute = pathname ? (pathname === '/dashboard' || pathname === '/desempenho') : false;
  const isCustomizationAvailable = Boolean(canCustomizeLayout && isAllowedRoute);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const accentList: { id: AccentColor; label: string; hex: string }[] = [
    { id: 'blue', label: 'Azul', hex: ACCENT_CONFIGS.blue.primaryHex },
    { id: 'green', label: 'Verde', hex: ACCENT_CONFIGS.green.primaryHex },
    { id: 'orange', label: 'Laranja', hex: ACCENT_CONFIGS.orange.primaryHex },
    { id: 'purple', label: 'Roxo', hex: ACCENT_CONFIGS.purple.primaryHex },
    { id: 'red', label: 'Vermelho', hex: ACCENT_CONFIGS.red.primaryHex },
    { id: 'rose', label: 'Rosa', hex: ACCENT_CONFIGS.rose.primaryHex },
    { id: 'neutral', label: 'Monocromático', hex: mode === 'dark' ? '#ffffff' : ACCENT_CONFIGS.neutral.primaryHex },
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
        {/* Botão Único Compacto de Tema */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          title="Personalizar Tema e Cores da Plataforma"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[var(--bg-card,#ffffff)] dark:bg-[var(--card,#121215)] border border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700"
        >
          <Palette className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
          <span
            className="w-3.5 h-3.5 rounded-full shadow-xs border border-white/20 dark:border-black/20"
            style={{ backgroundColor: currentAccent.hex }}
            title={`Tema ativo: ${currentAccent.label}`}
          />
          <ChevronDown
            className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Expandido com as Opções de Modo, Cores e Personalizar Layout */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-68 p-3.5 bg-[var(--bg-card,#ffffff)] dark:bg-[var(--card,#121215)] border border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)] rounded-2xl shadow-xl z-50 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modo Claro / Escuro (Segmented Control sem ambiguidade) */}
            <div className="space-y-2 pb-3 border-b border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)]/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Aparência
              </span>
              <div
                role="group"
                aria-label="Selecionar aparência clara ou escura"
                className="relative grid grid-cols-2 p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-lg bg-white dark:bg-zinc-800 shadow-xs border border-zinc-200/70 dark:border-zinc-700/70 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    mode === 'dark' ? 'translate-x-full' : 'translate-x-0'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setMode('light')}
                  aria-pressed={mode === 'light'}
                  className={`relative z-10 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    mode === 'light'
                      ? 'text-zinc-900'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Claro</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('dark')}
                  aria-pressed={mode === 'dark'}
                  className={`relative z-10 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    mode === 'dark'
                      ? 'text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>Escuro</span>
                </button>
              </div>
            </div>

            {/* Cores de Destaque */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2">
                Cor de Destaque
              </span>
              <div className="grid grid-cols-7 gap-1.5">
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
                      className={`h-7 rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-center relative active:scale-95 ${
                        isSelected
                          ? 'ring-2 ring-zinc-900 dark:ring-white ring-offset-1 ring-offset-white dark:ring-offset-[#121215] scale-105 shadow-xs'
                          : 'opacity-80 hover:opacity-100 hover:scale-105 border border-black/5 dark:border-white/10'
                      }`}
                      style={{ backgroundColor: item.hex }}
                    >
                      {isSelected && <Check className={`w-3 h-3 stroke-[3] ${item.id === 'neutral' && mode === 'dark' ? 'text-zinc-950' : 'text-white'}`} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personalizar Layout do Dashboard */}
            {isCustomizationAvailable && (
              <div className="pt-2.5 border-t border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)]/80">
                <button
                  type="button"
                  onClick={() => {
                    toggleDashboardCustomizing();
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isDashboardCustomizing
                      ? 'bg-[var(--primary-color,#2563eb)] text-[var(--primary-contrast,#ffffff)] shadow-md'
                      : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:text-[var(--primary-color,#2563eb)] dark:hover:text-[var(--primary-color,#2563eb)] hover:border-[var(--primary-color,#2563eb)]/50'
                  }`}
                  title="Personalizar layout e posição dos cards estilo Figma"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--primary-color,#2563eb)]" />
                    <span>Personalizar Layout</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                    isDashboardCustomizing ? 'bg-white/20 text-white font-bold' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                  }`}>
                    {isDashboardCustomizing ? 'Ativo' : 'Editar'}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
            Aparência
          </span>
        </div>

        {/* Botão Modo Claro / Escuro Segmentado */}
        <div
          role="group"
          aria-label="Selecionar aparência clara ou escura"
          className="inline-flex items-center p-0.5 rounded-xl border bg-zinc-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
        >
          <button
            type="button"
            onClick={() => setMode('light')}
            aria-pressed={mode === 'light'}
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              mode === 'light'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Claro</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('dark')}
            aria-pressed={mode === 'dark'}
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              mode === 'dark'
                ? 'bg-zinc-800 text-zinc-100 shadow-2xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>Escuro</span>
          </button>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-7 gap-1.5">
          {accentList.map((item) => {
            const isSelected = accent === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setAccent(item.id)}
                title={item.label}
                aria-label={`Tema ${item.label}`}
                className={`py-1.5 px-0.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  isSelected
                    ? 'border-slate-900 dark:border-white shadow-sm scale-105 bg-slate-100/80 dark:bg-white/10'
                    : 'border-slate-200 dark:border-zinc-800/80 opacity-70 hover:opacity-100 hover:border-slate-300'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shadow-sm flex items-center justify-center"
                  style={{ backgroundColor: item.hex }}
                >
                  {isSelected && <Check className={`w-2.5 h-2.5 stroke-[3] ${item.id === 'neutral' && mode === 'dark' ? 'text-zinc-950' : 'text-white'}`} />}
                </span>
                <span className="text-[9px] font-bold text-slate-700 dark:text-zinc-300 truncate w-full text-center">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Personalizar Layout do Dashboard (Modo Expandido) */}
      {isCustomizationAvailable && (
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={toggleDashboardCustomizing}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDashboardCustomizing
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
              <span>Personalizar Layout</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
              isDashboardCustomizing ? 'bg-white/20 text-white font-bold' : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
            }`}>
              {isDashboardCustomizing ? 'Ativo' : 'Editar'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
