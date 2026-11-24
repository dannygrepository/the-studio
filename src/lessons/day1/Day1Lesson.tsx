import { LessonShell } from '../LessonShell'
import { Terminal } from '../Terminal'
import { BranchPlayground } from './BranchPlayground'
import { CommitCourt } from './CommitCourt'
import { day1Sim } from './gitSim'

export function Day1Lesson() {
  return (
    <LessonShell
      lesson="day1"
      day={1}
      title="Onboarding: your first commit"
      intro="Three short, hands-on parts. Finish all three to unlock your first real ticket from Gus."
      parts={[
        {
          id: 'playground',
          title: 'Snapshots, branches and push',
          concept: {
            title: 'Commits are versions. Branches are duplicate pages.',
            text: "A **commit** is a snapshot of the whole project with a note attached, like a named version in Figma's version history. A **branch** is a duplicate page where you explore without touching the main file, and **main** is the published library everyone trusts. **Clone** downloads the file with its whole history; **push** publishes your new versions to GitHub so the team can see them.",
          },
          render: (p) => <BranchPlayground {...p} />,
        },
        {
          id: 'court',
          title: "Gus's Commit Court",
          concept: {
            title: 'A commit message is a layer name for a change.',
            text: '"Rectangle 47" tells nobody anything; "Header / Search / Focus" tells everyone. Commit messages are how your team scans history months from now, so Gus wants them short, specific, and in command form: **Add**, **Fix**, **Remove**.',
          },
          render: (p) => <CommitCourt {...p} />,
        },
        {
          id: 'terminal',
          title: 'Practice terminal',
          concept: {
            title: 'Staging is choosing what goes in the export.',
            text: '`git add` picks which changed files go into the next snapshot, like selecting the frames you want before exporting. `git commit` is hitting Export with a name. The daily loop is: **branch → edit → add → commit → push**.',
          },
          render: (p) => <Terminal sim={day1Sim} {...p} />,
        },
      ]}
    />
  )
}
