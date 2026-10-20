// Drawings of the apparatus on the bench (scene units). Pure presentation – no state.

import type { IndicatorPaper } from '../../engine'
import {
  AIR_COLLAR,
  BENCH_Y,
  BURNER_TOP,
  BURNER_X,
  CLOCK,
  FLAME_TIP_BLUE,
  FLAME_TIP_YELLOW,
  FUNNEL_STAND,
  GAS_TAP,
  MATCHBOX,
  RACK_BOTTOM,
  RACK_LEFT,
  RACK_RIGHT,
  RACK_SLOTS,
  slotX,
  SCENE_H,
  SCENE_W,
  SHELF_Y,
  SINK,
  TRAY,
  TRAY_Y,
  WASH_BOTTLE,
  WASTE,
  type TubeBox,
} from './layout'

export type RGB = [number, number, number]
export const rgb = ([r, g, b]: RGB, a = 1) => `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`

export const PAPER_COLOUR: Record<IndicatorPaper, RGB> = {
  'red-litmus': [214, 86, 80],
  'blue-litmus': [80, 112, 196],
  'universal-indicator': [228, 206, 120],
}

// ------------------------------------------------------------------ room
export function Room() {
  return (
    <g>
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9e5dc" />
          <stop offset="1" stopColor="#d8d3c8" />
        </linearGradient>
        <linearGradient id="benchtop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f454b" />
          <stop offset="1" stopColor="#2b3035" />
        </linearGradient>
        <linearGradient id="shelfwood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a47a50" />
          <stop offset="1" stopColor="#7d5a37" />
        </linearGradient>
        <linearGradient id="glassbody" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.2" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="0.8" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id="blueflame" cx="0.5" cy="0.85" r="0.75">
          <stop offset="0" stopColor="#d8ecff" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#6f9cff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#4466ff" stopOpacity="0.15" />
        </radialGradient>
        <radialGradient id="yellowflame" cx="0.5" cy="0.8" r="0.8">
          <stop offset="0" stopColor="#fff6c0" />
          <stop offset="0.5" stopColor="#ffbe3a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ff7a1a" stopOpacity="0.2" />
        </radialGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <filter id="lift" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000" floodOpacity="0.35" />
        </filter>
        <pattern id="tiles" width="80" height="80" patternUnits="userSpaceOnUse">
          <rect width="80" height="80" fill="none" stroke="#cfc9bd" strokeWidth="1.2" />
        </pattern>
      </defs>
      <rect x="0" y="0" width={SCENE_W} height={SCENE_H} fill="url(#wall)" />
      <rect x="0" y="0" width={SCENE_W} height={BENCH_Y - 250} fill="url(#tiles)" opacity="0.55" />
      {/* shelf */}
      <rect x="10" y={SHELF_Y} width="1170" height="16" rx="3" fill="url(#shelfwood)" />
      <rect x="10" y={SHELF_Y + 16} width="1170" height="6" fill="rgba(0,0,0,0.18)" />
      {/* bench */}
      <rect x="0" y={BENCH_Y - 70} width={SCENE_W} height={SCENE_H - BENCH_Y + 70} fill="url(#benchtop)" />
      <rect x="0" y={BENCH_Y - 72} width={SCENE_W} height="4" fill="#5a6168" />
      {/* tray */}
      <rect x="14" y={TRAY_Y - 108} width="1000" height="118" rx="10" fill="#e7e2d6" stroke="#bfb7a6" strokeWidth="2" />
      <rect x="14" y={TRAY_Y + 2} width="1000" height="10" rx="4" fill="rgba(0,0,0,0.25)" />
    </g>
  )
}

// ------------------------------------------------------------------ reagent bottles
export function DropperBottle({ x, label, tint, dropperOut, lifted }: { x: number; label: string; tint: string; dropperOut?: boolean; lifted?: boolean }) {
  const base = SHELF_Y
  return (
    <g transform={`translate(${x},${base})`} filter={lifted ? 'url(#lift)' : undefined}>
      <BottleBody label={label} tint={tint} />
      {!dropperOut && <DropperCap />}
    </g>
  )
}

/** Bottle drawn with its base centre at (0, 0). */
export function BottleBody({ label, tint }: { label: string; tint: string }) {
  return (
    <g>
      <path d="M -32 0 L -32 -96 Q -32 -112 -18 -116 L -12 -124 L 12 -124 L 18 -116 Q 32 -112 32 -96 L 32 0 Z" fill="#6b3f17" opacity="0.92" />
      <path d="M -26 -6 L -26 -64 L 26 -64 L 26 -6 Z" fill={tint} opacity="0.55" />
      <path d="M -32 0 L -32 -96 Q -32 -112 -18 -116 L -12 -124 L 12 -124 L 18 -116 Q 32 -112 32 -96 L 32 0 Z" fill="url(#glassbody)" stroke="rgba(30,20,10,0.5)" strokeWidth="1.5" />
      <rect x="-12" y="-134" width="24" height="12" rx="2" fill="#3b3b3b" />
      <rect x="-29" y="-94" width="58" height="46" rx="3" fill="#fbfaf3" stroke="#a69e8c" strokeWidth="1" />
      {splitLabel(label).map((line, i, all) => (
        <text key={i} x="0" y={all.length === 1 ? -66 : -75 + i * 16} textAnchor="middle" className="label-text">
          {line}
        </text>
      ))}
    </g>
  )
}

/** Break a bottle label into at most two short lines. */
function splitLabel(label: string): string[] {
  if (label.length <= 10) return [label]
  const cut = label.search(/[ /(]/)
  if (cut > 0 && cut < label.length - 1) return [label.slice(0, cut).trim(), label.slice(cut).replace(/^[ /]+/, '').trim()].map((s) => s.slice(0, 10))
  return [label.slice(0, 8), label.slice(8, 16)]
}

function DropperCap() {
  return (
    <g>
      <rect x="-5" y="-150" width="10" height="20" fill="rgba(220,235,242,0.7)" stroke="rgba(70,85,95,0.6)" />
      <path d="M -11 -150 Q -13 -178 0 -182 Q 13 -178 11 -150 Z" fill="#c23a2b" stroke="#7d2219" strokeWidth="1.2" />
    </g>
  )
}

/** A dropper (teat pipette from a reagent bottle) with its tip at (x, y). */
export function Dropper({ x, y, tint, squeeze }: { x: number; y: number; tint: string; squeeze?: boolean }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <path d="M -3 0 L -5 -66 L 5 -66 L 3 0 Z" fill="rgba(220,235,242,0.65)" stroke="rgba(70,85,95,0.7)" strokeWidth="1.2" />
      <path d="M -2.4 -2 L -3.6 -40 L 3.6 -40 L 2.4 -2 Z" fill={tint} opacity="0.7" />
      <rect x="-9" y="-72" width="18" height="8" rx="2" fill="#3b3b3b" />
      <path d={squeeze ? 'M -8 -72 Q -6 -96 0 -100 Q 6 -96 8 -72 Z' : 'M -11 -72 Q -14 -102 0 -108 Q 14 -102 11 -72 Z'} fill="#c23a2b" stroke="#7d2219" strokeWidth="1.2" />
    </g>
  )
}

export function Jar({ x, label, colour, lifted }: { x: number; label: string; colour: string; lifted?: boolean }) {
  return (
    <g transform={`translate(${x},${SHELF_Y})`} filter={lifted ? 'url(#lift)' : undefined}>
      <rect x="-34" y="-92" width="68" height="92" rx="8" fill="rgba(225,236,242,0.35)" stroke="rgba(70,85,95,0.55)" strokeWidth="1.5" />
      <rect x="-30" y="-40" width="60" height="38" rx="5" fill={colour} />
      <rect x="-30" y="-40" width="60" height="38" rx="5" fill="rgba(0,0,0,0.35)" filter="url(#crystal-grain)" />
      <rect x="-37" y="-106" width="74" height="16" rx="3" fill="#2f5b8a" />
      <rect x="-27" y="-84" width="54" height="30" rx="3" fill="#fbfaf3" stroke="#a69e8c" />
      <text x="0" y="-65" textAnchor="middle" className="label-text">
        {label}
      </text>
    </g>
  )
}

export function PieceDish({ x, kind, label }: { x: number; kind: 'foil' | 'ribbon'; label: string }) {
  return (
    <g transform={`translate(${x},${SHELF_Y})`}>
      <ellipse cx="0" cy="-8" rx="40" ry="10" fill="rgba(225,236,242,0.6)" stroke="rgba(70,85,95,0.6)" strokeWidth="1.5" />
      {kind === 'foil' ? (
        <path d="M -20 -12 l 9 -8 l 10 4 l 9 -7 l 8 9 l -12 6 Z" fill="#d7dade" stroke="#8a9096" />
      ) : (
        <rect x="-22" y="-16" width="44" height="5" rx="1.5" fill="#b9bdc2" stroke="#7d8287" transform="rotate(-8)" />
      )}
      <rect x="-30" y="-46" width="60" height="18" rx="3" fill="#fbfaf3" stroke="#a69e8c" />
      <text x="0" y="-33" textAnchor="middle" className="label-text">
        {label}
      </text>
    </g>
  )
}

/** Wash bottle (distilled water) with its base centre at (x, y); the nozzle tip is returned by washNozzle(). */
export function WashBottle({ x, y, tilt = 0, lifted }: { x: number; y: number; tilt?: number; lifted?: boolean }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${tilt})`} filter={lifted ? 'url(#lift)' : undefined}>
      <path d="M -34 0 L -34 -104 Q -34 -120 -16 -124 L 16 -124 Q 34 -120 34 -104 L 34 0 Z" fill="rgba(235,242,246,0.75)" stroke="#9aa6ad" strokeWidth="1.5" />
      <rect x="-34" y="-64" width="68" height="64" fill="rgba(170,205,230,0.35)" />
      <rect x="-14" y="-140" width="28" height="18" rx="3" fill="#f4f4f0" stroke="#9aa6ad" />
      <path d="M 2 -140 L 2 -168 Q 2 -176 12 -176 L 44 -176" fill="none" stroke="#e8ecee" strokeWidth="6" strokeLinecap="round" />
      <path d="M 2 -140 L 2 -168 Q 2 -176 12 -176 L 44 -176" fill="none" stroke="#9aa6ad" strokeWidth="1" />
      <rect x="-22" y="-100" width="44" height="22" rx="3" fill="#fbfaf3" stroke="#a69e8c" />
      <text x="0" y="-85" textAnchor="middle" className="label-text">
        dist. H₂O
      </text>
    </g>
  )
}
export const washNozzle = () => ({ x: WASH_BOTTLE.x + 44, y: WASH_BOTTLE.y - 176 })

// ------------------------------------------------------------------ rack
export function RackBack() {
  return (
    <g>
      <rect x={RACK_LEFT} y={RACK_BOTTOM - 4} width={RACK_RIGHT - RACK_LEFT} height="16" rx="3" fill="#c9a77a" stroke="#8a6a43" />
      <rect x={RACK_LEFT + 4} y={RACK_BOTTOM - 150} width="12" height="150" fill="#b8956a" />
      <rect x={RACK_RIGHT - 16} y={RACK_BOTTOM - 150} width="12" height="150" fill="#b8956a" />
    </g>
  )
}
export function RackFront() {
  return (
    <g>
      <rect x={RACK_LEFT} y={RACK_BOTTOM - 156} width={RACK_RIGHT - RACK_LEFT} height="14" rx="3" fill="rgba(201,167,122,0.92)" stroke="#8a6a43" />
      {Array.from({ length: RACK_SLOTS }, (_, i) => (
        <ellipse key={i} cx={slotX(i)} cy={RACK_BOTTOM - 149} rx="17" ry="3.5" fill="rgba(90,66,40,0.55)" />
      ))}
    </g>
  )
}

// ------------------------------------------------------------------ Bunsen burner
export function Burner({ gas, lit, air, flameTint }: { gas: boolean; lit: boolean; air: boolean; flameTint?: RGB | null }) {
  const x = BURNER_X
  return (
    <g>
      {/* hose */}
      <path d={`M ${GAS_TAP.x + 10} ${GAS_TAP.y} C ${GAS_TAP.x + 60} ${GAS_TAP.y + 30}, ${x - 80} ${BENCH_Y + 10}, ${x - 40} ${BENCH_Y - 8}`} fill="none" stroke="#a6461f" strokeWidth="9" strokeLinecap="round" />
      {/* base */}
      <ellipse cx={x} cy={BENCH_Y} rx="56" ry="10" fill="#26292c" />
      <path d={`M ${x - 52} ${BENCH_Y} L ${x - 44} ${BENCH_Y - 20} L ${x + 44} ${BENCH_Y - 20} L ${x + 52} ${BENCH_Y} Z`} fill="#3a3e43" />
      {/* barrel */}
      <rect x={x - 11} y={BURNER_TOP} width="22" height={BENCH_Y - 20 - BURNER_TOP} fill="#9aa0a6" />
      <rect x={x - 11} y={BURNER_TOP} width="6" height={BENCH_Y - 20 - BURNER_TOP} fill="#c5cace" />
      {/* air collar */}
      <rect x={x - 15} y={AIR_COLLAR.y - 12} width="30" height="24" rx="3" fill="#6d7378" stroke="#44494e" />
      <rect x={x - 7} y={AIR_COLLAR.y - 6} width="14" height="12" rx="2" fill={air ? '#15181b' : '#80868b'} />
      {lit && <Flame air={air} tint={flameTint} />}
      {gas && !lit && <path d={`M ${x - 6} ${BURNER_TOP - 6} q 4 -10 0 -18 M ${x + 5} ${BURNER_TOP - 8} q 4 -10 0 -18`} stroke="rgba(200,210,220,0.5)" strokeWidth="2" fill="none" className="shimmer" />}
    </g>
  )
}

function Flame({ air, tint }: { air: boolean; tint?: RGB | null }) {
  const x = BURNER_X
  const top = BURNER_TOP
  if (!air)
    return (
      <g className="flame-flicker">
        <path d={`M ${x} ${FLAME_TIP_YELLOW} C ${x - 30} ${top - 90} ${x - 18} ${top - 20} ${x} ${top} C ${x + 18} ${top - 20} ${x + 34} ${top - 100} ${x} ${FLAME_TIP_YELLOW} Z`} fill="url(#yellowflame)" />
        {tint && <path d={`M ${x} ${FLAME_TIP_YELLOW + 10} C ${x - 24} ${top - 90} ${x - 14} ${top - 20} ${x} ${top} C ${x + 14} ${top - 20} ${x + 26} ${top - 90} ${x} ${FLAME_TIP_YELLOW + 10} Z`} fill={rgb(tint, 0.75)} />}
      </g>
    )
  return (
    <g className="flame-flicker">
      <path d={`M ${x} ${FLAME_TIP_BLUE} C ${x - 26} ${top - 70} ${x - 16} ${top - 14} ${x} ${top} C ${x + 16} ${top - 14} ${x + 26} ${top - 70} ${x} ${FLAME_TIP_BLUE} Z`} fill="url(#blueflame)" />
      <path d={`M ${x} ${top - 52} C ${x - 10} ${top - 30} ${x - 8} ${top - 8} ${x} ${top} C ${x + 8} ${top - 8} ${x + 10} ${top - 30} ${x} ${top - 52} Z`} fill="rgba(120,170,255,0.9)" />
      {tint && <path d={`M ${x} ${FLAME_TIP_BLUE - 6} C ${x - 30} ${top - 80} ${x - 18} ${top - 14} ${x} ${top - 4} C ${x + 18} ${top - 14} ${x + 30} ${top - 80} ${x} ${FLAME_TIP_BLUE - 6} Z`} fill={rgb(tint, 0.8)} filter="url(#soft)" />}
    </g>
  )
}

export function GasTap({ on }: { on: boolean }) {
  return (
    <g transform={`translate(${GAS_TAP.x},${GAS_TAP.y})`}>
      <rect x="-26" y="-30" width="28" height="44" rx="4" fill="#8b9096" stroke="#555a5f" />
      <circle cx="-12" cy="-8" r="9" fill="#3d4247" />
      <rect x="-14" y={on ? -30 : -12} width="4" height="22" rx="2" fill="#e8b320" transform={on ? 'rotate(0 -12 -8)' : 'rotate(90 -12 -8)'} />
      <rect x="0" y="-4" width="14" height="8" fill="#8b9096" />
    </g>
  )
}

export function Matchbox() {
  return (
    <g transform={`translate(${MATCHBOX.x},${MATCHBOX.y})`}>
      <rect x="-30" y="-14" width="60" height="28" rx="3" fill="#d9472c" stroke="#8e2a17" />
      <rect x="-30" y="-14" width="60" height="7" fill="#5a3a2c" />
      <rect x="-14" y="-3" width="28" height="12" rx="2" fill="#f3e3b0" />
    </g>
  )
}

/** A match with its head at (x, y). */
export function Match({ x, y, lit }: { x: number; y: number; lit: boolean }) {
  return (
    <g transform={`translate(${x},${y}) rotate(-20)`}>
      <rect x="-2" y="-56" width="4" height="56" fill="#e2c48e" />
      <ellipse cx="0" cy="0" rx="4" ry="5" fill={lit ? '#2b1a12' : '#b2301e'} />
      {lit && <path d="M 0 -26 C -9 -14 -7 -4 0 2 C 7 -4 9 -14 0 -26 Z" fill="url(#yellowflame)" className="flame-flicker" />}
    </g>
  )
}

/** Wooden test-tube holder gripping a tube near its top. */
export function TubeHolder({ b }: { b: TubeBox }) {
  const y = b.rim + 30
  return (
    <g>
      <rect x={b.cx - b.inner / 2 - 5} y={y - 6} width={b.inner + 10} height="12" rx="3" fill="#7c7f83" />
      <rect x={b.cx + b.inner / 2 + 4} y={y - 5} width="96" height="10" rx="3" fill="#b88b55" stroke="#7c5a32" />
    </g>
  )
}

// ------------------------------------------------------------------ filtering
/** Funnel with its stem tip at (x, y). */
export function Funnel({ x, y, residue, wet }: { x: number; y: number; residue?: RGB | null; wet?: boolean }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <path d="M -5 0 L -5 -46 L -46 -110 L 46 -110 L 5 -46 L 5 0 Z" fill="rgba(220,235,242,0.35)" stroke="rgba(70,85,95,0.6)" strokeWidth="1.6" />
      <path d="M -38 -104 L 38 -104 L 0 -50 Z" fill={wet ? '#e9e6dc' : '#f8f6ef'} stroke="#cfc8b8" />
      {residue && <path d="M -14 -70 L 14 -70 L 0 -50 Z" fill={rgb(residue, 0.95)} filter="url(#crystal-grain)" />}
    </g>
  )
}
export function FunnelStand() {
  const { x, y } = FUNNEL_STAND
  return (
    <g>
      <rect x={x - 70} y={BENCH_Y - 8} width="80" height="10" rx="2" fill="#3c4146" />
      <rect x={x - 64} y={y - 70} width="7" height={BENCH_Y - y + 64} fill="#80868b" />
      <ellipse cx={x} cy={y - 84} rx="40" ry="6" fill="none" stroke="#80868b" strokeWidth="5" />
      <rect x={x - 64} y={y - 88} width="26" height="6" fill="#80868b" />
    </g>
  )
}

// ------------------------------------------------------------------ waste, sink, clock
export function Waste() {
  const { x, y } = WASTE
  return (
    <g transform={`translate(${x},${y})`}>
      <path d="M -50 0 L -54 -130 L 54 -130 L 50 0 Z" fill="rgba(225,236,242,0.35)" stroke="rgba(70,85,95,0.6)" strokeWidth="2" />
      <path d="M -49 -2 L -51 -36 L 51 -36 L 49 -2 Z" fill="rgba(150,140,120,0.45)" />
      <rect x="-34" y="-104" width="68" height="22" rx="3" fill="#fbfaf3" stroke="#a69e8c" />
      <text x="0" y="-88" textAnchor="middle" className="label-text">
        WASTE
      </text>
    </g>
  )
}
export function Sink() {
  const { x, y } = SINK
  return (
    <g transform={`translate(${x},${y})`}>
      <path d="M -58 -40 L 58 -40 L 50 0 L -50 0 Z" fill="#b9c0c6" stroke="#7d858c" strokeWidth="2" />
      <ellipse cx="0" cy="-40" rx="58" ry="8" fill="#8f979e" />
      <path d="M -40 -40 L -40 -96 Q -40 -112 -22 -112 L -6 -112" fill="none" stroke="#c9cfd4" strokeWidth="10" strokeLinecap="round" />
      <path d="M -40 -40 L -40 -96 Q -40 -112 -22 -112 L -6 -112" fill="none" stroke="#7d858c" strokeWidth="1.2" />
      <rect x="-50" y="-84" width="20" height="10" rx="2" fill="#5a6168" />
    </g>
  )
}
export function Clock({ t, fast }: { t: number; fast: boolean }) {
  const { x, y, r } = CLOCK
  const sec = (t % 60) * 6
  const min = ((t / 60) % 60) * 6
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r={r + 6} fill={fast ? '#ffd257' : '#3b3f44'} className={fast ? 'clock-fast' : undefined} />
      <circle r={r} fill="#fbfaf5" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x="-1.5" y={-r + 4} width="3" height={i % 3 ? 7 : 12} fill="#333" transform={`rotate(${i * 30})`} />
      ))}
      <rect x="-2.5" y={-r * 0.6} width="5" height={r * 0.66} rx="2" fill="#222" transform={`rotate(${min})`} />
      <rect x="-1" y={-r * 0.86} width="2" height={r * 0.98} fill="#c2271f" transform={`rotate(${sec})`} />
      <circle r="4" fill="#222" />
      {fast && (
        <g transform={`translate(0,${r * 0.42})`}>
          <path d="M -14 -7 L -2 0 L -14 7 Z M 0 -7 L 12 0 L 0 7 Z" fill="#c2271f" />
        </g>
      )}
    </g>
  )
}

// ------------------------------------------------------------------ tray items
export function TubeBoxArt({ x, kind }: { x: number; kind: 'test-tube' | 'boiling-tube' | 'hard-glass-tube' }) {
  const w = kind === 'boiling-tube' ? 18 : 13
  const n = kind === 'boiling-tube' ? 3 : 4
  return (
    <g transform={`translate(${x},${TRAY_Y - 16})`}>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={-((n - 1) * (w + 4)) / 2 + i * (w + 4) - w / 2} y={-64} width={w} height="70" rx={w / 2} fill="rgba(225,236,242,0.55)" stroke={kind === 'hard-glass-tube' ? '#6b7782' : 'rgba(70,85,95,0.55)'} strokeWidth={kind === 'hard-glass-tube' ? 2.4 : 1.4} />
      ))}
      <rect x="-44" y="-26" width="88" height="40" rx="4" fill={kind === 'boiling-tube' ? '#cbb68f' : kind === 'hard-glass-tube' ? '#a9b6bf' : '#d8c8a2'} stroke="#8e7f61" />
    </g>
  )
}

export function StopperBox() {
  const { x } = TRAY.stoppers
  return (
    <g transform={`translate(${x},${TRAY_Y - 20})`}>
      <rect x="-38" y="-26" width="76" height="40" rx="5" fill="#ece7dc" stroke="#9e9584" />
      {[-20, 0, 20].map((dx, i) => (
        <path key={i} d={`M ${dx - 9} -20 L ${dx + 9} -20 L ${dx + 7} 0 L ${dx - 7} 0 Z`} fill="#5b5049" />
      ))}
    </g>
  )
}

/** A rubber stopper with its bottom centre at (x, y). */
export function Stopper({ x, y, w = 30 }: { x: number; y: number; w?: number }) {
  return <path d={`M ${x - w / 2 + 3} ${y} L ${x - w / 2} ${y - 22} L ${x + w / 2} ${y - 22} L ${x + w / 2 - 3} ${y} Z`} fill="#5b5049" stroke="#3e3631" />
}

/** Spatula with the blade tip at (x, y). */
export function Spatula({ x, y, load }: { x: number; y: number; load?: RGB | null }) {
  return (
    <g transform={`translate(${x},${y}) rotate(-62)`}>
      <rect x="0" y="-3" width="150" height="6" rx="3" fill="#b9bfc4" stroke="#7c8389" />
      <ellipse cx="6" cy="0" rx="14" ry="7" fill="#c9ced2" stroke="#7c8389" />
      {load && <ellipse cx="6" cy="-3" rx="10" ry="5" fill={rgb(load)} />}
    </g>
  )
}

export function Booklet({ x, paper }: { x: number; paper: IndicatorPaper }) {
  const c = PAPER_COLOUR[paper]
  return (
    <g transform={`translate(${x},${TRAY_Y - 20})`}>
      <rect x="-28" y="-50" width="56" height="64" rx="4" fill={paper === 'universal-indicator' ? '#3a6b46' : '#f1ede2'} stroke="#8e8573" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={-22 + i * 11} y="-62" width="8" height="40" fill={rgb(c)} stroke="rgba(0,0,0,0.15)" />
      ))}
      {paper === 'universal-indicator' && (
        <g>
          {['#d9342b', '#f08a24', '#e9cf2a', '#4caf50', '#2a9d8f', '#2f5fb3', '#6a3d9a'].map((col, i) => (
            <rect key={i} x={-24 + i * 7} y="2" width="6" height="8" fill={col} />
          ))}
        </g>
      )}
    </g>
  )
}

/** A strip of indicator paper with its tip (the end that touches things) at (x, y). */
export function Strip({ x, y, paper, colour, damp }: { x: number; y: number; paper: IndicatorPaper; colour?: RGB | null; damp?: boolean }) {
  const base = PAPER_COLOUR[paper]
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="-5" y="-64" width="10" height="64" fill={rgb(base)} stroke="rgba(0,0,0,0.2)" />
      {colour && <rect x="-5" y="-30" width="10" height="30" fill={rgb(colour)} />}
      {damp && <rect x="-5" y="-64" width="10" height="64" fill="rgba(0,20,40,0.16)" />}
    </g>
  )
}

export function SplintBox() {
  const { x } = TRAY.splints
  return (
    <g transform={`translate(${x},${TRAY_Y - 18})`}>
      {[-16, -8, 0, 8, 16].map((dx, i) => (
        <rect key={i} x={dx - 2} y={-70} width="4" height="70" fill="#d6b27a" stroke="#a5824e" strokeWidth="0.6" />
      ))}
      <rect x="-30" y="-24" width="60" height="36" rx="4" fill="#b98d5a" stroke="#7c5a32" />
    </g>
  )
}

export type SplintState = 'unlit' | 'burning' | 'glowing' | 'dead'
/** A wooden splint with its tip at (x, y). */
export function Splint({ x, y, state }: { x: number; y: number; state: SplintState }) {
  return (
    <g transform={`translate(${x},${y}) rotate(-12)`}>
      <rect x="-2.5" y="-120" width="5" height="120" fill="#d6b27a" stroke="#a5824e" strokeWidth="0.6" />
      {state !== 'unlit' && <rect x="-2.5" y="-10" width="5" height="10" fill="#2b1d14" />}
      {state === 'glowing' && <circle cx="0" cy="1" r="4" fill="#ff5a1f" className="ember" />}
      {state === 'burning' && <path d="M 0 -30 C -10 -16 -8 -4 0 2 C 8 -4 10 -16 0 -30 Z" fill="url(#yellowflame)" className="flame-flicker" />}
    </g>
  )
}

export function PipetteBeaker() {
  const { x } = TRAY.pipettes
  return (
    <g transform={`translate(${x},${TRAY_Y - 6})`}>
      <path d="M -26 0 L -28 -56 L 28 -56 L 26 0 Z" fill="rgba(225,236,242,0.4)" stroke="rgba(70,85,95,0.6)" strokeWidth="1.5" />
      <Pipette x={-6} y={-8} />
      <Pipette x={8} y={-6} />
    </g>
  )
}

/** Teat pipette with its tip at (x, y). */
export function Pipette({ x, y, tint, squeeze }: { x: number; y: number; tint?: RGB | null; squeeze?: boolean }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <path d="M -2 0 L -4 -78 L 4 -78 L 2 0 Z" fill={tint ? rgb(tint, 0.45) : 'rgba(225,236,242,0.6)'} stroke="rgba(70,85,95,0.7)" strokeWidth="1.1" />
      <path d={squeeze ? 'M -6 -78 Q -5 -98 0 -100 Q 5 -98 6 -78 Z' : 'M -8 -78 Q -11 -104 0 -110 Q 11 -104 8 -78 Z'} fill="#efe6c8" stroke="#a69a74" strokeWidth="1.1" />
    </g>
  )
}

export function WireHolder() {
  const { x } = TRAY.wire
  return (
    <g transform={`translate(${x},${TRAY_Y - 10})`}>
      <rect x="-20" y="-16" width="40" height="24" rx="4" fill="#ece7dc" stroke="#9e9584" />
    </g>
  )
}

/** Nichrome flame-test wire in a handle, loop at (x, y). */
export function Wire({ x, y, loaded }: { x: number; y: number; loaded?: RGB | null }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle cx="0" cy="0" r="4" fill="none" stroke="#8d8f91" strokeWidth="1.6" />
      {loaded && <circle cx="0" cy="0" r="3" fill={rgb(loaded)} />}
      <line x1="0" y1="-4" x2="0" y2="-60" stroke="#8d8f91" strokeWidth="1.6" />
      <rect x="-5" y="-120" width="10" height="62" rx="3" fill="#3d6f9e" />
    </g>
  )
}

export function Tile() {
  const { x, w } = TRAY.tile
  return <rect x={x - w / 2} y={TRAY_Y - 96} width={w} height="96" rx="4" fill="#fbfbf8" stroke="#c9c4b6" />
}

/** Ruler-like depth marks beside a tube (one per cm). */
export function DepthMarks({ b }: { b: TubeBox }) {
  const marks = []
  for (let cm = 1; b.bottom - cm * b.pxPerCm > b.rim + 6; cm++) {
    const y = b.bottom - cm * b.pxPerCm
    marks.push(<line key={cm} x1={b.cx + b.inner / 2 + 6} x2={b.cx + b.inner / 2 + (cm % 5 === 0 ? 20 : 13)} y1={y} y2={y} stroke="#f6e27a" strokeWidth={cm % 5 === 0 ? 2.4 : 1.6} />)
  }
  return (
    <g opacity="0.9">
      <line x1={b.cx + b.inner / 2 + 6} x2={b.cx + b.inner / 2 + 6} y1={b.bottom} y2={b.rim + 6} stroke="#f6e27a" strokeWidth="1.6" />
      {marks}
    </g>
  )
}

/** A stream of liquid from a lip to a surface. */
export function Stream({ x1, y1, x2, y2, colour }: { x1: number; y1: number; x2: number; y2: number; colour: string }) {
  return <path d={`M ${x1} ${y1} Q ${x1 + (x2 - x1) * 0.2} ${y1 + 10} ${x2} ${y2}`} stroke={colour} strokeWidth="4" fill="none" strokeLinecap="round" className="stream" />
}
