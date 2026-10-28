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
  const details = editor.locator('.typesetting-manual')
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

/** The radio group named `group` inside `scope`: face cards, chips and the role list. */
export const radioGroup = (scope, group) =>
  scope.locator(`[role="radiogroup"][aria-label=${JSON.stringify(group)}]`)
export async function pickRadio(scope, group, value) {
  await radioGroup(scope, group)
    .locator(`input[value=${JSON.stringify(value)}]`)
    .check()
}
export const pickedRadio = (scope, group) =>
  radioGroup(scope, group).locator('input:checked').inputValue()
