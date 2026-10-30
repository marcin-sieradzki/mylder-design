// The replay's own header in place of the live map's top bar: no "Updated" time and no mode
// filters with their counts, but the word Replay, the morning it shows, and the way back to the
// live map.
import { Brand, IconButton, LinkButton, Tag, Text } from '@mylder/perron'
import { h1, Icon } from '#kit'
import { DAY } from '../data.ts'

export function ReplayHeader({ size }: { size: 'medium' | 'small' }) {
  return (
    <header className="rush-hour-replay-head" data-layer="Replay header">
      <Brand variant="mark" className="rush-hour-replay-brand" />
      <div className="rush-hour-replay-title">
        <Tag data-layer="Replay tag">Replay</Tag>
        <Text variant={size === 'medium' ? 'heading-md' : 'heading-sm'} render={h1}>
          This morning&apos;s rush hour
        </Text>
        <Text variant="body-sm" emphasis="secondary" render={<p />} data-layer="Replay day">
          <time dateTime={DAY.dateTime}>{DAY.label}</time>, 06:00 to 10:00, as Mylder recorded it
        </Text>
      </div>
      {size === 'medium' ? (
        <LinkButton href="#live" variant="outline" size="small" data-layer="Back to live map">
          Back to the live map
        </LinkButton>
      ) : (
        <IconButton label="Back to the live map" data-layer="Back to live map">
          <Icon name="close" />
        </IconButton>
      )}
    </header>
  )
}
