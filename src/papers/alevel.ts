// Cambridge International AS & A Level Chemistry 9701, Paper 3 (Advanced Practical Skills),
// qualitative analysis question. Unknowns follow the confidential instructions.

import type { ActionResult, Lab } from '../engine'
import { registerReagent, solutionFromGrams } from '../engine'
import type { PaperCase } from './types'
import { t } from './igcse'

/** standard 9701 bench reagents (2.0 mol dm⁻³ acids and alkalis) */
export const AS_BENCH = ['water', 'HCl-2M', 'HNO3-2M', 'H2SO4', 'NH3-2M', 'NaOH-2M', 'BaCl2', 'Ba(NO3)2', 'AgNO3', 'KMnO4-H+']

registerReagent({ id: 'FB8-w24', label: 'FB 8 (0.100 mol dm⁻³ sodium thiosulfate)', short: 'FB 8', kind: 'solution', conc: { 'Na+': 0.2, 'S2O3 2-': 0.1 } })
// diluted domestic bleach, checked only by its ability to decolourise litmus
registerReagent({ id: 'NaClO-bleach', label: 'aqueous sodium chlorate(I)', short: 'NaClO(aq)', kind: 'solution',
  conc: { 'Na+': 0.1, 'ClO-': 0.04, 'Cl-': 0.04, 'OH-': 0.02 }, bottleTint: '#f3f6dc' })

// ------------------------------------------------------------------------------------------
export const P9701_s25_31: PaperCase = {
  id: '9701_s25_31',
  syllabus: 'Cambridge International AS & A Level Chemistry 9701',
  level: 'AS & A Level',
  series: 'May/June 2025',
  component: 'Paper 31 (Advanced Practical Skills 1)',
  question: 3,
  totalMarks: 12,
  summary: 'FA 7: a solution of two cations and one anion; FA 8 and FA 9: sodium compounds.',
  samples: [
    { id: 'FA7', label: 'FA 7', kind: 'solution', solution: { conc: solutionFromGrams({ 'CuCl2.2H2O': 10.0, NH4Cl: 6.0 }), volume: 20 } },
    { id: 'FA8', label: 'FA 8', kind: 'solid', solid: [{ compound: 'NaHCO3', grams: 1.0 }], container: 'test-tube' },
    { id: 'FA9', label: 'FA 9', kind: 'solid', solid: [{ compound: 'Na2CO3', grams: 1.0 }], container: 'test-tube' },
  ],
  reagents: [...AS_BENCH, 'KI', 'starch'],
  intro: '',
  parts: [
    { id: 'a-i', label: '(a)(i)',
      preamble: 'FA 7 is a solution containing two cations and one anion. All of the ions are listed in the Qualitative analysis notes.',
      text: 'Carry out the following tests and record your observations in Tables 3.1 and 3.2. For each test use a 1 cm depth of FA 7 in a test-tube unless the solution requires heating.',
      marks: 5,
      answer: { kind: 'table', header: ['test', 'observations'], rows: [
        'Test 1: Add aqueous ammonia.',
        'Test 2: To a 1 cm depth of FA 7 in a boiling tube, add aqueous sodium hydroxide, then warm the mixture carefully.',
        'Test 3: Add a few drops of silver nitrate.',
        'Test 4: Add a 1 cm depth of aqueous barium chloride or aqueous barium nitrate.',
        'Test 5: Add a 1 cm depth of dilute nitric acid, then leave to stand for a few minutes.',
        'Test 6: Add a 1 cm depth of aqueous potassium iodide, then add a few drops of starch solution.',
      ] },
      markScheme: [
        '2 ✱ = 1 mark (round down), max 5:',
        'Test 1 NH₃(aq): (pale) blue ppt ✱; soluble in excess ✱; (to give a) dark / deep blue solution ✱',
        'Test 2 NaOH(aq): (pale) blue ppt AND insoluble in excess ✱; warm: gas / bubbles / NH₃ turns (red) litmus blue ✱; black solid / ppt / residue ✱',
        'Test 3 AgNO₃: white ppt ✱',
        'Test 4 Ba²⁺(aq): no (visible) change / remains pale blue solution / no ppt ✱',
        'Test 5 dilute HNO₃, standing: no (visible) change / remains pale blue solution / no effervescence AND no change on standing ✱',
        'Test 6 KI(aq): brown ✱; starch: blue-black / dark blue / black ✱',
      ] },
    { id: 'a-ii', label: '(a)(ii)', text: 'Write an ionic equation for a reaction in (a)(i) that resulted in the formation of a precipitate. Include state symbols.', marks: 1, answer: { kind: 'lines', lines: 1 },
      markScheme: ['Cu²⁺(aq) + 2OH⁻(aq) → Cu(OH)₂(s) OR Ag⁺(aq) + Cl⁻(aq) → AgCl(s) OR 2Cu²⁺(aq) + 4I⁻(aq) → 2CuI(s) + I₂(aq) [1]'] },
    { id: 'a-iii', label: '(a)(iii)', text: 'Give the formula of each ion present in FA 7. If you cannot identify an ion, write ‘unknown’.', marks: 2, answer: { kind: 'fields', fields: ['cations', 'anion'] },
      markScheme: ['Cations: Cu²⁺, NH₄⁺; Anion: Cl⁻ — 2 correct = 1 mark, all 3 correct = 2 marks'] },
    { id: 'b-i', label: '(b)(i)', preamble: 'FA 8 is an anhydrous sodium compound.',
      text: 'Transfer a spatula measure of FA 8 to a hard-glass test-tube. Heat the test-tube gently at first, then more strongly until no further change occurs. Record your observations.', marks: 1, answer: { kind: 'lines', lines: 2 },
      markScheme: ['condensation / water vapour / (colourless) droplets / steam [1]'] },
    { id: 'b-ii', label: '(b)(ii)', text: 'The FA 9 provided is a sample of the residue obtained from heating FA 8.\nTo a 2 cm depth of nitric acid in a test-tube, slowly add a small spatula measure of FA 9.\nRecord your observations.', marks: 2, answer: { kind: 'lines', lines: 3 },
      markScheme: ['M1 effervescence / bubbling / fizzing [1]', 'M2 gas / CO₂ gives a white ppt with limewater OR (white solid / FA 9 reacts and) colourless solution formed [1]'] },
    { id: 'b-iii', label: '(b)(iii)', text: 'Deduce the formula of FA 8.', marks: 1, answer: { kind: 'lines', lines: 1 },
      markScheme: ['NaHCO₃ — from condensation in (b)(i) AND evidence of CO₂ in (b)(ii) [1]'] },
  ],
  identities: [
    'FA 7: 10.0 g CuCl₂·2H₂O and 6.0 g NH₄Cl per dm³.',
    'FA 8: sodium hydrogencarbonate, NaHCO₃ (1.0 g).',
    'FA 9: anhydrous sodium carbonate, Na₂CO₃ (1.0 g).',
  ],
  supervisor(lab: Lab) {
    const tube = () => {
      const v = lab.newVessel('test-tube')
      lab.transfer('FA7', v.id, { depth: 1 })
      return v.id
    }
    const t1 = tube()
    const r1: ActionResult[] = []
    for (let i = 0; i < 4; i++) r1.push(lab.addReagent(t1, 'NH3-2M', { drops: 1 }))
    r1.push(lab.addReagent(t1, 'NH3-2M', { cm3: 3 }))
    const b2 = lab.newVessel('boiling-tube')
    lab.transfer('FA7', b2.id, { depth: 1 })
    const r2 = t(lab.addReagent(b2.id, 'NaOH-2M', { drops: 3 }), lab.addReagent(b2.id, 'NaOH-2M', { cm3: 2 }))
    const r2w = t(lab.heat(b2.id, 'warm', 40), lab.gasTest(b2.id, 'damp-red-litmus'))
    const t3 = tube()
    const r3 = t(lab.addReagent(t3, 'AgNO3', { drops: 5 }))
    const t4 = tube()
    const r4 = t(lab.addReagent(t4, 'Ba(NO3)2', { depth: 1 }))
    const t5 = tube()
    const r5 = t(lab.addReagent(t5, 'HNO3-2M', { depth: 1 }), lab.wait(180, t5))
    const t6 = tube()
    const r6a = t(lab.addReagent(t6, 'KI', { depth: 1 }))
    const r6b = t(lab.addReagent(t6, 'starch', { drops: 5 }))
    const h = lab.newVessel('hard-glass-tube')
    lab.transfer('FA8', h.id, { spatula: 'normal' })
    const bi = t(lab.heat(h.id, 'gentle', 20), lab.heat(h.id, 'strong', 40))
    const n = lab.newVessel('test-tube')
    lab.addReagent(n.id, 'HNO3-2M', { depth: 2 })
    const bii = t(lab.transfer('FA9', n.id, { spatula: 'small' }), lab.gasTest(n.id, 'limewater'))
    return {
      'a-i': [`Test 1: ${t(...r1)}`, `Test 2: ${r2} | warm: ${r2w}`, `Test 3: ${r3}`, `Test 4: ${r4}`, `Test 5: ${r5}`, `Test 6: ${r6a} | starch: ${r6b}`].join('\n'),
      'b-i': bi,
      'b-ii': bii,
    }
  },
}

// ------------------------------------------------------------------------------------------
export const P9701_w24_34: PaperCase = {
  id: '9701_w24_34',
  syllabus: 'Cambridge International AS & A Level Chemistry 9701',
  level: 'AS & A Level',
  series: 'October/November 2024',
  component: 'Paper 34 (Advanced Practical Skills 2)',
  question: 3,
  totalMarks: 12,
  summary: 'FB 6 (heated, then residue tested) and FB 7, a salt solution.',
  samples: [
    { id: 'FB6', label: 'FB 6', kind: 'solid', solid: [{ compound: 'KMnO4', grams: 0.5 }], container: 'test-tube' },
    { id: 'FB7', label: 'FB 7', kind: 'solution', solution: { conc: solutionFromGrams({ 'CuSO4.5H2O': 62.4 }), volume: 10 } },
  ],
  reagents: [...AS_BENCH, 'FB8-w24', 'H2O2', 'KI-0.5'],
  intro: '',
  parts: [
    { id: 'a-i', label: '(a)(i)', text: 'FB 6 is potassium manganate(VII). Place all the FB 6 in a hard-glass test-tube and heat gently at first and then more strongly.\nRecord your observations.\nLeave the tube to cool and keep for use in (a)(ii).', marks: 1, answer: { kind: 'lines', lines: 3 },
      markScheme: ['2 ✱ = 1 mark: (dark) purple / purple-black solid / crystals (initially) ✱; (solid / crystals) jump(s) around the tube / pops / crackles ✱; black powder / solid / residue (remains) ✱; (gas) relights a glowing splint ✱; (gas produced is) oxygen ✱'] },
    { id: 'a-ii', label: '(a)(ii)', text: 'Complete Table 3.1 by carrying out the tests described.\nRecord your observations.', marks: 2,
      answer: { kind: 'table', header: ['test', 'observations'], rows: [
        'Test 1: To a 7 cm depth of distilled water in a boiling tube, add approximately half of the residue from (a)(i).',
        'Test 2: To a 4 cm depth of aqueous sodium hydroxide in a test-tube, add the remaining residue from (a)(i).',
      ] },
      markScheme: ['Test 1: (forms) purple solution OR (water) turns purple [1]', 'Test 2: (forms) green solution OR (NaOH) turns green [1]'] },
    { id: 'a-iii', label: '(a)(iii)', text: 'Suggest what type of reaction takes place in (a)(i).', marks: 1, answer: { kind: 'lines', lines: 1 },
      markScheme: ['thermal decomposition / redox [1]'] },
    { id: 'b-i', label: '(b)(i)',
      preamble: 'FB 7 is a solution of a salt which contains a cation and an anion from those listed in the Qualitative analysis notes.\nFB 8 is 0.100 mol dm⁻³ sodium thiosulfate, Na₂S₂O₃.',
      text: 'Complete Table 3.2 by carrying out the tests described. Record your observations.', marks: 5,
      answer: { kind: 'table', header: ['test', 'observations'], rows: [
        'Test 1: To a 1 cm depth of FB 7 in a test-tube, add aqueous ammonia until there is no further change, then add a few drops of hydrogen peroxide.',
        'Test 2: To a 1 cm depth of FB 7 in a test-tube, add a 1 cm depth of aqueous potassium iodide, then add FB 8.',
      ] },
      markScheme: [
        '1 mark per ✱, max 5:',
        'Test 1 +NH₃: (pale) blue ppt ✱; (ppt) soluble / disappears in excess or solution formed ✱; deep / dark blue (solution) ✱',
        'Test 1 +H₂O₂: black / (dark) green ✱; effervescence ✱; (gas) relights a glowing splint ✱',
        'Test 2 +KI: brown / yellow-brown / yellow solution ✱; (off-)white / (pale) brown / yellow-brown precipitate ✱',
        'Test 2 +Na₂S₂O₃: solution / solid / ppt becomes paler ✱; ppt partially dissolves or dissolves in excess ✱',
      ] },
    { id: 'b-ii', label: '(b)(ii)', text: 'The anion in FB 7 is either the sulfite ion or the sulfate ion.\nCarry out tests to identify which ion is present.\nRecord the reagents used and the results of your tests.', marks: 2, answer: { kind: 'lines', lines: 4 },
      markScheme: ['M1 choice: BaCl₂ / Ba(NO₃)₂ and HNO₃ / HCl OR (acidified) KMnO₄ [1]', 'M2 white ppt (with Ba²⁺) insoluble in acid OR KMnO₄ remains purple / not decolourised [1]'] },
    { id: 'b-iii', label: '(b)(iii)', text: 'Give the formula of the salt in FB 7.', marks: 1, answer: { kind: 'lines', lines: 1 },
      markScheme: ['CuSO₄ [1]'] },
  ],
  identities: ['FB 6: potassium manganate(VII), KMnO₄ (0.5 g).', 'FB 7: 0.25 mol dm⁻³ copper(II) sulfate (62.4 g CuSO₄·5H₂O per dm³).'],
  supervisor(lab: Lab) {
    const h = lab.newVessel('hard-glass-tube')
    lab.transfer('FB6', h.id, { all: true })
    const ai = t(lab.heat(h.id, 'gentle', 20), lab.heat(h.id, 'strong', 40), lab.gasTest(h.id, 'glowing-splint'))
    lab.wait(120, h.id)
    const w = lab.newVessel('boiling-tube')
    lab.addReagent(w.id, 'water', { depth: 7 })
    const aii1 = t(lab.transfer(h.id, w.id, { fraction: 0.5 }))
    const n = lab.newVessel('test-tube')
    lab.addReagent(n.id, 'NaOH-2M', { depth: 4 })
    const aii2 = t(lab.transfer(h.id, n.id, { all: true }))
    const t1 = lab.newVessel('test-tube')
    lab.transfer('FB7', t1.id, { depth: 1 })
    const b1: ActionResult[] = []
    for (let i = 0; i < 4; i++) b1.push(lab.addReagent(t1.id, 'NH3-2M', { drops: 2 }))
    b1.push(lab.addReagent(t1.id, 'NH3-2M', { cm3: 4 }))
    const b1h = t(lab.addReagent(t1.id, 'H2O2', { drops: 5 }), lab.wait(20, t1.id), lab.gasTest(t1.id, 'glowing-splint'))
    const t2 = lab.newVessel('test-tube')
    lab.transfer('FB7', t2.id, { depth: 1 })
    const b2 = t(lab.addReagent(t2.id, 'KI-0.5', { depth: 1 }))
    const b2b = t(lab.addReagent(t2.id, 'FB8-w24', { cm3: 4 }))
    const t3 = lab.newVessel('test-tube')
    lab.transfer('FB7', t3.id, { depth: 1 })
    const bii = t(lab.addReagent(t3.id, 'BaCl2', { depth: 1 }), lab.addReagent(t3.id, 'HCl-2M', { depth: 1 }))
    return {
      'a-i': ai,
      'a-ii': `Test 1: ${aii1}\nTest 2: ${aii2}`,
      'b-i': `Test 1: ${t(...b1)} | H₂O₂: ${b1h}\nTest 2: ${b2} | FB 8: ${b2b}`,
      'b-ii': bii,
    }
  },
}

// ------------------------------------------------------------------------------------------
export const P9701_s24_33: PaperCase = {
  id: '9701_s24_33',
  syllabus: 'Cambridge International AS & A Level Chemistry 9701',
  level: 'AS & A Level',
  series: 'May/June 2024',
  component: 'Paper 33 (Advanced Practical Skills 1)',
  question: 3,
  totalMarks: 10,
  summary: 'FA 5: a mixture containing two cations and two anions.',
  omitted: 'Part (b) of the original question (organic tests on FA 7, FA 8 and FA 9, 5 marks) is not included in this simulation.',
  samples: [{ id: 'FA5', label: 'FA 5', kind: 'solid', solid: [{ compound: 'ZnCO3', grams: 1.333 }, { compound: 'KI', grams: 0.667 }] }],
  reagents: [...AS_BENCH, 'NaClO-bleach', 'CuSO4', 'Na2S2O3'],
  intro: '',
  parts: [
    { id: 'a-i', label: '(a)(i)',
      preamble: 'FA 5 is a mixture containing two cations and two anions. Three of the ions are listed in the Qualitative analysis notes.',
      text: 'Carry out the following tests and record your observations in Table 3.1.\nDilute the solution from Test 2 with an equal volume of distilled water. Keep the resulting solution for use in (a)(ii). This solution is FA 6.', marks: 3,
      answer: { kind: 'table', header: ['test', 'observations'], rows: [
        'Test 1: Heat a spatula measure of FA 5 in a hard-glass test-tube.',
        'Test 2: Put a 2 cm depth of dilute nitric acid in a boiling tube. Add a spatula measure of FA 5.',
      ] },
      markScheme: [
        'Two points needed for each mark:',
        'Test 1: condensation / droplets on wall / moisture; purple gas / vapour; yellow solid (forms on heating) OR turns yellow; (yellow residue) pales on cooling OR yellow turns white / cream / off-white',
        'Test 2: fizz / bubbling / effervescence; gas / CO₂ tested with limewater; white ppt formed (with limewater); colourless / (pale) yellow solution formed',
      ] },
    { id: 'a-ii', label: '(a)(ii)', text: 'Carry out the following tests using a 1 cm depth of FA 6 in a test-tube for each test.\nRecord your observations in Table 3.2.', marks: 4,
      answer: { kind: 'table', header: ['test', 'observations'], rows: [
        'Test 1: Add a 1 cm depth of sodium chlorate(I), then add aqueous sodium thiosulfate dropwise.',
        'Test 2: Add aqueous sodium hydroxide.',
        'Test 3: Add aqueous ammonia.',
        'Test 4: Add a 1 cm depth of aqueous copper(II) sulfate, then add aqueous sodium thiosulfate dropwise until no further change occurs.',
        'Test 5: Add a few drops of aqueous silver nitrate, then add aqueous ammonia until no further change occurs.',
      ] },
      markScheme: [
        'Two points needed for each mark:',
        'Test 1 + NaClO(aq): brown / red-brown / orange-brown / yellow-brown / yellow (solution); + Na₂S₂O₃(aq): colourless solution',
        'Test 2 + NaOH(aq): white ppt AND soluble in excess',
        'Test 3 + NH₃(aq): white ppt AND soluble in excess',
        'Test 4 + CuSO₄(aq): (white / off-white / cream / brown / yellow-brown) ppt OR brown / yellow-brown (soln); + Na₂S₂O₃(aq): (then) changes to white ppt OR blue solution',
        'Test 5 + AgNO₃(aq): (pale) yellow ppt; + NH₃(aq): ppt insoluble OR ppt turns paler',
      ] },
    { id: 'a-iii', label: '(a)(iii)', text: 'FA 5 reacts with nitric acid to make FA 6 in Test 2 in Table 3.1.\nState a change you would see in one of the observations in Table 3.2 if hydrochloric acid had been used to prepare FA 6.', marks: 1, answer: { kind: 'lines', lines: 2 },
      markScheme: ['white ppt (as well as yellow) AND in Test 5 / with AgNO₃ [1]'] },
    { id: 'a-iv', label: '(a)(iv)', text: 'Use your observations in (a)(i) and (a)(ii) to identify the formulae of three of the ions present in FA 5.', marks: 2, answer: { kind: 'lines', lines: 1 },
      markScheme: ['ions present: I⁻, Zn²⁺, CO₃²⁻ — 2 correct = 1 mark; 3 correct = 2 marks'] },
  ],
  identities: ['FA 5: zinc carbonate (any basic form) and potassium iodide mixed 2 : 1 by mass (2.0 g).'],
  supervisor(lab: Lab) {
    const h = lab.newVessel('hard-glass-tube')
    lab.transfer('FA5', h.id, { spatula: 'normal' })
    const t1 = t(lab.heat(h.id, 'gentle', 20), lab.heat(h.id, 'strong', 40))
    const t1c = t(lab.wait(120, h.id))
    const b = lab.newVessel('boiling-tube')
    lab.addReagent(b.id, 'HNO3-2M', { depth: 2 })
    const t2 = t(lab.transfer('FA5', b.id, { spatula: 'normal' }), lab.gasTest(b.id, 'limewater'))
    lab.addReagent(b.id, 'water', { cm3: lab.vessel(b.id).V })
    const fa6 = () => {
      const v = lab.newVessel('test-tube')
      lab.transfer(b.id, v.id, { depth: 1 })
      return v.id
    }
    const x1 = fa6()
    const r1 = t(lab.addReagent(x1, 'NaClO-bleach', { depth: 1 }))
    const r1b: ActionResult[] = []
    for (let i = 0; i < 12; i++) r1b.push(lab.addReagent(x1, 'Na2S2O3', { drops: 3 }))
    const x2 = fa6()
    const r2: ActionResult[] = []
    for (let i = 0; i < 6; i++) r2.push(lab.addReagent(x2, 'NaOH-2M', { drops: 2 }))
    r2.push(lab.addReagent(x2, 'NaOH-2M', { cm3: 3 }))
    const x3 = fa6()
    const r3: ActionResult[] = []
    for (let i = 0; i < 6; i++) r3.push(lab.addReagent(x3, 'NH3-2M', { drops: 2 }))
    r3.push(lab.addReagent(x3, 'NH3-2M', { cm3: 4 }))
    const x4 = fa6()
    const r4 = t(lab.addReagent(x4, 'CuSO4', { depth: 1 }))
    const r4b: ActionResult[] = []
    for (let i = 0; i < 10; i++) r4b.push(lab.addReagent(x4, 'Na2S2O3', { drops: 3 }))
    const x5 = fa6()
    const r5 = t(lab.addReagent(x5, 'AgNO3', { drops: 5 }))
    const r5b = t(lab.addReagent(x5, 'NH3-2M', { cm3: 4 }))
    return {
      'a-i': `Test 1: ${t1} | cooling: ${t1c}\nTest 2: ${t2}`,
      'a-ii': [
        `Test 1: ${r1} | thiosulfate: ${t(...r1b)}`,
        `Test 2: ${t(...r2)}`,
        `Test 3: ${t(...r3)}`,
        `Test 4: ${r4} | thiosulfate: ${t(...r4b)}`,
        `Test 5: ${r5} | ammonia: ${r5b}`,
      ].join('\n'),
    }
  },
}

export const AS_PAPERS = [P9701_s25_31, P9701_w24_34, P9701_s24_33]
