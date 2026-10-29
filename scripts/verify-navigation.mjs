import assert from 'node:assert/strict'

export async function verifyNavigation(browser, baseURL) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  try {
    await page.goto(`${baseURL}/docs/getting-started/`)
    const nav = page.getByRole('navigation', { name: 'Documentation', exact: true })
    assert.equal(
      await nav.count(),
      1,
      'desktop navigation is visible and mobile navigation stays hidden'
    )
    assert.equal(await nav.getByRole('heading').count(), 6)
    assert.equal(
      await nav
        .getByRole('link', { name: 'Installation', exact: true })
        .getAttribute('aria-current'),
      'page'
    )
    const links = await nav
      .getByRole('link')
      .evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))
    for (const href of links) {
      assert.equal(
        (await page.request.get(`${baseURL}${href}`)).status(),
        200,
        `navigation resolves: ${href}`
      )
    }
    // Skip the header and sidebar, then reach article links directly.
    await page.getByRole('link', { name: 'Skip to content', exact: true }).focus()
    await page.keyboard.press('Enter')
    assert.equal(await page.locator('main').evaluate(node => node === document.activeElement), true)
    await page.keyboard.press('Tab')
    assert.equal(await page.evaluate(() => document.activeElement.closest('main') !== null), true)
    const outline = page.getByRole('navigation', { name: 'On this page', exact: true })
    await outline.getByRole('link', { name: 'Add an action', exact: true }).click()
    assert.equal(new URL(page.url()).hash, '#add-an-action')
    assert.ok(
      await page
        .locator('#add-an-action')
        .evaluate(node => node.getBoundingClientRect().top < innerHeight)
    )
    const tokenColors = await page
      .locator('.prose pre')
      .first()
      .locator('span.line span')
      .evaluateAll(nodes => nodes.map(node => getComputedStyle(node).color))
    assert.ok(new Set(tokenColors).size > 1, 'MDX tokens have distinct syntax colors')
    assert.equal(
      await page.getByRole('complementary', { name: 'Start with the compiled CSS' }).count(),
      1
    )

    // Site appearance changes only the site's scope, and survives client navigation.
    const appearance = page.getByRole('combobox', { name: 'Appearance', exact: true })
    await appearance.selectOption('light')
    const light = await page
      .locator('.site-theme')
      .evaluate(node => getComputedStyle(node).backgroundColor)
    await appearance.selectOption('dark')
    const dark = await page
      .locator('.site-theme')
      .evaluate(node => getComputedStyle(node).backgroundColor)
    assert.notEqual(light, dark)
    assert.equal(
      await page
        .locator('pre')
        .first()
        .evaluate(node => getComputedStyle(node).backgroundColor),
      'rgb(36, 41, 46)'
    )
    await nav.getByRole('link', { name: 'System foundations', exact: true }).click()
    await page.waitForURL('**/docs/foundations/')
    assert.equal(await appearance.inputValue(), 'dark')
    assert.equal(
      await nav
        .getByRole('link', { name: 'System foundations', exact: true })
        .getAttribute('aria-current'),
      'page'
    )
    assert.equal(await page.getByRole('table').count(), 1)
    await page.screenshot({ path: 'output/docs/navigation-dark-desktop.png', fullPage: true })

    // The index is a static JSON asset. Typing does not call a search server.
    const index = await page.request.get(`${baseURL}/search-index.json`)
    assert.equal(index.status(), 200)
    assert.match(index.headers()['content-type'], /application\/json/)
    assert.equal((await index.json()).type, 'advanced')
    const searchRequests = []
    page.on('request', request => {
      if (request.url().includes('search-index') || request.url().includes('/api/search'))
        searchRequests.push(request.url())
    })
    await page.getByRole('button', { name: /^Search docs/ }).focus()
    await page.keyboard.press('Control+k')
    const searchDialog = page.getByRole('dialog', { name: 'Search documentation', exact: true })
    const searchInput = searchDialog.getByRole('searchbox', {
      name: 'Search documentation',
      exact: true
    })
    await searchInput.waitFor()
    assert.equal(await searchInput.evaluate(node => node === document.activeElement), true)
    await searchDialog.getByRole('status').filter({ hasText: 'Type to search' }).waitFor()
    await searchInput.fill('TanStack')
    await searchDialog
      .locator('.search-results a[href^="/docs/recipes/profile-form/"]')
      .first()
      .waitFor()
    assert.equal(searchRequests.length, 1)
    assert.ok(!searchRequests[0].includes('/api/search'))
    await searchInput.fill('qzxvjkplm88776655')
    await searchDialog.getByRole('status').filter({ hasText: 'No results.' }).waitFor()
    assert.equal(await searchDialog.locator('.search-results a').count(), 0)
    await searchInput.fill('Built for actions')
    const headingResult = searchDialog.locator('a[href="/docs/button/#built-for-actions"]').first()
    await headingResult.waitFor()
    assert.equal(searchRequests.length, 1, 'subsequent queries search the downloaded index')
    await page.screenshot({ path: 'output/docs/search-dark-desktop.png' })
    await searchInput.press('ArrowDown')
    assert.equal(
      await searchDialog
        .locator('.search-results a')
        .first()
        .evaluate(node => node === document.activeElement),
      true
    )
    await page.keyboard.press('ArrowUp')
    assert.equal(await searchInput.evaluate(node => node === document.activeElement), true)
    await headingResult.focus()
    await page.keyboard.press('Enter')
    await page.waitForURL('**/docs/button/#built-for-actions')
    await searchDialog.waitFor({ state: 'hidden' })
    assert.equal(
      await nav.getByRole('link', { name: 'Button', exact: true }).getAttribute('aria-current'),
      'page'
    )
    await page.reload()
    assert.equal(new URL(page.url()).hash, '#built-for-actions')
    await page.getByRole('button', { name: /^Search docs/ }).click()
    await searchInput.waitFor()
    await searchInput.press('Escape')
    await searchDialog.waitFor({ state: 'hidden' })
    assert.equal(
      await page
        .getByRole('button', { name: /^Search docs/ })
        .evaluate(node => node === document.activeElement),
      true
    )

    // Documentation appearance and shortcuts must respect interactive examples.
    await nav.getByRole('link', { name: 'Profile form', exact: true }).click()
    await page.waitForURL('**/docs/recipes/profile-form/')
    await appearance.selectOption('dark')
    const recipe = page.getByRole('region', { name: 'Profile editor', exact: true })
    assert.equal(
      await recipe.locator('.profile-recipe').evaluate(node => getComputedStyle(node).colorScheme),
      'light'
    )
    const name = recipe.getByRole('textbox', { name: 'Display name', exact: true })
    await name.fill('Keep editing')
    await name.press('Control+k')
    assert.equal(await searchDialog.isVisible(), false)
    assert.equal(await name.inputValue(), 'Keep editing')
    await recipe.getByRole('combobox', { name: 'Placement', exact: true }).selectOption('dialog')
    await recipe.getByRole('button', { name: 'Edit profile', exact: true }).click()
    await recipe
      .getByRole('dialog')
      .getByRole('button', { name: 'Close editor', exact: true })
      .press('Control+k')
    assert.equal(await searchDialog.isVisible(), false)
    await page.keyboard.press('Escape')
    await recipe.getByRole('dialog').waitFor({ state: 'hidden' })

    // Mobile menu, local page outline and overflow for prose, tables and demos.
    await page.setViewportSize({ width: 390, height: 844 })
    const menuTrigger = page.getByRole('button', { name: 'Browse documentation', exact: true })
    await menuTrigger.press('Enter')
    const menu = page.getByRole('dialog', { name: 'Documentation menu', exact: true })
    await menu.waitFor()
    await page.screenshot({ path: 'output/docs/navigation-mobile-menu.png' })
    await menu.getByRole('button', { name: 'Close menu', exact: true }).press('Enter')
    await menu.waitFor({ state: 'hidden' })
    assert.equal(await menuTrigger.evaluate(node => node === document.activeElement), true)
    await menuTrigger.click()
    await menu.getByRole('link', { name: 'System foundations', exact: true }).click()
    await page.waitForURL('**/docs/foundations/')
    await menu.waitFor({ state: 'hidden' })
    await page.locator('.outline-mobile summary').press('Enter')
    await page
      .getByRole('navigation', { name: 'On this page', exact: true })
      .getByRole('link', { name: 'Modes', exact: true })
      .click()
    assert.equal(new URL(page.url()).hash, '#modes')
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true
    )
    await page.screenshot({ path: 'output/docs/navigation-mobile-page.png', fullPage: true })
    await page.setViewportSize({ width: 320, height: 640 })
    const table = page.getByRole('region', { name: 'Data table', exact: true })
    await table.focus()
    assert.equal(await table.evaluate(node => node === document.activeElement), true)
    assert.ok(
      await table.evaluate(node => node.scrollWidth > node.clientWidth),
      'table scrolls within its region'
    )
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true
    )
    await page.getByRole('button', { name: /^Search docs/ }).click()
    await searchInput.fill('profile')
    await searchDialog.locator('.search-results a').first().waitFor()
    const closeBox = await searchDialog
      .getByRole('button', { name: 'Close search', exact: true })
      .boundingBox()
    assert.ok(
      closeBox.y >= 0 && closeBox.y + closeBox.height <= 640,
      'search close action remains in the narrow viewport'
    )
    assert.equal(await searchDialog.evaluate(node => node.scrollWidth <= node.clientWidth), true)
    await page.screenshot({ path: 'output/docs/search-mobile.png' })
    await searchInput.press('Escape')
    await appearance.selectOption('system')
    await page.emulateMedia({ colorScheme: 'dark' })
    assert.equal(
      await page.locator('.site-theme').evaluate(node => getComputedStyle(node).backgroundColor),
      dark
    )
    await page.emulateMedia({ colorScheme: 'light' })
    assert.equal(
      await page.locator('.site-theme').evaluate(node => getComputedStyle(node).backgroundColor),
      light
    )
    assert.deepEqual(errors, [], 'navigation/search has no hydration, runtime or asset errors')

    // Test a real failed index fetch and retry with a fresh request.
    const failurePage = await context.newPage()
    let fail = true
    await failurePage.route('**/search-index.json*', route =>
      fail ? route.fulfill({ status: 503, body: 'Unavailable' }) : route.continue()
    )
    await failurePage.goto(`${baseURL}/docs/getting-started/`)
    await failurePage.getByRole('button', { name: /^Search docs/ }).click()
    const failedDialog = failurePage.getByRole('dialog', {
      name: 'Search documentation',
      exact: true
    })
    await failedDialog.getByRole('searchbox').fill('Button')
    await failedDialog.getByRole('status').filter({ hasText: 'Search could not load.' }).waitFor()
    fail = false
    await failedDialog.getByRole('button', { name: 'Retry search', exact: true }).click()
    await failedDialog.locator('.search-results a[href^="/docs/button/"]').first().waitFor()
    await failurePage.close()

    const staticPage = await browser.newPage({
      javaScriptEnabled: false,
      viewport: { width: 1440, height: 1000 }
    })
    await staticPage.goto(`${baseURL}/docs/getting-started/`)
    assert.equal(
      await staticPage
        .getByRole('navigation', { name: 'Documentation', exact: true })
        .getByRole('link')
        .count(),
      19
    )
    await staticPage.getByRole('link', { name: 'System foundations', exact: true }).click()
    assert.equal(
      await staticPage.getByRole('heading', { name: 'System foundations', exact: true }).count(),
      1
    )
    await staticPage.close()
    console.log(
      'Navigation/search passed: six sections, active links, skip/outline links, static local search with heading results/retry, keyboard focus, light/dark/system, SSR and narrow layouts.'
    )
  } catch (error) {
    await page
      .screenshot({ path: 'output/docs/navigation-failure.png', fullPage: true })
      .catch(() => {})
    throw error
  } finally {
    await context.close()
  }
}
