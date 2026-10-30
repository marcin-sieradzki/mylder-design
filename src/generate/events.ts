// What the studio shows while Claude Code generates a design on the maintainer's machine: Claude
// Code's stream-json output, boiled down to lines a person can follow. Shared by the dev server's
// generate plugin, which writes them, and the studio's prompt panel, which reads them.

export type GenerateEvent =
  | { type: 'text'; text: string }
  | { type: 'tool'; name: string; detail: string }
  | { type: 'done'; ok: boolean; summary: string }
  | { type: 'error'; message: string }

/** Where the dev server listens; the static build has no such route. */
export const GENERATE_ROUTE = '/__studio/generate'

export interface GenerateRequest {
  /** The brief for a new design, or what to change in an existing one */
  prompt: string
  /** The design to change; left out, Claude makes a new design */
  designId?: string
}

export interface GenerateStatus {
  /** Whether the `claude` command is on the dev server's PATH */
  available: boolean
  running: boolean
}

const firstLine = (text: string, max = 120) => {
  const line = text.trim().split('\n')[0] ?? ''
  return line.length > max ? `${line.slice(0, max - 1)}…` : line
}

function toolDetail(input: Record<string, unknown>): string {
  for (const key of [
    'file_path',
    'command',
    'pattern',
    'query',
    'component',
    'path',
    'skill',
    'description',
  ]) {
    const value = input[key]
    if (typeof value === 'string') return firstLine(value)
  }
  return ''
}

/** Turns one line of `claude -p --output-format stream-json` into the events it holds. */
export function eventsOf(line: string): GenerateEvent[] {
  let message: Record<string, unknown>
  try {
    message = JSON.parse(line) as Record<string, unknown>
  } catch {
    return []
  }
  if (message.type === 'assistant') {
    const content = (message.message as { content?: unknown[] } | undefined)?.content ?? []
    return content.flatMap((block): GenerateEvent[] => {
      const b = block as { type?: string; text?: string; name?: string; input?: unknown }
      if (b.type === 'text' && b.text?.trim()) return [{ type: 'text', text: b.text.trim() }]
      if (b.type === 'tool_use' && b.name)
        return [
          {
            type: 'tool',
            name: b.name,
            detail: toolDetail((b.input ?? {}) as Record<string, unknown>),
          },
        ]
      return []
    })
  }
  if (message.type === 'result') {
    const ok = message.subtype === 'success' && message.is_error !== true
    const result = typeof message.result === 'string' ? message.result : ''
    return [{ type: 'done', ok, summary: firstLine(result, 400) }]
  }
  return []
}
