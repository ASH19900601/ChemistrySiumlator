// Per-viewer conveniences only (answers in progress, self-marking, preferences).
// Every access is guarded: storage can be unavailable (private mode, blocked site data).

const PREFIX = 'qa-lab:'

export function load<T>(key: string, fallback: T, validate?: (value: unknown) => boolean): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    const value: unknown = JSON.parse(raw)
    if (value === null || typeof value !== typeof fallback || Array.isArray(value) !== Array.isArray(fallback)) return fallback
    if (validate && !validate(value)) return fallback
    return value as T
  } catch {
    return fallback
  }
}

export const isAnswers = (value: unknown) => isRecord(value) && Object.values(value).every(v => typeof v === 'string')
export const isMarks = (value: unknown) => isRecord(value) && Object.values(value).every(v => Number.isInteger(v) && (v as number) >= 0)
function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

export function remove(key: string) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    /* ignore */
  }
}
