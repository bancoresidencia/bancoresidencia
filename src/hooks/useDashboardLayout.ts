'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DashboardCardConfig, DashboardColSpan, CardInternalSettings } from '@/types/dashboardLayout';

export function useDashboardLayout(
  storageKey: string,
  defaultCards: DashboardCardConfig[]
) {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [cards, setCards] = useState<DashboardCardConfig[]>(defaultCards);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carrega do LocalStorage na montagem
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey + '_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged: DashboardCardConfig[] = defaultCards.map((def) => {
            const found = parsed.find((p: DashboardCardConfig) => p.id === def.id);
            if (found) {
              return {
                ...def,
                colSpan: found.colSpan ?? def.colSpan,
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
          setCards(merged);
          setIsLoaded(true);
          return;
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar layout customizado:', e);
    }
    setCards(defaultCards);
    setIsLoaded(true);
  }, [storageKey, defaultCards]);

  // Salva no LocalStorage
  const saveToStorage = useCallback(
    (newCards: DashboardCardConfig[]) => {
      try {
        localStorage.setItem(storageKey + '_v2', JSON.stringify(newCards));
      } catch (e) {
        console.warn('Erro ao salvar layout:', e);
      }
    },
    [storageKey]
  );

  // Auto-conformação e normalização do layout ao salvar
  const autoConformLayout = useCallback(() => {
    setCards((prev) => {
      // Normaliza order sequencialmente
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const normalized = sorted.map((c, index) => ({
        ...c,
        order: index
      }));
      saveToStorage(normalized);
      return normalized;
    });
    setSelectedCardId(null);
  }, [saveToStorage]);

  // Atualiza tamanho (colSpan) de um card específico
  const updateColSpan = useCallback(
    (cardId: string, newColSpan: DashboardColSpan) => {
      setCards((prev) => {
        const next = prev.map((c) =>
          c.id === cardId ? { ...c, colSpan: newColSpan } : c
        );
        saveToStorage(next);
        return next;
      });
    },
    [saveToStorage]
  );

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

  // Reordena arrastando ou movendo com troca inteligente de posição
  const reorderCard = useCallback(
    (draggedId: string, targetId: string) => {
      if (draggedId === targetId) return;
      setCards((prev) => {
        const list = [...prev];
        const draggedIndex = list.findIndex((c) => c.id === draggedId);
        const targetIndex = list.findIndex((c) => c.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return prev;

        const [removed] = list.splice(draggedIndex, 1);
        list.splice(targetIndex, 0, removed);

        // Reatribui order normalizada
        const updated = list.map((c, idx) => ({ ...c, order: idx }));
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  // Mover um card para cima ou para baixo
  const moveCard = useCallback(
    (cardId: string, direction: 'up' | 'down') => {
      setCards((prev) => {
        const sorted = [...prev].sort((a, b) => a.order - b.order);
        const index = sorted.findIndex((c) => c.id === cardId);
        if (index === -1) return prev;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= sorted.length) return prev;

        const temp = sorted[index];
        sorted[index] = sorted[targetIndex];
        sorted[targetIndex] = temp;

        const updated = sorted.map((c, idx) => ({ ...c, order: idx }));
        saveToStorage(updated);
        return updated;
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
    setCards(defaultCards);
    setSelectedCardId(null);
  }, [storageKey, defaultCards]);

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
    updateColSpan,
    updateCardSettings,
    moveCard,
    reorderCard,
    toggleVisibility,
    restoreDefaults,
    autoConformLayout,
    isLoaded,
  };
}
