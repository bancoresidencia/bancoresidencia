export type InkPoint = { x: number; y: number; force: number }
export type InkBox = { x: number; y: number; width: number; height: number }
export type InkStroke = {
  anchor?: { block: string; box: InkBox }
  text?: string
  id: string
  kind: 'pen' | 'marker'
  color: string
  width: number
  opacity: number
  pressure: boolean
  points: InkPoint[]
  created: number
}
export type InkChange = { before: InkStroke[]; after: InkStroke[] }

let connection: Promise<IDBDatabase> | undefined
function database() {
  if (!connection) {
    connection = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('bancoresidencia-private-ink', 1)
      request.onupgradeneeded = () => {
        const store = request.result.createObjectStore('strokes', { keyPath: ['document', 'id'] })
        store.createIndex('document', 'document')
      }
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    }).catch((error: unknown) => { connection = undefined; throw error })
  }
  return connection
}

export async function readInk(document: string): Promise<InkStroke[]> {
  const db = await database()
  return new Promise((resolve, reject) => {
    const request = db.transaction('strokes').objectStore('strokes').index('document').getAll(document)
    request.onsuccess = () => resolve(request.result.sort((a: InkStroke, b: InkStroke) => a.created - b.created))
    request.onerror = () => reject(request.error)
  })
}

export async function saveInk(document: string, change: InkChange) {
  const db = await database()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('strokes', 'readwrite')
    const store = tx.objectStore('strokes')
    for (const stroke of change.before) store.delete([document, stroke.id])
    for (const stroke of change.after) store.put({ ...stroke, document })
    tx.oncomplete = () => resolve()
    tx.onabort = () => reject(tx.error)
  })
}

export function applyInk(strokes: InkStroke[], change: InkChange) {
  const removed = new Set([...change.before, ...change.after].map(stroke => stroke.id))
  return [...strokes.filter(stroke => !removed.has(stroke.id)), ...change.after].sort((a, b) => a.created - b.created)
}

export function touchesInk(stroke: InkStroke, point: InkPoint, radius: number) {
  return stroke.points.some((end, index) => {
    const start = stroke.points[Math.max(0, index - 1)]
    const dx = end.x - start.x, dy = end.y - start.y
    const length = dx * dx + dy * dy
    const t = length ? Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / length)) : 0
    return Math.hypot(point.x - start.x - t * dx, point.y - start.y - t * dy) <= radius + stroke.width / 2
  })
}

export function cutInk(stroke: InkStroke, path: InkPoint[], radius: number): InkStroke[] {
  if (!path.length) return [stroke]
  const eraser = { ...stroke, points: path, width: radius * 2 }
  const fragments: InkPoint[][] = []
  let fragment: InkPoint[] = []
  let changed = false
  for (let i = 0; i < stroke.points.length; i++) {
    const end = stroke.points[i]
    const start = stroke.points[Math.max(0, i - 1)]
    const steps = Math.max(1, Math.ceil(Math.hypot(end.x - start.x, end.y - start.y) / Math.max(1, radius / 2)))
    for (let step = 1; step <= steps; step++) {
      const t = step / steps
      const p = { x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t, force: start.force + (end.force - start.force) * t }
      if (touchesInk(eraser, p, stroke.width / 2)) {
        changed = true
        if (fragment.length) fragments.push(fragment)
        fragment = []
      } else fragment.push(p)
    }
  }
  if (!changed) return [stroke]
  if (fragment.length) fragments.push(fragment)
  return fragments.map(points => ({ ...stroke, id: crypto.randomUUID(), points }))
}

export function insideLasso(point: InkPoint, vertices: InkPoint[]) {
  let inside = false
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const a = vertices[i], b = vertices[j]
    if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside
  }
  return inside
}

export function projectInk(stroke: InkStroke, blocks: Record<string, InkBox>): InkStroke {
  if (!stroke.anchor) return stroke
  const prior = stroke.anchor.box, now = blocks[stroke.anchor.block]
  if (!now || !prior.width || !prior.height) return stroke
  if (prior.x === now.x && prior.y === now.y && prior.width === now.width && prior.height === now.height) return stroke
  return { ...stroke, anchor: { block: stroke.anchor.block, box: now }, points: stroke.points.map(p => ({
    ...p, x: now.x + (p.x - prior.x) * now.width / prior.width, y: now.y + (p.y - prior.y) * now.height / prior.height
  })) }
}

export type OptionTarget = {
  option: string
  center: InkPoint
  box: InkBox
}

export function detectCircleOnOption(stroke: InkStroke, targets: OptionTarget[]): string | null {
  if (stroke.points.length < 5) return null
  const xs = stroke.points.map(p => p.x)
  const ys = stroke.points.map(p => p.y)
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const strokeWidth = maxX - minX, strokeHeight = maxY - minY
  if (strokeWidth < 18 || strokeHeight < 18) return null

  for (const target of targets) {
    const c = target.center
    if (c.x < minX - 35 || c.x > maxX + 35 || c.y < minY - 35 || c.y > maxY + 35) continue

    const inside = insideLasso(c, stroke.points)
    let totalAngle = 0
    for (let i = 1; i < stroke.points.length; i++) {
      const a1 = Math.atan2(stroke.points[i - 1].y - c.y, stroke.points[i - 1].x - c.x)
      const a2 = Math.atan2(stroke.points[i].y - c.y, stroke.points[i].x - c.x)
      let diff = a2 - a1
      while (diff > Math.PI) diff -= 2 * Math.PI
      while (diff < -Math.PI) diff += 2 * Math.PI
      totalAngle += diff
    }
    const turns = Math.abs(totalAngle)

    if (inside || turns >= 4.4) {
      const avgDist = stroke.points.reduce((acc, p) => acc + Math.hypot(p.x - c.x, p.y - c.y), 0) / stroke.points.length
      if (avgDist >= 6 && avgDist <= 130) {
        return target.option
      }
    }
  }
  return null
}

function lineIntersection(p1: InkPoint, p2: InkPoint, p3: InkPoint, p4: InkPoint): InkPoint | null {
  const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x)
  if (Math.abs(d) < 1e-6) return null
  const t = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d
  const u = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d
  if (t >= 0.05 && t <= 0.95 && u >= 0.05 && u <= 0.95) {
    return { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y), force: 1 }
  }
  return null
}

function findSelfIntersection(points: InkPoint[]): InkPoint | null {
  if (points.length < 6) return null
  for (let i = 0; i < points.length - 3; i += 2) {
    for (let j = i + 3; j < points.length - 1; j += 2) {
      const hit = lineIntersection(points[i], points[i + 1], points[j], points[j + 1])
      if (hit) return hit
    }
  }
  return null
}

function findStrokeIntersection(s1: InkStroke, s2: InkStroke): InkPoint | null {
  for (let i = 0; i < s1.points.length - 1; i += 2) {
    for (let j = 0; j < s2.points.length - 1; j += 2) {
      const hit = lineIntersection(s1.points[i], s1.points[i + 1], s2.points[j], s2.points[j + 1])
      if (hit) return hit
    }
  }
  return null
}

export function detectCrossOnOption(current: InkStroke, recent: InkStroke[], targets: OptionTarget[]): string | null {
  if (current.points.length < 2) return null

  // 1. Auto-interseção (X desenhado num único traço)
  const selfHit = findSelfIntersection(current.points)
  if (selfHit) {
    for (const target of targets) {
      if (Math.hypot(selfHit.x - target.center.x, selfHit.y - target.center.y) <= 55) {
        return target.option
      }
    }
  }

  // 2. Interseção entre dois traços recentes (traço 1 cruzando traço 2)
  const now = current.created || Date.now()
  for (const prev of recent) {
    if (now - (prev.created || 0) > 4000) continue
    const hit = findStrokeIntersection(current, prev)
    if (hit) {
      for (const target of targets) {
        if (Math.hypot(hit.x - target.center.x, hit.y - target.center.y) <= 55) {
          return target.option
        }
      }
    }
  }

  // 3. Traço diagonal direto sobre o badge da alternativa
  const first = current.points[0]
  const last = current.points[current.points.length - 1]
  const len = Math.hypot(last.x - first.x, last.y - first.y)
  if (len >= 22 && len <= 100) {
    const mid = { x: (first.x + last.x) / 2, y: (first.y + last.y) / 2 }
    for (const target of targets) {
      if (Math.hypot(mid.x - target.center.x, mid.y - target.center.y) <= 30) {
        // Se houver outro traço recente no mesmo badge formando um X
        for (const prev of recent) {
          if (now - (prev.created || 0) <= 4000) {
            const pFirst = prev.points[0], pLast = prev.points[prev.points.length - 1]
            const pMid = { x: (pFirst.x + pLast.x) / 2, y: (pFirst.y + pLast.y) / 2 }
            if (Math.hypot(pMid.x - target.center.x, pMid.y - target.center.y) <= 35) {
              return target.option
            }
          }
        }
      }
    }
  }

  return null
}

export function detectOptionGesture(
  current: InkStroke,
  recent: InkStroke[],
  targets: OptionTarget[]
): { option: string; type: 'circle' | 'cross' } | null {
  const circleOption = detectCircleOnOption(current, targets)
  if (circleOption) return { option: circleOption, type: 'circle' }

  const crossOption = detectCrossOnOption(current, recent, targets)
  if (crossOption) return { option: crossOption, type: 'cross' }

  return null
}

export function snapMarkerPoint(
  p: InkPoint,
  lastSnappedY: number | null,
  lineThreshold = 22
): { point: InkPoint; snappedY: number } {
  if (lastSnappedY === null) {
    return { point: p, snappedY: p.y }
  }
  if (Math.abs(p.y - lastSnappedY) < lineThreshold) {
    return {
      point: { x: p.x, y: lastSnappedY, force: p.force },
      snappedY: lastSnappedY
    }
  }
  return { point: p, snappedY: p.y }
}
