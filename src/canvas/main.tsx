// The canvas page: draws one screen of one design, full size, for the studio's iframe. It is
// passive: the studio sets the theme and tweaks on <html> and applies a visitor's draft edits.
import '@mylder/perron/perron.css'
import './canvas.css'
import { PerronProvider } from '@mylder/perron'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { loadScreen } from '../designs/registry.ts'
import { READY, SCREEN_ROOT_ID, type ReadyMessage } from './protocol.ts'

const params = new URLSearchParams(location.search)
const designId = params.get('design') ?? ''
const screenId = params.get('screen') ?? ''
const theme = params.get('theme')
if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme

const container = document.getElementById(SCREEN_ROOT_ID)
if (!container) throw new Error(`canvas.html has no #${SCREEN_ROOT_ID}`)

function ready() {
  document.documentElement.dataset.ready = 'true'
  const message: ReadyMessage = { type: READY, designId, screenId }
  if (window.parent !== window) window.parent.postMessage(message, location.origin)
}

async function draw() {
  const load = loadScreen(designId, screenId)
  if (!load) {
    container!.textContent = `No screen ${screenId} in design ${designId}.`
    ready()
    return
  }
  const { default: Screen } = await load
  createRoot(container!).render(
    <StrictMode>
      <PerronProvider locale="en">
        <Screen />
      </PerronProvider>
    </StrictMode>,
  )
  // wait for React's first paint and the fonts, so a draft's edits land on the finished screen
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  await document.fonts.ready
  ready()
}

void draw()
