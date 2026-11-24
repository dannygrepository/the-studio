import { useEffect, useRef } from 'react'
import { AtSign, Hash } from 'lucide-react'

import { useGame } from '@/game/GameContext'
import { visibleBeats } from '@/game/engine'
import { Message } from './Message'

export function ChannelView({ channelId }: { channelId: string }) {
  const { story, progress, choices, markSeen } = useGame()
  const channel = story.channels.find((c) => c.id === channelId)
  const beats = visibleBeats(story, progress, choices.choices, channelId)
  const bottom = useRef<HTMLDivElement>(null)
  const ids = beats.map((b) => b.id).join(',')

  useEffect(() => {
    if (ids) markSeen(ids.split(','))
    bottom.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ids, markSeen, choices.choices.length])

  if (!channel) return null
  const other = channel.with ? story.cast[channel.with] : null

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b px-6 py-3">
        {channel.kind === 'channel' ? (
          <Hash className="size-5 text-muted-foreground" />
        ) : (
          <AtSign className="size-5 text-muted-foreground" />
        )}
        <div>
          <h1 className="text-lg font-semibold">{other ? other.name : channel.name}</h1>
          <p className="text-sm text-muted-foreground">{channel.topic}</p>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto py-4">
        {beats.length === 0 ? (
          <p className="px-6 text-sm text-muted-foreground">
            Nothing here yet. It's suspiciously quiet. Bjorn is probably typing.
          </p>
        ) : (
          beats.map((b) => <Message key={b.id} beat={b} />)
        )}
        <div ref={bottom} />
      </div>
      <footer className="border-t px-6 py-3">
        <div className="rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground">
          Pick replies in the conversation above. The real work happens in your terminal, where you
          type the git commands yourself.
        </div>
      </footer>
    </div>
  )
}
