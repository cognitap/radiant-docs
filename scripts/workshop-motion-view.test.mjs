import assert from 'node:assert/strict'
import test from 'node:test'
import {
  curveHorizon,
  dampingForSettle,
  describeSpring,
  springPosition,
  springSummary,
  stiffnessForOvershoot
} from '../examples/workshop/workshop-motion-view.ts'

let clock = 0
const frameQueue = new Map()
let frameId = 0
performance.now = () => clock
globalThis.requestAnimationFrame = callback => {
  frameQueue.set(++frameId, callback)
  return frameId
}
globalThis.cancelAnimationFrame = id => frameQueue.delete(id)
const { createSpring } = await import('@cognitap/radiant/motion')

/** Advance the controlled clock one 60 Hz frame, run the queued callbacks, and let the runtime's per-tick time cache clear. */
async function stepFrame() {
  clock += 1000 / 60
  const due = [...frameQueue.entries()]
  frameQueue.clear()
  for (const [, callback] of due) callback(clock)
  await Promise.resolve()
}

/** Run the runtime's own spring through a unit step on the controlled clock. */
async function runtimeStep(parameters) {
  const spring = createSpring(0, { parameters })
  const started = clock
  const samples = []
  spring.subscribe(value => samples.push({ t: (clock - started) / 1000, x: value }))
  spring.to(1)
  for (let frames = 0; spring.isAnimating(); frames++) {
    assert.ok(frames < 60 * 30, 'the spring settles within 30 s of controlled time')
    await stepFrame()
  }
  const settleTime = (clock - started) / 1000
  spring.destroy()
  return { settleTime, peak: Math.max(...samples.map(sample => sample.x)), samples }
}

const profiles = [
  { stiffness: 320, damping: 30, mass: 1 },
  { stiffness: 220, damping: 14, mass: 1 },
  { stiffness: 450, damping: 60, mass: 2 },
  { stiffness: 120, damping: 40, mass: 1 }
]
for (const parameters of profiles)
  test(`the plotted step response matches the runtime spring for ${JSON.stringify(parameters)}`, async () => {
    const predicted = springSummary(parameters)
    const actual = await runtimeStep(parameters)
    assert.ok(
      Math.abs(predicted.settleTime - actual.settleTime) <= predicted.settleTime * 0.1 + 0.04,
      `settle predicted ${predicted.settleTime}s, runtime ${actual.settleTime}s`
    )
    assert.ok(
      Math.abs(1 + predicted.overshoot - actual.peak) <= 0.01,
      `peak predicted ${1 + predicted.overshoot}, runtime ${actual.peak}`
    )
    for (const sample of actual.samples.filter(sample => sample.t > 0.05))
      assert.ok(
        Math.abs(springPosition(parameters, sample.t) - sample.x) <= 0.03,
        `position at ${sample.t}s predicted ${springPosition(parameters, sample.t)}, runtime ${sample.x}`
      )
  })

test('a step response is described in words a designer can act on', () => {
  assert.equal(describeSpring(springSummary(profiles[0])), 'Settles in 533 ms · overshoots 1%')
  assert.equal(describeSpring(springSummary(profiles[1])), 'Settles in 1 s · overshoots 19%')
  assert.equal(
    describeSpring(springSummary(profiles[3])),
    'Settles in 2.14 s · no overshoot, eases in'
  )
})

test('the peak handle asks for an overshoot and gets the stiffness that produces it', () => {
  const base = profiles[0]
  for (const overshoot of [0.02, 0.1, 0.3]) {
    const stiffness = stiffnessForOvershoot(base, overshoot)
    const summary = springSummary({ ...base, stiffness })
    assert.ok(
      Math.abs(summary.overshoot - overshoot) < 0.005,
      `${overshoot} → ${summary.overshoot}`
    )
  }
  assert.ok(
    springSummary({ ...base, stiffness: stiffnessForOvershoot(base, 0) }).ratio >= 0.99,
    'at the baseline the spring is critically damped'
  )
  assert.ok(
    springSummary({ ...base, stiffness: stiffnessForOvershoot(base, -0.5) }).ratio > 1.4,
    'below the baseline it is overdamped'
  )
})

test('the settle handle asks for a settle time and gets the damping that reaches it', () => {
  for (const base of [profiles[0], profiles[1]]) {
    for (const target of [0.65, 0.9]) {
      const damping = dampingForSettle(base, target)
      const settle = springSummary({ ...base, damping }).settleTime
      // Rest is reached when a swing enters the threshold band, so settle moves in steps.
      assert.ok(Math.abs(settle - target) < 0.1, `${target}s → ${settle}s with damping ${damping}`)
    }
  }
  const overdamped = profiles[3]
  const damping = dampingForSettle(overdamped, 3)
  assert.ok(damping > overdamped.damping, 'past critical, a later settle needs more damping')
  assert.ok(Math.abs(springSummary({ ...overdamped, damping }).settleTime - 3) < 0.05)
})

test('the plot keeps a span the response fits, and only widens at a few steps', () => {
  assert.equal(curveHorizon(0.54), 1)
  assert.equal(curveHorizon(1.01), 1.5)
  assert.equal(curveHorizon(0.3), 0.5)
  assert.equal(curveHorizon(12), 10)
})
