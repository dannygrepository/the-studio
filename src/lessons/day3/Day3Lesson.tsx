import { LessonShell } from '../LessonShell'
import { Quiz } from '../Quiz'
import { Terminal } from '../Terminal'
import { PullRequestSim } from './PullRequestSim'
import { day3Sim } from './sim'

export function Day3Lesson() {
  return (
    <LessonShell
      lesson="day3"
      day={3}
      title="Pull requests: getting your work onto main"
      intro="A branch is a draft. A pull request is how a draft becomes the real thing, with a second pair of eyes on the way."
      parts={[
        {
          id: 'pr',
          title: 'Anatomy of a pull request',
          concept: {
            title: 'A pull request is a design crit for code.',
            text: 'You present your branch ("please merge this into main"), people comment, you iterate, and it ships. **Base** is where the work lands (main). **Compare** is the branch with the work. Pushing new commits to the branch updates the same pull request, like updating a frame that\'s already in the crit deck.',
          },
          render: (p) => <PullRequestSim {...p} />,
        },
        {
          id: 'quiz',
          title: 'Pull request sense',
          render: (p) => (
            <Quiz
              {...p}
              questions={[
                {
                  q: 'Gus requested a change on your open pull request. You fix it locally. What next?',
                  from: 'gus',
                  options: [
                    { text: 'Commit and `git push`. The pull request updates itself.', correct: true, why: 'Same branch, same pull request. Push and it shows up for review.' },
                    { text: 'Open a new pull request with the fix.', why: 'That\'s two pull requests for one change. Ask Bjorn how that went.' },
                    { text: 'Close the pull request and start over.', why: 'No need. Pull requests are meant to be iterated on.' },
                  ],
                },
                {
                  q: 'Your branch is older than a change on main that you need. What do you run on your branch?',
                  from: 'gus',
                  options: [
                    { text: '`git merge main`', correct: true, why: 'It brings main\'s new commits into your branch. Then your code can use them.' },
                    { text: '`git push --force`', why: 'That overwrites the remote. It doesn\'t get you anything from main.' },
                    { text: '`git clone` again', why: 'A fresh clone works, but you\'d lose your branch setup. Merge is the move.' },
                  ],
                },
                {
                  q: 'On GitHub\'s "Comparing changes" screen, which is right for your onboarding branch?',
                  from: 'priya',
                  options: [
                    { text: 'base: `main` ← compare: `onboarding/add-sam`', correct: true, why: 'yes!! work flows from your branch INTO main 🎉 (the arrow points that way) (it\'s a helpful arrow)' },
                    { text: 'base: `onboarding/add-sam` ← compare: `main`', why: 'that one would merge main into your branch!! close, but backwards 🙏' },
                  ],
                },
                {
                  q: 'The pull request is merged on GitHub. Your laptop\'s `main` is…',
                  from: 'gus',
                  options: [
                    { text: 'Behind. Run `git switch main` and `git pull`.', correct: true, why: 'GitHub merged it, not your laptop. Pull to catch up.' },
                    { text: 'Updated automatically.', why: 'Git never changes your laptop without you asking. That\'s a feature.' },
                  ],
                },
              ]}
            />
          ),
        },
        {
          id: 'terminal',
          title: 'Practice terminal',
          render: (p) => <Terminal sim={day3Sim} {...p} />,
        },
      ]}
    />
  )
}
