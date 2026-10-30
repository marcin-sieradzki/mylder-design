// Screenshots a design's screens, as the canvas page draws them, so whoever generated the design
// can look at it before calling it done. Needs the dev server (`npm run dev`).
//
//   node scripts/shoot.ts <design-id> [screen-id ...] [--theme light|dark|both] [--base URL]
//
// Writes .shots/<design-id>/<screen-id>-<theme>.png and prints each path.
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'
import { DEVICE_SIZE, type Design } from '../src/designs/types.ts'

const args = process.argv.slice(2)
const option = (name: string, fallback: string) => {
  const at = args.indexOf(`--${name}`)
  if (at === -1) return fallback
  const [value] = args.splice(at, 2).slice(1)
  return value ?? fallback
}
const base = option('base', process.env.MYLDER_DESIGN_URL ?? 'http://localhost:5173')
const themeArg = option('theme', 'both')
const [designId, ...screenArgs] = args
if (!designId) {
  console.error(
    'Usage: node scripts/shoot.ts <design-id> [screen-id ...] [--theme light|dark|both]',
  )
  process.exit(1)
}

const themes = themeArg === 'both' ? ['light', 'dark'] : [themeArg]
const { design } = (await import(`../designs/${designId}/design.ts`)) as { design: Design }
const all = [...design.screens, ...(design.explorations ?? [])]
const screens = screenArgs.length ? all.filter((s) => screenArgs.includes(s.id)) : all

const out = `.shots/${designId}`
mkdirSync(out, { recursive: true })
// CHROMIUM_PATH points at a browser of your own when Playwright's isn't installed
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH })
try {
  for (const { id: screen, device } of screens) {
    for (const theme of themes) {
      const page = await browser.newPage({ viewport: DEVICE_SIZE[device], deviceScaleFactor: 2 })
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
      const query = new URLSearchParams({ design: designId, screen, theme })
      await page.goto(`${base}/canvas.html?${query}`)
      await page.waitForSelector('html[data-ready="true"]', { state: 'attached', timeout: 30_000 })
      const path = `${out}/${screen}-${theme}.png`
      await page.screenshot({ path })
      console.log(path)
      for (const error of errors) console.error(`  ${screen} (${theme}): ${error}`)
      await page.close()
    }
  }
} finally {
  await browser.close()
}
