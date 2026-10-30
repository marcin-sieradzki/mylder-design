// The city sheet beside the map: City pulse, the Vehicles list and Disruptions as tabs. Mylder's
// CitySheet.tsx, CityPulse.tsx, DayProfile.tsx, VehicleList.tsx and DisruptionList.tsx. Mylder
// draws it in Perron's Sheet, which opens in a portal; a design is a still screen, so this is the
// same panel composed in place, on glass beside the map or as a bottom sheet at its peek.
import {
  Button,
  IconButton,
  Meter,
  Section,
  Stat,
  Surface,
  Tab,
  Tabs,
  TabsList,
  TabsPanel,
  Text,
} from '@mylder/perron'
import {
  DataStateKey,
  DayProfileChart,
  DisruptionCard,
  ReportStrip,
  SourceLine,
  VehicleTable,
} from '@mylder/perron/patterns'
import { useId, type ReactNode } from 'react'
import { h2, Icon } from '#kit'
import {
  DAY_PROFILE,
  DISRUPTIONS,
  METERS,
  PEAK,
  PULSE,
  STATE_SENTENCES,
  STATES,
  THRESHOLDS,
  UPDATED,
  VEHICLES,
  grouped,
  meterColor,
} from '../screens/data.ts'

/**
 * The sheet. `side` is the desktop's glass panel beside the map; `peek` the phone's bottom sheet,
 * opaque as Perron's bottom sheets are, standing at its peek.
 */
export function CitySheet({ placement }: { placement: 'side' | 'peek' }) {
  const titleId = useId()
  return (
    <Surface
      variant={placement === 'side' ? 'glass' : 'opaque'}
      render={<section aria-labelledby={titleId} />}
      className="mylder-today-sheet"
      data-placement={placement}
      data-layer="City sheet"
    >
      <div className="mylder-today-sheet-head">
        <Text id={titleId} variant="heading-md" render={h2} data-layer="Sheet title">
          Overview
        </Text>
        <IconButton data-layer="Close sheet" label="Close">
          <Icon name="close" />
        </IconButton>
      </div>
      <Tabs defaultValue="pulse" className="mylder-today-tabs">
        <TabsList aria-label="Overview" data-layer="Sheet tabs">
          <Tab value="pulse">City pulse</Tab>
          <Tab value="vehicles" count={PULSE.inService}>
            Vehicles
          </Tab>
          <Tab value="disruptions" count={DISRUPTIONS.length}>
            Disruptions
          </Tab>
        </TabsList>
        <TabsPanel value="pulse" className="mylder-today-tab-panel">
          <CityPulse />
        </TabsPanel>
        <TabsPanel value="vehicles" className="mylder-today-tab-panel">
          <VehicleList />
        </TabsPanel>
        <TabsPanel value="disruptions" className="mylder-today-tab-panel">
          <DisruptionList />
        </TabsPanel>
      </Tabs>
    </Surface>
  )
}

/** A key figure and the line under it: what it counts, or why it is "—". */
function Figure({ label, value, children }: { label: string; value: string; children: ReactNode }) {
  return (
    <div className="mylder-today-figure" data-layer={label}>
      <Stat label={label}>{value}</Stat>
      <Text variant="body-sm" emphasis="secondary" render={<p />}>
        {children}
      </Text>
    </div>
  )
}

/** City pulse: the key figures, the states now, a meter per mode, the day and how sure we are. */
function CityPulse() {
  const sureId = useId()
  return (
    <div className="mylder-today-pulse">
      <div className="mylder-today-figures">
        <Figure label="On the move" value={grouped(PULSE.moving)}>
          of {grouped(PULSE.inService)} in service
        </Figure>
        <Figure label="Reported this minute" value={grouped(PULSE.reported)}>
          vehicles that reported their position
        </Figure>
        <Figure label="Average delay" value={PULSE.averageDelay}>
          min, vehicles with a known delay, Metro left out
        </Figure>
      </div>
      <SourceLine
        sources={[
          { name: 'Rejseplanen', label: 'positions {time}', time: UPDATED.slice(0, 5) },
          { label: 'timetable of {time}', time: '12 October', dateTime: '2026-10-12' },
        ]}
      />
      <ReportStrip aria-label="On the map now" counts={STATES} data-layer="On the map now" />
      <Section title="Reporting live, by mode" data-layer="Reporting live, by mode">
        <div className="mylder-today-meters">
          {METERS.map(({ mode, share, line }) => (
            <div key={mode} className="mylder-today-meter">
              <Meter
                label={mode}
                value={share ? (share.count / share.total) * 100 : null}
                color={share ? meterColor(share) : 'neutral'}
              />
              <Text variant="caption" emphasis="secondary" render={<p />}>
                {share ? `${grouped(share.count)}/${grouped(share.total)} · ${line}` : line}
              </Text>
            </div>
          ))}
        </div>
      </Section>
      <div className="mylder-today-profile" data-layer="Vehicles in service today">
        <DayProfileChart
          points={DAY_PROFILE}
          label={
            <>
              Vehicles in service today{' '}
              <span className="mylder-today-planned">Planned, from today&apos;s timetable</span>
            </>
          }
        />
        <Text variant="body-sm" emphasis="secondary" render={<p />}>
          Peak {grouped(PEAK.count ?? 0)} at {PEAK.time}
        </Text>
      </div>
      <Section
        title="How sure are we?"
        slotProps={{ title: { id: sureId } }}
        data-layer="How sure are we?"
      >
        <DataStateKey
          aria-labelledby={sureId}
          counts={STATES}
          liveThreshold={THRESHOLDS.live}
          ageingThreshold={THRESHOLDS.ageing}
          liveDescriptionLabel={STATE_SENTENCES.live}
          ageingDescriptionLabel={STATE_SENTENCES.ageing}
          estimatedDescriptionLabel={STATE_SENTENCES.estimated}
          timetableOnlyDescriptionLabel={STATE_SENTENCES.timetableOnly}
          noSignalDescriptionLabel={STATE_SENTENCES.noSignal}
        />
      </Section>
    </div>
  )
}

/** The Vehicles list: every trip on the map as a row, the map's text alternative. */
function VehicleList() {
  return (
    <div className="mylder-today-list">
      <SourceLine sources={[{ name: 'Rejseplanen', label: 'positions {time}', time: '08:14' }]} />
      <VehicleTable
        data-layer="Vehicles table"
        vehicles={VEHICLES}
        sort={{ column: 'line', direction: 'asc' }}
      />
    </div>
  )
}

/** Disruptions: Rejseplanen's messages active now, in Danish as it wrote them. */
function DisruptionList() {
  return (
    <div className="mylder-today-list">
      <Text variant="caption" emphasis="secondary" render={<p />}>
        From Rejseplanen, in Danish
      </Text>
      {DISRUPTIONS.map((message) => (
        <DisruptionCard
          key={message.id}
          severity={message.severity}
          slotProps={{ title: { lang: 'da' }, description: { lang: 'da' } }}
          title={message.title}
          stops={message.stops}
          time={'to' in message ? { from: message.from, to: message.to } : { from: message.from }}
          action={
            <Button variant="outline" size="small">
              Show on map
            </Button>
          }
        >
          {message.body}
        </DisruptionCard>
      ))}
      <Text variant="caption" emphasis="secondary" render={<p />}>
        Messages from Rejseplanen, checked 08:10. Checked every 15 min while the map is open.
      </Text>
    </div>
  )
}
