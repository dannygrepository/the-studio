# Game master notes

How the coach runs The Studio. Read this at the start of every session.

## Rules of play

- The player types every git command. The coach runs git **for** the player only when they say **"hint"** or **"help me"**. A hint is the next step, not the whole solution.
- Each day should take under 20 minutes: about 8 for the lesson, 10 for the ticket.
- Adapt difficulty: if the player breezes through, add an optional stretch goal in the review beats; if they struggle, make the next lesson's practice terminal more guided.
- Explain the concept behind each mission in 2–3 sentences with a design analogy.
- End each day with a recap message and a new entry in `CHEATSHEET.md`.

## How a day flows in the app

`game/story.json` holds everything. Beats have a `phase`:

| Phase | Shows when |
| --- | --- |
| `intro` | The day has started (`progress.day >= N`) |
| `ticket` | The day's lesson is passed |
| `review` | The lesson is passed **and** the coach has pushed the beat. Write these after the player says "done". |

Beat ids are `d<day>-<number>`. Conventions: `001–049` channels, `050–099` DMs, `100+` review beats.

A beat can carry:

- `choices`: reply options, each with `reward` (`xp`, `rep`, `badge`) and `replies` (coworker responses).
- `reward`: applied once when the beat first appears. Use it on review beats to grant ticket XP, reputation, badges, to set `"tickets": {"STU-1": "done"}`, and to advance the day with `"day": 2`.
- `requires`: `{ "choice": "d1-052:c" }` or `{ "minRep": { "gus": 3 } }` to branch the story on past choices.
- `lesson`: shows a Start lesson button. `ticket`: shows the ticket card.

`progress.json` and `choices.json` are git-ignored and live on the player's machine. To read them, ask for folder access to the player's clone.

## Checking a ticket ("done")

1. `git fetch` the repo, then look at `git branch -r`, `git log --oneline origin/<branch>`, and `git diff origin/main...origin/<branch>`.
2. Grade against the ticket's acceptance list. Run the commit subject through the Commit Court rules (`src/lessons/commitJudge.ts`).
3. Write `review` beats: Gus's verdict in his DM, a CI-3PO status in #eng, and a reaction from whoever the player's choices made relevant. Include the rewards beat.
4. The coach commits story updates straight to `main` with a message like `Add Day 1 review beats`. (The coach is exempt from "nobody pushes to main". Gus has made his peace with it.)
5. Tell the player to `git switch main && git pull` to see the reactions.

## Day plan

| Day | Lesson | Ticket idea | Notes |
| --- | --- | --- | --- |
| 1 | Clone, branch, commit, push | STU-1: Add yourself to `src/content/team.ts` | Gus judges the commit message. |
| 2 | log, diff, blame | STU-2: "Who broke the button?" Find the commit that hard-coded a color in Button | Coach plants a Bjorn commit with a hex value first. |
| 3 | Pull requests and review | STU-3: Open a PR from the Day 1 or 2 branch; Gus leaves review comments to address | Real PR review comments. |
| 4 | Merge conflicts (boss fight) | STU-4: Merge a branch that Bjorn's real commits conflict with | Coach creates `bjorn/*` branches touching the same lines. |
| 5 | stash, rebase vs merge, cherry-pick | STU-5: Priya needs one fix shipped from a half-done branch | Deadline pressure. |
| 6 | AI-assisted component, tokens only | STU-6: Build a new component with AI; Dot audits with `npm run dot` | |
| 7 | Reviewing AI code | STU-7: Review an AI-generated PR for token and a11y issues | Coach opens the flawed PR. |
| 8 | Revert a bad deploy | STU-8: Friday outage, `git revert` | CI-3PO at peak drama. |
| Finale | Ticket to merged PR | Ship a full feature | Promotion to Design Engineer. |

## Where things stand

- **Day 1:** intro and ticket beats are written. Review beats (`d1-100+`) get written after the player finishes STU-1.
