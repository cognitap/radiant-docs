// Exercise the active public control rather than legacy leaves hidden by a recipe.
export async function setTypographyFamily(workshop, size) {
  const legacy = workshop.getByRole('combobox', { name: 'Body family', exact: true })
  if (await legacy.count()) {
    await legacy.selectOption('Georgia, serif')
    if (size)
      await workshop
        .getByRole('combobox', { name: 'Body size', exact: true })
        .selectOption(`${size / 16}rem`)
    return '--rad-typography-family'
  }
  const editor = workshop.locator('.typesetting-editor')
  const details = editor.locator('details').filter({
    hasText: 'Use another installed family or fallback stack'
  })
  if (!(await details.evaluate(node => node.open)))
    await details.locator(':scope > summary').click()
  await editor.getByRole('combobox', { name: 'Manual assignment', exact: true }).selectOption('ui')
  await editor
    .getByRole('textbox', { name: 'Manual CSS family', exact: true })
    .fill('Georgia, serif')
  await editor.getByRole('button', { name: 'Use manual family', exact: true }).click()
  if (size)
    await editor.getByRole('spinbutton', { name: 'UI size (px)', exact: true }).fill(String(size))
  return '--rad-typography-roles-ui-body-family'
}
