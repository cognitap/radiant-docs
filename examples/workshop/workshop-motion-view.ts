import type { SpringParameters } from '@cognitap/radiant'
import { clampStep, type Scrub } from './workshop-typography-view.ts'

/* The step response of the runtime's spring, from rest at 0 to a destination of 1 with no
   velocity, in seconds. The closed forms are the ones motion-dom evaluates each frame, and the rest
   thresholds are the ones the runtime's spring value passes it, so the settle time the editor
   states is the one the preview reaches. */

export type SpringKey = keyof SpringParameters
export interface SpringDial extends Scrub<SpringKey> {
  /** Arrow-key step on a curve handle; shift multiplies it by ten. */
  keyStep: number
}
export const springDials: readonly SpringDial[] = [
  {
    key: 'stiffness',
    name: 'Stiffness',
    label: 'Stiffness',
    min: 1,
    max: 10000,
    step: 1,
    unit: '',
    keyStep: 10
  },
  {
    key: 'damping',
    name: 'Damping',
    label: 'Damping',
    min: 0.5,
    max: 10000,
    step: 0.5,
    unit: '',
    keyStep: 1
  },
  {
    key: 'mass',
    name: 'Mass',
    label: 'Mass',
    min: 0.1,
    max: 100,
    step: 0.1,
    unit: '',
    keyStep: 0.1
  }
]
export const springDial = (key: SpringKey) => springDials.find(dial => dial.key === key)!

/** The runtime's spring value settles once speed is within 0.01/s and distance within 0.001. */
export const rest = { speed: 0.01, delta: 0.001 }
const maxSettle = 10

export const dampingRatio = ({ stiffness, damping, mass }: SpringParameters) =>
  damping / (2 * Math.sqrt(stiffness * mass))

function terms(p: SpringParameters) {
  const ratio = dampingRatio(p)
  const omega = Math.sqrt(p.stiffness / p.mass)
  return { ratio, omega, decay: ratio * omega }
}
/** Position at t seconds of the unit step. */
export function springPosition(p: SpringParameters, t: number): number {
  const { ratio, omega, decay } = terms(p)
  if (ratio < 1) {
    const damped = omega * Math.sqrt(1 - ratio * ratio)
    const A = decay / damped
    return 1 - Math.exp(-decay * t) * (A * Math.sin(damped * t) + Math.cos(damped * t))
  }
  if (ratio === 1) return 1 - Math.exp(-omega * t) * (1 + omega * t)
  const damped = omega * Math.sqrt(ratio * ratio - 1)
  const slow = decay - damped,
    fast = decay + damped
  const P = decay / damped
  return 1 - ((1 + P) / 2) * Math.exp(-slow * t) - ((1 - P) / 2) * Math.exp(-fast * t)
}
/** Velocity at t seconds, in units per second. */
export function springVelocity(p: SpringParameters, t: number): number {
  const { ratio, omega, decay } = terms(p)
  if (ratio < 1) {
    const damped = omega * Math.sqrt(1 - ratio * ratio)
    const A = decay / damped
    return (
      Math.exp(-decay * t) *
      ((decay * A + damped) * Math.sin(damped * t) + (decay - A * damped) * Math.cos(damped * t))
    )
  }
  if (ratio === 1) return Math.exp(-omega * t) * omega * omega * t
  const damped = omega * Math.sqrt(ratio * ratio - 1)
  const slow = decay - damped,
    fast = decay + damped
  const P = decay / damped
  return ((slow * (1 + P)) / 2) * Math.exp(-slow * t) + ((fast * (1 - P)) / 2) * Math.exp(-fast * t)
}

export interface SpringSummary {
  ratio: number
  /** The first peak past the destination as a fraction of the step; 0 when there is none. */
  overshoot: number
  /** Seconds to the first peak, or to settling when there is no peak. */
  peakTime: number
  /** Seconds until the runtime reports rest. */
  settleTime: number
}
export function springSummary(p: SpringParameters): SpringSummary {
  const { ratio, omega, decay } = terms(p)
  let settleTime = maxSettle
  for (let ms = 1; ms <= maxSettle * 1000; ms++) {
    const t = ms / 1000
    if (
      Math.abs(springVelocity(p, t)) <= rest.speed &&
      Math.abs(1 - springPosition(p, t)) <= rest.delta
    ) {
      settleTime = t
      break
    }
  }
  if (ratio >= 1) return { ratio, overshoot: 0, peakTime: settleTime, settleTime }
  const peakTime = Math.PI / (omega * Math.sqrt(1 - ratio * ratio))
  return { ratio, overshoot: Math.exp(-decay * peakTime), peakTime, settleTime }
}

const ms = (seconds: number) =>
  seconds >= maxSettle
    ? 'over 10 s'
    : seconds >= 1
      ? `${(Math.round(seconds * 100) / 100).toFixed(seconds >= 10 ? 0 : 2).replace(/\.?0+$/, '')} s`
      : `${Math.round(seconds * 1000)} ms`
const percent = (fraction: number) =>
  fraction < 0.005 ? `${(fraction * 100).toFixed(1)}%` : `${Math.round(fraction * 100)}%`
/** "Settles in 540 ms · overshoots 1%" */
export function describeSpring(summary: SpringSummary): string {
  const shape =
    summary.overshoot >= 0.0005
      ? `overshoots ${percent(summary.overshoot)}`
      : summary.ratio > 1.02
        ? 'no overshoot, eases in'
        : 'no overshoot'
  return `Settles in ${ms(summary.settleTime)} · ${shape}`
}
export const settleWords = (summary: SpringSummary) => `settles in ${ms(summary.settleTime)}`
export const overshootWords = (summary: SpringSummary) =>
  summary.overshoot >= 0.0005 ? `overshoots ${percent(summary.overshoot)}` : 'no overshoot'

/* The plot. Its time axis snaps between a few spans so a drag never rescales under the pointer. */

export const horizons = [0.5, 1, 1.5, 2, 3, 5, 10] as const
export function curveHorizon(settleTime: number): number {
  return horizons.find(horizon => settleTime * 1.15 <= horizon) ?? 10
}
export interface CurvePoint {
  t: number
  x: number
}
export function curvePoints(p: SpringParameters, horizon: number, count = 160): CurvePoint[] {
  return Array.from({ length: count + 1 }, (_, index) => {
    const t = (horizon * index) / count
    return { t, x: springPosition(p, t) }
  })
}

/* Handles. The peak handle sets stiffness: with damping and mass held, stiffness alone decides
   how far the first swing passes the destination. The settle handle sets damping: the envelope
   decays at damping over twice the mass, so damping alone decides when the spring rests. */

const clampTo = (dial: SpringDial, value: number) => clampStep(value, dial)
/** Overshoot the pointer asks for, as a fraction of the step; at or below 0 it asks for a ratio
    past critical, 0 for critical and -1 for twice critical. */
export function stiffnessForOvershoot(p: SpringParameters, overshoot: number): number {
  const ratio =
    overshoot > 0
      ? -Math.log(overshoot) / Math.sqrt(Math.PI * Math.PI + Math.log(overshoot) ** 2)
      : 1 - overshoot
  return clampTo(springDial('stiffness'), (p.damping / (2 * ratio)) ** 2 / p.mass)
}
/** Damping that settles at the asked time, searched within the current regime: more damping
    rests sooner while the spring still swings, and later once it is past critical. */
export function dampingForSettle(p: SpringParameters, settleTime: number): number {
  const critical = 2 * Math.sqrt(p.stiffness * p.mass)
  const dial = springDial('damping')
  const swinging = dampingRatio(p) < 1
  let low = swinging ? dial.min : critical
  let high = swinging ? critical : dial.max
  const settleAt = (damping: number) => springSummary({ ...p, damping }).settleTime
  for (let step = 0; step < 24; step++) {
    const mid = (low + high) / 2
    const later = settleAt(mid) > settleTime
    if (swinging === later) low = mid
    else high = mid
  }
  return clampTo(dial, (low + high) / 2)
}
export function stepSpring(
  dial: SpringDial,
  value: number,
  key: string,
  shift: boolean
): number | undefined {
  const steps = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[key]
  if (steps) return clampTo(dial, value + steps * dial.keyStep * (shift ? 10 : 1))
  if (key === 'Home') return dial.min
  if (key === 'End') return dial.max
  return undefined
}
