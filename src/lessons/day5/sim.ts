import { L, tokenize, unknown, type Line, type Sim } from '../sim'

const BJORN = 'origin/bjorn/header-redesign'
const FIX = '5be93d7'
const LOG = [
  ['c80e6a1', 'WIP more header experiments'],
  [FIX, 'Fix quarter typo in the People footer'],
  ['a4f01c2', 'WIP try a gradient header'],
  ['9d1e0b3', 'Add a footer note to the People page'],
]

interface S {
  branch: string
  dirty: boolean
  stashed: boolean
  popped: boolean
  sawLog: boolean
  picked: string | null
  pushed: boolean
}

const INITIAL: S = { branch: 'main', dirty: true, stashed: false, popped: false, sawLog: false, picked: null, pushed: false }

function run(state: S, input: string): { state: S; lines: Line[] } {
  const s = { ...state }
  const t = tokenize(input)
  const [cmd, sub, ...rest] = t
  if (cmd === 'help') {
    return { state: s, lines: [L('muted', `Try: git status, git stash, git stash list, git stash pop, git log --oneline ${BJORN},`), L('muted', 'git switch -c <branch>, git cherry-pick <hash>, git push -u origin <branch>, clear')] }
  }
  if (cmd !== 'git') return { state: s, ...unknown(input) }

  switch (sub) {
    case 'status':
      return { state: s, lines: [L('out', `On branch ${s.branch}`), s.dirty ? L('err', 'Changes not staged for commit:\n        modified:   src/content/copy.ts') : L('out', 'nothing to commit, working tree clean')] }
    case 'stash': {
      if (rest[0] === 'list') return { state: s, lines: s.stashed && !s.popped ? [L('out', 'stash@{0}: WIP on main: 9d1e0b3 Add a footer note to the People page')] : [L('muted', '(no stashes)')] }
      if (rest[0] === 'pop') {
        if (!s.stashed || s.popped) return { state: s, lines: [L('err', 'No stash entries found.')] }
        s.popped = true
        s.dirty = true
        return { state: s, lines: [L('out', 'On branch main\nChanges not staged for commit:\n        modified:   src/content/copy.ts'), L('ok', 'Dropped refs/stash@{0}. Your half-done edit is back, right where you left it.')] }
      }
      if (!s.dirty) return { state: s, lines: [L('muted', 'No local changes to save')] }
      s.dirty = false
      s.stashed = true
      return { state: s, lines: [L('out', 'Saved working directory and index state WIP on main: 9d1e0b3 Add a footer note to the People page'), L('ok', '✓ Parked. git status is clean.')] }
    }
    case 'log': {
      const ref = rest.find((x) => !x.startsWith('-'))
      if (ref && ref.includes('bjorn')) {
        s.sawLog = true
        return { state: s, lines: LOG.map(([h, m]) => L(m.startsWith('WIP') ? 'muted' : 'out', `${h} ${m}`)) }
      }
      return { state: s, lines: [L('out', '9d1e0b3 Add a footer note to the People page'), L('muted', `(That's main. Bjorn's branch is ${BJORN}.)`)] }
    }
    case 'switch':
    case 'checkout': {
      const create = rest[0] === '-c' || rest[0] === '-b'
      const name = create ? rest[1] : rest[0]
      if (!name) return { state: s, lines: [L('err', 'fatal: missing branch name')] }
      if (s.dirty && !s.popped) return { state: s, lines: [L('gus', "Gus: You have a half-done edit. It'll come along for the ride. Park it first: git stash.")] }
      s.branch = name
      return { state: s, lines: [L('ok', `Switched to ${create ? 'a new ' : ''}branch '${name}'`)] }
    }
    case 'cherry-pick': {
      const h = rest.find((x) => !x.startsWith('-'))
      const c = LOG.find(([x]) => h && x.startsWith(h.slice(0, 7)))
      if (!c) return { state: s, lines: [L('err', `fatal: bad revision '${h ?? ''}'`), L('muted', `Copy a hash from git log --oneline ${BJORN}`)] }
      if (s.branch === 'main') return { state: s, lines: [L('gus', 'Gus: On main? Hotfix branch first.')] }
      if (c[1].startsWith('WIP')) return { state: s, lines: [L('err', `[${s.branch}] ${c[1]}`), L('gus', "Dotty: That's the pink header. 💜 Undo it: git reset --hard HEAD~1 (it's your unpushed branch, so that's safe). Then pick the fix.")] }
      s.picked = c[0]
      return { state: s, lines: [L('out', `[${s.branch} 0f4a2d8] ${c[1]}`), L('out', ' 1 file changed, 1 insertion(+), 1 deletion(-)'), L('ok', '✓ One commit copied. Nothing else came with it.')] }
    }
    case 'reset':
      return { state: s, lines: [L('muted', 'Reset back one commit. (Only ever on unpushed, unshared work.)')] }
    case 'push':
      if (!s.picked) return { state: s, lines: [L('muted', 'Nothing to push yet.')] }
      s.pushed = true
      return { state: s, lines: [L('ok', `✓ Pushed ${s.branch}. Open a PR, merge it, demo saved.`)] }
    default:
      return { state: s, ...unknown(input) }
  }
}

export const day5Sim: Sim<S> = {
  title: 'Practice terminal',
  description: 'Interrupted mid-edit, ship one fix, then get your edit back.',
  welcome: "You're on main with a half-done edit in src/content/copy.ts. Priya just pinged: the typo has to ship NOW. Type `help`.",
  initial: INITIAL,
  prompt: (s) => `~/the-studio (${s.branch}) $`,
  run,
  goals: [
    { id: 'stash', label: 'Park your half-done edit', hint: 'git stash', done: (s) => s.stashed },
    { id: 'log', label: "Find Bjorn's fix", hint: `git log --oneline ${BJORN}`, done: (s) => s.sawLog },
    { id: 'branch', label: 'Make a hotfix/… branch', hint: 'git switch -c hotfix/people-footer-typo', done: (s) => s.branch.startsWith('hotfix/') },
    { id: 'pick', label: 'Cherry-pick only the fix', hint: `git cherry-pick ${FIX}`, done: (s) => s.picked === FIX },
    { id: 'push', label: 'Push it', hint: 'git push -u origin hotfix/people-footer-typo', done: (s) => s.pushed },
    { id: 'pop', label: 'Back on main, get your edit back', hint: 'git stash pop', done: (s) => s.popped },
  ],
}
