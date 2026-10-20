// Where everything sits on the bench (scene units; the SVG is scaled to fit the screen).

import type { VesselKind } from '../../engine'
import { GEOM } from '../Tube'

export const SCENE_W = 1360
export const SCENE_H = 900

/** top of the shelf board – bottles stand on it */
export const SHELF_Y = 236
/** the bench surface – items in the back row stand on it */
export const BENCH_Y = 700
/** front tray baseline */
export const TRAY_Y = 872

// ------------------------------------------------------------------ test-tube rack
export const RACK_SLOTS = 10
export const RACK_X0 = 58
export const RACK_PITCH = 68
export const RACK_BOTTOM = 690
export const TUBE_SCALE = 0.9
export const slotX = (i: number) => RACK_X0 + i * RACK_PITCH
export const RACK_LEFT = RACK_X0 - 42
export const RACK_RIGHT = slotX(RACK_SLOTS - 1) + 42

// ------------------------------------------------------------------ Bunsen burner
export const BURNER_X = 850
export const BURNER_TOP = 604
export const FLAME_TIP_BLUE = 470
export const FLAME_TIP_YELLOW = 420
/** where the bottom of a tube sits for each heating position */
export const HOLDER_BOTTOM = { high: 474, low: 548 } as const
export type HeatZone = keyof typeof HOLDER_BOTTOM
export const GAS_TAP = { x: 772, y: 706 }
export const AIR_COLLAR = { x: BURNER_X, y: 676 }
export const MATCHBOX = { x: 936, y: 738 }

// ------------------------------------------------------------------ right-hand side
export const FUNNEL_STAND = { x: 1036, y: 560 }
export const WASH_BOTTLE = { x: 1132, y: BENCH_Y }
export const WASTE = { x: 1252, y: BENCH_Y }
export const SINK = { x: 1180, y: 884 }
export const CLOCK = { x: 1280, y: 110, r: 56 }

// ------------------------------------------------------------------ front tray
export const TRAY = {
  box: { 'test-tube': { x: 64 }, 'boiling-tube': { x: 164 }, 'hard-glass-tube': { x: 264 } } as Record<Exclude<VesselKind, 'filter-paper'>, { x: number }>,
  stoppers: { x: 356 },
  spatula: { x: 432 },
  'red-litmus': { x: 506 },
  'blue-litmus': { x: 568 },
  'universal-indicator': { x: 634 },
  splints: { x: 712 },
  pipettes: { x: 786 },
  wire: { x: 850 },
  tile: { x: 940, w: 116 },
}

// ------------------------------------------------------------------ shelf
/** x of the i-th of n items on the shelf (closer together when there are many) */
export const bottleX = (i: number, n = 1) => 54 + i * Math.min(94, 1100 / Math.max(1, n - 1))

// ------------------------------------------------------------------ tube geometry
export interface TubeBox {
  /** top-left of the tube's own SVG, its scale and size */
  x: number
  y: number
  s: number
  w: number
  h: number
  /** centre line, rim and inside bottom */
  cx: number
  rim: number
  bottom: number
  /** inside width */
  inner: number
  /** scene units per cm of depth */
  pxPerCm: number
}

const SPEC = { 'test-tube': { area: 1.3, cap: 14 }, 'hard-glass-tube': { area: 1.3, cap: 14 }, 'boiling-tube': { area: 3.6, cap: 48 }, 'filter-paper': { area: 1, cap: 1 } }

/** Geometry of a tube whose inside bottom is at (cx, bottom). */
export function tubeBox(kind: VesselKind, cx: number, bottom: number, s = TUBE_SCALE): TubeBox {
  const g = GEOM[kind]
  const W = g.w + 28
  const H = g.h + 90
  const y = bottom - (30 + g.h) * s
  const usable = g.h - 14
  const depthCm = SPEC[kind].cap / SPEC[kind].area
  return {
    x: cx - (W * s) / 2,
    y,
    s,
    w: W * s,
    h: H * s,
    cx,
    rim: y + 30 * s,
    bottom,
    inner: g.w * s,
    pxPerCm: (usable * s) / depthCm,
  }
}

/** Liquid surface (scene y) for a liquid level 0..1 of the usable height. */
export function surfaceY(b: TubeBox, kind: VesselKind, level: number) {
  const g = GEOM[kind]
  return b.bottom - level * (g.h - 14) * b.s
}
