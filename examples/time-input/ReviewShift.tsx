'use client'

import { Button, Checkbox, Field, TimeInput } from '@cognitap/radiant'
import { useId, useState } from 'react'

export function ReviewShift() {
  const formId = useId()
  const [included, setIncluded] = useState(true)
  const [receipt, setReceipt] = useState('')

  return (
    <div className="grid justify-items-start gap-3">
      <Field
        label="Scheduled shift start"
        description="The shift planner sets this time."
      >
        <TimeInput
          form={formId}
          name="start"
          defaultValue="08:00"
          hourCycle="h23"
          readOnly
          disabled={!included}
        />
      </Field>
      <form
        id={formId}
        className="grid justify-items-start gap-3"
        onSubmit={event => {
          event.preventDefault()
          const start = new FormData(event.currentTarget).get('start')
          setReceipt(
            start ? `Recorded shift start at ${start}.` : 'Recorded without a shift start.'
          )
        }}
      >
        <Checkbox
          label="Include scheduled start"
          checked={included}
          onChange={event => setIncluded(event.currentTarget.checked)}
        />
        <Button type="submit">Record shift</Button>
      </form>
      <output aria-live="polite">{receipt}</output>
    </div>
  )
}
