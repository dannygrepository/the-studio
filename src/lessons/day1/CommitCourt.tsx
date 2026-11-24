import { useState } from 'react'
import { Gavel } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CastAvatar } from '@/components/chat/CastAvatar'
import { useGame } from '@/game/GameContext'
import { judgeCommit } from '../commitJudge'

const ROUNDS = [
  {
    change: 'You fixed the Send button so it no longer overlaps the input on mobile.',
    options: ['fixed stuff', 'Fix Send button overlapping input on mobile', 'Fixed the send button bug on mobile screens.'],
  },
  {
    change: 'You added an Avatar component that uses the size tokens.',
    options: ['Add Avatar component using size tokens', 'avatar', 'Adding a new avatar component for the chat app with sizes'],
  },
  {
    change: "You replaced a hard-coded gray with the muted-foreground token. Dot is thrilled.",
    options: ['Changes', 'Update colors.', 'Use muted-foreground token for hard-coded gray'],
  },
  {
    change: 'You removed an unused Badge variant.',
    options: ['Remove unused outline-ghost Badge variant', 'removed unused badge variant', 'Remove unused outline-ghost Badge variant from the badge component file.'],
  },
]

export function CommitCourt({ onComplete, complete }: { onComplete: () => void; complete: boolean }) {
  const { story } = useGame()
  const [round, setRound] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [custom, setCustom] = useState('')
  const finished = round >= ROUNDS.length

  const r = ROUNDS[Math.min(round, ROUNDS.length - 1)]
  const verdict = picked !== null ? judgeCommit(r.options[picked]) : null
  const customVerdict = custom ? judgeCommit(custom) : null

  const choose = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    if (judgeCommit(r.options[i]).ok) setScore((x) => x + 1)
  }

  const next = () => {
    const n = round + 1
    setRound(n)
    setPicked(null)
    if (n >= ROUNDS.length) onComplete()
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gavel className="size-5" /> Gus's Commit Court {complete && <Badge variant="success">Complete</Badge>}
        </CardTitle>
        <CardDescription>
          Pick the commit message Gus would accept. A good message finishes the sentence{' '}
          <em>"If applied, this commit will…"</em>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!finished ? (
          <>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Case {round + 1} of {ROUNDS.length}
              </span>
              <span>Score: {score}</span>
            </div>
            <p className="rounded-lg bg-muted p-3 text-sm">
              <strong>The change:</strong> {r.change}
            </p>
            <div className="flex flex-col gap-2">
              {r.options.map((o, i) => {
                const ok = judgeCommit(o).ok
                return (
                  <Button
                    key={o}
                    variant="choice"
                    size="choice"
                    className={
                      picked === null ? 'font-mono' : ok ? 'border-success bg-success/10 font-mono' : picked === i ? 'border-destructive bg-destructive/10 font-mono' : 'font-mono opacity-60'
                    }
                    onClick={() => choose(i)}
                  >
                    {o}
                  </Button>
                )
              })}
            </div>
            {verdict && (
              <div className="flex gap-3 rounded-lg border p-3">
                <CastAvatar member={story.cast.gus} />
                <div className="flex flex-col gap-2 text-sm">
                  <strong>{verdict.ok ? 'Gus: Acceptable. Barely.' : `Gus: ${verdict.verdicts.find((v) => !v.pass)!.gus}`}</strong>
                  <ul className="flex flex-col gap-1">
                    {verdict.verdicts.map((v) => (
                      <li key={v.rule} className={v.pass ? 'text-success' : 'text-destructive'}>
                        {v.pass ? '✓' : '✗'} {v.rule}
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" className="self-start" onClick={next}>
                    {round + 1 < ROUNDS.length ? 'Next case' : 'Finish'}
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm">
              Court adjourned. You scored <strong>{score} / {ROUNDS.length}</strong>.{' '}
              {score === ROUNDS.length ? 'Gus almost smiled. Almost.' : 'Gus has notes. Gus always has notes.'}
            </p>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Bonus: write your own and let Gus judge it live
              <input
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Add myself to the team directory"
                className="h-9 rounded-md border bg-background px-3 font-mono text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>
            {customVerdict && (
              <ul className="flex flex-col gap-1 text-sm">
                {customVerdict.verdicts.map((v) => (
                  <li key={v.rule} className={v.pass ? 'text-success' : 'text-destructive'}>
                    {v.pass ? '✓' : '✗'} {v.rule}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
