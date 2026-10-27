'use client'

/* oxlint-disable jsx-a11y/prefer-tag-over-role -- Inline SVG needs its accessible graphic role. */

import { useEffect, useRef, useState, type RefObject } from 'react'
import { Button } from '@cognitap/radiant'

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
export function MotionInspector({ sourceRef }: { sourceRef: RefObject<MotionReader | null> }) {
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
    function draw(now: number) {
      if (document.hidden) return
      const reading = sourceRef.current?.()
      if (reading && Number.isFinite(reading.position)) {
        const nextSignature = `${reading.label}:${reading.unit}`
        if (signature !== nextSignature) {
          signature = nextSignature
          samples = []
          previous = undefined
        }
        const speed =
          reading.velocity ??
          (previous
            ? ((reading.position - previous.value) * 1000) / Math.max(1, now - previous.time)
            : 0)
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
        if (status.current)
          status.current.textContent =
            (reading.moving ?? Math.abs(speed) > 0.01) ? 'Moving' : 'At rest'
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
  }, [paused, sourceRef])
  return (
    <section
      className="motion-inspector"
      aria-label="Motion inspection"
    >
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
