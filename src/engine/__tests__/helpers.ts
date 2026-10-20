import { Lab, type Amount, type SampleDef } from '../lab'

export function solutionLab(conc: Record<string, number>, volume = 20, reagents?: string[]) {
  return new Lab({ samples: [{ id: 'X', label: 'X', kind: 'solution', solution: { conc, volume } }], reagents })
}

export function solidLab(solid: SampleDef['solid']) {
  return new Lab({ samples: [{ id: 'S', label: 'S', kind: 'solid', solid }] })
}

export const text = (r: { observations: { text: string }[] }) => r.observations.map((o) => o.text).join(' ')

/** Add a reagent drop by drop and then in excess; return the joined observations of each stage. */
export function dropwiseThenExcess(lab: Lab, vesselId: string, reagent: string, drops = 6, excess: Amount = { cm3: 4 }) {
  const dropObs: string[] = []
  for (let i = 0; i < drops; i++) dropObs.push(text(lab.addReagent(vesselId, reagent, { drops: 1 })))
  const ex = text(lab.addReagent(vesselId, reagent, excess))
  return { drops: dropObs.join(' '), excess: ex }
}

export function portion(lab: Lab, depth = 1, kind: 'test-tube' | 'boiling-tube' = 'test-tube') {
  const t = lab.newVessel(kind)
  lab.transfer('X', t.id, { depth })
  return t.id
}
