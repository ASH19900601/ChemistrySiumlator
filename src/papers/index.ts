import { AS_PAPERS } from './alevel'
import { IGCSE_PAPERS } from './igcse'
import type { PaperCase } from './types'
import { PAPER_SOURCES, sourceCase, sourceById } from './archive'
import { AS_Q2_PAPERS } from './as-q2'

export type { PaperCase, QuestionPart, AnswerSpec } from './types'
export const GUIDED_PAPERS: PaperCase[] = [...IGCSE_PAPERS, ...AS_PAPERS, ...AS_Q2_PAPERS].map(p => ({ ...p, coverage: 'guided', source: sourceById(p.id) }))
export const PAPERS: PaperCase[] = [...GUIDED_PAPERS, ...PAPER_SOURCES.filter(s => !GUIDED_PAPERS.some(p => p.id === s.id)).map(sourceCase)]
export function paperById(id: string) {
  return PAPERS.find((p) => p.id === id)
}
