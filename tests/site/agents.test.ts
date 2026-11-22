import assert from 'node:assert/strict'
import test from 'node:test'
import { capture, track, withSite } from './site.ts'

test('agent surfaces bind controls, send named actions and render app components', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'agent-surface', async () => {
        await page.goto(`${baseURL}/docs/agents/`)
        const demo = page.getByRole('region', { name: "Render an agent's reply", exact: true })
        const decimals = demo.getByRole('button', { name: 'Decimals', exact: true })
        assert.equal(await decimals.getAttribute('aria-pressed'), 'false')
        await decimals.click()
        assert.equal(await decimals.getAttribute('aria-pressed'), 'true')
        await demo.getByRole('radio', { name: '10 minutes', exact: true }).check()
        await demo.getByRole('button', { name: 'Start review', exact: true }).click()
        await demo
          .getByText(
            'Sent to agent: start_review {"topics":["fractions","decimals"],"length":["10"]}',
            { exact: true }
          )
          .waitFor()
        assert.equal(
          await demo.getByRole('status', { name: 'Diagnostics', exact: true }).innerText(),
          ''
        )

        const extension = page.getByRole('region', {
          name: 'Add a trend line to the catalog',
          exact: true
        })
        await extension.getByRole('img', { name: 'Signups', exact: true }).waitFor()
        await extension.getByText('Accessibility check passed.', { exact: true }).waitFor()
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})
