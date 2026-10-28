import { setTypographyFamily } from './typography-controls.mjs'
import { openPreviewOptions } from './preview-options.mjs'
import assert from 'node:assert/strict'

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
    await page.goto(`${baseURL}/workshop/`)
    const workshop = page.locator('.theme-workshop')
    await workshop.getByRole('button', { name: 'Typography', exact: true }).click()
    const preview = page.getByRole('region', { name: 'Theme preview', exact: true })
    const scene = preview.getByRole('combobox', { name: 'Scene', exact: true })
    const width = preview.getByRole('combobox', { name: 'Preview width', exact: true })
    const compare = preview.getByRole('combobox', { name: 'Compare', exact: true })
    const mode = preview.getByRole('combobox', { name: 'Preview mode', exact: true })
    const frames = preview.locator('.preview-page')
    const layout = async choice => {
      if (choice === 'compare') {
        await width.selectOption('800')
        await compare.selectOption('390')
      } else {
        await compare.selectOption('none')
        await width.selectOption(choice)
      }
    }
    const reset = () => preview.getByRole('button', { name: 'Reset scene', exact: true }).click()
    await layout('compare')
    assert.deepEqual(
      await preview
        .locator('.preview-scaled-page')
        .evaluateAll(nodes => nodes.map(node => node.offsetWidth)),
      [800, 390]
    )
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
    const copy = preview.locator('.preview-copy-editor')
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
    await scene.selectOption('page:form')
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
    await layout('640')
    assert.equal(
      await frames.getByRole('textbox', { name: 'Name shown to collaborators' }).inputValue(),
      'Shared Ada'
    )
    await scene.selectOption('page:data')
    await layout('compare')
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
    await scene.selectOption('page:landing')
    await frames.first().getByRole('button', { name: 'Join the list' }).click()
    assert.equal(await frames.getByRole('status').filter({ hasText: 'local list' }).count(), 2)
    const ids = await page.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id))
    assert.equal(
      new Set(ids).size,
      ids.length,
      'comparison frames have distinct form and anchor identities'
    )
    await reset()
    assert.equal(
      await frames.getByRole('status').filter({ hasText: 'No signup is sent.' }).count(),
      2
    )
    await scene.selectOption('page:form')
    assert.equal(
      await frames
        .first()
        .getByRole('textbox', { name: 'Name shown to collaborators' })
        .inputValue(),
      'Shared Ada'
    )
    await scene.selectOption('page:article')
    assert.deepEqual(await frames.locator('h2').allTextContents(), [title, title])
    await setTypographyFamily(workshop)
    if (!(await workshop.locator('.typesetting-editor').count()))
      assert.match(
        await frames
          .first()
          .locator('h2')
          .evaluate(node => getComputedStyle(node).fontFamily),
        /Georgia/
      )
    const themeBefore = await frames.first().evaluate(node => node.getAttribute('style'))
    await reset()
    assert.equal(
      await frames.first().evaluate(node => node.getAttribute('style')),
      themeBefore,
      'scene reset preserves the theme'
    )
    await scene.selectOption('page:data')
    assert.equal(
      await frames
        .first()
        .getByRole('textbox', { name: 'Filter projects by name, team or status' })
        .inputValue(),
      'no match'
    )
    await reset()
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
    await reset()
    assert.equal(
      await frames.locator('tbody tr').count(),
      8,
      'reset/filter do not leave orphaned rows after duplicate edits'
    )
    await workshop.getByRole('button', { name: 'Color', exact: true }).click()
    await workshop.getByRole('textbox', { name: 'Brand color', exact: true }).fill('#166534')
    await workshop.getByRole('button', { name: 'Typography', exact: true }).click()
    assert.equal(await scene.inputValue(), 'page:data', 'editor switching retains the scene')
    assert.equal(await compare.inputValue(), '390', 'editor switching retains the comparison')
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
    await scene.selectOption('page:form')
    assert.equal(
      await frames
        .first()
        .getByRole('textbox', { name: 'Name shown to collaborators' })
        .inputValue(),
      'Shared Ada',
      'typography reset preserves scene interactions'
    )

    for (const viewport of [1440, 390, 320]) {
      await page.setViewportSize({ width: viewport, height: 1000 })
      await openPreviewOptions(preview)
      for (const id of ['page:article', 'page:form', 'page:data', 'page:landing']) {
        await scene.selectOption(id)
        for (const choice of ['800', '640', '390', '320', 'compare']) {
          await layout(choice)
          for (const next of ['light', 'dark']) {
            await mode.selectOption(next)
            await page.waitForFunction(() =>
              [...document.querySelectorAll('.preview-viewport')].every(
                node => node.offsetHeight > 0
              )
            )
            assert.equal(await frames.first().getAttribute('data-rad-mode'), next)
            assert.equal(
              await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
              true,
              `${viewport}/${id}/${choice}/${next}: page reflows`
            )
            const overflow = await frames.evaluateAll(nodes =>
              nodes
                .filter(node => node.scrollWidth > node.clientWidth + 1)
                .map(node => [node.clientWidth, node.scrollWidth])
            )
            assert.deepEqual(
              overflow,
              [],
              `${viewport}/${id}/${choice}/${next}: only named inner regions may scroll`
            )
          }
        }
        await layout(viewport === 1440 ? '800' : '320')
        await mode.selectOption('light')
        await preview
          .locator('.preview-frame')
          .first()
          .screenshot({ path: `output/docs/typography-${id.slice(5)}-${viewport}.png` })
      }
    }
    await layout('320')
    await scene.selectOption('page:data')
    const table = frames.getByRole('region', { name: 'Team activity and monthly commitments' })
    await table.focus()
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(() => document.querySelector('.scene-scroll').scrollLeft > 0)
    assert.ok(
      await table.evaluate(node => node.scrollLeft > 0),
      'named data region scrolls by keyboard'
    )
    await scene.selectOption('page:article')
    const code = frames.getByRole('region', { name: 'Article code sample' })
    await code.focus()
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(() => document.querySelector('.scene-scroll').scrollLeft > 0)
    await preview.getByRole('checkbox', { name: 'Text spacing probe' }).check()
    assert.equal(await frames.first().evaluate(node => node.scrollWidth <= node.clientWidth), true)
    await page.reload()
    await workshop.getByRole('button', { name: 'Typography', exact: true }).click()
    await openPreviewOptions(preview)
    assert.equal(await width.inputValue(), 'fill')
    assert.equal(await frames.locator('em').count(), 1, 'reload restores default copy')
    assert.deepEqual(errors, [], 'no hydration, runtime or ResizeObserver errors')
    console.log(
      'Typography pages passed: packed production roles and local-container sizing, editable shared copy/form/data state, safe text, isolated resets, 4 pages × 5 layouts × 2 modes × 3 viewports, keyboard scrolling and reload.'
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
