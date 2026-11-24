import { L, tokenize, unknown, type Line, type Sim } from '../sim'

const BAD = 'f1d4c07'
const LOG = [
  ['8b2e5a9', 'Add a deploy checklist to the README', 'Gus'],
  [BAD, 'Make the app more fun for Friday', 'Bjorn'],
  ['3a7c9d1', 'Add presence to the team directory', 'Priya'],
]

interface S {
  branch: string
  found: boolean
  inspected: boolean
  reverted: boolean
  pushed: boolean
  triedReset: boolean
}

const INITIAL: S = { branch: 'main', found: false, inspected: false, reverted: false, pushed: false, triedReset: false }

function run(state: S, input: string): { state: S; lines: Line[] } {
  const s = { ...state }
  const t = tokenize(input)
  const [cmd, sub, ...rest] = t
  if (cmd === 'help') {
    return { state: s, lines: [L('muted', 'Try: git log --oneline, git log --oneline -- src/styles/tokens.css, git show <hash>, git switch -c <branch>,'), L('muted', 'git revert <hash>, git reset --hard <hash>, git push, clear')] }
  }
  if (cmd !== 'git') return { state: s, ...unknown(input) }

  switch (sub) {
    case 'log': {
      const fileOnly = rest.includes('src/styles/tokens.css')
      if (fileOnly) s.found = true
      const list = fileOnly ? LOG.filter(([, , who]) => who === 'Bjorn') : LOG
      return { state: s, lines: [...(s.reverted ? [L('ok', `9c0b1e2 Revert "Make the app more fun for Friday"`)] : []), ...list.map(([h, m]) => L(h === BAD ? 'gus' : 'out', `${h} ${m}`))] }
    }
    case 'show': {
      const c = LOG.find(([h]) => rest[0] && h.startsWith(rest[0].slice(0, 7)))
      if (!c) return { state: s, lines: [L('err', `fatal: bad revision '${rest[0] ?? ''}'`)] }
      if (c[0] === BAD) {
        s.inspected = true
        s.found = true
        return { state: s, lines: [L('ok', `commit ${BAD}`), L('out', 'Author: Bjorn Halvorsen'), L('out', '    Make the app more fun for Friday'), L('err', '-  --primary: oklch(0.52 0.19 275);'), L('ok', '+  --primary: oklch(0.68 0.22 40);'), L('err', '-  --sidebar: oklch(0.27 0.06 285);'), L('ok', '+  --sidebar: oklch(0.42 0.16 145);')] } // dot-ignore
      }
      return { state: s, lines: [L('ok', `commit ${c[0]}`), L('out', `Author: ${c[2]}`), L('out', `    ${c[1]}`)] }
    }
    case 'reset': {
      s.triedReset = true
      return {
        state: s,
        lines: [
          L('gus', 'Gus: Stop. Hands off the keyboard.'),
          L('gus', `Gus: Resetting main to before ${BAD} deletes my commit too. Then you'd have to force push, and everyone else's history breaks.`),
          L('muted', '(The practice terminal refused to run that. The real one would not have.)'),
        ],
      }
    }
    case 'push':
      if (rest.includes('--force') || rest.includes('-f')) return { state: s, lines: [L('gus', 'Gus: No force pushing. Not today. Not on a Friday. Not ever, on main.')] }
      if (!s.reverted) return { state: s, lines: [L('muted', 'Everything up-to-date')] }
      s.pushed = true
      return { state: s, lines: [L('ok', `✓ Pushed ${s.branch}. Open a PR, merge, and the colors come back for everyone.`)] }
    case 'switch':
    case 'checkout': {
      const create = rest[0] === '-c' || rest[0] === '-b'
      const name = create ? rest[1] : rest[0]
      if (!name) return { state: s, lines: [L('err', 'fatal: missing branch name')] }
      s.branch = name
      return { state: s, lines: [L('ok', `Switched to ${create ? 'a new ' : ''}branch '${name}'`)] }
    }
    case 'revert': {
      const h = rest.find((x) => !x.startsWith('-'))
      const c = LOG.find(([x]) => h && x.startsWith(h.slice(0, 7)))
      if (!c) return { state: s, lines: [L('err', `fatal: bad revision '${h ?? ''}'`)] }
      if (c[0] !== BAD) return { state: s, lines: [L('gus', `Gus: That's ${c[2]}'s commit. It's fine. Revert the one that turned things orange.`)] }
      if (s.branch === 'main') return { state: s, lines: [L('gus', 'Gus: Branch first. Even in an emergency. Especially in an emergency.')] }
      s.reverted = true
      return {
        state: s,
        lines: [
          L('muted', '(Your editor opens with a pre-written message. You save and close it.)'),
          L('out', `[${s.branch} 9c0b1e2] Revert "Make the app more fun for Friday"`),
          L('out', ' 1 file changed, 3 insertions(+), 3 deletions(-)'),
          L('ok', `✓ This reverts commit ${BAD}. Gus's commit is untouched.`),
        ],
      }
    }
    default:
      return { state: s, ...unknown(input) }
  }
}

export const day8Sim: Sim<S> = {
  title: 'Practice terminal',
  description: 'Find the commit that broke the colors and undo just that one, safely.',
  welcome: "🚨 You're on main. The app is orange. Gus pushed after Bjorn. Type `help`.",
  initial: INITIAL,
  prompt: (s) => `~/the-studio (${s.branch}) $`,
  run,
  goals: [
    { id: 'find', label: 'Find the commit that changed the tokens', hint: 'git log --oneline -- src/styles/tokens.css', done: (s) => s.found },
    { id: 'show', label: 'Confirm it with show', hint: `git show ${BAD}`, done: (s) => s.inspected },
    { id: 'branch', label: 'Make a revert/… branch', hint: 'git switch -c revert/friday-theme', done: (s) => s.branch.startsWith('revert/') },
    { id: 'revert', label: 'Revert only that commit', hint: `git revert ${BAD}`, done: (s) => s.reverted },
    { id: 'push', label: 'Push it', hint: 'git push -u origin revert/friday-theme', done: (s) => s.pushed },
  ],
}
