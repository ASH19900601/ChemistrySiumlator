import { expect, test } from 'vitest'
import { RULES } from '../rules'
import { SPECIES } from '../species'

test('every species used by a rule exists', () => {
  for (const r of RULES) for (const s of [...Object.keys(r.reactants), ...Object.keys(r.products)]) expect(SPECIES[s], `${r.id}: ${s}`).toBeDefined()
})

test('every rule conserves charge', () => {
  const charge = (st: Record<string, number>) => Object.entries(st).reduce((sum, [s, nu]) => sum + nu * (SPECIES[s]?.charge ?? 0), 0)
  for (const r of RULES) expect(charge(r.reactants), r.id).toBeCloseTo(charge(r.products), 9)
})
