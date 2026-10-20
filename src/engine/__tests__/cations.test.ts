import { describe, expect, test } from 'vitest'
import { dropwiseThenExcess, portion, solutionLab, text } from './helpers'

const SALTS: Record<string, Record<string, number>> = {
  Al: { 'Al3+': 0.1, 'SO4 2-': 0.15 },
  NH4: { 'NH4+': 0.2, 'Cl-': 0.2 },
  Ca: { 'Ca2+': 0.1, 'NO3-': 0.2 },
  Ba: { 'Ba2+': 0.1, 'Cl-': 0.2 },
  Cr: { 'Cr3+': 0.1, 'Cl-': 0.3 },
  Cu: { 'Cu2+': 0.1, 'SO4 2-': 0.1 },
  Fe2: { 'Fe2+': 0.1, 'SO4 2-': 0.1 },
  Fe3: { 'Fe3+': 0.1, 'Cl-': 0.3 },
  Mg: { 'Mg2+': 0.1, 'SO4 2-': 0.1 },
  Mn: { 'Mn2+': 0.1, 'SO4 2-': 0.1 },
  Zn: { 'Zn2+': 0.1, 'SO4 2-': 0.1 },
}

function naoh(salt: string, reagent = 'NaOH') {
  const lab = solutionLab(SALTS[salt])
  return dropwiseThenExcess(lab, portion(lab), reagent)
}
function nh3(salt: string, reagent = 'NH3') {
  const lab = solutionLab(SALTS[salt])
  return dropwiseThenExcess(lab, portion(lab), reagent)
}

describe('cations with aqueous sodium hydroxide (IGCSE/AS notes)', () => {
  test('Al3+: white ppt, soluble in excess giving colourless solution', () => {
    const r = naoh('Al')
    expect(r.drops).toMatch(/White precipitate forms/)
    expect(r.excess).toMatch(/white precipitate dissolves, giving a colourless solution/)
  })
  test('Ca2+: white ppt, insoluble in excess', () => {
    const r = naoh('Ca')
    expect(r.drops).toMatch(/[Ww]hite precipitate/)
    expect(r.excess).not.toMatch(/dissolves/)
  })
  test('Ba2+: only a faint white ppt', () => {
    const r = naoh('Ba', 'NaOH-2M')
    expect(r.drops + r.excess).toMatch(/faint white precipitate/)
  })
  test('Cr3+: grey-green ppt, soluble in excess giving dark green solution', () => {
    const r = naoh('Cr')
    expect(r.drops).toMatch(/[Gg]rey-green precipitate forms/)
    expect(r.excess).toMatch(/dissolves, giving a (dark )?green solution/)
  })
  test('Cu2+: pale blue ppt, insoluble in excess', () => {
    const r = naoh('Cu')
    expect(r.drops).toMatch(/[Pp]ale blue precipitate forms/)
    expect(r.excess).not.toMatch(/dissolves/)
  })
  test('Fe2+: green ppt, insoluble, turning brown near surface on standing', () => {
    const lab = solutionLab(SALTS.Fe2)
    const t = portion(lab)
    const r = dropwiseThenExcess(lab, t, 'NaOH')
    expect(r.drops).toMatch(/[Gg]reen precipitate forms/)
    expect(r.excess).not.toMatch(/dissolves/)
    const stand = text(lab.wait(180, t))
    expect(stand).toMatch(/green precipitate turns red-brown near the surface/)
  })
  test('Fe3+: red-brown ppt, insoluble in excess', () => {
    const r = naoh('Fe3')
    expect(r.drops).toMatch(/[Rr]ed-brown precipitate forms/)
    expect(r.excess).not.toMatch(/dissolves/)
  })
  test('Mg2+: white ppt, insoluble in excess', () => {
    const r = naoh('Mg')
    expect(r.drops).toMatch(/White precipitate forms/)
    expect(r.excess).not.toMatch(/dissolves/)
  })
  test('Mn2+: off-white ppt rapidly turning brown', () => {
    const lab = solutionLab(SALTS.Mn)
    const t = portion(lab)
    const r = dropwiseThenExcess(lab, t, 'NaOH')
    expect(r.drops).toMatch(/[Oo]ff-white precipitate forms/)
    expect(text(lab.wait(60, t))).toMatch(/off-white precipitate turns brown/)
  })
  test('Zn2+: white ppt, soluble in excess', () => {
    const r = naoh('Zn')
    expect(r.drops).toMatch(/White precipitate forms/)
    expect(r.excess).toMatch(/dissolves, giving a colourless solution/)
  })
  test('NH4+: no ppt; ammonia produced on warming', () => {
    const lab = solutionLab(SALTS.NH4)
    const t = portion(lab, 1, 'boiling-tube')
    const r = text(lab.addReagent(t, 'NaOH', { depth: 1 }))
    expect(r).toMatch(/No visible change/)
    expect(text(lab.gasTest(t, 'damp-red-litmus'))).toMatch(/stays red/)
    lab.heat(t, 'warm', 40)
    expect(text(lab.gasTest(t, 'damp-red-litmus'))).toMatch(/turns blue/)
  })
})

describe('cations with aqueous ammonia', () => {
  test('Al3+: white ppt insoluble in excess', () => {
    const r = nh3('Al')
    expect(r.drops).toMatch(/White precipitate forms/)
    expect(r.excess).not.toMatch(/dissolves/)
  })
  test('Ca2+: no ppt', () => {
    const r = nh3('Ca')
    expect(r.drops + r.excess).not.toMatch(/precipitate/)
  })
  test('Ba2+: no ppt', () => {
    const r = nh3('Ba', 'NH3-2M')
    expect(r.drops + r.excess).not.toMatch(/precipitate/)
  })
  test('Cr3+: grey-green ppt insoluble in excess', () => {
    const r = nh3('Cr')
    expect(r.drops).toMatch(/[Gg]rey-green precipitate forms/)
    expect(r.excess).not.toMatch(/dissolves/)
  })
  test('Cu2+: pale blue ppt soluble in excess giving deep blue solution', () => {
    const r = nh3('Cu')
    expect(r.drops).toMatch(/[Pp]ale blue precipitate forms/)
    expect(r.excess).toMatch(/dissolves, giving a deep blue solution/)
  })
  test('Fe2+ / Fe3+ / Mg2+ / Mn2+: ppt insoluble in excess', () => {
    for (const [s, c] of [['Fe2', /[Gg]reen/], ['Fe3', /[Rr]ed-brown/], ['Mg', /White/], ['Mn', /[Oo]ff-white/]] as const) {
      const r = nh3(s)
      expect(r.drops).toMatch(c)
      expect(r.excess).not.toMatch(/dissolves/)
    }
  })
  test('Zn2+: white ppt soluble in excess', () => {
    const r = nh3('Zn')
    expect(r.drops).toMatch(/White precipitate forms/)
    expect(r.excess).toMatch(/dissolves, giving a colourless solution/)
  })
})

describe('flame tests', () => {
  const cases: [Record<string, number>, RegExp][] = [
    [{ 'Li+': 0.5, 'Cl-': 0.5 }, /Red flame/],
    [{ 'Na+': 0.5, 'Cl-': 0.5 }, /Yellow flame/],
    [{ 'K+': 0.5, 'Cl-': 0.5 }, /Lilac flame/],
    [{ 'Ca2+': 0.5, 'Cl-': 1 }, /Orange-red flame/],
    [{ 'Ba2+': 0.5, 'Cl-': 1 }, /Light green flame/],
    [{ 'Cu2+': 0.5, 'Cl-': 1 }, /Blue-green flame/],
    [{ 'K+': 0.5, 'Na+': 0.3, 'Cl-': 0.8 }, /Yellow flame/],
  ]
  test.each(cases)('%o', (conc, expected) => {
    const lab = solutionLab(conc)
    expect(text(lab.flameTest('X'))).toMatch(expected)
  })
})
