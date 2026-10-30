// Desktop: the map fills the window, with the top bar over it, the city sheet beside it on City
// pulse, and the legend, the controls and the credit at its foot.
import { CityMap } from '#kit'
import { CitySheet } from '../parts/CitySheet.tsx'
import { MapFoot, MapTopBar } from '../parts/MapChrome.tsx'
import './screens.css'

export default function Desktop() {
  return (
    <main className="mylder-today-screen" data-device="desktop">
      <CityMap />
      <div className="mylder-today-veil" />
      <MapTopBar size="medium" />
      <CitySheet placement="side" />
      <MapFoot />
    </main>
  )
}
