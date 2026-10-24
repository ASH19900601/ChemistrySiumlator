// The laboratory bench: everything is drawn as apparatus and operated by picking it up and
// bringing it to something else (drag, or tap to lift and tap the target).

import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { REAGENTS, type Appearance } from '../../engine'
import { Tube } from '../Tube'
import {
  Booklet,
  BottleBody,
  Burner,
  Clock,
  DepthMarks,
  Dropper,
  DropperBottle,
  Funnel,
  FunnelStand,
  GasTap,
  Jar,
  Match,
  Matchbox,
  PieceDish,
  Pipette,
  PipetteBeaker,
  RackBack,
  RackFront,
  rgb,
  Room,
  Sink,
  Spatula,
  Splint,
  SplintBox,
  Stopper,
  StopperBox,
  Stream,
  Strip,
  Tile,
  TubeBoxArt,
  TubeHolder,
  Waste,
  WashBottle,
  Wire,
  WireHolder,
  type RGB,
} from './art'
import { BURNER_X, FUNNEL_STAND, HOLDER_BOTTOM, SCENE_H, SCENE_W, SHELF_Y, slotX, RACK_BOTTOM, surfaceY, TRAY, TRAY_Y, tubeBox, WASH_BOTTLE, WASTE, SINK, type TubeBox } from './layout'
import type { BenchModel, Held, Zone } from './model'
import { Demo } from './Demo'

const EMPTY_TUBE = (kind: Appearance['kind']): Appearance => ({
  kind,
  label: '',
  liquidLevel: 0,
  liquidRGB: [255, 255, 255],
  liquidAlpha: 0,
  turbidity: 0,
  turbidityRGB: [255, 255, 255],
  sediment: 0,
  sedimentRGB: [255, 255, 255],
  solid: 0,
  solidRGB: [255, 255, 255],
  pieces: [],
  bubbles: 0,
  gasRGB: null,
  gasAlpha: 0,
  condensation: 0,
  hot: false,
  heating: false,
  stoppered: false,
  T: 20,
})

const PlacedTubeInner = memo(function PlacedTubeInner({ id, a, x, y, s, badge }: { id: string; a: Appearance; x: number; y: number; s: number; badge?: string }) {
  return <Tube id={id} a={a} badge={badge} at={{ x, y, s }} />
})
const PlacedTube = ({ id, a, b, badge }: { id: string; a: Appearance; b: TubeBox; badge?: string }) => <PlacedTubeInner id={id} a={a} x={b.x} y={b.y} s={b.s} badge={badge} />
const StaticRoom = memo(Room)

export function Bench({ model, version, demo, onDemoEnd }: { model: BenchModel; version: number; demo: boolean; onDemoEnd: () => void }) {
  void version
  const m = model
  const lab = m.lab
  const wrap = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [zoom, setZoom] = useState<number | null>(null)
  const [coarse] = useState(() => window.matchMedia('(pointer: coarse)').matches)
  const [, repaint] = useState(0)
  const paint = useRef(0)
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null)
  const pan = useRef<{ x: number; y: number; left: number; top: number } | null>(null)
  const edgeFrame = useRef(0)
  const requestPaint = useCallback(() => {
    if (!paint.current) paint.current = requestAnimationFrame(() => {
      paint.current = 0
      repaint(v => v + 1)
    })
  }, [])

  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    setSize({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  // fit the whole bench; on narrow phones fill the height and scroll sideways
  const fit = Math.min(size.w / SCENE_W, size.h / SCENE_H) || 0.5
  const scale = zoom ?? (coarse ? Math.max(fit, 0.7) : fit < 0.42 ? Math.max(fit, size.h / SCENE_H) : fit)
  const W = Math.floor(SCENE_W * scale)
  const H = Math.floor(SCENE_H * scale)

  const toScene = useCallback((e: { clientX: number; clientY: number }) => {
    const s = svg.current!
    const pt = s.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const p = pt.matrixTransform(s.getScreenCTM()!.inverse())
    return { x: p.x, y: p.y }
  }, [])

  const onDown = (e: RPointerEvent<SVGSVGElement>) => {
    if (e.button !== 0 || !e.isPrimary || pointer.current || demo) return
    pointer.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
    const id = (e.target as Element).getAttribute?.('data-hit')
    if (!id && !m.held && wrap.current) {
      pan.current = { x: e.clientX, y: e.clientY, left: wrap.current.scrollLeft, top: wrap.current.scrollTop }
    }
    svg.current!.setPointerCapture(e.pointerId)
    e.preventDefault()
    const p = toScene(e)
    m.down(id, p.x, p.y)
    requestPaint()
    // Continue scrolling while a held finger stays at the edge, without requiring more move events.
    let last = performance.now()
    const followEdge = (now: number) => {
      const active = pointer.current
      const el = wrap.current
      if (!active || !el) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (m.held?.dragging) {
        const r = el.getBoundingClientRect()
        const velocity = (p: number, lo: number, hi: number) => p < lo + 48 ? -360 * Math.min(1, (lo + 48 - p) / 48) : p > hi - 48 ? 360 * Math.min(1, (p - hi + 48) / 48) : 0
        const left = el.scrollLeft, top = el.scrollTop
        el.scrollLeft += velocity(active.x, r.left, r.right) * dt
        el.scrollTop += velocity(active.y, r.top, r.bottom) * dt
        if (left !== el.scrollLeft || top !== el.scrollTop) {
          const point = toScene({ clientX: active.x, clientY: active.y })
          m.move(point.x, point.y)
          requestPaint()
        }
      }
      edgeFrame.current = requestAnimationFrame(followEdge)
    }
    edgeFrame.current = requestAnimationFrame(followEdge)
  }
  const onMove = (e: RPointerEvent<SVGSVGElement>) => {
    if (pointer.current?.id !== e.pointerId) return
    pointer.current.x = e.clientX
    pointer.current.y = e.clientY
    if (pan.current && wrap.current) {
      wrap.current.scrollLeft = pan.current.left + pan.current.x - e.clientX
      wrap.current.scrollTop = pan.current.top + pan.current.y - e.clientY
      return
    }
    const p = toScene(e)
    m.move(p.x, p.y)
    requestPaint()
  }
  const onUp = (e: RPointerEvent<SVGSVGElement>) => {
    if (pointer.current?.id !== e.pointerId) return
    pointer.current = null
    pan.current = null
    cancelAnimationFrame(edgeFrame.current)
    const p = toScene(e)
    m.up(p.x, p.y)
    if (svg.current?.hasPointerCapture(e.pointerId)) svg.current.releasePointerCapture(e.pointerId)
    requestPaint()
  }

  const cancelInput = useCallback(() => {
    pointer.current = null
    pan.current = null
    cancelAnimationFrame(edgeFrame.current)
    m.cancel()
    requestPaint()
  }, [m, requestPaint])

  useEffect(() => {
    window.addEventListener('blur', cancelInput)
    return () => {
      window.removeEventListener('blur', cancelInput)
      cancelAnimationFrame(edgeFrame.current)
      cancelAnimationFrame(paint.current)
    }
  }, [cancelInput])

  const focusAt = (x: number, y: number) => {
    const el = wrap.current
    el?.scrollTo({ left: x * scale - el.clientWidth / 2, top: y * scale - el.clientHeight / 2, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  const held = m.held
  const heldTube = held?.item.k === 'tube' ? held.item.id : null
  const zone = m.activeZone()
  const pouring = m.pouring()
  const tubes = m.standing()
  const onBurner = m.onBurner()
  const parkedTip = m.parkedTip()
  const paperId = m.funnel.paperId
  const residue = paperId && lab.vessels.has(paperId) ? residueColour(m.appearanceOf(paperId)) : null

  // where to show depth marks: the tube being poured into or dropped into
  let marksFor: string | null = null
  if (pouring && !pouring.intoFunnel) marksFor = pouring.dest
  else if (m.parked && m.parked.target !== 'funnel') marksFor = m.parked.target.vesselId
  else if (zone?.t === 'tube' && held && ['bottle', 'wash', 'tube', 'dropper'].includes(held.item.k)) marksFor = zone.id

  return (
    <div className="bench-container">
    <div className="bench-wrap" ref={wrap}>
      <svg
        ref={svg}
        className={`bench-scene${held ? ' holding' : ''}`}
        viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
        width={W}
        height={H}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={(e) => { if (pointer.current?.id === e.pointerId) cancelInput() }}
        onLostPointerCapture={(e) => { if (pointer.current?.id === e.pointerId) cancelInput() }}
        role="application"
        aria-label="Laboratory bench"
      >
        <StaticRoom />
        <Clock t={lab.time} fast={m.fast} />

        {/* shelf */}
        {m.shelf.map((s) => {
          const r = REAGENTS[s.reagentId]
          if (s.kind === 'jar') return <Jar key={s.reagentId} x={s.x} label={r.short} colour={jarColour(s.reagentId)} />
          if (s.kind === 'dish') return <PieceDish key={s.reagentId} x={s.x} kind={/Mg/.test(s.reagentId) ? 'ribbon' : 'foil'} label={r.short} />
          if (held?.item.k === 'bottle' && held.item.reagentId === s.reagentId) return <BottleGhost key={s.reagentId} x={s.x} />
          const out = (held?.item.k === 'dropper' && held.item.reagentId === s.reagentId) || m.parked?.reagentId === s.reagentId
          return <DropperBottle key={s.reagentId} x={s.x} label={r.short} tint={r.bottleTint ?? '#d7e7f0'} dropperOut={out} />
        })}

        {/* rack and the tubes standing in it */}
        <RackBack />
        {tubes
          .filter((id) => m.places.get(id)?.at === 'rack')
          .map((id) => (
            <PlacedTube key={id} id={id} a={m.appearanceOf(id)} b={m.boxOf(id)!} badge={m.badges.get(id)} />
          ))}
        <RackFront />
        {tubes
          .filter((id) => lab.vessel(id).stoppered && m.places.get(id)?.at === 'rack')
          .map((id) => {
            const b = m.boxOf(id)!
            return <Stopper key={`st-${id}`} x={b.cx} y={b.rim + 8} w={b.inner + 4} />
          })}

        {/* Bunsen burner */}
        <GasTap on={m.burner.gas} />
        <Burner gas={m.burner.gas} lit={m.burner.lit} air={m.burner.air} flameTint={m.flameTint?.colour ?? null} />
        {onBurner && onBurner !== heldTube && (
          <g>
            <PlacedTube id={onBurner} a={{ ...m.appearanceOf(onBurner), label: '' }} b={m.boxOf(onBurner)!} badge={m.badges.get(onBurner)} />
            {lab.vessel(onBurner).stoppered && <Stopper x={BURNER_X} y={m.boxOf(onBurner)!.rim + 8} w={m.boxOf(onBurner)!.inner + 4} />}
            <TubeHolder b={m.boxOf(onBurner)!} />
          </g>
        )}
        <Matchbox />

        <FunnelStand />
        {!m.funnel.on && held?.item.k !== 'funnel' && <Funnel x={FUNNEL_STAND.x} y={FUNNEL_STAND.y} residue={residue} wet={!!paperId} />}
        {held?.item.k !== 'wash' && <WashBottle x={WASH_BOTTLE.x} y={WASH_BOTTLE.y} />}
        <Waste />
        <Sink />
        {m.funnel.on && m.funnelTip() && <Funnel x={m.funnelTip()!.x} y={m.funnelTip()!.y} residue={residue} wet />}

        {/* front tray */}
        <TubeBoxArt x={TRAY.box['test-tube'].x} kind="test-tube" />
        <TubeBoxArt x={TRAY.box['boiling-tube'].x} kind="boiling-tube" />
        <TubeBoxArt x={TRAY.box['hard-glass-tube'].x} kind="hard-glass-tube" />
        <StopperBox />
        {held?.item.k !== 'spatula' && <Spatula x={TRAY.spatula.x - 26} y={TRAY_Y - 18} />}
        <Booklet x={TRAY['red-litmus'].x} paper="red-litmus" />
        <Booklet x={TRAY['blue-litmus'].x} paper="blue-litmus" />
        <Booklet x={TRAY['universal-indicator'].x} paper="universal-indicator" />
        <SplintBox />
        <PipetteBeaker />
        <WireHolder />
        {held?.item.k !== 'wire' && <Wire x={TRAY.wire.x} y={TRAY_Y - 12} />}
        <Tile />
        {m.tile.map((s, i) => (
          <g key={i} transform={`translate(${TRAY.tile.x - TRAY.tile.w / 2 + 20 + i * 25},${TRAY_Y - 14})`}>
            <Strip x={0} y={0} paper={s.paper} colour={s.colour} damp={s.damp} />
          </g>
        ))}

        {/* highlight what the held item would act on */}
        {held && zone && <ZoneGlow m={m} z={zone} />}
        {marksFor && m.boxOf(marksFor) && <DepthMarks b={m.boxOf(marksFor)!} />}

        {/* a dropper resting in a tube */}
        {m.parked && parkedTip && <ParkedDropper m={m} tip={parkedTip} />}

        {/* the item in the hand */}
        {held && <HeldItem m={m} h={held} />}

        {m.effects.map((e, i) =>
          e.kind === 'pop' ? (
            <path key={i} className="pop-burst" d={`M ${e.x} ${e.y - 26} l 6 14 l 15 -4 l -10 12 l 12 8 l -16 -2 l -7 14 l -6 -14 l -16 2 l 12 -8 l -10 -12 l 15 4 Z`} fill="#ffd64a" stroke="#e08a00" />
          ) : (
            <circle key={i} cx={e.x} cy={e.y} r="12" fill="rgba(255,255,255,0.7)" className="flash" />
          ),
        )}

        {/* hit areas */}
        <g className="hits">
          {/* first in the list = on top */}
          {m.hitRects().slice().reverse().map((r) => (
            <rect key={r.id} data-hit={r.id}
              x={r.x - (coarse ? Math.max(0, 64 - r.w) / 2 : 0)} y={r.y - (coarse ? Math.max(0, 64 - r.h) / 2 : 0)}
              width={coarse ? Math.max(64, r.w) : r.w} height={coarse ? Math.max(64, r.h) : r.h}
              role="button" tabIndex={demo ? -1 : 0} aria-label={m.hitLabel(r.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  const x = r.x + r.w / 2, y = r.y + r.h / 2
                  m.down(r.id, x, y)
                  m.up(x, y)
                  m.bump()
                  requestPaint()
                } else if (e.key === 'Escape') m.cancel()
              }} />
          ))}
        </g>

        {demo && <Demo onEnd={onDemoEnd} />}
      </svg>
    </div>
    <nav className="bench-nav" aria-label="Bench view">
      <button onClick={() => focusAt(460, 140)}>Reagents</button>
      <button onClick={() => focusAt(330, 555)}>Tubes</button>
      <button onClick={() => focusAt(850, 570)}>Burner</button>
      <button onClick={() => focusAt(610, 820)}>Tools</button>
      <button onClick={() => focusAt(1190, 730)}>Wash</button>
      <button aria-label="Zoom out" onClick={() => setZoom(Math.max(0.25, scale - 0.15))}>−</button>
      <button aria-label="Fit bench" onClick={() => { setZoom(fit); wrap.current?.scrollTo(0, 0) }}>Fit</button>
      <button aria-label="Zoom in" onClick={() => setZoom(Math.min(1.5, scale + 0.15))}>+</button>
      {held && <button onClick={() => { m.putBack(); requestPaint() }}>Put back</button>}
    </nav>
    {m.notice && <div className="bench-notice" role="status">{m.notice.text}</div>}
    </div>
  )
}

function BottleGhost({ x }: { x: number }) {
  return <ellipse cx={x} cy={SHELF_Y - 2} rx="30" ry="5" fill="rgba(0,0,0,0.12)" />
}

function jarColour(id: string) {
  if (/MnO2/.test(id)) return '#1d1b1a'
  if (/Zn/.test(id)) return '#9fa4a9'
  return '#f2f2ee'
}

function residueColour(a: Appearance): RGB | null {
  if (a.solid > 0.003) return a.solidRGB as RGB
  if (a.sediment > 0.003) return a.sedimentRGB as RGB
  if (a.turbidity > 0.02) return a.turbidityRGB as RGB
  return null
}

function ZoneGlow({ m, z }: { m: BenchModel; z: Zone }) {
  const glow = (x: number, y: number, w: number, h: number) => <rect x={x} y={y} width={w} height={h} rx="14" className="zone-glow" />
  switch (z.t) {
    case 'tube': {
      const b = m.boxOf(z.id)
      if (!b) return null
      if (z.part === 'mouth') return glow(b.cx - b.inner / 2 - 16, b.rim - 40, b.inner + 32, 56)
      return glow(b.cx - b.inner / 2 - 10, b.rim - 10, b.inner + 20, b.bottom - b.rim + 24)
    }
    case 'funnel': {
      const t = m.funnelTip()!
      return glow(t.x - 52, t.y - 118, 104, 76)
    }
    case 'slot': {
      const b = tubeBox('test-tube', slotX(z.i), RACK_BOTTOM)
      return glow(b.cx - 22, b.rim - 8, 44, b.bottom - b.rim + 16)
    }
    case 'burner': {
      const y = HOLDER_BOTTOM[z.zone]
      return <ellipse cx={BURNER_X} cy={y} rx="40" ry="16" className="zone-glow" />
    }
    case 'flame':
      return <circle cx={BURNER_X} cy={m.flameTop() + 50} r="40" className="zone-glow" />
    case 'nozzle':
      return <circle cx={WASH_BOTTLE.x + 50} cy={WASH_BOTTLE.y - 168} r="26" className="zone-glow" />
    case 'waste':
      return glow(WASTE.x - 60, WASTE.y - 140, 120, 150)
    case 'sink':
      return glow(SINK.x - 64, SINK.y - 60, 128, 70)
    case 'tile':
      return glow(TRAY.tile.x - TRAY.tile.w / 2 - 6, TRAY_Y - 102, TRAY.tile.w + 12, 108)
    case 'stand':
      return <circle cx={FUNNEL_STAND.x} cy={FUNNEL_STAND.y - 70} r="56" className="zone-glow" />
    case 'box':
      return glow(TRAY.box[z.kind].x - 50, TRAY_Y - 100, 100, 112)
    case 'jar': {
      const s = m.shelf.find((x) => x.reagentId === z.reagentId)
      return s ? glow(s.x - 42, SHELF_Y - 112, 84, 116) : null
    }
  }
}

function ParkedDropper({ m, tip }: { m: BenchModel; tip: { x: number; y: number } }) {
  const p = m.parked!
  const tint = REAGENTS[p.reagentId].bottleTint ?? 'rgba(200,220,235,0.8)'
  const squeezed = m.squeezed()
  let surface = tip.y + 60
  if (p.target !== 'funnel') {
    const b = m.boxOf(p.target.vesselId)
    if (b) surface = surfaceY(b, m.vesselKind(p.target.vesselId), m.appearanceOf(p.target.vesselId).liquidLevel)
  }
  return (
    <g>
      <Dropper x={tip.x} y={tip.y} tint={tint} squeeze={squeezed} />
      {squeezed && <circle key={p.drops} cx={tip.x} cy={tip.y + 3} r="3.4" fill={tint} className="falling-drop" style={{ ['--fall' as string]: `${Math.max(10, surface - tip.y - 4)}px` }} />}
    </g>
  )
}

function HeldItem({ m, h }: { m: BenchModel; h: Held }) {
  const it = h.item
  const pour = m.pouring()
  const z = m.activeZone()
  const target = pour && z && (z.t === 'tube' || z.t === 'funnel') ? (z.t === 'funnel' ? m.funnelTip() && { x: m.funnelTip()!.x, y: m.funnelTip()!.y - 116 } : (() => {
    const b = m.boxOf(z.id)
    return b ? { x: b.cx, y: b.rim } : null
  })()) : null
  const destSurface = () => {
    if (!pour) return 0
    if (pour.intoFunnel) return (m.funnelTip()?.y ?? 0) - 80
    const b = m.boxOf(pour.dest)
    return b ? surfaceY(b, m.vesselKind(pour.dest), m.appearanceOf(pour.dest).liquidLevel) : 0
  }
  const lifted = !h.dragging
  const cls = `held${lifted ? ' lifted' : ''}${m.isShaking() ? ' shaking-item' : ''}`

  switch (it.k) {
    case 'tube': {
      const b = tubeBox(m.vesselKind(it.id), h.x, h.y)
      const a = m.appearanceOf(it.id)
      if (target) {
        const T = { x: target.x - 10, y: target.y - 20 }
        const colour = streamColour(a)
        return (
          <g>
            <g transform={`translate(${T.x - b.cx},${T.y - b.rim}) rotate(-112 ${b.cx} ${b.rim})`}>
              <Tube id={`held-${it.id}`} a={{ ...a, liquidLevel: Math.min(a.liquidLevel, 0.04), sediment: 0, turbidity: a.turbidity * 0.5 }} at={{ x: b.x, y: b.y, s: b.s }} />
            </g>
            <Stream x1={T.x} y1={T.y + 2} x2={target.x} y2={destSurface()} colour={colour} />
          </g>
        )
      }
      return (
        <g className={cls} filter="url(#lift)">
          <Tube id={`held-${it.id}`} a={a} badge={m.badges.get(it.id)} at={{ x: b.x, y: b.y, s: b.s }} />
          {m.lab.vessel(it.id).stoppered && <Stopper x={b.cx} y={b.rim + 8} w={b.inner + 4} />}
        </g>
      )
    }
    case 'bottle': {
      const r = REAGENTS[it.reagentId]
      const tint = r.bottleTint ?? '#d7e7f0'
      if (target) {
        const T = { x: target.x - 8, y: target.y - 22 }
        return (
          <g>
            <g transform={`translate(${T.x},${T.y}) rotate(-118) translate(0,134)`}>
              <BottleBody label={r.short} tint={tint} />
            </g>
            <Stream x1={T.x} y1={T.y} x2={target.x} y2={destSurface()} colour={streamRGB(r.bottleTint)} />
          </g>
        )
      }
      return (
        <g className={cls} transform={`translate(${h.x},${h.y})`} filter="url(#lift)">
          <BottleBody label={r.short} tint={tint} />
        </g>
      )
    }
    case 'wash': {
      if (target) {
        const nx = target.x + 4
        const ny = target.y - 40
        return (
          <g>
            <WashBottle x={nx - 44} y={ny + 176} />
            <Stream x1={nx} y1={ny} x2={target.x} y2={destSurface()} colour="rgba(200,225,240,0.8)" />
          </g>
        )
      }
      return (
        <g className={cls} filter="url(#lift)">
          <WashBottle x={h.x} y={h.y} />
        </g>
      )
    }
    case 'dropper':
      return (
        <g className={cls} filter="url(#lift)">
          <Dropper x={h.x} y={h.y} tint={REAGENTS[it.reagentId].bottleTint ?? 'rgba(200,220,235,0.8)'} />
        </g>
      )
    case 'newtube': {
      const b = tubeBox(it.kind, h.x, h.y)
      return (
        <g className={cls} filter="url(#lift)">
          <Tube id="new-tube" a={EMPTY_TUBE(it.kind)} at={{ x: b.x, y: b.y, s: b.s }} />
        </g>
      )
    }
    case 'stopper':
      return (
        <g className={cls} filter="url(#lift)">
          <Stopper x={h.x} y={h.y} />
        </g>
      )
    case 'spatula':
      return (
        <g className={cls} filter="url(#lift)">
          <Spatula x={h.x} y={h.y} load={it.colour} />
        </g>
      )
    case 'piece':
      return (
        <g className={cls} transform={`translate(${h.x},${h.y})`} filter="url(#lift)">
          {/Mg/.test(it.reagentId) ? <rect x="-22" y="-4" width="44" height="5" rx="1.5" fill="#b9bdc2" stroke="#7d8287" /> : <path d="M -14 0 l 8 -9 l 9 4 l 8 -7 l 7 9 l -11 6 Z" fill="#d7dade" stroke="#8a9096" />}
        </g>
      )
    case 'match':
      return (
        <g className={cls}>
          <Match x={h.x} y={h.y} lit />
        </g>
      )
    case 'splint':
      return (
        <g className={cls}>
          <Splint x={h.x} y={h.y} state={it.state} />
        </g>
      )
    case 'strip':
      return (
        <g className={cls} filter="url(#lift)">
          <Strip x={h.x} y={h.y} paper={it.paper} colour={it.colour} damp={it.damp} />
        </g>
      )
    case 'pipette':
      return (
        <g className={cls} filter="url(#lift)">
          <Pipette x={h.x} y={h.y} tint={gasTint(it.gas)} />
        </g>
      )
    case 'wire':
      return (
        <g className={cls}>
          <Wire x={h.x} y={h.y} loaded={it.colour} />
        </g>
      )
    case 'funnel': {
      const pid = m.funnel.paperId
      const res = pid && m.lab.vessels.has(pid) ? residueColour(m.appearanceOf(pid)) : null
      return (
        <g className={cls} filter="url(#lift)">
          <Funnel x={h.x} y={h.y} residue={res} wet={!!pid} />
        </g>
      )
    }
  }
}

function streamColour(a: Appearance) {
  if (a.liquidLevel <= 0.004) return rgb(a.solidRGB as RGB, 0.95)
  const c = a.liquidRGB as RGB
  return rgb(c, 0.55 + a.liquidAlpha * 0.4)
}
function streamRGB(tint?: string) {
  return tint ?? 'rgba(205,225,238,0.85)'
}
function gasTint(gas: Map<string, number> | null): RGB | null {
  if (!gas) return null
  if ((gas.get('NO2(g)') ?? 0) > 0.002) return [170, 80, 30]
  if ((gas.get('Cl2(g)') ?? 0) > 0.002) return [190, 210, 80]
  if ((gas.get('I2(g)') ?? 0) > 0.0005) return [120, 40, 140]
  return [235, 240, 244]
}
