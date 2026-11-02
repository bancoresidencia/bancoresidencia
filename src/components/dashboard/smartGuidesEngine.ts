import { AlignmentGuide } from './FigmaSmartGuides';
import { DashboardCardConfig } from '@/types/dashboardLayout';

export interface SmartGuidesState {
  guides: AlignmentGuide[];
}

/**
 * Motor de Cálculo em Tempo Real de Guias Pontilhadas (Smart Guides)
 * Estilo Figma / Canva com detecção de alinhamento em 60fps
 */
export function calculateSmartGuides(
  activeCardId: string,
  containerElem: HTMLElement | null,
  cardsConfig: DashboardCardConfig[]
): SmartGuidesState {
  if (!containerElem) return { guides: [] };

  const containerRect = containerElem.getBoundingClientRect();
  const activeCardElem = containerElem.querySelector(`[data-card-id="${activeCardId}"]`) as HTMLElement | null;
  if (!activeCardElem) return { guides: [] };

  const activeRect = activeCardElem.getBoundingClientRect();

  // Coordenadas relativas do card ativo
  const a = {
    left: activeRect.left - containerRect.left,
    right: activeRect.right - containerRect.left,
    top: activeRect.top - containerRect.top,
    bottom: activeRect.bottom - containerRect.top,
    centerX: (activeRect.left + activeRect.right) / 2 - containerRect.left,
    centerY: (activeRect.top + activeRect.bottom) / 2 - containerRect.top,
    width: activeRect.width,
    height: activeRect.height
  };

  const otherCardElems = Array.from(
    containerElem.querySelectorAll(`[data-card-id]:not([data-card-id="${activeCardId}"])`)
  ) as HTMLElement[];

  const guides: AlignmentGuide[] = [];
  const TOLERANCE = 7; // Tolerância de snap em pixels

  for (const otherElem of otherCardElems) {
    const otherId = otherElem.dataset.cardId;
    if (!otherId) continue;

    const otherRect = otherElem.getBoundingClientRect();
    const o = {
      left: otherRect.left - containerRect.left,
      right: otherRect.right - containerRect.left,
      top: otherRect.top - containerRect.top,
      bottom: otherRect.bottom - containerRect.top,
      centerX: (otherRect.left + otherRect.right) / 2 - containerRect.left,
      centerY: (otherRect.top + otherRect.bottom) / 2 - containerRect.top,
      width: otherRect.width,
      height: otherRect.height
    };

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
