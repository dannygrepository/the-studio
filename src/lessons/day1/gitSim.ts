/**
 * A pretend git, just smart enough to practice Day 1 safely.
 * Nothing here touches your real repo.
 */
import { judgeCommit } from '../commitJudge'

export const REMOTE_URL = 'https://github.com/the-studio/the-studio.git'
const FILE = 'src/content/team.ts'

export interface SimState {
  cloned: boolean
  cwd: '~' | '~/the-studio'
  branch: string
  branches: string[]
  modified: boolean
  staged: boolean
  commits: { hash: string; branch: string; message: string }[]
  pushed: Record<string, boolean>
  upstream: Record<string, boolean>
  goodCommit: boolean
}

export const INITIAL: SimState = {
  cloned: false,
  cwd: '~',
  branch: 'main',
  branches: ['main'],
  modified: false,
  staged: false,
  commits: [
    { hash: 'a1f9c02', branch: 'main', message: 'Set up the chat app shell' },
    { hash: '7be3d10', branch: 'main', message: 'Add design tokens' },
  ],
  pushed: { main: true },
  upstream: { main: true },
  goodCommit: false,
}

import { createElement } from 'react'
import type { Goal, Line, Sim } from '../sim'
export type { Line }

function hash() {
  return Math.random().toString(16).slice(2, 9)
}

/** Split a command line, respecting "double" and 'single' quotes. */
function tokenize(input: string): string[] {
  const out: string[] = []
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g
  let m
  while ((m = re.exec(input))) out.push(m[1] ?? m[2] ?? m[3])
  return out
}

export function run(state: SimState, input: string): { state: SimState; lines: Line[] } {
  const s: SimState = structuredClone(state)
  const t = tokenize(input.trim())
  const L = (kind: Line['kind'], text: string): Line => ({ kind, text })
  const inRepo = s.cwd === '~/the-studio'
  const notRepo = { state: s, lines: [L('err', 'fatal: not a git repository (or any of the parent directories): .git'), L('muted', 'Tip: you need to `cd` into the project folder first.')] }

  if (!t.length) return { state: s, lines: [] }
  const [cmd, sub, ...rest] = t

  if (cmd === 'help') {
    return {
      state: s,
      lines: [
        L('muted', 'Try: git clone, cd, ls, git status, git switch -c, git checkout -b, git branch,'),
        L('muted', 'edit src/content/team.ts, git add, git commit -m "...", git commit --amend -m "...",'),
        L('muted', 'git log --oneline, git push -u origin <branch>, clear'),
      ],
    }
  }

  if (cmd === 'ls') {
    if (!inRepo) return { state: s, lines: [L('out', s.cloned ? 'the-studio/' : '(empty)')] }
    return { state: s, lines: [L('out', 'README.md  CHEATSHEET.md  game/  package.json  src/')] }
  }

  if (cmd === 'pwd') return { state: s, lines: [L('out', s.cwd)] }

  if (cmd === 'cd') {
    const dir = (sub ?? '').replace(/\/$/, '')
    if (dir === 'the-studio' && s.cwd === '~') {
      if (!s.cloned) return { state: s, lines: [L('err', 'cd: no such file or directory: the-studio')] }
      s.cwd = '~/the-studio'
      return { state: s, lines: [] }
    }
    if ((dir === '..' || dir === '~' || dir === '') && inRepo) {
      s.cwd = '~'
      return { state: s, lines: [] }
    }
    return { state: s, lines: [L('err', `cd: no such file or directory: ${dir}`)] }
  }

  if (['edit', 'code', 'nano', 'vim', 'open'].includes(cmd)) {
    if (!inRepo) return { state: s, lines: [L('err', `${cmd}: no such file: ${sub ?? ''}`)] }
    if (!sub || !FILE.endsWith(sub.replace(/^\.\//, ''))) {
      return { state: s, lines: [L('err', `Try: edit ${FILE}`)] }
    }
    s.modified = true
    s.staged = false
    return {
      state: s,
      lines: [L('ok', `✎ Opened ${FILE}, added your entry, saved. (Pretend-edited. Your real edit comes in the ticket.)`)],
    }
  }

  if (cmd !== 'git') {
    return { state: s, lines: [L('err', `command not found: ${cmd}`), L('muted', 'Type `help` to see what this practice terminal understands.')] }
  }

  switch (sub) {
    case 'clone': {
      const url = rest[0]
      if (!url) return { state: s, lines: [L('err', 'fatal: You must specify a repository to clone.')] }
      if (url !== REMOTE_URL && url !== REMOTE_URL.replace(/\.git$/, '')) {
        return { state: s, lines: [L('err', `fatal: repository '${url}' not found`), L('muted', `Psst: the URL is ${REMOTE_URL}`)] }
      }
      if (inRepo) return { state: s, lines: [L('muted', 'You are already inside the repo. `cd ..` first if you really want another copy.')] }
      if (s.cloned) return { state: s, lines: [L('err', "fatal: destination path 'the-studio' already exists and is not an empty directory.")] }
      s.cloned = true
      return {
        state: s,
        lines: [
          L('out', "Cloning into 'the-studio'..."),
          L('out', 'remote: Enumerating objects: 128, done.'),
          L('out', 'Receiving objects: 100% (128/128), done.'),
          L('ok', '✓ You now have your own full copy of the project, history included.'),
        ],
      }
    }

    case 'status': {
      if (!inRepo) return notRepo
      const lines = [L('out', `On branch ${s.branch}`)]
      if (s.staged) {
        lines.push(L('out', 'Changes to be committed:'), L('ok', `        modified:   ${FILE}`))
      } else if (s.modified) {
        lines.push(L('out', 'Changes not staged for commit:'), L('err', `        modified:   ${FILE}`), L('muted', '  (use "git add <file>..." to stage it)'))
      } else {
        lines.push(L('out', 'nothing to commit, working tree clean'))
      }
      return { state: s, lines }
    }

    case 'branch': {
      if (!inRepo) return notRepo
      if (!rest[0]) return { state: s, lines: s.branches.map((b) => L(b === s.branch ? 'ok' : 'out', `${b === s.branch ? '* ' : '  '}${b}`)) }
      const name = rest[0]
      if (s.branches.includes(name)) return { state: s, lines: [L('err', `fatal: a branch named '${name}' already exists`)] }
      s.branches.push(name)
      return { state: s, lines: [L('muted', `Created ${name}, but you're still on ${s.branch}. Switch to it with \`git switch ${name}\`.`)] }
    }

    case 'checkout':
    case 'switch': {
      if (!inRepo) return notRepo
      const create = rest[0] === '-b' || rest[0] === '-c'
      const name = create ? rest[1] : rest[0]
      if (!name) return { state: s, lines: [L('err', `fatal: missing branch name`)] }
      if (create) {
        if (s.branches.includes(name)) return { state: s, lines: [L('err', `fatal: a branch named '${name}' already exists`)] }
        if (/\s/.test(name)) return { state: s, lines: [L('err', 'fatal: branch names cannot contain spaces')] }
        s.branches.push(name)
        s.branch = name
        return { state: s, lines: [L('ok', `Switched to a new branch '${name}'`)] }
      }
      if (!s.branches.includes(name)) return { state: s, lines: [L('err', `error: pathspec '${name}' did not match any branch. Did you mean \`git ${sub} ${sub === 'switch' ? '-c' : '-b'} ${name}\`?`)] }
      s.branch = name
      return { state: s, lines: [L('ok', `Switched to branch '${name}'`)] }
    }

    case 'add': {
      if (!inRepo) return notRepo
      if (!rest[0]) return { state: s, lines: [L('err', 'Nothing specified, nothing added.'), L('muted', 'Try `git add .` or `git add src/content/team.ts`')] }
      if (!s.modified) return { state: s, lines: [L('muted', '(nothing changed, so nothing to stage)')] }
      s.staged = true
      return { state: s, lines: [L('muted', `Staged ${FILE}. It's in the box, ready to be sealed with a commit.`)] }
    }

    case 'commit': {
      if (!inRepo) return notRepo
      const amend = rest.includes('--amend')
      const mIndex = rest.indexOf('-m')
      const message = mIndex >= 0 ? rest[mIndex + 1] : undefined
      if (mIndex < 0 || message === undefined) {
        return { state: s, lines: [L('err', 'This practice terminal needs a message inline: git commit -m "Your message"')] }
      }
      if (amend) {
        const last = [...s.commits].reverse().find((c) => c.branch === s.branch && c.branch !== 'main')
        if (!last) return { state: s, lines: [L('err', 'Nothing of yours to amend yet.')] }
        if (s.pushed[s.branch]) {
          return { state: s, lines: [L('gus', "Gus: You already pushed that. Amending rewrites history other people may have. Don't, for now.")] }
        }
        last.message = message
      } else {
        if (!s.staged) {
          return { state: s, lines: [L('out', `On branch ${s.branch}`), L('err', 'nothing added to commit (use "git add" to stage changes)')] }
        }
        if (s.branch === 'main') {
          return { state: s, lines: [L('gus', "Gus: Whoa. Not on main. Nobody commits straight to main. Not even me. Make a branch first.")] }
        }
        s.commits.push({ hash: hash(), branch: s.branch, message })
        s.modified = false
        s.staged = false
        s.pushed[s.branch] = false
      }
      const verdict = judgeCommit(message)
      const head = s.commits[s.commits.length - 1]
      const lines: Line[] = [L('out', `[${s.branch} ${head.hash}] ${message}`), L('out', ' 1 file changed, 6 insertions(+), 1 deletion(-)')]
      if (verdict.ok) {
        s.goodCommit = true
        lines.push(L('gus', 'Gus: ...Fine. That is a good commit message. Do not let it go to your head.'))
      } else {
        s.goodCommit = false
        const fail = verdict.verdicts.find((v) => !v.pass)!
        lines.push(L('gus', `Gus: ${fail.gus}`))
        lines.push(L('muted', 'Fix it before you push: git commit --amend -m "Better message"'))
      }
      return { state: s, lines }
    }

    case 'log': {
      if (!inRepo) return notRepo
      const mine = s.commits.filter((c) => c.branch === 'main' || c.branch === s.branch).reverse()
      return { state: s, lines: mine.map((c, i) => L(i === 0 ? 'ok' : 'out', `${c.hash} ${i === 0 ? `(HEAD -> ${s.branch}) ` : ''}${c.message}`)) }
    }

    case 'diff': {
      if (!inRepo) return notRepo
      if (!s.modified) return { state: s, lines: [L('muted', s.staged ? '(no unstaged changes; try git diff --staged)' : '(no changes)')] }
      return { state: s, lines: [L('err', '-export const newHire: TeamMember | null = null'), L('ok', '+export const newHire: TeamMember | null = {'), L('ok', "+  name: 'You',"), L('ok', '+  ...'), L('ok', '+}')] }
    }

    case 'push': {
      if (!inRepo) return notRepo
      const setUp = rest.includes('-u') || rest.includes('--set-upstream')
      const args = rest.filter((a) => !a.startsWith('-'))
      const [remote, target] = args
      if (!remote && !s.upstream[s.branch]) {
        return {
          state: s,
          lines: [
            L('err', `fatal: The current branch ${s.branch} has no upstream branch.`),
            L('err', 'To push the current branch and set the remote as upstream, use'),
            L('out', `    git push --set-upstream origin ${s.branch}`),
            L('muted', '(Same thing, shorter: git push -u origin ' + s.branch + ')'),
          ],
        }
      }
      if (remote && remote !== 'origin') return { state: s, lines: [L('err', `fatal: '${remote}' does not appear to be a git repository`)] }
      const branch = target ?? s.branch
      if (!s.branches.includes(branch)) return { state: s, lines: [L('err', `error: src refspec ${branch} does not match any`)] }
      if (branch === 'main') return { state: s, lines: [L('gus', 'Gus: Pushing main? Nothing new on it, and you should not be committing there anyway. Push your branch.')] }
      if (!s.commits.some((c) => c.branch === branch)) return { state: s, lines: [L('muted', 'Everything up-to-date (you have no commits on this branch yet)')] }
      s.pushed[branch] = true
      if (setUp) s.upstream[branch] = true
      return {
        state: s,
        lines: [
          L('out', 'Enumerating objects: 7, done.'),
          L('out', `To ${REMOTE_URL}`),
          L('out', ` * [new branch]      ${branch} -> ${branch}`),
          ...(setUp ? [L('out', `branch '${branch}' set up to track 'origin/${branch}'.`)] : []),
          L('ok', '✓ Your branch is on GitHub now. The team can see it.'),
        ],
      }
    }

    default:
      return { state: s, lines: [L('err', `git: '${sub ?? ''}' is not a git command in this practice terminal. Type \`help\`.`)] }
  }
}

export const GOALS: Goal<SimState>[] = [
  { id: 'clone', label: 'Clone the repo', hint: `git clone ${REMOTE_URL}`, done: (s) => s.cloned },
  { id: 'cd', label: 'Move into the project folder', hint: 'cd the-studio', done: (s) => s.cwd === '~/the-studio' },
  { id: 'branch', label: 'Create and switch to a branch (not main)', hint: 'git switch -c onboarding/add-me', done: (s) => s.branch !== 'main' },
  { id: 'edit', label: 'Edit src/content/team.ts', hint: 'edit src/content/team.ts', done: (s) => s.modified || s.staged || s.commits.some((c) => c.branch !== 'main') },
  { id: 'stage', label: 'Stage the change', hint: 'git add src/content/team.ts', done: (s) => s.staged || s.commits.some((c) => c.branch !== 'main') },
  { id: 'commit', label: 'Commit with a Gus-approved message', hint: 'git commit -m "Add myself to the team directory"', done: (s) => s.goodCommit },
  { id: 'push', label: 'Push your branch to GitHub (and set upstream)', hint: 'git push -u origin <your-branch-name>', done: (s) => s.goodCommit && Object.entries(s.pushed).some(([b, p]) => b !== 'main' && p) },
]

export const day1Sim: Sim<SimState> = {
  title: 'Practice terminal',
  description: createElement(
    'span',
    null,
    'A safe, pretend git. Type real commands and nothing can break. The repo URL is ',
    createElement('code', { className: 'font-mono' }, REMOTE_URL),
    '. Type ',
    createElement('code', { className: 'font-mono' }, 'help'),
    " if you're lost.",
  ),
  welcome: 'Welcome to The Studio practice shell. You are in your home folder (~).',
  initial: INITIAL,
  prompt: (s) => `${s.cwd}${s.cwd !== '~' ? ` (${s.branch})` : ''} $`,
  run,
  goals: GOALS,
}

