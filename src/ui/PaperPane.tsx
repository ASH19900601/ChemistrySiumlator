import type { PaperCase, QuestionPart } from '../papers'

export type Answers = Record<string, string>

export function answerKeys(p: QuestionPart): { key: string; label?: string }[] {
  const a = p.answer
  if (!a || a.kind === 'lines') return [{ key: p.id }]
  if (a.kind === 'table') return a.rows.map((row, i) => ({ key: `${p.id}:row${i}`, label: row }))
  return a.fields.map((f, i) => ({ key: `${p.id}:f${i}`, label: f }))
}

export function PaperHeader({ paper }: { paper: PaperCase }) {
  return (
    <header className="paper-head">
      <div className="paper-syllabus">{paper.syllabus}</div>
      <div className="paper-meta">
        {paper.component} · {paper.series} · Question {paper.question}
      </div>
      <div className="paper-marks">[Total: {paper.totalMarks}]</div>
    </header>
  )
}

export function PaperPane({ paper, answers, setAnswer, onFinish }: { paper: PaperCase; answers: Answers; setAnswer: (k: string, v: string) => void; onFinish: () => void }) {
  return (
    <article className="paper">
      <PaperHeader paper={paper} />
      {paper.intro && <Prose text={paper.intro} />}
      {paper.omitted && <p className="paper-note">{paper.omitted}</p>}
      {paper.parts.map((p) => (
        <section key={p.id} className="q-part">
          {p.preamble && <Prose text={p.preamble} />}
          <div className="q-row">
            <span className="q-label">{p.label}</span>
            <div className="q-body">
              <Prose text={p.text} />
              <AnswerInput part={p} answers={answers} setAnswer={setAnswer} />
            </div>
            <span className="q-marks">[{p.marks}]</span>
          </div>
        </section>
      ))}
      <div className="paper-foot">
        <button className="btn primary" onClick={onFinish}>
          Finish and mark my answers
        </button>
      </div>
    </article>
  )
}

function AnswerInput({ part, answers, setAnswer }: { part: QuestionPart; answers: Answers; setAnswer: (k: string, v: string) => void }) {
  const a = part.answer
  if (!a) return null
  if (a.kind === 'lines') {
    return (
      <textarea
        className="answer lined"
        rows={Math.max(1, a.lines)}
        value={answers[part.id] ?? ''}
        onChange={(e) => setAnswer(part.id, e.target.value)}
        aria-label={`Answer ${part.label}`}
        placeholder="Write your answer…"
      />
    )
  }
  if (a.kind === 'table') {
    return (
      <table className="answer-table">
        <thead>
          <tr>
            <th>{a.header[0]}</th>
            <th>{a.header[1]}</th>
          </tr>
        </thead>
        <tbody>
          {a.rows.map((row, i) => {
            const k = `${part.id}:row${i}`
            return (
              <tr key={k}>
                <td className="test-cell">{row}</td>
                <td>
                  <textarea className="answer" rows={3} value={answers[k] ?? ''} onChange={(e) => setAnswer(k, e.target.value)} aria-label={row} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }
  return (
    <div className="answer-fields">
      {a.fields.map((f, i) => {
        const k = `${part.id}:f${i}`
        return (
          <label key={k}>
            <span>{f}</span>
            <input className="answer" value={answers[k] ?? ''} onChange={(e) => setAnswer(k, e.target.value)} />
          </label>
        )
      })}
    </div>
  )
}

export function Prose({ text }: { text: string }) {
  return (
    <div className="prose">
      {text.split('\n').map((line, i) => (line.trim() ? <p key={i}>{line}</p> : <br key={i} />))}
    </div>
  )
}
