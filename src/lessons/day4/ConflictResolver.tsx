import { useState } from 'react'
import { Swords } from 'lucide-react'

import { CastAvatar } from '@/components/chat/CastAvatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGame } from '@/game/GameContext'
import type { CoworkerId } from '@/game/types'
import { cn } from '@/lib/utils'

const LINES = [
  { id: 'yt', side: 'yours', text: "  title: 'Team'," },
  { id: 'ys', side: 'yours', text: `  subtitle: "Who's who at The Studio",` },
  { id: 'bt', side: 'bjorn', text: "  title: 'The Squad 🚀'," },
  { id: 'bs', side: 'bjorn', text: "  subtitle: 'Everyone who works here (and CI-3PO, who insists)'," },
] as const

type Id = (typeof LINES)[number]['id']

function verdict(keep: Set<Id>): { ok: boolean; from: CoworkerId; text: string } {
  const titles = ['yt', 'bt'].filter((x) => keep.has(x as Id)).length
  const subs = ['ys', 'bs'].filter((x) => keep.has(x as Id)).length
  if (titles === 0 || subs === 0) return { ok: false, from: 'gus', text: 'You deleted a line both of you need. The page needs a title and a subtitle.' }
  if (titles > 1 || subs > 1) return { ok: false, from: 'gus', text: 'Two titles. TypeScript says "An object literal cannot have multiple properties with the same name." Keep both ideas, not both lines.' }
  if (keep.has('bt')) return { ok: false, from: 'priya', text: 'ooh "The Squad 🚀" is fun!! but the ticket says Team 🙏 (your title) (his subtitle)' }
  if (keep.has('ys')) return { ok: false, from: 'priya', text: 'close!! i asked for Bjorn\'s subtitle though 🙏 (the CI-3PO one) (it\'s for the slide)' }
  return { ok: true, from: 'gus', text: 'Your title. His subtitle. Markers gone. That\'s a resolution, not a coin flip.' }
}

/** The boss fight: resolve a real-looking conflict by choosing lines. */
export function ConflictResolver({ onComplete, complete }: { onComplete: () => void; complete: boolean }) {
  const { story } = useGame()
  const [keep, setKeep] = useState<Set<Id>>(new Set())
  const [stage, setStage] = useState<'conflict' | 'resolved' | 'added' | 'committed'>('conflict')
  const [checked, setChecked] = useState(false)
  const v = verdict(keep)

  const toggle = (id: Id) => {
    const next = new Set(keep)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setKeep(next)
    setChecked(false)
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords className="size-5" /> Boss fight: the conflict {complete && <Badge variant="success">Complete</Badge>}
        </CardTitle>
        <CardDescription>
          You ran <code className="font-mono">git merge origin/bjorn/people-page-copy</code>. Git stopped. Here's{' '}
          <code className="font-mono">src/content/copy.ts</code>. Priya wants <strong>your title</strong> and{' '}
          <strong>Bjorn's subtitle</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">What git wrote in the file</div>
          <pre className="overflow-x-auto rounded-lg bg-terminal p-3 font-mono text-xs leading-relaxed text-terminal-foreground">
            <div>export const peoplePage = {'{'}</div>
            <div className="text-warning">{'<<<<<<< HEAD'}  ← yours starts</div>
            <div className="text-terminal-prompt">{LINES[0].text}</div>
            <div className="text-terminal-prompt">{LINES[1].text}</div>
            <div className="text-warning">{'======='}  ← divider</div>
            <div className="text-cast-bjorn">{LINES[2].text}</div>
            <div className="text-cast-bjorn">{LINES[3].text}</div>
            <div className="text-warning">{'>>>>>>> origin/bjorn/people-page-copy'}  ← Bjorn's ends</div>
            <div>{'}'}</div>
          </pre>
          <p className="text-xs text-muted-foreground">
            Everything between <code className="font-mono">{'<<<<<<<'}</code> and <code className="font-mono">=======</code> is your branch. Between{' '}
            <code className="font-mono">=======</code> and <code className="font-mono">{'>>>>>>>'}</code> is Bjorn's. Your job: end up with the right lines and{' '}
            <strong>none</strong> of the three markers.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Pick the lines to keep</div>
          <div className="flex flex-col gap-2">
            {LINES.map((l) => (
              <label
                key={l.id}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-md border bg-card px-3 py-2 font-mono text-xs',
                  keep.has(l.id) && 'border-primary bg-accent',
                  stage !== 'conflict' && 'pointer-events-none opacity-70',
                )}
              >
                <input type="checkbox" checked={keep.has(l.id)} onChange={() => toggle(l.id)} className="accent-primary" />
                <span className="min-w-0 flex-1 break-all">{l.text.trim()}</span>
                <Badge variant={l.side === 'yours' ? 'secondary' : 'warning'}>{l.side === 'yours' ? 'yours' : 'Bjorn'}</Badge>
              </label>
            ))}
          </div>

          <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Result</div>
          <pre className="overflow-x-auto rounded-lg border bg-background p-3 font-mono text-xs">
            {['export const peoplePage = {', ...LINES.filter((l) => keep.has(l.id)).map((l) => l.text), '}'].join('\n')}
          </pre>

          {stage === 'conflict' && (
            <Button className="self-start" onClick={() => setChecked(true)} disabled={keep.size === 0}>
              Save the file
            </Button>
          )}
          {checked && stage === 'conflict' && (
            <div className={cn('flex gap-3 rounded-lg border p-3 text-sm', v.ok && 'border-success bg-success/10')} aria-live="polite">
              <CastAvatar member={story.cast[v.from]} />
              <div className="flex flex-col gap-2">
                <span>{v.text}</span>
                {v.ok && (
                  <Button size="sm" className="self-start" onClick={() => setStage('resolved')}>
                    Next: tell git
                  </Button>
                )}
              </div>
            </div>
          )}
          {stage === 'resolved' && (
            <div className="flex flex-col gap-2 text-sm">
              <span>Saved. Git still thinks the file is conflicted until you stage it:</span>
              <Button variant="outline" className="self-start font-mono" onClick={() => setStage('added')}>
                git add src/content/copy.ts
              </Button>
            </div>
          )}
          {stage === 'added' && (
            <div className="flex flex-col gap-2 text-sm">
              <span>Now finish the merge. No -m needed: git pre-wrote "Merge remote-tracking branch…".</span>
              <Button
                variant="outline"
                className="self-start font-mono"
                onClick={() => {
                  setStage('committed')
                  onComplete()
                }}
              >
                git commit
              </Button>
            </div>
          )}
          {stage === 'committed' && (
            <p className="rounded-md bg-success/10 p-3 text-sm">
              🎉 Boss defeated. The merge commit has two parents: your branch and Bjorn's. Both histories are kept, and the file says exactly what the team agreed.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
