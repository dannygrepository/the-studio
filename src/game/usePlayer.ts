import { newHire } from '@/content/team'
import { useGame } from './GameContext'
import type { CastMember } from './types'

/** You, as the team sees you. Your name comes from src/content/team.ts. */
export function usePlayer() {
  const { story } = useGame()
  const name = newHire?.name?.trim() || ''
  const first = name.split(' ')[0]
  const member: CastMember = {
    ...story.cast.you,
    name: name || story.cast.you.name,
    initials: name
      ? name
          .split(' ')
          .map((p) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : story.cast.you.initials,
  }
  /** Fill {name} placeholders in story text. */
  const fill = (text: string) => text.replaceAll('{name}', first || 'new hire')
  return { name, first, member, fill, inDirectory: !!newHire }
}
