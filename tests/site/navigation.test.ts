import assert from 'node:assert/strict'
import test from 'node:test'
import { capture, checkoutRevision, radiantPackage, track, withSite } from './site.ts'

test('sidebar, search, mobile navigation, missing pages and deployment metadata', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    const errors = track(page)
    try {
      await capture(page, 'navigation', async () => {
        await page.goto(`${baseURL}/docs/getting-started/`)
        const nav = page.getByRole('navigation', { name: 'Documentation', exact: true })
        const links = await nav
          .getByRole('link')
          .evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))
        assert.ok(links.length > 0)
        for (const href of links) {
          assert.equal((await page.request.get(`${baseURL}${href}`)).status(), 200, href ?? '')
        }

        await page.getByRole('button', { name: /^Search docs/ }).click()
        const search = page.getByRole('dialog', { name: 'Search documentation', exact: true })
        await search
          .getByRole('searchbox', { name: 'Search documentation', exact: true })
          .fill('Button')
        const result = search.locator('a[href^="/docs/button/"]')
        await result.first().waitFor()
        const href = await result.first().getAttribute('href')
        assert.ok(href?.startsWith('/docs/button/'))
        await result.first().click()
        await page.waitForURL(url => url.pathname === '/docs/button/')

        await page.setViewportSize({ width: 390, height: 800 })
        await page.getByRole('button', { name: 'Browse documentation', exact: true }).click()
        const menu = page.getByRole('dialog', { name: 'Documentation menu', exact: true })
        const mobile = await menu
          .getByRole('link')
          .evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))
        assert.ok(mobile.includes('/docs/select/'))
        for (const item of mobile) {
          assert.equal((await page.request.get(`${baseURL}${item}`)).status(), 200, item ?? '')
        }
        await menu.getByRole('link', { name: 'Select', exact: true }).click()
        await page.waitForURL('**/docs/select/')
        await menu.waitFor({ state: 'hidden' })

        const deployment = await (await page.request.get(`${baseURL}/deployment.json`)).json()
        assert.equal(deployment.revision, checkoutRevision())
        assert.equal(deployment.radiantVersion, radiantPackage.version)
        assert.equal(deployment.schemaVersion, 1)
        assert.equal(deployment.candidate, radiantPackage.candidate)
        assert.equal(deployment.experimental, true)

        assert.equal(errors.length, 0)
        const missing = await page.goto(`${baseURL}/docs/missing/`)
        assert.equal(missing?.status(), 404)
        assert.equal(
          await page.getByRole('heading', { name: 'Page not found', exact: true }).count(),
          1
        )
        assert.ok(errors.every(error => error.includes('404')))
      })
    } finally {
      await page.close()
    }
  })
})
