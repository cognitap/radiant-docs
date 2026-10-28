// Enforces the documentation rules in AGENTS.md using docs-policy.json.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

const { budget, budgets, banned, legacy } = JSON.parse(readFileSync('docs-policy.json', 'utf8'))
const glob = pattern =>
  new RegExp(
    `^${pattern
      .replaceAll('.', '\\.')
      .replaceAll('**', '.+')
      .replace(/(?<!\.)\*/g, '[^/]*')}$`
  )
const budgetFor = file =>
  Object.entries(budgets).find(([pattern]) => glob(pattern).test(file))?.[1] ?? budget
const words = text =>
  text
    .replace(/^```[\s\S]*?^```/gm, '')
    .replace(/^\s*\|.*$/gm, '')
    .split(/\s+/)
    .filter(word => /\p{L}/u.test(word)).length

const errors = []
const tracked = (...patterns) =>
  execFileSync('git', ['ls-files', '-co', '--exclude-standard', ...patterns], { encoding: 'utf8' })
    .split('\n')
    .filter(file => file && existsSync(file))
const files = tracked('*.md', '*.mdx').filter(
  file => !file.startsWith('.github/') && !file.startsWith('public/')
)

for (const file of files) {
  const text = readFileSync(file, 'utf8')
  const count = words(text)
  const limit = budgetFor(file)
  if (file in legacy) {
    if (limit !== null && count > legacy[file])
      errors.push(`${file}: grew to ${count} words; legacy files may only shrink.`)
    continue
  }
  if (banned.some(pattern => glob(pattern).test(file)))
    errors.push(`${file}: records of how work was done go in the pull request.`)
  if (limit !== null && count > limit) errors.push(`${file}: ${count} words, budget ${limit}.`)
}
for (const file of tracked()) {
  if (/\bDEV-\d+/.test(readFileSync(file, 'utf8'))) errors.push(`${file}: remove ticket IDs.`)
}
for (const file of Object.keys(legacy)) {
  if (!existsSync(file)) errors.push(`${file}: gone; remove it from legacy in docs-policy.json.`)
}

if (errors.length) {
  console.error(`Docs check failed (see AGENTS.md):\n${errors.join('\n')}`)
  process.exit(1)
}
