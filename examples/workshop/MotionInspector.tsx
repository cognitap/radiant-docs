'use client'

/* oxlint-disable jsx-a11y/prefer-tag-over-role -- Inline SVG needs its accessible graphic role. */

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Button } from '@cognitap/radiant'
import type { Movement } from './motion-trace'

export interface MotionReading {
  position: number
  target?: number
  velocity?: number
  moving?: boolean
  unit: string
  label: string
}
export type MotionReader = () => MotionReading | null
/** Inspection samples real presentation. It never calculates a spring trajectory. */
export function MotionInspector({
  sourceRef,
  onMovement,
  children
}: {
  sourceRef: RefObject<MotionReader | null>
  /** Each movement from rest to rest, once it ends. */
  onMovement?: (movement: Movement) => void
  /** A choice of what to measure, shown above the graph. */
  children?: ReactNode
}) {
  const [paused, setPaused] = useState(false)
  const actual = useRef<SVGPathElement>(null)
  const destination = useRef<SVGPathElement>(null)
  const position = useRef<HTMLOutputElement>(null)
  const target = useRef<HTMLOutputElement>(null)
  const velocity = useRef<HTMLOutputElement>(null)
  const status = useRef<HTMLSpanElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const scale = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (paused) return
    let frame: number
    let previous: { time: number; value: number } | undefined
    let signature = ''
    let samples: { time: number; position: number; target?: number }[] = []
    let movement: { start: number; origin: number; points: { t: number; x: number }[] } | null =
      null
    function draw(now: number) {
      if (document.hidden) return
      const reading = sourceRef.current?.()
      if (reading && Number.isFinite(reading.position)) {
        const nextSignature = `${reading.label}:${reading.unit}`
        if (signature !== nextSignature) {
          signature = nextSignature
          samples = []
          previous = undefined
          movement = null
        }
        const speed =
          reading.velocity ??
          (previous
            ? ((reading.position - previous.value) * 1000) / Math.max(1, now - previous.time)
            : 0)
        const moving = reading.moving ?? Math.abs(speed) > 0.01
        if (moving && !movement) {
          const origin = previous?.value ?? reading.position
          movement = { start: previous?.time ?? now, origin, points: [{ t: 0, x: origin }] }
        }
        if (movement) {
          movement.points.push({ t: (now - movement.start) / 1000, x: reading.position })
          if (!moving) {
            if (movement.points.length > 3) {
              const { origin } = movement
              // Rest can be reported before the first rendered change; the trace starts at that change.
              const first = Math.max(0, movement.points.findIndex(point => point.x !== origin) - 1)
              const offset = movement.points[first]!.t
              const points = movement.points
                .slice(first)
                .map(point => ({ t: point.t - offset, x: point.x }))
              const span =
                Math.abs(reading.position - origin) > 1e-6
                  ? reading.position - origin
                  : points.reduce(
                      (far, point) =>
                        Math.abs(point.x - origin) > Math.abs(far) ? point.x - origin : far,
                      1e-6
                    )
              onMovement?.({
                label: reading.label,
                points: points.slice(-600).map(point => ({
                  t: point.t,
                  x: (point.x - origin) / span
                }))
              })
            }
            movement = null
          }
        }
        previous = { time: now, value: reading.position }
        samples.push({ time: now, position: reading.position, target: reading.target })
        samples = samples.filter(sample => now - sample.time <= 2000).slice(-180)
        const values = samples.flatMap(sample =>
          sample.target === undefined ? [sample.position] : [sample.position, sample.target]
        )
        const low = Math.min(...values),
          high = Math.max(...values)
        const padding = Math.max((high - low) * 0.12, reading.unit === 'px' ? 1 : 0.005)
        const min = low - padding,
          max = high + padding
        const path = (key: 'position' | 'target') =>
          samples
            .filter(sample => sample[key] !== undefined)
            .map(
              (sample, index) =>
                `${index ? 'L' : 'M'}${(480 - ((now - sample.time) / 2000) * 480).toFixed(1)},${(108 - ((sample[key]! - min) / (max - min)) * 96).toFixed(1)}`
            )
            .join(' ')
        actual.current?.setAttribute('d', path('position'))
        destination.current?.setAttribute('d', path('target'))
        if (position.current)
          position.current.value = `${reading.position.toFixed(2)}${reading.unit}`
        if (target.current)
          target.current.value =
            reading.target === undefined
              ? 'Gesture driven'
              : `${reading.target.toFixed(2)}${reading.unit}`
        if (velocity.current)
          velocity.current.value = `${speed.toFixed(2)}${reading.unit || ' scale'}/s`
        if (status.current) status.current.textContent = moving ? 'Moving' : 'At rest'
        if (label.current) label.current.textContent = reading.label
        if (scale.current)
          scale.current.textContent = `${min.toFixed(2)}–${max.toFixed(2)}${reading.unit}`
      }
      frame = requestAnimationFrame(draw)
    }
    const resume = () => {
      cancelAnimationFrame(frame)
      previous = undefined
      if (!document.hidden) frame = requestAnimationFrame(draw)
    }
    resume()
    document.addEventListener('visibilitychange', resume)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', resume)
    }
  }, [paused, sourceRef, onMovement])
  return (
    <section
      className="motion-inspector"
      aria-label="Motion inspection"
    >
      {children}
      <div className="motion-inspector-heading">
        <span ref={label}>Live position</span>
        <span ref={status}>At rest</span>
      </div>
      <svg
        viewBox="0 0 480 120"
        role="img"
        aria-label="Rendered position and destination over the last two seconds"
        preserveAspectRatio="none"
      >
        <path
          className="motion-graph-grid"
          d="M0 12H480M0 60H480M0 108H480"
        />
        <path
          ref={destination}
          className="motion-graph-target"
        />
        <path
          ref={actual}
          className="motion-graph-actual"
        />
      </svg>
      <div className="motion-graph-key">
        <span>Solid · position</span>
        <span>Dashed · destination</span>
        <span ref={scale}>Auto range</span>
      </div>
      <dl className="motion-readouts">
        <div>
          <dt>Position</dt>
          <dd>
            <output
              ref={position}
              aria-live="off"
            >
              —
            </output>
          </dd>
        </div>
        <div>
          <dt>Destination</dt>
          <dd>
            <output
              ref={target}
              aria-live="off"
            >
              —
            </output>
          </dd>
        </div>
        <div>
          <dt>Velocity</dt>
          <dd>
            <output
              ref={velocity}
              aria-live="off"
            >
              —
            </output>
          </dd>
        </div>
      </dl>
      <Button
        variant="ghost"
        controlSize="small"
        aria-pressed={paused}
        onClick={() => setPaused(value => !value)}
      >
        {paused ? 'Resume inspection' : 'Pause inspection'}
      </Button>
    </section>
  )
}
