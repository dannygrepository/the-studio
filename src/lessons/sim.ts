/**
 * Shared pieces for the pretend terminals in each day's lesson.
 * Nothing here touches the player's real repo.
 */
import type { ReactNode } from 'react'

export type Line = { kind: 'out' | 'err' | 'ok' | 'gus' | 'muted'; text: string }

export const L = (kind: Line['kind'], text: string): Line => ({ kind, text })

export interface Goal<S> {
  id: string
  label: string
  hint: string
  done: (s: S) => boolean
}

export interface Sim<S> {
  title: string
  description: ReactNode
  /** First line printed in the terminal. */
  welcome: string
  initial: S
  prompt: (s: S) => string
  run: (s: S, input: string) => { state: S; lines: Line[] }
  goals: Goal<S>[]
}

/** Split a command line, respecting "double" and 'single' quotes. */
export function tokenize(input: string): string[] {
  const out: string[] = []
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g
  let m
  while ((m = re.exec(input))) out.push(m[1] ?? m[2] ?? m[3])
  return out
}

/** Value after a flag, e.g. flag(['-m', 'hi'], '-m') === 'hi'. */
export function flag(tokens: string[], name: string) {
  const i = tokens.indexOf(name)
  return i >= 0 ? tokens[i + 1] : undefined
}

export const unknown = (input: string): { lines: Line[] } => ({
  lines: [L('err', `This practice terminal doesn't know \`${input}\`.`), L('muted', 'Type `help` to see what it understands.')],
})
