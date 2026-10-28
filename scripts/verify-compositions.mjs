import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { sharp, themes } from '@cognitap/radiant/examples'

const examples = [
  ['dialog', 'Interactive Dialog', 'DialogExample.tsx'],
  ['collapsible', 'Native disclosure', 'CollapsibleExample.tsx'],
  ['collapsible', 'Controlled disclosure', 'CollapsibleExample.tsx'],
  ['accordion', 'Interactive Accordion', 'AccordionExample.tsx'],
  ['card', 'Card with actions', 'CardExample.tsx']
]

async function detailsState(item, open) {
  await item
    .locator(open ? ':scope[open][data-state="open"]' : ':scope:not([open])[data-state="closed"]')
    .waitFor()
}

async function paintedBackground(host) {
  return host.evaluate(async node => {
    void getComputedStyle(node).backgroundColor
    await Promise.all(node.getAnimations().map(animation => animation.finished))
    return getComputedStyle(node).backgroundColor
  })
}

async function sources(page, frame, file) {
  const files = [
    `compositions/${file}`,
    'compositions/composition-types.ts',
    'compositions/composition-example.css'
  ]
  if (file !== 'AccordionExample.tsx') files.push('profile/useHydrated.ts')
  await frame.locator('.demo-sources > summary').click()
  for (const name of files) {
    const actual = await readFile(new URL(`../examples/${name}`, import.meta.url), 'utf8')
    assert.equal(await frame.getByLabel(`Source: ${name}`, { exact: true }).textContent(), actual)
    await frame.getByRole('button', { name: `Copy ${name}`, exact: true }).click()
    await frame
      .getByRole('status')
      .filter({ hasText: `Copied ${name}.` })
      .waitFor()
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), actual)
  }
  await frame.locator('.demo-sources > summary').click()
}

async function appearance(frame) {
  await frame.getByRole('combobox', { name: 'Theme', exact: true }).selectOption(sharp.id)
  await frame.getByRole('combobox', { name: 'Mode', exact: true }).selectOption('dark')
  await frame.getByRole('checkbox', { name: 'Compact', exact: true }).check()
  assert.equal(await frame.locator('.composition-example').getAttribute('data-rad-theme'), sharp.id)
  assert.equal(
    await frame
      .locator('.composition-example')
      .evaluate(node => getComputedStyle(node).colorScheme),
    'dark'
  )
}

export async function verifyCompositions(browser, baseURL) {
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
    const staticPage = await browser.newPage({ javaScriptEnabled: false })
    for (const [route, title, file] of examples) {
      assert.equal((await staticPage.goto(`${baseURL}/docs/${route}/`)).status(), 200)
      const frame = staticPage.getByRole('region', { name: title, exact: true })
      await frame.locator('.demo-sources > summary').click()
      assert.equal(await frame.locator('pre').count(), file === 'AccordionExample.tsx' ? 3 : 4)
      if (route === 'collapsible') {
        await frame.locator('summary[data-slot~="collapsible-trigger"]').press('Enter')
        assert.equal(
          await frame.getByRole('textbox', { name: 'Draft note', exact: true }).isVisible(),
          true
        )
      }
      if (route === 'dialog')
        assert.equal(
          await frame
            .getByRole('button', { name: 'Review release notes', exact: true })
            .isDisabled(),
          true
        )
      if (route === 'card') {
        assert.equal(
          await frame.getByRole('button', { name: 'Bookmark', exact: true }).isDisabled(),
          true
        )
        await frame.getByRole('link', { name: 'Installation guide', exact: true }).click()
        await staticPage.waitForURL('**/docs/getting-started/')
      }
    }
    await staticPage.close()

    await page.goto(`${baseURL}/docs/dialog/`)
    const dialogFrame = page.getByRole('region', { name: 'Interactive Dialog', exact: true })
    const trigger = dialogFrame.getByRole('button', { name: 'Review release notes', exact: true })
    const dialog = dialogFrame.getByRole('dialog', { name: 'Review this release', exact: true })
    for (const owner of ['uncontrolled', 'controlled']) {
      await dialogFrame
        .getByRole('combobox', { name: 'State owner', exact: true })
        .selectOption(owner)
      await dialogFrame.getByRole('button', { name: 'Focus trigger', exact: true }).click()
      assert.equal(
        await trigger.evaluate(
          node => node === document.activeElement && node.tagName === 'BUTTON'
        ),
        true
      )
      assert.equal(await trigger.getAttribute('data-review-trigger'), 'true')
      assert.equal(await trigger.getAttribute('type'), 'button')
      await trigger.press('Enter')
      await dialog.waitFor()
      assert.equal(
        await dialog.evaluate(
          node => node.matches(':modal') && node.contains(document.activeElement)
        ),
        true
      )
      assert.equal(await trigger.getAttribute('aria-controls'), await dialog.getAttribute('id'))
      assert.equal(await trigger.getAttribute('aria-expanded'), 'true')
      assert.equal(
        await dialog.evaluate(node =>
          ['aria-labelledby', 'aria-describedby'].every(name =>
            node
              .getAttribute(name)
              .split(/\s+/)
              .every(id => !!document.getElementById(id))
          )
        ),
        true
      )
      await dialogFrame
        .getByRole('button', { name: 'Focus trigger', exact: true })
        .evaluate(node => node.focus())
      assert.equal(
        await dialog.evaluate(node => node.contains(document.activeElement)),
        true,
        'modal makes outside controls inert'
      )
      await dialog.getByRole('button', { name: 'Close review', exact: true }).focus()
      await page.keyboard.press('Tab')
      if (!(await dialog.evaluate(node => node.contains(document.activeElement)))) {
        assert.equal(
          await page.evaluate(() => document.hasFocus()),
          false,
          'native modal Tab may reach browser chrome, never a background page control'
        )
        await page.keyboard.press('Tab')
      }
      assert.equal(await dialog.evaluate(node => node.contains(document.activeElement)), true)
      await page.keyboard.press('Escape')
      await dialog.waitFor({ state: 'hidden' })
      assert.equal(await trigger.evaluate(node => node === document.activeElement), true)
      await trigger.press('Space')
      await dialog.waitFor()
      await page.mouse.click(2, 2)
      await dialog.waitFor({ state: 'hidden' })
      assert.equal(await trigger.evaluate(node => node === document.activeElement), true)
      await trigger.click()
      await dialog.getByRole('heading', { name: 'Review this release', exact: true }).click()
      assert.equal(await dialog.isVisible(), true, 'inside clicks are not backdrop clicks')
      await dialog.getByRole('button', { name: 'Mark as reviewed', exact: true }).click()
      await dialog.waitFor({ state: 'hidden' })
      await dialogFrame
        .locator('.composition-result')
        .filter({ hasText: 'Review recorded locally.' })
        .waitFor()
      await dialogFrame.getByRole('checkbox', { name: 'Close on Escape', exact: true }).uncheck()
      await dialogFrame.getByRole('checkbox', { name: 'Close on backdrop', exact: true }).uncheck()
      await trigger.click()
      await dialog.waitFor()
      await page.keyboard.press('Escape')
      await page.mouse.click(2, 2)
      assert.equal(
        await dialog.isVisible(),
        true,
        'disabled dismissal policies leave an explicit close action'
      )
      await dialog.getByRole('button', { name: 'Close review', exact: true }).click()
      await dialog.waitFor({ state: 'hidden' })
      await dialogFrame.getByRole('checkbox', { name: 'Modal', exact: true }).uncheck()
      await trigger.click()
      await dialog.waitFor()
      assert.equal(await dialog.evaluate(node => node.matches(':modal')), false)
      await dialogFrame.getByRole('button', { name: 'Focus trigger', exact: true }).click()
      assert.equal(
        await trigger.evaluate(node => node === document.activeElement),
        true,
        'nonmodal leaves the page active'
      )
      await page.keyboard.press('Escape')
      assert.equal(await dialog.isVisible(), true)
      await dialog.getByRole('button', { name: 'Close review', exact: true }).click()
      await dialog.waitFor({ state: 'hidden' })
      await dialogFrame.getByRole('checkbox', { name: 'Modal', exact: true }).check()
      await dialogFrame.getByRole('checkbox', { name: 'Close on Escape', exact: true }).check()
      await dialogFrame.getByRole('checkbox', { name: 'Close on backdrop', exact: true }).check()
    }

    // The native top layer must keep every selected preset's light/dark paint.
    for (const theme of themes) {
      await dialogFrame.getByRole('combobox', { name: 'Theme', exact: true }).selectOption(theme.id)
      const colors = []
      for (const mode of ['light', 'dark']) {
        await dialogFrame.getByRole('combobox', { name: 'Mode', exact: true }).selectOption(mode)
        await trigger.click()
        await dialog.waitFor()
        colors.push(await paintedBackground(dialog))
        await dialog.getByRole('button', { name: 'Close review', exact: true }).click()
        await dialog.waitFor({ state: 'hidden' })
      }
      assert.notEqual(colors[0], colors[1], `${theme.id} paints distinct modal surfaces`)
    }
    await dialogFrame.getByRole('combobox', { name: 'Mode', exact: true }).selectOption('system')
    await trigger.click()
    await dialog.waitFor()
    await page.emulateMedia({ colorScheme: 'dark' })
    const systemDark = await paintedBackground(dialog)
    await page.emulateMedia({ colorScheme: 'light' })
    assert.notEqual(await paintedBackground(dialog), systemDark)
    await dialog.getByRole('button', { name: 'Close review', exact: true }).click()
    await dialog.waitFor({ state: 'hidden' })
    await appearance(dialogFrame)
    await trigger.click()
    await dialog.waitFor()
    await page.screenshot({
      path: 'output/docs/composition-dialog-sharp-dark.png',
      animations: 'disabled'
    })
    await dialog.getByRole('button', { name: 'Close review', exact: true }).click()
    await dialog.waitFor({ state: 'hidden' })

    const recipe = page.getByRole('region', { name: 'Profile editor', exact: true })
    assert.equal(
      await recipe.getByRole('combobox', { name: 'Placement', exact: true }).inputValue(),
      'dialog'
    )
    await recipe.getByRole('button', { name: 'Edit profile', exact: true }).click()
    const editor = recipe.getByRole('dialog', { name: 'Edit your profile', exact: true })
    assert.notEqual(
      await editor.getAttribute('id'),
      await dialogFrame.locator('dialog').getAttribute('id')
    )
    await editor.getByRole('button', { name: 'Save profile', exact: true }).click()
    const name = editor.getByRole('textbox', { name: 'Display name', exact: true })
    await editor.getByRole('alert').first().waitFor()
    assert.equal(await name.evaluate(node => node === document.activeElement), true)
    await name.fill('Dialog reader')
    await editor
      .getByRole('textbox', { name: 'Email address', exact: true })
      .fill('dialog@example.com')
    await editor.getByRole('button', { name: 'Save profile', exact: true }).click()
    await editor.waitFor({ state: 'hidden' })
    await recipe
      .getByRole('status')
      .filter({ hasText: 'Saved locally for Dialog reader' })
      .waitFor()
    assert.equal(
      await recipe
        .getByRole('button', { name: 'Edit profile', exact: true })
        .evaluate(node => node === document.activeElement),
      true
    )
    await dialogFrame.getByRole('button', { name: 'Reset preview', exact: true }).click()
    await recipe
      .getByRole('status')
      .filter({ hasText: 'Saved locally for Dialog reader' })
      .waitFor()
    await recipe.getByRole('button', { name: 'Reset preview', exact: true }).click()
    assert.equal(
      await recipe.getByRole('combobox', { name: 'Placement', exact: true }).inputValue(),
      'dialog',
      'recipe reset restores the embedding default'
    )

    await page.goto(`${baseURL}/docs/collapsible/`)
    const native = page.getByRole('region', { name: 'Native disclosure', exact: true })
    const controlled = page.getByRole('region', { name: 'Controlled disclosure', exact: true })
    for (const [frame, draft] of [
      [native, 'Native draft'],
      [controlled, 'Controlled draft']
    ]) {
      const details = frame.locator('details[data-slot~="collapsible"]')
      const summary = frame.locator('summary[data-slot~="collapsible-trigger"]')
      const input = frame.getByRole('textbox', { name: 'Draft note', exact: true })
      await frame.locator('.composition-example[data-hydrated="true"]').waitFor()
      await summary.press('Enter')
      await detailsState(details, true)
      await summary.press('Tab')
      assert.equal(await input.evaluate(node => node === document.activeElement), true)
      await input.fill(draft)
      await summary.press('Space')
      await detailsState(details, false)
      assert.equal(await details.locator('input').count(), 1, 'closed content remains mounted')
      await summary.press('Tab')
      assert.equal(
        await frame.evaluate(
          () => !!document.activeElement.closest('[data-slot~="collapsible-content"]')
        ),
        false
      )
      await summary.press('Enter')
      await detailsState(details, true)
      assert.equal(await input.inputValue(), draft)
      await appearance(frame)
      assert.equal(await input.inputValue(), draft)
    }
    const nativeInput = native.getByRole('textbox', { name: 'Draft note', exact: true })
    const controlledInput = controlled.getByRole('textbox', { name: 'Draft note', exact: true })
    assert.notEqual(await nativeInput.getAttribute('id'), await controlledInput.getAttribute('id'))
    assert.notEqual(
      await native.locator('[data-slot~="collapsible-content"]').getAttribute('id'),
      await controlled.locator('[data-slot~="collapsible-content"]').getAttribute('id')
    )
    await controlled.getByRole('button', { name: 'Toggle from outside', exact: true }).click()
    await detailsState(controlled.locator('details[data-slot~="collapsible"]'), false)
    await controlled.getByRole('button', { name: 'Toggle from outside', exact: true }).click()
    await controlledInput.waitFor()
    assert.equal(await controlledInput.inputValue(), 'Controlled draft')
    await native.getByRole('button', { name: 'Reset preview', exact: true }).click()
    assert.equal(await controlledInput.inputValue(), 'Controlled draft')
    await native.locator('summary[data-slot~="collapsible-trigger"]').click()
    await nativeInput.waitFor()
    assert.equal(await nativeInput.inputValue(), '')
    const ids = await page.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id))
    assert.equal(ids.length, new Set(ids).size)

    await page.goto(`${baseURL}/docs/accordion/`)
    const accordion = page.getByRole('region', { name: 'Interactive Accordion', exact: true })
    const installItem = accordion.locator('details[data-value="installation"]')
    const themeItem = accordion.locator('details[data-value="themes"]')
    const futureItem = accordion.locator('details[data-value="future"]')
    const install = installItem.locator('summary')
    const themeTrigger = themeItem.locator('summary')
    const future = futureItem.locator('summary')
    for (const owner of ['uncontrolled', 'controlled']) {
      for (const selection of ['single', 'multiple']) {
        await accordion
          .getByRole('combobox', { name: 'State owner', exact: true })
          .selectOption(owner)
        await accordion
          .getByRole('combobox', { name: 'Selection', exact: true })
          .selectOption(selection)
        await detailsState(installItem, true)
        assert.equal(
          await install.locator('h3').count(),
          1,
          'heading stays inside the direct-child summary'
        )
        assert.equal(await install.evaluate(node => node.parentElement.tagName), 'DETAILS')
        await themeTrigger.press('Enter')
        await detailsState(themeItem, true)
        await detailsState(installItem, selection === 'multiple')
        await future.click({ force: true })
        await future.focus()
        await future.press('Enter')
        await future.press('Space')
        await detailsState(futureItem, false)
        assert.equal(await future.getAttribute('aria-disabled'), 'true')
        assert.equal(await future.getAttribute('tabindex'), '-1')
        await themeTrigger.press('Tab')
        assert.equal(await future.evaluate(node => node === document.activeElement), false)
        if (owner === 'controlled') {
          await accordion.getByRole('button', { name: 'Close all sections', exact: true }).click()
          await detailsState(installItem, false)
          await detailsState(themeItem, false)
        } else {
          await themeTrigger.press('Space')
          await detailsState(themeItem, false)
        }
        const before = await accordion
          .locator('details[data-value]')
          .evaluateAll(nodes => nodes.map(node => node.open))
        await accordion.getByRole('checkbox', { name: 'Disabled', exact: true }).check()
        await install.click({ force: true })
        await install.focus()
        await install.press('Enter')
        await install.press('Space')
        assert.deepEqual(
          await accordion
            .locator('details[data-value]')
            .evaluateAll(nodes => nodes.map(node => node.open)),
          before
        )
        await accordion.getByRole('checkbox', { name: 'Disabled', exact: true }).uncheck()
      }
    }
    await install.click()
    await detailsState(installItem, true)
    await appearance(accordion)
    await detailsState(installItem, true)
    await install.press('Tab')
    assert.equal(
      await accordion
        .getByRole('link', { name: 'Open installation guide', exact: true })
        .evaluate(node => node === document.activeElement),
      true
    )
    await page.keyboard.press('Enter')
    await page.waitForURL('**/docs/getting-started/')

    await page.goto(`${baseURL}/docs/card/`)
    const cardFrame = page.getByRole('region', { name: 'Card with actions', exact: true })
    const card = cardFrame.locator('[data-slot~="card"]')
    assert.equal(await card.evaluate(node => node.tagName), 'DIV')
    assert.equal(await card.getAttribute('role'), null)
    assert.equal(await card.getAttribute('tabindex'), null)
    assert.equal(await card.getByRole('heading', { name: 'Radiant starter', level: 3 }).count(), 1)
    const bookmark = card.getByRole('button', { name: /Bookmark|Remove bookmark/ })
    await bookmark.locator(':scope:enabled').waitFor()
    await bookmark.press('Space')
    await cardFrame
      .locator('.composition-result')
      .filter({ hasText: 'Bookmarked locally.' })
      .waitFor()
    assert.equal(await bookmark.getAttribute('aria-pressed'), 'true')
    await appearance(cardFrame)
    assert.equal(await bookmark.getAttribute('aria-pressed'), 'true')
    const cardRecipe = page.getByRole('region', { name: 'Compare configurations', exact: true })
    assert.equal(
      await cardRecipe.getByRole('combobox', { name: 'Placement', exact: true }).inputValue(),
      'card'
    )
    assert.equal(await cardRecipe.locator('[data-slot~="card"] form').count(), 1)
    await cardRecipe.getByRole('textbox', { name: 'Display name', exact: true }).fill('Card reader')
    await cardRecipe
      .getByRole('textbox', { name: 'Email address', exact: true })
      .fill('card@example.com')
    await cardRecipe.getByRole('button', { name: 'Save profile', exact: true }).click()
    await cardRecipe
      .getByRole('status')
      .filter({ hasText: 'Saved locally for Card reader' })
      .waitFor()
    await cardFrame.getByRole('button', { name: 'Reset preview', exact: true }).click()
    assert.equal(await bookmark.getAttribute('aria-pressed'), 'false')
    await cardRecipe
      .getByRole('status')
      .filter({ hasText: 'Saved locally for Card reader' })
      .waitFor()
    await cardRecipe.getByRole('button', { name: 'Reset form', exact: true }).click()
    assert.equal(
      await cardRecipe.getByRole('textbox', { name: 'Display name', exact: true }).inputValue(),
      ''
    )

    for (const [route, title, file] of examples) {
      await page.goto(`${baseURL}/docs/${route}/`)
      const frame = page.getByRole('region', { name: title, exact: true })
      await sources(page, frame, file)
      await frame.screenshot({
        path: `output/docs/composition-${title.replaceAll(' ', '-')}-desktop.png`,
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
      if (route === 'dialog') {
        await frame.getByRole('button', { name: 'Review release notes', exact: true }).click()
        const narrow = frame.getByRole('dialog', { name: 'Review this release', exact: true })
        await narrow.waitFor()
        assert.equal(await narrow.evaluate(node => node.scrollWidth <= node.clientWidth), true)
        const closeBox = await narrow
          .getByRole('button', { name: 'Close review', exact: true })
          .boundingBox()
        assert.ok(closeBox.y >= 0 && closeBox.y + closeBox.height <= 844)
        await page.screenshot({
          path: 'output/docs/composition-dialog-mobile.png',
          animations: 'disabled'
        })
        await narrow.getByRole('button', { name: 'Close review', exact: true }).click()
      } else {
        await frame.screenshot({
          path: `output/docs/composition-${title.replaceAll(' ', '-')}-mobile.png`,
          animations: 'disabled'
        })
      }
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
    assert.deepEqual(errors, [], 'composition guides have no hydration, runtime or asset errors')
    console.log(
      'Compositions passed: native dialog focus/dismissal/policies/Button refs, top-layer themes, controlled/uncontrolled retained disclosures, single/multiple Accordion and disabled guards, passive Card actions, shared recipes, exact source/copy, SSR and 320px layouts.'
    )
  } catch (error) {
    await page
      .screenshot({ path: 'output/docs/composition-failure.png', fullPage: true })
      .catch(() => {})
    throw error
  } finally {
    await context.close()
  }
}
