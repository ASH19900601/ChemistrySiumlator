// Realistic consequences of procedural choices and mistakes: the engine must not depend on
// "the right answer", only on what is actually in the tube.
import { describe, expect, test } from 'vitest'
import { portion, solutionLab, text } from './helpers'

describe('order of addition and existing contents', () => {
  test('NaOH added to an acidified iron(III) solution: first drops only neutralise the acid', () => {
    const lab = solutionLab({ 'Fe3+': 0.1, 'Cl-': 0.3 })
    const t = portion(lab)
    lab.addReagent(t, 'HNO3', { depth: 1 })
    const first = text(lab.addReagent(t, 'NaOH', { drops: 3 }))
    expect(first).not.toMatch(/precipitate/)
    const more = text(lab.addReagent(t, 'NaOH', { cm3: 3 }))
    expect(more).toMatch(/[Rr]ed-brown precipitate forms/)
  })

  test('acidifying with HCl before AgNO3 gives a white ppt even with no chloride in the sample', () => {
    const lab = solutionLab({ 'Na+': 0.2, 'SO4 2-': 0.1 })
    const ok = portion(lab)
    lab.addReagent(ok, 'HNO3', { depth: 1 })
    expect(text(lab.addReagent(ok, 'AgNO3', { drops: 5 }))).not.toMatch(/White precipitate/)
    const wrong = portion(lab)
    lab.addReagent(wrong, 'HCl', { depth: 1 })
    expect(text(lab.addReagent(wrong, 'AgNO3', { drops: 5 }))).toMatch(/White precipitate forms/)
  })

  test('forgetting to acidify: carbonate gives a white ppt with barium nitrate (false sulfate)', () => {
    const lab = solutionLab({ 'Na+': 1, 'CO3 2-': 0.5 })
    const t = portion(lab)
    expect(text(lab.addReagent(t, 'Ba(NO3)2', { drops: 5 }))).toMatch(/White precipitate forms/)
    expect(text(lab.addReagent(t, 'HNO3', { depth: 2 }))).toMatch(/precipitate dissolves|Effervescence/)
  })

  test('forgetting to acidify: carbonate gives a pale yellow ppt with silver nitrate', () => {
    const lab = solutionLab({ 'Na+': 1, 'CO3 2-': 0.5 })
    const t = portion(lab)
    expect(text(lab.addReagent(t, 'AgNO3', { drops: 5 }))).toMatch(/[Pp]ale yellow precipitate/)
  })

  test('left-over hydrogen peroxide in the tube still decolourises KMnO4, now with effervescence (O2)', () => {
    const lab = solutionLab({ 'Fe2+': 0.1, 'SO4 2-': 0.1 })
    const fresh = portion(lab)
    const a = text(lab.addReagent(fresh, 'KMnO4-H+', { drops: 3 }))
    expect(a).not.toMatch(/pink|purple|Effervescence/)
    const used = portion(lab)
    lab.addReagent(used, 'H2O2', { depth: 1 })
    lab.wait(5, used)
    const b = text(lab.addReagent(used, 'KMnO4-H+', { drops: 3 }))
    expect(b).not.toMatch(/pink|purple/)
    expect(b).toMatch(/Effervescence/)
  })

  test('iron(III) alone does not decolourise acidified KMnO4', () => {
    const lab = solutionLab({ 'Fe3+': 0.05, 'SO4 2-': 0.075 })
    const t = portion(lab)
    expect(text(lab.addReagent(t, 'KMnO4-H+', { drops: 3 }))).toMatch(/pink|purple|orange/)
  })

  test('re-using an un-rinsed tube: traces of chloride from a previous test cloud AgNO3', () => {
    const lab = solutionLab({ 'Na+': 0.5, 'Cl-': 0.5 })
    const t = portion(lab)
    lab.empty(t)
    // now test a nitrate solution in the same tube without rinsing
    lab.addReagent(t, 'water', { depth: 1 })
    lab.addReagent(t, 'HNO3', { depth: 1 })
    expect(text(lab.addReagent(t, 'AgNO3', { drops: 5 }))).toMatch(/precipitate/)
  })

  test('a rinsed tube does not carry over the previous contents', () => {
    const lab = solutionLab({ 'Na+': 0.5, 'Cl-': 0.5 })
    const t = portion(lab)
    lab.rinse(t)
    lab.addReagent(t, 'water', { depth: 1 })
    lab.addReagent(t, 'HNO3', { depth: 1 })
    expect(text(lab.addReagent(t, 'AgNO3', { drops: 5 }))).not.toMatch(/precipitate/)
  })

  test('tap water instead of distilled water gives a faint cloudiness with silver nitrate', () => {
    const lab = solutionLab({})
    const t = lab.newVessel('test-tube').id
    lab.addReagent(t, 'tap-water', { depth: 2 })
    lab.addReagent(t, 'HNO3', { drops: 5 })
    expect(text(lab.addReagent(t, 'AgNO3', { drops: 5 }))).toMatch(/faint white precipitate/)
  })

  test('aluminium ions with a large excess of NaOH poured in at once: precipitate seen only momentarily', () => {
    const lab = solutionLab({ 'Al3+': 0.1, 'SO4 2-': 0.15 })
    const t = portion(lab)
    expect(text(lab.addReagent(t, 'NaOH', { cm3: 4 }))).toMatch(/forms but dissolves again/)
  })

  test('acid added to the zincate solution re-precipitates zinc hydroxide, then dissolves it', () => {
    const lab = solutionLab({ 'Zn2+': 0.1, 'SO4 2-': 0.1 })
    const t = portion(lab, 1, 'boiling-tube')
    lab.addReagent(t, 'NaOH', { cm3: 4 })
    const back = text(lab.addReagent(t, 'HNO3', { cm3: 3.6 }))
    expect(back).toMatch(/White precipitate/)
    expect(text(lab.addReagent(t, 'HNO3', { cm3: 4 }))).toMatch(/dissolves/)
  })

  test('acidifying the deep blue copper-ammonia complex brings back the pale blue colour', () => {
    const lab = solutionLab({ 'Cu2+': 0.1, 'SO4 2-': 0.1 })
    const t = portion(lab, 1, 'boiling-tube')
    lab.addReagent(t, 'NH3', { cm3: 6 })
    const r = text(lab.addReagent(t, 'HNO3', { cm3: 12 }))
    expect(r).toMatch(/deep blue/)
    expect(r).toMatch(/pale blue|colourless/)
  })

  test('diammine silver(I) acidified: white AgCl returns', () => {
    const lab = solutionLab({ 'Na+': 0.1, 'Cl-': 0.1 })
    const t = portion(lab, 1, 'boiling-tube')
    lab.addReagent(t, 'AgNO3', { drops: 10 })
    lab.addReagent(t, 'NH3', { cm3: 4 })
    expect(text(lab.addReagent(t, 'HNO3', { cm3: 8 }))).toMatch(/white precipitate/i)
  })

  test('warming the ammonium + NaOH mixture drives off ammonia; once cold and depleted the test fails', () => {
    const lab = solutionLab({ 'NH4+': 0.05, 'Cl-': 0.05 })
    const t = portion(lab, 1, 'boiling-tube')
    lab.addReagent(t, 'NaOH', { depth: 1 })
    lab.heat(t, 'boil', 180)
    lab.wait(240, t)
    expect(text(lab.gasTest(t, 'damp-red-litmus'))).toMatch(/stays red/)
  })

  test('iron(II) hydroxide left standing a long time turns largely brown', () => {
    const lab = solutionLab({ 'Fe2+': 0.1, 'SO4 2-': 0.1 })
    const t = portion(lab)
    lab.addReagent(t, 'NaOH', { cm3: 1 })
    const r = text(lab.wait(1800, t))
    expect(r).toMatch(/turns red-brown/)
  })
})
