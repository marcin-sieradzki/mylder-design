// A visitor's draft of one design, with undo and redo, saved to their browser as it changes.
import { useCallback, useEffect, useState } from 'react'
import { revisionOf } from '../designs/registry.ts'
import type { Design } from '../designs/types.ts'
import { withEdit, type Edit } from './edits.ts'
import { emptyDraft, loadDraft, saveDraft, type Draft } from './store.ts'

/** How many steps undo goes back. */
const HISTORY = 100

interface History {
  past: readonly Draft[]
  present: Draft
  future: readonly Draft[]
}

export function useDraft(design: Design) {
  const revision = revisionOf(design.id)
  const [history, setHistory] = useState<History>(() => ({
    past: [],
    present: loadDraft(design.id) ?? emptyDraft(revision),
    future: [],
  }))
  const draft = history.present

  useEffect(() => saveDraft(design.id, draft), [design.id, draft])

  const commit = useCallback(
    (change: (draft: Draft) => Draft) =>
      setHistory(({ past, present }) => ({
        past: [...past, present].slice(-HISTORY),
        present: change(present),
        future: [],
      })),
    [],
  )

  const addEdit = useCallback(
    (edit: Edit) => commit((d) => ({ ...d, edits: withEdit(d.edits, edit) })),
    [commit],
  )

  const removeEdits = useCallback(
    (remove: (edit: Edit) => boolean) =>
      commit((d) => ({ ...d, edits: d.edits.filter((e) => !remove(e)) })),
    [commit],
  )

  const setTweak = useCallback(
    (id: string, value: string) => commit((d) => ({ ...d, tweaks: { ...d.tweaks, [id]: value } })),
    [commit],
  )

  const reset = useCallback(() => commit(() => emptyDraft(revision)), [commit, revision])

  const undo = useCallback(
    () =>
      setHistory((h) =>
        h.past.length === 0
          ? h
          : {
              past: h.past.slice(0, -1),
              present: h.past.at(-1)!,
              future: [h.present, ...h.future],
            },
      ),
    [],
  )

  const redo = useCallback(
    () =>
      setHistory((h) =>
        h.future.length === 0
          ? h
          : { past: [...h.past, h.present], present: h.future[0]!, future: h.future.slice(1) },
      ),
    [],
  )

  /** Each tweak's value in the draft, or the design's default. */
  const tweakValue = (id: string) =>
    draft.tweaks[id] ?? design.tweaks?.find((t) => t.id === id)?.defaultValue ?? ''

  return {
    draft,
    /** The draft was made on an earlier version of the design */
    stale: draft.edits.length > 0 && draft.revision !== revision,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    addEdit,
    removeEdits,
    setTweak,
    tweakValue,
    reset,
    undo,
    redo,
  }
}

export type DraftControls = ReturnType<typeof useDraft>
