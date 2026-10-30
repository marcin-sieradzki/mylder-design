// The map as a recording: Copenhagen with every vehicle where it was at the replay's minute, in the
// data state it had then, framed like a picture rather than filling the window as the live map
// does, and stamped "Replay" with the replay's clock in its corner, so even a cropped screenshot
// can't pass for live.
import { Surface, Tag, Text } from '@mylder/perron'
import { useMemo } from 'react'
import { CityMap } from '#kit'
import { clock, DAY, vehiclesAt } from '../data.ts'

export function ReplayMap({
  time,
  zoom = 1,
  offset,
  framed = true,
}: {
  time: number
  zoom?: number
  offset?: { x: number; y: number }
  /** Inset with a rounded edge, as the kept direction draws it; off, it fills its box */
  framed?: boolean
}) {
  // a dot moves at most a few units a frame, so its place is worth working out once per frame only
  const vehicles = useMemo(() => vehiclesAt(time), [time])
  return (
    <div
      className="rush-hour-replay-map"
      data-framed={framed ? 'true' : 'false'}
      data-layer="Replay map"
    >
      <CityMap vehicles={vehicles} zoom={zoom} offset={offset} />
      <Surface variant="glass" className="rush-hour-replay-stamp" data-layer="Replay stamp">
        <Tag>Replay</Tag>
        <Text variant="data" render={<time dateTime={`${DAY.dateTime}T${clock(time)}`} />}>
          {clock(time)}
        </Text>
      </Surface>
    </div>
  )
}
