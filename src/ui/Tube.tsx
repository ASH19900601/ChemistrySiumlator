import { useMemo } from 'react'
import type { Appearance } from '../engine'

type RGB = [number, number, number]
const rgba = ([r, g, b]: RGB, a: number) => `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a.toFixed(3)})`

const GEOM = {
  'test-tube': { w: 34, h: 210, wall: 2 },
  'hard-glass-tube': { w: 36, h: 210, wall: 3.2 },
  'boiling-tube': { w: 52, h: 236, wall: 2.4 },
  'filter-paper': { w: 90, h: 120, wall: 2 },
} as const

export type BusyKind = 'pour' | 'heat' | 'shake' | 'gas' | 'flame' | 'wait' | null

interface Props {
  a: Appearance
  id: string
  selected?: boolean
  busy?: BusyKind
  big?: boolean
  onClick?: () => void
  badge?: string
}

/** Deterministic pseudo-random numbers so bubbles do not jump between renders. */
function seeded(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

export function Tube({ a, id, selected, busy, onClick, badge }: Props) {
  if (a.kind === 'filter-paper') return <FilterPaper a={a} selected={selected} onClick={onClick} />
  const g = GEOM[a.kind]
  const pad = 14
  const x0 = pad
  const y0 = 30
  const r = g.w / 2
  const yB = y0 + g.h
  const W = g.w + pad * 2
  const H = g.h + 90
  const usable = g.h - 14
  const liqTop = yB - a.liquidLevel * usable
  const sedTop = yB - a.sediment * usable
  const solidTop = yB - a.solid * usable
  const clip = `clip-${id}`
  const interior = `M ${x0} ${y0} L ${x0} ${yB - r} A ${r} ${r} 0 0 0 ${x0 + g.w} ${yB - r} L ${x0 + g.w} ${y0} Z`
  const heating = a.heating || busy === 'heat'
  const bubbleCount = Math.round(a.bubbles * 10) + (busy === 'pour' && a.liquidLevel > 0 ? 2 : 0)
  const bubbles = useMemo(() => {
    const rnd = seeded(id.split('').reduce((s, c) => s + c.charCodeAt(0), 7) * 97)
    return Array.from({ length: 12 }, () => ({ x: rnd(), d: 0.7 + rnd() * 1.1, delay: rnd() * 1.5, s: 1 + rnd() * 1.6 }))
  }, [id])
  const drops = useMemo(() => {
    const rnd = seeded(id.length * 131 + 17)
    return Array.from({ length: 14 }, () => ({ x: rnd(), y: rnd(), s: 0.8 + rnd() * 1.4 }))
  }, [id])
  const liquidPresent = a.liquidLevel > 0.002
  const glow = a.T > 250 ? Math.min(0.85, (a.T - 250) / 450) : 0

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`tube tube-${a.kind}${selected ? ' selected' : ''}${busy === 'shake' ? ' shaking' : ''}`}
      onClick={onClick}
      role="button"
      aria-label={a.label}
    >
      <defs>
        <clipPath id={clip}>
          <path d={interior} />
        </clipPath>
        <linearGradient id={`glass-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="0.18" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="0.7" stopColor="#ffffff" stopOpacity="0.02" />
          <stop offset="0.9" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id={`liq-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.12" />
          <stop offset="0.35" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.18" />
        </linearGradient>
      </defs>

      {/* flame */}
      {heating && (
        <g className="flame" transform={`translate(${W / 2}, ${yB + 6})`}>
          <path d="M0 64 C -16 40 -10 18 0 0 C 10 18 16 40 0 64 Z" fill="rgba(80,120,255,0.55)" />
          <path d="M0 64 C -8 46 -5 30 0 18 C 5 30 8 46 0 64 Z" fill="rgba(170,210,255,0.85)" />
        </g>
      )}

      <g clipPath={`url(#${clip})`}>
        {/* faint background of the empty glass */}
        <rect x={x0} y={y0} width={g.w} height={g.h} fill="rgba(210,225,235,0.10)" />
        {/* coloured gas in the head-space */}
        {a.gasRGB && <rect x={x0} y={y0} width={g.w} height={Math.max(0, liqTop - y0)} fill={rgba(a.gasRGB, a.gasAlpha)} className="gas" />}
        {/* liquid */}
        {liquidPresent && (
          <>
            <rect x={x0} y={liqTop} width={g.w} height={yB - liqTop} fill="rgba(222,236,244,0.42)" />
            {/* suspended precipitate scatters light … */}
            {a.turbidity > 0.01 && (
              <>
                <rect x={x0} y={liqTop} width={g.w} height={yB - liqTop} fill={rgba(a.turbidityRGB, a.turbidity * 0.8)} />
                <rect x={x0} y={liqTop} width={g.w} height={yB - liqTop} fill={rgba(a.turbidityRGB, a.turbidity * 0.6)} filter="url(#ppt-grain)" />
              </>
            )}
            {/* … and the coloured solution filters it (subtractive mixing) */}
            <rect x={x0} y={liqTop} width={g.w} height={yB - liqTop} fill={rgba(a.liquidRGB, 1)} style={{ mixBlendMode: 'multiply' }} />
            <rect x={x0} y={liqTop} width={g.w} height={yB - liqTop} fill={`url(#liq-${id})`} />
            {/* meniscus */}
            <ellipse cx={x0 + g.w / 2} cy={liqTop} rx={g.w / 2} ry={2.4} fill="rgba(255,255,255,0.35)" stroke="rgba(90,100,110,0.35)" strokeWidth="0.6" />
          </>
        )}
        {/* settled precipitate */}
        {a.sediment > 0.003 && (
          <>
            <rect x={x0} y={sedTop} width={g.w} height={yB - sedTop} fill={rgba(a.sedimentRGB, 0.95)} />
            <rect x={x0} y={sedTop} width={g.w} height={yB - sedTop} fill={rgba(a.sedimentRGB, 0.9)} filter="url(#ppt-grain)" />
          </>
        )}
        {/* dry solid */}
        {a.solid > 0.003 && (
          <>
            <path
              d={`M ${x0} ${yB} L ${x0} ${solidTop + 4} Q ${x0 + g.w * 0.3} ${solidTop - 3} ${x0 + g.w * 0.55} ${solidTop + 1} T ${x0 + g.w} ${solidTop + 3} L ${x0 + g.w} ${yB} Z`}
              fill={rgba(a.solidRGB, 1)}
            />
            <path
              d={`M ${x0} ${yB} L ${x0} ${solidTop + 4} Q ${x0 + g.w * 0.3} ${solidTop - 3} ${x0 + g.w * 0.55} ${solidTop + 1} T ${x0 + g.w} ${solidTop + 3} L ${x0 + g.w} ${yB} Z`}
              fill="rgba(0,0,0,0.5)"
              filter="url(#crystal-grain)"
            />
          </>
        )}
        {/* metal pieces */}
        {a.pieces.map((p, i) =>
          p.kind === 'ribbon' ? (
            <rect key={i} x={x0 + g.w * 0.25} y={yB - 26 - i * 4} width={g.w * 0.5} height={4} rx={1} fill="#b9bdc2" stroke="#7d8287" strokeWidth="0.6" transform={`rotate(-28 ${x0 + g.w / 2} ${yB - 24})`} />
          ) : p.kind === 'foil' ? (
            <path key={i} d={`M ${x0 + 8} ${yB - 12} l 6 -9 l 7 5 l 6 -7 l 4 10 l -9 6 Z`} fill="#d7dade" stroke="#8a9096" strokeWidth="0.6" />
          ) : (
            <rect key={i} x={x0 + 3} y={yB - 7} width={g.w - 6} height={5} fill="#9fa4a9" filter="url(#crystal-grain)" />
          ),
        )}
        {/* bubbles */}
        {liquidPresent &&
          bubbles.slice(0, bubbleCount).map((b, i) => (
            <circle
              key={i}
              className="bubble"
              cx={x0 + 4 + b.x * (g.w - 8)}
              cy={yB - 6}
              r={b.s}
              style={{ ['--rise' as string]: `${-(yB - liqTop - 8)}px`, animationDuration: `${b.d}s`, animationDelay: `${b.delay}s` }}
            />
          ))}
        {/* condensation droplets */}
        {a.condensation > 0.02 &&
          drops.map((d, i) => (
            <circle key={i} cx={x0 + 3 + d.x * (g.w - 6)} cy={y0 + 14 + d.y * 50} r={d.s} fill="rgba(255,255,255,0.65)" stroke="rgba(120,140,150,0.4)" strokeWidth="0.4" opacity={a.condensation} />
          ))}
        {/* red-hot glass */}
        {glow > 0 && <rect x={x0} y={yB - 40} width={g.w} height={40} fill={`rgba(255,120,40,${glow * 0.5})`} />}
      </g>

      {/* glass */}
      <path d={interior} fill={`url(#glass-${id})`} />
      <path d={interior.replace(/ Z$/, '')} fill="none" stroke="rgba(70,85,95,0.55)" strokeWidth={g.wall} />
      <path d={interior.replace(/ Z$/, '')} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={g.wall * 0.35} transform="translate(-0.6,0)" />
      {/* rim */}
      <rect x={x0 - 3} y={y0 - 3} width={g.w + 6} height={5} rx={2.5} fill="rgba(235,242,246,0.6)" stroke="rgba(70,85,95,0.5)" strokeWidth="1" />
      {a.stoppered && (
        <g>
          <path d={`M ${x0 + 1} ${y0 + 10} L ${x0 - 2} ${y0 - 14} L ${x0 + g.w + 2} ${y0 - 14} L ${x0 + g.w - 1} ${y0 + 10} Z`} fill="#5b5049" />
          <rect x={x0 - 2} y={y0 - 16} width={g.w + 4} height={5} rx={2} fill="#6d6058" />
        </g>
      )}
      {badge && (
        <g>
          <rect x={W / 2 - 22} y={yB - g.h * 0.55} width={44} height={20} rx={3} fill="#fbfaf4" stroke="#8c8577" strokeWidth="0.8" />
          <text x={W / 2} y={yB - g.h * 0.55 + 14.5} textAnchor="middle" className="tube-badge">
            {badge}
          </text>
        </g>
      )}
      <text x={W / 2} y={H - 8} textAnchor="middle" className="tube-label">
        {shortLabel(a.label)}
      </text>
    </svg>
  )
}

/** Compact tag for the rack: "test-tube 3" → "T3", "boiling tube 2" → "B2". */
export function shortLabel(label: string) {
  return label
    .replace(/^test-tube (\d+)$/, 'T$1')
    .replace(/^boiling tube (\d+)$/, 'B$1')
    .replace(/^hard-glass test-tube (\d+)$/, 'H$1')
    .replace(/^filtrate from .*/, 'filtrate')
    .replace(/^residue from .*/, 'residue')
    .replace(/^solid /, '')
}

function FilterPaper({ a, selected, onClick }: { a: Appearance; selected?: boolean; onClick?: () => void }) {
  const has = a.solid > 0.003 || a.sediment > 0.003 || a.turbidity > 0.01
  const col = a.solid > 0.003 ? a.solidRGB : a.sediment > 0.003 ? a.sedimentRGB : a.turbidityRGB
  return (
    <svg viewBox="0 0 120 210" className={`tube tube-filter${selected ? ' selected' : ''}`} onClick={onClick} role="button" aria-label={a.label}>
      <path d="M10 20 L110 20 L66 100 L66 160 L54 160 L54 100 Z" fill="rgba(220,235,242,0.25)" stroke="rgba(70,85,95,0.55)" strokeWidth="2" />
      <path d="M20 26 L100 26 L60 92 Z" fill="#f7f5ee" stroke="#cfc8b8" strokeWidth="1" />
      {has && <path d="M42 62 L78 62 L60 92 Z" fill={rgba(col as RGB, 0.95)} filter="url(#crystal-grain)" />}
      <text x="60" y="200" textAnchor="middle" className="tube-label">
        {shortLabel(a.label)}
      </text>
    </svg>
  )
}

/** Shared SVG filters (rendered once). */
export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <defs>
        <filter id="ppt-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="3" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -2.2 1.35" result="spots" />
          <feComposite in="SourceGraphic" in2="spots" operator="in" />
        </filter>
        <filter id="crystal-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="8" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 0.95" result="spots" />
          <feComposite in="SourceGraphic" in2="spots" operator="in" />
        </filter>
      </defs>
    </svg>
  )
}
