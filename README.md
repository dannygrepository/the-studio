# The Studio 🎨💬

A workplace-comedy game that teaches git, the product development workflow, and AI-assisted React work inside a design system.

The app looks like a team chat. It's also the codebase you practice on.

## Run it

You need Node 20 or newer (`node -v`).

```bash
git clone https://github.com/dannygrepository/the-studio.git
cd the-studio
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## How a day works

1. **Read the chat.** Your coworkers post the day's story in the channels and DMs. Pick replies; they change your reputation and later story beats.
2. **Take the lesson.** Each day starts in **Studio Academy** with an interactive lesson: a clickable diagram, a quiz, and a practice terminal that checks your commands.
3. **Do the ticket.** Passing the lesson unlocks a real ticket. Do it in your real terminal, typing the git commands yourself.
4. **Say "done"** to your coach. The coach inspects the repo, then pushes coworker reactions to `game/story.json`. Run `git pull` on main to see them.
5. **Recap.** Each day ends with a new entry in [CHEATSHEET.md](CHEATSHEET.md).

Say **"hint"** or **"help me"** to your coach if you're stuck.

## What's where

| Path | What it is |
| --- | --- |
| `src/styles/tokens.css` | **The design tokens.** Every color, spacing step, type size and radius. shadcn/ui CSS-variable convention. |
| `src/components/ui/` | shadcn/ui components: Button, Card, Avatar, Badge. Tokens only. |
| `src/components/chat/` | The chat app, built from those components. |
| `src/lessons/` | Studio Academy lessons, one folder per day. |
| `src/content/onboarding.ts` | Copy for the first-launch welcome (who's who, how a day works). Replay it from the right panel. |
| `src/content/gitDictionary.ts` | Plain-language meaning of every git word. Powers hover definitions on commands and the Git dictionary page. |
| `src/content/team.ts` | The team directory. Your Day 1 ticket lives here. |
| `game/story.json` | All story content: cast, channels, tickets, and message beats. |
| `game/progress.json` | Your day, XP, reputation, and badges. Written by the app, git-ignored. |
| `game/choices.json` | Every reply you picked. Written by the app, git-ignored. |
| `CAST.md` | Who's who, and how they talk. |
| `CHEATSHEET.md` | Your growing git cheat sheet. |
| `GAME_MASTER.md` | Notes for the coach on how to run each day. |

## Dotty's token audit

```bash
npm run dot     # fails on hex colors, rgb(), p-[13px], bg-[#fff], inline styles
npm run check   # type check + token audit
```

Only `src/styles/tokens.css` may contain raw values.

## Resetting

The **Reset game** button in the right panel wipes `progress.json` and `choices.json`.
