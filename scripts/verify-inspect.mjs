import assert from 'node:assert/strict'
import { pickedRadio, radioGroup } from './typography-controls.mjs'

/** Inspect mode: pick an element by pointer or keyboard, read what styles it, jump to the control. */
export async function verifyInspect(browser, baseURL) {
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
    const workshop = page.locator('.theme-workshop')
    const preview = page.getByRole('region', { name: 'Theme preview', exact: true })
    await page.waitForFunction(() => !document.querySelector('.preview-toolbar button').disabled)
    const inspect = preview.getByRole('button', { name: 'Inspect', exact: true })
    const inspector = preview.getByRole('region', { name: 'Inspected element', exact: true })
    const scene = preview.getByRole('combobox', { name: 'Scene', exact: true })
    const proof = preview.locator('.preview-page').first()
    const item = name => inspector.getByRole('button', { name })
    const inViewport = async locator => {
      const box = await locator.boundingBox()
      assert.ok(box && box.y >= 0 && box.y + box.height <= 900, 'control is within the viewport')
    }

    await scene.selectOption('components')
    const primary = proof.getByRole('button', { name: 'Try the action', exact: true })
    assert.equal(await inspect.getAttribute('aria-pressed'), 'false')
    await inspect.click()
    assert.equal(await inspect.getAttribute('aria-pressed'), 'true')
    await primary.hover()
    await page.waitForSelector('.inspect-outline[data-state="hover"]')
    await primary.click()
    assert.equal(
      await proof.getByText('Action activated 0 times.').count(),
      1,
      'inspecting pauses the action'
    )
    assert.match(await inspector.innerText(), /Inspecting button “Try the action”/)
    assert.equal(
      await proof
        .locator('[data-rad-text="ui-body"]')
        .first()
        .evaluate(node => getComputedStyle(node).outlineStyle),
      'none',
      'a button click does not select the text role of the scene around it'
    )
    assert.equal(await item(/Action fill/).count(), 1, 'accent color item')
    assert.match(await item(/Action fill/).innerText(), /#7C3AED/)
    assert.equal(await item(/Control radius/).count(), 1, 'control radius item')
    assert.match(await item(/Control radius/).innerText(), /8px/)
    assert.equal(await item(/Button press physics/).count(), 1, 'motion item')
    assert.match(await item(/Button press physics/).innerText(), /stiffness 320/)
    assert.equal(await page.locator('.inspect-outline[data-state="selected"]').count(), 1)

    await item(/Control radius/).click()
    const geometry = workshop.getByRole('button', { name: 'Spacing & surfaces', exact: true })
    assert.equal(await geometry.getAttribute('aria-pressed'), 'true', 'switched editor')
    const radius = workshop.getByRole('spinbutton', { name: 'Control radius (px)', exact: true })
    await page.waitForFunction(
      () => document.activeElement?.getAttribute('aria-describedby')?.includes('description'),
      null,
      { timeout: 2000 }
    )
    assert.equal(
      await radius.evaluate(node => node === document.activeElement),
      true,
      'control radius is focused'
    )
    await inViewport(radius)
    assert.equal(
      await workshop
        .locator('.control-change[data-jumped][data-field="shared.controlRadius"]')
        .count(),
      1,
      'the jumped control is highlighted'
    )

    await item(/Action fill/).click()
    assert.equal(
      await workshop
        .getByRole('button', { name: 'Color', exact: true })
        .getAttribute('aria-pressed'),
      'true'
    )
    const roleChip = workshop.getByRole('button', { name: 'Light Action fill', exact: true })
    assert.equal(await roleChip.evaluate(node => node === document.activeElement), true)
    assert.equal(await roleChip.getAttribute('aria-pressed'), 'true', 'the jump selects the role')
    assert.equal(
      await workshop
        .locator('.color-role-detail')
        .innerText()
        .then(text => text.includes('Light Action fill')),
      true
    )

    await item(/Button press physics/).click()
    assert.equal(
      await workshop
        .getByRole('button', { name: 'Motion', exact: true })
        .getAttribute('aria-pressed'),
      'true'
    )
    assert.equal(
      await workshop
        .getByRole('spinbutton', { name: 'Stiffness', exact: true })
        .evaluate(node => node === document.activeElement),
      true
    )

    await scene.selectOption('page:article')
    await proof.locator('[data-rad-text="prose-title"]').click()
    assert.equal(await item(/Foreground/).count(), 1, 'the title lists the color that paints it')
    assert.equal(await item(/Prose \/ Title/).count(), 1, 'and its text style')
    assert.doesNotMatch(await inspector.innerText(), /--rad-|No workshop control/)
    await workshop.getByRole('button', { name: 'Typography', exact: true }).click()
    const style = () => pickedRadio(workshop, 'Text style')
    assert.equal(await style(), 'prose-title', 'clicking text selects its style')
    await proof.locator('[data-rad-prose] > p:not([data-rad-text])').first().click()
    assert.equal(await style(), 'prose-body')
    assert.equal(await item(/Prose \/ Body/).count(), 1)
    await item(/Prose \/ Body/).click()
    assert.equal(await style(), 'prose-body')
    assert.equal(
      await radioGroup(workshop, 'Style assignment')
        .locator('input:checked')
        .evaluate(node => node === document.activeElement),
      true,
      'typography items focus the checked style assignment chip'
    )

    await scene.selectOption('page:landing')
    const join = proof.getByRole('button', { name: 'Join the list', exact: true })
    await join.focus()
    await page.keyboard.press('Enter')
    assert.match(
      await inspector.innerText(),
      /Inspecting button “Join the list”/,
      'Enter picks the focused element'
    )
    assert.equal(
      await proof.getByRole('status').filter({ hasText: 'No signup is sent.' }).count(),
      1,
      'Enter inspects instead of activating'
    )
    await page.keyboard.press('Escape')
    assert.equal(await inspect.getAttribute('aria-pressed'), 'false', 'Escape exits inspect mode')
    assert.equal(await inspector.count(), 0)
    await join.click({ position: { x: 3, y: 3 } })
    assert.equal(
      await proof.getByRole('status').filter({ hasText: 'local list' }).count(),
      1,
      'actions resume after inspecting'
    )
    assert.deepEqual(errors, [])
    console.log(
      'Inspect passed: one toggle for the preview, items for color, radius, text style and motion, jumps that focus the control, keyboard picking and Escape.'
    )
  } finally {
    await page.close()
  }
}
