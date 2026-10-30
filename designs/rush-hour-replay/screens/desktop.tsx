// Desktop: the replay paused on the busiest minute of the morning, the map framed under the
// replay's header, the player under the map, and City pulse at that minute beside it.
import { BUSIEST } from '../data.ts'
import { DesktopReplay } from '../parts/ReplayScreen.tsx'
import './screens.css'

export default function Desktop() {
  return <DesktopReplay opening={BUSIEST.minute} />
}
