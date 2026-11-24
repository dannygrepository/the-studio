/**
 * Gus's commit rules for the coach script. Mirrors src/lessons/commitJudge.ts
 * (the app's version). If you change one, change both.
 */
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

/** Returns the list of broken rules (empty = passes Commit Court). */
export function commitProblems(subject) {
  const words = subject.split(/\s+/).filter(Boolean)
  const first = (words[0] ?? '').toLowerCase().replace(/[^a-z]/g, '')
  const lower = subject.toLowerCase().replace(/[^a-z ]/g, '').trim()
  const problems = []
  if (!(words.length >= 3 && !VAGUE.has(lower) && !lower.split(' ').every((w) => VAGUE.has(w)))) problems.push('too vague')
  if (!first || NON_IMPERATIVE.has(first)) problems.push(`not imperative ("${words[0] ?? ''}")`)
  if (!/^[A-Z]/.test(subject)) problems.push('not capitalized')
  if (subject.endsWith('.')) problems.push('ends with a period')
  if (subject.length > 50) problems.push(`${subject.length} characters (max 50)`)
  return problems
}

/** Git's own generated subjects are fine: merges and reverts. */
export function isGeneratedSubject(subject) {
  return /^Merge (branch|pull request|remote-tracking branch)/.test(subject) || /^Revert "/.test(subject)
}
