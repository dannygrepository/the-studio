import { BookA, Search } from 'lucide-react'
import { useState } from 'react'

import { ALL_TERMS, KIND_LABEL, type TermKind } from '@/content/gitDictionary'
import { GitCommand } from './GitCommand'

const ORDER: TermKind[] = ['tool', 'command', 'option', 'name', 'placeholder']
const HEADINGS: Record<TermKind, string> = {
  tool: 'Programs',
  command: 'Git commands',
  option: 'Options (the dashes)',
  name: 'Special names',
  placeholder: 'Things you fill in',
}

export function DictionaryView() {
  const [q, setQ] = useState('')
  const query = q.trim().toLowerCase()
  const matches = ALL_TERMS.filter(
    (t) =>
      !query ||
      t.term.toLowerCase().includes(query) ||
      t.short.toLowerCase().includes(query) ||
      t.more?.toLowerCase().includes(query),
  )

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <BookA className="size-6 text-primary" /> Git dictionary
          </h1>
          <p className="text-muted-foreground">
            Every word you'll meet in a git command, in plain language. Tip: anywhere in the app,
            hover a dotted word in a command to see what it means.
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
          <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            How to read a command
          </div>
          <p className="text-sm">
            <GitCommand command="git switch -c onboarding/add-sam" />
          </p>
          <p className="text-sm text-muted-foreground">
            Program, then what to do, then options (the dashes), then the thing to do it to. Read it
            out loud: “git, switch to a new branch, create it, call it onboarding/add-sam.”
          </p>
        </div>

        <label className="flex items-center gap-2 rounded-lg border bg-card px-3 focus-within:ring-2 focus-within:ring-ring">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: push, -m, origin…"
            aria-label="Search the git dictionary"
            className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </label>

        {ORDER.map((kind) => {
          const terms = matches.filter((t) => t.kind === kind)
          if (!terms.length) return null
          return (
            <section key={kind} className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                {HEADINGS[kind]}
              </h2>
              <dl className="flex flex-col divide-y rounded-lg border bg-card">
                {terms.map((t) => (
                  <div key={t.term} className="grid gap-1 p-4 sm:grid-cols-4 sm:gap-4">
                    <dt className="flex flex-col items-start gap-1">
                      <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-sm font-semibold text-accent-foreground">
                        {t.term}
                      </code>
                      <span className="text-xs text-muted-foreground">{KIND_LABEL[t.kind]}</span>
                    </dt>
                    <dd className="flex flex-col gap-1 text-sm sm:col-span-3">
                      <span>{t.short}</span>
                      {t.more && <span className="text-muted-foreground">{t.more}</span>}
                      {t.example && (
                        <span className="text-xs text-muted-foreground">
                          e.g. <code className="font-mono">{t.example}</code>
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )
        })}
        {!matches.length && (
          <p className="text-sm text-muted-foreground">
            Nothing matches “{q}”. Ask your coach: they know a suspicious amount of git.
          </p>
        )}
      </div>
    </div>
  )
}
