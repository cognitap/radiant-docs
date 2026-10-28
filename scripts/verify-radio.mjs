import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

export async function verifyRadio(browser, baseURL) {
  const context = await browser.newContext({
    permissions: ['clipboard-read', 'clipboard-write'],
    viewport: { width: 1440, height: 1100 }
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  const title = 'A plan for your next chapter'
  try {
    const staticPage = await browser.newPage({ javaScriptEnabled: false })
    await staticPage.goto(`${baseURL}/docs/radio-group/`)
    const staticFrame = staticPage.getByRole('region', { name: title, exact: true })
    assert.equal(
      await staticFrame.getByRole('button', { name: 'Save plan', exact: true }).isDisabled(),
      true
    )
    await staticFrame.locator('.demo-sources > summary').press('Enter')
    assert.equal(await staticFrame.locator('pre').count(), 1)
    await staticPage.close()

    await page.goto(`${baseURL}/docs/radio-group/`)
    const frame = page.getByRole('region', { name: title, exact: true })
    const form = frame.getByRole('form', { name: 'Workspace plan', exact: true })
    const group = form.getByRole('group', { name: 'Choose your plan', exact: true })
    const personal = group.getByRole('radio', { name: 'Personal', exact: true })
    const pro = group.getByRole('radio', { name: 'Pro', exact: true })
    const team = group.getByRole('radio', { name: 'Team', exact: true })
    const retired = group.getByRole('radio', { name: 'Studio · unavailable', exact: true })
    const monthly = form.getByRole('radio', { name: 'Monthly', exact: true })
    const yearly = form.getByRole('radio', { name: 'Yearly', exact: true })
    const save = form.getByRole('button', { name: 'Save plan', exact: true })
    const off = frame.getByRole('checkbox', { name: 'Turn off spatial motion', exact: true })
    const ids = await form.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id))
    const name = await personal.getAttribute('name')
    const payload = () => form.evaluate((node, key) => new FormData(node).get(key), name)
    assert.notEqual(name, await monthly.getAttribute('name'))
    assert.equal(await retired.isDisabled(), true)
    assert.equal(await pro.isChecked(), true)
    assert.match(
      await pro.evaluate(node =>
        node
          .getAttribute('aria-describedby')
          .split(/\s+/)
          .map(id => document.getElementById(id)?.textContent)
          .join(' ')
      ),
      /\$12 \/ month/
    )
    await pro.focus()
    await pro.press('ArrowDown')
    assert.equal(await team.isChecked(), true)
    assert.equal(await team.evaluate(node => node === document.activeElement), true)
    assert.equal(await payload(), 'team')
    await team.press('ArrowUp')
    await pro.press('ArrowUp')
    assert.equal(await personal.isChecked(), true)
    assert.equal(await payload(), '')
    await personal.press('Space')
    assert.equal(await payload(), '')
    await yearly.check()
    assert.equal(await personal.isChecked(), true, 'Distinct names isolate groups')
    await save.click()
    await form
      .getByRole('status')
      .filter({ hasText: 'Personal (empty value) · billing yearly' })
      .waitFor()
    await form.getByRole('button', { name: 'Clear choice', exact: true }).click()
    assert.equal(await payload(), null)
    assert.equal(await group.locator('input:checked').count(), 0)
    await save.click()
    await group.getByRole('alert').filter({ hasText: 'Choose a plan before saving.' }).waitFor()
    assert.equal(await personal.evaluate(node => node === document.activeElement), true)
    assert.equal(await personal.getAttribute('required'), '')
    assert.equal(await personal.getAttribute('aria-invalid'), null)
    assert.equal(await group.getAttribute('aria-invalid'), 'true')
    assert.equal(
      await group.evaluate(node =>
        node
          .getAttribute('aria-describedby')
          .split(/\s+/)
          .every(id => !!document.getElementById(id))
      ),
      true
    )
    await frame.screenshot({ path: 'output/docs/radio-plan-error.png', animations: 'disabled' })
    await form.getByRole('button', { name: 'Reset draft', exact: true }).click()
    assert.equal(await pro.isChecked(), true)
    assert.equal(await monthly.isChecked(), true)
    assert.deepEqual(
      await form.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id)),
      ids
    )

    const scale = input =>
      input.evaluate(node =>
        Number(
          node.closest('[data-radio-feedback]').style.getPropertyValue('--example-radio-feedback')
        )
      )
    await off.check()
    await personal.check()
    assert.equal(await scale(personal), 1)
    assert.equal(await scale(pro), 0)
    await off.uncheck()
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await frame.getByText('Spatial motion: reduced by system.', { exact: false }).waitFor()
    await pro.check()
    assert.equal(await scale(pro), 1)
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await frame.getByRole('checkbox', { name: 'Lock plan selection', exact: true }).check()
    for (const input of [personal, pro, retired, team]) assert.equal(await input.isDisabled(), true)
    assert.equal(await payload(), null)
    await save.click()
    await form
      .getByRole('status')
      .filter({ hasText: 'plan omitted (locked) · billing monthly' })
      .waitFor()
    await frame.getByRole('combobox', { name: 'Theme', exact: true }).selectOption('glass')
    await frame.getByRole('combobox', { name: 'Mode', exact: true }).selectOption('dark')
    for (const size of ['small', 'medium', 'large']) {
      await frame.getByRole('combobox', { name: 'Control size', exact: true }).selectOption(size)
      assert.equal(await personal.getAttribute('data-control-size'), size)
    }
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 1100 })
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `Radio guide fits at ${width}px`
      )
      const card = await frame.locator('[data-slot="card"]').boundingBox()
      for (const input of [personal, pro, retired, team, save]) {
        const bounds = await input.boundingBox()
        assert.ok(
          bounds.x >= card.x - 1 && bounds.x + bounds.width <= card.x + card.width + 1,
          'Radio control stays within Card'
        )
      }
    }
    await frame.screenshot({ path: 'output/docs/radio-plan-mobile.png', animations: 'disabled' })
    await page.setViewportSize({ width: 1440, height: 1100 })
    await frame.getByRole('button', { name: 'Reset preview', exact: true }).click()
    assert.equal(await pro.isChecked(), true)
    assert.equal(await pro.isDisabled(), false)
    assert.equal(await off.isChecked(), false)
    await frame.screenshot({ path: 'output/docs/radio-plan-desktop.png', animations: 'disabled' })

    const lab = page.getByRole('region', { name: 'Radio selection lab', exact: true })
    const trial = lab.getByRole('group', { name: 'Try arrow keys', exact: true })
    const trialPro = trial.getByRole('radio', { name: 'Pro', exact: true })
    await trialPro.focus()
    await trialPro.press('ArrowDown')
    await trialPro.press('ArrowUp')
    await trialPro.press('ArrowUp')
    assert.equal(
      await trial.getByRole('radio', { name: 'Personal', exact: true }).isChecked(),
      true
    )
    await lab.getByRole('checkbox', { name: 'Horizontal layout', exact: true }).check()
    assert.equal(
      await trial
        .locator('[data-slot="radio-group-options"]')
        .evaluate(node => getComputedStyle(node).display),
      'flex'
    )
    await lab.getByRole('checkbox', { name: 'Invalid group', exact: true }).check()
    assert.equal(await trial.getAttribute('aria-invalid'), 'true')
    await lab.getByRole('checkbox', { name: 'Disabled group', exact: true }).check()
    assert.equal(await trialPro.isDisabled(), true)
    await lab.getByRole('checkbox', { name: 'Turn off spatial motion', exact: true }).check()
    await lab.getByRole('checkbox', { name: 'Disabled group', exact: true }).uncheck()
    await trialPro.check()
    assert.equal(await scale(trialPro), 1)
    await lab.getByRole('button', { name: 'Clear trial selection', exact: true }).click()
    assert.equal(await trial.locator('input:checked').count(), 0)
    await lab.getByRole('button', { name: 'Reset preview', exact: true }).click()
    assert.equal(await trialPro.isChecked(), true)
    assert.equal(await trialPro.isDisabled(), false)

    for (const demo of [frame, lab]) {
      await demo.locator('.demo-sources > summary').click()
      const file = 'radio/RadioExamples.tsx'
      const source = await readFile(new URL(`../examples/${file}`, import.meta.url), 'utf8')
      assert.equal(await demo.getByLabel(`Source: ${file}`, { exact: true }).textContent(), source)
      await demo.getByRole('button', { name: `Copy ${file}`, exact: true }).click()
      await demo
        .getByRole('status')
        .filter({ hasText: `Copied ${file}.` })
        .waitFor()
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), source)
    }
    assert.deepEqual(errors, [], 'Radio demos have no hydration/runtime/console errors')
    console.log(
      'Radio passed: native arrows/Space, skipped disabled options, null vs empty payload, group isolation, required metadata, both reset owners, theme sizes/layouts, off/live reduced motion, exact source/copy, SSR and mobile containment.'
    )
  } catch (error) {
    await page.screenshot({ path: 'output/docs/radio-failure.png', fullPage: true }).catch(() => {})
    throw error
  } finally {
    await context.close()
  }
}
