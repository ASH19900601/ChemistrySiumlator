import { describe, expect, test } from 'vitest'
import { Lab } from '../../../engine'
import { paperById } from '../../../papers'
import { BenchModel, type Item } from '../model'
import { BURNER_X, BURNER_TOP, RACK_BOTTOM, slotX } from '../layout'

function setup() {
  const paper = paperById('0620_s24_51')!
  const m = new BenchModel(new Lab({ samples: paper.samples, reagents: paper.reagents }), paper)
  const v = m.lab.newVessel('test-tube')
  m.places.set(v.id, { at: 'rack', slot: 2 })
  let now = 1000
  const wait = (ms = 1000) => {
    for (let t = 0; t < ms; t += 100) m.step(0.1, now += 100)
  }
  const lift = (item: Item) => { m.held = { item, x: 700, y: 400, dragging: false, ox: 0, oy: 0 } }
  const tap = (id: string | null, x: number, y: number) => { m.down(id, x, y); m.up(x, y) }
  const atTube = () => { const b = m.boxOf(v.id)!; return [b.cx, b.bottom - 10] as const }
  const park = () => {
    lift({ k: 'dropper', reagentId: 'NaOH' })
    tap(`tube:${v.id}`, ...atTube())
    expect(m.parked).not.toBeNull()
  }
  return { m, v, wait, lift, tap, atTube, park }
}

describe('reported bench regressions', () => {
  test('R01 tap mode loads a flame-test wire from a solution', () => {
    const { m, v, lift, atTube, wait } = setup()
    v.receive({ 'Na+': 1, 'Cl-': 1 }, 2)
    lift({ k: 'wire', reading: null, colour: null })
    m.down(`tube:${v.id}`, ...atTube())
    wait()
    expect(m.held?.item).toMatchObject({ reading: 'Yellow flame.' })
  })

  test('R02 sliding after a long press moves the lifted bottle and stops the pour', () => {
    const { m, v, lift, atTube, wait } = setup()
    lift({ k: 'bottle', reagentId: 'NaOH' })
    m.down(`tube:${v.id}`, ...atTube())
    wait()
    m.move(900, 300)
    expect(m.held?.dragging).toBe(true)
    const volume = v.V
    wait()
    expect(v.V).toBe(volume)
  })

  test('R03 cancelling input stops a lifted tool from collecting gas unattended', () => {
    const { m, v, lift, tap, wait } = setup()
    v.headspace.set('CO2(g)', 1)
    lift({ k: 'pipette', gas: null })
    const b = m.boxOf(v.id)!
    tap(`tube:${v.id}`, b.cx, b.rim + 20)
    m.cancel()
    wait()
    expect(v.headspace.get('CO2(g)')).toBeGreaterThan(0.9)
    expect(m.held).toBeNull()
  })

  test('R04 an expired match cannot ignite the burner on its last tick', () => {
    const { m, lift, wait } = setup()
    m.burner.gas = true
    lift({ k: 'match', until: 1500 })
    m.held!.x = BURNER_X
    m.held!.y = BURNER_TOP - 20
    m.step(0.1, 1400)
    wait(1000)
    expect(m.burner.lit).toBe(false)
  })

  test('R05 stopper insertion detaches the parked dropper', () => {
    const { m, v, lift, tap, atTube, park } = setup()
    park()
    lift({ k: 'stopper' })
    tap(`tube:${v.id}`, ...atTube())
    expect(v.stoppered).toBe(true)
    expect(m.parked).toBeNull()
  })

  test('R06 lifting a funnel detaches its dropper before changing the receiver', () => {
    const { m, v, lift, tap } = setup()
    m.funnel = { on: v.id, paperId: m.lab.newVessel('filter-paper').id }
    lift({ k: 'dropper', reagentId: 'NaOH' })
    tap('funnel', slotX(2), 440)
    tap('funnel', slotX(2), 440)
    expect(m.parked).toBeNull()
  })

  test('R07 lifting the funnel receiver cannot leave a dangling parked dropper', () => {
    const { m, v, lift, tap } = setup()
    m.funnel = { on: v.id, paperId: m.lab.newVessel('filter-paper').id }
    lift({ k: 'dropper', reagentId: 'NaOH' })
    tap('funnel', slotX(2), 440)
    tap(`tube:${v.id}`, slotX(2), RACK_BOTTOM - 10)
    expect(m.parked).toBeNull()
  })

  test('R08 a heating record resumes after another action uses the same vessel', () => {
    const { m, v, wait } = setup()
    m.places.set(v.id, { at: 'burner', zone: 'low' })
    m.burner = { lit: true, gas: true, air: true }
    wait()
    m.lab.agitate(v.id)
    wait()
    expect(m.heat && m.lab.isOpen(m.heat.action)).toBe(true)
  })

  test('R09 filtering a dry solid still records the material transferred', () => {
    const { m, v, lift, wait } = setup()
    const source = m.lab.sampleVessel('E')
    source.stoppered = false
    m.funnel = { on: v.id, paperId: m.lab.newVessel('filter-paper').id }
    lift({ k: 'tube', id: source.id })
    m.held!.dragging = true
    m.hover = { t: 'funnel' }
    wait()
    m.putBack()
    wait(5000)
    expect(m.lab.journal.some(j => /filter paper/.test(j.action))).toBe(true)
  })

  test('R10 a pour interrupted by a second action resumes with an open record', () => {
    const { m, v, lift, atTube, wait } = setup()
    lift({ k: 'bottle', reagentId: 'NaOH' })
    m.down(`tube:${v.id}`, ...atTube())
    wait()
    m.lab.agitate(v.id)
    wait()
    expect(m.pour && m.lab.isOpen(m.pour.action)).toBe(true)
  })
})
