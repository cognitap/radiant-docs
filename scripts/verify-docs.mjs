import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'
import { createDocsServer } from './serve-docs.mjs'
import { radiantPackage } from './radiant-package.mjs'

const server = createDocsServer()
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const baseURL = `http://127.0.0.1:${server.address().port}`
let browser

try {
  browser = await chromium.launch()
  const staticPage = await browser.newPage({ javaScriptEnabled: false })
  const staticResponse = await staticPage.goto(`${baseURL}/docs/button/`)
  assert.equal(staticResponse.status(), 200)
  assert.equal(await staticPage.getByRole('heading', { name: 'Button', exact: true }).count(), 1)
  assert.equal(await staticPage.getByRole('button', { name: 'Try Radiant' }).count(), 1)
  await staticPage.close()

  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto(baseURL)
  const label = radiantPackage.candidate
    ? `Radiant ${radiantPackage.version} · Local candidate: ${radiantPackage.candidate}`
    : `Radiant ${radiantPackage.version} · Experimental`
  assert.equal(await page.locator('.preview-label').innerText(), label)
  await page.getByRole('link', { name: 'Explore Button' }).click()
  await page.waitForURL('**/docs/button/')
  assert.equal(await page.locator('.preview-label').innerText(), label)
  const button = page.getByRole('button', { name: 'Try Radiant' })
  await button.click()
  await page.getByRole('status').filter({ hasText: 'Activated 1 time.' }).waitFor()
  await button.press('Enter')
  await page.getByRole('status').filter({ hasText: 'Activated 2 times.' }).waitFor()
  await button.press('Space')
  await page.getByRole('status').filter({ hasText: 'Activated 3 times.' }).waitFor()

  // Direct loads/reloads must hydrate too, independently of client navigation.
  await page.reload()
  assert.equal(await page.locator('.preview-label').innerText(), label)
  await button.click()
  await page.getByRole('status').filter({ hasText: 'Activated 1 time.' }).waitFor()
  const styles = await button.evaluate(node => {
    const css = getComputedStyle(node)
    return { background: css.backgroundColor, padding: css.paddingInlineStart }
  })
  assert.notEqual(styles.background, 'rgba(0, 0, 0, 0)', 'compiled Radiant CSS must load')
  assert.notEqual(styles.padding, '0px', 'component utilities must be present')
  await mkdir(new URL('../output/docs/', import.meta.url), { recursive: true })
  await page.screenshot({ path: 'output/docs/button-desktop.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
  await page.screenshot({ path: 'output/docs/button-mobile.png', fullPage: true })
  assert.deepEqual(errors, [], 'no hydration, runtime or asset errors')
  const missing = await page.request.get(`${baseURL}/docs/missing/`)
  assert.equal(missing.status(), 404)
  console.log(
    'Docs passed: static HTML, navigation, direct-load hydration, pointer/keyboard activation, compiled CSS, mobile layout and 404.'
  )
} finally {
  await browser?.close()
  await new Promise(resolve => server.close(resolve))
}
