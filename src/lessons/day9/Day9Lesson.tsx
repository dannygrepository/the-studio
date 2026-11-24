import { LessonShell } from '../LessonShell'
import { Quiz } from '../Quiz'
import { Terminal } from '../Terminal'
import { Sequencer } from './Sequencer'
import { day9Sim } from './sim'

export function Day9Lesson() {
  return (
    <LessonShell
      lesson="day9"
      day={9}
      title="The big ship: ticket to merged PR"
      intro="No new commands today. Just everything you've learned, in order, on a real feature."
      parts={[
        {
          id: 'loop',
          title: 'The whole loop',
          concept: {
            title: 'Shipping is a loop, not a leap.',
            text: 'Pull, branch, small commit, small commit, small commit, push, pull request, review, merge, pull. Every feature, at every size. Small commits make review easy and undoing safe, the same way small, named frames make a design file easy to hand off.',
          },
          render: (p) => <Sequencer {...p} />,
        },
        {
          id: 'quiz',
          title: 'Nine days in four questions',
          render: (p) => (
            <Quiz
              {...p}
              title="Final review"
              questions={[
                {
                  q: 'Halfway through the Kudos page, Priya needs an urgent one-line fix shipped. Your work isn\'t ready.',
                  from: 'priya',
                  options: [
                    { text: '`git stash`, branch from main, fix, PR, merge, then `git stash pop`.', correct: true, why: 'YES 🎉 (you remembered stash) (i still don\'t know what it means) (proud of you)' },
                    { text: 'Commit the half-done Kudos work with the fix and ship both.', why: 'then half a Kudos page goes to main 🙏 (the CEO will see it) (the CEO sees everything)' },
                  ],
                },
                {
                  q: 'You merge main into your branch and get a conflict in `Sidebar.tsx`. Bjorn edited the same lines.',
                  from: 'bjorn',
                  options: [
                    { text: 'Open it, keep the right lines from both, delete the markers, `git add`, `git commit`.', correct: true, why: 'boss fight energy 💪 (it was me, sorry) (it\'s always me)' },
                    { text: '`git push --force`', why: 'i used to say that. i don\'t anymore 🫡' },
                  ],
                },
                {
                  q: 'The AI drafted your `KudosView`. It used `text-white` and a `div` with an `onClick`.',
                  from: 'dot',
                  options: [
                    { text: 'Fix both before committing: a token for text, a real button (or no click).', correct: true, why: 'Tools catch rules. You caught meaning. 💜' },
                    { text: '`npm run dot` passed, so ship it.', why: 'My audit doesn\'t see either of those. You do. 💜' },
                  ],
                },
                {
                  q: 'Your Kudos page merged, and it broke the sidebar on mobile. Others have merged since. Fix?',
                  from: 'gus',
                  options: [
                    { text: '`git revert <your merge>` on a branch, PR, merge. Then fix properly.', correct: true, why: 'Undo safely first, then fix calmly. History stays honest.' },
                    { text: 'Reset main to before your merge and force push.', why: 'And erase everyone who merged after you. No.' },
                  ],
                },
              ]}
            />
          ),
        },
        {
          id: 'terminal',
          title: 'Practice terminal',
          render: (p) => <Terminal sim={day9Sim} {...p} />,
        },
      ]}
    />
  )
}
