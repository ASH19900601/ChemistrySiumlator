import { describe, expect, test } from 'vitest'
import { COMPOUNDS, Lab, REAGENTS, SPECIES } from '..'
import { PAPERS } from '../../papers'
import { PAPER_SOURCES } from '../../papers/archive'
import { RECENT_BENCHES } from '../../papers/recent-benches'
import { text } from './helpers'
import { solutionColour } from '../colour'

test('the public archive contains exactly the available 2023–2026 source sets, with honest original question numbers', () => {
  expect(PAPER_SOURCES).toHaveLength(67)
  expect(new Set(PAPERS.map(p => p.id)).size).toBe(67)
  expect(PAPER_SOURCES.filter(p => p.code === '0620')).toHaveLength(22)
  expect(PAPER_SOURCES.filter(p => p.code === '9701')).toHaveLength(45)
  expect(PAPER_SOURCES.filter(p => p.code === '9701' && p.question === 2).map(p => p.id).sort()).toEqual(['9701_w23_31', '9701_w23_35'])
  expect(PAPER_SOURCES.find(p => p.id === '9701_s26_31')?.question).toBe(1)
  expect(PAPER_SOURCES.some(p => p.year === 2026 && p.session === 'w')).toBe(false)
})

describe.each(Object.entries(RECENT_BENCHES))('%s sample preparation', (id, definition) => {
  test('loads all declared samples with finite amounts and registered reagents', () => {
    const lab = new Lab(definition)
    expect(lab.samples.size).toBe(definition.samples.length)
    expect(PAPERS.find(p => p.id === id)?.coverage).toBe(id.startsWith('9701') ? 'guided' : 'configured')
    for (const s of definition.samples) {
      const v = lab.sampleVessel(s.id)
      expect(v.isEmpty()).toBe(false)
      for (const [species, amount] of v.n) {
        expect(SPECIES[species], species).toBeDefined()
        expect(Number.isFinite(amount) && amount > 0).toBe(true)
      }
      for (const solid of s.solid ?? []) expect(COMPOUNDS[solid.compound]).toBeDefined()
    }
    for (const reagent of definition.reagents) expect(REAGENTS[reagent], reagent).toBeDefined()
  })
})

function portion(id: string, sample: string, acid = false) {
  const lab = new Lab(RECENT_BENCHES[id])
  const v = lab.newVessel('test-tube')
  lab.setStopper(sample, false)
  lab.transfer(sample, v.id, { fraction: 0.08 })
  if (!v.wet) lab.addReagent(v.id, acid ? 'HCl' : 'water', { cm3: 2 })
  return { lab, v }
}

// Representative actual mark-scheme behaviours, not just manifest or zero-test validation.
test.each([
  ['0620_m23_52', 'C', /Orange-red/], ['0620_s23_52', 'F', /Light green/],
  ['0620_s23_53', 'H', /Lilac/], ['0620_w23_52', 'L', /Yellow/],
  ['0620_w23_53', 'I', /Lilac/], ['0620_m25_52', 'B', /Red flame/],
  ['0620_s25_51', 'G', /Lilac/], ['0620_s25_52', 'K', /Lilac/],
  ['0620_s25_53', 'M', /Light green/], ['0620_w25_52', 'F', /Yellow/],
  ['0620_m26_52', 'B', /Light green/], ['0620_s26_52', 'C', /Lilac/],
  ['0620_s26_53', 'A', /Orange-red/],
] as const)('%s flame test on %s matches the source scheme', (id, sample, expected) => {
  const { lab, v } = portion(id, sample)
  expect(lab.flameReading(v.id)).toMatch(expected)
})

test('2024 March ammonium iodide gives a yellow silver iodide precipitate', () => {
  const { lab, v } = portion('0620_m24_52', 'C')
  lab.addReagent(v.id, 'HNO3', { drops: 3 })
  expect(text(lab.addReagent(v.id, 'AgNO3', { drops: 5 }))).toMatch(/Yellow precipitate/)
})

test('2024 June basic copper carbonate gives carbon dioxide with acid', () => {
  const { lab, v } = portion('0620_s24_53', 'K', true)
  expect(text(lab.gasTest(v.id, 'limewater'))).toMatch(/milky/)
  expect(v.amount('Cu2+')).toBeGreaterThan(0)
})

test('2024 November sodium sulfite discharges acidified permanganate', () => {
  const { lab, v } = portion('0620_w24_53', 'S')
  expect(text(lab.addReagent(v.id, 'KMnO4-H+', { drops: 2 }))).toMatch(/decolourised/)
  expect(v.amount('MnO4-')).toBeLessThan(1e-6)
})

test('2025 November iron(III) gives a red-brown hydroxide precipitate', () => {
  const { lab, v } = portion('0620_w25_53', 'A')
  expect(text(lab.addReagent(v.id, 'NaOH', { cm3: 1 }))).toMatch(/Red-brown precipitate/)
})

test('2026 June aluminium nitrate dissolves in excess alkali', () => {
  const { lab, v } = portion('0620_s26_51', 'B')
  expect(text(lab.addReagent(v.id, 'NaOH', { drops: 2 }))).toMatch(/White precipitate/)
  expect(text(lab.addReagent(v.id, 'NaOH', { cm3: 2 }))).toMatch(/dissolves.*colourless/)
})

test.each(['9701_w23_31', '9701_w23_35'])('%s Q2 nitrogen tests distinguish nitrate, nitrite and ammonium', id => {
  const nitrate = portion(id, 'FA 6')
  nitrate.lab.addReagent(nitrate.v.id, 'NaOH-2M', { cm3: 1 })
  nitrate.lab.addReagent(nitrate.v.id, 'Al-foil', { pieces: 1 })
  nitrate.lab.heat(nitrate.v.id, 'warm', 30)
  expect(nitrate.lab.gasReading(nitrate.v.id, 'damp-red-litmus')).toMatch(/turns blue/)
  const nitrite = portion(id, 'FA 7')
  expect(text(nitrite.lab.addReagent(nitrite.v.id, 'KMnO4-H+', { drops: 2 }))).toMatch(/decolourised/)
  expect(nitrite.v.amount('MnO4-')).toBeLessThan(1e-6)
  const ammonium = portion(id, 'FA 8')
  ammonium.lab.addReagent(ammonium.v.id, 'NaOH-2M', { cm3: 1 })
  ammonium.lab.heat(ammonium.v.id, 'warm', 30)
  expect(ammonium.lab.gasReading(ammonium.v.id, 'damp-red-litmus')).toMatch(/turns blue/)
})

test('2025 chlorine water displaces bromide and iodide; iodine responds to starch', () => {
  const bromide = portion('0620_s25_51', 'G')
  bromide.lab.addReagent(bromide.v.id, 'Cl2-water', { drops: 3 })
  expect(bromide.v.amount('Br2(aq)')).toBeGreaterThan(0)
  const iodide = portion('0620_s25_52', 'J')
  iodide.lab.addReagent(iodide.v.id, 'Cl2-water', { cm3: 2 })
  expect(text(iodide.lab.addReagent(iodide.v.id, 'starch', { drops: 2 }))).toMatch(/blue-black/)
})

test('fresh manganate water extract stays green initially and disproportionates rapidly with acid', () => {
  const lab = new Lab()
  const v = lab.newVessel('test-tube')
  v.receive({ 'K+': 0.6, 'MnO4 2-': 0.3 }, 3)
  lab.tick(6)
  expect(solutionColour(v).name).toMatch(/green/)
  expect(v.amount('MnO4 2-')).toBeGreaterThan(0.285)
  lab.addReagent(v.id, 'H2SO4', { cm3: 1 })
  expect(v.amount('MnO4-')).toBeGreaterThan(0.04)
  expect(v.amount('MnO2(s)')).toBeGreaterThan(0.02)
})

import { PARTIAL_REFERENCES } from '../../papers/source-parts'
test.each(Object.entries(PARTIAL_REFERENCES))('%s configured bench has source-checked scoring parts and a representative reference', (id, reference) => {
  const paper = PAPERS.find(p => p.id === id)!
  expect(paper.coverage).toBe('configured')
  expect(paper.parts.reduce((sum, p) => sum + p.marks, 0)).toBe(paper.totalMarks)
  expect(new Set(paper.parts.map(p => p.id)).size).toBe(paper.parts.length)
  const result = paper.supervisor(new Lab(paper))
  expect(result[reference.part]).toMatch(reference.expected)
  expect(Object.keys(result).every(key => paper.parts.some(p => p.id === key))).toBe(true)
})
