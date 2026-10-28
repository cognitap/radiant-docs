import { closePreviewOptions, openPreviewOptions } from './preview-options.mjs'
import { pickRadio, pickedRadio, radioGroup } from './typography-controls.mjs'
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
    const pick = (group, value) => pickRadio(editor, group, value)
    const picked = group => pickedRadio(editor, group)
    const undo = workshop.getByRole('button', { name: 'Undo', exact: true })
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
    assert.equal(await picked('Starting point'), 'inter')
    assert.equal(await radioGroup(editor, 'Text style').getByRole('radio').count(), 16)
    assert.equal(await body().evaluate(node => getComputedStyle(node).fontSize), '20px')
    const faceOf = locator => locator.evaluate(node => getComputedStyle(node).fontFamily)
    await page.waitForFunction(() =>
      [...document.querySelectorAll('.face-card .face-sample')].every(node => !node.dataset.face)
    )
    const serifCard = radioGroup(editor, 'Body assignment').locator('.face-card').nth(1)
    assert.match(await faceOf(serifCard.locator('.face-sample')), /^"Source Serif 4"/)
    assert.match(
      await faceOf(
        radioGroup(editor, 'Starting point')
          .locator('.face-card')
          .nth(2)
          .locator('.face-sample')
          .first()
      ),
      /^"IBM Plex Sans"/,
      'pairing cards render heading and body in their own faces'
    )
    assert.match(
      await faceOf(editor.locator('.role-row').nth(0).locator('.role-specimen')),
      /^Inter/
    )
    assert.ok(
      await page.evaluate(() =>
        [...document.fonts].some(
          face => face.family.replaceAll('"', '') === 'Source Serif 4' && face.status === 'loaded'
        )
      ),
      'the sample face is a loaded FontFace, not its fallback'
    )
    await radioGroup(editor, 'Starting point').getByRole('radio').first().focus()
    await page.keyboard.press('ArrowRight')
    assert.equal(await picked('Starting point'), 'source-serif', 'arrows pick a pairing')
    assert.equal(await picked('Body assignment'), 'source-serif-4')
    assert.equal(
      await page.evaluate(() => document.activeElement.value),
      'source-serif',
      'one tab stop per group'
    )
    await page.keyboard.press('ArrowLeft')
    assert.equal(await picked('Starting point'), 'inter')

    const measureGrip = preview.getByRole('slider', { name: 'Prose measure (ch)', exact: true })
    await preview.getByRole('combobox', { name: 'Preview width', exact: true }).selectOption('800')
    await measureGrip.scrollIntoViewIfNeeded()
    const widthBefore = await body().evaluate(node => getComputedStyle(node).maxWidth)
    const stepsBefore = await undo.isDisabled()
    assert.equal(stepsBefore, false, 'the pairing picks are undoable')
    const pastBefore = await page.evaluate(
      () => document.querySelectorAll('.control-change-marker').length
    )
    await page.evaluate(() => {
      window.__dragCost = []
      let started = 0
      window.addEventListener(
        'pointermove',
        () => {
          started = performance.now()
          requestAnimationFrame(() => window.__dragCost.push(performance.now() - started))
        },
        true
      )
    })
    const box = await measureGrip.boundingBox()
    const widths = new Set()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    for (let step = 1; step <= 12; step++) {
      await page.mouse.move(box.x + box.width / 2 - step * 10, box.y + box.height / 2)
      await page.waitForTimeout(16)
      widths.add(await body().evaluate(node => getComputedStyle(node).maxWidth))
    }
    await page.mouse.up()
    const widthAfter = await body().evaluate(node => getComputedStyle(node).maxWidth)
    assert.ok(
      widths.size >= 4 && !widths.has(widthBefore),
      `measure follows the drag (${[...widths].join(' ')})`
    )
    assert.ok(parseFloat(widthAfter) < parseFloat(widthBefore))
    const dragged = await measureGrip.getAttribute('aria-valuenow')
    assert.ok(
      Number(dragged) < 64 && Number(dragged) > 40,
      `drag moved the measure to ${dragged}ch`
    )
    assert.equal(
      await number('Prose measure (ch)').inputValue(),
      dragged,
      'the scrub field shows the dragged value'
    )
    const cost = await page.evaluate(() => window.__dragCost.sort((a, b) => a - b))
    console.log(
      `Measure drag cost: ${cost.length} moves, median ${cost[Math.floor(cost.length / 2)].toFixed(1)} ms, max ${cost.at(-1).toFixed(1)} ms from pointermove to the next frame.`
    )
    assert.ok(cost[Math.floor(cost.length / 2)] < 50, 'a drag event stays within a few frames')
    await undo.click()
    assert.equal(
      await body().evaluate(node => getComputedStyle(node).maxWidth),
      widthBefore,
      'one undo step per drag'
    )
    assert.equal(await number('Prose measure (ch)').inputValue(), '64')
    assert.equal(
      await page.evaluate(() => document.querySelectorAll('.control-change-marker').length),
      pastBefore
    )
    await workshop.getByRole('button', { name: 'Redo', exact: true }).click()
    assert.equal(await number('Prose measure (ch)').inputValue(), dragged)
    await undo.click()

    await pick('Text style', 'prose-title')
    const sizeGrip = preview.getByRole('slider', { name: 'Prose / Title size', exact: true })
    const titleSize = () =>
      proof
        .locator('[data-rad-text="prose-title"]')
        .evaluate(node => parseFloat(getComputedStyle(node).fontSize))
    const sizeBefore = await titleSize()
    const narrowBefore = Number(await sizeGrip.getAttribute('aria-valuenow'))
    const sizeBox = await sizeGrip.boundingBox()
    await page.mouse.move(sizeBox.x + sizeBox.width / 2, sizeBox.y + sizeBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(sizeBox.x + sizeBox.width / 2 + 20, sizeBox.y + sizeBox.height / 2 + 20, {
      steps: 4
    })
    await page.mouse.up()
    assert.ok((await titleSize()) > sizeBefore, 'the size handle grows the title')
    const narrowAfter = Number(await number('Narrow size (px)').inputValue())
    assert.ok(
      Math.abs(narrowAfter - narrowBefore - 20) <= 1,
      `a 20px drag adds 20px to the narrow size (${narrowBefore} to ${narrowAfter})`
    )
    assert.ok(
      Number(await number('Wide size (px)').inputValue()) > narrowAfter,
      'a fluid style keeps a wider wide end'
    )
    await sizeGrip.focus()
    await page.keyboard.press('ArrowRight')
    assert.equal(
      await number('Narrow size (px)').inputValue(),
      String(narrowAfter + 0.5),
      'arrow keys step the handle'
    )
    await page.keyboard.press('Shift+ArrowLeft')
    assert.equal(await number('Narrow size (px)').inputValue(), String(narrowAfter - 4.5))
    assert.match(await sizeGrip.getAttribute('aria-valuetext'), /px$/)
    await editor.getByRole('button', { name: 'Reset selected style', exact: true }).click()
    await preview.getByRole('combobox', { name: 'Preview width', exact: true }).selectOption('fill')
    await pick('Text style', 'prose-body')
    await number('Prose leading').fill('1.85')
    await pick('Body assignment', 'source-serif-4')
    assert.equal(await number('Prose leading').inputValue(), '1.85')
    assert.equal(await number('Prose size (px)').inputValue(), '21')
    assert.equal(await body().evaluate(node => getComputedStyle(node).lineHeight), '38.85px')
    await pick('Text style', 'prose-body')
    await number('Style tracking (em)').fill('0.02')
    await editor.getByRole('button', { name: 'Reset prose rhythm', exact: true }).click()
    assert.equal(await number('Prose leading').inputValue(), '1.65')
    assert.equal(await number('Style tracking (em)').inputValue(), '0.02')
    await pick('Headings assignment', 'plex-sans')
    assert.equal(await picked('Body assignment'), 'source-serif-4')
    await pick('Text style', 'prose-title')
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
    await pick('Text style', 'ui-body')
    await number('Style size (px)').fill('19')
    assert.equal(await number('Style size (px)').inputValue(), '19')
    await pick('Style assignment', 'body')
    assert.equal(await picked('Style assignment'), 'body')
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
    assert.equal(await picked('Text style'), 'prose-title', 'Inspect selects the role row')
    assert.equal(
      await preview.getByRole('slider', { name: 'Prose / Title size', exact: true }).count(),
      1,
      'handles follow the inspected role'
    )
    await body().click()
    assert.equal(await picked('Text style'), 'prose-body')
    await pick('Text style', 'prose-quote')
    assert.equal(
      await proof
        .locator('blockquote')
        .first()
        .evaluate(node => getComputedStyle(node).outlineStyle),
      'solid',
      'the role list drives the Inspect outline'
    )
    await body().click()
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
    await pick('Text style', 'ui-body')
    await editor.getByRole('checkbox', { name: 'Responsive endpoints', exact: true }).check()
    await number('Wide size (px)').fill('30')
    await pick('Starting point', 'plex')
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
    await pick('Text style', 'ui-body')
    assert.equal(
      await number('Style size (px)').inputValue(),
      '16',
      'starting point clears style overrides'
    )
    const manual = editor.locator('.typesetting-manual')
    await manual.locator('summary').click()
    await editor.getByRole('textbox', { name: 'Manual CSS family' }).fill('Georgia, serif')
    await editor.getByRole('button', { name: 'Use manual family', exact: true }).click()
    const bodyRow = editor.locator('.typesetting-assignment').first()
    assert.equal(await bodyRow.locator('.typesetting-badge').textContent(), 'Uncalibrated')
    assert.equal(await picked('Body assignment'), 'manual')
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
    await pick('Body assignment', 'local')
    assert.equal(await bodyRow.locator('.typesetting-badge').textContent(), 'Uncalibrated')
    await pick('Text style', 'prose-body')
    await number('Style weight').fill('990')
    assert.match(await editor.getByRole('alert').innerText(), /990.*100–900/)
    await font.getByRole('button', { name: 'Remove local font', exact: true }).click()
    assert.equal((await fontFaces()).includes('Typesetting brand'), false)
    assert.match(
      await radioGroup(editor, 'Body assignment')
        .locator('.face-card:has(input:checked)')
        .innerText(),
      /Typesetting brand[\s\S]*missing/
    )
    await pick('Starting point', 'inter')
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
      await openPreviewOptions(workshop)
      await workshop
        .getByRole('combobox', { name: 'Preview mode', exact: true })
        .selectOption('dark')
      await closePreviewOptions(workshop)
      await editor.screenshot({ path: `output/docs/typesetting-${width}.png` })
    }
    await workshop.getByRole('button', { name: 'Color', exact: true }).click()
    await workshop.getByRole('textbox', { name: 'Brand color', exact: true }).fill('#166534')
    await workshop.getByRole('button', { name: 'Typography', exact: true }).click()
    assert.equal(await picked('Starting point'), 'inter')
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
    assert.equal(await radioGroup(editor, 'Body assignment').count(), 0)
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
    assert.equal(await picked('Starting point'), 'inter')
    assert.deepEqual(errors, [], 'no hydration/runtime/console errors')
    console.log(
      'Typesetting editor passed: 16 specimen rows, four face-card assignments in their own faces, keyboard pairing, measure/size handles with one undo step, profile/manual rhythm, fixed/fluid overrides, scoped resets, actual local font and weight warnings, Inspect/role sync, keyboard drafts, shared faces, 320px/390px reflow and reload.'
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
