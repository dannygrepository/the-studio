import { useCallback } from 'react'
import { Check, Lock, PartyPopper } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGame } from '@/game/GameContext'
import { useNav } from '@/game/nav'
import { cn } from '@/lib/utils'
import { ConceptCard } from '../ConceptCard'
import { BranchPlayground } from './BranchPlayground'
import { CommitCourt } from './CommitCourt'
import { PracticeTerminal } from './PracticeTerminal'

const LESSON = 'day1'
const PART_XP = 15

const PARTS = [
  { id: 'playground', title: 'Snapshots, branches and push' },
  { id: 'court', title: "Gus's Commit Court" },
  { id: 'terminal', title: 'Practice terminal' },
] as const

export function Day1Lesson() {
  const { progress, completeLessonPart, passLesson } = useGame()
  const { go } = useNav()
  const done = progress.lessons[LESSON]?.parts ?? []
  const passed = progress.lessons[LESSON]?.passed
  const has = (id: string) => done.includes(id)
  const unlocked = (i: number) => i === 0 || has(PARTS[i - 1].id)

  const finish = useCallback(
    (id: string) => () => completeLessonPart(LESSON, id, { xp: PART_XP }),
    [completeLessonPart],
  )

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <Badge variant="secondary">Studio Academy · Day 1 · about 8 minutes</Badge>
        <h1 className="text-2xl font-bold">Onboarding: your first commit</h1>
        <p className="text-muted-foreground">
          Three short, hands-on parts. Finish all three to unlock your first real ticket from Gus.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {PARTS.map((p, i) => (
            <Badge key={p.id} variant={has(p.id) ? 'success' : unlocked(i) ? 'default' : 'outline'}>
              {has(p.id) ? <Check /> : !unlocked(i) && <Lock />} {i + 1}. {p.title}
            </Badge>
          ))}
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">1. Snapshots, branches and push</h2>
        <ConceptCard
          title="Commits are versions. Branches are duplicate pages."
          text="A **commit** is a snapshot of the whole project with a note attached, like a named version in Figma's version history. A **branch** is a duplicate page where you explore without touching the main file, and **main** is the published library everyone trusts. **Clone** downloads the file with its whole history; **push** publishes your new versions to GitHub so the team can see them."
        />
        <BranchPlayground complete={has('playground')} onComplete={finish('playground')} />
      </section>

      <section className={cn('flex flex-col gap-4', !unlocked(1) && 'pointer-events-none opacity-40')} aria-disabled={!unlocked(1)}>
        <h2 className="text-xl font-semibold">2. Gus's Commit Court</h2>
        <ConceptCard
          title="A commit message is a layer name for a change."
          text={'"Rectangle 47" tells nobody anything; "Header / Search / Focus" tells everyone. Commit messages are how your team scans history months from now, so Gus wants them short, specific, and in command form: **Add**, **Fix**, **Remove**.'}
        />
        <CommitCourt complete={has('court')} onComplete={finish('court')} />
      </section>

      <section className={cn('flex flex-col gap-4', !unlocked(2) && 'pointer-events-none opacity-40')} aria-disabled={!unlocked(2)}>
        <h2 className="text-xl font-semibold">3. Practice terminal</h2>
        <ConceptCard
          title="Staging is choosing what goes in the export."
          text="`git add` picks which changed files go into the next snapshot, like selecting the frames you want before exporting. `git commit` is hitting Export with a name. The daily loop is: **branch → edit → add → commit → push**."
        />
        <PracticeTerminal complete={has('terminal')} onComplete={finish('terminal')} />
      </section>

      <Card className={cn(!has('terminal') && 'opacity-60')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PartyPopper className="size-5 text-primary" /> {passed ? 'Ticket unlocked' : 'Unlock your ticket'}
          </CardTitle>
          <CardDescription>
            {passed
              ? 'Gus sent you STU-1. Now do it for real, in your own terminal.'
              : 'Finish all three parts, then claim your badge and your first real ticket.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          {passed ? (
            <Button onClick={() => go({ type: 'channel', id: 'dm-gus' })}>Open Gus's DM</Button>
          ) : (
            <Button
              disabled={!has('terminal')}
              onClick={() => {
                passLesson(LESSON, { xp: 20, badge: 'Academy: Day 1' })
                go({ type: 'channel', id: 'dm-gus' })
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
