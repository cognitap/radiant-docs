'use client'

import { useId, useRef, useState } from 'react'
import { Button, Radio, RadioGroup } from '@cognitap/radiant'
import type { ControlExampleProps } from './control-types'
import { useHydrated } from '../profile/useHydrated'
import '@cognitap/radiant/styles.css'
import './control-example.css'

export function RadioGroupExample({
  disabled = false,
  required = true,
  controlSize = 'medium',
  initiallyEmpty = false
}: ControlExampleProps & { initiallyEmpty?: boolean }) {
  const id = useId()
  const name = `${id}-contact`
  const firstRef = useRef<HTMLInputElement>(null)
  const ready = useHydrated()
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('Save to inspect the selected radio value.')

  return (
    <div className="control-example">
      <form
        className="control-form"
        aria-label="Contact preference example"
        noValidate
        onReset={() => {
          setError('')
          setFeedback(initiallyEmpty ? 'Form reset to no selection.' : 'Form reset to email.')
        }}
        onSubmit={event => {
          event.preventDefault()
          const contact = new FormData(event.currentTarget).get(name)
          if (!disabled && required && contact === null) {
            setError('Choose a contact preference.')
            firstRef.current?.focus()
            return
          }
          setError('')
          setFeedback(
            contact === null
              ? 'Submitted locally: contact is absent.'
              : `Submitted locally: contact=${contact}.`
          )
        }}
      >
        <RadioGroup
          name={name}
          label="Contact preference"
          description="Choose one channel. Phone is not available yet."
          error={error}
          required={required}
          disabled={disabled}
          defaultValue={initiallyEmpty ? null : 'email'}
          controlSize={controlSize}
        >
          <Radio
            ref={firstRef}
            value="email"
            label="Email me"
          />
          <Radio
            value="none"
            label="No contact"
          />
          <Radio
            value="phone"
            label="Phone (unavailable)"
            disabled
          />
        </RadioGroup>
        <div className="control-actions">
          <Button
            type="submit"
            disabled={!ready}
          >
            Save preference
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
