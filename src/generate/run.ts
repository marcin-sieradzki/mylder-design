// The one generate run the studio follows, kept outside any component so it survives moving
// between the gallery and a design: its log, its outcome, and how to stop it.
import { useSyncExternalStore } from 'react'
import { generate, generateStatus, stopGenerating } from './client.ts'
import type { GenerateEvent, GenerateRequest } from './events.ts'

/** How many of Claude's latest steps the log keeps. */
const LOG_LENGTH = 40

export interface RunState {
  /** Whether this page can generate at all */
  available: boolean
  running: boolean
  /** The design the run revises; undefined for a new design or no run */
  designId?: string
  log: readonly GenerateEvent[]
  outcome?: GenerateEvent
}

let state: RunState = { available: false, running: false, log: [] }
const listeners = new Set<() => void>()
let abort: AbortController | undefined

function update(change: Partial<RunState>) {
  state = { ...state, ...change }
  for (const listener of listeners) listener()
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Asks the dev server once whether Claude Code is there, and whether a run is under way. */
let checked = false
function check() {
  if (checked) return
  checked = true
  void generateStatus().then(({ available, running }) =>
    update({
      available,
      running: running || state.running,
      outcome:
        running && !state.running
          ? { type: 'error', message: 'Claude is already working on a design in another tab.' }
          : state.outcome,
    }),
  )
}

export function useRun(): RunState {
  check()
  return useSyncExternalStore(subscribe, () => state)
}

export async function startRun(request: GenerateRequest) {
  if (state.running) return
  abort = new AbortController()
  update({ running: true, designId: request.designId, log: [], outcome: undefined })
  try {
    await generate(
      request,
      (event) => {
        if (event.type === 'done' || event.type === 'error') update({ outcome: event })
        else update({ log: [...state.log, event].slice(-LOG_LENGTH) })
      },
      abort.signal,
    )
  } catch (error) {
    if (!abort.signal.aborted)
      update({
        outcome: { type: 'error', message: error instanceof Error ? error.message : String(error) },
      })
  } finally {
    update({ running: false })
  }
}

export function stopRun() {
  abort?.abort()
  void stopGenerating()
  update({ running: false, outcome: { type: 'error', message: 'Stopped.' } })
}
