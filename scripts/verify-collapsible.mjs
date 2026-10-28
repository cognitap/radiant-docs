import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

export async function verifyCollapsible(browser, baseURL) {
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
    await staticPage.goto(`${baseURL}/docs/collapsible/`)
    const staticFrame = staticPage.getByRole('region', { name: 'A quieter inbox', exact: true })
    const staticSummary = staticFrame
      .locator('summary')
      .filter({ hasText: 'Advanced delivery options' })
    assert.equal(
      await staticFrame.getByRole('button', { name: 'Save preferences', exact: true }).isDisabled(),
      true
    )
    await staticSummary.click()
    assert.equal(
      await staticFrame.getByRole('textbox', { name: 'Topic 1', exact: true }).isVisible(),
      true
    )
    await staticSummary.click()
    await staticSummary.focus()
    await staticSummary.press('Tab')
    assert.equal(
      await staticFrame
        .getByRole('button', { name: 'Reset fields', exact: true })
        .evaluate(node => node === document.activeElement),
      true,
      'Closed native content stays out of Tab before hydration'
    )
    await staticFrame.locator('.demo-sources > summary').click()
    assert.equal(await staticFrame.locator('pre').count(), 1)
    await staticPage.close()

    await page.goto(`${baseURL}/docs/collapsible/`)
    const frame = page.getByRole('region', { name: 'A quieter inbox', exact: true })
    const form = frame.getByRole('form', { name: 'Delivery preferences', exact: true })
    const details = form.locator('details')
    const summary = details.locator('summary')
    const topic = form.getByRole('textbox', { name: 'Topic 1', exact: true })
    const content = details.locator('[data-slot=collapsible-content]')
    const contentId = await content.getAttribute('id')
    const email = form.getByRole('textbox', { name: 'Delivery email', exact: true })
    const save = form.getByRole('button', { name: 'Save preferences', exact: true })
    await summary.focus()
    await summary.press('Enter')
    await topic.fill('Design notes')
    await form.getByRole('button', { name: 'Add a topic', exact: true }).click()
    await form.getByRole('textbox', { name: 'Topic 2', exact: true }).waitFor()
    await form.getByRole('checkbox', { name: 'Include a daily digest', exact: true }).uncheck()
    assert.equal(await form.locator('[name=digestAt]').count(), 0)
    await form.getByRole('button', { name: 'Done with advanced options', exact: true }).click()
    assert.equal(await details.evaluate(node => node.open), false)
    assert.equal(await summary.evaluate(node => node === document.activeElement), true)
    assert.equal(await content.evaluate(node => node.inert), true)
    assert.deepEqual(await form.evaluate(node => new FormData(node).getAll('topics')), [
      'Design notes',
      'Release notes'
    ])
    await save.click()
    await form
      .getByRole('status')
      .filter({ hasText: 'digest off · topics Design notes, Release notes' })
      .waitFor()
    await summary.focus()
    await summary.press('Space')
    assert.equal(await topic.inputValue(), 'Design notes')
    await form.getByRole('button', { name: 'Reset fields', exact: true }).click()
    assert.equal(await details.evaluate(node => node.open), true)
    assert.equal(await topic.inputValue(), 'Product updates')
    assert.equal(await form.getByRole('textbox', { name: 'Topic 2', exact: true }).count(), 0)
    assert.equal(await form.locator('[name=digestAt]').inputValue(), '09:00')
    assert.equal(await content.getAttribute('id'), contentId)
    await email.fill('invalid')
    await save.click()
    await form.getByRole('alert').filter({ hasText: 'Use a valid delivery email.' }).waitFor()
    assert.equal(await email.evaluate(node => node === document.activeElement), true)
    assert.equal(await email.getAttribute('aria-invalid'), 'true')
    await frame.screenshot({
      path: 'output/docs/collapsible-settings-error.png',
      animations: 'disabled'
    })
    await email.fill('ada@example.com')
    const off = frame.getByRole('checkbox', { name: 'Turn off spatial motion', exact: true })
    await off.check()
    await summary.click()
    assert.equal(
      await details.evaluate(node =>
        Number.parseFloat(node.style.getPropertyValue('--_rad-spring-details-height'))
      ),
      0
    )
    await summary.click()
    assert.equal(await content.evaluate(node => node.inert), false)
    await off.uncheck()
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await frame.getByText('Spatial motion: reduced by system.', { exact: false }).waitFor()
    await summary.click()
    assert.equal(
      await details.evaluate(node =>
        Number.parseFloat(node.style.getPropertyValue('--_rad-spring-details-height'))
      ),
      0
    )
    await summary.click()
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await frame.screenshot({
      path: 'output/docs/collapsible-settings-desktop.png',
      animations: 'disabled'
    })
    await frame.getByRole('combobox', { name: 'Theme', exact: true }).selectOption('glass')
    await frame.getByRole('combobox', { name: 'Mode', exact: true }).selectOption('dark')
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 1100 })
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `Collapsible guide fits at ${width}px`
      )
      const card = await frame.locator('[data-slot=card]').boundingBox()
      const panelBox = await content.boundingBox()
      for (const button of await content.getByRole('button').all()) {
        const box = await button.boundingBox()
        assert.ok(
          box.x >= panelBox.x && box.x + box.width <= panelBox.x + panelBox.width + 1,
          'Disclosure actions fit the clipping panel'
        )
      }
      for (const input of [email, topic, save, summary]) {
        const bounds = await input.boundingBox()
        assert.ok(
          bounds.x >= card.x - 1 && bounds.x + bounds.width <= card.x + card.width + 1,
          'Disclosure controls stay within Card'
        )
      }
    }
    await frame.screenshot({
      path: 'output/docs/collapsible-settings-mobile.png',
      animations: 'disabled'
    })
    await page.setViewportSize({ width: 1440, height: 1100 })

    const lab = page.getByRole('region', { name: 'Collapsible height lab', exact: true })
    const labDetails = lab.locator('details[data-slot~="collapsible"]')
    const thought = lab.getByRole('textbox', { name: 'A retained thought', exact: true })
    await thought.fill('Keep this thought')
    await lab.getByRole('button', { name: 'Replace detail', exact: true }).click()
    assert.equal(await thought.inputValue(), 'Keep this thought')
    await lab.getByRole('button', { name: 'Add detail', exact: true }).click()
    await lab.getByRole('status').filter({ hasText: '2 notes' }).waitFor()
    await lab.getByRole('button', { name: 'Trim detail', exact: true }).click()
    await lab.getByRole('status').filter({ hasText: '1 note' }).waitFor()
    await lab.getByRole('button', { name: 'Quick close and reopen', exact: true }).click()
    await thought.waitFor()
    await lab.getByRole('status').filter({ hasText: 'Open' }).waitFor()
    await lab.getByRole('checkbox', { name: 'Disable disclosure motion', exact: true }).check()
    assert.equal(
      await labDetails.evaluate(node =>
        node.style.getPropertyValue('--_rad-spring-details-height')
      ),
      ''
    )
    await lab.getByRole('button', { name: 'Toggle from outside', exact: true }).click()
    assert.equal(await labDetails.evaluate(node => node.open), false)
    await lab.getByRole('button', { name: 'Toggle from outside', exact: true }).click()
    assert.equal(await thought.inputValue(), 'Keep this thought')
    await lab.getByRole('button', { name: 'Reset preview', exact: true }).click()
    assert.equal(await thought.inputValue(), 'A little room to think.')
    await frame.getByRole('button', { name: 'Reset preview', exact: true }).click()
    assert.equal(await details.evaluate(node => node.open), false)

    for (const demo of [frame, lab]) {
      await demo.locator('.demo-sources > summary').click()
      const file = 'collapsible/CollapsibleExamples.tsx'
      const source = await readFile(new URL(`../examples/${file}`, import.meta.url), 'utf8')
      assert.equal(await demo.getByLabel(`Source: ${file}`, { exact: true }).textContent(), source)
      await demo.getByRole('button', { name: `Copy ${file}`, exact: true }).click()
      await demo
        .getByRole('status')
        .filter({ hasText: `Copied ${file}.` })
        .waitFor()
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), source)
    }
    assert.deepEqual(errors, [], 'Collapsible demos have no hydration/runtime/console errors')
    console.log(
      'Collapsible passed: native SSR/keyboard, closed inert content and retained FormData, validation, reset without disclosure reset, dynamic/retained content, live off/reduced motion, source/copy and mobile containment.'
    )
  } catch (error) {
    await page
      .screenshot({ path: 'output/docs/collapsible-failure.png', fullPage: true })
      .catch(() => {})
    throw error
  } finally {
    await context.close()
  }
}
