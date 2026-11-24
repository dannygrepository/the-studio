import { UserPlus, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { newHire, team, type TeamMember } from '@/content/team'
import { TOKEN_SWATCHES } from '@/content/tokens'
import { useGame } from '@/game/GameContext'
import { usePlayer } from '@/game/usePlayer'
import type { CastId, CastMember } from '@/game/types'
import { cn } from '@/lib/utils'
import { CastAvatar } from './CastAvatar'

function Person({ person, member, isYou }: { person: TeamMember; member: CastMember; isYou?: boolean }) {
  return (
    <Card className={cn('gap-3 py-4', isYou && 'border-primary ring-3 ring-primary/20')}>
      <CardHeader className="flex items-center gap-3 px-4">
        <CastAvatar member={member} size="lg" />
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2">
            {person.name}
            {isYou && <Badge>You</Badge>}
          </CardTitle>
          <CardDescription>{person.title}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4 text-sm">
        <p>{person.funFact}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={cn('size-4 rounded-sm border', TOKEN_SWATCHES[person.favoriteToken])} />
          Favorite token: <code className="font-mono">{person.favoriteToken}</code>
        </div>
      </CardContent>
    </Card>
  )
}

export function PeopleView() {
  const { story } = useGame()
  const player = usePlayer()
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b px-6 py-3">
        <Users className="size-5 text-muted-foreground" />
        <div>
          <h1 className="text-lg font-semibold">People</h1>
          <p className="text-sm text-muted-foreground">
            Built from <code className="font-mono">src/content/team.ts</code>
          </p>
        </div>
      </header>
      <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-1 gap-4 overflow-y-auto p-6 lg:grid-cols-2 2xl:grid-cols-3">
        {newHire ? (
          <Person person={newHire} member={player.member} isYou />
        ) : (
          <Card className="gap-3 border-dashed py-4">
            <CardHeader className="flex items-center gap-3 px-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                <UserPlus className="size-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle>Your spot</CardTitle>
                <CardDescription>Reserved for the new hire</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-4 text-sm text-muted-foreground">
              Ticket STU-1 puts you here. Edit <code className="font-mono">newHire</code> in{' '}
              <code className="font-mono">src/content/team.ts</code>.
            </CardContent>
          </Card>
        )}
        {team.map((p) => (
          <Person key={p.id} person={p} member={story.cast[p.id as CastId]} />
        ))}
      </div>
    </div>
  )
}
