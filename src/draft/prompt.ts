// A draft as a prompt for Claude Code: what the maintainer pastes into a session in this repo to
// turn a visitor's draft into changes to the saved design.
import type { Design } from '../designs/types.ts'
import type { Edit } from './edits.ts'
import type { Draft } from './store.ts'

/** How the studio names a node for a person: its layer name and a little of its text. */
export type Describe = (edit: Edit) => string

function change(edit: Edit): string {
  switch (edit.kind) {
    case 'text':
      return edit.was
        ? `change its text from "${edit.was}" to "${edit.value}"`
        : `set its text to "${edit.value}"`
    case 'hide':
      return 'remove it'
    case 'color':
      return `set its text colour to ${edit.token}`
    case 'background':
      return `set its background to ${edit.token}`
    case 'padding':
      return `set its padding to ${edit.token}`
    case 'gap':
      return `set the gap between its children to ${edit.token}`
    case 'radius':
      return `set its corner radius to ${edit.token}`
  }
}

export function draftToPrompt(design: Design, draft: Draft, describe: Describe): string {
  const lines = [
    `Apply this draft to the design "${design.title}" (designs/${design.id}/), following the design skill's rules for editing a design.`,
    `The draft was made on revision ${draft.revision}. Each node is given by its path below the screen's #root and described by its layer and text.`,
    '',
  ]
  const screens = [...new Set(draft.edits.map((edit) => edit.screen))]
  for (const screen of screens) {
    lines.push(`In screens/${screen}.tsx:`)
    for (const edit of draft.edits.filter((e) => e.screen === screen))
      lines.push(`- ${describe(edit)} (node ${edit.node}): ${change(edit)}`)
    lines.push('')
  }
  const tweaks = Object.entries(draft.tweaks).filter(
    ([id, value]) => design.tweaks?.find((t) => t.id === id)?.defaultValue !== value,
  )
  if (tweaks.length > 0) {
    lines.push('Make these tweak values the design defaults:')
    for (const [id, value] of tweaks) lines.push(`- ${id}: ${value}`)
    lines.push('')
  }
  return lines.join('\n').trimEnd()
}
