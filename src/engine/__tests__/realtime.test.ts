// The continuous actions used by the interactive bench: pouring while a bottle is held over a
// tube, drops from a parked dropper, heating while a tube sits in the flame, test papers and splints.
import { describe, expect, test } from 'vitest'
import { Lab } from '../lab'
import { solidLab, solutionLab, text } from './helpers'

const last = (lab: Lab) => text(lab.journal[lab.journal.length - 1])

/** Hold a bottle over a tube for `seconds` at `rate` cm³/s, ticking the bench in 0.1 s steps. */
function pourFor(lab: Lab, vesselId: string, reagentId: string, seconds: number, rate = 1.2) {
  const a = lab.begin(vesselId, `Pour ${reagentId}`)
  for (let t = 0; t < seconds; t += 0.1) {
    lab.pourStep(a, { reagentId }, rate * 0.1)
    lab.tick(0.1)
  }
  lab.release(a)
  lab.tick(5)
}

describe('continuous actions', () => {
  test('a pour is written up once, after it has settled', () => {
    const lab = solutionLab({ 'Cu2+': 0.1, 'SO4 2-': 0.1 })
    const t = lab.newVessel('test-tube')
    const n0 = lab.journal.length
    const a = lab.begin(t.id, 'Pour X')
    lab.pourStep(a, { vesselId: 'X' }, 1.3)
    lab.release(a)
    expect(lab.journal.length).toBe(n0)
    pourFor(lab, t.id, 'NH3', 3)
    expect(last(lab)).toMatch(/[Pp]ale blue precipitate forms but dissolves again|deep blue/)
  })

  test('drops from a parked dropper, then a pour in excess (Zn2+ with NaOH)', () => {
    const lab = solutionLab({ 'Zn2+': 0.1, 'SO4 2-': 0.1 })
    const t = lab.newVessel('test-tube')
    const p = lab.begin(t.id, 'Pour X')
    lab.pourStep(p, { vesselId: 'X' }, 1.3)
    lab.release(p, undefined, 0)
    const d = lab.begin(t.id, 'Add drops')
    for (let i = 0; i < 6; i++) {
      lab.dropStep(d, 'NaOH')
      lab.tick(0.4)
    }
    lab.release(d, undefined, 2)
    lab.tick(3)
    expect(last(lab)).toMatch(/White precipitate forms/)
    pourFor(lab, t.id, 'NaOH', 3)
    expect(last(lab)).toMatch(/dissolves, giving a colourless solution/)
  })

  test('heating while the tube sits in the flame: water of crystallisation condenses', () => {
    const lab = solidLab([{ compound: 'CuSO4.5H2O', grams: 1 }])
    const h = lab.newVessel('hard-glass-tube')
    lab.transfer('S', h.id, { all: true })
    const a = lab.begin(h.id, 'Heat strongly', { heating: true })
    lab.setHeating(h.id, 'strong')
    for (let t = 0; t < 40; t += 0.5) lab.tick(0.5)
    lab.setHeating(h.id, null)
    lab.release(a, 'Heat strongly for 40 s', 1)
    lab.tick(2)
    expect(last(lab)).toMatch(/[Cc]ondensation/)
    expect(last(lab)).toMatch(/white/)
  })

  test('damp red litmus at the mouth detects ammonia; dry litmus does not', () => {
    const lab = solutionLab({ 'NH4+': 0.2, 'Cl-': 0.2 })
    const t = lab.newVessel('boiling-tube')
    const a = lab.begin(t.id, 'Pour X')
    lab.pourStep(a, { vesselId: 'X' }, 3)
    lab.pourStep(a, { reagentId: 'NaOH' }, 3)
    lab.release(a, undefined, 0)
    lab.setHeating(t.id, 'warm')
    for (let i = 0; i < 30; i++) lab.tick(1)
    expect(text(lab.mouthTest(t.id, 'damp-red-litmus', { damp: false }))).toMatch(/dry red litmus paper does not change/)
    expect(text(lab.mouthTest(t.id, 'damp-red-litmus', { damp: true }))).toMatch(/turns blue/)
  })

  test('dipping red litmus into the alkaline mixture turns it blue even without ammonium (a classic mistake)', () => {
    const lab = solutionLab({ 'Na+': 0.1, 'Cl-': 0.1 })
    const t = lab.newVessel('test-tube')
    const a = lab.begin(t.id, 'Pour X')
    lab.pourStep(a, { vesselId: 'X' }, 1.3)
    lab.pourStep(a, { reagentId: 'NaOH' }, 1.3)
    lab.release(a, undefined, 0)
    expect(text(lab.indicatorDip(t.id, 'red-litmus'))).toMatch(/turns blue/)
    expect(text(lab.mouthTest(t.id, 'damp-red-litmus', { damp: true }))).toMatch(/stays red/)
  })

  test('teat pipette: carbon dioxide from a carbonate turns limewater milky', () => {
    const lab = solidLab([{ compound: 'Na2CO3', grams: 0.5 }])
    const acid = lab.newVessel('test-tube')
    const lw = lab.newVessel('test-tube')
    const l = lab.begin(lw.id, 'Pour limewater')
    lab.pourStep(l, { reagentId: 'limewater' }, 2.6)
    lab.release(l, undefined, 0)
    const p = lab.begin(acid.id, 'Pour acid')
    lab.pourStep(p, { reagentId: 'HNO3' }, 2.6)
    lab.release(p, undefined, 0)
    const s = lab.begin(acid.id, 'Add solid')
    lab.deposit(s, lab.scoop({ vesselId: 'S' }, 0.1))
    lab.tick(1)
    const gas = lab.collectGas(acid.id)
    expect(text(lab.bubbleGas(gas, lw.id)!)).toMatch(/limewater turns milky/)
  })

  test('fresh limewater is a clear solution', () => {
    const lab = new Lab()
    const lw = lab.newVessel('test-tube')
    const l = lab.begin(lw.id, 'Pour limewater')
    lab.pourStep(l, { reagentId: 'limewater' }, 2.6)
    expect(text(lab.release(l, undefined, 0)!)).toBe('No visible change.')
    expect([...lw.n.keys()].some((k) => k.endsWith('(s)'))).toBe(false)
  })

  test('teat pipette: air from an empty tube leaves limewater clear', () => {
    const lab = new Lab()
    const empty = lab.newVessel('test-tube')
    const lw = lab.newVessel('test-tube')
    const l = lab.begin(lw.id, 'Pour limewater')
    lab.pourStep(l, { reagentId: 'limewater' }, 2.6)
    lab.release(l, undefined, 0)
    expect(text(lab.bubbleGas(lab.collectGas(empty.id), lw.id)!)).toMatch(/stays clear/)
  })

  test('filtering: precipitate stays on the paper, the filtrate runs through', () => {
    const lab = solutionLab({ 'Cu2+': 0.1, 'SO4 2-': 0.1 })
    const t = lab.newVessel('test-tube')
    const a = lab.begin(t.id, 'Pour X')
    lab.pourStep(a, { vesselId: 'X' }, 2)
    lab.pourStep(a, { reagentId: 'NaOH' }, 0.6)
    lab.release(a, undefined, 0)
    const paper = lab.newVessel('filter-paper', 'filter paper')
    const below = lab.newVessel('test-tube')
    const f = lab.begin(below.id, 'Filter')
    for (let i = 0; i < 10; i++) lab.filterStep(f, { vesselId: t.id }, paper.id, 0.4)
    const r = lab.release(f, undefined, 0)!
    expect(text(r)).toMatch(/[Pp]ale blue residue on the filter paper/)
    expect(below.V).toBeGreaterThan(1.5)
  })

  test('flame reading from a loaded wire', () => {
    const lab = solidLab([{ compound: 'KI', grams: 0.5 }])
    expect(lab.flameReading('S')).toMatch(/Lilac/)
  })
})
