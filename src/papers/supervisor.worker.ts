import { Lab } from '../engine'
import { paperById } from './index'
// Run the reference chemistry outside the rendering thread, once per submitted view.
self.onmessage = (event: MessageEvent<string>) => {
  try {
    const paper = paperById(event.data)
    if (!paper || paper.coverage === 'source-only') throw new Error('No verified reference procedure')
    self.postMessage({ results: paper.supervisor(new Lab(paper)) })
  } catch {
    self.postMessage({ error: true })
  }
}
