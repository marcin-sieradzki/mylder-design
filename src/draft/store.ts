// A visitor's draft of one design, kept in their browser's localStorage. It never leaves the
// browser and never changes the saved design. Storage can be missing or full (a private window,
// blocked site data), so every read and write is guarded and the studio works without it.
import type { Edit } from './edits.ts'

export interface Draft {
  /** The design's revision the draft was made on */
  revision: string
  edits: readonly Edit[]
  /** Each tweak's chosen value, by tweak id; a tweak left out keeps the design's default */
  tweaks: Readonly<Record<string, string>>
}

export const emptyDraft = (revision: string): Draft => ({ revision, edits: [], tweaks: {} })

export const isEmpty = (draft: Draft) =>
  draft.edits.length === 0 && Object.keys(draft.tweaks).length === 0

const keyOf = (designId: string) => `mylder-design/draft/${designId}`

export function loadDraft(designId: string, storage: Storage | undefined = globalStorage()) {
  try {
    const text = storage?.getItem(keyOf(designId))
    if (!text) return undefined
    const draft = JSON.parse(text) as Draft
    return Array.isArray(draft.edits) && typeof draft.revision === 'string' ? draft : undefined
  } catch {
    return undefined
  }
}

export function saveDraft(
  designId: string,
  draft: Draft,
  storage: Storage | undefined = globalStorage(),
) {
  try {
    if (isEmpty(draft)) storage?.removeItem(keyOf(designId))
    else storage?.setItem(keyOf(designId), JSON.stringify(draft))
  } catch {
    // the draft lives on in memory for this visit
  }
}

function globalStorage(): Storage | undefined {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}
