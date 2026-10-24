import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Lab } from '../engine'
import type { PaperCase } from '../papers'
import { Bench } from './bench/Bench'
import { BenchModel } from './bench/model'
import { setSoundEnabled, sound } from './bench/sound'
import { PaperPane, type Answers } from './PaperPane'
import { isAnswers, load, save, downloadText } from './storage'
import { benchState, restoreBench, writeAttempt, type Attempt } from './attempts'
import { ConfirmDialog } from './ConfirmDialog'

type Tab = 'lab' | 'paper' | 'notes'

export function Exam({ paper, attempt, onFinish, onExit }: { paper: PaperCase; attempt: Attempt; onFinish: (attempt: Attempt) => void; onExit: () => void }) {
  const modelRef = useRef<BenchModel>()
  const restoreError = useRef('')
  if (!modelRef.current && paper.coverage !== 'source-only') {
    try { modelRef.current = restoreBench(paper, attempt.bench) }
    catch { restoreError.current = 'This experiment snapshot is damaged. Your written work can still be exported. Start a new attempt from the marking page to reset the bench.'; modelRef.current = restoreBench(paper) }
  }
  const model = modelRef.current
  const emptyLab = useRef<Lab>()
  if (!emptyLab.current) emptyLab.current = new Lab()
  if (import.meta.env.DEV) (window as unknown as { __bench?: BenchModel }).__bench = model
  const lab = model?.lab ?? emptyLab.current
  const [version, setVersion] = useState(0)
  const [tab, setTab] = useState<Tab>(paper.coverage === 'source-only' ? 'paper' : 'lab')
  const [sideTab, setSideTab] = useState<'paper' | 'notes'>('paper')
  const [sideOpen, setSideOpen] = useState(true)
  const [showText, setShowText] = useState<boolean>(() => load('show-text', false))
  const [soundOn, setSoundOn] = useState<boolean>(() => load('sound', true))
  const [demo, setDemo] = useState<boolean>(() => !load('demo-seen', false))
  const [answers, setAnswers] = useState<Answers>(() => isAnswers(attempt.answers) ? attempt.answers : load(`answers:${paper.id}`, {}, isAnswers))
  const [notes, setNotes] = useState<string>(() => attempt.notes)
  const [started] = useState(() => Date.now() - attempt.elapsed * 1000)
  const [paused, setPaused] = useState(!!attempt.bench)
  const [saved, setSaved] = useState(true)
  const [confirmFinish, setConfirmFinish] = useState(false)

  useEffect(() => { save('show-text', showText) }, [showText])
  useEffect(() => {
    save('sound', soundOn)
    setSoundEnabled(soundOn)
  }, [soundOn])
  const current = useRef({ answers, notes, stage: 'exam' as 'exam' | 'results' })
  current.current.answers = answers
  current.current.notes = notes
  const persist = useRef<() => Attempt>(() => attempt)
  persist.current = () => {
    const record: Attempt = { ...attempt, answers: current.current.answers, notes: current.current.notes,
      stage: current.current.stage, elapsed: Math.floor((Date.now() - started) / 1000), savedAt: Date.now(),
      bench: restoreError.current ? attempt.bench : model ? benchState(model) : undefined }
    const ok = writeAttempt(record)
    const answerOK = save(`answers:${paper.id}`, record.answers)
    const notesOK = save(`notes:${paper.id}`, record.notes)
    setSaved(ok && answerOK && notesOK)
    return record
  }
  useEffect(() => { persist.current() }, [answers, notes])
  useEffect(() => {
    const timer = setInterval(() => { persist.current() }, 2000)
    const leave = () => { model?.cancel(); persist.current() }
    const hide = () => { if (document.hidden) leave() }
    window.addEventListener('pagehide', leave)
    document.addEventListener('visibilitychange', hide)
    return () => { clearInterval(timer); window.removeEventListener('pagehide', leave); document.removeEventListener('visibilitychange', hide); leave() }
  }, [model])

  // the bench runs in real time (the wall clock on the bench can be sped up ×10)
  useEffect(() => {
    if (!model || paused) return
    let last = performance.now()
    const t = setInterval(() => {
      const now = performance.now()
      if (document.hidden) { last = now; return }
      const dt = Math.min(0.25, (now - last) / 1000)
      last = now
      model.step(dt, now)
      setVersion(model.version)
    }, 100)
    const visibility = () => { last = performance.now(); if (document.hidden) model.cancel() }
    document.addEventListener('visibilitychange', visibility)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', visibility)
      model.cancel()
      sound.stopPour()
    }
  }, [model, paused])

  useEffect(() => {
    const timer = setInterval(() => setVersion(v => v + 1), 1000)
    return () => clearInterval(timer)
  }, [])
  const changeTab = (next: Tab) => { model?.cancel(); setTab(next) }

  const endDemo = useCallback(() => {
    setDemo(false)
    save('demo-seen', true)
  }, [])

  const elapsed = Math.floor((Date.now() - started) / 1000)
  const clock = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`

  const finish = useCallback(() => setConfirmFinish(true), [])
  const finishConfirmed = () => {
    model?.finishAll()
    current.current.stage = 'results'
    const record = persist.current()
    onFinish(record)
  }
  const setAnswer = useCallback((k: string, v: string) => setAnswers(a => ({ ...a, [k]: v })), [])

  // the latest observation, shown on the bench only when observation text is switched on
  const lastEntry = lab.journal[lab.journal.length - 1]
  const recent = lastEntry && lab.time - lastEntry.time < 12 ? lastEntry : null

  const notebook = useMemo(() => (
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
  ), [lab, lab.journal.length, showText, notes])

  const paperView = <PaperPane paper={paper} answers={answers} setAnswer={setAnswer} onFinish={finish} />

  return (
    <div className={`exam${paper.coverage === 'source-only' ? ' source-only' : ''}`}>
      <div className="exam-heading"><header className="topbar">
        <button className="icon-btn" onClick={() => { model?.cancel(); persist.current(); onExit() }} aria-label="Back">
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
        <button className="icon-btn tb-icon bench-control" onClick={() => setDemo(true)} title="Show how the bench works" aria-label="Show how the bench works">
          ?
        </button>
        <button className="icon-btn tb-icon bench-control" onClick={() => setSoundOn(!soundOn)} title={soundOn ? 'Sound on' : 'Sound off'} aria-label="Sound" aria-pressed={soundOn}>
          {soundOn ? '🔊' : '🔇'}
        </button>
        <label className="toggle bench-control" title="Show the engine's observation text (practice aid)">
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

      <div className={`save-status${saved ? '' : ' save-failed'}`} role={saved ? 'status' : 'alert'}>
        <span>{saved ? 'Saved on this device' : 'Could not save on this device. Keep this page open and export a backup.'}</span>
        {!saved && <button className="btn" onClick={() => persist.current()}>Retry saving</button>}
        <button className="btn" onClick={() => downloadText(`${paper.id}-attempt.json`, JSON.stringify(persist.current(), null, 2))}>Export backup</button>
      </div>
      {restoreError.current && <p role="alert">{restoreError.current}</p>}
      {paused && model && <div className="resume-notice" role="status">Saved experiment restored and paused. No chemistry ran while you were away. <button className="btn" onClick={() => setPaused(false)} disabled={!!restoreError.current}>Resume experiment</button></div>}
      {confirmFinish && <ConfirmDialog title="Finish this question?" onCancel={() => setConfirmFinish(false)} onConfirm={finishConfirmed} />}
      </div>
      <main className={`exam-main tab-${tab}${sideOpen ? '' : ' side-closed'}`}>
        <div className="pane pane-lab">
          {model && <Bench model={model} version={version} demo={demo} onDemoEnd={endDemo} disabled={paused || !!restoreError.current} />}
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
        {paper.coverage !== 'source-only' && <button className={tab === 'lab' ? 'on' : ''} onClick={() => changeTab('lab')} aria-current={tab === 'lab' ? 'page' : undefined}>
          🧪 Lab
        </button>}
        <button className={tab === 'paper' ? 'on' : ''} onClick={() => changeTab('paper')} aria-current={tab === 'paper' ? 'page' : undefined}>
          📄 Paper
        </button>
        <button className={tab === 'notes' ? 'on' : ''} onClick={() => changeTab('notes')} aria-current={tab === 'notes' ? 'page' : undefined}>
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
