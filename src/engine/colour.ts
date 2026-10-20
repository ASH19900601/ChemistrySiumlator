// Colour model: Beer–Lambert mixing for solutions, weighted blending for solids, and
// exam-style colour words.

import { SPECIES, colourNameOf } from './species'
import type { Vessel } from './vessel'

export type RGB = [number, number, number]

const REF_PATH = 1.3

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

export function rgbToHex([r, g, b]: RGB): string {
  const c = (x: number) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

const epsCache = new Map<string, RGB>()
/** absorbance per (mol dm⁻³) per channel for a reference 1.3 cm path */
function epsilon(id: string): RGB | null {
  const sp = SPECIES[id]
  if (!sp?.tint || !sp.refConc) return null
  let e = epsCache.get(id)
  if (!e) {
    const rgb = hexToRgb(sp.tint)
    e = rgb.map((ch) => -Math.log10(Math.max(ch / 255, 0.004)) / sp.refConc!) as RGB
    epsCache.set(id, e)
  }
  return e
}

export function pathLength(v: Vessel) {
  return v.kind === 'boiling-tube' ? 2.1 : 1.3
}

export interface SolutionColour {
  rgb: RGB
  name: string
  /** total absorbance, a measure of intensity */
  intensity: number
}

export function solutionColour(v: Vessel): SolutionColour {
  if (!v.wet) return { rgb: [255, 255, 255], name: 'none', intensity: 0 }
  const path = pathLength(v) / REF_PATH
  const A: RGB = [0, 0, 0]
  const contrib: { id: string; a: number; c: number }[] = []
  for (const [id] of v.n) {
    const e = epsilon(id)
    if (!e) continue
    const c = v.conc(id)
    if (c <= 0) continue
    let a = 0
    for (let i = 0; i < 3; i++) {
      const x = e[i] * c * path
      A[i] += x
      a += x
    }
    contrib.push({ id, a, c })
  }
  const rgb = A.map((a) => 255 * Math.pow(10, -a)) as RGB
  const total = contrib.reduce((s, x) => s + x.a, 0)
  if (total < 0.03) return { rgb, name: 'colourless', intensity: total }
  contrib.sort((a, b) => b.a - a.a)
  // an intensely coloured species (e.g. starch–iodine) names the mixture even when not dominant
  const strong = contrib.find((x) => SPECIES[x.id].nameDominance !== undefined && x.a >= SPECIES[x.id].nameDominance! * total)
  let name: string
  if (strong) name = colourNameOf(strong.id, strong.c) ?? nameFromRgb(rgb)
  else if (contrib[0].a >= 0.72 * total) name = colourNameOf(contrib[0].id, contrib[0].c) ?? nameFromRgb(rgb)
  else name = nameFromRgb(rgb)
  return { rgb, name, intensity: total }
}

/** Approximate exam-style colour word for an RGB colour. */
export function nameFromRgb([r, g, b]: RGB): string {
  const R = r / 255
  const G = g / 255
  const B = b / 255
  const max = Math.max(R, G, B)
  const min = Math.min(R, G, B)
  const l = (max + min) / 2
  const d = max - min
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  let h = 0
  if (d !== 0) {
    if (max === R) h = 60 * (((G - B) / d) % 6)
    else if (max === G) h = 60 * ((B - R) / d + 2)
    else h = 60 * ((R - G) / d + 4)
  }
  if (h < 0) h += 360
  if (l < 0.12) return 'black'
  if (s < 0.12) return l > 0.85 ? 'colourless' : l > 0.55 ? 'grey' : l > 0.25 ? 'dark grey' : 'black'
  let base: string
  if (h < 12 || h >= 345) base = l > 0.55 ? 'pink' : 'red'
  else if (h < 45) base = l < 0.5 ? 'brown' : 'orange'
  else if (h < 68) base = l < 0.4 ? 'brown' : 'yellow'
  else if (h < 160) base = 'green'
  else if (h < 195) base = 'blue-green'
  else if (h < 255) base = 'blue'
  else if (h < 290) base = 'purple'
  else base = l > 0.6 ? 'pink' : 'purple'
  if (base === 'brown') return l < 0.25 ? 'dark brown' : base
  if (l > 0.8) return `pale ${base}`
  if (l < 0.28) return `dark ${base}`
  return base
}

export function mixColours(parts: { rgb: RGB; w: number }[]): RGB {
  const tot = parts.reduce((s, p) => s + p.w, 0)
  if (tot <= 0) return [255, 255, 255]
  const out: RGB = [0, 0, 0]
  for (const p of parts) for (let i = 0; i < 3; i++) out[i] += (p.rgb[i] * p.w) / tot
  return out
}

/** Colour and word for a solid species, honouring thermochromism. */
export function solidAppearance(id: string, T: number): { rgb: RGB; name: string } {
  const sp = SPECIES[id]
  if (!sp) return { rgb: [200, 200, 200], name: 'grey' }
  if (T > 250 && sp.hotColour) return { rgb: hexToRgb(sp.hotColour), name: sp.hotColourName ?? nameFromRgb(hexToRgb(sp.hotColour)) }
  const colour = sp.colour ?? '#dddddd'
  const name = typeof sp.colourName === 'string' ? sp.colourName : nameFromRgb(hexToRgb(colour))
  return { rgb: hexToRgb(colour), name }
}
