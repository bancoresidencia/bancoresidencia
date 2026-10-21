'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export type ThemeMode = 'dark' | 'light';
export type AccentColor = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'rose' | 'neutral';

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
  surfaceDark: string;
  cardDark: string;
  inputDark: string;
  borderDark: string;
  surfaceLight: string;
  cardLight: string;
  inputLight: string;
  borderLight: string;
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
    cssVarValue: '#2563eb',
    surfaceDark: '#090b10',
    cardDark: '#11141c',
    inputDark: '#151922',
    borderDark: '#232b3a',
    surfaceLight: '#f8faff',
    cardLight: '#ffffff',
    inputLight: '#ffffff',
    borderLight: '#e2e8f4'
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
    cssVarValue: '#059669',
    surfaceDark: '#080c0a',
    cardDark: '#101512',
    inputDark: '#141c17',
    borderDark: '#1e2e24',
    surfaceLight: '#f7fbf9',
    cardLight: '#ffffff',
    inputLight: '#ffffff',
    borderLight: '#e2ede6'
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
    cssVarValue: '#ea580c',
    surfaceDark: '#0c0a08',
    cardDark: '#151210',
    inputDark: '#1c1714',
    borderDark: '#302620',
    surfaceLight: '#fffaf7',
    cardLight: '#ffffff',
    inputLight: '#ffffff',
    borderLight: '#f0e6de'
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
    cssVarValue: '#7c3aed',
    surfaceDark: '#0b0910',
    cardDark: '#131119',
    inputDark: '#181522',
    borderDark: '#29223a',
    surfaceLight: '#fbf9ff',
    cardLight: '#ffffff',
    inputLight: '#ffffff',
    borderLight: '#e9e3f4'
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
    cssVarValue: '#dc2626',
    surfaceDark: '#0c0808',
    cardDark: '#151010',
    inputDark: '#1c1414',
    borderDark: '#302020',
    surfaceLight: '#fff9f9',
    cardLight: '#ffffff',
    inputLight: '#ffffff',
    borderLight: '#f2e2e2'
  },
  rose: {
    id: 'rose',
    label: 'Rosa',
    primaryHex: '#ec4899',
    hoverHex: '#db2777',
    bgRgba: 'rgba(236, 72, 153, 0.15)',
    borderRgba: 'rgba(236, 72, 153, 0.45)',
    textClass: 'text-pink-500 dark:text-pink-400',
    bgClass: 'bg-pink-500 hover:bg-pink-600 text-white',
    ringClass: 'ring-pink-400/40 border-pink-400/50',
    badgeBg: 'bg-pink-500/10',
    badgeText: 'text-pink-600 dark:text-pink-400',
    badgeBorder: 'border-pink-400/25',
    cssVarValue: '#ec4899',
    surfaceDark: '#0c080a',
    cardDark: '#151012',
    inputDark: '#1c1417',
    borderDark: '#302027',
    surfaceLight: '#fff8fa',
    cardLight: '#ffffff',
    inputLight: '#ffffff',
    borderLight: '#f3e1e8'
  },
  neutral: {
    id: 'neutral',
    label: 'Monocromático',
    primaryHex: '#18181b',
    hoverHex: '#27272a',
    bgRgba: 'rgba(24, 24, 27, 0.12)',
    borderRgba: 'rgba(24, 24, 27, 0.35)',
    textClass: 'text-zinc-800 dark:text-zinc-200',
    bgClass: 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900',
    ringClass: 'ring-zinc-400/40 border-zinc-500/50',
    badgeBg: 'bg-zinc-500/10 dark:bg-zinc-400/15',
    badgeText: 'text-zinc-800 dark:text-zinc-200',
    badgeBorder: 'border-zinc-400/25',
    cssVarValue: '#18181b',
    surfaceDark: '#09090b',
    cardDark: '#121215',
    inputDark: '#18181b',
    borderDark: '#27272a',
    surfaceLight: '#fafafa',
    cardLight: '#ffffff',
    inputLight: '#ffffff',
    borderLight: '#e4e4e7'
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

  useEffect(() => {
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

  const applyThemeToDOM = (themeMode: ThemeMode, themeAccent: AccentColor) => {
    try {
      const root = document.documentElement;
      const isDark = themeMode === 'dark';
      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }

      if (themeAccent === 'neutral') {
        root.classList.add('theme-monochrome');
      } else {
        root.classList.remove('theme-monochrome');
      }

      const config = ACCENT_CONFIGS[themeAccent] || ACCENT_CONFIGS.blue;
      const pageBg = isDark ? config.surfaceDark : config.surfaceLight;
      const cardBg = isDark ? config.cardDark : config.cardLight;
      const inputBg = isDark ? config.inputDark : config.inputLight;
      const cardBorder = isDark ? config.borderDark : config.borderLight;
      const primaryHex = themeAccent === 'neutral'
        ? (isDark ? '#f4f4f5' : '#18181b')
        : config.primaryHex;
      const primaryHover = themeAccent === 'neutral'
        ? (isDark ? '#ffffff' : '#27272a')
        : config.hoverHex;
      const glowRgba = themeAccent === 'neutral'
        ? (isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(24, 24, 27, 0.10)')
        : config.bgRgba;

      root.style.setProperty('--primary-color', primaryHex);
      root.style.setProperty('--primary-hover', primaryHover);
      root.style.setProperty('--glow-color', glowRgba);
      root.style.setProperty('--accent-muted', glowRgba);
      root.style.setProperty('--bg-page', pageBg);
      root.style.setProperty('--bg-card', cardBg);
      root.style.setProperty('--bg-input', inputBg);
      root.style.setProperty('--card-border', cardBorder);
      root.style.setProperty('--border-input', cardBorder);
      root.style.setProperty('--ring-focus', primaryHex);
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
