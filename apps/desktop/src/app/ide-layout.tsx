import type { ReactNode } from 'react'

/**
 * IDE layout — corey-coder-harness#2.
 *
 *   [ sidebar ] | [ main (chat, top) / terminal (bottom) ] | [ browser ] | [ files ]
 *
 * Presentational + slot-based so it is testable in isolation. The bottom terminal
 * slot hosts the EXISTING terminal (src/app/right-sidebar/terminal), wired to a
 * node-pty local backend so Hermes executes visibly (no manual terminal).
 *
 * TODO(#2): resizable dividers persisting sizes in src/store; browser <webview>;
 * filesystem tree over Electron IPC.
 */
export interface IdeLayoutProps {
  sidebar: ReactNode
  main: ReactNode
  terminal: ReactNode
  browser: ReactNode
  files: ReactNode
}

const border = '1px solid var(--border, #2a2a2a)'

export function IdeLayout({ sidebar, main, terminal, browser, files }: IdeLayoutProps) {
  return (
    <div
      data-testid="ide-layout"
      style={{ display: 'grid', height: '100%', gridTemplateColumns: 'auto 1fr auto auto' }}
    >
      <aside data-testid="ide-sidebar" style={{ overflow: 'auto' }}>
        {sidebar}
      </aside>
      <div
        data-testid="ide-center"
        style={{ display: 'grid', gridTemplateRows: '1fr auto', minWidth: 0 }}
      >
        <section data-testid="ide-main" style={{ overflow: 'auto', minHeight: 0 }}>
          {main}
        </section>
        <section
          data-testid="ide-terminal"
          style={{ height: '30%', minHeight: 120, borderTop: border, overflow: 'hidden' }}
        >
          {terminal}
        </section>
      </div>
      <section
        data-testid="ide-browser"
        style={{ width: 420, borderLeft: border, overflow: 'auto' }}
      >
        {browser}
      </section>
      <section
        data-testid="ide-files"
        style={{ width: 260, borderLeft: border, overflow: 'auto' }}
      >
        {files}
      </section>
    </div>
  )
}
