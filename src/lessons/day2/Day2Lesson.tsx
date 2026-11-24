import { LessonShell } from '../LessonShell'
import { Quiz } from '../Quiz'
import { Terminal } from '../Terminal'
import { HistoryExplorer } from './HistoryExplorer'
import { day2Sim } from './sim'

export function Day2Lesson() {
  return (
    <LessonShell
      lesson="day2"
      day={2}
      title="Reading history: who broke the button?"
      intro="Git remembers every version of every file. Today you learn to read that history like a detective."
      parts={[
        {
          id: 'explorer',
          title: 'History detective',
          concept: {
            title: 'git log is the version history panel. git blame is "who touched this layer last."',
            text: '`git log` lists every commit, newest first. `git show <hash>` opens one commit, like clicking a version to see what changed. `git blame <file>` labels each line with the commit that last changed it. Together, they answer **what**, **who**, and **when** without asking anyone.',
          },
          render: (p) => <HistoryExplorer {...p} />,
        },
        {
          id: 'quiz',
          title: 'Which tool when?',
          render: (p) => (
            <Quiz
              {...p}
              questions={[
                {
                  q: 'You want to know who last changed line 12 of `button.tsx`. Which command?',
                  from: 'gus',
                  options: [
                    { text: '`git blame src/components/ui/button.tsx`', correct: true, why: 'Blame annotates every line with the commit that last touched it.' },
                    { text: '`git log --oneline`', why: 'That lists commits for the whole repo. Useful, but it won\'t point at a line.' },
                    { text: '`git status`', why: 'Status is about **your** uncommitted changes, not history.' },
                  ],
                },
                {
                  q: 'You have a hash, `9f2b6a1`. How do you see exactly what that commit changed?',
                  from: 'gus',
                  options: [
                    { text: '`git show 9f2b6a1`', correct: true, why: 'Show prints the message, the author, and the diff for one commit.' },
                    { text: '`git switch 9f2b6a1`', why: 'That would move you onto that old version. Not what you want here.' },
                    { text: '`git diff`', why: 'Plain `git diff` shows your own unstaged changes, not an old commit.' },
                  ],
                },
                {
                  q: 'Why does Dotty want the culprit commit\'s hash in your fix\'s message?',
                  from: 'dot',
                  options: [
                    { text: 'So anyone reading history later can jump straight to where the bug came from.', correct: true, why: 'Exactly. 💜 It links the cure to the cause. It\'s not about blame.' },
                    { text: 'So Bjorn gets in trouble.', why: 'Never. 💜 It\'s a link, not a verdict. Bjorn owned up himself, actually.' },
                    { text: 'Git requires it.', why: 'Git doesn\'t care. Your future teammates do.' },
                  ],
                },
                {
                  q: 'How do you add a body (a second paragraph) to a commit message from the terminal?',
                  from: 'gus',
                  options: [
                    { text: '`git commit -m "Subject" -m "Body"`', correct: true, why: 'Each `-m` becomes its own paragraph. First is the subject, the rest is the body.' },
                    { text: '`git commit -m "Subject. Body."`', why: 'That crams it all into the subject line. Gus counts characters.' },
                    { text: '`git commit --body "Body"`', why: 'Not a real option. Use a second `-m`.' },
                  ],
                },
              ]}
            />
          ),
        },
        {
          id: 'terminal',
          title: 'Practice terminal',
          concept: {
            title: 'Investigate first. Then fix. Then say where it came from.',
            text: 'Find the commit, make a `fix/…` branch, put the tokens back, and write a commit whose body says **"Introduced in <hash>."** That\'s exactly your ticket, with safety wheels on.',
          },
          render: (p) => <Terminal sim={day2Sim} {...p} />,
        },
      ]}
    />
  )
}
