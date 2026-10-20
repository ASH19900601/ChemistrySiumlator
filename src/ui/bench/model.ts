// The state of the bench and everything the student can do with the apparatus.
//
// All actions are physical: an item is picked up (dragged, or tapped to lift it) and brought to
// something else. What happens depends only on what is held and where it is: a bottle held over
// a tube pours, a strip held at the mouth of a tube tests the gas, a tube put in the flame heats.
// The chemistry is done by the engine (Lab); this class only decides which engine call a gesture
// means and keeps track of positions, timers and the apparatus' own state (burner, splints, …).

import {
  appearance,
  REAGENTS,
  type Appearance,
  type HeatMode,
  type IndicatorPaper,
  type Lab,
  type OpenAction,
  type Source,
  type VesselKind,
} from '../../engine'
import type { PaperCase } from '../../papers'
import { PAPER_COLOUR, washNozzle, type RGB, type SplintState } from './art'
import {
  BENCH_Y,
  bottleX,
  BURNER_TOP,
  BURNER_X,
  CLOCK,
  FLAME_TIP_BLUE,
  FLAME_TIP_YELLOW,
  FUNNEL_STAND,
  GAS_TAP,
  AIR_COLLAR,
  HOLDER_BOTTOM,
  MATCHBOX,
  RACK_BOTTOM,
  RACK_LEFT,
  RACK_RIGHT,
  RACK_SLOTS,
  SHELF_Y,
  SINK,
  slotX,
  surfaceY,
  TRAY,
  TRAY_Y,
  tubeBox,
  WASH_BOTTLE,
  WASTE,
  type HeatZone,
  type TubeBox,
} from './layout'
import { sound } from './sound'

export type TubeKind = Exclude<VesselKind, 'filter-paper'>
export type Place = { at: 'rack'; slot: number } | { at: 'burner'; zone: HeatZone }

export type Item =
  | { k: 'tube'; id: string }
  | { k: 'bottle'; reagentId: string }
  | { k: 'dropper'; reagentId: string }
  | { k: 'wash' }
  | { k: 'newtube'; kind: TubeKind }
  | { k: 'stopper' }
  | { k: 'spatula'; load: Map<string, number> | null; from: string | null; colour: RGB | null }
  | { k: 'piece'; reagentId: string }
  | { k: 'match'; until: number }
  | { k: 'splint'; state: SplintState; until: number }
  | { k: 'strip'; paper: IndicatorPaper; damp: boolean; colour: RGB | null }
  | { k: 'pipette'; gas: Map<string, number> | null }
  | { k: 'wire'; reading: string | null; colour: RGB | null }
  | { k: 'funnel' }

export interface Held {
  item: Item
  /** anchor: tip of a tool, bottom centre of a tube, base of a bottle */
  x: number
  y: number
  dragging: boolean
  /** anchor minus pointer while dragging */
  ox: number
  oy: number
}

export type Zone =
  | { t: 'tube'; id: string; part: 'mouth' | 'inside' | 'liquid' }
  | { t: 'funnel' }
  | { t: 'slot'; i: number }
  | { t: 'burner'; zone: HeatZone }
  | { t: 'flame' }
  | { t: 'nozzle' }
  | { t: 'waste' }
  | { t: 'sink' }
  | { t: 'tile' }
  | { t: 'stand' }
  | { t: 'box'; kind: TubeKind }
  | { t: 'jar'; reagentId: string }

export interface ShelfItem {
  reagentId: string
  kind: 'bottle' | 'jar' | 'dish'
  x: number
}

export interface Rect {
  id: string
  x: number
  y: number
  w: number
  h: number
}

interface Pour {
  action: OpenAction
  key: string
  src: Source | null
  volume: number
  grams: number
  intoFunnel: boolean
}

interface Effect {
  kind: 'pop' | 'flash'
  x: number
  y: number
  until: number
}

const FLAME_RGB: [RegExp, RGB][] = [
  [/Yellow flame/, [255, 196, 30]],
  [/Lilac flame/, [196, 140, 236]],
  [/Orange-red flame/, [255, 110, 46]],
  [/Light green flame/, [150, 232, 108]],
  [/Blue-green flame/, [40, 205, 172]],
  [/Red flame/, [255, 46, 60]],
]
const UI_RGB: Record<string, RGB> = {
  red: [217, 52, 43], orange: [240, 138, 36], yellow: [233, 207, 42], green: [76, 175, 80], 'blue-green': [42, 157, 143], blue: [47, 95, 179], purple: [106, 61, 154],
}

/** The colour a strip of paper takes after a test, from the engine's description. */
export function stripColour(paper: IndicatorPaper, text: string): RGB | null {
  if (/bleached/.test(text)) return [244, 242, 234]
  if (/No change/.test(text)) return null
  if (paper === 'universal-indicator') {
    const m = text.match(/turns ([a-z-]+)/)
    return m ? UI_RGB[m[1]] ?? null : null
  }
  if (/slightly red/.test(text)) return [150, 96, 162]
  if (/turns blue/.test(text)) return PAPER_COLOUR['blue-litmus']
  if (/turns red/.test(text)) return PAPER_COLOUR['red-litmus']
  return null
}

const near = (ax: number, ay: number, bx: number, by: number, r: number) => (ax - bx) ** 2 + (ay - by) ** 2 <= r * r
const inRect = (x: number, y: number, r: { x: number; y: number; w: number; h: number }) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h
const zoneKey = (z: Zone | null) => (z ? JSON.stringify(z) : '')
/** Things that are operated where they are (never picked up). */
const CONTROLS = new Set(['gastap', 'collar', 'clock'])

/** Offsets from the pointer to the active point of a held item (tips sit just below the finger). */
const TOOL_OFFSET: Partial<Record<Item['k'], [number, number]>> = {
  dropper: [0, 70],
  strip: [0, 60],
  splint: [0, 60],
  pipette: [0, 70],
  wire: [0, 64],
  spatula: [-30, 46],
  match: [0, 50],
  stopper: [0, 30],
  piece: [0, 20],
  funnel: [0, 90],
  newtube: [0, 130],
}

export class BenchModel {
  readonly lab: Lab
  readonly shelf: ShelfItem[]
  places = new Map<string, Place>()
  sampleIds = new Set<string>()
  badges = new Map<string, string>()
  burner = { gas: false, lit: false, air: true }
  held: Held | null = null
  hover: Zone | null = null
  /** tap mode: the target being pressed with a lifted item */
  pressing: Zone | null = null
  parked: { reagentId: string; target: { vesselId: string } | 'funnel'; action: OpenAction; drops: number; squeezeUntil: number } | null = null
  funnel: { on: string | null; paperId: string | null } = { on: null, paperId: null }
  tile: { paper: IndicatorPaper; colour: RGB | null; damp: boolean }[] = []
  flameTint: { colour: RGB; until: number } | null = null
  fast = false
  effects: Effect[] = []
  pour: Pour | null = null
  heat: { action: OpenAction; vesselId: string; mode: HeatMode; rank: number; start: number } | null = null
  /** something that should be shown to the student briefly (e.g. "the rack is full") */
  notice: { text: string; until: number } | null = null
  version = 0

  private now = 0
  private dwell: { key: string; since: number; fired: boolean } | null = null
  private press: { id: string; x: number; y: number; t: number; moved: boolean } | null = null
  private squeezing: { next: number; interval: number; count: number } | null = null
  private pending: { z: Zone | null; id: string | null; x: number; y: number; at: number } | null = null
  private pressUntil = 0
  private wiggle: { x: number; t: number; dir: number; flips: number[] } | null = null
  private lastShake = 0
  private appearances = new Map<string, { key: string; a: Appearance }>()

  constructor(lab: Lab, paper: PaperCase) {
    this.lab = lab
    // distilled water is the wash bottle; limewater is always on the bench for the carbon dioxide test
    const ids = paper.reagents.filter((id) => id !== 'water' && REAGENTS[id])
    if (!ids.includes('limewater')) ids.push('limewater')
    this.shelf = ids.map((id, i) => ({ reagentId: id, kind: REAGENTS[id].kind === 'solution' ? 'bottle' : REAGENTS[id].kind === 'piece' ? 'dish' : 'jar', x: bottleX(i, ids.length) }) as ShelfItem)
    let slot = 0
    for (const s of paper.samples) {
      const id = lab.samples.get(s.id)!
      this.places.set(id, { at: 'rack', slot: slot++ })
      this.sampleIds.add(id)
      this.badges.set(id, s.label.replace(/^solid /, ''))
    }
  }

  // ================================================================== geometry
  vesselKind(id: string): TubeKind {
    return this.lab.vessel(id).kind as TubeKind
  }

  appearanceOf(id: string): Appearance {
    const v = this.lab.vessel(id)
    const a = appearance(v)
    const key = JSON.stringify(a)
    const cached = this.appearances.get(id)
    if (cached && cached.key === key) return cached.a
    this.appearances.set(id, { key, a })
    return a
  }

  /** Geometry of a tube where it currently is (held tubes follow the hand). */
  boxOf(id: string): TubeBox | null {
    const kind = this.vesselKind(id)
    if (this.held?.item.k === 'tube' && this.held.item.id === id) return tubeBox(kind, this.held.x, this.held.y)
    const p = this.places.get(id)
    if (!p) return null
    if (p.at === 'rack') return tubeBox(kind, slotX(p.slot), RACK_BOTTOM)
    return tubeBox(kind, BURNER_X, HOLDER_BOTTOM[p.zone])
  }

  /** Tubes standing somewhere (rack or burner), not the one in the hand. */
  standing(): string[] {
    return [...this.places.keys()].filter((id) => !(this.held?.item.k === 'tube' && this.held.item.id === id) && this.lab.vessels.has(id))
  }

  onBurner(): string | null {
    for (const [id, p] of this.places) if (p.at === 'burner' && !(this.held?.item.k === 'tube' && this.held.item.id === id)) return id
    return null
  }

  private freeSlot(nearX?: number): number | null {
    const used = new Set([...this.places.values()].filter((p) => p.at === 'rack').map((p) => (p as { slot: number }).slot))
    const free = Array.from({ length: RACK_SLOTS }, (_, i) => i).filter((i) => !used.has(i))
    if (!free.length) return null
    if (nearX === undefined) return free[0]
    return free.sort((a, b) => Math.abs(slotX(a) - nearX) - Math.abs(slotX(b) - nearX))[0]
  }

  flameTop() {
    return this.burner.air ? FLAME_TIP_BLUE : FLAME_TIP_YELLOW
  }

  /** Point where pouring happens for a pouring item (lip of a bottle, mouth of a tube). */
  lip(h: Held): { x: number; y: number } {
    const it = h.item
    if (it.k === 'bottle') return { x: h.x, y: h.y - 134 }
    if (it.k === 'wash') return { x: h.x + 44, y: h.y - 176 }
    if (it.k === 'tube') {
      const b = tubeBox(this.vesselKind(it.id), h.x, h.y)
      return { x: b.cx, y: b.rim }
    }
    return { x: h.x, y: h.y }
  }

  funnelTip(): { x: number; y: number } | null {
    if (this.held?.item.k === 'funnel') return { x: this.held.x, y: this.held.y }
    if (this.funnel.on) {
      const b = this.boxOf(this.funnel.on)
      if (b) return { x: b.cx, y: b.rim + 40 }
    }
    return { x: FUNNEL_STAND.x, y: FUNNEL_STAND.y }
  }

  // ================================================================== hit areas (for picking things up)
  hitRects(): Rect[] {
    const r: Rect[] = []
    const h = this.held
    if (h && !h.dragging) r.push(this.heldRect(h))
    if (this.parked) {
      const t = this.parkedTip()
      if (t) r.push({ id: 'parked', x: t.x - 22, y: t.y - 116, w: 44, h: 120 })
    }
    if (this.funnel.on) {
      const t = this.funnelTip()!
      r.push({ id: 'funnel', x: t.x - 50, y: t.y - 114, w: 100, h: 80 })
    }
    for (const id of this.standing()) {
      const b = this.boxOf(id)!
      if (this.lab.vessel(id).stoppered) r.push({ id: `stopper:${id}`, x: b.cx - 26, y: b.rim - 34, w: 52, h: 40 })
      r.push({ id: `tube:${id}`, x: b.cx - b.inner / 2 - 12, y: b.rim - 16, w: b.inner + 24, h: b.bottom - b.rim + 40 })
    }
    if (!this.funnel.on && this.held?.item.k !== 'funnel') r.push({ id: 'funnel', x: FUNNEL_STAND.x - 50, y: FUNNEL_STAND.y - 120, w: 100, h: 126 })
    for (const s of this.shelf) {
      if (s.kind === 'bottle') {
        r.push({ id: `dropper:${s.reagentId}`, x: s.x - 22, y: SHELF_Y - 190, w: 44, h: 58 })
        r.push({ id: `bottle:${s.reagentId}`, x: s.x - 38, y: SHELF_Y - 132, w: 76, h: 134 })
      } else if (s.kind === 'jar') r.push({ id: `jar:${s.reagentId}`, x: s.x - 40, y: SHELF_Y - 110, w: 80, h: 112 })
      else r.push({ id: `piece:${s.reagentId}`, x: s.x - 44, y: SHELF_Y - 50, w: 88, h: 52 })
    }
    r.push({ id: 'wash', x: WASH_BOTTLE.x - 40, y: WASH_BOTTLE.y - 182, w: 92, h: 184 })
    r.push({ id: 'gastap', x: GAS_TAP.x - 34, y: GAS_TAP.y - 40, w: 50, h: 62 })
    r.push({ id: 'collar', x: AIR_COLLAR.x - 24, y: AIR_COLLAR.y - 18, w: 48, h: 36 })
    r.push({ id: 'matchbox', x: MATCHBOX.x - 38, y: MATCHBOX.y - 24, w: 76, h: 46 })
    r.push({ id: 'clock', x: CLOCK.x - CLOCK.r - 8, y: CLOCK.y - CLOCK.r - 8, w: 2 * CLOCK.r + 16, h: 2 * CLOCK.r + 16 })
    for (const kind of ['test-tube', 'boiling-tube', 'hard-glass-tube'] as TubeKind[]) r.push({ id: `box:${kind}`, x: TRAY.box[kind].x - 48, y: TRAY_Y - 96, w: 96, h: 108 })
    r.push({ id: 'stoppers', x: TRAY.stoppers.x - 42, y: TRAY_Y - 56, w: 84, h: 64 })
    if (this.held?.item.k !== 'spatula') r.push({ id: 'spatula', x: TRAY.spatula.x - 30, y: TRAY_Y - 150, w: 90, h: 156 })
    for (const p of ['red-litmus', 'blue-litmus', 'universal-indicator'] as IndicatorPaper[]) r.push({ id: `booklet:${p}`, x: TRAY[p].x - 32, y: TRAY_Y - 88, w: 64, h: 92 })
    r.push({ id: 'splints', x: TRAY.splints.x - 34, y: TRAY_Y - 92, w: 68, h: 96 })
    r.push({ id: 'pipettes', x: TRAY.pipettes.x - 32, y: TRAY_Y - 120, w: 64, h: 124 })
    if (this.held?.item.k !== 'wire') r.push({ id: 'wire', x: TRAY.wire.x - 26, y: TRAY_Y - 140, w: 52, h: 144 })
    return r
  }

  heldRect(h: Held): Rect {
    switch (h.item.k) {
      case 'tube': {
        const b = tubeBox(this.vesselKind(h.item.id), h.x, h.y)
        return { id: 'held', x: b.cx - b.inner / 2 - 14, y: b.rim - 20, w: b.inner + 28, h: b.bottom - b.rim + 30 }
      }
      case 'bottle':
        return { id: 'held', x: h.x - 38, y: h.y - 140, w: 76, h: 142 }
      case 'wash':
        return { id: 'held', x: h.x - 40, y: h.y - 182, w: 92, h: 184 }
      case 'newtube':
        return { id: 'held', x: h.x - 30, y: h.y - 220, w: 60, h: 224 }
      case 'funnel':
        return { id: 'held', x: h.x - 50, y: h.y - 114, w: 100, h: 116 }
      case 'spatula':
        return { id: 'held', x: h.x - 16, y: h.y - 140, w: 90, h: 150 }
      default:
        return { id: 'held', x: h.x - 22, y: h.y - 124, w: 44, h: 130 }
    }
  }

  parkedTip(): { x: number; y: number } | null {
    if (!this.parked) return null
    if (this.parked.target === 'funnel') {
      const t = this.funnelTip()
      return t ? { x: t.x, y: t.y - 118 } : null
    }
    const b = this.boxOf(this.parked.target.vesselId)
    return b ? { x: b.cx, y: b.rim - 12 } : null
  }

  // ================================================================== zones (where a held item is)
  private tubePart(id: string, x: number, y: number, generous = false): 'mouth' | 'inside' | 'liquid' | null {
    const b = this.boxOf(id)
    if (!b) return null
    const half = b.inner / 2
    if (Math.abs(x - b.cx) <= half + (generous ? 34 : 22) && y >= b.rim - (generous ? 130 : 60) && y < b.rim + 14) return 'mouth'
    if (Math.abs(x - b.cx) <= half + 8 && y >= b.rim + 14 && y <= b.bottom + 8) {
      const a = this.appearanceOf(id)
      const surf = surfaceY(b, this.vesselKind(id), a.liquidLevel)
      return a.liquidLevel > 0.004 && y >= surf - 3 ? 'liquid' : 'inside'
    }
    return null
  }

  private tubeAt(x: number, y: number, generous = false, stoppered = false): Zone | null {
    for (const id of this.standing()) {
      // nothing gets into (or out of) a stoppered tube – except that the stopper can come off
      if (this.lab.vessel(id).stoppered !== stoppered) continue
      const part = this.tubePart(id, x, y, generous)
      if (part) return { t: 'tube', id, part }
    }
    return null
  }

  private funnelAt(x: number, y: number): boolean {
    if (!this.funnel.on) return false
    const t = this.funnelTip()!
    return Math.abs(x - t.x) < 60 && y > t.y - 230 && y < t.y - 60
  }

  private inFlame(x: number, y: number) {
    return Math.abs(x - BURNER_X) < 40 && y > this.flameTop() - 40 && y < BURNER_TOP + 6
  }

  /** What the held item is over. */
  zoneFor(h: Held): Zone | null {
    const it = h.item
    const { x, y } = h
    switch (it.k) {
      case 'tube': {
        const lip = this.lip(h)
        if (this.funnelAt(lip.x, lip.y) && this.funnel.on !== it.id) return { t: 'funnel' }
        const t = this.tubeAt(lip.x, lip.y, true)
        if (t) return t
        return this.placementZone(x, y, it.id)
      }
      case 'bottle':
      case 'wash': {
        const lip = this.lip(h)
        if (this.funnelAt(lip.x, lip.y)) return { t: 'funnel' }
        return this.tubeAt(lip.x, lip.y, true)
      }
      case 'dropper':
        if (this.funnelAt(x, y)) return { t: 'funnel' }
        return this.tubeAt(x, y, true)
      case 'newtube':
        return this.rackZone(x, y)
      case 'stopper':
        return this.tubeAt(x, y, true)
      case 'piece':
        return this.tubeAt(x, y, true)
      case 'spatula':
        for (const s of this.shelf) if (s.kind === 'jar' && Math.abs(x - s.x) < 44 && y > SHELF_Y - 120 && y < SHELF_Y + 10) return { t: 'jar', reagentId: s.reagentId }
        return this.tubeAt(x, y, true)
      case 'match':
        return Math.abs(x - BURNER_X) < 34 && y > BURNER_TOP - 90 && y < BURNER_TOP + 10 ? { t: 'flame' } : null
      case 'splint':
      case 'wire':
        if (this.burner.lit && this.inFlame(x, y)) return { t: 'flame' }
        return this.tubeAt(x, y)
      case 'strip': {
        const n = washNozzle()
        if (near(x, y, n.x + 6, n.y + 8, 34)) return { t: 'nozzle' }
        if (inRect(x, y, { x: TRAY.tile.x - TRAY.tile.w / 2, y: TRAY_Y - 110, w: TRAY.tile.w, h: 120 })) return { t: 'tile' }
        if (this.inWaste(x, y)) return { t: 'waste' }
        return this.tubeAt(x, y)
      }
      case 'pipette':
        return this.tubeAt(x, y)
      case 'funnel': {
        if (near(x, y, FUNNEL_STAND.x, FUNNEL_STAND.y, 70)) return { t: 'stand' }
        if (this.inWaste(x, y)) return { t: 'waste' }
        const t = this.tubeAt(x, y, true)
        return t && t.t === 'tube' && this.places.get(t.id)?.at === 'rack' ? t : null
      }
    }
  }

  private inWaste(x: number, y: number) {
    return Math.abs(x - WASTE.x) < 70 && y > WASTE.y - 200 && y < WASTE.y + 20
  }

  private rackZone(x: number, y: number): Zone | null {
    if (x < RACK_LEFT - 20 || x > RACK_RIGHT + 20 || y < 360 || y > BENCH_Y + 30) return null
    const i = this.freeSlot(x)
    return i === null ? null : { t: 'slot', i }
  }

  /** Where a tube held by its bottom at (x, y) would be put down. */
  private placementZone(x: number, y: number, id: string): Zone | null {
    if (Math.abs(x - BURNER_X) < 90 && y > 400 && y < 650) return { t: 'burner', zone: y < (HOLDER_BOTTOM.high + HOLDER_BOTTOM.low) / 2 ? 'high' : 'low' }
    if (this.inWaste(x, y - 60)) return { t: 'waste' }
    if (Math.abs(x - SINK.x) < 70 && y > SINK.y - 230 && y < SINK.y + 30) return { t: 'sink' }
    for (const kind of ['test-tube', 'boiling-tube', 'hard-glass-tube'] as TubeKind[])
      if (Math.abs(x - TRAY.box[kind].x) < 50 && y > TRAY_Y - 110 && y < TRAY_Y + 80 && !this.sampleIds.has(id)) return { t: 'box', kind }
    const p = this.places.get(id)
    if (x >= RACK_LEFT - 20 && x <= RACK_RIGHT + 20 && y > 360 && y < BENCH_Y + 30) {
      const i = this.freeSlot(x)
      if (p?.at === 'rack' && (i === null || Math.abs(slotX(p.slot) - x) <= Math.abs(slotX(i) - x))) return { t: 'slot', i: p.slot }
      return i === null ? null : { t: 'slot', i }
    }
    return null
  }

  // ================================================================== pointer input
  /** Pointer pressed on hit area `id` (or on empty bench when null) at scene point (x, y). */
  down(id: string | null, x: number, y: number) {
    this.press = { id: id ?? '', x, y, t: this.now, moved: false }
    const h = this.held
    if (id === 'parked' && this.parked && !h) {
      // the first drop comes on release (a tap) or after a short still press; dragging moves the dropper
      this.squeezing = { next: this.now + 180, interval: 320, count: 0 }
      return
    }
    if (h && !h.dragging && id !== 'held' && !CONTROLS.has(id ?? '')) {
      // an item is lifted: wait to see whether this is a tap (use it here), a press-and-hold
      // (e.g. pour while pressing) or the start of a drag of something else
      this.pending = { z: this.tapZone(h, id, x, y), id, x, y, at: this.now }
    }
  }

  move(x: number, y: number) {
    const p = this.press
    if (p && !p.moved && near(x, y, p.x, p.y, 7)) return
    if (p && !p.moved) {
      p.moved = true
      this.squeezing = null
      const pend = this.pending
      this.pending = null
      if (this.pressing) {
        // sliding the finger while pressing ends the hold action
        this.endPressing()
      } else if (pend) {
        // dragging something else: put down what is in the hand first
        if (pend.id && this.pickable(pend.id)) {
          this.putBack()
          const it = this.pickUp(pend.id)
          if (it) this.startDrag(it, p.x, p.y)
        }
      } else if (p.id === 'held' && this.held) {
        this.held.dragging = true
        this.held.ox = this.held.x - p.x
        this.held.oy = this.held.y - p.y
      } else if (p.id === 'parked' && this.parked) {
        const r = this.parked.reagentId
        this.unpark()
        this.startDrag({ k: 'dropper', reagentId: r }, p.x, p.y)
      } else if (p.id && !CONTROLS.has(p.id)) {
        const it = this.pickUp(p.id)
        if (it) this.startDrag(it, p.x, p.y)
      }
    }
    const h = this.held
    if (!h?.dragging) return
    h.x = x + h.ox
    h.y = y + h.oy
    if (h.item.k === 'tube' || h.item.k === 'splint') this.trackWiggle(x)
    const z = this.zoneFor(h)
    if (zoneKey(z) !== zoneKey(this.hover)) {
      this.hover = z
      this.dwell = null
      if (this.pour && (!z || this.pourKey(h.item, z) !== this.pour.key)) this.stopPour()
    }
    this.bump()
  }

  up(x: number, y: number) {
    const p = this.press
    this.press = null
    if (this.squeezing && this.squeezing.count === 0 && p && !p.moved) this.squeeze()
    this.squeezing = null
    const pend = this.pending
    this.pending = null
    if (this.pressing) {
      if (!this.pressUntil) this.endPressing()
      this.bump()
      return
    }
    const h = this.held
    if (pend && h) {
      const z = pend.z
      if (z && this.isContinuous(h.item, z)) {
        this.moveHeldTo(h, z, pend.x, pend.y)
        // a quick tap with a bottle pours a little; a tool stays where it was brought
        if (h.item.k === 'bottle' || h.item.k === 'wash' || h.item.k === 'tube') this.startPressing(z, 600)
      } else if (z) {
        this.moveHeldTo(h, z, pend.x, pend.y)
        this.drop(h, z)
      } else if (!pend.id || !this.pickable(pend.id)) {
        this.putBack()
      } else {
        // tapped another piece of apparatus: swap
        this.putBack()
        this.tap(pend.id, x, y)
      }
      this.bump()
      return
    }
    if (h?.dragging) {
      h.dragging = false
      const z = this.zoneFor(h)
      this.hover = null
      this.stopPour()
      if (z && !this.isContinuous(h.item, z)) this.drop(h, z)
      else this.afterGesture(h, z)
      this.bump()
      return
    }
    if (p && !p.moved && p.id) this.tap(p.id, x, y)
    this.bump()
  }

  private startPressing(z: Zone, autoMs = 0) {
    this.pressing = z
    this.hover = z
    this.dwell = null
    this.pressUntil = autoMs ? this.now + autoMs : 0
  }

  private endPressing() {
    this.pressing = null
    this.pressUntil = 0
    this.hover = null
    this.stopPour()
  }

  cancel() {
    this.press = null
    this.squeezing = null
    this.pending = null
    this.endPressing()
    if (this.held?.dragging) this.putBack()
    this.bump()
  }

  private startDrag(item: Item, px: number, py: number) {
    const [ox, oy] = TOOL_OFFSET[item.k] ?? [0, 0]
    let ax = px + ox
    let ay = py + oy
    if (item.k === 'tube') {
      const b = this.boxOf(item.id)!
      ax = b.cx
      ay = b.bottom
    } else if (item.k === 'bottle') {
      const s = this.shelf.find((x) => x.reagentId === item.reagentId)!
      ax = s.x
      ay = SHELF_Y
    } else if (item.k === 'wash') {
      ax = WASH_BOTTLE.x
      ay = WASH_BOTTLE.y
    }
    this.held = { item, x: ax, y: ay, dragging: true, ox: ax - px, oy: ay - py }
    this.hover = null
    this.dwell = null
  }

  private pickable(id: string) {
    return !CONTROLS.has(id) && !id.startsWith('jar:')
  }

  /** Take an item from where it is. */
  private pickUp(id: string): Item | null {
    const [kind, arg] = id.split(/:(.*)/s)
    switch (kind) {
      case 'tube': {
        if (this.funnel.on === arg) this.funnel.on = null
        if (this.parked && this.parked.target !== 'funnel' && this.parked.target.vesselId === arg) this.unpark()
        if (this.places.get(arg)?.at === 'burner') this.stopHeating()
        return { k: 'tube', id: arg }
      }
      case 'stopper':
        this.lab.setStopper(arg, false)
        sound.clink()
        return { k: 'stopper' }
      case 'bottle':
        return { k: 'bottle', reagentId: arg }
      case 'dropper':
        if (this.parked?.reagentId === arg) this.unpark()
        else if (this.parked) this.unpark()
        return { k: 'dropper', reagentId: arg }
      case 'piece':
        return { k: 'piece', reagentId: arg }
      case 'wash':
        return { k: 'wash' }
      case 'matchbox':
        sound.strike()
        return { k: 'match', until: this.now + 14000 }
      case 'box':
        return { k: 'newtube', kind: arg as TubeKind }
      case 'stoppers':
        return { k: 'stopper' }
      case 'spatula':
        return { k: 'spatula', load: null, from: null, colour: null }
      case 'booklet':
        return { k: 'strip', paper: arg as IndicatorPaper, damp: false, colour: null }
      case 'splints':
        return { k: 'splint', state: 'unlit', until: 0 }
      case 'pipettes':
        return { k: 'pipette', gas: null }
      case 'wire':
        return { k: 'wire', reading: null, colour: null }
      case 'funnel':
        this.funnel.on = null
        return { k: 'funnel' }
      default:
        return null
    }
  }

  /** A tap without a held item. */
  private tap(id: string, x: number, y: number) {
    const [kind, arg] = id.split(/:(.*)/s)
    if (kind === 'held' && this.held) return this.useHeld(this.held)
    if (kind === 'gastap') {
      this.burner.gas = !this.burner.gas
      if (!this.burner.gas) {
        this.burner.lit = false
        this.stopHeating()
      } else sound.hiss()
      return
    }
    if (kind === 'collar') {
      this.burner.air = !this.burner.air
      return
    }
    if (kind === 'clock') {
      this.fast = !this.fast
      return
    }
    if (kind === 'box') {
      // quick way: a clean tube goes straight into the rack
      const slot = this.freeSlot()
      if (slot === null) return this.say('The rack is full – empty, rinse and re-use a tube.')
      const v = this.lab.newVessel(arg as VesselKind)
      this.places.set(v.id, { at: 'rack', slot })
      sound.clink()
      return
    }
    if (kind === 'jar') return
    const it = this.pickUp(id)
    if (!it) return
    // lift it where it is
    const [ox, oy] = TOOL_OFFSET[it.k] ?? [0, 0]
    let hx = x + ox
    let hy = y + oy - 30
    if (it.k === 'tube') {
      const b = this.boxOf(it.id)!
      hx = b.cx
      hy = b.bottom - 40
    } else if (it.k === 'bottle') {
      hx = this.shelf.find((s) => s.reagentId === it.reagentId)!.x
      hy = SHELF_Y + 40
    } else if (it.k === 'wash') {
      hx = WASH_BOTTLE.x
      hy = WASH_BOTTLE.y - 40
    }
    this.held = { item: it, x: hx, y: hy, dragging: false, ox: 0, oy: 0 }
  }

  /** Tapping the item in the hand. */
  private useHeld(h: Held) {
    if (h.item.k === 'splint' && h.item.state === 'burning') {
      h.item.state = 'glowing'
      h.item.until = this.now + 25000
    }
  }

  /** Zone meant by tapping something while an item is lifted. */
  private tapZone(h: Held, id: string | null, x: number, y: number): Zone | null {
    const [kind, arg] = (id ?? '').split(/:(.*)/s)
    const it = h.item
    if (kind === 'tube') {
      const b = this.boxOf(arg)
      if (!b) return null
      if (it.k === 'tube' && it.id === arg) return null
      if (this.lab.vessel(arg).stoppered) return null
      const a = this.appearanceOf(arg)
      const surf = surfaceY(b, this.vesselKind(arg), a.liquidLevel)
      const liquidTap = a.liquidLevel > 0.004 && y >= surf - 4
      let part: 'mouth' | 'inside' | 'liquid' = 'mouth'
      if (it.k === 'wire' || it.k === 'spatula') part = 'inside'
      if ((it.k === 'strip' || it.k === 'pipette') && liquidTap) part = 'liquid'
      if (this.funnel.on === arg && ['bottle', 'wash', 'tube', 'dropper'].includes(it.k)) return { t: 'funnel' }
      const z: Zone = { t: 'tube', id: arg, part }
      return this.accepts(it, z) ? z : null
    }
    if (kind === 'funnel' && this.funnel.on && ['bottle', 'wash', 'tube', 'dropper'].includes(it.k)) return { t: 'funnel' }
    if (kind === 'jar' && it.k === 'spatula') return { t: 'jar', reagentId: arg }
    if (kind === 'wash' && it.k === 'strip') return { t: 'nozzle' }
    if (kind === 'box' && it.k === 'tube' && !this.sampleIds.has(it.id)) return { t: 'box', kind: arg as TubeKind }
    // geometric zones (burner, waste, sink, slots, tile, stand, flame)
    const probe: Held = { ...h, x, y }
    if (it.k === 'tube') {
      const z = this.placementZone(x, y + 80, it.id)
      return z && this.accepts(it, z) ? z : null
    }
    if (it.k === 'match' || it.k === 'splint' || it.k === 'wire') {
      if (Math.abs(x - BURNER_X) < 50 && y > this.flameTop() - 40 && y < BURNER_TOP + 20) return it.k === 'match' || this.burner.lit ? { t: 'flame' } : null
    }
    const z = this.zoneFor(probe)
    return z && this.accepts(it, z) ? z : null
  }

  /** Position the lifted item at the zone it was brought to (tap mode). */
  private moveHeldTo(h: Held, z: Zone, x: number, y: number) {
    if (z.t === 'tube') {
      const b = this.boxOf(z.id)!
      const surf = surfaceY(b, this.vesselKind(z.id), this.appearanceOf(z.id).liquidLevel)
      if (h.item.k === 'tube' || h.item.k === 'bottle' || h.item.k === 'wash') return
      h.x = b.cx
      h.y = z.part === 'mouth' ? b.rim - 8 : z.part === 'liquid' ? Math.min(b.bottom - 6, surf + 14) : b.bottom - 12
      return
    }
    if (z.t === 'flame') {
      h.x = BURNER_X
      h.y = h.item.k === 'match' ? BURNER_TOP - 10 : this.flameTop() + 40
      return
    }
    if (z.t === 'nozzle') {
      const n = washNozzle()
      h.x = n.x + 6
      h.y = n.y + 8
      return
    }
    h.x = x
    h.y = y
  }

  /** Does this kind of item do anything at this zone? */
  private accepts(it: Item, z: Zone): boolean {
    switch (it.k) {
      case 'tube':
        return z.t === 'tube' || z.t === 'funnel' || z.t === 'slot' || z.t === 'burner' || z.t === 'waste' || z.t === 'sink' || z.t === 'box'
      case 'bottle':
      case 'wash':
      case 'dropper':
        return z.t === 'tube' || z.t === 'funnel'
      case 'stopper':
      case 'piece':
        return z.t === 'tube'
      case 'spatula':
        return z.t === 'tube' || z.t === 'jar'
      case 'match':
        return z.t === 'flame'
      case 'splint':
        return z.t === 'flame' || (z.t === 'tube' && z.part !== 'liquid')
      case 'wire':
        return z.t === 'flame' || z.t === 'tube'
      case 'strip':
        return z.t === 'nozzle' || z.t === 'tile' || z.t === 'waste' || z.t === 'tube'
      case 'pipette':
        return z.t === 'tube'
      case 'funnel':
        return z.t === 'stand' || z.t === 'waste' || z.t === 'tube'
      case 'newtube':
        return z.t === 'slot'
    }
  }

  /** Continuous / dwell actions happen while the item stays there; others happen on release. */
  private isContinuous(it: Item, z: Zone): boolean {
    if (it.k === 'bottle' || it.k === 'wash') return z.t === 'tube' || z.t === 'funnel'
    if (it.k === 'tube') return z.t === 'tube' || z.t === 'funnel'
    if (it.k === 'strip') return z.t === 'nozzle' || z.t === 'tube'
    if (it.k === 'splint' || it.k === 'wire' || it.k === 'pipette' || it.k === 'match') return z.t === 'tube' || z.t === 'flame'
    return false
  }

  /** After a drag ends somewhere that is not a drop target. */
  private afterGesture(h: Held, z: Zone | null) {
    const it = h.item
    // containers go back to where they belong; tools stay in the hand (lifted) until put away
    if (it.k === 'tube' || it.k === 'bottle' || it.k === 'wash' || it.k === 'newtube' || it.k === 'stopper' || it.k === 'piece') {
      this.putBack()
      return
    }
    if (it.k === 'funnel' && !z) {
      this.putBack()
      return
    }
    h.dragging = false
  }

  /** Put the held item back where it came from. */
  putBack() {
    const h = this.held
    if (!h) return
    const it = h.item
    if (it.k === 'strip' && (it.colour || it.damp)) this.addToTile(it)
    if (it.k === 'funnel' && !this.funnel.on) this.funnel.on = null
    this.held = null
    this.hover = null
    this.pressing = null
    this.dwell = null
    this.stopPour()
  }

  private addToTile(it: { paper: IndicatorPaper; colour: RGB | null; damp: boolean }) {
    this.tile.push({ paper: it.paper, colour: it.colour, damp: it.damp })
    if (this.tile.length > 4) this.tile.shift()
  }

  // ================================================================== discrete actions (on release / tap)
  private drop(h: Held, z: Zone) {
    const it = h.item
    if (!this.accepts(it, z)) return this.afterGesture(h, z)
    switch (it.k) {
      case 'tube': {
        const id = it.id
        if (z.t === 'slot') {
          this.places.set(id, { at: 'rack', slot: z.i })
          sound.clink()
        } else if (z.t === 'burner') {
          const other = this.onBurner()
          if (other && other !== id) {
            this.say('There is already a tube in the flame.')
            break
          }
          this.places.set(id, { at: 'burner', zone: z.zone })
          sound.clink()
        } else if (z.t === 'waste') {
          this.lab.empty(id)
          sound.startPour()
          setTimeout(() => sound.stopPour(), 400)
        } else if (z.t === 'sink') {
          this.lab.rinse(id)
          sound.startPour()
          setTimeout(() => sound.stopPour(), 700)
        } else if (z.t === 'box') {
          this.lab.discard(id)
          this.places.delete(id)
          sound.clink()
        }
        this.held = null
        return
      }
      case 'newtube': {
        if (z.t !== 'slot') return this.putBack()
        const v = this.lab.newVessel(it.kind)
        this.places.set(v.id, { at: 'rack', slot: z.i })
        sound.clink()
        this.held = null
        return
      }
      case 'stopper':
        if (z.t === 'tube') {
          this.lab.setStopper(z.id, true)
          sound.clink()
        }
        this.held = null
        return
      case 'piece':
        if (z.t === 'tube') {
          const a = this.lab.begin(z.id, `Add ${REAGENTS[it.reagentId].label.replace(/ \(.*\)/, '')} to ${this.lab.vessel(z.id).label}`)
          this.lab.deposit(a, this.lab.scoop({ reagentId: it.reagentId }, 0))
          this.lab.release(a, undefined, 8)
          sound.clink()
        }
        this.held = null
        return
      case 'dropper':
        this.park(it.reagentId, z.t === 'funnel' ? 'funnel' : { vesselId: (z as { id: string }).id })
        this.held = null
        return
      case 'spatula':
        return this.spatulaAt(h, it, z)
      case 'strip':
        if (z.t === 'tile') {
          this.addToTile(it)
          this.held = null
        } else if (z.t === 'waste') this.held = null
        return
      case 'funnel':
        if (z.t === 'stand') {
          this.funnel.on = null
          this.held = null
        } else if (z.t === 'waste') {
          if (this.funnel.paperId) this.lab.discard(this.funnel.paperId)
          this.funnel = { on: null, paperId: null }
          this.held = null
        } else if (z.t === 'tube') {
          if (!this.funnel.paperId) this.funnel.paperId = this.lab.newVessel('filter-paper', 'filter paper').id
          this.funnel.on = z.id
          this.held = null
          sound.clink()
        }
        return
      default:
        h.dragging = false
    }
  }

  private spatulaAt(h: Held, it: Extract<Item, { k: 'spatula' }>, z: Zone) {
    h.dragging = false
    if (z.t === 'jar') {
      it.load = this.mergeLoad(it.load, this.lab.scoop({ reagentId: z.reagentId }, 0.15))
      it.from = `jar:${z.reagentId}`
      it.colour = [200, 200, 196]
      return
    }
    if (z.t !== 'tube') return
    const v = this.lab.vessel(z.id)
    const hasSolid = !v.wet && !v.isEmpty()
    if (hasSolid && (!it.load || it.from === z.id)) {
      // scoop (again)
      const n = this.lab.scoop({ vesselId: z.id }, 0.1)
      if (n.size) {
        it.load = this.mergeLoad(it.load, n)
        it.from = z.id
        const a = this.appearanceOf(z.id)
        it.colour = a.solidRGB as RGB
      }
      return
    }
    if (it.load) {
      const a = this.lab.begin(z.id, `Add a spatula measure of solid to ${v.label}`)
      this.lab.deposit(a, it.load)
      this.lab.release(a, undefined, 5)
      it.load = null
      it.from = null
      it.colour = null
    }
  }

  private mergeLoad(a: Map<string, number> | null, b: Map<string, number>) {
    const out = new Map(a ?? [])
    for (const [k, v] of b) out.set(k, (out.get(k) ?? 0) + v)
    return out
  }

  // ================================================================== dropper
  private park(reagentId: string, target: { vesselId: string } | 'funnel') {
    if (this.parked) this.unpark()
    const dest = target === 'funnel' ? this.funnel.on : target.vesselId
    if (!dest) return
    const label = REAGENTS[reagentId].label
    const action = this.lab.begin(dest, `Add drops of ${label}`)
    this.parked = { reagentId, target, action, drops: 0, squeezeUntil: 0 }
    sound.clink()
  }

  unpark() {
    const p = this.parked
    if (!p) return
    this.parked = null
    if (p.drops === 0) return this.lab.cancel(p.action)
    const dest = this.lab.vessels.get(p.action.vesselId)
    const into = p.target === 'funnel' ? `through the filter paper into ${dest?.label}` : `to ${dest?.label}`
    this.lab.release(p.action, `Add ${p.drops === 1 ? '1 drop' : `${p.drops} drops`} of ${REAGENTS[p.reagentId].label} ${into}`, 3)
  }

  private squeeze() {
    const p = this.parked
    if (!p) return
    if (!this.lab.isOpen(p.action)) {
      const dest = p.action.vesselId
      if (!this.lab.vessels.has(dest)) return this.unpark()
      p.action = this.lab.begin(dest, p.action.label)
      p.drops = 0
    }
    if (p.target === 'funnel') {
      if (!this.funnel.paperId || !this.funnel.on) return
      this.lab.filterStep(p.action, { reagentId: p.reagentId }, this.funnel.paperId, 0.05)
    } else this.lab.dropStep(p.action, p.reagentId)
    p.drops++
    p.squeezeUntil = this.now + 180
    sound.drop()
  }

  // ================================================================== pouring
  private pourKey(it: Item, z: Zone) {
    return `${it.k}:${'id' in it ? it.id : 'reagentId' in it ? it.reagentId : ''}>${z.t === 'tube' ? z.id : 'funnel'}`
  }

  private pourSource(it: Item): Source | null {
    if (it.k === 'bottle') return { reagentId: it.reagentId }
    if (it.k === 'wash') return { reagentId: 'water' }
    if (it.k === 'tube') return { vesselId: it.id }
    return null
  }

  private pourStep(h: Held, z: Zone, dt: number) {
    const src = this.pourSource(h.item)
    if (!src) return
    const into = z.t === 'funnel'
    const dest = into ? this.funnel.on : (z as { id: string }).id
    if (!dest || (into && !this.funnel.paperId)) return
    if ('vesselId' in src && (this.lab.vessel(src.vesselId).isEmpty() || this.lab.vessel(src.vesselId).stoppered)) return
    const key = this.pourKey(h.item, z)
    if (!this.pour || this.pour.key !== key) {
      this.stopPour()
      this.pour = { action: this.lab.begin(dest, 'Pour'), key, src, volume: 0, grams: 0, intoFunnel: into }
      sound.startPour()
    }
    const rate = h.item.k === 'tube' ? 1.3 : 1.0
    const moved = into ? this.lab.filterStep(this.pour.action, src, this.funnel.paperId!, rate * dt) : this.lab.pourStep(this.pour.action, src, rate * dt)
    const dry = 'vesselId' in src && !this.lab.vessel(src.vesselId).wet && this.pour.volume === 0
    if (dry && !into) this.pour.grams += moved
    else this.pour.volume += moved
  }

  private stopPour() {
    const p = this.pour
    if (!p) return
    this.pour = null
    sound.stopPour()
    if (p.volume < 0.01 && p.grams < 0.005) return this.lab.cancel(p.action)
    const dest = this.lab.vessels.get(p.action.vesselId)
    if (!dest) return
    const src = p.src!
    const what = 'reagentId' in src ? REAGENTS[src.reagentId].label : `the contents of ${this.lab.vessels.get(src.vesselId)?.label ?? 'the tube'}`
    const depth = p.volume / dest.spec.area
    const amount = `about ${round1(p.volume)} cm³ (≈ ${round1(depth)} cm depth)`
    const label = p.grams > 0 ? `Tip about ${round2(p.grams)} g of solid from ${what.replace('the contents of ', '')} into ${dest.label}` : p.intoFunnel ? `Pour ${amount} of ${what} through the filter paper into ${dest.label}` : `Pour ${amount} of ${what} into ${dest.label}`
    this.lab.release(p.action, label, 4)
  }

  // ================================================================== heating
  private heatMode(id: string): HeatMode | null {
    const p = this.places.get(id)
    if (!p || p.at !== 'burner' || !this.burner.lit) return null
    const wet = this.lab.vessel(id).wet
    const hot = this.burner.air && p.zone === 'low'
    return wet ? (hot ? 'boil' : 'warm') : hot ? 'strong' : 'gentle'
  }

  private updateHeating() {
    const id = this.onBurner()
    const mode = id ? this.heatMode(id) : null
    if (!id || !mode) {
      this.stopHeating()
      return
    }
    const rank = mode === 'boil' || mode === 'strong' ? 2 : 1
    if (!this.heat || this.heat.vesselId !== id) {
      this.stopHeating()
      const v = this.lab.vessel(id)
      if (v.stoppered) {
        this.lab.setStopper(id, false)
        const b = this.boxOf(id)!
        this.effects.push({ kind: 'pop', x: b.cx, y: b.rim - 30, until: this.now + 600 })
        sound.pop()
      }
      this.heat = { action: this.lab.begin(id, 'Heat', { heating: true }), vesselId: id, mode, rank, start: this.lab.time }
    }
    if (mode !== this.heat.mode) this.heat.mode = mode
    if (rank > this.heat.rank) this.heat.rank = rank
    this.lab.setHeating(id, mode)
  }

  private stopHeating() {
    const h = this.heat
    if (!h) return
    this.heat = null
    if (this.lab.vessels.has(h.vesselId)) {
      this.lab.setHeating(h.vesselId, null)
      const v = this.lab.vessel(h.vesselId)
      const secs = Math.max(1, Math.round(this.lab.time - h.start))
      const wet = v.wet || h.action.before.wet
      const what = wet ? (h.rank === 2 ? 'Heat the tube to boiling' : 'Warm the tube gently') : h.rank === 2 ? 'Heat the solid strongly' : 'Heat the solid gently'
      this.lab.release(h.action, `${what} for ${secs} s`, 2)
    }
  }

  // ================================================================== dwell actions (tools held somewhere)
  private dwellFor(key: string, ms: number): boolean {
    if (!this.dwell || this.dwell.key !== key) this.dwell = { key, since: this.now, fired: false }
    if (this.dwell.fired || this.now - this.dwell.since < ms) return false
    this.dwell.fired = true
    return true
  }

  private dwellRunning(key: string, ms: number) {
    if (!this.dwell || this.dwell.key !== key) this.dwell = { key, since: this.now, fired: false }
    return this.now - this.dwell.since >= ms
  }

  private act(h: Held, z: Zone, dt: number) {
    const it = h.item
    const key = `${it.k}|${zoneKey(z)}`
    switch (it.k) {
      case 'bottle':
      case 'wash':
      case 'tube':
        if (this.dwellRunning(key, 250)) this.pourStep(h, z, dt)
        return
      case 'match':
        if (z.t === 'flame' && this.burner.gas && !this.burner.lit && this.dwellFor(key, 200)) {
          this.burner.lit = true
          sound.ignite()
        }
        return
      case 'splint':
        if (z.t === 'flame') {
          if (it.state !== 'burning' && this.dwellFor(key, 400)) {
            it.state = 'burning'
            it.until = this.now + 40000
          }
        } else if (z.t === 'tube' && (it.state === 'burning' || it.state === 'glowing') && this.dwellFor(key, 450)) {
          const test = it.state === 'burning' ? 'lighted-splint' : 'glowing-splint'
          const text = this.lab.mouthTest(z.id, test).observations[0].text
          if (/pop/.test(text) && !/No pop/.test(text)) {
            this.effects.push({ kind: 'pop', x: h.x, y: h.y - 10, until: this.now + 600 })
            sound.pop()
          } else if (/relights/.test(text)) {
            it.state = 'burning'
            it.until = this.now + 40000
          } else if (/extinguished|goes out/.test(text)) it.state = 'dead'
        }
        return
      case 'strip':
        if (z.t === 'nozzle' && this.dwellFor(key, 300)) it.damp = true
        else if (z.t === 'tube' && z.part !== 'liquid' && this.dwellFor(key, 700)) {
          const test = it.paper === 'red-litmus' ? 'damp-red-litmus' : it.paper === 'blue-litmus' ? 'damp-blue-litmus' : 'damp-universal-indicator'
          const text = this.lab.mouthTest(z.id, test, { damp: it.damp }).observations[0].text
          it.colour = stripColour(it.paper, text) ?? it.colour
        } else if (z.t === 'tube' && z.part === 'liquid' && this.dwellFor(key, 300)) {
          const text = this.lab.indicatorDip(z.id, it.paper).observations[0].text
          it.colour = stripColour(it.paper, text) ?? it.colour
          it.damp = true
        }
        return
      case 'pipette':
        if (z.t === 'tube' && z.part !== 'liquid' && this.dwellFor(key, 500)) {
          it.gas = this.lab.collectGas(z.id)
          this.effects.push({ kind: 'flash', x: h.x, y: h.y - 90, until: this.now + 300 })
        } else if (z.t === 'tube' && z.part === 'liquid' && it.gas && this.dwellFor(key, 350)) {
          this.lab.bubbleGas(it.gas, z.id)
          it.gas = null
          this.effects.push({ kind: 'flash', x: h.x, y: h.y - 90, until: this.now + 300 })
        }
        return
      case 'wire':
        if (z.t === 'tube' && (z.part === 'liquid' || (z.part === 'inside' && !this.lab.vessel(z.id).wet)) && this.dwellFor(key, 300)) {
          if (!this.lab.vessel(z.id).isEmpty()) {
            it.reading = this.lab.flameReading(z.id)
            const a = this.appearanceOf(z.id)
            it.colour = (a.liquidLevel > 0.004 ? a.liquidRGB : a.solidRGB) as RGB
            ;(it as { from?: string }).from = this.lab.vessel(z.id).label
          }
        } else if (z.t === 'flame' && this.burner.lit) {
          if (it.reading && this.dwellFor(key, 300)) {
            const hit = FLAME_RGB.find(([re]) => re.test(it.reading!))
            if (hit) this.flameTint = { colour: hit[1], until: this.now + 3000 }
            this.lab.note(undefined, `Flame test on the contents of ${(it as { from?: string }).from ?? 'the tube'}`, it.reading, 'flame')
          }
          if (this.dwellRunning(key, 3500)) {
            it.reading = null
            it.colour = null
          }
        }
        return
    }
  }

  // ================================================================== time
  /** Advance the bench by `dtReal` seconds of real time. */
  step(dtReal: number, nowMs: number) {
    this.now = nowMs
    const speed = this.fast ? 10 : 1
    this.lab.tick(dtReal * speed)
    // press-and-hold on a target with a lifted item
    const pend = this.pending
    if (pend?.z && this.held && !this.pressing && this.now - pend.at > 160 && this.isContinuous(this.held.item, pend.z)) {
      this.moveHeldTo(this.held, pend.z, pend.x, pend.y)
      this.startPressing(pend.z)
    }
    if (this.pressing && this.pressUntil && this.now > this.pressUntil) this.endPressing()
    // the item in the hand acting where it is
    const h = this.held
    const z = this.activeZone()
    if (h && z && this.accepts(h.item, z) && this.isContinuous(h.item, z)) {
      const pours = h.item.k === 'bottle' || h.item.k === 'wash' || h.item.k === 'tube'
      // pouring needs a hand on the bottle; a tool left lifted somewhere keeps acting there
      if (!pours || this.pressing || h.dragging) this.act(h, z, dtReal)
    }
    // squeezing a parked dropper
    if (this.squeezing && this.now >= this.squeezing.next) {
      this.squeeze()
      this.squeezing.count++
      this.squeezing.interval = Math.max(140, this.squeezing.interval * 0.85)
      this.squeezing.next = this.now + this.squeezing.interval
    }
    if (this.parked && !this.lab.vessels.has(this.parked.action.vesselId)) this.parked = null
    this.updateHeating()
    // matches and splints burn out
    if (h?.item.k === 'match' && this.now > h.item.until) this.held = null
    if (h?.item.k === 'splint' && (h.item.state === 'burning' || h.item.state === 'glowing') && this.now > h.item.until) h.item.state = 'dead'
    if (this.flameTint && this.now > this.flameTint.until) this.flameTint = null
    this.effects = this.effects.filter((e) => e.until > this.now)
    if (this.notice && this.now > this.notice.until) this.notice = null
    this.bump()
  }

  private trackWiggle(x: number) {
    const w = this.wiggle
    if (!w) {
      this.wiggle = { x, t: this.now, dir: 0, flips: [] }
      return
    }
    const dx = x - w.x
    if (Math.abs(dx) < 14) return
    const dir = Math.sign(dx)
    if (w.dir && dir !== w.dir) w.flips.push(this.now)
    w.dir = dir
    w.x = x
    w.flips = w.flips.filter((t) => this.now - t < 900)
    if (w.flips.length >= 3 && this.now - this.lastShake > 1200) {
      this.lastShake = this.now
      w.flips = []
      const it = this.held?.item
      if (it?.k === 'tube') this.lab.agitate(it.id)
      else if (it?.k === 'splint' && it.state === 'burning') {
        it.state = 'glowing'
        it.until = this.now + 25000
      }
    }
  }

  /** Where the item in the hand is acting (dragged over, pressed on, or left lifted at). */
  activeZone(): Zone | null {
    const h = this.held
    if (!h) return null
    if (this.pressing) return this.pressing
    if (h.dragging) return this.hover
    const tool = h.item.k === 'strip' || h.item.k === 'splint' || h.item.k === 'pipette' || h.item.k === 'wire' || h.item.k === 'match'
    return tool ? this.zoneFor(h) : null
  }

  /** The tube or funnel a pour is going into, and the pouring item. */
  pouring(): { dest: string; intoFunnel: boolean } | null {
    if (!this.pour) return null
    return { dest: this.pour.action.vesselId, intoFunnel: this.pour.intoFunnel }
  }

  isShaking() {
    return this.now - this.lastShake < 600
  }

  squeezed() {
    return !!this.parked && this.now < this.parked.squeezeUntil
  }

  private say(text: string) {
    this.notice = { text, until: this.now + 2600 }
  }

  /** Write up everything still open (before marking). */
  finishAll() {
    this.stopPour()
    this.unpark()
    this.stopHeating()
    this.lab.flush()
  }

  bump() {
    this.version++
  }
}

const round1 = (x: number) => (x >= 10 ? Math.round(x) : Math.round(x * 10) / 10)
const round2 = (x: number) => Math.round(x * 100) / 100
