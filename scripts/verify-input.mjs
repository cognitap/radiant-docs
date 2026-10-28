import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

export async function verifyInput(browser, baseURL) {
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
  const title = 'Your profile, in focus'
  try {
    const staticPage = await browser.newPage({ javaScriptEnabled: false })
    await staticPage.goto(`${baseURL}/docs/input/`)
    const staticFrame = staticPage.getByRole('region', { name: title, exact: true })
    assert.equal(
      await staticFrame.getByRole('button', { name: 'Save profile', exact: true }).isDisabled(),
      true
    )
    await staticFrame.locator('.demo-sources > summary').press('Enter')
    assert.equal(await staticFrame.locator('pre').count(), 1)
    await staticPage.close()

    await page.goto(`${baseURL}/docs/input/`)
    const frame = page.getByRole('region', { name: title, exact: true })
    const form = frame.getByRole('form', { name: 'Edit public profile', exact: true })
    const name = form.getByRole('textbox', { name: 'Display name', exact: true })
    const email = form.getByRole('textbox', { name: 'Work email', exact: true })
    const save = form.getByRole('button', { name: 'Save profile', exact: true })
    const reset = form.getByRole('button', { name: 'Reset draft', exact: true })
    const off = frame.getByRole('checkbox', { name: 'Turn off spatial motion', exact: true })
    const disabled = frame.getByRole('checkbox', { name: 'Disable email', exact: true })
    const cue = frame.locator('[data-focus-cue]')
    const ids = await form.locator('input').evaluateAll(nodes => nodes.map(node => node.id))
    await name.focus()
    assert.equal(await name.evaluate(node => node === document.activeElement), true)
    await page.waitForFunction(
      () => Number(document.querySelector('[data-focus-cue]').style.opacity) > 0.99
    )
    assert.equal(
      await name.evaluate(node => {
        const style = getComputedStyle(node)
        const extent = parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset)
        const input = node.getBoundingClientRect()
        for (let parent = node.parentElement; parent; parent = parent.parentElement) {
          if (getComputedStyle(parent).overflowX === 'visible') continue
          const bounds = parent.getBoundingClientRect()
          if (input.left - extent < bounds.left || input.right + extent > bounds.right) return false
        }
        return true
      }),
      true,
      'The whole native focus outline fits inside every clipping boundary'
    )
    const height = (await name.boundingBox()).height
    await name.fill('  Ada raw  ')
    await name.evaluate(node => node.setSelectionRange(2, 5))
    await name.press('G')
    assert.equal(
      await name.inputValue(),
      '  G raw  ',
      'editing preserves raw text and native selection'
    )
    assert.equal(await name.evaluate(node => node.selectionStart), 3)
    assert.equal(await name.evaluate(node => getComputedStyle(node).scale), 'none')
    assert.equal((await name.boundingBox()).height, height)

    await name.fill('')
    await email.fill('invalid')
    await save.click()
    assert.equal(await name.evaluate(node => node === document.activeElement), true)
    assert.equal(await form.getByRole('alert').count(), 2)
    for (const input of [name, email]) {
      assert.equal(await input.getAttribute('aria-invalid'), 'true')
      assert.equal(
        await input.evaluate(node =>
          node
            .getAttribute('aria-describedby')
            .split(/\s+/)
            .every(id => !!document.getElementById(id))
        ),
        true
      )
    }
    await frame.screenshot({ path: 'output/docs/input-profile-errors.png', animations: 'disabled' })
    await name.fill('Grace Hopper')
    await email.fill('grace@example.com')
    await save.click()
    assert.equal(await save.getAttribute('aria-busy'), 'true')
    assert.equal(await name.getAttribute('readonly'), '')
    assert.equal(await email.getAttribute('readonly'), '')
    assert.equal(await reset.isDisabled(), true)
    assert.equal(await form.evaluate(node => new FormData(node).get('displayName')), 'Grace Hopper')
    await form
      .getByRole('status')
      .filter({ hasText: 'Saved locally: Grace Hopper · grace@example.com.' })
      .waitFor()
    assert.equal(await form.getByRole('alert').count(), 0)
    await disabled.check()
    assert.equal(await email.isDisabled(), true)
    await save.click()
    await form.getByRole('status').filter({ hasText: 'email omitted (disabled)' }).waitFor()
    await reset.click()
    assert.equal(await name.inputValue(), 'Ada Lovelace')
    assert.equal(await email.inputValue(), 'ada@example.com')
    assert.equal(await email.isDisabled(), true)
    assert.deepEqual(
      await form.locator('input').evaluateAll(nodes => nodes.map(node => node.id)),
      ids
    )

    await off.check()
    await name.focus()
    assert.equal(Number(await cue.evaluate(node => node.style.opacity)), 1)
    await email.focus()
    assert.equal(await email.evaluate(node => node === document.activeElement), false)
    await off.uncheck()
    await name.focus()
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForFunction(
      () => Number(document.querySelector('[data-focus-cue]').style.opacity) === 1
    )
    await frame.getByText('Spatial motion: reduced by system.', { exact: false }).waitFor()
    assert.equal(await name.evaluate(node => node === document.activeElement), true)
    await page.emulateMedia({ reducedMotion: 'no-preference' })

    await frame.getByRole('combobox', { name: 'Theme', exact: true }).selectOption('glass')
    await frame.getByRole('combobox', { name: 'Mode', exact: true }).selectOption('dark')
    await frame.getByRole('combobox', { name: 'Control size', exact: true }).selectOption('large')
    assert.equal(await name.getAttribute('data-control-size'), 'large')
    assert.equal(
      await name.evaluate(node => getComputedStyle(node.closest('[data-rad-theme]')).colorScheme),
      'dark'
    )
    await frame.getByText('Compare shared control sizes', { exact: true }).click()
    const heights = []
    for (const size of ['small', 'medium', 'large']) {
      const sample = frame.getByRole('textbox', { name: `${size} input`, exact: true })
      assert.equal(await sample.getAttribute('size'), '24')
      assert.equal(await sample.getAttribute('data-control-size'), size)
      heights.push((await sample.boundingBox()).height)
      assert.equal(
        await frame
          .getByRole('checkbox', { name: `${size} updates`, exact: true })
          .getAttribute('data-control-size'),
        size
      )
      const group = frame.getByRole('group', { name: `${size} cadence`, exact: true })
      for (const radio of await group.getByRole('radio').all())
        assert.equal(await radio.getAttribute('data-control-size'), size)
    }
    assert.ok(heights[0] < heights[1] && heights[1] < heights[2])
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 1000 })
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `Input guide stays bounded during resize at ${width}px`
      )
      await page.evaluate(
        () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      )
      await page.waitForFunction(
        () =>
          !document.querySelector(
            'form[aria-label="Edit public profile"] [data-rad-layout-part][style*="height"]'
          )
      )
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `Input guide fits at ${width}px`
      )
      const card = await frame.locator('[data-slot="card"]').boundingBox()
      for (const input of await frame.getByRole('textbox').all()) {
        const bounds = await input.boundingBox()
        assert.ok(
          bounds.x >= card.x - 1 && bounds.x + bounds.width <= card.x + card.width + 1,
          `Input stays inside Card at ${width}px`
        )
      }
    }
    await frame.screenshot({ path: 'output/docs/input-profile-mobile.png', animations: 'disabled' })
    await page.setViewportSize({ width: 1440, height: 1100 })
    await frame.getByRole('button', { name: 'Reset preview', exact: true }).click()
    assert.equal(await off.isChecked(), false)
    assert.equal(await disabled.isChecked(), false)
    assert.equal(await name.inputValue(), 'Ada Lovelace')
    await frame.screenshot({
      path: 'output/docs/input-profile-desktop.png',
      animations: 'disabled'
    })
    await frame.locator('.demo-sources > summary').click()
    const file = 'input/InputProfileExample.tsx'
    const source = await readFile(new URL(`../examples/${file}`, import.meta.url), 'utf8')
    assert.equal(await frame.getByLabel(`Source: ${file}`, { exact: true }).textContent(), source)
    await frame.getByRole('button', { name: `Copy ${file}`, exact: true }).click()
    await frame
      .getByRole('status')
      .filter({ hasText: `Copied ${file}.` })
      .waitFor()
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), source)
    assert.deepEqual(errors, [], 'Input demo has no hydration/runtime/console errors')
    console.log(
      'Input passed: raw editing/selection, immediate focus/validation, controlled/native reset, pending/read-only/disabled FormData, live off/reduced motion, shared sizes, exact source/copy, SSR and 320px Card containment.'
    )
  } catch (error) {
    await page.screenshot({ path: 'output/docs/input-failure.png', fullPage: true }).catch(() => {})
    throw error
  } finally {
    await context.close()
  }
}
