import { useState } from 'react'

import { ChannelView } from '@/components/chat/ChannelView'
import { PeopleView } from '@/components/chat/PeopleView'
import { ProgressPanel } from '@/components/chat/ProgressPanel'
import { Sidebar } from '@/components/chat/Sidebar'
import { DictionaryView } from '@/components/git/DictionaryView'
import { Onboarding } from '@/components/onboarding/Onboarding'
import { GameProvider, useGame } from '@/game/GameContext'
import { NavContext, type View } from '@/game/nav'
import { LessonView } from '@/lessons/LessonView'

function Shell() {
  const { ready, progress } = useGame()
  const [view, setView] = useState<View>({ type: 'channel', id: 'general' })

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        CI-3PO is booting. Please hold. Or don't. It's not like it matters.
      </div>
    )
  }

  if (!progress.onboarded) return <Onboarding />

  return (
    <NavContext.Provider value={{ view, go: setView }}>
      <div className="flex h-full min-h-0">
        <Sidebar />
        <main className="min-w-0 flex-1 bg-background">
          {view.type === 'channel' && <ChannelView channelId={view.id} />}
          {view.type === 'people' && <PeopleView />}
          {view.type === 'dictionary' && <DictionaryView />}
          {view.type === 'lesson' && <LessonView lessonId={view.id} />}
        </main>
        <ProgressPanel />
      </div>
    </NavContext.Provider>
  )
}

export default function App() {
  return (
    <GameProvider>
      <Shell />
    </GameProvider>
  )
}
