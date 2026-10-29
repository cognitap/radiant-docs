import { execFileSync } from 'node:child_process'
import { mkdir, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium, type Browser, type Page } from 'playwright'
import { waitForDeployment } from '../../scripts/deployment-readiness.mjs'
import { createDocsServer } from '../../scripts/serve-docs.mjs'
import { radiantPackage } from '../../scripts/radiant-package.mjs'

const examples = path.resolve('examples')

export { radiantPackage }

export function checkoutRevision() {
  return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
}

/** Routes follow the MDX files, so a new page does not need a new test. */
export async function docRoutes() {
  const root = path.resolve('content/docs')
  const files: string[] = []
  const walk = async (dir: string) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) await walk(full)
      else if (entry.name.endsWith('.mdx')) files.push(full)
    }
  }
  await walk(root)
  return files.map(file => `/docs/${path.relative(root, file).replace(/\.mdx$/, '')}/`).sort()
}

export async function exampleSource(file: string) {
  const full = path.resolve(examples, file)
  if (!full.startsWith(`${examples}${path.sep}`))
    throw new Error(`Source escapes examples: ${file}`)
  return readFile(full, 'utf8')
}

export function track(page: Page) {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  return errors
}

/** A deployed origin, or the local static export when `DOCS_URL` is unset. */
export function deploymentOrigin() {
  const value = process.env.DOCS_URL
  if (!value) return undefined
  const url = new URL(value)
  const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
  if (
    (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) ||
    url.username ||
    url.password
  ) {
    throw new Error('Deployment verification requires an HTTPS origin, or HTTP on loopback.')
  }
  return url.origin
}

export async function withSite(run: (baseURL: string, browser: Browser) => Promise<void>) {
  const remote = deploymentOrigin()
  const browser = await chromium.launch()
  const server = remote ? undefined : createDocsServer()
  if (server) await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  try {
    if (remote) {
      await waitForDeployment((timeout: number) =>
        browser.newContext().then(async context => {
          try {
            return await context.request.get(`${remote}/deployment.json`, { timeout })
          } finally {
            await context.close()
          }
        })
      )
      await run(remote, browser)
      return
    }
    const address = server?.address()
    if (address == null || typeof address === 'string') throw new Error('Docs server has no port')
    await run(`http://127.0.0.1:${address.port}`, browser)
  } finally {
    await browser.close()
    if (server) await new Promise(resolve => server.close(resolve))
  }
}

/** Save a picture of the failed page. Passing tests do not write or compare screenshots. */
export async function capture(page: Page, name: string, run: () => Promise<void>) {
  try {
    await run()
  } catch (error) {
    await mkdir('output/docs', { recursive: true })
    await page
      .screenshot({ path: path.join('output/docs', `${name}.png`), fullPage: true })
      .catch(() => {})
    throw error
  }
}
