// Per-viewer conveniences only (answers in progress, self-marking, preferences).
// Every access is guarded: storage can be unavailable (private mode, blocked site data).

const PREFIX = 'qa-lab:'

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
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
