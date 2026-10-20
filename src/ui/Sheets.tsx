import { useState, type ReactNode } from 'react'
import { appearance, GAS_TEST_LABELS, REAGENTS, type Amount, type GasTest, type HeatMode, type Lab, type VesselKind } from '../engine'
import { Tube } from './Tube'

export function Sheet({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className={`sheet${wide ? ' wide' : ''}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="sheet-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  )
}

export function VesselPicker({ lab, onPick, exclude, allowNew = true }: { lab: Lab; onPick: (id: string | VesselKind) => void; exclude?: string; allowNew?: boolean }) {
  const vessels = [...lab.vessels.values()].filter((v) => v.id !== exclude && v.kind !== 'filter-paper')
  return (
    <div className="vessel-picker">
      {vessels.map((v) => (
        <button key={v.id} className="pick-vessel" onClick={() => onPick(v.id)}>
          <Tube a={appearance(v)} id={`pick-${v.id}`} />
        </button>
      ))}
      {allowNew && (
        <>
          <button className="pick-new" onClick={() => onPick('test-tube')}>
            + new test-tube
          </button>
          <button className="pick-new" onClick={() => onPick('boiling-tube')}>
            + new boiling tube
          </button>
          <button className="pick-new" onClick={() => onPick('hard-glass-tube')}>
            + new hard-glass test-tube
          </button>
        </>
      )}
    </div>
  )
}

// ------------------------------------------------------------------ add reagent (dropper)
export function ReagentSheet({
  lab,
  reagentId,
  vesselId,
  onAdd,
  onClose,
  onPickVessel,
  feedback,
}: {
  lab: Lab
  reagentId: string
  vesselId: string | null
  onAdd: (vesselId: string, amount: Amount) => void
  onClose: () => void
  onPickVessel: (id: string | VesselKind) => void
  feedback?: ReactNode
}) {
  const r = REAGENTS[reagentId]
  const [custom, setCustom] = useState('')
  const [unit, setUnit] = useState<'depth' | 'cm3'>('depth')
  if (!vesselId) {
    return (
      <Sheet title={`Add ${r.label} to…`} onClose={onClose} wide>
        <VesselPicker lab={lab} onPick={onPickVessel} />
      </Sheet>
    )
  }
  const v = lab.vessel(vesselId)
  const add = (a: Amount) => onAdd(vesselId, a)
  return (
    <Sheet title={`${r.label} → ${v.label}`} onClose={onClose} wide>
      <div className="dropper-layout">
        <div className="dropper-preview">
          <Tube a={appearance(v)} id={`sheet-${v.id}`} big />
        </div>
        <div className="dropper-controls">
          {r.kind === 'solution' ? (
            <>
              <button className="btn primary big" onClick={() => add({ drops: 1 })}>
                Add 1 drop
              </button>
              <div className="chip-row">
                <button className="chip" onClick={() => add({ drops: 5 })}>a few drops (5)</button>
                <button className="chip" onClick={() => add({ depth: 0.5 })}>0.5 cm depth</button>
                <button className="chip" onClick={() => add({ depth: 1 })}>1 cm depth</button>
                <button className="chip" onClick={() => add({ depth: 2 })}>2 cm depth</button>
                <button className="chip" onClick={() => add({ depth: 4 })}>4 cm depth</button>
                <button className="chip" onClick={() => add({ depth: 5 })}>5 cm depth</button>
              </div>
              <form
                className="custom-row"
                onSubmit={(e) => {
                  e.preventDefault()
                  const x = parseFloat(custom)
                  if (x > 0) add(unit === 'depth' ? { depth: x } : { cm3: x })
                }}
              >
                <input inputMode="decimal" placeholder="amount" value={custom} onChange={(e) => setCustom(e.target.value)} aria-label="custom amount" />
                <select value={unit} onChange={(e) => setUnit(e.target.value as 'depth' | 'cm3')} aria-label="unit">
                  <option value="depth">cm depth</option>
                  <option value="cm3">cm³</option>
                </select>
                <button className="btn" type="submit">
                  Add
                </button>
              </form>
            </>
          ) : r.kind === 'piece' ? (
            <button className="btn primary big" onClick={() => add({ pieces: 1 })}>
              Add one piece
            </button>
          ) : (
            <div className="chip-row">
              <button className="btn primary" onClick={() => add({ spatula: 'small' })}>small spatula measure</button>
              <button className="btn primary" onClick={() => add({ spatula: 'normal' })}>spatula measure</button>
            </div>
          )}
          <p className="hint">Liquid in tube: {v.V.toFixed(1)} cm³ (≈ {(v.V / v.spec.area).toFixed(1)} cm depth)</p>
          {feedback}
        </div>
      </div>
    </Sheet>
  )
}

// ------------------------------------------------------------------ pour / transfer
export function TransferSheet({ lab, fromId, onDo, onClose }: { lab: Lab; fromId: string; onDo: (to: string | VesselKind, amount: Amount) => void; onClose: () => void }) {
  const from = lab.vessel(fromId)
  const [target, setTarget] = useState<string | VesselKind | null>(null)
  const wet = from.wet
  const targetLabel = target ? (lab.vessels.get(target) ? lab.vessel(target).label : `a new ${target.replace('-', ' ')}`) : ''
  return (
    <Sheet title={wet ? `Pour from ${from.label}` : `Transfer solid from ${from.label}`} onClose={onClose} wide>
      {!target ? (
        <>
          <p className="hint">Choose where it goes:</p>
          <VesselPicker lab={lab} exclude={fromId} onPick={setTarget} />
        </>
      ) : (
        <>
          <p className="hint">Into {targetLabel}. How much?</p>
          <div className="chip-row">
            {wet ? (
              <>
                <button className="chip" onClick={() => onDo(target, { depth: 1 })}>1 cm depth</button>
                <button className="chip" onClick={() => onDo(target, { depth: 2 })}>2 cm depth</button>
                <button className="chip" onClick={() => onDo(target, { depth: 4 })}>4 cm depth</button>
                <button className="chip" onClick={() => onDo(target, { fraction: 0.5 })}>about half</button>
                <button className="chip" onClick={() => onDo(target, { all: true })}>all</button>
              </>
            ) : (
              <>
                <button className="chip" onClick={() => onDo(target, { spatula: 'small' })}>small spatula measure</button>
                <button className="chip" onClick={() => onDo(target, { spatula: 'normal' })}>spatula measure</button>
                <button className="chip" onClick={() => onDo(target, { fraction: 0.5 })}>about half</button>
                <button className="chip" onClick={() => onDo(target, { all: true })}>all of it</button>
              </>
            )}
          </div>
          <button className="btn link" onClick={() => setTarget(null)}>
            ← choose another tube
          </button>
        </>
      )}
    </Sheet>
  )
}

export function DivideSheet({ lab, fromId, onDo, onClose }: { lab: Lab; fromId: string; onDo: (kinds: VesselKind[]) => void; onClose: () => void }) {
  const from = lab.vessel(fromId)
  const [bt, setBt] = useState(1)
  const [tt, setTt] = useState(3)
  return (
    <Sheet title={`Divide ${from.label} into portions`} onClose={onClose}>
      <p className="hint">The contents are shared equally between new, clean tubes.</p>
      <div className="stepper-row">
        <label>Boiling tubes</label>
        <Stepper value={bt} set={setBt} />
      </div>
      <div className="stepper-row">
        <label>Test-tubes</label>
        <Stepper value={tt} set={setTt} />
      </div>
      <button
        className="btn primary"
        disabled={bt + tt < 2}
        onClick={() => onDo([...Array(bt).fill('boiling-tube'), ...Array(tt).fill('test-tube')] as VesselKind[])}
      >
        Divide into {bt + tt} portions
      </button>
    </Sheet>
  )
}

function Stepper({ value, set }: { value: number; set: (n: number) => void }) {
  return (
    <div className="stepper">
      <button className="icon-btn" onClick={() => set(Math.max(0, value - 1))} aria-label="fewer">
        −
      </button>
      <span>{value}</span>
      <button className="icon-btn" onClick={() => set(Math.min(7, value + 1))} aria-label="more">
        +
      </button>
    </div>
  )
}

export function HeatSheet({ lab, vesselId, onDo, onClose }: { lab: Lab; vesselId: string; onDo: (mode: HeatMode, s: number) => void; onClose: () => void }) {
  const v = lab.vessel(vesselId)
  const [secs, setSecs] = useState(30)
  const modes: [HeatMode, string][] = v.wet
    ? [['warm', 'Warm gently'], ['boil', 'Heat to boiling']]
    : [['gentle', 'Heat gently'], ['strong', 'Heat strongly']]
  return (
    <Sheet title={`Heat ${v.label}`} onClose={onClose}>
      {v.stoppered && <p className="warn">Remove the stopper before heating!</p>}
      {!v.spec.heatProof && !v.wet && <p className="warn">Strong heating of a solid needs a hard-glass test-tube or boiling tube.</p>}
      <div className="chip-row">
        {[10, 20, 30, 60, 90].map((s) => (
          <button key={s} className={`chip${s === secs ? ' on' : ''}`} onClick={() => setSecs(s)}>
            {s} s
          </button>
        ))}
      </div>
      <div className="chip-row">
        {modes.map(([m, label]) => (
          <button key={m} className="btn primary" disabled={v.stoppered} onClick={() => onDo(m, secs)}>
            {label}
          </button>
        ))}
      </div>
    </Sheet>
  )
}

export function StandSheet({ onDo, onClose }: { onDo: (s: number) => void; onClose: () => void }) {
  return (
    <Sheet title="Leave to stand" onClose={onClose}>
      <div className="chip-row">
        {[
          [30, '30 s'],
          [60, '1 min'],
          [120, '2 min'],
          [180, '3 min'],
          [300, '5 min'],
        ].map(([s, l]) => (
          <button key={s} className="btn" onClick={() => onDo(s as number)}>
            {l}
          </button>
        ))}
      </div>
    </Sheet>
  )
}

export function GasSheet({ onDo, onClose }: { onDo: (t: GasTest) => void; onClose: () => void }) {
  return (
    <Sheet title="Test the gas at the mouth of the tube" onClose={onClose}>
      <div className="chip-row">
        {(Object.keys(GAS_TEST_LABELS) as GasTest[]).map((t) => (
          <button key={t} className="btn" onClick={() => onDo(t)}>
            {GAS_TEST_LABELS[t]}
          </button>
        ))}
      </div>
    </Sheet>
  )
}
