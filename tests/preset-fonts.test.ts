import assert from 'node:assert/strict'
import test from 'node:test'
import { presetFamilies, presetFontFamilies, presetFontsHref } from '../lib/preset-fonts.ts'

test('the site loads every font the example themes name, and nothing else', () => {
  assert.deepEqual(Object.keys(presetFontFamilies).sort(), presetFamilies())
  for (const family of presetFamilies())
    assert.match(presetFontsHref, new RegExp(`family=${family.replaceAll(' ', '\\+')}[:&]`))
})

test('the theming page offers the same stylesheet the site loads', async () => {
  const { readFile } = await import('node:fs/promises')
  const page = await readFile(
    new URL('../content/docs/foundations/theming.mdx', import.meta.url),
    'utf8'
  )
  assert.ok(page.includes(presetFontsHref))
})
