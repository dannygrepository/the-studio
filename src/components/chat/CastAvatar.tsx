import bjorn from '@/assets/cast/bjorn.webp'
import ci3po from '@/assets/cast/ci3po.webp'
import dot from '@/assets/cast/dot.webp'
import gus from '@/assets/cast/gus.webp'
import priya from '@/assets/cast/priya.webp'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

/** Portraits for the cast. The player ("you") keeps their initials. */
const PORTRAIT: Partial<Record<CastMember['color'], string>> = {
  priya,
  gus,
  dot,
  bjorn,
  bot: ci3po,
}

export function CastAvatar({
  member,
  size = 'md',
  className,
}: {
  member: CastMember
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const sizes = { sm: 'size-5 text-xs', md: 'size-9 text-sm', lg: 'size-12 text-base', xl: 'size-20 text-xl' }
  const portrait = PORTRAIT[member.color]
  return (
    <Avatar className={cn(sizes[size], size === 'xl' ? 'rounded-xl' : size !== 'sm' && 'rounded-lg', COLOR[member.color], className)}>
      {portrait && <AvatarImage src={portrait} alt={member.name} className="object-cover" />}
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
