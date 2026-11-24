# The Studio git cheat sheet

One entry per day. Add to it, don't rewrite it.

---

## Day 1: Clone, branch, commit, push

**The idea:** a commit is a named version of the whole project. A branch is a duplicate page for exploring without touching `main`. Push publishes your versions so the team can see them.

| I want to… | Command |
| --- | --- |
| Get a copy of a repo | `git clone <url>` |
| See where I am and what changed | `git status` |
| Start fresh from the latest main | `git switch main` then `git pull` |
| Make a branch and switch to it | `git switch -c <branch-name>` (older: `git checkout -b`) |
| See exactly what changed | `git diff` |
| Stage a file for the next commit | `git add <file>` (or `git add .` for everything) |
| Commit with a message | `git commit -m "Add thing that does X"` |
| Fix the last message (before pushing) | `git commit --amend -m "Better message"` |
| Push a new branch the first time | `git push -u origin <branch-name>` |
| Push again later | `git push` |
| See history, one line each | `git log --oneline` |

**Gus's commit rules:** finish the sentence "If applied, this commit will…". Imperative (Add, Fix, Remove), capitalized, no period, 50 characters or fewer, and specific.

**Branch names:** lowercase, dashes, a prefix for the kind of work: `onboarding/add-dan`, `fix/send-button-overlap`.
