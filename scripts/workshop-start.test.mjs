import assert from 'node:assert/strict'
import test from 'node:test'
import {
  brandSnapshot,
  defaultRecipe,
  defaultTheme,
  readSharedTheme,
  startingSnapshot,
  startingThemes
} from '../examples/workshop/workshop-start.ts'
import {
  snapshotConfiguration,
  snapshotFromConfiguration,
  themeChanges,
  viewTheme
} from '../examples/workshop/workshop-snapshot.ts'
import { handoffAPI, jsonText } from '../examples/workshop/workshop-handoff.ts'
import { sharePayload } from '../examples/workshop/workshop-share.ts'
import { initialDocument, readThemeDocument } from '../examples/workshop/workshop-theme.ts'
import { colorAPI, colorFields, defaultColorRecipe } from '../examples/workshop/workshop-color.ts'
import {
  geometryAPI,
  geometryPreset,
  geometryFields
} from '../examples/workshop/workshop-geometry.ts'
import { applyTypesetting } from '../examples/workshop/workshop-typography.ts'
import { motionFields } from '../examples/workshop/workshop-motion.ts'

test('the registry has distinct ids, names and recipes', () => {
  const ids = startingThemes.map(theme => theme.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.equal(new Set(startingThemes.map(theme => theme.name)).size, ids.length)
  assert.equal(new Set(startingThemes.map(theme => JSON.stringify(theme.recipe))).size, ids.length)
  assert.ok(ids.length >= 4 && ids.length <= 6, `${ids.length} themes`)
  for (const theme of startingThemes)
    assert.ok(theme.character.split(' ').length <= 5, `${theme.id}: a few words`)
})

test('the default theme is the workshop as it opened before the start screen', () => {
  const geometry = geometryPreset()
  const color = colorAPI.create(defaultColorRecipe())
  const document = geometryAPI.apply(applyTypesetting(initialDocument(), {}), geometry)
  const before = { document: colorAPI.apply(document, color), color: color.recipe, geometry }
  assert.deepEqual(startingSnapshot(defaultTheme.recipe), before)
  assert.deepEqual(startingSnapshot(defaultRecipe), before)
})

test('every theme builds deterministically, validates and resolves to its recipe', () => {
  for (const { id, recipe } of startingThemes) {
    const snapshot = startingSnapshot(recipe)
    assert.deepEqual(startingSnapshot(recipe), snapshot, `${id}: deterministic`)
    assert.equal(readThemeDocument(snapshot.document).kind, 'radiant-theme')
    const view = viewTheme(snapshot)
    const color = colorFields(view.color)
    assert.equal(color.brand, recipe.brand, `${id}: brand`)
    assert.equal(color.wallPreset, recipe.wall, `${id}: wall`)
    assert.equal(color.rampPreset, recipe.ramp, `${id}: ramp`)
    assert.equal(view.typography.input.preset, recipe.typography, `${id}: typography`)
    assert.equal(geometryFields(snapshot.geometry).preset, recipe.geometry, `${id}: geometry`)
    assert.equal(motionFields(snapshot.document).preset, recipe.motion, `${id}: motion`)
    assert.equal(view.theme.modes.light['--rad-color-accent'], recipe.brand, `${id}: accent`)
    const changes = themeChanges(view, viewTheme(startingSnapshot(recipe)))
    for (const editor of ['color', 'typography', 'geometry', 'motion'])
      assert.equal(changes[editor].count, 0, `${id}: ${editor} unchanged against itself`)
  }
})

test('every theme round-trips through the handoff configuration', () => {
  for (const { id, recipe } of startingThemes) {
    const snapshot = startingSnapshot(recipe)
    const text = jsonText(snapshotConfiguration(snapshot))
    const restored = snapshotFromConfiguration(handoffAPI.read(text))
    assert.deepEqual(restored, snapshot, `${id}: configuration round trip`)
    assert.deepEqual(readSharedTheme(text), snapshot, `${id}: shared theme`)
  }
})

test('a brand color keeps the default recipe around it', () => {
  const snapshot = brandSnapshot('#166534')
  const view = viewTheme(snapshot)
  assert.equal(view.theme.modes.light['--rad-color-accent'], '#166534')
  assert.equal(colorFields(view.color).wallPreset, defaultRecipe.wall)
  assert.equal(geometryFields(snapshot.geometry).preset, defaultRecipe.geometry)
  assert.equal(view.typography.input.preset, defaultRecipe.typography)
  assert.deepEqual(brandSnapshot(defaultRecipe.brand), startingSnapshot(defaultRecipe))
})

test('a shared theme must be a full configuration', () => {
  const snapshot = startingSnapshot(defaultRecipe)
  const sections = jsonText(handoffAPI.sections(snapshot.document, ['motion']))
  assert.throws(() => readSharedTheme(sections), /full workshop configuration/)
  assert.throws(() => readSharedTheme('{'), /Invalid JSON/)
})

test('a share payload is read from a link, a bare payload, or not at all', () => {
  assert.equal(sharePayload(' https://example.test/workshop/#workshop=1.abc '), '1.abc')
  assert.equal(sharePayload('1.abc'), '1.abc')
  assert.equal(sharePayload('https://example.test/workshop/'), null)
  assert.equal(sharePayload(''), null)
})
