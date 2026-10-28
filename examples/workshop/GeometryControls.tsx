'use client'

/* oxlint-disable jsx-a11y/prefer-tag-over-role -- The grip sits on the sample it changes and is dragged in page pixels along one axis; a range input has neither position nor those units. */

import { useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ScrubField } from './ScrubField'
import { dragDial, stepDial, type GeometryDial as Dial } from './workshop-geometry-view'

const samples: Record<Dial['kind'], ReactNode> = {
  corner: <span className="geometry-corner" />,
  density: (
    <>
      <span className="geometry-bar" />
      <span className="geometry-bar" />
      <span className="geometry-bar" />
    </>
  ),
  spacing: (
    <>
      <span className="geometry-block" />
      <span className="geometry-block" />
      <span className="geometry-block" />
      <span className="geometry-block" />
    </>
  ),
  line: <span className="geometry-line" />,
  backdrop: (
    <>
      <span className="geometry-page" />
      <span className="geometry-dim" />
      <span className="geometry-modal" />
    </>
  )
}

/** A grip that drags a value along its dial's axis, with the keyboard stepping it. */
export function Grip({
  dial,
  value,
  style,
  describedBy,
  onChange,
  onDragging
}: {
  dial: Dial
  value: number
  style?: CSSProperties
  describedBy?: string
  onChange: (value: number) => void
  onDragging?: (dragging: boolean) => void
}) {
  const drag = useRef<{ start: number; x: number; y: number } | null>(null)
  return (
    <div
      role="slider"
      tabIndex={0}
      className="geometry-grip"
      style={style}
      aria-label={dial.name}
      aria-valuemin={dial.min}
      aria-valuemax={dial.max}
      aria-valuenow={value}
      aria-valuetext={dial.words(value)}
      aria-describedby={describedBy}
      aria-orientation={dial.axis === 'right' ? 'horizontal' : 'vertical'}
      onKeyDown={event => {
        const next = stepDial(dial, value, event.key, event.shiftKey)
        if (next === undefined) return
        event.preventDefault()
        if (next !== value) onChange(next)
      }}
      onPointerDown={event => {
        if (event.button !== 0) return
        event.preventDefault()
        event.currentTarget.focus({ preventScroll: true })
        event.currentTarget.setPointerCapture(event.pointerId)
        drag.current = { start: value, x: event.clientX, y: event.clientY }
        onDragging?.(true)
      }}
      onPointerMove={event => {
        const current = drag.current
        if (!current) return
        const next = dragDial(
          dial,
          current.start,
          { x: event.clientX - current.x, y: event.clientY - current.y },
          event.shiftKey
        )
        if (next !== value) onChange(next)
      }}
      onPointerUp={() => {
        drag.current = null
        onDragging?.(false)
      }}
      onPointerCancel={() => {
        drag.current = null
        onDragging?.(false)
      }}
    />
  )
}

/** One numeric decision: a sample drawn from the value, a grip on the sample, and the exact number. */
export function GeometryDial({
  dial,
  value,
  describedBy,
  note,
  onChange
}: {
  dial: Dial
  value: number
  describedBy?: string
  note?: ReactNode
  onChange: (value: number) => void
}) {
  const [dragging, setDragging] = useState(false)
  return (
    <div
      className="geometry-dial"
      data-kind={dial.kind}
      data-dragging={dragging || undefined}
    >
      <div
        className="geometry-sample"
        style={{ ['--v' as string]: value }}
      >
        <span
          className="geometry-sample-art"
          aria-hidden="true"
        >
          {samples[dial.kind]}
        </span>
        <Grip
          dial={dial}
          value={value}
          describedBy={describedBy}
          onChange={onChange}
          onDragging={setDragging}
        />
      </div>
      <div className="geometry-dial-value">
        <ScrubField
          scrub={dial}
          value={value}
          describedBy={describedBy}
          onChange={onChange}
        />
        {note}
      </div>
    </div>
  )
}

export interface CardOption {
  value: string
  name: string
  sample: ReactNode
  style?: CSSProperties
}
/** Radio cards whose sample shows what each option does. One tab stop; arrows move. */
export function OptionCards({
  label,
  options,
  value,
  describedBy,
  onChange
}: {
  label: string
  options: readonly CardOption[]
  value: string
  describedBy?: string
  onChange: (value: string) => void
}) {
  const id = useId()
  return (
    <div
      className="option-cards"
      role="radiogroup"
      aria-label={label}
      aria-describedby={describedBy}
    >
      {options.map(option => (
        <label
          key={option.value}
          className="option-card"
          style={option.style}
        >
          <input
            type="radio"
            name={id}
            value={option.value}
            checked={option.value === value}
            aria-label={option.name}
            onChange={() => onChange(option.value)}
          />
          <span
            className="option-sample"
            aria-hidden="true"
          >
            {option.sample}
          </span>
          <span className="option-name">{option.name}</span>
        </label>
      ))}
    </div>
  )
}
