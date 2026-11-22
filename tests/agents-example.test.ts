import assert from 'node:assert/strict'
import test from 'node:test'
import { validateA2uiAccessibility } from '@cognitap/radiant/a2ui'
import { reviewPlanMessages } from '../examples/agents/reviewPlan.ts'

test('the recorded agent reply passes the accessibility check', () => {
  assert.deepEqual(validateA2uiAccessibility(reviewPlanMessages).errors, [])
})
