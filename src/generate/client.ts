// The studio's side of generating: asks the dev server to run Claude Code and reads its events.
// Only the dev server (`npm run dev`) has the route; the static build never calls it.
import {
  GENERATE_ROUTE,
  type GenerateEvent,
  type GenerateRequest,
  type GenerateStatus,
} from './events.ts'

/** Whether this page can generate: the dev server is running and has `claude` on its PATH. */
export async function generateStatus(): Promise<GenerateStatus> {
  if (!import.meta.env.DEV) return { available: false, running: false }
  try {
    const response = await fetch(GENERATE_ROUTE)
    return response.ok
      ? ((await response.json()) as GenerateStatus)
      : { available: false, running: false }
  } catch {
    return { available: false, running: false }
  }
}

/** Runs Claude Code on the request, calling `onEvent` with each event as it arrives. */
export async function generate(
  request: GenerateRequest,
  onEvent: (event: GenerateEvent) => void,
  signal?: AbortSignal,
) {
  const response = await fetch(GENERATE_ROUTE, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  })
  if (!response.ok || !response.body) {
    onEvent({
      type: 'error',
      message: (await response.text()) || `The dev server answered ${response.status}.`,
    })
    return
  }
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffered = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffered += value
    const lines = buffered.split('\n')
    buffered = lines.pop() ?? ''
    for (const line of lines) if (line.trim()) onEvent(JSON.parse(line) as GenerateEvent)
  }
}

export const stopGenerating = () => fetch(GENERATE_ROUTE, { method: 'DELETE' })
