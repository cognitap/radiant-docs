import assert from 'node:assert/strict'
import test from 'node:test'
import { colorAPI, defaultColorRecipe, overrideRole } from '../examples/workshop/workshop-color.ts'
import {
  bandBackground,
  choiceGroups,
  contrastProblems,
  contrastRatio,
  hexToHsv,
  hsvToHex,
  hueName,
  stripInputs,
  strips,
  stripWords
} from '../examples/workshop/workshop-color-view.ts'

test('hex and HSV round-trip through every picker position inside sRGB', () => {
  for (const hex of ['#7C3AED', '#000000', '#FFFFFF', '#808080', '#FF0000', '#00FF00', '#0000FF'])
    assert.equal(hsvToHex(hexToHsv(hex)), hex)
  const { h, s, v } = hexToHsv('#7C3AED')
  assert.ok(h > 260 && h < 266, `violet hue ${h}`)
  assert.ok(s > 75 && v > 90)
  assert.match(hsvToHex({ h: 400, s: 150, v: 100 }).slice(1), /^[0-9A-F]{6}$/)
})

test('contrast ratio matches the generator audit', () => {
  const { palette } = colorAPI.create(defaultColorRecipe())
  for (const check of palette.checks)
    assert.ok(
      Math.abs(contrastRatio(check.foreground, check.background) - check.ratio) < 0.001,
      `${check.foregroundRole}/${check.backgroundRole}`
    )
  assert.equal(contrastRatio('#000000', '#FFFFFF'), 21)
})

test('strips sample their own range and speak plain words', () => {
  const { wall } = colorAPI.create(defaultColorRecipe())
  for (const strip of strips) {
    const inputs = stripInputs(strip, wall.input)
    assert.equal(inputs.length, strip.samples)
    assert.equal(inputs[0][strip.field], strip.min)
    assert.equal(inputs.at(-1)[strip.field], strip.max)
    const words = stripWords(strip, wall.input[strip.field], false)
    assert.doesNotMatch(words, /undefined|NaN/)
    const walls = inputs.map(input => colorAPI.create({ input }).wall)
    const { bands } = strip
    const background = bandBackground(walls, bands)
    assert.equal(background.backgroundImage.split('linear-gradient').length - 1, bands.length)
    assert.equal(bandBackground([undefined, walls[0]], bands), undefined)
  }
  assert.equal(stripWords(strips[0], 0.83, true), 'automatic, intense (0.83)')
  assert.equal(stripWords(strips[0], 0.5, false), 'balanced (0.50)')
  assert.equal(hueName(255), 'blue')
  assert.equal(hueName(359), 'rose')
})

test('choice groups produce the same recipe as picking a preset', () => {
  const { wall } = colorAPI.create({
    input: { ...defaultColorRecipe().input, vividness: 0.3, brandVividness: 0.2 }
  })
  const wallPreset = choiceGroups.find(group => group.field === 'wallPreset')
  const next = wallPreset.input(wall.input, 'classic')
  assert.equal(next.wallPreset, 'classic')
  assert.equal(next.vividness, undefined)
  assert.equal(next.brandVividness, 0.2, 'the ramp keeps its own vividness')
  for (const group of choiceGroups) assert.ok(group.choices.length >= 2)
})

test('contrast problems land on the pinned role and offer a working fix', () => {
  const base = defaultColorRecipe()
  const whiteOnWhite = colorAPI.create(
    overrideRole(
      overrideRole(base, 'light', 'accent', '#FFFFFF'),
      'light',
      'accentForeground',
      '#FFFFFF'
    )
  )
  const problems = contrastProblems(whiteOnWhite)
  assert.ok(problems.length > 0)
  const pair = problems.find(
    p => p.check.foregroundRole === 'accentForeground' && p.check.backgroundRole === 'accent'
  )
  assert.equal(pair.role, 'accentForeground', 'the pinned foreground carries the warning')
  assert.equal(pair.pinned, true)
  assert.equal(pair.brandDerived, false)
  assert.ok(pair.fix, 'a fix exists')
  const fixed = colorAPI.create(pair.fix.recipe)
  assert.equal(
    fixed.palette.checks.find(
      c =>
        c.mode === 'light' &&
        c.foregroundRole === 'accentForeground' &&
        c.backgroundRole === 'accent'
    ).pass,
    true
  )
  assert.equal(contrastProblems(whiteOnWhite), problems, 'memoized per session')
  assert.deepEqual(contrastProblems(colorAPI.create(base)), [])

  const pinnedBackground = colorAPI.create(overrideRole(base, 'light', 'accent', '#FFFFFF'))
  const onCanvas = contrastProblems(pinnedBackground).find(
    p => p.check.foregroundRole === 'accent' && p.check.backgroundRole === 'canvas'
  )
  assert.equal(onCanvas.role, 'accent', 'the pinned fill is the culprit')
  assert.equal(onCanvas.fix.label, 'Use the automatic color')
  const pinnedText = colorAPI.create(overrideRole(base, 'light', 'accentForeground', '#7C3AED'))
  const onFill = contrastProblems(pinnedText).find(p => p.check.backgroundRole === 'accent')
  assert.equal(onFill.role, 'accentForeground')
  assert.equal(onFill.fix.label, 'Use the automatic color')
})
