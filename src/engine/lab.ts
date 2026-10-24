// The laboratory: vessels, samples, reagents, a clock and the actions a candidate can take.
// Every action returns exam-style observations derived from the change in state.

import { appearance, type Appearance } from './appearance'
import { COMPOUNDS, compoundSpecies } from './compounds'
import { describe, snapshot, Tracker, cap, drySolidDescription, type Observation, type Snapshot } from './observe'
import { REAGENTS, type ReagentDef } from './reagents'
import { SPECIES, type FlameElement } from './species'
import { estimatePH, vapourPressure, Vessel, VESSEL_SPECS, type HeatMode, type VesselKind } from './vessel'

export type Amount =
  | { drops: number }
  | { cm3: number }
  | { depth: number }
  | { spatula: 'small' | 'normal' }
  | { grams: number }
  | { fraction: number }
  | { pieces: number }
  | { all: true }

export const DROP_VOLUME = 0.05
export const FEW_DROPS = 5
const SPATULA_GRAMS = { small: 0.1, normal: 0.3 }

export interface SampleDef {
  id: string
  /** e.g. "solid E", "FA 7" */
  label: string
  kind: 'solid' | 'solution'
  solid?: { compound: string; grams: number }[]
  solution?: { conc: Record<string, number>; volume: number }
  container?: VesselKind
}

export type GasTest =
  | 'damp-red-litmus'
  | 'damp-blue-litmus'
  | 'limewater'
  | 'glowing-splint'
  | 'lighted-splint'
  | 'acidified-kmno4'
  | 'acidified-dichromate-paper'
  | 'damp-universal-indicator'

export const GAS_TEST_LABELS: Record<GasTest, string> = {
  'damp-red-litmus': 'damp red litmus paper',
  'damp-blue-litmus': 'damp blue litmus paper',
  limewater: 'limewater',
  'glowing-splint': 'glowing splint',
  'lighted-splint': 'lighted splint',
  'acidified-kmno4': 'acidified aqueous potassium manganate(VII)',
  'acidified-dichromate-paper': 'acidified potassium dichromate(VI) paper',
  'damp-universal-indicator': 'damp universal indicator paper',
}

/** Where material comes from in a pour: a bench reagent or another vessel. */
export type Source = { vesselId: string } | { reagentId: string }

export type IndicatorPaper = 'red-litmus' | 'blue-litmus' | 'universal-indicator'

/**
 * An action that is still going on: a pour that lasts as long as the bottle is held over the
 * tube, drops from a dropper, a tube held in the flame. Observations are worked out when it is
 * released and has had a few seconds to settle, so delayed changes (fizzing, colours) count.
 */
export interface OpenAction {
  vesselId: string
  label: string
  before: Snapshot
  beforeAmounts: Map<string, number>
  beforeDryName?: string
  tracker: Tracker
  mark: number
  start: number
  addedAmounts: Map<string, number>
  dissolving: boolean
  heating: boolean
  closeAt: number | null
  /** post-process the observations when the action is finished */
  finalize?: (obs: Observation[]) => Observation[]
}

export interface ActionResult {
  vesselId?: string
  action: string
  observations: Observation[]
  time: number
  /** how the vessel looked during the action, for step-by-step playback (not kept in the journal) */
  frames?: Frame[]
}

export interface Frame {
  /** seconds since the start of the action */
  t: number
  a: Appearance
}

export interface JournalEntry extends Omit<ActionResult, 'frames'> {
  vesselLabel?: string
}

function amountLabel(a: Amount): string {
  if ('drops' in a) return a.drops === 1 ? '1 drop' : `${a.drops} drops`
  if ('cm3' in a) return `${round(a.cm3)} cm³`
  if ('depth' in a) return `${round(a.depth)} cm depth`
  if ('spatula' in a) return a.spatula === 'small' ? 'a small spatula measure' : 'a spatula measure'
  if ('grams' in a) return `${round(a.grams)} g`
  if ('fraction' in a) return a.fraction >= 0.999 ? 'all' : `${Math.round(a.fraction * 100)}%`
  if ('pieces' in a) return a.pieces === 1 ? 'a piece' : `${a.pieces} pieces`
  return 'all'
}
const round = (x: number) => Math.round(x * 100) / 100

export interface LabState {
  time: number
  samples: [string, string][]
  added: [string, string[]][]
  labelCounters: Partial<Record<VesselKind, number>>
  journal: JournalEntry[]
  vessels: (Pick<Vessel, 'id' | 'kind' | 'label' | 'V' | 'T' | 'stoppered' | 'bubbleRate' | 'condensation' | 'settled' | 'age'> & {
    n: [string, number][]; headspace: [string, number][]
  })[]
}

export class Lab {
  time = 0
  vessels = new Map<string, Vessel>()
  /** sample id -> id of the vessel that holds it */
  samples = new Map<string, string>()
  sampleDefs: SampleDef[]
  reagentIds: string[]
  journal: JournalEntry[] = []
  /** solids that were put into each vessel (as opposed to formed in it) */
  private added = new Map<string, Set<string>>()

  constructor(opts: { samples?: SampleDef[]; reagents?: string[] } = {}) {
    this.sampleDefs = opts.samples ?? []
    this.reagentIds = opts.reagents ?? Object.keys(REAGENTS)
    for (const s of this.sampleDefs) this.loadSample(s)
  }

  /** A passive copy: current gestures are written up on the copy, never replayed on restore. */
  toState(): LabState {
    const copy = new Lab()
    copy.time = this.time
    copy.vessels = new Map([...this.vessels].map(([id, v]) => {
      const clone = v.clone()
      clone.log = [...v.log]
      return [id, clone]
    }))
    copy.added = new Map([...this.added].map(([id, set]) => [id, new Set(set)]))
    copy.journal = [...this.journal]
    copy.actions = this.actions.map(a => ({ ...a }))
    copy.flush()
    return {
      time: copy.time, samples: [...this.samples], added: [...copy.added].map(([id, set]) => [id, [...set]]),
      labelCounters: { ...this.labelCounters },
      journal: copy.journal.map(entry => ({ ...entry })),
      vessels: [...copy.vessels.values()].map(v => ({ id: v.id, kind: v.kind, label: v.label,
        n: [...v.n], V: v.V, T: v.T, stoppered: v.stoppered, headspace: [...v.headspace],
        bubbleRate: v.bubbleRate, condensation: v.condensation, settled: v.settled, age: v.age })),
    }
  }

  static fromState(state: LabState, opts: { samples: SampleDef[]; reagents: string[] }): Lab {
    const lab = new Lab()
    const finite = (n: number) => typeof n === 'number' && Number.isFinite(n)
    const nonnegative = (n: number) => finite(n) && n >= 0
    const amounts = (entries: [string, number][]) => {
      if (!Array.isArray(entries) || !entries.every(e => Array.isArray(e) && e.length === 2 && SPECIES[e[0]] && nonnegative(e[1]))) throw new Error('Invalid saved chemicals')
      return new Map(entries)
    }
    if (!nonnegative(state.time) || !Array.isArray(state.vessels) || !Array.isArray(state.journal) || !Array.isArray(state.samples) || !Array.isArray(state.added)) throw new Error('Invalid saved experiment')
    for (const saved of state.vessels) {
      if (!/^v\d+$/.test(saved.id) || lab.vessels.has(saved.id) || !['test-tube', 'boiling-tube', 'hard-glass-tube', 'filter-paper'].includes(saved.kind) || typeof saved.label !== 'string' || !nonnegative(saved.V) || !finite(saved.T) || typeof saved.stoppered !== 'boolean' || ![saved.bubbleRate, saved.condensation, saved.settled, saved.age].every(nonnegative)) throw new Error('Invalid saved vessel')
      const v = new Vessel(saved.kind, saved.label, saved.id)
      Object.assign(v, { V: saved.V, T: saved.T, stoppered: saved.stoppered, bubbleRate: saved.bubbleRate, condensation: saved.condensation, settled: saved.settled, age: saved.age })
      v.n = amounts(saved.n)
      v.headspace = amounts(saved.headspace)
      lab.vessels.set(v.id, v)
    }
    if (!state.samples.every(([sample, id]) => opts.samples.some(s => s.id === sample) && lab.vessels.has(id)) || state.samples.length !== opts.samples.length || new Set(state.samples.map(([id]) => id)).size !== opts.samples.length) throw new Error('Saved samples do not match this question')
    if (!state.journal.every(j => typeof j.action === 'string' && typeof j.vesselLabel === 'string' && nonnegative(j.time) && Array.isArray(j.observations) && j.observations.every(o => typeof o.kind === 'string' && typeof o.text === 'string'))) throw new Error('Invalid saved journal')
    lab.time = state.time
    lab.samples = new Map(state.samples)
    lab.sampleDefs = opts.samples
    lab.reagentIds = opts.reagents
    lab.journal = state.journal.map(j => ({ ...j, observations: j.observations.map(o => ({ ...o })) }))
    lab.added = new Map(state.added.map(([id, species]) => {
      if (!lab.vessels.has(id) || !Array.isArray(species) || !species.every(s => SPECIES[s])) throw new Error('Invalid saved solids')
      return [id, new Set(species)]
    }))
    for (const id of lab.vessels.keys()) if (!lab.added.has(id)) lab.added.set(id, new Set())
    lab.labelCounters = Object.fromEntries(Object.entries(state.labelCounters).filter(([kind, count]) => ['test-tube', 'boiling-tube', 'hard-glass-tube', 'filter-paper'].includes(kind) && nonnegative(count)))
    return lab
  }

  // ------------------------------------------------------------------ setup
  private loadSample(s: SampleDef) {
    const v = this.newVessel(s.container ?? (s.kind === 'solid' ? 'boiling-tube' : 'boiling-tube'), s.label)
    v.stoppered = true
    if (s.kind === 'solid') {
      for (const part of s.solid ?? []) {
        const d = COMPOUNDS[part.compound]
        if (!d) throw new Error(`Unknown compound ${part.compound}`)
        const sp = compoundSpecies(part.compound)
        v.change(sp, (part.grams / d.molarMass) * 1000)
        this.markAdded(v, sp)
      }
    } else if (s.solution) {
      for (const [id, c] of Object.entries(s.solution.conc)) v.change(id, c * s.solution.volume)
      v.V = s.solution.volume
      v.settle(this.time)
      v.log = []
    }
    this.samples.set(s.id, v.id)
    return v
  }

  newVessel(kind: VesselKind, label?: string): Vessel {
    const v = new Vessel(kind, label ?? this.autoLabel(kind))
    this.vessels.set(v.id, v)
    this.added.set(v.id, new Set())
    return v
  }

  private labelCounters: Partial<Record<VesselKind, number>> = {}
  private autoLabel(kind: VesselKind) {
    const n = (this.labelCounters[kind] ?? 0) + 1
    this.labelCounters[kind] = n
    return `${VESSEL_SPECS[kind].label} ${n}`
  }

  vessel(id: string): Vessel {
    const v = this.vessels.get(id) ?? this.vessels.get(this.samples.get(id) ?? '')
    if (!v) throw new Error(`No vessel ${id}`)
    return v
  }

  sampleVessel(sampleId: string): Vessel {
    return this.vessel(this.samples.get(sampleId)!)
  }

  private markAdded(v: Vessel, sp: string) {
    if (!this.added.has(v.id)) this.added.set(v.id, new Set())
    this.added.get(v.id)!.add(sp)
  }

  // ------------------------------------------------------------------ clock
  /** Advance every vessel except `skip` by dt seconds. */
  private elapse(dt: number, skip?: Vessel) {
    for (const v of this.vessels.values()) if (v !== skip) v.advance(dt, this.time)
    this.time += dt
  }

  /** Real time passing on the bench (not recorded in the journal). */
  tick(dt: number) {
    if (!Number.isFinite(dt) || dt < 0) throw new RangeError('Elapsed time must be finite and nonnegative')
    this.elapse(dt)
    for (const a of [...this.actions]) {
      const v = this.vessels.get(a.vesselId)
      if (!v) {
        this.actions.splice(this.actions.indexOf(a), 1)
        continue
      }
      a.tracker.update(snapshot(v))
      if (a.closeAt !== null && this.time >= a.closeAt) this.finish(a)
    }
  }

  // ------------------------------------------------------------------ core mixing routine
  private mix(dest: Vessel, n: Map<string, number>, V: number, label: string, opts: { dissolving?: boolean; seconds?: number; temperature?: number } = {}): ActionResult {
    const before = snapshot(dest)
    const beforeAmounts = new Map(dest.n)
    const tracker = new Tracker(before)
    const mark = dest.log.length
    for (const [id] of n) if (SPECIES[id]?.phase === 's') this.markAdded(dest, id)
    const steps = Math.max(1, Math.min(14, Math.ceil(V / 0.12)))
    const hasSolid = [...n.keys()].some((id) => SPECIES[id]?.phase === 's')
    const seconds = opts.seconds ?? Math.max(hasSolid ? 4 : 1, Math.min(6, 1 + steps * 0.4))
    const dt = seconds / steps
    const frames: Frame[] = [{ t: 0, a: appearance(dest) }]
    for (let i = 0; i < steps; i++) {
      const part = new Map<string, number>()
      for (const [id, amt] of n) part.set(id, amt / steps)
      dest.receive(part, V / steps, opts.temperature)
      dest.settle(this.time)
      dest.advance(dt, this.time)
      tracker.update(snapshot(dest))
      frames.push({ t: (i + 1) * dt, a: appearance(dest) })
    }
    if (dest.V > dest.spec.capacity) {
      dest.takeFraction((dest.V - dest.spec.capacity) / dest.V, true)
      dest.log.push({ kind: 'overflow', amount: 0, time: this.time })
    }
    dest.settled *= 0.5
    this.elapse(seconds, dest)
    const observations = describe(dest, before, tracker, dest.log.slice(mark), this.added.get(dest.id)!, {
      dissolving: opts.dissolving,
      seconds,
      addedAmounts: n,
      beforeAmounts,
    })
    return this.record({ vesselId: dest.id, action: label, observations, time: this.time, frames })
  }

  private record(r: ActionResult): ActionResult {
    const v = r.vesselId ? this.vessels.get(r.vesselId) : undefined
    const { frames: _frames, ...entry } = r
    this.journal.push({ ...entry, vesselLabel: v?.label })
    return r
  }

  private liquidVolume(a: Amount, dest: Vessel, source?: Vessel): number {
    if ('drops' in a) return a.drops * DROP_VOLUME
    if ('cm3' in a) return a.cm3
    if ('depth' in a) return a.depth * dest.spec.area
    if ('fraction' in a) return (source?.V ?? 0) * a.fraction
    if ('all' in a) return source?.V ?? 0
    throw new Error(`Amount ${JSON.stringify(a)} is not a liquid amount`)
  }

  private requireOpen(v: Vessel) {
    if (v.stoppered) throw new Error(`Remove the stopper from ${v.label} first`)
  }

  private validateAmount(amount: Amount) {
    if (!amount || Object.keys(amount).length !== 1) throw new RangeError('Specify exactly one amount')
    for (const [key, value] of Object.entries(amount)) {
      if (key === 'spatula' && (value === 'small' || value === 'normal')) continue
      if (key === 'all' && value === true) continue
      if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || (key === 'fraction' && value > 1)) {
        throw new RangeError('Amounts must be finite and positive; fractions must be at most one')
      }
    }
  }

  // ------------------------------------------------------------------ actions
  addReagent(vesselId: string, reagentId: string, amount: Amount): ActionResult {
    const dest = this.vessel(vesselId)
    this.requireOpen(dest)
    this.validateAmount(amount)
    const r: ReagentDef | undefined = REAGENTS[reagentId]
    if (!r) throw new Error(`Unknown reagent ${reagentId}`)
    const label = `Add ${amountLabel(amount)} of ${r.label}`
    if (r.kind === 'solution') {
      const V = this.liquidVolume(amount, dest)
      const n = new Map<string, number>()
      for (const [id, c] of Object.entries(r.conc ?? {})) n.set(id, c * V)
      const dissolving = !dest.wet && [...dest.n.keys()].some((id) => SPECIES[id]?.phase === 's')
      return this.mix(dest, n, V, label, { dissolving, seconds: 'drops' in amount ? Math.min(8, 1 + amount.drops * 0.5) : undefined })
    }
    const d = COMPOUNDS[r.compound!]
    let grams = 0
    if ('pieces' in amount) grams = (r.pieceGrams ?? 0.05) * amount.pieces
    else if ('spatula' in amount) grams = SPATULA_GRAMS[amount.spatula]
    else if ('grams' in amount) grams = amount.grams
    else grams = r.pieceGrams ?? 0.1
    const sp = compoundSpecies(d.id)
    return this.mix(dest, new Map([[sp, (grams / d.molarMass) * 1000]]), 0, label, { seconds: 3 })
  }

  /** Pour liquid (or tip solid) from one vessel into another. */
  transfer(fromId: string, toId: string, amount: Amount): ActionResult {
    const from = this.vessel(fromId)
    const dest = this.vessel(toId)
    this.requireOpen(from)
    this.requireOpen(dest)
    this.validateAmount(amount)
    if (from === dest) throw new Error('Use different source and destination vessels')
    let moved: { n: Map<string, number>; V: number }
    let label: string
    if (from.wet) {
      const V = Math.min(from.V, this.liquidVolume(amount, dest, from))
      moved = from.takeFraction(V / from.V, true)
      label = `Transfer ${amountLabel(amount)} of the contents of ${from.label} to ${dest.label}`
    } else {
      const total = this.solidMass(from)
      let grams: number
      if ('fraction' in amount) grams = total * amount.fraction
      else if ('all' in amount) grams = total
      else if ('spatula' in amount) grams = SPATULA_GRAMS[amount.spatula]
      else if ('grams' in amount) grams = amount.grams
      else grams = total * 0.5
      const f = total > 0 ? Math.min(1, grams / total) : 0
      moved = from.takeFraction(f, true)
      moved.V = 0
      label = `Transfer ${amountLabel(amount)} of ${from.label} to ${dest.label}`
      for (const id of moved.n.keys()) if (this.added.get(from.id)?.has(id)) this.markAdded(dest, id)
    }
    const dissolving = !dest.wet && moved.V > 0 && [...dest.n.keys()].some((id) => SPECIES[id]?.phase === 's')
    return this.mix(dest, moved.n, moved.V, label, { dissolving, temperature: from.T })
  }

  /** Split the liquid in a vessel equally into new vessels. */
  divide(fromId: string, kinds: VesselKind[]): { results: ActionResult[]; vesselIds: string[] } {
    const from = this.vessel(fromId)
    const ids: string[] = []
    const results: ActionResult[] = []
    const parts = kinds.length
    for (let i = 0; i < parts; i++) {
      const v = this.newVessel(kinds[i])
      ids.push(v.id)
      const f = 1 / (parts - i)
      results.push(this.transfer(from.id, v.id, from.wet ? { fraction: f } : { fraction: f }))
    }
    return { results, vesselIds: ids }
  }

  private solidMass(v: Vessel) {
    let g = 0
    for (const [id, amt] of v.n) {
      if (SPECIES[id]?.phase !== 's') continue
      g += (amt / 1000) * molarMassOf(id)
    }
    return g
  }

  heat(vesselId: string, mode: HeatMode, seconds = 30): ActionResult {
    const v = this.vessel(vesselId)
    if (!Number.isFinite(seconds) || seconds <= 0) throw new RangeError('Heating time must be finite and positive')
    const problem = v.heatingProblem(mode)
    if (problem) return this.record({ vesselId: v.id, action: 'Heating blocked', observations: [{ kind: 'event', text: problem }], time: this.time })
    const before = snapshot(v)
    const beforeDryName = v.wet ? undefined : drySolidDescription(v)?.name
    const tracker = new Tracker(before)
    const mark = v.log.length
    v.startHeating(mode)
    const frames: Frame[] = [{ t: 0, a: appearance(v) }]
    const step = 2
    let t = 0
    while (t < seconds) {
      const h = Math.min(step, seconds - t)
      v.advance(h, this.time + t)
      tracker.update(snapshot(v))
      t += h
      frames.push({ t, a: appearance(v) })
    }
    v.startHeating(null)
    this.elapse(seconds, v)
    const label =
      mode === 'warm' ? 'Warm gently' : mode === 'boil' ? 'Heat to boiling' : mode === 'gentle' ? 'Heat gently' : 'Heat strongly'
    const obs = describe(v, before, tracker, v.log.slice(mark), this.added.get(v.id)!, { heating: !v.wet, seconds, beforeDryName })
    return this.record({ vesselId: v.id, action: `${label} for ${seconds} s`, observations: obs, time: this.time, frames })
  }

  /** Let time pass (all vessels). Observations are reported for `vesselId` if given. */
  wait(seconds: number, vesselId?: string): ActionResult {
    if (!Number.isFinite(seconds) || seconds < 0) throw new RangeError('Waiting time must be finite and nonnegative')
    const v = vesselId ? this.vessel(vesselId) : undefined
    const before = v ? snapshot(v) : undefined
    const tracker = before ? new Tracker(before) : undefined
    const mark = v?.log.length ?? 0
    const wasHot = v ? v.T > 150 && !v.wet : false
    const frames: Frame[] = v ? [{ t: 0, a: appearance(v) }] : []
    let t = 0
    while (t < seconds) {
      const h = Math.min(10, seconds - t)
      for (const x of this.vessels.values()) x.advance(h, this.time)
      this.time += h
      t += h
      if (v && tracker) {
        tracker.update(snapshot(v))
        frames.push({ t, a: appearance(v) })
      }
    }
    let observations: Observation[] = []
    if (v && before && tracker) {
      observations = describe(v, before, tracker, v.log.slice(mark), this.added.get(v.id)!, { seconds })
      if (wasHot && v.T < 100) {
        const dry = drySolidDescription(v)
        if (dry) observations = observations.filter((o) => o.kind !== 'none').concat({ kind: 'residue', text: `On cooling, the solid is ${dry.name}.` })
      }
    }
    return this.record({ vesselId: v?.id, action: `Leave to stand for ${seconds} s`, observations, time: this.time, frames: v ? frames : undefined })
  }

  shake(vesselId: string): ActionResult {
    const v = this.vessel(vesselId)
    const before = snapshot(v)
    const tracker = new Tracker(before)
    const mark = v.log.length
    v.settled = 0
    v.advance(3, this.time)
    this.elapse(3, v)
    return this.record({ vesselId: v.id, action: 'Shake', observations: describe(v, before, tracker, v.log.slice(mark), this.added.get(v.id)!), time: this.time })
  }

  setStopper(vesselId: string, on: boolean) {
    this.vessel(vesselId).stoppered = on
  }

  /** Hold a test at the mouth of the tube for a few seconds. */
  gasTest(vesselId: string, test: GasTest): ActionResult {
    const v = this.vessel(vesselId)
    // The paper is exposed throughout the four seconds: a positive colour change does not
    // disappear just because the tube cools before it is withdrawn.
    let text = this.gasReading(v.id, test)
    for (let i = 0; i < 4; i++) {
      v.advance(1, this.time)
      this.elapse(1, v)
      const reading = this.gasReading(v.id, test)
      if (!/No change|No pop/.test(reading)) text = reading
    }
    return this.record({ vesselId: v.id, action: `Test the gas with ${GAS_TEST_LABELS[test]}`, observations: [{ kind: 'gas-test', text }], time: this.time })
  }

  /** What a test held at the mouth of the tube shows right now (no time passes, nothing recorded). */
  gasReading(vesselId: string, test: GasTest): string {
    const v = this.vessel(vesselId)
    const g = (id: string) => v.headspace.get(id) ?? 0
    // soluble gases: head-space gas from heating solids, or vapour above a solution
    const nh3 = Math.max(g('NH3(g)') / 0.006, vapourPressure(v, 'NH3') / 0.0008) * 0.0061
    const so2 = Math.max(g('SO2(g)') / 0.006, vapourPressure(v, 'SO2(aq)') / 0.004) * 0.0061
    const co2 = g('CO2(g)')
    const o2 = g('O2(g)')
    const h2 = g('H2(g)')
    const cl2 = g('Cl2(g)')
    const hcl = g('HCl(g)')
    const no2 = g('NO2(g)')
    const acidic = so2 > 0.006 || hcl > 0.005 || no2 > 0.003 || cl2 > 0.003
    let text: string
    switch (test) {
      case 'damp-red-litmus':
        if (cl2 > 0.003) text = 'The damp litmus paper is bleached (turns white).'
        else if (nh3 > 0.006 && hcl > 0.005) text = 'The damp red litmus paper turns blue (white fumes are also seen).'
        else if (nh3 > 0.006) text = 'The damp red litmus paper turns blue.'
        else text = 'No change – the damp red litmus paper stays red.'
        break
      case 'damp-blue-litmus':
        if (cl2 > 0.003) text = 'The damp blue litmus paper turns red and is then bleached.'
        else if (acidic) text = 'The damp blue litmus paper turns red.'
        else if (co2 > 0.25) text = 'The damp blue litmus paper turns slightly red / purple.'
        else text = 'No change – the damp blue litmus paper stays blue.'
        break
      case 'limewater':
        if (co2 > 0.02 || so2 > 0.012) text = 'The limewater turns milky (white precipitate).'
        else text = 'No change – the limewater stays clear.'
        break
      case 'glowing-splint':
        if (o2 > 0.04) text = 'The glowing splint relights.'
        else if (co2 > 0.05) text = 'The glowing splint goes out.'
        else text = 'No change – the glowing splint does not relight.'
        break
      case 'lighted-splint':
        if (h2 > 0.01) text = 'The gas burns with a squeaky pop.'
        else if (co2 > 0.05) text = 'The lighted splint is extinguished.'
        else text = 'No pop – the splint keeps burning.'
        break
      case 'acidified-kmno4':
        if (so2 > 0.006) text = 'The acidified potassium manganate(VII) turns from purple to colourless.'
        else text = 'No change – the acidified potassium manganate(VII) stays purple.'
        break
      case 'acidified-dichromate-paper':
        if (so2 > 0.006) text = 'The paper turns from orange to green.'
        else text = 'No change – the paper stays orange.'
        break
      case 'damp-universal-indicator':
        if (cl2 > 0.003) text = 'The damp universal indicator paper is bleached (turns white).'
        else if (nh3 > 0.006) text = 'The damp universal indicator paper turns blue.'
        else if (acidic) text = 'The damp universal indicator paper turns red.'
        else text = 'No change – the damp universal indicator paper stays green.'
        break
    }
    return text
  }

  flameTest(vesselId: string): ActionResult {
    const v = this.vessel(vesselId)
    const text = this.flameReading(v.id)
    this.elapse(10)
    return this.record({ vesselId: v.id, action: 'Carry out a flame test', observations: [{ kind: 'flame', text }], time: this.time })
  }

  /** The flame colour the contents of a vessel give (no time passes, nothing recorded). */
  flameReading(vesselId: string): string {
    const v = this.vessel(vesselId)
    const el = flameElements(v)
    const total = Object.values(el).reduce((s, x) => s + x, 0)
    let text: string
    if (total < 2e-4) text = 'No characteristic flame colour.'
    else {
      const na = el.Na ?? 0
      const others = total - na
      if (na > 0.1 * others && na > 1e-4) text = 'Yellow flame.'
      else {
        const top = (Object.entries(el) as [FlameElement, number][]).filter(([k]) => k !== 'Na').sort((a, b) => b[1] - a[1])[0][0]
        text = { Li: 'Red flame.', K: 'Lilac flame.', Ca: 'Orange-red flame.', Ba: 'Light green flame.', Cu: 'Blue-green flame.', Sr: 'Red flame.', Na: 'Yellow flame.' }[top]
      }
    }
    return text
  }

  pHTest(vesselId: string): ActionResult {
    const v = this.vessel(vesselId)
    let text: string
    if (!v.wet) text = 'The solid must be dissolved in water first.'
    else {
      const pH = Math.round(estimatePH(v))
      text = `Universal indicator paper turns ${indicatorColour(pH)}: pH ≈ ${pH}.`
    }
    this.elapse(5)
    return this.record({ vesselId: v.id, action: 'Test with universal indicator paper', observations: [{ kind: 'pH', text }], time: this.time })
  }

  /** Filter: liquid goes to `filtrateVesselId` (new test-tube if omitted), solids stay on the paper. */
  filter(vesselId: string, filtrateVesselId?: string): { result: ActionResult; filtrateId: string; residueId: string } {
    const v = this.vessel(vesselId)
    this.requireOpen(v)
    const dest = filtrateVesselId ? this.vessel(filtrateVesselId) : this.newVessel('test-tube', `filtrate from ${v.label}`)
    this.requireOpen(dest)
    const paper = this.newVessel('filter-paper', `residue from ${v.label}`)
    // solids stay on the paper with a little liquid
    const solids = new Map<string, number>()
    for (const [id, amt] of [...v.n]) {
      if (SPECIES[id]?.phase === 's') {
        solids.set(id, amt)
        v.change(id, -amt)
      }
    }
    const retained = Math.min(v.V, 0.3)
    const wet = v.takeFraction(v.V > 0 ? retained / v.V : 0, false)
    paper.receive(solids, 0)
    paper.receive(wet.n, wet.V, v.T)
    const filtrate = v.takeFraction(1, false)
    const res = this.mix(dest, filtrate.n, filtrate.V, `Filter ${v.label}`, { temperature: v.T })
    for (const id of solids.keys()) this.markAdded(paper, id)
    paper.settle(this.time)
    const desc = drySolidDescription(paper)
    const obs: Observation[] = [
      { kind: 'filtrate', text: `The filtrate is ${dest.wet ? snapshot(dest).solution.name : 'absent'}.` },
      { kind: 'residue', text: desc ? `${cap(desc.name)} residue on the filter paper.` : 'No residue on the filter paper.' },
    ]
    // record() shares this array with the journal: keep both views of the action consistent.
    res.observations.splice(0, res.observations.length, ...obs)
    return { result: res, filtrateId: dest.id, residueId: paper.id }
  }

  /** Pour the contents away. A thin film of the old mixture stays behind unless rinsed. */
  empty(vesselId: string): ActionResult {
    const v = this.vessel(vesselId)
    this.flushVessel(v.id)
    if (v.wet) {
      const keep = Math.min(1, 0.04 / v.V)
      const solidsKeep = 0.03
      for (const [id, amt] of [...v.n]) {
        const f = SPECIES[id]?.phase === 's' ? solidsKeep : keep
        v.change(id, -amt * (1 - f))
      }
      v.V = Math.min(v.V, 0.04)
    } else {
      for (const [id, amt] of [...v.n]) v.change(id, -amt * 0.98)
    }
    v.headspace.clear()
    v.bubbleRate = 0
    v.condensation = 0
    return this.record({ vesselId: v.id, action: 'Empty the tube', observations: [], time: this.time })
  }

  /** Empty and rinse with distilled water (leaves a negligible trace and a few drops of water). */
  rinse(vesselId: string): ActionResult {
    const v = this.vessel(vesselId)
    this.flushVessel(v.id)
    for (const [id, amt] of [...v.n]) v.change(id, -amt * 0.9995)
    v.V = 0.03
    v.headspace.clear()
    v.bubbleRate = 0
    v.condensation = 0
    v.settled = 0
    this.added.set(v.id, new Set())
    this.elapse(5)
    return this.record({ vesselId: v.id, action: 'Rinse with distilled water', observations: [], time: this.time })
  }

  discard(vesselId: string) {
    for (const a of [...this.actions]) if (a.vesselId === vesselId) this.actions.splice(this.actions.indexOf(a), 1)
    this.vessels.delete(vesselId)
    this.added.delete(vesselId)
  }

  // ------------------------------------------------------------------ continuous (real-time) actions
  private actions: OpenAction[] = []

  /** Start an action on a vessel. Material is added with the *Step methods; time passes with tick(). */
  begin(vesselId: string, label: string, opts: { heating?: boolean } = {}): OpenAction {
    const v = this.vessel(vesselId)
    // an earlier action on this vessel that is still settling is written up first
    // Heating and adding chemicals may happen together. Only replace actions of the same kind.
    for (const a of [...this.actions]) if (a.vesselId === v.id && a.heating === !!opts.heating) this.finish(a)
    const before = snapshot(v)
    const a: OpenAction = {
      vesselId: v.id,
      label,
      before,
      beforeAmounts: new Map(v.n),
      beforeDryName: v.wet ? undefined : drySolidDescription(v)?.name,
      tracker: new Tracker(before),
      mark: v.log.length,
      start: this.time,
      addedAmounts: new Map(),
      dissolving: false,
      heating: !!opts.heating,
      closeAt: null,
    }
    this.actions.push(a)
    return a
  }

  /** The gesture is over; the action is written up after `linger` seconds of bench time. */
  release(a: OpenAction, label?: string, linger = 4): ActionResult | undefined {
    if (label) a.label = label
    if (!this.actions.includes(a)) return undefined
    a.closeAt = this.time + linger
    if (linger <= 0) return this.finish(a)
    return undefined
  }

  /** Write up every open action now (e.g. before marking). */
  flush() {
    for (const a of [...this.actions]) this.finish(a)
  }

  private flushVessel(id: string) {
    for (const a of [...this.actions]) if (a.vesselId === id) this.finish(a)
  }

  isOpen(a: OpenAction) {
    return this.actions.includes(a)
  }

  /** Drop an action that turned out to do nothing (e.g. a dropper put down without a squeeze). */
  cancel(a: OpenAction) {
    const i = this.actions.indexOf(a)
    if (i >= 0) this.actions.splice(i, 1)
  }

  private finish(a: OpenAction): ActionResult | undefined {
    const i = this.actions.indexOf(a)
    if (i < 0) return undefined
    this.actions.splice(i, 1)
    const v = this.vessels.get(a.vesselId)
    if (!v) return undefined
    let obs = describe(v, a.before, a.tracker, v.log.slice(a.mark), this.added.get(v.id)!, {
      heating: a.heating && !v.wet,
      dissolving: a.dissolving,
      seconds: Math.max(1, this.time - a.start),
      addedAmounts: a.addedAmounts,
      beforeAmounts: a.beforeAmounts,
      beforeDryName: a.beforeDryName,
    })
    if (a.finalize) obs = a.finalize(obs)
    return this.record({ vesselId: v.id, action: a.label, observations: obs, time: this.time })
  }

  /** Take up to `cm3` of liquid (or the equivalent amount of solid) from a source. */
  private take(src: Source, cm3: number): { n: Map<string, number>; V: number; solidFromVessel: boolean; temperature?: number } {
    if ('reagentId' in src) {
      const r = REAGENTS[src.reagentId]
      if (!r || r.kind !== 'solution') throw new Error(`${src.reagentId} cannot be poured`)
      const n = new Map<string, number>()
      for (const [id, c] of Object.entries(r.conc ?? {})) n.set(id, c * cm3)
      return { n, V: cm3, solidFromVessel: false }
    }
    const from = this.vessel(src.vesselId)
    if (from.wet) {
      const V = Math.min(from.V, cm3)
      const moved = from.takeFraction(V / from.V, true)
      return { ...moved, solidFromVessel: false, temperature: from.T }
    }
    // tipping a dry solid out of a tube
    const total = this.solidMass(from)
    if (total <= 0) return { n: new Map(), V: 0, solidFromVessel: true }
    const grams = Math.min(total, cm3 * 0.35)
    const moved = from.takeFraction(grams / total, true)
    moved.V = 0
    return { ...moved, solidFromVessel: true }
  }

  private receiveInto(a: OpenAction, dest: Vessel, n: Map<string, number>, V: number, temperature?: number) {
    if (V > 0 && !dest.wet && [...dest.n.keys()].some((id) => SPECIES[id]?.phase === 's')) a.dissolving = true
    for (const [id, amt] of n) {
      a.addedAmounts.set(id, (a.addedAmounts.get(id) ?? 0) + amt)
      if (SPECIES[id]?.phase === 's') this.markAdded(dest, id)
    }
    dest.receive(n, V, temperature)
    if (dest.V > dest.spec.capacity) {
      dest.takeFraction((dest.V - dest.spec.capacity) / dest.V, true)
      dest.log.push({ kind: 'overflow', amount: 0, time: this.time })
    }
    dest.settled *= 0.7
    dest.settle(this.time)
    a.tracker.update(snapshot(dest))
  }

  /** Pour part of a source into the vessel of an open action. Returns the volume (cm³) or mass (g) moved. */
  pourStep(a: OpenAction, src: Source, cm3: number): number {
    const dest = this.vessel(a.vesselId)
    if (!this.isOpen(a) || dest.stoppered || !Number.isFinite(cm3) || cm3 <= 0) return 0
    const { n, V, solidFromVessel, temperature } = this.take(src, cm3)
    this.receiveInto(a, dest, n, V, temperature)
    if (!solidFromVessel) return V
    let g = 0
    for (const [id, amt] of n) g += (amt / 1000) * molarMassOf(id)
    return g
  }

  /** Drops from a dropper bottle. */
  dropStep(a: OpenAction, reagentId: string, drops = 1) {
    return this.pourStep(a, { reagentId }, drops * DROP_VOLUME)
  }

  /** A spatula measure of solid from a vessel (dry contents only) or a solid reagent. Nothing is recorded. */
  scoop(src: Source, grams: number): Map<string, number> {
    if ('reagentId' in src) {
      const r = REAGENTS[src.reagentId]
      if (!r?.compound) return new Map()
      const g = r.kind === 'piece' ? (r.pieceGrams ?? 0.05) : grams
      return new Map([[compoundSpecies(r.compound), (g / COMPOUNDS[r.compound].molarMass) * 1000]])
    }
    const from = this.vessel(src.vesselId)
    if (from.wet) return new Map()
    const total = this.solidMass(from)
    if (total <= 0) return new Map()
    const moved = from.takeFraction(Math.min(1, grams / total), true).n
    for (const id of moved.keys()) if (!this.added.get(from.id)?.has(id)) this.added.get(from.id)?.add(id)
    return moved
  }

  /** Tip solid (from a spatula, or a piece of metal) into the vessel of an open action. */
  deposit(a: OpenAction, n: Map<string, number>) {
    this.receiveInto(a, this.vessel(a.vesselId), n, 0)
  }

  /**
   * Pour through a filter paper sitting in a funnel above the action's vessel: solids stay on the
   * paper (a vessel of kind 'filter-paper'), the liquid runs through into the vessel below.
   */
  filterStep(a: OpenAction, src: Source, paperId: string, cm3: number): number {
    const paper = this.vessel(paperId)
    const dest = this.vessel(a.vesselId)
    if (!this.isOpen(a) || dest.stoppered || !Number.isFinite(cm3) || cm3 <= 0) return 0
    const { n, V, solidFromVessel, temperature } = this.take(src, cm3)
    for (const id of n.keys()) if (SPECIES[id]?.phase === 's') this.markAdded(paper, id)
    paper.receive(n, V, temperature)
    paper.settle(this.time)
    paper.settled = 1
    if (paper.V > 0.3) {
      const drained = paper.takeFraction((paper.V - 0.3) / paper.V, false)
      this.receiveInto(a, dest, drained.n, drained.V, paper.T)
    } else a.tracker.update(snapshot(dest))
    if (!a.finalize) {
      a.finalize = (obs) => {
        const desc = drySolidDescription(paper)
        const out: Observation[] = [{ kind: 'filtrate', text: `The filtrate is ${dest.wet ? snapshot(dest).solution.name : 'absent'}.` }]
        out.push({ kind: 'residue', text: desc ? `${cap(desc.name)} residue on the filter paper.` : 'No residue on the filter paper.' })
        return out.concat(obs.filter((o) => o.kind === 'effervescence' || o.kind === 'gas'))
      }
    }
    return solidFromVessel ? [...n].reduce((g, [id, amt]) => g + amt / 1000 * molarMassOf(id), 0) : V
  }

  /** Heat a vessel (or stop heating it). Time passes with tick(). */
  setHeating(vesselId: string, mode: HeatMode | null) {
    return this.vessel(vesselId).startHeating(mode)
  }

  /** Shake the tube (the change is written up after a few seconds). */
  agitate(vesselId: string) {
    const v = this.vessel(vesselId)
    const a = this.begin(v.id, 'Shake the tube')
    v.settled = 0
    this.release(a, undefined, 3)
  }

  /** Hold a piece of test paper or a splint at the mouth of the tube; recorded, no time passes. */
  mouthTest(vesselId: string, test: GasTest, opts: { damp?: boolean } = {}): ActionResult {
    const v = this.vessel(vesselId)
    const paper = test === 'damp-red-litmus' || test === 'damp-blue-litmus' || test === 'damp-universal-indicator'
    const label = paper && opts.damp === false ? GAS_TEST_LABELS[test].replace('damp ', 'dry ') : GAS_TEST_LABELS[test]
    const text = paper && opts.damp === false ? `No change – the dry ${label.replace(/^dry /, '')} does not change colour.` : this.gasReading(v.id, test)
    return this.record({ vesselId: v.id, action: `Hold ${label} at the mouth of the tube`, observations: [{ kind: 'gas-test', text }], time: this.time })
  }

  /** Dip a strip of indicator paper into the contents of a tube. */
  indicatorDip(vesselId: string, paper: IndicatorPaper): ActionResult {
    const v = this.vessel(vesselId)
    const name = paper === 'red-litmus' ? 'red litmus paper' : paper === 'blue-litmus' ? 'blue litmus paper' : 'universal indicator paper'
    let text: string
    if (!v.wet) text = `No change – there is no solution for the ${name} to test.`
    else if (v.conc('Cl2(aq)') > 1e-4) text = `The ${name} is bleached (turns white).`
    else {
      const pH = estimatePH(v)
      if (paper === 'red-litmus') text = pH > 8 ? 'The red litmus paper turns blue.' : 'No change – the red litmus paper stays red.'
      else if (paper === 'blue-litmus') text = pH < 6 ? 'The blue litmus paper turns red.' : 'No change – the blue litmus paper stays blue.'
      else {
        const r = Math.round(pH)
        text = `Universal indicator paper turns ${indicatorColour(r)}: pH ≈ ${r}.`
      }
    }
    return this.record({ vesselId: v.id, action: `Dip ${name} into the contents of the tube`, observations: [{ kind: 'pH', text }], time: this.time })
  }

  /** Squeeze a teat pipette at the mouth of the tube and draw in the gas there. Nothing is recorded. */
  collectGas(vesselId: string): Map<string, number> {
    const v = this.vessel(vesselId)
    const out = new Map<string, number>()
    for (const [g, amt] of v.headspace) {
      const take = amt * 0.7
      if (take < 1e-6) continue
      out.set(g, take)
      v.headspace.set(g, amt - take)
    }
    // soluble gases above a warm solution
    const nh3 = (vapourPressure(v, 'NH3') / 0.0008) * 0.0061
    const so2 = (vapourPressure(v, 'SO2(aq)') / 0.004) * 0.0061
    for (const [gas, solute, demand] of [['NH3(g)', 'NH3', nh3], ['SO2(g)', 'SO2(aq)', so2]] as const) {
      const existing = out.get(gas) ?? 0
      const extra = Math.min(v.amount(solute) * 0.7, Math.max(0, demand - existing))
      if (extra > 0) {
        out.set(gas, existing + extra)
        v.change(solute, -extra)
      }
    }
    return out
  }

  /** Bubble a gas sample (from collectGas) through the liquid in a tube, e.g. limewater. */
  bubbleGas(sample: Map<string, number>, vesselId: string): ActionResult | undefined {
    const v = this.vessel(vesselId)
    if (!v.wet) return undefined
    const limewater = v.amount('Ca2+') > 0 && v.amount('OH-') > 0
    const a = this.begin(v.id, limewater ? 'Bubble the gas from the teat pipette through the limewater' : 'Bubble the gas from the teat pipette through the liquid')
    const DISSOLVES: Record<string, string> = { 'CO2(g)': 'CO2(aq)', 'SO2(g)': 'SO2(aq)', 'NH3(g)': 'NH3', 'HCl(g)': 'HCl' }
    const n = new Map<string, number>()
    for (const [g, amt] of sample) {
      if (g === 'HCl(g)') {
        n.set('H+', (n.get('H+') ?? 0) + amt)
        n.set('Cl-', (n.get('Cl-') ?? 0) + amt)
      } else if (DISSOLVES[g]) n.set(DISSOLVES[g], (n.get(DISSOLVES[g]) ?? 0) + amt)
    }
    v.bubbleRate += 0.02
    this.receiveInto(a, v, n, 0)
    if (limewater) {
      a.finalize = (obs) =>
        obs.some((o) => o.kind === 'ppt' && /precipitate/.test(o.text))
          ? [{ kind: 'gas-test', text: 'The limewater turns milky (white precipitate).' }]
          : [{ kind: 'gas-test', text: 'No change – the limewater stays clear.' }]
    }
    return this.release(a, undefined, 0)
  }

  /** Record an observation made without changing anything (e.g. a flame test on a loaded wire). */
  note(vesselId: string | undefined, action: string, text: string, kind = 'note'): ActionResult {
    return this.record({ vesselId, action, observations: [{ kind, text }], time: this.time })
  }
}

// ---------------------------------------------------------------------- helpers
const SOLID_ELEMENTS: [RegExp, FlameElement][] = [
  [/^Ba/, 'Ba'], [/^Ca/, 'Ca'], [/^Cu/, 'Cu'], [/^Na/, 'Na'], [/^K[^ ]/, 'K'], [/^Li/, 'Li'], [/^Sr/, 'Sr'],
]

function flameElements(v: Vessel): Partial<Record<FlameElement, number>> {
  const out: Partial<Record<FlameElement, number>> = {}
  const addEl = (e: FlameElement, x: number) => (out[e] = (out[e] ?? 0) + x)
  for (const [id, amt] of v.n) {
    const sp = SPECIES[id]
    if (sp?.flame) {
      addEl(sp.flame, amt)
      continue
    }
    if (id.startsWith('cmp:')) {
      const d = COMPOUNDS[id.slice(4)]
      for (const [ion, nu] of Object.entries(d?.dissolves ?? {})) {
        const f = SPECIES[ion]?.flame
        if (f) addEl(f, amt * nu)
      }
      continue
    }
    if (sp?.phase === 's') {
      for (const [re, e] of SOLID_ELEMENTS) if (re.test(id)) addEl(e, amt)
    }
  }
  return out
}

function indicatorColour(pH: number) {
  if (pH <= 2) return 'red'
  if (pH <= 4) return 'orange'
  if (pH <= 6) return 'yellow'
  if (pH === 7) return 'green'
  if (pH <= 9) return 'blue-green'
  if (pH <= 11) return 'blue'
  return 'purple'
}

export function molarMassOf(id: string): number {
  if (id.startsWith('cmp:')) return COMPOUNDS[id.slice(4)]?.molarMass ?? 100
  for (const d of Object.values(COMPOUNDS)) if (d.asSpecies === id) return d.molarMass
  return 100
}
