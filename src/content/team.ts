/**
 * THE STUDIO — TEAM DIRECTORY
 *
 * This file powers the People page in the app.
 *
 * 🎫 STU-1 (from Gus): Add yourself to the directory.
 *    Replace `null` below with your own entry, save, and check the
 *    People page. Then commit it on a branch and push.
 *
 * Example:
 *   export const newHire: TeamMember | null = {
 *     name: 'Sam Rivera',
 *     title: 'Product Designer',
 *     funFact: 'Owns 14 houseplants, names them after fonts.',
 *     favoriteToken: 'primary',
 *   }
 *
 * favoriteToken must be a real token name. Dot checks. (So does TypeScript.)
 */

import type { TokenName } from './tokens'

export interface TeamMember {
  name: string
  title: string
  funFact: string
  favoriteToken: TokenName
}

export const team: (TeamMember & { id: string })[] = [
  {
    id: 'priya',
    name: 'Priya Raman',
    title: 'Product Manager',
    funFact: 'Has never once had a quick question.',
    favoriteToken: 'cast-priya',
  },
  {
    id: 'gus',
    name: 'Gus Okafor',
    title: 'Senior Engineer',
    funFact: 'Has typed "LGTM" four times in eleven years. Framed all four.',
    favoriteToken: 'cast-gus',
  },
  {
    id: 'dot',
    name: 'Dot Lindqvist',
    title: 'Design System Lead',
    funFact: 'Can identify an off-token gray from across the room.',
    favoriteToken: 'cast-dot',
  },
  {
    id: 'bjorn',
    name: 'Bjorn Halvorsen',
    title: 'Engineering Intern',
    funFact: 'Pushed to main on his first day. Also his second.',
    favoriteToken: 'cast-bjorn',
  },
  {
    id: 'ci3po',
    name: 'CI-3PO',
    title: 'Build Bot',
    funFact: 'Fluent in over six million error messages.',
    favoriteToken: 'cast-bot',
  },
]

// 👇 Your entry goes here.
export const newHire: TeamMember | null = null
