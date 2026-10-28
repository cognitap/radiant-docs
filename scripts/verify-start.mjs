import assert from 'node:assert/strict'
import { startingThemes } from '../examples/workshop/workshop-start.ts'
import { geometryPreset } from '../examples/workshop/workshop-geometry.ts'
import { motionPresets } from '../examples/workshop/workshop-motion.ts'
import {
  enterWorkshop,
  waitForEditors,
  waitForStartScreen,
  workshopFrame
} from './workshop-entry.mjs'

const headline = 'Make a Radiant theme for your app'
const bodyFamily = { inter: 'Inter', 'source-serif': 'Source Serif 4', plex: 'IBM Plex Sans' }

/** The start screen: six finished themes, a brand color and a shared theme, each entering the
    editors as the baseline with nothing changed. */
export async function verifyStart(browser, baseURL) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write'],
    reducedMotion: 'reduce'
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  const frame = workshopFrame(page)
  const canvas = () => frame.locator('.preview-page').first()
  const variable = name =>
    canvas().evaluate((node, name) => getComputedStyle(node).getPropertyValue(name).trim(), name)
  const focused = () => page.evaluate(() => document.activeElement?.textContent?.trim() ?? '')
  const assertFresh = async label => {
    assert.equal(
      await frame.locator('.start-card').count(),
      0,
      `${label}: the start screen is gone`
    )
    assert.equal(
      await frame.locator('.workshop-nav-count').count(),
      0,
      `${label}: no editor counts`
    )
    assert.equal(await frame.locator('.control-change-marker').count(), 0, `${label}: no markers`)
    assert.equal(
      await frame.getByRole('button', { name: 'Undo', exact: true }).isDisabled(),
      true,
      `${label}: nothing to undo`
    )
  }
  const startOver = async () => {
    await frame.getByRole('button', { name: 'New theme', exact: true }).click()
    await waitForStartScreen(page)
  }
  try {
    await page.goto(`${baseURL}/workshop/`)
    await waitForStartScreen(page)
    assert.equal(await frame.getByRole('heading', { name: headline }).isVisible(), true)
    assert.equal(await frame.locator('.preview-toolbar').count(), 0, 'no editors before a choice')
    const cards = frame.getByRole('list', { name: 'Starting themes' }).getByRole('button')
    assert.deepEqual(
      await cards.evaluateAll(nodes => nodes.map(node => node.getAttribute('aria-label'))),
      startingThemes.map(theme => `Start from ${theme.name}: ${theme.character}`)
    )
    await page.screenshot({ path: 'output/docs/workshop-start-1440.png', fullPage: true })

    for (const theme of startingThemes) {
      await enterWorkshop(page, { start: theme.name })
      const label = theme.name
      assert.equal(await focused(), 'Color', `${label}: focus lands on the editor heading`)
      await assertFresh(label)
      assert.equal(await variable('--rad-color-accent'), theme.recipe.brand, `${label}: accent`)
      assert.ok(
        (await variable('--rad-typography-roles-prose-body-family')).includes(
          bodyFamily[theme.recipe.typography]
        ),
        `${label}: body family`
      )
      assert.equal(
        await variable('--rad-surface-radius'),
        `${geometryPreset(theme.recipe.geometry).values.surfaceRadius}px`,
        `${label}: surface radius`
      )
      await frame.getByRole('button', { name: 'Motion', exact: true }).click()
      assert.equal(
        await frame
          .locator('.motion-editor')
          .getByRole('spinbutton', { name: 'Stiffness', exact: true })
          .inputValue(),
        String(motionPresets.find(preset => preset.id === theme.recipe.motion).spring.stiffness),
        `${label}: motion preset`
      )
      if (theme.id === 'editorial')
        await page.screenshot({ path: 'output/docs/workshop-start-entered.png' })
      await startOver()
      assert.equal(await focused(), headline, `${label}: focus returns to the start heading`)
    }

    await frame.getByRole('textbox', { name: 'Your brand color', exact: true }).fill('#166534')
    await frame.getByRole('button', { name: 'Start with this color', exact: true }).click()
    await assertFresh('brand color')
    assert.equal(await variable('--rad-color-accent'), '#166534')
    assert.equal(
      await frame.getByRole('textbox', { name: 'Brand color', exact: true }).inputValue(),
      '#166534'
    )

    await frame.getByRole('textbox', { name: 'Brand color', exact: true }).fill('#0F766E')
    assert.equal(await frame.locator('.workshop-nav-count').count(), 1, 'an edit counts')
    await frame.getByRole('button', { name: 'Copy share link', exact: true }).click()
    await page.waitForFunction(() =>
      document.querySelector('.theme-handoff input[readonly]')?.value.includes('#workshop=1.')
    )
    const link = await frame
      .locator('.theme-handoff')
      .getByRole('textbox', { name: 'Share link', exact: true })
      .inputValue()
    const shared = await context.newPage()
    try {
      await shared.goto(link)
      const sharedFrame = workshopFrame(shared)
      await waitForEditors(shared)
      assert.equal(await sharedFrame.locator('.start-card').count(), 0, 'the link skips the start')
      assert.equal(
        await sharedFrame.getByRole('textbox', { name: 'Brand color', exact: true }).inputValue(),
        '#0F766E'
      )
      assert.equal(await sharedFrame.locator('.workshop-nav-count').count(), 0)
      assert.equal(
        await sharedFrame.getByRole('button', { name: 'Undo', exact: true }).isDisabled(),
        true,
        'the shared theme is the baseline'
      )
      await sharedFrame.getByRole('button', { name: 'New theme', exact: true }).click()
      await waitForStartScreen(shared)
      await sharedFrame.getByRole('textbox', { name: 'Share link', exact: true }).fill(link)
      await sharedFrame.getByRole('button', { name: 'Open link', exact: true }).click()
      await waitForEditors(shared)
      assert.equal(
        await sharedFrame.getByRole('textbox', { name: 'Brand color', exact: true }).inputValue(),
        '#0F766E',
        'a pasted link opens the shared theme'
      )
      await sharedFrame.getByRole('button', { name: 'New theme', exact: true }).click()
      await waitForStartScreen(shared)
      await sharedFrame
        .getByRole('textbox', { name: 'Share link', exact: true })
        .fill(`${baseURL}/workshop/#workshop=2.invalid`)
      await sharedFrame.getByRole('button', { name: 'Open link', exact: true }).click()
      const message = sharedFrame.locator('.start-message[data-start-error]')
      await message.waitFor()
      assert.ok((await message.innerText()).includes('unsupported'), 'the error is shown plainly')
      assert.equal(await sharedFrame.locator('.start-card').count(), startingThemes.length)
    } finally {
      await shared.close()
    }

    const dialog = page.getByRole('dialog', { name: 'Start a new theme?' })
    await frame.getByRole('button', { name: 'New theme', exact: true }).click()
    await dialog.waitFor()
    assert.ok((await dialog.innerText()).includes('One change'), 'the dialog counts the edits')
    await dialog.getByRole('button', { name: 'Keep editing', exact: true }).click()
    await dialog.waitFor({ state: 'hidden' })
    assert.equal(
      await frame.getByRole('textbox', { name: 'Brand color', exact: true }).inputValue(),
      '#0F766E',
      'cancelling keeps the theme'
    )
    await frame.getByRole('button', { name: 'New theme', exact: true }).click()
    await dialog.waitFor()
    await page.keyboard.press('Escape')
    await dialog.waitFor({ state: 'hidden' })
    assert.equal(await frame.locator('.start-card').count(), 0, 'Escape stays in the workshop')
    await frame.getByRole('button', { name: 'New theme', exact: true }).click()
    await dialog.getByRole('button', { name: 'Start new theme', exact: true }).click()
    await waitForStartScreen(page)
    assert.equal(await focused(), headline, 'confirming returns to the start screen')

    await page.keyboard.press('Tab')
    assert.equal(await focused(), `${startingThemes[0].name}${startingThemes[0].character}`)
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await waitForEditors(page)
    assert.equal(
      await variable('--rad-color-accent'),
      startingThemes[1].recipe.brand,
      'the keyboard enters the second theme'
    )
    assert.equal(await focused(), 'Color')
    await startOver()

    for (const [width, height] of [
      [390, 844],
      [320, 568]
    ]) {
      await page.setViewportSize({ width, height })
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `${width}: no horizontal scroll on the start screen`
      )
      const left = await frame
        .locator('.start-card')
        .evaluateAll(nodes => nodes.map(node => Math.round(node.getBoundingClientRect().left)))
      assert.equal(new Set(left).size, 1, `${width}: the gallery is one column`)
    }
    await page.setViewportSize({ width: 375, height: 812 })
    await page.screenshot({ path: 'output/docs/workshop-start-375.png', fullPage: true })
    assert.deepEqual(errors, [], 'no start screen runtime errors')

    const dark = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      colorScheme: 'dark'
    })
    try {
      await dark.goto(`${baseURL}/workshop/`)
      await waitForStartScreen(dark)
      await dark.screenshot({ path: 'output/docs/workshop-start-1440-dark.png', fullPage: true })
    } finally {
      await dark.close()
    }

    const staticPage = await browser.newPage({ javaScriptEnabled: false })
    try {
      await staticPage.goto(`${baseURL}/workshop/`)
      const staticFrame = workshopFrame(staticPage)
      assert.equal(await staticFrame.getByRole('heading', { name: headline }).isVisible(), true)
      const accents = await staticFrame
        .locator('.start-gallery .start-sample-page')
        .evaluateAll(nodes =>
          nodes.map(node => getComputedStyle(node).getPropertyValue('--rad-color-accent').trim())
        )
      assert.deepEqual(
        accents,
        startingThemes.map(theme => theme.recipe.brand),
        'each static card is rendered with its own theme'
      )
      assert.equal(await staticFrame.locator('.start-card-button').first().isDisabled(), true)
      assert.equal(
        await staticFrame
          .getByRole('textbox', { name: 'Your brand color', exact: true })
          .isDisabled(),
        true
      )
    } finally {
      await staticPage.close()
    }
    console.log(
      'Start screen passed: six live themes entering as the baseline with their accent, family, radius and motion and no markers, brand color entry, share link in the URL and pasted, invalid link error, New theme confirm with keep/Escape/confirm, keyboard entry and focus, 320px/390px one-column layout, dark mode and static render.'
    )
  } catch (error) {
    await page
      .screenshot({ path: 'output/docs/workshop-start-failure.png', fullPage: true })
      .catch(() => {})
    throw error
  } finally {
    await context.close()
  }
}
