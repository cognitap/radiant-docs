import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { radiantPackage } from './radiant-package.mjs'
import { handoffFixture } from './handoff-fixture.mjs'
import { handoffAPI, jsonText } from '../examples/workshop/workshop-handoff.ts'

export async function verifyHandoff(browser, baseURL) {
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
    const handoff = frame.getByRole('region', { name: 'Theme handoff', exact: true })
    const field = label => handoff.getByRole('textbox', { name: label, exact: true })
    const canvas = frame.locator('.workshop-canvas')
    const variable = key =>
      canvas.evaluate((node, key) => getComputedStyle(node).getPropertyValue(key).trim(), key)
    await page.waitForFunction(
      () => !document.querySelector('.theme-workshop .demo-controls button').disabled
    )
    if (!radiantPackage.candidate) {
      assert.equal(
        await handoff.getByRole('button', { name: 'Copy typed theme', exact: true }).isDisabled(),
        true
      )
      assert.equal(await field('Configuration JSON').isDisabled(), true)
      console.log(
        'Handoff: published pin explicitly unavailable; no substituted compiler or exports.'
      )
      return
    }
    await handoff.getByText('Reusable configuration JSON', { exact: true }).click()
    const baseline = await field('Configuration output').inputValue()
    assert.equal(JSON.parse(baseline).kind, 'radiant-workshop')
    const typed = await field('Typed theme output').inputValue()
    const copy = handoff.getByRole('button', { name: 'Copy typed theme', exact: true })
    await copy.focus()
    await copy.press('Enter')
    await page.waitForFunction(
      () => document.querySelector('.handoff-feedback').textContent === 'Typed theme copied.'
    )
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), typed)
    assert.equal(await copy.evaluate(node => node === document.activeElement), true)
    const download = page.waitForEvent('download')
    await handoff.getByRole('button', { name: 'Download configuration', exact: true }).click()
    const file = await download
    assert.equal(file.suggestedFilename(), 'radiant-workshop.json')
    assert.equal(await readFile(await file.path(), 'utf8'), baseline)
    await file.delete()
    await frame.getByRole('combobox', { name: 'Specimen', exact: true }).selectOption('form')
    await canvas.getByRole('textbox', { name: 'Display name' }).fill('Private Ada')
    const config = handoffAPI.configuration(
      ...(() => {
        const { document, recipes } = handoffFixture()
        return [document, recipes]
      })()
    )
    const text = jsonText(config)
    const input = field('Configuration JSON')
    const apply = handoff.getByRole('button', { name: 'Import JSON', exact: true })
    await input.fill(text)
    await apply.click()
    await page.waitForFunction(() =>
      document
        .querySelector('.handoff-import-result')
        ?.textContent.includes('Configuration restored')
    )
    assert.equal(await field('Configuration output').inputValue(), text)
    assert.equal(
      await canvas.getByRole('textbox', { name: 'Display name' }).inputValue(),
      'Private Ada'
    )
    assert.equal(await variable('--rad-button-radius'), '27px')
    assert.equal(await variable('--rad-motion-release-duration'), '237ms')
    await frame.getByRole('button', { name: 'Typography', exact: true }).click()
    assert.equal(
      await frame.getByRole('combobox', { name: 'Body family', exact: true }).inputValue(),
      '"Local Display", serif'
    )
    await frame.getByRole('button', { name: 'Color', exact: true }).click()
    assert.equal(
      await frame.getByRole('combobox', { name: 'Brand fidelity', exact: true }).inputValue(),
      'unanchored'
    )
    await frame.getByRole('button', { name: 'Spacing & surfaces', exact: true }).click()
    assert.equal(
      await frame.getByRole('combobox', { name: 'Starting preset', exact: true }).inputValue(),
      'custom'
    )
    await handoff.getByText('Required setup and fonts', { exact: true }).click()
    assert.ok(
      (await handoff.locator('.handoff-setup').innerText()).includes(
        'Local Display · local · weights 400, 700'
      )
    )
    await handoff.getByRole('button', { name: 'Copy share link', exact: true }).click()
    await page.waitForFunction(() =>
      document.querySelector('.handoff-feedback').textContent.startsWith('Share link copied.')
    )
    const link = await field('Share link').inputValue()
    assert.ok(link.startsWith(`${baseURL}/docs/workshop/#workshop=1.`))
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), link)
    const shared = await context.newPage()
    try {
      await shared.goto(link)
      await shared.getByText('Reusable configuration JSON', { exact: true }).click()
      const exported = shared.getByRole('textbox', { name: 'Configuration output', exact: true })
      await shared.waitForFunction(() =>
        document.querySelector('.theme-handoff textarea[readonly]')?.value.includes('handoff-proof')
      )
      assert.equal(await exported.inputValue(), text)
      await shared.reload()
      await shared.getByText('Reusable configuration JSON', { exact: true }).click()
      await shared.waitForFunction(() =>
        document.querySelector('.theme-handoff textarea[readonly]')?.value.includes('handoff-proof')
      )
      assert.equal(await exported.inputValue(), text)
      await shared.getByRole('button', { name: 'Reset preview', exact: true }).click()
      await shared.waitForFunction(() => window.location.hash === '')
      await shared.getByText('Reusable configuration JSON', { exact: true }).click()
      assert.equal(JSON.parse(await exported.inputValue()).document.id, 'workshop')
    } finally {
      await shared.close()
    }
    assert.equal(
      JSON.parse(await field('Configuration output').inputValue()).document.id,
      'handoff-proof'
    )
    await input.fill('{ broken')
    await apply.click()
    assert.ok((await handoff.locator('.handoff-import-error').innerText()).includes('Invalid JSON'))
    assert.equal(await handoff.getByRole('status').filter({ hasText: 'Invalid JSON' }).count(), 1)
    assert.equal(
      await handoff.locator('.handoff-import-error').getAttribute('id'),
      await input.getAttribute('aria-describedby')
    )
    assert.equal(await field('Configuration output').inputValue(), text)
    await input.fill(jsonText({ ...config, version: 99 }))
    await apply.click()
    assert.ok((await handoff.locator('.handoff-import-error').innerText()).includes('version'))
    assert.equal(await field('Configuration output').inputValue(), text)
    await frame.getByRole('button', { name: 'Typography', exact: true }).click()
    await frame
      .getByRole('combobox', { name: 'Body family', exact: true })
      .selectOption('system-ui, sans-serif')
    assert.notEqual(await field('Configuration output').inputValue(), text)
    await handoff.getByLabel('Import configuration file', { exact: true }).setInputFiles({
      name: 'saved.json',
      mimeType: 'application/json',
      buffer: Buffer.from(text)
    })
    await page.waitForFunction(
      expected =>
        [...document.querySelectorAll('.theme-handoff label')]
          .find(label => label.textContent.trim().startsWith('Configuration output'))
          ?.querySelector('textarea')?.value === expected,
      text
    )
    assert.equal(await field('Configuration output').inputValue(), text)
    await handoff.getByLabel('Import configuration file', { exact: true }).setInputFiles({
      name: 'too-large.json',
      mimeType: 'application/json',
      buffer: Buffer.alloc(262145, 120)
    })
    await page.waitForFunction(() =>
      document.querySelector('.handoff-import-error')?.textContent.includes('256 KiB')
    )
    const partial = {
      kind: 'radiant-theme-sections',
      version: 1,
      sections: { typography: { values: { bodySize: '1.125rem' } } }
    }
    await input.fill(jsonText(partial))
    await apply.click()
    let current = JSON.parse(await field('Configuration output').inputValue())
    assert.equal(current.document.sections.typography.values.family, '"Local Display", serif')
    assert.deepEqual(current.document.sections.components, config.document.sections.components)
    assert.deepEqual(current.recipes, config.recipes)
    await handoff
      .getByRole('combobox', { name: 'Section apply mode', exact: true })
      .selectOption('replace')
    await apply.click()
    current = JSON.parse(await field('Configuration output').inputValue())
    assert.deepEqual(current.document.sections.typography, partial.sections.typography)
    assert.deepEqual(current.document.sections.components, config.document.sections.components)
    await input.fill(jsonText(config.document))
    await apply.click()
    assert.deepEqual(JSON.parse(await field('Configuration output').inputValue()).recipes, {})
    await frame.getByRole('button', { name: 'Color', exact: true }).click()
    assert.equal(
      await frame.locator('.theme-workshop').getAttribute('data-workshop-color'),
      'imported'
    )
    assert.equal(await variable('--rad-button-radius'), '27px')
    await frame.getByRole('button', { name: 'Spacing & surfaces', exact: true }).click()
    assert.ok((await frame.locator('.geometry-editor').innerText()).includes('Imported spacing'))
    await frame.getByRole('button', { name: 'Reset spacing & surfaces', exact: true }).click()
    assert.equal(await variable('--rad-surface-radius'), '12px')
    assert.equal(await variable('--rad-button-radius'), '27px')
    await frame.getByRole('button', { name: 'Color', exact: true }).click()
    await frame.getByRole('button', { name: 'Reset color', exact: true }).click()
    assert.equal(
      await frame.getByRole('textbox', { name: 'Brand color', exact: true }).inputValue(),
      '#7C3AED'
    )
    assert.equal(await variable('--rad-button-radius'), '27px')
    await handoff.getByText('Selective section JSON', { exact: true }).click()
    const selected = JSON.parse(await field('Section output').inputValue())
    assert.deepEqual(Object.keys(selected.sections).sort(), [
      'color',
      'control',
      'spacing',
      'surface'
    ])
    await handoff.getByRole('checkbox', { name: 'components', exact: true }).check()
    assert.deepEqual(
      JSON.parse(await field('Section output').inputValue()).sections.components,
      config.document.sections.components
    )
    await handoff.getByRole('button', { name: 'Copy sections', exact: true }).click()
    await page.waitForFunction(
      () => document.querySelector('.handoff-feedback').textContent === 'Sections copied.'
    )
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      await field('Section output').inputValue()
    )
    await handoff.getByText('Scoped CSS · full theme', { exact: true }).click()
    await handoff.getByRole('button', { name: 'Copy CSS', exact: true }).click()
    await page.waitForFunction(
      () => document.querySelector('.handoff-feedback').textContent === 'CSS copied.'
    )
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      await field('CSS output').inputValue()
    )
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 })
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `${width}: handoff overflow`
      )
      await field('Typed theme output').focus()
      await page.keyboard.press('ArrowRight')
      assert.equal(
        await field('Typed theme output').evaluate(node => node === document.activeElement),
        true
      )
      await page.screenshot({ path: `output/docs/handoff-${width}.png`, fullPage: true })
    }
    assert.deepEqual(errors, [], 'no handoff runtime/hydration errors')
    const blocked = await context.newPage()
    try {
      await blocked.addInitScript(() =>
        Object.defineProperty(navigator, 'clipboard', {
          value: {
            writeText: async () => {
              throw new Error('Blocked')
            }
          }
        })
      )
      await blocked.goto(`${baseURL}/docs/workshop/`)
      await blocked.getByRole('button', { name: 'Copy typed theme', exact: true }).click()
      await blocked.waitForFunction(() =>
        document.querySelector('.handoff-feedback').textContent.startsWith('Copy failed.')
      )
      assert.ok(
        (
          await blocked
            .getByRole('textbox', { name: 'Typed theme output', exact: true })
            .inputValue()
        ).includes('satisfies ThemeDocument')
      )
      await blocked.getByRole('button', { name: 'Copy share link', exact: true }).click()
      await blocked.waitForFunction(() =>
        document.querySelector('.theme-handoff input[readonly]').value.includes('#workshop=1.')
      )
      await blocked.goto(`${baseURL}/docs/workshop/#workshop=2.invalid`)
      await blocked.waitForFunction(() =>
        document.querySelector('.handoff-import-error')?.textContent.includes('unsupported')
      )
      assert.equal(
        await blocked.getByRole('textbox', { name: 'Brand color', exact: true }).inputValue(),
        '#7C3AED'
      )
    } finally {
      await blocked.close()
    }
    console.log(
      'Handoff UI passed: exact typed/configuration/section/CSS copies, download/file import, full and partial policies, share/reload/reset, fonts, preserved exceptions and private form state, failures, imported recipe-free sections, keyboard and mobile layouts.'
    )
  } catch (error) {
    await page
      .screenshot({ path: 'output/docs/handoff-failure.png', fullPage: true })
      .catch(() => {})
    throw error
  } finally {
    await context.close()
  }
}
