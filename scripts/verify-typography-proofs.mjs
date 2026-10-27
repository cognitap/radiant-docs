import { setTypographyFamily } from './typography-controls.mjs'
import assert from 'node:assert/strict'
import * as Radiant from '@cognitap/radiant'

export async function verifyTypographyProofs(browser, baseURL) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce'
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  try {
    await page.goto(`${baseURL}/docs/workshop/`)
    const workshop = page.locator('.theme-workshop')
    await workshop.getByRole('button', { name: 'Typography', exact: true }).click()
    const proofs = page.getByRole('region', { name: 'Typography proof sheets', exact: true })
    const composition = proofs.getByRole('combobox', { name: 'Proof composition' })
    const layout = proofs.getByRole('combobox', { name: 'Proof layout' })
    const frames = proofs.locator('.proof-page')
    const supported = typeof Reflect.get(Radiant, 'generateTypography') === 'function'
    assert.equal(
      await proofs.getAttribute('data-proof-roles'),
      supported ? 'supported' : 'unavailable'
    )
    assert.equal(await proofs.locator('.proof-availability').count(), supported ? 0 : 1)
    await layout.selectOption('compare')
    assert.deepEqual(
      await proofs
        .locator('.proof-scaled-page')
        .evaluateAll(nodes => nodes.map(node => node.offsetWidth)),
      [800, 390]
    )
    if (supported) {
      const sizes = await frames
        .locator('[data-rad-text="prose-title"]')
        .evaluateAll(nodes => nodes.map(node => parseFloat(getComputedStyle(node).fontSize)))
      assert.ok(sizes[0] > sizes[1], `headings respond to their own content widths: ${sizes}`)
      assert.equal(
        await frames
          .first()
          .locator('[data-rad-prose] > p:not([data-rad-text])')
          .first()
          .evaluate(node => getComputedStyle(node).fontSize),
        '20px'
      )
    }
    if (supported) {
      assert.equal(
        await frames
          .first()
          .locator('pre')
          .evaluate(node => getComputedStyle(node).fontSize),
        '14px',
        'site code styling cannot override the production role'
      )
      const flow = await frames
        .first()
        .locator('[data-rad-prose] > p:not([data-rad-text])')
        .first()
        .evaluate(node => parseFloat(getComputedStyle(node).marginBlockStart))
      assert.equal(flow, 25, 'paragraph flow comes from the production rhythm')
    }
    const copy = proofs.locator('.proof-copy-editor')
    await copy.locator('summary').press('Enter')
    assert.equal(await frames.locator('em').count(), 2, 'unedited inline emphasis survives')
    const title =
      'A very long heading about useful interfaces, international collaboration, and unexpectedly complicated choices'
    await copy.getByRole('textbox', { name: 'Article · title', exact: true }).fill(title)
    assert.deepEqual(await frames.locator('h2').allTextContents(), [title, title])
    await copy
      .getByRole('textbox', { name: 'Article · body', exact: true })
      .fill('<img src=x onerror=alert(1)> Plain text, never executed.')
    assert.equal(await frames.locator('img').count(), 0)
    assert.equal(await frames.locator('em').count(), 0, 'edited copy becomes plain text')
    assert.equal(
      await frames
        .first()
        .getByText('<img src=x onerror=alert(1)> Plain text, never executed.', { exact: true })
        .count(),
      1
    )
    await copy.locator('summary').press('Enter')
    await composition.selectOption('form')
    await frames
      .first()
      .getByRole('textbox', { name: 'Name shown to collaborators' })
      .fill('Shared Ada')
    assert.equal(
      await frames
        .last()
        .getByRole('textbox', { name: 'Name shown to collaborators' })
        .inputValue(),
      'Shared Ada'
    )
    await frames.first().getByRole('checkbox').uncheck()
    assert.equal(await frames.last().getByRole('checkbox').isChecked(), false)
    await frames.last().getByRole('button', { name: 'Save preferences' }).click()
    assert.equal(
      await frames.getByRole('status').filter({ hasText: 'Saved locally for Shared Ada.' }).count(),
      2
    )
    await frames
      .first()
      .getByRole('textbox', { name: 'Email for important account updates' })
      .fill('bad')
    await frames.first().getByRole('button', { name: 'Save preferences' }).click()
    const invalid = frames
      .first()
      .getByRole('textbox', { name: 'Email for important account updates' })
    assert.equal(await invalid.getAttribute('aria-invalid'), 'true')
    assert.equal(await invalid.evaluate(node => node === document.activeElement), true)
    await invalid.fill('ada@example.com')
    await layout.selectOption('640')
    assert.equal(
      await frames.getByRole('textbox', { name: 'Name shown to collaborators' }).inputValue(),
      'Shared Ada'
    )
    await composition.selectOption('data')
    await layout.selectOption('compare')
    await frames
      .first()
      .getByRole('textbox', { name: 'Filter projects by name, team or status' })
      .fill('Design')
    assert.equal(
      await frames
        .last()
        .getByRole('textbox', { name: 'Filter projects by name, team or status' })
        .inputValue(),
      'Design'
    )
    assert.equal(await frames.locator('tbody tr').count(), 4)
    await frames
      .first()
      .getByRole('textbox', { name: 'Filter projects by name, team or status' })
      .fill('no match')
    assert.equal(await frames.locator('tbody tr').count(), 0)
    assert.equal(
      await frames.getByRole('status').filter({ hasText: '0 projects shown.' }).count(),
      2
    )
    await composition.selectOption('landing')
    await frames.first().getByRole('button', { name: 'Join the list' }).click()
    assert.equal(await frames.getByRole('status').filter({ hasText: 'local list' }).count(), 2)
    const ids = await page.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id))
    assert.equal(
      new Set(ids).size,
      ids.length,
      'comparison frames have distinct form and anchor identities'
    )
    await proofs.getByRole('button', { name: 'Reset current proof' }).click()
    assert.equal(
      await frames.getByRole('status').filter({ hasText: 'No signup is sent.' }).count(),
      2
    )
    await composition.selectOption('form')
    assert.equal(
      await frames
        .first()
        .getByRole('textbox', { name: 'Name shown to collaborators' })
        .inputValue(),
      'Shared Ada'
    )
    await composition.selectOption('article')
    assert.deepEqual(await frames.locator('h2').allTextContents(), [title, title])
    await setTypographyFamily(workshop)
    if (supported && !(await workshop.locator('.typesetting-editor').count()))
      assert.match(
        await frames
          .first()
          .locator('h2')
          .evaluate(node => getComputedStyle(node).fontFamily),
        /Georgia/
      )
    const themeBefore = await frames.first().evaluate(node => node.getAttribute('style'))
    await proofs.getByRole('button', { name: 'Reset current proof' }).click()
    assert.equal(
      await frames.first().evaluate(node => node.getAttribute('style')),
      themeBefore,
      'proof reset preserves the theme'
    )
    await composition.selectOption('data')
    assert.equal(
      await frames
        .first()
        .getByRole('textbox', { name: 'Filter projects by name, team or status' })
        .inputValue(),
      'no match'
    )
    await proofs.getByRole('button', { name: 'Reset current proof' }).click()
    await copy.locator('summary').press('Enter')
    await copy.getByRole('textbox', { name: 'Data · project one', exact: true }).fill('Twin')
    await copy.getByRole('textbox', { name: 'Data · project two', exact: true }).fill('Twin')
    await copy.locator('summary').press('Enter')
    await frames
      .first()
      .getByRole('textbox', { name: 'Filter projects by name, team or status' })
      .fill('Twin')
    assert.equal(
      await frames.locator('tbody tr').count(),
      4,
      'duplicate edited names remain independent rows in both frames'
    )
    await proofs.getByRole('button', { name: 'Reset current proof' }).click()
    assert.equal(
      await frames.locator('tbody tr').count(),
      8,
      'reset/filter do not leave orphaned rows after duplicate edits'
    )
    await workshop.getByRole('button', { name: 'Color', exact: true }).click()
    await workshop.getByRole('textbox', { name: 'Brand color', exact: true }).fill('#166534')
    await workshop.getByRole('button', { name: 'Typography', exact: true }).click()
    assert.equal(await composition.inputValue(), 'data', 'editor switching retains proof controls')
    const accent = await frames
      .first()
      .evaluate(node => getComputedStyle(node).getPropertyValue('--rad-color-accent'))
    await workshop.getByRole('button', { name: 'Reset typography', exact: true }).click()
    assert.equal(
      await frames
        .first()
        .evaluate(node => getComputedStyle(node).getPropertyValue('--rad-color-accent')),
      accent
    )
    await composition.selectOption('form')
    assert.equal(
      await frames
        .first()
        .getByRole('textbox', { name: 'Name shown to collaborators' })
        .inputValue(),
      'Shared Ada',
      'typography reset preserves proof interactions'
    )

    for (const viewport of [1440, 390, 320]) {
      await page.setViewportSize({ width: viewport, height: 1000 })
      for (const proof of ['article', 'form', 'data', 'landing']) {
        await composition.selectOption(proof)
        for (const width of ['800', '640', '390', '320', 'compare']) {
          await layout.selectOption(width)
          for (const mode of ['light', 'dark']) {
            await workshop
              .getByRole('combobox', { name: 'Preview mode', exact: true })
              .selectOption(mode)
            await page.waitForFunction(() =>
              [...document.querySelectorAll('.proof-viewport')].every(node => node.offsetHeight > 0)
            )
            assert.equal(await frames.first().getAttribute('data-rad-mode'), mode)
            assert.equal(
              await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
              true,
              `${viewport}/${proof}/${width}/${mode}: page reflows`
            )
            const overflow = await frames.evaluateAll(nodes =>
              nodes
                .filter(node => node.scrollWidth > node.clientWidth + 1)
                .map(node => [node.clientWidth, node.scrollWidth])
            )
            assert.deepEqual(
              overflow,
              [],
              `${viewport}/${proof}/${width}/${mode}: only named inner regions may scroll`
            )
          }
        }
        await layout.selectOption(viewport === 1440 ? '800' : '320')
        await workshop
          .getByRole('combobox', { name: 'Preview mode', exact: true })
          .selectOption('light')
        await proofs
          .locator('.proof-frame')
          .screenshot({ path: `output/docs/typography-${proof}-${viewport}.png` })
      }
    }
    await layout.selectOption('320')
    await composition.selectOption('data')
    const table = frames.getByRole('region', { name: 'Team activity and monthly commitments' })
    await table.focus()
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(() => document.querySelector('.proof-scroll').scrollLeft > 0)
    assert.ok(
      await table.evaluate(node => node.scrollLeft > 0),
      'named data region scrolls by keyboard'
    )
    await composition.selectOption('article')
    const code = frames.getByRole('region', { name: 'Article code sample' })
    await code.focus()
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(() => document.querySelector('.proof-scroll').scrollLeft > 0)
    await proofs.getByRole('checkbox', { name: 'Text spacing probe' }).check()
    assert.equal(await frames.first().evaluate(node => node.scrollWidth <= node.clientWidth), true)
    await page.reload()
    await workshop.getByRole('button', { name: 'Typography', exact: true }).click()
    assert.equal(await layout.inputValue(), '800')
    assert.equal(await frames.locator('em').count(), 1, 'reload restores default copy')
    assert.deepEqual(errors, [], 'no hydration, runtime or ResizeObserver errors')
    console.log(
      `Typography proofs passed: ${supported ? 'packed production roles and local-container sizing' : 'released semantic fallback with availability notice'}, editable shared copy/form/data state, safe text, isolated resets, 4 compositions × 5 layouts × 2 modes × 3 viewports, keyboard scrolling and reload.`
    )
  } catch (error) {
    await page
      .screenshot({ path: 'output/docs/typography-failure.png', fullPage: true })
      .catch(() => {})
    throw error
  } finally {
    await context.close()
  }
}
