// Copenhagen as Mylder draws it, for a design's backdrop: water, parks, streets, the metro and
// S-tog lines, the stations, and vehicles gliding along their lines, each dot in the shape of its
// data state. Ported from the Perron docs website's background map (MIT, the Perron authors).
// Colours and sizes come from Perron's tokens, so it follows the theme. Under
// prefers-reduced-motion, or with motion off, each vehicle stands at its last report.
import { numeric } from '@mylder/perron/tokens.ts'
import { useId, type CSSProperties, type ReactNode } from 'react'
import {
  MOVING,
  PARKS,
  PULSE_GROWTH,
  PULSE_STROKE,
  REPORTS_PER_RUN,
  ROUTES,
  SHUTTLE_PAUSE,
  SIZE,
  STATION_RADIUS,
  STATIONS,
  STILL,
  STREET_WIDTH,
  WAIT,
  WATER,
  type DataState,
  type Mode,
  type MovingVehicle,
  type Route,
} from './map-data.ts'
import { pointAt, reportKeys, runKeys, stationShares, svgList, type Keys } from './motion.ts'
import './city-map.css'

export interface CityMapProps {
  /** Zoom about the drawing's middle, as a factor; 1 shows the inner city at its token sizes */
  zoom?: number
  /** Shift the drawing, in its own units, to bring a part of the city to the middle */
  offset?: { x: number; y: number }
  /** Let the vehicles glide; off, each stands at its last report. On by default */
  motion?: boolean
  /** Fade the drawing behind panels: `none` (default), `soft` or `strong` */
  veil?: 'none' | 'soft' | 'strong'
  /**
   * The vehicles to draw in place of the map's own gliding ones, each where the screen puts it, for
   * a screen that sets every vehicle's place and state itself, such as a replay
   */
  vehicles?: readonly CityMapVehicle[]
  /** Extra drawing in the map's own units (1440 × 1240), above the lines and under the vehicles */
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

/** A vehicle a screen places itself, as CityMap's `vehicles` takes it. */
export interface CityMapVehicle {
  /** The route it runs on, one of CITY_MAP_ROUTES' ids */
  route: string
  state: DataState
  /** Where it is, as a share of its route's length from the start */
  at: number
}

const routeById = new Map(ROUTES.map((r) => [r.id, r]))

function routeOf(id: string): Route {
  const route = routeById.get(id)
  if (!route) throw new Error(`map-data.ts: no route ${id}`)
  return route
}

const token = (name: keyof typeof numeric) => numeric[name]

/** The route's colour as a custom property each dot and ring reads. */
const lineColor = (route: Route) =>
  ({
    '--map-line': `var(--perron-color-transit-${route.color.replaceAll('.', '-')})`,
  }) as CSSProperties

/** The radius of each data state's shape, from the vehicle-dot tokens. */
function size(mode: Mode, state: DataState) {
  const radius: Record<Mode, number> = {
    metro: token('map.dot-radius.metro'),
    stog: token('map.dot-radius.stog'),
    regional: token('map.dot-radius.regional'),
    bus: token('map.dot-radius.bus'),
  }
  // a ring or rim is pulled in by its inset, so every shape keeps the dot's outer size
  const inset: Record<DataState, number> = {
    live: 0,
    'no-signal': 0,
    ageing: token('vehicle-dot.ageing.stroke-inset'),
    estimated: token('vehicle-dot.estimated.stroke-inset'),
    timetable: token('vehicle-dot.timetable.stroke-inset'),
  }
  return radius[mode] - inset[state]
}

function Dot({ r, state }: { r: number; state: DataState }) {
  return <circle className={`city-map-dot city-map-dot-${state}`} r={r} />
}

/** A moving vehicle's keys along its route, with its waits at stations. */
function keysOf(v: MovingVehicle, route: Route): Keys {
  const stops = v.run.kind === 'through' ? stationShares(route.d, v.run.waitsAt, STATIONS) : []
  return runKeys(v.run, { reverse: v.reverse, stops, wait: WAIT, pause: SHUTTLE_PAUSE })
}

/** The map's drawing, filling its positioned container. Decoration: it is hidden from readers. */
export function CityMap({
  zoom = 1,
  offset = { x: 0, y: 0 },
  motion = true,
  veil = 'none',
  vehicles,
  children,
  className,
  style,
}: CityMapProps) {
  const prefix = useId().replaceAll(':', '')
  const pulse = token('duration.report-pulse')
  const pathId = (route: Route) => `${prefix}-${route.id}`
  const streets = ROUTES.filter((r) => r.mode === 'bus')
  const lines = ROUTES.filter((r) => r.mode !== 'bus')
  const moving = MOVING.map((v) => {
    const route = routeOf(v.route)
    return { v, route, keys: keysOf(v, route), r: size(route.mode, v.state) }
  })
  const frame = {
    ...style,
    '--city-map-zoom': zoom,
    '--city-map-x': `${-offset.x}px`,
    '--city-map-y': `${-offset.y}px`,
  } as CSSProperties

  return (
    <div
      className={['city-map', className].filter(Boolean).join(' ')}
      data-motion={motion ? 'on' : 'off'}
      data-veil={veil}
      style={frame}
      aria-hidden="true"
    >
      <svg
        className="city-map-drawing"
        width={SIZE.width}
        height={SIZE.height}
        viewBox={`0 0 ${SIZE.width} ${SIZE.height}`}
        focusable="false"
      >
        <rect className="city-map-land" width={SIZE.width} height={SIZE.height} />
        <g className="city-map-water">
          <path d={WATER.sea} />
          <path
            className="city-map-harbour"
            d={WATER.harbour.d}
            strokeWidth={WATER.harbour.width}
          />
          {WATER.lakes.map((l) => (
            <ellipse
              key={`${l.cx},${l.cy}`}
              cx={l.cx}
              cy={l.cy}
              rx={l.rx}
              ry={l.ry}
              transform={`rotate(${l.rotate} ${l.cx} ${l.cy})`}
            />
          ))}
        </g>
        <g className="city-map-parks">
          {PARKS.map((p) => (
            <ellipse key={`${p.cx},${p.cy}`} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} />
          ))}
        </g>
        <g className="city-map-streets" strokeWidth={STREET_WIDTH}>
          {streets.map((r) => (
            <path key={r.id} id={pathId(r)} d={r.d} />
          ))}
        </g>
        <g className="city-map-lines">
          {lines.map((r) => (
            <path
              key={r.id}
              id={pathId(r)}
              className={`city-map-line city-map-line-${r.mode}`}
              style={lineColor(r)}
              d={r.d}
            />
          ))}
        </g>
        <g className="city-map-stations">
          {Object.entries(STATIONS).map(([id, s]) => (
            <circle key={id} cx={s.x} cy={s.y} r={STATION_RADIUS} />
          ))}
        </g>

        {children}

        {vehicles ? (
          <g className="city-map-placed">
            {vehicles.map((v, i) => {
              const route = routeOf(v.route)
              const at = pointAt(route.d, v.at)
              return (
                <g key={i} style={lineColor(route)} transform={`translate(${at.x} ${at.y})`}>
                  <Dot r={size(route.mode, v.state)} state={v.state} />
                </g>
              )
            })}
          </g>
        ) : (
          <OwnVehicles moving={moving} pulse={pulse} pathId={pathId} />
        )}
      </svg>
      <div className="city-map-veil" />
    </div>
  )
}

type Placed = { v: MovingVehicle; route: Route; keys: Keys; r: number }

/** The map's own vehicles: gliding along their routes, or each at its last report. */
function OwnVehicles({
  moving,
  pulse,
  pathId,
}: {
  moving: Placed[]
  pulse: number
  pathId: (route: Route) => string
}) {
  return (
    <>
      <g className="city-map-moving">
        {moving.map(({ v, route, keys, r }, i) => {
          const every = v.duration / REPORTS_PER_RUN
          const share = svgList([pulse / (every * 1000)])
          return (
            <g key={i} style={lineColor(route)}>
              <animateMotion
                dur={`${v.duration}s`}
                begin={`${v.offset}s`}
                repeatCount="indefinite"
                calcMode="linear"
                keyTimes={svgList(keys.times)}
                keyPoints={svgList(keys.points)}
              >
                <mpath href={`#${pathId(route)}`} />
              </animateMotion>
              {v.pulses ? (
                <circle className="city-map-pulse" r={r} strokeWidth={PULSE_STROKE}>
                  <animate
                    attributeName="r"
                    values={`${r};${r * PULSE_GROWTH};${r * PULSE_GROWTH}`}
                    keyTimes={`0;${share};1`}
                    dur={`${every}s`}
                    begin={`${v.offset}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="1;0;0"
                    keyTimes={`0;${share};1`}
                    dur={`${every}s`}
                    begin={`${v.offset}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ) : null}
              <Dot r={r} state={v.state} />
            </g>
          )
        })}
      </g>

      <g className="city-map-still">
        {moving.map(({ v, route, keys, r }, i) => {
          const reports = reportKeys(keys, REPORTS_PER_RUN)
          const at = pointAt(route.d, reports.points[0] ?? 0)
          return (
            <g key={i} style={lineColor(route)} transform={`translate(${at.x} ${at.y})`}>
              <Dot r={r} state={v.state} />
            </g>
          )
        })}
      </g>

      {STILL.map((v, i) => {
        const route = routeOf(v.route)
        const at = pointAt(route.d, v.at)
        return (
          <g key={i} style={lineColor(route)} transform={`translate(${at.x} ${at.y})`}>
            <Dot r={size(route.mode, v.state)} state={v.state} />
          </g>
        )
      })}
    </>
  )
}

export { SIZE as CITY_MAP_SIZE, STATIONS as CITY_MAP_STATIONS, ROUTES as CITY_MAP_ROUTES, pointAt }
