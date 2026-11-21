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