import { LessonShell } from '../LessonShell'
import { Quiz } from '../Quiz'
import { Terminal } from '../Terminal'
import { ConflictResolver } from './ConflictResolver'
import { day4Sim } from './sim'

export function Day4Lesson() {
  return (
    <LessonShell
      lesson="day4"
      day={4}
      title="Merge conflicts: the boss fight"
      intro="Two people changed the same lines. Git refuses to guess who wins. Today you learn that this is fine, and exactly what to do."
      parts={[
        {
          id: 'resolver',
          title: 'Read the markers, pick the lines',
          concept: {
            title: 'A conflict is two designers editing the same text layer.',
            text: 'When both branches change the same lines, git stops and writes **both versions** into the file between markers: `<<<<<<<` (yours), `=======` (the divider), `>>>>>>>` (theirs). You decide what the file should say (sometimes yours, sometimes theirs, often a mix), delete the markers, then `git add` and `git commit` to finish.',
          },
          render: (p) => <ConflictResolver {...p} />,
        },
        {
          id: 'quiz',
          title: 'Conflict sense',
          render: (p) => (
            <Quiz
              {...p}
              questions={[
                {
                  q: 'Git says `CONFLICT (content): Merge conflict in copy.ts`. Has anything been lost?',
                  from: 'gus',
                  options: [
                    { text: 'No. Both versions are in the file, waiting for you to choose.', correct: true, why: 'Nothing is lost. Git paused so you can decide. And `git merge --abort` puts everything back if you want to start over.' },
                    { text: 'Yes, Bjorn\'s changes overwrote mine.', why: 'Git never silently overwrites in a conflict. That\'s the whole reason it stopped.' },
                  ],
                },
                {
                  q: 'You\'ve edited the file and removed the markers. Git still says "unmerged paths." Why?',
                  from: 'gus',
                  options: [
                    { text: 'You have to `git add` the file to mark it resolved.', correct: true, why: 'Staging a conflicted file is how you tell git "I\'ve decided." Then commit.' },
                    { text: 'You need to save the file again.', why: 'Saving isn\'t enough. Git watches the staging area, not your editor.' },
                    { text: 'You have to delete the branch.', why: 'Please don\'t. Just `git add` the file.' },
                  ],
                },
                {
                  q: 'Halfway through a scary conflict, you want to start over. What\'s the safe move?',
                  from: 'bjorn',
                  options: [
                    { text: '`git merge --abort`', correct: true, why: 'it puts everything back like the merge never happened!! 🙌 (i learned this the hard way) (by not knowing it)' },
                    { text: '`git push --force`', why: 'NO. i mean. that\'s what i would have said last month 😅 it doesn\'t undo a merge, it overwrites the remote.' },
                    { text: 'Delete the folder and clone again', why: 'that works but you lose anything unpushed!! abort is way better 🫡' },
                  ],
                },
                {
                  q: 'Priya wants your title and Bjorn\'s subtitle. Which resolution is right?',
                  from: 'priya',
                  options: [
                    { text: 'Keep one title line and one subtitle line, from different sides. No markers.', correct: true, why: 'yes!!! a mix is totally allowed 🎉 (resolving is choosing) (not just picking a side)' },
                    { text: 'Keep both sides and let git figure it out', why: 'then the file has two titles and TypeScript gets upset 🙏' },
                  ],
                },
              ]}
            />
          ),
        },
        {
          id: 'terminal',
          title: 'Practice terminal',
          render: (p) => <Terminal sim={day4Sim} {...p} />,
        },
      ]}
    />
  )
}
