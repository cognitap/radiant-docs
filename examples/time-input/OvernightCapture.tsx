'use client'

import { Field, TimeInput } from '@cognitap/radiant'
import { useState } from 'react'

export function OvernightCapture() {
  const [start, setStart] = useState<string | null>('23:59:45')

  return (
    <div className="grid justify-items-start gap-3">
      <Field
        label="Recording start"
        description="Schedule the recording between 23:45 and 00:30."
      >
        <TimeInput
          hourCycle="h23"
          showSeconds
          min="23:45"
          max="00:30"
          step={15}
          value={start}
          onValueChange={setStart}
        />
      </Field>
      <output aria-live="polite">{start ? `Scheduled for ${start}` : 'No start time'}</output>
    </div>
  )
}
