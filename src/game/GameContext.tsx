import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import reviewsJson from '../../game/reviews.json'
import storyJson from '../../game/story.json'
import { DEFAULT_CHOICES, DEFAULT_PROGRESS } from './defaults'
import { allVisibleBeats, applyReward, buildStory, dayOf } from './engine'
import { load, reset, save } from './persistence'
import type { Choice, Choices, Progress, Reviews, Reward, Story } from './types'

const story = buildStory(storyJson as unknown as Story, reviewsJson as Reviews)

interface GameValue {
  story: Story
  progress: Progress
  choices: Choices
  ready: boolean
  pick: (beatId: string, choice: Choice) => void
  reward: (key: string, reward: Reward) => void
  completeLessonPart: (lessonId: string, part: string, reward?: Reward) => void
  passLesson: (lessonId: string, reward?: Reward) => void
  markSeen: (beatIds: string[]) => void
  setOnboarded: (done: boolean) => void
  resetGame: () => Promise<void>
}

const GameContext = createContext<GameValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(DEFAULT_PROGRESS)
  const [choices, setChoices] = useState<Choices>(DEFAULT_CHOICES)
  const [ready, setReady] = useState(false)
  const loaded = useRef(false)

  useEffect(() => {
    Promise.all([load('progress', DEFAULT_PROGRESS), load('choices', DEFAULT_CHOICES)]).then(
      ([p, c]) => {
        setProgress(p)
        setChoices(c)
        loaded.current = true
        setReady(true)
      },
    )
  }, [])

  useEffect(() => {
    if (loaded.current) save('progress', progress)
  }, [progress])
  useEffect(() => {
    if (loaded.current) save('choices', choices)
  }, [choices])

  // Apply one-time rewards on beats as they become visible (e.g. Gus's
  // review after you finish a ticket).
  useEffect(() => {
    if (!ready) return
    const pending = allVisibleBeats(story, progress, choices.choices).filter(
      (b) => b.reward && !progress.applied.includes(b.id),
    )
    if (!pending.length) return
    setProgress((p) => {
      let next = p
      for (const b of pending) {
        if (next.applied.includes(b.id)) continue
        next = applyReward(next, b.reward)
        next = { ...next, applied: [...next.applied, b.id] }
      }
      return next
    })
  }, [ready, progress, choices])

  const pick = useCallback((beatId: string, choice: Choice) => {
    const beat = story.beats.find((b) => b.id === beatId)
    setChoices((c) =>
      c.choices.some((x) => x.beat === beatId)
        ? c
        : {
            choices: [
              ...c.choices,
              {
                beat: beatId,
                choice: choice.id,
                day: beat ? dayOf(beat) : 1,
                at: new Date().toISOString(),
              },
            ],
          },
    )
    setProgress((p) => applyReward(p, choice.reward))
  }, [])

  const reward = useCallback((key: string, r: Reward) => {
    setProgress((p) =>
      p.applied.includes(key) ? p : { ...applyReward(p, r), applied: [...p.applied, key] },
    )
  }, [])

  const completeLessonPart = useCallback((lessonId: string, part: string, r?: Reward) => {
    setProgress((p) => {
      const lesson = p.lessons[lessonId] ?? { passed: false, parts: [] }
      if (lesson.parts.includes(part)) return p
      const next = applyReward(p, r)
      return {
        ...next,
        lessons: { ...next.lessons, [lessonId]: { ...lesson, parts: [...lesson.parts, part] } },
      }
    })
  }, [])

  const passLesson = useCallback((lessonId: string, r?: Reward) => {
    setProgress((p) => {
      const lesson = p.lessons[lessonId] ?? { passed: false, parts: [] }
      if (lesson.passed) return p
      const next = applyReward(p, r)
      return { ...next, lessons: { ...next.lessons, [lessonId]: { ...lesson, passed: true } } }
    })
  }, [])

  const markSeen = useCallback((ids: string[]) => {
    setProgress((p) => {
      const fresh = ids.filter((id) => !p.seen.includes(id))
      return fresh.length ? { ...p, seen: [...p.seen, ...fresh] } : p
    })
  }, [])

  const setOnboarded = useCallback((done: boolean) => {
    setProgress((p) => (p.onboarded === done ? p : { ...p, onboarded: done }))
  }, [])

  const resetGame = useCallback(async () => {
    loaded.current = false
    await reset()
    setProgress(DEFAULT_PROGRESS)
    setChoices(DEFAULT_CHOICES)
    loaded.current = true
  }, [])

  return (
    <GameContext.Provider
      value={{
        story,
        progress,
        choices,
        ready,
        pick,
        reward,
        completeLessonPart,
        passLesson,
        markSeen,
        setOnboarded,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>')
  return ctx
}
