// Enforces the documentation rules in AGENTS.md. Configuration and the
// shrink-only baseline of existing violations live in docs-policy.json.
//
//   node scripts/check-docs.mjs          fail on any violation not in the baseline
//   node scripts/check-docs.mjs --prune  lower the baseline to what is left

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const policyFile = new URL('../docs-policy.json', import.meta.url)

export function prose(markdown) {
  return markdown
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, '')
    .split('\n')
    .filter(line => !/^\s*\|/.test(line) && !/^\s*(import|export) /.test(line))
    .join('\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\]\([^)]*\)/g, ']')
}

export function countWords(markdown) {
  return prose(markdown)
    .split(/\s+/)
    .filter(word => /[\p{L}\p{N}]/u.test(word)).length
}

export function countTicketRefs(markdown, prefixes) {
  return markdown.match(new RegExp(`\\b(?:${prefixes.join('|')})-\\d+\\b`, 'g'))?.length ?? 0
}

function globToRegExp(glob) {
  const pattern = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replaceAll('**/', '\uE000')
    .replaceAll('**', '\uE001')
    .replaceAll('*', '[^/]*')
    .replaceAll('\uE000', '(?:.*/)?')
    .replaceAll('\uE001', '.*')
  return new RegExp(`^${pattern}$`)
}

export function matches(globs, file) {
  return globs.some(glob => globToRegExp(glob).test(file))
}

export function budgetFor(policy, file) {
  for (const [glob, budget] of Object.entries(policy.budgets)) {
    if (matches([glob], file)) return budget
  }
  return policy.defaultBudget
}

// Returns the current state of every checked file, independent of the baseline.
export function measure(policy, files, read) {
  const words = {}
  const ticketRefs = {}
  const forbidden = []
  for (const file of files) {
    if (matches(policy.ignore, file)) continue
    if (matches(policy.forbiddenPaths, file)) forbidden.push(file)
    const text = read(file)
    const budget = budgetFor(policy, file)
    const count = countWords(text)
    if (budget !== null && count > budget) words[file] = count
    const refs = countTicketRefs(text, policy.ticketPrefixes)
    if (refs > 0) ticketRefs[file] = refs
  }
  return { words, ticketRefs, forbidden }
}

export function compare(policy, current) {
  const baseline = policy.baseline
  const errors = []
  const stale = []

  for (const [file, count] of Object.entries(current.words)) {
    const ceiling = baseline.words[file]
    const budget = budgetFor(policy, file)
    if (ceiling === undefined) {
      errors.push(`${file}: ${count} words of prose; the budget is ${budget}. Cut it.`)
    } else if (count > ceiling) {
      errors.push(
        `${file}: grew to ${count} words; it is over budget (${budget}) and may only shrink (≤${ceiling}).`
      )
    }
  }
  for (const [file, count] of Object.entries(current.ticketRefs)) {
    const ceiling = baseline.ticketRefs[file] ?? 0
    if (count > ceiling) {
      errors.push(
        `${file}: ${count - ceiling} new ticket ID(s). Say what changed, not which ticket changed it.`
      )
    }
  }
  for (const file of current.forbidden) {
    if (!baseline.forbidden.includes(file)) {
      errors.push(
        `${file}: verification and research records go in the pull request, not the repository.`
      )
    }
  }

  for (const file of Object.keys(baseline.words)) {
    if (current.words[file] === undefined) stale.push(`words: ${file}`)
  }
  for (const file of Object.keys(baseline.ticketRefs)) {
    if (current.ticketRefs[file] === undefined) stale.push(`ticketRefs: ${file}`)
  }
  for (const file of baseline.forbidden) {
    if (!current.forbidden.includes(file)) stale.push(`forbidden: ${file}`)
  }
  return { errors, stale }
}

// Lowers ceilings and removes fixed entries. Never adds or raises anything.
export function prune(baseline, current) {
  const shrink = (entries, now) =>
    Object.fromEntries(
      Object.entries(entries)
        .map(([file, ceiling]) => [file, Math.min(ceiling, now[file] ?? 0)])
        .filter(([, ceiling]) => ceiling > 0)
    )
  return {
    words: shrink(baseline.words, current.words),
    ticketRefs: shrink(baseline.ticketRefs, current.ticketRefs),
    forbidden: baseline.forbidden.filter(file => current.forbidden.includes(file))
  }
}

function main() {
  const policy = JSON.parse(readFileSync(policyFile, 'utf8'))
  const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard', '*.md', '*.mdx'], {
    cwd: root,
    encoding: 'utf8'
  })
    .split('\n')
    .filter(Boolean)
  const current = measure(policy, files, file => readFileSync(join(root, file), 'utf8'))

  if (process.argv.includes('--prune')) {
    policy.baseline = prune(policy.baseline, current)
    writeFileSync(policyFile, `${JSON.stringify(policy, null, 2)}\n`)
  }

  const { errors, stale } = compare(policy, current)
  if (stale.length > 0 && !process.argv.includes('--prune')) {
    errors.push(
      `Fixed files are still in the baseline; run \`node scripts/check-docs.mjs --prune\`:\n  ${stale.join('\n  ')}`
    )
  }
  if (errors.length > 0) {
    console.error(`Documentation check failed (see AGENTS.md):\n\n${errors.join('\n')}`)
    process.exit(1)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
