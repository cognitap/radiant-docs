import assert from 'node:assert/strict'
import test from 'node:test'
import {
  displayValue,
  inheritedColorToken,
  inspectStyling,
  matchedTokens,
  normalizeSelector,
  textRole,
  tokensIn
} from '../examples/workshop/workshop-inspect.ts'

const context = (overrides = {}) => ({
  values: {
    '--rad-color-accent': 'oklch(0.21 0.006 286)',
    '--rad-control-radius': '0.5rem',
    '--rad-control-medium-height': '2.5rem',
    '--rad-typography-roles-ui-label-family': '"Inter", system-ui, sans-serif',
    '--rad-typography-roles-prose-title-family': 'Source Serif 4, serif',
    '--rad-motion-color-duration': '150ms',
    '--rad-focus-width': '2px',
    '--rad-button-radius': 'initial'
  },
  mode: 'light',
  color: { input: { brand: '#7C3AED' } },
  motion: { spring: { stiffness: 320, damping: 30, mass: 1 } },
  ...overrides
})

test('tokensIn finds every --rad reference once, fallbacks and nesting included', () => {
  assert.deepEqual(
    tokensIn(
      '--_btn-radius:var(--rad-button-radius,var(--rad-control-radius,.5rem));color:var( --rad-color-accent );background:var(--rad-color-accent)'
    ),
    ['--rad-button-radius', '--rad-control-radius', '--rad-color-accent']
  )
  assert.deepEqual(tokensIn('color: var(--docs-accent)'), [])
})

test('normalizeSelector drops transient states and pseudo-elements but keeps escaped class names', () => {
  assert.equal(normalizeSelector('.btn:hover, .btn:focus-visible'), '.btn, .btn')
  assert.equal(normalizeSelector('.hover\\:bg-x:hover'), '.hover\\:bg-x')
  assert.equal(normalizeSelector('.card::before'), '.card')
  assert.equal(normalizeSelector('li::marker'), 'li')
  assert.equal(normalizeSelector('.focus\\:ring'), '.focus\\:ring')
  assert.equal(normalizeSelector(':where(h1):not(:focus-within)'), ':where(h1):not()')
})

test('matchedTokens collects tokens only from rules the element matches', () => {
  const rules = [
    { selector: '.solid:hover', cssText: '--_btn-bg:var(--rad-color-accent)' },
    { selector: '.rounded', cssText: 'border-radius:var(--rad-control-radius)' },
    { selector: '.other', cssText: 'color:var(--rad-color-danger)' },
    { selector: '', cssText: 'color:var(--rad-color-focus)' }
  ]
  const tokens = matchedTokens(rules, selector => ['.solid', '.rounded'].includes(selector))
  assert.deepEqual(tokens, ['--rad-color-accent', '--rad-control-radius'])
})

test('textRole prefers the explicit role and infers prose blocks only inside prose', () => {
  assert.equal(textRole('ui-label', 'P', true), 'ui-label')
  assert.equal(textRole(undefined, 'P', true), 'prose-body')
  assert.equal(textRole(undefined, 'H2', true), 'prose-heading')
  assert.equal(textRole(undefined, 'P', false), undefined)
  assert.equal(textRole(undefined, undefined, true), undefined)
})

test('a solid button maps to action color, control radius, density, its label style and press physics', () => {
  const { groups, unmapped } = inspectStyling(
    {
      tokens: [
        '--rad-color-accent',
        '--rad-control-radius',
        '--rad-control-medium-height',
        '--rad-typography-roles-ui-label-family',
        '--rad-typography-roles-ui-label-weight',
        '--rad-motion-color-duration',
        '--rad-focus-width',
        '--rad-button-radius',
        '--rad-button-glow'
      ],
      slot: 'button',
      textRole: undefined
    },
    context()
  )
  assert.deepEqual(
    groups.map(group => [group.label, group.items.map(item => item.field)]),
    [
      ['Color', ['role.light.accent']],
      ['Typography', ['style.ui-label.assignment']],
      ['Spacing & surfaces', ['shared.controlRadius', 'shared.density']],
      ['Motion', ['shared.stiffness']]
    ]
  )
  const [accent] = groups[0].items
  assert.equal(accent.label, 'Action fill')
  assert.equal(accent.kind, 'color')
  assert.equal(accent.value, 'oklch(0.21 0.006 286)')
  assert.equal(accent.note, 'Automatic')
  assert.match(groups[0].hint, /follow Brand color/)
  assert.equal(groups[2].hint, undefined)
  const press = groups[3].items[0]
  assert.equal(press.label, 'Button press physics')
  assert.equal(press.value, 'stiffness 320 · damping 30 · mass 1')
  assert.equal(press.note, 'Inherits common physics')
  assert.deepEqual(
    unmapped,
    ['--rad-motion-color-duration', '--rad-focus-width'],
    'durations have no control; initial and unset component hooks are not listed'
  )
})

test('pinned roles and overridden interactions point at their own controls without a note', () => {
  const { groups } = inspectStyling(
    { tokens: ['--rad-color-accent'], slot: 'collapsible-trigger', textRole: undefined },
    context({
      mode: 'dark',
      color: { input: { brand: '#7C3AED' }, modes: { dark: { accent: '#ffffff' } } },
      motion: { interactions: { disclosure: { damping: 12 } } }
    })
  )
  const accent = groups.find(group => group.editor === 'color').items[0]
  assert.equal(accent.field, 'role.dark.accent')
  assert.equal(accent.note, 'Pinned')
  const disclosure = groups.find(group => group.editor === 'motion').items[0]
  assert.equal(disclosure.field, 'disclosure.stiffness')
  assert.equal(disclosure.label, 'Disclosure physics')
  assert.equal(disclosure.note, undefined)
  assert.match(disclosure.value, /damping 12/)
})

test('a heading maps to its text style whether the role is explicit or inferred', () => {
  const explicit = inspectStyling(
    { tokens: [], slot: undefined, textRole: 'prose-title' },
    context()
  )
  assert.deepEqual(
    explicit.groups.map(group => group.items.map(item => [item.field, item.value])),
    [[['style.prose-title.assignment', 'Source Serif 4, serif']]]
  )
  const inferred = inspectStyling(
    { tokens: ['--rad-typography-roles-prose-title-size'], slot: undefined, textRole: undefined },
    context()
  )
  assert.equal(inferred.groups[0].items[0].field, 'style.prose-title.assignment')
  assert.equal(inferred.groups[0].items.length, 1, 'tokens and role collapse to one item')
})

test('displayValue shows px for lengths and the first family name', () => {
  assert.equal(displayValue('length', '0.5rem'), '8px')
  assert.equal(displayValue('length', '2.5rem 1px'), '40px 1px')
  assert.equal(displayValue('family', '"Inter", system-ui, sans-serif'), 'Inter')
  assert.equal(displayValue('color', 'oklch(0.5 0 0)'), 'oklch(0.5 0 0)')
})

test('inheritedColorToken follows the nearest ancestor whose rules set color', () => {
  const rules = [
    {
      selector: '.page',
      cssText: 'color:var(--rad-color-foreground)',
      color: 'var(--rad-color-foreground)'
    },
    {
      selector: '.muted',
      cssText: 'color:var(--rad-color-muted)',
      color: 'var(--rad-color-muted)'
    },
    { selector: 'h2', cssText: 'margin:0' },
    { selector: '.plain', cssText: 'color:red', color: 'red' }
  ]
  const is =
    (...names) =>
    selector =>
      names.includes(selector)
  assert.equal(
    inheritedColorToken(rules, [is('h2'), is('article'), is('.page')]),
    '--rad-color-foreground'
  )
  assert.equal(
    inheritedColorToken(rules, [is('h2'), is('.muted'), is('.page')]),
    '--rad-color-muted'
  )
  assert.equal(
    inheritedColorToken(rules, [is('h2', '.plain'), is('.page')]),
    undefined,
    'a non-theme color on the way stops the climb'
  )
  assert.equal(inheritedColorToken(rules, [is('h2')]), undefined)
})

test('an inherited foreground token joins the text style as a color item', () => {
  const { groups } = inspectStyling(
    { tokens: ['--rad-color-foreground'], slot: undefined, textRole: 'prose-title' },
    context({ values: { '--rad-color-foreground': '#111111' } })
  )
  assert.deepEqual(
    groups.map(group => [group.label, group.items.map(item => item.label)]),
    [
      ['Color', ['Foreground']],
      ['Typography', ['Prose / Title']]
    ]
  )
})
