import { setTypographyFamily } from './typography-controls.mjs'
import assert from 'node:assert/strict'
import { workshopAvailable } from './radiant-package.mjs'

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
    await page.goto(`${baseURL}/docs/workshop/`)
    const frame = page.getByRole('region', { name: 'Shared theme workshop', exact: true })
    const shell = frame.locator('.theme-workshop')
    const canvas = frame.locator('.workshop-canvas')
    const editor = frame.locator('.geometry-editor')
    const chooseEditor = async name => {
      const button = frame.getByRole('button', { name, exact: true })
      await button.focus()
      await button.press('Enter')
      assert.equal(await button.getAttribute('aria-pressed'), 'true')
    }
    const variable = key =>
      canvas.evaluate((node, key) => getComputedStyle(node).getPropertyValue(key).trim(), key)
    const number = label => editor.getByRole('spinbutton', { name: label, exact: true })
    const preset = editor.getByRole('combobox', { name: 'Starting preset', exact: true })
    const scope = editor.getByRole('combobox', { name: 'Geometry scope', exact: true })
    const mode = frame.getByRole('combobox', { name: 'Preview mode', exact: true })
    const specimen = frame.getByRole('combobox', { name: 'Specimen', exact: true })
    await page.waitForFunction(
      () => !document.querySelector('.theme-workshop .demo-controls button').disabled
    )
    await chooseEditor('Spacing & surfaces')
    assert.equal(await editor.getByRole('spinbutton').count(), 7)
    if (!workshopAvailable) {
      assert.equal(await shell.getAttribute('data-workshop-geometry'), 'unavailable')
      assert.equal(await preset.isDisabled(), true)
      assert.equal(await number('Control density (×)').isDisabled(), true)
    } else {
      assert.equal(await shell.getAttribute('data-workshop-geometry'), 'enabled')
      assert.equal(await preset.isEnabled(), true)
      await chooseEditor('Color')
      await frame.getByRole('textbox', { name: 'Brand color', exact: true }).fill('#166534')
      await frame
        .getByRole('combobox', { name: 'Semantic role', exact: true })
        .selectOption('canvas')
      await frame.getByRole('textbox', { name: 'Exact role color', exact: true }).fill('#FFEECC')
      await frame.getByRole('combobox', { name: 'Role mode', exact: true }).selectOption('dark')
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
      await specimen.selectOption('form')
      await canvas.getByRole('textbox', { name: 'Display name' }).fill('Geometry Ada')
      await chooseEditor('Spacing & surfaces')
      const radius = number('Surface radius (px)')
      await radius.fill('99')
      assert.equal(await radius.getAttribute('aria-invalid'), 'true')
      assert.equal(await variable('--rad-surface-radius'), '12px')
      await radius.fill('')
      assert.equal(await radius.getAttribute('aria-invalid'), 'true')
      await radius.fill('24')
      assert.equal(await variable('--rad-surface-radius'), '24px')
      assert.equal(await preset.inputValue(), 'custom')
      const slider = editor.getByRole('slider', { name: 'Spacing multiplier slider', exact: true })
      await slider.focus()
      await slider.press('ArrowRight')
      assert.equal(await number('Spacing multiplier (×)').inputValue(), '1.05')
      for (const [id, height, shape] of [
        ['compact', '2.25rem', '8px'],
        ['square', '2.5rem', '0px'],
        ['balanced', '2.5rem', '12px'],
        ['spacious', '3rem', '24px']
      ]) {
        await preset.selectOption(id)
        assert.equal(await variable('--rad-control-medium-height'), height)
        assert.equal(await variable('--rad-surface-radius'), shape)
        assert.equal(await variable('--rad-color-accent'), accent)
        assert.equal(await variable('--rad-surface-canvas'), '#FFEECC')
      }
      await preset.selectOption('spacious')
      assert.equal(
        await variable('--rad-control-medium-height'),
        '3rem',
        'preset replay does not compound'
      )
      await specimen.selectOption('components')
      const medium = canvas.getByRole('button', { name: 'medium action', exact: true })
      const rootSize = await page.evaluate(() =>
        parseFloat(getComputedStyle(document.documentElement).fontSize)
      )
      assert.ok(
        Math.abs(
          (await medium.evaluate(node => parseFloat(getComputedStyle(node).minHeight))) -
            3 * rootSize
        ) < 0.1,
        'rem-based minimum control heights follow the document font size'
      )
      const font = await canvas
        .getByRole('textbox', { name: 'medium input', exact: true })
        .evaluate(node => getComputedStyle(node).fontSize)
      await scope.selectOption('dark')
      await number('Control density (×)').fill('1.5')
      await radius.fill('32')
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
      await editor.getByRole('button', { name: 'Use shared control density', exact: true }).click()
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
      assert.equal(await scope.inputValue(), 'dark')
      await editor.getByRole('button', { name: 'Clear all dark overrides', exact: true }).click()
      assert.equal(await variable('--rad-surface-radius'), '24px')
      assert.equal(await variable('--rad-surface-backdrop'), 'rgb(0 0 0 / 0.5)')
      await scope.selectOption('shared')
      await number('Control radius (px)').fill('10')
      await number('Control border width (px)').fill('2')
      await number('Surface border width (px)').fill('3')
      await number('Modal backdrop opacity').fill('0.8')
      await editor
        .getByRole('combobox', { name: 'Border style', exact: true })
        .selectOption('dotted')
      await editor
        .getByRole('combobox', { name: 'Surface elevation', exact: true })
        .selectOption('3')
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
      await number('Control border width (px)').fill('0')
      await number('Surface border width (px)').fill('0')
      await number('Modal backdrop opacity').fill('0')
      await editor
        .getByRole('combobox', { name: 'Surface elevation', exact: true })
        .selectOption('0')
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
      await number('Control border width (px)').fill('2')
      await number('Surface border width (px)').fill('3')
      await number('Modal backdrop opacity').fill('0.8')
      await editor
        .getByRole('combobox', { name: 'Surface elevation', exact: true })
        .selectOption('3')
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
          await canvas
            .getByRole('checkbox', { name: `${size} selection`, exact: true })
            .isDisabled(),
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
      await number('Control density (×)').fill('1.5')
      await number('Spacing multiplier (×)').fill('2')
      await radius.fill('48')
      await number('Control radius (px)').fill('32')
      await number('Control border width (px)').fill('4')
      await number('Surface border width (px)').fill('4')
      for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: 844 })
        for (const next of ['light', 'dark']) {
          await mode.selectOption(next)
          for (const name of ['article', 'form', 'dashboard', 'landing', 'components']) {
            await specimen.selectOption(name)
            assert.equal(
              await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
              true,
              `${width}-${name}-${next}: geometry overflow`
            )
          }
        }
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
      await scope.selectOption('dark')
      await radius.fill('0')
      const reset = frame.getByRole('button', { name: 'Reset spacing & surfaces', exact: true })
      await reset.focus()
      await reset.press('Enter')
      assert.equal(await reset.evaluate(node => node === document.activeElement), true)
      assert.equal(await scope.inputValue(), 'shared')
      assert.equal(await preset.inputValue(), 'balanced')
      assert.equal(await variable('--rad-surface-radius'), '12px')
      assert.equal(await variable('--rad-surface-canvas'), '#112233')
      assert.equal(await variable(typographyFamily), 'Georgia, serif')
      assert.equal(await stiffness.inputValue(), '450')
      assert.equal(await mode.inputValue(), 'dark')
      await mode.selectOption('light')
      assert.equal(await variable('--rad-surface-canvas'), '#FFEECC')
      await specimen.selectOption('form')
      assert.equal(
        await canvas.getByRole('textbox', { name: 'Display name' }).inputValue(),
        'Geometry Ada'
      )
      await editor.screenshot({ path: 'output/docs/geometry-editor-desktop.png' })
      await page.reload()
      await chooseEditor('Spacing & surfaces')
      assert.equal(await preset.inputValue(), 'balanced')
    }
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
      await staticPage.goto(`${baseURL}/docs/workshop/`)
      assert.equal(await staticPage.locator('.geometry-editor input[type=number]').count(), 7)
      assert.equal(
        await staticPage.locator('.geometry-editor input[type=number]').first().isDisabled(),
        true
      )
    } finally {
      await staticPage.close()
    }
    console.log(
      `Geometry editor passed: ${workshopAvailable ? 'production presets, precise controls, mode overrides/clear/reset, preserved sections and form state, three control sizes, focus/invalid/disabled/pending states, real light/dark overlays, compiled metrics and maximum-setting mobile layouts' : 'explicit published unavailability and read-only inspection'}; static output/hydration and 320px/390px widths.`
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
