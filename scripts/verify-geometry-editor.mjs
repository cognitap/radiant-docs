import { setTypographyFamily } from './typography-controls.mjs'
import { closePreviewOptions, openPreviewOptions } from './preview-options.mjs'
import { pickRadio, pickedRadio, radioGroup } from './typography-controls.mjs'
import assert from 'node:assert/strict'

export async function verifyGeometryEditor(browser, baseURL) {
  const page = await browser.newPage({
    reducedMotion: 'reduce',
    viewport: { width: 1280, height: 1000 }
  })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  try {
    await page.goto(`${baseURL}/workshop/`)
    const frame = page.getByRole('region', { name: 'Shared theme workshop', exact: true })
    const shell = frame.locator('.theme-workshop')
    const canvas = frame.locator('.preview-page').first()
    const editor = frame.locator('.geometry-editor')
    const chooseEditor = async name => {
      const button = frame.getByRole('button', { name, exact: true })
      await page.waitForFunction(node => !node.disabled, await button.elementHandle())
      await button.focus()
      await button.press('Enter')
      assert.equal(await button.getAttribute('aria-pressed'), 'true')
    }
    const variable = key =>
      canvas.evaluate((node, key) => getComputedStyle(node).getPropertyValue(key).trim(), key)
    const number = label => editor.getByRole('spinbutton', { name: label, exact: true })
    const grip = label => editor.getByRole('slider', { name: label, exact: true })
    const preset = {
      pick: id => pickRadio(editor, 'Starting preset', id),
      value: async () =>
        (await radioGroup(editor, 'Starting preset').locator('input:checked').count())
          ? pickedRadio(editor, 'Starting preset')
          : 'custom'
    }
    const scope = {
      pick: value => pickRadio(editor, 'Editing', value),
      value: () => pickedRadio(editor, 'Editing')
    }
    const undo = frame.getByRole('button', { name: 'Undo', exact: true })
    const mode = frame.getByRole('combobox', { name: 'Preview mode', exact: true })
    const scene = frame.getByRole('combobox', { name: 'Scene', exact: true })
    await page.waitForFunction(() => !document.querySelector('.preview-toolbar button').disabled)
    await chooseEditor('Spacing & surfaces')
    assert.equal(await editor.getByRole('spinbutton').count(), 7)
    assert.equal(await shell.getAttribute('data-workshop-geometry'), 'enabled')
    assert.equal(await radioGroup(editor, 'Starting preset').getByRole('radio').count(), 4)
    await chooseEditor('Color')
    await frame.getByRole('textbox', { name: 'Brand color', exact: true }).fill('#166534')
    await frame.getByRole('button', { name: 'Light Canvas', exact: true }).click()
    await frame.getByRole('textbox', { name: 'Exact role color', exact: true }).fill('#FFEECC')
    await frame.getByRole('button', { name: 'Dark Canvas', exact: true }).click()
    await frame.getByRole('textbox', { name: 'Exact role color', exact: true }).fill('#112233')
    const accent = await variable('--rad-color-accent')
    await chooseEditor('Typography')
    const typographyFamily = await setTypographyFamily(frame)
    await chooseEditor('Motion')
    const stiffness = frame.locator('.motion-editor').getByRole('spinbutton', {
      name: 'Stiffness',
      exact: true,
      includeHidden: true
    })
    await stiffness.fill('450')
    await scene.selectOption('page:form')
    await canvas.getByRole('textbox', { name: 'Name shown to collaborators' }).fill('Geometry Ada')
    await chooseEditor('Spacing & surfaces')
    const radius = number('Surface roundness')
    await radius.fill('99')
    assert.equal(await radius.getAttribute('aria-invalid'), 'true')
    assert.equal(await variable('--rad-surface-radius'), '12px')
    await radius.fill('')
    assert.equal(await radius.getAttribute('aria-invalid'), 'true')
    await radius.fill('24')
    assert.equal(await variable('--rad-surface-radius'), '24px')
    assert.equal(await preset.value(), 'custom')
    const slider = grip('Breathing room')
    await slider.focus()
    await slider.press('ArrowRight')
    assert.equal(await number('Breathing room').inputValue(), '1.05')
    assert.match(
      await slider.getAttribute('aria-valuetext'),
      /^1\.05 times, /,
      'words, not a bare number'
    )
    for (const [label, token] of [
      ['Density', '--rad-control-medium-height'],
      ['Control roundness', '--rad-control-radius'],
      ['Surface roundness', '--rad-surface-radius'],
      ['Control borders', '--rad-control-border-width'],
      ['Surface borders', '--rad-surface-border-width'],
      ['Backdrop dim', '--rad-surface-backdrop']
    ]) {
      const before = await variable(token)
      const control = grip(label)
      await control.focus()
      await control.press('ArrowUp')
      assert.notEqual(await variable(token), before, `${label}: the keyboard steps the visual`)
      await control.press('Shift+ArrowDown')
      assert.ok(await control.getAttribute('aria-valuetext'), `${label}: aria-valuetext`)
    }
    await preset.pick('balanced')
    const cornerBefore = await variable('--rad-control-radius')
    const corner = grip('Control roundness')
    await corner.scrollIntoViewIfNeeded()
    const cornerBox = await corner.boundingBox()
    const seen = new Set()
    await page.mouse.move(cornerBox.x + cornerBox.width / 2, cornerBox.y + cornerBox.height / 2)
    await page.mouse.down()
    for (let step = 1; step <= 8; step++) {
      await page.mouse.move(
        cornerBox.x + cornerBox.width / 2 - step * 2,
        cornerBox.y + cornerBox.height / 2 + step * 2
      )
      await page.waitForTimeout(16)
      seen.add(await variable('--rad-control-radius'))
    }
    await page.mouse.up()
    assert.ok(
      seen.size >= 3 && !seen.has(cornerBefore),
      `the preview radius follows the corner drag (${[...seen].join(' ')})`
    )
    const corneredTo = Number(await number('Control roundness').inputValue())
    assert.ok(
      corneredTo > 8 && corneredTo <= 32,
      `the dial shows the dragged corner (${corneredTo})`
    )
    assert.equal(await corner.getAttribute('aria-valuenow'), String(corneredTo))
    await undo.click()
    assert.equal(
      await variable('--rad-control-radius'),
      cornerBefore,
      'a corner drag is one undo step'
    )
    await radioGroup(editor, 'Starting preset').getByRole('radio').first().focus()
    await page.keyboard.press('ArrowRight')
    assert.equal(await preset.value(), 'compact', 'arrows pick a preset card')
    assert.equal(await variable('--rad-control-medium-height'), '2.25rem')
    for (const [id, height, shape] of [
      ['compact', '2.25rem', '8px'],
      ['square', '2.5rem', '0px'],
      ['balanced', '2.5rem', '12px'],
      ['spacious', '3rem', '24px']
    ]) {
      await preset.pick(id)
      assert.equal(await variable('--rad-control-medium-height'), height)
      assert.equal(await variable('--rad-surface-radius'), shape)
      assert.equal(await variable('--rad-color-accent'), accent)
      assert.equal(await variable('--rad-surface-canvas'), '#FFEECC')
    }
    await preset.pick('spacious')
    assert.equal(
      await variable('--rad-control-medium-height'),
      '3rem',
      'preset replay does not compound'
    )
    await scene.selectOption('components')
    const medium = canvas.getByRole('button', { name: 'medium action', exact: true })
    const rootSize = await page.evaluate(() =>
      parseFloat(getComputedStyle(document.documentElement).fontSize)
    )
    assert.ok(
      Math.abs(
        (await medium.evaluate(node => parseFloat(getComputedStyle(node).minHeight))) - 3 * rootSize
      ) < 0.1,
      'rem-based minimum control heights follow the document font size'
    )
    const font = await canvas
      .getByRole('textbox', { name: 'medium input', exact: true })
      .evaluate(node => getComputedStyle(node).fontSize)
    const handle = frame
      .getByRole('region', { name: 'Theme preview', exact: true })
      .getByRole('slider', { name: 'Control roundness', exact: true })
    const handleBox = await handle.boundingBox()
    const buttonRadius = () =>
      canvas
        .getByRole('button', { name: 'Try the action', exact: true })
        .evaluate(node => getComputedStyle(node).borderRadius)
    assert.equal(await buttonRadius(), '12px')
    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(
      handleBox.x + handleBox.width / 2 - 10,
      handleBox.y + handleBox.height / 2 + 10,
      {
        steps: 5
      }
    )
    await page.mouse.up()
    assert.equal(await buttonRadius(), '26px', 'the preview corner handle rounds the button')
    assert.equal(
      await number('Control roundness').inputValue(),
      '26',
      'the dial shows the handle value'
    )
    await undo.click()
    assert.equal(await buttonRadius(), '12px', 'a handle drag is one undo step')
    await handle.focus()
    await page.keyboard.press('ArrowRight')
    assert.equal(await buttonRadius(), '13px', 'arrow keys step the handle')
    await undo.click()
    assert.match(
      await editor.locator('.geometry-setting', { hasText: 'Backdrop dim' }).innerText(),
      /differs in dark/,
      'the shared view names the mode that overrides a value'
    )
    await scope.pick('dark')
    await number('Density').fill('1.5')
    await radius.fill('32')
    assert.equal(
      await editor.locator('.geometry-setting[data-overridden]').count(),
      3,
      'density, surface roundness and the preset backdrop are marked as dark overrides'
    )
    assert.match(
      await editor.locator('.geometry-setting[data-overridden]').first().innerText(),
      /dark override/
    )
    assert.equal(
      await variable('--rad-surface-radius'),
      '24px',
      'scope editing does not change preview mode'
    )
    await mode.selectOption('dark')
    assert.equal(await variable('--rad-control-medium-height'), '3.75rem')
    assert.equal(await variable('--rad-surface-radius'), '32px')
    assert.equal(await variable('--rad-surface-canvas'), '#112233')
    assert.equal(
      await canvas
        .getByRole('textbox', { name: 'medium input', exact: true })
        .evaluate(node => getComputedStyle(node).fontSize),
      font
    )
    await editor.getByRole('button', { name: 'Use shared density', exact: true }).click()
    assert.equal(await variable('--rad-control-medium-height'), '3rem')
    assert.equal(
      await variable('--rad-surface-radius'),
      '32px',
      'clearing one override retains others'
    )
    await chooseEditor('Color')
    await frame.getByRole('textbox', { name: 'Brand color', exact: true }).fill('#7C3AED')
    assert.equal(await variable('--rad-surface-radius'), '32px', 'color edits preserve geometry')
    await chooseEditor('Spacing & surfaces')
    assert.equal(await scope.value(), 'dark')
    await editor.getByRole('button', { name: 'Clear all dark overrides', exact: true }).click()
    assert.equal(await variable('--rad-surface-radius'), '24px')
    assert.equal(await variable('--rad-surface-backdrop'), 'rgb(0 0 0 / 0.5)')
    await scope.pick('shared')
    await number('Control roundness').fill('10')
    await number('Control borders').fill('2')
    await number('Surface borders').fill('3')
    await number('Backdrop dim').fill('0.8')
    await pickRadio(editor, 'Border style', 'dotted')
    await pickRadio(editor, 'Depth', '3')
    assert.equal(await variable('--rad-control-radius'), '10px')
    assert.equal(await variable('--rad-control-border-width'), '2px')
    assert.equal(await variable('--rad-surface-border-width'), '3px')
    assert.equal(await variable('--rad-surface-border-style'), 'dotted')
    const state = frame.getByRole('combobox', { name: 'Component state', exact: true })
    await state.selectOption('invalid')
    for (const size of ['small', 'medium', 'large'])
      assert.equal(
        await canvas
          .getByRole('textbox', { name: `${size} input`, exact: true })
          .getAttribute('aria-invalid'),
        'true'
      )
    await number('Control borders').fill('0')
    await number('Surface borders').fill('0')
    await number('Backdrop dim').fill('0')
    await pickRadio(editor, 'Depth', '0')
    const borderless = canvas.getByRole('textbox', { name: 'small input', exact: true })
    assert.equal(await borderless.evaluate(node => getComputedStyle(node).borderTopWidth), '0px')
    assert.equal(await borderless.getAttribute('aria-invalid'), 'true')
    await canvas.getByRole('button', { name: 'small action', exact: true }).focus()
    await page.keyboard.press('Tab')
    assert.equal(
      await borderless.evaluate(
        node => node === document.activeElement && getComputedStyle(node).outlineStyle === 'solid'
      ),
      true,
      'border removal retains keyboard focus'
    )
    await canvas.getByRole('button', { name: 'Inspect overlay', exact: true }).click()
    const flat = canvas.getByRole('dialog', { name: 'Review the surface', exact: true })
    await flat.waitFor()
    assert.equal(await flat.evaluate(node => getComputedStyle(node).boxShadow), 'none')
    assert.equal(
      await flat.evaluate(node => getComputedStyle(node, '::backdrop').backgroundColor),
      'rgba(0, 0, 0, 0)'
    )
    await page.keyboard.press('Escape')
    await number('Control borders').fill('2')
    await number('Surface borders').fill('3')
    await number('Backdrop dim').fill('0.8')
    await pickRadio(editor, 'Depth', '3')
    await state.selectOption('disabled')
    for (const size of ['small', 'medium', 'large']) {
      assert.equal(
        await canvas.getByRole('button', { name: `${size} action`, exact: true }).isDisabled(),
        true
      )
      assert.equal(
        await canvas.getByRole('textbox', { name: `${size} input`, exact: true }).isDisabled(),
        true
      )
      assert.equal(
        await canvas.getByRole('checkbox', { name: `${size} selection`, exact: true }).isDisabled(),
        true
      )
    }
    await state.selectOption('pending')
    assert.equal(await medium.getAttribute('aria-busy'), 'true')
    await state.selectOption('rest')
    await canvas.getByRole('button', { name: 'small action', exact: true }).focus()
    await page.keyboard.press('Tab')
    const small = canvas.getByRole('textbox', { name: 'small input', exact: true })
    assert.equal(
      await small.evaluate(
        node =>
          node === document.activeElement &&
          node.matches(':focus-visible') &&
          getComputedStyle(node).outlineStyle !== 'none'
      ),
      true
    )
    for (const next of ['light', 'dark']) {
      await mode.selectOption(next)
      const trigger = canvas.getByRole('button', { name: 'Inspect overlay', exact: true })
      await trigger.focus()
      await trigger.press('Enter')
      const dialog = canvas.getByRole('dialog', { name: 'Review the surface', exact: true })
      await dialog.waitFor()
      assert.equal(
        await dialog.evaluate(node => getComputedStyle(node, '::backdrop').backgroundColor),
        'rgba(0, 0, 0, 0.8)'
      )
      assert.equal(await dialog.evaluate(node => getComputedStyle(node).borderRadius), '24px')
      assert.notEqual(await dialog.evaluate(node => getComputedStyle(node).boxShadow), 'none')
      await page.screenshot({ path: `output/docs/geometry-overlay-${next}.png`, fullPage: true })
      await page.keyboard.press('Escape')
      assert.equal(await trigger.evaluate(node => node === document.activeElement), true)
    }
    await number('Density').fill('1.5')
    await number('Breathing room').fill('2')
    await radius.fill('48')
    await number('Control roundness').fill('32')
    await number('Control borders').fill('4')
    await number('Surface borders').fill('4')
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 })
      await openPreviewOptions(frame)
      for (const next of ['light', 'dark']) {
        await mode.selectOption(next)
        for (const name of [
          'page:article',
          'page:form',
          'page:data',
          'page:landing',
          'components'
        ]) {
          await scene.selectOption(name)
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            true,
            `${width}-${name}-${next}: geometry overflow`
          )
        }
      }
      await closePreviewOptions(frame)
      await editor.getByText('Resolved spacing and surface values', { exact: true }).click()
      const table = editor.getByRole('region', { name: 'Resolved geometry values', exact: true })
      await table.focus()
      await table.press('ArrowRight')
      await page.waitForFunction(
        () => document.querySelector('.geometry-table-scroll').scrollLeft > 0
      )
      await page.screenshot({ path: `output/docs/geometry-editor-${width}.png`, fullPage: true })
      await editor.getByText('Resolved spacing and surface values', { exact: true }).click()
    }
    await page.setViewportSize({ width: 1280, height: 1000 })
    await scope.pick('dark')
    await radius.fill('0')
    const reset = frame.getByRole('button', { name: 'Reset spacing & surfaces', exact: true })
    await reset.focus()
    await reset.press('Enter')
    assert.equal(await reset.evaluate(node => node === document.activeElement), true)
    assert.equal(await scope.value(), 'shared')
    assert.equal(await preset.value(), 'balanced')
    assert.equal(await variable('--rad-surface-radius'), '12px')
    assert.equal(await variable('--rad-surface-canvas'), '#112233')
    assert.equal(await variable(typographyFamily), 'Georgia, serif')
    assert.equal(await stiffness.inputValue(), '450')
    assert.equal(await mode.inputValue(), 'dark')
    await mode.selectOption('light')
    assert.equal(await variable('--rad-surface-canvas'), '#FFEECC')
    await scene.selectOption('page:form')
    assert.equal(
      await canvas.getByRole('textbox', { name: 'Name shown to collaborators' }).inputValue(),
      'Geometry Ada'
    )
    await editor.screenshot({ path: 'output/docs/geometry-editor-desktop.png' })
    await page.reload()
    await chooseEditor('Spacing & surfaces')
    assert.equal(await preset.value(), 'balanced')
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 })
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `${width}: geometry editor page width`
      )
    }
    assert.deepEqual(errors, [], 'no geometry editor hydration/runtime errors')
    const staticPage = await browser.newPage({ javaScriptEnabled: false })
    try {
      await staticPage.goto(`${baseURL}/workshop/`)
      assert.equal(await staticPage.locator('.geometry-editor input[type=number]').count(), 7)
      assert.equal(
        await staticPage.locator('.geometry-editor input[type=number]').first().isDisabled(),
        true
      )
    } finally {
      await staticPage.close()
    }
    console.log(
      'Geometry editor passed: preset cards by pointer and keyboard, precise scrub fields, keyboard on every visual, a corner drag the preview follows in one undo step, the preview corner handle, marked dark overrides with clear/reset, preserved sections and form state, three control sizes, focus/invalid/disabled/pending states, real light/dark overlays, compiled metrics and maximum-setting mobile layouts; static output/hydration and 320px/390px widths.'
    )
  } catch (error) {
    await page
      .screenshot({ path: 'output/docs/geometry-editor-failure.png', fullPage: true })
      .catch(() => {})
    throw error
  } finally {
    await page.close()
  }
}
