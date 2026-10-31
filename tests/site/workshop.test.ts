import assert from 'node:assert/strict'
import test from 'node:test'
import type { Page } from 'playwright'
import { capture, withSite } from './site.ts'

test('a workshop journey edits each section and opens the same share link', async () => {
  await withSite(async (baseURL, browser) => {
    for (const viewport of [
      { width: 1280, height: 800 },
      { width: 390, height: 844 }
    ] as const) {
      const page = await browser.newPage({
        viewport,
        permissions: ['clipboard-read', 'clipboard-write']
      })
      try {
        await capture(page, `workshop-${viewport.width}`, () =>
          journey(page, baseURL, viewport.width)
        )
      } finally {
        await page.close()
      }
    }
  })
})

async function journey(page: Page, baseURL: string, width: number) {
  const where = `${width}px`
  await page.goto(`${baseURL}/workshop/`)
  const frame = page.getByRole('region', { name: 'Shared theme workshop', exact: true })
  await frame.getByRole('button', { name: /^Start from Radiant:/ }).click()

  const colorBefore = await section(page, 'color')
  const generate = frame.getByRole('button', { name: 'Generate from the accent', exact: true })
  if ((await generate.count()) > 0) {
    await generate.click()
    await untilChanges(page, 'color', colorBefore, where)
  }
  const brand = frame.getByRole('textbox', { name: 'Brand color', exact: true })
  const nextBrand = (await brand.inputValue()).toLowerCase() === '#166534' ? '#1d4ed8' : '#166534'
  const branded = await section(page, 'color')
  await brand.fill(nextBrand)
  const colorAfter = await untilChanges(page, 'color', branded, where)

  await frame.getByRole('button', { name: 'Spacing & surfaces', exact: true }).click()
  const spacingBefore = await section(page, 'spacing')
  const preset = frame.getByRole('button', { name: 'Start from Balanced', exact: true })
  if ((await preset.count()) > 0) {
    await preset.click()
    await untilChanges(page, 'spacing', spacingBefore, where)
  }
  const spacing = frame.getByRole('spinbutton', { name: 'Breathing room', exact: true })
  const spaced = await section(page, 'spacing')
  await spacing.fill((await spacing.inputValue()) === '1.5' ? '0.75' : '1.5')
  await untilChanges(page, 'spacing', spaced, where)

  await frame.getByRole('button', { name: 'Motion', exact: true }).click()
  const motionBefore = await section(page, 'motion')
  const starting = frame.getByRole('radiogroup', { name: 'Starting point', exact: true })
  const expressive = starting.getByRole('radio', { name: 'Expressive', exact: true })
  const restrained = starting.getByRole('radio', { name: 'Restrained', exact: true })
  await ((await expressive.isChecked()) ? restrained : expressive).click()
  await untilChanges(page, 'motion', motionBefore, where)

  await frame.getByRole('button', { name: 'Typography', exact: true }).click()
  let typed = await section(page, 'typography')
  const startType = frame.getByRole('button', { name: 'Start with Inter', exact: true })
  if ((await startType.count()) > 0) {
    await startType.click()
    typed = await untilChanges(page, 'typography', typed, where)
  }
  const families = frame.getByRole('group', { name: 'UI assignment', exact: true })
  const radios = families.getByRole('radio')
  const count = await radios.count()
  let picked = false
  for (let index = 0; index < count; index += 1) {
    const radio = radios.nth(index)
    if (await radio.isChecked()) continue
    await radio.click()
    picked = true
    break
  }
  assert.equal(picked, true, `${where} has another type family`)
  const typeAfter = await untilChanges(page, 'typography', typed, where)

  await frame.getByRole('button', { name: 'Undo', exact: true }).click()
  assert.equal(await untilSection(page, 'typography', typed), typed, `${where} undo`)
  await frame.getByRole('button', { name: 'Redo', exact: true }).click()
  assert.equal(await untilSection(page, 'typography', typeAfter), typeAfter, `${where} redo`)
  assert.equal(await section(page, 'color'), colorAfter, `${where} keeps the brand edit`)

  await frame.getByRole('button', { name: 'Share', exact: true }).click()
  const link = await page.getByRole('textbox', { name: 'Share link', exact: true }).inputValue()
  const shared = document(await exportText(page))
  await page.goto(link)
  assert.deepEqual(document(await exportText(page)), shared, `${where} share link`)
}

function document(source: string) {
  const marker = 'export const themeDocument = '
  const start = source.indexOf(marker)
  const end = source.indexOf(' satisfies ThemeDocument')
  if (start < 0 || end < start) throw new Error('Typed theme export is missing')
  return JSON.parse(source.slice(start + marker.length, end)) as {
    sections: Record<string, unknown>
  }
}

async function exportText(page: Page) {
  const field = page.getByRole('textbox', { name: 'Typed theme output', exact: true })
  const handoff = page.getByRole('region', { name: 'Theme handoff', exact: true })
  const started = Date.now()
  let text = ''
  while (Date.now() - started < 8_000) {
    text = await field.inputValue()
    if ((await handoff.getAttribute('data-settling')) === null && text.includes(marker()))
      return text
    await page.waitForTimeout(50)
  }
  throw new Error('Typed theme export did not settle')
}

function marker() {
  return 'export const themeDocument = '
}

async function section(page: Page, name: string) {
  return JSON.stringify(document(await exportText(page)).sections[name] ?? null)
}

async function untilSection(page: Page, name: string, expected: string) {
  const started = Date.now()
  let current = ''
  while (Date.now() - started < 8_000) {
    current = await section(page, name)
    if (current === expected) return current
    await page.waitForTimeout(50)
  }
  return current
}

async function untilChanges(page: Page, name: string, previous: string, where: string) {
  const started = Date.now()
  let current = previous
  while (Date.now() - started < 8_000) {
    current = await section(page, name)
    if (current !== previous) return current
    await page.waitForTimeout(50)
  }
  assert.notEqual(current, previous, `${where} ${name} export`)
  return current
}
