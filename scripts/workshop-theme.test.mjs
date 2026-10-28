import assert from 'node:assert/strict'
import test from 'node:test'
import { defaultTheme } from '@cognitap/radiant'
import { documentAPI, initialDocument, resetEditor } from '../examples/workshop/workshop-theme.ts'

test('the workshop compiles its initial document through the released library API', () => {
  assert.equal(documentAPI.compile(initialDocument()).id, 'workshop')
})

test('geometry reset preserves independent canvas colors, other sections and component exceptions', () => {
  const original = documentAPI.create({
    id: 'reset-proof',
    name: 'Reset proof',
    tokens: {
      color: { accent: '#166534' },
      typography: { family: 'Georgia, serif' },
      motion: { releaseDuration: '280ms' },
      surface: { canvas: '#FFEECC', radius: '2rem', padding: '3rem' },
      control: { radius: '1rem' },
      spacing: { fieldGap: '2rem' }
    },
    components: { button: { radius: '27px' } },
    modes: { dark: { tokens: { surface: { canvas: '#112233' } } } }
  })
  const before = JSON.stringify(original)
  const next = resetEditor(original, 'geometry')
  const theme = documentAPI.compile(next)
  assert.equal(theme.modes.light['--rad-surface-canvas'], '#FFEECC')
  assert.equal(theme.modes.dark['--rad-surface-canvas'], '#112233')
  for (const mode of ['light', 'dark']) {
    assert.equal(
      theme.modes[mode]['--rad-surface-radius'],
      defaultTheme.modes[mode]['--rad-surface-radius']
    )
    assert.equal(
      theme.modes[mode]['--rad-surface-padding'],
      defaultTheme.modes[mode]['--rad-surface-padding']
    )
    assert.equal(
      theme.modes[mode]['--rad-spacing-field-gap'],
      defaultTheme.modes[mode]['--rad-spacing-field-gap']
    )
    assert.equal(theme.modes[mode]['--rad-button-radius'], '27px')
    assert.equal(theme.modes[mode]['--rad-color-accent'], '#166534')
    assert.equal(theme.modes[mode]['--rad-typography-family'], 'Georgia, serif')
    assert.equal(theme.modes[mode]['--rad-motion-release-duration'], '280ms')
  }
  assert.equal(JSON.stringify(original), before)
})

test('each editor resets only its owned decisions through the public document API', () => {
  const original = documentAPI.create({
    id: 'section-proof',
    name: 'Section proof',
    tokens: {
      color: { accent: '#166534' },
      typography: { family: 'Georgia, serif' },
      motion: { releaseDuration: '280ms' },
      surface: { canvas: '#FFEECC', radius: '2rem' }
    },
    components: { input: { radius: '19px' } }
  })
  for (const [editor, owned] of [
    ['color', '--rad-color-accent'],
    ['typography', '--rad-typography-family'],
    ['motion', '--rad-motion-release-duration']
  ]) {
    const theme = documentAPI.compile(resetEditor(original, editor))
    for (const mode of ['light', 'dark']) {
      assert.equal(theme.modes[mode][owned], defaultTheme.modes[mode][owned])
      assert.equal(theme.modes[mode]['--rad-surface-radius'], '2rem')
      assert.equal(theme.modes[mode]['--rad-input-radius'], '19px')
      if (editor !== 'color') assert.equal(theme.modes[mode]['--rad-color-accent'], '#166534')
      if (editor !== 'typography')
        assert.equal(theme.modes[mode]['--rad-typography-family'], 'Georgia, serif')
      if (editor !== 'motion')
        assert.equal(theme.modes[mode]['--rad-motion-release-duration'], '280ms')
      if (editor === 'color')
        assert.equal(
          theme.modes[mode]['--rad-surface-canvas'],
          defaultTheme.modes[mode]['--rad-surface-canvas']
        )
    }
  }
})
