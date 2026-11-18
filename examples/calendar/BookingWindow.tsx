'use client'

import { useState } from 'react'
import { Calendar } from '@cognitap/radiant'

export function BookingWindow() {
  const [date, setDate] = useState<string | null>(null)
  return (
    <div className="grid gap-2">
      <Calendar
        aria-label="Session date"
        today="2028-03-06"
        defaultFocusedDate="2028-04-03"
        min="2028-03-06"
        max="2028-04-21"
        isDateDisabled={iso => [0, 6].includes(new Date(iso).getUTCDay())}
        value={date}
        onValueChange={setDate}
      />
      <output aria-live="polite">{date ?? 'Choose an available weekday.'}</output>
    </div>
  )
}
