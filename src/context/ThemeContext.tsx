'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export type ThemeMode = 'dark' | 'light';
export type AccentColor = 'blue' | 'green' | 'orange' | 'purple' | 'red';

export interface AccentConfig {
  id: AccentColor;
  label: string;
  primaryHex: string;
  hoverHex: string;
  bgRgba: string;
  borderRgba: string;
  textClass: string;
  bgClass: string;
  ringClass: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cssVarValue: string;
}

export const ACCENT_CONFIGS: Record<AccentColor, AccentConfig> = {
  blue: {
    id: 'blue',
    label: 'Azul Clássico',
    primaryHex: '#2563eb',
    hoverHex: '#1d4ed8',
    bgRgba: 'rgba(37, 99, 235, 0.15)',
    borderRgba: 'rgba(37, 99, 235, 0.45)',
    textClass: 'text-blue-500 dark:text-blue-400',
    bgClass: 'bg-blue-600 hover:bg-blue-500 text-white',
    ringClass: 'ring-blue-500/40 border-blue-500/50',
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-600 dark:text-blue-400',
    badgeBorder: 'border-blue-500/20',
    cssVarValue: '#2563eb'
  },
  green: {
    id: 'green',
    label: 'Verde Esmeralda',
    primaryHex: '#059669',
    hoverHex: '#047857',
    bgRgba: 'rgba(5, 150, 105, 0.15)',
    borderRgba: 'rgba(5, 150, 105, 0.45)',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    ringClass: 'ring-emerald-500/40 border-emerald-500/50',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    badgeBorder: 'border-emerald-500/20',
    cssVarValue: '#059669'
  },
  orange: {
    id: 'orange',
    label: 'Laranja Radiante',
    primaryHex: '#ea580c',
    hoverHex: '#c2410c',
    bgRgba: 'rgba(234, 88, 12, 0.15)',
    borderRgba: 'rgba(234, 88, 12, 0.45)',
    textClass: 'text-orange-600 dark:text-orange-400',
    bgClass: 'bg-orange-600 hover:bg-orange-500 text-white',
    ringClass: 'ring-orange-500/40 border-orange-500/50',
    badgeBg: 'bg-orange-500/10',
    badgeText: 'text-orange-600 dark:text-orange-400',
    badgeBorder: 'border-orange-500/20',
    cssVarValue: '#ea580c'
  },
  purple: {
    id: 'purple',
    label: 'Roxo Nobre',
    primaryHex: '#7c3aed',
    hoverHex: '#6d28d9',
    bgRgba: 'rgba(124, 58, 237, 0.15)',
    borderRgba: 'rgba(124, 58, 237, 0.45)',
    textClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-600 hover:bg-purple-500 text-white',
    ringClass: 'ring-purple-500/40 border-purple-500/50',
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-600 dark:text-purple-400',
    badgeBorder: 'border-purple-500/20',
    cssVarValue: '#7c3aed'
  },
  red: {
    id: 'red',
    label: 'Vermelho Carmesim',
    primaryHex: '#dc2626',
    hoverHex: '#b91c1c',
    bgRgba: 'rgba(220, 38, 38, 0.15)',
    borderRgba: 'rgba(220, 38, 38, 0.45)',
    textClass: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-600 hover:bg-red-500 text-white',
    ringClass: 'ring-red-500/40 border-red-500/50',
    badgeBg: 'bg-red-500/10',
    badgeText: 'text-red-600 dark:text-red-400',
    badgeBorder: 'border-red-500/20',
    cssVarValue: '#dc2626'
  }
};

interface ThemeContextType {
  mode: ThemeMode;
  accent: AccentColor;
  accentConfig: AccentConfig;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [accent, setAccentState] = useState<AccentColor>('blue');
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const isInitialMount = useRef(true);

  const applyThemeToDOM = (themeMode: ThemeMode, themeAccent: AccentColor) => {
    try {
      const savedMode = localStorage.getItem('banco_theme_mode') as ThemeMode | null;
      if (savedMode === 'dark' || savedMode === 'light') {
        setModeState(savedMode);
      }
      const savedAccent = localStorage.getItem('banco_accent_color') as AccentColor | null;
      if (savedAccent && ACCENT_CONFIGS[savedAccent]) {
        setAccentState(savedAccent);
      }
    } catch {
      // ignore
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      const root = document.documentElement;
      if (themeMode === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
      const config = ACCENT_CONFIGS[themeAccent] || ACCENT_CONFIGS.blue;
      root.style.setProperty('--primary-color', config.primaryHex);
      root.style.setProperty('--primary-hover', config.hoverHex);
      root.style.setProperty('--glow-color', config.bgRgba);
      root.style.setProperty('--accent-muted', config.bgRgba);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    applyThemeToDOM(mode, accent);
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    try {
      localStorage.setItem('banco_theme_mode', mode);
      localStorage.setItem('banco_accent_color', accent);
    } catch {
      // ignore
    }
  }, [mode, accent, isMounted]);

  const toggleMode = () => {
    setModeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('banco_theme_mode', next);
      } catch {}
      applyThemeToDOM(next, accent);
      return next;
    });
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem('banco_theme_mode', newMode);
    } catch {}
    applyThemeToDOM(newMode, accent);
  };

  const setAccent = (newAccent: AccentColor) => {
    setAccentState(newAccent);
    try {
      localStorage.setItem('banco_accent_color', newAccent);
    } catch {}
    applyThemeToDOM(mode, newAccent);
  };

  const accentConfig = ACCENT_CONFIGS[accent];

  return (
    <ThemeContext.Provider
      value={{
        mode,
        accent,
        accentConfig,
        toggleMode,
        setMode,
        setAccent
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback gracioso caso chamado fora do provider
    return {
      mode: 'dark' as ThemeMode,
      accent: 'blue' as AccentColor,
      accentConfig: ACCENT_CONFIGS.blue,
      toggleMode: () => {},
      setMode: () => {},
      setAccent: () => {}
    };
  }
  return context;
};
