// A design's page: its screens on the board, the inspector beside them, and on the other side
// its screens list and the prompt box. Every change a visitor makes goes into their draft.
import { Segment, SegmentedControl, Switch, Tag, Text } from '@mylder/perron'
import { useCallback, useRef, useState } from 'react'
import { SCREEN_ROOT_ID, type Theme } from '../canvas/protocol.ts'
import { elementAt } from '../draft/paths.ts'
import { useDraft } from '../draft/useDraft.ts'
import type { Design } from '../designs/types.ts'
import { Board, type Selection } from './Board.tsx'
import { Inspector } from './Inspector.tsx'
import { labelOf } from './layers.ts'
import { ReviseDesign } from './PromptPanel.tsx'
import { h1 } from '../kit/headings.tsx'
import { StudioBar } from './StudioBar.tsx'

export interface EditorProps {
  design: Design
  theme: Theme
  onThemeChange: (theme: Theme) => void
}

type BoardMode = 'interact' | 'edit'

export function Editor({ design, theme, onThemeChange }: EditorProps) {
  const controls = useDraft(design)
  const [mode, setMode] = useState<BoardMode>('edit')
  // a screen played with in Interact may have changed its tree; Edit starts each screen afresh,
  // so the draft's paths find the elements they were made on
  const [visit, setVisit] = useState(0)
  const [selection, setSelection] = useState<Selection>()
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
    },
    [addEdit, draft.edits],
  )

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
        <div className="studio-editor-summary">
          <Text variant="body-sm" emphasis="secondary">
            {design.summary}
          </Text>
        </div>
        <ol className="studio-editor-screens" aria-label="Screens">
          {design.screens.map((screen) => (
            <li key={screen.id}>
              <Text variant="label">{screen.name}</Text>
              {screen.note ? (
                <Text variant="caption" emphasis="secondary">
                  {screen.note}
                </Text>
              ) : null}
            </li>
          ))}
        </ol>
        {design.explorations?.length ? (
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
        ) : null}
        <ReviseDesign designId={design.id} />
      </nav>
      <main className="studio-editor-board" aria-label="Board">
        <Board
          design={design}
          theme={theme}
          mode={mode}
          tweaks={tweaks}
          edits={draft.edits}
          showExplorations={showExplorations}
          visit={visit}
          selection={selection}
          onSelect={setSelection}
          onTextEdit={onTextEdit}
          onDocument={onDocument}
        />
      </main>
      <Inspector
        design={design}
        controls={controls}
        editing={mode === 'edit'}
        selection={selection}
        onSelect={setSelection}
        documentOf={documentOf}
      />
    </div>
  )
}
