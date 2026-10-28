import assert from 'node:assert/strict'
import test from 'node:test'
import {
  initialSnapshot,
  resetEditor,
  themeChanges,
  viewTheme
} from '../examples/workshop/workshop-snapshot.ts'
import { colorAPI } from '../examples/workshop/workshop-color.ts'
import { geometryAPI, changeGeometry } from '../examples/workshop/workshop-geometry.ts'
import { changeMotion } from '../examples/workshop/workshop-motion.ts'
import { changedFields } from '../examples/workshop/workshop-fields.ts'

const edit = (snapshot, patch) => ({ ...snapshot, ...patch })
const withColor = (snapshot, recipe) => {
  const session = colorAPI.create(recipe)
  return edit(snapshot, {
    color: session.recipe,
    document: colorAPI.apply(snapshot.document, session)
  })
}
const withGeometry = (snapshot, geometry) =>
  edit(snapshot, { geometry, document: geometryAPI.apply(snapshot.document, geometry) })

test('the untouched workshop has no changed fields in any editor', () => {
  const view = viewTheme(initialSnapshot())
  const changes = themeChanges(view, viewTheme(initialSnapshot()))
  for (const editor of ['color', 'typography', 'geometry', 'motion'])
    assert.equal(changes[editor].count, 0, editor)
})

test('fields follow the decision a control makes, not every resolved value', () => {
  const baseline = initialSnapshot()
  let present = withColor(baseline, {
    ...baseline.color,
    input: { ...baseline.color.input, brand: '#166534' }
  })
  present = withGeometry(
    present,
    changeGeometry(baseline.geometry, 'shared', { controlRadius: 12 })
  )
  present = withGeometry(present, changeGeometry(present.geometry, 'dark', { spacing: 1.25 }))
  present = edit(present, {
    document: changeMotion(present.document, 'shared', { stiffness: 450 })
  })
  present = edit(present, { document: changeMotion(present.document, 'press', { damping: 20 }) })
  const changes = themeChanges(viewTheme(present), viewTheme(baseline))
  assert.deepEqual(changedFields(changes.color.changes), ['brand'])
  assert.deepEqual(changedFields(changes.geometry.changes).sort(), [
    'dark.spacing',
    'preset',
    'shared.controlRadius'
  ])
  assert.deepEqual(changedFields(changes.motion.changes).sort(), [
    'preset',
    'press.damping',
    'shared.stiffness'
  ])
  assert.equal(changes.geometry.count, 3)
  assert.equal(changes.typography.count, 0)
})

test('a missing recipe on one side counts once and offers no per-field comparison', () => {
  const baseline = initialSnapshot()
  const changes = themeChanges(viewTheme({ ...baseline, color: null }), viewTheme(baseline))
  assert.equal(changes.color.changes, null)
  assert.equal(changes.color.count, 1)
})

test('an editor reset returns to the baseline, not to library defaults', () => {
  const start = initialSnapshot()
  const baseline = withGeometry(
    start,
    changeGeometry(start.geometry, 'shared', { controlRadius: 4 })
  )
  let present = withGeometry(
    baseline,
    changeGeometry(baseline.geometry, 'shared', { controlRadius: 20 })
  )
  present = withColor(present, {
    ...present.color,
    input: { ...present.color.input, brand: '#166534' }
  })
  const reset = resetEditor(present, baseline, 'geometry')
  assert.equal(reset.geometry.values.controlRadius, 4)
  assert.equal(viewTheme(reset).theme.modes.light['--rad-control-radius'], '4px')
  assert.equal(reset.color.input.brand, '#166534', 'color keeps its own change')
  const changes = themeChanges(viewTheme(reset), viewTheme(baseline))
  assert.equal(changes.geometry.count, 0)
  assert.equal(changes.color.count, 1)
})
