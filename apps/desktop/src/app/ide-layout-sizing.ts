/**
 * Pure sizing model for IdeLayout (corey-coder-harness#2). Kept separate from the
 * React component so the drag math is unit-testable without a DOM pointer dance.
 *
 * Three draggable dividers:
 *   - 'terminal'  : height (px) of the bottom terminal pane in the center column
 *   - 'browser'   : width  (px) of the right browser pane
 *   - 'files'     : width  (px) of the far-right filesystem pane
 * The sidebar + chat consume the remaining space (grid `1fr`), so they need no size.
 */
export interface IdeSizes {
  terminal: number
  browser: number
  files: number
}

export type Divider = keyof IdeSizes

export const DEFAULT_SIZES: IdeSizes = { terminal: 220, browser: 420, files: 260 }

/** Per-divider clamp bounds (px). Prevents a pane from collapsing or eating the view. */
export const BOUNDS: Record<Divider, { min: number; max: number }> = {
  terminal: { min: 80, max: 900 },
  browser: { min: 200, max: 900 },
  files: { min: 160, max: 700 }
}

export function clampSize(which: Divider, value: number): number {
  const { min, max } = BOUNDS[which]
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, Math.round(value)))
}

/**
 * Apply a pointer drag delta to one divider and return the next sizes.
 * `delta` is signed px. For 'terminal' the handle is on the TOP edge of the pane,
 * so dragging up (negative delta) should GROW the terminal → we subtract.
 * For 'browser'/'files' the handle is on the LEFT edge, dragging left (negative)
 * grows the pane → subtract as well. One consistent rule: next = current - delta.
 */
export function applyDrag(sizes: IdeSizes, which: Divider, delta: number): IdeSizes {
  return { ...sizes, [which]: clampSize(which, sizes[which] - delta) }
}

/** Coerce arbitrary (e.g. persisted) input into valid, clamped sizes. */
export function normalizeSizes(input?: Partial<IdeSizes> | null): IdeSizes {
  const src = input ?? {}
  return {
    terminal: clampSize('terminal', src.terminal ?? DEFAULT_SIZES.terminal),
    browser: clampSize('browser', src.browser ?? DEFAULT_SIZES.browser),
    files: clampSize('files', src.files ?? DEFAULT_SIZES.files)
  }
}
