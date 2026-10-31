'use client'

import { useId, type KeyboardEvent } from 'react'
import { Button, Field, Slider, ToggleGroup, ToggleGroupItem } from '@cognitap/radiant'
import {
  bandBackground,
  clampTo,
  stripWords,
  swatchRow,
  type Band,
  type ChoiceGroup,
  type Strip
} from './workshop-color-view'
import type { WallView } from './workshop-color'

/** A range input over a track painted with the shades each position would produce. */
export function ColorStrip({
  strip,
  value,
  automatic,
  walls,
  disabled,
  describedBy,
  onChange,
  onAutomatic
}: {
  strip: Strip
  value: number
  /** True while the generator chooses this value; dragging takes it over. */
  automatic: boolean
  walls: readonly (WallView | undefined)[]
  disabled?: boolean
  describedBy?: string
  onChange: (value: number) => void
  onAutomatic?: (automatic: boolean) => void
}) {
  const id = useId()
  const words = stripWords(strip, value, automatic)
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!event.shiftKey) return
    const direction = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[event.key]
    if (!direction) return
    event.preventDefault()
    onChange(clampTo(value + direction * strip.bigStep, strip.min, strip.max))
  }
  return (
    <div
      className="color-strip"
      data-automatic={automatic || undefined}
    >
      <Field
        className="color-strip-field"
        label={strip.label}
        controlId={id}
        disabled={disabled}
      >
        <output
          htmlFor={id}
          aria-hidden="true"
        >
          {disabled ? 'only for grey brands' : strip.words(value)}
        </output>
        {onAutomatic && (
          <Button
            className="color-strip-auto"
            variant="outline"
            controlSize="small"
            pressed={automatic}
            onPressedChange={onAutomatic}
            aria-label={`Automatic ${strip.label.toLowerCase()}`}
            disabled={disabled}
          >
            Auto
          </Button>
        )}
        <div
          className="color-strip-track"
          style={bandBackground(walls, strip.bands)}
        >
          <Slider
            min={strip.min}
            max={strip.max}
            step={strip.step}
            value={value}
            aria-describedby={describedBy}
            aria-valuetext={words}
            onKeyDown={onKeyDown}
            onChange={event => onChange(Number(event.target.value))}
          />
        </div>
        <div
          className="color-strip-ends"
          aria-hidden="true"
        >
          <span>{strip.ends[0]}</span>
          <span>{strip.ends[1]}</span>
        </div>
      </Field>
    </div>
  )
}

/** One choice per card, each card painted with the shades that option produces. */
export function ChoiceCards({
  group,
  value,
  wallFor,
  describedBy,
  onChange
}: {
  group: ChoiceGroup
  value: string
  wallFor: (choice: string) => WallView | undefined
  describedBy?: string
  onChange: (value: string) => void
}) {
  const id = useId()
  return (
    <div className="color-choice-group">
      <span
        id={`${id}-label`}
        className="color-choice-label"
      >
        {group.label}
      </span>
      <ToggleGroup
        className="color-choices"
        aria-labelledby={`${id}-label`}
        aria-describedby={describedBy}
        controlSize="small"
        value={value}
        onValueChange={next => {
          if (next !== null) onChange(next)
        }}
      >
        {group.choices.map(choice => (
          <ToggleGroupItem
            key={choice.value}
            value={choice.value}
            className="color-choice"
          >
            <span
              className="color-choice-ramp"
              aria-hidden="true"
              style={swatchRow(wallFor(choice.value), group.bands as readonly Band[])}
            />
            {choice.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
