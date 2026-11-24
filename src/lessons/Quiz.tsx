import { useState } from 'react'
import { CircleHelp } from 'lucide-react'

import { CastAvatar } from '@/components/chat/CastAvatar'
import { RichText } from '@/components/chat/RichText'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGame } from '@/game/GameContext'
import type { CoworkerId } from '@/game/types'
import { cn } from '@/lib/utils'

export interface QuizQuestion {
  q: string
  /** Who reacts to your answer. */
  from: CoworkerId
  options: { text: string; correct?: boolean; why: string }[]
}

/** One question at a time. Wrong answers explain why, then let you try again. */
export function Quiz({
  title = 'Quick check',
  description = 'No penalties for wrong answers. Just explanations.',
  questions,
  onComplete,
  complete,
}: {
  title?: string
  description?: string
  questions: QuizQuestion[]
  onComplete: () => void
  complete: boolean
}) {
  const { story } = useGame()
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [firstTry, setFirstTry] = useState(0)
  const [missed, setMissed] = useState(false)
  const finished = i >= questions.length
  const q = questions[Math.min(i, questions.length - 1)]
  const choice = picked !== null ? q.options[picked] : null

  const pick = (n: number) => {
    if (choice?.correct) return
    setPicked(n)
    if (!q.options[n].correct) setMissed(true)
  }

  const next = () => {
    if (!missed) setFirstTry((x) => x + 1)
    setI(i + 1)
    setPicked(null)
    setMissed(false)
    if (i + 1 >= questions.length) onComplete()
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CircleHelp className="size-5" /> {title} {complete && <Badge variant="success">Complete</Badge>}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {finished ? (
          <p className="text-sm">
            Done. <strong>{firstTry} / {questions.length}</strong> on the first try.{' '}
            {firstTry === questions.length ? 'Gus nodded. Slightly.' : 'Every wrong answer was a free lesson.'}
          </p>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              Question {i + 1} of {questions.length}
            </div>
            <p className="text-base font-medium">
              <RichText text={q.q} />
            </p>
            <div className="flex flex-col gap-2">
              {q.options.map((o, n) => (
                <Button
                  key={o.text}
                  variant="choice"
                  size="choice"
                  onClick={() => pick(n)}
                  className={cn(
                    picked === n && o.correct && 'border-success bg-success/10',
                    picked === n && !o.correct && 'border-destructive bg-destructive/10',
                    choice?.correct && picked !== n && 'opacity-60',
                  )}
                >
                  <RichText text={o.text} />
                </Button>
              ))}
            </div>
            {choice && (
              <div className="flex gap-3 rounded-lg border p-3" aria-live="polite">
                <CastAvatar member={story.cast[q.from]} />
                <div className="flex flex-col gap-2 text-sm">
                  <strong>{choice.correct ? 'Right.' : 'Not quite.'}</strong>
                  <p>
                    <RichText text={choice.why} />
                  </p>
                  {choice.correct ? (
                    <Button size="sm" className="self-start" onClick={next}>
                      {i + 1 < questions.length ? 'Next question' : 'Finish'}
                    </Button>
                  ) : (
                    <span className="text-muted-foreground">Pick another answer.</span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
