/** The pretend history used by the Day 2 explorer and terminal. Mirrors what the coach plants. */
export interface FakeCommit {
  hash: string
  author: string
  when: string
  subject: string
  files: string[]
  diff: string[]
}

export const HISTORY: FakeCommit[] = [
  {
    hash: 'e07a2d4',
    author: 'Bjorn Halvorsen',
    when: '25 minutes ago',
    subject: 'Fix typo in the standup note',
    files: ['README.md'],
    diff: ['-Standup is at 9:30. Priya will say its quick.', "+Standup is at 9:30. Priya will say it's quick."],
  },
  {
    hash: 'b51c9e3',
    author: 'Gus Okafor',
    when: '45 minutes ago',
    subject: 'Add a doc comment to Badge',
    files: ['src/components/ui/badge.tsx'],
    diff: ['+/** Small status labels. Every variant maps to a token. */', ' const badgeVariants = cva('],
  },
  {
    hash: '4e8d0b7',
    author: 'Dotty Lindqvist',
    when: '1 hour ago',
    subject: 'Document the success token',
    files: ['src/styles/tokens.css'],
    diff: ["+  /* Success: confirmations, passing builds, and 'Fan' reputation. */", '   --success: oklch(0.6 0.15 155);'], // dot-ignore
  },
  {
    hash: '9f2b6a1',
    author: 'Bjorn Halvorsen',
    when: '80 minutes ago',
    subject: 'Make buttons pop more',
    files: ['src/components/ui/button.tsx'],
    diff: [
      "-        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',",
      "+        default: 'bg-[#6B5CE7] text-primary-foreground shadow-xs hover:bg-[#5A4BD6]',", // dot-ignore
    ],
  },
  {
    hash: 'c3d4e5f',
    author: 'Priya Raman',
    when: '95 minutes ago',
    subject: 'Add standup time to the README',
    files: ['README.md'],
    diff: ['+## Team rituals', '+', '+Standup is at 9:30. Priya will say its quick.'],
  },
  {
    hash: '7be3d10',
    author: 'Dotty Lindqvist',
    when: '3 days ago',
    subject: 'Add design tokens',
    files: ['src/styles/tokens.css', 'src/components/ui/button.tsx'],
    diff: ['+  --primary: oklch(0.52 0.19 275);', "+        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',"], // dot-ignore
  },
]

export const CULPRIT = '9f2b6a1'

/** `git blame src/components/ui/button.tsx`, abridged. */
export const BLAME: { hash: string; author: string; line: string }[] = [
  { hash: '7be3d10', author: 'Dotty', line: 'const buttonVariants = cva(' },
  { hash: '7be3d10', author: 'Dotty', line: '  "inline-flex items-center justify-center gap-2 …",' },
  { hash: '7be3d10', author: 'Dotty', line: '  {' },
  { hash: '7be3d10', author: 'Dotty', line: '    variants: {' },
  { hash: '7be3d10', author: 'Dotty', line: '      variant: {' },
  { hash: '9f2b6a1', author: 'Bjorn', line: "        default: 'bg-[#6B5CE7] text-primary-foreground shadow-xs hover:bg-[#5A4BD6]'," }, // dot-ignore
  { hash: '7be3d10', author: 'Dotty', line: "        destructive: 'bg-destructive text-primary-foreground …'," },
  { hash: '7be3d10', author: 'Dotty', line: "        outline: 'border bg-background shadow-xs hover:bg-accent …'," },
]
