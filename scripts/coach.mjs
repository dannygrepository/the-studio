#!/usr/bin/env node
/**
 * The coach's toolkit. Run by Claude (the coach), not by the player.
 *
 *   npm run coach -- status            Where the player is and what to do next
 *   npm run coach -- check [day]       Grade the day's ticket against git
 *   npm run coach -- hint [day] [n]    The hint ladder for a day
 *   npm run coach -- review <day> pass|redo [--note "gus: text"]...
 *                                      Record a verdict, unlock the team's
 *                                      reactions, set up the next day, push main
 *   npm run coach -- setup <day>       (Re)run a day's git setup (idempotent)
 *
 * Everything that changes the repo happens in a temporary worktree of
 * origin/main, so the player's branch and unsaved work are never touched.
 */
import fs from 'node:fs'
import path from 'node:path'

import { CHEATSHEET } from './coach/cheatsheet.mjs'
import { DAYS, LAST_DAY } from './coach/days.mjs'
import { ROOT, STUDIO_DOMAIN, commitAs, commits, fetch, git, readJson, tryGit, withWorktree } from './coach/lib.mjs'

const [cmd, ...args] = process.argv.slice(2)
const CAST = ['gus', 'priya', 'dot', 'bjorn', 'ci3po']

function progress() {
  return readJson('game/progress.json', { day: 1, lessons: {} })
}

function reviewsAt(ref) {
  try {
    return JSON.parse(git(['show', `${ref}:game/reviews.json`]))
  } catch {
    return {}
  }
}

function passed(reviews, ticket) {
  return (reviews[ticket] ?? []).some((a) => a.result === 'pass')
}

/** The first day whose ticket hasn't passed yet. */
function currentDay(reviews) {
  for (let d = 1; d <= LAST_DAY; d++) if (!passed(reviews, DAYS[d].ticket)) return d
  return null
}

function setupDone(day) {
  return commits('origin/main', undefined, ['--fixed-strings', `--grep=Set up Day ${day}`]).some((c) => c.email.endsWith(STUDIO_DOMAIN))
}

function runSetup(dir, day) {
  const extra = DAYS[day].setup?.(dir) ?? []
  commitAs(dir, 'coach', `Set up Day ${day}`, 0)
  return extra
}

function printChecks(day) {
  const d = DAYS[day]
  console.log(`\nDay ${day} · ${d.ticket}: ${d.title}\n`)
  const results = d.check()
  for (const r of results) {
    const mark = r.ok ? '✅' : r.level === 'warn' ? '⚠️ ' : r.level === 'info' ? 'ℹ️ ' : '❌'
    console.log(`${mark} ${r.label}${r.detail ? `\n     ${r.detail}` : ''}`)
  }
  const failing = results.filter((r) => !r.ok && r.level === 'required')
  const warnings = results.filter((r) => !r.ok && r.level === 'warn')
  console.log(
    `\nSuggested verdict: ${failing.length ? 'REDO' : 'PASS'}` +
      (failing.length ? ` (${failing.length} required item${failing.length > 1 ? 's' : ''} missing)` : '') +
      (warnings.length ? ` · ${warnings.length} thing${warnings.length > 1 ? 's' : ''} worth a coaching note` : ''),
  )
  console.log('You decide. Explain the why behind anything that failed, in 2-3 sentences with a design analogy.\n')
  return { failing, warnings }
}

function parseNotes(list) {
  const notes = []
  for (let i = 0; i < list.length; i++) {
    if (list[i] !== '--note') continue
    const raw = list[++i] ?? ''
    const m = raw.match(/^\s*(\w+)\s*:\s*([\s\S]+)$/)
    if (!m || !CAST.includes(m[1])) {
      console.error(`Bad --note "${raw}". Use "gus: text" (one of: ${CAST.join(', ')}).`)
      process.exit(1)
    }
    notes.push({ from: m[1], text: m[2].trim() })
  }
  return notes
}

/* ------------------------------------------------------------------ */

switch (cmd) {
  case 'status': {
    fetch()
    const reviews = reviewsAt('origin/main')
    const p = progress()
    const day = currentDay(reviews)
    console.log('\nThe Studio · coach status\n')
    console.log(`Branch checked out: ${tryGit(['branch', '--show-current']) || '(detached)'}`)
    console.log(`App save: day ${p.day}, ${p.xp ?? 0} XP, lessons passed: ${Object.entries(p.lessons ?? {}).filter(([, l]) => l.passed).map(([k]) => k).join(', ') || 'none'}`)
    if (day === null) {
      console.log('\nAll nine tickets passed. The game is complete. 🎉\n')
      break
    }
    const d = DAYS[day]
    const lessonPassed = p.lessons?.[`day${day}`]?.passed
    console.log(`\nCurrent: Day ${day} · ${d.ticket}: ${d.title}`)
    console.log(`  Day ${day} setup on main: ${day === 1 || setupDone(day) ? 'yes' : 'NO, run `npm run coach -- setup ' + day + '`'}`)
    console.log(`  Day ${day} lesson passed in the app: ${lessonPassed ? 'yes' : 'not yet'}`)
    const attempts = reviews[d.ticket] ?? []
    if (attempts.length) console.log(`  Reviews so far: ${attempts.map((a) => a.result).join(' → ')}`)
    console.log(
      `\nNext: ${
        !lessonPassed
          ? `the player does the Day ${day} lesson in Studio Academy (in the app), then the ticket.`
          : `the player does ${d.ticket} in their terminal, then says "done". Then: npm run coach -- check ${day}`
      }\n`,
    )
    break
  }

  case 'check': {
    fetch()
    const day = Number(args[0]) || currentDay(reviewsAt('origin/main'))
    if (!day || !DAYS[day]) {
      console.log('Nothing to check: all tickets passed.')
      break
    }
    printChecks(day)
    break
  }

  case 'hint': {
    const day = Number(args[0]) || currentDay(reviewsAt('origin/main')) || LAST_DAY
    const n = Number(args[1]) || 0
    const hints = DAYS[day].hints
    console.log(`\nDay ${day} hint ladder (give ONE rung at a time, starting from the top):\n`)
    hints.forEach((h, i) => console.log(`${i + 1}${n && i + 1 === n ? ' →' : '.'} ${h}`))
    console.log('')
    break
  }

  case 'setup': {
    const day = Number(args[0])
    if (!DAYS[day]) {
      console.error('Usage: npm run coach -- setup <day 1-9>')
      process.exit(1)
    }
    fetch()
    if (setupDone(day)) {
      console.log(`Day ${day} is already set up on origin/main. Nothing to do.`)
      break
    }
    withWorktree('origin/main', (dir) => {
      const extra = runSetup(dir, day)
      git(['push', '--quiet', 'origin', 'HEAD:refs/heads/main'], { cwd: dir })
      console.log(`Day ${day} set up and pushed to main.${extra.length ? ` Branches published: ${extra.join(', ')}` : ''}`)
    })
    break
  }

  case 'review': {
    const day = Number(args[0])
    const result = args[1]
    if (!DAYS[day] || !['pass', 'redo'].includes(result)) {
      console.error('Usage: npm run coach -- review <day> pass|redo [--note "gus: text"]...')
      process.exit(1)
    }
    const notes = parseNotes(args.slice(2))
    const d = DAYS[day]
    fetch()
    withWorktree('origin/main', (dir) => {
      const file = path.join(dir, 'game', 'reviews.json')
      const reviews = JSON.parse(fs.readFileSync(file, 'utf8'))
      const alreadyPassed = passed(reviews, d.ticket)
      reviews[d.ticket] = [...(reviews[d.ticket] ?? []), { result, at: new Date().toISOString(), ...(notes.length ? { notes } : {}) }]
      fs.writeFileSync(file, JSON.stringify(reviews, null, 2) + '\n')
      if (result === 'pass' && !alreadyPassed && CHEATSHEET[day]) {
        const sheet = path.join(dir, 'CHEATSHEET.md')
        fs.writeFileSync(sheet, `${fs.readFileSync(sheet, 'utf8').trimEnd()}\n\n---\n\n${CHEATSHEET[day]}\n`)
      }
      commitAs(dir, 'coach', `Record ${d.ticket} review: ${result}`, 1)
      let extra = []
      const next = day + 1
      if (result === 'pass' && DAYS[next] && !setupDone(next)) extra = runSetup(dir, next)
      git(['push', '--quiet', 'origin', 'HEAD:refs/heads/main'], { cwd: dir })
      console.log(`\nRecorded ${d.ticket}: ${result}${notes.length ? ` with ${notes.length} note(s)` : ''}. Pushed to main.`)
      if (extra.length) console.log(`Published for Day ${next}: ${extra.join(', ')}`)
      if (result === 'pass' && DAYS[next]) console.log(`Day ${next} is set up.`)
    })
    console.log(`\nTell the player: ${result === 'pass' ? d.tell : 'Run `git switch main` then `git pull` and read your DMs: changes were requested. Fix them on the same branch, push, and say "done" again.'}\n`)
    break
  }

  default:
    console.log(fs.readFileSync(path.join(ROOT, 'scripts', 'coach.mjs'), 'utf8').split('*/')[0].replace(/^#!.*\n\/\*\*?/, '').replace(/^ \* ?/gm, ''))
}

