import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import {
  themeDocumentFromDefinition,
  updateThemeDocument,
  compileThemeDocument
} from '@cognitap/radiant'
import { handoffAPI } from '../examples/workshop/workshop-handoff.ts'
import { handoffFixture } from './handoff-fixture.mjs'

export async function verifyMotionHandoffConsumer(browser) {
  const directory = await mkdtemp(new URL('../output/motion-consumer-', import.meta.url))
  let server
  const context = await browser.newContext({ reducedMotion: 'no-preference' })
  const errors = []
  try {
    const { document } = handoffFixture()
    const base = themeDocumentFromDefinition({
      id: 'existing',
      name: 'Existing',
      tokens: { color: { accent: '#123456' } },
      motion: { spring: { mass: 3 }, interactions: { press: { damping: 40 } } },
      components: { button: { radius: '19px' } }
    })
    const section = handoffAPI.sections(document, ['motion'])
    const expected = ['merge', 'replace'].map(mode =>
      compileThemeDocument(updateThemeDocument(base, section.sections, mode))
    )
    await writeFile(`${directory}/radiant-theme.ts`, handoffAPI.typedTheme(document))
    await writeFile(`${directory}/radiant-motion.ts`, handoffAPI.typedTheme(document, ['motion']))
    await writeFile(`${directory}/RadiantMotion.tsx`, handoffAPI.runtimeSetup().source)
    // Applications using a CSS bundler supply its asset-module declarations.
    // esbuild below still resolves and bundles the actual installed stylesheet.
    await writeFile(`${directory}/styles.d.ts`, "declare module '@cognitap/radiant/styles.css'\n")
    await writeFile(
      `${directory}/entry.tsx`,
      `import { createRoot } from 'react-dom/client'
import { useEffect, useRef, useState } from 'react'
import { Button, ThemeScope, compileThemeDocument, defineMotionProfile, type ThemeDocument } from '@cognitap/radiant'
import { MotionProvider, useSpringFollow, useReducedMotion } from '@cognitap/radiant/motion/react'
import { bindSpringStyle } from '@cognitap/radiant/motion'
import { MotionExample } from './RadiantMotion'
import { theme, themeDocument } from './radiant-theme'
import { applyMotion } from './radiant-motion'
const base = ${JSON.stringify(base)} satisfies ThemeDocument
function Follower() {
 const [target, setTarget] = useState(0)
 const marker = useRef<HTMLDivElement>(null)
 const spring = useSpringFollow(target)
 useEffect(() => { if(marker.current) return bindSpringStyle(marker.current,spring,'translateX') },[spring])
 return <><Button onClick={() => setTarget(target === 0 ? 100 : 0)}>Move follower</Button><div data-marker ref={marker} style={{width:20,height:20,background:'currentColor'}} /></>
}
function Consumer() {
 const [off, setOff] = useState(false)
 const reduced = useReducedMotion()
 const active = compileThemeDocument({...themeDocument, sections:{...themeDocument.sections, motion:{...themeDocument.sections.motion,profile:{...themeDocument.sections.motion?.profile,mode:off?'off':'system'}}}})
 return <><output data-reduced>{String(reduced)}</output><MotionExample />
 {(['merge','replace'] as const).map(mode => {const applied=applyMotion(base,mode);const compiled=compileThemeDocument(applied);return <ThemeScope key={mode} theme={compiled} data-case={mode}><MotionProvider><Button>Partial press</Button></MotionProvider><output>{JSON.stringify({motion:compiled.motion,color:applied.sections.color,components:applied.sections.components})}</output></ThemeScope>})}
 <ThemeScope theme={active} data-case="live"><MotionProvider><Button onClick={()=>setOff(value=>!value)}>Toggle theme off</Button><Follower/></MotionProvider></ThemeScope>
 <output data-defaults>{JSON.stringify(defineMotionProfile())}</output>
 </>
}
createRoot(document.getElementById('root')!).render(<Consumer />)
`
    )
    await writeFile(
      `${directory}/tsconfig.json`,
      JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          jsx: 'react-jsx',
          strict: true,
          skipLibCheck: true,
          noEmit: true
        },
        files: [
          'entry.tsx',
          'radiant-theme.ts',
          'radiant-motion.ts',
          'RadiantMotion.tsx',
          'styles.d.ts'
        ]
      })
    )
    execFileSync(
      process.execPath,
      [
        fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url)),
        '-p',
        `${directory}/tsconfig.json`
      ],
      { encoding: 'utf8', timeout: 60000 }
    )
    await build({
      entryPoints: [`${directory}/entry.tsx`],
      bundle: true,
      platform: 'browser',
      format: 'esm',
      jsx: 'automatic',
      outfile: `${directory}/bundle.js`
    })
    server = createServer(async (request, response) => {
      try {
        if (request.url === '/bundle.js')
          response
            .writeHead(200, { 'Content-Type': 'text/javascript' })
            .end(await readFile(`${directory}/bundle.js`))
        else if (request.url === '/bundle.css')
          response
            .writeHead(200, { 'Content-Type': 'text/css' })
            .end(await readFile(`${directory}/bundle.css`))
        else
          response
            .writeHead(200, { 'Content-Type': 'text/html' })
            .end(
              '<!doctype html><html lang="en"><meta charset="utf-8"><title>Motion consumer</title><link rel="stylesheet" href="/bundle.css"><div id="root"></div><script type="module" src="/bundle.js"></script></html>'
            )
      } catch {
        response.writeHead(500).end()
      }
    })
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
    const page = await context.newPage()
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`http://127.0.0.1:${server.address().port}`)
    const button = page.getByRole('button', { name: 'Press me', exact: true })
    await button.focus()
    await page.keyboard.down('Space')
    await page.waitForFunction(
      () => parseFloat(getComputedStyle(document.querySelector('button')).scale) < 0.999
    )
    await page.keyboard.up('Space')
    const disclosure = page.locator('summary').filter({ hasText: /^Details$/ })
    await disclosure.click()
    await page.waitForFunction(() => document.querySelector('details').open)
    await disclosure.click()
    await page.waitForFunction(() => !document.querySelector('details').open)
    for (const [index, mode] of ['merge', 'replace'].entries()) {
      const data = JSON.parse(await page.locator(`[data-case="${mode}"] output`).innerText())
      assert.deepEqual(data.motion, expected[index].motion)
      assert.deepEqual(data.components, base.sections.components)
      assert.deepEqual(data.color, base.sections.color)
      const native = page.locator(`[data-case="${mode}"]`).getByRole('button')
      await native.focus()
      await page.keyboard.down('Space')
      await page.waitForFunction(
        node => parseFloat(getComputedStyle(node).scale) < 0.999,
        await native.elementHandle()
      )
      await page.keyboard.up('Space')
    }
    const live = page.locator('[data-case="live"]')
    const marker = live.locator('[data-marker]')
    await live.getByRole('button', { name: 'Move follower' }).click()
    await page.waitForFunction(
      node => {
        const x = parseFloat(getComputedStyle(node).translate) || 0
        return x > 1 && x < 99
      },
      await marker.elementHandle()
    )
    await live.getByRole('button', { name: 'Move follower' }).click()
    await live.getByRole('button', { name: 'Toggle theme off' }).click()
    assert.ok(
      Math.abs(parseFloat(await marker.evaluate(node => getComputedStyle(node).translate)) || 0) <
        0.01
    )
    await live.getByRole('button', { name: 'Move follower' }).click()
    assert.equal(parseFloat(await marker.evaluate(node => getComputedStyle(node).translate)), 100)
    await live.getByRole('button', { name: 'Toggle theme off' }).click()
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForFunction(
      () => document.querySelector('[data-reduced]').textContent === 'true'
    )
    await button.focus()
    await page.keyboard.down('Space')
    assert.equal(await button.evaluate(node => getComputedStyle(node).scale), '1')
    await page.keyboard.up('Space')
    await live.getByRole('button', { name: 'Move follower' }).click()
    assert.ok(
      Math.abs(parseFloat(await marker.evaluate(node => getComputedStyle(node).translate)) || 0) <
        0.01
    )
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.waitForFunction(
      () => document.querySelector('[data-reduced]').textContent === 'false'
    )
    await button.focus()
    await page.keyboard.down('Space')
    await page.waitForFunction(
      node => parseFloat(getComputedStyle(node).scale) < 0.999,
      await button.elementHandle()
    )
    await page.keyboard.up('Space')
    assert.deepEqual(errors, [])
    console.log(
      'Motion installed consumer passed: actual generated TS/TSX compiles and bundles; native press/disclosure, selective merge/replace, inherited profiles, following interruption, live off/reduced motion and unrelated settings.'
    )
  } finally {
    await context.close()
    if (server) await new Promise(resolve => server.close(resolve))
    await rm(directory, { recursive: true, force: true })
  }
}
