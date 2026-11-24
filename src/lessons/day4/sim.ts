import { judgeCommit } from '../commitJudge'
import { L, tokenize, unknown, type Line, type Sim } from '../sim'

const FILE = 'src/content/copy.ts'
const BJORN = 'origin/bjorn/people-page-copy'

interface S {
  branch: string
  edited: boolean
  committed: boolean
  merging: boolean
  aborted: boolean
  sawStatus: boolean
  resolved: boolean
  staged: boolean
  merged: boolean
  pushed: boolean
}

const INITIAL: S = { branch: 'main', edited: false, committed: false, merging: false, aborted: false, sawStatus: false, resolved: false, staged: false, merged: false, pushed: false }

const CONFLICTED = [
  'export const peoplePage = {',
  '<<<<<<< HEAD',
  "  title: 'Team',",
  `  subtitle: "Who's who at The Studio",`,
  '=======',
  "  title: 'The Squad 🚀',",
  "  subtitle: 'Everyone who works here (and CI-3PO, who insists)',",
  `>>>>>>> ${BJORN}`,
  '}',
]

function run(state: S, input: string): { state: S; lines: Line[] } {
  const s = { ...state }
  const t = tokenize(input)
  const [cmd, sub, ...rest] = t

  if (cmd === 'help') {
    return { state: s, lines: [L('muted', `Try: git switch -c <branch>, edit ${FILE}, git commit -am, git merge ${BJORN},`), L('muted', `git status, cat ${FILE}, git merge --abort, git add, git commit, git push -u origin <branch>, clear`)] }
  }
  if (cmd === 'cat') {
    if (sub !== FILE) return { state: s, lines: [L('err', `Try: cat ${FILE}`)] }
    if (s.merging && !s.resolved) return { state: s, lines: CONFLICTED.map((l) => L(l.startsWith('<<<') || l.startsWith('===') || l.startsWith('>>>') ? 'gus' : 'out', l)) }
    return { state: s, lines: [L('out', 'export const peoplePage = {'), L('out', s.merged || s.resolved ? "  title: 'Team'," : s.edited ? "  title: 'Team'," : "  title: 'People',"), L('out', s.merged || s.resolved ? "  subtitle: 'Everyone who works here (and CI-3PO, who insists)'," : s.edited ? `  subtitle: "Who's who at The Studio",` : "  subtitle: 'Built from src/content/team.ts',"), L('out', '}')] }
  }
  if (['edit', 'code', 'open'].includes(cmd)) {
    if (sub !== FILE) return { state: s, lines: [L('err', `Try: edit ${FILE}`)] }
    if (s.branch === 'main') return { state: s, lines: [L('gus', 'Gus: Branch first.')] }
    if (s.merging) {
      s.resolved = true
      return { state: s, lines: [L('ok', "✎ Kept your title and Bjorn's subtitle. Deleted all three marker lines. Saved."), L('muted', "(Git doesn't know yet. Stage it.)")] }
    }
    s.edited = true
    return { state: s, lines: [L('ok', `✎ title: 'Team', subtitle: "Who's who at The Studio". Saved.`)] }
  }
  if (cmd !== 'git') return { state: s, ...unknown(input) }

  switch (sub) {
    case 'switch':
    case 'checkout': {
      if (s.merging) return { state: s, lines: [L('err', 'error: you need to resolve your current index first'), L('muted', 'Finish the merge, or git merge --abort.')] }
      const create = rest[0] === '-c' || rest[0] === '-b'
      const name = create ? rest[1] : rest[0]
      if (!name) return { state: s, lines: [L('err', 'fatal: missing branch name')] }
      s.branch = name
      return { state: s, lines: [L('ok', `Switched to ${create ? 'a new ' : ''}branch '${name}'`)] }
    }
    case 'add':
      if (s.merging && !s.resolved) return { state: s, lines: [L('gus', "Gus: You're about to stage a file full of <<<<<<< markers. Resolve it first. (cat it.)")] }
      if (s.merging) s.staged = true
      return { state: s, lines: [] }
    case 'commit': {
      if (s.merging) {
        if (!s.staged) return { state: s, lines: [L('err', 'error: Committing is not possible because you have unmerged files.'), L('muted', `Resolve, then git add ${FILE}.`)] }
        s.merging = false
        s.merged = true
        return { state: s, lines: [L('out', `[${s.branch} 7d3a0c1] Merge remote-tracking branch '${BJORN}' into ${s.branch}`), L('ok', '✓ Merge complete. Two parents: yours and Bjorn\'s.')] }
      }
      if (!s.edited) return { state: s, lines: [L('err', 'nothing to commit')] }
      const m = rest[rest.findIndex((x) => x === '-m' || x === '-am') + 1]
      if (!m || rest.findIndex((x) => x === '-m' || x === '-am') < 0) return { state: s, lines: [L('err', 'Use: git commit -am "Message"')] }
      const v = judgeCommit(m)
      if (!v.ok) return { state: s, lines: [L('gus', `Gus: ${v.verdicts.find((x) => !x.pass)!.gus}`)] }
      s.committed = true
      return { state: s, lines: [L('out', `[${s.branch} 4b2e1f9] ${m}`)] }
    }
    case 'merge': {
      if (rest[0] === '--abort') {
        if (!s.merging) return { state: s, lines: [L('err', 'fatal: There is no merge to abort.')] }
        s.merging = false
        s.resolved = false
        s.staged = false
        s.aborted = true
        return { state: s, lines: [L('ok', '✓ Merge aborted. Everything is exactly how it was before. Breathe. Then try again.')] }
      }
      if (rest[0] !== BJORN && rest[0] !== 'bjorn/people-page-copy') return { state: s, lines: [L('err', `Try: git merge ${BJORN}`)] }
      if (!s.committed) return { state: s, lines: [L('gus', 'Gus: Commit your own change first. Then merge his into yours.')] }
      if (s.merged) return { state: s, lines: [L('out', 'Already up to date.')] }
      s.merging = true
      return { state: s, lines: [L('out', `Auto-merging ${FILE}`), L('err', `CONFLICT (content): Merge conflict in ${FILE}`), L('err', 'Automatic merge failed; fix conflicts and then commit the result.'), L('muted', "This is the boss. It's fine. git status, then cat the file.")] }
    }
    case 'status':
      if (s.merging) {
        s.sawStatus = true
        return { state: s, lines: [L('out', `On branch ${s.branch}`), L('out', 'You have unmerged paths.'), L('muted', '  (fix conflicts and run "git commit")'), L('muted', '  (use "git merge --abort" to abort the merge)'), L(s.staged ? 'ok' : 'err', `        ${s.staged ? 'modified' : 'both modified'}:   ${FILE}`)] }
      }
      return { state: s, lines: [L('out', `On branch ${s.branch}`), L('out', 'nothing to commit, working tree clean')] }
    case 'push':
      if (!s.merged) return { state: s, lines: [L('muted', 'Merge Bjorn\'s branch first. That\'s the point of today.')] }
      s.pushed = true
      return { state: s, lines: [L('ok', `✓ Pushed ${s.branch}. Open a pull request. CI-3PO says the build is green.`)] }
    default:
      return { state: s, ...unknown(input) }
  }
}

export const day4Sim: Sim<S> = {
  title: 'Practice terminal',
  description: "The whole boss fight, typed. Including the escape hatch, so you know you can always back out.",
  welcome: "You're on main in the-studio. Type `help` for commands.",
  initial: INITIAL,
  prompt: (s) => `~/the-studio (${s.branch}${s.merging ? '|MERGING' : ''}) $`,
  run,
  goals: [
    { id: 'branch', label: 'Branch and commit your copy change', hint: `git switch -c copy/people-page`, done: (s) => s.committed },
    { id: 'conflict', label: "Merge Bjorn's branch and hit the conflict", hint: `git merge ${BJORN}`, done: (s) => s.merging || s.merged || s.aborted },
    { id: 'abort', label: 'Try the escape hatch once (abort), then merge again', hint: 'git merge --abort', done: (s) => s.aborted && (s.merging || s.merged) },
    { id: 'look', label: 'Look before you leap: status and the file', hint: 'git status', done: (s) => s.sawStatus || s.merged },
    { id: 'resolve', label: 'Resolve, stage, and commit the merge', hint: `edit ${FILE}`, done: (s) => s.merged },
    { id: 'push', label: 'Push it', hint: 'git push -u origin copy/people-page', done: (s) => s.pushed },
  ],
}
