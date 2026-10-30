// Desktop, a vehicle open: the map as on Desktop, with S-tog line C's detail in the panel on the
// other side of the map from the city sheet.
import { CityMap } from '#kit'
import { CitySheet } from '../parts/CitySheet.tsx'
import { VehiclePanel } from '../parts/DetailPanels.tsx'
import { MapFoot, MapTopBar } from '../parts/MapChrome.tsx'
import './screens.css'

export default function DesktopVehicle() {
  return (
    <main className="mylder-today-screen" data-device="desktop" data-panel="open">
      <CityMap />
      <div className="mylder-today-veil" />
      <MapTopBar size="medium" />
      <CitySheet placement="side" />
      <MapFoot />
      <VehiclePanel />
    </main>
  )
}
