import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { handoffAPI } from '../examples/workshop/workshop-handoff.ts'
import { handoffFixture } from './handoff-fixture.mjs'

// Compile the actual exported TypeScript and render both handoff routes against
// the installed artifact. No library source or Storybook aliases participate.
export async function verifyHandoffConsumer(browser) {
  if (!handoffAPI) return
  const directory = await mkdtemp(new URL('../output/handoff-consumer-', import.meta.url))
  try {
    const { document } = handoffFixture()
    await writeFile(`${directory}/theme.ts`, handoffAPI.typedTheme(document))
    await writeFile(
      `${directory}/consumer.tsx`,
      `import { renderToStaticMarkup } from 'react-dom/server'
import { Button, Input, Card, CardContent, ThemeScope } from '@cognitap/radiant'
import { theme } from './theme.js'
const contents = <><Button>Installed action</Button><Input aria-label="Installed input"/><Card><CardContent>Installed surface</CardContent></Card></>
export const markup = renderToStaticMarkup(<>{(['light', 'dark', 'system'] as const).map(mode => <div key={mode}>
<ThemeScope theme={theme} mode={mode} data-proof={'typed-' + mode}>{contents}</ThemeScope>
<div className="radiant-export" data-rad-mode={mode} data-proof={'css-' + mode}>{contents}</div>
</div>)}</>)
`
    )
    await writeFile(
      `${directory}/tsconfig.json`,
      JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          jsx: 'react-jsx',
          strict: true,
          types: ['node', 'react', 'react-dom'],
          outDir: 'dist'
        },
        files: ['theme.ts', 'consumer.tsx']
      })
    )
    execFileSync(
      process.execPath,
      [
        fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url)),
        '-p',
        `${directory}/tsconfig.json`
      ],
      { encoding: 'utf8', stdio: 'pipe', timeout: 60000 }
    )
    const consumerURL = pathToFileURL(`${directory}/dist/consumer.js`)
    const markup = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `const {markup} = await import(${JSON.stringify(consumerURL.href)}); process.stdout.write(markup)`
      ],
      { encoding: 'utf8', timeout: 30000 }
    )
    const styles = await readFile(
      new URL(import.meta.resolve('@cognitap/radiant/styles.css')),
      'utf8'
    )
    const page = await browser.newPage()
    try {
      await page.setContent(`<style>${styles}\n${handoffAPI.cssOutput(document)}</style>${markup}`)
      for (const preference of ['light', 'dark']) {
        await page.emulateMedia({ colorScheme: preference })
        await page.waitForFunction(() =>
          document.getAnimations().every(animation => animation.playState !== 'running')
        )
        for (const mode of ['light', 'dark', 'system']) {
          const actualMode = mode === 'system' ? preference : mode
          const typed = page.locator(`[data-proof="typed-${mode}"]`)
          const css = page.locator(`[data-proof="css-${mode}"]`)
          const measure = region =>
            region.evaluate(node => {
              const button = node.querySelector('button'),
                input = node.querySelector('input'),
                card = node.querySelector('[data-slot~="card"]')
              return {
                background: getComputedStyle(node).backgroundColor,
                font: getComputedStyle(node).fontFamily,
                action: getComputedStyle(button).backgroundColor,
                radius: getComputedStyle(button).borderRadius,
                inputRadius: getComputedStyle(input).borderRadius,
                motion: getComputedStyle(node)
                  .getPropertyValue('--rad-motion-release-duration')
                  .trim(),
                cardShadow: getComputedStyle(card).boxShadow
              }
            })
          const expected = await measure(typed)
          assert.deepEqual(
            await measure(css),
            expected,
            `${mode}/${preference}: copied CSS and typed exports render the same installed theme`
          )
          assert.equal(expected.radius, '27px')
          assert.equal(expected.inputRadius, '19px')
          assert.equal(expected.motion, '237ms')
          assert.ok(expected.font.includes('Local Display'))
          if (actualMode === 'dark') assert.equal(expected.background, 'rgb(17, 34, 51)')
        }
      }
    } finally {
      await page.close()
    }
    console.log(
      'Handoff installed consumer passed: generated TypeScript compiles, public package SSR, copied CSS equals typed ThemeScope in light/dark/live system modes, component exceptions, fonts and motion.'
    )
  } catch (error) {
    if (error.stdout) process.stderr.write(String(error.stdout))
    if (error.stderr) process.stderr.write(String(error.stderr))
    throw error
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}
