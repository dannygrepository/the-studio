import { LessonShell } from '../LessonShell'
import { Quiz } from '../Quiz'
import { Terminal } from '../Terminal'
import { SpotTheBugs } from './SpotTheBugs'
import { day7Sim } from './sim'

export function Day7Lesson() {
  return (
    <LessonShell
      lesson="day7"
      day={7}
      title="Reviewing AI code"
      intro="AI code looks finished. That's what makes it hard to review. Today you learn what tools catch, what only people catch, and how to say it kindly."
      parts={[
        {
          id: 'spot',
          title: 'Spot the problems',
          concept: {
            title: 'Tools check rules. People check meaning.',
            text: 'Dotty\'s audit catches hard-coded values. It can\'t tell whether something clickable is a real button, what a screen reader will say, or what happens when the count is zero. Review AI code the way you\'d review a teammate\'s: **tokens, accessibility, edge cases, and "does this already exist?"**',
          },
          render: (p) => <SpotTheBugs {...p} />,
        },
        {
          id: 'quiz',
          title: 'Review etiquette',
          render: (p) => (
            <Quiz
              {...p}
              questions={[
                {
                  q: 'Which review comment would Gus write?',
                  from: 'gus',
                  options: [
                    { text: '"This div is clickable but not focusable. Could it be a <button>, or drop the onClick since the row handles it?"', correct: true, why: 'Says what, why, and a way forward. About the code, not the person.' },
                    { text: '"Did you even test this?"', why: 'True feelings, wrong comment. Bjorn reads them twice.' },
                    { text: '"nit"', why: 'One word comments make people guess. Say what you mean.' },
                  ],
                },
                {
                  q: 'The PR has a hex color, a missing label, and a clickable div. Approve, comment, or request changes?',
                  from: 'gus',
                  options: [
                    { text: 'Request changes. These would ship real problems.', correct: true, why: 'Accessibility and token issues aren\'t nits. Request changes, kindly.' },
                    { text: 'Approve. It looks great on Bjorn\'s screen.', why: 'It does look great on Bjorn\'s screen. That\'s the problem.' },
                  ],
                },
                {
                  q: 'Before reviewing line by line, what\'s a good first question?',
                  from: 'dot',
                  options: [
                    { text: 'Does a component like this already exist in our system?', correct: true, why: 'Yes!! 💜 We already have Badge with a sidebar variant. Reuse beats rebuild.' },
                    { text: 'How many lines is it?', why: 'Short code can still be wrong code. 💜 Start with "do we need it at all?"' },
                  ],
                },
                {
                  q: 'A screen reader reads the badge as "3". What should it say?',
                  from: 'gus',
                  options: [
                    { text: '"3 unread messages", via aria-label.', correct: true, why: 'The number means something visually because of where it sits. A screen reader needs the words.' },
                    { text: '"Badge".', why: 'That\'s even less helpful than "3".' },
                  ],
                },
              ]}
            />
          ),
        },
        {
          id: 'terminal',
          title: 'Practice terminal',
          render: (p) => <Terminal sim={day7Sim} {...p} />,
        },
      ]}
    />
  )
}
