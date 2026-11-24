import { LessonShell } from '../LessonShell'
import { Quiz } from '../Quiz'
import { Terminal } from '../Terminal'
import { PromptLab } from './PromptLab'
import { day6Sim } from './sim'

export function Day6Lesson() {
  return (
    <LessonShell
      lesson="day6"
      day={6}
      title="Building with AI, inside a design system"
      intro="AI writes a fast first draft. Today you learn to make that draft good on purpose, and to check everything it touched."
      parts={[
        {
          id: 'prompt',
          title: 'Prompt lab',
          concept: {
            title: 'A prompt is a design brief.',
            text: 'A vague brief gets a generic design; a vague prompt gets hex codes and inline styles. Give the AI what you\'d give a new teammate: **which file**, **which existing component to copy**, **which tokens**, and **the rules**. Then check its work like you\'d check anyone\'s.',
          },
          render: (p) => <PromptLab {...p} />,
        },
        {
          id: 'quiz',
          title: 'Owning the draft',
          render: (p) => (
            <Quiz
              {...p}
              questions={[
                {
                  q: 'The AI says "Done! ✨". What do you do before committing?',
                  from: 'gus',
                  options: [
                    { text: '`git status` and `git diff` to see everything it changed, then `npm run check`.', correct: true, why: 'Trust, then verify. AI changes files you didn\'t mention more often than you\'d think.' },
                    { text: '`git add .` and commit. It said done.', why: 'Then you\'ve committed whatever it did, including the parts you didn\'t ask for.' },
                  ],
                },
                {
                  q: 'The AI used `bg-green-500` for "available". Dotty\'s audit doesn\'t flag it. Is it fine?',
                  from: 'dot',
                  options: [
                    { text: 'No. Use `bg-success`. Palette colors bypass our tokens.', correct: true, why: 'Palette colors are hex codes in a costume. 💜 If we retheme, green-500 stays green forever.' },
                    { text: 'Yes. The audit passed.', why: 'The audit is a safety net, not a reviewer. You\'re the reviewer. 💜' },
                  ],
                },
                {
                  q: 'The AI edited `tokens.css` "for better contrast". You didn\'t ask. What now?',
                  from: 'gus',
                  options: [
                    { text: '`git restore src/styles/tokens.css`, then mention it to Dotty if it\'s a real problem.', correct: true, why: 'Undo what\'s out of scope. If the idea is good, propose it properly, separately.' },
                    { text: 'Keep it. More contrast is good.', why: 'It changes every warning in the app. That\'s Dotty\'s call, in its own PR.' },
                  ],
                },
                {
                  q: 'Who is responsible for AI-written code you commit?',
                  from: 'gus',
                  options: [
                    { text: 'You. Your name is on the commit.', correct: true, why: 'Exactly. The AI is a tool. The author is you.' },
                    { text: 'The AI.', why: 'The AI doesn\'t get paged at 2 AM. You do.' },
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
            title: 'Review the diff, not the vibe.',
            text: '`git status` shows every file that changed. `git diff <file>` shows how. `git restore <file>` throws away a change you don\'t want. Then commit in small pieces, naming files, never `git add .` after an AI session.',
          },
          render: (p) => <Terminal sim={day6Sim} {...p} />,
        },
      ]}
    />
  )
}
