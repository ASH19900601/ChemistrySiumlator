// Starting materials (bench chemicals and unknowns).
//
// A soluble compound sits in a vessel as its own solid species `cmp:<id>` until water is
// present, then dissociates into its ions. Insoluble compounds (e.g. BaCO3) map straight to
// the corresponding precipitate species so that the ordinary acid / thermal rules apply.

import { registerSpecies, SPECIES } from './species'

export interface ThermalStep {
  /** temperature (°C) at which the step proceeds */
  minTemp: number
  /** seconds for half of the remaining solid to react once minTemp is reached */
  halfLife: number
  /** products per mole of the solid species (solids stay, `(g)` species go to the head-space,
   *  'H2O(g)' produces condensation on the cooler part of the tube) */
  products: Record<string, number>
  /** extra reactants consumed per mole (other solids in the tube) */
  coReactants?: Record<string, number>
  /** observable events emitted while the step proceeds */
  events?: string[]
}

export interface CompoundDef {
  id: string
  formula: string
  name: string
  molarMass: number
  colour: string
  colourName: string
  /** ions released per mole when dissolved in water (omit for insoluble compounds) */
  dissolves?: Record<string, number>
  /** insoluble compounds: the solid species this compound is in the engine */
  asSpecies?: string
  /** thermal behaviour when heated dry */
  thermal?: ThermalStep[]
}

const list: CompoundDef[] = []
const c = (d: CompoundDef) => list.push(d)

const W = (n: number) => ({ 'H2O(g)': n })
const hydrateEvents = ['condensation']

// ---------------------------------------------------------------- simple soluble salts
c({ id: 'NaCl', formula: 'NaCl', name: 'sodium chloride', molarMass: 58.44, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Na+': 1, 'Cl-': 1 } })
c({ id: 'KCl', formula: 'KCl', name: 'potassium chloride', molarMass: 74.55, colour: '#fafafa', colourName: 'white',
  dissolves: { 'K+': 1, 'Cl-': 1 } })
c({ id: 'NaBr', formula: 'NaBr', name: 'sodium bromide', molarMass: 102.89, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Na+': 1, 'Br-': 1 } })
c({ id: 'KBr', formula: 'KBr', name: 'potassium bromide', molarMass: 119.0, colour: '#fafafa', colourName: 'white',
  dissolves: { 'K+': 1, 'Br-': 1 } })
c({ id: 'NaI', formula: 'NaI', name: 'sodium iodide', molarMass: 149.89, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Na+': 1, 'I-': 1 } })
c({ id: 'KI', formula: 'KI', name: 'potassium iodide', molarMass: 166.0, colour: '#fafafa', colourName: 'white',
  dissolves: { 'K+': 1, 'I-': 1 } })
c({ id: 'NaNO3', formula: 'NaNO₃', name: 'sodium nitrate', molarMass: 85.0, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Na+': 1, 'NO3-': 1 },
  thermal: [{ minTemp: 450, halfLife: 60, products: { 'NaNO2(s)': 1, 'O2(g)': 0.5 }, events: ['melts'] }] })
c({ id: 'KNO3', formula: 'KNO₃', name: 'potassium nitrate', molarMass: 101.1, colour: '#fafafa', colourName: 'white',
  dissolves: { 'K+': 1, 'NO3-': 1 },
  thermal: [{ minTemp: 450, halfLife: 60, products: { 'KNO2(s)': 1, 'O2(g)': 0.5 }, events: ['melts'] }] })
c({ id: 'NaNO2', formula: 'NaNO₂', name: 'sodium nitrite', molarMass: 69.0, colour: '#f6f1dd', colourName: 'pale yellow',
  dissolves: { 'Na+': 1, 'NO2-': 1 } })
c({ id: 'Na2SO4', formula: 'Na₂SO₄', name: 'sodium sulfate', molarMass: 142.0, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Na+': 2, 'SO4 2-': 1 } })
c({ id: 'K2SO4', formula: 'K₂SO₄', name: 'potassium sulfate', molarMass: 174.3, colour: '#fafafa', colourName: 'white',
  dissolves: { 'K+': 2, 'SO4 2-': 1 } })
c({ id: 'Na2SO3', formula: 'Na₂SO₃', name: 'sodium sulfite', molarMass: 126.0, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Na+': 2, 'SO3 2-': 1 } })
c({ id: 'Na2S2O5', formula: 'Na₂S₂O₅', name: 'sodium metabisulfite', molarMass: 190.1, colour: '#fafafa', colourName: 'white',
  // S2O5 2- + H2O -> 2 HSO3-, treated here as sulfite plus acid
  dissolves: { 'Na+': 2, 'SO3 2-': 2, 'H+': 2 } })
c({ id: 'Na2S2O3.5H2O', formula: 'Na₂S₂O₃·5H₂O', name: 'sodium thiosulfate', molarMass: 248.2, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Na+': 2, 'S2O3 2-': 1 },
  thermal: [{ minTemp: 60, halfLife: 10, products: { ...W(5) }, events: ['melts in its own water of crystallisation', ...hydrateEvents] }] })
c({ id: 'Na2CO3', formula: 'Na₂CO₃', name: 'anhydrous sodium carbonate', molarMass: 106.0, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Na+': 2, 'CO3 2-': 1 } })
c({ id: 'Na2CO3.10H2O', formula: 'Na₂CO₃·10H₂O', name: 'hydrated sodium carbonate', molarMass: 286.1, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Na+': 2, 'CO3 2-': 1 },
  thermal: [{ minTemp: 40, halfLife: 15, products: { 'Na2CO3(s)': 1, ...W(10) }, events: ['melts in its own water of crystallisation', ...hydrateEvents] }] })
c({ id: 'NaHCO3', formula: 'NaHCO₃', name: 'sodium hydrogencarbonate', molarMass: 84.0, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Na+': 1, 'HCO3-': 1 },
  thermal: [{ minTemp: 110, halfLife: 12, products: { 'Na2CO3(s)': 0.5, 'CO2(g)': 0.5, ...W(0.5) }, events: hydrateEvents }] })
c({ id: 'NaHSO4', formula: 'NaHSO₄', name: 'sodium hydrogensulfate', molarMass: 120.1, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Na+': 1, 'H+': 1, 'SO4 2-': 1 } })
c({ id: 'NaOH', formula: 'NaOH', name: 'sodium hydroxide', molarMass: 40.0, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Na+': 1, 'OH-': 1 } })

// ---------------------------------------------------------------- ammonium salts
c({ id: 'NH4Cl', formula: 'NH₄Cl', name: 'ammonium chloride', molarMass: 53.49, colour: '#fafafa', colourName: 'white',
  dissolves: { 'NH4+': 1, 'Cl-': 1 },
  thermal: [{ minTemp: 280, halfLife: 15, products: { 'NH4Cl-sublimate(s)': 0.9, 'NH3(g)': 0.1, 'HCl(g)': 0.1 },
    events: ['white solid sublimes and collects on the cooler part of the tube', 'white fumes'] }] })
c({ id: 'NH4Br', formula: 'NH₄Br', name: 'ammonium bromide', molarMass: 97.94, colour: '#fafafa', colourName: 'white',
  dissolves: { 'NH4+': 1, 'Br-': 1 },
  thermal: [{ minTemp: 300, halfLife: 15, products: { 'NH3(g)': 0.2 }, events: ['white solid sublimes and collects on the cooler part of the tube', 'white fumes'] }] })
c({ id: 'NH4NO3', formula: 'NH₄NO₃', name: 'ammonium nitrate', molarMass: 80.04, colour: '#fafafa', colourName: 'white',
  dissolves: { 'NH4+': 1, 'NO3-': 1 },
  thermal: [{ minTemp: 170, halfLife: 20, products: { ...W(2) }, events: ['melts', 'colourless gas given off', ...hydrateEvents] }] })
c({ id: '(NH4)2SO4', formula: '(NH₄)₂SO₄', name: 'ammonium sulfate', molarMass: 132.1, colour: '#fafafa', colourName: 'white',
  dissolves: { 'NH4+': 2, 'SO4 2-': 1 },
  thermal: [{ minTemp: 280, halfLife: 40, products: { 'NH3(g)': 1 }, events: ['melts', 'white fumes'] }] })
c({ id: '(NH4)2CO3', formula: '(NH₄)₂CO₃', name: 'ammonium carbonate', molarMass: 96.09, colour: '#fafafa', colourName: 'white',
  dissolves: { 'NH4+': 2, 'CO3 2-': 1 },
  thermal: [{ minTemp: 58, halfLife: 10, products: { 'NH3(g)': 2, 'CO2(g)': 1, ...W(1) }, events: ['solid disappears completely (no residue)', ...hydrateEvents] }] })

// ---------------------------------------------------------------- group 2 / Al
c({ id: 'MgSO4.7H2O', formula: 'MgSO₄·7H₂O', name: 'magnesium sulfate', molarMass: 246.5, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Mg2+': 1, 'SO4 2-': 1 },
  thermal: [{ minTemp: 120, halfLife: 15, products: { ...W(7) }, events: hydrateEvents }] })
c({ id: 'MgCl2.6H2O', formula: 'MgCl₂·6H₂O', name: 'magnesium chloride', molarMass: 203.3, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Mg2+': 1, 'Cl-': 2 },
  thermal: [{ minTemp: 120, halfLife: 15, products: { 'HCl(g)': 0.3, ...W(6) }, events: hydrateEvents }] })
c({ id: 'CaCl2', formula: 'CaCl₂', name: 'calcium chloride', molarMass: 111.0, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Ca2+': 1, 'Cl-': 2 } })
c({ id: 'Ca(NO3)2.4H2O', formula: 'Ca(NO₃)₂·4H₂O', name: 'calcium nitrate', molarMass: 236.1, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Ca2+': 1, 'NO3-': 2 },
  thermal: [{ minTemp: 100, halfLife: 15, products: { ...W(4) }, events: ['melts', ...hydrateEvents] },
    { minTemp: 500, halfLife: 40, products: { 'CaO(s)': 1, 'NO2(g)': 2, 'O2(g)': 0.5 }, events: ['brown gas given off'] }] })
c({ id: 'BaCl2.2H2O', formula: 'BaCl₂·2H₂O', name: 'hydrated barium chloride', molarMass: 244.3, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Ba2+': 1, 'Cl-': 2 },
  thermal: [{ minTemp: 115, halfLife: 15, products: { 'BaCl2(s)': 1, ...W(2) }, events: ['crackles', ...hydrateEvents] }] })
c({ id: 'Ba(NO3)2', formula: 'Ba(NO₃)₂', name: 'barium nitrate', molarMass: 261.3, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Ba2+': 1, 'NO3-': 2 } })
c({ id: 'Al2(SO4)3.16H2O', formula: 'Al₂(SO₄)₃·16H₂O', name: 'aluminium sulfate', molarMass: 630.4, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Al3+': 2, 'SO4 2-': 3 },
  thermal: [{ minTemp: 90, halfLife: 15, products: { ...W(16) }, events: ['melts in its own water of crystallisation', ...hydrateEvents] }] })
c({ id: 'KAl(SO4)2.12H2O', formula: 'KAl(SO₄)₂·12H₂O', name: 'potassium aluminium sulfate (alum)', molarMass: 474.4, colour: '#fafafa', colourName: 'white',
  dissolves: { 'K+': 1, 'Al3+': 1, 'SO4 2-': 2 },
  thermal: [{ minTemp: 90, halfLife: 15, products: { ...W(12) }, events: ['melts in its own water of crystallisation', ...hydrateEvents] }] })
c({ id: 'AlCl3.6H2O', formula: 'AlCl₃·6H₂O', name: 'aluminium chloride', molarMass: 241.4, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Al3+': 1, 'Cl-': 3 },
  thermal: [{ minTemp: 100, halfLife: 15, products: { 'HCl(g)': 1, ...W(6) }, events: ['white fumes', ...hydrateEvents] }] })

// ---------------------------------------------------------------- transition metals
c({ id: 'KCr(SO4)2.12H2O', formula: 'KCr(SO₄)₂·12H₂O', name: 'chrome alum', molarMass: 499.4, colour: '#3c2648', colourName: 'dark purple',
  dissolves: { 'K+': 1, 'Cr3+': 1, 'SO4 2-': 2 },
  thermal: [{ minTemp: 90, halfLife: 15, products: { 'CrAlum-green(s)': 1, ...W(12) },
    events: ['melts in its own water of crystallisation', 'turns green', ...hydrateEvents] }] })
c({ id: 'CrCl3.6H2O', formula: 'CrCl₃·6H₂O', name: 'chromium(III) chloride', molarMass: 266.4, colour: '#2f5a2c', colourName: 'dark green',
  dissolves: { 'Cr3+': 1, 'Cl-': 3 },
  thermal: [{ minTemp: 100, halfLife: 15, products: { ...W(6) }, events: hydrateEvents }] })
c({ id: 'MnSO4.4H2O', formula: 'MnSO₄·4H₂O', name: 'manganese(II) sulfate', molarMass: 223.1, colour: '#f2dfe4', colourName: 'very pale pink',
  dissolves: { 'Mn2+': 1, 'SO4 2-': 1 },
  thermal: [{ minTemp: 120, halfLife: 15, products: { ...W(4) }, events: hydrateEvents }] })
c({ id: 'MnCl2.4H2O', formula: 'MnCl₂·4H₂O', name: 'manganese(II) chloride', molarMass: 197.9, colour: '#f0d4dc', colourName: 'pale pink',
  dissolves: { 'Mn2+': 1, 'Cl-': 2 } })
c({ id: 'FeSO4.7H2O', formula: 'FeSO₄·7H₂O', name: 'iron(II) sulfate', molarMass: 278.0, colour: '#b5d9b0', colourName: 'pale green',
  dissolves: { 'Fe2+': 1, 'SO4 2-': 1 },
  thermal: [
    { minTemp: 90, halfLife: 12, products: { 'FeSO4(s)': 1, ...W(7) }, events: ['turns white', ...hydrateEvents] },
  ] })
c({ id: '(NH4)2Fe(SO4)2.6H2O', formula: '(NH₄)₂Fe(SO₄)₂·6H₂O', name: 'ammonium iron(II) sulfate', molarMass: 392.1, colour: '#cfe3c4', colourName: 'pale green',
  dissolves: { 'NH4+': 2, 'Fe2+': 1, 'SO4 2-': 2 },
  thermal: [{ minTemp: 100, halfLife: 15, products: { 'FeSO4(s)': 1, 'NH3(g)': 0.2, ...W(6) }, events: hydrateEvents }] })
c({ id: 'NH4Fe(SO4)2.12H2O', formula: 'NH₄Fe(SO₄)₂·12H₂O', name: 'ammonium iron(III) sulfate (iron alum)', molarMass: 482.2, colour: '#e9dbe6', colourName: 'pale violet',
  dissolves: { 'NH4+': 1, 'Fe3+': 1, 'SO4 2-': 2 },
  thermal: [{ minTemp: 40, halfLife: 12, products: { 'FeAlum-melt(s)': 1, ...W(12) },
    events: ['melts in its own water of crystallisation', 'forms a yellow-brown liquid', 'steam given off', ...hydrateEvents] }] })
c({ id: 'FeCl3.6H2O', formula: 'FeCl₃·6H₂O', name: 'iron(III) chloride', molarMass: 270.3, colour: '#c47a1c', colourName: 'yellow-brown',
  dissolves: { 'Fe3+': 1, 'Cl-': 3 },
  thermal: [{ minTemp: 40, halfLife: 15, products: { 'Fe2O3(s)': 0.5, 'HCl(g)': 3, ...W(4.5) }, events: ['melts', 'white fumes', ...hydrateEvents] }] })
c({ id: 'CoCl2.6H2O', formula: 'CoCl₂·6H₂O', name: 'cobalt(II) chloride', molarMass: 237.9, colour: '#b4384f', colourName: 'pink-red',
  dissolves: { 'Co2+': 1, 'Cl-': 2 },
  thermal: [{ minTemp: 110, halfLife: 15, products: { 'CoCl2(s)': 1, ...W(6) }, events: ['turns blue', ...hydrateEvents] }] })
c({ id: 'NiSO4.6H2O', formula: 'NiSO₄·6H₂O', name: 'nickel(II) sulfate', molarMass: 262.9, colour: '#4fa36a', colourName: 'green',
  dissolves: { 'Ni2+': 1, 'SO4 2-': 1 },
  thermal: [{ minTemp: 110, halfLife: 15, products: { ...W(6) }, events: hydrateEvents }] })
c({ id: 'CuSO4.5H2O', formula: 'CuSO₄·5H₂O', name: 'copper(II) sulfate', molarMass: 249.7, colour: '#2f74c8', colourName: 'blue',
  dissolves: { 'Cu2+': 1, 'SO4 2-': 1 },
  thermal: [{ minTemp: 110, halfLife: 15, products: { 'CuSO4(s)': 1, ...W(5) }, events: ['blue solid turns white', ...hydrateEvents] }] })
c({ id: 'CuCl2.2H2O', formula: 'CuCl₂·2H₂O', name: 'copper(II) chloride', molarMass: 170.5, colour: '#3fa59a', colourName: 'blue-green',
  dissolves: { 'Cu2+': 1, 'Cl-': 2 },
  thermal: [{ minTemp: 110, halfLife: 15, products: { ...W(2) }, events: ['turns yellow-brown', ...hydrateEvents] }] })
c({ id: 'Cu(NO3)2.3H2O', formula: 'Cu(NO₃)₂·3H₂O', name: 'copper(II) nitrate', molarMass: 241.6, colour: '#2f6fc0', colourName: 'blue',
  dissolves: { 'Cu2+': 1, 'NO3-': 2 },
  thermal: [{ minTemp: 120, halfLife: 20, products: { 'CuO(s)': 1, 'NO2(g)': 2, 'O2(g)': 0.5, ...W(3) }, events: ['melts', 'brown gas given off', ...hydrateEvents] }] })
c({ id: 'ZnSO4.7H2O', formula: 'ZnSO₄·7H₂O', name: 'zinc sulfate', molarMass: 287.6, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Zn2+': 1, 'SO4 2-': 1 },
  thermal: [{ minTemp: 100, halfLife: 15, products: { ...W(7) }, events: hydrateEvents }] })
c({ id: 'ZnCl2', formula: 'ZnCl₂', name: 'zinc chloride', molarMass: 136.3, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Zn2+': 1, 'Cl-': 2 } })
c({ id: 'Zn(NO3)2.6H2O', formula: 'Zn(NO₃)₂·6H₂O', name: 'zinc nitrate', molarMass: 297.5, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Zn2+': 1, 'NO3-': 2 },
  thermal: [{ minTemp: 100, halfLife: 20, products: { 'ZnO(s)': 1, 'NO2(g)': 2, 'O2(g)': 0.5, ...W(6) }, events: ['melts', 'brown gas given off', ...hydrateEvents] }] })
c({ id: 'AgNO3', formula: 'AgNO₃', name: 'silver nitrate', molarMass: 169.9, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Ag+': 1, 'NO3-': 1 },
  thermal: [{ minTemp: 400, halfLife: 30, products: { 'Ag(s)': 1, 'NO2(g)': 1, 'O2(g)': 0.5 }, events: ['melts', 'brown gas given off'] }] })
c({ id: 'Pb(NO3)2', formula: 'Pb(NO₃)₂', name: 'lead(II) nitrate', molarMass: 331.2, colour: '#fafafa', colourName: 'white',
  dissolves: { 'Pb2+': 1, 'NO3-': 2 },
  thermal: [{ minTemp: 350, halfLife: 20, products: { 'PbO(s)': 1, 'NO2(g)': 2, 'O2(g)': 0.5 }, events: ['crackles', 'brown gas given off'] }] })
c({ id: 'KMnO4', formula: 'KMnO₄', name: 'potassium manganate(VII)', molarMass: 158.0, colour: '#3a1238', colourName: 'dark purple',
  dissolves: { 'K+': 1, 'MnO4-': 1 },
  thermal: [{ minTemp: 230, halfLife: 10, products: { 'K2MnO4(s)': 0.5, 'MnO2(s)': 0.5, 'O2(g)': 0.5 },
    events: ['crystals crackle and jump around the tube', 'black residue forms'] }] })
c({ id: 'K2CrO4', formula: 'K₂CrO₄', name: 'potassium chromate(VI)', molarMass: 194.2, colour: '#e6c62a', colourName: 'yellow',
  dissolves: { 'K+': 2, 'CrO4 2-': 1 } })
c({ id: 'K2Cr2O7', formula: 'K₂Cr₂O₇', name: 'potassium dichromate(VI)', molarMass: 294.2, colour: '#d2601a', colourName: 'orange',
  dissolves: { 'K+': 2, 'Cr2O7 2-': 1 } })
c({ id: 'KSCN', formula: 'KSCN', name: 'potassium thiocyanate', molarMass: 97.18, colour: '#fafafa', colourName: 'white',
  dissolves: { 'K+': 1, 'SCN-': 1 } })
c({ id: 'K2S2O8', formula: 'K₂S₂O₈', name: 'potassium peroxodisulfate', molarMass: 270.3, colour: '#fafafa', colourName: 'white',
  dissolves: { 'K+': 2, 'S2O8 2-': 1 } })

// ---------------------------------------------------------------- insoluble solids (map to precipitate species)
c({ id: 'BaCO3', formula: 'BaCO₃', name: 'barium carbonate', molarMass: 197.3, colour: '#fafafa', colourName: 'white', asSpecies: 'BaCO3(s)' })
c({ id: 'CaCO3', formula: 'CaCO₃', name: 'calcium carbonate', molarMass: 100.1, colour: '#fafafa', colourName: 'white', asSpecies: 'CaCO3(s)' })
c({ id: 'ZnCO3', formula: 'ZnCO₃', name: 'zinc carbonate (basic)', molarMass: 125.4, colour: '#fafafa', colourName: 'white', asSpecies: 'ZnCO3(s)' })
c({ id: 'MgCO3', formula: 'MgCO₃', name: 'magnesium carbonate (basic)', molarMass: 84.3, colour: '#fafafa', colourName: 'white', asSpecies: 'MgCO3(s)' })
c({ id: 'CuCO3', formula: 'CuCO₃·Cu(OH)₂', name: 'basic copper(II) carbonate', molarMass: 110.6, colour: '#5fae9a', colourName: 'green', asSpecies: 'CuCO3(s)' })
c({ id: 'PbCO3', formula: 'PbCO₃', name: 'lead(II) carbonate', molarMass: 267.2, colour: '#fafafa', colourName: 'white', asSpecies: 'PbCO3(s)' })
c({ id: 'FeCO3', formula: 'FeCO₃', name: 'iron(II) carbonate', molarMass: 115.9, colour: '#b9c3a6', colourName: 'pale green', asSpecies: 'FeCO3(s)' })
c({ id: 'CuO', formula: 'CuO', name: 'copper(II) oxide', molarMass: 79.5, colour: '#1f1b19', colourName: 'black', asSpecies: 'CuO(s)' })
c({ id: 'ZnO', formula: 'ZnO', name: 'zinc oxide', molarMass: 81.4, colour: '#fafafa', colourName: 'white', asSpecies: 'ZnO(s)' })
c({ id: 'MgO', formula: 'MgO', name: 'magnesium oxide', molarMass: 40.3, colour: '#fafafa', colourName: 'white', asSpecies: 'MgO(s)' })
c({ id: 'MnO2', formula: 'MnO₂', name: 'manganese(IV) oxide', molarMass: 86.9, colour: '#2a2622', colourName: 'black', asSpecies: 'MnO2(s)' })
c({ id: 'Fe2O3', formula: 'Fe₂O₃', name: 'iron(III) oxide', molarMass: 159.7, colour: '#8a2e17', colourName: 'red-brown', asSpecies: 'Fe2O3(s)' })
c({ id: 'Al', formula: 'Al', name: 'aluminium foil', molarMass: 26.98, colour: '#c9ccd0', colourName: 'silvery', asSpecies: 'Al(s)' })
c({ id: 'Mg', formula: 'Mg', name: 'magnesium ribbon', molarMass: 24.31, colour: '#b9bcc0', colourName: 'silvery grey', asSpecies: 'Mg(s)' })
c({ id: 'Zn', formula: 'Zn', name: 'zinc powder', molarMass: 65.38, colour: '#a9adb2', colourName: 'grey', asSpecies: 'Zn(s)' })

export const COMPOUNDS: Record<string, CompoundDef> = {}
for (const d of list) {
  COMPOUNDS[d.id] = d
  if (!d.asSpecies) {
    registerSpecies({ id: `cmp:${d.id}`, formula: d.formula, name: d.name, phase: 's', colour: d.colour, colourName: d.colourName, visibility: 1 })
  }
}

/** The engine species a compound becomes when placed in a vessel. */
export function compoundSpecies(id: string): string {
  const d = COMPOUNDS[id]
  if (!d) throw new Error(`Unknown compound: ${id}`)
  return d.asSpecies ?? `cmp:${id}`
}

// ---------------------------------------------------------------- thermal behaviour of plain solid species
// (insoluble starting materials and residues / precipitates heated dry)
export const SOLID_THERMAL: Record<string, ThermalStep[]> = {
  'ZnCO3(s)': [{ minTemp: 300, halfLife: 12, products: { 'ZnO(s)': 1, 'CO2(g)': 1, ...W(0.4) }, events: hydrateEvents }],
  'CuCO3(s)': [{ minTemp: 250, halfLife: 12, products: { 'CuO(s)': 1, 'CO2(g)': 0.5, ...W(0.5) }, events: ['green solid turns black', ...hydrateEvents] }],
  'MgCO3(s)': [{ minTemp: 400, halfLife: 20, products: { 'MgO(s)': 1, 'CO2(g)': 1, ...W(0.2) }, events: hydrateEvents }],
  'PbCO3(s)': [{ minTemp: 320, halfLife: 15, products: { 'PbO(s)': 1, 'CO2(g)': 1 }, events: [] }],
  'FeCO3(s)': [{ minTemp: 300, halfLife: 15, products: { 'Fe2O3(s)': 0.5, 'CO2(g)': 1 }, events: [] }],
  'CaCO3(s)': [{ minTemp: 800, halfLife: 120, products: { 'CaO(s)': 1, 'CO2(g)': 1 }, events: [] }],
  'Cu(OH)2(s)': [{ minTemp: 80, halfLife: 10, products: { 'CuO(s)': 1, ...W(1) }, events: ['blue solid turns black', ...hydrateEvents] }],
  'Na2CO3(s)': [],
  'FeSO4(s)': [{ minTemp: 480, halfLife: 20, products: { 'Fe2O3(s)': 0.5, 'SO2(g)': 0.5, 'SO3(g)': 0.5 }, events: ['white solid turns red-brown', 'acidic fumes with a choking smell'] }],
  'CrAlum-green(s)': [],
  'FeAlum-melt(s)': [{ minTemp: 400, halfLife: 30, products: { 'Fe2O3(s)': 0.5, 'NH3(g)': 0.5, 'SO3(g)': 1 }, events: ['residue turns red-brown', 'white fumes'] }],
  'K2MnO4(s)': [],
}

/** Special mixed-solid behaviour: iodides heated with zinc carbonate release a little iodine vapour. */
export const MIXED_THERMAL: { needs: string[]; step: ThermalStep; reactant: string }[] = [
  {
    reactant: 'cmp:KI',
    needs: ['ZnCO3(s)', 'ZnO(s)'],
    step: { minTemp: 380, halfLife: 200, products: { 'I2(g)': 0.05 }, events: ['purple vapour seen'] },
  },
]

export function allCompounds(): CompoundDef[] {
  return list
}

// Ensure every species referenced in thermal products exists (fail fast during development).
for (const d of list) {
  for (const step of d.thermal ?? []) {
    for (const p of Object.keys(step.products)) {
      if (!SPECIES[p]) throw new Error(`Thermal product ${p} of ${d.id} is not a known species`)
    }
  }
}
