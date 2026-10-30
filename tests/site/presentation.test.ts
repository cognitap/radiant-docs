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

test('Pagination actions update local records, preserve current page and expose native boundaries', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage()
    const errors = track(page)
    try {
      await capture(page, 'pagination-pages', async () => {
        await page.goto(`${baseURL}/docs/pagination/`)
        const demo = page.getByRole('region', { name: 'Local record pages', exact: true })
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const nav = demo.getByRole('navigation', { name: 'Record pages', exact: true })
        assert.equal(
          await nav.getByRole('button', { name: 'Previous', exact: true }).isDisabled(),
          true
        )
        assert.equal(
          await nav
            .getByRole('button', { name: 'Page 1', exact: true })
            .getAttribute('aria-current'),
          'page'
        )
        await nav.getByRole('button', { name: 'Next', exact: true }).click()
        assert.equal(
          await demo.getByRole('status', { name: 'Record page', exact: true }).textContent(),
          'Page 2 of 3'
        )
        assert.equal(
          await demo.getByRole('list', { name: 'Visible records', exact: true }).textContent(),
          'Avery ChenAlex Morgan'
        )
        await nav.getByRole('button', { name: 'Next', exact: true }).click()
        assert.equal(
          await nav.getByRole('button', { name: 'Next', exact: true }).isDisabled(),
          true
        )
        assert.equal(
          await nav
            .getByRole('button', { name: 'Page 3', exact: true })
            .evaluate(node => node === document.activeElement),
          true
        )
        assert.equal(await nav.locator('[aria-current="page"]').count(), 1)
        await nav.getByRole('button', { name: 'Previous', exact: true }).click()
        await nav.getByRole('button', { name: 'Previous', exact: true }).click()
        assert.equal(
          await nav
            .getByRole('button', { name: 'Page 1', exact: true })
            .evaluate(node => node === document.activeElement),
          true
        )
        await demo.getByRole('checkbox', { name: 'Compact spacing', exact: true }).check()
        await demo.getByRole('button', { name: 'Reset preview', exact: true }).click()
        assert.equal(
          await demo.getByRole('checkbox', { name: 'Compact spacing', exact: true }).isChecked(),
          false
        )
        assert.equal(
          await demo.getByRole('status', { name: 'Record page', exact: true }).textContent(),
          'Page 1 of 3'
        )
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('Table preserves native relationships, interactive cells and keyboard overflow', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage()
    const errors = track(page)
    try {
      await capture(page, 'table-directory', async () => {
        await page.goto(`${baseURL}/docs/table/`)
        const demo = page.getByRole('region', { name: 'Team directory', exact: true })
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const table = demo.getByRole('table', { name: 'Team members', exact: true })
        assert.equal(await table.getByRole('columnheader').count(), 3)
        assert.equal(
          await table
            .getByRole('rowheader', { name: 'Jordan Rivera', exact: true })
            .getAttribute('scope'),
          'row'
        )
        assert.equal(
          await table
            .getByRole('columnheader', { name: 'Name', exact: true })
            .getAttribute('scope'),
          'col'
        )
        assert.equal(
          await table
            .getByRole('link', { name: 'About cell actions', exact: true })
            .getAttribute('href'),
          '/docs/button/'
        )
        const select = table.getByRole('button', { name: 'Select Jordan', exact: true })
        await select.focus()
        await page.keyboard.press('Enter')
        assert.equal(
          await demo.getByRole('status', { name: 'Selected member', exact: true }).textContent(),
          'Selected: Jordan Rivera'
        )
        const region = demo.getByRole('region', { name: 'Scrollable team directory', exact: true })
        assert.equal(await region.evaluate(node => node.scrollWidth <= node.clientWidth), true)
        await demo.getByRole('checkbox', { name: 'Use wide columns', exact: true }).check()
        assert.equal(await region.evaluate(node => node.scrollWidth > node.clientWidth), true)
        await region.focus()
        await page.keyboard.press('ArrowRight')
        await page.waitForFunction(
          () => document.querySelector<HTMLElement>('[data-slot="table-container"]')!.scrollLeft > 0
        )
        assert.equal(await table.evaluate(node => getComputedStyle(node).display), 'table')
        await demo.getByRole('button', { name: 'Reset preview', exact: true }).click()
        assert.equal(
          await demo.getByRole('status', { name: 'Selected member', exact: true }).textContent(),
          'Selected: None'
        )
        assert.equal(
          await demo.getByRole('checkbox', { name: 'Use wide columns', exact: true }).isChecked(),
          false
        )
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('Fieldset keeps group ownership, native disabled forms and consumer validation independent', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage()
    const errors = track(page)
    try {
      await capture(page, 'fieldset-tasks', async () => {
        await page.goto(`${baseURL}/docs/fieldset/`)
        await page.waitForFunction(() =>
          [...document.querySelectorAll<HTMLButtonElement>('.demo-heading button')].every(
            button => !button.disabled
          )
        )
        const shipping = page.getByRole('region', { name: 'Shipping fields', exact: true })
        assert.equal(
          await shipping.getByRole('group', { name: 'Shipping address', exact: true }).count(),
          1
        )
        assert.equal(
          await shipping
            .getByRole('textbox', { name: 'Street', exact: true })
            .getAttribute('aria-required'),
          'true'
        )
        await shipping
          .getByRole('textbox', { name: 'Street', exact: true })
          .fill('A changed address')
        await shipping.getByRole('button', { name: 'Reset fields', exact: true }).click()
        assert.equal(
          await shipping.getByRole('textbox', { name: 'Street', exact: true }).inputValue(),
          '10 Main St'
        )
        const locked = page.getByRole('region', { name: 'Locked address section', exact: true })
        const street = locked.getByRole('textbox', { name: 'Street', exact: true })
        assert.equal(await street.isDisabled(), true)
        assert.equal(
          await locked.getByRole('button', { name: 'Use address', exact: true }).isDisabled(),
          true
        )
        assert.deepEqual(
          await locked
            .locator('form')
            .evaluate(form => Object.fromEntries(new FormData(form as HTMLFormElement))),
          {}
        )
        await locked.getByRole('button', { name: 'Unlock address', exact: true }).click()
        assert.equal(await street.isDisabled(), false)
        assert.deepEqual(
          await locked
            .locator('form')
            .evaluate(form => Object.fromEntries(new FormData(form as HTMLFormElement))),
          { street: '10 Main St', city: 'Budapest' }
        )
        await locked.getByRole('button', { name: 'Reset preview', exact: true }).click()
        assert.equal(await street.isDisabled(), true)
        const validation = page.getByRole('region', {
          name: 'Validate contact details',
          exact: true
        })
        const group = validation.getByRole('group', { name: 'Contact details', exact: true })
        await validation.getByRole('button', { name: 'Check contact details', exact: true }).click()
        assert.equal(await group.getAttribute('aria-invalid'), 'true')
        const error = group.getByRole('alert')
        assert.equal(await error.textContent(), 'Enter at least one contact method.')
        assert.ok(
          (await group.getAttribute('aria-describedby'))!
            .split(' ')
            .includes((await error.getAttribute('id'))!)
        )
        const email = validation.getByRole('textbox', { name: 'Email', exact: true })
        assert.equal(await email.getAttribute('aria-describedby'), null)
        await email.fill('jordan@example.com')
        await validation.getByRole('button', { name: 'Check contact details', exact: true }).click()
        assert.equal(await group.getByRole('alert').count(), 0)
        assert.equal(
          await validation
            .getByRole('status', { name: 'Contact result', exact: true })
            .textContent(),
          'Contact details accepted'
        )
        await validation.getByRole('button', { name: 'Reset preview', exact: true }).click()
        assert.equal(await email.inputValue(), '')
        assert.equal(await group.getByRole('alert').count(), 0)
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('CheckboxGroup preserves mixed selection, disabled values and controlled validation in native forms', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage()
    const errors = track(page)
    try {
      await capture(page, 'checkbox-group-tasks', async () => {
        await page.goto(`${baseURL}/docs/checkbox-group/`)
        await page.waitForFunction(() =>
          [...document.querySelectorAll<HTMLButtonElement>('.demo-heading button')].every(
            button => !button.disabled
          )
        )
        const channels = page.getByRole('region', { name: 'Notification channels', exact: true })
        await channels.getByRole('checkbox', { name: 'Text messages', exact: true }).check()
        await channels.getByRole('button', { name: 'Reset choices', exact: true }).click()
        assert.equal(
          await channels.getByRole('checkbox', { name: 'Text messages', exact: true }).isChecked(),
          false
        )
        await channels.getByRole('checkbox', { name: 'Email', exact: true }).uncheck()
        assert.deepEqual(
          await channels
            .locator('form')
            .evaluate(form => new FormData(form as HTMLFormElement).getAll('channels')),
          []
        )
        const available = page.getByRole('region', {
          name: 'Select available channels',
          exact: true
        })
        const all = available.getByRole('checkbox', { name: 'Select all available', exact: true })
        assert.equal(await all.getAttribute('aria-checked'), 'mixed')
        await all.click()
        assert.equal(await all.getAttribute('aria-checked'), 'true')
        assert.equal(
          await available
            .getByRole('checkbox', { name: 'Managed by your organization', exact: true })
            .isDisabled(),
          true
        )
        assert.deepEqual(
          await available
            .locator('form')
            .evaluate(form => new FormData(form as HTMLFormElement).getAll('channels')),
          ['email', 'sms', 'push']
        )
        await available.getByRole('button', { name: 'Reset choices', exact: true }).click()
        await page.waitForFunction(
          () => document.querySelectorAll('[aria-checked="mixed"]').length === 2
        )
        const saving = page.getByRole('region', {
          name: 'Save notification preferences',
          exact: true
        })
        await saving.getByRole('checkbox', { name: 'Email', exact: true }).uncheck()
        assert.equal(await saving.getByRole('alert').textContent(), 'Choose at least one channel.')
        await saving.getByRole('checkbox', { name: 'Text messages', exact: true }).check()
        await saving.getByRole('button', { name: 'Save preferences', exact: true }).click()
        assert.equal(
          await saving.getByRole('status', { name: 'Saved channels', exact: true }).textContent(),
          'sms'
        )
        await saving.getByRole('button', { name: 'Reset preview', exact: true }).click()
        assert.equal(
          await saving.getByRole('checkbox', { name: 'Email', exact: true }).isChecked(),
          true
        )
        assert.equal(
          await saving.getByRole('status', { name: 'Saved channels', exact: true }).textContent(),
          ''
        )
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('AspectRatio reserves image, native video and embed space through responsive reflow', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage()
    const errors = track(page)
    try {
      await capture(page, 'aspect-ratio-tasks', async () => {
        await page.goto(`${baseURL}/docs/aspect-ratio/`)
        await page.waitForFunction(() =>
          [...document.querySelectorAll<HTMLButtonElement>('.demo-heading button')].every(
            button => !button.disabled
          )
        )
        const image = page.getByRole('region', { name: 'Crop a landscape image', exact: true })
        assert.equal(
          await image
            .getByRole('img', { name: 'Green mountains beneath a golden sun', exact: true })
            .count(),
          1
        )
        assert.equal(await image.locator('[data-slot="aspect-ratio"]').getAttribute('role'), null)
        const video = page
          .getByRole('region', { name: 'Play a video', exact: true })
          .locator('video')
        assert.deepEqual(
          await video.evaluate(node => ({
            controls: node.hasAttribute('controls'),
            autoplay: node.hasAttribute('autoplay'),
            preload: node.getAttribute('preload')
          })),
          { controls: true, autoplay: false, preload: 'none' }
        )
        assert.equal(
          await page
            .getByRole('region', { name: 'Embed a document', exact: true })
            .getByTitle('Studio notes')
            .count(),
          1
        )
        const ratios = [1, 16 / 9, 4 / 3]
        for (const width of [1280, 390]) {
          await page.setViewportSize({ width, height: 900 })
          const boxes = await page.locator('[data-slot="aspect-ratio"]').evaluateAll(nodes =>
            nodes.map(node => {
              const box = node.getBoundingClientRect()
              return { width: box.width, height: box.height }
            })
          )
          assert.equal(boxes.length, 3)
          boxes.forEach((box, index) => {
            assert.ok(Math.abs(box.width / box.height - ratios[index]!) < 0.01)
            assert.ok(box.width <= width)
          })
        }
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('ScrollArea keeps native scrolling, both-axis content, popup selection and shrinking datasets usable', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage()
    const errors = track(page)
    try {
      await capture(page, 'scroll-area-tasks', async () => {
        await page.goto(`${baseURL}/docs/scroll-area/`)
        await page.waitForFunction(() =>
          [...document.querySelectorAll<HTMLButtonElement>('.demo-heading button')].every(
            button => !button.disabled
          )
        )
        const activity = page.getByRole('region', { name: 'Scroll recent activity', exact: true })
        const viewport = activity.getByRole('group', { name: 'Recent activity', exact: true })
        await viewport.focus()
        await page.keyboard.press('PageDown')
        await page.waitForFunction(
          () =>
            document.querySelector<HTMLDivElement>(
              '[data-slot~="scroll-area"][aria-label="Recent activity"]'
            )!.scrollTop > 0
        )
        await activity.getByRole('button', { name: 'Back to top', exact: true }).click()
        assert.equal(await viewport.evaluate(node => node.scrollTop), 0)
        const table = page
          .getByRole('region', { name: 'Explore wide records', exact: true })
          .getByRole('group', { name: 'Quarterly estimates', exact: true })
        assert.deepEqual(
          await table.evaluate(node => ({
            x: node.scrollWidth > node.clientWidth,
            y: node.scrollHeight > node.clientHeight
          })),
          { x: true, y: true }
        )
        assert.equal(await table.locator('[data-slot="scroll-area-scrollbar"]').count(), 2)
        const choosing = page.getByRole('region', { name: 'Choose from a long list', exact: true })
        const project = choosing.getByRole('combobox', { name: 'Project', exact: true })
        await project.click()
        await page.keyboard.press('End')
        await page.keyboard.press('Enter')
        assert.ok((await project.textContent())!.includes('Project 24'))
        await choosing.getByRole('button', { name: 'Reset preview', exact: true }).click()
        assert.ok((await project.textContent())!.includes('Choose a project'))
        const filtering = page.getByRole('region', { name: 'Filter activity', exact: true })
        const filtered = filtering.getByRole('group', { name: 'Filtered activity', exact: true })
        await filtered.evaluate(node => {
          node.scrollTop = 1e5
        })
        await filtering.getByRole('button', { name: 'Show recent activity', exact: true }).click()
        assert.equal(await filtered.getByRole('listitem').count(), 2)
        assert.deepEqual(
          await filtered.evaluate(node => ({
            top: node.scrollTop,
            overflow: node.scrollHeight > node.clientHeight
          })),
          { top: 0, overflow: false }
        )
        await filtering.getByRole('button', { name: 'Reset preview', exact: true }).click()
        assert.equal(await filtered.getByRole('listitem').count(), 24)
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})
