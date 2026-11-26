'use client';
import React, { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { DashboardCardConfig } from '@/types/dashboardLayout';
import { placeCard, resizeRect, validRect, type CardRects, type EdgeX, type EdgeY, type ScreenLayout } from './cardGeometry';

const screen = (): ScreenLayout => window.innerWidth < 768 ? 'phone' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
function subscribe(listener: () => void) {
  window.addEventListener('resize', listener);
  return () => window.removeEventListener('resize', listener);
}

interface CanvasControls {
  frames: CardRects;
  active: string | null;
  start: (e: React.PointerEvent, card: DashboardCardConfig, x: EdgeX, y: EdgeY) => void;
  preset: (id: string, span?: number, height?: number) => void;
  move: (id: string, direction: 'up' | 'down') => void;
}
const Canvas = createContext<CanvasControls | null>(null);
export function useCardCanvas() {
  const canvas = useContext(Canvas);
  if (!canvas) throw new Error('CardCanvas is required');
  return canvas;
}

export function CardCanvas({ cards, save, className, children }: {
  cards: DashboardCardConfig[];
  save: (screen: ScreenLayout, frames: CardRects) => void;
  className: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const release = useRef<(() => void) | null>(null);
  const mode = useSyncExternalStore(subscribe, screen, (): ScreenLayout => 'desktop');
  const [preview, setPreview] = useState<{id: string; frames: CardRects} | null>(null);
  useEffect(() => () => release.current?.(), [mode]);
  const stored: CardRects = {};
  for (const card of cards) {
    const r = card.frames?.[mode];
    if (validRect(r)) stored[card.id] = r;
  }
  const frames = preview?.frames ?? stored;
  function snapshot() {
    const grid = ref.current!;
    const bounds = grid.getBoundingClientRect();
    const original: CardRects = {};
    for (const el of grid.querySelectorAll<HTMLElement>(':scope > [data-card-id]')) {
      const r = el.getBoundingClientRect();
      original[el.dataset.cardId!] = {x: r.left-bounds.left, y: r.top-bounds.top, width: r.width, height: r.height};
    }
    return {original, width: bounds.width, gap: parseFloat(getComputedStyle(grid).rowGap) || 0};
  }
  function normalized(rects: CardRects, width: number) {
    return Object.fromEntries(Object.entries(rects).map(([id,r]) => [id, {...r, x: Math.max(0,r.x/width), width: r.width/width}]));
  }
  function start(e: React.PointerEvent, card: DashboardCardConfig, x: EdgeX, y: EdgeY) {
    if (!e.isPrimary || e.button !== 0) return;
    release.current?.();
    const grid = ref.current!;
    const {original,width,gap} = snapshot();
    const base = original[card.id];
    if (!base || !width) return;
    const origin = grid.getBoundingClientRect();
    const sx = e.clientX-origin.left, sy = e.clientY-origin.top, pointer = e.pointerId;
    let next: CardRects | null = null;
    function update(event: PointerEvent) {
      if (event.pointerId !== pointer) return;
      const bounds = grid.getBoundingClientRect();
      let dx = event.clientX-bounds.left-sx, dy = event.clientY-bounds.top-sy;
      if (!next && Math.hypot(dx,dy) < 3) return;
      if (event.shiftKey) { dx = Math.round(dx/8)*8; dy = Math.round(dy/8)*8; }
      const minWidth = card.id.startsWith('stats_kpi') ? 128 : 168;
      const rect = resizeRect(base,dx,dy,x,y,width,minWidth,Math.max(card.minHeight ?? 65, card.id.startsWith('stats_kpi') ? 72 : 104),Math.max(base.height,card.maxHeight ?? 1200));
      next = normalized(placeCard(original,card.id,rect,gap),width);
      setPreview({id:card.id, frames:next});
    }
    function cancel() {
      window.removeEventListener('pointermove',update);
      window.removeEventListener('pointerup',finish);
      window.removeEventListener('pointercancel',cancel);
      window.removeEventListener('blur',cancel);
      window.removeEventListener('keydown',escape);
      setPreview(null);
      release.current = null;
    }
    function escape(event: KeyboardEvent) { if(event.key === 'Escape') cancel(); }
    function finish(event: PointerEvent) {
      if (event.pointerId !== pointer) return;
      update(event);
      if(next) save(mode,next);
      cancel();
    }
    release.current = cancel;
    window.addEventListener('pointermove',update);
    window.addEventListener('pointerup',finish);
    window.addEventListener('pointercancel',cancel);
    window.addEventListener('blur',cancel);
    window.addEventListener('keydown',escape);
  }
  function preset(id: string, span?: number, height?: number) {
    const {original,width,gap} = snapshot();
    const r = {...original[id]};
    if(span) {
      r.width = (width+gap)*span/12-gap;
      r.x = Math.min(r.x,width-r.width);
    } else {
      const el = Array.from(ref.current!.children).find(node => (node as HTMLElement).dataset.cardId === id) as HTMLElement;
      if (height !== undefined) {
        r.height = height;
      } else {
        const previous = el.style.cssText;
        const classes = el.className;
        try {
          el.style.height = 'auto';
          el.style.minHeight = '0';
          el.style.maxHeight = 'none';
          el.classList.remove('has-custom-height','figma-compact-height','figma-ultracompact-height');
          r.height = el.getBoundingClientRect().height;
        } finally {
          el.style.cssText = previous;
          el.className = classes;
        }
      }
    }
    save(mode,normalized(placeCard(original,id,r,gap),width));
  }
  function move(id: string, direction: 'up'|'down') {
    const {original,width,gap} = snapshot();
    const ordered = Object.keys(original).sort((a,b)=>original[a].y-original[b].y || original[a].x-original[b].x);
    const neighbor = ordered[ordered.indexOf(id)+(direction==='up'?-1:1)];
    if (!neighbor) return;
    const a = original[id], b = original[neighbor];
    original[neighbor] = {...b,x:Math.min(a.x,width-b.width),y:a.y};
    save(mode,normalized(placeCard(original,id,{...a,x:Math.min(b.x,width-a.width),y:b.y},gap),width));
  }
  const bottom = Math.max(0,...Object.values(frames).map(r => r.y+r.height));
  const partial = cards.some(c=>!frames[c.id]);
  return <Canvas.Provider value={{frames,active:preview?.id ?? null,start,preset,move}}>
    <div ref={ref} className={className} style={{minHeight:bottom || undefined,paddingTop:bottom && partial ? bottom+16 : undefined}}>
      {children}
    </div>
  </Canvas.Provider>;
}
