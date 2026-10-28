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
/** Without `start`, enter through the default brand color: the recipe every editor can edit. */
export async function enterWorkshop(page, { start } = {}) {
  await waitForStartScreen(page)
  const frame = workshopFrame(page)
  await (
    start
      ? frame.getByRole('button', { name: new RegExp(`^Start from ${start}:`) })
      : frame.getByRole('button', { name: 'Start with this color', exact: true })
  ).click()
  await waitForEditors(page)
  return workshopFrame(page)
}

export async function openWorkshop(page, baseURL, options) {
  await page.goto(`${baseURL}/workshop/`)
  return enterWorkshop(page, options)
}

/** The export area answers one question; the rest sits under Other formats as nested details.
    Open a format by its summary text without toggling anything already open. */
export async function openFormat(page, name) {
  await page.evaluate(name => {
    const more = document.querySelector('.theme-handoff .handoff-more')
    more.open = true
    const format = [...more.querySelectorAll('.handoff-format')].find(
      node => node.querySelector(':scope > summary').textContent.trim() === name
    )
    if (!format) throw new Error(`No format named ${name}`)
    format.open = true
  }, name)
}

/** Pick a setup by its label and wait for its output to catch up. */
export async function chooseSetup(page, label) {
  await page.getByRole('radio', { name: label, exact: true }).check()
  await page.waitForFunction(() => !document.querySelector('.theme-handoff[data-settling]'))
}

/** Share copies the link and shows it in a popover; return the link and close the popover. */
export async function copyShareLink(page) {
  await page.getByRole('button', { name: 'Share', exact: true }).click()
  const popover = page.getByRole('dialog', { name: 'Share link', exact: true })
  await popover.getByText('Link copied', { exact: true }).waitFor()
  const link = await popover.getByRole('textbox', { name: 'Share link', exact: true }).inputValue()
  await page.keyboard.press('Escape')
  await popover.waitFor({ state: 'hidden' })
  return link
}
