import { setTypographyFamily } from './typography-controls.mjs'
import { openPreviewOptions } from './preview-options.mjs'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { exampleSources } from '../lib/demo-sources.mjs'
import { startingThemes } from '../examples/workshop/workshop-start.ts'
import { openWorkshop, enterWorkshop } from './workshop-entry.mjs'

const workshopFiles = await exampleSources(
  fileURLToPath(new URL('../examples/', import.meta.url)),
  'workshop'
)
assert.ok(
  workshopFiles.includes('workshop/GeometryControls.tsx') &&
    workshopFiles.includes('profile/useHydrated.ts'),
  'the source listing covers the directory and its cross-directory imports'
)
const articleTitle = 'Make room for the useful things, and the people who use them.'

/** A control that needs a paragraph should be fixed instead; specimen text is exempt. */
const proseLimit = 120
/** One row of small controls is 2rem plus padding and border; Typography adds a second row of
    tools. Before the compact toolbar these were 196px to 298px at 1440×900. */
const toolbarBudget = { color: 64, typography: 100, geometry: 64, motion: 64 }

/** The one preview must stay in view while any editor control changes. */
async function assertPreviewInView(page, label) {
  const previews = page.getByRole('region', { name: 'Theme preview', exact: true })
  assert.equal(await previews.count(), 1, `${label}: exactly one preview region`)
  const visible = await previews.evaluate(node => {
    const rect = node.getBoundingClientRect()
    return rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth
  })
  assert.equal(visible, true, `${label}: preview intersects the viewport without scrolling`)
}

export async function verifyWorkshop(browser, baseURL) {
  const staticPage = await browser.newPage({ javaScriptEnabled: false })
  assert.equal((await staticPage.goto(`${baseURL}/workshop/`)).status(), 200)
  assert.equal(
    await staticPage
      .getByRole('heading', { name: 'Make a Radiant theme for your app' })
      .isVisible(),
    true
  )
  assert.equal(await staticPage.locator('.start-card').count(), startingThemes.length)
  const staticFrame = staticPage.getByRole('region', { name: 'Shared theme workshop', exact: true })
  await staticFrame.locator('.demo-sources > summary').press('Enter')
  assert.equal(await staticFrame.locator('.demo-sources pre').count(), workshopFiles.length)
  await staticPage.close()

  const widePage = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await openWorkshop(widePage, baseURL)
  const wideFrame = widePage.getByRole('region', { name: 'Shared theme workshop', exact: true })
  await wideFrame.waitFor()
  assert.equal(await widePage.locator('.docs-sidebar, .outline-desktop').count(), 0)
  assert.equal(await widePage.title(), 'Theme workshop · Radiant')
  const docsColumnWidth = 52 * 16
  const frameWidth = (await wideFrame.boundingBox()).width
  assert.ok(frameWidth > docsColumnWidth + 200, `workshop frame is ${frameWidth}px wide`)
  const wideEditor = async name => {
    await wideFrame.getByRole('button', { name, exact: true }).click()
    await assertPreviewInView(widePage, name)
  }
  for (const [editor, name] of [
    ['color', 'Color'],
    ['typography', 'Typography'],
    ['geometry', 'Spacing & surfaces'],
    ['motion', 'Motion']
  ]) {
    await wideFrame.getByRole('button', { name, exact: true }).click()
    const { prose, toolbar } = await widePage.evaluate(() => ({
      prose: [...document.querySelectorAll('.workshop-editor p')]
        .filter(node => node.checkVisibility() && !node.closest('.font-sample'))
        .map(node => node.textContent.trim()),
      toolbar: document.querySelector('.preview-toolbar').getBoundingClientRect().height
    }))
    assert.deepEqual(
      prose.filter(text => text.length > proseLimit),
      [],
      `${name}: no explanatory paragraph over ${proseLimit} characters`
    )
    assert.ok(
      toolbar <= toolbarBudget[editor],
      `${name}: preview toolbar is ${toolbar}px, over its ${toolbarBudget[editor]}px budget`
    )
  }
  const sample = () =>
    widePage
      .locator('.spring-sample-dot')
      .first()
      .evaluate(node => node.style.cssText)
  const moving = await sample()
  await widePage.waitForFunction(
    before => document.querySelector('.spring-sample-dot').style.cssText !== before,
    moving,
    { timeout: 4000 }
  )
  await wideFrame.getByRole('button', { name: 'Color', exact: true }).click()
  await widePage.waitForTimeout(1000)
  const resting = await sample()
  await widePage.waitForTimeout(1600)
  assert.equal(await sample(), resting, 'starting-point samples pause while Motion is hidden')
  await wideFrame.getByRole('textbox', { name: 'Brand color', exact: true }).fill('#166534')
  await assertPreviewInView(widePage, 'brand color')
  const editorBox = await wideFrame.locator('.workshop-editor').boundingBox()
  const previewBox = await widePage
    .getByRole('region', { name: 'Theme preview', exact: true })
    .boundingBox()
  assert.ok(
    editorBox.x + editorBox.width <= previewBox.x + 1,
    'controls sit beside the preview at 1440px'
  )
  await wideEditor('Typography')
  await setTypographyFamily(wideFrame)
  await assertPreviewInView(widePage, 'typography control')
  await wideEditor('Spacing & surfaces')
  await wideFrame.getByRole('spinbutton', { name: 'Surface roundness', exact: true }).fill('24')
  await assertPreviewInView(widePage, 'geometry control')
  await wideEditor('Motion')
  await wideFrame
    .locator('.motion-editor')
    .getByRole('spinbutton', { name: 'Stiffness', exact: true })
    .fill('450')
  await assertPreviewInView(widePage, 'motion control')
  assert.equal(
    await wideFrame.getByRole('combobox', { name: 'Scene', exact: true }).inputValue(),
    'motion:actions',
    'the Motion editor switches a page scene to a motion scene'
  )
  await wideEditor('Color')
  assert.equal(
    await wideFrame.getByRole('combobox', { name: 'Scene', exact: true }).inputValue(),
    'page:article',
    'leaving Motion returns to the last page scene'
  )
  await widePage.goto(`${baseURL}/docs/workshop/`)
  assert.equal((await widePage.locator('main a[href="/workshop/"]').count()) > 0, true)
  assert.equal(await widePage.getByRole('region', { name: 'Shared theme workshop' }).count(), 0)
  await widePage.close()

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
    const canvas = frame.locator('.preview-page').first()
    await frame.getByRole('button', { name: 'Reset scene', exact: true }).waitFor()
    await page.waitForFunction(() => !document.querySelector('.preview-toolbar button').disabled)
    const scene = frame.getByRole('combobox', { name: 'Scene', exact: true })
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
    await scene.selectOption('page:form')
    const form = canvas.getByRole('form', { name: 'Workspace preferences' })
    const name = () => form.getByRole('textbox', { name: 'Name shown to collaborators' })
    await name().fill('Workshop Ada')
    await form
      .getByRole('textbox', { name: 'Email for important account updates' })
      .fill('ada@example.com')
    await form.getByRole('button', { name: 'Save preferences' }).click()
    await canvas
      .getByRole('status')
      .filter({ hasText: 'Saved locally for Workshop Ada.' })
      .waitFor()

    await frame.getByRole('textbox', { name: 'Brand color', exact: true }).fill('#166534')
    assert.notEqual(await variable('--rad-color-accent'), baseline)
    await selectEditor('Typography')
    const typographyFamily = await setTypographyFamily(frame, 18)
    await selectEditor('Spacing & surfaces')
    await frame.getByRole('spinbutton', { name: 'Surface roundness', exact: true }).fill('24')
    await selectEditor('Motion')
    await frame
      .locator('.motion-editor')
      .getByRole('spinbutton', { name: 'Stiffness', exact: true })
      .fill('450')
    assert.equal(await scene.inputValue(), 'motion:actions')
    await selectEditor('Spacing & surfaces')
    assert.equal(await scene.inputValue(), 'page:form', 'the form scene survives a motion visit')
    assert.equal(await name().inputValue(), 'Workshop Ada')
    assert.equal(await variable('--rad-surface-radius'), '24px')
    await selectEditor('Motion')
    assert.equal(
      await frame
        .locator('.motion-editor')
        .getByRole('spinbutton', { name: 'Stiffness', exact: true })
        .inputValue(),
      '450'
    )
    await selectEditor('Color')
    await frame.getByRole('button', { name: 'Reset color', exact: true }).click()
    assert.equal(await variable('--rad-color-accent'), baseline)
    assert.equal(await variable('--rad-surface-radius'), '24px')
    assert.equal(await variable(typographyFamily), 'Georgia, serif')
    assert.equal(await name().inputValue(), 'Workshop Ada')
    await frame.getByRole('textbox', { name: 'Brand color', exact: true }).fill('#166534')
    await scene.selectOption('page:data')
    const filter = () =>
      canvas.getByRole('textbox', { name: 'Filter projects by name, team or status' })
    await filter().fill('Design')
    assert.equal(await canvas.locator('tbody tr').count(), 2)
    await scene.selectOption('page:landing')
    await canvas.getByRole('button', { name: 'Join the list' }).click()
    await canvas.getByRole('status').filter({ hasText: 'local list' }).waitFor()
    await scene.selectOption('components')
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
    await frame.getByRole('button', { name: 'Reset scene', exact: true }).click()
    assert.equal(await count.innerText(), 'Action activated 0 times.')
    await scene.selectOption('page:form')
    assert.equal(await name().inputValue(), 'Workshop Ada')
    await scene.selectOption('page:data')
    assert.equal(await filter().inputValue(), 'Design')

    for (const viewport of [390, 320]) {
      await page.setViewportSize({ width: viewport, height: 844 })
      await openPreviewOptions(frame)
      for (const id of ['page:article', 'page:form', 'page:data', 'page:landing', 'components']) {
        await scene.selectOption(id)
        await width.selectOption('390')
        for (const next of ['light', 'dark']) {
          await mode.selectOption(next)
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            true,
            `${viewport}-${id}-${next}: page overflow`
          )
        }
      }
      await scene.selectOption('page:data')
      const table = canvas.getByRole('region', { name: 'Team activity and monthly commitments' })
      await table.focus()
      await page.keyboard.press('ArrowRight')
      await page.waitForFunction(() => document.querySelector('.scene-scroll').scrollLeft > 0)
      assert.ok(
        await table.evaluate(node => node.scrollLeft > 0),
        'table scrolls from the keyboard'
      )
      await page.screenshot({ path: `output/docs/workshop-${viewport}.png`, fullPage: true })
    }
    await page.setViewportSize({ width: 1280, height: 1000 })
    await width.selectOption('fill')
    await mode.selectOption('light')
    await scene.selectOption('page:article')
    await page.screenshot({ path: 'output/docs/workshop-desktop.png', fullPage: true })
    const disclosure = frame.locator('.demo-sources > summary')
    await disclosure.focus()
    await disclosure.press('Enter')
    for (const file of workshopFiles) {
      const actual = await readFile(new URL(`../examples/${file}`, import.meta.url), 'utf8')
      assert.equal(await frame.getByLabel(`Source: ${file}`, { exact: true }).textContent(), actual)
    }
    await frame.getByRole('button', { name: 'Copy workshop/PageScenes.tsx', exact: true }).click()
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      await readFile(new URL('../examples/workshop/PageScenes.tsx', import.meta.url), 'utf8')
    )
    assert.equal(
      await frame.getByRole('button', { name: 'Reset preview', exact: true }).count(),
      0,
      'the workshop has history instead of a frame reset'
    )
    await page.reload()
    await enterWorkshop(page)
    await page.getByRole('heading', { name: articleTitle }).waitFor()
    assert.deepEqual(errors, [], 'no workshop hydration/runtime/asset errors')
    console.log(
      'Workshop passed: installed document editing and section resets, one always-visible preview beside the controls, five isolated scenes, editor-driven scene switching, mode/width/state inspection, keyboard modal/table, actual copied source, static/direct loads and 320px/390px layouts.'
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
