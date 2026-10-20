import { useCallback, useEffect, useRef, useState } from 'react'
import { Lab } from '../engine'
import type { PaperCase } from '../papers'
import { Bench } from './bench/Bench'
import { BenchModel } from './bench/model'
import { setSoundEnabled, sound } from './bench/sound'
import { PaperPane, type Answers } from './PaperPane'
import { load, save } from './storage'

type Tab = 'lab' | 'paper' | 'notes'

export function Exam({ paper, onFinish, onExit }: { paper: PaperCase; onFinish: (answers: Answers, lab: Lab) => void; onExit: () => void }) {
  const modelRef = useRef<BenchModel>()
  if (!modelRef.current) modelRef.current = new BenchModel(new Lab({ samples: paper.samples, reagents: paper.reagents }), paper)
  const model = modelRef.current
  if (import.meta.env.DEV) (window as unknown as { __bench?: BenchModel }).__bench = model
  const lab = model.lab
  const [version, setVersion] = useState(0)
  const [tab, setTab] = useState<Tab>('lab')
  const [sideTab, setSideTab] = useState<'paper' | 'notes'>('paper')
  const [sideOpen, setSideOpen] = useState(true)
  const [showText, setShowText] = useState<boolean>(() => load('show-text', false))
  const [soundOn, setSoundOn] = useState<boolean>(() => load('sound', true))
  const [demo, setDemo] = useState<boolean>(() => !load('demo-seen', false))
  const [answers, setAnswers] = useState<Answers>(() => load(`answers:${paper.id}`, {}))
  const [notes, setNotes] = useState<string>(() => load(`notes:${paper.id}`, ''))
  const [started] = useState(() => Date.now())

  useEffect(() => save('show-text', showText), [showText])
  useEffect(() => {
    save('sound', soundOn)
    setSoundEnabled(soundOn)
  }, [soundOn])
  useEffect(() => save(`answers:${paper.id}`, answers), [paper.id, answers])
  useEffect(() => save(`notes:${paper.id}`, notes), [paper.id, notes])

  // the bench runs in real time (the wall clock on the bench can be sped up ×10)
  useEffect(() => {
    let last = performance.now()
    const t = setInterval(() => {
      const now = performance.now()
      const dt = Math.min(0.25, (now - last) / 1000)
      last = now
      model.step(dt, now)
      setVersion(model.version)
    }, 100)
    return () => {
      clearInterval(t)
      sound.stopPour()
    }
  }, [model])

  const endDemo = useCallback(() => {
    setDemo(false)
    save('demo-seen', true)
  }, [])

  const elapsed = Math.floor((Date.now() - started) / 1000)
  const clock = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`

  const finish = () => {
    if (!confirm('Finish the question and go to self-marking?')) return
    model.finishAll()
    onFinish(answers, lab)
  }

  // the latest observation, shown on the bench only when observation text is switched on
  const lastEntry = lab.journal[lab.journal.length - 1]
  const recent = lastEntry && lab.time - lastEntry.time < 12 ? lastEntry : null

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

  return (
    <div className="exam">
      <header className="topbar">
        <button className="icon-btn" onClick={() => confirm('Leave this question? Your written answers are kept on this device.') && onExit()} aria-label="Back">
          ←
        </button>
        <div className="tb-title">
          <strong>{paper.id.replace(/_/g, ' ')}</strong>
          <span>
            Q{paper.question} · {paper.level}
          </span>
        </div>
        <div className="tb-clock" title="Time spent">
          ⏱ {clock}
        </div>
        <button className="icon-btn tb-icon" onClick={() => setDemo(true)} title="Show how the bench works" aria-label="Show how the bench works">
          ?
        </button>
        <button className="icon-btn tb-icon" onClick={() => setSoundOn(!soundOn)} title={soundOn ? 'Sound on' : 'Sound off'} aria-label="Sound">
          {soundOn ? '🔊' : '🔇'}
        </button>
        <label className="toggle" title="Show the engine's observation text (practice aid)">
          <input type="checkbox" checked={showText} onChange={(e) => setShowText(e.target.checked)} />
          <span>Observation text</span>
        </label>
        <button className="icon-btn tb-icon side-toggle" onClick={() => setSideOpen(!sideOpen)} title={sideOpen ? 'Hide the question paper' : 'Show the question paper'} aria-label="Toggle question paper">
          {sideOpen ? '⇥' : '⇤'}
        </button>
        <button className="btn primary tb-finish" onClick={finish}>
          Finish
        </button>
      </header>

      <main className={`exam-main tab-${tab}${sideOpen ? '' : ' side-closed'}`}>
        <div className="pane pane-lab">
          <Bench model={model} version={version} demo={demo} onDemoEnd={endDemo} />
          {showText && recent && (
            <div className="obs-caption" key={lab.journal.length}>
              <div className="obs-action">{recent.action}</div>
              <div>{recent.observations.map((o) => o.text).join(' ')}</div>
            </div>
          )}
        </div>
        <div className="pane pane-side">
          <div className="side-tabs">
            <button className={sideTab === 'paper' ? 'on' : ''} onClick={() => setSideTab('paper')}>
              Question paper
            </button>
            <button className={sideTab === 'notes' ? 'on' : ''} onClick={() => setSideTab('notes')}>
              Lab notebook
            </button>
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
    </div>
  )
}

function fmt(t: number) {
  const s = Math.round(t)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
