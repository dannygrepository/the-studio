import { judgeCommit } from '../commitJudge'
import { L, tokenize, unknown, type Line, type Sim } from '../sim'

const FILES = ['src/content/kudos.ts', 'src/components/chat/KudosView.tsx', 'src/components/chat/Sidebar.tsx']

interface S {
  branch: string
  pulled: boolean
  edited: string[]
  staged: string[]
  commits: { subject: string; files: string[] }[]
  pushed: boolean
  merged: boolean
  caughtUp: boolean
  started: boolean
}

const INITIAL: S = { branch: 'main', pulled: false, edited: [], staged: [], commits: [], pushed: false, merged: false, caughtUp: false, started: false }

const pending = (s: S) => s.edited.filter((f) => !s.commits.some((c) => c.files.includes(f)))

function run(state: S, input: string): { state: S; lines: Line[] } {
  const s: S = { ...state, edited: [...state.edited], staged: [...state.staged], commits: [...state.commits] }
  const t = tokenize(input)
  const [cmd, sub, ...rest] = t
  if (cmd === 'help') {
    return { state: s, lines: [L('muted', `Try: git switch main, git pull, git switch -c feature/kudos-page, edit <file>, git status, git add <file>,`), L('muted', `git commit -m, git push -u origin <branch>, merge (pretend GitHub), git branch -d <branch>, clear`), L('muted', `Files: ${FILES.join(', ')}`)] }
  }
  if (cmd === 'merge') {
    if (!s.pushed) return { state: s, lines: [L('muted', 'Push your branch and open a PR first.')] }
    s.merged = true
    return { state: s, lines: [L('ok', '🌐 GitHub: Pull request #9 merged into main. Gus left a comment: "LGTM."'), L('muted', 'Now catch your laptop up.')] }
  }
  if (['edit', 'code', 'open'].includes(cmd)) {
    if (!sub || !FILES.includes(sub)) return { state: s, lines: [L('err', `Pick one: ${FILES.join(', ')}`)] }
    if (s.branch === 'main') return { state: s, lines: [L('gus', 'Gus: On main. You know this one.')] }
    if (!s.edited.includes(sub)) s.edited.push(sub)
    return { state: s, lines: [L('ok', `✎ ${sub} saved.`)] }
  }
  if (cmd !== 'git') return { state: s, ...unknown(input) }

  switch (sub) {
    case 'switch':
    case 'checkout': {
      const create = rest[0] === '-c' || rest[0] === '-b'
      const name = create ? rest[1] : rest[0]
      if (!name) return { state: s, lines: [L('err', 'fatal: missing branch name')] }
      if (create && !s.pulled) return { state: s, lines: [L('gus', 'Gus: Pull first. Branch from the latest main, not yesterday\'s.')] }
      s.branch = name
      if (create && name.startsWith('feature/')) s.started = true
      return { state: s, lines: [L('ok', `Switched to ${create ? 'a new ' : ''}branch '${name}'`)] }
    }
    case 'pull':
      if (s.branch !== 'main') return { state: s, lines: [L('muted', 'Already up to date.')] }
      if (s.merged) s.caughtUp = true
      else s.pulled = true
      return { state: s, lines: [L('out', s.merged ? 'Fast-forward\n 3 files changed' : 'Already up to date.'), ...(s.merged ? [L('ok', '✓ The Kudos page is on your main.')] : [])] }
    case 'status':
      return { state: s, lines: [L('out', `On branch ${s.branch}`), ...pending(s).map((f) => L(s.staged.includes(f) ? 'ok' : 'err', `        modified:   ${f}`)), ...(pending(s).length ? [] : [L('out', 'nothing to commit, working tree clean')])] }
    case 'add': {
      const f = rest[0]
      if (f === '.' || f === '-A') {
        if (pending(s).length > 1) return { state: s, lines: [L('gus', 'Gus: That grabs all of it. One piece per commit. Name the file.')] }
        s.staged = [...pending(s)]
        return { state: s, lines: [] }
      }
      if (!f || !pending(s).includes(f)) return { state: s, lines: [L('err', `fatal: pathspec '${f ?? ''}' did not match any changed files`)] }
      s.staged = [...new Set([...s.staged, f])]
      return { state: s, lines: [] }
    }
    case 'commit': {
      const i = rest.indexOf('-m')
      if (i < 0 || !rest[i + 1]) return { state: s, lines: [L('err', 'Use: git commit -m "Message"')] }
      if (!s.staged.length) return { state: s, lines: [L('err', 'nothing added to commit')] }
      const v = judgeCommit(rest[i + 1])
      if (!v.ok) return { state: s, lines: [L('gus', `Gus: ${v.verdicts.find((x) => !x.pass)!.gus}`)] }
      s.commits.push({ subject: rest[i + 1], files: s.staged })
      s.staged = []
      return { state: s, lines: [L('out', `[${s.branch} ${Math.random().toString(16).slice(2, 9)}] ${rest[i + 1]}`)] }
    }
    case 'push':
      if (!s.commits.length) return { state: s, lines: [L('muted', 'Nothing to push.')] }
      if (pending(s).length) return { state: s, lines: [L('gus', 'Gus: You have uncommitted changes. Finish the pieces first.')] }
      s.pushed = true
      return { state: s, lines: [L('ok', `✓ Pushed ${s.branch} with ${s.commits.length} commits. Open a pull request, then type \`merge\` to pretend GitHub merged it.`)] }
    case 'branch':
      if ((rest[0] === '-d' || rest[0] === '-D') && rest[1]) {
        if (!s.caughtUp) return { state: s, lines: [L('err', `error: The branch '${rest[1]}' is not fully merged.`)] }
        if (s.branch === rest[1]) return { state: s, lines: [L('err', 'Switch to main first.')] }
        return { state: { ...s, branch: 'main' }, lines: [L('out', `Deleted branch ${rest[1]}.`), L('ok', '🎉 Ticket to merged PR. That\'s the whole loop.')] }
      }
      return { state: s, lines: [L('out', `* ${s.branch}`)] }
    default:
      return { state: s, ...unknown(input) }
  }
}

export const day9Sim: Sim<S> = {
  title: 'Practice terminal',
  description: 'The whole loop, three small commits, no training wheels. (Well, a few.)',
  welcome: "You're on main. Ticket STU-9: the Kudos page. Data, page, link. Type `help` for the file names.",
  initial: INITIAL,
  prompt: (s) => `~/the-studio (${s.branch}) $`,
  run,
  goals: [
    { id: 'start', label: 'Start from the latest main on a feature branch', hint: 'git pull', done: (s) => s.started },
    { id: 'three', label: 'Three focused commits (one file each)', hint: `edit ${FILES[0]}`, done: (s) => s.commits.length >= 3 && s.commits.every((c) => c.files.length === 1) },
    { id: 'push', label: 'Push the branch', hint: 'git push -u origin feature/kudos-page', done: (s) => s.pushed },
    { id: 'merge', label: 'Merge the pull request', hint: 'merge', done: (s) => s.merged },
    { id: 'home', label: 'Catch up main and tidy the branch', hint: 'git switch main', done: (s) => s.caughtUp },
  ],
}
