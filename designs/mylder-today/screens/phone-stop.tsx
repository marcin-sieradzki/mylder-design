// Phone, a stop open: Nørreport's departures in a bottom sheet over the map, covering the city
// sheet's peek: a row in each data state, the Metro's intervals, a late bus and a cancelled train.
import { CityMap } from '#kit'
import { StopPanel } from '../parts/DetailPanels.tsx'
import { MapTopBar } from '../parts/MapChrome.tsx'
import './screens.css'

export default function PhoneStop() {
  return (
    <main className="mylder-today-screen" data-device="phone" data-panel="open">
      <CityMap />
      <div className="mylder-today-veil" />
      <MapTopBar size="small" />
      <StopPanel />
    </main>
  )
}
