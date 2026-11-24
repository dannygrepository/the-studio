import { Palette } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { RichText } from '@/components/chat/RichText'

/** The 2–3 sentence "why", told with a design analogy. */
export function ConceptCard({ title, text }: { title: string; text: string }) {
  return (
    <Card className="gap-2 border-primary/30 bg-accent py-4">
      <CardContent className="flex gap-3 px-4">
        <Palette className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="flex flex-col gap-1 text-accent-foreground">
          <div className="font-semibold">{title}</div>
          <p className="text-sm leading-relaxed">
            <RichText text={text} />
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
