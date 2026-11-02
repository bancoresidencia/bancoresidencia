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
  onUpdateHeight?: (id: string, newHeight: number) => void;
  onUpdateSettings: (id: string, settings: Partial<CardInternalSettings>) => void;
  onMoveCard: (id: string, direction: 'up' | 'down') => void;
  onToggleVisibility: (id: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const FigmaCardWrapper: React.FC<FigmaCardWrapperProps> = ({
  config,
  isCustomizing,
  isSelected,
  onSelect,
  onUpdateColSpan,
  onUpdateHeight,
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
  const [previewHeight, setPreviewHeight] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const lastSwapTimeRef = useRef<number>(0);

  const activeSpan = previewColSpan || config.colSpan;
  const activeHeight = previewHeight !== null ? previewHeight : config.customHeight;
  const settings = config.settings || { showIcons: true, showDetails: true, compactMode: false };

  // Mapeia colSpan de 1 a 12 de forma fluida
  const getColSpanClass = (span: DashboardColSpan) => {
    switch (span) {
      case 1:
        return 'col-span-12 sm:col-span-2 lg:col-span-1';
      case 2:
        return 'col-span-12 sm:col-span-4 lg:col-span-2';
      case 3:
        return 'col-span-12 sm:col-span-6 lg:col-span-3';
      case 4:
        return 'col-span-12 sm:col-span-6 lg:col-span-4';
      case 5:
        return 'col-span-12 sm:col-span-6 lg:col-span-5';
      case 6:
        return 'col-span-12 sm:col-span-6 lg:col-span-6';
      case 7:
        return 'col-span-12 lg:col-span-7';
      case 8:
        return 'col-span-12 lg:col-span-8';
      case 9:
        return 'col-span-12 lg:col-span-9';
      case 10:
        return 'col-span-12 lg:col-span-10';
      case 11:
        return 'col-span-12 lg:col-span-11';
      case 12:
      default:
        return 'col-span-12';
    }
  };

  const getDimensionsLabel = (span: DashboardColSpan, height?: number) => {
    const pct = Math.round((span / 12) * 100);
    const heightStr = height ? ` • ${Math.round(height)}px alt` : '';
    return `${span} col (${pct}%)${heightStr}`;
  };

  // REDIMENSIONAMENTO MULTI-DIRECIONAL: Largura (Esquerda/Direita) E Altura (Cima/Baixo)
  const handleResizeStart = useCallback(
    (
      e: React.PointerEvent,
      originX: 'left' | 'right' | 'none',
      originY: 'top' | 'bottom' | 'none'
    ) => {
      e.preventDefault();
      e.stopPropagation();

      const container = containerRef.current;
      if (!container) return;

      const parentGrid = container.parentElement;
      if (!parentGrid) return;

      setIsResizing(true);
      const parentWidth = parentGrid.getBoundingClientRect().width;
      const initialHeight = container.getBoundingClientRect().height;
      const startX = e.clientX;
      const startY = e.clientY;
      const initialSpan = config.colSpan;
      let lastTargetSpan = initialSpan;
      let lastTargetHeight = config.customHeight || initialHeight;

      const onPointerMove = (moveEvent: PointerEvent) => {
        // 1. Cálculo da Largura (Horizontal)
        if (originX !== 'none') {
          const deltaX =
            originX === 'left'
              ? startX - moveEvent.clientX
              : moveEvent.clientX - startX;

          const colWidth = parentWidth / 12;
          // Sensibilidade fluida: snap responsivo a cada 75% da coluna
          const deltaCols = Math.round(deltaX / (colWidth * 0.75));
          const rawNewSpan = initialSpan + deltaCols;
          const minSpan = config.minColSpan || 2;
          const maxSpan = config.maxColSpan || 12;
          const targetSpan = Math.max(minSpan, Math.min(maxSpan, rawNewSpan)) as DashboardColSpan;

          if (targetSpan !== lastTargetSpan) {
            lastTargetSpan = targetSpan;
            setPreviewColSpan(targetSpan);
          }
        }

        // 2. Cálculo da Altura (Vertical)
        if (originY !== 'none') {
          const deltaY =
            originY === 'top'
              ? startY - moveEvent.clientY
              : moveEvent.clientY - startY;

          const rawHeight = initialHeight + deltaY;

          // Permite encolher livremente até 120px e expandir até 850px
          const targetHeight = Math.max(120, Math.min(850, Math.round(rawHeight)));

          if (targetHeight !== lastTargetHeight) {
            lastTargetHeight = targetHeight;
            setPreviewHeight(targetHeight);
            if (container) {
              container.style.height = `${targetHeight}px`;
              container.style.minHeight = `${targetHeight}px`;
            }
          }
        }
      };

      const onPointerUp = () => {
        setIsResizing(false);
        if (container) {
          container.style.height = '';
        }

        if (originX !== 'none' && lastTargetSpan !== config.colSpan) {
          onUpdateColSpan(config.id, lastTargetSpan);
        }
        if (originY !== 'none' && onUpdateHeight) {
          onUpdateHeight(config.id, lastTargetHeight);
        }

        // Transição suave: limpa os previews após commit do estado no componente pai
        setTimeout(() => {
          setPreviewColSpan(null);
          setPreviewHeight(null);
        }, 60);

        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    },
    [config.id, config.colSpan, config.customHeight, config.minColSpan, config.maxColSpan, onUpdateColSpan, onUpdateHeight]
  );

  // ARRASTE LIVRE NO MEIO DO CARD COM TROCA INSTANTÂNEA DE LUGAR (SWAP REAL-TIME)
  const handleCardPointerDown = (e: React.PointerEvent) => {
    if (!isCustomizing) return;

    const target = e.target as HTMLElement;
    // Permite interagir exclusivamente com os nós de redimensionamento e barra de ações
    if (
      target.closest('.figma-control') ||
      target.closest('.figma-popover')
    ) {
      return;
    }

    // Seleciona o card no clique e permite arrastar segurando em qualquer ponto do card
    onSelect(config.id);

    const startX = e.clientX;
    const startY = e.clientY;
    let hasMoved = false;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      if (!hasMoved && Math.hypot(dx, dy) > 6) {
        hasMoved = true;
        setIsFreeDragging(true);
      }

      if (hasMoved) {
        setDragOffset({ x: dx, y: dy });

        // Identifica o card sob o ponteiro do mouse para swap em tempo real
        const elemUnder = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
        const targetCard = elemUnder?.closest('[data-card-id]') as HTMLElement | null;
        const targetId = targetCard?.dataset?.cardId;

        if (targetId && targetId !== config.id) {
          setHoverTargetId(targetId);

          const now = Date.now();
          if (now - lastSwapTimeRef.current > 160) {
            lastSwapTimeRef.current = now;
            onReorder(config.id, targetId);
          }
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
        setHoverTargetId(null);
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Alterna tamanho entre presets respeitando o minColSpan do card
  const cycleSize = () => {
    const rawPresets: DashboardColSpan[] = [3, 4, 6, 8, 12];
    const minSpan = config.minColSpan || 2;
    const presets = rawPresets.filter((p) => p >= minSpan);
    const currentIndex = presets.indexOf(config.colSpan);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % presets.length : 0;
    onUpdateColSpan(config.id, presets[nextIndex]);
  };

  return (
    <div
      ref={containerRef}
      data-card-id={config.id}
      onPointerDown={handleCardPointerDown}
      onClickCapture={(e) => {
        if (isCustomizing) {
          const target = e.target as HTMLElement;
          if (!target.closest(".figma-control") && !target.closest(".figma-popover")) {
            e.stopPropagation();
            e.preventDefault();
          }
        }
      }}
      style={{
        minHeight: activeHeight ? `${activeHeight}px` : undefined,
        height: isResizing && activeHeight ? `${activeHeight}px` : undefined,
        gridColumn: `span ${activeSpan} / span ${activeSpan}`,
        transform: isFreeDragging
          ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`
          : undefined,
        pointerEvents: isFreeDragging ? 'none' : undefined,
        zIndex: isFreeDragging ? 90 : isSelected ? 40 : 1,
        transition: isFreeDragging || isResizing
          ? 'none'
          : 'transform 0.25s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s',
      }}
      className={`figma-card-wrapper ${isResizing ? 'is-resizing select-none' : ''} ${getColSpanClass(activeSpan)} @container relative ${
        isCustomizing
          ? isSelected
            ? 'ring-2 ring-blue-500 dark:ring-blue-400 rounded-2xl select-none group/figma shadow-xl'
            : 'hover:ring-1 hover:ring-blue-300 dark:hover:ring-blue-600/70 rounded-2xl cursor-pointer'
          : ''
      } ${isFreeDragging ? 'opacity-85 scale-[1.02] shadow-2xl cursor-grabbing' : 'opacity-100'} ${className}`}
    >
      {/* Guia Magnética quando outro card passa por cima deste */}
      {hoverTargetId === config.id && (
        <div className="absolute inset-0 z-50 rounded-2xl border-2 border-dashed border-blue-500 bg-blue-500/15 backdrop-blur-2xs flex items-center justify-center pointer-events-none animate-pulse">
          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-xl shadow-lg flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Trocando posição...
          </span>
        </div>
      )}

      {/* CONTROLES ESTILO FIGMA (SOMENTE NO CARD SELECIONADO) */}
      {isCustomizing && isSelected && (
        <>
          {/* BOLA DO CANTO SUPERIOR ESQUERDO (NW) - Redimensiona Diagonal */}
          <div
            onPointerDown={(e) => handleResizeStart(e, 'left', 'top')}
            className="figma-control absolute -top-2.5 -left-2.5 w-5 h-5 bg-white dark:bg-zinc-900 border-2 border-blue-600 rounded-full cursor-nwse-resize z-50 shadow-lg hover:scale-125 active:scale-150 transition-transform flex items-center justify-center pointer-events-auto touch-none"
            title="Arraste a bola diagonal para encolher ou aumentar largura e altura"
          >
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full pointer-events-none" />
          </div>

          {/* BOLA DO CANTO INFERIOR ESQUERDO (SW) - Redimensiona Diagonal */}
          <div
            onPointerDown={(e) => handleResizeStart(e, 'left', 'bottom')}
            className="figma-control absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-white dark:bg-zinc-900 border-2 border-blue-600 rounded-full cursor-nesw-resize z-50 shadow-lg hover:scale-125 active:scale-150 transition-transform flex items-center justify-center pointer-events-auto touch-none"
            title="Arraste a bola diagonal para encolher ou aumentar largura e altura"
          >
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full pointer-events-none" />
          </div>

          {/* ALÇA LATERAL ESQUERDA - Apenas Largura */}
          <div
            onPointerDown={(e) => handleResizeStart(e, 'left', 'none')}
            className="figma-control absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-12 bg-white dark:bg-zinc-900 border-2 border-blue-500 rounded-full flex items-center justify-center cursor-ew-resize z-50 shadow-lg hover:scale-110 active:scale-125 transition-transform touch-none"
            title="Arraste para redimensionar a largura pela esquerda"
          >
            <div className="w-0.5 h-4 bg-blue-500 rounded-full pointer-events-none" />
          </div>

          {/* BOLA DO CANTO SUPERIOR DIREITO (NE) - Redimensiona Diagonal */}
          <div
            onPointerDown={(e) => handleResizeStart(e, 'right', 'top')}
            className="figma-control absolute -top-2.5 -right-2.5 w-5 h-5 bg-white dark:bg-zinc-900 border-2 border-blue-600 rounded-full cursor-nesw-resize z-50 shadow-lg hover:scale-125 active:scale-150 transition-transform flex items-center justify-center pointer-events-auto touch-none"
            title="Arraste a bola diagonal para encolher ou aumentar largura e altura"
          >
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full pointer-events-none" />
          </div>

          {/* BOLA DO CANTO INFERIOR DIREITO (SE) - Redimensiona Diagonal */}
          <div
            onPointerDown={(e) => handleResizeStart(e, 'right', 'bottom')}
            className="figma-control absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-white dark:bg-zinc-900 border-2 border-blue-600 rounded-full cursor-nwse-resize z-50 shadow-lg hover:scale-125 active:scale-150 transition-transform flex items-center justify-center pointer-events-auto touch-none"
            title="Arraste a bola diagonal para encolher ou aumentar largura e altura"
          >
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full pointer-events-none" />
          </div>

          {/* ALÇA LATERAL DIREITA - Apenas Largura */}
          <div
            onPointerDown={(e) => handleResizeStart(e, 'right', 'none')}
            className="figma-control absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-12 bg-white dark:bg-zinc-900 border-2 border-blue-500 rounded-full flex items-center justify-center cursor-ew-resize z-50 shadow-lg hover:scale-110 active:scale-125 transition-transform touch-none"
            title="Arraste para redimensionar a largura pela direita"
          >
            <div className="w-0.5 h-4 bg-blue-500 rounded-full pointer-events-none" />
          </div>

          {/* ALÇA INFERIOR CENTRAL - Apenas Altura */}
          <div
            onPointerDown={(e) => handleResizeStart(e, 'none', 'bottom')}
            className="figma-control absolute -bottom-2 left-1/2 -translate-x-1/2 h-4 w-14 bg-white dark:bg-zinc-900 border-2 border-blue-500 rounded-full flex items-center justify-center cursor-ns-resize z-50 shadow-lg hover:scale-110 active:scale-125 transition-transform touch-none"
            title="Arraste para redimensionar a altura"
          >
            <div className="h-0.5 w-5 bg-blue-500 rounded-full pointer-events-none" />
          </div>

          {/* BARRA SUPERIOR DE AÇÕES NO TOPO DO CARD SELECIONADO */}
          <div className="figma-control absolute -top-8 left-0 right-0 z-50 flex items-center justify-between px-2 text-xs pointer-events-auto">
            {/* Tag de Título e Mover */}
            <div className="flex items-center gap-1.5 bg-blue-600 text-white px-2.5 py-1 rounded-t-lg font-bold shadow-md">
              <Move className="w-3 h-3 opacity-90" />
              <span className="truncate max-w-[150px]">{config.title}</span>
              <span className="bg-black/25 px-1.5 py-0.2 rounded text-[10px] font-mono">
                {getDimensionsLabel(activeSpan, activeHeight)}
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

                    {/* Atalhos Rápidos de Altura */}
                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <span className="text-[10px] text-slate-500 font-bold block mb-1">
                        Altura Rápida
                      </span>
                      <div className="grid grid-cols-4 gap-1 text-[10px]">
                        {[
                          { h: undefined, label: 'Auto' },
                          { h: 160, label: '160px' },
                          { h: 250, label: '250px' },
                          { h: 360, label: '360px' },
                        ].map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => onUpdateHeight && onUpdateHeight(config.id, p.h as any)}
                            className={`py-1 rounded-md font-bold transition-colors cursor-pointer text-center ${
                              (!config.customHeight && p.h === undefined) || config.customHeight === p.h
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
              <span>Dimensões:</span>
              <span className="font-mono">{getDimensionsLabel(activeSpan, activeHeight)}</span>
            </div>
          )}
        </>
      )}

      {/* PROVEDOR DE LAYOUT FLUIDO E REATIVO */}
      <CardLayoutProvider
        value={{
          colSpan: activeSpan,
          settings,
          isSelected,
          isCustomizing,
          isExtraSmall: activeSpan <= 3,
          isSmall: activeSpan <= 5,
          isMedium: activeSpan === 6 || activeSpan === 7,
          isLarge: activeSpan >= 8,
        }}
      >
        <div
          onClickCapture={(e) => {
            // BLOQUEIA CLIQUES INTERNOS DURANTE PERSONALIZAÇÃO PARA NUNCA ABRIR DRAWERS OU MODAIS
            if (isCustomizing) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          className={`h-full w-full transition-all duration-200 card-fluid-container ${
            activeSpan <= 3
              ? 'card-xs text-[11px] p-0.5'
              : activeSpan <= 5
              ? 'card-sm text-xs'
              : activeSpan <= 7
              ? 'card-md text-sm'
              : 'card-lg text-base'
          } ${settings.compactMode ? 'text-xs' : ''} ${
            settings.showIcons === false ? 'hide-all-icons' : ''
          } ${settings.showDetails === false ? 'hide-all-details' : ''} ${
            isCustomizing ? 'select-none pointer-events-none' : 'pointer-events-auto'
          }`}
        >
          {children}
        </div>
      </CardLayoutProvider>
    </div>
  );
};
