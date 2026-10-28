import assert from 'node:assert/strict'
import test from 'node:test'
import {
  brandSnapshot,
  defaultRecipe,
  exampleSnapshot,
  readSharedTheme,
  startingSnapshot,
  startingThemes
} from '../examples/workshop/workshop-start.ts'
import { themes } from '@cognitap/radiant/examples'
import {
  snapshotConfiguration,
  snapshotFromConfiguration,
  themeChanges,
  viewTheme
} from '../examples/workshop/workshop-snapshot.ts'
import { handoffAPI, jsonText } from '../examples/workshop/workshop-handoff.ts'
import { sharePayload } from '../examples/workshop/workshop-share.ts'
import { readThemeDocument } from '../examples/workshop/workshop-theme.ts'
import { colorAPI, colorFields, defaultColorRecipe } from '../examples/workshop/workshop-color.ts'
import { geometryFields } from '../examples/workshop/workshop-geometry.ts'

test("the gallery is Radiant's example themes, each with a few words of character", () => {
  assert.deepEqual(
    startingThemes.map(theme => theme.id),
    themes.map(theme => theme.id)
  )
  for (const theme of startingThemes) {
    assert.notEqual(theme.character, theme.name, `${theme.id}: has its own character`)
    assert.ok(theme.character.split(' ').length <= 5, `${theme.id}: a few words`)
  }
})

test('every example opens as the exact theme the package publishes', () => {
  startingThemes.forEach((theme, index) => {
    const snapshot = exampleSnapshot(theme)
    assert.equal(readThemeDocument(snapshot.document).kind, 'radiant-theme')
    const view = viewTheme(snapshot)
    assert.deepEqual(view.theme, themes[index], `${theme.id}: compiled theme`)
    const changes = themeChanges(view, viewTheme(exampleSnapshot(theme)))
    for (const editor of ['color', 'typography', 'geometry', 'motion'])
      assert.equal(changes[editor].count, 0, `${theme.id}: ${editor} unchanged against itself`)
  })
})

test('every example round-trips through the handoff configuration', () => {
  for (const theme of startingThemes) {
    const snapshot = exampleSnapshot(theme)
    const text = jsonText(snapshotConfiguration(snapshot))
    assert.deepEqual(snapshotFromConfiguration(handoffAPI.read(text)), snapshot, theme.id)
    assert.deepEqual(readSharedTheme(text), snapshot, `${theme.id}: shared theme`)
  }
})

test('an example adopts a color recipe from its own accent', () => {
  const jelly = startingThemes.find(theme => theme.id === 'jelly')
  const before = viewTheme(exampleSnapshot(jelly))
  const accent = before.theme.modes.light['--rad-color-accent']
  const color = colorAPI.create({ input: { ...defaultColorRecipe().input, brand: accent } })
  const after = viewTheme({
    ...exampleSnapshot(jelly),
    document: colorAPI.apply(exampleSnapshot(jelly).document, color),
    color: color.recipe
  })
  assert.equal(colorFields(after.color).brand, accent)
  assert.equal(after.theme.modes.light['--rad-color-accent'], accent)
  assert.equal(
    after.theme.modes.light['--rad-button-shadow'],
    before.theme.modes.light['--rad-button-shadow'],
    'component exceptions survive a palette change'
  )
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
