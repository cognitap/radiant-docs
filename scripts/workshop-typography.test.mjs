import assert from 'node:assert/strict'
import test from 'node:test'
import * as Radiant from '@cognitap/radiant'
import {
  typesettingAvailable,
  documentTypesetting,
  resolveTypesetting,
  chooseAssignment,
  applyTypesetting,
  resetRhythm,
  resetTextStyle
} from '../examples/workshop/workshop-typography.ts'
import { curatedFonts } from '../examples/workshop/workshop-fonts.ts'

const candidate = { skip: !typesettingAvailable }
test('typesetting availability follows the installed public generator', () => {
  assert.equal(
    typesettingAvailable,
    typeof Reflect.get(Radiant, 'generateTypography') === 'function'
  )
  if (!typesettingAvailable) {
    assert.equal(documentTypesetting({}), null)
    assert.throws(() => resolveTypesetting(), /installed package/)
  }
})
test(
  'family changes retain deliberate rhythm/style overrides; resets have independent ownership',
  candidate,
  () => {
    const initial = resolveTypesetting({
      prose: { lineHeight: 1.85 },
      ui: { size: 18 },
      styles: { 'prose-body': { tracking: 0.01 } }
    }).input
    const changed = resolveTypesetting(chooseAssignment(initial, 'body', curatedFonts[1]))
    assert.equal(changed.prose.size, 21)
    assert.equal(changed.prose.lineHeight, 1.85)
    assert.equal(changed.styles['prose-body'].tracking, 0.01)
    const reset = resolveTypesetting(resetRhythm(changed.input, 'prose'))
    assert.equal(reset.prose.lineHeight, 1.65)
    assert.equal(reset.ui.size, 18)
    assert.equal(reset.styles['prose-body'].tracking, 0.01)
    const style = resolveTypesetting(resetTextStyle(reset.input, 'prose-body'))
    assert.equal(style.styles['prose-body'].tracking, 0)
    assert.equal(style.prose.size, 21)
  }
)
test(
  'theme edits and starting-point resets preserve unrelated sections and component exceptions',
  candidate,
  () => {
    const document = Radiant.themeDocumentFromDefinition({
      id: 'typesetting-proof',
      name: 'Proof',
      tokens: {
        color: { accent: '#166534' },
        motion: { releaseDuration: '280ms' },
        typography: { bodySize: '1.125rem' }
      },
      components: { button: { radius: '23px' } },
      modes: { dark: { tokens: { typography: { bodyWeight: 500 } } } }
    })
    const original = JSON.stringify(document)
    const edited = applyTypesetting(document, {
      preset: 'source-serif',
      prose: { size: 23 },
      styles: { 'ui-label': { weight: 650 } }
    })
    const before = Radiant.compileThemeDocument(edited)
    assert.equal(before.modes.dark['--rad-typography-body-weight'], 500)
    assert.equal(before.modes.light['--rad-typography-body-size'], '1.125rem')
    const reset = applyTypesetting(edited, { preset: 'inter' }, null, true)
    const after = Radiant.compileThemeDocument(reset)
    assert.equal(after.modes.light['--rad-color-accent'], '#166534')
    assert.equal(after.modes.dark['--rad-motion-release-duration'], '280ms')
    assert.equal(after.modes.light['--rad-button-radius'], '23px')
    assert.notEqual(after.modes.light['--rad-typography-body-size'], '1.125rem')
    assert.equal(documentTypesetting(reset).prose.size, 20)
    assert.equal(JSON.stringify(document), original)
  }
)
test(
  'manual families stay uncalibrated and invalid changes cannot mutate a document',
  candidate,
  () => {
    const manual = resolveTypesetting({
      fonts: {
        body: { family: 'Brand, Georgia, serif', profile: 'manual' },
        ui: { family: 'Georgia, serif', profile: 'manual' }
      }
    })
    assert.deepEqual(manual.recommendations, { body: false, ui: false })
    assert.equal(manual.prose.lineHeight, 1.65)
    const document = Radiant.themeDocumentFromDefinition({ id: 'manual', name: 'Manual' })
    const original = JSON.stringify(document)
    assert.throws(
      () =>
        applyTypesetting(document, {
          fonts: { body: { family: 'bad; color:red', profile: 'manual' } }
        }),
      /family/
    )
    assert.throws(
      () => applyTypesetting(document, { styles: { display: { narrow: 80, wide: 20 } } }),
      /wide/
    )
    assert.equal(JSON.stringify(document), original)
  }
)
test(
  'portable documents carry normalized recipes and requested font requirements, never local bytes',
  candidate,
  () => {
    const document = Radiant.themeDocumentFromDefinition({ id: 'portable', name: 'Portable' })
    const local = { ...curatedFonts[0], id: 'local', family: 'Brand proof', source: 'local' }
    const input = chooseAssignment(resolveTypesetting().input, 'body', local)
    const applied = applyTypesetting(
      document,
      { ...input, styles: { 'prose-body': { weight: 620 } } },
      local
    )
    const removed = applyTypesetting(applied, documentTypesetting(applied).input)
    assert.equal(
      removed.sections.typography.fonts.find(font => font.id === 'typesetting-body').source,
      'local'
    )
    assert.ok(
      removed.sections.typography.fonts
        .find(font => font.id === 'typesetting-body')
        .weights.includes(620)
    )
    const text = JSON.stringify(removed)
    assert.doesNotMatch(text, /blob:|arrayBuffer|bytes|files|woff/)
    const parsed = Radiant.parseThemeDocument(JSON.parse(text))
    assert.deepEqual(documentTypesetting(parsed).input, documentTypesetting(applied).input)
    const section = Radiant.exportThemeSections(parsed, ['typography'])
    const restored = Radiant.updateThemeDocument(document, section.sections, 'replace')
    assert.deepEqual(documentTypesetting(restored).input, documentTypesetting(applied).input)
  }
)
