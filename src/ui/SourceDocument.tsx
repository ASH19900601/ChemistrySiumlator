import { useEffect, useRef, useState } from 'react'
import type { SourceAsset } from '../papers/types'
import { load, save } from './storage'

export const sourceAssetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`

/** Original page images, with zoom measured from the actual phone viewport. */
export function SourceDocument({ asset, title, originalPages }: { asset: SourceAsset; title: string; originalPages?: readonly number[] }) {
  const key = `document:${asset.pdf}`
  const [width, setWidth] = useState(() => load(`${key}:width`, 0, value => typeof value === 'number' && value >= 0 && value <= 2400))
  const [failed, setFailed] = useState(false)
  const pages = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState('0')
  const [viewport, setViewport] = useState(0)
  useEffect(() => {
    const el = pages.current!
    const observer = new ResizeObserver(() => setViewport(el.clientWidth))
    observer.observe(el)
    el.scrollTop = load(`${key}:top`, 0)
    el.scrollLeft = load(`${key}:left`, 0)
    return () => observer.disconnect()
  }, [key])
  useEffect(() => { save(`${key}:width`, width) }, [key, width])
  const zoom = (factor: number) => setWidth(w => Math.max(160, Math.min(2400, Math.round((w || viewport || 320) * factor))))
  return <section className="source-document" aria-label={title}>
    <div className="document-controls">
      <strong>{title}</strong>
      <a className="btn" href={sourceAssetUrl(asset.pdf)} target="_blank" rel="noreferrer">Open PDF</a>
      <button className="btn" aria-label={`Zoom out ${title}`} onClick={() => zoom(0.8)}>−</button>
      <span>{viewport ? `${Math.round((width || viewport) / viewport * 100)}%` : 'Fit'}</span>
      <button className="btn" aria-label={`Zoom in ${title}`} onClick={() => zoom(1.25)}>+</button>
      <button className="btn" aria-label={`Fit ${title}`} onClick={() => setWidth(0)}>Fit</button>
      <label>Page<select aria-label={`Page of ${title}`} value={page} onChange={e => {
        setPage(e.target.value)
        const el = pages.current!, figure = el.children[Number(e.target.value)] as HTMLElement
        el.scrollTop = figure.offsetTop - (el.firstElementChild as HTMLElement).offsetTop
      }}>{asset.pages.map((p, i) => <option key={p.path} value={i}>{originalPages?.[i] ?? i + 1}</option>)}</select></label>
    </div>
    {failed && <p role="alert">A source page could not load. Use Open PDF or restore the paper resources described in the project README.</p>}
    <div className="source-pages" ref={pages} onScroll={e => {
      save(`${key}:top`, e.currentTarget.scrollTop); save(`${key}:left`, e.currentTarget.scrollLeft)
    }}>
      {asset.pages.map((p, i) => <figure key={p.path} style={{ width: width ? `${width}px` : undefined }}>
        <img src={sourceAssetUrl(p.path)} width={p.width} height={p.height} loading={i ? 'lazy' : 'eager'}
          alt={`${title}, original page ${originalPages?.[i] ?? i + 1}`} onError={() => setFailed(true)} />
        <figcaption>{title} · page {originalPages?.[i] ?? i + 1}</figcaption>
      </figure>)}
    </div>
  </section>
}
