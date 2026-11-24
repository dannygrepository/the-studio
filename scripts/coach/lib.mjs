/**
 * Shared helpers for the coach script. Nothing here is player-facing.
 */
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export const ROOT = path.resolve(import.meta.dirname, '..', '..')

/** The fictional coworkers' git identities. Their domain marks "not the player". */
export const PEOPLE = {
  coach: { name: 'Studio Coach', email: 'coach@the-studio.dev' },
  gus: { name: 'Gus Okafor', email: 'gus@the-studio.dev' },
  priya: { name: 'Priya Raman', email: 'priya@the-studio.dev' },
  dot: { name: 'Dotty Lindqvist', email: 'dotty@the-studio.dev' },
  bjorn: { name: 'Bjorn Halvorsen', email: 'bjorn@the-studio.dev' },
  ci3po: { name: 'CI-3PO', email: 'ci3po@the-studio.dev' },
  ai: { name: 'Bjorn Halvorsen (via AI)', email: 'bjorn@the-studio.dev' },
}
export const STUDIO_DOMAIN = '@the-studio.dev'

/** Run git in a directory and return trimmed stdout. Throws on failure. */
export function git(args, { cwd = ROOT, env, allowFail = false } = {}) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, ...env } })
  if (r.status !== 0 && !allowFail) {
    throw new Error(`git ${args.join(' ')} failed:\n${r.stderr || r.stdout}`)
  }
  return allowFail && r.status !== 0 ? null : (r.stdout ?? '').trim()
}

export function tryGit(args, opts = {}) {
  return git(args, { ...opts, allowFail: true })
}

/** File contents at a ref, or null if it doesn't exist there. */
export function show(ref, file, cwd = ROOT) {
  return tryGit(['show', `${ref}:${file}`], { cwd })
}

export function refExists(ref, cwd = ROOT) {
  return tryGit(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], { cwd }) !== null
}

export function remoteBranches(prefix = '', cwd = ROOT) {
  const out = tryGit(['for-each-ref', '--format=%(refname:strip=3)', `refs/remotes/origin/${prefix}`], { cwd }) ?? ''
  return out
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s && s !== 'HEAD')
}

export function fetch(cwd = ROOT) {
  return tryGit(['fetch', 'origin', '--prune', '--quiet'], { cwd }) !== null
}

/** Commits in `range` (oldest first) with metadata. */
export function commits(range, cwd = ROOT, extra = []) {
  const SEP = '\u001f'
  const out = tryGit(['log', '--reverse', `--format=%H${SEP}%P${SEP}%an${SEP}%ae${SEP}%s${SEP}%B%x1e`, ...extra, range], { cwd })
  if (!out) return []
  return out
    .split('\u001e')
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => {
      const [hash, parents, author, email, subject, body] = r.split(SEP)
      return { hash, short: hash.slice(0, 7), parents: parents.split(' ').filter(Boolean), author, email, subject, body: body ?? '' }
    })
}

export function changedFiles(from, to, cwd = ROOT) {
  const out = tryGit(['diff', '--name-only', `${from}...${to}`], { cwd }) ?? ''
  return out.split('\n').filter(Boolean)
}

export function isAncestor(a, b, cwd = ROOT) {
  return spawnSync('git', ['merge-base', '--is-ancestor', a, b], { cwd }).status === 0
}

/** Is the remote GitHub? (Pull request refs only exist there.) */
export function remoteUrl(cwd = ROOT) {
  return tryGit(['remote', 'get-url', 'origin'], { cwd }) ?? ''
}

export function pullRequestCount(cwd = ROOT) {
  const out = tryGit(['ls-remote', 'origin', 'refs/pull/*/head'], { cwd })
  if (out === null) return null
  return out.split('\n').filter(Boolean).length
}

/**
 * Do work on a fresh checkout of origin/<base> in a temp folder, so the
 * player's own working tree and branch are never touched.
 */
export function withWorktree(base, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-coach-'))
  git(['worktree', 'add', '--detach', '--quiet', dir, base])
  try {
    return fn(dir)
  } finally {
    tryGit(['worktree', 'remove', '--force', dir])
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

/** Commit everything in `cwd` as one of the cast. */
export function commitAs(cwd, who, message, minutesAgo = 0, { allowEmpty = false } = {}) {
  const p = PEOPLE[who]
  const date = new Date(Date.now() - minutesAgo * 60_000).toISOString()
  git(['add', '-A'], { cwd })
  git(['commit', '--quiet', ...(allowEmpty ? ['--allow-empty'] : []), '-m', message], {
    cwd,
    env: {
      GIT_AUTHOR_NAME: p.name,
      GIT_AUTHOR_EMAIL: p.email,
      GIT_COMMITTER_NAME: p.name,
      GIT_COMMITTER_EMAIL: p.email,
      GIT_AUTHOR_DATE: date,
      GIT_COMMITTER_DATE: date,
    },
  })
  return git(['rev-parse', 'HEAD'], { cwd })
}

/** The player's git email in this clone (how we tell their commits apart). */
export function playerEmail(cwd = ROOT) {
  return tryGit(['config', 'user.email'], { cwd }) || null
}

export function read(cwd, file) {
  return fs.readFileSync(path.join(cwd, file), 'utf8')
}

export function write(cwd, file, text) {
  const full = path.join(cwd, file)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, text)
}

/** Replace exactly one occurrence, or explain loudly. */
export function replaceOnce(text, from, to, label) {
  if (!text.includes(from)) throw new Error(`Setup could not find the expected text for: ${label}`)
  return text.replace(from, to)
}

export function edit(cwd, file, fn) {
  write(cwd, file, fn(read(cwd, file)))
}

/** Run the token audit and type check against a folder (a worktree of some ref). */
export function runChecks(cwd) {
  const nm = path.join(cwd, 'node_modules')
  if (!fs.existsSync(nm) && fs.existsSync(path.join(ROOT, 'node_modules'))) {
    fs.symlinkSync(path.join(ROOT, 'node_modules'), nm, 'dir')
  }
  const dot = spawnSync('node', ['scripts/dot-audit.mjs'], { cwd, encoding: 'utf8' })
  const tsc = spawnSync('npx', ['--no-install', 'tsc', '-p', 'tsconfig.app.json', '--noEmit'], { cwd, encoding: 'utf8' })
  return {
    dot: { ok: dot.status === 0, out: (dot.stdout + dot.stderr).trim() },
    types: { ok: tsc.status === 0, out: (tsc.stdout + tsc.stderr).trim() },
  }
}

/** Check a ref in a throwaway worktree. */
export function checkRef(ref) {
  return withWorktree(ref, (dir) => runChecks(dir))
}

export function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'))
  } catch {
    return fallback
  }
}

export function sh(cmd, args, cwd = ROOT) {
  return execFileSync(cmd, args, { cwd, encoding: 'utf8' })
}
