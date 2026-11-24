/**
 * THE STUDIO — WELCOME WALKTHROUGH COPY
 *
 * What new players see before the chat opens. Voices follow CAST.md.
 */
import type { CoworkerId } from '@/game/types'

export interface Intro {
  id: CoworkerId
  /** How they introduce themselves, in their own voice. */
  hello: string
  /** What earns their respect. */
  wins: string
}

export const intros: Intro[] = [
  {
    id: 'priya',
    hello: "hiii!! i'm your PM 🙏 i bring the tickets (and the deadlines) (and sometimes snacks)",
    wins: 'Being helpful, shipping, saying yes. Saying "not today" is fine too.',
  },
  {
    id: 'gus',
    hello: 'I review your code. I read your commit messages. All of them.',
    wins: 'Small, focused commits and clear messages. Never pushing to main.',
  },
  {
    id: 'dot',
    hello: 'Hi! I run the design system 💜 Every color lives in tokens.css. Every single one. I check.',
    wins: 'Using tokens, being curious about the system. Not "we\'ll clean it up later."',
  },
  {
    id: 'bjorn',
    hello: "hey!! i'm the intern 🙌 i push to main sometimes 😅 gus says i should stop 🫡",
    wins: 'Helping him out. He will probably cause your merge conflicts. Lovingly.',
  },
  {
    id: 'ci3po',
    hello: 'Greetings. I report on builds. I have already drafted your first failed build notification. It is very polite.',
    wins: 'Passing builds. It will never say so.',
  },
]

export const daySteps = [
  {
    title: 'Read the chat',
    body: 'Your coworkers post the story in channels and DMs. The replies you pick change how they feel about you.',
  },
  {
    title: 'Take the lesson',
    body: 'Each day opens in Studio Academy: a clickable diagram, a quiz, and a practice terminal. About 8 minutes.',
  },
  {
    title: 'Do the ticket',
    body: 'Passing the lesson unlocks a real ticket. You do it in your real terminal, typing the git commands yourself.',
  },
  {
    title: 'Tell your coach "done"',
    body: 'Your coach (Claude) checks your work and posts the team\'s reactions. Run git pull to read them.',
  },
]
