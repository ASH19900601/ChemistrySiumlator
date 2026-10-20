// Reaction rules.
//
// The engine is a semi-quantitative stoichiometric model, tuned for Cambridge Q2-style
// qualitative analysis rather than research chemistry:
//
//  * complete     – fast reactions that run to completion (neutralisation, most redox).
//                   An optional `reserve` keeps a minimum free concentration of a reagent,
//                   which is how "soluble only in excess" behaviour is modelled.
//  * equilibrium  – single-reaction equilibria solved exactly for the current contents
//                   (precipitation via Ksp, silver halide / ammonia, starch–iodine …).
//  * kinetic      – slow processes that progress with time (air oxidation, thiosulfate + acid,
//                   catalytic decomposition of H2O2, heating …).
//
// Fast rules are applied in ascending `priority`; whenever one fires the scan restarts from
// the top, so e.g. added NaOH always neutralises free acid before it can precipitate a metal
// hydroxide. Water is never written explicitly.

import { SOLID_THERMAL, MIXED_THERMAL, COMPOUNDS, compoundSpecies } from './compounds'

export type Stoich = Record<string, number>

export interface RuleCtx {
  /** temperature, °C */
  T: number
  /** liquid volume, cm³ */
  V: number
  /** true when there is enough liquid for solution chemistry */
  wet: boolean
  /** amount, mmol */
  n(id: string): number
  /** concentration, mol dm⁻³ (0 when dry) */
  c(id: string): number
  /** rough pH estimate of the solution (7 when dry) */
  pH(): number
}

export type RuleType = 'complete' | 'equilibrium' | 'kinetic'

export interface Rule {
  id: string
  type: RuleType
  reactants: Stoich
  products: Stoich
  priority?: number
  /** equilibrium constant in mol dm⁻³ units; solids and water omitted from Q */
  K?: number
  /** minimum free concentration (mol dm⁻³) of reactants that must remain */
  reserve?: Record<string, number>
  /** kinetic half-life in seconds (Infinity = not running) */
  halfLife?: number | ((ctx: RuleCtx) => number)
  /** extra condition */
  when?: (ctx: RuleCtx) => boolean
  /** rule acts on dry solids (heating) rather than in solution */
  dry?: boolean
  /** applies whether wet or dry */
  anyPhase?: boolean
  minTemp?: number
  /** observable events emitted when the rule makes noticeable progress */
  events?: string[]
}

export const RULES: Rule[] = []
const r = (rule: Rule) => {
  RULES.push(rule)
  return rule
}

// ======================================================================= dissolving solids
// Soluble compounds dissolve as soon as there is water (shaking is assumed).
for (const d of Object.values(COMPOUNDS)) {
  if (!d.dissolves) continue
  r({ id: `dissolve:${d.id}`, type: 'complete', priority: 0, reactants: { [compoundSpecies(d.id)]: 1 }, products: { ...d.dissolves } })
}
// Dehydrated residues that are soluble
r({ id: 'dissolve:Na2CO3(s)', type: 'complete', priority: 0, reactants: { 'Na2CO3(s)': 1 }, products: { 'Na+': 2, 'CO3 2-': 1 } })
r({ id: 'dissolve:Na2SO3(s)', type: 'complete', priority: 0, reactants: { 'Na2SO3(s)': 1 }, products: { 'Na+': 2, 'SO3 2-': 1 } })
r({ id: 'dissolve:Na2SO4(s)', type: 'complete', priority: 0, reactants: { 'Na2SO4(s)': 1 }, products: { 'Na+': 2, 'SO4 2-': 1 } })
r({ id: 'dissolve:K2SO4(s)', type: 'complete', priority: 0, reactants: { 'K2SO4(s)': 1 }, products: { 'K+': 2, 'SO4 2-': 1 } })
r({ id: 'dissolve:NaNO2(s)', type: 'complete', priority: 0, reactants: { 'NaNO2(s)': 1 }, products: { 'Na+': 1, 'NO2-': 1 } })
r({ id: 'dissolve:KNO2(s)', type: 'complete', priority: 0, reactants: { 'KNO2(s)': 1 }, products: { 'K+': 1, 'NO2-': 1 } })
r({ id: 'dissolve:CuSO4(s)', type: 'complete', priority: 0, reactants: { 'CuSO4(s)': 1 }, products: { 'Cu2+': 1, 'SO4 2-': 1 } })
r({ id: 'dissolve:FeSO4(s)', type: 'complete', priority: 0, reactants: { 'FeSO4(s)': 1 }, products: { 'Fe2+': 1, 'SO4 2-': 1 } })
r({ id: 'dissolve:CoCl2(s)', type: 'complete', priority: 0, reactants: { 'CoCl2(s)': 1 }, products: { 'Co2+': 1, 'Cl-': 2 } })
r({ id: 'dissolve:BaCl2(s)', type: 'complete', priority: 0, reactants: { 'BaCl2(s)': 1 }, products: { 'Ba2+': 1, 'Cl-': 2 } })
r({ id: 'dissolve:CrAlum-green(s)', type: 'complete', priority: 0, reactants: { 'CrAlum-green(s)': 1 }, products: { 'K+': 1, 'Cr3+': 1, 'SO4 2-': 2 } })
r({ id: 'dissolve:FeAlum-melt(s)', type: 'complete', priority: 0, reactants: { 'FeAlum-melt(s)': 1 }, products: { 'NH4+': 1, 'Fe3+': 1, 'SO4 2-': 2 } })
r({ id: 'dissolve:NH4Cl-sublimate(s)', type: 'complete', priority: 0, reactants: { 'NH4Cl-sublimate(s)': 1 }, products: { 'NH4+': 1, 'Cl-': 1 } })
r({ id: 'dissolve:K2MnO4(s)', type: 'complete', priority: 0, reactants: { 'K2MnO4(s)': 1 }, products: { 'K+': 2, 'MnO4 2-': 1 } })

// ======================================================================= acid–base (complete)
r({ id: 'neutralise', type: 'complete', priority: 1, reactants: { 'H+': 1, 'OH-': 1 }, products: {} })
r({ id: 'NH3+H+', type: 'complete', priority: 1, reactants: { NH3: 1, 'H+': 1 }, products: { 'NH4+': 1 } })
r({ id: 'CO3+H+', type: 'complete', priority: 2, reactants: { 'CO3 2-': 1, 'H+': 1 }, products: { 'HCO3-': 1 } })
r({ id: 'HCO3+OH', type: 'complete', priority: 2, reactants: { 'HCO3-': 1, 'OH-': 1 }, products: { 'CO3 2-': 1 } })
r({ id: 'CO2+OH', type: 'complete', priority: 2, reactants: { 'CO2(aq)': 1, 'OH-': 2 }, products: { 'CO3 2-': 1 } })
r({ id: 'SO2+OH', type: 'complete', priority: 2, reactants: { 'SO2(aq)': 1, 'OH-': 2 }, products: { 'SO3 2-': 1 } })
r({ id: 'HCO3+H+', type: 'complete', priority: 3, reactants: { 'HCO3-': 1, 'H+': 1 }, products: { 'CO2(aq)': 1 } })
r({ id: 'SO3+H+', type: 'complete', priority: 3, reactants: { 'SO3 2-': 1, 'H+': 2 }, products: { 'SO2(aq)': 1 } })
// chlorate(I) oxidises iodide before it can release chlorine with acid
r({ id: 'ClO+I-', type: 'complete', priority: 2, reactants: { 'ClO-': 1, 'I-': 2 }, products: { I2: 1, 'Cl-': 1, 'OH-': 2 } })
r({ id: 'ClO+H+Cl', type: 'kinetic', reactants: { 'ClO-': 1, 'Cl-': 1, 'H+': 2 }, products: { 'Cl2(g)': 1 },
  halfLife: (x) => (x.c('H+') > 1 && x.c('Cl-') > 0.5 ? 10 : Infinity) })
// chromate / dichromate equilibrium: 2CrO4 2- + 2H+ ⇌ Cr2O7 2- + H2O
r({ id: 'CrO4/Cr2O7', type: 'equilibrium', priority: 3, reactants: { 'CrO4 2-': 2, 'H+': 2 }, products: { 'Cr2O7 2-': 1 }, K: 4e14 })
r({ id: 'Cr2O7+OH', type: 'complete', priority: 2, reactants: { 'Cr2O7 2-': 1, 'OH-': 2 }, products: { 'CrO4 2-': 2 } })
// ammonium + hydroxide (strong base liberates ammonia)
r({ id: 'NH4+OH', type: 'complete', priority: 4, reactants: { 'NH4+': 1, 'OH-': 1 }, products: { NH3: 1 } })

// ======================================================================= precipitation (Ksp equilibria)
const ppt = (id: string, ions: Stoich, solid: string, Ksp: number, priority = 3) =>
  r({ id: `ppt:${id}`, type: 'equilibrium', priority, reactants: ions, products: { [solid]: 1 }, K: 1 / Ksp })

// hydroxides with strong base
ppt('Al(OH)3', { 'Al3+': 1, 'OH-': 3 }, 'Al(OH)3(s)', 1.3e-33)
ppt('Cr(OH)3', { 'Cr3+': 1, 'OH-': 3 }, 'Cr(OH)3(s)', 6e-31)
ppt('Fe(OH)3', { 'Fe3+': 1, 'OH-': 3 }, 'Fe(OH)3(s)', 2.8e-39)
ppt('Fe(OH)2', { 'Fe2+': 1, 'OH-': 2 }, 'Fe(OH)2(s)', 8e-16)
ppt('Cu(OH)2', { 'Cu2+': 1, 'OH-': 2 }, 'Cu(OH)2(s)', 2.2e-20)
ppt('Zn(OH)2', { 'Zn2+': 1, 'OH-': 2 }, 'Zn(OH)2(s)', 3e-17)
ppt('Ni(OH)2', { 'Ni2+': 1, 'OH-': 2 }, 'Ni(OH)2(s)', 5.5e-16)
ppt('Co(OH)2', { 'Co2+': 1, 'OH-': 2 }, 'Co(OH)2(s)', 1e-15)
ppt('Mn(OH)2', { 'Mn2+': 1, 'OH-': 2 }, 'Mn(OH)2(s)', 2e-13)
ppt('Pb(OH)2', { 'Pb2+': 1, 'OH-': 2 }, 'Pb(OH)2(s)', 1.2e-15)
ppt('Mg(OH)2', { 'Mg2+': 1, 'OH-': 2 }, 'Mg(OH)2(s)', 5.6e-12)
ppt('Ca(OH)2', { 'Ca2+': 1, 'OH-': 2 }, 'Ca(OH)2(s)', 5.5e-6)
// Ba(OH)2 is fairly soluble: only a faint precipitate unless [Ba2+] is very low (9701 notes)
ppt('Ba(OH)2', { 'Ba2+': 1, 'OH-': 2 }, 'Ba(OH)2(s)', 4.7e-2)
// 2Ag+ + 2OH- ⇌ Ag2O + H2O ; Ksp(AgOH) ≈ 2e-8
ppt('Ag2O', { 'Ag+': 2, 'OH-': 2 }, 'Ag2O(s)', 4e-16)

// halides
ppt('AgCl', { 'Ag+': 1, 'Cl-': 1 }, 'AgCl(s)', 1.8e-10)
ppt('AgBr', { 'Ag+': 1, 'Br-': 1 }, 'AgBr(s)', 5e-13)
ppt('AgI', { 'Ag+': 1, 'I-': 1 }, 'AgI(s)', 8.5e-17)
ppt('PbCl2', { 'Pb2+': 1, 'Cl-': 2 }, 'PbCl2(s)', 1.7e-5)
ppt('PbBr2', { 'Pb2+': 1, 'Br-': 2 }, 'PbBr2(s)', 6.6e-6)
ppt('PbI2', { 'Pb2+': 1, 'I-': 2 }, 'PbI2(s)', 9.8e-9)
// sulfates / sulfites
ppt('BaSO4', { 'Ba2+': 1, 'SO4 2-': 1 }, 'BaSO4(s)', 1.1e-10)
ppt('PbSO4', { 'Pb2+': 1, 'SO4 2-': 1 }, 'PbSO4(s)', 2.5e-8)
ppt('CaSO4', { 'Ca2+': 1, 'SO4 2-': 1 }, 'CaSO4(s)', 4.9e-5)
ppt('Ag2SO4', { 'Ag+': 2, 'SO4 2-': 1 }, 'Ag2SO4(s)', 1.2e-5)
ppt('BaSO3', { 'Ba2+': 1, 'SO3 2-': 1 }, 'BaSO3(s)', 5e-10)
ppt('Ag2SO3', { 'Ag+': 2, 'SO3 2-': 1 }, 'Ag2SO3(s)', 1.5e-14)
// carbonates
ppt('BaCO3', { 'Ba2+': 1, 'CO3 2-': 1 }, 'BaCO3(s)', 2.6e-9)
ppt('CaCO3', { 'Ca2+': 1, 'CO3 2-': 1 }, 'CaCO3(s)', 3.4e-9)
ppt('MgCO3', { 'Mg2+': 1, 'CO3 2-': 1 }, 'MgCO3(s)', 6.8e-6)
ppt('ZnCO3', { 'Zn2+': 1, 'CO3 2-': 1 }, 'ZnCO3(s)', 1.5e-10)
ppt('CuCO3', { 'Cu2+': 1, 'CO3 2-': 1 }, 'CuCO3(s)', 1.4e-10)
ppt('FeCO3', { 'Fe2+': 1, 'CO3 2-': 1 }, 'FeCO3(s)', 3e-11)
ppt('NiCO3', { 'Ni2+': 1, 'CO3 2-': 1 }, 'NiCO3(s)', 1.4e-7)
ppt('MnCO3', { 'Mn2+': 1, 'CO3 2-': 1 }, 'MnCO3(s)', 2.2e-11)
ppt('PbCO3', { 'Pb2+': 1, 'CO3 2-': 1 }, 'PbCO3(s)', 7.4e-14)
ppt('Ag2CO3', { 'Ag+': 2, 'CO3 2-': 1 }, 'Ag2CO3(s)', 8.5e-12)
// chromates
ppt('BaCrO4', { 'Ba2+': 1, 'CrO4 2-': 1 }, 'BaCrO4(s)', 1.2e-10)

// Hydrolysis of M3+ by carbonate / hydrogencarbonate: hydroxide + CO2 rather than a carbonate
for (const [m, oh] of [['Al3+', 'Al(OH)3(s)'], ['Cr3+', 'Cr(OH)3(s)'], ['Fe3+', 'Fe(OH)3(s)']] as const) {
  r({ id: `hyd:${m}+CO3`, type: 'complete', priority: 3, reactants: { [m]: 2, 'CO3 2-': 3 }, products: { [oh]: 2, 'CO2(aq)': 3 } })
  r({ id: `hyd:${m}+HCO3`, type: 'complete', priority: 3, reactants: { [m]: 1, 'HCO3-': 3 }, products: { [oh]: 1, 'CO2(aq)': 3 } })
}
// M2+ + 2HCO3- -> MCO3 + CO2 (+H2O)
for (const [m, s] of [['Cu2+', 'CuCO3(s)'], ['Zn2+', 'ZnCO3(s)'], ['Fe2+', 'FeCO3(s)'], ['Pb2+', 'PbCO3(s)'], ['Mn2+', 'MnCO3(s)'], ['Ni2+', 'NiCO3(s)']] as const) {
  r({ id: `hyd:${m}+HCO3`, type: 'complete', priority: 3, reactants: { [m]: 1, 'HCO3-': 2 }, products: { [s]: 1, 'CO2(aq)': 1 } })
}
r({ id: 'hyd:Ag+HCO3', type: 'complete', priority: 3, reactants: { 'Ag+': 2, 'HCO3-': 2 }, products: { 'Ag2CO3(s)': 1, 'CO2(aq)': 1 } })

// ======================================================================= weak base: aqueous ammonia
// Ammonia supplies hydroxide only until the metal is precipitated. Ca2+ and Ba2+ are not
// precipitated by aqueous ammonia (Cambridge notes: "no ppt.").
const nh3ppt: [string, string, number][] = [
  ['Al3+', 'Al(OH)3(s)', 3], ['Cr3+', 'Cr(OH)3(s)', 3], ['Fe3+', 'Fe(OH)3(s)', 3], ['Fe2+', 'Fe(OH)2(s)', 2],
  ['Cu2+', 'Cu(OH)2(s)', 2], ['Zn2+', 'Zn(OH)2(s)', 2], ['Ni2+', 'Ni(OH)2(s)', 2], ['Co2+', 'Co(OH)2(s)', 2],
  ['Mn2+', 'Mn(OH)2(s)', 2], ['Pb2+', 'Pb(OH)2(s)', 2], ['Mg2+', 'Mg(OH)2(s)', 2],
]
for (const [m, s, k] of nh3ppt) {
  r({ id: `nh3ppt:${m}`, type: 'complete', priority: 4, reactants: { [m]: 1, NH3: k }, products: { [s]: 1, 'NH4+': k } })
}
r({ id: 'nh3ppt:Ag+', type: 'complete', priority: 4, reactants: { 'Ag+': 2, NH3: 2 }, products: { 'Ag2O(s)': 1, 'NH4+': 2 } })

// ======================================================================= soluble in excess
// hydroxo complexes with excess strong base
r({ id: 'xs:Al(OH)3+OH', type: 'complete', priority: 5, reactants: { 'Al(OH)3(s)': 1, 'OH-': 1 }, products: { 'Al(OH)4-': 1 }, reserve: { 'OH-': 0.02 } })
r({ id: 'xs:Zn(OH)2+OH', type: 'complete', priority: 5, reactants: { 'Zn(OH)2(s)': 1, 'OH-': 2 }, products: { 'Zn(OH)4 2-': 1 }, reserve: { 'OH-': 0.02 } })
r({ id: 'xs:Pb(OH)2+OH', type: 'complete', priority: 5, reactants: { 'Pb(OH)2(s)': 1, 'OH-': 2 }, products: { 'Pb(OH)4 2-': 1 }, reserve: { 'OH-': 0.05 } })
r({ id: 'xs:Cr(OH)3+OH', type: 'complete', priority: 5, reactants: { 'Cr(OH)3(s)': 1, 'OH-': 3 }, products: { 'Cr(OH)6 3-': 1 }, reserve: { 'OH-': 0.05 } })
// ammine complexes with excess ammonia
r({ id: 'xs:Cu(OH)2+NH3', type: 'complete', priority: 5, reactants: { 'Cu(OH)2(s)': 1, NH3: 4 }, products: { 'Cu(NH3)4 2+': 1, 'OH-': 2 }, reserve: { NH3: 0.15 } })
r({ id: 'xs:Zn(OH)2+NH3', type: 'complete', priority: 5, reactants: { 'Zn(OH)2(s)': 1, NH3: 4 }, products: { 'Zn(NH3)4 2+': 1, 'OH-': 2 }, reserve: { NH3: 0.1 } })
r({ id: 'xs:Ni(OH)2+NH3', type: 'complete', priority: 5, reactants: { 'Ni(OH)2(s)': 1, NH3: 6 }, products: { 'Ni(NH3)6 2+': 1, 'OH-': 2 }, reserve: { NH3: 0.15 } })
r({ id: 'xs:Ag2O+NH3', type: 'complete', priority: 5, reactants: { 'Ag2O(s)': 1, NH3: 4 }, products: { 'Ag(NH3)2+': 2, 'OH-': 2 }, reserve: { NH3: 0.05 } })
// silver halides in ammonia: AgX + 2NH3 ⇌ [Ag(NH3)2]+ + X-, K = Ksp·β2 (β2 = 1.6e7)
r({ id: 'eq:AgCl+NH3', type: 'equilibrium', priority: 5, reactants: { 'AgCl(s)': 1, NH3: 2 }, products: { 'Ag(NH3)2+': 1, 'Cl-': 1 }, K: 1.8e-10 * 1.6e7 })
r({ id: 'eq:AgBr+NH3', type: 'equilibrium', priority: 5, reactants: { 'AgBr(s)': 1, NH3: 2 }, products: { 'Ag(NH3)2+': 1, 'Br-': 1 }, K: 5e-13 * 1.6e7 })
r({ id: 'eq:AgI+NH3', type: 'equilibrium', priority: 5, reactants: { 'AgI(s)': 1, NH3: 2 }, products: { 'Ag(NH3)2+': 1, 'I-': 1 }, K: 8.5e-17 * 1.6e7 })
// silver(I) and copper(I) with thiosulfate
r({ id: 'eq:Ag+S2O3', type: 'equilibrium', priority: 5, reactants: { 'Ag+': 1, 'S2O3 2-': 2 }, products: { 'Ag(S2O3)2 3-': 1 }, K: 2.9e13 })
r({ id: 'eq:AgCl+S2O3', type: 'equilibrium', priority: 5, reactants: { 'AgCl(s)': 1, 'S2O3 2-': 2 }, products: { 'Ag(S2O3)2 3-': 1, 'Cl-': 1 }, K: 1.8e-10 * 2.9e13 })
r({ id: 'eq:AgBr+S2O3', type: 'equilibrium', priority: 5, reactants: { 'AgBr(s)': 1, 'S2O3 2-': 2 }, products: { 'Ag(S2O3)2 3-': 1, 'Br-': 1 }, K: 5e-13 * 2.9e13 })
r({ id: 'eq:AgI+S2O3', type: 'equilibrium', priority: 5, reactants: { 'AgI(s)': 1, 'S2O3 2-': 2 }, products: { 'Ag(S2O3)2 3-': 1, 'I-': 1 }, K: 8.5e-17 * 2.9e13 })
r({ id: 'eq:CuI+S2O3', type: 'equilibrium', priority: 5, reactants: { 'CuI(s)': 1, 'S2O3 2-': 2 }, products: { 'Cu(S2O3)2 3-': 1, 'I-': 1 }, K: 0.02 })

// acid destroys complexes
r({ id: 'acid:Al(OH)4', type: 'complete', priority: 2, reactants: { 'Al(OH)4-': 1, 'H+': 1 }, products: { 'Al(OH)3(s)': 1 } })
r({ id: 'acid:Zn(OH)4', type: 'complete', priority: 2, reactants: { 'Zn(OH)4 2-': 1, 'H+': 2 }, products: { 'Zn(OH)2(s)': 1 } })
r({ id: 'acid:Pb(OH)4', type: 'complete', priority: 2, reactants: { 'Pb(OH)4 2-': 1, 'H+': 2 }, products: { 'Pb(OH)2(s)': 1 } })
r({ id: 'acid:Cr(OH)6', type: 'complete', priority: 2, reactants: { 'Cr(OH)6 3-': 1, 'H+': 3 }, products: { 'Cr(OH)3(s)': 1 } })
r({ id: 'acid:Cu(NH3)4', type: 'complete', priority: 2, reactants: { 'Cu(NH3)4 2+': 1, 'H+': 4 }, products: { 'Cu2+': 1, 'NH4+': 4 } })
r({ id: 'acid:Zn(NH3)4', type: 'complete', priority: 2, reactants: { 'Zn(NH3)4 2+': 1, 'H+': 4 }, products: { 'Zn2+': 1, 'NH4+': 4 } })
r({ id: 'acid:Ni(NH3)6', type: 'complete', priority: 2, reactants: { 'Ni(NH3)6 2+': 1, 'H+': 6 }, products: { 'Ni2+': 1, 'NH4+': 6 } })
r({ id: 'acid:Ag(NH3)2', type: 'complete', priority: 2, reactants: { 'Ag(NH3)2+': 1, 'H+': 2 }, products: { 'Ag+': 1, 'NH4+': 2 } })

// acid dissolves hydroxides, oxides and carbonates
const acidDissolve: [string, Stoich, number][] = [
  ['Al(OH)3(s)', { 'Al3+': 1 }, 3], ['Cr(OH)3(s)', { 'Cr3+': 1 }, 3], ['Fe(OH)3(s)', { 'Fe3+': 1 }, 3],
  ['Fe(OH)2(s)', { 'Fe2+': 1 }, 2], ['Cu(OH)2(s)', { 'Cu2+': 1 }, 2], ['Zn(OH)2(s)', { 'Zn2+': 1 }, 2],
  ['Ni(OH)2(s)', { 'Ni2+': 1 }, 2], ['Co(OH)2(s)', { 'Co2+': 1 }, 2], ['Mn(OH)2(s)', { 'Mn2+': 1 }, 2],
  ['Pb(OH)2(s)', { 'Pb2+': 1 }, 2], ['Mg(OH)2(s)', { 'Mg2+': 1 }, 2], ['Ca(OH)2(s)', { 'Ca2+': 1 }, 2],
  ['Ba(OH)2(s)', { 'Ba2+': 1 }, 2], ['Ag2O(s)', { 'Ag+': 2 }, 2], ['CuO(s)', { 'Cu2+': 1 }, 2],
  ['ZnO(s)', { 'Zn2+': 1 }, 2], ['MgO(s)', { 'Mg2+': 1 }, 2], ['CaO(s)', { 'Ca2+': 1 }, 2], ['PbO(s)', { 'Pb2+': 1 }, 2],
  ['Fe2O3(s)', { 'Fe3+': 2 }, 6],
  ['BaSO3(s)', { 'Ba2+': 1, 'SO2(aq)': 1 }, 2], ['Ag2SO3(s)', { 'Ag+': 2, 'SO2(aq)': 1 }, 2],
]
for (const [s, prod, h] of acidDissolve) {
  r({ id: `acid:${s}`, type: 'complete', priority: 4, reactants: { [s]: 1, 'H+': h }, products: prod })
}
// Carbonates react with acid with effervescence. Solid carbonates dissolve over a few seconds.
const carbonates: [string, Stoich][] = [
  ['BaCO3(s)', { 'Ba2+': 1 }], ['CaCO3(s)', { 'Ca2+': 1 }], ['MgCO3(s)', { 'Mg2+': 1 }], ['ZnCO3(s)', { 'Zn2+': 1 }],
  ['CuCO3(s)', { 'Cu2+': 1 }], ['FeCO3(s)', { 'Fe2+': 1 }], ['NiCO3(s)', { 'Ni2+': 1 }], ['MnCO3(s)', { 'Mn2+': 1 }],
  ['PbCO3(s)', { 'Pb2+': 1 }], ['Ag2CO3(s)', { 'Ag+': 2 }],
]
for (const [s, prod] of carbonates) {
  r({ id: `acid:${s}`, type: 'kinetic', reactants: { [s]: 1, 'H+': 2 }, products: { ...prod, 'CO2(aq)': 1 }, halfLife: 0.5 })
}

// ======================================================================= redox (fast)
// acidified manganate(VII)
r({ id: 'MnO4+Fe2+', type: 'complete', priority: 6, reactants: { 'MnO4-': 1, 'Fe2+': 5, 'H+': 8 }, products: { 'Mn2+': 1, 'Fe3+': 5 } })
r({ id: 'MnO4+SO3', type: 'complete', priority: 6, reactants: { 'MnO4-': 2, 'SO3 2-': 5, 'H+': 6 }, products: { 'Mn2+': 2, 'SO4 2-': 5 } })
r({ id: 'MnO4+SO2', type: 'complete', priority: 6, reactants: { 'MnO4-': 2, 'SO2(aq)': 5 }, products: { 'Mn2+': 2, 'SO4 2-': 5, 'H+': 4 } })
r({ id: 'MnO4+NO2', type: 'complete', priority: 6, reactants: { 'MnO4-': 2, 'NO2-': 5, 'H+': 6 }, products: { 'Mn2+': 2, 'NO3-': 5 } })
r({ id: 'MnO4+I-', type: 'complete', priority: 6, reactants: { 'MnO4-': 2, 'I-': 10, 'H+': 16 }, products: { 'Mn2+': 2, I2: 5 } })
r({ id: 'MnO4+H2O2', type: 'complete', priority: 6, reactants: { 'MnO4-': 2, H2O2: 5, 'H+': 6 }, products: { 'Mn2+': 2, 'O2(g)': 5 } })
r({ id: 'MnO4+S2O3', type: 'complete', priority: 6, reactants: { 'MnO4-': 8, 'S2O3 2-': 5, 'H+': 14 }, products: { 'Mn2+': 8, 'SO4 2-': 10 } })
r({ id: 'MnO4+C2O4', type: 'kinetic', reactants: { 'MnO4-': 2, 'C2O4 2-': 5, 'H+': 16 }, products: { 'Mn2+': 2, 'CO2(aq)': 10 },
  halfLife: (x) => (x.T >= 55 ? 4 : x.n('Mn2+') > 0 ? 60 : 600) })
// manganate(VII) in neutral/alkaline solution is reduced to brown MnO2
r({ id: 'MnO4+SO3(alk)', type: 'complete', priority: 7, reactants: { 'MnO4-': 2, 'SO3 2-': 3 }, products: { 'MnO2(s)': 2, 'SO4 2-': 3, 'OH-': 2 } })
r({ id: 'MnO4+I-(alk)', type: 'complete', priority: 7, reactants: { 'MnO4-': 2, 'I-': 6 }, products: { 'MnO2(s)': 2, I2: 3, 'OH-': 8 } })
r({ id: 'MnO4+Fe(OH)2', type: 'complete', priority: 7, reactants: { 'MnO4-': 1, 'Fe(OH)2(s)': 3 }, products: { 'MnO2(s)': 1, 'Fe(OH)3(s)': 3, 'OH-': 1 } })
// manganate(VI) disproportionates unless the solution is strongly alkaline
r({ id: 'MnO4 2- disproportionation', type: 'kinetic', reactants: { 'MnO4 2-': 3 }, products: { 'MnO4-': 2, 'MnO2(s)': 1, 'OH-': 4 },
  halfLife: (x) => (x.c('OH-') > 0.5 ? Infinity : x.c('H+') > 1e-4 ? 0.2 : 0.5) })

// iron(III) and copper(II) oxidise iodide
r({ id: 'Fe3++I-', type: 'complete', priority: 6, reactants: { 'Fe3+': 2, 'I-': 2 }, products: { 'Fe2+': 2, I2: 1 } })
r({ id: 'Cu2++I-', type: 'complete', priority: 6, reactants: { 'Cu2+': 2, 'I-': 4 }, products: { 'CuI(s)': 2, I2: 1 } })
// dichromate(VI) in acid
r({ id: 'Cr2O7+Fe2+', type: 'complete', priority: 6, reactants: { 'Cr2O7 2-': 1, 'Fe2+': 6, 'H+': 14 }, products: { 'Cr3+': 2, 'Fe3+': 6 } })
r({ id: 'Cr2O7+SO3', type: 'complete', priority: 6, reactants: { 'Cr2O7 2-': 1, 'SO3 2-': 3, 'H+': 8 }, products: { 'Cr3+': 2, 'SO4 2-': 3 } })
r({ id: 'Cr2O7+SO2', type: 'complete', priority: 6, reactants: { 'Cr2O7 2-': 1, 'SO2(aq)': 3, 'H+': 2 }, products: { 'Cr3+': 2, 'SO4 2-': 3 } })
r({ id: 'Cr2O7+I-', type: 'complete', priority: 6, reactants: { 'Cr2O7 2-': 1, 'I-': 6, 'H+': 14 }, products: { 'Cr3+': 2, I2: 3 } })
r({ id: 'Cr2O7+H2O2', type: 'kinetic', reactants: { 'Cr2O7 2-': 1, H2O2: 3, 'H+': 8 }, products: { 'Cr3+': 2, 'O2(g)': 3 }, halfLife: 8 })
// iodine / thiosulfate / starch
r({ id: 'I2+S2O3', type: 'complete', priority: 5, reactants: { I2: 1, 'S2O3 2-': 2 }, products: { 'I-': 2, 'S4O6 2-': 1 } })
r({ id: 'starchI2+S2O3', type: 'complete', priority: 5, reactants: { 'starch-I2': 1, 'S2O3 2-': 2 }, products: { starch: 1, 'I-': 2, 'S4O6 2-': 1 } })
r({ id: 'starch+I2', type: 'equilibrium', priority: 8, reactants: { starch: 1, I2: 1 }, products: { 'starch-I2': 1 }, K: 2e5 })
// chlorate(I) oxidises iodide (and iron(II))
r({ id: 'ClO+Fe2+', type: 'complete', priority: 6, reactants: { 'ClO-': 1, 'Fe2+': 2 }, products: { 'Fe3+': 2, 'Cl-': 1, 'OH-': 2 } })
r({ id: 'ClO+S2O3', type: 'complete', priority: 5, reactants: { 'ClO-': 4, 'S2O3 2-': 1 }, products: { 'SO4 2-': 2, 'Cl-': 4, 'H+': 2 } })
// hydrogen peroxide as oxidant
r({ id: 'H2O2+Fe2+', type: 'complete', priority: 6, reactants: { H2O2: 1, 'Fe2+': 2 }, products: { 'Fe3+': 2, 'OH-': 2 } })
r({ id: 'H2O2+Fe(OH)2', type: 'complete', priority: 6, reactants: { H2O2: 1, 'Fe(OH)2(s)': 2 }, products: { 'Fe(OH)3(s)': 2 } })
r({ id: 'H2O2+Mn(OH)2', type: 'complete', priority: 6, reactants: { H2O2: 1, 'Mn(OH)2(s)': 1 }, products: { 'MnO(OH)2(s)': 1 } })
r({ id: 'H2O2+SO3', type: 'complete', priority: 6, reactants: { H2O2: 1, 'SO3 2-': 1 }, products: { 'SO4 2-': 1 } })
r({ id: 'H2O2+I-', type: 'kinetic', reactants: { H2O2: 1, 'I-': 2 }, products: { I2: 1, 'OH-': 2 }, halfLife: (x) => (x.c('H+') > 1e-3 ? 6 : 60) })
r({ id: 'H2O2+Cr(OH)6', type: 'kinetic', reactants: { H2O2: 3, 'Cr(OH)6 3-': 2 }, products: { 'CrO4 2-': 2, 'OH-': 2 }, halfLife: (x) => (x.T > 50 ? 6 : 40) })
// peroxodisulfate oxidises iodide (slowly, faster with Fe catalyst)
r({ id: 'S2O8+I-', type: 'kinetic', reactants: { 'S2O8 2-': 1, 'I-': 2 }, products: { 'SO4 2-': 2, I2: 1 },
  halfLife: (x) => (x.n('Fe2+') + x.n('Fe3+') > 1e-4 ? 8 : 45) })
// nitrite
r({ id: 'NO2+I-+H+', type: 'kinetic', reactants: { 'NO2-': 2, 'I-': 2, 'H+': 4 }, products: { I2: 1, 'NO(g)': 2 }, halfLife: 3 })
r({ id: 'HNO2 decomposition', type: 'kinetic', reactants: { 'NO2-': 3, 'H+': 2 }, products: { 'NO3-': 1, 'NO(g)': 2 }, halfLife: 6,
  events: ['brown gas seen at the mouth of the tube'] })

// iron(III) + thiosulfate: transient dark violet complex that fades as Fe3+ is reduced
r({ id: 'eq:FeS2O3', type: 'equilibrium', priority: 8, reactants: { 'Fe3+': 1, 'S2O3 2-': 1 }, products: { 'FeS2O3+': 1 }, K: 300 })
r({ id: 'FeS2O3 fade', type: 'kinetic', reactants: { 'FeS2O3+': 2 }, products: { 'Fe2+': 2, 'S4O6 2-': 1 }, halfLife: 25 })
// iron(III) thiocyanate
r({ id: 'eq:FeSCN', type: 'equilibrium', priority: 8, reactants: { 'Fe3+': 1, 'SCN-': 1 }, products: { 'FeSCN2+': 1 }, K: 140 })

// ======================================================================= metals
const metalRate = (base: number) => (x: RuleCtx) => (x.T > 50 ? base / 3 : base)
r({ id: 'Mg+H+', type: 'kinetic', reactants: { 'Mg(s)': 1, 'H+': 2 }, products: { 'Mg2+': 1, 'H2(g)': 1 }, halfLife: metalRate(8) })
r({ id: 'Zn+H+', type: 'kinetic', reactants: { 'Zn(s)': 1, 'H+': 2 }, products: { 'Zn2+': 1, 'H2(g)': 1 }, halfLife: metalRate(25) })
r({ id: 'Al+H+', type: 'kinetic', reactants: { 'Al(s)': 2, 'H+': 6 }, products: { 'Al3+': 2, 'H2(g)': 3 }, halfLife: metalRate(200) })
r({ id: 'Mg+Cu2+', type: 'kinetic', reactants: { 'Mg(s)': 1, 'Cu2+': 1 }, products: { 'Mg2+': 1, 'Cu(s)': 1 }, halfLife: 25 })
r({ id: 'Zn+Cu2+', type: 'kinetic', reactants: { 'Zn(s)': 1, 'Cu2+': 1 }, products: { 'Zn2+': 1, 'Cu(s)': 1 }, halfLife: 20 })
r({ id: 'Mg+Fe2+', type: 'kinetic', reactants: { 'Mg(s)': 1, 'Fe2+': 1 }, products: { 'Mg2+': 1, 'Fe(s)': 1 }, halfLife: 400 })
r({ id: 'Mg+Fe3+', type: 'kinetic', reactants: { 'Mg(s)': 1, 'Fe3+': 2 }, products: { 'Mg2+': 1, 'Fe2+': 2 }, halfLife: 40 })
r({ id: 'Zn+Fe3+', type: 'kinetic', reactants: { 'Zn(s)': 1, 'Fe3+': 2 }, products: { 'Zn2+': 1, 'Fe2+': 2 }, halfLife: 40 })
r({ id: 'Mg+Ag+', type: 'kinetic', reactants: { 'Mg(s)': 1, 'Ag+': 2 }, products: { 'Mg2+': 1, 'Ag(s)': 2 }, halfLife: 15 })
r({ id: 'Mg+NH4+', type: 'kinetic', reactants: { 'Mg(s)': 1, 'NH4+': 2 }, products: { 'Mg2+': 1, NH3: 2, 'H2(g)': 1 }, halfLife: metalRate(150) })
// solutions of hydrolysing cations are acidic enough to make magnesium fizz slowly
r({ id: 'Mg+acidic solution', type: 'kinetic', reactants: { 'Mg(s)': 1 }, products: { 'Mg2+': 1, 'OH-': 2, 'H2(g)': 1 },
  halfLife: (x) => (x.pH() < 4 ? 40 : x.pH() < 6.2 ? 120 : Infinity) })
// aluminium in alkali: hydrogen always; nitrate / nitrite reduced to ammonia on warming
r({ id: 'Al+OH', type: 'kinetic', reactants: { 'Al(s)': 2, 'OH-': 2 }, products: { 'Al(OH)4-': 2, 'H2(g)': 3 },
  halfLife: (x) => (x.c('OH-') < 0.02 ? Infinity : x.T > 45 ? 60 : 200) })
r({ id: 'Al+NO3+OH', type: 'kinetic', reactants: { 'Al(s)': 8, 'NO3-': 3, 'OH-': 5 }, products: { 'Al(OH)4-': 8, NH3: 3 },
  halfLife: (x) => (x.c('OH-') < 0.02 ? Infinity : x.T > 45 ? 10 : 400) })
r({ id: 'Al+NO2+OH', type: 'kinetic', reactants: { 'Al(s)': 2, 'NO2-': 1, 'OH-': 1 }, products: { 'Al(OH)4-': 2, NH3: 1 },
  halfLife: (x) => (x.c('OH-') < 0.02 ? Infinity : x.T > 45 ? 12 : 300) })

// ======================================================================= slow processes
// air oxidation of iron(II) and manganese(II) hydroxides (starts at the surface)
r({ id: 'air:Fe(OH)2', type: 'kinetic', reactants: { 'Fe(OH)2(s)': 1 }, products: { 'Fe(OH)3(s)': 1 }, halfLife: 900 })
r({ id: 'air:Mn(OH)2', type: 'kinetic', reactants: { 'Mn(OH)2(s)': 1 }, products: { 'MnO(OH)2(s)': 1 }, halfLife: 45 })
// copper(II) hydroxide turns to black CuO when the mixture is warmed
r({ id: 'warm:Cu(OH)2', type: 'kinetic', reactants: { 'Cu(OH)2(s)': 1 }, products: { 'CuO(s)': 1 },
  halfLife: (x) => (x.T >= 55 ? 10 : Infinity) })
// chromium(III) hydroxide very slowly dissolves in excess ammonia (purple solution on standing)
r({ id: 'slow:Cr(OH)3+NH3', type: 'kinetic', reactants: { 'Cr(OH)3(s)': 1, NH3: 6 }, products: { 'Cr(NH3)6 3+': 1, 'OH-': 3 },
  reserve: { NH3: 0.3 }, halfLife: 500 })
// thiosulfate + acid: sulfur slowly appears
// (sulfur first forms invisible nuclei, so the cloudiness appears only after a delay)
r({ id: 'S2O3+H+', type: 'kinetic', reactants: { 'S2O3 2-': 1, 'H+': 2 }, products: { 'S-nuclei': 1, 'SO2(aq)': 1 },
  halfLife: (x) => (x.T > 50 ? 12 : 45) })
r({ id: 'S nuclei grow', type: 'kinetic', reactants: { 'S-nuclei': 1 }, products: { 'S(s)': 1 }, halfLife: 30 })
// dilute nitric acid slowly oxidises iodide, iron(II) and sulfite
r({ id: 'HNO3+I-', type: 'kinetic', reactants: { 'I-': 6, 'NO3-': 2, 'H+': 8 }, products: { I2: 3, 'NO(g)': 2 },
  halfLife: (x) => (x.c('H+') > 0.3 ? (x.T > 50 ? 3000 : 30000) : Infinity) })
r({ id: 'HNO3+Fe2+', type: 'kinetic', reactants: { 'Fe2+': 3, 'NO3-': 1, 'H+': 4 }, products: { 'Fe3+': 3, 'NO(g)': 1 },
  halfLife: (x) => (x.c('H+') > 0.3 ? (x.T > 50 ? 60 : 3000) : Infinity) })
r({ id: 'HNO3+SO2', type: 'kinetic', reactants: { 'SO2(aq)': 3, 'NO3-': 2 }, products: { 'SO4 2-': 3, 'NO(g)': 2, 'H+': 4 },
  halfLife: (x) => (x.c('H+') > 0.3 ? (x.T > 50 ? 60 : 900) : Infinity) })

// catalytic decomposition of hydrogen peroxide
r({ id: 'H2O2 decomposition', type: 'kinetic', reactants: { H2O2: 2 }, products: { 'O2(g)': 1 },
  halfLife: (x) => {
    let k = 0
    if (x.n('MnO2(s)') > 1e-4) k += Math.LN2 / 2
    if (x.n('Fe3+') > 1e-4 || x.n('Fe(OH)3(s)') > 1e-4) k += Math.LN2 / 15
    if (x.n('Cu(NH3)4 2+') > 1e-4 || x.n('CuO(s)') > 1e-4) k += Math.LN2 / 8
    if (x.n('Cu(OH)2(s)') > 1e-4) k += Math.LN2 / 25
    if (x.c('OH-') > 0.1) k += Math.LN2 / 300
    if (x.T > 60) k *= 4
    return k > 0 ? Math.LN2 / k : Infinity
  } })
// peroxide decomposing in ammoniacal copper(II) leaves a black copper(II) oxide residue
r({ id: 'Cu(NH3)4 + H2O2 -> CuO', type: 'kinetic', reactants: { 'Cu(NH3)4 2+': 1 }, products: { 'CuO(s)': 1, 'NH4+': 2, NH3: 2 },
  halfLife: (x) => (x.n('H2O2') > 1e-3 ? 12 : Infinity) })

// ======================================================================= heating dry solids
function thermalRules(speciesId: string, steps: { minTemp: number; halfLife: number; products: Stoich; events?: string[]; coReactants?: Stoich }[]) {
  steps.forEach((s, i) => {
    r({
      id: `heat:${speciesId}:${i}`,
      type: 'kinetic',
      dry: true,
      reactants: { [speciesId]: 1, ...(s.coReactants ?? {}) },
      products: s.products,
      minTemp: s.minTemp,
      halfLife: s.halfLife,
      events: s.events,
    })
  })
}
for (const d of Object.values(COMPOUNDS)) {
  if (d.thermal && !d.asSpecies) thermalRules(`cmp:${d.id}`, d.thermal)
}
for (const [sp, steps] of Object.entries(SOLID_THERMAL)) thermalRules(sp, steps)
for (const m of MIXED_THERMAL) {
  r({
    id: `heat-mixed:${m.reactant}`,
    type: 'kinetic',
    dry: true,
    reactants: { [m.reactant]: 1 },
    products: m.step.products,
    minTemp: m.step.minTemp,
    halfLife: m.step.halfLife,
    events: m.step.events,
    when: (x) => m.needs.some((s) => x.n(s) > 1e-4),
  })
}

export const FAST_RULES = RULES.filter((x) => x.type !== 'kinetic').sort((a, b) => (a.priority ?? 9) - (b.priority ?? 9))
export const SLOW_RULES = RULES.filter((x) => x.type === 'kinetic')
