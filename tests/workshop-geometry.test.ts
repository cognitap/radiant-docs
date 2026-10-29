import assert from 'node:assert/strict'
import test from 'node:test'
import { exportThemeSections, parseThemeDocument } from '@cognitap/radiant'
import { documentAPI, readThemeDocument } from '../examples/workshop/workshop-theme.ts'
import { colorAPI, defaultColorRecipe } from '../examples/workshop/workshop-color.ts'
import {
  changeGeometry,
  clearGeometryOverride,
  geometryAPI,
  geometryPreset,
  geometryPresets,
  geometryValues,
  matchingGeometryPreset,
  type GeometrySettings
} from '../examples/workshop/workshop-geometry.ts'

const fixture = () => {
  const original = documentAPI.create({
    id: 'geometry-proof',
    name: 'Geometry proof',
    tokens: {
      color: { accent: '#123456' },
      typography: { family: 'Georgia, serif' },
      motion: { releaseDuration: '280ms' },
      surface: { canvas: '#FFEECC' },
      control: {
        cornerShape: 'bevel',
        small: { fontSize: '1.1rem' },
        medium: { fontSize: '1.2rem' },
        large: { fontSize: '1.3rem' }
      },
      focus: { width: '3px' },
      state: { disabledOpacity: 0.7 }
    },
    components: { button: { radius: '27px' }, dialog: { backdropFilter: 'blur(8px)' } },
    modes: {
      dark: {
        tokens: { surface: { canvas: '#112233' }, control: { medium: { height: '5rem' } } },
        components: { card: { shadow: 'none' } }
      }
    }
  })
  return colorAPI.apply(original, colorAPI.create(defaultColorRecipe()))
}

test('presets are independent recipes and mode edits retain shared and other-mode choices', () => {
  const baseline = geometryPreset()
  const dark = changeGeometry(baseline, 'dark', { density: 0.8, surfaceRadius: 32 })
  const light = changeGeometry(dark, 'light', { surfaceRadius: 0 })
  const shared = changeGeometry(light, 'shared', { surfaceRadius: 20 })
  assert.equal(matchingGeometryPreset(baseline), 'balanced')
  assert.equal(matchingGeometryPreset(shared), 'custom')
  assert.equal(geometryValues(shared, 'light').surfaceRadius, 0)
  assert.equal(geometryValues(shared, 'dark').surfaceRadius, 32)
  const cleared = clearGeometryOverride(shared, 'dark', 'surfaceRadius')
  assert.equal(geometryValues(cleared, 'dark').surfaceRadius, 20)
  assert.equal(geometryValues(cleared, 'dark').density, 0.8)
  assert.equal(geometryValues(cleared, 'light').surfaceRadius, 0)
  assert.equal(clearGeometryOverride(cleared, 'dark').modes!.dark, undefined)
  ;(baseline.values as { -readonly [K in keyof GeometrySettings]: GeometrySettings[K] }).spacing = 2
  assert.equal(geometryPreset().values.spacing, 1)
})

test('each starting preset uses production mapping and preserves unrelated theme decisions', () => {
  const original = fixture()
  const before = JSON.stringify(original)
  const originalTheme = documentAPI.compile(original)
  for (const preset of geometryPresets) {
    const next = geometryAPI.apply(original, geometryPreset(preset.id))
    const theme = documentAPI.compile(next)
    const nextDocument = readThemeDocument(next)
    const originalDocument = readThemeDocument(original)
    assert.deepEqual(nextDocument.sections.color, originalDocument.sections.color)
    assert.deepEqual(nextDocument.sections.components, originalDocument.sections.components)
    for (const section of ['typography', 'motion', 'focus', 'state'] as const)
      assert.deepEqual(nextDocument.sections[section], originalDocument.sections[section])
    for (const mode of ['light', 'dark'] as const) {
      const values = theme.modes[mode]
      assert.equal(
        values['--rad-surface-canvas'],
        originalTheme.modes[mode]['--rad-surface-canvas']
      )
      assert.equal(values['--rad-control-corner-shape'], 'bevel')
      assert.equal(values['--rad-button-radius'], '27px')
      assert.equal(values['--rad-dialog-backdrop-filter'], 'blur(8px)')
      for (const size of ['small', 'medium', 'large'])
        assert.equal(
          values[`--rad-control-${size}-font-size`],
          originalTheme.modes[mode][`--rad-control-${size}-font-size`]
        )
    }
    assert.equal(theme.modes.dark['--rad-card-shadow'], 'none')
    assert.deepEqual(
      geometryAPI.apply(next, geometryPreset(preset.id)),
      next,
      'preset replay never compounds spacing or density'
    )
  }
  assert.equal(JSON.stringify(original), before)
})

test('clearing mode overrides and resetting reapplies the complete owned recipe without stale token leaves', () => {
  const original = fixture()
  const shared = changeGeometry(geometryPreset('spacious'), 'shared', {
    surfaceRadius: 30,
    borderStyle: 'dotted'
  })
  const override = changeGeometry(shared, 'dark', {
    spacing: 2,
    density: 1.5,
    surfaceRadius: 0,
    elevation: 0,
    backdropOpacity: 0
  })
  const edited = geometryAPI.apply(original, override)
  assert.equal(documentAPI.compile(edited).modes.dark['--rad-surface-shadow'], 'none')
  const cleared = geometryAPI.apply(edited, clearGeometryOverride(override, 'dark'))
  const result = documentAPI.compile(cleared)
  assert.equal(result.modes.dark['--rad-surface-radius'], '30px')
  assert.equal(result.modes.dark['--rad-control-medium-height'], '3rem')
  assert.equal(result.modes.dark['--rad-surface-backdrop'], 'rgb(0 0 0 / 0.5)')
  const reset = geometryAPI.apply(cleared, geometryPreset())
  assert.deepEqual(
    reset,
    geometryAPI.apply(original, geometryPreset()),
    'reset restores the same owned decisions while preserving unrelated data'
  )
})

test('full-theme and selective geometry handoff preserve modes, canvas ownership and component exceptions', () => {
  const recipe = changeGeometry(geometryPreset('spacious'), 'dark', {
    density: 0.85,
    elevation: 3
  })
  const document = geometryAPI.apply(fixture(), recipe)
  const full = parseThemeDocument(JSON.parse(JSON.stringify(document)))
  assert.deepEqual(full, document)
  assert.deepEqual(documentAPI.compile(full).modes, documentAPI.compile(document).modes)
  const selective = parseThemeDocument(
    JSON.parse(JSON.stringify(exportThemeSections(readThemeDocument(document), ['control', 'spacing', 'surface'])))
  )
  assert.equal(selective.kind, 'radiant-theme-sections')
  assert.equal('id' in selective ? selective.id : undefined, undefined)
  assert.deepEqual(Object.keys(selective.sections).sort(), ['control', 'spacing', 'surface'])
  assert.deepEqual(
    selective.sections.surface,
    readThemeDocument(document).sections.surface,
    'surface sections include the independently retained canvas'
  )
  const target = documentAPI.create({
    id: 'consumer',
    name: 'Consumer',
    tokens: { color: { accent: '#166534' }, typography: { family: 'serif' } },
    components: { input: { radius: '19px' } }
  })
  const applied = documentAPI.update(target, selective.sections)
  const appliedDocument = readThemeDocument(applied)
  const targetDocument = readThemeDocument(target)
  const sourceDocument = readThemeDocument(document)
  assert.equal(appliedDocument.id, 'consumer')
  assert.deepEqual(appliedDocument.sections.color, targetDocument.sections.color)
  assert.deepEqual(appliedDocument.sections.typography, targetDocument.sections.typography)
  assert.deepEqual(appliedDocument.sections.components, targetDocument.sections.components)
  for (const section of ['control', 'spacing', 'surface'] as const)
    assert.deepEqual(appliedDocument.sections[section], sourceDocument.sections[section])
})
