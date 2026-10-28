'use client'

import { useState } from 'react'
import { Field, Input } from '@cognitap/radiant'
import { hexPattern } from './workshop-color-view'

/** Precise entry beside a visual control: applies on every valid keystroke, keeps the draft otherwise. */
export function HexField({
  label,
  value,
  disabled,
  describedBy,
  onValid
}: {
  label: string
  value: string
  disabled?: boolean
  describedBy?: string
  onValid: (value: string) => void
}) {
  const [draft, setDraft] = useState(value)
  const [previousValue, setPreviousValue] = useState(value)
  if (previousValue !== value) {
    setPreviousValue(value)
    setDraft(value)
  }
  const valid = hexPattern.test(draft)
  return (
    <div className="color-hex-field">
      <Field
        label={label}
        error={!valid ? 'Six-digit sRGB hex, such as #7C3AED.' : undefined}
      >
        <Input
          value={draft}
          disabled={disabled}
          aria-describedby={describedBy}
          spellCheck={false}
          maxLength={80}
          onChange={event => {
            setDraft(event.target.value)
            if (hexPattern.test(event.target.value)) onValid(event.target.value)
          }}
        />
      </Field>
    </div>
  )
}
