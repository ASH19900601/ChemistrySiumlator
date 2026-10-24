import { expect, test, type Page } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('qa-lab:demo-seen', 'true'))
})
async function start(page: Page) { await page.locator('.paper-card').first().click(); await expect(page.getByRole('application')).toBeVisible() }
async function finish(page: Page) {
  await page.getByRole('button', { name: 'Finish', exact: true }).click()
  await page.getByRole('button', { name: 'Confirm finish', exact: true }).click()
  await expect(page.locator('.score-pill')).toBeVisible()
}
test('refresh restores material, positions, journal, answers and internal browser history', async ({ page }) => {
  await start(page)
  await page.locator('textarea.answer').first().fill('Saved observation')
  const before = await page.evaluate(() => {
    const m = (window as any).__bench
    const v = m.lab.newVessel('test-tube')
    m.places.set(v.id, { at: 'rack', slot: 2 })
    m.lab.addReagent(v.id, 'water', { cm3: 2 })
    m.bump()
    return { id: v.id, count: m.lab.vessels.size }
  })
  await expect.poll(() => page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('qa-lab:attempt:')).map(k => JSON.parse(localStorage.getItem(k)!)).some(a => a.bench?.lab.vessels.length > 1))).toBe(true)
  const url = page.url()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Resume experiment' })).toBeVisible()
  expect(await page.evaluate(id => (window as any).__bench.lab.vessel(id).V, before.id)).toBeCloseTo(2)
  expect(await page.evaluate(() => (window as any).__bench.lab.vessels.size)).toBe(before.count)
  await expect(page.locator('textarea.answer').first()).toHaveValue('Saved observation')
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await expect(page.locator('.paper-card')).toHaveCount(67)
  await page.goBack()
  await expect(page).toHaveURL(url)
  await expect(page.getByRole('button', { name: 'Resume experiment' })).toBeVisible()
})
test('refresh on results preserves score and distinguishes unmarked parts', async ({ page }) => {
  await start(page); await finish(page)
  await expect(page.locator('.mark-progress')).toContainText('Marked 0 /')
  await page.locator('.mark-picker').first().getByRole('button', { name: '1', exact: true }).click()
  await expect(page.locator('.score-pill')).toHaveText('1 / 14')
  await page.reload()
  await expect(page.locator('.score-pill')).toHaveText('1 / 14')
  await expect(page.locator('.mark-progress')).toContainText('Marked 1 /')
})
test('quota failures warn and export the current unsaved work', async ({ page }) => {
  await start(page)
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('full', 'QuotaExceededError') } })
  await page.locator('textarea.answer').first().fill('Work that must not disappear silently')
  await expect(page.getByRole('alert')).toContainText('Could not save')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export backup' }).click()
  expect((await download).suggestedFilename()).toMatch(/attempt\.json$/)
  await expect(page.locator('textarea.answer').first()).toHaveValue('Work that must not disappear silently')
})
test('printed paper numbers and saved search filters work together', async ({ page }) => {
  await page.getByLabel('Find paper', { exact: true }).fill('0620/52')
  await page.getByLabel('Year', { exact: true }).selectOption('2026')
  await expect(page.locator('.paper-card')).toHaveCount(2)
  await page.locator('.paper-card').first().click()
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await expect(page.getByLabel('Find paper', { exact: true })).toHaveValue('0620/52')
  await expect(page.getByLabel('Year', { exact: true })).toHaveValue('2026')
})
test('source-only writing does not run a bench simulation', async ({ page }) => {
  await page.getByLabel('Find paper', { exact: true }).fill('9701_s26_31')
  await page.locator('.paper-card').click()
  expect(await page.evaluate(() => (window as any).__bench)).toBeUndefined()
  await expect(page.getByRole('application')).toHaveCount(0)
})
test('phone Put back is visible without scrolling and sealed target preserves bottle', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 }); await start(page)
  await page.evaluate(() => {
    const m = (window as any).__bench
    m.held = { item: { k: 'bottle', reagentId: 'NaOH' }, x: 300, y: 300, dragging: false, ox: 0, oy: 0 }
    const id = m.lab.samples.values().next().value, b = m.boxOf(id)
    m.down(`tube:${id}`, b.cx, b.bottom); m.up(b.cx, b.bottom); m.bump()
  })
  await expect(page.getByRole('status').filter({ hasText: 'Remove the stopper' })).toBeVisible()
  const button = page.getByRole('button', { name: 'Put back', exact: true })
  const box = await button.boundingBox()
  expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.x + box!.width).toBeLessThanOrEqual(320)
  const contrast = await button.evaluate(el => {
    const style = getComputedStyle(el)
    const luminance = (colour: string) => {
      const values = colour.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(n => n / 255).map(n => n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4)
      return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722
    }
    const a = luminance(style.color), b = luminance(style.backgroundColor)
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
  })
  expect(contrast).toBeGreaterThanOrEqual(4.5)
  expect(await page.evaluate(() => (window as any).__bench.held?.item.k)).toBe('bottle')
})
test('a damaged snapshot is not silently replaced by an initial experiment', async ({ page }) => {
  await start(page)
  await expect.poll(() => page.evaluate(() => Object.keys(localStorage).some(k => k.startsWith('qa-lab:attempt:') && JSON.parse(localStorage.getItem(k)!).bench))).toBe(true)
  await page.addInitScript(() => {
    const key = Object.keys(localStorage).find(k => k.startsWith('qa-lab:attempt:'))!, value = JSON.parse(localStorage.getItem(key)!)
    value.bench.lab.vessels[0].V = -10; localStorage.setItem(key, JSON.stringify(value))
  })
  await page.reload()
  await expect(page.getByRole('alert')).toContainText('snapshot is damaged')
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => k.startsWith('qa-lab:attempt:'))!)!).bench.lab.vessels[0].V)).toBe(-10)
})

test('keyboard alone completes create, add, heat, test, empty and rinse workflow', async ({ page }) => {
  await start(page)
  const key = async (name: string) => {
    const control = page.getByRole('button', { name, exact: true })
    await control.focus(); await page.keyboard.press('Enter')
  }
  await key('New hard-glass-tube')
  const tube = await page.evaluate(() => [...(window as any).__bench.lab.vessels.values()].find((v: any) => v.kind === 'hard-glass-tube') as any)
  await page.locator('.keyboard-controls summary').focus(); await page.keyboard.press('Enter')
  const select = page.getByLabel('Target tube', { exact: true })
  const index = await select.locator('option').evaluateAll((options, id) => options.findIndex(option => (option as HTMLOptionElement).value === id), tube.id)
  await select.focus(); await page.keyboard.press('Home')
  for (let i = 0; i < index; i++) await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await key('bottle aqueous sodium hydroxide')
  await key('Use at tube mouth')
  await expect.poll(() => page.evaluate(id => (window as any).__bench.lab.vessel(id).V, tube.id)).toBeGreaterThan(0.2)
  await key('Put back')
  await key('Toggle gas tap'); await key('Light a match'); await key('Bring tool to flame')
  await expect.poll(() => page.evaluate(() => (window as any).__bench.burner.lit)).toBe(true)
  await key('Put back'); await key(tube.label); await key('Heat tube above flame')
  await expect.poll(() => page.evaluate(id => (window as any).__bench.lab.vessel(id).T, tube.id)).toBeGreaterThan(21)
  await key('red-litmus paper'); await key('Dampen test paper')
  await expect.poll(() => page.evaluate(() => (window as any).__bench.held?.item.damp)).toBe(true)
  await key('Use at tube mouth')
  await expect.poll(() => page.evaluate(() => (window as any).__bench.lab.journal.some((j: any) => /litmus/.test(j.action)))).toBe(true)
  await key('Put back'); await key(tube.label); await key('Empty held tube')
  await key(tube.label); await key('Rinse held tube')
  await expect.poll(() => page.evaluate(id => (window as any).__bench.lab.vessel(id).V, tube.id)).toBeLessThan(0.05)
  expect(await page.evaluate(() => (window as any).__bench.lab.journal.some((j: any) => /Rinse/.test(j.action)))).toBe(true)
})

test('phone document zoom starts from viewport width and can step back down', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByLabel('Find paper', { exact: true }).fill('9701_s26_31'); await page.locator('.paper-card').click()
  const before = await page.locator('.source-pages').first().evaluate(el => el.clientWidth)
  await page.getByRole('button', { name: 'Zoom in Original question', exact: true }).click()
  const zoomed = await page.locator('.source-pages figure').first().evaluate(el => el.clientWidth)
  expect(zoomed).toBeGreaterThan(before); expect(zoomed).toBeLessThanOrEqual(before * 1.3)
  await page.getByRole('button', { name: 'Zoom out Original question', exact: true }).click()
  expect(await page.locator('.source-pages figure').first().evaluate(el => el.clientWidth)).toBeLessThan(zoomed)
})

test('exported backup can restore answers, material and marks as an independent attempt', async ({ page }) => {
  await start(page)
  await page.locator('textarea.answer').first().fill('Backup round trip')
  await finish(page)
  await page.locator('.mark-picker').first().getByRole('button', { name: '1', exact: true }).click()
  const pending = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export backup' }).click()
  const file = await (await pending).path()
  await page.getByRole('button', { name: 'Back to papers', exact: true }).click()
  await page.getByLabel('Import attempt backup', { exact: true }).setInputFiles(file!)
  await expect(page.locator('.score-pill')).toHaveText('1 / 14')
  await expect(page.locator('.your-answer').first()).toContainText('Backup round trip')
})

test('new attempt keeps previous results independent', async ({ page }) => {
  await start(page); await finish(page)
  await page.locator('.mark-picker').first().getByRole('button', { name: '1', exact: true }).click()
  const old = page.url()
  await page.getByRole('button', { name: 'Try this question again' }).click()
  await expect(page.locator('textarea.answer').first()).toHaveValue('')
  await finish(page)
  await expect(page.locator('.score-pill')).toHaveText('0 / 14')
  await page.goto(old)
  await expect(page.locator('.score-pill')).toHaveText('1 / 14')
})

test('configured paper has individual score fields and only partial verified references', async ({ page }) => {
  await page.getByLabel('Find paper', { exact: true }).fill('0620_s26_52'); await page.locator('.paper-card').click()
  await expect(page.locator('textarea.answer')).toHaveCount(9)
  await finish(page)
  await expect(page.locator('.mark-picker')).toHaveCount(9)
  await expect(page.locator('.supervisor')).toContainText('Representative reference (partial simulation)')
  await expect(page.locator('.supervisor')).toContainText('Lilac')
})
