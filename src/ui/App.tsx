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
          onFinish={(answers, lab) => setScreen({ name: 'results', paperId: screen.paperId, answers, journal: [...lab.journal] })}
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
  const groups = [
    { title: 'Cambridge IGCSE Chemistry 0620 · Paper 5 Practical Test', list: PAPERS.filter((p) => p.level === 'IGCSE') },
    { title: 'Cambridge International AS & A Level Chemistry 9701 · Paper 3', list: PAPERS.filter((p) => p.level !== 'IGCSE') },
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
