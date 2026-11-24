/**
 * THE STUDIO — GIT DICTIONARY
 *
 * Plain-language meanings for every word that shows up in a git command.
 * Powers the hover definitions on commands and the Git dictionary page.
 * Add new terms here as later days introduce them.
 */

export type TermKind = 'tool' | 'command' | 'option' | 'name' | 'placeholder'

export interface Term {
  /** How the word looks in a command, e.g. "switch" or "-c". */
  term: string
  kind: TermKind
  /** One line: what it means. */
  short: string
  /** Optional design analogy or extra context. */
  more?: string
  /** Example command using it. */
  example?: string
}

export const KIND_LABEL: Record<TermKind, string> = {
  tool: 'Program',
  command: 'Command',
  option: 'Option',
  name: 'Name',
  placeholder: 'Your value',
}

const T = (term: string, kind: TermKind, short: string, more?: string, example?: string): Term => ({
  term,
  kind,
  short,
  more,
  example,
})

/** Programs and git commands, keyed by the word itself. */
export const COMMANDS: Record<string, Term> = {
  git: T('git', 'tool', 'The program that tracks versions of your project. Every git command starts with it.', 'Think of it as version history for the whole codebase.'),
  cd: T('cd', 'tool', '"Change directory." Moves you into a folder.', 'Like double-clicking a folder in Finder.', 'cd the-studio'),
  ls: T('ls', 'tool', '"List." Shows the files in the folder you are in.', undefined, 'ls'),
  edit: T('edit', 'tool', 'Practice terminal only: pretends to open a file and make your change. For real, you edit in your code editor.'),
  pwd: T('pwd', 'tool', '"Print working directory." Tells you which folder you are in.'),
  clone: T('clone', 'command', 'Download a full copy of a project from GitHub, history and all.', 'Like duplicating a shared Figma file into your drafts: same content, same history, now on your laptop.', 'git clone <url>'),
  status: T('status', 'command', 'Shows which branch you are on and what has changed since the last commit.', 'Your "what did I touch?" check. Safe to run anytime.', 'git status'),
  switch: T('switch', 'command', 'Move to a different branch.', 'Like jumping to another page in a Figma file.', 'git switch main'),
  checkout: T('checkout', 'command', 'The older way to switch branches. Same idea as switch, with more jobs crammed in.', undefined, 'git checkout -b my-branch'),
  branch: T('branch', 'command', 'Lists your branches, or creates one if you give it a name.', 'A branch is a duplicate page where you can explore without touching main.', 'git branch'),
  add: T('add', 'command', 'Choose which changed files go into your next commit ("staging").', 'Like selecting the frames you want before you export.', 'git add src/content/team.ts'),
  commit: T('commit', 'command', 'Save a snapshot of your staged changes, with a message describing them.', 'A named version in version history. It only exists on your laptop until you push.', 'git commit -m "Add header search"'),
  push: T('push', 'command', 'Upload your new commits to GitHub so the team can see them.', 'Publishing your versions to the shared library.', 'git push -u origin my-branch'),
  pull: T('pull', 'command', 'Download new commits from GitHub and add them to your branch.', 'Updating your copy with everyone else\'s latest changes.', 'git pull'),
  log: T('log', 'command', 'Shows the list of commits, newest first.', 'Scrolling the version history panel.', 'git log --oneline'),
  diff: T('diff', 'command', 'Shows exactly which lines changed.', 'Like a before/after comparison of a frame.', 'git diff'),
  blame: T('blame', 'command', 'Shows who last changed each line, and in which commit.', 'Less about blame, more about "who do I ask?"'),
}

/**
 * Options mean different things after different commands, so look them up
 * as "command option" first, then fall back to the bare option.
 */
export const OPTIONS: Record<string, Term> = {
  'switch -c': T('-c', 'option', '"Create." Make a new branch with this name, then switch to it.', 'Duplicate the page and jump straight into the copy.', 'git switch -c explore/new-header'),
  'checkout -b': T('-b', 'option', '"Branch." Make a new branch with this name, then switch to it. Same as switch -c.'),
  'commit -m': T('-m', 'option', '"Message." The words in quotes after it become the commit message.', 'Without -m, git opens a text editor and asks for one.', 'git commit -m "Add Sam to the team directory"'),
  'commit --amend': T('--amend', 'option', 'Replace your last commit instead of making a new one. Handy for fixing a typo in the message.', 'Only do this before you push.'),
  'push -u': T('-u', 'option', '"Upstream." Remembers where this branch lives on GitHub, so next time plain git push is enough.', 'You only need it the first time you push a branch.', 'git push -u origin my-branch'),
  'log --oneline': T('--oneline', 'option', 'Show each commit on a single short line.'),
  '-m': T('-m', 'option', '"Message." Usually the text in quotes after it.'),
  '-u': T('-u', 'option', '"Upstream." Links your branch to its copy on GitHub.'),
  '-c': T('-c', 'option', '"Create." Usually: make something new with this name.'),
  '-b': T('-b', 'option', '"Branch." Make a new branch.'),
}

/** Names that have a fixed meaning. */
export const NAMES: Record<string, Term> = {
  origin: T('origin', 'name', 'The nickname for the GitHub copy of the project you cloned from.', 'Your laptop is local; origin is the shared copy in the cloud.'),
  main: T('main', 'name', 'The main branch: the trusted version everyone builds on.', 'The published library. Nobody edits it directly.'),
  HEAD: T('HEAD', 'name', 'Where you are right now: the latest commit on your current branch.'),
}

/** Words you fill in yourself. Matched by shape, not spelling. */
export const PLACEHOLDERS = {
  branchName: T('branch name', 'placeholder', 'A name you choose for the branch. Teams often use a folder style: kind/short-description.', undefined, 'onboarding/add-sam'),
  message: T('"message"', 'placeholder', 'Your commit message, in quotes. Short, specific, command form: "Add…", "Fix…", "Remove…".'),
  file: T('file path', 'placeholder', 'The file you mean, written as its path from the project folder.', undefined, 'src/content/team.ts'),
  url: T('repo URL', 'placeholder', 'The web address of the project on GitHub. Copy it from the green Code button.'),
  folder: T('folder', 'placeholder', 'The name of a folder to move into.'),
}

export interface Part {
  text: string
  term?: Term
}

/** Split a command into words, keeping "quoted strings" together. */
function words(command: string) {
  return command.match(/"[^"]*"|'[^']*'|\S+/g) ?? []
}

const BRANCH_COMMANDS = new Set(['switch', 'checkout', 'branch', 'push', 'pull'])

/** Break a command into its words, each with its dictionary meaning (if any). */
export function explain(command: string): Part[] {
  const ws = words(command)
  const tool = ws[0]
  const sub = tool === 'git' ? ws[1] : undefined
  return ws.map((w, i) => {
    if (i === 0) return { text: w, term: COMMANDS[w] }
    if (tool === 'git' && i === 1) return { text: w, term: COMMANDS[w] }
    if (w.startsWith('-')) return { text: w, term: OPTIONS[`${sub} ${w}`] ?? OPTIONS[w] }
    if (/^["']/.test(w)) return { text: w, term: PLACEHOLDERS.message }
    if (w === '"..."') return { text: w, term: PLACEHOLDERS.message }
    if (NAMES[w]) return { text: w, term: NAMES[w] }
    if (/^https?:\/\//.test(w)) return { text: w, term: PLACEHOLDERS.url }
    if (tool === 'cd') return { text: w, term: PLACEHOLDERS.folder }
    if (sub === 'add' || /\.\w+$/.test(w)) return { text: w, term: PLACEHOLDERS.file }
    if (sub && BRANCH_COMMANDS.has(sub)) return { text: w, term: PLACEHOLDERS.branchName }
    return { text: w }
  })
}

/** Does this look like a command worth explaining? */
export function isCommand(text: string) {
  return /^(git|cd|ls|pwd)(\s|$)/.test(text.trim())
}

/** Everything, for the dictionary page. */
export const ALL_TERMS: Term[] = [
  ...Object.values(COMMANDS),
  ...Object.entries(OPTIONS)
    .filter(([key]) => key.includes(' '))
    .map(([key, t]) => ({ ...t, term: key })),
  ...Object.values(NAMES),
  ...Object.values(PLACEHOLDERS),
]
