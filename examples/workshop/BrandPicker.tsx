'use client'

/* oxlint-disable jsx-a11y/prefer-tag-over-role -- No input covers two axes; arrows move saturation and brightness. */

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent
} from 'react'
import { clampTo, hexToHsv, hsvToHex, pickerHueName, type Hsv } from './workshop-color-view'

/* A hue strip and a saturation/brightness surface, both drawn with real colors. HSV keeps every
   position inside sRGB, which is the only gamut the generator accepts. */

const round = (value: number) => Math.round(value)

export function BrandPicker({
  value,
  disabled,
  describedBy,
  onChange
}: {
  value: string
  disabled?: boolean
  describedBy?: string
  onChange: (hex: string) => void
}) {
  const id = useId()
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value))
  const [seen, setSeen] = useState(value)
  if (seen !== value) {
    setSeen(value)
    if (hsvToHex(hsv) !== value) setHsv(hexToHsv(value))
  }
  const surface = useRef<HTMLDivElement>(null)
  const pending = useRef<{ x: number; y: number } | null>(null)
  const frame = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
    },
    []
  )

  const apply = (next: Hsv) => {
    setHsv(next)
    onChange(hsvToHex(next))
  }
  const applyPointer = () => {
    frame.current = null
    const point = pending.current
    const node = surface.current
    if (!point || !node) return
    const box = node.getBoundingClientRect()
    apply({
      h: hsv.h,
      s: clampTo(((point.x - box.left) / box.width) * 100, 0, 100),
      v: clampTo(100 - ((point.y - box.top) / box.height) * 100, 0, 100)
    })
  }
  /** Pointer moves can outrun frames; one update per frame is enough for the preview. */
  const queuePointer = (event: PointerEvent) => {
    pending.current = { x: event.clientX, y: event.clientY }
    if (frame.current === null) frame.current = requestAnimationFrame(applyPointer)
  }
  const onSurfaceKey = (event: KeyboardEvent) => {
    const step = event.shiftKey ? 10 : 1
    const moves: Record<string, Partial<Hsv>> = {
      ArrowLeft: { s: hsv.s - step },
      ArrowRight: { s: hsv.s + step },
      ArrowUp: { v: hsv.v + step },
      ArrowDown: { v: hsv.v - step },
      Home: { s: 0 },
      End: { s: 100 },
      PageUp: { v: 100 },
      PageDown: { v: 0 }
    }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    apply({
      ...hsv,
      ...move,
      s: clampTo(move.s ?? hsv.s, 0, 100),
      v: clampTo(move.v ?? hsv.v, 0, 100)
    })
  }
  const onHueKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!event.shiftKey) return
    const step = { ArrowLeft: -10, ArrowDown: -10, ArrowRight: 10, ArrowUp: 10 }[event.key]
    if (!step) return
    event.preventDefault()
    apply({ ...hsv, h: clampTo(hsv.h + step, 0, 360) })
  }
  const hex = hsvToHex(hsv)
  const hueText = `${round(hsv.h)}°, ${pickerHueName(hsv.h)}`
  return (
    <div
      className="color-brand-picker"
      data-disabled={disabled || undefined}
    >
      <div
        ref={surface}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        className="color-brand-surface"
        aria-label="Brand shade"
        aria-describedby={describedBy}
        aria-disabled={disabled || undefined}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={round(hsv.v)}
        aria-valuetext={`saturation ${round(hsv.s)}%, brightness ${round(hsv.v)}%, ${hex}`}
        style={{ '--picker-hue': `${hsv.h}` } as CSSProperties}
        onKeyDown={disabled ? undefined : onSurfaceKey}
        onPointerDown={event => {
          if (disabled || event.button !== 0) return
          event.currentTarget.setPointerCapture(event.pointerId)
          event.currentTarget.focus({ preventScroll: true })
          queuePointer(event)
        }}
        onPointerMove={event => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) queuePointer(event)
        }}
        onPointerUp={event => {
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId)
        }}
      >
        <span
          className="color-brand-thumb"
          aria-hidden="true"
          style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, background: hex }}
        />
      </div>
      <label
        className="color-brand-hue"
        htmlFor={`${id}-hue`}
      >
        <span className="workshop-sr-only">Brand hue</span>
        <input
          id={`${id}-hue`}
          type="range"
          min={0}
          max={360}
          step={1}
          value={round(hsv.h)}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-valuetext={hueText}
          onKeyDown={onHueKey}
          onChange={event => apply({ ...hsv, h: Number(event.target.value) })}
        />
      </label>
    </div>
  )
}
