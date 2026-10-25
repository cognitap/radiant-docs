import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { sharp, themes } from '@cognitap/radiant'

const examples = [
  ['field', 'Field relationships', 'FieldExample.tsx', 'Save project'],
  ['input', 'Email input', 'InputExample.tsx', 'Save email'],
  ['checkbox', 'Checkbox value', 'CheckboxExample.tsx', 'Inspect value'],
  ['checkbox', 'Mixed selection', 'CheckboxSelectionExample.tsx', 'Inspect channels'],
  ['radio-group', 'Radio selection', 'RadioGroupExample.tsx', 'Save preference']
]

async function sourceFiles(page, frame, file) {
  await frame.locator('summary').click()
  for (const name of [
    `controls/${file}`,
    'controls/control-types.ts',
    'profile/useHydrated.ts',
    'controls/control-example.css'
  ]) {
    const actual = await readFile(new URL(`../examples/${name}`, import.meta.url), 'utf8')
    assert.equal(await frame.getByLabel(`Source: ${name}`, { exact: true }).textContent(), actual)
    await frame.getByRole('button', { name: `Copy ${name}`, exact: true }).click()
    await frame
      .getByRole('status')
      .filter({ hasText: `Copied ${name}.` })
      .waitFor()
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), actual)
  }
  await frame.locator('summary').click()
}

async function relationships(input, { required = true, error = false } = {}) {
  assert.equal(await input.getAttribute('aria-required'), required ? 'true' : null)
  assert.equal(await input.getAttribute('aria-invalid'), error ? 'true' : null)
  const connected = await input.evaluate(node => {
    const ids = (node.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean)
    return {
      labeled: Array.from(node.labels).some(label => label.htmlFor === node.id),
      descriptions: ids.map(id => document.getElementById(id)?.textContent ?? null)
    }
  })
  assert.equal(connected.labeled, true)
  assert.equal(connected.descriptions.length, error ? 2 : 1)
  assert.ok(connected.descriptions.every(Boolean), 'help/error IDs resolve to real content')
}

async function options(page, frame, input) {
  const heights = []
  for (const size of ['small', 'medium', 'large']) {
    await frame.getByRole('combobox', { name: 'Control size', exact: true }).selectOption(size)
    await input.locator(`:scope[data-control-size="${size}"]`).waitFor()
    heights.push((await input.boundingBox()).height)
  }
  assert.ok(
    heights[0] < heights[1] && heights[1] < heights[2],
    'sizes change actual control metrics'
  )
  await frame.getByRole('combobox', { name: 'Theme', exact: true }).selectOption(sharp.id)
  await frame.getByRole('combobox', { name: 'Mode', exact: true }).selectOption('dark')
  const scope = frame.locator('.control-example')
  assert.equal(await scope.getAttribute('data-rad-theme'), sharp.id)
  assert.equal(await scope.evaluate(node => getComputedStyle(node).colorScheme), 'dark')
}

async function feedback(frame, text) {
  await frame.locator('.control-result').filter({ hasText: text }).waitFor()
}

export async function verifyControls(browser, baseURL) {
  const context = await browser.newContext({
    permissions: ['clipboard-read', 'clipboard-write'],
    viewport: { width: 1440, height: 1000 }
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  try {
    // Each exported guide includes real controls, readable source and safe no-JS submission.
    const staticPage = await browser.newPage({ javaScriptEnabled: false })
    for (const [route, title, , submit] of examples) {
      assert.equal((await staticPage.goto(`${baseURL}/docs/${route}/`)).status(), 200)
      const frame = staticPage.getByRole('region', { name: title, exact: true })
      assert.equal(
        await frame.getByRole('button', { name: submit, exact: true }).isDisabled(),
        true
      )
      await frame.locator('summary').press('Enter')
      assert.equal(await frame.locator('pre').count(), 4)
      assert.equal(await frame.locator('pre').first().isVisible(), true)
    }
    await staticPage.close()

    await page.goto(`${baseURL}/docs/field/`)
    const field = page.getByRole('region', { name: 'Field relationships', exact: true })
    const project = field.getByRole('textbox', { name: 'Project name', exact: true })
    await relationships(project)
    await field.locator('label[data-slot="field-label"]').click()
    assert.equal(await project.evaluate(node => node === document.activeElement), true)
    await field.getByRole('button', { name: 'Save project', exact: true }).click()
    await field.getByRole('alert').filter({ hasText: 'at least two characters' }).waitFor()
    await relationships(project, { error: true })
    assert.equal(await project.evaluate(node => node === document.activeElement), true)
    await field.screenshot({ path: 'output/docs/controls-field-error.png', animations: 'disabled' })
    await project.fill('Documentation')
    await project.press('Enter')
    await feedback(field, 'Saved locally: Documentation.')
    assert.equal(await field.getByRole('alert').count(), 0)
    await options(page, field, project)
    assert.equal(
      await project.inputValue(),
      'Documentation',
      'presentation preserves browser-owned edits'
    )
    await field.screenshot({
      path: 'output/docs/controls-field-sharp-dark.png',
      animations: 'disabled'
    })
    await field.getByRole('checkbox', { name: 'Use native input', exact: true }).check()
    await project.locator(':scope.native-field-input').waitFor()
    await relationships(project)
    await field.getByRole('button', { name: 'Save project', exact: true }).click()
    await field.getByRole('alert').waitFor()
    assert.equal(await project.evaluate(node => node === document.activeElement), true)
    await project.fill('Native adapter')
    await project.press('Enter')
    await feedback(field, 'Saved locally: Native adapter.')
    await field.getByRole('checkbox', { name: 'Disabled', exact: true }).check()
    assert.equal(await project.isDisabled(), true)
    await field.getByRole('button', { name: 'Save project', exact: true }).click()
    await feedback(field, 'Project name omitted (disabled).')
    await field.getByRole('button', { name: 'Reset preview', exact: true }).click()
    assert.equal(await project.inputValue(), '')
    assert.equal(await project.isDisabled(), false)

    // The Field guide embeds the original recipe alongside an independent focused example.
    const recipe = page.getByRole('region', { name: 'Profile editor', exact: true })
    await recipe.getByRole('textbox', { name: 'Display name', exact: true }).fill('Family guide')
    await recipe
      .getByRole('textbox', { name: 'Email address', exact: true })
      .fill('guide@example.com')
    await recipe.getByRole('button', { name: 'Save profile', exact: true }).click()
    await recipe.getByRole('status').filter({ hasText: 'Saved locally for Family guide' }).waitFor()
    await field.getByRole('button', { name: 'Save project', exact: true }).click()
    await field.getByRole('alert').waitFor()
    await field.getByRole('button', { name: 'Reset form', exact: true }).click()
    assert.equal(await field.getByRole('alert').count(), 0)
    await recipe.getByRole('status').filter({ hasText: 'Saved locally for Family guide' }).waitFor()

    await page.goto(`${baseURL}/docs/input/`)
    const emailFrame = page.getByRole('region', { name: 'Email input', exact: true })
    const email = emailFrame.getByRole('textbox', { name: 'Work email', exact: true })
    await relationships(email)
    await email.fill('not-an-email')
    await emailFrame.getByRole('button', { name: 'Save email', exact: true }).click()
    await emailFrame
      .getByRole('alert')
      .filter({ hasText: 'Enter a valid email address.' })
      .waitFor()
    assert.equal(await email.evaluate(node => node === document.activeElement), true)
    await emailFrame.getByRole('button', { name: 'Reset form', exact: true }).click()
    assert.equal(await email.inputValue(), 'ada@example.com')
    assert.equal(await emailFrame.getByRole('alert').count(), 0)
    await emailFrame.getByRole('checkbox', { name: 'Read only', exact: true }).check()
    assert.equal(await email.getAttribute('readonly'), '')
    await emailFrame.getByRole('button', { name: 'Focus input', exact: true }).click()
    assert.equal(await email.evaluate(node => node === document.activeElement), true)
    await email.press('x')
    assert.equal(await email.inputValue(), 'ada@example.com')
    await emailFrame.getByRole('button', { name: 'Save email', exact: true }).click()
    await feedback(emailFrame, 'Saved locally: ada@example.com.')
    await emailFrame.getByRole('checkbox', { name: 'Disabled', exact: true }).check()
    await emailFrame.getByRole('button', { name: 'Focus input', exact: true }).click()
    assert.equal(await email.isDisabled(), true)
    assert.equal(await email.evaluate(node => node === document.activeElement), false)
    await emailFrame.getByRole('button', { name: 'Save email', exact: true }).click()
    await feedback(emailFrame, 'Email omitted (disabled).')
    await emailFrame.getByRole('checkbox', { name: 'Disabled', exact: true }).uncheck()
    await emailFrame.getByRole('checkbox', { name: 'Read only', exact: true }).uncheck()
    await email.fill('')
    await emailFrame.getByRole('button', { name: 'Save email', exact: true }).click()
    await emailFrame.getByRole('alert').filter({ hasText: 'Enter your email address.' }).waitFor()
    await emailFrame.getByRole('checkbox', { name: 'Required', exact: true }).uncheck()
    await emailFrame.getByRole('button', { name: 'Save email', exact: true }).click()
    await feedback(emailFrame, 'Saved locally: (empty).')
    for (const theme of themes) {
      await emailFrame.getByRole('combobox', { name: 'Theme', exact: true }).selectOption(theme.id)
      const colors = []
      for (const mode of ['light', 'dark']) {
        await emailFrame.getByRole('combobox', { name: 'Mode', exact: true }).selectOption(mode)
        colors.push(
          await emailFrame
            .locator('.control-example')
            .evaluate(node => getComputedStyle(node).backgroundColor)
        )
      }
      assert.notEqual(colors[0], colors[1])
      assert.equal(await email.inputValue(), '')
    }
    await emailFrame.getByRole('combobox', { name: 'Mode', exact: true }).selectOption('system')
    await page.emulateMedia({ colorScheme: 'dark' })
    assert.equal(
      await emailFrame
        .locator('.control-example')
        .evaluate(node => getComputedStyle(node).colorScheme),
      'light dark'
    )
    await page.emulateMedia({ colorScheme: 'light' })
    await options(page, emailFrame, email)

    await page.goto(`${baseURL}/docs/checkbox/`)
    const checkboxFrame = page.getByRole('region', { name: 'Checkbox value', exact: true })
    const checkbox = checkboxFrame.getByRole('checkbox', { name: 'Release notes', exact: true })
    await relationships(checkbox, { required: false })
    await checkboxFrame.getByRole('button', { name: 'Inspect value', exact: true }).click()
    await feedback(checkboxFrame, 'updates is absent.')
    await checkbox.focus()
    await checkbox.press('Space')
    await checkboxFrame.getByRole('button', { name: 'Inspect value', exact: true }).click()
    await feedback(checkboxFrame, 'updates=release-notes.')
    await checkboxFrame.getByRole('button', { name: 'Reset form', exact: true }).click()
    assert.equal(await checkbox.isChecked(), false)
    await checkboxFrame.getByRole('checkbox', { name: 'Required', exact: true }).check()
    await checkboxFrame.getByRole('button', { name: 'Inspect value', exact: true }).click()
    await checkboxFrame.getByRole('alert').waitFor()
    await relationships(checkbox, { error: true })
    assert.equal(await checkbox.evaluate(node => node === document.activeElement), true)
    await options(page, checkboxFrame, checkbox)
    await checkboxFrame.getByRole('checkbox', { name: 'Disabled', exact: true }).check()
    assert.equal(await checkbox.isDisabled(), true)
    await checkboxFrame.getByRole('button', { name: 'Inspect value', exact: true }).click()
    await feedback(checkboxFrame, 'updates is absent.')

    const selection = page.getByRole('region', { name: 'Mixed selection', exact: true })
    const all = selection.getByRole('checkbox', { name: 'Select all channels', exact: true })
    const inApp = selection.getByRole('checkbox', { name: 'In-app notifications', exact: true })
    const channelEmail = selection.getByRole('checkbox', {
      name: 'Email notifications',
      exact: true
    })
    assert.equal(await all.evaluate(node => node.indeterminate), true)
    await all.focus()
    await all.press('Space')
    assert.equal(await all.evaluate(node => node.indeterminate), false)
    assert.equal(await channelEmail.isChecked(), true)
    assert.equal(await inApp.isChecked(), true)
    await selection.getByRole('button', { name: 'Inspect channels', exact: true }).click()
    await feedback(selection, 'email, in-app.')
    await channelEmail.uncheck()
    assert.equal(await all.evaluate(node => node.indeterminate), true)
    await selection.getByRole('button', { name: 'Reset form', exact: true }).click()
    assert.equal(await all.evaluate(node => node.indeterminate), true)
    assert.equal(await channelEmail.isChecked(), true)
    assert.equal(await inApp.isChecked(), false)
    assert.equal(
      await selection
        .getByRole('group', { name: 'Notification channels', exact: true })
        .evaluate(node => node.tagName),
      'FIELDSET'
    )
    await selection.getByRole('checkbox', { name: 'Disabled', exact: true }).check()
    for (const input of [all, channelEmail, inApp]) assert.equal(await input.isDisabled(), true)
    await selection.getByRole('button', { name: 'Inspect channels', exact: true }).click()
    await feedback(selection, '(no channels).')
    await selection.getByRole('button', { name: 'Reset preview', exact: true }).click()
    assert.equal(
      await checkbox.isDisabled(),
      true,
      'resetting the mixed example leaves the other preview alone'
    )

    await page.goto(`${baseURL}/docs/radio-group/`)
    const radioFrame = page.getByRole('region', { name: 'Radio selection', exact: true })
    const emailRadio = radioFrame.getByRole('radio', { name: 'Email me', exact: true })
    const noContact = radioFrame.getByRole('radio', { name: 'No contact', exact: true })
    assert.equal(await emailRadio.isChecked(), true)
    await emailRadio.focus()
    await emailRadio.press('ArrowRight')
    assert.equal(await noContact.isChecked(), true)
    await noContact.press('ArrowRight')
    assert.equal(await emailRadio.isChecked(), true, 'native arrows skip the disabled phone option')
    await noContact.check()
    await radioFrame.getByRole('button', { name: 'Save preference', exact: true }).click()
    await feedback(radioFrame, 'contact=none.')
    await radioFrame.getByRole('button', { name: 'Reset form', exact: true }).click()
    assert.equal(await emailRadio.isChecked(), true)
    await radioFrame.getByRole('checkbox', { name: 'Start with no selection', exact: true }).check()
    assert.equal(await emailRadio.isChecked(), false)
    await radioFrame.getByRole('button', { name: 'Save preference', exact: true }).click()
    await radioFrame
      .getByRole('alert')
      .filter({ hasText: 'Choose a contact preference.' })
      .waitFor()
    assert.equal(await emailRadio.evaluate(node => node === document.activeElement), true)
    const group = radioFrame.getByRole('group', { name: 'Contact preference', exact: true })
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
    await emailRadio.press('Space')
    await radioFrame.getByRole('button', { name: 'Reset form', exact: true }).click()
    assert.equal(await emailRadio.isChecked(), false)
    assert.equal(await radioFrame.getByRole('alert').count(), 0)
    await options(page, radioFrame, emailRadio)

    // The embedded TanStack recipe keeps separate native names and controlled reset/dismissal.
    const compare = page.getByRole('region', { name: 'Compare configurations', exact: true })
    const otherEmailRadio = compare.getByRole('radio', { name: 'Email me', exact: true })
    assert.notEqual(
      await emailRadio.getAttribute('name'),
      await otherEmailRadio.getAttribute('name')
    )
    await noContact.check()
    assert.equal(await otherEmailRadio.isChecked(), true)
    await compare.getByRole('combobox', { name: 'Placement', exact: true }).selectOption('dialog')
    await compare.getByRole('button', { name: 'Edit profile', exact: true }).click()
    const dialog = compare.getByRole('dialog', { name: 'Edit your profile', exact: true })
    const draft = dialog.getByRole('textbox', { name: 'Display name', exact: true })
    await draft.fill('Keep this draft')
    await draft.press('Escape')
    await dialog.waitFor({ state: 'hidden' })
    await compare.getByRole('button', { name: 'Edit profile', exact: true }).click()
    assert.equal(await draft.inputValue(), 'Keep this draft')
    await dialog.getByRole('button', { name: 'Reset form', exact: true }).click()
    assert.equal(await draft.inputValue(), '')
    await dialog.getByRole('button', { name: 'Close editor', exact: true }).click()
    assert.equal(
      await compare
        .getByRole('button', { name: 'Edit profile', exact: true })
        .evaluate(node => node === document.activeElement),
      true
    )
    assert.equal(await noContact.isChecked(), true)
    const ids = await page.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id))
    assert.equal(
      new Set(ids).size,
      ids.length,
      'embedded recipes and control examples have unique IDs'
    )

    for (const [route, title, file] of examples) {
      await page.goto(`${baseURL}/docs/${route}/`)
      const frame = page.getByRole('region', { name: title, exact: true })
      await sourceFiles(page, frame, file)
      await frame.screenshot({
        path: `output/docs/controls-${file.replace('.tsx', '')}-desktop.png`,
        animations: 'disabled'
      })
      for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: 844 })
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          true,
          `${title} fits at ${width}px`
        )
      }
      await frame.screenshot({
        path: `output/docs/controls-${file.replace('.tsx', '')}-mobile.png`,
        animations: 'disabled'
      })
      await page.setViewportSize({ width: 1440, height: 1000 })
      const links = await page
        .locator('main a[href^="/docs/"]')
        .evaluateAll(nodes => Array.from(new Set(nodes.map(node => node.getAttribute('href')))))
      for (const href of links) {
        const url = new URL(href, baseURL)
        const response = await page.request.get(url.href)
        assert.equal(response.status(), 200, `guide link resolves: ${href}`)
        if (url.hash)
          assert.ok(
            (await response.text()).includes(`id="${url.hash.slice(1)}"`),
            `guide anchor exists: ${href}`
          )
      }
    }
    assert.deepEqual(errors, [], 'form control guides have no hydration, runtime or asset errors')
    console.log(
      'Form controls passed: labels/help/errors, native adapters, required/disabled/read-only, real FormData payloads, mixed selection, radio names/arrows/reset, embedded recipe isolation, themes/sizes, source/copy, SSR and 320px layouts.'
    )
  } catch (error) {
    await page
      .screenshot({ path: 'output/docs/controls-failure.png', fullPage: true })
      .catch(() => {})
    throw error
  } finally {
    await context.close()
  }
}
