import { describe, expect, it } from 'vitest'

import { applyDrag, BOUNDS, clampSize, DEFAULT_SIZES, normalizeSizes } from './ide-layout-sizing'

describe('ide-layout-sizing (corey-coder-harness#2)', () => {
  it('clamps below/above the per-divider bounds', () => {
    expect(clampSize('terminal', 10)).toBe(BOUNDS.terminal.min)
    expect(clampSize('terminal', 99999)).toBe(BOUNDS.terminal.max)
    expect(clampSize('browser', 500)).toBe(500)
  })

  it('grows the terminal when dragged up (negative delta) and shrinks on positive', () => {
    const up = applyDrag(DEFAULT_SIZES, 'terminal', -50)
    expect(up.terminal).toBe(DEFAULT_SIZES.terminal + 50)
    const down = applyDrag(DEFAULT_SIZES, 'terminal', 50)
    expect(down.terminal).toBe(DEFAULT_SIZES.terminal - 50)
  })

  it('grows the browser pane when its divider is dragged left (negative delta)', () => {
    const wider = applyDrag(DEFAULT_SIZES, 'browser', -80)
    expect(wider.browser).toBe(DEFAULT_SIZES.browser + 80)
  })

  it('never lets a drag push a pane past its clamp', () => {
    const collapsed = applyDrag(DEFAULT_SIZES, 'files', 100000)
    expect(collapsed.files).toBe(BOUNDS.files.min)
  })

  it('does not mutate the input sizes object', () => {
    const before = { ...DEFAULT_SIZES }
    applyDrag(DEFAULT_SIZES, 'terminal', 40)
    expect(DEFAULT_SIZES).toEqual(before)
  })

  it('normalizes persisted/partial input into clamped sizes', () => {
    expect(normalizeSizes(null)).toEqual(DEFAULT_SIZES)
    expect(normalizeSizes({ terminal: 5 }).terminal).toBe(BOUNDS.terminal.min)
    expect(normalizeSizes({ browser: 400, files: 300 })).toEqual({
      terminal: DEFAULT_SIZES.terminal,
      browser: 400,
      files: 300
    })
  })
})
