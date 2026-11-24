/**
 * Day-by-day coach logic: what the coach sets up in git, what it checks when
 * the player says "done", hint ladders, and cheat sheet entries.
 *
 * Setup functions run in a throwaway worktree of origin/main. They make
 * commits as the cast and may publish extra branches (returned as a list).
 */
import { commitProblems, isGeneratedSubject } from './commitRules.mjs'
import {
  STUDIO_DOMAIN,
  changedFiles,
  checkRef,
  commitAs,
  commits,
  edit,
  git,
  isAncestor,
  playerEmail,
  pullRequestCount,
  remoteBranches,
  remoteUrl,
  replaceOnce,
  show,
  tryGit,
  write,
} from './lib.mjs'

/* ------------------------------------------------------------------ */
/* Shared check helpers                                                 */
/* ------------------------------------------------------------------ */

const MAIN = 'origin/main'

function item(label, ok, detail = '', level = 'required') {
  return { label, ok: !!ok, detail, level }
}

/** The newest remote branch with this prefix (by commit date). */
function latestBranch(prefix) {
  const names = remoteBranches(prefix)
  if (!names.length) return null
  return names
    .map((n) => ({ n, t: Number(tryGit(['log', '-1', '--format=%ct', `origin/${n}`]) ?? 0) }))
    .sort((a, b) => b.t - a.t)[0].n
}

/** First commit on main (by the cast) with this subject. */
function findCastCommit(subject, ref = MAIN) {
  return commits(ref, undefined, ['--fixed-strings', `--grep=${subject}`]).find(
    (c) => c.subject === subject && c.email.endsWith(STUDIO_DOMAIN),
  )
}

/**
 * Commits on main's first-parent line the player pushed directly (not via a
 * merged PR). Only commits authored with the player's own git email count, so
 * the game's starting history never does.
 */
function directPushes() {
  const me = playerEmail()
  const SEP = '\u001f'
  const out = tryGit(['log', '--first-parent', `--format=%H${SEP}%ae${SEP}%ce${SEP}%s${SEP}%P`, MAIN]) ?? ''
  return out
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      const [hash, ae, ce, subject, parents] = l.split(SEP)
      return { hash, ae, ce, subject, merge: parents.split(' ').length > 1 }
    })
    .filter(
      (c) =>
        (me ? c.ae === me : true) &&
        !c.ae.endsWith(STUDIO_DOMAIN) &&
        !c.ce.endsWith(STUDIO_DOMAIN) &&
        c.ce !== 'noreply@github.com' &&
        !/^Merge pull request #\d+/.test(c.subject) &&
        !/\(#\d+\)$/.test(c.subject),
    )
    // The template's own first commit isn't the player's doing.
    .filter((c) => tryGit(['rev-list', '--max-parents=0', MAIN])?.split('\n').includes(c.hash) === false)
}

function mainUntouched() {
  const pushes = directPushes()
  return item(
    'Nobody pushed straight to main',
    pushes.length === 0,
    pushes.length ? `Direct pushes: ${pushes.map((c) => `${c.hash.slice(0, 7)} "${c.subject}"`).join(', ')}` : '',
  )
}

function usedPullRequests(min) {
  const url = remoteUrl()
  if (!/github\.com/.test(url)) return item(`Opened at least ${min} pull request(s)`, true, '(not on GitHub, skipped)', 'info')
  const n = pullRequestCount()
  if (n === null) return item(`Opened at least ${min} pull request(s)`, true, '(could not list pull requests, skipped)', 'info')
  return item(`Opened at least ${min} pull request(s) in total`, n >= min, `${n} found`)
}

function courtItems(list, label = 'Commit messages pass Commit Court', level = 'warn') {
  const own = list.filter((c) => !c.email.endsWith(STUDIO_DOMAIN) && !isGeneratedSubject(c.subject) && c.parents.length < 2)
  const bad = own.map((c) => ({ c, p: commitProblems(c.subject) })).filter((x) => x.p.length)
  return item(
    label,
    own.length > 0 && bad.length === 0,
    own.length === 0
      ? 'No commits of yours found'
      : bad.length
        ? bad.map((x) => `"${x.c.subject}": ${x.p.join(', ')}`).join('; ')
        : own.map((c) => `"${c.subject}"`).join(', '),
    level,
  )
}

function checksPass(ref, label) {
  const r = checkRef(ref)
  return [
    item(`${label}: npm run dot passes`, r.dot.ok, r.dot.ok ? '' : r.dot.out.split('\n').slice(0, 6).join(' | ')),
    item(`${label}: type check passes`, r.types.ok, r.types.ok ? '' : r.types.out.split('\n').slice(0, 4).join(' | ')),
  ]
}

function branchItem(prefix) {
  const b = latestBranch(prefix)
  return { b, it: item(`A ${prefix}… branch is on GitHub`, !!b, b ? `origin/${b}` : `No branch starting with ${prefix} found. Did they push with -u origin?`) }
}

/** Commits since the coach set up this day (on main). */
function sinceSetup(day) {
  const marker = commits(MAIN, undefined, ['--fixed-strings', `--grep=Set up Day ${day}`]).find((c) => c.email.endsWith(STUDIO_DOMAIN))
  return marker ? commits(`${marker.hash}..${MAIN}`) : commits(MAIN)
}

/* ------------------------------------------------------------------ */
/* Days                                                                 */
/* ------------------------------------------------------------------ */

export const DAYS = {
  /* ---------------------------------------------------------------- */
  1: {
    ticket: 'STU-1',
    title: 'Add yourself to the team directory',
    check() {
      const { b, it } = branchItem('onboarding/')
      const out = [it]
      if (b) {
        const ref = `origin/${b}`
        const files = changedFiles(MAIN, ref)
        out.push(item('Changes only src/content/team.ts', files.length === 1 && files[0] === 'src/content/team.ts', files.join(', ')))
        const entry = show(ref, 'src/content/team.ts') ?? ''
        out.push(item('newHire is filled in', !/newHire: TeamMember \| null = null/.test(entry)))
        out.push(courtItems(commits(`${MAIN}..${ref}`), undefined, 'required'))
        out.push(...checksPass(ref, 'Their branch'))
      }
      out.push(mainUntouched())
      return out
    },
    hints: [
      'Ask what `git status` says. Are they on their onboarding/ branch?',
      'The order is: switch -c, edit team.ts, add, commit -m, push -u origin <branch>.',
      'Spell it out: `git add src/content/team.ts` then `git commit -m "Add <name> to the team directory"` then `git push -u origin onboarding/add-<name>`.',
    ],
    tell: 'Run `git switch main` then `git pull` to see what the team thinks. (Your name tag shows "New Hire" on main until your branch is merged on Day 3. That is expected.)',
  },

  /* ---------------------------------------------------------------- */
  2: {
    ticket: 'STU-2',
    title: 'Who broke the button?',
    setup(dir) {
      edit(dir, 'README.md', (t) => `${t.trimEnd()}\n\n## Team rituals\n\nStandup is at 9:30. Priya will say its quick.\n`)
      commitAs(dir, 'priya', 'Add standup time to the README', 95)
      edit(dir, 'src/components/ui/button.tsx', (t) =>
        replaceOnce(
          t,
          "default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',",
          "default: 'bg-[#6B5CE7] text-primary-foreground shadow-xs hover:bg-[#5A4BD6]',",
          'day 2 button hex',
        ),
      )
      commitAs(dir, 'bjorn', 'Make buttons pop more', 80)
      edit(dir, 'src/styles/tokens.css', (t) =>
        replaceOnce(t, '  --success: oklch(', "  /* Success: confirmations, passing builds, and 'Fan' reputation. */\n  --success: oklch(", 'day 2 token doc'),
      )
      commitAs(dir, 'dot', 'Document the success token', 60)
      edit(dir, 'src/components/ui/badge.tsx', (t) =>
        replaceOnce(t, 'const badgeVariants = cva(', '/** Small status labels. Every variant maps to a token. */\nconst badgeVariants = cva(', 'day 2 badge doc'),
      )
      commitAs(dir, 'gus', 'Add a doc comment to Badge', 45)
      edit(dir, 'README.md', (t) => replaceOnce(t, 'Priya will say its quick.', "Priya will say it's quick.", 'day 2 readme typo'))
      commitAs(dir, 'bjorn', 'Fix typo in the standup note', 25)
      return []
    },
    check() {
      const culprit = findCastCommit('Make buttons pop more')
      const out = [item('Found the planted culprit commit (coach sanity check)', !!culprit, culprit ? culprit.short : 'Run `npm run coach -- setup 2`?', 'info')]
      const { b, it } = branchItem('fix/')
      out.push(it)
      if (b) {
        const ref = `origin/${b}`
        const files = changedFiles(MAIN, ref)
        out.push(item('Changes only src/components/ui/button.tsx', files.length === 1 && files[0] === 'src/components/ui/button.tsx', files.join(', ')))
        const btn = show(ref, 'src/components/ui/button.tsx') ?? ''
        out.push(item('The hex colors are gone, back to tokens', !/#[0-9a-fA-F]{3,8}/.test(btn) && btn.includes("default: 'bg-primary")))
        const mine = commits(`${MAIN}..${ref}`)
        const mentions = culprit && mine.some((c) => c.body.includes(culprit.short) || c.body.includes(culprit.hash.slice(0, 8)))
        out.push(item('Commit message names the culprit commit hash', mentions, culprit ? `Looking for ${culprit.short}` : ''))
        out.push(courtItems(mine, undefined, 'required'))
        out.push(...checksPass(ref, 'Their branch'))
      }
      out.push(mainUntouched())
      return out
    },
    hints: [
      'Ask: which file do Buttons get their color from? What does `git log --oneline -- <that file>` show?',
      '`git blame src/components/ui/button.tsx` shows who last touched each line. `git show <hash>` shows that whole commit.',
      'Find it with `git log --oneline -- src/components/ui/button.tsx`, fix the two classes back to `bg-primary` and `hover:bg-primary/90`, then commit with a body: `git commit -m "Restore primary token on default Button" -m "Introduced in <hash>."`',
    ],
    tell: 'Run `git switch main` then `git pull`. Gus has thoughts, and Priya has news.',
  },

  /* ---------------------------------------------------------------- */
  3: {
    ticket: 'STU-3',
    title: 'Your first pull requests',
    setup(dir) {
      edit(dir, 'src/content/team.ts', (t) => {
        t = replaceOnce(t, '  favoriteToken: TokenName\n}', '  favoriteToken: TokenName\n  /** Optional. Shown on the People page. */\n  pronouns?: string\n}', 'day 3 pronouns type')
        const P = { 'Product Manager': 'she/her', 'Senior Engineer': 'he/him', 'Design System Lead': 'she/her', 'Engineering Intern': 'he/him', 'Build Bot': 'it/its' }
        for (const [title, pro] of Object.entries(P)) {
          t = replaceOnce(t, `    title: '${title}',\n`, `    title: '${title}',\n    pronouns: '${pro}',\n`, `day 3 pronouns ${title}`)
        }
        return t
      })
      edit(dir, 'src/components/chat/PeopleView.tsx', (t) =>
        replaceOnce(t, '<CardDescription>{person.title}</CardDescription>', '<CardDescription>\n            {person.title}\n            {person.pronouns && ` · ${person.pronouns}`}\n          </CardDescription>', 'day 3 pronouns view'),
      )
      commitAs(dir, 'priya', 'Add pronouns to the team directory', 30)
      return []
    },
    check() {
      const out = []
      const btn = show(MAIN, 'src/components/ui/button.tsx') ?? ''
      out.push(item('PR 1 merged: the Button fix is on main', !/#[0-9a-fA-F]{3,8}/.test(btn)))
      const team = show(MAIN, 'src/content/team.ts') ?? ''
      const entry = team.split('export const newHire')[1] ?? ''
      out.push(item('PR 2 merged: their directory entry is on main', !/=\s*null\s*$/.test(entry.trim())))
      out.push(item('Gus\'s requested change: their entry has pronouns', /pronouns:\s*['"`]/.test(entry)))
      const pron = findCastCommit('Add pronouns to the team directory')
      const branch = latestBranch('onboarding/')
      if (pron && branch) {
        out.push(item('They brought main into their branch before merging', isAncestor(pron.hash, `origin/${branch}`), '', 'warn'))
      }
      out.push(usedPullRequests(2))
      out.push(mainUntouched())
      out.push(...checksPass(MAIN, 'main'))
      return out
    },
    hints: [
      'On GitHub: Pull requests → New pull request. Base: main. Compare: their branch. Make sure the base repo is THEIR repo.',
      'For Gus\'s change: `git switch onboarding/add-<name>`, then `git merge main` to bring in the pronouns field, then edit, commit, push. The PR updates by itself.',
      'After merging both PRs on GitHub: `git switch main`, `git pull`, then `git branch -d <branch>` to tidy up.',
    ],
    tell: 'Make sure you are on main and pulled (`git switch main` then `git pull`). Your name is on the People page for good now.',
  },

  /* ---------------------------------------------------------------- */
  4: {
    ticket: 'STU-4',
    title: "Bjorn's merge conflict",
    setup(dir) {
      write(
        dir,
        'src/content/copy.ts',
        `/**\n * Words on the page, in one place. Edit copy here, not in components.\n */\nexport const peoplePage = {\n  title: 'People',\n  subtitle: 'Built from src/content/team.ts',\n}\n`,
      )
      edit(dir, 'src/components/chat/PeopleView.tsx', (t) => {
        t = replaceOnce(t, "import { newHire, team, type TeamMember } from '@/content/team'", "import { peoplePage } from '@/content/copy'\nimport { newHire, team, type TeamMember } from '@/content/team'", 'day 4 import')
        t = replaceOnce(t, '<h1 className="text-lg font-semibold">People</h1>', '<h1 className="text-lg font-semibold">{peoplePage.title}</h1>', 'day 4 title')
        t = t.replace(
          /<p className="text-sm text-muted-foreground">\s*Built from <code className="font-mono">src\/content\/team\.ts<\/code>\s*<\/p>/,
          '<p className="text-sm text-muted-foreground">{peoplePage.subtitle}</p>',
        )
        if (!t.includes('{peoplePage.subtitle}')) throw new Error('Setup could not find the People page subtitle (day 4)')
        return t
      })
      const base = commitAs(dir, 'gus', 'Move People page copy into one file', 50)
      edit(dir, 'src/content/copy.ts', (t) =>
        replaceOnce(
          t,
          "  title: 'People',\n  subtitle: 'Built from src/content/team.ts',",
          "  title: 'The Squad 🚀',\n  subtitle: 'Everyone who works here (and CI-3PO, who insists)',",
          'day 4 bjorn copy',
        ),
      )
      commitAs(dir, 'bjorn', 'Make the People page copy more fun', 20)
      git(['push', '--quiet', 'origin', '+HEAD:refs/heads/bjorn/people-page-copy'], { cwd: dir })
      git(['checkout', '--quiet', '--detach', base], { cwd: dir })
      return ['bjorn/people-page-copy']
    },
    check() {
      const out = []
      const tip = tryGit(['rev-parse', 'origin/bjorn/people-page-copy'])
      out.push(item("Bjorn's branch is merged into main", tip && isAncestor(tip, MAIN), tip ? '' : 'origin/bjorn/people-page-copy is missing'))
      const copy = show(MAIN, 'src/content/copy.ts') ?? ''
      const title = (copy.match(/title:\s*(['"`])(.*?)\1/) ?? [])[2] ?? ''
      const subtitle = (copy.match(/subtitle:\s*(['"`])(.*?)\1/) ?? [])[2] ?? ''
      out.push(item('Title is theirs ("Team"), not Bjorn\'s', /team/i.test(title) && !/squad/i.test(title), `title: "${title}"`))
      out.push(item("Subtitle is Bjorn's (Priya loved it)", /CI-3PO/.test(subtitle), `subtitle: "${subtitle}"`))
      const markers = tryGit(['grep', '-n', '-E', '^(<<<<<<<|>>>>>>>|=======$)', MAIN, '--', 'src']) ?? ''
      out.push(item('No conflict markers left anywhere', !markers, markers.split('\n').slice(0, 3).join(' | ')))
      out.push(courtItems(sinceSetup(4)))
      out.push(usedPullRequests(3))
      out.push(mainUntouched())
      out.push(...checksPass(MAIN, 'main'))
      return out
    },
    hints: [
      'The conflict happens when they merge Bjorn\'s branch into theirs: `git merge origin/bjorn/people-page-copy`. That is the point. Don\'t panic.',
      '`git status` lists the conflicted file. Open it: everything between <<<<<<< and ======= is theirs, between ======= and >>>>>>> is Bjorn\'s. They need their title and Bjorn\'s subtitle, then delete all three marker lines.',
      'After editing: `git add src/content/copy.ts`, then `git commit` (no -m needed: git pre-writes the merge message), then `git push`, then open and merge the PR.',
    ],
    tell: 'Run `git switch main` then `git pull`. You beat the boss. Bjorn would like a word.',
  },

  /* ---------------------------------------------------------------- */
  5: {
    ticket: 'STU-5',
    title: 'Ship one fix from a half-done branch',
    setup(dir) {
      edit(dir, 'src/content/copy.ts', (t) => {
        const next = t.replace(/(export const peoplePage = \{[\s\S]*?)(\n\})/, "$1\n  footer: 'New faces every quater. Say hi in #general!',$2")
        if (next === t) throw new Error('Setup could not find peoplePage in copy.ts (day 5)')
        return next
      })
      edit(dir, 'src/components/chat/PeopleView.tsx', (t) => {
        const anchor = '      </div>\n    </div>\n  )\n}'
        return replaceOnce(t, anchor, '      </div>\n      <p className="border-t px-6 py-3 text-sm text-muted-foreground">{peoplePage.footer}</p>\n    </div>\n  )\n}', 'day 5 footer view')
      })
      const base = commitAs(dir, 'priya', 'Add a footer note to the People page', 70)
      edit(dir, 'src/components/chat/Sidebar.tsx', (t) =>
        replaceOnce(t, '<div className="border-b border-sidebar-border px-5 py-4">', '<div className="border-b border-sidebar-border bg-[#ff3cac] px-5 py-4">', 'day 5 wip 1'),
      )
      commitAs(dir, 'bjorn', 'WIP try a gradient header', 50)
      edit(dir, 'src/content/copy.ts', (t) => replaceOnce(t, 'every quater.', 'every quarter.', 'day 5 typo fix'))
      commitAs(dir, 'bjorn', 'Fix quarter typo in the People footer', 40)
      edit(dir, 'src/components/chat/Sidebar.tsx', (t) =>
        replaceOnce(t, 'text-lg font-bold text-sidebar-accent-foreground', 'text-[22px] font-bold text-sidebar-accent-foreground', 'day 5 wip 2'),
      )
      commitAs(dir, 'bjorn', 'WIP more header experiments', 30)
      git(['push', '--quiet', 'origin', '+HEAD:refs/heads/bjorn/header-redesign'], { cwd: dir })
      git(['checkout', '--quiet', '--detach', base], { cwd: dir })
      return ['bjorn/header-redesign']
    },
    check() {
      const out = []
      const copy = show(MAIN, 'src/content/copy.ts') ?? ''
      out.push(item('The typo is fixed on main ("quarter")', copy.includes('quarter') && !copy.includes('quater')))
      const side = show(MAIN, 'src/components/chat/Sidebar.tsx') ?? ''
      out.push(item("None of Bjorn's WIP header work reached main", !side.includes('#ff3cac') && !side.includes('text-[22px]')))
      const fix = findCastCommit('Fix quarter typo in the People footer', 'origin/bjorn/header-redesign')
      const hot = latestBranch('hotfix/')
      out.push(item('A hotfix/… branch is on GitHub', !!hot, hot ? `origin/${hot}` : ''))
      if (fix && hot) {
        const theirs = commits(`${findCastCommit('Add a footer note to the People page')?.hash ?? MAIN}..origin/${hot}`)
        const picked = theirs.some((c) => c.subject === fix.subject || c.body.includes(fix.hash.slice(0, 7)))
        out.push(item("They cherry-picked Bjorn's fix (not retyped it)", picked, picked ? '' : 'The fix is there but not as a cherry-pick. Worth a teaching moment.', 'warn'))
        const files = [...new Set(theirs.filter((c) => c.parents.length < 2 && !c.email.endsWith(STUDIO_DOMAIN) || c.subject === fix.subject).flatMap((c) => (tryGit(['show', '--format=', '--name-only', c.hash]) ?? '').split('\n').filter(Boolean)))]
        out.push(item('The hotfix touches only copy.ts', files.length === 1 && files[0] === 'src/content/copy.ts', files.join(', '), 'warn'))
      }
      out.push(usedPullRequests(4))
      out.push(mainUntouched())
      out.push(...checksPass(MAIN, 'main'))
      return out
    },
    hints: [
      'Step one is saving their in-progress edit without committing it: `git stash`. Then `git switch main && git pull`.',
      'Find Bjorn\'s fix: `git log --oneline origin/bjorn/header-redesign`. They want the commit that fixes the typo, nothing else.',
      '`git switch -c hotfix/people-footer-typo`, then `git cherry-pick <hash>`, then `git push -u origin hotfix/people-footer-typo`, then PR and merge. Afterwards `git stash pop` brings their edit back.',
    ],
    tell: 'Run `git switch main` then `git pull`. Priya is relieved. Loudly.',
  },

  /* ---------------------------------------------------------------- */
  6: {
    ticket: 'STU-6',
    title: 'Build a component with AI',
    setup(dir) {
      edit(dir, 'src/content/team.ts', (t) => {
        t = replaceOnce(t, '  pronouns?: string\n}', "  pronouns?: string\n  /** Optional. Where they're at right now. */\n  presence?: 'available' | 'busy' | 'away'\n}", 'day 6 presence type')
        const P = { 'Product Manager': 'busy', 'Senior Engineer': 'busy', 'Design System Lead': 'available', 'Engineering Intern': 'available', 'Build Bot': 'away' }
        for (const [title, p] of Object.entries(P)) {
          t = t.replace(new RegExp(`(    title: '${title}',\\n(?:    pronouns: [^\\n]*\\n)?)`), `$1    presence: '${p}',\n`)
        }
        return t
      })
      commitAs(dir, 'priya', 'Add presence to the team directory', 20)
      return []
    },
    check() {
      const out = []
      const found = tryGit(['grep', '-l', '-E', 'export (function|const) StatusPill', MAIN, '--', 'src']) ?? ''
      out.push(item('A StatusPill component exists on main', !!found, found.replace(/^origin\/main:/gm, '')))
      const people = show(MAIN, 'src/components/chat/PeopleView.tsx') ?? ''
      out.push(item('The People page uses StatusPill', people.includes('StatusPill')))
      const file = found.split('\n')[0]?.replace(/^origin\/main:/, '')
      const src = file ? show(MAIN, file) ?? '' : ''
      out.push(item('It handles all three presences', ['available', 'busy', 'away'].every((p) => src.includes(p)), '', 'warn'))
      out.push(item('It uses variants (cva), like the other ui components', src.includes('cva('), '', 'warn'))
      out.push(courtItems(sinceSetup(6)))
      out.push(usedPullRequests(5))
      out.push(mainUntouched())
      out.push(...checksPass(MAIN, 'main'))
      return out
    },
    hints: [
      'This is the AI day: they should ask YOU to draft the component. Draft it, but make them read it and run `npm run dot` before committing.',
      'A good prompt names the file (src/components/ui/status-pill.tsx), the pattern to copy (badge.tsx, cva variants), the tokens to use (success, warning, muted), and the rule (no hex, no inline styles).',
      'Then: use it in PeopleView next to each title: `{person.presence && <StatusPill presence={person.presence} />}`. Branch, commit in small steps, PR, merge.',
    ],
    tell: 'Run `git switch main` then `git pull`. Dotty ran her audit. Twice.',
  },

  /* ---------------------------------------------------------------- */
  7: {
    ticket: 'STU-7',
    title: 'Review the AI pull request',
    setup(dir) {
      const base = git(['rev-parse', 'HEAD'], { cwd: dir })
      write(
        dir,
        'src/components/chat/UnreadBadge.tsx',
        `// Generated with AI. Looks great on my screen!! 🚀 (Bjorn)
export function UnreadBadge({ count, onClick }: { count: number; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="ml-auto rounded-full bg-[#ef4444] px-[6px] text-white"
      style={{ fontSize: 11, lineHeight: '18px' }}
    >
      {count}
    </div>
  )
}
`,
      )
      edit(dir, 'src/components/chat/Sidebar.tsx', (t) => {
        t = replaceOnce(t, "import { CastAvatar } from './CastAvatar'", "import { CastAvatar } from './CastAvatar'\nimport { UnreadBadge } from './UnreadBadge'", 'day 7 import')
        const before = t
        t = t.split('{n > 0 && <Badge variant="sidebar">{n}</Badge>}').join('<UnreadBadge count={n} />')
        if (t === before) throw new Error('Setup could not find the unread badges in Sidebar (day 7)')
        return t
      })
      commitAs(dir, 'ai', 'Add UnreadBadge component', 15)
      git(['push', '--quiet', 'origin', '+HEAD:refs/heads/ai/unread-badge'], { cwd: dir })
      git(['checkout', '--quiet', '--detach', base], { cwd: dir })
      return ['ai/unread-badge']
    },
    check() {
      const out = []
      const tip = tryGit(['rev-parse', 'origin/ai/unread-badge'])
      out.push(item('The AI branch was reviewed and merged', tip && isAncestor(tip, MAIN)))
      const badge = show(MAIN, 'src/components/chat/UnreadBadge.tsx')
      const side = show(MAIN, 'src/components/chat/Sidebar.tsx') ?? ''
      if (badge === null) {
        out.push(item('UnreadBadge was replaced (they deleted it)', !side.includes('UnreadBadge'), 'Deleting it and using Badge is a valid review outcome.', 'info'))
      } else {
        out.push(item('No hex colors', !/#[0-9a-fA-F]{3,8}/.test(badge)))
        out.push(item('No inline styles', !/style=\{\{/.test(badge)))
        out.push(item('No arbitrary pixel values', !/-\[\d+px\]/.test(badge)))
        out.push(item('No palette colors like text-white', !/\b(text|bg)-(white|black)\b/.test(badge), '', 'warn'))
        out.push(item('Clickable thing is a real button (or not clickable at all)', !/<div[^>]*onClick/s.test(badge)))
        out.push(item('Screen readers get a label ("3 unread messages")', /aria-label|sr-only/.test(badge)))
        out.push(item('Zero unread shows nothing', /count\s*(===|<=|<)\s*[01]\b|!count\b|count\s*>\s*0/.test(badge + side)))
      }
      out.push(usedPullRequests(6))
      out.push(mainUntouched())
      out.push(...checksPass(MAIN, 'main'))
      return out
    },
    hints: [
      '`git switch ai/unread-badge`, then `npm run dot`. Dotty\'s audit finds some issues. Not all of them.',
      'Seven problems: hex color, arbitrary px, inline style, text-white, a clickable div, no screen-reader label, and it shows "0". The last three need human eyes.',
      'Simplest good fix: render nothing when count is 0, use the existing Badge (variant sidebar), and add aria-label={`${count} unread messages`}. Commit, push, PR, merge.',
    ],
    tell: 'Run `git switch main` then `git pull`. Gus read your review comments. He has feelings about them. Good ones.',
  },

  /* ---------------------------------------------------------------- */
  8: {
    ticket: 'STU-8',
    title: 'Friday outage',
    setup(dir) {
      edit(dir, 'src/styles/tokens.css', (t) => {
        t = t.replace(/  --primary: oklch\([^)]*\);/, '  --primary: oklch(0.68 0.22 40);')
        t = t.replace(/  --background: oklch\([^)]*\);/, '  --background: oklch(0.94 0.06 340);')
        t = t.replace(/  --sidebar: oklch\([^)]*\);/, '  --sidebar: oklch(0.42 0.16 145);')
        return t
      })
      commitAs(dir, 'bjorn', 'Make the app more fun for Friday', 40)
      edit(dir, 'README.md', (t) => `${t.trimEnd()}\n\n## Before you deploy\n\n1. \`npm run check\` passes.\n2. Someone other than you has looked at it.\n3. It is not 4:55 PM on a Friday.\n`)
      commitAs(dir, 'gus', 'Add a deploy checklist to the README', 20)
      return []
    },
    check() {
      const out = []
      const bad = findCastCommit('Make the app more fun for Friday')
      const gus = findCastCommit('Add a deploy checklist to the README')
      if (!bad || !gus) {
        const recorded = /Record STU-7 review: pass/.test(tryGit(['log', '--format=%s', MAIN]) ?? '')
        return [
          recorded
            ? item(
                "History wasn't rewritten (no reset + force push)",
                false,
                "Bjorn's and Gus's Day 8 commits are gone from main: someone reset and force-pushed. That erased Gus's work too. Recover with `git reflog` (find the old main), push it back, then revert properly.",
              )
            : item('Day 8 setup found', false, 'Run `npm run coach -- setup 8`'),
        ]
      }
      out.push(item("History wasn't rewritten (no reset + force push)", isAncestor(bad.hash, MAIN) && isAncestor(gus.hash, MAIN)))
      const before = show(`${bad.hash}~1`, 'src/styles/tokens.css')
      const now = show(MAIN, 'src/styles/tokens.css')
      out.push(item("tokens.css is back to how it was before Bjorn's commit", before === now))
      const readme = show(MAIN, 'README.md') ?? ''
      out.push(item("Gus's later commit survived", readme.includes('## Before you deploy')))
      const reverted = commits(`${gus.hash}..${MAIN}`).some((c) => c.subject.startsWith('Revert "Make the app more fun') || c.body.includes(`reverts commit ${bad.hash}`))
      out.push(item('They used git revert', reverted, reverted ? '' : 'Fixed by hand instead of reverting. Teaching moment.', 'warn'))
      out.push(usedPullRequests(7))
      out.push(mainUntouched())
      out.push(...checksPass(MAIN, 'main'))
      return out
    },
    hints: [
      'First, find the bad commit: `git log --oneline -- src/styles/tokens.css`.',
      'Do NOT reset main. Gus pushed after Bjorn. `git revert <hash>` makes a new commit that undoes just that one.',
      '`git switch -c revert/friday-theme`, `git revert <hash>` (save the pre-written message), `git push -u origin revert/friday-theme`, then PR and merge.',
    ],
    tell: 'Run `git switch main` then `git pull`. The colors are back. CI-3PO has stopped screaming.',
  },

  /* ---------------------------------------------------------------- */
  9: {
    ticket: 'STU-9',
    title: 'Ship the Kudos page',
    setup() {
      return []
    },
    check() {
      const out = []
      const kudos = show(MAIN, 'src/content/kudos.ts')
      out.push(item('src/content/kudos.ts exists on main', kudos !== null))
      if (kudos) {
        const n = (kudos.match(/message\s*:/g) ?? []).length
        out.push(item('At least 3 kudos', n >= 3, `${n} found`))
        out.push(item('One of them is for Bjorn', /to\s*:\s*['"`]bjorn/.test(kudos), '', 'warn'))
      }
      const users = (tryGit(['grep', '-l', 'content/kudos', MAIN, '--', 'src']) ?? '').split('\n').filter(Boolean)
      out.push(item('A page/component reads the kudos', users.length > 0, users.map((u) => u.replace(/^origin\/main:/, '')).join(', ')))
      const side = show(MAIN, 'src/components/chat/Sidebar.tsx') ?? ''
      out.push(item('There is a way to get to it from the sidebar', /kudos/i.test(side)))
      const since = sinceSetup(9).filter((c) => !c.email.endsWith(STUDIO_DOMAIN) && c.parents.length < 2 && !isGeneratedSubject(c.subject))
      out.push(item('Built in at least 2 focused commits', since.length >= 2, `${since.length} commits`))
      out.push(courtItems(sinceSetup(9)))
      out.push(usedPullRequests(8))
      out.push(mainUntouched())
      out.push(...checksPass(MAIN, 'main'))
      return out
    },
    hints: [
      'Break it down: data file first (src/content/kudos.ts), then the page component, then the sidebar link and nav. One commit each.',
      'Copy the pattern of PeopleView for the page, and of the People button in Sidebar for the link. nav.tsx needs a new view type.',
      'They can ask you (AI) to draft pieces, but they review and commit each one. Branch: feature/kudos-page. Then PR, merge, pull.',
    ],
    tell: 'Run `git switch main` then `git pull`. Then go read #general. All of it.',
  },
}

export const LAST_DAY = 9
