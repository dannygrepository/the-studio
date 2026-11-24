import { useState } from 'react'
import { Bug, Eye } from 'lucide-react'

import { CastAvatar } from '@/components/chat/CastAvatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGame } from '@/game/GameContext'
import type { CoworkerId } from '@/game/types'
import { cn } from '@/lib/utils'

interface Issue {
  id: string
  title: string
  from: CoworkerId
  why: string
  /** Does Dotty's audit catch it? */
  tool: boolean
}

const ISSUES: Record<string, Issue> = {
  div: { id: 'div', title: 'A clickable <div>', from: 'gus', tool: false, why: "Keyboards can't reach it and screen readers don't announce it as clickable. Anything clickable is a <button>. Or, since the whole row is already a button, it shouldn't be clickable at all." },
  hex: { id: 'hex', title: 'Hex color', from: 'dot', tool: true, why: "#ef4444 isn't ours. 💜 The badge should use the sidebar badge token, like every other unread count." }, // dot-ignore
  px: { id: 'px', title: 'Arbitrary pixel value', from: 'dot', tool: true, why: 'px-[6px] skips the spacing scale. 💜 px-1.5 or px-2 are right there.' }, // dot-ignore
  white: { id: 'white', title: 'Palette color (text-white)', from: 'dot', tool: false, why: "My audit misses this one. 💜 text-white won't flip in a dark theme. Use the foreground token that pairs with the background." },
  style: { id: 'style', title: 'Inline style', from: 'dot', tool: true, why: 'fontSize: 11 and lineHeight: 18px are type tokens in disguise. 💜 text-xs exists.' },
  label: { id: 'label', title: 'No screen-reader label', from: 'gus', tool: false, why: 'A screen reader announces "3". Three what? Add aria-label={`${count} unread messages`}.' },
  zero: { id: 'zero', title: 'Shows a "0" badge', from: 'priya', tool: false, why: 'every channel now has a little "0" on it 😅 (zero unread should show nothing) (the sidebar looks so busy)' },
}

const CODE: { text: string; issue?: string }[] = [
  { text: '// Generated with AI. Looks great on my screen!! 🚀 (Bjorn)' },
  { text: 'export function UnreadBadge({ count, onClick }) {' },
  { text: '  return (', issue: 'zero' },
  { text: '    <div', issue: 'div' },
  { text: '      onClick={onClick}', issue: 'div' },
  { text: '      className="ml-auto rounded-full' },
  { text: '        bg-[#ef4444]', issue: 'hex' }, // dot-ignore
  { text: '        px-[6px]', issue: 'px' }, // dot-ignore
  { text: '        text-white"', issue: 'white' },
  { text: "      style={{ fontSize: 11, lineHeight: '18px' }}", issue: 'style' }, // dot-ignore
  { text: '    >' },
  { text: '      {count}', issue: 'label' },
  { text: '    </div>' },
  { text: '  )' },
  { text: '}' },
]

/** Click the lines you'd leave a review comment on. */
export function SpotTheBugs({ onComplete, complete }: { onComplete: () => void; complete: boolean }) {
  const { story } = useGame()
  const [found, setFound] = useState<Set<string>>(new Set())
  const [last, setLast] = useState<{ issue?: Issue; miss?: string } | null>(null)
  const [misses, setMisses] = useState(0)
  const total = Object.keys(ISSUES).length

  const click = (i: number) => {
    const line = CODE[i]
    if (!line.issue) {
      setMisses((m) => m + 1)
      setLast({ miss: i === 0 ? '"Looks great on my screen" is not a test plan, but it\'s not a code problem either.' : 'That line is fine. Keep looking.' })
      return
    }
    const issue = ISSUES[line.issue]
    const next = new Set(found).add(issue.id)
    setFound(next)
    setLast({ issue })
    if (next.size === total) onComplete()
  }

  const remaining = Object.values(ISSUES).filter((x) => !found.has(x.id))

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="size-5" /> Spot the problems {complete && <Badge variant="success">Complete</Badge>}
        </CardTitle>
        <CardDescription>
          Bjorn's AI-generated <code className="font-mono">UnreadBadge.tsx</code>. Click every line you'd leave a review comment on. There are {total} problems.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="overflow-x-auto rounded-lg bg-terminal p-2 font-mono text-xs">
            {CODE.map((l, i) => {
              const hit = l.issue && found.has(l.issue)
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => click(i)}
                  className={cn(
                    'flex w-full cursor-pointer gap-3 rounded-sm px-2 py-0.5 text-left whitespace-pre hover:bg-terminal-muted/20',
                    hit && 'bg-destructive/25',
                  )}
                >
                  <span className="w-5 shrink-0 text-right text-terminal-muted">{i + 1}</span>
                  <span className="text-terminal-foreground">{l.text}</span>
                </button>
              )
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span>
              Found <strong>{found.size}</strong> / {total}
            </span>
            {misses >= 3 && remaining.length > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Eye className="size-4" /> Still missing: {remaining.map((r) => r.title).join(', ')}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {last?.issue && (
            <div className="flex gap-3 rounded-lg border border-destructive/40 p-3 text-sm" aria-live="polite">
              <CastAvatar member={story.cast[last.issue.from]} />
              <div className="flex flex-col gap-1">
                <span className="flex flex-wrap items-center gap-2 font-semibold">
                  {last.issue.title}
                  <Badge variant={last.issue.tool ? 'secondary' : 'warning'}>{last.issue.tool ? 'npm run dot catches this' : 'only a human catches this'}</Badge>
                </span>
                <span>{last.issue.why}</span>
              </div>
            </div>
          )}
          {last?.miss && <p className="rounded-lg border p-3 text-sm text-muted-foreground">{last.miss}</p>}
          <ul className="flex flex-col gap-1 text-sm">
            {Object.values(ISSUES).map((x) => (
              <li key={x.id} className={cn('flex items-center gap-2', !found.has(x.id) && 'text-muted-foreground')}>
                <span aria-hidden>{found.has(x.id) ? '🔴' : '○'}</span> {found.has(x.id) ? x.title : '???'}
              </li>
            ))}
          </ul>
          {complete && (
            <p className="rounded-md bg-accent p-3 text-sm text-accent-foreground">
              Three of seven are caught by a tool. Four needed you. That's the job of a reviewer: <strong>tools check rules, people check meaning.</strong>
            </p>
          )}
          {!complete && found.size === 0 && (
            <Button variant="ghost" size="sm" className="self-start text-muted-foreground" onClick={() => setLast({ miss: 'Start with what Dotty would flag: anything that isn\'t a token.' })}>
              Where do I start?
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
