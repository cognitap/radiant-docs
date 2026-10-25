import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { themes, sharp, jelly, defaultTheme } from '@cognitap/radiant'

const pages = [
  'getting-started',
  'foundations',
  'foundations/theming',
  'foundations/composition',
  'releases'
]
const examples = [
  [
    'getting-started',
    'Your first action',
    ['foundations/FollowButton.tsx', 'profile/useHydrated.ts']
  ],
  [
    'foundations/theming',
    'Supported presets',
    ['foundations/ThemeExample.tsx', 'foundations/foundation-example.css', 'profile/useHydrated.ts']
  ],
  [
    'foundations/theming',
    'Author a theme',
    [
      'foundations/ThemeExample.tsx',
      'foundations/garden.ts',
      'foundations/foundation-example.css',
      'profile/useHydrated.ts'
    ]
  ],
  [
    'foundations/theming',
    'Nested theme scopes',
    ['foundations/NestedScopes.tsx', 'foundations/foundation-example.css', 'profile/useHydrated.ts']
  ]
]

async function background(host) {
  return host.evaluate(async node => {
    void getComputedStyle(node).backgroundColor
    await Promise.allSettled(node.getAnimations().map(animation => animation.finished))
    return getComputedStyle(node).backgroundColor
  })
}

async function radius(host) {
  return host.evaluate(async node => {
    void getComputedStyle(node).borderTopLeftRadius
    await Promise.allSettled(node.getAnimations().map(animation => animation.finished))
    return getComputedStyle(node).borderTopLeftRadius
  })
}

export async function verifyFoundations(browser, baseURL) {
  const context = await browser.newContext({
    permissions: ['clipboard-read', 'clipboard-write'],
    viewport: { width: 1440, height: 1000 },
    colorScheme: 'light'
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  try {
    const staticPage = await browser.newPage({ javaScriptEnabled: false })
    for (const route of pages) {
      assert.equal((await staticPage.goto(`${baseURL}/docs/${route}/`)).status(), 200)
      const links = await staticPage
        .locator('main a[href^="/"]')
        .evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))
      for (const href of new Set(links)) {
        const target = new URL(href, baseURL)
        const response = await staticPage.request.get(target.href)
        assert.equal(response.status(), 200, `guide link resolves: ${href}`)
        if (target.hash)
          assert.ok(
            (await response.text()).includes(`id="${target.hash.slice(1)}"`),
            `guide anchor exists: ${href}`
          )
      }
    }
    for (const [route, title, files] of examples) {
      await staticPage.goto(`${baseURL}/docs/${route}/`)
      const frame = staticPage.getByRole('region', { name: title, exact: true })
      await frame.locator('.demo-sources > summary').click()
      for (const file of files)
        assert.equal(await frame.getByLabel(`Source: ${file}`, { exact: true }).isVisible(), true)
      assert.equal(
        await frame
          .getByRole('button', {
            name:
              title === 'Your first action'
                ? 'Follow'
                : title === 'Nested theme scopes'
                  ? 'Count: 0'
                  : 'Save project',
            exact: true
          })
          .first()
          .isDisabled(),
        true,
        'static previews wait for handlers before enabling actions'
      )
    }
    await staticPage.close()

    // The displayed and copied files are the actual typechecked implementation.
    for (const [route, title, files] of examples) {
      await page.goto(`${baseURL}/docs/${route}/`)
      const frame = page.getByRole('region', { name: title, exact: true })
      await frame.locator('.demo-sources > summary').click()
      for (const file of files) {
        const actual = await readFile(new URL(`../examples/${file}`, import.meta.url), 'utf8')
        assert.equal(
          await frame.getByLabel(`Source: ${file}`, { exact: true }).textContent(),
          actual
        )
        await frame.getByRole('button', { name: `Copy ${file}`, exact: true }).click()
        await frame
          .getByRole('status')
          .filter({ hasText: `Copied ${file}.` })
          .waitFor()
        assert.equal(await page.evaluate(() => navigator.clipboard.readText()), actual)
      }
    }
    await page.goto(`${baseURL}/docs/getting-started/`)
    const setup = page.getByRole('region', { name: 'Your first action', exact: true })
    await setup.getByRole('button', { name: 'Follow', exact: true }).press('Enter')
    assert.equal(
      await setup
        .getByRole('button', { name: 'Following', exact: true })
        .getAttribute('aria-pressed'),
      'true'
    )
    await setup.getByRole('button', { name: 'Reset preview', exact: true }).click()
    assert.equal(
      await setup.getByRole('button', { name: 'Follow', exact: true }).getAttribute('aria-pressed'),
      'false'
    )

    await page.goto(`${baseURL}/docs/foundations/theming/`)
    const gallery = page.getByRole('region', { name: 'Supported presets', exact: true })
    const theme = gallery.getByRole('combobox', { name: 'Theme', exact: true })
    const mode = gallery.getByRole('combobox', { name: 'Mode', exact: true })
    const host = gallery.locator('.foundation-example')
    const name = gallery.getByRole('textbox', { name: 'Project name', exact: true })
    const updates = gallery.getByRole('checkbox', { name: 'Send project updates', exact: true })
    assert.deepEqual(
      await theme.locator('option').evaluateAll(nodes => nodes.map(node => node.value)),
      themes.map(preset => preset.id)
    )
    await name.fill('Keep this draft')
    await updates.uncheck()
    for (const preset of themes) {
      await theme.selectOption(preset.id)
      assert.equal(await host.getAttribute('data-rad-theme'), preset.id)
      const colors = []
      for (const appearance of ['light', 'dark', 'system']) {
        await mode.selectOption(appearance)
        assert.equal(
          await host.evaluate(node => getComputedStyle(node).colorScheme),
          appearance === 'system' ? 'light dark' : appearance
        )
        colors.push(await background(name))
        assert.equal(await name.inputValue(), 'Keep this draft')
        assert.equal(await updates.isChecked(), false)
        await gallery.getByRole('button', { name: 'Save project', exact: true }).press('Enter')
        await gallery
          .getByRole('status')
          .filter({ hasText: 'Saved locally: Keep this draft; updates off.' })
          .waitFor()
      }
      assert.notEqual(colors[0], colors[1], `${preset.id}: distinct mode palettes`)
      assert.equal(
        colors[0],
        colors[2],
        `${preset.id}: system follows the light browser preference`
      )
      await page.emulateMedia({ colorScheme: 'dark' })
      assert.equal(await background(name), colors[1], `${preset.id}: live system dark`)
      await page.emulateMedia({ colorScheme: 'light' })
    }
    await theme.selectOption(jelly.id)
    await mode.selectOption('dark')
    await gallery.screenshot({ path: 'output/docs/themes-jelly-dark.png', animations: 'disabled' })
    await gallery.getByRole('button', { name: 'Reset form', exact: true }).click()
    assert.equal(await name.inputValue(), 'Spring garden')
    assert.equal(await updates.isChecked(), true)
    await gallery.getByRole('button', { name: 'Reset preview', exact: true }).click()
    assert.equal(await theme.inputValue(), sharp.id)
    assert.equal(await mode.inputValue(), 'light')
    await gallery.screenshot({ path: 'output/docs/themes-sharp-light.png', animations: 'disabled' })

    const author = page.getByRole('region', { name: 'Author a theme', exact: true })
    const authorInput = author.getByRole('textbox', { name: 'Project name', exact: true })
    const authorButton = author.getByRole('button', { name: 'Save project', exact: true })
    assert.equal(await radius(authorInput), '16px')
    assert.equal(await radius(authorButton), '16px')
    await authorInput.fill('Garden draft')
    await author.getByRole('checkbox', { name: 'Button-only corners', exact: true }).check()
    assert.equal(await radius(authorButton), '4px')
    assert.equal(await radius(authorInput), '16px')
    for (const appearance of ['light', 'dark', 'system']) {
      await author.getByRole('combobox', { name: 'Mode', exact: true }).selectOption(appearance)
      assert.equal(await authorInput.inputValue(), 'Garden draft')
      assert.equal(await radius(authorButton), '4px')
    }
    await author.screenshot({ path: 'output/docs/themes-authoring.png', animations: 'disabled' })
    await author.getByRole('button', { name: 'Reset preview', exact: true }).click()
    assert.equal(await radius(authorButton), '16px')
    assert.equal(await authorInput.inputValue(), 'Spring garden')

    const nested = page.getByRole('region', { name: 'Nested theme scopes', exact: true })
    const outer = nested.getByRole('region', { name: 'Outer theme', exact: true })
    const dark = nested.getByRole('region', { name: 'Same theme, dark mode', exact: true })
    const reset = nested.getByRole('region', { name: 'Default theme reset', exact: true })
    await nested.getByRole('combobox', { name: 'Theme', exact: true }).selectOption(defaultTheme.id)
    for (const panel of [outer, dark])
      assert.equal(
        await radius(panel.getByRole('textbox')),
        '24px',
        'inline shared override survives a mode-only scope'
      )
    assert.equal(
      await radius(reset.getByRole('textbox')),
      '8px',
      'new named theme clears inherited overrides'
    )
    await outer.getByRole('textbox').fill('Independent draft')
    await dark.getByRole('button', { name: 'Count: 0', exact: true }).click()
    await dark.getByRole('button', { name: 'Count: 1', exact: true }).waitFor()
    assert.equal(await outer.getByRole('button', { name: 'Count: 0', exact: true }).count(), 1)
    await nested.getByRole('combobox', { name: 'Theme', exact: true }).selectOption(sharp.id)
    for (const panel of [outer, dark])
      assert.equal(
        await panel.getByRole('button').evaluate(node => getComputedStyle(node).textTransform),
        'uppercase'
      )
    assert.equal(
      await reset.getByRole('button').evaluate(node => getComputedStyle(node).textTransform),
      'none',
      'Default resets action effects'
    )
    await nested.getByRole('combobox', { name: 'Mode', exact: true }).selectOption('system')
    for (const appearance of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: appearance })
      assert.equal(
        await dark.getByRole('textbox').evaluate(node => getComputedStyle(node).colorScheme),
        'dark'
      )
      assert.equal(
        await reset.getByRole('textbox').evaluate(node => getComputedStyle(node).colorScheme),
        'light dark'
      )
      assert.equal(await outer.getByRole('textbox').inputValue(), 'Independent draft')
      assert.equal(await dark.getByRole('button', { name: 'Count: 1', exact: true }).count(), 1)
    }
    await nested.getByRole('checkbox', { name: 'Inline shared radius', exact: true }).uncheck()
    await nested.screenshot({ path: 'output/docs/themes-nested.png', animations: 'disabled' })
    await nested.getByRole('button', { name: 'Reset preview', exact: true }).click()
    assert.equal(
      await nested.getByRole('combobox', { name: 'Theme', exact: true }).inputValue(),
      jelly.id
    )
    assert.equal(
      await nested.getByRole('checkbox', { name: 'Inline shared radius', exact: true }).isChecked(),
      true
    )
    assert.equal(await outer.getByRole('textbox').inputValue(), 'State stays here')
    assert.equal(await dark.getByRole('button', { name: 'Count: 0', exact: true }).count(), 1)

    // Scope inheritance and the named reset hold for every public preset/mode.
    for (const preset of themes) {
      await nested.getByRole('combobox', { name: 'Theme', exact: true }).selectOption(preset.id)
      for (const appearance of ['light', 'dark', 'system']) {
        await nested.getByRole('combobox', { name: 'Mode', exact: true }).selectOption(appearance)
        for (const panel of [outer, dark]) {
          assert.equal(
            await panel
              .getByRole('textbox')
              .evaluate(node =>
                getComputedStyle(node).getPropertyValue('--rad-control-radius').trim()
              ),
            '1.5rem',
            `${preset.id}/${appearance}: mode-only scope carries the inline token`
          )
        }
        assert.equal(
          await dark.getByRole('textbox').evaluate(node => getComputedStyle(node).colorScheme),
          'dark'
        )
        assert.equal(
          await reset.getByRole('textbox').evaluate(node => getComputedStyle(node).colorScheme),
          appearance === 'system' ? 'light dark' : appearance
        )
        assert.equal(
          await radius(reset.getByRole('textbox')),
          '8px',
          `${preset.id}/${appearance}: named reset clears shared overrides`
        )
        await dark.getByRole('button', { name: 'Count: 0', exact: true }).click()
        await dark.getByRole('button', { name: 'Count: 1', exact: true }).waitFor()
        assert.equal(await outer.getByRole('button', { name: 'Count: 0', exact: true }).count(), 1)
        await dark.getByRole('button', { name: 'Count: 1', exact: true }).click()
        await nested.getByRole('button', { name: 'Reset preview', exact: true }).click()
        // Reset restores Jelly, so reselect the current matrix row's preset.
        await nested.getByRole('combobox', { name: 'Theme', exact: true }).selectOption(preset.id)
      }
    }
    assert.equal(await theme.inputValue(), sharp.id, 'scope controls do not change the gallery')
    assert.equal(await mode.inputValue(), 'light')

    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 })
      for (const route of pages) {
        await page.goto(`${baseURL}/docs/${route}/`)
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          true,
          `${route} fits ${width}px`
        )
      }
    }
    await page.goto(`${baseURL}/docs/foundations/theming/`)
    await gallery.screenshot({ path: 'output/docs/themes-mobile.png', animations: 'disabled' })
    await gallery.locator('.demo-sources > summary').click()
    const source = gallery.getByLabel('Source: foundations/ThemeExample.tsx', { exact: true })
    await source.focus()
    assert.equal(await source.evaluate(node => node === document.activeElement), true)
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true
    )
    assert.deepEqual(errors, [], 'foundations have no hydration, runtime or asset errors')
    console.log(
      'Foundations passed: guide links/anchors, static previews, exact source/copy, eight presets × three modes plus live system preference, form state/reset, theme authoring, nested inheritance/reset, keyboard actions and narrow layouts.'
    )
  } catch (error) {
    await page
      .screenshot({ path: 'output/docs/foundations-failure.png', fullPage: true })
      .catch(() => {})
    throw error
  } finally {
    await context.close()
  }
}
