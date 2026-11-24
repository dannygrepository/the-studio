/**
 * Saves progress.json and choices.json.
 *
 * In dev (`npm run dev`) the Vite plugin in vite.config.ts writes real files
 * to game/progress.json and game/choices.json, so your coach can read them.
 * If that API isn't there (e.g. a static build), we fall back to localStorage.
 */
type SaveName = 'progress' | 'choices'

const LS_PREFIX = 'the-studio:'

export async function load<T>(name: SaveName, fallback: T): Promise<T> {
  try {
    const res = await fetch(`/api/save/${name}`)
    if (res.ok) {
      const data = await res.json()
      return { ...fallback, ...data }
    }
  } catch {
    /* fall through to localStorage */
  }
  const raw = localStorage.getItem(LS_PREFIX + name)
  return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
}

export async function save(name: SaveName, data: unknown): Promise<void> {
  localStorage.setItem(LS_PREFIX + name, JSON.stringify(data))
  try {
    await fetch(`/api/save/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data, null, 2),
    })
  } catch {
    /* localStorage already has it */
  }
}

export async function reset(): Promise<void> {
  localStorage.removeItem(LS_PREFIX + 'progress')
  localStorage.removeItem(LS_PREFIX + 'choices')
  try {
    await fetch('/api/save/reset', { method: 'POST' })
  } catch {
    /* ignore */
  }
}
