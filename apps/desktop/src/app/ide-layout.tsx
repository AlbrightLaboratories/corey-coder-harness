import { type PointerEvent as ReactPointerEvent, type ReactNode, useCallback, useRef, useState } from 'react'

import { applyDrag, type Divider, type IdeSizes, normalizeSizes } from './ide-layout-sizing'

/**
 * IDE layout — corey-coder-harness#2.
 *
 *   [ sidebar ] │ [ main (chat, top) ═ terminal (bottom) ] │ [ browser ] │ [ files ]
 *
 * Slot-based + resizable. The bottom terminal slot hosts the EXISTING terminal
 * (src/app/right-sidebar/terminal), later wired to a node-pty local backend so
 * Hermes executes visibly (no manual terminal). Three drag dividers: terminal
 * height, browser width, files width (see ide-layout-sizing for the math).
 *
 * Persistence: pass `initialSizes` (e.g. from src/store) and `onResize` to persist.
 * Sizing is uncontrolled internally so it works standalone in tests.
 */
export interface IdeLayoutProps {
  sidebar: ReactNode
  main: ReactNode
  terminal: ReactNode
  browser: ReactNode
  files: ReactNode
  initialSizes?: Partial<IdeSizes>
  onResize?: (sizes: IdeSizes) => void
}

const border = '1px solid var(--border, #2a2a2a)'
const handleBase = { background: 'transparent', zIndex: 5, userSelect: 'none' as const }

export function IdeLayout({ sidebar, main, terminal, browser, files, initialSizes, onResize }: IdeLayoutProps) {
  const [sizes, setSizes] = useState<IdeSizes>(() => normalizeSizes(initialSizes))
  const drag = useRef<{ which: Divider; axis: 'x' | 'y'; start: number } | null>(null)

  const onPointerMove = useCallback((e: PointerEvent) => {
    const d = drag.current
    if (!d) return
    const pos = d.axis === 'x' ? e.clientX : e.clientY
    const delta = pos - d.start
    setSizes((prev) => applyDrag(prev, d.which, delta))
    drag.current = { ...d, start: pos }
  }, [])

  const endDrag = useCallback(() => {
    drag.current = null
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', endDrag)
    setSizes((s) => {
      onResize?.(s)
      return s
    })
  }, [onPointerMove, onResize])

  const startDrag = useCallback(
    (which: Divider, axis: 'x' | 'y') => (e: ReactPointerEvent) => {
      e.preventDefault()
      drag.current = { which, axis, start: axis === 'x' ? e.clientX : e.clientY }
      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', endDrag)
    },
    [onPointerMove, endDrag]
  )

  return (
    <div
      data-testid="ide-layout"
      style={{
        display: 'grid',
        height: '100%',
        gridTemplateColumns: `auto 1fr ${sizes.browser}px ${sizes.files}px`
      }}
    >
      <aside data-testid="ide-sidebar" style={{ overflow: 'auto' }}>
        {sidebar}
      </aside>

      <div
        data-testid="ide-center"
        style={{ display: 'grid', gridTemplateRows: `1fr ${sizes.terminal}px`, minWidth: 0 }}
      >
        <section data-testid="ide-main" style={{ overflow: 'auto', minHeight: 0 }}>
          {main}
        </section>
        <div
          data-testid="ide-handle-terminal"
          role="separator"
          aria-orientation="horizontal"
          onPointerDown={startDrag('terminal', 'y')}
          style={{ ...handleBase, height: 4, cursor: 'row-resize', borderTop: border }}
        />
        <section data-testid="ide-terminal" style={{ overflow: 'hidden', minHeight: 0 }}>
          {terminal}
        </section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '4px 1fr', minWidth: 0 }}>
        <div
          data-testid="ide-handle-browser"
          role="separator"
          aria-orientation="vertical"
          onPointerDown={startDrag('browser', 'x')}
          style={{ ...handleBase, width: 4, cursor: 'col-resize', borderLeft: border }}
        />
        <section data-testid="ide-browser" style={{ overflow: 'auto' }}>
          {browser}
        </section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '4px 1fr', minWidth: 0 }}>
        <div
          data-testid="ide-handle-files"
          role="separator"
          aria-orientation="vertical"
          onPointerDown={startDrag('files', 'x')}
          style={{ ...handleBase, width: 4, cursor: 'col-resize', borderLeft: border }}
        />
        <section data-testid="ide-files" style={{ overflow: 'auto' }}>
          {files}
        </section>
      </div>
    </div>
  )
}
