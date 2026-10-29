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

test('Menu commands update local state, close, and reset', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage()
    const errors = track(page)
    try {
      await capture(page, 'menu-commands', async () => {
        await page.goto(`${baseURL}/docs/menu/`)
        const demo = page.getByRole('region', { name: 'Project commands', exact: true })
        const trigger = demo.getByRole('button', { name: 'Draft commands', exact: true })
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        await trigger.focus()
        await page.keyboard.press('ArrowDown')
        const duplicate = demo.getByRole('menuitem', { name: 'Duplicate draft', exact: true })
        await duplicate.waitFor({ state: 'visible' })
        assert.equal(await duplicate.evaluate(node => node === document.activeElement), true)
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Enter')
        assert.equal(await demo.getByRole('menu').isVisible(), true)
        await page.keyboard.press('Home')
        await page.keyboard.press('Enter')
        await demo.getByText('Active · 1 local copy', { exact: true }).waitFor()
        assert.equal(await trigger.evaluate(node => node === document.activeElement), true)
        await demo.getByRole('button', { name: 'Reset preview', exact: true }).click()
        await demo.getByText('Active · 0 local copies', { exact: true }).waitFor()
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})
