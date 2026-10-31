import assert from 'node:assert/strict'
import test from 'node:test'
import { capture, track, withSite } from './site.ts'

test('Button tasks preserve independent pressed state, native pending guards, forms and adapter refs', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'independent-frames', async () => {
        await page.goto(`${baseURL}/docs/button/`)
        await page.waitForFunction(() =>
          [...document.querySelectorAll<HTMLButtonElement>('.demo-heading button')].every(
            button => !button.disabled
          )
        )
        const format = page.getByRole('region', { name: 'Format a draft', exact: true }),
          bold = format.getByRole('button', { name: 'Bold', exact: true }),
          italic = format.getByRole('button', { name: 'Italic', exact: true }),
          bookmark = page.getByRole('region', { name: 'Save an article for later', exact: true }),
          save = bookmark.getByRole('button', { name: 'Bookmark article', exact: true })
        await bold.click()
        assert.equal(await bold.getAttribute('aria-pressed'), 'true')
        assert.equal(await italic.getAttribute('aria-pressed'), 'true')
        assert.equal(await save.getAttribute('aria-pressed'), 'false')
        await save.click()
        assert.equal(await save.getAttribute('aria-pressed'), 'true')
        await bookmark.getByRole('checkbox', { name: 'Sync in progress', exact: true }).check()
        await save.click()
        assert.equal(await save.getAttribute('aria-pressed'), 'true')
        assert.equal(await save.getAttribute('aria-busy'), 'true')
        await bookmark.getByRole('button', { name: 'Reset preview', exact: true }).click()
        assert.equal(await save.getAttribute('aria-pressed'), 'false')
        assert.equal(await bold.getAttribute('aria-pressed'), 'true')
        const workspace = page.getByRole('region', { name: 'Save workspace', exact: true })
        await workspace
          .getByRole('textbox', { name: 'Workspace name', exact: true })
          .fill('New studio')
        await workspace.getByRole('button', { name: 'Save changes', exact: true }).click()
        await workspace.getByText('Saved “New studio”.', { exact: true }).waitFor()
        await workspace
          .getByRole('checkbox', { name: 'Simulate a failed request', exact: true })
          .check()
        await workspace.getByRole('button', { name: 'Save changes', exact: true }).click()
        await workspace.getByText('Could not save. Try again.', { exact: true }).waitFor()
        const adapter = page.getByRole('region', { name: 'Forward a native action', exact: true }),
          action = adapter.getByRole('button', {
            name: 'Export the current report for your team',
            exact: true
          })
        await adapter.getByRole('button', { name: 'Focus export action', exact: true }).click()
        assert.equal(await action.evaluate(node => node === document.activeElement), true)
        await page.keyboard.press('Enter')
        await adapter.getByText('Requested report export.', { exact: true }).waitFor()
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('a blocked clipboard reports the failure and leaves the preview usable', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage()
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: async () => {
            throw new Error('Clipboard blocked')
          }
        }
      })
    })
    const errors = track(page)
    try {
      await capture(page, 'blocked-clipboard', async () => {
        await page.goto(`${baseURL}/docs/button/`)
        const demo = page.getByRole('region', { name: 'Save workspace', exact: true })
        await demo.locator('summary').click()
        const label = await demo
          .locator('[data-slot~="code-block-viewport"][aria-label^="Source: "]')
          .first()
          .getAttribute('aria-label')
        const file = label?.slice('Source: '.length)
        await demo.getByRole('button', { name: `Copy ${file}`, exact: true }).click()
        await demo
          .getByText('Could not copy code. Select the code and copy it manually.', { exact: true })
          .waitFor()
        await demo.getByRole('button', { name: 'Save changes' }).click()
        await demo.getByText('Saved “Orbit Studio”.', { exact: true }).waitFor()
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})
