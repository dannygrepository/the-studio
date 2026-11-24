import { useState } from 'react'
import { GitCommitHorizontal, Laptop, Siren, Undo2 } from 'lucide-react'

import { CastAvatar } from '@/components/chat/CastAvatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGame } from '@/game/GameContext'
import type { CoworkerId } from '@/game/types'
import { cn } from '@/lib/utils'

type Choice = 'reset' | 'revert' | 'hand'

interface Row {
  id: string
  label: string
  who: string
  gone?: boolean
  isNew?: boolean
}

const BASE: Row[] = [
  { id: 'a', label: 'Add presence field', who: 'Priya' },
  { id: 'bad', label: 'Make the app more fun for Friday', who: 'Bjorn' },
  { id: 'gus', label: 'Add a deploy checklist to the README', who: 'Gus' },
]

const OUTCOMES: Record<Choice, { main: Row[]; ok: boolean; from: CoworkerId; text: string; laptops: string }> = {
  reset: {
    main: [BASE[0], { ...BASE[1], gone: true }, { ...BASE[2], gone: true }],
    ok: false,
    from: 'gus',
    text: 'You reset main to before Bjorn and force-pushed. The orange is gone. So is my commit. It was after his.',
    laptops: 'Priya and Bjorn still have the old history. Their next pull says "divergent branches." Someone will force push again. That\'s how work disappears.',
  },
  hand: {
    main: [...BASE, { id: 'fix', label: 'Fix colors', who: 'You', isNew: true }],
    ok: false,
    from: 'dot',
    text: 'It works, if you got every value exactly right. 💜 But history says "Fix colors", not what broke or why. A revert writes that for you, exactly.',
    laptops: 'Everyone pulls normally. Nothing lost. But nothing links the fix to the cause.',
  },
  revert: {
    main: [...BASE, { id: 'rev', label: 'Revert "Make the app more fun for Friday"', who: 'You', isNew: true }],
    ok: true,
    from: 'gus',
    text: "A new commit that undoes exactly Bjorn's change. My commit stays. History tells the truth: it broke, here's the undo. That's the receipt.",
    laptops: 'Everyone pulls normally and gets the fix. Nobody loses anything.',
  },
}

/** Try each kind of undo and see what it does to shared history. */
export function RevertOrReset({ onComplete, complete }: { onComplete: () => void; complete: boolean }) {
  const { story } = useGame()
  const [choice, setChoice] = useState<Choice | null>(null)
  const o = choice ? OUTCOMES[choice] : null
  const main = o ? o.main : BASE

  const pick = (c: Choice) => {
    setChoice(c)
    if (OUTCOMES[c].ok) onComplete()
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Siren className="size-5" /> 4:58 PM, Friday {complete && <Badge variant="success">Complete</Badge>}
        </CardTitle>
        <CardDescription>
          Bjorn's commit turned the app orange. Gus pushed something good right after. The client demo is in an hour. Pick your undo.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Button variant={choice === 'reset' ? 'destructive' : 'outline'} className="font-mono" onClick={() => pick('reset')}>
            git reset --hard + push --force
          </Button>
          <Button variant={choice === 'hand' ? 'secondary' : 'outline'} onClick={() => pick('hand')}>
            Fix tokens.css by hand
          </Button>
          <Button variant={choice === 'revert' ? 'default' : 'outline'} className="font-mono" onClick={() => pick('revert')}>
            <Undo2 /> git revert &lt;bad commit&gt;
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2 rounded-lg border bg-muted p-3">
            <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">main on GitHub</div>
            <ol className="flex flex-col gap-1">
              {main.map((c) => (
                <li
                  key={c.id}
                  className={cn(
                    'flex items-center gap-2 rounded-md border bg-card px-2 py-1.5 text-sm',
                    c.id === 'bad' && !c.gone && 'border-warning',
                    c.gone && 'border-dashed bg-transparent text-muted-foreground line-through',
                    c.isNew && 'border-success motion-safe:animate-in motion-safe:fade-in',
                  )}
                >
                  <GitCommitHorizontal className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">{c.label}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{c.who}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-col gap-3">
            {o ? (
              <>
                <div className={cn('flex gap-3 rounded-lg border p-3 text-sm', o.ok ? 'border-success bg-success/10' : 'border-destructive/40')} aria-live="polite">
                  <CastAvatar member={story.cast[o.from]} />
                  <span>{o.text}</span>
                </div>
                <div className="flex gap-3 rounded-lg border p-3 text-sm">
                  <Laptop className="size-5 shrink-0 text-muted-foreground" />
                  <span>{o.laptops}</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Try each one. Watch what happens to Gus's commit, and to everyone else's laptop.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
