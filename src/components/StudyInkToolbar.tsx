'use client'

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
import {
  getActiveInkHandlers,
  selectInkTool,
  setInkDrawer,
  toggleInkOpen,
  updateInkSettings,
  type StudyInkGlobalState,
  type Style,
  type Tool
} from '@/services/studyInkStore'

const TOOL_DEFS: { id: Tool; label: string; icon: typeof Pencil; hint: string }[] = [
  { id: 'read', label: 'Navegar', icon: MousePointer, hint: 'Rolar página e clicar normalmente' },
  { id: 'pen', label: 'Caneta', icon: Pencil, hint: 'Caneta S Pen escreve • Dedo rola' },
  { id: 'marker', label: 'Marca-texto', icon: Highlighter, hint: 'Grifo retilíneo atrás do texto' },
  { id: 'erase', label: 'Borracha', icon: Eraser, hint: 'Apagar traços (ou botão da S Pen)' },
  { id: 'line', label: 'Reta', icon: Minus, hint: 'Traço retilíneo' },
  { id: 'lasso', label: 'Laço', icon: Scissors, hint: 'Selecionar e mover traços' },
  { id: 'note', label: 'Nota', icon: StickyNote, hint: 'Inserir post-it médico ancorado' }
]

export const COLOR_PRESETS = [
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

interface StudyInkToolbarProps {
  state: StudyInkGlobalState
  onRequestClearConfirm: () => void
}

export function StudyInkToolbar({ state, onRequestClearConfirm }: StudyInkToolbarProps) {
  const {
    open,
    tool,
    dockPosition,
    isDockCollapsed,
    activeDrawer,
    styles,
    onlyPen,
    onlyMarker,
    cut,
    radius,
    straightMarker,
    autoGestureEnabled,
    isDrawing,
    undoFeedback
  } = state

  const activeHandlers = getActiveInkHandlers()
  const counts = activeHandlers?.counts ?? [0, 0]
  const strokeCount = activeHandlers?.strokeCount ?? 0
  const attemptNumber = activeHandlers?.attemptNumber ?? 1
  const isPreviousAttemptShown = activeHandlers?.showPreviousAttempt ?? false

  const activeKind = tool === 'marker' ? 'marker' : 'pen'
  const updateActiveStyle = (patch: Partial<Style>) => {
    updateInkSettings({
      styles: {
        ...styles,
        [activeKind]: { ...styles[activeKind], ...patch }
      }
    })
  }

  return createPortal(
    <>
      {undoFeedback && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-zinc-950/95 border border-zinc-700/80 text-zinc-200 px-3.5 py-1.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-1.5 text-xs font-bold animate-in fade-in slide-in-from-top-3 duration-150">
          <Undo2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Desfeito (toque de 2 dedos)</span>
        </div>
      )}

      {/* 1. BOTÃO FAB CIRCULAR NO CANTO INFERIOR (LIGA / DESLIGA) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          toggleInkOpen()
        }}
        onPointerDown={(e) => e.stopPropagation()}
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

      {/* 2. MINI-ABA LATERAL QUANDO A BARRA ESTÁ MINIMIZADA */}
      {open && isDockCollapsed && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            updateInkSettings({ isDockCollapsed: false })
          }}
          onPointerDown={(e) => e.stopPropagation()}
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
          } ${isDrawing ? 'opacity-25 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
        >
          <div className="flex flex-col items-center gap-1.5">
            <Pencil className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            {dockPosition === 'right' && <ChevronLeft className="w-3.5 h-3.5 text-zinc-400" />}
            {dockPosition === 'left' && <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />}
          </div>
        </button>
      )}

      {/* 3. BARRA SLIM FLUTUANTE ÚNICA */}
      {open && !isDockCollapsed && (
        <aside
          role="toolbar"
          aria-label="Barra de Ferramentas de Escrita"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            top: dockPosition === 'top' ? 'calc(1rem + env(safe-area-inset-top, 0px))' : '50%',
            transform: dockPosition === 'top' ? 'translateX(-50%)' : 'translateY(-50%)',
            left: dockPosition === 'left' ? 'calc(1rem + env(safe-area-inset-left, 0px))' : dockPosition === 'top' ? '50%' : undefined,
            right: dockPosition === 'right' ? 'calc(1rem + env(safe-area-inset-right, 0px))' : undefined
          }}
          className={`fixed z-[52] select-none rounded-2xl border border-zinc-800/90 bg-zinc-950/95 dark:bg-zinc-900/95 text-zinc-100 shadow-[0_24px_64px_rgba(0,0,0,0.7)] backdrop-blur-2xl ring-1 ring-white/10 animate-in fade-in duration-150 p-1.5 flex transition-opacity duration-200 ${
            dockPosition === 'top' ? 'flex-row items-center gap-1' : 'flex-col items-center gap-1'
          } ${isDrawing ? 'opacity-20 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
        >
          <button
            type="button"
            onClick={() => updateInkSettings({ isDockCollapsed: true })}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer"
            title="Minimizar barra para uma aba fininha na borda"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              const next = dockPosition === 'right' ? 'left' : dockPosition === 'left' ? 'top' : 'right'
              updateInkSettings({ dockPosition: next })
            }}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer"
            title={`Posição atual: ${dockPosition}. Clique para alternar lado (Direita/Esquerda/Topo)`}
          >
            <Move className="w-3.5 h-3.5" />
          </button>

          <div className={`border-zinc-800/80 ${dockPosition === 'top' ? 'border-r h-6 mx-0.5' : 'border-b w-6 my-0.5'}`} />

          {TOOL_DEFS.map((def) => {
            const Icon = def.icon
            const isActive = tool === def.id
            const isPenOrMarker = def.id === 'pen' || def.id === 'marker'
            const currentColor = def.id === 'pen' ? styles.pen.color : styles.marker.color

            return (
              <button
                key={def.id}
                type="button"
                onClick={() => selectInkTool(def.id)}
                title={`${def.label}: ${def.hint} (Toque 2x para opções)`}
                className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center transition-all relative cursor-pointer ${
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

          {attemptNumber > 1 && activeHandlers?.togglePreviousAttempt && (
            <button
              type="button"
              onClick={activeHandlers.togglePreviousAttempt}
              title={isPreviousAttemptShown ? 'Ocultar rascunho anterior' : 'Rever rascunhos da tentativa anterior'}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isPreviousAttemptShown
                  ? 'bg-amber-950/60 text-amber-300 ring-1 ring-amber-500/60'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {isPreviousAttemptShown ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-amber-400" />}
            </button>
          )}

          <button
            type="button"
            disabled={!counts[0]}
            onClick={() => activeHandlers?.undo()}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 disabled:opacity-25 transition-all cursor-pointer disabled:cursor-not-allowed"
            title="Desfazer traço (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={!counts[1]}
            onClick={() => activeHandlers?.redo()}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 disabled:opacity-25 transition-all cursor-pointer disabled:cursor-not-allowed"
            title="Refazer traço (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={!strokeCount}
            onClick={onRequestClearConfirm}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 disabled:opacity-25 transition-all cursor-pointer disabled:cursor-not-allowed"
            title="Limpar todos os desenhos desta questão"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* 4. DRAWER / FLYOUT DE PROPRIEDADES */}
      {open && activeDrawer && (
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            top: dockPosition === 'top' ? 'calc(4.5rem + env(safe-area-inset-top, 0px))' : '50%',
            transform: dockPosition === 'top' ? 'translateX(-50%)' : 'translateY(-50%)',
            right: dockPosition === 'right' ? 'calc(4.2rem + env(safe-area-inset-right, 0px))' : undefined,
            left: dockPosition === 'left' ? 'calc(4.2rem + env(safe-area-inset-left, 0px))' : dockPosition === 'top' ? '50%' : undefined
          }}
          className="fixed z-[53] w-72 sm:w-80 rounded-2xl border border-zinc-800 bg-zinc-950/95 dark:bg-zinc-900/95 text-zinc-100 shadow-[0_24px_64px_rgba(0,0,0,0.75)] backdrop-blur-2xl p-3.5 text-xs select-none ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-150"
        >
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
              onClick={() => setInkDrawer(null)}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              title="Fechar opções"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeDrawer === 'pen' && (
            <div className="space-y-3">
              <div>
                <span className="text-[11px] text-zinc-400 block mb-1.5">Cor do traço</span>
                <div className="flex items-center gap-2">
                  {COLOR_PRESETS.map((preset) => {
                    const isSelected = styles.pen.color === preset.value
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => updateActiveStyle({ color: preset.value })}
                        className={`w-6 h-6 rounded-full transition-all flex items-center justify-center cursor-pointer ${
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

              <div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Espessura</span>
                  <span className="font-mono text-emerald-400">{styles.pen.width} px</span>
                </div>
                <div className="grid grid-cols-4 gap-1 mb-1.5">
                  {[1, 2, 4, 8].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateActiveStyle({ width: size })}
                      className={`py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
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
                  onChange={(e) => updateActiveStyle({ width: Number(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-zinc-300">Sensível à pressão (S Pen)</span>
                  <input
                    type="checkbox"
                    checked={styles.pen.pressure}
                    onChange={(e) => updateActiveStyle({ pressure: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                <label
                  className="flex items-center justify-between cursor-pointer"
                  title="Círculo ou X na letra seleciona; corte ou X sobre o texto risca a alternativa"
                >
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Gestos (O/X na letra, corte no texto)
                  </span>
                  <input
                    type="checkbox"
                    checked={autoGestureEnabled}
                    onChange={(e) => updateInkSettings({ autoGestureEnabled: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                <label
                  className="flex items-center justify-between cursor-pointer"
                  title="S Pen desenha fixo; arrastar o dedo na tela rola a página"
                >
                  <div className="flex flex-col pr-1">
                    <span className="text-zinc-300 font-medium">Rejeição de palma / Só Caneta</span>
                    <span className="text-[10px] text-zinc-500">S Pen marca • Dedo rola</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={onlyPen}
                    onChange={(e) => updateInkSettings({ onlyPen: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {activeDrawer === 'marker' && (
            <div className="space-y-3">
              <div>
                <span className="text-[11px] text-zinc-400 block mb-1.5">Cores de grifo médico</span>
                <div className="flex items-center gap-2">
                  {MARKER_COLORS.map((m) => {
                    const isSelected = styles.marker.color === m.value
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => updateInkSettings({ styles: { ...styles, marker: { ...styles.marker, color: m.value } } })}
                        className={`w-6 h-6 rounded-full transition-all flex items-center justify-center cursor-pointer ${
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
                  onChange={(e) => updateInkSettings({ styles: { ...styles, marker: { ...styles.marker, width: Number(e.target.value) } } })}
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
                    onChange={(e) => updateInkSettings({ straightMarker: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

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
                  onChange={(e) => updateInkSettings({ radius: Number(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                <label className="flex items-center justify-between cursor-pointer text-zinc-300">
                  <span>Apagar apenas marca-texto</span>
                  <input
                    type="checkbox"
                    checked={onlyMarker}
                    onChange={(e) => updateInkSettings({ onlyMarker: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-800 text-rose-500 focus:ring-0 cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer text-zinc-300">
                  <span>Cortar traço (fragmentar)</span>
                  <input
                    type="checkbox"
                    checked={cut}
                    onChange={(e) => updateInkSettings({ cut: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-800 text-rose-500 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

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
  )
}
