'use client'

import { Button, Field, TimeInput } from '@cognitap/radiant'
import { useState } from 'react'

export function AppointmentTime() {
  const [submitted, setSubmitted] = useState('')

  return (
    <form
      className="grid justify-items-start gap-3"
      onSubmit={event => {
        event.preventDefault()
        setSubmitted(String(new FormData(event.currentTarget).get('start')))
      }}
      onReset={() => setSubmitted('')}
    >
      <Field
        label="Appointment time"
        description="Choose a start between 9 AM and 10 PM in 15-minute intervals."
        required
      >
        <TimeInput
          name="start"
          defaultValue="09:30"
          hourCycle="h12"
          min="09:00"
          max="22:00"
          step={900}
          style={{ '--rad-time-input-period-indicator-color': 'var(--rad-color-accent)' }}
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button type="submit">Confirm appointment</Button>
        <Button
          type="reset"
          variant="outline"
        >
          Reset time
        </Button>
      </div>
      <output aria-live="polite">{submitted && `Submitted ${submitted}`}</output>
    </form>
  )
}
