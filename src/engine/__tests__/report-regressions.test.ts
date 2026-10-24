import { expect, test } from 'vitest'
import { Lab, molarMassOf } from '../lab'
import { FAST_RULES, RULES } from '../rules'
import { solidLab, solutionLab, portion, text } from './helpers'
import { Vessel } from '../vessel'

test.each([1, 2].flatMap(depth => [2, 3].flatMap(cm3 => [30, 60, 120].map(seconds => [depth, cm3, seconds]))))('nitrate detection is stable: depth %s, alkali %s, warming %ss', (depth, cm3, seconds) => {
  const lab = solutionLab({ 'Na+': 0.1, 'NO3-': 0.1 })
  const tube = portion(lab, depth)
  lab.addReagent(tube, 'NaOH', { cm3 })
  lab.addReagent(tube, 'Al-foil', { pieces: 1 })
  lab.heat(tube, 'warm', seconds)
  expect(lab.gasReading(tube, 'damp-red-litmus')).toMatch(/turns blue/)
  expect(text(lab.gasTest(tube, 'damp-red-litmus'))).toMatch(/turns blue/)
})
test('nitrate blank without aluminium does not release ammonia', () => {
  const lab = solutionLab({ 'Na+': 0.1, 'NO3-': 0.1 })
  const tube = portion(lab)
  lab.addReagent(tube, 'NaOH', { cm3: 2 })
  lab.heat(tube, 'warm', 60)
  expect(text(lab.gasTest(tube, 'damp-red-litmus'))).toMatch(/stays red/)
})
test('concentrated ammonium may give ammonia at room temperature; warming is not an artificial prerequisite', () => {
  const lab = solutionLab({ 'NH4+': 0.5, 'Cl-': 0.5 })
  const tube = portion(lab)
  lab.addReagent(tube, 'NaOH', { cm3: 2 })
  expect(lab.vessel(tube).T).toBeLessThan(25)
  expect(text(lab.gasTest(tube, 'damp-red-litmus'))).toMatch(/turns blue/)
})
test('ammonium buffer suppresses magnesium precipitation without forcing all mixtures to be negative', () => {
  const precipitate = (ammonium: number) => {
    const lab = solutionLab({ 'Mg2+': 0.1, 'NH4+': ammonium, 'Cl-': ammonium + 0.2 })
    const tube = portion(lab)
    lab.addReagent(tube, 'NH3', { cm3: 1 })
    return lab.vessel(tube).amount('Mg(OH)2(s)')
  }
  expect(precipitate(1)).toBeLessThan(precipitate(0) / 2)
  expect(precipitate(2)).toBeLessThan(1e-5)
})
test('salt saturation leaves excess solid and further water dissolves it', () => {
  const lab = solidLab([{ compound: 'NaCl', grams: 3 }])
  expect(text(lab.addReagent('S', 'water', { cm3: 0.5 }))).toMatch(/some solid remains/)
  const v = lab.sampleVessel('S')
  expect(v.conc('Na+')).toBeCloseTo(6.1)
  expect(v.amount('cmp:NaCl')).toBeGreaterThan(40)
  const before = v.amount('cmp:NaCl')
  lab.addReagent('S', 'water', { cm3: 5 })
  expect(v.amount('cmp:NaCl')).toBeLessThan(before)
  expect(v.conc('Na+')).toBeLessThanOrEqual(6.100001)
})
test.each([-5, 0, NaN, Infinity])('invalid liquid amount %s cannot change contents or clock', cm3 => {
  const lab = new Lab(), v = lab.newVessel('test-tube')
  expect(() => lab.addReagent(v.id, 'NaOH', { cm3 })).toThrow()
  expect(v.V).toBe(0)
  expect(lab.time).toBe(0)
})
test('script and realtime paths both respect stoppers', () => {
  const lab = new Lab(), from = lab.newVessel('test-tube'), to = lab.newVessel('test-tube')
  lab.addReagent(from.id, 'water', { cm3: 2 }); to.stoppered = true
  expect(() => lab.addReagent(to.id, 'water', { cm3: 1 })).toThrow(/stopper/)
  expect(() => lab.transfer(from.id, to.id, { cm3: 1 })).toThrow(/stopper/)
  expect(lab.pourStep(lab.begin(to.id, 'Pour'), { vesselId: from.id }, 1)).toBe(0)
  expect(from.V).toBeCloseTo(2)
})
test('unsafe heating is blocked and recorded before temperature changes', () => {
  const lab = new Lab(), tube = lab.newVessel('test-tube')
  expect(text(lab.heat(tube.id, 'strong', 60))).toMatch(/Strong heating blocked/)
  tube.stoppered = true
  expect(text(lab.heat(tube.id, 'warm', 60))).toMatch(/remove the stopper/)
  expect(tube.T).toBe(20)
})
test('cloning a vessel does not allocate a fresh vessel ID', () => {
  const a = new Vessel('test-tube')
  for (let n = 0; n < 50; n++) a.clone()
  const b = new Vessel('test-tube')
  expect(Number(b.id.slice(1))).toBe(Number(a.id.slice(1)) + 1)
})
test('restoring an active pour preserves material and writes its journal exactly once', () => {
  const lab = new Lab(), v = lab.newVessel('hard-glass-tube')
  const pour = lab.begin(v.id, 'Add copper solution')
  lab.pourStep(pour, { reagentId: 'CuSO4' }, 2)
  const state = JSON.parse(JSON.stringify(lab.toState()))
  expect(lab.isOpen(pour)).toBe(true)
  const restored = Lab.fromState(state, { samples: [], reagents: [] })
  expect(restored.vessel(v.id).V).toBeCloseTo(2)
  expect(restored.vessel(v.id).amount('Cu2+')).toBeCloseTo(v.amount('Cu2+'))
  expect(restored.journal).toHaveLength(1)
  restored.tick(10); restored.flush()
  expect(restored.journal).toHaveLength(1)
  const next = restored.newVessel('test-tube')
  expect(restored.vessels.size).toBe(2)
  expect(next.id).not.toBe(v.id)
})
test('solver iteration limits are visible instead of silently dropping unfinished chemistry', () => {
  const length = FAST_RULES.length
  try {
    FAST_RULES.push(
      { id: 'test-cycle-a', type: 'complete', reactants: { 'Na+': 1 }, products: { 'K+': 1 } },
      { id: 'test-cycle-b', type: 'complete', reactants: { 'K+': 1 }, products: { 'Na+': 1 } },
    )
    const lab = new Lab(), v = lab.newVessel('test-tube')
    v.change('Na+', 1)
    expect(text(lab.addReagent(v.id, 'water', { cm3: 1 }))).toMatch(/iteration limit/)
    expect(v.log.some(e => e.kind === 'solver-limit')).toBe(true)
  } finally { FAST_RULES.splice(length) }
})
test('basic copper carbonate uses the complete formula unit for mass and thermal products', () => {
  expect(molarMassOf('CuCO3(s)')).toBeCloseTo(221.1)
  const rule = RULES.find(r => r.id === 'heat:CuCO3(s):0')!
  expect(rule.products['CuO(s)']).toBe(2)
})
test('dissolving an initially dry anhydrous salt does not call it a precipitate twice', () => {
  const lab = new Lab(), v = lab.newVessel('test-tube')
  v.change('CuSO4(s)', 1)
  const observation = text(lab.addReagent(v.id, 'water', { cm3: 3 }))
  expect(observation).not.toMatch(/precipitate/)
  expect(observation.match(/dissolves/g)).toHaveLength(1)
})

test.each([NaN, Infinity, -1])('invalid time %s cannot hang or corrupt the simulation', dt => {
  const lab = new Lab()
  expect(() => lab.tick(dt)).toThrow()
  expect(() => lab.wait(dt)).toThrow()
  expect(lab.time).toBe(0)
})
