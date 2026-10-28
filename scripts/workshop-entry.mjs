/** The workshop opens on a start screen; scripts that test the editors enter through here.
    The default entry is the Radiant theme, which is the workshop's historical default. */
export const workshopFrame = page =>
  page.getByRole('region', { name: 'Shared theme workshop', exact: true })

export async function waitForStartScreen(page) {
  await page.waitForFunction(() => {
    const button = document.querySelector('.start-card-button')
    return button !== null && !button.disabled
  })
}

export async function waitForEditors(page) {
  await page.waitForFunction(() => {
    const button = document.querySelector('.preview-toolbar button')
    return button !== null && !button.disabled
  })
}

/** Choose a starting theme by name on the start screen already shown. */
export async function enterWorkshop(page, { start = 'Radiant' } = {}) {
  await waitForStartScreen(page)
  await workshopFrame(page)
    .getByRole('button', { name: new RegExp(`^Start from ${start}:`) })
    .click()
  await waitForEditors(page)
  return workshopFrame(page)
}

export async function openWorkshop(page, baseURL, options) {
  await page.goto(`${baseURL}/workshop/`)
  return enterWorkshop(page, options)
}
