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
    label: 'Azul Clássico',
    primaryHex: '#2563eb',
    hoverHex: '#1d4ed8',
    primaryContrastHex: '#ffffff',
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
    borderDark: '#27272a',
    surfaceLight: '#f8faff',
    cardLight: '#ffffff',
    inputLight: '#ffffff',
    borderLight: '#e4e4e7',
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
      hex: '#2563eb',
      borderHex: '#3b82f6',
      bgRgba: 'rgba(37, 99, 235, 0.12)'
    },
    chartPalette: ['#2563eb', '#38bdf8', '#14b8a6', '#6366f1', '#f59e0b', '#ec4899']
  },
  green: {
    id: 'green',
    label: 'Verde Esmeralda',
    primaryHex: '#059669',
    hoverHex: '#047857',
    primaryContrastHex: '#ffffff',
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
    borderDark: '#27272a',
    surfaceLight: '#f7fbf9',
    cardLight: '#ffffff',
    inputLight: '#ffffff',
    borderLight: '#e4e4e7',
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
      hex: '#059669',
      borderHex: '#10b981',
      bgRgba: 'rgba(5, 150, 105, 0.12)'
    },
    chartPalette: ['#059669', '#10b981', '#2dd4bf', '#84cc16', '#d97706', '#06b6d4']
  },
  orange: {
    id: 'orange',
    label: 'Laranja Radiante',
    primaryHex: '#ea580c',
    hoverHex: '#c2410c',
    primaryContrastHex: '#ffffff',
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
    borderDark: '#27272a',
    surfaceLight: '#fffaf7',
    cardLight: '#ffffff',
    inputLight: '#ffffff',
    borderLight: '#e4e4e7',
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
      hex: '#ea580c',
      borderHex: '#f97316',
      bgRgba: 'rgba(234, 88, 12, 0.12)'
    },
    chartPalette: ['#ea580c', '#f97316', '#fbbf24', '#10b981', '#78716c', '#38bdf8']
  },
  purple: {
    id: 'purple',
    label: 'Roxo Nobre',
    primaryHex: '#7c3aed',
    hoverHex: '#6d28d9',
    primaryContrastHex: '#ffffff',
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
    borderDark: '#27272a',
    surfaceLight: '#fbf9ff',
    cardLight: '#ffffff',
    inputLight: '#ffffff',
    borderLight: '#e4e4e7',
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
      hex: '#7c3aed',
      borderHex: '#8b5cf6',
      bgRgba: 'rgba(124, 58, 237, 0.12)'
    },
    chartPalette: ['#7c3aed', '#a78bfa', '#2dd4bf', '#c084fc', '#fb923c', '#06b6d4']
  },
  red: {
    id: 'red',
    label: 'Vermelho Carmesim',
    primaryHex: '#dc2626',
    hoverHex: '#b91c1c',
    primaryContrastHex: '#ffffff',
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
    borderDark: '#27272a',
    surfaceLight: '#fff9f9',
    cardLight: '#ffffff',
    inputLight: '#ffffff',
    borderLight: '#e4e4e7',
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
      hex: '#dc2626',
      borderHex: '#ef4444',
      bgRgba: 'rgba(220, 38, 38, 0.12)'
    },
    chartPalette: ['#dc2626', '#f87171', '#fb923c', '#94a3b8', '#34d399', '#38bdf8']
  },
  rose: {
    id: 'rose',
    label: 'Rosa',
    primaryHex: '#e11d48',
    hoverHex: '#be123c',
    primaryContrastHex: '#ffffff',
    bgRgba: 'rgba(225, 29, 72, 0.14)',
    borderRgba: 'rgba(225, 29, 72, 0.35)',
    textClass: 'text-rose-500 dark:text-rose-400',
    bgClass: 'bg-rose-600 hover:bg-rose-700 text-white',
    ringClass: 'ring-rose-400/40 border-rose-400/50',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-600 dark:text-rose-400',
    badgeBorder: 'border-rose-400/25',
    cssVarValue: '#e11d48',
    surfaceDark: '#0c080a',
    cardDark: '#151012',
    inputDark: '#1c1417',
    borderDark: '#27272a',
    surfaceLight: '#fff8fa',
    cardLight: '#ffffff',
    inputLight: '#ffffff',
    borderLight: '#e4e4e7',
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
      hex: '#e11d48',
      borderHex: '#f43f5e',
      bgRgba: 'rgba(225, 29, 72, 0.12)'
    },
    chartPalette: ['#e11d48', '#f43f5e', '#c084fc', '#2dd4bf', '#fb923c', '#38bdf8']
  },
  neutral: {
    id: 'neutral',
    label: 'Monocromático',
    primaryHex: '#18181b',
    hoverHex: '#27272a',
    primaryContrastHex: '#ffffff',
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

export function getEffectiveAccentConfig(accent: AccentColor, mode: ThemeMode): AccentConfig {
  const base = ACCENT_CONFIGS[accent] || ACCENT_CONFIGS.blue;
  if (accent === 'neutral' && mode === 'dark') {
    return {
      ...base,
      primaryHex: '#ffffff',
      hoverHex: '#f4f4f5',
      primaryContrastHex: '#09090b',
      bgRgba: 'rgba(255, 255, 255, 0.14)',
      borderRgba: 'rgba(255, 255, 255, 0.35)',
      textClass: 'text-white',
      bgClass: 'bg-white hover:bg-zinc-100 text-zinc-950',
      ringClass: 'ring-white/40 border-white/50',
      badgeBg: 'bg-white/10',
      badgeText: 'text-white',
      badgeBorder: 'border-white/20',
      cssVarValue: '#ffffff',
      timeAccent: {
        hex: '#e4e4e7',
        bgRgba: 'rgba(255, 255, 255, 0.14)',
        borderRgba: 'rgba(255, 255, 255, 0.35)',
        textClass: 'text-white'
      },
      accuracyAccent: {
        hex: '#ffffff',
        bgRgba: 'rgba(255, 255, 255, 0.14)',
        borderRgba: 'rgba(255, 255, 255, 0.35)',
        textClass: 'text-white'
      },
      energyAccent: {
        hex: '#fef08a',
        bgRgba: 'rgba(255, 255, 255, 0.14)',
        borderRgba: 'rgba(255, 255, 255, 0.35)',
        textClass: 'text-white'
      },
      selectionAccent: {
        hex: '#ffffff',
        borderHex: '#ffffff',
        bgRgba: 'rgba(255, 255, 255, 0.15)'
      },
      chartPalette: ['#ffffff', '#f4f4f5', '#e4e4e7', '#d4d4d8', '#a1a1aa', '#71717a']
    };
  }
  return base;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicialização síncrona do tema a partir do localStorage para evitar flash de modo escuro/claro
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedMode = localStorage.getItem('banco_theme_mode') as ThemeMode | null;
        if (savedMode === 'dark' || savedMode === 'light') return savedMode;
      } catch {}
    }
    return 'dark';
  });

  const [accent, setAccentState] = useState<AccentColor>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedAccent = localStorage.getItem('banco_accent_color') as AccentColor | null;
        if (savedAccent && ACCENT_CONFIGS[savedAccent]) return savedAccent;
      } catch {}
    }
    return 'blue';
  });

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
      root.style.setProperty('--bg-card', cardBg);
      root.style.setProperty('--bg-input', inputBg);
      root.style.setProperty('--card-border', cardBorder);
      root.style.setProperty('--border-input', cardBorder);
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
  }, [mode, accent]);

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

  // Ouve evento disparado pelo AuthContext ao carregar perfil remoto do Supabase
  useEffect(() => {
    const handlePreferencesSynced = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const detail = customEvent.detail;
        if (detail.themeMode && (detail.themeMode === 'dark' || detail.themeMode === 'light') && detail.themeMode !== mode) {
          setModeState(detail.themeMode);
          applyThemeToDOM(detail.themeMode, accent);
        }
        if (detail.accentColor && ACCENT_CONFIGS[detail.accentColor as AccentColor] && detail.accentColor !== accent) {
          setAccentState(detail.accentColor as AccentColor);
          applyThemeToDOM(mode, detail.accentColor as AccentColor);
        }
      }
    };

    window.addEventListener('bancoresidencia_preferences_synced', handlePreferencesSynced);
    return () => window.removeEventListener('bancoresidencia_preferences_synced', handlePreferencesSynced);
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
