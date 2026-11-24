import { useState } from 'react'
import {
  Check,
  CloudUpload,
  Cloud,
  CloudOff,
  GitBranch,
  GitCommitHorizontal,
  Laptop,
  MapPin,
  Repeat,
  RotateCcw,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CommandBreakdown } from '@/components/git/GitCommand'
import { cn } from '@/lib/utils'

/** One copy of the project: main's commits, plus your branch's (null = no branch yet). */
interface Repo {
  main: string[]
  branch: string[] | null
}

interface State {
  local: Repo
  remote: Repo
  head: 'main' | 'branch'
  log: string
}

const BRANCH = 'explore/new-header'
const MAIN_HISTORY = ['Set up the chat app', 'Add design tokens']
/** What each new commit on your branch is "about". */
const MESSAGES = ['Try a bolder header', 'Tighten header spacing', 'Add a search icon', 'Swap header to primary']

const START: State = {
  local: { main: MAIN_HISTORY, branch: null },
  remote: { main: MAIN_HISTORY, branch: null },
  head: 'main',
  log: "You just cloned the repo. Your laptop and GitHub have the same two commits on main. You're on main.",
}

/* ------------------------------------------------------------------ */
/* Pieces                                                               */
/* ------------------------------------------------------------------ */

function CommitRow({
  message,
  inherited,
  unpushed,
}: {
  message: string
  inherited?: boolean
  unpushed?: boolean
}) {
  return (
    <li
      className={cn(
        'flex items-center gap-2 rounded-md border bg-card px-2 py-1.5 text-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1',
        inherited && 'border-dashed bg-transparent text-muted-foreground',
        unpushed && 'border-warning bg-warning/15',
      )}
    >
      {unpushed ? (
        <CloudOff className="size-4 shrink-0 text-warning-foreground" aria-label="Not on GitHub yet" />
      ) : (
        <GitCommitHorizontal className="size-4 shrink-0 text-muted-foreground" />
      )}
      <span className="min-w-0 flex-1">{message}</span>
      {inherited && <span className="shrink-0 text-xs">from main</span>}
    </li>
  )
}

function BranchCard({
  name,
  own,
  inherited = [],
  unpushed = 0,
  here,
  tone,
}: {
  name: string
  /** Commits made on this branch, oldest first. */
  own: string[]
  /** Commits copied from main when the branch was made. */
  inherited?: string[]
  /** How many of the newest own commits aren't on GitHub. */
  unpushed?: number
  here?: boolean
  tone: 'main' | 'branch'
}) {
  // Newest first, like a version history panel.
  const rows = [
    ...own.map((m, i) => ({ m, inherited: false, unpushed: i >= own.length - unpushed })).reverse(),
    ...inherited.map((m) => ({ m, inherited: true, unpushed: false })).reverse(),
  ]
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border-2 bg-background p-3 transition-colors',
        here ? (tone === 'main' ? 'border-primary' : 'border-cast-dot') : 'border-transparent',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <GitBranch className={cn('size-4 shrink-0', tone === 'main' ? 'text-primary' : 'text-cast-dot')} />
        <span className="min-w-0 flex-1 font-mono text-sm font-semibold break-all">{name}</span>
        {here && (
          <Badge variant={tone === 'main' ? 'default' : 'secondary'} className="shrink-0">
            <MapPin /> You are here
          </Badge>
        )}
      </div>
      <ul className="flex flex-col gap-1">
        {rows.length ? (
          rows.map((r, i) => (
            <CommitRow key={`${r.m}-${i}`} message={r.m} inherited={r.inherited} unpushed={r.unpushed} />
          ))
        ) : (
          <li className="text-sm text-muted-foreground">No commits yet.</li>
        )}
      </ul>
      {unpushed > 0 && (
        <p className="flex items-center gap-2 rounded-md bg-warning/15 px-2 py-1.5 text-xs text-warning-foreground">
          <CloudOff className="size-3.5 shrink-0" />
          {unpushed === 1 ? '1 commit is' : `${unpushed} commits are`} only on your laptop. Push to share.
        </p>
      )}
    </div>
  )
}

function Place({
  icon,
  title,
  caption,
  children,
}: {
  icon: React.ReactNode
  title: string
  caption: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted p-3">
      <div>
        <div className="flex items-center gap-2 font-semibold">
          {icon} {title}
        </div>
        <div className="text-xs text-muted-foreground">{caption}</div>
      </div>
      {children}
    </div>
  )
}

function Steps({ done }: { done: boolean[] }) {
  const labels = ['Make a branch', 'Commit', 'Commit again', 'Push to GitHub']
  const next = done.indexOf(false)
  return (
    <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {labels.map((label, i) => (
        <li
          key={label}
          className={cn(
            'flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm',
            done[i] && 'border-success bg-success/10',
            i === next && 'border-primary bg-accent font-medium text-accent-foreground',
            !done[i] && i !== next && 'text-muted-foreground',
          )}
        >
          <span
            className={cn(
              'flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
              done[i] ? 'bg-success text-success-foreground' : i === next ? 'bg-primary text-primary-foreground' : 'bg-muted',
            )}
          >
            {done[i] ? <Check className="size-3" /> : i + 1}
          </span>
          {label}
        </li>
      ))}
    </ol>
  )
}

/* ------------------------------------------------------------------ */
/* Playground                                                           */
/* ------------------------------------------------------------------ */

export function BranchPlayground({ onComplete, complete }: { onComplete: () => void; complete: boolean }) {
  const [s, setS] = useState<State>(START)
  // The command shown in the breakdown: whatever you're pointing at, else the last one you ran.
  const [pointing, setPointing] = useState<string | null>(null)
  const [last, setLast] = useState<string | null>(null)

  const localBranch = s.local.branch
  const remoteBranch = s.remote.branch
  const nextMessage = MESSAGES[Math.min(localBranch?.length ?? 0, MESSAGES.length - 1)]
  const unpushed = (localBranch?.length ?? 0) - (remoteBranch?.length ?? 0)

  const CMD = {
    branch: `git switch -c ${BRANCH}`,
    commit: `git commit -m "${nextMessage}"`,
    switch: `git switch ${s.head === 'main' ? BRANCH : 'main'}`,
    push: s.head === 'branch' ? `git push -u origin ${BRANCH}` : 'git push',
  }
  const explained = pointing ?? last ?? CMD.branch

  /** Hover, focus, and click all point the breakdown at this command. */
  const cmdProps = (command: string, action: () => void) => ({
    onMouseEnter: () => setPointing(command),
    onMouseLeave: () => setPointing(null),
    onFocus: () => setPointing(command),
    onBlur: () => setPointing(null),
    onClick: () => {
      setLast(command)
      action()
    },
  })

  const update = (next: State) => {
    setS(next)
    if ((next.remote.branch?.length ?? 0) >= 2) onComplete()
  }

  const branch = () => {
    if (localBranch) {
      update({ ...s, log: 'You already have a branch. One exploration at a time, Bjorn.' })
      return
    }
    update({
      ...s,
      local: { ...s.local, branch: [] },
      head: 'branch',
      log: `Made ${BRANCH} and moved onto it. It starts as a copy of main (the faded commits), like duplicating a Figma page. Main is untouched.`,
    })
  }

  const commit = () => {
    if (s.head === 'main' || !localBranch) {
      update({
        ...s,
        log: "Gus: Not on main. Nobody commits to main directly. Make a branch first, so your experiment can't break the real thing.",
      })
      return
    }
    if (localBranch.length >= MESSAGES.length) {
      update({ ...s, log: "That's plenty of commits for one exploration. Push them!" })
      return
    }
    update({
      ...s,
      local: { ...s.local, branch: [...localBranch, nextMessage] },
      log: `Saved a snapshot called "${nextMessage}". Notice it's yellow: it only exists on your laptop until you push.`,
    })
  }

  const switchBranch = () => {
    if (!localBranch) return
    const head = s.head === 'main' ? 'branch' : 'main'
    update({
      ...s,
      head,
      log:
        head === 'main'
          ? "Back on main. Your files now look like main again. Your branch's commits are safe; they're just not here."
          : `Back on ${BRANCH}. Your files show your exploration again.`,
    })
  }

  const push = () => {
    if (s.head === 'main' || !localBranch) {
      update({ ...s, log: 'Nothing new on main to push. Switch to your branch and push that.' })
      return
    }
    if (localBranch.length === 0) {
      update({ ...s, log: 'Your branch has no commits yet. Commit something first.' })
      return
    }
    if (unpushed === 0) {
      update({ ...s, log: 'GitHub already has everything. Make another commit if you want something new to push.' })
      return
    }
    update({
      ...s,
      remote: { ...s.local },
      log:
        localBranch.length >= 2
          ? `🎉 Pushed! GitHub now has ${BRANCH} with your commits. Teammates can see it, review it, and (eventually) merge it.`
          : 'Pushed! Your branch is on GitHub now. Make one more commit and push again to finish.',
    })
  }

  const steps = [
    localBranch !== null,
    (localBranch?.length ?? 0) >= 1,
    (localBranch?.length ?? 0) >= 2,
    (remoteBranch?.length ?? 0) >= 2,
  ]

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Branch playground {complete && <Badge variant="success">Complete</Badge>}
        </CardTitle>
        <CardDescription>
          Make a branch, save two commits on it, and push it to GitHub. Watch what shows up where.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Steps done={steps} />

        <div className="grid gap-4 md:grid-cols-2">
          <Place icon={<Laptop className="size-4" />} title="Your laptop" caption="Your copy. Commits land here first.">
            <BranchCard name="main" own={s.local.main} here={s.head === 'main'} tone="main" />
            {localBranch && (
              <BranchCard
                name={BRANCH}
                own={localBranch}
                inherited={s.local.main}
                unpushed={unpushed}
                here={s.head === 'branch'}
                tone="branch"
              />
            )}
          </Place>

          <Place icon={<Cloud className="size-4" />} title="GitHub (origin)" caption="The shared copy. The team only sees this.">
            <BranchCard name="main" own={s.remote.main} tone="main" />
            {remoteBranch ? (
              <BranchCard name={BRANCH} own={remoteBranch} inherited={s.remote.main} tone="branch" />
            ) : (
              localBranch && (
                <div className="rounded-lg border-2 border-dashed p-3 text-sm text-muted-foreground">
                  <span className="font-mono">{BRANCH}</span> isn't here yet. Only you can see it until you
                  push.
                </div>
              )
            )}
          </Place>
        </div>

        <div className="rounded-lg bg-accent p-3 text-sm text-accent-foreground" aria-live="polite">
          {s.log}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="font-mono" {...cmdProps(CMD.branch, branch)}>
            <GitBranch /> {CMD.branch}
          </Button>
          <Button variant="outline" className="font-mono" {...cmdProps(CMD.commit, commit)}>
            <GitCommitHorizontal /> {CMD.commit}
          </Button>
          <Button
            variant="outline"
            className="font-mono"
            disabled={!localBranch}
            {...cmdProps(CMD.switch, switchBranch)}
          >
            <Repeat /> {CMD.switch}
          </Button>
          <Button className="font-mono" {...cmdProps(CMD.push, push)}>
            <CloudUpload /> {CMD.push}
          </Button>
          <Button
            variant="ghost"
            className="ml-auto text-muted-foreground"
            onClick={() => {
              setS(START)
              setLast(null)
            }}
            disabled={s === START}
          >
            <RotateCcw /> Reset
          </Button>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border bg-background p-4">
          <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            What this command means · hover any button
          </div>
          <CommandBreakdown command={explained} />
        </div>
      </CardContent>
    </Card>
  )
}
