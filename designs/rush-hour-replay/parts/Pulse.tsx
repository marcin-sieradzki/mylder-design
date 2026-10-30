// City pulse as it stood at the replay's minute: vehicles in service, the share reporting live, the
// average delay and "How sure are we?", the same figures and words as the live City pulse, each
// following the replay's clock. Also what was going on at that minute: Rejseplanen's disruption in
// its own Danish, Mylder's data card, or nothing.
import { NormalService, Section, Stat, Text } from '@mylder/perron'
import { DataStateKey, DisruptionCard, ReportStrip } from '@mylder/perron/patterns'
import { memo, useId, type ReactNode } from 'react'
import {
  BUSIEST,
  clock,
  delay,
  grouped,
  MOVIA_GAP,
  pulseAt,
  SIGNAL_FAULT,
  STATE_SENTENCES,
  THRESHOLDS,
} from '../data.ts'

/** A key figure and the line under it that says what it counts. */
function Figure({ label, value, children }: { label: string; value: string; children: ReactNode }) {
  return (
    <div className="rush-hour-replay-figure" data-layer={label}>
      <Stat label={label}>{value}</Stat>
      <Text variant="body-sm" emphasis="secondary" render={<p />}>
        {children}
      </Text>
    </div>
  )
}

/**
 * The figures at one whole minute. Memoised on the minute, so playing redraws them once a replay
 * minute rather than every frame.
 */
export const PulseFigures = memo(function PulseFigures({
  minute,
  states,
}: {
  minute: number
  /** `key` lists the states with their sentences; `strip` counts them in one row */
  states: 'key' | 'strip'
}) {
  const pulse = pulseAt(minute)
  const sureId = useId()
  return (
    <div className="rush-hour-replay-pulse">
      <div className="rush-hour-replay-figures">
        <Figure label="Vehicles in service" value={grouped(pulse.inService)}>
          {minute === BUSIEST.minute
            ? 'The busiest minute of the morning'
            : `Busiest ${grouped(BUSIEST.inService)} at ${clock(BUSIEST.minute)}`}
        </Figure>
        <Figure label="Reporting live" value={`${pulse.reportingLive} %`}>
          Live, of the vehicles in service
        </Figure>
        <Figure label="Average delay" value={delay(pulse.averageDelay)}>
          Vehicles with a known delay, Metro left out
        </Figure>
      </div>
      <Section
        title="How sure are we?"
        slotProps={{ title: { id: sureId } }}
        data-layer="How sure are we?"
      >
        {states === 'key' ? (
          <DataStateKey
            aria-labelledby={sureId}
            counts={pulse.states}
            liveThreshold={THRESHOLDS.live}
            ageingThreshold={THRESHOLDS.ageing}
            liveDescriptionLabel={STATE_SENTENCES.live}
            ageingDescriptionLabel={STATE_SENTENCES.ageing}
            estimatedDescriptionLabel={STATE_SENTENCES.estimated}
            timetableOnlyDescriptionLabel={STATE_SENTENCES.timetableOnly}
            noSignalDescriptionLabel={STATE_SENTENCES.noSignal}
          />
        ) : (
          <ReportStrip aria-labelledby={sureId} counts={pulse.states} />
        )}
      </Section>
    </div>
  )
})

/** What was going on at one whole minute: the disruption and the data card active then. */
export const AtThisMinute = memo(function AtThisMinute({ minute }: { minute: number }) {
  const fault = minute >= SIGNAL_FAULT.from && minute < SIGNAL_FAULT.to
  const gap = minute >= MOVIA_GAP.from && minute < MOVIA_GAP.to
  return (
    <div className="rush-hour-replay-events" data-layer="At this minute">
      {gap ? (
        <DisruptionCard
          severity={MOVIA_GAP.severity}
          title={MOVIA_GAP.title}
          time={{ from: clock(MOVIA_GAP.from), to: clock(MOVIA_GAP.to) }}
        >
          {MOVIA_GAP.body}
        </DisruptionCard>
      ) : null}
      {fault ? (
        <>
          <DisruptionCard
            severity={SIGNAL_FAULT.severity}
            lines={SIGNAL_FAULT.lines}
            title={SIGNAL_FAULT.title}
            stops={SIGNAL_FAULT.stops}
            time={{ from: clock(SIGNAL_FAULT.from), to: clock(SIGNAL_FAULT.to) }}
            slotProps={{ title: { lang: 'da' }, description: { lang: 'da' } }}
          >
            {SIGNAL_FAULT.body}
          </DisruptionCard>
          <Text variant="caption" emphasis="secondary" render={<p />}>
            From Rejseplanen, in Danish
          </Text>
        </>
      ) : null}
      {!fault && !gap ? (
        <NormalService runningNormallyLabel={`Running normally at ${clock(minute)}`} />
      ) : null}
    </div>
  )
})

/** The replay's own words on where it came from, under its figures. */
export function ReplaySource() {
  return (
    <Text variant="caption" emphasis="secondary" render={<p />} data-layer="Replay source">
      Recorded by Mylder from Rejseplanen&apos;s positions, one answer a minute. A replay never
      changes: it shows what the map knew then, not what is known now.
    </Text>
  )
}
