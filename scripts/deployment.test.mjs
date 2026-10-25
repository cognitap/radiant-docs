import assert from 'node:assert/strict'
import { test } from 'node:test'
import { deploymentBranch } from './deploy-pages.mjs'

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
