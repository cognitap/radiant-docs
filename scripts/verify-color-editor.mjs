import { setTypographyFamily } from './typography-controls.mjs'
import assert from 'node:assert/strict'
import { openWorkshop, enterWorkshop } from './workshop-entry.mjs'

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
    await openWorkshop(page, baseURL)
    const frame = page.getByRole('region', { name: 'Shared theme workshop', exact: true })
    const brand = frame.getByRole('textbox', { name: 'Brand color', exact: true })
    await frame.getByRole('button', { name: 'Reset scene', exact: true }).waitFor()
    await page.waitForFunction(() => !document.querySelector('.preview-toolbar button').disabled)
    assert.equal(await brand.isEnabled(), true)
    const canvas = frame.locator('.preview-page').first()
    const variable = name =>
      canvas.evaluate((node, key) => getComputedStyle(node).getPropertyValue(key).trim(), name)
    const chip = name => frame.getByRole('button', { name, exact: true })
    const radio = (group, name) =>
      frame
        .getByRole('group', { name: group, exact: true })
        .getByRole('radio', { name, exact: true })
    const auto = name => frame.getByRole('button', { name: `Automatic ${name}`, exact: true })
    const strip = name => frame.getByRole('slider', { name, exact: true })
    const exact = frame.getByRole('textbox', { name: 'Exact role color', exact: true })
    const fidelity = frame.getByTestId('color-fidelity')
    const wallRows = () =>
      frame.locator('.color-wall tbody tr').evaluateAll(rows => rows.map(row => row.textContent))
    assert.equal(await frame.locator('.color-wall tbody tr').count(), 18)
    assert.equal(await frame.locator('.color-swatch').count(), 198)
    assert.equal(await frame.locator('.color-role-chip').count(), 36)
    const baseline = await variable('--rad-color-accent')

    await brand.fill('not a color')
    assert.equal(await brand.getAttribute('aria-invalid'), 'true')
    assert.equal(await variable('--rad-color-accent'), baseline)
    for (const seed of ['#FDE047', '#808080', '#000000', '#FFFFFF', '#166534']) {
      await brand.fill(seed)
      assert.ok((await fidelity.innerText()).includes(seed))
      assert.ok((await fidelity.innerText()).includes('kept exactly'))
      assert.ok((await wallRows())[0].includes(seed))
    }
    assert.notEqual(await variable('--rad-color-accent'), baseline)

    const surface = frame.getByRole('slider', { name: 'Brand shade', exact: true })
    await surface.scrollIntoViewIfNeeded()
    const box = await surface.boundingBox()
    const seen = new Set()
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.3)
    await page.mouse.down()
    for (let step = 1; step <= 8; step++) {
      await page.mouse.move(box.x + box.width * (0.2 + step * 0.09), box.y + box.height * 0.3)
      seen.add(await variable('--rad-color-accent'))
    }
    await page.mouse.up()
    assert.ok(seen.size >= 4, `the preview accent follows the drag (${seen.size} values seen)`)
    const dragged = await brand.inputValue()
    assert.notEqual(dragged, '#166534', 'the hex field follows the surface')
    assert.match(
      await surface.getAttribute('aria-valuetext'),
      /saturation \d+%, brightness \d+%, #/
    )
    await surface.focus()
    await surface.press('ArrowLeft')
    assert.notEqual(await brand.inputValue(), dragged, 'arrow keys move the brand shade')
    const hue = frame.getByRole('slider', { name: 'Brand hue', exact: true })
    const hueBefore = Number(await hue.inputValue())
    await hue.focus()
    await hue.press('Shift+ArrowRight')
    assert.equal(
      Number(await hue.inputValue()),
      Math.min(360, hueBefore + 10),
      'shift steps hue by 10'
    )
    assert.match(await hue.getAttribute('aria-valuetext'), /^\d+°, [a-z]+$/)

    assert.equal(await strip('Grey hue').isDisabled(), true, 'grey hue waits for a grey brand')
    await brand.fill('#808080')
    const greyHue = strip('Grey hue')
    await greyHue.focus()
    await greyHue.press('ArrowRight')
    assert.equal(await greyHue.inputValue(), '256')
    assert.match(await greyHue.getAttribute('aria-valuetext'), /^toward [a-z]+ \(256°\)$/)
    await radio('Brand fidelity', 'Regular ramp').check()
    assert.ok((await fidelity.innerText()).includes('kept as reference'))
    await radio('Lightness model', 'Shared stops').check()
    assert.equal(await auto('wall vividness').getAttribute('aria-pressed'), 'true')
    await auto('wall vividness').click()
    assert.equal(await auto('wall vividness').getAttribute('aria-pressed'), 'false')
    await auto('brand vividness').click()
    for (const name of [
      'Wall vividness',
      'Brand vividness',
      'Tone spread',
      'Grey tint',
      'Family hues'
    ]) {
      const slider = strip(name)
      const before = await slider.inputValue()
      const wordsBefore = await slider.getAttribute('aria-valuetext')
      await slider.focus()
      await slider.press('ArrowRight')
      assert.notEqual(await slider.inputValue(), before, `${name} moves by arrow`)
      const words = await slider.getAttribute('aria-valuetext')
      assert.match(words, /^[a-z][a-z ]+ \([\d.]+\)$/, `${name} speaks plain words: ${words}`)
      assert.notEqual(words, wordsBefore)
      await slider.press('Shift+ArrowLeft')
      assert.ok(
        Number(await slider.inputValue()) < Number(before),
        `${name} shift+arrow takes a bigger step`
      )
    }
    assert.equal(
      await auto('wall vividness').getAttribute('aria-pressed'),
      'false',
      'dragging a strip keeps it explicit'
    )
    await page.waitForFunction(() =>
      [...document.querySelectorAll('.color-strip-track')].every(
        track => track.style.backgroundImage
      )
    )

    const primary = chip('primary family')
    await primary.click()
    assert.equal(await primary.getAttribute('aria-expanded'), 'true')
    await frame
      .getByRole('button', { name: 'Use Teal for primary family', exact: true })
      .first()
      .click()
    assert.equal(await primary.getAttribute('data-value'), 'teal')

    await chip('Light Action fill').click()
    assert.equal(await chip('Light Action fill').getAttribute('aria-pressed'), 'true')
    await exact.fill('#FFFFFF')
    assert.equal(await variable('--rad-color-accent'), '#FFFFFF')
    await chip('Light Action text').click()
    await exact.fill('#FFFFFF')
    assert.ok((await frame.locator('.color-failures').innerText()).includes('1.00:1'))
    assert.equal(await chip('Light Action text').getAttribute('data-problem'), 'true')
    const fix = frame
      .locator('.color-role-detail')
      .getByRole('button', { name: 'Use the automatic color', exact: true })
    await fix.click()
    assert.notEqual(await variable('--rad-color-accent-foreground'), '#FFFFFF', 'the fix applied')
    assert.equal(await chip('Light Action text').getAttribute('data-problem'), null)
    assert.equal(
      await variable('--rad-color-accent'),
      '#FFFFFF',
      'the fix left the other pin alone'
    )

    await brand.fill('#7C3AED')
    const wallClassic = radio('Wall preset', 'Classic')
    const wallBalanced = radio('Wall preset', 'Balanced')
    await wallBalanced.focus()
    await wallBalanced.press('Tab')
    assert.equal(
      await radio('Brand ramp preset', 'Balanced').evaluate(
        node => node === document.activeElement
      ),
      true,
      'each preset group is one tab stop'
    )
    await wallClassic.check()
    assert.equal(await wallClassic.isChecked(), true)
    assert.equal(await auto('wall vividness').getAttribute('aria-pressed'), 'true')
    assert.equal(await auto('brand vividness').getAttribute('aria-pressed'), 'false')
    await radio('Brand ramp preset', 'Expressive').check()
    assert.equal(await auto('brand vividness').getAttribute('aria-pressed'), 'true')
    assert.equal(await wallClassic.isChecked(), true)
    assert.equal(
      await variable('--rad-color-accent'),
      '#FFFFFF',
      'regeneration retains pinned roles'
    )
    await primary.click()
    await frame
      .getByRole('button', { name: 'Use Blue for primary family', exact: true })
      .first()
      .click()
    assert.equal(
      await variable('--rad-color-accent'),
      '#FFFFFF',
      'family changes retain pinned roles'
    )
    await chip('Light Action fill').click()
    await exact.fill('#12')
    assert.equal(await exact.getAttribute('aria-invalid'), 'true')
    assert.equal(await variable('--rad-color-accent'), '#FFFFFF')
    await exact.fill('#123456')
    await frame.getByRole('button', { name: 'Clear role override', exact: true }).click()
    assert.notEqual(await exact.inputValue(), '#123456')

    await chip('Dark Canvas').click()
    await exact.fill('#112233')
    await frame.getByRole('combobox', { name: 'Preview mode', exact: true }).selectOption('dark')
    assert.equal(await variable('--rad-surface-canvas'), '#112233')
    const grid = frame.getByRole('grid', { name: 'Color wall, pick for dark canvas', exact: true })
    assert.equal(await grid.isVisible(), true, 'picking a role opens the wall for it')
    const active = () => grid.locator('.color-swatch[tabindex="0"]')
    await active().focus()
    const startCol = Number(await active().getAttribute('data-col'))
    await page.keyboard.press('ArrowRight')
    assert.equal(
      Number(await active().getAttribute('data-col')),
      startCol + 1,
      'arrow moves the grid cursor'
    )
    assert.equal(await active().evaluate(node => node === document.activeElement), true)
    await page.keyboard.press('ArrowDown')
    const picked = (await active().getAttribute('aria-label')).match(/#[0-9A-F]{6}/)[0]
    await page.keyboard.press('Enter')
    assert.equal(await exact.inputValue(), picked, 'Enter picks the focused shade')
    assert.equal(await variable('--rad-surface-canvas'), picked)
    assert.equal(
      await frame.locator('.color-swatch[tabindex="0"]').count(),
      1,
      'one tab stop in the wall'
    )

    await frame.getByRole('button', { name: 'Typography', exact: true }).click()
    const typographyFamily = await setTypographyFamily(frame)
    await frame.getByRole('button', { name: 'Color', exact: true }).click()
    assert.equal(await chip('Dark Canvas').getAttribute('aria-pressed'), 'true')
    await frame.getByRole('button', { name: 'Use automatic roles', exact: true }).click()
    await frame.getByRole('button', { name: 'Use recommended families', exact: true }).click()
    await frame.getByRole('button', { name: 'Reset color', exact: true }).click()
    assert.equal(await brand.inputValue(), '#7C3AED')
    assert.equal(await chip('Light Action fill').getAttribute('aria-pressed'), 'true')
    assert.equal(await primary.getAttribute('data-value'), 'brand')
    assert.equal(await variable(typographyFamily), 'Georgia, serif')
    assert.equal(
      await frame.getByRole('combobox', { name: 'Preview mode', exact: true }).inputValue(),
      'dark'
    )
    await frame.getByRole('combobox', { name: 'Preview mode', exact: true }).selectOption('light')
    assert.equal(await variable('--rad-color-accent'), baseline)
    assert.ok((await frame.locator('.color-contrast-summary').innerText()).startsWith('All '))
    await frame.getByText('All 44 measurements', { exact: true }).click()
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
        .locator('.color-role-chip')
        .count(),
      36
    )
    await chip('Light Action fill').click()
    await page.screenshot({ path: 'output/docs/color-editor-desktop.png', fullPage: true })
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 })
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `${width}px color editor overflow`
      )
      for (const name of ['Color wall', 'Contrast measurements']) {
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
    await enterWorkshop(page)
    await brand.waitFor()
    assert.equal(await brand.inputValue(), '#7C3AED')
    assert.deepEqual(errors, [], 'no color editor hydration/runtime errors')
    console.log(
      'Color editor passed: production 198-swatch wall, brand drag and keys, brand fidelity, all generator strips by keyboard with spoken values, preset cards, pinned roles, contrast warnings with a working fix, wall grid keys, resets and 320px/390px layouts.'
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
