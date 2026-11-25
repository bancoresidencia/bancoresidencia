import type { InkStroke } from './studyInk'

export type Tool = 'read' | 'pen' | 'marker' | 'erase' | 'lasso' | 'line' | 'note' | 'gesture'
export type Style = Pick<InkStroke, 'color' | 'width' | 'opacity' | 'pressure'>
export type DockPosition = 'right' | 'left' | 'top'

export interface InkDocHandlers {
  undo: () => void
  redo: () => void
  clearAll: () => void
  togglePreviousAttempt?: () => void
  counts: [number, number]
  strokeCount: number
  attemptNumber: number
  showPreviousAttempt: boolean
}

export interface StudyInkGlobalState {
  owner: string
  open: boolean
  tool: Tool
  dockPosition: DockPosition
  isDockCollapsed: boolean
  activeDrawer: Tool | 'history' | null
  styles: { pen: Style; marker: Style }
  onlyPen: boolean
  onlyMarker: boolean
  cut: boolean
  radius: number
  straightMarker: boolean
  autoGestureEnabled: boolean
  isDrawing: boolean
  undoFeedback: boolean
  portalHostId: string | null
  activeDocKey: string | null
  docMetaVersion: number
}

const DEFAULT_PEN: Style = { color: 'currentColor', width: 2, opacity: 1, pressure: false }
const DEFAULT_MARKER: Style = { color: '#facc15', width: 20, opacity: 0.35, pressure: false }

const VALID_TOOLS: readonly Tool[] = ['read', 'pen', 'marker', 'erase', 'lasso', 'line', 'note']

let state: StudyInkGlobalState = {
  owner: 'guest',
  open: false,
  tool: 'read',
  dockPosition: 'right',
  isDockCollapsed: false,
  activeDrawer: null,
  styles: { pen: DEFAULT_PEN, marker: DEFAULT_MARKER },
  onlyPen: true,
  onlyMarker: false,
  cut: false,
  radius: 14,
  straightMarker: true,
  autoGestureEnabled: true,
  isDrawing: false,
  undoFeedback: false,
  portalHostId: null,
  activeDocKey: null,
  docMetaVersion: 0
}

const SERVER_SNAPSHOT: StudyInkGlobalState = state
const listeners = new Set<() => void>()
const instances = new Map<string, { doc: string }>()
const docHandlers = new Map<string, InkDocHandlers>()
let hydratedOwner: string | null = null
let lastToolTap: { tool: Tool; time: number } = { tool: 'read', time: 0 }
let undoFeedbackTimer: ReturnType<typeof setTimeout> | null = null

function emit() {
  for (const listener of listeners) listener()
}

function updateState(patch: Partial<StudyInkGlobalState>) {
  state = { ...state, ...patch }
  emit()
}

function persistPreferences(next: StudyInkGlobalState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('study-ink-open', String(next.open))
    localStorage.setItem('study-ink-tool', next.tool)
    localStorage.setItem(
      `study-ink-style:${next.owner}`,
      JSON.stringify({
        styles: next.styles,
        dockPosition: next.dockPosition,
        cut: next.cut,
        isDockCollapsed: next.isDockCollapsed,
        onlyPen: next.onlyPen,
        onlyMarker: next.onlyMarker,
        radius: next.radius,
        straightMarker: next.straightMarker,
        autoGestureEnabled: next.autoGestureEnabled
      })
    )
  } catch {}
}

export function subscribeStudyInkStore(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getStudyInkSnapshot(): StudyInkGlobalState {
  return state
}

export function getStudyInkServerSnapshot(): StudyInkGlobalState {
  return SERVER_SNAPSHOT
}

export function hydrateStudyInkPreferences(owner: string) {
  if (typeof window === 'undefined') return
  if (hydratedOwner === owner) return
  hydratedOwner = owner

  try {
    const open = localStorage.getItem('study-ink-open') === 'true'
    const rawTool = localStorage.getItem('study-ink-tool') as Tool | null
    const tool: Tool = rawTool && VALID_TOOLS.includes(rawTool) ? rawTool : open ? 'pen' : 'read'
    const saved = JSON.parse(localStorage.getItem(`study-ink-style:${owner}`) || 'null')

    updateState({
      owner,
      open,
      tool,
      styles:
        saved?.styles?.pen && saved?.styles?.marker
          ? saved.styles
          : { pen: DEFAULT_PEN, marker: DEFAULT_MARKER },
      dockPosition: saved?.dockPosition || 'right',
      cut: typeof saved?.cut === 'boolean' ? saved.cut : false,
      isDockCollapsed: typeof saved?.isDockCollapsed === 'boolean' ? saved.isDockCollapsed : false,
      onlyPen: typeof saved?.onlyPen === 'boolean' ? saved.onlyPen : true,
      onlyMarker: typeof saved?.onlyMarker === 'boolean' ? saved.onlyMarker : false,
      radius: typeof saved?.radius === 'number' ? saved.radius : 14,
      straightMarker: typeof saved?.straightMarker === 'boolean' ? saved.straightMarker : true,
      autoGestureEnabled: typeof saved?.autoGestureEnabled === 'boolean' ? saved.autoGestureEnabled : true
    })
  } catch {
    updateState({ owner })
  }
}

export function registerInkInstance(instanceId: string, doc: string) {
  instances.set(instanceId, { doc })
  const patch: Partial<StudyInkGlobalState> = {}
  if (!state.portalHostId || !instances.has(state.portalHostId)) {
    patch.portalHostId = instanceId
  }
  if (!state.activeDocKey || !docHandlers.has(state.activeDocKey)) {
    patch.activeDocKey = doc
  }
  if (Object.keys(patch).length > 0) {
    updateState(patch)
  }
}

export function unregisterInkInstance(instanceId: string) {
  const info = instances.get(instanceId)
  instances.delete(instanceId)
  if (info) {
    const stillUsed = Array.from(instances.values()).some((v) => v.doc === info.doc)
    if (!stillUsed) {
      docHandlers.delete(info.doc)
    }
  }

  const patch: Partial<StudyInkGlobalState> = {}
  if (state.portalHostId === instanceId) {
    const nextHost = instances.keys().next().value ?? null
    patch.portalHostId = nextHost
  }
  if (instances.size === 0) {
    patch.isDrawing = false
    patch.activeDocKey = null
  } else if (state.activeDocKey && !docHandlers.has(state.activeDocKey)) {
    const firstDoc = instances.values().next().value?.doc ?? null
    patch.activeDocKey = firstDoc
  }
  if (Object.keys(patch).length > 0) {
    updateState(patch)
  }
}

export function setInkDocHandlers(doc: string, handlers: InkDocHandlers) {
  docHandlers.set(doc, handlers)
  updateState({ docMetaVersion: state.docMetaVersion + 1 })
}

export function setActiveInkDoc(doc: string) {
  if (state.activeDocKey !== doc) {
    updateState({ activeDocKey: doc })
  }
}

export function getActiveInkHandlers(): InkDocHandlers | null {
  if (state.activeDocKey && docHandlers.has(state.activeDocKey)) {
    return docHandlers.get(state.activeDocKey) ?? null
  }
  const first = docHandlers.values().next().value
  return first ?? null
}

export function setInkOpen(open: boolean) {
  const nextTool: Tool = open ? (state.tool === 'read' ? 'pen' : state.tool) : 'read'
  const next: StudyInkGlobalState = {
    ...state,
    open,
    tool: nextTool,
    activeDrawer: open ? state.activeDrawer : null,
    isDrawing: false
  }
  state = next
  persistPreferences(next)
  emit()
}

export function toggleInkOpen() {
  const nextOpen = !state.open
  const nextTool: Tool = nextOpen ? 'pen' : 'read'
  const next: StudyInkGlobalState = {
    ...state,
    open: nextOpen,
    tool: nextTool,
    activeDrawer: nextOpen ? state.activeDrawer : null,
    isDrawing: false
  }
  state = next
  persistPreferences(next)
  emit()
}

export function selectInkTool(selectedTool: Tool) {
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
  const isDoubleTap =
    state.tool === selectedTool || (lastToolTap.tool === selectedTool && now - lastToolTap.time < 500)
  lastToolTap = { tool: selectedTool, time: now }

  const nextDrawer = isDoubleTap
    ? state.activeDrawer === selectedTool
      ? null
      : selectedTool
    : null

  const next: StudyInkGlobalState = {
    ...state,
    tool: selectedTool,
    activeDrawer: nextDrawer
  }
  state = next
  persistPreferences(next)
  emit()
}

export function setInkToolDirect(tool: Tool) {
  const next: StudyInkGlobalState = { ...state, tool }
  state = next
  persistPreferences(next)
  emit()
}

export function setInkDrawer(drawer: Tool | 'history' | null) {
  updateState({ activeDrawer: drawer })
}

export function setInkDrawing(isDrawing: boolean) {
  if (state.isDrawing !== isDrawing) {
    updateState({ isDrawing })
  }
}

export function triggerUndoFeedback() {
  if (undoFeedbackTimer) clearTimeout(undoFeedbackTimer)
  updateState({ undoFeedback: true })
  undoFeedbackTimer = setTimeout(() => {
    undoFeedbackTimer = null
    updateState({ undoFeedback: false })
  }, 1200)
}

export function updateInkSettings(
  patch: Partial<
    Pick<
      StudyInkGlobalState,
      | 'dockPosition'
      | 'isDockCollapsed'
      | 'styles'
      | 'onlyPen'
      | 'onlyMarker'
      | 'cut'
      | 'radius'
      | 'straightMarker'
      | 'autoGestureEnabled'
    >
  >
) {
  const next: StudyInkGlobalState = { ...state, ...patch }
  state = next
  persistPreferences(next)
  emit()
}
