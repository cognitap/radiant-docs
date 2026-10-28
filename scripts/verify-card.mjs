import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

export async function verifyCard(browser, baseURL) {
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
  const settled = demo =>
    demo
      .locator('[data-rad-layout-part]')
      .evaluateAll(parts => parts.every(part => part.style.position === ''))
  async function settle(demo) {
    for (let i = 0; i < 240; i++) {
      if (await settled(demo)) return
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)))
    }
    throw new Error('Project Card motion did not settle')
  }
  try {
    const staticPage = await browser.newPage({ javaScriptEnabled: false })
    await staticPage.goto(`${baseURL}/docs/card/`)
    const staticFrame = staticPage.getByRole('region', { name: 'Project dashboard', exact: true })
    assert.equal(await staticFrame.getByRole('article').count(), 3)
    assert.equal(await staticFrame.locator('[data-rad-layout-part][style*="absolute"]').count(), 0)
    assert.equal(
      await staticFrame
        .getByRole('button', { name: 'Save note', exact: true })
        .first()
        .isDisabled(),
      true
    )
    assert.equal(
      await staticFrame
        .getByRole('article', { name: 'Calmer inbox', exact: true })
        .getByRole('textbox', { name: 'Project note', exact: true })
        .inputValue(),
      'Keep the daily digest optional.'
    )
    assert.equal(
      await staticFrame
        .getByRole('link', { name: 'Open guide', exact: true })
        .first()
        .getAttribute('href'),
      '/docs/getting-started/'
    )
    await staticFrame.locator('.demo-sources > summary').click()
    assert.equal(await staticFrame.locator('pre').count(), 1)
    await staticPage.close()

    await page.goto(`${baseURL}/docs/card/`)
    const demo = page.getByRole('region', { name: 'Project dashboard', exact: true })
    const inbox = demo.getByRole('article', { name: 'Calmer inbox', exact: true })
    const card = inbox.locator('[data-slot=card]')
    const input = inbox.getByRole('textbox', { name: 'Project note', exact: true })
    const move = inbox.getByRole('button', { name: /Move (next|first): Calmer inbox/ })
    assert.equal(await card.getAttribute('role'), null)
    assert.equal(await card.getAttribute('tabindex'), null)
    assert.equal(await inbox.getByRole('heading', { name: 'Calmer inbox', level: 3 }).count(), 1)
    await input.fill('Keep this project draft')
    await inbox.getByRole('button', { name: 'Show details', exact: true }).click()
    await inbox.getByRole('button', { name: 'Add step', exact: true }).click()
    await inbox.getByText('Step 2.', { exact: false }).waitFor()
    await move.focus()
    await move.press('Space')
    assert.equal(await move.evaluate(node => node === document.activeElement), true)
    assert.deepEqual(
      await demo
        .locator('[data-project]')
        .evaluateAll(nodes => nodes.map(node => node.dataset.project)),
      ['welcome', 'inbox', 'launch']
    )
    assert.equal(await input.inputValue(), 'Keep this project draft')
    await inbox.getByRole('button', { name: 'Save note', exact: true }).click()
    await inbox
      .getByRole('status')
      .filter({ hasText: 'Saved locally: Keep this project draft' })
      .waitFor()
    await inbox.getByRole('checkbox', { name: 'Outline this card', exact: true }).check()
    assert.equal(await card.evaluate(node => getComputedStyle(node).outlineStyle), 'dashed')
    await demo.getByRole('checkbox', { name: 'Stack cards', exact: true }).check()
    await settle(demo)
    assert.equal(
      await card.evaluate(node =>
        [node.style.width, node.style.height, node.style.translate, node.style.scale].every(
          value => value === ''
        )
      ),
      true
    )
    await inbox.getByRole('button', { name: 'Reset note', exact: true }).click()
    assert.equal(await input.inputValue(), 'Keep the daily digest optional.')
    assert.equal(
      await inbox
        .getByRole('button', { name: 'Hide details', exact: true })
        .getAttribute('aria-expanded'),
      'true'
    )
    await inbox.getByRole('button', { name: 'Trim steps', exact: true }).click()
    assert.equal(await inbox.getByText('Step 2.', { exact: false }).count(), 0)
    await demo.getByRole('button', { name: 'Reset layout', exact: true }).click()
    await settle(demo)
    assert.deepEqual(
      await demo
        .locator('[data-project]')
        .evaluateAll(nodes => nodes.map(node => node.dataset.project)),
      ['inbox', 'welcome', 'launch']
    )
    assert.equal(await card.evaluate(node => getComputedStyle(node).outlineStyle), 'dashed')
    await demo.screenshot({
      path: 'output/docs/card-dashboard-desktop.png',
      animations: 'disabled'
    })
    await demo.getByRole('combobox', { name: 'Theme', exact: true }).selectOption('glass')
    await demo.getByRole('combobox', { name: 'Mode', exact: true }).selectOption('dark')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await demo.getByRole('status').filter({ hasText: 'Reduced by system' }).waitFor()
    await move.click()
    await settle(demo)
    assert.equal(await input.inputValue(), 'Keep the daily digest optional.')
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await demo.getByRole('checkbox', { name: 'Turn off spatial motion', exact: true }).check()
    await demo.getByRole('status').filter({ hasText: 'Motion off' }).waitFor()
    await move.click()
    assert.equal(await settled(demo), true)
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 1100 })
      await settle(demo)
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true
      )
      for (const project of await demo.getByRole('article').all()) {
        const bounds = await project.boundingBox()
        for (const control of await project.locator('button, input, a, progress').all()) {
          const box = await control.boundingBox()
          if (box)
            assert.ok(
              box.x >= bounds.x - 1 && box.x + box.width <= bounds.x + bounds.width + 1,
              'Card controls stay inside the surface'
            )
        }
      }
    }
    await demo.screenshot({ path: 'output/docs/card-dashboard-mobile.png', animations: 'disabled' })
    const staticDemo = page.getByRole('region', { name: 'Static project cards', exact: true })
    const staticOff = staticDemo.getByRole('checkbox', {
      name: 'Turn off spatial motion',
      exact: true
    })
    assert.equal(await staticOff.isChecked(), true)
    assert.equal(await staticOff.isDisabled(), true)
    await staticDemo
      .getByRole('article', { name: 'Launch notes', exact: true })
      .getByRole('button', { name: /Move (next|first): Launch notes/ })
      .click()
    assert.equal(
      await staticDemo.locator('[data-project]').first().getAttribute('data-project'),
      'launch'
    )
    assert.equal(await settled(staticDemo), true)
    for (const frame of [demo, staticDemo]) {
      await frame.locator('.demo-sources > summary').click()
      const file = 'card/CardExamples.tsx'
      const source = await readFile(new URL(`../examples/${file}`, import.meta.url), 'utf8')
      assert.equal(await frame.getByLabel(`Source: ${file}`, { exact: true }).textContent(), source)
      await frame.getByRole('button', { name: `Copy ${file}`, exact: true }).click()
      await frame
        .getByRole('status')
        .filter({ hasText: `Copied ${file}.` })
        .waitFor()
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), source)
    }
    await demo.getByRole('button', { name: 'Reset preview', exact: true }).click()
    assert.equal(await input.inputValue(), 'Keep the daily digest optional.')
    assert.equal(
      await inbox
        .getByRole('button', { name: 'Show details', exact: true })
        .getAttribute('aria-expanded'),
      'false'
    )
    await page.setViewportSize({ width: 1440, height: 1100 })
    await demo.getByRole('link', { name: 'Open guide', exact: true }).first().press('Enter')
    await page.waitForURL('**/docs/getting-started/')
    assert.deepEqual(errors, [], 'Card demos have no hydration/runtime/console errors')
    console.log(
      'Card passed: passive hosts, native SSR/form/link behavior, keyed drafts and keyboard reorder focus, dynamic resize, caller styles, live off/reduced motion, static variant, exact source/copy and mobile containment.'
    )
  } catch (error) {
    await page.screenshot({ path: 'output/docs/card-failure.png', fullPage: true }).catch(() => {})
    throw error
  } finally {
    await context.close()
  }
}
