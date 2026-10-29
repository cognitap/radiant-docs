import assert from 'node:assert/strict'
import test from 'node:test'
import {
  compileThemeDocument,
  defineMotionProfile,
  themeDocumentFromDefinition,
  exportThemeSections
} from '@cognitap/radiant'
import { resolveMotion } from '@cognitap/radiant/motion'
import {
  applyMotion,
  authoredMotion,
  changeMotion,
  chooseMotionPreset,
  inheritMotion,
  matchingMotionPreset,
  motionPreview
} from '../examples/workshop/workshop-motion.ts'
import { initialDocument, readThemeDocument } from '../examples/workshop/workshop-theme.ts'
import { resetEditor, type ThemeSnapshot } from '../examples/workshop/workshop-snapshot.ts'

const original = () =>
  themeDocumentFromDefinition({
    id: 'motion-editor',
    name: 'Motion editor',
    tokens: {
      color: { accent: '#166534' },
      typography: { family: 'Georgia, serif' },
      motion: { releaseDuration: '237ms' }
    },
    motion: {
      spring: { stiffness: 300 },
      interactions: { press: { damping: 25 }, drag: { mass: 2 } }
    },
    components: { button: { radius: '19px' } },
    modes: { dark: { tokens: { motion: { releaseDuration: '321ms' } } } }
  })

test('physical edits use the public document compiler and preserve CSS timing, other sections and exceptions', () => {
  const base = original(),
    before = JSON.stringify(base)
  const next = changeMotion(base, 'shared', { stiffness: 450 })
  const nextDocument = readThemeDocument(next)
  const theme = compileThemeDocument(nextDocument)
  assert.equal(theme.motion.interactions.press.stiffness, 450)
  assert.equal(theme.motion.interactions.press.damping, 25)
  assert.equal(theme.motion.interactions.drag.mass, 2)
  assert.equal(theme.modes.light['--rad-motion-release-duration'], '237ms')
  assert.equal(theme.modes.dark['--rad-motion-release-duration'], '321ms')
  assert.equal(theme.modes.dark['--rad-button-radius'], '19px')
  for (const name of ['color', 'typography', 'components'] as const)
    assert.deepEqual(nextDocument.sections[name], base.sections[name])
  assert.equal(JSON.stringify(base), before)
  for (const bad of [0, -1, NaN, Infinity, 10001])
    assert.throws(() => changeMotion(base, 'shared', { stiffness: bad }))
})

test('interaction overrides can return to inheritance without disturbing other interactions', () => {
  const base = original()
  const authored = changeMotion(base, 'follow', { stiffness: 200, mass: 3 })
  assert.equal(compileThemeDocument(readThemeDocument(authored)).motion.interactions.follow.mass, 3)
  const next = inheritMotion(authored, 'follow')
  const nextDocument = readThemeDocument(next)
  assert.equal(authoredMotion(next).interactions!.follow, undefined)
  assert.equal(compileThemeDocument(nextDocument).motion.interactions.follow.stiffness, 300)
  assert.deepEqual(authoredMotion(next).interactions!.drag, { mass: 2 })
  assert.deepEqual(nextDocument.sections.motion!.values, base.sections.motion!.values)
  assert.equal(
    defineMotionProfile(authoredMotion(inheritMotion(base, 'shared'))).spring.stiffness,
    320
  )
})

test('starting points replace physics and overrides while preserving theme off and authored CSS', () => {
  const base = applyMotion(original(), { ...authoredMotion(original()), mode: 'off' })
  const next = chooseMotionPreset(base, 'expressive')
  const nextDocument = readThemeDocument(next)
  assert.equal(matchingMotionPreset(next), 'expressive')
  assert.equal(compileThemeDocument(nextDocument).motion.mode, 'off')
  assert.equal(compileThemeDocument(nextDocument).motion.interactions.press.damping, 14)
  assert.deepEqual(
    nextDocument.sections.motion!.values,
    readThemeDocument(base).sections.motion!.values
  )
  assert.equal(matchingMotionPreset(changeMotion(next, 'press', { mass: 2 })), 'custom')
  assert.throws(() => chooseMotionPreset(next, 'unknown'))
})

test('comparison treatments do not change authoring data, colors, typography or component exceptions', () => {
  const base = original(),
    before = JSON.stringify(base)
  const current = compileThemeDocument(base)
  for (const treatment of ['current', 'restrained', 'expressive', 'off', 'reduced'] as const) {
    const theme = motionPreview(base, treatment)
    assert.deepEqual(theme.modes, current.modes)
    if (treatment === 'off' || treatment === 'reduced')
      assert.equal(resolveMotion(theme.motion, 'follow', false).enabled, false)
  }
  assert.equal(JSON.stringify(base), before)
})

test('section reset and selective export retain public profile semantics and other document owners', () => {
  const base = original()
  const selected = exportThemeSections(base, ['motion'])
  assert.deepEqual(selected.sections.motion!.profile, base.sections.motion!.profile)
  const snapshot = (document: object): ThemeSnapshot => ({ document, color: null, geometry: null })
  const next = resetEditor(snapshot(base), snapshot(initialDocument()), 'motion').document
  const nextDocument = readThemeDocument(next)
  assert.deepEqual(compileThemeDocument(nextDocument).motion, defineMotionProfile())
  for (const name of ['color', 'typography', 'components'] as const)
    assert.deepEqual(nextDocument.sections[name], base.sections[name])
})
