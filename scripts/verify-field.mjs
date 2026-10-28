import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

export async function verifyField(browser, baseURL) {
  const context = await browser.newContext({
    permissions: ['clipboard-read', 'clipboard-write'],
    viewport: { width: 1440, height: 1100 }
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  const title = 'A workspace, with room to grow'
  try {
    const staticPage = await browser.newPage({ javaScriptEnabled: false })
    await staticPage.goto(`${baseURL}/docs/field/`)
    const staticFrame = staticPage.getByRole('region', { name: title, exact: true })
    assert.equal(
      await staticFrame.getByRole('button', { name: 'Create workspace', exact: true }).isDisabled(),
      true
    )
    await staticFrame.locator('summary').press('Enter')
    assert.equal(await staticFrame.locator('pre').count(), 1)
    await staticPage.close()

    await page.goto(`${baseURL}/docs/field/`)
    const frame = page.getByRole('region', { name: title, exact: true })
    const form = frame.getByRole('form', { name: 'Create a workspace', exact: true })
    const name = form.getByRole('textbox', { name: 'Workspace name', exact: true })
    const address = form.getByRole('textbox', { name: 'Workspace address', exact: true })
    const feed = form.getByRole('checkbox', { name: 'Team feed', exact: true })
    const submit = form.getByRole('button', { name: 'Create workspace', exact: true })
    const hint = frame.getByRole('checkbox', { name: 'Show helpful hints', exact: true })
    const off = frame.getByRole('checkbox', { name: 'Turn off spatial motion', exact: true })
    const dimensions = await name.boundingBox()
    const ids = await form.locator('input').evaluateAll(nodes => nodes.map(node => node.id))
    await submit.click()
    assert.equal(await name.evaluate(node => node === document.activeElement), true)
    assert.equal(await form.getByRole('alert').count(), 2)
    assert.equal(await name.getAttribute('aria-invalid'), 'true')
    assert.equal(
      await name.evaluate(node =>
        node
          .getAttribute('aria-describedby')
          .split(/\s+/)
          .every(id => !!document.getElementById(id))
      ),
      true
    )
    assert.equal(await feed.getAttribute('required'), null)
    const group = form.getByRole('group', { name: 'Publishing channels', exact: true })
    assert.equal(await group.getAttribute('aria-invalid'), 'true')
    await form.locator('[data-rad-layout-part][style*="height"]').first().waitFor()
    assert.equal((await name.boundingBox()).height, dimensions.height)
    assert.equal(await name.evaluate(node => getComputedStyle(node).scale), 'none')
    await frame.screenshot({
      path: 'output/docs/field-validation-errors.png',
      animations: 'disabled'
    })

    await name.fill('Orbit Studio')
    assert.equal(await name.getAttribute('aria-invalid'), null)
    await address.fill('Wrong Address')
    await address.press('Tab')
    assert.equal(await address.getAttribute('aria-invalid'), 'true')
    await address.fill('orbit-studio')
    await feed.focus()
    await feed.press('Space')
    await submit.click()
    await form
      .getByRole('status')
      .filter({ hasText: 'Created locally: Orbit Studio · orbit-studio · Team feed.' })
      .waitFor()
    assert.equal(await form.getByRole('alert').count(), 0)

    await hint.uncheck()
    assert.equal(await name.getAttribute('aria-describedby'), null)
    await off.check()
    assert.equal(await form.locator('[data-rad-layout-part][style*="height"]').count(), 0)
    await hint.check()
    assert.equal(await form.locator('[data-rad-layout-part][style*="height"]').count(), 0)
    await off.uncheck()
    await hint.uncheck()
    await form.locator('[data-rad-layout-part][style*="height"]').first().waitFor()
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForFunction(
      () =>
        !document.querySelector(
          'form[aria-label="Create a workspace"] [data-rad-layout-part][style*="height"]'
        )
    )
    await frame.getByText('Spatial motion: reduced by system.', { exact: false }).waitFor()
    await hint.check()
    assert.equal(await form.locator('[data-rad-layout-part][style*="height"]').count(), 0)
    await page.emulateMedia({ reducedMotion: 'no-preference' })

    await frame.getByRole('checkbox', { name: 'Lock publishing channels', exact: true }).check()
    assert.equal(await feed.isDisabled(), true)
    assert.equal(await form.evaluate(node => new FormData(node).has('channels')), false)
    await submit.click()
    await form.getByRole('status').filter({ hasText: 'channels locked.' }).waitFor()
    await form.getByRole('button', { name: 'Reset draft', exact: true }).click()
    assert.equal(await name.inputValue(), '')
    assert.equal(await address.inputValue(), 'orbit-studio')
    assert.equal(await feed.isChecked(), false)
    assert.equal(await form.getByRole('alert').count(), 0)
    assert.deepEqual(
      await form.locator('input').evaluateAll(nodes => nodes.map(node => node.id)),
      ids
    )

    await frame.getByRole('combobox', { name: 'Theme', exact: true }).selectOption('glass')
    await frame.getByRole('combobox', { name: 'Mode', exact: true }).selectOption('dark')
    await frame.getByRole('combobox', { name: 'Control size', exact: true }).selectOption('large')
    assert.equal(await name.getAttribute('data-control-size'), 'large')
    assert.equal(
      await name.evaluate(node => getComputedStyle(node.closest('[data-rad-theme]')).colorScheme),
      'dark'
    )
    await submit.click()
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 1000 })
      // ResizeObserver schedules measurement on the next frame; let it begin before awaiting rest.
      await page.evaluate(
        () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      )
      await page.waitForFunction(
        () =>
          !document.querySelector(
            'form[aria-label="Create a workspace"] [data-rad-layout-part][style*="height"]'
          )
      )
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `Field guide fits at ${width}px`
      )
      const card = await frame.locator('[data-slot="card"]').boundingBox()
      for (const control of [name, address, feed, submit]) {
        const bounds = await control.boundingBox()
        assert.ok(
          bounds.x >= card.x - 1 && bounds.x + bounds.width <= card.x + card.width + 1,
          `Field control remains in Card at ${width}px: ${JSON.stringify({ bounds, card })}`
        )
      }
    }
    await frame.screenshot({
      path: 'output/docs/field-validation-mobile.png',
      animations: 'disabled'
    })
    await page.setViewportSize({ width: 1440, height: 1100 })
    await frame.getByRole('button', { name: 'Reset preview', exact: true }).click()
    assert.equal(await off.isChecked(), false)
    assert.equal(await feed.isDisabled(), false)
    assert.equal(
      await frame.getByRole('combobox', { name: 'Mode', exact: true }).inputValue(),
      'light'
    )
    await frame.screenshot({
      path: 'output/docs/field-validation-desktop.png',
      animations: 'disabled'
    })

    await frame.locator('summary').click()
    const file = 'field/FieldValidationExample.tsx'
    const source = await readFile(new URL(`../examples/${file}`, import.meta.url), 'utf8')
    assert.equal(await frame.getByLabel(`Source: ${file}`, { exact: true }).textContent(), source)
    await frame.getByRole('button', { name: `Copy ${file}`, exact: true }).click()
    await frame
      .getByRole('status')
      .filter({ hasText: `Copied ${file}.` })
      .waitFor()
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), source)
    assert.deepEqual(errors, [], 'Field demo has no hydration, runtime or console errors')
    console.log(
      'Field passed: immediate ARIA, live validation, keyboard groups, native adapter, motion off/live reduced motion, reset, FormData, source/copy, SSR and narrow Card containment.'
    )
  } catch (error) {
    await page.screenshot({ path: 'output/docs/field-failure.png', fullPage: true }).catch(() => {})
    throw error
  } finally {
    await context.close()
  }
}
