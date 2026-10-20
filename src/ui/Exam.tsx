import { useCallback, useEffect, useRef, useState } from 'react'
import { appearance, Lab, REAGENTS, type ActionResult, type Amount, type GasTest, type HeatMode, type VesselKind } from '../engine'
import type { PaperCase } from '../papers'
import { ReagentBottle, ToolIcon, TOOL_LABELS, type ToolId } from './Apparatus'
import { PaperPane, type Answers } from './PaperPane'
import { ResultVisual } from './ResultVisual'
import { DivideSheet, GasSheet, HeatSheet, ReagentSheet, StandSheet, TransferSheet } from './Sheets'
import { load, save } from './storage'
import { Tube, type BusyKind } from './Tube'

type SheetState =
  | { kind: 'reagent'; reagentId: string; vesselId: string | null }
  | { kind: 'transfer'; fromId: string }
  | { kind: 'divide'; fromId: string }
  | { kind: 'heat'; vesselId: string }
  | { kind: 'stand'; vesselId: string }
  | { kind: 'gas'; vesselId: string }

type Tab = 'lab' | 'paper' | 'notes'

const MAX_VESSELS = 18

export function Exam({ paper, onFinish, onExit }: { paper: PaperCase; onFinish: (answers: Answers, lab: Lab) => void; onExit: () => void }) {
  const labRef = useRef<Lab>()
  if (!labRef.current) labRef.current = new Lab({ samples: paper.samples, reagents: paper.reagents })
  const lab = labRef.current
  const [, setVersion] = useState(0)
  const bump = useCallback(() => setVersion((v) => v + 1), [])
  const [active, setActive] = useState<string | null>(null)
  const [sheet, setSheet] = useState<SheetState | null>(null)
  const [busy, setBusy] = useState<{ id: string | null; kind: BusyKind } | null>(null)
  const busyRef = useRef(false)
  const [last, setLast] = useState<ActionResult | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('lab')
  const [sideTab, setSideTab] = useState<'paper' | 'notes'>('paper')
  const [showText, setShowText] = useState<boolean>(() => load('show-text', false))
  const [answers, setAnswers] = useState<Answers>(() => load(`answers:${paper.id}`, {}))
  const [notes, setNotes] = useState<string>(() => load(`notes:${paper.id}`, ''))
  const [started] = useState(() => Date.now())
  const [now, setNow] = useState(Date.now())

  useEffect(() => save('show-text', showText), [showText])
  useEffect(() => save(`answers:${paper.id}`, answers), [paper.id, answers])
  useEffect(() => save(`notes:${paper.id}`, notes), [paper.id, notes])

  // real time passes on the bench: precipitates settle, bubbling stops, Fe(OH)2 darkens …
  useEffect(() => {
    const t = setInterval(() => {
      setNow(Date.now())
      if (!busyRef.current) {
        lab.tick(2)
        bump()
      }
    }, 2000)
    return () => clearInterval(t)
  }, [lab, bump])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const run = useCallback(
    (id: string | null, kind: BusyKind, fn: () => ActionResult | void, delay = 650) => {
      if (busyRef.current) return
      busyRef.current = true
      setBusy({ id, kind })
      setTimeout(() => {
        try {
          const r = fn()
          if (r) setLast(r)
        } catch (e) {
          setToast((e as Error).message)
        }
        busyRef.current = false
        setBusy(null)
        bump()
      }, delay)
    },
    [bump],
  )

  const vessels = [...lab.vessels.values()]
  const sampleIds = new Set(lab.samples.values())
  const samples = vessels.filter((v) => sampleIds.has(v.id))
  const rack = vessels.filter((v) => !sampleIds.has(v.id) && v.kind !== 'filter-paper')
  const papers = vessels.filter((v) => v.kind === 'filter-paper')
  const sampleBadge = (id: string) => paper.samples.find((s) => lab.samples.get(s.id) === id)?.label.replace(/^solid /, '')

  const newVessel = (kind: VesselKind) => {
    if (lab.vessels.size >= MAX_VESSELS) {
      setToast('The rack is full – empty and re-use a tube, or remove one.')
      return null
    }
    const v = lab.newVessel(kind)
    bump()
    return v.id
  }

  const resolveTarget = (t: string | VesselKind): string | null => (lab.vessels.has(t) ? t : newVessel(t as VesselKind))

  const needActive = () => {
    if (!active) {
      setToast('First tap a tube to select it.')
      return null
    }
    return active
  }

  const onTool = (tool: ToolId) => {
    const id = needActive()
    if (!id) return
    const v = lab.vessel(id)
    switch (tool) {
      case 'bunsen':
        setSheet({ kind: 'heat', vesselId: id })
        break
      case 'red-litmus':
      case 'blue-litmus':
      case 'limewater':
      case 'glowing-splint':
      case 'lighted-splint': {
        const test: GasTest = tool === 'red-litmus' ? 'damp-red-litmus' : tool === 'blue-litmus' ? 'damp-blue-litmus' : tool
        run(id, 'gas', () => lab.gasTest(id, test), 900)
        break
      }
      case 'flame-wire':
        if (v.isEmpty()) return setToast('There is nothing in this tube to test.')
        run(id, 'flame', () => lab.flameTest(id), 900)
        break
      case 'ui-paper':
        run(id, 'gas', () => lab.pHTest(id), 500)
        break
      case 'filter':
        if (!v.wet) return setToast('There is no liquid to filter.')
        if (lab.vessels.size + 2 > MAX_VESSELS) return setToast('The rack is full.')
        run(id, 'pour', () => lab.filter(id).result, 900)
        break
      case 'wash-bottle':
        run(id, 'pour', () => lab.rinse(id), 500)
        break
      case 'waste':
        run(id, 'pour', () => lab.empty(id), 400)
        break
    }
  }

  const onBottle = (reagentId: string) => setSheet({ kind: 'reagent', reagentId, vesselId: active })

  const doAdd = (vesselId: string, amount: Amount, reagentId: string) => {
    const drops = 'drops' in amount && amount.drops <= 5
    run(vesselId, 'pour', () => lab.addReagent(vesselId, reagentId, amount), drops ? 260 : 650)
  }

  const elapsed = Math.floor((now - started) / 1000)
  const clock = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`
  const activeV = active ? lab.vessels.get(active) : undefined

  const feedback = last && (
    <div className="last-result">
      <div className="last-action">{last.action}</div>
      <div className="last-body">
        <ResultVisual result={last} />
        {showText && last.observations.length > 0 && (
          <ul className="obs-list">
            {last.observations.map((o, i) => (
              <li key={i}>{o.text}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )

  const finish = () => {
    if (confirm('Finish the question and go to self-marking?')) onFinish(answers, lab)
  }

  const bench = (
    <div className="bench">
      <section className="shelf" aria-label="Reagents">
        <div className="shelf-board">
          {paper.reagents.map((rid) => (
            <ReagentBottle key={rid} r={REAGENTS[rid]} onClick={() => onBottle(rid)} />
          ))}
        </div>
      </section>

      <section className="worktop">
        <div className="samples" aria-label="Samples">
          <div className="area-label">Samples</div>
          <div className="tube-row">
            {samples.map((v) => (
              <Tube
                key={v.id}
                id={v.id}
                a={appearance(v)}
                badge={sampleBadge(v.id)}
                selected={active === v.id}
                busy={busy?.id === v.id ? busy.kind : null}
                onClick={() => setActive(active === v.id ? null : v.id)}
              />
            ))}
          </div>
        </div>
        <div className="rack" aria-label="Test-tube rack">
          <div className="area-label">
            Rack
            <span className="rack-buttons">
              <button className="mini" onClick={() => setActive(newVessel('test-tube'))}>+ test-tube</button>
              <button className="mini" onClick={() => setActive(newVessel('boiling-tube'))}>+ boiling tube</button>
              <button className="mini" onClick={() => setActive(newVessel('hard-glass-tube'))}>+ hard-glass tube</button>
            </span>
          </div>
          <div className="tube-row rack-row">
            {rack.length === 0 && <p className="empty-rack">Take a clean tube to start.</p>}
            {rack.map((v) => (
              <Tube
                key={v.id}
                id={v.id}
                a={appearance(v)}
                selected={active === v.id}
                busy={busy?.id === v.id ? busy.kind : null}
                onClick={() => setActive(active === v.id ? null : v.id)}
              />
            ))}
            {papers.map((v) => (
              <Tube key={v.id} id={v.id} a={appearance(v)} selected={active === v.id} onClick={() => setActive(active === v.id ? null : v.id)} />
            ))}
          </div>
        </div>
      </section>

      <section className="tools" aria-label="Apparatus">
        {(Object.keys(TOOL_LABELS) as ToolId[]).map((t) => (
          <button key={t} className="tool" onClick={() => onTool(t)} title={TOOL_LABELS[t]}>
            <ToolIcon id={t} />
            <span>{TOOL_LABELS[t]}</span>
          </button>
        ))}
      </section>

      <section className={`action-panel${activeV ? ' open' : ''}`}>
        {activeV ? (
          <>
            <div className="ap-head">
              <strong>{activeV.label}</strong>
              <span className="ap-sub">
                {activeV.wet ? `${activeV.V.toFixed(1)} cm³ liquid` : activeV.isEmpty() ? 'empty' : 'solid'}
                {activeV.T > 30 ? ` · hot (${Math.round(activeV.T)} °C)` : ''}
              </span>
              <button className="icon-btn" onClick={() => setActive(null)} aria-label="Deselect">
                ✕
              </button>
            </div>
            <div className="ap-actions">
              <button className="btn" onClick={() => setSheet({ kind: 'transfer', fromId: activeV.id })} disabled={activeV.isEmpty()}>
                {activeV.wet ? 'Pour into…' : 'Transfer solid…'}
              </button>
              <button className="btn" onClick={() => setSheet({ kind: 'divide', fromId: activeV.id })} disabled={activeV.isEmpty()}>
                Divide…
              </button>
              <button className="btn" onClick={() => setSheet({ kind: 'heat', vesselId: activeV.id })}>Heat…</button>
              <button className="btn" onClick={() => run(activeV.id, 'shake', () => lab.shake(activeV.id), 700)}>Shake</button>
              <button className="btn" onClick={() => setSheet({ kind: 'stand', vesselId: activeV.id })}>Leave to stand…</button>
              <button className="btn" onClick={() => setSheet({ kind: 'gas', vesselId: activeV.id })}>Test gas…</button>
              <button
                className="btn"
                onClick={() => {
                  lab.setStopper(activeV.id, !activeV.stoppered)
                  bump()
                }}
              >
                {activeV.stoppered ? 'Remove stopper' : 'Insert stopper'}
              </button>
              <button className="btn subtle" onClick={() => run(activeV.id, 'pour', () => lab.empty(activeV.id), 400)}>Empty</button>
              <button className="btn subtle" onClick={() => run(activeV.id, 'pour', () => lab.rinse(activeV.id), 400)}>Rinse</button>
              {!sampleIds.has(activeV.id) && (
                <button
                  className="btn subtle"
                  onClick={() => {
                    lab.discard(activeV.id)
                    setActive(null)
                    bump()
                  }}
                >
                  Remove tube
                </button>
              )}
            </div>
          </>
        ) : (
          <p className="ap-hint">Tap a tube to select it, then tap a reagent bottle or a piece of apparatus.</p>
        )}
        {feedback}
      </section>
    </div>
  )

  const notebook = (
    <div className="notebook">
      <h3>Lab notebook</h3>
      <p className="hint">Everything you do is logged here. {showText ? 'Observation text is shown.' : 'Observation text is hidden: record what you see.'}</p>
      <ol className="journal">
        {lab.journal.map((j, i) => (
          <li key={i}>
            <span className="j-time">{fmt(j.time)}</span>
            <span className="j-vessel">{j.vesselLabel}</span>
            <span className="j-action">{j.action}</span>
            {showText && j.observations.length > 0 && <span className="j-obs">{j.observations.map((o) => o.text).join(' ')}</span>}
          </li>
        ))}
      </ol>
      <label className="scratch">
        <span>Rough notes</span>
        <textarea rows={6} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
    </div>
  )

  const paperView = <PaperPane paper={paper} answers={answers} setAnswer={(k, v) => setAnswers((a) => ({ ...a, [k]: v }))} onFinish={finish} />

  const sheetEl = (() => {
    if (!sheet) return null
    const close = () => setSheet(null)
    switch (sheet.kind) {
      case 'reagent':
        return (
          <ReagentSheet
            lab={lab}
            reagentId={sheet.reagentId}
            vesselId={sheet.vesselId}
            onClose={close}
            onPickVessel={(t) => {
              const id = resolveTarget(t)
              if (id) {
                setActive(id)
                setSheet({ ...sheet, vesselId: id })
              }
            }}
            onAdd={(vid, amount) => doAdd(vid, amount, sheet.reagentId)}
            feedback={last?.vesselId === sheet.vesselId ? feedback : null}
          />
        )
      case 'transfer':
        return (
          <TransferSheet
            lab={lab}
            fromId={sheet.fromId}
            onClose={close}
            onDo={(t, amount) => {
              const id = resolveTarget(t)
              if (!id) return
              close()
              run(id, 'pour', () => lab.transfer(sheet.fromId, id, amount), 750)
            }}
          />
        )
      case 'divide':
        return (
          <DivideSheet
            lab={lab}
            fromId={sheet.fromId}
            onClose={close}
            onDo={(kinds) => {
              if (lab.vessels.size + kinds.length > MAX_VESSELS) return setToast('Not enough room in the rack.')
              close()
              run(sheet.fromId, 'pour', () => {
                const { results } = lab.divide(sheet.fromId, kinds)
                return results[results.length - 1]
              }, 800)
            }}
          />
        )
      case 'heat':
        return (
          <HeatSheet
            lab={lab}
            vesselId={sheet.vesselId}
            onClose={close}
            onDo={(mode: HeatMode, s: number) => {
              close()
              run(sheet.vesselId, 'heat', () => lab.heat(sheet.vesselId, mode, s), 1600)
            }}
          />
        )
      case 'stand':
        return (
          <StandSheet
            onClose={close}
            onDo={(s) => {
              close()
              run(sheet.vesselId, 'wait', () => lab.wait(s, sheet.vesselId), 900)
            }}
          />
        )
      case 'gas':
        return (
          <GasSheet
            onClose={close}
            onDo={(t) => {
              close()
              run(sheet.vesselId, 'gas', () => lab.gasTest(sheet.vesselId, t), 900)
            }}
          />
        )
    }
  })()

  return (
    <div className="exam">
      <header className="topbar">
        <button className="icon-btn" onClick={() => confirm('Leave this question? Your written answers are kept on this device.') && onExit()} aria-label="Back">
          ←
        </button>
        <div className="tb-title">
          <strong>{paper.id.replace(/_/g, ' ')}</strong>
          <span>Q{paper.question} · {paper.level}</span>
        </div>
        <div className="tb-clock" title="Time spent">
          ⏱ {clock}
        </div>
        <label className="toggle" title="Show the engine's observation text (practice aid)">
          <input type="checkbox" checked={showText} onChange={(e) => setShowText(e.target.checked)} />
          <span>Observation text</span>
        </label>
        <button className="btn primary tb-finish" onClick={finish}>
          Finish
        </button>
      </header>

      <main className={`exam-main tab-${tab}`}>
        <div className="pane pane-lab">{bench}</div>
        <div className="pane pane-side">
          <div className="side-tabs">
            <button className={sideTab === 'paper' ? 'on' : ''} onClick={() => setSideTab('paper')}>Question paper</button>
            <button className={sideTab === 'notes' ? 'on' : ''} onClick={() => setSideTab('notes')}>Lab notebook</button>
          </div>
          <div className="side-body">
            <div className={`side-paper${sideTab === 'paper' ? '' : ' hidden-desktop'} only-paper`}>{paperView}</div>
            <div className={`side-notes${sideTab === 'notes' ? '' : ' hidden-desktop'} only-notes`}>{notebook}</div>
          </div>
        </div>
      </main>

      <nav className="bottom-tabs">
        <button className={tab === 'lab' ? 'on' : ''} onClick={() => setTab('lab')}>
          🧪 Lab
        </button>
        <button className={tab === 'paper' ? 'on' : ''} onClick={() => setTab('paper')}>
          📄 Paper
        </button>
        <button className={tab === 'notes' ? 'on' : ''} onClick={() => setTab('notes')}>
          📓 Notebook
        </button>
      </nav>

      {sheetEl}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function fmt(t: number) {
  const s = Math.round(t)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
