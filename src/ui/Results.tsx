import { useEffect, useState } from 'react'
import { type JournalEntry } from '../engine'
import type { PaperCase } from '../papers'
import { answerKeys, PaperHeader, Prose, type Answers } from './PaperPane'
import { save, downloadText } from './storage'
import { writeAttempt, type Attempt } from './attempts'
import { SourceDocument } from './SourceDocument'

export function Results({
  paper,
  attempt,
  answers,
  journal,
  onRetry,
  onHome,
}: {
  paper: PaperCase
  attempt: Attempt
  answers: Answers
  journal: JournalEntry[]
  onRetry: () => void
  onHome: () => void
}) {
  const [marks, setMarks] = useState<Record<string, number>>(() => attempt.marks)
  const [saved, setSaved] = useState(true)
  useEffect(() => { setSaved(writeAttempt({ ...attempt, stage: 'results', marks }) && save(`marks:${paper.id}`, marks)) }, [paper.id, marks, attempt])
  const total = paper.parts.reduce((s, p) => s + Math.min(p.marks, marks[p.id] ?? 0), 0)
  const marked = paper.parts.filter(p => marks[p.id] !== undefined).length
  const [supervisor, setSupervisor] = useState<Record<string, string>>({})
  const [referenceError, setReferenceError] = useState(false)
  useEffect(() => {
    if (paper.coverage === 'source-only') return
    const worker = new Worker(new URL('../papers/supervisor.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = event => { if (event.data.error) setReferenceError(true); else setSupervisor(event.data.results); worker.terminate() }
    worker.onerror = () => { setReferenceError(true); worker.terminate() }
    worker.postMessage(paper.id)
    return () => worker.terminate()
  }, [paper])
  const [showLog, setShowLog] = useState(false)

  return (
    <div className="results">
      <header className="topbar">
        <button className="icon-btn" onClick={onHome} aria-label="Back to papers">
          ←
        </button>
        <div className="tb-title">
          <strong>Self-marking</strong>
          <span>{paper.id.replace(/_/g, ' ')} · Q{paper.question}</span>
        </div>
        <div className="score-pill">
          {total} / {paper.totalMarks}
        </div>
      </header>

      <div className="save-status" role={saved ? 'status' : 'alert'}>
        <span>{saved ? 'Marks saved on this device' : 'Could not save your marks. Export a backup before leaving.'}</span>
        <button className="btn" onClick={() => downloadText(`${paper.id}-attempt.json`, JSON.stringify({ ...attempt, stage: 'results', marks }, null, 2))}>Export backup</button>
      </div>
      <p className="mark-progress" role="status">Marked {marked} / {paper.parts.length} parts{marked < paper.parts.length ? ' · Total is provisional: unmarked parts are not zero marks.' : ''}</p>
      {referenceError && <p role="alert">Simulation reference could not load. Use the original mark scheme below.</p>}
      {paper.coverage === 'configured' && <p className="paper-note">Free bench practice: reference checks cover selected parts; the full supervisor procedure is not verified. Mark your written work against the original scheme.</p>}
      <div className="results-body">
        <article className="paper">
          <PaperHeader paper={paper} />
          <p className="hint">
            Compare each answer with the published mark scheme and award yourself the marks you have earned. Simulation references cover the parts shown below; partial benches do not provide a complete supervisor procedure.
          </p>
          {paper.parts.map((p) => {
            const keys = answerKeys(p)
            return (
              <section key={p.id} className="mark-part">
                {marks[p.id] === undefined && <span className="unmarked">Not yet marked</span>}
                <div className="q-row">
                  <span className="q-label">{p.label}</span>
                  <div className="q-body">
                    <details>
                      <summary>Question</summary>
                      {p.preamble && <Prose text={p.preamble} />}
                      <Prose text={p.text} />
                    </details>
                    <div className="your-answer">
                      <div className="mini-head">Your answer</div>
                      {keys.map((k) => (
                        <div key={k.key} className="ans-line">
                          {k.label && <span className="ans-label">{k.label}</span>}
                          <span className={answers[k.key]?.trim() ? '' : 'blank'}>{answers[k.key]?.trim() || '(no answer)'}</span>
                        </div>
                      ))}
                    </div>
                    <div className="ms">
                      <div className="mini-head">Mark scheme</div>
                      <ul>
                        {p.markScheme.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                    {supervisor[p.id] && (
                      <div className="supervisor">
                        <div className="mini-head">{paper.coverage === 'guided' ? "Supervisor's results (simulation)" : 'Representative reference (partial simulation)'}</div>
                        <Prose text={supervisor[p.id]} />
                      </div>
                    )}
                  </div>
                  <div className="mark-picker" role="group" aria-label={`Marks for ${p.label}`}>
                    {Array.from({ length: p.marks + 1 }, (_, i) => (
                      <button key={i} className={(marks[p.id] ?? -1) === i ? 'on' : ''} onClick={() => setMarks((m) => ({ ...m, [p.id]: i }))}>
                        {i}
                      </button>
                    ))}
                    <span className="of">/ {p.marks}</span>
                  </div>
                </div>
              </section>
            )
          })}
          {paper.source && <section className="original-mark-scheme">
            <h2>Published mark scheme</h2>
            <p className="hint">Mark Question {paper.question} only. The original extract can also contain marking for adjacent questions.</p>
            <SourceDocument asset={paper.source.assets.markScheme} title="Original mark scheme" originalPages={paper.source.ms_pages} />
            {paper.source.assets.materials1 && <details><summary>Confidential instructions and sample preparation</summary><SourceDocument asset={paper.source.assets.materials1} title="Confidential instructions" /></details>}
          </section>}
          {paper.identities.length > 0 && <section className="identities">
            <div className="mini-head">What the unknowns were (confidential instructions)</div>
            <ul>
              {paper.identities.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </section>}
          <section className="your-log">
            <button className="btn link" onClick={() => setShowLog(!showLog)}>
              {showLog ? 'Hide' : 'Show'} everything you did in the lab ({journal.length} actions)
            </button>
            {showLog && (
              <ol className="journal">
                {journal.map((j, i) => (
                  <li key={i}>
                    <span className="j-vessel">{j.vesselLabel}</span>
                    <span className="j-action">{j.action}</span>
                    <span className="j-obs">{j.observations.map((o) => o.text).join(' ')}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
          <div className="paper-foot">
            <button className="btn" onClick={onRetry}>
              Try this question again
            </button>
            <button className="btn primary" onClick={onHome}>
              Choose another question
            </button>
          </div>
        </article>
      </div>
    </div>
  )
}
