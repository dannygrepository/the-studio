import type { Beat, ChoiceRecord, Condition, Progress, Reviews, Reward, Story, TicketStatus } from './types'

export function pickedChoice(choices: ChoiceRecord[], beatId: string) {
  return choices.find((c) => c.beat === beatId)
}

export function hasReview(reviews: Reviews, ticket: string, result: string) {
  return (reviews[ticket] ?? []).some((a) => a.result === result)
}

/**
 * Build the playable story: merge in reviews and expand coachNotes
 * placeholders into real message beats.
 */
export function buildStory(raw: Omit<Story, 'reviews'>, reviews: Reviews): Story {
  const beats: Beat[] = []
  for (const beat of raw.beats) {
    if (!beat.coachNotes) {
      beats.push(beat)
      continue
    }
    const { ticket, result } = beat.coachNotes
    const notes = (reviews[ticket] ?? []).filter((a) => a.result === result).flatMap((a) => a.notes ?? [])
    notes.forEach((n, i) =>
      beats.push({
        id: `${beat.id}-n${i + 1}`,
        channel: beat.channel,
        from: n.from,
        text: n.text,
        phase: beat.phase,
        time: beat.time,
        requires: { ...beat.requires, review: beat.coachNotes },
      }),
    )
  }
  return { ...raw, beats, reviews }
}

function meets(cond: Condition | undefined, progress: Progress, choices: ChoiceRecord[], reviews: Reviews) {
  if (!cond) return true
  if (cond.review && !hasReview(reviews, cond.review.ticket, cond.review.result)) return false
  if (cond.choice) {
    const [beat, choice] = cond.choice.split(':')
    if (pickedChoice(choices, beat)?.choice !== choice) return false
  }
  for (const [who, min] of Object.entries(cond.minRep ?? {})) {
    if ((progress.reputation[who as keyof Progress['reputation']] ?? 0) < (min ?? 0)) return false
  }
  for (const [who, max] of Object.entries(cond.maxRep ?? {})) {
    if ((progress.reputation[who as keyof Progress['reputation']] ?? 0) > (max ?? 0)) return false
  }
  return true
}

/** Which day a beat belongs to, from its id prefix "d1-". */
export function dayOf(beat: Beat) {
  const m = /^d(\d+)-/.exec(beat.id)
  return m ? Number(m[1]) : 1
}

export function ticketStatus(story: Story, progress: Progress, day: number): TicketStatus {
  const d = story.days.find((x) => x.day === day)
  if (!d) return 'locked'
  const attempts = story.reviews[d.ticket] ?? []
  const last = attempts[attempts.length - 1]
  if (last?.result === 'pass') return 'done'
  if (last?.result === 'redo') return 'changes'
  const explicit = progress.tickets[d.ticket]
  if (explicit) return explicit
  return progress.lessons[d.lesson]?.passed ? 'open' : 'locked'
}

function phaseUnlocked(beat: Beat, story: Story, progress: Progress) {
  const day = dayOf(beat)
  if (day > progress.day) return false
  if (beat.phase === 'intro' || day < progress.day) return true
  const d = story.days.find((x) => x.day === day)
  if (!d) return false
  const lessonPassed = progress.lessons[d.lesson]?.passed
  // Ticket beats unlock when the lesson is passed. Review beats are written
  // by your coach after you say "done", so they show as soon as they exist
  // (and the lesson is passed).
  return !!lessonPassed
}

/**
 * The beats you can see in a channel. Conversation pauses at an unanswered
 * choice: later beats in that channel wait until you pick a reply.
 */
export function visibleBeats(
  story: Story,
  progress: Progress,
  choices: ChoiceRecord[],
  channel: string,
): Beat[] {
  const out: Beat[] = []
  for (const beat of story.beats) {
    if (beat.channel !== channel) continue
    if (!phaseUnlocked(beat, story, progress)) continue
    if (!meets(beat.requires, progress, choices, story.reviews)) continue
    out.push(beat)
    if (beat.choices?.length && !pickedChoice(choices, beat.id)) break
  }
  return out
}

export function allVisibleBeats(story: Story, progress: Progress, choices: ChoiceRecord[]) {
  return story.channels.flatMap((c) => visibleBeats(story, progress, choices, c.id))
}

export function applyReward(progress: Progress, reward: Reward | undefined): Progress {
  if (!reward) return progress
  const reputation = { ...progress.reputation }
  for (const [who, delta] of Object.entries(reward.rep ?? {})) {
    const k = who as keyof Progress['reputation']
    reputation[k] = (reputation[k] ?? 0) + (delta ?? 0)
  }
  const badges =
    reward.badge && !progress.badges.includes(reward.badge)
      ? [...progress.badges, reward.badge]
      : progress.badges
  return {
    ...progress,
    xp: progress.xp + (reward.xp ?? 0),
    reputation,
    badges,
    tickets: { ...progress.tickets, ...(reward.tickets ?? {}) },
    day: Math.max(progress.day, reward.day ?? 0),
  }
}
