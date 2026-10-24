import { Lab, SPECIES, type LabState } from '../engine'
import type { PaperCase } from '../papers'
import { BenchModel, type Place } from './bench/model'
import { RACK_SLOTS } from './bench/layout'
import type { Answers } from './PaperPane'
import { isAnswers, isMarks, load, save } from './storage'

const VERSION = 1
const memory = new Map<string, Attempt>()
const memoryLatest = new Map<string, { id: string; stage: 'exam' | 'results' }>()
export interface BenchState {
  lab: LabState
  places: [string, Place][]
  badges: [string, string][]
  funnel: BenchModel['funnel']
  tile: BenchModel['tile']
  burner: BenchModel['burner']
  heldMaterial?: { kind: 'spatula' | 'pipette'; from?: string | null; contents: [string, number][]; colour?: [number, number, number] | null }
}
export interface Attempt {
  version: number
  id: string
  paperId: string
  signature: string
  stage: 'exam' | 'results'
  answers: Answers
  notes: string
  marks: Record<string, number>
  bench?: BenchState
  elapsed: number
  savedAt: number
}
export const signature = (p: PaperCase) => JSON.stringify(['chemistry-v2', p.samples, p.reagents, p.parts.map(x => [x.id, x.marks])])
const key = (p: string, id: string) => `attempt:${p}:${id}`
export function readAttempt(p: PaperCase, id: string): Attempt | null {
  const value = memory.get(key(p.id, id)) ?? load<Attempt | object>(key(p.id, id), {})
  if (!('version' in value)) return null
  const a = value as Attempt
  if (a.version !== VERSION || a.id !== id || a.paperId !== p.id || a.signature !== signature(p) || !isAnswers(a.answers) || !isMarks(a.marks) || typeof a.notes !== 'string' || !Number.isFinite(a.elapsed) || a.elapsed < 0 || !['exam', 'results'].includes(a.stage)) return null
  return a
}
export function writeAttempt(a: Attempt): boolean {
  memory.set(key(a.paperId, a.id), a)
  memoryLatest.set(a.paperId, { id: a.id, stage: a.stage })
  const success = save(key(a.paperId, a.id), a)
  const index = save(`latest:${a.paperId}`, { id: a.id, stage: a.stage })
  return success && index
}
export function latestAttempt(paperId: string): { id: string; stage: 'exam' | 'results' } | null {
  const latest = memoryLatest.get(paperId) ?? load<{ id?: string; stage?: 'exam' | 'results' }>(`latest:${paperId}`, {})
  return latest.id && ['exam', 'results'].includes(latest.stage ?? '') ? latest as { id: string; stage: 'exam' | 'results' } : null
}
export function newAttempt(p: PaperCase, id: string): Attempt {
  return { version: VERSION, id, paperId: p.id, signature: signature(p), stage: 'exam', answers: {}, notes: '', marks: {}, elapsed: 0, savedAt: Date.now() }
}
export function benchState(m: BenchModel): BenchState {
  const item = m.held?.item
  let heldMaterial: BenchState['heldMaterial']
  if (item?.k === 'spatula' && item.load) heldMaterial = { kind: 'spatula', contents: [...item.load], from: item.from, colour: item.colour }
  if (item?.k === 'pipette' && item.gas) heldMaterial = { kind: 'pipette', contents: [...item.gas] }
  return { lab: m.lab.toState(), places: [...m.places], badges: [...m.badges], funnel: { ...m.funnel }, tile: m.tile.map(t => ({ ...t })), burner: { ...m.burner }, heldMaterial }
}
export function restoreBench(p: PaperCase, state?: BenchState): BenchModel {
  const lab = state ? Lab.fromState(state.lab, p) : new Lab(p)
  const m = new BenchModel(lab, p)
  if (!state) return m
  const slots = new Set<number>()
  if (!Array.isArray(state.places) || !state.places.every(([id, place]) => {
    if (!lab.vessels.has(id)) return false
    if (place.at === 'burner') return ['high', 'low'].includes(place.zone)
    if (place.at !== 'rack' || !Number.isInteger(place.slot) || place.slot < 0 || place.slot >= RACK_SLOTS || slots.has(place.slot)) return false
    slots.add(place.slot); return true
  })) throw new Error('Invalid saved apparatus positions')
  m.places = new Map(state.places)
  if (!Array.isArray(state.badges) || !state.badges.every(([id, label]) => lab.vessels.has(id) && typeof label === 'string')) throw new Error('Invalid saved labels')
  m.badges = new Map(state.badges)
  if (!state.funnel || [state.funnel.on, state.funnel.paperId].some(id => id !== null && !lab.vessels.has(id))) throw new Error('Invalid saved filter')
  m.funnel = { ...state.funnel }
  if (!Array.isArray(state.tile) || !state.tile.every(t => ['red-litmus', 'blue-litmus', 'universal-indicator'].includes(t.paper) && typeof t.damp === 'boolean' && (!t.colour || t.colour.length === 3 && t.colour.every(Number.isFinite)))) throw new Error('Invalid saved test papers')
  m.tile = state.tile.map(t => ({ ...t, colour: t.colour ? [...t.colour] : null }))
  if (!state.burner || ![state.burner.gas, state.burner.lit, state.burner.air].every(v => typeof v === 'boolean')) throw new Error('Invalid saved burner')
  m.burner = { ...state.burner }
  // Restore material in a safe, stationary location; never restore a pointer, pour or gas test.
  if (state.heldMaterial) {
    const h = state.heldMaterial
    if (!['spatula', 'pipette'].includes(h.kind) || !Array.isArray(h.contents) || !h.contents.every(([id, n]) => SPECIES[id] && Number.isFinite(n) && n >= 0)) throw new Error('Invalid saved held material')
    const item = h.kind === 'spatula' ? { k: 'spatula' as const, load: new Map(h.contents), from: h.from ?? null, colour: h.colour ?? null } : { k: 'pipette' as const, gas: new Map(h.contents) }
    m.held = { item, x: 80, y: 300, dragging: false, ox: 0, oy: 0 }
  }
  return m
}

export function importAttempt(value: unknown, paper: PaperCase): Attempt {
  const a = value as Attempt
  if (!a || a.version !== VERSION || !/^\d+$/.test(a.id) || a.paperId !== paper.id || a.signature !== signature(paper) || !isAnswers(a.answers) || !isMarks(a.marks) || typeof a.notes !== 'string' || !Number.isFinite(a.elapsed) || a.elapsed < 0 || !['exam', 'results'].includes(a.stage)) throw new Error('The backup is invalid or belongs to an older experiment configuration.')
  if (a.bench) restoreBench(paper, a.bench)
  // Import creates an independent attempt so it cannot overwrite a newer local record.
  const imported = { ...a, id: String(Date.now()), savedAt: Date.now() }
  writeAttempt(imported)
  return imported
}
