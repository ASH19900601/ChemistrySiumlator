import { useState } from 'react'
import type { SourceAsset } from '../papers/types'

export const sourceAssetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`

/** Page images keep the original layout readable on browsers without an inline PDF viewer. */
export function SourceDocument({ asset, title, originalPages }: { asset: SourceAsset; title: string; originalPages?: readonly number[] }) {
  const [width, setWidth] = useState<number | null>(null)
  const [failed, setFailed] = useState(false)
  return <section className="source-document" aria-label={title}>
    <div className="document-controls">
      <strong>{title}</strong>
      <a className="btn" href={sourceAssetUrl(asset.pdf)} target="_blank" rel="noreferrer">Open PDF</a>
      <button className="btn" aria-label={`Zoom in ${title}`} onClick={() => setWidth(w => Math.min(1800, (w ?? 720) + 240))}>+</button>
      <button className="btn" aria-label={`Fit ${title}`} onClick={() => setWidth(null)}>Fit</button>
    </div>
    {failed && <p role="alert">A source page could not load. Use Open PDF to read the original document.</p>}
    <div className="source-pages">
      {asset.pages.map((p, i) => <figure key={p.path} style={{ width: width ? `${width}px` : undefined }}>
        <img src={sourceAssetUrl(p.path)} width={p.width} height={p.height} loading={i ? 'lazy' : 'eager'}
          alt={`${title}, original page ${originalPages?.[i] ?? i + 1}`} onError={() => setFailed(true)} />
        <figcaption>{title} · page {originalPages?.[i] ?? i + 1}</figcaption>
      </figure>)}
    </div>
  </section>
}
