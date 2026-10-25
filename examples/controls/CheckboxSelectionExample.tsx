'use client'

import { useState } from 'react'
import { Button, Checkbox, Field, ThemeScope, radiant } from '@cognitap/radiant'
import type { ControlExampleProps } from './control-types'
import { useHydrated } from '../profile/useHydrated'
import '@cognitap/radiant/styles.css'
import './control-example.css'

export function CheckboxSelectionExample({
  disabled = false,
  controlSize = 'medium',
  theme = radiant,
  mode = 'light'
}: ControlExampleProps) {
  const [email, setEmail] = useState(true)
  const [inApp, setInApp] = useState(false)
  const [feedback, setFeedback] = useState(
    'One channel is selected. The parent shows a mixed state.'
  )
  const ready = useHydrated()
  return (
    <ThemeScope
      theme={theme}
      mode={mode}
      className="control-example"
    >
      <form
        className="control-form"
        aria-label="Channel selection example"
        onReset={event => {
          event.preventDefault()
          setEmail(true)
          setInApp(false)
          setFeedback('Form reset to email only.')
        }}
        onSubmit={event => {
          event.preventDefault()
          const channels = new FormData(event.currentTarget).getAll('channels')
          setFeedback(`Submitted locally: ${channels.join(', ') || '(no channels)'}.`)
        }}
      >
        <Field
          layout="group"
          label="Notification channels"
          description="Select all changes both channels. Each channel has its own value."
          disabled={disabled}
        >
          <div className="channel-options">
            <Checkbox
              label="Select all channels"
              checked={email && inApp}
              indeterminate={email !== inApp}
              controlSize={controlSize}
              onChange={event => {
                setEmail(event.target.checked)
                setInApp(event.target.checked)
              }}
            />
            <Checkbox
              label="Email notifications"
              name="channels"
              value="email"
              checked={email}
              onChange={event => setEmail(event.target.checked)}
              controlSize={controlSize}
            />
            <Checkbox
              label="In-app notifications"
              name="channels"
              value="in-app"
              checked={inApp}
              onChange={event => setInApp(event.target.checked)}
              controlSize={controlSize}
            />
          </div>
        </Field>
        <div className="control-actions">
          <Button
            type="submit"
            disabled={!ready}
          >
            Inspect channels
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
