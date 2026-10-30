// Phone: the replay paused on the busiest minute, the framed map, the player under it, and City
// pulse at that minute below, scrolling under the player.
import { BUSIEST } from '../data.ts'
import { PhoneReplay } from '../parts/ReplayScreen.tsx'
import './screens.css'

export default function Phone() {
  return <PhoneReplay opening={BUSIEST.minute} />
}
