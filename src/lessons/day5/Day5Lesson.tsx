import { LessonShell } from '../LessonShell'
import { Terminal } from '../Terminal'
import { CherryPicker } from './CherryPicker'
import { MergeVsRebase } from './MergeVsRebase'
import { day5Sim } from './sim'

export function Day5Lesson() {
  return (
    <LessonShell
      lesson="day5"
      day={5}
      title="Deadline juggling: stash, cherry-pick, rebase"
      intro="Real work gets interrupted. Today: park unfinished work, copy exactly one commit, and understand the two ways to catch up with main."
      parts={[
        {
          id: 'cherry',
          title: 'Stash and cherry-pick',
          concept: {
            title: 'Stash is a drawer. Cherry-pick is copying one layer.',
            text: '`git stash` puts your unsaved changes in a drawer so you can switch tasks with a clean desk; `git stash pop` takes them back out. `git cherry-pick <hash>` copies **one commit** from anywhere onto your current branch, like copying a single finished layer out of a messy exploration file.',
          },
          render: (p) => <CherryPicker {...p} />,
        },
        {
          id: 'rebase',
          title: 'Merge vs. rebase',
          concept: {
            title: 'Two ways to catch up with main.',
            text: '**Merge** brings main into your branch and records that it happened (a merge commit). **Rebase** replays your commits on top of the latest main, as if you\'d started today. Same code, different history. Rebase rewrites your commits, so only do it to branches nobody else is using.',
          },
          render: (p) => <MergeVsRebase {...p} />,
        },
        {
          id: 'terminal',
          title: 'Practice terminal',
          render: (p) => <Terminal sim={day5Sim} {...p} />,
        },
      ]}
    />
  )
}
