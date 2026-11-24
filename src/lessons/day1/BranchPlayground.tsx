import { useState } from 'react'
import { CloudUpload, GitBranch, GitCommitHorizontal, Repeat } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Repo {
  main: number
  branchFrom: number | null
  branch: number
}

interface State {
  local: Repo
  remote: Repo
  head: 'main' | 'branch'
  log: string
}

const BRANCH = 'explore/new-header'

function Graph({ repo, head, label }: { repo: Repo; head?: 'main' | 'branch'; label: string }) {
  const step = 48
  const x = (i: number) => 28 + i * step
  const mainY = 28
  const branchY = 80
  const width = Math.max(x(repo.main - 1), repo.branchFrom === null ? 0 : x(repo.branchFrom + repo.branch)) + 60
  return (
    <div className="overflow-x-auto">
      <div className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</div>
      <svg viewBox={`0 0 ${Math.max(width, 280)} 108`} className="h-28 w-full min-w-72" role="img" aria-label={`${label} commit graph`}>
        {/* main lane */}
        {repo.main > 1 && <line x1={x(0)} y1={mainY} x2={x(repo.main - 1)} y2={mainY} className="stroke-muted-foreground" strokeWidth={3} />}
        {Array.from({ length: repo.main }, (_, i) => (
          <circle key={`m${i}`} cx={x(i)} cy={mainY} r={10} className={cn('fill-primary', head === 'main' && i === repo.main - 1 && 'stroke-foreground')} strokeWidth={3} />
        ))}
        <text x={x(repo.main - 1) + 18} y={mainY + 4} className="fill-foreground text-xs font-semibold">main</text>

        {repo.branchFrom !== null && (
          <>
            <path
              d={`M ${x(repo.branchFrom)} ${mainY} C ${x(repo.branchFrom)} ${branchY}, ${x(repo.branchFrom)} ${branchY}, ${x(repo.branchFrom + 1)} ${branchY}`}
              className="fill-none stroke-cast-dot"
              strokeWidth={3}
              opacity={repo.branch ? 1 : 0.3}
            />
            {repo.branch > 1 && <line x1={x(repo.branchFrom + 1)} y1={branchY} x2={x(repo.branchFrom + repo.branch)} y2={branchY} className="stroke-cast-dot" strokeWidth={3} />}
            {Array.from({ length: repo.branch }, (_, i) => (
              <circle key={`b${i}`} cx={x(repo.branchFrom! + 1 + i)} cy={branchY} r={10} className={cn('fill-cast-dot', head === 'branch' && i === repo.branch - 1 && 'stroke-foreground')} strokeWidth={3} />
            ))}
            <text x={x(repo.branchFrom + Math.max(repo.branch, 1)) + 18} y={branchY + 4} className="fill-foreground text-xs font-semibold">
              {BRANCH}
            </text>
          </>
        )}
      </svg>
    </div>
  )
}

export function BranchPlayground({ onComplete, complete }: { onComplete: () => void; complete: boolean }) {
  const [s, setS] = useState<State>({
    local: { main: 2, branchFrom: null, branch: 0 },
    remote: { main: 2, branchFrom: null, branch: 0 },
    head: 'main',
    log: "You just cloned the repo. Your laptop and GitHub have the same two commits. You're on main.",
  })

  const update = (next: State) => {
    setS(next)
    if (next.remote.branchFrom !== null && next.remote.branch >= 2) onComplete()
  }

  const commit = () => {
    if (s.head === 'main') {
      update({ ...s, log: "Gus: Not on main. Nobody commits to main directly. Make a branch first, so your experiment can't break the real thing." })
      return
    }
    const local = { ...s.local, branch: s.local.branch + 1 }
    update({ ...s, local, log: `Committed! That's a snapshot of your work with a note attached. It only exists on your laptop until you push. (${local.branch} on your branch)` })
  }

  const branch = () => {
    if (s.local.branchFrom !== null) {
      update({ ...s, log: 'You already have a branch. One exploration at a time, Bjorn.' })
      return
    }
    update({
      ...s,
      local: { ...s.local, branchFrom: s.local.main - 1 },
      head: 'branch',
      log: `Created ${BRANCH} and switched to it. Like duplicating a Figma page to explore: main is untouched.`,
    })
  }

  const switchBranch = () => {
    if (s.local.branchFrom === null) return
    const head = s.head === 'main' ? 'branch' : 'main'
    update({ ...s, head, log: `Switched to ${head === 'main' ? 'main' : BRANCH}. Your files now show that branch's version.` })
  }

  const push = () => {
    if (s.head === 'main' || s.local.branchFrom === null) {
      update({ ...s, log: 'Nothing new on main to push. Switch to your branch and push that.' })
      return
    }
    if (s.local.branch === 0) {
      update({ ...s, log: 'Your branch has no commits yet. Commit something first.' })
      return
    }
    update({
      ...s,
      remote: { ...s.local },
      log:
        s.local.branch >= 2
          ? '🎉 Pushed! GitHub now has your branch with both commits. Teammates can see it, review it, and (eventually) merge it.'
          : 'Pushed! GitHub has your branch now. Make one more commit and push again to finish.',
    })
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Branch playground {complete && <Badge variant="success">Complete</Badge>}
        </CardTitle>
        <CardDescription>
          Goal: create a branch, make <strong>2 commits</strong> on it, and <strong>push</strong> it to GitHub. Watch both
          graphs.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-background p-3">
            <Graph repo={s.local} head={s.head} label="💻 Your laptop (local)" />
          </div>
          <div className="rounded-lg border bg-background p-3">
            <Graph repo={s.remote} label="☁️ GitHub (origin)" />
          </div>
        </div>
        <div className="rounded-lg bg-accent p-3 text-sm text-accent-foreground" aria-live="polite">
          {s.log}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={branch}>
            <GitBranch /> git switch -c
          </Button>
          <Button variant="outline" onClick={commit}>
            <GitCommitHorizontal /> git commit
          </Button>
          <Button variant="outline" onClick={switchBranch} disabled={s.local.branchFrom === null}>
            <Repeat /> git switch {s.head === 'main' ? 'branch' : 'main'}
          </Button>
          <Button onClick={push}>
            <CloudUpload /> git push
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
