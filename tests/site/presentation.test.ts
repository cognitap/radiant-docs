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
        // Native keyboard scrolling is animated independently of React.
        // Finish that action before testing a second scroll command.
        await Promise.all([
          viewport.evaluate(
            node =>
              new Promise<void>((resolve, reject) => {
                const timer = setTimeout(() => {
                  node.removeEventListener('scrollend', done)
                  reject(new Error('Native PageDown did not finish scrolling.'))
                }, 3000)
                function done() {
                  clearTimeout(timer)
                  resolve()
                }
                node.addEventListener('scrollend', done, { once: true })
              })
          ),
          page.keyboard.press('PageDown')
        ])
        assert.ok((await viewport.evaluate(node => node.scrollTop)) > 0)
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

test('ToggleGroup keeps focus separate from selection, combines formatting, tracks segmented layout and refuses controlled requests', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'toggle-group-tasks', async () => {
        await page.goto(`${baseURL}/docs/toggle-group/`)
        await page.waitForFunction(() =>
          [...document.querySelectorAll<HTMLButtonElement>('.demo-heading button')].every(
            button => !button.disabled
          )
        )
        const alignment = page.getByRole('region', { name: 'Align a paragraph', exact: true }),
          group = alignment.getByRole('group', { name: 'Text alignment', exact: true }),
          center = group.getByRole('button', { name: 'Center', exact: true }),
          right = group.getByRole('button', { name: 'Right', exact: true })
        await center.click()
        assert.equal(await center.getAttribute('aria-pressed'), 'true')
        await page.keyboard.press('ArrowRight')
        assert.equal(await right.evaluate(node => node === document.activeElement), true)
        assert.equal(await center.getAttribute('aria-pressed'), 'true')
        await page.keyboard.press('Space')
        assert.equal(await right.getAttribute('aria-pressed'), 'true')
        assert.equal(await group.locator('button[tabindex="0"]').count(), 1)
        const formatting = page.getByRole('region', { name: 'Format a note', exact: true }),
          bold = formatting.getByRole('button', { name: 'Bold', exact: true }),
          italic = formatting.getByRole('button', { name: 'Italic', exact: true })
        await italic.click()
        assert.equal(await bold.getAttribute('aria-pressed'), 'true')
        assert.equal(await italic.getAttribute('aria-pressed'), 'true')
        await formatting.getByRole('button', { name: 'Reset preview', exact: true }).click()
        assert.equal(await italic.getAttribute('aria-pressed'), 'false')
        const views = page.getByRole('region', { name: 'Switch record views', exact: true }),
          grid = views.getByRole('button', { name: 'Grid', exact: true })
        await grid.click()
        assert.equal(await grid.getAttribute('aria-pressed'), 'true')
        assert.equal(
          await views.getByRole('button', { name: 'Timeline', exact: true }).isDisabled(),
          true
        )
        await page.waitForFunction(() => {
          const group = document.querySelector('[aria-label="Record view"]')!,
            selected = group.querySelector('[aria-pressed="true"]')!,
            marker = group.querySelector('[data-slot="toggle-group-indicator"]')!.parentElement!,
            a = selected.getBoundingClientRect(),
            b = marker.getBoundingClientRect()
          return Math.abs(a.left - b.left) < 1 && Math.abs(a.width - b.width) < 1
        })
        const filtering = page.getByRole('region', { name: 'Review filter requests', exact: true }),
          active = filtering.getByRole('button', { name: 'Active', exact: true })
        await active.click()
        assert.equal(await active.getAttribute('aria-pressed'), 'false')
        assert.ok((await filtering.textContent())!.includes('Requested active.'))
        await filtering
          .getByRole('checkbox', { name: 'Apply filter requests', exact: true })
          .check()
        await active.click()
        assert.equal(await active.getAttribute('aria-pressed'), 'true')
        await filtering.getByRole('checkbox', { name: 'Right-to-left layout', exact: true }).check()
        await filtering.getByRole('button', { name: 'Focus project filter', exact: true }).click()
        assert.equal(await active.evaluate(node => node === document.activeElement), true)
        await page.keyboard.press('ArrowLeft')
        assert.equal(
          await filtering
            .getByRole('button', { name: 'Archived', exact: true })
            .evaluate(node => node === document.activeElement),
          true
        )
        await filtering.getByRole('button', { name: 'Reset preview', exact: true }).click()
        assert.equal(
          await filtering
            .getByRole('button', { name: 'All projects', exact: true })
            .getAttribute('aria-pressed'),
          'true'
        )
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('Toolbar shares one focus entry while native actions and nested dialog keep their behavior', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'toolbar-actions', async () => {
        await page.goto(`${baseURL}/docs/toolbar/`)
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const demo = page.getByRole('region', { name: 'Edit a document', exact: true }),
          bar = demo.getByRole('toolbar', { name: 'Document editor', exact: true }),
          italic = bar.getByRole('button', { name: 'Italic', exact: true })
        assert.equal(
          await bar.evaluate(
            node =>
              Array.from(node.querySelectorAll('button')).filter(
                action => action.tabIndex === 0 && action.getClientRects().length > 0
              ).length
          ),
          1
        )
        await italic.click()
        assert.equal(await italic.getAttribute('aria-pressed'), 'true')
        await page.keyboard.press('ArrowRight')
        assert.equal(
          await bar
            .getByRole('button', { name: 'More', exact: true })
            .evaluate(node => node === document.activeElement),
          true
        )
        await page.keyboard.press('ArrowDown')
        await page.getByRole('menuitem', { name: 'Export document', exact: true }).click()
        assert.match(
          await demo.locator('output[aria-live="polite"]').innerText(),
          /Export requested/
        )
        const actions = page.getByRole('region', { name: 'Manage document actions', exact: true })
        await actions.getByRole('button', { name: 'Reading settings', exact: true }).click()
        const dialog = page.getByRole('dialog', { name: 'Reading settings', exact: true }),
          group = dialog.getByRole('group', { name: 'Reading density', exact: true })
        assert.equal(await group.locator('button[tabindex="0"]').count(), 1)
        await group.getByRole('button', { name: 'Compact', exact: true }).click()
        await page.keyboard.press('ArrowRight')
        assert.equal(
          await group
            .getByRole('button', { name: 'Comfortable', exact: true })
            .evaluate(node => node === document.activeElement),
          true
        )
        await page.keyboard.press('Escape')
        await actions.getByRole('checkbox', { name: 'Publishing in progress', exact: true }).check()
        assert.equal(
          await actions
            .getByRole('button', { name: 'Publish', exact: true })
            .getAttribute('aria-busy'),
          'true'
        )
        await demo.getByRole('button', { name: 'Reset preview', exact: true }).click()
        assert.equal(
          await demo
            .getByRole('button', { name: 'Italic', exact: true })
            .getAttribute('aria-pressed'),
          'false'
        )
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('HoverCard opens supplementary real-link previews and preserves keyboard, controlled and touch-safe destinations', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'hover-card-links', async () => {
        await page.goto(`${baseURL}/docs/hover-card/`)
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const demo = page.getByRole('region', { name: 'Preview a contributor', exact: true }),
          trigger = demo.getByRole('link', { name: 'Lee Chen', exact: true })
        await trigger.focus()
        const preview = demo.locator('[data-slot~="hover-card-content"]')
        await preview.waitFor({ state: 'visible' })
        assert.equal(await trigger.evaluate(node => node === document.activeElement), true)
        await page.keyboard.press('Tab')
        assert.equal(
          await preview
            .getByRole('link', { name: 'Read full profile', exact: true })
            .evaluate(node => node === document.activeElement),
          true
        )
        await page.keyboard.press('Escape')
        assert.equal(await trigger.getAttribute('aria-expanded'), 'false')
        assert.equal(await trigger.evaluate(node => node === document.activeElement), true)
        const project = page.getByRole('region', { name: 'Review project progress', exact: true })
        await project
          .getByRole('checkbox', { name: 'Keep project preview open', exact: true })
          .check()
        assert.equal(
          await project
            .getByRole('link', { name: 'Website refresh', exact: true })
            .getAttribute('aria-expanded'),
          'true'
        )
        await project.getByRole('button', { name: 'Reset preview', exact: true }).click()
        assert.equal(
          await project
            .getByRole('checkbox', { name: 'Keep project preview open', exact: true })
            .isChecked(),
          false
        )
        const resource = page.getByRole('region', { name: 'Open reference material', exact: true })
        await resource.getByRole('link', { name: 'Accessibility resources', exact: true }).click()
        assert.match(
          await resource.locator('output[aria-live="polite"]').innerText(),
          /External resource is ready/
        )
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('ContextMenu exposes visible alternatives and supports pointer, keyboard and nested checked commands', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'context-menu-commands', async () => {
        await page.goto(`${baseURL}/docs/context-menu/`)
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const demo = page.getByRole('region', { name: 'Manage a project file', exact: true }),
          target = demo.getByRole('group', { name: 'Project file', exact: true })
        await target.click({ button: 'right', position: { x: 30, y: 30 } })
        const menu = demo.getByRole('menu', { name: 'Project file', exact: true })
        await menu.waitFor({ state: 'visible' })
        await menu.getByRole('menuitem', { name: 'Duplicate', exact: true }).click()
        assert.match(
          await demo.locator('output[aria-live="polite"]').innerText(),
          /Copy of Project brief created/
        )
        await demo.getByRole('button', { name: 'Rename file', exact: true }).click()
        assert.match(await target.innerText(), /Project brief revised/)
        await target.focus()
        await page.keyboard.press('Shift+F10')
        await menu.waitFor({ state: 'visible' })
        await page.keyboard.press('Escape')
        assert.equal(await target.evaluate(node => node === document.activeElement), true)
        const canvas = page.getByRole('region', {
            name: 'Configure a planning canvas',
            exact: true
          }),
          canvasTarget = canvas.getByRole('group', { name: 'Planning canvas', exact: true })
        await canvasTarget.click({ button: 'right', position: { x: 20, y: 20 } })
        await canvas.getByRole('menuitemcheckbox', { name: 'Grid lines', exact: true }).click()
        assert.equal(
          await canvas.getByRole('checkbox', { name: 'Show grid lines', exact: true }).isChecked(),
          false
        )
        await canvas.getByRole('menuitem', { name: 'Move to', exact: true }).click()
        await canvas.getByRole('menuitem', { name: 'Design team', exact: true }).click()
        assert.match(await canvas.locator('output[aria-live="polite"]').innerText(), /Design team/)
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('Menu docs demonstrate checkable state and nested destination commands', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'menu-nested-commands', async () => {
        await page.goto(`${baseURL}/docs/menu/`)
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const demo = page.getByRole('region', { name: 'Export a report', exact: true })
        await demo.getByRole('button', { name: 'Export report', exact: true }).click()
        await demo.getByRole('menuitemradio', { name: 'CSV', exact: true }).click()
        await demo.getByRole('menuitem', { name: 'Save to', exact: true }).click()
        await demo.getByRole('menuitem', { name: 'Shared drives', exact: true }).click()
        await demo.getByRole('menuitem', { name: 'Design team', exact: true }).click()
        assert.match(
          await demo.locator('output[aria-live="polite"]').innerText(),
          /CSV.*Design team/i
        )
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('Menubar keeps one keyboard entry, switches menus, shares nested commands and preserves controlled native forms', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'menubar-commands', async () => {
        await page.goto(`${baseURL}/docs/menubar/`)
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const demo = page.getByRole('region', { name: 'Edit a document', exact: true }),
          bar = demo.getByRole('menubar', { name: 'Document commands', exact: true }),
          file = bar.getByRole('menuitem', { name: 'File', exact: true })
        await file.focus()
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('ArrowRight')
        assert.equal(
          await demo
            .getByRole('menuitem', { name: 'Undo save', exact: true })
            .evaluate(node => node === document.activeElement),
          true
        )
        await page.keyboard.press('ArrowRight')
        await page.keyboard.press('Space')
        assert.equal(
          await demo
            .getByRole('menuitemcheckbox', { name: 'Word count', exact: true })
            .getAttribute('aria-checked'),
          'false'
        )
        await page.keyboard.press('Escape')
        await page.keyboard.press('Tab')
        assert.equal(
          await demo
            .getByRole('button', { name: 'Continue editing', exact: true })
            .evaluate(node => node === document.activeElement),
          true
        )
        const board = page.getByRole('region', { name: 'Organize a planning board', exact: true })
        await board.getByRole('menuitem', { name: 'File', exact: true }).click()
        await board.getByRole('menuitem', { name: 'Move board', exact: true }).click()
        await board.getByRole('menuitem', { name: 'Team spaces', exact: true }).click()
        await board.getByRole('menuitem', { name: 'Design team', exact: true }).click()
        assert.match(await board.locator('output[aria-live="polite"]').innerText(), /Design team/)
        const report = page.getByRole('region', { name: 'Submit report commands', exact: true })
        await report.getByRole('checkbox', { name: 'Keep File menu open', exact: true }).check()
        const exportItem = report.getByRole('menuitem', { name: 'Export report', exact: true })
        await exportItem.focus()
        await page.keyboard.press('ArrowRight')
        assert.equal(await exportItem.evaluate(node => node === document.activeElement), true)
        await report.getByRole('checkbox', { name: 'Review before export', exact: true }).check()
        await exportItem.click()
        assert.match(
          await report.locator('output[aria-live="polite"]').innerText(),
          /Review the report/
        )
        await report.getByRole('checkbox', { name: 'Keep File menu open', exact: true }).uncheck()
        await report.getByRole('checkbox', { name: 'Review before export', exact: true }).uncheck()
        await report.getByRole('menuitem', { name: 'File', exact: true }).click()
        await exportItem.click()
        assert.match(
          await report.locator('output[aria-live="polite"]').innerText(),
          /Export requested for Quarterly review/
        )
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('Drawer keeps keyboard snap sizes, non-modal scrolling and controlled native dismissal', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'drawer-tasks', async () => {
        await page.goto(`${baseURL}/docs/drawer/`)
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const settings = page.getByRole('region', { name: 'Edit project settings', exact: true })
        await settings.getByRole('button', { name: 'Project settings', exact: true }).click()
        const dialog = settings.getByRole('dialog', { name: 'Project settings', exact: true })
        await dialog.getByRole('button', { name: 'Resize project settings', exact: true }).focus()
        await page.keyboard.press('Home')
        await page.waitForFunction(
          () =>
            document
              .querySelector('[data-slot~="drawer-handle"]')
              ?.getAttribute('aria-describedby') &&
            document.querySelector('dialog[open]')?.textContent?.includes('50%')
        )
        await page.keyboard.press('End')
        await dialog.getByRole('textbox', { name: 'Project name', exact: true }).fill('North star')
        await dialog.getByRole('button', { name: 'Save settings', exact: true }).click()
        assert.match(await dialog.getByRole('status').innerText(), /Saved North star/)
        await dialog.getByRole('button', { name: 'Close settings', exact: true }).click()
        assert.equal(
          await settings
            .getByRole('button', { name: 'Project settings', exact: true })
            .evaluate(node => node === document.activeElement),
          true
        )
        const outline = page.getByRole('region', { name: 'Read a report outline', exact: true })
        await outline.getByRole('button', { name: 'Report outline', exact: true }).click()
        const outlineDialog = outline.getByRole('dialog', { name: 'Report outline', exact: true })
        assert.equal(await outlineDialog.evaluate(node => node.matches(':modal')), false)
        await outline
          .getByRole('textbox', { name: 'Report notes', exact: true })
          .fill('Check references')
        await outlineDialog
          .getByRole('button', { name: 'Resize report outline', exact: true })
          .focus()
        await page.keyboard.press('Home')
        const viewport = outlineDialog.locator(':scope > [data-slot="drawer-viewport"]')
        assert.equal(await viewport.evaluate(node => node.scrollHeight > node.clientHeight), true)
        await outlineDialog.getByRole('button', { name: 'Outline display', exact: true }).click()
        const display = outline.getByRole('dialog', { name: 'Outline display', exact: true })
        await page.waitForFunction(
          node => {
            if (!node) return false
            const box = node.getBoundingClientRect()
            return box.left >= -2 && box.right <= innerWidth + 2
          },
          await display.locator(':scope > [data-slot="drawer-viewport"]').elementHandle(),
          { timeout: 4000 }
        )
        const childBounds = await display
          .locator(':scope > [data-slot="drawer-viewport"]')
          .boundingBox()
        assert.ok(childBounds)
        assert.ok(
          childBounds.x >= -2 && childBounds.x + childBounds.width <= page.viewportSize()!.width + 2
        )
        await display
          .getByRole('checkbox', { name: 'Compact section spacing', exact: true })
          .check()
        await display.getByRole('button', { name: 'Back to outline', exact: true }).click()
        assert.equal(await outlineDialog.isVisible(), true)
        await outlineDialog.getByRole('button', { name: 'Close outline', exact: true }).click()
        const order = page.getByRole('region', { name: 'Review an order', exact: true })
        await order.getByRole('button', { name: 'Review order', exact: true }).click()
        const review = order.getByRole('dialog', { name: 'Review order', exact: true })
        await review.getByRole('button', { name: 'Leave review', exact: true }).click()
        assert.equal(await review.isVisible(), true)
        assert.match(await review.getByRole('status').innerText(), /Confirm that you are ready/)
        await review.getByRole('checkbox', { name: 'I am ready to leave', exact: true }).check()
        await review.getByRole('button', { name: 'Leave review', exact: true }).click()
        assert.equal(await review.isVisible(), false)
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('Array fields submit committed values and retain controlled removals', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'array-fields', async () => {
        await page.goto(`${baseURL}/docs/multi-select/`)
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const reviewers = page.getByRole('region', {
          name: 'Assign project reviewers',
          exact: true
        })
        const input = reviewers.getByRole('combobox', { name: 'Project reviewers', exact: true })
        await input.fill('Sam')
        await reviewers.getByRole('option', { name: 'Sam Novak', exact: true }).waitFor()
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Enter')
        await reviewers.getByRole('button', { name: 'Save reviewers', exact: true }).click()
        assert.match(await reviewers.getByRole('status').last().innerText(), /ana, sam/)
        const lead = page.getByRole('region', { name: 'Keep the lead reviewer', exact: true })
        await lead.getByRole('button', { name: 'Remove Ana Petrescu', exact: true }).click()
        assert.equal(
          await lead.getByRole('button', { name: 'Remove Ana Petrescu', exact: true }).count(),
          1
        )
        await page.goto(`${baseURL}/docs/tags-input/`)
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const topics = page.getByRole('region', { name: 'Label research notes', exact: true })
        await topics
          .getByRole('textbox', { name: 'Research topics', exact: true })
          .fill('accessibility')
        await page.keyboard.press('Enter')
        await topics.getByRole('button', { name: 'Save topics', exact: true }).click()
        assert.match(await topics.getByRole('status').last().innerText(), /research, accessibility/)
        const guests = page.getByRole('region', { name: 'Invite workshop guests', exact: true })
        await guests.getByRole('textbox', { name: 'Guest emails', exact: true }).fill('unfinished')
        await page.keyboard.press('Enter')
        assert.equal(
          await guests
            .getByRole('textbox', { name: 'Guest emails', exact: true })
            .getAttribute('aria-invalid'),
          'true'
        )
        assert.equal(
          await guests.getByText('Enter a complete email address.', { exact: true }).isVisible(),
          true
        )
        await page.goto(`${baseURL}/docs/tag/`)
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const board = page.getByRole('region', { name: 'Filter the project board', exact: true })
        await board.getByRole('button', { name: 'Remove Research filter', exact: true }).click()
        assert.equal(await board.getByText('Component kit', { exact: true }).isVisible(), true)
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('OTP docs keep one native value through paste, verification and refused recovery edits', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'otp-field-tasks', async () => {
        await page.goto(`${baseURL}/docs/otp-field/`)
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const email = page.getByRole('region', { name: 'Verify an email code', exact: true }),
          input = email.getByRole('textbox', { name: 'Email verification code', exact: true })
        await input.focus()
        await input.evaluate(node => {
          const data = new DataTransfer()
          data.setData('text', 'Code: 123 456')
          node.dispatchEvent(
            new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data })
          )
        })
        await input.evaluate(node => {
          if (!(node instanceof HTMLInputElement)) throw new Error('Code must use a native input')
          node.setSelectionRange(1, 5)
        })
        await page.keyboard.press('ArrowRight')
        assert.equal(
          await input.evaluate(node =>
            node instanceof HTMLInputElement ? node.selectionStart : null
          ),
          5
        )
        await email.getByRole('button', { name: 'Verify email', exact: true }).click()
        assert.match(
          await email.getByRole('status').last().innerText(),
          /Email verified with code 123456/
        )
        assert.equal(await email.locator('input[name="emailCode"]').count(), 1)
        await email.getByRole('button', { name: 'Start again', exact: true }).click()
        assert.equal(await input.inputValue(), '')
        const access = page.getByRole('region', {
          name: 'Approve temporary workspace access',
          exact: true
        })
        await access
          .getByRole('textbox', { name: 'Temporary approval code', exact: true })
          .fill('AB12CD34')
        await access.getByRole('button', { name: 'Approve access', exact: true }).click()
        assert.match(await access.getByRole('status').last().innerText(), /approved using AB12CD34/)
        const recovery = page.getByRole('region', {
            name: 'Review an account recovery code',
            exact: true
          }),
          code = recovery.getByRole('textbox', { name: 'Recovery code', exact: true })
        await code.fill('987654')
        assert.equal(await code.inputValue(), '12')
        assert.match(await recovery.getByRole('status').last().innerText(), /prefix is protected/)
        await recovery
          .getByRole('checkbox', { name: 'Keep the account prefix', exact: true })
          .uncheck()
        await code.fill('987654')
        await recovery.getByRole('button', { name: 'Continue recovery', exact: true }).click()
        assert.match(
          await recovery.getByRole('status').last().innerText(),
          /Recovery continued with 987654/
        )
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('ButtonGroup docs preserve individual tab stops, native forms and split Menu actions', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'button-group-tasks', async () => {
        await page.goto(`${baseURL}/docs/button-group/`)
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const project = page.getByRole('region', { name: 'Edit project actions', exact: true }),
          title = project.getByRole('textbox', { name: 'Project title', exact: true })
        await title.fill('North star')
        await page.keyboard.press('Tab')
        assert.equal(
          await project
            .getByRole('button', { name: 'Save project', exact: true })
            .evaluate(node => node === document.activeElement),
          true
        )
        await page.keyboard.press('Tab')
        assert.equal(
          await project
            .getByRole('button', { name: 'Restore title', exact: true })
            .evaluate(node => node === document.activeElement),
          true
        )
        await project.getByRole('button', { name: 'Save project', exact: true }).click()
        assert.match(await project.getByRole('status').last().innerText(), /Saved North star/)
        await project.getByRole('button', { name: 'Restore title', exact: true }).click()
        assert.equal(await title.inputValue(), 'Reader study')
        const publish = page.getByRole('region', { name: 'Publish a report', exact: true })
        await publish.getByRole('button', { name: 'More publication actions', exact: true }).click()
        await publish.getByRole('menuitem', { name: 'Schedule for tomorrow', exact: true }).click()
        assert.match(await publish.getByRole('status').last().innerText(), /scheduled for tomorrow/)
        const weeks = page.getByRole('region', { name: 'Browse review weeks', exact: true })
        await weeks
          .getByRole('combobox', { name: 'Orientation', exact: true })
          .selectOption('vertical')
        await weeks.getByRole('combobox', { name: 'Direction', exact: true }).selectOption('rtl')
        assert.equal(
          await weeks.locator('[data-slot="button-group"]').getAttribute('data-orientation'),
          'vertical'
        )
        await weeks.getByRole('button', { name: 'Next week', exact: true }).click()
        assert.match(await weeks.getByRole('status').last().innerText(), /1 week after/)
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('Kbd docs combine native notation with application-owned search, Menu and form shortcuts', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'kbd-tasks', async () => {
        await page.goto(`${baseURL}/docs/kbd/`)
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const find = page.getByRole('region', { name: 'Find a project', exact: true })
        await find.getByRole('button', { name: 'Find project', exact: true }).focus()
        await page.keyboard.press('Control+k')
        const input = find.getByRole('textbox', { name: 'Project search', exact: true })
        assert.equal(await input.evaluate(n => n === document.activeElement), true)
        await input.fill('Reader')
        assert.equal(await find.getByRole('listitem').count(), 1)
        assert.equal(await find.locator('kbd').count(), 3)
        await find.getByRole('combobox', { name: 'Modifier', exact: true }).selectOption('Command')
        assert.match(await find.locator('kbd').first().innerText(), /Command/)
        const duplicate = page.getByRole('region', { name: 'Duplicate a study note', exact: true })
        await duplicate.getByRole('button', { name: 'Study note actions', exact: true }).click()
        const item = duplicate.getByRole('menuitem', { name: 'Duplicate note', exact: true })
        assert.equal(await item.locator('kbd').count(), 3)
        await item.click()
        assert.equal(await duplicate.getByRole('listitem').count(), 2)
        const save = page.getByRole('region', { name: 'Save a study note', exact: true })
        await save
          .getByRole('textbox', { name: 'Study note', exact: true })
          .fill('Review key notation')
        await page.keyboard.press('Control+s')
        assert.match(
          await save.getByRole('status').last().innerText(),
          /Saved note: Review key notation/
        )
        await save.getByRole('button', { name: 'Saving shortcut', exact: true }).focus()
        await save.getByRole('tooltip').waitFor()
        assert.equal(await save.getByRole('tooltip').locator('kbd').count(), 3)
        await page.keyboard.press('Escape')
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('InputGroup docs preserve addon focus, Kbd hints, native budget forms and Textarea actions', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'input-group-tasks', async () => {
        await page.goto(`${baseURL}/docs/input-group/`)
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const find = page.getByRole('region', { name: 'Find a project', exact: true }),
          input = find.getByRole('searchbox', { name: 'Project search', exact: true })
        await find.locator('[data-slot~="input-group-addon"] kbd').last().click()
        assert.equal(await input.evaluate(n => n === document.activeElement), true)
        await input.fill('Reader')
        await page.keyboard.press('Control+k')
        assert.deepEqual(
          await input.evaluate(n =>
            n instanceof HTMLInputElement ? [n.selectionStart, n.selectionEnd] : null
          ),
          [0, 6]
        )
        assert.equal(await find.getByRole('listitem').count(), 1)
        await find.getByRole('checkbox', { name: 'Read only', exact: true }).check()
        assert.equal(await input.isEditable(), false)
        assert.equal(await input.isEnabled(), true)
        await find.getByRole('checkbox', { name: 'Read only', exact: true }).uncheck()
        await find.getByRole('combobox', { name: 'Direction', exact: true }).selectOption('rtl')
        await find
          .getByRole('combobox', { name: 'Control size', exact: true })
          .selectOption('small')
        assert.equal(await find.locator('[data-slot~="input-group"]').getAttribute('dir'), 'rtl')
        assert.equal(
          await find.locator('[data-slot~="input-group"]').getAttribute('data-control-size'),
          'small'
        )
        const budget = page.getByRole('region', { name: 'Set a project budget', exact: true }),
          amount = budget.getByRole('textbox', { name: 'Project budget', exact: true })
        await amount.fill('350')
        await budget.getByRole('button', { name: 'Save budget', exact: true }).click()
        assert.match(await budget.getByRole('status').last().innerText(), /Budget saved: 350 USD/)
        await budget.getByRole('button', { name: 'Restore budget', exact: true }).click()
        assert.equal(await amount.inputValue(), '250')
        const post = page.getByRole('region', { name: 'Post a study update', exact: true })
        await post
          .getByRole('textbox', { name: 'Study update', exact: true })
          .fill('Reviewed the grouped editor')
        await post.getByRole('button', { name: 'Post update', exact: true }).click()
        assert.match(
          await post.getByRole('status').last().innerText(),
          /Posted: Reviewed the grouped editor/
        )
        await post.getByRole('button', { name: 'Restore update', exact: true }).click()
        assert.equal(
          await post.getByRole('textbox', { name: 'Study update', exact: true }).inputValue(),
          'Reviewed the interview notes.'
        )
        await page.goto(`${baseURL}/docs/kbd/`)
        const hint = page.getByRole('region', { name: 'Search with input addons', exact: true })
        await hint.locator('.demo-heading button:not(:disabled)').waitFor()
        await hint.locator('[data-slot~="input-group-addon"] kbd').last().click()
        assert.equal(
          await hint
            .getByRole('searchbox', { name: 'Project search', exact: true })
            .evaluate(n => n === document.activeElement),
          true
        )
        assert.equal(await hint.locator('kbd').count(), 3)
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('NativeSelect docs preserve platform controls, grouped choices and native single and multiple forms', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'native-select-tasks', async () => {
        await page.goto(`${baseURL}/docs/native-select/`)
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const phase = page.getByRole('region', { name: 'Save a study phase', exact: true }),
          picker = phase.getByRole('combobox', { name: 'Study phase', exact: true })
        assert.equal(await picker.evaluate(n => n.tagName), 'SELECT')
        assert.equal(
          await picker.evaluate(n => (n instanceof HTMLSelectElement ? n.checkValidity() : null)),
          false
        )
        await picker.selectOption('analysis')
        await phase.getByRole('button', { name: 'Save phase', exact: true }).click()
        assert.match(
          await phase.getByRole('status').last().innerText(),
          /Study phase saved: analysis/
        )
        await phase.getByRole('button', { name: 'Restore phase', exact: true }).click()
        assert.equal(await picker.inputValue(), '')
        await phase.getByRole('checkbox', { name: 'Disabled', exact: true }).check()
        assert.equal(await picker.isDisabled(), true)
        await phase.getByRole('checkbox', { name: 'Disabled', exact: true }).uncheck()
        const grouped = page.getByRole('region', { name: 'Browse grouped studies', exact: true })
        assert.equal(await grouped.locator('optgroup[disabled] option').isDisabled(), true)
        assert.equal(await grouped.locator('option[value="release"]').isDisabled(), true)
        await grouped
          .getByRole('combobox', { name: 'Open study', exact: true })
          .selectOption('component')
        assert.equal(
          await grouped.getByRole('heading', { name: 'Component kit', exact: true }).count(),
          1
        )
        assert.match(await grouped.innerText(), /8 participants/)
        const cohorts = page.getByRole('region', {
            name: 'Filter participant cohorts',
            exact: true
          }),
          list = cohorts.getByRole('listbox', { name: 'Participant cohorts', exact: true })
        await list.selectOption(['component', 'release'])
        await cohorts.getByRole('button', { name: 'Apply cohorts', exact: true }).click()
        assert.deepEqual(await cohorts.getByRole('listitem').allTextContents(), [
          'Lea',
          'Noah',
          'Eva'
        ])
        await cohorts.getByRole('button', { name: 'Restore cohorts', exact: true }).click()
        assert.deepEqual(await cohorts.getByRole('listitem').allTextContents(), ['Maya', 'Ivo'])
        assert.deepEqual(
          await list.evaluate(n =>
            n instanceof HTMLSelectElement
              ? Array.from(n.selectedOptions, option => option.value)
              : []
          ),
          ['reader']
        )
        await page.setViewportSize({ width: 320, height: 900 })
        assert.equal(
          await list.evaluate(n => n.getBoundingClientRect().width <= window.innerWidth),
          true
        )
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('Meter docs retain native passive gauges and meaningful storage, recorder and room tasks', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'meter-tasks', async () => {
        await page.goto(`${baseURL}/docs/meter/`)
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const storage = page.getByRole('region', { name: 'Manage recording storage', exact: true }),
          gauge = storage.getByRole('meter', { name: 'Recording storage used' })
        assert.equal(await gauge.evaluate(n => n.tagName), 'METER')
        assert.equal(await gauge.getAttribute('value'), '7.2')
        await storage.getByRole('combobox', { name: 'Direction', exact: true }).selectOption('rtl')
        assert.equal(await gauge.evaluate(n => getComputedStyle(n).direction), 'rtl')
        await storage
          .getByRole('combobox', { name: 'Gauge height', exact: true })
          .selectOption('large')
        assert.equal(await gauge.evaluate(n => n.getBoundingClientRect().height), 16)
        await storage.getByRole('button', { name: 'Archive interviews', exact: true }).click()
        assert.equal(await gauge.getAttribute('value'), '3')
        assert.equal(await gauge.getAttribute('data-tone'), 'accent')
        assert.match(
          await storage.getByRole('status').last().innerText(),
          /Archived interview recordings/
        )
        await storage.getByRole('button', { name: 'Add sample recording', exact: true }).click()
        assert.equal(await gauge.getAttribute('value'), '3.8')
        const recorder = page.getByRole('region', { name: 'Choose a recorder', exact: true })
        await recorder
          .getByRole('combobox', { name: 'Recorder', exact: true })
          .selectOption('travel')
        assert.equal(await recorder.getByRole('meter').getAttribute('value'), '10')
        assert.equal(await recorder.getByRole('meter').getAttribute('data-tone'), 'danger')
        assert.match(await recorder.innerText(), /20 minutes estimated recording time/)
        const room = page.getByRole('region', { name: 'Choose a study room', exact: true })
        await room.getByRole('combobox', { name: 'Study room', exact: true }).selectOption('studio')
        assert.equal(await room.getByRole('meter').getAttribute('value'), '28')
        assert.match(await room.innerText(), /4 seats/)
        await page.setViewportSize({ width: 320, height: 900 })
        assert.equal(
          await page.getByRole('meter').evaluateAll(nodes =>
            nodes.every(node => {
              const bounds = node.getBoundingClientRect()
              return bounds.left >= 0 && bounds.right <= window.innerWidth
            })
          ),
          true
        )
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('PasswordInput docs preserve autofill hosts, a renamed reveal action and hidden form submission without echoing credentials', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'password-input-tasks', async () => {
        await page.goto(`${baseURL}/docs/password-input/`)
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const signin = page.getByRole('region', { name: 'Prepare workspace sign in', exact: true }),
          password = signin.getByLabel(/^Password/)
        assert.equal(await password.getAttribute('type'), 'password')
        assert.equal(await password.getAttribute('autocomplete'), 'current-password')
        await password.fill('private-demo-password')
        await signin.getByRole('button', { name: 'Show password', exact: true }).click()
        assert.equal(
          await signin
            .getByRole('button', { name: 'Hide password', exact: true })
            .getAttribute('aria-pressed'),
          null
        )
        await signin.getByRole('button', { name: 'Prepare sign in', exact: true }).click()
        assert.equal(await password.getAttribute('type'), 'password')
        assert.match(
          await signin.getByRole('status').last().innerText(),
          /Sign-in request prepared for researcher@example.com/
        )
        assert.doesNotMatch(await signin.innerText(), /private-demo-password/)
        const change = page.getByRole('region', { name: 'Choose a new password', exact: true }),
          next = change.getByLabel(/^New password/),
          confirm = change.getByLabel(/^Confirm new password/)
        assert.equal(await next.getAttribute('autocomplete'), 'new-password')
        await next.fill('demo-new-password')
        await confirm.fill('demo-new-password')
        await change.getByRole('button', { name: 'Show password', exact: true }).click()
        await change.getByRole('button', { name: 'Show confirmation', exact: true }).click()
        await change.getByRole('button', { name: 'Prepare password change', exact: true }).click()
        assert.equal(await next.getAttribute('type'), 'password')
        assert.equal(await confirm.getAttribute('type'), 'password')
        assert.match(
          await change.getByRole('status').last().innerText(),
          /New password request prepared/
        )
        await change.getByRole('button', { name: 'Clear password fields', exact: true }).click()
        assert.equal(await next.inputValue(), '')
        assert.equal(await confirm.inputValue(), '')
        const review = page.getByRole('region', {
            name: 'Review a connection password',
            exact: true
          }),
          stored = review.getByLabel('Connection password', { exact: true })
        assert.equal(await stored.isEditable(), false)
        await review.getByRole('button', { name: 'Show password', exact: true }).click()
        assert.equal(await stored.inputValue(), 'reader-demo-password')
        await review
          .getByRole('combobox', { name: 'Demo connection', exact: true })
          .selectOption('component')
        assert.equal(await stored.getAttribute('type'), 'password')
        assert.equal(await stored.inputValue(), 'component-demo-password')
        await review.getByRole('combobox', { name: 'Direction', exact: true }).selectOption('rtl')
        assert.equal(await stored.evaluate(n => getComputedStyle(n).direction), 'rtl')
        await page.setViewportSize({ width: 320, height: 900 })
        assert.equal(
          await page.locator('[data-slot~="password-input-wrapper"]').evaluateAll(nodes =>
            nodes.every(node => {
              const b = node.getBoundingClientRect()
              return b.left >= 0 && b.right <= window.innerWidth
            })
          ),
          true
        )
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('NavLink docs connect native destinations, disclosure ownership and router content focus at narrow widths', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'nav-link-tasks', async () => {
        await page.goto(`${baseURL}/docs/nav-link/`)
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const workspace = page.getByRole('region', {
          name: 'Browse a study workspace',
          exact: true
        })
        await workspace.getByRole('link', { name: /^Participants/ }).click()
        assert.equal(
          await workspace.getByRole('link', { name: /^Participants/ }).getAttribute('aria-current'),
          'page'
        )
        await page.getByRole('heading', { name: 'Study participants', exact: true }).waitFor()
        assert.equal(
          await workspace
            .locator('section[aria-label="Workspace page"]')
            .evaluate(n => n === document.activeElement),
          true
        )
        const projects = page.getByRole('region', { name: 'Browse a project library', exact: true })
        await projects.getByRole('link', { name: /^Component kit/ }).click()
        assert.match(
          await projects.locator('section[aria-label="Project page"]').innerText(),
          /8 participants/
        )
        await projects.locator('[data-slot~="nav-link-group-trigger"]').click()
        assert.equal(
          await projects
            .locator('[data-slot~="nav-link-group"]')
            .evaluate((n: HTMLDetailsElement) => n.open),
          false
        )
        await projects.locator('[data-slot~="nav-link-group-trigger"]').press('Enter')
        assert.equal(
          await projects
            .locator('[data-slot~="nav-link-group"]')
            .evaluate((n: HTMLDetailsElement) => n.open),
          true
        )
        const settings = page.getByRole('region', { name: 'Navigate team settings', exact: true })
        await settings.getByRole('link', { name: /^Access rules/ }).click()
        assert.match(
          await settings.locator('section[aria-label="Settings page"]').innerText(),
          /Two administrators/
        )
        assert.equal(
          await settings.getByRole('link', { name: /^Access rules/ }).getAttribute('aria-current'),
          'page'
        )
        await settings.getByRole('combobox', { name: 'Direction', exact: true }).selectOption('rtl')
        assert.equal(
          await settings
            .getByRole('link', { name: /^Access rules/ })
            .evaluate(n => getComputedStyle(n).direction),
          'rtl'
        )
        await page.setViewportSize({ width: 320, height: 900 })
        assert.equal(
          await page.locator('[data-slot~="nav-link"]').evaluateAll(nodes =>
            nodes.every(node => {
              const b = node.getBoundingClientRect()
              return b.width === 0 || (b.left >= 0 && b.right <= window.innerWidth)
            })
          ),
          true
        )
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('Autocomplete docs submit off-list text, control recipient reset and retain values through async catalog recovery', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'autocomplete-tasks', async () => {
        await page.goto(`${baseURL}/docs/autocomplete/`)
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const topic = page.getByRole('region', { name: 'Plan a research topic', exact: true }),
          field = topic.getByRole('combobox', { name: /^Study topic/ })
        await field.fill('Custom research topic')
        await field.press('Escape')
        assert.equal(await field.inputValue(), 'Custom research topic')
        await topic.getByRole('button', { name: 'Prepare study', exact: true }).click()
        assert.match(
          await topic.getByRole('status').last().innerText(),
          /Study topic prepared: Custom research topic/
        )
        await topic.getByRole('button', { name: 'Restore initial topic', exact: true }).click()
        await page.waitForFunction(
          () =>
            document.querySelector<HTMLInputElement>('input[name="topic"]')?.value ===
            'Reading speed'
        )
        assert.equal(await field.inputValue(), 'Reading speed')
        const invitation = page.getByRole('region', {
            name: 'Prepare a participant invitation',
            exact: true
          }),
          recipient = invitation.getByRole('combobox', { name: /^Recipient email/ })
        await invitation.getByRole('button', { name: 'Clear text', exact: true }).click()
        assert.equal(await recipient.inputValue(), '')
        await recipient.fill('new-participant@example.com')
        await recipient.press('Escape')
        await invitation.getByRole('button', { name: 'Prepare invitation', exact: true }).click()
        assert.match(
          await invitation.getByRole('status').last().innerText(),
          /Invitation prepared for new-participant@example.com/
        )
        await invitation.getByRole('button', { name: 'Restore recipient', exact: true }).click()
        await page.waitForFunction(
          () =>
            document.querySelector<HTMLInputElement>('input[name="recipient"]')?.value ===
            'maya@example.com'
        )
        assert.equal(await recipient.inputValue(), 'maya@example.com')
        const dataset = page.getByRole('region', { name: 'Find a study dataset', exact: true }),
          query = dataset.getByRole('combobox', { name: /^Dataset name/ })
        await query.fill('Reader')
        await dataset.getByRole('option', { name: 'Reader study', exact: true }).waitFor()
        assert.equal(await query.inputValue(), 'Reader')
        await query.press('ArrowDown')
        await query.press('Enter')
        assert.equal(await query.inputValue(), 'Reader study')
        await dataset.getByRole('button', { name: 'Disconnect catalog', exact: true }).click()
        await query.click()
        await dataset
          .getByText('The catalog is unavailable. You can still enter a dataset name.', {
            exact: true
          })
          .waitFor()
        assert.equal(await query.inputValue(), 'Reader study')
        await query.fill('Unlisted survey')
        await dataset.getByRole('button', { name: 'Prepare dataset request', exact: true }).click()
        assert.match(
          await dataset.getByRole('status').last().innerText(),
          /Dataset request prepared: Unlisted survey/
        )
        await dataset.getByRole('button', { name: 'Reconnect catalog', exact: true }).click()
        await dataset.getByRole('combobox', { name: 'Direction', exact: true }).selectOption('rtl')
        assert.equal(await query.evaluate(n => getComputedStyle(n).direction), 'rtl')
        await page.setViewportSize({ width: 320, height: 900 })
        assert.equal(
          await page.locator('[data-slot~="autocomplete-input"]').evaluateAll(nodes =>
            nodes.every(node => {
              const b = node.getBoundingClientRect()
              return b.left >= 0 && b.right <= window.innerWidth
            })
          ),
          true
        )
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('Command docs register scoped shortcuts, update project records, focus real navigation and keep async lookup explicit', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'command-tasks', async () => {
        await page.goto(baseURL + '/docs/command/')
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const projects = page.getByRole('region', { name: 'Manage study projects', exact: true })
        const trigger = projects.getByRole('button', { name: 'Project commands', exact: true })
        await trigger.focus()
        await trigger.press('Control+k')
        const modal = projects.getByRole('dialog', { name: 'Project commands', exact: true })
        await modal.waitFor()
        const query = modal.getByRole('combobox', { name: 'Search commands', exact: true })
        assert.equal(await query.evaluate(node => node === node.ownerDocument.activeElement), true)
        await query.fill('Create')
        await query.press('ArrowDown')
        await query.press('Enter')
        await modal.waitFor({ state: 'hidden' })
        assert.match(
          await projects
            .getByRole('region', { name: 'Project command application', exact: true })
            .locator('output')
            .innerText(),
          /Study project 2 created/
        )
        await trigger.focus()
        await trigger.press('Control+n')
        assert.match(
          await projects
            .getByRole('region', { name: 'Project command application', exact: true })
            .locator('output')
            .innerText(),
          /Study project 3 created/
        )
        await trigger.click()
        await query.fill('archive')
        await query.press('ArrowDown')
        await query.press('Enter')
        assert.match(
          await projects
            .getByRole('region', { name: 'Project command application', exact: true })
            .locator('output')
            .innerText(),
          /Study project 3 archived/
        )
        const navigation = page.getByRole('region', { name: 'Navigate workspace', exact: true })
        await navigation.getByRole('button', { name: 'Navigate workspace', exact: true }).click()
        const search = navigation.getByRole('combobox', { name: 'Search commands', exact: true })
        await search.fill('settings')
        await search.press('ArrowDown')
        await search.press('Enter')
        const heading = navigation.getByRole('heading', { name: 'Workspace settings', exact: true })
        await heading.waitFor()
        assert.equal(
          await heading.evaluate(node => node === node.ownerDocument.activeElement),
          true
        )
        const lookup = page.getByRole('region', { name: 'Find study report', exact: true })
        await lookup.getByRole('button', { name: 'Find study report', exact: true }).click()
        const remote = lookup.getByRole('combobox', { name: 'Search commands', exact: true })
        await remote.fill('reader')
        await lookup
          .getByRole('option', { name: 'Open reader study report', exact: true })
          .waitFor()
        assert.equal(
          await lookup
            .getByText('No report is open. Search results do not open themselves.', { exact: true })
            .count(),
          1
        )
        await lookup.getByRole('button', { name: 'Disconnect search', exact: true }).click()
        await lookup.getByText('Report search is disconnected.', { exact: true }).waitFor()
        assert.equal(await remote.inputValue(), 'reader')
        await lookup.getByRole('button', { name: 'Reconnect search', exact: true }).click()
        await lookup
          .getByRole('option', { name: 'Open reader study report', exact: true })
          .waitFor()
        await remote.focus()
        await remote.press('ArrowDown')
        await remote.press('Enter')
        await lookup.getByText('Completed sessions: 24.', { exact: true }).waitFor()
        await lookup.getByRole('combobox', { name: 'Direction', exact: true }).selectOption('rtl')
        await page.setViewportSize({ width: 320, height: 800 })
        await lookup.getByRole('button', { name: 'Find study report', exact: true }).click()
        const box = lookup.getByRole('dialog', { name: 'Find study report', exact: true })
        assert.equal(await remote.evaluate(node => getComputedStyle(node).direction), 'rtl')
        assert.equal(
          await box.evaluate(node => {
            const rect = node.getBoundingClientRect()
            return rect.left >= 0 && rect.right <= innerWidth
          }),
          true
        )
        await remote.press('Escape')
        await box.waitFor({ state: 'hidden' })
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('EmptyState docs create real table records, recover an empty Combobox and retry Command without implicit activation', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'empty-state-tasks', async () => {
        await page.goto(baseURL + '/docs/empty-state/')
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const table = page.getByRole('region', { name: 'Project table', exact: true })
        await table.getByRole('button', { name: 'Create study project', exact: true }).click()
        const open = table.getByRole('button', { name: 'Open Reader study', exact: true })
        assert.equal(await open.evaluate(node => node === document.activeElement), true)
        await open.press('Enter')
        const details = table
          .getByRole('region', { name: 'Project details', exact: true })
          .getByRole('heading', { name: 'Reader study', exact: true })
        assert.equal(await details.evaluate(node => node === document.activeElement), true)
        await open.click()
        assert.equal(await details.evaluate(node => node === document.activeElement), true)
        const finder = page.getByRole('form', { name: 'Project finder', exact: true })
        const query = finder.getByRole('combobox', { name: 'Project', exact: true })
        await query.fill('Missing')
        const empty = page.getByRole('heading', { name: 'No matching projects', exact: true })
        await empty.waitFor()
        assert.equal(await empty.evaluate(node => node.closest('[role="listbox"]') === null), true)
        await query.press('Tab')
        const clear = finder.getByRole('button', { name: 'Clear search', exact: true })
        assert.equal(await clear.evaluate(node => node === document.activeElement), true)
        await clear.press('Enter')
        assert.equal(await query.evaluate(node => node === document.activeElement), true)
        await query.press('ArrowDown')
        await query.press('Enter')
        assert.equal(
          await finder.evaluate(form => {
            if (!(form instanceof HTMLFormElement))
              throw new Error('Project finder must be a native form')
            return new FormData(form).get('project')
          }),
          'reader'
        )
        await finder.getByRole('button', { name: 'Open project', exact: true }).click()
        await finder
          .getByRole('region', { name: 'Selected project', exact: true })
          .getByRole('heading', { name: 'Reader study', exact: true })
          .waitFor()
        const demo = page.getByRole('region', { name: 'Recover study reports', exact: true })
        const recovery = demo.getByRole('region', { name: 'Report recovery', exact: true })
        await recovery.getByRole('button', { name: 'Find a study report', exact: true }).click()
        const dialog = recovery.getByRole('dialog')
        const search = dialog.getByRole('combobox', { name: 'Search commands', exact: true })
        await search.fill('Reader')
        await search.press('Tab')
        const retry = dialog.getByRole('button', { name: 'Retry report search', exact: true })
        assert.equal(await retry.evaluate(node => node === document.activeElement), true)
        await retry.press('Enter')
        assert.equal(await search.evaluate(node => node === document.activeElement), true)
        assert.equal(await search.inputValue(), 'Reader')
        await dialog.getByRole('option', { name: 'Reader study report', exact: true }).waitFor()
        assert.equal(
          await recovery.getByRole('region', { name: 'Report details', exact: true }).count(),
          0
        )
        await search.press('ArrowDown')
        await search.press('Enter')
        const report = recovery.getByRole('heading', { name: 'Reader study report', exact: true })
        await report.waitFor()
        assert.equal(await report.evaluate(node => node === document.activeElement), true)
        await demo.getByRole('combobox', { name: 'Direction', exact: true }).selectOption('rtl')
        await page.setViewportSize({ width: 320, height: 600 })
        await recovery.getByRole('button', { name: 'Find a study report', exact: true }).click()
        await dialog.getByRole('button', { name: 'Disconnect catalog', exact: true }).click()
        await search.fill('Reader')
        await dialog.evaluate(node => {
          node.style.maxHeight = '190px'
        })
        await search.press('Tab')
        assert.equal(await retry.evaluate(node => node === document.activeElement), true)
        assert.equal(
          await retry.evaluate(
            node =>
              node.getBoundingClientRect().bottom <=
              node.closest('dialog')!.getBoundingClientRect().bottom
          ),
          true
        )
        assert.equal(await search.evaluate(node => getComputedStyle(node).direction), 'rtl')
        assert.equal(
          await dialog.evaluate(node => {
            const box = node.getBoundingClientRect()
            return box.left >= 0 && box.right <= innerWidth
          }),
          true
        )
        await search.press('Escape')
        await dialog.waitFor({ state: 'hidden' })
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('CodeBlock docs copy raw commands and generated exports, report denied writes and keep long source keyboard reachable', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    await page.addInitScript(() => {
      const writes: string[] = []
      Object.defineProperty(window, 'codeBlockWrites', { value: writes })
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (source: string) => {
            if (document.documentElement.dataset.clipboard === 'deny')
              throw new Error('Clipboard permission denied')
            writes.push(source)
          }
        }
      })
    })
    try {
      await capture(page, 'code-block-tasks', async () => {
        await page.goto(baseURL + '/docs/code-block/')
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const install = page.getByRole('region', { name: 'Package installation', exact: true })
        const theme = await install.locator('[data-slot="code-block"]').evaluate(node => {
          if (!(node instanceof HTMLElement)) throw new Error('Code block must have a native host')
          const root = node
          root.style.setProperty('--rad-code-block-border-width', '3px')
          root.style.setProperty('--rad-code-block-font-size', '18px')
          const result = {
            border: getComputedStyle(root).borderTopWidth,
            font: getComputedStyle(root.querySelector('code')!).fontSize
          }
          root.style.removeProperty('--rad-code-block-border-width')
          root.style.removeProperty('--rad-code-block-font-size')
          return result
        })
        assert.deepEqual(theme, { border: '3px', font: '18px' })
        await install
          .getByRole('combobox', { name: 'Package manager', exact: true })
          .selectOption('npm')
        await install.getByRole('button', { name: 'Copy install command', exact: true }).click()
        await install.getByText('Code copied.', { exact: true }).waitFor()
        assert.equal(
          await page.evaluate(() => Reflect.get(window, 'codeBlockWrites').at(-1)),
          'npm install @cognitap/radiant'
        )
        const form = page.getByRole('form', { name: 'Export configuration', exact: true })
        await form
          .getByRole('textbox', { name: 'Collection', exact: true })
          .fill('participant_notes')
        await form.getByRole('checkbox', { name: 'Include session timings', exact: true }).uncheck()
        await form
          .getByRole('button', { name: 'Generate export configuration', exact: true })
          .click()
        await form.getByRole('button', { name: 'Copy export configuration', exact: true }).click()
        const json = await page.evaluate(() => Reflect.get(window, 'codeBlockWrites').at(-1))
        assert.deepEqual(JSON.parse(json), {
          collection: 'participant_notes',
          fields: ['participantId', 'accuracy'],
          limit: 100
        })
        assert.equal(json.endsWith('\n'), true)
        await page.evaluate(() => {
          document.documentElement.dataset.clipboard = 'deny'
        })
        await form.getByRole('button', { name: 'Copy export configuration', exact: true }).click()
        await form
          .getByText('Could not copy code. Select the code and copy it manually.', { exact: true })
          .waitFor()
        assert.equal(
          await form
            .getByRole('button', { name: 'Copy export configuration', exact: true })
            .evaluate(node => node === document.activeElement),
          true
        )
        await page.evaluate(() => {
          delete document.documentElement.dataset.clipboard
        })
        await form.getByRole('button', { name: 'Copy export configuration', exact: true }).click()
        await form.getByText('Code copied.', { exact: true }).waitFor()
        const exportDemo = page.getByRole('region', { name: 'Inspect session export', exact: true })
        await exportDemo
          .getByRole('combobox', { name: 'Direction', exact: true })
          .selectOption('rtl')
        await page.setViewportSize({ width: 320, height: 800 })
        const sessions = exportDemo.getByRole('region', { name: 'Session export', exact: true })
        await sessions
          .getByRole('checkbox', { name: 'Completed sessions only', exact: true })
          .check()
        await sessions.getByRole('button', { name: 'Copy session CSV', exact: true }).click()
        const csv = await page.evaluate(() => Reflect.get(window, 'codeBlockWrites').at(-1))
        assert.equal(csv.includes('\r\n'), true)
        assert.equal(csv.includes('"S-104"'), true)
        assert.equal(csv.includes('Jonas'), false)
        const viewport = sessions.getByRole('group', {
          name: 'Session export: sessions.csv',
          exact: true
        })
        await viewport.focus()
        assert.equal(await viewport.evaluate(node => node === document.activeElement), true)
        await viewport.press('ArrowRight')
        await page.waitForFunction(
          () =>
            document.querySelector<HTMLElement>('[aria-label="Session export: sessions.csv"]')!
              .scrollLeft > 0
        )
        assert.equal(await viewport.evaluate(node => getComputedStyle(node).direction), 'ltr')
        assert.equal(
          await sessions.locator('[data-slot="code-block"]').evaluate(node => {
            const rect = node.getBoundingClientRect()
            return rect.left >= 0 && rect.right <= innerWidth
          }),
          true
        )
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('NumberField docs preserve keyboard steps, raw locale forms, clamping and controlled percentage refusals', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage()
    const errors = track(page)
    try {
      await capture(page, 'number-field', async () => {
        await page.goto(baseURL + '/docs/number-field/')
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const participants = page.getByRole('form', { name: 'Session participants', exact: true })
        const count = participants.getByRole('spinbutton', { name: /Participants/ })
        await count.focus()
        await page.keyboard.press('ArrowUp')
        await page.keyboard.press('PageUp')
        assert.equal(await count.inputValue(), '9')
        await participants.getByRole('button', { name: 'Plan session', exact: true }).click()
        assert.match(
          await participants.getByRole('status').innerText(),
          /9 participants; 135 participant-minutes/
        )
        await count.fill('30')
        assert.equal(
          await count.evaluate(node => {
            if (!(node instanceof HTMLInputElement)) throw new Error('Expected numeric editor')
            return node.validity.valid
          }),
          false
        )
        await participants.getByRole('button', { name: 'Plan session', exact: true }).click()
        assert.equal(await count.inputValue(), '12')
        assert.match(await participants.getByRole('status').innerText(), /12 participants/)
        await participants.getByRole('button', { name: 'Reset participants', exact: true }).click()
        await page.waitForFunction(
          () => document.querySelector<HTMLInputElement>('[name="participants"]')?.value === '3'
        )
        const budget = page.getByRole('form', { name: 'Session budget', exact: true })
        await budget.getByRole('spinbutton', { name: /Session rate/ }).fill('123,50 €')
        await budget.getByRole('button', { name: 'Calculate four sessions', exact: true }).click()
        assert.match(await budget.getByRole('status').innerText(), /Raw session rate: 123.5/)
        const target = page.getByRole('form', { name: 'Accuracy target', exact: true })
        const percent = target.getByRole('spinbutton', { name: /Required accuracy/ })
        await percent.fill('96%')
        assert.equal(await percent.inputValue(), '85%')
        assert.match(await target.getByRole('status').innerText(), /above 95% need review/)
        await percent.fill('90%')
        await target.getByRole('button', { name: 'Save target', exact: true }).click()
        assert.match(await target.getByRole('status').innerText(), /Raw value: 0.9/)
        await target.getByRole('button', { name: 'Restore target', exact: true }).click()
        await page.waitForFunction(
          () => document.querySelector<HTMLInputElement>('[name="target"]')?.value === '0.85'
        )
        const demo = page.getByRole('region', { name: 'Calculate session budget', exact: true })
        await demo.getByRole('combobox', { name: 'Direction', exact: true }).selectOption('rtl')
        await demo
          .getByRole('combobox', { name: 'Control size', exact: true })
          .selectOption('large')
        await page.setViewportSize({ width: 320, height: 800 })
        await budget
          .getByRole('combobox', { name: 'Number locale', exact: true })
          .selectOption('ar-EG')
        const bounds = await budget
          .locator('[data-slot~="number-field-wrapper"]')
          .evaluate(node => ({
            width: node.getBoundingClientRect().width,
            scroll: node.scrollWidth
          }))
        assert.ok(bounds.width <= 288 && bounds.scroll <= bounds.width + 1)
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('Resizable docs preserve fractional drag collapse, keyboard layout changes and explicit controlled persistence', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'resizable', async () => {
        await page.goto(baseURL + '/docs/resizable/')
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const files = page.getByRole('region', { name: 'Project file workspace', exact: true })
        const handle = files.getByRole('separator', { name: 'Project files', exact: true })
        await handle.focus()
        await page.keyboard.press('ArrowRight')
        assert.equal(await handle.getAttribute('aria-valuenow'), '33')
        const box = await handle.boundingBox()
        assert.ok(box)
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        await page.mouse.down()
        await page.mouse.move(box.x + box.width / 2 + 17.3, box.y + box.height / 2, { steps: 4 })
        await page.mouse.up()
        const after = Number(await handle.getAttribute('aria-valuenow'))
        assert.ok(after > 33)
        await files.getByRole('button', { name: 'Collapse files', exact: true }).click()
        assert.equal(await handle.getAttribute('aria-valuenow'), '0')
        await files.getByRole('button', { name: 'Restore files', exact: true }).click()
        assert.equal(Number(await handle.getAttribute('aria-valuenow')), after)
        await files.getByRole('button', { name: 'session.json', exact: true }).click()
        await files.getByRole('heading', { name: 'session.json', exact: true }).waitFor()
        const notes = page.getByRole('region', { name: 'Interview notes workspace', exact: true })
        await notes
          .getByRole('textbox', { name: 'Interview notes', exact: true })
          .fill('The participant requested larger text.')
        await notes.getByRole('button', { name: 'Prepare note snapshot', exact: true }).click()
        assert.match(
          await notes.getByRole('group', { name: 'Note snapshot JSON', exact: true }).innerText(),
          /"wordCount": 5/
        )
        const saved = page.getByRole('region', { name: 'Saved research workspace', exact: true })
        const navigation = saved.getByRole('separator', {
          name: 'Workspace navigation',
          exact: true
        })
        await navigation.focus()
        await page.keyboard.press('Enter')
        assert.equal(await navigation.getAttribute('aria-valuenow'), '20')
        const feedback = saved.getByRole('status', {
          name: 'Workspace layout feedback',
          exact: true
        })
        assert.match(await feedback.innerText(), /Keep navigation visible/)
        await saved.getByRole('button', { name: 'Widen navigation', exact: true }).click()
        await saved.getByRole('button', { name: 'Save layout', exact: true }).click()
        await saved.getByRole('button', { name: 'Reset layout', exact: true }).click()
        assert.equal(await navigation.getAttribute('aria-valuenow'), '20')
        await saved.getByRole('button', { name: 'Restore saved layout', exact: true }).click()
        assert.equal(await navigation.getAttribute('aria-valuenow'), '25')
        assert.match(await feedback.innerText(), /Saved workspace layout restored/)
        const demo = page.getByRole('region', { name: 'Edit interview notes', exact: true })
        await demo.getByRole('combobox', { name: 'Direction', exact: true }).selectOption('rtl')
        await page.setViewportSize({ width: 320, height: 850 })
        const noteHandle = notes.getByRole('separator', {
          name: 'Interview note editor',
          exact: true
        })
        const before = Number(await noteHandle.getAttribute('aria-valuenow'))
        await noteHandle.focus()
        await page.keyboard.press('ArrowDown')
        assert.equal(Number(await noteHandle.getAttribute('aria-valuenow')), before + 1)
        const width = await notes
          .locator('[data-slot~="resizable"]')
          .evaluate(node => node.getBoundingClientRect().width)
        assert.ok(width <= 288)
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('NavigationMenu docs navigate real content, resize filtered panels and preserve controlled refusal and RTL keyboard entry', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'navigation-menu', async () => {
        await page.goto(baseURL + '/docs/navigation-menu/')
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const library = page.getByRole('region', {
            name: 'Research library application',
            exact: true
          }),
          nav = library.getByRole('navigation', { name: 'Research library', exact: true }),
          studies = nav.getByRole('button', { name: 'Studies', exact: true })
        await studies.focus()
        await page.keyboard.press('ArrowDown')
        const first = nav.getByRole('link', { name: 'Reading comprehension', exact: true })
        assert.ok(await first.evaluate(node => node === node.ownerDocument.activeElement))
        await nav.getByRole('link', { name: 'Navigation study', exact: true }).click()
        await library.getByRole('heading', { name: 'Navigation study', exact: true }).waitFor()
        assert.equal(await studies.getAttribute('aria-expanded'), 'false')
        const help = page.getByRole('region', { name: 'Research help application', exact: true })
        await help
          .getByRole('combobox', { name: 'Guide audience', exact: true })
          .selectOption('new')
        await help.getByRole('button', { name: 'Guides', exact: true }).click()
        assert.equal(
          await help.getByRole('link', { name: 'Compare research rounds', exact: true }).count(),
          0
        )
        await help.getByRole('link', { name: 'Share session results', exact: true }).click()
        await help.getByRole('heading', { name: 'Share session results', exact: true }).waitFor()
        const workspace = page.getByRole('region', {
            name: 'Research workspace application',
            exact: true
          }),
          projects = workspace.getByRole('button', { name: 'Projects', exact: true })
        await workspace.getByRole('checkbox', { name: 'Keep navigation open', exact: true }).check()
        await projects.click()
        await page.keyboard.press('Escape')
        assert.equal(await projects.getAttribute('aria-expanded'), 'true')
        assert.match(
          await workspace
            .getByRole('status', { name: 'Research workspace feedback', exact: true })
            .innerText(),
          /Keep navigation open is enabled/
        )
        await workspace
          .getByRole('checkbox', { name: 'Keep navigation open', exact: true })
          .uncheck()
        await projects.click()
        await projects.focus()
        await page.keyboard.press('ArrowDown')
        await workspace.getByRole('link', { name: 'Harbor reading', exact: true }).click()
        await workspace.getByRole('heading', { name: 'Harbor reading', exact: true }).waitFor()
        const demo = page.getByRole('region', { name: 'Find study materials', exact: true })
        await demo.getByRole('combobox', { name: 'Direction', exact: true }).selectOption('rtl')
        await page.setViewportSize({ width: 320, height: 850 })
        await studies.focus()
        await page.keyboard.press('ArrowLeft')
        assert.ok(
          await nav
            .getByRole('button', { name: 'Resources', exact: true })
            .evaluate(node => node === node.ownerDocument.activeElement)
        )
        await page.keyboard.press('ArrowDown')
        const viewport = nav.locator('[data-slot~="navigation-menu-viewport"]')
        assert.ok((await viewport.boundingBox())!.width <= 288)
        await page.keyboard.press('Escape')
        assert.equal(await studies.getAttribute('aria-expanded'), 'false')
        assert.equal(await nav.getByRole('menu').count(), 0)
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('AppShell preserves routing, responsive navigation, notes and saved layouts through real landmarks', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }),
      errors = track(page)
    try {
      await capture(page, 'app-shell', async () => {
        await page.goto(baseURL + '/docs/app-shell/')
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const sessionsDemo = page.getByRole('region', {
            name: 'Review research sessions',
            exact: true
          }),
          sessions = sessionsDemo.frameLocator('iframe')
        const reminder = sessions.getByRole('textbox', { name: 'Project note', exact: true }),
          toggle = sessions.getByRole('button', { name: 'Toggle project navigation', exact: true })
        await reminder.fill('Bring large-print tasks')
        await toggle.click()
        await sessions.getByRole('link', { name: 'Harbor reading', exact: true }).click()
        await sessions.getByRole('heading', { name: 'Harbor reading', exact: true }).waitFor()
        assert.equal(
          await sessions.getByRole('table').getByRole('cell', { name: '18', exact: true }).count(),
          1
        )
        await toggle.click()
        assert.equal(await reminder.inputValue(), 'Bring large-print tasks')
        const notesDemo = page.getByRole('region', { name: 'Write research notes', exact: true }),
          notes = notesDemo.frameLocator('iframe')
        await notesDemo
          .getByRole('combobox', { name: 'Direction', exact: true })
          .selectOption('rtl')
        await notes.getByRole('button', { name: 'Toggle project navigation', exact: true }).click()
        await notes
          .getByRole('textbox', { name: 'Project note', exact: true })
          .fill('Preserved mobile note')
        await notes.getByRole('link', { name: 'Harbor reading', exact: true }).click()
        await notes
          .getByRole('textbox', { name: 'Interview notes', exact: true })
          .fill('The participant preferred larger text.')
        await notes.getByRole('button', { name: 'Save note', exact: true }).click()
        assert.equal(
          await notes.getByRole('blockquote', { name: 'Saved note', exact: true }).innerText(),
          'The participant preferred larger text.'
        )
        await notes.getByRole('button', { name: 'Toggle project navigation', exact: true }).click()
        assert.equal(
          await notes.getByRole('textbox', { name: 'Project note', exact: true }).inputValue(),
          'Preserved mobile note'
        )
        await page.keyboard.press('Escape')
        const saved = page
          .getByRole('region', { name: 'Restore a research layout', exact: true })
          .frameLocator('iframe')
        await saved.getByRole('button', { name: 'Toggle project navigation', exact: true }).click()
        await saved.getByRole('link', { name: 'Harbor reading', exact: true }).click()
        await saved.getByRole('button', { name: 'Save layout', exact: true }).click()
        await saved.getByRole('button', { name: 'Reset layout', exact: true }).click()
        await saved.getByRole('button', { name: 'Restore saved layout', exact: true }).click()
        await saved.getByRole('heading', { name: 'Harbor reading', exact: true }).waitFor()
        assert.equal(
          await saved
            .getByRole('button', { name: 'Toggle project navigation', exact: true })
            .getAttribute('aria-expanded'),
          'false'
        )
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('Form coordinates native validation, custom rules, server recovery and optional TanStack values', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'form', async () => {
        await page.goto(baseURL + '/docs/form/')
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const workspace = page.getByRole('region', {
            name: 'Create a research workspace',
            exact: true
          }),
          email = workspace.getByRole('textbox', { name: 'Owner email', exact: true }),
          slug = workspace.getByRole('textbox', { name: 'Workspace address', exact: true })
        await workspace.getByRole('button', { name: 'Create workspace', exact: true }).click()
        await page.waitForFunction(() => document.activeElement?.getAttribute('name') === 'email')
        assert.equal(await email.getAttribute('aria-invalid'), 'true')
        await email.fill('owner@example.com')
        await slug.fill('bad address')
        await workspace.getByRole('button', { name: 'Create workspace', exact: true }).click()
        await workspace
          .getByText('Use at least three lowercase letters, numbers or hyphens.', { exact: true })
          .waitFor()
        await slug.fill('atlas-research')
        await workspace.getByRole('button', { name: 'Create workspace', exact: true }).click()
        await workspace
          .getByRole('status')
          .filter({ hasText: 'Created atlas-research for owner@example.com.' })
          .waitFor()
        const recovery = page.getByRole('region', {
            name: 'Recover a collaborator invitation',
            exact: true
          }),
          collaborator = recovery.getByRole('textbox', { name: 'Collaborator email', exact: true })
        await collaborator.fill('taken@example.com')
        await recovery.getByRole('button', { name: 'Send invitation', exact: true }).click()
        await recovery
          .getByText('The invitation was not sent. Check the email address.', { exact: true })
          .waitFor()
        assert.equal(await collaborator.getAttribute('aria-invalid'), 'true')
        await collaborator.fill('new@example.com')
        await recovery.getByRole('button', { name: 'Send invitation', exact: true }).click()
        await recovery
          .getByRole('status')
          .filter({ hasText: 'Invitation sent to new@example.com.' })
          .waitFor()
        const profile = page.getByRole('region', { name: 'Edit a research profile', exact: true }),
          profileEmail = profile.getByRole('textbox', { name: 'Email', exact: true })
        await profileEmail.fill('changed@example.com')
        await profile.getByRole('button', { name: 'Save profile', exact: true }).click()
        await profile.getByRole('status').filter({ hasText: 'changed@example.com' }).waitFor()
        await profile.getByRole('button', { name: 'Reset profile', exact: true }).click()
        assert.equal(await profileEmail.inputValue(), 'researcher@example.com')
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})

test('Carousel docs navigate real studies, preserve notes and honor controlled refusal', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage(),
      errors = track(page)
    try {
      await capture(page, 'carousel', async () => {
        await page.goto(baseURL + '/docs/carousel/')
        await page.waitForFunction(
          () => !document.querySelector<HTMLButtonElement>('.demo-heading button')?.disabled
        )
        const review = page.getByRole('region', { name: 'Study library application', exact: true })
        await review.getByRole('button', { name: 'Next study', exact: true }).click()
        await review.getByRole('button', { name: 'Review Harbor reading', exact: true }).click()
        await review
          .getByRole('status', { name: 'Study review feedback', exact: true })
          .filter({ hasText: 'Harbor reading opened for review.' })
          .waitFor()
        const notes = page.getByRole('region', {
            name: 'Study preparation application',
            exact: true
          }),
          field = notes.getByRole('textbox', { name: 'Notes for Atlas onboarding', exact: true })
        await field.fill('Bring large-print consent')
        await notes
          .getByRole('button', { name: 'Save Atlas onboarding preparation', exact: true })
          .click()
        await notes.getByRole('button', { name: 'Next study', exact: true }).click()
        await notes.getByRole('button', { name: 'Previous study', exact: true }).click()
        assert.equal(await field.inputValue(), 'Bring large-print consent')
        const comparison = page.getByRole('region', {
          name: 'Research comparison application',
          exact: true
        })
        await comparison
          .getByRole('checkbox', { name: 'Keep the selected study', exact: true })
          .check()
        await comparison.getByRole('button', { name: 'Next study', exact: true }).click()
        await comparison
          .getByRole('status', { name: 'Comparison feedback', exact: true })
          .filter({ hasText: 'locked' })
          .waitFor()
        assert.equal(
          await comparison
            .locator('[data-slot~="carousel-slide"][data-selected]')
            .getAttribute('data-rad-carousel-value'),
          'atlas'
        )
        await comparison
          .getByRole('checkbox', { name: 'Keep the selected study', exact: true })
          .uncheck()
        await comparison.getByRole('button', { name: 'Show slide 3 of 3', exact: true }).click()
        await page.waitForFunction(() =>
          document
            .querySelector(
              '[aria-label="Research comparison application"] [data-rad-carousel-value="orchard"]'
            )
            ?.hasAttribute('data-selected')
        )
        await page
          .getByRole('region', { name: 'Prepare research notes', exact: true })
          .getByRole('combobox', { name: 'Direction', exact: true })
          .selectOption('rtl')
        await page.setViewportSize({ width: 320, height: 850 })
        await notes.getByRole('group', { name: 'Slides', exact: true }).focus()
        await page.keyboard.press('ArrowLeft')
        await page.waitForFunction(() =>
          document
            .querySelector('[aria-label="Study preparation"] [data-rad-carousel-value="harbor"]')
            ?.hasAttribute('data-selected')
        )
        assert.deepEqual(errors, [])
      })
    } finally {
      await page.close()
    }
  })
})
