// First-run demonstration: a ghost hand shows the main gestures on the bench (no text).

import { useEffect, useState } from 'react'
import { Dropper, Match } from './art'
import { bottleX, BURNER_TOP, BURNER_X, GAS_TAP, HOLDER_BOTTOM, MATCHBOX, RACK_BOTTOM, SCENE_H, SCENE_W, SHELF_Y, slotX, TRAY, TRAY_Y } from './layout'

type Carry = 'tube' | 'dropper' | 'match' | null
interface Key {
  t: number
  x: number
  y: number
  press?: boolean
  carry?: Carry
}

const SLOT = slotX(5)
const RIM = RACK_BOTTOM - 190

// time (ms), position of the fingertip, pressed?, what is being carried
const KEYS: Key[] = [
  { t: 0, x: 700, y: 760 },
  { t: 700, x: TRAY.box['test-tube'].x, y: TRAY_Y - 60 },
  { t: 1000, x: TRAY.box['test-tube'].x, y: TRAY_Y - 60, press: true, carry: 'tube' },
  { t: 2100, x: SLOT, y: RACK_BOTTOM - 120, press: true, carry: 'tube' },
  { t: 2400, x: SLOT, y: RACK_BOTTOM - 120 },
  { t: 3200, x: bottleX(0), y: SHELF_Y - 166 },
  { t: 3500, x: bottleX(0), y: SHELF_Y - 166, press: true, carry: 'dropper' },
  { t: 4700, x: SLOT, y: RIM - 80, press: true, carry: 'dropper' },
  { t: 5000, x: SLOT, y: RIM - 80, carry: 'dropper' },
  { t: 5300, x: SLOT, y: RIM - 80, press: true, carry: 'dropper' },
  { t: 5500, x: SLOT, y: RIM - 80, carry: 'dropper' },
  { t: 5800, x: SLOT, y: RIM - 80, press: true, carry: 'dropper' },
  { t: 6000, x: SLOT, y: RIM - 80, carry: 'dropper' },
  { t: 6900, x: GAS_TAP.x - 12, y: GAS_TAP.y - 8 },
  { t: 7200, x: GAS_TAP.x - 12, y: GAS_TAP.y - 8, press: true },
  { t: 7400, x: GAS_TAP.x - 12, y: GAS_TAP.y - 8 },
  { t: 8100, x: MATCHBOX.x, y: MATCHBOX.y },
  { t: 8400, x: MATCHBOX.x, y: MATCHBOX.y, press: true, carry: 'match' },
  { t: 9400, x: BURNER_X, y: BURNER_TOP - 60, press: true, carry: 'match' },
  { t: 9900, x: BURNER_X, y: BURNER_TOP - 60 },
  { t: 10700, x: SLOT, y: RACK_BOTTOM - 100 },
  { t: 11000, x: SLOT, y: RACK_BOTTOM - 100, press: true, carry: 'tube' },
  { t: 12200, x: BURNER_X, y: HOLDER_BOTTOM.low - 100, press: true, carry: 'tube' },
  { t: 12600, x: BURNER_X, y: HOLDER_BOTTOM.low - 100 },
  { t: 13400, x: 900, y: 820 },
]
const END = KEYS[KEYS.length - 1].t

function at(t: number): Key {
  let i = 0
  while (i + 1 < KEYS.length && KEYS[i + 1].t <= t) i++
  const a = KEYS[i]
  const b = KEYS[Math.min(i + 1, KEYS.length - 1)]
  const f = b.t > a.t ? Math.min(1, (t - a.t) / (b.t - a.t)) : 0
  const e = f < 0.5 ? 2 * f * f : 1 - (-2 * f + 2) ** 2 / 2
  return { t, x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, press: a.press, carry: a.carry ?? null }
}

export function Demo({ onEnd }: { onEnd: () => void }) {
  const [t, setT] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const loop = () => {
      const el = performance.now() - start
      setT(el)
      if (el < END + 400) raf = requestAnimationFrame(loop)
      else onEnd()
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [onEnd])
  const k = at(t)
  return (
    <g className="demo" onPointerDown={(e) => { e.stopPropagation(); onEnd() }} onPointerUp={(e) => e.stopPropagation()}>
      <rect x="0" y="0" width={SCENE_W} height={SCENE_H} fill="rgba(20,24,28,0.18)" />
      <g transform={`translate(${k.x},${k.y}) scale(${k.press ? 0.92 : 1})`}>
        {k.press && <circle r="26" fill="rgba(255,255,255,0.35)" stroke="#fff" strokeWidth="3" className="tap-ring" />}
        <path
          d="M 0 0 C -4 -2 -8 2 -7 8 L -2 40 C -14 34 -24 38 -22 48 L 4 84 C 10 92 18 96 30 96 L 52 96 C 66 96 74 86 74 72 L 74 44 C 74 36 66 32 60 36 C 60 28 52 24 46 30 C 46 22 38 18 32 26 L 30 26 L 24 -4 C 22 -12 12 -12 10 -4 L 14 30 L 6 -2 C 5 -6 3 -6 0 0 Z"
          transform="translate(-8,0) rotate(-14)"
          fill="#fff"
          stroke="#2a2e33"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </g>
      {k.carry === 'tube' && (
        <g opacity="0.75">
          <rect x={k.x - 14} y={k.y - 70} width="28" height="190" rx="14" fill="rgba(230,240,246,0.7)" stroke="rgba(70,85,95,0.7)" strokeWidth="2" />
        </g>
      )}
      {k.carry === 'dropper' && (
        <g opacity="0.85">
          <Dropper x={k.x} y={k.y + 70} tint="rgba(200,220,235,0.8)" squeeze={k.press && t > 5000} />
        </g>
      )}
      {k.carry === 'match' && <Match x={k.x} y={k.y + 50} lit />}
    </g>
  )
}
