import type { Choices, Progress } from './types'

export const DEFAULT_PROGRESS: Progress = {
  day: 1,
  xp: 0,
  reputation: { priya: 0, gus: 0, dot: 0, bjorn: 0, ci3po: 0 },
  badges: [],
  lessons: {},
  tickets: {},
  applied: [],
  seen: [],
  onboarded: false,
}

export const DEFAULT_CHOICES: Choices = { choices: [] }
