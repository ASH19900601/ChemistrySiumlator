// Pictures of test results (litmus, limewater, splints, flame colours, indicator paper).
// They are derived from the engine's observation text so they always agree with it.

import type { ActionResult } from '../engine'

const FLAME: [RegExp, string, string][] = [
  [/Yellow flame/, '#ffc21a', '#fff1a8'],
  [/Lilac flame/, '#b58ae0', '#efe2ff'],
  [/Orange-red flame/, '#ff6a2a', '#ffd0a8'],
  [/Light green flame/, '#9ee06a', '#e8ffd2'],
  [/Blue-green flame/, '#27c2a8', '#c8fff3'],
  [/Red flame/, '#ff2f3a', '#ffc2c2'],
]

const UI_COLOURS: Record<string, string> = {
  red: '#d9342b', orange: '#f08a24', yellow: '#e9cf2a', green: '#4caf50', 'blue-green': '#2a9d8f', blue: '#2f5fb3', purple: '#6a3d9a',
}

export function ResultVisual({ result }: { result: ActionResult }) {
  const text = result.observations.map((o) => o.text).join(' ')
  const a = result.action
  if (a.includes('flame test')) {
    const hit = FLAME.find(([re]) => re.test(text))
    const outer = hit?.[1] ?? 'rgba(90,130,255,0.6)'
    const inner = hit?.[2] ?? 'rgba(190,220,255,0.9)'
    return (
      <svg viewBox="0 0 80 110" className="result-visual" aria-hidden>
        <path d="M40 6 C 18 40 22 70 40 92 C 58 70 62 40 40 6 Z" fill={outer} opacity="0.85" className="flicker" />
        <path d="M40 34 C 30 56 32 74 40 88 C 48 74 50 56 40 34 Z" fill={inner} opacity="0.9" />
        <rect x="34" y="92" width="12" height="16" fill="#8d9298" />
      </svg>
    )
  }
  if (a.includes('universal indicator')) {
    const m = text.match(/turns ([a-z-]+):/)
    const col = UI_COLOURS[m?.[1] ?? ''] ?? '#e9d89a'
    return (
      <svg viewBox="0 0 160 70" className="result-visual wide" aria-hidden>
        <rect x="8" y="8" width="18" height="54" fill="#e9d89a" />
        <rect x="8" y="8" width="18" height="22" fill={col} />
        {Object.entries({ 1: 'red', 3: 'orange', 5: 'yellow', 7: 'green', 9: 'blue-green', 11: 'blue', 13: 'purple' }).map(([ph, c], i) => (
          <g key={ph}>
            <rect x={40 + i * 17} y="20" width="15" height="18" fill={UI_COLOURS[c]} />
            <text x={47.5 + i * 17} y="52" textAnchor="middle" fontSize="9" fill="#333">
              {ph}
            </text>
          </g>
        ))}
      </svg>
    )
  }
  if (a.includes('damp red litmus') || a.includes('damp blue litmus')) {
    const red = a.includes('red litmus')
    let col = red ? '#d4574f' : '#4f74c8'
    if (/bleached/.test(text)) col = '#f3f1ea'
    else if (red && /turns blue/.test(text)) col = '#4f74c8'
    else if (!red && /slightly red/.test(text)) col = '#8a5aa0'
    else if (!red && /turns red/.test(text)) col = '#d4574f'
    return (
      <svg viewBox="0 0 80 110" className="result-visual" aria-hidden>
        <rect x="30" y="10" width="20" height="90" rx="2" fill={red ? '#d4574f' : '#4f74c8'} />
        <rect x="30" y="10" width="20" height="36" rx="2" fill={col} className="fade-in" />
      </svg>
    )
  }
  if (a.includes('limewater')) {
    const milky = /milky/.test(text)
    return (
      <svg viewBox="0 0 80 110" className="result-visual" aria-hidden>
        <rect x="28" y="8" width="24" height="92" rx="12" fill="rgba(220,235,242,0.35)" stroke="rgba(70,85,95,0.6)" strokeWidth="2" />
        <rect x="30" y="40" width="20" height="58" rx="10" fill={milky ? 'rgba(248,248,246,0.95)' : 'rgba(230,242,247,0.6)'} className="fade-in" />
        <path d="M40 8 L40 -6" stroke="#666" strokeWidth="2" />
      </svg>
    )
  }
  if (a.includes('glowing splint') || a.includes('lighted splint')) {
    const glowing = a.includes('glowing')
    const relit = /relights/.test(text)
    const pop = /pop/.test(text)
    const out = /goes out|extinguished/.test(text)
    return (
      <svg viewBox="0 0 80 110" className="result-visual" aria-hidden>
        <rect x="37" y="30" width="6" height="78" rx="1" fill="#d6b27a" stroke="#a5824e" />
        {pop && <path d="M40 4 L46 18 L60 14 L50 26 L62 34 L46 32 L40 46 L34 32 L18 34 L30 26 L20 14 L34 18 Z" fill="#ffd64a" className="pop" />}
        {!pop && (relit || (!glowing && !out)) && <path d="M40 30 C 30 16 34 8 40 2 C 44 12 52 14 44 28 Z" fill="#f6a23a" className="flicker" />}
        {!pop && glowing && !relit && !out && <circle cx="40" cy="30" r="4" fill="#e2471f" />}
        {out && <circle cx="40" cy="30" r="3" fill="#3a2b20" />}
      </svg>
    )
  }
  if (a.includes('manganate(VII)') && a.startsWith('Test the gas')) {
    const dec = /colourless/.test(text)
    return (
      <svg viewBox="0 0 80 110" className="result-visual" aria-hidden>
        <rect x="28" y="8" width="24" height="92" rx="12" fill="rgba(220,235,242,0.35)" stroke="rgba(70,85,95,0.6)" strokeWidth="2" />
        <rect x="30" y="40" width="20" height="58" rx="10" fill={dec ? 'rgba(235,242,246,0.6)' : 'rgba(140,30,120,0.85)'} className="fade-in" />
      </svg>
    )
  }
  if (a.includes('dichromate')) {
    const green = /green/.test(text)
    return (
      <svg viewBox="0 0 80 110" className="result-visual" aria-hidden>
        <rect x="30" y="10" width="20" height="90" rx="2" fill="#e0822a" />
        <rect x="30" y="10" width="20" height="36" rx="2" fill={green ? '#3f8a45' : '#e0822a'} className="fade-in" />
      </svg>
    )
  }
  return null
}
