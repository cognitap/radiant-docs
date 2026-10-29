import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'
import { chromium } from 'playwright'
import { createDocsServer } from './serve-docs.mjs'
import { radiantPackage } from './radiant-package.mjs'
import { verifyHandoff } from './verify-handoff.mjs'
import { verifyHandoffConsumer } from './verify-handoff-consumer.mjs'
import { verifyGeometryEditor } from './verify-geometry-editor.mjs'
import { verifyColorEditor } from './verify-color-editor.mjs'
import { verifyMotionEditor } from './verify-motion-editor.mjs'
import { verifyMotionHandoff } from './verify-motion-handoff.mjs'
import { verifyMotionHandoffConsumer } from './verify-motion-handoff-consumer.mjs'
import { verifyMotionChapter } from './verify-motion-chapter.mjs'
import { verifyWorkshop } from './verify-workshop.mjs'
import { verifyStart } from './verify-start.mjs'
import { verifyHistory } from './verify-history.mjs'
import { verifyInspect } from './verify-inspect.mjs'
import { verifyNarrow } from './verify-narrow.mjs'
import { verifyTypographyChapter } from './verify-typography-chapter.mjs'
import { verifyTypesettingEditor } from './verify-typesetting-editor.mjs'
import { verifyFontEditor } from './verify-font-editor.mjs'
import { waitForDeployment } from './deployment-readiness.mjs'

const { values } = parseArgs({ options: { url: { type: 'string' } } })
const remote = values.url ? new URL(values.url) : undefined
const loopback = remote && ['127.0.0.1', 'localhost', '[::1]'].includes(remote.hostname)
if (
  remote &&
  ((remote.protocol !== 'https:' && !(remote.protocol === 'http:' && loopback)) ||
    remote.pathname !== '/' ||
    remote.search ||
    remote.hash ||
    remote.username ||
    remote.password)
) {
  throw new Error(
    'Deployment verification requires an HTTPS origin (or HTTP loopback) without a path, query or credentials.'
  )
}
const server = remote ? undefined : createDocsServer()
if (server) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const baseURL = remote?.origin ?? `http://127.0.0.1:${server.address().port}`
const startedAt = new Date().toISOString()
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
await mkdir(new URL('../output/docs/', import.meta.url), { recursive: true })
let passed = false
let browser

try {
  browser = await chromium.launch()
  const deploymentResponse = await browser.newContext().then(async context => {
    try {
      const response = await waitForDeployment(timeout =>
        context.request.get(`${baseURL}/deployment.json`, { timeout: Math.min(timeout, 10000) })
      )
      assert.equal(response.status(), 200, 'Deployment metadata is a real static asset.')
      return await response.json()
    } finally {
      await context.close()
    }
  })
  assert.equal(
    deploymentResponse.revision,
    revision,
    'Verify the deployment from this exact checkout.'
  )
  assert.equal(deploymentResponse.radiantVersion, radiantPackage.version)
  assert.equal(deploymentResponse.schemaVersion, 1)
  assert.equal(deploymentResponse.candidate, radiantPackage.candidate)
  assert.equal(deploymentResponse.experimental, true)
  await verifyWorkshop(browser, baseURL)
  await verifyStart(browser, baseURL)
  await verifyHistory(browser, baseURL)
  await verifyInspect(browser, baseURL)
  await verifyNarrow(browser, baseURL)
  await verifyMotionEditor(browser, baseURL)
  await verifyFontEditor(browser, baseURL)
  await verifyTypesettingEditor(browser, baseURL)
  await verifyTypographyChapter(browser, baseURL)
  await verifyColorEditor(browser, baseURL)
  await verifyGeometryEditor(browser, baseURL)
  await verifyHandoff(browser, baseURL)
  await verifyMotionHandoff(browser, baseURL)
  await verifyHandoffConsumer(browser)
  await verifyMotionHandoffConsumer(browser)
  await verifyMotionChapter(browser)
  passed = true
} finally {
  await writeFile(
    new URL('../output/docs/verification.json', import.meta.url),
    `${JSON.stringify(
      {
        status: passed ? 'passed' : 'failed',
        target: remote
          ? loopback
            ? 'supplied loopback origin'
            : 'deployment'
          : 'local static export',
        baseURL,
        revision,
        radiant: radiantPackage,
        startedAt,
        finishedAt: new Date().toISOString(),
        node: process.version,
        browser: browser?.version() ?? null,
        platform: process.platform,
        architecture: process.arch,
        limitations: [
          'Chromium automation only; no manual screen-reader, Safari or Firefox verification is claimed.'
        ]
      },
      null,
      2
    )}\n`
  )
  await browser?.close()
  if (server) await new Promise(resolve => server.close(resolve))
}
