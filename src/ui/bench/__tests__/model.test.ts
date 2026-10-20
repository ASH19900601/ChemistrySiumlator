// The bench is driven with simulated pointer gestures (scene coordinates), as a student would.
import { describe, expect, test } from 'vitest'
import { Lab } from '../../../engine'
import { paperById } from '../../../papers'
import { BURNER_TOP, BURNER_X, CLOCK, GAS_TAP, HOLDER_BOTTOM, MATCHBOX, RACK_BOTTOM, SHELF_Y, slotX, TRAY, TRAY_Y, WASTE, tubeBox } from '../layout'
import { BenchModel } from '../model'

function bench(paperId = '0620_s24_51') {
  const paper = paperById(paperId)!
  const m = new BenchModel(new Lab({ samples: paper.samples, reagents: paper.reagents }), paper)
  let now = 0
  const hitAt = (x: number, y: number) => m.hitRects().find((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h)?.id ?? null
  const wait = (ms: number) => {
    for (let t = 0; t < ms; t += 100) m.step(0.1, (now += 100))
  }
  const tap = (x: number, y: number) => {
    m.down(hitAt(x, y), x, y)
    wait(100)
    m.up(x, y)
    wait(100)
  }
  /** press at `from`, slide to `to`, stay there `hold` ms, release */
  const drag = (from: [number, number], to: [number, number], hold = 200) => {
    m.down(hitAt(...from), ...from)
    for (let i = 1; i <= 10; i++) {
      m.move(from[0] + ((to[0] - from[0]) * i) / 10, from[1] + ((to[1] - from[1]) * i) / 10)
      m.step(0.016, (now += 16))
    }
    wait(hold)
    m.up(...to)
    wait(100)
  }
  const last = () => {
    const j = m.lab.journal[m.lab.journal.length - 1]
    return j ? `${j.action} | ${j.observations.map((o) => o.text).join(' ')}` : ''
  }
  const vesselIn = (slot: number) => [...m.places].find(([, p]) => p.at === 'rack' && p.slot === slot)?.[0]
  return { m, tap, drag, wait, last, vesselIn }
}

const rim = (kind: 'test-tube' | 'boiling-tube', slot: number) => tubeBox(kind, slotX(slot), RACK_BOTTOM).rim

describe('bench gestures', () => {
  test('samples stand in the rack with the clean tubes; tapping a box puts a clean tube in the next slot', () => {
    const { m, tap, vesselIn } = bench()
    expect(m.lab.vessel(vesselIn(0)!).label).toBe('solid E')
    tap(TRAY.box['test-tube'].x, TRAY_Y - 50)
    expect(m.lab.vessel(vesselIn(1)!).label).toBe('test-tube 1')
  })

  test('a stoppered sample cannot be poured into; pulling the stopper off opens it', () => {
    const { m, drag, wait, vesselIn } = bench()
    const E = vesselIn(0)!
    const r = rim('boiling-tube', 0)
    // NaOH bottle held over E: nothing happens while the stopper is in
    drag([bottleX0(), SHELF_Y - 60], [slotX(0) - 6, r - 30 + 134 - 0], 1500)
    expect(m.lab.vessel(E).V).toBe(0)
    // pull the stopper off and drop it anywhere
    drag([slotX(0), r - 14], [300, 380], 100)
    expect(m.lab.vessel(E).stoppered).toBe(false)
    expect(m.held).toBeNull()
    drag([bottleX0(), SHELF_Y - 60], [slotX(0) - 6, r - 30 + 134], 1500)
    wait(5000)
    expect(m.lab.vessel(E).V).toBeGreaterThan(0.8)
  })

  test('holding a bottle over a tube pours for as long as it is held there', () => {
    const { m, tap, drag, wait, last, vesselIn } = bench()
    tap(TRAY.box['test-tube'].x, TRAY_Y - 50)
    const t = vesselIn(1)!
    drag([bottleX0(), SHELF_Y - 60], [slotX(1) - 6, rim('test-tube', 1) - 30 + 134], 2250)
    expect(m.lab.vessel(t).V).toBeGreaterThan(1.6)
    expect(m.lab.vessel(t).V).toBeLessThan(2.4)
    wait(5000)
    expect(last()).toMatch(/^Pour about 2(\.\d)? cm³ \(≈ 1\.\d cm depth\) of aqueous sodium hydroxide into test-tube 1/)
  })

  test('a dropper parked in a tube gives one drop per squeeze', () => {
    const { m, tap, drag, wait, last, vesselIn } = bench()
    tap(TRAY.box['test-tube'].x, TRAY_Y - 50)
    const t = vesselIn(1)!
    const r = rim('test-tube', 1)
    drag([bottleX0(), SHELF_Y - 160], [slotX(1), r - 70 - 10], 100)
    expect(m.parked?.target).toEqual({ vesselId: t })
    for (let i = 0; i < 3; i++) tap(slotX(1), r - 60)
    expect(m.lab.vessel(t).V).toBeCloseTo(0.15, 5)
    // take the dropper away: the drops are written up
    drag([slotX(1), r - 60], [bottleX0(), SHELF_Y - 160], 100)
    wait(4000)
    expect(last()).toMatch(/^Add 3 drops of aqueous sodium hydroxide to test-tube 1/)
  })

  test('burner: gas on, match to the burner, tube in the flame heats; taking it out writes it up', () => {
    const { m, drag, tap, wait, last, vesselIn } = bench()
    tap(GAS_TAP.x - 12, GAS_TAP.y - 8)
    expect(m.burner.gas).toBe(true)
    drag([MATCHBOX.x, MATCHBOX.y], [BURNER_X, BURNER_TOP - 60], 500)
    expect(m.burner.lit).toBe(true)
    const E = vesselIn(0)!
    // take the stopper out first (heating a stoppered tube blows it out)
    drag([slotX(0), rim('boiling-tube', 0) - 14], [300, 380], 100)
    drag([slotX(0), RACK_BOTTOM - 80], [BURNER_X, HOLDER_BOTTOM.low - 80], 100)
    expect(m.places.get(E)).toEqual({ at: 'burner', zone: 'low' })
    tap(CLOCK.x, CLOCK.y)
    wait(3000)
    expect(m.lab.vessel(E).T).toBeGreaterThan(200)
    tap(CLOCK.x, CLOCK.y)
    drag([BURNER_X, HOLDER_BOTTOM.low - 80], [slotX(0), RACK_BOTTOM - 80], 100)
    wait(3000)
    expect(last()).toMatch(/^Heat the solid strongly for \d+ s \| .*[Cc]ondensation/)
    expect(m.lab.vessel(E).heating).toBeNull()
  })

  test('tap mode: tap a bottle to lift it, press and hold on a tube to pour, tap the bench to put it back', () => {
    const { m, tap, wait, vesselIn } = bench()
    tap(TRAY.box['test-tube'].x, TRAY_Y - 50)
    const t = vesselIn(1)!
    tap(bottleX0(), SHELF_Y - 60)
    expect(m.held?.item.k).toBe('bottle')
    const x = slotX(1)
    const y = rim('test-tube', 1) + 60
    m.down(`tube:${t}`, x, y)
    wait(1700)
    m.up(x, y)
    wait(100)
    expect(m.lab.vessel(t).V).toBeGreaterThan(1)
    tap(600, 420)
    expect(m.held).toBeNull()
  })

  test('splint: lit in the flame, blown out (tap) to a glowing splint', () => {
    const { m, tap, drag } = bench()
    tap(GAS_TAP.x - 12, GAS_TAP.y - 8)
    drag([MATCHBOX.x, MATCHBOX.y], [BURNER_X, BURNER_TOP - 60], 400)
    drag([TRAY.splints.x, TRAY_Y - 40], [BURNER_X, BURNER_TOP - 40 - 60], 700)
    expect(m.held?.item).toMatchObject({ k: 'splint', state: 'burning' })
    tap(m.held!.x, m.held!.y - 40)
    expect(m.held?.item).toMatchObject({ k: 'splint', state: 'glowing' })
  })

  test('emptying a tube into the waste beaker', () => {
    const { m, tap, drag, wait, vesselIn } = bench()
    tap(TRAY.box['test-tube'].x, TRAY_Y - 50)
    const t = vesselIn(1)!
    drag([bottleX0(), SHELF_Y - 60], [slotX(1) - 6, rim('test-tube', 1) - 30 + 134], 1500)
    wait(4000)
    drag([slotX(1), RACK_BOTTOM - 60], [WASTE.x, WASTE.y - 20], 100)
    expect(m.lab.vessel(t).V).toBeLessThan(0.05)
    expect(m.places.get(t)).toEqual({ at: 'rack', slot: 1 })
  })
})

describe('tools', () => {
  function kit(paperId: string) {
    const b = bench(paperId)
    const { m, drag, tap } = b
    /** press on the item in the hand and move it so its tip / anchor ends at (x, y) */
    const heldTo = (x: number, y: number, hold = 200) => {
      const r = m.heldRect(m.held!)
      const p: [number, number] = [r.x + r.w / 2, r.y + r.h / 2]
      drag(p, [x - (m.held!.x - p[0]), y - (m.held!.y - p[1])], hold)
    }
    const box = (id: string) => m.boxOf(id)!
    const shelfX = (rid: string) => m.shelf.find((s) => s.reagentId === rid)!.x
    /** pour from a bottle into a tube for `ms` */
    const pour = (rid: string, id: string, ms: number) => drag([shelfX(rid), SHELF_Y - 60], [box(id).cx - 6, box(id).rim + 44], ms)
    const newTube = () => {
      tap(TRAY.box['test-tube'].x, TRAY_Y - 50)
      return [...m.places.keys()].pop()!
    }
    const unstopper = (id: string) => drag([box(id).cx, box(id).rim - 14], [600, 400], 100)
    return { ...b, heldTo, box, shelfX, pour, newTube, unstopper }
  }

  test('spatula and teat pipette: carbonate in acid, gas bubbled through limewater', () => {
    const { m, drag, wait, last, heldTo, box, pour, newTube, unstopper } = kit('0620_s24_52')
    const H = m.lab.samples.get('H')!
    unstopper(H)
    const acid = newTube()
    const lime = newTube()
    pour('HNO3', acid, 1600)
    pour('limewater', lime, 1600)
    wait(5000)
    // a spatula measure of H into the acid
    drag([TRAY.spatula.x, TRAY_Y - 60], [box(H).cx + 30, box(H).bottom - 58], 100)
    expect(m.held?.item).toMatchObject({ k: 'spatula' })
    expect((m.held!.item as { load: unknown }).load).not.toBeNull()
    heldTo(box(acid).cx, box(acid).bottom - 12)
    expect((m.held!.item as { load: unknown }).load).toBeNull()
    wait(500)
    // pipette: squeeze at the mouth of the acid tube, then into the limewater
    drag([TRAY.pipettes.x, TRAY_Y - 60], [box(acid).cx, box(acid).rim - 8 - 70], 700)
    expect((m.held!.item as { gas: unknown }).gas).not.toBeNull()
    heldTo(box(lime).cx, box(lime).bottom - 10, 600)
    expect(last()).toMatch(/limewater turns milky/)
  })

  test('flame-test wire: dipped in the solid, held in the blue flame', () => {
    const { m, drag, tap, last, heldTo, box, unstopper } = kit('0620_s24_52')
    const H = m.lab.samples.get('H')!
    unstopper(H)
    tap(GAS_TAP.x - 12, GAS_TAP.y - 8)
    drag([MATCHBOX.x, MATCHBOX.y], [BURNER_X, BURNER_TOP - 60], 400)
    drag([TRAY.wire.x, TRAY_Y - 80], [box(H).cx, box(H).bottom - 10 - 64], 500)
    expect((m.held!.item as { reading: string }).reading).toMatch(/flame/)
    heldTo(BURNER_X, BURNER_TOP - 60, 600)
    expect(last()).toMatch(/^Flame test on the contents of solid H \| .*flame/)
    expect(m.flameTint).not.toBeNull()
  })

  test('damp litmus at the mouth vs. dry litmus', () => {
    const { m, drag, wait, last, heldTo, box, pour, newTube } = kit('0620_s24_51')
    const t = newTube()
    pour('NaOH', t, 1500)
    wait(5000)
    // dry strip at the mouth
    drag([TRAY['red-litmus'].x, TRAY_Y - 40], [box(t).cx, box(t).rim - 8 - 60], 900)
    expect(last()).toMatch(/dry red litmus paper does not change/)
    // dampen it at the wash bottle nozzle, then back to the mouth
    heldTo(1132 + 50, 700 - 168, 500)
    expect((m.held!.item as { damp: boolean }).damp).toBe(true)
    heldTo(box(t).cx, box(t).rim - 8, 900)
    expect(last()).toMatch(/^Hold damp red litmus paper at the mouth of the tube \| No change/)
  })

  test('funnel on a tube: what is poured into it runs through the paper into the tube below', () => {
    const { m, drag, wait, last, box, pour, newTube } = kit('0620_s24_51')
    const a = newTube()
    const b = newTube()
    pour('AgNO3', a, 1500)
    // the funnel onto tube b
    drag([1036, 500], [box(b).cx, box(b).rim + 40 - 90], 100)
    expect(m.funnel.on).toBe(b)
    wait(5000)
    // pour a into the funnel
    const t = box(a)
    drag([t.cx, t.bottom - 60], [box(b).cx - 10, box(b).rim + 40 - 140 + 60], 1600)
    wait(5000)
    expect(last()).toMatch(/through the filter paper into test-tube 2 \| The filtrate is colourless\./)
    expect(m.lab.vessel(b).V).toBeGreaterThan(0.5)
  })
})

function bottleX0() {
  return 54
}
