import { useCallback, type ReactNode } from 'react'
import { Check, Lock, PartyPopper } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGame } from '@/game/GameContext'
import { useNav } from '@/game/nav'
import { cn } from '@/lib/utils'
import { ConceptCard } from './ConceptCard'

export interface LessonPart {
  id: string
  title: string
  concept?: { title: string; text: string }
  render: (props: { complete: boolean; onComplete: () => void }) => ReactNode
}

const PART_XP = 15
const CLAIM_XP = 20

/**
 * Every day's lesson: a few parts that unlock in order, then a claim button
 * that passes the lesson and opens the ticket owner's DM.
 */
export function LessonShell({
  lesson,
  day,
  title,
  intro,
  minutes = 8,
  parts,
}: {
  lesson: string
  day: number
  title: string
  intro: string
  minutes?: number
  parts: LessonPart[]
}) {
  const { story, progress, completeLessonPart, passLesson } = useGame()
  const { go } = useNav()
  const done = progress.lessons[lesson]?.parts ?? []
  const passed = progress.lessons[lesson]?.passed
  const has = (id: string) => done.includes(id)
  const unlocked = (i: number) => i === 0 || has(parts[i - 1].id)
  const allDone = parts.every((p) => has(p.id))

  const meta = story.days.find((d) => d.day === day)
  const ticket = story.tickets.find((t) => t.id === meta?.ticket)
  const dm = story.channels.find((c) => c.kind === 'dm' && c.with === ticket?.from)?.id ?? 'general'
  const owner = ticket ? story.cast[ticket.from].name.split(' ')[0] : 'the team'

  const finish = useCallback(
    (id: string) => () => completeLessonPart(lesson, id, { xp: PART_XP }),
    [completeLessonPart, lesson],
  )

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <Badge variant="secondary">
          Studio Academy · Day {day} · about {minutes} minutes
        </Badge>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{intro}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          {parts.map((p, i) => (
            <Badge key={p.id} variant={has(p.id) ? 'success' : unlocked(i) ? 'default' : 'outline'}>
              {has(p.id) ? <Check /> : !unlocked(i) && <Lock />} {i + 1}. {p.title}
            </Badge>
          ))}
        </div>
      </div>

      {parts.map((p, i) => (
        <section
          key={p.id}
          className={cn('flex flex-col gap-4', !unlocked(i) && 'pointer-events-none opacity-40')}
          aria-disabled={!unlocked(i)}
        >
          <h2 className="text-xl font-semibold">
            {i + 1}. {p.title}
          </h2>
          {p.concept && <ConceptCard title={p.concept.title} text={p.concept.text} />}
          {p.render({ complete: has(p.id), onComplete: finish(p.id) })}
        </section>
      ))}

      <Card className={cn(!allDone && 'opacity-60')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PartyPopper className="size-5 text-primary" /> {passed ? 'Ticket unlocked' : 'Unlock your ticket'}
          </CardTitle>
          <CardDescription>
            {passed
              ? `${owner} sent you ${ticket?.id}. Now do it for real, in your own terminal.`
              : `Finish all ${parts.length} parts, then claim your badge and your ticket from ${owner}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          {passed ? (
            <Button onClick={() => go({ type: 'channel', id: dm })}>Open {owner}'s DM</Button>
          ) : (
            <Button
              disabled={!allDone}
              onClick={() => {
                passLesson(lesson, { xp: CLAIM_XP, badge: `Academy: Day ${day}` })
                go({ type: 'channel', id: dm })
              }}
            >
              Claim badge and open ticket
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
