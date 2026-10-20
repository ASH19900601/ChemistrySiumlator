import type { Lab, SampleDef } from '../engine'

export type AnswerSpec =
  | { kind: 'lines'; lines: number }
  | { kind: 'table'; header: [string, string]; rows: string[] }
  | { kind: 'fields'; fields: string[] }

export interface QuestionPart {
  /** stable id, e.g. "b-ii" */
  id: string
  /** printed label, e.g. "(b)(ii)" */
  label: string
  /** instructions printed before this part (procedure text that belongs to no single part) */
  preamble?: string
  text: string
  marks: number
  answer?: AnswerSpec
  /** published mark scheme points (for self-marking) */
  markScheme: string[]
}

export interface PaperCase {
  id: string
  syllabus: 'Cambridge IGCSE Chemistry 0620' | 'Cambridge International AS & A Level Chemistry 9701'
  level: 'IGCSE' | 'AS & A Level'
  series: string
  component: string
  question: number
  totalMarks: number
  /** neutral one-line description (must not give the answer away) */
  summary: string
  samples: SampleDef[]
  /** reagent ids available on the bench */
  reagents: string[]
  intro: string
  parts: QuestionPart[]
  /** confidential instructions: what the unknowns really are (revealed after marking) */
  identities: string[]
  /** parts of the original question that are not simulated */
  omitted?: string
  /** perform the question's instructions; returns the observations for each part id */
  supervisor: (lab: Lab) => Record<string, string>
}
