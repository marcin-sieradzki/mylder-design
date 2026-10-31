// A design's page: its screens on the board, the inspector docked on its right, and on its left
// the screens and explorations to pick from and the prompt box. Every change a visitor makes goes
// into their draft.
import { Segment, SegmentedControl, Switch, Tag, Text } from '@mylder/perron'
import { useCallback, useRef, useState } from 'react'
import { SCREEN_ROOT_ID, type Theme } from '../canvas/protocol.ts'
import { elementAt } from '../draft/paths.ts'
import { useDraft } from '../draft/useDraft.ts'
import type { Design, Exploration, Screen } from '../designs/types.ts'
import { Board, type Selection } from './Board.tsx'
import { Inspector } from './Inspector.tsx'
import { labelOf } from './layers.ts'
import { ReviseDesign } from './PromptPanel.tsx'
import { indexOf } from './screen-index.ts'
import { h1, h2 } from '../kit/headings.tsx'
import { StudioBar } from './StudioBar.tsx'

export interface EditorProps {
  design: Design
  theme: Theme
  onThemeChange: (theme: Theme) => void
}

type BoardMode = 'interact' | 'edit'

interface ScreenRowProps {
  screen: Screen | Exploration
  index: string
  current: boolean
  onPick: (screenId: string) => void
}

function ScreenRow({ screen, index, current, onPick }: ScreenRowProps) {
  return (
    <li>
      <button
        type="button"
        className="studio-nav-row"
        aria-current={current ? 'true' : undefined}
        onClick={() => onPick(screen.id)}
      >
        <Text variant="data-sm" emphasis="tertiary" aria-hidden>
          {index}
        </Text>
        <Text variant="label">{screen.name}</Text>
        {'verdict' in screen || !screen.note ? null : (
          <Text variant="caption" emphasis="secondary" className="studio-nav-note">
            {screen.note}
          </Text>
        )}
      </button>
    </li>
  )
}

export function Editor({ design, theme, onThemeChange }: EditorProps) {
  const controls = useDraft(design)
  const [mode, setMode] = useState<BoardMode>('edit')
  // a screen played with in Interact may have changed its tree; Edit starts each screen afresh,
  // so the draft's paths find the elements they were made on
  const [visit, setVisit] = useState(0)
  const [selection, setSelection] = useState<Selection>()
  // the screen picked in the screens list, or the one last clicked on the board
  const [current, setCurrent] = useState(design.screens[0]?.id)
  const board = useRef<HTMLElement>(null)
  const [showExplorations, setShowExplorations] = useState(true)
  const documents = useRef(new Map<string, Document>())
  // the inspector reads the selected element from its screen's document after each change
  const [, setDocumentsVersion] = useState(0)

  const onDocument = useCallback((screenId: string, document: Document | undefined) => {
    if (document) documents.current.set(screenId, document)
    else documents.current.delete(screenId)
    setDocumentsVersion((v) => v + 1)
  }, [])
  const documentOf = useCallback((screenId: string) => documents.current.get(screenId), [])

  const { addEdit, draft } = controls
  const onTextEdit = useCallback(
    (screen: string, node: string, value: string, before: string) => {
      const earlier = draft.edits.find(
        (e) => e.kind === 'text' && e.screen === screen && e.node === node,
      )
      const was = earlier?.kind === 'text' ? earlier.was : before
      const root = documents.current.get(screen)?.getElementById(SCREEN_ROOT_ID)
      const element = root ? elementAt(root, node) : undefined
      const label = element ? labelOf(element, 'text') : undefined
      addEdit({ kind: 'text', screen, node, value, was, label })
      setSelection({ screen, node })
      setCurrent(screen)
    },
    [addEdit, draft.edits],
  )

  const select = useCallback((next: Selection | undefined) => {
    setSelection(next)
    if (next) setCurrent(next.screen)
  }, [])

  const pick = (screenId: string) => {
    setCurrent(screenId)
    setSelection((s) => (s?.screen === screenId ? s : undefined))
    board.current
      ?.querySelector(`[data-screen="${CSS.escape(screenId)}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  }

  const tweaks = Object.fromEntries(
    (design.tweaks ?? []).map((t) => [t.id, controls.tweakValue(t.id)]),
  )
  const count = draft.edits.length

  return (
    <div className="studio-editor">
      <StudioBar
        theme={theme}
        onThemeChange={onThemeChange}
        title={
          <>
            <Text variant="caption" emphasis="secondary" aria-hidden>
              /
            </Text>
            <Text variant="heading-sm" render={h1}>
              {design.title}
            </Text>
            <Tag color={count > 0 ? 'info' : 'neutral'} variant={count > 0 ? 'filled' : 'dashed'}>
              {count > 0 ? `Draft · ${count} ${count === 1 ? 'edit' : 'edits'}` : 'Draft mode'}
            </Tag>
          </>
        }
        tools={
          <SegmentedControl
            aria-label="What a click on a screen does"
            value={mode}
            onChange={(_event, value) => {
              if (!value) return
              if (value === 'edit') setVisit((v) => v + 1)
              setMode(value as BoardMode)
              setSelection(undefined)
            }}
          >
            <Segment value="edit">Edit</Segment>
            <Segment value="interact">Interact</Segment>
          </SegmentedControl>
        }
      />
      <nav className="studio-editor-side" aria-label="Design">
        <div className="studio-nav-group">
          <Text variant="overline" emphasis="secondary" id="nav-screens" render={h2}>
            Screens
          </Text>
          <ol className="studio-nav-list" aria-labelledby="nav-screens">
            {design.screens.map((screen, i) => (
              <ScreenRow
                key={screen.id}
                screen={screen}
                index={indexOf(i, 'screen')}
                current={screen.id === current}
                onPick={pick}
              />
            ))}
          </ol>
        </div>
        {design.explorations?.length ? (
          <div className="studio-nav-group">
            <Text variant="overline" emphasis="secondary" id="nav-explorations" render={h2}>
              Explorations
            </Text>
            {showExplorations ? (
              <ol className="studio-nav-list" aria-labelledby="nav-explorations">
                {design.explorations.map((screen, i) => (
                  <ScreenRow
                    key={screen.id}
                    screen={screen}
                    index={indexOf(i, 'exploration')}
                    current={screen.id === current}
                    onPick={pick}
                  />
                ))}
              </ol>
            ) : null}
            <div className="studio-editor-switch">
              <Switch
                aria-labelledby="show-explorations"
                checked={showExplorations}
                onChange={(_event, value) => setShowExplorations(value)}
              />
              <Text variant="body-sm" id="show-explorations">
                Show explorations
              </Text>
            </div>
          </div>
        ) : null}
        <div className="studio-editor-revise">
          <ReviseDesign designId={design.id} />
        </div>
      </nav>
      <main className="studio-editor-board" aria-label="Board" ref={board}>
        <Board
          design={design}
          theme={theme}
          mode={mode}
          tweaks={tweaks}
          edits={draft.edits}
          showExplorations={showExplorations}
          visit={visit}
          selection={selection}
          current={current}
          onSelect={select}
          onTextEdit={onTextEdit}
          onDocument={onDocument}
        />
      </main>
      <Inspector
        design={design}
        controls={controls}
        editing={mode === 'edit'}
        selection={selection}
        onSelect={select}
        documentOf={documentOf}
      />
    </div>
  )
}
