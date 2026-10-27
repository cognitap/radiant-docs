import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import {
  themeDocumentFromDefinition,
  compileThemeDocument,
  updateThemeDocument,
  defineMotionProfile
} from '@cognitap/radiant'
import { handoffAPI, jsonText } from '../examples/workshop/workshop-handoff.ts'
import { encodeShare, decodeShare } from '../examples/workshop/workshop-share.ts'
import { handoffFixture } from './handoff-fixture.mjs'

test('defaults, inherited overrides and off survive full, motion-only and shared configuration round trips', async () => {
  const { document, recipes } = handoffFixture()
  for (const profile of [
    {},
    { mode: 'off' },
    {
      mode: 'system',
      spring: { mass: 2 },
      interactions: { press: { damping: 35 }, layout: { stiffness: 180 } }
    }
  ]) {
    const edited = updateThemeDocument(
      document,
      { motion: { ...document.sections.motion, profile } },
      'replace'
    )
    const config = handoffAPI.configuration(edited, recipes)
    const text = jsonText(config)
    const shared = handoffAPI.read(await decodeShare(await encodeShare(text)))
    assert.equal(jsonText(shared), text)
    assert.deepEqual(compileThemeDocument(shared.document).motion, defineMotionProfile(profile))
    const section = handoffAPI.read(jsonText(handoffAPI.sections(edited, ['motion'])))
    assert.deepEqual(Object.keys(section.sections), ['motion'])
    const restored = handoffAPI.apply(
      handoffAPI.configuration(document, recipes),
      section,
      'replace'
    )
    assert.deepEqual(restored.document.sections.motion, edited.sections.motion)
    for (const key of Object.keys(document.sections).filter(key => key !== 'motion'))
      assert.deepEqual(restored.document.sections[key], document.sections[key])
    assert.deepEqual(restored.recipes, recipes)
    assert.equal(
      compileThemeDocument(restored.document).modes.dark['--rad-motion-release-duration'],
      '237ms'
    )
  }
})

test('motion replacement restores omitted defaults while merge preserves omitted profile leaves', () => {
  const { document, recipes } = handoffFixture()
  const current = handoffAPI.configuration(document, recipes)
  const partial = handoffAPI.read(
    jsonText({
      kind: 'radiant-theme-sections',
      version: 1,
      sections: { motion: { profile: { mode: 'off', interactions: { press: { damping: 32 } } } } }
    })
  )
  const merged = handoffAPI.apply(current, partial, 'merge')
  const replaced = handoffAPI.apply(current, partial, 'replace')
  assert.equal(compileThemeDocument(merged.document).motion.spring.stiffness, 280)
  assert.equal(compileThemeDocument(merged.document).motion.interactions.press.stiffness, 410)
  assert.equal(compileThemeDocument(replaced.document).motion.spring.stiffness, 320)
  assert.equal(compileThemeDocument(replaced.document).motion.interactions.press.stiffness, 320)
  for (const result of [merged, replaced]) {
    assert.equal(compileThemeDocument(result.document).motion.mode, 'off')
    assert.equal(compileThemeDocument(result.document).motion.interactions.press.damping, 32)
    assert.deepEqual(result.document.sections.typography, document.sections.typography)
    assert.deepEqual(result.document.sections.components, document.sections.components)
    assert.deepEqual(result.recipes, recipes)
  }
})

test('invalid or unsupported motion imports and decoded links fail before replacing current settings', async () => {
  const { document, recipes } = handoffFixture()
  const current = handoffAPI.configuration(document, recipes)
  const before = jsonText(current)
  for (const profile of [
    { mode: 'always' },
    { reducedMotion: 'never' },
    { spring: { mass: 0 } },
    { spring: { stiffness: 10001 } },
    { spring: { damping: -1 } },
    { interactions: { hover: { mass: 1 } } },
    { interactions: { drag: { velocity: 2 } } }
  ]) {
    const invalid = jsonText({
      ...current,
      document: { ...document, sections: { ...document.sections, motion: { profile } } }
    })
    assert.throws(() => handoffAPI.read(invalid))
    const decoded = await decodeShare(await encodeShare(invalid))
    assert.throws(() => handoffAPI.read(decoded))
    assert.equal(jsonText(current), before)
  }
})

test('motion TypeScript and runtime setup preserve the public boundary without generating spring CSS', async () => {
  const { document } = handoffFixture()
  const typed = handoffAPI.typedTheme(document, ['motion'])
  assert.match(typed, /export function applyMotion/)
  assert.match(typed, /ThemeDocument\['sections'\]\['motion'\]/)
  assert.doesNotMatch(typed, /Local Display|"color"|"components"/)
  const empty = themeDocumentFromDefinition({ id: 'defaults', name: 'Defaults' })
  assert.match(handoffAPI.typedTheme(empty, ['motion']), /export const motion = \{\}/)
  assert.throws(() => handoffAPI.cssOutput(document, ['motion']), /Typography only/)
  assert.match(handoffAPI.cssOutput(document), /No sampled spring curve/)
  const { install, source } = handoffAPI.runtimeSetup()
  const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url)))
  const version = manifest.dependencies['@cognitap/radiant']
  assert.ok(
    install.includes(
      version.startsWith('file:') ? version.slice(5) : `@cognitap/radiant@${version}`
    )
  )
  assert.ok(install.includes(`react@${manifest.dependencies.react}`))
  assert.ok(install.includes(`react-dom@${manifest.dependencies['react-dom']}`))
  assert.match(source, /<MotionProvider>/)
  assert.match(source, /import \{ theme \} from '\.\/radiant-theme'/)
  assert.match(source, /@cognitap\/radiant\/styles.css/)
  assert.doesNotMatch(install, /(?:^|\s)(?:framer-)?motion@/)
})
