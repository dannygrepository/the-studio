export type CastId = 'you' | 'priya' | 'gus' | 'dot' | 'bjorn' | 'ci3po'
export type CoworkerId = Exclude<CastId, 'you'>

export type ChannelId = string

export interface CastMember {
  name: string
  role: string
  initials: string
  /** Token-backed color key; maps to bg-cast-* utilities in CastAvatar. */
  color: 'you' | 'priya' | 'gus' | 'dot' | 'bjorn' | 'bot'
  status?: string
}

export interface Channel {
  id: ChannelId
  name: string
  kind: 'channel' | 'dm'
  topic: string
  /** For DMs: who the DM is with. */
  with?: CoworkerId
}

export interface Reward {
  xp?: number
  rep?: Partial<Record<CoworkerId, number>>
  badge?: string
  /** Move a ticket along, e.g. { "STU-1": "done" }. */
  tickets?: Record<string, TicketStatus>
  /** Advance to a new day. */
  day?: number
}

export interface Reply {
  from: CastId
  text: string
}

export interface Choice {
  id: string
  text: string
  reward?: Reward
  /** Coworker replies that appear after you pick this choice. */
  replies?: Reply[]
}

export type Phase = 'intro' | 'ticket' | 'review'

export interface Condition {
  /** "beatId:choiceId" that must have been picked. */
  choice?: string
  /** Minimum reputation with coworkers. */
  minRep?: Partial<Record<CoworkerId, number>>
  maxRep?: Partial<Record<CoworkerId, number>>
}

export interface Beat {
  id: string
  channel: ChannelId
  from: CastId
  text: string
  phase: Phase
  /** Cosmetic timestamp, e.g. "9:02 AM". */
  time?: string
  choices?: Choice[]
  /** Applied once, the first time this beat is shown. */
  reward?: Reward
  requires?: Condition
  /** Renders a ticket card for this ticket id under the message. */
  ticket?: string
  /** Renders a "start lesson" call to action for this lesson id. */
  lesson?: string
}

export interface Ticket {
  id: string
  title: string
  from: CoworkerId
  summary: string
  branch: string
  steps: string[]
  acceptance: string[]
  xp: number
}

export interface Day {
  day: number
  title: string
  subtitle: string
  lesson: string
  ticket: string
}

export interface Story {
  meta: { title: string; company: string; version: number }
  cast: Record<CastId, CastMember>
  channels: Channel[]
  days: Day[]
  tickets: Ticket[]
  beats: Beat[]
}

export type TicketStatus = 'locked' | 'open' | 'in-review' | 'done'

export interface Progress {
  day: number
  xp: number
  reputation: Record<CoworkerId, number>
  badges: string[]
  lessons: Record<string, { passed: boolean; parts: string[] }>
  tickets: Record<string, TicketStatus>
  /** Beats whose rewards were already applied. */
  applied: string[]
  /** Beats you've seen, for unread counts. */
  seen: string[]
}

export interface ChoiceRecord {
  beat: string
  choice: string
  day: number
  at: string
}

export interface Choices {
  choices: ChoiceRecord[]
}
