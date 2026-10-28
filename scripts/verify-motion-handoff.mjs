import assert from 'node:assert/strict'
import { readFile, mkdir } from 'node:fs/promises'
import { handoffAPI, jsonText } from '../examples/workshop/workshop-handoff.ts'
import { encodeShare } from '../examples/workshop/workshop-share.ts'
import { pickRadio } from './typography-controls.mjs'
import { chooseSetup, copyShareLink, openFormat, openWorkshop } from './workshop-entry.mjs'

export async function verifyMotionHandoff(browser, baseURL) {
  const context = await browser.newContext({
    permissions: ['clipboard-read', 'clipboard-write'],
    reducedMotion: 'reduce'
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  try {
    await openWorkshop(page, baseURL)
    const workshop = page.locator('.theme-workshop')
    const handoff = workshop.locator('.theme-handoff')
    await page.waitForFunction(() => !document.querySelector('.preview-toolbar button').disabled)
    await workshop.getByRole('button', { name: 'Motion', exact: true }).click()
    const editor = workshop.locator('.motion-editor')
    await editor.getByRole('spinbutton', { name: 'Stiffness', exact: true }).fill('450')
    await pickRadio(editor, 'Physics for', 'layout')
    await editor.getByRole('spinbutton', { name: 'Damping', exact: true }).fill('25')
    await pickRadio(editor, 'Theme motion', 'off')
    await chooseSetup(page, 'React')
    await openFormat(page, 'Configuration file')
    const configField = handoff.getByRole('textbox', { name: 'Configuration output', exact: true })
    /** The outputs follow theme changes at low priority; read them once they have caught up. */
    const settled = () =>
      page.waitForFunction(() => !document.querySelector('.theme-handoff[data-settling]'))
    await settled()
    const config = JSON.parse(await configField.inputValue())
    assert.equal(config.document.sections.motion.profile.mode, 'off')
    await openFormat(page, 'Motion only')
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
    await copied('Copy motion TypeScript', await typed.inputValue(), 'Motion TypeScript copied.')
    async function downloaded(button, name, text) {
      const pending = page.waitForEvent('download')
      await handoff.getByRole('button', { name: button, exact: true }).click()
      const file = await pending
      assert.equal(file.suggestedFilename(), name)
      assert.equal(await readFile(await file.path(), 'utf8'), text)
    }
    await downloaded('Download motion TypeScript', 'radiant-motion.ts', await typed.inputValue())
    const setup = handoffAPI.runtimeSetup()
    assert.equal(
      await handoff.getByRole('textbox', { name: 'Install command', exact: true }).inputValue(),
      setup.install
    )
    assert.doesNotMatch(
      await handoff.getByRole('textbox', { name: 'Theme scope', exact: true }).inputValue(),
      /MotionProvider/,
      'a theme with motion off needs ThemeScope alone'
    )
    assert.equal(await handoff.getByRole('textbox', { name: 'Runtime setup' }).count(), 0)
    await copied('Copy install command', setup.install, 'Install command copied.')
    await openFormat(page, 'Selective sections')
    for (const box of await handoff.locator('.handoff-sections input').all()) await box.uncheck()
    await handoff.getByRole('checkbox', { name: 'motion', exact: true }).check()
    const section = await handoff
      .getByRole('textbox', { name: 'Section output', exact: true })
      .inputValue()
    assert.equal(section, jsonText(handoffAPI.sections(config.document, ['motion'])))
    await copied('Copy sections', section, 'Sections copied.')
    await workshop.getByRole('button', { name: 'Reset motion', exact: true }).click()
    await openFormat(page, 'Import')
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
    const link = await copyShareLink(page)
    const shared = await context.newPage()
    await shared.goto(link)
    await shared
      .locator('.theme-workshop')
      .getByRole('button', { name: 'Motion', exact: true })
      .click()
    await shared.waitForFunction(
      () => document.querySelector('.motion-editor').dataset.motionMode === 'off'
    )
    await openFormat(shared, 'Configuration file')
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
    const bad = await context.newPage()
    await bad.goto(badLink)
    await bad.locator('.start-message[data-start-error]').waitFor()
    assert.equal(
      await bad.locator('.theme-handoff').count(),
      0,
      'an invalid link never opens editors'
    )
    await bad.close()
    await pickRadio(editor, 'Theme motion', 'system')
    await settled()
    assert.equal(
      JSON.parse(await configField.inputValue()).document.sections.motion.profile.mode,
      'system',
      'OS preference never becomes authored off'
    )
    assert.equal(
      await handoff.getByRole('textbox', { name: 'Runtime setup', exact: true }).inputValue(),
      setup.source,
      'spring motion brings the MotionProvider setup back'
    )
    await copied('Copy runtime setup', setup.source, 'Runtime setup copied.')
    await shared.close()
    await mkdir('output/docs', { recursive: true })
    const motionDetails = handoff
      .locator('.handoff-format')
      .filter({ has: page.getByText('Motion only', { exact: true }) })
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
