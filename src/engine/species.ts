// Species catalogue: every ion, molecule, precipitate and gas the engine tracks.
//
// Aqueous colours use a simple Beer–Lambert model: `tint` is the apparent colour of the
// species at `refConc` (mol dm-3) viewed through a test-tube (~1.3 cm). Mixtures are
// obtained by adding absorbances, so colours combine physically (e.g. yellow Fe3+ with
// pink MnO4- gives orange).

export type Phase = 'aq' | 's' | 'g' | 'l'

export type FlameElement = 'Li' | 'Na' | 'K' | 'Ca' | 'Ba' | 'Cu' | 'Sr'

export interface SpeciesDef {
  id: string
  formula: string
  name: string
  phase: Phase
  charge?: number
  /** aqueous: apparent colour at refConc */
  tint?: string
  refConc?: number
  /** exam-style colour word(s); for aqueous species optionally concentration dependent */
  colourName?: string | ((conc: number) => string)
  /** solids: body colour */
  colour?: string
  /** solids: how visible a given amount is (scattering); default 1 */
  visibility?: number
  /** colour of a solid while hot (thermochromism), e.g. ZnO */
  hotColour?: string
  hotColourName?: string
  flame?: FlameElement
  /** fraction of the total absorbance at which this species names the solution colour (default 0.72) */
  nameDominance?: number
  /** gases: visible colour */
  gasColour?: string
  gasColourName?: string
}

const defs: SpeciesDef[] = []
const add = (d: SpeciesDef) => defs.push(d)

// ---------------------------------------------------------------- aqueous cations
add({ id: 'H+', formula: 'H⁺', name: 'hydrogen ion', phase: 'aq', charge: 1 })
add({ id: 'Li+', formula: 'Li⁺', name: 'lithium ion', phase: 'aq', charge: 1, flame: 'Li' })
add({ id: 'Na+', formula: 'Na⁺', name: 'sodium ion', phase: 'aq', charge: 1, flame: 'Na' })
add({ id: 'K+', formula: 'K⁺', name: 'potassium ion', phase: 'aq', charge: 1, flame: 'K' })
add({ id: 'NH4+', formula: 'NH₄⁺', name: 'ammonium ion', phase: 'aq', charge: 1 })
add({ id: 'Mg2+', formula: 'Mg²⁺', name: 'magnesium ion', phase: 'aq', charge: 2 })
add({ id: 'Ca2+', formula: 'Ca²⁺', name: 'calcium ion', phase: 'aq', charge: 2, flame: 'Ca' })
add({ id: 'Sr2+', formula: 'Sr²⁺', name: 'strontium ion', phase: 'aq', charge: 2, flame: 'Sr' })
add({ id: 'Ba2+', formula: 'Ba²⁺', name: 'barium ion', phase: 'aq', charge: 2, flame: 'Ba' })
add({ id: 'Al3+', formula: 'Al³⁺', name: 'aluminium ion', phase: 'aq', charge: 3 })
add({
  id: 'Cr3+', formula: 'Cr³⁺', name: 'chromium(III) ion', phase: 'aq', charge: 3,
  tint: '#5f7d62', refConc: 0.2, colourName: (c) => (c < 0.02 ? 'pale green' : 'green'),
})
add({
  id: 'Mn2+', formula: 'Mn²⁺', name: 'manganese(II) ion', phase: 'aq', charge: 2,
  tint: '#f6eaee', refConc: 0.2, colourName: 'very pale pink',
})
add({
  id: 'Fe2+', formula: 'Fe²⁺', name: 'iron(II) ion', phase: 'aq', charge: 2,
  tint: '#cfe3c4', refConc: 0.2, colourName: 'pale green',
})
add({
  id: 'Fe3+', formula: 'Fe³⁺', name: 'iron(III) ion', phase: 'aq', charge: 3,
  tint: '#d9a441', refConc: 0.1, colourName: (c) => (c < 0.01 ? 'pale yellow' : c < 0.08 ? 'yellow' : 'orange-brown'),
})
add({
  id: 'Co2+', formula: 'Co²⁺', name: 'cobalt(II) ion', phase: 'aq', charge: 2,
  tint: '#e9a3b6', refConc: 0.2, colourName: 'pink',
})
add({
  id: 'Ni2+', formula: 'Ni²⁺', name: 'nickel(II) ion', phase: 'aq', charge: 2,
  tint: '#a7d8a0', refConc: 0.2, colourName: 'green',
})
add({
  id: 'Cu2+', formula: 'Cu²⁺', name: 'copper(II) ion', phase: 'aq', charge: 2, flame: 'Cu',
  tint: '#3a96e0', refConc: 0.25, colourName: (c) => (c < 0.012 ? 'very pale blue' : c < 0.15 ? 'pale blue' : 'blue'),
})
add({ id: 'Zn2+', formula: 'Zn²⁺', name: 'zinc ion', phase: 'aq', charge: 2 })
add({ id: 'Ag+', formula: 'Ag⁺', name: 'silver ion', phase: 'aq', charge: 1 })
add({ id: 'Pb2+', formula: 'Pb²⁺', name: 'lead(II) ion', phase: 'aq', charge: 2 })

// ---------------------------------------------------------------- complexes / hydroxo anions
add({ id: 'Al(OH)4-', formula: '[Al(OH)₄]⁻', name: 'aluminate', phase: 'aq', charge: -1 })
add({ id: 'Zn(OH)4 2-', formula: '[Zn(OH)₄]²⁻', name: 'zincate', phase: 'aq', charge: -2 })
add({ id: 'Pb(OH)4 2-', formula: '[Pb(OH)₄]²⁻', name: 'plumbate(II)', phase: 'aq', charge: -2 })
add({
  id: 'Cr(OH)6 3-', formula: '[Cr(OH)₆]³⁻', name: 'chromate(III)', phase: 'aq', charge: -3,
  tint: '#2f6a35', refConc: 0.05, colourName: (c) => (c < 0.01 ? 'green' : 'dark green'),
})
add({
  id: 'Cu(NH3)4 2+', formula: '[Cu(NH₃)₄(H₂O)₂]²⁺', name: 'tetraamminecopper(II)', phase: 'aq', charge: 2, flame: 'Cu',
  tint: '#318ce8', refConc: 0.01, colourName: (c) => (c < 0.003 ? 'blue' : 'deep blue'),
})
add({ id: 'Zn(NH3)4 2+', formula: '[Zn(NH₃)₄]²⁺', name: 'tetraamminezinc', phase: 'aq', charge: 2 })
add({ id: 'Ag(NH3)2+', formula: '[Ag(NH₃)₂]⁺', name: 'diamminesilver(I)', phase: 'aq', charge: 1 })
add({
  id: 'Ni(NH3)6 2+', formula: '[Ni(NH₃)₆]²⁺', name: 'hexaamminenickel(II)', phase: 'aq', charge: 2,
  tint: '#8d8fe0', refConc: 0.1, colourName: 'lilac-blue',
})
add({
  id: 'Cr(NH3)6 3+', formula: '[Cr(NH₃)₆]³⁺', name: 'hexaamminechromium(III)', phase: 'aq', charge: 3,
  tint: '#b07fc4', refConc: 0.05, colourName: (c) => (c < 0.005 ? 'pale purple' : 'purple'),
})
add({ id: 'Ag(S2O3)2 3-', formula: '[Ag(S₂O₃)₂]³⁻', name: 'silver thiosulfate complex', phase: 'aq', charge: -3 })
add({ id: 'Cu(S2O3)2 3-', formula: '[Cu(S₂O₃)₂]³⁻', name: 'copper(I) thiosulfate complex', phase: 'aq', charge: -3 })
add({
  id: 'FeS2O3+', formula: '[Fe(S₂O₃)]⁺', name: 'iron(III) thiosulfate complex', phase: 'aq', charge: 1,
  tint: '#4a2149', refConc: 0.02, colourName: (c) => (c < 0.003 ? 'purple' : 'dark purple'),
})
add({
  id: 'FeSCN2+', formula: '[Fe(SCN)]²⁺', name: 'thiocyanatoiron(III)', phase: 'aq', charge: 2,
  tint: '#8e0f12', refConc: 0.01, colourName: (c) => (c < 0.001 ? 'red' : 'blood-red'),
})

// ---------------------------------------------------------------- anions / neutral solutes
add({ id: 'OH-', formula: 'OH⁻', name: 'hydroxide ion', phase: 'aq', charge: -1 })
add({ id: 'Cl-', formula: 'Cl⁻', name: 'chloride ion', phase: 'aq', charge: -1 })
add({ id: 'Br-', formula: 'Br⁻', name: 'bromide ion', phase: 'aq', charge: -1 })
add({ id: 'I-', formula: 'I⁻', name: 'iodide ion', phase: 'aq', charge: -1 })
add({ id: 'NO3-', formula: 'NO₃⁻', name: 'nitrate ion', phase: 'aq', charge: -1 })
add({ id: 'NO2-', formula: 'NO₂⁻', name: 'nitrite ion', phase: 'aq', charge: -1 })
add({ id: 'SO4 2-', formula: 'SO₄²⁻', name: 'sulfate ion', phase: 'aq', charge: -2 })
add({ id: 'SO3 2-', formula: 'SO₃²⁻', name: 'sulfite ion', phase: 'aq', charge: -2 })
add({ id: 'S2O3 2-', formula: 'S₂O₃²⁻', name: 'thiosulfate ion', phase: 'aq', charge: -2 })
add({ id: 'S4O6 2-', formula: 'S₄O₆²⁻', name: 'tetrathionate ion', phase: 'aq', charge: -2 })
add({ id: 'S2O8 2-', formula: 'S₂O₈²⁻', name: 'peroxodisulfate ion', phase: 'aq', charge: -2 })
add({ id: 'CO3 2-', formula: 'CO₃²⁻', name: 'carbonate ion', phase: 'aq', charge: -2 })
add({ id: 'HCO3-', formula: 'HCO₃⁻', name: 'hydrogencarbonate ion', phase: 'aq', charge: -1 })
add({ id: 'CO2(aq)', formula: 'CO₂(aq)', name: 'dissolved carbon dioxide', phase: 'aq' })
add({ id: 'SO2(aq)', formula: 'SO₂(aq)', name: 'dissolved sulfur dioxide', phase: 'aq' })
add({ id: 'NH3', formula: 'NH₃(aq)', name: 'ammonia', phase: 'aq' })
add({ id: 'H2O2', formula: 'H₂O₂', name: 'hydrogen peroxide', phase: 'aq' })
add({ id: 'ClO-', formula: 'ClO⁻', name: 'chlorate(I) ion', phase: 'aq', charge: -1 })
add({ id: 'SCN-', formula: 'SCN⁻', name: 'thiocyanate ion', phase: 'aq', charge: -1 })
add({ id: 'C2O4 2-', formula: 'C₂O₄²⁻', name: 'ethanedioate ion', phase: 'aq', charge: -2 })
add({
  id: 'CrO4 2-', formula: 'CrO₄²⁻', name: 'chromate(VI) ion', phase: 'aq', charge: -2,
  tint: '#e9d23a', refConc: 0.02, colourName: 'yellow',
})
add({
  id: 'Cr2O7 2-', formula: 'Cr₂O₇²⁻', name: 'dichromate(VI) ion', phase: 'aq', charge: -2,
  tint: '#e07b1f', refConc: 0.02, colourName: 'orange',
})
add({
  id: 'MnO4-', formula: 'MnO₄⁻', name: 'manganate(VII) ion', phase: 'aq', charge: -1,
  tint: '#8a1f7a', refConc: 0.004,
  colourName: (c) => (c < 0.0004 ? 'very pale pink' : c < 0.0025 ? 'pink' : c < 0.008 ? 'purple' : 'deep purple'),
})
add({
  id: 'MnO4 2-', formula: 'MnO₄²⁻', name: 'manganate(VI) ion', phase: 'aq', charge: -2,
  tint: '#2f7d3a', refConc: 0.01, colourName: (c) => (c < 0.003 ? 'green' : 'dark green'),
})
add({
  id: 'I2', formula: 'I₂(aq)', name: 'iodine', phase: 'aq',
  tint: '#a5571c', refConc: 0.004,
  colourName: (c) => (c < 0.0003 ? 'pale yellow' : c < 0.0015 ? 'yellow-brown' : c < 0.01 ? 'brown' : 'dark brown'),
})
add({ id: 'starch', formula: 'starch', name: 'starch', phase: 'aq' })
add({ id: 'S-nuclei', formula: 'S', name: 'sulfur (not yet visible)', phase: 'aq' })
add({
  id: 'starch-I2', formula: 'starch–iodine', name: 'starch–iodine complex', phase: 'aq',
  tint: '#141436', refConc: 0.0002, colourName: 'blue-black', nameDominance: 0.3,
})

// ---------------------------------------------------------------- precipitates / solid products
const ppt = (id: string, formula: string, name: string, colour: string, colourName: string, extra: Partial<SpeciesDef> = {}) =>
  add({ id, formula, name, phase: 's', colour, colourName, ...extra })

ppt('Al(OH)3(s)', 'Al(OH)₃', 'aluminium hydroxide', '#f4f6f6', 'white', { visibility: 1.2 })
ppt('Zn(OH)2(s)', 'Zn(OH)₂', 'zinc hydroxide', '#f6f7f7', 'white')
ppt('Mg(OH)2(s)', 'Mg(OH)₂', 'magnesium hydroxide', '#f6f7f7', 'white')
ppt('Ca(OH)2(s)', 'Ca(OH)₂', 'calcium hydroxide', '#f7f7f7', 'white')
ppt('Ba(OH)2(s)', 'Ba(OH)₂', 'barium hydroxide', '#f7f7f7', 'white')
ppt('Pb(OH)2(s)', 'Pb(OH)₂', 'lead(II) hydroxide', '#f4f4f2', 'white')
ppt('Cr(OH)3(s)', 'Cr(OH)₃', 'chromium(III) hydroxide', '#6f8a6a', 'grey-green', { visibility: 1.4 })
ppt('Cu(OH)2(s)', 'Cu(OH)₂', 'copper(II) hydroxide', '#7fb7e6', 'pale blue', { visibility: 1.3 })
ppt('Fe(OH)2(s)', 'Fe(OH)₂', 'iron(II) hydroxide', '#5f7f4f', 'green', { visibility: 1.4 })
ppt('Fe(OH)3(s)', 'Fe(OH)₃', 'iron(III) hydroxide', '#8a3b17', 'red-brown', { visibility: 1.5 })
ppt('Mn(OH)2(s)', 'Mn(OH)₂', 'manganese(II) hydroxide', '#efe6d8', 'off-white')
ppt('MnO(OH)2(s)', 'MnO(OH)₂', 'hydrated manganese(IV) oxide', '#5a3a1e', 'brown', { visibility: 1.5 })
ppt('MnO2(s)', 'MnO₂', 'manganese(IV) oxide', '#2a2622', 'black', { visibility: 1.6 })
ppt('Ni(OH)2(s)', 'Ni(OH)₂', 'nickel(II) hydroxide', '#8fc48a', 'pale green')
ppt('Co(OH)2(s)', 'Co(OH)₂', 'cobalt(II) hydroxide', '#6f83b8', 'blue')
ppt('Ag2O(s)', 'Ag₂O', 'silver(I) oxide', '#5a4030', 'brown', { visibility: 1.5 })
ppt('AgCl(s)', 'AgCl', 'silver chloride', '#f7f7f5', 'white', { visibility: 4 })
ppt('AgBr(s)', 'AgBr', 'silver bromide', '#efe6c4', 'cream', { visibility: 4 })
ppt('AgI(s)', 'AgI', 'silver iodide', '#eedc7a', 'yellow', { visibility: 4 })
ppt('Ag2CO3(s)', 'Ag₂CO₃', 'silver carbonate', '#f0e7c6', 'pale yellow', { visibility: 2 })
ppt('Ag2SO4(s)', 'Ag₂SO₄', 'silver sulfate', '#f7f7f5', 'white')
ppt('Ag2SO3(s)', 'Ag₂SO₃', 'silver sulfite', '#f7f7f5', 'white')
ppt('Ag(s)', 'Ag', 'silver', '#8f8f8f', 'grey')
ppt('BaSO4(s)', 'BaSO₄', 'barium sulfate', '#fafafa', 'white', { visibility: 3.5 })
ppt('BaSO3(s)', 'BaSO₃', 'barium sulfite', '#fafafa', 'white', { visibility: 2 })
ppt('BaCO3(s)', 'BaCO₃', 'barium carbonate', '#fafafa', 'white', { visibility: 3 })
ppt('BaCrO4(s)', 'BaCrO₄', 'barium chromate(VI)', '#efd63a', 'yellow', { visibility: 2 })
ppt('CaSO4(s)', 'CaSO₄', 'calcium sulfate', '#fafafa', 'white')
ppt('CaCO3(s)', 'CaCO₃', 'calcium carbonate', '#fafafa', 'white', { visibility: 2 })
ppt('PbCl2(s)', 'PbCl₂', 'lead(II) chloride', '#fafafa', 'white')
ppt('PbBr2(s)', 'PbBr₂', 'lead(II) bromide', '#f7f5ee', 'white')
ppt('PbI2(s)', 'PbI₂', 'lead(II) iodide', '#f2cf2a', 'bright yellow', { visibility: 2 })
ppt('PbSO4(s)', 'PbSO₄', 'lead(II) sulfate', '#fafafa', 'white', { visibility: 2 })
ppt('PbCO3(s)', 'PbCO₃', 'lead(II) carbonate', '#fafafa', 'white')
ppt('CuI(s)', 'CuI', 'copper(I) iodide', '#efe9dc', 'off-white', { visibility: 2 })
ppt('CuO(s)', 'CuO', 'copper(II) oxide', '#1f1b19', 'black', { visibility: 1.6 })
ppt('Cu(s)', 'Cu', 'copper', '#b0603a', 'pink-brown')
ppt('Fe(s)', 'Fe', 'iron', '#3d3d3d', 'grey-black')
ppt('S(s)', 'S', 'sulfur (colloidal)', '#f1e9b8', 'pale yellow', { visibility: 1.2 })
ppt('CuCO3(s)', 'CuCO₃·Cu(OH)₂', 'basic copper(II) carbonate', '#5fae9a', 'blue-green', { visibility: 1.3 })
ppt('ZnCO3(s)', 'ZnCO₃', 'zinc carbonate', '#fafafa', 'white')
ppt('MgCO3(s)', 'MgCO₃', 'magnesium carbonate', '#fafafa', 'white')
ppt('FeCO3(s)', 'FeCO₃', 'iron(II) carbonate', '#b9c3a6', 'pale green')
ppt('NiCO3(s)', 'NiCO₃', 'nickel(II) carbonate', '#9cc994', 'pale green')
ppt('MnCO3(s)', 'MnCO₃', 'manganese(II) carbonate', '#f2e6e2', 'off-white')
ppt('ZnO(s)', 'ZnO', 'zinc oxide', '#f7f7f2', 'white', { hotColour: '#e9d65a', hotColourName: 'yellow' })
ppt('MgO(s)', 'MgO', 'magnesium oxide', '#fafafa', 'white')
ppt('CaO(s)', 'CaO', 'calcium oxide', '#fafafa', 'white')
ppt('PbO(s)', 'PbO', 'lead(II) oxide', '#e8c25a', 'yellow', { hotColour: '#c9762c', hotColourName: 'orange-red' })
ppt('Fe2O3(s)', 'Fe₂O₃', 'iron(III) oxide', '#8a2e17', 'red-brown')
ppt('Cr2O3(s)', 'Cr₂O₃', 'chromium(III) oxide', '#3f6a33', 'green')
ppt('Al(s)', 'Al', 'aluminium foil', '#c9ccd0', 'silvery')
ppt('Mg(s)', 'Mg', 'magnesium ribbon', '#b9bcc0', 'silvery grey')
ppt('Zn(s)', 'Zn', 'zinc', '#a9adb2', 'grey')
ppt('K2MnO4(s)', 'K₂MnO₄', 'potassium manganate(VI)', '#16201a', 'black')
ppt('Na2CO3(s)', 'Na₂CO₃', 'sodium carbonate', '#fafafa', 'white')
ppt('Na2SO3(s)', 'Na₂SO₃', 'sodium sulfite', '#fafafa', 'white')
ppt('CuSO4(s)', 'CuSO₄', 'anhydrous copper(II) sulfate', '#eeeeea', 'white')
ppt('FeSO4(s)', 'FeSO₄', 'anhydrous iron(II) sulfate', '#f1f0ea', 'white')
ppt('CoCl2(s)', 'CoCl₂', 'anhydrous cobalt(II) chloride', '#3f63c9', 'blue')
ppt('CrAlum-green(s)', 'KCr(SO₄)₂', 'dehydrated chrome alum', '#3d6a3c', 'green')
ppt('FeAlum-melt(s)', 'NH₄Fe(SO₄)₂', 'dehydrated iron alum', '#d9b98a', 'pale brown')
ppt('NH4Cl-sublimate(s)', 'NH₄Cl', 'ammonium chloride sublimate', '#fafafa', 'white')
ppt('Na2SO4(s)', 'Na₂SO₄', 'sodium sulfate', '#fafafa', 'white')
ppt('NaNO2(s)', 'NaNO₂', 'sodium nitrite', '#f6f1dd', 'pale yellow')
ppt('KNO2(s)', 'KNO₂', 'potassium nitrite', '#f6f1dd', 'pale yellow')
ppt('BaCl2(s)', 'BaCl₂', 'anhydrous barium chloride', '#fafafa', 'white')
ppt('K2SO4(s)', 'K₂SO₄', 'potassium sulfate', '#fafafa', 'white')

// ---------------------------------------------------------------- gases (only tracked in the head-space)
add({ id: 'CO2(g)', formula: 'CO₂', name: 'carbon dioxide', phase: 'g' })
add({ id: 'H2(g)', formula: 'H₂', name: 'hydrogen', phase: 'g' })
add({ id: 'O2(g)', formula: 'O₂', name: 'oxygen', phase: 'g' })
add({ id: 'NH3(g)', formula: 'NH₃', name: 'ammonia', phase: 'g' })
add({ id: 'SO2(g)', formula: 'SO₂', name: 'sulfur dioxide', phase: 'g' })
add({ id: 'SO3(g)', formula: 'SO₃', name: 'sulfur trioxide', phase: 'g' })
add({ id: 'HCl(g)', formula: 'HCl', name: 'hydrogen chloride', phase: 'g' })
add({ id: 'NO(g)', formula: 'NO', name: 'nitrogen monoxide', phase: 'g' })
add({ id: 'NO2(g)', formula: 'NO₂', name: 'nitrogen dioxide', phase: 'g', gasColour: '#9a4a1c', gasColourName: 'brown' })
add({ id: 'Cl2(g)', formula: 'Cl₂', name: 'chlorine', phase: 'g', gasColour: '#c9d65a', gasColourName: 'pale yellow-green' })
add({ id: 'I2(g)', formula: 'I₂', name: 'iodine vapour', phase: 'g', gasColour: '#6a2a8a', gasColourName: 'purple' })
add({ id: 'H2O(g)', formula: 'H₂O', name: 'water vapour', phase: 'g' })

export const SPECIES: Record<string, SpeciesDef> = {}
for (const d of defs) SPECIES[d.id] = d

export function registerSpecies(d: SpeciesDef) {
  SPECIES[d.id] = d
}

export function species(id: string): SpeciesDef {
  const s = SPECIES[id]
  if (!s) throw new Error(`Unknown species: ${id}`)
  return s
}

export function colourNameOf(id: string, conc = 0.1): string | undefined {
  const s = species(id)
  if (typeof s.colourName === 'function') return s.colourName(conc)
  return s.colourName
}
