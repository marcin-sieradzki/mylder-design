// The Perron tokens draft mode offers. A visitor picks a token, never a raw value, so every draft
// stays inside Perron.
import { theme, base, cssVar, type TokenName } from '@mylder/perron/tokens.ts'

const names = [...Object.keys(theme.light), ...Object.keys(base)] as TokenName[]

const under = (prefix: string, skip: readonly string[] = []) =>
  names.filter((name) => name.startsWith(prefix) && !skip.some((s) => name.includes(s)))

/** A token's name without its group, for a menu: `color.text.secondary` → `secondary`. */
export const shortName = (name: string, prefix: string) => name.slice(prefix.length)

export const TEXT_COLORS = under('color.text.')
export const SURFACE_COLORS = under('color.surface.', ['hover', 'pressed'])
export const SPACES = under('space.')
export const RADII = under('radius.')

export { cssVar }
export type { TokenName }
