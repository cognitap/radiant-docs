import assert from 'node:assert/strict'

// Hold application scripts to make the hosted pre-hydration interval deterministic.
export async function verifyRouterHydration(browser, baseURL) {
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
    await page.goto(`${baseURL}/docs/link/`, { waitUntil: 'commit' })
    const focus = page.getByRole('button', { name: 'Focus router link', exact: true })
    await focus.waitFor()
    assert.equal(await focus.isDisabled(), true, 'ref action must wait for its hydration handler')
    release()
    await page.waitForFunction(
      () =>
        ![...document.querySelectorAll('button')].find(
          node => node.textContent === 'Focus router link'
        ).disabled
    )
    await focus.click()
    assert.equal(
      await page
        .getByRole('link', { name: /^Explore system foundations/ })
        .evaluate(node => node === document.activeElement),
      true
    )
    console.log(
      'Router hydration passed: SSR ref action waits for hydration, then focuses the native anchor.'
    )
  } finally {
    release()
    await page.close()
  }
}
