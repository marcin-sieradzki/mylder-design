// One of Perron's icons, its file from @mylder/perron/icons/ drawn as a mask in the text's colour
// at Perron's icon size (`.perron-icon`), so nothing copies an icon's paths. It is decoration:
// the control it sits in carries the name.
import type { CSSProperties } from 'react'
import './icon.css'

const files = import.meta.glob<string>('/node_modules/@mylder/perron/icons/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

const urls = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.slice(path.lastIndexOf('/') + 1, -4), url]),
)

/** Perron's icons, by file name. */
export type IconName =
  | 'aircraft'
  | 'arrow-down'
  | 'calendar'
  | 'check-circle'
  | 'chevron-down'
  | 'chevron-right'
  | 'close'
  | 'dash'
  | 'diversion'
  | 'exclamation-circle'
  | 'info'
  | 'info-circle'
  | 'locate'
  | 'minus'
  | 'monitor'
  | 'pause'
  | 'play'
  | 'plus'
  | 'search'
  | 'signal-off'
  | 'tick'
  | 'warning'

export const iconNames = Object.keys(urls) as IconName[]

export function Icon({ name, style }: { name: IconName; style?: CSSProperties }) {
  const mask = { ...style, '--kit-icon': `url("${urls[name]}")` } as CSSProperties
  return <span className="perron-icon kit-icon" style={mask} aria-hidden="true" />
}
