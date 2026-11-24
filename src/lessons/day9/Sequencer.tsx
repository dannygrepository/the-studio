import { useMemo, useState } from 'react'
import { ListOrdered, RotateCcw } from 'lucide-react'

import { GitCommand } from '@/components/git/GitCommand'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const STEPS = [
  { cmd: 'git switch main', why: 'Start from main.' },
  { cmd: 'git pull', why: 'Get everyone\'s latest work.' },
  { cmd: 'git switch -c feature/kudos-page', why: 'Your own duplicate page to work in.' },
  { cmd: 'git add src/content/kudos.ts', why: 'Stage one small, finished piece.' },
  { cmd: 'git commit -m "Add kudos data"', why: 'Name it. Then repeat for the next piece.' },
  { cmd: 'git push -u origin feature/kudos-page', why: 'Publish the branch.' },
  { cmd: 'Open a pull request', why: 'Ask for review. Push fixes if asked.' },
  { cmd: 'Merge the pull request', why: 'It\'s on main now.' },
  { cmd: 'git switch main', why: 'Back home…' },
  { cmd: 'git pull', why: '…and catch up with what you just merged.' },
]

/** Put the whole loop in order, from memory. */
export function Sequencer({ onComplete, complete }: { onComplete: () => void; complete: boolean }) {
  const shuffled = useMemo(() => {
    const unique = [...new Set(STEPS.map((s) => s.cmd))]
    return unique.map((cmd, i) => ({ cmd, k: (i * 7 + 3) % unique.length })).sort((a, b) => a.k - b.k).map((x) => x.cmd)
  }, [])
  const [placed, setPlaced] = useState<number>(0)
  const [wrong, setWrong] = useState<string | null>(null)
  const done = placed >= STEPS.length

  const tap = (cmd: string) => {
    if (done) return
    if (STEPS[placed].cmd === cmd) {
      setPlaced(placed + 1)
      setWrong(null)
      if (placed + 1 >= STEPS.length) onComplete()
    } else {
      setWrong(cmd)
    }
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListOrdered className="size-5" /> The whole loop {complete && <Badge variant="success">Complete</Badge>}
        </CardTitle>
        <CardDescription>Everything from the last eight days, in order. Tap the next step. Some steps happen twice.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <ol className="flex flex-col gap-1">
          {STEPS.map((s, i) => (
            <li
              key={i}
              className={cn(
                'flex items-start gap-2 rounded-md border px-2 py-1.5 text-sm',
                i < placed ? 'border-success bg-success/10' : i === placed ? 'border-primary border-dashed' : 'border-dashed text-muted-foreground',
              )}
            >
              <span className="w-5 shrink-0 text-right font-mono text-xs text-muted-foreground">{i + 1}</span>
              {i < placed ? (
                <span className="flex flex-col gap-0.5">
                  {s.cmd.startsWith('git') ? <GitCommand command={s.cmd} className="self-start text-xs" /> : <strong>{s.cmd}</strong>}
                  <span className="text-xs text-muted-foreground">{s.why}</span>
                </span>
              ) : (
                <span>{i === placed ? 'Next…' : '…'}</span>
              )}
            </li>
          ))}
        </ol>
        <div className="flex flex-col gap-2">
          {shuffled.map((cmd) => (
            <Button
              key={cmd}
              variant="outline"
              className={cn('justify-start', cmd.startsWith('git') && 'font-mono', wrong === cmd && 'border-destructive bg-destructive/10')}
              onClick={() => tap(cmd)}
              disabled={done}
            >
              {cmd}
            </Button>
          ))}
          {wrong && <p className="text-sm text-muted-foreground">Not yet. What has to happen before that?</p>}
          {done ? (
            <p className="rounded-md bg-success/10 p-3 text-sm">That's the job. Every ticket, every day, forever. You know all of it now.</p>
          ) : (
            placed > 0 && (
              <Button variant="ghost" size="sm" className="self-start text-muted-foreground" onClick={() => setPlaced(0)}>
                <RotateCcw /> Start over
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  )
}
