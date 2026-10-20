// The laboratory: vessels, samples, reagents, a clock and the actions a candidate can take.
// Every action returns exam-style observations derived from the change in state.

import { COMPOUNDS, compoundSpecies } from './compounds'
import { describe, snapshot, Tracker, cap, drySolidDescription, type Observation } from './observe'
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

export const GAS_TEST_LABELS: Record<GasTest, string> = {
  'damp-red-litmus': 'damp red litmus paper',
  'damp-blue-litmus': 'damp blue litmus paper',
  limewater: 'limewater',
  'glowing-splint': 'glowing splint',
  'lighted-splint': 'lighted splint',
  'acidified-kmno4': 'acidified aqueous potassium manganate(VII)',
  'acidified-dichromate-paper': 'acidified potassium dichromate(VI) paper',
}

export interface ActionResult {
  vesselId?: string
  action: string
  observations: Observation[]
  time: number
}

export interface JournalEntry extends ActionResult {
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
    this.elapse(dt)
  }

  // ------------------------------------------------------------------ core mixing routine
  private mix(dest: Vessel, n: Map<string, number>, V: number, label: string, opts: { dissolving?: boolean; seconds?: number } = {}): ActionResult {
    const before = snapshot(dest)
    const beforeAmounts = new Map(dest.n)
    const tracker = new Tracker(before)
    const mark = dest.log.length
    for (const [id] of n) if (SPECIES[id]?.phase === 's') this.markAdded(dest, id)
    const steps = Math.max(1, Math.min(14, Math.ceil(V / 0.12)))
    const hasSolid = [...n.keys()].some((id) => SPECIES[id]?.phase === 's')
    const seconds = opts.seconds ?? Math.max(hasSolid ? 4 : 1, Math.min(6, 1 + steps * 0.4))
    const dt = seconds / steps
    for (let i = 0; i < steps; i++) {
      const part = new Map<string, number>()
      for (const [id, amt] of n) part.set(id, amt / steps)
      dest.receive(part, V / steps)
      dest.settle(this.time)
      dest.advance(dt, this.time)
      tracker.update(snapshot(dest))
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
    return this.record({ vesselId: dest.id, action: label, observations, time: this.time })
  }

  private record(r: ActionResult): ActionResult {
    const v = r.vesselId ? this.vessels.get(r.vesselId) : undefined
    this.journal.push({ ...r, vesselLabel: v?.label })
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

  // ------------------------------------------------------------------ actions
  addReagent(vesselId: string, reagentId: string, amount: Amount): ActionResult {
    const dest = this.vessel(vesselId)
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
    return this.mix(dest, moved.n, moved.V, label, { dissolving })
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
    const before = snapshot(v)
    const beforeDryName = v.wet ? undefined : drySolidDescription(v)?.name
    const tracker = new Tracker(before)
    const mark = v.log.length
    v.startHeating(mode)
    const step = 2
    let t = 0
    while (t < seconds) {
      const h = Math.min(step, seconds - t)
      v.advance(h, this.time + t)
      tracker.update(snapshot(v))
      t += h
    }
    v.startHeating(null)
    this.elapse(seconds, v)
    const label =
      mode === 'warm' ? 'Warm gently' : mode === 'boil' ? 'Heat to boiling' : mode === 'gentle' ? 'Heat gently' : 'Heat strongly'
    const obs = describe(v, before, tracker, v.log.slice(mark), this.added.get(v.id)!, { heating: !v.wet, seconds, beforeDryName })
    return this.record({ vesselId: v.id, action: `${label} for ${seconds} s`, observations: obs, time: this.time })
  }

  /** Let time pass (all vessels). Observations are reported for `vesselId` if given. */
  wait(seconds: number, vesselId?: string): ActionResult {
    const v = vesselId ? this.vessel(vesselId) : undefined
    const before = v ? snapshot(v) : undefined
    const tracker = before ? new Tracker(before) : undefined
    const mark = v?.log.length ?? 0
    const wasHot = v ? v.T > 150 && !v.wet : false
    let t = 0
    while (t < seconds) {
      const h = Math.min(10, seconds - t)
      for (const x of this.vessels.values()) x.advance(h, this.time)
      this.time += h
      t += h
      if (v && tracker) tracker.update(snapshot(v))
    }
    let observations: Observation[] = []
    if (v && before && tracker) {
      observations = describe(v, before, tracker, v.log.slice(mark), this.added.get(v.id)!, { seconds })
      if (wasHot && v.T < 100) {
        const dry = drySolidDescription(v)
        if (dry) observations = observations.filter((o) => o.kind !== 'none').concat({ kind: 'residue', text: `On cooling, the solid is ${dry.name}.` })
      }
    }
    return this.record({ vesselId: v?.id, action: `Leave to stand for ${seconds} s`, observations, time: this.time })
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
    v.advance(4, this.time)
    this.elapse(4, v)
    const g = (id: string) => v.headspace.get(id) ?? 0
    // soluble gases: head-space gas from heating solids, or vapour above a solution
    const nh3 = Math.max(g('NH3(g)') / 0.006, vapourPressure(v, 'NH3') / 0.0025) * 0.0061
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
    }
    return this.record({ vesselId: v.id, action: `Test the gas with ${GAS_TEST_LABELS[test]}`, observations: [{ kind: 'gas-test', text }], time: this.time })
  }

  flameTest(vesselId: string): ActionResult {
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
    this.elapse(10)
    return this.record({ vesselId: v.id, action: 'Carry out a flame test', observations: [{ kind: 'flame', text }], time: this.time })
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
    const dest = filtrateVesselId ? this.vessel(filtrateVesselId) : this.newVessel('test-tube', `filtrate from ${v.label}`)
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
    paper.receive(wet.n, wet.V)
    const filtrate = v.takeFraction(1, false)
    const res = this.mix(dest, filtrate.n, filtrate.V, `Filter ${v.label}`)
    for (const id of solids.keys()) this.markAdded(paper, id)
    paper.settle(this.time)
    const desc = drySolidDescription(paper)
    const obs: Observation[] = [
      { kind: 'filtrate', text: `The filtrate is ${dest.wet ? snapshot(dest).solution.name : 'absent'}.` },
      { kind: 'residue', text: desc ? `${cap(desc.name)} residue on the filter paper.` : 'No residue on the filter paper.' },
    ]
    res.observations = obs
    return { result: res, filtrateId: dest.id, residueId: paper.id }
  }

  /** Pour the contents away. A thin film of the old mixture stays behind unless rinsed. */
  empty(vesselId: string): ActionResult {
    const v = this.vessel(vesselId)
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
    v.condensation = 0
    return this.record({ vesselId: v.id, action: 'Empty the tube', observations: [], time: this.time })
  }

  /** Empty and rinse with distilled water (leaves a negligible trace and a few drops of water). */
  rinse(vesselId: string): ActionResult {
    const v = this.vessel(vesselId)
    for (const [id, amt] of [...v.n]) v.change(id, -amt * 0.9995)
    v.V = 0.03
    v.headspace.clear()
    v.condensation = 0
    v.settled = 0
    this.added.set(v.id, new Set())
    this.elapse(5)
    return this.record({ vesselId: v.id, action: 'Rinse with distilled water', observations: [], time: this.time })
  }

  discard(vesselId: string) {
    this.vessels.delete(vesselId)
    this.added.delete(vesselId)
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
