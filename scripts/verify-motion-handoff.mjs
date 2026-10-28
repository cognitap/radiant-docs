import assert from 'node:assert/strict'
import { readFile, mkdir } from 'node:fs/promises'
import { handoffAPI, jsonText } from '../examples/workshop/workshop-handoff.ts'
import { encodeShare } from '../examples/workshop/workshop-share.ts'

export async function verifyMotionHandoff(browser, baseURL) {
  const context = await browser.newContext({
    permissions: ['clipboard-read', 'clipboard-write'],
    reducedMotion: 'reduce'
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  try {
    await page.goto(`${baseURL}/workshop/`)
    const workshop = page.locator('.theme-workshop')
    const handoff = workshop.locator('.theme-handoff')
    await page.waitForFunction(() => !document.querySelector('.preview-toolbar button').disabled)
    await workshop.getByRole('button', { name: 'Motion', exact: true }).click()
    const editor = workshop.locator('.motion-editor')
    await editor.getByRole('spinbutton', { name: 'Stiffness', exact: true }).fill('450')
    await editor.getByRole('combobox', { name: 'Profile scope' }).selectOption('layout')
    await editor.getByRole('spinbutton', { name: 'Damping', exact: true }).fill('25')
    await editor.getByRole('combobox', { name: 'Theme motion' }).selectOption('off')
    await handoff.getByText('Reusable configuration JSON', { exact: true }).click()
    const configField = handoff.getByRole('textbox', { name: 'Configuration output', exact: true })
    /** The outputs follow theme changes at low priority; read them once they have caught up. */
    const settled = () =>
      page.waitForFunction(() => !document.querySelector('.theme-handoff[data-settling]'))
    await settled()
    const config = JSON.parse(await configField.inputValue())
    assert.equal(config.document.sections.motion.profile.mode, 'off')
    await handoff.getByText('Motion only · typed configuration', { exact: true }).click()
    const typed = handoff.getByRole('textbox', { name: 'Motion TypeScript output', exact: true })
    assert.equal(await typed.inputValue(), handoffAPI.typedTheme(config.document, ['motion']))
    async function copied(button, text, feedback) {
      const action = handoff.getByRole('button', { name: button, exact: true })
      await action.focus()
      await action.press('Enter')
      await page.waitForFunction(
        message => document.querySelector('.handoff-feedback').textContent === message,
        feedback
      )
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), text)
      assert.equal(await action.evaluate(node => node === document.activeElement), true)
    }
    await copied('Copy motion TypeScript', await typed.inputValue(), 'Motion typed theme copied.')
    async function downloaded(button, name, text) {
      const pending = page.waitForEvent('download')
      await handoff.getByRole('button', { name: button, exact: true }).click()
      const file = await pending
      assert.equal(file.suggestedFilename(), name)
      assert.equal(await readFile(await file.path(), 'utf8'), text)
    }
    await downloaded('Download motion TypeScript', 'radiant-motion.ts', await typed.inputValue())
    await handoff.getByText('Required setup and fonts', { exact: true }).click()
    const setup = handoffAPI.runtimeSetup()
    assert.equal(
      await handoff.getByRole('textbox', { name: 'Install command', exact: true }).inputValue(),
      setup.install
    )
    assert.equal(
      await handoff
        .getByRole('textbox', { name: 'Runtime setup TypeScript output', exact: true })
        .inputValue(),
      setup.source
    )
    await copied('Copy install command', setup.install, 'Install command copied.')
    await copied('Copy runtime setup', setup.source, 'Runtime setup copied.')
    await downloaded('Download runtime setup', 'RadiantMotion.tsx', setup.source)
    await handoff.getByText('Selective section JSON', { exact: true }).click()
    for (const box of await handoff.locator('.handoff-sections input').all()) await box.uncheck()
    await handoff.getByRole('checkbox', { name: 'motion', exact: true }).check()
    const section = await handoff
      .getByRole('textbox', { name: 'Section output', exact: true })
      .inputValue()
    assert.equal(section, jsonText(handoffAPI.sections(config.document, ['motion'])))
    await copied('Copy sections', section, 'Sections copied.')
    await workshop.getByRole('button', { name: 'Reset motion', exact: true }).click()
    const input = handoff.getByRole('textbox', { name: 'Configuration JSON', exact: true })
    await input.fill(section)
    await handoff.getByRole('combobox', { name: 'Section apply mode' }).selectOption('replace')
    await handoff.getByRole('button', { name: 'Import JSON', exact: true }).click()
    await page.waitForFunction(
      () => document.querySelector('.motion-editor').dataset.motionMode === 'off'
    )
    await settled()
    assert.equal(
      await configField.inputValue(),
      jsonText(config),
      'selective motion restore preserves unrelated authoring'
    )
    await handoff.getByRole('button', { name: 'Copy share link', exact: true }).click()
    const linkField = handoff.getByRole('textbox', { name: 'Share link', exact: true })
    await page.waitForFunction(() =>
      document.querySelector('.theme-handoff input[readonly]').value.includes('#workshop=')
    )
    const link = await linkField.inputValue()
    const shared = await context.newPage()
    await shared.goto(link)
    await shared
      .locator('.theme-workshop')
      .getByRole('button', { name: 'Motion', exact: true })
      .click()
    await shared.waitForFunction(
      () => document.querySelector('.motion-editor').dataset.motionMode === 'off'
    )
    await shared.getByText('Reusable configuration JSON', { exact: true }).click()
    assert.equal(
      await shared.getByRole('textbox', { name: 'Configuration output', exact: true }).inputValue(),
      jsonText(config)
    )
    const invalid = structuredClone(config)
    invalid.document.sections.motion.profile.mode = 'always'
    await input.fill(jsonText(invalid))
    await handoff.getByRole('button', { name: 'Import JSON', exact: true }).click()
    await handoff.locator('.handoff-import-error').waitFor()
    await settled()
    assert.equal(await configField.inputValue(), jsonText(config))
    const badLink = `${baseURL}/workshop/#workshop=${await encodeShare(jsonText(invalid))}`
    await shared.goto(badLink)
    await shared.locator('.handoff-import-error').waitFor()
    const summary = shared.getByText('Reusable configuration JSON', { exact: true })
    if (!(await summary.evaluate(node => node.parentElement.open))) await summary.click()
    assert.notEqual(
      await shared.getByRole('textbox', { name: 'Configuration output', exact: true }).inputValue(),
      jsonText(invalid)
    )
    await editor.getByRole('combobox', { name: 'Theme motion' }).selectOption('system')
    await settled()
    assert.equal(
      JSON.parse(await configField.inputValue()).document.sections.motion.profile.mode,
      'system',
      'OS preference never becomes authored off'
    )
    await shared.close()
    await mkdir('output/docs', { recursive: true })
    const motionDetails = handoff
      .getByText('Motion only · typed configuration', { exact: true })
      .locator('..')
    await motionDetails.screenshot({ path: 'output/docs/motion-handoff-section.png' })
    await handoff.screenshot({ path: 'output/docs/motion-handoff-desktop.png' })
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 900 })
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `${width}px page has no overflow`
      )
      await handoff.screenshot({ path: `output/docs/motion-handoff-${width}.png` })
      await motionDetails.screenshot({ path: `output/docs/motion-handoff-section-${width}.png` })
    }
    assert.deepEqual(errors, [])
    console.log(
      'Motion handoff passed: exact typed/configuration/section/download/copy/link output, profile defaults/off/overrides, selective restoration, invalid imports/shares, OS preference isolation and narrow layouts.'
    )
  } finally {
    await context.close()
  }
}
