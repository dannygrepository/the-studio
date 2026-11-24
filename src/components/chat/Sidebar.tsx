import { BookA, BookOpen, Check, Hash, Lock, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGame } from '@/game/GameContext'
import { visibleBeats } from '@/game/engine'
import { levelFor } from '@/game/levels'
import { useNav } from '@/game/nav'
import { usePlayer } from '@/game/usePlayer'
import { cn } from '@/lib/utils'
import { CastAvatar } from './CastAvatar'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 px-2">
      <div className="px-3 pt-4 pb-1 text-xs font-semibold tracking-wide text-sidebar-foreground/70 uppercase">
        {title}
      </div>
      {children}
    </div>
  )
}

export function Sidebar() {
  const { story, progress, choices } = useGame()
  const { view, go } = useNav()
  const player = usePlayer()
  const level = levelFor(progress.xp)

  const unread = (channelId: string) =>
    visibleBeats(story, progress, choices.choices, channelId).filter(
      (b) => !progress.seen.includes(b.id),
    ).length

  const active = (cond: boolean) => cn(cond && 'bg-sidebar-accent text-sidebar-accent-foreground')

  const days = story.days.filter((d) => d.day <= progress.day)

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-5 py-4">
        <div className="text-lg font-bold text-sidebar-accent-foreground">{story.meta.company}</div>
        <div className="text-xs">Day {progress.day} · {story.days.find((d) => d.day === progress.day)?.title}</div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto pb-4">
        <Section title="Studio Academy">
          {days.map((d) => {
            const passed = progress.lessons[d.lesson]?.passed
            return (
              <Button
                key={d.lesson}
                variant="sidebar"
                size="row"
                className={active(view.type === 'lesson' && view.id === d.lesson)}
                onClick={() => go({ type: 'lesson', id: d.lesson })}
              >
                <BookOpen />
                <span className="flex-1 truncate text-left">Day {d.day}: {d.title}</span>
                {passed ? <Check className="text-success" /> : <Badge variant="sidebar">New</Badge>}
              </Button>
            )
          })}
          {story.days
            .filter((d) => d.day === progress.day + 1)
            .map((d) => (
              <div key={d.lesson} className="flex h-8 items-center gap-2 px-3 text-sm opacity-50">
                <Lock className="size-4" /> Day {d.day}: {d.title}
              </div>
            ))}
          <Button
            variant="sidebar"
            size="row"
            className={active(view.type === 'dictionary')}
            onClick={() => go({ type: 'dictionary' })}
          >
            <BookA />
            <span className="flex-1 text-left">Git dictionary</span>
          </Button>
        </Section>

        <Section title="Channels">
          {story.channels
            .filter((c) => c.kind === 'channel')
            .map((c) => {
              const n = unread(c.id)
              return (
                <Button
                  key={c.id}
                  variant="sidebar"
                  size="row"
                  className={cn(active(view.type === 'channel' && view.id === c.id), n > 0 && 'font-semibold text-sidebar-accent-foreground')}
                  onClick={() => go({ type: 'channel', id: c.id })}
                >
                  <Hash />
                  <span className="flex-1 truncate text-left">{c.name}</span>
                  {n > 0 && <Badge variant="sidebar">{n}</Badge>}
                </Button>
              )
            })}
        </Section>

        <Section title="Direct messages">
          {story.channels
            .filter((c) => c.kind === 'dm' && c.with)
            .map((c) => {
              const member = story.cast[c.with!]
              const n = unread(c.id)
              return (
                <Button
                  key={c.id}
                  variant="sidebar"
                  size="row"
                  className={cn(active(view.type === 'channel' && view.id === c.id), n > 0 && 'font-semibold text-sidebar-accent-foreground')}
                  onClick={() => go({ type: 'channel', id: c.id })}
                >
                  <CastAvatar member={member} size="sm" />
                  <span className="flex-1 truncate text-left">{member.name}</span>
                  {n > 0 && <Badge variant="sidebar">{n}</Badge>}
                </Button>
              )
            })}
          <Button
            variant="sidebar"
            size="row"
            className={active(view.type === 'people')}
            onClick={() => go({ type: 'people' })}
          >
            <Users />
            <span className="flex-1 text-left">People</span>
          </Button>
        </Section>
      </nav>

      <div className="flex items-center gap-3 border-t border-sidebar-border px-4 py-3">
        <CastAvatar member={player.member} />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-sidebar-accent-foreground">
            {player.name || 'New hire (unnamed)'}
          </div>
          <div className="truncate text-xs">{level.title}</div>
        </div>
      </div>
    </aside>
  )
}
