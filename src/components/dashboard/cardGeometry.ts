export type ScreenLayout = 'phone' | 'tablet' | 'desktop';
export interface CardRect { x: number; y: number; width: number; height: number }
export type CardRects = Record<string, CardRect>;
export type SavedRects = Partial<Record<ScreenLayout, CardRect>>;
export type EdgeX = 'left' | 'right' | 'none';
export type EdgeY = 'top' | 'bottom' | 'none';

export function validRect(rect: CardRect | undefined): rect is CardRect {
  return !!rect && [rect.x, rect.y, rect.width, rect.height].every(Number.isFinite)
    && rect.x >= 0 && rect.y >= 0 && rect.width > 0 && rect.height > 0;
}

export function resizeRect(start: CardRect, dx: number, dy: number, edgeX: EdgeX,
  edgeY: EdgeY, width: number, minWidth: number, minHeight: number, maxHeight: number): CardRect {
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  const right = start.x + start.width;
  const bottom = start.y + start.height;
  if (edgeX === 'none' && edgeY === 'none') {
    return { ...start, x: clamp(start.x + dx, 0, width - start.width), y: Math.max(0, start.y + dy) };
  }
  const x = edgeX === 'left' ? clamp(start.x + dx, 0, right - Math.min(start.width, minWidth)) : start.x;
  const y = edgeY === 'top' ? clamp(start.y + dy, Math.max(0, bottom - maxHeight), bottom - Math.min(start.height, minHeight)) : start.y;
  return { x, y, width: edgeX === 'right' ? clamp(start.width + dx, Math.min(start.width,minWidth), width - x) : right - x,
    height: edgeY === 'bottom' ? clamp(start.height + dy, Math.min(start.height,minHeight), maxHeight) : bottom - y };
}

// Resolve collisions from the original snapshot each time so reversing a gesture restores the neighbors.
export function placeCard(original: CardRects, id: string, rect: CardRect, gap: number): CardRects {
  const result: CardRects = { [id]: rect };
  for (const [key, initial] of Object.entries(original).sort((a,b) => a[1].y-b[1].y)) {
    if (key === id) continue;
    let y = initial.y;
    for (const other of Object.values(result).sort((a,b) => a.y-b.y)) {
      if (initial.x < other.x + other.width - 0.5 && other.x < initial.x + initial.width - 0.5
        && y < other.y + other.height - 0.5 && other.y < y + initial.height - 0.5) {
        y = other.y + other.height + gap;
      }
    }
    result[key] = {...initial, y};
  }
  return result;
}
