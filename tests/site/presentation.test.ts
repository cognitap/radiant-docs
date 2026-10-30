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

test('Badge conveys status in text and only hides repeated decorative meaning', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage()
    const errors = track(page)
    try {
      await capture(page, 'badge-category', async () => {
        await page.goto(`${baseURL}/docs/badge/`)
        const demo = page.getByRole('region', { name: 'Release category', exact: true })
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const badge = demo.locator('[data-slot~="badge"]')
        assert.equal(await badge.innerText(), 'Draft')
        assert.equal(await badge.getAttribute('role'), null)
        assert.equal(await badge.getAttribute('aria-live'), null)
        await demo
          .getByRole('combobox', { name: 'Release status', exact: true })
          .selectOption('blocked')
        assert.equal(await badge.innerText(), 'Blocked')
        assert.equal(await badge.getAttribute('data-tone'), 'danger')
        await demo
          .getByRole('checkbox', { name: 'Repeat meaning in adjacent text', exact: true })
          .check()
        assert.equal(await badge.getAttribute('aria-hidden'), 'true')
        assert.equal(
          await badge.evaluate(node => node.previousElementSibling?.textContent?.trim()),
          'Blocked'
        )
        await demo.getByRole('button', { name: 'Reset preview', exact: true }).click()
        assert.equal(await badge.innerText(), 'Draft')
        assert.equal(await badge.getAttribute('aria-hidden'), null)
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('Avatar keeps one name through native image failure, fallback and recovery', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage()
    const errors = track(page)
    try {
      await capture(page, 'avatar-identity', async () => {
        await page.goto(`${baseURL}/docs/avatar/`)
        const demo = page.getByRole('region', { name: 'Profile identity', exact: true })
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const root = demo.locator('[data-slot~="avatar"]')
        await demo
          .locator('[data-slot="avatar-image"][data-state="loaded"]')
          .waitFor({ state: 'attached' })
        assert.equal(await demo.getByRole('img').count(), 0)
        assert.equal(await root.getAttribute('aria-hidden'), 'true')
        await demo.getByRole('checkbox', { name: 'Use adjacent name', exact: true }).uncheck()
        assert.equal(await demo.getByRole('img', { name: 'Jordan Rivera', exact: true }).count(), 1)
        const before = await root.boundingBox()
        await demo
          .getByRole('combobox', { name: 'Image source', exact: true })
          .selectOption('missing')
        await demo
          .locator('[data-slot="avatar-image"][data-state="error"]')
          .waitFor({ state: 'attached' })
        assert.equal(await demo.locator('[data-slot="avatar-fallback"]').innerText(), 'JR')
        assert.equal(await demo.getByRole('img').count(), 1)
        const after = await root.boundingBox()
        assert.equal(after?.width, before?.width)
        assert.equal(after?.height, before?.height)
        await demo
          .getByRole('combobox', { name: 'Image source', exact: true })
          .selectOption('fallback')
        assert.equal(await demo.locator('[data-slot="avatar-image"]').count(), 0)
        assert.equal(
          await demo.locator('[data-slot="avatar-fallback"]').getAttribute('data-state'),
          'fallback'
        )
        await demo
          .getByRole('combobox', { name: 'Image source', exact: true })
          .selectOption('image')
        await demo
          .locator('[data-slot="avatar-image"][data-state="loaded"]')
          .waitFor({ state: 'attached' })
        assert.equal(await demo.locator('[data-slot="avatar-fallback"]').count(), 0)
        await demo.getByRole('button', { name: 'Reset preview', exact: true }).click()
        assert.equal(await root.getAttribute('aria-hidden'), 'true')
        assert.equal(await demo.getByRole('img').count(), 0)
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('Breadcrumb keeps ordered hierarchy, decorative separators and one current page', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage()
    const errors = track(page)
    try {
      await capture(page, 'breadcrumb-location', async () => {
        await page.goto(`${baseURL}/docs/breadcrumb/`)
        const demo = page.getByRole('region', { name: 'Location hierarchy', exact: true })
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const nav = demo.getByRole('navigation', { name: 'Documentation location', exact: true })
        assert.equal(await nav.getByRole('list').count(), 1)
        assert.equal(await nav.getByRole('listitem').count(), 2)
        assert.equal(
          await nav.getByRole('link', { name: 'Documentation', exact: true }).getAttribute('href'),
          '/docs/installation/'
        )
        assert.equal(await nav.locator('[aria-current="page"]').count(), 1)
        assert.equal(
          await nav.locator('[data-slot~="breadcrumb-separator"]').getAttribute('aria-hidden'),
          'true'
        )
        assert.equal(
          await nav.locator('[aria-current="page"]').evaluate(node => node.tagName),
          'SPAN'
        )
        await demo.getByRole('checkbox', { name: 'Link the current page', exact: true }).check()
        assert.equal(
          await nav
            .getByRole('link', { name: 'Breadcrumb', exact: true })
            .getAttribute('aria-current'),
          'page'
        )
        assert.equal(
          await nav
            .getByRole('link', { name: 'Breadcrumb', exact: true })
            .getAttribute('data-slot'),
          'link breadcrumb-link'
        )
        await demo.getByRole('checkbox', { name: 'Use long current title', exact: true }).check()
        assert.equal(await nav.evaluate(node => node.scrollWidth <= node.clientWidth), true)
        await demo.getByRole('button', { name: 'Reset preview', exact: true }).click()
        assert.equal(
          await nav.locator('[aria-current="page"]').evaluate(node => node.tagName),
          'SPAN'
        )
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})
