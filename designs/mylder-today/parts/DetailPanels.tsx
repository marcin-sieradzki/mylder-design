// The panels a rider opens from the map: a vehicle's detail and a stop's departures. Mylder's
// VehiclePanel.tsx and StopPanel.tsx draw them in Perron's DetailPanel, a Sheet that opens in a
// portal; a design is a still screen, so each is the same panel composed in place from Surface
// and DetailPanel's own parts: DetailHeader, its close button, and the body in one column.
import {
  Button,
  Delay,
  FactList,
  IconButton,
  LineBadge,
  Surface,
  Text,
  VehicleDotLabel,
} from '@mylder/perron'
import { DepartureRow, DetailHeader, SourceLine, StopTimeline } from '@mylder/perron/patterns'
import { useId, useState, type ReactNode } from 'react'
import { Icon } from '#kit'
import { DEPARTURES, INTERVALS, STOP_LINES, UPDATED, VEHICLE } from '../screens/data.ts'

interface PanelProps {
  /** `side` is the desktop's glass panel beside the map; `bottom` the phone's opaque bottom sheet */
  placement: 'side' | 'bottom'
  layer: string
  /** The id of the DetailHeader's title, which names the panel */
  titleId: string
  /** The DetailHeader */
  header: ReactNode
  children: ReactNode
}

/** DetailPanel's frame in place: the header with the close button, and the body under it. */
function Panel({ placement, layer, titleId, header, children }: PanelProps) {
  return (
    <Surface
      variant={placement === 'side' ? 'glass' : 'opaque'}
      render={<section aria-labelledby={titleId} />}
      className="mylder-today-detail"
      data-placement={placement}
      data-layer={layer}
    >
      <div className="mylder-today-detail-head">
        {header}
        <IconButton data-layer="Close panel" label="Close">
          <Icon name="close" />
        </IconButton>
      </div>
      <div className="mylder-today-detail-body">{children}</div>
    </Surface>
  )
}

/** Vehicle detail: S-tog line C to Klampenborg, Live, two minutes late, between two stops. */
export function VehiclePanel() {
  const [following, setFollowing] = useState(false)
  const titleId = useId()
  return (
    <Panel
      placement="side"
      layer="Vehicle panel"
      titleId={titleId}
      header={
        <DetailHeader
          data-layer="Vehicle header"
          variant="line"
          line={VEHICLE.line}
          lineName={VEHICLE.lineName}
          title={`to ${VEHICLE.destination}`}
          subheader={VEHICLE.mode}
          slotProps={{ title: { id: titleId }, action: { className: 'mylder-today-actions' } }}
          action={
            <>
              <Button
                data-layer="Follow"
                variant="outline"
                size="small"
                selected={following}
                onClick={() => setFollowing(!following)}
              >
                Follow
              </Button>
              <Button data-layer="Show whole line" variant="outline" size="small">
                Show whole line
              </Button>
            </>
          }
        />
      }
    >
      <div className="mylder-today-state" data-layer="Data state">
        <VehicleDotLabel variant="live" line={VEHICLE.line} />
        <Text variant="body-sm">{VEHICLE.sentence}</Text>
      </div>
      <FactList
        aria-label="About this trip"
        data-layer="Trip facts"
        items={[
          { label: 'Delay', value: <Delay minutes={VEHICLE.delay} /> },
          { label: 'Last seen', value: VEHICLE.lastSeen },
          { label: 'Next stop', value: VEHICLE.nextStop },
        ]}
      />
      <Text variant="body-sm" data-layer="Where">
        {VEHICLE.where}
      </Text>
      <StopTimeline
        aria-label="Stops"
        data-layer="Next stops"
        line={VEHICLE.line}
        stops={[...VEHICLE.stops]}
        nextStopIndex={VEHICLE.nextStopIndex}
      />
      <SourceLine
        data-layer="Source line"
        sources={[
          { name: 'Rejseplanen', label: 'position {time}', time: UPDATED },
          { label: 'times {time}', time: '08:14:20' },
        ]}
      />
    </Panel>
  )
}

/** Stop departures: Nørreport's next 30 min, across its platforms and every data state. */
export function StopPanel() {
  const titleId = useId()
  return (
    <Panel
      placement="bottom"
      layer="Stop panel"
      titleId={titleId}
      header={
        <DetailHeader
          data-layer="Stop header"
          variant="stop"
          title="Nørreport"
          slotProps={{ title: { id: titleId } }}
          subheader={
            <ul className="mylder-today-lines" aria-label="Lines">
              {STOP_LINES.map(({ line, name }) => (
                <li key={name}>
                  <LineBadge line={line}>{name}</LineBadge>
                </li>
              ))}
            </ul>
          }
        />
      }
    >
      <ul className="mylder-today-departures" aria-label="Departures" data-layer="Departures">
        {INTERVALS.map((row) => (
          <li key={row.id} className="mylder-today-departure">
            <DepartureRow
              variant="timetable-only"
              line={row.line}
              lineName={row.lineName}
              destination={row.destination}
              interval={row.every}
            />
            <p className="mylder-today-interval-note">Metro: planned times</p>
          </li>
        ))}
        {DEPARTURES.map(({ id, ...row }) => (
          <li key={id} className="mylder-today-departure">
            <DepartureRow {...row} />
          </li>
        ))}
      </ul>
      <Text variant="caption" emphasis="secondary" render={<p />}>
        Countdowns use Rejseplanen&apos;s expected times where it has them; the rest use the
        timetable, and say so.
      </Text>
      <SourceLine
        data-layer="Source line"
        sources={[{ name: 'Rejseplanen', label: 'departures {time}', time: '08:14:20' }]}
      />
    </Panel>
  )
}
