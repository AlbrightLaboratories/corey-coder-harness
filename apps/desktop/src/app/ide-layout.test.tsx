// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { IdeLayout } from './ide-layout'

afterEach(cleanup)

describe('IdeLayout (corey-coder-harness#2)', () => {
  it('renders the sidebar plus four content panes', () => {
    render(
      <IdeLayout
        sidebar={<div>SB</div>}
        main={<div>CHAT</div>}
        terminal={<div>TERM</div>}
        browser={<div>WEB</div>}
        files={<div>FILES</div>}
      />
    )
    for (const id of ['ide-sidebar', 'ide-main', 'ide-terminal', 'ide-browser', 'ide-files']) {
      expect(screen.getByTestId(id)).toBeTruthy()
    }
  })

  it('places the terminal below the main/chat pane in the center column', () => {
    render(
      <IdeLayout
        sidebar={null}
        main={<div>CHAT</div>}
        terminal={<div>TERM</div>}
        browser={null}
        files={null}
      />
    )
    const center = screen.getByTestId('ide-center')
    const main = screen.getByTestId('ide-main')
    const terminal = screen.getByTestId('ide-terminal')
    expect(center.contains(main)).toBe(true)
    expect(center.contains(terminal)).toBe(true)
    // terminal comes after main in DOM order → renders underneath it
    expect(main.compareDocumentPosition(terminal) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('renders each pane content', () => {
    render(
      <IdeLayout
        sidebar={<div>SB</div>}
        main={<div>CHAT</div>}
        terminal={<div>TERM</div>}
        browser={<div>WEB</div>}
        files={<div>FILES</div>}
      />
    )
    expect(screen.getByText('CHAT')).toBeTruthy()
    expect(screen.getByText('TERM')).toBeTruthy()
    expect(screen.getByText('WEB')).toBeTruthy()
    expect(screen.getByText('FILES')).toBeTruthy()
  })
})
