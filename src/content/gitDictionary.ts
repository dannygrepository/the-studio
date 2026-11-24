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
  show: T('show', 'command', 'Shows one commit in full: who, when, the message, and exactly what changed.', 'Clicking one version in version history.', 'git show 9f2b6a1'),
  merge: T('merge', 'command', "Brings another branch's commits into the branch you're on.", 'Like accepting changes from a duplicate page back into this one.', 'git merge main'),
  stash: T('stash', 'command', 'Parks your unsaved changes in a drawer so you get a clean slate. `git stash pop` brings them back.', 'Like hiding a layer group while you work on something else.', 'git stash'),
  'cherry-pick': T('cherry-pick', 'command', 'Copies one commit from anywhere onto the branch you are on.', 'Copying a single finished layer out of a messy exploration file.', 'git cherry-pick 5be93d7'),
  rebase: T('rebase', 'command', 'Replays your commits on top of a newer base, as if you started there. Rewrites your commits, so only on branches nobody else uses.', 'Rebuilding your frames on the updated library instead of the old one.', 'git rebase main'),
  revert: T('revert', 'command', 'Makes a new commit that undoes an old one. Nothing is erased; history gets an "undo" entry.', 'The safe undo for anything already shared.', 'git revert f1d4c07'),
  reset: T('reset', 'command', 'Moves your branch back to an earlier commit. With --hard it also throws away changes. Only for work nobody else has.', 'Deleting versions from history. Dangerous on shared branches.', 'git reset --soft HEAD~1'),
  restore: T('restore', 'command', 'Throws away unsaved changes to a file, back to the last commit.', '"Revert to saved" for one file.', 'git restore src/styles/tokens.css'),
  fetch: T('fetch', 'command', "Downloads new commits and branches from GitHub without changing your files.", 'Checking for updates without applying them.', 'git fetch'),
  npm: T('npm', 'tool', "Runs the project's scripts. In The Studio: `npm run dev` (the app), `npm run dot` (Dotty's audit), `npm run check` (types + audit)."),
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
  'branch -d': T('-d', 'option', '"Delete." Removes a branch that is already merged. Git refuses if it isn\'t, so you can\'t lose work by accident.', undefined, 'git branch -d fix/button-color'),
  'merge --abort': T('--abort', 'option', 'Gives up on a merge in progress and puts everything back how it was. The escape hatch.'),
  'commit --no-edit': T('--no-edit', 'option', 'Use the message git already wrote (for merges and reverts) instead of opening an editor.'),
  'revert --no-edit': T('--no-edit', 'option', 'Keep git\'s pre-written "Revert …" message without opening an editor.'),
  'reset --hard': T('--hard', 'option', 'Also throws away all uncommitted changes. There is no undo. Only on your own unshared work.'),
  'reset --soft': T('--soft', 'option', 'Moves back but keeps your changes staged, so you can recommit them.'),
  'push --force': T('--force', 'option', 'Overwrites the branch on GitHub with yours, even if it erases other people\'s commits. Never on main.'),
  'cherry-pick -x': T('-x', 'option', 'Adds "(cherry picked from commit …)" to the message, so history shows where it came from.'),
  'diff --name-only': T('--name-only', 'option', 'List only the names of changed files, not the changes.'),
  'add -p': T('-p', 'option', '"Patch." Walks you through each change in a file so you can stage only some of them.'),
  'stash pop': T('pop', 'name', 'Takes the newest stash out of the drawer and puts the changes back in your files.'),
  'stash list': T('list', 'name', 'Shows everything in the stash drawer.'),
  '--': T('--', 'option', 'Means "what follows are file names." `git log -- <file>` shows only commits that touched that file.'),
  '-f': T('-f', 'option', '"Force." Usually means "do it even though git is warning you." Be careful.'),
}

/** Names that have a fixed meaning. */
export const NAMES: Record<string, Term> = {
  origin: T('origin', 'name', 'The nickname for the GitHub copy of the project you cloned from.', 'Your laptop is local; origin is the shared copy in the cloud.'),
  main: T('main', 'name', 'The main branch: the trusted version everyone builds on.', 'The published library. Nobody edits it directly.'),
  HEAD: T('HEAD', 'name', 'Where you are right now: the latest commit on your current branch.'),
  'HEAD~1': T('HEAD~1', 'name', 'One commit before where you are now. HEAD~2 is two before, and so on.'),
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

const BRANCH_COMMANDS = new Set(['switch', 'checkout', 'branch', 'push', 'pull', 'merge', 'rebase'])
const HASH_COMMANDS = new Set(['show', 'revert', 'cherry-pick', 'reset'])

const HASH = T('commit hash', 'placeholder', 'The ID of a commit. The first 7 characters are enough. Copy it from `git log --oneline`.', undefined, '9f2b6a1')

/** Break a command into its words, each with its dictionary meaning (if any). */
export function explain(command: string): Part[] {
  const ws = words(command)
  const tool = ws[0]
  const sub = tool === 'git' ? ws[1] : undefined
  return ws.map((w, i) => {
    if (i === 0) return { text: w, term: COMMANDS[w] }
    if (tool === 'git' && i === 1) return { text: w, term: COMMANDS[w] }
    if (w.startsWith('-')) return { text: w, term: OPTIONS[`${sub} ${w}`] ?? OPTIONS[w] }
    if (OPTIONS[`${sub} ${w}`]) return { text: w, term: OPTIONS[`${sub} ${w}`] }
    if (sub && HASH_COMMANDS.has(sub) && /^[0-9a-f]{7,40}$|^<.*hash.*>$/.test(w)) return { text: w, term: HASH }
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
  return /^(git|cd|ls|pwd|npm run)(\s|$)/.test(text.trim())
}

/** Everything, for the dictionary page. */
export const ALL_TERMS: Term[] = [
  ...Object.values(COMMANDS),
  ...Object.entries(OPTIONS)
    .filter(([key]) => key.includes(' '))
    .map(([key, t]) => ({ ...t, term: key })),
  ...Object.values(NAMES),
  ...Object.values(PLACEHOLDERS),
  HASH,
]
