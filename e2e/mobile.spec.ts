import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('qa-lab:demo-seen', 'true'))
  await page.locator('.paper-card').first().tap()
  await expect(page.getByRole('application')).toBeVisible()
})

test('touch workflow: create a tube, tap a bottle, pour and put it back', async ({ page }) => {
  await page.getByRole('button', { name: 'New test-tube', exact: true }).tap()
  await page.getByRole('button', { name: 'bottle aqueous sodium hydroxide', exact: true }).tap()
  await page.getByRole('button', { name: 'test-tube 1', exact: true }).tap()
  await expect.poll(() => page.evaluate(() => {
    const m = (window as any).__bench
    return [...m.lab.vessels.values()].find((v: any) => v.label === 'test-tube 1').V
  })).toBeGreaterThan(0.15)
  await page.getByRole('button', { name: 'Put back', exact: true }).tap()
  expect(await page.evaluate(() => (window as any).__bench.held)).toBeNull()
})

test('phone navigation reaches both ends of the bench without page overflow', async ({ page }) => {
  await page.getByRole('button', { name: 'Wash', exact: true }).tap()
  await expect.poll(() => page.locator('.bench-wrap').evaluate(el => el.scrollLeft)).toBeGreaterThan(400)
  await page.getByRole('button', { name: 'Reagents', exact: true }).tap()
  await expect.poll(() => page.locator('.bench-wrap').evaluate(el => el.scrollLeft)).toBeLessThan(200)
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
  }
})

test('stationary edge drag keeps scrolling, and cancellation releases the item', async ({ page }) => {
  const rect = await page.getByRole('button', { name: 'bottle aqueous sodium hydroxide', exact: true }).boundingBox()
  const cdp = await page.context().newCDPSession(page)
  const point = { x: rect!.x + rect!.width / 2, y: rect!.y + rect!.height / 2 }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] })
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 384, y: point.y + 100 }] })
  await expect.poll(() => page.evaluate(() => (window as any).__bench.held?.dragging)).toBe(true)
  const initial = await page.locator('.bench-wrap').evaluate(el => el.scrollLeft)
  await expect.poll(() => page.locator('.bench-wrap').evaluate(el => el.scrollLeft)).toBeGreaterThan(initial + 60)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] })
  await expect.poll(() => page.evaluate(() => (window as any).__bench.held)).toBeNull()
})

test('a second finger cannot replace the apparatus gesture', async ({ page }) => {
  const cdp = await page.context().newCDPSession(page)
  const rect = await page.getByRole('button', { name: 'bottle aqueous sodium hydroxide', exact: true }).boundingBox()
  const first = { id: 1, x: rect!.x + rect!.width / 2, y: rect!.y + rect!.height / 2 }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [first] })
  const moved = { ...first, x: first.x + 40, y: first.y + 50 }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [moved] })
  await expect.poll(() => page.evaluate(() => (window as any).__bench.held?.item.k)).toBe('bottle')
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [moved, { id: 2, x: 250, y: 500 }] })
  expect(await page.evaluate(() => (window as any).__bench.held?.item.k)).toBe('bottle')
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] })
})

test('switching to the paper releases a lifted tool and retains typed answers', async ({ page }) => {
  await page.getByRole('button', { name: 'Tools', exact: true }).tap()
  await page.getByRole('button', { name: 'wire', exact: true }).tap()
  await page.getByRole('button', { name: '📄 Paper', exact: true }).tap()
  expect(await page.evaluate(() => (window as any).__bench.held)).toBeNull()
  const answer = page.locator('textarea.answer').first()
  expect(await answer.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16)
  await answer.fill('Pale blue precipitate')
  await page.getByRole('button', { name: '🧪 Lab', exact: true }).tap()
  await page.getByRole('button', { name: '📄 Paper', exact: true }).tap()
  await expect(answer).toHaveValue('Pale blue precipitate')
})

test('portrait, landscape and tablet layouts keep the paper and notebook reachable', async ({ page }) => {
  for (const size of [{ width: 844, height: 390 }, { width: 768, height: 1024 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(size)
    if (await page.locator('.bottom-tabs').isVisible()) {
      await page.getByRole('button', { name: '📄 Paper', exact: true }).tap()
    } else {
      await page.getByRole('button', { name: 'Question paper', exact: true }).tap()
    }
    await expect(page.locator('textarea.answer').first()).toBeVisible()
    if (await page.locator('.bottom-tabs').isVisible()) {
      await page.getByRole('button', { name: '📓 Notebook', exact: true }).tap()
    } else {
      await page.getByRole('button', { name: 'Lab notebook', exact: true }).tap()
    }
    await expect(page.getByRole('textbox', { name: 'Rough notes' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(size.width)
  }
})
