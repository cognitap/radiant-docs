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

test('Alert keeps static information quiet and updates mounted live feedback without focus loss', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage()
    const errors = track(page)
    try {
      await capture(page, 'alert-feedback', async () => {
        await page.goto(`${baseURL}/docs/alert/`)
        const demo = page.getByRole('region', { name: 'Inline save feedback', exact: true })
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const status = demo.getByRole('status', { name: 'Save result', exact: true })
        const original = await status.elementHandle()
        assert.ok(original)
        const save = demo.getByRole('button', { name: 'Save draft', exact: true })
        await save.click()
        await status.getByText('Draft saved locally', { exact: true }).waitFor()
        assert.equal(await save.evaluate(node => node === document.activeElement), true)
        assert.equal(await original.evaluate(node => node.isConnected), true)
        await demo.getByRole('button', { name: 'Simulate connection error', exact: true }).click()
        await status.getByText('Save failed', { exact: true }).waitFor()
        assert.equal(
          await demo.getByText('Private draft', { exact: true }).locator('..').getAttribute('role'),
          null
        )
        const urgent = demo.getByRole('button', {
          name: 'Simulate urgent interruption',
          exact: true
        })
        await urgent.click()
        await demo
          .getByRole('alert', { name: 'Urgent example', exact: true })
          .getByText('Example interruption', { exact: true })
          .waitFor()
        assert.equal(await urgent.evaluate(node => node === document.activeElement), true)
        await demo.getByRole('button', { name: 'Reset preview', exact: true }).click()
        assert.equal(await status.innerText(), '')
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('Toast queues repeated feedback, preserves focus, and exposes a reachable undo action', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage()
    const errors = track(page)
    try {
      await capture(page, 'toast-queue', async () => {
        await page.goto(`${baseURL}/docs/toast/`)
        const demo = page.getByRole('region', { name: 'Queued draft notifications', exact: true })
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const save = demo.getByRole('button', { name: 'Save draft', exact: true })
        await save.click()
        await save.click()
        assert.equal(await save.evaluate(node => node === document.activeElement), true)
        const viewport = demo.getByRole('region', { name: 'Draft notifications', exact: true })
        assert.equal(
          await viewport.getByRole('button', { name: 'Dismiss notification', exact: true }).count(),
          1
        )
        await viewport.getByRole('button', { name: 'Dismiss notification', exact: true }).click()
        await viewport.getByRole('heading', { name: 'Draft saved', exact: true }).waitFor()
        await viewport.getByRole('button', { name: 'Dismiss notification', exact: true }).click()
        await demo.getByRole('button', { name: 'Archive draft', exact: true }).click()
        await page.keyboard.press('F8')
        await page.keyboard.press('Tab')
        const undo = viewport.getByRole('button', { name: 'Undo archive', exact: true })
        assert.equal(await undo.evaluate(node => node === document.activeElement), true)
        await page.keyboard.press('Enter')
        await demo
          .getByText('Draft: active. Saved locally. Notifications: 0.', { exact: true })
          .waitFor()
        await demo.getByRole('button', { name: 'Reset preview', exact: true }).click()
        await demo
          .getByText('Draft: active. Not saved yet. Notifications: 0.', { exact: true })
          .waitFor()
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('Progress keeps native labels and unknown ranges while announcing only completion', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage()
    const errors = track(page)
    try {
      await capture(page, 'progress-values', async () => {
        await page.goto(`${baseURL}/docs/progress/`)
        const demo = page.getByRole('region', { name: 'Export progress', exact: true })
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const bar = demo.getByRole('progressbar', { name: 'Export progress', exact: true })
        const status = demo.getByRole('status', { name: 'Export result', exact: true })
        assert.equal(await bar.getAttribute('value'), '0')
        await demo.getByRole('checkbox', { name: 'Unknown remaining amount', exact: true }).check()
        assert.equal(await bar.getAttribute('value'), null)
        assert.equal(await bar.evaluate(node => (node as HTMLProgressElement).position), -1)
        await demo
          .getByRole('checkbox', { name: 'Unknown remaining amount', exact: true })
          .uncheck()
        const advance = demo.getByRole('button', { name: 'Advance export', exact: true })
        await advance.click()
        assert.equal(await bar.getAttribute('value'), '25')
        assert.equal(await status.innerText(), '')
        await advance.click()
        await advance.click()
        await advance.click()
        await status.getByText('Export complete.', { exact: true }).waitFor()
        assert.equal(await bar.getAttribute('value'), '100')
        assert.equal(
          await demo
            .getByRole('region', { name: 'Export package', exact: true })
            .getAttribute('aria-busy'),
          'false'
        )
        await demo.getByRole('button', { name: 'Reset preview', exact: true }).click()
        assert.equal(await bar.getAttribute('value'), '0')
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('Spinner separates decorative and named loading, honors motion off, and clears busy state on completion', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage()
    const errors = track(page)
    try {
      await capture(page, 'spinner-loading', async () => {
        await page.goto(`${baseURL}/docs/spinner/`)
        const demo = page.getByRole('region', { name: 'Account loading', exact: true })
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const details = demo.getByRole('region', { name: 'Account details', exact: true })
        const status = demo.getByRole('status', { name: 'Account result', exact: true })
        assert.equal(await details.getAttribute('aria-busy'), 'true')
        assert.equal(await details.locator('svg').getAttribute('aria-hidden'), 'true')
        assert.equal(await details.getByRole('img').count(), 0)
        await details.getByText('Loading account…', { exact: true }).waitFor()
        assert.equal(await status.innerText(), '')
        await demo.getByRole('checkbox', { name: 'Standalone indicator', exact: true }).check()
        const spinner = details.getByRole('img', { name: 'Loading account', exact: true })
        await spinner.waitFor()
        await demo.getByRole('checkbox', { name: 'Disable indicator motion', exact: true }).check()
        assert.equal(await spinner.evaluate(node => getComputedStyle(node).animationName), 'none')
        const complete = demo.getByRole('button', { name: 'Simulate account loaded', exact: true })
        await complete.click()
        await status.getByText('Account loaded.', { exact: true }).waitFor()
        assert.equal(await details.getAttribute('aria-busy'), 'false')
        assert.equal(await details.locator('svg').count(), 0)
        await demo.getByRole('button', { name: 'Reload account', exact: true }).click()
        assert.equal(await details.getAttribute('aria-busy'), 'true')
        assert.equal(await status.innerText(), '')
        await demo.getByRole('button', { name: 'Reset preview', exact: true }).click()
        assert.equal(await details.getByRole('img').count(), 0)
        assert.equal(await details.locator('svg').getAttribute('aria-hidden'), 'true')
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('Skeleton hides placeholder shapes and leaves meaningful loading status to the application', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage()
    const errors = track(page)
    try {
      await capture(page, 'skeleton-loading', async () => {
        await page.goto(`${baseURL}/docs/skeleton/`)
        const demo = page.getByRole('region', { name: 'Account placeholders', exact: true })
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const details = demo.getByRole('region', { name: 'Account details', exact: true })
        const status = demo.getByRole('status', { name: 'Account loading status', exact: true })
        const shapes = details.locator('[data-slot~="skeleton"]')
        assert.equal(await shapes.count(), 4)
        assert.equal(await details.getAttribute('aria-busy'), 'true')
        assert.deepEqual(
          await shapes.evaluateAll(nodes =>
            nodes.map(node => ({
              hidden: node.getAttribute('aria-hidden'),
              text: node.textContent
            }))
          ),
          Array.from({ length: 4 }, () => ({ hidden: 'true', text: '' }))
        )
        await status.getByText('Loading account…', { exact: true }).waitFor()
        await demo
          .getByRole('checkbox', { name: 'Disable placeholder motion', exact: true })
          .check()
        assert.deepEqual(
          await shapes.evaluateAll(nodes =>
            nodes.map(node => getComputedStyle(node).animationName)
          ),
          ['none', 'none', 'none', 'none']
        )
        await demo.getByRole('button', { name: 'Simulate account loaded', exact: true }).click()
        await details.getByRole('heading', { name: 'Jordan Rivera', exact: true }).waitFor()
        await status.getByText('Account loaded.', { exact: true }).waitFor()
        assert.equal(await details.getAttribute('aria-busy'), 'false')
        assert.equal(await shapes.count(), 0)
        const reload = demo.getByRole('button', { name: 'Reload account', exact: true })
        assert.equal(await reload.evaluate(node => node === document.activeElement), true)
        await reload.click()
        await status.getByText('Loading account…', { exact: true }).waitFor()
        assert.equal(await shapes.count(), 4)
        assert.equal(await details.getAttribute('aria-busy'), 'true')
        await demo.getByRole('button', { name: 'Reset preview', exact: true }).click()
        assert.equal(
          await demo
            .getByRole('checkbox', { name: 'Disable placeholder motion', exact: true })
            .isChecked(),
          false
        )
        assert.equal(await shapes.count(), 4)
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})
