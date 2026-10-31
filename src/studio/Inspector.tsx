// The inspector, in four tabs: the visitor's draft (undo, redo, start over, copy as a prompt), the
// element they selected and what they can change on it, the design's tweaks, and the brief it came
// from. Selecting an element on the board brings its tab forward.
import {
  Alert,
  Button,
  Section,
  Segment,
  SegmentedControl,
  Select,
  Tab,
  Tabs,
  TabsList,
  TabsPanel,
  Text,
  TextField,
  Toast,
} from '@mylder/perron'
import { useState } from 'react'
import { SCREEN_ROOT_ID } from '../canvas/protocol.ts'
import { isTextNode, sameTarget, type Change, type Edit, type StyleKind } from '../draft/edits.ts'
import { elementAt } from '../draft/paths.ts'
import { draftToPrompt } from '../draft/prompt.ts'
import {
  RADII,
  shortName,
  SPACES,
  SURFACE_COLORS,
  TEXT_COLORS,
  type TokenName,
} from '../draft/tokens.ts'
import type { DraftControls } from '../draft/useDraft.ts'
import type { Design } from '../designs/types.ts'
import type { Selection } from './Board.tsx'
import { describeEdit, labelOf, layerName } from './layers.ts'

export interface InspectorProps {
  design: Design
  controls: DraftControls
  editing: boolean
  selection?: Selection
  onSelect: (selection: Selection | undefined) => void
  documentOf: (screenId: string) => Document | undefined
}

const STYLE_FIELDS: { kind: StyleKind; label: string; tokens: TokenName[]; prefix: string }[] = [
  { kind: 'color', label: 'Text colour', tokens: TEXT_COLORS, prefix: 'color.text.' },
  { kind: 'background', label: 'Background', tokens: SURFACE_COLORS, prefix: 'color.surface.' },
  { kind: 'padding', label: 'Padding', tokens: SPACES, prefix: 'space.' },
  { kind: 'gap', label: 'Gap', tokens: SPACES, prefix: 'space.' },
  { kind: 'radius', label: 'Corner radius', tokens: RADII, prefix: 'radius.' },
]

/** The Select value for "as the design has it". */
const AS_DESIGNED = 'as-designed'

export function Inspector({
  design,
  controls,
  editing,
  selection,
  onSelect,
  documentOf,
}: InspectorProps) {
  const { draft } = controls
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState('draft')
  // a new selection on the board shows the Element tab, adjusted while rendering
  const [shown, setShown] = useState(selection)
  if (selection !== shown) {
    setShown(selection)
    if (selection) setTab('element')
  }
  const count = draft.edits.length

  const copyPrompt = async () => {
    const prompt = draftToPrompt(design, draft, (edit) => describeEdit(edit, documentOf))
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
    } catch {
      window.prompt('Copy the draft as a prompt', prompt)
    }
  }

  return (
    <aside className="studio-inspector" aria-label="Inspector">
      <Tabs
        className="studio-inspector-tabs"
        value={tab}
        onChange={(_event, value) => value && setTab(value)}
      >
        <TabsList className="studio-inspector-tablist" aria-label="Inspector">
          <Tab value="draft">Draft</Tab>
          <Tab value="element">Element</Tab>
          {design.tweaks?.length ? (
            <Tab value="tweaks" count={design.tweaks.length}>
              Tweaks
            </Tab>
          ) : null}
          <Tab value="brief">Brief</Tab>
        </TabsList>
        <TabsPanel value="draft" className="studio-inspector-panel">
          <Section title="Your draft">
            <Text variant="body-sm" emphasis="secondary">
              {count === 0
                ? 'No edits yet. They stay in this browser and never change the saved design.'
                : `${count} ${count === 1 ? 'edit' : 'edits'}, kept in this browser. The saved design doesn’t change.`}
            </Text>
            {controls.stale ? (
              <Alert color="warning" title="The design has changed">
                It was updated after you made this draft, so some edits may land on the wrong
                element.
              </Alert>
            ) : null}
            <div className="studio-inspector-row">
              <Button
                variant="outline"
                size="small"
                onClick={controls.undo}
                disabled={!controls.canUndo}
              >
                Undo
              </Button>
              <Button
                variant="outline"
                size="small"
                onClick={controls.redo}
                disabled={!controls.canRedo}
              >
                Redo
              </Button>
              <Button
                variant="outline"
                size="small"
                onClick={() => {
                  controls.reset()
                  onSelect(undefined)
                }}
                disabled={count === 0 && Object.keys(draft.tweaks).length === 0}
              >
                Start over
              </Button>
            </div>
            <div className="studio-inspector-row">
              <Button
                variant="outline"
                size="small"
                onClick={() => void copyPrompt()}
                disabled={count === 0 && Object.keys(draft.tweaks).length === 0}
              >
                Copy as a prompt for Claude
              </Button>
            </div>
          </Section>
        </TabsPanel>

        <TabsPanel value="element" className="studio-inspector-panel">
          {editing ? (
            <ElementFields
              controls={controls}
              selection={selection}
              onSelect={onSelect}
              documentOf={documentOf}
            />
          ) : (
            <Section title="Element">
              <Text variant="body-sm" emphasis="secondary">
                Switch to Edit to change a screen: click any part of it to select it, or
                double-click text to type over it.
              </Text>
            </Section>
          )}
        </TabsPanel>

        {design.tweaks?.length ? (
          <TabsPanel value="tweaks" className="studio-inspector-panel">
            <Section title="Tweaks">
              {design.tweaks.map((tweak) =>
                tweak.options.length <= 4 ? (
                  <div key={tweak.id} className="studio-inspector-field">
                    <Text variant="label" id={`tweak-${tweak.id}`}>
                      {tweak.label}
                    </Text>
                    <SegmentedControl
                      aria-labelledby={`tweak-${tweak.id}`}
                      value={controls.tweakValue(tweak.id)}
                      onChange={(_event, value) => value && controls.setTweak(tweak.id, value)}
                    >
                      {tweak.options.map((option) => (
                        <Segment key={option.value} value={option.value}>
                          {option.label}
                        </Segment>
                      ))}
                    </SegmentedControl>
                  </div>
                ) : (
                  <Select
                    key={tweak.id}
                    label={tweak.label}
                    items={tweak.options}
                    value={controls.tweakValue(tweak.id)}
                    onChange={(_event, value) => value && controls.setTweak(tweak.id, value)}
                  />
                ),
              )}
            </Section>
          </TabsPanel>
        ) : null}

        <TabsPanel value="brief" className="studio-inspector-panel">
          <Section title="Brief">
            <Text variant="body-sm" emphasis="secondary" className="studio-inspector-brief">
              {design.brief}
            </Text>
            <Text variant="data-sm" emphasis="tertiary">
              Generated {design.date}
            </Text>
          </Section>
        </TabsPanel>
      </Tabs>

      <Toast open={copied} onClose={() => setCopied(false)} color="success" title="Copied">
        Paste it into Claude Code in the mylder-design repository.
      </Toast>
    </aside>
  )
}

interface ElementFieldsProps {
  controls: DraftControls
  selection?: Selection
  onSelect: (selection: Selection | undefined) => void
  documentOf: (screenId: string) => Document | undefined
}

function ElementFields({ controls, selection, onSelect, documentOf }: ElementFieldsProps) {
  const root = selection ? documentOf(selection.screen)?.getElementById(SCREEN_ROOT_ID) : undefined
  const element = selection && root ? elementAt(root, selection.node) : undefined
  const edits = controls.draft.edits.filter(
    (e) => e.screen === selection?.screen && e.node === selection?.node,
  )
  const textEdit = edits.find((e) => e.kind === 'text')

  if (!selection || !element)
    return (
      <Section title="Element">
        <Text variant="body-sm" emphasis="secondary">
          Click any part of a screen to select it. Double-click text to type over it.
        </Text>
      </Section>
    )

  const edit = (change: Change) =>
    controls.addEdit({
      ...change,
      screen: selection.screen,
      node: selection.node,
      label: labelOf(element, change.kind),
    } as Edit)
  const clear = (kind: Edit['kind']) =>
    controls.removeEdits((e) => sameTarget(e, { ...selection, kind } as Edit))
  const parent = selection.node.includes('.')
    ? selection.node.slice(0, selection.node.lastIndexOf('.'))
    : undefined
  const tokenOf = (kind: StyleKind) =>
    (edits.find((e) => e.kind === kind) as { token?: string } | undefined)?.token ?? AS_DESIGNED

  return (
    <Section
      title="Element"
      action={
        parent ? (
          <Button
            variant="outline"
            size="small"
            onClick={() => onSelect({ screen: selection.screen, node: parent })}
          >
            Select parent
          </Button>
        ) : undefined
      }
    >
      <Text variant="label" data-layer-name>
        {layerName(element)}
      </Text>
      {isTextNode(element) ? (
        <TextField
          // a new element or a new text edit starts the field over from the screen's text
          key={`${selection.screen}/${selection.node}/${textEdit?.kind === 'text' ? textEdit.value : ''}`}
          label="Text"
          defaultValue={textEdit?.kind === 'text' ? textEdit.value : (element.textContent ?? '')}
          onBlur={(event) => {
            const text = event.target.value
            const shown = textEdit?.kind === 'text' ? textEdit.value : element.textContent
            const was = textEdit?.kind === 'text' ? textEdit.was : (element.textContent ?? '')
            if (text.trim() && text !== shown) edit({ kind: 'text', value: text, was })
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur()
          }}
        />
      ) : null}
      {STYLE_FIELDS.map((field) => (
        <Select
          key={field.kind}
          label={field.label}
          items={[
            { value: AS_DESIGNED, label: 'As designed' },
            ...field.tokens.map((token) => ({
              value: token,
              label: shortName(token, field.prefix),
            })),
          ]}
          value={tokenOf(field.kind)}
          onChange={(_event, value) => {
            if (!value || value === AS_DESIGNED) clear(field.kind)
            else edit({ kind: field.kind, token: value as TokenName })
          }}
        />
      ))}
      <div className="studio-inspector-row">
        {edits.some((e) => e.kind === 'hide') ? (
          <Button variant="outline" size="small" onClick={() => clear('hide')}>
            Show again
          </Button>
        ) : (
          <Button variant="outline" size="small" onClick={() => edit({ kind: 'hide' })}>
            Hide
          </Button>
        )}
        {edits.length > 0 ? (
          <Button
            variant="outline"
            size="small"
            onClick={() =>
              controls.removeEdits(
                (e) => e.screen === selection.screen && e.node === selection.node,
              )
            }
          >
            Undo all on this element
          </Button>
        ) : null}
      </div>
    </Section>
  )
}
