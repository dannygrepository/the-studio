export const LEVELS = [
  { xp: 0, title: 'New Hire' },
  { xp: 100, title: 'Committed Designer' },
  { xp: 250, title: 'History Buff' },
  { xp: 400, title: 'Reviewer in Training' },
  { xp: 600, title: 'Conflict Resolver' },
  { xp: 800, title: 'Rebase Wrangler' },
  { xp: 1000, title: 'AI Whisperer' },
  { xp: 1200, title: 'Incident Hero' },
  { xp: 1500, title: 'Design Engineer' },
]

export function levelFor(xp: number) {
  let index = 0
  LEVELS.forEach((l, i) => {
    if (xp >= l.xp) index = i
  })
  const current = LEVELS[index]
  const next = LEVELS[index + 1]
  const pct = next ? Math.round(((xp - current.xp) / (next.xp - current.xp)) * 100) : 100
  return { index, title: current.title, next, pct }
}

/** How a coworker feels about you, from their reputation score. */
export function moodFor(score: number) {
  if (score >= 8) return 'Fan'
  if (score >= 4) return 'Warm'
  if (score >= 0) return 'Neutral'
  if (score >= -3) return 'Wary'
  return 'Skeptical'
}
