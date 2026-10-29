import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

export async function verifyTextarea(browser, baseURL) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    permissions: ['clipboard-read', 'clipboard-write']
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  const files = ['textarea/TextareaExample.tsx', 'profile/useHydrated.ts']
  try {
    const staticPage = await context.newPage()
    await staticPage.route('**/*', route =>
      route.request().resourceType() === 'script' ? route.abort() : route.continue()
    )
    await staticPage.goto(`${baseURL}/docs/textarea/`)
    const staticFrame = staticPage.getByRole('region', {
      name: 'Introduce your workspace',
      exact: true
    })
    assert.equal(
      await staticFrame
        .getByRole('button', { name: 'Save introduction', exact: true })
        .isDisabled(),
      true
    )
    await staticFrame.locator('.demo-sources > summary').click()
    assert.equal(
      await staticFrame.locator('pre').count(),
      2,
      'source and its helper are server-rendered'
    )
    await staticPage.close()

    const response = await page.goto(`${baseURL}/docs/textarea/`)
    assert.equal(response.status(), 200)
    const nav = page.getByRole('navigation', { name: 'Documentation', exact: true })
    assert.equal(
      await nav.getByRole('link', { name: 'Textarea', exact: true }).getAttribute('aria-current'),
      'page'
    )
    const frame = page.getByRole('region', { name: 'Introduce your workspace', exact: true })
    const form = frame.getByRole('form', { name: 'Workspace introduction', exact: true })
    const introduction = form.getByRole('textbox', { name: 'Introduction', exact: true })
    const notes = form.getByRole('textbox', { name: 'Private notes', exact: true })
    const initial = await introduction.inputValue()
    await introduction.fill('')
    await form.getByRole('button', { name: 'Save introduction', exact: true }).click()
    assert.equal(await introduction.getAttribute('aria-invalid'), 'true')
    assert.equal(await introduction.evaluate(node => node === document.activeElement), true)
    await introduction.fill('A place for ideas.\nOne small step at a time.')
    await notes.fill('Invite the team.')
    await form.getByRole('button', { name: 'Save introduction', exact: true }).click()
    assert.equal(
      await form.getByRole('status').innerText(),
      'Saved locally: A place for ideas.\nOne small step at a time. · Invite the team.'
    )
    await form.getByRole('button', { name: 'Reset draft', exact: true }).click()
    assert.equal(await introduction.inputValue(), initial)
    assert.equal(await notes.inputValue(), 'Share a first draft on Friday.')
    assert.equal(await form.getByRole('alert').count(), 0)
    assert.equal(await introduction.evaluate(node => getComputedStyle(node).resize), 'vertical')
    await frame.screenshot({ path: 'output/docs/textarea-desktop.png' })
    await frame.locator('.demo-sources > summary').click()
    for (const file of files) {
      const expected = await readFile(new URL(`../examples/${file}`, import.meta.url), 'utf8')
      assert.equal(
        await frame.getByLabel(`Source: ${file}`, { exact: true }).textContent(),
        expected
      )
      await frame.getByRole('button', { name: `Copy ${file}`, exact: true }).click()
      await frame
        .getByRole('status')
        .filter({ hasText: `Copied ${file}.` })
        .waitFor()
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), expected)
    }
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 })
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true
      )
      assert.equal(await introduction.evaluate(node => node.scrollWidth <= node.clientWidth), true)
      await frame.screenshot({ path: `output/docs/textarea-${width}.png` })
    }
    await frame.getByRole('button', { name: 'Reset preview', exact: true }).click()
    assert.equal(await introduction.inputValue(), initial)
    assert.equal(
      await frame.locator('details').getAttribute('open'),
      '',
      'reset retains the source listing'
    )
    assert.deepEqual(errors, [])
    console.log(
      'Textarea docs passed: static source, hydration, navigation, form validation/submission/reset, exact source copy, compiled styling and 390/320px layouts.'
    )
  } finally {
    await context.close()
  }
}
