/**
 * Cheat sheet entries, appended to CHEATSHEET.md when the coach passes a day.
 * Day 1's entry ships in CHEATSHEET.md already.
 */
export const CHEATSHEET = {
  2: `## Day 2: Reading history (log, diff, blame)

**The idea:** git remembers every version. Reading history is how you find out *what* changed, *who* changed it, and *why*, without asking around.

| I want to… | Command |
| --- | --- |
| See recent commits, one line each | \`git log --oneline\` |
| See commits that touched one file | \`git log --oneline -- <file>\` |
| See one commit in full | \`git show <hash>\` |
| See who last changed each line | \`git blame <file>\` |
| Compare two commits | \`git diff <old-hash> <new-hash>\` |
| Add a body to a commit message | \`git commit -m "Subject" -m "Body: the why."\` |

**Gus's tip:** a short hash (the first 7 characters) is enough to name a commit. Put it in your message when you fix someone's bug: "Introduced in 3fa94c1."`,

  3: `## Day 3: Pull requests and review

**The idea:** a pull request (PR) is a proposal: "please merge my branch into main." It is where review happens. Pushing more commits to the branch updates the PR automatically.

| I want to… | Command |
| --- | --- |
| Get the latest main | \`git switch main\` then \`git pull\` |
| Bring main's new commits into my branch | \`git switch <branch>\` then \`git merge main\` |
| Update an open PR | commit, then \`git push\` |
| Clean up after a merged PR | \`git switch main\`, \`git pull\`, \`git branch -d <branch>\` |

**On GitHub:** Pull requests → New pull request → base: \`main\`, compare: your branch. On a copy of a template, double-check the base repository is yours.`,

  4: `## Day 4: Merge conflicts

**The idea:** a conflict means two people changed the same lines and git won't guess who wins. You decide, then tell git you're done.

| I want to… | Command |
| --- | --- |
| Merge another branch into mine | \`git merge <branch>\` |
| See which files are conflicted | \`git status\` |
| Mark a file resolved | \`git add <file>\` |
| Finish the merge | \`git commit\` (the message is pre-written) |
| Give up and start over | \`git merge --abort\` |

**Reading the markers:**
\`\`\`
<<<<<<< HEAD
your version
=======
their version
>>>>>>> their-branch
\`\`\`
Keep what's right (sometimes a mix), delete all three marker lines, save.`,

  5: `## Day 5: stash, cherry-pick, rebase

**The idea:** real work gets interrupted. Stash parks unfinished changes. Cherry-pick copies one commit from anywhere. Rebase replays your commits on top of a newer base.

| I want to… | Command |
| --- | --- |
| Park unfinished changes | \`git stash\` |
| See parked changes | \`git stash list\` |
| Bring them back | \`git stash pop\` |
| Copy one commit onto my branch | \`git cherry-pick <hash>\` |
| Replay my branch on the latest main | \`git rebase main\` |
| Merge instead (keeps a merge commit) | \`git merge main\` |

**Gus's rule:** rebase your own branches freely. Never rebase a branch other people are using.`,

  6: `## Day 6: Building with AI, inside a design system

**The idea:** AI writes the first draft. You own the result. A good prompt names the file, the pattern to copy, the tokens to use, and the rules.

| I want to… | Command |
| --- | --- |
| Check for hard-coded values | \`npm run dot\` |
| Check types and tokens together | \`npm run check\` |
| See what the AI changed | \`git diff\` |
| Throw away an AI change to one file | \`git restore <file>\` |
| Stage part of a file | \`git add -p <file>\` |

**Dotty's prompt recipe:** "Create \`<file>\`. Follow the pattern in \`badge.tsx\` (cva variants). Use only tokens from \`tokens.css\`. No hex, no inline styles, no arbitrary values."`,

  7: `## Day 7: Reviewing AI code

**The idea:** AI code looks finished. Review it like a teammate's PR: tokens, accessibility, edge cases, and "does this already exist?"

| I want to… | Command |
| --- | --- |
| Check out someone's branch | \`git switch <branch>\` |
| See what a branch changes vs main | \`git diff main...<branch>\` |
| List the files it touches | \`git diff --name-only main...<branch>\` |

**Review checklist:** tokens only · no inline styles · real \`<button>\` for anything clickable · labels for screen readers · empty and zero states · reuse existing components.`,

  8: `## Day 8: Undoing a bad deploy

**The idea:** once a commit is shared, don't erase it. \`git revert\` adds a new commit that undoes it, so everyone's history stays intact.

| I want to… | Command |
| --- | --- |
| Find the bad commit | \`git log --oneline -- <file>\` |
| Undo one shared commit safely | \`git revert <hash>\` |
| Undo local, unpushed commits | \`git reset --soft HEAD~1\` (keeps changes) |
| Discard local changes to a file | \`git restore <file>\` |

**Never on shared branches:** \`git reset --hard\` + \`git push --force\`. It rewrites history everyone else has.`,

  9: `## Day 9: Ticket to merged PR

**The whole loop:**

1. \`git switch main\` and \`git pull\`
2. \`git switch -c feature/<name>\`
3. Small change → \`git add\` → \`git commit -m "…"\` (repeat)
4. \`git push -u origin feature/<name>\`
5. Open a PR, ask for review, push fixes
6. Merge, then \`git switch main\`, \`git pull\`, \`git branch -d feature/<name>\`

**Congratulations, Design Engineer.** Gus said LGTM. Frame it.`,
}
