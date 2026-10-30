// One screen in its device frame: the canvas page in a same-origin iframe, scaled to the board.
// The frame keeps the screen's document in step with the studio: the theme, the tweaks and the
// visitor's draft edits. In edit mode it turns the screen's clicks into selections and lets a
// double click type over a piece of text; in interact mode the screen works as designed.
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { canvasUrl, isReadyMessage, SCREEN_ROOT_ID, type Theme } from '../canvas/protocol.ts'
import { Applier, isTextNode, type Edit } from '../draft/edits.ts'
import { elementAt, pathOf } from '../draft/paths.ts'
import { DEVICE_SIZE, type Screen } from '../designs/types.ts'
import { showTheme, showTweaks } from './screen-document.ts'

export type Mode = 'interact' | 'edit' | 'static'

export interface FrameProps {
  designId: string
  screen: Screen
  theme: Theme
  scale: number
  tweaks: Readonly<Record<string, string>>
  edits?: readonly Edit[]
  mode: Mode
  /** The selected node's path in this screen */
  selected?: string
  onSelect?: (node: string | undefined) => void
  onTextEdit?: (node: string, text: string, was: string) => void
  /** The screen's document once it has drawn, for the inspector to read */
  onDocument?: (screenId: string, document: Document | undefined) => void
}

const HOVER = 'data-studio-hover'
const SELECTED = 'data-studio-selected'

/** The studio's marks inside a screen: hover and selection outlines, in Perron's focus colour. */
const MARKS = `
  [${HOVER}] { outline: 1px dashed var(--perron-color-border-focus); outline-offset: 1px; cursor: default; }
  [${SELECTED}] { outline: 2px solid var(--perron-color-border-focus) !important; outline-offset: 1px; }
  [contenteditable] { outline: 2px solid var(--perron-color-border-brand) !important; cursor: text; }
`

export function Frame({
  designId,
  screen,
  theme,
  scale,
  tweaks,
  edits = [],
  mode,
  selected,
  onSelect,
  onTextEdit,
  onDocument,
}: FrameProps) {
  const iframe = useRef<HTMLIFrameElement>(null)
  const [doc, setDoc] = useState<Document>()
  const applier = useMemo(() => (doc ? new Applier() : undefined), [doc])
  // the address keeps its first theme; later changes go straight to the document, with no reload
  const [src] = useState(() => canvasUrl(designId, screen.id, theme))
  const size = DEVICE_SIZE[screen.device]
  const root = doc?.getElementById(SCREEN_ROOT_ID) ?? undefined

  // the screen has drawn: its document is ready to edit
  useEffect(() => {
    const frame = iframe.current
    if (!frame) return
    const adopt = () => {
      const document = frame.contentDocument
      if (document?.documentElement.dataset.ready === 'true') setDoc(document)
    }
    const onMessage = (event: MessageEvent) => {
      if (event.source === frame.contentWindow && isReadyMessage(event.data)) adopt()
    }
    window.addEventListener('message', onMessage)
    adopt()
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    onDocument?.(screen.id, doc)
    return () => onDocument?.(screen.id, undefined)
  }, [doc, onDocument, screen.id])

  useEffect(() => {
    if (doc) showTheme(doc, theme)
  }, [doc, theme])

  useEffect(() => {
    if (doc) showTweaks(doc, tweaks)
  }, [doc, tweaks])

  // the draft's edits, then the selection's mark on top
  useEffect(() => {
    if (!root || !applier) return
    applier.apply(root, edits)
    for (const marked of root.querySelectorAll(`[${SELECTED}]`)) marked.removeAttribute(SELECTED)
    if (selected) elementAt(root, selected)?.setAttribute(SELECTED, '')
  }, [root, applier, edits, selected])

  // edit mode: hover marks, clicks select, a double click types over text
  useEffect(() => {
    if (!doc || !root || !applier || mode !== 'edit') return
    const style = doc.createElement('style')
    style.textContent = MARKS
    doc.head.append(style)

    const target = (event: Event) => {
      const element = event.target as Element | null
      return element && element !== root && root.contains(element) ? element : undefined
    }
    const editing = () => doc.querySelector('[contenteditable]')

    const block = (event: Event) => {
      const element = event.target as Element | null
      const open = editing() as HTMLElement | null
      if (open?.contains(element)) return
      // a press outside the text being typed finishes it, as focus would have moved
      open?.blur()
      event.preventDefault()
      event.stopPropagation()
    }
    const over = (event: Event) => target(event)?.setAttribute(HOVER, '')
    const out = (event: Event) => target(event)?.removeAttribute(HOVER)
    const click = (event: Event) => {
      block(event)
      const element = target(event)
      if (editing()?.contains(element ?? null)) return
      onSelect?.(element ? pathOf(element, root) : undefined)
    }
    const doubleClick = (event: Event) => {
      block(event)
      const element = target(event) as HTMLElement | undefined
      if (!element || element.isContentEditable || !isTextNode(element)) return
      const node = pathOf(element, root)
      if (!node) return
      applier.remember(element)
      const before = element.textContent ?? ''
      element.contentEditable = 'plaintext-only'
      element.focus()
      doc.getSelection()?.selectAllChildren(element)
      const finish = (keep: boolean) => {
        element.removeEventListener('blur', onBlur)
        element.removeEventListener('keydown', onKey)
        element.removeAttribute('contenteditable')
        const text = element.textContent ?? ''
        if (keep && text.trim() && text !== before) onTextEdit?.(node, text, before)
        else element.textContent = before
      }
      const onBlur = () => finish(true)
      const onKey = (key: KeyboardEvent) => {
        if (key.key === 'Enter') {
          key.preventDefault()
          finish(true)
        } else if (key.key === 'Escape') finish(false)
      }
      element.addEventListener('blur', onBlur)
      element.addEventListener('keydown', onKey)
    }

    const listeners: [string, (event: Event) => void][] = [
      ['pointerdown', block],
      ['mousedown', block],
      ['pointerup', block],
      ['mouseup', block],
      ['pointerover', over],
      ['pointerout', out],
      ['click', click],
      ['dblclick', doubleClick],
    ]
    for (const [type, listener] of listeners) doc.addEventListener(type, listener, true)
    return () => {
      for (const [type, listener] of listeners) doc.removeEventListener(type, listener, true)
      style.remove()
      for (const marked of doc.querySelectorAll(`[${HOVER}]`)) marked.removeAttribute(HOVER)
    }
  }, [doc, root, applier, mode, onSelect, onTextEdit])

  const box = { width: size.width * scale, height: size.height * scale } as CSSProperties
  const frame = {
    width: size.width,
    height: size.height,
    transform: `scale(${scale})`,
  } as CSSProperties

  return (
    <div className="studio-frame" data-device={screen.device} data-mode={mode} style={box}>
      <iframe
        ref={iframe}
        className="studio-frame-screen"
        src={src}
        title={screen.name}
        style={frame}
        loading={mode === 'static' ? 'lazy' : 'eager'}
        // a preview is a picture of the screen: out of the tab order and the reading order
        tabIndex={mode === 'static' ? -1 : undefined}
        aria-hidden={mode === 'static' ? true : undefined}
        inert={mode === 'static'}
      />
    </div>
  )
}
