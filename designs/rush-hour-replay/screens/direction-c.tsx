// Direction C, the morning first: the timeline leads, tall, as a chart of the whole morning to
// scrub along, with a small map of the moment beside the clock and the figures under it.
import { Text } from '@mylder/perron'
import { h2 } from '#kit'
import { BUSIEST } from '../data.ts'
import { Controls, Jumps, Timeline } from '../parts/Player.tsx'
import { PulseFigures } from '../parts/Pulse.tsx'
import { ReplayHeader } from '../parts/ReplayHeader.tsx'
import { ReplayMap } from '../parts/ReplayMap.tsx'
import { useReplay } from '../parts/useReplay.ts'
import './screens.css'

export default function DirectionC() {
  const replay = useReplay(BUSIEST.minute)
  return (
    <main className="rush-hour-replay-screen" data-device="phone" data-direction="c">
      <ReplayHeader size="small" />
      <section className="rush-hour-replay-player" aria-label="Replay">
        <Text variant="heading-sm" render={h2}>
          Vehicles in service, 06:00 to 10:00
        </Text>
        <Timeline replay={replay} />
        <Controls replay={replay} size="small" />
        <Jumps replay={replay} />
      </section>
      <ReplayMap time={replay.time} zoom={0.42} offset={{ x: 80, y: 20 }} />
      <section className="rush-hour-replay-panel" aria-label="City pulse">
        <PulseFigures minute={Math.floor(replay.time)} states="strip" />
      </section>
    </main>
  )
}
