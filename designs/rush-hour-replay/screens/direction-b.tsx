// Direction B, over the map: the map fills the screen as the live map does, softly veiled, with the
// replay's header and a glass dock of the player and the key figures floating over it.
import { Surface, Tag, Text } from '@mylder/perron'
import { useMemo } from 'react'
import { CityMap, h1 } from '#kit'
import { BUSIEST, clock, delay, grouped, pulseAt, vehiclesAt } from '../data.ts'
import { Controls, Timeline } from '../parts/Player.tsx'
import { useReplay } from '../parts/useReplay.ts'
import './screens.css'

export default function DirectionB() {
  const replay = useReplay(BUSIEST.minute)
  const vehicles = useMemo(() => vehiclesAt(replay.time), [replay.time])
  const pulse = pulseAt(replay.time)
  return (
    <main className="rush-hour-replay-screen" data-device="phone" data-direction="b">
      <CityMap vehicles={vehicles} zoom={0.62} offset={{ x: 80, y: 40 }} veil="soft" />
      <Surface variant="glass" className="rush-hour-replay-float-head" data-layer="Replay header">
        <Tag>Replay</Tag>
        <Text variant="heading-sm" render={h1}>
          This morning&apos;s rush hour
        </Text>
      </Surface>
      <Surface variant="glass" className="rush-hour-replay-dock" data-layer="Replay dock">
        <div className="rush-hour-replay-strip" data-layer="Key figures">
          <Text variant="data" render={<p />}>
            {grouped(pulse.inService)} in service
          </Text>
          <Text variant="data" render={<p />}>
            {pulse.reportingLive} % live
          </Text>
          <Text variant="data" render={<p />}>
            {delay(pulse.averageDelay)}
          </Text>
        </div>
        <Controls replay={replay} size="small" />
        <Timeline replay={replay} />
        <Text variant="caption" emphasis="secondary" render={<p />}>
          Busiest minute {clock(BUSIEST.minute)}
        </Text>
      </Surface>
    </main>
  )
}
