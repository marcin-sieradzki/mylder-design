// The replay as a page, for each device: the header, the framed map, the player under it, and City
// pulse at the replay's minute, beside the map on a desktop and below the player on a phone. A
// screen names the minute it opens on; the replay never plays until the rider presses Play.
import { Surface, Text, VehicleDotLegend } from '@mylder/perron'
import { h2 } from '#kit'
import { clock } from '../data.ts'
import { Controls, Jumps, Timeline } from './Player.tsx'
import { AtThisMinute, PulseFigures, ReplaySource } from './Pulse.tsx'
import { ReplayHeader } from './ReplayHeader.tsx'
import { ReplayMap } from './ReplayMap.tsx'
import { useReplay } from './useReplay.ts'

/** City pulse's heading, which says the minute the figures are for. */
function PulseTitle({ time }: { time: number }) {
  return (
    <Text variant="heading-sm" render={h2} data-layer="City pulse title">
      City pulse at {clock(time)}
    </Text>
  )
}

export function DesktopReplay({ opening }: { opening: number }) {
  const replay = useReplay(opening)
  const minute = Math.floor(replay.time)
  return (
    <main className="rush-hour-replay-screen" data-device="desktop">
      <ReplayHeader size="medium" />
      <ReplayMap time={replay.time} zoom={1.05} offset={{ x: 40, y: 20 }} />
      <section className="rush-hour-replay-player" aria-label="Replay" data-layer="Player">
        <Jumps replay={replay} />
        <Timeline replay={replay} />
        <Controls replay={replay} />
        <VehicleDotLegend
          aria-label="Data states"
          className="rush-hour-replay-legend"
          data-layer="Map legend"
        />
      </section>
      <Surface
        variant="raised"
        render={<section aria-label="City pulse" />}
        className="rush-hour-replay-panel"
        data-layer="City pulse"
      >
        <PulseTitle time={replay.time} />
        <AtThisMinute minute={minute} />
        <PulseFigures minute={minute} states="key" />
        <ReplaySource />
      </Surface>
    </main>
  )
}

export function PhoneReplay({ opening }: { opening: number }) {
  const replay = useReplay(opening)
  const minute = Math.floor(replay.time)
  return (
    <main className="rush-hour-replay-screen" data-device="phone">
      <ReplayHeader size="small" />
      <ReplayMap time={replay.time} zoom={0.8} offset={{ x: 60, y: 40 }} />
      <section className="rush-hour-replay-player" aria-label="Replay" data-layer="Player">
        <Controls replay={replay} size="small" />
        <Timeline replay={replay} />
        <Jumps replay={replay} />
      </section>
      <section className="rush-hour-replay-panel" aria-label="City pulse" data-layer="City pulse">
        <PulseTitle time={replay.time} />
        <AtThisMinute minute={minute} />
        <PulseFigures minute={minute} states="strip" />
        <ReplaySource />
      </section>
    </main>
  )
}
