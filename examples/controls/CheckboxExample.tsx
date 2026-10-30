'use client'

import { useRef, useState } from 'react'
import { Button, Checkbox, Field } from '@cognitap/radiant'
import type { ControlExampleProps } from './control-types'
import { useHydrated } from '../profile/useHydrated'
import '@cognitap/radiant/styles.css'
import './control-example.css'

export function CheckboxExample({
  disabled = false,
  required = false,
  controlSize = 'medium'
}: ControlExampleProps) {
  const checkboxRef = useRef<HTMLInputElement>(null)
  const ready = useHydrated()
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('Save to inspect the submitted value.')

  return (
    <div className="control-example">
      <form
        className="control-form"
        aria-label="Checkbox value example"
        noValidate
        onReset={() => {
          setError('')
          setFeedback('Form reset. Release notes are unchecked.')
        }}
        onSubmit={event => {
          event.preventDefault()
          if (!disabled && required && !checkboxRef.current?.checked) {
            setError('Choose release notes to continue.')
            checkboxRef.current?.focus()
            return
          }
          setError('')
          const value = new FormData(event.currentTarget).get('updates')
          setFeedback(
            value === null
              ? 'Submitted locally: updates is absent.'
              : `Submitted locally: updates=${value}.`
          )
        }}
      >
        <Field
          label="Release notes"
          description="Occasional updates. Uncheck to opt out."
          error={error}
          required={required}
          disabled={disabled}
        >
          <Checkbox
            ref={checkboxRef}
            name="updates"
            value="release-notes"
            defaultChecked={false}
            controlSize={controlSize}
          />
        </Field>
        <div className="control-actions">
          <Button
            type="submit"
            disabled={!ready}
          >
            Inspect value
          </Button>
          <Button
            type="reset"
            variant="outline"
          >
            Reset form
          </Button>
        </div>
        <output className="control-result">{feedback}</output>
      </form>
    </div>
  )
}
