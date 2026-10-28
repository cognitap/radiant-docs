'use client'

import { useId, useRef, useState } from 'react'
import { Button, Field, Input, ThemeScope } from '@cognitap/radiant'
import { radiant } from '@cognitap/radiant/examples'
import type { ControlExampleProps } from './control-types'
import { useHydrated } from '../profile/useHydrated'
import '@cognitap/radiant/styles.css'
import './control-example.css'

export function FieldExample({
  disabled = false,
  required = true,
  controlSize = 'medium',
  theme = radiant,
  mode = 'light',
  native = false
}: ControlExampleProps & { native?: boolean }) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const ready = useHydrated()
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('Nothing has been saved.')

  return (
    <ThemeScope
      theme={theme}
      mode={mode}
      className="control-example"
    >
      <form
        className="control-form"
        aria-label="Project name example"
        noValidate
        onReset={() => {
          setError('')
          setFeedback('Form reset. Nothing has been saved.')
        }}
        onSubmit={event => {
          event.preventDefault()
          const value = new FormData(event.currentTarget).get('project')
          if (!disabled && required && String(value ?? '').trim().length < 2) {
            setError('Enter a project name with at least two characters.')
            inputRef.current?.focus()
            return
          }
          setError('')
          setFeedback(
            value === null
              ? 'Project name omitted (disabled).'
              : `Saved locally: ${String(value).trim() || '(empty)'}.`
          )
        }}
      >
        <Field
          label="Project name"
          controlId={`${id}-project`}
          description="Use a name teammates will recognize."
          error={error}
          required={required}
          disabled={disabled}
          parts={{ description: { style: { maxWidth: '36ch' } } }}
        >
          {native ? (
            control => (
              <input
                {...control}
                ref={inputRef}
                name="project"
                defaultValue=""
                className="native-field-input"
              />
            )
          ) : (
            <Input
              ref={inputRef}
              name="project"
              defaultValue=""
              controlSize={controlSize}
            />
          )}
        </Field>
        <div className="control-actions">
          <Button
            type="submit"
            disabled={!ready}
          >
            Save project
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
    </ThemeScope>
  )
}
