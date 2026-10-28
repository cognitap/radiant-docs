import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
import { colorAPI } from '../examples/workshop/workshop-color.ts'

// DEV-151's agreed opaque sRGB reference set, including the workshop's initial seed.
const brands = [
  '#7C3AED',
  '#FF0000',
  '#0000FF',
  '#FFFF00',
  '#00FF00',
  '#00FFFF',
  '#7F6A75',
  '#F5E6FF',
  '#17111F',
  '#808080',
  '#000000',
  '#FFFFFF'
]

export async function verifyBrandReference(browser, baseURL) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 1000 },
    reducedMotion: 'reduce'
  })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  const cases = []
  try {
    await page.goto(`${baseURL}/docs/workshop/`)
    const frame = page.getByRole('region', { name: 'Shared theme workshop', exact: true })
    await page.waitForFunction(
      () => !document.querySelector('.theme-workshop .demo-controls button').disabled
    )
    const brand = frame.getByRole('textbox', { name: 'Brand color', exact: true })
    const mode = frame.getByRole('combobox', { name: 'Preview mode', exact: true })
    const specimen = frame.getByRole('combobox', { name: 'Specimen', exact: true })
    const canvas = frame.locator('.workshop-canvas')
    const wallPreset = frame.getByRole('combobox', { name: 'Wall preset', exact: true })
    const rampPreset = frame.getByRole('combobox', { name: 'Brand ramp preset', exact: true })
    for (const wall of ['classic', 'balanced', 'expressive'])
      for (const ramp of ['classic', 'balanced', 'expressive']) {
        await wallPreset.selectOption(wall)
        await rampPreset.selectOption(ramp)
        const expected = colorAPI.create({
          input: { brand: '#7C3AED', wallPreset: wall, rampPreset: ramp }
        })
        await page.waitForFunction(expected => {
          const rows = [...document.querySelectorAll('.color-wall tbody tr')]
          return expected.every((p, i) =>
            p.swatches.every(s => rows[i].textContent.includes(s.value))
          )
        }, expected.wall.color.palettes)
        assert.equal(
          await frame
            .getByRole('checkbox', { name: 'Automatic wall vividness', exact: true })
            .isChecked(),
          true
        )
        assert.equal(
          await frame
            .getByRole('checkbox', { name: 'Automatic brand vividness', exact: true })
            .isChecked(),
          true
        )
      }
    await frame.getByRole('button', { name: 'Reset color', exact: true }).click()
    assert.equal(await wallPreset.inputValue(), 'balanced')
    assert.equal(await rampPreset.inputValue(), 'balanced')
    for (const value of brands) {
      const session = colorAPI.create({ input: { brand: value } })
      const { wall, palette } = session
      assert.equal(wall.input.fidelity, 'anchored')
      assert.equal(palette.pass, true, `${value}: required semantic contrast pairs`)
      await brand.fill(value)
      await page.waitForFunction(
        seed => document.querySelector('[data-testid="color-fidelity"]').textContent.includes(seed),
        value
      )
      assert.equal(await frame.locator('.color-swatch').count(), 198)
      const rows = await frame.locator('.color-wall tbody tr').allTextContents()
      for (const [index, family] of wall.color.palettes.entries())
        for (const swatch of family.swatches)
          assert.ok(
            rows[index].includes(swatch.value),
            `${value}/${family.id}/${swatch.stop}: production wall matches`
          )
      for (const [role, family] of Object.entries(palette.working))
        assert.equal(
          await frame.getByRole('combobox', { name: `${role} family`, exact: true }).inputValue(),
          family.paletteId
        )
      const slug = value.slice(1).toLowerCase()
      await frame.locator('.color-wall-scroll').screenshot({
        path: `output/docs/brand-${slug}-wall.png`,
        style: '.color-wall-scroll { max-height: none !important; overflow: visible !important; }'
      })
      await frame
        .locator('.color-working')
        .screenshot({ path: `output/docs/brand-${slug}-working.png` })
      for (const selectedMode of ['light', 'dark']) {
        await mode.selectOption(selectedMode)
        const expected = Object.fromEntries(
          Object.entries(palette.color.modes[selectedMode]).map(([key, value]) => [
            `--rad-color-${key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`,
            value
          ])
        )
        expected['--rad-surface-canvas'] = palette.surface.modes[selectedMode].canvas
        const actual = await canvas.evaluate(
          (node, keys) =>
            Object.fromEntries(
              keys.map(key => [key, getComputedStyle(node).getPropertyValue(key).trim()])
            ),
          Object.keys(expected)
        )
        assert.deepEqual(actual, expected, `${value}/${selectedMode}: actual semantic variables`)
        for (const choice of ['article', 'form', 'dashboard', 'landing', 'components']) {
          await specimen.selectOption(choice)
          assert.equal(await canvas.isVisible(), true)
          if (choice === 'form') {
            await canvas.screenshot({ path: `output/docs/brand-${slug}-${selectedMode}.png` })
          }
        }
        await frame
          .getByRole('combobox', { name: 'Component state', exact: true })
          .selectOption('invalid')
        assert.ok(await canvas.locator('section:not([hidden]) input[aria-invalid="true"]').count())
        await frame
          .getByRole('combobox', { name: 'Component state', exact: true })
          .selectOption('rest')
        cases.push({
          brand: value,
          mode: selectedMode,
          anchor: wall.color.anchor.stop,
          requiredPairs: palette.checks.filter(
            check => check.minimum !== null && check.mode === selectedMode
          ).length,
          specimens: 5,
          result: 'pass'
        })
      }
    }
    assert.deepEqual(errors, [], 'no reference-set hydration/runtime errors')
    await writeFile(
      'output/docs/brand-reference.json',
      `${JSON.stringify(
        {
          defaults: {
            fidelity: 'anchored',
            gamut: 'srgb',
            lightness: 'hue-aware',
            wallPreset: 'balanced',
            rampPreset: 'balanced'
          },
          ownerDecision: 'DEV-160: Ready — keep Balanced defaults; nearby readable UI fills',
          review:
            'Production owner review accepted; automated proof remains scoped to the recorded fixtures and states.',
          cases
        },
        null,
        2
      )}\n`
    )
    console.log(
      'Brand reference passed: 12 exact-source 198-swatch walls, six working families, 24 semantic modes, 120 realistic specimens; wall/palette/form captures retained for visual review.'
    )
  } finally {
    await page.close()
  }
}
