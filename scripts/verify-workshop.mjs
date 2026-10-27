import { setTypographyFamily } from './typography-controls.mjs'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { workshopAvailable } from './radiant-package.mjs'

export async function verifyWorkshop(browser, baseURL) {
  const staticPage = await browser.newPage({ javaScriptEnabled: false })
  assert.equal((await staticPage.goto(`${baseURL}/docs/workshop/`)).status(), 200)
  assert.equal(
    await staticPage.getByRole('heading', { name: 'Make room for the useful things.' }).isVisible(),
    true
  )
  const staticFrame = staticPage.getByRole('region', { name: 'Shared theme workshop', exact: true })
  await staticFrame.locator('.demo-sources > summary').press('Enter')
  assert.equal(await staticFrame.locator('.demo-sources pre').count(), 30)
  await staticPage.close()

  const context = await browser.newContext({
    permissions: ['clipboard-read', 'clipboard-write'],
    reducedMotion: 'reduce'
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  try {
    await page.goto(`${baseURL}/docs/workshop/`)
    const frame = page.getByRole('region', { name: 'Shared theme workshop', exact: true })
    const shell = frame.locator('.theme-workshop')
    const canvas = frame.locator('.workshop-canvas')
    await frame.getByRole('button', { name: 'Reset specimen', exact: true }).waitFor()
    await page.waitForFunction(
      () => !document.querySelector('.theme-workshop .demo-controls button').disabled
    )
    const editable = (await shell.getAttribute('data-workshop-editing')) === 'enabled'
    assert.equal(editable, workshopAvailable, 'editing follows installed package capabilities')
    const specimen = frame.getByRole('combobox', { name: 'Specimen', exact: true })
    const mode = frame.getByRole('combobox', { name: 'Preview mode', exact: true })
    const width = frame.getByRole('combobox', { name: 'Preview width', exact: true })
    const variable = name =>
      canvas.evaluate((node, name) => getComputedStyle(node).getPropertyValue(name).trim(), name)
    const selectEditor = async name => {
      const button = frame.getByRole('button', { name, exact: true })
      await button.focus()
      await button.press('Enter')
      assert.equal(await button.getAttribute('aria-pressed'), 'true')
    }
    const baseline = await variable('--rad-color-accent')
    await specimen.selectOption('form')
    const form = canvas.getByRole('form', { name: 'Edit profile' })
    await form.getByRole('textbox', { name: 'Display name' }).fill('Workshop Ada')
    await form.getByRole('textbox', { name: 'Email address' }).fill('ada@example.com')
    await form.getByRole('button', { name: 'Save profile' }).click()
    await canvas
      .getByRole('status')
      .filter({ hasText: 'Saved locally for Workshop Ada.' })
      .waitFor()

    if (editable) {
      await frame.getByRole('textbox', { name: 'Brand color', exact: true }).fill('#166534')
      assert.notEqual(await variable('--rad-color-accent'), baseline)
      await selectEditor('Typography')
      const typographyFamily = await setTypographyFamily(frame, 18)
      await selectEditor('Spacing & surfaces')
      await frame.getByRole('spinbutton', { name: 'Surface radius (px)', exact: true }).fill('24')
      await selectEditor('Motion')
      await frame.getByRole('combobox', { name: 'Release timing' }).selectOption('280ms')
      assert.equal(
        await form.getByRole('textbox', { name: 'Display name' }).inputValue(),
        'Workshop Ada'
      )
      assert.equal(await variable('--rad-surface-radius'), '24px')
      assert.equal(await variable('--rad-motion-release-duration'), '280ms')
      await selectEditor('Color')
      await frame.getByRole('button', { name: 'Reset color', exact: true }).click()
      assert.equal(await variable('--rad-color-accent'), baseline)
      assert.equal(await variable('--rad-surface-radius'), '24px')
      assert.equal(await variable(typographyFamily), 'Georgia, serif')
      assert.equal(
        await form.getByRole('textbox', { name: 'Display name' }).inputValue(),
        'Workshop Ada'
      )
      await frame.getByRole('textbox', { name: 'Brand color', exact: true }).fill('#166534')
    } else {
      assert.equal(
        await frame.getByRole('textbox', { name: 'Brand color', exact: true }).isDisabled(),
        true
      )
      await selectEditor('Typography')
      assert.equal(await frame.getByRole('combobox', { name: 'Body family' }).isDisabled(), true)
    }
    await specimen.selectOption('dashboard')
    await canvas.getByRole('textbox', { name: 'Filter projects' }).fill('Design')
    assert.equal(await canvas.locator('tbody tr').count(), 2)
    await specimen.selectOption('landing')
    await canvas.getByRole('button', { name: 'Join the list' }).click()
    await canvas.getByRole('status').filter({ hasText: 'local list' }).waitFor()
    await specimen.selectOption('components')
    const action = canvas.getByRole('button', { name: 'Try the action' })
    await action.click()
    const count = canvas.getByRole('status').filter({ hasText: 'Action activated' })
    assert.equal(await count.innerText(), 'Action activated 1 times.')
    const state = frame.getByRole('combobox', { name: 'Component state' })
    await state.selectOption('pending')
    await action.click()
    assert.equal(await action.getAttribute('aria-busy'), 'true')
    assert.equal(await count.innerText(), 'Action activated 1 times.')
    await state.selectOption('disabled')
    assert.equal(await action.isDisabled(), true)
    await state.selectOption('invalid')
    assert.equal(
      await canvas.getByRole('textbox', { name: 'Project name' }).getAttribute('aria-invalid'),
      'true'
    )
    await state.selectOption('rest')
    await canvas.getByRole('button', { name: 'Inspect overlay' }).click()
    await canvas.getByRole('dialog', { name: 'Review the surface' }).waitFor()
    await page.keyboard.press('Escape')
    await canvas.getByRole('dialog', { name: 'Review the surface' }).waitFor({ state: 'hidden' })
    assert.equal(
      await canvas
        .getByRole('button', { name: 'Inspect overlay' })
        .evaluate(node => node === document.activeElement),
      true
    )
    const siteMode = await page.locator('.site-theme').getAttribute('data-docs-mode')
    for (const next of ['light', 'dark', 'system']) {
      await mode.selectOption(next)
      assert.equal(await canvas.getAttribute('data-rad-mode'), next)
    }
    assert.equal(await page.locator('.site-theme').getAttribute('data-docs-mode'), siteMode)
    await frame.getByRole('button', { name: 'Reset specimen', exact: true }).click()
    assert.equal(await count.innerText(), 'Action activated 0 times.')
    await specimen.selectOption('form')
    assert.equal(
      await form.getByRole('textbox', { name: 'Display name' }).inputValue(),
      'Workshop Ada'
    )
    await specimen.selectOption('dashboard')
    assert.equal(
      await canvas.getByRole('textbox', { name: 'Filter projects' }).inputValue(),
      'Design'
    )

    for (const viewport of [390, 320]) {
      await page.setViewportSize({ width: viewport, height: 844 })
      for (const name of ['article', 'form', 'dashboard', 'landing', 'components']) {
        await specimen.selectOption(name)
        await width.selectOption('phone')
        for (const next of ['light', 'dark']) {
          await mode.selectOption(next)
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            true,
            `${viewport}-${name}-${next}: page overflow`
          )
        }
      }
      await specimen.selectOption('dashboard')
      const table = canvas.getByRole('region', { name: 'Team activity' })
      await table.focus()
      await page.keyboard.press('ArrowRight')
      await page.waitForFunction(
        () => document.querySelector('.workshop-table-scroll').scrollLeft > 0
      )
      assert.ok(
        await table.evaluate(node => node.scrollLeft > 0),
        'table scrolls from the keyboard'
      )
      await page.screenshot({ path: `output/docs/workshop-${viewport}.png`, fullPage: true })
    }
    await page.setViewportSize({ width: 1280, height: 1000 })
    await width.selectOption('full')
    await mode.selectOption('light')
    await specimen.selectOption('article')
    await page.screenshot({ path: 'output/docs/workshop-desktop.png', fullPage: true })
    const disclosure = frame.locator('.demo-sources > summary')
    await disclosure.focus()
    await disclosure.press('Enter')
    for (const file of [
      'workshop/ThemeWorkshop.tsx',
      'workshop/workshop-theme.ts',
      'workshop/TypographyProofs.tsx',
      'workshop/ProofPages.tsx',
      'workshop/proof-content.ts',
      'workshop/typography-proofs.css',
      'workshop/TypographyEditor.tsx',
      'workshop/workshop-typography.ts',
      'workshop/typography-editor.css',
      'workshop/FontEditor.tsx',
      'workshop/workshop-fonts.ts',
      'workshop/font-runtime.ts',
      'workshop/font-editor.css',
      'workshop/workshop-color.ts',
      'workshop/ColorEditor.tsx',
      'workshop/color-editor.css',
      'workshop/GeometryEditor.tsx',
      'workshop/workshop-geometry.ts',
      'workshop/geometry-editor.css',
      'workshop/ThemeHandoff.tsx',
      'workshop/workshop-handoff.ts',
      'workshop/workshop-share.ts',
      'workshop/theme-handoff.css',
      'workshop/Specimens.tsx',
      'workshop/workshop.css',
      'profile/NativeProfileForm.tsx',
      'profile/profile.ts',
      'profile/useHydrated.ts',
      'profile/profile-form.css'
    ]) {
      const actual = await readFile(new URL(`../examples/${file}`, import.meta.url), 'utf8')
      assert.equal(await frame.getByLabel(`Source: ${file}`, { exact: true }).textContent(), actual)
    }
    await frame.getByRole('button', { name: 'Copy workshop/Specimens.tsx', exact: true }).click()
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      await readFile(new URL('../examples/workshop/Specimens.tsx', import.meta.url), 'utf8')
    )
    const reset = frame.getByRole('button', { name: 'Reset preview', exact: true })
    await reset.focus()
    await reset.press('Enter')
    assert.equal(await reset.evaluate(node => node === document.activeElement), true)
    assert.equal(await frame.locator('.demo-sources').getAttribute('open'), '')
    assert.equal(await specimen.inputValue(), 'article')
    await specimen.selectOption('form')
    assert.notEqual(
      await form.getByRole('textbox', { name: 'Display name' }).inputValue(),
      'Workshop Ada'
    )
    await page.reload()
    await page.getByRole('heading', { name: 'Make room for the useful things.' }).waitFor()
    assert.deepEqual(errors, [], 'no workshop hydration/runtime/asset errors')
    console.log(
      `Workshop passed: ${editable ? 'installed document editing and section resets' : 'published read-only inspection'}, five isolated specimens, mode/viewport/state inspection, keyboard modal/table/reset, actual copied source, static/direct loads and 320px/390px layouts.`
    )
  } catch (error) {
    await page
      .screenshot({ path: 'output/docs/workshop-failure.png', fullPage: true })
      .catch(() => {})
    throw error
  } finally {
    await context.close()
  }
}
