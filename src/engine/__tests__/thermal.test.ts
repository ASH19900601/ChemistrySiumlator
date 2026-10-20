// Heating: boiling liquids lose water; heated salts keep their non-volatile ions in the residue.
import { describe, expect, test } from 'vitest'
import { allCompounds } from '../compounds'
import { SPECIES } from '../species'
import { solidLab, solutionLab, portion, text } from './helpers'

// ions that may legitimately leave entirely as gases (NH3, HCl, CO2, NO2, …)
const VOLATILE_IONS = new Set(['NH4+', 'H+', 'CO3 2-', 'HCO3-', 'NO3-', 'Cl-'])

describe('heating dry solids', () => {
  test.each(allCompounds().filter((d) => d.thermal && d.dissolves).map((d) => [d.id, d] as const))(
    '%s: every heating step leaves a solid holding its non-volatile ions',
    (_id, d) => {
      const keeps = Object.keys(d.dissolves!).some((ion) => !VOLATILE_IONS.has(ion))
      if (!keeps) return
      for (const step of d.thermal!) {
        const solids = Object.keys(step.products).filter((p) => SPECIES[p]?.phase === 's')
        expect(solids.length, `${d.id} at ${step.minTemp} °C`).toBeGreaterThan(0)
      }
    },
  )

  test('hydrated magnesium sulfate: the anhydrous residue still gives Mg2+ and SO4 2- tests', () => {
    const lab = solidLab([{ compound: 'MgSO4.7H2O', grams: 1 }])
    const h = lab.newVessel('hard-glass-tube')
    lab.transfer('S', h.id, { all: true })
    expect(text(lab.heat(h.id, 'gentle', 90))).toMatch(/[Cc]ondensation/)
    lab.wait(120, h.id)
    lab.addReagent(h.id, 'water', { depth: 3 })
    lab.shake(h.id)
    const a = lab.newVessel('test-tube')
    const b = lab.newVessel('test-tube')
    lab.transfer(h.id, a.id, { depth: 1 })
    lab.transfer(h.id, b.id, { depth: 1 })
    expect(text(lab.addReagent(a.id, 'NaOH', { drops: 5 }))).toMatch(/White precipitate/)
    lab.addReagent(b.id, 'HNO3', { depth: 1 })
    expect(text(lab.addReagent(b.id, 'Ba(NO3)2', { drops: 5 }))).toMatch(/White precipitate/)
  })
})

describe('boiling liquids', () => {
  test('heating to boiling drives off water and eventually boils to dryness', () => {
    const lab = solutionLab({ 'Na+': 0.5, 'Cl-': 0.5 })
    const t = portion(lab, 1.5)
    const V0 = lab.vessel(t).V
    expect(text(lab.heat(t, 'boil', 60))).toMatch(/boils/)
    expect(lab.vessel(t).V).toBeLessThan(V0 - 0.3)
    expect(text(lab.heat(t, 'boil', 90))).toMatch(/boils away, leaving a residue/)
    expect(lab.vessel(t).wet).toBe(false)
  })

  test('warming gently does not boil the liquid away', () => {
    const lab = solutionLab({ 'Na+': 0.5, 'Cl-': 0.5 })
    const t = portion(lab, 1.5)
    const V0 = lab.vessel(t).V
    lab.heat(t, 'warm', 90)
    expect(lab.vessel(t).V).toBeCloseTo(V0, 5)
  })
})
