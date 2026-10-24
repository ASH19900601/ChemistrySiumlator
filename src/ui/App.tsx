import { useState } from 'react'
import type { JournalEntry } from '../engine'
import { PAPERS, paperById } from '../papers'
import { Exam } from './Exam'
import type { Answers } from './PaperPane'
import { Results } from './Results'
import { remove } from './storage'
import { SvgDefs } from './Tube'

type Screen =
  | { name: 'home' }
  | { name: 'exam'; paperId: string; attempt: number }
  | { name: 'results'; paperId: string; answers: Answers; journal: JournalEntry[] }

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  return (
    <>
      <SvgDefs />
      {screen.name === 'home' && <Home onStart={(id) => setScreen({ name: 'exam', paperId: id, attempt: Date.now() })} />}
      {screen.name === 'exam' && (
        <Exam
          key={screen.attempt}
          paper={paperById(screen.paperId)!}
          onExit={() => setScreen({ name: 'home' })}
          onFinish={(answers, lab) => {
            remove(`marks:${screen.paperId}`)
            setScreen({ name: 'results', paperId: screen.paperId, answers, journal: [...lab.journal] })
          }}
        />
      )}
      {screen.name === 'results' && (
        <Results
          paper={paperById(screen.paperId)!}
          answers={screen.answers}
          journal={screen.journal}
          onHome={() => setScreen({ name: 'home' })}
          onRetry={() => {
            remove(`answers:${screen.paperId}`)
            remove(`marks:${screen.paperId}`)
            remove(`notes:${screen.paperId}`)
            setScreen({ name: 'exam', paperId: screen.paperId, attempt: Date.now() })
          }}
        />
      )}
    </>
  )
}

function Home({ onStart }: { onStart: (id: string) => void }) {
  const [year, setYear] = useState('all')
  const [question, setQuestion] = useState('all')
  const [mode, setMode] = useState('all')
  const [query, setQuery] = useState('')
  const filtered = PAPERS.filter(p =>
    (year === 'all' || String(p.source?.year) === year) &&
    (question === 'all' || String(p.question) === question) &&
    (mode === 'all' || (mode === 'guided' ? p.coverage === 'guided' : p.coverage !== 'source-only')) &&
    `${p.id} ${p.series} ${p.component} ${p.level}`.toLowerCase().includes(query.trim().toLowerCase()))
  const groups = [
    { title: 'Cambridge IGCSE Chemistry 0620 · Paper 5 Practical Test', list: filtered.filter((p) => p.level === 'IGCSE') },
    { title: 'Cambridge International AS & A Level Chemistry 9701 · Paper 3', list: filtered.filter((p) => p.level !== 'IGCSE') },
  ]
  return (
    <div className="home">
      <header className="home-hero">
        <h1>Qualitative Analysis Lab</h1>
        <p>
          Carry out the tests of a real past-paper qualitative analysis question on a simulated bench, record your own observations and conclusions,
          then mark yourself against the published mark scheme.
        </p>
      </header>
      <section className="library-intro" aria-label="Paper library">
        <p><strong>2023–2026 · {PAPERS.length} original question sets</strong> · 22 IGCSE and 45 AS papers, with original questions, mark schemes and materials.</p>
        <p className="hint">IGCSE qualitative analysis is Q2. AS question numbers vary: filter by the original question number. This archive does not contain every AS Q2, or October/November 2026 papers. “Source practice” includes written answers and marking; it has no interactive bench.</p>
        <div className="library-filters">
          <label>Year<select aria-label="Year" value={year} onChange={e => setYear(e.target.value)}><option value="all">All years</option>{[2026, 2025, 2024, 2023].map(y => <option key={y}>{y}</option>)}</select></label>
          <label>Question<select aria-label="Question" value={question} onChange={e => setQuestion(e.target.value)}><option value="all">All questions</option>{[1, 2, 3].map(q => <option key={q} value={q}>Question {q}</option>)}</select></label>
          <label>Practice<select aria-label="Practice" value={mode} onChange={e => setMode(e.target.value)}><option value="all">All papers</option><option value="bench">With a bench</option><option value="guided">Guided bench</option></select></label>
          <label>Find paper<input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. 9701_s25_31" type="search" /></label>
        </div>
        <p role="status">{filtered.length} papers shown</p>
      </section>
      {groups.map((g) => (
        <section key={g.title} className="paper-group">
          <h2>{g.title}</h2>
          <div className="paper-cards">
            {g.list.map((p) => (
              <button key={p.id} className="paper-card" onClick={() => onStart(p.id)}>
                <div className="pc-top">
                  <span className="pc-series">{p.series}</span>
                  <span className="pc-marks">{p.totalMarks} marks</span>
                </div>
                <div className="pc-title">
                  {p.component.replace(/ \(.*\)/, '')} · Question {p.question}
                </div>
                <div className="pc-summary">{p.summary}</div>
                <span className={`coverage-badge coverage-${p.coverage}`}>{p.coverage === 'guided' ? 'Guided bench' : p.coverage === 'configured' ? 'Free bench · partial simulation' : 'Source practice'}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
      <footer className="home-foot">
        Questions and mark schemes © Cambridge University Press &amp; Assessment, reproduced for private study. Observations are produced by the
        simulation and may differ in detail from a real laboratory.
      </footer>
    </div>
  )
}
