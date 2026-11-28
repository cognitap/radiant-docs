import assert from 'node:assert/strict'
import test from 'node:test'
import { capture, track, withSite } from './site.ts'

test('Button demo keeps focus and blocks repeat activation while a native submit is pending', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage({ viewport: { width: 320, height: 900 } }),
      errors = track(page)
    try {
      await capture(page, 'button-submit', async () => {
        await page.goto(`${baseURL}/docs/button/`)
        const demo = page.getByRole('region', { name: 'Save changes', exact: true }),
          button = demo.getByRole('button', { name: 'Save changes', exact: true })
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        assert.equal(await button.getAttribute('type'), 'submit')
        await demo.locator('form').evaluate(form => {
          form.addEventListener('submit', () => {
            form.dataset.submits = String(Number(form.dataset.submits ?? 0) + 1)
          })
        })
        await button.focus()
        await page.keyboard.press('Enter')
        await demo.getByText('Saving…', { exact: true }).waitFor()
        assert.equal(await button.getAttribute('aria-busy'), 'true')
        assert.equal(await button.evaluate(node => node === document.activeElement), true)
        await page.keyboard.press('Space')
        assert.equal(await demo.locator('form').getAttribute('data-submits'), '1')
        await demo.getByText('Saved.', { exact: true }).waitFor()
        assert.equal(await button.getAttribute('aria-busy'), null)
        await demo.getByRole('button', { name: 'Reset preview' }).click()
        assert.equal(await demo.getByText('Saved.', { exact: true }).count(), 0)
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
        const demo = page.getByRole('region', { name: 'Save changes', exact: true })
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
        await demo.getByText('Saved.', { exact: true }).waitFor()
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})
