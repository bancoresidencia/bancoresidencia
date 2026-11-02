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
              const safeColSpan = Math.max(
                def.minColSpan || 2,
                Math.min(12, found.colSpan ?? def.colSpan)
              ) as DashboardColSpan;
              const safeHeight = found.customHeight
                ? Math.max(def.minHeight || 120, Math.min(def.maxHeight || 800, found.customHeight))
                : def.customHeight;

              return {
                ...def,
                colSpan: safeColSpan,
                customHeight: safeHeight,
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
  // Elimina gaps residuais agrupando em linhas de 12 colunas e normalizando as ordens
  const autoConformLayout = useCallback(() => {
    setCards((prev) => {
      // 1. Separa visíveis de ocultos e ordena por order
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const visible = sorted.filter((c) => c.isVisible !== false);
      const hidden = sorted.filter((c) => c.isVisible === false);

      // 2. Empacotamento inteligente de linhas para fechar em 12 colunas sem gaps residuais
      let currentRowSpan = 0;
      let lastCardInRowIndex = -1;

      for (let i = 0; i < visible.length; i++) {
        const card = visible[i];
        const span = Math.max(card.minColSpan || 2, Math.min(12, card.colSpan)) as DashboardColSpan;
        card.colSpan = span;

        if (currentRowSpan + span <= 12) {
          currentRowSpan += span;
          lastCardInRowIndex = i;
        } else {
          // Se sobrou um gap de 1 ou 2 colunas na linha anterior, expande o último card dessa linha
          const residualGap = 12 - currentRowSpan;
          if (residualGap > 0 && residualGap <= 2 && lastCardInRowIndex >= 0) {
            visible[lastCardInRowIndex].colSpan = Math.min(
              12,
              visible[lastCardInRowIndex].colSpan + residualGap
            ) as DashboardColSpan;
          }
          currentRowSpan = span;
          lastCardInRowIndex = i;
        }
      }

      // Se a última linha tiver gap pequeno de 1 a 2 colunas
      const finalGap = 12 - currentRowSpan;
      if (finalGap > 0 && finalGap <= 2 && lastCardInRowIndex >= 0) {
        visible[lastCardInRowIndex].colSpan = Math.min(
          12,
          visible[lastCardInRowIndex].colSpan + finalGap
        ) as DashboardColSpan;
      }

      // 3. Normaliza ordem sequencial contínua (0, 1, 2...) e bounds de altura
      const allCards = [...visible, ...hidden];
      const normalized = allCards.map((c, index) => ({
        ...c,
        order: index,
        colSpan: Math.max(c.minColSpan || 2, Math.min(12, c.colSpan)) as DashboardColSpan,
        customHeight: c.customHeight
          ? Math.max(c.minHeight || 120, Math.min(c.maxHeight || 600, c.customHeight))
          : undefined,
      }));

      saveToStorage(normalized);
      return normalized;
    });
    setSelectedCardId(null);
  }, [saveToStorage]);

  // Atualiza tamanho (colSpan) de um card específico com auto-adaptação dos cards adjacentes
  const updateColSpan = useCallback(
    (cardId: string, newColSpan: DashboardColSpan) => {
      setCards((prev) => {
        const targetIndex = prev.findIndex((c) => c.id === cardId);
        if (targetIndex === -1) return prev;

        const next = prev.map((c) => ({ ...c }));
        next[targetIndex].colSpan = newColSpan;

        // Auto-rebalanceamento de linha inteligente:
        // Identifica os cards visíveis que compõem a mesma linha do card modificado
        const visibleIndices = next
          .map((c, i) => (c.isVisible !== false ? i : -1))
          .filter((i) => i !== -1);

        let rowSum = 0;
        let currentRow: number[] = [];
        let targetRow: number[] = [];

        for (const idx of visibleIndices) {
          const span = next[idx].colSpan;
          if (rowSum + span <= 12) {
            currentRow.push(idx);
            rowSum += span;
          } else {
            if (currentRow.includes(targetIndex)) {
              targetRow = currentRow;
              break;
            }
            currentRow = [idx];
            rowSum = span;
          }
        }
        if (currentRow.includes(targetIndex) && targetRow.length === 0) {
          targetRow = currentRow;
        }

        // Se há outros cards na mesma linha do card alvo, distribui o espaço restante para manter a linha nivelada (12 colunas)
        if (targetRow.length > 1) {
          const otherRowIndices = targetRow.filter((i) => i !== targetIndex);
          const currentTotal = targetRow.reduce((sum, i) => sum + next[i].colSpan, 0);
          const diff = 12 - currentTotal;

          if (diff !== 0 && otherRowIndices.length > 0) {
            const deltaEach = Math.trunc(diff / otherRowIndices.length);
            let remainder = Math.abs(diff) % otherRowIndices.length;

            for (const idx of otherRowIndices) {
              const currentSpan = next[idx].colSpan;
              const minSpan = next[idx].minColSpan || 2;
              const maxSpan = next[idx].maxColSpan || 12;
              const extra = deltaEach + (remainder > 0 ? (diff > 0 ? 1 : -1) : 0);
              if (remainder > 0) remainder--;

              const adjustedSpan = Math.max(
                minSpan,
                Math.min(maxSpan, currentSpan + extra)
              ) as DashboardColSpan;
              next[idx].colSpan = adjustedSpan;
            }
          }
        }

        saveToStorage(next);
        return next;
      });
    },
    [saveToStorage]
  );

  // Atualiza altura personalizada (pixels) de um card específico (permite reset para undefined/Auto)
  const updateCardHeight = useCallback(
    (cardId: string, newHeight?: number) => {
      setCards((prev) => {
        const next = prev.map((c) =>
          c.id === cardId ? { ...c, customHeight: newHeight } : c
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
    updateCardHeight,
    updateCardSettings,
    moveCard,
    reorderCard,
    toggleVisibility,
    restoreDefaults,
    autoConformLayout,
    isLoaded,
  };
}
