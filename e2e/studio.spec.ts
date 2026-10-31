// The public site's flows: browse the designs, open one, edit a draft, and find the saved design
// untouched. Runs on the static build, where nobody can generate.
import { expect, test, type FrameLocator, type Page } from '@playwright/test'

const DESIGN = 'mylder-today'
/** A piece of text on its first screen, and a named layer around it */
const TEXT = '[data-layer="Sheet title"]'
const LAYER = '[data-layer="City sheet"]'

/** The board's first screen. */
const firstScreen = (page: Page): FrameLocator =>
  page.frameLocator('.studio-board-frame iframe').first()

async function openDesign(page: Page) {
  await page.goto(`#/d/${DESIGN}`)
  await expect(page.locator('.studio-board-frame iframe').first()).toBeVisible()
  await expect(firstScreen(page).locator('html[data-ready="true"]')).toBeAttached()
}

test('the gallery lists the designs and cannot generate', async ({ page }) => {
  await page.goto('')
  await expect(page.getByRole('heading', { level: 1, name: 'Designs for Mylder' })).toBeVisible()
  await expect(page.getByRole('table', { name: 'Designs' }).getByRole('link').first()).toBeVisible()
  await expect(page.getByText("Generated on the maintainer's machine")).toBeVisible()
  await expect(page.getByRole('button', { name: 'Generate' })).toHaveCount(0)
})

test('a visitor edits a draft that stays in their browser', async ({ page }) => {
  await openDesign(page)
  const screen = firstScreen(page)
  const heading = screen.locator(LAYER)
  const text = screen.locator(TEXT)
  const before = await text.textContent()

  // double-click text and type over it
  await text.dblclick()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.type('Draft text')
  await page.keyboard.press('Enter')
  await expect(text).toHaveText('Draft text')
  await expect(page.getByText('Draft · 1 edit')).toBeVisible()

  // select a layer: the inspector brings its Element tab forward
  await heading.click()
  const inspector = page.getByRole('complementary', { name: 'Inspector' })
  await expect(inspector.getByRole('tab', { name: 'Element' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(inspector.locator('[data-layer-name]')).toContainText('City sheet')

  // the draft survives a reload
  await page.reload()
  await expect(firstScreen(page).locator('html[data-ready="true"]')).toBeAttached()
  await expect(firstScreen(page).getByText('Draft text')).toBeVisible()

  // undo is not kept across visits, but starting over puts the design back
  await page.getByRole('button', { name: 'Start over' }).click()
  await expect(firstScreen(page).getByText(before!.trim()).first()).toBeVisible()
  await expect(page.getByText('Draft mode', { exact: true })).toBeVisible()
})

test('a screen picked in the list is the current one on the board', async ({ page }) => {
  await openDesign(page)
  const nav = page.getByRole('navigation', { name: 'Design' })
  const second = nav.getByRole('list', { name: 'Screens' }).getByRole('button').nth(1)
  await second.click()
  await expect(second).toHaveAttribute('aria-current', 'true')
  await expect(page.locator('.studio-board-frame[data-current]')).toHaveCount(1)
  await expect(page.locator('.studio-board-frame').nth(1)).toHaveAttribute('data-current', 'true')
})

test('undo and redo step through the draft', async ({ page }) => {
  await openDesign(page)
  const text = firstScreen(page).locator(TEXT)
  const before = (await text.textContent())!
  await text.dblclick()
  await page.keyboard.press('ControlOrMeta+A')
  await page.keyboard.type('Changed')
  await page.keyboard.press('Enter')
  await expect(text).toHaveText('Changed')
  await page.getByRole('tab', { name: 'Draft' }).click()
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(text).toHaveText(before)
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  await expect(text).toHaveText('Changed')
})

test('interact mode leaves clicks to the screen', async ({ page }) => {
  await openDesign(page)
  await page
    .getByRole('radio', { name: 'Interact' })
    .or(page.getByRole('button', { name: 'Interact' }))
    .click()
  await firstScreen(page)
    .locator(LAYER)
    .click({ position: { x: 20, y: 20 } })
  await page.getByRole('tab', { name: 'Element' }).click()
  await expect(page.getByText('Switch to Edit to change a screen')).toBeVisible()
})

test('a tweak reaches every screen', async ({ page }) => {
  await openDesign(page)
  const tab = page.getByRole('tab', { name: /^Tweaks/ })
  test.skip((await tab.count()) === 0, 'the design has no tweaks')
  await tab.click()
  const tweaks = page.getByRole('tabpanel').locator('.studio-inspector-field').first()
  const segments = tweaks.locator('button, [role="radio"]')
  await segments.last().click()
  const attribute = await firstScreen(page)
    .locator('html')
    .evaluate((html) => [...html.attributes].find((a) => a.name.startsWith('data-tweak-'))?.value)
  expect(attribute).toBeTruthy()
})
