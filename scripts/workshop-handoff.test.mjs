import assert from 'node:assert/strict'
import test from 'node:test'
import { updateThemeDocument } from '@cognitap/radiant'
import {
  handoffAPI,
  jsonText,
  maxConfigurationBytes
} from '../examples/workshop/workshop-handoff.ts'
import { decodeShare, encodeShare, maxShareLength } from '../examples/workshop/workshop-share.ts'
import { handoffFixture } from './handoff-fixture.mjs'

test('share transport round trips Unicode, rejects unsupported/damaged links and bounds expanded data', async () => {
  const text = JSON.stringify({ name: 'Árvíztűrő tükörfúrógép 🌈', value: 'x'.repeat(1000) })
  assert.equal(await decodeShare(await encodeShare(text)), text)
  await assert.rejects(decodeShare('2.invalid'), /unsupported/)
  await assert.rejects(decodeShare('1.a'), /decode/)
  await assert.rejects(decodeShare('1.Zm9v'), /decode/)
  const bulky = Array.from({ length: 16000 }, (_, i) => ((i * 2654435761) >>> 0).toString(36)).join(
    '-'
  )
  await assert.rejects(encodeShare(bulky), /too large for a share link/)
  await assert.rejects(decodeShare(`1.${'a'.repeat(maxShareLength)}`), /too large/)
  await assert.rejects(encodeShare('x'.repeat(maxConfigurationBytes + 1)), /256 KiB/)
  const stream = new Blob(['x'.repeat(maxConfigurationBytes + 1)])
    .stream()
    .pipeThrough(new CompressionStream('gzip'))
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer())
  const bomb = `1.${Buffer.from(bytes).toString('base64url')}`
  await assert.rejects(decodeShare(bomb), /256 KiB/)
})

test('configuration and share round trips preserve recipes, original metadata, fonts, motion and exceptions exactly', async () => {
  const { document, recipes } = handoffFixture()
  const before = JSON.stringify({ document, recipes })
  const config = handoffAPI.configuration(document, recipes)
  const text = jsonText(config)
  assert.equal(config.recipes.color.input.wallPreset, 'expressive')
  assert.equal(config.recipes.color.input.rampPreset, 'classic')
  assert.equal(config.recipes.color.input.brandVividness, 0.35)
  assert.equal(jsonText(handoffAPI.read(text)), text)
  assert.equal(jsonText(handoffAPI.read(await decodeShare(await encodeShare(text)))), text)
  assert.deepEqual(
    handoffAPI.read(text).document.sections.typography.fonts,
    document.sections.typography.fonts
  )
  assert.deepEqual(handoffAPI.read(text).document.sections.motion, document.sections.motion)
  assert.deepEqual(handoffAPI.read(text).document.sections.components, document.sections.components)
  const plain = handoffAPI.read(jsonText(document))
  assert.deepEqual(plain.document, document)
  assert.deepEqual(
    plain.recipes,
    {},
    'plain authoring data is never reverse-engineered into a generator recipe'
  )
  assert.equal(JSON.stringify({ document, recipes }), before)
  assert.match(handoffAPI.typedTheme(document), /satisfies ThemeDocument/)
})

test('partial merge/replacement preserve unrelated sections and invalidate only affected recipes', () => {
  const { document, recipes } = handoffFixture()
  const original = handoffAPI.configuration(document, recipes)
  const partial = handoffAPI.read(
    jsonText({
      kind: 'radiant-theme-sections',
      version: 1,
      sections: {
        typography: { values: { bodySize: '1.125rem' } },
        motion: { values: { pressDuration: '100ms' } }
      }
    })
  )
  const merged = handoffAPI.apply(original, partial, 'merge')
  assert.equal(merged.document.id, document.id)
  assert.deepEqual(merged.document.sections.components, document.sections.components)
  assert.deepEqual(merged.recipes, original.recipes)
  assert.deepEqual(merged.document.sections.typography.fonts, document.sections.typography.fonts)
  const replaced = handoffAPI.apply(original, partial, 'replace')
  assert.equal(replaced.document.sections.typography.fonts, undefined)
  assert.deepEqual(replaced.document.sections.color, document.sections.color)
  assert.deepEqual(replaced.document.sections.components, document.sections.components)
  const surface = handoffAPI.read(jsonText(handoffAPI.sections(document, ['surface'])))
  const applied = handoffAPI.apply(original, surface, 'merge')
  assert.deepEqual(applied.recipes, {}, 'a surface import affects canvas and geometry authoring')
  assert.equal(surface.sections.surface.modes.dark.canvas, '#112233')
  assert.equal(surface.sections.components, undefined, 'component exceptions are explicit opt-in')
  const components = handoffAPI.read(jsonText(handoffAPI.sections(document, ['components'])))
  assert.deepEqual(handoffAPI.apply(original, components, 'replace').recipes, original.recipes)
})

test('unsupported versions, keys, files and stale/incomplete recipes fail before import can discard data', () => {
  const { document, recipes } = handoffFixture()
  const config = handoffAPI.configuration(document, recipes)
  assert.throws(() => handoffAPI.read('{'), /Invalid JSON/)
  assert.throws(() => handoffAPI.read('x'.repeat(maxConfigurationBytes + 1)), /256 KiB/)
  assert.throws(() => handoffAPI.read(jsonText({ ...config, version: 2 })), /version/)
  assert.throws(() => handoffAPI.read(jsonText({ ...config, files: [1, 2] })), /files/)
  assert.throws(
    () =>
      handoffAPI.read(
        jsonText({
          ...config,
          recipes: { ...config.recipes, geometry: { values: { spacing: 1 } } }
        })
      ),
    /missing/
  )
  assert.throws(
    () =>
      handoffAPI.read(
        jsonText({
          ...config,
          recipes: { ...config.recipes, color: { ...recipes.color, input: { brand: '#FFFFFF' } } }
        })
      ),
    /does not match/
  )
  assert.throws(
    () =>
      handoffAPI.read(
        jsonText({
          ...document,
          sections: {
            ...document.sections,
            typography: {
              fonts: [{ id: 'file', family: 'Local', source: 'local', bytes: [1, 2] }]
            }
          }
        })
      ),
    /bytes/
  )
  assert.deepEqual(handoffAPI.configuration(document, recipes), config)
})

test('CSS keeps actual full-mode values and rejects unsafe/unbalanced text without blocking typed handoff', () => {
  const { document } = handoffFixture()
  const css = handoffAPI.cssOutput(document)
  assert.match(css, /prefers-color-scheme: dark/)
  assert.match(css, /--rad-button-radius: 27px/)
  assert.match(css, /--rad-motion-release-duration: 237ms/)
  for (const value of ['1px; } body { color: red', 'calc(1rem', '"Unclosed', 'trailing\\']) {
    const custom = updateThemeDocument(document, {
      surface: { modes: { light: { shadow: value } } }
    })
    assert.throws(() => handoffAPI.cssOutput(custom), /CSS export cannot represent/)
    assert.ok(handoffAPI.typedTheme(custom).includes('satisfies ThemeDocument'))
  }
})
