// A visitor's edits to a screen, as data. The studio applies them to the canvas page's document;
// the saved design's files never change. Every edit addresses its node by path (paths.ts) and
// sets a Perron token (tokens.ts) or the node's text.
import { elementAt } from './paths.ts'
import { cssVar, type TokenName } from './tokens.ts'

interface EditBase {
  /** The screen's id in its design */
  screen: string
  /** The node's path in the screen */
  node: string
  /** How a person knows the node, from when the edit was made: its layer and some of its text */
  label?: string
}

export type StyleKind = 'color' | 'background' | 'padding' | 'gap' | 'radius'

export type Edit =
  | (EditBase & { kind: 'text'; value: string; /** The text the design has */ was?: string })
  | (EditBase & { kind: StyleKind; token: TokenName })
  | (EditBase & { kind: 'hide' })

/** An edit without its address: what it changes. */
export type Change = Edit extends infer E
  ? E extends Edit
    ? Omit<E, 'screen' | 'node'>
    : never
  : never

/** The CSS property each style edit sets. */
const PROPERTY: Record<StyleKind, string> = {
  color: 'color',
  background: 'background',
  padding: 'padding',
  gap: 'gap',
  radius: 'border-radius',
}

export const STYLE_KINDS = Object.keys(PROPERTY) as StyleKind[]

/** What a node looked like before any edit touched it. */
interface Original {
  style: string | null
  text: string | null
}

/**
 * Applies a screen's edits to its document, from its saved state: each call first puts back every
 * node an earlier call touched, so undo is applying a shorter list. Keep one Applier per document.
 */
export class Applier {
  readonly #originals = new Map<Element, Original>()

  /**
   * Notes a node's look before a person changes it by hand (typing into it), so the next apply
   * can put it back.
   */
  remember(element: Element) {
    if (this.#originals.has(element)) {
      const original = this.#originals.get(element)!
      original.text ??= element.textContent
      return
    }
    this.#originals.set(element, {
      style: element.getAttribute('style'),
      text: element.textContent,
    })
  }

  /** Applies the edits; returns those whose node the screen no longer has. */
  apply(root: Element, edits: readonly Edit[]): Edit[] {
    for (const [element, original] of this.#originals) {
      if (original.style === null) element.removeAttribute('style')
      else element.setAttribute('style', original.style)
      // only text that differs is written back, so React's own text nodes stay where they can
      if (original.text !== null && element.textContent !== original.text)
        element.textContent = original.text
    }
    const missing: Edit[] = []
    for (const edit of edits) {
      const element = elementAt(root, edit.node) as HTMLElement | undefined
      if (!element || !('style' in element)) {
        missing.push(edit)
        continue
      }
      const original = this.#originals.get(element) ?? {
        style: element.getAttribute('style'),
        text: null,
      }
      if (edit.kind === 'text' && original.text === null) original.text = element.textContent
      this.#originals.set(element, original)
      if (edit.kind === 'text') element.textContent = edit.value
      else if (edit.kind === 'hide') element.style.setProperty('display', 'none')
      else element.style.setProperty(PROPERTY[edit.kind], cssVar(edit.token))
    }
    return missing
  }
}

/** Whether a node's text can be edited: it holds text and no elements. */
export const isTextNode = (element: Element) =>
  element.childElementCount === 0 && (element.textContent ?? '').trim().length > 0

/** The edit a new one replaces: the same kind on the same node. */
export const sameTarget = (a: Edit, b: Edit) =>
  a.screen === b.screen && a.node === b.node && a.kind === b.kind

/** Adds an edit, replacing an earlier one of the same kind on the same node. */
export const withEdit = (edits: readonly Edit[], edit: Edit) => [
  ...edits.filter((e) => !sameTarget(e, edit)),
  edit,
]
