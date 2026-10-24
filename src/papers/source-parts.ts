// Question-part labels and printed marks manually checked against each original QP extract.
// Keep the original documents as the authority; these are scoring fields, not rewritten questions.
import { Lab } from '../engine'
import type { QuestionPart } from './types'
const PRINTED_PARTS: Record<string, string> = {
  '0620_m23_52': 'a:1 b:2 c-i:2 c-ii:1 d:1 e:1 f:2 g:1 h:1 i:2 j:2',
  '0620_s23_52': 'a:1 b-i:2 b-ii:1 c:1 d:2 e:2 f:3 g:1 h:2',
  '0620_s23_53': 'a:1 b:1 c:3 d:2 e:2 f-i:1 f-ii:1 g:1 h:2 i:3',
  '0620_w23_52': 'a:2 b-i:2 b-ii:1 c:1 d:1 e:1 f:1 g:3 h:2 i:2',
  '0620_w23_53': 'a:1 b:2 c:2 d:1 e:1 f:3 g:1 h:3 i:1 j:2',
  '0620_m24_52': 'a:3 b:1 c:1 d-i:1 d-ii:1 e:2 f:1 g:2 h:2 i:3',
  '0620_s24_53': 'a:2 b:3 c:3 d:1 e-i:1 e-ii:1 e-iii:1 f:1 g:2',
  '0620_w24_53': 'a:2 b:2 c:2 d:1 e:2 f:1 g:1 h:1 i:2',
  '0620_m25_52': 'a:1 b:2 c:2 d:1 e:2 f:1 g:1 h:1 i:1 j:2',
  '0620_s25_51': 'a-i:3 a-ii:1 b-i:1 b-ii:2 b-iii:1 c:2 d:1 e-i:1 e-ii:1 f:2',
  '0620_s25_52': 'a:2 b:2 c:1 d:1 e:2 f:1 g-i:1 g-ii:1 g-iii:2 h:2',
  '0620_s25_53': 'a:2 b:2 c:2 d:1 e:2 f:1 g-i:2 g-ii:1 h:2',
  '0620_w25_52': 'a-i:1 a-ii:1 b:1 c:1 d:2 e:1 f-i:1 f-ii:2 f-iii:2 g:3',
  '0620_w25_53': 'a:2 b-i:2 b-ii:1 c:2 d:1 e:2 f-i:1 f-ii:1 f-iii:1 g:2',
  '0620_m26_52': 'a:2 b:2 c-i:2 c-ii:1 c-iii:2 d:2 e:1 f-i:1 f-ii:1 g:2',
  '0620_s26_51': 'a-i:2 a-ii:3 b:1 c:2 d:2 e-i:2 e-ii:2 f:2',
  '0620_s26_52': 'a:1 b:2 c-i:2 c-ii:1 d:3 e:1 f:1 g:1 h:2',
  '0620_s26_53': 'a:1 b-i:1 b-ii:2 b-iii:1 b-iv:1 c:2 d-i:2 d-ii:2 d-iii:1 d-iv:1 e:2',
}
export function sourceParts(id: string): QuestionPart[] | undefined {
  return PRINTED_PARTS[id]?.split(' ').map(token => {
    const [id, value] = token.split(':')
    const label = id.split('-').map(part => `(${part})`).join('')
    return { id, label, text: `Answer part ${label} of the original question above.`, marks: Number(value),
      answer: { kind: 'lines', lines: 3 }, markScheme: [`Use the published mark scheme for part ${label} below.`] }
  })
}
// Each configured bench has a source-checked representative reference operation. This is
// deliberately partial, and must not promote a paper to fully guided / fully verified coverage.
export const PARTIAL_REFERENCES: Record<string, { sample: string; part: string; mode: 'flame' | 'iodide' | 'carbonate' | 'ammonia'; expected: RegExp }> = {
  '0620_m23_52': { sample: 'C', part: 'a', mode: 'flame', expected: /Orange-red/ },
  '0620_s23_52': { sample: 'F', part: 'a', mode: 'flame', expected: /Light green/ },
  '0620_s23_53': { sample: 'H', part: 'b', mode: 'flame', expected: /Lilac/ },
  '0620_w23_52': { sample: 'L', part: 'f', mode: 'flame', expected: /Yellow/ },
  '0620_w23_53': { sample: 'I', part: 'a', mode: 'flame', expected: /Lilac/ },
  '0620_m24_52': { sample: 'C', part: 'c', mode: 'iodide', expected: /Yellow precipitate/ },
  '0620_s24_53': { sample: 'K', part: 'b', mode: 'carbonate', expected: /Effervescence.*milky/ },
  '0620_w24_53': { sample: 'S', part: 'f', mode: 'flame', expected: /Yellow/ },
  '0620_m25_52': { sample: 'B', part: 'f', mode: 'flame', expected: /Red flame/ },
  '0620_s25_51': { sample: 'G', part: 'd', mode: 'flame', expected: /Lilac/ },
  '0620_s25_52': { sample: 'K', part: 'f', mode: 'flame', expected: /Lilac/ },
  '0620_s25_53': { sample: 'M', part: 'f', mode: 'flame', expected: /Light green/ },
  '0620_w25_52': { sample: 'F', part: 'e', mode: 'flame', expected: /Yellow/ },
  '0620_w25_53': { sample: 'A', part: 'c', mode: 'ammonia', expected: /[Rr]ed-brown precipitate/ },
  '0620_m26_52': { sample: 'B', part: 'e', mode: 'flame', expected: /Light green/ },
  '0620_s26_51': { sample: 'B', part: 'd', mode: 'ammonia', expected: /White precipitate/ },
  '0620_s26_52': { sample: 'C', part: 'a', mode: 'flame', expected: /Lilac/ },
  '0620_s26_53': { sample: 'A', part: 'a', mode: 'flame', expected: /Orange-red/ },
}
export function partialReference(id: string, lab: Lab): Record<string, string> {
  const ref = PARTIAL_REFERENCES[id]
  if (!ref) return {}
  lab.setStopper(ref.sample, false)
  const tube = lab.newVessel('boiling-tube')
  const stock = lab.sampleVessel(ref.sample)
  lab.transfer(stock.id, tube.id, stock.wet ? { cm3: 1 } : { grams: 0.1 })
  if (ref.mode === 'flame') return { [ref.part]: lab.flameReading(tube.id) }
  const text = (result: ReturnType<Lab['addReagent']>) => result.observations.map(o => o.text).join(' ')
  if (ref.mode === 'carbonate') {
    const acid = text(lab.addReagent(tube.id, 'HCl', { depth: 5 }))
    return { [ref.part]: `${acid} ${text(lab.gasTest(tube.id, 'limewater'))}` }
  }
  if (!tube.wet) lab.addReagent(tube.id, 'water', { cm3: 3 })
  if (ref.mode === 'iodide') {
    lab.addReagent(tube.id, 'HNO3', { depth: 1 })
    return { [ref.part]: text(lab.addReagent(tube.id, 'AgNO3', { drops: 5 })) }
  }
  const drops = text(lab.addReagent(tube.id, 'NH3', { drops: 5 }))
  const excess = text(lab.addReagent(tube.id, 'NH3', { cm3: 4 }))
  return { [ref.part]: `${drops} ${excess}` }
}
