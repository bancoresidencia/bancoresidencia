'use client'

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/context/AuthContext'
import { applyInk, readInk, saveInk, touchesInk, cutInk, insideLasso, projectInk, type InkBox, type InkChange, type InkPoint, type InkStroke } from '@/services/studyInk'

type Tool = 'read' | 'pen' | 'marker' | 'erase' | 'lasso' | 'line' | 'note' | 'gesture'
type Style = Pick<InkStroke, 'color' | 'width' | 'opacity' | 'pressure'>
const pen: Style = { color: 'currentColor', width: 2, opacity: 1, pressure: false }
const marker: Style = { color: '#facc15', width: 16, opacity: 0.3, pressure: false }
const labels = { read: 'Navegar', pen: 'Caneta', marker: 'Marca-texto', erase: 'Borracha', lasso: 'Laço', line: 'Reta', note: 'Nota', gesture: 'Marcar resposta' }
const unsaved = new Map<string, InkChange[]>()
const histories = new Map<string, { undo: InkChange[]; redo: InkChange[] }>()
const queues = new Map<string, Promise<void>>()
function flush(key: string) {
  const active = queues.get(key)
  if (active) return active
  const pending = unsaved.get(key) ?? []
  const work = (async () => {
    while (pending.length) {
      await saveInk(key, pending[0])
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

type Actions = { flip?: () => void; choose?: (letter: string) => void }
function Editor({ doc, owner, flip, choose }: { doc: string; owner: string } & Actions) {
  const anchor = useRef<HTMLSpanElement>(null)
  const [mounted, setMounted] = useState(false)
  const [tool, setTool] = useState<Tool>('read')
  const [open, setOpen] = useState(false)
  const [styles, setStyles] = useState({ pen, marker })
  const [favorites, setFavorites] = useState<{ kind: 'pen' | 'marker'; style: Style }[]>([])
  const [onlyPen, setOnlyPen] = useState(false)
  const [onlyMarker, setOnlyMarker] = useState(false)
  const [candidate, setCandidate] = useState('')
  const [cut, setCut] = useState(false)
  const [selection, setSelection] = useState<string[]>([])
  const [erasedIds, setErasedIds] = useState<string[]>([])
  const [counts, setCounts] = useState([0, 0])
  const [note, setNote] = useState<InkStroke | null>(null)
  const [compact, setCompact] = useState(false)
  const [radius, setRadius] = useState(12)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [blocks, setBlocks] = useState<Record<string, InkBox>>({})
  const [storedStrokes, setStrokes] = useState<InkStroke[]>([])
  const strokes = storedStrokes.map(s => projectInk(s, blocks))
  const [ready, setReady] = useState(false)
  const [status, setStatus] = useState('')
  const active = useRef<{ pointer: number; stroke: InkStroke; erased: Map<string, InkStroke> } | null>(null)
  const [preview, setPreview] = useState<InkStroke | null>(null)
  const undo = useRef<InkChange[]>([]), redo = useRef<InkChange[]>([])
  const checkpoint = useRef(0)
  const preference = 'study-ink-style:' + owner

  useEffect(() => {
    setMounted(true)
    try {
      const saved = JSON.parse(localStorage.getItem(preference) || 'null')
      if (saved?.styles?.pen && saved?.styles?.marker) setStyles(saved.styles)
      if (Array.isArray(saved?.favorites)) setFavorites(saved.favorites)
    } catch {}
    let live = true
    const load = async () => {
      try {
        const records = await readInk(doc)
        if (live) { setStrokes((unsaved.get(doc) ?? []).reduce(applyInk, records)); setReady(true) }
      } catch { if (live) setStatus('Armazenamento indisponível. Reabra para tentar novamente.') }
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
      setOpen(value => !value)
      setTool(value => value === 'read' ? 'pen' : 'read')
    }
    window.addEventListener('keydown', keyHandler)
    const leave = (event: BeforeUnloadEvent) => {
      if (active.current || unsaved.get(doc)?.length) event.preventDefault()
    }
    window.addEventListener('beforeunload', leave)
    void load()
    const position = () => {
      const rect = anchor.current?.parentElement?.getBoundingClientRect()
      if (!rect) return
      const x = rect.left + rect.width / 2, y = rect.top
      setOffset({ x, y })
      const measured: Record<string, InkBox> = {}
      for (const el of anchor.current?.parentElement?.querySelectorAll<HTMLElement>('[data-ink-block]') ?? []) {
        const bounds = el.getBoundingClientRect()
        if (bounds.width && bounds.height) measured[el.dataset.inkBlock!] = { x: bounds.left-x, y: bounds.top-y, width: bounds.width, height: bounds.height }
      }
      setBlocks(measured)
    }
    position()
    window.addEventListener('scroll', position, true)
    window.addEventListener('resize', position)
    const observer = new ResizeObserver(position)
    if (anchor.current?.parentElement) observer.observe(anchor.current.parentElement)
    return () => {
      live = false
      updates?.close()
      window.removeEventListener('keydown', keyHandler)
      window.removeEventListener('beforeunload', leave)
      observer.disconnect()
      window.removeEventListener('scroll', position, true)
      window.removeEventListener('resize', position)
    }
  }, [doc, preference])

  function persistStyle(next = styles, list = favorites) {
    setStyles(next); setFavorites(list)
    try { localStorage.setItem(preference, JSON.stringify({ styles: next, favorites: list })) }
    catch { setStatus('Preferência disponível apenas nesta sessão.') }
  }
  function write(change: InkChange) {
    histories.set(doc, { undo: undo.current, redo: redo.current })
    setCounts([undo.current.length, redo.current.length])
    setStrokes(items => applyInk(items, change))
    const pending = unsaved.get(doc) ?? []
    pending.push(change); unsaved.set(doc, pending)
    setStatus('Salvando…')
    void flush(doc).then(() => setStatus('Salvo neste dispositivo'), () => setStatus('Ainda não salvo'))
  }
  function commit(change: InkChange) {
    undo.current.push(change); redo.current = []; write(change)
  }
  function history(back: boolean) {
    const change = (back ? undo : redo).current.pop()
    if (!change) return
    ;(back ? redo : undo).current.push(change)
    write(back ? { before: change.after, after: change.before } : change)
  }
  function point(e: PointerEvent): InkPoint {
    return { x: e.clientX - offset.x, y: e.clientY - offset.y, force: e.pointerType === 'pen' && e.pressure > 0 ? 0.4 + 0.6 * e.pressure : 1 }
  }
  function sample(e: ReactPointerEvent<SVGSVGElement>) {
    const current = active.current
    if (!current || current.pointer !== e.pointerId) return
    const events = e.nativeEvent.getCoalescedEvents?.()
    for (const event of events?.length ? events : [e.nativeEvent]) {
      const p = point(event)
      if (tool === 'erase') {
        current.stroke.points.push(p)
        for (const stroke of strokes) {
          if ((!onlyMarker || stroke.kind === 'marker') && touchesInk(stroke, p, radius)) current.erased.set(stroke.id, stroke)
        }
      } else current.stroke.points.push(p)
    }
    if (tool === 'erase' && !cut) setErasedIds([...current.erased.keys()])
    if ((tool === 'pen' || tool === 'marker') && performance.now() - checkpoint.current > 1000) {
      checkpoint.current = performance.now()
      const partial = { ...current.stroke, points: [...current.stroke.points] }
      const pending = unsaved.get(doc) ?? []
      pending.push({ before: [], after: [partial] })
      unsaved.set(doc, pending)
      void flush(doc).catch(() => setStatus('Ainda não salvo'))
    }
    setPreview({ ...current.stroke })
  }
  function finish(allowGesture = false) {
    const current = active.current
    if (!current) return
    active.current = null
    const bounds = Object.entries(blocks).find(([,box]) => current.stroke.points.length && current.stroke.points.every(p =>
      p.x >= box.x && p.y >= box.y && p.x <= box.x + box.width && p.y <= box.y + box.height))
    if (bounds) current.stroke.anchor = { block: bounds[0], box: bounds[1] }
    if (tool === 'erase') {
      if (cut) {
        const before: InkStroke[] = [], after: InkStroke[] = []
        for (const stroke of strokes.filter(s => !onlyMarker || s.kind === 'marker')) {
          const pieces = cutInk(stroke, current.stroke.points, radius)
          if (pieces[0] !== stroke) { before.push(stroke); after.push(...pieces) }
        }
        if (before.length) commit({ before, after })
      } else if (current.erased.size) commit({ before: [...current.erased.values()], after: [] })
      setErasedIds([])
    } else if (tool === 'gesture' && allowGesture) {
      const points = current.stroke.points
      const badges = Array.from(anchor.current?.parentElement?.querySelectorAll<HTMLElement>('[data-ink-option]') ?? [])
      const hits = badges.filter(badge => {
        const r = badge.getBoundingClientRect()
        const center = { x: r.left + r.width / 2 - offset.x, y: r.top + r.height / 2 - offset.y, force: 1 }
        const first = points[0], last = points[points.length - 1]
        return points.length > 3 && Math.hypot(last.x-first.x, last.y-first.y) < r.width &&
          points.every(p => Math.hypot(p.x-center.x,p.y-center.y) <= r.width * 1.8) && insideLasso(center, points)
      })
      setCandidate(hits.length === 1 ? hits[0].dataset.inkOption ?? '' : '')
      commit({ before: [], after: [current.stroke] })
    } else if (tool === 'lasso') {
      setSelection(strokes.filter(s => s.points.some(p => insideLasso(p, current.stroke.points))).map(s => s.id))
    } else if (tool === 'line' && current.stroke.points.length) {
      const points = current.stroke.points
      commit({ before: [], after: [{ ...current.stroke, points: [points[0], points[points.length - 1]] }] })
    } else if (current.stroke.points.length) commit({ before: [], after: [current.stroke] })
    setPreview(null)
  }
  function transformSelection(scale: number, dx: number, dy: number, copy = false) {
    const objects = strokes.filter(s => selection.includes(s.id))
    const pivot = objects[0]?.points[0]
    if (!pivot) return
    const after = objects.map(s => ({ ...s, id: copy ? crypto.randomUUID() : s.id, points: s.points.map(p => ({
      ...p, x: pivot.x + (p.x - pivot.x) * scale + dx, y: pivot.y + (p.y - pivot.y) * scale + dy
    })) }))
    commit({ before: copy ? [] : objects, after })
    setSelection(after.map(s => s.id))
  }
  function start(e: ReactPointerEvent<SVGSVGElement>) {
    if (!ready || tool === 'read' || active.current || e.button !== 0 || (onlyPen && e.pointerType === 'touch')) return
    if (tool === 'note') {
      setNote({ ...styles.pen, kind: 'pen', id: crypto.randomUUID(), created: Date.now(), points: [point(e.nativeEvent)], text: '' })
      return
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    checkpoint.current = performance.now()
    const kind = tool === 'marker' ? 'marker' : 'pen'
    active.current = { pointer: e.pointerId, erased: new Map(), stroke: { ...styles[kind], kind, id: crypto.randomUUID(), created: Date.now(), points: [] } }
    sample(e)
  }
  function render(stroke: InkStroke) {
    if (!stroke.points.length) return null
    if (stroke.text !== undefined) {
      const p = stroke.points[0]
      return <text key={stroke.id} x={p.x} y={p.y} fill={stroke.color} fontSize={Math.max(14, stroke.width * 8)}>{stroke.text.split('\n').map((line, i) => <tspan key={i} x={p.x} dy={i ? '1.25em' : 0}>{line}</tspan>)}</text>
    }
    const coords = stroke.points.map(p => p.x + ',' + p.y).join(' ')
    const first = stroke.points[0]
    return <g key={stroke.id} style={{filter: tool === 'lasso' && selection.includes(stroke.id) ? 'drop-shadow(0 0 3px #0284c7)' : undefined}} opacity={stroke.opacity} fill={stroke.color} stroke={stroke.color} strokeLinecap="round" strokeLinejoin="round">
      {stroke.points.length === 1 ? <circle cx={first.x} cy={first.y} r={stroke.width / 2} stroke="none" /> :
        stroke.pressure ? stroke.points.slice(1).map((p, i) => <line key={i} x1={stroke.points[i].x} y1={stroke.points[i].y} x2={p.x} y2={p.y} strokeWidth={stroke.width * p.force} />) :
        <polyline points={coords} fill="none" strokeWidth={stroke.width} />}
    </g>
  }
  const kind = tool === 'marker' ? 'marker' : 'pen'
  const style = styles[kind]
  const update = (patch: Partial<Style>) => persistStyle({ ...styles, [kind]: { ...style, ...patch } })
  const visible = [...strokes.filter(s => !erasedIds.includes(s.id) && s.id !== preview?.id), ...(preview && tool !== 'erase' ? [preview] : [])]
  return <><span ref={anchor} hidden />{mounted && createPortal(<>
    <svg aria-hidden="true" className="fixed inset-0 h-dvh w-screen text-zinc-900 dark:text-zinc-100" style={{ zIndex: 48, touchAction: 'none', pointerEvents: tool === 'read' ? 'none' : 'auto', cursor: 'crosshair' }}
      onPointerDown={start} onPointerMove={sample} onPointerUp={e => { if (active.current?.pointer === e.pointerId) { sample(e); finish(true) } }} onLostPointerCapture={e => { if (active.current?.pointer === e.pointerId) finish() }}
      onPointerCancel={e => { if (active.current?.pointer === e.pointerId) finish() }} onClick={e => e.stopPropagation()}>
      <g transform={`translate(${offset.x} ${offset.y})`}>{visible.filter(s => s.kind === 'marker').map(render)}{visible.filter(s => s.kind === 'pen').map(render)}</g>
    </svg>
    <aside aria-label="Ferramentas de anotação" className="fixed bottom-3 right-3 z-[51] max-w-[calc(100vw-1.5rem)] rounded-xl border bg-white p-2 text-sm text-zinc-900 shadow-lg dark:bg-zinc-900 dark:text-white" onKeyDown={e => e.stopPropagation()}>
      <button type="button" aria-expanded={open} onClick={() => { finish(); setOpen(!open); setTool(open ? 'read' : 'pen') }}>{open ? 'Recolher caneta' : '✎ Anotar'}</button>
      {open && flip && <button className="ml-3" onClick={() => { finish(); flip() }}>Virar cartão</button>}
      {open && <button className="ml-3" onClick={() => setCompact(!compact)}>{compact ? 'Ferramentas' : 'Minimizar'}</button>}
      {open && !compact && <div className="mt-2 grid max-h-[60dvh] max-w-80 gap-2 overflow-auto">
        <div className="flex flex-wrap gap-2">{(Object.keys(labels) as Tool[]).filter(t => t !== 'gesture' || choose).map(t => <button type="button" key={t} aria-pressed={tool === t} className={tool === t ? 'font-bold underline' : ''} onClick={() => { finish(); setCandidate(''); setTool(t) }}>{labels[t]}</button>)}</div>
        {tool === 'gesture' && candidate && choose && <button onClick={() => { choose(candidate); setCandidate(''); setTool('read') }}>Selecionar alternativa {candidate}</button>}
        {note && <div><label>Nota pessoal<textarea autoFocus value={note.text} onChange={e => setNote({ ...note, text: e.target.value })} /></label><button onClick={() => { if (note.text?.trim()) commit({ before: strokes.filter(s => s.id === note.id), after: [note] }); setNote(null) }}>Salvar nota</button> <button onClick={() => setNote(null)}>Cancelar</button></div>}
        {(tool === 'pen' || tool === 'marker') && <>
          <div className="flex items-center gap-2"><label>Cor <input type="color" value={style.color === 'currentColor' ? '#222222' : style.color} onChange={e => update({ color: e.target.value })} /></label><button onClick={() => update({ color: 'currentColor' })}>Cor do tema</button><svg width="48" height="28"><path d="M4 17 Q24 6 44 14" fill="none" stroke={style.color} strokeOpacity={style.opacity} strokeWidth={style.width} /></svg></div>
          <label>Espessura {style.width} px <input type="range" min={kind === 'pen' ? 0.5 : 4} max={kind === 'pen' ? 8 : 40} step="0.5" value={style.width} onChange={e => update({ width: Number(e.target.value) })} /></label>
          {kind === 'pen' ? <label><input type="checkbox" checked={style.pressure} onChange={e => update({ pressure: e.target.checked })} /> Sensível à pressão</label> : <label>Opacidade {Math.round(style.opacity * 100)}% <input type="range" min="10" max="60" value={style.opacity * 100} onChange={e => update({ opacity: Number(e.target.value) / 100 })} /></label>}
          <button onClick={() => persistStyle(styles, [...favorites, { kind, style }])}>Salvar favorito</button>
          {favorites.map((f, i) => <div key={i}><button onClick={() => { setTool(f.kind); persistStyle({ ...styles, [f.kind]: f.style }) }}>{labels[f.kind]} · {f.style.width} px · {f.style.color}</button> <button aria-label={'Excluir favorito ' + (i + 1)} onClick={() => persistStyle(styles, favorites.filter((_, n) => n !== i))}>×</button></div>)}
        </>}
        {tool === 'lasso' && selection.length > 0 && <div className="grid gap-2">
          <div className="flex flex-wrap gap-2">{([['←',-12,0],['→',12,0],['↑',0,-12],['↓',0,12]] as const).map(([label,dx,dy]) => <button key={label} aria-label={'Mover ' + label} onClick={() => transformSelection(1,dx,dy)}>{label}</button>)}<button onClick={() => transformSelection(1.15,0,0)}>Ampliar</button><button onClick={() => transformSelection(1/1.15,0,0)}>Reduzir</button><button onClick={() => transformSelection(1,12,12,true)}>Duplicar</button></div>
          {selection.length === 1 && strokes.some(s => selection.includes(s.id) && s.text !== undefined) && <button onClick={() => setNote(strokes.find(s => selection.includes(s.id)) ?? null)}>Editar nota</button>}
          <label>Recolorir seleção <input type="color" onChange={e => { const before = strokes.filter(s => selection.includes(s.id)); commit({before, after: before.map(s => ({...s, color: e.target.value}))}) }} /></label>
          <label>Espessura <input type="number" min="0.5" max="40" step="0.5" defaultValue="2" onBlur={e => { const width = e.target.valueAsNumber; if (width >= 0.5 && width <= 40) { const before = strokes.filter(s => selection.includes(s.id)); commit({before, after: before.map(s => ({...s, width}))}) } }} /></label>
          <button onClick={() => commit({before: strokes.filter(s => selection.includes(s.id)), after: []})}>Excluir seleção</button>
        </div>}
        {tool === 'erase' && <><label><input type="checkbox" checked={cut} onChange={e => setCut(e.target.checked)} /> Apagar por área</label><label>Raio {radius} px <input type="range" min="2" max="40" value={radius} onChange={e => setRadius(Number(e.target.value))} /></label><label><input type="checkbox" checked={onlyMarker} onChange={e => setOnlyMarker(e.target.checked)} /> Apagar só grifos</label></>}
        <label><input type="checkbox" checked={onlyPen} onChange={e => setOnlyPen(e.target.checked)} /> Ignorar toque ao desenhar</label>
        <div className="flex gap-3"><button disabled={!counts[0]} onClick={() => history(true)}>Desfazer</button><button disabled={!counts[1]} onClick={() => history(false)}>Refazer</button><button disabled={!strokes.length} onClick={() => { if (window.confirm('Limpar as marcas deste conteúdo?')) commit({ before: strokes, after: [] }) }}>Limpar</button></div>
        <small role="status">{status}</small>{status === 'Ainda não salvo' && <button onClick={() => void flush(doc).then(() => setStatus('Salvo neste dispositivo'), () => setStatus('Ainda não salvo'))}>Tentar salvar</button>}
      </div>}
    </aside>
  </>, document.body)}</>
}

export function StudyInkLayer({ content, flip, choose }: { content: string } & Actions) {
  const { user, isLoading } = useAuth()
  const owner = user?.id ?? 'guest'
  const doc = JSON.stringify([owner, content])
  return isLoading ? null : <Editor key={doc} doc={doc} owner={owner} flip={flip} choose={choose} />
}
