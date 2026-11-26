'use client'

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent
} from 'react'
import { X, StickyNote, Minimize2, Move, Trash2, Copy } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  applyInk,
  readInk,
  saveInk,
  readNotes,
  saveNotes,
  touchesInkSegment,
  cutInk,
  insideLasso,
  projectInk,
  getSynchronousLocalInk,
  type InkBox,
  type InkChange,
  type InkPoint,
  type InkStroke,
  type StickyPostIt
} from '@/services/studyInk'
import {
  detectOptionGesture,
  detectScratchOut,
  snapMarkerPoint,
  type OptionTarget
} from '@/services/studyInkGestures'
import {
  getActiveInkHandlers,
  getStudyInkServerSnapshot,
  getStudyInkSnapshot,
  hydrateStudyInkPreferences,
  registerInkInstance,
  setActiveInkDoc,
  setInkDocHandlers,
  setInkDrawer,
  setInkDrawing,
  setInkToolDirect,
  subscribeStudyInkStore,
  toggleInkOpen,
  triggerUndoFeedback,
  unregisterInkInstance,
  type Tool
} from '@/services/studyInkStore'
import { COLOR_PRESETS, StudyInkToolbar } from '@/components/StudyInkToolbar'

export type { Tool, StickyPostIt }

const NOTE_COLORS = [
  { name: 'Âmbar', bg: 'bg-amber-950/80 border-amber-600/60 text-amber-100', badge: 'bg-amber-500 text-black' },
  { name: 'Esmeralda', bg: 'bg-emerald-950/80 border-emerald-600/60 text-emerald-100', badge: 'bg-emerald-500 text-black' },
  { name: 'Azul', bg: 'bg-blue-950/80 border-blue-600/60 text-blue-100', badge: 'bg-blue-500 text-white' },
  { name: 'Neutro', bg: 'bg-zinc-900/90 border-zinc-700/70 text-zinc-100', badge: 'bg-zinc-700 text-white' }
]

const unsaved = new Map<string, InkChange[]>()
const histories = new Map<string, { undo: InkChange[]; redo: InkChange[] }>()
const queues = new Map<string, Promise<void>>()

function flush(docKey: string, baseDoc: string, attemptNumber = 1, shouldSyncCloud = true) {
  const active = queues.get(docKey)
  if (active) return active
  const pending = unsaved.get(docKey) ?? []
  const work = (async () => {
    while (pending.length) {
      await saveInk(baseDoc, pending[0], attemptNumber, shouldSyncCloud)
      pending.shift()
      if (typeof BroadcastChannel !== 'undefined') {
        const notify = new BroadcastChannel('private-study-ink')
        notify.postMessage(docKey)
        notify.close()
      }
    }
  })().finally(() => queues.delete(docKey))
  queues.set(docKey, work)
  return work
}

function scrollAncestor(element: HTMLElement | null, dy: number) {
  if (typeof window === 'undefined' || !dy) return
  let el = element?.parentElement
  while (el && el !== document.body && el !== document.documentElement) {
    const overflowY = window.getComputedStyle(el).overflowY
    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
      const prevTop = el.scrollTop
      el.scrollBy({ top: dy, left: 0, behavior: 'instant' })
      if (Math.abs(el.scrollTop - prevTop) > 0.5) return
    }
    el = el.parentElement
  }
  window.scrollBy({ top: dy, left: 0, behavior: 'instant' })
}

function isBarrelOrEraser(e: { button: number; buttons: number }): boolean {
  return (e.buttons & 2) !== 0 || (e.buttons & 32) !== 0 || e.button === 2 || e.button === 5
}

function isAndroidAirBarrel(e: { pointerType?: string; buttons: number; pressure: number }): boolean {
  return e.pointerType === 'pen' && (e.buttons & 1) !== 0 && e.pressure === 0
}

function findInteractiveUnderPointer(
  clientX: number,
  clientY: number,
  svgEl: SVGSVGElement | null
): HTMLElement | null {
  const elements = document.elementsFromPoint(clientX, clientY)
  for (const el of elements) {
    if (el === svgEl || el.closest('svg') === svgEl) continue
    if (el.hasAttribute('data-no-ink')) return el as HTMLElement
    const noInkAncestor = el.closest('[data-no-ink]')
    if (noInkAncestor) return noInkAncestor as HTMLElement

    const interactiveAncestor = el.closest('button, a, input, textarea, select, [role="button"]')
    if (interactiveAncestor) {
      // Allow drawing/gestures over option rows even when implemented as <button> (e.g. PracticeExam)
      if (interactiveAncestor.hasAttribute('data-ink-option-row')) {
        continue
      }
      return interactiveAncestor as HTMLElement
    }
  }
  return null
}

type Actions = {
  flip?: () => void
  choose?: (letter: string) => void
  eliminate?: (letter: string) => void
  attemptNumber?: number
  showPreviousAttempt?: boolean
  onTogglePreviousAttempt?: () => void
}

function Editor({
  doc,
  baseDoc,
  owner,
  choose,
  eliminate,
  attemptNumber = 1,
  showPreviousAttempt: propShowPreviousAttempt,
  onTogglePreviousAttempt
}: {
  doc: string
  baseDoc: string
  owner: string
} & Actions) {
  const instanceId = useId()
  const store = useSyncExternalStore(subscribeStudyInkStore, getStudyInkSnapshot, getStudyInkServerSnapshot)
  const {
    tool,
    activeDrawer,
    styles,
    onlyPen,
    onlyMarker,
    cut,
    radius,
    straightMarker,
    autoGestureEnabled,
    portalHostId
  } = store
  const isPortalHost = portalHostId === instanceId
  const canSyncCloud = owner !== 'guest'

  const anchor = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [mounted, setMounted] = useState(false)
  const [selection, setSelection] = useState<string[]>([])
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number } | null>(null)
  const isDraggingSelection = useRef<{ startX: number; startY: number; initialStrokes: InkStroke[] } | null>(null)
  const [erasedIds, setErasedIds] = useState<string[]>([])
  const [counts, setCounts] = useState<[number, number]>([0, 0])
  const [blocks, setBlocks] = useState<Record<string, InkBox>>({})
  const [storedStrokes, setStrokes] = useState<InkStroke[]>(() => getSynchronousLocalInk(baseDoc, attemptNumber))
  const strokes = useMemo(() => storedStrokes.map((s) => projectInk(s, blocks)), [storedStrokes, blocks])
  const [previousStrokes, setPreviousStrokes] = useState<InkStroke[]>(() =>
    attemptNumber > 1 ? getSynchronousLocalInk(baseDoc, attemptNumber - 1) : []
  )
  const [internalShowPreviousAttempt, setInternalShowPreviousAttempt] = useState(false)
  const isPreviousAttemptShown =
    typeof propShowPreviousAttempt === 'boolean' ? propShowPreviousAttempt : internalShowPreviousAttempt

  const togglePreviousAttempt = useCallback(() => {
    if (onTogglePreviousAttempt) {
      onTogglePreviousAttempt()
    } else {
      setInternalShowPreviousAttempt((prev) => !prev)
    }
  }, [onTogglePreviousAttempt])

  const [postIts, setPostIts] = useState<StickyPostIt[]>(() => readNotes(baseDoc, attemptNumber))
  const [ready, setReady] = useState(false)
  const eraserCircleRef = useRef<SVGCircleElement>(null)
  const activeTouches = useRef<Map<number, { x: number; y: number; time: number }>>(new Map())
  const twoFingerUndoCandidate = useRef<boolean>(false)
  const blockedInteractiveTarget = useRef<HTMLElement | null>(null)
  const barrelHoverArmedUntil = useRef<number>(0)
  const enteredEraseViaAirClick = useRef<boolean>(false)

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
    barrelLocked: boolean
    isAndroidAirMode: boolean
    pendingAirCheck: boolean
    startedWithZeroPressurePen: boolean
    maxPressure: number
    startTime: number
    lastEraserPt: InkPoint | null
    stroke: InkStroke
    erased: Map<string, InkStroke>
    markerLineY: number | null
  } | null>(null)

  const [preview, setPreview] = useState<InkStroke | null>(null)
  const undo = useRef<InkChange[]>([])
  const redo = useRef<InkChange[]>([])
  const checkpoint = useRef(0)

  const effectiveRadius = Math.max(radius * 1.4, 22)

  function updateEraserCursor(pt: InkPoint | null) {
    const circle = eraserCircleRef.current
    if (!circle) return
    if (!pt) {
      circle.style.display = 'none'
      return
    }
    circle.setAttribute('cx', String(pt.x))
    circle.setAttribute('cy', String(pt.y))
    circle.setAttribute('r', String(effectiveRadius))
    circle.style.display = ''
  }

  useEffect(() => {
    hydrateStudyInkPreferences(owner)
  }, [owner])

  useEffect(() => {
    registerInkInstance(instanceId, doc)
    return () => {
      unregisterInkInstance(instanceId)
    }
  }, [instanceId, doc])

  useEffect(() => {
    setMounted(true)
    setPostIts(readNotes(baseDoc, attemptNumber))

    let live = true
    const load = async () => {
      try {
        const records = await readInk(baseDoc, attemptNumber, { syncCloud: canSyncCloud })
        if (live) {
          setStrokes((unsaved.get(doc) ?? []).reduce(applyInk, records))
          setReady(true)
        }
        if (attemptNumber > 1) {
          const prevRecords = await readInk(baseDoc, attemptNumber - 1, { syncCloud: canSyncCloud })
          if (live) setPreviousStrokes(prevRecords)
        }
      } catch {
        if (live) setReady(true)
      }
    }

    const previous = histories.get(doc)
    if (previous) {
      undo.current = previous.undo
      redo.current = previous.redo
      setCounts([previous.undo.length, previous.redo.length])
    } else {
      undo.current = []
      redo.current = []
      setCounts([0, 0])
    }

    const updates = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('private-study-ink') : null
    if (updates) {
      updates.onmessage = (event) => {
        if (event.data === doc) void load()
      }
    }

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
    let measureRaf = 0
    const scheduleMeasure = () => {
      if (measureRaf) cancelAnimationFrame(measureRaf)
      measureRaf = requestAnimationFrame(measureBlocks)
    }
    const mutationObserver = new MutationObserver(scheduleMeasure)
    if (anchor.current?.parentElement) {
      observer.observe(anchor.current.parentElement)
      mutationObserver.observe(anchor.current.parentElement, { childList: true, subtree: true })
    }

    return () => {
      live = false
      updates?.close()
      window.removeEventListener('beforeunload', leave)
      observer.disconnect()
      mutationObserver.disconnect()
      if (measureRaf) cancelAnimationFrame(measureRaf)
      window.removeEventListener('resize', measureBlocks)
      if (touchState.current?.rafId) cancelAnimationFrame(touchState.current.rafId)
      if (active.current) {
        active.current = null
        setInkDrawing(false)
      }
    }
  }, [doc, baseDoc, attemptNumber, canSyncCloud])

  // Global keyboard shortcuts handled once by the portal host
  useEffect(() => {
    if (!isPortalHost) return
    const keyHandler = (e: KeyboardEvent) => {
      const target = e.target
      const isEditingText =
        target instanceof HTMLElement && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
      if (e.isComposing || isEditingText) return

      const snap = getStudyInkSnapshot()
      if ((e.ctrlKey || e.metaKey) && snap.open) {
        const key = e.key.toLowerCase()
        if (key === 'z' && !e.shiftKey) {
          e.preventDefault()
          getActiveInkHandlers()?.undo()
          return
        }
        if (key === 'y' || (key === 'z' && e.shiftKey)) {
          e.preventDefault()
          getActiveInkHandlers()?.redo()
          return
        }
      }

      if (
        e.repeat ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.key.toLowerCase() !== 'p' ||
        document.querySelector('[aria-modal="true"]')
      ) {
        return
      }
      e.preventDefault()
      toggleInkOpen()
    }
    window.addEventListener('keydown', keyHandler)
    return () => window.removeEventListener('keydown', keyHandler)
  }, [isPortalHost])

  const write = useCallback(
    (change: InkChange) => {
      histories.set(doc, { undo: undo.current, redo: redo.current })
      setCounts([undo.current.length, redo.current.length])
      setStrokes((items) => applyInk(items, change))
      const pending = unsaved.get(doc) ?? []
      pending.push(change)
      unsaved.set(doc, pending)
      void flush(doc, baseDoc, attemptNumber, canSyncCloud)
    },
    [doc, baseDoc, attemptNumber, canSyncCloud]
  )

  const commit = useCallback(
    (change: InkChange) => {
      undo.current.push(change)
      redo.current = []
      write(change)
    },
    [write]
  )

  const handleUndo = useCallback(() => {
    const change = undo.current.pop()
    if (!change) return
    redo.current.push(change)
    write({ before: change.after, after: change.before })
  }, [write])

  const handleRedo = useCallback(() => {
    const change = redo.current.pop()
    if (!change) return
    undo.current.push(change)
    write(change)
  }, [write])

  const handleClearAll = useCallback(() => {
    setStrokes((current) => {
      if (current.length > 0) {
        commit({ before: current, after: [] })
      }
      return []
    })
    setPostIts([])
    saveNotes(baseDoc, attemptNumber, [])
    setSelection([])
  }, [commit, baseDoc, attemptNumber])

  useEffect(() => {
    setInkDocHandlers(doc, {
      undo: handleUndo,
      redo: handleRedo,
      clearAll: handleClearAll,
      togglePreviousAttempt,
      counts,
      strokeCount: strokes.length + postIts.length,
      attemptNumber,
      showPreviousAttempt: isPreviousAttemptShown
    })
  }, [
    doc,
    handleUndo,
    handleRedo,
    handleClearAll,
    togglePreviousAttempt,
    counts,
    strokes.length,
    postIts.length,
    attemptNumber,
    isPreviousAttemptShown
  ])

  function updatePostIts(updater: (prev: StickyPostIt[]) => StickyPostIt[]) {
    setPostIts((prev) => {
      const next = updater(prev)
      saveNotes(baseDoc, attemptNumber, next)
      return next
    })
  }

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
    if (e.pointerType === 'touch') {
      const touchInfo = activeTouches.current.get(e.pointerId)
      if (touchInfo && Math.hypot(e.clientX - touchInfo.x, e.clientY - touchInfo.y) > 16) {
        twoFingerUndoCandidate.current = false
      }
    }

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
    const coalesced = e.nativeEvent.getCoalescedEvents?.()
    const events = coalesced && coalesced.length > 0 ? coalesced : [e.nativeEvent]
    const prevErasedSize = current.erased.size

    for (const event of events) {
      let p = point(event)
      if (event.pressure > current.maxPressure) {
        current.maxPressure = event.pressure
      }

      if (!current.barrelLocked) {
        if (current.pendingAirCheck) {
          if (isAndroidAirBarrel(event)) {
            current.isEraser = true
            current.barrelLocked = true
            current.isAndroidAirMode = true
            current.pendingAirCheck = false
            current.stroke.points = []
            current.lastEraserPt = null
            barrelHoverArmedUntil.current = performance.now() + 2000
          } else if (event.pressure > 0) {
            current.pendingAirCheck = false
          }
        }

        const isBarrel = isBarrelOrEraser(event)
        if (isBarrel && !current.isEraser) {
          current.isEraser = true
          current.barrelLocked = true
          current.stroke.points = []
          current.lastEraserPt = null
        }
      }
      const isEraserNow = current.isEraser || tool === 'erase'

      // In Android air-hover barrel mode (pressure === 0 before touching glass), show cursor via DOM ref without drawing/erasing yet
      if (current.isAndroidAirMode && event.pressure === 0 && !isBarrelOrEraser(event) && tool !== 'erase') {
        updateEraserCursor(p)
        continue
      }

      if (!isEraserNow && tool === 'marker' && straightMarker) {
        const snapped = snapMarkerPoint(p, current.markerLineY)
        p = snapped.point
        current.markerLineY = snapped.snappedY
      }

      current.stroke.points.push(p)

      if (isEraserNow) {
        const fromPt = current.lastEraserPt ?? p
        for (const stroke of strokes) {
          if (
            isStrokeVisible(stroke) &&
            (!onlyMarker || stroke.kind === 'marker') &&
            !current.erased.has(stroke.id) &&
            touchesInkSegment(stroke, fromPt, p, effectiveRadius)
          ) {
            current.erased.set(stroke.id, stroke)
          }
        }
        current.lastEraserPt = p
      }
    }

    if ((current.isEraser || tool === 'erase') && current.erased.size !== prevErasedSize) {
      setErasedIds([...current.erased.keys()])
    }

    if (
      (tool === 'pen' || tool === 'marker') &&
      !current.isEraser &&
      !current.pendingAirCheck &&
      performance.now() - checkpoint.current > 1000
    ) {
      checkpoint.current = performance.now()
      const partial = { ...current.stroke, points: [...current.stroke.points] }
      const pending = unsaved.get(doc) ?? []
      pending.push({ before: [], after: [partial] })
      unsaved.set(doc, pending)
      void flush(doc, baseDoc, attemptNumber, canSyncCloud)
    }

    if (current.isEraser || current.pendingAirCheck || tool === 'erase') {
      if (preview !== null) setPreview(null)
    } else {
      setPreview({ ...current.stroke })
    }
  }

  function finish() {
    updateEraserCursor(null)
    const current = active.current
    if (!current) {
      setInkDrawing(false)
      return
    }
    active.current = null
    setInkDrawing(false)
    barrelHoverArmedUntil.current = 0

    // Quick click of the S Pen side button in the air (pressure stayed 0 and nothing touched): toggle Pen <-> Eraser
    const isQuickAirClick =
      (current.isAndroidAirMode || current.pendingAirCheck || current.startedWithZeroPressurePen) &&
      current.maxPressure === 0 &&
      current.erased.size === 0 &&
      performance.now() - current.startTime < 450

    if (isQuickAirClick && tool !== 'erase') {
      enteredEraseViaAirClick.current = true
      setInkToolDirect('erase')
      setErasedIds([])
      setPreview(null)
      return
    }
    if (isQuickAirClick && tool === 'erase' && enteredEraseViaAirClick.current) {
      enteredEraseViaAirClick.current = false
      setInkToolDirect('pen')
      setErasedIds([])
      setPreview(null)
      return
    }
    if (current.maxPressure > 0 || current.erased.size > 0) {
      enteredEraseViaAirClick.current = false
    }

    let bestBlock: [string, InkBox] | undefined
    if (current.stroke.points.length) {
      let bestHits = 0
      let bestArea = Infinity
      for (const entry of Object.entries(blocks)) {
        const [, box] = entry
        const hits = current.stroke.points.filter(
          (p) => p.x >= box.x - 48 && p.y >= box.y - 16 && p.x <= box.x + box.width + 20 && p.y <= box.y + box.height + 16
        ).length
        const area = box.width * box.height
        if (hits >= current.stroke.points.length * 0.5 && (hits > bestHits || (hits === bestHits && area < bestArea))) {
          bestHits = hits
          bestArea = area
          bestBlock = entry
        }
      }
    }
    if (bestBlock) current.stroke.anchor = { block: bestBlock[0], box: bestBlock[1] }

    if (current.isEraser || tool === 'erase') {
      if (cut) {
        const before: InkStroke[] = []
        const after: InkStroke[] = []
        for (const stroke of strokes.filter((s) => isStrokeVisible(s) && (!onlyMarker || s.kind === 'marker'))) {
          const pieces = cutInk(stroke, current.stroke.points, effectiveRadius)
          if (pieces.length !== 1 || pieces[0] !== stroke) {
            before.push(stroke)
            after.push(...pieces)
          }
        }
        if (before.length) commit({ before, after })
      } else if (current.erased.size) {
        commit({ before: [...current.erased.values()], after: [] })
      }
      setErasedIds([])
    } else if (tool === 'lasso') {
      setSelection(strokes.filter((s) => s.points.some((p) => insideLasso(p, current.stroke.points))).map((s) => s.id))
    } else if (tool === 'line' && current.stroke.points.length) {
      const pts = current.stroke.points
      commit({ before: [], after: [{ ...current.stroke, points: [pts[0], pts[pts.length - 1]] }] })
    } else if (current.stroke.points.length) {
      // 1. Scratch-out gesture in pen mode erases overlapped strokes
      if (tool === 'pen' && detectScratchOut(current.stroke)) {
        const pts = current.stroke.points
        let minX = Infinity
        let maxX = -Infinity
        let minY = Infinity
        let maxY = -Infinity
        for (const p of pts) {
          if (p.x < minX) minX = p.x
          if (p.x > maxX) maxX = p.x
          if (p.y < minY) minY = p.y
          if (p.y > maxY) maxY = p.y
        }
        const box = { x: minX - 12, y: minY - 12, width: maxX - minX + 24, height: maxY - minY + 24 }
        const scratched = strokes.filter((s) =>
          s.points.some((p) => p.x >= box.x && p.x <= box.x + box.width && p.y >= box.y && p.y <= box.y + box.height)
        )
        if (scratched.length > 0) {
          commit({ before: scratched, after: [] })
          setPreview(null)
          return
        }
      }

      commit({ before: [], after: [current.stroke] })

      // 2. Option gestures: O / X on letter badge selects; X / cut on text eliminates
      if ((choose || eliminate) && autoGestureEnabled && (tool === 'pen' || tool === 'gesture')) {
        const container = anchor.current?.parentElement
        const cardRect = svgRef.current?.getBoundingClientRect()
        if (container && cardRect) {
          const rows = Array.from(container.querySelectorAll<HTMLElement>('[data-ink-option-row]'))
          const targets: OptionTarget[] = rows
            .map((row) => {
              const option = row.dataset.inkOptionRow ?? ''
              if (!option) return null
              const badge = row.querySelector<HTMLElement>('[data-ink-option]') ?? row
              const textEl = row.querySelector<HTMLElement>('[data-ink-block]')
              const rBadge = badge.getBoundingClientRect()
              const rRow = row.getBoundingClientRect()
              const rText = textEl?.getBoundingClientRect()
              const textBox: InkBox =
                rText && textEl !== row
                  ? {
                      x: rText.left - cardRect.left,
                      y: rText.top - cardRect.top,
                      width: rText.width,
                      height: rText.height
                    }
                  : {
                      x: rBadge.right - cardRect.left + 4,
                      y: rRow.top - cardRect.top,
                      width: Math.max(0, rRow.right - rBadge.right - 8),
                      height: rRow.height
                    }

              return {
                option,
                center: {
                  x: rBadge.left + rBadge.width / 2 - cardRect.left,
                  y: rBadge.top + rBadge.height / 2 - cardRect.top,
                  force: 1
                },
                box: {
                  x: rBadge.left - cardRect.left,
                  y: rBadge.top - cardRect.top,
                  width: rBadge.width,
                  height: rBadge.height
                },
                rowBox: {
                  x: rRow.left - cardRect.left,
                  y: rRow.top - cardRect.top,
                  width: rRow.width,
                  height: rRow.height
                },
                textBox
              }
            })
            .filter((item): item is NonNullable<typeof item> => item !== null) as OptionTarget[]

          const gesture = detectOptionGesture(current.stroke, strokes.slice(-4), targets)
          if (gesture) {
            if (gesture.action === 'select' && choose) {
              choose(gesture.option)
            } else if (gesture.action === 'eliminate' && eliminate && !gesture.completesRecentStrike) {
              eliminate(gesture.option)
            }
          }
        }
      }
    }
    setPreview(null)
  }

  function handleSelectionDragStart(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button > 1) return
    e.stopPropagation()
    setActiveInkDoc(doc)
    const pt = point(e.nativeEvent)
    const selectedStrokes = strokes.filter((s) => selection.includes(s.id))
    isDraggingSelection.current = {
      startX: pt.x,
      startY: pt.y,
      initialStrokes: selectedStrokes
    }
    setDragOffset({ dx: 0, dy: 0 })
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}
  }

  function handleSelectionDragMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!isDraggingSelection.current) return
    e.stopPropagation()
    const pt = point(e.nativeEvent)
    setDragOffset({
      dx: pt.x - isDraggingSelection.current.startX,
      dy: pt.y - isDraggingSelection.current.startY
    })
  }

  function handleSelectionDragEnd(e: ReactPointerEvent<HTMLDivElement>) {
    if (!isDraggingSelection.current) return
    e.stopPropagation()
    const pt = point(e.nativeEvent)
    const dx = pt.x - isDraggingSelection.current.startX
    const dy = pt.y - isDraggingSelection.current.startY
    const initial = isDraggingSelection.current.initialStrokes
    isDraggingSelection.current = null
    setDragOffset(null)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}

    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      const after = initial.map((s) => ({
        ...s,
        points: s.points.map((p) => ({ ...p, x: p.x + dx, y: p.y + dy }))
      }))
      commit({ before: initial, after })
    }
  }

  function changeSelectionColor(newColor: string) {
    if (!selection.length) return
    const objects = strokes.filter((s) => selection.includes(s.id))
    if (!objects.length) return
    commit({ before: objects, after: objects.map((s) => ({ ...s, color: newColor })) })
  }

  function deleteSelection() {
    if (!selection.length) return
    const objects = strokes.filter((s) => selection.includes(s.id))
    if (!objects.length) return
    commit({ before: objects, after: [] })
    setSelection([])
  }

  function duplicateSelection() {
    if (!selection.length) return
    const objects = strokes.filter((s) => selection.includes(s.id))
    if (!objects.length) return
    const offset = 20
    const after = objects.map((s) => ({
      ...s,
      id: crypto.randomUUID(),
      created: Date.now(),
      points: s.points.map((p) => ({ ...p, x: p.x + offset, y: p.y + offset }))
    }))
    commit({ before: [], after })
    setSelection(after.map((s) => s.id))
  }

  function start(e: ReactPointerEvent<SVGSVGElement>) {
    if (!ready || tool === 'read') return
    if (e.button > 2 && e.button !== 5) return

    // If an air-only Android barrel session is still active when the nib physically touches the glass, promote seamlessly
    if (active.current) {
      if (
        (active.current.isAndroidAirMode || active.current.pendingAirCheck) &&
        active.current.maxPressure === 0 &&
        e.pointerType === 'pen' &&
        e.pressure > 0
      ) {
        active.current = null
        barrelHoverArmedUntil.current = performance.now() + 2000
      } else if (e.pointerType === 'pen' && active.current.isEraser && active.current.pointer !== e.pointerId) {
        active.current.pointer = e.pointerId
        if (e.pressure > 0) {
          try {
            e.currentTarget.setPointerCapture(e.pointerId)
          } catch {}
        }
        sample(e)
        return
      } else {
        return
      }
    }

    setActiveInkDoc(doc)

    if (activeDrawer) setInkDrawer(null)

    if (e.pointerType === 'touch') {
      activeTouches.current.set(e.pointerId, { x: e.clientX, y: e.clientY, time: performance.now() })
      if (activeTouches.current.size === 2) {
        twoFingerUndoCandidate.current = true
      }
    }

    // Dual-input: finger always scrolls smoothly even if starting over an option or button
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
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {}
      return
    }

    // Avoid drawing over small UI action buttons (ZoomIn, Strikethrough, Confirm, etc.)
    const interactiveEl = findInteractiveUnderPointer(e.clientX, e.clientY, svgRef.current)
    if (interactiveEl) {
      blockedInteractiveTarget.current = interactiveEl
      return
    }
    blockedInteractiveTarget.current = null

    const standardBarrel = isBarrelOrEraser(e.nativeEvent)
    const recentlyBarrelHover = e.pointerType === 'pen' && performance.now() <= barrelHoverArmedUntil.current
    const androidAirDown = isAndroidAirBarrel(e.nativeEvent)
    const isBarrel = standardBarrel || recentlyBarrelHover
    if ((standardBarrel || androidAirDown) && e.pointerType === 'pen') {
      e.preventDefault()
    }

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
      updatePostIts((prev) => [...prev, newPostIt])
      setInkToolDirect('read')
      setInkDrawing(false)
      return
    }

    setInkDrawing(true)
    if (!(e.pointerType === 'pen' && e.pressure === 0)) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {}
    }
    checkpoint.current = performance.now()
    const kind = isBarrel || tool === 'erase' ? 'pen' : tool === 'marker' ? 'marker' : 'pen'
    const initialPt = point(e.nativeEvent)

    active.current = {
      pointer: e.pointerId,
      isEraser: isBarrel || tool === 'erase',
      barrelLocked: isBarrel,
      isAndroidAirMode: recentlyBarrelHover,
      pendingAirCheck: tool !== 'erase' && !isBarrel && androidAirDown,
      startedWithZeroPressurePen: !standardBarrel && androidAirDown,
      maxPressure: e.pressure || 0,
      startTime: performance.now(),
      lastEraserPt: null,
      erased: new Map(),
      markerLineY: initialPt.y,
      stroke: { ...styles[kind], kind, id: crypto.randomUUID(), created: Date.now(), points: [] }
    }
    sample(e)
  }

  function render(stroke: InkStroke, isGhost = false, isPendingCut = false) {
    if (!stroke.points.length) return null
    if (stroke.text !== undefined) {
      const p = stroke.points[0]
      return (
        <text
          key={stroke.id}
          x={p.x}
          y={p.y}
          fill={stroke.color}
          fontSize={Math.max(14, stroke.width * 8)}
          className="font-sans font-medium"
          opacity={isGhost ? 0.35 : 1}
        >
          {stroke.text.split('\n').map((line, i) => (
            <tspan key={i} x={p.x} dy={i ? '1.25em' : 0}>
              {line}
            </tspan>
          ))}
        </text>
      )
    }

    const isLassoStroke = (stroke.kind as string) === 'lasso' || (tool === 'lasso' && stroke.id === preview?.id)
    if (isLassoStroke) {
      const coords = stroke.points.map((p) => `${p.x},${p.y}`).join(' ')
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

    const coords = stroke.points.map((p) => `${p.x},${p.y}`).join(' ')
    const first = stroke.points[0]
    const isSelected = selection.includes(stroke.id)

    return (
      <g
        key={stroke.id}
        transform={isSelected && dragOffset ? `translate(${dragOffset.dx}, ${dragOffset.dy})` : undefined}
        style={{
          filter: tool === 'lasso' && isSelected ? 'drop-shadow(0 0 4px #38bdf8)' : undefined
        }}
        opacity={isGhost ? 0.35 : isPendingCut ? stroke.opacity * 0.4 : stroke.opacity}
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

  const hasMeasuredBlocks = Object.keys(blocks).length > 0
  const isStrokeVisible = (s: InkStroke) => !s.anchor || !hasMeasuredBlocks || Boolean(blocks[s.anchor.block])

  const visible = [
    ...strokes.filter((s) => isStrokeVisible(s) && (cut || !erasedIds.includes(s.id)) && s.id !== preview?.id),
    ...(preview && tool !== 'erase' ? [preview] : [])
  ]

  const selectedStrokes = strokes.filter((s) => selection.includes(s.id))
  let selBox: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } | null = null
  if (selectedStrokes.length > 0) {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const s of selectedStrokes) {
      for (const p of s.points) {
        if (p.x < minX) minX = p.x
        if (p.x > maxX) maxX = p.x
        if (p.y < minY) minY = p.y
        if (p.y > maxY) maxY = p.y
      }
    }
    if (minX !== Infinity) {
      const padding = 12
      selBox = {
        minX: Math.max(0, minX - padding),
        minY: Math.max(0, minY - padding),
        maxX: maxX + padding,
        maxY: maxY + padding,
        width: Math.max(48, maxX - minX + padding * 2),
        height: Math.max(36, maxY - minY + padding * 2)
      }
    }
  }

  return (
    <>
      {/* 1. CAMADA DE FUNDO: MARCA-TEXTO ATRÁS DAS FONTES (z=1) */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] w-full h-full"
        style={{ zIndex: 1 }}
      >
        <svg aria-hidden="true" className="w-full h-full overflow-visible" style={{ pointerEvents: 'none' }}>
          {isPreviousAttemptShown && previousStrokes.length > 0 && (
            <g className="ghost-previous-attempt">
              {previousStrokes.filter((s) => s.kind === 'marker').map((s) => render(s, true))}
            </g>
          )}
          <g>
            {visible
              .filter((s) => s.kind === 'marker')
              .map((s) => render(s, false, cut && erasedIds.includes(s.id)))}
          </g>
        </svg>
      </div>

      {/* 2. CAMADA FRONTAL DE ESCRITA E INTERAÇÃO (z=10, sempre acima de z-[2] do enunciado/alternativas) */}
      <div
        ref={anchor}
        className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] w-full h-full"
        style={{ zIndex: 10 }}
      >
        <svg
          ref={svgRef}
          aria-hidden="true"
          onContextMenu={(e) => e.preventDefault()}
          className="w-full h-full overflow-visible text-zinc-900 dark:text-zinc-100"
          style={{
            touchAction: tool === 'read' ? 'auto' : 'none',
            pointerEvents: tool === 'read' ? 'none' : 'auto',
            cursor: tool === 'read' ? 'default' : tool === 'erase' ? 'cell' : 'crosshair'
          }}
          onPointerDown={start}
          onPointerMove={(e) => {
            const androidAirHover = isAndroidAirBarrel(e.nativeEvent)
            if (androidAirHover) {
              barrelHoverArmedUntil.current = performance.now() + 2000
            }
            const barrelHover = isBarrelOrEraser(e.nativeEvent) || androidAirHover
            if (tool === 'erase' || active.current?.isEraser || barrelHover) {
              updateEraserCursor(point(e.nativeEvent))
            } else {
              updateEraserCursor(null)
            }
            sample(e)
          }}
          onPointerLeave={() => updateEraserCursor(null)}
          onPointerUp={(e) => {
            if (e.pointerType === 'touch') {
              const touchInfo = activeTouches.current.get(e.pointerId)
              const isCandidate = twoFingerUndoCandidate.current
              const wasTwoFinger = activeTouches.current.size >= 2
              activeTouches.current.delete(e.pointerId)

              if (isCandidate && wasTwoFinger && touchInfo && performance.now() - touchInfo.time < 450) {
                twoFingerUndoCandidate.current = false
                handleUndo()
                triggerUndoFeedback()
                return
              }
              if (activeTouches.current.size === 0) {
                twoFingerUndoCandidate.current = false
              }
            }

            if (e.pointerType === 'touch' && touchState.current) {
              const ts = touchState.current
              try {
                e.currentTarget.releasePointerCapture(e.pointerId)
              } catch {}

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
                const interactive = findInteractiveUnderPointer(e.clientX, e.clientY, svgRef.current)
                if (interactive && typeof interactive.click === 'function') {
                  interactive.click()
                  return
                }
                const elements = document.elementsFromPoint(e.clientX, e.clientY)
                const optEl = elements.find(
                  (el) => el.hasAttribute('data-ink-option') || el.hasAttribute('data-ink-option-row')
                ) as HTMLElement | undefined
                const optLetter = optEl?.getAttribute('data-ink-option') || optEl?.getAttribute('data-ink-option-row')
                if (optLetter && choose) {
                  choose(optLetter)
                  return
                }
              }
              return
            }

            if (active.current?.pointer === e.pointerId) {
              if (active.current.barrelLocked && e.pointerType === 'pen' && e.pressure > 0) {
                return
              }
              sample(e)
              finish()
            }
          }}
          onLostPointerCapture={(e) => {
            updateEraserCursor(null)
            setInkDrawing(false)
            if (touchState.current) touchState.current = null
            activeTouches.current.clear()
            twoFingerUndoCandidate.current = false
            if (active.current?.pointer === e.pointerId) finish()
          }}
          onPointerCancel={(e) => {
            updateEraserCursor(null)
            setInkDrawing(false)
            if (touchState.current?.rafId) cancelAnimationFrame(touchState.current.rafId)
            touchState.current = null
            activeTouches.current.clear()
            twoFingerUndoCandidate.current = false
            if (active.current?.pointer === e.pointerId) finish()
          }}
          onClick={(e) => {
            e.stopPropagation()
            const target = blockedInteractiveTarget.current
            blockedInteractiveTarget.current = null
            if (target) {
              if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
                target.focus()
              }
              if (typeof target.click === 'function') {
                target.click()
              }
            }
          }}
        >
          {isPreviousAttemptShown && previousStrokes.length > 0 && (
            <g className="ghost-previous-attempt">
              {previousStrokes.filter((s) => s.kind !== 'marker').map((s) => render(s, true))}
            </g>
          )}

          <g>
            {visible
              .filter((s) => s.kind !== 'marker')
              .map((s) => render(s, false, cut && erasedIds.includes(s.id)))}
          </g>

          {preview && preview.kind === 'marker' && render(preview, false)}

          <circle
            ref={eraserCircleRef}
            cx={0}
            cy={0}
            r={effectiveRadius}
            fill="rgba(244,63,94,0.15)"
            stroke="#f43f5e"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            pointerEvents="none"
            style={{ display: 'none' }}
          />
        </svg>

        {postIts.map((p) => {
          const colorCfg = NOTE_COLORS[p.colorIdx] || NOTE_COLORS[0]
          return (
            <div
              key={p.id}
              data-no-ink="true"
              style={{ left: `${p.x}px`, top: `${p.y}px` }}
              className="absolute pointer-events-auto z-[4] select-text animate-in fade-in zoom-in-95"
            >
              {p.minimized ? (
                <button
                  type="button"
                  onClick={() => updatePostIts((prev) => prev.map((item) => (item.id === p.id ? { ...item, minimized: false } : item)))}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold shadow-lg flex items-center gap-1.5 border border-white/20 active:scale-95 transition-transform cursor-pointer ${colorCfg.badge}`}
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
                        onClick={() =>
                          updatePostIts((prev) =>
                            prev.map((item) => (item.id === p.id ? { ...item, colorIdx: (item.colorIdx + 1) % NOTE_COLORS.length } : item))
                          )
                        }
                        className="p-1 hover:bg-white/10 rounded text-[10px] cursor-pointer"
                        title="Mudar cor do post-it"
                      >
                        🎨
                      </button>
                      <button
                        type="button"
                        onClick={() => updatePostIts((prev) => prev.map((item) => (item.id === p.id ? { ...item, minimized: true } : item)))}
                        className="p-1 hover:bg-white/10 rounded cursor-pointer"
                        title="Minimizar para badge"
                      >
                        <Minimize2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updatePostIts((prev) => prev.filter((item) => item.id !== p.id))}
                        className="p-1 hover:bg-rose-500/20 text-rose-300 rounded cursor-pointer"
                        title="Excluir nota"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={p.text}
                    onChange={(e) => {
                      const val = e.target.value
                      updatePostIts((prev) => prev.map((item) => (item.id === p.id ? { ...item, text: val } : item)))
                    }}
                    placeholder="Escreva ou digite observações clínicas..."
                    className="w-full bg-black/20 rounded-xl p-2 text-xs placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 resize-none font-sans"
                  />
                </div>
              )}
            </div>
          )
        })}

        {tool === 'lasso' && selBox && (
          <div
            data-no-ink="true"
            style={{
              left: `${selBox.minX + (dragOffset?.dx || 0)}px`,
              top: `${selBox.minY + (dragOffset?.dy || 0)}px`,
              width: `${selBox.width}px`,
              height: `${selBox.height}px`
            }}
            className="absolute pointer-events-auto border-2 border-dashed border-sky-400 bg-sky-500/10 rounded-xl cursor-move z-[8] select-none touch-none"
            onPointerDown={handleSelectionDragStart}
            onPointerMove={handleSelectionDragMove}
            onPointerUp={handleSelectionDragEnd}
            onPointerCancel={handleSelectionDragEnd}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity pointer-events-none">
              <span className="bg-sky-950/80 text-sky-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-400/50 flex items-center gap-1 shadow-md">
                <Move className="w-3 h-3" /> Arrastar seleção
              </span>
            </div>

            <div
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                bottom: selBox.minY < 50 ? undefined : 'calc(100% + 8px)',
                top: selBox.minY < 50 ? 'calc(100% + 8px)' : undefined
              }}
              className="absolute left-1/2 -translate-x-1/2 bg-zinc-950/95 border border-zinc-700/80 text-zinc-100 rounded-2xl p-1.5 shadow-2xl backdrop-blur-xl flex items-center gap-1.5 text-xs font-medium z-[12] whitespace-nowrap animate-in fade-in zoom-in-95"
            >
              <div className="flex items-center gap-1 pl-1 pr-1.5 border-r border-zinc-800">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => changeSelectionColor(c.value)}
                    title={`Mudar cor da seleção para ${c.name}`}
                    className={`w-5 h-5 rounded-full transition-transform hover:scale-125 cursor-pointer ${c.border ?? ''} ${c.bg ?? 'bg-emerald-500'}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={duplicateSelection}
                title="Duplicar traços selecionados"
                className="p-1 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={deleteSelection}
                title="Excluir traços selecionados"
                className="p-1 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setSelection([])}
                title="Fechar seleção"
                className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Renderiza exatamente UMA barra de ferramentas global na página */}
      {mounted && isPortalHost && (
        <StudyInkToolbar
          state={store}
          onRequestClearConfirm={() => {
            if (window.confirm('Limpar todas as anotações desta questão?')) {
              getActiveInkHandlers()?.clearAll()
            }
          }}
        />
      )}
    </>
  )
}

export function StudyInkLayer({
  content,
  flip,
  choose,
  eliminate,
  attemptNumber = 1,
  showPreviousAttempt,
  onTogglePreviousAttempt
}: {
  content: string
  attemptNumber?: number
  showPreviousAttempt?: boolean
  onTogglePreviousAttempt?: () => void
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
      eliminate={eliminate}
      attemptNumber={attemptNumber}
      showPreviousAttempt={showPreviousAttempt}
      onTogglePreviousAttempt={onTogglePreviousAttempt}
    />
  )
}
