'use client'

import { useId, useRef, useState, type PointerEvent } from 'react'
import { formatValue, scrubValue, type Scrub } from './workshop-typography-view'

/** A compact number: drag the label to scrub (shift for a fine step), type to set. Invalid or
    out-of-range drafts keep the last valid value and are restored on blur. */
export function ScrubField({
  scrub,
  value,
  describedBy,
  onChange
}: {
  scrub: Scrub
  value: number
  describedBy?: string
  onChange: (value: number) => void
}) {
  const id = useId()
  const [draft, setDraft] = useState(String(value))
  const [previous, setPrevious] = useState(value)
  const [scrubbing, setScrubbing] = useState(false)
  const start = useRef({ x: 0, value })
  if (previous !== value) {
    setPrevious(value)
    setDraft(String(value))
  }
  const { min, max, step } = scrub
  const number = Number(draft)
  const valid = draft.trim() !== '' && Number.isFinite(number) && number >= min && number <= max
  const move = (event: PointerEvent<HTMLLabelElement>) => {
    if (!scrubbing) return
    const next = scrubValue(
      start.current.value,
      event.clientX - start.current.x,
      scrub,
      event.shiftKey
    )
    if (next !== value) onChange(next)
  }
  return (
    <div
      className="scrub-field"
      data-scrubbing={scrubbing || undefined}
    >
      <label
        htmlFor={id}
        className="scrub-label"
        title={`${scrub.name}. Drag to change.`}
        onPointerDown={event => {
          if (event.button !== 0) return
          event.preventDefault()
          start.current = { x: event.clientX, value }
          event.currentTarget.setPointerCapture(event.pointerId)
          setScrubbing(true)
        }}
        onPointerMove={move}
        onPointerUp={() => setScrubbing(false)}
        onPointerCancel={() => setScrubbing(false)}
      >
        {scrub.label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={draft}
        aria-label={scrub.name}
        aria-invalid={!valid || undefined}
        aria-describedby={describedBy}
        onChange={event => {
          const text = event.target.value
          setDraft(text)
          const next = Number(text)
          if (text.trim() && Number.isFinite(next) && next >= min && next <= max) onChange(next)
        }}
        onBlur={() => setDraft(String(value))}
        onKeyDown={event => {
          if (event.key === 'Enter') setDraft(String(value))
        }}
      />
      {scrub.unit && (
        <span
          className="scrub-unit"
          aria-hidden="true"
        >
          {scrub.unit}
        </span>
      )}
      {scrubbing && (
        <output
          className="scrub-readout"
          aria-hidden="true"
        >
          {formatValue(value, scrub.unit)}
        </output>
      )}
    </div>
  )
}
