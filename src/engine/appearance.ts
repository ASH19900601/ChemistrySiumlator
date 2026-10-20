// Visual description of a vessel for rendering (no chemistry decisions here).

import { solutionColour, solidAppearance, mixColours, type RGB } from './colour'
import { drySolidDescription, solidMetric } from './observe'
import { SPECIES } from './species'
import { molarMassOf } from './lab'
import type { Vessel } from './vessel'

export interface Appearance {
  kind: Vessel['kind']
  label: string
  /** 0..1 of the usable height */
  liquidLevel: number
  liquidRGB: RGB
  /** 0..1 how strongly coloured the liquid is */
  liquidAlpha: number
  /** suspended precipitate */
  turbidity: number
  turbidityRGB: RGB
  /** settled precipitate layer, 0..1 of height */
  sediment: number
  sedimentRGB: RGB
  /** dry solid at the bottom (powder / crystals), 0..1 of height */
  solid: number
  solidRGB: RGB
  /** small pieces of metal */
  pieces: { kind: 'ribbon' | 'foil' | 'powder'; amount: number }[]
  /** 0..1 bubbling intensity */
  bubbles: number
  /** coloured gas in the head-space */
  gasRGB: RGB | null
  gasAlpha: number
  condensation: number
  hot: boolean
  heating: boolean
  stoppered: boolean
  T: number
}

const PIECE_KIND: Record<string, 'ribbon' | 'foil' | 'powder'> = { 'Mg(s)': 'ribbon', 'Al(s)': 'foil', 'Zn(s)': 'powder' }

export function appearance(v: Vessel): Appearance {
  const cap = v.spec.capacity
  const sol = solutionColour(v)
  const pieces: Appearance['pieces'] = []
  let susp = 0
  let sedimentVol = 0
  const suspParts: { rgb: RGB; w: number }[] = []
  const sedParts: { rgb: RGB; w: number }[] = []
  let dryMass = 0
  for (const [id, amt] of v.n) {
    const sp = SPECIES[id]
    if (sp?.phase !== 's' || amt < 1e-6) continue
    if (PIECE_KIND[id]) {
      pieces.push({ kind: PIECE_KIND[id], amount: amt })
      continue
    }
    if (v.wet) {
      const m = solidMetric(v, id)
      const rgb = solidAppearance(id, v.T).rgb
      susp += m * (1 - v.settled)
      suspParts.push({ rgb, w: m * (1 - v.settled) })
      // hydrous precipitates are bulky: ~0.06 cm³ per mmol once settled
      const vol = amt * 0.06 * v.settled
      sedimentVol += vol
      sedParts.push({ rgb, w: vol })
    } else {
      dryMass += (amt / 1000) * molarMassOf(id)
    }
  }
  const usable = cap / v.spec.area
  const dry = drySolidDescription(v)
  const gasParts: { rgb: RGB; w: number }[] = []
  let gasAmt = 0
  for (const [g, a] of v.headspace) {
    const c = SPECIES[g]?.gasColour
    if (!c || a < 1e-4) continue
    const rgb = [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)] as RGB
    gasParts.push({ rgb, w: a })
    gasAmt += a
  }
  const intensity = sol.intensity
  return {
    kind: v.kind,
    label: v.label,
    liquidLevel: Math.min(1, v.V / cap),
    liquidRGB: sol.rgb,
    liquidAlpha: v.wet ? Math.min(0.92, 0.08 + (1 - Math.exp(-intensity * 0.9)) * 0.85) : 0,
    turbidity: Math.min(0.95, 1 - Math.exp(-susp * 160)),
    turbidityRGB: mixColours(suspParts),
    sediment: Math.min(0.5, sedimentVol / v.spec.area / usable),
    sedimentRGB: mixColours(sedParts),
    solid: dryMass > 0 ? Math.min(0.45, ((dryMass * 0.7) / v.spec.area / usable) * 1.2 + 0.02) : 0,
    solidRGB: dry?.rgb ?? [240, 240, 240],
    pieces,
    bubbles: Math.min(1, v.bubbleRate * 25),
    gasRGB: gasParts.length ? mixColours(gasParts) : null,
    gasAlpha: Math.min(0.8, gasAmt * 40),
    condensation: Math.min(1, v.condensation * 8),
    hot: v.T > 45,
    heating: v.heating !== null,
    stoppered: v.stoppered,
    T: v.T,
  }
}
