// Turns state changes in a vessel into exam-style observations.

import { solutionColour, solidAppearance, mixColours, nameFromRgb, type RGB } from './colour'
import { SPECIES, colourNameOf } from './species'

const colourNameOfConc = (id: string, c: number) => colourNameOf(id, c) ?? 'coloured'
import type { EngineEvent, Vessel } from './vessel'

/** visibility metric (mol dm⁻³ × scattering) below which a precipitate cannot be seen */
export const VIS_MIN = 5e-4
/** below this it is only a faint / slight precipitate */
export const VIS_CLEAR = 4e-3

/** solids that are pieces of metal rather than precipitates */
const PIECES = new Set(['Al(s)', 'Mg(s)', 'Zn(s)'])

export interface Snapshot {
  wet: boolean
  V: number
  T: number
  /** visibility metric for each solid (wet: suspended amount, dry: mmol) */
  solids: Record<string, number>
  /** amount of each solid, mmol */
  amounts: Record<string, number>
  solution: { name: string; rgb: RGB; intensity: number }
  headspace: Record<string, number>
}

export function solidMetric(v: Vessel, id: string): number {
  const amt = v.amount(id)
  if (amt <= 0) return 0
  if (!v.wet) return amt
  return (amt / v.V) * (SPECIES[id]?.visibility ?? 1)
}

export function snapshot(v: Vessel): Snapshot {
  const solids: Record<string, number> = {}
  const amounts: Record<string, number> = {}
  for (const [id, amt] of v.n) {
    if (SPECIES[id]?.phase === 's') {
      solids[id] = solidMetric(v, id)
      amounts[id] = amt
    }
  }
  return {
    wet: v.wet,
    V: v.V,
    T: v.T,
    solids,
    amounts,
    solution: solutionColour(v),
    headspace: Object.fromEntries(v.headspace),
  }
}

/** Tracks the largest amount of each solid seen during an action (to catch transient precipitates). */
export class Tracker {
  max: Record<string, number> = {}
  maxAmt: Record<string, number> = {}
  colours = new Set<string>()
  constructor(public before: Snapshot) {
    this.update(before)
  }
  update(s: Snapshot) {
    for (const [id, m] of Object.entries(s.solids)) this.max[id] = Math.max(this.max[id] ?? 0, m)
    for (const [id, m] of Object.entries(s.amounts)) this.maxAmt[id] = Math.max(this.maxAmt[id] ?? 0, m)
    if (s.wet) this.colours.add(s.solution.name)
  }
}

export interface Observation {
  kind: string
  text: string
}

const visible = (m: number | undefined, wet: boolean) => (m ?? 0) >= (wet ? VIS_MIN : 1e-4)

/** A minor precipitate mixed with a lot of another one cannot be distinguished. */
function visibleIn(s: Snapshot, id: string) {
  const m = s.solids[id] ?? 0
  if (!visible(m, s.wet)) return false
  const total = Object.values(s.solids).reduce((a, b) => a + b, 0)
  return m >= 0.05 * total
}

// precipitate conversions worth describing as a colour change of the solid
const CONVERSIONS: Record<string, string[]> = {
  'Fe(OH)2(s)': ['Fe(OH)3(s)'],
  'Mn(OH)2(s)': ['MnO(OH)2(s)'],
  'Cu(OH)2(s)': ['CuO(s)'],
}

function solidWord(id: string, added: Set<string>, wet: boolean) {
  if (PIECES.has(id)) return SPECIES[id].name
  if (!wet || added.has(id) || id.startsWith('cmp:')) return 'solid'
  return 'precipitate'
}

function colourOf(id: string, T: number) {
  return solidAppearance(id, T).name
}

/** Colour description of a set of dry solids (by amount). Coloured solids dominate white ones. */
export function drySolidDescription(v: Vessel): { name: string; rgb: RGB } | null {
  const parts: { rgb: RGB; w: number; name: string; coloured: boolean }[] = []
  for (const [id, amt] of v.n) {
    if (SPECIES[id]?.phase !== 's' || amt < 1e-4) continue
    const a = solidAppearance(id, v.T)
    const name = a.name === 'colourless' ? 'white' : a.name
    const coloured = !/^(white|colourless|silvery|silvery grey|grey)$/.test(name)
    // dark solids dominate the appearance of a mixture
    const lum = (a.rgb[0] + a.rgb[1] + a.rgb[2]) / 765
    parts.push({ rgb: a.rgb, w: amt * (1.6 - lum), name, coloured })
  }
  if (!parts.length) return null
  parts.sort((a, b) => b.w - a.w)
  const tot = parts.reduce((s, p) => s + p.w, 0)
  const colouredParts = parts.filter((p) => p.coloured)
  const colouredW = colouredParts.reduce((s, p) => s + p.w, 0)
  if (colouredParts.length && colouredW > 0.15 * tot) {
    if (colouredParts[0].w > 0.75 * colouredW || colouredParts.every((p) => p.name === colouredParts[0].name))
      return { name: colouredParts[0].name, rgb: colouredParts[0].rgb }
    const rgb = mixColours(colouredParts)
    return { name: nameFromRgb(rgb), rgb }
  }
  if (parts[0].w > 0.75 * tot) return { name: parts[0].name, rgb: parts[0].rgb }
  const rgb = mixColours(parts)
  const name = nameFromRgb(rgb)
  return { name: name === 'colourless' ? 'white' : name, rgb }
}

/** Reagents whose own colour is the observation (it either persists or is discharged). */
const REAGENT_COLOURS: Record<string, { label: string; reducedTo?: string }> = {
  'MnO4-': { label: 'potassium manganate(VII)' },
  'Cr2O7 2-': { label: 'potassium dichromate(VI)', reducedTo: 'Cr3+' },
}

export function describe(
  v: Vessel,
  before: Snapshot,
  tracker: Tracker,
  events: EngineEvent[],
  added: Set<string>,
  opts: {
    heating?: boolean
    dissolving?: boolean
    seconds?: number
    addedAmounts?: Map<string, number>
    beforeAmounts?: Map<string, number>
    beforeDryName?: string
  } = {},
): Observation[] {
  const after = snapshot(v)
  tracker.update(after)
  const out: Observation[] = []
  const push = (kind: string, text: string) => {
    if (!out.some((o) => o.text === text)) out.push({ kind, text })
  }
  const wet = after.wet || before.wet

  // ---- gases
  let bubbleGas = 0
  let dryGas = 0
  const gasColours = new Set<string>()
  for (const e of events) {
    if (e.kind === 'gas' && e.species) {
      const sp = SPECIES[e.species]
      if (sp?.gasColourName && e.amount > 0.002) gasColours.add(sp.gasColourName)
      if (e.species === 'NH3(g)' || e.species === 'SO2(g)') continue
      if (v.wet) bubbleGas += e.amount
      else dryGas += e.amount
    }
  }
  const rate = bubbleGas / Math.max(1, opts.seconds ?? 5)
  if (bubbleGas > 0.004) push('effervescence', bubbleGas > 0.08 && rate > 0.012 ? 'Effervescence (vigorous fizzing).' : 'Effervescence (bubbles of gas).')
  if (dryGas > 0.01 && gasColours.size === 0) push('gas', 'A colourless gas is given off.')
  for (const c of gasColours) {
    if (c === 'purple') push('gas', 'Purple vapour is seen.')
    else push('gas', `${cap(c)} gas is seen at the mouth of the tube.`)
  }
  const condensed = events.filter((e) => e.kind === 'condensation').reduce((s, e) => s + e.amount, 0)
  if (condensed > 0.01) push('condensation', 'Condensation (colourless droplets) forms on the cooler part of the tube.')

  // ---- rule events (melts, crackles, ...)
  for (const e of events) if (e.kind === 'rule' && e.text && e.text !== 'condensation') push('event', `${cap(e.text)}.`)
  if (events.some((e) => e.kind === 'overflow')) push('overflow', 'The tube overflows – some of the mixture is lost.')
  if (events.some((e) => e.kind === 'dry')) push('dry', 'The water boils away, leaving a residue.')

  // ---- solids
  const ids = new Set([...Object.keys(before.solids), ...Object.keys(after.solids), ...Object.keys(tracker.max)])
  const converted = new Set<string>()
  if (after.wet && before.wet) {
    // a precipitate changing into another one (air oxidation, warming …)
    for (const [from, tos] of Object.entries(CONVERSIONS)) {
      for (const to of tos) {
        const fromBefore = before.amounts[from] ?? 0
        const fromAfter = after.amounts[from] ?? 0
        const toBefore = before.amounts[to] ?? 0
        const toAfter = after.amounts[to] ?? 0
        if (!visibleIn(before, from) || !visible(after.solids[to], true)) continue
        // the new solid must have grown noticeably relative to the old one
        if (toAfter - toBefore < 0.04 * (fromBefore + toBefore)) continue
        converted.add(from)
        converted.add(to)
        const stillThere = fromAfter > 0.5 * toAfter
        const fromC = colourOf(from, after.T)
        const toC = colourOf(to, after.T)
        if (stillThere) push('ppt-change', `The ${fromC} precipitate turns ${toC} near the surface.`)
        else push('ppt-change', `The ${fromC} precipitate turns ${toC}.`)
      }
    }
  }

  const formed: string[] = []
  const faint: string[] = []
  const transient: string[] = []
  const dissolvedFull: string[] = []
  const dissolvedPart: string[] = []
  const solidDissolved: string[] = []
  const more: string[] = []
  for (const id of ids) {
    if (converted.has(id)) continue
    const a = after.solids[id] ?? 0
    const m = tracker.max[id] ?? 0
    // changes in amount (not concentration: adding liquid only dilutes a suspension)
    const bAmt = before.amounts[id] ?? 0
    const aAmt = after.amounts[id] ?? 0
    const bw = before.wet
    const aw = after.wet
    const word = solidWord(id, added, aw)
    if (!wet) continue
    const vb = visibleIn(before, id)
    // the last few grains of an added solid that is visibly dissolving are not worth reporting
    const va = visibleIn(after, id) && !(word === 'solid' && aAmt < 0.03 * bAmt)
    // something that is merely diluted has not dissolved
    const reallyGone = aAmt < 0.25 * bAmt
    if (!vb && va) {
      if (word === 'precipitate') (a < VIS_CLEAR ? faint : formed).push(id)
    } else if (!vb && visible(m, aw) && !va && aAmt < 0.25 * (tracker.maxAmt[id] ?? 0)) {
      if (word === 'precipitate') transient.push(id)
    } else if (vb && !va && reallyGone) {
      if (word === 'precipitate') dissolvedFull.push(id)
      else if (!PIECES.has(id)) solidDissolved.push(id)
      else if (bw === aw) push('piece', `The ${SPECIES[id].name} dissolves / is used up.`)
    } else if (vb && bw === aw && aAmt < 0.6 * bAmt) {
      if (word === 'precipitate') dissolvedPart.push(id)
      else if (!PIECES.has(id)) push('solid', `Some of the ${colourOf(id, after.T)} solid dissolves.`)
    } else if (vb && bw === aw && aAmt > 1.2 * bAmt && word === 'precipitate') {
      more.push(id)
    } else if (bw !== aw && vb && va && added.has(id) && !PIECES.has(id) && aAmt > 0.9 * bAmt) {
      push('solid', `The ${colourOf(id, after.T)} solid does not dissolve.`)
    }
  }
  const T = after.T
  const pptPhrase = (list: string[]) => joinColours(list.map((id) => colourOf(id, T)))
  if (formed.length) push('ppt', `${cap(pptPhrase(formed))} precipitate forms.`)
  if (faint.length) push('ppt', `A faint ${pptPhrase(faint)} precipitate (slight cloudiness) forms.`)
  if (more.length && !formed.length) push('ppt', `More ${pptPhrase(more)} precipitate forms.`)
  if (transient.length) push('ppt', `${cap(pptPhrase(transient))} precipitate forms but dissolves again (reagent in excess).`)

  const colourChanged = before.wet && after.wet && before.solution.name !== after.solution.name
  const solName = after.solution.name
  const giving = after.wet ? (solName === 'colourless' ? ', giving a colourless solution' : `, giving a ${solName} solution`) : ''
  if (dissolvedFull.length) push('ppt-dissolve', `The ${pptPhrase(dissolvedFull)} precipitate dissolves${giving}.`)
  if (dissolvedPart.length) push('ppt-dissolve', `The ${pptPhrase(dissolvedPart)} precipitate partially dissolves.`)
  const stillThere = ([id, m]: [string, number]) =>
    visible(m, after.wet) && added.has(id) && !PIECES.has(id) && (after.amounts[id] ?? 0) >= 0.03 * (before.amounts[id] ?? 0)
  if (solidDissolved.length) {
    const remaining = Object.entries(after.solids).filter(stillThere)
    if (remaining.length) push('dissolve', `Some of the solid dissolves${giving}; some solid remains.`)
    else push('dissolve', `The solid dissolves${giving}.`)
  } else if (opts.dissolving && after.wet && !before.wet) {
    const remaining = Object.entries(after.solids).filter(stillThere)
    if (!remaining.length && !formed.length) push('dissolve', `The solid dissolves${giving}.`)
  }

  // ---- reagents whose own colour matters (KMnO4, K2Cr2O7)
  let reagentColourHandled = false
  for (const [id, info] of Object.entries(REAGENT_COLOURS)) {
    const addedAmt = opts.addedAmounts?.get(id) ?? 0
    if (addedAmt <= 0 || !after.wet) continue
    const start = (opts.beforeAmounts?.get(id) ?? 0) + addedAmt
    const left = v.amount(id)
    const r = left / start
    reagentColourHandled = true
    if (r > 0.5) {
      const cname = id === 'MnO4-' ? colourNameOfConc(id, v.conc(id)) : 'orange'
      push('reagent-colour', `The solution turns ${cname} (the colour of the ${info.label} remains).`)
    } else if (r < 0.1) {
      if (info.reducedTo && v.amount(info.reducedTo) > 0) push('reagent-colour', `The orange ${info.label} turns green.`)
      else {
        const tail = solName !== 'colourless' ? `; the solution is ${solName}` : ''
        push('reagent-colour', `The ${info.label} is decolourised (its colour disappears)${tail}.`)
      }
    } else push('reagent-colour', `The ${info.label} is partly decolourised.`)
  }

  // ---- solution colour
  // a coloured ion precipitating out of solution is described by the precipitate itself
  const pptGrew = Object.keys(after.amounts).some((id) => !added.has(id) && after.amounts[id] > (before.amounts[id] ?? 0) * 1.02 + 1e-6)
  const pptTookColour = pptGrew && after.solution.name === 'colourless'
  if (colourChanged && !dissolvedFull.length && !pptTookColour && !reagentColourHandled) {
    const from = before.solution.name
    if (from === 'colourless') push('colour', `A ${solName} solution forms.`)
    else if (solName === 'colourless') push('colour', `The ${from} colour disappears; the solution becomes colourless.`)
    else push('colour', `The solution turns from ${from} to ${solName}.`)
  } else if (!before.wet && after.wet && !solidDissolved.length && !opts.dissolving && after.solution.name !== 'colourless') {
    push('colour', `A ${solName} solution forms.`)
  }

  // ---- dry solid colour change (heating)
  if (!after.wet && opts.heating) {
    const dry = drySolidDescription(v)
    if (!dry) {
      if (Object.keys(before.solids).length) push('dry', 'No solid remains in the tube.')
    } else if ((dry.name !== opts.beforeDryName && !out.some((o) => o.text.includes(`urns ${dry.name}`))) || out.length === 0) {
      push('residue', dry.name === opts.beforeDryName ? `The solid remains ${dry.name}.` : `The ${T > 250 ? 'hot ' : ''}solid turns ${dry.name}.`)
    }
  }

  if (!out.length) push('none', 'No visible change.')
  return out
}

function joinColours(list: string[]) {
  const uniq = [...new Set(list)]
  if (uniq.length === 1) return uniq[0]
  return uniq.slice(0, -1).join(', ') + ' and ' + uniq[uniq.length - 1]
}

export function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
