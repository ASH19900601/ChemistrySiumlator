import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('qa-lab:demo-seen', 'true'))
})

test('all four years are present and original AS question numbers are searchable', async ({ page }) => {
  await expect(page.locator('.paper-card')).toHaveCount(67)
  await page.getByLabel('Year', { exact: true }).selectOption('2026')
  await expect(page.locator('.paper-card')).toHaveCount(12)
  await page.getByLabel('Year', { exact: true }).selectOption('all')
  await page.getByLabel('Question', { exact: true }).selectOption('2')
  await page.getByLabel('Find paper', { exact: true }).fill('9701')
  await expect(page.locator('.paper-card')).toHaveCount(2)
  await expect(page.locator('.paper-card').first()).toContainText('Question 2')
})

test('source-only paper supports original pages, answers and self marking without pretending to have a bench', async ({ page }) => {
  await page.getByLabel('Find paper', { exact: true }).fill('9701_s26_31')
  await page.locator('.paper-card').click()
  await expect(page.getByRole('application')).toHaveCount(0)
  await expect(page.locator('.paper-note')).toContainText('not yet available')
  await expect(page.locator('.paper-head')).toContainText('Question 1')
  const image = page.locator('.source-pages img').first()
  await expect(image).toHaveJSProperty('naturalWidth', 1440)
  await expect(page.locator('.original-mark-scheme')).toHaveCount(0)
  await page.getByRole('textbox', { name: 'Your answers to Question 1' }).fill('(a)(ii) Mn²⁺ and Cl⁻\n(b)(ii) Al₂(SO₄)₃')
  page.on('dialog', d => d.accept())
  await page.getByRole('button', { name: 'Finish', exact: true }).click()
  await page.getByRole('button', { name: 'Confirm finish', exact: true }).click()
  await expect(page.locator('.original-mark-scheme')).toBeVisible()
  await expect(page.locator('.your-answer')).toContainText('Mn²⁺ and Cl⁻')
  await expect(page.locator('.score-pill')).toHaveText('0 / 15')
})

test('new IGCSE source bench has its actual labelled unknowns and question', async ({ page }) => {
  await page.getByLabel('Find paper', { exact: true }).fill('0620_s26_52')
  await page.locator('.paper-card').click()
  await expect(page.getByRole('application')).toBeVisible()
  await expect(page.getByRole('button', { name: 'solid C', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'solution D', exact: true })).toBeVisible()
  await expect(page.locator('.paper-note')).toContainText('not been verified against every mark-scheme point')
})

test('all 201 original source PDFs are available locally with valid PDF headers', async ({ request }) => {
  // Use the generated metadata directly, including CI assets, rather than asserting a hardcoded URL.
  const { ARCHIVE_DATA } = await import('../src/papers/archive-data')
  for (const paper of ARCHIVE_DATA) {
    for (const asset of Object.values(paper.assets)) {
      const response = await request.get(`/${asset.pdf}`)
      expect(response.ok(), asset.pdf).toBe(true)
      expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-')
    }
  }
})

for (const id of ['9701_w23_31', '9701_w23_35']) test(`${id} Q2 guided bench reaches its 17-mark self-marking page`, async ({ page }) => {
  await page.getByLabel('Find paper', { exact: true }).fill(id)
  await page.locator('.paper-card').click()
  await expect(page.getByRole('application')).toBeVisible()
  await expect(page.locator('.paper-head')).toContainText('Question 2')
  await expect(page.locator('textarea.answer').first()).toBeVisible()
  page.on('dialog', d => d.accept())
  await page.getByRole('button', { name: 'Finish', exact: true }).click()
  await page.getByRole('button', { name: 'Confirm finish', exact: true }).click()
  await expect(page.locator('.score-pill')).toHaveText('0 / 17')
  await expect(page.locator('.supervisor').filter({ hasText: 'glowing splint relights' })).toBeVisible()
})
