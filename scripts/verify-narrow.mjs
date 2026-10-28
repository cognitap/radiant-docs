import assert from 'node:assert/strict'
import { openWorkshop } from './workshop-entry.mjs'

/** Narrow screens: the preview is a sticky strip, so each edit happens with its effect in view. */
export async function verifyNarrow(browser, baseURL) {
  const page = await browser.newPage({ reducedMotion: 'reduce' })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  try {
    for (const width of [320, 375, 390, 768, 1024]) {
      await page.setViewportSize({ width, height: 800 })
      await openWorkshop(page, baseURL)
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `${width}px: no horizontal page scroll`
      )
    }

    for (const [width, height] of [
      [375, 812],
      [320, 568]
    ]) {
      const label = `${width}x${height}`
      await page.setViewportSize({ width, height })
      await openWorkshop(page, baseURL)
      const workshop = page.locator('.theme-workshop')
      const preview = page.getByRole('region', { name: 'Theme preview', exact: true })
      const canvas = preview.locator('.preview-page').first()
      const variable = name =>
        canvas.evaluate((node, name) => getComputedStyle(node).getPropertyValue(name).trim(), name)
      const editor = name => workshop.getByRole('button', { name, exact: true })
      /** The control is on screen, under the sticky strip and nav rather than behind them. */
      const assertEditable = async (control, step) => {
        const view = await control.evaluate(node => {
          const box = node.getBoundingClientRect()
          const x = box.left + box.width / 2
          const y = box.top + box.height / 2
          const hit = document.elementFromPoint(x, y)
          const strip = document.querySelector('.workshop-preview').getBoundingClientRect()
          return {
            uncovered: hit === node || node.contains(hit),
            inside: box.top >= 0 && box.bottom <= innerHeight,
            strip: strip.bottom > 0 && strip.top < innerHeight && strip.height > 0
          }
        })
        assert.ok(view.inside, `${label} ${step}: the control is within the viewport`)
        assert.ok(view.uncovered, `${label} ${step}: the sticky preview does not cover the control`)
        assert.ok(view.strip, `${label} ${step}: the preview strip intersects the viewport`)
      }

      const brand = workshop.getByRole('textbox', { name: 'Brand color', exact: true })
      const accent = await variable('--rad-color-accent')
      await brand.focus()
      await assertEditable(brand, 'brand color')
      await brand.fill('#166534')
      assert.notEqual(await variable('--rad-color-accent'), accent, `${label}: brand color applied`)
      await assertEditable(brand, 'brand color after the edit')

      await editor('Spacing & surfaces').click()
      const spacing = workshop
        .locator('.geometry-editor')
        .getByRole('slider', { name: 'Breathing room', exact: true })
      const gap = await variable('--rad-spacing-group-gap')
      await spacing.focus()
      await assertEditable(spacing, 'spacing slider')
      await spacing.press('ArrowRight')
      await spacing.press('ArrowRight')
      assert.notEqual(await variable('--rad-spacing-group-gap'), gap, `${label}: spacing applied`)
      await assertEditable(spacing, 'spacing slider after the edit')

      await editor('Motion').click()
      const stiffness = workshop
        .locator('.motion-editor')
        .getByRole('spinbutton', { name: 'Stiffness', exact: true })
      const before = await stiffness.inputValue()
      await stiffness.focus()
      await assertEditable(stiffness, 'stiffness')
      await stiffness.press('ArrowUp')
      assert.notEqual(await stiffness.inputValue(), before, `${label}: stiffness changed`)
      await assertEditable(stiffness, 'stiffness after the edit')
      await editor('Color').click()

      const expand = preview.getByRole('button', { name: 'Expand', exact: true })
      assert.equal(await expand.getAttribute('aria-expanded'), 'false')
      await expand.focus()
      await page.keyboard.press('Enter')
      const collapse = preview.getByRole('button', { name: 'Collapse', exact: true })
      assert.equal(await collapse.getAttribute('aria-expanded'), 'true')
      const full = await preview.boundingBox()
      assert.ok(
        full.y <= 1 && full.height >= height - 1,
        `${label}: the expanded preview fills the viewport`
      )
      await page.keyboard.press('Space')
      assert.equal(await expand.getAttribute('aria-expanded'), 'false')
      assert.equal(
        await expand.evaluate(node => node === document.activeElement),
        true,
        `${label}: focus stays on the toggle`
      )
      assert.ok((await preview.boundingBox()).height < height * 0.5, `${label}: collapsed again`)

      const options = preview.getByRole('button', { name: 'Preview options', exact: true })
      const scene = preview.getByRole('combobox', { name: 'Scene', exact: true })
      assert.equal(await options.getAttribute('aria-expanded'), 'false')
      assert.equal(await scene.isVisible(), false, `${label}: preview options start folded`)
      await options.focus()
      await page.keyboard.press('Enter')
      assert.equal(await options.getAttribute('aria-expanded'), 'true')
      await page.keyboard.press('Tab')
      assert.equal(
        await scene.evaluate(node => node === document.activeElement),
        true,
        `${label}: Tab moves from the toggle into the options`
      )
      await scene.selectOption('components')
      await canvas.getByRole('button', { name: 'Try the action', exact: true }).waitFor()
      await page.keyboard.press('Escape')
      assert.equal(await options.getAttribute('aria-expanded'), 'false')
      assert.equal(
        await options.evaluate(node => node === document.activeElement),
        true,
        `${label}: Escape returns focus to Preview options`
      )

      const inspect = preview.getByRole('button', { name: 'Inspect', exact: true })
      await inspect.click()
      await canvas.getByRole('button', { name: 'Try the action', exact: true }).click()
      const inspector = preview.getByRole('region', { name: 'Inspected element', exact: true })
      await inspector.getByRole('button', { name: /Control roundness/ }).click()
      const radius = workshop.getByRole('spinbutton', { name: 'Control roundness', exact: true })
      await page.waitForFunction(
        () => document.activeElement?.getAttribute('type') === 'number',
        null,
        { timeout: 2000 }
      )
      assert.equal(
        await radius.evaluate(node => node === document.activeElement),
        true,
        `${label}: the jump focuses control radius`
      )
      await assertEditable(radius, 'inspect jump')
      await page.screenshot({ path: `output/docs/workshop-narrow-${width}.png` })
    }
    assert.deepEqual(errors, [], 'no narrow workshop runtime errors')
    console.log(
      'Narrow workshop passed: sticky preview strip beside brand color, spacing slider and motion edits at 375x812 and 320x568, keyboard expand/collapse and Preview options, scene change, Inspect jump below the strip, no horizontal scroll at 320–1024px.'
    )
  } catch (error) {
    await page.screenshot({ path: 'output/docs/workshop-narrow-failure.png' }).catch(() => {})
    throw error
  } finally {
    await page.close()
  }
}
