const toggle = scope => scope.getByRole('button', { name: 'Preview options', exact: true })
const folded = async scope => (await toggle(scope).isVisible()) && toggle(scope)

/** Below the two-column breakpoint the scene, mode and width controls fold behind Preview options. */
export async function openPreviewOptions(scope) {
  const button = await folded(scope)
  if (button && (await button.getAttribute('aria-expanded')) === 'false') await button.click()
}

export async function closePreviewOptions(scope) {
  const button = await folded(scope)
  if (button && (await button.getAttribute('aria-expanded')) === 'true') await button.click()
}
