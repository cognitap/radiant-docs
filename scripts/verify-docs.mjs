import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'
import { chromium } from 'playwright'
import { createDocsServer } from './serve-docs.mjs'
import { radiantPackage } from './radiant-package.mjs'
import { verifyProfileRecipes } from './verify-profile-recipes.mjs'
import { verifyNavigation } from './verify-navigation.mjs'
import { verifyActions } from './verify-actions.mjs'
import { verifyControls } from './verify-controls.mjs'
import { verifyField } from './verify-field.mjs'
import { verifyInput } from './verify-input.mjs'
import { verifyCompositions } from './verify-compositions.mjs'
import { verifyHandoff } from './verify-handoff.mjs'
import { verifyHandoffConsumer } from './verify-handoff-consumer.mjs'
import { verifyBrandReference } from './verify-brand-reference.mjs'
import { verifyActionHydration } from './verify-action-hydration.mjs'
import { verifyGeometryEditor } from './verify-geometry-editor.mjs'
import { verifyColorEditor } from './verify-color-editor.mjs'
import { verifyMotionEditor } from './verify-motion-editor.mjs'
import { verifyMotionHandoff } from './verify-motion-handoff.mjs'
import { verifyMotionHandoffConsumer } from './verify-motion-handoff-consumer.mjs'
import { verifyMotionChapter } from './verify-motion-chapter.mjs'
import { verifyWorkshop } from './verify-workshop.mjs'
import { verifyHistory } from './verify-history.mjs'
import { verifyTypographyChapter } from './verify-typography-chapter.mjs'
import { verifyTypesettingEditor } from './verify-typesetting-editor.mjs'
import { verifyTypographyProofs } from './verify-typography-proofs.mjs'
import { verifyFontEditor } from './verify-font-editor.mjs'
import { verifyFoundations } from './verify-foundations.mjs'
import { waitForDeployment } from './deployment-readiness.mjs'

const { values } = parseArgs({ options: { url: { type: 'string' } } })
const remote = values.url ? new URL(values.url) : undefined
const loopback = remote && ['127.0.0.1', 'localhost', '[::1]'].includes(remote.hostname)
if (
  remote &&
  ((remote.protocol !== 'https:' && !(remote.protocol === 'http:' && loopback)) ||
    remote.pathname !== '/' ||
    remote.search ||
    remote.hash ||
    remote.username ||
    remote.password)
) {
  throw new Error(
    'Deployment verification requires an HTTPS origin (or HTTP loopback) without a path, query or credentials.'
  )
}
const server = remote ? undefined : createDocsServer()
if (server) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const baseURL = remote?.origin ?? `http://127.0.0.1:${server.address().port}`
const startedAt = new Date().toISOString()
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
await mkdir(new URL('../output/docs/', import.meta.url), { recursive: true })
let passed = false
let browser

try {
  browser = await chromium.launch()
  const deploymentResponse = await browser.newContext().then(async context => {
    try {
      const response = await waitForDeployment(timeout =>
        context.request.get(`${baseURL}/deployment.json`, { timeout: Math.min(timeout, 10000) })
      )
      assert.equal(response.status(), 200, 'Deployment metadata is a real static asset.')
      return await response.json()
    } finally {
      await context.close()
    }
  })
  assert.equal(
    deploymentResponse.revision,
    revision,
    'Verify the deployment from this exact checkout.'
  )
  assert.equal(deploymentResponse.radiantVersion, radiantPackage.version)
  assert.equal(deploymentResponse.schemaVersion, 1)
  assert.equal(deploymentResponse.candidate, radiantPackage.candidate)
  assert.equal(deploymentResponse.experimental, true)
  const staticPage = await browser.newPage({ javaScriptEnabled: false })
  const staticResponse = await staticPage.goto(`${baseURL}/docs/button/`)
  assert.equal(staticResponse.status(), 200)
  assert.equal(await staticPage.getByRole('heading', { name: 'Button', exact: true }).count(), 1)
  assert.equal(await staticPage.getByRole('button', { name: 'Try Radiant' }).count(), 2)
  const staticDemo = staticPage.getByRole('region', { name: 'Interactive Button', exact: true })
  await staticDemo.locator('summary').press('Enter')
  assert.equal(await staticDemo.locator('pre').count(), 3, 'source is available without JavaScript')
  assert.equal(await staticDemo.locator('pre').first().isVisible(), true)
  await staticPage.close()

  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] })
  const page = await context.newPage()
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
  const demo = page.getByRole('region', { name: 'Interactive Button', exact: true })
  const other = page.getByRole('region', { name: 'Disabled Button', exact: true })
  const button = demo.getByRole('button', { name: 'Try Radiant' })
  const otherButton = other.getByRole('button', { name: 'Try Radiant' })
  const count = demo.locator('.button-example output')
  const otherCount = other.locator('.button-example output')
  const waitForCount = (frame, value) =>
    frame.getByRole('status').filter({ hasText: value }).waitFor()
  assert.equal(await otherButton.isDisabled(), true)
  await button.click()
  await waitForCount(demo, 'Activated 1 time.')
  await button.press('Enter')
  await waitForCount(demo, 'Activated 2 times.')
  await button.press('Space')
  await waitForCount(demo, 'Activated 3 times.')

  // Two mounted examples keep their controls and internal state independent.
  await other.getByRole('checkbox', { name: 'Disabled' }).uncheck()
  await otherButton.click()
  await waitForCount(other, 'Activated 1 time.')
  assert.equal(await count.innerText(), 'Activated 3 times.')

  // Native disclosure and file copy work from the keyboard and preserve focus.
  const disclosure = demo.locator('summary')
  await disclosure.focus()
  await disclosure.press('Enter')
  assert.equal(await demo.locator('details').getAttribute('open'), '')
  await disclosure.press('Tab')
  const files = ['button/ButtonExample.tsx', 'button/button-example.css', 'profile/useHydrated.ts']
  for (const file of files) {
    const actual = await readFile(new URL(`../examples/${file}`, import.meta.url), 'utf8')
    const source = demo.getByLabel(`Source: ${file}`, { exact: true })
    assert.equal(await source.textContent(), actual, 'displayed source matches the rendered file')
    assert.ok(
      await source.locator('span[style*="color"]').count(),
      'source has syntax highlighting'
    )
    const copy = demo.getByRole('button', { name: `Copy ${file}`, exact: true })
    if (file === files[0])
      assert.equal(await copy.evaluate(node => node === document.activeElement), true)
    await copy.press('Enter')
    await waitForCount(demo, `Copied ${file}.`)
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      actual,
      'clipboard gets the exact file'
    )
    assert.equal(await copy.evaluate(node => node === document.activeElement), true)
  }
  assert.equal(
    await other
      .locator('.demo-copy-feedback')
      .allTextContents()
      .then(items => items.join('')),
    ''
  )

  await demo.getByRole('checkbox', { name: 'Disabled' }).check()
  assert.equal(await button.isDisabled(), true)
  const reset = demo.getByRole('button', { name: 'Reset preview' })
  await reset.press('Enter')
  await waitForCount(demo, 'Preview reset.')
  assert.equal(await count.innerText(), 'Ready when you are.')
  assert.equal(await button.isDisabled(), false)
  assert.equal(
    await demo.getByRole('checkbox', { name: 'Disabled', exact: true }).isChecked(),
    false
  )
  assert.equal(await reset.evaluate(node => node === document.activeElement), true)
  assert.equal(await demo.locator('details').getAttribute('open'), '', 'reset keeps source open')
  assert.equal(await otherCount.innerText(), 'Activated 1 time.')
  assert.equal(await otherButton.isDisabled(), false)
  await other.getByRole('button', { name: 'Reset preview' }).click()
  assert.equal(await otherButton.isDisabled(), true, "reset restores this instance's own defaults")
  assert.equal(await otherCount.innerText(), 'Ready when you are.')

  // A blocked/unavailable clipboard has useful feedback without breaking the preview.
  const blocked = await context.newPage()
  await blocked.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async () => {
          throw new Error('Clipboard blocked')
        }
      }
    })
  })
  await blocked.goto(`${baseURL}/docs/button/`)
  const blockedDemo = blocked.getByRole('region', { name: 'Interactive Button', exact: true })
  await blockedDemo.locator('summary').click()
  await blockedDemo.getByRole('button', { name: `Copy ${files[0]}`, exact: true }).click()
  await waitForCount(blockedDemo, 'Copy failed. Select and copy the code below.')
  await blockedDemo.getByRole('button', { name: 'Try Radiant' }).click()
  await waitForCount(blockedDemo, 'Activated 1 time.')
  await blocked.close()

  // Direct loads/reloads must hydrate too, independently of client navigation.
  await page.reload()
  assert.equal(await page.locator('.preview-label').innerText(), label)
  await button.click()
  await waitForCount(demo, 'Activated 1 time.')
  assert.equal(await otherButton.isDisabled(), true)
  const styles = await button.evaluate(node => {
    const css = getComputedStyle(node)
    return { background: css.backgroundColor, padding: css.paddingInlineStart }
  })
  assert.notEqual(styles.background, 'rgba(0, 0, 0, 0)', 'compiled Radiant CSS must load')
  assert.notEqual(styles.padding, '0px', 'component utilities must be present')
  await page.screenshot({ path: 'output/docs/button-desktop.png', fullPage: true })
  await disclosure.click()
  await page.screenshot({ path: 'output/docs/button-source-desktop.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
  await page.screenshot({ path: 'output/docs/button-mobile.png', fullPage: true })
  await page.setViewportSize({ width: 320, height: 640 })
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
  await demo.locator('pre').first().focus()
  assert.equal(
    await demo
      .locator('pre')
      .first()
      .evaluate(node => node === document.activeElement),
    true
  )
  assert.deepEqual(errors, [], 'no hydration, runtime or asset errors')
  const missing = await page.request.get(`${baseURL}/docs/missing/`)
  assert.equal(missing.status(), 404)
  console.log(
    'Docs passed: static HTML/source, navigation, direct-load hydration, keyboard controls/copy/reset, exact highlighted source and supporting files, clipboard failure, independent previews, compiled CSS, narrow layouts and 404.'
  )
  await verifyProfileRecipes(browser, baseURL)
  await verifyNavigation(browser, baseURL)
  await verifyActions(browser, baseURL)
  await verifyActionHydration(browser, baseURL)
  await verifyControls(browser, baseURL)
  await verifyField(browser, baseURL)
  await verifyInput(browser, baseURL)
  await verifyCompositions(browser, baseURL)
  await verifyFoundations(browser, baseURL)
  await verifyWorkshop(browser, baseURL)
  await verifyHistory(browser, baseURL)
  await verifyMotionEditor(browser, baseURL)
  await verifyFontEditor(browser, baseURL)
  await verifyTypographyProofs(browser, baseURL)
  await verifyTypesettingEditor(browser, baseURL)
  await verifyTypographyChapter(browser, baseURL)
  await verifyColorEditor(browser, baseURL)
  await verifyGeometryEditor(browser, baseURL)
  await verifyHandoff(browser, baseURL)
  await verifyMotionHandoff(browser, baseURL)
  await verifyHandoffConsumer(browser)
  await verifyMotionHandoffConsumer(browser)
  await verifyMotionChapter(browser)
  await verifyBrandReference(browser, baseURL)
  passed = true
} finally {
  await writeFile(
    new URL('../output/docs/verification.json', import.meta.url),
    `${JSON.stringify(
      {
        status: passed ? 'passed' : 'failed',
        target: remote
          ? loopback
            ? 'supplied loopback origin'
            : 'deployment'
          : 'local static export',
        baseURL,
        revision,
        radiant: radiantPackage,
        startedAt,
        finishedAt: new Date().toISOString(),
        node: process.version,
        browser: browser?.version() ?? null,
        platform: process.platform,
        architecture: process.arch,
        limitations: [
          'Chromium automation only; no manual screen-reader, Safari or Firefox verification is claimed.'
        ]
      },
      null,
      2
    )}\n`
  )
  await browser?.close()
  if (server) await new Promise(resolve => server.close(resolve))
}
