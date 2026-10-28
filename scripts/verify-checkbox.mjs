import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

export async function verifyCheckbox(browser, baseURL) {
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
  const title = 'A clear set of permissions'
  const labTitle = 'Checkbox indicator lab'
  try {
    const staticPage = await browser.newPage({ javaScriptEnabled: false })
    await staticPage.goto(`${baseURL}/docs/checkbox/`)
    const staticFrame = staticPage.getByRole('region', { name: title, exact: true })
    assert.equal(
      await staticFrame.getByRole('button', { name: 'Save permissions', exact: true }).isDisabled(),
      true
    )
    await staticFrame.locator('.demo-sources > summary').press('Enter')
    assert.equal(await staticFrame.locator('pre').count(), 1)
    await staticPage.close()

    await page.goto(`${baseURL}/docs/checkbox/`)
    const frame = page.getByRole('region', { name: title, exact: true })
    const form = frame.getByRole('form', { name: 'Collaborator permissions', exact: true })
    const all = form.getByRole('checkbox', { name: 'Select all editable permissions', exact: true })
    const invite = form.getByRole('checkbox', { name: 'Invite collaborators', exact: true })
    const publish = form.getByRole('checkbox', { name: 'Publish projects', exact: true })
    const audit = form.getByRole('checkbox', {
      name: 'View audit log · owner managed',
      exact: true
    })
    const summary = form.getByRole('checkbox', { name: 'Email me an access summary', exact: true })
    const save = form.getByRole('button', { name: 'Save permissions', exact: true })
    const off = frame.getByRole('checkbox', { name: 'Turn off spatial motion', exact: true })
    const ids = await form.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id))
    assert.equal(await all.evaluate(node => node.indeterminate), true)
    assert.equal(await all.getAttribute('name'), null)
    assert.equal(await audit.isDisabled(), true)
    await all.focus()
    await all.press('Space')
    assert.equal(await all.isChecked(), true)
    assert.equal(await all.evaluate(node => node.indeterminate), false)
    assert.deepEqual(await form.evaluate(node => new FormData(node).getAll('permissions')), [
      'invite',
      'publish',
      'export'
    ])
    await save.click()
    await form
      .getByRole('status')
      .filter({ hasText: 'invite, publish, export · summary on' })
      .waitFor()
    await all.focus()
    await all.press('Space')
    assert.equal(await all.isChecked(), false)
    assert.deepEqual(await form.evaluate(node => new FormData(node).getAll('permissions')), [])
    await save.click()
    assert.equal(await invite.evaluate(node => node === document.activeElement), true)
    await form.getByRole('alert').filter({ hasText: 'Choose at least one permission.' }).waitFor()
    assert.equal(
      await invite.getAttribute('required'),
      null,
      'group requirement does not require every option'
    )
    const group = form.getByRole('group', { name: 'Team permissions', exact: true })
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
    await frame.screenshot({
      path: 'output/docs/checkbox-permissions-error.png',
      animations: 'disabled'
    })
    await invite.check()
    assert.equal(await all.evaluate(node => node.indeterminate), true)
    assert.equal(
      await invite.evaluate(node =>
        node
          .getAttribute('aria-describedby')
          .split(/\s+/)
          .every(id => !!document.getElementById(id))
      ),
      true
    )
    await summary.uncheck()
    await form.getByRole('button', { name: 'Reset draft', exact: true }).click()
    assert.equal(await invite.isChecked(), true)
    assert.equal(await publish.isChecked(), false)
    assert.equal(await summary.isChecked(), true)
    assert.equal(await all.evaluate(node => node.indeterminate), true)
    assert.deepEqual(
      await form.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id)),
      ids
    )

    const scale = () =>
      invite.evaluate(node =>
        Number(
          node
            .closest('[data-checkbox-feedback]')
            .style.getPropertyValue('--example-checkbox-feedback')
        )
      )
    await off.check()
    await invite.uncheck()
    assert.equal(await scale(), 0)
    await invite.check()
    assert.equal(await scale(), 1)
    await off.uncheck()
    await invite.uncheck()
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await frame.getByText('Spatial motion: reduced by system.', { exact: false }).waitFor()
    assert.equal(await scale(), 0)
    await invite.check()
    assert.equal(await scale(), 1)
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await frame.getByRole('checkbox', { name: 'Lock permissions', exact: true }).check()
    for (const input of [all, invite, publish, audit]) assert.equal(await input.isDisabled(), true)
    await save.click()
    await form
      .getByRole('status')
      .filter({ hasText: 'permissions omitted (locked) · summary on' })
      .waitFor()
    await frame.getByRole('combobox', { name: 'Theme', exact: true }).selectOption('glass')
    await frame.getByRole('combobox', { name: 'Mode', exact: true }).selectOption('dark')
    for (const size of ['small', 'medium', 'large']) {
      await frame.getByRole('combobox', { name: 'Control size', exact: true }).selectOption(size)
      assert.equal(await invite.getAttribute('data-control-size'), size)
    }
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 1100 })
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `Checkbox guide fits at ${width}px`
      )
      const card = await frame.locator('[data-slot="card"]').boundingBox()
      for (const input of [all, invite, publish, audit, save]) {
        const bounds = await input.boundingBox()
        assert.ok(
          bounds.x >= card.x - 1 && bounds.x + bounds.width <= card.x + card.width + 1,
          'Checkbox control stays within Card'
        )
      }
    }
    await frame.screenshot({
      path: 'output/docs/checkbox-permissions-mobile.png',
      animations: 'disabled'
    })
    await page.setViewportSize({ width: 1440, height: 1100 })
    await frame.getByRole('button', { name: 'Reset preview', exact: true }).click()
    assert.equal(await invite.isDisabled(), false)
    assert.equal(await off.isChecked(), false)
    await frame.screenshot({
      path: 'output/docs/checkbox-permissions-desktop.png',
      animations: 'disabled'
    })

    const lab = page.getByRole('region', { name: labTitle, exact: true })
    const trial = lab.getByRole('checkbox', { name: 'Try rapid Space presses', exact: true })
    await lab.getByRole('checkbox', { name: 'Mixed indicator', exact: true }).check()
    assert.equal(await trial.evaluate(node => node.indeterminate), true)
    await trial.focus()
    await trial.press('Space')
    await trial.press('Space')
    assert.equal(await trial.isChecked(), false)
    assert.equal(await trial.evaluate(node => node.indeterminate), false)
    await lab.getByRole('checkbox', { name: 'Disabled state', exact: true }).check()
    assert.equal(await trial.isDisabled(), true)
    await lab.getByRole('checkbox', { name: 'Turn off spatial motion', exact: true }).check()
    await lab.getByRole('checkbox', { name: 'Checked state', exact: true }).check()
    assert.equal(await trial.isChecked(), true)
    assert.equal(
      await trial.evaluate(node =>
        node
          .closest('[data-checkbox-feedback]')
          .style.getPropertyValue('--example-checkbox-feedback')
      ),
      '1'
    )
    await lab.getByRole('button', { name: 'Reset preview', exact: true }).click()
    assert.equal(await trial.isChecked(), false)
    assert.equal(await trial.isDisabled(), false)

    for (const demo of [frame, lab]) {
      await demo.locator('.demo-sources > summary').click()
      const file = 'checkbox/CheckboxExamples.tsx'
      const source = await readFile(new URL(`../examples/${file}`, import.meta.url), 'utf8')
      assert.equal(await demo.getByLabel(`Source: ${file}`, { exact: true }).textContent(), source)
      await demo.getByRole('button', { name: `Copy ${file}`, exact: true }).click()
      await demo
        .getByRole('status')
        .filter({ hasText: `Copied ${file}.` })
        .waitFor()
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), source)
    }
    assert.deepEqual(errors, [], 'Checkbox demos have no hydration/runtime/console errors')
    console.log(
      'Checkbox passed: native mixed/select-all/Space, immediate FormData, disabled omission, group validation, both reset owners, theme sizes, off/live reduced motion, exact source/copy, SSR and 320px Card containment.'
    )
  } catch (error) {
    await page
      .screenshot({ path: 'output/docs/checkbox-failure.png', fullPage: true })
      .catch(() => {})
    throw error
  } finally {
    await context.close()
  }
}
