import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('qa-lab:demo-seen', 'true'))
})

async function start(page: import('@playwright/test').Page) {
  await page.locator('.paper-card').first().click()
  await expect(page.getByRole('application')).toBeVisible()
}

test('R19 corrupted saved answers cannot crash the question paper', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('qa-lab:answers:0620_s24_51', 'null'))
  await start(page)
  await expect(page.locator('textarea.answer').first()).toBeVisible()
  await page.locator('textarea.answer').first().fill('White precipitate')
  await expect(page.locator('textarea.answer').first()).toHaveValue('White precipitate')
})

test('R20 a new submission does not inherit a previous submission score', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('qa-lab:marks:0620_s24_51', '{"b-i":2,"a":1,"b-ii":2}'))
  await start(page)
  page.on('dialog', d => d.accept())
  await page.getByRole('button', { name: 'Finish', exact: true }).click()
  await page.getByRole('button', { name: 'Confirm finish', exact: true }).click()
  await expect(page.locator('.score-pill')).toHaveText('0 / 14')
})

test('R21 written line breaks remain visible during self marking', async ({ page }) => {
  await start(page)
  const input = page.locator('textarea.answer').first()
  await input.fill('White precipitate\nDissolves in excess')
  page.on('dialog', d => d.accept())
  await page.getByRole('button', { name: 'Finish', exact: true }).click()
  await page.getByRole('button', { name: 'Confirm finish', exact: true }).click()
  const answer = page.locator('.ans-line span').filter({ hasText: 'White precipitate' }).last()
  expect(await answer.evaluate(el => getComputedStyle(el).whiteSpace)).toMatch(/pre/)
})

test('R22 apparatus can be operated using the keyboard', async ({ page }) => {
  await start(page)
  const box = page.getByRole('button', { name: 'New test-tube', exact: true })
  await box.focus()
  await page.keyboard.press('Enter')
  expect(await page.evaluate(() => (window as any).__bench.standing().length)).toBe(2)
})

test('R23 dismissing the tutorial does not accidentally put back a held tool', async ({ page }) => {
  await start(page)
  await page.evaluate(() => {
    (window as any).__bench.held = { item: { k: 'wire', reading: null, colour: null }, x: 500, y: 500, dragging: false, ox: 0, oy: 0 }
  })
  await page.getByRole('button', { name: 'Show how the bench works' }).click()
  await page.locator('.demo > rect').click({ position: { x: 300, y: 300 } })
  expect(await page.evaluate(() => (window as any).__bench.held?.item.k)).toBe('wire')
})

test('R24 answer tables fit a 320px phone without horizontal clipping', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await start(page)
  await page.getByRole('button', { name: '📄 Paper', exact: true }).click()
  const dimensions = await page.locator('.side-body').evaluate(el => ({ client: el.clientWidth, scroll: el.scrollWidth }))
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1)
})
