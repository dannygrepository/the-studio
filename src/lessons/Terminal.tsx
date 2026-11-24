import { useEffect, useRef, useState } from 'react'
import { CircleCheck, Circle, Lightbulb, RotateCcw } from 'lucide-react'

import { GitCommand } from '@/components/git/GitCommand'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Line, Sim } from './sim'

const LINE_CLASS: Record<Line['kind'], string> = {
  out: 'text-terminal-foreground',
  err: 'text-destructive',
  ok: 'text-terminal-prompt',
  gus: 'text-warning',
  muted: 'text-terminal-muted',
}

/** A safe, pretend terminal with goals. Each lesson passes its own `sim`. */
export function Terminal<S>({
  sim,
  onComplete,
  complete,
}: {
  sim: Sim<S>
  onComplete: () => void
  complete: boolean
}) {
  const [state, setState] = useState<S>(sim.initial)
  const [history, setHistory] = useState<{ prompt: string; input: string; lines: Line[] }[]>([])
  const [input, setInput] = useState('')
  const [hints, setHints] = useState(0)
  const [past, setPast] = useState<string[]>([])
  const [cursor, setCursor] = useState(-1)
  const scroller = useRef<HTMLDivElement>(null)
  const field = useRef<HTMLInputElement>(null)

  const doneGoals = sim.goals.filter((g) => g.done(state)).length
  const nextGoal = sim.goals.find((g) => !g.done(state))
  const prompt = sim.prompt(state)

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight })
  }, [history])

  useEffect(() => {
    if (doneGoals === sim.goals.length) onComplete()
  }, [doneGoals, sim.goals.length, onComplete])

  const submit = () => {
    const cmd = input.trim()
    if (!cmd) return
    setPast((p) => [cmd, ...p])
    setCursor(-1)
    setInput('')
    if (cmd === 'clear') {
      setHistory([])
      return
    }
    const result = sim.run(state, cmd)
    setHistory((h) => [...h, { prompt, input: cmd, lines: result.lines }])
    setState(result.state)
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {sim.title} {complete && <Badge variant="success">Complete</Badge>}
        </CardTitle>
        <CardDescription>{sim.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-3">
        <div
          className="flex h-96 flex-col rounded-lg bg-terminal font-mono text-sm lg:col-span-2"
          onClick={() => field.current?.focus()}
        >
          <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="whitespace-pre-wrap text-terminal-muted">{sim.welcome}</div>
            {history.map((h, i) => (
              <div key={i} className="mt-2">
                <div>
                  <span className="text-terminal-prompt">{h.prompt}</span>{' '}
                  <span className="text-terminal-foreground">{h.input}</span>
                </div>
                {h.lines.map((l, j) => (
                  <div key={j} className={cn('whitespace-pre-wrap', LINE_CLASS[l.kind])}>
                    {l.text}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <form
            className="flex items-center gap-2 border-t border-terminal-muted/30 px-4 py-3"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <span className="shrink-0 text-terminal-prompt">{prompt}</span>
            <input
              ref={field}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp' && past.length) {
                  e.preventDefault()
                  const c = Math.min(cursor + 1, past.length - 1)
                  setCursor(c)
                  setInput(past[c])
                }
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  const c = cursor - 1
                  setCursor(Math.max(c, -1))
                  setInput(c >= 0 ? past[c] : '')
                }
              }}
              aria-label="Terminal command"
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent text-terminal-foreground caret-terminal-prompt outline-none"
            />
          </form>
        </div>

        <div className="flex flex-col gap-3">
          <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Goals · {doneGoals}/{sim.goals.length}
          </div>
          <ul className="flex flex-col gap-2 text-sm">
            {sim.goals.map((g) => {
              const done = g.done(state)
              return (
                <li key={g.id} className={cn('flex items-start gap-2', done && 'text-muted-foreground line-through')}>
                  {done ? (
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" />
                  ) : (
                    <Circle className="mt-0.5 size-4 shrink-0" />
                  )}
                  {g.label}
                </li>
              )
            })}
          </ul>
          {nextGoal && (
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" className="self-start" onClick={() => setHints((h) => h + 1)}>
                <Lightbulb /> Hint
              </Button>
              {hints > 0 && <GitCommand command={nextGoal.hint} className="block rounded-md p-2 text-xs leading-relaxed" />}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="mt-auto self-start text-muted-foreground"
            onClick={() => {
              setState(sim.initial)
              setHistory([])
              setHints(0)
            }}
          >
            <RotateCcw /> Start over
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
