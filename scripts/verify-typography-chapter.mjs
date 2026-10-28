import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

// Recorded font/layout examples, not a synthetic readability or quality score.
export async function verifyTypographyChapter(browser, baseURL) {
  const output = new URL('../output/docs/typography-chapter/', import.meta.url)
  await mkdir(output, { recursive: true })
  const context = await browser.newContext({
    viewport: { width: 1800, height: 1200 },
    reducedMotion: 'reduce'
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const cases = [],
    models = [],
    captures = []
  try {
    await page.goto(`${baseURL}/docs/workshop/`)
    const workshop = page.locator('.theme-workshop')
    await workshop.getByRole('button', { name: 'Typography', exact: true }).click()
    const editor = workshop.locator('.typesetting-editor')
    const proofs = workshop.locator('.typography-proofs')
    const number = name => editor.getByRole('spinbutton', { name, exact: true })
    const definitions = [
      {
        id: 'inter',
        family: 'Inter',
        families: ['Inter', 'IBM Plex Mono'],
        size: 20,
        leading: 1.6,
        measure: 64
      },
      {
        id: 'source-serif',
        family: 'Source Serif 4',
        families: ['Source Serif 4', 'Inter', 'IBM Plex Mono'],
        size: 21,
        leading: 1.65,
        measure: 62
      },
      {
        id: 'plex',
        family: 'IBM Plex Sans',
        families: ['IBM Plex Sans', 'IBM Plex Mono'],
        size: 20,
        leading: 1.6,
        measure: 62
      },
      {
        id: 'custom',
        family: 'Chapter brand',
        families: ['Chapter brand', 'Inter', 'IBM Plex Mono'],
        size: 20,
        leading: 1.65,
        measure: 64
      }
    ]
    for (const model of definitions) {
      await editor
        .getByRole('combobox', { name: 'Starting point', exact: true })
        .selectOption(model.id === 'custom' ? 'inter' : model.id)
      if (model.id === 'custom') {
        const lab = workshop.locator('.workshop-typeface-lab')
        if (!(await lab.evaluate(node => node.open))) await lab.locator(':scope > summary').click()
        const font = lab.locator('.font-editor')
        await font.getByText('Try a local font file', { exact: true }).click()
        await font
          .getByRole('textbox', { name: 'Local CSS family', exact: true })
          .fill(model.family)
        await font.getByLabel('Local font file', { exact: true }).setInputFiles({
          name: 'private-chapter-asset.ttf',
          mimeType: 'font/ttf',
          buffer: await readFile(new URL('./fixtures/InterVariable.ttf', import.meta.url))
        })
        await page.waitForFunction(
          () => document.querySelector('.font-editor').dataset.fontState === 'loaded'
        )
        await editor
          .getByRole('combobox', { name: 'Body assignment', exact: true })
          .selectOption('local')
      }
      await page.waitForFunction(
        families =>
          families.every(family =>
            [...document.fonts].some(
              face => face.family.replaceAll('"', '') === family && face.status === 'loaded'
            )
          ),
        model.families
      )
      assert.equal(await number('Prose size (px)').inputValue(), String(model.size))
      assert.equal(await number('Prose leading').inputValue(), String(model.leading))
      assert.equal(await number('Prose measure (ch)').inputValue(), String(model.measure))
      assert.equal(await number('UI size (px)').inputValue(), '16')
      assert.equal(await number('UI leading').inputValue(), '1.5')
      models.push({
        ...model,
        recommendation: model.id === 'custom' ? 'uncalibrated/manual' : 'supported starting point',
        customFile:
          model.id === 'custom' ? 'normal-only pinned TTF test fixture; no italic claim' : undefined
      })
      for (const mode of ['light', 'dark']) {
        await workshop
          .getByRole('combobox', { name: 'Preview mode', exact: true })
          .selectOption(mode)
        for (const proof of ['article', 'form', 'data', 'landing']) {
          await proofs
            .getByRole('combobox', { name: 'Proof composition', exact: true })
            .selectOption(proof)
          for (const width of [800, 640, 390, 320]) {
            await proofs
              .getByRole('combobox', { name: 'Proof layout', exact: true })
              .selectOption(String(width))
            const frame = proofs.locator('.proof-frame').first()
            const root = frame.locator('.proof-page')
            const observed = await root.evaluate(node => ({
              width: parseFloat(getComputedStyle(node).width),
              client: node.clientWidth,
              scroll: node.scrollWidth,
              family: getComputedStyle(node).fontFamily,
              uiSize: getComputedStyle(node).fontSize,
              bodySize: node.querySelector('[data-rad-prose] > p:not([data-rad-text])')
                ? getComputedStyle(node.querySelector('[data-rad-prose] > p:not([data-rad-text])'))
                    .fontSize
                : null
            }))
            assert.equal(observed.width, width)
            assert.ok(
              observed.scroll <= observed.client + 1,
              `${model.id}/${mode}/${proof}/${width} reflow`
            )
            assert.equal(observed.uiSize, '16px')
            if (proof === 'article') assert.equal(observed.bodySize, `${model.size}px`)
            cases.push({ font: model.id, mode, proof, width, ...observed, result: 'pass' })
            if (
              (mode === 'light' && proof === 'article' && width === 800) ||
              (mode === 'light' && proof === 'form' && width === 390) ||
              (mode === 'dark' && proof === 'data' && width === 390) ||
              (mode === 'dark' && proof === 'landing' && width === 800)
            ) {
              const name = `${model.id}-${mode}-${proof}-${width}.png`
              await frame.screenshot({ path: new URL(name, output).pathname })
              captures.push({ model: model.id, mode, proof, width, name })
            }
          }
        }
      }
    }
    // A shared/imported custom requirement must never carry the private file.
    const handoff = workshop.locator('.theme-handoff')
    const configDetails = handoff
      .locator('details')
      .filter({ hasText: 'Reusable configuration JSON' })
      .first()
    if (!(await configDetails.evaluate(node => node.open)))
      await configDetails.locator(':scope > summary').click()
    const configuration = await handoff
      .getByRole('textbox', { name: 'Configuration output', exact: true })
      .inputValue()
    assert.doesNotMatch(configuration, /private-chapter-asset|blob:|data:|arrayBuffer|bytes/)
    assert.match(configuration, /Chapter brand/)
    const setup = handoff.locator('.handoff-setup')
    if (!(await setup.evaluate(node => node.open))) await setup.locator(':scope > summary').click()
    assert.match(await setup.innerText(), /Chapter brand[\s\S]*File not included/)
    await workshop
      .locator('.font-editor')
      .getByRole('button', { name: 'Remove local font', exact: true })
      .click()
    assert.equal(
      await page.evaluate(
        () =>
          [...document.fonts].filter(face => face.family.replaceAll('"', '') === 'Chapter brand')
            .length
      ),
      0
    )
    assert.equal(
      await handoff
        .getByRole('textbox', { name: 'Configuration output', exact: true })
        .inputValue(),
      configuration
    )
    assert.deepEqual(errors, [])
    await writeFile(
      new URL('results.json', output),
      JSON.stringify(
        {
          result: 'pass',
          models,
          cases,
          captures,
          limits: [
            'Recorded Chromium examples, not universal typography quality scores.',
            'No manual browser/AT certification.',
            'Custom normal-only fixture; font/script/italic availability remains application-owned.'
          ]
        },
        null,
        2
      ) + '\n'
    )
    const cards = await Promise.all(
      captures.map(
        async capture =>
          `<figure><figcaption>${capture.model} · ${capture.proof} · ${capture.mode} · ${capture.width}px CSS</figcaption><img src="data:image/png;base64,${(await readFile(new URL(capture.name, output))).toString('base64')}" /></figure>`
      )
    )
    const contact = await context.newPage()
    await contact.setContent(
      `<style>body{margin:0;padding:16px;background:#e5e7eb;font:12px system-ui;display:grid;grid-template-columns:repeat(4,1fr);gap:16px}figure{margin:0;background:white;padding:8px}figcaption{padding:4px;font-weight:600}img{width:100%;height:400px;object-fit:contain;object-position:top}</style>${cards.join('')}`
    )
    await contact.setViewportSize({ width: 1600, height: 1800 })
    await contact.screenshot({ path: new URL('contact.png', output).pathname, fullPage: true })
    await contact.close()
    console.log(
      `Typography chapter passed: ${cases.length} recorded curated/custom × composition × width × mode cases; supported/manual metrics, real faces, missing-file fallback and portable requirements.`
    )
  } finally {
    await context.close()
  }
}
