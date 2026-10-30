import { describe, expect, it } from 'vitest'
import { defineDesign } from '../designs/types.ts'
import { draftToPrompt } from './prompt.ts'

const design = defineDesign({
  id: 'rush-hour',
  title: 'Rush hour replay',
  summary: 'Replays a morning.',
  brief: 'A replay.',
  date: '2026-10-30',
  screens: [{ id: 'desktop', name: 'Desktop', device: 'desktop' }],
  tweaks: [
    {
      id: 'density',
      label: 'Density',
      defaultValue: 'roomy',
      options: [
        { value: 'roomy', label: 'Roomy' },
        { value: 'compact', label: 'Compact' },
      ],
    },
  ],
})

describe('draftToPrompt', () => {
  it('lists each edit by screen, and only tweaks that differ from the default', () => {
    const prompt = draftToPrompt(
      design,
      {
        revision: 'r1',
        edits: [
          { screen: 'desktop', node: '0.1', kind: 'text', value: 'Morning', was: 'Rush hour' },
          { screen: 'desktop', node: '0.2', kind: 'padding', token: 'space.400' },
        ],
        tweaks: { density: 'compact' },
      },
      (edit) => `Layer ${edit.node}`,
    )
    expect(prompt).toContain('designs/rush-hour/')
    expect(prompt).toContain('In screens/desktop.tsx:')
    expect(prompt).toContain(
      '- Layer 0.1 (node 0.1): change its text from "Rush hour" to "Morning"',
    )
    expect(prompt).toContain('set its padding to space.400')
    expect(prompt).toContain('- density: compact')
  })

  it('leaves out tweaks set to their default', () => {
    const prompt = draftToPrompt(
      design,
      { revision: 'r1', edits: [], tweaks: { density: 'roomy' } },
      () => '',
    )
    expect(prompt).not.toContain('density')
  })
})
