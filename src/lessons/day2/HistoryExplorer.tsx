import { useState } from 'react'
import { FileCode, GitCommitHorizontal, Search, UserSearch } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GitCommand } from '@/components/git/GitCommand'
import { cn } from '@/lib/utils'
import { BLAME, CULPRIT, HISTORY } from './history'

type Tab = 'log' | 'blame'

/** Click through a pretend history to find the commit that broke the Button. */
export function HistoryExplorer({ onComplete, complete }: { onComplete: () => void; complete: boolean }) {
  const [tab, setTab] = useState<Tab>('log')
  const [selected, setSelected] = useState<string | null>(null)
  const [accused, setAccused] = useState<string | null>(null)
  const [fileOnly, setFileOnly] = useState(false)

  const shown = fileOnly ? HISTORY.filter((c) => c.files.includes('src/components/ui/button.tsx')) : HISTORY
  const commit = HISTORY.find((c) => c.hash === selected)
  const solved = accused === CULPRIT

  const accuse = (hash: string) => {
    setAccused(hash)
    if (hash === CULPRIT) onComplete()
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="size-5" /> History detective {complete && <Badge variant="success">Complete</Badge>}
        </CardTitle>
        <CardDescription>
          Someone put a hex code in the Button. Use the history to find the exact commit, then accuse it. Two tools:
          the log (what happened, in order) and blame (who last touched each line).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2" role="tablist">
          <Button role="tab" aria-selected={tab === 'log'} variant={tab === 'log' ? 'default' : 'outline'} size="sm" onClick={() => setTab('log')}>
            <GitCommitHorizontal /> git log
          </Button>
          <Button role="tab" aria-selected={tab === 'blame'} variant={tab === 'blame' ? 'default' : 'outline'} size="sm" onClick={() => setTab('blame')}>
            <UserSearch /> git blame button.tsx
          </Button>
        </div>

        {tab === 'log' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <GitCommand
                  command={fileOnly ? 'git log --oneline -- src/components/ui/button.tsx' : 'git log --oneline'}
                  className="text-xs"
                />
                <Button variant="ghost" size="sm" onClick={() => setFileOnly(!fileOnly)}>
                  {fileOnly ? 'Show all files' : 'Only button.tsx'}
                </Button>
              </div>
              <ul className="flex flex-col gap-1 rounded-lg bg-terminal p-2 font-mono text-sm">
                {shown.map((c) => (
                  <li key={c.hash}>
                    <button
                      type="button"
                      onClick={() => setSelected(c.hash)}
                      className={cn(
                        'flex w-full cursor-pointer gap-2 rounded-sm px-2 py-1 text-left text-terminal-foreground hover:bg-terminal-muted/20',
                        selected === c.hash && 'bg-terminal-muted/30',
                      )}
                    >
                      <span className="text-warning">{c.hash}</span>
                      <span className="min-w-0 flex-1">{c.subject}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                Click a commit to see it, like <code className="font-mono">git show &lt;hash&gt;</code>.
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border bg-background p-3">
              {commit ? (
                <>
                  <GitCommand command={`git show ${commit.hash}`} className="self-start text-xs" />
                  <div className="text-sm">
                    <div className="font-semibold">{commit.subject}</div>
                    <div className="text-muted-foreground">
                      {commit.author} · {commit.when}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {commit.files.map((f) => (
                      <Badge key={f} variant="outline">
                        <FileCode /> {f}
                      </Badge>
                    ))}
                  </div>
                  <pre className="overflow-x-auto rounded-md bg-terminal p-2 font-mono text-xs">
                    {commit.diff.map((l, i) => (
                      <div key={i} className={l.startsWith('+') ? 'text-terminal-prompt' : l.startsWith('-') ? 'text-destructive' : 'text-terminal-muted'}>
                        {l}
                      </div>
                    ))}
                  </pre>
                  <Button size="sm" variant={solved ? 'outline' : 'default'} className="self-start" onClick={() => accuse(commit.hash)}>
                    This commit broke it
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Pick a commit on the left to inspect it.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <GitCommand command="git blame src/components/ui/button.tsx" className="self-start text-xs" />
            <div className="overflow-x-auto rounded-lg bg-terminal p-2 font-mono text-xs">
              {BLAME.map((b, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSelected(b.hash)
                    setTab('log')
                  }}
                  className="flex w-full cursor-pointer gap-3 rounded-sm px-2 py-0.5 text-left whitespace-pre hover:bg-terminal-muted/20"
                >
                  <span className="text-warning">{b.hash}</span>
                  <span className="w-12 shrink-0 text-terminal-muted">{b.author}</span>
                  <span className="text-terminal-foreground">{b.line}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Each line shows the commit that last changed it. Click a line to open that commit.
            </p>
          </div>
        )}

        {accused && (
          <div className={cn('rounded-lg p-3 text-sm', solved ? 'bg-success/10' : 'bg-accent text-accent-foreground')} aria-live="polite">
            {solved ? (
              <>
                <strong>Case closed.</strong> <code className="font-mono">9f2b6a1</code> "Make buttons pop more" swapped{' '}
                <code className="font-mono">bg-primary</code> for a hex code. In the ticket you'll name it in your commit message
                like this: <em>"Introduced in 9f2b6a1."</em> (Your real hash will be different.)
              </>
            ) : (
              <>
                Dotty: "Not that one. 💜 Did that commit touch <code className="font-mono">button.tsx</code>? Try filtering the log
                to that file, or use blame."
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
