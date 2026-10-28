import { updateThemeDocument } from '@cognitap/radiant'
import assert from 'node:assert/strict'
import { pickRadio } from './typography-controls.mjs'
import { readFile } from 'node:fs/promises'
import { handoffFixture } from './handoff-fixture.mjs'
import { handoffAPI, jsonText } from '../examples/workshop/workshop-handoff.ts'
import { setupGuide, setups } from '../examples/workshop/workshop-setup.ts'
import {
  chooseSetup,
  copyShareLink,
  enterWorkshop,
  openFormat,
  openWorkshop,
  waitForEditors
} from './workshop-entry.mjs'

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
    await openWorkshop(page, baseURL)
    const frame = page.getByRole('region', { name: 'Shared theme workshop', exact: true })
    const handoff = frame.getByRole('region', { name: 'Theme handoff', exact: true })
    const field = label => handoff.getByRole('textbox', { name: label, exact: true })
    const button = name => handoff.getByRole('button', { name, exact: true })
    /** The outputs follow theme changes at low priority; read them once they have caught up. */
    const settled = () =>
      page.waitForFunction(() => !document.querySelector('.theme-handoff[data-settling]'))
    const feedback = message =>
      page.waitForFunction(
        message => document.querySelector('.handoff-feedback').textContent === message,
        message
      )
    const clipboard = () => page.evaluate(() => navigator.clipboard.readText())
    const canvas = frame.locator('.preview-page').first()
    const variable = key =>
      canvas.evaluate((node, key) => getComputedStyle(node).getPropertyValue(key).trim(), key)
    async function copied(name, text, message) {
      const action = button(name)
      await action.focus()
      await action.press('Enter')
      await feedback(message)
      assert.equal(await clipboard(), text)
      assert.equal(await action.evaluate(node => node === document.activeElement), true)
    }
    async function downloaded(name, filename, text) {
      const pending = page.waitForEvent('download')
      await button(name).click()
      const file = await pending
      assert.equal(file.suggestedFilename(), filename)
      assert.equal(await readFile(await file.path(), 'utf8'), text)
      await file.delete()
    }
    await page.waitForFunction(() => !document.querySelector('.preview-toolbar button').disabled)
    const useTheme = frame.getByRole('button', { name: 'Use this theme', exact: true })
    await useTheme.click()
    assert.equal(
      await page.evaluate(() => document.activeElement?.textContent),
      'Use your theme',
      'Use this theme hands focus to the export heading'
    )
    assert.ok(
      await handoff.evaluate(node => node.getBoundingClientRect().top < innerHeight),
      'the export area is in view'
    )
    await chooseSetup(page, 'React')
    await openFormat(page, 'Configuration file')
    const baseline = await field('Configuration output').inputValue()
    assert.equal(JSON.parse(baseline).kind, 'radiant-workshop')
    const typed = await field('Typed theme output').inputValue()
    await copied('Copy typed theme', typed, 'Typed theme copied.')
    await downloaded('Download typed theme', 'radiant-theme.ts', typed)

    const document = handoffAPI.read(baseline).document
    for (const setup of setups) {
      await chooseSetup(page, setup.label)
      const guide = setupGuide(setup.id, document)
      assert.equal(await field(`${guide.output.label} output`).inputValue(), guide.output.text)
      assert.deepEqual(
        await handoff.locator('.handoff-steps > li > p').allInnerTexts(),
        guide.steps.map(step => step.text),
        `${setup.id}: the numbered steps`
      )
      for (const step of guide.steps)
        if (step.code !== undefined)
          assert.equal(
            await field(step.label).inputValue(),
            step.code,
            `${setup.id}: ${step.label}`
          )
      assert.equal(
        await handoff
          .locator('.handoff-format > summary')
          .allInnerTexts()
          .then(names => names.at(-2)),
        setup.id === 'react' ? 'Scoped CSS' : 'Typed theme',
        `${setup.id}: the other route sits under Other formats`
      )
    }
    const css = await field('Theme CSS output').inputValue()
    assert.equal(css, handoffAPI.cssOutput(document))
    await copied('Copy theme CSS', css, 'Theme CSS copied.')
    await downloaded('Download theme CSS', 'radiant-theme.css', css)
    await copied(
      'Copy install command',
      handoffAPI.installCommand(false),
      'Install command copied.'
    )
    assert.ok(
      (await handoff.locator('.handoff-steps').innerText()).includes(
        'Spring profiles need the React runtime'
      ),
      'CSS and Tailwind say that springs need the runtime'
    )
    await page.reload()
    await enterWorkshop(page)
    assert.equal(
      await page.getByRole('radio', { name: 'Tailwind', exact: true }).isChecked(),
      true,
      'the last choice is remembered after a reload'
    )
    await chooseSetup(page, 'React')

    const expand = handoff.locator('.handoff-output .handoff-expand').first()
    assert.equal(await expand.getAttribute('aria-expanded'), 'false')
    const collapsedRows = await field('Typed theme output').getAttribute('rows')
    await expand.click()
    assert.ok(
      Number(await field('Typed theme output').getAttribute('rows')) > Number(collapsedRows),
      'Expand shows the whole output'
    )
    await expand.click()
    assert.equal(await field('Typed theme output').getAttribute('rows'), collapsedRows)

    await openFormat(page, 'Typography only')
    for (const [name, output, message] of [
      [
        'Copy typography TypeScript',
        'Typography TypeScript output',
        'Typography TypeScript copied.'
      ],
      ['Copy typography CSS', 'Typography CSS output', 'Typography CSS copied.']
    ])
      await copied(name, await field(output).inputValue(), message)
    assert.doesNotMatch(
      await field('Typography CSS output').inputValue(),
      /--rad-(?:color|control|surface|motion|button)-/
    )
    const setup = await field('Font setup CSS').inputValue()
    await copied('Copy font setup CSS', setup, 'Font setup CSS copied.')
    assert.doesNotMatch(setup, /blob:|data:|base64/)
    await openFormat(page, 'Configuration file')
    await downloaded('Download configuration', 'radiant-workshop.json', baseline)
    await frame.getByRole('combobox', { name: 'Scene', exact: true }).selectOption('page:form')
    await canvas.getByRole('textbox', { name: 'Name shown to collaborators' }).fill('Private Ada')
    const config = handoffAPI.configuration(
      ...(() => {
        const { document, recipes } = handoffFixture()
        return [document, recipes]
      })()
    )
    const text = jsonText(config)
    await openFormat(page, 'Import')
    const input = field('Configuration JSON')
    const apply = button('Import JSON')
    await input.fill(text)
    await apply.click()
    await settled()
    await page.waitForFunction(() =>
      document
        .querySelector('.handoff-import-result')
        ?.textContent.includes('Configuration restored')
    )
    assert.equal(await field('Configuration output').inputValue(), text)
    assert.equal(
      await canvas.getByRole('textbox', { name: 'Name shown to collaborators' }).inputValue(),
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
    const checked = (scope, group) =>
      scope
        .getByRole('group', { name: group, exact: true })
        .locator('input:checked')
        .getAttribute('value')
    assert.equal(await checked(frame, 'Brand fidelity'), 'unanchored')
    assert.equal(await checked(frame, 'Wall preset'), 'expressive')
    assert.equal(await checked(frame, 'Brand ramp preset'), 'classic')
    await frame.getByRole('button', { name: 'Spacing & surfaces', exact: true }).click()
    assert.equal(
      await frame
        .locator('[role="radiogroup"][aria-label="Starting preset"] input:checked')
        .count(),
      0,
      'no preset card is picked for imported geometry'
    )
    const families = await handoff.locator('.handoff-fonts li strong').allInnerTexts()
    assert.equal(new Set(families).size, families.length, 'each font family is listed once')
    assert.doesNotMatch(
      await handoff.locator('.handoff-fonts').innerText(),
      /Available axes|Trial-only/,
      'the font step omits axes and trial notes'
    )
    assert.ok(
      (await handoff.locator('.handoff-fonts').innerText()).includes(
        'Local Display · local · 400, 700'
      )
    )

    const share = frame.getByRole('button', { name: 'Share', exact: true })
    const popover = page.getByRole('dialog', { name: 'Share link', exact: true })
    await share.focus()
    await page.keyboard.press('Enter')
    await popover.getByText('Link copied', { exact: true }).waitFor()
    assert.equal(
      await popover
        .getByRole('textbox', { name: 'Share link', exact: true })
        .evaluate(node => node === document.activeElement),
      true,
      'the popover opens with the link focused'
    )
    const link = await popover
      .getByRole('textbox', { name: 'Share link', exact: true })
      .inputValue()
    assert.ok(link.startsWith(`${baseURL}/workshop/#workshop=1.`))
    assert.equal(await clipboard(), link)
    await page.keyboard.press('Escape')
    await popover.waitFor({ state: 'hidden' })
    assert.equal(
      await share.evaluate(node => node === document.activeElement),
      true,
      'Escape closes the popover and returns focus to Share'
    )
    assert.equal(await handoff.getByRole('textbox', { name: 'Share link' }).count(), 0)
    const shared = await context.newPage()
    try {
      await shared.goto(link)
      await waitForEditors(shared)
      await openFormat(shared, 'Configuration file')
      const exported = shared.getByRole('textbox', { name: 'Configuration output', exact: true })
      await shared.waitForFunction(() =>
        document.querySelector('.theme-handoff textarea[readonly]')?.value.includes('handoff-proof')
      )
      assert.equal(await exported.inputValue(), text)
      assert.equal(await checked(shared, 'Wall preset'), 'expressive')
      assert.equal(await checked(shared, 'Brand ramp preset'), 'classic')
      await shared.reload()
      await waitForEditors(shared)
      await openFormat(shared, 'Configuration file')
      await shared.waitForFunction(() =>
        document.querySelector('.theme-handoff textarea[readonly]')?.value.includes('handoff-proof')
      )
      assert.equal(await exported.inputValue(), text)
      assert.equal(
        await shared.getByRole('button', { name: 'Undo', exact: true }).isDisabled(),
        true,
        'a shared theme opens as the baseline, with nothing to undo'
      )
      assert.equal(await shared.locator('.start-card').count(), 0, 'a share link skips the start')
      assert.equal(await shared.locator('.workshop-nav-count').count(), 0, 'no changed markers')
    } finally {
      await shared.close()
    }
    assert.equal(
      JSON.parse(await field('Configuration output').inputValue()).document.id,
      'handoff-proof'
    )
    await input.fill('{ broken')
    await apply.click()
    await settled()
    assert.ok((await handoff.locator('.handoff-import-error').innerText()).includes('Invalid JSON'))
    assert.equal(await handoff.getByRole('status').filter({ hasText: 'Invalid JSON' }).count(), 1)
    assert.equal(
      await handoff.locator('.handoff-import-error').getAttribute('id'),
      await input.getAttribute('aria-describedby')
    )
    assert.equal(await field('Configuration output').inputValue(), text)
    await input.fill(jsonText({ ...config, version: 99 }))
    await apply.click()
    await settled()
    assert.ok((await handoff.locator('.handoff-import-error').innerText()).includes('version'))
    assert.equal(await field('Configuration output').inputValue(), text)
    await frame.getByRole('button', { name: 'Typography', exact: true }).click()
    await frame
      .getByRole('combobox', { name: 'Body family', exact: true })
      .selectOption('system-ui, sans-serif')
    await settled()
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
    await settled()
    let current = JSON.parse(await field('Configuration output').inputValue())
    assert.equal(current.document.sections.typography.values.family, '"Local Display", serif')
    assert.deepEqual(current.document.sections.components, config.document.sections.components)
    assert.deepEqual(current.recipes, config.recipes)
    await handoff
      .getByRole('combobox', { name: 'Section apply mode', exact: true })
      .selectOption('replace')
    await apply.click()
    await settled()
    current = JSON.parse(await field('Configuration output').inputValue())
    assert.deepEqual(current.document.sections.typography, partial.sections.typography)
    assert.deepEqual(current.document.sections.components, config.document.sections.components)
    await input.fill(jsonText(config.document))
    await apply.click()
    await settled()
    assert.deepEqual(JSON.parse(await field('Configuration output').inputValue()).recipes, {})
    await frame.getByRole('button', { name: 'Color', exact: true }).click()
    assert.equal(
      await frame.locator('.theme-workshop').getAttribute('data-workshop-color'),
      'imported'
    )
    assert.equal(await variable('--rad-button-radius'), '27px')
    await frame.getByRole('button', { name: 'Spacing & surfaces', exact: true }).click()
    assert.ok(
      (await frame.locator('.geometry-editor').innerText()).includes('set by hand and kept exactly')
    )
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
    await openFormat(page, 'Selective sections')
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
    await copied('Copy sections', await field('Section output').inputValue(), 'Sections copied.')
    await openFormat(page, 'Scoped CSS')
    await copied(
      'Copy theme CSS',
      await field('Theme CSS output').inputValue(),
      'Theme CSS copied.'
    )

    const bulky = jsonText(
      handoffAPI.configuration(
        updateThemeDocument(config.document, {
          typography: {
            fonts: Array.from({ length: 1200 }, (_, i) => ({
              id: `f${i}`,
              family: `Family ${((i * 2654435761) >>> 0).toString(36)}${((i * 40503) >>> 0).toString(36)}`,
              source: 'system'
            }))
          }
        }),
        config.recipes
      )
    )
    await handoff.getByLabel('Import configuration file', { exact: true }).setInputFiles({
      name: 'bulky.json',
      mimeType: 'application/json',
      buffer: Buffer.from(bulky)
    })
    await page.waitForFunction(() =>
      document
        .querySelector('.handoff-import-result')
        ?.textContent.includes('Configuration restored')
    )
    await settled()
    assert.equal(await field('Configuration output').inputValue(), bulky)
    await share.click()
    await popover.getByText(/too large for a share link/).waitFor()
    const pendingFile = page.waitForEvent('download')
    await popover.getByRole('button', { name: 'Download configuration', exact: true }).click()
    const file = await pendingFile
    assert.equal(file.suggestedFilename(), 'radiant-workshop.json')
    assert.equal(await readFile(await file.path(), 'utf8'), bulky)
    await file.delete()
    await popover.waitFor({ state: 'hidden' })
    await input.fill(text)
    await apply.click()
    await settled()

    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 })
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `${width}: handoff overflow`
      )
      const escapedActions = await handoff.locator('button:visible').evaluateAll(buttons =>
        buttons
          .filter(button => {
            const rect = button.getBoundingClientRect()
            const parent = button.parentElement.getBoundingClientRect()
            return rect.left < parent.left - 1 || rect.right > parent.right + 1
          })
          .map(button => button.textContent)
      )
      assert.deepEqual(escapedActions, [], `${width}: handoff actions fit their container`)
      await field('Typed theme output').focus()
      await page.keyboard.press('ArrowRight')
      assert.equal(
        await field('Typed theme output').evaluate(node => node === document.activeElement),
        true
      )
      const cards = await handoff
        .locator('.handoff-setup')
        .evaluateAll(nodes => nodes.map(node => Math.round(node.getBoundingClientRect().left)))
      assert.equal(new Set(cards).size, 1, `${width}: the three choices stack`)
      await share.click()
      await popover.getByText('Link copied', { exact: true }).waitFor()
      assert.ok(
        await popover.evaluate(node => {
          const rect = node.getBoundingClientRect()
          return rect.left >= 0 && rect.right <= innerWidth
        }),
        `${width}: the share popover stays within the viewport`
      )
      await page.keyboard.press('Escape')
      await popover.waitFor({ state: 'hidden' })
      await page.screenshot({ path: `output/docs/handoff-${width}.png`, fullPage: true })
    }
    await page.setViewportSize({ width: 1600, height: 1000 })
    const modern = handoffAPI.configuration(
      updateThemeDocument(
        config.document,
        {
          typography: {
            typesetting: {
              preset: 'source-serif',
              fonts: { body: { family: '"Missing brand", serif', profile: 'manual' } },
              prose: { size: 22, lineHeight: 1.75, paragraphSpacing: 1.4 },
              styles: {
                'prose-title': { narrow: 40, wide: 72, weight: 650 },
                'ui-label': { weight: 620 }
              }
            },
            fonts: [
              {
                id: 'typesetting-body',
                family: 'Missing brand',
                source: 'local',
                weights: [400, 650],
                styles: ['normal'],
                axes: [{ tag: 'wght', min: 100, default: 400, max: 900 }]
              }
            ],
            modes: { dark: { roles: { 'ui-caption': { letterSpacing: '0.03em' } } } }
          }
        },
        'replace'
      ),
      config.recipes
    )
    await input.fill(jsonText(modern))
    await apply.click()
    await settled()
    await page.waitForFunction(() =>
      document
        .querySelector('.handoff-import-result')
        ?.textContent.includes('Configuration restored')
    )
    const modernText = await field('Configuration output').inputValue()
    assert.deepEqual(JSON.parse(modernText), modern)
    const modernLink = await copyShareLink(page)
    assert.notEqual(modernLink, link)
    const reopened = await context.newPage()
    try {
      await reopened.goto(modernLink)
      const restored = reopened.locator('.theme-handoff')
      await waitForEditors(reopened)
      await openFormat(reopened, 'Configuration file')
      assert.equal(
        await restored
          .getByRole('textbox', { name: 'Configuration output', exact: true })
          .inputValue(),
        modernText
      )
      await reopened
        .locator('.theme-workshop')
        .getByRole('button', { name: 'Typography', exact: true })
        .click()
      const system = reopened.locator('.typesetting-editor')
      assert.equal(
        await system.getByRole('spinbutton', { name: 'Prose size (px)', exact: true }).inputValue(),
        '22'
      )
      assert.equal(
        await system.getByRole('spinbutton', { name: 'Prose leading', exact: true }).inputValue(),
        '1.75'
      )
      await pickRadio(system, 'Text style', 'prose-title')
      assert.equal(
        await system
          .getByRole('spinbutton', { name: 'Narrow size (px)', exact: true })
          .inputValue(),
        '40'
      )
      assert.equal(
        await system.getByRole('spinbutton', { name: 'Wide size (px)', exact: true }).inputValue(),
        '72'
      )
      assert.match(
        await restored.locator('.handoff-fonts').innerText(),
        /Missing brand[\s\S]*File not included/
      )
      assert.equal(
        await reopened.evaluate(
          () =>
            [...document.fonts].filter(face => face.family.replaceAll('"', '') === 'Missing brand')
              .length
        ),
        0
      )
    } finally {
      await reopened.close()
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
      await openWorkshop(blocked, baseURL)
      await chooseSetup(blocked, 'React')
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
      await blocked.getByRole('button', { name: 'Share', exact: true }).click()
      const blockedPopover = blocked.getByRole('dialog', { name: 'Share link', exact: true })
      await blockedPopover
        .getByText('Copy failed. Select the link below.', { exact: true })
        .waitFor()
      assert.ok(
        (
          await blockedPopover
            .getByRole('textbox', { name: 'Share link', exact: true })
            .inputValue()
        ).includes('#workshop=1.'),
        'a blocked clipboard still shows the link to select'
      )
      const invalid = await context.newPage()
      await invalid.goto(`${baseURL}/workshop/#workshop=2.invalid`)
      await invalid.waitForFunction(() =>
        document
          .querySelector('.start-message[data-start-error]')
          ?.textContent.includes('unsupported')
      )
      assert.ok(
        (await invalid.locator('.start-card').count()) > 0,
        'an invalid link lands on the start screen'
      )
      await invalid.close()
    } finally {
      await blocked.close()
    }
    console.log(
      'Handoff UI passed: React/CSS/Tailwind each show their exact output, steps and snippets with copy and download, the choice survives a reload, Other formats keep configuration/section/motion/typography/CSS copies and merge/replace imports, Share copies a link that reopens the theme from the keyboard, too-large themes offer the file, fonts, failures and 320/390 layouts.'
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
