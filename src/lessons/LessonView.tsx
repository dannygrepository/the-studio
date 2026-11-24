import type { ComponentType } from 'react'

import { Day1Lesson } from './day1/Day1Lesson'
import { Day2Lesson } from './day2/Day2Lesson'
import { Day3Lesson } from './day3/Day3Lesson'
import { Day4Lesson } from './day4/Day4Lesson'
import { Day5Lesson } from './day5/Day5Lesson'
import { Day6Lesson } from './day6/Day6Lesson'
import { Day7Lesson } from './day7/Day7Lesson'
import { Day8Lesson } from './day8/Day8Lesson'
import { Day9Lesson } from './day9/Day9Lesson'

/** Register each day's lesson here. */
const LESSONS: Record<string, ComponentType> = {
  day1: Day1Lesson,
  day2: Day2Lesson,
  day3: Day3Lesson,
  day4: Day4Lesson,
  day5: Day5Lesson,
  day6: Day6Lesson,
  day7: Day7Lesson,
  day8: Day8Lesson,
  day9: Day9Lesson,
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
