import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { CastAvatar } from '@/components/chat/CastAvatar'
import { Button } from '@/components/ui/button'
import { coachPhrases, daySteps, intros } from '@/content/onboarding'
import { useGame } from '@/game/GameContext'
import { cn } from '@/lib/utils'

const STEPS = ['Welcome', 'The team', 'Your day', 'Your coach', 'Start'] as const

function Welcome() {
  return (
    <div className="flex flex-col gap-4 text-base">
      <p>
        You're the new <strong>Product Designer</strong> at The Studio, a small product team. Over
        the next nine days you'll learn to ship real code: git, pull requests, merge conflicts, and
        building with AI inside a design system.
      </p>
      <p>
        This app looks like a team chat. <strong>It's also the codebase you'll practice on.</strong>{' '}
        When a coworker asks you to change something, you change it in this repo, from your own
        terminal.
      </p>
      <p className="text-muted-foreground">
        No coding background needed. Everyone here is nice. Even Gus. Especially Gus, though he'd
        never admit it.
      </p>
    </div>
  )
}

function Team() {
  const { story } = useGame()
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {intros.map((intro, i) => {
        const member = story.cast[intro.id]
        return (
          <li
            key={intro.id}
            className={cn(
              'flex gap-3 rounded-lg border bg-card p-3',
              i === intros.length - 1 && 'sm:col-span-2',
            )}
          >
            <CastAvatar member={member} size="xl" />
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-semibold">{member.name}</span>
                <span className="text-xs text-muted-foreground">{member.role}</span>
              </div>
              <p className="text-sm">“{intro.hello}”</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Wins them over:</span> {intro.wins}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function Day() {
  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-3">
        {daySteps.map((s, i) => (
          <li key={s.title} className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {i + 1}
            </span>
            <div>
              <div className="font-semibold">{s.title}</div>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="rounded-lg bg-accent p-3 text-sm text-accent-foreground">
        Stuck? Say <strong>“hint”</strong> to your coach in Claude Code. A day takes about 20
        minutes. Your XP, reputation, and badges live in the panel on the right.
      </p>
    </div>
  )
}

function Coach() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-base">
        Your coach is <strong>Claude</strong>, in <strong>Claude Code</strong>: the window where you
        started this game. The coach isn't in this chat app. Whenever you need them, switch back to
        Claude Code and type.
      </p>
      <div className="rounded-lg bg-terminal p-4 font-mono text-sm">
        <div className="text-terminal-muted">Claude Code</div>
        <div className="mt-2 text-terminal-foreground">
          <span className="text-terminal-prompt">&gt;</span> done
        </div>
        <div className="mt-1 text-terminal-muted">
          Checking onboarding/add-sam… branch is on GitHub, commit message passes Commit Court.
          Posting Gus's review now.
        </div>
      </div>
      <dl className="flex flex-col gap-2 text-sm">
        {coachPhrases.map((p) => (
          <div key={p.say} className="flex gap-3">
            <dt className="w-40 shrink-0">
              <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-accent-foreground">
                {p.say}
              </code>
            </dt>
            <dd className="text-muted-foreground">{p.does}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function Start() {
  const { story } = useGame()
  return (
    <div className="flex flex-col gap-4 text-base">
      <div className="flex gap-3 rounded-lg border bg-card p-3">
        <CastAvatar member={story.cast.priya} size="lg" />
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Priya Raman</span>
          <p className="text-sm">
            first day!!! 🎉 everyone's in #general. no pressure (some pressure) (it's fine)
          </p>
        </div>
      </div>
      <p>
        Your first ticket is waiting: <strong>put yourself in the team directory</strong>. Until you
        do, your name tag says “New Hire.” Gus has noticed.
      </p>
    </div>
  )
}

const BODIES = [Welcome, Team, Day, Coach, Start]
const TITLES = [
  'Welcome to The Studio',
  'Meet the team',
  'How a day works',
  'Meet your coach',
  'Ready for Day 1?',
]

export function Onboarding() {
  const { setOnboarded } = useGame()
  const [step, setStep] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const last = step === STEPS.length - 1
  const Body = BODIES[step]

  // Move focus to the new heading so screen readers announce each step.
  useEffect(() => {
    heading.current?.focus()
  }, [step])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') setStep((s) => Math.min(s + 1, STEPS.length - 1))
      if (e.key === 'ArrowLeft') setStep((s) => Math.max(s - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="flex h-full items-center justify-center overflow-y-auto bg-sidebar p-4"
    >
      <div className="flex w-full max-w-2xl flex-col gap-6 rounded-xl bg-background p-6 shadow-lg sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="size-4" /> First day
          </div>
          {!last && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setOnboarded(true)}
            >
              Skip intro
            </Button>
          )}
        </div>

        <div key={step} className="flex flex-col gap-4 motion-safe:animate-in motion-safe:fade-in">
          <h1
            id="onboarding-title"
            ref={heading}
            tabIndex={-1}
            className="text-2xl font-semibold outline-none"
          >
            {TITLES[step]}
          </h1>
          <Body />
        </div>

        <div className="flex items-center justify-between gap-4 border-t pt-4">
          <ol className="flex items-center gap-2" aria-label="Progress">
            {STEPS.map((label, i) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  aria-label={`Step ${i + 1}: ${label}`}
                  aria-current={i === step ? 'step' : undefined}
                  className={cn(
                    'block h-2 cursor-pointer rounded-full transition-all',
                    i === step ? 'w-6 bg-primary' : 'w-2 bg-border hover:bg-muted-foreground',
                  )}
                />
              </li>
            ))}
          </ol>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft /> Back
              </Button>
            )}
            {last ? (
              <Button onClick={() => setOnboarded(true)}>
                Start Day 1 <ArrowRight />
              </Button>
            ) : (
              <Button onClick={() => setStep(step + 1)}>
                Next <ArrowRight />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
