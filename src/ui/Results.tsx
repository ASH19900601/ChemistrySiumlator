import { useEffect, useMemo, useState } from 'react'
import { Lab, type JournalEntry } from '../engine'
import type { PaperCase } from '../papers'
import { answerKeys, PaperHeader, Prose, type Answers } from './PaperPane'
import { load, save } from './storage'

export function Results({
  paper,
  answers,
  journal,
  onRetry,
  onHome,
}: {
  paper: PaperCase
  answers: Answers
  journal: JournalEntry[]
  onRetry: () => void
  onHome: () => void
}) {
  const [marks, setMarks] = useState<Record<string, number>>(() => load(`marks:${paper.id}`, {}))
  useEffect(() => save(`marks:${paper.id}`, marks), [paper.id, marks])
  const total = paper.parts.reduce((s, p) => s + Math.min(p.marks, marks[p.id] ?? 0), 0)
  const supervisor = useMemo(() => {
    const lab = new Lab({ samples: paper.samples, reagents: paper.reagents })
    return paper.supervisor(lab)
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

      <div className="results-body">
        <article className="paper">
          <PaperHeader paper={paper} />
          <p className="hint">
            Compare each answer with the published mark scheme and award yourself the marks you have earned. The supervisor's results show what this
            simulation produces when the instructions are followed exactly.
          </p>
          {paper.parts.map((p) => {
            const keys = answerKeys(p)
            return (
              <section key={p.id} className="mark-part">
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
                        <div className="mini-head">Supervisor's results (simulation)</div>
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
          <section className="identities">
            <div className="mini-head">What the unknowns were (confidential instructions)</div>
            <ul>
              {paper.identities.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </section>
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
