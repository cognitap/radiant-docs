import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

export async function verifyDialog(browser, baseURL) {
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
  try {
    const staticPage = await browser.newPage({ javaScriptEnabled: false })
    await staticPage.goto(`${baseURL}/docs/dialog/`)
    const staticFrame = staticPage.getByRole('region', {
      name: 'A profile worth sharing',
      exact: true
    })
    assert.equal(
      await staticFrame
        .getByRole('button', { name: 'Edit your details', exact: true })
        .isDisabled(),
      true
    )
    assert.equal(await staticFrame.locator('dialog[open]').count(), 0)
    await staticFrame.locator('.demo-sources > summary').press('Enter')
    assert.equal(await staticFrame.locator('pre').count(), 1)
    await staticPage.close()

    await page.goto(`${baseURL}/docs/dialog/`)
    const frame = page.getByRole('region', { name: 'A profile worth sharing', exact: true })
    const trigger = frame.getByRole('button', { name: 'Edit your details', exact: true })
    const panel = frame.getByRole('dialog', { name: 'A little more you.', exact: true })
    const name = panel.getByRole('textbox', { name: 'Display name', exact: true })
    const email = panel.getByRole('textbox', { name: 'Work email', exact: true })
    const save = panel.getByRole('button', { name: 'Save profile', exact: true })
    await trigger.click()
    assert.equal(await panel.evaluate(node => node.matches(':modal')), true)
    assert.equal(await trigger.getAttribute('aria-controls'), await panel.getAttribute('id'))
    const ids = await panel.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id))
    assert.equal(await panel.evaluate(node => node.contains(document.activeElement)), true)
    await name.fill('')
    await save.click()
    await panel.getByRole('alert').filter({ hasText: 'Use at least two characters' }).waitFor()
    assert.equal(await name.evaluate(node => node === document.activeElement), true)
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
    await name.fill('Grace Hopper')
    await email.fill('invalid')
    await save.click()
    assert.equal(await email.evaluate(node => node === document.activeElement), true)
    await page.screenshot({ path: 'output/docs/dialog-profile-error.png' })
    await panel.getByRole('button', { name: 'Reset fields', exact: true }).click()
    assert.equal(await name.inputValue(), 'Ada Lovelace')
    assert.equal(await email.inputValue(), 'ada@example.com')
    await name.fill('Grace Hopper')
    await save.click()
    assert.equal(await save.getAttribute('aria-busy'), 'true')
    assert.equal(await name.isDisabled(), true)
    assert.equal(
      await panel.getByRole('button', { name: 'Cancel editing', exact: true }).isDisabled(),
      true
    )
    assert.equal(await save.evaluate(node => node === document.activeElement), true)
    await page.keyboard.press('Escape')
    assert.equal(await panel.isVisible(), true, 'Pending work owns dismissal policy')
    await panel.waitFor({ state: 'hidden' })
    await frame
      .getByRole('status')
      .filter({ hasText: 'Saved locally: Grace Hopper · ada@example.com.' })
      .waitFor()
    assert.equal(await trigger.evaluate(node => node === document.activeElement), true)
    await trigger.click()
    assert.equal(await name.inputValue(), 'Grace Hopper')
    assert.deepEqual(
      await panel.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id)),
      ids
    )
    await name.fill('Discarded draft')
    await panel.getByRole('button', { name: 'Cancel editing', exact: true }).click()
    await trigger.click()
    assert.equal(await name.inputValue(), 'Grace Hopper')
    await page.keyboard.press('Escape')
    await panel.waitFor({ state: 'hidden' })
    assert.equal(await trigger.evaluate(node => node === document.activeElement), true)
    await frame.getByRole('checkbox', { name: 'Turn off spatial motion', exact: true }).check()
    await trigger.click()
    assert.equal(await panel.evaluate(node => node.style.scale), '1')
    await panel.getByRole('button', { name: 'Cancel editing', exact: true }).click()

    for (const theme of ['radiant', 'glass', 'sharp-3d']) {
      await frame.getByRole('combobox', { name: 'Theme', exact: true }).selectOption(theme)
      for (const mode of ['light', 'dark']) {
        await frame.getByRole('combobox', { name: 'Mode', exact: true }).selectOption(mode)
        await trigger.click()
        assert.equal(await panel.evaluate(node => node.matches(':modal')), true)
        assert.equal(
          await panel.evaluate(node =>
            node.closest('[data-rad-theme]').getAttribute('data-rad-theme')
          ),
          theme
        )
        await panel.getByRole('button', { name: 'Cancel editing', exact: true }).click()
      }
    }
    await trigger.click()
    await page.screenshot({ path: 'output/docs/dialog-profile-desktop.png' })
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 700 })
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `Dialog guide fits at ${width}px`
      )
      const bounds = await panel.boundingBox()
      assert.ok(bounds.x >= 15 && bounds.x + bounds.width <= width - 15)
      assert.ok(bounds.height <= 670)
      for (const input of [name, email]) {
        const box = await input.boundingBox()
        assert.ok(box.x >= bounds.x && box.x + box.width <= bounds.x + bounds.width)
      }
    }
    await page.screenshot({ path: 'output/docs/dialog-profile-mobile.png' })
    await page.keyboard.press('Escape')
    await panel.waitFor({ state: 'hidden' })
    await page.setViewportSize({ width: 1440, height: 1100 })

    const lab = page.getByRole('region', { name: 'Dialog transition lab', exact: true })
    const labTrigger = lab.getByRole('button', { name: 'Open transition lab', exact: true })
    const labPanel = lab.getByRole('dialog', { name: 'Room to explore.', exact: true })
    await labTrigger.click()
    await labPanel.getByRole('checkbox', { name: 'More detail', exact: true }).check()
    assert.equal(await labPanel.evaluate(node => node.scrollHeight > node.clientHeight), true)
    await labPanel.getByRole('button', { name: 'Close and reopen', exact: true }).click()
    await labPanel.waitFor()
    await page.waitForFunction(
      () => document.querySelector('dialog[open]')?.getAttribute('data-state') === 'open'
    )
    assert.equal(await page.locator('[data-rad-motion-exit]').count(), 0)
    await labPanel.getByRole('checkbox', { name: 'Pause spatial motion', exact: true }).check()
    assert.equal(await labPanel.evaluate(node => node.style.scale), '1')
    await labPanel.getByRole('checkbox', { name: 'Pause spatial motion', exact: true }).uncheck()
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await labPanel.getByRole('status').filter({ hasText: 'reduced by system' }).waitFor()
    assert.equal(await labPanel.evaluate(node => node.style.scale), '1')
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await labPanel.getByRole('checkbox', { name: 'Disable content motion', exact: true }).check()
    assert.equal(await labPanel.evaluate(node => node.style.scale), '')
    await labPanel.getByRole('button', { name: 'Finish natively', exact: true }).click()
    await labPanel.waitFor({ state: 'hidden' })
    assert.equal(await labTrigger.evaluate(node => node === document.activeElement), true)
    await lab.getByRole('button', { name: 'Reset preview', exact: true }).click()
    await labTrigger.click()
    assert.equal(
      await labPanel.getByRole('checkbox', { name: 'More detail', exact: true }).isChecked(),
      false
    )
    await labPanel.getByRole('button', { name: 'Close lab', exact: true }).click()
    await labPanel.waitFor({ state: 'hidden' })

    for (const demo of [frame, lab]) {
      await demo.locator('.demo-sources > summary').click()
      const file = 'dialog/DialogExamples.tsx'
      const source = await readFile(new URL(`../examples/${file}`, import.meta.url), 'utf8')
      assert.equal(await demo.getByLabel(`Source: ${file}`, { exact: true }).textContent(), source)
      await demo.getByRole('button', { name: `Copy ${file}`, exact: true }).click()
      await demo
        .getByRole('status')
        .filter({ hasText: `Copied ${file}.` })
        .waitFor()
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), source)
    }
    assert.deepEqual(errors, [], 'Dialog demos have no hydration/runtime/console errors')
    console.log(
      'Dialog passed: SSR, exact source/copy, native modal/focus/Escape/form close, validation/reset/pending/save/cancel, stable IDs, themes, rapid reopen, content size/scroll, live off/reduced motion, per-content off and mobile bounds.'
    )
  } catch (error) {
    await page
      .screenshot({ path: 'output/docs/dialog-failure.png', fullPage: true })
      .catch(() => {})
    throw error
  } finally {
    await context.close()
  }
}
