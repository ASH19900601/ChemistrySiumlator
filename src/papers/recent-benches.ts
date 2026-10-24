// Sample quantities transcribed from the supplied 2023–2026 confidential instructions.
// These configurations enable free bench practice. They do not assert every original-paper
// operation has a mark-scheme regression; the UI distinguishes them from guided cases.
import { registerReagent, type SampleDef } from '../engine'

registerReagent({ id: 'H2SO4-0.5', label: 'dilute sulfuric acid', short: 'dilute H₂SO₄', kind: 'solution', conc: { 'H+': 1, 'SO4 2-': 0.5 } })
registerReagent({ id: 'KMnO4-H+-0.002', label: 'acidified aqueous potassium manganate(VII)', short: 'KMnO₄ / H⁺', kind: 'solution', conc: { 'K+': 0.002, 'MnO4-': 0.002, 'H+': 0.2, 'SO4 2-': 0.1 }, bottleTint: '#a34791' })
registerReagent({ id: 'Na2S2O3-0.5', label: 'aqueous sodium thiosulfate', short: 'Na₂S₂O₃(aq)', kind: 'solution', conc: { 'Na+': 1, 'S2O3 2-': 0.5 } })
registerReagent({ id: 'Na2S2O3-1', label: 'aqueous sodium thiosulfate', short: 'Na₂S₂O₃(aq)', kind: 'solution', conc: { 'Na+': 2, 'S2O3 2-': 1 } })
registerReagent({ id: 'Cl2-water', label: 'aqueous chlorine', short: 'chlorine water', kind: 'solution', conc: { 'Cl2(aq)': 0.03 }, bottleTint: '#eef3b5' })
registerReagent({ id: 'FeSO4-acidified-0.1', label: 'aqueous iron(II) sulfate', short: 'FeSO₄(aq)', kind: 'solution', conc: { 'Fe2+': 0.1, 'SO4 2-': 0.11, 'H+': 0.02 }, bottleTint: '#d7e7cf' })

const solid = (id: string, ...parts: [string, number][]): SampleDef => ({ id, label: `solid ${id}`, kind: 'solid', solid: parts.map(([compound, grams]) => ({ compound, grams })) })
const solution = (id: string, volume: number, conc: Record<string, number>): SampleDef => ({ id, label: `solution ${id}`, kind: 'solution', solution: { volume, conc } })
interface BenchDefinition { samples: SampleDef[]; reagents: string[] }

export const RECENT_BENCHES: Record<string, BenchDefinition> = {
  '0620_m23_52': { samples: [solution('C', 10, { 'Ca2+': 0.1, 'NO3-': 0.2 }), solution('D', 15, { 'H+': 1, 'SO4 2-': 0.5 })], reagents: ['water', 'HNO3', 'NaOH', 'AgNO3', 'Ba(NO3)2', 'Na2CO3-0.5', 'Na2CO3-solid', 'Al-foil'] },
  '0620_s23_52': { samples: [solution('F', 10, { 'Ba2+': 0.15, 'NO3-': 0.3 }), solid('G', ['FeSO4.7H2O', 1], ['Na2CO3.10H2O', 1])], reagents: ['water', 'NaOH', 'H2SO4-0.5', 'Al-foil'] },
  '0620_s23_53': { samples: [solid('H', ['KAl(SO4)2.12H2O', 3])], reagents: ['water', 'HNO3', 'NaOH', 'Ba(NO3)2', 'KMnO4-H+-0.002', 'Na2CO3', 'NH3'] },
  '0620_w23_52': { samples: [solid('K', ['ZnCl2', 0.25]), solid('L', ['NaNO3', 4])], reagents: ['water', 'HNO3', 'NaOH', 'AgNO3', 'KMnO4-H+-0.002', 'Al-foil'] },
  '0620_w23_53': { samples: [solid('I', ['KCr(SO4)2.12H2O', 2]), solution('J', 6, { 'H+': 0.25, 'Cl-': 0.25 })], reagents: ['water', 'Zn-powder', 'Mg-ribbon', 'H2SO4', 'HNO3', 'NaOH', 'AgNO3', 'Ba(NO3)2'] },
  '0620_m24_52': { samples: [solid('C', ['NH4I', 2]), solid('D', ['FeSO4.7H2O', 1], ['Na2CO3', 1])], reagents: ['water', 'HNO3', 'NaOH', 'Ba(NO3)2', 'AgNO3'] },
  '0620_s24_53': { samples: [solid('K', ['CuCO3', 3])], reagents: ['water', 'HCl', 'KI-0.5', 'starch', 'Na2S2O3-0.5', 'NH3'] },
  '0620_w24_53': { samples: [solid('R', ['Al2(SO4)3.16H2O', 1.5], ['NaBr', 1.5]), solid('S', ['Na2SO3', 1])], reagents: ['water', 'NaOH', 'NH3', 'HNO3', 'KMnO4-H+', 'AgNO3'] },
  '0620_m25_52': { samples: [solution('A', 10, { 'Cr3+': 0.5, 'Cl-': 1.5 }), solid('B', ['LiCl', 0.5], ['(NH4)2SO4', 0.5])], reagents: ['water', 'Na2CO3-0.5', 'NH3', 'NaOH', 'HNO3', 'AgNO3', 'Ba(NO3)2', 'KMnO4-H+'] },
  '0620_s25_51': { samples: [solid('F', ['CaCO3', 1]), solid('G', ['KBr', 1])], reagents: ['water', 'Na2CO3-0.5', 'HCl', 'NaOH', 'HNO3', 'AgNO3', 'Ba(NO3)2', 'Cl2-water'] },
  '0620_s25_52': { samples: [solid('J', ['(NH4)2Fe(SO4)2.6H2O', 0.5], ['KI', 0.5]), solid('K', ['KNO3', 1])], reagents: ['water', 'Na2CO3-0.5', 'NaOH', 'HNO3', 'AgNO3', 'starch', 'Cl2-water', 'Al-foil'] },
  '0620_s25_53': { samples: [solid('L', ['AlCl3.6H2O', 1.2]), solid('M', ['Ba(NO3)2', 0.5])], reagents: ['water', 'Na2CO3-0.5', 'NaOH', 'NH3', 'HNO3', 'AgNO3', 'H2SO4', 'Al-foil'] },
  '0620_w25_52': { samples: [solid('E', ['(NH4)2SO4', 1]), solid('F', ['ZnSO4.7H2O', 0.5], ['NaI', 0.5])], reagents: ['water', 'NaOH', 'NH3', 'HNO3', 'AgNO3', 'Ba(NO3)2', 'KMnO4-H+'] },
  '0620_w25_53': { samples: [solid('A', ['Fe(NO3)3.9H2O', 2])], reagents: ['water', 'Zn-powder', 'NH3', 'NaOH', 'HNO3', 'H2SO4', 'Na2S2O3-1', 'Ba(NO3)2', 'starch', 'KI-0.5', 'Al-foil'] },
  '0620_m26_52': { samples: [solid('A', ['CuCO3', 4]), solution('B', 4, { 'Ba2+': 1, 'Cl-': 2 })], reagents: ['water', 'HCl', 'HNO3', 'H2SO4', 'AgNO3', 'Ba(NO3)2', 'NH3', 'NaOH'] },
  '0620_s26_51': { samples: [solid('A', ['(NH4)2Fe(SO4)2.6H2O', 3]), solution('B', 3, { 'Al3+': 0.5, 'NO3-': 1.5 })], reagents: ['water', 'NaOH', 'NH3', 'HNO3', 'Ba(NO3)2', 'Al-foil', 'H2O2-20vol'] },
  '0620_s26_52': { samples: [solid('C', ['KCr(SO4)2.12H2O', 1]), solution('D', 6, { 'NH4+': 2, 'Br-': 2 })], reagents: ['water', 'NaOH', 'HNO3', 'AgNO3', 'Ba(NO3)2'] },
  '0620_s26_53': { samples: [solid('A', ['CaCl2', 3]), solid('B', ['ZnSO4', 0.5])], reagents: ['water', 'Mg-ribbon', 'NaHCO3', 'NaOH', 'HNO3', 'H2SO4', 'Ba(NO3)2', 'AgNO3'] },
}

// Both original components contain this Q2. Keep distinct IDs and original source documents.
for (const id of ['9701_w23_31', '9701_w23_35']) RECENT_BENCHES[id] = {
  samples: [solid('FA 6', ['NaNO3', 1]), solid('FA 7', ['NaNO2', 1]), solid('FA 8', ['NH4Cl', 1]), solid('FA 9', ['KMnO4', 1]), solid('FA 10', ['MnSO4', 1])],
  reagents: ['water', 'HCl-2M', 'HNO3-2M', 'H2SO4', 'NH3-2M', 'NaOH-2M', 'BaCl2', 'Ba(NO3)2', 'AgNO3', 'KMnO4-H+', 'Al-foil', 'FeSO4-acidified-0.1', 'KI'],
}
