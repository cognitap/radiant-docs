'use client'

import { useRef, useState } from 'react'
import { Button, Field, Input, ThemeScope } from '@cognitap/radiant'
import { radiant } from '@cognitap/radiant/examples'
import type { ControlExampleProps } from './control-types'
import { useHydrated } from '../profile/useHydrated'
import '@cognitap/radiant/styles.css'
import './control-example.css'

export function InputExample({
  disabled = false,
  required = true,
  controlSize = 'medium',
  theme = radiant,
  mode = 'light',
  readOnly = false
}: ControlExampleProps & { readOnly?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const ready = useHydrated()
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('Edit the email, then save it locally.')

  return (
    <ThemeScope
      theme={theme}
      mode={mode}
      className="control-example"
    >
      <form
        className="control-form"
        aria-label="Email input example"
        noValidate
        onReset={() => {
          setError('')
          setFeedback('Form reset to ada@example.com.')
        }}
        onSubmit={event => {
          event.preventDefault()
          const input = inputRef.current
          if (input && !input.validity.valid) {
            setError(
              input.validity.valueMissing
                ? 'Enter your email address.'
                : 'Enter a valid email address.'
            )
            input.focus()
            return
          }
          setError('')
          const email = new FormData(event.currentTarget).get('email')
          setFeedback(
            email === null ? 'Email omitted (disabled).' : `Saved locally: ${email || '(empty)'}.`
          )
        }}
      >
        <Field
          label="Work email"
          description="Used for project notifications."
          error={error}
          required={required}
          disabled={disabled}
        >
          <Input
            ref={inputRef}
            name="email"
            type="email"
            autoComplete="email"
            defaultValue="ada@example.com"
            readOnly={readOnly}
            controlSize={controlSize}
          />
        </Field>
        <div className="control-actions">
          <Button
            type="submit"
            disabled={!ready}
          >
            Save email
          </Button>
          <Button
            type="reset"
            variant="outline"
          >
            Reset form
          </Button>
          <Button
            variant="ghost"
            onClick={() => inputRef.current?.focus()}
          >
            Focus input
          </Button>
        </div>
        <output className="control-result">{feedback}</output>
      </form>
    </ThemeScope>
  )
}
