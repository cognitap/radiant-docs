import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

export async function verifyTypesettingEditor(browser, baseURL) {
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1100 },
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
    const editor = workshop.locator('.typesetting-editor')
    await editor.waitFor()
    const preview = page.getByRole('region', { name: 'Theme preview', exact: true })
    const proof = preview.locator('.preview-page').first()
    const scene = preview.getByRole('combobox', { name: 'Scene', exact: true })
    const number = name => editor.getByRole('spinbutton', { name, exact: true })
    const select = name => editor.getByRole('combobox', { name, exact: true })
    const body = () => proof.locator('[data-rad-prose] > p:not([data-rad-text])').first()
    const fontFaces = () =>
      page.evaluate(() => [...document.fonts].map(face => face.family.replaceAll('"', '')))
    const interAndMonoLoaded = () =>
      page.waitForFunction(
        () =>
          [...document.fonts].filter(face =>
            ['Inter', 'IBM Plex Mono'].includes(face.family.replaceAll('"', ''))
          ).length >= 4
      )
    await interAndMonoLoaded()
    assert.equal(await select('Starting point').inputValue(), 'inter')
    assert.equal(await select('Text style').locator('option').count(), 16)
    assert.equal(await body().evaluate(node => getComputedStyle(node).fontSize), '20px')
    await number('Prose leading').fill('1.85')
    await select('Body assignment').selectOption('source-serif-4')
    assert.equal(await number('Prose leading').inputValue(), '1.85')
    assert.equal(await number('Prose size (px)').inputValue(), '21')
    assert.equal(await body().evaluate(node => getComputedStyle(node).lineHeight), '38.85px')
    await select('Text style').selectOption('prose-body')
    await number('Style tracking (em)').fill('0.02')
    await editor.getByRole('button', { name: 'Reset prose rhythm', exact: true }).click()
    assert.equal(await number('Prose leading').inputValue(), '1.65')
    assert.equal(await number('Style tracking (em)').inputValue(), '0.02')
    await select('Headings assignment').selectOption('plex-sans')
    assert.equal(await select('Body assignment').inputValue(), 'source-serif-4')
    await select('Text style').selectOption('prose-title')
    await number('Wide size (px)').fill('90')
    await number('Narrow size (px)').fill('42')
    await number('Style weight').fill('850')
    assert.match(await editor.getByRole('alert').innerText(), /850.*100–700/)
    assert.equal(await number('Style weight').inputValue(), '850', 'requested weight retained')
    await number('Style leading').fill('1.2')
    await number('Style tracking (em)').fill('-0.01')
    await number('Style measure (ch)').fill('18')
    await preview.getByRole('combobox', { name: 'Preview width', exact: true }).selectOption('800')
    await preview.getByRole('combobox', { name: 'Compare', exact: true }).selectOption('390')
    const sizes = await preview
      .locator('[data-rad-text="prose-title"]')
      .evaluateAll(nodes => nodes.map(node => parseFloat(getComputedStyle(node).fontSize)))
    assert.ok(sizes[0] > sizes[1], `local container interpolation: ${sizes}`)
    await preview.getByRole('combobox', { name: 'Compare', exact: true }).selectOption('none')
    await number('Prose size (px)').fill('24')
    assert.equal(
      await number('Narrow size (px)').inputValue(),
      '42',
      'style overrides survive rhythm edits'
    )
    await editor.getByRole('button', { name: 'Reset selected style', exact: true }).click()
    assert.notEqual(await number('Narrow size (px)').inputValue(), '42')
    assert.equal(await number('Prose size (px)').inputValue(), '24')
    await select('Text style').selectOption('ui-body')
    await number('Style size (px)').fill('19')
    assert.equal(await number('Style size (px)').inputValue(), '19')
    await select('Style assignment').selectOption('body')
    assert.equal(await select('Style assignment').inputValue(), 'body')
    await number('UI size (px)').fill('18')
    await editor.getByRole('button', { name: 'Reset UI rhythm', exact: true }).click()
    assert.equal(await number('UI size (px)').inputValue(), '16')
    assert.equal(
      await number('Style size (px)').inputValue(),
      '19',
      'UI reset retains style override'
    )
    await number('Prose size (px)').fill('')
    await number('Prose size (px)').pressSequentially('21')
    assert.equal(await number('Prose size (px)').inputValue(), '21')
    await number('Prose size (px)').fill('99')
    assert.equal(await number('Prose size (px)').getAttribute('aria-invalid'), 'true')
    await number('Prose size (px)').press('Tab')
    assert.equal(await number('Prose size (px)').inputValue(), '21')
    await preview.getByRole('button', { name: 'Inspect', exact: true }).click()
    await proof.locator('[data-rad-text="prose-title"]').click()
    assert.equal(await select('Text style').inputValue(), 'prose-title')
    await body().click()
    assert.equal(await select('Text style').inputValue(), 'prose-body')
    assert.equal(
      await body().evaluate(node => getComputedStyle(node).outlineStyle),
      'solid',
      'automatic semantic prose is highlighted too'
    )
    await scene.selectOption('page:landing')
    await proof
      .getByRole('button', { name: 'Join the list', exact: true })
      .click({ position: { x: 3, y: 3 } })
    assert.equal(
      await proof.getByRole('status').filter({ hasText: 'No signup is sent.' }).count(),
      1,
      'inspection pauses actions even when clicking button padding'
    )
    await preview.getByRole('button', { name: 'Inspect', exact: true }).click()
    await scene.selectOption('page:form')
    await proof
      .getByRole('textbox', { name: 'Name shown to collaborators' })
      .fill('Typesetting Ada')
    const accent = await proof.evaluate(node =>
      getComputedStyle(node).getPropertyValue('--rad-color-accent')
    )
    await select('Text style').selectOption('ui-body')
    await editor.getByRole('checkbox', { name: 'Responsive endpoints', exact: true }).check()
    await number('Wide size (px)').fill('30')
    await select('Starting point').selectOption('plex')
    assert.equal(
      await proof.getByRole('textbox', { name: 'Name shown to collaborators' }).inputValue(),
      'Typesetting Ada'
    )
    assert.equal(
      await proof.evaluate(node => getComputedStyle(node).getPropertyValue('--rad-color-accent')),
      accent
    )
    assert.equal(await number('Prose size (px)').inputValue(), '20')
    assert.equal(await editor.getByRole('alert').count(), 0)
    assert.equal(
      await editor.getByRole('checkbox', { name: 'Responsive endpoints', exact: true }).isChecked(),
      false,
      'starting points restore the fixed/fluid editor state too'
    )
    await select('Text style').selectOption('ui-body')
    assert.equal(
      await number('Style size (px)').inputValue(),
      '16',
      'starting point clears style overrides'
    )
    const manual = editor.locator('details')
    await manual.locator('summary').click()
    await editor.getByRole('textbox', { name: 'Manual CSS family' }).fill('Georgia, serif')
    await editor.getByRole('button', { name: 'Use manual family', exact: true }).click()
    assert.match(await editor.innerText(), /Uncalibrated Body/)
    assert.equal(await number('Prose leading').inputValue(), '1.65')
    await editor.getByRole('textbox', { name: 'Manual CSS family' }).fill('bad; color:red')
    await editor.getByRole('button', { name: 'Use manual family', exact: true }).click()
    assert.match(await editor.locator('.typesetting-notice').innerText(), /family/)
    assert.equal(await number('Prose leading').inputValue(), '1.65')
    const lab = workshop.locator('.workshop-typeface-lab')
    await lab.locator(':scope > summary').click()
    const font = lab.locator('.font-editor')
    await font.getByText('Try a local font file', { exact: true }).click()
    await font
      .getByRole('textbox', { name: 'Local CSS family', exact: true })
      .fill('Typesetting brand')
    await font.getByLabel('Local font file', { exact: true }).setInputFiles({
      name: 'private.ttf',
      mimeType: 'font/ttf',
      buffer: await readFile(new URL('./fixtures/InterVariable.ttf', import.meta.url))
    })
    await page.waitForFunction(() =>
      document.querySelector('.font-status').textContent.startsWith('Typesetting brand loaded')
    )
    await select('Body assignment').selectOption('local')
    assert.match(await editor.innerText(), /Uncalibrated Body/)
    await select('Text style').selectOption('prose-body')
    await number('Style weight').fill('990')
    assert.match(await editor.getByRole('alert').innerText(), /990.*100–900/)
    await font.getByRole('button', { name: 'Remove local font', exact: true }).click()
    assert.equal((await fontFaces()).includes('Typesetting brand'), false)
    assert.match(
      await select('Body assignment').locator('option:checked').innerText(),
      /Typesetting brand.*missing/
    )
    await select('Starting point').selectOption('inter')
    await number('Prose leading').focus()
    await number('Prose leading').press('ArrowUp')
    assert.notEqual(await number('Prose leading').inputValue(), '1.6')
    for (const width of [1600, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 })
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `${width}px editor reflows`
      )
      await workshop
        .getByRole('combobox', { name: 'Preview mode', exact: true })
        .selectOption('dark')
      await editor.screenshot({ path: `output/docs/typesetting-${width}.png` })
    }
    await workshop.getByRole('button', { name: 'Color', exact: true }).click()
    await workshop.getByRole('textbox', { name: 'Brand color', exact: true }).fill('#166534')
    await workshop.getByRole('button', { name: 'Typography', exact: true }).click()
    assert.equal(await select('Starting point').inputValue(), 'inter')
    await workshop.getByRole('button', { name: 'Reset typography', exact: true }).click()
    assert.equal(await number('Prose leading').inputValue(), '1.6')
    assert.equal(
      await proof.getByRole('textbox', { name: 'Name shown to collaborators' }).inputValue(),
      'Typesetting Ada'
    )
    await interAndMonoLoaded()
    const faces = await fontFaces()
    assert.equal(
      new Set(faces).size,
      faces.length / 2,
      'normal/italic pairs are shared without duplicate registration'
    )
    await workshop.getByRole('textbox', { name: 'Configuration JSON', exact: true }).fill(
      JSON.stringify({
        kind: 'radiant-theme',
        version: 1,
        id: 'legacy-proof',
        name: 'Legacy proof',
        sections: {
          typography: { values: { family: 'Georgia, serif' } },
          color: { values: { accent: '#166534' } },
          components: { values: { button: { radius: '23px' } } }
        }
      })
    )
    await workshop.getByRole('button', { name: 'Import JSON', exact: true }).click()
    assert.equal(
      await editor.getAttribute('data-typesetting'),
      'uninitialized',
      'legacy import retains its authored typography until explicitly adopted'
    )
    assert.equal(
      await editor.getByRole('combobox', { name: 'Body assignment', exact: true }).count(),
      0
    )
    await editor.getByRole('button', { name: 'Start with Inter', exact: true }).click()
    assert.equal(await number('Prose size (px)').inputValue(), '20')
    assert.equal(
      await proof.evaluate(node =>
        getComputedStyle(node).getPropertyValue('--rad-color-accent').trim()
      ),
      '#166534'
    )
    assert.equal(
      await proof.evaluate(node =>
        getComputedStyle(node).getPropertyValue('--rad-button-radius').trim()
      ),
      '23px'
    )
    assert.equal(
      await proof.getByRole('textbox', { name: 'Name shown to collaborators' }).inputValue(),
      'Typesetting Ada'
    )
    await page.reload()
    await workshop.getByRole('button', { name: 'Typography', exact: true }).click()
    assert.equal(await select('Starting point').inputValue(), 'inter')
    assert.deepEqual(errors, [], 'no hydration/runtime/console errors')
    console.log(
      'Typesetting editor passed: 16 production styles, four independent assignments, profile/manual rhythm, fixed/fluid overrides, scoped resets, actual local font and weight warnings, preview picking/state, keyboard drafts, shared faces, 320px/390px reflow and reload.'
    )
  } catch (error) {
    await page
      .screenshot({ path: 'output/docs/typesetting-failure.png', fullPage: true })
      .catch(() => {})
    throw error
  } finally {
    await context.close()
  }
}
