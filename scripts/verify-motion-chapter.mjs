import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createServer } from 'node:http'
import { gzipSync } from 'node:zlib'
import { mkdir, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { build } from 'esbuild'
import { radiantPackage } from './radiant-package.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const engine = /node_modules\/(?:motion|motion-dom|motion-utils|framer-motion)\//
const near = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < 0.001, `${label}: ${actual} vs ${expected}`)
const quantiles = values => {
  const ordered = [...values].sort((a, b) => a - b)
  return {
    median: ordered[Math.floor(ordered.length * 0.5)],
    p95: ordered[Math.floor(ordered.length * 0.95)],
    max: ordered.at(-1)
  }
}
async function bundles(directory) {
  const base = "import{createRoot}from'react-dom/client';import{Button}from'@cognitap/radiant';"
  const render = "createRoot(document.getElementById('root')).render(<Button>Save</Button>);"
  const inputs = {
    root: base + render,
    basic:
      base +
      "import{MotionProvider}from'@cognitap/radiant/motion/react';createRoot(document.getElementById('root')).render(<MotionProvider><Button>Save</Button></MotionProvider>);",
    advanced:
      base +
      "import{MotionProvider,useSpringDrag,useSpringLayout,useSpringFollow}from'@cognitap/radiant/motion/react';window.hooks={useSpringDrag,useSpringLayout,useSpringFollow};createRoot(document.getElementById('root')).render(<MotionProvider><Button>Save</Button></MotionProvider>);",
    generic:
      base +
      "import{animate,motionValue}from'motion';window.motion={animate,motionValue};" +
      render,
    projection:
      base +
      "import{motion}from'motion/react';createRoot(document.getElementById('root')).render(<motion.div drag layout><Button>Save</Button></motion.div>);"
  }
  // Reference engines resolve from Radiant's own pinned dependency, not a source alias.
  const require = createRequire(import.meta.url)
  const motionRoot = dirname(require.resolve('@cognitap/radiant/motion'))
  const report = {}
  for (const [name, contents] of Object.entries(inputs)) {
    const result = await build({
      stdin: { contents, resolveDir: root, loader: 'tsx' },
      bundle: true,
      minify: true,
      write: false,
      metafile: true,
      jsx: 'automatic',
      platform: 'browser',
      format: 'esm',
      define: { 'process.env.NODE_ENV': '"production"' },
      plugins: [
        {
          name: 'pinned-motion-reference',
          setup(builder) {
            builder.onResolve({ filter: /^motion(?:\/react)?$/ }, args =>
              args.pluginData === 'reference'
                ? null
                : builder.resolve(args.path, {
                    resolveDir: motionRoot,
                    kind: 'import-statement',
                    pluginData: 'reference'
                  })
            )
          }
        }
      ]
    })
    const code = result.outputFiles[0].contents
    const contributing = Object.values(result.metafile.outputs).flatMap(output =>
      Object.entries(output.inputs)
        .filter(([, value]) => value.bytesInOutput > 0)
        .map(([name]) => name)
    )
    report[name] = {
      raw: code.byteLength,
      gzip: gzipSync(code, { level: 9 }).byteLength,
      engineModules: contributing.filter(name => engine.test(name))
    }
  }
  for (const entry of Object.values(report)) entry.deltaGzip = entry.gzip - report.root.gzip
  await writeFile('output/docs/motion-bundle-results.json', JSON.stringify(report, null, 2) + '\n')
  assert.equal(
    report.root.engineModules.length,
    0,
    'Root-only consumers must exclude the animation engine'
  )
  for (const name of ['basic', 'advanced']) {
    assert.ok(
      !report[name].engineModules.some(
        module => module.includes('/framer-motion/') || module.includes('/projection/')
      ),
      'Radiant scalar/drag/layout must avoid upstream React projection'
    )
    assert.ok(
      report[name].deltaGzip < report.projection.deltaGzip,
      'Radiant adapter must remain smaller than the upstream React drag/layout reference'
    )
  }
  assert.ok(
    report.basic.deltaGzip < report.generic.deltaGzip,
    'Native spring integration must stay below generic DOM animation'
  )
  await writeFile(`${directory}/bundle-results.json`, JSON.stringify(report, null, 2) + '\n')
  return report
}

export async function verifyMotionChapter(browser) {
  await mkdir('output/docs', { recursive: true })
  const directory = await mkdtemp(new URL('../output/motion-chapter-', import.meta.url))
  let server
  const report = {
    revision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    radiant: radiantPackage,
    node: process.version,
    browser: browser.version(),
    platform: process.platform,
    architecture: process.arch,
    parameters: { stiffness: 180, damping: 14, mass: 1 },
    bundler: 'esbuild production/minified ESM, React DOM included, gzip level 9',
    routes: [],
    limitations: [
      'Chromium automation; no actual assistive-technology, Safari/Firefox or stable-release audit.',
      'Native scale/height velocity is derived from rendered samples; numeric/drag/layout velocity uses public controllers.',
      'Runtime timings describe this runner, not a cross-device performance guarantee.'
    ]
  }
  try {
    report.bundles = await bundles(directory)
    await writeFile(
      `${directory}/entry.tsx`,
      "import{hydrateRoot}from'react-dom/client';import{App}from'../../scripts/fixtures/motion-chapter';const root=hydrateRoot(document.getElementById('root'),<App/>);window.unmountChapter=()=>root.unmount();"
    )
    await writeFile(
      `${directory}/ssr.tsx`,
      "import{renderToString}from'react-dom/server';import{App}from'../../scripts/fixtures/motion-chapter';export const markup=renderToString(<App/>);"
    )
    await build({
      entryPoints: [`${directory}/entry.tsx`],
      bundle: true,
      minify: true,
      platform: 'browser',
      format: 'esm',
      jsx: 'automatic',
      define: { 'process.env.NODE_ENV': '"production"' },
      outfile: `${directory}/app.js`
    })
    await build({
      entryPoints: [`${directory}/ssr.tsx`],
      bundle: true,
      platform: 'node',
      format: 'esm',
      jsx: 'automatic',
      packages: 'external',
      outfile: `${directory}/ssr.mjs`
    })
    const markup = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `const{markup}=await import(${JSON.stringify(pathToFileURL(`${directory}/ssr.mjs`).href)});process.stdout.write(markup)`
      ],
      { encoding: 'utf8', timeout: 30000 }
    )
    const routes = [
      {
        name: 'compiled',
        css: await readFile(new URL(import.meta.resolve('@cognitap/radiant/styles.css')), 'utf8')
      }
    ]
    const require = createRequire(import.meta.url)
    const manifestPath = require.resolve('@tailwindcss/cli/package.json')
    const manifest = require(manifestPath)
    await writeFile(
      `${directory}/tailwind-input.css`,
      "@import 'tailwindcss';\n@import '@cognitap/radiant/tailwind.css';\n@source '../../scripts/fixtures/motion-chapter.tsx';\n"
    )
    execFileSync(
      process.execPath,
      [
        fileURLToPath(new URL(manifest.bin.tailwindcss, pathToFileURL(manifestPath))),
        '-i',
        `${directory}/tailwind-input.css`,
        '-o',
        `${directory}/tailwind.css`,
        '--minify'
      ],
      { encoding: 'utf8', timeout: 60000 }
    )
    routes.push({ name: 'tailwind', css: await readFile(`${directory}/tailwind.css`, 'utf8') })
    let activeCSS = routes[0].css
    server = createServer(async (request, response) => {
      if (request.url === '/app.js')
        response
          .writeHead(200, { 'Content-Type': 'text/javascript' })
          .end(await readFile(`${directory}/app.js`))
      else
        response
          .writeHead(200, { 'Content-Type': 'text/html' })
          .end(
            `<!doctype html><html lang="en"><meta charset="utf-8"><title>Installed motion chapter</title><style>${activeCSS}</style><div id="root">${markup}</div><script type="module" src="/app.js"></script></html>`
          )
    })
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
    const url = `http://127.0.0.1:${server.address().port}`
    for (const route of routes) {
      activeCSS = route.css
      const context = await browser.newContext({ reducedMotion: 'no-preference' })
      try {
        const page = await context.newPage()
        const errors = []
        page.on('pageerror', error => errors.push(error.message))
        page.on('console', message => {
          if (message.type() === 'error') errors.push(message.text())
        })
        await page.goto(url)
        await page.waitForFunction(() => window.motionChapter?.active)
        const result = await page.evaluate(() => window.motionChapter.run())
        report.routes.push({ name: route.name, ...result })
        for (const [name, prior] of [
          ['press', result.press.beforePress],
          ['disclosure', result.disclosure.beforeClose]
        ]) {
          const trace = result[name]
          trace.beforeVelocity =
            ((prior[1].position - prior[0].position) * 1000) / (prior[1].time - prior[0].time)
          trace.afterVelocities = trace.after
            .slice(1)
            .map(
              (sample, index) =>
                ((sample.position - trace.after[index].position) * 1000) /
                (sample.time - trace.after[index].time)
            )
          assert.ok(trace.beforeVelocity > 0, `${name} must be moving before reversal`)
          assert.ok(
            trace.afterVelocities.some(value => value > 0),
            `${name} retains forward momentum after reversal`
          )
        }
        near(result.press.retarget.after, result.press.retarget.before, 'Button retarget position')
        assert.ok(
          result.press.after.some(sample => sample.position > result.press.retarget.before + 0.001),
          'Re-press retains the rebound direction'
        )
        near(
          result.disclosure.retarget.after,
          result.disclosure.retarget.before,
          'Disclosure retarget height'
        )
        assert.ok(
          result.disclosure.after.some(
            sample => sample.position > result.disclosure.retarget.before + 0.1
          ),
          'Closing disclosure retains opening momentum'
        )
        assert.equal(result.disclosure.closed, true)
        assert.equal(result.disclosure.inert, true)
        near(result.drag.immediate.position, result.drag.before.position, 'Drag retarget position')
        near(result.drag.immediate.velocity, result.drag.before.velocity, 'Drag retarget velocity')
        assert.ok(result.drag.before.velocity > 0)
        for (const event of result.follow.retargets) {
          near(event.immediate.position, event.before.position, 'Follower position')
          near(event.immediate.velocity, event.before.velocity, 'Follower velocity')
        }
        assert.ok(result.follow.retargets[0].before.velocity > 0)
        for (const event of result.layout.retargets)
          for (const key of ['x', 'y', 'width', 'height']) {
            near(
              event.immediate.position[key],
              event.before.position[key],
              `Layout ${key} position`
            )
            near(
              event.immediate.velocity[key],
              event.before.velocity[key],
              `Layout ${key} velocity`
            )
          }
        assert.equal(result.layout.focusRetainedOnResize, true)
        assert.deepEqual(result.layout.selection, [1, 3])
        assert.ok(['none', '1'].includes(result.layout.scale))
        assert.equal(result.layout.transform, 'none')
        for (const item of result.performance)
          assert.equal(item.reactCommits, 0, 'Spring frames must not commit React')
        result.performance = result.performance.map(item => ({
          ...item,
          frameIntervals: quantiles(item.frames.map(frame => frame.interval)),
          synchronousWork: quantiles(item.frames.map(frame => frame.work))
        }))
        const button = page.getByRole('button', { name: 'Native spring', exact: true })
        assert.equal(await button.evaluate(node => node.style.transform), 'rotate(7deg)')
        assert.ok(
          !(await button.evaluate(node => getComputedStyle(node).transitionProperty)).includes(
            'scale'
          )
        )
        assert.equal(
          await page.getByRole('button', { name: 'Disabled', exact: true }).isDisabled(),
          true
        )
        assert.equal(
          await page
            .getByRole('button', { name: 'Pending', exact: true })
            .getAttribute('aria-busy'),
          'true'
        )
        await page.evaluate(() => {
          window.staleChapter = window.motionChapter
          window.motionChapter.startPending()
          window.unmountChapter()
        })
        const first = await page.evaluate(() => window.staleChapter.read())
        await page.waitForTimeout(80)
        assert.deepEqual(
          await page.evaluate(() => window.staleChapter.read()),
          first,
          'Unmount stops owned controllers'
        )
        assert.equal(first.active, false)
        assert.deepEqual(errors, [], 'SSR hydration and runtime remain free of errors')
        Object.assign(report.routes.at(-1), {
          performance: result.performance,
          cleanup: first,
          errors
        })
      } finally {
        await context.close()
      }
    }
    report.status = 'passed'
    console.log(
      `Motion chapter passed: ${report.routes.length} installed CSS routes; native press/disclosure, signed drag/follow/layout continuity, SSR/hydration/cleanup and measured bundle/runtime policy.`
    )
  } catch (error) {
    report.status = 'failed'
    report.error = error.message
    throw error
  } finally {
    await writeFile(
      'output/docs/motion-chapter-results.json',
      JSON.stringify(report, null, 2) + '\n'
    )
    if (server) await new Promise(resolve => server.close(resolve))
    await rm(directory, { recursive: true, force: true })
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { chromium } = await import('playwright')
  const browser = await chromium.launch()
  try {
    await verifyMotionChapter(browser)
  } finally {
    await browser.close()
  }
}
