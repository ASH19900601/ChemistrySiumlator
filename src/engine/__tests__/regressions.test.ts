import { expect, test } from 'vitest'
import { Lab } from '../lab'
import { text } from './helpers'

test('R11 filter journal matches the returned filtrate and residue observations', () => {
  const lab = new Lab()
  const source = lab.newVessel('test-tube')
  source.receive({ 'Cu(OH)2(s)': 0.2 }, 3)
  const { result } = lab.filter(source.id)
  expect(text(lab.journal[lab.journal.length - 1])).toBe(text(result))
})

test('R12 emptying a reacting tube stops phantom bubbling', () => {
  const lab = new Lab()
  const v = lab.newVessel('test-tube')
  v.V = 3
  v.bubbleRate = 1
  lab.empty(v.id)
  expect(v.bubbleRate).toBe(0)
})

test('R13 rinsing writes up a pending reaction before destroying its contents', () => {
  const lab = new Lab()
  const v = lab.newVessel('test-tube')
  const a = lab.begin(v.id, 'Add copper solution')
  lab.pourStep(a, { reagentId: 'CuSO4' }, 1)
  lab.rinse(v.id)
  expect(lab.journal[0].action).toBe('Add copper solution')
  expect(lab.journal[1].action).toBe('Rinse with distilled water')
})

test('R14 cold water cools a hot solution when poured in', () => {
  const lab = new Lab()
  const v = lab.newVessel('test-tube')
  v.V = 2
  v.T = 100
  const a = lab.begin(v.id, 'Dilute')
  lab.pourStep(a, { reagentId: 'water' }, 2)
  expect(v.T).toBeCloseTo(60)
})

test('R15 hot liquid retains its temperature when transferred to a clean tube', () => {
  const lab = new Lab()
  const from = lab.newVessel('test-tube')
  from.V = 3
  from.T = 80
  const to = lab.newVessel('test-tube')
  lab.pourStep(lab.begin(to.id, 'Transfer'), { vesselId: from.id }, 2)
  expect(to.T).toBeCloseTo(80)
})

test('R16 repeated gas sampling cannot create more ammonia than the tube contains', () => {
  const lab = new Lab()
  const v = lab.newVessel('test-tube')
  v.receive({ NH3: 0.1 }, 1)
  let collected = 0
  for (let i = 0; i < 1000; i++) collected += lab.collectGas(v.id).get('NH3(g)') ?? 0
  expect(collected).toBeLessThanOrEqual(0.100001)
  expect(v.amount('NH3')).toBeLessThan(0.1)
})

test('R17 a cancelled action cannot silently accept unrecorded chemicals', () => {
  const lab = new Lab()
  const v = lab.newVessel('test-tube')
  const a = lab.begin(v.id, 'Pour')
  lab.cancel(a)
  expect(lab.pourStep(a, { reagentId: 'NaOH' }, 1)).toBe(0)
  expect(v.V).toBe(0)
})

test('R18 a stoppered receiver rejects drops even if its action started while open', () => {
  const lab = new Lab()
  const v = lab.newVessel('test-tube')
  const a = lab.begin(v.id, 'Drops')
  v.stoppered = true
  expect(lab.dropStep(a, 'NaOH')).toBe(0)
  expect(v.V).toBe(0)
})
