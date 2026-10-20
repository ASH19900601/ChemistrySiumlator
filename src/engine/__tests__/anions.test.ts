import { describe, expect, test } from 'vitest'
import { portion, solutionLab, text } from './helpers'

describe('anion tests (IGCSE/AS notes)', () => {
  test('carbonate: effervescence with dilute acid, gas turns limewater milky', () => {
    const lab = solutionLab({ 'Na+': 1, 'CO3 2-': 0.5 })
    const t = portion(lab, 2)
    expect(text(lab.addReagent(t, 'HNO3', { depth: 2 }))).toMatch(/Effervescence/)
    expect(text(lab.gasTest(t, 'limewater'))).toMatch(/milky/)
  })
  test('a few drops of acid on carbonate do not fizz at first (hydrogencarbonate forms first)', () => {
    const lab = solutionLab({ 'Na+': 1, 'CO3 2-': 0.5 })
    const t = portion(lab, 2)
    expect(text(lab.addReagent(t, 'HNO3', { drops: 1 }))).not.toMatch(/Effervescence/)
  })
  test.each([
    ['Cl-', /White precipitate forms/, /dissolves, giving a colourless solution/],
    ['Br-', /Cream precipitate forms/, /partially dissolves/],
    ['I-', /Yellow precipitate forms/, /^No visible change/],
  ])('halide %s with acidified silver nitrate, then aqueous ammonia', (ion, ppt, nh3) => {
    const lab = solutionLab({ 'Na+': 0.1, [ion]: 0.1 })
    const t = portion(lab, 1, 'boiling-tube')
    lab.addReagent(t, 'HNO3', { depth: 1 })
    expect(text(lab.addReagent(t, 'AgNO3', { drops: 5 }))).toMatch(ppt)
    expect(text(lab.addReagent(t, 'NH3-2M', { depth: 3 }))).toMatch(nh3)
  })
  test('nitrate: NaOH + aluminium foil, warm: ammonia', () => {
    const lab = solutionLab({ 'Na+': 0.2, 'NO3-': 0.2 })
    const t = portion(lab, 1, 'boiling-tube')
    lab.addReagent(t, 'NaOH', { depth: 1 })
    lab.addReagent(t, 'Al-foil', { pieces: 1 })
    lab.heat(t, 'warm', 60)
    expect(text(lab.gasTest(t, 'damp-red-litmus'))).toMatch(/turns blue/)
  })
  test('no nitrate: aluminium + NaOH gives hydrogen bubbles but no ammonia', () => {
    const lab = solutionLab({ 'Na+': 0.2, 'Cl-': 0.2 })
    const t = portion(lab, 1, 'boiling-tube')
    lab.addReagent(t, 'NaOH', { depth: 1 })
    lab.addReagent(t, 'Al-foil', { pieces: 1 })
    const warm = text(lab.heat(t, 'warm', 60))
    expect(warm).toMatch(/Effervescence/)
    expect(text(lab.gasTest(t, 'damp-red-litmus'))).toMatch(/stays red/)
  })
  test('nitrite decolourises acidified KMnO4; nitrate does not', () => {
    const a = solutionLab({ 'Na+': 0.2, 'NO2-': 0.2 })
    const ta = portion(a)
    expect(text(a.addReagent(ta, 'KMnO4-H+', { drops: 3 }))).not.toMatch(/purple|pink/)
    const b = solutionLab({ 'Na+': 0.2, 'NO3-': 0.2 })
    const tb = portion(b)
    expect(text(b.addReagent(tb, 'KMnO4-H+', { drops: 3 }))).toMatch(/pink|purple/)
  })
  test('nitrite with dilute acid gives brown gas', () => {
    const a = solutionLab({ 'Na+': 0.2, 'NO2-': 0.2 })
    const ta = portion(a)
    const r = text(a.addReagent(ta, 'H2SO4', { depth: 1 })) + text(a.wait(20, ta))
    expect(r).toMatch(/[Bb]rown gas/)
  })
  test('sulfate: acidified barium nitrate gives white ppt', () => {
    const lab = solutionLab({ 'Na+': 0.2, 'SO4 2-': 0.1 })
    const t = portion(lab)
    lab.addReagent(t, 'HNO3', { depth: 1 })
    expect(text(lab.addReagent(t, 'Ba(NO3)2', { drops: 5 }))).toMatch(/White precipitate forms/)
  })
  test('sulfite: white ppt with Ba2+ that dissolves in excess dilute strong acid; decolourises KMnO4', () => {
    const lab = solutionLab({ 'Na+': 0.2, 'SO3 2-': 0.1 })
    const t = portion(lab, 1, 'boiling-tube')
    expect(text(lab.addReagent(t, 'BaCl2', { depth: 1 }))).toMatch(/White precipitate forms/)
    expect(text(lab.addReagent(t, 'HCl-2M', { depth: 2 }))).toMatch(/precipitate dissolves/)
    const t2 = portion(lab)
    expect(text(lab.addReagent(t2, 'KMnO4-H+', { drops: 3 }))).not.toMatch(/purple|pink/)
  })
  test('sulfite: sulfur dioxide on warming with acid turns acidified dichromate green', () => {
    const lab = solutionLab({ 'Na+': 0.4, 'SO3 2-': 0.2 })
    const t = portion(lab, 1, 'boiling-tube')
    lab.addReagent(t, 'HCl', { depth: 1 })
    lab.heat(t, 'warm', 30)
    expect(text(lab.gasTest(t, 'acidified-dichromate-paper'))).toMatch(/green/)
  })
  test('thiosulfate: pale yellow / off-white ppt slowly with acid', () => {
    const lab = solutionLab({ 'Na+': 0.2, 'S2O3 2-': 0.1 })
    const t = portion(lab)
    const first = text(lab.addReagent(t, 'HCl', { depth: 1 }))
    expect(first).not.toMatch(/precipitate/)
    expect(text(lab.wait(60, t))).toMatch(/[Pp]ale yellow precipitate/)
  })
  test('iodine with starch gives blue-black', () => {
    const lab = solutionLab({ 'K+': 0.1, 'I-': 0.1 })
    const t = portion(lab)
    lab.addReagent(t, 'H2SO4', { drops: 5 })
    lab.addReagent(t, 'H2O2', { depth: 1 })
    lab.wait(20, t)
    expect(text(lab.addReagent(t, 'starch', { drops: 5 }))).toMatch(/blue-black/)
  })
})

describe('gases', () => {
  test('hydrogen pops; magnesium in acid', () => {
    const lab = solutionLab({ 'H+': 1, 'Cl-': 1 })
    const t = portion(lab, 2)
    expect(text(lab.addReagent(t, 'Mg-ribbon', { pieces: 1 }))).toMatch(/Effervescence/)
    expect(text(lab.gasTest(t, 'lighted-splint'))).toMatch(/squeaky pop/)
  })
  test('oxygen relights a glowing splint: MnO2 + H2O2', () => {
    const lab = solutionLab({ H2O2: 0.8 })
    const t = portion(lab, 2)
    expect(text(lab.addReagent(t, 'MnO2', { spatula: 'small' }))).toMatch(/Effervescence/)
    expect(text(lab.gasTest(t, 'glowing-splint'))).toMatch(/relights/)
  })
})
