# The Studio 🎨💬

A workplace-comedy game that teaches git, the product development workflow, and AI-assisted React work inside a design system. Nine short days, about 20 minutes each.

The app looks like a team chat. It's also the codebase you practice on. Your coach is Claude, in Claude Code.

## Before you start

You need:

- **Node 20 or newer** (`node -v`)
- **git**, with your name and email set:
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "you@example.com"
  ```
- A **GitHub account** that can push from your laptop (if `git push` has never asked you to sign in, it will the first time; that's fine)
- **Claude Code** ([install guide](https://docs.claude.com/en/docs/claude-code))

## Set up your copy

Everyone plays in their **own** repo, so your coach can set up your story without touching anyone else's.

1. On this repo's GitHub page, click **Use this template** → **Create a new repository**. Put it under your account. Private is fine.
2. Clone **your** new repo and start the app:
   ```bash
   git clone <your-repo-url>
   cd the-studio
   npm install
   npm run dev
   ```
   Open the URL it prints (usually http://localhost:5173).
3. In a second terminal, in the same folder, start your coach:
   ```bash
   claude
   ```
   Say hi. The coach takes it from there.

## How a day works

1. **Read the chat.** Coworkers post the day's story in channels and DMs. Your replies change your reputation and later story beats.
2. **Take the lesson** in **Studio Academy**: something to click, a quiz, and a practice terminal.
3. **Do the ticket** in your real terminal, typing the git commands yourself.
4. **Say "done"** to your coach in Claude Code. The coach checks your work and posts the team's reactions. Run `git switch main` and `git pull` to see them.

Say **"hint"** to your coach for the next step, or **"help me"** if you're really stuck.

## What's where

| Path | What it is |
| --- | --- |
| `src/styles/tokens.css` | **The design tokens.** Every color, spacing step, type size and radius. shadcn/ui CSS-variable convention. |
| `src/components/ui/` | shadcn/ui components: Button, Card, Avatar, Badge. Tokens only. |
| `src/components/chat/` | The chat app, built from those components. |
| `src/lessons/` | Studio Academy lessons, one folder per day. |
| `src/content/team.ts` | The team directory. Your Day 1 ticket lives here. |
| `src/content/onboarding.ts` | The first-launch welcome (who's who, how a day works). |
| `src/content/gitDictionary.ts` | Plain-language meanings for every git word. Hover a dotted word in any command. |
| `game/story.json` | All story content: cast, channels, tickets, and messages. |
| `game/reviews.json` | Your coach's verdicts on your tickets. Written by the coach. |
| `game/progress.json` | Your day, XP, reputation, and badges. Written by the app, git-ignored. |
| `game/choices.json` | Every reply you picked. Written by the app, git-ignored. |
| `CHEATSHEET.md` | Your growing git cheat sheet. A new entry lands each day you pass. |
| `CAST.md` | Who's who, and how they talk. |
| `CLAUDE.md`, `GAME_MASTER.md`, `scripts/coach.mjs` | How the coach runs the game. Spoilers. |

## Dotty's token audit

```bash
npm run dot     # fails on hex colors, rgb(), p-[13px], bg-[#fff], inline styles
npm run check   # type check + token audit
```

Only `src/styles/tokens.css` may contain raw values.

## Resetting

The **Reset game** button in the right panel wipes your save (`progress.json` and `choices.json`). It doesn't undo git history; for a truly fresh start, make a new copy from the template.
