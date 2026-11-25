'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sun,
  Moon,
  Highlighter,
  QrCode,
  Palette
} from 'lucide-react';
import { useTheme, AccentColor, ACCENT_CONFIGS, getEffectiveAccentConfig } from '@/context/ThemeContext';
import { Logo } from '@/components/Logo';

export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
export type HighlightColor = 'yellow' | 'green' | 'pink' | 'blue' | 'orange' | 'purple';

interface SimuladoPriapismoHeaderProps {
  fontSize: FontSize;
  onChangeFontSize: (size: FontSize) => void;
  activeColor: HighlightColor;
  onSelectColor: (color: HighlightColor) => void;
  onClearHighlights: () => void;
  onOpenQrModal: () => void;
}

export const SimuladoPriapismoHeader: React.FC<SimuladoPriapismoHeaderProps> = ({
  fontSize,
  onChangeFontSize,
  activeColor,
  onSelectColor,
  onClearHighlights,
  onOpenQrModal
}) => {
  const { mode, toggleMode, accent, setAccent, accentConfig } = useTheme();
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAccentPicker, setShowAccentPicker] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const fontSizes: FontSize[] = ['xs', 'sm', 'base', 'lg', 'xl'];
  const handleIncreaseFont = () => {
    const idx = fontSizes.indexOf(fontSize);
    if (idx < fontSizes.length - 1) onChangeFontSize(fontSizes[idx + 1]);
  };
  const handleDecreaseFont = () => {
    const idx = fontSizes.indexOf(fontSize);
    if (idx > 0) onChangeFontSize(fontSizes[idx - 1]);
  };

  const colors: { id: HighlightColor; hex: string }[] = [
    { id: 'yellow', hex: '#fde047' },
    { id: 'green', hex: '#86efac' },
    { id: 'pink', hex: '#f472b6' },
    { id: 'blue', hex: '#7dd3fc' },
    { id: 'orange', hex: '#fdba74' },
    { id: 'purple', hex: '#d8b4fe' }
  ];

  const accents: AccentColor[] = ['blue', 'green', 'orange', 'purple', 'red', 'rose', 'neutral'];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b bg-white/90 dark:bg-[#090D14]/90 border-slate-200 dark:border-white/10 transition-colors">
      <div className="max-w-5xl mx-auto px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Logo Oficial Hippocampus e Título da Plataforma */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* Símbolo Canônico Hippocampus */}
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 p-1.5 transition-transform shadow-xs"
              style={{
                backgroundColor: accentConfig.selectionAccent.bgRgba,
                border: `1px solid ${accentConfig.selectionAccent.borderHex}`
              }}
            >
              <Logo
                variant="symbol"
                className="w-full h-full object-contain"
                style={{ color: accentConfig.primaryHex }}
              />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-black text-sm sm:text-base tracking-tight text-slate-900 dark:text-white leading-tight truncate">
                Hippocampus
              </span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate hidden xs:inline">
                Urologia • Urgências Penianas
              </span>
            </div>
          </div>

          <span
            className="hidden md:inline-flex px-2 py-0.5 text-[10px] font-extrabold rounded-full border tracking-wider uppercase"
            style={{
              backgroundColor: accentConfig.badgeBg,
              color: accentConfig.primaryHex,
              borderColor: accentConfig.badgeBorder
            }}
          >
            Acesso Aberto
          </span>
        </div>

        {/* Barra de Ferramentas Otimizada para Mobile e Desktop */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Cronômetro Compacto e Responsivo */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 text-[11px] sm:text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 shrink-0" />
            <span className="tabular-nums">{formatTime(seconds)}</span>
            <button
              onClick={() => setIsRunning((r) => !r)}
              className="p-0.5 sm:p-1 hover:text-white transition-colors"
              title={isRunning ? 'Pausar' : 'Iniciar'}
              aria-label={isRunning ? 'Pausar' : 'Iniciar'}
            >
              {isRunning ? <Pause className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            </button>
            <button
              onClick={() => setSeconds(0)}
              className="p-0.5 sm:p-1 hover:text-white transition-colors hidden xs:inline-flex"
              title="Reiniciar tempo"
              aria-label="Reiniciar tempo"
            >
              <RotateCcw className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>
          </div>

          {/* Ajuste de Fonte (visível a partir de telas médias) */}
          <div className="hidden sm:flex items-center border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900/90 text-xs">
            <button
              onClick={handleDecreaseFont}
              disabled={fontSize === 'xs'}
              className="px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 font-bold"
              title="Diminuir fonte"
            >
              A-
            </button>
            <button
              onClick={handleIncreaseFont}
              disabled={fontSize === 'xl'}
              className="px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 font-bold border-l border-slate-200 dark:border-white/10"
              title="Aumentar fonte"
            >
              A+
            </button>
          </div>

          {/* Marca-Texto */}
          <div className="relative">
            <button
              onClick={() => {
                setShowColorPicker((v) => !v);
                setShowAccentPicker(false);
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              title="Marca-texto"
              aria-label="Selecionar cor do marca-texto"
            >
              <Highlighter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            {showColorPicker && (
              <div className="absolute right-0 top-10 sm:top-11 p-2 rounded-xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-white/15 shadow-2xl flex items-center gap-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectColor(c.id);
                      setShowColorPicker(false);
                    }}
                    className={`w-6 h-6 rounded-full border transition-transform ${
                      activeColor === c.id ? 'scale-125 border-white ring-2 ring-white/30' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.id}
                  />
                ))}
                <button
                  onClick={() => {
                    onClearHighlights();
                    setShowColorPicker(false);
                  }}
                  className="ml-1 text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white"
                >
                  Limpar
                </button>
              </div>
            )}
          </div>

          {/* Seletor de Cores de Acento */}
          <div className="relative">
            <button
              onClick={() => {
                setShowAccentPicker((v) => !v);
                setShowColorPicker(false);
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              title="Alterar cor de destaque"
              aria-label="Alterar cor de destaque"
            >
              <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            {showAccentPicker && (
              <div className="absolute right-0 top-10 sm:top-11 p-2 rounded-xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-white/15 shadow-2xl flex items-center gap-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {accents.map((acc) => {
                  const cfg = getEffectiveAccentConfig(acc, mode);
                  return (
                    <button
                      key={acc}
                      onClick={() => {
                        setAccent(acc);
                        setShowAccentPicker(false);
                      }}
                      className={`w-6 h-6 rounded-full border transition-transform ${
                        accent === acc ? 'scale-125 border-white ring-2 ring-white/30' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: cfg.primaryHex }}
                      title={cfg.label}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Alternar Tema Escuro / Claro */}
          <button
            onClick={toggleMode}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title={mode === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
            aria-label="Alternar tema"
          >
            {mode === 'dark' ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />}
          </button>

          {/* Botão QR Code (com texto no desktop, compacto no mobile) */}
          <button
            onClick={onOpenQrModal}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-sm active:scale-95 shrink-0"
            style={{ backgroundColor: accentConfig.primaryHex }}
            title="Abrir QR Code"
            aria-label="Abrir QR Code"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">QR Code</span>
          </button>
        </div>
      </div>
    </header>
  );
};
