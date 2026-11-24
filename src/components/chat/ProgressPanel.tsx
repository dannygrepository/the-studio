import { Award, RotateCcw, Star, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGame } from '@/game/GameContext'
import { ticketStatus } from '@/game/engine'
import { levelFor, moodFor } from '@/game/levels'
import type { CoworkerId } from '@/game/types'
import { cn } from '@/lib/utils'
import { CastAvatar } from './CastAvatar'

const MOOD_VARIANT = {
  Fan: 'success',
  Warm: 'success',
  Neutral: 'secondary',
  Wary: 'warning',
  Skeptical: 'destructive',
} as const

function Meter({ pct, className }: { pct: number; className?: string }) {
  // Ten token-colored segments: no inline widths, so Dotty stays calm.
  const filled = Math.round(pct / 10)
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className={cn('h-2 flex-1 rounded-sm', i < filled ? (className ?? 'bg-primary') : 'bg-muted')}
        />
      ))}
    </div>
  )
}

export function ProgressPanel() {
  const { story, progress, resetGame, setOnboarded } = useGame()
  const level = levelFor(progress.xp)
  const today = story.days.find((d) => d.day === progress.day)
  const ticket = today && story.tickets.find((t) => t.id === today.ticket)
  const status = ticketStatus(story, progress, progress.day)

  return (
    <aside className="hidden w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l bg-muted p-4 xl:flex">
      <Card className="gap-3 py-4">
        <CardHeader className="px-4">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Star className="size-4 text-primary" /> {level.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 px-4">
          <div className="flex justify-between text-sm">
            <span className="font-semibold">{progress.xp} XP</span>
            <span className="text-muted-foreground">
              {level.next ? `${level.next.xp} for ${level.next.title}` : 'Max level'}
            </span>
          </div>
          <Meter pct={level.pct} />
          <div className="flex justify-between pt-1 text-sm">
            <span className="text-muted-foreground">Day {progress.day}</span>
            {ticket && (
              <span className="font-mono text-xs">
                {ticket.id}: {status}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="gap-3 py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-sm">Reputation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 px-4">
          {(Object.keys(progress.reputation) as CoworkerId[]).map((id) => {
            const member = story.cast[id]
            const score = progress.reputation[id]
            const mood = moodFor(score)
            return (
              <div key={id} className="flex items-center gap-3">
                <CastAvatar member={member} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{member.name.split(' ')[0]}</span>
                    <Badge variant={MOOD_VARIANT[mood]}>
                      {mood} · {score > 0 ? '+' : ''}
                      {score}
                    </Badge>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{member.status}</div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card className="gap-3 py-4">
        <CardHeader className="px-4">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Award className="size-4 text-primary" /> Badges
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1 px-4">
          {progress.badges.length ? (
            progress.badges.map((b) => (
              <Badge key={b} variant="warning">
                🏅 {b}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">None yet. Gus is watching.</span>
          )}
        </CardContent>
      </Card>

      <Button
        variant="ghost"
        size="sm"
        className="self-start text-muted-foreground"
        onClick={() => setOnboarded(false)}
      >
        <Users /> Replay intro
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="-mt-3 self-start text-muted-foreground"
        onClick={() => {
          if (window.confirm('Reset all progress and choices? This cannot be undone.')) resetGame()
        }}
      >
        <RotateCcw /> Reset game
      </Button>
    </aside>
  )
}
