// Every design in designs/, found at build time. The studio reads the descriptions eagerly; a
// screen's component loads only in the canvas page that draws it.
import type { ComponentType } from 'react'
import revisions from 'virtual:design-revisions'
import type { Design } from './types.ts'

const descriptions = import.meta.glob<{ design: Design }>('/designs/*/design.ts', { eager: true })

const screenModules = import.meta.glob<{ default: ComponentType }>('/designs/*/screens/*.tsx')

/** The folder a design.ts sits in. */
const folderOf = (path: string) => path.split('/').at(-2) ?? ''

/** Every design, newest first. */
export const designs: readonly Design[] = Object.values(descriptions)
  .map((module) => module.design)
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))

export const designById = (id: string) => designs.find((design) => design.id === id)

/** The folders that hold a design.ts, for checking each design's id against its folder. */
export const designFolders = Object.keys(descriptions).map(folderOf)

/** Loads a screen's component, or returns undefined when the design has no such screen file. */
export const loadScreen = (designId: string, screenId: string) =>
  screenModules[`/designs/${designId}/screens/${screenId}.tsx`]?.()

/** The screen files a design has, by id. */
export const screenFiles = (designId: string) =>
  Object.keys(screenModules)
    .filter((path) => path.startsWith(`/designs/${designId}/screens/`))
    .map((path) => path.slice(path.lastIndexOf('/') + 1, -'.tsx'.length))

/**
 * A hash of everything in the design's folder. A draft remembers the revision it was made on, so
 * the studio can tell a visitor when the saved design has changed under their draft.
 */
export const revisionOf = (designId: string): string => revisions[designId] ?? 'unknown'
