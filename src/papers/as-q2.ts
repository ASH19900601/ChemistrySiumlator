// The two available AS Q2s in the four-year archive. Original components share the procedure.
import type { Lab } from '../engine'
import { RECENT_BENCHES } from './recent-benches'
import type { PaperCase } from './types'

const observations = (r: { observations: { text: string }[] }) => r.observations.map(o => o.text).join(' ')

export function nitrogenAndManganese(lab: Lab): Record<string, string> {
  const portion = (sample: string, grams = 0.05, kind: 'test-tube' | 'hard-glass-tube' = 'test-tube') => {
    const tube = lab.newVessel(kind)
    lab.transfer(sample, tube.id, { grams })
    return tube.id
  }
  const nitrogen: string[] = []
  for (const sample of ['FA 6', 'FA 7', 'FA 8']) {
    const tube = portion(sample)
    lab.addReagent(tube, 'water', { cm3: 2 })
    lab.addReagent(tube, 'NaOH-2M', { cm3: 1 })
    lab.heat(tube, 'warm', 30)
    const alkali = observations(lab.gasTest(tube, 'damp-red-litmus'))
    lab.addReagent(tube, 'Al-foil', { pieces: 1 })
    lab.heat(tube, 'warm', 30)
    const aluminium = observations(lab.gasTest(tube, 'damp-red-litmus'))
    const fresh = portion(sample)
    lab.addReagent(fresh, 'water', { cm3: 2 })
    const permanganate = observations(lab.addReagent(fresh, 'KMnO4-H+', { drops: 3 }))
    nitrogen.push(`${sample}: NaOH and heat: ${alkali} Then aluminium and heat: ${aluminium} Fresh sample with acidified KMnO₄: ${permanganate}`)
  }
  const heated = portion('FA 9', 0.1, 'hard-glass-tube')
  const heat = observations(lab.heat(heated, 'strong', 30))
  const oxygen = observations(lab.gasTest(heated, 'glowing-splint'))
  // Test the gas while it is being produced, then continue until the decomposition ends.
  const completed = observations(lab.heat(heated, 'strong', 240))
  lab.wait(180, heated)
  const water = observations(lab.addReagent(heated, 'water', { depth: 2.5 }))
  const oxidant = portion('FA 9', 0.01)
  lab.addReagent(oxidant, 'H2SO4', { depth: 2 })
  lab.addReagent(oxidant, 'water', { depth: 2 })
  const iron = lab.newVessel('test-tube')
  lab.addReagent(iron.id, 'FeSO4-acidified-0.1', { depth: 1 })
  const test3 = observations(lab.transfer(oxidant, iron.id, { drops: 3 }))
  const iodide = lab.newVessel('test-tube')
  lab.addReagent(iodide.id, 'KI', { depth: 1 })
  const test4 = observations(lab.transfer(oxidant, iodide.id, { drops: 3 }))
  const manganese = portion('FA 10')
  lab.addReagent(manganese, 'water', { cm3: 2 })
  const initial = observations(lab.addReagent(manganese, 'NaOH-2M', { drops: 5 }))
  const manganeseSolid = () => lab.vessel(manganese).amount('Mn(OH)2(s)') + lab.vessel(manganese).amount('MnO(OH)2(s)')
  const beforeExcess = manganeseSolid()
  const excess = observations(lab.addReagent(manganese, 'NaOH-2M', { cm3: 1 }))
  const insoluble = beforeExcess > 0 && manganeseSolid() >= beforeExcess * 0.99 ? 'The precipitate remains insoluble in excess.' : ''
  const standing = observations(lab.wait(90, manganese))
  return { 'a-i': nitrogen.join('\n'), 'a-ii': 'FA 6: NO₃⁻; FA 7: NO₂⁻; FA 8: NH₄⁺.',
    'b-i': `Test 1: ${heat} ${oxygen} ${completed} Product: oxygen. Test 2: ${water}`,
    'b-ii': `Test 3: ${test3}\nTest 4: ${test4}`, 'b-iii': `${initial} In excess: ${excess} ${insoluble} On standing: ${standing}`, 'b-iv': 'Manganese (Mn).' }
}

function make(id: string): PaperCase {
  return {
    id, level: 'AS & A Level', syllabus: 'Cambridge International AS & A Level Chemistry 9701',
    component: `Paper ${id.slice(-2)} (Advanced Practical Skills)`, series: 'October/November 2023', question: 2, totalMarks: 17,
    summary: 'Three nitrogen-containing salts and two solids containing the same element.',
    ...RECENT_BENCHES[id],
    intro: 'For each test record all observations, including the stage at which a change occurs. Use a boiling tube if a solution is warmed. Rinse and reuse tubes where possible.',
    parts: [
      { id: 'a-i', label: '(a)(i)', marks: 8, text: 'FA 6, FA 7 and FA 8 are salts containing different nitrogen-containing ions listed in the Qualitative analysis notes. List the ions, select reagents to positively identify them, and record your tests and results in a suitable table.',
        answer: { kind: 'table', header: ['salt', 'ions tested, reagents and observations'], rows: ['FA 6', 'FA 7', 'FA 8'] },
        markScheme: ['List NO₃⁻, NO₂⁻ and NH₄⁺; provide a table with salts and reagents.', 'NaOH and heat: only FA 8 gives gas turning damp red litmus blue.', 'Then add Al and heat: FA 6 gives gas turning damp red litmus blue.', 'Fresh sample with acidified KMnO₄ or a named acid: only FA 7 decolourises KMnO₄ or produces brown gas with acid.'] },
      { id: 'a-ii', label: '(a)(ii)', marks: 1, text: 'Use your observations to determine the formulae of the nitrogen-containing ions in FA 6, FA 7 and FA 8.', answer: { kind: 'fields', fields: ['FA 6', 'FA 7', 'FA 8'] }, markScheme: ['FA 6: NO₃⁻; FA 7: NO₂⁻; FA 8: NH₄⁺.'] },
      { id: 'b-i', label: '(b)(i)', marks: 3, text: 'FA 9 and FA 10 contain the same element. Test 1: heat a small spatula measure of FA 9 in a hard-glass test-tube until reaction stops. Record observations and name one product. Keep the tube and leave to cool. Test 2: add a 2–3 cm depth of distilled water to the cooled product, shake and leave to settle. Record observations.', answer: { kind: 'lines', lines: 6 }, markScheme: ['Two marking points per mark, maximum 3: black solid/residue; jumps/pops; glowing splint relights; a named product (O₂, MnO₂ or K₂MnO₄); green colour; solution formed.'] },
      { id: 'b-ii', label: '(b)(ii)', marks: 2, text: 'Dissolve a very small spatula measure of FA 9 in a 2 cm depth of dilute sulfuric acid and a 2 cm depth of distilled water. Test 3: add a few drops to a 1 cm depth of aqueous iron(II) sulfate. Test 4: add a few drops to a 1 cm depth of aqueous potassium iodide. Record observations.', answer: { kind: 'table', header: ['test', 'observations'], rows: ['Test 3', 'Test 4'] }, markScheme: ['Test 3: purple to colourless / pale yellow / yellow-brown.', 'Test 4: purple (to colourless) to brown solution.'] },
      { id: 'b-iii', label: '(b)(iii)', marks: 2, text: 'Dissolve a small spatula measure of FA 10 in distilled water. Add aqueous sodium hydroxide to a 1 cm depth of this solution and record observations.', answer: { kind: 'lines', lines: 3 }, markScheme: ['Off-white precipitate.', 'Precipitate turns brown(er) on standing and is insoluble in excess NaOH.'] },
      { id: 'b-iv', label: '(b)(iv)', marks: 1, text: 'Identify the element present in FA 9 and FA 10.', answer: { kind: 'lines', lines: 1 }, markScheme: ['Manganese / Mn.'] },
    ],
    identities: ['FA 6: sodium nitrate; FA 7: sodium nitrite; FA 8: ammonium chloride.', 'FA 9: potassium manganate(VII); FA 10: manganese(II) sulfate (the source also permits manganese(II) chloride).'],
    supervisor: nitrogenAndManganese,
  }
}

export const AS_Q2_PAPERS = ['9701_w23_31', '9701_w23_35'].map(make)
