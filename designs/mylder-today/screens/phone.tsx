// Phone: the small top bar, the map, and the city sheet as a bottom sheet at its peek, with the
// legend, the controls and the credit standing on it.
import { CityMap } from '#kit'
import { CitySheet } from '../parts/CitySheet.tsx'
import { MapFoot, MapTopBar } from '../parts/MapChrome.tsx'
import './screens.css'

export default function Phone() {
  return (
    <main className="mylder-today-screen" data-device="phone">
      <CityMap />
      <div className="mylder-today-veil" />
      <MapTopBar size="small" />
      <MapFoot />
      <CitySheet placement="peek" />
    </main>
  )
}
