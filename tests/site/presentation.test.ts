import assert from 'node:assert/strict'
import test from 'node:test'
import { capture, track, withSite } from './site.ts'

test('Separator exposes meaningful orientation and hides decorative lines', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage()
    const errors = track(page)
    try {
      await capture(page, 'separator-semantics', async () => {
        await page.goto(`${baseURL}/docs/separator/`)
        const demo = page.getByRole('region', { name: 'Section separation', exact: true })
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        assert.equal(
          await demo.getByRole('separator').getAttribute('aria-orientation'),
          'horizontal'
        )
        await demo.getByRole('checkbox', { name: 'Decorative division', exact: true }).check()
        assert.equal(await demo.getByRole('separator').count(), 0)
        await demo
          .getByRole('combobox', { name: 'Orientation', exact: true })
          .selectOption('vertical')
        assert.equal(await demo.locator('hr').getAttribute('data-orientation'), 'vertical')
        await demo.getByRole('checkbox', { name: 'Decorative division', exact: true }).uncheck()
        assert.equal(await demo.getByRole('separator').getAttribute('aria-orientation'), 'vertical')
        await demo.getByRole('button', { name: 'Reset preview', exact: true }).click()
        assert.equal(
          await demo.getByRole('separator').getAttribute('aria-orientation'),
          'horizontal'
        )
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})
