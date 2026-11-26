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

export interface StickyPostIt {
  id: string
  x: number
  y: number
  text: string
  colorIdx: number
  minimized: boolean
}

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
    }).catch((error: unknown) => {
      connection = undefined
      throw error
    })
  }
  return connection
}

const syncTimers = new Map<string, ReturnType<typeof setTimeout>>()

export function getSynchronousLocalInk(document: string, attemptNumber = 1): InkStroke[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(`study-ink-fast:${document}:att-${attemptNumber}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return []
}

export function setSynchronousLocalInk(document: string, attemptNumber = 1, strokes: InkStroke[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`study-ink-fast:${document}:att-${attemptNumber}`, JSON.stringify(strokes))
  } catch {}
}

export function readNotes(document: string, attemptNumber = 1): StickyPostIt[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(`study-ink-notes:${document}:att-${attemptNumber}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return []
}

export function saveNotes(document: string, attemptNumber = 1, notes: StickyPostIt[]) {
  if (typeof window === 'undefined') return
  try {
    if (notes.length === 0) {
      localStorage.removeItem(`study-ink-notes:${document}:att-${attemptNumber}`)
    } else {
      localStorage.setItem(`study-ink-notes:${document}:att-${attemptNumber}`, JSON.stringify(notes))
    }
  } catch {}
}

export async function readInk(
  document: string,
  attemptNumber = 1,
  options?: { syncCloud?: boolean }
): Promise<InkStroke[]> {
  const docKey = `${document}:att-${attemptNumber}`

  // 0. Fast synchronous localStorage read (0ms latency / zero flicker)
  const cached = getSynchronousLocalInk(document, attemptNumber)
  if (cached.length > 0) {
    return cached
  }

  const db = await database()

  // 1. Local IndexedDB read
  const localStrokes: InkStroke[] = await new Promise((resolve, reject) => {
    const request = db.transaction('strokes').objectStore('strokes').index('document').getAll(docKey)
    request.onsuccess = () => resolve(request.result.sort((a: InkStroke, b: InkStroke) => a.created - b.created))
    request.onerror = () => reject(request.error)
  })

  if (localStrokes.length > 0) {
    setSynchronousLocalInk(document, attemptNumber, localStrokes)
    return localStrokes
  }

  // 2. Cloud fallback (Supabase) only for authenticated users (prevents 401 console errors for guests)
  const canSyncCloud = options?.syncCloud !== false
  if (canSyncCloud && typeof window !== 'undefined' && typeof fetch === 'function') {
    try {
      const res = await fetch(
        `/api/student/ink?document_id=${encodeURIComponent(document)}&attempt_number=${attemptNumber}`
      )
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.strokes) && data.strokes.length > 0) {
          setSynchronousLocalInk(document, attemptNumber, data.strokes)
          await saveInk(document, { before: [], after: data.strokes }, attemptNumber, false)
          return data.strokes.sort((a: InkStroke, b: InkStroke) => a.created - b.created)
        }
      }
    } catch {
      // Network/offline fallback: preserve local state
    }
  }

  return []
}

export async function saveInk(
  document: string,
  change: InkChange,
  attemptNumber = 1,
  shouldSyncToCloud = true
) {
  // 0. Synchronous localStorage update for 0ms reload latency
  const currentFast = getSynchronousLocalInk(document, attemptNumber)
  const updatedFast = applyInk(currentFast, change)
  setSynchronousLocalInk(document, attemptNumber, updatedFast)

  const docKey = `${document}:att-${attemptNumber}`
  const db = await database()

  // 1. Immediate IndexedDB write
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('strokes', 'readwrite')
    const store = tx.objectStore('strokes')
    for (const stroke of change.before) store.delete([docKey, stroke.id])
    for (const stroke of change.after) store.put({ ...stroke, document: docKey })
    tx.oncomplete = () => resolve()
    tx.onabort = () => reject(tx.error)
  })

  // 2. Debounced cloud sync
  if (shouldSyncToCloud && typeof window !== 'undefined' && typeof fetch === 'function') {
    const existing = syncTimers.get(docKey)
    if (existing) clearTimeout(existing)

    const timer = setTimeout(async () => {
      syncTimers.delete(docKey)
      try {
        const allStrokes: InkStroke[] = await new Promise((resolve) => {
          const req = db.transaction('strokes').objectStore('strokes').index('document').getAll(docKey)
          req.onsuccess = () => resolve(req.result || [])
          req.onerror = () => resolve([])
        })

        await fetch('/api/student/ink', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            document_id: document,
            attempt_number: attemptNumber,
            strokes: allStrokes
          })
        })
      } catch {
        // Offline-tolerant: IndexedDB retains everything locally
      }
    }, 1200)

    syncTimers.set(docKey, timer)
  }
}

export function applyInk(strokes: InkStroke[], change: InkChange) {
  const removed = new Set([...change.before, ...change.after].map(stroke => stroke.id))
  return [...strokes.filter(stroke => !removed.has(stroke.id)), ...change.after].sort((a, b) => a.created - b.created)
}

export function touchesInk(stroke: InkStroke, point: InkPoint, radius: number) {
  return stroke.points.some((end, index) => {
    const start = stroke.points[Math.max(0, index - 1)]
    const dx = end.x - start.x
    const dy = end.y - start.y
    const length = dx * dx + dy * dy
    const t = length ? Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / length)) : 0
    return Math.hypot(point.x - start.x - t * dx, point.y - start.y - t * dy) <= radius + stroke.width / 2
  })
}

export function touchesInkSegment(stroke: InkStroke, from: InkPoint, to: InkPoint, radius: number): boolean {
  if (!stroke.points.length) return false
  const pad = radius + stroke.width / 2
  const segMinX = Math.min(from.x, to.x) - pad
  const segMaxX = Math.max(from.x, to.x) + pad
  const segMinY = Math.min(from.y, to.y) - pad
  const segMaxY = Math.max(from.y, to.y) + pad

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const pt of stroke.points) {
    if (pt.x < minX) minX = pt.x
    if (pt.x > maxX) maxX = pt.x
    if (pt.y < minY) minY = pt.y
    if (pt.y > maxY) maxY = pt.y
  }
  if (maxX < segMinX || minX > segMaxX || maxY < segMinY || minY > segMaxY) {
    return false
  }

  const dist = Math.hypot(to.x - from.x, to.y - from.y)
  if (dist < 1) return touchesInk(stroke, to, radius)
  const steps = Math.max(1, Math.ceil(dist / Math.max(2, radius * 0.5)))
  for (let s = 0; s <= steps; s++) {
    const t = s / steps
    const p: InkPoint = {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
      force: 1
    }
    if (touchesInk(stroke, p, radius)) return true
  }
  return false
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
      const p = {
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t,
        force: start.force + (end.force - start.force) * t
      }
      if (touchesInk(eraser, p, stroke.width / 2)) {
        changed = true
        if (fragment.length >= 2) {
          fragments.push(fragment)
        } else if (fragment.length === 1) {
          fragments.push([fragment[0], { ...fragment[0], x: fragment[0].x + 0.2 }])
        }
        fragment = []
      } else {
        fragment.push(p)
      }
    }
  }
  if (!changed) return [stroke]
  if (fragment.length >= 2) {
    fragments.push(fragment)
  } else if (fragment.length === 1) {
    fragments.push([fragment[0], { ...fragment[0], x: fragment[0].x + 0.2 }])
  }
  return fragments.map(points => ({ ...stroke, id: crypto.randomUUID(), points }))
}

export function insideLasso(point: InkPoint, vertices: InkPoint[]) {
  let inside = false
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const a = vertices[i]
    const b = vertices[j]
    if ((a.y > point.y) !== (b.y > point.y) && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside
    }
  }
  return inside
}

export function projectInk(stroke: InkStroke, blocks: Record<string, InkBox>): InkStroke {
  if (!stroke.anchor) return stroke
  const prior = stroke.anchor.box
  const now = blocks[stroke.anchor.block]
  if (!now || !prior.width || !prior.height) return stroke
  if (prior.x === now.x && prior.y === now.y && prior.width === now.width && prior.height === now.height) return stroke
  const minorWidthChange = Math.abs(now.width - prior.width) <= prior.width * 0.15
  const dx = now.x - prior.x
  const dy = now.y - prior.y
  return {
    ...stroke,
    anchor: { block: stroke.anchor.block, box: now },
    points: stroke.points.map((p) =>
      minorWidthChange
        ? { ...p, x: p.x + dx, y: p.y + dy }
        : {
            ...p,
            x: now.x + ((p.x - prior.x) * now.width) / prior.width,
            y: now.y + ((p.y - prior.y) * now.height) / prior.height
          }
    )
  }
}
