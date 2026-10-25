import assert from 'node:assert/strict'
import { radiantPackage } from './radiant-package.mjs'

export async function verifyColorEditor(browser, baseURL) {
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
    const brand = frame.getByRole('textbox', { name: 'Brand color', exact: true })
    await frame.getByRole('button', { name: 'Reset specimen', exact: true }).waitFor()
    await page.waitForFunction(
      () => !document.querySelector('.theme-workshop .demo-controls button').disabled
    )
    if (!radiantPackage.candidate) {
      assert.equal(await brand.isDisabled(), true)
      assert.equal(await frame.locator('.color-swatch').count(), 0)
      console.log(
        'Color editor: published pin exposes its unavailable state without a substitute engine.'
      )
      return
    }
    assert.equal(await brand.isEnabled(), true)
    const canvas = frame.locator('.workshop-canvas')
    const variable = name =>
      canvas.evaluate((node, key) => getComputedStyle(node).getPropertyValue(key).trim(), name)
    const role = frame.getByRole('combobox', { name: 'Semantic role', exact: true })
    const roleMode = frame.getByRole('combobox', { name: 'Role mode', exact: true })
    const exact = frame.getByRole('textbox', { name: 'Exact role color', exact: true })
    const fidelity = frame.getByTestId('color-fidelity')
    assert.equal(await frame.locator('.color-wall tbody tr').count(), 18)
    assert.equal(await frame.locator('.color-swatch').count(), 198)
    const baseline = await variable('--rad-color-accent')
    await brand.fill('not a color')
    assert.equal(await brand.getAttribute('aria-invalid'), 'true')
    assert.equal(await variable('--rad-color-accent'), baseline)
    for (const seed of ['#FDE047', '#808080', '#000000', '#FFFFFF', '#166534']) {
      await brand.fill(seed)
      assert.ok((await fidelity.innerText()).includes(seed))
      assert.ok((await fidelity.innerText()).includes('Retained exactly'))
      assert.ok((await frame.locator('.color-wall tbody tr').first().innerText()).includes(seed))
    }
    assert.notEqual(await variable('--rad-color-accent'), baseline)
    assert.equal(
      await frame.getByRole('slider', { name: /Neutral hue direction/ }).isDisabled(),
      true
    )
    await brand.fill('#808080')
    const hue = frame.getByRole('slider', { name: /Neutral hue direction/ })
    await hue.focus()
    await hue.press('ArrowRight')
    assert.equal(await hue.inputValue(), '256')
    await frame
      .getByRole('combobox', { name: 'Brand fidelity', exact: true })
      .selectOption('unanchored')
    assert.ok((await fidelity.innerText()).includes('reference metadata'))
    await frame
      .getByRole('combobox', { name: 'Lightness model', exact: true })
      .selectOption('shared')
    await frame.getByRole('checkbox', { name: 'Automatic vividness', exact: true }).uncheck()
    for (const name of ['Vividness', 'Tone distribution', 'Neutral tint', 'Hue alignment']) {
      const dial = frame.getByRole('slider', { name: new RegExp(name) })
      const before = await dial.inputValue()
      await dial.focus()
      await dial.press('ArrowRight')
      assert.notEqual(await dial.inputValue(), before)
    }
    await frame.getByRole('combobox', { name: 'primary family', exact: true }).selectOption('teal')
    await exact.fill('#FFFFFF')
    assert.equal(await variable('--rad-color-accent'), '#FFFFFF')
    await role.selectOption('accentForeground')
    await exact.fill('#FFFFFF')
    assert.ok((await frame.locator('.color-failures').innerText()).includes('1.0000:1'))
    await brand.fill('#7C3AED')
    assert.equal(
      await variable('--rad-color-accent'),
      '#FFFFFF',
      'regeneration retains pinned roles'
    )
    await frame.getByRole('combobox', { name: 'primary family', exact: true }).selectOption('blue')
    assert.equal(
      await variable('--rad-color-accent'),
      '#FFFFFF',
      'family changes retain pinned roles'
    )
    await exact.fill('#12')
    assert.equal(await exact.getAttribute('aria-invalid'), 'true')
    assert.equal(await variable('--rad-color-accent-foreground'), '#FFFFFF')
    await exact.fill('#123456')
    await frame.getByRole('button', { name: 'Clear role override', exact: true }).click()
    assert.notEqual(await exact.inputValue(), '#123456')
    await roleMode.selectOption('dark')
    await role.selectOption('canvas')
    await exact.fill('#112233')
    await frame.getByRole('combobox', { name: 'Preview mode', exact: true }).selectOption('dark')
    assert.equal(await variable('--rad-surface-canvas'), '#112233')
    const family = frame.getByRole('combobox', { name: 'Wall family', exact: true })
    const stop = frame.getByRole('combobox', { name: 'Wall stop', exact: true })
    await family.selectOption('teal')
    await stop.selectOption('700')
    const selected = (await stop.locator('option:checked').textContent()).split(' · ')[1]
    const apply = frame.getByRole('button', { name: 'Apply selected shade', exact: true })
    await apply.focus()
    await apply.press('Enter')
    assert.equal(await exact.inputValue(), selected)
    assert.equal(await apply.evaluate(node => node === document.activeElement), true)
    await frame.getByRole('button', { name: 'Typography', exact: true }).click()
    await frame.getByRole('combobox', { name: 'Body family' }).selectOption('Georgia, serif')
    await frame.getByRole('button', { name: 'Color', exact: true }).click()
    assert.equal(await role.inputValue(), 'canvas')
    assert.equal(await family.inputValue(), 'teal')
    assert.equal(await stop.inputValue(), '700')
    await frame.locator('.color-swatch').first().click()
    assert.equal(await stop.inputValue(), '50')
    await frame.getByRole('button', { name: 'Use automatic roles', exact: true }).click()
    await frame.getByRole('button', { name: 'Use recommended families', exact: true }).click()
    await frame.getByRole('button', { name: 'Reset color', exact: true }).click()
    assert.equal(await brand.inputValue(), '#7C3AED')
    assert.equal(await role.inputValue(), 'accent')
    assert.equal(await roleMode.inputValue(), 'light')
    assert.equal(await family.inputValue(), 'brand')
    assert.equal(await variable('--rad-typography-family'), 'Georgia, serif')
    assert.equal(
      await frame.getByRole('combobox', { name: 'Preview mode', exact: true }).inputValue(),
      'dark'
    )
    await frame.getByRole('combobox', { name: 'Preview mode', exact: true }).selectOption('light')
    assert.equal(await variable('--rad-color-accent'), baseline)
    await frame.getByText('All 44 pair measurements', { exact: true }).click()
    await frame.getByText('Semantic light/dark roles', { exact: true }).click()
    assert.equal(
      await frame
        .getByRole('region', { name: 'Contrast measurements', exact: true })
        .locator('tbody tr')
        .count(),
      44
    )
    assert.equal(
      await frame
        .getByRole('region', { name: 'Semantic role values', exact: true })
        .locator('tbody tr')
        .count(),
      18
    )
    await page.screenshot({ path: 'output/docs/color-editor-desktop.png', fullPage: true })
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 })
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `${width}px color editor overflow`
      )
      for (const name of ['Complete color wall', 'Contrast measurements', 'Semantic role values']) {
        const region = frame.getByRole('region', { name, exact: true })
        await region.focus()
        await region.press('ArrowRight')
        await page.waitForFunction(
          label =>
            [...document.querySelectorAll('section[aria-label]')].find(
              node => node.getAttribute('aria-label') === label
            )?.scrollLeft > 0,
          name
        )
      }
      await page.screenshot({ path: `output/docs/color-editor-${width}.png`, fullPage: true })
    }
    await page.reload()
    await brand.waitFor()
    assert.equal(await brand.inputValue(), '#7C3AED')
    assert.deepEqual(errors, [], 'no color editor hydration/runtime errors')
    const staticPage = await browser.newPage({ javaScriptEnabled: false })
    try {
      await staticPage.goto(`${baseURL}/docs/workshop/`)
      assert.equal(await staticPage.locator('.color-swatch').count(), 198)
      assert.equal(
        await staticPage.getByRole('textbox', { name: 'Brand color', exact: true }).isDisabled(),
        true
      )
    } finally {
      await staticPage.close()
    }
    console.log(
      'Color editor passed: production 198-swatch wall, brand fidelity, all generator controls, pinned roles, contrast failures, keyboard alternatives/scrolling, resets, static rendering and 320px/390px layouts.'
    )
  } catch (error) {
    await page
      .screenshot({ path: 'output/docs/color-editor-failure.png', fullPage: true })
      .catch(() => {})
    throw error
  } finally {
    await page.close()
  }
}
