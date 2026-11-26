'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DashboardCardConfig, DashboardColSpan, CardInternalSettings } from '@/types/dashboardLayout';
import type { CardRects, ScreenLayout } from '@/components/dashboard/cardGeometry';
import { createClient } from '@/lib/supabase/client';

function mergeCardsWithDefaults(
  storedCards: DashboardCardConfig[],
  defaultCards: DashboardCardConfig[]
): DashboardCardConfig[] {
  const merged: DashboardCardConfig[] = defaultCards.map((def) => {
    const found = storedCards.find((p: DashboardCardConfig) => p.id === def.id);
    if (found) {
      const safeColSpan = Math.max(
        def.minColSpan || 2,
        Math.min(12, found.colSpan ?? def.colSpan)
      ) as DashboardColSpan;
      const safeHeight = found.customHeight
        ? Math.max(def.minHeight || 65, Math.min(def.maxHeight || 800, found.customHeight))
        : def.customHeight;

      return {
        ...def,
        colSpan: safeColSpan,
        customHeight: safeHeight,
        frames: found.frames,
        layoutRevision: found.layoutRevision,
        order: found.order ?? def.order,
        isVisible: found.isVisible ?? def.isVisible,
        settings: {
          ...def.settings,
          ...(found.settings || {})
        }
      };
    }
    return def;
  });
  merged.sort((a, b) => a.order - b.order);
  return merged;
}

export function useDashboardLayout(
  storageKey: string,
  defaultCards: DashboardCardConfig[]
) {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [cards, setCards] = useState<DashboardCardConfig[]>(defaultCards);
  const [isLoaded, setIsLoaded] = useState(false);
  const cloudSyncDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Carrega do LocalStorage na montagem e ouve sincronização de preferências em nuvem
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey + '_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCards(mergeCardsWithDefaults(parsed, defaultCards));
          setIsLoaded(true);
        }
      } else {
        setCards(defaultCards);
        setIsLoaded(true);
      }
    } catch (e) {
      console.warn('Erro ao carregar layout customizado:', e);
      setCards(defaultCards);
      setIsLoaded(true);
    }

    const handlePreferencesSynced = (e: Event) => {
      const detail = (e as CustomEvent).detail as { dashboardLayouts?: Record<string, DashboardCardConfig[]> } | undefined;
      const remoteLayout = detail?.dashboardLayouts?.[storageKey + '_v2'];
      if (Array.isArray(remoteLayout) && remoteLayout.length > 0) {
        const local = JSON.parse(localStorage.getItem(storageKey + '_v2') || '[]') as DashboardCardConfig[];
        if ((local[0]?.layoutRevision ?? 0) > (remoteLayout[0]?.layoutRevision ?? 0)) return;
        const merged = mergeCardsWithDefaults(remoteLayout, defaultCards);
        setCards(merged);
        try {
          localStorage.setItem(storageKey + '_v2', JSON.stringify(merged));
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('bancoresidencia_preferences_synced', handlePreferencesSynced);
    return () => window.removeEventListener('bancoresidencia_preferences_synced', handlePreferencesSynced);
  }, [storageKey, defaultCards]);

  // Salva no LocalStorage e sincroniza com preferences no Supabase (multi-dispositivo)
  const saveToStorage = useCallback(
    (cardsToSave: DashboardCardConfig[]) => {
      const revision = Date.now();
      const newCards = cardsToSave.map(c => ({ ...c, layoutRevision: revision }));
      try {
        localStorage.setItem(storageKey + '_v2', JSON.stringify(newCards));
      } catch (e) {
        console.warn('Erro ao salvar layout:', e);
      }

      if (cloudSyncDebounceRef.current) {
        clearTimeout(cloudSyncDebounceRef.current);
      }
      cloudSyncDebounceRef.current = setTimeout(async () => {
        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('preferences')
              .eq('id', session.user.id)
              .maybeSingle();

            if (error || !profile) return;
            const currentPrefs = (profile?.preferences as Record<string, unknown>) || {};
            const currentLayouts = (currentPrefs.dashboardLayouts as Record<string, unknown>) || {};
            const compactPayload = newCards.map((c) => ({
              id: c.id,
              colSpan: c.colSpan,
              customHeight: c.customHeight,
              frames: c.frames,
              layoutRevision: c.layoutRevision,
              order: c.order,
              isVisible: c.isVisible,
              settings: c.settings
            }));

            await supabase
              .from('profiles')
              .update({
                preferences: {
                  ...currentPrefs,
                  dashboardLayouts: {
                    ...currentLayouts,
                    [storageKey + '_v2']: compactPayload
                  },
                  updatedAt: new Date().toISOString()
                }
              })
              .eq('id', session.user.id);
          }
        } catch {
          // Ignora falha de rede temporária
        }
      }, 900);
    },
    [storageKey]
  );

  const autoConformLayout = useCallback(() => setSelectedCardId(null), []);

  const saveFrames = useCallback((screen: ScreenLayout, frames: CardRects) => {
    setCards(prev => {
      const next = prev.map(card => frames[card.id]
        ? { ...card, frames: { ...card.frames, [screen]: frames[card.id] } } : card);
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  // Atualiza configurações internas do card (ícones, detalhes, modo compacto)
  const updateCardSettings = useCallback(
    (cardId: string, newSettings: Partial<CardInternalSettings>) => {
      setCards((prev) => {
        const next = prev.map((c) =>
          c.id === cardId
            ? {
                ...c,
                settings: {
                  ...c.settings,
                  ...newSettings
                }
              }
            : c
        );
        saveToStorage(next);
        return next;
      });
    },
    [saveToStorage]
  );

  // Alterna visibilidade do card
  const toggleVisibility = useCallback(
    (cardId: string) => {
      setCards((prev) => {
        const next = prev.map((c) =>
          c.id === cardId ? { ...c, isVisible: !c.isVisible } : c
        );
        saveToStorage(next);
        return next;
      });
    },
    [saveToStorage]
  );

  // Restaura padrão
  const restoreDefaults = useCallback(() => {
    try {
      localStorage.removeItem(storageKey + '_v2');
      localStorage.removeItem(storageKey);
    } catch {}
    saveToStorage(defaultCards);
    setCards(defaultCards);
    setSelectedCardId(null);
  }, [storageKey, defaultCards, saveToStorage]);

  // Lista ordenada de cards visíveis
  const visibleCards = useMemo(() => {
    return [...cards].filter((c) => c.isVisible).sort((a, b) => a.order - b.order);
  }, [cards]);

  // Lista de cards ocultos
  const hiddenCards = useMemo(() => {
    return [...cards].filter((c) => !c.isVisible);
  }, [cards]);

  return {
    isCustomizing,
    setIsCustomizing,
    selectedCardId,
    setSelectedCardId,
    cards,
    visibleCards,
    hiddenCards,
    saveFrames,
    updateCardSettings,
    toggleVisibility,
    restoreDefaults,
    autoConformLayout,
    isLoaded,
  };
}
