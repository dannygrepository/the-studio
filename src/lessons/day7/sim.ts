import { judgeCommit } from '../commitJudge'
import { L, tokenize, unknown, type Line, type Sim } from '../sim'

const BRANCH = 'ai/unread-badge'
const FILE = 'src/components/chat/UnreadBadge.tsx'

interface S {
  branch: string
  sawDiff: boolean
  ranDot: boolean
  fixed: boolean
  committed: boolean
  pushed: boolean
}

const INITIAL: S = { branch: 'main', sawDiff: false, ranDot: false, fixed: false, committed: false, pushed: false }

function run(state: S, input: string): { state: S; lines: Line[] } {
  const s = { ...state }
  const t = tokenize(input)
  const [cmd, sub, ...rest] = t
  if (cmd === 'help') {
    return { state: s, lines: [L('muted', `Try: git switch ${BRANCH}, git diff main...${BRANCH}, git diff --name-only main...${BRANCH},`), L('muted', `npm run dot, edit ${FILE}, npm run check, git commit -am, git push, clear`)] }
  }
  if (cmd === 'npm') {
    if (s.branch !== BRANCH) return { state: s, lines: [L('muted', `(main is clean. Switch to ${BRANCH} to audit it.)`)] }
    if (t[2] === 'dot' || t[2] === 'check') s.ranDot = true
    if (s.fixed) return { state: s, lines: [L('ok', '💜 Dotty: Token audit passed. Every value is a token. I could cry.')] }
    return {
      state: s,
      lines: [
        L('err', '💜 Dotty: I found 3 hard-coded values. We talked about this.'),
        L('err', `  ${FILE}:6  hex color: #ef4444`), // dot-ignore
        L('err', `  ${FILE}:6  arbitrary value: px-[6px]`),
        L('err', `  ${FILE}:7  inline style: style={{`),
        L('muted', "(The audit can't see: the clickable div, the missing label, text-white, or the 0 badge. That's you.)"),
      ],
    }
  }
  if (['edit', 'code', 'open'].includes(cmd)) {
    if (sub !== FILE) return { state: s, lines: [L('err', `Try: edit ${FILE}`)] }
    if (s.branch !== BRANCH) return { state: s, lines: [L('err', `${FILE} doesn't exist on main. It's on ${BRANCH}.`)] }
    s.fixed = true
    return {
      state: s,
      lines: [
        L('ok', '✎ Rewrote it:'),
        L('out', '  if (count === 0) return null'),
        L('out', '  return <Badge variant="sidebar" aria-label={`${count} unread messages`}>{count}</Badge>'),
        L('muted', '(Tokens via Badge, no click handler, a label, nothing at zero.)'),
      ],
    }
  }
  if (cmd !== 'git') return { state: s, ...unknown(input) }

  switch (sub) {
    case 'switch':
    case 'checkout':
      if (rest[0] !== BRANCH && rest[0] !== 'main') return { state: s, lines: [L('err', `Try: git switch ${BRANCH}`)] }
      s.branch = rest[0]
      return { state: s, lines: [L('ok', `Switched to branch '${rest[0]}'`), ...(rest[0] === BRANCH ? [L('out', `branch '${BRANCH}' set up to track 'origin/${BRANCH}'.`)] : [])] }
    case 'diff': {
      const range = rest.find((x) => x.includes('...'))
      if (!range) return { state: s, lines: [L('muted', `Compare the branch to main: git diff main...${BRANCH}`)] }
      s.sawDiff = true
      if (rest.includes('--name-only')) return { state: s, lines: [L('out', FILE), L('out', 'src/components/chat/Sidebar.tsx')] }
      return {
        state: s,
        lines: [
          L('ok', `+++ b/${FILE}`),
          L('ok', '+    <div onClick={onClick}'),
          L('ok', '+      className="ml-auto rounded-full bg-[#ef4444] px-[6px] text-white"'), // dot-ignore
          L('ok', "+      style={{ fontSize: 11, lineHeight: '18px' }}>"),
          L('ok', '+      {count}'),
          L('muted', '+++ b/src/components/chat/Sidebar.tsx'),
          L('err', '-                  {n > 0 && <Badge variant="sidebar">{n}</Badge>}'),
          L('ok', '+                  <UnreadBadge count={n} />'),
          L('gus', "Gus: Look at that last line. The old code hid the badge at zero. The new code doesn't."),
        ],
      }
    }
    case 'commit': {
      const i = rest.findIndex((x) => x === '-m' || x === '-am')
      if (i < 0 || !rest[i + 1]) return { state: s, lines: [L('err', 'Use: git commit -am "Message"')] }
      if (!s.fixed) return { state: s, lines: [L('err', 'nothing to commit')] }
      const v = judgeCommit(rest[i + 1])
      if (!v.ok) return { state: s, lines: [L('gus', `Gus: ${v.verdicts.find((x) => !x.pass)!.gus}`)] }
      s.committed = true
      return { state: s, lines: [L('out', `[${BRANCH} 6e0a9b4] ${rest[i + 1]}`)] }
    }
    case 'push':
      if (!s.committed) return { state: s, lines: [L('muted', 'Everything up-to-date')] }
      s.pushed = true
      return { state: s, lines: [L('ok', `✓ Pushed ${BRANCH}. Open the PR, leave a kind summary for Bjorn, merge.`)] }
    default:
      return { state: s, ...unknown(input) }
  }
}

export const day7Sim: Sim<S> = {
  title: 'Practice terminal',
  description: "Review Bjorn's AI branch from the terminal: see what it changes, audit it, fix it, push.",
  welcome: "You're on main. Bjorn's AI branch is on GitHub. Type `help`.",
  initial: INITIAL,
  prompt: (s) => `~/the-studio (${s.branch}) $`,
  run,
  goals: [
    { id: 'switch', label: "Check out Bjorn's branch", hint: `git switch ${BRANCH}`, done: (s) => s.branch === BRANCH || s.committed },
    { id: 'diff', label: 'See what it changes compared to main', hint: `git diff main...${BRANCH}`, done: (s) => s.sawDiff },
    { id: 'dot', label: 'Let the tool find what it can', hint: 'npm run dot', done: (s) => s.ranDot },
    { id: 'fix', label: 'Fix all seven (tools and humans)', hint: `edit ${FILE}`, done: (s) => s.fixed },
    { id: 'commit', label: 'Commit the fixes', hint: 'git commit -am "Fix tokens and accessibility in UnreadBadge"', done: (s) => s.committed },
    { id: 'push', label: 'Push to the same branch', hint: 'git push', done: (s) => s.pushed },
  ],
}
