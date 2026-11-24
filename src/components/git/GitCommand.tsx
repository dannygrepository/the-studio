import { Fragment } from 'react'

import { explain, KIND_LABEL, type Part } from '@/content/gitDictionary'
import { cn } from '@/lib/utils'

/**
 * A git command where every known word has a hover (or focus) definition.
 * Used inline in chat, tickets, and lessons.
 */
export function GitCommand({ command, className }: { command: string; className?: string }) {
  const parts = explain(command)
  return (
    <code
      className={cn(
        'rounded-sm bg-muted px-1 py-0.5 font-mono text-sm text-accent-foreground',
        className,
      )}
    >
      {parts.map((p, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          <Word part={p} />
        </Fragment>
      ))}
    </code>
  )
}

function Word({ part }: { part: Part }) {
  if (!part.term) return <>{part.text}</>
  return (
    <span className="group/word relative inline-block">
      <span
        tabIndex={0}
        className="cursor-help underline decoration-primary/50 decoration-dotted underline-offset-4 outline-none hover:decoration-primary focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
      >
        {part.text}
      </span>
      <span
        role="tooltip"
        className="invisible absolute bottom-full left-0 z-50 mb-2 flex w-64 flex-col gap-1 rounded-md bg-foreground p-3 font-sans text-xs text-background opacity-0 shadow-lg transition-opacity group-focus-within/word:visible group-focus-within/word:opacity-100 group-hover/word:visible group-hover/word:opacity-100"
      >
        <span className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-sm font-semibold">{part.text}</span>
          <span className="tracking-wide uppercase opacity-70">{KIND_LABEL[part.term.kind]}</span>
        </span>
        <span>{part.term.short}</span>
        {part.term.more && <span className="opacity-70">{part.term.more}</span>}
      </span>
    </span>
  )
}

/** A word-by-word breakdown of a command, as a list. For lessons. */
export function CommandBreakdown({ command, className }: { command: string; className?: string }) {
  const parts = explain(command)
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <code className="font-mono text-base font-semibold">{command}</code>
      <dl className="flex flex-col gap-2 text-sm">
        {parts.map((p, i) => (
          <div key={i} className="flex gap-3">
            <dt className="w-48 shrink-0">
              <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-accent-foreground break-all">
                {p.text}
              </code>
            </dt>
            <dd className="text-muted-foreground">{p.term?.short ?? '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
