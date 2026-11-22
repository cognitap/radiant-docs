import assert from 'node:assert/strict'
import test from 'node:test'
import { capture, track, withSite } from './site.ts'

test('an agent surface binds its controls and sends named actions with their context', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'agent-surface', async () => {
        await page.goto(`${baseURL}/docs/agents/`)
        const demo = page.getByRole('region', { name: "Render an agent's reply", exact: true })
        await demo.getByRole('button', { name: 'Decimals', exact: true }).click()
        await demo.getByRole('radio', { name: '10 minutes', exact: true }).check()
        await demo.getByRole('button', { name: 'Start review', exact: true }).click()
        await demo
          .getByText(
            'Sent to agent: start_review {"topics":["fractions","decimals"],"length":["10"]}',
            { exact: true }
          )
          .waitFor()
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})
