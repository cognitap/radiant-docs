import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compare, countWords, matches, measure, prune } from './check-docs.mjs'

const policy = baseline => ({
  defaultBudget: 5,
  budgets: { 'CHANGELOG.md': null, 'README.md': 3 },
  ticketPrefixes: ['DEV'],
  forbiddenPaths: ['docs/verification/**'],
  ignore: ['.github/**'],
  baseline: { words: {}, ticketRefs: {}, forbidden: [], ...baseline }
})

const check = (docs, baseline = {}) => {
  const rules = policy(baseline)
  return compare(
    rules,
    measure(rules, Object.keys(docs), file => docs[file])
  )
}

test('counts prose only, not code, tables, front matter or link targets', () => {
  const text = [
    '---',
    'title: Ignored',
    '---',
    'import { Demo } from "./Demo"',
    'One two [three](https://example.com/a/b).',
    '```ts',
    'const ignored = true',
    '```',
    '| a | b |',
    '<Demo prop="x" />'
  ].join('\n')
  assert.equal(countWords(text), 3)
})

test('globs match nested files and single segments', () => {
  assert.ok(matches(['docs/verification/**'], 'docs/verification/2026/a.md'))
  assert.ok(matches(['docs/**/*-audit-*.md'], 'docs/storybook-audit-2026.md'))
  assert.ok(!matches(['docs/*.md'], 'docs/research/a.md'))
})

test('accepts compliant docs', () => {
  assert.deepEqual(check({ 'README.md': 'one two', 'docs/a.md': 'UTF-8 and ISO-8601' }), {
    errors: [],
    stale: []
  })
})

test('rejects new violations', () => {
  const { errors } = check({
    'README.md': 'one two three four',
    'docs/a.md': 'Fixed in DEV-12.',
    'docs/verification/run.md': 'ok'
  })
  assert.equal(errors.length, 3)
  assert.match(errors.join('\n'), /README\.md: 4 words.*budget is 3/)
  assert.match(errors.join('\n'), /docs\/a\.md: 1 new ticket/)
  assert.match(errors.join('\n'), /docs\/verification\/run\.md/)
})

test('baselined files may shrink but not grow', () => {
  const baseline = { words: { 'README.md': 5 }, ticketRefs: { 'docs/a.md': 2 } }
  assert.deepEqual(check({ 'README.md': 'a b c d', 'docs/a.md': 'DEV-1' }, baseline).errors, [])
  const { errors } = check(
    { 'README.md': 'a b c d e f', 'docs/a.md': 'DEV-1 DEV-2 DEV-3' },
    baseline
  )
  assert.equal(errors.length, 2)
})

test('reports fixed files that are still baselined, and prune only shrinks', () => {
  const baseline = {
    words: { 'README.md': 5, 'docs/b.md': 9 },
    ticketRefs: { 'docs/a.md': 2 },
    forbidden: ['docs/verification/old.md']
  }
  const docs = { 'README.md': 'a b', 'docs/a.md': 'DEV-1', 'docs/b.md': 'a b c d e f g' }
  assert.deepEqual(check(docs, baseline).stale, [
    'words: README.md',
    'forbidden: docs/verification/old.md'
  ])

  const rules = policy(baseline)
  const pruned = prune(
    rules.baseline,
    measure(rules, Object.keys(docs), file => docs[file])
  )
  assert.deepEqual(pruned, {
    words: { 'docs/b.md': 7 },
    ticketRefs: { 'docs/a.md': 1 },
    forbidden: []
  })
})
