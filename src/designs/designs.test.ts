// Every design in designs/ holds together: the studio and the canvas page can draw it, and a
// visitor's tweaks have somewhere to land.
import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { designFolders, designs, screenFiles } from './registry.ts'

describe.each(designs.map((design) => [design.id, design] as const))('design %s', (id, design) => {
  const screens = [...design.screens, ...(design.explorations ?? [])]

  it('lives in the folder its id names', () => {
    expect(designFolders).toContain(id)
    expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  it('has a file for every screen, and a screen for every file', () => {
    expect(screens.length).toBeGreaterThan(0)
    expect(screenFiles(id).sort()).toEqual(screens.map((s) => s.id).sort())
  })

  it('names each screen once', () => {
    expect(new Set(screens.map((s) => s.id)).size).toBe(screens.length)
  })

  it('has a date, a summary and a brief', () => {
    expect(design.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(design.summary.trim()).not.toBe('')
    expect(design.brief.trim()).not.toBe('')
  })

  it('gives each tweak a default among its options', () => {
    for (const tweak of design.tweaks ?? []) {
      expect(tweak.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      expect(tweak.options.map((o) => o.value)).toContain(tweak.defaultValue)
    }
  })

  it('styles with Perron tokens, not raw colours', () => {
    const files = readdirSync(`designs/${id}`, { recursive: true, encoding: 'utf8' }).filter(
      (file) => /\.(tsx?|css)$/.test(file),
    )
    for (const file of files) {
      const source = readFileSync(`designs/${id}/${file}`, 'utf8')
      expect.soft(source, file).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\(/)
    }
  })
})
