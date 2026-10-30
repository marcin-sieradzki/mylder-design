// The studio's changes to a screen's document that are not draft edits: its theme and tweaks,
// set on <html> where the screen's CSS reads them.
import type { Theme } from '../canvas/protocol.ts'

export function showTheme(document: Document, theme: Theme) {
  document.documentElement.dataset.theme = theme
}

export function showTweaks(document: Document, tweaks: Readonly<Record<string, string>>) {
  for (const [id, value] of Object.entries(tweaks))
    document.documentElement.setAttribute(`data-tweak-${id}`, value)
}
