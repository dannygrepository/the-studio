import type { ComponentType } from 'react'

import { Day1Lesson } from './day1/Day1Lesson'

/** Register each day's lesson here. */
const LESSONS: Record<string, ComponentType> = {
  day1: Day1Lesson,
}

export function LessonView({ lessonId }: { lessonId: string }) {
  const Lesson = LESSONS[lessonId]
  return (
    <div className="h-full overflow-y-auto">
      {Lesson ? (
        <Lesson />
      ) : (
        <p className="p-6 text-muted-foreground">This lesson is still being written. Priya says it's "basically done."</p>
      )}
    </div>
  )
}
