import assert from 'node:assert/strict'
import test from 'node:test'
import { defineThemeDocument, updateThemeDocument } from '@cognitap/radiant'
import {
  fontFamilies,
  fontRequirements,
  fontSetup
} from '../examples/workshop/font-requirements.ts'
import { curatedFonts, applyTrialFont } from '../examples/workshop/workshop-fonts.ts'
import {
  handoffAPI,
  type Configuration,
  type ImportData
} from '../examples/workshop/workshop-handoff.ts'
import { readThemeDocument } from '../examples/workshop/workshop-theme.ts'

function configurationOf(value: ImportData): Configuration {
  if (value.kind !== 'radiant-workshop') throw new TypeError('Expected a workshop configuration.')
  return value
}

const base = () =>
  defineThemeDocument({
    kind: 'radiant-theme',
    version: 1,
    id: 'font-handoff',
    name: 'Font handoff',
    sections: {
      color: { values: { accent: '#123456' } },
      motion: { values: { releaseDuration: '237ms' } },
      components: { values: { button: { radius: '23px' } } }
    }
  })

test('curated installation requirements name actual files, licenses, ranges and deduplicate faces', () => {
  const document = readThemeDocument(applyTrialFont(base(), curatedFonts[0], 450))
  const requirements = fontRequirements(document)
  assert.equal(requirements[0].family, 'Inter')
  assert.equal(requirements[0].files.length, 2)
  assert.ok(requirements[0].axes.some(axis => axis.tag === 'opsz'))
  assert.match(requirements[0].license!, /Inter-LICENSE/)
  const duplicated = updateThemeDocument(document, {
    typography: {
      fonts: [
        ...document.sections.typography!.fonts!,
        { ...document.sections.typography!.fonts![0], id: 'second-role' }
      ]
    }
  })
  const css = fontSetup(duplicated)
  assert.equal(css.match(/@font-face/g)!.length, 2)
  assert.match(css, /font-weight: 100 900/)
  assert.match(css, /font-display: swap/)
  assert.match(fontSetup(applyTrialFont(base(), curatedFonts[2], 500)), /font-stretch: 85% 100%/)
  assert.doesNotMatch(css, /blob:|data:|base64|https?:/)
})

test('the setup step lists each family once with merged weights, styles and files', () => {
  let document = readThemeDocument(applyTrialFont(base(), curatedFonts[0], 400))
  const inter = document.sections.typography!.fonts![0]
  document = updateThemeDocument(document, {
    typography: {
      fonts: [
        { ...inter, weights: [400, 600], styles: ['normal'] },
        { ...inter, id: 'heading', weights: [500, 600], styles: ['italic'] },
        { id: 'brand', family: 'Brand', source: 'local', weights: [700], styles: ['normal'] }
      ]
    }
  })
  const families = fontFamilies(fontRequirements(document))
  assert.deepEqual(
    families.map(font => font.family),
    ['Inter', 'Brand']
  )
  assert.deepEqual(families[0].weights, [400, 500, 600])
  assert.deepEqual(families[0].styles, ['normal', 'italic'])
  assert.equal(families[0].files.length, new Set(families[0].files.map(file => file.url)).size)
  assert.match(families[1].note!, /File not included/)
})

test('typography-only outputs preserve the native recipe/metadata and never paint other sections', () => {
  const document = readThemeDocument(applyTrialFont(base(), curatedFonts[1], 600))
  const section = handoffAPI.sections(document, ['typography'])
  const restored = handoffAPI.apply(
    handoffAPI.configuration(base(), {}),
    section,
    'replace'
  ).document
  assert.deepEqual(restored.sections.typography, document.sections.typography!)
  assert.deepEqual(restored.sections.color, base().sections.color)
  assert.deepEqual(restored.sections.components, base().sections.components)
  assert.deepEqual(restored.sections.motion, base().sections.motion)
  const typed = handoffAPI.typedTheme(document, ['typography'])
  assert.match(typed, /export function applyTypography/)
  assert.doesNotMatch(typed, /#123456|237ms|23px/)
  const css = handoffAPI.cssOutput(document, ['typography'])
  assert.match(css, /radiant-typography/)
  assert.doesNotMatch(
    css,
    /--rad-(?:color|control|surface|motion|button)-|^\s*(?:color-scheme|background):/m
  )
  assert.throws(() => handoffAPI.cssOutput(document, ['color']), /Typography only/)
})

test('custom files remain missing requirements, with safe setup comments and no invented axes', () => {
  const document = updateThemeDocument(base(), {
    typography: {
      fonts: [
        {
          id: 'local',
          family: 'Brand */</style>{font}',
          source: 'local',
          weights: [450],
          styles: ['normal']
        }
      ]
    }
  })
  const report = fontRequirements(document)
  assert.deepEqual(report[0].axes, [])
  assert.deepEqual(report[0].files, [])
  assert.match(report[0].instruction, /same CSS family/)
  const css = fontSetup(document)
  assert.match(css, /File not included/)
  assert.doesNotMatch(css, /<\/style>|@font-face|blob:|data:/)
})

test('local available axes survive native full/selective configuration handoff', () => {
  const axes = [
    { tag: 'wght', min: 100, default: 400, max: 900 },
    { tag: 'opsz', min: 8, default: 20, max: 72 }
  ]
  const document = updateThemeDocument(base(), {
    typography: {
      fonts: [
        {
          id: 'local',
          family: 'Brand font',
          source: 'local',
          weights: [450],
          styles: ['normal'],
          axes
        }
      ]
    }
  })
  const config = configurationOf(handoffAPI.read(JSON.stringify(handoffAPI.configuration(document, {}))))
  assert.deepEqual(fontRequirements(config.document)[0].axes, axes)
  const selected = handoffAPI.sections(document, ['typography'])
  const restored = handoffAPI.apply(handoffAPI.configuration(base(), {}), selected, 'replace')
  assert.deepEqual(restored.document.sections.typography!.fonts![0].axes, axes)
  assert.match(fontSetup(restored.document), /opsz 8…72/)
})
