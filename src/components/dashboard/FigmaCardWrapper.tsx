'use client';

import React, { useState, useRef, useLayoutEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Maximize2,
  Minimize2,
  Sliders,
  Move
} from 'lucide-react';
import { DashboardCardConfig, DashboardColSpan, CardInternalSettings } from '@/types/dashboardLayout';
import { CardLayoutProvider } from './CardLayoutContext';
import { useCardCanvas } from './CardCanvas';

interface FigmaCardWrapperProps {
  summary: string;
  compactIcon: React.ReactNode;
  compactContent?: React.ReactNode;
  config: DashboardCardConfig;
  isCustomizing: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdateSettings: (id: string, settings: Partial<CardInternalSettings>) => void;
  onToggleVisibility: (id: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const FigmaCardWrapper: React.FC<FigmaCardWrapperProps> = ({
  config,
  summary,
  compactContent,
  compactIcon,
  isCustomizing,
  isSelected,
  onSelect,
  onUpdateSettings,
  onToggleVisibility,
  children,
  className = '',
}) => {
  const wrapper = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [details, setDetails] = useState(false);
  const [compact, setCompact] = useState(false);
  const isKpi = config.id.startsWith('stats_kpi');
  const complex = ['home_raiox_areas', 'home_retomada', 'stats_habits', 'stats_evolucao'].includes(config.id);
  useLayoutEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const check = () => {
      const {width, height} = el.getBoundingClientRect();
      const fixed = Boolean(el.style.height);
      setCompact(width < (isKpi ? 208 : complex ? 300 : 238) ||
        (fixed && height < (isKpi ? 132 : complex ? 290 : 190)));
    };
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isKpi, complex]);
  // Cards with long labels or larger text can outgrow even the regular-size layout.
  useLayoutEffect(() => {
    if (compact || !wrapper.current?.style.height) return;
    const content = wrapper.current.querySelector<HTMLElement>('.card-fluid-container');
    if (!content) return;
    const check = () => {
      if (content.scrollHeight > content.clientHeight + 2 || content.scrollWidth > content.clientWidth + 2) {
        setCompact(true);
      }
    };
    check();
    const observer = new ResizeObserver(check);
    if (content.firstElementChild) observer.observe(content.firstElementChild);
    return () => observer.disconnect();
  }, [compact, summary, config.frames, config.customHeight]);
  useLayoutEffect(() => {
    if (details && compact) dialog.current?.showModal();
    else if (details) setDetails(false);
  }, [details, compact]);
  const canvas = useCardCanvas();
  const frame = canvas.frames[config.id];
  const isResizing = canvas.active === config.id;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const activeSpan = frame ? Math.max(1,Math.min(12,Math.round(frame.width*12))) as DashboardColSpan : config.colSpan;
  const activeHeight = frame?.height ?? config.customHeight;
  const onUpdateColSpan = (id: string, span: DashboardColSpan) => canvas.preset(id,span);
  const onUpdateHeight = (id: string, height?: number) => canvas.preset(id,undefined,height);
  const isCompactHeight = Boolean(activeHeight && activeHeight < 145);
  const isUltraCompactHeight = Boolean(activeHeight && activeHeight < 105);
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
    const pct = Math.round((frame?.width ?? span / 12) * 100);
    const heightStr = height ? ` • ${Math.round(height)}px` : '';
    return `${pct}%${heightStr}`;
  };

  const handleResizeStart = (e: React.PointerEvent, x: 'left'|'right'|'none', y: 'top'|'bottom'|'none') => {
    e.preventDefault();
    e.stopPropagation();
    canvas.start(e,config,x,y);
  };
  const handleCardPointerDown = (e: React.PointerEvent) => {
    if (!isCustomizing) return;
    const target = e.target as HTMLElement;
    const handle = target.closest('.figma-drag-handle');
    if (!handle && target.closest('.figma-control,.figma-popover')) return;
    onSelect(config.id);
    if (e.pointerType !== 'touch' || handle) canvas.start(e,config,'none','none');
  };

  // CICLO DE TAMANHO ADAPTATIVO: ALTURA NO MOBILE (< 768px) E COLUNAS NO DESKTOP (>= 768px)
  const cycleSize = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    if (isMobile) {
      // Ciclo de altura no mobile: Compacto (140px) -> Médio (260px) -> Auto (undefined)
      if (!activeHeight) {
        onUpdateHeight(config.id, 140);
      } else if (activeHeight <= 160) {
        onUpdateHeight(config.id, 260);
      } else {
        onUpdateHeight(config.id, undefined);
      }
      return;
    }

    // Ciclo de largura no desktop
    const rawPresets: DashboardColSpan[] = [3, 4, 6, 8, 12];
    const minSpan = config.minColSpan || 2;
    const presets = rawPresets.filter((p) => p >= minSpan);
    const currentIndex = presets.indexOf(activeSpan);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % presets.length : 0;
    onUpdateColSpan(config.id, presets[nextIndex]);
  };

  return (
    <div
      ref={wrapper}
      data-card-id={config.id}
      onPointerDown={handleCardPointerDown}
      onClickCapture={(e) => {
        if (isCustomizing) {
          const target = e.target as HTMLElement;
          if (!target.closest('.figma-control') && !target.closest('.figma-popover')) {
            e.stopPropagation();
            e.preventDefault();
          }
        }
      }}
      style={
        {
          height: activeHeight ? `${activeHeight}px` : undefined,
          minHeight: activeHeight ? `${activeHeight}px` : undefined,
          maxHeight: activeHeight ? `${activeHeight}px` : undefined,
          alignSelf: 'start',
          ...(frame ? {position:'absolute', gridArea:'auto', left: (frame.x*100)+'%', top:frame.y, width:(frame.width*100)+'%'} : {}),
          '--figma-col-span': `span ${activeSpan} / span ${activeSpan}`,
          '--figma-tablet-span': activeSpan <= 6 ? 'span 6 / span 6' : 'span 12 / span 12',
          zIndex: isSelected ? 40 : 1,
        } as React.CSSProperties
      }
      className={`figma-card-wrapper ${activeHeight ? 'has-custom-height' : ''} self-start flex flex-col ${isResizing ? 'is-resizing select-none' : ''} ${isCompactHeight ? 'figma-compact-height' : ''} ${isUltraCompactHeight ? 'figma-ultracompact-height' : ''} ${getColSpanClass(activeSpan)} @container relative ${
        isCustomizing
          ? isSelected
            ? 'ring-2 ring-blue-500 dark:ring-blue-400 rounded-2xl select-none group/figma shadow-xl'
            : 'hover:ring-1 hover:ring-blue-300 dark:hover:ring-blue-600/70 rounded-2xl cursor-pointer'
          : ''
      } ${className}`}
    >
      {/* CONTROLES ESTILO FIGMA (SOMENTE NO CARD SELECIONADO COM ALÇAS TOUCH-FIRST 44PX) */}
      {isCustomizing && isSelected && (
        <>
          {/* NÓ DO CANTO SUPERIOR ESQUERDO (NW) */}
          <div
            onPointerDown={(e) => handleResizeStart(e, 'left', 'top')}
            className="figma-control absolute -top-1.5 -left-1.5 w-3 h-3 bg-white dark:bg-zinc-900 border-2 border-blue-600 rounded-full cursor-nwse-resize z-25 shadow-xs hover:scale-150 transition-transform pointer-events-auto touch-none before:absolute before:-inset-3.5 before:content-['']"
            title="Redimensionar (diagonal)"
          />

          {/* NÓ DO CANTO INFERIOR ESQUERDO (SW) */}
          <div
            onPointerDown={(e) => handleResizeStart(e, 'left', 'bottom')}
            className="figma-control absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white dark:bg-zinc-900 border-2 border-blue-600 rounded-full cursor-nesw-resize z-25 shadow-xs hover:scale-150 transition-transform pointer-events-auto touch-none before:absolute before:-inset-3.5 before:content-['']"
            title="Redimensionar (diagonal)"
          />

          {/* ALÇA LATERAL ESQUERDA */}
          <div
            onPointerDown={(e) => handleResizeStart(e, 'left', 'none')}
            className="figma-control absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-500 hover:bg-blue-600 rounded-full cursor-ew-resize z-25 shadow-xs hover:w-2 transition-all touch-none before:absolute before:-inset-3 before:content-['']"
            title="Redimensionar largura"
          />

          {/* NÓ DO CANTO SUPERIOR DIREITO (NE) */}
          <div
            onPointerDown={(e) => handleResizeStart(e, 'right', 'top')}
            className="figma-control absolute -top-1.5 -right-1.5 w-3 h-3 bg-white dark:bg-zinc-900 border-2 border-blue-600 rounded-full cursor-nesw-resize z-25 shadow-xs hover:scale-150 transition-transform pointer-events-auto touch-none before:absolute before:-inset-3.5 before:content-['']"
            title="Redimensionar (diagonal)"
          />

          {/* NÓ DO CANTO INFERIOR DIREITO (SE) */}
          <div
            onPointerDown={(e) => handleResizeStart(e, 'right', 'bottom')}
            className="figma-control absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white dark:bg-zinc-900 border-2 border-blue-600 rounded-full cursor-nwse-resize z-25 shadow-xs hover:scale-150 transition-transform pointer-events-auto touch-none before:absolute before:-inset-3.5 before:content-['']"
            title="Redimensionar (diagonal)"
          />

          {/* ALÇA LATERAL DIREITA */}
          <div
            onPointerDown={(e) => handleResizeStart(e, 'right', 'none')}
            className="figma-control absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-500 hover:bg-blue-600 rounded-full cursor-ew-resize z-25 shadow-xs hover:w-2 transition-all touch-none before:absolute before:-inset-3 before:content-['']"
            title="Redimensionar largura"
          />

          {/* ALÇA INFERIOR CENTRAL */}
          <div
            onPointerDown={(e) => handleResizeStart(e, 'none', 'bottom')}
            onDoubleClick={(e) => {
              e.stopPropagation();
              onUpdateHeight(config.id);
            }}
            className="figma-control absolute -bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-10 bg-blue-500 hover:bg-blue-600 rounded-full cursor-ns-resize z-25 shadow-xs hover:h-2 transition-all touch-none before:absolute before:-inset-3 before:content-['']"
            title="Arraste para ajustar altura (duplo clique para auto-conformar à ferramenta)"
          />

          {/* ALÇA SUPERIOR CENTRAL */}
          <div
            onPointerDown={(e) => handleResizeStart(e, 'none', 'top')}
            className="figma-control absolute -top-1 left-1/2 -translate-x-1/2 h-1.5 w-10 bg-blue-500 hover:bg-blue-600 rounded-full cursor-ns-resize z-25 shadow-xs hover:h-2 transition-all touch-none before:absolute before:-inset-3 before:content-['']"
            title="Arraste para ajustar altura superior"
          />

          {/* BARRA SUPERIOR DE AÇÕES RESPONSIVA NO TOPO DO CARD SELECIONADO */}
          <div className="figma-control absolute -top-8 left-0 right-0 z-25 flex items-center justify-between px-1 sm:px-2 text-xs pointer-events-auto max-w-full overflow-visible">
            {/* Tag de Título e Alça de Drag Dedicada */}
            <div className="figma-drag-handle touch-none flex items-center gap-1 sm:gap-1.5 bg-blue-600 text-white px-2 sm:px-2.5 py-1 rounded-t-lg font-bold shadow-md min-w-0 shrink cursor-grab active:cursor-grabbing">
              <Move className="w-3 h-3 opacity-90 shrink-0" />
              <span className="truncate max-w-[90px] sm:max-w-[150px]">{config.title}</span>
              <span className="bg-black/25 px-1.5 py-0.2 rounded text-[10px] font-mono hidden xs:inline-block shrink-0">
                {getDimensionsLabel(activeSpan, activeHeight)}
              </span>
            </div>

            {/* Ações: Configurar, Mover, Tamanho, Ocultar */}
            <div className="flex items-center gap-0.5 sm:gap-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 px-1.5 sm:px-2 py-0.5 rounded-t-lg shadow-md shrink-0">
              {/* Botão Configurações Internas */}
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

                {/* Popover / Bottom Sheet Responsivo */}
                {isSettingsOpen && (
                  <>
                    {/* Backdrop para fechar ao tocar fora no mobile */}
                    <div
                      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs sm:hidden"
                      onClick={() => setIsSettingsOpen(false)}
                    />

                    <div className="figma-popover fixed inset-x-3 bottom-22 z-50 sm:absolute sm:top-full sm:right-0 sm:bottom-auto sm:inset-x-auto sm:mt-1 w-auto sm:w-64 max-w-[calc(100vw-24px)] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-3 space-y-2.5 text-xs animate-in zoom-in-95 duration-150">
                      <div className="font-bold text-slate-900 dark:text-zinc-100 flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-zinc-800 text-[11px] uppercase tracking-wider">
                        <span>Personalizar Card</span>
                        <button
                          type="button"
                          onClick={() => setIsSettingsOpen(false)}
                          className="sm:hidden text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs font-bold px-1"
                        >
                          ✕
                        </button>
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
                          Largura (Desktop)
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
                                activeSpan === p.span
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
                              onClick={() => onUpdateHeight(config.id, p.h)}
                              className={`py-1 rounded-md font-bold transition-colors cursor-pointer text-center ${
                                (!activeHeight && p.h === undefined) || activeHeight === p.h
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
                  </>
                )}
              </div>

              {/* Mover Card */}
              <button
                type="button"
                onClick={() => canvas.move(config.id, 'up')}
                className="p-1 hover:text-blue-500 cursor-pointer"
                title="Mover para cima"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => canvas.move(config.id, 'down')}
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
                {activeSpan === 12 ? (
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
            if (isCustomizing) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          className={`h-full w-full flex flex-col flex-1 transition-all duration-200 card-fluid-container overflow-hidden min-w-0 max-w-full ${
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
          {compact ? (
            <>
              <div className="card-summary">
                <button type="button" className="mini-heading" aria-haspopup="dialog"
                  aria-label={config.title + '. Abrir card completo'} onClick={() => setDetails(true)}>
                  {settings.showIcons !== false && compactIcon}
                  {config.title}
                </button>
                {compactContent ?? <strong>{summary}</strong>}
              </div>
              {details && <dialog ref={dialog} className="card-details" aria-label={config.title}
                onClose={() => setDetails(false)}>
                <button type="button" className="card-details-close" onClick={() => dialog.current?.close()}>Fechar</button>
                {children}
              </dialog>}
            </>
          ) : children}
        </div>
      </CardLayoutProvider>
    </div>
  );
};
