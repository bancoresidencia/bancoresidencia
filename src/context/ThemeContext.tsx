'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { updateFavicon } from '@/utils/favicon';
import { createClient } from '@/lib/supabase/client';

export type ThemeMode = 'dark' | 'light';
export type AccentColor = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'rose' | 'neutral';

export interface AccentSemanticToken {
  hex: string;
  bgRgba: string;
  borderRgba: string;
  textClass: string;
}

export interface AccentConfig {
  id: AccentColor;
  label: string;
  primaryHex: string;
  hoverHex: string;
  primaryContrastHex: string;
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
  // Tokens Semânticos Harmônicos
  timeAccent: AccentSemanticToken;
  accuracyAccent: AccentSemanticToken;
  energyAccent: AccentSemanticToken;
  selectionAccent: {
    hex: string;
    borderHex: string;
    bgRgba: string;
  };
  chartPalette: string[];
}

export const ACCENT_CONFIGS: Record<AccentColor, AccentConfig> = {
  blue: {
    id: 'blue',
    label: 'Azul Imperial',
    primaryHex: '#1d4ed8',
    hoverHex: '#1e40af',
    primaryContrastHex: '#ffffff',
    bgRgba: 'rgba(29, 78, 216, 0.10)',
    borderRgba: 'rgba(29, 78, 216, 0.35)',
    textClass: 'text-blue-700 dark:text-blue-400',
    bgClass: 'bg-blue-700 hover:bg-blue-800 text-white',
    ringClass: 'ring-blue-600/40 border-blue-600/50',
    badgeBg: 'bg-blue-600/10',
    badgeText: 'text-blue-700 dark:text-blue-400',
    badgeBorder: 'border-blue-600/20',
    cssVarValue: '#1d4ed8',
    surfaceDark: '#09090b',
    cardDark: '#121215',
    inputDark: '#18181b',
    borderDark: '#27272a',
    surfaceLight: '#f1f5f9',
    cardLight: '#ffffff',
    inputLight: '#f8fafc',
    borderLight: '#e2e8f0',
    timeAccent: {
      hex: '#0ea5e9',
      bgRgba: 'rgba(14, 165, 233, 0.14)',
      borderRgba: 'rgba(14, 165, 233, 0.35)',
      textClass: 'text-sky-500 dark:text-sky-400'
    },
    accuracyAccent: {
      hex: '#14b8a6',
      bgRgba: 'rgba(20, 184, 166, 0.14)',
      borderRgba: 'rgba(20, 184, 166, 0.35)',
      textClass: 'text-teal-600 dark:text-teal-400'
    },
    energyAccent: {
      hex: '#f59e0b',
      bgRgba: 'rgba(245, 158, 11, 0.14)',
      borderRgba: 'rgba(245, 158, 11, 0.35)',
      textClass: 'text-amber-500 dark:text-amber-400'
    },
    selectionAccent: {
      hex: '#1d4ed8',
      borderHex: '#2563eb',
      bgRgba: 'rgba(29, 78, 216, 0.12)'
    },
    chartPalette: ['#1d4ed8', '#2563eb', '#38bdf8', '#14b8a6', '#f59e0b', '#ec4899']
  },
  green: {
    id: 'green',
    label: 'Verde Esmeralda',
    primaryHex: '#047857',
    hoverHex: '#065f46',
    primaryContrastHex: '#ffffff',
    bgRgba: 'rgba(4, 120, 87, 0.10)',
    borderRgba: 'rgba(4, 120, 87, 0.35)',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    bgClass: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    ringClass: 'ring-emerald-500/40 border-emerald-500/50',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    badgeBorder: 'border-emerald-500/20',
    cssVarValue: '#047857',
    surfaceDark: '#09090b',
    cardDark: '#121215',
    inputDark: '#18181b',
    borderDark: '#27272a',
    surfaceLight: '#f2f7f4',
    cardLight: '#ffffff',
    inputLight: '#f7fbf9',
    borderLight: '#dfe8e3',
    timeAccent: {
      hex: '#2dd4bf',
      bgRgba: 'rgba(45, 212, 191, 0.14)',
      borderRgba: 'rgba(45, 212, 191, 0.35)',
      textClass: 'text-teal-500 dark:text-teal-400'
    },
    accuracyAccent: {
      hex: '#84cc16',
      bgRgba: 'rgba(132, 204, 22, 0.14)',
      borderRgba: 'rgba(132, 204, 22, 0.35)',
      textClass: 'text-lime-600 dark:text-lime-400'
    },
    energyAccent: {
      hex: '#d97706',
      bgRgba: 'rgba(217, 119, 6, 0.14)',
      borderRgba: 'rgba(217, 119, 6, 0.35)',
      textClass: 'text-amber-600 dark:text-amber-400'
    },
    selectionAccent: {
      hex: '#047857',
      borderHex: '#059669',
      bgRgba: 'rgba(4, 120, 87, 0.12)'
    },
    chartPalette: ['#047857', '#059669', '#10b981', '#2dd4bf', '#84cc16', '#d97706']
  },
  orange: {
    id: 'orange',
    label: 'Laranja Tangerina',
    primaryHex: '#c2410c',
    hoverHex: '#9a3412',
    primaryContrastHex: '#ffffff',
    bgRgba: 'rgba(194, 65, 12, 0.10)',
    borderRgba: 'rgba(194, 65, 12, 0.35)',
    textClass: 'text-orange-700 dark:text-orange-400',
    bgClass: 'bg-orange-700 hover:bg-orange-800 text-white',
    ringClass: 'ring-orange-500/40 border-orange-500/50',
    badgeBg: 'bg-orange-500/10',
    badgeText: 'text-orange-700 dark:text-orange-400',
    badgeBorder: 'border-orange-500/20',
    cssVarValue: '#c2410c',
    surfaceDark: '#09090b',
    cardDark: '#121215',
    inputDark: '#18181b',
    borderDark: '#27272a',
    surfaceLight: '#f9f4f0',
    cardLight: '#ffffff',
    inputLight: '#fdf9f6',
    borderLight: '#ebe2dc',
    timeAccent: {
      hex: '#fbbf24',
      bgRgba: 'rgba(251, 191, 36, 0.14)',
      borderRgba: 'rgba(251, 191, 36, 0.35)',
      textClass: 'text-amber-500 dark:text-amber-400'
    },
    accuracyAccent: {
      hex: '#10b981',
      bgRgba: 'rgba(16, 185, 129, 0.14)',
      borderRgba: 'rgba(16, 185, 129, 0.35)',
      textClass: 'text-emerald-600 dark:text-emerald-400'
    },
    energyAccent: {
      hex: '#f97316',
      bgRgba: 'rgba(249, 115, 22, 0.14)',
      borderRgba: 'rgba(249, 115, 22, 0.35)',
      textClass: 'text-orange-500 dark:text-orange-400'
    },
    selectionAccent: {
      hex: '#c2410c',
      borderHex: '#ea580c',
      bgRgba: 'rgba(194, 65, 12, 0.12)'
    },
    chartPalette: ['#c2410c', '#ea580c', '#f97316', '#fbbf24', '#10b981', '#78716c']
  },
  purple: {
    id: 'purple',
    label: 'Roxo Nobre',
    primaryHex: '#6d28d9',
    hoverHex: '#5b21b6',
    primaryContrastHex: '#ffffff',
    bgRgba: 'rgba(109, 40, 217, 0.10)',
    borderRgba: 'rgba(109, 40, 217, 0.35)',
    textClass: 'text-purple-700 dark:text-purple-400',
    bgClass: 'bg-purple-700 hover:bg-purple-800 text-white',
    ringClass: 'ring-purple-600/40 border-purple-600/50',
    badgeBg: 'bg-purple-600/10',
    badgeText: 'text-purple-700 dark:text-purple-400',
    badgeBorder: 'border-purple-600/20',
    cssVarValue: '#6d28d9',
    surfaceDark: '#09090b',
    cardDark: '#121215',
    inputDark: '#18181b',
    borderDark: '#27272a',
    surfaceLight: '#f5f3fa',
    cardLight: '#ffffff',
    inputLight: '#faf8fd',
    borderLight: '#e6e1f0',
    timeAccent: {
      hex: '#a78bfa',
      bgRgba: 'rgba(167, 139, 250, 0.14)',
      borderRgba: 'rgba(167, 139, 250, 0.35)',
      textClass: 'text-purple-400 dark:text-purple-300'
    },
    accuracyAccent: {
      hex: '#2dd4bf',
      bgRgba: 'rgba(45, 212, 191, 0.14)',
      borderRgba: 'rgba(45, 212, 191, 0.35)',
      textClass: 'text-teal-400 dark:text-teal-300'
    },
    energyAccent: {
      hex: '#fb923c',
      bgRgba: 'rgba(251, 146, 60, 0.14)',
      borderRgba: 'rgba(251, 146, 60, 0.35)',
      textClass: 'text-orange-400 dark:text-orange-300'
    },
    selectionAccent: {
      hex: '#6d28d9',
      borderHex: '#7c3aed',
      bgRgba: 'rgba(109, 40, 217, 0.12)'
    },
    chartPalette: ['#6d28d9', '#7c3aed', '#a78bfa', '#2dd4bf', '#c084fc', '#fb923c']
  },
  red: {
    id: 'red',
    label: 'Vermelho Carmesim',
    primaryHex: '#b91c1c',
    hoverHex: '#991b1b',
    primaryContrastHex: '#ffffff',
    bgRgba: 'rgba(185, 28, 28, 0.10)',
    borderRgba: 'rgba(185, 28, 28, 0.35)',
    textClass: 'text-red-700 dark:text-red-400',
    bgClass: 'bg-red-700 hover:bg-red-800 text-white',
    ringClass: 'ring-red-600/40 border-red-600/50',
    badgeBg: 'bg-red-600/10',
    badgeText: 'text-red-700 dark:text-red-400',
    badgeBorder: 'border-red-600/20',
    cssVarValue: '#b91c1c',
    surfaceDark: '#09090b',
    cardDark: '#121215',
    inputDark: '#18181b',
    borderDark: '#27272a',
    surfaceLight: '#faf2f2',
    cardLight: '#ffffff',
    inputLight: '#fdf8f8',
    borderLight: '#ecdede',
    timeAccent: {
      hex: '#94a3b8',
      bgRgba: 'rgba(148, 163, 184, 0.14)',
      borderRgba: 'rgba(148, 163, 184, 0.35)',
      textClass: 'text-slate-400 dark:text-slate-300'
    },
    accuracyAccent: {
      hex: '#34d399',
      bgRgba: 'rgba(52, 211, 153, 0.14)',
      borderRgba: 'rgba(52, 211, 153, 0.35)',
      textClass: 'text-emerald-500 dark:text-emerald-400'
    },
    energyAccent: {
      hex: '#fb923c',
      bgRgba: 'rgba(251, 146, 60, 0.14)',
      borderRgba: 'rgba(251, 146, 60, 0.35)',
      textClass: 'text-amber-500 dark:text-amber-400'
    },
    selectionAccent: {
      hex: '#b91c1c',
      borderHex: '#dc2626',
      bgRgba: 'rgba(185, 28, 28, 0.12)'
    },
    chartPalette: ['#991b1c', '#b91c1c', '#dc2626', '#f59e0b', '#7f1d1d', '#d97706']
  },
  rose: {
    id: 'rose',
    label: 'Rosa Magenta',
    primaryHex: '#be123c',
    hoverHex: '#9f1239',
    primaryContrastHex: '#ffffff',
    bgRgba: 'rgba(190, 18, 60, 0.10)',
    borderRgba: 'rgba(190, 18, 60, 0.35)',
    textClass: 'text-rose-700 dark:text-rose-400',
    bgClass: 'bg-rose-700 hover:bg-rose-800 text-white',
    ringClass: 'ring-rose-500/40 border-rose-500/50',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-700 dark:text-rose-400',
    badgeBorder: 'border-rose-500/25',
    cssVarValue: '#be123c',
    surfaceDark: '#09090b',
    cardDark: '#121215',
    inputDark: '#18181b',
    borderDark: '#27272a',
    surfaceLight: '#faf2f5',
    cardLight: '#ffffff',
    inputLight: '#fdf8fa',
    borderLight: '#ecdfe4',
    timeAccent: {
      hex: '#c084fc',
      bgRgba: 'rgba(192, 132, 252, 0.12)',
      borderRgba: 'rgba(192, 132, 252, 0.35)',
      textClass: 'text-purple-400 dark:text-purple-300'
    },
    accuracyAccent: {
      hex: '#2dd4bf',
      bgRgba: 'rgba(45, 212, 191, 0.12)',
      borderRgba: 'rgba(45, 212, 191, 0.35)',
      textClass: 'text-teal-400 dark:text-teal-300'
    },
    energyAccent: {
      hex: '#fb923c',
      bgRgba: 'rgba(251, 146, 60, 0.12)',
      borderRgba: 'rgba(251, 146, 60, 0.35)',
      textClass: 'text-orange-400 dark:text-orange-300'
    },
    selectionAccent: {
      hex: '#be123c',
      borderHex: '#e11d48',
      bgRgba: 'rgba(190, 18, 60, 0.12)'
    },
    chartPalette: ['#be123c', '#e11d48', '#f43f5e', '#c084fc', '#2dd4bf', '#fb923c']
  },
  neutral: {
    id: 'neutral',
    label: 'Monocromático',
    primaryHex: '#18181b',
    hoverHex: '#27272a',
    primaryContrastHex: '#ffffff',
    bgRgba: 'rgba(24, 24, 27, 0.08)',
    borderRgba: 'rgba(24, 24, 27, 0.30)',
    textClass: 'text-zinc-800 dark:text-zinc-200',
    bgClass: 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950',
    ringClass: 'ring-zinc-400/40 border-zinc-500/50',
    badgeBg: 'bg-zinc-500/10 dark:bg-zinc-400/15',
    badgeText: 'text-zinc-800 dark:text-zinc-200',
    badgeBorder: 'border-zinc-400/25',
    cssVarValue: '#18181b',
    surfaceDark: '#09090b',
    cardDark: '#121215',
    inputDark: '#18181b',
    borderDark: '#27272a',
    surfaceLight: '#f4f4f5',
    cardLight: '#ffffff',
    inputLight: '#fafafa',
    borderLight: '#e4e4e7',
    timeAccent: {
      hex: '#a1a1aa',
      bgRgba: 'rgba(161, 161, 170, 0.12)',
      borderRgba: 'rgba(161, 161, 170, 0.30)',
      textClass: 'text-zinc-400 dark:text-zinc-300'
    },
    accuracyAccent: {
      hex: '#f4f4f5',
      bgRgba: 'rgba(244, 244, 245, 0.12)',
      borderRgba: 'rgba(244, 244, 245, 0.30)',
      textClass: 'text-zinc-100 dark:text-white'
    },
    energyAccent: {
      hex: '#eab308',
      bgRgba: 'rgba(234, 179, 8, 0.12)',
      borderRgba: 'rgba(234, 179, 8, 0.30)',
      textClass: 'text-amber-400/90 dark:text-amber-300/90'
    },
    selectionAccent: {
      hex: '#52525b',
      borderHex: '#71717a',
      bgRgba: 'rgba(255, 255, 255, 0.08)'
    },
    chartPalette: ['#f4f4f5', '#d4d4d8', '#a1a1aa', '#71717a', '#52525b', '#3f3f46']
  }
};

interface ThemeContextType {
  mode: ThemeMode;
  accent: AccentColor;
  accentConfig: AccentConfig;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  isDashboardCustomizing: boolean;
  setIsDashboardCustomizing: React.Dispatch<React.SetStateAction<boolean>>;
  toggleDashboardCustomizing: () => void;
  canCustomizeLayout: boolean;
  setCanCustomizeLayout: React.Dispatch<React.SetStateAction<boolean>>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DARK_ACCENT_OVERRIDES: Partial<
  Record<AccentColor, Pick<AccentConfig, 'primaryHex' | 'hoverHex' | 'primaryContrastHex' | 'bgRgba' | 'borderRgba' | 'cssVarValue'>>
> = {
  blue: {
    primaryHex: '#2563eb',
    hoverHex: '#3b82f6',
    primaryContrastHex: '#ffffff',
    bgRgba: 'rgba(37, 99, 235, 0.15)',
    borderRgba: 'rgba(37, 99, 235, 0.45)',
    cssVarValue: '#2563eb'
  },
  green: {
    primaryHex: '#059669',
    hoverHex: '#10b981',
    primaryContrastHex: '#ffffff',
    bgRgba: 'rgba(5, 150, 105, 0.15)',
    borderRgba: 'rgba(5, 150, 105, 0.45)',
    cssVarValue: '#059669'
  },
  orange: {
    primaryHex: '#ea580c',
    hoverHex: '#f97316',
    primaryContrastHex: '#ffffff',
    bgRgba: 'rgba(234, 88, 12, 0.15)',
    borderRgba: 'rgba(234, 88, 12, 0.45)',
    cssVarValue: '#ea580c'
  },
  purple: {
    primaryHex: '#7c3aed',
    hoverHex: '#8b5cf6',
    primaryContrastHex: '#ffffff',
    bgRgba: 'rgba(124, 58, 237, 0.15)',
    borderRgba: 'rgba(124, 58, 237, 0.45)',
    cssVarValue: '#7c3aed'
  },
  red: {
    primaryHex: '#dc2626',
    hoverHex: '#ef4444',
    primaryContrastHex: '#ffffff',
    bgRgba: 'rgba(220, 38, 38, 0.15)',
    borderRgba: 'rgba(220, 38, 38, 0.45)',
    cssVarValue: '#dc2626'
  },
  rose: {
    primaryHex: '#e11d48',
    hoverHex: '#f43f5e',
    primaryContrastHex: '#ffffff',
    bgRgba: 'rgba(225, 29, 72, 0.15)',
    borderRgba: 'rgba(225, 29, 72, 0.45)',
    cssVarValue: '#e11d48'
  }
};

export function getEffectiveAccentConfig(accent: AccentColor, mode: ThemeMode): AccentConfig {
  const base = ACCENT_CONFIGS[accent] || ACCENT_CONFIGS.blue;
  if (mode === 'dark') {
    if (accent === 'neutral') {
      return {
        ...base,
        primaryHex: '#fafafa',
        hoverHex: '#e4e4e7',
        primaryContrastHex: '#09090b',
        bgRgba: 'rgba(255, 255, 255, 0.12)',
        borderRgba: 'rgba(255, 255, 255, 0.35)',
        textClass: 'text-white',
        bgClass: 'bg-zinc-50 hover:bg-zinc-200 text-zinc-950',
        ringClass: 'ring-white/40 border-white/50',
        badgeBg: 'bg-white/10',
        badgeText: 'text-white',
        badgeBorder: 'border-white/20',
        cssVarValue: '#fafafa',
        timeAccent: {
          hex: '#e4e4e7',
          bgRgba: 'rgba(255, 255, 255, 0.12)',
          borderRgba: 'rgba(255, 255, 255, 0.35)',
          textClass: 'text-white'
        },
        accuracyAccent: {
          hex: '#ffffff',
          bgRgba: 'rgba(255, 255, 255, 0.12)',
          borderRgba: 'rgba(255, 255, 255, 0.35)',
          textClass: 'text-white'
        },
        energyAccent: {
          hex: '#fef08a',
          bgRgba: 'rgba(255, 255, 255, 0.12)',
          borderRgba: 'rgba(255, 255, 255, 0.35)',
          textClass: 'text-white'
        },
        selectionAccent: {
          hex: '#fafafa',
          borderHex: '#ffffff',
          bgRgba: 'rgba(255, 255, 255, 0.12)'
        },
        chartPalette: ['#fafafa', '#e4e4e7', '#d4d4d8', '#a1a1aa', '#71717a', '#52525b']
      };
    }
    const darkOverride = DARK_ACCENT_OVERRIDES[accent];
    if (darkOverride) {
      return {
        ...base,
        ...darkOverride
      };
    }
  }
  return base;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicializa idêntico ao SSR para evitar erro de hidratação e regeneração completa da árvore React;
  // as variáveis CSS e classes html.dark/light já foram injetadas pelo script beforeInteractive do layout.tsx.
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [accent, setAccentState] = useState<AccentColor>('blue');

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isDashboardCustomizing, setIsDashboardCustomizing] = useState<boolean>(false);
  const [canCustomizeLayout, setCanCustomizeLayoutState] = useState<boolean>(false);

  const setCanCustomizeLayout = useCallback((value: React.SetStateAction<boolean>) => {
    setCanCustomizeLayoutState((prev) => {
      const next = typeof value === 'function' ? (value as (p: boolean) => boolean)(prev) : value;
      if (!next) {
        setIsDashboardCustomizing(false);
      }
      return next;
    });
  }, []);

  const toggleDashboardCustomizing = () => {
    if (!canCustomizeLayout) return;
    setIsDashboardCustomizing((prev) => !prev);
  };

  const isInitialMount = useRef(true);

  useEffect(() => {
    let initialMode: ThemeMode = 'dark';
    let initialAccent: AccentColor = 'blue';
    try {
      const savedMode = localStorage.getItem('banco_theme_mode') as ThemeMode | null;
      if (savedMode === 'dark' || savedMode === 'light') {
        initialMode = savedMode;
      }
      const savedAccent = localStorage.getItem('banco_accent_color') as AccentColor | null;
      if (savedAccent && ACCENT_CONFIGS[savedAccent]) {
        initialAccent = savedAccent;
      }
    } catch {
      // ignore storage access errors
    }

    queueMicrotask(() => {
      setModeState(initialMode);
      setAccentState(initialAccent);
      setIsMounted(true);
    });
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

      const config = getEffectiveAccentConfig(themeAccent, themeMode);
      const pageBg = isDark ? config.surfaceDark : config.surfaceLight;
      const cardBg = isDark ? config.cardDark : config.cardLight;
      const inputBg = isDark ? config.inputDark : config.inputLight;
      const cardBorder = isDark ? config.borderDark : config.borderLight;
      const primaryHex = config.primaryHex;
      const primaryHover = config.hoverHex;
      const glowRgba = config.bgRgba;

      root.style.setProperty('--primary-color', primaryHex);
      root.style.setProperty('--primary-hover', primaryHover);
      root.style.setProperty('--primary-contrast', config.primaryContrastHex);
      root.style.setProperty('--accent-primary', primaryHex);
      root.style.setProperty('--accent-hover', primaryHover);
      root.style.setProperty('--glow-color', glowRgba);
      root.style.setProperty('--accent-muted', glowRgba);
      root.style.setProperty('--accent-subtle', glowRgba);
      root.style.setProperty('--accent-border', config.borderRgba);
      root.style.setProperty('--bg-page', pageBg);
      root.style.setProperty('--background', pageBg);
      root.style.setProperty('--foreground', isDark ? '#f4f4f5' : '#09090b');
      root.style.setProperty('--bg-card', cardBg);
      root.style.setProperty('--card', cardBg);
      root.style.setProperty('--card-foreground', isDark ? '#f4f4f5' : '#09090b');
      root.style.setProperty('--muted', inputBg);
      root.style.setProperty('--muted-foreground', isDark ? '#a1a1aa' : '#52525b');
      root.style.setProperty('--bg-input', inputBg);
      root.style.setProperty('--card-border', cardBorder);
      root.style.setProperty('--border-input', cardBorder);
      root.style.setProperty('--ring', primaryHex);
      root.style.setProperty('--ring-focus', primaryHex);

      // Tokens Semânticos Harmônicos
      root.style.setProperty('--time-accent-color', config.timeAccent.hex);
      root.style.setProperty('--time-accent-bg', config.timeAccent.bgRgba);
      root.style.setProperty('--time-accent-border', config.timeAccent.borderRgba);
      root.style.setProperty('--accuracy-accent-color', config.accuracyAccent.hex);
      root.style.setProperty('--accuracy-accent-bg', config.accuracyAccent.bgRgba);
      root.style.setProperty('--accuracy-accent-border', config.accuracyAccent.borderRgba);
      root.style.setProperty('--energy-accent-color', config.energyAccent.hex);
      root.style.setProperty('--energy-accent-bg', config.energyAccent.bgRgba);
      root.style.setProperty('--energy-accent-border', config.energyAccent.borderRgba);

      // Logo e Favicon Adaptativo
      const logoPrimary = primaryHex;
      const logoContrast = config.primaryContrastHex;
      root.style.setProperty('--logo-primary', logoPrimary);
      root.style.setProperty('--logo-contrast', logoContrast);
      updateFavicon(logoPrimary, logoContrast);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!isMounted) return;
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

// Sincronização em background com as preferências no perfil do Supabase com debounce de 600ms
  const themeDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const syncPreferencesToCloud = useCallback((newMode: ThemeMode, newAccent: AccentColor) => {
    if (themeDebounceRef.current) {
      clearTimeout(themeDebounceRef.current);
    }
    themeDebounceRef.current = setTimeout(async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('preferences')
            .eq('id', session.user.id)
            .maybeSingle();

          const currentPrefs = (profile?.preferences as Record<string, unknown>) || {};
          const updatedPrefs = {
            ...currentPrefs,
            themeMode: newMode,
            accentColor: newAccent,
            updatedAt: new Date().toISOString()
          };

          await supabase
            .from('profiles')
            .update({ preferences: updatedPrefs })
            .eq('id', session.user.id);
        }
      } catch {
        // Ignora falhas temporárias de conexão
      }
    }, 600);
  }, []);

  // Ouve evento disparado pelo AuthContext/StudentDataContext ao carregar perfil remoto e sincroniza abas
  useEffect(() => {
    const handlePreferencesSynced = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const detail = customEvent.detail as { themeMode?: string; accentColor?: string };
        const nextMode: ThemeMode =
          detail.themeMode === 'dark' || detail.themeMode === 'light' ? detail.themeMode : mode;
        const nextAccent: AccentColor =
          detail.accentColor && ACCENT_CONFIGS[detail.accentColor as AccentColor]
            ? (detail.accentColor as AccentColor)
            : accent;

        if (nextMode !== mode) {
          setModeState(nextMode);
        }
        if (nextAccent !== accent) {
          setAccentState(nextAccent);
        }
        if (nextMode !== mode || nextAccent !== accent) {
          applyThemeToDOM(nextMode, nextAccent);
        }
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'banco_theme_mode' && (e.newValue === 'dark' || e.newValue === 'light')) {
        setModeState(e.newValue);
        applyThemeToDOM(e.newValue, accent);
      } else if (e.key === 'banco_accent_color' && e.newValue && ACCENT_CONFIGS[e.newValue as AccentColor]) {
        const nextAcc = e.newValue as AccentColor;
        setAccentState(nextAcc);
        applyThemeToDOM(mode, nextAcc);
      }
    };

    window.addEventListener('bancoresidencia_preferences_synced', handlePreferencesSynced);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('bancoresidencia_preferences_synced', handlePreferencesSynced);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [mode, accent]);

  const toggleMode = () => {
    setModeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('banco_theme_mode', next);
      } catch {}
      applyThemeToDOM(next, accent);
      syncPreferencesToCloud(next, accent);
      return next;
    });
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem('banco_theme_mode', newMode);
    } catch {}
    applyThemeToDOM(newMode, accent);
    syncPreferencesToCloud(newMode, accent);
  };

  const setAccent = (newAccent: AccentColor) => {
    setAccentState(newAccent);
    try {
      localStorage.setItem('banco_accent_color', newAccent);
    } catch {}
    applyThemeToDOM(mode, newAccent);
    syncPreferencesToCloud(mode, newAccent);
  };

  const activeConfig = getEffectiveAccentConfig(accent, mode);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        accent,
        accentConfig: activeConfig,
        toggleMode,
        setMode,
        setAccent,
        isDashboardCustomizing,
        setIsDashboardCustomizing,
        toggleDashboardCustomizing,
        canCustomizeLayout,
        setCanCustomizeLayout
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser utilizado dentro de um ThemeProvider');
  }
  return context;
};
