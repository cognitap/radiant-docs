import assert from 'node:assert/strict'
import test from 'node:test'
import type { Page } from 'playwright'
import { track, withSite } from './site.ts'

async function demo(page: Page, baseURL: string, route: string, title: string) {
  await page.goto(baseURL + '/docs/' + route + '/')
  const region = page.getByRole('region', { name: title, exact: true })
  await region.locator('.demo-reset:enabled').waitFor()
  return region
}

test('Wave 4 demos submit a range and a civil date and preserve invalid rename drafts', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage()
    const errors = track(page)
    try {
      const range = await demo(page, baseURL, 'range-slider', 'Filter by nightly rate')
      const lower = range.getByRole('slider', { name: 'Minimum nightly rate' })
      await lower.press('ArrowRight')
      await range.getByRole('button', { name: 'Apply price range' }).click()
      await range.getByText('price=65&price=180', { exact: true }).waitFor()
      await range.getByRole('button', { name: 'Reset price range' }).click()
      assert.equal(await lower.inputValue(), '60')

      const date = await demo(page, baseURL, 'date-field', 'Enter an invoice date')
      const day = date.locator('[data-segment=day]')
      assert.equal(await day.inputValue(), '29')
      await day.fill('27')
      await date.getByRole('button', { name: 'Enregistrer' }).click()
      await date.getByText('2028-02-27', { exact: true }).waitFor()

      const rename = await demo(page, baseURL, 'inline-edit', 'Rename a project')
      const trigger = rename.getByRole('button', { name: 'Rename project', exact: true })
      await trigger.click()
      const input = rename.getByRole('textbox', { name: 'Project name' })
      await input.fill('Archive')
      await input.press('Enter')
      await rename.getByText('Archive is already in use.', { exact: true }).waitFor()
      assert.equal(await input.inputValue(), 'Archive')
      await input.fill('Release briefing')
      await input.press('Enter')
      await rename.getByText('Release briefing', { exact: true }).waitFor()
      assert.equal(await trigger.evaluate(button => button === document.activeElement), true)
      assert.deepEqual(errors, [])
    } finally {
      await page.close()
    }
  })
})

test('Selection controls recipe submits template and repeated reviewer keys', async () => {
  await withSite(async (baseURL, browser) => {
    const page = await browser.newPage()
    const errors = track(page)
    try {
      const templates = await demo(
        page,
        baseURL,
        'recipes/selection-controls',
        'Choose a project template'
      )
      const list = templates.getByRole('listbox', { name: 'Project template' })
      await list.press('End')
      await list.press('Enter')
      await templates.getByRole('button', { name: 'Use template' }).click()
      await templates.getByText('template=launch', { exact: true }).waitFor()
      await templates.getByRole('button', { name: 'Reset choice' }).click()
      await list.getByRole('option', { name: 'Research notes', selected: true }).waitFor()

      const team = page.getByRole('region', { name: 'Choose a review team', exact: true })
      const reviewer = team.getByRole('combobox', { name: 'Review team' })
      await reviewer.fill('Sam')
      await team.getByRole('option', { name: 'Sam Novak', exact: true }).waitFor()
      await reviewer.press('ArrowDown')
      await reviewer.press('Enter')
      await team.getByRole('button', { name: 'Save review team' }).click()
      await team.getByText('reviewers=ana&reviewers=sam', { exact: true }).waitFor()
      await team.getByRole('button', { name: 'Reset team' }).click()
      await team.getByRole('button', { name: 'Save review team' }).click()
      await team.getByText('reviewers=ana', { exact: true }).waitFor()
      assert.deepEqual(errors, [])
    } finally {
      await page.close()
    }
  })
})
