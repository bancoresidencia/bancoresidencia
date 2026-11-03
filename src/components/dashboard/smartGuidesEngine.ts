import { AlignmentGuide } from './FigmaSmartGuides';
import { DashboardCardConfig } from '@/types/dashboardLayout';

export interface SmartGuidesState {
  guides: AlignmentGuide[];
}

export interface StaticCardRectSnapshot {
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export interface StaticGuidesSnapshot {
  containerRect: {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  };
  staticCards: StaticCardRectSnapshot[];
}

/**
 * Cria snapshot geométrico dos cards estacionários no pointerdown
 * Evita forçar reflow (layout thrashing) em 120fps durante o pointermove
 */
export function createGuidesSnapshot(
  containerElem: HTMLElement | null,
  activeCardId: string
): StaticGuidesSnapshot | null {
  if (!containerElem) return null;
  const containerRect = containerElem.getBoundingClientRect();
  const otherCardElems = Array.from(
    containerElem.querySelectorAll(`[data-card-id]:not([data-card-id="${activeCardId}"])`)
  ) as HTMLElement[];

  const staticCards: StaticCardRectSnapshot[] = [];
  for (const otherElem of otherCardElems) {
    const id = otherElem.dataset.cardId;
    if (!id) continue;
    const r = otherElem.getBoundingClientRect();
    staticCards.push({
      id,
      left: r.left - containerRect.left,
      right: r.right - containerRect.left,
      top: r.top - containerRect.top,
      bottom: r.bottom - containerRect.top,
      centerX: (r.left + r.right) / 2 - containerRect.left,
      centerY: (r.top + r.bottom) / 2 - containerRect.top,
      width: r.width,
      height: r.height
    });
  }

  return {
    containerRect: {
      left: containerRect.left,
      top: containerRect.top,
      right: containerRect.right,
      bottom: containerRect.bottom,
      width: containerRect.width,
      height: containerRect.height
    },
    staticCards
  };
}

/**
 * Motor de Cálculo em Tempo Real de Guias Pontilhadas (Smart Guides)
 * Estilo Figma / Canva com detecção de alinhamento em 120fps
 */
export function calculateSmartGuides(
  activeCardId: string,
  containerElem: HTMLElement | null,
  cardsConfig: DashboardCardConfig[],
  snapshot?: StaticGuidesSnapshot | null
): SmartGuidesState {
  if (!containerElem) return { guides: [] };

  const activeCardElem = containerElem.querySelector(`[data-card-id="${activeCardId}"]`) as HTMLElement | null;
  if (!activeCardElem) return { guides: [] };

  const activeRect = activeCardElem.getBoundingClientRect();
  const cRect = snapshot ? snapshot.containerRect : containerElem.getBoundingClientRect();

  // Coordenadas relativas do card ativo
  const a = {
    left: activeRect.left - cRect.left,
    right: activeRect.right - cRect.left,
    top: activeRect.top - cRect.top,
    bottom: activeRect.bottom - cRect.top,
    centerX: (activeRect.left + activeRect.right) / 2 - cRect.left,
    centerY: (activeRect.top + activeRect.bottom) / 2 - cRect.top,
    width: activeRect.width,
    height: activeRect.height
  };

  const otherCards = snapshot
    ? snapshot.staticCards
    : Array.from(containerElem.querySelectorAll(`[data-card-id]:not([data-card-id="${activeCardId}"])`)).map((el) => {
        const otherElem = el as HTMLElement;
        const r = otherElem.getBoundingClientRect();
        return {
          id: otherElem.dataset.cardId || '',
          left: r.left - cRect.left,
          right: r.right - cRect.left,
          top: r.top - cRect.top,
          bottom: r.bottom - cRect.top,
          centerX: (r.left + r.right) / 2 - cRect.left,
          centerY: (r.top + r.bottom) / 2 - cRect.top,
          width: r.width,
          height: r.height
        };
      });

  const guides: AlignmentGuide[] = [];
  const TOLERANCE = 7; // Tolerância de snap em pixels

  for (const o of otherCards) {
    if (!o.id) continue;

    // 1. ALINHAMENTOS HORIZONTAIS (Y)
    // Topo com Topo
    if (Math.abs(a.top - o.top) <= TOLERANCE) {
      guides.push({
        type: 'horizontal',
        position: o.top,
        start: Math.min(a.left, o.left) - 16,
        end: Math.max(a.right, o.right) + 16,
        label: 'Topo alinhado'
      });
    }
    // Base com Base
    else if (Math.abs(a.bottom - o.bottom) <= TOLERANCE) {
      guides.push({
        type: 'horizontal',
        position: o.bottom,
        start: Math.min(a.left, o.left) - 16,
        end: Math.max(a.right, o.right) + 16,
        label: 'Base alinhada'
      });
    }
    // Centro com Centro
    else if (Math.abs(a.centerY - o.centerY) <= TOLERANCE) {
      guides.push({
        type: 'horizontal',
        position: o.centerY,
        start: Math.min(a.left, o.left) - 16,
        end: Math.max(a.right, o.right) + 16,
        label: 'Centro'
      });
    }

    // 2. ALINHAMENTOS VERTICAIS (X)
    // Esquerda com Esquerda
    if (Math.abs(a.left - o.left) <= TOLERANCE) {
      guides.push({
        type: 'vertical',
        position: o.left,
        start: Math.min(a.top, o.top) - 16,
        end: Math.max(a.bottom, o.bottom) + 16,
        label: 'Esquerda'
      });
    }
    // Direita com Direita
    else if (Math.abs(a.right - o.right) <= TOLERANCE) {
      guides.push({
        type: 'vertical',
        position: o.right,
        start: Math.min(a.top, o.top) - 16,
        end: Math.max(a.bottom, o.bottom) + 16,
        label: 'Direita'
      });
    }
    // Centro com Centro Vertical
    else if (Math.abs(a.centerX - o.centerX) <= TOLERANCE) {
      guides.push({
        type: 'vertical',
        position: o.centerX,
        start: Math.min(a.top, o.top) - 16,
        end: Math.max(a.bottom, o.bottom) + 16,
        label: 'Centro'
      });
    }
  }

  // Limita até 4 guias simultâneas para manter a visão limpa
  return {
    guides: guides.slice(0, 4)
  };
}
