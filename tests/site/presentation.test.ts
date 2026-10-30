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
