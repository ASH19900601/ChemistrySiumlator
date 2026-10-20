// Cambridge IGCSE Chemistry 0620, Paper 5 (Practical Test), Question 2.
// Question wording follows the published question papers; unknowns follow the confidential
// instructions (materials lists).

import type { ActionResult, Lab } from '../engine'
import type { PaperCase } from './types'

export const t = (...rs: ActionResult[]) => rs.flatMap((r) => r.observations.map((o) => o.text)).join(' ')

const IG_BENCH_BASE = ['water', 'NaOH', 'HNO3', 'AgNO3', 'Ba(NO3)2']

// ------------------------------------------------------------------------------------------
export const P0620_s24_51: PaperCase = {
  id: '0620_s24_51',
  syllabus: 'Cambridge IGCSE Chemistry 0620',
  level: 'IGCSE',
  series: 'May/June 2024',
  component: 'Paper 51 (Practical Test)',
  question: 2,
  totalMarks: 14,
  summary: 'One solid, E, containing three ions.',
  samples: [
    { id: 'E', label: 'solid E', kind: 'solid', solid: [{ compound: '(NH4)2SO4', grams: 0.667 }, { compound: 'KCr(SO4)2.12H2O', grams: 1.333 }] },
  ],
  reagents: [...IG_BENCH_BASE, 'NaHCO3', 'KMnO4-H+'],
  intro:
    'You are provided with one solid: solid E.\nDo the following tests on solid E, recording all of your observations at each stage.\n\nTests on solid E\nDivide solid E into two approximately equal portions in two boiling tubes.',
  parts: [
    { id: 'a', label: '(a)', text: 'Gently heat the first portion of solid E.\nRecord your observations.', marks: 2, answer: { kind: 'lines', lines: 3 },
      markScheme: ['Any two from: melts / dissolves / forms a liquid; condensation on tube; becomes green [2]'] },
    { id: 'b-i', label: '(b)(i)',
      preamble: 'To the remaining portion of solid E, add about 5 cm depth of distilled water. Place a stopper in the boiling tube and shake to dissolve solid E and form solution E. Divide solution E into four approximately equal portions in one boiling tube and three test-tubes.',
      text: 'To the first portion of solution E in the boiling tube, add aqueous sodium hydroxide dropwise and then in excess.\nKeep the product formed for use in (b)(ii).\nRecord your observations.', marks: 2, answer: { kind: 'lines', lines: 3 },
      markScheme: ['M1 green precipitate [1]', 'M2 dissolves / forms a solution [1]'] },
    { id: 'b-ii', label: '(b)(ii)', text: 'Transfer about 2 cm depth of the product from (b)(i) to another boiling tube. Gently warm the mixture and test any gas given off.\nRecord your observations.', marks: 1, answer: { kind: 'lines', lines: 2 },
      markScheme: ['(red) litmus turns blue [1]'] },
    { id: 'b-iii', label: '(b)(iii)', text: 'Identify the gas given off in (b)(ii).', marks: 1, answer: { kind: 'lines', lines: 1 },
      markScheme: ['ammonia / NH₃ [1]'] },
    { id: 'c', label: '(c)', text: 'To the second portion of solution E, add about 4 cm depth of aqueous sodium hydrogencarbonate.\nRecord your observations.', marks: 2, answer: { kind: 'lines', lines: 2 },
      markScheme: ['M1 green precipitate [1]', 'M2 fizzing / effervescence / bubbles [1]'] },
    { id: 'd-i', label: '(d)(i)', text: 'To the third portion of solution E, add a few drops of acidified aqueous potassium manganate(VII).\nRecord your observations.', marks: 1, answer: { kind: 'lines', lines: 2 },
      markScheme: ['(solution) becomes pink [1]'] },
    { id: 'd-ii', label: '(d)(ii)', text: 'State the conclusion that can be made from the result of the test in (d)(i).', marks: 1, answer: { kind: 'lines', lines: 2 },
      markScheme: ['not a sulfite / no SO₃²⁻ [1]'] },
    { id: 'e', label: '(e)', text: 'To the fourth portion of solution E, add about 1 cm depth of dilute nitric acid and a few drops of aqueous barium nitrate. Leave the mixture to stand for about two minutes.\nRecord your observations.', marks: 1, answer: { kind: 'lines', lines: 2 },
      markScheme: ['white precipitate [1]'] },
    { id: 'f', label: '(f)', text: 'Identify the three ions in solid E.', marks: 3, answer: { kind: 'lines', lines: 3 },
      markScheme: ['M1 chromium(III) / Cr³⁺ [1]', 'M2 ammonium / NH₄⁺ [1]', 'M3 sulfate / SO₄²⁻ [1]'] },
  ],
  identities: ['Solid E: homogeneous mixture of ammonium sulfate and chrome alum, KCr(SO₄)₂·12H₂O, 1 : 2 by mass (2 g).'],
  supervisor(lab: Lab) {
    const E = lab.sampleVessel('E')
    const h = lab.newVessel('boiling-tube', 'boiling tube (heat)')
    lab.transfer(E.id, h.id, { fraction: 0.5 })
    const a = t(lab.heat(h.id, 'gentle', 40))
    lab.addReagent(E.id, 'water', { depth: 5 })
    const [b, t1, t2, t3] = lab.divide(E.id, ['boiling-tube', 'test-tube', 'test-tube', 'test-tube']).vesselIds
    const bi: ActionResult[] = []
    for (let i = 0; i < 6; i++) bi.push(lab.addReagent(b, 'NaOH', { drops: 2 }))
    bi.push(lab.addReagent(b, 'NaOH', { cm3: 6 }))
    const w = lab.newVessel('boiling-tube')
    lab.transfer(b, w.id, { depth: 2 })
    lab.heat(w.id, 'warm', 40)
    const bii = t(lab.gasTest(w.id, 'damp-red-litmus'))
    const c = t(lab.addReagent(t1, 'NaHCO3', { depth: 4 }))
    const d = t(lab.addReagent(t2, 'KMnO4-H+', { drops: 5 }))
    const e = t(lab.addReagent(t3, 'HNO3', { depth: 1 }), lab.addReagent(t3, 'Ba(NO3)2', { drops: 5 }), lab.wait(120, t3))
    return { a, 'b-i': t(...bi), 'b-ii': bii, c, 'd-i': d, e }
  },
}

// ------------------------------------------------------------------------------------------
export const P0620_w24_52: PaperCase = {
  id: '0620_w24_52',
  syllabus: 'Cambridge IGCSE Chemistry 0620',
  level: 'IGCSE',
  series: 'October/November 2024',
  component: 'Paper 52 (Practical Test)',
  question: 2,
  totalMarks: 15,
  summary: 'Two solids: solid M and solid N.',
  samples: [
    { id: 'M', label: 'solid M', kind: 'solid', solid: [{ compound: 'FeSO4.7H2O', grams: 1.5 }, { compound: 'NaBr', grams: 1.5 }], container: 'test-tube' },
    { id: 'N', label: 'solid N', kind: 'solid', solid: [{ compound: '(NH4)2CO3', grams: 2 }], container: 'test-tube' },
  ],
  reagents: ['water', 'NaOH', 'H2SO4', 'H2O2-20vol', 'Mg-ribbon', 'HNO3', 'AgNO3'],
  intro: 'You are provided with two solids: solid M and solid N.\nDo the following tests on solid M and solid N. Record all of your observations at each stage.\n\nTests on solid M',
  parts: [
    { id: 'a', label: '(a)', text: 'Carry out a flame test on solid M.\nRecord your observations.', marks: 1, answer: { kind: 'lines', lines: 1 },
      markScheme: ['yellow (flame colour) [1]'] },
    { id: 'b', label: '(b)',
      preamble: 'Transfer the remaining solid M to a boiling tube. Add about 5 cm depth of distilled water to solid M, place a stopper in the boiling tube and shake the boiling tube to dissolve solid M and form solution M.\nDivide solution M into four approximately equal portions in one boiling tube and three test-tubes.',
      text: 'To the first portion of solution M in the boiling tube, add aqueous sodium hydroxide dropwise until it is in excess.\nRecord your observations.', marks: 2, answer: { kind: 'lines', lines: 2 },
      markScheme: ['M1 green precipitate [1]', 'M2 remains in excess [1]'] },
    { id: 'c', label: '(c)', text: 'To the second portion of solution M in a test-tube, add the piece of magnesium ribbon.\nRecord your observations.', marks: 1, answer: { kind: 'lines', lines: 2 },
      markScheme: ['fizzing / bubbles / effervescence [1]'] },
    { id: 'd', label: '(d)', text: 'To the third portion of solution M in a test-tube, add about 2 cm depth of aqueous hydrogen peroxide.\nRecord your observations.', marks: 2, answer: { kind: 'lines', lines: 2 },
      markScheme: ['M1 effervescence / fizzing / bubbles [1]', 'M2 becomes orange / brown [1]'] },
    { id: 'e', label: '(e)', text: 'To the fourth portion of solution M in a test-tube, add about 1 cm depth of dilute nitric acid followed by a few drops of aqueous silver nitrate. Leave the mixture to stand for about two minutes.\nRecord your observations.', marks: 1, answer: { kind: 'lines', lines: 2 },
      markScheme: ['cream precipitate [1]'] },
    { id: 'f', label: '(f)', text: 'Identify the three ions in solid M.', marks: 3, answer: { kind: 'lines', lines: 3 },
      markScheme: ['M1 sodium / Na⁺ [1]', 'M2 iron(II) / Fe²⁺ [1]', 'M3 bromide / Br⁻ [1]'] },
    { id: 'g', label: '(g)', preamble: 'Tests on solid N',
      text: 'Transfer approximately half of solid N to a boiling tube. Add about 5 cm depth of dilute sulfuric acid to the boiling tube. Test any gas produced.\nRecord your observations.', marks: 2, answer: { kind: 'lines', lines: 2 },
      markScheme: ['M1 effervescence / fizzing / bubbles [1]', 'M2 limewater turns milky [1]'] },
    { id: 'h', label: '(h)', text: 'Add the remaining solid N to a boiling tube and add about 2 cm depth of distilled water. Do not place a stopper in the boiling tube.\nShake the boiling tube carefully to dissolve solid N and form solution N.\nTo solution N, add about 2 cm depth of aqueous sodium hydroxide. Gently warm the mixture and test any gas given off.\nRecord your observations.', marks: 1, answer: { kind: 'lines', lines: 2 },
      markScheme: ['(damp red) litmus (paper) turns blue [1]'] },
    { id: 'i', label: '(i)', text: 'Identify solid N.', marks: 2, answer: { kind: 'lines', lines: 1 },
      markScheme: ['ammonium carbonate / (NH₄)₂CO₃ [2]'] },
  ],
  identities: [
    'Solid M: 50 : 50 mixture by mass of iron(II) sulfate, FeSO₄·7H₂O, and sodium bromide, NaBr (3 g).',
    'Solid N: ammonium carbonate, (NH₄)₂CO₃ (2 g).',
  ],
  supervisor(lab: Lab) {
    const M = lab.sampleVessel('M')
    const a = t(lab.flameTest(M.id))
    const bt = lab.newVessel('boiling-tube', 'boiling tube M')
    lab.transfer(M.id, bt.id, { all: true })
    lab.addReagent(bt.id, 'water', { depth: 5 })
    const [b, t1, t2, t3] = lab.divide(bt.id, ['boiling-tube', 'test-tube', 'test-tube', 'test-tube']).vesselIds
    const br: ActionResult[] = []
    for (let i = 0; i < 6; i++) br.push(lab.addReagent(b, 'NaOH', { drops: 2 }))
    br.push(lab.addReagent(b, 'NaOH', { cm3: 5 }))
    const c = t(lab.addReagent(t1, 'Mg-ribbon', { pieces: 1 }), lab.wait(30, t1))
    const d = t(lab.addReagent(t2, 'H2O2-20vol', { depth: 2 }), lab.wait(20, t2))
    const e = t(lab.addReagent(t3, 'HNO3', { depth: 1 }), lab.addReagent(t3, 'AgNO3', { drops: 5 }), lab.wait(120, t3))
    const N = lab.sampleVessel('N')
    const g1 = lab.newVessel('boiling-tube')
    lab.transfer(N.id, g1.id, { fraction: 0.5 })
    const g = t(lab.addReagent(g1.id, 'H2SO4', { depth: 5 }), lab.gasTest(g1.id, 'limewater'))
    const h1 = lab.newVessel('boiling-tube')
    lab.transfer(N.id, h1.id, { all: true })
    lab.addReagent(h1.id, 'water', { depth: 2 })
    lab.addReagent(h1.id, 'NaOH', { depth: 2 })
    lab.heat(h1.id, 'warm', 30)
    const h = t(lab.gasTest(h1.id, 'damp-red-litmus'))
    return { a, b: t(...br), c, d, e, g, h }
  },
}

// ------------------------------------------------------------------------------------------
export const P0620_s23_51: PaperCase = {
  id: '0620_s23_51',
  syllabus: 'Cambridge IGCSE Chemistry 0620',
  level: 'IGCSE',
  series: 'May/June 2023',
  component: 'Paper 51 (Practical Test)',
  question: 2,
  totalMarks: 18,
  summary: 'One solid, E, containing three ions.',
  samples: [{ id: 'E', label: 'solid E', kind: 'solid', solid: [{ compound: 'NH4Fe(SO4)2.12H2O', grams: 2.5 }] }],
  reagents: ['water', 'NaOH', 'HNO3', 'AgNO3', 'Ba(NO3)2', 'Na2S2O3-0.25', 'Na2CO3', 'KI-0.2', 'starch', 'KMnO4-H+-0.02'],
  intro: 'You are provided with solid E.\nDo the following tests on solid E, recording all of your observations at each stage.\n\nTests on solid E\nDivide solid E into two approximately equal portions in two boiling tubes.',
  parts: [
    { id: 'a', label: '(a)', text: 'Gently heat the first portion of solid E.\nRecord your observations.', marks: 2, answer: { kind: 'lines', lines: 3 },
      markScheme: ['M1 dissolves / forms a solution [1]', 'M2 steam given off / condensation on tube [1]'] },
    { id: 'b', label: '(b)', text: 'State what conclusion can be made about solid E from the observations in (a).', marks: 1, answer: { kind: 'lines', lines: 1 },
      markScheme: ['hydrated / contains water [1]'] },
    { id: 'c', label: '(c)',
      preamble: 'Add about 15 cm³ of distilled water to the boiling tube containing the second portion of solid E. Place a stopper in the boiling tube and shake the tube to dissolve solid E and form solution E.\nDivide solution E into seven approximately equal portions in one boiling tube and six test-tubes.',
      text: 'To the first portion of solution E in the boiling tube, add aqueous sodium hydroxide dropwise and then in excess.\nKeep the product for use in (d).\nRecord your observations.', marks: 2, answer: { kind: 'lines', lines: 2 },
      markScheme: ['M1 red-brown precipitate [1]', 'M2 remains / does not dissolve in excess / red-brown precipitate [1]'] },
    { id: 'd', label: '(d)', text: 'Transfer about 2 cm depth of the product from (c) into a clean boiling tube.\nWarm the mixture gently. Test and identify the gas produced.', marks: 2, answer: { kind: 'fields', fields: ['test result', 'identity of gas'] },
      markScheme: ['M1 (red) litmus turns blue [1]', 'M2 ammonia / NH₃ [1]'] },
    { id: 'e', label: '(e)', text: 'To the second portion of solution E, add about 1 cm depth of aqueous sodium thiosulfate. Leave the mixture to stand for about three minutes.\nRecord your observations.', marks: 2, answer: { kind: 'lines', lines: 2 },
      markScheme: ['M1 (solution) turns red / black / purple [1]', 'M2 becomes yellow / paler / lighter on standing [1]'] },
    { id: 'f', label: '(f)', text: 'To the third portion of solution E, add about 1 cm depth of dilute nitric acid followed by a few drops of aqueous barium nitrate.\nRecord your observations.', marks: 1, answer: { kind: 'lines', lines: 1 },
      markScheme: ['white precipitate [1]'] },
    { id: 'g', label: '(g)', text: 'To the fourth portion of solution E, add about 1 cm depth of dilute nitric acid followed by a few drops of aqueous silver nitrate.\nRecord your observations.', marks: 1, answer: { kind: 'lines', lines: 1 },
      markScheme: ['no change / no reaction [1]'] },
    { id: 'h', label: '(h)', text: 'To the fifth portion of solution E, add about 2 cm depth of aqueous sodium carbonate.\nRecord your observations.', marks: 1, answer: { kind: 'lines', lines: 1 },
      markScheme: ['red-brown ppt [1]'] },
    { id: 'i', label: '(i)', text: 'To the sixth portion of solution E, add about 1 cm depth of aqueous potassium iodide followed by about 1 cm depth of starch solution.\nRecord your observations.', marks: 2, answer: { kind: 'lines', lines: 2 },
      markScheme: ['M1 brown [1]', 'M2 (blue-)black (when starch added) [1]'] },
    { id: 'j', label: '(j)', text: 'To the seventh portion of solution E add a few drops of acidified aqueous potassium manganate(VII).\nRecord your observations.', marks: 1, answer: { kind: 'lines', lines: 1 },
      markScheme: ['pink solution [1]'] },
    { id: 'k', label: '(k)', text: 'Identify the three ions in solid E.', marks: 3, answer: { kind: 'lines', lines: 3 },
      markScheme: ['M1 ammonium / NH₄⁺ [1]', 'M2 iron(III) / Fe³⁺ [1]', 'M3 sulfate / SO₄²⁻ [1]'] },
  ],
  identities: ['Solid E: ammonium iron(III) sulfate, NH₄Fe(SO₄)₂·12H₂O (iron alum), 2.5 g.'],
  supervisor(lab: Lab) {
    const E = lab.sampleVessel('E')
    const h = lab.newVessel('boiling-tube')
    lab.transfer(E.id, h.id, { fraction: 0.5 })
    const a = t(lab.heat(h.id, 'gentle', 40))
    lab.addReagent(E.id, 'water', { cm3: 15 })
    const ids = lab.divide(E.id, ['boiling-tube', 'test-tube', 'test-tube', 'test-tube', 'test-tube', 'test-tube', 'test-tube']).vesselIds
    const c: ActionResult[] = []
    for (let i = 0; i < 6; i++) c.push(lab.addReagent(ids[0], 'NaOH', { drops: 2 }))
    c.push(lab.addReagent(ids[0], 'NaOH', { cm3: 5 }))
    const w = lab.newVessel('boiling-tube')
    lab.transfer(ids[0], w.id, { depth: 2 })
    lab.heat(w.id, 'warm', 40)
    const d = t(lab.gasTest(w.id, 'damp-red-litmus'))
    const e1 = t(lab.addReagent(ids[1], 'Na2S2O3-0.25', { depth: 1 }))
    const e2 = t(lab.wait(180, ids[1]))
    const f = t(lab.addReagent(ids[2], 'HNO3', { depth: 1 }), lab.addReagent(ids[2], 'Ba(NO3)2', { drops: 5 }))
    const g = t(lab.addReagent(ids[3], 'HNO3', { depth: 1 }), lab.addReagent(ids[3], 'AgNO3', { drops: 5 }))
    const hh = t(lab.addReagent(ids[4], 'Na2CO3', { depth: 2 }))
    const i1 = t(lab.addReagent(ids[5], 'KI-0.2', { depth: 1 }))
    const i2 = t(lab.addReagent(ids[5], 'starch', { depth: 1 }))
    const j = t(lab.addReagent(ids[6], 'KMnO4-H+-0.02', { drops: 5 }))
    return { a, c: t(...c), d, e: `${e1} | on standing: ${e2}`, f, g, h: hh, i: `${i1} | starch: ${i2}`, j }
  },
}

// ------------------------------------------------------------------------------------------
export const P0620_s24_52: PaperCase = {
  id: '0620_s24_52',
  syllabus: 'Cambridge IGCSE Chemistry 0620',
  level: 'IGCSE',
  series: 'May/June 2024',
  component: 'Paper 52 (Practical Test)',
  question: 2,
  totalMarks: 18,
  summary: 'Two substances: solid H and solid I.',
  samples: [
    { id: 'H', label: 'solid H', kind: 'solid', solid: [{ compound: 'BaCO3', grams: 0.5 }] },
    { id: 'I', label: 'solid I', kind: 'solid', solid: [{ compound: 'NH4Cl', grams: 1 }] },
  ],
  reagents: ['water', 'KMnO4-H+', 'HNO3', 'HCl', 'H2SO4', 'NaOH', 'NH3', 'Ba(NO3)2', 'AgNO3'],
  intro: 'You are provided with two substances: solid H and solid I.\nDo the following tests on the substances, recording all of your observations at each stage.\n\nTests on solid H',
  parts: [
    { id: 'a-i', label: '(a)(i)', text: 'Add about 10 cm³ of dilute hydrochloric acid to the sample of solid H in the boiling tube.\nTest any gas produced.\nKeep the solution produced for use in (b), (c), (d) and (e).\nRecord your observations.', marks: 3, answer: { kind: 'lines', lines: 3 },
      markScheme: ['effervescence / fizzing / bubbles [1]', 'solid disappears / dissolves [1]', 'limewater turns milky [1]'] },
    { id: 'a-ii', label: '(a)(ii)', text: 'Identify the gas made in (a)(i).', marks: 1, answer: { kind: 'lines', lines: 1 },
      markScheme: ['carbon dioxide / CO₂ [1]'] },
    { id: 'b', label: '(b)', preamble: 'The solution produced in (a)(i) is solution J. Divide solution J into four approximately equal portions in four test-tubes.',
      text: 'Carry out a flame test on the first portion of solution J.\nRecord your observations.', marks: 1, answer: { kind: 'lines', lines: 1 },
      markScheme: ['(pale / light) green (flame) [1]'] },
    { id: 'c-i', label: '(c)(i)', text: 'To the second portion of solution J, add a few drops of acidified aqueous potassium manganate(VII).\nRecord your observations.', marks: 1, answer: { kind: 'lines', lines: 1 },
      markScheme: ['pink [1]'] },
    { id: 'c-ii', label: '(c)(ii)', text: 'State what conclusion can be made from the result in (c)(i).', marks: 1, answer: { kind: 'lines', lines: 1 },
      markScheme: ['not a sulfite / SO₃²⁻ [1]'] },
    { id: 'd', label: '(d)', text: 'To the third portion of solution J, add a few drops of dilute sulfuric acid.\nRecord your observations.', marks: 1, answer: { kind: 'lines', lines: 1 },
      markScheme: ['white precipitate [1]'] },
    { id: 'e', label: '(e)', text: 'To the fourth portion of solution J, add about 1 cm depth of dilute nitric acid followed by a few drops of aqueous barium nitrate.\nRecord your observations.', marks: 1, answer: { kind: 'lines', lines: 1 },
      markScheme: ['no change [1]'] },
    { id: 'f', label: '(f)', text: 'Identify solid H.', marks: 2, answer: { kind: 'lines', lines: 1 },
      markScheme: ['M1 barium / Ba²⁺ [1]', 'M2 carbonate / CO₃²⁻ — BaCO₃ scores both marks [1]'] },
    { id: 'g', label: '(g)',
      preamble: 'Tests on solid I\nAdd about 5 cm depth of distilled water to the sample of solid I in the boiling tube. Replace the stopper in the boiling tube and shake to dissolve and form solution I. Divide solution I into three approximately equal portions in two boiling tubes and one test-tube.',
      text: 'To the first portion of solution I in a boiling tube, add about 2 cm depth of aqueous sodium hydroxide and warm the mixture. Test any gas produced, using damp red litmus paper and damp blue litmus paper.\nRecord your observations.', marks: 2, answer: { kind: 'fields', fields: ['damp red litmus paper', 'damp blue litmus paper'] },
      markScheme: ['(turns) blue [1]', '(stays) blue / no change [1]'] },
    { id: 'h-i', label: '(h)(i)', text: 'To the second portion of solution I in a boiling tube, add about 1 cm depth of dilute nitric acid followed by a few drops of aqueous silver nitrate.\nKeep the product for use in (h)(ii).\nRecord your observations.', marks: 1, answer: { kind: 'lines', lines: 1 },
      markScheme: ['white precipitate [1]'] },
    { id: 'h-ii', label: '(h)(ii)', text: 'To the product from (h)(i), add about 4 cm depth of aqueous ammonia. Place a stopper in the boiling tube and shake to mix.\nPour the product away and rinse the boiling tube and bung as soon as you have made your observations.\nRecord your observations.', marks: 1, answer: { kind: 'lines', lines: 1 },
      markScheme: ['colourless solution / (white ppt) dissolves [1]'] },
    { id: 'i', label: '(i)', text: 'Test the pH of the third portion of solution I.', marks: 1, answer: { kind: 'lines', lines: 1 },
      markScheme: ['any in range 3 to 6 [1]'] },
    { id: 'j', label: '(j)', text: 'Identify solid I.', marks: 2, answer: { kind: 'lines', lines: 1 },
      markScheme: ['M1 ammonium / NH₄⁺ [1]', 'M2 chloride / Cl⁻ — NH₄Cl = 2 marks [1]'] },
  ],
  identities: ['Solid H: barium carbonate, BaCO₃ (0.5 g).', 'Solid I: ammonium chloride, NH₄Cl (1 g).'],
  supervisor(lab: Lab) {
    const H = lab.sampleVessel('H')
    const ai = t(lab.addReagent(H.id, 'HCl', { cm3: 10 }), lab.gasTest(H.id, 'limewater'))
    const ids = lab.divide(H.id, ['test-tube', 'test-tube', 'test-tube', 'test-tube']).vesselIds
    const b = t(lab.flameTest(ids[0]))
    const c = t(lab.addReagent(ids[1], 'KMnO4-H+', { drops: 5 }))
    const d = t(lab.addReagent(ids[2], 'H2SO4', { drops: 5 }))
    const e = t(lab.addReagent(ids[3], 'HNO3', { depth: 1 }), lab.addReagent(ids[3], 'Ba(NO3)2', { drops: 5 }))
    const I = lab.sampleVessel('I')
    lab.addReagent(I.id, 'water', { depth: 5 })
    const [g1, h1, i1] = lab.divide(I.id, ['boiling-tube', 'boiling-tube', 'test-tube']).vesselIds
    lab.addReagent(g1, 'NaOH', { depth: 2 })
    lab.heat(g1, 'warm', 40)
    const g = t(lab.gasTest(g1, 'damp-red-litmus'), lab.gasTest(g1, 'damp-blue-litmus'))
    const hi = t(lab.addReagent(h1, 'HNO3', { depth: 1 }), lab.addReagent(h1, 'AgNO3', { drops: 5 }))
    lab.setStopper(h1, true)
    const hii = t(lab.addReagent(h1, 'NH3', { depth: 4 }), lab.shake(h1))
    const i = t(lab.pHTest(i1))
    return { 'a-i': ai, b, 'c-i': c, d, e, g, 'h-i': hi, 'h-ii': hii, i }
  },
}

export const IGCSE_PAPERS = [P0620_s24_51, P0620_w24_52, P0620_s23_51, P0620_s24_52]
