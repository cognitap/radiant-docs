import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import {
  curatedFonts,
  fontAxesAvailable,
  fontRecommendation,
  inspectLocalFont,
  localFont,
  applyTrialFont
} from '../examples/workshop/workshop-fonts.ts'
import {
  initialDocument,
  documentAPI,
  readThemeDocument
} from '../examples/workshop/workshop-theme.ts'
import { handoffAPI, jsonText } from '../examples/workshop/workshop-handoff.ts'
import { encodeShare, decodeShare } from '../examples/workshop/workshop-share.ts'

const read = path => readFileSync(new URL('../' + path, import.meta.url))
const buffer = data => data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
test('pinned curated files and local variable-font fixture match the studied bytes', () => {
  const manifest = JSON.parse(read('public/fonts/workshop/manifest.json'))
  for (const entry of [...manifest.fonts, manifest.fixture]) {
    const data = read(
      entry === manifest.fixture ? entry.file : 'public/fonts/workshop/' + entry.file
    )
    assert.equal(createHash('sha256').update(data).digest('hex'), entry.sha256, entry.file)
    assert.equal(new URL(entry.url).hostname, 'raw.githubusercontent.com')
  }
  assert.equal(manifest.fonts.length, 8)
  for (const font of curatedFonts) {
    assert.match(read('public' + font.license).toString(), /SIL OPEN FONT LICENSE/i)
    assert.equal(font.styles.length, 2)
    for (const path of Object.values(font.files))
      assert.equal(
        read('public' + path)
          .subarray(0, 4)
          .toString(),
        'wOF2'
      )
  }
})
test('recommendations are contextual and custom fonts never inherit a curated profile', () => {
  assert.deepEqual(
    curatedFonts.map(font => fontRecommendation(font, 'body').size),
    [20, 21, 20, 20]
  )
  assert.equal(fontRecommendation(curatedFonts[1], 'ui').supported, false)
  assert.equal(fontRecommendation(curatedFonts[3], 'code').supported, true)
  const font = localFont(
    buffer(read('public/fonts/workshop/Inter.woff2')),
    'Brand font',
    'normal',
    500
  )
  assert.equal(fontRecommendation(font, 'body').supported, false)
  assert.equal(fontRecommendation(font, 'body').leading, 1.65)
  assert.deepEqual(font.weights, [500, 500])
  assert.deepEqual(font.axes, [], 'compressed metadata is not invented')
})
test('actual pinned TTF metadata exposes its weight/optical ranges and normal style', () => {
  const bytes = buffer(read('scripts/fixtures/InterVariable.ttf'))
  const info = inspectLocalFont(bytes)
  assert.equal(info.style, 'normal')
  assert.equal(info.weight, 400)
  assert.match(info.family, /Inter/)
  assert.deepEqual(
    info.axes.map(({ tag, min, default: base, max }) => [tag, min, base, max]),
    [
      ['opsz', 14, 14, 32],
      ['wght', 100, 400, 900]
    ]
  )
  const font = localFont(bytes, 'My brand', 'italic', 700)
  assert.deepEqual(font.weights, [100, 900])
  assert.deepEqual(font.styles, ['normal'], 'actual metadata wins over the declared fallback')
  assert.equal(font.source, 'local')
})
test('truncated tables, malformed axes, oversized files and invalid CSS names fail before use', () => {
  const actual = buffer(read('scripts/fixtures/InterVariable.ttf'))
  for (const bytes of [new ArrayBuffer(0), new ArrayBuffer(11 * 1024 * 1024), actual.slice(0, 300)])
    assert.throws(() => inspectLocalFont(bytes))
  const broken = actual.slice(0),
    view = new DataView(broken)
  view.setUint32(12 + 8, broken.byteLength + 1)
  assert.throws(() => inspectLocalFont(broken), /bounds/)
  const axes = actual.slice(0),
    metadata = new DataView(axes)
  for (let i = 0; i < metadata.getUint16(4); i++) {
    const offset = 12 + i * 16
    if (new TextDecoder().decode(new Uint8Array(axes, offset, 4)) === 'fvar') {
      metadata.setUint16(metadata.getUint32(offset + 8) + 4, 0)
      break
    }
  }
  assert.throws(() => inspectLocalFont(axes), /axes/)
  const woff = buffer(read('public/fonts/workshop/Inter.woff2'))
  for (const name of ['', 'Inter', 'x; color:red', 'x"', 'x'.repeat(81)])
    assert.throws(() => localFont(woff, name, 'normal', 400))
  for (const w of [NaN, 0, 1001]) assert.throws(() => localFont(woff, 'Brand', 'normal', w))
})
test('theme and share handoff carry requirements only, preserving unrelated settings', async () => {
  const bytes = buffer(read('scripts/fixtures/InterVariable.ttf'))
  const original = documentAPI.update(initialDocument(), {
    color: { values: { accent: '#123456' } },
    components: { values: { button: { fontWeight: 775 } } }
  })
  const next = applyTrialFont(original, localFont(bytes, 'Brand font', 'normal', 400), 650)
  const d = readThemeDocument(next)
  assert.deepEqual(d.sections.color, readThemeDocument(original).sections.color)
  assert.deepEqual(d.sections.components, readThemeDocument(original).sections.components)
  assert.equal(documentAPI.compile(next).modes.light['--rad-typography-body-weight'], 650)
  assert.deepEqual(d.sections.typography.fonts, [
    {
      id: 'workshop-font',
      family: 'Brand font',
      source: 'local',
      weights: [650],
      styles: ['normal'],
      ...(fontAxesAvailable ? { axes: localFont(bytes, 'Brand font', 'normal', 400).axes } : {})
    }
  ])
  const text = jsonText(handoffAPI.configuration(next, {}))
  assert.doesNotMatch(
    text,
    /bytes|blob:|data:|InterVariable|arrayBuffer|files|variationSettings|selectedAxes/
  )
  assert.deepEqual(handoffAPI.read(await decodeShare(await encodeShare(text))).document, d)
  const partial = handoffAPI.sections(next, ['typography'])
  assert.deepEqual(partial.sections.typography, d.sections.typography)
  assert.throws(() => applyTrialFont(original, curatedFonts[2], 900), /available/)
  const italic = localFont(
    buffer(read('public/fonts/workshop/Inter-Italic.woff2')),
    'Brand italic',
    'italic',
    400
  )
  assert.throws(() => applyTrialFont(original, italic, 400), /normal face/)
})
