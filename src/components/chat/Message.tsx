import { BookOpen, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGame } from '@/game/GameContext'
import { pickedChoice } from '@/game/engine'
import { useNav } from '@/game/nav'
import { usePlayer } from '@/game/usePlayer'
import type { Beat, CastId, Reward } from '@/game/types'
import { CastAvatar } from './CastAvatar'
import { RichText } from './RichText'
import { TicketCard } from './TicketCard'

function RewardChips({ reward }: { reward?: Reward }) {
  const { story } = useGame()
  if (!reward) return null
  const chips: { label: string; variant: 'success' | 'destructive' | 'default' | 'warning' }[] = []
  if (reward.xp) chips.push({ label: `+${reward.xp} XP`, variant: 'default' })
  for (const [who, d] of Object.entries(reward.rep ?? {})) {
    if (!d) continue
    const name = story.cast[who as CastId].name.split(' ')[0]
    chips.push({ label: `${name} ${d > 0 ? '+' : ''}${d}`, variant: d > 0 ? 'success' : 'destructive' })
  }
  if (reward.badge) chips.push({ label: `🏅 ${reward.badge}`, variant: 'warning' })
  if (!chips.length) return null
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {chips.map((c) => (
        <Badge key={c.label} variant={c.variant}>
          {c.label}
        </Badge>
      ))}
    </div>
  )
}

function Line({ from, text, time, children }: { from: CastId; text: string; time?: string; children?: React.ReactNode }) {
  const { story } = useGame()
  const player = usePlayer()
  const member = from === 'you' ? player.member : story.cast[from]
  return (
    <div className="group flex gap-3 rounded-lg px-4 py-2 hover:bg-muted">
      <CastAvatar member={member} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold">{member.name}</span>
          {from === 'ci3po' && <Badge variant="secondary">BOT</Badge>}
          <span className="text-xs text-muted-foreground">{from === 'you' ? 'you' : member.role}</span>
          {time && <span className="text-xs text-muted-foreground">· {time}</span>}
        </div>
        <div className="text-base leading-relaxed">
          <RichText text={player.fill(text)} />
        </div>
        {children}
      </div>
    </div>
  )
}

export function Message({ beat }: { beat: Beat }) {
  const { choices, pick, story, progress } = useGame()
  const { go } = useNav()
  const { fill } = usePlayer()
  const picked = pickedChoice(choices.choices, beat.id)
  const choice = beat.choices?.find((c) => c.id === picked?.choice)
  const lessonPassed = beat.lesson ? progress.lessons[beat.lesson]?.passed : false
  const day = story.days.find((d) => d.lesson === beat.lesson)

  return (
    <>
      <Line from={beat.from} text={beat.text} time={beat.time}>
        <RewardChips reward={beat.reward} />
        {beat.lesson && day && (
          <Button
            className="mt-3"
            variant={lessonPassed ? 'outline' : 'default'}
            onClick={() => go({ type: 'lesson', id: beat.lesson! })}
          >
            <BookOpen />
            {lessonPassed ? `Review Day ${day.day} lesson` : `Start Day ${day.day} lesson`}
          </Button>
        )}
        {beat.ticket && <TicketCard ticketId={beat.ticket} />}
        {beat.choices && !choice && (
          <div className="mt-3 flex max-w-xl flex-col gap-2">
            <div className="flex items-center gap-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <Sparkles className="size-3" /> Your reply
            </div>
            {beat.choices.map((c) => (
              <Button key={c.id} variant="choice" size="choice" onClick={() => pick(beat.id, c)}>
                <RichText text={fill(c.text)} />
              </Button>
            ))}
          </div>
        )}
      </Line>
      {choice && (
        <>
          <Line from="you" text={choice.text}>
            <RewardChips reward={choice.reward} />
          </Line>
          {choice.replies?.map((r, i) => (
            <Line key={i} from={r.from} text={r.text} />
          ))}
        </>
      )}
    </>
  )
}
