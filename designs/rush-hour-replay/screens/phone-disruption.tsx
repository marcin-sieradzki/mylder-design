// Phone, at a disruption: the replay scrubbed to 07:46, inside both marked stretches. Movia's buses
// have sent nothing for 8 min, so they show No signal on the map and in the counts, and
// Rejseplanen's signal fault on the S-tog is still on.
import { PhoneReplay } from '../parts/ReplayScreen.tsx'
import './screens.css'

export default function PhoneDisruption() {
  return <PhoneReplay opening={7 * 60 + 46} />
}
