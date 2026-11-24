import { useState } from 'react'
import { FlaskConical, Play } from 'lucide-react'

import { CastAvatar } from '@/components/chat/CastAvatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGame } from '@/game/GameContext'
import { cn } from '@/lib/utils'

const INGREDIENTS = [
  { id: 'file', label: 'The file', text: 'Create src/components/ui/status-pill.tsx.' },
  { id: 'pattern', label: 'A pattern to copy', text: 'Follow the pattern in badge.tsx: cva variants, cn() for className.' },
  { id: 'tokens', label: 'The tokens', text: 'available = success, busy = warning, away = muted (with their -foreground tokens).' },
  { id: 'rules', label: 'The rules', text: 'Tokens only: no hex, no palette colors like green-500, no inline styles, no arbitrary values.' },
] as const

type Id = (typeof INGREDIENTS)[number]['id']

/** What the pretend AI writes for a given prompt. Deliberately bad when under-specified. */
function draft(has: Set<Id>): string[] {
  const out: string[] = []
  out.push(has.has('file') ? '// src/components/ui/status-pill.tsx' : '// StatusPill.jsx (put this wherever you like!)')
  if (has.has('pattern')) {
    out.push("import { cva } from 'class-variance-authority'", "import { cn } from '@/lib/utils'", '')
    out.push("const pill = cva('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', {", '  variants: {', '    presence: {')
    if (has.has('tokens')) {
      out.push("      available: 'bg-success text-success-foreground',", "      busy: 'bg-warning text-warning-foreground',", "      away: 'bg-muted text-muted-foreground',")
    } else if (has.has('rules')) {
      out.push("      available: 'bg-primary text-primary-foreground',", "      busy: 'bg-primary text-primary-foreground',", "      away: 'bg-primary text-primary-foreground',")
    } else {
      out.push("      available: 'bg-green-500 text-white',", "      busy: 'bg-[#f59e0b] text-white',", "      away: 'bg-gray-300 text-[13px]',") // dot-ignore
    }
    out.push('    },', '  },', '})', '')
    out.push('export function StatusPill({ presence, className }) {', '  return <span className={cn(pill({ presence }), className)}>{presence}</span>', '}')
  } else {
    out.push('', 'export function StatusPill({ presence }) {')
    if (has.has('rules') || has.has('tokens')) {
      out.push("  const color = presence === 'available' ? 'bg-success' : presence === 'busy' ? 'bg-warning' : 'bg-muted'", '  return <span className={color}>{presence}</span>')
    } else {
      out.push("  const color = presence === 'available' ? '#22c55e' : '#f59e0b'", '  return <span style={{ background: color, padding: 4 }}>{presence}</span>') // dot-ignore
    }
    out.push('}')
  }
  return out
}

function audit(lines: string[]) {
  const findings: string[] = []
  lines.forEach((l, i) => {
    if (/#[0-9a-f]{3,8}\b/i.test(l)) findings.push(`line ${i + 1}: hex color`)
    if (/style=\{\{/.test(l)) findings.push(`line ${i + 1}: inline style`)
    if (/-\[\d+px\]/.test(l)) findings.push(`line ${i + 1}: arbitrary value`)
    if (/\b(bg|text)-(green|gray|red|white)\b|-(green|gray)-\d/.test(l)) findings.push(`line ${i + 1}: palette color, not a token`)
  })
  return findings
}

export function PromptLab({ onComplete, complete }: { onComplete: () => void; complete: boolean }) {
  const { story } = useGame()
  const [has, setHas] = useState<Set<Id>>(new Set())
  const [ran, setRan] = useState<string[] | null>(null)
  const lines = draft(has)
  const findings = ran ? audit(ran) : []
  const allIn = has.size === INGREDIENTS.length

  const toggle = (id: Id) => {
    const next = new Set(has)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setHas(next)
    setRan(null)
  }

  const runDot = () => {
    setRan(lines)
    if (allIn && audit(lines).length === 0) onComplete()
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="size-5" /> Prompt lab {complete && <Badge variant="success">Complete</Badge>}
        </CardTitle>
        <CardDescription>
          Build the prompt for "a StatusPill for presence." Watch what the AI writes as you add Dotty's four ingredients. Then run her audit on it.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Your prompt</div>
          <div className="rounded-lg border bg-background p-3 text-sm">
            <p>Make a StatusPill component that shows someone's presence (available, busy, away).</p>
            {INGREDIENTS.filter((x) => has.has(x.id)).map((x) => (
              <p key={x.id} className="mt-1 text-primary motion-safe:animate-in motion-safe:fade-in">
                {x.text}
              </p>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {INGREDIENTS.map((x) => (
              <label key={x.id} className={cn('flex cursor-pointer items-center gap-3 rounded-md border bg-card px-3 py-2 text-sm', has.has(x.id) && 'border-primary bg-accent')}>
                <input type="checkbox" checked={has.has(x.id)} onChange={() => toggle(x.id)} className="accent-primary" />
                <span className="font-medium">{x.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">What the AI wrote</div>
          <pre className="min-h-48 overflow-x-auto rounded-lg bg-terminal p-3 font-mono text-xs leading-relaxed text-terminal-foreground">{lines.join('\n')}</pre>
          <Button variant="outline" className="self-start font-mono" onClick={runDot}>
            <Play /> npm run dot
          </Button>
          {ran && (
            <div className={cn('flex gap-3 rounded-lg border p-3 text-sm', findings.length === 0 && 'border-success bg-success/10')} aria-live="polite">
              <CastAvatar member={story.cast.dot} size="sm" />
              <div className="flex flex-col gap-1">
                {findings.length ? (
                  <>
                    <strong>I found {findings.length} problem{findings.length > 1 ? 's' : ''}. We talked about this. 💜</strong>
                    {findings.map((f) => (
                      <span key={f} className="font-mono text-xs">
                        {f}
                      </span>
                    ))}
                  </>
                ) : allIn ? (
                  <strong>Token audit passed. Every value is a token. And it follows badge.tsx. I could cry. 💜</strong>
                ) : (
                  <span>
                    Passes my audit! But it's not following our component pattern yet, or it's guessing the file. Add the rest of the ingredients. 💜
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
