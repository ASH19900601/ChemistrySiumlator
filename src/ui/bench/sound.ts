// Small synthesised sound effects (no audio files). Created lazily after the first user gesture.

let ctx: AudioContext | null = null
let enabled = true
let pourNode: { src: AudioBufferSourceNode; gain: GainNode } | null = null

export function setSoundEnabled(on: boolean) {
  enabled = on
  if (!on) stopPour()
}

function ac(): AudioContext | null {
  if (!enabled) return null
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function noise(c: AudioContext, seconds: number) {
  const buf = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * seconds)), c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return buf
}

function burst(freq: number, q: number, seconds: number, gain: number, type: BiquadFilterType = 'bandpass') {
  const c = ac()
  if (!c) return
  const src = c.createBufferSource()
  src.buffer = noise(c, seconds)
  const f = c.createBiquadFilter()
  f.type = type
  f.frequency.value = freq
  f.Q.value = q
  const g = c.createGain()
  g.gain.setValueAtTime(gain, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + seconds)
  src.connect(f).connect(g).connect(c.destination)
  src.start()
}

export const sound = {
  drop() {
    const c = ac()
    if (!c) return
    const o = c.createOscillator()
    const g = c.createGain()
    o.frequency.setValueAtTime(1400, c.currentTime)
    o.frequency.exponentialRampToValueAtTime(500, c.currentTime + 0.08)
    g.gain.setValueAtTime(0.12, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.12)
    o.connect(g).connect(c.destination)
    o.start()
    o.stop(c.currentTime + 0.13)
  },
  clink() {
    const c = ac()
    if (!c) return
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = 'triangle'
    o.frequency.value = 2600
    g.gain.setValueAtTime(0.05, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.25)
    o.connect(g).connect(c.destination)
    o.start()
    o.stop(c.currentTime + 0.26)
  },
  ignite: () => burst(300, 0.7, 0.6, 0.5, 'lowpass'),
  strike: () => burst(2500, 1.5, 0.25, 0.25),
  pop: () => burst(900, 0.8, 0.12, 0.9, 'lowpass'),
  hiss: () => burst(5000, 0.6, 0.4, 0.08),
  startPour() {
    const c = ac()
    if (!c || pourNode) return
    const src = c.createBufferSource()
    src.buffer = noise(c, 2)
    src.loop = true
    const f = c.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = 1200
    f.Q.value = 1.2
    const g = c.createGain()
    g.gain.value = 0.05
    src.connect(f).connect(g).connect(c.destination)
    src.start()
    pourNode = { src, gain: g }
  },
  stopPour,
}

function stopPour() {
  if (!pourNode) return
  try {
    pourNode.src.stop()
  } catch {
    /* already stopped */
  }
  pourNode = null
}
