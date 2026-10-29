import assert from 'node:assert/strict'
import test from 'node:test'
import {
  coalesceWindow,
  commit,
  createHistory,
  historyLimit,
  historyReducer,
  redo,
  undo,
  type History
} from '../examples/workshop/workshop-history.ts'

const states = <T>(history: History<T>) => [
  history.past.map(entry => entry.state),
  history.present.state,
  history.future.map(entry => entry.state)
]

test('each committed change is one undo step with its label', () => {
  let history = createHistory('a')
  history = commit(history, 'b', { label: 'brand color' }, 0)
  history = commit(history, 'c', { label: 'surface radius' }, 10)
  assert.deepEqual(states(history), [['a', 'b'], 'c', []])
  assert.equal(history.present.label, 'surface radius')
  history = undo(history)
  assert.deepEqual(states(history), [['a'], 'b', ['c']])
  history = undo(history)
  assert.deepEqual(states(history), [[], 'a', ['b', 'c']])
  assert.equal(undo(history), history, 'nothing to undo keeps the same history')
  history = redo(history)
  assert.deepEqual(states(history), [['a'], 'b', ['c']])
  history = redo(redo(history))
  assert.deepEqual(states(history), [['a', 'b'], 'c', []])
})

test('a new change after undo discards the redo branch', () => {
  let history = commit(createHistory('a'), 'b', { label: 'b' }, 0)
  history = commit(undo(history), 'c', { label: 'c' }, 5)
  assert.deepEqual(states(history), [['a'], 'c', []])
})

test('continuous input to one control inside the window is one step', () => {
  let history = createHistory(8)
  const drag = { label: 'control radius', coalesce: 'shared.controlRadius' }
  history = commit(history, 9, drag, 1000)
  history = commit(history, 10, drag, 1300)
  history = commit(history, 11, drag, 1300 + coalesceWindow)
  assert.deepEqual(states(history), [[8], 11, []])
  assert.deepEqual(states(undo(history)), [[], 8, [11]])
})

test('a pause longer than the window, or another control, starts a new step', () => {
  let history = createHistory(8)
  const radius = { label: 'control radius', coalesce: 'shared.controlRadius' }
  const spacing = { label: 'spacing', coalesce: 'shared.spacing' }
  history = commit(history, 9, radius, 0)
  history = commit(history, 10, radius, coalesceWindow + 1)
  history = commit(history, 11, spacing, coalesceWindow + 2)
  history = commit(history, 12, radius, coalesceWindow + 3)
  history = commit(history, 13, { label: 'preset' }, coalesceWindow + 4)
  history = commit(history, 14, { label: 'preset' }, coalesceWindow + 5)
  assert.deepEqual(states(history), [[8, 9, 10, 11, 12, 13], 14, []])
})

test('undo ends a gesture, so the next edit of the same control is a new step', () => {
  const drag = { label: 'radius', coalesce: 'radius' }
  let history = commit(commit(createHistory(0), 1, drag, 0), 2, drag, 10)
  history = commit(undo(history), 3, drag, 20)
  assert.deepEqual(states(history), [[0], 3, []])
})

test('history keeps the most recent entries only', () => {
  let history = createHistory(0)
  for (let value = 1; value <= historyLimit + 20; value++)
    history = commit(history, value, { label: String(value) }, value)
  assert.equal(history.past.length, historyLimit)
  assert.equal(history.past[0].state, 20)
})

test('the reducer applies functional updates to the present state', () => {
  let history = createHistory({ n: 1 })
  history = historyReducer(history, {
    type: 'commit',
    state: state => ({ n: state.n + 1 }),
    change: { label: 'n' },
    at: 0
  })
  assert.deepEqual(history.present.state, { n: 2 })
  history = historyReducer(history, { type: 'undo' })
  assert.deepEqual(history.present.state, { n: 1 })
  history = historyReducer(history, { type: 'redo' })
  assert.deepEqual(history.present.state, { n: 2 })
})
