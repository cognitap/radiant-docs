import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

export async function verifyAccordion(browser, baseURL) {
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
    await staticPage.goto(`${baseURL}/docs/accordion/`)
    const staticFrame = staticPage.getByRole('region', { name: 'The field guide', exact: true })
    const staticHabits = staticFrame
      .locator('summary')
      .filter({ hasText: '02 · How do I keep it useful?' })
    await staticHabits.click()
    assert.equal(await staticHabits.evaluate(node => node.parentElement.open), true)
    await staticHabits.click()
    await staticHabits.focus()
    await staticHabits.press('Tab')
    assert.equal(
      await staticFrame
        .locator('summary')
        .filter({ hasText: '03 · Can I bring my team?' })
        .evaluate(node => node === document.activeElement),
      true
    )
    await staticFrame.locator('.demo-sources > summary').click()
    assert.equal(await staticFrame.locator('pre').count(), 1)
    await staticPage.close()

    await page.goto(`${baseURL}/docs/accordion/`)
    const guide = page.getByRole('region', { name: 'The field guide', exact: true })
    const start = guide.locator('details[data-value=start]')
    const habits = guide.locator('details[data-value=habits]')
    const input = guide.getByRole('textbox', { name: 'Workspace name', exact: true })
    await input.fill('Our studio')
    await habits.locator('summary').focus()
    await habits.locator('summary').press('Enter')
    await guide.getByRole('button', { name: 'One more tip', exact: true }).click()
    await guide.getByText('Habit 2.', { exact: true }).waitFor()
    assert.equal(await start.evaluate(node => node.open), false)
    assert.equal(
      await start.locator('[data-slot~=accordion-content]').evaluate(node => node.inert),
      true
    )
    await guide.getByRole('button', { name: 'Got it', exact: true }).click()
    assert.equal(await habits.evaluate(node => node.open), false)
    assert.equal(
      await habits.locator('summary').evaluate(node => node === document.activeElement),
      true
    )
    await start.locator('summary').press('Space')
    assert.equal(await input.inputValue(), 'Our studio')
    assert.equal(await start.locator('summary > h3').count(), 1)
    await guide.screenshot({
      path: 'output/docs/accordion-guide-desktop.png',
      animations: 'disabled'
    })
    await guide.getByRole('combobox', { name: 'Theme', exact: true }).selectOption('glass')
    await guide.getByRole('combobox', { name: 'Mode', exact: true }).selectOption('dark')
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 1100 })
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true
      )
      const card = await guide.locator('[data-slot=card]').boundingBox()
      for (const control of await guide
        .locator('[data-slot~=accordion-trigger], [data-slot=input]')
        .all()) {
        const bounds = await control.boundingBox()
        if (bounds)
          assert.ok(
            bounds.x >= card.x - 1 && bounds.x + bounds.width <= card.x + card.width + 1,
            'FAQ controls fit the Card'
          )
      }
      await habits.locator('summary').click()
      const content = await habits.locator('[data-slot~=accordion-content]').boundingBox()
      for (const control of await habits.getByRole('button').all()) {
        const bounds = await control.boundingBox()
        assert.ok(
          bounds.x >= content.x && bounds.x + bounds.width <= content.x + content.width + 1,
          'FAQ actions fit the clipping panel'
        )
      }
      await start.locator('summary').click()
    }
    await guide.screenshot({
      path: 'output/docs/accordion-guide-mobile.png',
      animations: 'disabled'
    })
    await page.setViewportSize({ width: 1440, height: 1100 })

    const lab = page.getByRole('region', { name: 'Accordion selection lab', exact: true })
    const notes = lab.locator('details[data-value=notes]')
    const rhythm = lab.locator('details[data-value=rhythm]')
    const note = lab.getByRole('textbox', { name: 'A retained note', exact: true })
    await note.fill('Keep this draft')
    await lab.getByRole('button', { name: 'Add detail', exact: true }).click()
    await lab.getByRole('status').filter({ hasText: '2 details' }).waitFor()
    await lab.getByRole('button', { name: 'Quick switch', exact: true }).click()
    await note.waitFor()
    assert.equal(await rhythm.evaluate(node => node.open), false)
    await lab.getByRole('checkbox', { name: 'Allow multiple sections', exact: true }).check()
    assert.equal(await note.inputValue(), 'Keep this draft')
    await lab.getByRole('button', { name: 'Open both', exact: true }).click()
    assert.deepEqual(
      await lab.locator('details[data-value]').evaluateAll(nodes => nodes.map(node => node.open)),
      [true, true, false]
    )
    await lab.getByRole('checkbox', { name: 'Disable selection', exact: true }).check()
    await rhythm.locator('summary').click({ force: true })
    assert.equal(await rhythm.evaluate(node => node.open), true)
    await lab.getByRole('checkbox', { name: 'Disable selection', exact: true }).uncheck()
    const archive = lab.locator('details[data-value=archive] > summary')
    await archive.click({ force: true })
    assert.equal(await archive.getAttribute('aria-disabled'), 'true')
    assert.equal(await archive.evaluate(node => node.parentElement.open), false)
    await lab.getByRole('checkbox', { name: 'Notes motion off', exact: true }).check()
    assert.equal(
      await notes.evaluate(node => node.style.getPropertyValue('--_rad-spring-details-height')),
      ''
    )
    await lab.getByRole('checkbox', { name: 'Notes motion off', exact: true }).uncheck()
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await lab.getByRole('status').filter({ hasText: 'Reduced by system' }).waitFor()
    await lab.getByRole('button', { name: 'Close all', exact: true }).click()
    assert.equal(
      await notes.evaluate(node =>
        parseFloat(node.style.getPropertyValue('--_rad-spring-details-height'))
      ),
      0
    )
    await lab.getByRole('button', { name: 'Open both', exact: true }).click()
    assert.equal(await note.inputValue(), 'Keep this draft')
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await lab.getByRole('checkbox', { name: 'Turn off spatial motion', exact: true }).check()
    await lab.getByRole('status').filter({ hasText: 'Motion off' }).waitFor()
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 1100 })
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true
      )
      const content = await notes.locator('[data-slot~=accordion-content]').boundingBox()
      for (const control of await notes.getByRole('button').all()) {
        const bounds = await control.boundingBox()
        assert.ok(
          bounds.x >= content.x && bounds.x + bounds.width <= content.x + content.width + 1,
          'Selection actions fit the panel'
        )
      }
    }
    await lab.getByRole('button', { name: 'Reset preview', exact: true }).click()
    assert.equal(await note.inputValue(), 'Keep the useful details.')
    for (const demo of [guide, lab]) {
      await demo.locator('.demo-sources > summary').click()
      const file = 'accordion/AccordionExamples.tsx'
      const source = await readFile(new URL(`../examples/${file}`, import.meta.url), 'utf8')
      assert.equal(await demo.getByLabel(`Source: ${file}`, { exact: true }).textContent(), source)
      await demo.getByRole('button', { name: `Copy ${file}`, exact: true }).click()
      await demo
        .getByRole('status')
        .filter({ hasText: `Copied ${file}.` })
        .waitFor()
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), source)
    }
    assert.deepEqual(errors, [], 'Accordion has no hydration/runtime/console errors')
    console.log(
      'Accordion passed: native SSR/keyboard, single/multiple selection, disabled guards, retained drafts and focus, dynamic content, live motion policy, exact source/copy and mobile containment.'
    )
  } catch (error) {
    await page
      .screenshot({ path: 'output/docs/accordion-failure.png', fullPage: true })
      .catch(() => {})
    throw error
  } finally {
    await context.close()
  }
}
