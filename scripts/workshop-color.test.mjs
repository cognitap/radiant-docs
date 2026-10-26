import assert from 'node:assert/strict'
import test from 'node:test'
import {
  colorAPI,
  defaultColorRecipe,
  colorPresets,
  selectColorPreset,
  overrideRole,
  roleValue,
  workingRoles
} from '../examples/workshop/workshop-color.ts'
import { documentAPI } from '../examples/workshop/workshop-theme.ts'

test('color editing requires the public production exports', () => {
  assert.equal(Boolean(colorAPI), Boolean(documentAPI))
  const a = defaultColorRecipe()
  a.input.brand = '#000000'
  assert.equal(defaultColorRecipe().input.brand, '#7C3AED')
})

test(
  'brand and generator edits retain explicit role choices without mutating recipes',
  { skip: !colorAPI },
  () => {
    const recipe = overrideRole(
      { ...defaultColorRecipe(), working: { primary: 'teal' } },
      'dark',
      'canvas',
      '#112233'
    )
    const before = JSON.stringify(recipe)
    const first = colorAPI.create(recipe)
    const next = colorAPI.create({
      ...recipe,
      input: {
        ...recipe.input,
        brand: '#FDE047',
        fidelity: 'unanchored',
        lightness: 'shared',
        vividness: 0.7,
        distribution: 1.35,
        neutralTint: 0.035,
        hueAlignment: 1
      }
    })
    assert.equal(next.wall.color.anchor, undefined)
    assert.equal(next.wall.color.brand.value, '#FDE047')
    assert.equal(next.palette.working.primary.paletteId, 'teal')
    assert.equal(roleValue(next, 'dark', 'canvas'), '#112233')
    assert.equal(JSON.stringify(recipe), before)
    assert.equal(first.wall.color.brand.value, '#7C3AED')
    assert.equal(next.wall.color.palettes.length, 18)
    assert.ok(next.wall.color.palettes.every(p => p.swatches.length === 11))
    assert.deepEqual(Object.keys(next.palette.working), workingRoles)
  }
)

test(
  'failed role choices remain explicit and clearing one preserves other mode choices',
  { skip: !colorAPI },
  () => {
    const recipe = overrideRole(
      overrideRole(defaultColorRecipe(), 'dark', 'canvas', '#112233'),
      'light',
      'accentForeground',
      '#FFFFFF'
    )
    const failing = colorAPI.create(overrideRole(recipe, 'light', 'accent', '#FFFFFF'))
    assert.equal(roleValue(failing, 'light', 'accent'), '#FFFFFF')
    assert.ok(failing.palette.checks.some(c => c.pass === false && c.ratio === 1))
    const cleared = colorAPI.create(overrideRole(failing.recipe, 'light', 'accent'))
    assert.notEqual(roleValue(cleared, 'light', 'accent'), '#FFFFFF')
    assert.equal(roleValue(cleared, 'light', 'accentForeground'), '#FFFFFF')
    assert.equal(roleValue(cleared, 'dark', 'canvas'), '#112233')
  }
)

test(
  'applying and resetting the color recipe preserves independent document sections',
  { skip: !colorAPI || !documentAPI },
  () => {
    const original = documentAPI.create({
      id: 'color-proof',
      name: 'Color proof',
      tokens: {
        typography: { family: 'Georgia, serif' },
        motion: { releaseDuration: '280ms' },
        surface: { radius: '2rem' }
      },
      components: { button: { radius: '27px' } }
    })
    const before = JSON.stringify(original)
    const session = colorAPI.create(overrideRole(defaultColorRecipe(), 'dark', 'canvas', '#112233'))
    const edited = colorAPI.apply(original, session)
    const reset = documentAPI.compile(colorAPI.apply(edited, colorAPI.create(defaultColorRecipe())))
    for (const mode of ['light', 'dark']) {
      assert.equal(reset.modes[mode]['--rad-typography-family'], 'Georgia, serif')
      assert.equal(reset.modes[mode]['--rad-motion-release-duration'], '280ms')
      assert.equal(reset.modes[mode]['--rad-surface-radius'], '2rem')
      assert.equal(reset.modes[mode]['--rad-button-radius'], '27px')
    }
    assert.notEqual(reset.modes.dark['--rad-surface-canvas'], '#112233')
    assert.equal(JSON.stringify(original), before)
  }
)

test(
  'preset selection resets only owned dials and preserves pins, independent treatment and global controls',
  { skip: !colorAPI },
  () => {
    assert.deepEqual(
      colorPresets.map(p => p.id),
      ['classic', 'balanced', 'expressive']
    )
    const recipe = overrideRole(
      {
        input: {
          brand: '#7F6A75',
          wallPreset: 'classic',
          rampPreset: 'expressive',
          vividness: 0.3,
          brandVividness: 0.7,
          neutralTint: 0.03,
          hueAlignment: 1,
          distribution: 1.2,
          lightness: 'shared'
        },
        working: { support: 'teal' }
      },
      'dark',
      'accent',
      '#ABCDEF'
    )
    const before = JSON.stringify(recipe)
    const wall = selectColorPreset(recipe, 'wall', 'balanced')
    assert.equal(wall.input.vividness, undefined)
    assert.equal(wall.input.neutralTint, undefined)
    assert.equal(wall.input.hueAlignment, undefined)
    assert.equal(wall.input.brandVividness, 0.7)
    assert.equal(wall.input.rampPreset, 'expressive')
    assert.equal(wall.input.distribution, 1.2)
    assert.equal(wall.input.lightness, 'shared')
    const ramp = selectColorPreset(wall, 'ramp', 'classic')
    assert.equal(ramp.input.wallPreset, 'balanced')
    assert.equal(ramp.input.rampPreset, 'classic')
    assert.equal(ramp.input.brandVividness, undefined)
    assert.equal(roleValue(colorAPI.create(ramp), 'dark', 'accent'), '#ABCDEF')
    assert.deepEqual(ramp.working, recipe.working)
    assert.equal(JSON.stringify(recipe), before)
  }
)
