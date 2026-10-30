// What the studio calls an element of a screen: the layer name a design gave it with
// `data-layer`, or the Perron component it is (`pn-<Name>`), or its tag, under its nearest named
// layer.
import { SCREEN_ROOT_ID } from '../canvas/protocol.ts'
import type { Edit } from '../draft/edits.ts'
import { elementAt } from '../draft/paths.ts'

function ownName(element: Element): string | undefined {
  const layer = element.getAttribute('data-layer')
  if (layer) return layer
  const component = [...element.classList].find((c) => /^pn-[A-Z][A-Za-z]*$/.test(c))
  return component?.slice(3)
}

export function layerName(element: Element): string {
  const own = ownName(element)
  if (element.hasAttribute('data-layer')) return own!
  const named = element.parentElement?.closest('[data-layer]')
  const name = own ?? element.tagName.toLowerCase()
  return named ? `${named.getAttribute('data-layer')} › ${name}` : name
}

/** A short quote of an element's text, for telling elements apart. */
export function textOf(element: Element, max = 40): string {
  const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim()
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

/** How an edit names its element for a person: by layer, and by text unless it changes it. */
export function labelOf(element: Element, kind: Edit['kind']) {
  const text = kind === 'text' ? '' : textOf(element)
  return `Layer "${layerName(element)}"${text ? ` with the text "${text}"` : ''}`
}

/** How a draft prompt names an edit's element: as it was when the edit was made. */
export function describeEdit(edit: Edit, documentOf: (screen: string) => Document | undefined) {
  if (edit.label) return edit.label
  const root = documentOf(edit.screen)?.getElementById(SCREEN_ROOT_ID)
  const element = root ? elementAt(root, edit.node) : undefined
  return element ? labelOf(element, edit.kind) : 'An element the screen no longer has'
}
