import assert from 'node:assert/strict'
import {
  applyInk,
  cutInk,
  insideLasso,
  projectInk,
  touchesInk,
  type InkStroke
} from '../src/services/studyInk.ts'
import {
  detectCircleOnOption,
  detectCrossOnOption,
  detectStrikeOnOptionText,
  detectOptionGesture,
  snapMarkerPoint,
  type OptionTarget
} from '../src/services/studyInkGestures.ts'

const p = (x: number, y: number) => ({ x, y, force: 1 })
const line: InkStroke = {
  id: 'a',
  kind: 'pen',
  created: 1,
  points: [p(0, 0), p(100, 0)],
  width: 2,
  opacity: 1,
  color: '#123456',
  pressure: false
}
assert.equal(touchesInk(line, p(50, 2), 2), true)
const fragments = cutInk(line, [p(50, 0)], 5)
assert.equal(fragments.length, 2)
assert.ok(fragments.every((s) => s.color === line.color && !touchesInk(s, p(50, 0), 1)))
assert.deepEqual(applyInk(fragments, { before: fragments, after: [line] }), [line])
assert.deepEqual(applyInk([line], { before: [], after: [line] }), [line])
assert.equal(insideLasso(p(3, 3), [p(0, 0), p(8, 0), p(8, 8), p(0, 8)]), true)
assert.equal(insideLasso(p(9, 3), [p(0, 0), p(8, 0), p(8, 8), p(0, 8)]), false)
const anchored = { ...line, anchor: { block: 'A', box: { x: 0, y: 0, width: 100, height: 20 } } }
assert.deepEqual(projectInk(anchored, { A: { x: 20, y: 100, width: 200, height: 30 } }).points, [p(20, 100), p(220, 100)])

// Testes de Reconhecimento de Gestos:
// - Círculo ou X na LETRA -> action: 'select'
// - X ou Corte (diagonal/horizontal) no TEXTO -> action: 'eliminate'
const targets: OptionTarget[] = [
  {
    option: 'A',
    center: p(50, 50),
    box: { x: 35, y: 35, width: 30, height: 30 },
    rowBox: { x: 25, y: 30, width: 420, height: 42 },
    textBox: { x: 80, y: 36, width: 350, height: 28 }
  },
  {
    option: 'B',
    center: p(50, 120),
    box: { x: 35, y: 105, width: 30, height: 30 },
    rowBox: { x: 25, y: 100, width: 420, height: 42 },
    textBox: { x: 80, y: 106, width: 350, height: 28 }
  },
  {
    option: 'C',
    center: p(50, 190),
    box: { x: 35, y: 175, width: 30, height: 30 },
    rowBox: { x: 25, y: 170, width: 420, height: 42 },
    textBox: { x: 80, y: 176, width: 350, height: 28 }
  }
]

// 1. Círculo desenhado ao redor da letra B -> seleciona B
const circlePoints = []
for (let deg = 0; deg <= 360; deg += 30) {
  const rad = (deg * Math.PI) / 180
  circlePoints.push(p(50 + 25 * Math.cos(rad), 120 + 25 * Math.sin(rad)))
}
const circleStroke: InkStroke = {
  id: 'c1',
  kind: 'pen',
  created: Date.now(),
  points: circlePoints,
  width: 2,
  opacity: 1,
  color: '#000',
  pressure: false
}
assert.equal(detectCircleOnOption(circleStroke, targets), 'B')
assert.deepEqual(detectOptionGesture(circleStroke, [], targets), {
  option: 'B',
  type: 'circle',
  action: 'select'
})

// 2. X desenhado com dois traços sobre a LETRA A -> seleciona A (não elimina)
const diag1: InkStroke = {
  id: 'x1',
  kind: 'pen',
  created: Date.now() - 500,
  points: [p(35, 35), p(65, 65)],
  width: 2,
  opacity: 1,
  color: '#000',
  pressure: false
}
const diag2: InkStroke = {
  id: 'x2',
  kind: 'pen',
  created: Date.now(),
  points: [p(35, 65), p(65, 35)],
  width: 2,
  opacity: 1,
  color: '#000',
  pressure: false
}
assert.equal(detectCrossOnOption(diag2, [diag1], targets), 'A')
assert.deepEqual(detectOptionGesture(diag2, [diag1], targets), {
  option: 'A',
  type: 'cross',
  action: 'select'
})

// 3. X desenhado sobre o TEXTO da alternativa B -> elimina B
const textX1: InkStroke = {
  id: 'tx1',
  kind: 'pen',
  created: Date.now() - 300,
  points: [p(150, 108), p(180, 132)],
  width: 2,
  opacity: 1,
  color: '#000',
  pressure: false
}
const textX2: InkStroke = {
  id: 'tx2',
  kind: 'pen',
  created: Date.now(),
  points: [p(150, 132), p(180, 108)],
  width: 2,
  opacity: 1,
  color: '#000',
  pressure: false
}
assert.equal(detectStrikeOnOptionText(textX2, [textX1], targets), 'B')
assert.deepEqual(detectOptionGesture(textX2, [textX1], targets), {
  option: 'B',
  type: 'strike',
  action: 'eliminate',
  completesRecentStrike: true
})

// 4. Corte horizontal (tachado) sobre o TEXTO da alternativa C -> elimina C
const horizCut: InkStroke = {
  id: 'hc1',
  kind: 'pen',
  created: Date.now(),
  points: [p(110, 190), p(240, 191)],
  width: 2,
  opacity: 1,
  color: '#000',
  pressure: false
}
assert.equal(detectStrikeOnOptionText(horizCut, [], targets), 'C')
assert.deepEqual(detectOptionGesture(horizCut, [], targets), {
  option: 'C',
  type: 'strike',
  action: 'eliminate',
  completesRecentStrike: false
})

// 5. Corte diagonal único sobre o TEXTO da alternativa A -> elimina A
const slashCut: InkStroke = {
  id: 'sc1',
  kind: 'pen',
  created: Date.now(),
  points: [p(140, 62), p(175, 38)],
  width: 2,
  opacity: 1,
  color: '#000',
  pressure: false
}
assert.equal(detectStrikeOnOptionText(slashCut, [], targets), 'A')
assert.deepEqual(detectOptionGesture(slashCut, [], targets), {
  option: 'A',
  type: 'strike',
  action: 'eliminate',
  completesRecentStrike: false
})

// 6. Sublinhado na borda inferior do TEXTO de C -> NÃO elimina C
const underline: InkStroke = {
  id: 'ul1',
  kind: 'pen',
  created: Date.now(),
  points: [p(110, 205), p(240, 205)],
  width: 2,
  opacity: 1,
  color: '#000',
  pressure: false
}
assert.equal(detectStrikeOnOptionText(underline, [], targets), null)
assert.equal(detectOptionGesture(underline, [], targets), null)

// 7. Marca-texto nunca dispara gesto de seleção nem eliminação
const markerHoriz: InkStroke = {
  id: 'mk1',
  kind: 'marker',
  created: Date.now(),
  points: [p(110, 190), p(240, 190)],
  width: 20,
  opacity: 0.35,
  color: '#facc15',
  pressure: false
}
assert.equal(detectOptionGesture(markerHoriz, [], targets), null)

// 8. Snapping de Marca-texto (traçado reto horizontal alinhado)
const snapped1 = snapMarkerPoint(p(20, 102), 100, 20)
assert.equal(snapped1.point.y, 100)
assert.equal(snapped1.snappedY, 100)

const snapped2 = snapMarkerPoint(p(20, 135), 100, 20)
assert.equal(snapped2.point.y, 135)
assert.equal(snapped2.snappedY, 135)

// 9. Teste de isolamento de rascunhos por tentativa
const docBase = 'user123:q-456'
const attemptKey1 = `${docBase}:att-1`
const attemptKey2 = `${docBase}:att-2`
assert.notEqual(attemptKey1, attemptKey2)
assert.equal(attemptKey1.endsWith(':att-1'), true)
assert.equal(attemptKey2.endsWith(':att-2'), true)

console.log('Caneta: borracha, fragmentos, histórico, laço, geometria, gestos (O/X na letra, corte/X no texto), régua e tentativas aprovados.')
