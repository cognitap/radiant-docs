import assert from 'node:assert/strict'
import test from 'node:test'
import { capture, track, withSite } from './site.ts'

test('Tooltip describes a working action and resets independently', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage()
    const errors = track(page)
    try {
      await capture(page, 'tooltip-action', async () => {
        await page.goto(`${baseURL}/docs/tooltip/`)
        const demo = page.getByRole('region', { name: 'A little more context', exact: true })
        const trigger = demo.getByRole('button', { name: 'Save draft', exact: true })
        await demo
          .getByRole('button', { name: 'Reset preview', exact: true })
          .waitFor({ state: 'visible' })
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        await trigger.focus()
        await page.getByRole('tooltip').waitFor({ state: 'visible' })
        assert.equal(await trigger.getAttribute('aria-expanded'), null)
        await page.keyboard.press('Escape')
        await page.getByRole('tooltip').waitFor({ state: 'hidden' })
        await trigger.click()
        await demo.getByText('Draft saved locally.', { exact: true }).waitFor()
        await demo.getByRole('button', { name: 'Reset preview', exact: true }).click()
        await demo.getByText('Unsaved draft.', { exact: true }).waitFor()
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})
