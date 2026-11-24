/**
 * Gus's commit message rules. Used by the Commit Court quiz and the practice
 * terminal. Based on the classic "seven rules" of git commit messages.
 */
export interface Verdict {
  rule: string
  pass: boolean
  gus: string
}

const NON_IMPERATIVE = new Set([
  'added', 'adds', 'adding', 'fixed', 'fixes', 'fixing', 'updated', 'updates', 'updating',
  'changed', 'changes', 'changing', 'removed', 'removes', 'removing', 'made', 'makes', 'making',
  'created', 'creates', 'creating', 'moved', 'moves', 'moving', 'renamed', 'renames', 'tweaked',
  'tweaks', 'refactored', 'refactors', 'implemented', 'implements',
])

const VAGUE = new Set([
  'stuff', 'fix', 'fixes', 'update', 'updates', 'changes', 'wip', 'asdf', 'misc', 'minor',
  'final', 'test', 'tmp', 'oops', 'things', 'work', 'edits', 'commit', 'save',
])

export function judgeCommit(message: string): { ok: boolean; verdicts: Verdict[] } {
  const subject = message.trim().split('\n')[0] ?? ''
  const words = subject.split(/\s+/).filter(Boolean)
  const first = (words[0] ?? '').toLowerCase().replace(/[^a-z]/g, '')
  const lower = subject.toLowerCase().replace(/[^a-z ]/g, '').trim()

  const verdicts: Verdict[] = [
    {
      rule: 'Says what changed (not vague)',
      pass: words.length >= 3 && !VAGUE.has(lower) && !lower.split(' ').every((w) => VAGUE.has(w)),
      gus: '"Changes." Wow. Thanks. Future me will know exactly what you did. Name the actual change.',
    },
    {
      rule: 'Imperative mood ("Add", not "Added")',
      pass: !!first && !NON_IMPERATIVE.has(first),
      gus: `"${words[0] ?? ''}"? A commit message completes the sentence "If applied, this commit will..." Use the command form: Add, Fix, Update.`,
    },
    {
      rule: 'Starts with a capital letter',
      pass: /^[A-Z]/.test(subject),
      gus: 'Capital letter at the start. You design for a living. You know about type hierarchy.',
    },
    {
      rule: 'No period at the end',
      pass: !subject.endsWith('.'),
      gus: "It's a subject line, not a sentence in a novel. Drop the period.",
    },
    {
      rule: '50 characters or fewer',
      pass: subject.length > 0 && subject.length <= 50,
      gus: `${subject.length} characters. Subject lines get truncated in every tool I use. Keep it to 50.`,
    },
  ]
  return { ok: verdicts.every((v) => v.pass), verdicts }
}
