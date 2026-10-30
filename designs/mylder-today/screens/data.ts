// Mylder's map at 08:14 on a weekday morning: one fixed snapshot every screen reads, so the
// figures agree with each other as they do in the app. The words are Mylder's own (its en.json),
// and the lines, stops, operators and times are Copenhagen's.
import type {
  DataStateKeyCounts,
  DayProfileChartPoint,
  DepartureRowProps,
  StopTimelineStop,
  VehicleTableVehicle,
} from '@mylder/perron/patterns'

/** A count as Mylder writes it: thousands grouped by a space that doesn't break, "1 046". */
export const grouped = (count: number) => String(count).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

/** The time of the position answer the whole map moves on, with seconds. */
export const UPDATED = '08:14:05'

/** The modes the timetable runs, in Mylder's order, each with its trips underway now. */
export const MODES = [
  { id: 'bus', name: 'Bus', underway: 912 },
  { id: 'metro', name: 'Metro', underway: 38 },
  { id: 's-tog', name: 'S-tog', underway: 96 },
  { id: 'train', name: 'Train', underway: 41 },
  { id: 'light-rail', name: 'Light rail', underway: 22 },
] as const

/** The aircraft the map draws over Kastrup. */
export const PLANES = 12

/** City pulse's key figures. Every trip on the map, Waiting trips included, is in service. */
export const PULSE = {
  moving: 1046,
  inService: 1312,
  reported: 412,
  averageDelay: '+1.4',
}

/** The trips on the map in each data state; they add up to the trips in service. */
export const STATES: Required<DataStateKeyCounts> = {
  live: 486,
  ageing: 164,
  estimated: 521,
  timetableOnly: 112,
  noSignal: 29,
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

interface ModeMeter {
  mode: string
  /** Live and Ageing trips, and every trip underway in the mode; none when the mode can't report */
  share?: { count: number; total: number }
  /** The mode's authority or operator, or why the share is "—" */
  line: string
}

/** Reporting live, by mode: Live and Ageing over the trips underway, Waiting trips left out. */
export const METERS: readonly ModeMeter[] = [
  { mode: 'Bus', share: { count: 538, total: 912 }, line: 'Movia' },
  { mode: 'Metro', line: 'No realtime from the Metro; placed from the timetable' },
  { mode: 'S-tog', share: { count: 81, total: 96 }, line: 'DSB' },
  { mode: 'Train', share: { count: 26, total: 41 }, line: 'DSB' },
  { mode: 'Light rail', share: { count: 5, total: 22 }, line: 'Hovedstadens Letbane' },
]

/** A share's colour, as Mylder picks it: green from 70 %, amber from 40 %, red under. */
export const meterColor = ({ count, total }: { count: number; total: number }) =>
  count / total >= 0.7 ? 'success' : count / total >= 0.4 ? 'warning' : 'danger'

/** The planned trips underway on the hour, from the timetable's day profile. */
const HOURLY = [
  210, 120, 60, 50, 90, 380, 820, 1210, 1344, 1150, 960, 940, 950, 960, 1040, 1210, 1296, 1220,
  1010, 780, 620, 540, 460, 340, 210,
]

const clock = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

/** The day's profile a quarter hour apart, each quarter between two hours on the line joining them. */
export const DAY_PROFILE: DayProfileChartPoint[] = Array.from({ length: 96 }, (_, i) => {
  const hour = Math.floor(i / 4)
  const share = (i % 4) / 4
  const count = Math.round(HOURLY[hour]! + (HOURLY[hour + 1]! - HOURLY[hour]!) * share)
  return { time: clock(i * 15), count }
})

/** The day's most planned trips, at the first quarter hour that reaches it. */
export const PEAK = DAY_PROFILE.reduce((peak, point) =>
  (point.count ?? 0) > (peak.count ?? 0) ? point : peak,
)

/** The Vehicles list: a few of the 1 312 rows, sorted by line, Metro, S-tog, Train, then Bus. */
export const VEHICLES: VehicleTableVehicle[] = [
  { id: 'm1-1', line: 'm1', lineName: 'M1', destination: 'Vestamager', variant: 'timetable-only' },
  { id: 'm2-1', line: 'm2', lineName: 'M2', destination: 'Lufthavnen', variant: 'timetable-only' },
  { id: 'm4-1', line: 'm4', lineName: 'M4', destination: 'Orientkaj', variant: 'timetable-only' },
  { id: 'a-1', line: 'a', lineName: 'A', destination: 'Hillerød', variant: 'live', delay: 0 },
  {
    id: 'b-1',
    line: 'b',
    lineName: 'B',
    destination: 'Høje Taastrup',
    variant: 'ageing',
    delay: 1,
  },
  { id: 'c-1', line: 'c', lineName: 'C', destination: 'Klampenborg', variant: 'live', delay: 2 },
  { id: 'e-1', line: 'e', lineName: 'E', destination: 'Køge', variant: 'estimated', delay: 1 },
  { id: 'h-1', line: 'h', lineName: 'H', destination: 'Frederikssund', variant: 'live', delay: 0 },
  {
    id: 're-1',
    line: 'regional',
    lineName: 'Re',
    destination: 'Helsingør',
    variant: 'ageing',
    delay: 1,
  },
  {
    id: '1a-1',
    line: 'bus',
    lineName: '1A',
    destination: 'Hellerup St.',
    variant: 'live',
    delay: -1,
  },
  {
    id: '5c-1',
    line: 'bus',
    lineName: '5C',
    destination: 'Herlev Hospital',
    variant: 'live',
    delay: 4,
  },
  {
    id: '6a-1',
    line: 'bus',
    lineName: '6A',
    destination: 'Buddinge',
    variant: 'estimated',
    delay: 2,
  },
  {
    id: '350s-1',
    line: 'bus',
    lineName: '350S',
    destination: 'Ballerup St.',
    variant: 'no-signal',
  },
]

/** Disruptions: Rejseplanen's messages active now, in its own words and language. */
export const DISRUPTIONS = [
  {
    id: 'hellerup',
    severity: 'delay',
    title: 'Signalfejl ved Hellerup',
    body: 'Der kan forekomme forsinkelser og aflysninger mellem Hellerup og Klampenborg.',
    stops: { from: 'Hellerup', to: 'Klampenborg' },
    from: '07:52',
  },
  {
    id: 'norrebrogade',
    severity: 'diversion',
    title: 'Omkørsel på Nørrebrogade',
    body: 'Busserne kører en anden vej på grund af vejarbejde. Stoppestederne flyttes.',
    stops: ['Nørrebros Runddel', 'Elmegade', 'Ravnsborggade', 'Dronning Louises Bro'],
    from: '06:00',
  },
  {
    id: 'valby',
    severity: 'planned',
    title: 'Sporarbejde mellem Valby og Ny Ellebjerg',
    body: 'Færre tog i weekenden. Brug linje C eller bus 18.',
    stops: { from: 'Valby', to: 'Ny Ellebjerg' },
    from: '31 October',
    to: '2 November',
  },
] as const

/** The open vehicle: S-tog line C to Klampenborg, run by DSB, between Nørreport and Østerport. */
export const VEHICLE = {
  line: 'c',
  lineName: 'C',
  destination: 'Klampenborg',
  mode: 'S-tog · DSB',
  sentence: 'Reported by the vehicle; seen 08:14:05',
  delay: 2,
  lastSeen: '08:14:05',
  nextStop: 'Østerport',
  where: 'Between Nørreport and Østerport',
  nextStopIndex: 3,
  stops: [
    { name: 'København H', time: '08:07', delay: 1 },
    { name: 'Vesterport', time: '08:09', delay: 1 },
    { name: 'Nørreport', time: '08:11', expected: '08:13', delay: 2 },
    { name: 'Østerport', time: '08:14', expected: '08:16', delay: 2 },
    { name: 'Nordhavn', time: '08:16', expected: '08:18', delay: 2 },
    { name: 'Svanemøllen', time: '08:18', expected: '08:20', delay: 2 },
    { name: 'Hellerup', time: '08:21', expected: '08:23', delay: 2 },
    { name: 'Charlottenlund', time: '08:24', expected: '08:26', delay: 2 },
    { name: 'Ordrup', time: '08:26', expected: '08:28', delay: 2 },
    { name: 'Klampenborg', time: '08:29', expected: '08:31', delay: 2 },
  ] satisfies StopTimelineStop[],
} as const

/** Nørreport's lines, as badges under its name. */
export const STOP_LINES = [
  { line: 'm1', name: 'M1' },
  { line: 'm2', name: 'M2' },
  { line: 'a', name: 'A' },
  { line: 'b', name: 'B' },
  { line: 'c', name: 'C' },
  { line: 'e', name: 'E' },
  { line: 'h', name: 'H' },
  { line: 'regional', name: 'Re' },
  { line: 'bus', name: '5C' },
  { line: 'bus', name: '6A' },
  { line: 'bus', name: '150S' },
] as const

type Departure = Pick<
  DepartureRowProps,
  | 'variant'
  | 'line'
  | 'lineName'
  | 'destination'
  | 'countdown'
  | 'time'
  | 'expected'
  | 'delay'
  | 'cancelled'
  | 'platform'
> & { id: string }

/** The Metro's lines from Nørreport run to an interval, worked out from the planned departures. */
export const INTERVALS = [
  { id: 'm2-lufthavnen', line: 'm2', lineName: 'M2', destination: 'Lufthavnen', every: 3 },
  {
    id: 'm1-vanlose',
    line: 'm1',
    lineName: 'M1',
    destination: 'Vanløse',
    every: [3, 4] as const,
  },
] as const

/**
 * Nørreport's departures in the next 30 min, as Rejseplanen's board gave them at 08:14:20: the
 * countdown from that moment, the timetabled time struck where the expected one differs, and each
 * trip's data state.
 */
export const DEPARTURES: readonly Departure[] = [
  {
    id: 'a-hillerod',
    variant: 'live',
    line: 'a',
    lineName: 'A',
    destination: 'Hillerød',
    countdown: 40,
    time: '08:15',
    expected: '08:15',
    delay: 0,
    platform: 'Track 2',
  },
  {
    id: 're-helsingor',
    variant: 'ageing',
    line: 'regional',
    lineName: 'Re',
    destination: 'Helsingør',
    countdown: 280,
    time: '08:18',
    expected: '08:19',
    delay: 1,
    platform: 'Track 4',
  },
  {
    id: '5c-herlev',
    variant: 'live',
    line: 'bus',
    lineName: '5C',
    destination: 'Herlev Hospital',
    countdown: 340,
    time: '08:16',
    expected: '08:20',
    delay: 4,
    platform: 'Platform B',
  },
  {
    id: 'e-koge',
    variant: 'estimated',
    line: 'e',
    lineName: 'E',
    destination: 'Køge',
    countdown: 400,
    time: '08:20',
    expected: '08:21',
    delay: 1,
    platform: 'Track 1',
  },
  {
    id: '6a-buddinge',
    variant: 'timetable-only',
    line: 'bus',
    lineName: '6A',
    destination: 'Buddinge',
    countdown: 460,
    time: '08:22',
    platform: 'Platform D',
  },
  {
    id: '150s-kokkedal',
    variant: 'no-signal',
    line: 'bus',
    lineName: '150S',
    destination: 'Kokkedal',
    countdown: 580,
    time: '08:24',
    platform: 'Platform A',
  },
  {
    id: 'b-hoje-taastrup',
    variant: 'live',
    line: 'b',
    lineName: 'B',
    destination: 'Høje Taastrup',
    countdown: 640,
    time: '08:25',
    cancelled: true,
    platform: 'Track 1',
  },
  {
    id: 'h-frederikssund',
    variant: 'live',
    line: 'h',
    lineName: 'H',
    destination: 'Frederikssund',
    countdown: 760,
    time: '08:27',
    expected: '08:27',
    delay: 0,
    platform: 'Track 1',
  },
]
