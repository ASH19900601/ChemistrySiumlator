import { AS_PAPERS } from './alevel'
import { IGCSE_PAPERS } from './igcse'
import type { PaperCase } from './types'

export type { PaperCase, QuestionPart, AnswerSpec } from './types'
export const PAPERS: PaperCase[] = [...IGCSE_PAPERS, ...AS_PAPERS]
export function paperById(id: string) {
  return PAPERS.find((p) => p.id === id)
}
