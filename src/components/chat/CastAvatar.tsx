import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { CastMember } from '@/game/types'

const COLOR: Record<CastMember['color'], string> = {
  you: 'bg-cast-you',
  priya: 'bg-cast-priya',
  gus: 'bg-cast-gus',
  dot: 'bg-cast-dot',
  bjorn: 'bg-cast-bjorn',
  bot: 'bg-cast-bot',
}

export function CastAvatar({
  member,
  size = 'md',
  className,
}: {
  member: CastMember
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizes = { sm: 'size-5 text-xs', md: 'size-9 text-sm', lg: 'size-12 text-base' }
  return (
    <Avatar className={cn(sizes[size], size !== 'sm' && 'rounded-lg', className)}>
      <AvatarFallback
        className={cn(
          COLOR[member.color],
          'text-primary-foreground',
          size !== 'sm' && 'rounded-lg',
        )}
      >
        {size === 'sm' ? member.initials.slice(0, 1) : member.initials}
      </AvatarFallback>
    </Avatar>
  )
}
