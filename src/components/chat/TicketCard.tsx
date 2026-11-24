import { GitBranch, Lock, Ticket as TicketIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useGame } from '@/game/GameContext'
import { ticketStatus } from '@/game/engine'
import { useNav } from '@/game/nav'
import { usePlayer } from '@/game/usePlayer'
import { RichText } from './RichText'

const STATUS = {
  locked: { label: 'Locked', variant: 'secondary' },
  open: { label: 'Open', variant: 'default' },
  changes: { label: 'Changes requested', variant: 'warning' },
  done: { label: 'Done', variant: 'success' },
} as const

export function TicketCard({ ticketId }: { ticketId: string }) {
  const { story, progress } = useGame()
  const { go } = useNav()
  const { fill } = usePlayer()
  const ticket = story.tickets.find((t) => t.id === ticketId)
  const day = story.days.find((d) => d.ticket === ticketId)
  if (!ticket || !day) return null
  const status = ticketStatus(story, progress, day.day)
  const s = STATUS[status]
  const from = story.cast[ticket.from]

  return (
    <Card className="mt-3 max-w-xl gap-4 py-4">
      <CardHeader className="px-4">
        <div className="flex items-center gap-2">
          <TicketIcon className="size-4 text-primary" />
          <span className="font-mono text-xs text-muted-foreground">{ticket.id}</span>
          <Badge variant={s.variant}>{s.label}</Badge>
          <Badge variant="outline">+{ticket.xp} XP</Badge>
        </div>
        <CardTitle className="text-base">{ticket.title}</CardTitle>
        <CardDescription>
          Assigned by {from.name} · <RichText text={fill(ticket.summary)} />
        </CardDescription>
      </CardHeader>

      {status === 'locked' ? (
        <CardContent className="px-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <Lock className="size-4 shrink-0" />
            Finish today's lesson to unlock this ticket.
          </div>
        </CardContent>
      ) : (
        <CardContent className="flex flex-col gap-4 px-4">
          <div className="flex items-center gap-2 text-sm">
            <GitBranch className="size-4 text-muted-foreground" />
            Branch: <code className="rounded-sm bg-muted px-1 font-mono">{ticket.branch}</code>
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Steps
            </div>
            <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm">
              {ticket.steps.map((step, i) => (
                <li key={i}>
                  <RichText text={fill(step)} />
                </li>
              ))}
            </ol>
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Gus will check
            </div>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
              {ticket.acceptance.map((a, i) => (
                <li key={i}>
                  <RichText text={a} />
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}

      <CardFooter className="gap-2 px-4">
        {status === 'locked' ? (
          <Button size="sm" onClick={() => go({ type: 'lesson', id: day.lesson })}>
            Start the lesson
          </Button>
        ) : status === 'open' ? (
          <p className="text-sm text-muted-foreground">
            Type the git commands yourself in your terminal. When you've pushed, switch back to
            Claude Code (your coach) and type <strong>done</strong>. Stuck? Type <strong>hint</strong>.
          </p>
        ) : null}
      </CardFooter>
    </Card>
  )
}
