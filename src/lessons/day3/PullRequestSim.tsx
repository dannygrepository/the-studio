import { useState } from 'react'
import { CircleCheck, GitMerge, GitPullRequest, MessageSquare, RefreshCw } from 'lucide-react'

import { CastAvatar } from '@/components/chat/CastAvatar'
import { GitCommand } from '@/components/git/GitCommand'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGame } from '@/game/GameContext'
import { cn } from '@/lib/utils'

type Step = 'pick' | 'open' | 'review' | 'synced' | 'pushed' | 'merged'

const BRANCHES = ['main', 'onboarding/add-sam', 'fix/button-color']

/** A pretend GitHub pull request, start to merge. */
export function PullRequestSim({ onComplete, complete }: { onComplete: () => void; complete: boolean }) {
  const { story } = useGame()
  const [base, setBase] = useState('main')
  const [compare, setCompare] = useState('main')
  const [step, setStep] = useState<Step>('pick')
  const [note, setNote] = useState('')

  const commits = [
    'Add Sam Rivera to the team directory',
    ...(step === 'synced' || step === 'pushed' || step === 'merged' ? ["Merge branch 'main' into onboarding/add-sam"] : []),
    ...(step === 'pushed' || step === 'merged' ? ['Add pronouns to my directory entry'] : []),
  ]

  const open = () => {
    if (compare === 'main') return setNote('Compare is the branch with your work. main → main has nothing to propose.')
    if (base !== 'main') return setNote('Base is where your work should land. That\'s main.')
    if (compare !== 'onboarding/add-sam') return setNote('That one\'s a fine PR too, but for this walkthrough pick your onboarding branch.')
    setNote('')
    setStep('open')
    setTimeout(() => setStep((s) => (s === 'open' ? 'review' : s)), 900)
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitPullRequest className="size-5" /> Pull request walkthrough {complete && <Badge variant="success">Complete</Badge>}
        </CardTitle>
        <CardDescription>A pretend GitHub. Open a pull request, get reviewed, push a fix, merge.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {step === 'pick' ? (
          <div className="flex flex-col gap-3 rounded-lg border bg-background p-4">
            <div className="text-sm font-semibold">Comparing changes</div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <label className="flex items-center gap-2">
                base:
                <select value={base} onChange={(e) => setBase(e.target.value)} className="h-8 rounded-md border bg-card px-2 font-mono text-sm">
                  {BRANCHES.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </label>
              <span aria-hidden>←</span>
              <label className="flex items-center gap-2">
                compare:
                <select value={compare} onChange={(e) => setCompare(e.target.value)} className="h-8 rounded-md border bg-card px-2 font-mono text-sm">
                  {BRANCHES.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>base</strong> is where the work lands. <strong>compare</strong> is the branch with the work. The arrow points the way the work moves.
            </p>
            <Button className="self-start" onClick={open}>
              Create pull request
            </Button>
            {note && <p className="rounded-md bg-accent p-2 text-sm text-accent-foreground">{note}</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-lg border bg-background p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-semibold">Add Sam Rivera to the team directory</span>
              <span className="text-muted-foreground">#2</span>
              <Badge variant={step === 'merged' ? 'default' : 'success'}>
                {step === 'merged' ? <GitMerge /> : <GitPullRequest />} {step === 'merged' ? 'Merged' : 'Open'}
              </Badge>
            </div>
            <div className="font-mono text-xs text-muted-foreground">main ← onboarding/add-sam</div>

            <ol className="flex flex-col gap-2 border-l-2 pl-4">
              {commits.map((c) => (
                <li key={c} className="text-sm motion-safe:animate-in motion-safe:fade-in">
                  <span className="font-mono text-xs text-muted-foreground">commit</span> {c}
                </li>
              ))}
              {step !== 'open' && (
                <li className="flex gap-3 rounded-lg border border-warning bg-warning/10 p-3 motion-safe:animate-in motion-safe:fade-in">
                  <CastAvatar member={story.cast.gus} />
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="flex items-center gap-2 font-semibold">
                      <MessageSquare className="size-4" /> Gus requested changes
                    </span>
                    <span>
                      Priya added a <code className="font-mono">pronouns</code> field on main this morning. Bring main into your branch, add yours, push.
                    </span>
                  </div>
                </li>
              )}
              {step === 'pushed' || step === 'merged' ? (
                <li className="flex items-center gap-2 text-sm text-success">
                  <CircleCheck className="size-4" /> Gus approved these changes
                </li>
              ) : null}
            </ol>

            {step === 'open' && <p className="text-sm text-muted-foreground">Waiting for review…</p>}

            {step === 'review' && (
              <div className="flex flex-col gap-2">
                <p className="text-sm">
                  <strong>This branch is out-of-date with main.</strong> Your branch was made before Priya's change. First, bring main in:
                </p>
                <GitCommand command="git merge main" className="self-start" />
                <Button variant="outline" className="self-start" onClick={() => setStep('synced')}>
                  <RefreshCw /> Run it
                </Button>
              </div>
            )}
            {step === 'synced' && (
              <div className="flex flex-col gap-2">
                <p className="text-sm">
                  Your branch has the <code className="font-mono">pronouns</code> field now. Add yours, commit, then push. You don't open a new pull request: <strong>pushing to the branch updates this one.</strong>
                </p>
                <GitCommand command='git commit -am "Add pronouns to my directory entry"' className="self-start" />
                <GitCommand command="git push" className="self-start" />
                <Button variant="outline" className="self-start" onClick={() => setStep('pushed')}>
                  Commit and push
                </Button>
              </div>
            )}
            {step === 'pushed' && (
              <div className="flex flex-col gap-2">
                <p className="text-sm">Approved. The checks are green. Merge it.</p>
                <Button
                  className="self-start"
                  onClick={() => {
                    setStep('merged')
                    onComplete()
                  }}
                >
                  <GitMerge /> Merge pull request
                </Button>
              </div>
            )}
            {step === 'merged' && (
              <div className={cn('flex flex-col gap-2 rounded-md bg-success/10 p-3 text-sm')}>
                <span>
                  Merged. Your entry is on main. Back on your laptop, catch up and tidy:
                </span>
                <GitCommand command="git switch main" className="self-start" />
                <GitCommand command="git pull" className="self-start" />
                <GitCommand command="git branch -d onboarding/add-sam" className="self-start" />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
