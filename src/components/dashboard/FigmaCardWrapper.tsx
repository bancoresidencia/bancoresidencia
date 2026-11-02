'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  GripVertical,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Maximize2,
  Minimize2,
  Sliders,
  Check,
  Sparkles,
  Move
} from 'lucide-react';
import { DashboardCardConfig, DashboardColSpan, CardInternalSettings } from '@/types/dashboardLayout';
import { CardLayoutProvider } from './CardLayoutContext';

interface FigmaCardWrapperProps {
  config: DashboardCardConfig;
  isCustomizing: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdateColSpan: (id: string, newColSpan: DashboardColSpan) => void;
  onUpdateSettings: (id: string, settings: Partial<CardInternalSettings>) => void;
  onMoveCard: (id: string, direction: 'up' | 'down') => void;
  onToggleVisibility: (id: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
  children: React.ReactNode;
  className?: string;
}

const COL_STEPS: DashboardColSpan[] = [4, 6, 8, 12];

export const FigmaCardWrapper: React.FC<FigmaCardWrapperProps> = ({
  config,
  isCustomizing,
  isSelected,
  onSelect,
  onUpdateColSpan,
  onUpdateSettings,
  onMoveCard,
  onToggleVisibility,
  onReorder,
  children,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isFreeDragging, setIsFreeDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoverTargetId, setHoverTargetId] = useState<string | null>(null);
  const [previewColSpan, setPreviewColSpan] = useState<DashboardColSpan | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const activeSpan = previewColSpan || config.colSpan;
  const settings = config.settings || { showIcons: true, showDetails: true, compactMode: false };

  // Mapeia colSpan para classes Tailwind responsivas
  const getColSpanClass = (span: DashboardColSpan) => {
    switch (span) {
      case 3:
        return 'col-span-12 sm:col-span-6 lg:col-span-3';
      case 4:
        return 'col-span-12 sm:col-span-6 lg:col-span-4';
      case 6:
        return 'col-span-12 sm:col-span-6 lg:col-span-6';
      case 8:
        return 'col-span-12 lg:col-span-8';
      case 12:
      default:
        return 'col-span-12';
    }
  };

  const getColSpanLabel = (span: DashboardColSpan) => {
    switch (span) {
      case 3:
        return '1/4 (25%)';
      case 4:
        return '1/3 (33%)';
      case 6:
        return '1/2 (50%)';
      case 8:
        return '2/3 (66%)';
      case 12:
        return 'Cheia (100%)';
    }
  };

  // Redimensionamento nos Cantos e Bordas (Pointer Drag)
  const handleCornerResize = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const container = containerRef.current;
      if (!container) return;

      const parentGrid = container.parentElement;
      if (!parentGrid) return;

      setIsResizing(true);
      const parentWidth = parentGrid.getBoundingClientRect().width;
      const startX = e.clientX;
      const initialSpan = config.colSpan;
      let lastTargetSpan = initialSpan;

      const onPointerMove = (moveEvent: PointerEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const colWidth = parentWidth / 12;
        const deltaCols = Math.round(deltaX / colWidth);
        const rawNewSpan = initialSpan + deltaCols;

        let targetSpan: DashboardColSpan = 12;
        if (rawNewSpan <= 3) targetSpan = 3;
        else if (rawNewSpan <= 5) targetSpan = 4;
        else if (rawNewSpan <= 7) targetSpan = 6;
        else if (rawNewSpan <= 10) targetSpan = 8;
        else targetSpan = 12;

        if (targetSpan !== lastTargetSpan) {
          lastTargetSpan = targetSpan;
          setPreviewColSpan(targetSpan);
        }
      };

      const onPointerUp = () => {
        setIsResizing(false);
        setPreviewColSpan(null);
        if (lastTargetSpan !== config.colSpan) {
          onUpdateColSpan(config.id, lastTargetSpan);
        }
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    },
    [config.id, config.colSpan, onUpdateColSpan]
  );

  // Mover Livremente Clicando e Segurando em Qualquer Ponto do Card
  const handleCardPointerDown = (e: React.PointerEvent) => {
    if (!isCustomizing) return;

    // Se clicou em um controle interativo (botão, input, popover), não inicia drag
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('.figma-control') ||
      target.closest('.figma-popover')
    ) {
      return;
    }

    // Seleciona o card
    onSelect(config.id);

    const startX = e.clientX;
    const startY = e.clientY;
    let hasMoved = false;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      if (!hasMoved && Math.hypot(dx, dy) > 8) {
        hasMoved = true;
        setIsFreeDragging(true);
      }

      if (hasMoved) {
        setDragOffset({ x: dx, y: dy });

        // Identifica card sob o ponteiro para feedback magnético de encaixe
        const elemUnder = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
        const targetCard = elemUnder?.closest('[data-card-id]') as HTMLElement | null;
        if (targetCard && targetCard.dataset.cardId && targetCard.dataset.cardId !== config.id) {
          setHoverTargetId(targetCard.dataset.cardId);
        } else {
          setHoverTargetId(null);
        }
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      if (hasMoved) {
        setIsFreeDragging(false);
        setDragOffset({ x: 0, y: 0 });

        if (hoverTargetId && hoverTargetId !== config.id) {
          onReorder(config.id, hoverTargetId);
        }
        setHoverTargetId(null);
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Alterna tamanho com 1 clique
  const cycleSize = () => {
    const currentIndex = COL_STEPS.indexOf(config.colSpan);
    const nextIndex = (currentIndex + 1) % COL_STEPS.length;
    onUpdateColSpan(config.id, COL_STEPS[nextIndex]);
  };

  return (
    <div
      ref={containerRef}
      data-card-id={config.id}
      onPointerDown={handleCardPointerDown}
      style={{
        transform: isFreeDragging
          ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`
          : undefined,
        zIndex: isFreeDragging ? 90 : isSelected ? 40 : 1,
      }}
      className={`${getColSpanClass(activeSpan)} relative transition-all duration-200 ${
        isCustomizing
          ? isSelected
            ? 'ring-2 ring-blue-500 dark:ring-blue-400 rounded-2xl select-none group/figma shadow-xl'
            : 'hover:ring-1 hover:ring-blue-300 dark:hover:ring-blue-600/70 rounded-2xl cursor-pointer'
          : ''
      } ${isFreeDragging ? 'opacity-85 scale-[1.02] shadow-2xl cursor-grabbing' : 'opacity-100'} ${className}`}
    >
      {/* Guia Magnética quando outro card é arrastado sobre este */}
      {hoverTargetId === config.id && (
        <div className="absolute inset-0 z-50 rounded-2xl border-2 border-dashed border-blue-500 bg-blue-500/10 backdrop-blur-2xs flex items-center justify-center pointer-events-none animate-pulse">
          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-xl shadow-lg flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Encaixar nesta posição
          </span>
        </div>
      )}

      {/* CONTROLES ESTILO FIGMA (SOMENTE APARECEM NO CARD SELECIONADO) */}
      {isCustomizing && isSelected && (
        <>
          {/* 4 Nós de Canto (Noroeste, Nordeste, Sudoeste, Sudeste) */}
          <div
            onPointerDown={handleCornerResize}
            className="figma-control absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white dark:bg-zinc-900 border-2 border-blue-500 rounded-[2px] cursor-nwse-resize z-50 shadow-md hover:scale-125 transition-transform"
            title="Redimensionar tamanho"
          />
          <div
            onPointerDown={handleCornerResize}
            className="figma-control absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white dark:bg-zinc-900 border-2 border-blue-500 rounded-[2px] cursor-nesw-resize z-50 shadow-md hover:scale-125 transition-transform"
            title="Redimensionar tamanho"
          />
          <div
            onPointerDown={handleCornerResize}
            className="figma-control absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white dark:bg-zinc-900 border-2 border-blue-500 rounded-[2px] cursor-nesw-resize z-50 shadow-md hover:scale-125 transition-transform"
            title="Redimensionar tamanho"
          />
          <div
            onPointerDown={handleCornerResize}
            className="figma-control absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white dark:bg-zinc-900 border-2 border-blue-500 rounded-[2px] cursor-nwse-resize z-50 shadow-md hover:scale-125 transition-transform"
            title="Redimensionar tamanho"
          />

          {/* Alça Lateral Direita de Redimensionamento */}
          <div
            onPointerDown={handleCornerResize}
            className="figma-control absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-12 bg-white dark:bg-zinc-900 border-2 border-blue-500 rounded-full flex items-center justify-center cursor-ew-resize z-50 shadow-lg hover:scale-110 active:scale-125 transition-transform"
            title="Arraste para redimensionar a largura"
          >
            <div className="w-0.5 h-4 bg-blue-500 rounded-full" />
          </div>

          {/* Barra Flutuante de Ações e Configurações no Topo do Card Selecionado */}
          <div className="figma-control absolute -top-8 left-0 right-0 z-50 flex items-center justify-between px-2 text-xs pointer-events-auto">
            {/* Tag de Título e Mover */}
            <div className="flex items-center gap-1.5 bg-blue-600 text-white px-2.5 py-1 rounded-t-lg font-bold shadow-md">
              <Move className="w-3 h-3 opacity-90" />
              <span className="truncate max-w-[150px]">{config.title}</span>
              <span className="bg-black/25 px-1.5 py-0.2 rounded text-[10px] font-mono">
                {getColSpanLabel(config.colSpan)}
              </span>
            </div>

            {/* Ações: Configurar, Mover, Tamanho, Ocultar */}
            <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 px-2 py-0.5 rounded-t-lg shadow-md">
              {/* Botão Configurações Internas (Ícones, Detalhes, etc.) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen((prev) => !prev)}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    isSettingsOpen
                      ? 'bg-blue-500 text-white'
                      : 'hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                  title="Configurar elementos internos do card"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>

                {/* Popover de Configuração Interna do Card */}
                {isSettingsOpen && (
                  <div className="figma-popover absolute top-full right-0 mt-1 w-64 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-3 z-50 space-y-2.5 text-xs">
                    <div className="font-bold text-slate-900 dark:text-zinc-100 flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-zinc-800 text-[11px] uppercase tracking-wider">
                      <span>Personalizar Card</span>
                    </div>

                    {/* Alternador de Ícones */}
                    <label className="flex items-center justify-between cursor-pointer py-1">
                      <span className="text-slate-700 dark:text-zinc-300">Exibir Ícones</span>
                      <input
                        type="checkbox"
                        checked={settings.showIcons !== false}
                        onChange={(e) => onUpdateSettings(config.id, { showIcons: e.target.checked })}
                        className="rounded border-slate-300 dark:border-zinc-700 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </label>

                    {/* Alternador de Detalhes Secundários */}
                    <label className="flex items-center justify-between cursor-pointer py-1">
                      <span className="text-slate-700 dark:text-zinc-300">Detalhes & Legendas</span>
                      <input
                        type="checkbox"
                        checked={settings.showDetails !== false}
                        onChange={(e) => onUpdateSettings(config.id, { showDetails: e.target.checked })}
                        className="rounded border-slate-300 dark:border-zinc-700 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </label>

                    {/* Modo Compacto */}
                    <label className="flex items-center justify-between cursor-pointer py-1">
                      <span className="text-slate-700 dark:text-zinc-300">Tipografia Compacta</span>
                      <input
                        type="checkbox"
                        checked={!!settings.compactMode}
                        onChange={(e) => onUpdateSettings(config.id, { compactMode: e.target.checked })}
                        className="rounded border-slate-300 dark:border-zinc-700 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </label>

                    {/* Atalhos Rápidos de Largura */}
                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <span className="text-[10px] text-slate-500 font-bold block mb-1">
                        Largura Rápida
                      </span>
                      <div className="grid grid-cols-4 gap-1 text-[10px]">
                        {[
                          { span: 3 as DashboardColSpan, label: '25%' },
                          { span: 4 as DashboardColSpan, label: '33%' },
                          { span: 6 as DashboardColSpan, label: '50%' },
                          { span: 12 as DashboardColSpan, label: '100%' },
                        ].map((p) => (
                          <button
                            key={p.span}
                            type="button"
                            onClick={() => onUpdateColSpan(config.id, p.span)}
                            className={`py-1 rounded-md font-bold transition-colors cursor-pointer text-center ${
                              config.colSpan === p.span
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mover Card */}
              <button
                type="button"
                onClick={() => onMoveCard(config.id, 'up')}
                className="p-1 hover:text-blue-500 cursor-pointer"
                title="Mover para cima"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onMoveCard(config.id, 'down')}
                className="p-1 hover:text-blue-500 cursor-pointer"
                title="Mover para baixo"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Ciclo de Tamanho */}
              <button
                type="button"
                onClick={cycleSize}
                className="p-1 hover:text-blue-500 cursor-pointer"
                title="Alternar tamanho"
              >
                {config.colSpan === 12 ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Ocultar */}
              <button
                type="button"
                onClick={() => onToggleVisibility(config.id)}
                className="p-1 hover:text-rose-500 cursor-pointer"
                title="Ocultar card"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tooltip flutuante de Redimensionamento em tempo real */}
          {isResizing && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1.5 rounded-xl shadow-2xl font-bold text-xs pointer-events-none z-50 flex items-center gap-2 animate-pulse">
              <span>Largura:</span>
              <span className="font-mono">{getColSpanLabel(activeSpan)}</span>
            </div>
          )}
        </>
      )}

      {/* Conteúdo Real do Card Envolvido com Provedor de Layout */}
      <CardLayoutProvider
        value={{
          colSpan: activeSpan,
          settings,
          isSelected,
          isCustomizing,
        }}
      >
        <div
          className={`h-full ${
            activeSpan <= 4 ? 'card-compact text-xs' : ''
          } ${settings.compactMode ? 'text-xs' : ''}`}
        >
          {children}
        </div>
      </CardLayoutProvider>
    </div>
  );
};
