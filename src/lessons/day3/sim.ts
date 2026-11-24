import { judgeCommit } from '../commitJudge'
import { L, tokenize, unknown, type Line, type Sim } from '../sim'

const BRANCH = 'onboarding/add-sam'
const FILE = 'src/content/team.ts'

interface S {
  branch: string
  mergedMain: boolean
  edited: boolean
  staged: boolean
  committed: boolean
  pushed: boolean
  pulled: boolean
  deleted: boolean
  tsError: boolean
}

const INITIAL: S = { branch: BRANCH, mergedMain: false, edited: false, staged: false, committed: false, pushed: false, pulled: false, deleted: false, tsError: false }

function run(state: S, input: string): { state: S; lines: Line[] } {
  const s = { ...state }
  const t = tokenize(input)
  const [cmd, sub, ...rest] = t

  if (cmd === 'help') {
    return { state: s, lines: [L('muted', 'Try: git status, git merge main, edit src/content/team.ts, npm run check, git add, git commit -m, git push,'), L('muted', 'git switch main, git pull, git branch -d <branch>, git log --oneline, clear')] }
  }
  if (['edit', 'code', 'open'].includes(cmd)) {
    if (sub !== FILE) return { state: s, lines: [L('err', `Try: edit ${FILE}`)] }
    s.edited = true
    s.tsError = !s.mergedMain
    return { state: s, lines: [L('ok', `✎ Added pronouns: 'they/them' to your entry. Saved.`)] }
  }
  if (cmd === 'npm' && t[2] === 'check') {
    if (s.tsError) return { state: s, lines: [L('err', `${FILE}(72,3): error TS2353: Object literal may only specify known properties, and 'pronouns' does not exist in type 'TeamMember'.`), L('gus', "Gus: Your branch doesn't know about pronouns yet. It's older than Priya's change. Bring main in.")] }
    return { state: s, lines: [L('ok', '✓ types ok'), L('ok', '💜 Dotty: Token audit passed.')] }
  }
  if (cmd !== 'git') return { state: s, ...unknown(input) }

  switch (sub) {
    case 'status':
      return { state: s, lines: [L('out', `On branch ${s.branch}`), L('out', s.edited && !s.committed ? `Changes not staged for commit:\n        modified:   ${FILE}` : 'nothing to commit, working tree clean')] }
    case 'log':
      return {
        state: s,
        lines: [
          ...(s.committed ? [L('ok', 'a81c3d2 Add pronouns to my directory entry')] : []),
          ...(s.mergedMain ? [L('out', "5d0e7b9 Merge branch 'main' into onboarding/add-sam"), L('out', '3c1f8a4 Add pronouns to the team directory')] : []),
          L('out', '066074b Add Sam Rivera to the team directory'),
        ],
      }
    case 'merge': {
      if (rest[0] !== 'main' && rest[0] !== 'origin/main') return { state: s, lines: [L('err', 'Try: git merge main')] }
      if (s.branch === 'main') return { state: s, lines: [L('muted', 'Already up to date. (You\'re on main. Switch to your branch first.)')] }
      s.mergedMain = true
      s.tsError = false
      return { state: s, lines: [L('out', "Merge made by the 'ort' strategy."), L('out', ` ${FILE}                   | 7 +++++++`), L('out', ' src/components/chat/PeopleView.tsx    | 5 ++++-'), L('ok', '✓ Your branch has Priya\'s pronouns field now.')] }
    }
    case 'add':
      if (!s.edited) return { state: s, lines: [L('muted', '(nothing to add)')] }
      s.staged = true
      return { state: s, lines: [] }
    case 'commit': {
      if (rest.includes('-am') || rest.includes('-a')) s.staged = s.staged || s.edited
      const m = rest[rest.findIndex((x) => x === '-m' || x === '-am') + 1]
      if (!m || rest.findIndex((x) => x === '-m' || x === '-am') < 0) return { state: s, lines: [L('err', 'Use: git commit -m "Message"')] }
      if (!s.staged) return { state: s, lines: [L('err', 'nothing added to commit')] }
      if (s.tsError) return { state: s, lines: [L('gus', "Gus: Run npm run check first. It's failing. Your branch is missing main's changes.")] }
      const v = judgeCommit(m)
      if (!v.ok) return { state: s, lines: [L('gus', `Gus: ${v.verdicts.find((x) => !x.pass)!.gus}`)] }
      s.committed = true
      s.staged = false
      return { state: s, lines: [L('out', `[${s.branch} a81c3d2] ${m}`), L('out', ' 1 file changed, 1 insertion(+)')] }
    }
    case 'push':
      if (!s.committed) return { state: s, lines: [L('muted', 'Everything up-to-date')] }
      s.pushed = true
      return { state: s, lines: [L('out', `To github.com:you/the-studio.git\n   066074b..a81c3d2  ${BRANCH} -> ${BRANCH}`), L('ok', '✓ Pull request #2 updated with 2 new commits. Gus has been notified. Gus approves.'), L('muted', '(Now merge it on GitHub. Pretend you did. Then switch to main and pull.)')] }
    case 'switch':
    case 'checkout':
      if (rest[0] === '-c' || rest[0] === '-b') return { state: s, lines: [L('muted', "No new branches today. You're updating an existing pull request.")] }
      if (!rest[0]) return { state: s, lines: [L('err', 'fatal: missing branch name')] }
      if (rest[0] !== 'main' && rest[0] !== BRANCH) return { state: s, lines: [L('err', `error: no branch '${rest[0]}'`)] }
      s.branch = rest[0]
      return { state: s, lines: [L('ok', `Switched to branch '${rest[0]}'`)] }
    case 'pull':
      if (s.branch !== 'main') return { state: s, lines: [L('muted', 'Pull on main. Your PR was merged there.')] }
      if (!s.pushed) return { state: s, lines: [L('muted', 'Already up to date. (Push your fix and merge the PR first.)')] }
      s.pulled = true
      return { state: s, lines: [L('out', 'Updating 3c1f8a4..9e2d417\nFast-forward\n src/content/team.ts | 7 ++++++-'), L('ok', '✓ main has your entry now. Check the People page.')] }
    case 'branch':
      if (rest[0] === '-d' || rest[0] === '-D') {
        if (rest[1] !== BRANCH) return { state: s, lines: [L('err', `error: branch '${rest[1] ?? ''}' not found.`)] }
        if (s.branch === BRANCH) return { state: s, lines: [L('err', `error: Cannot delete branch '${BRANCH}' checked out. Switch to main first.`)] }
        if (!s.pulled) return { state: s, lines: [L('err', `error: The branch '${BRANCH}' is not fully merged. (Pull main first, so git can see it was merged.)`)] }
        s.deleted = true
        return { state: s, lines: [L('out', `Deleted branch ${BRANCH} (was a81c3d2).`), L('ok', '✓ Tidy. The work lives on in main.')] }
      }
      return { state: s, lines: ['main', ...(s.deleted ? [] : [BRANCH])].map((b) => L(b === s.branch ? 'ok' : 'out', `${b === s.branch ? '* ' : '  '}${b}`)) }
    default:
      return { state: s, ...unknown(input) }
  }
}

export const day3Sim: Sim<S> = {
  title: 'Practice terminal',
  description: "Gus requested a change on your pull request. Update the branch, push, then catch up main after it's merged.",
  welcome: `You're on ${BRANCH}. Its pull request is open. Gus asked for pronouns. Type \`help\` for commands.`,
  initial: INITIAL,
  prompt: (s) => `~/the-studio (${s.branch}) $`,
  run,
  goals: [
    { id: 'merge', label: "Bring main's new commits into your branch", hint: 'git merge main', done: (s) => s.mergedMain },
    { id: 'edit', label: 'Add your pronouns', hint: `edit ${FILE}`, done: (s) => s.edited && !s.tsError },
    { id: 'commit', label: 'Commit it', hint: 'git commit -am "Add pronouns to my directory entry"', done: (s) => s.committed },
    { id: 'push', label: 'Push (the pull request updates itself)', hint: 'git push', done: (s) => s.pushed },
    { id: 'pull', label: 'After the merge: switch to main and pull', hint: 'git switch main', done: (s) => s.pulled },
    { id: 'tidy', label: 'Delete the merged branch', hint: `git branch -d ${BRANCH}`, done: (s) => s.deleted },
  ],
}
