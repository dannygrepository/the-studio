import { Fragment } from 'react'

import { GitCommand } from '@/components/git/GitCommand'
import { isCommand } from '@/content/gitDictionary'

/** Tiny formatter for story text: **bold**, `code`, and line breaks. */
export function RichText({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**'))
              return <strong key={j}>{part.slice(2, -2)}</strong>
            if (part.startsWith('`') && part.endsWith('`') && isCommand(part.slice(1, -1)))
              return <GitCommand key={j} command={part.slice(1, -1)} />
            if (part.startsWith('`') && part.endsWith('`'))
              return (
                <code
                  key={j}
                  className="rounded-sm bg-muted px-1 py-0.5 font-mono text-sm text-accent-foreground"
                >
                  {part.slice(1, -1)}
                </code>
              )
            return <Fragment key={j}>{part}</Fragment>
          })}
        </Fragment>
      ))}
    </>
  )
}
