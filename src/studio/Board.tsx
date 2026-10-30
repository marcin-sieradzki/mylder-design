// The board: a design's screens side by side in their frames, at a zoom that fits them to the
// board's height, then its explorations, each with why it was set aside.
import { IconButton, Text, Button, Tag } from '@mylder/perron'
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Theme } from '../canvas/protocol.ts'
import type { Edit } from '../draft/edits.ts'
import { DEVICE_SIZE, type Design, type Exploration, type Screen } from '../designs/types.ts'
import { Icon } from '../kit/Icon.tsx'
import { Frame, type Mode } from './Frame.tsx'
import { h2 } from '../kit/headings.tsx'

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
  selection?: Selection
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

  const fit = useCallback(() => {
    const height = board.current?.clientHeight ?? 0
    const tallest = Math.max(...design.screens.map((s) => DEVICE_SIZE[s.device].height))
    if (height > 0) setScale(Math.min(1, Math.max(0.2, (height - LABEL_ROOM) / tallest)))
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
          {design.screens.map((screen) => (
            <BoardFrame key={screen.id} {...props} screen={screen} scale={scale} />
          ))}
        </div>
        {showExplorations && design.explorations?.length ? (
          <section className="studio-board-explorations" aria-label="Explorations">
            <Text variant="overline" emphasis="secondary" render={h2}>
              Explorations, set aside
            </Text>
            <div className="studio-board-row">
              {design.explorations.map((screen) => (
                <BoardFrame key={screen.id} {...props} screen={screen} scale={scale} />
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
  scale,
  theme,
  mode,
  tweaks,
  edits,
  selection,
  onSelect,
  onTextEdit,
  onDocument,
}: BoardProps & { screen: Screen | Exploration; scale: number }) {
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
  return (
    <figure
      className="studio-board-frame"
      style={{ width: DEVICE_SIZE[screen.device].width * scale }}
    >
      <figcaption className="studio-board-label">
        <Text variant="label">{screen.name}</Text>
        <Tag variant="dashed">{screen.device === 'phone' ? 'Phone' : 'Desktop'}</Tag>
      </figcaption>
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
      {verdict || screen.note ? (
        <Text variant="caption" emphasis="secondary" className="studio-board-note">
          {verdict ?? screen.note}
        </Text>
      ) : null}
    </figure>
  )
}
