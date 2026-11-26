'use client'

import { useRef, useState } from 'react'
import { Field, Input, type ControlSize } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'

function emailError(input: HTMLInputElement) {
  if (input.validity.valueMissing) return 'Enter your email address.'
  if (input.validity.typeMismatch) return 'Enter a valid email address.'
  return undefined
}

export function InputExample({ controlSize }: { controlSize?: ControlSize }) {
  const checked = useRef(false)
  const [error, setError] = useState<string>()

  return (
    <Field
      label="Email"
      required
      error={error}
      style={{ width: '100%', maxWidth: '26rem' }}
    >
      <Input
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        controlSize={controlSize}
        onBlur={event => {
          checked.current = true
          setError(emailError(event.currentTarget))
        }}
        onChange={event => {
          if (checked.current) setError(emailError(event.currentTarget))
        }}
      />
    </Field>
  )
}
