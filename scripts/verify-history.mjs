import assert from 'node:assert/strict'
import { pickRadio } from './typography-controls.mjs'

/** Undo/redo, changed markers with per-control reset, and editor counts over one theme history. */
export async function verifyHistory(browser, baseURL) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce'
  })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  try {
    await page.goto(`${baseURL}/workshop/`)
    const frame = page.getByRole('region', { name: 'Shared theme workshop', exact: true })
    await page.waitForFunction(() => !document.querySelector('.preview-toolbar button').disabled)
    const button = name => frame.getByRole('button', { name, exact: true })
    const undo = button('Undo')
    const redo = button('Redo')
    const feedback = frame.locator('.workshop-feedback')
    const described = async locator => {
      const id = await locator.getAttribute('aria-describedby')
      if (!id) return ''
      const texts = await Promise.all(
        id.split(' ').map(part => page.locator(`[id="${part}"]`).innerText())
      )
      return texts.join(' ')
    }
    const changedFrom = async (locator, value) => {
      const description = await described(locator)
      assert.ok(
        description.endsWith(`Changed from ${value}`),
        `description "${description}" names the baseline ${value}`
      )
    }
    const changedCount = async editor => {
      const nav = button(editor)
      const badge = nav.locator('.workshop-nav-count')
      const visible = (await badge.count()) ? Number(await badge.innerText()) : 0
      const description = await described(nav)
      assert.equal(description, visible ? `${visible} changed` : '', `${editor} description`)
      return visible
    }
    assert.equal(await undo.isDisabled(), true, 'nothing to undo at the start')
    assert.equal(await redo.isDisabled(), true)
    for (const editor of ['Color', 'Typography', 'Spacing & surfaces', 'Motion'])
      assert.equal(await changedCount(editor), 0)
    assert.equal(await frame.locator('.control-change-marker').count(), 0)

    const brand = frame.getByRole('textbox', { name: 'Brand color', exact: true })
    await brand.fill('#166534')
    const brandReset = button('Reset Brand color')
    assert.equal(await brandReset.isVisible(), true)
    await changedFrom(brand, '#7C3AED')
    assert.equal(await changedCount('Color'), 1)
    assert.equal(await undo.isDisabled(), false)

    await button('Typography').click()
    const leading = frame.getByRole('spinbutton', { name: 'Prose leading', exact: true })
    await leading.fill('1.85')
    await changedFrom(leading, 'the generated value')
    assert.equal(await button('Reset Prose leading').isVisible(), true)
    assert.equal(await changedCount('Typography'), 1)

    await button('Spacing & surfaces').click()
    const radius = frame.getByRole('spinbutton', { name: 'Control roundness', exact: true })
    const slider = frame
      .locator('.geometry-editor')
      .getByRole('slider', { name: 'Control roundness', exact: true })
    assert.equal(await radius.inputValue(), '8')
    await slider.scrollIntoViewIfNeeded()
    const box = await slider.boundingBox()
    const x = box.x + box.width / 2
    const y = box.y + box.height / 2
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x - 12, y + 12, { steps: 8 })
    await page.mouse.up()
    const dragged = await radius.inputValue()
    assert.notEqual(dragged, '8', 'the drag moved the corner')
    await changedFrom(radius, '8')
    await changedFrom(slider, '8')
    assert.equal(await button('Reset Control roundness').isVisible(), true)
    assert.equal(await changedCount('Spacing & surfaces'), 2, 'radius plus the preset it left')
    await undo.click()
    assert.equal(await radius.inputValue(), '8', 'a corner drag is one undo step')
    assert.equal(await feedback.innerText(), 'Undid control roundness.')
    assert.equal(await changedCount('Spacing & surfaces'), 0)
    assert.equal(await redo.isDisabled(), false)
    await redo.click()
    assert.equal(await radius.inputValue(), dragged)
    assert.equal(await feedback.innerText(), 'Redid control roundness.')

    await button('Motion').click()
    const stiffness = frame
      .locator('.motion-editor')
      .getByRole('spinbutton', { name: 'Stiffness', exact: true })
    await stiffness.fill('450')
    await changedFrom(stiffness, '320')
    assert.equal(await button('Reset Stiffness').isVisible(), true)
    assert.equal(await changedCount('Motion'), 2, 'stiffness plus the starting point it left')

    await button('Motion').focus()
    await page.keyboard.press('ControlOrMeta+z')
    assert.equal(await stiffness.inputValue(), '320', 'keyboard undo outside text fields')
    await page.keyboard.press('Shift+ControlOrMeta+z')
    assert.equal(await stiffness.inputValue(), '450', 'keyboard redo')
    await page.keyboard.press('ControlOrMeta+z')
    assert.equal(await stiffness.inputValue(), '320')
    await page.keyboard.press('Control+y')
    assert.equal(await stiffness.inputValue(), '450', 'Ctrl+Y redo')

    const motion = frame.locator('.motion-editor')
    await pickRadio(motion, 'Physics for', 'press')
    const pressStiffness = motion.getByRole('spinbutton', { name: 'Stiffness', exact: true })
    assert.equal(await pressStiffness.inputValue(), '450', 'press inherits common physics')
    assert.ok(
      !(await described(pressStiffness)).includes('Changed from'),
      'an inherited value is not a change'
    )
    await pickRadio(motion, 'Physics for', 'shared')

    const peak = motion.getByRole('slider', { name: 'Overshoot', exact: true })
    await peak.scrollIntoViewIfNeeded()
    const peakBox = await peak.boundingBox()
    await page.mouse.move(peakBox.x + peakBox.width / 2, peakBox.y + peakBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(peakBox.x + peakBox.width / 2, peakBox.y - 16, { steps: 8 })
    await page.mouse.up()
    const peaked = await stiffness.inputValue()
    assert.notEqual(peaked, '450', 'the drag moved the peak')
    await undo.click()
    assert.equal(await stiffness.inputValue(), '450', 'a curve drag is one undo step')
    assert.equal(await feedback.innerText(), 'Undid common physics stiffness.')
    await redo.click()
    assert.equal(await stiffness.inputValue(), peaked)
    await undo.click()

    await button('Color').click()
    const exact = frame.getByRole('textbox', { name: 'Exact role color', exact: true })
    await exact.focus()
    await page.keyboard.press('ControlOrMeta+z')
    assert.equal(
      await frame.locator('.motion-editor input[type=number]').first().inputValue(),
      '450',
      'a text field keeps native undo'
    )
    assert.equal(await changedCount('Motion'), 2)

    await brandReset.click()
    assert.equal(await brand.inputValue(), '#7C3AED')
    assert.equal(await brandReset.count(), 0)
    assert.equal(await changedCount('Color'), 0)
    assert.equal(await changedCount('Typography'), 1, 'other editors keep their changes')
    assert.equal(await changedCount('Spacing & surfaces'), 2)
    assert.equal(await changedCount('Motion'), 2)
    await undo.click()
    assert.equal(await brand.inputValue(), '#166534', 'a control reset is undoable')
    assert.equal(await feedback.innerText(), 'Undid brand color.')
    assert.equal(await changedCount('Color'), 1)

    await button('Spacing & surfaces').click()
    await button('Reset spacing & surfaces').click()
    assert.equal(await radius.inputValue(), '8')
    assert.equal(await changedCount('Spacing & surfaces'), 0)
    assert.equal(await changedCount('Color'), 1)
    await undo.click()
    assert.equal(await radius.inputValue(), dragged, 'an editor reset is undoable')
    assert.equal(await feedback.innerText(), 'Undid spacing & surfaces reset.')
    assert.equal(await changedCount('Spacing & surfaces'), 2)
    assert.deepEqual(errors, [], 'no history runtime errors')
    console.log(
      'History passed: undo/redo by button and keyboard, one step per slider or curve drag, native text undo untouched, changed markers with descriptions, per-control and per-editor resets through history, editor counts.'
    )
  } catch (error) {
    await page
      .screenshot({ path: 'output/docs/history-failure.png', fullPage: true })
      .catch(() => {})
    throw error
  } finally {
    await page.close()
  }
}
