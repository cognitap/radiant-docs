import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

/** Hold scripts so SSR fields cannot accept edits that controlled hydration would discard. */
export async function verifyProfileHydration(browser, baseURL) {
  const context = await browser.newContext()
  const page = await context.newPage()
  let release
  const scripts = new Promise(resolve => {
    release = resolve
  })
  await page.route('**/_next/static/**/*.js', async route => {
    await scripts
    await route.continue()
  })
  try {
    await page.goto(`${baseURL}/docs/recipes/profile-form/`, { waitUntil: 'commit' })
    for (const title of ['Profile editor', 'Compare configurations']) {
      const frame = page.getByRole('region', { name: title, exact: true })
      const form = frame.getByRole('form', { name: 'Edit profile' })
      await form.getByRole('button', { name: 'Save profile', exact: true }).waitFor()
      for (const control of await form.locator('input, button').all()) {
        assert.equal(
          await control.isDisabled(),
          true,
          `${title}: fields wait for their state owner before accepting edits`
        )
      }
    }
    release()
    for (const title of ['Profile editor', 'Compare configurations']) {
      const frame = page.getByRole('region', { name: title, exact: true })
      const form = frame.getByRole('form', { name: 'Edit profile' })
      await form
        .getByRole('button', { name: 'Save profile', exact: true })
        .locator(':scope:enabled')
        .waitFor()
      await form
        .getByRole('textbox', { name: 'Display name', exact: true })
        .fill('Hydrated profile')
      await form
        .getByRole('textbox', { name: 'Email address', exact: true })
        .fill('ready@example.com')
      await form.getByRole('radio', { name: 'No contact', exact: true }).check()
      await form.getByRole('checkbox', { name: 'Product updates', exact: true }).check()
      await form.getByRole('button', { name: 'Save profile', exact: true }).click()
      await frame
        .getByRole('status')
        .filter({ hasText: 'Saved locally for Hydrated profile' })
        .waitFor()
    }
  } catch (error) {
    await page
      .screenshot({ path: 'output/docs/profile-hydration-failure.png', fullPage: true })
      .catch(() => {})
    throw error
  } finally {
    release()
    await page.unrouteAll({ behavior: 'wait' })
    await context.close()
  }
}

export async function verifyProfileRecipes(browser, baseURL) {
  await verifyProfileHydration(browser, baseURL)
  const route = `${baseURL}/docs/recipes/profile-form/`
  const staticPage = await browser.newPage({ javaScriptEnabled: false })
  try {
    assert.equal((await staticPage.goto(route)).status(), 200)
    assert.equal(await staticPage.getByRole('form', { name: 'Edit profile' }).count(), 2)
    for (const button of await staticPage
      .getByRole('button', { name: 'Save profile', exact: true })
      .all()) {
      assert.equal(
        await button.isDisabled(),
        true,
        'no-JavaScript form cannot submit personal data to the static host'
      )
    }
    const demo = staticPage.getByRole('region', { name: 'Profile editor', exact: true })
    await demo.locator('summary').press('Enter')
    assert.equal(await demo.locator('pre').count(), 6)
    assert.equal(await demo.locator('pre').first().isVisible(), true)
  } finally {
    await staticPage.close()
  }

  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  try {
    await page.goto(baseURL)
    await page.getByRole('link', { name: 'Explore form recipes' }).click()
    await page.waitForURL('**/docs/recipes/profile-form/')
    const demo = page.getByRole('region', { name: 'Profile editor', exact: true })
    const compare = page.getByRole('region', { name: 'Compare configurations', exact: true })
    const otherForm = compare.getByRole('form', { name: 'Edit profile' })
    const feedback = demo.locator('.profile-result')

    // A second mounted form must retain its values, choices and save state.
    await otherForm.getByRole('textbox', { name: 'Display name', exact: true }).fill('Grace Hopper')
    await otherForm
      .getByRole('textbox', { name: 'Email address', exact: true })
      .fill('grace@example.com')
    await otherForm.getByRole('radio', { name: 'No contact', exact: true }).check()
    await otherForm.getByRole('button', { name: 'Save profile', exact: true }).click()
    await compare
      .getByRole('status')
      .filter({ hasText: 'Saved locally for Grace Hopper' })
      .waitFor()
    const otherSaved = await compare.locator('.profile-result').innerText()

    for (const owner of ['native', 'tanstack']) {
      for (const placement of ['standalone', 'card', 'dialog']) {
        await demo.getByRole('combobox', { name: 'Form owner', exact: true }).selectOption(owner)
        await demo.getByRole('combobox', { name: 'Placement', exact: true }).selectOption(placement)
        const trigger = demo.getByRole('button', { name: 'Edit profile', exact: true })
        const dialog = demo.getByRole('dialog', { name: 'Edit your profile', exact: true })
        if (placement === 'dialog') await trigger.press('Enter')
        const form = demo.getByRole('form', { name: 'Edit profile' })
        const name = form.getByRole('textbox', { name: 'Display name', exact: true })
        const email = form.getByRole('textbox', { name: 'Email address', exact: true })
        const save = form.getByRole('button', { name: 'Save profile', exact: true })
        const reset = form.getByRole('button', { name: 'Reset form', exact: true })
        await form.waitFor()
        await save.click()
        await form
          .getByText('Enter a name with at least two characters.', { exact: true })
          .waitFor()
        assert.equal(await name.getAttribute('aria-invalid'), 'true')
        assert.equal(await name.evaluate(node => node === document.activeElement), true)
        assert.equal(
          await name.evaluate(node => {
            const descriptions = node.getAttribute('aria-describedby').split(/\s+/)
            return (
              descriptions.every(id => node.form.contains(document.getElementById(id))) &&
              descriptions.length === 2
            )
          }),
          true,
          'help/error IDs resolve inside this form'
        )

        const displayName = `Ada ${owner} ${placement}`
        await name.fill(displayName)
        await email.fill('invalid-email')
        await save.click()
        await form.getByText('Enter a valid email address.', { exact: true }).waitFor()
        assert.equal(await email.evaluate(node => node === document.activeElement), true)
        await email.fill('ada@example.com')
        const emailChoice = form.getByRole('radio', { name: 'Email me', exact: true })
        await emailChoice.focus()
        await emailChoice.press('ArrowRight')
        assert.equal(
          await form.getByRole('radio', { name: 'No contact', exact: true }).isChecked(),
          true
        )
        const updates = form.getByRole('checkbox', { name: 'Product updates', exact: true })
        await updates.focus()
        await updates.press('Space')
        assert.equal(await updates.isChecked(), true)
        await save.press('Enter')
        await demo
          .getByRole('status')
          .filter({ hasText: `Saved locally for ${displayName}` })
          .waitFor()
        assert.match(
          await feedback.innerText(),
          /ada@example.com\. Contact: none\. Product updates: on\./
        )
        if (placement === 'dialog') {
          await dialog.waitFor({ state: 'hidden' })
          assert.equal(await trigger.evaluate(node => node === document.activeElement), true)
          await trigger.click()
        }

        await reset.click()
        assert.equal(await name.inputValue(), '')
        assert.equal(await email.inputValue(), '')
        assert.equal(await emailChoice.isChecked(), true)
        assert.equal(await updates.isChecked(), false)
        assert.equal(await form.locator('[aria-invalid="true"]').count(), 0)
        assert.match(await feedback.innerText(), /Nothing is sent to a server/)

        // Reset also clears validation errors and both owners remain usable afterwards.
        await save.click()
        await form.getByText('Enter a valid email address.', { exact: true }).waitFor()
        await reset.click()
        assert.equal(await form.getByRole('alert').count(), 0)
        if (placement === 'dialog') {
          await name.fill('Unfinished draft')
          await name.press('Escape')
          await dialog.waitFor({ state: 'hidden' })
          assert.equal(await trigger.evaluate(node => node === document.activeElement), true)
          await trigger.click()
          assert.equal(await name.inputValue(), 'Unfinished draft', 'dismissal retains edits')
          await dialog.getByRole('button', { name: 'Close editor', exact: true }).press('Enter')
          await dialog.waitFor({ state: 'hidden' })
          assert.equal(await trigger.evaluate(node => node === document.activeElement), true)
          await trigger.click()
          await page.mouse.click(2, 2)
          await dialog.waitFor({ state: 'hidden' })
          assert.equal(await trigger.evaluate(node => node === document.activeElement), true)
        }
        assert.equal(await compare.locator('.profile-result').innerText(), otherSaved)
        assert.equal(
          await otherForm.getByRole('radio', { name: 'No contact', exact: true }).isChecked(),
          true
        )
        assert.equal(
          await otherForm
            .getByRole('checkbox', { name: 'Product updates', exact: true })
            .isChecked(),
          false
        )
        assert.equal(
          await otherForm.getByRole('textbox', { name: 'Display name', exact: true }).inputValue(),
          'Grace Hopper'
        )
        console.log(`Recipe passed: ${owner} / ${placement}, validation, submit, reset and focus.`)
      }
    }

    await demo.getByRole('combobox', { name: 'Placement', exact: true }).selectOption('standalone')
    const scope = demo.locator('.profile-recipe')
    await demo.getByRole('textbox', { name: 'Display name', exact: true }).fill('Keep my edits')
    const presets = await demo
      .getByRole('combobox', { name: 'Theme', exact: true })
      .locator('option')
      .evaluateAll(nodes => nodes.map(node => node.value))
    assert.equal(presets.length, 8)
    for (const theme of presets) {
      await demo.getByRole('combobox', { name: 'Theme', exact: true }).selectOption(theme)
      const backgrounds = []
      for (const mode of ['light', 'dark']) {
        await demo.getByRole('combobox', { name: 'Mode', exact: true }).selectOption(mode)
        assert.equal(await scope.getAttribute('data-rad-theme'), theme)
        assert.equal(await scope.evaluate(node => getComputedStyle(node).colorScheme), mode)
        backgrounds.push(await scope.evaluate(node => getComputedStyle(node).backgroundColor))
      }
      assert.notEqual(
        backgrounds[0],
        backgrounds[1],
        `${theme} paints distinct light/dark canvases`
      )
      assert.equal(
        await demo.getByRole('textbox', { name: 'Display name', exact: true }).inputValue(),
        'Keep my edits'
      )
    }
    await demo.getByRole('combobox', { name: 'Mode', exact: true }).selectOption('system')
    assert.equal(await scope.evaluate(node => getComputedStyle(node).colorScheme), 'light dark')
    const ids = await page.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id))
    assert.equal(ids.length, new Set(ids).size, 'multiple forms/fields/dialogs have unique IDs')

    // Frame reset is local and restores its own controls and values.
    await demo.getByRole('button', { name: 'Reset preview', exact: true }).press('Enter')
    assert.equal(
      await demo.getByRole('combobox', { name: 'Form owner', exact: true }).inputValue(),
      'native'
    )
    assert.equal(
      await demo.getByRole('combobox', { name: 'Placement', exact: true }).inputValue(),
      'standalone'
    )
    assert.equal(
      await demo.getByRole('textbox', { name: 'Display name', exact: true }).inputValue(),
      ''
    )
    assert.equal(await compare.locator('.profile-result').innerText(), otherSaved)

    await demo.screenshot({ path: 'output/docs/profile-native-desktop.png' })
    await compare.screenshot({ path: 'output/docs/profile-tanstack-card.png' })
    await demo.locator('summary').press('Enter')
    for (const file of [
      'ProfileRecipe.tsx',
      'NativeProfileForm.tsx',
      'TanStackProfileForm.tsx',
      'profile.ts',
      'useHydrated.ts',
      'profile-form.css'
    ]) {
      const sourceName = `profile/${file}`
      const actual = await readFile(new URL(`../examples/${sourceName}`, import.meta.url), 'utf8')
      assert.equal(
        await demo.getByLabel(`Source: ${sourceName}`, { exact: true }).textContent(),
        actual
      )
      await demo.getByRole('button', { name: `Copy ${sourceName}`, exact: true }).click()
      await demo
        .getByRole('status')
        .filter({ hasText: `Copied ${sourceName}.` })
        .waitFor()
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), actual)
    }
    await page.setViewportSize({ width: 390, height: 844 })
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true
    )
    await demo.locator('summary').click()
    await demo.screenshot({ path: 'output/docs/profile-mobile.png' })
    await demo.getByRole('combobox', { name: 'Placement', exact: true }).selectOption('dialog')
    await demo.getByRole('combobox', { name: 'Mode', exact: true }).selectOption('dark')
    await demo.getByRole('button', { name: 'Edit profile', exact: true }).click()
    const modal = demo.getByRole('dialog', { name: 'Edit your profile', exact: true })
    await modal.waitFor()
    assert.equal(await modal.evaluate(node => node.scrollWidth <= node.clientWidth), true)
    await page.screenshot({ path: 'output/docs/profile-dialog-mobile.png' })
    await modal.getByRole('button', { name: 'Close editor', exact: true }).click()
    await page.setViewportSize({ width: 320, height: 640 })
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true
    )
    await page.reload()
    await demo.getByRole('textbox', { name: 'Display name', exact: true }).fill('Direct load')
    await demo
      .getByRole('textbox', { name: 'Email address', exact: true })
      .fill('direct@example.com')
    await demo.getByRole('button', { name: 'Save profile', exact: true }).click()
    await demo.getByRole('status').filter({ hasText: 'Saved locally for Direct load' }).waitFor()
    assert.deepEqual(errors, [], 'recipe has no hydration, runtime or asset errors')
    console.log(
      'Recipes passed: six configurations, independent IDs/state, all presets/modes, actual source/copy, SSR/hydration and narrow layouts.'
    )
  } catch (error) {
    await page
      .screenshot({ path: 'output/docs/profile-failure.png', fullPage: true })
      .catch(() => {})
    throw error
  } finally {
    await context.close()
  }
}
