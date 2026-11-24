import { LessonShell } from '../LessonShell'
import { Quiz } from '../Quiz'
import { Terminal } from '../Terminal'
import { RevertOrReset } from './RevertOrReset'
import { day8Sim } from './sim'

export function Day8Lesson() {
  return (
    <LessonShell
      lesson="day8"
      day={8}
      title="Friday outage: undoing a bad deploy"
      intro="It's 4:58 PM on a Friday and the app is orange. Five minutes of lesson, then you fix it properly."
      minutes={6}
      parts={[
        {
          id: 'choose',
          title: 'Revert or reset?',
          concept: {
            title: "Don't erase shared history. Add an undo to it.",
            text: '`git revert <hash>` makes a **new commit** that undoes one old commit, like adding "undo" to version history rather than deleting a version. `git reset --hard` plus `git push --force` rewrites history: anything after that point is gone, for everyone. On a shared branch, always revert.',
          },
          render: (p) => <RevertOrReset {...p} />,
        },
        {
          id: 'quiz',
          title: 'Which undo when?',
          render: (p) => (
            <Quiz
              {...p}
              questions={[
                {
                  q: 'A bad commit is already on main, and other commits came after it. Which undo?',
                  from: 'gus',
                  options: [
                    { text: '`git revert <hash>`', correct: true, why: 'Undoes exactly that commit, keeps everything after it, and leaves a receipt.' },
                    { text: '`git reset --hard <hash>~1` and `git push --force`', why: 'That deletes every commit after it, including mine. On main. On a Friday.' },
                  ],
                },
                {
                  q: 'You made a commit 2 minutes ago and haven\'t pushed. You want to redo it. Which is fine?',
                  from: 'gus',
                  options: [
                    { text: '`git reset --soft HEAD~1`', correct: true, why: 'Unpushed means nobody else has it. Reset is fine on your own unshared work. --soft keeps your changes.' },
                    { text: '`git revert HEAD`', why: 'Works, but leaves a commit plus its undo for something nobody ever saw. Reset is cleaner here.' },
                  ],
                },
                {
                  q: 'You edited a file and want to throw away those unsaved changes. No commits involved.',
                  from: 'dot',
                  options: [
                    { text: '`git restore <file>`', correct: true, why: 'Back to how it was at the last commit. 💜 Like "revert to saved."' },
                    { text: '`git revert <file>`', why: 'Revert works on commits, not files. Restore is the one for files. 💜' },
                  ],
                },
                {
                  q: 'Why does CI-3PO call the revert commit "the receipt"?',
                  from: 'ci3po',
                  options: [
                    { text: 'History shows what broke, when, and exactly how it was undone.', correct: true, why: 'Correct. I keep receipts. I am mostly receipts.' },
                    { text: 'Because it costs money.', why: 'Builds cost money. Receipts are free. I would know.' },
                  ],
                },
              ]}
            />
          ),
        },
        {
          id: 'terminal',
          title: 'Practice terminal',
          render: (p) => <Terminal sim={day8Sim} {...p} />,
        },
      ]}
    />
  )
}
