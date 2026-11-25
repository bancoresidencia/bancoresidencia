import type { InkBox, InkPoint, InkStroke } from './studyInk'

function pointInPolygon(point: InkPoint, vertices: InkPoint[]): boolean {
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

export type OptionTarget = {
  option: string
  center: InkPoint
  box: InkBox
  rowBox?: InkBox
  textBox?: InkBox
}

export type OptionGestureResult = {
  option: string
  type: 'circle' | 'cross' | 'strike'
  action: 'select' | 'eliminate'
  completesRecentStrike?: boolean
}

function pointInBox(p: InkPoint, box: InkBox, padX = 0, padY = padX): boolean {
  return (
    p.x >= box.x - padX &&
    p.x <= box.x + box.width + padX &&
    p.y >= box.y - padY &&
    p.y <= box.y + box.height + padY
  )
}

function strokeBounds(points: InkPoint[]): InkBox {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

function strokePathLength(points: InkPoint[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
  }
  return total
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
  const step = points.length > 40 ? 2 : 1
  for (let i = 0; i < points.length - 3; i += step) {
    const iNext = Math.min(i + step, points.length - 1)
    for (let j = i + 3; j < points.length - 1; j += step) {
      const jNext = Math.min(j + step, points.length - 1)
      const hit = lineIntersection(points[i], points[iNext], points[j], points[jNext])
      if (hit) return hit
    }
  }
  return null
}

function findStrokeIntersection(s1: InkStroke, s2: InkStroke): InkPoint | null {
  const step1 = s1.points.length > 40 ? 2 : 1
  const step2 = s2.points.length > 40 ? 2 : 1
  for (let i = 0; i < s1.points.length - 1; i += step1) {
    const iNext = Math.min(i + step1, s1.points.length - 1)
    for (let j = 0; j < s2.points.length - 1; j += step2) {
      const jNext = Math.min(j + step2, s2.points.length - 1)
      const hit = lineIntersection(s1.points[i], s1.points[iNext], s2.points[j], s2.points[jNext])
      if (hit) return hit
    }
  }
  return null
}

export function detectScratchOut(stroke: InkStroke): boolean {
  const pts = stroke.points
  if (pts.length < 8 || pts.length > 180) return false

  const box = strokeBounds(pts)
  if (box.width > 280 || box.height > 200 || (box.width < 10 && box.height < 10)) return false

  let reversalsX = 0
  let lastDirX = 0
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x
    if (Math.abs(dx) > 3) {
      const dirX = Math.sign(dx)
      if (lastDirX !== 0 && dirX !== lastDirX) reversalsX++
      lastDirX = dirX
    }
  }

  let reversalsY = 0
  let lastDirY = 0
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

export function detectCircleOnOption(stroke: InkStroke, targets: OptionTarget[]): string | null {
  if (stroke.kind === 'marker' || stroke.points.length < 5) return null
  const bounds = strokeBounds(stroke.points)
  if (bounds.width < 18 || bounds.height < 18) return null
  const maxX = bounds.x + bounds.width
  const maxY = bounds.y + bounds.height

  for (const target of targets) {
    const c = target.center
    if (c.x < bounds.x - 35 || c.x > maxX + 35 || c.y < bounds.y - 35 || c.y > maxY + 35) continue

    const inside = pointInPolygon(c, stroke.points)
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
      const avgDist =
        stroke.points.reduce((acc, p) => acc + Math.hypot(p.x - c.x, p.y - c.y), 0) / stroke.points.length
      if (avgDist >= 6 && avgDist <= 130) {
        return target.option
      }
    }
  }
  return null
}

/**
 * Detects an X drawn specifically over the option letter badge (A, B, C, D, E)
 * to select/mark that option.
 */
export function detectCrossOnOption(
  current: InkStroke,
  recent: InkStroke[],
  targets: OptionTarget[]
): string | null {
  if (current.kind === 'marker' || current.points.length < 2) return null

  const badgeRadius = (target: OptionTarget) => Math.max(30, Math.min(44, Math.max(target.box.width, target.box.height) * 1.1))

  const selfHit = findSelfIntersection(current.points)
  if (selfHit) {
    for (const target of targets) {
      if (Math.hypot(selfHit.x - target.center.x, selfHit.y - target.center.y) <= badgeRadius(target)) {
        return target.option
      }
    }
  }

  const now = current.created || Date.now()
  for (const prev of recent) {
    if (prev.kind === 'marker' || prev.points.length < 2) continue
    if (now - (prev.created || 0) > 4000) continue
    const hit = findStrokeIntersection(current, prev)
    if (hit) {
      for (const target of targets) {
        if (Math.hypot(hit.x - target.center.x, hit.y - target.center.y) <= badgeRadius(target)) {
          return target.option
        }
      }
    }
  }

  const first = current.points[0]
  const last = current.points[current.points.length - 1]
  const len = Math.hypot(last.x - first.x, last.y - first.y)
  if (len >= 18 && len <= 100) {
    const mid = { x: (first.x + last.x) / 2, y: (first.y + last.y) / 2, force: 1 }
    for (const target of targets) {
      if (Math.hypot(mid.x - target.center.x, mid.y - target.center.y) <= 28) {
        for (const prev of recent) {
          if (prev.kind === 'marker' || prev.points.length < 2) continue
          if (now - (prev.created || 0) <= 4000) {
            const pFirst = prev.points[0]
            const pLast = prev.points[prev.points.length - 1]
            const pMid = { x: (pFirst.x + pLast.x) / 2, y: (pFirst.y + pLast.y) / 2, force: 1 }
            if (Math.hypot(pMid.x - target.center.x, pMid.y - target.center.y) <= 32) {
              // Ensure the two strokes are not nearly parallel (must cross conceptually)
              const a1 = Math.atan2(last.y - first.y, last.x - first.x)
              const a2 = Math.atan2(pLast.y - pFirst.y, pLast.x - pFirst.x)
              let angleDiff = Math.abs(a1 - a2)
              if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff
              if (angleDiff > Math.PI / 2) angleDiff = Math.PI - angleDiff
              if (angleDiff >= 0.35) {
                return target.option
              }
            }
          }
        }
      }
    }
  }

  return null
}

/**
 * Detects an X or single slash/horizontal cut over the option text area
 * (outside the letter badge) to strike/eliminate the distractor.
 */
export function detectStrikeOnOptionText(
  current: InkStroke,
  recent: InkStroke[],
  targets: OptionTarget[]
): string | null {
  const match = detectStrikeOnOptionTextDetailed(current, recent, targets)
  return match ? match.option : null
}

function detectStrikeOnOptionTextDetailed(
  current: InkStroke,
  recent: InkStroke[],
  targets: OptionTarget[]
): { option: string; completesRecentStrike: boolean } | null {
  if (current.kind === 'marker' || current.points.length < 2) return null

  const bounds = strokeBounds(current.points)
  const first = current.points[0]
  const last = current.points[current.points.length - 1]
  const directDist = Math.hypot(last.x - first.x, last.y - first.y)
  const pathLen = strokePathLength(current.points)
  const now = current.created || Date.now()

  const isInsideTextNotBadge = (pt: InkPoint, target: OptionTarget): boolean => {
    const textArea = target.textBox
    if (!textArea || textArea.width <= 0 || textArea.height <= 0) return false
    if (pointInBox(pt, target.box, 8, 8)) return false
    return pointInBox(pt, textArea, 8, 6)
  }

  // 1. Single-stroke X on option text
  const selfHit = findSelfIntersection(current.points)
  if (selfHit) {
    for (const target of targets) {
      if (isInsideTextNotBadge(selfHit, target) && bounds.height <= (target.textBox?.height ?? 60) + 40) {
        return { option: target.option, completesRecentStrike: false }
      }
    }
  }

  // 2. Two-stroke X on option text
  for (const prev of recent) {
    if (prev.kind === 'marker' || prev.points.length < 2) continue
    if (now - (prev.created || 0) > 4000) continue
    const hit = findStrokeIntersection(current, prev)
    if (hit) {
      for (const target of targets) {
        if (isInsideTextNotBadge(hit, target) && bounds.height <= (target.textBox?.height ?? 60) + 40) {
          const prevAlreadyMatched = detectStrikeOnOptionTextDetailed(prev, [], [target])?.option === target.option
          return { option: target.option, completesRecentStrike: prevAlreadyMatched }
        }
      }
    }
  }

  // 3. Single straight cut (horizontal strikethrough or diagonal slash) over option text
  if (directDist < 30 || pathLen <= 0) return null
  const straightness = directDist / pathLen
  if (straightness < 0.82) return null

  const dx = Math.abs(last.x - first.x)
  const dy = Math.abs(last.y - first.y)
  const avgY = current.points.reduce((acc, p) => acc + p.y, 0) / current.points.length
  const mid: InkPoint = { x: (first.x + last.x) / 2, y: (first.y + last.y) / 2, force: 1 }

  for (const target of targets) {
    const textArea = target.textBox
    if (!textArea || textArea.width <= 0 || textArea.height <= 0) continue

    // Ignore strokes that span wildly across multiple options vertically
    const rowTop = (target.rowBox ?? textArea).y - 14
    const rowBottom = (target.rowBox ?? textArea).y + (target.rowBox ?? textArea).height + 14
    if (bounds.y < rowTop || bounds.y + bounds.height > rowBottom) continue

    // Horizontal strikethrough passing through the middle band of text (avoids underlines below text)
    const isHorizontalCut = dx >= 40 && dx >= dy * 2.2
    if (isHorizontalCut) {
      const overlapLeft = Math.max(bounds.x, textArea.x)
      const overlapRight = Math.min(bounds.x + bounds.width, textArea.x + textArea.width)
      const overlapX = overlapRight - overlapLeft
      const minRequiredOverlap = Math.min(36, textArea.width * 0.25)
      const vertPad = textArea.height < 20 ? 1 : 3
      const inMiddleBand = avgY >= textBoxMinY(textArea, vertPad) && avgY <= textBoxMaxY(textArea, vertPad)

      if (overlapX >= minRequiredOverlap && inMiddleBand) {
        return { option: target.option, completesRecentStrike: false }
      }
    }

    // Diagonal slash across the option text (outside the letter badge)
    const isDiagonalCut = dx >= 18 && dy >= 16 && directDist >= 28 && straightness >= 0.84
    if (isDiagonalCut && isInsideTextNotBadge(mid, target)) {
      return { option: target.option, completesRecentStrike: false }
    }
  }

  return null
}

function textBoxMinY(textArea: InkBox, vertPad: number): number {
  return textArea.y + vertPad
}

function textBoxMaxY(textArea: InkBox, vertPad: number): number {
  return textArea.y + textArea.height - vertPad
}

export function detectOptionGesture(
  current: InkStroke,
  recent: InkStroke[],
  targets: OptionTarget[]
): OptionGestureResult | null {
  // 1. Circle around letter badge -> select
  const circleOption = detectCircleOnOption(current, targets)
  if (circleOption) {
    return { option: circleOption, type: 'circle', action: 'select' }
  }

  // 2. X on letter badge -> select
  const badgeCrossOption = detectCrossOnOption(current, recent, targets)
  if (badgeCrossOption) {
    return { option: badgeCrossOption, type: 'cross', action: 'select' }
  }

  // 3. X or cut/strikethrough on option text -> eliminate
  const textStrike = detectStrikeOnOptionTextDetailed(current, recent, targets)
  if (textStrike) {
    return {
      option: textStrike.option,
      type: 'strike',
      action: 'eliminate',
      completesRecentStrike: textStrike.completesRecentStrike
    }
  }

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
