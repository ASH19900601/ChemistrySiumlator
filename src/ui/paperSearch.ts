import type { PaperCase } from '../papers'
/** Search the printed course/component notation as well as archive IDs and session names. */
export function matchesPaper(p: PaperCase, query: string): boolean {
  const source = p.source
  const printed = source ? `${source.code}/${source.paper} ${source.code} ${source.paper} ${source.year} ${source.session === 's' ? 'summer june may' : source.session === 'w' ? 'winter november october' : 'march february'}` : ''
  const text = `${p.id} ${p.series} ${p.component} ${p.level} ${printed}`.toLowerCase()
  return query.trim().toLowerCase().split(/\s+/).every(token => text.includes(token))
}
