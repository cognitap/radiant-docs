import assert from 'node:assert/strict'
import { test } from 'node:test'
import { deploymentBranch } from './deploy-pages.mjs'
import { waitForDeployment } from './deployment-readiness.mjs'

test('first-deployment TLS propagation must finish before browser verification starts', async () => {
  let attempts = 0
  const ready = { status: () => 200 }
  const response = await waitForDeployment(
    async () => {
      attempts += 1
      if (attempts === 1)
        throw new Error('apiRequestContext.get: write EPROTO ssl/tls alert handshake failure')
      return ready
    },
    { intervalMs: 1 }
  )
  assert.equal(response, ready)
  assert.equal(attempts, 2)
})

test('edge readiness is bounded when the host never becomes available', async () => {
  let clock = 0
  let attempts = 0
  await assert.rejects(
    () =>
      waitForDeployment(
        async () => {
          attempts += 1
          return { status: () => 503 }
        },
        {
          timeoutMs: 30,
          intervalMs: 10,
          now: () => clock,
          sleep: async ms => {
            clock += ms
          }
        }
      ),
    /did not become ready within 30ms/
  )
  assert.equal(attempts, 3)
})

test('authentication and permanent application errors fail immediately', async () => {
  let attempts = 0
  await assert.rejects(
    () =>
      waitForDeployment(async () => {
        attempts += 1
        return { status: () => 403 }
      }),
    /Deployment returned HTTP 403/
  )
  assert.equal(attempts, 1)
  await assert.rejects(
    () =>
      waitForDeployment(async () => {
        throw new Error('Unexpected metadata failure')
      }),
    /Unexpected metadata failure/
  )
})

test('a preview invocation cannot select the production branch', () => {
  for (const branch of [undefined, '', 'main', 'Main', 'feature/docs', '--production']) {
    assert.throws(() => deploymentBranch({ branch }), /Preview requires/)
  }
  assert.equal(deploymentBranch({ branch: 'pr-10' }), 'pr-10')
})

test('production requires an explicit selection and cannot silently use another branch', () => {
  assert.throws(() => deploymentBranch({ production: true, branch: 'pr-10' }), /Production uses/)
  assert.equal(deploymentBranch({ production: true }), 'main')
  assert.equal(deploymentBranch({ production: true, branch: 'main' }), 'main')
})
