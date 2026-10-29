import assert from 'node:assert/strict'
import test from 'node:test'
import { capture, track, withSite } from './site.ts'

test('two button frames keep their own state', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage()
    const errors = track(page)
    try {
      await capture(page, 'independent-frames', async () => {
        await page.goto(`${baseURL}/docs/button/`)
        const demo = page.getByRole('region', { name: 'Interactive Button', exact: true })
        const other = page.getByRole('region', { name: 'Disabled Button', exact: true })
        const count = demo.locator('.button-example output')
        const otherCount = other.locator('.button-example output')
        await demo.getByRole('button', { name: 'Try Radiant' }).click()
        await demo.getByText('Activated 1 time.', { exact: true }).waitFor()
        assert.equal(await otherCount.innerText(), 'Ready when you are.')
        await other.getByRole('checkbox', { name: 'Disabled', exact: true }).uncheck()
        await other.getByRole('button', { name: 'Try Radiant' }).click()
        await other.getByText('Activated 1 time.', { exact: true }).waitFor()
        assert.equal(await count.innerText(), 'Activated 1 time.')
        await other.getByRole('button', { name: 'Reset preview', exact: true }).click()
        await other.locator('.demo-feedback').getByText('Preview reset.', { exact: true }).waitFor()
        assert.equal(await otherCount.innerText(), 'Ready when you are.')
        assert.equal(await other.getByRole('button', { name: 'Try Radiant' }).isDisabled(), true)
        assert.equal(await count.innerText(), 'Activated 1 time.')
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
        const demo = page.getByRole('region', { name: 'Interactive Button', exact: true })
        await demo.locator('summary').click()
        const label = await demo
          .locator('pre[aria-label^="Source: "]')
          .first()
          .getAttribute('aria-label')
        const file = label?.slice('Source: '.length)
        await demo.getByRole('button', { name: `Copy ${file}`, exact: true }).click()
        await demo
          .getByText('Copy failed. Select and copy the code below.', { exact: true })
          .waitFor()
        await demo.getByRole('button', { name: 'Try Radiant' }).click()
        await demo.getByText('Activated 1 time.', { exact: true }).waitFor()
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})
