import assert from 'node:assert/strict'
import test from 'node:test'
import type { Browser, Locator, Page } from 'playwright'
import { capture, docRoutes, exampleSource, track, withSite } from './site.ts'

test('every documentation page', async () => {
  const routes = await docRoutes()
  assert.ok(routes.length > 0)
  await withSite(async (baseURL, browser) => {
    for (const route of routes) await checkPage(baseURL, browser, route)
  })
})

async function checkPage(baseURL: string, browser: Browser, route: string) {
  const name = route.replaceAll('/', '-').replace(/^-|-$/g, '')
  const plain = await browser.newPage({ javaScriptEnabled: false })
  try {
    await capture(plain, `${name}-static`, async () => {
      const response = await plain.goto(`${baseURL}${route}`)
      assert.equal(response?.status(), 200, route)
      assert.equal(await plain.getByRole('heading', { level: 1 }).count(), 1, route)
      const frames = await plain.locator('.demo-frame').count()
      const listings = await sourceListings(plain)
      if (frames > 0) assert.ok(listings.length > 0, `${route} lists source in the static HTML`)
      for (const listing of listings) {
        assert.equal(listing.text, await exampleSource(listing.file), listing.file)
      }
    })
  } finally {
    await plain.close()
  }

  const context = await browser.newContext({
    permissions: ['clipboard-read', 'clipboard-write']
  })
  const page = await context.newPage()
  const errors = track(page)
  try {
    await capture(page, name, async () => {
      const response = await page.goto(`${baseURL}${route}`)
      assert.equal(response?.status(), 200, route)
      for (const frame of await page.locator('.demo-frame').all()) {
        await openSources(frame)
        for (const listing of await sourceListings(frame)) {
          assert.equal(listing.text, await exampleSource(listing.file), listing.file)
          await frame.getByRole('button', { name: `Copy ${listing.file}`, exact: true }).click()
          await frame
            .locator('.demo-copy-feedback')
            .filter({ hasText: `Copied ${listing.file}.` })
            .waitFor()
          assert.equal(await page.evaluate(() => navigator.clipboard.readText()), listing.text)
        }
        await resetFrame(frame, page)
      }
      assert.deepEqual(errors, [], route)
    })
  } finally {
    await context.close()
  }
}

async function sourceListings(root: Page | Locator) {
  return root.locator('pre[aria-label^="Source: "]').evaluateAll(nodes =>
    nodes.map(node => ({
      file: node.getAttribute('aria-label')!.slice('Source: '.length),
      text: node.textContent ?? ''
    }))
  )
}

async function openSources(frame: Locator) {
  const details = frame.locator('details.demo-sources')
  if ((await details.count()) === 0) return
  if ((await details.getAttribute('open')) === null) await details.locator('summary').click()
}

async function settledText(canvas: Locator) {
  let text = await canvas.innerText()
  let stableSince = Date.now()
  const started = Date.now()
  while (Date.now() - started < 4_000) {
    await canvas.page().waitForTimeout(50)
    const next = await canvas.innerText()
    if (next !== text) {
      text = next
      stableSince = Date.now()
    } else if (Date.now() - stableSince >= 300) return text
  }
  return text
}

async function resetFrame(frame: Locator, page: Page) {
  const reset = frame.getByRole('button', { name: 'Reset preview', exact: true })
  if ((await reset.count()) === 0) return
  const canvas = frame.locator('.demo-canvas')
  const before = (await canvas.count()) > 0 ? await settledText(canvas) : ''
  const field = canvas.getByRole('textbox').first()
  const box = canvas.getByRole('checkbox').first()
  let value: string | undefined
  let checked: boolean | undefined
  if ((await field.count()) > 0 && (await field.isVisible()) && (await field.isEditable())) {
    value = await field.inputValue()
    await field.fill(`${value} x`)
  } else if ((await box.count()) > 0 && (await box.isVisible()) && (await box.isEnabled())) {
    checked = await box.isChecked()
    await box.click()
  } else {
    const button = canvas.getByRole('button').first()
    if ((await button.count()) > 0 && (await button.isVisible()) && (await button.isEnabled())) {
      await button.click()
      await page.keyboard.press('Escape')
    }
  }
  await reset.click()
  await frame.locator('.demo-feedback').getByText('Preview reset.', { exact: true }).waitFor()
  if ((await canvas.count()) === 0) return
  assert.equal(await settledText(canvas), before)
  if (value !== undefined)
    assert.equal(await canvas.getByRole('textbox').first().inputValue(), value)
  if (checked !== undefined)
    assert.equal(await canvas.getByRole('checkbox').first().isChecked(), checked)
}
