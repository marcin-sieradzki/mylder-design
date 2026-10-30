import { describe, expect, it } from 'vitest'
import { eventsOf } from './events.ts'

describe('eventsOf', () => {
  it('reads Claude Code’s text and tool calls', () => {
    const line = JSON.stringify({
      type: 'assistant',
      message: {
        content: [
          { type: 'text', text: 'Writing the phone screen.' },
          { type: 'tool_use', name: 'Write', input: { file_path: 'designs/a/screens/phone.tsx' } },
        ],
      },
    })
    expect(eventsOf(line)).toEqual([
      { type: 'text', text: 'Writing the phone screen.' },
      { type: 'tool', name: 'Write', detail: 'designs/a/screens/phone.tsx' },
    ])
  })

  it('reads the result, and skips what it does not show', () => {
    expect(
      eventsOf(JSON.stringify({ type: 'result', subtype: 'success', result: 'Made rush-hour.' })),
    ).toEqual([{ type: 'done', ok: true, summary: 'Made rush-hour.' }])
    expect(eventsOf(JSON.stringify({ type: 'system', subtype: 'init' }))).toEqual([])
    expect(eventsOf('not json')).toEqual([])
  })
})
