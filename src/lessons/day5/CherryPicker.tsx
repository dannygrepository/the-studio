import { useState } from 'react'
import { Cherry, GitBranch, GitCommitHorizontal } from 'lucide-react'

import { CastAvatar } from '@/components/chat/CastAvatar'
import { GitCommand } from '@/components/git/GitCommand'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGame } from '@/game/GameContext'
import type { CoworkerId } from '@/game/types'
import { cn } from '@/lib/utils'

const BJORN = [
  { hash: 'a4f01c2', subject: 'WIP try a gradient header', ok: false, from: 'dot' as CoworkerId, why: 'That\'s the pink header. 💜 It hard-codes a hex. It is not going to the CEO demo.' },
  { hash: '5be93d7', subject: 'Fix quarter typo in the People footer', ok: true, from: 'priya' as CoworkerId, why: 'THAT ONE 🎉 just the typo fix, nothing else!! (demo saved) (probably) (definitely)' },
  { hash: 'c80e6a1', subject: 'WIP more header experiments', ok: false, from: 'gus' as CoworkerId, why: 'WIP means work in progress. Nothing marked WIP goes to main.' },
]

const STASH = [
  { id: 'stash', label: 'git stash', ok: true, from: 'gus' as CoworkerId, why: 'Parked. Your edit is safe in a drawer. `git stash pop` brings it back later.' },
  { id: 'commit', label: 'git commit -am "WIP"', ok: false, from: 'gus' as CoworkerId, why: 'Works, but now there\'s a "WIP" commit in your history to clean up. Stash is made for this.' },
  { id: 'restore', label: 'git restore .', ok: false, from: 'priya' as CoworkerId, why: 'wait!! that THROWS AWAY your edit 😱 (you might want it later) (stash it instead)' },
]

/** Interrupted mid-edit: park your work, then copy exactly one commit. */
export function CherryPicker({ onComplete, complete }: { onComplete: () => void; complete: boolean }) {
  const { story } = useGame()
  const [stashPick, setStashPick] = useState<string | null>(null)
  const [pick, setPick] = useState<string | null>(null)
  const stashed = STASH.find((x) => x.id === stashPick)
  const picked = BJORN.find((x) => x.hash === pick)
  const step = stashed?.ok ? 2 : 1

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cherry className="size-5" /> The cherry picker {complete && <Badge variant="success">Complete</Badge>}
        </CardTitle>
        <CardDescription>The CEO demo is at noon. There's a typo on the People page. Bjorn fixed it, on a branch full of experiments.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold">Step 1. You're mid-edit in copy.ts when Priya pings. You need a clean slate. You run…</div>
          <div className="flex flex-wrap gap-2">
            {STASH.map((o) => (
              <Button
                key={o.id}
                variant="outline"
                className={cn('font-mono', stashPick === o.id && (o.ok ? 'border-success bg-success/10' : 'border-destructive bg-destructive/10'))}
                onClick={() => !stashed?.ok && setStashPick(o.id)}
              >
                {o.label}
              </Button>
            ))}
          </div>
          {stashed && (
            <div className="flex items-center gap-3 rounded-lg border p-3 text-sm">
              <CastAvatar member={story.cast[stashed.from]} size="sm" />
              <span>{stashed.why}</span>
            </div>
          )}
        </div>

        <div className={cn('flex flex-col gap-3', step < 2 && 'pointer-events-none opacity-40')}>
          <div className="text-sm font-semibold">
            Step 2. You made <code className="font-mono">hotfix/people-footer-typo</code> from main. Which of Bjorn's commits do you cherry-pick?
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2 rounded-lg border bg-muted p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <GitBranch className="size-4 text-cast-bjorn" /> bjorn/header-redesign
              </div>
              {BJORN.map((c) => (
                <button
                  key={c.hash}
                  type="button"
                  onClick={() => !picked?.ok && setPick(c.hash)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-md border bg-card px-2 py-1.5 text-left text-sm hover:border-primary',
                    pick === c.hash && (c.ok ? 'border-success' : 'border-destructive'),
                  )}
                >
                  <GitCommitHorizontal className="size-4 shrink-0 text-muted-foreground" />
                  <span className="font-mono text-xs text-muted-foreground">{c.hash}</span>
                  <span className="min-w-0 flex-1">{c.subject}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2 rounded-lg border bg-muted p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <GitBranch className="size-4 text-primary" /> hotfix/people-footer-typo
              </div>
              <div className="flex items-center gap-2 rounded-md border border-dashed px-2 py-1.5 text-sm text-muted-foreground">
                <GitCommitHorizontal className="size-4" /> Add a footer note to the People page <span className="text-xs">(main)</span>
              </div>
              {picked?.ok && (
                <div className="flex items-center gap-2 rounded-md border border-success bg-card px-2 py-1.5 text-sm motion-safe:animate-in motion-safe:fade-in">
                  <Cherry className="size-4 text-success" /> {picked.subject} <span className="text-xs text-muted-foreground">(copied)</span>
                </div>
              )}
            </div>
          </div>
          {picked && (
            <div className={cn('flex items-center gap-3 rounded-lg border p-3 text-sm', picked.ok && 'border-success bg-success/10')}>
              <CastAvatar member={story.cast[picked.from]} size="sm" />
              <div className="flex flex-col gap-2">
                <GitCommand command={`git cherry-pick ${picked.hash}`} className="self-start" />
                <span>{picked.why}</span>
                {picked.ok && !complete && (
                  <Button size="sm" className="self-start" onClick={onComplete}>
                    Ship it
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
