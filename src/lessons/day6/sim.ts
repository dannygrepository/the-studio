import { judgeCommit } from '../commitJudge'
import { L, tokenize, unknown, type Line, type Sim } from '../sim'

const PILL = 'src/components/ui/status-pill.tsx'
const PEOPLE = 'src/components/chat/PeopleView.tsx'
const TOKENS = 'src/styles/tokens.css'
const PKG = 'package.json'

interface S {
  sawStatus: boolean
  sawTokensDiff: boolean
  restored: string[]
  staged: string[]
  commits: string[][]
  ranDot: boolean
}

const INITIAL: S = { sawStatus: false, sawTokensDiff: false, restored: [], staged: [], commits: [], ranDot: false }

const committed = (s: S) => s.commits.flat()
const changed = (s: S) => [PILL, PEOPLE, TOKENS, PKG].filter((f) => !s.restored.includes(f) && !committed(s).includes(f))

function run(state: S, input: string): { state: S; lines: Line[] } {
  const s: S = { ...state, restored: [...state.restored], staged: [...state.staged], commits: [...state.commits] }
  const t = tokenize(input)
  const [cmd, sub, ...rest] = t
  if (cmd === 'help') {
    return { state: s, lines: [L('muted', 'Try: git status, git diff <file>, git restore <file>, npm run dot, git add <file>, git commit -m, clear')] }
  }
  if (cmd === 'npm' && t[2] === 'dot') {
    s.ranDot = true
    return s.restored.includes(TOKENS) || committed(s).includes(TOKENS)
      ? { state: s, lines: [L('ok', '💜 Dotty: Token audit passed. Every value is a token. I could cry.')] }
      : { state: s, lines: [L('ok', '💜 Dotty: Token audit passed.'), L('gus', "Dotty: …but tokens.css is allowed raw values, so my audit can't see that the AI changed --warning. You'll have to look. 💜")] }
  }
  if (cmd !== 'git') return { state: s, ...unknown(input) }

  switch (sub) {
    case 'status': {
      s.sawStatus = true
      const c = changed(s)
      if (!c.length) return { state: s, lines: [L('out', 'On branch feature/status-pill'), L('out', 'nothing to commit, working tree clean')] }
      return {
        state: s,
        lines: [
          L('out', 'On branch feature/status-pill'),
          ...c.map((f) => L(s.staged.includes(f) ? 'ok' : 'err', `        ${f === PILL ? 'new file' : 'modified'}:   ${f}`)),
          ...(c.includes(TOKENS) || c.includes(PKG) ? [L('gus', "Gus: You asked for one component. Why did tokens.css and package.json change?")] : []),
        ],
      }
    }
    case 'diff': {
      const f = rest[0]
      if (f === TOKENS) {
        s.sawTokensDiff = true
        return { state: s, lines: [L('err', '-  --warning: oklch(0.8 0.15 80);'), L('ok', '+  --warning: oklch(0.75 0.18 60); /* AI: tweaked for better contrast on the pill! */'), L('gus', 'Gus: That changes every warning in the app. Not what the ticket asked for.')] } // dot-ignore
      }
      if (f === PKG) return { state: s, lines: [L('ok', '+    "clsx-variants": "^0.0.1",'), L('gus', "Gus: A dependency nobody asked for. That doesn't even exist. AI made it up.")] }
      if (f === PILL) return { state: s, lines: [L('ok', '+export function StatusPill({ presence, className }: …) {'), L('ok', "+  return <span className={cn(pill({ presence }), className)}>{presence}</span>"), L('muted', '(looks right: cva, tokens, like badge.tsx)')] }
      if (f === PEOPLE) return { state: s, lines: [L('ok', '+            {person.presence && <StatusPill presence={person.presence} />}')] }
      return { state: s, lines: [L('muted', 'Name a file: git diff src/styles/tokens.css')] }
    }
    case 'restore': {
      const f = rest.find((x) => !x.startsWith('-'))
      if (!f || ![PILL, PEOPLE, TOKENS, PKG].includes(f)) return { state: s, lines: [L('err', `error: pathspec '${f ?? ''}' did not match any file(s) known to git`)] }
      if (f === PILL || f === PEOPLE) return { state: s, lines: [L('gus', "Gus: That's the work you want. Keep it.")] }
      s.restored.push(f)
      return { state: s, lines: [L('ok', `✓ ${f} is back to how it was. The AI's change is gone.`)] }
    }
    case 'add': {
      const f = rest[0]
      if (f === '.' || f === '-A') return { state: s, lines: [L('gus', "Gus: git add . grabs everything, including what the AI slipped in. Name the file.")] }
      if (!f || !changed(s).includes(f)) return { state: s, lines: [L('err', `fatal: pathspec '${f ?? ''}' did not match any files`)] }
      s.staged = [...new Set([...s.staged, f])]
      return { state: s, lines: [] }
    }
    case 'commit': {
      const i = rest.indexOf('-m')
      if (i < 0 || !rest[i + 1]) return { state: s, lines: [L('err', 'Use: git commit -m "Message"')] }
      if (!s.staged.length) return { state: s, lines: [L('err', 'nothing added to commit')] }
      const v = judgeCommit(rest[i + 1])
      if (!v.ok) return { state: s, lines: [L('gus', `Gus: ${v.verdicts.find((x) => !x.pass)!.gus}`)] }
      const lines: Line[] = [L('out', `[feature/status-pill ${Math.random().toString(16).slice(2, 9)}] ${rest[i + 1]}`), L('out', ` ${s.staged.length} file${s.staged.length > 1 ? 's' : ''} changed`)]
      if (s.staged.length > 1) lines.push(L('gus', 'Gus: Two things in one commit. Component, then usage, is easier to review. Fine for practice.'))
      s.commits.push(s.staged)
      s.staged = []
      return { state: s, lines }
    }
    default:
      return { state: s, ...unknown(input) }
  }
}

export const day6Sim: Sim<S> = {
  title: 'Practice terminal',
  description: 'The AI finished. It changed more than you asked. Review before you commit.',
  welcome: "You asked the AI for a StatusPill and to use it on the People page. It says \"Done! ✨\". You're on feature/status-pill. Type `help`.",
  initial: INITIAL,
  prompt: () => '~/the-studio (feature/status-pill) $',
  run,
  goals: [
    { id: 'status', label: 'See everything the AI touched', hint: 'git status', done: (s) => s.sawStatus },
    { id: 'diff', label: 'Read the surprise change to tokens.css', hint: `git diff ${TOKENS}`, done: (s) => s.sawTokensDiff },
    { id: 'restore', label: 'Undo the two changes nobody asked for', hint: `git restore ${TOKENS}`, done: (s) => s.restored.includes(TOKENS) && s.restored.includes(PKG) },
    { id: 'dot', label: 'Run Dotty\'s audit', hint: 'npm run dot', done: (s) => s.ranDot },
    { id: 'commit1', label: 'Commit the component on its own', hint: `git add ${PILL}`, done: (s) => s.commits.some((c) => c.includes(PILL)) },
    { id: 'commit2', label: 'Commit the People page change', hint: `git add ${PEOPLE}`, done: (s) => s.commits.some((c) => c.includes(PEOPLE)) },
  ],
}
