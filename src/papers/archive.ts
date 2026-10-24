import { ARCHIVE_DATA } from './archive-data'
import { sourceParts, partialReference } from './source-parts'
import { RECENT_BENCHES } from './recent-benches'
import type { PaperCase, PaperSource } from './types'

export const PAPER_SOURCES: readonly PaperSource[] = ARCHIVE_DATA
export const sourceById = (id: string) => PAPER_SOURCES.find(p => p.id === id)
export const seriesName = (source: PaperSource) => `${({ m: 'February/March', s: 'May/June', w: 'October/November' } as Record<string, string>)[source.session]} ${source.year}`

export function sourceCase(source: PaperSource): PaperCase {
  const bench = RECENT_BENCHES[source.id]
  return {
    id: source.id, source, coverage: bench ? 'configured' : 'source-only',
    syllabus: source.code === '0620' ? 'Cambridge IGCSE Chemistry 0620' : 'Cambridge International AS & A Level Chemistry 9701',
    level: source.code === '0620' ? 'IGCSE' : 'AS & A Level',
    series: seriesName(source), component: `Paper ${source.paper}`, question: source.question,
    totalMarks: source.totalMarks,
    summary: bench ? 'Original question and mark scheme, with samples prepared for free bench practice.' : 'Original question, written practice and published mark scheme. Interactive bench not yet available.',
    samples: bench?.samples ?? [], reagents: bench?.reagents ?? [], intro: '',
    parts: sourceParts(source.id) ?? [{ id: 'response', label: `Q${source.question}`, text: 'Label your answers with the original part numbers. Record observations and conclusions separately.',
      marks: source.totalMarks, answer: { kind: 'lines', lines: 18 }, markScheme: ['Use the original mark scheme below and award marks for this question only.'] }],
    identities: [], supervisor: lab => partialReference(source.id, lab),
  }
}
