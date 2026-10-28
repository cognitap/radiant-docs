import assert from 'node:assert/strict'
import { test } from 'node:test'
import { generateTypography } from '@cognitap/radiant'
import {
  applyHandle,
  clampStep,
  dragValue,
  faceState,
  familyOptions,
  handleTargets,
  pairingOptions,
  scrubValue,
  specimen,
  proseScrubs
} from '../examples/workshop/workshop-typography-view.ts'
import { curatedFonts } from '../examples/workshop/workshop-fonts.ts'

const loaded = {
  has: family => family === 'Inter',
  isLoading: family => family === 'Source Serif 4'
}
const result = generateTypography({ preset: 'inter' })

test('a scrub covers its range over 300px and snaps to its step', () => {
  const measure = proseScrubs.find(scrub => scrub.key === 'measure')
  assert.equal(scrubValue(64, 30, measure), 74)
  assert.equal(scrubValue(64, 30, measure, true), 67)
  assert.equal(scrubValue(64, -9999, measure), 20)
  assert.equal(clampStep(1.6249, { min: 1, max: 3, step: 0.05 }), 1.6)
})

test('samples draw in a face only once it is in, and say so otherwise', () => {
  assert.equal(faceState(curatedFonts[0], loaded), 'ready')
  assert.equal(faceState(curatedFonts[1], loaded), 'loading')
  assert.equal(faceState(curatedFonts[2], loaded), 'missing')
  assert.equal(faceState(undefined, loaded), 'missing')
  const pairings = pairingOptions(null, loaded)
  assert.deepEqual(
    pairings.map(option => [option.value, option.faces.map(face => face.state)]),
    [
      ['inter', ['ready', 'ready']],
      ['source-serif', ['loading', 'loading']],
      ['plex', ['missing', 'missing']]
    ]
  )
  const manual = familyOptions(
    curatedFonts,
    { family: '"Brand", serif', profile: 'manual' },
    null,
    loaded
  )
  assert.equal(manual[0].value, 'manual')
  assert.equal(manual[0].name, 'Brand')
  assert.equal(manual[0].faces[0].state, 'missing')
})

test('a specimen keeps the style and shrinks only huge sizes', () => {
  const title = specimen(result.styles['prose-title'], result.input.fonts, null, loaded)
  assert.equal(title.fontSize, `${26 / 16}rem`)
  assert.equal(title.fontWeight, 600)
  assert.match(title.meta, /^39\.063–61\.035px · 600$/)
  const body = specimen(result.styles['prose-body'], result.input.fonts, null, loaded)
  assert.equal(body.fontSize, '1.25rem')
  assert.equal(body.meta, '20px · 400')
})

test('body roles drive their rhythm fields; other roles write their style', () => {
  const body = handleTargets('prose-body', result)
  assert.deepEqual(
    Object.values(body).map(target => target.field),
    ['prose.size', 'prose.lineHeight', 'prose.measure']
  )
  assert.equal(body.measure.value, 64)
  const ui = handleTargets('ui-body', result)
  assert.deepEqual(Object.keys(ui), ['size', 'lineHeight'])
  const label = handleTargets('ui-label', result)
  assert.equal(label.measure, undefined, 'a style without a measure has no measure handle')
  const title = handleTargets('prose-title', result)
  assert.equal(title.measure.field, 'style.prose-title.measure')
  const next = applyHandle(result, 'prose-body', body.measure, 54)
  assert.equal(next.prose.measure, 54)
  const sized = applyHandle(result, 'prose-title', title.size, 50)
  assert.equal(sized.styles['prose-title'].narrow, 50)
  assert.equal(sized.styles['prose-title'].wide, 78, 'a fluid style keeps its ratio')
  const overridden = generateTypography(sized)
  assert.equal(
    handleTargets('prose-body', overridden).measure.field,
    'prose.measure',
    'an unrelated override leaves body on its rhythm'
  )
})

test('pointer deltas become value deltas in the text’s own units', () => {
  const metrics = { scale: 0.5, fontSize: 20, ch: 10 }
  const targets = handleTargets('prose-body', result)
  assert.equal(dragValue(targets.measure, 64, { x: -50, y: 0 }, metrics), 54)
  assert.equal(dragValue(targets.size, 20, { x: 5, y: 0 }, metrics), 30)
  assert.equal(dragValue(targets.lineHeight, 1.6, { x: 0, y: 10 }, metrics), 2.6)
  assert.equal(dragValue(targets.lineHeight, 1.6, { x: 0, y: -9999 }, metrics), 1)
})
