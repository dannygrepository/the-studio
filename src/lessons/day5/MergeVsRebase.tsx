import { useState } from 'react'
import { GitCommitHorizontal, GitMerge, Rows3 } from 'lucide-react'

import { GitCommand } from '@/components/git/GitCommand'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Mode = 'merge' | 'rebase'

function Row({ label, tone, note }: { label: string; tone: 'main' | 'branch' | 'merge'; note?: string }) {
  return (
    <li className="flex items-center gap-2 text-sm motion-safe:animate-in motion-safe:fade-in">
      {tone === 'merge' ? (
        <GitMerge className="size-4 shrink-0 text-warning-foreground" />
      ) : (
        <GitCommitHorizontal className={cn('size-4 shrink-0', tone === 'main' ? 'text-primary' : 'text-cast-dot')} />
      )}
      <span className={cn('min-w-0 flex-1', tone === 'merge' && 'italic text-muted-foreground')}>{label}</span>
      {note && <span className="shrink-0 text-xs text-muted-foreground">{note}</span>}
    </li>
  )
}

/** Same starting point, two ways to catch up with main. */
export function MergeVsRebase({ onComplete, complete }: { onComplete: () => void; complete: boolean }) {
  const [mode, setMode] = useState<Mode | null>(null)
  const [seen, setSeen] = useState<Set<Mode>>(new Set())

  const show = (m: Mode) => {
    setMode(m)
    const next = new Set(seen).add(m)
    setSeen(next)
    if (next.size === 2) onComplete()
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rows3 className="size-5" /> Merge vs. rebase {complete && <Badge variant="success">Complete</Badge>}
        </CardTitle>
        <CardDescription>
          Your branch has 2 commits. Meanwhile main got 2 new ones. You need main's changes. Try both ways and compare the history you end up with.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Button variant={mode === 'merge' ? 'default' : 'outline'} onClick={() => show('merge')}>
            <GitMerge /> git merge main
          </Button>
          <Button variant={mode === 'rebase' ? 'default' : 'outline'} onClick={() => show('rebase')}>
            <Rows3 /> git rebase main
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2 rounded-lg border bg-muted p-3">
            <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Before</div>
            <ol className="flex flex-col gap-1">
              <Row label="Add footer note" tone="main" note="main" />
              <Row label="Tighten footer spacing" tone="branch" note="yours" />
              <Row label="Add footer link" tone="branch" note="yours" />
              <Row label="Add presence field" tone="main" note="main, new" />
              <Row label="Fix sidebar contrast" tone="main" note="main, new" />
            </ol>
            <p className="text-xs text-muted-foreground">Your two commits and main's two new ones happened side by side.</p>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border bg-background p-3">
            <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">After {mode ?? '…'}</div>
            {mode === 'merge' && (
              <>
                <ol key="m" className="flex flex-col gap-1">
                  <Row label="Add footer note" tone="main" />
                  <Row label="Tighten footer spacing" tone="branch" />
                  <Row label="Add footer link" tone="branch" />
                  <Row label="Add presence field" tone="main" />
                  <Row label="Fix sidebar contrast" tone="main" />
                  <Row label="Merge branch 'main' into footer" tone="merge" note="new" />
                </ol>
                <p className="text-sm">
                  <strong>Merge</strong> keeps history exactly as it happened and adds a merge commit that ties both lines together. Safe on any branch, even shared ones.
                </p>
              </>
            )}
            {mode === 'rebase' && (
              <>
                <ol key="r" className="flex flex-col gap-1">
                  <Row label="Add footer note" tone="main" />
                  <Row label="Add presence field" tone="main" />
                  <Row label="Fix sidebar contrast" tone="main" />
                  <Row label="Tighten footer spacing" tone="branch" note="replayed, new hash" />
                  <Row label="Add footer link" tone="branch" note="replayed, new hash" />
                </ol>
                <p className="text-sm">
                  <strong>Rebase</strong> lifts your commits off and replays them on top of the new main. A tidy straight line, but your commits get <strong>new hashes</strong>. Fine for your own branch; never for a branch others use.
                </p>
              </>
            )}
            {!mode && <p className="text-sm text-muted-foreground">Pick one above.</p>}
          </div>
        </div>
        {complete && (
          <p className="rounded-md bg-accent p-3 text-sm text-accent-foreground">
            Gus's rule: <strong>rebase your own branches freely; merge anything shared.</strong> Bjorn's going to rebase his header branch next week so it doesn't carry the typo fix twice.{' '}
            <GitCommand command="git rebase main" />
          </p>
        )}
      </CardContent>
    </Card>
  )
}
