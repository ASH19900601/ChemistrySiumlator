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

const SUBSCRIPT = '₀₁₂₃₄₅₆₇₈₉'
function atoms(id: string): Record<string, number> {
  if (id === 'starch') return { St: 1 }
  if (id === 'starch-I2') return { St: 1, I: 2 }
  const formula = SPECIES[id].formula
    .replace(/[₀-₉]/g, c => String(SUBSCRIPT.indexOf(c)))
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]/g, '').replace(/\(aq\)/g, '')
    .replace(/\[/g, '(').replace(/\]/g, ')')
  const total: Record<string, number> = {}
  for (const part of formula.split(/[·.]/)) {
    const tokens = part.match(/[A-Z][a-z]?|\d+|[()]/g) ?? []
    expect(tokens.join(''), `${id}: unsupported formula`).toBe(part)
    let index = 0
    const count = () => /^\d+$/.test(tokens[index] ?? '') ? Number(tokens[index++]) : 1
    const multiplier = count()
    const group = (): Record<string, number> => {
      const result: Record<string, number> = {}
      while (index < tokens.length && tokens[index] !== ')') {
        const token = tokens[index++]
        let entries: Record<string, number>
        if (token === '(') {
          entries = group()
          expect(tokens[index++], `${id}: unclosed group`).toBe(')')
        } else entries = { [token]: 1 }
        const multiple = count()
        for (const [element, n] of Object.entries(entries)) result[element] = (result[element] ?? 0) + multiple * n
      }
      return result
    }
    const entries = group()
    expect(index, `${id}: unparsed tokens`).toBe(tokens.length)
    for (const [element, n] of Object.entries(entries)) total[element] = (total[element] ?? 0) + multiplier * n
  }
  return total
}

// H/O are implicit solvent/air reservoirs; starch is a conserved polymer placeholder St.
test('all rules conserve every explicitly tracked non-H/O element', () => {
  for (const r of RULES) {
    const diff: Record<string, number> = {}
    for (const [stoich, sign] of [[r.reactants, -1], [r.products, 1]] as const) {
      for (const [id, amount] of Object.entries(stoich)) {
        for (const [element, count] of Object.entries(atoms(id))) {
          if (element !== 'H' && element !== 'O') diff[element] = (diff[element] ?? 0) + sign * amount * count
        }
      }
    }
    for (const [element, count] of Object.entries(diff)) expect(count, `${r.id}: ${element}`).toBeCloseTo(0, 9)
  }
})
