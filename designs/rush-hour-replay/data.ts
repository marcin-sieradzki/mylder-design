// This morning as Mylder recorded it, 06:00 to 10:00 on Friday 30 October: one model of the
// morning, minute by minute, that the map, the timeline and City pulse all read, so the figures
// agree with each other and with the dots at every moment. Fixed curves, no randomness: the same
// minute always gives the same morning.
import type { DataStateKeyCounts, DisruptionCardLine } from '@mylder/perron/patterns'
import type { CityMapVehicle } from '#kit'

/** The replay's ends and the busiest minute, in minutes after midnight. */
export const START = 6 * 60
export const END = 10 * 60

/** The morning the replay shows. */
export const DAY = { label: 'Friday 30 October', dateTime: '2026-10-30' }

/** The speeds the replay plays at, in replay seconds a second. */
export const SPEEDS = ['1', '10', '60'] as const
export type Speed = (typeof SPEEDS)[number]

/** A count as Mylder writes it: thousands grouped by a space that doesn't break, "1 046". */
export const grouped = (count: number) => String(count).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

/** A minute after midnight as the 24-hour clock, "08:12"; with `seconds`, "08:12:30". */
export function clock(minute: number, seconds = false) {
  const whole = Math.floor(minute * 60 + 1e-6)
  const pad = (n: number) => String(n).padStart(2, '0')
  const hm = `${pad(Math.floor(whole / 3600))}:${pad(Math.floor(whole / 60) % 60)}`
  return seconds ? `${hm}:${pad(whole % 60)}` : hm
}

/** Mylder's thresholds: Live up to 2.5 polls of a minute, No signal past 5 min. */
export const THRESHOLDS = { live: 150_000, ageing: 300_000 }

/** "How sure are we?": each state's sentence in Mylder's words. */
export const STATE_SENTENCES = {
  live: 'Reported by the vehicle in the latest answers.',
  ageing: 'Last reported a few minutes ago; moving on along its path since.',
  estimated: 'Placed from the timetable and a known delay, or computed by Rejseplanen.',
  timetableOnly: 'No realtime for this trip today; placed from the timetable.',
  noSignal: 'Had realtime, missing for 5 min; moving on the timetable and its last delay.',
}

// ---- What happened this morning ----

/** A moment the timeline marks and the rider can jump to. */
export interface Moment {
  id: 'signal-fault' | 'movia-gap' | 'busiest'
  /** The words on its jump button */
  name: string
  /** Where the jump lands, and where a stretch starts */
  at: number
  /** Where a stretch ends; a single minute has none */
  until?: number
}

/** Rejseplanen's disruption: a signal fault on the S-tog west of København H. */
export const SIGNAL_FAULT = {
  severity: 'delay' as const,
  from: 7 * 60 + 20,
  to: 7 * 60 + 55,
  lines: [
    { line: 'b', name: 'B' },
    { line: 'c', name: 'C' },
    { line: 'h', name: 'H' },
  ] satisfies DisruptionCardLine[],
  title: 'Signalfejl ved Valby',
  body: 'Der er forsinkelser på op til 10 minutter for S-tog mellem Valby og København H på grund af signalfejl.',
  stops: { from: 'Valby', to: 'København H' },
}

/** Mylder's own data card: Movia's buses sent no positions for 13 min. */
export const MOVIA_GAP = {
  severity: 'data' as const,
  from: 7 * 60 + 38,
  to: 7 * 60 + 51,
  title: 'No positions from Movia',
  body: "Movia's buses sent no positions for 13 min. Mylder moved them on by the timetable and their last delay: Ageing after 2.5 min, then No signal.",
}

// ---- The curves ----

/** The morning's swell: 0 at its quietest, 1 at the peak, rising faster than it falls. */
function swell(minute: number) {
  const peak = 8 * 60 + 12
  const spread = minute < peak ? 70 : 96
  return Math.exp(-(((minute - peak) / spread) ** 2))
}

/** A small, fixed ripple, so the curves look recorded rather than drawn. */
const ripple = (minute: number) => 5 * Math.sin(minute * 0.9) + 3 * Math.sin(minute * 2.3 + 1)

/** How far into a stretch a minute is, 0 to 1, and 0 outside it. */
function within(minute: number, from: number, to: number) {
  return minute >= from && minute < to ? (minute - from) / (to - from) : 0
}

/** Everything City pulse shows at one minute of the replay. */
export interface Pulse {
  minute: number
  inService: number
  states: Required<DataStateKeyCounts>
  /** Live vehicles over every vehicle in service, in whole percent */
  reportingLive: number
  /** Expected minus scheduled, in minutes, Metro left out */
  averageDelay: number
}

/** The morning at one whole minute: the trips in service and how sure the map was of each. */
export function pulseAt(time: number): Pulse {
  const minute = Math.floor(time)
  const inService = Math.round(620 + 720 * swell(minute) + ripple(minute))
  const buses = Math.round(inService * 0.69)
  // Movia's buses go quiet at 07:38: still Live for 2.5 min, then Ageing, then No signal at 07:43
  const quiet = minute >= MOVIA_GAP.from && minute < MOVIA_GAP.to
  const silentFor = minute - MOVIA_GAP.from
  const quietBuses = quiet ? Math.round(buses * 0.86) : 0
  const ageingQuiet = quiet && silentFor >= 2.5 && silentFor < 5 ? quietBuses : 0
  const silentQuiet = quiet && silentFor >= 5 ? quietBuses : 0

  const timetableOnly = Math.round(70 + inService * 0.035)
  const noSignal = Math.round(inService * 0.018) + silentQuiet
  const ageing = Math.round(inService * 0.11 + 4 * Math.sin(minute * 0.7)) + ageingQuiet
  const estimated = Math.round(inService * 0.29 + 6 * Math.sin(minute * 0.4 + 2))
  const live = inService - timetableOnly - noSignal - ageing - estimated

  const fault = within(minute, SIGNAL_FAULT.from, SIGNAL_FAULT.to)
  const faultDelay = fault ? 2.6 * Math.sin(Math.PI * fault) : 0
  const averageDelay = 0.4 + 1.1 * swell(minute) + faultDelay + 0.1 * Math.sin(minute * 1.3)

  return {
    minute,
    inService,
    states: { live, ageing, estimated, timetableOnly, noSignal },
    reportingLive: Math.round((live / inService) * 100),
    averageDelay: Math.round(averageDelay * 10) / 10,
  }
}

/** Every minute of the replay, 06:00 to 10:00. */
export const MORNING: readonly Pulse[] = Array.from({ length: END - START + 1 }, (_, i) =>
  pulseAt(START + i),
)

/** The minute with the most vehicles in service. */
export const BUSIEST = MORNING.reduce((most, p) => (p.inService > most.inService ? p : most))

/** The moments the timeline marks, in the order of the morning. */
export const MOMENTS: readonly Moment[] = [
  {
    id: 'signal-fault',
    name: 'Disruption on the S-tog',
    at: SIGNAL_FAULT.from,
    until: SIGNAL_FAULT.to,
  },
  { id: 'movia-gap', name: 'No positions from Movia', at: MOVIA_GAP.from, until: MOVIA_GAP.to },
  { id: 'busiest', name: 'Busiest minute', at: BUSIEST.minute },
]

/** A delay as Mylder writes it: "+1.4 min", "−0.3 min", "0 min". */
export function delay(minutes: number) {
  const sign = minutes > 0 ? '+' : minutes < 0 ? '−' : ''
  return `${sign}${Math.abs(minutes).toFixed(1)} min`
}

// ---- The vehicles on the map ----

interface Trip {
  route: string
  /** When it enters and leaves the map */
  from: number
  to: number
  /** Minutes for one run along its route */
  run: number
  /** Where along its run it is at `from`, 0 to 1 */
  phase: number
  base: CityMapVehicle['state']
}

const METRO = ['m1', 'm2', 'm3', 'm4-north', 'm4-south']
const S_TOG = ['a', 'b', 'c', 'e', 'f']
const BUSES = [
  'bus-west',
  'bus-southwest',
  'bus-south',
  'bus-north',
  'bus-northwest',
  'bus-northeast',
  'bus-amager',
  'bus-valby',
  'bus-ring',
]

/** The state a trip has when nothing happens to it, by its place in the list. */
function baseState(route: string, i: number): CityMapVehicle['state'] {
  if (METRO.includes(route)) return 'timetable'
  if (i % 7 === 3) return 'estimated'
  if (i % 11 === 5) return 'ageing'
  if (i === 26) return 'no-signal'
  return 'live'
}

/** The trips the drawing shows: a few all morning, more joining for the rush and leaving after. */
const TRIPS: readonly Trip[] = Array.from({ length: 64 }, (_, i) => {
  const routes = [...METRO, ...S_TOG, ...BUSES]
  const route = routes[i % routes.length] ?? 'bus-west'
  const allMorning = i < 22
  return {
    route,
    from: allMorning ? START - 60 : 6 * 60 + 40 + ((i * 13) % 70),
    to: allMorning ? END + 60 : 8 * 60 + 50 + ((i * 17) % 80),
    run: METRO.includes(route) ? 24 : S_TOG.includes(route) ? 32 : 40,
    phase: (((i * 0.37) % 1) + 1) % 1,
    base: baseState(route, i),
  }
})

/** Back and forth along a route: 0 to 1 and back again over two runs. */
function shuttle(x: number) {
  const u = ((x % 2) + 2) % 2
  return u <= 1 ? u : 2 - u
}

/** A trip's state at a moment, as the morning's events changed it. */
function stateAt(trip: Trip, time: number): CityMapVehicle['state'] {
  const silentFor = time - MOVIA_GAP.from
  const quietBus = BUSES.includes(trip.route) && (trip.base === 'live' || trip.base === 'ageing')
  if (quietBus && time >= MOVIA_GAP.from && time < MOVIA_GAP.to) {
    if (silentFor >= 5) return 'no-signal'
    if (silentFor >= 2.5) return 'ageing'
  }
  return trip.base
}

/** Every vehicle the drawing shows at a moment of the replay, where it was and in its state. */
export function vehiclesAt(time: number): CityMapVehicle[] {
  return TRIPS.filter((t) => time >= t.from && time < t.to).map((t) => {
    const x = t.phase + (time - t.from) / t.run
    const at = t.route === 'm3' ? x - Math.floor(x) : shuttle(x)
    return { route: t.route, state: stateAt(t, time), at: Math.min(0.995, Math.max(0.005, at)) }
  })
}
