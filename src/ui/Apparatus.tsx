import type { ReagentDef } from '../engine'

/** Dropper bottle / reagent jar / dish, drawn in SVG. */
export function ReagentBottle({ r, onClick, active }: { r: ReagentDef; onClick: () => void; active?: boolean }) {
  const amber = r.id.startsWith('AgNO3') || r.id.startsWith('KMnO4') || r.id.startsWith('KI') || r.id === 'starch'
  const glass = amber ? 'rgba(122,70,30,0.78)' : 'rgba(215,230,236,0.42)'
  const tint = r.bottleTint ?? (amber ? undefined : 'rgba(225,238,245,0.5)')
  const lines = wrap(r.short, 11)
  return (
    <button className={`bottle${active ? ' active' : ''}`} onClick={onClick} title={r.label} aria-label={r.label}>
      <svg viewBox="0 0 64 104">
        {r.kind === 'solution' ? (
          <>
            {/* dropper */}
            <ellipse cx="32" cy="10" rx="8" ry="9" fill="#2c2a29" />
            <rect x="26" y="16" width="12" height="10" rx="2" fill="#3b3836" />
            <rect x="22" y="24" width="20" height="10" rx="3" fill={glass} stroke="rgba(60,60,60,0.5)" />
            <rect x="8" y="32" width="48" height="66" rx="9" fill={glass} stroke="rgba(60,60,60,0.55)" strokeWidth="1.2" />
            {tint && <rect x="10" y="46" width="44" height="50" rx="7" fill={tint} opacity={amber ? 0.4 : 0.85} />}
            <rect x="12" y="36" width="5" height="56" rx="2.5" fill="rgba(255,255,255,0.35)" />
          </>
        ) : r.kind === 'solid' ? (
          <>
            <rect x="12" y="22" width="40" height="10" rx="2" fill="#4a5a6a" />
            <rect x="9" y="30" width="46" height="68" rx="6" fill="rgba(220,232,238,0.45)" stroke="rgba(60,60,60,0.5)" />
            <rect x="11" y="62" width="42" height="34" rx="4" fill={r.compound === 'MnO2' ? '#2a2622' : r.compound === 'Zn' ? '#a3a8ad' : '#f4f4f0'} />
          </>
        ) : (
          <>
            <ellipse cx="32" cy="80" rx="28" ry="9" fill="rgba(220,232,238,0.6)" stroke="rgba(60,60,60,0.5)" />
            <ellipse cx="32" cy="77" rx="25" ry="7" fill="rgba(240,246,250,0.7)" />
            {r.compound === 'Mg' ? (
              <rect x="16" y="73" width="32" height="4" rx="1" fill="#b9bdc2" stroke="#7d8287" strokeWidth="0.6" transform="rotate(-8 32 75)" />
            ) : (
              <path d="M20 79 l6 -8 l7 5 l6 -7 l6 9 l-8 5 Z" fill="#d7dade" stroke="#8a9096" strokeWidth="0.6" />
            )}
          </>
        )}
        <rect x="13" y={r.kind === 'piece' ? 34 : 52} width="38" height={lines.length * 9 + 6} rx="2" fill="#fbfaf4" stroke="#bdb6a6" strokeWidth="0.6" />
        {lines.map((l, i) => (
          <text key={i} x="32" y={(r.kind === 'piece' ? 34 : 52) + 10 + i * 9} textAnchor="middle" className="bottle-text">
            {l}
          </text>
        ))}
      </svg>
      <span className="bottle-caption">{r.short}</span>
    </button>
  )
}

function wrap(s: string, n: number): string[] {
  const words = s.split(/\s+/)
  const out: string[] = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > n && cur) {
      out.push(cur)
      cur = w
    } else cur = (cur + ' ' + w).trim()
  }
  if (cur) out.push(cur)
  return out.slice(0, 3)
}

export type ToolId =
  | 'bunsen'
  | 'red-litmus'
  | 'blue-litmus'
  | 'limewater'
  | 'glowing-splint'
  | 'lighted-splint'
  | 'flame-wire'
  | 'ui-paper'
  | 'filter'
  | 'wash-bottle'
  | 'waste'

export const TOOL_LABELS: Record<ToolId, string> = {
  bunsen: 'Bunsen burner',
  'red-litmus': 'Damp red litmus',
  'blue-litmus': 'Damp blue litmus',
  limewater: 'Limewater',
  'glowing-splint': 'Glowing splint',
  'lighted-splint': 'Lighted splint',
  'flame-wire': 'Flame test wire',
  'ui-paper': 'Universal indicator paper',
  filter: 'Filter funnel',
  'wash-bottle': 'Rinse (wash bottle)',
  waste: 'Empty into waste',
}

export function ToolIcon({ id }: { id: ToolId }) {
  switch (id) {
    case 'bunsen':
      return (
        <svg viewBox="0 0 60 80">
          <path d="M30 6 C 22 18 24 28 30 34 C 36 28 38 18 30 6 Z" fill="rgba(80,120,255,0.65)" />
          <path d="M30 16 C 27 24 28 28 30 32 C 32 28 33 24 30 16 Z" fill="rgba(180,215,255,0.9)" />
          <rect x="25" y="34" width="10" height="30" fill="#8d9298" stroke="#555" strokeWidth="0.8" />
          <rect x="24" y="44" width="12" height="5" fill="#6c7177" />
          <rect x="12" y="64" width="36" height="8" rx="3" fill="#3f4448" />
        </svg>
      )
    case 'red-litmus':
    case 'blue-litmus':
      return (
        <svg viewBox="0 0 60 80">
          <rect x="22" y="8" width="16" height="62" rx="1.5" fill={id === 'red-litmus' ? '#d4574f' : '#4f74c8'} stroke="rgba(0,0,0,0.25)" />
          <rect x="22" y="8" width="16" height="12" fill="rgba(255,255,255,0.25)" />
        </svg>
      )
    case 'limewater':
      return (
        <svg viewBox="0 0 60 80">
          <rect x="22" y="6" width="16" height="62" rx="8" fill="rgba(220,235,242,0.4)" stroke="rgba(70,85,95,0.6)" strokeWidth="1.5" />
          <rect x="23.5" y="30" width="13" height="36" rx="6" fill="rgba(235,245,248,0.85)" />
          <path d="M30 6 L30 -4" stroke="#555" />
        </svg>
      )
    case 'glowing-splint':
    case 'lighted-splint':
      return (
        <svg viewBox="0 0 60 80">
          <rect x="27" y="18" width="6" height="58" rx="1" fill="#d6b27a" stroke="#a5824e" strokeWidth="0.6" transform="rotate(14 30 46)" />
          {id === 'lighted-splint' ? (
            <path d="M24 20 C 18 10 22 4 26 0 C 28 8 34 8 30 18 Z" fill="#f6a23a" />
          ) : (
            <circle cx="25" cy="18" r="3.5" fill="#e2471f" />
          )}
        </svg>
      )
    case 'flame-wire':
      return (
        <svg viewBox="0 0 60 80">
          <rect x="27" y="40" width="6" height="36" rx="2" fill="#6f4b2e" />
          <path d="M30 40 L30 10" stroke="#9aa0a6" strokeWidth="2" />
          <circle cx="30" cy="8" r="3.5" fill="none" stroke="#9aa0a6" strokeWidth="2" />
        </svg>
      )
    case 'ui-paper':
      return (
        <svg viewBox="0 0 60 80">
          <rect x="21" y="8" width="18" height="62" rx="1.5" fill="#e9d89a" stroke="rgba(0,0,0,0.2)" />
          <rect x="21" y="8" width="18" height="16" fill="#d9a441" />
        </svg>
      )
    case 'filter':
      return (
        <svg viewBox="0 0 60 80">
          <path d="M6 10 L54 10 L33 42 L33 72 L27 72 L27 42 Z" fill="rgba(220,235,242,0.35)" stroke="rgba(70,85,95,0.6)" strokeWidth="1.5" />
          <path d="M12 13 L48 13 L30 38 Z" fill="#f7f5ee" stroke="#cfc8b8" />
        </svg>
      )
    case 'wash-bottle':
      return (
        <svg viewBox="0 0 60 80">
          <path d="M30 14 L46 4" stroke="#bbb" strokeWidth="3" />
          <rect x="24" y="12" width="12" height="8" fill="#d8dde2" />
          <rect x="14" y="20" width="32" height="54" rx="10" fill="rgba(230,240,246,0.8)" stroke="rgba(70,85,95,0.5)" />
          <text x="30" y="52" textAnchor="middle" fontSize="7" fill="#4a6a8a">H₂O</text>
        </svg>
      )
    case 'waste':
      return (
        <svg viewBox="0 0 60 80">
          <path d="M10 18 L50 18 L46 74 L14 74 Z" fill="rgba(220,235,242,0.35)" stroke="rgba(70,85,95,0.6)" strokeWidth="1.5" />
          <path d="M14 48 L46 48 L45.5 72 L14.5 72 Z" fill="rgba(160,150,120,0.35)" />
          <text x="30" y="40" textAnchor="middle" fontSize="7" fill="#555">WASTE</text>
        </svg>
      )
  }
}
