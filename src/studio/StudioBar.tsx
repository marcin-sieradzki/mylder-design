// The studio's top bar: the Mylder mark and the studio's name, what the page is about, and the
// theme switch every page has. A page puts its own controls in `tools`.
import { Brand, Segment, SegmentedControl, Text } from '@mylder/perron'
import type { ReactNode } from 'react'
import type { Theme } from '../canvas/protocol.ts'

export interface StudioBarProps {
  theme: Theme
  onThemeChange: (theme: Theme) => void
  /** What the page shows, after the studio's name */
  title?: ReactNode
  tools?: ReactNode
}

export function StudioBar({ theme, onThemeChange, title, tools }: StudioBarProps) {
  return (
    <header className="studio-bar">
      <a className="studio-bar-home" href="#/" aria-label="Mylder Design, all designs">
        <Brand variant="full" />
        <Text variant="label" emphasis="secondary">
          Design
        </Text>
      </a>
      {title ? <div className="studio-bar-title">{title}</div> : null}
      <div className="studio-bar-tools">
        {tools}
        <SegmentedControl
          value={theme}
          onChange={(_event, value) => onThemeChange(value as Theme)}
          aria-label="Theme"
        >
          <Segment value="light">Light</Segment>
          <Segment value="dark">Dark</Segment>
        </SegmentedControl>
      </div>
    </header>
  )
}
