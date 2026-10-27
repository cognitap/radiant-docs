import assert from 'node:assert/strict'
import { readFile, mkdir } from 'node:fs/promises'

export async function verifyFontEditor(browser, baseURL) {
  await mkdir(new URL('../output/docs/', import.meta.url), { recursive: true })
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const requests = []
  page.on('request', request => requests.push({ url: request.url(), method: request.method() }))
  const faces = () =>
    page.evaluate(() =>
      [...document.fonts].map(face => ({
        family: face.family.replaceAll('"', ''),
        style: face.style,
        weight: face.weight,
        status: face.status
      }))
    )
  try {
    await page.goto(baseURL + '/docs/workshop/')
    const frame = page.getByRole('region', { name: 'Shared theme workshop', exact: true })
    const panel = frame.locator('.font-editor')
    assert.equal(
      requests.filter(request => request.url.includes('/fonts/workshop/')).length,
      0,
      'font assets are lazy until Typography is opened'
    )
    await frame.getByRole('button', { name: 'Typography', exact: true }).click()
    await page.waitForFunction(
      () => document.querySelector('.font-editor').dataset.fontState === 'loaded'
    )
    const select = panel.getByRole('combobox', { name: 'Trial typeface', exact: true })
    const sample = panel.getByTestId('font-sample')
    const loaded = async family => {
      await page.waitForFunction(
        family =>
          document.querySelector('.font-editor').dataset.fontState === 'loaded' &&
          document.querySelector('.font-status').textContent.startsWith(family + ' loaded'),
        family
      )
      const actual = (await faces()).filter(face => face.family === family)
      assert.equal(actual.length, 2, family + ' has real normal and italic files')
      assert.ok(actual.every(face => face.status === 'loaded'))
      console.log(`Font trial loaded: ${family}, normal and italic.`)
    }
    await loaded('Inter')
    const sizeField = panel.getByRole('spinbutton', { name: 'Sample size', exact: true })
    await sizeField.focus()
    await page.keyboard.press('ControlOrMeta+A')
    await page.keyboard.type('21')
    assert.equal(
      await sizeField.inputValue(),
      '21',
      'typing accepts a valid number through an invalid intermediate draft'
    )
    assert.equal(await sample.evaluate(node => getComputedStyle(node).fontSize), '21px')
    await sizeField.fill('99')
    assert.equal(await sizeField.getAttribute('aria-invalid'), 'true')
    assert.equal(
      await sample.evaluate(node => getComputedStyle(node).fontSize),
      '21px',
      'invalid drafts preserve the last valid sample'
    )
    await page.keyboard.press('Tab')
    assert.equal(await sizeField.inputValue(), '21', 'blur restores the last valid value')
    await panel.getByRole('button', { name: 'Reset context sample', exact: true }).click()
    await panel.getByRole('spinbutton', { name: 'Sample line height', exact: true }).fill('1.85')
    await panel.getByRole('spinbutton', { name: 'Trial weight', exact: true }).fill('850')
    await select.selectOption('plex-sans')
    await loaded('IBM Plex Sans')
    assert.equal(
      await panel.getByRole('spinbutton', { name: 'Trial weight', exact: true }).inputValue(),
      '850'
    )
    assert.match(await panel.getByRole('alert').innerText(), /outside 100–700/)
    assert.equal(
      await panel.getByRole('button', { name: 'Use family in theme', exact: true }).isDisabled(),
      true
    )
    assert.equal(
      await panel.getByRole('spinbutton', { name: 'Sample line height', exact: true }).inputValue(),
      '1.85'
    )
    await panel.getByRole('spinbutton', { name: 'Trial weight', exact: true }).fill('600')
    await panel.getByRole('spinbutton', { name: 'wdth · 85–100', exact: true }).focus()
    await page.keyboard.press('ControlOrMeta+A')
    await page.keyboard.type('90')
    assert.equal(await sample.evaluate(node => getComputedStyle(node).fontStretch), '90%')
    await panel.getByRole('combobox', { name: 'Trial style', exact: true }).selectOption('italic')
    assert.equal(await sample.evaluate(node => getComputedStyle(node).fontStyle), 'italic')
    await select.selectOption('source-serif-4')
    await loaded('Source Serif 4')
    await panel.getByRole('button', { name: 'Reset context sample', exact: true }).click()
    assert.equal(
      await panel.getByRole('spinbutton', { name: 'Sample size', exact: true }).inputValue(),
      '21'
    )
    await panel
      .getByRole('combobox', { name: 'Optical sizing', exact: true })
      .selectOption('manual')
    await panel.getByRole('spinbutton', { name: 'opsz · 8–60', exact: true }).fill('32')
    assert.match(
      await sample.evaluate(node => getComputedStyle(node).fontVariationSettings),
      /"opsz" 32/
    )
    await panel.getByRole('combobox', { name: 'Optical sizing', exact: true }).selectOption('auto')
    assert.equal(await sample.evaluate(node => getComputedStyle(node).fontOpticalSizing), 'auto')
    await select.selectOption('plex-mono')
    await loaded('IBM Plex Mono')
    await panel.getByRole('combobox', { name: 'Trial context', exact: true }).selectOption('code')
    assert.equal(
      await panel.getByRole('spinbutton', { name: 'Sample size', exact: true }).inputValue(),
      '14'
    )
    await select.selectOption('inter')
    await loaded('Inter')
    assert.equal(
      (await faces()).filter(face =>
        ['Inter', 'Source Serif 4', 'IBM Plex Sans', 'IBM Plex Mono'].includes(face.family)
      ).length,
      8,
      'curated cache is bounded and does not duplicate faces'
    )
    await panel.getByRole('combobox', { name: 'Trial style', exact: true }).selectOption('normal')
    await panel.getByRole('button', { name: 'Use family in theme', exact: true }).click()
    assert.match(
      await frame.locator('.workshop-canvas').evaluate(node => getComputedStyle(node).fontFamily),
      /Inter/
    )

    await panel.getByText('Try a local font file', { exact: true }).press('Enter')
    const upload = panel.getByLabel('Local font file', { exact: true })
    await upload.setInputFiles({
      name: 'invalid.ttf',
      mimeType: 'font/ttf',
      buffer: Buffer.from('not a font')
    })
    await panel.locator('.font-notice').filter({ hasText: 'Choose a font file' }).waitFor()
    assert.equal(await select.inputValue(), 'inter', 'bad input retains the prior trial/theme')
    const localBytes = await readFile(
      new URL('../scripts/fixtures/InterVariable.ttf', import.meta.url)
    )
    const before = requests.length
    await upload.setInputFiles({
      name: 'my-private-font.ttf',
      mimeType: 'font/ttf',
      buffer: localBytes
    })
    await page.waitForFunction(
      () =>
        document.querySelector('.font-editor').dataset.fontState === 'loaded' &&
        document.querySelector('.font-status').textContent.startsWith('Brand font loaded')
    )
    assert.match(await panel.innerText(), /Uncalibrated/)
    assert.equal(
      await panel.getByRole('spinbutton', { name: 'opsz · 14–32', exact: true }).count(),
      0,
      'optical axis defaults to automatic'
    )
    assert.ok(
      (await faces()).some(face => face.family === 'Brand font' && face.weight === '100 900')
    )
    assert.equal(
      requests.slice(before).filter(r => r.method !== 'GET' || r.url.includes('/fonts/')).length,
      0,
      'local bytes produce no upload or font request'
    )
    await panel.getByRole('button', { name: 'Use family in theme', exact: true }).click()
    await frame.getByText('Required setup and fonts', { exact: true }).click()
    assert.match(
      await frame.locator('.handoff-setup').innerText(),
      /Brand font.*File not included/s
    )
    await frame.getByText('Reusable configuration JSON', { exact: true }).click()
    const exported = JSON.parse(
      await frame.getByRole('textbox', { name: 'Configuration output', exact: true }).inputValue()
    )
    assert.equal(
      exported.document.sections.typography.fonts.find(f => f.id === 'workshop-font').source,
      'local'
    )
    assert.doesNotMatch(JSON.stringify(exported), /my-private-font|blob:|data:|arrayBuffer|bytes/)
    await panel.getByRole('button', { name: 'Remove local font', exact: true }).click()
    await loaded('Inter')
    assert.equal(
      (await faces()).filter(face => face.family === 'Brand font').length,
      0,
      'local face removed'
    )
    assert.match(
      await frame.locator('.workshop-canvas').evaluate(node => getComputedStyle(node).fontFamily),
      /Brand font/,
      'missing local font keeps its requirement and falls back'
    )

    // A compressed local file uses only the explicitly declared weight/style.
    await upload.setInputFiles({
      name: 'private.woff2',
      mimeType: 'font/woff2',
      buffer: await readFile(new URL('../public/fonts/workshop/Inter.woff2', import.meta.url))
    })
    await page.waitForFunction(
      () =>
        document.querySelector('.font-editor').dataset.fontState === 'loaded' &&
        document.querySelector('.font-status').textContent.startsWith('Brand font loaded')
    )
    assert.equal(
      await panel.getByRole('combobox', { name: 'Optical sizing', exact: true }).count(),
      0
    )
    assert.match(await panel.innerText(), /no axes are inferred/)
    await panel
      .getByRole('combobox', { name: 'Declared file style', exact: true })
      .selectOption('italic')
    await upload.setInputFiles({
      name: 'private-italic.woff2',
      mimeType: 'font/woff2',
      buffer: await readFile(
        new URL('../public/fonts/workshop/Inter-Italic.woff2', import.meta.url)
      )
    })
    await page.waitForFunction(
      () =>
        document.querySelector('.font-editor').dataset.fontState === 'loaded' &&
        document.querySelector('.font-status').textContent.includes('normal') === false
    )
    assert.equal(
      await panel.getByRole('combobox', { name: 'Trial style', exact: true }).inputValue(),
      'italic'
    )
    assert.equal(
      await panel.getByRole('button', { name: 'Use family in theme', exact: true }).isDisabled(),
      true,
      'italic-only trial cannot stand in for a normal theme face'
    )
    await panel
      .getByRole('combobox', { name: 'Declared file style', exact: true })
      .selectOption('normal')
    const corrupt = Buffer.alloc(80)
    corrupt.write('wOF2')
    corrupt.writeUInt32BE(80, 8)
    await upload.setInputFiles({ name: 'broken.woff2', mimeType: 'font/woff2', buffer: corrupt })
    await page.waitForFunction(
      () => document.querySelector('.font-editor').dataset.fontState === 'failed'
    )
    assert.equal(
      await panel.getByRole('button', { name: 'Use family in theme', exact: true }).isDisabled(),
      true
    )
    await upload.setInputFiles({
      name: 'private.woff2',
      mimeType: 'font/woff2',
      buffer: await readFile(new URL('../public/fonts/workshop/Inter.woff2', import.meta.url))
    })
    await page.waitForFunction(
      () =>
        document.querySelector('.font-editor').dataset.fontState === 'loaded' &&
        document.querySelector('.font-status').textContent.startsWith('Brand font loaded')
    )
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 })
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${width}px font panel does not overflow`
      )
      await panel.getByRole('spinbutton', { name: 'Sample size', exact: true }).focus()
      await page.keyboard.press('ArrowUp')
      await panel.screenshot({ path: `output/docs/fonts-${width}.png` })
    }
    await page.setViewportSize({ width: 1280, height: 1000 })
    await panel.screenshot({ path: 'output/docs/fonts-desktop.png' })
    await frame.getByRole('button', { name: 'Reset typography', exact: true }).click()
    await page.waitForFunction(
      () => ![...document.fonts].some(face => face.family.includes('Brand font'))
    )
    await frame.getByRole('button', { name: 'Reset preview', exact: true }).click()
    await page.waitForFunction(
      () =>
        ![...document.fonts].some(face =>
          ['Inter', 'Source Serif 4', 'IBM Plex Sans', 'IBM Plex Mono', 'Brand font'].includes(
            face.family.replaceAll('"', '')
          )
        )
    )

    // Reset while a face is in flight: the disposed session cannot register it later.
    let unblock, started
    const held = new Promise(resolve => (unblock = resolve))
    const hit = new Promise(resolve => (started = resolve))
    const pending = []
    await page.route('**/fonts/workshop/Inter*.woff2', async route => {
      const done = held.then(() => route.continue()).catch(() => {})
      pending.push(done)
      started()
      await done
    })
    await frame.getByRole('button', { name: 'Typography', exact: true }).click()
    await hit
    await frame.getByRole('button', { name: 'Reset preview', exact: true }).click()
    unblock()
    await Promise.all(pending)
    await page.unroute('**/fonts/workshop/Inter*.woff2')
    assert.equal(
      (await faces()).filter(face => face.family === 'Inter').length,
      0,
      'late face cannot reappear after cleanup'
    )

    // Slow/failed requests expose fallback and can be retried.
    let release
    const paused = new Promise(resolve => (release = resolve))
    await page.route('**/fonts/workshop/Inter*.woff2', async route => {
      await paused
      await route.fulfill({ status: 404, body: 'missing' })
    })
    await frame.getByRole('button', { name: 'Typography', exact: true }).click()
    await page.waitForFunction(
      () => document.querySelector('.font-editor').dataset.fontState === 'loading'
    )
    assert.equal(
      await panel.getByRole('button', { name: 'Use family in theme', exact: true }).isDisabled(),
      true
    )
    release()
    await page.waitForFunction(
      () => document.querySelector('.font-editor').dataset.fontState === 'failed'
    )
    assert.match(await panel.locator('.font-status').innerText(), /fallback|could not load/)
    await page.unroute('**/fonts/workshop/Inter*.woff2')
    await panel.getByRole('button', { name: 'Retry font', exact: true }).click()
    await loaded('Inter')
    await page.reload()
    await frame.getByRole('button', { name: 'Typography', exact: true }).click()
    await loaded('Inter')
    assert.equal(
      await panel
        .getByRole('combobox', { name: 'Trial typeface', exact: true })
        .locator('option[value=local]')
        .count(),
      0,
      'reload discards local files'
    )
    assert.deepEqual(errors, [], 'no hydration/runtime errors')
    console.log(
      'Font editor passed: eight pinned faces, contextual/manual tuning, weights/italic/axes, real TTF and WOFF2 local trials, portable requirements, failure/retry, cleanup, keyboard and 320px/390px layouts.'
    )
  } catch (error) {
    console.error(
      'Overflowing elements:',
      await page.evaluate(() =>
        [...document.querySelectorAll('body *')]
          .filter(e => e.getBoundingClientRect().right > innerWidth + 1)
          .slice(0, 12)
          .map(e => ({
            tag: e.tagName,
            class: e.className,
            right: e.getBoundingClientRect().right,
            text: e.textContent.slice(0, 70)
          }))
      )
    )
    console.error(
      'Font trial failure:',
      await page
        .locator('.font-status')
        .textContent()
        .catch(() => '')
    )
    await page.screenshot({ path: 'output/docs/fonts-failure.png', fullPage: true }).catch(() => {})
    throw error
  } finally {
    await context.close()
  }
}
