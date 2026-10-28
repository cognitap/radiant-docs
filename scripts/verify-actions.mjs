import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { themes } from '@cognitap/radiant/examples'

async function verifySources(page, frame, files) {
  await frame.locator('summary').click()
  for (const file of files) {
    const actual = await readFile(new URL(`../examples/${file}`, import.meta.url), 'utf8')
    assert.equal(await frame.getByLabel(`Source: ${file}`, { exact: true }).textContent(), actual)
    await frame.getByRole('button', { name: `Copy ${file}`, exact: true }).click()
    await frame
      .getByRole('status')
      .filter({ hasText: `Copied ${file}.` })
      .waitFor()
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), actual)
  }
  await frame.locator('summary').click()
}

async function verifyPresentation(frame, host, variants) {
  for (const variant of variants) {
    await frame.getByRole('combobox', { name: 'Variant', exact: true }).selectOption(variant)
    await host.locator(`:scope[data-variant="${variant}"]`).waitFor()
  }
  const toneColors = []
  for (const tone of ['accent', 'neutral', 'warning', 'danger']) {
    await frame.getByRole('combobox', { name: 'Tone', exact: true }).selectOption(tone)
    await host.locator(`:scope[data-tone="${tone}"]`).waitFor()
    toneColors.push(
      await host.evaluate(async node => {
        // Flush style, then wait for the real color transition to finish.
        void getComputedStyle(node).color
        await Promise.all(node.getAnimations().map(animation => animation.finished))
        return getComputedStyle(node).color
      })
    )
  }
  assert.equal(new Set(toneColors).size, 4, 'site typography must not override Radiant tone colors')
  const sizes = []
  for (const size of ['small', 'medium', 'large']) {
    await frame.getByRole('combobox', { name: 'Control size', exact: true }).selectOption(size)
    await host.locator(`:scope[data-control-size="${size}"]`).waitFor()
    sizes.push((await host.boundingBox()).height)
  }
  assert.ok(sizes[0] < sizes[1] && sizes[1] < sizes[2], 'action sizes change the rendered metrics')
}

async function verifyAppearance(page, frame, scope) {
  const themeControl = frame.getByRole('combobox', { name: 'Theme', exact: true })
  assert.deepEqual(
    await themeControl.locator('option').evaluateAll(nodes => nodes.map(node => node.value)),
    themes.map(theme => theme.id)
  )
  for (const theme of themes) {
    await themeControl.selectOption(theme.id)
    await scope.locator(`:scope[data-rad-theme="${theme.id}"]`).waitFor()
  }
  const mode = frame.getByRole('combobox', { name: 'Mode', exact: true })
  await mode.selectOption('light')
  const light = await scope.evaluate(node => getComputedStyle(node).backgroundColor)
  await mode.selectOption('dark')
  await scope.locator(':scope[data-rad-mode="dark"]').waitFor()
  const dark = await scope.evaluate(node => getComputedStyle(node).backgroundColor)
  assert.notEqual(light, dark, 'mode changes the preview canvas')
  await mode.selectOption('system')
  await scope.locator(':scope[data-rad-mode="system"]').waitFor()
  await page.emulateMedia({ colorScheme: 'dark' })
  assert.equal(await scope.evaluate(node => getComputedStyle(node).backgroundColor), dark)
  await page.emulateMedia({ colorScheme: 'light' })
  assert.equal(await scope.evaluate(node => getComputedStyle(node).backgroundColor), light)
}

async function newTab(context, link, action) {
  const opened = context.waitForEvent('page')
  await action()
  const tab = await opened
  await tab.waitForURL(`**${await link.getAttribute('href')}`)
  assert.equal(await tab.locator('h1').count(), 1)
  await tab.close()
}

export async function verifyActions(browser, baseURL) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    permissions: ['clipboard-read', 'clipboard-write']
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  try {
    await page.goto(`${baseURL}/docs/button/`)
    const buttonFrame = page.getByRole('region', { name: 'Interactive Button', exact: true })
    const button = buttonFrame.getByRole('button', { name: 'Try Radiant', exact: true })
    const count = buttonFrame.locator('.button-example output')
    await button.click()
    await count.filter({ hasText: 'Activated 1 time.' }).waitFor()
    await buttonFrame.getByRole('checkbox', { name: 'Pending', exact: true }).check()
    assert.equal(await button.getAttribute('aria-busy'), 'true')
    assert.equal(await button.isDisabled(), false)
    await button.focus()
    assert.equal(await button.evaluate(node => node === document.activeElement), true)
    await button.press('Enter')
    await button.press('Space')
    await button.click()
    assert.equal(
      await count.innerText(),
      'Activated 1 time.',
      'pending guards all activation paths'
    )
    assert.ok(await button.locator('[aria-hidden="true"]').count(), 'spinner is decorative')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const label = button.getByText('Try Radiant', { exact: true })
    assert.equal(await label.evaluate(node => getComputedStyle(node).opacity), '1')
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await buttonFrame.getByRole('checkbox', { name: 'Pending', exact: true }).uncheck()
    await button.press('Space')
    await count.filter({ hasText: 'Activated 2 times.' }).waitFor()
    await buttonFrame.getByRole('checkbox', { name: 'Disabled', exact: true }).check()
    assert.equal(await button.isDisabled(), true)
    await button.focus()
    assert.equal(await button.evaluate(node => node === document.activeElement), false)
    await buttonFrame.getByRole('checkbox', { name: 'Disabled', exact: true }).uncheck()
    await verifyPresentation(buttonFrame, button, ['solid', 'soft', 'outline', 'ghost'])
    await verifyAppearance(page, buttonFrame, buttonFrame.locator('.button-example'))
    await buttonFrame.getByRole('button', { name: 'Reset preview', exact: true }).click()
    assert.equal(await button.getAttribute('data-variant'), 'solid')
    assert.equal(await count.innerText(), 'Ready when you are.')

    // The rendered host must retain native ref, handlers, pending children and accessible names.
    const composition = page.getByRole('region', { name: 'Custom button and ref', exact: true })
    const review = composition.getByRole('button', { name: 'Mark as reviewed', exact: true })
    await composition.getByRole('button', { name: 'Focus action', exact: true }).click()
    assert.equal(
      await review.evaluate(node => node === document.activeElement && node.tagName === 'BUTTON'),
      true
    )
    assert.equal(await review.getAttribute('data-review-action'), 'true')
    await review.press('Enter')
    await composition
      .getByRole('status')
      .filter({ hasText: 'Review recorded locally. Reviews: 1.' })
      .waitFor()
    await composition.getByRole('checkbox', { name: 'Pending', exact: true }).check()
    await composition.getByRole('button', { name: 'Focus action', exact: true }).click()
    await review.press('Enter')
    await review.press('Space')
    await review.click()
    assert.equal(
      await composition.locator('.button-example output').innerText(),
      'The ref reached the native button. Reviews: 1.'
    )
    assert.equal(await review.getAttribute('aria-busy'), 'true')
    await composition.getByRole('button', { name: 'Reset preview', exact: true }).click()
    await verifySources(page, composition, [
      'button/ButtonComposition.tsx',
      'button/button-example.css',
      'profile/useHydrated.ts'
    ])
    await composition.screenshot({
      path: 'output/docs/button-composition.png',
      animations: 'disabled'
    })

    await page.goto(`${baseURL}/docs/link/`)
    const linkFrame = page.getByRole('region', { name: 'Interactive Link', exact: true })
    const link = linkFrame.getByRole('link', { name: /^Read the installation guide/ })
    assert.equal(await link.evaluate(node => node.tagName), 'A')
    await verifyPresentation(linkFrame, link, [
      'inline',
      'subtle',
      'solid',
      'soft',
      'outline',
      'ghost'
    ])
    await verifyAppearance(page, linkFrame, linkFrame.locator('.link-example'))
    const motionFrame = page.getByRole('region', { name: 'Link and Button motion', exact: true })
    const motionLink = motionFrame.getByRole('link', {
      name: 'Explore the foundations',
      exact: true
    })
    const motionButton = motionFrame.getByRole('button', { name: 'Save for later', exact: true })
    await motionLink.waitFor()
    for (const property of ['min-height', 'font-size', 'border-radius']) {
      assert.equal(
        await motionLink.evaluate(
          (node, key) => getComputedStyle(node).getPropertyValue(key),
          property
        ),
        await motionButton.evaluate(
          (node, key) => getComputedStyle(node).getPropertyValue(key),
          property
        )
      )
    }
    await motionButton.click()
    await motionFrame
      .locator('.link-motion-example output')
      .filter({ hasText: 'Added to your reading list.' })
      .waitFor()
    const holdLink = async () => {
      await motionLink.hover()
      await page.mouse.down()
    }
    const releaseOutside = async () => {
      await page.mouse.move(0, 0)
      await page.mouse.up()
    }
    await holdLink()
    await page.waitForFunction(
      () => Number(document.querySelector('.link-motion-actions a').style.scale) < 0.99
    )
    await releaseOutside()
    await page.waitForFunction(
      () => Number(document.querySelector('.link-motion-actions a').style.scale) === 1
    )
    await motionFrame
      .getByRole('checkbox', { name: 'Turn off spatial motion', exact: true })
      .check()
    await holdLink()
    assert.equal(await motionLink.evaluate(node => Number(getComputedStyle(node).scale) || 1), 1)
    await releaseOutside()
    await motionFrame
      .getByRole('checkbox', { name: 'Turn off spatial motion', exact: true })
      .uncheck()
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await holdLink()
    assert.equal(await motionLink.evaluate(node => Number(getComputedStyle(node).scale) || 1), 1)
    await releaseOutside()
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await verifyPresentation(motionFrame, motionLink, ['solid', 'soft', 'outline', 'ghost'])
    await verifyAppearance(page, motionFrame, motionFrame.locator('.link-motion-example'))
    await verifySources(page, motionFrame, [
      'link/MotionLinkExample.tsx',
      'link/link-example.css',
      'profile/useHydrated.ts'
    ])
    await motionFrame.getByRole('button', { name: 'Reset preview', exact: true }).click()
    await motionFrame.screenshot({ path: 'output/docs/link-motion.png', animations: 'disabled' })
    const router = page.getByRole('region', { name: 'Router link and ref', exact: true })
    assert.equal(
      await router.locator('.link-example').getAttribute('data-rad-mode'),
      'light',
      'previews are independent'
    )
    await verifySources(page, linkFrame, ['link/LinkExample.tsx', 'link/link-example.css'])
    await verifySources(page, router, [
      'link/RouterLinkExample.tsx',
      'link/link-example.css',
      'profile/useHydrated.ts'
    ])
    await linkFrame.getByRole('button', { name: 'Reset preview', exact: true }).click()
    assert.equal(await link.getAttribute('data-variant'), 'inline')

    await link.focus()
    await link.press('Space')
    assert.equal(new URL(page.url()).pathname, '/docs/link/', 'Space does not activate an anchor')
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'
    await newTab(context, link, () => link.click({ modifiers: [modifier] }))
    assert.equal(
      new URL(page.url()).pathname,
      '/docs/link/',
      'modified click leaves the original page open'
    )
    await linkFrame.getByRole('checkbox', { name: 'Open in a new tab', exact: true }).check()
    assert.equal(await link.getAttribute('target'), '_blank')
    assert.equal(await link.getAttribute('rel'), 'noopener noreferrer')
    assert.match(await link.innerText(), /opens in a new tab/)
    await newTab(context, link, () => link.click())
    await linkFrame.getByRole('checkbox', { name: 'Open in a new tab', exact: true }).uncheck()
    await link.press('Enter')
    await page.waitForURL('**/docs/getting-started/')
    await page.goBack()
    await link.click()
    await page.waitForURL('**/docs/getting-started/')
    await page.goBack()

    const routerLink = router.getByRole('link', { name: /^Explore system foundations/ })
    await router.getByRole('button', { name: 'Focus router link', exact: true }).click()
    assert.equal(
      await routerLink.evaluate(node => node === document.activeElement && node.tagName === 'A'),
      true
    )
    await router
      .getByRole('status')
      .filter({ hasText: 'The ref reached the native anchor.' })
      .waitFor()
    await routerLink.press('Space')
    assert.equal(new URL(page.url()).pathname, '/docs/link/')
    await newTab(context, routerLink, () => routerLink.click({ modifiers: [modifier] }))
    await newTab(context, routerLink, () => routerLink.click({ button: 'middle' }))
    await router.getByRole('checkbox', { name: 'Open in a new tab', exact: true }).check()
    assert.equal(await routerLink.getAttribute('rel'), 'noopener noreferrer')
    await newTab(context, routerLink, () => routerLink.click())
    await router.getByRole('checkbox', { name: 'Open in a new tab', exact: true }).uncheck()
    await page.evaluate(() => {
      window.routerDemoDocument = 'same-document'
    })
    await routerLink.press('Enter')
    await page.waitForURL('**/docs/foundations/')
    assert.equal(
      await page.evaluate(() => window.routerDemoDocument),
      'same-document',
      'Next adapter navigates on the client'
    )
    await page.goBack()
    await page.screenshot({
      path: 'output/docs/link-desktop.png',
      fullPage: true,
      animations: 'disabled'
    })
    await linkFrame.getByRole('combobox', { name: 'Theme', exact: true }).selectOption('jelly')
    await linkFrame.getByRole('combobox', { name: 'Mode', exact: true }).selectOption('dark')
    await linkFrame.getByRole('combobox', { name: 'Variant', exact: true }).selectOption('solid')
    await linkFrame.screenshot({ path: 'output/docs/link-jelly-dark.png', animations: 'disabled' })
    await motionFrame.getByRole('combobox', { name: 'Theme', exact: true }).selectOption('glass')
    await motionFrame.getByRole('combobox', { name: 'Mode', exact: true }).selectOption('dark')
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 })
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true
      )
      assert.equal(
        await motionFrame.locator('.link-motion-actions').evaluate(node => {
          const bounds = node.getBoundingClientRect()
          return Array.from(node.children).every(child => {
            const action = child.getBoundingClientRect()
            return action.left >= bounds.left - 1 && action.right <= bounds.right + 1
          })
        }),
        true,
        'long CTA labels remain inside the Card at narrow widths'
      )
      await router.getByRole('button', { name: 'Focus router link', exact: true }).click()
      assert.equal(await routerLink.evaluate(node => node === document.activeElement), true)
    }
    await motionFrame.screenshot({
      path: 'output/docs/link-motion-mobile.png',
      animations: 'disabled'
    })
    await page.screenshot({
      path: 'output/docs/link-mobile.png',
      fullPage: true,
      animations: 'disabled'
    })

    // Both native and router examples remain real navigable anchors in exported HTML.
    const staticPage = await browser.newPage({ javaScriptEnabled: false })
    for (const [frame, name, destination] of [
      ['Interactive Link', 'Read the installation guide', 'getting-started'],
      ['Router link and ref', 'Explore system foundations', 'foundations']
    ]) {
      await staticPage.goto(`${baseURL}/docs/link/`)
      const staticFrame = staticPage.getByRole('region', { name: frame, exact: true })
      await staticFrame.locator('summary').click()
      assert.equal(
        await staticFrame.locator('pre').count(),
        frame === 'Router link and ref' ? 3 : 2
      )
      await staticFrame.getByRole('link', { name, exact: true }).click()
      await staticPage.waitForURL(`**/docs/${destination}/`)
    }
    await staticPage.close()
    assert.deepEqual(errors, [], 'action demos have no hydration, runtime or asset errors')
    console.log(
      'Actions passed: released presentation and themes, pending/disabled keyboard behavior, reduced motion, custom button/ref, native and Next navigation/modified clicks/new tabs, exact copied source, static HTML and narrow layouts.'
    )
  } catch (error) {
    await page
      .screenshot({ path: 'output/docs/actions-failure.png', fullPage: true })
      .catch(() => {})
    throw error
  } finally {
    await context.close()
  }
}
