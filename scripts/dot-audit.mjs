#!/usr/bin/env node
/**
 * Dotty's token audit. Run with `npm run dot`.
 *
 * Fails if any file in src/ (except src/styles/tokens.css) hard-codes a
 * design value instead of using a token:
 *   - hex colors (#6b5ce7), rgb()/hsl()/oklch() literals
 *   - Tailwind arbitrary values with units or colors: p-[13px], bg-[#fff]
 *   - inline style objects: style={{ ... }}
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..', 'src')
const ALLOWED = new Set([path.join(ROOT, 'styles', 'tokens.css')])
const EXT = new Set(['.ts', '.tsx', '.css'])

const RULES = [
  { name: 'hex color', re: /(?<![\w&])#[0-9a-fA-F]{3,8}\b/g },
  { name: 'color function', re: /\b(?:rgba?|hsla?|oklch|oklab)\(/g },
  { name: 'arbitrary value', re: /\b[a-z-]+-\[(?:[^\]]*\d(?:px|rem|em|%|vh|vw)|#|rgb|hsl|oklch)[^\]]*\]/g },
  { name: 'inline style', re: /style=\{\{/g },
]

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name)
    if (d.isDirectory()) return walk(full)
    return EXT.has(path.extname(d.name)) && !ALLOWED.has(full) ? [full] : []
  })
}

const findings = []
for (const file of walk(ROOT)) {
  const lines = fs.readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, i) => {
    if (/dot-ignore/.test(line)) return
    for (const rule of RULES) {
      for (const m of line.matchAll(rule.re)) {
        findings.push(`${path.relative(process.cwd(), file)}:${i + 1}  ${rule.name}: ${m[0]}`)
      }
    }
  })
}

if (findings.length) {
  console.log(`\n💜 Dotty: I found ${findings.length} hard-coded value${findings.length > 1 ? 's' : ''}. We talked about this.\n`)
  for (const f of findings) console.log('  ' + f)
  console.log('\n   Use a token from src/styles/tokens.css instead.\n')
  process.exit(1)
}
console.log('💜 Dotty: Token audit passed. Every value is a token. I could cry.')
