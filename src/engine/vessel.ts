import { FAST_RULES, SLOW_RULES, type Rule, type RuleCtx } from './rules'
import { SPECIES } from './species'

export type VesselKind = 'test-tube' | 'boiling-tube' | 'hard-glass-tube' | 'filter-paper'

export interface VesselSpec {
  label: string
  /** cross-section area (cm²): converts "x cm depth" to a volume */
  area: number
  /** capacity (cm³) before the tube overflows */
  capacity: number
  /** can be heated strongly */
  heatProof: boolean
}

export const VESSEL_SPECS: Record<VesselKind, VesselSpec> = {
  'test-tube': { label: 'test-tube', area: 1.3, capacity: 14, heatProof: false },
  'boiling-tube': { label: 'boiling tube', area: 3.6, capacity: 48, heatProof: true },
  'hard-glass-tube': { label: 'hard-glass test-tube', area: 1.3, capacity: 14, heatProof: true },
  'filter-paper': { label: 'filter paper', area: 10, capacity: 2, heatProof: false },
}

/** Below this volume (cm³) a vessel is treated as dry. */
export const DRY_VOLUME = 0.05
export const ROOM_T = 20

export type HeatMode = 'warm' | 'boil' | 'gentle' | 'strong'
const HEAT_TARGET: Record<HeatMode, number> = { warm: 65, boil: 100, gentle: 260, strong: 600 }

export interface EngineEvent {
  kind: 'rule' | 'gas' | 'condensation' | 'overflow' | 'boil' | 'dry'
  ruleId?: string
  text?: string
  species?: string
  amount: number
  time: number
}

/** Volatile dissolved gases: Henry constant at 25 °C (mol dm⁻³ atm⁻¹) and van 't Hoff temperature. */
const VOLATILE: Record<string, { gas: string; H25: number; vantHoff: number; rate: number }> = {
  NH3: { gas: 'NH3(g)', H25: 57, vantHoff: 4100, rate: 0.35 },
  'SO2(aq)': { gas: 'SO2(g)', H25: 1.2, vantHoff: 2900, rate: 0.05 },
}

let vesselCounter = 0

export class Vessel {
  id: string
  kind: VesselKind
  label: string
  /** amounts in mmol (aqueous species, solids and dissolved gases) */
  n = new Map<string, number>()
  /** liquid volume, cm³ */
  V = 0
  /** temperature, °C */
  T = ROOM_T
  heating: HeatMode | null = null
  stoppered = false
  /** gases near the mouth of the tube, mmol */
  headspace = new Map<string, number>()
  /** recent bubbling rate (mmol s⁻¹) used for animation */
  bubbleRate = 0
  /** droplets of condensation on the cool part of the tube (arbitrary units, decays) */
  condensation = 0
  /** fraction of precipitate that has settled to the bottom (0 = fully suspended) */
  settled = 0
  /** seconds since the vessel was created */
  age = 0
  /** set when the vessel has been emptied but not rinsed: tiny residue remains */
  log: EngineEvent[] = []

  constructor(kind: VesselKind, label?: string) {
    this.kind = kind
    this.id = `v${++vesselCounter}`
    this.label = label ?? VESSEL_SPECS[kind].label
  }

  get spec() {
    return VESSEL_SPECS[this.kind]
  }

  get wet() {
    return this.V >= DRY_VOLUME
  }

  amount(id: string) {
    return this.n.get(id) ?? 0
  }

  conc(id: string) {
    return this.wet ? this.amount(id) / this.V : 0
  }

  change(id: string, delta: number) {
    const v = (this.n.get(id) ?? 0) + delta
    if (v <= 1e-15) this.n.delete(id)
    else this.n.set(id, v)
  }

  clone(): Vessel {
    const v = new Vessel(this.kind, this.label)
    v.id = this.id
    v.n = new Map(this.n)
    v.V = this.V
    v.T = this.T
    v.heating = this.heating
    v.stoppered = this.stoppered
    v.headspace = new Map(this.headspace)
    v.bubbleRate = this.bubbleRate
    v.condensation = this.condensation
    v.settled = this.settled
    v.age = this.age
    return v
  }

  isEmpty() {
    return this.V < 1e-6 && [...this.n.values()].every((x) => x < 1e-9)
  }

  /** Remove a fraction of the liquid together with dissolved species and (suspended) solids. */
  takeFraction(f: number, includeSolids: boolean): { n: Map<string, number>; V: number } {
    f = Math.max(0, Math.min(1, f))
    const out = new Map<string, number>()
    for (const [id, amt] of this.n) {
      const sp = SPECIES[id]
      const isSolid = sp?.phase === 's'
      if (isSolid && !includeSolids) continue
      // settled precipitate is harder to pour off
      const frac = isSolid ? f * (1 - 0.6 * this.settled) : f
      const moved = amt * frac
      if (moved > 0) {
        out.set(id, moved)
        this.change(id, -moved)
      }
    }
    const V = this.V * f
    this.V -= V
    return { n: out, V }
  }

  /** Add material; overflow is reported by the caller. */
  receive(n: Map<string, number> | Record<string, number>, V: number) {
    const entries = n instanceof Map ? [...n.entries()] : Object.entries(n)
    for (const [id, amt] of entries) this.change(id, amt)
    this.V += V
  }

  // ------------------------------------------------------------------ chemistry
  ctx(): RuleCtx {
    return {
      T: this.T,
      V: this.V,
      wet: this.wet,
      n: (id) => this.amount(id),
      c: (id) => this.conc(id),
      pH: () => estimatePH(this),
    }
  }

  /** Run fast (complete / equilibrium) rules until nothing changes. */
  settle(time: number) {
    if (!this.wet) return
    const ctx = this.ctx()
    // Sweep the rules in priority order until nothing changes. Within a sweep higher-priority
    // rules always act first (e.g. neutralisation before precipitation).
    for (let sweep = 0; sweep < 300; sweep++) {
      let changed = false
      for (const rule of FAST_RULES) {
        if (!ruleApplicable(rule, this, ctx)) continue
        const xi = rule.type === 'complete' ? completeExtent(rule, this) : equilibriumExtent(rule, this)
        if (!significant(rule, this, xi)) continue
        applyRule(rule, this, xi, time)
        changed = true
      }
      if (!changed) break
    }
    this.liberateGases(time)
  }

  /** Advance time by dt seconds: temperature, kinetics, gas loss, settling. */
  advance(dt: number, time: number) {
    let remaining = dt
    while (remaining > 1e-9) {
      const h = Math.min(remaining, remaining > 60 ? 4 : 1)
      remaining -= h
      this.age += h
      this.updateTemperature(h, time)
      const ctx = this.ctx()
      for (const rule of SLOW_RULES) {
        if (!ruleApplicable(rule, this, ctx)) continue
        const t12 = typeof rule.halfLife === 'function' ? rule.halfLife(ctx) : rule.halfLife ?? Infinity
        if (!isFinite(t12)) continue
        const max = completeExtent(rule, this)
        if (max <= 0) continue
        const xi = max * (1 - Math.exp((-Math.LN2 * h) / t12))
        if (xi < 1e-10) continue
        applyRule(rule, this, xi, time + (dt - remaining))
      }
      this.settle(time + (dt - remaining))
      this.volatilise(h, time + (dt - remaining))
      // head-space gas drifts away unless stoppered
      if (!this.stoppered) {
        const k = Math.exp((-Math.LN2 * h) / 15)
        for (const [g, a] of this.headspace) {
          const na = a * k
          if (na < 1e-7) this.headspace.delete(g)
          else this.headspace.set(g, na)
        }
      }
      this.condensation *= this.heating ? 1 : Math.exp((-Math.LN2 * h) / 240)
      this.bubbleRate *= Math.exp((-Math.LN2 * h) / 2)
      if (this.wet) this.settled = Math.min(1, this.settled + (1 - this.settled) * (1 - Math.exp((-Math.LN2 * h) / 90)))
    }
  }

  private updateTemperature(h: number, time: number) {
    const target = this.heating ? HEAT_TARGET[this.heating] : ROOM_T
    const tau = this.heating ? (this.wet ? 25 : 12) : this.wet ? 70 : 45
    let T = this.T + (target - this.T) * (1 - Math.exp(-h / tau))
    if (this.wet && T > 100) {
      T = 100
      // boiling away water
      const dV = Math.min(this.V, (this.heating === 'strong' ? 0.04 : 0.015) * h)
      this.V -= dV
      if (dV > 0) this.log.push({ kind: 'boil', amount: dV, time })
      if (!this.wet) {
        this.V = 0
        this.log.push({ kind: 'dry', amount: 0, time })
      }
    }
    this.T = T
  }

  /** Gases that are insoluble (or over-saturated) leave immediately as bubbles. */
  liberateGases(time: number) {
    const co2 = this.amount('CO2(aq)')
    if (co2 > 0 && this.wet) {
      const sat = 0.04 * Math.exp(-0.022 * (this.T - 20)) * this.V
      if (co2 > sat) {
        const excess = co2 - sat
        this.change('CO2(aq)', -excess)
        this.addGas('CO2(g)', excess, time)
      }
    } else if (co2 > 0 && !this.wet) {
      this.change('CO2(aq)', -co2)
      this.addGas('CO2(g)', co2, time)
    }
  }

  /** Soluble gases (NH3, SO2) escape gradually, much faster when hot. */
  private volatilise(h: number, time: number) {
    void time
    for (const [id, p] of Object.entries(VOLATILE)) {
      const amt = this.amount(id)
      if (amt <= 0) continue
      if (!this.wet) {
        this.change(id, -amt)
        this.addGas(p.gas, amt, time, false)
        continue
      }
      // escaping vapour is detected through the vapour pressure (see Lab.gasTest), not as bubbles
      const pressure = vapourPressure(this, id)
      const loss = Math.min(amt, p.rate * pressure * h * (this.stoppered ? 0.05 : 1))
      if (loss > 0) this.change(id, -loss)
    }
  }

  addGas(id: string, amount: number, time: number, bubbles = true) {
    if (amount <= 0) return
    let gas = id
    // nitrogen monoxide meets air at the mouth of the tube and turns brown
    if (gas === 'NO(g)') gas = 'NO2(g)'
    if (gas === 'H2O(g)') {
      this.condensation += amount
      this.log.push({ kind: 'condensation', amount, time })
      return
    }
    this.headspace.set(gas, (this.headspace.get(gas) ?? 0) + amount)
    if (bubbles && this.wet) this.bubbleRate += amount
    this.log.push({ kind: 'gas', species: gas, amount, time })
  }

  startHeating(mode: HeatMode | null) {
    this.heating = mode
  }
}

// ---------------------------------------------------------------------- rule helpers
function ruleApplicable(rule: Rule, v: Vessel, ctx: RuleCtx): boolean {
  if (rule.dry) {
    if (v.wet) return false
    if (rule.minTemp !== undefined && v.T < rule.minTemp) return false
  } else if (!rule.anyPhase && !v.wet) return false
  if (rule.minTemp !== undefined && !rule.dry && v.T < rule.minTemp) return false
  if (rule.type === 'equilibrium') {
    // needs either all reactants or all products present to move
    const hasR = Object.keys(rule.reactants).every((s) => v.amount(s) > 0)
    const hasP = Object.keys(rule.products).every((s) => v.amount(s) > 0)
    if (!hasR && !hasP) return false
  } else {
    for (const s of Object.keys(rule.reactants)) if (v.amount(s) <= 0) return false
  }
  if (rule.when && !rule.when(ctx)) return false
  return true
}

function completeExtent(rule: Rule, v: Vessel): number {
  let xi = Infinity
  for (const [s, nu] of Object.entries(rule.reactants)) {
    const reserve = rule.reserve?.[s] ? rule.reserve[s] * v.V : 0
    xi = Math.min(xi, (v.amount(s) - reserve) / nu)
  }
  return xi === Infinity ? 0 : Math.max(0, xi)
}

const isAqueous = (id: string) => {
  const p = SPECIES[id]?.phase
  return p === 'aq'
}

/** Solve Q(ξ) = K for a single reaction by bisection (Q is monotonic in ξ). */
function equilibriumExtent(rule: Rule, v: Vessel): number {
  const K = rule.K ?? 1
  let hi = Infinity
  for (const [s, nu] of Object.entries(rule.reactants)) hi = Math.min(hi, v.amount(s) / nu)
  let lo = -Infinity
  for (const [s, nu] of Object.entries(rule.products)) lo = Math.max(lo, -v.amount(s) / nu)
  if (!isFinite(hi)) hi = 0
  if (!isFinite(lo)) lo = 0
  if (hi - lo <= 1e-14) return 0
  const V = v.V
  const lnK = Math.log(K)
  const f = (xi: number) => {
    let lnQ = 0
    for (const [s, nu] of Object.entries(rule.products)) {
      if (!isAqueous(s)) continue
      lnQ += nu * Math.log(Math.max(v.amount(s) + nu * xi, 1e-300) / V)
    }
    for (const [s, nu] of Object.entries(rule.reactants)) {
      if (!isAqueous(s)) continue
      lnQ -= nu * Math.log(Math.max(v.amount(s) - nu * xi, 1e-300) / V)
    }
    return lnQ - lnK
  }
  if (f(lo) >= 0) return lo
  if (f(hi) <= 0) return hi
  let a = lo
  let b = hi
  for (let i = 0; i < 120; i++) {
    const m = 0.5 * (a + b)
    if (m === a || m === b) break
    if (f(m) > 0) b = m
    else a = m
  }
  return 0.5 * (a + b)
}

function significant(rule: Rule, v: Vessel, xi: number): boolean {
  const a = Math.abs(xi)
  // tiny equilibrium shifts (e.g. Ksp re-dissolution of 1e-7 M) are invisible and only cause churn
  if (a < (rule.type === 'equilibrium' ? 1e-6 : 1e-9)) return false
  let scale = 0
  for (const s of Object.keys(rule.reactants)) scale = Math.max(scale, v.amount(s))
  for (const s of Object.keys(rule.products)) scale = Math.max(scale, v.amount(s))
  return a > (rule.type === 'equilibrium' ? 1e-5 : 1e-7) * scale
}

function applyRule(rule: Rule, v: Vessel, xi: number, time: number) {
  for (const [s, nu] of Object.entries(rule.reactants)) v.change(s, -nu * xi)
  for (const [s, nu] of Object.entries(rule.products)) {
    if (SPECIES[s]?.phase === 'g') v.addGas(s, nu * xi, time)
    else v.change(s, nu * xi)
  }
  v.log.push({ kind: 'rule', ruleId: rule.id, amount: xi, time })
  if (rule.events?.length && xi > 1e-4) {
    for (const e of rule.events) v.log.push({ kind: 'rule', ruleId: rule.id, text: e, amount: xi, time })
  }
  if (xi > 0) {
    // newly formed precipitate is suspended
    for (const s of Object.keys(rule.products)) {
      if (SPECIES[s]?.phase === 's' && v.wet) v.settled *= 0.7
    }
  }
}

// ---------------------------------------------------------------------- gases & pH
export function henry(id: string, T: number): number {
  const p = VOLATILE[id]
  if (!p) return Infinity
  const TK = T + 273.15
  return p.H25 * Math.exp(p.vantHoff * (1 / TK - 1 / 298.15))
}

/** Partial pressure (atm) of a volatile solute above the solution. */
export function vapourPressure(v: Vessel, id: string): number {
  if (!v.wet) return 0
  return v.conc(id) / henry(id, v.T)
}

const ACIDIC_CATIONS: Record<string, number> = {
  'Fe3+': 2.2, 'Cr3+': 4.0, 'Al3+': 5.0, 'Cu2+': 7.5, 'Pb2+': 7.7, 'Zn2+': 9.0, 'Fe2+': 9.5,
  'Ni2+': 9.9, 'Co2+': 9.7, 'Mn2+': 10.6, 'Mg2+': 11.4, 'Ag+': 12,
}

/** Rough pH estimate (good to about ±1 unit), adequate for indicator paper and conditions. */
export function estimatePH(v: Vessel): number {
  if (!v.wet) return 7
  const c = (id: string) => v.conc(id)
  const H = c('H+')
  const OH = c('OH-')
  if (H > 1e-6) return -Math.log10(H)
  if (OH > 1e-6) return 14 + Math.log10(OH)
  const acid: number[] = []
  const base: number[] = []
  const NH3 = c('NH3')
  const NH4 = c('NH4+')
  if (NH3 > 1e-6 && NH4 > 1e-6) return 9.25 + Math.log10(NH3 / NH4)
  if (NH3 > 1e-6) base.push(14 - 0.5 * (4.75 - Math.log10(NH3)))
  if (NH4 > 1e-6) acid.push(0.5 * (9.25 - Math.log10(NH4)))
  const CO3 = c('CO3 2-')
  const HCO3 = c('HCO3-')
  const CO2 = c('CO2(aq)')
  if (CO3 > 1e-6 && HCO3 > 1e-6) return 10.33 + Math.log10(CO3 / HCO3)
  if (CO3 > 1e-6) base.push(14 - 0.5 * (3.67 - Math.log10(CO3)))
  if (HCO3 > 1e-6) base.push(8.3)
  if (CO2 > 1e-5) acid.push(0.5 * (6.35 - Math.log10(CO2)))
  const SO3 = c('SO3 2-')
  if (SO3 > 1e-6) base.push(14 - 0.5 * (6.8 - Math.log10(SO3)))
  if (c('SO2(aq)') > 1e-5) acid.push(0.5 * (1.8 - Math.log10(c('SO2(aq)'))))
  if (c('ClO-') > 1e-5) base.push(14 - 0.5 * (6.5 - Math.log10(c('ClO-'))))
  if (c('S2O3 2-') > 1e-3) base.push(7.5)
  if (c('NO2-') > 1e-3) base.push(14 - 0.5 * (10.7 - Math.log10(c('NO2-'))))
  for (const [ion, pKa] of Object.entries(ACIDIC_CATIONS)) {
    const x = c(ion)
    if (x > 1e-5) acid.push(0.5 * (pKa - Math.log10(x)))
  }
  if (acid.length && !base.length) return Math.max(1, Math.min(7, Math.min(...acid)))
  if (base.length && !acid.length) return Math.min(13.5, Math.max(7, Math.max(...base)))
  if (acid.length && base.length) return (Math.min(...acid) + Math.max(...base)) / 2
  return 7
}
