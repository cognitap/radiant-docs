import assert from 'node:assert/strict'
import test from 'node:test'
import { updateThemeDocument } from '@cognitap/radiant'
import { setupGuide, setups, springMotion } from '../examples/workshop/workshop-setup.ts'
import { handoffAPI } from '../examples/workshop/workshop-handoff.ts'
import { fontSetup } from '../examples/workshop/font-requirements.ts'
import { initialDocument, readThemeDocument } from '../examples/workshop/workshop-theme.ts'
import { handoffFixture } from './handoff-fixture.mjs'

const withFonts = handoffFixture().document
const plain = readThemeDocument(initialDocument())
const motionOff = updateThemeDocument(withFonts, { motion: { profile: { mode: 'off' } } })
const labels = guide => guide.steps.map(step => step.label ?? step.text)

test('three setups, each with a one-line hint', () => {
  assert.deepEqual(
    setups.map(setup => setup.id),
    ['react', 'css', 'tailwind']
  )
  for (const setup of setups) assert.ok(setup.hint.length < 60, `${setup.id}: ${setup.hint}`)
})

test('React yields the typed theme, the install command and the motion runtime', () => {
  const guide = setupGuide('react', withFonts)
  assert.equal(guide.output.name, 'radiant-theme.ts')
  assert.equal(guide.output.text, handoffAPI.typedTheme(withFonts))
  assert.equal(guide.error, '')
  const runtime = handoffAPI.runtimeSetup()
  assert.deepEqual(labels(guide), [
    'Install command',
    'Save the theme as radiant-theme.ts in your app.',
    'Runtime setup',
    'Font setup CSS'
  ])
  assert.equal(guide.steps[0].code, runtime.install)
  assert.match(runtime.install, /react@/)
  assert.equal(guide.steps[2].code, runtime.source)
  assert.equal(guide.steps[3].code, fontSetup(withFonts))
  assert.equal(guide.fonts.length, 1)
})

test('CSS and Tailwind yield the scoped CSS with their own entry step and the spring note', () => {
  const css = handoffAPI.cssOutput(withFonts)
  for (const setup of ['css', 'tailwind']) {
    const guide = setupGuide(setup, withFonts)
    assert.equal(guide.output.name, 'radiant-theme.css')
    assert.equal(guide.output.text, css)
    assert.equal(guide.error, '')
    assert.doesNotMatch(guide.steps[0].code, /react@/, `${setup}: installs the package alone`)
    assert.deepEqual(labels(guide), [
      'Install command',
      'Save the theme as radiant-theme.css in your app.',
      setup === 'css' ? 'Stylesheet imports' : 'Tailwind entry',
      'Wrapper markup',
      'Font setup CSS',
      'This CSS carries timing tokens only. Spring profiles need the React runtime: choose React for spring motion.'
    ])
  }
  assert.match(setupGuide('css', withFonts).steps[2].code, /styles\.css/)
  assert.match(
    setupGuide('tailwind', withFonts).steps[2].code,
    /tailwindcss';\n@import '@cognitap\/radiant\/tailwind\.css'/
  )
  assert.match(setupGuide('css', withFonts).steps[3].code, /class="radiant-export" data-rad-mode/)
})

test('font and spring steps appear only when the theme needs them', () => {
  assert.equal(springMotion(withFonts), true)
  assert.equal(springMotion(plain), true, 'the library default profile is spring motion')
  assert.equal(springMotion(motionOff), false)
  assert.ok(!labels(setupGuide('react', plain)).includes('Font setup CSS'))
  assert.ok(!labels(setupGuide('css', plain)).includes('Font setup CSS'))
  assert.ok(labels(setupGuide('react', motionOff)).includes('Theme scope'))
  assert.ok(!labels(setupGuide('react', motionOff)).includes('Runtime setup'))
  assert.match(setupGuide('react', motionOff).steps[2].code, /ThemeScope/)
  assert.doesNotMatch(setupGuide('react', motionOff).steps[2].code, /MotionProvider/)
  assert.ok(!labels(setupGuide('tailwind', motionOff)).some(label => label.includes('Spring')))
})

test('a theme the CSS cannot carry reports the error and keeps the typed route', () => {
  const unsafe = updateThemeDocument(withFonts, {
    surface: { modes: { light: { shadow: '1px; } body { color: red' } } }
  })
  const guide = setupGuide('css', unsafe)
  assert.equal(guide.output.text, '')
  assert.match(guide.error, /CSS export cannot represent/)
  assert.equal(setupGuide('react', unsafe).error, '')
})
