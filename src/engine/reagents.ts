// Bench reagents. Concentrations follow the Cambridge confidential instructions
// (IGCSE 0620 usually uses 1 mol dm⁻³ acids/alkalis, 9701 uses 2.0 mol dm⁻³).

import { COMPOUNDS } from './compounds'

export type ReagentKind = 'solution' | 'solid' | 'piece'

export interface ReagentDef {
  id: string
  label: string
  /** short label printed on the bottle */
  short: string
  kind: ReagentKind
  /** solution composition, mol dm⁻³ */
  conc?: Record<string, number>
  /** solid / piece reagents */
  compound?: string
  /** grams in one piece (foil, ribbon) */
  pieceGrams?: number
  /** colour of the liquid in the bottle (display only) */
  bottleTint?: string
  hazard?: string
}

export const REAGENTS: Record<string, ReagentDef> = {}
const add = (d: ReagentDef) => (REAGENTS[d.id] = d)

const naoh = (M: number): Record<string, number> => ({ 'Na+': M, 'OH-': M })

add({ id: 'water', label: 'distilled water', short: 'distilled water', kind: 'solution', conc: {} })
add({ id: 'tap-water', label: 'tap water', short: 'tap water', kind: 'solution',
  conc: { 'Ca2+': 0.0012, 'HCO3-': 0.002, 'Cl-': 0.0006, 'Na+': 0.0006, 'Mg2+': 0.0002, 'SO4 2-': 0.0002 } })
add({ id: 'NaOH', label: 'aqueous sodium hydroxide', short: 'NaOH(aq)', kind: 'solution', conc: naoh(1.0), hazard: 'C' })
add({ id: 'NaOH-2M', label: 'aqueous sodium hydroxide', short: 'NaOH(aq)', kind: 'solution', conc: naoh(2.0), hazard: 'C' })
add({ id: 'NH3', label: 'aqueous ammonia', short: 'NH₃(aq)', kind: 'solution', conc: { NH3: 1.0 }, hazard: 'MH' })
add({ id: 'NH3-2M', label: 'aqueous ammonia', short: 'NH₃(aq)', kind: 'solution', conc: { NH3: 2.0 }, hazard: 'C' })
add({ id: 'HNO3', label: 'dilute nitric acid', short: 'dilute HNO₃', kind: 'solution', conc: { 'H+': 1.0, 'NO3-': 1.0 }, hazard: 'C' })
add({ id: 'HNO3-2M', label: 'dilute nitric acid', short: 'dilute HNO₃', kind: 'solution', conc: { 'H+': 2.0, 'NO3-': 2.0 }, hazard: 'C' })
add({ id: 'HCl', label: 'dilute hydrochloric acid', short: 'dilute HCl', kind: 'solution', conc: { 'H+': 1.0, 'Cl-': 1.0 } })
add({ id: 'HCl-2M', label: 'dilute hydrochloric acid', short: 'dilute HCl', kind: 'solution', conc: { 'H+': 2.0, 'Cl-': 2.0 } })
add({ id: 'H2SO4', label: 'dilute sulfuric acid', short: 'dilute H₂SO₄', kind: 'solution', conc: { 'H+': 2.0, 'SO4 2-': 1.0 }, hazard: 'MH' })
add({ id: 'AgNO3', label: 'aqueous silver nitrate', short: 'AgNO₃(aq)', kind: 'solution', conc: { 'Ag+': 0.05, 'NO3-': 0.05 } })
add({ id: 'Ba(NO3)2', label: 'aqueous barium nitrate', short: 'Ba(NO₃)₂(aq)', kind: 'solution', conc: { 'Ba2+': 0.1, 'NO3-': 0.2 } })
add({ id: 'BaCl2', label: 'aqueous barium chloride', short: 'BaCl₂(aq)', kind: 'solution', conc: { 'Ba2+': 0.1, 'Cl-': 0.2 } })
add({ id: 'KMnO4-H+', label: 'acidified aqueous potassium manganate(VII)', short: 'KMnO₄ / H⁺', kind: 'solution',
  conc: { 'K+': 0.01, 'MnO4-': 0.01, 'H+': 1.0, 'SO4 2-': 0.5 }, bottleTint: '#7a1a6c' })
add({ id: 'KMnO4-H+-0.02', label: 'acidified aqueous potassium manganate(VII)', short: 'KMnO₄ / H⁺', kind: 'solution',
  conc: { 'K+': 0.02, 'MnO4-': 0.02, 'H+': 1.0, 'SO4 2-': 0.5 }, bottleTint: '#6a1260' })
add({ id: 'K2Cr2O7-H+', label: 'acidified aqueous potassium dichromate(VI)', short: 'K₂Cr₂O₇ / H⁺', kind: 'solution',
  conc: { 'K+': 0.04, 'Cr2O7 2-': 0.02, 'H+': 1.0, 'SO4 2-': 0.5 }, bottleTint: '#d86a1a' })
add({ id: 'KI', label: 'aqueous potassium iodide', short: 'KI(aq)', kind: 'solution', conc: { 'K+': 0.1, 'I-': 0.1 } })
add({ id: 'KI-0.2', label: 'aqueous potassium iodide', short: 'KI(aq)', kind: 'solution', conc: { 'K+': 0.2, 'I-': 0.2 } })
add({ id: 'KI-0.5', label: 'aqueous potassium iodide', short: 'KI(aq)', kind: 'solution', conc: { 'K+': 0.5, 'I-': 0.5 } })
add({ id: 'Na2S2O3', label: 'aqueous sodium thiosulfate', short: 'Na₂S₂O₃(aq)', kind: 'solution', conc: { 'Na+': 0.2, 'S2O3 2-': 0.1 } })
add({ id: 'Na2S2O3-0.25', label: 'aqueous sodium thiosulfate', short: 'Na₂S₂O₃(aq)', kind: 'solution', conc: { 'Na+': 0.5, 'S2O3 2-': 0.25 } })
add({ id: 'starch', label: 'starch solution', short: 'starch', kind: 'solution', conc: { starch: 0.05 }, bottleTint: '#f4f1ea' })
add({ id: 'H2O2', label: 'aqueous hydrogen peroxide (10 vol)', short: 'H₂O₂(aq)', kind: 'solution', conc: { H2O2: 0.83 } })
add({ id: 'H2O2-20vol', label: 'aqueous hydrogen peroxide (20 vol)', short: 'H₂O₂(aq)', kind: 'solution', conc: { H2O2: 1.7 } })
add({ id: 'Na2CO3', label: 'aqueous sodium carbonate', short: 'Na₂CO₃(aq)', kind: 'solution', conc: { 'Na+': 2.0, 'CO3 2-': 1.0 } })
add({ id: 'Na2CO3-0.5', label: 'aqueous sodium carbonate', short: 'Na₂CO₃(aq)', kind: 'solution', conc: { 'Na+': 1.0, 'CO3 2-': 0.5 } })
add({ id: 'NaHCO3', label: 'aqueous sodium hydrogencarbonate', short: 'NaHCO₃(aq)', kind: 'solution', conc: { 'Na+': 1.0, 'HCO3-': 1.0 } })
add({ id: 'NaClO', label: 'aqueous sodium chlorate(I)', short: 'NaClO(aq)', kind: 'solution',
  conc: { 'Na+': 0.4, 'ClO-': 0.15, 'Cl-': 0.15, 'OH-': 0.1 }, bottleTint: '#f3f6dc' })
add({ id: 'CuSO4', label: 'aqueous copper(II) sulfate', short: 'CuSO₄(aq)', kind: 'solution', conc: { 'Cu2+': 0.2, 'SO4 2-': 0.2 }, bottleTint: '#7fb5e8' })
add({ id: 'FeCl3', label: 'aqueous iron(III) chloride', short: 'FeCl₃(aq)', kind: 'solution', conc: { 'Fe3+': 0.1, 'Cl-': 0.3, 'H+': 0.02 }, bottleTint: '#d9a441' })
add({ id: 'KSCN', label: 'aqueous potassium thiocyanate', short: 'KSCN(aq)', kind: 'solution', conc: { 'K+': 0.1, 'SCN-': 0.1 } })
add({ id: 'limewater', label: 'limewater', short: 'limewater', kind: 'solution', conc: { 'Ca2+': 0.02, 'OH-': 0.04 } })
add({ id: 'Pb(NO3)2', label: 'aqueous lead(II) nitrate', short: 'Pb(NO₃)₂(aq)', kind: 'solution', conc: { 'Pb2+': 0.1, 'NO3-': 0.2 } })
add({ id: 'Al-foil', label: 'aluminium foil', short: 'Al foil', kind: 'piece', compound: 'Al', pieceGrams: 0.1 })
add({ id: 'Mg-ribbon', label: 'magnesium ribbon (2 cm)', short: 'Mg ribbon', kind: 'piece', compound: 'Mg', pieceGrams: 0.022 })
add({ id: 'Zn-powder', label: 'zinc powder', short: 'Zn powder', kind: 'solid', compound: 'Zn' })
add({ id: 'MnO2', label: 'manganese(IV) oxide', short: 'MnO₂', kind: 'solid', compound: 'MnO2' })
add({ id: 'Na2CO3-solid', label: 'solid sodium carbonate', short: 'Na₂CO₃(s)', kind: 'solid', compound: 'Na2CO3' })

/** Create a solution reagent from compounds dissolved per dm³ (as in Cambridge confidential instructions). */
export function solutionFromGrams(perDm3: Record<string, number>, extra: Record<string, number> = {}): Record<string, number> {
  const conc: Record<string, number> = { ...extra }
  for (const [cmp, g] of Object.entries(perDm3)) {
    const d = COMPOUNDS[cmp]
    if (!d?.dissolves) throw new Error(`Compound ${cmp} is not soluble`)
    const mol = g / d.molarMass
    for (const [ion, nu] of Object.entries(d.dissolves)) conc[ion] = (conc[ion] ?? 0) + mol * nu
  }
  return conc
}

export function registerReagent(d: ReagentDef) {
  REAGENTS[d.id] = d
}
