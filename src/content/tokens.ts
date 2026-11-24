/**
 * Token names exposed to content files, with the utility class that
 * paints a swatch of each. The values themselves live in
 * src/styles/tokens.css, the single source of truth.
 */
export const TOKEN_SWATCHES = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  accent: 'bg-accent',
  muted: 'bg-muted',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  sidebar: 'bg-sidebar',
  'cast-you': 'bg-cast-you',
  'cast-priya': 'bg-cast-priya',
  'cast-gus': 'bg-cast-gus',
  'cast-dot': 'bg-cast-dot',
  'cast-bjorn': 'bg-cast-bjorn',
  'cast-bot': 'bg-cast-bot',
} as const

export type TokenName = keyof typeof TOKEN_SWATCHES
