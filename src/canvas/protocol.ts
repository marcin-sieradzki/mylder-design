// How the studio and a canvas page talk. The canvas page is same-origin, so the studio reads and
// edits its document directly; the only message is the canvas saying its screen has drawn.

export type Theme = 'light' | 'dark'

export const READY = 'mylder-design:ready'

export interface ReadyMessage {
  type: typeof READY
  designId: string
  screenId: string
}

export const isReadyMessage = (data: unknown): data is ReadyMessage =>
  typeof data === 'object' && data !== null && (data as { type?: unknown }).type === READY

/** The canvas page's address for one screen. */
export const canvasUrl = (designId: string, screenId: string, theme: Theme) =>
  `${import.meta.env.BASE_URL}canvas.html?${new URLSearchParams({ design: designId, screen: screenId, theme })}`

/** The id of the element the screen renders into; draft edits address nodes from it. */
export const SCREEN_ROOT_ID = 'root'
