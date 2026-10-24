import { useEffect, useRef } from 'react'
export function ConfirmDialog({ title, onCancel, onConfirm }: { title: string; onCancel: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { ref.current?.showModal(); return () => ref.current?.close() }, [])
  return <dialog ref={ref} aria-label={title} onCancel={e => { e.preventDefault(); onCancel() }}>
    <p>{title}</p><p>You can compare your answers with the mark scheme after finishing.</p>
    <button className="btn" autoFocus onClick={onCancel}>Keep working</button>{' '}
    <button className="btn primary" onClick={onConfirm}>Confirm finish</button>
  </dialog>
}
