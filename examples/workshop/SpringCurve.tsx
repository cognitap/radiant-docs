'use client'

/* oxlint-disable jsx-a11y/prefer-tag-over-role -- The handles sit on the curve they shape and are dragged to a point on it; a range input has neither position nor those units. The plot is a graphic. */

import { useRef, useState, type PointerEvent } from 'react'
import type { SpringParameters } from '@cognitap/radiant'
import type { Movement } from './motion-trace'
import {
  curveHorizon,
  curvePoints,
  dampingForSettle,
  describeSpring,
  overshootWords,
  settleWords,
  springDial,
  springPosition,
  springSummary,
  stepSpring,
  stiffnessForOvershoot,
  type SpringKey,
  type SpringSummary
} from './workshop-motion-view'

const width = 480,
  height = 150,
  top = 14,
  bottom = 22
const plotHeight = height - top - bottom
/** Positions are drawn from 0 to this; the destination line sits at 1. */
const yMax = 1.5
const px = (t: number, horizon: number) => (t / horizon) * width
const py = (x: number) => top + ((yMax - Math.min(yMax, Math.max(0, x))) / yMax) * plotHeight
const path = (points: { t: number; x: number }[], horizon: number) =>
  points
    .filter(point => point.t <= horizon)
    .map(
      (point, index) =>
        `${index ? 'L' : 'M'}${px(point.t, horizon).toFixed(1)},${py(point.x).toFixed(1)}`
    )
    .join(' ')
/** Where the peak handle sits once there is no peak: the moment the response is most of the way there. */
function riseTime(parameters: SpringParameters, summary: SpringSummary): number {
  let t = 0
  while (t < summary.settleTime && springPosition(parameters, t) < 0.63) t += 0.005
  return t
}

function Handle({
  name,
  dial,
  value,
  words,
  style,
  describedBy,
  orientation,
  onKey,
  onDrag,
  onDragging
}: {
  name: string
  dial: ReturnType<typeof springDial>
  value: number
  words: string
  style: { left: string; top: string }
  describedBy?: string
  orientation: 'horizontal' | 'vertical'
  onKey: (key: string, shift: boolean) => void
  onDrag: (event: PointerEvent<HTMLDivElement>) => void
  onDragging: (dragging: boolean) => void
}) {
  const dragging = useRef(false)
  return (
    <div
      role="slider"
      tabIndex={0}
      className="motion-curve-handle"
      style={style}
      aria-label={name}
      aria-valuemin={dial.min}
      aria-valuemax={dial.max}
      aria-valuenow={value}
      aria-valuetext={words}
      aria-describedby={describedBy}
      aria-orientation={orientation}
      onKeyDown={event => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key))
          return
        event.preventDefault()
        onKey(event.key, event.shiftKey)
      }}
      onPointerDown={event => {
        if (event.button !== 0) return
        event.preventDefault()
        event.currentTarget.focus({ preventScroll: true })
        event.currentTarget.setPointerCapture(event.pointerId)
        dragging.current = true
        onDragging(true)
      }}
      onPointerMove={event => {
        if (dragging.current) onDrag(event)
      }}
      onPointerUp={() => {
        dragging.current = false
        onDragging(false)
      }}
      onPointerCancel={() => {
        dragging.current = false
        onDragging(false)
      }}
    />
  )
}

/** The step response of one spring, with the peak dragged for stiffness and the settle point for
    damping. A movement the preview sampled draws over it. */
export function SpringCurve({
  parameters,
  movement,
  describedBy,
  onChange
}: {
  parameters: SpringParameters
  movement: Movement | null
  describedBy?: Partial<Record<SpringKey, string>>
  onChange: (key: SpringKey, value: number) => void
}) {
  const svg = useRef<SVGSVGElement>(null)
  const [frozen, setFrozen] = useState<number | null>(null)
  const summary = springSummary(parameters)
  const horizon = frozen ?? curveHorizon(summary.settleTime)
  const swinging = summary.ratio < 1
  const peak = swinging
    ? { t: summary.peakTime, x: 1 + summary.overshoot }
    : { t: riseTime(parameters, summary), x: 1 }
  const settle = { t: Math.min(summary.settleTime, horizon), x: 1 }
  const at = (point: { t: number; x: number }) => ({
    left: `${(px(point.t, horizon) / width) * 100}%`,
    top: `${(py(point.x) / height) * 100}%`
  })
  /** The pointer's place in plot units. */
  const locate = (event: PointerEvent) => {
    const rect = svg.current!.getBoundingClientRect()
    const t = ((event.clientX - rect.left) / rect.width) * horizon
    const row = ((event.clientY - rect.top) / rect.height) * height
    return { t, x: yMax - ((row - top) / plotHeight) * yMax }
  }
  const dragging = (on: boolean) => setFrozen(on ? horizon : null)
  const set = (key: SpringKey, value: number) => {
    if (value !== parameters[key]) onChange(key, value)
  }
  const stiffnessWords = `stiffness ${parameters.stiffness}, ${overshootWords(summary)}`
  const dampingWords = `damping ${parameters.damping}, ${settleWords(summary)}`
  return (
    <div
      className="motion-curve"
      data-dragging={frozen === null ? undefined : ''}
    >
      <svg
        ref={svg}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Step response. ${describeSpring(summary)}.`}
      >
        <path
          className="motion-curve-grid"
          d={`M0 ${py(0)}H${width}`}
        />
        <path
          className="motion-curve-destination"
          d={`M0 ${py(1)}H${width}`}
        />
        {movement && (
          <path
            className="motion-curve-trace"
            d={path(movement.points, horizon)}
          />
        )}
        <path
          className="motion-curve-line"
          d={path(curvePoints(parameters, horizon), horizon)}
        />
        <text
          className="motion-curve-tick"
          x={2}
          y={height - 6}
        >
          0
        </text>
        <text
          className="motion-curve-tick"
          x={width - 2}
          y={height - 6}
          textAnchor="end"
        >
          {horizon >= 1 ? `${horizon} s` : `${horizon * 1000} ms`}
        </text>
      </svg>
      <Handle
        name="Overshoot"
        dial={springDial('stiffness')}
        value={parameters.stiffness}
        words={stiffnessWords}
        style={at(peak)}
        describedBy={describedBy?.stiffness}
        orientation="vertical"
        onKey={(key, shift) => {
          const next = stepSpring(springDial('stiffness'), parameters.stiffness, key, shift)
          if (next !== undefined) set('stiffness', next)
        }}
        onDrag={event => {
          const overshoot = Math.max(-1, Math.min(0.6, locate(event).x - 1))
          set('stiffness', stiffnessForOvershoot(parameters, overshoot))
        }}
        onDragging={dragging}
      />
      <Handle
        name="Settle"
        dial={springDial('damping')}
        value={parameters.damping}
        words={dampingWords}
        style={at(settle)}
        describedBy={describedBy?.damping}
        orientation="horizontal"
        onKey={(key, shift) => {
          // Right and up move the settle point later, which is less damping while the spring still swings.
          const mirrored = swinging
            ? ({
                ArrowLeft: 'ArrowRight',
                ArrowRight: 'ArrowLeft',
                ArrowUp: 'ArrowDown',
                ArrowDown: 'ArrowUp'
              }[key] ?? key)
            : key
          const next = stepSpring(springDial('damping'), parameters.damping, mirrored, shift)
          if (next !== undefined) set('damping', next)
        }}
        onDrag={event => {
          const t = Math.max(0.05, Math.min(horizon, locate(event).t))
          set('damping', dampingForSettle(parameters, t))
        }}
        onDragging={dragging}
      />
      <p className="motion-curve-readout">
        <output aria-live="off">{describeSpring(summary)}</output>
        <span className="motion-curve-key">
          {movement
            ? `Dotted · ${movement.label.toLowerCase()} in the preview`
            : 'Press or drag the preview to draw its last movement here'}
        </span>
      </p>
    </div>
  )
}
