// The player under the map: play and pause, the replay's clock, the speed, and the timeline, which
// is Perron's Slider laid over the morning's profile of vehicles in service, with the disruption,
// the data gap and the busiest minute marked on it and a button to jump to each. Perron has no
// timeline or scrubber, so this composes one from Slider, Button, SegmentedControl and Text.
import { Button, Segment, SegmentedControl, Slider, Text } from '@mylder/perron'
import type { CSSProperties } from 'react'
import { Icon, type IconName } from '#kit'
import {
  BUSIEST,
  clock,
  DAY,
  END,
  MOMENTS,
  MORNING,
  SPEEDS,
  START,
  type Moment,
  type Speed,
} from '../data.ts'
import type { Replay } from './useReplay.ts'

const SPAN = END - START
const HEIGHT = 40

/** The share of the timeline's width a minute sits at, as a CSS percentage. */
const across = (minute: number) => `${((minute - START) / SPAN) * 100}%`

/** The morning's profile as an area, in a box SPAN wide and HEIGHT tall. */
const PROFILE = (() => {
  const counts = MORNING.map((p) => p.inService)
  const low = Math.min(...counts)
  const high = Math.max(...counts)
  const y = (count: number) => HEIGHT - 2 - ((count - low) / (high - low)) * (HEIGHT - 8)
  const line = MORNING.map((p, i) => `${i === 0 ? 'M' : 'L'}${i} ${y(p.inService).toFixed(1)}`)
  return `${line.join(' ')} L${SPAN} ${HEIGHT} L0 ${HEIGHT} Z`
})()

const HOURS = [6, 7, 8, 9, 10].map((h) => h * 60)

const ICONS: Record<Moment['id'], IconName> = {
  'signal-fault': 'warning',
  'movia-gap': 'signal-off',
  busiest: 'arrow-down',
}

/** The morning's profile, the stretches and the busiest minute, drawn behind the slider. */
function Profile({ time }: { time: number }) {
  const played = { '--rush-hour-replay-played': across(time) } as CSSProperties
  return (
    <div className="rush-hour-replay-profile" aria-hidden="true" style={played}>
      <svg viewBox={`0 0 ${SPAN} ${HEIGHT}`} preserveAspectRatio="none" focusable="false">
        {MOMENTS.filter((m) => m.until !== undefined).map((m) => (
          <rect
            key={m.id}
            className="rush-hour-replay-stretch"
            data-moment={m.id}
            x={m.at - START}
            width={(m.until ?? m.at) - m.at}
            y={0}
            height={HEIGHT}
          />
        ))}
        <path className="rush-hour-replay-area" d={PROFILE} />
        <line
          className="rush-hour-replay-busiest"
          x1={BUSIEST.minute - START}
          x2={BUSIEST.minute - START}
          y1={0}
          y2={HEIGHT}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* the part already played, the same area again in a stronger fill, cut at the replay's time */}
      <svg
        className="rush-hour-replay-played"
        viewBox={`0 0 ${SPAN} ${HEIGHT}`}
        preserveAspectRatio="none"
        focusable="false"
      >
        <path d={PROFILE} />
      </svg>
      {MOMENTS.map((m) => (
        <span
          key={m.id}
          className="rush-hour-replay-flag"
          data-moment={m.id}
          style={{ insetInlineStart: across(m.at) }}
        >
          <Icon name={ICONS[m.id]} />
        </span>
      ))}
    </div>
  )
}

/** The timeline: the profile, the slider over it, and the hours under it. */
export function Timeline({ replay }: { replay: Replay }) {
  return (
    <div className="rush-hour-replay-timeline" data-layer="Timeline">
      <Profile time={replay.time} />
      <Slider
        label="Time in the replay"
        hiddenLabel
        min={START}
        max={END}
        step={1}
        value={replay.time}
        onChange={(_event, value) => replay.seek(typeof value === 'number' ? value : value[0])}
        className="rush-hour-replay-slider"
        slotProps={{
          thumb: { getAriaValueText: (_formatted, value) => clock(value) },
          value: { className: 'rush-hour-replay-slider-figure' },
        }}
      />
      <div className="rush-hour-replay-hours" aria-hidden="true">
        {HOURS.map((h) => (
          <span key={h} style={{ insetInlineStart: across(h) }}>
            {clock(h)}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Play or pause, the clock and the speed, in one row. */
export function Controls({
  replay,
  size = 'medium',
}: {
  replay: Replay
  size?: 'medium' | 'small'
}) {
  return (
    <div className="rush-hour-replay-controls" data-layer="Replay controls">
      <Button
        color="brand"
        size={size}
        startIcon={<Icon name={replay.playing ? 'pause' : 'play'} />}
        onClick={replay.toggle}
        data-layer="Play"
      >
        {replay.playing ? 'Pause' : 'Play'}
      </Button>
      <div className="rush-hour-replay-clock" data-layer="Replay clock">
        <Text
          variant={size === 'medium' ? 'data-xl' : 'data-lg'}
          render={<time dateTime={`${DAY.dateTime}T${clock(replay.time, true)}`} />}
        >
          {clock(replay.time)}
        </Text>
        <Text variant="caption" emphasis="secondary" render={<p />}>
          of 06:00 to 10:00
        </Text>
      </div>
      <SegmentedControl
        aria-label="Speed"
        value={replay.speed}
        onChange={(_event, value) => replay.setSpeed(value as Speed)}
        className="rush-hour-replay-speed"
        data-layer="Speed"
      >
        {SPEEDS.map((s) => (
          <Segment key={s} value={s}>
            {s}×
          </Segment>
        ))}
      </SegmentedControl>
    </div>
  )
}

/** A button per marked moment, each landing the replay on it. */
export function Jumps({ replay }: { replay: Replay }) {
  return (
    <div className="rush-hour-replay-jumps" data-layer="Jump to">
      {MOMENTS.map((m) => (
        <Button
          key={m.id}
          variant="outline"
          size="small"
          startIcon={<Icon name={ICONS[m.id]} />}
          onClick={() => replay.seek(m.at)}
          data-moment={m.id}
        >
          {m.name} <time>{clock(m.at)}</time>
        </Button>
      ))}
    </div>
  )
}
