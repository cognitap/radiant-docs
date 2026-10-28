import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

const position = handle =>
  handle.evaluate(node => parseFloat(getComputedStyle(node).translate) || 0)
async function waitPosition(page, handle, expected) {
  await page.waitForFunction(
    ({ node, expected }) =>
      Math.abs((parseFloat(getComputedStyle(node).translate) || 0) - expected) < 0.1,
    { node: await handle.elementHandle(), expected }
  )
}
export async function verifyMotionEditor(browser, baseURL) {
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1100 },
    reducedMotion: 'no-preference',
    hasTouch: true
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
    await page.waitForFunction(() => !document.querySelector('.preview-toolbar button')?.disabled)
    await workshop.getByRole('button', { name: 'Motion', exact: true }).click()
    const editor = workshop.locator('.motion-editor'),
      preview = page.getByRole('region', { name: 'Theme preview', exact: true })
    const scene = preview.getByRole('combobox', { name: 'Scene', exact: true })
    const compare = preview.getByRole('combobox', { name: 'Compare', exact: true })
    const frameOf = name => preview.getByRole('figure', { name, exact: true })
    const replay = () => preview.getByRole('button', { name: /^Replay( both)?$/ }).click()
    const resetScene = () =>
      preview.getByRole('button', { name: 'Reset scene', exact: true }).click()
    const number = name => editor.getByRole('spinbutton', { name, exact: true })
    const scope = editor.getByRole('combobox', { name: 'Profile scope', exact: true })
    const preset = editor.getByRole('combobox', { name: 'Starting point', exact: true })
    const primary = () => preview.locator('.preview-frame').first()
    const press = () => primary().getByRole('button', { name: 'Press me', exact: true })
    await number('Stiffness').fill('450')
    await scope.selectOption('press')
    await number('Mass').fill('2')
    await scope.selectOption('follow')
    await number('Damping').fill('17')
    await scope.selectOption('press')
    assert.equal(await number('Stiffness').inputValue(), '450')
    await editor.getByRole('button', { name: 'Use common physics', exact: true }).click()
    assert.equal(await number('Mass').inputValue(), '1')
    await scope.selectOption('follow')
    assert.equal(await number('Damping').inputValue(), '17')
    await scope.selectOption('shared')
    const summary = await editor.locator('.motion-physics-summary').innerText()
    await number('Mass').fill('0')
    assert.equal(await editor.getByRole('alert').isVisible(), true)
    assert.equal(await editor.locator('.motion-physics-summary').innerText(), summary)
    await number('Mass').fill('1')
    await preset.selectOption('restrained')
    const original = await press().elementHandle()
    await preset.selectOption('expressive')
    assert.equal(
      await press().evaluate((node, previous) => node === previous, original),
      true,
      'physics editing keeps the native host'
    )
    await preset.selectOption('restrained')
    await press().focus()
    await page.keyboard.down('Space')
    await page.waitForFunction(
      node => parseFloat(getComputedStyle(node).scale) < 0.999,
      await press().elementHandle()
    )
    await page.keyboard.up('Space')
    assert.equal(await primary().locator('.motion-action-count').innerText(), 'Activated 1 time')
    await replay()
    await page.waitForFunction(
      node => parseFloat(getComputedStyle(node).scale) < 0.999,
      await press().elementHandle()
    )
    assert.equal(
      await primary().locator('.motion-action-count').innerText(),
      'Activated 1 time',
      'replay does not activate the native action'
    )
    await primary().getByRole('combobox', { name: 'Inspect action' }).selectOption('disclosure')
    await replay()
    const disclosure = primary().locator('details[data-slot~="collapsible"]')
    await page.waitForFunction(node => node.open, await disclosure.elementHandle())
    await replay()
    await page.waitForFunction(node => !node.open, await disclosure.elementHandle())
    await primary().getByRole('button', { name: 'Try a modal' }).click()
    const dialog = primary().getByRole('dialog')
    await dialog.waitFor()
    await page.keyboard.press('Escape')
    assert.equal(await dialog.count(), 0, 'modal semantics close immediately')
    await compare.selectOption('character')
    assert.equal(await preview.locator('.preview-frame').count(), 2)
    const restrained = frameOf('Restrained')
    const expressive = frameOf('Expressive')
    const oldCount = await expressive.locator('.motion-action-count').innerText()
    await restrained.getByRole('button', { name: 'Press me', exact: true }).click()
    assert.equal(
      await expressive.locator('.motion-action-count').innerText(),
      oldCount,
      'comparison state is independent'
    )
    await compare.selectOption('off')
    await scene.selectOption('motion:drag')
    const handle = primary().getByRole('button', { name: 'Drag', exact: true })
    const offFrame = frameOf('Motion off')
    const offHandle = offFrame.getByRole('button', { name: 'Drag', exact: true })
    await page.waitForFunction(() =>
      [...document.querySelectorAll('.preview-frame')].every(frame => {
        const track = frame.querySelector('.motion-drag-track')
        const handle = frame.querySelector('.motion-drag-handle')
        const slider = frame.querySelector('input[type="range"]')
        return Number(slider.max) === Math.max(1, track.clientWidth - handle.offsetWidth)
      })
    )
    const end = Number(
      await offFrame
        .getByRole('slider', { name: 'Manual destination', exact: true })
        .getAttribute('max')
    )
    await offFrame.getByRole('button', { name: 'End', exact: true }).click()
    assert.ok(
      Math.abs((await position(offHandle)) - end) < 0.1,
      `off preserves useful functional destinations: expected ${end}, actual ${await position(offHandle)}, current max ${await offFrame.getByRole('slider', { name: 'Manual destination', exact: true }).getAttribute('max')}`
    )
    const max = Number(
      await primary()
        .getByRole('slider', { name: 'Manual destination', exact: true })
        .getAttribute('max')
    )
    await primary().getByRole('button', { name: 'End', exact: true }).click()
    await page.waitForFunction(
      ({ node, max }) => {
        const value = parseFloat(getComputedStyle(node).translate) || 0
        return value > 1 && value < max - 1
      },
      { node: await handle.elementHandle(), max }
    )
    await primary().getByRole('button', { name: 'Start', exact: true }).click()
    await waitPosition(page, handle, 0)
    await handle.focus()
    await page.keyboard.press('End')
    await waitPosition(page, handle, max)
    await page.waitForFunction(
      expected =>
        Number(document.querySelector('.preview-frame input[type="range"]').value) === expected,
      max
    )
    await scene.selectOption('motion:follow')
    await scene.selectOption('motion:drag')
    await waitPosition(page, handle, max)
    await resetScene()
    await waitPosition(page, handle, 0)
    const box = await handle.boundingBox()
    const cdp = await context.newCDPSession(page)
    const x = box.x + box.width / 2,
      y = box.y + box.height / 2
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    for (let i = 1; i <= 4; i++) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: x + i * 15, y }]
      })
      await page.waitForTimeout(20)
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await page.waitForFunction(
      node => (parseFloat(getComputedStyle(node).translate) || 0) > 1,
      await handle.elementHandle()
    )
    await cdp.detach()
    await compare.selectOption('none')
    await scene.selectOption('motion:follow')
    await primary().getByRole('button', { name: 'Start moving target', exact: true }).click()
    await page.waitForFunction(() => {
      const root = document.querySelector('.preview-frame')
      const a = root.querySelector('.motion-target-marker'),
        b = root.querySelector('.motion-follow-marker')
      return (
        Math.abs(
          (parseFloat(getComputedStyle(a).translate) || 0) -
            (parseFloat(getComputedStyle(b).translate) || 0)
        ) > 2
      )
    })
    await primary().getByRole('button', { name: 'Pause moving target', exact: true }).click()
    await primary().getByRole('slider', { name: 'Manual destination', exact: true }).press('Home')
    await primary()
      .getByRole('slider', { name: 'Manual destination', exact: true })
      .press('ArrowRight')
    const manualTarget = await primary()
      .getByRole('slider', { name: 'Manual destination', exact: true })
      .inputValue()
    await workshop.getByRole('button', { name: 'Reset motion', exact: true }).click()
    assert.equal(
      await primary().getByRole('slider', { name: 'Manual destination', exact: true }).inputValue(),
      manualTarget,
      'theme reset retains example state'
    )
    await resetScene()
    assert.equal(
      await primary().getByRole('slider', { name: 'Manual destination', exact: true }).inputValue(),
      '80'
    )
    await scene.selectOption('motion:layout')
    const card = primary().locator('[data-rad-layout-part]').first()
    const initialWidth = await card.evaluate(node => node.getBoundingClientRect().width)
    await primary().getByRole('button', { name: 'Resize cards', exact: true }).click()
    await page.waitForFunction(
      ({ node, width }) => Math.abs(node.getBoundingClientRect().width - width) > 1,
      { node: await card.elementHandle(), width: initialWidth }
    )
    await primary().getByRole('button', { name: 'Reorder cards', exact: true }).click()
    await primary().getByRole('button', { name: 'Change content', exact: true }).click()
    assert.equal(await card.evaluate(node => getComputedStyle(node).scale), 'none')
    await primary().getByRole('button', { name: 'Pause inspection', exact: true }).click()
    const readout = await primary().locator('.motion-readouts').innerText()
    await primary().getByRole('button', { name: 'Resize cards', exact: true }).click()
    await page.waitForTimeout(100)
    assert.equal(await primary().locator('.motion-readouts').innerText(), readout)
    await primary().getByRole('button', { name: 'Resume inspection', exact: true }).click()
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await primary().getByText('Spatial motion off', { exact: false }).waitFor()
    await scene.selectOption('motion:actions')
    await press().focus()
    await page.keyboard.down('Space')
    assert.equal(await press().evaluate(node => getComputedStyle(node).scale), '1')
    await page.keyboard.up('Space')
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await primary().getByText('Spring motion active', { exact: false }).waitFor()
    await compare.selectOption('reduced')
    assert.equal(
      await frameOf('Reduced motion preview')
        .getByText('Spatial motion off', { exact: false })
        .isVisible(),
      true
    )
    await compare.selectOption('none')
    await editor.getByRole('combobox', { name: 'Theme motion', exact: true }).selectOption('off')
    await primary().getByText('Spatial motion off', { exact: false }).waitFor()
    await editor.getByRole('combobox', { name: 'Theme motion', exact: true }).selectOption('system')
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 900 })
      for (const name of ['motion:actions', 'motion:drag', 'motion:follow', 'motion:layout']) {
        await scene.selectOption(name)
        await replay()
        assert.ok(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          `${name}: no ${width}px page overflow`
        )
      }
    }
    await page.setViewportSize({ width: 1600, height: 1100 })
    await compare.selectOption('character')
    await mkdir(new URL('../output/docs/', import.meta.url), { recursive: true })
    await preview.screenshot({ path: 'output/docs/motion-editor-light.png' })
    await page.getByRole('combobox', { name: 'Appearance', exact: true }).selectOption('dark')
    await preview.getByRole('combobox', { name: 'Preview mode', exact: true }).selectOption('dark')
    await preview.screenshot({ path: 'output/docs/motion-editor-dark.png' })
    await page.setViewportSize({ width: 320, height: 900 })
    await preview.screenshot({ path: 'output/docs/motion-editor-phone.png' })
    assert.deepEqual(errors, [], 'no hydration, runtime or asset errors')
    await writeFile(
      'output/docs/motion-editor-results.json',
      JSON.stringify(
        {
          passed: true,
          checks: [
            'profile ownership',
            'invalid drafts',
            'native press and replay',
            'disclosure reversal',
            'modal focus',
            'independent comparisons',
            'live drag and keyboard/touch',
            'moving target',
            'reset ownership',
            'layout reflow',
            'inspection pause',
            'live reduced motion',
            'off and simulated reduced',
            '320/390px reflow'
          ],
          browser: browser.version()
        },
        null,
        2
      )
    )
    console.log(
      'Motion editor passed: production interactions, profiles/comparisons, inspection/replay, reset ownership, native input, live reduced motion and narrow layouts.'
    )
  } catch (error) {
    await mkdir(new URL('../output/docs/', import.meta.url), { recursive: true })
    await page.screenshot({ path: 'output/docs/motion-editor-failure.png' })
    console.error('Motion page errors:', errors)
    throw error
  } finally {
    await context.close()
  }
}
