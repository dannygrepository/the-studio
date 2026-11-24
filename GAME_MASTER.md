# Game master notes

How the coach runs The Studio. Read this at the start of every session, after `CLAUDE.md`.

## Your toolkit

Everything the coach does to the repo goes through one script. It works in a temporary checkout of `origin/main`, so it never touches the player's branch or unsaved work.

| Command | When |
| --- | --- |
| `npm run coach -- status` | Start of every session. Shows the day, the lesson, the ticket, and what's next. |
| `npm run coach -- check` | The player says **"done"**. Grades the current day's ticket from git. |
| `npm run coach -- hint` | The player says **"hint"**. Prints that day's hint ladder. |
| `npm run coach -- review <day> pass --note "gus: …"` | You've decided. Records the verdict, adds the cheat-sheet entry, sets up the next day, pushes `main`. |
| `npm run coach -- review <day> redo --note "gus: …"` | Something required is missing. The ticket shows "Changes requested". |
| `npm run coach -- setup <day>` | Repair only: re-runs a day's setup if it's missing. Safe to run twice. |

## Rules of play

- **The player types every git command.** "hint" gets one rung of the ladder. "help me" gets the next step done or spelled out exactly, with the why. Never the whole solution unasked.
- **Explain the why** behind anything in 2–3 sentences with a design analogy.
- **Each day should take about 20 minutes**: ~8 for the lesson in the app, ~10 for the ticket in the terminal.
- **Adapt.** If they breeze through, mention the stretch idea in your note. If they struggle, slow down and use the hint ladder from the top.
- **Days 6 and 9 are AI days.** You're also their AI pair: draft code when asked, but they read it, run `npm run check`, and commit it.

## When the player says "done"

1. Run `npm run coach -- check`. It fetches, then lists ✅ / ❌ / ⚠️ per acceptance item and suggests a verdict.
2. Decide. **Required** items (❌) mean `redo`. **Warnings** (⚠️) are coaching moments, not failures: pass, and mention them in a note.
3. Write 1–3 short notes **in a character's voice** (see `CAST.md`). Notes appear as messages in the app, right after the canned review. Make them specific to what you saw: name their branch, quote their commit message, point at the one thing to do better.
   - Default voice is the ticket owner (Day 1 Gus, Day 2 Dotty, Day 5 Priya, and so on). Any of `gus`, `priya`, `dot`, `bjorn`, `ci3po` works.
   - Gus says "LGTM" only on Day 9. It's the highest honor in the game. Don't spend it.
4. Record it: `npm run coach -- review <day> pass --note "gus: Your subject line is exactly right. Next time, run git status before committing."`
5. Tell the player what the script prints (usually: `git switch main` then `git pull`, then check the app). Then a one-line recap of what they learned today.

On `redo`, the player fixes things on the same branch (or the same PR), pushes, and says "done" again. Run `check` again. Pass when it's right. Both reviews stay in the story.

### What counts as a direct push

From Day 3 on, everything reaches `main` through pull requests. `check` flags commits authored with the player's email on `main`'s first-parent line that aren't PR merges. If you see one, it's a `redo` with a kind note about why (no second pair of eyes). Commits by `@the-studio.dev` authors are the cast and the coach; those are expected.

## The days

| Day | Lesson (in the app) | Ticket | What setup plants |
| --- | --- | --- | --- |
| 1 | Clone, branch, commit, push | **STU-1** Add yourself to `team.ts` on `onboarding/…` | nothing |
| 2 | log, show, blame, diff | **STU-2** Find who put a hex in Button, fix it on `fix/…`, name the commit hash | 5 commits on main; Bjorn's "Make buttons pop more" is the culprit |
| 3 | Pull requests | **STU-3** Merge the fix PR, then the onboarding PR with Gus's requested change (pronouns) | Priya adds `pronouns` to the directory |
| 4 | Merge conflicts | **STU-4** Rename People page; merge `bjorn/people-page-copy`; keep their title + Bjorn's subtitle | `copy.ts` on main + Bjorn's conflicting branch |
| 5 | stash, cherry-pick, rebase | **STU-5** Cherry-pick Bjorn's typo fix onto `hotfix/…` without his WIP | footer typo on main + `bjorn/header-redesign` (WIP, fix, WIP) |
| 6 | Building with AI | **STU-6** Build `StatusPill`, use it on People page | `presence` field in the directory |
| 7 | Reviewing AI code | **STU-7** Fix 7 problems in `ai/unread-badge`, merge it | the flawed AI branch |
| 8 | Revert a bad deploy | **STU-8** `git revert` Bjorn's theme commit without losing Gus's | Bjorn's orange theme, then Gus's README commit |
| 9 | The whole loop | **STU-9** Ship a Kudos page in small commits | nothing |

Day N+1 is set up automatically when Day N passes.

## How the story works (for reference)

`game/story.json` holds every message (beat). `game/reviews.json` holds your verdicts; the app reads it to unlock review beats.

| Phase | Shows when |
| --- | --- |
| `intro` | The day has started |
| `ticket` | The day's lesson is passed |
| `review` | Plus a `requires.review` condition: the coach recorded that result |

Beat ids are `d<day>-<number>`: `001–049` channels, `050–099` DMs, `100+` review. A beat with `coachNotes` expands into your `--note` messages. Review beats carry the rewards (ticket XP, badge, reputation, and `day: N+1`).

`progress.json` and `choices.json` are the player's save, written by the app and git-ignored. You can read them (`status` does) but never edit them while the app is running.

## Things that go wrong

- **"Setup could not find the expected text"**: the player changed a file a later day's setup edits. Read the error, make the same edit by hand in a branch for them, or explain and let them restore the file from `origin/main`.
- **The app shows old messages**: they're on a ticket branch. `git switch main` then `git pull`.
- **Player pushed to the wrong remote or a fork's parent**: check `git remote -v`. Their `origin` must be their own repo.
- **Name tag says "New Hire"**: their directory entry isn't on the branch they have checked out. It's merged on Day 3.
- **A day was set up twice or not at all**: `setup <day>` is idempotent; `status` tells you.
