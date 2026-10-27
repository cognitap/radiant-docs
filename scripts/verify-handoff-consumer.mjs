import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import * as Radiant from '@cognitap/radiant'
import { handoffAPI } from '../examples/workshop/workshop-handoff.ts'
import { handoffFixture } from './handoff-fixture.mjs'

// Compile the actual exported TypeScript and render both handoff routes against
// the installed artifact. No library source or Storybook aliases participate.
export async function verifyHandoffConsumer(browser) {
  if (!handoffAPI) return
  await mkdir(new URL('../output/', import.meta.url), { recursive: true })
  const directory = await mkdtemp(new URL('../output/handoff-consumer-', import.meta.url))
  try {
    const { document, recipes } = handoffFixture()
    const full = handoffAPI.read(JSON.stringify(handoffAPI.configuration(document, recipes)))
    const base = handoffAPI.configuration(
      Radiant.themeDocumentFromDefinition({
        id: 'partial-target',
        name: 'Partial target',
        tokens: {
          typography: { family: '"Local Display", serif' },
          motion: { releaseDuration: '237ms' },
          control: { small: { fontSize: '1.321rem' } }
        },
        components: { button: { radius: '27px' }, input: { radius: '19px' } }
      }),
      {}
    )
    const partial = handoffAPI.read(
      JSON.stringify(handoffAPI.sections(document, ['color', 'surface', 'control', 'spacing']))
    )
    const cases = [
      { name: 'full', document: handoffAPI.apply(base, full, 'replace').document },
      ...['merge', 'replace'].map(mode => ({
        name: mode,
        document: handoffAPI.apply(base, partial, mode).document
      }))
    ]
    assert.equal(cases[1].document.id, 'partial-target')
    assert.equal(cases[1].document.sections.control.values.small.fontSize, '1.321rem')
    assert.equal(cases[2].document.sections.control.values.small?.fontSize, undefined)
    for (const item of cases.slice(1)) {
      assert.deepEqual(item.document.sections.typography, base.document.sections.typography)
      assert.deepEqual(item.document.sections.components, base.document.sections.components)
    }
    if (typeof Reflect.get(Radiant, 'generateTypography') === 'function')
      cases.push({
        name: 'typesetting',
        document: Radiant.updateThemeDocument(cases[0].document, {
          typography: {
            typesetting: {
              fonts: { ui: { family: '"Local Display", serif', profile: 'manual' } },
              ui: { size: 18, lineHeight: 1.7 },
              styles: { 'ui-label': { weight: 650 } }
            },
            // Recipe-owned UI must win over these retained legacy values.
            values: { bodySize: '1.5rem', bodyWeight: 300 }
          }
        })
      })
    const typeSource =
      cases.find(item => item.name === 'typesetting')?.document ?? cases[0].document
    await writeFile(`${directory}/typography.ts`, handoffAPI.typedTheme(typeSource, ['typography']))
    for (const item of cases)
      await writeFile(`${directory}/${item.name}.ts`, handoffAPI.typedTheme(item.document))
    await writeFile(
      `${directory}/consumer.tsx`,
      `import { renderToStaticMarkup } from 'react-dom/server'
import { useId } from 'react'
import { compileThemeDocument, Button, Input, Card, CardContent, ThemeScope, defaultTheme, Link, Checkbox, Radio, RadioGroup, Field, Dialog, DialogContent, DialogTitle, Collapsible, CollapsibleTrigger, CollapsibleContent, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@cognitap/radiant'
${cases.map(item => `import { theme as ${item.name}Theme } from './${item.name}.js'`).join('\n')}
import { themeDocument as partialBase } from './merge.js'
import { applyTypography } from './typography.js'
const typographyTheme = compileThemeDocument(applyTypography(partialBase))
function Contents() { const name = useId(); return <>
<Button>Installed action</Button><Button controlSize="small">Small action</Button><Button disabled>Disabled action</Button><Button pending>Busy action</Button>
<Input aria-label="Installed input"/><Field label="Invalid field" error="Invalid value"><Input aria-label="Invalid input" aria-invalid="true"/></Field>
<Link href="#target">Installed link</Link><Checkbox defaultChecked label="Installed check"/>
<RadioGroup label="Proof radio" name={name} defaultValue="one"><Radio value="one" label="Installed radio"/></RadioGroup>
<Card><CardContent>Installed surface</CardContent></Card>
<Dialog><DialogContent><DialogTitle>Installed dialog</DialogTitle></DialogContent></Dialog>
<Collapsible defaultOpen><CollapsibleTrigger>Disclosure</CollapsibleTrigger><CollapsibleContent>Disclosure content</CollapsibleContent></Collapsible>
<Accordion type="single" defaultValue="one"><AccordionItem value="one"><AccordionTrigger>Accordion</AccordionTrigger><AccordionContent>Accordion content</AccordionContent></AccordionItem></Accordion>
<div data-inherited><Input aria-label="Inherited input"/></div>
<ThemeScope theme={defaultTheme} mode="light" data-nested><Button>Nested reset</Button></ThemeScope>
</> }
export const markup = renderToStaticMarkup(<>{[${cases.map(item => `{name: '${item.name}', theme: ${item.name}Theme}`).join(',')}].map(item =>
(['light', 'dark', 'system'] as const).map(mode => <div key={item.name + mode}>
<ThemeScope theme={item.theme} mode={mode} data-proof={item.name + '-typed-' + mode}><Contents/></ThemeScope>
<div className="radiant-export" data-case={item.name} data-rad-mode={mode} data-proof={item.name + '-css-' + mode}><Contents/></div>
</div>))}
{(['light', 'dark', 'system'] as const).map(mode => <ThemeScope key={mode} theme={mergeTheme} mode={mode}>
<ThemeScope theme={typographyTheme} mode={mode} data-proof={'typography-typed-' + mode}><Contents/></ThemeScope>
<div className="radiant-typography" data-rad-mode={mode} data-proof={'typography-css-' + mode}><Contents/></div>
</ThemeScope>)}
</>)
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
        files: [...cases.map(item => `${item.name}.ts`), 'typography.ts', 'consumer.tsx']
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
      { encoding: 'utf8', timeout: 30000, maxBuffer: 8 * 1024 * 1024 }
    )
    const require = createRequire(import.meta.url)
    const cliManifest = require('@tailwindcss/cli/package.json')
    const cli = fileURLToPath(
      new URL(
        cliManifest.bin.tailwindcss,
        pathToFileURL(require.resolve('@tailwindcss/cli/package.json'))
      )
    )
    const compiled = await readFile(
      new URL(import.meta.resolve('@cognitap/radiant/styles.css')),
      'utf8'
    )
    const reset = await readFile(
      new URL(import.meta.resolve('@cognitap/radiant/reset.css')),
      'utf8'
    )
    const routes = [
      { name: 'compiled', styles: compiled },
      { name: 'compiled-reset', styles: `${reset}\n${compiled}` }
    ]
    for (const withReset of [true, false]) {
      const imports = withReset
        ? "@import 'tailwindcss';"
        : "@layer theme, base, components, utilities;\n@import 'tailwindcss/theme.css' layer(theme);\n@import 'tailwindcss/utilities.css' layer(utilities);"
      await writeFile(
        `${directory}/input.css`,
        `${imports}\n@import '@cognitap/radiant/tailwind.css';`
      )
      execFileSync(
        process.execPath,
        [cli, '-i', `${directory}/input.css`, '-o', `${directory}/tailwind.css`, '--minify'],
        { encoding: 'utf8', timeout: 60000 }
      )
      routes.push({
        name: withReset ? 'tailwind' : 'tailwind-no-reset',
        styles: await readFile(`${directory}/tailwind.css`, 'utf8')
      })
    }
    const css =
      cases
        .map(item =>
          handoffAPI
            .cssOutput(item.document)
            .replaceAll('.radiant-export', `.radiant-export[data-case="${item.name}"]`)
        )
        .join('\n') +
      '\n' +
      handoffAPI.cssOutput(typeSource, ['typography'])
    const parity = new Map()
    const page = await browser.newPage({ reducedMotion: 'reduce' })
    try {
      for (const route of routes) {
        await page.setContent(`<style>${route.styles}\n${css}</style>${markup}`)
        for (const preference of ['light', 'dark']) {
          await page.emulateMedia({ colorScheme: preference })
          await page.waitForFunction(() =>
            document.getAnimations().every(a => a.playState !== 'running')
          )
          for (const item of [...cases, { name: 'typography', document: typeSource }])
            for (const mode of ['light', 'dark', 'system']) {
              const measure = async kind =>
                page.locator(`[data-proof="${item.name}-${kind}-${mode}"]`).evaluate(node => {
                  const properties = [
                    'background-color',
                    'color',
                    'border-radius',
                    'border-width',
                    'border-color',
                    'padding',
                    'min-height',
                    'height',
                    'box-shadow',
                    'font-family',
                    'font-size',
                    'font-weight',
                    'line-height',
                    'letter-spacing',
                    'gap',
                    'outline-color',
                    'outline-width'
                  ]
                  const styles = element =>
                    Object.fromEntries(
                      properties.map(key => [key, getComputedStyle(element).getPropertyValue(key)])
                    )
                  return {
                    root: styles(node),
                    samples: Object.fromEntries(
                      [
                        'button',
                        'button:disabled',
                        'button[aria-busy=true]',
                        'button[data-control-size=small]',
                        'input[aria-invalid]',
                        'a',
                        'input[type=checkbox]',
                        'input[type=radio]',
                        '[data-slot=card]',
                        'details',
                        '[data-slot=accordion]',
                        '[data-inherited] input',
                        '[data-nested] button'
                      ].map(selector => [selector, styles(node.querySelector(selector))])
                    ),
                    motion: getComputedStyle(node)
                      .getPropertyValue('--rad-motion-release-duration')
                      .trim()
                  }
                })
              const expected = await measure('typed')
              const actual = await measure('css')
              if (item.name === 'typography') {
                // A typography-only wrapper inherits the painted canvas; it does
                // not paint an additional background. All text/layout/control
                // properties must still match applying the typed partial.
                delete expected.root['background-color']
                delete actual.root['background-color']
              }
              assert.deepEqual(
                actual,
                expected,
                `${route.name}/${item.name}/${mode}/${preference}: typed/CSS parity`
              )
              assert.equal(expected.samples.button['border-radius'], '27px')
              assert.equal(expected.motion, '237ms')
              assert.ok(expected.root['font-family'].includes('Local Display'))
              if (item.name === 'typesetting') {
                assert.equal(expected.root['font-size'], '18px')
                assert.equal(expected.root['line-height'], '30.6px')
                assert.equal(expected.root['font-weight'], '400')
              }
              if (item.name !== 'typography' && (mode === 'system' ? preference : mode) === 'dark')
                assert.equal(expected.root['background-color'], 'rgb(17, 34, 51)')
              const key = `${route.name.includes('reset') ? 'no-reset' : 'reset'}-${item.name}-${mode}-${preference}`
              // Match the same reset choice: compiled(no reset), compiled-reset;
              // Tailwind includes Preflight unless explicitly omitted.
              const parityKey = `${['compiled-reset', 'tailwind'].includes(route.name)}-${item.name}-${mode}-${preference}`
              if (route.name.startsWith('compiled')) parity.set(parityKey, expected)
              else
                assert.deepEqual(
                  expected,
                  parity.get(parityKey),
                  `${route.name}: installed style route parity (${key})`
                )
            }
        }
        for (const kind of ['typed', 'css']) {
          const scope = page.locator(`[data-proof="full-${kind}-light"]`)
          const action = scope.getByRole('button', { name: 'Installed action', exact: true })
          await action.focus()
          assert.equal(
            await action.evaluate(n => parseFloat(getComputedStyle(n).outlineWidth) > 0),
            true
          )
          const disabled = scope.getByRole('button', { name: 'Disabled action', exact: true })
          assert.equal(await disabled.isDisabled(), true)
          const before = await disabled.evaluate(n => getComputedStyle(n).backgroundColor)
          await disabled.hover()
          assert.equal(await disabled.evaluate(n => getComputedStyle(n).backgroundColor), before)
          const dialog = scope.locator('dialog')
          await dialog.evaluate(n => n.showModal())
          assert.equal(await dialog.isVisible(), true)
          assert.equal(await dialog.evaluate(n => getComputedStyle(n).borderRadius), '24px')
          await dialog.evaluate(n => n.close())
        }
      }
    } finally {
      await page.close()
    }
    console.log(
      'Handoff installed consumer passed: actual exported TypeScript, complete/partial merge/replace, compiled CSS and Tailwind with/without reset, light/dark/live system, inherited/nested scopes, all ten families, focus/disabled/invalid/modal states, fonts, motion and exceptions.'
    )
  } catch (error) {
    if (error.stdout) process.stderr.write(String(error.stdout).slice(0, 8000))
    if (error.stderr) process.stderr.write(String(error.stderr))
    throw error
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}
