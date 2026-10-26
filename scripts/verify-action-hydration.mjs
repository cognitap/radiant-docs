import assert from 'node:assert/strict'

// Hold scripts to make the remote pre-hydration interval deterministic.
export async function verifyActionHydration(browser, baseURL) {
  for (const routeName of ['button', 'link']) {
    const page = await browser.newPage()
    let release
    const scriptsReady = new Promise(resolve => {
      release = resolve
    })
    await page.route('**/_next/static/**', async route => {
      if (route.request().resourceType() === 'script') await scriptsReady
      await route.continue()
    })
    try {
      await page.goto(`${baseURL}/docs/${routeName}/`, { waitUntil: 'commit' })
      if (routeName === 'button') {
        const demo = page.getByRole('region', { name: 'Interactive Button', exact: true })
        const composition = page.getByRole('region', { name: 'Custom button and ref', exact: true })
        const activate = demo.getByRole('button', { name: 'Try Radiant', exact: true })
        const custom = composition.getByRole('button', { name: 'Mark as reviewed', exact: true })
        const focus = composition.getByRole('button', { name: 'Focus action', exact: true })
        for (const action of [activate, custom, focus]) {
          await action.waitFor()
          assert.equal(
            await action.isDisabled(),
            true,
            'local demo actions must wait for hydration'
          )
        }
        release()
        await activate.click()
        await demo.getByRole('status').filter({ hasText: 'Activated 1 time.' }).waitFor()
        await focus.click()
        assert.equal(await custom.evaluate(node => node === document.activeElement), true)
        await custom.press('Enter')
        await composition.getByRole('status').filter({ hasText: 'Reviews: 1.' }).waitFor()
      } else {
        const focus = page.getByRole('button', { name: 'Focus router link', exact: true })
        await focus.waitFor()
        assert.equal(
          await focus.isDisabled(),
          true,
          'ref action must wait for its hydration handler'
        )
        release()
        await focus.click()
        assert.equal(
          await page
            .getByRole('link', { name: /^Explore system foundations/ })
            .evaluate(node => node === document.activeElement),
          true
        )
      }
    } finally {
      release()
      await page.close()
    }
  }
  console.log(
    'Action hydration passed: SSR counter/custom/ref actions wait for handlers, then native activation and refs work.'
  )
}
