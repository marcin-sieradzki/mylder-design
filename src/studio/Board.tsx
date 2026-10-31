// The board: a design's screens side by side in their frames, each under its index and name, at a
// zoom that fits the row to the board, then its explorations, each with why it was set aside
// beside it.
import { IconButton, Text, Button } from '@mylder/perron'
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Theme } from '../canvas/protocol.ts'
import type { Edit } from '../draft/edits.ts'
import { DEVICE_SIZE, type Design, type Exploration, type Screen } from '../designs/types.ts'
import { Icon } from '../kit/Icon.tsx'
import { Frame, type Mode } from './Frame.tsx'
import { h2 } from '../kit/headings.tsx'
import { indexOf } from './screen-index.ts'

export interface Selection {
  screen: string
  node: string
}

export interface BoardProps {
  design: Design
  theme: Theme
  mode: Exclude<Mode, 'static'>
  tweaks: Readonly<Record<string, string>>
  edits: readonly Edit[]
  showExplorations: boolean
  /** Changes when every screen should load afresh */
  visit: number
  selection?: Selection
  /** The screen picked in the screens list, or the one last clicked */
  current?: string
  onSelect: (selection: Selection | undefined) => void
  onTextEdit: (screen: string, node: string, text: string, was: string) => void
  onDocument: (screenId: string, document: Document | undefined) => void
}

const ZOOMS = [0.2, 0.25, 0.33, 0.4, 0.5, 0.67, 0.75, 1]
/** Room for a frame's label above it and the board's padding, in CSS px. */
const LABEL_ROOM = 96

export function Board(props: BoardProps) {
  const { design, showExplorations } = props
  const board = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)

  // the tallest screen fits the board's height, and the row of screens, gaps and all, its width
  const fit = useCallback(() => {
    const height = board.current?.clientHeight ?? 0
    const width = board.current?.clientWidth ?? 0
    const tallest = Math.max(...design.screens.map((s) => DEVICE_SIZE[s.device].height))
    const row = board.current?.querySelector('.studio-board-row')
    const gap = row ? parseFloat(getComputedStyle(row).columnGap) || 0 : 0
    const gaps = gap * (design.screens.length - 1)
    const total = design.screens.reduce((sum, s) => sum + DEVICE_SIZE[s.device].width, 0)
    const fits = Math.min((height - LABEL_ROOM) / tallest, (width - LABEL_ROOM - gaps) / total)
    if (height > 0) setScale(Math.min(1, Math.max(0.2, fits)))
  }, [design.screens])

  useLayoutEffect(fit, [fit])

  const step = (direction: 1 | -1) =>
    setScale((current) => {
      const index = ZOOMS.findIndex((z) => z >= current - 0.001)
      const next = direction > 0 ? ZOOMS.find((z) => z > current + 0.001) : ZOOMS[index - 1]
      return next ?? current
    })

  return (
    <div className="studio-board">
      <div className="studio-board-scroll" ref={board}>
        <div className="studio-board-row">
          {design.screens.map((screen, i) => (
            <BoardFrame
              key={`${screen.id}/${props.visit}`}
              {...props}
              screen={screen}
              index={indexOf(i, 'screen')}
              scale={scale}
            />
          ))}
        </div>
        {showExplorations && design.explorations?.length ? (
          <section className="studio-board-explorations" aria-label="Explorations">
            <Text variant="overline" emphasis="secondary" render={h2}>
              Explorations, set aside
            </Text>
            <div className="studio-board-row">
              {design.explorations.map((screen) => (
                <BoardFrame
                  key={`${screen.id}/${props.visit}`}
                  {...props}
                  screen={screen}
                  scale={scale}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
      <section className="studio-board-zoom" aria-label="Zoom">
        <IconButton label="Zoom out" onClick={() => step(-1)} disabled={scale <= ZOOMS[0]!}>
          <Icon name="minus" />
        </IconButton>
        <Text variant="data-sm" className="studio-board-zoom-value">
          {Math.round(scale * 100)} %
        </Text>
        <IconButton label="Zoom in" onClick={() => step(1)} disabled={scale >= 1}>
          <Icon name="plus" />
        </IconButton>
        <Button variant="outline" size="small" onClick={fit}>
          Fit
        </Button>
      </section>
    </div>
  )
}

function BoardFrame({
  design,
  screen,
  index,
  scale,
  theme,
  mode,
  tweaks,
  edits,
  selection,
  current,
  onSelect,
  onTextEdit,
  onDocument,
}: BoardProps & {
  screen: Screen | Exploration
  /** The screen's index, beside its name; an exploration's name says its letter */
  index?: string
  scale: number
}) {
  const verdict = 'verdict' in screen ? screen.verdict : undefined
  const select = useCallback(
    (node: string | undefined) => onSelect(node ? { screen: screen.id, node } : undefined),
    [onSelect, screen.id],
  )
  const screenEdits = useMemo(() => edits.filter((e) => e.screen === screen.id), [edits, screen.id])
  const textEdit = useCallback(
    (node: string, text: string, was: string) => onTextEdit(screen.id, node, text, was),
    [onTextEdit, screen.id],
  )
  const frame = (
    <Frame
      designId={design.id}
      screen={screen}
      theme={theme}
      scale={scale}
      tweaks={tweaks}
      edits={screenEdits}
      mode={mode}
      selected={selection?.screen === screen.id ? selection.node : undefined}
      onSelect={select}
      onTextEdit={textEdit}
      onDocument={onDocument}
    />
  )
  return verdict ? (
    <figure
      className="studio-board-frame"
      data-screen={screen.id}
      data-current={current === screen.id || undefined}
      data-exploration
    >
      {frame}
      <figcaption className="studio-board-verdict">
        <Text variant="label">{screen.name}</Text>
        <Text variant="caption" emphasis="secondary">
          {verdict}
        </Text>
      </figcaption>
    </figure>
  ) : (
    <figure
      className="studio-board-frame"
      data-screen={screen.id}
      data-current={current === screen.id || undefined}
      style={{ width: DEVICE_SIZE[screen.device].width * scale }}
    >
      <figcaption className="studio-board-label">
        <Text variant="data-sm" emphasis="tertiary">
          {index}
        </Text>{' '}
        <Text variant="label">{screen.name}</Text>
      </figcaption>
      {frame}
    </figure>
  )
}
