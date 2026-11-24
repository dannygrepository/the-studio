import { judgeCommit } from '../commitJudge'
import { L, tokenize, unknown, type Line, type Sim } from '../sim'
import { BLAME, CULPRIT, HISTORY } from './history'

const FILE = 'src/components/ui/button.tsx'

interface S {
  branch: string
  ranLog: boolean
  inspected: boolean
  fixed: boolean
  staged: boolean
  committed: { subject: string; named: boolean; ok: boolean } | null
}

const INITIAL: S = { branch: 'main', ranLog: false, inspected: false, fixed: false, staged: false, committed: null }

function run(state: S, input: string): { state: S; lines: Line[] } {
  const s = { ...state }
  const t = tokenize(input)
  const [cmd, sub, ...rest] = t

  if (cmd === 'help') {
    return {
      state: s,
      lines: [
        L('muted', 'Try: git log --oneline, git log --oneline -- <file>, git show <hash>, git blame <file>,'),
        L('muted', 'git status, git switch -c <branch>, edit <file>, npm run dot, git add <file>,'),
        L('muted', 'git commit -m "Subject" -m "Body", clear'),
      ],
    }
  }
  if (cmd === 'npm' && t.slice(1).join(' ') === 'run dot') {
    return s.fixed
      ? { state: s, lines: [L('ok', '💜 Dotty: Token audit passed. Every value is a token. I could cry.')] }
      : { state: s, lines: [L('err', `💜 Dotty: I found 2 hard-coded values.`), L('err', `  ${FILE}:12  hex color: #6B5CE7`), L('err', `  ${FILE}:12  hex color: #5A4BD6`)] } // dot-ignore
  }
  if (['edit', 'code', 'open', 'nano', 'vim'].includes(cmd)) {
    if (sub !== FILE) return { state: s, lines: [L('err', `Try: edit ${FILE}`)] }
    if (s.branch === 'main') return { state: s, lines: [L('gus', "Gus: You're on main. Branch first. Then edit.")] }
    s.fixed = true
    return { state: s, lines: [L('ok', `✎ Put back bg-primary and hover:bg-primary/90 in ${FILE}. Saved. (Pretend edit.)`)] }
  }
  if (cmd !== 'git') return { state: s, ...unknown(input) }

  switch (sub) {
    case 'log': {
      s.ranLog = true
      const fileOnly = rest.includes('--') && rest[rest.indexOf('--') + 1]
      const list = fileOnly ? HISTORY.filter((c) => c.files.includes(rest[rest.indexOf('--') + 1])) : HISTORY
      if (!rest.includes('--oneline')) {
        return {
          state: s,
          lines: [
            ...list.slice(0, 2).flatMap((c) => [L('ok', `commit ${c.hash}`), L('out', `Author: ${c.author}`), L('out', `    ${c.subject}`), L('out', '')]),
            L('muted', '(…long. Try --oneline.)'),
          ],
        }
      }
      return { state: s, lines: list.map((c) => L('out', `${c.hash} ${c.subject}`)) }
    }
    case 'show': {
      const c = HISTORY.find((x) => rest[0] && x.hash.startsWith(rest[0].slice(0, 7)))
      if (!c) return { state: s, lines: [L('err', `fatal: ambiguous argument '${rest[0] ?? ''}': unknown revision`), L('muted', 'Copy a hash from git log.')] }
      if (c.hash === CULPRIT) s.inspected = true
      return {
        state: s,
        lines: [
          L('ok', `commit ${c.hash}`),
          L('out', `Author: ${c.author}`),
          L('out', `Date:   ${c.when}`),
          L('out', ''),
          L('out', `    ${c.subject}`),
          L('out', ''),
          ...c.files.map((f) => L('muted', `--- a/${f}`)),
          ...c.diff.map((d) => L(d.startsWith('+') ? 'ok' : d.startsWith('-') ? 'err' : 'out', d)),
        ],
      }
    }
    case 'blame': {
      if (rest[0] !== FILE) return { state: s, lines: [L('err', `Try: git blame ${FILE}`)] }
      s.inspected = true
      return { state: s, lines: BLAME.map((b) => L(b.hash === CULPRIT ? 'gus' : 'out', `${b.hash} (${b.author.padEnd(6)}) ${b.line}`)) }
    }
    case 'diff':
      return { state: s, lines: s.fixed && !s.staged ? [L('err', "-  default: 'bg-[#6B5CE7] …'"), L('ok', "+  default: 'bg-primary …'")] : [L('muted', '(no unstaged changes)')] } // dot-ignore
    case 'status': {
      const lines = [L('out', `On branch ${s.branch}`)]
      if (s.staged) lines.push(L('ok', `Changes to be committed:\n        modified:   ${FILE}`))
      else if (s.fixed && !s.committed) lines.push(L('err', `Changes not staged for commit:\n        modified:   ${FILE}`))
      else lines.push(L('out', 'nothing to commit, working tree clean'))
      return { state: s, lines }
    }
    case 'switch':
    case 'checkout': {
      const create = rest[0] === '-c' || rest[0] === '-b'
      const name = create ? rest[1] : rest[0]
      if (!name) return { state: s, lines: [L('err', 'fatal: missing branch name')] }
      if (!create && name !== 'main' && name !== s.branch) return { state: s, lines: [L('err', `error: no branch '${name}'. To make it: git switch -c ${name}`)] }
      s.branch = name
      if (create && !name.startsWith('fix/')) return { state: s, lines: [L('ok', `Switched to a new branch '${name}'`), L('gus', 'Gus: Fixes go on fix/… branches. Name tells me what it is before I open it.')] }
      return { state: s, lines: [L('ok', `Switched to ${create ? 'a new ' : ''}branch '${name}'`)] }
    }
    case 'add': {
      if (!s.fixed) return { state: s, lines: [L('muted', '(nothing changed yet; edit the file first)')] }
      s.staged = true
      return { state: s, lines: [L('muted', `Staged ${FILE}.`)] }
    }
    case 'commit': {
      if (rest.includes('-a') || rest.includes('-am')) s.staged = s.staged || s.fixed
      const ms: string[] = []
      rest.forEach((x, i) => (x === '-m' || x === '-am') && rest[i + 1] && ms.push(rest[i + 1]))
      if (!ms.length) return { state: s, lines: [L('err', 'This practice terminal needs messages inline: git commit -m "Subject" -m "Body"')] }
      if (!s.staged) return { state: s, lines: [L('err', 'nothing added to commit (use "git add" first, or commit -am)')] }
      if (s.branch === 'main') return { state: s, lines: [L('gus', 'Gus: Not on main.')] }
      const [subject, ...body] = ms
      const v = judgeCommit(subject)
      const named = body.join(' ').includes(CULPRIT) || subject.includes(CULPRIT)
      s.committed = { subject, named, ok: v.ok }
      s.staged = false
      const lines = [L('out', `[${s.branch} 2c7e9f0] ${subject}`), L('out', ' 1 file changed, 1 insertion(+), 1 deletion(-)')]
      if (!v.ok) lines.push(L('gus', `Gus: ${v.verdicts.find((x) => !x.pass)!.gus}`), L('muted', 'Fix it: git commit --amend -m "Better subject" -m "Introduced in …"'))
      else if (!named) lines.push(L('gus', 'Gus: Good subject. Now say where the bug came from. Add a body: -m "Introduced in <hash>."'), L('muted', 'Amend: git commit --amend -m "Subject" -m "Introduced in …"'))
      else lines.push(L('gus', 'Gus: Subject says what. Body says where it came from. That is a commit I can use in six months.'))
      return { state: s, lines }
    }
    default:
      return { state: s, ...unknown(input) }
  }
}

export const day2Sim: Sim<S> = {
  title: 'Practice terminal',
  description: 'A pretend repo with the same history as the real one (different hashes). Investigate, then fix it on a branch.',
  welcome: "You're in the-studio on main. Something broke the Button. Type `help` for commands.",
  initial: INITIAL,
  prompt: (s) => `~/the-studio (${s.branch}) $`,
  run,
  goals: [
    { id: 'log', label: 'Read the history', hint: `git log --oneline -- ${FILE}`, done: (s) => s.ranLog },
    { id: 'inspect', label: 'Inspect the suspect commit (show or blame)', hint: `git show ${CULPRIT}`, done: (s) => s.inspected },
    { id: 'branch', label: 'Make a fix/… branch', hint: 'git switch -c fix/button-color', done: (s) => s.branch.startsWith('fix/') },
    { id: 'edit', label: 'Put the tokens back', hint: `edit ${FILE}`, done: (s) => s.fixed },
    {
      id: 'commit',
      label: 'Commit with a body naming the culprit',
      hint: `git commit -am "Restore primary token on default Button" -m "Introduced in ${CULPRIT}."`,
      done: (s) => !!s.committed?.ok && s.committed.named,
    },
  ],
}
