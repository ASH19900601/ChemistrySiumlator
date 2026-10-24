import { useEffect, useState } from 'react'
import { PAPERS, paperById } from '../papers'
import { Exam } from './Exam'
import { Results } from './Results'
import { downloadText, load, save } from './storage'
import { importAttempt, latestAttempt, newAttempt, readAttempt, writeAttempt, type Attempt } from './attempts'
import { matchesPaper } from './paperSearch'
import { SvgDefs } from './Tube'

type Route = { name: 'home' } | { name: 'exam' | 'results'; paperId: string; attemptId: string }
function route(): Route {
  const match = location.hash.match(/^#(exam|results)\/([\w-]+)\/(\d+)$/)
  return match && paperById(match[2]) ? { name: match[1] as 'exam' | 'results', paperId: match[2], attemptId: match[3] } : { name: 'home' }
}
function navigate(next: Route) {
  location.hash = next.name === 'home' ? 'home' : `${next.name}/${next.paperId}/${next.attemptId}`
}
export function App() {
  const [screen, setScreen] = useState<Route>(route)
  useEffect(() => {
    const changed = () => setScreen(route())
    window.addEventListener('hashchange', changed)
    return () => window.removeEventListener('hashchange', changed)
  }, [])
  const start = (id: string, fresh = false) => {
    const paper = paperById(id)!
    const latest = fresh ? null : latestAttempt(id)
    const record = latest ? readAttempt(paper, latest.id) : null
    if (latest && !record) { navigate({ name: latest.stage, paperId: id, attemptId: latest.id }); return }
    const attempt = record ?? newAttempt(paper, String(Date.now()))
    if (!record) {
      // Keep legacy written answers on the first visit after upgrading.
      if (!fresh) { attempt.answers = load(`answers:${id}`, {}); attempt.notes = load(`notes:${id}`, '') }
      writeAttempt(attempt)
    }
    navigate({ name: attempt.stage, paperId: id, attemptId: attempt.id })
  }
  const paper = screen.name !== 'home' ? paperById(screen.paperId)! : null
  const attempt: Attempt | null = screen.name !== 'home' && paper ? readAttempt(paper, screen.attemptId) : null
  return <>
    <SvgDefs />
    {screen.name === 'home' && <Home onStart={start} />}
    {screen.name !== 'home' && !attempt && <div className="recovery-error" role="alert">
      <p>This saved attempt is missing, damaged or belongs to an older experiment configuration. It has not been overwritten.</p>
      <button className="btn" onClick={() => navigate({ name: 'home' })}>Back to papers</button>
      <button className="btn" onClick={() => downloadText(`${screen.paperId}-unreadable-backup.json`, JSON.stringify(load(`attempt:${screen.paperId}:${screen.attemptId}`, {}), null, 2))}>Export saved record</button>
      <button className="btn" onClick={() => start(screen.paperId, true)}>Start a new attempt</button>
    </div>}
    {screen.name === 'exam' && paper && attempt && <Exam key={attempt.id} paper={paper} attempt={attempt}
      onExit={() => navigate({ name: 'home' })}
      onFinish={record => { navigate({ name: 'results', paperId: paper.id, attemptId: record.id }) }} />}
    {screen.name === 'results' && paper && attempt && <Results key={attempt.id} paper={paper} attempt={attempt}
      answers={attempt.answers} journal={attempt.bench?.lab.journal ?? []}
      onHome={() => navigate({ name: 'home' })} onRetry={() => start(paper.id, true)} />}
  </>
}

function Home({ onStart }: { onStart: (id: string) => void }) {
  const [year, setYear] = useState(() => load('filter-year', 'all'))
  const [question, setQuestion] = useState(() => load('filter-question', 'all'))
  const [mode, setMode] = useState(() => load('filter-mode', 'all'))
  const [query, setQuery] = useState(() => load('filter-query', ''))
  const [importError, setImportError] = useState('')
  useEffect(() => { save('filter-year', year); save('filter-question', question); save('filter-mode', mode); save('filter-query', query) }, [year, question, mode, query])
  useEffect(() => {
    window.scrollTo(0, load('library-scroll', 0))
    const remember = () => { save('library-scroll', window.scrollY) }
    window.addEventListener('scroll', remember)
    return () => window.removeEventListener('scroll', remember)
  }, [])
  const filtered = PAPERS.filter(p =>
    (year === 'all' || String(p.source?.year) === year) &&
    (question === 'all' || String(p.question) === question) &&
    (mode === 'all' || (mode === 'guided' ? p.coverage === 'guided' : p.coverage !== 'source-only')) &&
    matchesPaper(p, query))
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
        <label className="backup-import">Restore an exported attempt <input type="file" accept=".json,.txt,application/json,text/plain" aria-label="Import attempt backup" onChange={async e => {
          const file = e.target.files?.[0]
          if (!file) return
          try {
            if (file.size > 10_000_000) throw new Error('The backup is too large.')
            const value = JSON.parse(await file.text())
            const paper = paperById(value.paperId)
            if (!paper) throw new Error('This question is not available in this version.')
            const attempt = importAttempt(value, paper)
            navigate({ name: attempt.stage, paperId: paper.id, attemptId: attempt.id })
          } catch (error) { setImportError(error instanceof Error ? error.message : 'Could not read this backup.') }
          e.target.value = ''
        }} /></label>
        {importError && <p role="alert">{importError}</p>}
        <p><strong>2023–2026 · {PAPERS.length} original question sets</strong> · 22 IGCSE and 45 AS papers. 9 guided benches, 18 partially simulated free benches, 40 written-practice sets.</p>
        <p className="hint">IGCSE qualitative analysis is Q2. AS question numbers vary: filter by the original question number. This archive does not contain every AS Q2, or October/November 2026 papers. “Source practice” includes written answers and marking; it has no interactive bench.</p>
        <div className="library-filters">
          <label>Year<select aria-label="Year" value={year} onChange={e => setYear(e.target.value)}><option value="all">All years</option>{[2026, 2025, 2024, 2023].map(y => <option key={y}>{y}</option>)}</select></label>
          <label>Question<select aria-label="Question" value={question} onChange={e => setQuestion(e.target.value)}><option value="all">All questions</option>{[1, 2, 3].map(q => <option key={q} value={q}>Question {q}</option>)}</select></label>
          <label>Practice<select aria-label="Practice" value={mode} onChange={e => setMode(e.target.value)}><option value="all">All papers</option><option value="bench">With a bench</option><option value="guided">Guided bench</option></select></label>
          <label>Find paper<input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. 9701_s25_31" type="search" /></label>
        </div>
        <p role="status">{filtered.length} papers shown</p>
        {!filtered.length && <button className="btn" onClick={() => { setYear('all'); setQuestion('all'); setMode('all'); setQuery('') }}>Clear filters</button>}
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
                {latestAttempt(p.id) && <span className="resume-badge">Resume saved attempt</span>}
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
