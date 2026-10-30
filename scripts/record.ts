// Records the README's video: a walk through the studio on the static build, as a visitor sees
// it. Needs `npm run build` and `npx vite preview --port 4173` with BASE_PATH=/mylder-design/,
// or --base for another address; and ffmpeg for the GIF and MP4.
//
//   node scripts/record.ts <design-id> [--base URL]
//
// Writes docs/media/studio.mp4 and docs/media/studio.gif.
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium, type Page } from 'playwright'

const args = process.argv.slice(2)
const at = args.indexOf('--base')
const base = at === -1 ? 'http://localhost:4173/mylder-design/' : args.splice(at, 2)[1]!
const designId = args[0]
if (!designId) {
  console.error('Usage: node scripts/record.ts <design-id> [--base URL]')
  process.exit(1)
}

const SIZE = { width: 1440, height: 900 }
const pause = (page: Page, ms: number) => page.waitForTimeout(ms)

/** Moves the pointer to an element in steps, so the video shows where it goes. */
async function point(page: Page, x: number, y: number) {
  await page.mouse.move(x, y, { steps: 18 })
  await pause(page, 250)
}

const videos = mkdtempSync(join(tmpdir(), 'mylder-design-video-'))
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH })
const context = await browser.newContext({
  viewport: SIZE,
  colorScheme: 'dark',
  recordVideo: { dir: videos, size: SIZE },
})
const page = await context.newPage()

// the gallery
await page.goto(base)
await pause(page, 2500)
const card = page.locator(`.studio-card[href="#/d/${designId}"]`)
const cardBox = (await card.boundingBox())!
await point(page, cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 3)
await card.click()

// the board
const frames = page.locator('.studio-board-frame iframe')
await frames.first().waitFor()
await page
  .frameLocator('.studio-board-frame iframe')
  .first()
  .locator('html[data-ready="true"]')
  .waitFor({ state: 'attached' })
await pause(page, 1500)
// one step closer, so the desktop screen reads in the video
await page.getByRole('button', { name: 'Zoom in' }).click()
await pause(page, 1500)

// interact: the screen works
await page
  .getByRole('radio', { name: 'Interact' })
  .or(page.getByRole('button', { name: 'Interact' }))
  .click()
await pause(page, 600)
const screen = page.frameLocator('.studio-board-frame iframe').first()
const play = screen.locator('[data-layer*="Play"], [data-layer*="play"]').first()
if (await play.count()) {
  const box = (await play.boundingBox())!
  await point(page, box.x + box.width / 2, box.y + box.height / 2)
  await play.click()
  await pause(page, 3500)
}
const jump = screen.locator('[data-layer="Jump to"] button').first()
if (await jump.count()) {
  const box = (await jump.boundingBox())!
  await point(page, box.x + box.width / 2, box.y + box.height / 2)
  await jump.click()
  await pause(page, 2500)
}

// edit: type over a heading, then give a panel another Perron surface
await page
  .getByRole('radio', { name: 'Edit' })
  .or(page.getByRole('button', { name: 'Edit' }))
  .click()
await pause(page, 500)
const heading = screen.locator('h1, h2, h3').first()
const headingBox = (await heading.boundingBox())!
await point(page, headingBox.x + 12, headingBox.y + headingBox.height / 2)
await heading.dblclick({ position: { x: 12, y: headingBox.height / 2 } })
await pause(page, 400)
await page.keyboard.press('ControlOrMeta+A')
await page.keyboard.type('Morning rush, Tuesday', { delay: 70 })
await page.keyboard.press('Enter')
await pause(page, 1200)

const inspector = page.getByLabel('Inspector')
const parentButton = inspector.getByRole('button', { name: 'Select parent' })
if (await parentButton.count()) {
  await parentButton.click()
  await pause(page, 700)
}
const background = inspector.getByRole('combobox', { name: 'Background' })
if (await background.count()) {
  await background.click()
  await pause(page, 700)
  await page.getByRole('option', { name: 'brand-subtle' }).click()
  await pause(page, 1500)
}

// a tweak, then the light theme
const tweak = inspector.locator('.studio-inspector-field').first()
if (await tweak.count()) {
  const segments = tweak.locator('button, [role="radio"]')
  await segments.last().click()
  await pause(page, 1500)
}
await page
  .getByRole('radio', { name: 'Light' })
  .or(page.getByRole('button', { name: 'Light' }))
  .click()
await pause(page, 2000)

// undo back to the saved design
for (let i = 0; i < 3; i++) {
  await inspector.getByRole('button', { name: 'Undo', exact: true }).click()
  await pause(page, 600)
}
await pause(page, 1500)

await context.close()
const source = await page.video()!.path()
await browser.close()

mkdirSync('docs/media', { recursive: true })
execFileSync('ffmpeg', [
  '-y',
  '-loglevel',
  'error',
  '-i',
  source,
  '-vf',
  'scale=1280:-2',
  '-c:v',
  'libx264',
  '-pix_fmt',
  'yuv420p',
  '-crf',
  '26',
  '-movflags',
  '+faststart',
  'docs/media/studio.mp4',
])
const palette = join(videos, 'palette.png')
const filters = 'fps=12,scale=960:-1:flags=lanczos'
execFileSync('ffmpeg', [
  '-y',
  '-loglevel',
  'error',
  '-i',
  source,
  '-vf',
  `${filters},palettegen=stats_mode=diff`,
  palette,
])
execFileSync('ffmpeg', [
  '-y',
  '-loglevel',
  'error',
  '-i',
  source,
  '-i',
  palette,
  '-lavfi',
  `${filters} [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`,
  'docs/media/studio.gif',
])
rmSync(videos, { recursive: true })
console.log('docs/media/studio.mp4\ndocs/media/studio.gif')
