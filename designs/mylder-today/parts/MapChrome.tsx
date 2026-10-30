// What every screen of the map has around the map itself: the top bar, and the map's foot with
// the legend, the controls and the scale, and the corner credit. Mylder's TopBar.tsx, MapFoot.tsx,
// MapLegend.tsx, MapTools.tsx and MapCredit.tsx, drawn from one fixed snapshot.
import {
  Attribution,
  FilterChip,
  IconButton,
  LinkButton,
  MapControls,
  Surface,
  VehicleDotLegend,
} from '@mylder/perron'
import { ScaleBar, TopBar } from '@mylder/perron/patterns'
import { useState } from 'react'
import { Icon } from '#kit'
import { MODES, PLANES, UPDATED } from '../screens/data.ts'

/** The bar along the top: the brand, "Updated 08:14:05", a filter per mode and Planes, the tools. */
export function MapTopBar({ size }: { size: 'medium' | 'small' }) {
  return (
    <header className="mylder-today-top">
      <TopBar
        data-layer="Top bar"
        size={size}
        time={UPDATED}
        filters={
          <>
            {MODES.map((mode) => (
              <FilterChip
                key={mode.id}
                data-layer={`${mode.name} filter`}
                defaultSelected
                count={mode.underway}
              >
                {mode.name}
              </FilterChip>
            ))}
            <FilterChip data-layer="Planes filter" defaultSelected count={PLANES}>
              Planes
            </FilterChip>
          </>
        }
        tools={
          <>
            <nav aria-label="Language">
              <LinkButton
                data-layer="Language switch"
                href="#da"
                hrefLang="da"
                lang="da"
                variant="outline"
                size="small"
              >
                Dansk
              </LinkButton>
            </nav>
            <IconButton data-layer="About" label="About Mylder" size="large">
              <Icon name="info" />
            </IconButton>
          </>
        }
      />
    </header>
  )
}

/** The legend, the controls with the scale beside them, and the credit, at the map's foot. */
export function MapFoot() {
  const [paused, setPaused] = useState(false)
  return (
    <div className="mylder-today-foot">
      <Surface variant="glass" className="mylder-today-legend" data-layer="Map legend">
        <VehicleDotLegend aria-label="Data states" aircraftVisible />
      </Surface>
      <div className="mylder-today-tools" data-layer="Map tools">
        <ScaleBar metersPerPixel={4.2} />
        <MapControls
          data-layer="Map controls"
          paused={paused}
          onPausedChange={(_event, next) => setPaused(next)}
        />
      </div>
      <div className="mylder-today-credit" data-layer="Map credit">
        <Attribution>
          Transit data: <a href="https://www.rejseplanen.dk">Rejseplanen</a> (
          <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>) · Aircraft:{' '}
          <a href="https://adsb.lol">©&nbsp;adsb.lol contributors</a> under the{' '}
          <a href="https://opendatacommons.org/licenses/odbl/">ODbL</a> ·{' '}
          <a href="https://www.openstreetmap.org/copyright">©&nbsp;OpenStreetMap contributors</a> ·{' '}
          <a href="https://openmaptiles.org">©&nbsp;OpenMapTiles</a> ·{' '}
          <a href="https://openfreemap.org">OpenFreeMap</a>
        </Attribution>
      </div>
    </div>
  )
}
