'use client'

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  Pencil,
  Highlighter,
  Eraser,
  MousePointer,
  Scissors,
  Minus,
  StickyNote,
  Undo2,
  Redo2,
  Trash2,
  X,
  CheckCircle2,
  Check,
  Eye,
  EyeOff,
  Minimize2,
  Move,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  applyInk,
  readInk,
  saveInk,
  touchesInk,
  cutInk,
  insideLasso,
  projectInk,
  detectOptionGesture,
  snapMarkerPoint,
  type OptionTarget,
  type InkBox,
  type InkChange,
  type InkPoint,
  type InkStroke
} from '@/services/studyInk'

export type Tool = 'read' | 'pen' | 'marker' | 'erase' | 'lasso' | 'line' | 'note' | 'gesture'
type Style = Pick<InkStroke, 'color' | 'width' | 'opacity' | 'pressure'>

const pen: Style = { color: 'currentColor', width: 2, opacity: 1, pressure: false }
const marker: Style = { color: '#facc15', width: 20, opacity: 0.35, pressure: false }

const TOOL_DEFS: { id: Tool; label: string; icon: typeof Pencil; hint: string }[] = [
  { id: 'read', label: 'Navegar', icon: MousePointer, hint: 'Rolar página e clicar em alternativas' },
  { id: 'pen', label: 'Caneta', icon: Pencil, hint: 'Escrita livre e rascunhos' },
  { id: 'marker', label: 'Marca-texto', icon: Highlighter, hint: 'Grifo retilíneo sobre o texto' },
  { id: 'erase', label: 'Borracha', icon: Eraser, hint: 'Apagar traços (ou segure o botão da S Pen)' },
  { id: 'line', label: 'Reta', icon: Minus, hint: 'Traço retilíneo' },
  { id: 'lasso', label: 'Laço', icon: Scissors, hint: 'Selecionar e mover traços' },
  { id: 'note', label: 'Nota', icon: StickyNote, hint: 'Inserir post-it médico ancorado' }
]

const COLOR_PRESETS = [
  { name: 'Tema', value: 'currentColor', border: 'border-zinc-400' },
  { name: 'Grafite', value: '#18181b', bg: 'bg-zinc-900' },
  { name: 'Amarelo', value: '#facc15', bg: 'bg-amber-400' },
  { name: 'Verde', value: '#10b981', bg: 'bg-emerald-500' },
  { name: 'Azul', value: '#3b82f6', bg: 'bg-blue-500' },
  { name: 'Rosa', value: '#f43f5e', bg: 'bg-rose-500' },
  { name: 'Roxo', value: '#a855f7', bg: 'bg-purple-500' }
]

const MARKER_COLORS = [
  { name: 'Amarelo', value: '#facc15' },
  { name: 'Verde', value: '#34d399' },
  { name: 'Azul', value: '#60a5fa' },
  { name: 'Rosa', value: '#fb7185' },
  { name: 'Laranja', value: '#fb923c' }
]

const NOTE_COLORS = [
  { name: 'Âmbar', bg: 'bg-amber-950/80 border-amber-600/60 text-amber-100', badge: 'bg-amber-500 text-black' },
  { name: 'Esmeralda', bg: 'bg-emerald-950/80 border-emerald-600/60 text-emerald-100', badge: 'bg-emerald-500 text-black' },
  { name: 'Azul', bg: 'bg-blue-950/80 border-blue-600/60 text-blue-100', badge: 'bg-blue-500 text-white' },
  { name: 'Neutro', bg: 'bg-zinc-900/90 border-zinc-700/70 text-zinc-100', badge: 'bg-zinc-700 text-white' }
]

const unsaved = new Map<string, InkChange[]>()
const histories = new Map<string, { undo: InkChange[]; redo: InkChange[] }>()
const queues = new Map<string, Promise<void>>()

function flush(key: string, attemptNumber = 1) {
  const active = queues.get(key)
  if (active) return active
  const pending = unsaved.get(key) ?? []
  const work = (async () => {
    while (pending.length) {
      await saveInk(key, pending[0], attemptNumber, true)
      pending.shift()
      if (typeof BroadcastChannel !== 'undefined') {
        const notify = new BroadcastChannel('private-study-ink')
        notify.postMessage(key)
        notify.close()
      }
    }
  })().finally(() => queues.delete(key))
  queues.set(key, work)
  return work
}

function scrollAncestor(element: HTMLElement | null, dy: number) {
  if (typeof window === 'undefined') return
  let el = element?.parentElement
  while (el && el !== document.body && el !== document.documentElement) {
    const overflowY = window.getComputedStyle(el).overflowY
    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
      el.scrollBy({ top: dy, left: 0, behavior: 'instant' })
      return
    }
    el = el.parentElement
  }
  window.scrollBy({ top: dy, left: 0, behavior: 'instant' })
}

export interface StickyPostIt {
  id: string
  x: number
  y: number
  text: string
  colorIdx: number
  minimized: boolean
}

function detectScratchOut(stroke: InkStroke): boolean {
  const pts = stroke.points
  if (pts.length < 8 || pts.length > 180) return false

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const p of pts) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  const width = maxX - minX
  const height = maxY - minY
  if (width > 280 || height > 200 || (width < 10 && height < 10)) return false

  let reversalsX = 0, lastDirX = 0
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x
    if (Math.abs(dx) > 3) {
      const dirX = Math.sign(dx)
      if (lastDirX !== 0 && dirX !== lastDirX) reversalsX++
      lastDirX = dirX
    }
  }

  let reversalsY = 0, lastDirY = 0
  for (let i = 1; i < pts.length; i++) {
    const dy = pts[i].y - pts[i - 1].y
    if (Math.abs(dy) > 3) {
      const dirY = Math.sign(dy)
      if (lastDirY !== 0 && dirY !== lastDirY) reversalsY++
      lastDirY = dirY
    }
  }

  return reversalsX >= 3 || reversalsY >= 3
}

type Actions = {
  flip?: () => void
  choose?: (letter: string) => void
  attemptNumber?: number
}

function Editor({
  doc,
  baseDoc,
  owner,
  flip,
  choose,
  attemptNumber = 1
}: {
  doc: string
  baseDoc: string
  owner: string
  attemptNumber?: number
} & Actions) {
  const anchor = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [mounted, setMounted] = useState(false)
  const [tool, setTool] = useState<Tool>('read')
  const [open, setOpen] = useState(false)
  const [dockPosition, setDockPosition] = useState<'right' | 'left' | 'top'>('right')
  const [isDockCollapsed, setIsDockCollapsed] = useState(false)
  const [activeDrawer, setActiveDrawer] = useState<Tool | 'history' | null>(null)
  const [styles, setStyles] = useState({ pen, marker })
  const [onlyPen, setOnlyPen] = useState(true)
  const [onlyMarker, setOnlyMarker] = useState(false)
  const [cut, setCut] = useState(false)
  const [selection, setSelection] = useState<string[]>([])
  const [erasedIds, setErasedIds] = useState<string[]>([])
  const [counts, setCounts] = useState([0, 0])
  const [radius, setRadius] = useState(14)
  const [blocks, setBlocks] = useState<Record<string, InkBox>>({})
  const [storedStrokes, setStrokes] = useState<InkStroke[]>([])
  const strokes = storedStrokes.map(s => projectInk(s, blocks))
  const [previousStrokes, setPreviousStrokes] = useState<InkStroke[]>([])
  const [showPreviousAttempt, setShowPreviousAttempt] = useState(false)
  const [postIts, setPostIts] = useState<StickyPostIt[]>([])
  const [ready, setReady] = useState(false)
  const [status, setStatus] = useState('')
  const [autoGestureEnabled, setAutoGestureEnabled] = useState(true)
  const [straightMarker, setStraightMarker] = useState(true)
  const [eraserCursor, setEraserCursor] = useState<{ x: number; y: number } | null>(null)
  const [gestureFeedback, setGestureFeedback] = useState<string>('')
  const lastToolTapRef = useRef<{ tool: Tool; time: number }>({ tool: 'read', time: 0 })

  const touchState = useRef<{
    startX: number
    startY: number
    lastY: number
    startTime: number
    isScrolling: boolean
    velocity: number
    rafId: number | null
  } | null>(null)

  const active = useRef<{
    pointer: number
    isEraser: boolean
    stroke: InkStroke
    erased: Map<string, InkStroke>
    markerLineY: number | null
  } | null>(null)

  const [preview, setPreview] = useState<InkStroke | null>(null)
  const undo = useRef<InkChange[]>([])
  const redo = useRef<InkChange[]>([])
  const checkpoint = useRef(0)
  const preference = 'study-ink-style:' + owner

  useEffect(() => {
    setMounted(true)
    try {
      const saved = JSON.parse(localStorage.getItem(preference) || 'null')
      if (saved?.styles?.pen && saved?.styles?.marker) setStyles(saved.styles)
      if (saved?.dockPosition) setDockPosition(saved.dockPosition)
      if (typeof saved?.cut === 'boolean') setCut(saved.cut)
      if (typeof saved?.isDockCollapsed === 'boolean') setIsDockCollapsed(saved.isDockCollapsed)
    } catch {}

    let live = true
    const load = async () => {
      try {
        const records = await readInk(baseDoc, attemptNumber)
        if (live) {
          setStrokes((unsaved.get(doc) ?? []).reduce(applyInk, records))
          setReady(true)
        }
        // Se for tentativa 2 ou superior, carrega tentativa anterior para consulta opcional
        if (attemptNumber > 1) {
          const prevRecords = await readInk(baseDoc, attemptNumber - 1)
          if (live) setPreviousStrokes(prevRecords)
        }
      } catch {
        if (live) setStatus('Armazenamento indisponível.')
      }
    }

    const previous = histories.get(doc)
    if (previous) {
      undo.current = previous.undo
      redo.current = previous.redo
      setCounts([previous.undo.length, previous.redo.length])
    }

    const updates = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('private-study-ink') : null
    if (updates) updates.onmessage = event => { if (event.data === doc) void load() }

    const keyHandler = (e: KeyboardEvent) => {
      const target = e.target
      if (e.repeat || e.isComposing || e.ctrlKey || e.metaKey || e.altKey || e.key.toLowerCase() !== 'p' || document.querySelector('[aria-modal="true"]') ||
          (target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable="true"]'))) return
      e.preventDefault()
      setOpen(prev => {
        const next = !prev
        setTool(next ? 'pen' : 'read')
        if (!next) setActiveDrawer(null)
        return next
      })
    }
    window.addEventListener('keydown', keyHandler)

    const leave = (event: BeforeUnloadEvent) => {
      if (active.current || unsaved.get(doc)?.length) event.preventDefault()
    }
    window.addEventListener('beforeunload', leave)
    void load()

    const measureBlocks = () => {
      const container = anchor.current?.parentElement
      if (!container) return
      const cRect = container.getBoundingClientRect()
      const measured: Record<string, InkBox> = {}
      for (const el of container.querySelectorAll<HTMLElement>('[data-ink-block]')) {
        const b = el.getBoundingClientRect()
        if (b.width && b.height) {
          measured[el.dataset.inkBlock!] = {
            x: b.left - cRect.left,
            y: b.top - cRect.top,
            width: b.width,
            height: b.height
          }
        }
      }
      setBlocks(measured)
    }
    measureBlocks()
    window.addEventListener('resize', measureBlocks)
    const observer = new ResizeObserver(measureBlocks)
    if (anchor.current?.parentElement) observer.observe(anchor.current.parentElement)

    return () => {
      live = false
      updates?.close()
      window.removeEventListener('keydown', keyHandler)
      window.removeEventListener('beforeunload', leave)
      observer.disconnect()
      window.removeEventListener('resize', measureBlocks)
      if (touchState.current?.rafId) cancelAnimationFrame(touchState.current.rafId)
    }
  }, [doc, baseDoc, preference, attemptNumber])

  function persistStyle(next = styles) {
    setStyles(next)
    try {
      localStorage.setItem(preference, JSON.stringify({
        styles: next,
        dockPosition,
        cut,
        isDockCollapsed
      }))
    } catch {
      setStatus('Preferência mantida nesta sessão.')
    }
  }

  function handleToggleCut(val: boolean) {
    setCut(val)
    try {
      const saved = JSON.parse(localStorage.getItem(preference) || '{}')
      localStorage.setItem(preference, JSON.stringify({ ...saved, cut: val }))
    } catch {}
  }

  function handleToggleDockCollapsed(val: boolean) {
    setIsDockCollapsed(val)
    try {
      const saved = JSON.parse(localStorage.getItem(preference) || '{}')
      localStorage.setItem(preference, JSON.stringify({ ...saved, isDockCollapsed: val }))
    } catch {}
  }

  function write(change: InkChange) {
    histories.set(doc, { undo: undo.current, redo: redo.current })
    setCounts([undo.current.length, redo.current.length])
    setStrokes(items => applyInk(items, change))
    const pending = unsaved.get(doc) ?? []
    pending.push(change)
    unsaved.set(doc, pending)
    setStatus('Salvando…')
    void flush(baseDoc, attemptNumber).then(
      () => setStatus('Sincronizado na nuvem'),
      () => setStatus('Salvo localmente')
    )
  }

  function commit(change: InkChange) {
    undo.current.push(change)
    redo.current = []
    write(change)
  }

  function handleUndo() {
    const change = undo.current.pop()
    if (!change) return
    redo.current.push(change)
    write({ before: change.after, after: change.before })
  }

  function handleRedo() {
    const change = redo.current.pop()
    if (!change) return
    undo.current.push(change)
    write(change)
  }

  // Coordenadas calculadas diretamente em relação ao container do card (Sem lag de scroll!)
  function point(e: PointerEvent): InkPoint {
    const rect = svgRef.current?.getBoundingClientRect()
    const originX = rect ? rect.left : 0
    const originY = rect ? rect.top : 0
    return {
      x: e.clientX - originX,
      y: e.clientY - originY,
      force: e.pointerType === 'pen' && e.pressure > 0 ? 0.35 + 0.65 * e.pressure : 1
    }
  }

  function sample(e: ReactPointerEvent<SVGSVGElement>) {
    // DUAL-INPUT: ROLAGEM SUAVE COM O DEDO EM MODO CANETA (NÃO AFETA A CANETA)
    if (e.pointerType === 'touch' && onlyPen && touchState.current) {
      const ts = touchState.current
      const dy = e.clientY - ts.lastY
      const totalY = Math.abs(e.clientY - ts.startY)
      const totalX = Math.abs(e.clientX - ts.startX)

      if (totalY > 5 || totalX > 5 || ts.isScrolling) {
        ts.isScrolling = true
        scrollAncestor(anchor.current, -dy)
        ts.velocity = -dy
        ts.lastY = e.clientY
      }
      return
    }

    const current = active.current
    if (!current || current.pointer !== e.pointerId) return
    const events = e.nativeEvent.getCoalescedEvents?.()

    for (const event of events?.length ? events : [e.nativeEvent]) {
      let p = point(event)

      // SUPORTE AO BOTÃO LATERAL DA S PEN (Barrel button)
      const isBarrel = (event.buttons & 2) !== 0 || (event.buttons & 32) !== 0 || event.button === 2 || (event as any).button === 5
      if (isBarrel && !current.isEraser) {
        current.isEraser = true
      }
      const isEraserNow = current.isEraser || isBarrel || tool === 'erase'
      const effectiveRadius = isEraserNow ? Math.max(radius * 1.6, 28) : radius

      // Conforme o marca-texto retilíneo inteligente se alinhando à linha do texto
      if (!isEraserNow && tool === 'marker' && straightMarker) {
        const snapped = snapMarkerPoint(p, current.markerLineY)
        p = snapped.point
        current.markerLineY = snapped.snappedY
      }

      if (isEraserNow) {
        current.stroke.points.push(p)
        for (const stroke of strokes) {
          if ((!onlyMarker || stroke.kind === 'marker') && touchesInk(stroke, p, effectiveRadius)) {
            current.erased.set(stroke.id, stroke)
          }
        }
      } else {
        current.stroke.points.push(p)
      }
    }

    if ((current.isEraser || tool === 'erase') && !cut) {
      setErasedIds([...current.erased.keys()])
    }

    if ((tool === 'pen' || tool === 'marker') && !current.isEraser && performance.now() - checkpoint.current > 1000) {
      checkpoint.current = performance.now()
      const partial = { ...current.stroke, points: [...current.stroke.points] }
      const pending = unsaved.get(doc) ?? []
      pending.push({ before: [], after: [partial] })
      unsaved.set(doc, pending)
      void flush(baseDoc, attemptNumber).catch(() => setStatus('Ainda não salvo'))
    }
    setPreview({ ...current.stroke })
  }

  function finish() {
    const current = active.current
    if (!current) return
    active.current = null

    const bounds = Object.entries(blocks).find(([, box]) =>
      current.stroke.points.length &&
      current.stroke.points.every(p => p.x >= box.x && p.y >= box.y && p.x <= box.x + box.width && p.y <= box.y + box.height)
    )
    if (bounds) current.stroke.anchor = { block: bounds[0], box: bounds[1] }

    if (current.isEraser || tool === 'erase') {
      const effectiveRadius = Math.max(radius * 1.6, 28)
      if (cut) {
        const before: InkStroke[] = [], after: InkStroke[] = []
        for (const stroke of strokes.filter(s => !onlyMarker || s.kind === 'marker')) {
          const pieces = cutInk(stroke, current.stroke.points, effectiveRadius)
          if (pieces[0] !== stroke) { before.push(stroke); after.push(...pieces) }
        }
        if (before.length) commit({ before, after })
      } else if (current.erased.size) {
        commit({ before: [...current.erased.values()], after: [] })
      }
      setErasedIds([])
    } else if (tool === 'lasso') {
      setSelection(strokes.filter(s => s.points.some(p => insideLasso(p, current.stroke.points))).map(s => s.id))
    } else if (tool === 'line' && current.stroke.points.length) {
      const points = current.stroke.points
      commit({ before: [], after: [{ ...current.stroke, points: [points[0], points[points.length - 1]] }] })
    } else if (current.stroke.points.length) {
      // 1. RECONHECIMENTO DE GESTO DE RABISCO (SCRATCH-OUT) PARA APAGAR AUTOMATICAMENTE
      if (tool === 'pen' && detectScratchOut(current.stroke)) {
        const pts = current.stroke.points
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
        for (const p of pts) {
          if (p.x < minX) minX = p.x
          if (p.x > maxX) maxX = p.x
          if (p.y < minY) minY = p.y
          if (p.y > maxY) maxY = p.y
        }
        const box = { x: minX - 12, y: minY - 12, width: (maxX - minX) + 24, height: (maxY - minY) + 24 }
        const scratched = strokes.filter(s =>
          s.points.some(p => p.x >= box.x && p.x <= box.x + box.width && p.y >= box.y && p.y <= box.y + box.height)
        )
        if (scratched.length > 0) {
          commit({ before: scratched, after: [] })
          setPreview(null)
          return
        }
      }

      commit({ before: [], after: [current.stroke] })

      // RECONHECIMENTO DE GESTO DE RESPOSTA SILENCIOSO (CIRCULAR OU MARCAR COM X)
      if (choose && autoGestureEnabled && (tool === 'pen' || tool === 'gesture')) {
        const container = anchor.current?.parentElement
        const cardRect = svgRef.current?.getBoundingClientRect()
        if (container && cardRect) {
          const badges = Array.from(container.querySelectorAll<HTMLElement>('[data-ink-option], [data-ink-option-row]'))
          const targets: OptionTarget[] = badges.map(b => {
            const r = b.getBoundingClientRect()
            return {
              option: b.dataset.inkOption ?? b.dataset.inkOptionRow ?? '',
              center: { x: r.left + r.width / 2 - cardRect.left, y: r.top + r.height / 2 - cardRect.top, force: 1 },
              box: { x: r.left - cardRect.left, y: r.top - cardRect.top, width: r.width, height: r.height }
            }
          })

          const gesture = detectOptionGesture(current.stroke, strokes.slice(-4), targets)
          if (gesture) {
            choose(gesture.option)
          }
        }
      }
    }
    setPreview(null)
  }

  function _transformSelection(scale: number, dx: number, dy: number, copy = false) {
    const objects = strokes.filter(s => selection.includes(s.id))
    const pivot = objects[0]?.points[0]
    if (!pivot) return
    const after = objects.map(s => ({
      ...s,
      id: copy ? crypto.randomUUID() : s.id,
      points: s.points.map(p => ({
        ...p,
        x: pivot.x + (p.x - pivot.x) * scale + dx,
        y: pivot.y + (p.y - pivot.y) * scale + dy
      }))
    }))
    commit({ before: copy ? [] : objects, after })
    setSelection(after.map(s => s.id))
  }

  function start(e: ReactPointerEvent<SVGSVGElement>) {
    if (!ready || tool === 'read' || active.current || e.button > 2) return

    // Evita desenhar se o toque foi sobre botões ou elementos interativos nativos
    const elements = document.elementsFromPoint(e.clientX, e.clientY)
    const isInteractive = elements.some(el => {
      if (el === svgRef.current || el.closest('svg') === svgRef.current) return false
      const tag = el.tagName
      return tag === 'BUTTON' || el.closest('button') || el.getAttribute('role') === 'button' ||
             tag === 'A' || el.closest('a') || tag === 'INPUT' || tag === 'TEXTAREA' ||
             el.hasAttribute('data-no-ink')
    })
    if (isInteractive) {
      return
    }

    // Ao iniciar um traço, recolhe drawers laterais para manter visão limpa
    if (activeDrawer) setActiveDrawer(null)

    // DUAL-INPUT INTELIGENTE: CANETA DESENHA / DEDO ROLA OU CLICA
    if (e.pointerType === 'touch' && onlyPen) {
      if (touchState.current?.rafId) cancelAnimationFrame(touchState.current.rafId)
      touchState.current = {
        startX: e.clientX,
        startY: e.clientY,
        lastY: e.clientY,
        startTime: performance.now(),
        isScrolling: false,
        velocity: 0,
        rafId: null
      }
      e.currentTarget.setPointerCapture(e.pointerId)
      return
    }

    // SUPORTE AO BOTÃO LATERAL DA S PEN (Barrel button)
    const isBarrel = (e.buttons & 2) !== 0 || (e.buttons & 32) !== 0 || e.button === 2 || (e.nativeEvent as any).button === 5

    // CRIAR POST-IT MÉDICO FLUTUANTE AO TOCAR COM A FERRAMENTA NOTA
    if (tool === 'note' && !isBarrel) {
      const pt = point(e.nativeEvent)
      const newPostIt: StickyPostIt = {
        id: crypto.randomUUID(),
        x: Math.max(10, pt.x - 20),
        y: Math.max(10, pt.y - 15),
        text: '',
        colorIdx: 0,
        minimized: false
      }
      setPostIts(prev => [...prev, newPostIt])
      setTool('read') // Retorna para navegação após criar a nota
      return
    }

    e.currentTarget.setPointerCapture(e.pointerId)
    checkpoint.current = performance.now()
    const kind = isBarrel || tool === 'erase' ? 'pen' : (tool === 'marker' ? 'marker' : 'pen')
    const initialPt = point(e.nativeEvent)

    active.current = {
      pointer: e.pointerId,
      isEraser: isBarrel || tool === 'erase',
      erased: new Map(),
      markerLineY: initialPt.y,
      stroke: { ...styles[kind], kind, id: crypto.randomUUID(), created: Date.now(), points: [] }
    }
    sample(e)
  }

  function render(stroke: InkStroke, isGhost = false) {
    if (!stroke.points.length) return null
    if (stroke.text !== undefined) {
      const p = stroke.points[0]
      return (
        <text key={stroke.id} x={p.x} y={p.y} fill={stroke.color} fontSize={Math.max(14, stroke.width * 8)} className="font-sans font-medium" opacity={isGhost ? 0.35 : 1}>
          {stroke.text.split('\n').map((line, i) => (
            <tspan key={i} x={p.x} dy={i ? '1.25em' : 0}>{line}</tspan>
          ))}
        </text>
      )
    }

    const isLassoStroke = (stroke.kind as string) === 'lasso' || (tool === 'lasso' && stroke.id === preview?.id)
    if (isLassoStroke) {
      const coords = stroke.points.map(p => p.x + ',' + p.y).join(' ')
      return (
        <polygon
          key={stroke.id}
          points={coords}
          fill="rgba(56, 189, 248, 0.12)"
          stroke="#38bdf8"
          strokeWidth={1.75}
          strokeDasharray="6 4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )
    }

    const coords = stroke.points.map(p => p.x + ',' + p.y).join(' ')
    const first = stroke.points[0]

    return (
      <g
        key={stroke.id}
        style={{
          filter: tool === 'lasso' && selection.includes(stroke.id) ? 'drop-shadow(0 0 4px #3b82f6)' : undefined
        }}
        opacity={isGhost ? 0.35 : stroke.opacity}
        fill={stroke.color}
        stroke={stroke.color}
        strokeLinecap={stroke.kind === 'marker' ? 'square' : 'round'}
        strokeLinejoin="round"
      >
        {stroke.points.length === 1 ? (
          <circle cx={first.x} cy={first.y} r={stroke.width / 2} stroke="none" />
        ) : stroke.pressure ? (
          stroke.points.slice(1).map((p, i) => (
            <line
              key={i}
              x1={stroke.points[i].x}
              y1={stroke.points[i].y}
              x2={p.x}
              y2={p.y}
              strokeWidth={stroke.width * p.force}
            />
          ))
        ) : (
          <polyline points={coords} fill="none" strokeWidth={stroke.width} />
        )}
      </g>
    )
  }

  const kind = tool === 'marker' ? 'marker' : 'pen'
  const style = styles[kind]
  const update = (patch: Partial<Style>) => persistStyle({ ...styles, [kind]: { ...style, ...patch } })
  const visible = [
    ...strokes.filter(s => !erasedIds.includes(s.id) && s.id !== preview?.id),
    ...(preview && tool !== 'erase' ? [preview] : [])
  ]

  // Acionamento com Detecção de 2º Toque (Double-Tap)
  function handleToolSelect(selectedTool: Tool) {
    const now = performance.now()
    const isDoubleTap = tool === selectedTool || (now - lastToolTapRef.current.time < 500)
    lastToolTapRef.current = { tool: selectedTool, time: now }

    if (!isDoubleTap && tool !== selectedTool) {
      setTool(selectedTool)
      // No primeiro toque em outra ferramenta, apenas seleciona e recolhe o drawer
      setActiveDrawer(null)
    } else {
      // 2º toque (double-tap) ou toque na ferramenta já ativa: abre ou fecha o drawer de opções
      setTool(selectedTool)
      setActiveDrawer(prev => (prev === selectedTool ? null : selectedTool))
    }
  }

  function toggleCanetaFab() {
    setOpen(prev => {
      const next = !prev
      if (next) {
        setTool('pen')
      } else {
        setTool('read')
        setActiveDrawer(null)
      }
      return next
    })
  }

  return (
    <>
      {/* 
        1. CAMADA DE FUNDO: MARCA-TEXTO ATRÁS DAS FONTES (z-[1])
        Fica fisicamente atrás do enunciado e alternativas (relative z-[2]),
        preservando a legibilidade perfeita das fontes sem manchá-las.
      */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] w-full h-full z-[1]">
        <svg
          aria-hidden="true"
          className="w-full h-full overflow-visible"
          style={{ pointerEvents: 'none' }}
        >
          {/* Camada Fantasma de Marca-texto da Tentativa Anterior */}
          {showPreviousAttempt && previousStrokes.length > 0 && (
            <g className="ghost-previous-attempt">
              {previousStrokes.filter(s => s.kind === 'marker').map(s => render(s, true))}
            </g>
          )}

          {/* Marca-texto Ativo Concluído */}
          <g>
            {visible.filter(s => s.kind === 'marker').map(s => render(s, false))}
          </g>
        </svg>
      </div>

      {/* 
        2. CAMADA FRONTAL DE ESCRITA E INTERAÇÃO (z-[3])
        Caneta, laço, retas, borracha, post-its e captura de ponteiro S Pen.
      */}
      <div ref={anchor} className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] w-full h-full z-[3]">
        <svg
          ref={svgRef}
          aria-hidden="true"
          onContextMenu={e => e.preventDefault()}
          className="w-full h-full overflow-visible text-zinc-900 dark:text-zinc-100"
          style={{
            touchAction: tool === 'read' ? 'auto' : 'none',
            pointerEvents: tool === 'read' ? 'none' : 'auto',
            cursor: tool === 'read' ? 'default' : tool === 'erase' ? 'cell' : 'crosshair'
          }}
          onPointerDown={start}
          onPointerMove={e => {
            if (tool === 'erase' || active.current?.isEraser) {
              setEraserCursor(point(e.nativeEvent))
            }
            sample(e)
          }}
          onPointerLeave={() => setEraserCursor(null)}
          onPointerUp={e => {
            if (e.pointerType === 'touch' && touchState.current) {
              const ts = touchState.current
              try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}

              if (ts.isScrolling) {
                let v = ts.velocity
                if (Math.abs(v) > 1.2) {
                  const runInertia = () => {
                    if (Math.abs(v) > 0.4) {
                      scrollAncestor(anchor.current, v)
                      v *= 0.88
                      ts.rafId = requestAnimationFrame(runInertia)
                    } else {
                      touchState.current = null
                    }
                  }
                  ts.rafId = requestAnimationFrame(runInertia)
                } else {
                  touchState.current = null
                }
                return
              }

              touchState.current = null
              const dt = performance.now() - ts.startTime
              if (dt < 450) {
                const elements = document.elementsFromPoint(e.clientX, e.clientY)
                const optEl = elements.find(el => el.hasAttribute('data-ink-option') || el.hasAttribute('data-ink-option-row')) as HTMLElement | undefined
                const optLetter = optEl?.getAttribute('data-ink-option') || optEl?.getAttribute('data-ink-option-row')
                if (optLetter && choose) {
                  choose(optLetter)
                  return
                }

                const clickable = elements.find(el => {
                  if (el === svgRef.current || el.closest('svg') === svgRef.current) return false
                  return el.tagName === 'BUTTON' || el.closest('button') || el.getAttribute('role') === 'button' || el.tagName === 'A'
                })
                const btn = (clickable?.closest('button, [role="button"], a') as HTMLElement) || (clickable as HTMLElement)
                if (btn && typeof btn.click === 'function') {
                  btn.click()
                }
              }
              return
            }

            if (active.current?.pointer === e.pointerId) {
              sample(e)
              finish()
            }
          }}
          onLostPointerCapture={e => {
            if (touchState.current) touchState.current = null
            if (active.current?.pointer === e.pointerId) finish()
          }}
          onPointerCancel={e => {
            if (touchState.current?.rafId) cancelAnimationFrame(touchState.current.rafId)
            touchState.current = null
            if (active.current?.pointer === e.pointerId) finish()
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Camada Fantasma da Tentativa Anterior (Caneta e Traços Frontais) */}
          {showPreviousAttempt && previousStrokes.length > 0 && (
            <g className="ghost-previous-attempt">
              {previousStrokes.filter(s => s.kind !== 'marker').map(s => render(s, true))}
            </g>
          )}

          {/* Camada Ativa Frontal (Caneta, Laço, Reta) */}
          <g>
            {visible.filter(s => s.kind !== 'marker').map(s => render(s, false))}
          </g>

          {/* Preview instantâneo do marca-texto em tempo real durante o traço */}
          {preview && preview.kind === 'marker' && render(preview, false)}

          {/* Cursor visual da borracha com área delimitada */}
          {eraserCursor && (
            <circle
              cx={eraserCursor.x}
              cy={eraserCursor.y}
              r={Math.max(radius * 1.6, 28) / 2}
              fill="rgba(244,63,94,0.15)"
              stroke="#f43f5e"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              pointerEvents="none"
            />
          )}
        </svg>

        {/* Post-its Médicos Flutuantes Ancorados no Card */}
        {postIts.map(p => {
          const colorCfg = NOTE_COLORS[p.colorIdx] || NOTE_COLORS[0]
          return (
            <div
              key={p.id}
              style={{ left: `${p.x}px`, top: `${p.y}px` }}
              className="absolute pointer-events-auto z-[4] select-text animate-in fade-in zoom-in-95"
            >
              {p.minimized ? (
                <button
                  type="button"
                  onClick={() => setPostIts(prev => prev.map(item => item.id === p.id ? { ...item, minimized: false } : item))}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold shadow-lg flex items-center gap-1.5 border border-white/20 active:scale-95 transition-transform ${colorCfg.badge}`}
                  title="Expandir nota médica"
                >
                  <StickyNote className="w-3 h-3" />
                  <span>{p.text.slice(0, 16) || 'Nota'}...</span>
                </button>
              ) : (
                <div className={`w-64 sm:w-72 rounded-2xl shadow-2xl p-3 border backdrop-blur-xl ${colorCfg.bg}`}>
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10">
                    <span className="text-[11px] font-bold flex items-center gap-1">
                      <StickyNote className="w-3 h-3" /> Nota Médica
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPostIts(prev => prev.map(item => item.id === p.id ? { ...item, colorIdx: (item.colorIdx + 1) % NOTE_COLORS.length } : item))}
                        className="p-1 hover:bg-white/10 rounded text-[10px]"
                        title="Mudar cor do post-it"
                      >
                        🎨
                      </button>
                      <button
                        type="button"
                        onClick={() => setPostIts(prev => prev.map(item => item.id === p.id ? { ...item, minimized: true } : item))}
                        className="p-1 hover:bg-white/10 rounded"
                        title="Minimizar para badge"
                      >
                        <Minimize2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPostIts(prev => prev.filter(item => item.id !== p.id))}
                        className="p-1 hover:bg-rose-500/20 text-rose-300 rounded"
                        title="Excluir nota"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={p.text}
                    onChange={e => {
                      const val = e.target.value
                      setPostIts(prev => prev.map(item => item.id === p.id ? { ...item, text: val } : item))
                    }}
                    placeholder="Escreva ou digite observações clínicas..."
                    className="w-full bg-black/20 rounded-xl p-2 text-xs placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 resize-none font-sans"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* PORTAL DO BOTÃO FAB (CANTO INFERIOR) E BARRA SLIM LATERAL ESTILO SAMSUNG NOTES */}
      {mounted && createPortal(
        <>
          {/* 1. BOTÃO FAB CIRCULAR NO CANTO INFERIOR (LIGA / DESLIGA) */}
          <button
            type="button"
            onClick={toggleCanetaFab}
            aria-label={open ? 'Desativar Caneta Médica' : 'Ativar Caneta Médica'}
            title={open ? 'Desativar barra da caneta' : 'Ativar barra da caneta médica (S Pen)'}
            className={`fixed bottom-5 right-5 z-[55] w-12 h-12 rounded-full shadow-[0_12px_36px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer ${
              open
                ? 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white ring-4 ring-emerald-500/25 scale-105'
                : 'bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white backdrop-blur-md hover:scale-105'
            }`}
          >
            <Pencil className={`w-5 h-5 transition-transform duration-200 ${open ? 'rotate-12 scale-110 text-white' : 'text-zinc-300'}`} />
          </button>

          {/* 2. MINI-ABA LATERAL QUANDO A BARRA ESTÁ MINIMIZADA (NÃO SOBREPÕE A QUESTÃO) */}
          {open && isDockCollapsed && (
            <button
              type="button"
              onClick={() => handleToggleDockCollapsed(false)}
              title="Expandir barra de ferramentas da caneta"
              aria-label="Expandir barra de ferramentas"
              style={{
                top: dockPosition === 'top' ? 'calc(0.75rem + env(safe-area-inset-top, 0px))' : '50%',
                transform: dockPosition === 'top' ? 'translateX(-50%)' : 'translateY(-50%)',
                left: dockPosition === 'left' ? '0px' : dockPosition === 'top' ? '50%' : undefined,
                right: dockPosition === 'right' ? '0px' : undefined
              }}
              className={`fixed z-[52] py-3.5 px-1.5 border border-zinc-800/90 bg-zinc-950/95 dark:bg-zinc-900/95 text-zinc-300 hover:text-white shadow-[0_12px_32px_rgba(0,0,0,0.6)] backdrop-blur-2xl ring-1 ring-white/10 hover:bg-zinc-800 transition-all flex items-center justify-center cursor-pointer group ${
                dockPosition === 'left'
                  ? 'rounded-r-2xl border-l-0'
                  : dockPosition === 'top'
                  ? 'rounded-b-2xl py-1.5 px-4 border-t-0'
                  : 'rounded-l-2xl border-r-0'
              }`}
            >
              <div className="flex flex-col items-center gap-1.5">
                <Pencil className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                {dockPosition === 'right' && <ChevronLeft className="w-3.5 h-3.5 text-zinc-400" />}
                {dockPosition === 'left' && <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />}
              </div>
            </button>
          )}

          {/* 3. BARRA SLIM FLUTUANTE ESTILO SAMSUNG NOTES (QUANDO NÃO RECOLHIDA) */}
          {open && !isDockCollapsed && (
            <aside
              role="toolbar"
              aria-label="Barra de Ferramentas de Escrita"
              style={{
                top: dockPosition === 'top' ? 'calc(1rem + env(safe-area-inset-top, 0px))' : '50%',
                transform: dockPosition === 'top' ? 'translateX(-50%)' : 'translateY(-50%)',
                left: dockPosition === 'left' ? 'calc(1rem + env(safe-area-inset-left, 0px))' : dockPosition === 'top' ? '50%' : undefined,
                right: dockPosition === 'right' ? 'calc(1rem + env(safe-area-inset-right, 0px))' : undefined
              }}
              className={`fixed z-[52] select-none rounded-2xl border border-zinc-800/90 bg-zinc-950/95 dark:bg-zinc-900/95 text-zinc-100 shadow-[0_24px_64px_rgba(0,0,0,0.7)] backdrop-blur-2xl ring-1 ring-white/10 animate-in fade-in duration-150 p-1.5 flex ${
                dockPosition === 'top' ? 'flex-row items-center gap-1' : 'flex-col items-center gap-1'
              }`}
            >
              {/* Botão de Minimizar para aba discreta na borda */}
              <button
                type="button"
                onClick={() => handleToggleDockCollapsed(true)}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
                title="Minimizar barra para uma aba fininha na borda"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>

              {/* Alça de reposicionamento (Alternar Lado: Direita / Esquerda / Topo) */}
              <button
                type="button"
                onClick={() => {
                  setDockPosition(prev => {
                    const next = prev === 'right' ? 'left' : prev === 'left' ? 'top' : 'right'
                    try {
                      const saved = JSON.parse(localStorage.getItem(preference) || '{}')
                      localStorage.setItem(preference, JSON.stringify({ ...saved, dockPosition: next }))
                    } catch {}
                    return next
                  })
                }}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
                title={`Posição atual: ${dockPosition}. Clique para alternar lado (Direita/Esquerda/Topo)`}
              >
                <Move className="w-3.5 h-3.5" />
              </button>

              <div className={`border-zinc-800/80 ${dockPosition === 'top' ? 'border-r h-6 mx-0.5' : 'border-b w-6 my-0.5'}`} />

              {/* Botões das Ferramentas Principais */}
              {TOOL_DEFS.map(def => {
                const Icon = def.icon
                const isActive = tool === def.id
                const isPenOrMarker = def.id === 'pen' || def.id === 'marker'
                const currentColor = def.id === 'pen' ? styles.pen.color : styles.marker.color

                return (
                  <button
                    key={def.id}
                    type="button"
                    onClick={() => handleToolSelect(def.id)}
                    title={`${def.label}: ${def.hint} (Toque 2x para opções)`}
                    className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center transition-all relative ${
                      isActive
                        ? 'bg-zinc-800 text-white ring-1 ring-emerald-500/80 shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {isPenOrMarker && (
                      <span
                        className="w-1.5 h-1.5 rounded-full absolute bottom-1 border border-black/40"
                        style={{ backgroundColor: currentColor === 'currentColor' ? '#10b981' : currentColor }}
                      />
                    )}
                  </button>
                )
              })}

              <div className={`border-zinc-800/80 ${dockPosition === 'top' ? 'border-r h-6 mx-0.5' : 'border-b w-6 my-0.5'}`} />

              {/* Botão de Histórico / Rever Rascunhos da Tentativa Anterior */}
              {attemptNumber > 1 && (
                <button
                  type="button"
                  onClick={() => setShowPreviousAttempt(prev => !prev)}
                  title={showPreviousAttempt ? 'Ocultar rascunho anterior' : 'Rever rascunhos da tentativa anterior'}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    showPreviousAttempt
                      ? 'bg-amber-950/60 text-amber-300 ring-1 ring-amber-500/60'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  {showPreviousAttempt ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-amber-400" />}
                </button>
              )}

              {/* Desfazer e Refazer */}
              <button
                type="button"
                disabled={!counts[0]}
                onClick={handleUndo}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 disabled:opacity-25 transition-all"
                title="Desfazer traço (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={!counts[1]}
                onClick={handleRedo}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 disabled:opacity-25 transition-all"
                title="Refazer traço (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </button>

              {/* Botão de Limpar Tudo */}
              <button
                type="button"
                disabled={!strokes.length}
                onClick={() => {
                  if (window.confirm('Limpar todas as anotações desta questão?')) {
                    commit({ before: strokes, after: [] })
                  }
                }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 disabled:opacity-25 transition-all"
                title="Limpar todos os desenhos"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </aside>
          )}

          {/* 3. DRAWER / FLYOUT DE PROPRIEDADES NO 2º TOQUE (DOUBLE-TAP) */}
          {open && activeDrawer && (
            <div
              style={{
                top: dockPosition === 'top' ? 'calc(4.5rem + env(safe-area-inset-top, 0px))' : '50%',
                transform: dockPosition === 'top' ? 'translateX(-50%)' : 'translateY(-50%)',
                right: dockPosition === 'right' ? 'calc(4.2rem + env(safe-area-inset-right, 0px))' : undefined,
                left: dockPosition === 'left' ? 'calc(4.2rem + env(safe-area-inset-left, 0px))' : dockPosition === 'top' ? '50%' : undefined
              }}
              className="fixed z-[53] w-72 sm:w-80 rounded-2xl border border-zinc-800 bg-zinc-950/95 dark:bg-zinc-900/95 text-zinc-100 shadow-[0_24px_64px_rgba(0,0,0,0.75)] backdrop-blur-2xl p-3.5 text-xs select-none ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Cabeçalho do Drawer */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/80">
                <span className="font-bold text-zinc-100 flex items-center gap-1.5 capitalize">
                  {activeDrawer === 'pen' && <Pencil className="w-3.5 h-3.5 text-emerald-400" />}
                  {activeDrawer === 'marker' && <Highlighter className="w-3.5 h-3.5 text-amber-400" />}
                  {activeDrawer === 'erase' && <Eraser className="w-3.5 h-3.5 text-rose-400" />}
                  {activeDrawer === 'lasso' && <Scissors className="w-3.5 h-3.5 text-blue-400" />}
                  {activeDrawer === 'note' && <StickyNote className="w-3.5 h-3.5 text-yellow-400" />}
                  Opções de {activeDrawer === 'pen' ? 'Caneta' : activeDrawer === 'marker' ? 'Marca-texto' : activeDrawer === 'erase' ? 'Borracha' : activeDrawer}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveDrawer(null)}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  title="Fechar opções"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* OPÇÕES DA CANETA */}
              {activeDrawer === 'pen' && (
                <div className="space-y-3">
                  {/* Cores */}
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1.5">Cor do traço</span>
                    <div className="flex items-center gap-2">
                      {COLOR_PRESETS.map(preset => {
                        const isSelected = styles.pen.color === preset.value
                        return (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() => update({ color: preset.value })}
                            className={`w-6 h-6 rounded-full transition-all flex items-center justify-center ${
                              preset.border ?? ''
                            } ${preset.bg ?? 'bg-gradient-to-tr from-emerald-500 to-teal-400'} ${
                              isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110' : 'hover:scale-105 opacity-85 hover:opacity-100'
                            }`}
                            title={preset.name}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Espessura */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                      <span>Espessura</span>
                      <span className="font-mono text-emerald-400">{styles.pen.width} px</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 mb-1.5">
                      {[1, 2, 4, 8].map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => update({ width: size })}
                          className={`py-1 rounded-lg font-semibold text-[11px] transition-all ${
                            styles.pen.width === size
                              ? 'bg-zinc-800 text-white ring-1 ring-emerald-500'
                              : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={12}
                      value={styles.pen.width}
                      onChange={e => update({ width: Number(e.target.value) })}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-zinc-300">Sensível à pressão (S Pen)</span>
                      <input
                        type="checkbox"
                        checked={styles.pen.pressure}
                        onChange={e => update({ pressure: e.target.checked })}
                        className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-0 cursor-pointer"
                      />
                    </label>

                    {choose && (
                      <label className="flex items-center justify-between cursor-pointer" title="Circular ou fazer um X sobre a alternativa seleciona ela">
                        <span className="text-zinc-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Gabaritar com X ou Círculo
                        </span>
                        <input
                          type="checkbox"
                          checked={autoGestureEnabled}
                          onChange={e => setAutoGestureEnabled(e.target.checked)}
                          className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-0 cursor-pointer"
                        />
                      </label>
                    )}

                    <label className="flex items-center justify-between cursor-pointer" title="Caneta desenha fixo; arrastar o dedo na tela rola a página">
                      <div className="flex flex-col pr-1">
                        <span className="text-zinc-300 font-medium">Rejeição de palma / Só Caneta</span>
                        <span className="text-[10px] text-zinc-500">Caneta desenha sem rolar • Dedo rola</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={onlyPen}
                        onChange={e => setOnlyPen(e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-0 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* OPÇÕES DO MARCA-TEXTO */}
              {activeDrawer === 'marker' && (
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1.5">Cores de grifo médico</span>
                    <div className="flex items-center gap-2">
                      {MARKER_COLORS.map(m => {
                        const isSelected = styles.marker.color === m.value
                        return (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => persistStyle({ ...styles, marker: { ...styles.marker, color: m.value } })}
                            className={`w-6 h-6 rounded-full transition-all flex items-center justify-center ${
                              isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110' : 'hover:scale-105 opacity-80'
                            }`}
                            style={{ backgroundColor: m.value }}
                            title={m.name}
                          >
                            {isSelected && <Check className="w-3 h-3 text-black" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                      <span>Altura do marca-texto</span>
                      <span className="font-mono text-amber-400">{styles.marker.width} px</span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={36}
                      value={styles.marker.width}
                      onChange={e => persistStyle({ ...styles, marker: { ...styles.marker, width: Number(e.target.value) } })}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  <div className="pt-1 border-t border-zinc-800/80">
                    <label className="flex items-center justify-between cursor-pointer" title="Alinha o marca-texto perfeitamente na linha horizontal do texto">
                      <div className="flex flex-col pr-1">
                        <span className="text-zinc-300 font-medium">Régua inteligente retilínea</span>
                        <span className="text-[10px] text-zinc-500">Alinha o grifo na linha da leitura</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={straightMarker}
                        onChange={e => setStraightMarker(e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-0 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* OPÇÕES DA BORRACHA */}
              {activeDrawer === 'erase' && (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                      <span>Raio da borracha</span>
                      <span className="font-mono text-rose-400">{radius} px</span>
                    </div>
                    <input
                      type="range"
                      min={6}
                      max={40}
                      value={radius}
                      onChange={e => setRadius(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                  </div>

                  <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                    <label className="flex items-center justify-between cursor-pointer text-zinc-300">
                      <span>Apagar apenas marca-texto</span>
                      <input
                        type="checkbox"
                        checked={onlyMarker}
                        onChange={e => setOnlyMarker(e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-800 text-rose-500 focus:ring-0 cursor-pointer"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer text-zinc-300">
                      <span>Cortar traço (fragmentar)</span>
                      <input
                        type="checkbox"
                        checked={cut}
                        onChange={e => handleToggleCut(e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-800 text-rose-500 focus:ring-0 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* OPÇÕES DE NOTAS */}
              {activeDrawer === 'note' && (
                <div className="space-y-2.5">
                  <p className="text-zinc-400 text-[11px]">
                    Toque em qualquer ponto da questão para colar um <b>Post-it Médico</b>.
                  </p>
                  <p className="text-zinc-500 text-[10px]">
                    Você pode digitar pelo teclado ou minimizar para um alfinete ao lado do texto.
                  </p>
                </div>
              )}
            </div>
          )}
        </>,
        document.body
      )}
    </>
  )
}

export function StudyInkLayer({
  content,
  flip,
  choose,
  attemptNumber = 1
}: {
  content: string
  attemptNumber?: number
} & Actions) {
  const { user, isLoading } = useAuth()
  const owner = user?.id ?? 'guest'
  const baseDoc = JSON.stringify([owner, content])
  const doc = `${baseDoc}:att-${attemptNumber}`

  return isLoading ? null : (
    <Editor
      key={doc}
      doc={doc}
      baseDoc={baseDoc}
      owner={owner}
      flip={flip}
      choose={choose}
      attemptNumber={attemptNumber}
    />
  )
}
